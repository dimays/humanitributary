"""The agent API's operations (docs/adr/0035-automated-daily-rounds.md): what a round needs besides claiming tasks,
so the daily routine can run end to end without a shell on the host.

    GET   queue                 the queue per kind (waiting, in progress, stuck, priorities, caps, today's counts), the
                                drafts in review, the live release and the round settings: what a round plans from
    POST  edits/check           {"ops": [...], "name", "round"} → valid?, the problems, the diff (a dry run)    scope review
    POST  edits/apply           {"ops", "name", "round", "check", "reason"} + Idempotency-Key → applied          scope review
    POST  releases/check        {"round"} → the gates, the change report (writes nothing)                       scope publish
    POST  releases/publish      {"check", "reason", "round", "notes"} + Idempotency-Key → the release           scope publish
    GET   rounds/settings       paused?, skip next?, the size, held drafts sent on, the schedule
    POST  rounds                {"trigger", "plan", "agents", "notes"} + Idempotency-Key → the round, or why not  scope round
    GET   rounds/<id>           a round
    PATCH rounds/<id>           {"status", "agents", "tasks", "drafts", "verdicts", "summary", "notes", "finish"} scope round

Every edits and releases call is an `OpsAction` row (opsconsole/models.py) as `agent:<name>`, `runs_in="api"`: the
console's action log shows them beside the operators' own, and the console's single-publish lock
(`opsconsole.actions.exclusive_refusal`) covers both doors. Each kind has a per-token limit on top of the API's
per-minute one (config/settings.py `AGENT_API_*`). The edit file is validated exactly as `manage.py apply_edits`
does (timeline/edits.py: shapes, SCHEMA limits, https, never openstax.org), plus two rules for agents: a reviewer may
not approve an entry it wrote, and an edit file sent here may not add entries straight to `published`.
"""

import hashlib
import json
import re
import uuid
from datetime import timedelta

from django.conf import settings
from django.db import IntegrityError, connection, transaction
from django.db.models import Count
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from work import rounds as R
from work.models import AgentTask, Round

from .auth import agent_view, error

MAX_OPS = 500                 # ops in one edit file sent over the API (the largest review so far had 105)
CHECK_FRESH_MINUTES = 60      # edits/apply needs an edits/check of the same ops at most this old
DIFF_LINES_PER_OP = 25        # diff lines returned per op (the action keeps the full text, capped)
KEY_RE = re.compile(r"^[A-Za-z0-9_.:-]{8,64}$")
NAME_RE = re.compile(r"^[\w.-]{1,120}$")
PUBLISH_LOCK = 0x4855         # advisory-lock key: one agent publish at a time, between the check and the row


def _ok(obj, status=200):
    return JsonResponse(obj, status=status, safe=False, json_dumps_params={"ensure_ascii": False})


def _body(request):
    from .views import _body as body

    return body(request)


def _need(request, scope: str):
    if not request.agent_token.has(scope):
        return error(403, f"this token has no {scope!r} scope (manage.py agent_token create <name> --scope {scope})", scopes=request.agent_token.scopes)
    return None


def _sha(obj) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()


def _idempotency(request, body: dict, kind: str):
    """The client's Idempotency-Key (header, or `idempotency_key` in the body) → (the stored key, None) or (None, an
    error). The stored key is a hash of the actor, the kind and the client's key, so two agents never collide."""
    raw = request.headers.get("Idempotency-Key") or body.get("idempotency_key") or ""
    if not KEY_RE.match(str(raw)):
        return None, error(400, "send an Idempotency-Key header (8–64 letters, digits, _ . : -): a retry with the same key acts once")
    return hashlib.sha256(f"{request.agent_token.actor}|{kind}|{raw}".encode()).hexdigest(), None


