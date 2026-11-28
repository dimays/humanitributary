"""Automated rounds (docs/adr/0035-automated-daily-rounds.md): the agent API's operations (GET queue, edits/check and
edits/apply, releases/check and releases/publish, rounds), their scopes, audit rows, idempotency keys, gate refusals
and rate limits; the Round model and its preflight (paused, skipped, busy, held drafts carried over); the console's
round strip, round pages and controls; and the commit-time conflict of two agents completing tasks at once."""

import json
import threading
from datetime import timedelta
from io import StringIO
from unittest import mock

from django.core.management import call_command
from django.db import IntegrityError, connection
from django.test import TestCase, TransactionTestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from agentapi.auth import create_token
from ingest.models import JobState
from opsconsole.models import OpsAction
from publish.legacy import import_content
from publish.models import Release
from revisions import revising
from revisions.models import Revision
from timeline import services
from timeline.models import Entry, Event
from work import queue
from work import rounds as WR
from work.models import AgentTask, Round

from .fixtures import small
from .runner import FreshStorage
from .test_opsconsole_actions import ActionsBase, fake_node_build

APPROVE = [{"op": "approve", "entry": "un-charter", "reason": "Review round (test) §1: APPROVE"}]


class ApiBase(FreshStorage, TestCase):
    def setUp(self):
        super().setUp()
        import_content(small())
        self.tokens = {}
        for name, scopes in {"writer": ["write_event"], "all": ["*"], "reviewer": ["review"], "publisher": ["publish"], "recorder": ["round"]}.items():
            self.tokens[name] = create_token(name, scopes, created_by="human:owner")[1]

    def call(self, method, path, body=None, *, as_="reviewer", key=None):
        headers = {"HTTP_AUTHORIZATION": f"Bearer {self.tokens[as_]}"}
        if key:
            headers["HTTP_IDEMPOTENCY_KEY"] = key
        fn = getattr(self.client, method)
        if body is not None:
            return fn(f"/api/agent/{path}", data=json.dumps(body), content_type="application/json", **headers)
        return fn(f"/api/agent/{path}", **headers)

    def set_status(self, slug, status):
        with revising("human:test", reason="setup"):
            Entry.objects.filter(slug=slug).update(status=status)


class ScopeAndQueueTests(ApiBase):
    def test_operation_scopes_must_be_named(self):
        for path, scope in (("edits/check", "review"), ("edits/apply", "review"), ("releases/check", "publish"),
                            ("releases/publish", "publish"), ("rounds", "round")):
            for who in ("writer", "all"):
                r = self.call("post", path, {"ops": APPROVE}, as_=who, key="k-12345678")
                self.assertEqual(r.status_code, 403, (path, who))
                self.assertIn(scope, r.json()["error"])
        self.assertEqual(self.call("post", "edits/check", {"ops": APPROVE}, as_="publisher").status_code, 403)
        self.assertEqual(self.call("post", "releases/check", {}, as_="reviewer").status_code, 403)
        # A review token claims no tasks: operation scopes are not task kinds.
        queue.enqueue("write_event", created_by="job:process")
        self.assertEqual(self.call("post", "tasks/claim", {"kinds": ["write_event"]}).status_code, 403)
        self.assertEqual(self.call("post", "tasks/claim", {}).status_code, 403, "no task kinds: no tasks at all")
        self.assertFalse(OpsAction.objects.exists())

    def test_agent_token_command_takes_operation_scopes(self):
        out = StringIO()
        call_command("agent_token", "create", "round-publisher", "--scope", "publish", "--by", "human:owner", stdout=out)
        self.assertIn("['publish']", out.getvalue())
        from django.core.management.base import CommandError

        with self.assertRaises(CommandError):
            call_command("agent_token", "create", "bad", "--scope", "publishing", stdout=StringIO())

    def test_queue_has_what_a_round_plans_from(self):
        queue.enqueue("write_event", created_by="job:process", priority=80, dedupe_key="cluster:a")
        queue.enqueue("write_event", created_by="job:process", priority=72, dedupe_key="cluster:b")
        queue.enqueue("fill_gap", created_by="job:gap_waves", priority=65)
        r = self.call("get", "queue", as_="writer")
        self.assertEqual(r.status_code, 200)
        q = r.json()
        we = next(k for k in q["kinds"] if k["kind"] == "write_event")
        self.assertEqual((we["waiting"], we["priorities"]["max"], we["priorities"]["min"], we["role"], we["fed_by"]), (2, 80, 72, "writer", ["process"]))
        self.assertEqual(we["top"][0]["key"], "cluster:a")
        self.assertIn("write_event", q["caps"])
        self.assertEqual(q["round"]["next_round_takes"]["write_event"], 2)
        self.assertEqual(q["round"]["paused"], None)
        self.assertIn("in_review", q["review"])
        self.assertEqual(q["lease_minutes"], 30)


