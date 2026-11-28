"""The source policy for an agent's own reads (docs/adr/0041-deferred-releases-and-the-fetch-policy-endpoint.md).

    GET /api/agent/policy?url=…   → {url, publisher, policy, may_fetch, browser_read, why, api_base?, crawl_delay?}

Jobs fetch through `ingest.http.Fetcher`, which refuses what the source policy forbids (ADR 0013, ADR 0037). An
agent reading a page itself (WebFetch, curl) has no Fetcher in front of it, so it asks here first, and fetches only
when `may_fetch` is true. The same rows decide: the Publisher's `fetch_policy` (the nearest row for the domain or a
parent, else `evidence.publishers` defaults), `ingest.policy.NEVER_FETCH`, whether anyone rated the publisher (a
tier), the evidence-pack job's record of a robots.txt that shuts out AI crawlers by name (`PrefetchedPage` rows with
reason `ai_blocked`) and of a host that refused us lately (`robots`, `blocked`). Nothing is fetched to answer.

`policy` is the deciding reason, in the evidence pack's `unreadable` words:

| policy | may_fetch | browser_read | |
|---|---|---|---|
| `forbidden` | no | no | never read or cite (OpenStax) |
| `citation_only`, `browser_only`, `never_fetch` | no | yes | a person's browser (or a local session's in-app browser) only |
| `api_only` | under its `api_base` only (and a key, where it needs one) | yes | |
| `ai_blocked`, `robots`, `blocked` | no | yes | the site shuts out AI crawlers, or refused our reader lately |
| `unrated` | no | yes | nobody has read its terms and rated it |
| `allowed` | yes | yes | at most one request every `crawl_delay` seconds |

Cloud agents have no browser: `browser_read` true there means release the task with `{"needs": "browser"}` when the
page can't be replaced by another source.
"""

from datetime import timedelta
from urllib.parse import urlsplit

from django.conf import settings
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from evidence.publishers import defaults_for, domain_of
from ingest import policy as source_policy
from ingest import prefetch
from ingest.http import _nearest_publisher
from ingest.models import PrefetchedPage

from .auth import agent_view, error

BROWSER = "it needs a browser read: a person's browser, or a local session's in-app browser; never a script. A cloud agent has no browser"


def _hosts(host: str) -> list[str]:
    bare = host.removeprefix("www.")
    return [bare, "www." + bare]


def ai_blocked(url: str, host: str) -> str:
    """The evidence-pack job's record that robots.txt shuts AI crawlers out of this page or host, else "". The host's
    latest page row decides (a site may have opened up since), and a row for this very URL always counts."""
    rows = PrefetchedPage.objects.filter(via="").filter(Q(status__in=["stored", "purged"]) | Q(reason="ai_blocked"))
    own = rows.filter(url=prefetch.page_key(url), reason="ai_blocked").values_list("detail", flat=True).first()
    if own is not None:
        return own or f"robots.txt on {host} disallows AI crawlers"
    latest = rows.filter(host__in=_hosts(host)).order_by("-checked_at").values_list("reason", "detail").first()
    if latest and latest[0] == "ai_blocked":
        return latest[1] or f"robots.txt on {host} disallows AI crawlers"
    return ""


def host_refused(host: str) -> tuple[str, str]:
    """(reason, detail) when the host refused our reader lately (robots.txt for our User-Agent, a bot wall), as the
    evidence-pack job records it (ingest.prefetch.host_refusal)."""
    since = timezone.now() - timedelta(days=prefetch.HOST_COOLDOWN_DAYS)
    row = (PrefetchedPage.objects.filter(host__in=_hosts(host), status="unreadable", reason__in=["blocked", "robots"], checked_at__gte=since)
           .order_by("-checked_at").values_list("reason", "detail").first())
    return (row[0], row[1]) if row else ("", "")


def api_refusal(pub, url: str) -> str:
    if not source_policy.api_base_allows(pub.api_base if pub else "", url):
        return f"its publisher allows only its API: request {(pub.api_base if pub else '') or '(no API base recorded)'} instead"
    if pub and pub.api_needs_key and not (pub.api_key_setting and getattr(settings, pub.api_key_setting, "")):
        return "its API needs a key that isn't set: off until one exists"
    return ""


def decide(url: str) -> dict:
    """What an agent may do with `url` itself (the table above). `url` must be http(s)."""
    host = (urlsplit(url).hostname or "").lower()
    domain = domain_of(url)
    pub = _nearest_publisher(domain)
    fetch_policy = pub.fetch_policy if pub else defaults_for(domain).get("fetch_policy", "allowed")
    out = {"url": url, "publisher": {"domain": pub.domain, "name": pub.name, "tier": pub.tier, "fetch_policy": pub.fetch_policy} if pub else None}

    def no(policy: str, why: str, browser_read: bool = True, **extra) -> dict:
        return out | {"policy": policy, "may_fetch": False, "browser_read": browser_read, "why": why} | extra

    if fetch_policy == "forbidden":
        return no("forbidden", f"{domain} is forbidden: its terms forbid it; never read or cite it", browser_read=False)
    if fetch_policy == "citation_only":
        return no("citation_only", f"{domain} is citation_only: cite the link, never fetch it; {BROWSER}")
    if fetch_policy == "browser_only":
        return no("browser_only", f"{domain} is browser_only: {BROWSER}")
    if why := source_policy.never_fetch_reason(url):
        return no("never_fetch", f"{domain} is never fetched by script ({why}); {BROWSER}")
    if fetch_policy == "api_only":
        if why := api_refusal(pub, url):
            return no("api_only", f"{domain} is api_only: {why}", api_base=pub.api_base if pub else "")
    elif (pub.tier if pub else defaults_for(domain).get("tier")) is None:
        return no("unrated", f"{domain} has no rating (nobody has read its terms): never fetch it by script; use a rated source instead, or a browser: {BROWSER}")
    if host not in source_policy.API_HOSTS:
        if why := ai_blocked(url, host):
            return no("ai_blocked", f"{why}: the site shuts out AI readers by name; never fetch it by script; {BROWSER}")
        reason, detail = host_refused(host)
        if reason:
            return no(reason, f"{host} refused our reader lately ({detail[:200] or reason}): don't ask it again by script; {BROWSER}")
    extra = {"api_base": pub.api_base} if fetch_policy == "api_only" else {}
    return out | {"policy": fetch_policy, "may_fetch": True, "browser_read": True,
                  "why": (f"{domain} is api_only and this URL is under its API base" if fetch_policy == "api_only" else f"{domain} is rated and allowed")
                  + ": fetch it with the honest User-Agent, at most one request every crawl_delay seconds",
                  "crawl_delay": source_policy.host_delay(host)} | extra


@agent_view
@require_http_methods(["GET"])
def policy(request):
    url = (request.GET.get("url") or "").strip()
    if not url:
        return error(400, "send ?url=<the page you want to read>")
    try:
        parts = urlsplit(url)
        valid = len(url) <= 2000 and parts.scheme in ("http", "https") and bool(parts.hostname)
    except ValueError:  # a malformed host ("http://[::1")
        valid = False
    if not valid:
        return error(400, "url must be an http(s) URL")
    return JsonResponse(decide(url), json_dumps_params={"ensure_ascii": False})
