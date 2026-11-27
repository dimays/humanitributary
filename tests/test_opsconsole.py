"""The operations console (/ops/; ADR 0028, redesigned by ADR 0031): staff only, read-only pages that each render
with populated tables, a run's captured log (masked and capped), the Docs page's rendering, and each page's query
count staying fixed as the tables grow.

`seed()` fills a database with what the pages show (runs over the last day with their logs, tasks, Revisions, a
release, console actions, a paused job, the waves' state). It is also how a local database is populated for a look
at the pages:
    uv run python manage.py shell -c "from tests.test_opsconsole import seed; seed(skip_gates=(), releases=2)"
"""

import logging
import shutil
import tempfile
from datetime import timedelta
from pathlib import Path
from unittest import mock

from django.conf import settings
from django.contrib.auth.models import User
from django.core.cache import cache
from django.db import connection
from django.test import TestCase, override_settings
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from django.utils import timezone

from ingest import jobs, runlog
from ingest.models import Candidate, Feed, FetchRun, JobState, RunLog
from opsconsole import docs as D
from opsconsole.models import OpsAction
from publish.legacy import import_content
from publish.models import Release
from publish.release import publish
from revisions import revising
from revisions.models import Revision
from timeline import services
from timeline.models import Event
from work.models import AgentTask

from .fixtures import small
from .runner import FreshStorage

PAGES = ["dashboard", "jobs", "runs", "work", "releases", "docs"]


def _log(run, lines):
    RunLog.objects.update_or_create(run=run, defaults={"lines": lines, "line_count": len(lines), "bytes": sum(len(x[3]) for x in lines)})


