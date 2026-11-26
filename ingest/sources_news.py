"""Feeds that publish new items (only those whose terms allow automated reading: docs/adr/0009-ingest-source-policy.md):
RSS/Atom where permitted, WHO Disease
Outbreak News, Federal Register presidential documents, The Gazette's state notices, Nobel Prize announcements, and
the Office of the Historian's Milestones (TEI on GitHub, synced weekly for the lookup adapter).

News items keep metadata, a short lead (≤ 60 words) and the link: never the article's full text (source policy).
Each item is a Document and a Candidate (`news:<canonical url>`), its entities matched by name against known
entities (the alias matcher), and clustered with current-events candidates by the process job.
"""

import json
import re
from datetime import timedelta
from html import unescape

from django.utils import timezone

from .candidates import AliasMatcher, decimal_year, parse_any_date, publisher_for, set_document_entities, upsert_candidate, when_text
from .extract import canonical_url, lead
from .models import Document
from .store import save_document

TAG_RE = re.compile(r"<[^>]+>")


def strip_html(s: str) -> str:
    return " ".join(unescape(TAG_RE.sub(" ", s or "")).split())


class NewsWriter:
    """Turns one feed's items into Documents and Candidates."""

    def __init__(self, ctx, *, source: str, license: str = "all rights reserved", candidates: bool = True):
        self.ctx, self.source, self.license, self.candidates = ctx, source, license, candidates
        self._matcher = None
        self.max_age = int(ctx.opt("max_age_days", 7))

    @property
    def matcher(self):
        if self._matcher is None:
            self._matcher = AliasMatcher()
        return self._matcher

    def item(self, *, url: str, title: str, summary: str = "", published=None, metadata: dict | None = None, raw: dict | None = None,
             kind: str = "new_event", when: str = ""):
        ctx = self.ctx
        d = parse_any_date(published) if published else None
        if d and d < timezone.now().date() - timedelta(days=self.max_age):
            ctx.counts["items_too_old"] += 1
            return None
        curl = canonical_url(url)
        text = lead(strip_html(summary), 60)
        meta = {"source": self.source, "feed": ctx.feed.name if ctx.feed else "", **(metadata or {})}
        doc, state = save_document(
            canonical_url=curl, url=url, raw=json.dumps(raw or {"title": title, "summary": summary, "url": url, "published": str(published or "")}, sort_keys=True, ensure_ascii=False).encode(),
            feed=ctx.feed, publisher=publisher_for(url, actor=ctx.actor), title=title, published_at=_aware(d), language="en",
            license=self.license, extracted_text=text, metadata=meta,
        )
        ctx.counts[f"documents_{state}"] += 1
        mentions = self.matcher.match(f"{title}. {text}")
        if mentions:
            set_document_entities(doc, mentions)
        if not self.candidates or d is None:
            return doc
        _, cstate = upsert_candidate(
            f"news:{curl}", created_by=ctx.actor,
            values=dict(kind=kind, title=title[:300], summary=text, when_text=when or when_text(d), y_guess=decimal_year(d), precision="day",
                        details={"source": self.source, "date": d.isoformat(), "url": curl, "publisher": doc.publisher.domain if doc.publisher else "",
                                 "roles": {e.qid: "alias" for e in mentions}, "document_id": doc.pk, **(metadata or {})}),
            entities=list(mentions), documents=[doc],
        )
        ctx.counts[f"candidates_{cstate}"] += 1
        return doc


def _aware(d):
    return timezone.make_aware(timezone.datetime(d.year, d.month, d.day)) if d else None


