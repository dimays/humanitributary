"""Evidence packs: the `prefetch_sources` job (docs/adr/0036-evidence-packs.md).

For every queued `write_event`, `fill_gap` and `verify_claim` task, the pages an agent would read are fetched ahead
of time, from publishers whose policy is `allowed` only, and the task's payload gets compact, verifiable passages:

    evidence_pack: [{url, title, publisher, tier, fetched_at, doc_id, words, passages: [{text, score, matches}]}]
    unreadable:    [{url, reason, detail}]   (browser_only, forbidden, never_fetch, robots, blocked, http_<n>, error, …)
    evidence_ready, evidence_pack_at, evidence_urls (the sha256 of the URLs it was built from)

1. **Candidate URLs** (`candidates`): the task's `sources`, `suggested_sources`, gap `pointers`, the claim's cited
   pages, the story's (or the branch's) Wikipedia article, and, for a story about an SEC filing, the filing on EDGAR
   (`edgar_urls`). At most `urls` (12) a task, citations and sources first.
2. **Policy before anything** (`policy_reason`): NEVER_FETCH, the publisher's `fetch_policy` (a `browser_only` page
   is never requested: it goes in `unreadable` for an agent's browser), then the Fetcher's own checks (robots.txt,
   bot walls) when it requests. A host that blocked us or refused by robots.txt in the last `HOST_COOLDOWN_DAYS` is
   not asked again (`host_refusal`, read from the page rows: each row is that host's health record).
3. **Fetch** through `ingest.http.Fetcher` (the honest `INGEST_USER_AGENT`, delays, robots, backoff), with a
   conditional GET for a page already stored (`etag`, `last_modified`), and English Wikipedia through the MediaWiki
   API (TextExtracts' plain text). A stored page younger than `REFRESH_DAYS` is reused with no request. Capped per run
   (`per_run` requests) and per host (`per_host`); what the caps leave is `deferred` and tried next run.
4. **Store** (`store_page`): raw bytes and the clean main text (`ingest.extract.extract_html`, the existing
   extractor) in the private `raw` object store by content hash (`pages/raw/…`, `pages/text/…`), only for an
   `allowed` publisher (checked again just before writing), with `retain_until` from the retention settings.
5. **Passages** (`ingest/passages.py`): sentences ranked against the task's dates, years, numbers, entities and
   title words; the top `passages` (5) per page, the whole pack at most `pack_bytes` (20,000) of JSON.
6. **Retention** (`purge`): pages past `retain_until` lose their text and bytes in the store; packs that quoted them
   lose those passages. The row stays (`purged`).

Deterministic: no LLM, the same pages and task give the same pack. Nothing here is canonical or published.
"""

import hashlib
import json
import re
from collections import Counter
from datetime import timedelta
from typing import NamedTuple
from urllib.parse import quote, unquote, urlsplit

from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from evidence.publishers import domain_of
from infra import storage
from work.models import AgentTask

from . import passages as P
from . import policy
from .extract import canonical_url, extract_html, guess_language
from .http import FetchError, Refused
from .models import Entity, PrefetchedPage

KINDS = ("write_event", "fill_gap", "verify_claim")
# The payload keys this job owns: the jobs that refresh a queued task's payload (process, gap_waves) keep them.
PAYLOAD_KEYS = ("evidence_pack", "unreadable", "evidence_ready", "evidence_pack_at", "evidence_urls")

DEFAULTS = {"tasks": 40, "scan": 400, "per_run": 60, "per_host": 8, "urls": 12, "passages": 5, "pack_bytes": 20_000, "purge": 500}
REFRESH_DAYS = 7          # a stored page younger than this is reused without a request
RETRY_DAYS = 3            # an unreadable page (404, error) is asked again after this
HOST_COOLDOWN_DAYS = 14   # a host that blocked us or refused by robots.txt is left alone this long (as link health does)
MAX_BYTES = 5_000_000
MAX_TEXT_CHARS = 400_000
MIN_TEXT_WORDS = 40
OPEN_LICENSE_RE = re.compile(r"\bCC[ -]?(0|BY)|public domain|Open Government Licen[cs]e", re.I)
HTML_TYPES = ("text/html", "application/xhtml+xml")
# The W3C TDM Reservation Protocol: a page that reserves text and data mining (the `tdm-reservation: 1` header or
# meta tag) is never stored, whatever its publisher's policy says; an agent reads it by hand.
TDM_META_RE = re.compile(rb"<meta[^>]+name=[\"']tdm-reservation[\"'][^>]+content=[\"']1[\"']|<meta[^>]+content=[\"']1[\"'][^>]+name=[\"']tdm-reservation[\"']", re.I)
WIKI_RE = re.compile(r"^https://en\.wikipedia\.org/wiki/([^?#]+)")

