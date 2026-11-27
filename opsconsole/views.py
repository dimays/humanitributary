"""The operations console: pages for staff under /ops/, and the few actions operators take from them
(docs/guide/operations-console.md, ADR 0028).

Every page is wrapped by `console`: GET and HEAD only, staff only (`staff_member_required`: anyone else is sent to
the admin's login), never cached, `X-Robots-Tag: noindex`, and, when `settings.OPS_HOSTS` names hosts, a 404 on any
other host (so the public page's domain has no /ops/). Reading writes nothing.

Actions are wrapped by `operator` instead: POST only (with Django's CSRF check), staff with the
`opsconsole.ops_operator` permission (anyone else on staff gets a 403, and never sees a button). Each takes two
steps: `act` validates the form and shows the confirmation page (what will happen, the dry run or check), carrying
a signed token that holds exactly those parameters and a fresh idempotency key; `confirm` takes the token and a
reason, inserts the OpsAction under that key (a second submit finds the row and shows it), then runs it in the
request (quick ones, in one transaction) or leaves it for the worker (opsconsole/worker.py). Both are rate-limited
per user (opsconsole/actions.py).
"""

import uuid
from datetime import datetime, timedelta
from functools import wraps

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.core import signing
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.db import IntegrityError, transaction
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.utils.cache import add_never_cache_headers
from django.views.decorators.http import require_POST, require_safe

from ingest.models import FetchRun
from ingest.policy import mask_secrets
from publish.models import Release
from work.models import AgentTask

from . import actions as acts
from . import queries as Q
from .models import OpsAction
from .templatetags.ops import field_diffs

PAGE_SIZE = 50
REFRESH_SECONDS = 60
ACTION_REFRESH_SECONDS = 3   # an open action's page reloads itself this often
TOKEN_SALT = "opsconsole.action"
TOKEN_MAX_AGE = 30 * 60      # a confirmation page is good for this long
PERMISSION = "opsconsole.ops_operator"


def can_act(user) -> bool:
    return bool(user.is_active and user.is_staff and user.has_perm(PERMISSION))


def actor_of(user) -> str:
    return f"human:{user.get_username()}"


def host_allowed(request) -> bool:
    hosts = getattr(settings, "OPS_HOSTS", None) or []
    return not hosts or request.get_host().split(":")[0] in hosts


def console(view):
    protected = staff_member_required(view)

    @wraps(view)
    def inner(request, *args, **kwargs):
        if not host_allowed(request):
            raise Http404("no such page")
        response = protected(request, *args, **kwargs)
        response["X-Robots-Tag"] = "noindex, nofollow"
        add_never_cache_headers(response)
        return response

    return require_safe(inner)


def operator(view):
    """POST only, staff only, and the ops_operator permission (403 without it); CSRF is the middleware's."""

    @wraps(view)
    def checked(request, *args, **kwargs):
        if not can_act(request.user):
            raise PermissionDenied("acting from the console needs the opsconsole.ops_operator permission")
        return view(request, *args, **kwargs)

    protected = staff_member_required(checked)

    @wraps(view)
    def inner(request, *args, **kwargs):
        if not host_allowed(request):
            raise Http404("no such page")
        response = protected(request, *args, **kwargs)
        response["X-Robots-Tag"] = "noindex, nofollow"
        add_never_cache_headers(response)
        return response

    return require_POST(inner)


def _render(request, template, ctx, *, section, status=200):
    refresh = request.GET.get("refresh") == "1"
    q = request.GET.copy()
    q.pop("refresh", None)
    q.pop("page", None)
    if not refresh:
        q["refresh"] = "1"
    base = {"section": section, "refresh": REFRESH_SECONDS if refresh else None, "refresh_toggle": "?" + q.urlencode(),
            "now": timezone.now(), "site_name": settings.SITE_NAME, "can_act": can_act(request.user)}
    return render(request, f"opsconsole/{template}", base | ctx, status=status)


def _page(request, qs, size=PAGE_SIZE):
    page = Paginator(qs, size).get_page(request.GET.get("page"))
    q = request.GET.copy()
    q.pop("page", None)
    return page, q.urlencode()


