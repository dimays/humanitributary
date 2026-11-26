"""Wikipedia sources: the Current events portal (one Document per day, one Candidate per item) and the
"<Year> in <Country>" pages (one Document per page, one Candidate per dated event), read as wikitext through the
MediaWiki API. Text from Wikipedia is CC BY-SA 4.0: every Document and Candidate keeps the attribution.
"""

import difflib
import hashlib
import re
from collections import Counter
from datetime import date, timedelta

from django.utils import timezone

from timeline.models import Branch

from . import wikidata, wikitext
from .candidates import MONTH_NAMES, decimal_year, first_sentence, upsert_candidate, when_text
from .extract import canonical_url
from .models import BranchEntity, Candidate, Document
from .store import save_document

LICENSE = "CC BY-SA 4.0"
MONTHS = {m.lower(): i for i, m in enumerate(MONTH_NAMES, 1)}


def portal_title(d: date) -> str:
    return f"Portal:Current events/{d.year} {MONTH_NAMES[d.month - 1]} {d.day}"


def fetch_pages(fetcher, titles: list[str], *, pageprops=False) -> dict[str, dict]:
    """{requested title: {"title", "revid", "timestamp", "wikitext", "qid", "missing"}} (50 a request, redirects followed)."""
    out = {}
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        params = {"action": "query", "prop": "revisions" + ("|pageprops" if pageprops else ""), "rvprop": "content|ids|timestamp",
                  "rvslots": "main", "redirects": "1", "titles": "|".join(batch)}
        if pageprops:
            params["ppprop"] = "wikibase_item"
        data = wikidata.api_get(fetcher, params)
        q = data.get("query", {})
        norm = {n["from"]: n["to"] for n in q.get("normalized", [])}
        redir = {r["from"]: r["to"] for r in q.get("redirects", [])}
        pages = {p["title"]: p for p in q.get("pages", [])}
        for t in batch:
            target = redir.get(norm.get(t, t), norm.get(t, t))
            p = pages.get(target, {})
            rev = (p.get("revisions") or [{}])[0]
            out[t] = {"title": target, "missing": bool(p.get("missing")) or not p, "revid": rev.get("revid"), "timestamp": rev.get("timestamp"),
                      "wikitext": ((rev.get("slots") or {}).get("main") or {}).get("content", ""), "qid": (p.get("pageprops") or {}).get("wikibase_item", "")}
    return out


def _hash(text: str) -> str:
    return hashlib.sha1(" ".join(text.lower().split()).encode()).hexdigest()[:16]


def sync_items(prefix: str, items: list[dict], *, actor: str, counts: Counter):
    """Upsert one document's candidates; reuse a candidate whose text was lightly edited; retire vanished ones.

    items: [{"key", "values", "entities"}]. Keys are prefix + text hash, so an unchanged item maps to itself; an
    edited one (≥ 85 % similar text) keeps its old candidate; a queued candidate whose item left the page is
    rejected as gone.
    """
    existing = {c.source_key: c for c in Candidate.objects.filter(source_key__startswith=prefix)}
    seen = set()
    for it in items:
        key = it["key"]
        if key not in existing:
            best, ratio = None, 0.0
            for k, c in existing.items():
                if k in seen or any(k == x["key"] for x in items):
                    continue
                r = difflib.SequenceMatcher(None, c.summary, it["values"]["summary"]).ratio()
                if r > ratio:
                    best, ratio = k, r
            if best and ratio >= 0.85:
                key = best
        seen.add(key)
        _, state = upsert_candidate(key, created_by=actor, values=it["values"], entities=it["entities"])
        counts[f"candidates_{state}"] += 1
    for k, c in existing.items():
        if k not in seen and c.status == Candidate.Status.QUEUED and not c.details.get("gone"):
            c.details = {**c.details, "gone": True}
            c.status, c.decided_by, c.decided_at = Candidate.Status.REJECTED, actor, timezone.now()
            c.save(update_fields=["details", "status", "decided_by", "decided_at"])
            counts["candidates_gone"] += 1


def _link_entities(fetcher, titles, counts):
    return wikidata.resolve(fetcher, titles, counts=counts)


def _externals(parsed) -> list[dict]:
    from evidence.publishers import domain_of

    return [{"url": e.url, "label": e.label, "domain": domain_of(e.url)} for e in parsed.external]


