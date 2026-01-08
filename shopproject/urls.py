
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import RedirectView

from store import views as store_views
from core import views as core_views
from django.conf import settings
from django.conf.urls.static import static

admin_path = (getattr(settings, "ADMIN_PATH", "admin/") or "admin/").strip("/")

urlpatterns = [
    # Admin
    path(f"{admin_path}/", admin.site.urls),
    
    # API endpoints (must come before React app routing)
    path('api/user/status/', core_views.user_status_api, name='user_status_api'),
    path('api/contact/', core_views.contact_api, name='contact_api'),
    path('api/categories/', store_views.api_categories, name='api_categories'),
    path('api/products/', store_views.api_products, name='api_products'),
    path('api/products/<str:category_slug>/<str:product_slug>/', store_views.api_product_detail, name='api_product_detail'),
    
    # Legacy redirects
    path('shop/invoice/manual/', store_views.manual_invoice, name='manual_invoice_legacy'),
    path('shop/invoice/manual/pdf/', store_views.manual_invoice_pdf, name='manual_invoice_pdf_legacy'),
    path("login/", RedirectView.as_view(url="/contact/", permanent=True)),
    path("signup/", RedirectView.as_view(url="/contact/", permanent=True)),
    path("cart/", RedirectView.as_view(url="/catalog/", permanent=True)),
    path("checkout/", RedirectView.as_view(url="/contact/", permanent=True)),
    re_path(r"^shop/.*", RedirectView.as_view(url="/catalog/", permanent=True)),
    
    # Serve React app for all other routes (catch-all)
    re_path(r'^(?!admin|api|catalog/api|shop|login|signup|cart|checkout|static|media).*$', core_views.react_app),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
