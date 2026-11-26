"""The self-healing loop: `manage.py facts sweep` (docs/fact-checking.md, "The sweep").

One deterministic pass over the fact base, as `job:facts_sweep`:

1. **Split**: derive every entry's atomic claims (evidence/claims.py) and bring its child claims in line.
2. **Link health**: baseline evidence hashes; find dead or changed citations (evidence/staleness.py).
3. **Conflicts**: date conflicts from ingestion's matched candidates (evidence/conflicts.py).
4. **Schedule and assess**: every claim's `recheck_after` and `recheck_reason`, then its status and confidence.
5. **Tasks**: `verify_claim` tasks for what needs an agent (conflicts, dead or changed pages, due rechecks, and
   published events that rest on Wikipedia alone), highest priority first, capped per run and in total.

Only real changes are written (so a re-run on unchanged input writes nothing and leaves no Revision), and the same
input and `today` give the same output.
"""

from collections import defaultdict
from datetime import date

from django.db import transaction
from django.db.models import Count, Max

from revisions import revising
from timeline.models import Branch, Entry, Event, Location, Status
from timeline.services import apply_changes
from work.models import AgentTask
from work.queue import enqueue

from . import claims as splitter
from . import conflicts, policy, staleness
from .confidence import EVIDENCE_FIELDS, assess_detail, wikipedia_only
from .models import Claim, Evidence

ACTOR = "job:facts_sweep"
RECORD_FIELDS = ("as_written", "why", "origin")


class _DryRun(Exception):
    pass


# ── 1. split ──

def _branch_entity_labels() -> dict[int, list[str]]:
    try:
        from ingest.models import BranchEntity
    except ImportError:  # pragma: no cover
        return {}
    out = defaultdict(list)
    for branch_id, label in BranchEntity.objects.values_list("branch_id", "entity__label").order_by("branch_id", "entity__label"):
        out[branch_id].append(label)
    return out


def split_all(today: date, entries=None) -> dict:
    """Bring atomic claims in line for every entry, or only for `entries` (entry ids: an edit re-splits just its own)."""
    stats = defaultdict(int)
    parent_qs, child_qs, loc_qs = Claim.objects.filter(field="as_written", key="", parent__isnull=True), Claim.objects.filter(parent__isnull=False), Location.objects.all()
    branch_qs, event_qs = Branch.objects.exclude(status=Status.RETRACTED), Event.objects.exclude(status=Status.RETRACTED)
    if entries is not None:
        entries = list(entries)
        parent_qs, child_qs, loc_qs = parent_qs.filter(entry_id__in=entries), child_qs.filter(entry_id__in=entries), loc_qs.filter(entry_id__in=entries)
        branch_qs, event_qs = branch_qs.filter(pk__in=entries), event_qs.filter(pk__in=entries)
    parents = {c.entry_id: c for c in parent_qs}
    children = defaultdict(list)
    for c in child_qs.annotate(evidence_count=Count("evidence")):
        children[c.entry_id].append(c)
    locations = {loc.entry_id: loc for loc in loc_qs}
    labels = _branch_entity_labels()
    pending = []
    objs = list(branch_qs) + list(event_qs)
    for x in sorted(objs, key=lambda x: x.pk):
        parent = parents.get(x.pk)
        if parent is None:
            continue
        lab = labels.get(x.pk if x.kind == "branch" else x.branch_id, [])
        for k, v in splitter.sync(x, parent, children.get(x.pk, []), location=locations.get(x.pk), entity_labels=lab, today=today, pending=pending).items():
            stats[k] += v
    if pending:
        Claim.objects.bulk_create(pending, batch_size=2000)
    return dict(stats)


# ── 2. link health ──

