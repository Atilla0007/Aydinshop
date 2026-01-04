import re

from django import forms
from django.core.exceptions import ValidationError

from store.models import Product
from .models import ContactMessage


class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = [
            "name",
            "email",
            "phone",
            "company",
            "city",
            "inquiry_type",
            "service_package",
            "product_interest",
            "message",
        ]
        widgets = {
            "name": forms.TextInput(attrs={"class": "input"}),
            "email": forms.EmailInput(attrs={"class": "input"}),
            "phone": forms.TextInput(attrs={"class": "input"}),
            "company": forms.TextInput(attrs={"class": "input"}),
            "city": forms.TextInput(attrs={"class": "input"}),
            "inquiry_type": forms.Select(attrs={"class": "input"}),
            "service_package": forms.Select(attrs={"class": "input"}),
            "product_interest": forms.Select(attrs={"class": "input"}),
            "message": forms.Textarea(attrs={"class": "textarea", "rows": 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["product_interest"].queryset = Product.objects.order_by("name")
        self.fields["product_interest"].required = False
        self.fields["service_package"].required = False

    def clean_name(self):
        return (self.cleaned_data.get("name") or "").strip()

    def clean_email(self):
        return (self.cleaned_data.get("email") or "").strip().lower()

    def clean_phone(self):
        value = (self.cleaned_data.get("phone") or "").strip()
        if value and not re.fullmatch(r"\+?\d{8,15}", value):
            raise ValidationError("شماره تماس معتبر نیست.")
        return value

    def clean_company(self):
        return (self.cleaned_data.get("company") or "").strip()

    def clean_city(self):
        return (self.cleaned_data.get("city") or "").strip()

    def clean_message(self):
        value = (self.cleaned_data.get("message") or "").strip()
        if len(value) > 2000:
            raise ValidationError("متن پیام نباید بیشتر از ۲۰۰۰ کاراکتر باشد.")
        return value
