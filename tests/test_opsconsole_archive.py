"""Archiving a job from the console (ADR 0041): it pauses the job, stops its current runs (the worker's run at its next
safe point, its queued console runs withdrawn), hides it from the console's lists and /healthz while its runs stay,
needs the job's name typed (checked by the server, not only the browser), and unarchiving brings it back paused."""

from datetime import timedelta
from unittest import mock

from django.contrib.auth.models import Permission, User
from django.urls import reverse
from django.utils import timezone

from ingest import jobs
from ingest.models import FetchRun
from opsconsole import queries as Q
from opsconsole.models import OpsAction

from .test_opsconsole_actions import ActionsBase


def fetching_job(ctx):
    """A job that archives itself, as an operator would from the console while it runs, then makes a request. Its own
    `except Exception` must not swallow the stop."""
    jobs.set_archived(ctx.job, True, by="human:op", reason="retired mid-run", action=None)
    try:
        ctx.fetcher.get("https://example.org/never-fetched")
    except Exception:  # noqa: BLE001 — what a job does around one item; a stop is not an Exception
        ctx.counts["swallowed"] += 1
    ctx.counts["after_the_request"] += 1


class ArchiveBase(ActionsBase):
    def setUp(self):
        super().setUp()
        jobs.REGISTRY["test_fetch"] = jobs.Job("test_fetch", fetching_job, 60, doc="A test job that makes a request.")
        self.addCleanup(jobs.REGISTRY.pop, "test_fetch", None)

    def archive(self, name="test_write", typed=None, reason="retired: its source closed") -> OpsAction:
        r = self.confirm("archive_job", self.token(self.act("archive_job", job=name)), reason=reason,
                         confirm_name=name if typed is None else typed)
        self.assertEqual(r.status_code, 303, r.content[:2000])
        return OpsAction.objects.get(pk=int(r["Location"].rstrip("/").split("/")[-1]))

    def failed(self, job="test_write", minutes_ago=5):
        t = timezone.now() - timedelta(minutes=minutes_ago)
        return FetchRun.objects.create(job=job, started_at=t, finished_at=t + timedelta(seconds=3), status="failed", error="Boom: it broke")

    def dashboard(self):
        with mock.patch("opsconsole.queries.worker_holds_lock", return_value=True):
            return self.client.get(reverse("opsconsole:dashboard"))


