from __future__ import annotations

from django.core.management.base import BaseCommand

from core.models import News


PARAGRAPHS = [
    (
        "در استیرا تلاش می‌کنیم جدیدترین تجهیزات فروشگاهی و صنعتی را با اطلاعات فنی دقیق "
        "در اختیار شما قرار دهیم تا انتخاب سریع‌تر و مطمئن‌تری داشته باشید."
    ),
    (
        "تمامی کالاها با ضمانت اصالت ارائه می‌شوند و تیم پشتیبانی ما پیش و پس از خرید "
        "کنار شماست تا روند خرید و راه‌اندازی تجهیزات بدون دغدغه باشد."
    ),
    (
        "اگر برای انتخاب محصول مناسب نیاز به مشاوره دارید، کارشناسان ما آماده‌اند "
        "براساس نیاز واقعی کسب‌وکارتان راهنمایی کنند."
    ),
    (
        "ارسال سریع، بسته‌بندی ایمن و پیگیری وضعیت سفارش از مهم‌ترین اولویت‌های استیراست "
        "تا تجربه‌ای حرفه‌ای و قابل اعتماد داشته باشید."
    ),
]


class Command(BaseCommand):
    help = "Extend news items with longer Persian content."

    def add_arguments(self, parser):
        parser.add_argument(
            "--min-length",
            type=int,
            default=700,
            help="Minimum character length for each news text.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show which news would be updated without saving changes.",
        )

    def handle(self, *args, **options):
        min_length = options["min_length"]
        dry_run = options["dry_run"]

        news_items = list(News.objects.all())
        if not news_items:
            self.stdout.write(self.style.WARNING("No news items found."))
            return

        updated = 0
        for item in news_items:
            base_text = (item.text or "").strip()
            if len(base_text) >= min_length:
                continue

            new_text = base_text
            paragraph_index = 0
            while len(new_text) < min_length:
                paragraph = PARAGRAPHS[paragraph_index % len(PARAGRAPHS)]
                new_text = f"{new_text}\n\n{paragraph}".strip()
                paragraph_index += 1

            if dry_run:
                self.stdout.write(f"Would update: {item.title}")
                continue

            item.text = new_text
            item.save(update_fields=["text"])
            updated += 1

        if dry_run:
            self.stdout.write(self.style.SUCCESS("Dry run completed."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Updated {updated} news item(s)."))
