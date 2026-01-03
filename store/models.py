from pathlib import Path
import uuid

from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils.text import slugify

from .validators import product_image_validators, receipt_file_validators


def order_receipt_upload_to(instance, filename: str) -> str:
    """Store payment receipt files using the order number as the filename.

    Example: payments/receipts/000014.png
    """
    ext = (Path(filename).suffix or "").lower()
    if not ext:
        ext = ".bin"
    if len(ext) > 10 or any(ch for ch in ext[1:] if not ch.isalnum()):
        ext = ".bin"

    if getattr(instance, "pk", None):
        order_number = str(instance.pk).zfill(6)
    else:
        order_number = uuid.uuid4().hex[:12]

    return f"payments/receipts/{order_number}{ext}"


def product_image_upload_to(instance, filename: str) -> str:
    """Store product images under media/products/<product_id>/."""
    base_name = Path(filename).name
    product_id = instance.product_id or "unassigned"
    return f"products/{product_id}/{base_name}"


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

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
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, blank=True)
    summary = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    price = models.IntegerField()
    is_available = models.BooleanField(default=True, db_index=True)
    domain = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    view_count = models.PositiveIntegerField(default=0)
    sales_count = models.PositiveIntegerField(default=0)

    brand = models.CharField("Brand", max_length=100, blank=True)
    sku = models.CharField("SKU", max_length=50, blank=True)
    tags = models.CharField(
        "Tags",
        max_length=250,
        blank=True,
        help_text="Comma-separated values",
    )
    datasheet = models.FileField(upload_to="products/datasheets/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"

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
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.FileField(upload_to=product_image_upload_to, validators=product_image_validators)
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-is_primary", "sort_order", "id"]
        verbose_name = "Product image"
        verbose_name_plural = "Product images"

    def __str__(self):
        return f"{self.product.name} - {Path(self.image.name).name}"


class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="features")
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=200)

    class Meta:
        verbose_name = "Product feature"
        verbose_name_plural = "Product features"

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    rating = models.PositiveSmallIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Product review"
        verbose_name_plural = "Product reviews"

    def __str__(self):
        return f"{self.product.name} - {self.rating}"


class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "Cart item"
        verbose_name_plural = "Cart items"

    def total_price(self):
        return self.quantity * self.product.price

    def __str__(self):
        return f"{self.user} - {self.product} ({self.quantity})"


class Order(models.Model):
    STATUS_CHOICES = (
        ("new", "New"),
        ("unpaid", "Unpaid"),
        ("paid", "Paid"),
        ("sent", "Sent"),
        ("done", "Done"),
        ("canceled", "Canceled"),
    )
    PAYMENT_METHOD_CHOICES = (
        ("card_to_card", "Card to card"),
        ("contact_admin", "Contact admin"),
    )
    PAYMENT_STATUS_CHOICES = (
        ("unpaid", "Unpaid"),
        ("submitted", "Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    shipping_address = models.ForeignKey(
        "ShippingAddress",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")

    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    province = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    note = models.TextField(blank=True)
    recipient_is_other = models.BooleanField(default=False)

    items_subtotal = models.PositiveIntegerField(default=0)
    discount_code = models.CharField(max_length=50, blank=True)
    discount_percent = models.PositiveSmallIntegerField(default=0)
    discount_amount = models.PositiveIntegerField(default=0)

    shipping_fee_per_item = models.PositiveIntegerField(default=0)
    shipping_item_count = models.PositiveIntegerField(default=0)
    shipping_total_full = models.PositiveIntegerField(default=0)
    shipping_total = models.PositiveIntegerField(default=0)
    shipping_is_free = models.BooleanField(default=False)
    free_shipping_min_total = models.PositiveIntegerField(default=0)

    payment_method = models.CharField(max_length=32, choices=PAYMENT_METHOD_CHOICES, blank=True)
    payment_status = models.CharField(max_length=32, choices=PAYMENT_STATUS_CHOICES, default="unpaid")
    receipt_file = models.FileField(
        upload_to=order_receipt_upload_to,
        null=True,
        blank=True,
        validators=receipt_file_validators,
    )
    payment_submitted_at = models.DateTimeField(null=True, blank=True)
    payment_reviewed_at = models.DateTimeField(null=True, blank=True)
    receipt_digest_sent_at = models.DateTimeField(null=True, blank=True)
    sales_counted = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order #{self.id} - {self.user or 'guest'}"

    def mark_sales_counted(self) -> None:
        if self.sales_counted:
            return
        items = list(self.items.select_related("product"))
        for item in items:
            Product.objects.filter(pk=item.product_id).update(
                sales_count=models.F("sales_count") + item.quantity
            )
        self.sales_counted = True
        self.save(update_fields=["sales_counted"])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.IntegerField()

    class Meta:
        verbose_name = "Order item"
        verbose_name_plural = "Order items"

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class ManualInvoiceSequence(models.Model):
    """A simple counter to generate sequential numbers for manually issued invoices."""

    last_number = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Manual invoice sequence"
        verbose_name_plural = "Manual invoice sequences"

    def __str__(self):
        return f"Manual invoice sequence ({self.last_number})"

    @classmethod
    def get_solo(cls) -> "ManualInvoiceSequence":
        obj, _ = cls.objects.get_or_create(pk=1, defaults={"last_number": 0})
        return obj


class ShippingAddress(models.Model):
    """Multiple saved addresses per user with a single default."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shipping_addresses")
    label = models.CharField(max_length=120, blank=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Shipping address"
        verbose_name_plural = "Shipping addresses"
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=Q(is_default=True),
                name="unique_default_address_per_user",
            )
        ]

    def __str__(self) -> str:
        label = self.label or f"{self.city} - {self.province}"
        return f"{label} ({self.user.username})"