# The portal ----------------------------------------------------------------------------------------------------
def is_item(b: wikitext.Bullet, parsed: wikitext.Parsed) -> bool:
    """A news item (as opposed to a story heading like "[[Gaza war]]"): it cites a source, or it is a leaf with prose."""
    if parsed.external:
        return True
    return not b.children and len(parsed.text.split()) >= 6


def parse_portal(text: str) -> list[dict]:
    """→ [{"category", "text", "links": [titles], "topics": [titles], "external": [{url,label,domain}], "line"}]"""
    out = []
    for b in wikitext.walk(wikitext.bullets(text)):
        p = wikitext.parse_inline(b.raw)
        if not is_item(b, p):
            continue
        topics = []
        for a in wikitext.ancestors(b):
            for link in wikitext.parse_inline(a.raw).links:
                if link.title not in topics:
                    topics.append(link.title)
        links = list(dict.fromkeys(l.title for l in p.links))
        out.append({"category": b.heading, "text": p.text, "links": links, "topics": topics, "external": _externals(p), "line": b.line})
    return out


def portal_day(fetcher, ctx, d: date, page: dict):
    url = wikidata.article_url(portal_title(d))
    doc = Document.objects.filter(canonical_url=canonical_url(url)).first()
    if doc and doc.metadata.get("revid") == page["revid"] and not ctx.opt("reparse"):
        ctx.counts["days_unchanged"] += 1
        return
    items = parse_portal(page["wikitext"])
    titles = sorted({t for it in items for t in it["links"] + it["topics"]})
    ents = _link_entities(fetcher, titles, ctx.counts)
    mentions = Counter()
    for it in items:
        for t in it["links"] + it["topics"]:
            if t in ents:
                mentions[ents[t]] += 1
    from .candidates import publisher_for, set_document_entities

    doc, state = save_document(
        canonical_url=canonical_url(url), url=url, raw=page["wikitext"].encode(), feed=ctx.feed, publisher=publisher_for(url, actor=ctx.actor),
        title=portal_title(d), published_at=timezone.make_aware(timezone.datetime(d.year, d.month, d.day)), language="en", license=LICENSE,
        extracted_text="\n".join(f"[{it['category']}] {it['text']}" for it in items),
        metadata={"source": "portal", "date": d.isoformat(), "revid": page["revid"], "revision_timestamp": page["timestamp"],
                  "categories": sorted({it["category"] for it in items}), "items": len(items), "wikilinks": titles[:2000],
                  "attribution": f"Wikipedia contributors, \"{portal_title(d)}\", {LICENSE}"},
    )
    ctx.counts[f"documents_{state}"] += 1
    set_document_entities(doc, mentions)
    rows = []
    for it in items:
        roles = {}
        for t in it["topics"]:
            if t in ents:
                roles[ents[t].qid] = "topic"
        for t in it["links"]:
            if t in ents:
                roles[ents[t].qid] = "item"
        topic = it["topics"][-1] if it["topics"] else ""
        rows.append({
            "key": f"portal:{d.isoformat()}:{_hash(it['text'])}",
            "values": dict(kind="new_event", title=first_sentence(it["text"])[:300], summary=it["text"], when_text=when_text(d),
                           y_guess=decimal_year(d), precision="day",
                           details={"source": "portal", "date": d.isoformat(), "category": it["category"], "topics": it["topics"],
                                    "topic": topic, "topic_qid": ents[topic].qid if topic in ents else "", "links": it["links"],
                                    "external": it["external"], "roles": roles, "document_id": doc.pk, "document_url": url,
                                    "attribution": f"Wikipedia, \"{portal_title(d)}\" ({LICENSE})"}),
            "entities": [ents[t] for t in set(it["links"]) | set(it["topics"]) if t in ents],
        })
    sync_items(f"portal:{d.isoformat()}:", rows, actor=ctx.actor, counts=ctx.counts)
    ctx.counts["items"] += len(items)