def run_rss(ctx):
    """An RSS/Atom feed: conditional GET (ETag / Last-Modified), one Document + Candidate per recent item."""
    import feedparser

    feed = ctx.feed
    r = ctx.fetcher.get(feed.url, etag=feed.etag, last_modified=feed.last_modified)
    ctx.run.http_status = r.status
    if r.not_modified:
        ctx.counts["not_modified"] += 1
        return
    if not r.ok:
        raise RuntimeError(f"HTTP {r.status}")
    feed.etag, feed.last_modified = r.headers.get("etag", "")[:300], r.headers.get("last-modified", "")[:100]
    feed.save(update_fields=["etag", "last_modified"])
    parsed = feedparser.parse(r.content)
    w = NewsWriter(ctx, source="rss")
    for e in parsed.entries[: int(ctx.opt("max_items", 80))]:
        link = e.get("link") or ""
        if not link.startswith("http"):
            continue
        ctx.counts["items"] += 1
        # headline_only: sources whose terms allow the headline, date and link but no summary (un.org, UNESCO).
        summary = "" if ctx.opt("headline_only") else e.get("summary", "")
        w.item(url=link, title=strip_html(e.get("title", "")), summary=summary, published=e.get("published") or e.get("updated"),
               metadata={"guid": e.get("id", ""), "tags": [t.get("term") for t in e.get("tags", [])][:10]},
               raw={k: e.get(k, "") for k in ("id", "title", "link", "summary", "published", "updated")})


def run_gazette(ctx):
    """The Gazette's Atom data feed, keeping notices whose code starts with a configured prefix (11xx: State)."""
    import feedparser

    feed = ctx.feed
    r = ctx.fetcher.get(feed.url, params={"results-page-size": str(ctx.opt("page_size", 100))})
    ctx.run.http_status = r.status
    if not r.ok:
        raise RuntimeError(f"HTTP {r.status}")
    prefixes = tuple(ctx.opt("notice_code_prefixes", ["11"]))
    w = NewsWriter(ctx, source="gazette", license="Open Government Licence v3.0")
    for e in feedparser.parse(r.content).entries:
        code = next((str(v) for k, v in e.items() if k.endswith("notice-code")), "")
        ctx.counts["items"] += 1
        if not code.startswith(prefixes):
            ctx.counts["items_filtered"] += 1
            continue
        link = next((l["href"] for l in e.get("links", []) if l.get("rel") == "alternate" and "/notice/" in l.get("href", "") and "data." not in l["href"]), e.get("link", ""))
        w.item(url=link, title=strip_html(e.get("title", "")), summary=e.get("summary", ""), published=e.get("published") or e.get("updated"),
               metadata={"notice_code": code})


def run_who_don(ctx):
    """WHO Disease Outbreak News (the site's OData API), newest first."""
    r = ctx.fetcher.get(ctx.feed.url, params={"$top": "30", "$orderby": "PublicationDateAndTime desc"})
    if not r.ok:
        raise RuntimeError(f"HTTP {r.status}")
    w = NewsWriter(ctx, source="who_don", license="CC BY-NC-SA 3.0 IGO")
    w.max_age = int(ctx.opt("max_age_days", 30))
    for it in r.json().get("value", []):
        ctx.counts["items"] += 1
        url = "https://www.who.int/emergencies/disease-outbreak-news/item/" + (it.get("UrlName") or it.get("DonId") or "")
        w.item(url=url, title=it.get("OverrideTitle") or it.get("Title", ""), summary=it.get("Summary") or strip_html(it.get("Overview", "")),
               published=it.get("PublicationDateAndTime") or it.get("PublicationDate"), metadata={"don_id": it.get("DonId", "")},
               raw={k: it.get(k) for k in ("DonId", "Title", "UrlName", "PublicationDate", "Summary")})


def run_federal_register(ctx):
    """Federal Register API: the newest documents of one type (presidential documents by default)."""
    r = ctx.fetcher.get(ctx.feed.url, params={"conditions[type][]": ctx.opt("type", "PRESDOCU"), "order": "newest", "per_page": "40"})
    if not r.ok:
        raise RuntimeError(f"HTTP {r.status}")
    w = NewsWriter(ctx, source="federal_register", license="public domain (US government work)")
    w.max_age = int(ctx.opt("max_age_days", 14))
    for it in r.json().get("results", []):
        ctx.counts["items"] += 1
        w.item(url=it["html_url"], title=it.get("title", ""), summary=it.get("abstract") or "", published=it.get("publication_date"),
               metadata={"document_number": it.get("document_number", ""), "type": it.get("type", "")},
               raw={k: it.get(k) for k in ("document_number", "title", "type", "abstract", "html_url", "publication_date")})


