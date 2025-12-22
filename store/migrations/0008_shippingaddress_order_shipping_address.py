from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0007_manualinvoicesequence"),
    ]

    operations = [
        migrations.CreateModel(
            name="ShippingAddress",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("label", models.CharField(blank=True, max_length=120)),
                ("first_name", models.CharField(max_length=150)),
                ("last_name", models.CharField(max_length=150)),
                ("phone", models.CharField(max_length=20)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("province", models.CharField(max_length=100)),
                ("city", models.CharField(max_length=100)),
                ("address", models.TextField()),
                ("is_default", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="shipping_addresses", to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={
                "verbose_name": "آدرس ارسال",
                "verbose_name_plural": "آدرس‌های ارسال",
            },
        ),
        migrations.AddConstraint(
            model_name="shippingaddress",
            constraint=models.UniqueConstraint(
                condition=Q(("is_default", True)),
                fields=("user",),
                name="unique_default_address_per_user",
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="shipping_address",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="orders",
                to="store.shippingaddress",
            ),
        ),
    ]
