# 05. Run a failed job again

Purpose: This procedure tells how to find why a job failed and how to run it again safely.

A failed job does not stop the other jobs. The job runs again at its next interval. If you need the job to run before that
time, use this procedure.

## Before you start

- You have a staff user with the permission `ops_operator`, or the Heroku CLI.
- You read the row of the job in [jobs.md](../jobs.md).

## Procedure

1. Open the job runs page of the console, `https://data.humanitributary.com/ops/runs/`, and filter by the status
   `failed`.
   Make sure that you know the name of the job and, for a feed job, the name of the feed.
2. Read the error of the newest failed run.
   Make sure that you know the cause. The [troubleshooting](../troubleshooting.md) table gives the usual causes.
3. If the error says that the source policy refused the request, do not run the job again.
   Make sure that you correct the feed or the URL first.
4. If the job is `link_health` or `second_source`, find the start time of its last run.
   Make sure that one day has passed since that time.
5. Start the retry action on the failed run in the console, and type a reason.
   Make sure that the page of the new action opens.
6. Wait until the action status is `done`.
   Make sure that the result names a new run with the status `ok` or `partial`.
7. If the new run fails again, pause the job with procedure [06](06-pause-and-resume-a-job.md).
   Make sure that the console shows the job as paused.
8. Correct the cause in the code with procedure [11](11-deploy-a-code-change.md).
   Make sure that CI passes on the correction.
9. Resume the job with procedure [06](06-pause-and-resume-a-job.md).
   Make sure that its next run has the status `ok`.

## The command line

To run a job from the command line, use `manage.py run_job`. It runs the job now. It also runs a job that an operator paused:

```bash
heroku run python manage.py run_job <name> -a humanitributary-staging
heroku run python manage.py run_job <name> --feed "<feed name>" -a humanitributary-staging
```

Make sure that the last line of the output for each run says `ok` or `partial`.

> **NOTE:** If the worker is in a job, `run_job` prints `another run_jobs holds the lock; exiting`. Wait some
> minutes and then do the command again. The console action does not have this problem, because the worker runs it
> between jobs.

> **NOTE:** The console refuses a feed that it fetched in the last 60 minutes (`FEED_COOLDOWN_MINUTES`). It also
> refuses `link_health` and `second_source` within one day of their last run.
