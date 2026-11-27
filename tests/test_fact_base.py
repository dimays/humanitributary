"""The fact base: independence, confidence and status, atomic claims, staleness, conflicts, the sweep, publishing."""

from datetime import date, datetime, timedelta, timezone

from django.test import SimpleTestCase, TestCase

from evidence import health, publishing
from evidence.claims import actors, numbers
from evidence.confidence import assess, assess_detail, wikipedia_only
from evidence.independence import witness
from evidence.models import Citation, Claim, Evidence
from evidence.services import record_evidence
from evidence.staleness import interval_days, schedule
from evidence.sweep import sweep
from ingest.models import Candidate, Document
from publish.legacy import import_content
from revisions import revising
from revisions.models import Revision
from timeline.models import Entry, Event
from work.models import AgentTask

from .fixtures import small

TODAY = date(2026, 11, 26)
W = ("supports", "wikipedia.org", 3)
EB = ("supports", "britannica.com", 2)


class IndependenceAndStatusTests(SimpleTestCase):
    def test_witnesses_are_organizations(self):
        self.assertEqual(witness("science.nasa.gov"), witness("nasa.gov"))
        self.assertEqual(witness("news.un.org"), "un.org")
        self.assertEqual(witness("fr.wikipedia.org"), "wikipedia.org")
        self.assertEqual(witness("www.bbc.co.uk"), "bbc.co.uk")
        self.assertNotEqual(witness("a.github.io"), witness("b.github.io"))

    def test_corroborated_needs_two_independent_publishers(self):
        self.assertEqual(assess([W, EB], today=TODAY)[0], "corroborated")
        self.assertEqual(assess([EB], today=TODAY)[0], "single_source")  # one non-Wikipedia source is one witness
        self.assertEqual(assess([W, ("supports", "en.wikipedia.org", 3)], today=TODAY)[0], "single_source")
        self.assertEqual(assess([("supports", "nasa.gov", 1), ("supports", "science.nasa.gov", 1)], today=TODAY)[0], "single_source")
        self.assertEqual(assess([W, ("partial", "britannica.com", 2)], today=TODAY)[0], "single_source")
        self.assertEqual(assess([], today=TODAY)[0], "unverified")

    def test_contested_when_tier_weighted_conflict_passes_the_threshold(self):
        weak = ("conflicts", "someblog.net", 4, "agent_read")
        self.assertEqual(assess([W, EB, weak], today=TODAY)[0], "corroborated")
        strong = ("conflicts", "nature.com", 1, "agent_read")
        self.assertEqual(assess([W, EB, strong], today=TODAY)[0], "contested")
        self.assertEqual(assess([weak], today=TODAY)[0], "contested")  # nothing supports it
        d = assess_detail([W, EB, weak], today=TODAY)
        self.assertLess(d["confidence"], assess_detail([W, EB], today=TODAY)["confidence"])

    def test_stale_and_freshness(self):
        self.assertEqual(assess([EB], recheck_after=TODAY, today=TODAY)[0], "stale")
        fresh = ("supports", "britannica.com", 2, "agent_read", datetime(2026, 11, 1, tzinfo=timezone.utc))
        old = ("supports", "britannica.com", 2, "agent_read", datetime(2020, 1, 1, tzinfo=timezone.utc))
        self.assertGreater(assess([fresh], today=TODAY, interval_days=365)[1], assess([old], today=TODAY, interval_days=365)[1])

    def test_date_agreement_scales_confidence(self):
        agree = ("supports", "britannica.com", 2, "agent_read", None, {"y": 1066.8})
        differ = ("supports", "nature.com", 1, "agent_read", None, {"y": 1070})
        full = assess([agree], today=TODAY, claim_y=1066.8, tolerance=0.99)[1]
        half = assess([agree, differ], today=TODAY, claim_y=1066.8, tolerance=0.99)
        self.assertLess(half[1], assess([agree, ("supports", "nature.com", 1, "agent_read")], today=TODAY, claim_y=1066.8, tolerance=0.99)[1])
        self.assertGreater(full, 0)

    def test_wikipedia_only(self):
        self.assertTrue(wikipedia_only([W]))
        self.assertFalse(wikipedia_only([W, EB]))
        self.assertFalse(wikipedia_only([]))


