"""Applying a validated task result through the service layer (docs/adr/0017-agent-api.md).

Everything runs inside `revising("agent:<name>", reason=…, task=task)`, so every canonical row it writes leaves a
Revision linked to the task, and the database trigger still has the last word. What an agent writes lands in review:

- write_event / audit: new events are created with status `review`, with their record claim, the evidence for each
  cite (method agent_read unless the cite says browser_read), location and link. Never `published`: the owner (or
  `facts publish`) publishes, under the publishing rule (ADR 0010).
- verify_claim: evidence through `evidence.services.record_evidence` (which recomputes the claim); suggestions marked
  accepted or rejected. A corrected text is kept in the result for the owner (`proposed_text`), not applied.
- review_branch_proposal: reject is recorded on the proposal; accept stores the agent's operations on it with status
  `accepted`, for the owner to run with `manage.py branches apply <id>` (structure changes reach the page at once).
- map_branch_entities: routing rows (BranchEntity, not canonical).

Each applier returns a summary that is stored in the task's result under "applied".
"""

from django.utils import timezone

from evidence.conflicts import citation_for
from evidence.models import Claim, Evidence
from evidence.services import record_evidence
from evidence.sweep import reassess
from revisions import revising
from timeline import services
from timeline.models import Branch, Entry, Event, EventLink, Location, Status
from work.models import AgentTask


class ApplyError(Exception):
    """The result is well-formed but can't be applied (an unknown branch, an id that exists, an uncitable URL …)."""


def _create_event(ev: dict, actor: str) -> str:
    slug = ev["id"]
    if Entry.objects.filter(slug=slug).exists():
        raise ApplyError(f"an entry {slug!r} already exists: pick another id, or decide 'duplicate'")
    branch = Branch.objects.filter(slug=ev["branch"]).first()
    if branch is None:
        raise ApplyError(f"no branch {ev['branch']!r}")
    if ev.get("end") is not None and ev["end"] <= ev["y"]:
        raise ApplyError("end must be after y")
    event, _ = services.save_event(slug, branch=branch, y=ev["y"], end=ev.get("end"), when=ev["when"], title=ev["title"], text=ev["text"],
                                   imp=ev["imp"], why="", status=Status.REVIEW)
    if ev.get("after"):
        if not Event.objects.filter(slug=ev["after"]).exists():
            raise ApplyError(f"after: no event {ev['after']!r}")
        services.place(event.entry_ptr, after=ev["after"])
    if ev.get("link"):
        target = Branch.objects.filter(slug=ev["link"]).first()
        if target is None:
            raise ApplyError(f"link: no branch {ev['link']!r}")
        services.apply_changes(EventLink(event=event, branch=target, position=0), {})
    if g := ev.get("geo"):
        services.apply_changes(Location(entry=event.entry_ptr), {"scope": g["scope"], "lat": g.get("lat"), "lon": g.get("lon"), "radius_km": g.get("r"),
                                                                 "label": g.get("label"), "src": g.get("src")})
    claim = Claim(entry=event.entry_ptr, field="as_written", key="")
    services.apply_changes(claim, {"value": {"when": ev["when"], "title": ev["title"], "text": ev["text"]}})
    for i, c in enumerate(ev["cites"]):
        cit = citation_for(c["u"], c["t"])
        if cit is None:
            raise ApplyError(f"cites[{i}]: {c['u']} can't be cited (https only; never a forbidden publisher such as openstax.org)")
        services.apply_changes(Evidence(claim=claim, citation=cit, position=i), {
            "stance": "supports", "cited_title": c["t"], "cited_kind": c.get("k", ""), "checked_by": actor, "method": c.get("method", "agent_read"),
            "checked_at": timezone.now(), "excerpt": " ".join(c.get("excerpt", "").split()[:25]), "content_hash": cit.content_hash,
        })
    reassess([claim.pk])
    return slug


def write_event(task: AgentTask, result: dict, actor: str) -> dict:
    d = result["decision"]
    if d == "written":
        slug = _create_event(result["event"], actor)
        result["entry"] = slug
        return {"entry": slug, "status": "review"}
    if d == "duplicate":
        if not Entry.objects.filter(slug=result["entry"], kind="event").exists():
            raise ApplyError(f"duplicate of {result['entry']!r}: no such event")
        return {"entry": result["entry"]}
    result["entry"] = None
    return {"entry": None}


def audit(task: AgentTask, result: dict, actor: str) -> dict:
    slugs = [_create_event(ev, actor) for ev in result["events"]]
    result["entries"] = slugs
    return {"entries": slugs, "status": "review"}


