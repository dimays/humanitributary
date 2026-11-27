# 02. Review the agent drafts and apply an edit file

Purpose: This procedure tells how to get an independent review of the agent drafts and apply its edit file safely.

An edit file is a JSON list of operations: `edit`, `rename`, `approve`, `reject`, `add_evidence`,
`resolve_conflict`, `add_branch`, `add_event` and `add_connection`. `manage.py apply_edits` applies all of them in
one transaction, or none of them.

## Before you start

- You have the list of drafts from procedure [01](01-do-an-agent-round.md).
- You have a checkout of the repository. The folder `var/reviews/` in it is not in git.
- The reviewer is a Claude session that did not write the drafts.

## Procedure

1. Make a token for the reviewer with procedure [09](09-replace-an-agent-token.md).
   Make sure that the token has a name that is different from the names of the writers.
2. Start the reviewer session with the token, as in steps 5 to 8 of procedure [01](01-do-an-agent-round.md).
   Make sure that the reviewer can read `GET /api/agent/entries/<slug>`.
3. Give the reviewer the list of drafts. Tell it to read each cited page itself.
   Make sure that the reviewer knows that it must use GET requests only.
4. Tell the reviewer to write a review and an edit file in `var/reviews/`.
   Make sure that the names have the form `<date>-<name>.md` and `<date>-<name>.edits.json`.
5. Read the review.
   Make sure that each draft has a verdict: APPROVE, APPROVE WITH EDITS, HOLD or REJECT.
6. Read the edit file.
   Make sure that each operation has a `reason`.
7. Validate the edit file on the staging app. The command sends the local file to a one-off dyno:

   ```bash
   F=2026-11-27-round3-news.edits.json   # the name of your edit file
   heroku run --no-tty -a humanitributary-staging "cat > /tmp/$F && python manage.py apply_edits /tmp/$F --validate-only" < var/reviews/$F
   ```

   Make sure that the output says `<n> ops valid`.
8. If the output gives problems, send the problems to the reviewer.
   Make sure that the reviewer gives you a corrected edit file.
9. Do a dry run of the edit file:

   ```bash
   heroku run --no-tty -a humanitributary-staging "cat > /tmp/$F && python manage.py apply_edits /tmp/$F --actor human:owner --dry-run" < var/reviews/$F
   ```

   Make sure that the last line says `dry run, rolled back: nothing written`.
10. Read the diff of the dry run.
    Make sure that each change agrees with the review.
11. Apply the edit file:

    ```bash
    heroku run --no-tty -a humanitributary-staging "cat > /tmp/$F && python manage.py apply_edits /tmp/$F --actor human:owner" < var/reviews/$F
    ```

    Make sure that the last line says `applied as human:owner`.
12. Open the New events page of the console with the state "In review".
    Make sure that no approved draft stays in this list.
13. Open the tab "Rejected & duplicates" on the New events page.
    Make sure that each draft that the review rejected shows the verdict Rejected or Duplicate.
14. If you do not need the token of the reviewer again, revoke it:

    ```bash
    heroku run python manage.py agent_token revoke <reviewer name> -a humanitributary-staging
    ```

    Make sure that the output says `revoked agent:<reviewer name>`.

Then do procedure [03](03-publish-a-release.md).

> **WARNING:** The apply step writes canonical rows. Always do the validation and the dry run first. If one operation
> fails, the command keeps nothing and lists all problems.

> **CAUTION:** Each token can claim the task kinds of its scope. Tell the reviewer to claim no task.

> **NOTE:** The code does not give a way to copy a file to a one-off dyno. The commands above send the file through
> standard input. The file name stays the same, because each `Revision` reason starts with
> `apply_edits <file name>`.

> **NOTE:** An edit file is safe to apply two times. An unchanged edit writes nothing. An entry that an earlier run
> added makes a problem, and the second run then keeps nothing.

## What the operations do

| Operation | What it does |
|---|---|
| `edit` | It changes the fields of an event or the text of a branch. `add_cites` and `remove_cites` change the cited sources. |
| `rename` | It changes the slug of an entry. The history, links and claims stay with the entry. |
| `approve` | It changes the status of an entry from `review` to `published`, under the publication rule. |
| `reject` | It changes the status of a `draft` or `review` entry to `retracted`. |
| `add_evidence` | It records evidence on one claim of the entry. |
| `resolve_conflict` | It changes each `conflicts` evidence row of the entry to `unrelated`, with a record of the reason. |
| `add_branch`, `add_event` | They make a new entry with the status `review`. With `"status": "published"`, they also approve it. |
| `add_connection` | It adds a connection from one entry to another, with a short note. |
