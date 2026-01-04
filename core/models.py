from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class News(models.Model):
    title = models.CharField("عنوان", max_length=200)
    slug = models.SlugField("اسلاگ", max_length=220, unique=True, blank=True)
    summary = models.CharField("خلاصه", max_length=300, blank=True)
    text = models.TextField("متن")
    cover_image = models.FileField("تصویر شاخص", upload_to="projects/", blank=True)
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "پروژه"
        verbose_name_plural = "پروژه‌ها"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title, allow_unicode=True) or "project"
            candidate = base
            suffix = 1
            while News.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)


class Download(models.Model):
    title = models.CharField("عنوان", max_length=200)
    slug = models.SlugField("اسلاگ", max_length=220, unique=True, blank=True)
    category = models.CharField("دسته‌بندی", max_length=120, blank=True)
    description = models.TextField("توضیحات", blank=True)
    file = models.FileField("فایل", upload_to="downloads/")
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "دانلود"
        verbose_name_plural = "دانلودها"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title, allow_unicode=True) or "download"
            candidate = base
            suffix = 1
            while Download.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)


class ContactMessage(models.Model):
    INQUIRY_TYPE_CHOICES = (
        ("product", "استعلام محصول"),
        ("service", "خدمات و پروژه"),
        ("consultation", "مشاوره"),
        ("other", "سایر"),
    )

    SERVICE_PACKAGE_CHOICES = (
        ("basic", "پکیج Basic"),
        ("vip", "پکیج VIP"),
        ("cip", "پکیج CIP"),
    )

    name = models.CharField("نام و نام خانوادگی", max_length=200)
    email = models.EmailField("ایمیل")
    phone = models.CharField("شماره تماس", max_length=20, blank=True)
    company = models.CharField("نام مجموعه", max_length=200, blank=True)
    city = models.CharField("شهر", max_length=120, blank=True)
    inquiry_type = models.CharField(
        "نوع درخواست", max_length=20, choices=INQUIRY_TYPE_CHOICES, default="consultation"
    )
    service_package = models.CharField(
        "پکیج", max_length=20, choices=SERVICE_PACKAGE_CHOICES, blank=True
    )
    product_interest = models.ForeignKey(
        "store.Product",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="inquiries",
        verbose_name="محصول موردنظر",
    )
    message = models.TextField("پیام")
    STATUS_CHOICES = (
        ("new", "جدید"),
        ("replied", "پاسخ داده شده"),
    )
    status = models.CharField("وضعیت", max_length=20, choices=STATUS_CHOICES, default="new")
    replied_at = models.DateTimeField("زمان پاسخ", null=True, blank=True)
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "پیام تماس"
        verbose_name_plural = "پیام‌های تماس"

    def __str__(self):
        return f"{self.name} - {self.email}"


class SiteVisit(models.Model):
    session_key = models.CharField("شناسه نشست", max_length=40, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="site_visits",
        verbose_name="کاربر",
    )
    visited_on = models.DateField("تاریخ بازدید", default=timezone.localdate, db_index=True)
    first_path = models.CharField("اولین مسیر", max_length=200, blank=True)
    created_at = models.DateTimeField("زمان ثبت", auto_now_add=True)

    class Meta:
        verbose_name = "بازدید"
        verbose_name_plural = "بازدیدها"
        constraints = [
            models.UniqueConstraint(
                fields=["session_key", "visited_on"], name="uniq_site_visit_session_day"
            )
        ]

    def __str__(self):
        return f"{self.session_key} @ {self.visited_on}"


class DailyVisitStat(models.Model):
    date = models.DateField("تاریخ", unique=True, db_index=True)
    total_hits = models.PositiveIntegerField("کل بازدیدها", default=0)
    unique_sessions = models.PositiveIntegerField("نشست‌های یکتا", default=0)

    class Meta:
        verbose_name = "آمار روزانه"
        verbose_name_plural = "آمار روزانه"

    def __str__(self):
        return f"{self.date} - {self.total_hits}"


class PaymentSettings(models.Model):
    telegram_username = models.CharField("شناسه تلگرام", max_length=64, blank=True)
    whatsapp_number = models.CharField("شماره واتساپ", max_length=20, blank=True)
    company_phone = models.CharField("تلفن شرکت", max_length=32, blank=True)
    company_email = models.EmailField("ایمیل شرکت", blank=True)
    company_address = models.TextField("آدرس شرکت", blank=True)
    company_website = models.URLField("وب‌سایت", blank=True)
    updated_at = models.DateTimeField("آخرین بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "تنظیمات اطلاعات تماس"
        verbose_name_plural = "تنظیمات اطلاعات تماس"

    def __str__(self):
        return "تنظیمات اطلاعات تماس"

    @classmethod
    def get_solo(cls) -> "PaymentSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
