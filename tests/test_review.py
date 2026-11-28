"""The owner's review queue at /ops/review/ (docs/adr/0046-the-owners-review-queue.md): what it lists and counts, each
decision for each kind of item, the audit rows, the backlog (hidden from the count, the health counts and the agents,
and brought back), the filter for items agents can do and the owner's lease on them, and who may decide."""

import json
import uuid
from datetime import timedelta

from django.contrib.auth.models import Permission, User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from agentapi.operations import queue_summary
from evidence.models import Claim, Evidence
from infra.health import queue as health_queue
from opsconsole import actions as acts
from opsconsole import queries as Q
from opsconsole import review as RV
from opsconsole.models import OpsAction
from publish.legacy import import_content
from revisions import revising
from revisions.models import Revision
from timeline import services
from timeline.models import Entry
from work import queue
from work import rounds as WR
from work.models import AgentTask

from .fixtures import small
from .runner import FreshStorage

BRITANNICA = "https://www.britannica.com/story/beware-the-ides-of-march"
WIKI = "https://en.wikipedia.org/wiki/Assassination_of_Julius_Caesar"


class ReviewBase(FreshStorage, TestCase):
    @classmethod
    def setUpTestData(cls):
        import_content(small())
        cls.staff = User.objects.create_user("viewer", password="x", is_staff=True)
        cls.op = User.objects.create_user("op", password="x", is_staff=True)
        cls.op.user_permissions.add(Permission.objects.get(codename="ops_operator", content_type__app_label="opsconsole"))
        record = Claim.objects.get(entry__slug="an-caesar-assassinated", field="as_written", key="")
        with revising("job:test", reason="an atomic part to verify"):
            cls.date_claim = Claim(entry=record.entry, parent=record, field="date", key="")
            services.apply_changes(cls.date_claim, {"value": {"when": "15 March 44 BCE", "y": -44}})

    def setUp(self):
        super().setUp()
        self.client.force_login(self.op)

    # ── helpers ──

    def needs_task(self, kind="verify_claim", reason=f"{BRITANNICA}: browser_only", needs="browser", **kw):
        """A task an agent claimed and released because it needs a person."""
        if kind == "verify_claim":
            kw.setdefault("target_claim", self.date_claim)
            kw.setdefault("target_entry_id", self.date_claim.entry_id)
            kw.setdefault("payload", {"claim": {"id": self.date_claim.pk, "field": "date", "key": ""}, "reason": "no_second_source"})
        elif kind == "fill_gap":
            kw.setdefault("payload", {"branch": {"id": "roman-republic", "name": "Roman Republic"}, "window": {"from": -60, "to": -40, "label": "60–40 BCE"}})
        t, _ = queue.enqueue(kind, created_by="job:test", dedupe_key=uuid.uuid4().hex, **kw)
        AgentTask.objects.filter(pk=t.pk).update(status="claimed", claimed_by="agent:a", claimed_at=timezone.now(),
                                                 lease_until=timezone.now() + timedelta(hours=1), attempts=1)
        return queue.release(t.pk, agent="agent:a", reason=reason, needs=needs)

    def agent_task(self, priority=0):
        t, _ = queue.enqueue("verify_claim", created_by="job:test", dedupe_key=uuid.uuid4().hex, priority=priority, target_claim=self.date_claim,
                             target_entry_id=self.date_claim.entry_id, payload={"claim": {"id": self.date_claim.pk}})
        return t

    def to_review(self, slug):
        with revising("agent:writer", reason="a draft"):
            services.set_status(slug, "review")

    def decide(self, decision, item, *, json_reply=True, **data):
        h = {"HTTP_ACCEPT": "application/json"} if json_reply else {}
        return self.client.post(reverse("opsconsole:review_decide"), {"decision": decision, "item": item, "key": data.pop("key", uuid.uuid4().hex), **data}, **h)

    def ok(self, r):
        self.assertEqual(r.status_code, 200, r.content[:1000])
        body = json.loads(r.content)
        self.assertTrue(body["ok"], body)
        return OpsAction.objects.get(pk=body["action"])

    def page(self, **params):
        r = self.client.get(reverse("opsconsole:review"), params)
        self.assertEqual(r.status_code, 200)
        return r


