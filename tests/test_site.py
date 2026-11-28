"""The public page's globe: every entry gets one, with a "Location data not found" caption when it has no usable
location, and a globe that fails to draw never breaks the panel (site/test-globe.mjs). The build reports the entries
that fall back. No database."""

import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from unittest import skipUnless

from django.conf import settings
from django.test import SimpleTestCase

from publish.content import dumps

from .fixtures import small


@skipUnless(shutil.which("node"), "needs Node")
class GlobeFallbackTests(SimpleTestCase):
    def test_the_globe_cases(self):
        r = subprocess.run(["node", str(settings.SITE_DIR / "test-globe.mjs")], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn("globe cases passed", r.stdout)

    def test_the_build_reports_entries_without_a_location(self):
        content = small()
        del content["events"][1]["geo"]  # an-punic-wars
        content["events"][2]["geo"]["lat"] = 137.78  # un-charter: out of range (the export's checks would refuse it)
        tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, tmp, True)
        (tmp / "c.json").write_text(dumps(content))
        r = subprocess.run(["node", str(settings.SITE_DIR / "build.mjs"), "--from-json", str(tmp / "c.json"), "--built", "2026-01-01",
                            "--out", str(tmp / "p.html")], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, "not errors: the page still builds\n" + r.stdout + r.stderr)
        self.assertIn('1 of 4 events have no geo: their globes say "Location data not found"', r.stdout)
        self.assertIn("un-charter: geo is not usable (scope place, lat 137.78, lon -122.4193)", r.stdout)
        page = (tmp / "p.html").read_text()
        self.assertIn(".globe .g-missing", page)
        data = json.loads(page.split("const DATA = ", 1)[1].split(";\nconst GLOBE = ", 1)[0])
        self.assertNotIn("geo", next(e for e in data["events"] if e["id"] == "an-punic-wars"), "the page gets the snapshot as it is")

    def test_a_snapshot_with_every_location_reports_nothing(self):
        tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, tmp, True)
        (tmp / "c.json").write_text(dumps(small()))
        r = subprocess.run(["node", str(settings.SITE_DIR / "build.mjs"), "--from-json", str(tmp / "c.json"), "--check"],
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertNotIn("Location data not found", r.stdout)
