"""The console's actions (/ops/act/…, docs/adr/0028-operations-console.md, phase 2): who may act, the CSRF check, the
two steps, idempotency keys, the rate limit, each action's effect (the worker's through `opsconsole.worker.pick_up`
and the worker loop), refusals, the audit rows, and the Revisions a job run from here leaves."""

import re
from datetime import timedelta
from unittest import mock

from django.contrib.auth.models import Permission, User
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from ingest import jobs
from ingest.models import FetchRun, JobState
from opsconsole import actions as acts
from opsconsole import worker
from opsconsole.models import OpsAction
from publish import gates
from publish.legacy import import_content
from publish.models import Release
from revisions import revising
from revisions.models import Revision
from timeline import services
from timeline.models import Event
from work.models import AgentTask

from .fixtures import small
from .runner import FreshStorage

TOKEN = re.compile(r'name="token" value="([^"]+)"')


def fake_node_build(body, built):
    """The build gate without Node: the page is a stand-in, the read-back exact."""
    return gates.Build(True, [], b"<html>built</html>", body)


def write_job(ctx):
    """A test job that writes content the way jobs do: as job:<name>, through the services."""
    ev = Event.objects.order_by("id").first()
    with revising(ctx.actor, reason="test job"):
        services.save_event(ev.slug, text=ev.text + " (a job's edit)")
    ctx.counts["edited"] += 1


class ActionsBase(FreshStorage, TestCase):
    @classmethod
    def setUpTestData(cls):
        import_content(small())
        cls.staff = User.objects.create_user("viewer", password="x", is_staff=True)
        cls.op = User.objects.create_user("op", password="x", is_staff=True)
        cls.op.user_permissions.add(Permission.objects.get(codename="ops_operator", content_type__app_label="opsconsole"))

    def setUp(self):
        super().setUp()
        jobs._load_registry()
        jobs.REGISTRY["test_write"] = jobs.Job("test_write", write_job, 60, doc="A test job that edits one event.")
        self.addCleanup(jobs.REGISTRY.pop, "test_write", None)
        self.client.force_login(self.op)
        self.logs = []

    def act(self, kind, /, **data):
        return self.client.post(reverse("opsconsole:act", args=[kind]), data)

    def token(self, response) -> str:
        self.assertEqual(response.status_code, 200, response.content[:2000])
        return TOKEN.search(response.content.decode()).group(1)

    def confirm(self, kind, token, reason="testing the console", **extra):
        return self.client.post(reverse("opsconsole:confirm", args=[kind]), {"token": token, "reason": reason, **extra})

    def do(self, kind, /, reason="testing the console", extra=None, **data) -> OpsAction:
        """Both steps; → the OpsAction."""
        r = self.confirm(kind, self.token(self.act(kind, **data)), reason=reason, **(extra or {}))
        self.assertEqual(r.status_code, 303, r.content[:2000])
        return OpsAction.objects.get(pk=int(r["Location"].rstrip("/").split("/")[-1]))

    def pick_up(self):
        return worker.pick_up(log=self.logs.append)

    def task(self, status="queued", **kw):
        return AgentTask.objects.create(kind=kw.pop("kind", "verify_claim"), status=status, created_by="job:facts_sweep", **kw)


