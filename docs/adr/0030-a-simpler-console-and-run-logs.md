# 0030 — A simpler operations console, shaped like an orchestrator's, with every job run's log

**Status:** accepted (November 2026); amends [0028](0028-operations-console.md) (the console's pages, its "no JavaScript and no new dependency" rule, and its "no index" note)

## Context

The console of [ADR 0028](0028-operations-console.md) works: six read pages and eight audited actions. The owner
finds it shows too much, and not the right things. The Overview was a wall of tables (health cards, every job's
row with counts, the queue with seven columns, intake, alerts); Job runs, Work queue, Changes and Content programs
each added more tables; and the one thing the owner wanted when a job failed, what the run actually did, wasn't
anywhere: a FetchRun keeps its counts and an error, and the runner's output went to the worker's terminal or
Heroku's log buffer, gone within hours. The owner likes Prefect Cloud's console (a list of deployments with tags and
a run history, flow runs with state badges, a page per run with its logs, a run graph) and asked for a simpler,
single-project version of it.

## Decision

**Six pages, nothing else in the sidebar** (`opsconsole/urls.py`, `views.py`, templates; how it works:
[the console's chapter](../guide/operations-console.md)):

1. **Dashboard** (`/ops/`): one status line ("All good" or "N problems", one sentence each, linking to where to
   look), the last 24 hours of runs as a run graph (a row per job, a bar per run, colored by state), failed runs
   needing attention with Retry, what runs next, and three numbers per agent queue (waiting, in progress, stuck);
   then three small cards: the live release, today's intake against the caps, the latest actions.
2. **Jobs** (`/ops/jobs/`, Prefect's deployments): one row per job with its tags, its schedule in words, its last
   state, a ten-run history strip and Run now / Pause / Resume; a filter by tag; a page per job.
3. **Runs** (`/ops/runs/`, Prefect's flow runs): every run with a state badge, filtered by job, state and tag; a page
   per run with its log, its counts as a short list, its error and traceback, and Retry.
4. **Work** (`/ops/work/`): a card per task kind, the stuck leases with Release, the content wave with Advance; a
   page per kind with tabs and Requeue / Cancel (the batch capped at 50 as before). No payloads unless expanded.
5. **Releases** (`/ops/releases/`): every release with its added, changed and retracted totals, a page-only flag
   and the live badge, Publish (the check first, as before) and Roll back to this; a release's page renders its
   change report and lists the Revisions it carried, each linking to its diff. The changes not released yet are a
   card and a list.
6. **Docs** (`/ops/docs/`): `docs/manual/` (the maintainer manual), `docs/guide/` and `docs/adr/`, rendered on the
   server and sanitized, with a table of contents and Mermaid diagrams drawn.

The first console's Changes feed and Content programs page are gone (their addresses redirect); the revision diff
stays, reached from a task, a run or a release. The action log stays, linked from the Dashboard. Every safety rule
of ADR 0028 stands unchanged: staff only, `ops_operator` to act, CSRF, the confirmation with its dry run or check, a
reason, the `OpsAction` row, the rate limits, the worker picking up long actions.

**Run states.** The pages speak Prefect's words for what the runner records (`opsconsole/queries.py` `STATES`):
Completed (`ok`, or `partial` shown as completed with errors), Failed, Running; Scheduled (a job's next due time),
Pending (a console run the worker hasn't taken), Cancelled (one withdrawn), Paused. Green, red, blue, gray, amber.

**Job tags.** A fixed, documented set in `ingest/jobs.py` `TAGS`: `collect`, `process`, `fact-check`,
`governance`, `waves`, `maintenance`; each `@job` in `ingest/job_defs.py` names its tags (an unknown one fails at
import), and the console adds `paused`. A job's description is its docstring's first sentence (`Job.doc`), so the
docstrings now open with one plain sentence.

**Run logs.** Every job run keeps its log (`ingest/runlog.py`, model `ingest.RunLog`, migration
`ingest/migrations/0006_runlog_and_job_index.py`). `run_one` attaches a `logging.Handler` to the root logger for the
run's duration (lowering the root's level to INFO for that time only) and keeps the running thread's records at INFO
and above, plus the runner's own lines: start, `ctx.log`, each `ctx.error`, a failure's traceback, the finish with
the counts. The fetcher logs one line per request without its query string. Every line is masked
(`mask_secrets`, then bearer tokens, `password=`-style values and URL credentials); `httpx` and `httpcore` below
WARNING are dropped. A run keeps at most 2,000 lines and 200 KB: the head up to the cap less a 200-line tail, the
tail, and a line saying how many were left out between. The log is written when the run is recorded and every 10
seconds while it runs outside a transaction; a failure to write it never fails the run. Logs older than 30 days are
deleted by `run_due`, once a pass. It is a table of its own, one row per FetchRun, so listing runs never reads it.

**An index.** `FetchRun (job, started_at DESC)` (`fetchrun_job_started_idx`), so each job's last ten runs are one
short index scan (a `LATERAL` query for all jobs at once), however long the run history grows. This amends ADR
0028's "no index is added".

**A little JavaScript and two dependencies,** amending ADR 0028's "no JavaScript and no new dependency": a few lines
in `base.html` reload the Dashboard, Runs and a running run's page every 30 seconds while the tab is visible (off
with a button, remembered per browser); Docs pages load Mermaid from a pinned version on jsDelivr
(`mermaid@11.4.1`), staff-only pages where a CDN is acceptable, falling back to the code block. Markdown is rendered
with `markdown` (Python-Markdown) and sanitized with `nh3` (an allow-list of tags and attributes), both added to
`pyproject.toml`. No front-end framework and no build step.

## Consequences

- The owner opens one screen and reads one line; what failed is one click from its log, its counts and its
  traceback, and from Retry.
- A run's log survives the worker's terminal and Heroku's log buffer for 30 days. Its size is bounded per run
  (200 KB) and in time (30 days); on staging's runs (about 150 a day, most a few lines) that is a few megabytes. If a
  job logs much more, its cap or `KEEP_DAYS` is where to look.
- Jobs log little today beyond the fetcher's requests and the runner's lines; a job that wants its log to say more
  uses `logging.getLogger(__name__).info(…)`, which now lands in the run's page.
- The fetcher's request lines also reach Heroku's log at INFO (hosted `LOG_LEVEL`); they carry no query string.
- What was dropped (the Changes feed with its batches and daily counts, the pipeline and the waves tables, branch
  proposals, agents' throughput) is still in `manage.py digest`, `waves status`, `facts report`, `branches list` and
  the admin. If the owner misses one, it comes back as a card, not a page.
- The Docs page reads `docs/` from the deployed code, so the manual and the guide on `/ops/docs/` are the versions
  that were deployed.
