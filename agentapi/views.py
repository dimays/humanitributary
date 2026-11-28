"""The agent API under /api/agent/ (docs/adr/0017-agent-api.md). JSON in, JSON out, a bearer token on every
request. The queue endpoints are `work.queue` over HTTP (the same leases, the same SKIP LOCKED claims); `complete`
validates the result against its kind's schema and applies it through the service layer before marking the task done.

    GET  /api/agent/                       who you are, your scopes, the endpoints
    GET  /api/agent/schemas/<kind>          the result schema for a task kind
    GET  /api/agent/tasks/next?kind=…       peek at the best available task (repeat kind for several)
    POST /api/agent/tasks/claim             {"kinds": [...], "lease_minutes": 30} → the leased task, or {"task": null}
    GET  /api/agent/tasks/<id>              a task (yours, or any queued one)
    POST /api/agent/tasks/<id>/extend       {"minutes": 30}
    POST /api/agent/tasks/<id>/complete     {"result": {...}} → validated, applied (in review), done
    POST /api/agent/tasks/<id>/release      hand it back untouched
    POST /api/agent/tasks/<id>/fail         {"error": "…", "retry": true}
    GET  /api/agent/entries/<slug>          an entry, its claims (with status) and where it sits
    GET  /api/agent/branches/<slug>         a branch summary: its events, latest metrics, open proposals
    GET  /api/agent/claims/<id>             a claim with its evidence and parts (the verify_claim payload's shape)
    GET  /api/agent/search?q=…&kind=event   entries by title or name (trigram similarity)
    GET  /api/agent/documents/<id>          a stored page's clean text (in the evidence pack of a task you hold)
    GET  /api/agent/documents?url=…         the same, by the cited URL
    POST /api/agent/evidence/check-excerpt  {"doc_id" | "url", "excerpt"} → verbatim on the stored page? (and the closest passage)

Evidence packs (agentapi/evidence.py, ADR 0036): `complete` and `edits/check` / `edits/apply` check every excerpt
whose cited page is stored; one that isn't on it is a 422 naming the closest passage.

The operations a round needs (agentapi/operations.py, ADR 0035; scopes review, publish and round):

    GET  /api/agent/queue                   the queue per kind, caps, today's counts, drafts in review, round settings
    POST /api/agent/edits/check             {"ops": [...], "name", "round"} → the problems and the diff (a dry run)
    POST /api/agent/edits/apply             {"ops", "name", "round", "check", "reason"} + Idempotency-Key → applied
    POST /api/agent/releases/check          {"round"} → the release gates and the change report (writes nothing)
    POST /api/agent/releases/publish        {"check", "reason", "round", "notes"} + Idempotency-Key → the release
    GET  /api/agent/rounds/settings         paused?, skip the next?, the round size, held drafts sent on, the schedule
    POST /api/agent/rounds                  {"trigger": "schedule", "plan", "agents"} + Idempotency-Key → a round
    GET  /api/agent/rounds/<id>             a round
    PATCH /api/agent/rounds/<id>            {"status", "agents", "tasks", "drafts", "verdicts", "summary", "finish"}
"""

import hashlib
import json
from datetime import date

from django.contrib.postgres.search import TrigramSimilarity
from django.db import IntegrityError, OperationalError, transaction
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from evidence.models import Claim
from timeline.models import Branch, Entry, Event
from work import queue
from work.models import AgentTask

from . import apply as appliers
from . import evidence, schemas
from .auth import agent_view, error

ENDPOINTS = [" ".join(ln.split()) for ln in __doc__.splitlines() if ln.strip().startswith(("GET ", "POST ", "PATCH "))]


def _body(request) -> dict:
    if not request.body.strip() or (request.content_type == "multipart/form-data" and not request.POST and not request.FILES):
        return {}  # a bare POST (release, extend with the default lease)
    if request.content_type != "application/json":
        raise ValueError("send JSON (Content-Type: application/json)")
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError as e:
        raise ValueError(f"the body is not JSON: {e}") from e
    if not isinstance(data, dict):
        raise ValueError("the body must be a JSON object")
    return data


def _ok(obj, status=200):
    return JsonResponse(obj, status=status, safe=False, json_dumps_params={"ensure_ascii": False})


def _task_out(task: AgentTask | None):
    return {"task": queue.as_json(task) if task else None}


@agent_view
@require_http_methods(["GET"])
def index(request):
    t = request.agent_token
    return _ok({"agent": t.actor, "scopes": t.scopes, "kinds_with_schemas": sorted(schemas.RESULTS), "endpoints": ENDPOINTS})


@agent_view
@require_http_methods(["GET"])
def schema(request, kind):
    if kind not in schemas.RESULTS:
        return error(404, f"no result schema for {kind!r}", kinds=sorted(schemas.RESULTS))
    return _ok(schemas.RESULTS[kind])


