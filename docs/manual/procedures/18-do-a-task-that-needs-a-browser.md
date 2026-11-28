# 18. Do a task that needs a browser

Purpose: This procedure tells how to do a task that an agent released because only a browser can read a page that it
needs.

An agent never reads a page with a script if the source policy refuses it (ADR 0042). Before each script read, the
agent asks the API: `GET /api/agent/policy?url=<url>`. For a `browser_only` or `citation_only` site, an unrated site
or a site that blocks AI crawlers, the answer is `may_fetch: false`. A cloud agent has no browser. If the agent
cannot do the task with a different source, it releases the task with `needs: browser`.

Such a task stays in the queue, but agents do not get it for 7 days. The summary of the round lists it on the line
"Needs the owner". The console shows it on the tab Deferred.

## Before you start

- You have a staff user with the permission `ops_operator`.
- You have a browser, or a local Claude Code session with the in-app browser.

## Procedure

1. Read the line "Needs the owner" in the summary of the round.
   Make sure that you have the number of each task.
2. Open the Work page of the console, `https://data.humanitributary.com/ops/work/`. Click the kind of the task.
   Make sure that the page of the kind opens.
3. Click the tab Deferred.
   Make sure that the task shows "needs browser", the URL, the reason and "not before".
4. Open the page of the task.
   Make sure that the field Needs shows the same URL and the agent.
5. Open the URL in your browser. Read the page.
   Make sure that the page supports the claim, or that it does not.
6. If the task is necessary, click Requeue on the page of the task. Type a reason, for example "read in a browser".
   Make sure that the confirmation page shows the task with its time "not before".
7. Confirm the requeue.
   Make sure that the task has the status `queued` and that the field Not before is empty.
8. Start a local Claude Code session in the repository. Tell it to work the task kind with its skill and its in-app
   browser, as procedure [01](01-run-a-round-by-hand.md) tells.
   Make sure that the session uses one browser tab and marks the page `"method": "browser_read"`.
9. Examine the page of the task again after the session.
   Make sure that the task has the status `done`.

> **NOTE:** An agent claims the best task of its kind. Thus the local session can do other tasks before this task.
> Also, a cloud agent can claim the task first. If it releases the task again, do this procedure again.

## If the task is not necessary

1. On the page of the task, click Cancel. Type a reason.
   Make sure that the confirmation page shows the task.
2. Confirm the cancel.
   Make sure that the task has the status `cancelled`.

> **NOTE:** If you do nothing, an agent gets the task again after 7 days. A cloud agent usually releases it again.

> **NOTE:** A release with `needs: owner` tells you that the task needs your decision, not a browser. Read the
> reason. Then requeue or cancel the task in the same way.

> **NOTE:** Requeue clears the time "not before" and the field Needs. Then the next agent that asks gets the task.
