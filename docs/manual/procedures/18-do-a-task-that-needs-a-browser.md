# 18. Do a task that needs a browser

Purpose: This procedure tells how to do a task that an agent released because only a browser can read a page that it
needs.

An agent never reads a page with a script if the source policy refuses it (ADR 0042). Before each script read, the
agent asks the API: `GET /api/agent/policy?url=<url>`. For a `browser_only` or `citation_only` site, an unrated site
or a site that blocks AI crawlers, the answer is `may_fetch: false`. A cloud agent has no browser. If the agent
cannot do the task with a different source, it releases the task with `needs: browser`.

Such a task stays in the queue, but no agent gets it again until you decide (ADR 0046). The summary of the round
lists it on the line "Needs the owner". The console shows it on the tab Deferred.

> **NOTE:** For a `verify_claim`, `fill_gap` or `write_event` task, do procedure
> [19](19-review-the-items-that-need-a-person.md) on the Review page instead. This procedure is for the other kinds.

## Before you start

- You have a staff user with the permission `ops_operator`.
- You have a browser. You read the page in your own browser. No Claude session reads it for you.

## Procedure

1. Read the line "Needs the owner" in the summary of the round.
   Make sure that you have the number of each task.
2. Open the Work page of the console, `https://data.manyages.com/ops/work/`. Click the kind of the task.
   Make sure that the page of the kind opens.
3. Click the tab Deferred.
   Make sure that the task shows "needs browser", the URL, the reason and "not before".
4. Open the page of the task.
   Make sure that the field Needs shows the same URL and the agent.
5. Open the URL in your browser. Read the page.
   Make sure that the page supports the claim, or that it does not.
6. Find a page that agents can read and that says the same thing.
   Make sure that `GET policy` gives `may_fetch: true` for that page.
7. If the task is necessary, click Requeue on the page of the task. Type the URL of that page as the reason.
   Make sure that the confirmation page shows the task with its time "not before".
8. Confirm the requeue.
   Make sure that the task has the status `queued` and that the field Not before is empty.
9. Examine the page of the task again after the next round.
   Make sure that the task has the status `done`.

> **NOTE:** The agent sees your reason in the notes of the task. If it releases the task again, do this procedure
> again, or cancel the task.

## If the task is not necessary

1. On the page of the task, click Cancel. Type a reason.
   Make sure that the confirmation page shows the task.
2. Confirm the cancel.
   Make sure that the task has the status `cancelled`.

> **NOTE:** If you do nothing, the task stays on the tab Deferred. No agent gets it.

> **NOTE:** A release with `needs: owner` tells you that the task needs your decision, not a browser. Read the
> reason. Then requeue or cancel the task in the same way.

> **NOTE:** Requeue clears the time "not before" and the field Needs. Then the next agent that asks gets the task.
