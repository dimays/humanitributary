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
        self.assertEqual(self.call("post", f"tasks/{task.pk}/release", {"defer_minutes": 0}).json()["task"]["status"], "queued")
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


class DeferredReleaseApiTests(TestCase):
    """POST tasks/<id>/release takes {"reason", "defer_minutes", "needs"} and defers the task (ADR 0042)."""

    def setUp(self):
        _, self.token = create_token("verifier", ["verify_claim"], created_by="human:owner")

    def post(self, path, body=None):
        kw = {"data": json.dumps(body), "content_type": "application/json"} if body is not None else {}
        return self.client.post(f"/api/agent/{path}", HTTP_AUTHORIZATION=f"Bearer {self.token}", **kw)

    def claimed(self, **kw):
        task, _ = queue.enqueue("verify_claim", created_by="job:t", **kw)
        self.assertEqual(self.post("tasks/claim", {"kinds": ["verify_claim"]}).json()["task"]["id"], task.pk)
        return task

    def test_a_bare_post_defers_an_hour_and_the_next_claim_skips_it(self):
        from django.utils import timezone
        task = self.claimed()
        r = self.post(f"tasks/{task.pk}/release")
        self.assertEqual(r.status_code, 200, r.content)
        task.refresh_from_db()
        self.assertAlmostEqual((task.not_before - timezone.now()).total_seconds(), 3600, delta=10)
        self.assertEqual(r.json()["task"]["not_before"], task.not_before.isoformat())
        self.assertIsNone(self.post("tasks/claim", {"kinds": ["verify_claim"]}).json()["task"], "no loop on the same task")

    def test_a_reason_and_needs(self):
        task = self.claimed()
        r = self.post(f"tasks/{task.pk}/release", {"needs": "browser", "reason": "https://www.nbcnews.com/x: citation_only"})
        self.assertEqual(r.status_code, 200, r.content)
        task.refresh_from_db()
        self.assertEqual((task.payload["needs"]["kind"], task.payload["needs"]["by"]), ("browser", "agent:verifier"))
        self.assertIn("agent:verifier: released, needs browser: https://www.nbcnews.com/x: citation_only (deferred until", task.error)
        self.assertGreater((task.not_before - task.created_at).days, 6)

    def test_bad_bodies_are_400_and_the_task_stays_yours(self):
        task = self.claimed()
        for body in ({"defer_minutes": -5}, {"defer_minutes": 10081}, {"defer_minutes": "60"}, {"defer_minutes": True},
                     {"needs": "a nap", "reason": "x"}, {"needs": "browser"}, {"reason": 7}):
            self.assertEqual(self.post(f"tasks/{task.pk}/release", body).status_code, 400, body)
        task.refresh_from_db()
        self.assertEqual(task.status, "claimed")
        self.assertEqual(self.post(f"tasks/{task.pk}/release", {"defer_minutes": 0, "reason": "try again"}).status_code, 200)
        self.assertEqual(self.post("tasks/claim", {"kinds": ["verify_claim"]}).json()["task"]["id"], task.pk, "defer_minutes 0: offered at once")