class GatingTests(ActionsBase):
    def test_staff_without_the_permission_see_no_buttons_and_get_403(self):
        self.client.force_login(self.staff)
        for name in ("dashboard", "jobs", "runs", "work", "releases"):
            r = self.client.get(reverse(f"opsconsole:{name}"))
            self.assertEqual(r.status_code, 200)
            self.assertNotIn(b"/ops/act/", r.content, name)
            self.assertIn(b"Read-only", r.content)
        self.assertEqual(self.act("pause_job", job="process").status_code, 403)
        self.assertEqual(self.confirm("pause_job", "anything").status_code, 403)
        self.assertEqual(self.client.post(reverse("opsconsole:action_cancel", args=[1])).status_code, 403)
        self.assertFalse(OpsAction.objects.exists())
        self.assertEqual(self.client.get(reverse("opsconsole:actions")).status_code, 200, "the audit is readable by staff")

    def test_operators_see_the_buttons(self):
        r = self.client.get(reverse("opsconsole:jobs"))
        self.assertIn(b"/ops/act/run_job/", r.content)
        self.assertIn(b"/ops/act/pause_job/", r.content)
        self.assertIn(b"Operator (op)", r.content)
        self.assertIn(b"/ops/act/publish_check/", self.client.get(reverse("opsconsole:releases")).content)

    def test_work_kind_tabs_with_tasks_render_their_batch_buttons(self):
        # Regression: the batch buttons pass the task kind as `kind=…`, which used to collide with the `act` tag's own
        # first parameter and made every Work card with waiting, stuck or failed tasks answer 500 for operators.
        from datetime import timedelta
        from django.utils import timezone
        for status in ("queued", "failed", "cancelled"):
            self.task(status=status, kind="write_event")
        self.task(status="claimed", kind="write_event", claimed_by="agent:writer-a", claimed_at=timezone.now() - timedelta(hours=3),
                  lease_until=timezone.now() - timedelta(hours=2))
        for tab, label in (("waiting", "Cancel these"), ("stuck", "Cancel these"), ("failed", "Requeue these"), ("cancelled", "Requeue these")):
            r = self.client.get(reverse("opsconsole:work_kind", args=["write_event"]), {"tab": tab})
            self.assertEqual(r.status_code, 200, (tab, r.content[:500]))
            self.assertContains(r, label)
            self.assertContains(r, 'name="kind" value="write_event"')

    def test_superusers_have_it_implicitly(self):
        boss = User.objects.create_superuser("boss", password="x")
        self.client.force_login(boss)
        self.assertEqual(self.act("pause_job", job="process").status_code, 200)

    def test_anonymous_is_sent_to_login_and_get_is_refused(self):
        self.client.logout()
        r = self.act("pause_job", job="process")
        self.assertEqual(r.status_code, 302)
        self.assertIn("/admin/login/", r["Location"])
        self.client.force_login(self.op)
        self.assertEqual(self.client.get(reverse("opsconsole:act", args=["pause_job"])).status_code, 405)

    def test_csrf_is_checked(self):
        c = Client(enforce_csrf_checks=True)
        c.force_login(self.op)
        self.assertEqual(c.post(reverse("opsconsole:act", args=["pause_job"]), {"job": "process"}).status_code, 403)
        page = c.get(reverse("opsconsole:jobs"))
        csrf = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', page.content.decode()).group(1)
        r = c.post(reverse("opsconsole:act", args=["pause_job"]), {"job": "process", "csrfmiddlewaretoken": csrf})
        self.assertEqual(r.status_code, 200)