class SplitterTests(SimpleTestCase):
    def test_numbers_skip_dates_and_keep_counts(self):
        text = ("After the Second Carib War (1795–96), Britain deported more than 5,000 Garifuna on April 12, 1797. "
                "About 2,500 survived; it won 54% of the vote in the 2nd century and the 1990s. Estimates range from 300 to 10,000 dead.")
        got = [(n["value"], n["unit"]) for n in numbers(text)]
        self.assertIn((5000.0, "Garifuna"), got)
        self.assertIn((2500.0, "survived"), got)
        self.assertIn((54.0, "%"), got)
        self.assertIn((300.0, ""), got)
        self.assertIn((10000.0, "dead"), got)
        self.assertFalse([v for v, _ in got if v in (1795, 96, 1797, 12, 2, 1990)])

    def test_numbers_scale_words(self):
        self.assertEqual(numbers("with about 13 billion barrels of oil")[0]["value"], 13e9)

    def test_actors(self):
        got = actors("Columbus reaches the Taíno island of Quisqueya",
                     "Columbus sighted the island the Taíno called Quisqueya. Soldiers landed; Diego Velázquez followed, Britannica says.")
        self.assertIn("Columbus", got)
        self.assertIn("Diego Velázquez", got)
        self.assertNotIn("Soldiers", got)
        self.assertNotIn("Britannica", got)


class StalenessTests(SimpleTestCase):
    def test_intervals_follow_field_and_era(self):
        self.assertEqual(interval_days("date", 1066, False, TODAY), 3650)
        self.assertEqual(interval_days("number", 2026, False, TODAY), 7)
        self.assertEqual(interval_days("number", 1066, True, TODAY), 7)  # ongoing
        self.assertEqual(interval_days("date", 2025, False, TODAY), 180)

    def test_schedule_never_pushes_a_requested_recheck_later(self):
        last = date(2026, 1, 1)
        checked = datetime(2026, 1, 1, 12, tzinfo=timezone.utc)
        due = last + timedelta(days=100)
        self.assertEqual(schedule(existing=None, last_check=checked, created=last, interval=100), (due, False))
        self.assertEqual(schedule(existing=date(2026, 2, 1), last_check=checked, created=last, interval=100), (date(2026, 2, 1), True))
        # A check after the request answers it …
        self.assertEqual(schedule(existing=date(2025, 12, 1), last_check=checked, created=last, interval=100), (due, False))
        self.assertEqual(schedule(existing=last, requested_at=checked - timedelta(hours=1), last_check=checked, created=last, interval=100), (due, False))
        # … one before it does not, and nothing pushes a request later.
        self.assertEqual(schedule(existing=last, requested_at=checked + timedelta(hours=1), last_check=checked, created=last, interval=100), (last, True))
        self.assertEqual(schedule(existing=date(2025, 6, 1), created=date(2025, 1, 1), interval=1000), (date(2025, 6, 1), True))


