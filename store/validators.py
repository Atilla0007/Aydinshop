from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext_lazy as _


def _setting_int(name: str, default: int) -> int:
    raw = getattr(settings, name, default)
    try:
        return int(raw)
    except (TypeError, ValueError):
        return int(default)


class MaxFileSizeValidator:
    def __init__(self, max_bytes: int, message: str):
        self.max_bytes = int(max_bytes)
        self.message = message

    def __call__(self, file_obj):
        if file_obj and getattr(file_obj, "size", 0) > self.max_bytes:
            raise ValidationError(self.message)

    def __eq__(self, other) -> bool:
        return (
            isinstance(other, MaxFileSizeValidator)
            and self.max_bytes == other.max_bytes
            and self.message == other.message
        )

    def deconstruct(self):
        path = "store.validators.MaxFileSizeValidator"
        args = [self.max_bytes]
        kwargs = {"message": self.message}
        return path, args, kwargs


RECEIPT_ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "pdf"]
PRODUCT_IMAGE_ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"]

RECEIPT_MAX_BYTES = _setting_int("RECEIPT_MAX_UPLOAD_MB", 5) * 1024 * 1024
PRODUCT_IMAGE_MAX_BYTES = _setting_int("PRODUCT_IMAGE_MAX_UPLOAD_MB", 8) * 1024 * 1024

receipt_extension_validator = FileExtensionValidator(
    RECEIPT_ALLOWED_EXTENSIONS,
    message=_("فرمت فایل مجاز نیست."),
)
product_image_extension_validator = FileExtensionValidator(
    PRODUCT_IMAGE_ALLOWED_EXTENSIONS,
    message=_("فرمت تصویر مجاز نیست."),
)

receipt_file_validators = [
    receipt_extension_validator,
    MaxFileSizeValidator(RECEIPT_MAX_BYTES, _("حجم فایل بیش از حد مجاز است.")),
]
product_image_validators = [
    product_image_extension_validator,
    MaxFileSizeValidator(PRODUCT_IMAGE_MAX_BYTES, _("حجم تصویر بیش از حد مجاز است.")),
]


def validate_receipt_upload(uploaded_file) -> None:
    """Validate uploaded receipt files before saving."""
    if not uploaded_file:
        raise ValidationError(_("فایل فیش معتبر نیست."))

    receipt_extension_validator(uploaded_file)

    if getattr(uploaded_file, "size", 0) > RECEIPT_MAX_BYTES:
        raise ValidationError(_("حجم فایل بیش از حد مجاز است."))

    content_type = (getattr(uploaded_file, "content_type", "") or "").lower()
    allowed_types = {"image/png", "image/jpeg", "application/pdf"}
    if content_type and content_type not in allowed_types:
        raise ValidationError(_("نوع فایل مجاز نیست."))
