# 0030 — A Maintainer's Manual in Simplified Technical English, checked by a script

**Status:** proposed (November 2026)

## Context

One person maintains and operates the platform. The technical guide (`docs/guide/`, ADR 0014) is accurate and
stamped against the code, but it is a developer reference: it says how each part works, chapter by chapter, in
long, dense prose. It doesn't say, in one place and in order, what to do: run an agent round, apply a review's edit
file, publish, roll back, free a stuck task, restore the database. Those steps are spread across the guide, the
ADRs, AGENTS.md and the review files in `var/reviews/`, and some exist only in the owner's shell history.

The owner wants the clearest possible picture of the system: diagrams that match the code, and procedures whose
meaning can't be misread under pressure. ASD-STE100 Simplified Technical English (Issue 9) is the standard
controlled language for maintenance documentation: short sentences, one instruction per step, active voice,
present tense, no "-ing" forms, conditions first, one word for one meaning, and WARNING / CAUTION labels for risk.
Rules like these drift unless something checks them.

## Decision

- **Maintainer-facing docs live in `docs/manual/`**, written in STE: a README (how to use it, the rules), a system
  overview, the architecture (context, component, data-flow and deployment diagrams, and sequence diagrams for an
  agent round, a publish and a rollback, in Mermaid), every scheduled job, the main tables with an ER diagram,
  twelve numbered procedures (each step one instruction and a "Make sure that…" check), troubleshooting, and a
  glossary. Each file starts with a title and a one-line purpose.
- **The guide stays the developer reference.** The manual says what to do; the guide says how the code works. When
  the code changes what a procedure, a diagram or a table in the manual says, the same pull request updates the
  manual (AGENTS.md).
- **`scripts/check_ste.py` (`make check-manual`) checks what a program can**: procedural sentences (numbered steps)
  of at most 20 words and other sentences of at most 25; paragraphs of at most 6 sentences; likely passive voice
  ("be" plus a past participle); "-ing" words; "will", "would" and "shall"; the title and purpose lines; relative
  links; and each Mermaid block's diagram type, brackets, quotes and `end`s. Code blocks, inline code, URLs and HTML
  comments are skipped, so code identifiers stay unchanged; technical names the rules would flag go in an
  allowlist in the script, with the reason. Standard library only, like `scripts/check_adr.py`.
- **It is part of the gate**: `make check-pr` runs it in its quick lane, so CI holds every pull request to it.
  `tests/test_check_ste.py` tests each rule and that the manual passes.

## Consequences

- The owner has one place to act from, with numbered steps and checks, and diagrams that name the real processes,
  buckets, DNS names and commands.
- The rules a program can't check (one instruction per sentence, imperative mood, articles, no phrasal verbs,
  conditions first, one word one meaning) rest on the writer and the reviewer; the README lists them so a reviewer
  can hold a pull request to them.
- The passive-voice and "-ing" checks are heuristics: a status written as a word ("is published") is flagged, so
  the manual writes statuses as code (`published`). An allowlist entry needs a reason.
- The manual duplicates some facts in the guide (intervals, caps, commands). The guide's stamps don't cover the
  manual, so a change to a cap's default, a job or a command must update both; AGENTS.md says so. If the drift
  becomes a problem, a later decision can stamp manual files against the code the same way (ADR 0014).
- The operations console renders these files on its Docs page, so Mermaid blocks must render there too: the check
  catches syntax a renderer would reject outright, not layout.
- Numbered `0030`; the console redesign in progress may also take a number, and the second to merge renumbers
  (`docs/adr/README.md`).
