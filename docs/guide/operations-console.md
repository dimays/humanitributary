---
title: The operations console
summary: The staff-only pages under /ops/ that show, on one screen each, whether the platform is healthy, what the jobs and agents did, what changed in the content, which release is live and how the content programs are going, and the few audited actions operators can take from them.
order: 105
covers:
  - opsconsole/**
  - tests/test_opsconsole.py
  - tests/test_opsconsole_actions.py
---

The operations console is a handful of web pages for staff, at `/ops/` on the data host. They answer the questions
the [Operations](operations.md) chapter answers with several commands: is it healthy, did the jobs run, is the
queue moving, what changed today, which release do readers have. Everything on them is read from the database and
the releases store, and reading them changes nothing. Staff with the `ops_operator` permission also get a few
buttons on them: run or retry a job, pause or resume one, free or extend a lease, requeue or cancel tasks, advance
the content wave, publish, roll back ([actions](#actions)). Each is confirmed on a page that shows what will happen,
needs a reason, and leaves an `OpsAction` row ([ADR 0028](../adr/0028-operations-console.md)).

## Who can see it

Every page goes through `opsconsole/views.py` `console`, which:

| Rule | How |
|---|---|
| Staff only | Django's `staff_member_required`: an anonymous visitor or a user without `is_staff` is redirected to the admin's login (302). |
| Pages are read only | `require_safe`: GET and HEAD; a POST to a page is a 405. Actions have their own URLs (below). |
| Not indexed, not cached | `X-Robots-Tag: noindex, nofollow`, a robots meta tag, and `Cache-Control: no-store`. |
| Only on the data host, if set | `config/settings.py` `OPS_HOSTS` (env `OPS_HOSTS`, comma-separated). When it names hosts, any other host answers 404 before the login check, so the public page's domain has no `/ops/`. Empty, the default, means any allowed host. |

Every action goes through `operator` instead: the same host check, staff only, then the permission
`opsconsole.ops_operator` (defined on the `OpsAction` model's `Meta.permissions`), else a 403; POST only
(`require_POST`), with Django's CSRF middleware checking the token every form carries. The templates draw the
buttons only when `can_act` (an active staff user with the permission) is true, through the `{% act %}` tag in
`templatetags/ops.py`, so staff without it see the console as before, read-only, and the header says
"Read-only" (an operator's says "Operator (name)"). Superusers have every permission, so the owner needs nothing
special; anyone else is granted `ops_operator` in the admin (Users or Groups → "Can act from the operations
console").

The admin's header has an "Operations" link for staff: `opsconsole/templates/admin/base_site.html` overrides
Django's template of that name, adding the link to its user links. It wins because `opsconsole` comes before
`django.contrib.admin` in `INSTALLED_APPS`.

## The pages

| Page | URL | What it shows |
|---|---|---|
| Overview | `/ops/` | Health cards (database, both stores, the worker, the live release, alerts); actions in progress; paused jobs (who, when, why); one row per job in run order with its last run, status, duration, a counts summary, failures in a row and next due time (red at the alert threshold, amber when failing or overdue; a paused job is marked and never overdue); the queue per task kind (queued, claimed, stale leases, done and failed today, created today, the oldest queued task's age); today's intake (documents, candidates, stories over the threshold in the last `process` run, new tasks against the daily caps); the jobs that are failing. |
| Job runs | `/ops/runs/` | FetchRuns filtered by job, status and date range, 50 a page, each with its counts (collapsed), duration and error; above them, a sparkline per job of its last 40 runs within 30 days. |
| Work queue | `/ops/tasks/` | Tasks filtered by kind, status (including `stale`: claimed with an expired lease), agent and a text match on the dedupe key, target ref or creator, with age, priority, lease holder and expiry, attempts and the result's decision; below, tasks done per agent per day for 14 days and the mean minutes from claim to done. |
| A task | `/ops/tasks/<id>/` | Its fields, the result, the error, the payload in a collapsed block, and the Revisions it made. |
| Changes | `/ops/changes/` | The Revision feed filtered by actor kind, table, action, actor, reason text, task and dates; Revisions per day by actor kind for 14 days; recent batches. |
| A Revision | `/ops/changes/<id>/` | Who, when, why and for which task; each changed column before and after, long text as a word diff; the row's whole history; the other rows changed in the same transaction. |
| Releases | `/ops/releases/` | Every Release with its counts, content and page hashes, the change report's totals (added, changed, retracted against the release before it), and which one `releases/latest.json` points at. |
| A change report | `/ops/releases/<version>/changes/` | The release's `changes.md` from the store (`?raw=1` serves the file itself). |
| Content programs | `/ops/programs/` | Content waves (the active wave, and per wave its coverage, gaps, `fill_gap` tasks by status and outcome, gaps held by each cap, windows tried recently), the current-event pipeline (candidates by status, open stories, the last `process` run's stories over the threshold, `write_event` tasks by status and decision), the fact base's shares and rechecks due, and open branch proposals. |
| Actions | `/ops/actions/` | Every OpsAction, newest first, filtered by kind, status and who: what, the target, who, the reason, where it ran, its status and error, how long it took. Readable by all staff. |
| An action | `/ops/actions/<id>/` | Its status (reloading every 3 seconds while pending or running; a pending one says when no worker holds the scheduler lock, and can be withdrawn), the reason, what the job runs did and the Revisions they wrote, the output, the result, what the confirmation showed and the parameters. A finished `publish --check` is the publish confirmation (below). |

Operators also see an "Act" column or buttons: on the Overview (Run now, Pause or Resume per job; paused jobs in
their own table with who paused them and why; actions in progress), on Job runs (Retry on a failed run), on the Work
queue and a task's page (Release and Extend on a claimed task, Requeue on a failed or cancelled one, Cancel on a
queued one or one whose lease expired, and, once the list is filtered, Requeue or Cancel for the matching tasks), on
Releases (Check and publish; Roll back on each release that isn't live) and on Content programs (Advance to the next
wave).

Any page can reload itself every 60 seconds: the header's "auto-refresh" link adds `refresh=1` to the address, which
puts a `<meta http-equiv="refresh">` on the page.

## Where the numbers come from

All reading is in `opsconsole/queries.py`; the views only arrange it. It computes totals in Postgres and never loads
rows to count them in Python, so each page makes the same number of queries whatever the table sizes (on a local
copy of the archive: about 20 for the Overview, 17 for Content programs, 5 to 9 for the others, counting the
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
| Paused jobs | `JobState` "paused_jobs" through `ingest.jobs.paused_jobs()`, which reads without creating the row. |
| Actions in progress | OpsActions `pending` or `running`, oldest first, at most 10 (`queries.open_actions`); the "no worker running" tag is the scheduler lock's `pg_locks` check. |
| Fact base | Record claims (`as_written`, `why`, `origin`) on published entries by status, and claims whose `recheck_after` is due now or within 30 days: two aggregates. `evidence.health.collect()` (`facts report`) gives the same shares with more detail, but loads every event to place it by era and region. |

Lists never load the big JSON columns: tasks defer `payload` and `result` and read the decision and note with JSON
key transforms; Revisions defer `before` and `after`. Error text is passed through `ingest.policy.mask_secrets`
again before it is shown, though FetchRun errors are already masked when they are written.

## Actions

Phase 2 of [ADR 0028](../adr/0028-operations-console.md). What each action checks, shows and does is in
`opsconsole/actions.py`; the views do the steps around it.

**Two steps.** A button POSTs its fields to `/ops/act/<kind>/` (`views.act`). The action's `prepare()` validates
them against the database now and either refuses (a 409 page saying why, nothing changed) or returns a `Plan`: the
exact parameters, a summary, rows and a table describing what will happen, warnings, and the dry run or check as
text. The confirmation page shows the plan and a form with a required reason; it carries a token
(`django.core.signing`, salt `opsconsole.action`, compressed, good for 30 minutes) holding the plan, the user and a
fresh idempotency key (a random 32-hex). Nothing is written in this step. The form POSTs to
`/ops/act/<kind>/confirm/` (`views.confirm`), which:

1. checks the token's signature and age (400 if bad or old) and that it was made for this action and this user (403);
2. finds an OpsAction with the token's key, if any, and shows it: a double submit or a retried request acts once;
3. requires the reason (400, the confirmation again);
4. applies the rate limit, and for a publish or a rollback the one-at-a-time rule (429 or 409);
5. inserts the OpsAction under the key (the unique index settles a race the same way as step 2);
6. runs it now if it is quick, or leaves it `pending` for the worker; then redirects (303) to the action's page.

Only `publish --check` skips the confirmation (it writes nothing); its button carries a key minted with the page.

**The actions.**

| Action | Runs in | Confirmation shows | Does | Refused when |
|---|---|---|---|---|
| Run a job now (`run_job`) | worker | the job, its interval, whether it is idempotent (`Job.not_idempotent`), the feeds it will fetch, its last five runs | `ingest.jobs.run_named(name, feed=…)` for each feed named, with its output captured; the result lists the FetchRuns and counts the Revisions the job wrote (as `job:<name>`, inside its own `revising()`) | the job is paused, running, or already queued from here; `link_health` or `second_source` ran within their interval (a day): they are not idempotent back to back, and the page says why and when it may run again; for a feed job, a feed fetched in the last 60 minutes is left out (`FEED_COOLDOWN_MINUTES`), and with none left it is refused |
| Retry a failed run (`retry_run`) | worker | the failed run's first error line, then as above for its job and feed | the same | as above, and when a later run of that job and feed succeeded |
| Release a lease (`release_lease`) | request | the task, its holder, when it was claimed, the lease (expired or live, with a warning if live), attempts | `work.queue.release_stuck` | the task is no longer claimed by the agent the page showed (also checked again inside the transaction) |
| Extend a lease (`extend_lease`) | request | as above, and the new end (1–1,440 minutes, default 60) | `work.queue.extend_for` | as above |
| Requeue tasks (`requeue_tasks`) | request | the selection (one task, or the list's filters), how many are eligible (failed or cancelled), the first 50 by priority and age, as a table | `work.queue.requeue` on exactly those ids (attempts reset) | none is eligible; a batch with no filter |
| Cancel tasks (`cancel_tasks`) | request | the same, for queued tasks and claimed ones whose lease expired | `work.queue.cancel` on exactly those ids | as above; a live lease is never cancelled |
| Advance the wave (`advance_wave`) | request | the active wave and the next, the leaving wave's coverage, gaps and held counts from the last `gap_waves` run, its open `fill_gap` tasks, and a dry run of `gap_waves` with the new wave active (rolled back): what it would queue | `governance.waves.set_active(to, by="human:<username>", reason=…)` | the last wave is active; the active wave changed since the confirmation |
| Check and publish (`publish_check`) | worker | (no confirmation) | `publish.release.preview()`: the gates, the change report (stored as the action's output), both hashes, whether a release would be made | a gate fails (the action fails with the gates' problems) |
| Publish (`publish`) | worker | the finished check's page: the change report, the totals, "page changed; content unchanged" and the like, both hashes, a warning when nothing changed; fields for notes and "force: page-only change" | checks the content and page still hash as checked, then `publish.release.publish(actor="human:<username>", notes, force)`: the gates run again | the check isn't done, is over 30 minutes old or was already used; another publish or rollback is open; the content or page changed since the check |
| Roll back (`rollback`) | worker | the pointer now (and who wrote it), the release it would point at, its snapshot's hash verified, its change totals | `publish.release.rollback(version, actor="human:<username>")` | it is already live; its snapshot is missing or doesn't match; another publish or rollback is open |
| Pause, resume a job (`pause_job`, `resume_job`) | request | the job, and what pausing means | `ingest.jobs.set_paused`: `JobState` "paused_jobs" names it with who and why; `run_due` skips it | already paused; not paused |

Every `execute` re-checks what might have changed since the confirmation and fails the action with the reason if it
no longer holds. None of these writes a canonical row itself: the queue, FetchRuns, the release pointer, `Release`
and `JobState` are working state, outside the Revision log, which is why the OpsAction row is the record. Content
changes still happen only through the service layer: a job run from here writes as the job always does
(`job:<name>`), and publishing reads content without changing it. A reason given here also goes where the code
records one: the task's `error` note, the wave's history, the pointer's `updated_by`.

**Safety limits.** At most `RATE_LIMIT` (10) actions per user in `RATE_WINDOW_MINUTES` (10), counted from
OpsAction rows in one query; one publish or rollback open at a time, across users; at most 50 tasks per requeue
or cancel; a feed fetched from here at most once an hour; non-idempotent jobs at most once per interval.

**The audit row.** `opsconsole/models.py` `OpsAction` (migration `opsconsole/migrations/0001_opsaction.py`): `kind`, `target`
(`job:<name>`, `task:<id>`, `tasks:<n>`, `wave:<name>`, `release:<version>`), `params` (what the confirmation showed
and the action uses), `reason` (required: a check constraint refuses an empty one), `requested_by`
(`human:<username>`, also checked), `idempotency_key` (unique), `runs_in` (`request` or `worker`), `status`
(`pending` → `running` → `done`, `failed` or `cancelled`), `check_output` (the confirmation's dry run, check or
preview, as text), `output` (what it printed, masked), `result`, `error` (masked), and the times. The admin lists
them read-only (no add, change or delete).

**Quick actions** run inside the confirming request: `actions.run_now()` marks the row running, runs `execute()`
in one transaction and records the result or the refusal.

**Worker actions** stay `pending` until `opsconsole/worker.py` `pick_up()` takes them: the worker loop
(`ingest.jobs.loop()`) calls it through `BETWEEN_JOBS` before each due job and once a pass, so only the worker
holding the scheduler lock runs them, inside `run_due`'s runner lock (a job run's own `run_named` takes the same
lock again, which Postgres allows to its holder). It takes the oldest pending row `FOR UPDATE SKIP LOCKED`, marks
it running, runs it outside any wrapping transaction (a job manages its own), and records the outcome; at most
`PER_PICK_UP` (5) per call. A worker action left `running` by a worker that died is closed as failed
("interrupted") at the next pick-up. A pending one can be withdrawn from its page ("Withdraw it"), and it then
never runs. With no worker running, actions wait; the page says so.

## Template helpers

`opsconsole/templatetags/ops.py` holds the filters the templates use: durations (`seconds`), ages (`span`, `ago`),
intervals (`minutes`), shares (`pct`), JSON (`pretty`), the status colors (`status_class`), and two tags that draw
SVG: `sparkline` (one bar per run, its height the duration against the longest, a failed run full height and red)
and `bar` (a daily count), and `act`, a one-button POST form for an action (only for operators); `took` is how long an action ran. `field_diffs` turns a Revision into rows of column, before and after, with a word diff
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

`tests/test_opsconsole_actions.py` holds the actions to theirs:

- staff without `ops_operator` see no action buttons and get 403 on every action URL; operators and superusers see
  them; an anonymous POST goes to the login; a GET of an action URL is a 405; without a CSRF token a POST is a 403;
- the first step writes nothing; a missing reason is a 400; the same token twice acts once; a token made for
  another action or user is refused, a tampered one is a 400; the eleventh action in ten minutes is a 429; the
  audit row holds who, why, the check and the key;
- each action's effect: pause and resume (and `run_due` skipping a paused job), releasing and extending a lease and
  refusing one that changed hands, requeue and cancel (a live lease refused; a filtered batch showing its count and
  stopping at the cap, highest priority first), advancing the wave, a job run in the worker (through `pick_up()` and
  through the worker loop) with the Revision it wrote, a retry, a failing job, a withdrawn and an interrupted
  action, `link_health` and `second_source` refused within their cooldown, and check → publish → refusing a second
  publish from the same check, content changed since the check, and a rollback (the build gate stubbed: no Node).

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
| A new action | An `OpsAction.Kind` (and a migration for the choices), `prepare` and `execute` in `opsconsole/actions.py` and an `Action` in `ACTIONS` (`runs_in` worker for anything that could outlast gunicorn's 30 seconds), a button through `{% act %}`, tests of its effect and refusals, this chapter, and a note in [ADR 0028](../adr/0028-operations-console.md) |
| Who may act | Grant or revoke `ops_operator` in the admin; no deploy |
| The limits | `RATE_LIMIT`, `RATE_WINDOW_MINUTES`, `FEED_COOLDOWN_MINUTES`, `CHECK_FRESH_MINUTES` in `opsconsole/actions.py`, `MAX_BATCH` in `work/queue.py`; a job's idempotency is `not_idempotent` on its `@job` in `ingest/job_defs.py` |
