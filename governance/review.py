"""`manage.py branches metrics` and `branches review` (docs/branch-rules.md).

`snapshot()` stores a BranchMetric per branch (only when it differs from the branch's latest). `findings()` runs every
rule. `review()` turns findings into BranchProposals and `review_branch_proposal` tasks, with hysteresis:

- the same change (a finding's `key`) is never proposed twice: an open proposal is refreshed in place;
- an applied or accepted one is not proposed again;
- a rejected or reverted one comes back only after a cool-down, and only if its strength grew by `reject_regrowth`;
- undoing an applied change (merging branches a split created, splitting what a merge made) needs `undo_factor`
  times the usual strength (the rules read `ctx.protected`);
- an open proposal whose rule no longer fires is withdrawn, and its task cancelled.

THIN findings become `audit` tasks (fill in a sparse branch), not proposals.
"""

from collections import Counter, defaultdict
from datetime import date, timedelta

from django.db import transaction
from django.utils import timezone

from evidence.models import Evidence
from timeline.models import Connection, EventLink
from work.models import AgentTask
from work.queue import enqueue

from . import metrics as M_
from .models import BranchMetric, BranchProposal
from .rules import RULES, Finding, fmt_year
from .thresholds import METRICS_VERSION, RULES_VERSION, get

ACTOR = "job:branches_review"
OPEN = [BranchProposal.Status.PROPOSED]
DONE = [BranchProposal.Status.ACCEPTED, BranchProposal.Status.APPLIED]
DECLINED = [BranchProposal.Status.REJECTED, BranchProposal.Status.WITHDRAWN]


class Context:
    """What the rules read besides the metrics."""

    def __init__(self, today: date, M: dict, data: dict):
        self.today, self.now = today, data["now"]
        self.branches, self.geo = data["branches"], data["geo"]
        self.parents, self.into = data["parents"], data["into"]
        self._events = {e["slug"]: e for m in M.values() for e in m["_event_rows"]}
        ev_branch = {e["slug"]: m["branch"] for m in M.values() for e in m["_event_rows"]}
        pk_slug = {e["pk"]: e["slug"] for e in self._events.values()}
        self.connections = defaultdict(list)
        for s, t in Connection.objects.filter(source_id__in=pk_slug, target_id__in=pk_slug).values_list("source_id", "target_id"):
            a, b = pk_slug[s], pk_slug[t]
            if ev_branch[a] == ev_branch[b]:
                self.connections[ev_branch[a]].append((a, b))
        self.event_links = defaultdict(set)
        branch_slug = {b.pk: s for s, b in self.branches.items()}
        for ev, br in EventLink.objects.filter(event_id__in=pk_slug, branch_id__in=branch_slug).values_list("event_id", "branch_id"):
            self.event_links[pk_slug[ev]].add(branch_slug[br])
        self.urls = defaultdict(set)
        for entry_id, url in Evidence.objects.filter(claim__entry_id__in=pk_slug, claim__field="as_written", claim__key="").values_list("claim__entry_id", "citation__url"):
            self.urls[pk_slug[entry_id]].add(url)
        # What applied proposals made, for the undo threshold.
        self.protected = defaultdict(set)
        self._split_children = defaultdict(set)
        for p in BranchProposal.objects.filter(status=BranchProposal.Status.APPLIED):
            ops = (p.payload.get("applied") or {}).get("operations") or p.payload.get("operations", [])
            created = {o["id"] for o in ops if o["op"] == "create_branch"}
            if p.kind == "split" and p.branch_id:
                group = created | {p.branch.slug}
                for s in group:
                    self.protected["split-child"].add(s)
                    self._split_children[s] |= group
            if p.kind == "merge" and p.branch_id:
                self.protected["merge-survivor"].add(p.branch.slug)
        self.signals = new_branch_signals(today, M)

    def event(self, slug):
        return self._events[slug]

    def siblings(self, a, b) -> bool:
        """Both came out of the same applied split (so merging them would undo it)."""
        return b in self._split_children.get(a, set())


