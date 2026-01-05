from __future__ import annotations

import logging
import os
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

from auth_security.ratelimit import check_rate_limit

from .forms import ContactForm
from .models import ContactMessage, Download, News

logger = logging.getLogger(__name__)


PACKAGE_DATA = {
    "basic": {
        "type": "Basic",
        "title": "راه‌اندازی استاندارد (Basic)",
        "subtitle": "شروعی مطمئن و اقتصادی برای کسب‌وکارهای نوپا با تمرکز بر استانداردهای ضروری.",
        "description": (
            "این پکیج برای کارآفرینانی طراحی شده که می‌خواهند با بودجه‌ای مدیریت‌شده، "
            "آشپزخانه‌ای استاندارد و قابل اخذ مجوز داشته باشند. تمرکز ما بر انتخاب "
            "تجهیزات اصلی و چیدمان صحیح برای مسیرهای کاری سالم است."
        ),
        "features": [
            "طراحی پلن دوبعدی (2D) چیدمان تجهیزات",
            "مشاوره خرید تجهیزات اصلی و تهیه لیست ضروری",
            "نظارت بر نصب و تاسیسات پایه",
            "آموزش اولیه کار با دستگاه‌ها",
        ],
        "targets": [
            "کافه‌های کوچک و اقتصادی",
            "فست‌فودهای بیرون‌بر",
            "کترینگ‌های خانگی و نوپا",
        ],
        "audience": [
            "کافه‌های کوچک و اقتصادی",
            "فست‌فودهای بیرون‌بر",
            "کترینگ‌های خانگی و نوپا",
        ],
        "estimated_time": "۲۰ تا ۳۰ روز کاری",
        "supervision_level": "نظارت پایه و کنترل استاندارد",
    },
    "vip": {
        "type": "VIP",
        "title": "مهندسی منو و فرآیند (VIP)",
        "subtitle": "بهینه‌سازی دقیق گردش کار برای مجموعه‌هایی که حجم سفارش بالا و حساسیت عملیاتی دارند.",
        "description": (
            "در پکیج VIP فراتر از چیدمان حرکت می‌کنیم. تمرکز بر مهندسی منو و "
            "طراحی فرآیند است تا تجهیزات بر اساس ظرفیت دقیق پخت انتخاب شوند و "
            "پرت انرژی و نیروی انسانی به حداقل برسد."
        ),
        "features": [
            "تمام خدمات پکیج Basic",
            "تحلیل و آنالیز منو و تعیین ظرفیت دقیق پخت",
            "طراحی جریان کاری (Workflow) برای سرعت سرویس‌دهی",
            "انتخاب تجهیزات تخصصی و برندهای میان‌رده با دوام بالا",
            "تست عملکردی منو (Recipe Calibration)",
        ],
        "targets": [
            "رستوران‌های ایرانی و فرنگی متوسط",
            "فودکورت‌ها و آشپزخانه‌های پرتردد",
            "کافه‌رستوران‌های با حجم سفارش بالا",
        ],
        "audience": [
            "رستوران‌های ایرانی و فرنگی متوسط",
            "فودکورت‌ها و آشپزخانه‌های پرتردد",
            "کافه‌رستوران‌های با حجم سفارش بالا",
        ],
        "estimated_time": "۴۵ تا ۶۰ روز کاری",
        "supervision_level": "نظارت پیشرفته و کنترل فرآیند",
    },
    "cip": {
        "type": "CIP",
        "title": "راه‌اندازی جامع و کلید تحویل (CIP)",
        "subtitle": "از ایده تا افتتاحیه؛ مدیریت صفر تا صد پروژه با استانداردهای اجرایی کامل.",
        "description": (
            "این کامل‌ترین سطح خدمات است. ما به‌عنوان بازوی اجرایی شما عمل می‌کنیم؛ "
            "از برندینگ و کانسپت‌سازی تا خرید تجهیزات و آماده‌سازی بهره‌برداری، "
            "همه‌چیز تحت مدیریت یکپارچه انجام می‌شود."
        ),
        "features": [
            "مدیریت پیمان کامل (طراحی، خرید، اجرا)",
            "استخدام و آموزش حرفه‌ای پرسنل آشپزخانه و سالن",
            "هماهنگی با تیم‌های معماری و برندینگ",
            "تامین تجهیزات از برندهای تاپ‌لول جهانی",
            "راه‌اندازی نرم‌افزاری و سیستم‌های کنترل هزینه",
            "پشتیبانی ویژه پس از افتتاح",
        ],
        "targets": [
            "هتل‌ها و مجموعه‌های بزرگ",
            "رستوران‌های زنجیره‌ای",
            "سرمایه‌گذاران بدون تیم اجرایی",
            "پروژه‌های لوکس و برند محور",
        ],
        "audience": [
            "هتل‌ها و مجموعه‌های بزرگ",
            "رستوران‌های زنجیره‌ای",
            "سرمایه‌گذاران بدون تیم اجرایی",
            "پروژه‌های لوکس و برند محور",
        ],
        "estimated_time": "۳ تا ۶ ماه",
        "supervision_level": "مدیریت یکپارچه و نظارت کامل",
    },
}


def react_app(request, path=''):
    return render(request, "index.html")


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
        rate_decision = check_rate_limit(
            request,
            scope="contact",
            limit=5,
            window_seconds=600,
            identifier=request.POST.get("email") or request.POST.get("phone"),
        )
        if not rate_decision.allowed:
            form.add_error(None, "Too many contact requests. Please try again later.")
            return render(
                request,
                "contact.html",
                {"form": form},
                status=429,
            )

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
    token = (os.getenv("HEALTH_CHECK_TOKEN") or "").strip()
    if token:
        provided = (
            request.headers.get("X-Health-Token")
            or request.GET.get("token")
            or ""
        ).strip()
        if provided != token:
            return HttpResponse(status=404)
    elif not request.user.is_staff:
        return HttpResponse(status=404)

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