# Stories about a filing with the US Securities and Exchange Commission: the filing itself, from EDGAR.
SEC_FORM_RE = re.compile(r"\b(8-K|10-K|10-Q|20-F|6-K|S-1|S-4|F-1|DEF 14A|13D|13G|Form 4)\b|\bSEC filing|\bfiled with the (?:U\.S\. )?Securities and Exchange Commission", re.I)
EDGAR_FORMS = ("8-K", "10-K", "10-Q", "20-F", "6-K", "S-1", "S-4", "F-1", "DEF 14A", "SC 13D", "SC 13G", "4")
EDGAR_SUBMISSIONS = "https://data.sec.gov/submissions/CIK{cik:0>10}.json"
EDGAR_DOC = "https://www.sec.gov/Archives/edgar/data/{cik}/{acc}/{doc}"
EDGAR_DAYS = 3


# ── keys and policy ──────────────────────────────────────────────────────────────────────────────────────────────

def page_key(url: str) -> str:
    """The URL a page is stored under, and what citations match on: canonical (https, no www., no fragment or
    tracking), and an English Wikipedia article by its title (decoded, spaces as underscores)."""
    u = canonical_url(url)
    m = re.match(r"^https://(?:en\.)?wikipedia\.org/wiki/(.+)$", u.replace("://en.m.", "://en."))
    if m and u.startswith("https://en.wikipedia.org/"):
        return "https://en.wikipedia.org/wiki/" + quote(unquote(m.group(1)).replace(" ", "_"), safe="()_,'!:-./")
    return u


def is_wikipedia(url: str) -> bool:
    return domain_of(url) == "wikipedia.org"


def policy_reason(fetcher, url: str) -> tuple[str, str]:
    """(reason, detail) when the source policy forbids a job to fetch `url`, else ("", ""). A browser_only
    publisher is named as such even when NEVER_FETCH also lists it: that is what tells an agent to open a browser."""
    if urlsplit(url).scheme not in ("http", "https"):
        return "unsupported", "not an http(s) URL"
    pol = fetcher._publisher_policy(domain_of(url))
    if pol and pol != "allowed":
        return pol, f"publisher {domain_of(url)} is {pol}"
    if why := policy.never_fetch_reason(url):
        return "never_fetch", why[:300]
    if not rated(url):
        return "unrated", f"{domain_of(url)} has no rating: a job fetches only publishers whose terms were read and rated allowed"
    return "", ""


def rated(url: str) -> bool:
    """The publisher (the nearest Publisher row for the domain or a parent) has a tier: someone rated it, its terms
    read (ADR 0036). An unknown domain, or a row the import made without a rating, is not fetched by this job."""
    pub = _publisher(url)
    return pub is not None and pub.tier is not None


def host_refusal(host: str, now) -> str:
    """A host that blocked us or refused by robots.txt lately: its rows are its health record."""
    row = (PrefetchedPage.objects.filter(host=host, status="unreadable", reason__in=["blocked", "robots"],
                                         checked_at__gte=now - timedelta(days=HOST_COOLDOWN_DAYS))
           .order_by("-checked_at").values_list("reason", "checked_at").first())
    return row[0] if row else ""


def retention_days(publisher) -> int:
    lic = getattr(publisher, "license", "") or ""
    if OPEN_LICENSE_RE.search(lic):
        return settings.EVIDENCE_RETENTION_DAYS_OPEN
    return settings.EVIDENCE_RETENTION_DAYS


def _publisher(url: str):
    from evidence.models import Publisher

    parts = domain_of(url).split(".")
    rows = {p.domain: p for p in Publisher.objects.filter(domain__in=[".".join(parts[i:]) for i in range(len(parts) - 1)])}
    for i in range(len(parts) - 1):
        if ".".join(parts[i:]) in rows:
            return rows[".".join(parts[i:])]
    return None


# ── what a task points at ─────────────────────────────────────────────────────────────────────────────────────────

def _wiki_url(title: str) -> str:
    return "https://en.wikipedia.org/wiki/" + quote(title.replace(" ", "_"), safe="()_,'!:-./")


class Cand(NamedTuple):
    key: str        # what the page is stored under and citations match on (page_key)
    url: str        # what is requested (the URL as given, less fragment and tracking parameters)
    why: str        # citation, source, suggested, pointer, edgar, wikipedia
    hit: dict       # the lookup hit it came from ({adapter, ids, …}), or {}: what an API route reads


