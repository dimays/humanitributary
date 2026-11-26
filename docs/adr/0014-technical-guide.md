# 0014 — A technical guide whose chapters are stamped against the code they cover

**Status:** proposed (November 2026)

## Context

The platform's design lives in thirteen ADRs, `AGENTS.md`, three long docs
(`docs/data-model.md`, `docs/fact-checking.md`, `docs/branch-rules.md`) and
the code. Many sessions change the code at once, and every one of them
starts by reading the docs. Docs written once drift: writing the guide from
the code found more than a dozen places where an ADR, a doc or a docstring
no longer said what the code does (a batch size, which statuses are
retried, which proposals are held back, what link health queues). Nothing
told anyone. We want design that builds on itself and is never lost, and a
reader who can trust what they read.

The same mechanism has worked in another of the owner's projects for
months: chapters declare the code they explain, a hash of that code is the
chapter's stamp, and a check fails when they differ.

## Decision

- `docs/guide/` holds the technical guide: one chapter per part of the
  platform (architecture, content model, ingestion, sources and terms, the
  work queue and agents, evidence and fact checking, branch governance,
  revisions, publishing, operations, this guide, a glossary), written from
  the code. `docs/architecture.md` points into it.
- Each chapter's front matter has `title`, `summary`, `order` and `covers`
  (globs). Its stamp, the review date and a hash of the covered files as
  git would commit them, lives in `docs/guide/stamps.json`, written only by
  `manage.py guide stamp` (`make guide-stamp CHAPTER=…`).
- `make check-guide` (`manage.py guide check`, the `guide` app) fails on a
  stale chapter, naming the files that changed and the `git diff` to read,
  and on broken links, backticked paths that don't exist, patterns that
  match nothing, and an incomplete chapter list.
- AGENTS.md rule 14: every change that alters behavior updates the guide in
  the same pull request. Rule 15: every real decision gets an ADR, and an
  accepted ADR is amended or superseded by a new one, never silently edited;
  `make check-adr` holds the ADRs to each other.

The guide says how things work now; ADRs say why. A chapter links its ADRs
instead of restating them.

## Consequences

- A behavior change can't merge without someone reading the chapters it
  touches; the check says exactly which. The cost is a stamp per affected
  chapter per pull request, and chapters that cover shared files
  (`ingest/models.py`, the Makefile) ask to be re-read more often.
- A stamp is a claim, not a proof: someone can stamp without reading. The
  rule and the pull request template ("guide chapters updated") are what
  stop that.
- `stamps.json` is one file every branch writes. Two branches stamping
  neighboring chapters can conflict; resolve by re-stamping both chapters
  after the merge (the hashes are recomputed, so nothing is lost).
- The older docs (`docs/fact-checking.md`, `docs/branch-rules.md`,
  `docs/data-model.md`) aren't stamped. The chapters link them for rationale
  and stand alone for mechanism; folding them into the guide is a later
  choice.
- The disagreements the first writing found are listed in the pull request
  that added the guide, for the owner to rule on; the chapters follow the
  code.
