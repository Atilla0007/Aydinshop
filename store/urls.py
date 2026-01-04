
from django.urls import path

from . import views

urlpatterns = [
    path("", views.catalog_home, name="catalog"),
    path("suggest/", views.catalog_suggest, name="catalog_suggest"),
    path("product/<int:pk>/", views.legacy_product_redirect, name="legacy_product_redirect"),
    path("invoice/manual/", views.manual_invoice, name="manual_invoice"),
    path("invoice/manual/pdf/", views.manual_invoice_pdf, name="manual_invoice_pdf"),
    path("<slug:category_slug>/", views.category_detail, name="catalog_category"),
    path(
        "<slug:category_slug>/<slug:product_slug>/",
        views.product_detail,
        name="catalog_product",
    ),
]
