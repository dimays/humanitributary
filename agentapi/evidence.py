"""Stored pages over the agent API, and excerpts checked against them (docs/adr/0036-evidence-packs.md).

    GET  /api/agent/documents/<id>          a stored page's clean text: a page in the pack of a task you hold, or (scope
                                            review) a page cited by an entry in review
    GET  /api/agent/documents?url=…         the same, found by the cited URL
    POST /api/agent/evidence/check-excerpt  {"doc_id" | "url", "excerpt"} → is it verbatim on the stored page?

**Auto-verify.** `complete` (write_event, fill_gap, verify_claim results) and `edits/check` / `edits/apply` call
`result_mismatches` / `ops_problems`: every excerpt whose cited page is in the store (`ingest.prefetch.stored`) must
be on that page, verbatim up to whitespace (`ingest.passages.normalize`); a mismatch is a 422 naming the excerpt
and the closest passage. A page that isn't stored (browser_only, not fetched yet, purged) is not checked here: the
reviewer reads it.
"""

from django.views.decorators.http import require_http_methods

from ingest import passages as P
from ingest import prefetch
from ingest.models import PrefetchedPage
from work.models import AgentTask

from .auth import agent_view, error

MAX_EXCERPT_CHARS = 2000


def _check(url: str, excerpt: str, where: str, cache: dict) -> dict | None:
    """A mismatch for one cited excerpt, or None (it matches, or the page isn't in the store)."""
    if not isinstance(excerpt, str) or not excerpt.strip() or not isinstance(url, str):
        return None
    key = prefetch.page_key(url)
    if key not in cache:
        page = prefetch.stored(url)
        cache[key] = (page, prefetch.read_text(page) if page else None)
    page, text = cache[key]
    if text is None or P.contains(text, excerpt):
        return None
    return {"where": where, "url": url, "doc_id": page.pk, "fetched_at": page.fetched_at.isoformat(timespec="seconds"),
            "excerpt": excerpt, "closest": P.closest(text, excerpt)}


def _line(m: dict) -> str:
    return (f"{m['where']}: the excerpt \"{m['excerpt'][:300]}\" is not on {m['url']} (document {m['doc_id']}, fetched "
            f"{m['fetched_at'][:10]}); the closest passage is \"{m['closest']}\". Copy the excerpt from the stored text "
            f"(GET documents/{m['doc_id']}), or drop it")


def result_mismatches(kind: str, result: dict) -> list[dict]:
    cache, out = {}, []
    if kind in ("write_event", "fill_gap", "audit"):
        events = [result.get("event")] if kind == "write_event" else (result.get("events") or [])
        for i, ev in enumerate(events):
            if not isinstance(ev, dict):
                continue
            base = "event" if kind == "write_event" else f"events/{i}"
            for j, c in enumerate(ev.get("cites") or []):
                if isinstance(c, dict) and (m := _check(c.get("u"), c.get("excerpt"), f"{base}/cites/{j}/excerpt", cache)):
                    out.append(m)
    elif kind == "verify_claim":
        for i, e in enumerate(result.get("evidence") or []):
            if isinstance(e, dict) and (m := _check(e.get("url"), e.get("excerpt"), f"evidence/{i}/excerpt", cache)):
                out.append(m)
    return out


def problems_of(mismatches: list[dict]) -> list[str]:
    return [_line(m) for m in mismatches]


def ops_problems(ops: list) -> list[str]:
    """An edit file's excerpts (cites in add_cites, add_branch, add_event, add_connection; add_evidence's excerpt)."""
    from timeline import edits

    cache, out = {}, []
    for i, op in enumerate(ops if isinstance(ops, list) else []):
        if not isinstance(op, dict):
            continue
        label = f"#{i} {op.get('op')} {edits.target(op) or ''}".strip()
        if op.get("op") == "add_evidence":
            if m := _check(op.get("url"), op.get("excerpt"), label, cache):
                out.append(m)
            continue
        cites = list(op.get("add_cites") or []) + list(op.get("cites") or [])
        for k in ("event", "branch"):
            if isinstance(op.get(k), dict):
                cites += list(op[k].get("cites") or [])
        for c in cites:
            if isinstance(c, dict) and (m := _check(c.get("u"), c.get("excerpt"), label, cache)):
                out.append(m)
    return problems_of(out)