class FlowTests(ActionsBase):
    def test_the_first_step_only_shows_what_will_happen(self):
        r = self.act("pause_job", job="process")
        self.assertContains(r, "Confirm: Pause process")
        self.assertContains(r, "the scheduler skips it until it is resumed")
        self.assertFalse(OpsAction.objects.exists())
        self.assertEqual(jobs.paused_jobs(), {})

    def test_a_reason_is_required(self):
        token = self.token(self.act("pause_job", job="process"))
        r = self.confirm("pause_job", token, reason="  ")
        self.assertEqual(r.status_code, 400)
        self.assertContains(r, "Say why", status_code=400)
        self.assertFalse(OpsAction.objects.exists())

    def test_idempotency_key_acts_once(self):
        token = self.token(self.act("pause_job", job="process"))
        r1 = self.confirm("pause_job", token)
        r2 = self.confirm("pause_job", token)
        self.assertEqual(r1.status_code, 303)
        self.assertEqual(r2.status_code, 302)
        self.assertEqual(r1["Location"], r2["Location"])
        self.assertEqual(OpsAction.objects.count(), 1)
        # Each confirmation page mints its own key.
        self.assertNotEqual(self.token(self.act("resume_job", job="process")), token)

    def test_a_token_is_bound_to_its_action_and_user(self):
        token = self.token(self.act("pause_job", job="process"))
        self.assertEqual(self.confirm("resume_job", token).status_code, 403)
        self.assertEqual(self.confirm("pause_job", token[:-3] + "xyz").status_code, 400)
        other = User.objects.create_superuser("other", password="x")
        self.client.force_login(other)
        self.assertEqual(self.confirm("pause_job", token).status_code, 403)
        self.assertFalse(OpsAction.objects.exists())

    def test_rate_limit(self):
        for i in range(acts.RATE_LIMIT):
            OpsAction.objects.create(kind="pause_job", target="job:x", reason="r", requested_by="human:op", idempotency_key=f"k{i}", runs_in="request", status="done")
        r = self.confirm("pause_job", self.token(self.act("pause_job", job="process")))
        self.assertEqual(r.status_code, 429)
        self.assertEqual(OpsAction.objects.count(), acts.RATE_LIMIT)
        OpsAction.objects.update(created_at=timezone.now() - timedelta(minutes=acts.RATE_WINDOW_MINUTES + 1))
        self.assertEqual(self.confirm("pause_job", self.token(self.act("pause_job", job="process"))).status_code, 303)

    def test_the_audit_row(self):
        a = self.do("pause_job", reason="the source is down for maintenance", job="process")
        self.assertEqual((a.kind, a.target, a.status, a.requested_by, a.runs_in), ("pause_job", "job:process", "done", "human:op", "request"))
        self.assertEqual(a.reason, "the source is down for maintenance")
        self.assertIn("the scheduler skips it", a.check_output)
        self.assertEqual(len(a.idempotency_key), 32)
        self.assertIsNotNone(a.finished_at)
        r = self.client.get(reverse("opsconsole:action", args=[a.pk]))
        self.assertContains(r, "the source is down for maintenance")
        self.assertContains(self.client.get(reverse("opsconsole:actions")), "job:process")


