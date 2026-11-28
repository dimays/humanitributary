"""The one HTTP client every job uses: polite, cached, and refusing what the source policy forbids.

- Refuses NEVER_FETCH hosts, `browser_only` / `forbidden` publishers and anything robots.txt disallows for our
  User-Agent (ingest/policy.py), before a request is made, and again before following each redirect: a redirect
  never lands a job on a host it may not fetch (it raises Refused naming the hop).
- One request at a time, with a per-host delay; backs off on 429/503 (honoring Retry-After, capped) and retries
  network errors a few times.
- Conditional requests: pass the stored ETag / Last-Modified and a 304 comes back as `not_modified`.
- A CAPTCHA or bot challenge marks the host blocked for the rest of the run.

Tests pass an `httpx.MockTransport` (recorded fixtures, no network) and a no-op `sleep`.
"""

import logging
import re
import time
import urllib.robotparser
from dataclasses import dataclass, field
from urllib.parse import quote, urljoin, urlsplit

import httpx
from django.conf import settings

from evidence.publishers import defaults_for, domain_of

from . import policy

logger = logging.getLogger(__name__)  # one INFO line per request, without its query string (a run's log: ADR 0031)


def _shown(url: str) -> str:
    """A URL for a log line: scheme, host and path; the query (which may hold a key) becomes "?…"."""
    parts = urlsplit(url)
    return f"{parts.scheme}://{parts.netloc.rsplit('@', 1)[-1]}{parts.path}" + ("?…" if parts.query else "")


class Refused(Exception):
    """The source policy forbids this request (never fetched; see the reason)."""


class FetchError(Exception):
    """The request failed after retries (network error, timeout)."""


CHALLENGE_RE = re.compile(
    rb"captcha|cf-chl|challenge-platform|just a moment\.\.\.|attention required! \| cloudflare|px-captcha|datadome|are you a robot",
    re.I,
)


@dataclass
class Fetched:
    url: str
    final_url: str
    status: int
    headers: dict
    content: bytes
    history: list = field(default_factory=list)
    elapsed_ms: int = 0
    blocked: bool = False

    @property
    def not_modified(self) -> bool:
        return self.status == 304

    @property
    def ok(self) -> bool:
        return 200 <= self.status < 300

    @property
    def text(self) -> str:
        m = re.search(r"charset=([\w-]+)", self.headers.get("content-type", ""))
        try:
            return self.content.decode(m.group(1) if m else "utf-8", errors="replace")
        except LookupError:
            return self.content.decode("utf-8", errors="replace")

    def json(self):
        import json

        return json.loads(self.content)


def looks_like_challenge(status: int, content: bytes) -> bool:
    """A CAPTCHA or bot wall rather than the page: checked on refusals, and on short 200 pages."""
    if status in (401, 403, 429, 503) or (status == 200 and len(content) < 30_000):
        return bool(CHALLENGE_RE.search(content[:30_000]))
    return False