def run_portal(ctx):
    """Wikipedia Current events portal: the last N days (default 3: late edits), or `days` for a backfill."""
    today = ctx.opt("today") or timezone.now().date()
    if isinstance(today, str):
        today = date.fromisoformat(today)
    days = int(ctx.opt("days") or ctx.opt("days_back", 3))
    dates = [today - timedelta(days=i) for i in range(days)]
    pages = fetch_pages(ctx.fetcher, [portal_title(d) for d in dates])
    for d in sorted(dates):
        page = pages.get(portal_title(d))
        if not page or page["missing"] or not page["wikitext"]:
            ctx.counts["days_missing"] += 1
            continue
        try:
            portal_day(ctx.fetcher, ctx, d, page)
            ctx.counts["days"] += 1
        except Exception as e:  # one bad day doesn't stop the others
            ctx.error(f"{d}: {type(e).__name__}: {e}")


# "<Year> in <Country>" pages -------------------------------------------------------------------------------------
DATE_DM = re.compile(r"^(\d{1,2})\s+(" + "|".join(MONTH_NAMES) + r")\b\s*[–—-]?\s*(.*)$", re.I | re.S)
DATE_MD = re.compile(r"^(" + "|".join(MONTH_NAMES) + r")\s+(\d{1,2})\b\s*[–—-]?\s*(.*)$", re.I | re.S)


def _item_date(text: str, year: int, month_heading: str):
    """("18 January – Senegal wins …", 2026, "January") → (date(2026,1,18), "Senegal wins …", "day")."""
    for rx, order in ((DATE_DM, "dm"), (DATE_MD, "md")):
        if m := rx.match(text):
            day, mon = (m.group(1), m.group(2)) if order == "dm" else (m.group(2), m.group(1))
            try:
                return date(year, MONTHS[mon.lower()], int(day)), m.group(3).strip(), "day"
            except ValueError:
                return None, text, ""
    if month_heading.lower() in MONTHS:
        return date(year, MONTHS[month_heading.lower()], 1), text, "month"
    return None, text, ""


def parse_year_page(text: str, year: int) -> list[dict]:
    """Dated items of the Events section (with nested items under a date-only bullet)."""
    out = []
    for b in wikitext.walk(wikitext.bullets(text)):
        if b.heading.lower() != "events":
            continue
        p = wikitext.parse_inline(b.raw)
        d, body, precision = _item_date(p.text, year, "")  # its own day first
        if d is None and b.parent is not None:  # then the date-only bullet it sits under
            d, _, precision = _item_date(wikitext.parse_inline(b.parent.raw).text, year, "")
        if d is None:  # then the month heading
            d, body, precision = _item_date(p.text, year, b.subheading)
        if d is None or len(body.split()) < 4:
            continue
        out.append({"date": d, "precision": precision, "text": body, "links": list(dict.fromkeys(l.title for l in p.links)),
                    "refs": p.refs, "month": b.subheading, "line": b.line})
    return out


def year_page_targets(ctx, year: int) -> list[tuple]:
    """(branch, entity) for continuing country-like branches with a mapped polity that has an English article."""
    rows = (BranchEntity.objects.filter(entity__kind="polity", branch__end__isnull=True).exclude(entity__enwiki_title="")
            .select_related("branch", "entity").order_by("branch__slug", "-weight", "entity__qid"))
    picked, seen = [], set()
    only = ctx.opt("branches")
    only = [s.strip() for s in only.split(",")] if isinstance(only, str) else only
    for be in rows:
        if be.branch.slug in seen or (only and be.branch.slug not in only):
            continue
        seen.add(be.branch.slug)
        picked.append((be.branch, be.entity))
    return picked


