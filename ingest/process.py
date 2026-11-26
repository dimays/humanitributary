"""The `process` job: route, de-duplicate, cluster and prioritize queued candidates, queue `write_event` tasks for
clusters over the threshold (WRITE_EVENT_THRESHOLD; at most settings.WRITE_EVENT_TASKS_PER_DAY new ones a day,
highest priority first), keep candidates in step with their tasks, and raise new-branch signals.
Deterministic throughout (docs/adr/0012-ingestion.md has the formulas).

Clusters. A Wikipedia portal item's cluster is its story: the deepest context topic it sits under (an article such as
"2026 Strait of Hormuz crisis") within a calendar month (`topic:<QID>:<YYYY-MM>`), or the item alone when it has no
topic. A news item or a "<Year> in X" item joins the portal cluster that cites the same URL, else the one sharing
the most entities within ±2 days (countries and other polities count half; at least 2.0 needed), else stands alone.

Priority (0–100), per cluster, given to each member:

    100 × (0.25·S + 0.10·T + 0.15·B + 0.15·C + 0.15·R + 0.20·P) × D
    S  sources: 1 − 0.6^n, n = distinct publishers of the cluster's links and items
    T  tiers: mean source weight (tier 1 → 1.0, 2 → 0.8, 3 → 0.6, 4 → 0.3, unrated → 0.5)
    B  branches touched (score ≥ 0.6), up to 4, / 4
    C  Wikipedia category weight (CATEGORY_WEIGHT), the cluster's highest; 0.5 without one
    R  recency: 0.5^(days since the newest item / 30)
    P  pageviews of the story's article (else its most viewed person, org or event), min(1, log10(1 + views) / 6)
    D  1 − 0.8 · similarity when an existing event looks like a duplicate (similarity ≥ 0.5), else 1
"""

import hashlib
import math
from collections import Counter, defaultdict
from datetime import date, timedelta

from django.conf import settings
from django.db import connection
from django.utils import timezone

from evidence.models import Publisher
from timeline.models import Branch, Event
from work import queue
from work.models import AgentTask

from .models import Candidate, Entity
from .routing import TOUCH_THRESHOLD, YEAR_PAGE_BOOST, Router, suggested, top_branch
from .wikidata import MOVEMENT_CLASSES, article_url

ACTOR = "job:process"
CATEGORY_WEIGHT = {
    "armed conflicts and attacks": 0.9, "politics and elections": 0.8, "disasters and accidents": 0.8,
    "international relations": 0.75, "science and technology": 0.7, "health and environment": 0.7,
    "business and economy": 0.6, "law and crime": 0.5, "arts and culture": 0.5, "sports": 0.4,
}
TIER_WEIGHT = {1: 1.0, 2: 0.8, 3: 0.6, 4: 0.3, None: 0.5}
# A story becomes a write_event task at this priority. Chosen so that about the top 12.5% of clusters qualify (the
# middle of the 10–15% the owner asked for): on the first real run (844 candidates, 682 clusters, routed as now)
# the cluster at the 12.5th percentile from the top scored 64.86; rounded down, 64 lets 95 clusters (13.9%) through.
# Re-derive it the same way when the formula changes (docs/adr/0022-ingestion-tuning.md).
WRITE_EVENT_THRESHOLD = 64.0
MAX_TASK_UPDATES = 150
DUP_THRESHOLD = 0.5
WINDOW_DAYS = 60
SIGNAL_MIN_CLUSTERS, SIGNAL_MIN_DAYS = 4, 3
SIGNAL_KINDS = {"polity", "org", "event"}
PRECISION_WINDOW = {"day": 0.05, "month": 0.15, "year": 1.0}


def _h(s: str, n=10) -> str:
    return hashlib.sha1(s.encode()).hexdigest()[:n]


def _date(c) -> date | None:
    d = (c.details or {}).get("date")
    return date.fromisoformat(d) if d else None


def load(window_days=WINDOW_DAYS):
    since = timezone.now().date() - timedelta(days=window_days)
    qs = (Candidate.objects.filter(status__in=["queued", "claimed"]).exclude(kind="new_branch_signal")
          .prefetch_related("entities").order_by("id"))
    return [c for c in qs if (_date(c) or since) >= since]


# Routing ---------------------------------------------------------------------------------------------------------
def roles_of(c) -> dict:
    """{qid: role} for a candidate: as its source recorded them, with the portal item's story article as "story"."""
    roles = dict((c.details or {}).get("roles", {}))
    if story := (c.details or {}).get("topic_qid"):
        roles[story] = "story"
    return roles