class Fetcher:
    def __init__(self, *, transport: httpx.BaseTransport | None = None, sleep=time.sleep, user_agent: str | None = None,
                 timeout: float = 20.0, max_retries: int = 3, publisher_policy=None):
        self.user_agent = user_agent or settings.INGEST_USER_AGENT
        self.robots_token = self.user_agent.split("/")[0]
        # Redirects are followed by hand (_follow), so each hop passes the source policy first.
        self.client = httpx.Client(transport=transport, timeout=timeout, follow_redirects=False,
                                   headers={"User-Agent": self.user_agent, "Accept-Encoding": "gzip, deflate"})
        self.sleep = sleep
        self.max_retries = max_retries
        self._last: dict[str, float] = {}
        self._robots: dict[str, urllib.robotparser.RobotFileParser | None] = {}
        self.blocked: set[str] = set()
        self.requests = 0
        self._publisher_policy = publisher_policy or _db_publisher_policy

    def close(self):
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    # Policy ----------------------------------------------------------------------------------------------------
    def refusal(self, url: str, *, robots: bool = True, full_url: str = "") -> str:
        """Why the policy forbids fetching `url` ("" = allowed). `full_url` is the URL with its query parameters, which
        an `api_only` publisher's API base may require ("?fo=json")."""
        parts = urlsplit(url)
        if parts.scheme not in ("http", "https"):
            return f"not an http(s) URL: {url}"
        if reason := policy.never_fetch_reason(url):
            return reason
        fetch_policy = self._publisher_policy(domain_of(url))
        if fetch_policy == "api_only":
            if why := self.api_refusal(full_url or url):
                return why
        elif fetch_policy and fetch_policy != "allowed":
            return f"publisher {domain_of(url)} is {fetch_policy}: read in a browser, never by a job"
        host = (parts.hostname or "").lower()
        if host in self.blocked:
            return f"{host} answered with a bot challenge earlier in this run"
        if robots and host not in policy.API_HOSTS and not self._robots_allow(url):
            return f"robots.txt on {host} disallows {self.robots_token}"
        return ""

    def api_refusal(self, url: str) -> str:
        """For an `api_only` publisher (ADR 0037): "" when `url` is under its API base and any key it needs is set."""
        return _db_api_refusal(url)

    def ai_blocked(self, url: str) -> str:
        """Why robots.txt refuses `url` to an AI crawler named in it (ClaudeBot, anthropic-ai, GPTBot …), else "".
        The evidence-pack job doesn't fetch such a site whatever our User-Agent says (ADR 0037): the site has said it
        wants no AI readers. Reads robots.txt through the usual cache; Wikimedia's API hosts are exempt as always."""
        parts = urlsplit(url)
        host = (parts.hostname or "").lower()
        if host in policy.API_HOSTS:
            return ""
        self._robots_allow(url)
        rp = self._robots.get(host)
        path = quote(parts.path or "/") + (f"?{parts.query}" if parts.query else "")
        for entry in getattr(rp, "entries", []) or []:
            named = [a for a in entry.useragents if a.lower().split("/")[0] in policy.AI_AGENTS]
            if named and not entry.allowance(path):
                return f"robots.txt on {host} disallows the AI crawler {named[0]}"
        return ""

    def _robots_allow(self, url: str) -> bool:
        parts = urlsplit(url)
        host = parts.hostname.lower()
        if host not in self._robots:
            rp = urllib.robotparser.RobotFileParser()
            try:
                r = self._follow("GET", f"{parts.scheme}://{parts.netloc}/robots.txt", retries=1, robots=False)
            except (FetchError, Refused):
                r = None
            if r is None or r.status >= 500:
                rp.disallow_all = True  # RFC 9309: unreachable robots.txt means assume disallowed
            elif r.status in (401, 403):
                rp.disallow_all = True
            elif r.status >= 400:
                rp.allow_all = True
            else:
                rp.parse(r.text.splitlines())
            self._robots[host] = rp
        return self._robots[host].can_fetch(self.robots_token, url)

    # Requests --------------------------------------------------------------------------------------------------
    def get(self, url: str, *, params: dict | None = None, headers: dict | None = None, etag: str = "",
            last_modified: str = "", robots: bool = True, timeout: float | None = None) -> Fetched:
        return self.request("GET", url, params=params, headers=headers, etag=etag, last_modified=last_modified, robots=robots, timeout=timeout)

    def head(self, url: str, **kw) -> Fetched:
        return self.request("HEAD", url, **kw)

    def request(self, method: str, url: str, *, params=None, headers=None, etag="", last_modified="", robots=True, timeout=None) -> Fetched:
        if reason := self.refusal(url, robots=robots, full_url=str(httpx.URL(url, params=params)) if params else url):
            logger.warning("refused %s: %s", _shown(url), reason)
            raise Refused(reason)
        h = dict(headers or {})
        if etag:
            h["If-None-Match"] = etag
        if last_modified:
            h["If-Modified-Since"] = last_modified
        r = self._follow(method, url, params=params, headers=h, timeout=timeout, robots=robots)
        if looks_like_challenge(r.status, r.content):
            r.blocked = True
            self.blocked.add((urlsplit(r.final_url).hostname or "").lower())
            self.blocked.add((urlsplit(url).hostname or "").lower())
        return r

    MAX_REDIRECTS = 10

    def _follow(self, method, url, *, params=None, headers=None, retries=None, timeout=None, robots=True) -> Fetched:
        """A request, following redirects one hop at a time and checking the source policy before each hop."""
        history = []
        current, current_method, current_params = url, method, params
        for _ in range(self.MAX_REDIRECTS + 1):
            r = self._request(current_method, current, params=current_params, headers=headers, retries=retries, timeout=timeout)
            location = r.headers.get("location")
            if r.status not in (301, 302, 303, 307, 308) or not location:
                r.url, r.history = url, history
                return r
            nxt = urljoin(r.final_url, location)
            if reason := self.refusal(nxt, robots=robots):
                raise Refused(f"{current} redirects to {nxt}: {reason}")
            history.append(r.final_url)
            if r.status == 303 and current_method != "HEAD":
                current_method = "GET"
            current, current_params = nxt, None
        raise FetchError(f"more than {self.MAX_REDIRECTS} redirects from {url}")

    def _wait_turn(self, host: str):
        delay = policy.host_delay(host)
        rp = self._robots.get(host)
        if rp is not None:
            try:
                delay = max(delay, min(float(rp.crawl_delay(self.robots_token) or 0), 30.0))
            except (TypeError, ValueError):
                pass
        last = self._last.get(host)
        if last is not None:
            wait = delay - (time.monotonic() - last)
            if wait > 0:
                self.sleep(wait)
        self._last[host] = time.monotonic()

    def _request(self, method, url, *, params=None, headers=None, retries=None, timeout=None) -> Fetched:
        host = (urlsplit(url).hostname or "").lower()
        attempts = self.max_retries if retries is None else retries
        last_error = None
        for attempt in range(attempts + 1):
            self._wait_turn(host)
            t0 = time.monotonic()
            try:
                self.requests += 1
                kw = {"timeout": timeout} if timeout else {}
                resp = self.client.request(method, url, params=params, headers=headers, **kw)
            except httpx.HTTPError as e:
                last_error = e
                if attempt < attempts:
                    logger.warning("%s %s: %s; retrying (attempt %d of %d)", method, _shown(url), type(e).__name__, attempt + 2, attempts + 1)
                    self.sleep(min(2 ** (attempt + 1), 30))
                    continue
                logger.error("%s %s: %s after %d attempts", method, _shown(url), type(e).__name__, attempts + 1)
                raise FetchError(f"{type(e).__name__}: {e}") from e
            if resp.status_code in (429, 502, 503, 504) and attempt < attempts and not looks_like_challenge(resp.status_code, resp.content):
                wait = _retry_after(resp.headers.get("retry-after"), default=2 ** (attempt + 1))
                logger.warning("%s %s → %d; retrying in %.0f s", method, _shown(url), resp.status_code, wait)
                self.sleep(wait)
                continue
            ms = int((time.monotonic() - t0) * 1000)
            logger.log(logging.WARNING if resp.status_code >= 400 else logging.INFO, "%s %s → %d (%d ms, %d bytes)",
                       method, _shown(url), resp.status_code, ms, len(resp.content))
            return Fetched(
                url=url, final_url=str(resp.url), status=resp.status_code, headers={k.lower(): v for k, v in resp.headers.items()},
                content=resp.content, history=[str(h.url) for h in resp.history], elapsed_ms=int((time.monotonic() - t0) * 1000),
            )
        raise FetchError(str(last_error))


