# 0041 — A released task waits before it is offered again, and agents ask the API before they fetch a page

**Status:** proposed (November 2026); amends [0003](0003-deterministic-jobs-and-an-agent-queue.md) (an agent's release defers the task and may record a need for a person), [0017](0017-agent-api.md) (a body for `release`, and `GET policy`), [0036](0036-evidence-packs.md) (the agents' own reads follow the policy the evidence-pack job follows) and [0037](0037-source-ratings-2026-11-28.md) (the ratings bind an agent's scripted reads, not only jobs)

## Context

Two problems showed in the live agent rounds of November 27, 2026.

**A released task looped.** `POST tasks/<id>/release` (`work.queue.release`) put a task straight back as `queued`
with its priority unchanged and no `not_before`. A verifier that couldn't do task 426 (it needed a person to read a
page in a browser) released it; the next claim returned the same task, the highest-priority one, and both verifiers
spent their whole batch claiming and releasing it. The queue already skips a task whose `not_before` is ahead
(`work.queue._available`); nothing set it.

**Agents fetched sites the policy forbids.** Since [ADR 0037](0037-source-ratings-2026-11-28.md) every rated
publisher has a `fetch_policy` (`allowed`, `api_only`, `browser_only`, `citation_only`, `forbidden`) and
`ingest.policy.NEVER_FETCH` lists the hosts no job requests; the evidence-pack job records a robots.txt that shuts
out AI crawlers by name (`Fetcher.ai_blocked`, `PrefetchedPage.reason = "ai_blocked"`). All of that is enforced
by `ingest.http.Fetcher`, which only jobs use. An agent reading a page with WebFetch or `curl` saw only what the
evidence pack's `unreadable` list told it, and only for the URLs in it. A writer made a scripted read of
nbcnews.com, which is `citation_only` and whose robots.txt blocks Claude's crawlers by name; fillers touched un.org,
which is `browser_only`. The skills' rule ("unrated: read it yourself, honestly") also let agents script any
domain nobody had rated.

## Decision

**Deferred releases** (`work/queue.py`, `agentapi/views.py`, `manage.py tasks release`):

- `release` takes an optional JSON body `{"reason": str, "defer_minutes": int, "needs": "browser" | "owner"}`.
  `defer_minutes` runs from 0 to 10,080 (a week, `MAX_DEFER_MINUTES`) and defaults to 60
  (`DEFAULT_DEFER_MINUTES`), also for a bare `POST`; it sets `not_before = now + defer` (0: no wait). The task's
  `error` gets `<agent>: released[, needs <kind>][: <reason>] (deferred until <time> UTC)`. The attempt is still
  given back, as before.
- `needs` says a person must act first: `browser` (a page only a browser may read) or `owner` (a decision only the
  owner makes). It defers a week (`NEEDS_DEFER_MINUTES`) unless `defer_minutes` says otherwise, and records
  `payload["needs"] = {kind, by, at, reason}`. Over the API it needs a `reason`. The jobs that refresh a queued
  task's payload (`process`, `gap_waves`, `branches review`) keep it (`queue.PAYLOAD_KEYS`).
- The console's Work → kind page gets a **Deferred** tab (`queue.deferred_q`: queued with `not_before` ahead, or a
  recorded need) showing each task's "not before" time and its need; the task's page shows both. An operator's
  `requeue` now also takes a deferred task and clears `not_before` and `payload["needs"]`; `cancel` takes it as
  any queued task.

**The fetch policy for an agent's own reads** (`agentapi/policy.py`):

- `GET /api/agent/policy?url=<url>`, open to any token and rate-limited like every read, answers
  `{url, publisher, policy, may_fetch, browser_read, why, api_base?, crawl_delay?}` from the rows that already
  decide for jobs: the nearest `Publisher` (else the `evidence.publishers` defaults), `NEVER_FETCH`, the tier, and
  the evidence-pack job's page rows (`ai_blocked`; `robots` and `blocked` within `HOST_COOLDOWN_DAYS`). It fetches
  nothing.
- `may_fetch` is true only for a rated `allowed` publisher, or an `api_only` one under its `api_base` (with its key,
  where it needs one). It is false for `forbidden`, `citation_only`, `browser_only`, a `NEVER_FETCH` host, an
  unrated domain, an `ai_blocked` host and a host that refused us lately. For `browser_only` (and the others a
  browser may read) `why` says it needs a person's browser; a cloud agent has none. `browser_read` is false only for
  `forbidden`.
- Every task skill (`drain-write-events`, `fill-gaps`, `verify-claims`, `verify-stale-claims`,
  `map-branch-entities`, `review-branch-proposals`) and `run-round` call it before any WebFetch or `curl` of a
  source page. When `may_fetch` is false they don't fetch: they use another source (Wikipedia's references often
  lead to a readable one), cite the page unread only where the skill already allows it, or, when the task can't be
  done without the page, release it with `{"needs": "browser", "reason": "<url>: <why>"}`. The `run-round` lead
  lists those releases in its summary for the owner. Wikimedia's APIs (the Wikidata and Wikipedia calls the skills
  make) are `allowed` and answer `may_fetch: true`.

## Consequences

- A task an agent can't do leaves the queue's head for an hour (a week when it needs a person), so a round's agents
  move on. A task released by mistake waits too: an agent that only wants to hand back a task it hasn't started
  passes `"defer_minutes": 0`, and an operator can requeue it at once.
- Tasks that need a browser collect in the Deferred tab and the round summary instead of being retried; the owner
  reads the page (or runs the task in a local session with a browser), then requeues or cancels it. After a week an
  untouched one is offered again, and is likely released again: the summary keeps listing it.
- Unrated domains are now off limits to an agent's scripts, where the skills used to allow them. That narrows what a
  cloud round can read until more publishers are rated (`manage.py unrated_domains` lists the ones tasks cite).
- The endpoint knows a robots.txt only if the evidence-pack job has read it. A rated, `allowed` host the job never
  asked can still shut AI crawlers out without the endpoint knowing; the honest User-Agent and the agent's own fetch
  tool remain the last check. Revisit if agents meet such hosts often: the endpoint could read robots.txt through
  the Fetcher, at the cost of a request from the web process.
- One more call per page read. It is a single indexed lookup or two, inside the per-token rate limit.
