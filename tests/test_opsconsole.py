"""The operations console (/ops/, docs/adr/0028-operations-console.md): staff only, read-only, every page renders with
populated tables, and each page's query count stays fixed as the tables grow.

`seed()` fills a database with what the pages show (runs, tasks, Revisions, a release, waves state). It is also how a
local database is populated for a look at the pages:
    uv run python manage.py shell -c "from tests.test_opsconsole import seed; seed()"
"""

from datetime import timedelta

from django.contrib.auth.models import User
from django.core.cache import cache
from django.db import connection
from django.test import TestCase, override_settings
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from django.utils import timezone

from ingest.models import Candidate, Feed, FetchRun, JobState
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

PAGES = ["overview", "runs", "tasks", "changes", "releases", "programs"]


def seed(now=None, *, runs_per_job: int = 6, extra_tasks: int = 0, publish_release: bool = True, skip_gates=("build",)):
    """Runs, tasks, Revisions, a release and the waves' state, shaped like a working day's. Idempotent enough to run on
    a fresh database (or the test database); it never touches the archive's content beyond one audited edit."""
    now = now or timezone.now()
    from evidence.models import Publisher

    pub = Publisher.objects.order_by("id").first()
    feed = None
    if pub:
        feed, _ = Feed.objects.get_or_create(url="https://en.wikipedia.org/wiki/Portal:Current_events", defaults=dict(
            publisher=pub, name="Wikipedia Current events portal", kind="api", interval_minutes=60,
            config={"job": "portal"}, next_run_at=now + timedelta(minutes=20)))
    plain = {"process": 15, "enrich_tasks": 60, "gap_pointers": 60, "link_health": 1440, "facts_sweep": 1440, "gap_waves": 1440}
    for job, every in plain.items():
        for i in range(runs_per_job):
            t = now - timedelta(minutes=every * (runs_per_job - i))
            status, error = "ok", ""
            if job == "link_health" and i >= runs_per_job - 3:
                status, error = "failed", "FetchError: https://example.org/x?api_key=SECRETKEY123 timed out\nTraceback …"
            elif job == "enrich_tasks" and i == runs_per_job - 1:
                status, error = "partial", "openalex: HTTP 503 on one lookup"
            counts = {"process": {"candidates": 412 + i, "clusters": 120, "clusters_over_threshold": 9, "tasks_created": 2},
                      "gap_waves": {"queued": 4, "W1.gaps": 310}}.get(job, {"checked": 50 + i})
            if error:
                counts = {**counts, "errors": 1}
            FetchRun.objects.create(job=job, started_at=t, finished_at=t + timedelta(seconds=3 + 7 * i), status=status, counts=counts, error=error)
    if feed:
        for i in range(runs_per_job):
            t = now - timedelta(hours=runs_per_job - i)
            FetchRun.objects.create(job="portal", feed=feed, started_at=t, finished_at=t + timedelta(seconds=20), status="ok",
                                    counts={"fetched": 3, "new": i, "requests": 4})

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
    for i, status in enumerate(["queued", "queued", "rejected", "accepted"]):
        Candidate.objects.get_or_create(source_key=f"seed:{i}", defaults=dict(title=f"Seeded story {i}", status=status, cluster_key=f"c{i % 2}", created_by="job:portal"))
    JobState.objects.update_or_create(name="gap_waves", defaults={"state": {
        "active": "W1", "history": [],
        "last_run": {"at": now.isoformat(timespec="seconds"), "gaps": {"W1": 310}, "gaps_by_kind": {"W1": {"empty": 300, "sparse": 10}},
                     "coverage": {"W1": {"share_covered": 0.84, "pairs": 2085, "empty": 300, "sparse": 10}},
                     "counts": {"W1.held_cap": 270, "W1.held_branch": 30, "W1.recent_written": 3, "queued": 4}, "per_day": 40}}})
    if publish_release:
        publish(actor="job:seed", skip_gates=tuple(skip_gates))
    return created


