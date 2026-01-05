from django.urls import include, path, re_path

from . import views

urlpatterns = [
    path("sitemap.xml", views.sitemap_xml, name="sitemap_xml"),
    path("robots.txt", views.robots_txt, name="robots_txt"),
    path("health/", views.health_check, name="health_check"),
    path("api/", include("core.api_urls")),
    re_path(r"^(?P<path>.*)$", views.react_app, name="react_app"),
]
