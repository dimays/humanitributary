# 0039 — A failed run follows its retry in Needs attention, and an operator can dismiss it

**Status:** proposed (November 2026; the owner asked for retried runs to update themselves and for a Dismiss button); amends [0028](0028-operations-console.md) (a new action, `dismiss_run`, and what "needs attention" lists); amends [0019](0019-processes-and-release-gates.md) (`/healthz` judges each feed's last run and has a `dismissed` state)

## Context

The Dashboard's "Needs attention" card lists each job's (each feed's) last finished run when it failed, with Retry.
Two things were wrong with it in use:

- **A retried run looked untouched.** Once an operator retried a run, the row stayed exactly as it was, with its
  Retry button, until the retry's run finished: the card reads finished runs only. A second click on Retry was
  refused ("already queued"), and nothing on the card said that a retry was on its way.
- **There was no way to take a failure off the card without running the job.** Some failures need no retry: the
  source was down for an hour and the next scheduled run will do, or the cause is known and a fix is being deployed.
  The only ways to clear the row were Retry (which spends the source's requests, and for a feed is refused within
  an hour of its last fetch) or Pause (which stops the schedule too). So the card kept rows that nobody needed to act
  on, and the real ones were harder to see.

`/healthz` had its own rule too: a job was failing when its newest finished run, across all its feeds, failed. A
feed job whose other feed failed earlier was "ok" there and failing on the card.

## Decision

**A failed run being retried shows its retry.** `opsconsole.queries.recoveries()` finds, for each failed run on the
card, a run of the same job and feed that started after it and is running now (Retrying, with that run and the
action that started it; a scheduled run counts too), or else a console retry of the run, or a console run of its job
that covers its feed, waiting for the worker (Retry queued) or just taken by it (Retrying), with the action. The row
then shows that state and those links instead of Retry and Dismiss. Nothing new is stored: the card still lists each
feed's last finished run, so a retry that completes takes the row off, and one that fails is the new last run and
replaces the old row. A failing job being retried is still a problem until the retry completes; the problems line
says "Retry queued" or "Retrying".

**Dismiss is an action like the others.** `dismiss_run` (`OpsAction.Kind.DISMISS_RUN`, migration
`opsconsole/0005_dismissed_runs`) needs `ops_operator`, shows a confirmation page (the run, its first error line, how
many times in a row the job failed, what dismissing does and does not do, and a warning at two failures or more that
pausing may be the right action), takes a required reason, and leaves an `OpsAction` row with the reason. It runs in
the request, in one transaction. It is refused for a run that is not failed, one already dismissed, one that is no
longer its job and feed's last finished run, and one being retried (the retry's result decides); the request checks
again under a row lock, so a retry asked for after the confirmation page was shown still wins.

**The mark is on the run.** A dismissal stamps the `FetchRun` with `dismissed_at`, `dismissed_by` and
`dismiss_action` (the OpsAction's id, no foreign key, like `ops_action`; migration `ingest/0009_dismissed_runs`).
Deriving it from the OpsAction rows alone would have kept one record, but then `/healthz` (in `infra`) and the
Runs page would have to read the console's table, and `ingest` is kept free of the console. The run stays failed, in
the history and on the Runs page, marked Dismissed, and its page names who dismissed it and links to the action.

**What a dismissal changes, and what it does not.**

- Needs attention leaves the run out, for good: only a newer run can replace it, and a newer failed run is shown.
- The problems line and the job's `failures` and `alerting` leave out a feed whose last run is a dismissed failure.
  The job's page lists the dismissal apart.
- `/healthz` judges a job by each feed's last finished run, as the card does. A job is `failing` when one of them
  failed and was not dismissed, `dismissed` when every one that failed was dismissed (with the run, who and when; the
  count is kept), and only failing jobs are in `failing_jobs`. A new list, `dismissed_jobs`, sits beside
  `paused_jobs`.
- Failure counts stay true. `consecutive_failures` and the alert count every failed run in a row, dismissed or
  not: a dismissal says "seen", not "fixed". So a job that fails again after a dismissal shows, for example, "failed
  3 runs in a row", and alerts on the third failure as before.
- There is no undo. A dismissal is a record of what an operator decided; the next run, or the next failure, moves on
  from it.

## Consequences

- The card says what is happening to each row, and every row on it is one an operator still has to act on.
- One more action kind, two migrations and three nullable columns on `FetchRun`; the Dashboard makes one more query
  (the running runs) when anything is failing.
- `/healthz` can now say `failing` for a feed job whose newest run completed but whose other feed's last run failed.
  That is what the card always showed; an uptime check reading `failing_jobs` sees it too.
- A dismissed failure can hide a job that keeps failing until its next run. The confirmation warns at two failures in
  a row, and pausing stays the action for a job that will keep failing.
