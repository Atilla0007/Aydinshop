
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import RedirectView

from store import views as store_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path((getattr(settings, "ADMIN_PATH", "admin/") or "admin/").lstrip("/"), admin.site.urls),
    path('', include('core.urls')),
    path('catalog/', include('store.urls')),
    path('shop/invoice/manual/', store_views.manual_invoice, name='manual_invoice_legacy'),
    path('shop/invoice/manual/pdf/', store_views.manual_invoice_pdf, name='manual_invoice_pdf_legacy'),
    path("login/", RedirectView.as_view(url="/contact/", permanent=True)),
    path("signup/", RedirectView.as_view(url="/contact/", permanent=True)),
    path("cart/", RedirectView.as_view(url="/catalog/", permanent=True)),
    path("checkout/", RedirectView.as_view(url="/contact/", permanent=True)),
    re_path(r"^shop/.*", RedirectView.as_view(url="/catalog/", permanent=True)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
