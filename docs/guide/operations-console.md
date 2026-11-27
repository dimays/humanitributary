---
title: The operations console
summary: The staff-only pages under /ops/, modeled on an orchestrator's console: a Dashboard that says whether anything is wrong, the jobs with their tags and run histories, every run with its log, the agents' queues, the releases, the docs rendered, and the few audited actions operators take from them.
order: 105
covers:
  - opsconsole/**
  - tests/test_opsconsole.py
  - tests/test_opsconsole_actions.py
---

The operations console is a handful of web pages for staff, at `/ops/` on the data host. Its shape is borrowed from
an orchestrator's console (Prefect Cloud's, which the owner likes), cut down to one project: a left sidebar of six
pages, state badges in a few colors, a run graph, and a page per run with its log
([ADR 0030](../adr/0030-a-simpler-console-and-run-logs.md), which redesigned the first console of
[ADR 0028](../adr/0028-operations-console.md)). Everything on it is read from the database, the releases store and
the repository's `docs/`, and reading changes nothing. Staff with the `ops_operator` permission also get a few
buttons: run or retry a job, pause or resume one, release a stuck lease (or extend one), requeue or cancel tasks,
advance the content wave, publish, roll back ([actions](#actions)). Each is confirmed on a page that shows what will
happen, needs a reason, and leaves an `OpsAction` row.

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
`templatetags/ops.py`, so staff without it see the console read-only, and the sidebar's foot says "Read-only" (an
operator's says "Operator (name)"). Superusers have every permission, so the owner needs nothing special; anyone
else is granted `ops_operator` in the admin (Users or Groups → "Can act from the operations console").

The admin's header has an "Operations" link for staff: `opsconsole/templates/admin/base_site.html` overrides
Django's template of that name. It wins because `opsconsole` comes before `django.contrib.admin` in
`INSTALLED_APPS`. The sidebar's foot links back to the admin.

## The pages

The sidebar has six items and nothing else. The pages they lead to link on to the rest: a job, a run, a task, a
Revision, a release, an action and the action log.

| Page | URL | What it shows |
|---|---|---|
| Dashboard | `/ops/` | **One status line**: "All good", or "N problems" with one sentence each, worst first (a store that can't be reached; no worker running and no run for 30 minutes; a job failing runs in a row, red at the alert threshold; stuck leases; jobs overdue by 30 minutes; no live release), each linking to where to look. **Runs, last 24 hours**: the run graph, one row per job that ran, a bar per run placed at its start and as wide as it took (at least a sliver), green Completed, amber completed with errors, red Failed, blue Running; each bar links to its run. **Needs attention**: each job's (or feed's) last run that failed, with Retry. **Up next**: console runs waiting for the worker (Pending), then each job's next due time, soonest first, paused jobs last. **Agent queues**: per task kind with any tasks, three numbers: waiting, in progress, stuck. Then three small cards: the live release, today's intake (documents, candidates, the daily caps), and the console's open or latest actions with a link to the action log. |
| Jobs | `/ops/jobs/` | One row per job, in run order: its name and one-sentence description (the docstring's first sentence), its tags, its schedule in words ("every 15 minutes", "every hour" with "per feed · 1 of 1 on" for a feed job), its last run's state and age, its last ten runs as squares (oldest left, each its state's color and a link to the run; empty slots when it has run fewer times), its next run (or Paused, or Pending), and Run now / Pause, or Resume. Chips across the top filter by tag (`?tag=`), with counts. |
| A job | `/ops/jobs/<name>/` | The description and tags; the schedule, next run, last run, failures in a row, console runs waiting; the ten-run strip and whether it may be run again straight away (`not_idempotent`); for a feed job its feeds (schedule, last fetched, next, a Run button each); its run history, 25 a page. |
| Runs | `/ops/runs/` | Every run, newest first, 50 a page: state, run, job, started, duration, a counts summary (or the masked error's start). Filters: job, state and tag. Without a state, "Up next" (five) sits above the list; the states Scheduled and Paused list the jobs' next runs, Pending and Cancelled the console's run requests (waiting, or withdrawn), the others the runs. |
| A run | `/ops/runs/<id>/` | The state (Completed with errors for a partial run), the job's description, older and newer runs of the job, Retry when it failed; when it started and how long it took, its feed, how much content it wrote; its counts as a key and value list (errors first); **its log**: one line each with the time (UTC, to the millisecond), the level in its color (INFO blue, WARNING amber, ERROR red), the logger and the message, with "Warnings and errors" to show only those and "Plain text" (`?format=text`) for the raw lines; the error with its traceback; and the Revisions it wrote (the first 20, each linking to its diff). |
| Work | `/ops/work/` | A card per task kind: waiting, in progress, stuck, done today, the oldest waiting task's age, today's new tasks against the daily cap (`write_event`, `fill_gap`) and how many failed; the stuck leases, longest-expired first, each with Release; the content wave (active wave, coverage, gaps, the last `gap_waves` run) with "Advance to W2". |
| A task kind | `/ops/work/<kind>/` | Tabs: Waiting, In progress, Stuck, Done, Failed, Cancelled (with counts), a search on dedupe key, target and creator, and the tasks, 50 a page: state, priority, what it is about, the agent, age, the outcome in a few words; Release, Requeue or Cancel per task; "Requeue these" (Failed, Cancelled) or "Cancel these" (Waiting, Stuck) for the tab's tasks, at most 50 at once. No payloads. |
| A task | `/ops/tasks/<id>/` | Its fields, the result, the error, the payload behind "Show the payload", and the Revisions it made, each linking to its diff. Release and Extend on a claimed task, Requeue, Cancel. |
| Releases | `/ops/releases/` | Three cards: the live release (and who pointed at it, why), the content changes not released yet (by agents, people and jobs, linking to them) and the fact base's corroborated share. Then every release, 25 a page: version, Live, when and by whom, added, changed and retracted (its manifest's totals), "page only" when nothing was added, changed or retracted and the page's hash differs from the release before, its events; Publish (top) and Roll back to this (each release not live). |
| A release | `/ops/releases/<version>/` | Its counts and hashes, its change report (`changes.md`, rendered; `?raw=1` serves the file), and the content changes it carried: the Revisions after the previous release's high-water mark up to its own, 50 a page, each linking to its diff. `/ops/releases/unreleased/` lists those after the newest release. |
| A Revision | `/ops/changes/<id>/` | Who, when, why and for which task; each changed column before and after, long text as a word diff; the row's whole history; the other rows changed in the same transaction; a link back to the release that carried it. |
| Docs | `/ops/docs/`, `/ops/docs/<section>/<slug>/` | The maintainer manual (the `manual` folder in `docs/`), the developer reference (`docs/guide/`) and the decisions (`docs/adr/`), rendered: a left table of contents of every document, the open one's headings under it, and the document in readable type, its Mermaid diagrams drawn ([below](#the-docs-page)). |
| Action log | `/ops/actions/`, `/ops/actions/<id>/` | Every OpsAction, newest first, filtered by kind, status and who; an action's page: its state (reloading every 3 seconds while pending or running; a pending one says when no worker holds the scheduler lock, and can be withdrawn), the reason, the runs it made, the output, and behind "Details" the result, what the confirmation showed and the parameters. A finished `publish --check` is the publish confirmation. Linked from the Dashboard. |

The first console's addresses redirect (301): `/ops/tasks/` to Work, `/ops/programs/` to the Dashboard,
`/ops/changes/` to the unreleased changes, `/ops/releases/<version>/changes/` to the release. The first console's
Changes feed, its Content programs page (the pipeline, the waves table, branch proposals) and its throughput and
batch tables are gone: the waves card, the caps and the fact base's share kept what the owner reads, and
`manage.py digest`, `waves status`, `facts report` and `branches list` have the detail.

**States.** The console speaks in run states (`queries.STATES`), each a badge with a dot: **Completed** (green; an
`ok` or `partial` FetchRun, "with errors" for partial), **Failed** (red), **Running** (blue, the dot pulsing),
**Scheduled** (gray: a job's next due time), **Pending** (gray: a run asked for from the console, not yet taken by
the worker), **Cancelled** (gray: one withdrawn) and **Paused** (amber). Tasks use Waiting, In progress, Stuck
(amber: claimed, lease expired), Completed, Failed and Cancelled.

**Tags.** A job's tags come from the registry: `@job(…, tags=…)` in `ingest/job_defs.py`, from the fixed set in
`ingest/jobs.py` `TAGS` ([ingestion](ingestion.md#the-job-runner)): `collect`, `process`, `fact-check`,
`governance`, `waves` and `maintenance`. The console adds `paused` to a paused job.

**Auto-refresh.** The Dashboard, Runs and a running run's page reload themselves every 30 seconds
(`views.REFRESH_SECONDS`) with a few lines of script in `base.html`: only while the tab is visible and no field has
focus. The header's "Auto-refresh on" button turns it off, remembered in the browser (`localStorage`). An open
action's page reloads every 3 seconds with a `<meta http-equiv="refresh">`.

**Look.** One stylesheet in `base.html`: a system font stack, a left sidebar (a top bar of icons under 860 px), white
cards on a light gray page, the state colors as CSS variables, redefined for `prefers-color-scheme: dark`. No
front-end framework, no build step; the only script besides the reload is Mermaid on Docs pages.

## Where the numbers come from

All reading is in `opsconsole/queries.py`; the views only arrange it. It computes totals in Postgres and never loads
rows to count them in Python, so each page makes the same number of queries whatever the table sizes (a test seeds
ten times the rows and compares; the six main pages make at most 25 queries, a detail page at most 15).

| Figure | Query |
|---|---|
| A job's last run | `DISTINCT ON (job, feed_id)` over FetchRuns that aren't running, newest first: one row per job and feed. A feed job's row is its newest run across its feeds. |
| The ten-run strip | `HISTORY_SQL`: for each job name, a `LATERAL` subquery taking its newest ten runs through the `(job, started_at DESC)` index (`fetchrun_job_started_idx`, added with the run logs), one query for every job. |
| Failures in a row | `FAILURE_STREAKS_SQL`: per job and feed, failed runs since the last `ok` or `partial` one. The same count as `infra/alerts.py` `consecutive_failures`, for every job in one query; the page shows the worst feed's. |
| Needs attention | From the same last runs: each job's (each feed's) whose status is `failed`. |
| Next due | A plain job: its last run's start plus its interval. A feed job: the earliest `next_run_at` of its enabled feeds. Overdue means more than 30 minutes past. A job that never ran is due now. |
| The run graph | FetchRuns started in the last 24 hours (on the `started_at` index), placed as shares of the window in Python. |
| The worker | `pg_locks`: whether a session holds the scheduler lock (`ingest/jobs.py` `SCHEDULER_LOCK_KEY`, held by `run_jobs --loop` for its life) or the runner's lock (`LOCK_KEY`). With neither and no run started for 30 minutes, the Dashboard says no worker is running jobs. |
| Agent queues | One `GROUP BY kind` with a `FILTER` per number: waiting (`queued`), in progress (`claimed`, lease live), stuck (`claimed`, lease expired), done and failed today, failed; and one count of today's tasks by the jobs with a daily cap. "Today" starts at local midnight, as the caps do. |
| A run's log | The run's `RunLog` row (`ingest/runlog.py`, [ingestion](ingestion.md#the-job-runner)): one row, read only on the run's page. Lines are masked when captured and masked again when shown. |
| Content a run wrote | Revisions by `job:<name>` between the run's start and finish (the `at` index). |
| Release totals | Each release's `manifest.json` (its `changes` key), read once per process and cached, since release files are never rewritten. Page only: totals all zero and a page hash unlike the previous release's. |
| Not released yet | Revisions after the newest release's `revision_high_water`, by actor kind. |
| Fact base | Record claims (`as_written`, `why`, `origin`) on published entries by status: one aggregate. |
| Waves | `JobState` "gap_waves" read directly (`governance.waves.state()` would create the row). |
| Paused jobs | `JobState` "paused_jobs" through `ingest.jobs.paused_jobs()`, which reads without creating the row. |

Lists never load the big JSON columns: tasks defer `payload` and `result` and read the decision and note with JSON
key transforms; Revisions defer `before` and `after`. Error text and log lines are passed through
`ingest.runlog.mask` (the `masked` filter) again before they are shown.

## The Docs page

`opsconsole/docs.py` reads three folders of `docs/`: `manual` (the maintainer manual, written beside this guide), `guide` and `adr`
(`SECTIONS`). A document is a `.md` file there or one folder down (the manual's procedures); its slug is its path
there without `.md`, its title the front
matter's `title` (the guide's chapters) or its first `# ` heading, its order the front matter's `order` or the file
name, a README first and a subfolder's documents last, under its name. A folder that doesn't exist shows "Not written yet". A URL's slug is looked up in the folder's
listing, never joined onto a path, so nothing else on disk can be read.

Rendering is on the server: Python-Markdown (tables, fenced code, definition lists, abbreviations, a table of
contents giving each heading an id) and then `nh3`, which keeps only an allow-list of tags and attributes (no
scripts, styles, event handlers or `javascript:` links; links get `rel="noopener noreferrer"`). Links between
documents become console links (`operations.md#actions` → `/ops/docs/guide/operations/#actions`, `../adr/…md` →
the Decisions section); a link to code becomes its path in `<code>`. Rendered pages are cached per process by file
and modification time, so an edited file shows on the next request.

A fenced ```` ```mermaid ```` block stays a code block on the server. On a page that has one, the template loads
Mermaid from a pinned version on jsDelivr (`docs.MERMAID_URL`, `mermaid@11.4.1`) and draws each block
(`securityLevel: "strict"`, the dark theme in dark mode, each diagram at most as wide as the text; a click shows it full size, scrolling sideways). If the script doesn't
load or a diagram doesn't parse, the code stays as it is. These are staff-only pages, so a CDN is acceptable; no
other page loads anything from outside.

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

Only `publish --check` (the Releases page's "Publish") skips the confirmation (it writes nothing); its button carries
a key minted with the page.

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

**Where the buttons are.** Run now, Pause and Resume on Jobs and a job's page (and Run per feed); Retry on the
Dashboard's "Needs attention" and a failed run's page; Release on Work's stuck leases and a task kind's list,
Extend on a task's page; Requeue and Cancel per task and for a tab's tasks; Advance on Work's wave card; Publish
on Releases (and the unreleased changes); Roll back to this on each release that isn't live.

## Template helpers

`opsconsole/templatetags/ops.py` holds the tags and filters the templates use: `badge` (a state badge), `task_state`
and `action_state` (a task's or an action's status in state words), `history_strip` (the ten-run squares),
`level_class` and `logtime` (a log line's color and time), `every` (an interval in words), durations (`seconds`),
ages (`span`, `ago`), shares (`pct`), `masked` (secrets out of text shown), `words` (a key as words), JSON
(`pretty`), `act` (a one-button POST form for an action, only for operators) and `took` (how long an action ran).
`field_diffs` turns a Revision into rows of column, before and after, with a word diff (`difflib`) for long text.

## Tests

`tests/test_opsconsole.py` holds the line:

- anonymous and non-staff users are redirected, a POST to a page is refused, staff get `noindex` and `no-store` on
  every page, another host gets a 404 when `OPS_HOSTS` is set, the sidebar has exactly the six items, the admin
  links to the console, and the old addresses redirect;
- every page and detail page renders against `seed()` (runs over the last day with their logs, a job at the alert
  threshold with a key in its error, a running run, tasks with a stuck lease, a pending and a cancelled console run,
  a paused job, agents' and a reviewer's edits, a release, the waves' state) and shows what it should: the problems,
  the run graph, attention, up next and the queues; tags, schedules in words and the ten-run strips, the tag filter;
  the run filters by job, state and tag; a run's log, its level filter and plain text, masked; the Work cards, tabs
  and stuck leases; releases, page-only releases, unreleased changes and a Revision's diff; the Docs page, its links
  and Mermaid only where a diagram is;
- the Docs page against a stand-in `docs/` folder: the manual's stub, links rewritten, code links as code, the
  table of contents, a script, an event handler and a `javascript:` link removed, and a missing manual;
- a run's log (`RunLogTests`): what a job logs, prints and reports as an error, masked (a key parameter, a bearer
  token, a URL's password), nothing below INFO, `httpx`'s noise dropped, the cap (head, the left-out line, tail), a
  failure's traceback, other threads ignored, old logs pruned;
- reading every page writes nothing;
- each page's query count is the same after the tables grow tenfold.

`tests/test_opsconsole_actions.py` holds the actions to theirs:

- staff without `ops_operator` see no action buttons and get 403 on every action URL; operators and superusers see
  them; an anonymous POST goes to the login; a GET of an action URL is a 405; without a CSRF token a POST is a 403;
- the first step writes nothing; a missing reason is a 400; the same token twice acts once; a token made for
  another action or user is refused, a tampered one is a 400; the eleventh action in ten minutes is a 429; the
  audit row holds who, why, the check and the key;
- each action's effect: pause and resume (and `run_due` skipping a paused job, the job's page and the `paused` tag
  showing it), releasing and extending a lease and refusing one that changed hands, requeue and cancel (a live
  lease refused; a filtered batch showing its count and stopping at the cap, highest priority first), advancing the
  wave, a job run in the worker (through `pick_up()` and through the worker loop) with the Revision it wrote, a
  retry, a failing job, a withdrawn and an interrupted action, `link_health` and `second_source` refused within
  their cooldown, and check → publish → refusing a second publish from the same check, content changed since the
  check, and a rollback (the build gate stubbed: no Node).

`seed()` also fills a local database for a look at the pages: `uv run python manage.py shell -c "from
tests.test_opsconsole import seed; seed(skip_gates=(), releases=2)"` (with `skip_gates=()` it runs every publish
gate, so it needs Node). It edits one archive event as an agent and as `human:owner` and pauses `year_pages`, so use
it on a development database only.

## Changing it

| Change | What it needs |
|---|---|
| A new figure | A function in `opsconsole/queries.py` that aggregates in SQL, its place on a page (a card, not a table, unless it is a list), a line in `test_opsconsole.py`'s page tests, and the query-count test still equal; this chapter |
| A new page | Think twice: the sidebar is six items on purpose. A detail page linked from one of them, its test, the query-count test |
| A new problem on the Dashboard | `views.problems()`: one sentence, a level (`bad` or `warn`) and where to look; a test |
| A table the console reads changes shape | Its query here and the test; the chapter that owns the table |
| An index for a slow page | A migration in the app that owns the table, and a note in [ADR 0030](../adr/0030-a-simpler-console-and-run-logs.md) |
| A new job tag | `ingest/jobs.py` `TAGS` and the job's `@job(tags=…)`; [ingestion](ingestion.md#the-job-runner) and this chapter |
| A new docs folder | `opsconsole/docs.py` `SECTIONS`; the link rewriting follows |
| The Mermaid version | `docs.MERMAID_URL` (a pinned version, at least two weeks old); look at a page with a diagram in both themes |
| Restricting it to the data host | Set `OPS_HOSTS` on the app (a config var; no deploy) |
| A new action | An `OpsAction.Kind` (and a migration for the choices), `prepare` and `execute` in `opsconsole/actions.py` and an `Action` in `ACTIONS` (`runs_in` worker for anything that could outlast gunicorn's 30 seconds), a button through `{% act %}`, tests of its effect and refusals, this chapter, and a note in [ADR 0030](../adr/0030-a-simpler-console-and-run-logs.md) |
| Who may act | Grant or revoke `ops_operator` in the admin; no deploy |
| The limits | `RATE_LIMIT`, `RATE_WINDOW_MINUTES`, `FEED_COOLDOWN_MINUTES`, `CHECK_FRESH_MINUTES` in `opsconsole/actions.py`, `MAX_BATCH` in `work/queue.py`; a job's idempotency is `not_idempotent` on its `@job` in `ingest/job_defs.py` |
