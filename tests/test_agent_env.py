"""The agent environment variables' new names, with the old ones as a fallback (ADR 0047). No database.

Each skill's API helper is copied out of its SKILL.md and run in bash, in a subprocess whose environment holds only
fake values, with a stand-in `curl` on PATH that prints its arguments. The new name must win when both are set, the
old one must still work alone, and run-round's `tokvar` must name a variable without printing its value.
"""

import os
import re
import subprocess
import tempfile
from pathlib import Path
from unittest import mock

from django.conf import settings
from django.test import SimpleTestCase

SKILLS = settings.BASE_DIR / ".claude" / "skills"
ROLE_SKILLS = ("drain-write-events", "fill-gaps", "map-branch-entities", "review-branch-proposals", "verify-claims")
ALL_SKILLS = ROLE_SKILLS + ("verify-stale-claims", "run-round")
URL = "${MANYAGES_API:-$HUMANITRIBUTARY_API}"

# Fake values only: never a real token in a test.
NEW_URL, OLD_URL = "https://new.invalid/api/agent", "https://old.invalid/api/agent"
NEW_TOKEN, OLD_TOKEN = "fake-new-token", "fake-old-token"


def _text(skill: str) -> str:
    return (SKILLS / skill / "SKILL.md").read_text()


def _role_helper(skill: str) -> str:
    match = re.search(r"^api\(\) \{.*\}$", _text(skill), re.M)
    assert match, f"{skill}: no api() helper"
    return match.group(0)


def _round_helpers() -> str:
    match = re.search(r"^tokvar\(\) \{.*?\"\$@\"; \}$", _text("run-round"), re.M | re.S)
    assert match, "run-round: no tokvar() and api() helpers"
    return match.group(0)