# ── reads ────────────────────────────────────────────────────────────────────────────────────────────────────────

def _scope_ok(request, page: PrefetchedPage) -> bool:
    """A page in the evidence pack of a task this agent holds; or, for a reviewer (scope review), a page cited by an
    entry in review (what it is reviewing)."""
    t = request.agent_token
    held = AgentTask.objects.filter(status="claimed", claimed_by=t.actor, payload__evidence_pack__contains=[{"doc_id": page.pk}])
    if held.exists():
        return True
    if t.has("review"):
        from evidence.models import Evidence

        cited = (Evidence.objects.filter(claim__entry__status="review", citation__url__icontains=page.host)
                 .values_list("citation__url", flat=True).distinct())
        return any(prefetch.page_key(u) == page.url for u in cited)
    return False


def _doc_json(page: PrefetchedPage, text: str) -> dict:
    pub = page.publisher
    return {"doc_id": page.pk, "url": page.url, "final_url": page.final_url or page.url, "title": page.title,
            "publisher": pub.domain if pub else page.host, "tier": pub.tier if pub else None, "license": pub.license if pub else "",
            "fetched_at": page.fetched_at.isoformat(timespec="seconds"), "retain_until": page.retain_until.isoformat(timespec="seconds") if page.retain_until else None,
            "words": page.words, "text": text,
            "note": "The page's main text as the prefetch_sources job stored it. Copy excerpts from here (at most 25 words); "
                    "it is private: never publish it, and cite the page's URL."}


@agent_view
@require_http_methods(["GET"])
def documents(request, doc_id=None):
    if doc_id is None:
        url = request.GET.get("url", "")
        if not url:
            return error(400, "GET documents/<id>, or documents?url=<the cited URL>")
        page = PrefetchedPage.objects.filter(url=prefetch.page_key(url)).select_related("publisher").first()
    else:
        page = PrefetchedPage.objects.filter(pk=doc_id).select_related("publisher").first()
    if page is None:
        return error(404, "no stored page: read it yourself (with the honest User-Agent), or in a browser if it is browser_only", stored=False)
    if not _scope_ok(request, page):
        return error(403, f"document {page.pk} is not in the evidence pack of a task you hold", doc_id=page.pk)
    text = prefetch.read_text(page)
    if text is None:
        return error(410 if page.status == "purged" else 404, f"document {page.pk} is {page.status}: read the page itself", stored=False, status=page.status)
    from .views import _ok

    return _ok(_doc_json(page, text))


@agent_view
@require_http_methods(["POST"])
def check_excerpt(request):
    from .views import _body, _ok

    try:
        body = _body(request)
    except ValueError as e:
        return error(400, str(e))
    excerpt = body.get("excerpt")
    if not isinstance(excerpt, str) or not excerpt.strip() or len(excerpt) > MAX_EXCERPT_CHARS:
        return error(400, f'send {{"doc_id" or "url", "excerpt"}} (the excerpt a string of at most {MAX_EXCERPT_CHARS} characters)')
    if isinstance(body.get("doc_id"), int):
        page = PrefetchedPage.objects.filter(pk=body["doc_id"]).first()
    elif isinstance(body.get("url"), str):
        page = PrefetchedPage.objects.filter(url=prefetch.page_key(body["url"])).first()
    else:
        return error(400, 'send "doc_id" (from an evidence pack) or "url"')
    text = prefetch.read_text(page) if page else None
    if text is None:
        return error(404, "that page is not in the store: check the excerpt against the page itself", stored=False)
    match = P.contains(text, excerpt)
    n = P.words(excerpt)
    out = {"doc_id": page.pk, "url": page.url, "fetched_at": page.fetched_at.isoformat(timespec="seconds"), "stored": True, "match": match,
           "words": n, "within_25_words": n <= 25, "normalized": "whitespace only (and Unicode NFC)"}
    if not match:
        out["closest"] = P.closest(text, excerpt)
    return _ok(out)
