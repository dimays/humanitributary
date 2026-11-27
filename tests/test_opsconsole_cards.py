"""The run cards (ADR 0032): what started each run (`FetchRun.trigger`, recorded by the runner, the console's run and
retry actions and `run_job`, and backfilled from the audit rows), when it became due (`scheduled_for`), the stage
breakdown, the job's usual runtime, the JSON the Dashboard and the Jobs pages embed, its one query, and the pages'
markup for the script (data-run, aria-label, a tooltip role, no per-hover request)."""

import importlib
import json
import re
from datetime import timedelta

from django.apps import apps
from django.db import connection
from django.test import TestCase
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from django.utils import timezone

from ingest import jobs
from ingest.models import Feed, FetchRun
from opsconsole import queries as Q
from opsconsole.models import OpsAction

from .test_opsconsole import seed, staff_login
from .test_opsconsole_actions import ActionsBase, write_job

CARDS = re.compile(r'<script id="run-cards" type="application/json">(.*?)</script>', re.S)


def ok_job(ctx):
    """A test job that does nothing, successfully."""
    ctx.counts["checked"] += 1


class TriggerTests(ActionsBase):
    """Each way a run starts leaves its trigger, who asked, the action, the run it retries and its attempt."""

    def test_the_scheduler_records_when_a_run_became_due(self):
        jobs.REGISTRY["test_ok"] = jobs.Job("test_ok", ok_job, 60)
        self.addCleanup(jobs.REGISTRY.pop, "test_ok", None)
        jobs.run_due(only=["test_ok"], log=self.logs.append)
        first = FetchRun.objects.get(job="test_ok")
        self.assertEqual((first.trigger, first.triggered_by, first.ops_action, first.attempt), ("schedule", "", None, 1))
        self.assertIsNone(first.scheduled_for, "a first run was never due at a time: not recorded")
        before = timezone.now() - timedelta(hours=2)
        FetchRun.objects.filter(pk=first.pk).update(started_at=before)
        jobs.run_due(only=["test_ok"], log=self.logs.append)
        second = FetchRun.objects.filter(job="test_ok").latest("started_at")
        self.assertEqual(second.trigger, "schedule")
        self.assertEqual(second.scheduled_for, before + timedelta(minutes=60))
        feed = Feed(name="x", next_run_at=before)
        self.assertEqual(jobs.due_at(jobs.REGISTRY["portal"], feed), before, "a feed job is due at its feed's next_run_at")

    def test_run_job_from_the_shell_is_manual(self):
        run, = jobs.run_named("test_write", log=self.logs.append)
        self.assertEqual((run.trigger, run.triggered_by, run.ops_action, run.scheduled_for), ("manual", "shell", None, None))

    def test_run_now_from_the_console_is_manual_with_its_action(self):
        a = self.do("run_job", job="test_write")
        self.pick_up()
        run = FetchRun.objects.get(job="test_write")
        self.assertEqual((run.trigger, run.triggered_by, run.ops_action, run.attempt), ("manual", "human:op", a.pk, 1))

    def test_a_retry_names_the_run_it_retries_and_counts_attempts(self):
        failed = FetchRun.objects.create(job="test_write", started_at=timezone.now() - timedelta(minutes=5), finished_at=timezone.now(),
                                         status="failed", error="Boom")
        calls = []

        def flaky(ctx):
            calls.append(1)
            if len(calls) == 1:
                raise RuntimeError("still broken")
            write_job(ctx)

        jobs.REGISTRY["test_write"] = jobs.Job("test_write", flaky, 60)
        a1 = self.do("retry_run", run=failed.pk)
        self.pick_up()
        second = FetchRun.objects.exclude(pk=failed.pk).get(job="test_write")
        self.assertEqual((second.trigger, second.retry_of_id, second.attempt, second.ops_action, second.status), ("retry", failed.pk, 2, a1.pk, "failed"))
        a2 = self.do("retry_run", run=second.pk)
        self.pick_up()
        third = FetchRun.objects.filter(job="test_write").latest("started_at")
        self.assertEqual((third.trigger, third.retry_of_id, third.attempt, third.ops_action, third.status), ("retry", second.pk, 3, a2.pk, "ok"))

    def test_the_backfill_reads_the_audit_rows_and_guesses_nothing(self):
        now = timezone.now()
        plain = FetchRun.objects.create(job="process", started_at=now - timedelta(hours=3), finished_at=now, status="ok")
        failed = FetchRun.objects.create(job="test_write", started_at=now - timedelta(hours=2), finished_at=now, status="failed")
        manual = FetchRun.objects.create(job="test_write", started_at=now - timedelta(hours=1), finished_at=now, status="failed")
        retried = FetchRun.objects.create(job="test_write", started_at=now - timedelta(minutes=30), finished_at=now, status="ok")
        base = dict(reason="r", runs_in="worker", status="done")
        a1 = OpsAction.objects.create(kind="run_job", target="job:test_write", params={"job": "test_write"}, requested_by="human:ann",
                                      idempotency_key="k1", result={"runs": [{"id": manual.pk}]}, **base)
        a2 = OpsAction.objects.create(kind="retry_run", target="job:test_write", params={"job": "test_write", "run": failed.pk},
                                      requested_by="human:bo", idempotency_key="k2", result={"runs": [{"id": retried.pk}]}, **base)
        OpsAction.objects.create(kind="run_job", target="job:x", params={}, requested_by="human:x", idempotency_key="k3", result=None, **base)
        importlib.import_module("opsconsole.migrations.0002_backfill_run_triggers").backfill(apps, None)
        for r in (plain, failed, manual, retried):
            r.refresh_from_db()
        self.assertEqual((plain.trigger, plain.ops_action, plain.scheduled_for), ("schedule", None, None))
        self.assertEqual((manual.trigger, manual.triggered_by, manual.ops_action), ("manual", "human:ann", a1.pk))
        self.assertEqual((retried.trigger, retried.triggered_by, retried.ops_action, retried.retry_of_id, retried.attempt),
                         ("retry", "human:bo", a2.pk, failed.pk, 2))


