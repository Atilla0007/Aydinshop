from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from ipaddress import ip_address as ip_parse

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import AuthIPBlock, AuthIPEvent, AuthLoginAttempt


def _setting_int(name: str, default: int) -> int:
    raw = getattr(settings, name, default)
    try:
        return int(raw)
    except (TypeError, ValueError):
        return int(default)


def _setting_bool(name: str, default: bool = False) -> bool:
    raw = getattr(settings, name, default)
    if isinstance(raw, bool):
        return raw
    return str(raw).strip().lower() in ("1", "true", "yes", "on")


def normalize_identifier(value: str | None) -> str:
    """Normalize a user identifier for consistent accounting."""

    if not value:
        return ""
    return value.strip().lower()[:255]


def get_client_ip(request) -> str:
    """Best-effort client IP extraction.

    Production note: X-Forwarded-For is only trusted when
    AUTH_SECURITY_TRUST_X_FORWARDED_FOR is enabled (otherwise it is ignored).
    """

    remote_addr = request.META.get("REMOTE_ADDR") or ""
    trust_xff = _setting_bool("AUTH_SECURITY_TRUST_X_FORWARDED_FOR", False)
    if trust_xff:
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            remote_addr = xff.split(",")[0].strip()

    try:
        ip_parse(remote_addr)
        return remote_addr
    except ValueError:
        return "0.0.0.0"


def _remaining_window_seconds(qs, *, now, window_seconds: int) -> int:
    oldest = qs.order_by("created_at").only("created_at").first()
    if not oldest:
        return window_seconds
    elapsed = max(0, int((now - oldest.created_at).total_seconds()))
    return max(1, window_seconds - elapsed)


@dataclass(frozen=True)
class LimitDecision:
    status_code: int
    reason: str
    retry_after_seconds: int


