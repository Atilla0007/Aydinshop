from __future__ import annotations

import logging
from pathlib import Path

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives, get_connection
from django.db import connections
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.text import slugify

from core.utils.jalali import format_jalali
from store.models import Category, Product, ProductReview
from store.utils import get_primary_image_url

from .forms import ContactForm
from .models import ContactMessage, Download, News

logger = logging.getLogger(__name__)


PACKAGE_DATA = {
    "basic": {
        "title": "پکیج Basic (راه‌اندازی پایه)",
        "subtitle": "مناسب کسب‌وکارهایی که به یک راه‌اندازی استاندارد و قابل اتکا با زمان‌بندی مشخص نیاز دارند.",
        "audience": [
            "رستوران‌ها و کافه‌های نوپا",
            "آشپزخانه‌های صنعتی با بودجه کنترل‌شده",
            "پروژه‌های کوچک تا متوسط با نیازهای مشخص",
        ],
        "includes": {
            "نیازسنجی و پیشنهاد تجهیزات": [
                "بازدید اولیه و جمع‌آوری نیازها",
                "تهیه لیست تجهیزات پیشنهادی بر اساس ظرفیت",
            ],
            "تامین و هماهنگی": [
                "هماهنگی تامین/واردات/تولید تجهیزات",
                "برنامه‌ریزی تحویل و ورود اقلام کلیدی",
            ],
            "نصب و راه‌اندازی": [
                "نظارت بر نصب تجهیزات اصلی",
                "راه‌اندازی اولیه و تحویل نهایی",
            ],
        },
        "deliverables": [
            "لیست تجهیزات نهایی",
            "تحویل تجهیزات و راه‌اندازی اولیه",
            "چک‌لیست تحویل و بهره‌برداری",
        ],
    },
    "vip": {
        "title": "پکیج VIP (راه‌اندازی پیشرفته)",
        "subtitle": "برای پروژه‌هایی که نیازمند طراحی دقیق جریان کار، انتخاب بهینه تجهیزات و مدیریت نزدیک‌تر هستند.",
        "audience": [
            "پروژه‌های میان‌رده با حساسیت عملکردی",
            "برندهایی که به بهره‌وری و چیدمان بهینه اهمیت می‌دهند",
            "کارفرمایانی که مدیریت نزدیک‌تر می‌خواهند",
        ],
        "includes": {
            "برنامه‌ریزی فرآیند و چیدمان": [
                "تحلیل جریان کار آشپزخانه و جانمایی",
                "بهینه‌سازی مسیرهای آماده‌سازی و سرو",
            ],
            "انتخاب و تامین بهینه": [
                "انتخاب تجهیزات متناسب با حجم تولید",
                "هماهنگی تامین‌کنندگان و زمان‌بندی",
            ],
            "آموزش و مستندسازی": [
                "تحویل چک‌لیست‌های بهره‌برداری",
                "آموزش اولیه اپراتورها در زمان تحویل",
            ],
        },
        "deliverables": [
            "نقشه چیدمان و لیست تجهیزات تایید شده",
            "تحویل و راه‌اندازی کامل‌تر با مستندات",
            "گزارش نهایی تحویل پروژه",
        ],
    },
    "cip": {
        "title": "پکیج CIP (تحویل کامل پروژه)",
        "subtitle": "راه‌اندازی کامل از ایده تا افتتاح با تمرکز بر طراحی، اجرا و تحویل آماده بهره‌برداری.",
        "audience": [
            "پروژه‌های بزرگ یا برندهای زنجیره‌ای",
            "کارفرمایانی که تحویل کامل می‌خواهند",
            "پروژه‌هایی با نیاز به هماهنگی چندبخشی",
        ],
        "includes": {
            "طراحی و معماری کامل": [
                "طراحی کامل آشپزخانه و فضاهای پشتیبان",
                "هماهنگی با نیازهای معماری و تاسیساتی",
            ],
            "اجرای یکپارچه پروژه": [
                "مدیریت تامین، نصب و هماهنگی اجرایی",
                "کنترل کیفیت و زمان‌بندی تحویل",
            ],
            "تحویل نهایی و آماده‌سازی": [
                "تحویل نهایی با چک‌لیست‌های اجرایی",
                "آمادگی بهره‌برداری و افتتاح",
            ],
        },
        "deliverables": [
            "تحویل کامل فضای آشپزخانه",
            "مستندات اجرایی و تحویل نهایی",
            "آماده‌سازی برای بهره‌برداری نهایی",
        ],
    },
}


