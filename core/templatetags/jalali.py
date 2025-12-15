from __future__ import annotations

from django import template

from core.utils.jalali import format_jalali

register = template.Library()


@register.filter(name="jalali")
def jalali(value, fmt: str = "Y/m/d") -> str:
    return format_jalali(value, fmt)


@register.filter(name="jalali_date")
def jalali_date(value) -> str:
    return format_jalali(value, "Y/m/d")


@register.filter(name="jalali_datetime")
def jalali_datetime(value) -> str:
    return format_jalali(value, "Y/m/d - H:i")