def run_year_pages(ctx):
    """"<Year> in <Country>" pages for mapped country branches, `per_run` a run (rotating), or `branches=a,b`."""
    from evidence.publishers import domain_of

    from .candidates import publisher_for, set_document_entities
    from .routing import top_branch  # noqa: F401  (routing happens in the process job)

    year = int(ctx.opt("year") or timezone.now().year)
    targets = year_page_targets(ctx, year)
    if not ctx.opt("branches"):
        per_run = int(ctx.opt("limit") or ctx.opt("per_run", 25))
        offset = int((ctx.feed.cursor or {}).get("offset", 0)) if ctx.feed else 0
        if targets:
            offset %= len(targets)
            targets = (targets[offset:] + targets[:offset])[:per_run]
            if ctx.feed:
                ctx.feed.cursor = {"offset": offset + per_run}
                ctx.feed.save(update_fields=["cursor"])
    titles = []
    for _, e in targets:
        titles += [f"{year} in {e.enwiki_title}", f"{year} in the {e.enwiki_title}"]
    pages = fetch_pages(ctx.fetcher, titles, pageprops=True)
    done = set()
    for branch, e in targets:
        page = next((pages[t] for t in (f"{year} in {e.enwiki_title}", f"{year} in the {e.enwiki_title}") if not pages[t]["missing"] and pages[t]["wikitext"]), None)
        if page is None or page["title"] in done:
            ctx.counts["pages_missing"] += 1
            continue
        done.add(page["title"])
        try:
            _year_page(ctx, year, branch, e, page, publisher_for, set_document_entities, domain_of)
            ctx.counts["pages"] += 1
        except Exception as ex:
            ctx.error(f"{page['title']}: {type(ex).__name__}: {ex}")


def _year_page(ctx, year, branch, entity, page, publisher_for, set_document_entities, domain_of):
    url = wikidata.article_url(page["title"])
    # Map the page to branches through Wikidata: the page's item → its country (P17) → BranchEntity.
    mapped, how = [branch.slug], "searched branch"
    if page["qid"]:
        item = wikidata.fetch_entities(ctx.fetcher, [page["qid"]], counts=ctx.counts).get(page["qid"])
        countries = (item.facts or {}).get("P17", []) if item else []
        via = sorted(set(BranchEntity.objects.filter(entity__qid__in=countries, branch__end__isnull=True).values_list("branch__slug", flat=True)))
        if via:
            mapped, how = via, f"Wikidata {page['qid']} P17 {','.join(countries)}"
    doc = Document.objects.filter(canonical_url=canonical_url(url)).first()
    if doc and doc.metadata.get("revid") == page["revid"] and not ctx.opt("reparse"):
        ctx.counts["pages_unchanged"] += 1
        return
    items = parse_year_page(page["wikitext"], year)
    titles = sorted({t for it in items for t in it["links"]})
    ents = _link_entities(ctx.fetcher, titles, ctx.counts)
    mentions = Counter(ents[t] for it in items for t in it["links"] if t in ents)
    doc, state = save_document(
        canonical_url=canonical_url(url), url=url, raw=page["wikitext"].encode(), feed=ctx.feed, publisher=publisher_for(url, actor=ctx.actor),
        title=page["title"], language="en", license=LICENSE, extracted_text="\n".join(f"{it['date']} {it['text']}" for it in items),
        metadata={"source": "year_page", "year": year, "revid": page["revid"], "qid": page["qid"], "branches": mapped, "mapped_by": how,
                  "items": len(items), "wikilinks": titles[:2000], "attribution": f"Wikipedia contributors, \"{page['title']}\", {LICENSE}"},
    )
    ctx.counts[f"documents_{state}"] += 1
    set_document_entities(doc, mentions)
    rows = []
    for it in items:
        d = it["date"]
        refs = [{"url": r["url"], "title": r["title"], "site": r.get("website") or r.get("work") or r.get("publisher") or "", "domain": domain_of(r["url"]), "date": r.get("date", "")} for r in it["refs"]]
        rows.append({
            "key": f"year:{page['title']}:{_hash(it['text'])}",
            "values": dict(kind="new_event", title=first_sentence(it["text"])[:300], summary=it["text"],
                           when_text=when_text(d) if it["precision"] == "day" else f"{MONTH_NAMES[d.month - 1]} {d.year}",
                           y_guess=decimal_year(d), precision=it["precision"],
                           details={"source": "year_page", "date": d.isoformat(), "page": page["title"], "branches": mapped,
                                    "links": it["links"], "external": [{"url": r["url"], "label": r["site"] or r["title"], "domain": r["domain"], "title": r["title"]} for r in refs],
                                    "roles": {ents[t].qid: "item" for t in it["links"] if t in ents}, "document_id": doc.pk, "document_url": url,
                                    "attribution": f"Wikipedia, \"{page['title']}\" ({LICENSE})"}),
            "entities": [ents[t] for t in set(it["links"]) if t in ents],
        })
    sync_items(f"year:{page['title']}:", rows, actor=ctx.actor, counts=ctx.counts)
    ctx.counts["items"] += len(items)