def candidates(task: AgentTask, limit: int) -> list[Cand]:
    """The pages a task points at, most useful first, at most `limit`."""
    p = task.payload or {}
    out = []
    if task.kind == "verify_claim":
        out += [(e.get("url"), "citation", {}) for e in p.get("evidence", [])]
        if "evidence" not in p and task.target_claim_id:  # second_source's tasks name the claim, not its citations
            from evidence.models import Evidence

            out += [(u, "citation", {}) for u in Evidence.objects.filter(claim_id=task.target_claim_id).order_by("position").values_list("citation__url", flat=True)]
        out += [(s.get("url"), "suggested", s) for s in p.get("suggested_sources", [])]
    elif task.kind == "write_event":
        out += [(s.get("url"), "source", {}) for s in p.get("sources", [])]
        out += [(u, "edgar", {}) for u in p.get("_edgar", [])]
        out += [(s.get("url"), "suggested", s) for s in p.get("suggested_sources", [])]
        if p.get("story_article"):
            out.append((p["story_article"], "wikipedia", {}))
    elif task.kind == "fill_gap":
        ptr = p.get("pointers") or {}
        out += [(h.get("url"), "pointer", h) for h in ptr.get("lookups", [])]
        out += [(s.get("url"), "pointer", {}) for s in ptr.get("wikipedia_sections", [])]
        out += [(_wiki_url(t), "pointer", {}) for t in ptr.get("pages", [])]
        b = p.get("branch") or {}
        if b.get("article"):
            out.append((_wiki_url(b["article"]), "wikipedia", {}))
    seen, keep = set(), []
    for u, why, hit in out:
        if not isinstance(u, str) or not u.startswith(("http://", "https://")):
            continue
        k = page_key(u)
        if k not in seen:
            seen.add(k)
            keep.append(Cand(k, _fetchable(u, k), why, {"adapter": hit.get("adapter", ""), "ids": hit.get("ids") or {}} if hit else {}))
    # Citations and sources first, then lookups, then Wikipedia; at most a third of the slots for Wikipedia pages.
    non_wiki = [x for x in keep if not is_wikipedia(x.key)]
    wiki = [x for x in keep if is_wikipedia(x.key)]
    n_wiki = min(len(wiki), max(1, limit // 3))
    return (non_wiki[: limit - n_wiki] + wiki[:n_wiki])[:limit]


def _fetchable(url: str, key: str) -> str:
    """The URL to request: Wikipedia by its key (the API reads the title); else the given host and path, https, no
    fragment or tracking parameters."""
    if is_wikipedia(key):
        return key
    from urllib.parse import urlunsplit

    k, u = urlsplit(key), urlsplit(url)
    return urlunsplit(("https" if u.scheme == "https" else u.scheme, u.netloc.lower(), k.path, k.query, ""))


def terms_for(task: AgentTask) -> P.Terms:
    """What the task is about, for ranking passages: dates, years, numbers, entities, title words."""
    p = task.payload or {}
    t = P.Terms()
    qids = []
    if task.kind == "write_event":
        s = p.get("suggested") or {}
        t.add_text_dates(s.get("when") or "")
        for d in (s.get("first_date"), s.get("last_date")):
            t.add_iso(d)
        t.add_words(s.get("title_hint") or "")
        for it in (p.get("items") or [])[:4]:
            t.add_text_dates(it.get("text") or "")
            t.add_words(it.get("text") or "", limit=24)
        for e in p.get("entities", [])[:15]:
            if e.get("kind") != "concept":
                t.add_entity(e.get("label", ""), e.get("qid", ""))
                qids.append(e.get("qid"))
    elif task.kind == "fill_gap":
        w = p.get("window") or {}
        if "from" in w and "to" in w:
            t.year_range = (w["from"], w["to"])
        b = p.get("branch") or {}
        t.add_entity(b.get("name", ""))
        if b.get("article") and b.get("article") != b.get("name"):
            t.add_entity(b["article"])
        for q in b.get("qids", [])[:5]:
            t.add_entity(q.get("label", ""), q.get("qid", ""))
            qids.append(q.get("qid"))
        t.add_words(b.get("name", ""))
    else:  # verify_claim, from the sweep (claim, entry) or from second_source (entry slug, value)
        entry = p.get("entry")
        if isinstance(entry, str):
            from timeline.models import Entry

            e = Entry.objects.filter(slug=entry).first()
            entry = _entry_brief(e) if e else {}
        entry = entry or {}
        title = entry.get("title") or entry.get("name") or ""
        t.add_words(title)
        t.add_text_dates(" ".join(str(entry.get(k) or "") for k in ("when", "start_when", "end_when")))
        value = (p.get("claim") or {}).get("value", p.get("value"))
        flat = _flatten(value)
        t.add_text_dates(flat)
        t.add_words(flat, limit=24)
        for part in p.get("parts", []):
            t.add_text_dates(_flatten(part.get("value")))
        if title:
            t.add_entity(title)
    # Entity aliases (Wikidata), so "the US" finds "United States".
    for e in Entity.objects.filter(qid__in=[q for q in qids if q]).only("qid", "label", "aliases").order_by("qid"):
        for a in (e.aliases or [])[:4]:
            if len(a) >= 4:
                t.add_entity(a, e.qid)
    return t


def _entry_brief(e) -> dict:
    x = e.concrete
    return {"title": getattr(x, "title", ""), "name": getattr(x, "name", ""), "when": getattr(x, "when", ""),
            "start_when": getattr(x, "start_when", ""), "end_when": getattr(x, "end_when", "")}


def _flatten(v) -> str:
    if isinstance(v, dict):
        return " ".join(_flatten(x) for x in v.values())
    if isinstance(v, list):
        return " ".join(_flatten(x) for x in v)
    return "" if v is None else str(v)


# ── EDGAR ────────────────────────────────────────────────────────────────────────────────────────────────────────

def edgar_urls(fetcher, task: AgentTask, counts: Counter, budget: list) -> list[str]:
    """For a story about an SEC filing: the filings on EDGAR of its companies (Wikidata P5531, the Central Index Key)
    of the named form, filed within EDGAR_DAYS of the story's dates. The submissions API is EDGAR's published
    route (no crawling); a filing's own document is under /Archives/edgar/data, which robots.txt allows."""
    p = task.payload or {}
    text = " ".join([(p.get("suggested") or {}).get("title_hint") or ""] + [i.get("text") or "" for i in p.get("items", [])[:6]])
    m = SEC_FORM_RE.findall(text)
    if not m:
        return []
    named = {f.upper() for f in m if f}
    forms = [f for f in EDGAR_FORMS if f in named or f"SC {f}" in named or (f == "4" and "FORM 4" in named)] or ["8-K", "10-K", "10-Q", "20-F", "6-K"]
    orgs = [e["qid"] for e in p.get("entities", []) if e.get("kind") == "org" and e.get("qid")][:3]
    if not orgs:
        return []
    ents = {e.qid: e for e in Entity.objects.filter(qid__in=orgs)}
    missing = [q for q in orgs if q in ents and "P5531" not in (ents[q].facts or {})]
    if missing and budget[0] > 0:
        from .wikidata import _sparql

        budget[0] -= 1
        try:
            rows = _sparql(fetcher, "SELECT ?item ?cik WHERE { VALUES ?item { %s } ?item wdt:P5531 ?cik }" % " ".join(f"wd:{q}" for q in missing))
        except Exception:  # noqa: BLE001 — a lookup that fails leaves the pack without EDGAR
            rows, counts["edgar_lookup_errors"] = None, counts["edgar_lookup_errors"] + 1
        if rows is not None:
            found = {b["item"]["value"].rsplit("/", 1)[-1]: b["cik"]["value"] for b in rows}
            for q in missing:
                ents[q].facts = {**(ents[q].facts or {}), "P5531": found.get(q, "")}
                Entity.objects.filter(pk=ents[q].pk).update(facts=ents[q].facts)
    lo, hi = (p.get("suggested") or {}).get("first_date"), (p.get("suggested") or {}).get("last_date")
    if not lo:
        return []
    from datetime import date

    d0, d1 = date.fromisoformat(lo[:10]) - timedelta(days=EDGAR_DAYS), date.fromisoformat((hi or lo)[:10]) + timedelta(days=EDGAR_DAYS)
    out = []
    for q in orgs:
        cik = (ents.get(q).facts or {}).get("P5531") if q in ents else ""
        if not cik or not str(cik).isdigit() or budget[0] <= 0:
            continue
        budget[0] -= 1
        try:
            r = fetcher.get(EDGAR_SUBMISSIONS.format(cik=cik))
        except (Refused, FetchError):
            counts["edgar_lookup_errors"] += 1
            continue
        if not r.ok:
            counts["edgar_lookup_errors"] += 1
            continue
        recent = (r.json().get("filings") or {}).get("recent") or {}
        for acc, day, form, doc in zip(recent.get("accessionNumber", []), recent.get("filingDate", []), recent.get("form", []), recent.get("primaryDocument", [])):
            if form in forms and doc and d0 <= date.fromisoformat(day) <= d1:
                out.append(EDGAR_DOC.format(cik=int(cik), acc=acc.replace("-", ""), doc=doc))
            if len(out) >= 2:
                break
    counts["edgar_filings"] += len(out)
    return out


# ── reading and storing a page ───────────────────────────────────────────────────────────────────────────────────

def _store_key(kind: str, h: str) -> str:
    return f"pages/{kind}/{h[:2]}/{h}"


def _unreadable(page: PrefetchedPage | None, url: str, reason: str, detail: str, now, *, http_status=None, fetch_url: str = "") -> PrefetchedPage:
    fetch_url = fetch_url or url
    page = page or PrefetchedPage(url=url, fetched_url=fetch_url, host=(urlsplit(fetch_url).hostname or "").lower(), fetched_at=now)
    if page.status == PrefetchedPage.Status.STORED:
        # A stored copy stays usable after a failed refresh; only the check is recorded.
        page.checked_at, page.detail = now, f"refresh failed: {reason}: {detail}"[:500]
    else:
        page.status, page.reason, page.detail, page.http_status, page.checked_at = PrefetchedPage.Status.UNREADABLE, reason, detail[:500], http_status, now
    page.save()
    return page


def store_page(page: PrefetchedPage | None, *, url: str, fetched_url: str, final_url: str, publisher, raw: bytes, text: str, title: str,
               language: str, content_type: str, http_status: int, etag: str, last_modified: str, now, fetcher, policy_url: str = "",
               via: str = "", detail: str = "") -> PrefetchedPage:
    """Write raw bytes and clean text to the private store and record the page. Refuses anything but a rated,
    `allowed` publisher (of the page, or of the API that answered: `policy_url`), checked again here, so a policy
    change between the request and the write can't store a page."""
    check = policy_url or final_url or url
    why, _ = policy_reason(fetcher, check)
    if why:
        raise Refused(f"{domain_of(check)} is {why}: its text is never stored")
    text = text[:MAX_TEXT_CHARS]
    rh, th = hashlib.sha256(raw).hexdigest(), hashlib.sha256(text.encode()).hexdigest()
    storage.write(storage.RAW, _store_key("raw", rh), raw)
    storage.write(storage.RAW, _store_key("text", th), text.encode())
    page = page or PrefetchedPage(url=url, host=(urlsplit(fetched_url or url).hostname or "").lower())
    page.fetched_url, page.final_url, page.publisher, page.status, page.reason, page.detail = fetched_url, final_url, publisher, "stored", "", detail[:500]
    page.via = via
    page.http_status, page.fetched_at, page.checked_at, page.etag, page.last_modified = http_status, now, now, etag[:300], last_modified[:100]
    page.content_type, page.raw_hash, page.raw_key, page.text_hash, page.text_key = content_type[:100], rh, _store_key("raw", rh), th, _store_key("text", th)
    page.words, page.title, page.language = P.words(text), title[:500], language[:20]
    page.retain_until, page.purged_at = now + timedelta(days=retention_days(publisher)), None
    page.save()
    return page


def read_text(page: PrefetchedPage) -> str | None:
    """The stored clean text, or None (unreadable, purged, or missing from the store)."""
    if page.status != PrefetchedPage.Status.STORED or not page.text_key:
        return None
    try:
        return storage.read(storage.RAW, page.text_key).decode()
    except (FileNotFoundError, OSError):
        return None


def stored(url: str, *, pages_only: bool = False) -> PrefetchedPage | None:
    """The stored page for a cited URL, if the store has its text. pages_only: not an API's record of it (`via`),
    which holds less than the page itself (what auto-verify needs)."""
    qs = PrefetchedPage.objects.filter(url=page_key(url), status="stored").exclude(text_key="").select_related("publisher")
    return qs.filter(via="").first() if pages_only else qs.first()


def _fetch_wikipedia(fetcher, url: str, page, now):
    from .wikidata import api_get

    title = unquote(WIKI_RE.match(url).group(1)).replace("_", " ")
    data = api_get(fetcher, {"action": "query", "prop": "extracts|info", "explaintext": "1", "exsectionformat": "plain", "redirects": "1", "titles": title})
    pages = (data.get("query") or {}).get("pages") or []
    if not pages or pages[0].get("missing") or not pages[0].get("extract"):
        return None, ("http_404", f"no English Wikipedia article {title!r}")
    pg = pages[0]
    raw = json.dumps(data, sort_keys=True, ensure_ascii=False).encode()
    return dict(raw=raw, text=pg["extract"], title=pg.get("title", title), language="en", content_type="application/json (MediaWiki API, TextExtracts)",
                http_status=200, etag=f"rev:{pg.get('lastrevid', '')}", last_modified="", final_url=_wiki_url(pg.get("title", title))), None


def _fetch_page(fetcher, url: str, page, now):
    r = fetcher.get(url, etag=page.etag if page and page.status == "stored" else "", last_modified=page.last_modified if page and page.status == "stored" else "")
    if r.not_modified:
        return "not_modified", None
    if r.blocked or r.status in (401, 403, 429, 451):
        return None, ("blocked", f"HTTP {r.status}" + (": a bot challenge" if r.blocked else ""), r.status)
    if not r.ok:
        return None, (f"http_{r.status}", f"HTTP {r.status}", r.status)
    if len(r.content) > MAX_BYTES:
        return None, ("too_large", f"{len(r.content)} bytes", r.status)
    ctype = (r.headers.get("content-type") or "").split(";")[0].strip().lower()
    if (r.headers.get("tdm-reservation") or "").strip() == "1" or TDM_META_RE.search(r.content[:200_000]):
        return None, ("tdm_reserved", "the page reserves text and data mining (TDMRep): read it by hand", r.status)
    if ctype in HTML_TYPES or (not ctype and r.content.lstrip()[:1] == b"<"):
        ex = extract_html(r.text, r.final_url, deduplicate=False)
        text, title, lang = ex.text, ex.title, ex.language
    elif ctype == "text/plain":
        text, title, lang = r.text, "", guess_language(r.text)
    else:
        return None, ("unsupported", ctype or "no content type", r.status)
    if P.words(text) < MIN_TEXT_WORDS:
        return None, ("empty", f"{P.words(text)} words of main text", r.status)
    return dict(raw=r.content, text=text, title=title, language=lang, content_type=ctype, http_status=r.status, etag=r.headers.get("etag", ""),
                last_modified=r.headers.get("last-modified", ""), final_url=page_key(r.final_url)), None


def _caps(host: str, budget: list, per_host: Counter, host_cap: int, counts: Counter) -> bool:
    if budget[0] <= 0 or per_host[host] >= host_cap * (3 if host in policy.API_HOSTS else 1):
        counts["deferred"] += 1
        return False
    budget[0] -= 1
    per_host[host] += 1
    counts["requests"] += 1
    return True


def read(fetcher, url: str, now, counts: Counter, budget: list, per_host: Counter, host_cap: int, *, fetch_url: str = "",
         hit: dict | None = None) -> tuple[PrefetchedPage | None, str, str]:
    """→ (page or None, reason, detail) for the page stored under `url` (a page key), requested at `fetch_url`. A
    fresh stored or recent unreadable row is reused with no request. A catalog page with an official API (an
    OpenAlex work, a DOI, a Library of Congress item, a Smithsonian or Europeana record: ingest/prefetch_api.py) is
    read through the API and never as a page: those pages refuse scripts (robots.txt, bot walls), and a bot wall on
    loc.gov would also refuse its JSON API for the rest of the run. Stored with `via` naming the API."""
    from . import prefetch_api

    fetch_url = fetch_url or url
    page = PrefetchedPage.objects.filter(url=url).select_related("publisher").first()
    reason, detail = policy_reason(fetcher, fetch_url)
    if reason and reason != "unrated":
        return None, reason, detail
    if page and page.status == "stored" and page.checked_at >= now - timedelta(days=REFRESH_DAYS) and read_text(page) is not None:
        counts["pages_reused"] += 1
        return page, "", ""
    route = prefetch_api.route(url if is_wikipedia(url) else fetch_url, hit)
    recent = page and page.status == "unreadable" and page.checked_at >= now - timedelta(days=RETRY_DAYS)
    host = (urlsplit(fetch_url).hostname or "").lower()
    if isinstance(route, prefetch_api.Route) and not (recent and page.reason.startswith("api_")):
        return read_api(fetcher, url, route, page, now, counts, budget, per_host, host_cap)
    if reason:  # unrated, with no API
        return None, reason, detail if route != "api_key_missing" else f"{detail}; its API needs a key that isn't set"
    if recent:
        counts["unreadable_reused"] += 1
        return None, page.reason, page.detail
    if host not in policy.API_HOSTS and (why := host_refusal(host, now)):
        return None, why, f"{host} refused automated readers within {HOST_COOLDOWN_DAYS} days"
    if not _caps(host, budget, per_host, host_cap, counts):
        return None, "deferred", "this run's request cap was reached: tried again next run"
    try:
        got, err = _fetch_wikipedia(fetcher, url, page, now) if WIKI_RE.match(url) else _fetch_page(fetcher, fetch_url, page, now)
    except Refused as e:
        msg = str(e)
        reason = "robots" if "robots.txt" in msg else "blocked" if "bot challenge" in msg else policy_reason(fetcher, fetch_url)[0] or "refused"
        counts[f"refused_{reason}"] += 1
        p = _unreadable(page, url, reason, msg, now, fetch_url=fetch_url)
        return (p, "", "") if p.status == "stored" else (None, reason, msg[:300])
    except (FetchError, RuntimeError, ValueError) as e:
        counts["errors"] += 1
        p = _unreadable(page, url, "error", f"{type(e).__name__}: {e}"[:300], now, fetch_url=fetch_url)
        return (p if p.status == "stored" else None), ("" if p.status == "stored" else "error"), str(e)[:300]
    if got == "not_modified":
        page.checked_at = page.fetched_at = now
        page.retain_until = now + timedelta(days=retention_days(page.publisher))
        page.save(update_fields=["checked_at", "fetched_at", "retain_until"])
        counts["not_modified"] += 1
        return page, "", ""
    if err:
        reason, detail, *status = err
        counts[f"unreadable_{reason}"] += 1
        p = _unreadable(page, url, reason, detail, now, http_status=status[0] if status else None, fetch_url=fetch_url)
        return (p, "", "") if p.status == "stored" else (None, reason, detail)
    try:
        page = store_page(page, url=url, fetched_url=fetch_url, publisher=_publisher(got["final_url"] or url), now=now, fetcher=fetcher, **got)
    except Refused as e:  # a redirect to a publisher whose text we don't keep
        reason = policy_reason(fetcher, got["final_url"])[0] or "refused"
        p = _unreadable(page, url, reason, str(e), now, fetch_url=fetch_url)
        return (p, "", "") if p.status == "stored" else (None, reason, str(e)[:300])
    counts["pages_stored"] += 1
    return page, "", ""


def read_api(fetcher, url: str, route, page, now, counts: Counter, budget: list, per_host: Counter, host_cap: int):
    """The page's record from its official API (ingest/prefetch_api.py), stored under the page's key with `via` set
    to the API, the API's publisher (rated, allowed: checked like a page) and the terms clause relied on. A route
    whose API answers 404 tries its fallback (a DOI: OpenAlex, then Crossref)."""
    from . import prefetch_api

    while route is not None:
        why, detail = policy_reason(fetcher, route.api_url)
        if why:
            return None, f"api_{why}", detail
        host = (urlsplit(route.api_url).hostname or "").lower()
        if not _caps(host, budget, per_host, host_cap, counts):
            return None, "deferred", "this run's request cap was reached: tried again next run"
        try:
            r = fetcher.get(route.api_url, headers=route.headers)
        except Refused as e:
            reason = "api_robots" if "robots.txt" in str(e) else "api_blocked"
            p = _unreadable(page, url, reason, str(e), now, fetch_url=route.api_url)
            return (p, "", "") if p.status == "stored" else (None, reason, str(e)[:300])
        except FetchError as e:
            counts["errors"] += 1
            return None, "api_error", str(e)[:300]
        if r.status == 404 and route.fallback is not None:
            route = route.fallback
            continue
        if not r.ok or r.blocked:
            reason = f"api_http_{r.status}"
            p = _unreadable(page, url, reason, f"{route.name} API answered HTTP {r.status}", now, http_status=r.status, fetch_url=route.api_url)
            return (p, "", "") if p.status == "stored" else (None, reason, f"{route.name} API answered HTTP {r.status}")
        try:
            title, text = prefetch_api.render(route.name, r.json())
        except (ValueError, TypeError, KeyError, AttributeError) as e:
            return None, "api_error", f"{route.name}: {type(e).__name__}"
        if P.words(text) < 5:
            p = _unreadable(page, url, "api_empty", f"{route.name} API: {P.words(text)} words", now, fetch_url=route.api_url)
            return (p, "", "") if p.status == "stored" else (None, "api_empty", f"{route.name} API returned no text")
        page = store_page(page, url=url, fetched_url=route.api_url, final_url=url, publisher=_publisher(route.api_url), raw=r.content, text=text,
                          title=title, language="", content_type=f"application/json ({route.name} API)", http_status=r.status,
                          etag=r.headers.get("etag", ""), last_modified=r.headers.get("last-modified", ""), now=now, fetcher=fetcher,
                          policy_url=route.api_url, via=route.name, detail=f"via the {route.name} API ({route.clause})")
        counts[f"api_{route.name}"] += 1
        counts["pages_stored"] += 1
        return page, "", ""
    return None, "api_error", "no route"


# ── the pack ─────────────────────────────────────────────────────────────────────────────────────────────────────

def pack_entry(page: PrefetchedPage, cited_url: str, terms: P.Terms, n: int) -> dict:
    text = read_text(page) or ""
    pub = page.publisher
    return {"url": cited_url, "title": page.title, "publisher": pub.domain if pub else domain_of(page.url), "tier": pub.tier if pub else None,
            "fetched_at": page.fetched_at.isoformat(timespec="seconds"), "doc_id": page.pk, "words": page.words,
            "passages": [x.as_json() for x in P.rank(text, terms, n)]} | ({"via": "api", "api": page.via} if page.via else {})


def _size(x) -> int:
    return len(json.dumps(x, ensure_ascii=False, separators=(",", ":")).encode())


def fit(pack: list[dict], cap: int) -> list[dict]:
    """Trim passages, worst first (the last passage of the last page), until the pack is at most `cap` bytes of
    JSON; then drop pages from the end. Every page that stays keeps its doc_id: its full text is one GET away."""
    pack = [dict(e, passages=list(e["passages"])) for e in pack]
    while _size(pack) > cap and any(e["passages"] for e in pack):
        e = max((e for e in pack if e["passages"]), key=lambda e: (len(e["passages"]), pack.index(e)))
        e["passages"].pop()
    while _size(pack) > cap and pack:
        pack.pop()
    return pack


def _order(e: dict) -> tuple:
    return (e["publisher"] == "wikipedia.org", e["tier"] if e["tier"] is not None else 5, -max([p["score"] for p in e["passages"]] or [0]))


# Bumped when what a pack holds changes (the rules, the APIs), so every queued task is packed again.
PACK_VERSION = 2


def urls_sha(urls: list[str]) -> str:
    return hashlib.sha256((f"v{PACK_VERSION}\n" + "\n".join(sorted(urls))).encode()).hexdigest()[:16]


def build(fetcher, task: AgentTask, opts: dict, now, counts: Counter, budget: list, per_host: Counter) -> dict:
    """The payload keys for one task (PAYLOAD_KEYS)."""
    base = [c.key for c in candidates(task, opts["urls"])]  # what needs_pack compares against
    if task.kind == "write_event":
        p = dict(task.payload or {})
        p["_edgar"] = edgar_urls(fetcher, task, counts, budget)
        task = AgentTask(pk=task.pk, kind=task.kind, payload=p)
    urls = candidates(task, opts["urls"])
    terms = terms_for(task)
    pack, unreadable = [], []
    for c in urls:
        page, reason, detail = read(fetcher, c.key, now, counts, budget, per_host, opts["per_host"], fetch_url=c.url, hit=c.hit)
        if page is not None:
            pack.append(pack_entry(page, c.key, terms, opts["passages"]))
        else:
            unreadable.append({"url": c.url, "reason": reason, "detail": detail[:200]})
    pack = fit(sorted(pack, key=_order), opts["pack_bytes"])
    deferred = any(u["reason"] == "deferred" for u in unreadable)
    return {"evidence_pack": pack, "unreadable": unreadable,
            "evidence_ready": any(e["publisher"] != "wikipedia.org" for e in pack),
            "evidence_pack_at": now.isoformat(timespec="seconds"),
            "evidence_urls": urls_sha(base) + ("+deferred" if deferred else "")}


def needs_pack(task: AgentTask, limit: int) -> bool:
    """No pack yet, a pack built from other URLs (the payload gained sources or pointers since), or one the caps cut short."""
    return (task.payload or {}).get("evidence_urls") != urls_sha([c.key for c in candidates(task, limit)])


def run(ctx) -> None:
    """The job: purge what retention says, then packs for the queued tasks that lack a current one, best first."""
    opts = {k: int(ctx.opt(k, v)) for k, v in DEFAULTS.items()}
    now = timezone.now()
    purge(now, ctx.counts, limit=opts["purge"])
    budget, per_host = [opts["per_run"]], Counter()
    scanned = AgentTask.objects.filter(kind__in=KINDS, status="queued").order_by("-priority", "created_at", "id")[: opts["scan"]]
    done = 0
    for t in scanned:
        if done >= opts["tasks"] or budget[0] <= 0:
            break
        if not needs_pack(t, opts["urls"]):
            continue
        keys = build(ctx.fetcher, t, opts, now, ctx.counts, budget, per_host)
        new = {**(t.payload or {}), **keys}
        # Only while still queued: a task an agent claimed meanwhile keeps the payload it was claimed with.
        if AgentTask.objects.filter(pk=t.pk, status="queued").update(payload=new):
            done += 1
            ctx.counts[f"packs_{t.kind}"] += 1
            ctx.counts["packs_ready" if keys["evidence_ready"] else "packs_not_ready"] += 1
            ctx.counts["passages"] += sum(len(e["passages"]) for e in keys["evidence_pack"])
    ctx.counts["tasks_packed"] = done


# ── retention ────────────────────────────────────────────────────────────────────────────────────────────────────

def purge(now, counts: Counter | None = None, *, limit: int = 500) -> int:
    """Pages past retain_until, and pages whose publisher is no longer rated and `allowed`: their text and bytes
    leave the store (unless another page still kept holds the same content), the row becomes `purged`, and the
    packs that quoted them lose those passages."""
    counts = counts if counts is not None else Counter()
    n = 0
    # Past retention, and pages whose publisher is no longer rated and allowed (a policy change, or stored before
    # the rule): neither keeps its text.
    unfit = Q(publisher__isnull=True) | Q(publisher__tier__isnull=True) | ~Q(publisher__fetch_policy="allowed")
    expired = list(PrefetchedPage.objects.filter(status="stored", retain_until__lt=now).order_by("retain_until", "id")[:limit])
    gone = list(PrefetchedPage.objects.filter(unfit, status="stored").exclude(pk__in=[p.pk for p in expired]).order_by("id")[: max(0, limit - len(expired))])
    counts["pages_unrated_purged"] += len(gone)
    for page in expired + gone:
        live = PrefetchedPage.objects.filter(status="stored", retain_until__gte=now).exclude(unfit).exclude(pk=page.pk)
        for field, key in (("raw_key", page.raw_key), ("text_key", page.text_key)):
            if key and not live.filter(**{field: key}).exists():
                try:
                    storage.delete(storage.RAW, key)
                except (FileNotFoundError, OSError):
                    pass
        page.status, page.raw_key, page.text_key, page.purged_at = PrefetchedPage.Status.PURGED, "", "", now
        page.save(update_fields=["status", "raw_key", "text_key", "purged_at"])
        for t in AgentTask.objects.filter(payload__evidence_pack__contains=[{"doc_id": page.pk}]).only("id", "payload"):
            pack = [dict(e, passages=[], purged=True) if e.get("doc_id") == page.pk else e for e in t.payload["evidence_pack"]]
            AgentTask.objects.filter(pk=t.pk).update(payload={**t.payload, "evidence_pack": pack})
            counts["packs_purged"] += 1
        n += 1
    counts["pages_purged"] += n
    return n


def health(since_days: int = 30) -> list[dict]:
    """Per host: pages stored and unreadable (by reason) in the last `since_days`, for the console and the coverage
    report: where sources are missing."""
    since = timezone.now() - timedelta(days=since_days)
    rows = Counter()
    for host, status, reason in PrefetchedPage.objects.filter(checked_at__gte=since).values_list("host", "status", "reason"):
        rows[(host, status if status != "unreadable" else reason)] += 1
    out = {}
    for (host, what), n in rows.items():
        out.setdefault(host, Counter())[what] += n
    return sorted(({"host": h, **c} for h, c in out.items()), key=lambda r: (-sum(v for k, v in r.items() if k != "host"), r["host"]))


def evidence_ready_q() -> Q:
    return Q(payload__evidence_ready=True)
