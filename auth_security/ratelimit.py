from __future__ import annotations

import logging
from dataclasses import dataclass

from django.core.cache import cache
from django.utils import timezone

from .services import get_client_ip, normalize_identifier

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    retry_after_seconds: int


def check_rate_limit(
    request,
    *,
    scope: str,
    limit: int,
    window_seconds: int,
    identifier: str | None = None,
) -> RateLimitDecision:
    """Basic IP/identifier rate limiter using Django cache."""

    ip = get_client_ip(request)
    ident = normalize_identifier(identifier)
    key = f"rl:{scope}:{ip}:{ident or '-'}"
    now_ts = timezone.now().timestamp()

    payload = cache.get(key)
    if not payload or payload.get("reset_at", 0) <= now_ts:
        cache.set(
            key,
            {"count": 1, "reset_at": now_ts + window_seconds},
            timeout=window_seconds,
        )
        return RateLimitDecision(allowed=True, retry_after_seconds=0)

    payload["count"] = int(payload.get("count", 0)) + 1
    retry_after = max(1, int(payload["reset_at"] - now_ts))
    cache.set(key, payload, timeout=retry_after)

    if payload["count"] > limit:
        logger.warning(
            "Rate limit exceeded",
            extra={"scope": scope, "ip": ip, "identifier": ident or "-"},
        )
        return RateLimitDecision(allowed=False, retry_after_seconds=retry_after)

    return RateLimitDecision(allowed=True, retry_after_seconds=retry_after)
