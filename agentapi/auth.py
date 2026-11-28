"""Bearer tokens and the per-token rate limit for the agent API (docs/adr/0017-agent-api.md)."""

import hashlib
import logging
import secrets
from functools import wraps

from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from django.utils import timezone

from .models import AgentToken

TOKEN_PREFIX = "hta_"

log = logging.getLogger("agentapi")


def hash_token(token: str) -> str:
    # Tokens are 32 random bytes: a plain sha256 is enough (no dictionary to guess from), and lets us look them up.
    return hashlib.sha256(token.encode()).hexdigest()


def create_token(name: str, scopes: list[str], *, created_by: str) -> tuple[AgentToken, str]:
    """→ (row, the token). The token is returned once and never stored."""
    token = TOKEN_PREFIX + secrets.token_urlsafe(32)
    row = AgentToken.objects.create(name=name, prefix=token[:10], token_hash=hash_token(token), scopes=sorted(set(scopes)), created_by=created_by)
    return row, token


def error(status: int, message: str, **extra) -> JsonResponse:
    return JsonResponse({"error": message, **extra}, status=status)


def _rate_ok(token: AgentToken) -> tuple[bool, int]:
    """Count this request in the token's one-minute window, atomically. → (allowed, seconds until the window resets)"""
    limit = settings.AGENT_API_RATE_PER_MINUTE
    with connection.cursor() as c:
        c.execute(
            """
            UPDATE agentapi_agenttoken SET
              window_start = CASE WHEN window_start IS NULL OR window_start < now() - interval '60 seconds' THEN now() ELSE window_start END,
              window_count = CASE WHEN window_start IS NULL OR window_start < now() - interval '60 seconds' THEN 1 ELSE window_count + 1 END,
              last_used_at = now()
            WHERE id = %s
            RETURNING window_count, GREATEST(0, CEIL(EXTRACT(EPOCH FROM (window_start + interval '60 seconds' - now()))))::int
            """,
            [token.pk],
        )
        count, reset = c.fetchone()
    return count <= limit, reset


def authenticate(request) -> tuple[AgentToken | None, JsonResponse | None]:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None, error(401, "send Authorization: Bearer <token> (manage.py agent_token create <name>)")
    token = AgentToken.objects.filter(token_hash=hash_token(header[7:].strip()), revoked_at__isnull=True).first()
    if token is None:
        return None, error(401, "unknown or revoked token")
    ok, reset = _rate_ok(token)
    if not ok:
        resp = error(429, f"rate limit: {settings.AGENT_API_RATE_PER_MINUTE} requests a minute per token", retry_after=reset)
        resp["Retry-After"] = str(reset)
        return None, resp
    return token, None


def agent_view(fn):
    """Authenticate, rate-limit, and pass the token on as `request.agent_token`. An exception the view doesn't handle
    is logged with its traceback and answered as JSON (500, with the exception's type), never Django's HTML page: an
    agent reads the body to decide what to do next (ADR 0045)."""

    @wraps(fn)
    def wrapper(request, *args, **kwargs):
        token, err = authenticate(request)
        if err:
            return err
        request.agent_token = token
        try:
            return fn(request, *args, **kwargs)
        except Exception as e:
            log.exception("agent API: %s %s by %s", request.method, request.path, token.actor)
            return error(500, f"the server failed ({type(e).__name__}); nothing was kept. It is logged for the owner: "
                              "send the request again later, or release the task with a reason", exception=type(e).__name__)

    wrapper.csrf_exempt = True  # bearer tokens, not cookies: CSRF does not apply
    return wrapper


def revoke(name: str) -> bool:
    return AgentToken.objects.filter(name=name, revoked_at__isnull=True).update(revoked_at=timezone.now()) > 0
