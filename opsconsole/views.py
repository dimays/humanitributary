"""The operations console: pages for staff under /ops/, and the few actions operators take from them
(docs/guide/operations-console.md; ADR 0028, redesigned by ADR 0031).

Seven pages are in the sidebar: Dashboard (is anything wrong, what ran in the last day, what needs attention, what
runs next, the agents' queues), New events (the content made day to day, each item from fetched to published, and a
14-day pulse; ADR 0033), Jobs (one row per job, with its tags, schedule, last state and last ten runs),
Runs (every run, and a run's page with its log), Work (the agents' queues per task kind), Releases (and what each
carried) and Docs (the maintainer manual, the developer reference and the decisions, rendered).

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
from functools import wraps

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.core import signing
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.db import IntegrityError, transaction
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.utils.cache import add_never_cache_headers
from django.views.decorators.http import require_POST, require_safe

from ingest.models import Feed, FetchRun, RunLog
from ingest.policy import mask_secrets
from publish.models import Release
from work import queue as work_queue
from work import rounds as WR
from work.models import AgentTask, Round

from . import actions as acts
from . import docs as D
from . import newevents as NE
from . import queries as Q
from .models import OpsAction
from .templatetags.ops import field_diffs

PAGE_SIZE = 50
REFRESH_SECONDS = 30         # Dashboard, Runs and a running run's page reload themselves this often (a small script)
ACTION_REFRESH_SECONDS = 3   # an open action's page reloads itself this often
ROUND_REFRESH_SECONDS = 20   # Work and a round's page, while a round is open (the same small script as the Dashboard's)
TOKEN_SALT = "opsconsole.action"
TOKEN_MAX_AGE = 30 * 60      # a confirmation page is good for this long
PERMISSION = "opsconsole.ops_operator"
LOG_LEVELS = {"debug": 10, "info": 20, "warning": 30, "error": 40, "critical": 50}


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


def moved(name, *arg_names):
    """A page of the first console that now lives elsewhere: a permanent redirect (staff only, like the rest)."""

    @console
    def view(request, **kwargs):
        return redirect(reverse(name, args=[kwargs[a] for a in arg_names]), permanent=True)

    return view


def _render(request, template, ctx, *, section, status=200, refresh=None):
    base = {"section": section, "auto_refresh": refresh, "now": timezone.now(), "site_name": settings.SITE_NAME,
            "can_act": can_act(request.user), "states": Q.STATES}
    return render(request, f"opsconsole/{template}", base | ctx, status=status)


def _page(request, qs, size=PAGE_SIZE):
    page = Paginator(qs, size).get_page(request.GET.get("page"))
    q = request.GET.copy()
    q.pop("page", None)
    return page, q.urlencode()


def _duration(r):
    return (r.finished_at - r.started_at).total_seconds() if r.finished_at else None


def problems(now, health: dict, job_rows: list[dict], queue: list[dict]) -> list[dict]:
    """What is wrong, worst first, each in one sentence with where to look. A paused job is not a problem, whatever its
    last run did: the Dashboard lists it apart, in amber (`paused`), and it counts again once resumed. Nor is a failed
    run an operator dismissed (ADR 0039): `failures` leaves it out, as Needs attention does. A failing job being
    retried is still a problem until the retry completes; its sentence says so."""
    out = []
    for alias, s in health["storage"].items():
        if not s["ok"]:
            out.append({"level": "bad", "text": f"The {alias} store can't be reached ({s['error']}).", "href": None})
    if health["quiet"] and not health["worker"]:
        since = f"since {timezone.localtime(health['last_run_started']):%b %d %H:%M}" if health["last_run_started"] else "ever"
        out.append({"level": "bad", "text": f"No worker is running jobs: no run has started {since}.", "href": reverse("opsconsole:runs")})
    for r in job_rows:
        if r["failures"] and not r["paused"]:
            where = f" ({r['worst_feed']})" if r["worst_feed"] else ""
            text = f"{r['name']}{where} failed {r['failures']} run{'s' if r['failures'] != 1 else ''} in a row" + \
                (" — alert threshold reached." if r["alerting"] else ".")
            recovering = [r["recoveries"].get(x.pk) for x in r["failing"]]
            if recovering and all(recovering):
                text += f" {recovering[0]['label']}."
            out.append({"level": "bad" if r["alerting"] else "warn", "text": text, "href": reverse("opsconsole:job", args=[r["name"]])})
    stuck = sum(k["stuck"] for k in queue)
    if stuck:
        kinds = ", ".join(k["kind"] for k in queue if k["stuck"])
        out.append({"level": "warn", "text": f"{stuck} stuck lease{'s' if stuck != 1 else ''} ({kinds}): an agent stopped without finishing.",
                    "href": reverse("opsconsole:work")})
    late = [r["name"] for r in job_rows if r["overdue"]]
    if late:
        out.append({"level": "warn", "text": f"Overdue by more than 30 minutes: {', '.join(late)}.", "href": reverse("opsconsole:jobs")})
    if health["storage"].get("releases", {}).get("ok") and not health.get("pointer"):
        out.append({"level": "warn", "text": "No release is live: the releases store has no latest pointer.", "href": reverse("opsconsole:releases")})
    out.sort(key=lambda p: p["level"] != "bad")
    return out


# ── Dashboard ─────────────────────────────────────────────────────────────────────────────────────────────────────

@console
def dashboard(request):
    from ingest.jobs import holds

    now = timezone.now()
    health = Q.health(now)
    held = holds()  # paused and archived, read once for the page (an archived job is left out of all of it: ADR 0041)
    job_rows = Q.jobs(now, history=False, holds=held)
    queue = Q.queue(now, archived=set(held[1]))
    attention = [{"job": r, "run": run, "recovery": r["recoveries"].get(run.pk)} for r in job_rows for run in r["failing"]][:8]
    latest = Release.objects.order_by("-created_at", "-id").first()
    tl = Q.timeline(now, archived=set(held[1]))
    return _render(request, "dashboard.html", {
        "health": health, "problems": problems(now, health, job_rows, queue), "timeline": tl,
        "paused": [r for r in job_rows if r["paused"]],
        "run_cards": Q.run_cards((r["id"] for row in tl["rows"] for r in row["runs"]), now),
        "attention": attention, "dismissed_count": sum(len(r["dismissed"]) for r in job_rows if not r["paused"]), "upcoming": Q.upcoming(job_rows, now, limit=7), "queue": queue,
        "queue_active": [k for k in queue if k["active"]], "latest": latest, "today": Q.today(now),
        "open_actions": Q.open_actions(5), "recent_actions": Q.recent_actions(4),
        "round": Q.rounds_overview(now, queue),
    }, section="dashboard", refresh=REFRESH_SECONDS)


# ── New events ────────────────────────────────────────────────────────────────────────────────────────────────────

@console
def new_events(request):
    """The content feed: every write_event and fill_gap task and every edit file's addition, newest activity first,
    each with its five steps (opsconsole/newevents.py), the tabs and filters, and the 14-day pulse above them."""
    from timeline.models import Branch

    now = timezone.now()
    f = NE.parse(request.GET)
    data = NE.counts_and_pulse(f, now)
    page, qs_rest = _page(request, NE.Items(f, now, data["total"]), size=NE.PAGE_SIZE)
    items = list(page.object_list)

    def link(**changes):
        q = request.GET.copy()
        q.pop("page", None)
        for k, v in changes.items():
            if v:
                q[k] = v
            else:
                q.pop(k, None)
        return "?" + q.urlencode() if q else "?"

    return _render(request, "new_events.html", {
        "f": f, "data": data, "page": page, "items": items, "qs": qs_rest,
        "tabs": [(k, label, data["tabs"][k], link(tab=k if k != "all" else None, state=None)) for k, label, _ in NE.TABS],
        "ranges": [(k, label, link(range=k if k != NE.DEFAULT_RANGE else None)) for k, (label, _) in NE.RANGES.items()],
        "state_options": [(k, v[0], data["states"].get(k, 0)) for k, v in NE.STATES.items()],
        "cards": {i["key"]: NE.card(i) for i in items},
        "branches": Branch.objects.order_by("name").values_list("slug", "name"), "pulse_days": NE.PULSE_DAYS,
        "public_site": settings.PUBLIC_SITE_URL,
    }, section="new_events")


# ── Jobs ──────────────────────────────────────────────────────────────────────────────────────────────────────────

@console
def jobs(request):
    now = timezone.now()
    tag = request.GET.get("tag", "").strip()
    tags = Q.tag_set()
    if tag not in tags:
        tag = ""
    from ingest.jobs import holds

    held = holds()
    rows = Q.jobs(now, holds=held)
    counts = {t: sum(t in r["tags"] for r in rows) for t in tags}
    shown = [r for r in rows if not tag or tag in r["tags"]]
    return _render(request, "jobs.html", {"rows": shown, "tag": tag, "tags": tags, "tag_counts": counts, "total": len(rows),
                                          "archived_count": len(held[1]),
                                          "run_cards": Q.run_cards((h["id"] for r in shown for h in r["history"]), now)},
                   section="jobs")


@console
def jobs_archived(request):
    """The archived jobs (ADR 0041), each with who archived it and why, its runs kept, and Unarchive."""
    return _render(request, "jobs_archived.html", {"rows": Q.archived(timezone.now())}, section="jobs")


@console
def job_detail(request, name):
    """A job's page, reachable for an archived job too (its banner, its history, Unarchive). For an operator it
    carries the archive dialog (ADR 0041), its plan and signed token made now, like a publish check's page."""
    now = timezone.now()
    from ingest.jobs import holds

    held = holds()
    row = next((r for r in Q.jobs(now, include_archived=True, holds=held) if r["name"] == name), None)
    if row is None:
        raise Http404("no such job")
    page, qs_rest = _page(request, Q.fetch_runs(job=name), size=25)
    for r in page:
        r.state, r.duration, r.summary = Q.run_state(r.status), _duration(r), Q.counts_summary(r.counts)
    feeds = []
    if row["feed"]:
        feeds = list(Feed.objects.filter(config__job=name).only("id", "name", "enabled", "interval_minutes", "next_run_at", "last_run_at", "url").order_by("name"))
        for f in feeds:
            f.schedule = Q.every(f.interval_minutes or row["interval"])
    archive = None
    if can_act(request.user) and not row["archived"]:
        try:
            plan, token = plan_token(acts.prepare_archive_job({"job": name}, actor_of(request.user)), actor_of(request.user))
            archive = {"plan": plan, "token": token}
        except acts.Refused:
            archive = None
    return _render(request, "job_detail.html", {"j": row, "page": page, "qs": qs_rest, "feeds": feeds, "tags": Q.tag_set(),
                                                "run_cards": Q.run_cards((h["id"] for h in row["history"]), now),
                                                "archive": archive},
                   section="jobs")


