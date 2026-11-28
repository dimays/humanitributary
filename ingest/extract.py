"""Deterministic pre-processing of fetched pages: canonical URL, main text, title, dates, language, metadata, links.

Everything here is a pure function of its input (no network), so the same page always gives the same result.
"""

import hashlib
import re
from dataclasses import dataclass, field
from html import unescape
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit

TRACKING_PARAMS = re.compile(r"^(utm_\w+|fbclid|gclid|mc_cid|mc_eid|ocid|cmpid|at_\w+|ns_\w+|xtor|traffic_source|ref|ref_src|CMP)$", re.I)
WORD_RE = re.compile(r"\S+")


def canonical_url(url: str, *, rel_canonical: str = "") -> str:
    """https, lower-case host without "www.", no fragment, no tracking parameters, no trailing slash on a path.

    A page's own rel=canonical wins when it points at the same site (so a mobile or AMP copy maps to the article).
    """
    if rel_canonical:
        base = urlsplit(url)
        rc = urlsplit(urljoin(url, rel_canonical))
        if rc.hostname and base.hostname and _site(rc.hostname) == _site(base.hostname):
            url = urlunsplit(rc)
    p = urlsplit(url.strip())
    host = (p.hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    if host.endswith(".m.wikipedia.org"):
        host = host.replace(".m.wikipedia.org", ".wikipedia.org")
    port = f":{p.port}" if p.port and p.port not in (80, 443) else ""
    query = urlencode([(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True) if not TRACKING_PARAMS.match(k)])
    path = p.path or "/"
    if len(path) > 1 and path.endswith("/"):
        path = path.rstrip("/")
    return urlunsplit(("https", host + port, path, query, ""))


def _site(host: str) -> str:
    host = host.lower()
    return host[4:] if host.startswith("www.") else host


def lead(text: str, words: int = 60) -> str:
    """The first `words` words, on a word boundary (an ellipsis when cut)."""
    w = WORD_RE.findall(text or "")
    return " ".join(w[:words]) + (" …" if len(w) > words else "")


def excerpt(text: str, words: int = 25) -> str:
    """≤ 25 words (AGENTS.md rule 5): what a task payload may quote from a source."""
    w = WORD_RE.findall(text or "")
    return " ".join(w[:words])


def text_hash(text: str) -> str:
    """sha256 of whitespace-normalized text: unchanged when only markup, ads or spacing move."""
    return hashlib.sha256(" ".join((text or "").split()).encode()).hexdigest()


@dataclass
class Extracted:
    title: str = ""
    text: str = ""
    language: str = ""
    published: str = ""  # ISO date or datetime, as found
    canonical: str = ""
    description: str = ""
    site_name: str = ""
    metadata: dict = field(default_factory=dict)
    links: list = field(default_factory=list)


META_RE = re.compile(r"<meta\s+[^>]*>", re.I)
ATTR_RE = re.compile(r'([\w:-]+)\s*=\s*("([^"]*)"|\'([^\']*)\')', re.I)
LINK_CANON_RE = re.compile(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*>', re.I)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
HREF_RE = re.compile(r'<a\s+[^>]*href=["\']([^"\'#]+)["\']', re.I)
HTML_LANG_RE = re.compile(r"<html[^>]*\blang=[\"']?([\w-]+)", re.I)
JSONLD_DATE_RE = re.compile(r'"datePublished"\s*:\s*"([^"]+)"')


def _attrs(tag: str) -> dict:
    return {m.group(1).lower(): unescape(m.group(3) if m.group(3) is not None else m.group(4)) for m in ATTR_RE.finditer(tag)}


def html_metadata(html: str, base_url: str = "") -> Extracted:
    """og:, twitter:, article: and schema.org metadata, the title, rel=canonical, <html lang> and outbound links."""
    out = Extracted()
    meta = {}
    for tag in META_RE.findall(html[:200_000]):
        a = _attrs(tag)
        key = (a.get("property") or a.get("name") or a.get("itemprop") or "").lower()
        if key and "content" in a and key not in meta:
            meta[key] = a["content"].strip()
    keep = {k: v for k, v in meta.items() if k.startswith(("og:", "article:", "twitter:")) or k in ("description", "author", "date", "datepublished", "dc.date", "pubdate", "keywords")}
    out.metadata = keep
    m = TITLE_RE.search(html)
    out.title = meta.get("og:title") or (unescape(" ".join(m.group(1).split())) if m else "")
    out.description = meta.get("og:description") or meta.get("description", "")
    out.site_name = meta.get("og:site_name", "")
    out.published = (meta.get("article:published_time") or meta.get("datepublished") or meta.get("date") or meta.get("dc.date")
                     or meta.get("pubdate") or (JSONLD_DATE_RE.search(html).group(1) if JSONLD_DATE_RE.search(html) else ""))
    if m := LINK_CANON_RE.search(html):
        out.canonical = _attrs(m.group(0)).get("href", "")
    if m := HTML_LANG_RE.search(html[:5000]):
        out.language = m.group(1).split("-")[0].lower()
    if base_url:
        own = _site(urlsplit(base_url).hostname or "")
        links = []
        for href in HREF_RE.findall(html):
            u = urljoin(base_url, unescape(href))
            host = _site(urlsplit(u).hostname or "")
            if u.startswith("http") and host and host != own and u not in links:
                links.append(u)
        out.links = links[:200]
    return out


def extract_html(html: str, url: str = "", *, deduplicate: bool = True) -> Extracted:
    """Main text by trafilatura (no comments, no tables), plus html_metadata(). Dates through dateparser when the page
    gives none in its metadata.

    deduplicate=False for evidence packs (ingest/prefetch.py): trafilatura's de-duplication remembers paragraphs
    across calls in the process, so a page read a second time (a refresh, a second task) would come back without
    the paragraphs it had already seen."""
    import trafilatura

    out = html_metadata(html, url)
    text = trafilatura.extract(html, url=url or None, include_comments=False, include_tables=False, favor_precision=True, deduplicate=deduplicate) or ""
    out.text = text.strip()
    if not out.title:
        md = trafilatura.extract_metadata(html)
        if md and md.title:
            out.title = md.title
    if not out.published:
        md = trafilatura.extract_metadata(html)
        if md and md.date:
            out.published = md.date
    if not out.language and out.text:
        out.language = guess_language(out.text)
    return out


def parse_date(value: str):
    """An aware datetime from a date string in any common format (dateparser), or None."""
    if not value:
        return None
    import dateparser

    return dateparser.parse(value, settings={"RETURN_AS_TIMEZONE_AWARE": True, "TO_TIMEZONE": "UTC", "PREFER_DAY_OF_MONTH": "first"})


STOPWORDS = {
    "en": {"the", "and", "of", "to", "in", "is", "that", "for", "on", "with", "was", "as", "by", "at"},
    "fr": {"le", "la", "les", "et", "des", "du", "est", "que", "une", "dans", "pour", "sur"},
    "es": {"el", "la", "los", "las", "y", "de", "que", "en", "un", "una", "por", "con", "para"},
    "de": {"der", "die", "das", "und", "ist", "nicht", "mit", "von", "den", "auf", "für", "ein"},
    "pt": {"o", "a", "os", "as", "e", "de", "que", "em", "um", "uma", "para", "com", "não"},
    "it": {"il", "lo", "la", "gli", "le", "e", "di", "che", "un", "una", "per", "con", "non"},
}


def guess_language(text: str) -> str:
    """A cheap stopword vote among a few languages (enough to tell an English page from another)."""
    words = re.findall(r"[^\W\d_]+", text.lower()[:5000])
    if len(words) < 8:
        return ""
    scores = {lang: sum(w in sw for w in words) for lang, sw in STOPWORDS.items()}
    lang, best = max(scores.items(), key=lambda kv: (kv[1], kv[0] == "en"))
    return lang if best >= 3 else ""
