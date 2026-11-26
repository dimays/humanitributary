"""The docs' checks (docs/guide/this-guide.md): the ADR check, the guide's
coverage and checks, and the hooks' reading of a shell command."""

import importlib.util
import sys
import tempfile
from pathlib import Path

from django.test import SimpleTestCase

from guide import checks, coverage
from guide.chapters import ROOT, Chapter, FrontMatterError, parse_front_matter


def _module(name, rel):
    spec = importlib.util.spec_from_file_location(name, ROOT / rel)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


check_adr = _module("check_adr", "scripts/check_adr.py")
hook_input = _module("hook_input", ".claude/hooks/hook_input.py")


def adr(n, slug, status, body=""):
    return f"{n}-{slug}.md", f"# {n} — {slug.replace('-', ' ').capitalize()}\n\n**Status:** {status}\n\n## Context\n\n{body}\n"


class AdrCheckTests(SimpleTestCase):
    def run_on(self, *files, readme=True):
        d = Path(tempfile.mkdtemp())
        for name, text in files:
            (d / name).write_text(text)
        if readme:
            (d / "README.md").write_text(f"# Decisions\n\n{check_adr.START}\n{check_adr.END}\n")
            check_adr.run(d, write=True)
        return check_adr.run(d)[1]

    def test_a_consistent_set_passes(self):
        problems = self.run_on(
            adr("0001", "first", "accepted (November 2026); amended by [0002](0002-second.md)"),
            adr("0002", "second", "accepted (November 2026). Amends [0001](0001-first.md)."),
        )
        self.assertEqual(problems, [])

    def test_an_amendment_must_be_named_back(self):
        problems = self.run_on(
            adr("0001", "first", "accepted (November 2026)"),
            adr("0002", "second", "accepted (November 2026). Refines [0001](0001-first.md)."),
        )
        self.assertEqual(len(problems), 1)
        self.assertIn("0001-first.md: its Status should name 0002", problems[0])

    def test_an_amendment_in_plain_text_fails(self):
        problems = self.run_on(adr("0001", "first", "accepted"), adr("0002", "second", "accepted. Supersedes ADR 0001."))
        self.assertTrue(any("name it with a link" in p for p in problems), problems)

    def test_names_numbers_titles_statuses_and_links(self):
        problems = self.run_on(
            adr("0001", "first", "accepted"),
            ("0001-again.md", "# 0001 — Again\n\n**Status:** accepted\n"),
            ("0002-wrong-title.md", "# 0003 — Wrong\n\n**Status:** maybe\n\nSee [0009](0009-missing.md).\n"),
            ("notes.md", "# Notes\n"),
        )
        text = "\n".join(problems)
        self.assertIn("0001 is taken", text)
        self.assertIn('title should start "# 0002 — "', text)
        self.assertIn("Status should start", text)
        self.assertIn("links to 0009-missing.md", text)
        self.assertIn("notes.md: name it NNNN-words.md", text)

    def test_the_index_must_be_complete(self):
        d = Path(tempfile.mkdtemp())
        name, text = adr("0001", "first", "accepted")
        (d / name).write_text(text)
        (d / "README.md").write_text(f"{check_adr.START}\n{check_adr.END}\n")
        self.assertTrue(any("index is out of date" in p for p in check_adr.run(d)[1]))
        check_adr.run(d, write=True)
        self.assertEqual(check_adr.run(d)[1], [])
        self.assertIn("| [0001](0001-first.md) | First | accepted |", (d / "README.md").read_text())

    def test_the_repositorys_adrs_pass(self):
        self.assertEqual(check_adr.run()[1], [])


