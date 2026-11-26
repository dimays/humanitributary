"""manage.py apply_edits (timeline/edits.py): each op, atomic failure, a rename keeping its references, the dry run."""

import json
import tempfile
from datetime import date
from io import StringIO
from pathlib import Path

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

from evidence.conflicts import record_conflict
from evidence.models import Claim, Evidence
from evidence.sweep import sweep
from publish.export import build_content
from publish.legacy import import_content
from revisions import revising
from revisions.models import Revision
from timeline import edits
from timeline.models import Connection, Entry, Event, EventLink, Location

from .fixtures import small

ACTOR = "human:owner"
TODAY = date.today()
EB = "https://www.britannica.com/event/Punic-Wars"


def cites(slug):
    return next(e["cites"] for e in build_content()["events"] if e["id"] == slug)


class ApplyEditsTests(TestCase):
    def setUp(self):
        import_content(small())
        sweep(TODAY, tasks=False)  # atomic claims, as on a live database

    def apply(self, ops, **kw):
        return edits.apply(ops, actor=ACTOR, source="test.edits.json", today=TODAY, **kw)

    def set_status(self, slug, status):
        with revising("human:test", reason="setup"):
            Entry.objects.filter(slug=slug).update(status=status)

    def run_command(self, ops, *args):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "round.edits.json"
            path.write_text(json.dumps(ops))
            out = StringIO()
            call_command("apply_edits", str(path), *args, stdout=out)
            return out.getvalue()

    # ── each op ──

    def test_edit_changes_fields_links_and_cites_and_resplits_claims(self):
        before = Revision.objects.order_by("-id").values_list("id", flat=True).first()
        self.apply([{"op": "edit", "entry": "an-punic-wars", "reason": "reviewer: dates and a second source",
                     "fields": {"title": "Punic Wars with Carthage", "text": "Rome fought Carthage three times; about 150,000 died at Cannae.",
                                "y": -264, "end": -146, "when": "264–146 BCE", "imp": 1, "links": ["roman-kingdom", "un"]},
                     "add_cites": [{"t": "Punic Wars — Encyclopaedia Britannica", "u": EB, "method": "browser_read", "excerpt": "three wars between Rome and Carthage"}]}])
        e = Event.objects.get(slug="an-punic-wars")
        self.assertEqual((e.title, e.imp, e.end), ("Punic Wars with Carthage", 1, -146))
        self.assertEqual([link.branch.slug for link in e.event_links.order_by("position")], ["roman-kingdom", "un"])
        self.assertEqual(Claim.objects.get(entry=e, field="as_written").value["text"], e.text)
        self.assertEqual([c["u"] for c in cites("an-punic-wars")], ["https://en.wikipedia.org/wiki/Punic_Wars", EB])
        self.assertTrue(Claim.objects.filter(entry=e, field="number", key="about-150-000-died").exists())  # re-split
        ev = Evidence.objects.get(citation__url=EB)
        self.assertEqual((ev.method, ev.checked_by, ev.excerpt), ("browser_read", ACTOR, "three wars between Rome and Carthage"))
        revs = Revision.objects.filter(id__gt=before)
        self.assertTrue(revs.exists())
        self.assertEqual(set(revs.values_list("actor", flat=True)), {ACTOR})
        self.assertIn("#0 edit an-punic-wars: reviewer: dates and a second source", revs.filter(table_name="timeline_event").first().reason)

    def test_edit_removes_a_cite_by_url_or_domain_and_updates_one_in_place(self):
        self.apply([{"op": "edit", "entry": "an-caesar-assassinated", "reason": "weak source",
                     "remove_cites": [{"domain": "britannica.com"}],
                     "add_cites": [{"t": "Assassination of Julius Caesar (en)", "u": "https://EN.wikipedia.org/wiki/Assassination_of_%4Aulius_Caesar/", "stance": "partial"}]}])
        got = cites("an-caesar-assassinated")
        self.assertNotIn("britannica.com", json.dumps(got))
        ev = Evidence.objects.get(claim__entry__slug="an-caesar-assassinated", claim__field="as_written", position=0)
        self.assertEqual((ev.stance, ev.cited_title), ("partial", "Assassination of Julius Caesar (en)"))  # matched up to encoding and slash

    def test_add_evidence_records_a_stance_and_excerpt_on_a_claim(self):
        out = self.apply([{"op": "add_evidence", "entry": "an-punic-wars", "claim": {"field": "date", "key": ""}, "url": EB, "stance": "supports",
                           "title": "Punic Wars — Encyclopaedia Britannica", "excerpt": "the Punic Wars (264–146 BCE)", "method": "browser_read", "reason": "second source"}])
        claim = Claim.objects.get(entry__slug="an-punic-wars", field="date", key="")
        ev = claim.evidence.get(citation__url=EB)
        self.assertEqual((ev.stance, ev.excerpt, ev.checked_by), ("supports", "the Punic Wars (264–146 BCE)", ACTOR))
        self.assertIn("date ''", out.ops[0][2][0])
        # A new source can't go on the record claim this way (it's a cite: edit add_cites); the problem says so.
        with self.assertRaises(edits.EditsInvalid) as cm:
            self.apply([{"op": "add_evidence", "entry": "an-punic-wars", "url": EB, "stance": "supports", "reason": "x"}])
        self.assertIn("as-written claim", str(cm.exception))

    def test_approve_publishes_under_the_rule_and_reject_retracts(self):
        for slug in ("un-charter", "an-punic-wars", "co-big-bang"):
            self.set_status(slug, "review")
        with self.assertRaises(edits.EditsInvalid) as cm:
            self.apply([{"op": "approve", "entry": "an-punic-wars", "reason": "ok"}])
        self.assertIn("no supporting source other than Wikipedia", str(cm.exception))
        self.apply([{"op": "approve", "entry": "un-charter", "reason": "reviewer: APPROVE"},
                    {"op": "approve", "entry": "an-punic-wars", "reason": "reviewer: APPROVE", "override": "owner accepts Wikipedia here"},
                    {"op": "reject", "entry": "co-big-bang", "reason": "reviewer: REJECT (duplicate)"}])
        status = dict(Entry.objects.values_list("slug", "status"))
        self.assertEqual((status["un-charter"], status["an-punic-wars"], status["co-big-bang"]), ("published", "published", "retracted"))
        self.assertIn("owner accepts Wikipedia here", Revision.objects.filter(table_name="timeline_entry", reason__contains="an-punic-wars").order_by("-id").first().reason)
        self.assertIn("REJECT (duplicate)", Revision.objects.filter(table_name="timeline_entry").order_by("-id").first().reason)
        # Re-running the same file changes nothing.
        before = Revision.objects.count()
        self.apply([{"op": "approve", "entry": "un-charter", "reason": "again"}, {"op": "reject", "entry": "co-big-bang", "reason": "again"}])
        self.assertEqual(Revision.objects.count(), before)

    def test_resolve_conflict_recomputes_the_claim_and_the_sweep_leaves_it(self):
        claim = Claim.objects.get(entry__slug="an-punic-wars", field="date", key="")
        with revising("agent:verifier", reason="test"):
            record_conflict(claim, url="https://www.si.edu/punic", title="Smithsonian", found_value={"y": -260}, checked_by="agent:verifier", method="agent_read")
            from evidence.sweep import reassess_all
            reassess_all(TODAY, {}, claim_ids=[claim.pk])
        claim.refresh_from_db()
        self.assertEqual(claim.status, "contested")
        self.apply([{"op": "resolve_conflict", "entry": "an-punic-wars", "reason": "text now says when each source dates it"}])
        claim.refresh_from_db()
        self.assertNotEqual(claim.status, "contested")
        ev = claim.evidence.get(citation__url="https://www.si.edu/punic")
        self.assertEqual(ev.stance, "unrelated")
        self.assertEqual(ev.found_value["resolved"]["by"], ACTOR)
        with revising("job:facts_sweep", reason="test"):
            record_conflict(claim, url="https://www.si.edu/punic", title="Smithsonian", found_value={"y": -260}, checked_by="job:facts_sweep")
        self.assertEqual(claim.evidence.get(citation__url="https://www.si.edu/punic").stance, "unrelated")
        # Naming a URL that has no conflict is a problem; nothing to resolve at all is only a note.
        with self.assertRaises(edits.EditsInvalid):
            self.apply([{"op": "resolve_conflict", "entry": "an-punic-wars", "urls": ["https://example.org/x"], "reason": "x"}])
        out = self.apply([{"op": "resolve_conflict", "entry": "un-charter", "reason": "x"}])
        self.assertEqual(out.ops[0][2], ["no conflicting evidence: nothing to resolve"])

    # ── a rename keeps history and every reference ──

    def test_rename_keeps_history_and_every_reference(self):
        e = Entry.objects.get(slug="un-charter")
        history = set(Revision.objects.filter(row_pk=str(e.pk)).values_list("pk", flat=True))
        claims = set(Claim.objects.filter(entry=e).values_list("pk", flat=True))
        self.apply([{"op": "rename", "entry": "un-charter", "to": "ga9-un-charter", "reason": "branch prefix"},
                    {"op": "edit", "entry": "ga9-un-charter", "fields": {"imp": 2}, "reason": "after the rename, by its new id"}])
        e2 = Entry.objects.get(slug="ga9-un-charter")
        self.assertEqual(e2.pk, e.pk)
        self.assertFalse(Entry.objects.filter(slug="un-charter").exists())
        self.assertLess(history, set(Revision.objects.filter(row_pk=str(e.pk)).values_list("pk", flat=True)))  # one row, one history
        rename = Revision.objects.filter(table_name="timeline_entry", row_pk=str(e.pk), changed__contains=["slug"]).get()
        self.assertEqual((rename.before["slug"], rename.after["slug"], rename.actor), ("un-charter", "ga9-un-charter", ACTOR))
        self.assertEqual(set(Claim.objects.filter(entry=e2).values_list("pk", flat=True)), claims)
        self.assertTrue(Location.objects.filter(entry=e2).exists())
        self.assertTrue(EventLink.objects.filter(event_id=e2.pk, branch__slug="roman-republic").exists())
        self.assertTrue(Connection.objects.filter(target_id=e2.pk).exists())
        content = build_content()
        caesar = next(x for x in content["events"] if x["id"] == "an-caesar-assassinated")
        self.assertEqual(caesar["connections"][0]["id"], "ga9-un-charter")  # the reference follows the row
        self.assertEqual(next(x for x in content["events"] if x["id"] == "ga9-un-charter")["imp"], 2)

    def test_rename_refuses_an_existing_id_and_later_ops_must_use_the_new_one(self):
        problems = edits.check([{"op": "rename", "entry": "un-charter", "to": "ga9-un-charter", "reason": "x"},
                                {"op": "approve", "entry": "un-charter", "reason": "x"},
                                {"op": "rename", "entry": "an-punic-wars", "to": "ga9-un-charter", "reason": "x"}])
        self.assertTrue(any("#1 approve un-charter: un-charter was renamed to ga9-un-charter" in p for p in problems), problems)
        self.assertTrue(any("#2" in p and "already the new id" in p for p in problems), problems)
        with self.assertRaises(edits.EditsInvalid) as cm:
            self.apply([{"op": "rename", "entry": "un-charter", "to": "an-punic-wars", "reason": "x"}])
        self.assertIn("already an entry's id", str(cm.exception))

    # ── atomic failure ──

    def test_shape_problems_are_all_listed_and_nothing_is_written(self):
        before = Revision.objects.count()
        ops = [
            {"op": "edit", "entry": "an-punic-wars", "reason": "fine", "fields": {"imp": 3}},
            {"op": "edit", "entry": "an-punic-wars", "reason": "too long", "fields": {"title": "x" * 61, "text": "y" * 241, "branch": "atlantis"}},
            {"op": "edit", "entry": "un-charter", "reason": "bad cites", "add_cites": [{"t": "A", "u": "http://example.org/a"}, {"t": "B", "u": "https://openstax.org/books/x"}]},
            {"op": "add_evidence", "entry": "un-charter", "url": EB, "stance": "supports", "excerpt": " ".join(["word"] * 26), "reason": "long excerpt"},
            {"op": "approve", "entry": "un-charter"},
            {"op": "frobnicate", "entry": "un-charter", "reason": "x"},
        ]
        with self.assertRaises(edits.EditsInvalid) as cm:
            self.apply(ops)
        text = "\n".join(cm.exception.problems)
        for needle in ("title must be 1–60", "text must be 1–240", "branch 'atlantis' doesn't exist", "not https", "openstax.org",
                       "excerpt is 26 words", "#4 approve un-charter: a reason is required", "unknown op 'frobnicate'"):
            self.assertIn(needle, text)
        self.assertEqual(Revision.objects.count(), before)
        self.assertEqual(Event.objects.get(slug="an-punic-wars").imp, 2)

    def test_a_failing_op_rolls_back_the_ops_before_it_and_every_failure_is_listed(self):
        before = Revision.objects.count()
        with self.assertRaises(edits.EditsInvalid) as cm:
            self.apply([{"op": "edit", "entry": "an-punic-wars", "reason": "fine", "fields": {"title": "Punic Wars (edited)"}},
                        {"op": "edit", "entry": "no-such-event", "reason": "missing", "fields": {"imp": 1}},
                        {"op": "add_evidence", "entry": "an-punic-wars", "claim": {"field": "number", "key": "nope"}, "url": EB, "stance": "supports", "reason": "missing claim"},
                        {"op": "edit", "entry": "an-punic-wars", "reason": "end before y", "fields": {"end": -300}}])
        self.assertEqual(len(cm.exception.problems), 3, cm.exception.problems)
        self.assertIn("no entry 'no-such-event'", cm.exception.problems[0])
        self.assertIn("has no number claim 'nope'", cm.exception.problems[1])
        self.assertIn("must be after y", cm.exception.problems[2])
        self.assertEqual(Event.objects.get(slug="an-punic-wars").title, "Punic Wars")
        self.assertEqual(Revision.objects.count(), before)

    # ── the dry run and validate-only ──

    def test_dry_run_prints_the_diff_and_writes_nothing(self):
        before = Revision.objects.count()
        out = self.run_command([{"op": "edit", "entry": "an-punic-wars", "reason": "retitle", "fields": {"title": "The Punic Wars"}},
                                {"op": "rename", "entry": "an-punic-wars", "to": "an-punic-wars-1", "reason": "new id"}],
                               "--actor", ACTOR, "--dry-run")
        self.assertIn('~ event an-punic-wars title: "Punic Wars" → "The Punic Wars"', out)
        self.assertIn('~ entry an-punic-wars-1 slug: "an-punic-wars" → "an-punic-wars-1"', out)
        self.assertIn("dry run, rolled back: nothing written", out)
        self.assertEqual(Revision.objects.count(), before)
        self.assertEqual(Event.objects.get(slug="an-punic-wars").title, "Punic Wars")

    def test_validate_only_checks_shape_without_the_rows(self):
        ops = [{"op": "rename", "entry": "cur-draft-not-here", "to": "ga9-draft", "reason": "prefix"},
               {"op": "edit", "entry": "ga9-draft", "reason": "branch", "fields": {"branch": "un", "links": ["roman-republic"], "y": 2026.88}},
               {"op": "approve", "entry": "ga9-draft", "reason": "APPROVE"}]
        out = self.run_command(ops, "--validate-only")
        self.assertIn("3 ops valid (approve 1, edit 1, rename 1)", out)
        ops[1]["fields"]["title"] = "z" * 70
        with self.assertRaises(CommandError) as cm:
            self.run_command(ops, "--validate-only")
        self.assertIn("title must be 1–60", str(cm.exception))
        with self.assertRaises(CommandError):
            self.run_command(ops[:1], "--dry-run")  # without --actor