def _run(trigger="schedule", started=None, finished=None, status="ok", **kw):
    started = started or timezone.now() - timedelta(minutes=10)
    return {"trigger": trigger, "started": started, "finished": finished if finished is not None else started + timedelta(seconds=10),
            "status": status, "scheduled_for": None, "requested": None, "picked": None, "ops_action": None, **kw}


class BreakdownTests(TestCase):
    """queries.stages(): the mini-timeline's segments, and nothing guessed."""

    def setUp(self):
        self.now = timezone.now()
        self.t = self.now - timedelta(hours=1)

    def test_a_scheduled_run_waits_from_due_to_start(self):
        segs, missing = Q.stages(_run(started=self.t, scheduled_for=self.t - timedelta(seconds=45)), self.now)
        self.assertEqual(segs, [{"k": "wait", "s": 45.0}, {"k": "run", "s": 10.0}])
        self.assertEqual(missing, [])

    def test_an_older_run_says_its_wait_was_not_recorded(self):
        segs, missing = Q.stages(_run(started=self.t), self.now)
        self.assertEqual([s["k"] for s in segs], ["run"])
        self.assertEqual(missing, ["wait"])

    def test_a_console_run_queues_from_request_to_start_with_the_pick_up(self):
        segs, missing = Q.stages(_run("manual", started=self.t, ops_action=4, requested=self.t - timedelta(seconds=90),
                                      picked=self.t - timedelta(seconds=2)), self.now)
        self.assertEqual(segs[0], {"k": "wait", "s": 90.0, "picked": 88.0})
        self.assertEqual(missing, [])

    def test_a_shell_run_has_no_wait_and_nothing_missing(self):
        segs, missing = Q.stages(_run("manual", started=self.t), self.now)
        self.assertEqual(([s["k"] for s in segs], missing), (["run"], []))

    def test_a_retry_shows_its_earlier_attempts_and_the_gaps(self):
        a1 = {"id": 1, "status": "failed", "started": self.t, "finished": self.t + timedelta(seconds=8), "attempt": 1, "requested": None}
        a2 = {"id": 2, "status": "failed", "started": self.t + timedelta(minutes=10), "finished": self.t + timedelta(minutes=10, seconds=5),
              "attempt": 2, "requested": self.t + timedelta(minutes=9)}
        run = _run("retry", started=self.t + timedelta(minutes=30), ops_action=9, requested=self.t + timedelta(minutes=29), picked=self.t + timedelta(minutes=30))
        segs, _ = Q.stages(run, self.now, [a1, a2])
        self.assertEqual([s["k"] for s in segs], ["attempt", "gap", "attempt", "gap", "wait", "run"])
        self.assertEqual([s["s"] for s in segs], [8.0, 9 * 60 - 8.0, 5.0, 19 * 60 - 5.0, 60.0, 10.0])
        self.assertEqual([segs[0]["n"], segs[2]["n"], segs[0]["state"]], [1, 2, "failed"])

    def test_a_running_run_runs_until_now(self):
        segs, _ = Q.stages(_run(started=self.now - timedelta(seconds=30), finished=None, status="running") | {"finished": None}, self.now)
        self.assertEqual(segs[-1], {"k": "run", "s": 30.0})

    def test_usual_compares_only_with_enough_runs(self):
        self.assertEqual(Q.usual(30, 4, 10, 12), {}, "too few runs")
        self.assertEqual(Q.usual(21, 30, 10, 12), {"ratio": 2.1, "slow": True})
        self.assertEqual(Q.usual(20, 30, 10, 40), {"ratio": 2.0, "slow": False}, "within the job's own p90 is not slow")
        self.assertEqual(Q.usual(10, 30, 10, 12), {"ratio": 1.0, "slow": False})


