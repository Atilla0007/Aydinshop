
from django import forms
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm, UserCreationForm
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


class PasswordResetRequestForm(PasswordResetForm):
    email = forms.EmailField(
        label="ایمیل",
        widget=forms.EmailInput(attrs={"class": "input", "autocomplete": "email"}),
    )

    def clean_email(self):
        return (self.cleaned_data.get("email") or "").strip().lower()


class SetPasswordConfirmForm(SetPasswordForm):
    new_password1 = forms.CharField(
        label="رمز عبور جدید",
        widget=forms.PasswordInput(attrs={"class": "input", "autocomplete": "new-password"}),
    )
    new_password2 = forms.CharField(
        label="تکرار رمز عبور جدید",
        widget=forms.PasswordInput(attrs={"class": "input", "autocomplete": "new-password"}),
    )