class ArchiveTests(ArchiveBase):
    def test_archive_pauses_the_job_and_records_the_action(self):
        a = self.archive()
        self.assertEqual((a.status, a.kind, a.target, a.runs_in), ("done", "archive_job", "job:test_write", "request"), a.error)
        self.assertEqual((a.reason, a.requested_by, a.params["confirmed_name"]), ("retired: its source closed", "human:op", "test_write"))
        self.assertTrue(a.idempotency_key)
        self.assertTrue(a.result["paused_by_archive"])
        self.assertEqual(jobs.paused_jobs()["test_write"]["by"], "human:op")
        self.assertIn(f"action #{a.pk}", jobs.paused_jobs()["test_write"]["reason"])
        arch = jobs.archived_jobs()["test_write"]
        self.assertEqual((arch["by"], arch["reason"], arch["action"], arch["paused_by_archive"]), ("human:op", "retired: its source closed", a.pk, True))

    def test_an_already_paused_job_keeps_its_pause(self):
        jobs.set_paused("test_write", True, by="human:owner", reason="flaky")
        a = self.archive()
        self.assertFalse(a.result["paused_by_archive"])
        self.assertEqual(jobs.paused_jobs()["test_write"]["reason"], "flaky")

    def test_the_typed_name_is_checked_by_the_server(self):
        token = self.token(self.act("archive_job", job="test_write"))
        self.assertContains(self.act("archive_job", job="test_write"), 'data-typed-name="test_write"')
        for typed in ("", "Test_write", "test_write ", "process"):
            r = self.confirm("archive_job", token, confirm_name=typed)
            self.assertEqual(r.status_code, 400, typed)
            self.assertContains(r, "Type the job&#x27;s name exactly", status_code=400)
        r = self.client.post(reverse("opsconsole:confirm", args=["archive_job"]), {"token": token, "reason": "no name at all"})
        self.assertEqual(r.status_code, 400)
        self.assertFalse(OpsAction.objects.filter(kind="archive_job").exists())
        self.assertEqual(jobs.archived_jobs(), {})
        self.assertEqual(jobs.paused_jobs(), {})
        r = self.confirm("archive_job", token, confirm_name="test_write")
        self.assertEqual(r.status_code, 303)
        self.assertIn("test_write", jobs.archived_jobs())

    def test_the_name_and_a_reason_are_both_needed(self):
        token = self.token(self.act("archive_job", job="test_write"))
        r = self.confirm("archive_job", token, reason="", confirm_name="test_write")
        self.assertEqual(r.status_code, 400)
        self.assertContains(r, "Say why", status_code=400)
        self.assertContains(r, 'value="test_write"', status_code=400)  # what was typed stays in the box
        self.assertEqual(jobs.archived_jobs(), {})

    def test_permission_and_refusals(self):
        self.client.force_login(self.staff)
        self.assertEqual(self.act("archive_job", job="test_write").status_code, 403)
        self.assertNotContains(self.client.get(reverse("opsconsole:job", args=["test_write"])), "archive-dialog")
        self.client.force_login(self.op)
        self.assertEqual(self.act("archive_job", job="no_such_job").status_code, 409)
        self.assertEqual(self.act("unarchive_job", job="test_write").status_code, 409, "not archived")
        self.archive()
        self.assertEqual(self.act("archive_job", job="test_write").status_code, 409, "already archived")

    def test_archive_withdraws_queued_runs(self):
        run = self.do("run_job", job="test_write")
        self.assertEqual(run.status, "pending")
        r = self.act("archive_job", job="test_write")
        self.assertContains(r, "1 console run: withdrawn")
        a = self.confirm("archive_job", self.token(r), confirm_name="test_write")
        a = OpsAction.objects.get(pk=int(a["Location"].rstrip("/").split("/")[-1]))
        self.assertEqual(a.result["withdrawn"], [run.pk])
        run.refresh_from_db()
        self.assertEqual(run.status, "cancelled")
        self.assertIn(f"archived by human:op (action #{a.pk})", run.error)
        self.assertEqual(self.pick_up(), [], "nothing is left for the worker")
        self.assertFalse(FetchRun.objects.filter(job="test_write").exists())

    def test_a_running_run_is_asked_to_stop(self):
        live = FetchRun.objects.create(job="test_write", started_at=timezone.now() - timedelta(minutes=2), status="running")
        self.assertContains(self.act("archive_job", job="test_write"), "it stops at its next safe point")
        a = self.archive()
        self.assertEqual(a.result["stopping"], [live.pk])


class SafePointTests(ArchiveBase):
    def test_a_run_stops_at_its_next_request_and_is_not_a_failure(self):
        (run,) = jobs.run_named("test_fetch", log=self.logs.append)
        self.assertEqual(run.status, "stopped", run.error)
        self.assertIn("stopped: test_fetch was archived by human:op", run.error)
        self.assertNotIn("swallowed", run.counts, "a job's own except Exception does not swallow the stop")
        self.assertNotIn("after_the_request", run.counts, "nothing after the safe point runs")
        self.assertEqual(Q.run_state(run.status), "cancelled")
        from infra.alerts import consecutive_failures
        self.assertEqual(consecutive_failures("test_fetch", None), 0)

    def test_a_console_run_stopped_by_an_archive_is_cancelled(self):
        a = self.do("run_job", job="test_fetch")
        self.assertEqual([x.pk for x in self.pick_up()], [a.pk])
        a.refresh_from_db()
        self.assertEqual(a.status, "cancelled", a.error)
        self.assertEqual(a.result["stopped"], [FetchRun.objects.get(job="test_fetch").pk])
        self.assertIn("stopped at a safe point", a.error)

    def test_the_check_is_throttled(self):
        run = FetchRun.objects.create(job="test_write", started_at=timezone.now(), status="running")
        ctx = jobs.Context(job="test_write", run=run, fetcher=None)
        ctx.check_stop()  # reads: not archived
        jobs.set_archived("test_write", True, by="human:op", reason="x")
        ctx.check_stop()  # within STOP_CHECK_SECONDS: not read again
        ctx._stop_checked -= jobs.STOP_CHECK_SECONDS + 1
        with self.assertRaises(jobs.RunStopped):
            ctx.check_stop()

    def test_archived_jobs_never_run(self):
        jobs.set_archived("test_write", True, by="human:op", reason="retired")
        self.assertEqual(jobs.run_due(only=["test_write"], log=self.logs.append), [])
        with self.assertRaises(jobs.JobArchived):
            jobs.run_named("test_write", log=self.logs.append)
        self.assertFalse(FetchRun.objects.filter(job="test_write").exists())
        self.assertEqual(self.act("run_job", job="test_write").status_code, 409)
        self.assertEqual(self.act("resume_job", job="test_write").status_code, 409)
        self.assertEqual(self.act("pause_job", job="test_write").status_code, 409)


