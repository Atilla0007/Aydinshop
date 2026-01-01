
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class SignupForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def clean_username(self):
        return (self.cleaned_data.get("username") or "").strip()

    def clean_email(self):
        return (self.cleaned_data.get("email") or "").strip().lower()