def _kinds(request, asked: list[str]) -> tuple[list[str] | None, JsonResponse | None]:
    t = request.agent_token
    allowed = sorted(schemas.RESULTS) if "*" in t.scopes else [k for k in t.scopes if k in schemas.RESULTS]
    if not allowed:  # a token with operation scopes only (review, publish, round): no task kinds, so no tasks
        return None, error(403, "this token may take no task kinds", scopes=t.scopes)
    if not asked:
        return allowed, None
    denied = [k for k in asked if k not in allowed]
    if denied:
        return None, error(403, f"this token may not take {', '.join(denied)}", scopes=t.scopes)
    return asked, None


@agent_view
@require_http_methods(["GET"])
def next_task(request):
    kinds, err = _kinds(request, request.GET.getlist("kind"))
    if err:
        return err
    return _ok(_task_out(queue.next_task(agent=request.agent_token.actor, kinds=kinds, claim=False)))


@agent_view
@require_http_methods(["POST"])
def claim(request):
    try:
        body = _body(request)
    except ValueError as e:
        return error(400, str(e))
    kinds, err = _kinds(request, body.get("kinds") or [])
    if err:
        return err
    lease = body.get("lease_minutes")
    if lease is not None and (not isinstance(lease, int) or not 1 <= lease <= 240):
        return error(400, "lease_minutes must be an integer from 1 to 240")
    return _ok(_task_out(queue.next_task(agent=request.agent_token.actor, kinds=kinds, claim=True, lease_minutes=lease)))


def _visible(request, task_id) -> tuple[AgentTask | None, JsonResponse | None]:
    task = AgentTask.objects.select_related("target_entry").filter(pk=task_id).first()
    if task is None:
        return None, error(404, f"no task #{task_id}")
    t = request.agent_token
    if task.claimed_by != t.actor and not (task.status == "queued" and t.may(task.kind)):
        return None, error(403, f"task #{task_id} is not yours")
    return task, None


@agent_view
@require_http_methods(["GET"])
def task_detail(request, task_id):
    task, err = _visible(request, task_id)
    return err or _ok(_task_out(task))


@agent_view
@require_http_methods(["POST"])
def task_action(request, task_id, action):
    actor = request.agent_token.actor
    try:
        body = _body(request)
    except ValueError as e:
        return error(400, str(e))
    try:
        if action == "extend":
            minutes = body.get("minutes")
            if minutes is not None and (not isinstance(minutes, int) or not 1 <= minutes <= 240):
                return error(400, "minutes must be an integer from 1 to 240")
            return _ok(_task_out(queue.extend(task_id, agent=actor, minutes=minutes)))
        if action == "release":
            return _ok(_task_out(queue.release(task_id, agent=actor)))
        if action == "fail":
            msg = body.get("error")
            if not isinstance(msg, str) or not msg.strip():
                return error(400, 'send {"error": "why"}')
            return _ok(_task_out(queue.fail(task_id, agent=actor, error=msg[:2000], retry=bool(body.get("retry", True)))))
        if action == "complete":
            return complete(request, task_id, body)
        return error(404, f"no action {action!r}: extend, complete, release or fail")
    except queue.TaskError as e:
        return error(409, str(e))


