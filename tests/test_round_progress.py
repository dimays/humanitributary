"""A round's live progress (docs/adr/0040-round-progress-from-a-task-link.md): a claim by a round's role token while
its round is open links the task to that round, other claims don't; a released or failed task keeps its round; the
per-kind counts (planned, claimed, in progress, done, failed, released) in `Round.as_json` and `GET rounds/<id>`;
and the console's live strip, kind-card line and round page, shown only while a round is open."""

from datetime import timedelta

from django.urls import reverse
from django.utils import timezone

from agentapi.auth import create_token
from work import queue
from work import rounds as WR
from work.models import AgentTask, Round

from .test_opsconsole_actions import ActionsBase
from .test_rounds import ApiBase


def a_round(status="running", mix=None, **kw) -> Round:
    return Round.objects.create(started_at=kw.pop("started_at", timezone.now() - timedelta(minutes=5)), trigger="schedule",
                                started_by="agent:round-recorder", status=status, plan={"mix": mix if mix is not None else {"write_event": 4}}, **kw)


def a_task(kind, status, rnd=None, *, stale=False, by="agent:round-writer") -> AgentTask:
    now = timezone.now()
    fields = {"kind": kind, "status": status, "created_by": "job:test", "round": rnd}
    if status == "claimed":
        fields.update(claimed_by=by, claimed_at=now, lease_until=now + timedelta(minutes=-1 if stale else 30), attempts=1)
    elif status == "done":
        fields.update(claimed_by=by, claimed_at=now, completed_at=now, attempts=1)
    elif status in ("failed", "cancelled"):
        fields.update(completed_at=now, attempts=1)
    return AgentTask.objects.create(**fields)


class LinkTests(ApiBase):
    def setUp(self):
        super().setUp()
        for name, scopes in {"round-writer": ["write_event"], "round-filler": ["fill_gap"], "round-writer-2": ["write_event"]}.items():
            self.tokens[name] = create_token(name, scopes, created_by="human:owner")[1]

    def claim(self, as_, kinds=("write_event",)):
        r = self.call("post", "tasks/claim", {"kinds": list(kinds)}, as_=as_)
        self.assertEqual(r.status_code, 200, r.content)
        return r.json()["task"]

    def test_a_round_tokens_claim_gets_the_open_round(self):
        rnd = a_round()
        for _ in range(3):
            queue.enqueue("write_event", created_by="job:process")
        queue.enqueue("fill_gap", created_by="job:gap_waves")
        t = self.claim("round-writer")
        self.assertEqual(t["round"], rnd.pk)
        self.assertEqual(AgentTask.objects.get(pk=t["id"]).round_id, rnd.pk)
        self.assertEqual(self.claim("round-filler", ["fill_gap"])["round"], rnd.pk)
        self.assertEqual(self.claim("round-writer-2")["round"], rnd.pk, "a rotated round token is still a round token")
        other = self.claim("writer")
        self.assertIsNone(other["round"], "an agent outside the round")
        self.assertIsNone(AgentTask.objects.get(pk=other["id"]).round_id)
        self.assertEqual(AgentTask.objects.filter(round=rnd).count(), 3)

    def test_other_tokens_and_closed_rounds_link_nothing(self):
        queue.enqueue("write_event", created_by="job:process", dedupe_key="a")
        self.assertIsNone(self.claim("round-writer")["round"], "no round is open")
        a_round(status="finished", finished_at=timezone.now())
        queue.enqueue("write_event", created_by="job:process", dedupe_key="b")
        self.assertIsNone(self.claim("round-writer")["round"], "the round is over")
        a_round(started_at=timezone.now() - timedelta(hours=WR.STALE_HOURS + 1))
        queue.enqueue("write_event", created_by="job:process", dedupe_key="c")
        self.assertIsNone(self.claim("round-writer")["round"], "an open round older than STALE_HOURS was interrupted")
        self.assertFalse(AgentTask.objects.filter(round__isnull=False).exists())

    def test_which_names_are_round_tokens(self):
        for actor in ("agent:round-writer", "agent:round-filler", "agent:round-verifier", "agent:round-mapper", "agent:round-mapper-3"):
            self.assertTrue(WR.is_round_agent(actor), actor)
        for actor in ("agent:writer", "agent:round-reviewer", "agent:round-recorder", "agent:round-publisher", "human:round-writer",
                      "agent:xround-writer", ""):
            self.assertFalse(WR.is_round_agent(actor), actor)

    def test_a_released_or_failed_task_keeps_its_round_until_another_claim(self):
        rnd = a_round()
        queue.enqueue("write_event", created_by="job:process", dedupe_key="a")
        t = self.claim("round-writer")
        self.assertEqual(self.call("post", f"tasks/{t['id']}/release", {}, as_="round-writer").status_code, 200)
        task = AgentTask.objects.get(pk=t["id"])
        self.assertEqual((task.status, task.round_id), ("queued", rnd.pk))
        self.claim("round-writer")
        queue.fail(t["id"], agent="agent:round-writer", error="no source", retry=False)
        task.refresh_from_db()
        self.assertEqual((task.status, task.round_id), ("failed", rnd.pk))
        # Back in the queue and taken by an agent outside the round: no longer the round's work.
        AgentTask.objects.filter(pk=t["id"]).update(status="queued", attempts=0)
        self.claim("writer")
        task.refresh_from_db()
        self.assertIsNone(task.round_id)

    def test_the_owners_cli_claim_links_nothing(self):
        a_round()
        queue.enqueue("write_event", created_by="job:process")
        self.assertIsNone(queue.next_task(agent="agent:round-writer", claim=True).round_id, "only the agent API links a claim")