# ── Runs ──────────────────────────────────────────────────────────────────────────────────────────────────────────

@console
def runs(request):
    now = timezone.now()
    reg = Q._registry()
    f = {k: request.GET.get(k, "").strip() for k in ("job", "state", "tag")}
    if f["job"] and f["job"] not in reg:
        f["job"] = ""
    if f["state"] not in Q.STATES:
        f["state"] = ""
    if f["tag"] not in Q.tag_set():
        f["tag"] = ""
    ctx = {"f": f, "job_names": list(reg), "tags": Q.tag_set(), "page": None, "console_runs": None, "next_up": None}
    if f["state"] in ("scheduled", "paused") or not f["state"]:
        allowed = set(Q.jobs_with_tag(f["tag"])) if f["tag"] else None
        rows = [r for r in Q.jobs(now, history=False) if (not f["job"] or r["name"] == f["job"]) and (allowed is None or r["name"] in allowed)]
        nxt = Q.upcoming(rows, now, limit=0 if f["state"] else 5)
        ctx["next_up"] = [x for x in nxt if not f["state"] or x["state"] == f["state"]]
    if f["state"] in ("pending", "cancelled"):
        ctx["console_runs"] = Q.console_runs(job=f["job"], tag=f["tag"], status=f["state"] if f["state"] == "cancelled" else "pending")
    if f["state"] in ("", "running", "completed", "failed", "cancelled"):  # cancelled: runs stopped by an archive (ADR 0041)
        page, qs_rest = _page(request, Q.fetch_runs(job=f["job"], state=f["state"], tag=f["tag"]))
        for r in page:
            r.state, r.duration, r.summary = Q.run_state(r.status), _duration(r), Q.counts_summary(r.counts)
        ctx.update(page=page, qs=qs_rest)
    return _render(request, "runs.html", ctx, section="runs", refresh=REFRESH_SECONDS)


