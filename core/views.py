from __future__ import annotations

import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404, render

from store.models import Category, Product

from .forms import ContactForm
from .models import News

logger = logging.getLogger(__name__)


def home(request):
    """Render home page with highlighted products and news."""
    products = Product.objects.all()[:8]
    news = News.objects.all()[:3]
    categories = Category.objects.all()

    context = {
        "products": products,
        "news": news,
        "categories": categories,
    }
    return render(request, "home.html", context)


def contact(request):
    """Handle contact form submission and render the contact page."""

    def _admin_emails():
        return list(
            User.objects.filter(is_superuser=True, email__isnull=False)
            .exclude(email="")
            .values_list("email", flat=True)
        )

    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            message = form.save()

            admin_emails = _admin_emails()
            if admin_emails:
                try:
                    send_mail(
                        subject=f"پیام جدید تماس با ما: {message.name}",
                        message=(
                            f"نام: {message.name}\n"
                            f"ایمیل: {message.email}\n\n"
                            f"متن پیام:\n{message.message}"
                        ),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=admin_emails,
                        fail_silently=True,
                    )
                except Exception:
                    logger.exception("Failed to send contact email to admins")

            return render(
                request,
                "contact.html",
                {
                    "form": ContactForm(),
                    "success": True,
                },
            )
    else:
        form = ContactForm()

    return render(request, "contact.html", {"form": form})


def news_list(request):
    """List news items."""
    news = News.objects.all()
    return render(request, "news_list.html", {"news": news})


def news_detail(request, pk):
    """Show a single news item."""
    item = get_object_or_404(News, pk=pk)
    latest = News.objects.exclude(pk=pk)[:4]
    return render(request, "news_detail.html", {"item": item, "latest": latest})


def faq(request):
    """Render FAQ page."""
    return render(request, "faq.html")


def terms(request):
    """Render Terms & Conditions page."""
    return render(request, "terms.html")