def home(request):
    categories = Category.objects.all()
    products = Product.objects.prefetch_related("images").order_by("-created_at")[:6]
    projects = News.objects.all()[:3]
    latest_reviews = (
        ProductReview.objects.filter(is_approved=True)
        .select_related("product")
        .order_by("-created_at")[:6]
    )

    for product in products:
        product.card_image_url = get_primary_image_url(product)

    return render(
        request,
        "home.html",
        {
            "categories": categories,
            "featured_products": products,
            "projects": projects,
            "packages": PACKAGE_DATA,
            "latest_reviews": latest_reviews,
        },
    )


def about(request):
    return render(request, "about.html")


def services(request):
    return render(request, "services.html", {"packages": PACKAGE_DATA})


def kitchen_setup(request):
    return render(request, "kitchen_setup.html", {"packages": PACKAGE_DATA})


def package_detail(request, package_slug: str):
    package_key = slugify(package_slug, allow_unicode=True)
    if package_key not in PACKAGE_DATA:
        package_key = "basic"
    return render(
        request,
        "package_detail.html",
        {"package": PACKAGE_DATA[package_key], "package_key": package_key},
    )


def projects_list(request):
    projects = News.objects.all()
    return render(request, "projects_list.html", {"projects": projects})


def project_detail(request, slug: str):
    project = get_object_or_404(News, slug=slug)
    latest = News.objects.exclude(pk=project.pk)[:4]
    return render(
        request,
        "project_detail.html",
        {"project": project, "latest": latest},
    )


def downloads(request):
    items = Download.objects.all()
    return render(request, "downloads.html", {"downloads": items})


