"""`/healthz`: is the platform working (docs/adr/0019-processes-and-release-gates.md).

    {"ok": true, "db": {"ok": true}, "storage": {"raw": {"ok": true}, "releases": {"ok": true}}, "storage_backend": "s3",
     "latest_release": "2026.11.26.2",
     "jobs": {"portal": {"state": "ok", "last_ok": "…", "last_run": "…", "last_status": "ok", "consecutive_failures": 0},
              "gazette": {"state": "paused", "paused": {"by": "human:owner", "at": "…", "reason": "…"}, …}, …},
     "failing_jobs": [], "paused_jobs": ["gazette"], "dismissed_jobs": [],
     "queue": {"queued": {"write_event": 12, …}, "claimed": 3, "expired_leases": 0}}

200 when the database and both stores answer, 503 otherwise (a load balancer or uptime check reads the status; the
body says why). Job and queue figures are informational: a failing job alerts by email instead (infra/alerts.py).
A job is judged by each of its feeds' last finished runs (its own, for a job without feeds), the same runs the
console's "Needs attention" lists. Its `state` is "failing" when one of them failed (`consecutive_failures` counts
the worst feed's failures in a row), "ok" when they completed, "never_run", "paused" when it is paused from the
console (a paused job isn't failing, whatever its last runs did; its count is still shown), or "dismissed" when every
one that failed was dismissed by an operator from the console (ADR 0039: with who, when and the run; the count is
still shown). Only failing jobs are in `failing_jobs`. Resuming a job, or a newer failed run after a dismissal, brings
it back. A failed run being retried stays failing until the retry completes. An archived job (ADR 0041) is left out
altogether: it is not in `jobs`, `failing_jobs`, `paused_jobs` or `dismissed_jobs` (it is paused, and retired).
Nothing secret is in it: names of jobs, counts and timestamps.
"""

from django.conf import settings
from django.db import connection
from django.db.models import Count, Max, Q
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET

from . import storage


def _iso(dt):
    return dt.isoformat(timespec="seconds") if dt else None


def status() -> dict:
    out = {"ok": True, "checked_at": _iso(timezone.now())}
    try:
        with connection.cursor() as c:
            c.execute("SELECT 1")
            c.fetchone()
        out["db"] = {"ok": True}
    except Exception as e:  # noqa: BLE001
        out["db"] = {"ok": False, "error": type(e).__name__}
        out["ok"] = False
        return out  # nothing below can be read without the database
    out["storage"] = {}
    out["storage_backend"] = settings.STORAGE_BACKEND  # "local" when hosted means a disk thrown away on restart
    for alias in (storage.RAW, storage.RELEASES):
        ok, err = storage.reachable(alias)
        out["storage"][alias] = {"ok": ok} | ({"error": err} if err else {})
        out["ok"] &= ok
    try:
        p = storage.read_pointer() if out["storage"][storage.RELEASES]["ok"] else None
        out["latest_release"] = (p or {}).get("version")
    except Exception:  # noqa: BLE001
        out["latest_release"] = None
    out["jobs"] = jobs()
    out["failing_jobs"] = [n for n, j in out["jobs"].items() if j["state"] == "failing"]
    out["paused_jobs"] = [n for n, j in out["jobs"].items() if j["state"] == "paused"]
    out["dismissed_jobs"] = [n for n, j in out["jobs"].items() if j["state"] == "dismissed"]
    out["queue"] = queue()
    return out


def jobs() -> dict:
    from infra.alerts import consecutive_failures
    from ingest.jobs import REGISTRY, _load_registry, archived_jobs, paused_jobs
    from ingest.models import FetchRun

    _load_registry()
    last_ok = dict(FetchRun.objects.filter(status__in=["ok", "partial"]).values("job").annotate(m=Max("started_at")).values_list("job", "m"))
    last_any = dict(FetchRun.objects.values("job").annotate(m=Max("started_at")).values_list("job", "m"))
    # Each job's and feed's last finished run (one query), as the console's Needs attention reads them.
    lasts = {}
    for r in (FetchRun.objects.exclude(status="running").only("id", "job", "feed_id", "status", "started_at", "dismissed_at", "dismissed_by")
              .order_by("job", "feed_id", "-started_at", "-id").distinct("job", "feed_id")):
        lasts.setdefault(r.job, []).append(r)
    paused = paused_jobs()
    archived = archived_jobs()
    out = {}
    for name in REGISTRY:
        if name in archived:
            continue
        mine = sorted(lasts.get(name, []), key=lambda r: (r.started_at, r.pk), reverse=True)
        last = mine[0] if mine else None
        failed = [r for r in mine if r.status == "failed"]
        failing = [r for r in failed if not r.dismissed_at]
        counted = failing or failed
        failures = max((consecutive_failures(name, r.feed_id) for r in counted), default=0)
        state = ("paused" if name in paused else "failing" if failing else "dismissed" if failed else "ok" if last else "never_run")
        out[name] = {
            "state": state, "last_ok": _iso(last_ok.get(name)), "last_run": _iso(last_any.get(name)),
            "last_status": last.status if last else None, "consecutive_failures": failures,
        } | ({"paused": paused[name]} if name in paused else {}) | (
            {"dismissed": {"run": failed[0].pk, "by": failed[0].dismissed_by, "at": _iso(failed[0].dismissed_at)}} if state == "dismissed" else {})
    return out


def queue() -> dict:
    from work.models import AgentTask

    now = timezone.now()
    from work.queue import backlog_q

    # The owner's review backlog (ADR 0046) is noiseless: never counted here.
    queued = dict(AgentTask.objects.filter(status="queued").exclude(backlog_q()).values("kind").annotate(n=Count("id")).values_list("kind", "n"))
    agg = AgentTask.objects.aggregate(claimed=Count("id", filter=Q(status="claimed")), expired=Count("id", filter=Q(status="claimed", lease_until__lt=now) & ~Q(claimed_by__startswith="human:")))
    return {"queued": dict(sorted(queued.items())), "queued_total": sum(queued.values()), "claimed": agg["claimed"], "expired_leases": agg["expired"]}


@require_GET
def healthz(request):
    s = status()
    return JsonResponse(s, status=200 if s["ok"] else 503, json_dumps_params={"indent": 1})
