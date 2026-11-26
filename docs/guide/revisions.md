---
title: Revisions
summary: How every change to canonical content is recorded with who made it, why and for which task, how the database refuses changes that skip that, and how to read the log.
order: 80
covers:
  - revisions/*.py
  - revisions/migrations/0002_audit_function.py
  - revisions/migrations/0003_rename_audit_functions.py
  - tests/test_revisions.py
---

Agents, scheduled jobs and the owner all change the timeline's content. For any
row, we need to know who changed it, when, why, for which task, and what it
said before. The revisions app keeps that log, and the database itself refuses
any change that doesn't say who is making it, so nothing gets past.

The decision and its reasons are in
[ADR 0006](../adr/0006-every-canonical-change-leaves-a-revision.md). This
chapter explains how it works and how to use it.

## The rule in one example

**Canonical** tables are the ones that hold what readers see: every table in
the `timeline` and `evidence` apps. A write to one is accepted only inside
`revising()`:

```python
from revisions import revising
from timeline import services

with revising("agent:claude-writer", reason="write_event from candidate 412", task=task):
    services.save_event("ww2-dday", branch="world-war-ii", y=1944.43, when="June 6, 1944",
                        title="D-Day landings in Normandy", text="…", imp=1, status="review")
```

Every row that block inserts, updates or deletes leaves one `Revision`. The
same write outside the block fails with "canonical write to … outside
revisions.revising()", whether it comes from the ORM, `QuerySet.update()`,
`bulk_create()` or raw SQL.

## revising(): the only door

`revisions/context.py` `revising(actor, reason="", task=None)` is a context
manager. It:

1. checks the actor against `ACTOR_RE`: a kind, a colon and a name of 1–180
   characters from letters, digits, `_ . @ : + -`;
2. opens a transaction (`transaction.atomic()`; a savepoint if one is already
   open);
3. sets three transaction-local Postgres settings with
   `set_config(…, true)`: `humanitributary.actor`, `humanitributary.reason`
   (cut to 2,000 characters) and `humanitributary.task_id`;
4. records the block in a Python `ContextVar`, so code can check for it with
   `revisions.current()` or `revisions.require_revising()`;
5. on exit, puts the previous settings back.

| Actor kind | Who | Example |
|---|---|---|
| `agent:` | a Claude agent | `agent:claude-writer` |
| `human:` | the owner, or anyone in the admin | `human:owner` |
| `job:` | a deterministic command | `job:import_legacy`, `job:migrate` |

`task` may be an `AgentTask` or its id; its Revisions then link to it (see
[work queue and agents](work-queue-and-agents.md)).

**Why transaction-local settings.** `set_config(…, true)` lasts only until the
transaction ends, so a pooled connection can't carry one request's actor into
the next. If the block raises, the transaction or savepoint rolls back and the
settings go with it.

**Nesting.** A `revising()` inside another may name a different actor or
reason; the outer one applies again after the inner block ends. After the
outermost block, writes are refused again.

There are two checks, at two levels. `require_revising()` is the Python check
the services call first, for an early, clear `RuntimeError`. The trigger is
the database check that catches everything else.

## The trigger

`revisions/sql.py` holds the SQL. Migration
`revisions/migrations/0002_audit_function.py` installs the two functions and
the append-only guard (`AUDIT_FUNCTION`); each canonical app's own migration
puts the trigger on its tables with `audit_table()`.

`humanitributary_audit()` runs `AFTER INSERT OR UPDATE OR DELETE … FOR EACH
ROW` on every canonical table, as the trigger `<table>_audit`. For each row:

1. **Refuse without an actor.** If `humanitributary.actor` is empty, it raises
   an exception with SQLSTATE `insufficient_privilege`, and the whole
   statement fails (Django raises a `DatabaseError`).
2. **Skip non-changes.** For an update, it compares the row's JSON before and
   after, column by column. If nothing differs, it records nothing.
3. **Record the row.** It inserts one `revisions_revision` row (below).

The trigger takes one argument, the primary-key column. It is `id` for most
tables and `entry_ptr_id` for `timeline_branch` and `timeline_event`, whose
primary key is the link to their `timeline_entry` row.

A second function, `humanitributary_revision_immutable()`, is a `BEFORE UPDATE
OR DELETE` trigger on `revisions_revision`: the log is append-only.

`TRUNCATE` doesn't fire row triggers. Only the test runner uses it
(`TransactionTestCase` flushes tables between tests).

**The rename.** The functions and settings were `tributaries_*` and
`tributaries.*` until `revisions/migrations/0003_rename_audit_functions.py`.
That migration moves every audit trigger onto the new functions, using a
frozen list of tables (`AUDITED`). A table that later gets the trigger gets it
from its own migration, with the new name.

## What a Revision records

`revisions/models.py` `Revision`, one per changed row:

| Field | What |
|---|---|
| `at` | When: the transaction's start time, so every row of one change shares it. |
| `txid` | The Postgres transaction id (`txid_current()`): groups the rows changed together. |
| `actor`, `actor_kind` | Who (`agent:claude-writer`) and the kind before the colon (`agent`). |
| `table_name`, `row_pk` | Which row: the table and its primary key, as text. |
| `action` | `insert`, `update` or `delete`. |
| `before`, `after` | The whole row as JSON: `before` is null for an insert, `after` null for a delete. |
| `changed` | For an update, the columns that changed, sorted. |
| `reason` | The `reason` given to `revising()`. |
| `task` | The `AgentTask`, if one was given. No foreign-key constraint, so archiving a task never blocks or rewrites a Revision. |

An edit to a branch or event can leave two Revisions with the same `row_pk`
and `txid`: one for `timeline_entry` (text, status, why, sort key) and one for
`timeline_branch` or `timeline_event` (name, dates, title …).

What is **not** audited: working state (ingestion, the queue, governance
proposals, releases) and Django's own tables. Only `timeline` and `evidence`
are canonical.

## How to find who changed a row and why

Revisions are rows, so history is a query. From
`uv run python manage.py shell`:

```python
from revisions.models import Revision
from timeline.models import Entry

e = Entry.objects.get(slug="ww2-dday")
# Its history, newest first (both of its tables share the primary key).
for r in Revision.objects.filter(table_name__in=["timeline_entry", "timeline_event"], row_pk=str(e.pk)):
    print(r.at, r.actor, r.action, r.changed, r.reason, r.task_id)

# What one change did, across every table.
Revision.objects.filter(txid=r.txid)

# Everything an agent did for one task.
Revision.objects.filter(task_id=412)

# The value before and after.
r.before["text"], r.after["text"]
```

| Question | Query |
|---|---|
| Who last changed this row? | `Revision.objects.filter(table_name=…, row_pk=…).first()` (ordered newest first) |
| What else changed with it? | `Revision.objects.filter(txid=…)` |
| Which rows did this task change? | `task.revisions.all()` or `Revision.objects.filter(task_id=…)` |
| What has an actor done? | `Revision.objects.filter(actor="agent:claude-writer")` |
| What changed since the last release? | `Revision.objects.filter(id__gt=release.revision_high_water)` (see [publishing](publishing.md)) |
| When did an entry become published? | filter its `timeline_entry` rows on `changed__contains=["status"]` and read `after["status"]` |

The index `revision_row_idx` (table, primary key, id descending) makes the
per-row history cheap. A claim's or citation's history is the same query on
`evidence_claim` or `evidence_citation` with its id.

In the admin (`make serve`, then Revisions under /admin/), Revisions are
read-only: filter by actor kind, action, table or actor, search by primary
key, actor or reason, and browse by date.

Branch proposals use the log to undo themselves: `branches apply` records its
transaction id, and `branches revert` reads that transaction's Revisions back
(see [branch governance](branch-governance.md)).

## Admin edits

`revisions/admin_mixins.py` `RevisedAdmin` wraps the admin's change form,
delete view and change list (which covers bulk actions and `list_editable`)
in `revising("human:<username>", reason="admin <method> <path>")`. Every
canonical model's admin in `timeline/admin.py` and `evidence/admin.py` uses
it, so the owner's edits leave Revisions like anyone else's. The admin saves
with Django's `save()`, which writes every field, but the trigger records
only the columns that actually changed.

## How the tests enforce it

`tests/test_revisions.py`:

| Test | Checks |
|---|---|
| `test_every_canonical_table_is_audited` | The tables with an `_audit` trigger (`revisions.sql.audited_tables()`, read from `information_schema.triggers`) are exactly the tables of every model in `timeline` and `evidence`. A new canonical model without `audit_table()` fails here. |
| `test_orm_write_outside_revising_is_refused` | A plain `create()` outside `revising()` raises. |
| `test_bulk_update_and_raw_sql_outside_revising_are_refused` | `QuerySet.update()` and raw `DELETE` raise, and the row is unchanged. |
| `test_a_write_inside_revising_records_who_why_and_what` | Insert and update leave Revisions with actor, kind, reason, task, `changed`, `before` and `after`. |
| `test_bulk_update_inside_revising_records_every_row` | A bulk update of three rows leaves three Revisions. |
| `test_an_unchanged_save_leaves_no_revision` | A save that changes nothing, and `apply_changes` with the same values, add nothing. |
| `test_services_refuse_outside_revising` | `services.save_branch` raises `RuntimeError` outside `revising()`. |
| `test_the_actor_is_restored_after_a_nested_block_and_cleared_after` | Nesting restores the outer actor; after the block, writes are refused. |
| `test_actor_must_name_its_kind` | `revising("claude")` raises `ValueError`. |
| `test_revisions_are_append_only` | Updating or deleting a Revision raises. |
| `test_admin_edits_are_revised_as_the_human` | An admin edit is recorded as `human:<username>` with only the changed column. |

The tests run against the Docker Postgres (`make test`); the triggers are real.

## Changing it

- **A new canonical table** (a new model in `timeline` or `evidence`). In its
  migration, add `audit_table("<app>_<model>")` from `revisions.sql`, with
  `pk="…"` if its primary key isn't `id`. `test_every_canonical_table_is_audited`
  fails until you do.
- **A new canonical app.** Add it to the app list in
  `test_every_canonical_table_is_audited` and give its tables the trigger. Ask
  first: it widens what "canonical" means, which is an ADR change.
- **Writing content from a new command or job.** Wrap it in
  `revising("job:<command>", reason=…)` and go through `timeline.services`.
  Never set `humanitributary.actor` yourself with `set_config`.
- **Changing the trigger function.** Edit `AUDIT_FUNCTIONS` in
  `revisions/sql.py` and add a new migration that runs it (`CREATE OR
  REPLACE`); an applied migration doesn't rerun. If the function's name
  changes, move every trigger as `revisions/migrations/0003_rename_audit_functions.py`
  does.
- **Never** drop, disable or bypass the trigger, or write to
  `revisions_revision` yourself (AGENTS.md rule 2).