def seed(now=None, *, runs_per_job: int = 6, extra_tasks: int = 0, publish_release: bool = True, releases: int = 1, skip_gates=("build",)):
    """Runs (with logs), tasks, Revisions, releases, console actions and the waves' state, shaped like a working day's.
    Safe on a fresh database (or the test database); it never touches the archive's content beyond two audited edits."""
    now = now or timezone.now()
    from evidence.models import Publisher

    pub = Publisher.objects.order_by("id").first()
    feed = None
    if pub:
        feed, _ = Feed.objects.get_or_create(url="https://en.wikipedia.org/wiki/Portal:Current_events", defaults=dict(
            publisher=pub, name="Wikipedia Current events portal", kind="api", interval_minutes=60,
            config={"job": "portal"}, next_run_at=now + timedelta(minutes=20)))
    if publish_release:
        publish(actor="job:seed", skip_gates=tuple(skip_gates))
    plain = {"process": 15, "enrich_tasks": 60, "gap_pointers": 60, "link_health": 1440, "facts_sweep": 1440, "gap_waves": 1440,
             "entity_relations": 60}
    for job, every in plain.items():
        n = runs_per_job * (4 if every <= 60 else 1)  # the frequent jobs fill the day's run graph
        for i in range(n):
            t = now - timedelta(minutes=every * (n - i)) + timedelta(minutes=3)
            status, error = "ok", ""
            if job == "link_health" and i >= n - 3:
                status, error = "failed", ("FetchError: https://example.org/x?api_key=SECRETKEY123 timed out\nTraceback (most recent call last):\n"
                                           "  File \"ingest/linkhealth.py\", line 88, in run\nFetchError: timed out")
            elif job == "enrich_tasks" and i == n - 1:
                status, error = "partial", "openalex: HTTP 503 on one lookup"
            counts = {"process": {"candidates": 412 + i, "clusters": 120, "clusters_over_threshold": 9, "tasks_created": 2},
                      "gap_waves": {"queued": 4, "W1.gaps": 310}}.get(job, {"checked": 50 + i, "requests": 12})
            if error:
                counts = {**counts, "errors": 1}
            took = 3 + 7 * (i % 9)
            due = t - timedelta(seconds=4 + (i * 37) % 80) if i >= 2 else None  # the first two from before scheduled_for was recorded
            r = FetchRun.objects.create(job=job, started_at=t, finished_at=t + timedelta(seconds=took), status=status, counts=counts, error=error,
                                        scheduled_for=due)
            if i >= n - 2:
                at = t.isoformat(timespec="milliseconds")
                lines = [[at, "INFO", "ingest.jobs", f"{job} started"]]
                lines += [[at, "INFO", "ingest.http", f"GET https://www.wikidata.org/w/api.php?… → 200 ({120 + k} ms, 5120 bytes)"] for k in range(3)]
                if status == "partial":
                    lines.append([at, "WARNING", "ingest.http", "GET https://api.openalex.org/works?… → 503; retrying in 2 s"])
                if status == "failed":
                    lines.append([at, "ERROR", f"job.{job}", runlog.mask(error)])
                lines.append([(t + timedelta(seconds=took)).isoformat(timespec="milliseconds"), "ERROR" if status == "failed" else "INFO",
                              "ingest.jobs", f"{job} finished: {status} in {took:.1f} s"])
                _log(r, lines)
    FetchRun.objects.create(job="gap_pointers", started_at=now - timedelta(minutes=1), status="running", scheduled_for=now - timedelta(minutes=1, seconds=20))
    k = OpsAction.objects.count()

    def console_run(kind, job, asked, picked, took, status, *, retry_of=None, error="", counts=None):
        a = OpsAction.objects.create(kind=kind, target=f"job:{job}", params={"job": job, **({"run": retry_of.pk} if retry_of else {})},
                                     reason="seeded: see whether it passes now", requested_by="human:owner", idempotency_key=f"seed-{kind}-{job}-{k}-{asked:%H%M}",
                                     runs_in="worker", status="done", started_at=picked, finished_at=picked + timedelta(seconds=took + 1))
        OpsAction.objects.filter(pk=a.pk).update(created_at=asked)
        start = picked + timedelta(seconds=1)
        r = FetchRun.objects.create(job=job, started_at=start, finished_at=start + timedelta(seconds=took), status=status, error=error,
                                    counts=counts or {"checked": 40, "requests": 9, **({"errors": 1} if error else {})},
                                    trigger="retry" if retry_of else "manual", triggered_by="human:owner", ops_action=a.pk,
                                    retry_of=retry_of, attempt=retry_of.attempt + 1 if retry_of else 1)
        OpsAction.objects.filter(pk=a.pk).update(result={"runs": [{"id": r.pk, "feed": None, "status": status, "counts": r.counts}]})
        return r

    # A manual run, and a scheduled run that failed, was retried, failed again and passed on the second retry.
    console_run("run_job", "entity_relations", now - timedelta(hours=2, minutes=4), now - timedelta(hours=2, minutes=3, seconds=15), 18, "ok",
                counts={"entities": 64, "relations": 210, "requests": 33})
    t = now - timedelta(hours=5, minutes=40)
    first = FetchRun.objects.create(job="gap_pointers", started_at=t, finished_at=t + timedelta(seconds=9), status="failed", scheduled_for=t - timedelta(seconds=25),
                                    error="HTTPError: 502 Bad Gateway from en.wikipedia.org\nTraceback (most recent call last): …", counts={"errors": 1, "requests": 3})
    second = console_run("retry_run", "gap_pointers", t + timedelta(minutes=12), t + timedelta(minutes=13), 7, "failed", retry_of=first,
                         error="HTTPError: 502 Bad Gateway from en.wikipedia.org")
    console_run("retry_run", "gap_pointers", t + timedelta(minutes=41), t + timedelta(minutes=41, seconds=20), 46, "ok", retry_of=second,
                counts={"tasks": 20, "pointers": 57, "requests": 61})
    if feed:
        for i in range(runs_per_job * 4):
            t = now - timedelta(hours=runs_per_job * 4 - i)
            FetchRun.objects.create(job="portal", feed=feed, started_at=t, finished_at=t + timedelta(seconds=20), status="ok",
                                    counts={"fetched": 3, "new": i % 4, "requests": 4})

    tag = AgentTask.objects.count()  # keeps dedupe keys unique when seeding twice

    def task(kind, status, *, agent="", created=None, claimed=None, done=None, lease=None, result=None, payload=None, **kw):
        if kw.get("dedupe_key"):
            kw["dedupe_key"] += f":{tag}"
        t = AgentTask.objects.create(
            kind=kind, status=status, created_by=kw.pop("created_by", "job:process" if kind == "write_event" else "job:gap_waves"),
            claimed_by=agent, claimed_at=claimed, completed_at=done, lease_until=lease,
            result=result, payload=payload or {}, attempts=1 if agent else 0, **kw)
        if created:  # created_at is auto_now_add
            AgentTask.objects.filter(pk=t.pk).update(created_at=created)
            t.created_at = created
        return t

    created = []
    created.append(task("write_event", "queued", priority=82, dedupe_key="cluster:storm-a", payload={"cluster_key": "storm-a", "items": []}))
    created.append(task("write_event", "claimed", agent="agent:writer-a", claimed=now - timedelta(hours=2), lease=now - timedelta(minutes=50),
                        priority=75, dedupe_key="cluster:summit-b"))
    for d in range(5):
        day = now - timedelta(days=d)
        created.append(task("write_event", "done", agent="agent:writer-a", created=day - timedelta(hours=3), claimed=day - timedelta(minutes=14),
                            done=day, result={"decision": "written", "entry": f"seeded-event-{d}"}, priority=80))
        created.append(task("write_event", "done", agent="agent:writer-b", created=day - timedelta(hours=3), claimed=day - timedelta(minutes=6),
                            done=day, result={"decision": "rejected", "note": "A routine incident with no outcome yet."}, priority=71))
        created.append(task("fill_gap", "done", agent="agent:gaps-a", created=day - timedelta(hours=5), claimed=day - timedelta(minutes=7),
                            done=day, result={"decision": "nothing_notable" if d % 2 else "written"}, priority=55,
                            payload={"wave": {"name": "W1"}, "branch": {"id": f"branch-{d}"}}, dedupe_key=f"gap:branch-{d}:1925:1930"))
    created.append(task("fill_gap", "queued", priority=58, payload={"wave": {"name": "W1"}, "branch": {"id": "france"}}, dedupe_key="gap:france:1940:1945"))
    created.append(task("fill_gap", "claimed", agent="agent:gaps-a", claimed=now - timedelta(minutes=10), lease=now + timedelta(minutes=50),
                        priority=57, dedupe_key="gap:japan:1930:1935"))
    created.append(task("verify_claim", "failed", agent="agent:verifier-a", created_by="job:facts_sweep", claimed=now - timedelta(hours=1),
                        done=now - timedelta(minutes=30), error="agent:verifier-a: the page is browser_only"))
    for i in range(extra_tasks):
        created.append(task("verify_claim", "queued", created_by="job:facts_sweep", priority=i % 10, dedupe_key=f"claim:{i}"))

    ev = Event.objects.order_by("id").first()
    if ev:
        t = created[2]
        with revising("agent:writer-a", reason=f"write_event #{t.pk} (agent API)", task=t):
            services.save_event(ev.slug, text=ev.text + " A sentence an agent added, from the seeded task.")
        with revising("human:owner", reason=f"apply_edits round-3 #1 retitle {ev.slug}: clearer title"):
            services.save_event(ev.slug, title=ev.title + " (reviewed)")
    if publish_release and releases > 1:
        publish(actor="human:owner", skip_gates=tuple(skip_gates))
    for i, status in enumerate(["queued", "queued", "rejected", "accepted"]):
        Candidate.objects.get_or_create(source_key=f"seed:{i}", defaults=dict(title=f"Seeded story {i}", status=status, cluster_key=f"c{i % 2}", created_by="job:portal"))
    JobState.objects.update_or_create(name="gap_waves", defaults={"state": {
        "active": "W1", "history": [],
        "last_run": {"at": now.isoformat(timespec="seconds"), "gaps": {"W1": 310}, "gaps_by_kind": {"W1": {"empty": 300, "sparse": 10}},
                     "coverage": {"W1": {"share_covered": 0.84, "pairs": 2085, "empty": 300, "sparse": 10}},
                     "counts": {"W1.held_cap": 270, "W1.held_branch": 30, "W1.recent_written": 3, "queued": 4}, "per_day": 40}}})
    jobs.set_paused("year_pages", True, by="human:owner", reason="the 2026 pages are being reorganized")
    OpsAction.objects.create(kind="run_job", target="job:facts_sweep", params={"job": "facts_sweep"}, reason="a new claim splitter",
                             requested_by="human:owner", idempotency_key=f"seed-pending-{k}", runs_in="worker")
    OpsAction.objects.create(kind="run_job", target="job:pageviews", params={"job": "pageviews"}, reason="check the new limit",
                             requested_by="human:owner", idempotency_key=f"seed-cancelled-{k}", runs_in="worker", status="cancelled",
                             error="cancelled by human:owner before the worker took it", finished_at=now - timedelta(hours=3))
    OpsAction.objects.create(kind="pause_job", target="job:year_pages", params={"job": "year_pages"}, reason="the 2026 pages are being reorganized",
                             requested_by="human:owner", idempotency_key=f"seed-pause-{k}", runs_in="request", status="done",
                             started_at=now - timedelta(hours=5), finished_at=now - timedelta(hours=5))
    return created


