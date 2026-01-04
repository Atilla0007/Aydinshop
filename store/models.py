from pathlib import Path

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify

from .validators import product_image_validators


def product_image_upload_to(instance, filename: str) -> str:
    """Store product images under media/products/<product_id>/."""
    base_name = Path(filename).name
    product_id = instance.product_id or "unassigned"
    return f"products/{product_id}/{base_name}"


def order_receipt_upload_to(instance, filename: str) -> str:
    """Legacy upload path kept to satisfy historical migrations."""
    base_name = Path(filename).name
    return f"payments/receipts/{base_name}"


class Category(models.Model):
    name = models.CharField("نام دسته", max_length=100)
    slug = models.SlugField("اسلاگ", max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name, allow_unicode=True) or "category"
            candidate = base
            suffix = 1
            while Category.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)


class Product(models.Model):
    name = models.CharField("نام محصول", max_length=200)
    slug = models.SlugField("اسلاگ", max_length=220, blank=True)
    summary = models.CharField("خلاصه", max_length=300, blank=True)
    description = models.TextField("توضیحات")
    price = models.IntegerField("قیمت", default=0)
    is_available = models.BooleanField("موجود", default=True, db_index=True)
    domain = models.CharField("دامنه کاربرد", max_length=100)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
        verbose_name="دسته‌بندی",
    )
    view_count = models.PositiveIntegerField("تعداد بازدید", default=0)

    brand = models.CharField("برند", max_length=100, blank=True)
    sku = models.CharField("کد SKU", max_length=50, blank=True)
    tags = models.CharField(
        "برچسب‌ها",
        max_length=250,
        blank=True,
        help_text="برچسب‌ها را با فاصله یا ویرگول جدا کنید.",
    )
    datasheet = models.FileField("کاتالوگ/دیتاشیت", upload_to="products/datasheets/", blank=True)
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("آخرین بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name, allow_unicode=True) or "product"
            candidate = base
            suffix = 1
            while Product.objects.filter(slug=candidate, category=self.category).exclude(pk=self.pk).exists():
                candidate = f"{base}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        images = list(self.images.all())
        if not images:
            return None
        for img in images:
            if img.is_primary:
                return img
        return images[0]


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images", verbose_name="محصول")
    image = models.FileField("تصویر", upload_to=product_image_upload_to, validators=product_image_validators)
    alt_text = models.CharField("متن جایگزین", max_length=200, blank=True)
    is_primary = models.BooleanField("تصویر اصلی", default=False)
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)

    class Meta:
        ordering = ["-is_primary", "sort_order", "id"]
        verbose_name = "تصویر محصول"
        verbose_name_plural = "تصاویر محصول"

    def __str__(self):
        return f"{self.product.name} - {Path(self.image.name).name}"


class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="features", verbose_name="محصول")
    name = models.CharField("عنوان ویژگی", max_length=100)
    value = models.CharField("مقدار", max_length=200)

    class Meta:
        verbose_name = "مشخصه محصول"
        verbose_name_plural = "مشخصات محصول"

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews", verbose_name="محصول")
    name = models.CharField("نام", max_length=120)
    role = models.CharField("سمت / مجموعه", max_length=120, blank=True)
    rating = models.PositiveSmallIntegerField(
        "امتیاز",
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment = models.TextField("نظر")
    is_approved = models.BooleanField("تایید شده", default=False)
    created_at = models.DateTimeField("تاریخ ثبت", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "نظر مشتری"
        verbose_name_plural = "نظرات مشتریان"

    def __str__(self):
        return f"{self.product.name} - {self.rating}"


class ManualInvoiceSequence(models.Model):
    last_number = models.PositiveIntegerField("آخرین شماره", default=0)
    updated_at = models.DateTimeField("آخرین بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "سریال فاکتور دستی"
        verbose_name_plural = "سریال فاکتور دستی"

    def __str__(self):
        return str(self.last_number)
