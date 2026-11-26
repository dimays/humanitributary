"""`/healthz`: is the platform working (docs/adr/0019-processes-and-release-gates.md).

    {"ok": true, "db": {"ok": true}, "storage": {"raw": {"ok": true}, "releases": {"ok": true}},
     "latest_release": "2026.11.26.2",
     "jobs": {"portal": {"last_ok": "…", "last_run": "…", "last_status": "ok", "consecutive_failures": 0}, …},
     "queue": {"queued": {"write_event": 12, …}, "claimed": 3, "expired_leases": 0}}

200 when the database and both stores answer, 503 otherwise (a load balancer or uptime check reads the status; the
body says why). Job and queue figures are informational: a failing job alerts by email instead (infra/alerts.py).
Nothing secret is in it: names of jobs, counts and timestamps.
"""

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
    out["queue"] = queue()
    return out


def jobs() -> dict:
    from infra.alerts import consecutive_failures
    from ingest.jobs import REGISTRY, _load_registry
    from ingest.models import FetchRun

    _load_registry()
    last_ok = dict(FetchRun.objects.filter(status__in=["ok", "partial"]).values("job").annotate(m=Max("started_at")).values_list("job", "m"))
    last_any = dict(FetchRun.objects.values("job").annotate(m=Max("started_at")).values_list("job", "m"))
    out = {}
    for name in REGISTRY:
        last = FetchRun.objects.filter(job=name).exclude(status="running").order_by("-started_at", "-id").only("status", "feed_id").first()
        out[name] = {
            "last_ok": _iso(last_ok.get(name)), "last_run": _iso(last_any.get(name)),
            "last_status": last.status if last else None,
            "consecutive_failures": consecutive_failures(name, last.feed_id) if last else 0,
        }
    return out


def queue() -> dict:
    from work.models import AgentTask

    now = timezone.now()
    queued = dict(AgentTask.objects.filter(status="queued").values("kind").annotate(n=Count("id")).values_list("kind", "n"))
    agg = AgentTask.objects.aggregate(claimed=Count("id", filter=Q(status="claimed")), expired=Count("id", filter=Q(status="claimed", lease_until__lt=now)))
    return {"queued": dict(sorted(queued.items())), "queued_total": sum(queued.values()), "claimed": agg["claimed"], "expired_leases": agg["expired"]}


@require_GET
def healthz(request):
    s = status()
    return JsonResponse(s, status=200 if s["ok"] else 503, json_dumps_params={"indent": 1})
