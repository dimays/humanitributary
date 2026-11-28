---
name: review-branch-proposals
description: Drain the review_branch_proposal queue in the ManyAges repo through the agent API — read what a branch rule proposed (split, merge, end date, new branch), decide, and either accept it with the operations written out (names, texts and cites it leaves to you) for the owner to apply, or reject it with a reason. Use when asked to review branch proposals or to work review_branch_proposal tasks.
---

# Review branch proposals

The branch rules (`docs/branch-rules.md`) propose structural changes; you decide them. Read `AGENTS.md` first.

## The API

Work through the agent API, never the database: you hold a token, not database credentials (ADR 0017). Two
variables come from your environment: `HUMANITRIBUTARY_API` (the base URL: `http://127.0.0.1:8000/api/agent` when
the owner runs `make up`, the production URL later) and `HUMANITRIBUTARY_API_TOKEN` (made by the owner with
`manage.py agent_token create <name> --scope <kind>`; never print or log it). The same calls work locally and in
production.

```bash
api() { curl -sS -H "Authorization: Bearer $HUMANITRIBUTARY_API_TOKEN" -H "Content-Type: application/json" "$@"; }
api "$HUMANITRIBUTARY_API/"                        # who you are, your scopes, every endpoint
api "$HUMANITRIBUTARY_API/schemas/<kind>"          # the result shape `complete` accepts
```

A claim is a lease (30 minutes by default): `POST tasks/<id>/extend` for more, `POST tasks/<id>/release` to hand
it back untouched, `POST tasks/<id>/fail -d '{"error": "why", "retry": true}'` to give up. `complete` checks the
result against its schema (422 lists the problems; the task stays yours to fix and resend) and applies it through
the service layer as `agent:<your name>`, linked to the task. What you write lands in review; it is never published
by the API. 429 means you are over the rate limit: wait `retry_after` seconds.

**Extend a long lease.** A lease runs 30 minutes (`TASK_LEASE_MINUTES`). When one task's work passes about 20
minutes (a slow site, a long read, a second source to find), extend it before it runs out, and again every 20
minutes while you still work on it:

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/extend" -d '{"minutes": 30}'
```

A lease that runs out may be taken over by another agent; then your `complete` is refused (409) and the work is
lost. If you can't finish, `release` the task (untouched) or `fail` it with the reason; never leave it to lapse.
A release is deferred (ADR 0042): the task isn't offered again for an hour, so neither you nor the next agent claims it
straight back. Say why, `-d '{"reason": "…"}'` (`"defer_minutes"`: 0 to 10080 for another wait). When only a person
can unblock it, add `"needs": "browser"` (a page only a browser may read) or `"needs": "owner"` (the owner's call): it
waits for the owner (the console's Review page: no agent is offered it again), and the round's summary lists it. Never release and re-claim the same task in a loop.

## 1. Claim a task

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/claim" -d '{"kinds": ["review_branch_proposal"]}'
```

The payload has everything: `proposal`, `rule`, `summary`, `strength`, `metrics` of each branch involved, `evidence`
(clusters, gaps, shared events, with event ids, titles, dates and places), `operations` (what would run) and
`needs_agent` (the fields you must write). `GET branches/<slug>` shows a branch's events, metrics and open proposals.

## 2. Decide

Ask whether a reader would be better served by the change:

- **SPLIT-PLACE / SPLIT-TIME**: are the clusters or phases really separate stories (peoples, eras), or one polity
  that happens to be large? Would each child have enough events to stand alone? Check the events that "stay".
- **MERGE-OVERLAP**: are the branches the same story under different names (ECSC → EEC → EU), not neighbours
  that interact? Pick the survivor's name and start date.
- **END-STALE**: did it end (then when, by a source), or does it continue with no events (then reject and leave
  it to the THIN fill-in tasks)?
- **NEW-BRANCH**: is the entity a lasting state, people, conflict, movement or international body (the rule
  only proposes those)? The parent comes from Wikidata relations (`evidence.parent_how`); when there is none
  (`parents` is in `needs_agent`), choose it from the branches' own lineage, or leave it empty with a sourced
  origin note. Never pick a parent because the stories mention it.

Look things up as you would to write an event (`site/SCHEMA.md` citation rules: fetch and read every page you cite;
never openstax.org; britannica.com never: a person reads it). **Before any WebFetch or `curl` of a source page, ask the
policy** (ADR 0042): `api -G "$HUMANITRIBUTARY_API/policy" --data-urlencode "url=<the page>"`, and fetch only when
`may_fetch` is true. When it is false, use another source (Wikipedia's references often lead to a readable one), and
never reach the page another way: not a browser either (the in-app one, Claude in Chrome), since a page the policy
refuses is read by a person (ADR 0046). A proposal you can't decide
without such a page is released with `{"needs": "browser", "reason": "<url>: <why>"}`.

## 3a. Accept: write the operations

Copy `operations` and fill every `needs_agent` field: a branch `name`, `text` (one or two sentences in SCHEMA style,
every statement supported), `start_when` / `end_when` as the source puts them, and `cites`
(`[{"t": title, "u": url, "k": kind}]`, at least one, pages you read). You may drop moves that are wrong or add ones
the rule missed; keep the shape of each op.

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/complete" -d '{"result": {"decision": "accept", "proposal": <id>,
  "note": "why, in one sentence", "operations": [ … ]}}'
```

The API refuses (422) while a placeholder (`TODO`) or a cite-less new branch remains. An accepted proposal changes
nothing yet: it is stored with your operations and status `accepted`, and the owner runs
`manage.py branches apply <proposal>`, because a structural change reaches
the page at once.

## 3b. Reject

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/complete" -d '{"result": {"decision": "reject", "proposal": <id>, "note": "why, in one sentence"}}'
```

The rule will not propose it again for 180 days, and then only if its evidence grew by half. Say why so the owner can
tune the thresholds. If you cannot decide, `POST tasks/<id>/release` with a reason (`-d '{"reason": "…"}'`; add `"needs": "owner"` when
the decision is the owner's, `"needs": "browser"` when it waits on a page only a browser may read); `fail` only if it
can never be decided.
