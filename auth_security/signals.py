from __future__ import annotations

from django.conf import settings
from django.contrib.auth.signals import user_login_failed
from django.dispatch import receiver

from .models import AuthLoginAttempt
from .services import get_client_ip, normalize_identifier


@receiver(user_login_failed)
def log_failed_login_attempt(sender, credentials, request, **kwargs):
    """Log invalid credential login failures.

    This uses Django's built-in signal so it also covers admin login failures.
    We intentionally avoid storing password or other sensitive fields.
    """

    if request is None:
        return

    configured = getattr(settings, "AUTH_SECURITY_LOGIN_PATHS", ["/login/", "/admin/login/"])
    if isinstance(configured, str):
        configured = [p.strip() for p in configured.split(",") if p.strip()]
    if request.path not in configured:
        return

    identifier = credentials.get("username") or credentials.get("email") or ""
    ip = get_client_ip(request)
    AuthLoginAttempt.objects.create(
        ip_address=ip,
        user_identifier=normalize_identifier(identifier),
        succeeded=False,
        reason=AuthLoginAttempt.REASON_INVALID_CREDENTIALS,
        path=(request.path or "")[:256],
        user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:256],
    )