class SweepTests(TestCase):
    def setUp(self):
        import_content(small())

    def claim(self, slug, field="as_written", key=""):
        return Claim.objects.get(entry__slug=slug, field=field, key=key)

    def test_sweep_splits_schedules_and_is_idempotent(self):
        sweep(TODAY)
        date_claim = self.claim("an-punic-wars", "date")
        self.assertEqual(date_claim.parent, self.claim("an-punic-wars"))
        self.assertEqual(date_claim.value["when"], "264–146 BCE")
        self.assertTrue(Claim.objects.filter(entry__slug="un-charter", field="location").exists())
        self.assertTrue(Claim.objects.filter(entry__slug="an-caesar-assassinated", field="actor", key="caesar").exists())
        aw = self.claim("an-punic-wars")
        self.assertEqual(aw.recheck_reason, "scheduled")
        self.assertEqual(aw.recheck_after, aw.created_at.date() + timedelta(days=3650))
        before = Revision.objects.count()
        tasks = AgentTask.objects.count()
        out = sweep(TODAY)
        self.assertEqual(Revision.objects.count(), before, out)
        self.assertEqual(AgentTask.objects.count(), tasks)

    def test_wikipedia_only_events_get_a_second_source_task(self):
        sweep(TODAY)
        t = AgentTask.objects.get(kind="verify_claim", target_entry__slug="an-punic-wars")
        self.assertEqual(t.payload["reason"], "no_second_source")
        self.assertEqual(t.payload["entry"]["title"], "Punic Wars")
        self.assertEqual(t.payload["evidence"][0]["url"], "https://en.wikipedia.org/wiki/Punic_Wars")
        self.assertTrue(any(p["field"] == "date" for p in t.payload["parts"]))
        self.assertFalse(AgentTask.objects.filter(target_entry__slug="un-charter").exists())  # un.org

    def test_dead_link_makes_claims_stale_and_queues_a_task(self):
        sweep(TODAY)
        with revising("job:link_health", reason="test"):
            Citation.objects.filter(url="https://www.un.org/en/about-us/un-charter").update(http_status=404, last_checked_at=datetime(2026, 11, 25, tzinfo=timezone.utc))
        sweep(TODAY)
        claim = self.claim("un-charter")
        self.assertEqual((claim.status, claim.recheck_reason, claim.recheck_after), ("stale", "dead_link", TODAY))
        t = AgentTask.objects.get(kind="verify_claim", target_claim=claim)
        self.assertEqual(t.payload["reason"], "dead_link")
        self.assertEqual(t.payload["evidence"][0]["http_status"], 404)
        # An agent re-reads it (an archived copy, say): the claim is current again.
        with revising("agent:verifier", reason="test"):
            ev = Evidence.objects.get(claim=claim)
            ev.checked_at, ev.method, ev.checked_by = datetime(2026, 11, 26, 9, tzinfo=timezone.utc), "agent_read", "agent:verifier"
            ev.save()
        sweep(TODAY)
        claim.refresh_from_db()
        self.assertEqual(claim.status, "single_source")
        self.assertEqual(claim.recheck_after, date(2026, 11, 26) + timedelta(days=730))

    def test_changed_page_is_baselined_then_noticed(self):
        url = "https://www.un.org/en/about-us/un-charter"
        with revising("job:link_health", reason="test"):
            Citation.objects.filter(url=url).update(content_hash="a" * 64, last_checked_at=datetime(2026, 11, 20, tzinfo=timezone.utc))
        sweep(TODAY)
        self.assertEqual(Evidence.objects.get(claim=self.claim("un-charter")).content_hash, "a" * 64)
        self.assertNotEqual(self.claim("un-charter").status, "stale")
        with revising("job:link_health", reason="test"):
            Citation.objects.filter(url=url).update(content_hash="b" * 64, last_checked_at=datetime(2026, 11, 25, tzinfo=timezone.utc))
        sweep(TODAY)
        self.assertEqual((self.claim("un-charter").status, self.claim("un-charter").recheck_reason), ("stale", "content_changed"))

    def test_a_job_may_pull_a_recheck_earlier(self):
        sweep(TODAY)
        with revising("job:link_health", reason="test"):
            Claim.objects.filter(pk=self.claim("an-punic-wars").pk).update(recheck_after=TODAY)
        sweep(TODAY)
        c = self.claim("an-punic-wars")
        self.assertEqual((c.status, c.recheck_after, c.recheck_reason), ("stale", TODAY, "requested"))

    def test_conflicting_candidate_date_is_recorded_and_contests_the_date(self):
        sweep(TODAY)
        ev = Event.objects.get(slug="un-charter")
        doc = Document.objects.create(canonical_url="https://en.wikipedia.org/wiki/Charter_of_the_United_Nations", url="https://en.wikipedia.org/wiki/Charter_of_the_United_Nations",
                                      fetched_at=datetime(2026, 11, 20, tzinfo=timezone.utc), content_hash="c" * 64, title="Charter of the United Nations")
        cand = Candidate.objects.create(title="UN Charter signed", y_guess=1947.5, when_text="June 1947", duplicate_of=ev, similarity=0.9)
        cand.documents.add(doc)
        sweep(TODAY)
        date_claim = self.claim("un-charter", "date")
        ev = date_claim.evidence.get()
        self.assertEqual((ev.stance, ev.found_value["y"], ev.found_value["claim_value"]["y"]), ("conflicts", 1947.5, 1945.48))
        self.assertEqual(date_claim.status, "contested")
        t = AgentTask.objects.get(kind="verify_claim", target_claim=date_claim)
        self.assertEqual(t.payload["reason"], "conflict")
        # Re-running records nothing new.
        n = Evidence.objects.count()
        sweep(TODAY)
        self.assertEqual(Evidence.objects.count(), n)

    def test_record_evidence_corroborates(self):
        sweep(TODAY)
        part = self.claim("an-punic-wars", "date")
        with revising("agent:verifier", reason="test"):
            record_evidence(part, url="https://www.britannica.com/event/Punic-Wars", stance="supports", excerpt="The Punic Wars (264–146 BCE)", checked_by="agent:verifier", today=TODAY)
            record_evidence(part, url="https://en.wikipedia.org/wiki/Punic_Wars", stance="supports", checked_by="agent:verifier", today=TODAY)
        part.refresh_from_db()
        self.assertEqual(part.status, "corroborated")
        # The recheck date counts from when the evidence was actually recorded (checked_at is the real clock), not
        # from the sweep's fixed TODAY: the two differ once the calendar moves past TODAY.
        checked = Evidence.objects.filter(claim=part).latest("checked_at").checked_at.date()
        self.assertEqual(part.recheck_after, checked + timedelta(days=3650))

    def test_changed_wording_marks_a_checked_part_for_recheck(self):
        sweep(TODAY)
        part = self.claim("an-punic-wars", "date")
        with revising("agent:verifier", reason="test"):
            record_evidence(part, url="https://www.britannica.com/event/Punic-Wars", stance="supports", checked_by="agent:verifier", today=TODAY)
        data = small()
        data["events"][1]["when"] = "264–146 BC"
        import_content(data)
        sweep(TODAY)
        part.refresh_from_db()
        self.assertEqual((part.status, part.recheck_reason), ("stale", "value_changed"))

    def test_report_renders(self):
        sweep(TODAY)
        md = health.markdown(health.collect(TODAY))
        self.assertIn("record claims on published entries", md)
        self.assertIn("| ancient |", md)