def run_nobel(ctx):
    """Nobel Prize API v2: the prizes of the current year (and last), as candidates once announced."""
    year = int(ctx.opt("year") or timezone.now().year)
    w = NewsWriter(ctx, source="nobel", license="CC0 1.0")
    w.max_age = max(int(ctx.opt("max_age_days", 0)), 800)  # prizes are announced once a year
    for y in (year - 1, year):
        r = ctx.fetcher.get(ctx.feed.url, params={"nobelPrizeYear": str(y), "limit": "20"})
        if not r.ok:
            raise RuntimeError(f"HTTP {r.status}")
        for p in r.json().get("nobelPrizes", []):
            if not p.get("laureates") or not p.get("dateAwarded"):
                continue
            ctx.counts["items"] += 1
            names = [(l.get("knownName") or l.get("orgName") or {}).get("en", "") for l in p["laureates"]]
            motivation = ((p["laureates"][0].get("motivation") or {}).get("en", ""))
            cat = (p.get("categoryFullName") or {}).get("en", "")
            url = f"https://www.nobelprize.org/prizes/{_nobel_slug(p['category']['en'])}/{y}/summary/"
            w.item(url=url, title=f"{cat} {y} awarded to {', '.join(names)}", summary=f"{cat} {y}: {', '.join(names)}, {motivation}.",
                   published=p["dateAwarded"], metadata={"api": p["links"][0]["href"] if p.get("links") else "", "category": cat},
                   raw=p)


def _nobel_slug(cat: str) -> str:
    return {"Economic Sciences": "economic-sciences"}.get(cat, cat.lower().replace(" ", "-"))


def run_historian_sync(ctx):
    """Office of the Historian Milestones: its TEI chapters from GitHub (public domain), as Documents the lookup reads."""
    import xml.etree.ElementTree as ET

    base = ctx.opt("raw_base")
    ns = {"t": "http://www.tei-c.org/ns/1.0"}
    chapters = ctx.opt("chapters") or ["1750-1775", "1776-1783", "1784-1800", "1801-1829", "1830-1860", "1861-1865", "1866-1898", "1899-1913",
                                       "1914-1920", "1921-1936", "1937-1945", "1945-1952", "1953-1960", "1961-1968", "1969-1976", "1977-1980",
                                       "1981-1988", "1989-1992", "1993-2000"]
    for ch in chapters:
        r = ctx.fetcher.get(base + ch + ".xml")
        if not r.ok:
            ctx.error(f"{ch}: HTTP {r.status}")
            continue
        root = ET.fromstring(r.content)
        for div in root.iter("{http://www.tei-c.org/ns/1.0}div"):
            xid = div.get("{http://www.w3.org/XML/1998/namespace}id")
            if not xid or div.get("type") not in ("section", "chapter") or xid == "foreword":
                continue
            head = div.find("t:head", ns)
            title = " ".join("".join(head.itertext()).split()) if head is not None else xid
            dates = [e.get("when") or e.get("from") for e in div.iter("{http://www.tei-c.org/ns/1.0}date") if e.get("when") or e.get("from")]
            text = " ".join(" ".join(p.itertext()) for p in div.findall("t:p", ns))
            url = f"https://history.state.gov/milestones/{ch}/{xid}"
            doc, state = save_document(canonical_url=canonical_url(url), url=url, raw=ET.tostring(div), feed=ctx.feed,
                                       publisher=publisher_for(url, actor=ctx.actor), title=title, language="en", license="public domain (US government work)",
                                       extracted_text=" ".join(text.split()), metadata={"source": "historian", "chapter": ch, "dates": dates[:6]})
            ctx.counts[f"documents_{state}"] += 1


def historian_documents():
    return Document.objects.filter(metadata__source="historian")

