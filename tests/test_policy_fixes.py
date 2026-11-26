"""Code/doc disagreements the guide's writers found, fixed in the code: a redirect never lands a job on a host it
may not fetch; evidence that only conflicts supports nothing (publishing rule 2); a page that refuses automated
readers (401/403/429) is "blocked", never a dead link."""

from datetime import date

from django.test import TestCase

from evidence import publishing
from evidence.models import Citation, Evidence
from evidence.staleness import link_problem
from ingest.http import Refused
from publish.legacy import import_content
from revisions import revising
from timeline.models import Entry

from .cassette import replay, response
from .fixtures import small

TODAY = date(2026, 11, 26)


class RedirectPolicyTests(TestCase):
    def test_a_redirect_to_a_browser_only_host_is_refused(self):
        f = replay(extra={
            "GET https://example.org/story": response(301, location="https://www.britannica.com/event/x"),
            "GET https://example.org/moved": response(302, location="/new"),
            "GET https://example.org/new": response(200, "<html>fine</html>"),
        })
        with self.assertRaises(Refused) as ctx:
            f.get("https://example.org/story")
        self.assertIn("britannica.com", str(ctx.exception))
        r = f.get("https://example.org/moved")
        self.assertEqual((r.status, r.final_url, r.history), (200, "https://example.org/new", ["https://example.org/moved"]))
        self.assertNotIn("GET https://www.britannica.com/event/x", f.client._transport.seen)


class PublishingRuleTwoTests(TestCase):
    def test_an_event_whose_evidence_all_conflicts_is_not_publishable(self):
        import_content(small())
        entry = Entry.objects.get(slug="un-charter")
        self.assertEqual(publishing.problems(entry, TODAY), [])
        with revising("agent:verifier", reason="test"):
            Evidence.objects.filter(claim__entry=entry).update(stance="conflicts")
        self.assertEqual(publishing.problems(entry, TODAY), ["no supporting source other than Wikipedia"])


class BlockedIsNotDeadTests(TestCase):
    def test_refusals_are_not_dead_links(self):
        base = {"checked_at": None, "cit_checked_at": None, "content_hash": "", "cit_hash": ""}
        for status in (401, 403, 429):
            self.assertIsNone(link_problem({**base, "http_status": status}, 400), status)
        self.assertEqual(link_problem({**base, "http_status": 404}, 400), "dead_link")

    def test_link_health_keeps_the_last_real_status_on_a_refusal(self):
        from ingest import jobs
        from ingest.models import LinkCheck

        from unittest import mock

        import_content(small())
        c = Citation.objects.get(url="https://www.si.edu/roman-republic")
        with revising("job:test"):
            Citation.objects.filter(pk=c.pk).update(http_status=200)
        f = replay(extra={"HEAD https://www.si.edu/roman-republic": response(403), "GET https://www.si.edu/roman-republic": response(403, "Forbidden")})
        jobs._load_registry()
        with mock.patch("ingest.linkhealth.select", return_value=[c]):
            run = jobs.run_one(jobs.REGISTRY["link_health"], options={"limit": 1}, fetcher=f, log=lambda m: None)
        self.assertIn(run.status, ("ok", "partial"), run.error)
        self.assertEqual(LinkCheck.objects.filter(citation=c).latest("checked_at").outcome, "blocked")
        c.refresh_from_db()
        self.assertEqual(c.http_status, 200)
