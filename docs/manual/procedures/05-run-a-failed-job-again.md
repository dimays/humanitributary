# 05. Run a failed job again

Purpose: This procedure tells how to find why a job failed and how to run it again safely. It also tells how to
remove a failed run from the Dashboard without a new run.

A failed job does not stop the other jobs. The job runs again at its next interval. If you need the job to run before that
time, use this procedure.

## Before you start

- You have a staff user with the permission `ops_operator`, or the Heroku CLI.
- You read the row of the job in [jobs.md](../jobs.md).

## Procedure

1. Open the Runs page of the console, `https://data.humanitributary.com/ops/runs/`, and filter by the state
   Failed.
   Make sure that you know the name of the job and, for a feed job, the name of the feed.
2. On the Dashboard, put the pointer on the red bar of the run.
   Make sure that the card shows the state Failed, the trigger and the first line of the error.
3. Open the newest failed run. Read its error and its log.
   Make sure that you know the cause. The [troubleshooting](../troubleshooting.md) table gives the usual causes.
4. If the error says that the source policy refused the request, do not run the job again.
   Make sure that you correct the feed or the URL first.
5. If the job is `link_health` or `second_source`, find the start time of its last run.
   Make sure that one day has passed since that time.
6. Start the retry action on the failed run in the console, and type a reason.
   Make sure that the page of the new action opens.
7. Open the Dashboard.
   Make sure that the row of the run in "Needs attention" shows `Retry queued` and a link to the action.
8. Wait until the worker starts the retry.
   Make sure that the row shows `Retrying` and a link to the new run.
9. Wait until the action status is `done`.
   Make sure that the result names a new run with the status `ok` or `partial`.
   Make sure that the row is not in "Needs attention".
   Make sure that the card of the new run shows the trigger Retry and the attempt number.
10. If the new run fails again, pause the job with procedure [06](06-pause-and-resume-a-job.md).
   Make sure that "Needs attention" shows only the new failed run.
   Make sure that the console shows the job as paused.
11. Correct the cause in the code with procedure [11](11-deploy-a-code-change.md).
   Make sure that CI passes on the correction.
12. Resume the job with procedure [06](06-pause-and-resume-a-job.md).
   Make sure that its next run has the status `ok`.

## Dismiss a failed run

Some failed runs need no new run. For example, the source stopped for one hour, and the next scheduled run is
sufficient. Dismiss removes the run from "Needs attention" and from the problems at the top of the Dashboard. The
run stays in the run history. `/healthz` shows the job with the state `dismissed`, not `failing`.

> **CAUTION:** Dismiss does not repair the job. If the job fails again, its next failed run shows in "Needs
> attention" again. If you know that the job continues to fail, pause it with procedure
> [06](06-pause-and-resume-a-job.md).

1. Do steps 1 to 3 of the procedure above.
   Make sure that you know the cause of the failure.
2. On the Dashboard, in "Needs attention", click Dismiss on the row of the run.
   Make sure that the confirmation page shows the run, the error and the number of failures in a row.
3. Type the reason, and then confirm.
   Make sure that the page of the new action shows the status `done`.
4. Open the Dashboard.
   Make sure that the run is not in "Needs attention".
5. Open the page of the run.
   Make sure that the page shows "Dismissed", your user name and a link to the action.

> **NOTE:** The console refuses Dismiss when a retry of the run waits for the worker or runs now. Wait for the
> result of the retry. You can also withdraw the retry on its action page. The console also refuses Dismiss for a run that is
> not the last run of its job and feed.

## The command line

To run a job from the command line, use `manage.py run_job`. It runs the job now. It also runs a job that an operator paused:

```bash
heroku run python manage.py run_job <name> -a humanitributary-staging
heroku run python manage.py run_job <name> --feed "<feed name>" -a humanitributary-staging
```

Make sure that the last line of the output for each run says `ok` or `partial`.

> **NOTE:** The card of a run also opens when you move the focus to its bar with the Tab key. On a touch screen,
> tap the bar one time to see the card. Tap it again to open the run.

> **NOTE:** If the worker is in a job, `run_job` prints `another run_jobs holds the lock; exiting`. Wait some
> minutes and then do the command again. The console action does not have this problem, because the worker runs it
> between jobs.

> **NOTE:** The console refuses a feed that it fetched in the last 60 minutes (`FEED_COOLDOWN_MINUTES`). It also
> refuses `link_health` and `second_source` within one day of their last run.
