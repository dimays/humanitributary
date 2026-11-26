"""What jobs may fetch automatically (docs/adr/0013-source-policy.md).

Three layers, all checked by `ingest.http.Fetcher` before any request leaves the machine:

1. NEVER_FETCH: hosts no job ever requests, whatever their Publisher row says, because their terms forbid automated
   reading or AI use. Agents read some of them in a browser (Britannica); others not at all (OpenStax).
2. The Publisher's `fetch_policy`: `browser_only` and `forbidden` publishers are never fetched by a job.
3. robots.txt for our User-Agent, read and cached per host; a CAPTCHA or bot challenge stops further requests to
   that host for the rest of the run (and link health skips the host for BLOCKED_COOLDOWN_DAYS).

Hosts here are matched with their subdomains (`www.britannica.com`, `kids.britannica.com`).
"""

from evidence.publishers import domain_of

NEVER_FETCH = {
    "britannica.com": "Terms forbid automated access; agents read it in a browser.",
    "openstax.org": "Terms forbid use of its textbooks by AI systems: never read or cite.",
    # News publishers whose terms forbid automated use (terms check 2026-11-26, docs/adr/0013-source-policy.md).
    # Their URLs may still be stored as link metadata (from Wikipedia's portal), never fetched; agents read them in a browser.
    "theguardian.com": "Open Platform terms 6(g) ban TDM, aggregation, AI/ML synthesis and any bot or automated program; 5: delete within 24h.",
    "guardianapis.com": "The Guardian's API host: same terms as theguardian.com.",
    "bbc.co.uk": "BBC terms of use §15: no plucking metadata from content or RSS feeds; robots.txt bans TDM and AI use.",
    "bbc.com": "BBC terms of use §15 (as bbc.co.uk).",
    "bbci.co.uk": "BBC feeds host: BBC terms of use §15.",
    "npr.org": "Feed copyright line: \"For Personal Use Only\"; other uses need NPR's permission.",
    "aljazeera.com": "robots.txt notice forbids automated scraping and text/data mining without written permission.",
    "aje.news": "Al Jazeera's short-link host: same terms as aljazeera.com.",
    "apnews.com": "robots.txt disallows /*.rss and /api/v2/feed/; no public feed or API; content licensed commercially.",
    "olympedia.org": "No published terms for automated reuse (a compiled private database): links and names only, no job fetches.",
}

# A host that answered with a CAPTCHA or a bot challenge isn't asked again by link health for this long.
BLOCKED_COOLDOWN_DAYS = 14

# Seconds between two requests to one host. Wikimedia asks for serial requests; others get one a second.
HOST_DELAY = {
    "en.wikipedia.org": 0.3,
    "www.wikidata.org": 0.3,
    "query.wikidata.org": 1.0,
    "wikimedia.org": 0.1,
    "archive.org": 1.0,
    "loc.gov": 6.0,  # loc.gov/legal: no more than 10 requests a minute (robots.txt Crawl-delay is 5)
    "thegazette.co.uk": 10.0,  # robots.txt Crawl-delay
    "history.state.gov": 20.0,  # robots.txt Crawl-delay
    "api.openalex.org": 0.2,
    "api.crossref.org": 1.0,  # public pool: 1 request a second, one at a time
    "news.un.org": 10.0,  # un.org robots.txt Crawl-delay
    "press.un.org": 10.0,
}
DEFAULT_HOST_DELAY = 1.0

# Hosts whose robots.txt we don't apply: Wikimedia's APIs (robots.txt there is written for crawlers of the HTML pages
# and disallows /w/, where api.php lives; Wikimedia's API etiquette asks bots to use the API, serially, with a
# descriptive User-Agent, which we do) and the Wayback availability API. Every other host's robots.txt is honored.
API_HOSTS = {"en.wikipedia.org", "www.wikidata.org", "query.wikidata.org", "wikimedia.org", "archive.org"}


def never_fetch_reason(url: str) -> str:
    """Why `url` must never be fetched by a job, or "" if NEVER_FETCH doesn't cover it."""
    domain = domain_of(url)
    for host, reason in NEVER_FETCH.items():
        if domain == host or domain.endswith("." + host):
            return reason
    return ""


def host_delay(host: str) -> float:
    host = host.lower()
    for h, d in HOST_DELAY.items():
        if host == h or host.endswith("." + h):
            return d
    return DEFAULT_HOST_DELAY


SECRET_SETTINGS = ("SMITHSONIAN_API_KEY", "EUROPEANA_API_KEY")
_SECRET_PARAM_RE = None


def mask_secrets(text: str) -> str:
    """Replace configured API key values and key-like query parameters with *** (FetchRun errors, logs)."""
    import re

    from django.conf import settings

    global _SECRET_PARAM_RE
    if _SECRET_PARAM_RE is None:
        _SECRET_PARAM_RE = re.compile(r"((?:api[_-]?key|wskey|key|token)=)[^&\s'\"]+", re.I)
    out = text or ""
    for name in SECRET_SETTINGS:
        value = getattr(settings, name, "")
        if value and len(value) >= 6:
            out = out.replace(value, "***")
    return _SECRET_PARAM_RE.sub(r"\1***", out)
