# 0041 — A job can be archived from the console: paused, its runs stopped, hidden, its history kept

**Status:** proposed (November 2026; the owner asked for an Archive action with a GitHub-style confirmation); amends [0028](0028-operations-console.md) (two new actions, `archive_job` and `unarchive_job`, and a confirmation that needs a typed name); amends [0019](0019-processes-and-release-gates.md) (`/healthz` leaves an archived job out); amends [0012](0012-ingestion.md) (the runner never runs an archived job, and a run of one stops at its next safe point, recorded as `stopped`)

## Context

Jobs are code: `ingest/job_defs.py` registers each one, and the console lists the registry. Some jobs outlive their
use. A source closes, a job is replaced by a better one, or a job was an experiment. The console had two ways to
deal with such a job, and neither fit:

- **Pause** stops the schedule, but the job stays everywhere: in the Jobs list and its tags, on the Dashboard
  (listed apart as paused, its "N paused" beside the problems), in `/healthz` `paused_jobs`, and on the Work page as
  a job that "feeds" a task kind. A paused job says "back soon"; a retired one should not take room on every page.
- **Deleting the job from the code** removes it from the registry, but the console then has runs of a job it does
  not know, a deploy is needed to change one's mind, and a run under way when the worker restarts is cut off.

The owner asked for an Archive action on a job's page: it pauses the job first (the pause machinery of
[0028](0028-operations-console.md)), stops every current run of it, hides it from the console and from health, keeps
its history, and can be undone. The confirmation should be GitHub's: a dialog that says what will happen, and a
button that stays disabled until the operator types the job's exact name.

## Decision

**The archive is state, like the pause.** `ingest.jobs.set_archived` keeps the archived jobs in the `JobState`
"archived_jobs", each with who, when, the reason, the action's id and whether the archive paused it. Jobs are not
rows, so there is no table to put a flag on, and the pause already lives in a `JobState` beside it. No job is ever
deleted: its runs, run logs and the Revisions it wrote are untouched. `ingest.jobs.holds()` reads both states in one
query, so the pages that read the pause read the archive at no extra cost.

**Archive is a console action like the others.** `archive_job` and `unarchive_job` (`OpsAction.Kind`, migration
`opsconsole/0006_archive_actions`) need `ops_operator`, a confirmation, a required reason and an idempotency key,
and leave an `OpsAction` row. Both run in the request, in one transaction. Archiving:

1. pauses the job with `set_paused`, the reason naming the action, unless it is paused already (then its pause, and
   its reason, are kept);
2. withdraws its `run_job` and `retry_run` actions still waiting for the worker (status `cancelled`, the error naming
   the archive);
3. records the archive; the worker's run of it, if one is under way, sees it at its next safe point (below).

It is refused for a job that is not in the registry or is archived already. Unarchiving removes only the archive
entry: the job comes back **paused**, so it runs again only when an operator resumes it. If its pause was removed by
hand while it was archived, unarchiving pauses it again. While a job is archived, Run now, Retry, Dismiss, Pause and
Resume are refused for it, and its page offers only Unarchive.

**The confirmation needs the name, and the server checks it.** The plan of `archive_job` names `confirm_name` (the
job's name). The job's page carries the dialog: its plan and signed token are made when the page is shown, as a
publish check's page carries the publish confirmation. The dialog lists the consequences, asks for the name and a
reason, and its button stays disabled until the box holds the exact name. Without JavaScript the Archive button opens
the ordinary confirmation page, which has the same box. `views.confirm` compares what was typed with the name in the
signed token, exactly (case and spaces count), and answers 400 without acting when they differ; the OpsAction
records what was typed (`params.confirmed_name`), and `execute_archive_job` refuses without it. The browser's check
is a convenience; the server's is the rule.

**A run under way stops at its next safe point.** A job cannot be killed from the web request: it runs in the
worker, under the runner's lock, often inside its own transactions. So the run stops itself:

- `Context.check_stop()` raises `RunStopped` when the run's job is archived. It reads the `JobState` at most once
  every `STOP_CHECK_SECONDS` (5).
- The Fetcher calls it before every request. A request is a safe point by construction: a network error can already
  end a job there, so every job already tolerates stopping at that point. A long job that fetches nothing may call
  `ctx.check_stop()` between items.
- `RunStopped` is a `BaseException`, like `KeyboardInterrupt`, so a job's own `except Exception` around one item does
  not swallow it and carry on. An open transaction rolls back.
- `run_due` reads the held jobs (paused or archived) before each run, and `run_named` before each feed, so the feeds
  of a feed job not yet started are not run.
- The run is recorded with a new status, `stopped` (migration `ingest/0010_stopped_runs`), and the reason in its
  error. It is not a failure: it does not count in `consecutive_failures`, sends no alert and is never in Needs
  attention. The console shows it as Cancelled. A console run whose run stopped is `cancelled`, not `failed`.

`run_named` (and so `manage.py run_job`) refuses an archived job. A paused job can still be run by name from the
shell; an archived one is retired, and unarchiving it is one click.

**Hidden, but not gone.** `opsconsole.queries.jobs()` leaves an archived job out unless asked (its own page asks), so
it is out of the Jobs list and its tag counts, the Dashboard's problems, Needs attention, paused list and Up next,
and the Runs page's Up next. The run graph leaves its row out, the `paused` tag does not name it, and the Work page's
"fed by" does not link it. `/healthz` leaves it out of `jobs`, `failing_jobs`, `paused_jobs` and `dismissed_jobs`.
Its runs stay on the Runs page (by job, state and tag) and in the database. Its page stays at `/ops/jobs/<name>/`
with an Archived banner, and **Jobs › Archived jobs** (`/ops/jobs/archived/`) lists every archived job with who, when,
why, its runs kept and Unarchive.

## Consequences

- A retired job takes no room on any page or in health, and can come back without a deploy.
- One more `JobState`, two action kinds, one run status, two migrations. The pages that read the pause read the
  archive in the same query; a job's page makes a few more (the archive's plan, for the dialog).
- The scheduler reads the held jobs before each run instead of once per pass: one small query per job (and per feed),
  so a job paused or archived in the middle of a pass is held from its next run, not only from the next pass.
- A run that makes no requests and never calls `check_stop` runs to its end; only its next runs are prevented. The
  jobs that take long are the ones that fetch.
- A stopped run's rolled-back transaction loses what that run was doing; work it committed before the safe point
  stays, as after a network error.
- An archived job that is later deleted from the code stays in the archived list, marked "no longer in the code",
  until it is unarchived.