def link_health(today: date) -> tuple[dict, dict[int, str]]:
    """Baseline evidence hashes and find each claim's link problem. → (stats, {claim_id: problem})."""
    dead = policy.get("dead_http_status")
    stats, problems = defaultdict(int), {}
    rows = (
        Evidence.objects.filter(stance__in=["supports", "partial"])
        .values("id", "claim_id", "checked_at", "content_hash", "citation__last_checked_at", "citation__http_status", "citation__content_hash")
        .order_by("id")
    )
    baseline = []
    for r in rows:
        ev = {"checked_at": r["checked_at"], "content_hash": r["content_hash"], "cit_checked_at": r["citation__last_checked_at"],
              "http_status": r["citation__http_status"], "cit_hash": r["citation__content_hash"]}
        problem = staleness.link_problem(ev, dead)
        if problem:
            stats[problem] += 1
            # A dead link outranks a changed page for the same claim.
            if problems.get(r["claim_id"]) != "dead_link":
                problems[r["claim_id"]] = problem
        elif ev["cit_hash"] and ev["content_hash"] != ev["cit_hash"] and (not ev["content_hash"] or (ev["checked_at"] and ev["cit_checked_at"] and ev["checked_at"] >= ev["cit_checked_at"])):
            baseline.append((r["id"], ev["cit_hash"]))
    for ev in Evidence.objects.filter(pk__in=[i for i, _ in baseline]):
        apply_changes(ev, {"content_hash": dict(baseline)[ev.pk]})
        stats["baselined"] += 1
    return dict(stats), problems


# ── 4. schedule and assess ──

def _profiles(today: date) -> dict[int, tuple]:
    import re

    ongoing_re = re.compile(policy.get("ongoing_words"), re.I)
    out = {}
    for pk, y, end, when, precision in Event.objects.values_list("pk", "y", "end", "when", "precision"):
        out[pk] = (max(y, end) if end is not None else y, bool(ongoing_re.search(when or "")), precision)
    last = dict(Event.objects.values("branch_id").annotate(m=Max("y")).values_list("branch_id", "m"))
    for pk, start, end, end_when, sp, ep in Branch.objects.values_list("pk", "start", "end", "end_when", "start_precision", "end_precision"):
        if end is not None:
            out[pk] = (end, bool(ongoing_re.search(end_when or "")), ep or sp)
        else:
            out[pk] = (last.get(pk, start), False, sp)
    return out


def reassess_all(today: date, problems: dict[int, str] | None = None, claim_ids=None, schedule: bool = True) -> dict:
    problems = problems or {}
    stats = defaultdict(int)
    profiles = _profiles(today)
    ev_rows = defaultdict(list)
    qs = Evidence.objects.all() if claim_ids is None else Evidence.objects.filter(claim_id__in=claim_ids)
    for row in qs.order_by("claim_id", "position").values_list("claim_id", *EVIDENCE_FIELDS):
        ev_rows[row[0]].append(row[1:])
    claims_qs = Claim.objects.all() if claim_ids is None else Claim.objects.filter(pk__in=claim_ids)
    for claim in claims_qs.order_by("pk"):
        rows = ev_rows.get(claim.pk, [])
        profile = profiles.get(claim.entry_id, (None, False, None))
        kw = staleness.assess_kwargs(claim, today, profile)
        values = {}
        if not schedule:
            values = {"recheck_after": claim.recheck_after}
        elif rows:
            checks = [r[4] for r in rows if r[4] is not None and r[3] != "legacy"]
            recheck, kept = staleness.schedule(existing=claim.recheck_after, requested_at=claim.recheck_requested_at, last_check=max(checks) if checks else None,
                                               created=claim.created_at.date(), interval=kw["interval_days"])
            # Kept an earlier date someone else set: keep their reason, or call it "requested".
            reason = (claim.recheck_reason if claim.recheck_reason not in ("", "scheduled") else "requested") if kept else "scheduled"
            problem = problems.get(claim.pk)
            if problem and recheck > today:
                recheck, reason = today, problem
            values |= {"recheck_after": recheck, "recheck_reason": reason, "recheck_requested_at": claim.recheck_requested_at if kept else None}
        else:
            # Nothing to re-read: an unchecked part, or a claim whose evidence was all removed.
            values |= {"recheck_after": claim.recheck_after if claim.recheck_reason not in ("", "scheduled") else None,
                       "recheck_reason": claim.recheck_reason if claim.recheck_reason not in ("", "scheduled") else ""}
        d = assess_detail(rows, values["recheck_after"], today, **kw)
        values |= {"status": d["status"], "confidence": d["confidence"]}
        r = apply_changes(claim, values)
        stats[r] += 1
        stats[f"status.{d['status']}"] += 1
    return dict(stats)


# ── 5. tasks ──

