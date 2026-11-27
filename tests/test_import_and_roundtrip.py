"""The loader is idempotent, and since the cutover (ADR 0021) the round trip is DB → snapshot → DB: a snapshot loaded
into an empty database exports to the same bytes, and loading it again writes nothing. The legacy files are frozen."""

import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from unittest import mock, skipUnless

from django.conf import settings
from django.db import transaction
from django.test import TestCase, override_settings

from evidence.models import Citation, Claim, Evidence, Publisher
from publish.compare import differences
from publish.content import ADDITIVE, KEYS, dumps, js_number, read_js_keys, without_derived
from publish.export import build_content
from publish.legacy import ARCHIVE_DIR, ARCHIVE_SHA256, archive_hash, changes, import_content
from publish.models import Release
from publish.release import publish
from revisions import revising
from revisions.models import Revision
from timeline import services
from timeline.models import Branch, BranchLink, Entry, Event, Location, Status

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


class _Undo(Exception):
    pass


class RoundTripTests(TestCase):
    def test_db_to_snapshot_to_db_is_exact(self):
        """A database's snapshot, loaded into an empty database, exports to the same bytes (derived keys included),
        and loading it again writes nothing. Content written in Postgres alone (after the cutover) comes back too."""
        try:
            with transaction.atomic():
                import_content(small())
                with revising("agent:writer", reason="written in Postgres alone"):
                    services.save_event("an-sulla-dictator", branch="roman-republic", y=-82, when="82 BCE", title="Sulla becomes dictator",
                                        text="Sulla takes the dictatorship.", imp=2, status="published")
                first = dumps(build_content())
                raise _Undo
        except _Undo:
            pass
        self.assertFalse(Entry.objects.exists())
        self.assertIn('"an-sulla-dictator"', first)
        import_content(json.loads(first))
        self.assertEqual(dumps(build_content()), first)
        before = Revision.objects.count()
        stats = import_content(json.loads(first))
        self.assertEqual(changes(stats), 0, {k: v for k, v in stats.items() if not k.endswith("unchanged")})
        self.assertEqual(Revision.objects.count(), before)

    def test_import_then_export_gives_back_the_input(self):
        """The fixture comes back exact; the derived keys (ADR 0018) are the only difference."""
        import_content(small())
        out = build_content()
        self.assertEqual(differences(small(), without_derived(out)), [])
        self.assertEqual(dumps(without_derived(out)), dumps(small()))
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
        self.assertEqual(without_derived(json.loads(body)), small())
        self.assertEqual(storage.read_pointer()["version"], r1.version)
        self.assertEqual(r1.counts["events"], 4)
        self.assertEqual(Release.objects.count(), 1)

    def _site_copy(self) -> Path:
        from publish.release import PAGE_INPUTS

        site = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, site, True)
        for name in PAGE_INPUTS:
            if (settings.SITE_DIR / name).exists():
                shutil.copy(settings.SITE_DIR / name, site / name)
        return site

    def test_a_page_only_change_makes_a_release(self):
        """A release's identity is its content and its page's inputs: a template change publishes without --force,
        and the change report says "page changed; content unchanged"."""
        from infra import storage
        from publish import release as rel
        from publish.changes import page_summary

        import_content(small())
        site = self._site_copy()
        with override_settings(SITE_DIR=site):
            r1, _ = publish(actor="job:test", skip_gates=("build",))
            self.assertEqual(r1.page_hash, rel.page_hash())
            self.assertFalse(publish(actor="job:test", skip_gates=("build",))[1], "nothing changed: no release")
            self.assertEqual(rel.preview(skip_gates=("build",))["unchanged_since"], r1.version)
            (site / "template.html").write_text((site / "template.html").read_text() + "\n<!-- a page-only change -->\n")
            self.assertIsNone(rel.preview(skip_gates=("build",))["unchanged_since"])
            r2, created = publish(actor="job:test", skip_gates=("build",))
        self.assertTrue(created)
        self.assertEqual(r2.content_hash, r1.content_hash)
        self.assertNotEqual(r2.page_hash, r1.page_hash)
        rep = json.loads(storage.read(storage.RELEASES, storage.release_key(r2.version, "changes.json")))
        self.assertEqual(rep["total"], {"added": 0, "changed": 0, "retracted": 0})
        self.assertEqual(rep["page"], {"from": r1.page_hash, "to": r2.page_hash, "changed": True})
        self.assertEqual(page_summary(rep), "page changed; content unchanged")
        self.assertIn(b"page changed; content unchanged", storage.read(storage.RELEASES, storage.release_key(r2.version, "changes.md")))
        self.assertEqual(json.loads(storage.read(storage.RELEASES, storage.release_key(r2.version, "manifest.json")))["page_hash"], r2.page_hash)
        self.assertEqual(storage.read_pointer()["version"], r2.version)

    def test_page_hash_reads_only_the_page_inputs(self):
        from publish.release import page_hash

        site = self._site_copy()
        before = page_hash(site)
        self.assertEqual(before, page_hash(site), "the same files give the same hash")
        (site / "unrelated.txt").write_text("not an input")
        self.assertEqual(before, page_hash(site))
        (site / "canonical.mjs").write_text((site / "canonical.mjs").read_text() + "\n// changed\n")
        self.assertNotEqual(before, page_hash(site))

    def test_a_release_without_a_page_hash_is_followed_by_one_with(self):
        """Releases made before the page hash was recorded: the next publish makes one and says so."""
        from infra import storage
        from publish.changes import page_summary

        import_content(small())
        r1, _ = publish(actor="job:test", skip_gates=("build",))
        Release.objects.filter(pk=r1.pk).update(page_hash="")
        r2, created = publish(actor="job:test", skip_gates=("build",))
        self.assertTrue(created)
        rep = json.loads(storage.read(storage.RELEASES, storage.release_key(r2.version, "changes.json")))
        self.assertEqual(page_summary(rep), f"page inputs not recorded for {r1.version}; content unchanged")
        self.assertFalse(publish(actor="job:test", skip_gates=("build",))[1])

    def test_the_determinism_gate_still_holds_a_page_only_release(self):
        from publish import gates
        from publish import release as rel

        import_content(small())
        site = self._site_copy()
        with override_settings(SITE_DIR=site):
            publish(actor="job:test", skip_gates=("build",))
            (site / "template.html").write_text("<!-- another page -->" + (site / "template.html").read_text())
            content = build_content()
            other = json.loads(dumps(content))
            other["events"][0]["text"] += " (differs)"
            with mock.patch.object(rel, "build_content", side_effect=[content, content, other]), self.assertRaises(gates.PublishRefused) as e:
                publish(actor="job:test", skip_gates=("build",))
        self.assertIn("deterministic", e.exception.problems)
        self.assertEqual(Release.objects.count(), 1)

    def test_the_legacy_archive_is_frozen(self):
        """archive/site-data/ is what the cutover imported; content changes go into Postgres (ADR 0021)."""
        self.assertEqual(archive_hash(ARCHIVE_DIR), ARCHIVE_SHA256, "archive/site-data/ changed: it is frozen since the cutover")
        self.assertFalse((settings.SITE_DIR / "data").exists(), "site/data/ is archived: the page is built from snapshots")

    @skipUnless(shutil.which("node"), "needs Node")
    def test_site_builds_from_the_snapshot_identically(self):
        """The fixture and its snapshot (without derived keys) give byte-identical pages."""
        import_content(small())
        tmp = Path(tempfile.mkdtemp())
        try:
            (tmp / "a.json").write_text(dumps(small()))
            (tmp / "b.json").write_text(dumps(without_derived(build_content())))
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
