# 07. Release a stuck task

Purpose: This procedure tells how to put a task back in the queue when its agent stopped and did not release it.

A task is stuck when its status is `claimed` but no agent does the work. The lease ends after `TASK_LEASE_MINUTES`
(30). After that time, another agent can take the task. A release puts the task back in the queue at once.

## Before you start

- You have a staff user with the permission `ops_operator`, or the Heroku CLI.
- You know that the agent that holds the task stopped.

## Procedure with the console

1. Open the Work page of the console, `https://data.humanitributary.com/ops/work/`. Find the task in the list of
   stuck leases.
   Make sure that you can see the task, its holder and the end of its lease.
2. Open the page of the task.
   Make sure that the holder is the agent that stopped.
3. Start the release action on the task, and type a reason.
   Make sure that the confirmation page shows the same holder.
4. If the lease is still live, read the warning on the confirmation page.
   Make sure that the agent does not work on the task now.
5. Confirm the release.
   Make sure that the task status is `queued`.
6. Read the `error` field of the task.
   Make sure that it has a line with your name, the action and your reason.

## Procedure with the command line

The agent command can release a task in the name of its holder:

```bash
heroku run python manage.py tasks release <id> --agent agent:<holder name> --defer-minutes 0 -a humanitributary-staging
```

Make sure that the output shows the task with the status `queued` and `"not_before": null`.

> **NOTE:** A release from the command line or from an agent waits 60 minutes before agents get the task again
> (ADR 0042). The option `--defer-minutes 0` cancels the wait.

## Other actions on a task

| Action | When to use it | What it does |
|---|---|---|
| Extend the lease (`extend_lease`) | The agent still works, but needs more time. | The lease runs 1 to 1,440 minutes from now. If the current end is later, it runs from that end. |
| Requeue (`requeue_tasks`) | A task is `failed`, `cancelled` or deferred, and it must run now. | The task becomes `queued`, with `attempts` 0. The time "not before" and the field Needs become empty. |
| Cancel (`cancel_tasks`) | A `queued` task is not necessary. | The task becomes `cancelled`. The action does not cancel a task with a live lease. |

> **NOTE:** The release from the console keeps the attempt in the count. A release from the command line gives the
> attempt back.

> **NOTE:** If the holder finished or another agent took the task after the page showed it, the console refuses the
> release. Nothing changes.

> **NOTE:** Requeue and cancel take at most 50 tasks at a time (`MAX_BATCH`).
