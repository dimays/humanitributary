# The technical guide

The technical guide explains how every part of the platform works, from the
code as it is. It is read in the repository (GitHub renders it); nothing
serves it. Its chapters are the Markdown files in this folder; this README
and `stamps.json` aren't chapters. How the guide stays true to the code is a
chapter of its own, [this-guide.md](this-guide.md). The rest of this
file is for writers.

## Chapters

In reading order (the list is checked against the chapters; `make
guide-index` rewrites it):

<!-- chapters:start -->
1. [Architecture](architecture.md): The whole platform in seven stages, from the sources it reads to the static page readers see, and where each stage lives in the code.
2. [The content model](content-model.md): The tables that hold what the timeline says (branches, events, their links, places and pictures), how dates and order are stored, and the service layer every write goes through.
3. [Ingestion](ingestion.md): How scheduled, deterministic jobs collect new material (Wikipedia, official feeds, Wikidata), turn it into scored candidates, and queue the best stories as write_event tasks for agents.
4. [Sources and terms](sources-and-terms.md): Which sites the jobs may read automatically, which they must never touch, the terms clause each decision rests on, and how the code enforces it, keys included.
5. [Work queue and agents](work-queue-and-agents.md): The queue that carries judgment work from deterministic jobs to Claude agents, how a task is leased, finished or handed back, and what each kind of task asks for.
6. [Evidence and fact checking](evidence-and-fact-checking.md): How every statement on the timeline is tied to the pages that support it, how its status and confidence are computed, when it is re-read, and the daily sweep that keeps the whole base honest.
7. [Branch governance](branch-governance.md): How fixed rules measure every branch and propose splits, merges, end dates and new branches, how a proposal is kept from flapping, and how an agent's decision is applied, rejected or reverted.
8. [Content waves](content-waves.md): How the timeline is deepened round after round, working backward from today, by measuring every branch window by window, queueing the gaps as fill_gap tasks under a daily cap, and moving on to older history when a wave is nearly done.
9. [Revisions](revisions.md): How every change to canonical content is recorded with who made it, why and for which task, how the database refuses changes that skip that, and how to read the log.
10. [Publishing](publishing.md): How published content leaves Postgres as a versioned static snapshot, the gates a release must pass, how the page is built from it, and the round trip (DB → snapshot → DB) that proves nothing is lost; the legacy files are frozen since the cutover.
11. [Operations](operations.md): How to set the platform up on a laptop, run its jobs on a schedule, tell whether it is healthy, what is and isn't backed up, and what to do when something goes wrong.
12. [The operations console](operations-console.md): The staff-only pages under /ops/, modeled on an orchestrator's console: a Dashboard that says whether anything is wrong, the jobs with their tags and run histories, every run with its log, the agents' queues, the releases, the docs rendered, and the few audited actions operators take from them.
13. [How this guide stays true](this-guide.md): How the guide, the ADRs and the gate keep the docs in step with the code, and what blocks a commit or a pull request when they drift.
14. [Glossary](glossary.md): Every term the guide uses, in a sentence or two, with the chapter that explains it.
<!-- chapters:end -->

## The rule

Every change that alters behavior updates the guide in the same pull request
(AGENTS.md rule 14). `make check-guide` names each chapter whose covered code
changed since it was last reviewed, the files, and the `git diff` to read.
For each one:

1. Read the diff against the chapter.
2. Update the chapter: its text, numbers, tables and paths.
3. `make guide-stamp CHAPTER=<name>` (`ingestion`, `publishing`, …), and
   commit the chapter and `stamps.json` with the change.

A stamp says "I read this chapter against this code". Stamping without
reading is the one way to defeat the system: don't.

Other commands: `uv run python manage.py guide status` (every chapter, fresh
or not), `uv run python manage.py guide covers <chapter>` (the files a
chapter covers).

## A chapter