def _replay(key: str, request_sha: str):
    """An action already made under this key: its stored answer (a retry), or a 409 when the body differs."""
    from opsconsole.models import OpsAction

    a = OpsAction.objects.filter(idempotency_key=key).first()
    if a is None:
        return None
    if (a.params or {}).get("request_sha256") != request_sha:
        return error(409, f"this Idempotency-Key was used for a different request (action #{a.pk})", action=a.pk)
    if a.open:
        return error(409, f"action #{a.pk} with this key is still {a.status}: try again in a minute", action=a.pk, retryable=True)
    out = dict((a.result or {}).get("response") or {"action": a.pk, "status": a.status, "error": a.error})
    out["replayed"] = True
    return _ok(out, status=(a.result or {}).get("http_status", 200))


def _rate(actor: str, kind: str, limit: int, minutes: int):
    from opsconsole.models import OpsAction

    since = timezone.now() - timedelta(minutes=minutes)
    n = OpsAction.objects.filter(requested_by=actor, kind=kind, created_at__gte=since).count()
    if n >= limit:
        window = f"{minutes // 60} hours" if minutes >= 120 else "hour"
        resp = error(429, f"{n} {kind} calls in the last {window}: at most {limit} per token", retry_after=minutes * 60)
        resp["Retry-After"] = str(min(3600, minutes * 60))
        return resp
    return None


def _round(body: dict):
    """The optional `round` an operation belongs to → (Round | None, error | None)."""
    rid = body.get("round")
    if rid in (None, ""):
        return None, None
    if not isinstance(rid, int):
        return None, error(400, "round must be a round's id (an integer)")
    r = Round.objects.filter(pk=rid).first()
    if r is None:
        return None, error(404, f"no round #{rid}")
    return r, None


def _record(kind, *, actor, target, params, reason, key=None, round=None, status="running", **extra):
    from opsconsole.models import OpsAction

    now = timezone.now()
    return OpsAction.objects.create(kind=kind, target=target, params=params, reason=(reason or kind)[:2000], requested_by=actor,
                                    idempotency_key=key or uuid.uuid4().hex,
                                    runs_in="api", status=status, started_at=now, round=round, **extra)


def _finish(action, *, status: str, response: dict, http_status: int, error_text: str = "", output: str | None = None, **result):
    from ingest.policy import mask_secrets

    action.status, action.finished_at = status, timezone.now()
    action.result = {**result, "response": response, "http_status": http_status}
    action.error = mask_secrets(error_text)[:20000]
    if output is not None:
        action.output = mask_secrets(output)[:200000]
    action.save(update_fields=["status", "finished_at", "result", "error", "output"])
    return _ok(response, status=http_status)


# ── the queue ─────────────────────────────────────────────────────────────────────────────────────────────────────

PRIORITIES_SQL = """
SELECT kind, max(priority), min(priority), percentile_disc(0.5) WITHIN GROUP (ORDER BY priority)
FROM work_agenttask WHERE status = 'queued' AND (not_before IS NULL OR not_before <= now()) GROUP BY kind
"""


def owner_review_count() -> int:
    from opsconsole import review

    return review.count()