def new_branch_signals(today: date, M: dict) -> list[dict]:
    """Entities behind ingestion's `new_branch_signal` candidates that no branch routes, with how often and how long
    they have come up (distinct cluster keys, days between first and last document) and the likely parent branch."""
    from ingest.models import BranchEntity, Candidate

    mapped = set(BranchEntity.objects.values_list("entity_id", flat=True))
    sigs = Candidate.objects.filter(kind="new_branch_signal", status__in=["queued", "claimed"]).prefetch_related("entities")
    wanted = {e.pk: e for c in sigs for e in c.entities.all() if e.pk not in mapped}
    if not wanted:
        return []
    route = defaultdict(Counter)
    for entity_id, branch_slug, weight in BranchEntity.objects.values_list("entity_id", "branch__slug", "weight"):
        route[entity_id][branch_slug] += weight
    stats = {pk: {"clusters": set(), "dates": [], "ys": [], "parents": Counter(), "candidates": []} for pk in wanted}
    for c in Candidate.objects.filter(entities__in=list(wanted)).distinct().prefetch_related("entities", "documents").order_by("pk"):
        ents = {e.pk for e in c.entities.all()}
        dates = [d.published_at or d.fetched_at for d in c.documents.all()] or [c.created_at]
        for pk in ents & set(wanted):
            st = stats[pk]
            st["clusters"].add(c.cluster_key or f"candidate-{c.pk}")
            st["dates"] += [d.date() for d in dates if d]
            if c.y_guess is not None:
                st["ys"].append(c.y_guess)
            st["candidates"].append(c.pk)
            for other in ents - {pk}:
                st["parents"].update(route.get(other, {}))
            for b, score in (c.branch_scores or {}).items():
                st["parents"][b] += score
    out = []
    for pk, st in stats.items():
        e = wanted[pk]
        parents = [(b, w) for b, w in st["parents"].most_common() if b in M]
        out.append({
            "qid": e.qid, "label": e.label, "kind": e.kind, "clusters": len(st["clusters"]),
            "days": ((max(st["dates"]) - min(st["dates"])).days + 1) if st["dates"] else 0,
            "first_y": min(st["ys"]) if st["ys"] else M_.now_year(today), "candidates": st["candidates"][:50],
            "parent": parents[0][0] if parents else None, "parent_scores": dict(parents[:5]),
        })
    return sorted(out, key=lambda s: s["qid"])


def compute(today: date):
    data = {}
    M = M_.compute(today, data)
    return M, Context(today, M, data)


def findings(today: date | None = None) -> tuple[list[Finding], dict]:
    today = today or date.today()
    M, ctx = compute(today)
    out = []
    for rule in RULES:
        out += rule(M, ctx)
    return out, M


def snapshot(today: date | None = None, M: dict | None = None) -> dict:
    """Store each branch's metrics (only when they changed since its latest snapshot)."""
    today = today or date.today()
    if M is None:
        M, _ = compute(today)
    from timeline.models import Branch

    pk = dict(Branch.objects.values_list("slug", "pk"))
    latest = {}
    for m in BranchMetric.objects.order_by("branch_id", "-computed_at", "-id").distinct("branch_id"):
        latest[m.branch_id] = m.metrics
    stats = Counter()
    now = timezone.now()
    new = []
    import json

    for slug, m in M.items():
        body = json.loads(json.dumps(M_.public(m)))  # as JSONB gives it back (tuples → lists)
        if latest.get(pk[slug]) == body:
            stats["unchanged"] += 1
            continue
        new.append(BranchMetric(branch_id=pk[slug], computed_at=now, rules_version=METRICS_VERSION, metrics=body))
    BranchMetric.objects.bulk_create(new, batch_size=500)
    stats["created"] = len(new)
    return dict(stats)


def _task_payload(p: BranchProposal, f: Finding, M: dict) -> dict:
    involved = [s for s in [f.branch, *f.others] if s]
    return {
        "proposal": p.pk, "rule": f.rule, "kind": f.kind, "summary": f.summary, "strength": f.strength,
        "metrics": {s: {k: v for k, v in M_.public(M[s]).items() if k not in ("windows",)} for s in involved if s in M},
        "evidence": f.evidence,
        "operations": f.operations,
        "needs_agent": f.needs_agent,
        "how_to_decide": (
            "Read the evidence and the events involved. If the change is right, write the fields listed in needs_agent "
            "(names, texts and cites following site/SCHEMA.md; every cite fetched and read) and complete the task over the "
            "agent API with {\"decision\": \"accept\", \"proposal\": <id>, \"operations\": [...], \"note\": \"why\"}: the owner "
            "then runs `manage.py branches apply <proposal>`. If it is wrong, complete with {\"decision\": \"reject\", "
            "\"proposal\": <id>, \"note\": \"why\"} (ADR 0017)."
        ),
    }


def review(today: date | None = None, *, actor: str = ACTOR, dry_run: bool = False) -> dict:
    today = today or date.today()
    found, M = findings(today)
    stats = Counter()
    report = []
    with transaction.atomic():
        snap = snapshot(today, M)
        seen = set()
        for f in found:
            if f.kind == "fill":
                r = _thin_task(f, today, actor)
                stats[f"thin.{r}"] += 1
                report.append((f, r))
                continue
            seen.add(f.key)
            r = _propose(f, today, actor, M)
            stats[f"{f.rule}.{r}"] += 1
            report.append((f, r))
        # Withdraw open proposals whose rule no longer fires.
        for p in BranchProposal.objects.filter(status__in=OPEN, created_by=actor):
            if p.payload.get("key") not in seen:
                p.status, p.decided_by, p.decided_at, p.decision_note = BranchProposal.Status.WITHDRAWN, actor, timezone.now(), "the rule no longer fires"
                p.save(update_fields=["status", "decided_by", "decided_at", "decision_note"])
                AgentTask.objects.filter(target_proposal=p, status="queued").update(status="cancelled", completed_at=timezone.now())
                stats["withdrawn"] += 1
        if dry_run:
            transaction.set_rollback(True)
    return {"today": today.isoformat(), "rules_version": RULES_VERSION, "metrics": snap, "counts": dict(stats), "dry_run": dry_run,
            "findings": [{"rule": f.rule, "branch": f.branch, "others": f.others, "strength": f.strength, "result": r, "summary": f.summary} for f, r in report]}