class EditsTests(ApiBase):
    def check(self, ops, **extra):
        return self.call("post", "edits/check", {"ops": ops, "name": "2026-11-28-round.edits.json", **extra})

    def test_check_is_a_dry_run_with_the_diff_and_an_audit_row(self):
        self.set_status("un-charter", "review")
        before = Revision.objects.count()
        r = self.check(APPROVE)
        self.assertEqual(r.status_code, 200, r.content)
        d = r.json()
        self.assertTrue(d["valid"])
        self.assertEqual(d["counts"], {"approve": 1})
        self.assertTrue(any("published" in ln for ln in d["ops"][0]["diff"]))
        self.assertEqual(Revision.objects.count(), before, "a check writes nothing")
        self.assertEqual(Entry.objects.get(slug="un-charter").status, "review")
        a = OpsAction.objects.get(pk=d["check"])
        self.assertEqual((a.kind, a.requested_by, a.runs_in, a.status), ("edits_check", "agent:reviewer", "api", "done"))
        self.assertIn("approve un-charter", a.output)

    def test_check_refuses_what_apply_edits_refuses(self):
        bad = [{"op": "edit", "entry": "un-charter", "reason": "r", "fields": {"title": "x" * 80}},
               {"op": "edit", "entry": "un-charter", "reason": "r", "add_cites": [{"t": "OpenStax", "u": "https://openstax.org/books/world-history/pages/1"}]}]
        r = self.check(bad)
        self.assertEqual(r.status_code, 422)
        problems = " ".join(r.json()["problems"])
        self.assertIn("openstax", problems.lower())
        self.assertIn("60", problems)
        self.assertEqual(OpsAction.objects.get(pk=r.json()["check"]).status, "failed")
        self.assertEqual(self.check([{"op": "approve"}] * 501).status_code, 413)

    def test_a_reviewer_never_approves_its_own_draft_or_publishes_an_addition(self):
        ev = Event.objects.filter(status="published").first()
        with revising("agent:reviewer", reason="a draft the reviewer wrote"):
            services.save_event("rv-own-draft", branch=ev.branch, y=2026.5, when="July 1, 2026", title="A draft", text="Text.", imp=3, status="review")
        r = self.check([{"op": "approve", "entry": "rv-own-draft", "reason": "mine"}])
        self.assertEqual(r.status_code, 422)
        self.assertIn("independent reviewer", r.json()["problems"][0])
        add = {"op": "add_event", "reason": "new", "status": "published",
               "event": {"id": "rv-new", "branch": ev.branch.slug, "y": 2026.5, "when": "July 1, 2026", "title": "New", "text": "Text.", "imp": 3,
                         "cites": [{"t": "A page", "u": "https://example.org/a"}]}}
        r = self.check([add])
        self.assertEqual(r.status_code, 422)
        self.assertIn("lands in review", " ".join(r.json()["problems"]))

    def test_apply_needs_a_key_and_a_matching_fresh_check_and_acts_once(self):
        self.set_status("un-charter", "review")
        rnd = Round.objects.create(started_at=timezone.now(), trigger="schedule", started_by="agent:recorder")
        self.assertEqual(self.call("post", "edits/apply", {"ops": APPROVE}).status_code, 400, "no Idempotency-Key")
        r = self.call("post", "edits/apply", {"ops": APPROVE, "round": rnd.pk}, key="apply-0001")
        self.assertEqual(r.status_code, 409)
        self.assertIn("check", r.json()["error"])
        check = self.check(APPROVE, round=rnd.pk).json()["check"]
        other = APPROVE + [{"op": "reject", "entry": "co-big-bang", "reason": "dup"}]
        r = self.call("post", "edits/apply", {"ops": other, "round": rnd.pk, "check": check}, key="apply-0002")
        self.assertEqual(r.status_code, 409)
        self.assertIn("sha256", r.json()["error"])
        body = {"ops": APPROVE, "round": rnd.pk, "check": check, "name": "2026-11-28-round.edits.json", "reason": "round review"}
        high = Revision.objects.order_by("-id").values_list("id", flat=True).first()
        r = self.call("post", "edits/apply", body, key="apply-0003")
        self.assertEqual(r.status_code, 200, r.content)
        d = r.json()
        self.assertEqual((d["applied"], d["counts"]), (True, {"approve": 1}))
        self.assertEqual(Entry.objects.get(slug="un-charter").status, "published")
        revs = Revision.objects.filter(txid=d["txid"], id__gt=high)  # (a TestCase is one transaction: the setup's rows share it)
        self.assertTrue(revs.exists())
        self.assertEqual(set(revs.values_list("actor", flat=True)), {"agent:reviewer"})
        self.assertTrue(all(f"apply_edits round-{rnd.pk}:" in x for x in revs.values_list("reason", flat=True)))
        rnd.refresh_from_db()
        self.assertEqual(rnd.edit_ops, {"approve": 1})
        a = OpsAction.objects.get(pk=d["action"])
        self.assertEqual((a.kind, a.round_id, a.reason, a.status), ("edits_apply", rnd.pk, "round review", "done"))
        # A retry with the same key gets the same answer and applies nothing again.
        n = Revision.objects.count()
        again = self.call("post", "edits/apply", body, key="apply-0003")
        self.assertEqual((again.status_code, again.json()["replayed"], again.json()["action"]), (200, True, d["action"]))
        self.assertEqual(Revision.objects.count(), n)
        self.assertEqual(self.call("post", "edits/apply", {**body, "reason": "x", "name": "other.edits.json"}, key="apply-0003").status_code, 409)
        # The check is spent.
        self.assertEqual(self.call("post", "edits/apply", body, key="apply-0004").status_code, 409)

    @override_settings(AGENT_API_EDITS_CHECKS_PER_HOUR=2)
    def test_checks_are_rate_limited_per_token(self):
        codes = [self.check(APPROVE).status_code for _ in range(3)]
        self.assertEqual(codes[2], 429)
        self.assertEqual(OpsAction.objects.filter(kind="edits_check").count(), 2)


