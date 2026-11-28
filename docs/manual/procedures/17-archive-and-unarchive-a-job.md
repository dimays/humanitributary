# 17. Archive and unarchive a job

Purpose: This procedure tells how to retire a job that the system does not need now, and how to bring it back.

An archived job does not run. The scheduler skips it, and the console does not offer "Run now" for it. The command
`manage.py run_job` refuses it too.

An archived job is not on the Jobs page, the Dashboard or the Work page. It is not in `/healthz`. Its runs stay on
the Runs page and in the database. The page "Archived jobs" lists it.

Archive a job when it must stop for a long time, for example when its source closes. To stop a job for a short
time, pause it ([procedure 06](06-pause-and-resume-a-job.md)).

## Before you start

- You have a staff user with the permission `ops_operator`.
- You know the exact name of the job, for example `gazette`.
- You know why the job must stop.

## Archive a job

1. Open the page of the job, `https://data.manyages.com/ops/jobs/<name>/`.
   Make sure that the page shows the name of the job at the top.
2. Click "Archive…".
   Make sure that a dialog with the title "Archive <name>" opens.
3. Read the list of consequences in the dialog.
   Make sure that you agree with each consequence.
4. Type the exact name of the job in the box.
   Make sure that the button "Archive this job" becomes available.
5. Type a reason.
   Make sure that the reason tells why the job must stop.
6. Click "Archive this job".
   Make sure that the action page shows the status "Completed".
7. Open the Jobs page of the console.
   Make sure that the job is not in the list.
8. Open the page "Archived jobs", `https://data.manyages.com/ops/jobs/archived/`.
   Make sure that the job is in the list, with your name and your reason.
9. Show the job registry from the command line:

   ```bash
   heroku run python manage.py run_jobs --list -a humanitributary-staging
   ```

   Make sure that the job shows as archived.

> **NOTE:** If the job does not have a pause, the archive pauses it first. If the job has a pause, the archive keeps it.

> **NOTE:** If a run of the job is in progress, the run stops at its next request to a source. The Runs page
> then shows the run as "Cancelled", with the reason. A stopped run is not a failure, and it sends no alert.

> **NOTE:** The archive withdraws each run that the console queued for the worker and that did not start.
> The action page of that run shows the status "Cancelled".

> **CAUTION:** A stopped run does not finish its work. Its open database transaction rolls back. The work that it
> saved before the stop stays.

## Unarchive a job

1. Open the page "Archived jobs" of the console.
   Make sure that the job is in the list.
2. Start the Unarchive action on the row of the job, and type a reason.
   Make sure that the action page shows the status "Completed".
3. Open the Jobs page of the console, and filter by the tag `paused`.
   Make sure that the job is in the list.
4. When the job must run again, resume it ([procedure 06](06-pause-and-resume-a-job.md)).
   Make sure that the job does not have the tag `paused`.

> **NOTE:** An unarchived job keeps its pause. It does not run until you resume it. Thus you can examine it first.

> **NOTE:** If you type the name incorrectly, the console refuses the action and changes nothing. The server
> examines the name too, not only the browser.