def queue_summary(now) -> dict:
    from opsconsole import queries as Q
    from publish.models import Release
    from revisions.models import Revision
    from timeline.models import Entry

    with connection.cursor() as c:
        c.execute(PRIORITIES_SQL)
        prio = {k: {"max": hi, "min": lo, "median": med} for k, hi, lo, med in c.fetchall()}
    kinds = []
    for k in Q.queue(now):
        top = list(AgentTask.objects.filter(kind=k["kind"], status="queued").order_by("-priority", "created_at", "id")
                   .values("id", "priority", "dedupe_key", "target_ref")[:5])
        kinds.append({
            "kind": k["kind"], "label": k["label"], "waiting": k["waiting"], "in_progress": k["in_progress"], "stuck": k["stuck"],
            "done_today": k["done_today"], "failed_today": k["failed_today"], "done_7d": k["done_7d"],
            "oldest_waiting_minutes": int(k["oldest_age"].total_seconds() // 60) if k["oldest_age"] else None,
            "priorities": prio.get(k["kind"]), "top": [{"id": t["id"], "priority": t["priority"], "key": t["dedupe_key"] or t["target_ref"] or None} for t in top],
            "cap": k["cap"], "fed_by": R.FED_BY.get(k["kind"], []), "role": R.KIND_ROLE.get(k["kind"]),
        })
    stuck = [{"id": t.pk, "kind": t.kind, "claimed_by": t.claimed_by, "lease_until": t.lease_until.isoformat(timespec="seconds")}
             for t in Q.stuck_leases(now)]
    held = list(R.held_drafts()[:200])
    review = Entry.objects.filter(status="review").values("kind").annotate(n=Count("id"))
    newest = Release.objects.order_by("-created_at", "-id").first()
    pointer = Q.pointer()
    st = R.current()
    st["next_round_takes"] = R.capacity(st["size"], {k["kind"]: k["waiting"] for k in kinds})
    latest = Round.objects.order_by("-started_at", "-id").first()
    return {
        "at": now.isoformat(timespec="seconds"), "kinds": kinds, "stuck": stuck,
        "caps": {k["kind"]: k["cap"] for k in kinds if k["cap"]},
        "review": {"in_review": {r["kind"]: r["n"] for r in review}, "held": held, "held_count": len(held)},
        # The owner's review queue (ADR 0046): how many items wait for a person's read, never which: no agent works them.
        "owner_review": {"waiting": owner_review_count(), "path": "/ops/review/"},
        "release": {"live": (pointer or {}).get("version"), "newest": newest.version if newest else None,
                    "unreleased_revisions": Revision.objects.filter(id__gt=newest.revision_high_water if newest else 0).count()},
        "round": {**st, "latest": R.as_json(latest) if latest else None},
        "lease_minutes": settings.TASK_LEASE_MINUTES, "rate_per_minute": settings.AGENT_API_RATE_PER_MINUTE,
    }


@agent_view
@require_http_methods(["GET"])
def queue(request):
    return _ok(queue_summary(timezone.now()))


# ── edit files ────────────────────────────────────────────────────────────────────────────────────────────────────

def _ops_and_name(body):
    ops = body.get("ops")
    if not isinstance(ops, list) or not ops:
        return None, None, error(400, 'send {"ops": [...]}: the edit file\'s list of operations (timeline/edits.py)')
    if len(ops) > MAX_OPS:
        return None, None, error(413, f"{len(ops)} ops: at most {MAX_OPS} in one edit file; split it")
    name = body.get("name") or "api.edits.json"
    if not isinstance(name, str) or not NAME_RE.match(name):
        return None, None, error(400, "name must be a file name: letters, digits, _ . - (at most 120)")
    return ops, name, None


def agent_rules(ops: list, actor: str) -> list[str]:
    """The rules an edit file sent by an agent obeys on top of timeline/edits.py's checks: independence (a reviewer
    never approves an entry it wrote, so nothing reaches readers without a second reader), no shortcut (an entry it
    adds lands in review, for the next round's reviewers, never straight in `published`), and verbatim excerpts (an
    excerpt whose cited page is in the evidence store must be on it: agentapi/evidence.py, ADR 0036)."""
    from revisions.models import Revision
    from timeline import edits
    from timeline.models import Entry

    out = []
    approve = {op["entry"]: i for i, op in enumerate(ops) if isinstance(op, dict) and op.get("op") == "approve" and isinstance(op.get("entry"), str)}
    if approve:
        ids = dict(Entry.objects.filter(slug__in=approve).values_list("pk", "slug"))
        mine = set(Revision.objects.filter(table_name="timeline_entry", action="insert", actor=actor, row_pk__in=[str(p) for p in ids])
                   .values_list("row_pk", flat=True))
        out += [f"#{approve[ids[int(p)]]} approve {ids[int(p)]}: {actor} wrote this entry; an independent reviewer must approve it" for p in sorted(mine)]
    for i, op in enumerate(ops):
        if isinstance(op, dict) and op.get("op") in edits.ADDS and op.get("status") == "published":
            out.append(f"#{i} {op['op']} {edits.target(op)}: over the agent API an added entry lands in review (drop \"status\"); "
                       "the next round's reviewers approve it")
    # Evidence packs (ADR 0036): an excerpt whose cited page is in the store must be on it, verbatim.
    from .evidence import ops_problems

    return out + ops_problems(ops)


def _diff_text(out) -> str:
    from timeline import edits

    lines = []
    for i, op, notes, diff in out.ops:
        lines.append(f"#{i} {op['op']} {edits.target(op)}: {op['reason']}")
        lines += [f"  = {n}" for n in notes] + diff
    return "\n".join(lines)


@agent_view
@require_http_methods(["POST"])
def edits_check(request):
    from opsconsole.models import OpsAction
    from timeline import edits

    if err := _need(request, "review"):
        return err
    actor = request.agent_token.actor
    try:
        body = _body(request)
    except ValueError as e:
        return error(400, str(e))
    ops, name, err = _ops_and_name(body)
    if err:
        return err
    rnd, err = _round(body)
    if err:
        return err
    if err := _rate(actor, OpsAction.Kind.EDITS_CHECK, settings.AGENT_API_EDITS_CHECKS_PER_HOUR, 60):
        return err
    sha = _sha(ops)
    action = _record(OpsAction.Kind.EDITS_CHECK, actor=actor, target=f"edits:{name}", round=rnd, reason=f"check {name}" + (f" (round #{rnd.pk})" if rnd else ""),
                     params={"name": name, "ops_sha256": sha, "n_ops": len(ops), "round": rnd.pk if rnd else None})
    problems = edits.check(ops) + agent_rules(ops, actor)
    out = None
    if not problems:
        try:
            out = edits.apply(ops, actor=actor, source=f"round-{rnd.pk}:{name}" if rnd else name, dry_run=True)
        except edits.EditsInvalid as e:
            problems = e.problems
    counts = dict(out.counts) if out else {}
    resp = {"check": action.pk, "valid": not problems, "problems": problems, "ops_sha256": sha, "n_ops": len(ops), "counts": counts,
            "revisions": out.revisions if out else 0,
            "ops": [{"index": i, "op": op["op"], "entry": edits.target(op), "reason": op["reason"], "notes": notes,
                     "diff": diff[:DIFF_LINES_PER_OP] + ([f"  … {len(diff) - DIFF_LINES_PER_OP} more lines"] if len(diff) > DIFF_LINES_PER_OP else [])}
                    for i, op, notes, diff in (out.ops if out else [])]}
    return _finish(action, status="done" if not problems else "failed", response=resp, http_status=200 if not problems else 422,
                   error_text="\n".join(problems[:200]), output=_diff_text(out) if out else "\n".join(problems),
                   valid=not problems, counts=counts, problems=len(problems))


@agent_view
@require_http_methods(["POST"])
def edits_apply(request):
    from opsconsole.models import OpsAction
    from timeline import edits

    if err := _need(request, "review"):
        return err
    actor = request.agent_token.actor
    try:
        body = _body(request)
    except ValueError as e:
        return error(400, str(e))
    key, err = _idempotency(request, body, "edits_apply")
    if err:
        return err
    ops, name, err = _ops_and_name(body)
    if err:
        return err
    rnd, err = _round(body)
    if err:
        return err
    sha = _sha(ops)
    request_sha = _sha({"ops": sha, "name": name, "round": rnd.pk if rnd else None, "check": body.get("check")})
    if replay := _replay(key, request_sha):
        return replay
    reason = body.get("reason") if isinstance(body.get("reason"), str) and body["reason"].strip() else f"apply {name}" + (f" (round #{rnd.pk})" if rnd else "")
    check = OpsAction.objects.filter(pk=body.get("check"), kind=OpsAction.Kind.EDITS_CHECK).first() if isinstance(body.get("check"), int) else None
    why = ""
    if check is None:
        why = 'send "check": the id edits/check returned for these ops'
    elif check.status != "done" or not (check.result or {}).get("valid"):
        why = f"check #{check.pk} did not pass: fix the file and check it again"
    elif (check.params or {}).get("ops_sha256") != sha:
        why = f"these ops are not the ones check #{check.pk} checked (their sha256 differs)"
    elif check.finished_at < timezone.now() - timedelta(minutes=CHECK_FRESH_MINUTES):
        why = f"check #{check.pk} is more than {CHECK_FRESH_MINUTES} minutes old: check again"
    elif OpsAction.objects.filter(kind=OpsAction.Kind.EDITS_APPLY, status="done", params__check=check.pk).exists():
        why = f"check #{check.pk} was already applied"
    if why:
        return error(409, why)
    if err := _rate(actor, OpsAction.Kind.EDITS_APPLY, settings.AGENT_API_EDITS_APPLIES_PER_HOUR, 60):
        return err
    try:
        action = _record(OpsAction.Kind.EDITS_APPLY, actor=actor, target=f"edits:{name}", key=key, round=rnd, reason=reason,
                         params={"name": name, "ops_sha256": sha, "n_ops": len(ops), "check": check.pk, "round": rnd.pk if rnd else None,
                                 "request_sha256": request_sha})
    except IntegrityError:  # the same key, a moment ago, from a concurrent retry
        return _replay(key, request_sha) or error(409, "a request with this Idempotency-Key is in progress", retryable=True)
    problems = agent_rules(ops, actor)
    out = None
    if not problems:
        try:
            out = edits.apply(ops, actor=actor, source=f"round-{rnd.pk}:{name}" if rnd else name)
        except edits.EditsInvalid as e:
            problems = e.problems
    if problems:
        return _finish(action, status="failed", response={"action": action.pk, "applied": False, "problems": problems}, http_status=422,
                       error_text="\n".join(problems[:200]))
    counts = dict(out.counts)
    if rnd is not None:
        with transaction.atomic():
            r = Round.objects.select_for_update().get(pk=rnd.pk)
            r.edit_ops = {k: r.edit_ops.get(k, 0) + counts.get(k, 0) for k in set(r.edit_ops) | set(counts)}
            R.note(r, actor, f"edit file {name} applied: {out.revisions} revisions (action #{action.pk})")
            r.save(update_fields=["edit_ops", "history", "updated_at"])
    resp = {"action": action.pk, "applied": True, "counts": counts, "revisions": out.revisions, "txid": out.txid}
    return _finish(action, status="done", response=resp, http_status=200, output=_diff_text(out), counts=counts, revisions=out.revisions, txid=out.txid)


# ── releases ──────────────────────────────────────────────────────────────────────────────────────────────────────

@agent_view
@require_http_methods(["POST"])
def releases_check(request):
    from opsconsole.models import OpsAction
    from publish import changes, gates, release

    if err := _need(request, "publish"):
        return err
    actor = request.agent_token.actor
    try:
        body = _body(request)
    except ValueError as e:
        return error(400, str(e))
    rnd, err = _round(body)
    if err:
        return err
    if err := _rate(actor, OpsAction.Kind.PUBLISH_CHECK, settings.AGENT_API_RELEASE_CHECKS_PER_HOUR, 60):
        return err
    action = _record(OpsAction.Kind.PUBLISH_CHECK, actor=actor, target="release:check", round=rnd,
                     reason="releases/check" + (f" (round #{rnd.pk})" if rnd else ""), params={"round": rnd.pk if rnd else None})
    try:
        p = release.preview()
    except gates.PublishRefused as e:
        return _finish(action, status="failed", response={"check": action.pk, "passed": False, "problems": e.problems}, http_status=422, error_text=str(e))
    rep = p["report"]
    result = {"content_hash": p["content_hash"], "page_hash": p["page_hash"], "unchanged_since": p["unchanged_since"],
              "from": rep["from"], "total": rep["total"], "page": rep.get("page"), "summary": changes.page_summary(rep), "gates": list(gates.GATES)}
    if rnd is not None and p["unchanged_since"] is None:
        with transaction.atomic():
            r = Round.objects.select_for_update().get(pk=rnd.pk)
            if r.status in (Round.Status.RUNNING, Round.Status.REVIEWING):
                r.status = Round.Status.RELEASE_READY
                R.note(r, actor, f"every release gate passes (check #{action.pk}): {result['summary']}")
                r.save(update_fields=["status", "history", "updated_at"])
    resp = {"check": action.pk, "passed": True, **result}
    return _finish(action, status="done", response=resp, http_status=200, output=changes.to_markdown(rep).decode(), **result)


@agent_view
@require_http_methods(["POST"])
def releases_publish(request):
    from opsconsole import actions as acts
    from opsconsole.models import OpsAction
    from publish import changes, gates, release

    if err := _need(request, "publish"):
        return err
    actor = request.agent_token.actor
    try:
        body = _body(request)
    except ValueError as e:
        return error(400, str(e))
    key, err = _idempotency(request, body, "publish")
    if err:
        return err
    reason = body.get("reason")
    if not isinstance(reason, str) or not reason.strip():
        return error(400, 'send "reason": why this release, recorded with it')
    rnd, err = _round(body)
    if err:
        return err
    notes = body.get("notes") or ""
    if not isinstance(notes, str) or len(notes) > 500:
        return error(400, "notes must be text of at most 500 characters")
    request_sha = _sha({"check": body.get("check"), "round": rnd.pk if rnd else None, "reason": reason, "notes": notes})
    if replay := _replay(key, request_sha):
        return replay
    check = OpsAction.objects.filter(pk=body.get("check")).first() if isinstance(body.get("check"), int) else None
    if err := _rate(actor, OpsAction.Kind.PUBLISH, settings.AGENT_API_PUBLISHES_PER_DAY, 24 * 60):
        return err
    # The lock: the console's check (no publish or rollback open, from either door) and this row, under one advisory
    # lock, so two agents (or an agent and the worker's next pick-up, which checks the same rows) never both publish.
    with transaction.atomic():
        with connection.cursor() as c:
            c.execute("SELECT pg_advisory_xact_lock(%s)", [PUBLISH_LOCK])
        why = acts.publish_check_refusal(check)
        busy = bool(why) and why == acts.exclusive_refusal()
        if not why and (check.result or {}).get("unchanged_since"):
            why = f"content and page are unchanged since {check.result['unchanged_since']}: nothing to publish"
        if why:
            return error(409, why, retryable=busy)
        try:
            action = _record(OpsAction.Kind.PUBLISH, actor=actor, target="release:new", key=key, round=rnd, reason=reason.strip(),
                             params={"check": check.pk, "content_hash": check.result.get("content_hash"), "page_hash": check.result.get("page_hash"),
                                     "notes": notes, "round": rnd.pk if rnd else None, "request_sha256": request_sha})
        except IntegrityError:
            return error(409, "a request with this Idempotency-Key is in progress", retryable=True)
    content, page = acts._current_hashes()
    if (content, page) != (action.params["content_hash"], action.params["page_hash"]):
        what = "content" if content != action.params["content_hash"] else "page"
        return _finish(action, status="failed", response={"action": action.pk, "published": False,
                                                          "error": f"the {what} changed since check #{check.pk}: run releases/check again"},
                       http_status=409, error_text=f"the {what} changed since check #{check.pk}")
    tag = f"round #{rnd.pk}: " if rnd else ""
    try:
        rel, created = release.publish(actor=actor, notes=(notes or f"{tag}{reason.strip()}")[:2000])
    except gates.PublishRefused as e:
        return _finish(action, status="failed", response={"action": action.pk, "published": False, "problems": e.problems}, http_status=422, error_text=str(e))
    if not created:
        return _finish(action, status="done", response={"action": action.pk, "published": False, "version": rel.version,
                                                        "summary": f"unchanged since {rel.version}: nothing written"}, http_status=200, created=False)
    from infra import storage

    rep = json.loads(storage.read(storage.RELEASES, storage.release_key(rel.version, "changes.json")))
    if rnd is not None:
        with transaction.atomic():
            r = Round.objects.select_for_update().get(pk=rnd.pk)
            r.release, r.status = rel, Round.Status.PUBLISHED
            r.finished_at = r.finished_at or timezone.now()
            R.note(r, actor, f"published release {rel.version}: {changes.page_summary(rep)}")
            r.save(update_fields=["release", "status", "finished_at", "history", "updated_at"])
    resp = {"action": action.pk, "published": True, "version": rel.version, "counts": rel.counts, "total": rep["total"], "summary": changes.page_summary(rep)}
    return _finish(action, status="done", response=resp, http_status=200, created=True, version=rel.version, summary=changes.page_summary(rep))


# ── rounds ────────────────────────────────────────────────────────────────────────────────────────────────────────

@agent_view
@require_http_methods(["GET"])
def round_settings(request):
    return _ok(R.current())


@agent_view
@require_http_methods(["POST"])
def rounds(request):
    if err := _need(request, "round"):
        return err
    actor = request.agent_token.actor
    try:
        body = _body(request)
    except ValueError as e:
        return error(400, str(e))
    key, err = _idempotency(request, body, "round")
    if err:
        return err
    existing = Round.objects.filter(idempotency_key=key).first()
    if existing is not None:
        return _ok({"round": R.as_json(existing), "proceed": existing.status in Round.OPEN, "replayed": True})
    trigger = body.get("trigger")
    if trigger not in Round.Trigger.values:
        return error(400, 'trigger must be "schedule" (the routine) or "manual" (started by hand)')
    plan, agents, notes = body.get("plan") or {}, body.get("agents") or [], body.get("notes") or ""
    if not isinstance(plan, dict) or not isinstance(agents, list) or not isinstance(notes, str):
        return error(400, "plan is an object, agents a list, notes text")
    limit = settings.AGENT_API_ROUNDS_PER_DAY
    if Round.objects.filter(started_by=actor, started_at__gte=timezone.now() - timedelta(days=1)).count() >= limit:
        return error(429, f"{limit} rounds in the last day from this token: at most {limit}", retry_after=3600)
    try:
        r, proceed = R.start(trigger=trigger, by=actor, plan=plan, agents=agents, notes=notes, key=key)
    except R.RoundRefused as e:
        return error(409, str(e), proceed=False, **{e.code: True}, **{k: v for k, v in e.extra.items() if k == "round"})
    except IntegrityError:
        existing = Round.objects.filter(idempotency_key=key).first()
        if existing is None:
            raise
        return _ok({"round": R.as_json(existing), "proceed": existing.status in Round.OPEN, "replayed": True})
    st = R.current()
    return _ok({"round": R.as_json(r), "proceed": proceed, "why": None if proceed else r.summary, "size": st["size"],
                "drafts_per_reviewer": st["drafts_per_reviewer"], "carry_over": r.plan.get("carry_over", [])}, status=201 if proceed else 200)


@agent_view
@require_http_methods(["GET", "PATCH"])
def round_detail(request, round_id):
    r = Round.objects.filter(pk=round_id).select_related("release").first()
    if r is None:
        return error(404, f"no round #{round_id}")
    if request.method == "GET":
        return _ok({"round": R.as_json(r)})
    if err := _need(request, "round"):
        return err
    try:
        body = _body(request)
    except ValueError as e:
        return error(400, str(e))
    with transaction.atomic():
        r = Round.objects.select_for_update(of=("self",)).select_related("release").get(pk=round_id)
        try:
            fields = R.validate_patch(r, body)
        except ValueError as e:
            return error(422, str(e))
        for k, v in fields.items():
            setattr(r, k, v)
        R.note(r, request.agent_token.actor, "updated " + ", ".join(sorted(k for k in fields if k != "finished_at")))
        r.save()
    return _ok({"round": R.as_json(r)})