class LoginProtectionService:
    """Centralized decision logic for login throttling + IP blocking."""

    @classmethod
    def check_login_allowed(cls, *, ip: str, identifier: str) -> None:
        now = timezone.now()

        # 1) Check existing IP block (and auto-unblock when expired).
        block = AuthIPBlock.objects.filter(ip_address=ip, unblocked_at__isnull=True).first()
        if block:
            if block.blocked_until <= now:
                cls._auto_unblock(block, now=now)
            else:
                retry_after = max(1, int((block.blocked_until - now).total_seconds()))
                raise TooManyRequests(
                    LimitDecision(
                        status_code=429,
                        reason=AuthLoginAttempt.REASON_BLOCKED_IP,
                        retry_after_seconds=retry_after,
                    )
                )

        # 2) Rate limit by identifier (failed credential attempts only).
        identifier = normalize_identifier(identifier)
        if identifier:
            window_seconds = _setting_int("AUTH_SECURITY_LOGIN_IDENTIFIER_WINDOW_SECONDS", 600)
            max_attempts = _setting_int("AUTH_SECURITY_LOGIN_IDENTIFIER_MAX_ATTEMPTS", 5)
            window_start = now - timedelta(seconds=window_seconds)
            qs = AuthLoginAttempt.objects.filter(
                user_identifier=identifier,
                succeeded=False,
                reason=AuthLoginAttempt.REASON_INVALID_CREDENTIALS,
                created_at__gte=window_start,
            )
            if qs.count() >= max_attempts:
                retry_after = _remaining_window_seconds(qs, now=now, window_seconds=window_seconds)
                raise TooManyRequests(
                    LimitDecision(
                        status_code=429,
                        reason=AuthLoginAttempt.REASON_RATE_LIMIT_IDENTIFIER,
                        retry_after_seconds=retry_after,
                    )
                )

        # 3) Rate limit by IP (failed credential attempts only) and optionally block.
        ip_window_seconds = _setting_int("AUTH_SECURITY_LOGIN_IP_WINDOW_SECONDS", 600)
        ip_max_attempts = _setting_int("AUTH_SECURITY_LOGIN_IP_MAX_ATTEMPTS", 10)
        ip_block_after = _setting_int("AUTH_SECURITY_LOGIN_IP_BLOCK_AFTER_ATTEMPTS", ip_max_attempts)
        window_start = now - timedelta(seconds=ip_window_seconds)
        ip_qs = AuthLoginAttempt.objects.filter(
            ip_address=ip,
            succeeded=False,
            reason=AuthLoginAttempt.REASON_INVALID_CREDENTIALS,
            created_at__gte=window_start,
        )
        ip_failures = ip_qs.count()
        if ip_failures >= ip_block_after:
            cls._block_ip(ip=ip, identifier=identifier, now=now)
            cooldown = _setting_int("AUTH_SECURITY_IP_BLOCK_SECONDS", 1800)
            raise TooManyRequests(
                LimitDecision(
                    status_code=429,
                    reason=AuthLoginAttempt.REASON_BLOCKED_IP,
                    retry_after_seconds=cooldown,
                )
            )
        if ip_failures >= ip_max_attempts:
            retry_after = _remaining_window_seconds(ip_qs, now=now, window_seconds=ip_window_seconds)
            raise TooManyRequests(
                LimitDecision(
                    status_code=429,
                    reason=AuthLoginAttempt.REASON_RATE_LIMIT_IP,
                    retry_after_seconds=retry_after,
                )
            )

    @classmethod
    def log_rejected_attempt(cls, *, ip: str, identifier: str, reason: str, request) -> None:
        AuthLoginAttempt.objects.create(
            ip_address=ip,
            user_identifier=normalize_identifier(identifier),
            succeeded=False,
            reason=reason,
            path=(request.path or "")[:256],
            user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:256],
        )

    @classmethod
    def _block_ip(cls, *, ip: str, identifier: str, now) -> None:
        cooldown = _setting_int("AUTH_SECURITY_IP_BLOCK_SECONDS", 1800)
        blocked_until = now + timedelta(seconds=cooldown)

        # Use a transaction to avoid duplicate event spam in concurrent requests.
        with transaction.atomic():
            block, _created = AuthIPBlock.objects.select_for_update().get_or_create(
                ip_address=ip,
                defaults={
                    "blocked_at": now,
                    "blocked_until": blocked_until,
                    "unblocked_at": None,
                    "reason": AuthIPBlock.REASON_TOO_MANY_FAILURES,
                    "last_user_identifier": identifier or "",
                },
            )
            # If it already existed (possibly expired), refresh it.
            block.blocked_at = now
            block.blocked_until = blocked_until
            block.unblocked_at = None
            block.reason = AuthIPBlock.REASON_TOO_MANY_FAILURES
            block.last_user_identifier = identifier or ""
            block.save(update_fields=["blocked_at", "blocked_until", "unblocked_at", "reason", "last_user_identifier", "updated_at"])

            AuthIPEvent.objects.create(
                action=AuthIPEvent.ACTION_BLOCK,
                ip_address=ip,
                reason=AuthIPBlock.REASON_TOO_MANY_FAILURES,
                blocked_until=blocked_until,
                user_identifier=identifier or "",
            )

    @classmethod
    def _auto_unblock(cls, block: AuthIPBlock, *, now) -> None:
        # Mark unblocked so admins can audit the last block lifecycle.
        block.unblocked_at = now
        block.save(update_fields=["unblocked_at", "updated_at"])
        AuthIPEvent.objects.create(
            action=AuthIPEvent.ACTION_UNBLOCK,
            ip_address=block.ip_address,
            reason="cooldown_expired",
            user_identifier=block.last_user_identifier or "",
        )


class TooManyRequests(Exception):
    """Raised when a login attempt should be throttled/blocked."""

    def __init__(self, decision: LimitDecision):
        super().__init__(decision.reason)
        self.decision = decision