class QuickActionTests(ActionsBase):
    def test_pause_and_resume(self):
        before = Revision.objects.count()
        self.do("pause_job", reason="feed is broken", job="test_write")
        self.assertEqual(jobs.paused_jobs()["test_write"]["by"], "human:op")
        self.assertFalse(jobs.is_due(jobs.REGISTRY["test_write"], timezone.now()))
        self.assertEqual(jobs.run_due(only=["test_write"], log=self.logs.append), [])
        self.assertFalse(FetchRun.objects.filter(job="test_write").exists())
        r = self.client.get(reverse("opsconsole:job", args=["test_write"]))
        self.assertContains(r, "Paused by human:op")
        self.assertContains(r, "feed is broken")
        self.assertContains(r, "/ops/act/resume_job/")
        self.assertContains(self.client.get(reverse("opsconsole:jobs"), {"tag": "paused"}), "test_write")
        self.assertEqual(self.act("run_job", job="test_write").status_code, 409, "a paused job is not run from here")
        self.do("resume_job", job="test_write")
        self.assertEqual(jobs.paused_jobs(), {})
        self.assertEqual(len(jobs.run_due(only=["test_write"], log=self.logs.append)), 1)
        self.assertEqual(Revision.objects.filter(actor__startswith="human:").count(), 0)
        self.assertGreater(Revision.objects.count(), before, "the job's own edit")

    def test_release_and_extend_a_stuck_lease(self):
        now = timezone.now()
        t = self.task("claimed", claimed_by="agent:stuck", claimed_at=now - timedelta(hours=2), lease_until=now - timedelta(minutes=30), attempts=1)
        r = self.act("release_lease", task=t.pk, holder="agent:stuck")
        self.assertContains(r, "expired")
        self.confirm("release_lease", self.token(r))
        t.refresh_from_db()
        self.assertEqual((t.status, t.claimed_by, t.lease_until, t.attempts), ("queued", "", None, 1))
        self.assertIn("human:op: released the lease held by agent:stuck: testing the console", t.error)

        t.status, t.claimed_by, t.lease_until = "claimed", "agent:slow", now + timedelta(minutes=5)
        t.save()
        a = self.do("extend_lease", task=t.pk, holder="agent:slow", minutes=90)
        t.refresh_from_db()
        self.assertEqual(a.status, "done")
        self.assertGreater(t.lease_until, now + timedelta(minutes=90))

    def test_a_lease_that_changed_hands_is_refused(self):
        now = timezone.now()
        t = self.task("claimed", claimed_by="agent:a", claimed_at=now, lease_until=now - timedelta(minutes=1))
        self.assertEqual(self.act("release_lease", task=t.pk, holder="agent:b").status_code, 409)
        token = self.token(self.act("release_lease", task=t.pk, holder="agent:a"))
        AgentTask.objects.filter(pk=t.pk).update(claimed_by="agent:c", lease_until=now + timedelta(hours=1))
        self.confirm("release_lease", token)
        a = OpsAction.objects.get()
        self.assertEqual(a.status, "failed")
        self.assertIn("no longer the lease held by agent:a", a.error)
        t.refresh_from_db()
        self.assertEqual(t.claimed_by, "agent:c")

    def test_requeue_and_cancel_one(self):
        failed = self.task("failed", attempts=3, error="agent:x: gave up")
        a = self.do("requeue_tasks", task=failed.pk)
        failed.refresh_from_db()
        self.assertEqual((failed.status, failed.attempts), ("queued", 0))
        self.assertEqual(a.result["done"], [failed.pk])
        self.do("cancel_tasks", task=failed.pk)
        failed.refresh_from_db()
        self.assertEqual(failed.status, "cancelled")
        self.assertIn("human:op: cancelled (was queued): testing the console", failed.error)

    def test_a_live_lease_is_not_cancelled(self):
        t = self.task("claimed", claimed_by="agent:a", claimed_at=timezone.now(), lease_until=timezone.now() + timedelta(hours=1))
        r = self.act("cancel_tasks", task=t.pk)
        self.assertEqual(r.status_code, 409)
        self.assertContains(r, "can be cancel", status_code=409)

    def test_a_filtered_batch_shows_its_count_and_stops_at_the_cap(self):
        for i in range(acts.MAX_TASKS + 10):
            self.task("failed", priority=i, dedupe_key=f"claim:{i}")
        self.task("failed", kind="write_event")
        self.assertEqual(self.act("requeue_tasks").status_code, 409, "a batch needs a filter")
        r = self.act("requeue_tasks", kind="verify_claim", status="failed")
        self.assertContains(r, f"{acts.MAX_TASKS + 10}: this acts on the first {acts.MAX_TASKS}")
        a = self.do("requeue_tasks", kind="verify_claim", status="failed")
        self.assertEqual(len(a.result["done"]), acts.MAX_TASKS)
        self.assertEqual(AgentTask.objects.filter(kind="verify_claim", status="queued").count(), acts.MAX_TASKS)
        self.assertEqual(set(AgentTask.objects.filter(status="queued").values_list("priority", flat=True)), set(range(10, acts.MAX_TASKS + 10)),
                         "the highest priority first, as the preview listed")
        self.assertEqual(AgentTask.objects.filter(kind="write_event", status="failed").count(), 1)

    def test_advance_wave(self):
        r = self.act("advance_wave")
        self.assertContains(r, "Make W2 the active wave (from W1)")
        self.assertContains(r, "gap_waves would queue")
        self.assertFalse(JobState.objects.filter(name="gap_waves").exists() and JobState.objects.get(name="gap_waves").state.get("active") == "W2")
        a = self.do("advance_wave", reason="W1 is as full as it gets")
        st = JobState.objects.get(name="gap_waves").state
        self.assertEqual((a.status, st["active"]), ("done", "W2"))
        self.assertEqual(st["history"][-1]["by"], "human:op")
        self.assertEqual(st["history"][-1]["reason"], "W1 is as full as it gets")