def _entry_info(entry: Entry) -> dict:
    x = entry.concrete
    if x.kind == "event":
        return {"slug": x.slug, "kind": "event", "title": x.title, "when": x.when, "y": x.y, "end": x.end, "text": x.text, "branch": x.branch.slug, "imp": x.imp, "status": x.status}
    return {"slug": x.slug, "kind": "branch", "name": x.name, "start_when": x.start_when, "end_when": x.end_when, "text": x.text, "status": x.status}


def _page_diff(url: str) -> dict | None:
    """The change in a cited page since its previous version, from ingestion's documents (when it has them)."""
    import difflib
    import html
    import re

    from ingest.models import Document
    from ingest.store import read_raw

    doc = Document.objects.filter(canonical_url=url).first() or Document.objects.filter(url=url).order_by("-fetched_at").first()
    if doc is None or doc.version < 2:
        return None
    prev = doc.versions.filter(version__lt=doc.version).order_by("-version").first()
    old = ""
    if prev and prev.raw_path:
        data = read_raw(prev.raw_path)
        if data is not None:
            raw = data.decode("utf-8", "replace")
            old = html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"(?is)<(script|style).*?</\1>", " ", raw)))
    norm = lambda t: [ln.strip() for ln in re.split(r"(?<=[.!?])\s+|\n+", t) if ln.strip()]  # noqa: E731
    diff = list(difflib.unified_diff(norm(old), norm(doc.extracted_text), "before", "after", n=0, lineterm=""))
    return {"url": url, "version": doc.version, "changed_at": doc.changed_at.isoformat() if doc.changed_at else None,
            "diff": "\n".join(diff[:80])[:6000] if old else None, "new_text_excerpt": None if old else doc.extracted_text[:1500]}


def task_payload(claim: Claim, reason: str, today: date) -> dict:
    evidence = []
    for ev in claim.evidence.select_related("citation__publisher").order_by("position"):
        c = ev.citation
        evidence.append({
            "id": ev.pk, "position": ev.position, "stance": ev.stance, "url": c.url, "cited_title": ev.cited_title,
            "publisher": c.publisher.domain, "tier": c.publisher.tier, "fetch_policy": c.publisher.fetch_policy,
            "excerpt": ev.excerpt or None, "found_value": ev.found_value, "method": ev.method, "checked_at": ev.checked_at.isoformat() if ev.checked_at else None,
            "http_status": c.http_status, "archive_url": c.archive_url or None,
            "page_changed": bool(ev.content_hash and c.content_hash and ev.content_hash != c.content_hash),
        })
    rows = list(claim.evidence.values_list(*EVIDENCE_FIELDS))
    detail = assess_detail(rows, claim.recheck_after, today, **staleness.assess_kwargs(claim, today))
    payload = {
        "reason": reason, "rules_version": policy.RULES_VERSION,
        "claim": {"id": claim.pk, "field": claim.field, "key": claim.key, "value": claim.value, "status": claim.status,
                  "confidence": claim.confidence, "recheck_after": claim.recheck_after.isoformat() if claim.recheck_after else None,
                  "witnesses": detail["witnesses"], "conflicting": detail["conflicting"]},
        "entry": _entry_info(claim.entry),
        "evidence": evidence,
        "parts": [{"id": c.pk, "field": c.field, "key": c.key, "value": c.value} for c in Claim.objects.filter(parent=claim).order_by("field", "key")],
    }
    if claim.parent_id:
        payload["parent_claim"] = claim.parent_id
    if reason == "content_changed":
        payload["page_changes"] = [d for d in (_page_diff(e["url"]) for e in evidence if e["page_changed"]) if d]
    payload["todo"] = {
        "conflict": "Sources disagree: read both, then fix the entry (through the service layer), attribute the difference in its text, or mark the evidence unrelated.",
        "dead_link": "A cited page is dead: find the archived copy or a replacement source that supports the claim, and record what you read.",
        "content_changed": "A cited page changed: re-read it (see page_changes) and record whether it still supports the claim.",
        "value_changed": "The entry's wording changed since this part was checked: re-read the evidence against the new value.",
        "no_second_source": "This rests on Wikipedia alone: find a reputable non-Wikipedia source that explicitly supports it (SCHEMA.md citation rules) and add it.",
        "scheduled": "Due for its scheduled recheck: re-read the cited pages and record what they say.",
    }.get(reason, "Re-read the cited pages and record what they say.")
    return payload


