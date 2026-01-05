from django.urls import path
from . import api_views

urlpatterns = [
    path('packages/', api_views.get_packages, name='api_packages'),
    path('contact/', api_views.contact_api, name='api_contact'),
]