class FetchPolicyApiTests(TestCase):
    """GET policy?url=: may an agent's own script fetch a page (ADR 0042)? One case per fetch policy, an unrated
    domain, a robots.txt that shuts out AI crawlers, and api_only inside and outside its API base."""

    def setUp(self):
        from evidence.models import Publisher
        from revisions import revising

        _, self.token = create_token("reader", ["review"], created_by="human:owner")  # any scope may ask
        rows = [
            ("rated.example.org", dict(name="Rated", tier=2, fetch_policy="allowed")),
            ("unrated-row.example.org", dict(name="Unrated row", tier=None, fetch_policy="allowed")),
            ("un.org", dict(name="United Nations", tier=1, fetch_policy="browser_only")),
            ("nbcnews.com", dict(name="NBC News", tier=None, fetch_policy="citation_only")),
            ("openstax.org", dict(name="OpenStax", tier=None, fetch_policy="forbidden")),
            ("loc.gov", dict(name="Library of Congress", tier=1, fetch_policy="api_only", api_base="https://www.loc.gov/ ?fo=json")),
            ("keyed.example.org", dict(name="Keyed", tier=2, fetch_policy="api_only", api_base="https://api.keyed.example.org/v1/",
                                       api_needs_key=True, api_key_setting="KEYED_API_KEY")),
            ("blocks-ai.example.org", dict(name="Blocks AI", tier=2, fetch_policy="allowed")),
        ]
        with revising("human:test", reason="policy endpoint fixtures"):
            for domain, values in rows:
                Publisher.objects.update_or_create(domain=domain, defaults=values)

    def ask(self, url, token=None):
        from urllib.parse import quote

        return self.client.get(f"/api/agent/policy?url={quote(url, safe='')}", HTTP_AUTHORIZATION=f"Bearer {token or self.token}")

    def verdict(self, url):
        r = self.ask(url)
        self.assertEqual(r.status_code, 200, r.content)
        return r.json()

    def test_allowed_and_rated(self):
        v = self.verdict("https://www.rated.example.org/page")
        self.assertEqual((v["policy"], v["may_fetch"], v["publisher"]["domain"]), ("allowed", True, "rated.example.org"))
        self.assertEqual(v["crawl_delay"], 1.0)
        w = self.verdict("https://en.wikipedia.org/wiki/Punic_Wars")
        self.assertEqual((w["policy"], w["may_fetch"]), ("allowed", True))

    def test_browser_only(self):
        v = self.verdict("https://www.un.org/en/about-us")
        self.assertEqual((v["policy"], v["may_fetch"], v["browser_read"]), ("browser_only", False, True))
        self.assertIn("browser", v["why"])
        self.assertIn("no script, no in-app browser, no Claude in Chrome", v["why"], "a person's read only (ADR 0046)")
        self.assertIn("needs: browser", v["why"])
        self.assertEqual(self.verdict("https://news.un.org/en/story/1")["policy"], "browser_only", "a subdomain is its parent's")

    def test_citation_only(self):
        v = self.verdict("https://www.nbcnews.com/news/world/story")
        self.assertEqual((v["policy"], v["may_fetch"]), ("citation_only", False))
        self.assertIn("never fetch", v["why"])

    def test_forbidden(self):
        v = self.verdict("https://openstax.org/books/world-history/pages/1")
        self.assertEqual((v["policy"], v["may_fetch"], v["browser_read"]), ("forbidden", False, False))

    def test_never_fetch(self):
        v = self.verdict("https://www.theguardian.com/world/2026/nov/27/story")  # no row: NEVER_FETCH decides
        self.assertEqual((v["policy"], v["may_fetch"], v["publisher"]), ("never_fetch", False, None))

    def test_unrated(self):
        for url in ("https://nobody-rated-this.example.net/a", "https://unrated-row.example.org/b"):
            v = self.verdict(url)
            self.assertEqual((v["policy"], v["may_fetch"]), ("unrated", False), url)
            self.assertIn("no rating", v["why"])

    def test_api_only_inside_and_outside_its_base(self):
        inside = self.verdict("https://www.loc.gov/item/2020123456/?fo=json")
        self.assertEqual((inside["policy"], inside["may_fetch"], inside["api_base"]), ("api_only", True, "https://www.loc.gov/ ?fo=json"))
        outside = self.verdict("https://www.loc.gov/item/2020123456/")
        self.assertEqual((outside["policy"], outside["may_fetch"]), ("api_only", False))
        self.assertIn("https://www.loc.gov/ ?fo=json", outside["why"])
        keyed = self.verdict("https://api.keyed.example.org/v1/records/1")
        self.assertEqual((keyed["policy"], keyed["may_fetch"]), ("api_only", False))
        self.assertIn("needs a key", keyed["why"])
        with override_settings(KEYED_API_KEY="k" * 20):
            self.assertTrue(self.verdict("https://api.keyed.example.org/v1/records/1")["may_fetch"])

    def test_ai_blocked(self):
        from datetime import timedelta

        from django.utils import timezone

        from ingest.models import PrefetchedPage

        now = timezone.now()
        PrefetchedPage.objects.create(url="https://blocks-ai.example.org/old", fetched_url="https://blocks-ai.example.org/old", host="blocks-ai.example.org",
                                      status="stored", text_key="pages/text/ab/abc", fetched_at=now - timedelta(days=9), checked_at=now - timedelta(days=9))
        self.assertTrue(self.verdict("https://blocks-ai.example.org/new")["may_fetch"])
        PrefetchedPage.objects.create(url="https://blocks-ai.example.org/a", fetched_url="https://www.blocks-ai.example.org/a", host="www.blocks-ai.example.org",
                                      status="unreadable", reason="ai_blocked", detail="robots.txt on www.blocks-ai.example.org disallows the AI crawler ClaudeBot",
                                      fetched_at=now, checked_at=now)
        v = self.verdict("https://www.blocks-ai.example.org/new")
        self.assertEqual((v["policy"], v["may_fetch"], v["browser_read"]), ("ai_blocked", False, True))
        self.assertIn("ClaudeBot", v["why"])

    def test_bad_requests_and_auth(self):
        self.assertEqual(self.client.get("/api/agent/policy?url=https://rated.example.org/").status_code, 401)
        self.assertEqual(self.client.get("/api/agent/policy", HTTP_AUTHORIZATION=f"Bearer {self.token}").status_code, 400)
        self.assertEqual(self.ask("ftp://rated.example.org/x").status_code, 400)
        _, writer = create_token("writer-2", ["write_event"], created_by="human:owner")
        self.assertEqual(self.ask("https://rated.example.org/x", token=writer).status_code, 200)

    @override_settings(AGENT_API_RATE_PER_MINUTE=2)
    def test_rate_limited_like_other_reads(self):
        self.assertEqual([self.ask("https://rated.example.org/x").status_code for _ in range(3)], [200, 200, 429])


