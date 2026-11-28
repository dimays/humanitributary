"""The page's picture block (site/template.html, ADR 0048), run in Node by site/test-images.mjs: unflagged pictures render
as before (lazy, sized, credited, the license linked); a flagged one renders blurred behind a short notice and a
keyboard-reachable "Show image" button, and revealing it changes that one figure only."""

import shutil
import subprocess
from unittest import TestCase, skipUnless

from django.conf import settings


class PictureBlock(TestCase):
    @skipUnless(shutil.which("node"), "needs Node")
    def test_blur_and_reveal(self):
        r = subprocess.run(["node", str(settings.SITE_DIR / "test-images.mjs")], capture_output=True, text=True, timeout=60)
        self.assertEqual(r.returncode, 0, r.stderr + r.stdout)
        self.assertTrue(r.stdout.startswith("ok "), r.stdout)
