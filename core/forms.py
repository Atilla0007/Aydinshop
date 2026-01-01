
import re

from django import forms
from django.core.exceptions import ValidationError

from .models import ContactMessage


class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'phone', 'message']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'input'}),
            'email': forms.EmailInput(attrs={'class': 'input'}),
            'phone': forms.TextInput(attrs={'class': 'input'}),
            'message': forms.Textarea(attrs={'class': 'textarea', 'rows': 4}),
        }

    def clean_name(self):
        return (self.cleaned_data.get("name") or "").strip()

    def clean_email(self):
        return (self.cleaned_data.get("email") or "").strip().lower()

    def clean_phone(self):
        value = (self.cleaned_data.get("phone") or "").strip()
        if value and not re.fullmatch(r"\+?\d{8,15}", value):
            raise ValidationError("شماره تماس معتبر نیست.")
        return value

    def clean_message(self):
        value = (self.cleaned_data.get("message") or "").strip()
        if len(value) > 2000:
            raise ValidationError("متن پیام بیش از حد طولانی است.")
        return value