class ListTests(ReviewBase):
    def test_the_queue_its_kinds_oldest_first_and_the_count(self):
        claim = self.needs_task()
        gap = self.needs_task("fill_gap", reason="https://www.un.org/en/about-us/history-of-the-un: browser_only")
        self.needs_task("write_event", needs="owner", reason="an owner's call")  # write_event needs owner: not this page's
        self.to_review("un-charter")  # cites un.org only (browser_only)
        AgentTask.objects.filter(pk=gap.pk).update(payload={**gap.payload, "needs": {**gap.payload["needs"], "at": "2000-01-01T00:00:00+00:00"}})
        keys = [i.key for i in RV.items(timezone.now())]
        self.assertEqual(keys[0], f"task-{gap.pk}", "oldest first")
        self.assertEqual(set(keys), {f"task-{claim.pk}", f"task-{gap.pk}", "draft-un-charter"})
        self.assertEqual(RV.count(), 3)
        r = self.page()
        self.assertContains(r, '<b class="nav-n"')
        self.assertContains(r, ">3</b>")
        r = self.page(item=f"task-{claim.pk}")
        self.assertContains(r, f'<a href="{BRITANNICA}" target="_blank" rel="noopener">')
        self.assertContains(r, "browser_only")
        self.assertContains(r, "15 March 44 BCE")
        self.assertContains(r, "agent:a")
        r = self.page(item="draft-un-charter")
        self.assertContains(r, "UN Charter signed")
        self.assertContains(r, 'href="https://www.un.org/en/about-us/un-charter" target="_blank" rel="noopener"')
        self.assertContains(self.client.get(reverse("opsconsole:dashboard")), "Review: 3 waiting for you")

    def test_a_draft_with_a_readable_source_or_a_persons_read_is_not_listed(self):
        self.to_review("an-punic-wars")  # Wikipedia only: not waiting for a person's read
        self.assertFalse(WR.owner_read_drafts().filter(slug="an-punic-wars").exists())
        self.to_review("un-charter")
        self.assertTrue(WR.owner_read_drafts().filter(slug="un-charter").exists())
        ev = Evidence.objects.get(claim__entry__slug="un-charter", claim__field="as_written", claim__key="")
        with revising("human:op", reason="read it"):
            services.apply_changes(ev, {"checked_by": "human:op", "method": "browser_read"})
        self.assertFalse(WR.owner_read_drafts().filter(slug="un-charter").exists(), "a person read it already")

    def test_the_filter_is_off_by_default_and_lists_agent_work_in_queue_order(self):
        low, high = self.agent_task(priority=1), self.agent_task(priority=9)
        r = self.page()
        self.assertNotContains(r, f"task-{low.pk}")
        self.assertNotContains(r, "Agents can do these")
        keys = [i.key for i in RV.items(timezone.now(), agents=True) if i.kind == "agent"]
        self.assertEqual(keys, [f"task-{high.pk}", f"task-{low.pk}"], "the agents' order: priority, then age")
        self.assertEqual(queue.next_task(agent="agent:x").pk, high.pk)
        r = self.page(agents="1")
        self.assertContains(r, "Agents can do these")
        self.assertContains(r, f"task-{low.pk}")
        self.assertEqual(RV.count(), 0, "agent-workable items are not in the count")


class ClaimDecisionTests(ReviewBase):
    def test_approve_writes_human_evidence_recomputes_the_claim_and_completes_the_task(self):
        t = self.needs_task()
        self.assertEqual(self.date_claim.status, "unverified")
        a = self.ok(self.decide("approve", f"task-{t.pk}", url=BRITANNICA, excerpt="Caesar was stabbed", note="read on Britannica"))
        ev = Evidence.objects.get(claim=self.date_claim, citation__url=BRITANNICA)
        self.assertEqual((ev.stance, ev.checked_by, ev.method, ev.excerpt), ("supports", "human:op", "browser_read", "Caesar was stabbed"))
        self.date_claim.refresh_from_db()
        self.assertEqual(self.date_claim.status, "single_source")
        self.assertGreater(self.date_claim.confidence, 0)
        t.refresh_from_db()
        self.assertEqual((t.status, t.claimed_by, t.result["decision"], t.result["by"]), ("done", "human:op", "approve", "human:op"))
        self.assertTrue(Revision.objects.filter(table_name="evidence_evidence", actor="human:op", task_id=t.pk).exists())
        # The audit row: actor, item, decision, note, time.
        self.assertEqual((a.kind, a.requested_by, a.target, a.status, a.runs_in), ("review_approve", "human:op", f"task-{t.pk}", "done", "request"))
        self.assertEqual((a.params["decision"], a.params["note"], a.params["url"], a.reason), ("approve", "read on Britannica", BRITANNICA, "read on Britannica"))
        self.assertIsNotNone(a.finished_at)

    def test_deny_records_no_support_or_a_conflict(self):
        t = self.needs_task()
        a = self.ok(self.decide("deny", f"task-{t.pk}", url=BRITANNICA))
        self.assertEqual(a.reason, acts.REVIEW_DEFAULT_REASON["deny"], "no note: the default reason")
        ev = Evidence.objects.get(claim=self.date_claim, citation__url=BRITANNICA)
        self.assertEqual((ev.stance, ev.checked_by), ("unrelated", "human:op"))
        self.date_claim.refresh_from_db()
        self.assertEqual(self.date_claim.status, "unverified")
        t.refresh_from_db()
        self.assertEqual((t.status, t.result["decision"]), ("done", "deny"))
        t2 = self.needs_task()
        self.ok(self.decide("deny", f"task-{t2.pk}", url=BRITANNICA, contradicts="1", note="it says 45 BCE"))
        ev.refresh_from_db()
        self.assertEqual(ev.stance, "conflicts")
        self.date_claim.refresh_from_db()
        self.assertEqual(self.date_claim.status, "contested")

    def test_a_decision_needs_a_known_page_and_a_short_excerpt(self):
        t = self.needs_task(reason=f"{WIKI}: blocked")
        r = self.decide("approve", f"task-{t.pk}", url="https://example.org/other")
        self.assertEqual(r.status_code, 409)
        self.assertIn("not one of this claim's pages", json.loads(r.content)["message"])
        r = self.decide("approve", f"task-{t.pk}", url=WIKI, excerpt=" ".join(["word"] * 26))
        self.assertEqual(r.status_code, 409)
        self.assertFalse(OpsAction.objects.filter(kind__startswith="review_").exists(), "a refused decision writes no action")
        t.refresh_from_db()
        self.assertEqual(t.status, "queued")