class RunCardsTests(TestCase):
    """queries.run_cards(): the JSON shape, the usual runtimes from SQL, masking, and one query whatever the runs."""

    def setUp(self):
        self.now = timezone.now()

    def make(self, job, i, seconds, status="ok", **kw):
        t = self.now - timedelta(hours=100 - i)
        return FetchRun.objects.create(job=job, started_at=t, finished_at=t + timedelta(seconds=seconds), status=status, **kw)

    def test_usual_is_the_median_and_p90_of_the_last_30_completed_runs(self):
        for i in range(5):
            self.make("process", i, 1000)  # older than the last 30 completed runs: left out
        runs = [self.make("process", 10 + i, i + 1, status="partial" if i % 3 else "ok") for i in range(30)]
        self.make("process", 50, 5000, status="failed")  # failed runs don't count
        cards = Q.run_cards([runs[-1].pk], self.now)
        self.assertEqual(cards["jobs"]["process"], {"tags": ["process"], "n": 30, "p50": 15.5, "p90": 27.1})
        self.assertEqual((cards["runs"][str(runs[-1].pk)]["ratio"], cards["runs"][str(runs[-1].pk)]["slow"]), (1.9, True))

    def test_the_shape_of_a_retry_card(self):
        a = OpsAction.objects.create(kind="retry_run", target="job:link_health", params={}, reason="r", requested_by="human:ann",
                                     idempotency_key="k", runs_in="worker", status="done", started_at=self.now - timedelta(minutes=9))
        OpsAction.objects.filter(pk=a.pk).update(created_at=self.now - timedelta(minutes=10))
        first = self.make("link_health", 98, 4, status="failed", error="FetchError: https://x.org/?api_key=SECRETKEY123 timed out\nTraceback …",
                          scheduled_for=self.now - timedelta(hours=2, seconds=30))
        t = self.now - timedelta(minutes=9)
        retry = FetchRun.objects.create(job="link_health", started_at=t, finished_at=t + timedelta(seconds=6), status="failed",
                                        error="FetchError: https://x.org/?api_key=SECRETKEY123 timed out", counts={"checked": 3, "errors": 1, "requests": 7},
                                        trigger="retry", triggered_by="human:ann", ops_action=a.pk, retry_of=first, attempt=2)
        cards = Q.run_cards([retry.pk, first.pk], self.now)
        self.assertEqual(set(cards), {"url", "action_url", "jobs", "runs"})
        self.assertEqual(cards["url"], reverse("opsconsole:run", args=[0]))
        c = cards["runs"][str(retry.pk)]
        self.assertEqual({k: c[k] for k in ("job", "state", "trigger", "attempt", "by", "action", "retry_of", "requests", "s")},
                         {"job": "link_health", "state": "failed", "trigger": "retry", "attempt": 2, "by": "human:ann", "action": a.pk,
                          "retry_of": first.pk, "requests": 7, "s": 6.0})
        self.assertEqual([s["k"] for s in c["stages"]], ["attempt", "gap", "wait", "run"])
        self.assertEqual(c["stages"][2], {"k": "wait", "s": 60.0, "picked": 60.0})
        self.assertEqual(c["counts"], [["errors", 1], ["checked", 3]])
        self.assertEqual((c["t0"], c["t1"], c["requested"]), (round(t.timestamp()), round((t + timedelta(seconds=6)).timestamp()),
                                                              round((self.now - timedelta(minutes=10)).timestamp())))
        self.assertNotIn("SECRETKEY123", json.dumps(cards))
        self.assertTrue(c["error"].startswith("FetchError: https://x.org/?api_key="))
        self.assertNotIn("Traceback", cards["runs"][str(first.pk)]["error"], "the error's first line only")
        f = cards["runs"][str(first.pk)]
        self.assertEqual((f["trigger"], f["due"]), ("schedule", round((self.now - timedelta(hours=2, seconds=30)).timestamp())))
        self.assertNotIn("by", f, "empty keys are left out")
        self.assertNotIn("missing", f)

    def test_one_query_whatever_the_runs(self):
        self.assertEqual(Q.run_cards([], self.now)["runs"], {})
        few = [self.make("process", i, 3).pk for i in range(3)]
        prev = None
        many = []
        for i in range(60):
            prev = self.make("gap_pointers", 30 + i % 40, 5, status="failed" if i % 2 == 0 else "ok", retry_of=prev, attempt=(prev.attempt + 1) if prev else 1,
                             trigger="retry" if prev else "schedule")
            many.append(prev.pk)
        for ids in (few, few + many):
            with CaptureQueriesContext(connection) as ctx:
                cards = Q.run_cards(ids, self.now)
            self.assertEqual(len(ctx.captured_queries), 1, f"{len(ids)} runs")
            self.assertEqual(len(cards["runs"]), len(ids))
        deep = cards["runs"][str(many[-1])]["stages"]
        self.assertEqual(sum(s["k"] == "attempt" for s in deep), Q.EARLIER_SHOWN, "at most EARLIER_SHOWN earlier attempts")