@mock.patch("publish.gates.node_build", fake_node_build)
class ReleaseTests(ApiBase):
    def check(self, **body):
        return self.call("post", "releases/check", body, as_="publisher")

    def publish(self, check, key="pub-00001", **body):
        return self.call("post", "releases/publish", {"check": check, "reason": "round 1 approved", **body}, as_="publisher", key=key)

    def test_check_then_publish_records_who_and_why(self):
        rnd = Round.objects.create(started_at=timezone.now(), trigger="schedule", started_by="agent:recorder", status="reviewing")
        r = self.check(round=rnd.pk)
        self.assertEqual(r.status_code, 200, r.content)
        d = r.json()
        self.assertTrue(d["passed"])
        self.assertEqual(Release.objects.count(), 0, "a check writes nothing")
        rnd.refresh_from_db()
        self.assertEqual(rnd.status, "release_ready")
        self.assertEqual(self.call("post", "releases/publish", {"check": d["check"], "reason": "x"}, as_="publisher").status_code, 400, "no key")
        self.assertEqual(self.call("post", "releases/publish", {"check": d["check"]}, as_="publisher", key="pub-00009").status_code, 400, "no reason")
        r = self.publish(d["check"], round=rnd.pk)
        self.assertEqual(r.status_code, 200, r.content)
        out = r.json()
        rel = Release.objects.get()
        self.assertEqual((out["published"], out["version"], rel.created_by), (True, rel.version, "agent:publisher"))
        self.assertIn("round 1 approved", rel.notes)
        from infra import storage

        self.assertEqual(storage.read_pointer()["updated_by"], "agent:publisher")
        rnd.refresh_from_db()
        self.assertEqual((rnd.status, rnd.release_id), ("published", rel.pk))
        a = OpsAction.objects.get(pk=out["action"])
        self.assertEqual((a.kind, a.requested_by, a.reason, a.round_id), ("publish", "agent:publisher", "round 1 approved", rnd.pk))
        # Retried: the same answer, no second release.
        again = self.publish(d["check"], round=rnd.pk)
        self.assertEqual((again.status_code, again.json()["replayed"]), (200, True))
        self.assertEqual(Release.objects.count(), 1)
        # A new key with the spent check is refused.
        self.assertEqual(self.publish(d["check"], key="pub-00002", round=rnd.pk).status_code, 409)

    def test_failing_gates_refuse(self):
        failing = mock.patch("publish.gates.node_build", lambda body, built: __import__("publish.gates", fromlist=["Build"]).Build(False, ["✗ a broken snapshot"]))
        with failing:
            r = self.check()
        self.assertEqual(r.status_code, 422)
        self.assertEqual(r.json()["problems"], {"build": ["✗ a broken snapshot"]})
        self.assertEqual(OpsAction.objects.get(pk=r.json()["check"]).status, "failed")
        self.assertEqual(self.publish(r.json()["check"]).status_code, 409, "a failed check publishes nothing")
        self.assertEqual(Release.objects.count(), 0)

    def test_content_changed_since_the_check_refuses(self):
        check = self.check().json()["check"]
        ev = Event.objects.filter(status="published").first()
        with revising("human:owner", reason="an edit after the check"):
            services.save_event(ev.slug, title=ev.title + " (edited)")
        r = self.publish(check)
        self.assertEqual(r.status_code, 409)
        self.assertIn("content changed", r.json()["error"])
        self.assertEqual(Release.objects.count(), 0)

    def test_one_publish_at_a_time_across_the_console_and_the_api(self):
        check = self.check().json()["check"]
        busy = OpsAction.objects.create(kind="publish", target="release:new", reason="console", requested_by="human:op", idempotency_key="c1",
                                        runs_in="worker", status="pending")
        r = self.publish(check)
        self.assertEqual(r.status_code, 409)
        self.assertTrue(r.json()["retryable"])
        self.assertIn("one publish or rollback at a time", r.json()["error"])
        busy.status = "done"
        busy.save()
        # An agent action cut off mid-request stops holding the lock after a few minutes.
        OpsAction.objects.create(kind="publish", target="release:new", reason="cut off", requested_by="agent:publisher", idempotency_key="c2",
                                 runs_in="api", status="running", started_at=timezone.now() - timedelta(minutes=30))
        self.assertEqual(self.publish(check).status_code, 200)
        self.assertEqual(OpsAction.objects.get(idempotency_key="c2").status, "failed")

    @override_settings(AGENT_API_PUBLISHES_PER_DAY=1)
    def test_publishes_are_rate_limited(self):
        self.assertEqual(self.publish(self.check().json()["check"]).status_code, 200)
        ev = Event.objects.filter(status="published").first()
        with revising("human:owner", reason="a change"):
            services.save_event(ev.slug, title=ev.title + " (edited)")
        self.assertEqual(self.publish(self.check().json()["check"], key="pub-00003").status_code, 429)


