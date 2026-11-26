"""Legacy import is idempotent, and import → publish gives back exactly what went in."""

import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from unittest import skipUnless

from django.conf import settings
from django.test import TestCase, override_settings

from evidence.models import Citation, Claim, Evidence, Publisher
from publish.compare import differences
from publish.content import ADDITIVE, KEYS, dumps, js_number, legacy_view, read_js_keys
from publish.export import build_content
from publish.legacy import changes, import_content
from publish.models import Release
from publish.release import publish
from revisions import revising
from revisions.models import Revision
from timeline.models import Branch, BranchLink, Event, Location, Status

from .fixtures import small


class ImportTests(TestCase):
    def test_first_import_creates_everything(self):
        stats = import_content(small())
        self.assertEqual(stats["branch.created"], 3)
        self.assertEqual(stats["event.created"], 4)
        self.assertEqual(Branch.objects.filter(status=Status.PUBLISHED).count(), 3)
        rr = Branch.objects.get(slug="roman-republic")
        link = BranchLink.objects.get(branch=rr, relation="parent")
        self.assertEqual((link.target.slug, link.how, link.origin_position), ("roman-kingdom", "successor", 0))
        self.assertEqual(Location.objects.get(entry__slug="un").scope, "global")
        self.assertTrue(Revision.objects.filter(actor="job:import_legacy", table_name="timeline_event").exists())

    def test_reimport_of_unchanged_input_changes_nothing(self):
        import_content(small())
        before = Revision.objects.count()
        stats = import_content(small())
        self.assertEqual(changes(stats), 0, {k: v for k, v in stats.items() if not k.endswith("unchanged")})
        self.assertEqual(Revision.objects.count(), before)

    def test_a_changed_field_is_one_update_and_one_revision(self):
        import_content(small())
        data = small()
        data["events"][1]["text"] = "Three wars between Rome and Carthage."
        before = Revision.objects.count()
        stats = import_content(data)
        self.assertEqual(stats["event.updated"], 1)
        self.assertEqual(stats["claim.updated"], 1)  # the "as written" claim's value follows the text
        new = Revision.objects.filter(pk__gt=0).order_by("id")[before:]
        tables = sorted(r.table_name for r in new)
        self.assertEqual(tables, ["evidence_claim", "timeline_entry"])
        entry_rev = next(r for r in new if r.table_name == "timeline_entry")
        self.assertIn("text", entry_rev.changed)
        self.assertEqual(entry_rev.after["text"], "Three wars between Rome and Carthage.")

    def test_removed_citation_is_removed_and_reordering_is_kept(self):
        import_content(small())
        data = small()
        rr = data["branches"][1]
        rr["cites"] = list(reversed(rr["cites"]))[:1]
        import_content(data)
        claim = Claim.objects.get(entry__slug="roman-republic", field="as_written")
        self.assertEqual([e.citation.url for e in claim.evidence.all()], ["https://www.britannica.com/place/Roman-Republic"])

    def test_review_state_survives_a_reimport(self):
        import_content(small())
        with revising("human:owner", reason="test"):
            p = Publisher.objects.get(domain="britannica.com")
            p.tier = 1
            p.save()
            ev = Evidence.objects.get(claim__entry__slug="an-punic-wars", position=0)
            ev.stance, ev.excerpt, ev.checked_by = "partial", "The First Punic War began in 264 BCE.", "agent:test"
            ev.save()
            Event.objects.filter(slug="an-punic-wars").update(status=Status.REVIEW)
        import_content(small())
        self.assertEqual(Publisher.objects.get(domain="britannica.com").tier, 1)
        self.assertEqual(Evidence.objects.get(claim__entry__slug="an-punic-wars", position=0).stance, "partial")
        self.assertEqual(Event.objects.get(slug="an-punic-wars").status, Status.REVIEW)

    def test_claim_status_counts_independent_publishers(self):
        import_content(small())
        status = lambda slug: Claim.objects.get(entry__slug=slug, field="as_written").status  # noqa: E731
        self.assertEqual(status("an-punic-wars"), "single_source")  # Wikipedia only
        self.assertEqual(status("un-charter"), "single_source")  # one non-Wikipedia publisher is still one witness
        self.assertEqual(status("an-caesar-assassinated"), "corroborated")  # Wikipedia + Britannica
        self.assertEqual(Publisher.objects.get(domain="wikipedia.org").tier, 3)

    def test_openstax_can_never_be_cited(self):
        import_content(small())
        from django.db import IntegrityError

        with self.assertRaises(IntegrityError), revising("job:test"):
            Citation.objects.create(url="https://openstax.org/books/world-history/pages/1", title="x", publisher=Publisher.objects.first())


