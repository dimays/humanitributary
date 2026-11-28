# 0046 — Pages only a person may read go to the owner's review queue, and no agent is offered them

**Status:** proposed (November 2026); amends [0028](0028-operations-console.md) (a Review page, and decisions made with one click, without a confirmation page, still audited), [0035](0035-automated-daily-rounds.md) (a draft held only for a person's read is not carried over to a round's reviewers, and the round hands such reads to the owner) and [0042](0042-deferred-releases-and-the-fetch-policy-endpoint.md) (a task that needs a person is never offered to an agent, however long ago its week ran out)

## Context

The owner decided that a `browser_only` source is read by a person, never by an agent's script. The platform
already sorted that work out but had nowhere to finish it:

- An agent that can't do a task without such a page releases it with `{"needs": "browser"}` (ADR 0042). The task
  waited a week (`not_before`) in Work → kind, tab Deferred, where the owner could only requeue or cancel it. After
  the week it went back to the agents, who could not read the page either.
- A reviewer in a cloud round holds a draft whose only source besides Wikipedia is a `browser_only` page (the
  `run-round` skill). Today's rounds held drafts for exactly that reason, `w91-garifuna-unesco` (ich.unesco.org)
  among them. A held draft stays in review until an operator sends it to the next round's reviewers, who can't read
  the page either.
- The console's actions each take two steps (a confirmation page and a reason, ADR 0028). That suits a publish. It
  is too slow for twenty claims read one after another.

## Decision

**A Review page in the console** (`/ops/review/`, `opsconsole/review.py`), in the sidebar with a count badge. Its
queue is what waits for a person's read:

1. `verify_claim` tasks released with `needs` browser or owner: the claim's text, its entry, the agent's reason,
   and the pages to read;