```yaml
---
title: Ingestion                   # the chapter's title
summary: One sentence, for the index and as the chapter's lead.
order: 30                          # reading order (10, 20, …)
covers:                            # the code this chapter explains
  - ingest/**
  - ops/run-jobs.sh
  - "!ingest/migrations/**"        # (a ! leaves something out)
---
```

The stamp isn't in the chapter: `make guide-stamp` writes the date and the
hash of the covered files to `stamps.json`, keyed by the chapter's name
(its file name without `.md`). Never edit `stamps.json` by hand.

`covers` should be the code the chapter explains, not everything it
mentions: a chapter that covers too much asks to be re-read on every change;
one that covers too little drifts. Leave out what can't change what the
chapter says (migrations, fixtures, recorded cassettes) with `!`. Several
chapters may cover the same file.

## What the check holds you to

- The front matter reads and has `title`, `summary`, `order` and `covers`;
  every `covers` pattern matches a file.
- Every relative link lands: a file or folder that exists, another chapter,
  and a heading in it when the link names one (`ingestion.md#routing`).
  Headings get their anchors as GitHub makes them (lower case, punctuation
  dropped, spaces to hyphens).
- Every repository path written in backticks exists (`ingest/jobs.py`,
  `docs/adr/`). Placeholders (`var/releases/<version>/`), globs and paths
  under `var/` aren't checked.
- The stamp matches the covered code.

Numbers that live in the code (a threshold, an interval, a lease) are named
with where they live (`evidence/policy.py` `STALE_AFTER`), so a reader can
check them, and the chapter covers that file, so a change to the number asks
for the chapter to be read again.

## Links

- Another chapter: `[routing](ingestion.md#routing)`.
- An ADR: `[ADR 0012](../adr/0012-ingestion.md)`.
- Code: a path in backticks (`ingest/routing.py`), or a link when the reader
  will want to open it (`[ingest/jobs.py](../../ingest/jobs.py)`).

## Pending work on another branch

When a chapter describes something another branch is changing, say so in a
callout, so whoever merges it knows to update the chapter and stamp it:

> **Pending: `<branch>` branch.** What that branch changes here, in a
> sentence; update this section when it merges.

When the branch merges, replace the callout with the real description, in
the chapter's own text.

## Style

Write for a curious junior developer, in words anyone can follow. A reader
who has never seen the code should get the idea from each chapter's first
lines; a developer should find every detail they need below that. Clear
beats complete: if a sentence doesn't help someone understand or change the
code, cut it.

**The shape of a chapter.** Start with two or three plain sentences: what
this part of the platform does and why it exists, with no jargon and no
code. Then the details, one idea per section, in the order a reader needs
them. Headings say what the section is about ("How a candidate is routed",
not "Routing logic"). End with "Changing it": the common changes and what
each needs (a migration, a version bump, a test, an ADR).

**Sentences.**

- Short sentences, everyday words, active voice. One idea each.
- Say what something does, then why, then how, only as far as the reader
  needs.
- Define a term the first time it appears, in a few words (and add it to
  the [glossary](glossary.md)).
- Prefer a short table or a worked example to a long description.
- American English, sentence case, no "please", no "successfully".

**Cut on sight.**

- Throat-clearing: "It's worth noting that", "In other words", "Simply put",
  "Let's", "Note that" (unless it's a real **Note:** callout).
- Grand framing and rhetorical setups: "The heart of X is…", "Here's the
  thing:", a question answered in the next sentence.
- Stacked colons and semicolons; lists of three padded to make three.
- Repeating what a heading, table or snippet already shows.
- History that doesn't explain today's code. Keep a decision's reason (and
  its ADR); drop the story of how we got there.

**Keep.** Every fact a developer would need to change the code safely: edge
cases, why a rule is the way it is, what breaks if you change it, the ADR
that decided it.

Never show a secret or anything derived from one (a password, an API key, a
`.env` value). Explaining a mechanism is fine.

Headings: `##` for sections, `###` under them. Tables for anything with
columns; a callout is a quoted paragraph starting with **Note:** or
**Pending:**.
