"""Link health: re-check the URLs we cite, on a schedule (docs/adr/0008-ingest-design.md).

Per round, up to `limit` citations, least recently checked first, interleaved across publishers so no host gets a
burst. Never checked: NEVER_FETCH hosts and `browser_only` / `forbidden` publishers (agents re-read those in a
browser), and hosts that answered with a bot challenge in the last BLOCKED_COOLDOWN_DAYS.

- Wikipedia citations go through the MediaWiki API, 50 a request: a missing page is dead; a redirect to another
  title is "redirected" (a rename, not a broken claim); edits are not "changes" (Wikipedia changes daily; claims are
  re-verified on their own schedule).
- Other URLs: HEAD first; if the ETag / Last-Modified match the last check, unchanged. Otherwise (or when HEAD is
  refused) GET, extract the main text (trafilatura) and hash it: a different hash from the citation's stored one is
  "changed". 404/410, a redirect to a site's home page, or three failed rounds in a row are "dead"; 401/403/CAPTCHA
  or robots.txt are "blocked" (the page may be fine: an agent checks it in a browser); 5xx and network errors are
  "error", retried next round.
- Dead links get a Wayback Machine snapshot looked up (archive.org availability API).

Every result is a LinkCheck row; the Citation keeps the latest (written through revising("job:link_health")).
For dead and changed citations, every claim they support is marked stale (recheck_after = yesterday, then its
status recomputed by evidence.confidence) and gets a `verify_claim` task.
"""

from collections import defaultdict
from datetime import timedelta
from urllib.parse import quote, urlsplit

from django.db.models import F
from django.utils import timezone

from evidence.confidence import refresh
from evidence.models import Citation, Claim, Evidence
from evidence.publishers import domain_of
from revisions import revising
from timeline.services import apply_changes
from work import queue

from . import policy
from .extract import canonical_url, extract_html, text_hash
from .http import FetchError, Refused
from .models import LinkCheck
from .wikidata import api_get, title_from_url

ACTOR = "job:link_health"
O = LinkCheck.Outcome


def _allowed_policy(domain: str, policies: dict) -> bool:
    parts = domain.split(".")
    for i in range(len(parts) - 1):
        d = ".".join(parts[i:])
        if d in policies:
            return policies[d] == "allowed"
    return True


def select(limit: int, *, now=None) -> list[Citation]:
    """The next citations to check: never checked first, then oldest; round-robin across publishers."""
    from evidence.models import Publisher

    now = now or timezone.now()
    policies = dict(Publisher.objects.values_list("domain", "fetch_policy"))
    blocked = set(LinkCheck.objects.filter(outcome=O.BLOCKED, checked_at__gte=now - timedelta(days=policy.BLOCKED_COOLDOWN_DAYS))
                  .values_list("citation__publisher__domain", flat=True))
    qs = (Citation.objects.select_related("publisher").filter(evidence__isnull=False).distinct()
          .order_by(F("last_checked_at").asc(nulls_first=True), "id"))
    buckets = defaultdict(list)
    for c in qs.iterator(chunk_size=2000):
        d = c.publisher.domain
        if policy.never_fetch_reason(c.url) or not _allowed_policy(d, policies) or d in blocked:
            continue
        if len(buckets[d]) < limit:
            buckets[d].append(c)
    out, order = [], sorted(buckets, key=lambda d: (buckets[d][0].last_checked_at is not None, buckets[d][0].last_checked_at or now, buckets[d][0].pk))
    i = 0
    while len(out) < limit and any(buckets.values()):
        for d in order:
            if buckets[d] and len(out) < limit:
                out.append(buckets[d].pop(0))
        i += 1
    return out


def _consecutive_failures(citation) -> int:
    n = 0
    for o in LinkCheck.objects.filter(citation=citation).order_by("-checked_at").values_list("outcome", flat=True)[:5]:
        if o in (O.ERROR, O.DEAD):
            n += 1
        else:
            break
    return n


def wayback(fetcher, url: str) -> str:
    try:
        r = fetcher.get("https://archive.org/wayback/available", params={"url": url})
    except (FetchError, Refused):
        return ""
    if not r.ok:
        return ""
    snap = (r.json().get("archived_snapshots") or {}).get("closest") or {}
    u = snap.get("url", "") if snap.get("available") else ""
    return ("https://" + u[7:]) if u.startswith("http://") else u