class DraftDecisionTests(ReviewBase):
    def test_approve_publishes_through_the_edit_file_path(self):
        self.to_review("un-charter")
        a = self.ok(self.decide("approve", "draft-un-charter", note="read the Charter page"))
        self.assertEqual(Entry.objects.get(slug="un-charter").status, "published")
        self.assertEqual(a.result["status"], "published")
        self.assertEqual(a.result["ops"], {"add_evidence": 1, "approve": 1})
        ev = Evidence.objects.get(claim__entry__slug="un-charter", claim__field="as_written", claim__key="")
        self.assertEqual((ev.checked_by, ev.method), ("human:op", "browser_read"))
        revs = Revision.objects.filter(reason__startswith=f"apply_edits ops-review-{a.pk}.edits.json")
        self.assertTrue(revs.filter(table_name="timeline_entry").exists(), "the status change, under the review's file name")
        self.assertEqual(set(revs.values_list("actor", flat=True)), {"human:op"})
        self.assertEqual(RV.count(), 0)

    def test_deny_rejects(self):
        self.to_review("un-charter")
        self.ok(self.decide("deny", "draft-un-charter", note="the page says nothing of it"))
        self.assertEqual(Entry.objects.get(slug="un-charter").status, "retracted")


class TaskDecisionTests(ReviewBase):
    def test_approve_hands_the_task_back_with_a_readable_source_or_a_summary(self):
        t = self.needs_task("fill_gap")
        r = self.decide("approve", f"task-{t.pk}")
        self.assertEqual(r.status_code, 409, "approve needs a page or a summary")
        r = self.decide("approve", f"task-{t.pk}", source="https://www.britannica.com/place/Rome")
        self.assertEqual(r.status_code, 409)
        self.assertIn("agents may not read", json.loads(r.content)["message"])
        a = self.ok(self.decide("approve", f"task-{t.pk}", source="https://en.wikipedia.org/wiki/Roman_Republic", note="covers 50 BCE"))
        t.refresh_from_db()
        self.assertEqual((t.status, t.not_before, "needs" in t.payload), ("queued", None, False))
        self.assertEqual((t.payload["owner_read"]["source"], t.payload["owner_read"]["summary"], t.payload["owner_read"]["action"]),
                         ("https://en.wikipedia.org/wiki/Roman_Republic", "covers 50 BCE", a.pk))
        self.assertIn("owner_read", queue.PAYLOAD_KEYS, "the jobs that refresh a payload keep it")
        self.assertEqual(queue.next_task(agent="agent:filler", kinds=["fill_gap"]).pk, t.pk, "back with the agents")
        t2 = self.needs_task("fill_gap")
        self.ok(self.decide("approve", f"task-{t2.pk}", note="The page says the senate met in March."))
        t2.refresh_from_db()
        self.assertEqual((t2.payload["owner_read"]["source"], t2.payload["owner_read"]["summary"]), (None, "The page says the senate met in March."))

    def test_deny_cancels(self):
        t = self.needs_task("write_event")
        self.ok(self.decide("deny", f"task-{t.pk}", note="not notable"))
        t.refresh_from_db()
        self.assertEqual(t.status, "cancelled")
        self.assertIn("human:op: cancelled (was queued): not notable", t.error)