class CardPagesTests(TestCase):
    """The pages embed the cards' JSON once, mark each bar and square for the script, and keep them accessible."""

    @classmethod
    def setUpTestData(cls):
        seed(publish_release=False)

    def setUp(self):
        staff_login(self)

    def cards(self, response) -> dict:
        m = CARDS.search(response.content.decode())
        self.assertIsNotNone(m, "the page embeds the run cards' JSON")
        return json.loads(m.group(1))

    def test_dashboard_bars(self):
        r = self.client.get(reverse("opsconsole:dashboard"))
        html = r.content.decode()
        cards = self.cards(r)
        bars = re.findall(r'<a href="/ops/runs/(\d+)/" class="s-[^"]*" style="[^"]*" data-run="(\d+)"\s+aria-label="([^"]+)"', html)
        self.assertTrue(bars)
        for href, run, label in bars:
            self.assertEqual(href, run)
            self.assertIn(run, cards["runs"], "every bar has its card")
            self.assertIn(" · ", label)
        self.assertNotIn('title="gap_pointers', html, "the card replaces the browser's own tooltip")
        retry = [c for c in cards["runs"].values() if c["trigger"] == "retry" and c["state"] == "completed"]
        self.assertEqual([s["k"] for s in retry[0]["stages"]], ["attempt", "gap", "attempt", "gap", "wait", "run"])
        self.assertTrue(any(c["trigger"] == "manual" for c in cards["runs"].values()))
        self.assertTrue(any("wait" in c.get("missing", []) for c in cards["runs"].values()), "older runs say not recorded")
        for needle in ('role", "tooltip"', "aria-describedby", '"Escape"', "focusin", "80", "not recorded", "pointerType"):
            self.assertIn(needle, html, needle)
        self.assertNotIn("fetch(", html, "no request per hover")

    def test_history_strips(self):
        for url in (reverse("opsconsole:jobs"), reverse("opsconsole:job", args=["link_health"])):
            r = self.client.get(url)
            cards = self.cards(r)
            cells = re.findall(r'<a class="cell s-[^"]*" href="/ops/runs/(\d+)/" data-run="(\d+)" aria-label="([^"]+)"></a>', r.content.decode())
            self.assertTrue(cells, url)
            self.assertTrue(all(a == b and a in cards["runs"] for a, b, _ in cells), url)
            self.assertNotIn(' title="', "".join(re.findall(r'<a class="cell[^>]*>', r.content.decode())), "no native tooltip on squares")