def _propose(f: Finding, today: date, actor: str, M: dict) -> str:
    from timeline.models import Branch

    prior = list(BranchProposal.objects.filter(payload__key=f.key).order_by("-created_at", "-id"))
    open_p = next((p for p in prior if p.status in OPEN), None)
    if open_p is None:
        done = next((p for p in prior if p.status in DONE), None)
        if done:
            return "already_decided"
        declined = next((p for p in prior if p.status in DECLINED), None)
        if declined:
            then = (declined.payload or {}).get("strength", 0)
            cooled = declined.decided_at is None or declined.decided_at.date() + timedelta(days=get("reject_cooldown_days")) <= today
            if not cooled or f.strength < then * get("reject_regrowth"):
                return "held_back"
    branch = Branch.objects.filter(slug=f.branch).first() if f.branch else None
    import json

    f.evidence, f.operations = json.loads(json.dumps(f.evidence)), json.loads(json.dumps(f.operations))  # as JSONB stores them
    payload = {"key": f.key, "strength": f.strength, "operations": f.operations, "needs_agent": f.needs_agent, "rules_version": RULES_VERSION}
    if open_p is not None:
        p, result = open_p, "refreshed"
        changed = p.summary != f.summary or p.evidence != f.evidence or {k: p.payload.get(k) for k in payload} != payload
        if not changed:
            return "unchanged"
        p.summary, p.evidence, p.payload = f.summary, f.evidence, {**p.payload, **payload}
        p.save(update_fields=["summary", "evidence", "payload"])
    else:
        p = BranchProposal.objects.create(kind=f.kind, branch=branch, rule_id=f.rule, summary=f.summary, evidence=f.evidence, payload=payload, created_by=actor)
        result = "proposed"
    others = list(Branch.objects.filter(slug__in=f.others))
    p.other_branches.set(others)
    task_payload = _task_payload(p, f, M)
    task, created = enqueue("review_branch_proposal", created_by=actor, dedupe_key=f"proposal:{p.pk}", priority=30 + min(20, int(10 * f.strength)),
                            payload=task_payload, target_proposal=p, target_entry=branch)
    if not created and task.status == "queued" and task.payload != task_payload:
        task.payload = task_payload
        task.save(update_fields=["payload"])
    return result


def _thin_task(f: Finding, today: date, actor: str) -> str:
    from timeline.models import Branch

    key = f"thin:{f.branch}"
    last = AgentTask.objects.filter(kind="audit", dedupe_key=key).order_by("-created_at").first()
    if last and last.status in ("queued", "claimed"):
        return "open"
    if last and last.completed_at and last.completed_at.date() + timedelta(days=get("thin")["fill_after_days"]) > today:
        return "recently_filled"
    payload = {"rule": f.rule, "action": "fill", "summary": f.summary, **f.evidence,
               "how": "Add the branch's missing landmark events (write_event style: SCHEMA.md, cited, through the service layer), "
                      "starting with the empty windows; complete this task over the agent API with {\"events\": [...]} (they land in review)."}
    enqueue("audit", created_by=actor, dedupe_key=key, priority=15, payload=payload, target_entry=Branch.objects.get(slug=f.branch))
    return "queued"


def digest_section() -> str:
    """Open branch proposals, for `manage.py digest`."""
    rows = list(BranchProposal.objects.filter(status__in=[*OPEN, "accepted"]).order_by("-created_at")[:20])
    out = [f"## Branch proposals ({len(rows)} open, {RULES_VERSION})", ""]
    out += [f"- #{p.pk} {p.rule_id} {p.branch.slug if p.branch_id else '(new)'}{' [accepted: apply or reject]' if p.status == 'accepted' else ''}: {p.summary[:160]}" for p in rows]
    thin = AgentTask.objects.filter(kind="audit", dedupe_key__startswith="thin:", status__in=["queued", "claimed"]).count()
    out.append(f"\nFill-in tasks for thin branches: {thin} open.")
    return "\n".join(out) + "\n"


__all__ = ["compute", "digest_section", "findings", "review", "snapshot", "fmt_year"]