@console
def run_detail(request, pk):
    run = get_object_or_404(FetchRun.objects.select_related("feed"), pk=pk)
    log = RunLog.objects.filter(run_id=run.pk).first()
    level = request.GET.get("level", "").lower()
    lines = log.lines if log else []
    if request.GET.get("format") == "text":
        text = "\n".join(f"{t} {lv:<8} {name}: {msg}" for t, lv, name, msg in lines) + ("\n" if lines else "")
        return HttpResponse(text, content_type="text/plain; charset=utf-8")
    shown = [ln for ln in lines if LOG_LEVELS.get(str(ln[1]).lower(), 20) >= LOG_LEVELS.get(level, 0)] if level in LOG_LEVELS else lines
    levels = {}
    for ln in lines:
        levels[ln[1]] = levels.get(ln[1], 0) + 1
    around = FetchRun.objects.filter(job=run.job)
    older = around.filter(started_at__lt=run.started_at).order_by("-started_at", "-id").values_list("id", flat=True).first()
    newer = around.filter(started_at__gt=run.started_at).order_by("started_at", "id").values_list("id", flat=True).first()
    j = Q._registry().get(run.job)
    counts = sorted((run.counts or {}).items(), key=lambda kv: (kv[0] != "errors", kv[0]))
    error = mask_secrets(run.error)
    # A failed run: being retried (Retry and Dismiss give way to where the retry is), or one that may be dismissed.
    # An archived job's failed run is neither retried nor dismissed from here (ADR 0041): its job is retired.
    job_archived = run.job in Q.archived_names()
    recovery = Q.recoveries([run]).get(run.pk) if run.status == "failed" and not run.dismissed_at else None
    dismissable = run.status == "failed" and not recovery and not job_archived and not acts.dismiss_refusal(run, recovery=recovery)
    return _render(request, "run_detail.html", {
        "recovery": recovery, "dismissable": dismissable, "job_archived": job_archived,
        "r": run, "state": Q.run_state(run.status), "duration": _duration(run), "log": log, "lines": shown, "level": level if level in LOG_LEVELS else "",
        "problem_lines": sum(n for lv, n in levels.items() if LOG_LEVELS.get(str(lv).lower(), 20) >= 30), "counts": counts, "error": error, "error_head": Q.first_line(error, 300), "older": older, "newer": newer,
        "job": j, "content": Q.run_revisions(run),
    }, section="runs", refresh=REFRESH_SECONDS if run.status == "running" else None)