def result_sha256(result) -> str:
    return hashlib.sha256(json.dumps(result, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()


def complete(request, task_id, body):
    """Validate, apply and complete, in one transaction. Safe to retry: the stored result carries the sha256 of what
    was sent, so the same agent sending the same result again for a task it already completed gets the task back
    (200, `"replayed": true`) and nothing is applied twice; a different result is a 409.

    A conflict that Postgres reports only at COMMIT (a deferred constraint such as `entry_sort_key_unique`, or a
    serialization failure or deadlock between two agents writing at once) rolls everything back and is a 409 with
    `"retryable": true`, never a 500: the task is still the agent's, and the same request may simply be sent again."""
    actor = request.agent_token.actor
    result = body.get("result")
    task = AgentTask.objects.filter(pk=task_id).only("kind", "status", "claimed_by", "result").first()
    if task is None:
        return error(404, f"no task #{task_id}")
    if not request.agent_token.may(task.kind):
        return error(403, f"this token may not complete {task.kind} tasks")
    problems = schemas.errors(task.kind, result)
    if problems:
        return error(422, "the result does not match its schema", problems=problems, schema=f"/api/agent/schemas/{task.kind}")
    if task.status != AgentTask.Status.DONE and (mismatches := evidence.result_mismatches(task.kind, result)):
        return error(422, "an excerpt is not on the stored copy of its page (whitespace aside): copy it from the stored text",
                     problems=evidence.problems_of(mismatches), excerpts=mismatches)
    digest = result_sha256(result)
    if task.status == AgentTask.Status.DONE and task.claimed_by == actor:
        if (task.result or {}).get("result_sha256") == digest:
            return _ok(_task_out(AgentTask.objects.get(pk=task_id)) | {"replayed": True})
        return error(409, f"task #{task_id} is already done, with a different result", retryable=False)
    try:
        with transaction.atomic():
            held = queue._held(task_id, actor)  # locks the row: nobody else can take it over while we apply
            applied = appliers.apply(held, result, actor)
            done = queue.complete(task_id, agent=actor, result={**result, "applied": applied, "result_sha256": digest})
    except appliers.ApplyError as e:
        return error(422, str(e))
    except (IntegrityError, OperationalError) as e:
        return error(409, f"another write conflicted with this one ({type(e).__name__}); nothing was kept and the task is still yours: "
                          "send the same request again", retryable=True, task=task_id)
    return _ok(_task_out(done))


# ── Reads ────────────────────────────────────────────────────────────────────────────────────────────────────────

def _claim_brief(c: Claim) -> dict:
    return {"id": c.pk, "field": c.field, "key": c.key, "status": c.status, "confidence": c.confidence, "parent": c.parent_id,
            "recheck_after": c.recheck_after.isoformat() if c.recheck_after else None}


def _entry_json(entry: Entry) -> dict:
    x = entry.concrete
    out = {"id": entry.slug, "kind": entry.kind, "status": entry.status, "why": entry.why or None}
    if isinstance(x, Event):
        out |= {"branch": x.branch.slug, "y": x.y, "end": x.end, "when": x.when, "title": x.title, "text": x.text, "imp": x.imp, "precision": x.precision}
    else:
        out |= {"name": x.name, "region": x.region.slug, "start": x.start, "end": x.end, "start_when": x.start_when, "end_when": x.end_when, "text": x.text}
    loc = getattr(entry, "location", None)
    if loc:
        out["geo"] = {"scope": loc.scope, "lat": loc.lat, "lon": loc.lon, "r": loc.radius_km, "label": loc.label}
    out["claims"] = [_claim_brief(c) for c in entry.claims.order_by("parent_id", "field", "key")]
    return out


@agent_view
@require_http_methods(["GET"])
def entry_detail(request, slug):
    entry = Entry.objects.filter(slug=slug).first()
    if entry is None:
        return error(404, f"no entry {slug!r}")
    return _ok(_entry_json(entry))


@agent_view
@require_http_methods(["GET"])
def branch_detail(request, slug):
    from governance.models import BranchMetric, BranchProposal
    from governance.metrics import public

    b = Branch.objects.filter(slug=slug).select_related("region").first()
    if b is None:
        return error(404, f"no branch {slug!r}")
    out = _entry_json(b.entry_ptr)
    events = Event.objects.filter(branch=b).order_by("y", "sort_key")
    out["events"] = {"count": events.count(), "published": events.filter(status="published").count(),
                     "list": [{"id": e.slug, "y": e.y, "when": e.when, "title": e.title, "status": e.status, "imp": e.imp} for e in events[:300]]}
    m = BranchMetric.objects.filter(branch=b).order_by("-computed_at").first()
    out["metrics"] = ({k: v for k, v in public(m.metrics).items() if k != "windows"} | {"computed_at": m.computed_at.isoformat(timespec="seconds")}) if m else None
    props = BranchProposal.objects.filter(Q(branch=b) | Q(other_branches=b), status__in=["proposed", "accepted"]).distinct()
    out["open_proposals"] = [{"id": p.pk, "rule": p.rule_id, "kind": p.kind, "status": p.status, "summary": p.summary[:300]} for p in props]
    return _ok(out)


@agent_view
@require_http_methods(["GET"])
def claim_detail(request, claim_id):
    from evidence.sweep import task_payload

    c = Claim.objects.select_related("entry").filter(pk=claim_id).first()
    if c is None:
        return error(404, f"no claim {claim_id}")
    p = task_payload(c, "read", date.today())
    p.pop("todo", None)
    p.pop("reason", None)
    return _ok(p)


@agent_view
@require_http_methods(["GET"])
def search(request):
    q = (request.GET.get("q") or "").strip()
    if len(q) < 3:
        return error(400, "q needs at least 3 characters")
    kind = request.GET.get("kind", "")
    limit = min(50, int(request.GET.get("limit", "20")) if request.GET.get("limit", "20").isdigit() else 20)
    rows = []
    if kind in ("", "event"):
        rows += [{"id": e.slug, "kind": "event", "title": e.title, "when": e.when, "branch": e.branch.slug, "status": e.status, "score": round(e.sim, 3)}
                 for e in Event.objects.annotate(sim=TrigramSimilarity("title", q)).filter(Q(sim__gte=0.2) | Q(title__icontains=q)).select_related("branch").order_by("-sim")[:limit]]
    if kind in ("", "branch"):
        rows += [{"id": b.slug, "kind": "branch", "title": b.name, "when": b.start_when, "status": b.status, "score": round(b.sim, 3)}
                 for b in Branch.objects.annotate(sim=TrigramSimilarity("name", q)).filter(Q(sim__gte=0.2) | Q(name__icontains=q)).order_by("-sim")[:limit]]
    rows.sort(key=lambda r: -r["score"])
    return _ok({"q": q, "results": rows[:limit]})