class RoundTests(ApiBase):
    def start(self, key="round-0001", **body):
        return self.call("post", "rounds", {"trigger": "schedule", "plan": {"mix": {"write_event": 4}}, **body}, as_="recorder", key=key)

    def test_start_record_and_finish(self):
        r = self.start()
        self.assertEqual(r.status_code, 201, r.content)
        d = r.json()
        self.assertTrue(d["proceed"])
        rid = d["round"]["id"]
        self.assertEqual(d["size"], WR.size_of({}))
        self.assertEqual(self.start().json()["replayed"], True, "the same key: the same round")
        self.assertEqual(Round.objects.count(), 1)
        busy = self.start(key="round-0002")
        self.assertEqual((busy.status_code, busy.json()["busy"]), (409, True))
        p = self.call("patch", f"rounds/{rid}", {"status": "reviewing", "agents": [{"name": "writer", "role": "writer", "completed": 3}],
                                                 "tasks": {"write_event": {"claimed": 4, "completed": 3, "failed": 1}}, "drafts": ["a-1", "a-2"]}, as_="recorder")
        self.assertEqual(p.status_code, 200, p.content)
        self.assertEqual(self.call("patch", f"rounds/{rid}", {"status": "published"}, as_="recorder").status_code, 422)
        self.assertEqual(self.call("patch", f"rounds/{rid}", {"verdicts": {"approve": -1}}, as_="recorder").status_code, 422)
        self.assertEqual(self.call("patch", f"rounds/{rid}", {"bogus": 1}, as_="recorder").status_code, 422)
        self.assertEqual(self.call("patch", f"rounds/{rid}", {"status": "finished"}, as_="reviewer").status_code, 403)
        p = self.call("patch", f"rounds/{rid}", {"verdicts": {"approve": 2}, "status": "finished", "finish": True, "summary": "2 approved"}, as_="recorder")
        self.assertEqual(p.json()["round"]["status"], "finished")
        rnd = Round.objects.get()
        self.assertIsNotNone(rnd.finished_at)
        self.assertEqual(self.call("patch", f"rounds/{rid}", {"status": "running"}, as_="recorder").status_code, 422, "finished is final")
        self.assertEqual(self.call("patch", f"rounds/{rid}", {"notes": "later note"}, as_="recorder").status_code, 200)
        self.assertGreaterEqual(len(rnd.history), 3)
        self.assertEqual(self.call("get", f"rounds/{rid}", as_="writer").json()["round"]["verdicts"], {"approve": 2})

    def test_paused_rounds_stop_the_routine_cleanly(self):
        WR.change(by="human:op", reason="holiday", paused=True)
        s = self.call("get", "rounds/settings", as_="writer").json()
        self.assertEqual(s["paused"]["reason"], "holiday")
        r = self.start()
        self.assertEqual(r.status_code, 409)
        self.assertEqual((r.json()["paused"], r.json()["proceed"]), (True, False))
        self.assertFalse(Round.objects.exists(), "a paused day records nothing")
        self.assertEqual(self.start(trigger="manual").status_code, 201, "a round started by hand still runs")

    def test_skip_next_records_a_skipped_round_once(self):
        WR.change(by="human:op", reason="deploy day", skip_next=True)
        r = self.start()
        self.assertEqual(r.status_code, 200)
        self.assertEqual((r.json()["proceed"], r.json()["round"]["status"]), (False, "skipped"))
        self.assertIsNone(WR.current()["skip_next"])
        self.assertEqual(self.start(key="round-0002").status_code, 201)

    def test_held_drafts_carry_over_into_the_next_round(self):
        # an-punic-wars cites Wikipedia only; un-charter rests on un.org (browser_only), so it waits for the owner's
        # read on the Review page instead (ADR 0046) and is never carried over to agents.
        for slug in ("an-punic-wars", "un-charter"):
            self.set_status(slug, "review")
            with revising("agent:reviewer", reason=f"apply_edits round-1/x.edits.json #0 edit {slug}: HOLD"):
                services.save_event(slug, text=Event.objects.get(slug=slug).text + " (held)")
        self.assertEqual(list(WR.held_drafts()), ["an-punic-wars"])
        WR.change(by="human:op", reason="look again", carry_over={"slugs": ["an-punic-wars"]})
        d = self.start().json()
        self.assertEqual(d["carry_over"], ["an-punic-wars"])
        self.assertIsNone(WR.current()["carry_over"])

    def test_a_stale_open_round_is_closed(self):
        Round.objects.create(started_at=timezone.now() - timedelta(hours=13), trigger="schedule", started_by="agent:recorder")
        self.assertEqual(self.start().status_code, 201)
        self.assertEqual(Round.objects.order_by("started_at").first().status, "failed")

    def test_schedule_in_words(self):
        self.assertEqual(WR.schedule_words("0 6 * * *"), "daily at 06:00 UTC")
        self.assertEqual(WR.schedule_words("30 5 * * 1,4"), "Mondays and Thursdays at 05:30 UTC")
        self.assertEqual(WR.schedule_words("*/5 * * * *"), "cron */5 * * * *")
        from datetime import datetime, timezone as tz

        self.assertEqual(WR.next_at("0 6 * * *", datetime(2026, 11, 27, 7, 0, tzinfo=tz.utc)), datetime(2026, 11, 28, 6, 0, tzinfo=tz.utc))
        self.assertEqual(WR.next_at("0 6 * * 1", datetime(2026, 11, 27, 7, 0, tzinfo=tz.utc)).weekday(), 0)


