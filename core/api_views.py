from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.db.models import Q, Avg
from .forms import ContactForm
from .views import PACKAGE_DATA
from store.models import Product, Category
from store.utils import get_primary_image_url, build_gallery_images
import json

def get_packages(request):
    return JsonResponse(PACKAGE_DATA)

@csrf_exempt
@require_POST
def contact_api(request):
    try:
        data = json.loads(request.body)
        form = ContactForm(data)
        if form.is_valid():
            form.save()
            return JsonResponse({"status": "success", "message": "Message sent successfully"})
        else:
            return JsonResponse({"status": "error", "errors": form.errors}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

@require_GET
def get_categories(request):
    """Get all categories with product counts"""
    categories = Category.objects.all()
    categories_data = []
    for cat in categories:
        categories_data.append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "product_count": cat.products.filter(is_available=True).count()
        })
    return JsonResponse({"categories": categories_data})

@require_GET
def get_products(request):
    """Get products list with optional filtering"""
    category_slug = request.GET.get("category")
    search = request.GET.get("search", "").strip()
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 20))
    
    products = Product.objects.filter(is_available=True).prefetch_related("images", "category")
    
    if category_slug:
        products = products.filter(category__slug=category_slug)
    
    if search:
        products = products.filter(
            Q(name__icontains=search)
            | Q(summary__icontains=search)
            | Q(description__icontains=search)
            | Q(brand__icontains=search)
            | Q(tags__icontains=search)
        )
    
    total = products.count()
    start = (page - 1) * page_size
    end = start + page_size
    products = products.order_by("-created_at")[start:end]
    
    products_data = []
    for product in products:
        image_url = get_primary_image_url(product) or ""
        products_data.append({
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "summary": product.summary,
            "category": {
                "id": product.category.id,
                "name": product.category.name,
                "slug": product.category.slug
            },
            "image": image_url,
            "brand": product.brand,
            "domain": product.domain,
            "price": product.price,
            "view_count": product.view_count,
        })
    
    return JsonResponse({
        "products": products_data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    })

@require_GET
def get_product_detail(request, category_slug, product_slug):
    """Get detailed product information"""
    try:
        product = Product.objects.prefetch_related("images", "features", "reviews", "category").get(
            slug=product_slug,
            category__slug=category_slug,
            is_available=True
        )
        
        # Increment view count
        Product.objects.filter(pk=product.pk).update(view_count=product.view_count + 1)
        
        gallery_images = build_gallery_images(product)
        features = [{"name": f.name, "value": f.value} for f in product.features.all()]
        
        approved_reviews = product.reviews.filter(is_approved=True)
        avg_rating = approved_reviews.aggregate(avg=Avg("rating"))["avg"] or 0
        
        product_data = {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "summary": product.summary,
            "description": product.description,
            "category": {
                "id": product.category.id,
                "name": product.category.name,
                "slug": product.category.slug
            },
            "images": gallery_images,
            "features": features,
            "brand": product.brand,
            "sku": product.sku,
            "domain": product.domain,
            "tags": [tag.strip() for tag in (product.tags or "").split(",") if tag.strip()],
            "price": product.price,
            "view_count": product.view_count + 1,
            "datasheet": product.datasheet.url if product.datasheet else None,
            "created_at": product.created_at.isoformat(),
            "reviews": {
                "count": approved_reviews.count(),
                "average_rating": round(avg_rating, 1) if avg_rating else 0
            }
        }
        
        return JsonResponse(product_data)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
