from django.urls import include, path, re_path

from . import views

urlpatterns = [
    path("", views.react_app, name="home"),
    path("sitemap.xml", views.sitemap_xml, name="sitemap_xml"),
    path("robots.txt", views.robots_txt, name="robots_txt"),
    path("health/", views.health_check, name="health_check"),
    path("api/", include("core.api_urls")),
    path("about/", views.react_app, name="about"),
    path("contact/", views.react_app, name="contact"),
    path("services/", views.react_app, name="services"),
    path("catalog/", views.react_app, name="catalog"),
    path("consultation/", views.react_app, name="consultation"),
    path("store-old/", include("store.urls")),
    re_path(r"^(?P<path>.*)$", views.react_app, name="react_app"),
]