class AccessTests(FreshStorage, TestCase):
    def test_anonymous_is_sent_to_the_admin_login(self):
        for name in PAGES:
            r = self.client.get(reverse(f"opsconsole:{name}"))
            self.assertEqual(r.status_code, 302, name)
            self.assertIn("/admin/login/", r["Location"])

    def test_non_staff_is_refused(self):
        User.objects.create_user("reader", password="x")
        self.client.login(username="reader", password="x")
        for name in PAGES:
            r = self.client.get(reverse(f"opsconsole:{name}"))
            self.assertIn(r.status_code, (302, 403), name)
            self.assertNotIn(b"Operations", r.content)

    def test_staff_get_pages_marked_noindex_and_uncached(self):
        User.objects.create_user("staff", password="x", is_staff=True)
        self.client.login(username="staff", password="x")
        r = self.client.get(reverse("opsconsole:overview"))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r["X-Robots-Tag"], "noindex, nofollow")
        self.assertIn("no-store", r["Cache-Control"])
        self.assertContains(r, '<meta name="robots" content="noindex, nofollow">', html=False)

    def test_read_only(self):
        User.objects.create_user("staff", password="x", is_staff=True)
        self.client.login(username="staff", password="x")
        self.assertEqual(self.client.post(reverse("opsconsole:overview")).status_code, 405)

    @override_settings(OPS_HOSTS=["data.example.org"])
    def test_other_hosts_have_no_console(self):
        User.objects.create_user("staff", password="x", is_staff=True)
        self.client.login(username="staff", password="x")
        with self.settings(ALLOWED_HOSTS=["data.example.org", "example.org"]):
            self.assertEqual(self.client.get("/ops/", HTTP_HOST="example.org").status_code, 404)
            self.assertEqual(self.client.get("/ops/", HTTP_HOST="data.example.org").status_code, 200)

    def test_admin_header_links_to_the_console(self):
        User.objects.create_user("staff", password="x", is_staff=True, is_superuser=True)
        self.client.login(username="staff", password="x")
        r = self.client.get("/admin/")
        self.assertContains(r, 'href="/ops/"')


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

    def test_overview(self):
        r = self.get("overview")
        self.assertContains(r, "link_health")
        body = r.content.decode()
        self.assertIn("at threshold", body, "three failures in a row is the alert threshold")
        self.assertNotIn("SECRETKEY123", body, "secrets are masked")
        self.assertContains(r, "kind=write_event&status=stale")
        self.assertContains(r, "/ 20", msg_prefix="write_event tasks against WRITE_EVENT_TASKS_PER_DAY")
        self.assertContains(r, Release.objects.get().version)

    def test_runs(self):
        r = self.get("runs")
        self.assertContains(r, "<svg class=\"spark\"", count=None)
        self.assertNotContains(r, "SECRETKEY123")
        r = self.get("runs", job="link_health", status="failed")
        self.assertEqual(r.context["page"].paginator.count, 3)
        r = self.get("runs", since=(self.now - timedelta(days=400)).date().isoformat(), until=self.now.date().isoformat())
        self.assertGreater(r.context["page"].paginator.count, 0)

    def test_tasks(self):
        r = self.get("tasks")
        self.assertContains(r, "lease expired")
        self.assertContains(r, "agent:writer-a")
        rows = {row["agent"]: row for row in r.context["throughput"]["rows"]}
        self.assertEqual(rows["agent:writer-a"]["total"], 5)
        self.assertAlmostEqual(rows["agent:writer-a"]["mean_minutes"], 14, delta=0.1)
        self.assertEqual(self.get("tasks", status="stale").context["page"].paginator.count, 1)
        self.assertEqual(self.get("tasks", kind="fill_gap", agent="agent:gaps-a").context["page"].paginator.count, 5)
        t = self.tasks[2]
        r = self.get("task", t.pk)
        self.assertContains(r, "<details>")
        self.assertContains(r, "seeded-event-0")
        self.assertEqual(r.context["revision_count"], Revision.objects.filter(task_id=t.pk).count())
        self.assertGreater(r.context["revision_count"], 0)

    def test_changes_and_a_revision(self):
        r = self.get("changes")
        batches = {b["batch"] for b in r.context["batches"]}
        self.assertIn("apply_edits round-3", batches)
        self.assertIn("write_event", batches)
        self.assertEqual(self.get("changes", actor_kind="human").context["page"].paginator.count,
                         Revision.objects.filter(actor_kind="human").count())
        self.assertGreater(self.get("changes", reason="apply_edits round-3").context["page"].paginator.count, 0)
        rev = Revision.objects.filter(actor="agent:writer-a", action="update", changed__contains=["text"]).first()
        r = self.get("revision", rev.pk)
        self.assertContains(r, "<ins>")
        self.assertContains(r, "an agent added")
        self.assertGreaterEqual(len(r.context["history"]), 2, "the import and the edits")

    def test_releases(self):
        rel = Release.objects.get()
        r = self.get("releases")
        self.assertContains(r, "live")
        self.assertContains(r, rel.content_hash[:12])
        r = self.get("release_changes", rel.version)
        self.assertContains(r, f"# Release {rel.version}")
        raw = self.client.get(reverse("opsconsole:release_changes", args=[rel.version]), {"raw": "1"})
        self.assertEqual(raw["Content-Type"], "text/markdown; charset=utf-8")

    def test_programs(self):
        r = self.get("programs")
        w1 = next(w for w in r.context["waves"]["rows"] if w["name"] == "W1")
        self.assertEqual((w1["gaps"], w1["queued"], w1["done_written"], w1["done_nothing"], w1["held_cap"]), (310, 1, 3, 2, 270))
        self.assertTrue(w1["active"])
        p = r.context["pipeline"]
        self.assertEqual((p["tasks"]["done_written"], p["tasks"]["done_rejected"]), (5, 5))
        self.assertEqual(p["open_clusters"], 2)
        self.assertGreater(r.context["facts"]["total"], 0)
        self.assertFalse(JobState.objects.filter(name="gap_waves_probe").exists())

    def test_reading_writes_nothing(self):
        before = (Revision.objects.count(), AgentTask.objects.count(), FetchRun.objects.count(), JobState.objects.count())
        for name in PAGES:
            self.get(name)
        self.assertEqual(before, (Revision.objects.count(), AgentTask.objects.count(), FetchRun.objects.count(), JobState.objects.count()))


