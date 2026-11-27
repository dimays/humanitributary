"""scripts/check_ste.py (`make check-manual`): the Maintainer's Manual's STE rules, and the manual itself passing them."""

import importlib.util
import sys
import tempfile
from pathlib import Path

from django.test import SimpleTestCase

ROOT = Path(__file__).resolve().parent.parent


def _module():
    spec = importlib.util.spec_from_file_location("check_ste", ROOT / "scripts" / "check_ste.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules["check_ste"] = mod  # (dataclasses look their module up)
    spec.loader.exec_module(mod)
    return mod


ste = _module()
HEAD = "# A title\n\nPurpose: a test file.\n\n"


def problems(body: str, head: str = HEAD) -> list[str]:
    return ste.check_text(head + body, "t.md")[1]


def words(n: int, last: str = "end") -> str:
    return " ".join(["word"] * (n - 1) + [last]) + "."


class SentenceTests(SimpleTestCase):
    def test_a_step_may_have_20_words_not_21(self):
        self.assertEqual(problems(f"1. {words(20)}\n"), [])
        found = problems(f"1. {words(21)}\n")
        self.assertEqual(len(found), 1)
        self.assertIn("procedural sentence (a numbered step) has 21 words (limit 20)", found[0])

    def test_prose_and_bullets_may_have_25_words_not_26(self):
        self.assertEqual(problems(words(25) + "\n"), [])
        self.assertEqual(problems(f"- {words(25)}\n"), [])
        self.assertIn("sentence has 26 words (limit 25)", problems(words(26) + "\n")[0])
        self.assertIn("has 26 words", problems(f"- {words(26)}\n")[0])

    def test_a_step_continued_after_a_code_block_is_still_a_step(self):
        body = f"1. Run the command.\n\n   ```bash\n   make check\n   ```\n\n   {words(21)}\n"
        found = problems(body)
        self.assertEqual(len(found), 1)
        self.assertIn("(limit 20)", found[0])

    def test_inline_code_counts_as_one_word_and_urls_and_links_are_skipped(self):
        long_code = "`" + " ".join(["x"] * 40) + "`"
        self.assertEqual(problems(f"Run {long_code} now.\n"), [])
        self.assertEqual(problems("Open https://example.com/a/very/long/path now.\n"), [])
        self.assertEqual(problems("Read [the long link text here](https://example.com) now.\n"), [])

    def test_a_paragraph_may_have_six_sentences_not_seven(self):
        self.assertEqual(problems("A cat sat. " * 6 + "\n"), [])
        self.assertIn("paragraph has 7 sentences (limit 6)", problems("A cat sat. " * 7 + "\n")[0])

    def test_a_blank_line_starts_a_new_paragraph(self):
        self.assertEqual(problems("A cat sat. " * 4 + "\n\n" + "A dog sat. " * 4 + "\n"), [])


class WordTests(SimpleTestCase):
    def test_passive_voice_is_flagged(self):
        self.assertIn("likely passive voice", problems("The file is written by the job.\n")[0])
        self.assertIn("likely passive voice", problems("The rows are not changed.\n")[0])
        self.assertIn("likely passive voice", problems("It must be kept.\n")[0])

    def test_active_voice_states_and_code_pass(self):
        self.assertEqual(problems("The job writes the file.\n"), [])
        self.assertEqual(problems("The card is red.\n"), [])
        self.assertEqual(problems("The valve is closed.\n"), [])  # PASSIVE_ALLOW
        self.assertEqual(problems("The task is `queued`.\n"), [])  # a status value: code

    def test_ing_words_are_flagged_outside_code_and_the_allowlist(self):
        self.assertIn('"-ing" word "running"', problems("The job is running.\n")[0])
        self.assertEqual(problems("The status is `pending`.\n"), [])
        self.assertEqual(problems("Nothing changes during the run on staging.\n"), [])
        self.assertEqual(problems("> **WARNING:** Do not do this.\n"), [])

    def test_future_tense_is_flagged(self):
        self.assertIn('future or conditional verb "will"', problems("The job will run.\n")[0])

    def test_headings_are_checked_for_words_not_length(self):
        self.assertIn("-ing", problems("## Publishing a release\n")[0])
        self.assertEqual(problems("## " + " ".join(["Word"] * 30) + "\n"), [])


class SkipTests(SimpleTestCase):
    def test_code_blocks_are_skipped(self):
        self.assertEqual(problems("```bash\n" + words(40) + " is written running will\n```\n"), [])

    def test_table_code_cells_are_skipped_and_prose_cells_checked(self):
        table = "| Name | What |\n|---|---|\n| `run_jobs --loop \\| tee` | It runs the jobs. |\n"
        self.assertEqual(problems(table), [])
        self.assertIn("-ing", problems("| Name | What |\n|---|---|\n| `x` | It is running. |\n")[0])
        self.assertIn("has 26 words", problems(f"| A | B |\n|---|---|\n| `x` | {words(26)} |\n")[0])

    def test_html_comments_are_skipped(self):
        self.assertEqual(problems("<!-- a comment that is written running -->\n"), [])
        self.assertEqual(problems("<!--\nthis is written\n-->\n"), [])


class StructureTests(SimpleTestCase):
    def test_a_file_starts_with_a_title_and_a_purpose(self):
        self.assertIn("must start with a '# Title'", problems("Text.\n", head="")[0])
        self.assertIn("purpose", problems("Text.\n", head="# Title\n\nText first.\n")[0])
        self.assertEqual(problems("Text.\n", head="# Title\n\n**Purpose:** a file.\n\n"), [])

    def test_relative_links_must_land(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "there.md").write_text("x")
            text = HEAD + "See [this](there.md) and [that](gone.md#part) and [web](https://example.com).\n"
            found = ste.check_text(text, "t.md", base=Path(d))[1]
        self.assertEqual(len(found), 1)
        self.assertIn("'gone.md#part' does not land", found[0])

    def test_an_unclosed_code_block_is_a_problem(self):
        self.assertIn("not closed", problems("```\ncode\n")[-1])


class MermaidTests(SimpleTestCase):
    def mermaid(self, body: str) -> list[str]:
        return problems("```mermaid\n" + body + "\n```\n")

    def test_known_types_with_balanced_brackets_pass(self):
        self.assertEqual(self.mermaid('flowchart LR\n  A["Web (gunicorn)"] --> B[(Postgres)]\n  subgraph S["Heroku"]\n    A\n  end'), [])
        self.assertEqual(self.mermaid("erDiagram\n  Entry ||--o{ Claim : states\n  Claim }o--|| Entry : on\n  Entry {\n    string slug\n  }"), [])
        self.assertEqual(self.mermaid("sequenceDiagram\n  A->>B: claim\n  B-->>A: task\n  loop each task\n    A->>B: read\n  end"), [])

    def test_an_unknown_type_is_flagged(self):
        self.assertIn("not a known diagram type", self.mermaid("flowchrt LR\n  A --> B")[0])

    def test_a_bad_direction_is_flagged(self):
        self.assertIn("direction", self.mermaid("flowchart XY\n  A --> B")[0])

    def test_unbalanced_brackets_and_quotes_are_flagged(self):
        self.assertIn("unbalanced brackets", self.mermaid("flowchart LR\n  A[Web --> B")[0])
        self.assertIn("unbalanced brackets", self.mermaid("flowchart LR\n  A(Web] --> B")[0])
        self.assertIn("unbalanced double quote", self.mermaid('flowchart LR\n  A["Web] --> B')[0])

    def test_brackets_inside_quotes_are_text(self):
        self.assertEqual(self.mermaid('flowchart LR\n  A["a ( b"] --> B'), [])

    def test_blocks_must_close(self):
        self.assertIn("not closed", self.mermaid("flowchart LR\n  subgraph S\n    A --> B")[0])
        self.assertIn("not closed", self.mermaid("sequenceDiagram\n  alt yes\n    A->>B: x")[0])
        self.assertIn("without an open block", self.mermaid("flowchart LR\n  A --> B\n  end")[0])

    def test_an_empty_block_is_flagged(self):
        self.assertIn("empty", self.mermaid("%% only a comment")[0])


class ManualTests(SimpleTestCase):
    def test_the_manual_passes(self):
        files, counted, found = ste.run()
        self.assertGreater(files, 10)
        self.assertGreater(counted, 100)
        self.assertEqual(found, [])
