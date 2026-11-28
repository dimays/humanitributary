---
title: The operations console
summary: The staff-only pages under /ops/, modeled on an orchestrator's console: a Dashboard that says whether anything is wrong, the content made day to day from fetched to published, the jobs with their tags and run histories, every run with its log, the agents' queues, the releases, the docs rendered, and the few audited actions operators take from them.
order: 105
covers:
  - opsconsole/**
  - tests/test_opsconsole.py
  - tests/test_opsconsole_actions.py
  - tests/test_opsconsole_cards.py
  - tests/test_opsconsole_new_events.py
  - tests/test_rounds.py
  - tests/test_round_progress.py
---

The operations console is a handful of web pages for staff, at `/ops/` on the data host. Its shape is borrowed from
an orchestrator's console (Prefect Cloud's, which the owner likes), cut down to one project: a left sidebar of seven
pages, state badges in a few colors, a run graph, and a page per run with its log
([ADR 0031](../adr/0031-a-simpler-console-and-run-logs.md), which redesigned the first console of
[ADR 0028](../adr/0028-operations-console.md); [ADR 0033](../adr/0033-a-new-events-page-derived-from-existing-rows.md) added New events). Everything on it is read from the database, the releases store and
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

Every tab reads as the same project. A console page's title is "<page> · <SITE_NAME> Operations" ("Jobs ·
Humanitributary Operations"), from `base.html`'s `title` block; the admin's is "<page> · <SITE_NAME> administration"
(its `site_title`, set in `config/urls.py`, and the same override's `title` block). Both heads include
`opsconsole/templates/opsconsole/_icons.html`, the public page's favicon (`/favicon.ico`, `/favicon.svg`) and Apple touch icon, which
`infra/site.py` serves at the root of every host ([Publishing](publishing.md#the-brand-files),
[ADR 0034](../adr/0034-brand-assets.md)), and a light and a dark `theme-color`. The sidebar's logo is the same
`/favicon.svg`.

## The pages

The sidebar has seven items and nothing else. The pages they lead to link on to the rest: a job, a run, a task, a
Revision, a release, an action and the action log, and, under Work, the agent rounds and a round
([ADR 0035](../adr/0035-automated-daily-rounds.md)).

**Jobs and Work, told apart.** Each of the two tabs opens with one plain sentence: Jobs, "The worker runs these on a
schedule. They collect and prepare material and make tasks. They don't use Claude."; Work, "Claude agents do these
tasks in rounds. Each round writes drafts, a reviewer checks them, and approved changes are published." Under it a
compact flow (`_flow.html`: jobs collect and prepare → they make tasks → a round's agents draft → a reviewer checks
→ approved changes are published) links to the manual's page with the diagram (`docs/manual/jobs-and-work.md`).
They link to each other: a job's row and page name the task kinds it makes ("Makes write_event tasks"), and each
Work queue card names the jobs that feed it ("fed by process"), from one map (`work/rounds.py` `FED_BY`).

| Page | URL | What it shows |
|---|---|---|
| Dashboard | `/ops/` | **One status line**: "All good", or "N problems" with one sentence each, worst first (a store that can't be reached; no worker running and no run for 30 minutes; a job failing runs in a row, red at the alert threshold; stuck leases; jobs overdue by 30 minutes; no live release), each linking to where to look. A paused job is never a problem, whatever its last runs did: it is listed under the problems apart, with an amber Paused badge, who paused it and why, and how many failed runs before the pause are not counted ("N paused" beside the count); resumed, its failures count again. **Runs, last 24 hours**: the run graph, one row per job that ran, a bar per run placed at its start and as wide as it took (at least a sliver), green Completed, amber completed with errors, red Failed, blue Running; each bar links to its run, and pointing at it
(or focusing it, or tapping it once) shows its [run card](#run-cards). **Needs attention**: each job's (or feed's) last run that failed, with Retry and Dismiss; not a paused job's, and not a run an operator dismissed ([ADR 0039](../adr/0039-dismiss-a-failed-run.md)). A run being retried shows that instead of the buttons: **Retry queued** (amber, a console retry or run of it waiting for the worker) or **Retrying** (blue, the worker has taken it, or a run of the same job and feed is running), with links to the action and the run. A retry that completes takes the row off; one that fails replaces it with the new failure. With nothing left, the card says so, and how many failures were dismissed. **Up next**: console runs waiting for the worker (Pending), then each job's next due time, soonest first, paused jobs last. **Agent queues**: per task kind with any tasks, three numbers: waiting, in progress, stuck. **Latest round**: the last agent round's number, state badge, age, trigger, drafts, ops applied and release, the ten-round strip, and when the next is due (or Rounds paused). Then three small cards: the live release, today's intake (documents, candidates, the daily caps), and the console's open or latest actions with a link to the action log. |
| New events | `/ops/new/` | The content the platform makes, newest activity first: every current event (`write_event`), history-wave event (`fill_gap`) and branch addition (an edit file's `add_branch` or `add_event`), each with its five steps (Fetched, Queued, Drafted, Reviewed, Published) and their times, its branches, date, sources, agent and verdict, and its links; tabs, filters and a 14-day pulse above ([below](#new-events)). |
| Jobs | `/ops/jobs/` | One row per job, in run order: its name and one-sentence description (the docstring's first sentence), its tags, its schedule in words ("every 15 minutes", "every hour" with "per feed · 1 of 1 on" for a feed job), its last run's state and age, its last ten runs as squares (oldest left, each its state's color and a link to the run, with its [run card](#run-cards) on hover, focus or tap; empty slots when it has run fewer times), its next run (or Paused, or Pending), and Run now / Pause, or Resume. Chips across the top filter by tag (`?tag=`), with counts, and "Archived jobs" (with their count, when there are any) leads to the archived jobs. An archived job is not listed ([ADR 0041](../adr/0041-archive-a-job.md)). |
| Archived jobs | `/ops/jobs/archived/` | Every archived job, most recently archived first (`queries.archived`): its name and description (or "no longer in `ingest/job_defs.py`"), when and by whom it was archived with a link to the action, the reason and whether the archive paused it, its runs kept (a link to the Runs page filtered by it), its last run, and Unarchive. |
| A job | `/ops/jobs/<name>/` | The description and tags; the schedule, next run, last run, failures in a row, console runs waiting; the ten-run strip and whether it may be run again straight away (`not_idempotent`); for a feed job its feeds (schedule, last fetched, next, a Run button each); its run history, 25 a page. For an operator, **Archive…** beside the job's buttons opens the [archive dialog](#archiving-a-job). An archived job's page stays reachable: an Archived banner (who, when, the action, why), "never: archived" as its next run, its history, and only Unarchive. |
| Runs | `/ops/runs/` | Every run, newest first, 50 a page: state, run, job, started, duration, a counts summary (or the masked error's start). Filters: job, state and tag. Without a state, "Up next" (five) sits above the list; the states Scheduled and Paused list the jobs' next runs, Pending and Cancelled the console's run requests (waiting, or withdrawn), the others the runs; Cancelled also lists the runs stopped because their job was archived. An archived job's runs stay here, by job, state and tag, though the job is in no list. |
| A run | `/ops/runs/<id>/` | The state (Completed with errors for a partial run), the job's description, older and newer runs of the job, Retry when it failed; when it started and how long it took, its feed, how much content it wrote; its counts as a key and value list (errors first); **its log**: one line each with the time (UTC, to the millisecond), the level in its color (INFO blue, WARNING amber, ERROR red), the logger and the message, with "Warnings and errors" to show only those and "Plain text" (`?format=text`) for the raw lines; the error with its traceback; and the Revisions it wrote (the first 20, each linking to its diff). |
| Work | `/ops/work/` | **The live round**, first and only while a round is open (`queries.live_round`; [ADR 0040](../adr/0040-round-progress-from-a-task-link.md)): "Round #N" with its state badge, the stage (Agents, Review or Publish: the current one of `work.rounds.stages`), how long it has run, "D of P planned tasks done", and one bar per task kind, the plan's kinds first: green done, blue in progress, amber stuck, red failed, gray released, and an outlined rest for what the plan expects that no agent has claimed yet, each segment's width its share of the larger of planned and claimed (`queries.progress_rows`), with a line such as "fill_gap 22/40 done · 3 in progress · 1 failed" and a key below. Then **the round strip**, the same visibility and controls the Jobs tab gives a job: "Daily agent round · cloud routine · next at 06:00 UTC" (`ROUND_SCHEDULE` in words, `ROUND_ROUTINE`; or "paused"), whether the next is skipped and how many held drafts go to the next review; the last round's state badge (Running, Reviewing, Release ready, Held for review, Completed, Failed, Skipped, or "Published release X"); the last ten rounds as squares, each its state's color and a link to the round, with a hover (or focus) card: the planned mix, tasks done per kind, drafts, verdicts, ops applied, the release, how long it took and its trigger; "All rounds"; for operators Pause rounds / Resume rounds, Skip the next, "Send them to the next review" (with the held count), and under "Round size" a form of agents and tasks each per role. Then a card per task kind: waiting, in progress, stuck, done today, while a round is open **in this round: N planned / N done** (and its in progress and failed), **next round will take: N** (the round size times what waits), the oldest waiting task's age, **done in 7 days**, the jobs that feed it, today's new tasks against the daily cap (`write_event`, `fill_gap`), **evidence ready** for `write_event`, `fill_gap` and `verify_claim` (the share of waiting tasks whose evidence pack holds a non-Wikipedia page, `payload.evidence_ready`, counted in the same query; [ADR 0036](../adr/0036-evidence-packs.md)) and how many failed; the stuck leases, longest-expired first, each with Release; the content wave (active wave, coverage, gaps, the last `gap_waves` run) with "Advance to W2". |
| Rounds | `/ops/work/rounds/` | Every agent round, newest first, 25 a page: number and trigger, start, state, planned mix, drafts, verdicts, ops, release, how long it took. |
| A round | `/ops/work/rounds/<id>/` | Its state and trigger, who started it and when, its summary; **the stage timeline**: Plan → Agents → Review → Apply → Publish, each done (green), current (blue), failed (red), skipped (faded) or still to come, with its time and a note (the mix; agents and drafts; the verdicts; the ops applied or why the file was refused; the release, "held for the owner" or "nothing to publish") (`work.rounds.stages`); the same progress card as Work's live round (titled Progress; it stays after the round ends, as a record), then the plan per kind as the routine recorded it (planned, claimed, completed, failed) and the size; the verdict counts and the edit file's ops, with the Revisions its transaction wrote; each agent's recorded counts beside what the queue says it did in the round's window (`queries.round_agents`); **its tasks**: every task linked to the round (`queries.round_tasks`, at most 300), grouped by the agent holding it, with its subject, state, when it was claimed and finished, and its attempts; released and failed tasks have no holder (a hand-back clears it), so they are grouped as "Handed back"; its actions (each edits and releases call, linking to the action log); its notes and history; links to New events and the release. |
| A task kind | `/ops/work/<kind>/` | Tabs: Waiting, Deferred, In progress, Stuck, Done, Failed, Cancelled (with counts), a search on dedupe key, target and creator, and the tasks, 50 a page: state, priority, what it is about, the agent, age, the outcome in a few words; Release, Requeue or Cancel per task; "Requeue these" (Failed, Cancelled, Deferred) or "Cancel these" (Waiting, Deferred, Stuck) for the tab's tasks, at most 50 at once. **Deferred** (`work.queue.deferred_q`, [ADR 0042](../adr/0042-deferred-releases-and-the-fetch-policy-endpoint.md)) is the queued tasks an agent released for later or that need a person: a Deferred badge, "not before <time>" under it while `not_before` is ahead, and the recorded need ("needs browser: <url>: <why> (agent)") read from `payload.needs` by annotation (`queries.tasks`; the payload itself isn't loaded). No payloads. |
| A task | `/ops/tasks/<id>/` | Its fields (with "Not before" and, after a release that needs a person, **Needs**: the kind, the reason, who and when); for `write_event`, `fill_gap` and `verify_claim` its **evidence pack** (`queries.evidence_pack`: Ready or Not ready, when `prefetch_sources` built it, each stored page with its publisher, tier, document id, words and fetch date and its top passages with their scores and matches, a purged page marked; then "Left to read by hand", the unreadable URLs with their reasons, `browser_only` first in color); the result, the error, the payload behind "Show the payload", and the Revisions it made, each linking to its diff. Release and Extend on a claimed task, Requeue, Cancel. The passages are quotations from stored pages: the console is staff-only and `noindex`, never public. |
| Releases | `/ops/releases/` | Three cards: the live release (and who pointed at it, why), the content changes not released yet (by agents, people and jobs, linking to them) and the fact base's corroborated share. Then every release, 25 a page: version, Live, when and by whom, added, changed and retracted (its manifest's totals), "page only" when nothing was added, changed or retracted and the page's hash differs from the release before, its events; Publish (top) and Roll back to this (each release not live). |
| A release | `/ops/releases/<version>/` | Its counts and hashes, its change report (`changes.md`, rendered; `?raw=1` serves the file), and the content changes it carried: the Revisions after the previous release's high-water mark up to its own, 50 a page, each linking to its diff. `/ops/releases/unreleased/` lists those after the newest release. |
| A Revision | `/ops/changes/<id>/` | Who, when, why and for which task; each changed column before and after, long text as a word diff; the row's whole history; the other rows changed in the same transaction; a link back to the release that carried it. |
| Docs | `/ops/docs/`, `/ops/docs/<section>/<slug>/` | The Maintainer's Manual ([`docs/manual/`](../manual/README.md)), the developer reference (`docs/guide/`) and the decisions (`docs/adr/`), rendered: a left table of contents of every document, the open one's headings under it, and the document in readable type, its Mermaid diagrams drawn ([below](#the-docs-page)). |
| Action log | `/ops/actions/`, `/ops/actions/<id>/` | Every OpsAction, newest first, filtered by kind, status and who; an action's page: its state (reloading every 3 seconds while pending or running; a pending one says when no worker holds the scheduler lock, and can be withdrawn), the reason, the runs it made, the output, and behind "Details" the result, what the confirmation showed and the parameters. A finished `publish --check` is the publish confirmation. Linked from the Dashboard. |

The first console's addresses redirect (301): `/ops/tasks/` to Work, `/ops/programs/` to the Dashboard,
`/ops/changes/` to the unreleased changes, `/ops/releases/<version>/changes/` to the release. The first console's
Changes feed, its Content programs page (the pipeline, the waves table, branch proposals) and its throughput and
batch tables are gone: the waves card, the caps and the fact base's share kept what the owner reads, and
`manage.py digest`, `waves status`, `facts report` and `branches list` have the detail.

**States.** The console speaks in run states (`queries.STATES`), each a badge with a dot: **Completed** (green; an
`ok` or `partial` FetchRun, "with errors" for partial), **Failed** (red), **Running** (blue, the dot pulsing),
**Scheduled** (gray: a job's next due time), **Pending** (gray: a run asked for from the console, not yet taken by
the worker), **Cancelled** (gray: one withdrawn, or a FetchRun `stopped` because its job was archived while it ran) and **Paused** (amber). Tasks use Waiting, In progress, Stuck
(amber: claimed, lease expired), Completed, Failed and Cancelled. Rounds (`queries.ROUND_STATE`) use Running and
Reviewing (blue), **Release ready** (accent: the edit file is applied and every gate passes), **Published** (green,
"Published release X"), **Held for review** (amber: finished without a release; something needs the owner),
Completed (green: nothing to publish), Failed (red) and Skipped (gray).

**Tags.** A job's tags come from the registry: `@job(…, tags=…)` in `ingest/job_defs.py`, from the fixed set in
`ingest/jobs.py` `TAGS` ([ingestion](ingestion.md#the-job-runner)): `collect`, `process`, `fact-check`,
`governance`, `waves` and `maintenance`. The console adds `paused` to a paused job, and `archived` (instead of
`paused`) to an archived one, on its own page only; the `paused` tag never names an archived job, but the Runs page's
tag filter still finds an archived job's runs by its registry tags.

**Auto-refresh.** The Dashboard, Runs and a running run's page reload themselves every 30 seconds
(`views.REFRESH_SECONDS`), and Work and a round's page every 20 seconds while a round is open
(`views.ROUND_REFRESH_SECONDS`), with a few lines of script in `base.html`: only while the tab is visible and no field has
focus (so the round size form on Work is never reloaded under an operator's typing). The header's "Auto-refresh on" button turns it off, remembered in the browser (`localStorage`). An open
action's page reloads every 3 seconds with a `<meta http-equiv="refresh">`.

**Look.** One stylesheet in `base.html`: a system font stack, a left sidebar (a top bar of icons under 860 px), white
cards on a light gray page, the state colors as CSS variables, redefined for `prefers-color-scheme: dark`. No
front-end framework, no build step; the only scripts besides the reload are the run cards' (below) and Mermaid on
Docs pages.

## Run cards

Pointing at a run on the Dashboard's run graph or in a ten-run strip (Jobs, a job's page) shows a card about it
after 80 ms; moving to the next bar swaps the card at once ([ADR 0032](../adr/0032-run-cards-and-what-started-a-run.md)).

| Part | What it shows |
|---|---|
| Head | The job, its feed, its tags as chips, the state badge (Completed with errors for a partial run). |
| Trigger | **Scheduled** (started by the scheduler), **Manual** ("Run now" by who, with a link to the action; or `run_job` from the shell) or **Retry** (by who, of which run, the action). From `FetchRun.trigger` ([ingestion](ingestion.md#the-job-runner)). |
| Runtime | How long it ran (so far, while running), the job's usual runtime: the median and p90 of its last 30 completed (`ok` or `partial`) runs, and "N× usual": amber when at least 1.5 times the median and over the p90 (`queries.SLOW_RATIO`), green at two thirds or less, else "about usual". Fewer than 5 completed runs: no comparison ("too few to compare"). |
| Stages | One bar of colored segments, each listed below it with its duration: for a retry each earlier attempt (red when it failed) and the gap until the next was asked for (hatched), at most 3; the wait (gray): due to start for a scheduled run (`scheduled_for`), request to start for a console run, with when the worker picked it up; the run in its state's color. A run without `scheduled_for` (older runs, a first run) says "Wait: not recorded"; nothing is guessed. Segments are at least 3% wide, so a 5-second run shows beside a 3-hour gap. |
| Times and numbers | Started, finished, due or requested, in the browser's time zone (named at the bottom); up to four counts (errors first, then the largest); requests made (`counts["requests"]`, or "not counted"); the attempt when it is a retry. |
| Error | The error's first line, masked, for a failed or partial run. |
| Link | "Open run #N" (the bar itself also links to the run). |

**How it stays fast.** The view hands the ids of the runs it shows to `queries.run_cards(ids, now)`, which reads
everything in one statement, `RUN_CARDS_SQL`: the runs (the error cut to its first line in SQL), their feeds, the
OpsActions that started them (request and pick-up times), each job's usual runtime (`percentile_cont` over a
`LATERAL` scan of the job's newest completed runs through `fetchrun_job_started_idx`) and each retry's earlier
attempts (a recursive CTE on `retry_of`). `queries.stages()` turns a run into its segments and `queries.usual()`
compares it. The page embeds the result once (`{% json_data %}`: `json_script` without spaces) and
`_run_cards.html`'s script draws a card from it on demand, caching each card's markup: no request per hover. Times
are epoch seconds, durations seconds; keys with nothing to say are left out. About 270 bytes a run; the page makes
one query more than without cards.

**How it behaves.** The card is a single `role="tooltip"` element; the bar or square it describes gets
`aria-describedby` while it shows. Each bar and square keeps its link and an `aria-label` in words (job, time,
state, duration), and no `title`, so the browser's own tooltip never doubles it. The card opens on keyboard focus,
stays while the pointer is over it (its links work), closes when the pointer leaves, focus moves on, or Escape. On a
touch screen the first tap shows the card and a second tap on the same run opens it; a tap elsewhere closes it. It
is placed below its run, else above, else beside, always inside the window, and follows on scroll. Colors are the
console's variables, so it follows the dark scheme. The Dashboard's auto-refresh waits while a card is open.

## New events

`/ops/new/` (`views.new_events`; the reading is all in `opsconsole/newevents.py`, the page in
`templates/opsconsole/new_events.html`) follows each piece of content from the moment it came in to the release that
put it on the page ([ADR 0033](../adr/0033-a-new-events-page-derived-from-existing-rows.md)). No table holds its
states: each is derived, in SQL, from the rows that record it.

**Items.** `ITEMS_CTE` makes one row per item:

| Source | An item is | Found from |
|---|---|---|
| Current event (`current`) | a `write_event` task, with the event it wrote if any | the task; its entry through the insert Revision on `timeline_entry` linked to the task (`Revision.task_id`, set by `revising(task=…)` in the agent API), so a later rename keeps the link |
| History wave (`wave`) | each event a `fill_gap` task wrote (1–3), or the task alone when it wrote none | the same |
| Branch addition (`branch`) | an entry an edit file added | its insert Revision with no task and a reason starting `apply_edits` (only `add_branch` and `add_event` insert entries) |

Audit tasks, branch proposals and candidates that never became a task are not items.

**Steps.** Each item has five, each done, current, failed (where it stopped), skipped (not on its path) or pending:

| Step | Time and words |
|---|---|
| Fetched | A current event: the earliest `created_at` of the candidates in the task's `payload.items`, and how many stories. A gap ("Gap found"): the task's `created_at`, with the wave and window (`gap_waves` finds and queues a gap at once). A branch addition: skipped. |
| Queued | The task's `created_at` and priority; current while the task is `queued`. Skipped for a branch addition. |
| Drafted | The task's `completed_at` and the agent (the API applies the result and completes the task in one transaction; the Revisions' `at` is the transaction's start). While an agent holds the task: "Drafting", current, since `claimed_at`. A task that wrote nothing stops here: Rejected, Duplicate (with the event it names), Nothing notable, Task failed or Cancelled. A branch addition: its insert Revision, with the op and the file. |
| Reviewed | From the entry's Revisions on `timeline_entry`, `timeline_event` and `timeline_branch` (one `LATERAL` aggregate per item on `revision_row_idx`): the first that sets the status to `published` (Approved; **Approved with edits** when an `apply_edits` change came before it, the reason says "with edits", or an `edit` op on the entry is in the same transaction; "Added as published" when the add itself published it); the last that sets it to `retracted` (Rejected, or **Duplicate** when the reason says "duplicate"); else the first `apply_edits` change other than the insert's own op (**Held**: still in review). Who: the Revision's actor; the reason (after the file, op and slug) is the reviewer's words. |
| Published | The first release whose `revision_high_water` is at or above the publishing Revision (`publish_release`, smallest high-water mark first), at the release's `created_at`. **LIVE** when the entry is still published and that Revision is at or below the live release's high-water mark (the pointer's version; the newest release when the store can't say). Approved and not in a release yet: current, "next release". |

**States.** From the same rows (`STATES`, a badge each): Queued, Being written, In review, Held, Approved (published,
no release yet), Published, Rejected by the agent, Duplicate, Rejected, Retracted (rejected after a release carried
it), Nothing notable, Task failed, Cancelled.

**What the page shows.** A card for the 14-day pulse, then tabs (All, Current events, History waves, Branch
additions, Rejected & duplicates: rejected by the agent or a reviewer, duplicates and retractions; Waiting: queued or
being written), each with its count; the time range (Today, 7 days by default, 30 days, Any time) over an item's
last activity (its newest step time, so an item published today shows under Today); a state (with counts in the
tab); and a branch (a datalist of every branch; an item matches on its branch, a linked branch, a branch's own
entry, or for a task with no entry the gap's branch or the lead candidate's `top_branch`). Items are ordered by last
activity, newest first, 25 a page. Each shows its source, state, LIVE, title (the event's or branch's; before
drafting, the story's `title_hint` or the candidate's title), slug, how long ago, the date on the timeline, branch
chips (each a filter), sources (supporting citations on the entry's claims: all, and not Wikipedia; "single source"
when one independent publisher, `evidence.independence.witness`, as the snapshot's marker of ADR 0018), the wave,
window and gap kind, the agent and the verdict; the stepper; the reviewer's reason or the agent's note; and links:
On the page (`PUBLIC_SITE_URL/#<slug>`, only when live), the task, Revisions (the insert Revision's page, with the
row's whole history), the release, the candidate (admin).

**The pulse.** For each of the last 14 local days (`PULSE_DAYS`): candidates fetched (`ingest_candidate.created_at`),
tasks queued (the items' tasks by `created_at`), drafts written (items by their Drafted time), published (items by
their release's `created_at`) and rejected (by the agent, at `completed_at`; by a reviewer, at the retraction).
Inline SVG, one row a series, each scaled to its own busiest day (small multiples, so a release day doesn't flatten
the drafts), today's bar in the accent color, a `<title>` per bar, today's number and the 14-day total beside it,
and "As a table" for the numbers.

**Item cards.** Pointing at (or focusing, or tapping once) an item's title shows a card in the run card's style
(`_item_cards.html`, `newevents.card()`): the state and what it means, the five steps with their times in the
browser's time zone and the time between them, the agent and attempts, the verdict, the reviewer's reason, the
agent's note, the wave, the edit file. Its data is embedded with the page (`{% json_data %}`); no request per hover.

**How it stays fast.** Three statements and one lookup, whatever the tables hold: `COUNTS_SQL` (the items per source
and state under the time range and branch, for the tabs, the states and the pager's total, and the pulse, in one
statement over the same CTE), `PAGE_SQL` (the filtered, ordered page, cut by `LIMIT`/`OFFSET` in SQL; the tab and
state predicates are constants, never built from input) and `DETAILS_SQL` (the shown items' entries, branches,
citations, task payload fields, candidates and review Revisions, from the page's ids passed as one `jsonb`), plus the
live release's high-water mark. Task payloads (a `write_event` payload carries up to 12 stories) are read only for the
shown items. `newevents.Items` gives Django's `Paginator` the total and runs `PAGE_SQL` for a slice. On a copy with
6,300 tasks and their entries, the counts and pulse take about 120 ms and a page about 65 ms; the page makes 10
queries as staff (the session, the user, two permission reads, the branch filter, the three statements, the live
release, the branch list).

## Where the numbers come from

All reading is in `opsconsole/queries.py`; the views only arrange it. It computes totals in Postgres and never loads
rows to count them in Python, so each page makes the same number of queries whatever the table sizes (a test seeds
ten times the rows and compares; the seven main pages make at most 25 queries, a detail page at most 15).

| Figure | Query |
|---|---|
| A job's last run | `DISTINCT ON (job, feed_id)` over FetchRuns that aren't running, newest first: one row per job and feed. A feed job's row is its newest run across its feeds. |
| The ten-run strip | `HISTORY_SQL`: for each job name, a `LATERAL` subquery taking its newest ten runs through the `(job, started_at DESC)` index (`fetchrun_job_started_idx`, added with the run logs), one query for every job. |
| Failures in a row | `FAILURE_STREAKS_SQL`: per job and feed, failed runs since the last `ok` or `partial` one (a `stopped` run neither counts nor resets it). The same count as `infra/alerts.py` `consecutive_failures`, for every job in one query; the page shows the worst feed's. |
| Needs attention | From the same last runs: each job's (each feed's) whose status is `failed`, except a paused job's and a dismissed run (`FetchRun.dismissed_at`, [ADR 0039](../adr/0039-dismiss-a-failed-run.md)). A paused job's row also has `alerting` false; its `failures` stay, and its page shows them as "Before the pause", not "Failing". A feed whose last run is a dismissed failure is left out of the job's `failures` and `alerting` (so out of the problems line) and listed in `dismissed`, with its count in `dismissed_failures`; the job's page shows it as "Dismissed". The count itself is not reset: a new failure after a dismissal is counted with the ones before it. |
| A retry under way | `queries.recoveries()`, one query for the running runs of the failing jobs, matched in Python with `pending_runs()` (the console runs and retries not yet finished, which the jobs query already reads): a running run of the same job and feed that started after the failure is **Retrying** (its run, and its `ops_action`); else an open `retry_run` of that run, or an open `run_job` whose `params["feeds"]` include its feed (or name none), is **Retry queued** while pending and **Retrying** once the worker has it. In each job row as `recoveries` (failed run id → state, label, action, run); the problems line adds the label when every failing feed of the job is being retried. |
| Next due | A plain job: its last run's start plus its interval. A feed job: the earliest `next_run_at` of its enabled feeds. Overdue means more than 30 minutes past. A job that never ran is due now. |
| The run graph | FetchRuns started in the last 24 hours (on the `started_at` index), placed as shares of the window in Python. |
| Run cards | `RUN_CARDS_SQL` ([above](#run-cards)): the shown runs, their feeds and actions, each job's median and p90 over its last 30 completed runs, each retry's earlier attempts; one query per page. |
| The worker | `pg_locks`: whether a session holds the scheduler lock (`ingest/jobs.py` `SCHEDULER_LOCK_KEY`, held by `run_jobs --loop` for its life) or the runner's lock (`LOCK_KEY`). With neither and no run started for 30 minutes, the Dashboard says no worker is running jobs. |
| Agent queues | One `GROUP BY kind` with a `FILTER` per number: waiting (`queued`), in progress (`claimed`, lease live), stuck (`claimed`, lease expired), done and failed today, failed; and one count of today's tasks by the jobs with a daily cap. "Today" starts at local midnight, as the caps do. |
| A run's log | The run's `RunLog` row (`ingest/runlog.py`, [ingestion](ingestion.md#the-job-runner)): one row, read only on the run's page. Lines are masked when captured and masked again when shown. |
| Content a run wrote | Revisions by `job:<name>` between the run's start and finish (the `at` index). |
| Release totals | Each release's `manifest.json` (its `changes` key), read once per process and cached, since release files are never rewritten. Page only: totals all zero and a page hash unlike the previous release's. |
| Not released yet | Revisions after the newest release's `revision_high_water`, by actor kind. |
| Fact base | Record claims (`as_written`, `why`, `origin`) on published entries by status: one aggregate. |
| New events | `opsconsole/newevents.py` ([above](#new-events)): items, steps and states derived in three statements from tasks, Revisions and releases. |
| Waves | `JobState` "gap_waves" read directly (`governance.waves.state()` would create the row). |
| Paused jobs | `JobState` "paused_jobs" through `ingest.jobs.paused_jobs()`, which reads without creating the row. |
| Archived jobs | `JobState` "archived_jobs" ([ADR 0041](../adr/0041-archive-a-job.md)); `ingest.jobs.holds()` reads it with "paused_jobs" in one query, and the Dashboard, Jobs and a job's page pass that to `queries.jobs(holds=…)`, `timeline(archived=…)` and `queue(archived=…)` so the page reads it once. `jobs()` leaves an archived job out unless `include_archived` (a job's page); the run graph leaves out its row, the Work cards' `fed_by` (`queries.fed_by`) its link. Its FetchRuns are untouched: `fetch_runs()` still lists them. |
| Rounds | `queries.rounds_overview`: the settings (`JobState` "agent_rounds", read without creating the row), the last ten `Round` rows with their releases, and the held drafts' count (`work.rounds.held_drafts`: entries in review with an `apply_edits` Revision, one `EXISTS` query); "next round will take" is the size times the queue's waiting counts. A queue card's 7-day count is one more `FILTER` in the queue's `GROUP BY`. |
| A round's progress | `queries.live_round`: the open round (`work.rounds.open_round`: open and younger than 12 hours, newest first), its stages, and `work.rounds.progress`: one `GROUP BY kind` over the tasks whose `round` is it, a `FILTER` per count, beside the plan's `mix`. No task state of its own: the link is set by the claim ([work queue and agents](work-queue-and-agents.md#a-rounds-progress)). |

Lists never load the big JSON columns: tasks defer `payload` and `result` and read the decision and note with JSON
key transforms; Revisions defer `before` and `after`. Error text and log lines are passed through
`ingest.runlog.mask` (the `masked` filter) again before they are shown.

## The Docs page

`opsconsole/docs.py` reads three folders of `docs/`: `manual` (the Maintainer's Manual, [ADR 0030](../adr/0030-a-maintainers-manual-in-simplified-technical-english.md)), `guide` and `adr`
(`SECTIONS`). A document is a `.md` file there or one folder down (the manual's `procedures/`); its slug is its path
there without `.md`, its title the front
matter's `title` (the guide's chapters) or its first `# ` heading, its order the front matter's `order` or the file
name, a README first and a subfolder's documents last, under its name. A URL's slug is looked up in the folder's
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
3. for a plan with `confirm_name` (archiving a job), requires `confirm_name` in the form to equal the token's
   exactly (400, the confirmation again, with what was typed kept), and records what was typed in the params as
   `confirmed_name`;
4. requires the reason (400, the confirmation again);
5. applies the rate limit, and for a publish or a rollback the one-at-a-time rule (429 or 409);
6. inserts the OpsAction under the key (the unique index settles a race the same way as step 2);
7. runs it now if it is quick, or leaves it `pending` for the worker; then redirects (303) to the action's page.

Only `publish --check` (the Releases page's "Publish") skips the confirmation (it writes nothing); its button carries
a key minted with the page.

**The actions.**

| Action | Runs in | Confirmation shows | Does | Refused when |
|---|---|---|---|---|
| Run a job now (`run_job`) | worker | the job, its interval, whether it is idempotent (`Job.not_idempotent`), the feeds it will fetch, its last five runs | `ingest.jobs.run_named(name, feed=…)` for each feed named, with its output captured; the result lists the FetchRuns and counts the Revisions the job wrote (as `job:<name>`, inside its own `revising()`) | the job is paused, running, or already queued from here; `link_health` or `second_source` ran within their interval (a day): they are not idempotent back to back, and the page says why and when it may run again; for a feed job, a feed fetched in the last 60 minutes is left out (`FEED_COOLDOWN_MINUTES`), and with none left it is refused |
| Retry a failed run (`retry_run`) | worker | the failed run's first error line, then as above for its job and feed | the same | as above, and when a later run of that job and feed succeeded |
| Dismiss a failed run (`dismiss_run`) | request | the run and its first error line, the job and feed, how many times in a row it failed, what dismissing does and does not do; a warning at two failures in a row or more that pausing may be the right action | stamps the FetchRun `dismissed_at`, `dismissed_by` and `dismiss_action` (under `SELECT … FOR UPDATE`): it leaves Needs attention, the problems line and `/healthz`'s `failing_jobs` (state `dismissed`), and stays in the history and on the Runs page, marked Dismissed ([ADR 0039](../adr/0039-dismiss-a-failed-run.md)) | not failed; already dismissed; a later run of its job and feed finished (it is no longer the one on the card); a retry or a new run of it is queued or running (its result decides) |
| Release a lease (`release_lease`) | request | the task, its holder, when it was claimed, the lease (expired or live, with a warning if live), attempts | `work.queue.release_stuck` | the task is no longer claimed by the agent the page showed (also checked again inside the transaction) |
| Extend a lease (`extend_lease`) | request | as above, and the new end (1–1,440 minutes, default 60) | `work.queue.extend_for` | as above |
| Requeue tasks (`requeue_tasks`) | request | the selection (one task, or the list's filters), how many are eligible (failed, cancelled or deferred: `queue.requeueable_q`), the first 50 by priority and age, as a table | `work.queue.requeue` on exactly those ids (attempts reset; `not_before` and `payload.needs` cleared, so a deferred task is offered at once) | none is eligible (a plain waiting task has nothing to requeue); a batch with no filter |
| Cancel tasks (`cancel_tasks`) | request | the same, for queued tasks and claimed ones whose lease expired | `work.queue.cancel` on exactly those ids | as above; a live lease is never cancelled |
| Advance the wave (`advance_wave`) | request | the active wave and the next, the leaving wave's coverage, gaps and held counts from the last `gap_waves` run, its open `fill_gap` tasks, and a dry run of `gap_waves` with the new wave active (rolled back): what it would queue | `governance.waves.set_active(to, by="human:<username>", reason=…)` | the last wave is active; the active wave changed since the confirmation |
| Check and publish (`publish_check`) | worker | (no confirmation) | `publish.release.preview()`: the gates, the change report (stored as the action's output), both hashes, whether a release would be made | a gate fails (the action fails with the gates' problems) |
| Publish (`publish`) | worker | the finished check's page: the change report, the totals, "page changed; content unchanged" and the like, both hashes, a warning when nothing changed; fields for notes and "force: page-only change" | checks the content and page still hash as checked, then `publish.release.publish(actor="human:<username>", notes, force)`: the gates run again | the check isn't done, is over 30 minutes old or was already used; another publish or rollback is open; the content or page changed since the check |
| Roll back (`rollback`) | worker | the pointer now (and who wrote it), the release it would point at, its snapshot's hash verified, its change totals | `publish.release.rollback(version, actor="human:<username>")` | it is already live; its snapshot is missing or doesn't match; another publish or rollback is open |
| Pause, resume a job (`pause_job`, `resume_job`) | request | the job, and what pausing means | `ingest.jobs.set_paused`: `JobState` "paused_jobs" names it with who and why; `run_due` skips it | already paused; not paused; archived (unarchive it first) |
| Archive a job (`archive_job`; [below](#archiving-a-job)) | request | the job; its pause (already paused, by whom, or "archiving pauses it first"); its running runs (each stops at its next safe point) and its console runs waiting for the worker (withdrawn), as a table; and the consequences (`actions.ARCHIVE_CONSEQUENCES`: paused, runs stop, hidden, kept, undo); the job's exact name typed | pauses it with `set_paused` unless paused (the reason names the action); marks its pending `run_job` and `retry_run` actions `cancelled` ("withdrawn: … archived"); `ingest.jobs.set_archived` records who, when, why, the action and `paused_by_archive`; the result lists the withdrawn actions and the runs asked to stop | no such job; already archived; the name not typed exactly (in `views.confirm`, and again in `execute`) |
| Unarchive a job (`unarchive_job`) | request | who archived it, when and why, and that it comes back paused | `set_archived(…, False)`; pauses it again if its pause was removed while it was archived (`paused_again`) | not archived |
| Pause, resume the scheduled rounds (`pause_rounds`, `resume_rounds`) | request | the schedule in words and the next due time, and what pausing means (the routine still wakes, finds rounds paused and stops; a round by hand still runs; one running finishes) | `work.rounds.change(paused=…)`: the "agent_rounds" `JobState`, with who and why; `POST rounds` then refuses a scheduled round (409 `paused`) | already paused; not paused |
| Skip the next round (`skip_round`) | request | the schedule and what skipping means | `work.rounds.change(skip_next=True)`: the next scheduled round is recorded as Skipped with the reason, and the flag clears | already skipped; rounds are paused |
| Set the round size (`round_size`) | request | a table per role: its task kind, agents and tasks each (old → new), tasks in all; the limits | `work.rounds.change(size=…)`; the next round plans with it | out of bounds (by default 0–8 agents a role, 16 in all, 1–20 tasks each, the `ROUND_MAX_*` settings: `work.rounds.validate_size`); the same size |
| Send held drafts to the next review (`review_held`) | request | the held drafts (at most 200), as a table | `work.rounds.change(carry_over={"slugs": …})`; the next round's start moves them into its plan, for its reviewers, and clears it | none is held |

None of the round controls starts a round or calls Anthropic's services: they change the settings the routine reads
(`GET rounds/settings`) and `POST rounds` enforces (the `run-round` skill checks them first and exits cleanly when
paused).

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
(`job:<name>`, `run:<id>`, `task:<id>`, `tasks:<n>`, `wave:<name>`, `release:<version>`), `params` (what the confirmation showed
and the action uses), `reason` (required: a check constraint refuses an empty one), `requested_by`
(`human:<username>`, or since ADR 0035 `agent:<name>` for the agent API's operations; a check constraint refuses
anything else), `idempotency_key` (unique), `runs_in` (`request`, `worker`, or `api`: an agent's `edits/check`,
`edits/apply`, `releases/check` or `releases/publish`, done in its own request; [work queue and
agents](work-queue-and-agents.md#a-rounds-operations)), `round` (the agent round it belongs to, if any), `status`
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
("interrupted") at the next pick-up; an agent API action still `running` after 10 minutes
(`actions.API_STALE_MINUTES`: its request was cut off) is closed the same way by the next publish lock check
(`close_interrupted_api`), so it never holds the lock. The one-at-a-time rule counts both doors' publishes and
rollbacks: the worker's next publish refuses while an agent's runs, and the agent's while the console's is open. A pending one can be withdrawn from its page ("Withdraw it"), and it then
never runs. With no worker running, actions wait; the page says so.

**Where the buttons are.** Run now, Pause and Resume on Jobs and a job's page (and Run per feed); Archive… on a
job's page; Unarchive on an archived job's page and on Archived jobs; Retry and Dismiss on the
Dashboard's "Needs attention" and a failed run's page (neither while it is being retried; Dismiss only on the job and
feed's last run); Release on Work's stuck leases and a task kind's list,
Extend on a task's page; Requeue and Cancel per task and for a tab's tasks; Advance on Work's wave card; Pause
rounds, Resume rounds, Skip the next, Send held drafts to the next review and Set the round size on Work's round
strip; Publish
on Releases (and the unreleased changes); Roll back to this on each release that isn't live.

### Archiving a job

[ADR 0041](../adr/0041-archive-a-job.md). A job's page, for an operator and a job not archived, makes the archive's
plan and token when it is shown (`views.job_detail` calls `actions.prepare_archive_job` and `plan_token`, as an
action's page does for a publish). `_archive_dialog.html` draws the Archive… button, a form that POSTs to
`/ops/act/archive_job/` (the ordinary confirmation page, without JavaScript), and a `<dialog>` in GitHub's style: a
header "Archive <name>", a warning strip, the consequences from the plan's rows, "To confirm, type <name> in the box
below", the box (`confirm_name`), the reason and a red "Archive this job" button. `_typed_name.html`, a small script,
opens the dialog instead of the page, and keeps the button disabled until the box holds exactly the name (the
confirmation page's form, `_confirm_form.html`, gets the same box and script for any plan with `confirm_name`). The
dialog POSTs straight to `/ops/act/archive_job/confirm/` with the token, so it goes through the same steps as every
confirmation, the typed-name check included; its token is good for 30 minutes from when the page was shown.

What the archive does to a running job is the runner's: `ingest.jobs.Context.check_stop` at each request
([ingestion](ingestion.md#the-job-runner)). A console run whose run stopped there is `cancelled` (`run_now` reads
`result["stopped"]`), with "run #N stopped at a safe point" as its error. While a job is archived, `job_refusal`
refuses Run now and Retry ("… is archived; unarchive it first"), `_pause_plan` refuses Pause and Resume, and a failed
run's page offers neither Retry nor Dismiss and says the job is archived.

## Template helpers

`opsconsole/templatetags/ops.py` holds the tags and filters the templates use: `badge` (a state badge), `task_state`
and `action_state` (a task's or an action's status in state words), `history_strip` (the ten-run squares, each with
`data-run` for its card and an `aria-label`), `json_data` (`json_script` without spaces, for the run cards and the item cards),
`level_class` and `logtime` (a log line's color and time), `every` (an interval in words), durations (`seconds`),
ages (`span`, `ago`), shares (`pct`), `masked` (secrets out of text shown), `words` (a key as words), JSON
(`pretty`), `act` (a one-button POST form for an action, only for operators) and `took` (how long an action ran).
`field_diffs` turns a Revision into rows of column, before and after, with a word diff (`difflib`) for long text.

## Tests

`tests/test_opsconsole.py` holds the line:

- anonymous and non-staff users are redirected, a POST to a page is refused, staff get `noindex` and `no-store` on
  every page, another host gets a 404 when `OPS_HOSTS` is set, the sidebar has exactly the seven items, the admin
  links to the console, the old addresses redirect, and tabs are titled "<page> · <name> Operations" (the admin's
  "<page> · <name> administration") with the brand's icons;
- every page and detail page renders against `seed()` (runs over the last day with their logs, most with the time
  they became due, a manual run from the console and a run retried twice, a job at the alert
  threshold with a key in its error, a running run, tasks with a stuck lease, a pending and a cancelled console run,
  a paused job, agents' and a reviewer's edits, a release, the waves' state) and shows what it should: the problems
  (and a failing job, once paused, out of them, out of attention and not alerting, listed as paused; back once resumed),
  the run graph, attention, up next and the queues; tags, schedules in words and the ten-run strips, the tag filter;
  the run filters by job, state and tag; a run's log, its level filter and plain text, masked; the Work cards, tabs
  and stuck leases; releases, page-only releases, unreleased changes and a Revision's diff; the Docs page, its links
  and Mermaid only where a diagram is;
- the Docs page against a stand-in `docs/` folder: the manual's stub, links rewritten, code links as code, the
  table of contents, a script, an event handler and a `javascript:` link removed; and the real `docs/manual/`: its README first, its top-level files, then its
  procedures under "Procedures", each one rendering;
- a run's log (`RunLogTests`): what a job logs, prints and reports as an error, masked (a key parameter, a bearer
  token, a URL's password), nothing below INFO, `httpx`'s noise dropped, the cap (head, the left-out line, tail), a
  failure's traceback, other threads ignored, old logs pruned;
- reading every page writes nothing;
- each page's query count is the same after the tables grow tenfold.

`tests/test_opsconsole_cards.py` holds the run cards to theirs:

- what started a run: the scheduler (with `scheduled_for`, empty for a first run; a feed job's `next_run_at`),
  `run_job` from the shell (manual, "shell"), "Run now" through the worker (manual, who, the action), and two retries
  in a row (retry, the retried run, attempts 2 and 3); the backfill from the audit rows, leaving other runs alone;
- the stages: a scheduled run's wait, an older run's "not recorded", a console run's queue and pick-up, a shell run
  with no wait, a retry's attempts and gaps, a running run up to now; the usual-runtime comparison and its minimum;
- `run_cards`: the median and p90 from SQL over the last 30 completed runs only, a retry card's whole shape (keys
  left out when empty, epoch times, the error's first line masked), at most 3 earlier attempts, and one query for 3
  runs or 63 (with a long retry chain);
- the pages: every Dashboard bar and every strip square carries `data-run`, its card and an `aria-label`, no
  `title`; the script has the tooltip role, `aria-describedby`, Escape, focus, the 80 ms delay and no `fetch`.

`tests/test_opsconsole_new_events.py` holds New events to its rules, against `seed_content()`, which makes the items
through the real paths (candidates and `write_event` tasks as `process` makes them, `fill_gap` tasks as `gap_waves`
does, results through the agent API's appliers and `work.queue.complete`, a review round through `apply_edits`, a
release, and one approval after it):

- staff only, read only, `noindex`, `no-store`, and its place in the sidebar;
- a current event's five steps and their times (the cluster's first candidate, the task's creation and completion,
  the approval, the release), Approved with edits, LIVE and the page's link, sources and the single-source flag,
  Held; a reviewer's rejection and a duplicate; the agent's rejection (the story's title, the note), duplicate,
  failed, queued and being written;
- a wave: one item per event a task wrote, Gap found, the wave and window, Approved after the release (no release
  yet, not live), Nothing notable, a queued gap with its branch;
- branch additions: the branch and its events, the op and the file, skipped Fetched and Queued, "Added as published";
- every tab against its predicate, the state, branch and time filters, the order, bad input falling back; the pulse's
  14 days against the rows; the page rendering every tab; reading writes nothing; the query count the same after the
  content grows several times over, at most 10.

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
  check, and a rollback (the build gate stubbed: no Node);
- Needs attention (`NeedsAttentionTests`): a retried run shows Retry queued with its action, then Retrying with its
  run (also on the run's page), with no Retry or Dismiss, and leaves the card once the retry completes, while the
  problems line and `/healthz` call it failing until then; a later scheduled run counts as the retry; a retry that
  fails replaces the row with the new failure; a dismissal's confirmation, required reason and audit row, the run
  off the card and the problems line, `/healthz` `dismissed` with the count kept, the run still on the Runs page and
  its own page marked Dismissed, a second dismissal refused, and a newer failure back on the card, counted with the
  earlier ones; and the refusals (no permission, no such run, not failed, no longer the last run, being retried,
  and a retry asked for after the confirmation page, refused in the request).

`tests/test_opsconsole_archive.py` holds archiving ([ADR 0041](../adr/0041-archive-a-job.md)): the archive pauses the
job (or keeps its pause) and leaves its audit row with the typed name; the typed name is checked by the server (a
wrong case, a trailing space, another job or none is a 400 and nothing changes) and kept on the page with a missing
reason; the permission and the refusals; queued console runs withdrawn and nothing left for the worker; a running
run asked to stop; a run stopped at its next request (not swallowed by the job's `except Exception`, not a failure,
not counted) and a console run so stopped `cancelled`; the throttled check; archived jobs never run (scheduler,
`run_named`, Run now, Pause, Resume); hidden from the Jobs list and its tag counts, the Dashboard (Needs attention,
the run graph, the paused list, the problems line), `/healthz` and the Work page's "fed by", while its runs stay on
the Runs page and its run's page offers no Retry or Dismiss; its page reachable with only Unarchive; the archived
jobs view; the job page's dialog and its token; and unarchive back paused (listed, in `paused_jobs`, still skipped
until resumed), a pause removed while archived put back, and only for operators.

`tests/test_rounds.py` (`ConsoleRoundTests`) holds the rounds' part: the Work page's round strip, its sentence and
the flow, "next round will take" and "fed by", the Jobs page's sentence, a round's page, the rounds list and the
Dashboard's card; no buttons and a 403 for staff without `ops_operator`; pause, resume, skip and size as confirmed,
audited actions with their refusals (already paused, nothing to skip while paused, a size over the cap), and held
drafts sent to the next review. The same file holds the agent API's operations and the `run-round` skill's
preflight ([work queue and agents](work-queue-and-agents.md#rounds)). `tests/test_round_progress.py` holds a
round's progress: which claims link a task to the round, the per-kind counts, and the live strip, the kind cards'
line and the 20-second reload shown for an open round and absent when none is open.

`seed()` also fills a local database for a look at the pages: `uv run python manage.py shell -c "from
tests.test_opsconsole import seed; seed(skip_gates=(), releases=2)"` (with `skip_gates=()` it runs every publish
gate, so it needs Node). It edits one archive event as an agent and as `human:owner` and pauses `year_pages`, so use
it on a development database only.

## Changing it

| Change | What it needs |
|---|---|
| Something new on a run card | A column in `RUN_CARDS_SQL` (never a second query per run), its key in `run_cards` (left out when empty), its line in `_run_cards.html`'s `render`, a test in `test_opsconsole_cards.py`; [ADR 0032](../adr/0032-run-cards-and-what-started-a-run.md) if it changes what is recorded |
| A new figure | A function in `opsconsole/queries.py` that aggregates in SQL, its place on a page (a card, not a table, unless it is a list), a line in `test_opsconsole.py`'s page tests, and the query-count test still equal; this chapter |
| A new step, state or tab on New events | `opsconsole/newevents.py`: the column in `ITEMS_CTE` (never a query per item), the state in `STATES` and its `CASE`, the tab in `TABS` and `_in_tab`; a test in `test_opsconsole_new_events.py` through the real paths; this chapter and [ADR 0033](../adr/0033-a-new-events-page-derived-from-existing-rows.md) if it reads a new row |
| A new page | Think twice: the sidebar is seven items on purpose. A detail page linked from one of them, its test, the query-count test |
| A new problem on the Dashboard | `views.problems()`: one sentence, a level (`bad` or `warn`) and where to look; a test |
| A table the console reads changes shape | Its query here and the test; the chapter that owns the table |
| An index for a slow page | A migration in the app that owns the table, and a note in [ADR 0031](../adr/0031-a-simpler-console-and-run-logs.md) |
| A new job tag | `ingest/jobs.py` `TAGS` and the job's `@job(tags=…)`; [ingestion](ingestion.md#the-job-runner) and this chapter |
| A new docs folder | `opsconsole/docs.py` `SECTIONS`; the link rewriting follows |
| The Mermaid version | `docs.MERMAID_URL` (a pinned version, at least two weeks old); look at a page with a diagram in both themes |
| A round control or a round figure | `work/rounds.py` (the setting, its limits, what `start()` does with it), its action here, the `run-round` skill (the routine must obey it), `test_rounds.py`, this chapter, [work queue and agents](work-queue-and-agents.md#rounds) and the manual's procedure 14 |
| Restricting it to the data host | Set `OPS_HOSTS` on the app (a config var; no deploy) |
| A new action | An `OpsAction.Kind` (and a migration for the choices), `prepare` and `execute` in `opsconsole/actions.py` and an `Action` in `ACTIONS` (`runs_in` worker for anything that could outlast gunicorn's 30 seconds), a button through `{% act %}`, tests of its effect and refusals, this chapter, and a note in [ADR 0031](../adr/0031-a-simpler-console-and-run-logs.md) |
| Who may act | Grant or revoke `ops_operator` in the admin; no deploy |
| The limits | `RATE_LIMIT`, `RATE_WINDOW_MINUTES`, `FEED_COOLDOWN_MINUTES`, `CHECK_FRESH_MINUTES` in `opsconsole/actions.py`, `MAX_BATCH` in `work/queue.py`; a job's idempotency is `not_idempotent` on its `@job` in `ingest/job_defs.py` |