class BacklogTests(ReviewBase):
    def test_defer_hides_an_item_and_restore_brings_it_back(self):
        t = self.needs_task()
        self.to_review("un-charter")
        self.assertEqual(RV.count(), 2)
        self.ok(self.decide("defer", f"task-{t.pk}", note="later"))
        self.ok(self.decide("defer", "draft-un-charter"))
        self.assertEqual(RV.count(), 0, "out of the count and the badge")
        self.assertNotContains(self.page(), '<b class="nav-n"')
        self.assertEqual({i.key for i in RV.items(timezone.now(), backlog=True)}, {f"task-{t.pk}", "draft-un-charter"})
        r = self.page(tab="backlog", item=f"task-{t.pk}")
        self.assertContains(r, "Bring back")
        self.assertContains(r, "later")
        # Out of the health counts and the Work counts, and never offered to an agent, even long after not_before.
        AgentTask.objects.filter(pk=t.pk).update(not_before=timezone.now() - timedelta(days=30))
        self.assertNotIn("verify_claim", health_queue()["queued"])
        self.assertEqual(next(k for k in Q.queue(timezone.now()) if k["kind"] == "verify_claim")["waiting"], 0)
        self.assertEqual(Q.kind_counts("verify_claim", timezone.now())["waiting"], 0)
        self.assertIsNone(queue.next_task(agent="agent:b", claim=True))
        self.assertNotIn("un-charter", list(WR.held_drafts()))
        # A deferred item takes no decision but restore.
        self.assertEqual(self.decide("approve", f"task-{t.pk}", url=BRITANNICA).status_code, 409)
        self.ok(self.decide("restore", f"task-{t.pk}"))
        self.ok(self.decide("restore", "draft-un-charter"))
        self.assertEqual(RV.count(), 2)
        t.refresh_from_db()
        self.assertEqual(t.payload["needs"]["kind"], "browser", "back in review, still waiting for a person")
        self.assertNotIn("backlog", t.payload["needs"])

    def test_an_agent_workable_item_deferred_leaves_the_agents_queue_and_comes_back_to_it(self):
        t = self.agent_task()
        self.ok(self.decide("defer", f"task-{t.pk}"))
        self.assertIsNone(queue.next_task(agent="agent:b", claim=True))
        self.assertEqual(RV.count(), 0)
        self.assertEqual([i.key for i in RV.items(timezone.now(), backlog=True)], [f"task-{t.pk}"])
        self.ok(self.decide("restore", f"task-{t.pk}"))
        t.refresh_from_db()
        self.assertNotIn("needs", t.payload)
        self.assertEqual(queue.next_task(agent="agent:b", claim=True).pk, t.pk)


