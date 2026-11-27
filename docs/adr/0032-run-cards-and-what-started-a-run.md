# 0032 — Each run records what started it, and the console shows a card per run on hover

**Status:** accepted (November 2026); amends [0031](0031-a-simpler-console-and-run-logs.md) (the run graph's and the history strips' tooltips, and the console's script)

## Context

The Dashboard's run graph and the Jobs pages' ten-run strips had the browser's own tooltip on each bar and square:
one line ("process · 14:03 · Completed · 12.3 s"), shown after about a second, plain, and absent on touch screens.
The owner asked for more when pointing at a run: what started it, whether it was slow for that job, where its time
went (waiting or running, and for a retry the failed attempts before it), its numbers and its error, at a glance
and quickly.

Two of those facts were never recorded. A FetchRun did not say whether the scheduler started it or an operator did
("Run now" and "Retry" from the console, ADR 0028, or `manage.py run_job`); the only link was the OpsAction's
`result["runs"]` list. And nothing kept when a run became due, so the time a run waited (the worker busy with other
jobs, or a tick away) could not be told from the time it ran. An OpsAction already has its request time
(`created_at`) and the worker's pick-up time (`started_at`).

The Dashboard shows about 200 runs a day in production and reloads every 30 seconds, so a request per hover (or per
card) would be slow on the move from bar to bar, and a card that fetched would flash empty first.

## Decision

**Record what started a run** (`ingest/models.py` `FetchRun`, migration `ingest` 0007):

- `trigger`: `schedule` (the scheduler: `ingest/jobs.py` `run_due`), `manual` ("Run now", or `run_job` from the
  shell) or `retry` ("Retry" on a failed run); `triggered_by` ("human:<username>", "shell", or empty for the
  scheduler); `ops_action`, the OpsAction's id, as a plain integer (no foreign key: `ingest` does not depend on the
  console); `retry_of`, the failed run a retry retries, and `attempt` (1, or one more than that run's).
- `scheduled_for`: when the scheduler found the run due: a plain job's last start plus its interval, a feed job's
  `next_run_at` (`jobs.due_at`). Empty for a console or shell run, for a job's first run and for older runs.
- `opsconsole/actions.py` `execute_job` passes the action, who asked and the retried run to `run_named`;
  `run_named` defaults to `manual` by "shell"; `run_one` takes all of it.
- Migration `opsconsole` 0002 backfills from the audit rows: runs listed in a `run_job` or `retry_run` action's
  `result["runs"]` become `manual` or `retry` with the action's id, who asked, and for a retry the retried run and
  the attempt. Every other existing run stays `schedule`. Nothing is guessed: older runs have no `scheduled_for`,
  and the card says "not recorded".

**Show a card per run** (`opsconsole/queries.py` `run_cards`, `templates/opsconsole/_run_cards.html`): hovering a
run's bar on the Dashboard or its square in a history strip (Jobs, a job's page) shows, after 80 ms, a card with:
the job and its tags, the state badge, the trigger (Scheduled, Manual or Retry, by whom, the action and the retried
run); the runtime beside the job's usual one (the median and p90 of its last 30 completed runs) with "2.1× usual"
in amber when it took at least 1.5 times the median and more than the p90 (`SLOW_RATIO`; no comparison below 5
completed runs); one bar of its stages (for a retry each earlier attempt in red and the gap before the next, then
the wait in gray, then the run in its state's color), each with its duration; the start, finish, due or request
times in the browser's time zone; up to four counts, the requests made, the error's first line (masked), the
attempt; and a link to the run.

- **One query, embedded.** `RUN_CARDS_SQL` reads the visible runs, their feeds, the actions that started them, each
  job's usual runtime (`percentile_cont` over a `LATERAL` scan of the `(job, started_at DESC)` index) and each
  retry's earlier attempts (a recursive CTE on `retry_of`, at most 3) in one statement. The view embeds the result
  with `json_script` (no spaces), and the script draws cards from it: no request per hover. Pages gain one query
  each (Dashboard 18 to 19, Jobs 8 to 9, a job's page 10 to 11, on the seeded data), and the run graph's JSON is
  about 270 bytes a run (about 54 KB for a day of 200 runs).
- **Accessible.** Each bar and square keeps a link and an `aria-label` in words; the card has `role="tooltip"`, the
  focused or hovered element points at it with `aria-describedby`; it opens on keyboard focus, stays while the
  pointer is on it, and closes with Escape. On a touch screen the first tap shows the card and a second opens the
  run. The card is placed below, above or beside its run to stay on screen. The browser's own `title` tooltip is
  gone from these elements, so two tooltips never show.
- The auto-refresh waits while a card is open.

## Consequences

- An operator sees at a glance whether a run was slow for its job, whether it waited for the worker or ran long, and
  how a retry went, without opening the run.
- The run graph and strips depend on a script for their detail; without it, each bar is still a link with a
  spoken label. The script is about 140 lines of plain JavaScript in the template, no library, no build step.
- `scheduled_for` makes the wait honest only from this change on; older runs show "not recorded" until they leave
  the 24-hour window and the ten-run strips.
- The page carries every visible run's card. If a page ever shows thousands of runs, fetch the JSON once on the
  first hover instead (the shape stays the same).
- A run's usual runtime is the job's, across its feeds; a feed that is always slower shows as "usual" for the job
  only when it is most of the runs.