class ConsoleRoundTests(ActionsBase):
    def test_work_page_shows_the_round_strip_and_the_controls(self):
        rnd = Round.objects.create(started_at=timezone.now(), trigger="schedule", started_by="agent:recorder", status="published",
                                   plan={"mix": {"write_event": 4}}, tasks={"write_event": {"completed": 3}}, drafts=["a-1"], verdicts={"approve": 1})
        r = self.client.get(reverse("opsconsole:work"))
        self.assertContains(r, "Daily agent round")
        self.assertContains(r, "Claude agents do these tasks in rounds")
        self.assertContains(r, "next round will take")
        self.assertContains(r, "/ops/act/pause_rounds/")
        self.assertContains(r, f"Round #{rnd.pk}")
        self.assertContains(r, "fed by")
        self.assertContains(self.client.get(reverse("opsconsole:jobs")), "They don't use Claude")
        d = self.client.get(reverse("opsconsole:round", args=[rnd.pk]))
        self.assertContains(d, "Plan")
        self.assertContains(d, "Publish")
        self.assertContains(self.client.get(reverse("opsconsole:rounds")), f"#{rnd.pk}")
        self.assertContains(self.client.get(reverse("opsconsole:dashboard")), "Latest round")
        self.client.force_login(self.staff)
        self.assertNotContains(self.client.get(reverse("opsconsole:work")), "/ops/act/pause_rounds/")
        self.assertEqual(self.act("pause_rounds").status_code, 403)

    def test_pause_resume_skip_and_size_are_confirmed_audited_actions(self):
        a = self.do("pause_rounds", reason="owner away")
        self.assertEqual((a.status, a.requested_by), ("done", "human:op"))
        self.assertEqual(WR.current()["paused"]["reason"], "owner away")
        self.assertEqual(self.act("pause_rounds").status_code, 409, "already paused")
        self.assertEqual(self.act("skip_round").status_code, 409, "nothing to skip while paused")
        self.do("resume_rounds")
        self.assertIsNone(WR.current()["paused"])
        self.do("skip_round", reason="deploy day")
        self.assertEqual(WR.current()["skip_next"]["reason"], "deploy day")
        form = {f"agents.{r}": 1 for r in WR.ROLES} | {f"tasks_per_agent.{r}": 2 for r in WR.ROLES}
        self.assertEqual(self.act("round_size", **{**form, "agents.writer": 9}).status_code, 409, "over the cap")
        r = self.act("round_size", **form)
        self.assertContains(r, "Tasks each")
        self.do("round_size", **form)
        self.assertEqual(WR.current()["size"]["tasks_per_agent"]["writer"], 2)
        kinds = list(OpsAction.objects.order_by("id").values_list("kind", flat=True))
        self.assertEqual(kinds, ["pause_rounds", "resume_rounds", "skip_round", "round_size"])

    def test_send_held_drafts_to_the_next_review(self):
        self.assertEqual(self.act("review_held").status_code, 409, "none held")
        with revising("human:test", reason="setup"):
            Entry.objects.filter(slug="an-punic-wars").update(status="review")
        with revising("agent:reviewer", reason="apply_edits x.edits.json #0 edit an-punic-wars: HOLD"):
            services.save_event("an-punic-wars", text=Event.objects.get(slug="an-punic-wars").text + " (held)")
        a = self.do("review_held", reason="look again")
        self.assertEqual(a.params["slugs"], ["an-punic-wars"])
        self.assertEqual(WR.current()["carry_over"]["slugs"], ["an-punic-wars"])


