"""The agent API (docs/adr/0017-agent-api.md): tokens, scopes, leases over HTTP, schema-checked results applied
through the service layer into review, and the per-token rate limit."""

import json
from io import StringIO

from django.core.management import call_command
from django.test import TestCase, override_settings

from agentapi.auth import create_token, hash_token
from agentapi.models import AgentToken
from evidence.models import Claim, Evidence
from governance.models import BranchProposal
from ingest.models import BranchEntity
from publish.export import build_content
from publish.legacy import import_content
from revisions.models import Revision
from timeline.models import Event, Status
from work import queue
from work.models import AgentTask

from .fixtures import small

EVENT = {
    "id": "un-new-member", "branch": "un", "y": 2026.9, "when": "November 20, 2026", "title": "A new member state joins the UN",
    "text": "The General Assembly admitted a new member, according to the UN.", "imp": 3,
    "cites": [{"t": "Press release", "u": "https://press.un.org/en/2026/ga12345.doc.htm", "k": "primary", "excerpt": "The General Assembly today admitted"}],
    "geo": {"scope": "place", "lat": 40.749, "lon": -73.968, "r": 30, "label": "UN Headquarters, New York", "src": "https://en.wikipedia.org/wiki/Headquarters_of_the_United_Nations"},
}


class AgentApiTests(TestCase):
    def setUp(self):
        import_content(small())
        self.row, self.token = create_token("writer", ["write_event", "verify_claim"], created_by="human:owner")

    def call(self, method, path, body=None, token=None):
        headers = {"HTTP_AUTHORIZATION": f"Bearer {token or self.token}"} if token != "" else {}
        fn = getattr(self.client, method)
        if body is not None:
            return fn(f"/api/agent/{path}", data=json.dumps(body), content_type="application/json", **headers)
        return fn(f"/api/agent/{path}", **headers)

    def test_tokens_are_stored_hashed_and_checked(self):
        self.assertNotIn(self.token, json.dumps(list(AgentToken.objects.values()), default=str))
        self.assertEqual(AgentToken.objects.get(name="writer").token_hash, hash_token(self.token))
        self.assertEqual(self.call("get", "", token="").status_code, 401)
        self.assertEqual(self.call("get", "", token="hta_wrong").status_code, 401)
        r = self.call("get", "")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["agent"], "agent:writer")

    def test_write_event_lands_in_review_through_the_services(self):
        task, _ = queue.enqueue("write_event", created_by="job:process", payload={"items": []})
        r = self.call("post", "tasks/claim", {"kinds": ["write_event"]})
        self.assertEqual(r.json()["task"]["id"], task.pk)
        self.assertEqual(r.json()["task"]["claimed_by"], "agent:writer")
        r = self.call("post", f"tasks/{task.pk}/complete", {"result": {"decision": "written", "event": EVENT, "sources_read": [EVENT["cites"][0]["u"]]}})
        self.assertEqual(r.status_code, 200, r.content)
        ev = Event.objects.get(slug="un-new-member")
        self.assertEqual(ev.status, Status.REVIEW)
        claim = Claim.objects.get(entry__slug="un-new-member", field="as_written")
        e = Evidence.objects.get(claim=claim)
        self.assertEqual((e.checked_by, e.method, e.stance), ("agent:writer", "agent_read", "supports"))
        revs = Revision.objects.filter(task_id=task.pk)
        self.assertTrue(revs.exists())
        self.assertEqual(set(revs.values_list("actor", flat=True)), {"agent:writer"})
        task.refresh_from_db()
        self.assertEqual((task.status, task.result["entry"]), ("done", "un-new-member"))
        self.assertNotIn("un-new-member", [x["id"] for x in build_content()["events"]], "review entries are never published")

    def test_a_bad_result_is_refused_and_nothing_is_written(self):
        task, _ = queue.enqueue("write_event", created_by="job:process")
        self.call("post", "tasks/claim", {"kinds": ["write_event"]})
        r = self.call("post", f"tasks/{task.pk}/complete", {"result": {"decision": "written", "event": {**EVENT, "imp": 5}}})
        self.assertEqual(r.status_code, 422)
        self.assertTrue(any(p.startswith("event/imp") for p in r.json()["problems"]))
        r = self.call("post", f"tasks/{task.pk}/complete", {"result": {"decision": "written", "event": {**EVENT, "branch": "no-such-branch"}}})
        self.assertEqual(r.status_code, 422)
        self.assertIn("no branch", r.json()["error"])
        r = self.call("post", f"tasks/{task.pk}/complete", {"result": {"decision": "written", "event": {**EVENT, "cites": [{"t": "x", "u": "https://openstax.org/books/x"}]}}})
        self.assertEqual(r.status_code, 422)
        self.assertFalse(Event.objects.filter(slug="un-new-member").exists())
        task.refresh_from_db()
        self.assertEqual(task.status, "claimed", "still yours to fix and complete")

    def test_scopes_and_ownership(self):
        task, _ = queue.enqueue("review_branch_proposal", created_by="job:t")
        self.assertEqual(self.call("post", "tasks/claim", {"kinds": ["review_branch_proposal"]}).status_code, 403)
        self.assertEqual(self.call("post", f"tasks/{task.pk}/release").status_code, 409)
        _, other = create_token("other", ["write_event"], created_by="human:owner")
        mine, _ = queue.enqueue("write_event", created_by="job:t")
        self.call("post", "tasks/claim", {"kinds": ["write_event"]})
        self.assertEqual(self.call("post", f"tasks/{mine.pk}/complete", {"result": {"decision": "rejected", "note": "x"}}, token=other).status_code, 409)
        self.assertEqual(self.call("get", f"tasks/{mine.pk}", token=other).status_code, 403)

    def test_extend_release_fail(self):
        task, _ = queue.enqueue("verify_claim", created_by="job:t")
        self.call("post", "tasks/claim", {"kinds": ["verify_claim"], "lease_minutes": 5})
        self.assertEqual(self.call("post", f"tasks/{task.pk}/extend", {"minutes": 60}).status_code, 200)
        self.assertEqual(self.call("post", f"tasks/{task.pk}/release").json()["task"]["status"], "queued")
        self.call("post", "tasks/claim", {"kinds": ["verify_claim"]})
        r = self.call("post", f"tasks/{task.pk}/fail", {"error": "page gone", "retry": False})
        self.assertEqual(r.json()["task"]["status"], "failed")

    def test_verify_claim_records_evidence_on_a_part(self):
        record = Claim.objects.get(entry__slug="an-punic-wars", field="as_written")
        from revisions import revising
        from timeline.services import apply_changes

        with revising("job:test"):
            part = Claim(entry=record.entry, parent=record, field="date", key="")
            apply_changes(part, {"value": {"when": "264–146 BCE"}})
        task, _ = queue.enqueue("verify_claim", created_by="job:facts_sweep", target_claim=record, target_entry_id=record.entry_id)
        self.call("post", "tasks/claim", {"kinds": ["verify_claim"]})
        result = {"claim": record.pk, "evidence": [{"claim": part.pk, "url": "https://www.worldhistory.org/Punic_Wars/", "stance": "supports",
                                                   "excerpt": "The Punic Wars were fought between Rome and Carthage from 264 to 146 BCE."}]}
        r = self.call("post", f"tasks/{task.pk}/complete", {"result": result})
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(Evidence.objects.get(claim=part).checked_by, "agent:writer")
        self.assertEqual(r.json()["task"]["result"]["applied"]["recorded"], [Evidence.objects.get(claim=part).pk])
        # A new citation on the record claim itself is refused (the import owns that list).
        task2, _ = queue.enqueue("verify_claim", created_by="job:t", target_claim=record)
        self.call("post", "tasks/claim", {"kinds": ["verify_claim"]})
        r = self.call("post", f"tasks/{task2.pk}/complete", {"result": {"claim": record.pk, "evidence": [{"url": "https://www.worldhistory.org/x/", "stance": "supports"}]}})
        self.assertEqual(r.status_code, 422)

    def test_branch_proposals_and_entity_mapping(self):
        _, tok = create_token("reviewer", ["review_branch_proposal", "map_branch_entities"], created_by="human:owner")
        from timeline.models import Branch

        un = Branch.objects.get(slug="un")
        p = BranchProposal.objects.create(kind="end", branch=un, rule_id="END-STALE", summary="x", payload={"operations": [{"op": "patch", "id": "un", "fields": {"end_when": "TODO"}}]})
        task, _ = queue.enqueue("review_branch_proposal", created_by="job:branches_review", target_proposal=p, target_entry=un)
        self.call("post", "tasks/claim", {"kinds": ["review_branch_proposal"]}, token=tok)
        bad = {"decision": "accept", "proposal": p.pk, "note": "n", "operations": [{"op": "patch", "id": "un", "fields": {"end_when": "TODO"}}]}
        self.assertEqual(self.call("post", f"tasks/{task.pk}/complete", {"result": bad}, token=tok).status_code, 422)
        good = {"decision": "accept", "proposal": p.pk, "note": "It continues; text only.", "operations": [{"op": "patch", "id": "un", "fields": {"text": "An intergovernmental organization founded in 1945."}}]}
        r = self.call("post", f"tasks/{task.pk}/complete", {"result": good}, token=tok)
        self.assertEqual(r.status_code, 200, r.content)
        p.refresh_from_db()
        self.assertEqual((p.status, p.payload["accepted"]["by"]), ("accepted", "agent:reviewer"))
        self.assertEqual(Branch.objects.get(slug="un").text, "An intergovernmental organization founded after World War II.", "accepting changes nothing yet")

        t2, _ = queue.enqueue("map_branch_entities", created_by="job:seed_branch_entities", target_entry=un)
        self.call("post", "tasks/claim", {"kinds": ["map_branch_entities"]}, token=tok)
        r = self.call("post", f"tasks/{t2.pk}/complete", {"result": {"branch": "un", "entities": [{"qid": "Q1065", "role": "org", "label": "United Nations"}]}}, token=tok)
        self.assertEqual(r.status_code, 200, r.content)
        self.assertTrue(BranchEntity.objects.filter(branch=un, entity__qid="Q1065", created_by="agent:reviewer").exists())

    def test_reads(self):
        self.assertEqual(self.call("get", "entries/an-punic-wars").json()["title"], "Punic Wars")
        b = self.call("get", "branches/roman-republic").json()
        self.assertEqual(b["events"]["count"], 2)
        claim = Claim.objects.get(entry__slug="an-caesar-assassinated", field="as_written")
        c = self.call("get", f"claims/{claim.pk}").json()
        self.assertEqual(c["claim"]["status"], "corroborated")
        self.assertEqual(len(c["evidence"]), 3)
        hits = self.call("get", "search?q=Punic").json()["results"]
        self.assertEqual(hits[0]["id"], "an-punic-wars")
        self.assertEqual(self.call("get", "schemas/write_event").json()["required"], ["decision"])

    @override_settings(AGENT_API_RATE_PER_MINUTE=3)
    def test_rate_limit(self):
        codes = [self.call("get", "").status_code for _ in range(4)]
        self.assertEqual(codes, [200, 200, 200, 429])

    def test_agent_token_command(self):
        out = StringIO()
        call_command("agent_token", "create", "cli-agent", "--scope", "verify_claim", "--by", "human:owner", stdout=out)
        token = out.getvalue().split("\n")[1].strip()
        self.assertTrue(token.startswith("hta_"))
        self.assertEqual(self.call("get", "", token=token).json()["agent"], "agent:cli-agent")
        call_command("agent_token", "revoke", "cli-agent", stdout=StringIO())
        self.assertEqual(self.call("get", "", token=token).status_code, 401)
        self.assertFalse(AgentTask.objects.exists())
