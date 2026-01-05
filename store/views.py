from __future__ import annotations

import json
import re
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Avg, F, Q
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify
from django.views.decorators.http import require_GET, require_POST

from auth_security.ratelimit import check_rate_limit

from .forms import ProductReviewForm
from .invoice import render_manual_invoice_pdf
from .models import Category, ManualInvoiceSequence, Product, ProductReview
from .utils import build_gallery_images, get_primary_image_url

def _sanitize_query(value: str, max_length: int = 80) -> str:
    value = (value or "").strip()
    value = re.sub(r"[\x00-\x1f\x7f]", "", value)
    if len(value) > max_length:
        value = value[:max_length]
    return value


def catalog_home(request):
    query = _sanitize_query(request.GET.get("q") or "", max_length=80)
    products = Product.objects.prefetch_related("images", "category").all()
    categories = Category.objects.all()

    if query:
        products = products.filter(
            Q(name__icontains=query)
            | Q(summary__icontains=query)
            | Q(description__icontains=query)
            | Q(domain__icontains=query)
            | Q(brand__icontains=query)
            | Q(tags__icontains=query)
            | Q(sku__icontains=query)
        )

    featured_products = list(products.order_by("-created_at")[:9])
    for product in featured_products:
        product.card_image_url = get_primary_image_url(product)

    return render(
        request,
        "catalog/index.html",
        {
            "categories": categories,
            "featured_products": featured_products,
            "search_term": query,
        },
    )


def category_detail(request, category_slug: str):
    category = get_object_or_404(Category, slug=category_slug)
    query = _sanitize_query(request.GET.get("q") or "", max_length=80)
    products = (
        Product.objects.filter(category=category)
        .prefetch_related("images")
        .order_by("-created_at")
    )
    if query:
        products = products.filter(
            Q(name__icontains=query)
            | Q(summary__icontains=query)
            | Q(description__icontains=query)
            | Q(brand__icontains=query)
            | Q(tags__icontains=query)
            | Q(sku__icontains=query)
        )

    products = list(products)
    for product in products:
        product.card_image_url = get_primary_image_url(product)

    return render(
        request,
        "catalog/category.html",
        {
            "category": category,
            "products": products,
            "search_term": query,
        },
    )


def product_detail(request, category_slug: str, product_slug: str):
    product = get_object_or_404(
        Product.objects.prefetch_related("features", "images", "reviews"),
        slug=product_slug,
        category__slug=category_slug,
    )
    features = product.features.all()
    gallery_images = build_gallery_images(product)
    reviews_qs = product.reviews.filter(is_approved=True)
    avg_rating = reviews_qs.aggregate(avg=Avg("rating"))["avg"] or 0

    review_submitted = False
    if request.method == "POST":
        review_form = ProductReviewForm(request.POST)
        if review_form.is_valid():
            review = review_form.save(commit=False)
            review.product = product
            review.is_approved = False
            review.save()
            review_submitted = True
            review_form = ProductReviewForm()
    else:
        review_form = ProductReviewForm()

    Product.objects.filter(pk=product.pk).update(view_count=F("view_count") + 1)

    return render(
        request,
        "catalog/product_detail.html",
        {
            "product": product,
            "features": features,
            "gallery_images": gallery_images,
            "reviews": reviews_qs,
            "avg_rating": avg_rating,
            "review_count": reviews_qs.count(),
            "review_form": review_form,
            "review_submitted": review_submitted,
        },
    )


@require_GET
def catalog_suggest(request):
    query = _sanitize_query(request.GET.get("q") or "", max_length=64)
    if len(query) < 2:
        return JsonResponse({"suggestions": []})

    rate_decision = check_rate_limit(
        request,
        scope="catalog_suggest",
        limit=30,
        window_seconds=60,
    )
    if not rate_decision.allowed:
        return JsonResponse(
            {
                "detail": "Too many search requests. Please try again later.",
                "retry_after_seconds": rate_decision.retry_after_seconds,
            },
            status=429,
        )

    qs = Product.objects.filter(
        Q(name__icontains=query)
        | Q(brand__icontains=query)
        | Q(tags__icontains=query)
        | Q(domain__icontains=query)
        | Q(sku__icontains=query)
    )
    names = qs.values_list("name", flat=True).distinct().order_by("name")[:8]
    suggestions = list(dict.fromkeys(names))
    return JsonResponse({"suggestions": suggestions})


def legacy_product_redirect(request, pk: int):
    product = get_object_or_404(Product, pk=pk)
    if product.category and not product.category.slug:
        product.category.slug = slugify(product.category.name, allow_unicode=True) or "category"
        product.category.save(update_fields=["slug"])
    if not product.slug:
        base = slugify(product.name, allow_unicode=True) or f"product-{product.pk}"
        candidate = base
        suffix = 1
        while Product.objects.filter(slug=candidate, category=product.category).exclude(pk=product.pk).exists():
            candidate = f"{base}-{suffix}"
            suffix += 1
        product.slug = candidate
        product.save(update_fields=["slug"])
    return redirect(
        reverse(
            "catalog_product",
            kwargs={
                "category_slug": product.category.slug,
                "product_slug": product.slug,
            },
        )
    )


