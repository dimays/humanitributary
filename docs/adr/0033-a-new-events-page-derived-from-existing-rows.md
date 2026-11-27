# 0033 — A New events page in the console, every state derived from the rows that already record it

**Status:** proposed (November 2026); amends [0031](0031-a-simpler-console-and-run-logs.md) (the sidebar's six items become seven)

## Context

The owner wants a pulse on the content the platform makes day to day: which stories came in, which became tasks,
what the agents wrote, what a reviewer did with it, and what reached the page. Today that takes four places: the
Work page (tasks by kind and state), a task's page (its result and Revisions), the review files in `var/reviews/`
and the Releases page. None of them follows one item from start to end, and none says how many drafts a day the
agents write or how many get rejected.

Everything the page needs is already recorded, in rows that are the truth for their part:

- a `write_event` task holds its cluster's candidates in `payload.items`, its creation time and the agent's
  `result.decision` (`written`, `duplicate`, `rejected`); a `fill_gap` task holds the wave, the window and the
  branch, and writes 1–3 events or "nothing notable";
- the agent API applies a result and completes the task in one transaction, and the trigger links the entry's
  insert Revision to the task (`Revision.task_id`), so the entry a task wrote is found even after a rename;
- `apply_edits` writes each op's Revisions with the reason `apply_edits <file> #<i> <op> <slug>: <reason>`: an
  approve, a reject, an edit, an `add_branch` or `add_event`, each named;
- a release's `revision_high_water` says which Revisions it carries, so the first release covering the Revision that
  published an entry is the release that put it on the page, and the live release (the pointer) says whether it is
  still there.

The sidebar of ADR 0031 is six items on purpose. The owner asked for this one to be in it.

## Decision

A seventh sidebar item, **New events** (`/ops/new/`, `opsconsole/views.py` `new_events`, `opsconsole/newevents.py`,
`templates/opsconsole/new_events.html`), between Dashboard and Jobs, staff only and read only like every page:

- **A feed of items, newest activity first**: one per `write_event` task, one per event a `fill_gap` task wrote (or
  one for the task when it wrote none), one per entry an edit file added. Each shows five steps, Fetched → Queued →
  Drafted → Reviewed → Published, with their times, and its title (the story's before drafting), branches, date on
  the timeline, sources (all, not Wikipedia, single source), agent and verdict, and links to the page's anchor (when
  live), the task, the Revisions, the release and the candidate.
- **Tabs and filters**: All, Current events, History waves, Branch additions, Rejected & duplicates, Waiting; the
  time range (today, 7 days, 30 days, any time) over an item's last activity; state; branch (its own or a linked
  one). 25 a page.
- **A 14-day pulse**: per day, candidates fetched, tasks queued, drafts written, items published (by release) and
  items rejected (by the agent or a reviewer), as inline SVG bars, one row a series scaled to its own busiest day,
  with today's numbers and a table view.
- **A hover card per item**, like a run card (ADR 0032): the steps in the browser's time zone with the time between
  them, the verdict and the reviewer's reason, the agent's note; drawn from JSON embedded with the page.

**Nothing new is stored.** Every state is derived in SQL from the rows above (`newevents.ITEMS_CTE`): the review
verdict from the entry's Revisions (the first that publishes it, the last that retracts it, or else the first
`apply_edits` edit: "held"), "duplicate" when the retraction's reason or the agent's decision says so, "approved
with edits" when an edit came before the approval or the reason says so. The page reads in a fixed number of
statements whatever the tables hold: one for the counts and the pulse, one for a page of items, one for the shown
items' words (titles, branches, sources, notes, reasons), and one for the live release.

`config/settings.py` gets `PUBLIC_SITE_URL` (by default `https://` and `SITE_NAME` lower-cased, `.com`) for the
links to an entry on the page.

## Consequences

- The owner sees the day's flow and each item's path on one page, and the review verdicts without opening the files.
- A verdict is read from words a reviewer wrote: "duplicate" in a reject's reason, "with edits" in an approve's.
  Edit files already say so (the review rounds use "APPROVE WITH EDITS", "REJECT (duplicate)", "HOLD"); a reason
  that doesn't is shown as plain Rejected or Approved. "Held" is any `apply_edits` change to an entry still in review.
- Times come from the rows: a task's own times, the Revisions' transaction times, a release's creation. An
  approval and the release that carries it can be minutes or days apart; the page shows both.
- Without a parallel table, each page load recomputes every item's state. On a copy with 6,300 tasks and their
  entries (about a year at today's caps), the counts and pulse take about 120 ms and a page about 65 ms. If it
  grows slow, a denormalized table kept by the agent API and `apply_edits` is the next step, with its own ADR; until
  then there is nothing to keep in step.
- Audit tasks and branch proposals also make content; they are not on the page. Candidates that never became a task
  (under the threshold or the cap) are counted in the pulse, not listed.