class CompleteConflictTests(ApiBase):
    """The 500 of POST tasks/<id>/complete: a conflict Postgres reports at COMMIT is a retryable 409, and the same
    result sent again after it went through is the task back, not a second apply."""

    EVENT = {"id": "un-conflict", "branch": "un", "y": 2026.9, "when": "November 20, 2026", "title": "A new member", "text": "Text.", "imp": 3,
             "cites": [{"t": "Press release", "u": "https://press.un.org/en/2026/ga1.doc.htm"}]}

    def claimed(self):
        task, _ = queue.enqueue("write_event", created_by="job:process")
        self.call("post", "tasks/claim", {"kinds": ["write_event"]}, as_="writer")
        return task

    def test_a_commit_time_conflict_is_a_retryable_409(self):
        task = self.claimed()
        body = {"result": {"decision": "written", "event": self.EVENT}}
        with mock.patch("agentapi.apply.apply", side_effect=IntegrityError('duplicate key value violates unique constraint "entry_sort_key_unique"')):
            r = self.call("post", f"tasks/{task.pk}/complete", body, as_="writer")
        self.assertEqual(r.status_code, 409)
        self.assertTrue(r.json()["retryable"])
        task.refresh_from_db()
        self.assertEqual((task.status, task.claimed_by), ("claimed", "agent:writer"))
        r = self.call("post", f"tasks/{task.pk}/complete", body, as_="writer")
        self.assertEqual(r.status_code, 200, r.content)
        n = Revision.objects.count()
        again = self.call("post", f"tasks/{task.pk}/complete", body, as_="writer")
        self.assertEqual((again.status_code, again.json()["replayed"]), (200, True))
        self.assertEqual(Revision.objects.count(), n, "nothing applied twice")
        diff = self.call("post", f"tasks/{task.pk}/complete", {"result": {"decision": "rejected", "note": "no"}}, as_="writer")
        self.assertEqual(diff.status_code, 409)


