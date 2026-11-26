# 0006 — Every canonical change leaves a Revision, enforced by the database

**Status:** accepted (November 2026)

## Context

Agents, jobs and the owner will all change content. We need to know, for any
row, who changed it, when, why, as part of which task, and what it was before,
and to be sure nothing slips past: a rule that says "always use the service
layer" is only as good as the least careful writer, and `QuerySet.update()`,
`bulk_create()` and raw SQL skip Django's save hooks.

## Decision

The database enforces it. A trigger (`humanitributary_audit()`, `revisions/sql.py`; named
`tributaries_audit()` until the rename, revisions 0003)
sits on every table of the canonical apps, `timeline` and `evidence`. For each
inserted, updated or deleted row it:

1. refuses the write unless the transaction has an actor, set only by
   `revisions.revising(actor, reason, task)` (`set_config(…, true)`: local to
   the transaction, so pooled connections can't leak it);
2. skips updates that change nothing;
3. writes a `Revision`: actor (`agent:` / `human:` / `job:` and a name), the
   table and primary key, the action, the row's JSON before and after, the
   columns that changed, the reason, the task id and the transaction id.

Revisions are append-only (a second trigger refuses updates and deletes). The
admin runs every add, change, delete and bulk action inside
`revising("human:<username>")`. `timeline.services` adds the first half of the
contract: it writes only fields that changed, so re-applying the same content
leaves no Revision, and it fails early outside `revising()`.

## Consequences

- The log is complete by construction; a test checks that every canonical
  table carries the trigger, so a new table can't be forgotten.
- History, blame and undo are queries over `revisions_revision`; `txid`
  groups the rows of one change, and a Release records the last Revision it
  includes (`revision_high_water`), so "what changed since the last release"
  is one query.
- An Entry is stored as two rows (the shared `timeline_entry` and its
  `timeline_branch` / `timeline_event`), so one edit can leave two Revisions
  with the same primary key and transaction.
- Writes cost one extra insert per row. The first legacy import (about 47,000
  rows) takes about 20 seconds.
- `TRUNCATE` bypasses row triggers; only the test runner uses it.