class RoundTripTests(TestCase):
    def test_import_then_export_gives_back_the_input(self):
        """Exact on every key the legacy dump has; the additive keys (ADR 0018) are the only difference."""
        import_content(small())
        out = build_content()
        self.assertEqual(differences(small(), legacy_view(out)), [])
        self.assertEqual(dumps(legacy_view(out)), dumps(small()))
        extra = {k for e in out["events"] for k in e} - {k for e in small()["events"] for k in e}
        self.assertLessEqual(extra, set(ADDITIVE["event"]))

    def test_single_source_marks_events_resting_on_one_publisher(self):
        import_content(small())
        flagged = {e["id"] for e in build_content()["events"] if e.get("singleSource")}
        # Wikipedia only, and one non-Wikipedia publisher: one witness each. Wikipedia + Britannica: two.
        self.assertIn("an-punic-wars", flagged)
        self.assertIn("un-charter", flagged)
        self.assertNotIn("an-caesar-assassinated", flagged)
        # A second publisher on an atomic part (the date) lifts the marker.
        from evidence.services import record_evidence
        from timeline.services import apply_changes

        record = Claim.objects.get(entry__slug="un-charter", field="as_written", key="")
        with revising("agent:test", reason="second source"):
            part = Claim(entry=record.entry, parent=record, field="date", key="")
            apply_changes(part, {"value": {"when": "1945"}})
            record_evidence(part, url="https://avalon.law.yale.edu/subject_menus/unmenu.asp", stance="supports", checked_by="agent:test", title="UN documents")
        self.assertNotIn("un-charter", {e["id"] for e in build_content()["events"] if e.get("singleSource")})

    def test_single_source_is_deterministic(self):
        import_content(small())
        self.assertEqual(dumps(build_content()), dumps(build_content()))

    def test_unpublished_entries_and_links_to_them_stay_out(self):
        import_content(small())
        with revising("human:owner"):
            Branch.objects.filter(slug="roman-kingdom").update(status=Status.RETRACTED)
        out = build_content()
        self.assertNotIn("roman-kingdom", [b["id"] for b in out["branches"]])
        rr = next(b for b in out["branches"] if b["id"] == "roman-republic")
        self.assertEqual(rr["parents"], [])
        self.assertEqual(rr["origin"]["links"], [])

    def test_conflicting_evidence_is_not_shown_as_a_source(self):
        import_content(small())
        with revising("agent:verifier"):
            Evidence.objects.filter(claim__entry__slug="an-punic-wars").update(stance="conflicts")
        ev = next(e for e in build_content()["events"] if e["id"] == "an-punic-wars")
        self.assertEqual(ev["cites"], [])

    def test_publish_writes_a_snapshot_once_per_content(self):
        from infra import storage

        import_content(small())
        r1, created1 = publish(actor="job:test", skip_gates=("build",))
        r2, created2 = publish(actor="job:test", skip_gates=("build",))
        self.assertTrue(created1)
        self.assertFalse(created2)
        self.assertEqual(r1.pk, r2.pk)
        body = storage.read(storage.RELEASES, r1.snapshot_path)
        self.assertEqual(legacy_view(json.loads(body)), small())
        self.assertEqual(storage.read_pointer()["version"], r1.version)
        self.assertEqual(r1.counts["events"], 4)
        self.assertEqual(Release.objects.count(), 1)

    @skipUnless(shutil.which("node"), "needs Node")
    def test_site_builds_from_the_snapshot_identically(self):
        """The same content built from a dump and from a snapshot gives byte-identical pages."""
        import_content(small())
        tmp = Path(tempfile.mkdtemp())
        try:
            (tmp / "a.json").write_text(dumps(small()))
            (tmp / "b.json").write_text(dumps(legacy_view(build_content())))
            pages = []
            for name in ("a", "b"):
                subprocess.run(
                    ["node", str(settings.SITE_DIR / "build.mjs"), "--from-json", str(tmp / f"{name}.json"), "--built", "2026-01-01", "--out", str(tmp / f"{name}.html")],
                    check=True, capture_output=True,
                )
                pages.append((tmp / f"{name}.html").read_bytes())
            self.assertEqual(pages[0], pages[1])
        finally:
            shutil.rmtree(tmp)


class FormatTests(TestCase):
    def test_python_keys_match_canonical_mjs(self):
        self.assertEqual(read_js_keys(), KEYS)

    def test_numbers_print_as_javascript_does(self):
        cases = {-13.8e9: "-13800000000", 1969.55: "1969.55", 2.0: "2", 0.00001: "0.00001", 1e-7: "1e-7", 1e21: "1e+21", -0.0: "0", 41.8955: "41.8955", 7: "7"}
        for x, js in cases.items():
            self.assertEqual(js_number(x), js, x)

    def test_json_matches_json_stringify_indent_1(self):
        self.assertEqual(dumps({"a": [1, {"b": "é\n\"q\""}], "c": [], "d": {}, "e": None}), '{\n "a": [\n  1,\n  {\n   "b": "é\\n\\"q\\""\n  }\n ],\n "c": [],\n "d": {},\n "e": null\n}\n')