class AgentsTests(ReviewBase):
    def test_needs_tasks_are_never_offered_to_agents(self):
        t = self.needs_task()
        AgentTask.objects.filter(pk=t.pk).update(not_before=timezone.now() - timedelta(days=8))
        self.assertIsNone(queue.next_task(agent="agent:b", claim=True), "a week later it still waits for the owner")
        out = queue_summary(timezone.now())
        self.assertEqual(out["owner_review"], {"waiting": 1, "path": "/ops/review/"})

    def test_a_held_draft_waiting_for_the_owner_is_not_carried_over_to_agents(self):
        self.to_review("un-charter")
        with revising("agent:reviewer", reason="apply_edits r.edits.json #0 edit un-charter: Round #1 review §1: HOLD; only un.org"):
            services.save_event("un-charter", text="Fifty nations signed the Charter in San Francisco.")
        self.assertNotIn("un-charter", list(WR.held_drafts()))
        self.assertNotIn("un-charter", queue_summary(timezone.now())["review"]["held"])
        self.assertIn("HOLD; only un.org", self.page(item="draft-un-charter").content.decode())

    def test_the_owners_lease_blocks_an_agents_claim_and_leaving_releases_it(self):
        t, other = self.agent_task(priority=5), self.agent_task(priority=1)
        r = self.client.post(reverse("opsconsole:review_hold"), {"task": t.pk}, HTTP_ACCEPT="application/json")
        self.assertTrue(json.loads(r.content)["held"])
        t.refresh_from_db()
        self.assertEqual((t.status, t.claimed_by, t.attempts), ("claimed", "human:op", 0))
        self.assertEqual(queue.next_task(agent="agent:b", claim=True).pk, other.pk, "the agent gets the next one, not the owner's")
        queue.release(other.pk, agent="agent:b", defer_minutes=0)
        # Opening another item hands the first back: one at a time.
        self.client.post(reverse("opsconsole:review_hold"), {"task": other.pk}, HTTP_ACCEPT="application/json")
        t.refresh_from_db()
        self.assertEqual((t.status, t.claimed_by), ("queued", ""))
        # Leaving the page without deciding hands it back (the page's beacon).
        r = self.client.post(reverse("opsconsole:review_let_go"), {"task": other.pk, "beacon": "1"})
        self.assertTrue(json.loads(r.content)["released"])
        other.refresh_from_db()
        self.assertEqual((other.status, other.claimed_by, other.lease_until), ("queued", "", None))
        self.assertIsNotNone(queue.next_task(agent="agent:b", claim=True))

    def test_a_task_an_agent_holds_is_shown_and_cannot_be_decided(self):
        t = self.agent_task()
        queue.next_task(agent="agent:verifier", claim=True)
        r = self.page(agents="1", item=f"task-{t.pk}")
        self.assertContains(r, "agent:verifier holds this task now")
        self.assertContains(r, 'value="approve" data-undo="1" disabled')
        r = self.client.post(reverse("opsconsole:review_hold"), {"task": t.pk}, HTTP_ACCEPT="application/json")
        self.assertEqual(json.loads(r.content)["holder"], "agent:verifier")
        r = self.decide("approve", f"task-{t.pk}", url=BRITANNICA)
        self.assertEqual(r.status_code, 409)
        self.assertIn("agent:verifier holds", json.loads(r.content)["message"])

    def test_approve_on_an_agent_workable_item_takes_and_completes_it(self):
        t = self.agent_task()
        self.ok(self.decide("approve", f"task-{t.pk}", url=WIKI))
        t.refresh_from_db()
        self.assertEqual((t.status, t.claimed_by), ("done", "human:op"))
        self.assertEqual(Evidence.objects.get(claim=self.date_claim, citation__url=WIKI).checked_by, "human:op")


class FrameworkTests(ReviewBase):
    def test_permissions(self):
        t = self.needs_task()
        self.client.force_login(self.staff)
        r = self.page(item=f"task-{t.pk}")
        self.assertNotContains(r, 'id="rv-form"')
        self.assertContains(r, "needs the opsconsole.ops_operator permission")
        for name, data in (("review_decide", {"decision": "approve", "item": f"task-{t.pk}", "key": "k", "url": BRITANNICA}),
                           ("review_hold", {"task": t.pk}), ("review_let_go", {"task": t.pk})):
            self.assertEqual(self.client.post(reverse(f"opsconsole:{name}"), data).status_code, 403, name)
        self.client.logout()
        self.assertEqual(self.client.get(reverse("opsconsole:review")).status_code, 302)
        self.assertEqual(self.client.post(reverse("opsconsole:review_decide"), {"decision": "defer"}).status_code, 302)
        t.refresh_from_db()
        self.assertEqual(t.status, "queued")
        self.assertFalse(OpsAction.objects.exists())

    def test_one_key_acts_once_and_the_plain_form_redirects(self):
        t = self.needs_task()
        a = self.ok(self.decide("defer", f"task-{t.pk}", key="same-key"))
        again = self.decide("defer", f"task-{t.pk}", key="same-key")
        self.assertEqual(json.loads(again.content)["action"], a.pk)
        self.assertEqual(OpsAction.objects.filter(kind="review_defer").count(), 1)
        r = self.decide("restore", f"task-{t.pk}", json_reply=False)
        self.assertEqual(r.status_code, 303)
        self.assertIn("done=", r["Location"])
        r = self.decide("restore", f"task-{t.pk}", json_reply=False)
        self.assertEqual(r.status_code, 303)
        self.assertIn("error=", r["Location"])

    def test_review_decisions_have_their_own_rate_limit(self):
        now = timezone.now()
        for i in range(acts.RATE_LIMIT):
            OpsAction.objects.create(kind="review_defer", target=f"task-{i}", reason="x", requested_by="human:op", idempotency_key=f"k{i}", runs_in="request", status="done")
        self.assertEqual(acts.rate_refusal("human:op", now=now), "", "review decisions don't use up the other actions' limit")
        self.assertEqual(acts.review_rate_refusal("human:op", now=now), "")
        self.assertEqual(self.client.post(reverse("opsconsole:act", args=["review_approve"]), {}).status_code, 404, "not through the two-step door")