def route(cands, router: Router):
    for c in cands:
        roles = roles_of(c)
        ents = [(e, roles.get(e.qid, "item")) for e in c.entities.all()]
        boost = {s: YEAR_PAGE_BOOST for s in (c.details or {}).get("branches", [])} if c.details.get("source") == "year_page" else None
        scores, hits = router.score(ents, c.y_guess, boost)
        c._scores, c._hits = scores, hits


# Duplicates against existing events ------------------------------------------------------------------------------
def event_duplicates(cands) -> dict[int, tuple]:
    """{candidate id: (event id, similarity)} for the best pg_trgm match inside the event's date window."""
    ids = [c.pk for c in cands if c.y_guess is not None]
    if not ids:
        return {}
    sql = """
        SELECT c.id, e.entry_ptr_id, e.y, e.precision,
               GREATEST(similarity(lower(e.title), lower(c.title)),
                        similarity(lower(e.title), lower(coalesce(c.details->>'topic', ''))),
                        strict_word_similarity(lower(e.title), lower(c.summary))) AS sim
        FROM ingest_candidate c
        JOIN timeline_event e ON e.y BETWEEN c.y_guess - 1.5 AND c.y_guess + 1.5
        WHERE c.id = ANY(%s)
    """
    best = {}
    by_id = {c.pk: c for c in cands}
    with connection.cursor() as cur:
        cur.execute(sql, [ids])
        for cid, eid, ey, prec, sim in cur.fetchall():
            if abs(ey - by_id[cid].y_guess) > PRECISION_WINDOW.get(prec, 1.5):
                continue
            if sim >= DUP_THRESHOLD and (cid not in best or sim > best[cid][1]):
                best[cid] = (eid, round(float(sim), 3))
    return best


# Clustering ------------------------------------------------------------------------------------------------------
def base_key(c) -> str:
    d = c.details or {}
    if d.get("source") == "portal":
        if d.get("topic_qid"):
            return f"topic:{d['topic_qid']}:{d['date'][:7]}"
        return f"item:{d['date']}:{_h(c.summary)}"
    if d.get("source") == "year_page":
        return f"item:{d['date']}:{_h(c.summary)}"
    return f"news:{_h(d.get('url') or c.source_key)}"


def _urls(c) -> set[str]:
    from .extract import canonical_url

    d = c.details or {}
    out = {canonical_url(x["url"]) for x in d.get("external", []) if x.get("url", "").startswith("http")}
    if d.get("url"):
        out.add(d["url"])
    return out


def cluster(cands) -> dict[int, str]:
    portal = [c for c in cands if c.details.get("source") == "portal"]
    keys = {c.pk: base_key(c) for c in cands}
    url_index = defaultdict(list)
    ent_index = defaultdict(list)
    for c in portal:
        for u in _urls(c):
            url_index[u].append(c)
        for e in c.entities.all():
            ent_index[e.qid].append(c)
    for c in cands:
        if c.details.get("source") == "portal":
            continue
        d = _date(c)
        # 1. a URL the portal item cites
        for u in sorted(_urls(c)):
            if url_index.get(u):
                keys[c.pk] = keys[min(url_index[u], key=lambda x: x.pk).pk]
                c.details["joined_by"] = f"url {u}"
                break
        else:
            # 2. shared entities within ±2 days
            score = Counter()
            for e in c.entities.all():
                w = 0.5 if e.kind == "polity" else 1.0
                for p in ent_index.get(e.qid, ()):
                    pd = _date(p)
                    if d and pd and abs((pd - d).days) <= 2:
                        score[p.pk] += w
            if score:
                best_pk, best = sorted(score.items(), key=lambda kv: (-kv[1], kv[0]))[0]
                if best >= 2.0:
                    keys[c.pk] = keys[best_pk]
                    c.details["joined_by"] = f"entities {best} with candidate {best_pk}"
    return keys