class ConcurrentAppendTests(TransactionTestCase):
    """Two writers appending an event at the same moment: each picks the last sort key and adds one after it. Before
    the order lock both picked the same key, and the deferred `entry_sort_key_unique` failed the second at COMMIT."""

    def setUp(self):
        import_content(small())

    def test_two_concurrent_appends_get_different_keys(self):
        branch = Event.objects.filter(status="published").first().branch.slug
        barrier, errors = threading.Barrier(2), []

        def write(slug):
            try:
                with revising(f"agent:{slug}", reason="concurrent append"):
                    barrier.wait(timeout=10)
                    services.save_event(slug, branch=branch, y=2026.5, when="July 1, 2026", title=slug, text="Text.", imp=3, status="review")
                    # Hold the transaction open a moment so the two overlap.
                    with connection.cursor() as c:
                        c.execute("SELECT pg_sleep(0.2)")
            except Exception as e:  # noqa: BLE001 — the assertion below reports it
                errors.append(e)
            finally:
                connection.close()

        threads = [threading.Thread(target=write, args=(s,)) for s in ("cc-one", "cc-two")]
        for t in threads:
            t.start()
        for t in threads:
            t.join(30)
        self.assertEqual(errors, [])
        keys = list(Entry.objects.filter(slug__in=["cc-one", "cc-two"]).values_list("sort_key", flat=True))
        self.assertEqual(len(set(keys)), 2)


