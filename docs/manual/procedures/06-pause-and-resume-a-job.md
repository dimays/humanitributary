# 06. Pause and resume a job

Purpose: This procedure tells how to stop the schedule of one job for a time, and how to start it again.

A paused job is never due. The worker and all other runners skip it. The list of paused jobs is in the `JobState`
row "paused_jobs", with who paused each job, when and why.

## Before you start

- You have a staff user with the permission `ops_operator`.
- You know why the job must stop, for example a job that fails at each run.

## Pause a job

1. Open the overview page of the console, `https://data.humanitributary.com/ops/`.
   Make sure that you can see the row of the job.
2. Start the pause action on the row of the job, and type a reason.
   Make sure that the reason tells why the job must stop.
3. Examine the table of paused jobs on the overview page.
   Make sure that the table shows the job, your name and your reason.
4. Show the job registry from the command line:

   ```bash
   heroku run python manage.py run_jobs --list -a humanitributary-staging
   ```

   Make sure that the job shows as paused.

## Resume a job

1. Open the overview page of the console.
   Make sure that the job is in the table of paused jobs.
2. Start the resume action on the job, and type a reason.
   Make sure that the job is not in the table of paused jobs.
3. Wait for the next due time of the job.
   Make sure that its next run has the status `ok` or `partial`.

> **NOTE:** A run that is in progress when you pause the job continues to its end. The pause stops the next runs.

> **NOTE:** `manage.py run_job <name>` runs a paused job all the same. The owner chose the job by name.

> **NOTE:** To stop one feed of a feed job and not the other feeds, clear `enabled` on the `Feed` row in the admin.
> Put the reason in `config["disabled_reason"]`.
