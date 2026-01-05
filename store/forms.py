from django import forms
from django.core.exceptions import ValidationError

from .models import ProductReview


class ProductReviewForm(forms.ModelForm):
    class Meta:
        model = ProductReview
        fields = ("name", "role", "rating", "comment")
        widgets = {
            "name": forms.TextInput(attrs={"class": "input"}),
            "role": forms.TextInput(attrs={"class": "input"}),
            "rating": forms.NumberInput(attrs={"class": "input", "min": 1, "max": 5}),
            "comment": forms.Textarea(attrs={"class": "textarea", "rows": 4}),
        }

    def clean_name(self):
        value = (self.cleaned_data.get("name") or "").strip()
        return value[:120]

    def clean_role(self):
        value = (self.cleaned_data.get("role") or "").strip()
        return value[:120]

    def clean_rating(self):
        value = self.cleaned_data.get("rating")
        try:
            value = int(value)
        except (TypeError, ValueError):
            raise ValidationError("Invalid rating.")
        if value < 1 or value > 5:
            raise ValidationError("Rating must be between 1 and 5.")
        return value

    def clean_comment(self):
        value = (self.cleaned_data.get("comment") or "").strip()
        if len(value) > 1000:
            raise ValidationError("متن نظر نباید بیشتر از ۱۰۰۰ کاراکتر باشد.")
        return value