class AgentEnvTests(SimpleTestCase):
    def setUp(self):
        self.bin = tempfile.TemporaryDirectory()
        self.addCleanup(self.bin.cleanup)
        curl = Path(self.bin.name) / "curl"
        curl.write_text('#!/bin/sh\nfor a in "$@"; do printf "%s\\n" "$a"; done\n')
        curl.chmod(0o755)

    def _bash(self, script: str, **env) -> subprocess.CompletedProcess:
        environ = {"PATH": f"{self.bin.name}:/usr/bin:/bin", **env}
        return subprocess.run(["bash", "-c", "set -euo pipefail\n" + script], env=environ, capture_output=True, text=True, timeout=30)

    def _call(self, helper: str, call: str, **env) -> list[str]:
        result = self._bash(f"{helper}\n{call}", **env)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.splitlines()

    def test_every_role_skill_prefers_the_new_names_and_falls_back_to_the_old(self):
        call = f'api "{URL}/probe"'
        for skill in ROLE_SKILLS:
            helper = _role_helper(skill)
            with self.subTest(skill=skill, names="both"):
                out = self._call(helper, call, MANYAGES_API=NEW_URL, MANYAGES_API_TOKEN=NEW_TOKEN,
                                 HUMANITRIBUTARY_API=OLD_URL, HUMANITRIBUTARY_API_TOKEN=OLD_TOKEN)
                self.assertIn(f"Authorization: Bearer {NEW_TOKEN}", out)
                self.assertIn(f"{NEW_URL}/probe", out)
            with self.subTest(skill=skill, names="new only"):
                out = self._call(helper, call, MANYAGES_API=NEW_URL, MANYAGES_API_TOKEN=NEW_TOKEN)
                self.assertIn(f"Authorization: Bearer {NEW_TOKEN}", out)
                self.assertIn(f"{NEW_URL}/probe", out)
            with self.subTest(skill=skill, names="old only"):
                out = self._call(helper, call, HUMANITRIBUTARY_API=OLD_URL, HUMANITRIBUTARY_API_TOKEN=OLD_TOKEN)
                self.assertIn(f"Authorization: Bearer {OLD_TOKEN}", out)
                self.assertIn(f"{OLD_URL}/probe", out)

    def test_run_round_resolves_each_role_new_first_without_printing_a_value(self):
        helpers = _round_helpers()
        call = f'api ROUND "{URL}/probe"'
        out = self._call(helpers, call, MANYAGES_API=NEW_URL, MANYAGES_TOKEN_ROUND=NEW_TOKEN,
                         HUMANITRIBUTARY_API=OLD_URL, HUMANITRIBUTARY_TOKEN_ROUND=OLD_TOKEN)
        self.assertIn(f"Authorization: Bearer {NEW_TOKEN}", out)
        self.assertIn(f"{NEW_URL}/probe", out)
        out = self._call(helpers, call, HUMANITRIBUTARY_API=OLD_URL, HUMANITRIBUTARY_TOKEN_ROUND=OLD_TOKEN)
        self.assertIn(f"Authorization: Bearer {OLD_TOKEN}", out)
        self.assertIn(f"{OLD_URL}/probe", out)
        # An empty new value counts as unset.
        out = self._call(helpers, call, MANYAGES_API=NEW_URL, MANYAGES_TOKEN_ROUND="", HUMANITRIBUTARY_TOKEN_ROUND=OLD_TOKEN)
        self.assertIn(f"Authorization: Bearer {OLD_TOKEN}", out)

        # tokvar names the variable and never prints its value.
        self.assertEqual(self._call(helpers, "tokvar WRITER", MANYAGES_TOKEN_WRITER=NEW_TOKEN, HUMANITRIBUTARY_TOKEN_WRITER=OLD_TOKEN),
                         ["MANYAGES_TOKEN_WRITER"])
        self.assertEqual(self._call(helpers, "tokvar WRITER", HUMANITRIBUTARY_TOKEN_WRITER=OLD_TOKEN), ["HUMANITRIBUTARY_TOKEN_WRITER"])

        # A missing token is an error under set -u, not an empty header, and curl is never called.
        result = self._bash(f"{helpers}\n{call}", MANYAGES_API=NEW_URL)
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("Authorization", result.stdout)
        self.assertIn("no token for ROUND", result.stderr)

        # A role agent's token is put in place by name, never echoed.
        brief = re.search(r"`(v=\$\(tokvar WRITER\) && export MANYAGES_API_TOKEN=\"\$\{!v\}\")`", _text("run-round"))
        self.assertTrue(brief, "run-round briefs role agents with tokvar")
        result = self._bash(f'{helpers}\n{brief.group(1)}\nprintf "%s" "${{#MANYAGES_API_TOKEN}}"', HUMANITRIBUTARY_TOKEN_WRITER=OLD_TOKEN)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, str(len(OLD_TOKEN)))

    def test_no_skill_reads_an_old_name_without_the_fallback(self):
        for skill in ALL_SKILLS:
            text = _text(skill)
            for match in re.finditer(r"\$\{?HUMANITRIBUTARY_\w+", text):
                with self.subTest(skill=skill, at=match.start()):
                    self.assertEqual(text[match.start() - 2:match.start()], ":-", f"{skill}: {match.group(0)} without a MANYAGES_ name first")
            self.assertNotIn('"$MANYAGES_API/', text, f"{skill}: a URL without the fallback")

    def test_tasks_reads_the_new_agent_name_first(self):
        from work.management.commands.tasks import _env

        with mock.patch.dict(os.environ, {"MANYAGES_AGENT": "agent:new", "HUMANITRIBUTARY_AGENT": "agent:old"}):
            self.assertEqual(_env("AGENT"), "agent:new")
        with mock.patch.dict(os.environ, {"HUMANITRIBUTARY_AGENT": "agent:old"}):
            os.environ.pop("MANYAGES_AGENT", None)
            self.assertEqual(_env("AGENT"), "agent:old")
        with mock.patch.dict(os.environ, {"MANYAGES_AGENT": "", "HUMANITRIBUTARY_AGENT": "agent:old"}):
            self.assertEqual(_env("AGENT"), "agent:old")
        with mock.patch.dict(os.environ, {}):
            os.environ.pop("MANYAGES_AGENT", None)
            os.environ.pop("HUMANITRIBUTARY_AGENT", None)
            self.assertEqual(_env("AGENT"), "")