class PublishingRuleTests(TestCase):
    def setUp(self):
        import_content(small())

    def test_wikipedia_only_event_is_blocked_unless_overridden(self):
        entry = Entry.objects.get(slug="an-punic-wars")
        self.assertEqual(publishing.problems(entry, TODAY), ["no supporting source other than Wikipedia"])
        self.assertEqual(publishing.problems(Entry.objects.get(slug="un-charter"), TODAY), [])
        with revising("agent:writer", reason="test"):
            Event.objects.filter(slug="an-punic-wars").update(status="review")
            with self.assertRaises(publishing.PublishBlocked):
                publishing.publish_entry("an-punic-wars", today=TODAY)
            publishing.publish_entry("an-punic-wars", override="owner approved", today=TODAY)
        self.assertEqual(Entry.objects.get(slug="an-punic-wars").status, "published")
        self.assertIn("owner approved", Revision.objects.filter(table_name="timeline_entry").order_by("-id").first().reason)

    def test_current_events_have_a_grace_period(self):
        with revising("agent:writer", reason="test"):
            Event.objects.filter(slug="an-punic-wars").update(y=2026.8, end=None)
        entry = Entry.objects.get(slug="an-punic-wars")
        self.assertEqual(publishing.problems(entry, entry.created_at.date() + timedelta(days=3)), [])
        self.assertTrue(publishing.problems(entry, entry.created_at.date() + timedelta(days=30)))

    def test_contested_needs_a_sources_differ_note(self):
        self.assertTrue(publishing.says_sources_differ("Dates run from 2,500 to 500 years ago (Cornell) or 450 BCE (Wikipedia); sources differ."))
        self.assertTrue(publishing.says_sources_differ("Wikipedia says Ghana conquered it in 990; the Met says only that by 1050 Ghana controlled it."))
        self.assertFalse(publishing.says_sources_differ("Three wars with Carthage."))