class WorkerActionTests(ActionsBase):
    def test_run_a_job_in_the_worker(self):
        a = self.do("run_job", job="test_write")
        self.assertEqual((a.status, a.runs_in), ("pending", "worker"))
        self.assertFalse(FetchRun.objects.filter(job="test_write").exists(), "nothing runs in the request")
        r = self.client.get(reverse("opsconsole:action", args=[a.pk]))
        self.assertContains(r, 'http-equiv="refresh"')
        self.assertContains(r, "Waiting for the worker")
        self.assertEqual(self.act("run_job", job="test_write").status_code, 409, "one queued run of a job at a time")
        self.assertEqual([x.pk for x in self.pick_up()], [a.pk])
        a.refresh_from_db()
        self.assertEqual(a.status, "done", a.error)
        run = FetchRun.objects.get(job="test_write")
        self.assertEqual(a.result["runs"][0]["id"], run.pk)
        self.assertEqual(a.result["revisions"], 1)
        rev = Revision.objects.order_by("-id").first()
        self.assertEqual((rev.actor, rev.reason), ("job:test_write", "test job"))
        self.assertIn("test_write: ok", a.output)
        self.assertNotContains(self.client.get(reverse("opsconsole:action", args=[a.pk])), 'http-equiv="refresh"')
        self.assertEqual(self.pick_up(), [])

    def test_the_worker_loop_picks_actions_up(self):
        a = self.do("run_job", job="test_write")
        jobs.loop(tick=1, log=self.logs.append, max_ticks=1, sleep=lambda s: None, only=["no_such_job"])
        a.refresh_from_db()
        self.assertEqual(a.status, "done", a.error)

    def test_non_idempotent_jobs_are_refused_within_their_cooldown(self):
        for name in ("link_health", "second_source"):
            FetchRun.objects.create(job=name, started_at=timezone.now() - timedelta(hours=2), finished_at=timezone.now(), status="ok")
            r = self.act("run_job", job=name)
            self.assertEqual(r.status_code, 409, name)
            self.assertContains(r, "is not idempotent back to back", status_code=409)
        FetchRun.objects.filter(job="link_health").update(started_at=timezone.now() - timedelta(days=2))
        r = self.act("run_job", job="link_health")
        self.assertContains(r, "Idempotent")
        self.assertContains(r, "no: each run is a round")

    def test_retry_a_failed_run(self):
        failed = FetchRun.objects.create(job="test_write", started_at=timezone.now() - timedelta(minutes=5), finished_at=timezone.now(), status="failed", error="Boom: it broke")
        r = self.act("retry_run", run=failed.pk)
        self.assertContains(r, "Boom: it broke")
        a = self.confirm("retry_run", self.token(r))
        self.pick_up()
        a = OpsAction.objects.get()
        self.assertEqual((a.kind, a.status, a.params["run"]), ("retry_run", "done", failed.pk))
        self.assertEqual(FetchRun.objects.filter(job="test_write", status="ok").count(), 1)
        self.assertEqual(self.act("retry_run", run=failed.pk).status_code, 409, "a later run succeeded")

    def test_a_failing_job_fails_the_action(self):
        jobs.REGISTRY["test_write"] = jobs.Job("test_write", lambda ctx: 1 / 0, 60)
        self.do("run_job", job="test_write")
        self.pick_up()
        a = OpsAction.objects.get()
        self.assertEqual(a.status, "failed")
        self.assertIn("ZeroDivisionError", a.error)

    def test_withdraw_a_pending_action(self):
        a = self.do("run_job", job="test_write")
        self.client.post(reverse("opsconsole:action_cancel", args=[a.pk]))
        a.refresh_from_db()
        self.assertEqual(a.status, "cancelled")
        self.assertEqual(self.pick_up(), [])
        self.assertFalse(FetchRun.objects.filter(job="test_write").exists())

    def test_an_interrupted_action_is_closed(self):
        a = self.do("run_job", job="test_write")
        OpsAction.objects.filter(pk=a.pk).update(status="running")
        self.pick_up()
        a.refresh_from_db()
        self.assertEqual(a.status, "failed")
        self.assertIn("interrupted", a.error)