def _date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date() if value else None
    except ValueError:
        return None


@console
def overview(request):
    now = timezone.now()
    job_rows = Q.jobs(now)
    latest = Release.objects.order_by("-created_at", "-id").first()
    return _render(request, "overview.html", {
        "health": Q.health(now), "jobs": job_rows, "alerts": Q.alerts(job_rows), "queue": Q.queue(now),
        "intake": Q.intake(now), "latest": latest, "paused": [j for j in job_rows if j["paused"]],
        "open_actions": Q.open_actions(),
    }, section="overview")


@console
def runs(request):
    f = {k: request.GET.get(k, "").strip() for k in ("job", "status", "since", "until")}
    qs = Q.fetch_runs(job=f["job"], status=f["status"], since=_date(f["since"]), until=_date(f["until"]))
    page, qs_rest = _page(request, qs)
    for r in page:
        r.duration = (r.finished_at - r.started_at).total_seconds() if r.finished_at else None
        r.safe_error = mask_secrets(r.error)
    history = Q.run_history(job=f["job"] or None)
    reg = Q._registry()
    spark = [{"job": name, "runs": history.get(name, []), "failed": sum(x["status"] == "failed" for x in history.get(name, []))}
             for name in reg if not f["job"] or name == f["job"]]
    return _render(request, "runs.html", {"f": f, "page": page, "qs": qs_rest, "spark": spark, "job_names": list(reg),
                                          "statuses": [s for s, _ in FetchRun.Status.choices]}, section="runs")


@console
def tasks(request):
    now = timezone.now()
    f = {k: request.GET.get(k, "").strip() for k in ("kind", "status", "agent", "q")}
    page, qs_rest = _page(request, Q.tasks(**f))
    for t in page:
        t.age = now - t.created_at
        t.summary = Q.result_summary(t)
        t.stale = t.status == "claimed" and t.lease_until and t.lease_until < now
    return _render(request, "tasks.html", {
        "f": f, "page": page, "qs": qs_rest, "kinds": AgentTask.Kind.choices, "filtered": any(f.values()),
        "statuses": [s for s, _ in AgentTask.Status.choices] + ["stale"], "agents": Q.agents(),
        "throughput": Q.throughput(now),
    }, section="tasks")


@console
def task_detail(request, pk):
    from revisions.models import Revision

    task = get_object_or_404(AgentTask.objects.select_related("target_entry", "target_candidate", "target_proposal"), pk=pk)
    revs = Revision.objects.filter(task_id=task.pk).defer("before", "after").order_by("-id")
    now = timezone.now()
    return _render(request, "task_detail.html", {
        "t": task, "now": now, "stale": task.status == "claimed" and task.lease_until and task.lease_until < now,
        "revisions": revs[:50], "revision_count": revs.count(), "error": mask_secrets(task.error),
    }, section="tasks")


@console
def changes(request):
    from revisions.models import ACTOR_KINDS, Revision

    now = timezone.now()
    f = {k: request.GET.get(k, "").strip() for k in ("actor_kind", "table", "action", "actor", "reason", "task", "since", "until")}
    if f["task"] and not f["task"].isdigit():
        f["task"] = ""
    since, until = _date(f["since"]), _date(f["until"])
    qs = Q.revisions(**{**f, "since": since, "until": until + timedelta(days=1) if until else None})
    page, qs_rest = _page(request, qs)
    return _render(request, "changes.html", {
        "f": f, "page": page, "qs": qs_rest, "actor_kinds": ACTOR_KINDS, "tables": Q.revision_tables(),
        "actions": [a for a, _ in Revision.Action.choices], "daily": Q.revision_daily(now), "batches": Q.batches(now),
    }, section="changes")


@console
def revision_detail(request, pk):
    from revisions.models import Revision

    rev = get_object_or_404(Revision, pk=pk)
    same_change = Revision.objects.filter(txid=rev.txid, at=rev.at).defer("before", "after").order_by("id")
    return _render(request, "revision_detail.html", {
        "r": rev, "label": Q.row_label(rev), "diffs": field_diffs(rev), "history": Q.row_history(rev),
        "same_change": same_change[:50], "same_change_count": same_change.count(),
    }, section="changes")