class CompleteErrorTests(TestCase):
    """POST complete never answers Django's HTML 500 (ADR 0045): a value that doesn't fit its column is a JSON 422
    naming the field, with the task still the agent's; anything else is a JSON 500."""

    def setUp(self):
        import_content(small())
        _, self.token = create_token("writer", ["write_event", "fill_gap", "verify_claim"], created_by="human:owner")

    def post(self, path, body=None):
        return self.client.post(f"/api/agent/{path}", data=json.dumps(body or {}), content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def claimed(self, kind):
        task, _ = queue.enqueue(kind, created_by="job:test", dedupe_key=f"{kind}-{AgentTask.objects.count()}")
        self.assertEqual(self.post("tasks/claim", {"kinds": [kind]}).json()["task"]["id"], task.pk)
        return task

    def assert_still_claimed(self, task):
        task.refresh_from_db()
        self.assertEqual((task.status, task.claimed_by), ("claimed", "agent:writer"))

    def test_a_value_that_does_not_fit_is_a_422_naming_the_field(self):
        from unittest import mock

        from django.core.exceptions import ValidationError

        for kind, result in (("fill_gap", {"decision": "written", "events": [EVENT]}), ("write_event", {"decision": "written", "event": EVENT})):
            task = self.claimed(kind)
            with mock.patch("agentapi.apply.apply", side_effect=ValidationError({"entry.sort_key": ["300 characters, at most 255"]})):
                r = self.post(f"tasks/{task.pk}/complete", {"result": result})
            self.assertEqual(r.status_code, 422, r.content)
            self.assertEqual(r["Content-Type"], "application/json")
            self.assertEqual(r.json()["fields"], {"entry.sort_key": ["300 characters, at most 255"]})
            self.assertIn("entry.sort_key", r.json()["error"])
            self.assert_still_claimed(task)
            # The agent fixes it and sends it again: it goes through.
            r = self.post(f"tasks/{task.pk}/complete", {"result": result if kind == "fill_gap" else {**result, "event": {**EVENT, "id": "un-new-member-2"}}})
            self.assertEqual(r.status_code, 200, r.content)

    def test_a_postgres_data_error_is_a_422(self):
        from unittest import mock

        from django.db import DataError

        task = self.claimed("fill_gap")
        with mock.patch("agentapi.apply.apply", side_effect=DataError("value too long for type character varying(64)")):
            r = self.post(f"tasks/{task.pk}/complete", {"result": {"decision": "written", "events": [EVENT]}})
        self.assertEqual(r.status_code, 422, r.content)
        self.assertIn("value too long for type character varying(64)", r.json()["error"])
        self.assertIn("value too long", next(iter(r.json()["fields"].values()))[0])
        self.assert_still_claimed(task)
        self.assertFalse(Event.objects.filter(slug=EVENT["id"]).exists(), "nothing was kept")

    def test_anything_else_is_a_json_500(self):
        from unittest import mock

        task = self.claimed("fill_gap")
        with mock.patch("agentapi.apply.apply", side_effect=RuntimeError("boom")), self.assertLogs("agentapi", "ERROR") as logs:
            r = self.post(f"tasks/{task.pk}/complete", {"result": {"decision": "written", "events": [EVENT]}})
        self.assertEqual(r.status_code, 500)
        self.assertEqual(r["Content-Type"], "application/json")
        self.assertEqual(r.json()["exception"], "RuntimeError")
        self.assertIn("RuntimeError: boom", "\n".join(logs.output), "the traceback is logged for the owner")
        self.assert_still_claimed(task)

    def test_the_real_apply_keeps_sort_keys_short(self):
        """The production traceback: fill_gap → _create_event → save_event, with the last keys near 64 characters."""
        from fractions import Fraction
        from unittest import mock

        from revisions import revising
        from timeline import ordering, services
        from timeline.models import Entry

        with revising("job:test", reason="crowd the end"), mock.patch.object(ordering, "MAX_LEN", 255):
            key = Entry.objects.filter(kind="event").order_by("-sort_key").first().sort_key
            for n in range(370):
                key = ordering._shortest(ordering._value(key), Fraction(1))  # the old append: halfway to the end
                services.save_event(f"crowd-{n:03d}", branch="un", y=2001, when="2001", title=f"Crowd {n}", text="t.", imp=3)
                services.apply_changes(Entry.objects.get(slug=f"crowd-{n:03d}"), {"sort_key": key})
        self.assertGreater(len(key), 50, "near the old column's 64 characters")
        task = self.claimed("fill_gap")
        r = self.post(f"tasks/{task.pk}/complete", {"result": {"decision": "written", "events": [EVENT]}})
        self.assertEqual(r.status_code, 200, r.content)
        self.assertLessEqual(len(Entry.objects.get(slug=EVENT["id"]).sort_key), ordering.MAX_LEN)


class ExcerptLimitTests(TestCase):
    """Excerpts are at most 25 words (AGENTS.md rule 5): a longer one is a 422 naming it, in every kind that carries
    one, and nothing is written (ADR 0045)."""

    def setUp(self):
        import_content(small())
        _, self.token = create_token("writer", ["write_event", "fill_gap", "verify_claim", "audit"], created_by="human:owner")

    def complete(self, kind, result, **task):
        t, _ = queue.enqueue(kind, created_by="job:test", dedupe_key=f"{kind}-{AgentTask.objects.count()}", **task)
        auth = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        self.client.post("/api/agent/tasks/claim", data=json.dumps({"kinds": [kind]}), content_type="application/json", **auth)
        return self.client.post(f"/api/agent/tasks/{t.pk}/complete", data=json.dumps({"result": result}), content_type="application/json", **auth), t

    def test_a_30_word_verify_claim_excerpt_is_refused(self):
        record = Claim.objects.get(entry__slug="an-punic-wars", field="as_written")
        n = Evidence.objects.count()
        long = " ".join(f"word{i}" for i in range(30))
        r, task = self.complete("verify_claim", {"claim": record.pk, "evidence": [{"url": "https://www.worldhistory.org/Punic_Wars/", "stance": "supports", "excerpt": long}]},
                                target_claim=record, target_entry_id=record.entry_id)
        self.assertEqual(r.status_code, 422, r.content)
        self.assertTrue(any(p.startswith("evidence/0/excerpt: the excerpt is 30 words; at most 25") for p in r.json()["problems"]), r.json())
        self.assertEqual(Evidence.objects.count(), n)
        task.refresh_from_db()
        self.assertEqual(task.status, "claimed")

    def test_every_kind_that_carries_excerpts_counts_them(self):
        cite = {**EVENT["cites"][0], "excerpt": " ".join(["word"] * 26)}
        ev = {**EVENT, "cites": [cite]}
        for kind, result, path in (("write_event", {"decision": "written", "event": ev}, "event/cites/0/excerpt"),
                                   ("fill_gap", {"decision": "written", "events": [ev]}, "events/0/cites/0/excerpt"),
                                   ("audit", {"events": [ev]}, "events/0/cites/0/excerpt")):
            r, _ = self.complete(kind, result)
            self.assertEqual(r.status_code, 422, (kind, r.content))
            self.assertIn(f"{path}: the excerpt is 26 words; at most 25", "\n".join(r.json()["problems"]), kind)
        self.assertFalse(Event.objects.filter(slug=EVENT["id"]).exists())

    def test_25_words_pass(self):
        from agentapi import schemas

        ok = {**EVENT, "cites": [{**EVENT["cites"][0], "excerpt": "  ".join(["word"] * 25)}]}
        self.assertEqual(schemas.errors("write_event", {"decision": "written", "event": ok}), [])
        r, _ = self.complete("write_event", {"decision": "written", "event": ok})
        self.assertEqual(r.status_code, 200, r.content)


class UnratedLookupTests(TestCase):
    """GET policy records each unrated answer, per domain, for `manage.py unrated_domains` and the console (ADR 0045)."""

    setUp, ask, verdict = FetchPolicyApiTests.setUp, FetchPolicyApiTests.ask, FetchPolicyApiTests.verdict

    def test_unrated_lookups_are_counted_and_listed(self):
        from django.contrib.auth.models import User
        from django.urls import reverse

        from evidence.models import Publisher
        from ingest.models import UnratedLookup
        from revisions import revising

        for url in ("https://www.wto.org/english/news_e/a.htm", "https://www.wto.org/english/news_e/b.htm", "https://www.pbs.org/x",
                    "https://unrated-row.example.org/c"):
            self.assertEqual(self.verdict(url)["policy"], "unrated")
        for url in ("https://rated.example.org/x", "https://www.un.org/en/about-us", "https://openstax.org/books/x", "https://www.theguardian.com/world/x"):
            self.assertNotEqual(self.verdict(url)["policy"], "unrated")
        rows = {r.domain: r for r in UnratedLookup.objects.all()}
        self.assertEqual(set(rows), {"wto.org", "pbs.org", "unrated-row.example.org"}, "allowed and rated lookups are not recorded")
        wto = rows["wto.org"]
        self.assertEqual((wto.lookups, wto.example_url, wto.last_actor), (2, "https://www.wto.org/english/news_e/b.htm", "agent:reader"))
        self.assertLessEqual(wto.first_seen, wto.last_seen)

        out = StringIO()
        call_command("unrated_domains", "--json", stdout=out)
        asked = json.loads(out.getvalue())["asked_by_agents"]
        self.assertEqual([(r["domain"], r["lookups"]) for r in asked][0], ("wto.org", 2), "most asked first")
        self.assertEqual({r["domain"] for r in asked}, {"wto.org", "pbs.org", "unrated-row.example.org"})
        text = StringIO()
        call_command("unrated_domains", stdout=text)
        self.assertIn("wto.org", text.getvalue())

        with revising("human:test", reason="rated"):
            Publisher.objects.update_or_create(domain="pbs.org", defaults={"name": "PBS", "tier": 2, "fetch_policy": "allowed"})
        out = StringIO()
        call_command("unrated_domains", "--json", stdout=out)
        self.assertNotIn("pbs.org", {r["domain"] for r in json.loads(out.getvalue())["asked_by_agents"]}, "rated since: left out")

        self.client.force_login(User.objects.create_user("staff", password="x", is_staff=True))
        r = self.client.get(reverse("opsconsole:work"))
        self.assertContains(r, "Unrated sites agents asked for")
        self.assertContains(r, "wto.org")
        self.assertNotContains(r, ">pbs.org<")