def queue_tasks(today: date, actor: str = ACTOR) -> dict:
    stats = defaultdict(int)
    prio = policy.get("task_priority")
    imp = dict(Event.objects.values_list("pk", "imp"))
    published = set(Entry.objects.filter(status=Status.PUBLISHED).values_list("pk", flat=True))
    wanted = []
    # Stale and contested claims.
    for c in Claim.objects.filter(status__in=["stale", "contested"]).order_by("pk"):
        reason = "conflict" if c.status == "contested" else (c.recheck_reason if c.recheck_reason in prio or c.recheck_reason == "value_changed" else "scheduled")
        wanted.append((prio.get(reason, prio["scheduled"]), c.pk, reason))
    # Published events that rest on Wikipedia alone, past the grace period for current events.
    grace = policy.get("grace_days")
    ev_rows = defaultdict(list)
    for row in Evidence.objects.filter(claim__field="as_written", claim__key="", claim__entry__kind="event").values_list("claim_id", *EVIDENCE_FIELDS):
        ev_rows[row[0]].append(row[1:])
    recent = {pk for pk, y in Event.objects.values_list("pk", "y") if y >= today.year - 1}
    for c in Claim.objects.filter(field="as_written", key="", entry__kind="event", entry_id__in=published).exclude(status__in=["stale", "contested"]).only("pk", "entry_id", "created_at").order_by("pk"):
        rows = ev_rows.get(c.pk, [])
        if rows and not wikipedia_only(rows):
            continue
        if c.entry_id in recent and (today - c.created_at.date()).days <= grace:
            continue
        wanted.append((prio["no_second_source"], c.pk, "no_second_source"))
    stats["wanted"] = len(wanted)
    # Landmarks first within a priority, then the oldest claim.
    claim_entry = dict(Claim.objects.filter(pk__in=[w[1] for w in wanted]).values_list("pk", "entry_id"))
    wanted.sort(key=lambda w: (-w[0], imp.get(claim_entry[w[1]], 2), w[1]))
    open_keys = set(AgentTask.objects.filter(kind="verify_claim", status__in=["queued", "claimed"]).values_list("dedupe_key", flat=True))
    open_mine = AgentTask.objects.filter(kind="verify_claim", created_by=actor, status__in=["queued", "claimed"]).count()
    budget = max(0, min(policy.get("max_tasks_per_sweep"), policy.get("max_open_tasks") - open_mine))
    for p, claim_id, reason in wanted:
        key = f"claim:{claim_id}"
        if key in open_keys:
            stats["already_open"] += 1
            continue
        if budget <= 0:
            stats["deferred"] += 1
            continue
        claim = Claim.objects.select_related("entry").get(pk=claim_id)
        e_imp = imp.get(claim.entry_id, 2)
        enqueue("verify_claim", created_by=actor, dedupe_key=key, priority=p + (3 - e_imp) * 2, payload=task_payload(claim, reason, today), target_claim=claim, target_entry_id=claim.entry_id)
        stats[f"queued.{reason}"] += 1
        budget -= 1
    return dict(stats)


def reassess(claim_ids, today: date | None = None) -> dict:
    """Recompute status and confidence for some claims, leaving their recheck dates alone (the import uses this)."""
    return reassess_all(today or date.today(), {}, claim_ids=list(claim_ids), schedule=False)


def sweep(today: date | None = None, *, actor: str = ACTOR, split: bool = True, tasks: bool = True, dry_run: bool = False) -> dict:
    today = today or date.today()
    out = {"today": today.isoformat(), "rules_version": policy.RULES_VERSION}
    try:
        with revising(actor, reason=f"facts sweep {today} ({policy.RULES_VERSION})"):
            if split:
                out["split"] = split_all(today)
            out["links"], problems = link_health(today)
            with transaction.atomic():
                out["conflicts"] = conflicts.from_candidates(actor, today)
            out["assess"] = reassess_all(today, problems)
            if tasks:
                out["tasks"] = queue_tasks(today, actor)
            if dry_run:
                raise _DryRun
    except _DryRun:
        out["dry_run"] = True
    return out
