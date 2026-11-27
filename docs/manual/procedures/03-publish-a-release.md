# 03. Publish a release

Purpose: This procedure tells how to make a new release, so that readers get the approved content.

A release holds the entries that have the status `published`. `manage.py publish` does the release gates first. If a
gate fails, it writes nothing.

## Before you start

- You applied the edit file of the round (procedure [02](02-review-drafts-and-apply-an-edit-file.md)).
- You have a staff user with the permission `ops_operator`, or the Heroku CLI.
- The `worker` dyno runs. The console publish actions run in the worker.

## Procedure with the console

1. Open the releases page of the console, `https://data.humanitributary.com/ops/releases/`.
   Make sure that the page shows which release the pointer names now.
2. Start the publish check (`publish_check`).
   Make sure that the page of the new action opens.
3. Wait until the action status is `done`.
   Make sure that each release gate passes: deterministic, build, contested and report.
4. Read the change report of the check: added, changed and retracted entries for each branch.
   Make sure that the numbers agree with the edit file.
5. If the check says that the content and the page did not change, stop here.
   Make sure that you do not need a release.
6. Start the publish action (`publish`) from the finished check, and type a reason.
   Make sure that the check is 30 minutes old or less.
7. Wait until the action status is `done`.
   Make sure that the result names a new version, in the form `YYYY.MM.DD.N`.
8. Wait one minute, and then get the headers of the public page:

   ```bash
   curl -sI https://humanitributary.com/ | grep -i x-release
   ```

   Make sure that `X-Release` names the new version.

## Procedure with the command line

1. Do the release gates and see the change report. This command writes nothing:

   ```bash
   heroku run python manage.py publish --check -a humanitributary-staging
   ```

   Make sure that the output says `Every release gate passes`.
2. Read the totals of the change report.
   Make sure that the numbers agree with the edit file.
3. Publish the release:

   ```bash
   heroku run python manage.py publish --notes "<what this release adds>" --actor human:<your user name> -a humanitributary-staging
   ```

   Make sure that the output names a new version.
4. Wait one minute, and then get the headers of the public page as in step 8 of the console procedure.
   Make sure that `X-Release` names the new version.

> **NOTE:** The `web` dyno reads the pointer at most once a minute. A browser can keep the page for 5 minutes
> (`PAGE_MAX_AGE`). If you do not see the change, load the page again after 5 minutes.

> **NOTE:** If the output says `Unchanged since <version> (content and page)`, no entry and no page input changed.
> See [troubleshooting](../troubleshooting.md).

> **CAUTION:** If a file that changes the page is not in `PAGE_INPUTS`, you can use `--force`. Do not use it for other
> reasons. A forced release is a new
> version with the same content.

## If a gate fails

| Gate | Usual cause | Action |
|---|---|---|
| `deterministic` | Two exports of the same rows are different. This is a code fault. | Do not publish. Examine the first line that is different, and correct the code. |
| `build` | Node is not on the dyno, or the site build refuses an entry. | Read the lines that start with `✗`. Correct the row, and do the check again. |
| `contested` | A published entry has a contested claim, and its text does not say that the sources differ. | Edit the text of the entry, or resolve the conflict with an edit file. |
| `report` | The system cannot write the change report to the `releases` bucket. | Examine `/healthz`. Make sure that the `releases` store answers. |