def _retry_after(value: str | None, default: float) -> float:
    try:
        return min(max(float(value), 1.0), 60.0)
    except (TypeError, ValueError):
        return min(default, 60.0)


def _nearest_publisher(domain: str):
    from evidence.models import Publisher

    parts = domain.split(".")
    candidates = [".".join(parts[i:]) for i in range(len(parts) - 1)]
    rows = {p.domain: p for p in Publisher.objects.filter(domain__in=candidates)}
    return next((rows[d] for d in candidates if d in rows), None)


def _db_api_refusal(url: str) -> str:
    pub = _nearest_publisher(domain_of(url))
    if pub is None or pub.fetch_policy != "api_only":
        return ""
    if not policy.api_base_allows(pub.api_base, url):
        return f"publisher {pub.domain} is api_only: only through {pub.api_base or '(no API base recorded)'}"
    if pub.api_needs_key and not (pub.api_key_setting and getattr(settings, pub.api_key_setting, "")):
        return f"publisher {pub.domain} is api_only and its API needs a key that isn't set: off until one exists"
    return ""


def _db_publisher_policy(domain: str) -> str:
    """The fetch policy of the publisher for `domain` (or its nearest parent in the database, or the defaults)."""
    from evidence.models import Publisher

    parts = domain.split(".")
    candidates = [".".join(parts[i:]) for i in range(len(parts) - 1)]
    rows = dict(Publisher.objects.filter(domain__in=candidates).values_list("domain", "fetch_policy"))
    for d in candidates:
        if d in rows:
            return rows[d]
    return defaults_for(domain).get("fetch_policy", "allowed")