class CountTests(ApiBase):
    def test_counts_per_kind(self):
        rnd = a_round(mix={"fill_gap": 4, "write_event": 3, "map_branch_entities": 2}, tasks={"fill_gap": {"completed": 1}})
        other = a_round(status="finished", finished_at=timezone.now(), started_at=timezone.now() - timedelta(days=1))
        for status in ("done", "done", "claimed", "failed", "queued"):
            a_task("fill_gap", status, rnd, by="agent:round-filler")
        a_task("fill_gap", "claimed", rnd, stale=True, by="agent:round-filler")
        a_task("write_event", "done", rnd)
        a_task("write_event", "cancelled", rnd)
        a_task("verify_claim", "done", rnd, by="agent:round-verifier")  # claimed, though the plan had none
        a_task("write_event", "done", other)        # another round's
        a_task("write_event", "done", None)         # no round's
        a_task("write_event", "queued", None)
        want = {
            "fill_gap": {"planned": 4, "claimed": 6, "in_progress": 2, "stuck": 1, "done": 2, "failed": 1, "released": 1},
            "write_event": {"planned": 3, "claimed": 2, "in_progress": 0, "stuck": 0, "done": 1, "failed": 0, "released": 1},
            "map_branch_entities": {"planned": 2, "claimed": 0, "in_progress": 0, "stuck": 0, "done": 0, "failed": 0, "released": 0},
            "verify_claim": {"planned": 0, "claimed": 1, "in_progress": 0, "stuck": 0, "done": 1, "failed": 0, "released": 0},
        }
        got = WR.progress(rnd)
        self.assertEqual(got, want)
        self.assertEqual(list(got), ["fill_gap", "write_event", "map_branch_entities", "verify_claim"], "the plan's order, then the rest")
        d = self.call("get", f"rounds/{rnd.pk}", as_="writer").json()["round"]
        self.assertEqual(d["tasks"], want)
        self.assertEqual(d["tasks_reported"], {"fill_gap": {"completed": 1}}, "what the routine PATCHed is kept beside the counts")
        self.assertEqual(WR.progress(other)["write_event"]["done"], 1)

    def test_a_bad_mix_counts_as_zero_planned(self):
        rnd = a_round(mix={"fill_gap": "lots", "write_event": -2})
        self.assertEqual({k: v["planned"] for k, v in WR.progress(rnd).items()}, {"fill_gap": 0, "write_event": 0})


class StripTests(ActionsBase):
    def test_the_strip_shows_an_open_rounds_batch(self):
        rnd = a_round(mix={"fill_gap": 4, "write_event": 2})
        for status in ("done", "done", "claimed", "failed"):
            a_task("fill_gap", status, rnd, by="agent:round-filler")
        a_task("write_event", "queued", rnd)
        a_task("fill_gap", "queued", None)
        r = self.client.get(reverse("opsconsole:work"))
        self.assertContains(r, 'class="card rlive"')
        self.assertContains(r, f"Round #{rnd.pk}")
        self.assertContains(r, "Stage: <b>Agents</b>")
        self.assertContains(r, "running for")
        self.assertContains(r, "2/4 done · 1 in progress · <span class=\"bad\">1 failed</span>")
        self.assertContains(r, "0/2 done · 1 released")
        self.assertContains(r, "in this round: <b>4</b> planned / <b>2</b> done")
        self.assertContains(r, "Reload every 20 s", msg_prefix="the page refreshes itself while a round is open")
        d = self.client.get(reverse("opsconsole:round", args=[rnd.pk]))
        self.assertContains(d, "2/4 done")
        self.assertContains(d, "Its tasks")
        self.assertContains(d, "agent:round-filler")
        self.assertContains(d, "Handed back")
        self.assertContains(d, "Reload every 20 s")

    def test_no_strip_when_no_round_is_open(self):
        rnd = a_round(status="published", finished_at=timezone.now())
        a_task("write_event", "done", rnd)
        r = self.client.get(reverse("opsconsole:work"))
        self.assertNotContains(r, 'class="card rlive"')
        self.assertNotContains(r, "in this round:")
        self.assertNotContains(r, "Reload every")
        self.assertContains(r, "Daily agent round", msg_prefix="the round bar stays")
        d = self.client.get(reverse("opsconsole:round", args=[rnd.pk]))
        self.assertContains(d, "1/4 done", msg_prefix="a finished round's page keeps its bars")
        self.assertNotContains(d, "Reload every")
        self.assertNotContains(d, "Stage:")