class QueryCountTests(FreshStorage, TestCase):
    """Each page's queries are fixed in number: ten times the rows, the same count."""

    @classmethod
    def setUpTestData(cls):
        import_content(small())
        cls.staff = User.objects.create_user("staff", password="x", is_staff=True)

    def setUp(self):
        super().setUp()
        cache.clear()

    def count(self, name, *args):
        self.client.force_login(self.staff)
        with CaptureQueriesContext(connection) as ctx:
            r = self.client.get(reverse(f"opsconsole:{name}", args=args))
        self.assertEqual(r.status_code, 200)
        return len(ctx.captured_queries)

    def test_bounded(self):
        seed(runs_per_job=3, publish_release=True)
        small_counts = {n: self.count(n) for n in PAGES}
        seed(runs_per_job=30, extra_tasks=120, publish_release=False)
        big_counts = {n: self.count(n) for n in PAGES}
        for n in PAGES:
            self.assertEqual(small_counts[n], big_counts[n], f"{n}: {small_counts[n]} queries, then {big_counts[n]} with more rows")
            self.assertLessEqual(big_counts[n], 25, n)
        task = AgentTask.objects.order_by("id").first()
        self.assertLessEqual(self.count("task", task.pk), 10)
        rev = Revision.objects.order_by("-id").first()
        self.assertLessEqual(self.count("revision", rev.pk), 10)