# Priority --------------------------------------------------------------------------------------------------------
def priority_parts(members, *, tiers: dict, dups: dict, today: date) -> dict:
    domains = set()
    for c in members:
        d = c.details
        if d.get("source") in ("portal", "year_page"):
            domains.add("wikipedia.org")
        domains |= {x.get("domain", "") for x in d.get("external", []) if x.get("domain")}
        if d.get("publisher"):
            domains.add(d["publisher"])
    n = len(domains)
    S = 1 - 0.6 ** n
    T = sum(TIER_WEIGHT.get(tiers.get(dm), 0.5) for dm in domains) / n if n else 0.5
    touched = set()
    for c in members:
        touched |= {s for s, v in getattr(c, "_scores", {}).items() if v >= TOUCH_THRESHOLD}
    B = min(len(touched), 4) / 4
    C = max([CATEGORY_WEIGHT.get((c.details.get("category") or "").lower(), 0.5) for c in members] or [0.5])
    newest = max([_date(c) for c in members if _date(c)] or [today])
    R = 0.5 ** (max((today - newest).days, 0) / 30)
    views = None
    topic_qids = {c.details.get("topic_qid") for c in members if c.details.get("topic_qid")}
    ents = {e.qid: e for c in members for e in c.entities.all()}
    topic_views = [ents[q].pageviews_30d for q in topic_qids if q in ents and ents[q].pageviews_30d]
    if topic_views:
        views = max(topic_views)
    else:
        vs = [e.pageviews_30d for e in ents.values() if e.kind in ("event", "person", "org") and e.pageviews_30d]
        views = max(vs) if vs else 0
    P = min(1.0, math.log10(1 + (views or 0)) / 6)
    sim = max([dups[c.pk][1] for c in members if c.pk in dups] or [0])
    D = 1 - 0.8 * sim if sim >= DUP_THRESHOLD else 1.0
    total = 100 * (0.25 * S + 0.10 * T + 0.15 * B + 0.15 * C + 0.15 * R + 0.20 * P) * D
    return {"sources": n, "S": round(S, 3), "T": round(T, 3), "B": round(B, 3), "C": round(C, 3), "R": round(R, 3), "P": round(P, 3),
            "views": views or 0, "D": round(D, 3), "priority": round(total, 2), "domains": sorted(domains)[:20], "branches": sorted(touched)}


# Task payloads ---------------------------------------------------------------------------------------------------
def build_payload(key, members, parts, *, dups, events, publishers) -> dict:
    from .extract import excerpt

    members = sorted(members, key=lambda c: (c.details.get("date", ""), c.pk), reverse=True)
    lead = max(members, key=lambda c: (c.details.get("source") == "portal", len(c.entities.all()), -c.pk))
    scores = Counter()
    for c in members:
        for s, v in getattr(c, "_scores", {}).items():
            scores[s] += v
    branches = [{"slug": s, "name": Branch.objects.filter(slug=s).values_list("name", flat=True).first(), "score": round(v, 3)}
                for s, v in suggested(scores)]
    sources, seen = [], set()
    for c in members:
        d = c.details
        rows = [{"url": x["url"], "label": x.get("label") or x.get("title", ""), "domain": x.get("domain", "")} for x in d.get("external", [])]
        if d.get("url"):
            rows.append({"url": d["url"], "label": c.title, "domain": d.get("publisher", ""), "excerpt": excerpt(c.summary, 25)})
        for r in rows:
            if r["url"] in seen or len(sources) >= 15:
                continue
            seen.add(r["url"])
            p = publishers.get(r["domain"])
            sources.append({**r, "tier": p.tier if p else None, "fetch_policy": p.fetch_policy if p else "allowed", "via_candidate": c.pk})
    ents, seen_q = [], set()
    topic_q = lead.details.get("topic_qid")
    for c in members:
        for e in sorted(c.entities.all(), key=lambda e: (e.qid != topic_q, e.kind == "concept", e.qid)):
            if e.qid in seen_q or len(ents) >= 15:
                continue
            seen_q.add(e.qid)
            ents.append({"qid": e.qid, "label": e.label, "kind": e.kind, "description": e.description, "lat": e.lat, "lon": e.lon,
                         "wikipedia": article_url(e.enwiki_title) if e.enwiki_title else None})
    dup_rows = []
    for c in members:
        if c.pk in dups:
            ev = events.get(dups[c.pk][0])
            if ev and all(r["event"] != ev.slug for r in dup_rows):
                dup_rows.append({"event": ev.slug, "title": ev.title, "when": ev.when, "similarity": dups[c.pk][1]})
    dates = sorted(c.details["date"] for c in members if c.details.get("date"))
    topic = lead.details.get("topic", "")
    return {
        "cluster_key": key, "priority": parts["priority"], "priority_parts": parts,
        "suggested": {"branches": branches, "when": lead.when_text, "y": lead.y_guess, "precision": lead.precision,
                      "first_date": dates[0] if dates else None, "last_date": dates[-1] if dates else None,
                      "title_hint": topic or lead.title[:60], "link_branches": [b["slug"] for b in branches[1:]]},
        "story_article": article_url(topic) if topic else None,
        "items": [{"candidate": c.pk, "source": c.details.get("source"), "date": c.details.get("date"), "category": c.details.get("category", ""),
                   "text": c.summary[:1200], "attribution": c.details.get("attribution", ""), "document": c.details.get("document_url", "")} for c in members[:12]],
        "items_total": len(members),
        "sources": sources, "entities": ents, "possible_duplicates": dup_rows,
        "instructions": "Skill: .claude/skills/drain-write-events. Read (fetch) at least one source before citing it; browser_only sources in a browser.",
    }


