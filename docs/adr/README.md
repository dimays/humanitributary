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
| [0020](0020-docs-technical-guide.md) | A technical guide whose chapters are stamped against the code they cover | proposed |
| [0021](0021-docs-the-gate-and-hooks.md) | One gate before every pull request, a receipt for it, and hooks that hold the line | proposed |
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
