from datetime import timedelta
import logging

from django import forms
from django.conf import settings
from django.contrib import admin, messages
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.template.response import TemplateResponse
from django.utils import timezone

from .models import (
    ContactMessage,
    DailyVisitStat,
    Download,
    News,
    PaymentSettings,
    SiteVisit,
)

logger = logging.getLogger(__name__)


@admin.register(News)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "created_at")
    search_fields = ("title", "summary", "text")


@admin.register(Download)
class DownloadAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "created_at")
    search_fields = ("title", "category", "description")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "email",
        "phone",
        "company",
        "city",
        "inquiry_type",
        "service_package",
        "product_interest",
        "status",
        "created_at",
        "replied_at",
    )
    list_filter = ("status", "inquiry_type", "service_package", "created_at")
    search_fields = ("name", "email", "phone", "company", "city")
    actions = ["send_reply"]

    class ReplyForm(forms.Form):
        subject = forms.CharField(required=False, label="موضوع پاسخ")
        message = forms.CharField(
            required=False,
            widget=forms.Textarea(attrs={"rows": 6}),
            label="متن پیام",
        )
        send_email = forms.BooleanField(required=False, initial=True, label="ارسال ایمیل")

    def _default_reply_message(self) -> str:
        return (
            "پیام شما دریافت شد و در حال بررسی است. "
            "کارشناسان استیرا به‌زودی برای هماهنگی و ارائه مشاوره با شما تماس خواهند گرفت. "
            "اگر توضیح تکمیلی دارید، همین ایمیل را پاسخ دهید."
        )

    def send_reply(self, request, queryset):
        form = None
        if "apply" in request.POST:
            form = self.ReplyForm(request.POST)
            if form.is_valid():
                subject = (form.cleaned_data.get("subject") or "").strip()
                if not subject:
                    subject = "پاسخ استیرا به پیام شما"
                message_text = (form.cleaned_data.get("message") or "").strip()
                if not message_text:
                    message_text = self._default_reply_message()

                send_email_flag = bool(form.cleaned_data.get("send_email"))
                email_sent = 0
                email_failed = 0
                skipped_email = 0

                brand = getattr(settings, "SITE_NAME", "Styra")
                now = timezone.now()

                for msg in queryset:
                    if send_email_flag:
                        if msg.email:
                            html_body = render_to_string(
                                "emails/contact_reply.html",
                                {
                                    "title": subject,
                                    "preheader": message_text,
                                    "brand": brand,
                                    "message_text": message_text,
                                    "recipient": msg.name,
                                },
                            )
                            try:
                                email_message = EmailMultiAlternatives(
                                    subject=subject,
                                    body=message_text,
                                    from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                                    to=[msg.email],
                                )
                                email_message.attach_alternative(html_body, "text/html")
                                email_message.send(fail_silently=False)
                                email_sent += 1
                            except Exception:
                                email_failed += 1
                                logger.exception("Failed to send contact reply email to %s", msg.email)
                        else:
                            skipped_email += 1

                queryset.update(status="replied", replied_at=now)
                self.message_user(
                    request,
                    (
                        "پاسخ‌ها ارسال شد. "
                        f"ارسال موفق: {email_sent}، ناموفق: {email_failed}، بدون ایمیل: {skipped_email}."
                    ),
                    level=messages.SUCCESS,
                )
                return

        if form is None:
            form = self.ReplyForm(
                initial={
                    "subject": "پاسخ استیرا به پیام شما",
                    "message": self._default_reply_message(),
                    "send_email": True,
                }
            )

        return TemplateResponse(
            request,
            "admin/contactmessage_reply.html",
            {
                "form": form,
                "title": "ارسال پاسخ به پیام‌های تماس",
                "action_name": "send_reply",
                "queryset": queryset,
            },
        )

    send_reply.short_description = "ارسال پاسخ ایمیلی به پیام‌های انتخاب‌شده"


@admin.register(DailyVisitStat)
class DailyVisitStatAdmin(admin.ModelAdmin):
    list_display = ("date", "total_hits", "unique_sessions")
    list_filter = ("date",)


@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ("session_key", "user", "visited_on", "created_at")
    list_filter = ("visited_on",)
    search_fields = ("session_key", "user__username", "user__email")


@admin.register(PaymentSettings)
class PaymentSettingsAdmin(admin.ModelAdmin):
    list_display = ("company_phone", "company_email", "company_website", "updated_at")

    def has_add_permission(self, request):
        return not PaymentSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