def contact(request):
    def _admin_emails():
        return list(
            User.objects.filter(is_superuser=True, email__isnull=False)
            .exclude(email="")
            .values_list("email", flat=True)
        )

    def _send_email_message(message: EmailMultiAlternatives) -> None:
        try:
            message.send(fail_silently=False)
            return
        except Exception:
            if not getattr(settings, "DEBUG", False):
                logger.exception("Failed to send contact email")
                return

        try:
            base_dir = Path(getattr(settings, "BASE_DIR", Path.cwd()))
            file_path = base_dir / "tmp" / "emails"
            file_path.mkdir(parents=True, exist_ok=True)
            connection = get_connection(
                "django.core.mail.backends.filebased.EmailBackend",
                fail_silently=True,
                file_path=str(file_path),
            )
            message.connection = connection
            message.send(fail_silently=True)
        except Exception:
            logger.exception("Failed to send contact email (filebased fallback)")

    initial = {}
    product_slug = (request.GET.get("product") or "").strip()
    if product_slug:
        product = Product.objects.filter(slug=product_slug).first()
        if product:
            initial["product_interest"] = product
            initial["inquiry_type"] = "product"

    service_package = (request.GET.get("package") or "").strip().lower()
    if service_package in PACKAGE_DATA:
        initial["service_package"] = service_package
        initial["inquiry_type"] = "service"

    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            message = form.save()

            support_email = (getattr(settings, "COMPANY_EMAIL", "") or "").strip()
            if not support_email:
                support_email = (getattr(settings, "DEFAULT_FROM_EMAIL", "") or "").strip()

            admin_emails = _admin_emails()
            bcc_emails = sorted({email for email in admin_emails if email and email != support_email})

            if support_email:
                created_at = format_jalali(message.created_at, "Y/m/d - H:i")
                base_url = (getattr(settings, "SITE_BASE_URL", "") or "").strip().rstrip("/")
                admin_prefix = getattr(settings, "ADMIN_PATH", "admin/").strip("/")
                admin_root = f"/{admin_prefix}/"
                admin_url = (
                    f"{base_url}{admin_root}core/contactmessage/{message.id}/change/"
                    if base_url
                    else f"{admin_root}core/contactmessage/{message.id}/change/"
                )

                brand = getattr(settings, "SITE_NAME", "استیرا")
                subject = f"پیام جدید فرم تماس | {message.name}"
                text_body = (
                    "پیام جدیدی از فرم تماس دریافت شد.\n\n"
                    f"نام: {message.name}\n"
                    f"ایمیل: {message.email}\n"
                    f"شماره تماس: {message.phone or '-'}\n"
                    f"نام مجموعه: {message.company or '-'}\n"
                    f"شهر: {message.city or '-'}\n"
                    f"نوع درخواست: {message.get_inquiry_type_display()}\n"
                    f"پکیج: {message.get_service_package_display() if message.service_package else '-'}\n"
                    f"محصول موردنظر: {message.product_interest or '-'}\n"
                    f"تاریخ ثبت: {created_at}\n\n"
                    f"پیام:\n{message.message}"
                )
                html_body = render_to_string(
                    "emails/contact_message.html",
                    {
                        "title": "پیام جدید فرم تماس",
                        "preheader": f"پیام جدید از {message.name}",
                        "brand": brand,
                        "subtitle": "این پیام از طریق فرم تماس سایت دریافت شده است.",
                        "name": message.name,
                        "email": message.email,
                        "phone": message.phone,
                        "created_at": created_at,
                        "message_text": message.message,
                        "admin_url": admin_url,
                        "footer": "برای پاسخ‌گویی سریع‌تر، از طریق پنل مدیریت اقدام کنید.",
                    },
                )

                try:
                    email_message = EmailMultiAlternatives(
                        subject=subject,
                        body=text_body,
                        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                        to=[support_email],
                        bcc=bcc_emails,
                        reply_to=[message.email],
                    )
                    email_message.attach_alternative(html_body, "text/html")
                    _send_email_message(email_message)
                except Exception:
                    logger.exception("Failed to build/send contact email")

            return render(
                request,
                "contact.html",
                {
                    "form": ContactForm(),
                    "success": True,
                },
            )
    else:
        form = ContactForm(initial=initial)

    return render(request, "contact.html", {"form": form})


def faq(request):
    return render(request, "faq.html")


def terms(request):
    return render(request, "terms.html")


def privacy(request):
    return render(request, "privacy.html")


def sitemap_xml(request):
    base_url = (getattr(settings, "SITE_BASE_URL", "") or "").strip().rstrip("/")
    urls = [
        "/",
        "/about/",
        "/services/",
        "/services/kitchen-setup/",
        "/services/kitchen-setup/basic/",
        "/services/kitchen-setup/vip/",
        "/services/kitchen-setup/cip/",
        "/projects/",
        "/catalog/",
        "/downloads/",
        "/contact/",
        "/faq/",
        "/privacy/",
        "/terms/",
    ]

    urls += [f"/projects/{item.slug}/" for item in News.objects.all()]
    for category in Category.objects.all():
        urls.append(f"/catalog/{category.slug}/")
        for product in Product.objects.filter(category=category):
            urls.append(f"/catalog/{category.slug}/{product.slug}/")

    content = render_to_string(
        "sitemap.xml",
        {"urls": [f"{base_url}{path}" if base_url else path for path in urls]},
    )
    return HttpResponse(content, content_type="application/xml")


def robots_txt(request):
    base_url = (getattr(settings, "SITE_BASE_URL", "") or "").strip().rstrip("/")
    sitemap_url = f"{base_url}/sitemap.xml" if base_url else "/sitemap.xml"
    content = f"User-agent: *\nAllow: /\nSitemap: {sitemap_url}\n"
    return HttpResponse(content, content_type="text/plain")


def health_check(request):
    db_ok = True
    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        db_ok = False

    payload = {
        "status": "ok" if db_ok else "degraded",
        "database": "ok" if db_ok else "error",
        "time": timezone.now().isoformat(),
    }
    return JsonResponse(payload, status=200 if db_ok else 503)