2. drafts in review held only for a person's read (`work.rounds.owner_read_drafts`): the record's support, besides
   Wikipedia, is only pages of `browser_only` or `citation_only` publishers (`PERSON_READ`: neither may be fetched
   by an agent's script) that nobody has read as `human:` yet, and no open round is still reviewing it. The page
   shows its title, date and text, each citation with its URL and publisher policy, and the reviewer's hold note
   (the newest edit-file Revision on the entry or its evidence). A HOLD without an edit leaves no note: the page
   says so;
3. `fill_gap` and `write_event` tasks released with `needs: browser`: their context and the pages the agent could
   not read.

One item at a time, oldest first, with a compact list to jump between them and each item's kind. Every page to read
is a link that opens in the owner's own browser (`target="_blank" rel="noopener"`), with what `GET policy` says of
it. Nothing is chosen for the owner.

**Decisions, one click each, with an optional note:**

| | Claim | Draft | Task |
|---|---|---|---|
| Approve | the owner's read as evidence: `supports`, `human:<username>`, method `browser_read`, the page, an optional excerpt (25 words at most; checked when the page is stored), through the agent API's `verify_claim` applier, so `record_evidence` recomputes the claim by the existing rules; the task completes | the edit-file path (`timeline.edits.apply`): an `add_evidence` op stamping each person-read source with the owner's read, then `approve`, so the publishing rule decides and the next release carries it | handed back to the agents with `payload["owner_read"]` (below) |
| Deny | evidence that the page does not support the claim (`unrelated`), or that it contradicts it (`conflicts`, the contested path) | `reject`: retracted | cancelled |
| Defer | the backlog | the backlog | the backlog |

**Approve on a task completes nothing.** The owner can't write the event for the agent, and a summary of a page an
agent can't read is not a source. So approve takes one of two things: a page that `GET policy` lets an agent fetch
(refused otherwise), named as `owner_read.source`; or the owner's own summary of the unreadable page,
`owner_read.summary`, which the payload marks as a lead for what to look for, never a source. The task is requeued
(`queue.requeue` clears the need), and `owner_read` is one of `queue.PAYLOAD_KEYS`, so a job that refreshes the
payload keeps it.

**The backlog is noiseless.** Defer moves an item out of the Review count, the badge, the Work counts, `/healthz`'s
queue and every agent's queue, and it never comes back by itself. A task carries it in
`payload["needs"]["backlog"]` (`queue.backlog_q`), a draft in the `owner_review` JobState row. The Backlog tab lists
the deferred items; Bring back returns one where it was.

**No agent is offered these items.** `queue._available` now excludes any task with `payload["needs"]`, so a need
waits for a person however long ago `not_before` passed; only a decision (or an operator's requeue) lets it go, and
only as the decision says. `work.rounds.held_drafts` leaves out the drafts that wait for the owner, so neither
`carry_over` nor `GET queue`'s `held` gives them to a round's reviewers. `GET queue` gives agents only the count and
the page's path (`owner_review`), for the round's summary.

**Items agents can still do, for the owner who is free first.** A filter, off by default ("Also show items agents
can do"), adds the `verify_claim` tasks agents could claim, in the agents' order, after the owner's queue. The same
decisions apply. While such an item's page is open it is leased to the owner (`queue.claim_for`, as
`human:<username>`, the same lease an agent's claim takes, ten minutes, renewed by the page every five), so a
round's agent can't take it mid-read. The lease counts no attempt and keeps the task's round link: a person's read
is not an agent's try. Leaving without a decision hands it back (`queue.let_go`, from the page's `pagehide`
beacon); opening another such item hands back the first. If an agent holds the task, the page says so and the
buttons stay disabled. A deferred agent-workable item gets a need of kind `owner` marked `from_defer`, so it leaves
the agents' queue too, and Bring back returns it to them.

**One click, still audited.** Each decision is an `OpsAction` (`review_approve`, `review_deny`, `review_defer`,
`review_restore`) made and run in the request, in one transaction, without a confirmation page: the page itself
shows everything the decision rests on. The row records the actor, the item (its key), the decision, the note (as
its reason, or a default) and the page, with its time. The form's idempotency key makes a double submit act once.
Review decisions have their own rate limit (120 per user in 10 minutes) and don't use up the other actions' 10.
Approve and Deny wait five seconds in the browser with an Undo before they are sent: nothing is written until then,
so the undo is honest, and leaving the page in those seconds sends the decision at once. The page's GET writes
nothing; the owner's lease is a separate POST, not an OpsAction (the task's `claimed_by` records it).

**Every agent hands these reads to the owner.** A `browser_only` source is for a person's own browser. A Claude
session driving the in-app browser, or Claude in Chrome, is not a person's read, in a desktop session or a cloud one.
Every task skill (`drain-write-events`, `fill-gaps`, `verify-claims`, `verify-stale-claims`, `map-branch-entities`,
`review-branch-proposals`) and `run-round` say so: an agent or a reviewer never reads such a page with any tool
(and never cites it unread); it uses another source, or releases the task with `needs: browser`; a draft resting on
one only is held; the round's summary ends with a line counting what waits on the Review page, with its link. The
skills no longer keep "one in-app browser tab" rules, and `GET policy`'s `why` for these pages says to release the
task for the owner. The task skills also say a `needs` release waits for the owner, not a week.

## Consequences

- The `browser_only` work has one place to end, and every end is recorded: evidence the owner read (as
  `human:<username>`, `browser_read`), a draft published or retracted through the edit-file path, a task handed
  back with a lead or cancelled, or the backlog.
- A need is now permanent until a person acts. A task released with `needs: owner` of another kind
  (`review_branch_proposal`, `map_branch_entities`) is not on the Review page; it waits in Work → kind, Deferred,
  where requeue and cancel still work. `not_before` is still set a week ahead and shown, but no longer decides.
- `citation_only` counts as a person-only read for drafts, as `browser_only` does: neither may be fetched by an
  agent's script (ADR 0042). A draft resting on a page only a person may read waits for one.
- A person's lease that lapses (the owner closed the laptop) is taken over like any expired lease, and is not
  counted as stuck on the Dashboard or as an expired lease in `/healthz`.
- The sidebar's count costs one query on every console page (a UNION of the tasks and the drafts, the open rounds and the backlog checked in SQL).
- No agent marks a cite `browser_read` any more: that method is now the owner's (`human:<username>` from the Review
  page). The agent API still accepts it in a result, for the evidence agents recorded before this ADR; refusing it
  from agents would be a later change.