@mock.patch("publish.gates.node_build", fake_node_build)
class PublishActionTests(ActionsBase):
    def check(self) -> OpsAction:
        r = self.act("publish_check")
        self.assertEqual(r.status_code, 303)
        self.pick_up()
        a = OpsAction.objects.filter(kind="publish_check").latest("id")
        self.assertEqual(a.status, "done", a.error)
        return a

    def test_check_then_publish(self):
        check = self.check()
        self.assertEqual(Release.objects.count(), 0, "a check writes nothing")
        self.assertIn("7 added", check.output)
        self.assertEqual(check.result["summary"], "the first release")
        page = self.client.get(reverse("opsconsole:action", args=[check.pk]))
        self.assertContains(page, "Publish this")
        self.assertContains(page, "Force: page-only change")
        r = self.confirm("publish", self.token(page), reason="first release from the console", notes="console test", force="")
        self.assertEqual(r.status_code, 303)
        pub = OpsAction.objects.get(kind="publish")
        self.assertEqual((pub.status, pub.params["check"]), ("pending", check.pk))
        self.assertIn("7 added", pub.check_output)
        self.assertEqual(Release.objects.count(), 0, "publishing runs in the worker")
        self.pick_up()
        pub.refresh_from_db()
        self.assertEqual(pub.status, "done", pub.error)
        rel = Release.objects.get()
        self.assertEqual((rel.created_by, rel.notes, pub.result["version"]), ("human:op", "console test", rel.version))
        from infra import storage

        self.assertEqual(storage.read_pointer()["updated_by"], "human:op")
        # The check was used; a second publish from it is refused.
        self.assertContains(self.client.get(reverse("opsconsole:action", args=[check.pk])), "has already been used")

    def test_content_changed_since_the_check_refuses(self):
        check = self.check()
        token = self.token(self.client.get(reverse("opsconsole:action", args=[check.pk])))
        ev = Event.objects.filter(status="published").first()
        with revising("human:owner", reason="an edit after the check"):
            services.save_event(ev.slug, title=ev.title + " (edited)")
        self.confirm("publish", token)
        self.pick_up()
        pub = OpsAction.objects.get(kind="publish")
        self.assertEqual(pub.status, "failed")
        self.assertIn("the content changed since check", pub.error)
        self.assertEqual(Release.objects.count(), 0)

    def test_rollback(self):
        from infra import storage
        from publish.release import publish

        r1, _ = publish(actor="job:test", skip_gates=("build",))
        ev = Event.objects.filter(status="published").first()
        with revising("human:owner", reason="a change"):
            services.save_event(ev.slug, title=ev.title + " (edited)")
        r2, _ = publish(actor="job:test", skip_gates=("build",))
        self.assertEqual(self.act("rollback", version=r2.version).status_code, 409, "already live")
        r = self.act("rollback", version=r1.version)
        self.assertContains(r, "Live now")
        self.assertContains(r, "snapshot hash verified")
        a = self.confirm("rollback", self.token(r), reason="the edit was wrong")
        # One publish or rollback at a time.
        self.assertEqual(self.act("rollback", version=r1.version).status_code, 409)
        self.pick_up()
        a = OpsAction.objects.get(kind="rollback")
        self.assertEqual(a.status, "done", a.error)
        p = storage.read_pointer()
        self.assertEqual((p["version"], p["updated_by"], p["reason"]), (r1.version, "human:op", "rollback"))