class HiddenTests(ArchiveBase):
    def test_hidden_from_the_console_and_health_but_its_runs_stay(self):
        run = self.failed()
        FetchRun.objects.create(job="test_write", started_at=timezone.now() - timedelta(minutes=1), status="failed", error="again")
        job_link = 'href="/ops/jobs/test_write/"'
        self.assertContains(self.client.get(reverse("opsconsole:jobs")), job_link)
        r = self.dashboard()
        self.assertIn("test_write", [a["job"]["name"] for a in r.context["attention"]])
        self.assertIn("test_write", [x["job"] for x in r.context["timeline"]["rows"]])
        self.assertIn("test_write", self.client.get("/healthz").json()["failing_jobs"])

        self.archive()
        r = self.client.get(reverse("opsconsole:jobs"))
        self.assertNotContains(r, job_link)
        self.assertNotIn("test_write", [x["name"] for x in r.context["rows"]])
        self.assertContains(r, "Archived jobs")
        self.assertEqual(r.context["tag_counts"]["paused"], 0, "an archived job is not counted under paused")
        self.assertNotIn("test_write", Q.jobs_with_tag("paused"))
        r = self.dashboard()
        self.assertNotIn("test_write", [a["job"]["name"] for a in r.context["attention"]], "Needs attention")
        self.assertNotIn("test_write", [x["job"] for x in r.context["timeline"]["rows"]], "the run graph")
        self.assertNotIn("test_write", r.context["timeline"]["quiet"])
        self.assertNotIn("test_write", [p["name"] for p in r.context["paused"]], "the paused list")
        self.assertFalse([p for p in r.context["problems"] if "test_write" in p["text"]], "the problems line")
        body = self.client.get("/healthz").json()
        self.assertNotIn("test_write", body["jobs"])
        for key in ("failing_jobs", "paused_jobs", "dismissed_jobs"):
            self.assertNotIn("test_write", body[key], key)
        r = self.client.get(reverse("opsconsole:runs"), {"job": "test_write"})
        self.assertEqual(r.context["page"].paginator.count, 2, "its runs stay on the Runs page")
        r = self.client.get(reverse("opsconsole:run", args=[run.pk]))
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, reverse("opsconsole:jobs_archived"))
        self.assertNotContains(r, "/ops/act/retry_run/")
        self.assertNotContains(r, "/ops/act/dismiss_run/")
        self.assertTrue(FetchRun.objects.filter(pk=run.pk).exists())

    def test_hidden_from_the_work_pages_fed_by(self):
        self.task(kind="write_event")
        fed = 'fed by <a href="/ops/jobs/process/">'
        self.assertContains(self.client.get(reverse("opsconsole:work")), fed)
        self.archive("process")
        self.assertNotContains(self.client.get(reverse("opsconsole:work")), fed)
        self.assertEqual(next(k for k in Q.queue(timezone.now()) if k["kind"] == "write_event")["fed_by"], [])

    def test_its_page_stays_reachable_without_run_now(self):
        self.archive()
        r = self.client.get(reverse("opsconsole:job", args=["test_write"]))
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, "Archived</b> by human:op")
        self.assertNotContains(r, "/ops/act/run_job/")
        self.assertNotContains(r, "/ops/act/pause_job/")
        self.assertNotContains(r, "archive-dialog")
        self.assertContains(r, "/ops/act/unarchive_job/")

    def test_the_archived_jobs_view(self):
        self.failed()
        self.archive()
        r = self.client.get(reverse("opsconsole:jobs_archived"))
        self.assertEqual(r.status_code, 200)
        (row,) = r.context["rows"]
        self.assertEqual((row["name"], row["runs"], row["archived"]["reason"]), ("test_write", 1, "retired: its source closed"))
        self.assertContains(r, "/ops/act/unarchive_job/")
        self.client.force_login(self.staff)
        r = self.client.get(reverse("opsconsole:jobs_archived"))
        self.assertContains(r, "test_write")
        self.assertNotContains(r, "/ops/act/")