# ── Work ──────────────────────────────────────────────────────────────────────────────────────────────────────────

@console
def work(request):
    now = timezone.now()
    queue = Q.queue(now)
    live = Q.live_round(now)  # the open round's batch as it moves (ADR 0040): the strip, and each kind card's line
    return _render(request, "work.html", {"queue": queue, "stuck": Q.stuck_leases(now), "wave": Q.wave(now), "live": live,
                                          "rounds": Q.rounds_overview(now, queue), "max_agents": WR.MAX_AGENTS_PER_ROLE,
                                          "max_tasks": WR.MAX_TASKS_PER_AGENT, "flow_doc": "jobs-and-work",
                                          "unrated": Q.unrated_asked()},
                   section="work", refresh=ROUND_REFRESH_SECONDS if live else None)


@console
def rounds(request):
    """Every agent round, newest first (ADR 0035)."""
    page, qs_rest = _page(request, Round.objects.select_related("release").order_by("-started_at", "-id"), size=25)
    return _render(request, "rounds.html", {"page": page, "qs": qs_rest, "cards": [Q.round_card(r) for r in page]}, section="work")


@console
def round_detail(request, pk):
    """One round: its stages (plan → agents → review → apply → publish), its progress per task kind and the tasks its
    agents claimed (ADR 0040), the plan, each agent's counts (recorded, and what the queue says), the verdicts, the
    edit file's ops and its actions, the release, and links to its drafts."""
    from revisions.models import Revision

    r = get_object_or_404(Round.objects.select_related("release"), pk=pk)
    actions = list(r.actions.order_by("created_at", "id"))
    txids = [(a.result or {}).get("txid") for a in actions if a.kind == OpsAction.Kind.EDITS_APPLY and a.status == "done"]
    revs = Revision.objects.filter(txid__in=[t for t in txids if t]).count() if any(txids) else 0
    return _render(request, "round_detail.html", {
        "r": r, "card": Q.round_card(r), "stages": WR.stages(r, actions), "actions": actions, "agents": Q.round_agents(r),
        "revisions": revs, "carry_over": (r.plan or {}).get("carry_over") or [], "mix": (r.plan or {}).get("mix") or {},
        "verdict_keys": WR.VERDICTS, "live": Q.live_round(timezone.now(), r), "round_tasks": Q.round_tasks(r),
    }, section="work", refresh=ROUND_REFRESH_SECONDS if r.open else None)