@console
def releases(request):
    pointer = None
    try:
        from infra import storage

        pointer = storage.read_pointer()
    except Exception:  # noqa: BLE001 — shown as "unknown"
        pointer = None
    page, qs_rest = _page(request, Release.objects.order_by("-created_at", "-id"), size=25)
    for r in page:
        m = Q.manifest(r.version) or {}
        r.changes = m.get("changes")
        r.previous = m.get("previous")
        r.live = bool(pointer and pointer.get("version") == r.version)
    return _render(request, "releases.html", {"page": page, "qs": qs_rest, "pointer": pointer}, section="releases")


@console
def release_changes(request, version):
    release = get_object_or_404(Release, version=version)
    text = Q.change_report(release.version)
    if request.GET.get("raw") == "1":
        if text is None:
            raise Http404("no change report in the store")
        return HttpResponse(text, content_type="text/markdown; charset=utf-8")
    return _render(request, "release_changes.html", {"release": release, "report": text, "manifest": Q.manifest(release.version)},
                   section="releases")


@console
def programs(request):
    now = timezone.now()
    return _render(request, "programs.html", {
        "waves": Q.waves_overview(now), "pipeline": Q.pipeline(now), "facts": Q.fact_base(now), "proposals": Q.proposals(),
    }, section="programs")


# ── actions ───────────────────────────────────────────────────────────────────────────────────────────────────────

def _refused(request, kind, message, *, status=409):
    return _render(request, "refused.html", {"kind": kind, "label": OpsAction.Kind(kind).label if kind in OpsAction.Kind.values else kind,
                                             "message": message}, section="actions", status=status)


def _confirm_page(request, kind, plan: dict, token: str, *, error="", status=200, reason="", notes="", force=False):
    return _render(request, "confirm.html", {"kind": kind, "label": OpsAction.Kind(kind).label, "plan": plan, "token": token,
                                             "error": error, "reason": reason, "notes": notes, "force": force,
                                             "runs_in": acts.ACTIONS[kind].runs_in}, section="actions", status=status)


def plan_token(plan: acts.Plan, actor: str) -> tuple[dict, str]:
    """The confirmation's content and its signed token: the exact parameters, what the page showed, a new key."""
    data = {"kind": plan.kind, "target": plan.target, "params": plan.params, "summary": plan.summary, "check": plan.check_output,
            "rows": plan.rows, "table": plan.table, "warnings": plan.warnings, "fields": plan.fields,
            "key": uuid.uuid4().hex, "by": actor}
    return data, signing.dumps(data, salt=TOKEN_SALT, compress=True)


def _create(kind, *, target, params, reason, actor, key, check_output) -> tuple[OpsAction, bool]:
    try:
        with transaction.atomic():
            return OpsAction.objects.create(kind=kind, target=target, params=params, reason=reason, requested_by=actor, idempotency_key=key,
                                            runs_in=acts.ACTIONS[kind].runs_in, check_output=check_output), True
    except IntegrityError:
        return OpsAction.objects.get(idempotency_key=key), False


def _start(action: OpsAction):
    if action.runs_in == OpsAction.RunsIn.REQUEST:
        acts.run_now(action)
    return redirect("opsconsole:action", action.pk, permanent=False)


@operator
def act(request, kind):
    """Step 1: validate and show the confirmation page (or, for an action that writes nothing, queue it at once)."""
    spec = acts.ACTIONS.get(kind)
    if spec is None:
        raise Http404("no such action")
    actor = actor_of(request.user)
    try:
        plan = spec.prepare(request.POST, actor)
    except acts.Refused as e:
        return _refused(request, kind, str(e))
    if spec.direct:
        if why := acts.rate_refusal(actor):
            return _refused(request, kind, why, status=429)
        reason = (request.POST.get("reason") or "").strip() or "publish --check, before a publish"
        action, _ = _create(kind, target=plan.target, params=plan.params, reason=reason, actor=actor,
                            key=(request.POST.get("key") or uuid.uuid4().hex)[:64], check_output=plan.check_output)
        r = _start(action)
        r.status_code = 303
        return r
    data, token = plan_token(plan, actor)
    return _confirm_page(request, kind, data, token)


