# 19. Review the items that need a person

Purpose: This procedure tells how to read the pages that only a person may read. It also tells how to decide each
item on the Review page.

A `browser_only` page is read by a person, never by an agent (ADR 0046). The Review page holds three kinds of item:

| Kind | What waits | Approve | Deny |
|---|---|---|---|
| Claim | A `verify_claim` task that an agent released with `needs: browser` or `needs: owner` | Records your read as evidence and completes the task | Records that the page does not support the claim |
| Draft | A draft in review that only a `browser_only` or `citation_only` page supports, together with Wikipedia | Publishes the draft with the next release | Retracts the draft |
| Task | A `fill_gap` or `write_event` task that an agent released with `needs: browser` | Gives the task back to the agents with a page that they can read, or with your summary | Cancels the task |

No agent gets an item on this page. The item waits until you decide.

## Before you start

- You have a staff user with the permission `ops_operator`.
- You have a browser. You read each page in your own browser.

## Procedure

1. Open the Review page of the console, `https://data.humanitributary.com/ops/review/`.
   Make sure that the tab "To review" shows the number of items.
2. Click the first item in the list on the left.
   Make sure that the item shows its kind, its text and the list "Read these in your browser".
3. Read the agent's reason or the hold note.
   Make sure that you know which page the agent could not read.
4. Click each link in the list "Read these in your browser".
   Make sure that each page opens in a new tab of your browser.
5. Read each page against the claim or the draft.
   Make sure that you know if the page supports the text.
6. For a claim, select the page that you read.
   Make sure that the round button of that page shows a dot.
7. If the page supports the text, click Approve.
   Make sure that the banner shows "Approve in 5 s" and the button Undo.
8. If the page does not support the text, click Deny.
   Make sure that the banner shows "Deny in 5 s" and the button Undo.
9. If you cannot decide now, click Defer.
   Make sure that the next item opens.
10. Wait 5 seconds after Approve or Deny.
    Make sure that the next item opens and the banner names the action.
11. Do steps 2 to 10 for each item.
    Make sure that the tab "To review" shows 0.

> **NOTE:** You can write a short note before you click. The console records the note as the reason of the
> action. For a claim, you can also copy an excerpt of 25 words or fewer from the page.

> **NOTE:** If you click Undo before the 5 seconds end, the console sends nothing. If you close the page in the
> 5 seconds, the console sends the decision at once.

> **NOTE:** For a claim, select "the page contradicts the claim" before you click Deny if the page says a different
> thing. Then the claim can become contested.

## Approve a task

1. Find a page that agents can read and that says the same thing. Type its URL in the field for the page.
   Make sure that the URL starts with `https://`.
2. If you cannot find such a page, write a summary of the page in the note.
   Make sure that the note says what the page tells.
3. Click Approve.
   Make sure that the next item opens after 5 seconds.

> **NOTE:** The console refuses a page that agents cannot read. Your summary is a lead for the agent, not a source.
> The agent cites only the pages that it reads.

## Bring back an item from the backlog

1. Click the tab Backlog.
   Make sure that the list shows the items that you deferred.
2. Click the item.
   Make sure that the item shows who deferred it, when and why.
3. Click "Bring back".
   Make sure that the item is in the tab "To review" again.

> **NOTE:** An item in the backlog is not in the count, in the health check or in the queue of an agent. It never
> comes back by itself.

## Do an item before an agent

1. Set "Also show items agents can do".
   Make sure that the list shows a section "Agents can do these".
2. Click an item in that section.
   Make sure that the item says "You hold this task".
3. Read the pages and decide, as steps 4 to 10 tell.
   Make sure that the next item opens.

> **NOTE:** When you open such an item, the console gives you its lease. Thus no agent gets the task while the
> page is open. If you go to a different page, the console gives the task back to the agents.

> **NOTE:** If the item says that an agent holds the task, the buttons stay off. Select a different item.
