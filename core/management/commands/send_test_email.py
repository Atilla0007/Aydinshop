from __future__ import annotations

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "ارسال ایمیل تست با تنظیمات فعلی پروژه (SMTP یا filebased)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--to",
            required=True,
            help="ایمیل گیرنده (برای چند گیرنده با , جدا کنید).",
        )
        parser.add_argument(
            "--subject",
            default="تست ارسال ایمیل",
            help="عنوان ایمیل.",
        )
        parser.add_argument(
            "--message",
            default="این یک ایمیل تست از پروژه استیرا است.",
            help="متن ایمیل.",
        )

    def handle(self, *args, **options):
        raw_to = (options.get("to") or "").strip()
        recipients = [x.strip() for x in raw_to.split(",") if x.strip()]
        if not recipients:
            self.stderr.write(self.style.ERROR("گیرنده معتبر نیست."))
            return

        subject = (options.get("subject") or "").strip() or "تست ارسال ایمیل"
        message = (options.get("message") or "").strip() or "ایمیل تست"

        self.stdout.write(f"EMAIL_BACKEND: {getattr(settings, 'EMAIL_BACKEND', '')}")
        self.stdout.write(f"DEFAULT_FROM_EMAIL: {getattr(settings, 'DEFAULT_FROM_EMAIL', '')}")

        sent = send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=recipients,
            fail_silently=False,
        )
        self.stdout.write(self.style.SUCCESS(f"ارسال شد: {sent}"))

