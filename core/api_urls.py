from django.urls import path
from . import api_views

urlpatterns = [
    path('packages/', api_views.get_packages, name='api_packages'),
    path('contact/', api_views.contact_api, name='api_contact'),
    path('categories/', api_views.get_categories, name='api_categories'),
    path('products/', api_views.get_products, name='api_products'),
    path('products/<str:category_slug>/<str:product_slug>/', api_views.get_product_detail, name='api_product_detail'),
]