def staff_login(case):
    case.staff = getattr(case, "staff", None) or User.objects.create_user("staff", password="x", is_staff=True)
    case.client.force_login(case.staff)


class AccessTests(FreshStorage, TestCase):
    def test_anonymous_is_sent_to_the_admin_login(self):
        for name in PAGES:
            r = self.client.get(reverse(f"opsconsole:{name}"))
            self.assertEqual(r.status_code, 302, name)
            self.assertIn("/admin/login/", r["Location"])
        self.assertEqual(self.client.get(reverse("opsconsole:run", args=[1])).status_code, 302)
        self.assertEqual(self.client.get(reverse("opsconsole:doc", args=["guide", "architecture"])).status_code, 302)

    def test_non_staff_is_refused(self):
        User.objects.create_user("reader", password="x")
        self.client.login(username="reader", password="x")
        for name in PAGES:
            r = self.client.get(reverse(f"opsconsole:{name}"))
            self.assertIn(r.status_code, (302, 403), name)
            self.assertNotIn(b"Operations", r.content)

    def test_staff_get_pages_marked_noindex_and_uncached(self):
        staff_login(self)
        for name in PAGES:
            r = self.client.get(reverse(f"opsconsole:{name}"))
            self.assertEqual(r.status_code, 200, name)
            self.assertEqual(r["X-Robots-Tag"], "noindex, nofollow")
            self.assertIn("no-store", r["Cache-Control"])
            self.assertContains(r, '<meta name="robots" content="noindex, nofollow">', html=False)

    def test_read_only(self):
        staff_login(self)
        for name in PAGES:
            self.assertEqual(self.client.post(reverse(f"opsconsole:{name}")).status_code, 405, name)

    def test_the_sidebar_has_six_items(self):
        staff_login(self)
        r = self.client.get(reverse("opsconsole:dashboard"))
        nav = r.content.decode().split('<nav class="nav"', 1)[1].split("</nav>", 1)[0]
        self.assertEqual([x.split("</span>")[0] for x in nav.split("<span>")[1:]], ["Dashboard", "Jobs", "Runs", "Work", "Releases", "Docs"])

    @override_settings(OPS_HOSTS=["data.example.org"])
    def test_other_hosts_have_no_console(self):
        staff_login(self)
        with self.settings(ALLOWED_HOSTS=["data.example.org", "example.org"]):
            self.assertEqual(self.client.get("/ops/", HTTP_HOST="example.org").status_code, 404)
            self.assertEqual(self.client.get("/ops/docs/", HTTP_HOST="example.org").status_code, 404)
            self.assertEqual(self.client.get("/ops/", HTTP_HOST="data.example.org").status_code, 200)

    def test_admin_header_links_to_the_console(self):
        User.objects.create_user("boss", password="x", is_staff=True, is_superuser=True)
        self.client.login(username="boss", password="x")
        self.assertContains(self.client.get("/admin/"), 'href="/ops/"')

    def test_old_addresses_redirect(self):
        staff_login(self)
        for old, new in [("/ops/tasks/", "/ops/work/"), ("/ops/programs/", "/ops/"), ("/ops/changes/", "/ops/releases/unreleased/"),
                         ("/ops/releases/2026.11.26.1/changes/", "/ops/releases/2026.11.26.1/")]:
            r = self.client.get(old)
            self.assertEqual((r.status_code, r["Location"]), (301, new), old)