@operator
def confirm(request, kind):
    """Step 2: the token from the confirmation page and a reason → the OpsAction, run here or queued."""
    if kind not in acts.ACTIONS:
        raise Http404("no such action")
    try:
        data = signing.loads(request.POST.get("token", ""), salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE)
    except signing.SignatureExpired:
        return _refused(request, kind, "this confirmation is more than 30 minutes old: start again from the page", status=400)
    except signing.BadSignature:
        return _refused(request, kind, "the confirmation is not valid: start again from the page", status=400)
    actor = actor_of(request.user)
    if data.get("kind") != kind or data.get("by") != actor:
        raise PermissionDenied("this confirmation was made for another action or another user")
    existing = OpsAction.objects.filter(idempotency_key=data["key"]).first()
    if existing is not None:  # a double submit or a retried request: show what happened, act once
        return redirect("opsconsole:action", existing.pk)
    reason = (request.POST.get("reason") or "").strip()
    notes = (request.POST.get("notes") or "").strip()
    force = request.POST.get("force") == "1"
    if not reason:
        return _confirm_page(request, kind, data, request.POST["token"], error="Say why: the reason is recorded with the action.",
                             status=400, notes=notes, force=force)
    if why := acts.rate_refusal(actor):
        return _refused(request, kind, why, status=429)
    if kind in acts.EXCLUSIVE and (why := acts.exclusive_refusal()):
        return _refused(request, kind, why)
    params = dict(data["params"])
    if "notes" in data.get("fields", []):
        params["notes"] = notes
    if "force" in data.get("fields", []):
        params["force"] = force
    action, created = _create(kind, target=data["target"], params=params, reason=reason, actor=actor, key=data["key"], check_output=data.get("check", ""))
    if not created:
        return redirect("opsconsole:action", action.pk)
    r = _start(action)
    r.status_code = 303
    return r


@console
def action_list(request):
    f = {k: request.GET.get(k, "").strip() for k in ("kind", "status", "by")}
    qs = OpsAction.objects.defer("check_output", "output", "result", "params")
    if f["kind"]:
        qs = qs.filter(kind=f["kind"])
    if f["status"]:
        qs = qs.filter(status=f["status"])
    if f["by"]:
        qs = qs.filter(requested_by=f["by"])
    page, qs_rest = _page(request, qs.order_by("-created_at", "-id"))
    return _render(request, "actions.html", {"f": f, "page": page, "qs": qs_rest, "kinds": OpsAction.Kind.choices,
                                             "statuses": [s for s, _ in OpsAction.Status.choices]}, section="actions")


@console
def action_detail(request, pk):
    a = get_object_or_404(OpsAction, pk=pk)
    ctx = {"a": a, "label": OpsAction.Kind(a.kind).label, "error": mask_secrets(a.error),
           "worker_lock": Q.worker_holds_lock() if a.open and a.runs_in == "worker" else None,
           "refresh": ACTION_REFRESH_SECONDS if a.open else None}
    if a.kind == OpsAction.Kind.PUBLISH_CHECK and a.status == OpsAction.Status.DONE and can_act(request.user):
        try:
            plan = acts.prepare_publish({"check": a.pk}, actor_of(request.user))
            ctx["publish_plan"], ctx["publish_token"] = plan_token(plan, actor_of(request.user))
        except acts.Refused as e:
            ctx["publish_refused"] = str(e)
    if a.kind == OpsAction.Kind.PUBLISH:
        ctx["check_action"] = OpsAction.objects.filter(pk=(a.params or {}).get("check")).first()
    return _render(request, "action_detail.html", ctx, section="actions")


@operator
def action_cancel(request, pk):
    """Withdraw a worker action the worker has not taken yet."""
    actor = actor_of(request.user)
    n = OpsAction.objects.filter(pk=pk, status=OpsAction.Status.PENDING, runs_in=OpsAction.RunsIn.WORKER).update(
        status=OpsAction.Status.CANCELLED, finished_at=timezone.now(), error=f"cancelled by {actor} before the worker took it")
    if not n:
        get_object_or_404(OpsAction, pk=pk)
    return redirect("opsconsole:action", pk)