@console
def work_kind(request, kind):
    if kind not in AgentTask.Kind.values:
        raise Http404("no such task kind")
    now = timezone.now()
    tabs = {key: (label, status) for key, label, status in Q.TABS}
    tab = request.GET.get("tab", "waiting")
    if tab not in tabs:
        tab = "waiting"
    q = request.GET.get("q", "").strip()
    page, qs_rest = _page(request, Q.tasks(kind=kind, status=tabs[tab][1], q=q))
    for t in page:
        t.age = now - t.created_at
        t.summary = Q.result_summary(t)
        t.subject = Q.task_subject(t)
        t.stale = t.status == "claimed" and t.lease_until and t.lease_until < now
        t.deferred = t.status == "queued" and ((t.not_before and t.not_before > now) or bool(t.needs_kind))
    return _render(request, "work_kind.html", {
        "kind": kind, "label": AgentTask.Kind(kind).label, "tabs": Q.TABS, "tab": tab, "status": tabs[tab][1], "q": q,
        "page": page, "qs": qs_rest, "counts": Q.kind_counts(kind, now), "max_batch": acts.MAX_TASKS,
    }, section="work")


@console
def task_detail(request, pk):
    from revisions.models import Revision

    task = get_object_or_404(AgentTask.objects.select_related("target_entry"), pk=pk)
    revs = Revision.objects.filter(task_id=task.pk).defer("before", "after").order_by("-id")
    now = timezone.now()
    return _render(request, "task_detail.html", {
        "t": task, "now": now, "stale": task.status == "claimed" and task.lease_until and task.lease_until < now,
        "deferred": work_queue.is_deferred(task, now), "needs": (task.payload or {}).get("needs") if isinstance((task.payload or {}).get("needs"), dict) else None,
        "revisions": revs[:50], "revision_count": revs.count(), "error": mask_secrets(task.error), "pack": Q.evidence_pack(task),
    }, section="work")


@console
def revision_detail(request, pk):
    from revisions.models import Revision

    rev = get_object_or_404(Revision, pk=pk)
    same_change = Revision.objects.filter(txid=rev.txid, at=rev.at).defer("before", "after").order_by("id")
    return _render(request, "revision_detail.html", {
        "r": rev, "label": Q.row_label(rev), "diffs": field_diffs(rev), "history": Q.row_history(rev),
        "same_change": same_change[:50], "same_change_count": same_change.count(),
        "release": Release.objects.filter(revision_high_water__gte=rev.pk).order_by("revision_high_water", "id").first(),
    }, section="releases")


# ── Releases ──────────────────────────────────────────────────────────────────────────────────────────────────────

@console
def releases(request):
    pointer = Q.pointer()
    page, qs_rest = _page(request, Release.objects.order_by("-created_at", "-id"), size=25)
    rels = list(page)
    before = None
    if rels:
        last = rels[-1]
        before = Release.objects.filter(created_at__lte=last.created_at).exclude(pk=last.pk).order_by("-created_at", "-id").first()
    Q.annotate_releases(rels, before, (pointer or {}).get("version"))
    newest = Release.objects.order_by("-created_at", "-id").only("revision_high_water", "version").first()
    pending = Q.by_actor_kind(Q.revisions_between(newest.revision_high_water if newest else 0, None))
    return _render(request, "releases.html", {"page": page, "rels": rels, "qs": qs_rest, "pointer": pointer, "newest": newest,
                                              "pending": pending, "pending_total": sum(pending.values()), "facts": Q.fact_base()},
                   section="releases")


def _release_revisions(request, low, high):
    qs = Q.revisions_between(low, high)
    page, qs_rest = _page(request, qs)
    return page, qs_rest, Q.by_actor_kind(qs)