def sync_task_states(counts):
    """Candidates follow their write_event task: claimed → claimed; done → accepted (result has an entry) or rejected."""
    for t in AgentTask.objects.filter(kind="write_event", created_by=ACTOR).exclude(status="queued").only("id", "status", "result", "payload", "claimed_by", "completed_at"):
        key = (t.payload or {}).get("cluster_key")
        if not key:
            continue
        qs = Candidate.objects.filter(cluster_key=key, status__in=["queued", "claimed"])
        if t.status == "claimed":
            counts["candidates_claimed"] += qs.filter(status="queued").update(status="claimed")
        elif t.status == "done":
            if t.completed_at:
                qs = qs.filter(created_at__lte=t.completed_at)
            slug = (t.result or {}).get("entry")
            from timeline.models import Entry

            entry = Entry.objects.filter(slug=slug).first() if slug else None
            n = qs.update(status="accepted" if entry else "rejected", result_entry=entry, decided_by=t.claimed_by or "agent:unknown", decided_at=t.completed_at or timezone.now())
            counts["candidates_decided"] += n
        elif t.status in ("failed", "cancelled"):
            counts["candidates_requeued"] += qs.filter(status="claimed").update(status="queued")


# New-branch signals ----------------------------------------------------------------------------------------------
def signals(cands, keys, router: Router, counts, today: date):
    seen = defaultdict(lambda: {"clusters": set(), "days": set(), "candidates": []})
    for c in cands:
        d = _date(c)
        for e in c.entities.all():
            s = seen[e.qid]
            s["clusters"].add(keys[c.pk])
            if d:
                s["days"].add(d)
            if len(s["candidates"]) < 10:
                s["candidates"].append(c.pk)
    eligible = {q for q, s in seen.items() if len(s["clusters"]) >= SIGNAL_MIN_CLUSTERS and len(s["days"]) >= SIGNAL_MIN_DAYS}
    from .candidates import decimal_year

    live = set()
    for e in Entity.objects.filter(qid__in=eligible):
        if e.qid in router.by_qid:
            continue
        if e.kind not in SIGNAL_KINDS and not (set((e.facts or {}).get("P31", [])) & MOVEMENT_CLASSES):
            continue
        s = seen[e.qid]
        via = sorted({slug for c in (e.facts or {}).get("P17", []) for _, slug, *_ in router.by_qid.get(c, [])})
        first, last = min(s["days"]), max(s["days"])
        pr = round(min(100.0, 8 * len(s["clusters"]) + 4 * len(s["days"])), 2)
        sig, _ = Candidate.objects.update_or_create(source_key=f"signal:{e.qid}", defaults=dict(
            kind="new_branch_signal", title=f"Possible new branch: {e.label}"[:300],
            summary=f"{e.label} ({e.description or e.kind}) appears in {len(s['clusters'])} stories on {len(s['days'])} days "
                    f"between {first} and {last}, and no branch is mapped to {e.qid}." + (f" Its country routes to: {', '.join(via)}." if via else ""),
            when_text="", y_guess=decimal_year(today), precision="day", priority=pr, created_by=ACTOR,
            details={"qid": e.qid, "label": e.label, "kind": e.kind, "clusters": len(s["clusters"]), "days": len(s["days"]),
                     "first": first.isoformat(), "last": last.isoformat(), "sample_candidates": s["candidates"], "country_routes_to": via,
                     "wikipedia": article_url(e.enwiki_title) if e.enwiki_title else None},
        ))
        if set(sig.entities.values_list("pk", flat=True)) != {e.pk}:
            sig.entities.set([e])  # governance.review.new_branch_signals reads the signal's entity
        live.add(f"signal:{e.qid}")
        counts["signals"] += 1
    # A signal whose entity has since been mapped to a branch is settled.
    for c in Candidate.objects.filter(kind="new_branch_signal", status="queued"):
        if c.details.get("qid") in router.by_qid:
            c.status, c.decided_by, c.decided_at = "rejected", ACTOR, timezone.now()
            c.details = {**c.details, "settled": "now routed by BranchEntity"}
            c.save(update_fields=["status", "decided_by", "decided_at", "details"])
            counts["signals_settled"] += 1


