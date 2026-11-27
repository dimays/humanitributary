---
title: The operations console
summary: The staff-only pages under /ops/ that show, on one screen each, whether the platform is healthy, what the jobs and agents did, what changed in the content, which release is live and how the content programs are going; read-only today, with audited interventions planned.
order: 105
covers:
  - opsconsole/**
  - tests/test_opsconsole.py
---

The operations console is a handful of web pages for staff, at `/ops/` on the data host. They answer the questions
the [Operations](operations.md) chapter answers with several commands: is it healthy, did the jobs run, is the
queue moving, what changed today, which release do readers have. Everything on them is read from the database and
the releases store; nothing on them changes anything. The plan for adding actions later is in
[ADR 0028](../adr/0028-operations-console.md).

## Who can see it

Every view goes through `opsconsole/views.py` `console`, which:

| Rule | How |
|---|---|
| Staff only | Django's `staff_member_required`: an anonymous visitor or a user without `is_staff` is redirected to the admin's login (302). |
| Read only | `require_safe`: GET and HEAD; a POST is a 405. |
| Not indexed, not cached | `X-Robots-Tag: noindex, nofollow`, a robots meta tag, and `Cache-Control: no-store`. |
| Only on the data host, if set | `config/settings.py` `OPS_HOSTS` (env `OPS_HOSTS`, comma-separated). When it names hosts, any other host answers 404 before the login check, so the public page's domain has no `/ops/`. Empty, the default, means any allowed host. |

The admin's header has an "Operations" link for staff: `opsconsole/templates/admin/base_site.html` overrides
Django's template of that name, adding the link to its user links. It wins because `opsconsole` comes before
`django.contrib.admin` in `INSTALLED_APPS`.

## The pages

| Page | URL | What it shows |
|---|---|---|
| Overview | `/ops/` | Health cards (database, both stores, the worker, the live release, alerts); one row per job in run order with its last run, status, duration, a counts summary, failures in a row and next due time (red at the alert threshold, amber when failing or overdue); the queue per task kind (queued, claimed, stale leases, done and failed today, created today, the oldest queued task's age); today's intake (documents, candidates, stories over the threshold in the last `process` run, new tasks against the daily caps); the jobs that are failing. |
| Job runs | `/ops/runs/` | FetchRuns filtered by job, status and date range, 50 a page, each with its counts (collapsed), duration and error; above them, a sparkline per job of its last 40 runs within 30 days. |
| Work queue | `/ops/tasks/` | Tasks filtered by kind, status (including `stale`: claimed with an expired lease), agent and a text match on the dedupe key, target ref or creator, with age, priority, lease holder and expiry, attempts and the result's decision; below, tasks done per agent per day for 14 days and the mean minutes from claim to done. |
| A task | `/ops/tasks/<id>/` | Its fields, the result, the error, the payload in a collapsed block, and the Revisions it made. |
| Changes | `/ops/changes/` | The Revision feed filtered by actor kind, table, action, actor, reason text, task and dates; Revisions per day by actor kind for 14 days; recent batches. |
| A Revision | `/ops/changes/<id>/` | Who, when, why and for which task; each changed column before and after, long text as a word diff; the row's whole history; the other rows changed in the same transaction. |
| Releases | `/ops/releases/` | Every Release with its counts, content hash, the change report's totals (added, changed, retracted against the release before it), and which one `releases/latest.json` points at. |
| A change report | `/ops/releases/<version>/changes/` | The release's `changes.md` from the store (`?raw=1` serves the file itself). |
| Content programs | `/ops/programs/` | Content waves (the active wave, and per wave its coverage, gaps, `fill_gap` tasks by status and outcome, gaps held by each cap, windows tried recently), the current-event pipeline (candidates by status, open stories, the last `process` run's stories over the threshold, `write_event` tasks by status and decision), the fact base's shares and rechecks due, and open branch proposals. |

Any page can reload itself every 60 seconds: the header's "auto-refresh" link adds `refresh=1` to the address, which
puts a `<meta http-equiv="refresh">` on the page.

## Where the numbers come from

All reading is in `opsconsole/queries.py`; the views only arrange it. It computes totals in Postgres and never loads
rows to count them in Python, so each page makes the same number of queries whatever the table sizes (on a local
copy of the archive: about 16 for the Overview, 15 for Content programs, 4 to 7 for the others, counting the
session's own).

| Figure | Query |
|---|---|
| A job's last run | `DISTINCT ON (job, feed_id)` over FetchRuns that aren't running, newest first: one row per job and feed. A feed job's row is its newest run across its feeds. |
| Failures in a row | `FAILURE_STREAKS_SQL`: per job and feed, failed runs since the last `ok` or `partial` one. The same count as `infra/alerts.py` `consecutive_failures`, for every job in one query; the page shows the worst feed's. |
| Next due | A plain job: its last run's start plus its interval (`ingest/job_defs.py`). A feed job: the earliest `next_run_at` of its enabled feeds. Overdue means more than 30 minutes past. |
| The worker | `pg_locks`: whether a session holds the scheduler lock (`ingest/jobs.py` `SCHEDULER_LOCK_KEY`, held by `run_jobs --loop` for its life) or the runner's lock (`LOCK_KEY`, held while jobs run). With no lock and no run started for 30 minutes, the card is red. |
| Queue depth | One `GROUP BY kind` with a `FILTER` per column. "Today" starts at local midnight, as the daily caps do. |
| Daily caps | Tasks created since midnight by `job:process` (`write_event`) and `job:gap_waves` (`fill_gap`), against `WRITE_EVENT_TASKS_PER_DAY` and `FILL_GAP_TASKS_PER_DAY`. |
| Intake | Documents fetched since midnight (on the `fetched_at` index), split into new and changed; candidates created since midnight; the newest `process` run's `clusters`, `clusters_over_threshold` and `tasks_held_by_daily_cap` counts. |
| Throughput | Done tasks of the last 14 days by `claimed_by` and day, with the mean of `completed_at − claimed_at`. A re-claim moves `claimed_at`, so it is the last attempt's time. |
| Batches | `BATCH_SQL`: Revisions of the last 30 days grouped by the reason up to its first ` #`, `:` or ` (`, so `apply_edits round-3 #12 …` and every other verdict of that edit file fall in `apply_edits round-3`, and agent results in their task kind (`write_event`). |
| A row's history | Revisions with the same `row_pk`; for an entry, in `timeline_entry`, `timeline_branch` and `timeline_event` together, since they share the key (`revision_row_idx`). |
| Release totals | Each release's `manifest.json` (its `changes` key), read once per process and cached, since release files are never rewritten. |
| Waves | `JobState` "gap_waves": the active wave and the last run's gaps, coverage and counts, read directly (`governance.waves.state()` would create the row). `fill_gap` tasks are counted by `payload.wave.name`, status and `result.decision`. |
| Fact base | Record claims (`as_written`, `why`, `origin`) on published entries by status, and claims whose `recheck_after` is due now or within 30 days: two aggregates. `evidence.health.collect()` (`facts report`) gives the same shares with more detail, but loads every event to place it by era and region. |

Lists never load the big JSON columns: tasks defer `payload` and `result` and read the decision and note with JSON
key transforms; Revisions defer `before` and `after`. Error text is passed through `ingest.policy.mask_secrets`
again before it is shown, though FetchRun errors are already masked when they are written.

## Template helpers

`opsconsole/templatetags/ops.py` holds the filters the templates use: durations (`seconds`), ages (`span`, `ago`),
intervals (`minutes`), shares (`pct`), JSON (`pretty`), the status colors (`status_class`), and two tags that draw
SVG: `sparkline` (one bar per run, its height the duration against the longest, a failed run full height and red)
and `bar` (a daily count). `field_diffs` turns a Revision into rows of column, before and after, with a word diff
(`difflib`) for long text.

## Tests

`tests/test_opsconsole.py` holds the line:

- anonymous and non-staff users are redirected, a POST is refused, staff get `noindex` and `no-store`, another host
  gets a 404 when `OPS_HOSTS` is set, and the admin links to the console;
- every page renders against `seed()` (runs with a job at the alert threshold and a masked key in its error, tasks
  with a stale lease and agents' results, an agent's and a reviewer's edits, a release, the waves' state) and shows
  what it should;
- reading every page writes nothing;
- each page's query count is the same after the tables grow tenfold.

`seed()` also fills a local database for a look at the pages: `uv run python manage.py shell -c "from
tests.test_opsconsole import seed; seed(skip_gates=())"` (with `skip_gates=()` it runs every publish gate, so it
needs Node). It edits one archive event as an agent and as `human:owner`, so use it on a development database only.

## Changing it

| Change | What it needs |
|---|---|
| A new figure or page | A function in `opsconsole/queries.py` that aggregates in SQL, its template, a line in `test_opsconsole.py`'s page tests, and the query-count test still equal; this chapter |
| A table the console reads changes shape | Its query here and the test; the chapter that owns the table |
| An index for a slow page | A migration in the app that owns the table (the console has no models), and a note in [ADR 0028](../adr/0028-operations-console.md) |
| Restricting it to the data host | Set `OPS_HOSTS` on the app (a config var; no deploy) |
| Any action (re-run, release a lease, publish, rollback …) | Phase 2 of [ADR 0028](../adr/0028-operations-console.md) first: POST with CSRF, the `ops_operator` permission, a confirmation with the dry run, an `OpsAction` audit row with an idempotency key, rate limits, long actions in the worker |