def manual_invoice(request):
    if not request.user.is_staff:
        raise Http404

    company_name = getattr(settings, "SITE_NAME", "استیرا")
    address = (getattr(settings, "COMPANY_ADDRESS", "") or "").strip()
    phone = (getattr(settings, "COMPANY_PHONE", "") or "").strip()
    email = (getattr(settings, "COMPANY_EMAIL", "") or "").strip()
    if not email:
        email = (getattr(settings, "DEFAULT_FROM_EMAIL", "") or "").strip()

    company_address_lines = [ln.strip() for ln in address.splitlines() if ln.strip()]
    company_contact = " | ".join([p for p in [phone, email] if p])

    kind = (request.GET.get("kind") or "proforma").strip().lower()
    include_signatures = kind in {"invoice", "final"}
    invoice_title = "فاکتور" if include_signatures else "پیش‌فاکتور"

    now = timezone.now()
    issue_date = now.strftime("%Y/%m/%d")
    due_date = (now + timedelta(days=1)).strftime("%Y/%m/%d")

    shipping_fee_per_item = 0
    free_shipping_min_total = 0

    products = list(Product.objects.order_by("name").values("id", "name", "price"))

    raw_invoice_number = (request.GET.get("invoice_number") or "").strip()
    invoice_number = "#000000"
    match = re.fullmatch(r"#?(\d{1,12})", raw_invoice_number)
    if match:
        digits = match.group(1).lstrip("0") or "0"
        if digits != "0":
            invoice_number = f"#{int(match.group(1)):06d}"

    if invoice_number == "#000000":
        try:
            with transaction.atomic():
                seq, _created = ManualInvoiceSequence.objects.select_for_update().get_or_create(
                    pk=1,
                    defaults={"last_number": 0},
                )
                seq.last_number = int(seq.last_number or 0) + 1
                seq.save(update_fields=["last_number", "updated_at"])
                invoice_number = f"#{seq.last_number:06d}"
        except Exception:
            invoice_number = "#000000"

    response = render(
        request,
        "store/manual_invoice.html",
        {
            "company_name": company_name,
            "company_address_lines": company_address_lines,
            "company_contact": company_contact,
            "issue_date": issue_date,
            "due_date": due_date,
            "invoice_number": invoice_number,
            "invoice_title": invoice_title,
            "include_signatures": include_signatures,
            "shipping_fee_per_item": shipping_fee_per_item,
            "free_shipping_min_total": free_shipping_min_total,
            "products": products,
        },
    )
    if request.GET.get("download") == "1":
        response["Content-Disposition"] = 'attachment; filename="styra-invoice-template.html"'
    return response


@require_POST
def manual_invoice_pdf(request):
    if not request.user.is_staff:
        raise Http404

    try:
        payload = json.loads((request.body or b"").decode("utf-8"))
    except Exception:
        return JsonResponse({"detail": "invalid payload"}, status=400)

    invoice_number = str(payload.get("invoice_number") or "").strip() or "#000000"
    title = str(payload.get("title") or "").strip() or "پیش‌فاکتور"
    issue_date = str(payload.get("issue_date") or "").strip()
    due_date = str(payload.get("due_date") or "").strip()
    include_signatures = bool(payload.get("include_signatures"))
    buyer_signature = str(payload.get("buyer_signature") or "").strip()
    seller_signature = str(payload.get("seller_signature") or "").strip()
    notes = str(payload.get("notes") or "").strip()

    buyer_lines = payload.get("buyer_lines") or []
    if not isinstance(buyer_lines, list):
        buyer_lines = []
    buyer_lines = [str(x).strip() for x in buyer_lines if str(x).strip()]

    items_in = payload.get("items") or []
    if not isinstance(items_in, list):
        items_in = []
    items: list[dict] = []
    for it in items_in:
        if not isinstance(it, dict):
            continue
        name = str(it.get("name") or "").strip()
        desc = str(it.get("desc") or "").strip()
        try:
            qty = int(it.get("qty") or 0)
        except Exception:
            qty = 0
        try:
            price = int(it.get("price") or 0)
        except Exception:
            price = 0
        if not name and not desc and qty <= 0 and price <= 0:
            continue
        if qty <= 0:
            qty = 1
        if price < 0:
            price = 0
        items.append({"name": name, "desc": desc, "qty": qty, "price": price})

    def _safe_int(value, default=0) -> int:
        try:
            return int(value)
        except Exception:
            return default

    items_subtotal = _safe_int(payload.get("items_subtotal"), 0)
    discount = _safe_int(payload.get("discount"), 0)
    shipping = _safe_int(payload.get("shipping"), 0)
    grand_total = _safe_int(
        payload.get("grand_total"),
        max(0, items_subtotal - max(0, discount)) + max(0, shipping),
    )

    pdf_bytes = render_manual_invoice_pdf(
        invoice_number=invoice_number,
        title=title,
        issue_date=issue_date,
        due_date=due_date,
        buyer_lines=buyer_lines,
        items=items,
        items_subtotal=items_subtotal,
        discount=discount,
        shipping=shipping,
        grand_total=grand_total,
        include_signatures=include_signatures,
        buyer_signature=buyer_signature,
        seller_signature=seller_signature,
        notes=notes,
    )

    safe_filename_digits = re.sub(r"\D", "", invoice_number)
    filename = safe_filename_digits.zfill(6) if safe_filename_digits else "manual-invoice"

    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}.pdf"'
    return response