class PagesTests(FreshStorage, TestCase):
    @classmethod
    def setUpTestData(cls):
        import_content(small())
        cls.staff = User.objects.create_user("staff", password="x", is_staff=True)

    def setUp(self):
        super().setUp()
        cache.clear()  # release manifests are cached by version, and every test's first release has the same one
        self.now = timezone.now()
        self.tasks = seed(self.now)
        self.client.force_login(self.staff)

    def get(self, name, *args, **params):
        r = self.client.get(reverse(f"opsconsole:{name}", args=args), params)
        self.assertEqual(r.status_code, 200, name)
        return r

    def test_dashboard(self):
        r = self.get("dashboard")
        body = r.content.decode()
        problems = r.context["problems"]
        self.assertIn("problem", body)
        self.assertTrue(any("link_health failed 3 runs in a row" in p["text"] and p["level"] == "bad" for p in problems), problems)
        self.assertTrue(any("stuck lease" in p["text"] for p in problems))
        self.assertNotIn("SECRETKEY123", body, "secrets are masked")
        tl = {row["job"]: row for row in r.context["timeline"]["rows"]}
        self.assertIn("process", tl)
        self.assertTrue(all(0 <= b["left"] <= 100 for b in tl["process"]["runs"]))
        self.assertEqual(tl["link_health"]["failed"], 1, "one of its failed runs started in the last day")
        self.assertIn("running", {b["state"] for b in tl["gap_pointers"]["runs"]})
        attention = [(a["job"]["name"], a["run"].status) for a in r.context["attention"]]
        self.assertIn(("link_health", "failed"), attention)
        self.assertEqual([u["state"] for u in r.context["upcoming"]][:1], ["pending"], "a console run waiting for the worker comes first")
        q = {k["kind"]: k for k in r.context["queue"]}
        self.assertEqual((q["write_event"]["waiting"], q["write_event"]["in_progress"], q["write_event"]["stuck"]), (1, 0, 1))
        self.assertEqual((q["fill_gap"]["waiting"], q["fill_gap"]["in_progress"]), (1, 1))
        self.assertContains(r, Release.objects.get().version)
        self.assertContains(r, "Auto-refresh")
        self.assertContains(r, "location.reload()")

    def test_all_good(self):
        FetchRun.objects.filter(job="link_health").delete()
        AgentTask.objects.filter(status="claimed").delete()
        with mock.patch("opsconsole.queries.worker_holds_lock", return_value=True):
            r = self.get("dashboard")
        self.assertEqual(r.context["problems"], [])
        self.assertContains(r, "All good")

    def test_jobs(self):
        r = self.get("jobs")
        rows = {j["name"]: j for j in r.context["rows"]}
        self.assertEqual(rows["portal"]["tags"], ["collect"])
        self.assertEqual(rows["process"]["schedule"], "every 15 minutes")
        self.assertEqual(rows["link_health"]["schedule"], "every day")
        self.assertEqual((rows["portal"]["schedule"], rows["portal"]["schedule_note"]), ("every hour", "per feed · 1 of 1 on"))
        self.assertEqual(rows["year_pages"]["tags"], ["collect", "paused"])
        self.assertEqual(len(rows["process"]["history"]), 10)
        self.assertEqual([h["state"] for h in rows["link_health"]["history"]][-3:], ["failed"] * 3)
        self.assertContains(r, 'class="strip"')
        self.assertContains(r, reverse("opsconsole:run", args=[rows["process"]["history"][-1]["id"]]))
        self.assertEqual({j["name"] for j in self.get("jobs", tag="fact-check").context["rows"]}, {"link_health", "facts_sweep", "second_source"})
        self.assertEqual([j["name"] for j in self.get("jobs", tag="paused").context["rows"]], ["year_pages"])
        self.assertEqual(len(self.get("jobs", tag="nonsense").context["rows"]), len(rows), "an unknown tag shows every job")

    def test_every_job_has_known_tags(self):
        for j in jobs.REGISTRY.values():
            if j.name.startswith("test_"):
                continue
            self.assertTrue(j.tags, j.name)
            self.assertTrue(set(j.tags) <= set(jobs.TAGS), j.name)
            self.assertTrue(j.doc.endswith("."), (j.name, j.doc))
        with self.assertRaises(ValueError):
            jobs.job("bad", interval=60, tags="no-such-tag")

    def test_job_detail(self):
        r = self.get("job", "link_health")
        self.assertContains(r, "Re-checks cited URLs")
        self.assertContains(r, "not straight away")
        self.assertEqual(r.context["page"].paginator.count, FetchRun.objects.filter(job="link_health").count())
        r = self.get("job", "portal")
        self.assertEqual([f.name for f in r.context["feeds"]], ["Wikipedia Current events portal"])
        self.assertEqual(self.client.get(reverse("opsconsole:job", args=["no_such_job"])).status_code, 404)

    def test_runs(self):
        r = self.get("runs")
        self.assertNotContains(r, "SECRETKEY123")
        self.assertEqual(r.context["page"].paginator.count, FetchRun.objects.count())
        self.assertEqual(self.get("runs", job="link_health", state="failed").context["page"].paginator.count, 3)
        self.assertEqual(self.get("runs", state="completed").context["page"].paginator.count, FetchRun.objects.filter(status__in=["ok", "partial"]).count())
        self.assertEqual(self.get("runs", state="running").context["page"].paginator.count, 1)
        tagged = self.get("runs", tag="waves").context["page"]
        self.assertEqual(tagged.paginator.count, FetchRun.objects.filter(job__in=["gap_waves", "gap_pointers"]).count())
        pending = self.get("runs", state="pending")
        self.assertIsNone(pending.context["page"])
        self.assertEqual([a.target for a in pending.context["console_runs"]], ["job:facts_sweep"])
        self.assertEqual([a.target for a in self.get("runs", state="cancelled").context["console_runs"]], ["job:pageviews"])
        self.assertEqual([u["job"] for u in self.get("runs", state="paused").context["next_up"]], ["year_pages"])
        self.assertTrue(all(u["state"] == "scheduled" for u in self.get("runs", state="scheduled").context["next_up"]))

    def test_a_run_and_its_log(self):
        run = FetchRun.objects.filter(job="link_health", status="failed").order_by("-started_at").first()
        r = self.get("run", run.pk)
        body = r.content.decode()
        self.assertContains(r, "Failed:")
        self.assertContains(r, "Traceback (most recent call last)")
        self.assertNotIn("SECRETKEY123", body)
        self.assertIn('class="lv error"', body)
        self.assertIn("link_health started", body)
        self.assertEqual(r.context["counts"][0][0], "errors", "errors first in the counts")
        self.assertNotContains(r, "location.reload()", msg_prefix="a finished run's page doesn't reload")
        only = self.get("run", run.pk, level="warning")
        self.assertTrue(all(ln[1] in ("WARNING", "ERROR") for ln in only.context["lines"]))
        text = self.client.get(reverse("opsconsole:run", args=[run.pk]), {"format": "text"})
        self.assertEqual(text["Content-Type"], "text/plain; charset=utf-8")
        self.assertIn(b"link_health finished: failed", text.content)
        running = FetchRun.objects.get(status="running")
        r = self.get("run", running.pk)
        self.assertContains(r, "location.reload()")
        self.assertContains(r, "The log appears here")

    def test_work(self):
        r = self.get("work")
        q = {k["kind"]: k for k in r.context["queue"]}
        self.assertEqual(q["write_event"]["done_today"], 2)
        self.assertEqual([t.claimed_by for t in r.context["stuck"]], ["agent:writer-a"])
        self.assertEqual(r.context["wave"]["active"], "W1")
        self.assertEqual(r.context["wave"]["gaps"], 310)
        self.assertNotContains(r, "cluster_key", msg_prefix="no payloads on the Work page")
        r = self.get("work_kind", "write_event", tab="done")
        self.assertEqual(r.context["page"].paginator.count, 10)
        self.assertEqual(r.context["counts"]["stuck"], 1)
        self.assertContains(r, "A routine incident")
        self.assertEqual(self.get("work_kind", "write_event", tab="stuck").context["page"].paginator.count, 1)
        self.assertEqual(self.get("work_kind", "fill_gap", tab="in_progress").context["page"].paginator.count, 1)
        self.assertEqual(self.client.get(reverse("opsconsole:work_kind", args=["nope"])).status_code, 404)
        t = self.tasks[2]
        r = self.get("task", t.pk)
        self.assertContains(r, "<details>")
        self.assertContains(r, "seeded-event-0")
        self.assertGreater(r.context["revision_count"], 0)

    def test_releases_and_the_revision_diff(self):
        rel = Release.objects.get()
        r = self.get("releases")
        self.assertContains(r, "Live")
        self.assertEqual(r.context["pending_total"], Revision.objects.filter(id__gt=rel.revision_high_water).count())
        self.assertGreater(r.context["pending_total"], 0, "the seeded edits came after the release")
        self.assertIsNotNone(r.context["facts"]["corroborated"])
        r = self.get("release", rel.version)
        self.assertContains(r, f"Release {rel.version}")  # the change report, rendered
        raw = self.client.get(reverse("opsconsole:release", args=[rel.version]), {"raw": "1"})
        self.assertEqual(raw["Content-Type"], "text/markdown; charset=utf-8")
        r = self.get("unreleased")
        rev = Revision.objects.filter(actor="agent:writer-a", action="update", changed__contains=["text"]).first()
        self.assertIn(rev.pk, [v.pk for v in r.context["page"]])
        r = self.get("revision", rev.pk)
        self.assertContains(r, "<ins>")
        self.assertContains(r, "an agent added")
        self.assertGreaterEqual(len(r.context["history"]), 2, "the import and the edits")

    def test_page_only_releases_are_marked(self):
        first = Release.objects.get()
        second = Release.objects.create(version="2099.01.01.1", created_by="human:owner", content_hash=first.content_hash, page_hash="f" * 64,
                                        snapshot_path=first.snapshot_path, counts=first.counts, revision_high_water=first.revision_high_water)
        Release.objects.filter(pk=second.pk).update(created_at=first.created_at + timedelta(hours=1))
        with mock.patch("opsconsole.queries.manifest", return_value={"changes": {"added": 0, "changed": 0, "retracted": 0}}):
            rels = {x.version: x for x in self.get("releases").context["rels"]}
        self.assertTrue(rels["2099.01.01.1"].page_only)
        self.assertFalse(rels[first.version].page_only)

    def test_docs(self):
        r = self.get("docs")
        self.assertEqual([s["key"] for s in r.context["tree"]], ["manual", "guide", "adr"])
        r = self.get("doc", "guide", "architecture")
        self.assertContains(r, 'class="language-mermaid"')
        self.assertContains(r, "cdn.jsdelivr.net/npm/mermaid@11.4.1/")
        self.assertContains(r, reverse("opsconsole:doc", args=["guide", "operations"]), msg_prefix="links between chapters stay in the console")
        self.assertNotContains(self.get("doc", "guide", "glossary"), "mermaid@", msg_prefix="Mermaid loads only where a diagram is")
        self.assertContains(self.get("doc", "adr", "0028-operations-console"), "An operations console for staff")
        for section, slug in [("guide", "..%2F..%2Fconfig%2Fsettings"), ("nope", "readme"), ("guide", "no-such-chapter")]:
            self.assertEqual(self.client.get(f"/ops/docs/{section}/{slug}/").status_code, 404, slug)

    def test_reading_writes_nothing(self):
        def state():
            return (Revision.objects.count(), AgentTask.objects.count(), FetchRun.objects.count(), JobState.objects.count(),
                    OpsAction.objects.count(), RunLog.objects.count())

        before = state()
        for name in PAGES:
            self.get(name)
        self.get("run", FetchRun.objects.order_by("-id").first().pk)
        self.get("job", "process")
        self.get("work_kind", "write_event")
        self.assertEqual(before, state())