def _is_home(url: str) -> bool:
    return urlsplit(url).path in ("", "/")


def check_wikipedia(fetcher, cites: list[Citation]) -> dict[int, dict]:
    out = {}
    by_title = defaultdict(list)
    for c in cites:
        by_title[title_from_url(c.url)].append(c)
    titles = [t for t in by_title if t]
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        data = api_get(fetcher, {"action": "query", "prop": "info|revisions", "rvprop": "ids", "redirects": "1", "titles": "|".join(batch)})
        q = data.get("query", {})
        norm = {n["from"]: n["to"] for n in q.get("normalized", [])}
        redir = {r["from"]: r["to"] for r in q.get("redirects", [])}
        pages = {p["title"]: p for p in q.get("pages", [])}
        for t in batch:
            n = norm.get(t, t)
            target = redir.get(n, n)
            p = pages.get(target, {})
            for c in by_title[t]:
                if p.get("missing") or not p:
                    out[c.pk] = {"outcome": O.DEAD, "http_status": 404, "method": "api"}
                else:
                    rev = (p.get("revisions") or [{}])[0].get("revid")
                    final = "https://en.wikipedia.org/wiki/" + quote(target.replace(" ", "_"), safe="()_,'!:-.")
                    out[c.pk] = {"outcome": O.REDIRECTED if target != n else O.OK, "http_status": 200, "method": "api",
                                 "final_url": final, "content_hash": f"rev:{rev}"}
    for c in cites:
        out.setdefault(c.pk, {"outcome": O.ERROR, "method": "api", "error": "not a /wiki/ article URL"})
    return out


def check_url(fetcher, c: Citation, last: LinkCheck | None) -> dict:
    res = {"method": "head"}
    try:
        h = fetcher.head(c.url, etag="", last_modified="")
    except Refused as e:
        return {"outcome": O.BLOCKED, "method": "none", "error": str(e)}
    except FetchError as e:
        h = None
        res["error"] = str(e)
    if h is not None:
        res.update(http_status=h.status, final_url=h.final_url, elapsed_ms=h.elapsed_ms, etag=h.headers.get("etag", "")[:300],
                   last_modified=h.headers.get("last-modified", "")[:100])
        if h.blocked:
            return {**res, "outcome": O.BLOCKED, "error": "bot challenge"}
        if h.status in (404, 410):
            return {**res, "outcome": O.DEAD}
        if h.ok and last and last.content_hash and ((res["etag"] and res["etag"] == last.etag) or (res["last_modified"] and res["last_modified"] == last.last_modified)):
            return {**res, "outcome": O.OK, "content_hash": last.content_hash}
    try:
        g = fetcher.get(c.url)
    except Refused as e:
        return {**res, "outcome": O.BLOCKED, "method": "get", "error": str(e)}
    except FetchError as e:
        return {**res, "outcome": O.ERROR, "method": "get", "error": str(e)}
    res.update(method="get", http_status=g.status, final_url=g.final_url, elapsed_ms=g.elapsed_ms,
               etag=g.headers.get("etag", "")[:300] or res.get("etag", ""), last_modified=g.headers.get("last-modified", "")[:100] or res.get("last_modified", ""))
    if g.blocked or g.status in (401, 403, 429):
        return {**res, "outcome": O.BLOCKED, "error": "refused automated readers" if not g.blocked else "bot challenge"}
    if g.status in (404, 410):
        return {**res, "outcome": O.DEAD}
    if g.status >= 400:
        return {**res, "outcome": O.ERROR, "error": f"HTTP {g.status}"}
    moved = canonical_url(g.final_url) != canonical_url(c.url)
    if moved and _is_home(g.final_url) and not _is_home(c.url):
        return {**res, "outcome": O.DEAD, "error": "redirects to the site's home page"}
    ctype = g.headers.get("content-type", "")
    if "html" in ctype or not ctype:
        text = extract_html(g.text, g.final_url).text
    else:
        text = ""
    res["content_hash"] = text_hash(text) if text else ("raw:" + __import__("hashlib").sha256(g.content).hexdigest())[:64]
    if c.content_hash and res["content_hash"] != c.content_hash:
        return {**res, "outcome": O.CHANGED}
    return {**res, "outcome": O.REDIRECTED if moved else O.OK}


