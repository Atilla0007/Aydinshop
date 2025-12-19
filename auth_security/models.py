from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class AuthLoginAttempt(models.Model):
    """Audit log for login attempts.

    We log *failed* attempts (and optionally successes) without storing any secret
    material (e.g., passwords). This supports brute-force detection and forensic
    review via Django Admin.
    """

    REASON_INVALID_CREDENTIALS = "invalid_credentials"
    REASON_RATE_LIMIT_IP = "rate_limited_ip"
    REASON_RATE_LIMIT_IDENTIFIER = "rate_limited_identifier"
    REASON_BLOCKED_IP = "blocked_ip"
    REASON_MISSING_IDENTIFIER = "missing_identifier"

    REASON_CHOICES = (
        (REASON_INVALID_CREDENTIALS, "Invalid credentials"),
        (REASON_RATE_LIMIT_IP, "Rate limited (IP)"),
        (REASON_RATE_LIMIT_IDENTIFIER, "Rate limited (identifier)"),
        (REASON_BLOCKED_IP, "Blocked IP"),
        (REASON_MISSING_IDENTIFIER, "Missing identifier"),
    )

    ip_address = models.GenericIPAddressField(db_index=True)
    user_identifier = models.CharField(max_length=255, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    succeeded = models.BooleanField(default=False)
    reason = models.CharField(max_length=64, choices=REASON_CHOICES, db_index=True)

    # Optional context for investigations (never store passwords).
    path = models.CharField(max_length=256, blank=True)
    user_agent = models.CharField(max_length=256, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="auth_login_attempts",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["ip_address", "created_at"]),
            models.Index(fields=["user_identifier", "created_at"]),
        ]

    def __str__(self) -> str:
        ident = self.user_identifier or "-"
        return f"{self.ip_address} {ident} {self.reason} @ {self.created_at:%Y-%m-%d %H:%M:%S}"


class AuthIPBlock(models.Model):
    """Represents a temporarily blocked client IP.

    Stored in the DB to support inspection and manual intervention from admin.
    Unblocking is performed automatically when the cooldown expires (lazy unblocking
    during checks), and recorded in AuthIPEvent.
    """

    REASON_TOO_MANY_FAILURES = "too_many_failures"

    ip_address = models.GenericIPAddressField(unique=True)
    blocked_at = models.DateTimeField()
    blocked_until = models.DateTimeField()
    unblocked_at = models.DateTimeField(null=True, blank=True)
    reason = models.CharField(max_length=64, default=REASON_TOO_MANY_FAILURES)
    last_user_identifier = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-blocked_at"]

    @property
    def is_active(self) -> bool:
        now = timezone.now()
        return self.unblocked_at is None and self.blocked_until > now

    def __str__(self) -> str:
        return f"{self.ip_address} blocked until {self.blocked_until:%Y-%m-%d %H:%M:%S}"


class AuthIPEvent(models.Model):
    """Audit log for block/unblock events."""

    ACTION_BLOCK = "block"
    ACTION_UNBLOCK = "unblock"
    ACTION_CHOICES = (
        (ACTION_BLOCK, "Block"),
        (ACTION_UNBLOCK, "Unblock"),
    )

    action = models.CharField(max_length=16, choices=ACTION_CHOICES, db_index=True)
    ip_address = models.GenericIPAddressField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    reason = models.CharField(max_length=64, blank=True)
    blocked_until = models.DateTimeField(null=True, blank=True)
    user_identifier = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["ip_address", "created_at"])]

    def __str__(self) -> str:
        return f"{self.action} {self.ip_address} @ {self.created_at:%Y-%m-%d %H:%M:%S}"


class _BlockEventManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(action=AuthIPEvent.ACTION_BLOCK)


class _UnblockEventManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(action=AuthIPEvent.ACTION_UNBLOCK)


class AuthIPBlockEvent(AuthIPEvent):
    """Proxy model to show block events separately in admin."""

    objects = _BlockEventManager()

    class Meta:
        proxy = True
        verbose_name = "IP Block Event"
        verbose_name_plural = "IP Block Events"


class AuthIPUnblockEvent(AuthIPEvent):
    """Proxy model to show unblock events separately in admin."""

    objects = _UnblockEventManager()

    class Meta:
        proxy = True
        verbose_name = "IP Unblock Event"
        verbose_name_plural = "IP Unblock Events"

