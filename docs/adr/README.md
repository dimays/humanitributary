# Decisions

Every real decision about how the platform works gets an ADR (architecture
decision record) here, so the reasons survive the people and sessions that
made them (AGENTS.md rule 15). The technical guide (`docs/guide/`) says how
things work now; an ADR says why, and what was given up.

- Number the next free `NNNN` and name the file `NNNN-words.md` (lower case,
  hyphens). Two branches that take the same number: the second to merge
  renumbers.
- An accepted ADR is never silently edited. To change a decision, write a
  new ADR whose Status says it amends, refines or supersedes the old one,
  with a link, and add the backlink to the old one's Status ("amended by
  [0008](0008-entry-order.md)"). Fixing a typo or a broken link is fine.
- `make check-adr` holds all of this (`scripts/check_adr.py`): names,
  titles, unique numbers, Status lines, amendments named both ways, links
  that resolve, and this index. `make adr-index` rewrites the index.

## Index

<!-- index:start -->
| ADR | Decision | Status |
|---|---|---|
| [0001](0001-postgres-is-the-truth-the-site-reads-snapshots.md) | Postgres is the source of truth; the site reads static snapshots | accepted |
| [0002](0002-django-and-apps-by-responsibility.md) | Django, with apps split by responsibility | accepted |
| [0003](0003-deterministic-jobs-and-an-agent-queue.md) | Deterministic jobs, and a queue for agents | accepted |
| [0004](0004-every-fact-has-evidence.md) | Every fact has evidence: claims, citations and computed confidence | accepted |
| [0005](0005-postgres-only.md) | Postgres only, and its features where they help | accepted |
| [0006](0006-every-canonical-change-leaves-a-revision.md) | Every canonical change leaves a Revision, enforced by the database | accepted |
| [0007](0007-one-snapshot-shape-byte-identical-both-ways.md) | One snapshot shape, byte-identical both ways | accepted |
| [0008](0008-entry-order.md) | Entry order is a sort key assigned once | accepted |
| [0009](0009-fact-base.md) | The fact base: independent witnesses, atomic claims, staleness | accepted |
| [0010](0010-publishing-rule.md) | What may be published | proposed |
| [0011](0011-branch-governance.md) | Branch governance: rules propose, people decide, applying is mechanical | accepted |
| [0012](0012-ingestion.md) | Ingestion: scheduled, deterministic collection into the agents' queue | accepted |
| [0013](0013-source-policy.md) | Source policy: what jobs fetch, what they never do, and why | accepted |
| [0014](0014-technical-guide.md) | A technical guide whose chapters are stamped against the code they cover | proposed |
| [0015](0015-the-gate-and-hooks.md) | One gate before every pull request, a receipt for it, and hooks that hold the line | proposed |
| [0016](0016-object-storage.md) | Object storage for everything that isn't a row | proposed |
| [0017](0017-agent-api.md) | Agents work through an authenticated API, never the database | proposed |
| [0018](0018-single-source-marker.md) | A "single source" marker, and additive snapshot keys | proposed |
| [0019](0019-processes-and-release-gates.md) | Production's processes locally, health and alerts, and release gates | proposed |
| [0020](0020-heroku-hosting.md) | Heroku hosts the platform: a pipeline, staging first | proposed |
| [0021](0021-the-cutover.md) | The cutover: Postgres is the only source of truth, and the legacy files are frozen | proposed |
| [0022](0022-ingestion-tuning.md) | Ingestion tuned on its first run: a threshold from the data, a daily cap, routing by role, branches only where Wikidata says so | proposed |
| [0023](0023-edit-files.md) | A reviewer's verdicts are applied as one audited edit file | proposed |
| [0024](0024-the-app-serves-the-page.md) | The web process serves the public page until a CDN does | proposed |
| [0025](0025-edit-files-add-entries-and-junk-actors.md) | Edit files add branches, events and connections; the splitter rejects junk actors and keeps the old ones for the owner | proposed |
| [0026](0026-content-waves.md) | Content waves: gaps found window by window, newest history first, queued as fill_gap tasks under a daily cap | proposed |
| [0027](0027-caps-after-round-3.md) | Caps after round 3: more history gaps, fewer routine news stories | accepted |
| [0028](0028-operations-console.md) | An operations console for staff: read-only pages now, audited interventions planned | accepted |
| [0029](0029-release-identity-includes-the-page.md) | A release's identity includes the page's inputs, so a page-only change publishes | accepted |
| [0030](0030-a-maintainers-manual-in-simplified-technical-english.md) | A Maintainer's Manual in Simplified Technical English, checked by a script | proposed |
| [0031](0031-a-simpler-console-and-run-logs.md) | A simpler operations console, shaped like an orchestrator's, with every job run's log | accepted |
| [0032](0032-run-cards-and-what-started-a-run.md) | Each run records what started it, and the console shows a card per run on hover | accepted |
| [0033](0033-a-new-events-page-derived-from-existing-rows.md) | A New events page in the console, every state derived from the rows that already record it | proposed |
| [0034](0034-brand-assets.md) | Brand files drawn from the page's mark, a preview card rendered from the page, served at the root of every host | proposed |
| [0035](0035-automated-daily-rounds.md) | Agent rounds run daily on a cloud routine, end to end through the API, and publish when the review approves and every gate passes | accepted |
| [0036](0036-evidence-packs.md) | Evidence packs: a job pre-fetches the allowed pages a task needs, stores their text privately for a limited time, and the API checks every excerpt against it | proposed |
| [0037](0037-source-ratings-2026-11-28.md) | The November 28 source ratings become Publisher policy, with two new policies: api_only and citation_only | proposed |
| [0038](0038-larger-round-ceilings.md) | The round size's ceilings are settings, set by what the platform can carry | accepted |
| [0039](0039-dismiss-a-failed-run.md) | A failed run follows its retry in Needs attention, and an operator can dismiss it | proposed |
| [0040](0040-round-progress-from-a-task-link.md) | A round's progress is counted from a task-to-round link, not a "planned" task state | proposed |
| [0041](0041-archive-a-job.md) | A job can be archived from the console: paused, its runs stopped, hidden, its history kept | proposed |
| [0042](0042-deferred-releases-and-the-fetch-policy-endpoint.md) | A released task waits before it is offered again, and agents ask the API before they fetch a page | proposed |
| [0043](0043-the-manyages-name.md) | The site is ManyAges at manyages.com; humanitributary.com redirects until it expires | proposed |
| [0044](0044-source-ratings-batch-2.md) | A second batch of source ratings: 44 more records, a Batch for each round, and a rating never loosens a restrictive policy | proposed |
| [0045](0045-short-sort-keys-and-json-errors.md) | Sort keys stay short and a used-up gap is respaced; the agent API answers every error as JSON, refuses long excerpts and counts unrated lookups | proposed |
| [0046](0046-the-owners-review-queue.md) | Pages only a person may read go to the owner's review queue, and no agent is offered them | proposed |
| [0047](0047-manyages-variable-names.md) | The agent environment variables take the ManyAges name, with a fallback to the old one until the owner deletes it | proposed |
| [0048](0048-event-images.md) | Events get openly licensed pictures by reference, found by a paced job; pictures that may disturb are blurred until the viewer asks | proposed |
| [0049](0049-source-ratings-batch-3.md) | A third batch of source ratings: thirty-three more records for the domains agents were refused | proposed |
| [0050](0050-rounds-per-day-is-a-setting.md) | The number of rounds a token may start in a day is a setting | accepted |
<!-- index:end -->

## Template

```markdown
# NNNN — The decision, as a short sentence

**Status:** proposed (Month YYYY)
<!-- accepted / proposed / superseded / deprecated, then optionally:
     "; amends [NNNN](NNNN-words.md)", "; superseded by [NNNN](…)" -->

## Context

What forces the decision: the problem, the constraints, what we know and
what we don't. Facts, with numbers where there are numbers.

## Decision

What we will do, stated so someone can check the code against it. Name the
modules, commands and settings it lives in.

## Consequences

What follows, good and bad: what gets easier, what gets harder, what we
gave up, what to watch, and what would make us revisit it.
```
