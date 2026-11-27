# 06. Pause and resume a job

Purpose: This procedure tells how to stop the schedule of one job for a time, and how to start it again.

A paused job is never due. The worker and all other runners skip it. The list of paused jobs is in the `JobState`
row "paused_jobs", with who paused each job, when and why.

A paused job is not a problem. The Dashboard and `/healthz` show it as paused. They do not count its failures, and it sends no alert.

## Before you start

- You have a staff user with the permission `ops_operator`.
- You know why the job must stop, for example a job that fails at each run.

## Pause a job

1. Open the Jobs page of the console, `https://data.humanitributary.com/ops/jobs/`.
   Make sure that you can see the row of the job.
2. Start the Pause action on the row of the job, and type a reason.
   Make sure that the reason tells why the job must stop.
3. Open the page of the job.
   Make sure that the page shows the job as paused, with your name and your reason.
4. Show the job registry from the command line:

   ```bash
   heroku run python manage.py run_jobs --list -a humanitributary-staging
   ```

   Make sure that the job shows as paused.
5. Open the Dashboard of the console.
   Make sure that the job has an amber "Paused" badge, and that the count of problems does not include it.

## Resume a job

1. Open the Jobs page of the console, and filter by the tag `paused`.
   Make sure that the job is in the list.
2. Start the Resume action on the job, and type a reason.
   Make sure that the job does not have the tag `paused`.
3. Wait for the next due time of the job.
   Make sure that its next run has the status `ok` or `partial`.

> **NOTE:** When you resume a job, its failures from before the pause count again. If its next run fails, the
> Dashboard shows a problem, and an alert can come.

> **NOTE:** A run that is in progress when you pause the job continues to its end. The pause stops the next runs.

> **NOTE:** `manage.py run_job <name>` runs a paused job all the same. The owner chose the job by name.

> **NOTE:** To stop one feed of a feed job and not the other feeds, clear `enabled` on the `Feed` row in the admin.
> Put the reason in `config["disabled_reason"]`.