def run(ctx):
    """Route, de-duplicate, cluster, prioritize; queue write_event tasks; raise new-branch signals."""
    counts = ctx.counts
    today = timezone.now().date()
    sync_task_states(counts)
    router = Router()
    cands = load(int(ctx.opt("window_days", WINDOW_DAYS)))
    counts["candidates"] = len(cands)
    route(cands, router)
    dups = event_duplicates(cands)
    keys = cluster(cands)
    by_key = defaultdict(list)
    for c in cands:
        by_key[keys[c.pk]].append(c)
    domains = {x.get("domain") for c in cands for x in c.details.get("external", [])} | {c.details.get("publisher") for c in cands} | {"wikipedia.org"}
    publishers = {p.domain: p for p in Publisher.objects.filter(domain__in=[d for d in domains if d])}
    tiers = {d: p.tier for d, p in publishers.items()}
    events = {e.pk: e for e in Event.objects.filter(pk__in=[v[0] for v in dups.values()])}
    cluster_parts = {k: priority_parts(m, tiers=tiers, dups=dups, today=today) for k, m in by_key.items()}
    for c in cands:
        parts = cluster_parts[keys[c.pk]]
        dup = dups.get(c.pk)
        new = dict(branch_scores=c._scores, top_branch_id=Branch.objects.filter(slug=top_branch(c._scores)).values_list("pk", flat=True).first() if c._scores else None,
                   cluster_key=keys[c.pk], priority=parts["priority"], duplicate_of_id=dup[0] if dup else None, similarity=dup[1] if dup else None)
        details = {**c.details, "routing": c._hits, "priority_parts": {k: v for k, v in parts.items() if k not in ("domains",)}}
        if any(getattr(c, k) != v for k, v in new.items()) or details != c.details:
            for k, v in new.items():
                setattr(c, k, v)
            c.details = details
            c.save(update_fields=[*new, "details"])
            counts["candidates_updated"] += 1
    counts["clusters"] = len(by_key)
    threshold = float(ctx.opt("threshold", WRITE_EVENT_THRESHOLD))
    ranked = sorted(((k, cluster_parts[k]) for k in by_key), key=lambda kv: (-kv[1]["priority"], kv[0]))
    qualifying = [(k, p) for k, p in ranked if p["priority"] >= threshold
                  and any(c.details.get("source") in ("portal", "year_page") for c in by_key[k])]
    counts["clusters_over_threshold"] = len(qualifying)
    # The daily cap counts tasks this job created since local midnight, whatever their state now.
    midnight = timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)
    room = max(0, int(ctx.opt("per_day", settings.WRITE_EVENT_TASKS_PER_DAY))
               - AgentTask.objects.filter(kind="write_event", created_by=ACTOR, created_at__gte=midnight).count())
    for k, parts in qualifying[: int(ctx.opt("max_tasks", MAX_TASK_UPDATES))]:
        members = by_key[k]
        is_open = AgentTask.objects.filter(kind="write_event", dedupe_key=f"cluster:{k}", status__in=["queued", "claimed"]).exists()
        if not is_open and room <= 0:
            counts["tasks_held_by_daily_cap"] += 1
            continue
        payload = build_payload(k, members, parts, dups=dups, events=events, publishers=publishers)
        lead = Candidate.objects.get(pk=payload["items"][0]["candidate"])
        task, created = queue.enqueue("write_event", created_by=ACTOR, dedupe_key=f"cluster:{k}", priority=int(round(parts["priority"])),
                                      payload=payload, target_candidate=lead)
        if created:
            counts["tasks_created"] += 1
            room -= 1
        elif task.status == "queued":
            old = {**(task.payload or {})}
            keep = {x: old[x] for x in ("suggested_sources",) if x in old}
            if {**payload, **keep} != old or task.priority != int(round(parts["priority"])):
                task.payload, task.priority = {**payload, **keep}, int(round(parts["priority"]))
                task.save(update_fields=["payload", "priority"])
                counts["tasks_updated"] += 1
    signals(cands, keys, router, counts, today)
