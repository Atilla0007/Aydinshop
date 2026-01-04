from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("services/", views.services, name="services"),
    path("services/kitchen-setup/", views.kitchen_setup, name="kitchen_setup"),
    path(
        "services/kitchen-setup/<slug:package_slug>/",
        views.package_detail,
        name="package_detail",
    ),
    path("projects/", views.projects_list, name="projects_list"),
    path("projects/<str:slug>/", views.project_detail, name="project_detail"),
    path("downloads/", views.downloads, name="downloads"),
    path("contact/", views.contact, name="contact"),
    path("faq/", views.faq, name="faq"),
    path("privacy/", views.privacy, name="privacy"),
    path("terms/", views.terms, name="terms"),
    path("sitemap.xml", views.sitemap_xml, name="sitemap_xml"),
    path("robots.txt", views.robots_txt, name="robots_txt"),
    path("health/", views.health_check, name="health_check"),
]