def verify_claim(task: AgentTask, result: dict, actor: str) -> dict:
    from ingest.models import SuggestedSource

    claim = Claim.objects.filter(pk=result["claim"]).select_related("entry").first()
    if claim is None:
        raise ApplyError(f"no claim {result['claim']}")
    if task.target_claim_id and task.target_claim_id != claim.pk:
        raise ApplyError(f"this task is about claim {task.target_claim_id}, not {claim.pk}")
    family = set(Claim.objects.filter(entry_id=claim.entry_id).values_list("pk", flat=True))
    recorded = []
    for i, e in enumerate(result["evidence"]):
        target_id = e.get("claim", claim.pk)
        if target_id not in family:
            raise ApplyError(f"evidence[{i}]: claim {target_id} is not a claim of {claim.entry.slug}")
        target = Claim.objects.get(pk=target_id)
        try:
            ev = record_evidence(target, url=e["url"], stance=e["stance"], checked_by=actor, excerpt=e.get("excerpt", ""),
                                 method=e.get("method", "agent_read"), title=e.get("title", ""), found_value=e.get("found"))
        except ValueError as err:
            raise ApplyError(f"evidence[{i}]: {err}") from err
        recorded.append(ev.pk)
    sugg = result.get("suggestions") or {}
    decided = {}
    for status in ("accepted", "rejected"):
        ids = sugg.get(status, [])
        if ids:
            qs = SuggestedSource.objects.filter(pk__in=ids, claim_id__in=family)
            decided[status] = qs.update(status=status, decided_by=actor)
    claim.refresh_from_db()
    return {"claim": claim.pk, "status": claim.status, "confidence": claim.confidence, "recorded": recorded, "suggestions": decided,
            "proposed_text": bool(result.get("proposed_text"))}


def review_branch_proposal(task: AgentTask, result: dict, actor: str) -> dict:
    from governance import operations
    from governance.models import BranchProposal

    p = BranchProposal.objects.select_for_update().filter(pk=result["proposal"]).first()
    if p is None:
        raise ApplyError(f"no proposal {result['proposal']}")
    if task.target_proposal_id and task.target_proposal_id != p.pk:
        raise ApplyError(f"this task is about proposal {task.target_proposal_id}, not {p.pk}")
    if p.status != "proposed":
        raise ApplyError(f"proposal {p.pk} is {p.status}")
    now = timezone.now()
    if result["decision"] == "reject":
        p.status, p.decided_by, p.decided_at, p.decision_note = "rejected", actor, now, result["note"]
        p.save(update_fields=["status", "decided_by", "decided_at", "decision_note"])
        return {"proposal": p.pk, "status": "rejected"}
    problems = operations.validate(result["operations"])
    if problems:
        raise ApplyError("; ".join(problems))
    p.payload = {**p.payload, "accepted": {"operations": result["operations"], "by": actor, "at": now.isoformat(timespec="seconds"),
                                           "task": task.pk, "note": result["note"]}}
    p.status, p.decided_by, p.decided_at, p.decision_note = "accepted", actor, now, result["note"]
    p.save(update_fields=["payload", "status", "decided_by", "decided_at", "decision_note"])
    return {"proposal": p.pk, "status": "accepted", "next": f"the owner runs `manage.py branches apply {p.pk}` (it uses these operations)"}


def map_branch_entities(task: AgentTask, result: dict, actor: str) -> dict:
    from ingest.models import BranchEntity, Entity

    branch = Branch.objects.filter(slug=result["branch"]).first()
    if branch is None:
        raise ApplyError(f"no branch {result['branch']!r}")
    if task.target_entry_id and task.target_entry_id != branch.entry_ptr_id:
        raise ApplyError(f"this task is about another branch, not {branch.slug}")
    mapped = []
    for e in result["entities"]:
        # An item we haven't fetched yet is created as a stub: the daily refresh_entities job reads its facts.
        ent, _ = Entity.objects.get_or_create(qid=e["qid"], defaults={"label": e.get("label") or e["qid"]})
        _, created = BranchEntity.objects.get_or_create(branch=branch, entity=ent, defaults={"role": e.get("role", ""), "weight": 1.0,
                                                                                             "note": f"task #{task.pk}", "created_by": actor})
        mapped.append({"qid": e["qid"], "created": created})
    return {"branch": branch.slug, "mapped": mapped}


APPLIERS = {"write_event": write_event, "audit": audit, "verify_claim": verify_claim,
            "review_branch_proposal": review_branch_proposal, "map_branch_entities": map_branch_entities}


def apply(task: AgentTask, result: dict, actor: str) -> dict:
    """Apply `result` (already schema-valid) for `task`, inside revising(). Raises ApplyError; then nothing is kept."""
    with revising(actor, reason=f"{task.kind} #{task.pk} (agent API)", task=task):
        return APPLIERS[task.kind](task, result, actor)