class CoverageTests(SimpleTestCase):
    def chapter(self, *covers):
        return Chapter(slug="x", path=ROOT / "docs/guide/x.md", title="X", summary="", order=1, body="", covers=covers)

    def test_patterns(self):
        self.assertTrue(coverage.matches("ingest/**", "ingest/a/b.py"))
        self.assertTrue(coverage.matches("ingest/*.py", "ingest/jobs.py"))
        self.assertFalse(coverage.matches("ingest/*.py", "ingest/migrations/0001.py"))
        self.assertTrue(coverage.matches("ingest", "ingest/jobs.py"))
        self.assertTrue(coverage.matches("**/models.py", "models.py"))
        self.assertFalse(coverage.matches("ingest", "ingestion/x.py"))

    def test_exclusions_and_empty_patterns(self):
        files = ["ingest/jobs.py", "ingest/migrations/0001_initial.py", "work/queue.py"]
        paths, empty = coverage.covered(self.chapter("ingest/**", "!ingest/migrations/**", "nothing/**"), files)
        self.assertEqual(paths, ["ingest/jobs.py"])
        self.assertEqual(empty, ["nothing/**"])

    def test_the_hash_moves_with_the_code_and_only_then(self):
        d = Path(tempfile.mkdtemp())
        (d / "a.py").write_text("x = 1\n")
        (d / "b.py").write_text("y = 2\n")
        before = coverage.fingerprint(["a.py", "b.py"], d)
        self.assertEqual(before, coverage.fingerprint(["a.py", "b.py"], d))
        (d / "a.py").write_text("x = 2\n")
        self.assertNotEqual(before, coverage.fingerprint(["a.py", "b.py"], d))
        self.assertNotEqual(coverage.fingerprint(["a.py"], d), coverage.fingerprint(["a.py", "b.py"], d))

    def test_a_blob_hash_is_gits(self):
        d = Path(tempfile.mkdtemp())
        (d / "a.txt").write_text("hello\n")
        self.assertEqual(coverage.blob("a.txt", d), "ce013625030ba8dba906f756967f9e9ca394464a")  # git hash-object

    def test_a_missing_stamp_is_stale(self):
        ch = self.chapter("guide/coverage.py")
        fresh = coverage.freshness(ch, ["guide/coverage.py"], stamps={})
        self.assertFalse(fresh.fresh)
        fresh = coverage.freshness(ch, ["guide/coverage.py"], stamps={"x": {"reviewed": "2026-11-26", "hash": fresh.current}})
        self.assertTrue(fresh.fresh)


class MarkdownTests(SimpleTestCase):
    def test_front_matter(self):
        fields, body, line = parse_front_matter("---\ntitle: A\norder: 3\ncovers:\n  - a/**\n  - \"!a/b/**\"\n---\nBody\n")
        self.assertEqual(fields, {"title": "A", "order": "3", "covers": ["a/**", "!a/b/**"]})
        self.assertEqual(body, "Body\n")
        with self.assertRaises(FrontMatterError):
            parse_front_matter("# no front matter\n")

    def test_anchors_as_github_makes_them(self):
        self.assertEqual(checks.anchor("Stage 2: ingest"), "stage-2-ingest")
        self.assertEqual(checks.anchor("`run_jobs` and the lock"), "run_jobs-and-the-lock")
        self.assertEqual(checks.anchors("## A\n## A\n```\n## not a heading\n```\n"), {"a", "a-1"})

    def test_links_and_paths_outside_code(self):
        text = "See [x](ingestion.md#routing) and `ingest/jobs.py`, `manage.py`, `var/raw/`, `a <b>`.\n```\n[y](nope.md) `nope/x.py`\n```\n`[z](inline.md)`\n"
        self.assertEqual(checks.links(text), [(1, "ingestion.md#routing")])
        self.assertEqual([p for _, p in checks.code_paths(text)], ["ingest/jobs.py", "manage.py"])

    def test_the_repositorys_guide_holds_together(self):
        # Links, paths, front matter, the chapter list; stamps are make check-guide's.
        self.assertEqual(checks.run(freshness=False).problems, [])


class HookInputTests(SimpleTestCase):
    def runs(self, command, *program):
        return hook_input.invocation(command, *program)

    def test_a_real_commit(self):
        self.assertEqual(self.runs('git commit -m "x"', "git", "commit"), ["git", "commit", "-m", "x"])
        self.assertIsNotNone(self.runs("make check && git commit -am x", "git", "commit"))
        self.assertIsNotNone(self.runs("cd ../x && git -C sub commit", "git", "commit"))
        self.assertIsNotNone(self.runs("echo $(git commit -m x)", "git", "commit"))
        self.assertIsNotNone(self.runs("GIT_AUTHOR_NAME=a git commit", "git", "commit"))

    def test_not_a_commit(self):
        self.assertIsNone(self.runs('echo "git commit"', "git", "commit"))
        self.assertIsNone(self.runs("cat > notes.md <<'EOF'\nthen git commit\nEOF\necho done", "git", "commit"))
        self.assertIsNone(self.runs("git status # then git commit", "git", "commit"))
        self.assertIsNone(self.runs("git log --grep commit", "git", "commit"))

    def test_gh_pr_create(self):
        self.assertIsNotNone(self.runs("gh -R o/r pr create --fill", "gh", "pr", "create"))
        self.assertIsNone(self.runs("gh pr view", "gh", "pr", "create"))

    def test_the_folder(self):
        d = tempfile.mkdtemp()
        self.assertEqual(hook_input.folder(f"cd {d} && git commit", "/", ["git", "commit"]), d)
        self.assertEqual(hook_input.folder("git -C sub commit", d, ["git", "-C", "sub", "commit"]), d)  # no such folder
        Path(d, "sub").mkdir()
        self.assertEqual(hook_input.folder("git -C sub commit", d, ["git", "-C", "sub", "commit"]), str(Path(d, "sub")))