class DialogTests(ArchiveBase):
    def test_the_job_page_carries_the_dialog_and_its_token_works(self):
        import re

        r = self.client.get(reverse("opsconsole:job", args=["test_write"]))
        self.assertContains(r, '<dialog id="archive-dialog"')
        self.assertContains(r, 'data-typed-name="test_write"')
        self.assertContains(r, "data-typed-submit disabled")
        for words in ("it is paused first", "marked Stopped", "/healthz", "its history", "comes back paused", "Run now is not offered"):
            self.assertContains(r, words)
        token = re.search(r'<dialog id="archive-dialog".*?name="token" value="([^"]+)"', r.content.decode(), re.S).group(1)
        self.assertEqual(self.confirm("archive_job", token, confirm_name="wrong").status_code, 400)
        self.assertEqual(self.confirm("archive_job", token, confirm_name="test_write").status_code, 303)
        self.assertIn("test_write", jobs.archived_jobs())


class UnarchiveTests(ArchiveBase):
    def test_unarchive_brings_it_back_paused(self):
        self.archive()
        a = self.do("unarchive_job", job="test_write", reason="its source is back")
        self.assertEqual(a.status, "done", a.error)
        self.assertEqual(jobs.archived_jobs(), {})
        self.assertIn("test_write", jobs.paused_jobs(), "back paused")
        self.assertFalse(a.result["paused_again"])
        r = self.client.get(reverse("opsconsole:jobs"))
        self.assertContains(r, 'href="/ops/jobs/test_write/"')
        self.assertIn("test_write", Q.jobs_with_tag("paused"))
        body = self.client.get("/healthz").json()
        self.assertEqual(body["jobs"]["test_write"]["state"], "paused")
        self.assertIn("test_write", body["paused_jobs"])
        self.assertEqual(jobs.run_due(only=["test_write"], log=self.logs.append), [], "still paused: the scheduler skips it")
        self.assertEqual(self.do("resume_job", job="test_write").status, "done")
        self.assertEqual(jobs.paused_jobs(), {})

    def test_a_pause_removed_while_archived_is_put_back(self):
        self.archive()
        jobs.set_paused("test_write", False, by="human:owner", reason="by hand")
        self.assertEqual(jobs.run_due(only=["test_write"], log=self.logs.append), [], "archived: never runs, paused or not")
        a = self.do("unarchive_job", job="test_write")
        self.assertTrue(a.result["paused_again"])
        self.assertIn("test_write", jobs.paused_jobs())

    def test_operator_only(self):
        self.archive()
        viewer = User.objects.create_user("viewer2", password="x", is_staff=True)
        self.client.force_login(viewer)
        self.assertEqual(self.act("unarchive_job", job="test_write").status_code, 403)
        viewer.user_permissions.add(Permission.objects.get(codename="ops_operator", content_type__app_label="opsconsole"))
        self.client.force_login(User.objects.get(pk=viewer.pk))
        self.assertEqual(self.act("unarchive_job", job="test_write").status_code, 200)
