"""The operations console: read-only pages for staff under /ops/ (docs/guide/operations-console.md, ADR 0028).

Every view is wrapped by `console`: GET and HEAD only, staff only (`staff_member_required`: anyone else is sent to
the admin's login), never cached, `X-Robots-Tag: noindex`, and, when `settings.OPS_HOSTS` names hosts, a 404 on any
other host (so the public page's domain has no /ops/). Nothing here writes: phase 2's actions are only planned (ADR 0028).
"""

from datetime import datetime, timedelta
from functools import wraps

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.core.paginator import Paginator
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.utils.cache import add_never_cache_headers
from django.views.decorators.http import require_safe

from ingest.models import FetchRun
from ingest.policy import mask_secrets
from publish.models import Release
from work.models import AgentTask

from . import queries as Q
from .templatetags.ops import field_diffs

PAGE_SIZE = 50
REFRESH_SECONDS = 60


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


def _render(request, template, ctx, *, section):
    refresh = request.GET.get("refresh") == "1"
    q = request.GET.copy()
    q.pop("refresh", None)
    q.pop("page", None)
    if not refresh:
        q["refresh"] = "1"
    base = {"section": section, "refresh": REFRESH_SECONDS if refresh else None, "refresh_toggle": "?" + q.urlencode(),
            "now": timezone.now(), "site_name": settings.SITE_NAME}
    return render(request, f"opsconsole/{template}", base | ctx)


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
        "intake": Q.intake(now), "latest": latest,
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
        "f": f, "page": page, "qs": qs_rest, "kinds": AgentTask.Kind.choices,
        "statuses": [s for s, _ in AgentTask.Status.choices] + ["stale"], "agents": Q.agents(),
        "throughput": Q.throughput(now),
    }, section="tasks")


@console
def task_detail(request, pk):
    from revisions.models import Revision

    task = get_object_or_404(AgentTask.objects.select_related("target_entry", "target_candidate", "target_proposal"), pk=pk)
    revs = Revision.objects.filter(task_id=task.pk).defer("before", "after").order_by("-id")
    return _render(request, "task_detail.html", {
        "t": task, "now": timezone.now(), "revisions": revs[:50], "revision_count": revs.count(),
        "error": mask_secrets(task.error),
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