class PreflightSkillTests(TestCase):
    def test_run_round_skill_checks_the_settings_before_anything_else(self):
        from django.conf import settings

        text = (settings.BASE_DIR / ".claude/skills/run-round/SKILL.md").read_text()
        first = text.index('"$HUMANITRIBUTARY_API/rounds/settings"')
        self.assertLess(first, text.index('"$HUMANITRIBUTARY_API/queue"'), "the settings before the queue")
        self.assertLess(first, text.index('-X POST "$HUMANITRIBUTARY_API/rounds"'), "the settings before a round is recorded")
        self.assertLess(first, text.index("## 4. Role agents"), "the settings before any agent starts")
        self.assertIn("**`paused` is set**", text[first:first + 600])
        for skill in ("drain-write-events", "fill-gaps", "verify-claims", "verify-stale-claims", "map-branch-entities", "review-branch-proposals"):
            body = (settings.BASE_DIR / f".claude/skills/{skill}/SKILL.md").read_text()
            self.assertIn("tasks/<id>/extend", body, skill)
        for skill in ("drain-write-events", "fill-gaps", "verify-claims", "verify-stale-claims", "map-branch-entities", "run-round"):
            body = (settings.BASE_DIR / f".claude/skills/{skill}/SKILL.md").read_text()
            self.assertIn("INGEST_USER_AGENT", body, skill)
            self.assertIn("No browser for source pages", body, skill)  # a person reads a browser_only page (ADR 0046)
            self.assertNotIn("one in-app browser tab", body, skill)


class SizeCeilingTests(TestCase):
    """ADR 0038: the ceilings are settings, by default 8 agents a role, 16 in all, 20 tasks an agent."""

    def size(self, agents, tasks):
        return {"agents": dict(zip(WR.ROLES, agents)), "tasks_per_agent": dict(zip(WR.ROLES, tasks))}

    def test_the_defaults(self):
        self.assertEqual((WR.MAX_AGENTS_PER_ROLE, WR.MAX_AGENTS, WR.MAX_TASKS_PER_AGENT), (8, 16, 20))

    def test_a_size_at_the_ceilings_is_accepted(self):
        size = self.size([8, 8, 0, 0], [20, 20, 1, 1])
        self.assertEqual(WR.validate_size(size), size)

    def test_a_size_over_a_ceiling_is_refused(self):
        for agents, tasks, words in (([9, 0, 0, 0], [1, 1, 1, 1], "0 to 8"), ([8, 8, 1, 0], [1, 1, 1, 1], "at most 16"),
                                     ([1, 0, 0, 0], [21, 1, 1, 1], "1 to 20")):
            with self.assertRaisesRegex(ValueError, words):
                WR.validate_size(self.size(agents, tasks))