@console
def release_detail(request, version):
    release = get_object_or_404(Release, version=version)
    text = Q.change_report(release.version)
    if request.GET.get("raw") == "1":
        if text is None:
            raise Http404("no change report in the store")
        return HttpResponse(text, content_type="text/markdown; charset=utf-8")
    prev = Release.objects.filter(created_at__lte=release.created_at).exclude(pk=release.pk).order_by("-created_at", "-id").first()
    pointer = Q.pointer()
    Q.annotate_releases([release], prev, (pointer or {}).get("version"))
    page, qs_rest, kinds = _release_revisions(request, prev.revision_high_water if prev else 0, release.revision_high_water)
    return _render(request, "release_detail.html", {
        "release": release, "prev": prev, "manifest": Q.manifest(release.version), "pointer": pointer,
        "report": D.render_markdown(text).html if text else None, "page": page, "qs": qs_rest, "kinds": kinds,
    }, section="releases")


@console
def unreleased(request):
    newest = Release.objects.order_by("-created_at", "-id").first()
    page, qs_rest, kinds = _release_revisions(request, newest.revision_high_water if newest else 0, None)
    return _render(request, "unreleased.html", {"newest": newest, "page": page, "qs": qs_rest, "kinds": kinds}, section="releases")


# ── Docs ──────────────────────────────────────────────────────────────────────────────────────────────────────────

@console
def docs_index(request):
    return _render(request, "docs.html", {"tree": D.tree(), "doc": None, "rendered": None}, section="docs")


@console
def doc(request, section, slug):
    d = D.find(section, slug)
    if d is None:
        raise Http404("no such document")
    return _render(request, "docs.html", {"tree": D.tree(), "doc": d, "rendered": D.render(d), "section_title": D.SECTIONS[section][0],
                                          "mermaid_url": D.MERMAID_URL}, section="docs")


# ── actions ───────────────────────────────────────────────────────────────────────────────────────────────────────

def _refused(request, kind, message, *, status=409):
    return _render(request, "refused.html", {"kind": kind, "label": OpsAction.Kind(kind).label if kind in OpsAction.Kind.values else kind,
                                             "message": message}, section="actions", status=status)


def _confirm_page(request, kind, plan: dict, token: str, *, error="", status=200, reason="", notes="", force=False, typed=""):
    return _render(request, "confirm.html", {"kind": kind, "label": OpsAction.Kind(kind).label, "plan": plan, "token": token,
                                             "error": error, "reason": reason, "notes": notes, "force": force, "typed": typed,
                                             "runs_in": acts.ACTIONS[kind].runs_in}, section="actions", status=status)


def plan_token(plan: acts.Plan, actor: str) -> tuple[dict, str]:
    """The confirmation's content and its signed token: the exact parameters, what the page showed, a new key."""
    data = {"kind": plan.kind, "target": plan.target, "params": plan.params, "summary": plan.summary, "check": plan.check_output,
            "rows": plan.rows, "table": plan.table, "warnings": plan.warnings, "fields": plan.fields,
            "confirm_name": plan.confirm_name, "key": uuid.uuid4().hex, "by": actor}
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
    typed = request.POST.get("confirm_name") or ""
    # An action that asks for a typed name (archiving a job, ADR 0041) is checked here too, not only in the browser:
    # exactly the name, as the signed token holds it.
    if data.get("confirm_name") and typed != data["confirm_name"]:
        return _confirm_page(request, kind, data, request.POST["token"], status=400, reason=reason, typed=typed,
                             error=f"Type the job's name exactly, {data['confirm_name']}, to confirm.")
    if not reason:
        return _confirm_page(request, kind, data, request.POST["token"], error="Say why: the reason is recorded with the action.",
                             status=400, notes=notes, force=force, typed=typed)
    if why := acts.rate_refusal(actor):
        return _refused(request, kind, why, status=429)
    if kind in acts.EXCLUSIVE and (why := acts.exclusive_refusal()):
        return _refused(request, kind, why)
    params = dict(data["params"])
    if "notes" in data.get("fields", []):
        params["notes"] = notes
    if "force" in data.get("fields", []):
        params["force"] = force
    if data.get("confirm_name"):
        params["confirmed_name"] = typed
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