class NeedsAttentionTests(ActionsBase):
    """A failed run in the Dashboard's Needs attention (ADR 0039): it follows its retry (Retry queued, Retrying, gone
    when the retry completes, replaced when it fails), and an operator may dismiss it, with the same steps and audit
    as every action; /healthz and the problems line agree with the card."""

    def failed(self, minutes_ago=5, **kw):
        t = timezone.now() - timedelta(minutes=minutes_ago)
        return FetchRun.objects.create(job="test_write", started_at=t, finished_at=t + timedelta(seconds=3), status="failed", error="Boom: it broke", **kw)

    def dashboard(self):
        with mock.patch("opsconsole.queries.worker_holds_lock", return_value=True):
            return self.client.get(reverse("opsconsole:dashboard"))

    def attention(self, r=None):
        r = r or self.dashboard()
        return [(a["run"].pk, (a["recovery"] or {}).get("state")) for a in r.context["attention"] if a["job"]["name"] == "test_write"]

    def problem(self, r) -> str:
        return next((p["text"] for p in r.context["problems"] if p["text"].startswith("test_write")), "")

    def health(self) -> dict:
        body = self.client.get("/healthz").json()
        return body["jobs"]["test_write"] | {"listed": [k for k in ("failing_jobs", "dismissed_jobs") if "test_write" in body[k]]}

    def test_a_retried_run_shows_its_retry_then_leaves(self):
        run = self.failed()
        r = self.dashboard()
        self.assertEqual(self.attention(r), [(run.pk, None)])
        self.assertContains(r, "/ops/act/retry_run/")
        self.assertContains(r, "/ops/act/dismiss_run/")
        a = self.do("retry_run", run=run.pk)
        r = self.dashboard()
        self.assertEqual(self.attention(r), [(run.pk, "queued")])
        self.assertContains(r, "Retry queued")
        self.assertContains(r, reverse("opsconsole:action", args=[a.pk]))
        self.assertNotContains(r, "/ops/act/retry_run/", msg_prefix="no Retry while one is queued")
        self.assertNotContains(r, "/ops/act/dismiss_run/")
        self.assertIn("Retry queued.", self.problem(r), "still a problem until the retry completes")
        self.assertEqual((self.health()["state"], self.health()["listed"]), ("failing", ["failing_jobs"]))
        # The worker has started the retry's run: Retrying, with the run and the action.
        retry = FetchRun.objects.create(job="test_write", started_at=timezone.now(), status="running", trigger="retry", ops_action=a.pk, retry_of=run, attempt=2)
        r = self.dashboard()
        self.assertEqual(self.attention(r), [(run.pk, "running")])
        self.assertContains(r, "Retrying")
        self.assertContains(r, reverse("opsconsole:run", args=[retry.pk]))
        self.assertContains(self.client.get(reverse("opsconsole:run", args=[run.pk])), "Retrying")
        retry.delete()
        self.pick_up()
        a.refresh_from_db()
        self.assertEqual(a.status, "done", a.error)
        r = self.dashboard()
        self.assertEqual(self.attention(r), [], "the retry completed: the row leaves the card")
        self.assertEqual(self.problem(r), "")
        self.assertEqual((self.health()["state"], self.health()["listed"]), ("ok", []))

    def test_a_later_scheduled_run_counts_as_the_retry(self):
        run = self.failed()
        FetchRun.objects.create(job="test_write", started_at=timezone.now(), status="running")
        self.assertEqual(self.attention(), [(run.pk, "running")])

    def test_a_retry_that_fails_replaces_the_row(self):
        jobs.REGISTRY["test_write"] = jobs.Job("test_write", lambda ctx: 1 / 0, 60)
        run = self.failed()
        self.do("retry_run", run=run.pk)
        self.pick_up()
        new = FetchRun.objects.filter(job="test_write").latest("started_at")
        self.assertNotEqual(new.pk, run.pk)
        r = self.dashboard()
        self.assertEqual(self.attention(r), [(new.pk, None)], "the new failure, not both")
        self.assertIn("failed 2 runs in a row", self.problem(r))

    def test_dismiss_a_failed_run(self):
        older = self.failed(minutes_ago=20)
        run = self.failed()
        r = self.act("dismiss_run", run=run.pk)
        self.assertContains(r, f"Dismiss failed run #{run.pk} of test_write")
        self.assertContains(r, "Boom: it broke")
        self.assertContains(r, "has failed 2 runs in a row: dismissing does not fix it")
        self.assertEqual(self.confirm("dismiss_run", self.token(r), reason="").status_code, 400, "a reason is required")
        self.assertFalse(OpsAction.objects.exists())
        a = self.do("dismiss_run", reason="the source was down for maintenance; known", run=run.pk)
        self.assertEqual((a.kind, a.runs_in, a.status, a.target, a.requested_by), ("dismiss_run", "request", "done", f"run:{run.pk}", "human:op"), a.error)
        self.assertEqual(a.reason, "the source was down for maintenance; known")
        run.refresh_from_db()
        self.assertEqual((run.dismissed_by, run.dismiss_action, run.status), ("human:op", a.pk, "failed"))
        r = self.dashboard()
        self.assertEqual(self.attention(r), [])
        self.assertEqual(self.problem(r), "", "not a problem either")
        self.assertContains(r, "or was dismissed (1)")
        h = self.health()
        self.assertEqual((h["state"], h["consecutive_failures"], h["dismissed"]["run"], h["dismissed"]["by"], h["listed"]),
                         ("dismissed", 2, run.pk, "human:op", ["dismissed_jobs"]), "its count is kept")
        # It stays in the history, marked.
        runs = self.client.get(reverse("opsconsole:runs"), {"state": "failed", "job": "test_write"})
        self.assertEqual([x.pk for x in runs.context["page"]], [run.pk, older.pk])
        self.assertContains(runs, "Dismissed", count=1)
        page = self.client.get(reverse("opsconsole:run", args=[run.pk]))
        self.assertContains(page, "Dismissed</b> from Needs attention by human:op")
        self.assertNotContains(page, "/ops/act/dismiss_run/")
        self.assertContains(self.client.get(reverse("opsconsole:job", args=["test_write"])), "not counted as failing until a newer run fails")
        self.assertContains(self.act("dismiss_run", run=run.pk), "already dismissed", status_code=409)
        # A new failure of the same job comes back, counted with the earlier ones.
        new = self.failed(minutes_ago=1)
        r = self.dashboard()
        self.assertEqual(self.attention(r), [(new.pk, None)])
        self.assertIn("failed 3 runs in a row", self.problem(r))
        self.assertEqual((self.health()["state"], self.health()["listed"]), ("failing", ["failing_jobs"]))

    def test_dismiss_refusals(self):
        self.client.force_login(self.staff)
        run = self.failed()
        self.assertEqual(self.act("dismiss_run", run=run.pk).status_code, 403, "ops_operator only")
        self.client.force_login(self.op)
        self.assertContains(self.act("dismiss_run", run=999999), "no such run", status_code=409)
        ok = FetchRun.objects.create(job="test_write", started_at=timezone.now() - timedelta(minutes=1), finished_at=timezone.now(), status="ok")
        self.assertContains(self.act("dismiss_run", run=ok.pk), "not failed", status_code=409)
        self.assertContains(self.act("dismiss_run", run=run.pk), "no longer the one in Needs attention", status_code=409)
        ok.delete()
        a = self.do("retry_run", run=run.pk)
        self.assertContains(self.act("dismiss_run", run=run.pk), "being retried", status_code=409)
        # Confirmed before the retry was asked for: the request re-checks and refuses.
        self.client.post(reverse("opsconsole:action_cancel", args=[a.pk]))
        token = self.token(self.act("dismiss_run", run=run.pk))
        a2 = self.do("retry_run", run=run.pk)
        r = self.confirm("dismiss_run", token)
        d = OpsAction.objects.get(kind="dismiss_run")
        self.assertEqual((r.status_code, d.status), (303, "failed"))
        self.assertIn("being retried", d.error)
        run.refresh_from_db()
        self.assertIsNone(run.dismissed_at)
        self.assertEqual(a2.status, "pending")
