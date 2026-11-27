# 10. Restore the database from a backup

Purpose: This procedure tells how to replace the hosted database with a Heroku backup, and how to make the system consistent after that.

Heroku Postgres makes a backup each day at 03:00 Chicago time. A restore replaces all tables, the schema and the data
together.

> **WARNING:** A restore deletes each row that the system wrote after the backup. This includes agent drafts, edits,
> `Revision` rows, tasks, job runs, console actions and agent tokens. If the data in the database now is not worse than the data
> in the backup, do not restore.

## Before you start

- You have the Heroku CLI, and it has access to the app `humanitributary-staging`.
- No agent session runs. Tell each agent to stop before you start.

## Procedure

1. Show the backups:

   ```bash
   heroku pg:backups -a humanitributary-staging
   ```

   Make sure that you know the id and the time of the backup that you need.
2. Make a backup of the database as it is now:

   ```bash
   heroku pg:backups:capture -a humanitributary-staging
   ```

   Make sure that the command says that the backup is complete. With this backup, you can return to the current state.
3. Stop the worker:

   ```bash
   heroku ps:scale worker=0 -a humanitributary-staging
   ```

   Make sure that `heroku ps -a humanitributary-staging` shows no `worker` dyno.
4. Restore the backup:

   ```bash
   heroku pg:backups:restore <backup id> DATABASE_URL -a humanitributary-staging
   ```

   Make sure that the command says that the restore is complete.
5. Get the health of the system:

   ```bash
   curl -s https://data.humanitributary.com/healthz
   ```

   Make sure that `"ok"` is `true`.
6. Show the release pointer:

   ```bash
   heroku run python manage.py storage status -a humanitributary-staging
   ```

   Make sure that you know the version that the pointer names.
7. Open the list of releases in the admin.
   Make sure that the version of the pointer has a `Release` row.
8. If the version of the pointer has no `Release` row, do a rollback to the newest version in the list.
   Use procedure [04](04-do-a-rollback.md).
   Make sure that the pointer names a version that has a row.
9. Start the worker:

   ```bash
   heroku ps:scale worker=1 -a humanitributary-staging
   ```

   Make sure that `heroku ps` shows the `worker` dyno as `up`.
10. Open the Dashboard of the console after 15 minutes.
    Make sure that the jobs run and no job fails.
11. Show the agent tokens with `manage.py agent_token list`.
    Make sure that each agent has a token. If not, make one with procedure [09](09-replace-an-agent-token.md).

> **CAUTION:** Do not restore while the worker runs. A job can write rows into the database during the restore.

> **NOTE:** The restore does not change the S3 buckets. The release files and the raw documents stay. The next
> publish skips each version number that already has files in the `releases` bucket.

> **NOTE:** `heroku pg:backups:restore` asks you to type the name of the app. This makes sure that you restore the
> correct app.
