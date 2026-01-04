from django.contrib import admin

from .models import Category, Product, ProductFeature, ProductImage, ProductReview


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "is_primary", "sort_order")


class ProductFeatureInline(admin.TabularInline):
    model = ProductFeature
    extra = 1
    fields = ("name", "value")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "brand", "price", "is_available", "created_at")
    list_filter = ("category", "brand", "is_available")
    search_fields = ("name", "summary", "description", "brand", "sku")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline, ProductFeatureInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "name", "rating", "is_approved", "created_at")
    list_filter = ("is_approved", "rating", "created_at")
    search_fields = ("product__name", "name", "comment")
    list_editable = ("is_approved",)
