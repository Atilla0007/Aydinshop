from __future__ import annotations

from django.conf import settings

from core.models import PaymentSettings
from store.models import Category


def site_info(request):
    payment_settings = PaymentSettings.get_solo()
    company_phone = (payment_settings.company_phone or getattr(settings, "COMPANY_PHONE", "") or "").strip()
    company_email = (payment_settings.company_email or getattr(settings, "COMPANY_EMAIL", "") or "").strip()
    if not company_email:
        company_email = (getattr(settings, "DEFAULT_FROM_EMAIL", "") or "").strip()
    company_address = (payment_settings.company_address or getattr(settings, "COMPANY_ADDRESS", "") or "").strip()
    company_website = (payment_settings.company_website or getattr(settings, "COMPANY_WEBSITE", "") or "").strip()
    if not company_website:
        company_website = (getattr(settings, "SITE_BASE_URL", "") or "").strip()
    whatsapp_number = (payment_settings.whatsapp_number or "").strip()
    telegram_username = (payment_settings.telegram_username or "").strip().lstrip("@")
    if not telegram_username:
        telegram_username = (getattr(settings, "COMPANY_TELEGRAM", "") or "").strip().lstrip("@")

    header_categories = Category.objects.order_by("name")

    return {
        "site_name": getattr(settings, "SITE_NAME", "استیرا"),
        "company_phone": company_phone,
        "company_email": company_email,
        "company_address": company_address,
        "company_whatsapp": whatsapp_number,
        "company_telegram": telegram_username,
        "company_website": company_website,
        "header_categories": header_categories,
    }
