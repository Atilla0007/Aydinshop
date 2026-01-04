from django import template

from store.models import Category

register = template.Library()


@register.simple_tag
def get_catalog_categories():
    return Category.objects.order_by("name")