class DocsRenderingTests(TestCase):
    """The Docs page against a stand-in docs/ folder: the manual's stub, links, Mermaid, sanitizing."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix="ops-docs-"))
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)
        (self.root / "manual").mkdir()
        (self.root / "guide").mkdir()
        (self.root / "manual" / "01-start.md").write_text(
            "# Starting out\n\nSee [the console](../guide/operations-console.md#actions) and [code](../../opsconsole/views.py).\n\n"
            "## Draw it\n\n```mermaid\ngraph LR\n  A[job] --> B[run]\n```\n\n<script>alert(1)</script>\n\n"
            '<a href="javascript:alert(2)" onclick="x()">bad</a>\n\n| a | b |\n|---|---|\n| 1 | 2 |\n', encoding="utf-8")
        (self.root / "manual" / "README.md").write_text("# The manual\n\nRead me first: [publish](procedures/03-publish.md).\n", encoding="utf-8")
        (self.root / "manual" / "procedures").mkdir()
        (self.root / "manual" / "procedures" / "03-publish.md").write_text("# Publish a release\n\nSee [the start](../01-start.md).\n", encoding="utf-8")
        (self.root / "guide" / "operations-console.md").write_text(
            "---\ntitle: The operations console\nsummary: S.\norder: 5\ncovers:\n  - x\n---\n\n## Actions\n\nText.\n", encoding="utf-8")
        p = mock.patch.object(D, "DOCS_DIR", self.root)
        p.start()
        self.addCleanup(p.stop)
        D._render_file.cache_clear()
        staff_login(self)

    def test_rendered(self):
        self.assertEqual([d.slug for d in D.listing("manual")], ["readme", "01-start", "procedures/03-publish"], "a README first, a folder last")
        readme = self.client.get(reverse("opsconsole:doc", args=["manual", "readme"]))
        self.assertIn(reverse("opsconsole:doc", args=["manual", "procedures/03-publish"]), readme.context["rendered"].html)
        sub = self.client.get("/ops/docs/manual/procedures/03-publish/")
        self.assertEqual(sub.status_code, 200)
        self.assertIn(reverse("opsconsole:doc", args=["manual", "01-start"]), sub.context["rendered"].html, "links from one folder down")
        self.assertContains(sub, '<li class="sub">Procedures</li>')
        self.assertEqual(D.listing("guide")[0].title, "The operations console", "the front matter's title")
        r = self.client.get(reverse("opsconsole:doc", args=["manual", "01-start"]))
        self.assertEqual(r.status_code, 200)
        html = r.context["rendered"].html
        self.assertIn(reverse("opsconsole:doc", args=["guide", "operations-console"]) + "#actions", html)
        self.assertIn('<code title="opsconsole/views.py">code</code>', html)
        self.assertIn('<pre><code class="language-mermaid">', html)
        self.assertIn("<table>", html)
        self.assertNotIn("<script>alert", html)
        self.assertNotIn("javascript:", html)
        self.assertNotIn("onclick", html)
        self.assertEqual([t["name"] for t in r.context["rendered"].toc], ["Draw it"])
        self.assertContains(r, 'href="#draw-it"')
        self.assertContains(r, "mermaid.render")

    def test_the_real_manual(self):
        """docs/manual/ as it is: the README first, the top-level files, then procedures/ under its name; each renders."""
        real = Path(settings.BASE_DIR) / "docs"
        with mock.patch.object(D, "DOCS_DIR", real):
            docs = D.listing("manual")
            slugs = [d.slug for d in docs]
            top = sorted(p.stem.lower() for p in (real / "manual").glob("*.md"))
            procedures = sorted("procedures/" + p.stem for p in (real / "manual" / "procedures").glob("*.md"))
            self.assertEqual(slugs[0], "readme")
            self.assertEqual(sorted(slugs), sorted(top + procedures))
            self.assertEqual(slugs[len(top):], procedures)
            self.assertGreater(len(procedures), 0)
            self.assertEqual({d.group for d in docs[len(top):]}, {"Procedures"})
            r = self.client.get(reverse("opsconsole:docs"))
            self.assertNotContains(r, "Not written yet")
            for d in docs:
                self.assertEqual(self.client.get(reverse("opsconsole:doc", args=["manual", d.slug])).status_code, 200, d.slug)


def logging_job(ctx):
    """A test job that logs the way jobs do."""
    log = logging.getLogger("ingest.sources_test")
    log.info("fetched %d items with api_key=%s", 3, "SECRETKEY123")
    log.debug("not kept: below INFO")
    logging.getLogger("httpx").info("HTTP Request: GET https://x.example/?token=abc (noise, never kept)")
    log.warning("Authorization: Bearer abcdefghijklmnop and postgres://user:hunter2@db/x")
    ctx.log("a line the job printed")
    ctx.error("one item had no date")
    ctx.counts["items"] += 3


def chatty_job(ctx):
    """A test job that logs far more than the cap."""
    log = logging.getLogger("ingest.chatty")
    for i in range(runlog.MAX_LINES * 2):
        log.info("line %d %s", i, "x" * 60)


def failing_job(ctx):
    """A test job that raises."""
    logging.getLogger("ingest.failing").info("about to fail")
    raise RuntimeError("Boom: the source changed shape")


class RunLogTests(TestCase):
    def setUp(self):
        jobs._load_registry()
        for name, fn in [("test_logging", logging_job), ("test_chatty", chatty_job), ("test_failing", failing_job)]:
            jobs.REGISTRY[name] = jobs.Job(name, fn, 60, doc=fn.__doc__)
            self.addCleanup(jobs.REGISTRY.pop, name, None)
        self.out = []

    def run_job(self, name):
        return jobs.run_one(jobs.REGISTRY[name], log=self.out.append)

    def test_a_run_keeps_its_log_masked(self):
        run = self.run_job("test_logging")
        lines = RunLog.objects.get(run=run).lines
        text = "\n".join(" ".join(map(str, ln)) for ln in lines)
        self.assertEqual(lines[0][1:], ["INFO", "ingest.jobs", "test_logging started"])
        self.assertIn(["INFO", "ingest.sources_test", "fetched 3 items with api_key=***"], [ln[1:] for ln in lines])
        self.assertIn("Authorization: Bearer ***", text)
        self.assertIn("postgres://user:***@db/x", text)
        for secret in ("SECRETKEY123", "hunter2", "abcdefghijklmnop"):
            self.assertNotIn(secret, text)
        self.assertNotIn("below INFO", text)
        self.assertNotIn("noise, never kept", text, "httpx below WARNING is never kept")
        self.assertIn(["INFO", "job.test_logging", "a line the job printed"], [ln[1:] for ln in lines])
        self.assertIn(["ERROR", "job.test_logging", "one item had no date"], [ln[1:] for ln in lines])
        self.assertEqual(lines[-1][1], "WARNING", "a partial run finishes with a warning")
        self.assertIn("test_logging finished: partial", lines[-1][3])
        self.assertIn("a line the job printed", self.out, "what the job prints still reaches the runner's output")
        self.assertRegex(lines[0][0], r"^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}\+00:00$")
        self.assertFalse(any(isinstance(h, runlog.Capture) for h in logging.getLogger().handlers), "the handler is removed")

    def test_the_cap(self):
        run = self.run_job("test_chatty")
        log = RunLog.objects.get(run=run)
        self.assertLessEqual(len(log.lines), runlog.MAX_LINES + 1)
        self.assertLessEqual(log.bytes, runlog.MAX_BYTES)
        self.assertEqual(log.line_count, runlog.MAX_LINES * 2 + 2, "every line counted, kept or not")
        self.assertGreater(log.dropped, 0)
        self.assertTrue(any("lines left out" in ln[3] for ln in log.lines))
        self.assertIn("test_chatty finished: ok", log.lines[-1][3], "the end of the run is kept")
        self.assertEqual(log.lines[0][3], "test_chatty started", "and its start")

    def test_a_failure_keeps_the_traceback(self):
        run = self.run_job("test_failing")
        self.assertEqual(run.status, "failed")
        lines = RunLog.objects.get(run=run).lines
        errors = [ln[3] for ln in lines if ln[1] == "ERROR"]
        self.assertTrue(any("Boom: the source changed shape" in m and "Traceback" in m for m in errors), errors)
        self.assertIn("about to fail", [ln[3] for ln in lines])

    def test_a_long_line_is_cut(self):
        cap = runlog.Capture()
        cap.add("INFO", "y" * (runlog.MAX_LINE_CHARS * 2))
        self.assertEqual(len(cap.lines()[0][3]), runlog.MAX_LINE_CHARS)

    def test_other_threads_are_not_captured(self):
        import threading

        with runlog.capture(None) as cap:
            t = threading.Thread(target=lambda: logging.getLogger("ingest.other").warning("from another thread"))
            t.start()
            t.join()
            logging.getLogger("ingest.mine").warning("from the job's thread")
        self.assertEqual([ln[3] for ln in cap.lines()], ["from the job's thread"])

    def test_old_logs_are_pruned(self):
        old = self.run_job("test_logging")
        RunLog.objects.filter(run=old).update(created_at=timezone.now() - timedelta(days=runlog.KEEP_DAYS + 1))
        fresh = self.run_job("test_logging")
        self.assertEqual(runlog.prune(), 1)
        self.assertEqual(list(RunLog.objects.values_list("run_id", flat=True)), [fresh.pk])


class QueryCountTests(FreshStorage, TestCase):
    """Each page's queries are fixed in number: ten times the rows, the same count."""

    @classmethod
    def setUpTestData(cls):
        import_content(small())
        cls.staff = User.objects.create_user("staff", password="x", is_staff=True)

    def setUp(self):
        super().setUp()
        cache.clear()

    def count(self, name, *args, **params):
        self.client.force_login(self.staff)
        with CaptureQueriesContext(connection) as ctx:
            r = self.client.get(reverse(f"opsconsole:{name}", args=args), params)
        self.assertEqual(r.status_code, 200, name)
        return len(ctx.captured_queries)

    def details(self):
        run = FetchRun.objects.filter(job="link_health", status="failed").order_by("-started_at").first()
        return {"job:process": ("job", "process"), "job:portal": ("job", "portal"), "run": ("run", run.pk),
                "work_kind": ("work_kind", "write_event"), "release": ("release", Release.objects.order_by("id").first().version),
                "unreleased": ("unreleased",)}

    def test_bounded(self):
        seed(runs_per_job=3, publish_release=True)
        small_counts = {n: self.count(n) for n in PAGES}
        small_details = {k: self.count(v[0], *v[1:]) for k, v in self.details().items()}
        seed(runs_per_job=30, extra_tasks=120, publish_release=False)
        big_counts = {n: self.count(n) for n in PAGES}
        big_details = {k: self.count(v[0], *v[1:]) for k, v in self.details().items()}
        for n in PAGES:
            self.assertEqual(small_counts[n], big_counts[n], f"{n}: {small_counts[n]} queries, then {big_counts[n]} with more rows")
            self.assertLessEqual(big_counts[n], 25, n)
        for k in small_details:
            self.assertEqual(small_details[k], big_details[k], f"{k}: {small_details[k]} queries, then {big_details[k]}")
            self.assertLessEqual(big_details[k], 15, k)
        task = AgentTask.objects.order_by("id").first()
        self.assertLessEqual(self.count("task", task.pk), 10)
        rev = Revision.objects.order_by("-id").first()
        self.assertLessEqual(self.count("revision", rev.pk), 10)
