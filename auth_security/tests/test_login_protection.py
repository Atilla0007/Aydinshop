from __future__ import annotations

from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.utils import timezone

from auth_security.models import AuthIPBlock, AuthIPEvent, AuthLoginAttempt


class LoginProtectionTests(TestCase):
    @override_settings(
        AUTH_SECURITY_LOGIN_PATHS="/login/",
        AUTH_SECURITY_TRUST_X_FORWARDED_FOR=False,
        AUTH_SECURITY_LOGIN_IDENTIFIER_MAX_ATTEMPTS=2,
        AUTH_SECURITY_LOGIN_IDENTIFIER_WINDOW_SECONDS=600,
        AUTH_SECURITY_LOGIN_IP_MAX_ATTEMPTS=100,
        AUTH_SECURITY_LOGIN_IP_WINDOW_SECONDS=600,
        AUTH_SECURITY_LOGIN_IP_BLOCK_AFTER_ATTEMPTS=100,
        AUTH_SECURITY_IP_BLOCK_SECONDS=60,
    )
    def test_rate_limit_per_identifier_returns_429(self):
        User.objects.create_user(username="u1", password="correct-pass")
        ip = "10.0.0.10"

        for _ in range(2):
            resp = self.client.post(
                "/login/",
                {"username": "u1", "password": "wrong-pass"},
                REMOTE_ADDR=ip,
            )
            self.assertEqual(resp.status_code, 200)

        resp = self.client.post(
            "/login/",
            {"username": "u1", "password": "wrong-pass"},
            REMOTE_ADDR=ip,
        )
        self.assertEqual(resp.status_code, 429)
        self.assertTrue(
            AuthLoginAttempt.objects.filter(reason=AuthLoginAttempt.REASON_RATE_LIMIT_IDENTIFIER).exists()
        )

    @override_settings(
        AUTH_SECURITY_LOGIN_PATHS="/login/",
        AUTH_SECURITY_TRUST_X_FORWARDED_FOR=False,
        AUTH_SECURITY_LOGIN_IDENTIFIER_MAX_ATTEMPTS=100,
        AUTH_SECURITY_LOGIN_IDENTIFIER_WINDOW_SECONDS=600,
        AUTH_SECURITY_LOGIN_IP_MAX_ATTEMPTS=100,
        AUTH_SECURITY_LOGIN_IP_WINDOW_SECONDS=60,
        AUTH_SECURITY_LOGIN_IP_BLOCK_AFTER_ATTEMPTS=2,
        AUTH_SECURITY_IP_BLOCK_SECONDS=300,
    )
    def test_ip_is_blocked_and_auto_unblocked_after_cooldown(self):
        User.objects.create_user(username="u2", password="correct-pass")
        ip = "10.0.0.20"

        # Two invalid attempts are allowed; the third triggers an IP block.
        resp1 = self.client.post("/login/", {"username": "u2", "password": "wrong"}, REMOTE_ADDR=ip)
        self.assertEqual(resp1.status_code, 200)
        resp2 = self.client.post("/login/", {"username": "u2", "password": "wrong"}, REMOTE_ADDR=ip)
        self.assertEqual(resp2.status_code, 200)

        resp3 = self.client.post("/login/", {"username": "u2", "password": "wrong"}, REMOTE_ADDR=ip)
        self.assertEqual(resp3.status_code, 429)

        block = AuthIPBlock.objects.get(ip_address=ip)
        self.assertTrue(block.is_active)
        self.assertTrue(AuthIPEvent.objects.filter(ip_address=ip, action="block").exists())

        # Move attempts out of the window and expire the cooldown.
        AuthLoginAttempt.objects.filter(ip_address=ip).update(
            created_at=timezone.now() - timedelta(seconds=999)
        )
        block.blocked_until = timezone.now() - timedelta(seconds=1)
        block.save(update_fields=["blocked_until", "updated_at"])

        # Next request should auto-unblock and allow normal auth flow again.
        resp4 = self.client.post("/login/", {"username": "u2", "password": "correct-pass"}, REMOTE_ADDR=ip)
        self.assertEqual(resp4.status_code, 302)

        block.refresh_from_db()
        self.assertIsNotNone(block.unblocked_at)
        self.assertTrue(AuthIPEvent.objects.filter(ip_address=ip, action="unblock").exists())

