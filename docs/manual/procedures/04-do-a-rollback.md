# 04. Do a rollback

Purpose: This procedure tells how to give readers an earlier release again, and how to correct the content after that.

A rollback writes only the pointer `releases/latest.json`. It does not delete a release, and it does not change the
database.

## Before you start

- You know the version that readers must get. The releases page of the console and the admin list each release.
- You have a staff user with the permission `ops_operator`, or the Heroku CLI.

## Procedure with the console

1. Open the releases page of the console, `https://data.humanitributary.com/ops/releases/`.
   Make sure that you can see the release that is live now.
2. Find the earlier release that readers must get.
   Make sure that its change totals agree with what you expect.
3. Start the rollback action for that release, and type a reason.
   Make sure that the confirmation page says that the hash of its snapshot agrees.
4. Wait until the action status is `done`.
   Make sure that the releases page shows the pointer on that version.
5. Wait one minute, and then get the headers of the public page:

   ```bash
   curl -sI https://humanitributary.com/ | grep -i x-release
   ```

   Make sure that `X-Release` names the earlier version.

## Procedure with the command line

1. Write the pointer:

   ```bash
   heroku run python manage.py publish --rollback <version> --actor human:<your user name> -a humanitributary-staging
   ```

   Make sure that the command gives no error.
2. Wait one minute, and then get the headers of the public page as in step 5 above.
   Make sure that `X-Release` names the earlier version.

## Correct the content after a rollback

1. Find the rows that caused the problem on the console changes page.
   Make sure that you know the old value of each row from its `Revision`.
2. Write an edit file that corrects the rows, or use `manage.py branches revert <id>` for a branch operation.
   Make sure that the dry run of the correction shows the correct values.
3. Apply the correction with procedure [02](02-review-drafts-and-apply-an-edit-file.md), steps 7 to 11.
   Make sure that the last line says `applied as human:owner`.
4. Publish a new release with procedure [03](03-publish-a-release.md).
   Make sure that `X-Release` names the new version.

> **CAUTION:** If you do not correct the rows, the next publish puts the bad content back. The next publish compares
> the database with the newest `Release` row, not with the pointer.

> **NOTE:** If the content and the page did not change since the newest release, `publish` stops. It says
> `Unchanged since <version> (content and page)`. The pointer then stays on the earlier version.

> **NOTE:** The rollback refuses a version that has no `Release` row. It also refuses a version whose snapshot is
> not in the bucket or does not agree with its hash.