def mark_stale(citation: Citation, check: LinkCheck, counts):
    """Each claim the citation supports: stale now (recheck_after = yesterday), status recomputed, a verify_claim task."""
    yesterday = timezone.now().date() - timedelta(days=1)
    claims = Claim.objects.filter(evidence__citation=citation, evidence__stance__in=["supports", "partial"]).distinct().select_related("entry")
    with revising(ACTOR, reason=f"citation {citation.pk} {check.outcome}: re-verify"):
        for claim in claims:
            if claim.recheck_after is None or claim.recheck_after > yesterday:
                apply_changes(claim, {"recheck_after": yesterday})
            refresh(claim)
            counts["claims_stale"] += 1
    for claim in claims:
        ev = list(Evidence.objects.filter(claim=claim, citation=citation).values_list("pk", flat=True))
        _, created = queue.enqueue("verify_claim", created_by=ACTOR, dedupe_key=f"claim:{claim.pk}", priority=5 if check.outcome == O.DEAD else 3,
                                   target_claim=claim, target_entry=claim.entry,
                                   payload={"reason": f"citation {check.outcome}", "citation": citation.url, "citation_id": citation.pk,
                                            "outcome": check.outcome, "http_status": check.http_status, "final_url": check.final_url,
                                            "archive_url": check.archive_url, "evidence_ids": ev, "entry": claim.entry.slug, "field": claim.field,
                                            "value": claim.value,
                                            "instructions": "Skill: .claude/skills/verify-stale-claims. Re-read the source (or the archive copy, or a replacement)."})
        counts["verify_tasks_created" if created else "verify_tasks_existing"] += 1


def run(ctx):
    """Re-check `limit` cited URLs (default 200): status, redirects, content changes, Wayback for dead links."""
    limit = int(ctx.opt("limit", 200))
    cites = select(limit)
    ctx.counts["selected"] = len(cites)
    wiki = [c for c in cites if domain_of(c.url) == "wikipedia.org" and title_from_url(c.url)]
    results = check_wikipedia(ctx.fetcher, wiki) if wiki else {}
    for c in cites:
        if c.pk in results:
            continue
        last = LinkCheck.objects.filter(citation=c).order_by("-checked_at").first()
        try:
            results[c.pk] = check_url(ctx.fetcher, c, last)
        except Exception as e:
            results[c.pk] = {"outcome": O.ERROR, "method": "get", "error": f"{type(e).__name__}: {e}"}
    now = timezone.now()
    for c in cites:
        r = results[c.pk]
        outcome = r["outcome"]
        if outcome == O.ERROR and _consecutive_failures(c) >= 2:
            outcome, r["error"] = O.DEAD, (r.get("error", "") + " (third failed round in a row)").strip()
        archive = wayback(ctx.fetcher, c.url) if outcome == O.DEAD else ""
        check = LinkCheck.objects.create(citation=c, checked_at=now, method=r.get("method", ""), http_status=r.get("http_status"),
                                         final_url=(r.get("final_url") or "")[:1000], content_hash=r.get("content_hash", ""), outcome=outcome,
                                         etag=r.get("etag", ""), last_modified=r.get("last_modified", ""), archive_url=archive,
                                         error=r.get("error", "")[:2000], elapsed_ms=r.get("elapsed_ms"))
        ctx.counts[f"outcome_{outcome}"] += 1
        values = {"last_checked_at": now}
        if r.get("http_status"):
            values["http_status"] = r["http_status"]
        if r.get("content_hash") and not r["content_hash"].startswith("rev:") and outcome in (O.OK, O.CHANGED, O.REDIRECTED):
            values["content_hash"] = r["content_hash"]
        if r.get("final_url") and outcome in (O.OK, O.REDIRECTED, O.CHANGED) and r["final_url"].startswith("https://"):
            values["canonical_url"] = canonical_url(r["final_url"])[:1000]
        if archive:
            values["archive_url"] = archive[:1000]
        with revising(ACTOR, reason=f"link health: {outcome}"):
            apply_changes(c, values)
        if outcome in (O.DEAD, O.CHANGED):
            mark_stale(c, check, ctx.counts)
