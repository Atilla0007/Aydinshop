from __future__ import annotations

from django.apps import AppConfig


class AuthSecurityConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "auth_security"
    verbose_name = "Authentication Security"

    def ready(self) -> None:  # pragma: no cover
        from . import signals  # noqa: F401

