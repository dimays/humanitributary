---
name: verify-claims
description: Work verify_claim tasks in the Humanitributary repo through the agent API — re-read a claim's cited pages (stale, dead link, changed page, conflicting source, or a Wikipedia-only event that needs a second source) and record what each page says as evidence. Use when asked to verify claims, adjudicate conflicts, or work the verify_claim queue.
---

# Verify claims

The fact sweep (`docs/fact-checking.md`) queues a `verify_claim` task whenever a claim needs a human-quality read.
Read `AGENTS.md` and `site/SCHEMA.md` ("Citation rules") first. (Ingestion's link-health job queues the same task
kind with the same dedupe key; its skill `verify-stale-claims` covers the dead-link case in more detail.)

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

## 1. Claim a task

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/claim" -d '{"kinds": ["verify_claim"]}'
```

The payload: `reason`, `todo` (what to do), `claim` (id, field, value, status, witnesses), `entry` (title, date,
text), `evidence` (each citation's URL, publisher, tier, fetch policy, excerpt, last check, HTTP status, archive URL,
whether the page changed), `parts` (its atomic claims: date, location, numbers, actors) and, for a changed page,
`page_changes` (the text diff). `GET claims/<id>` gives the same view of any claim; `GET entries/<slug>` the entry.

## 2. Read

Fetch and read each cited page (a `browser_only` publisher such as britannica.com in a browser, never by script;
never openstax.org). For a dead link, try `archive_url` or the Wayback Machine. Decide, per page and per part:

- **supports**: the page explicitly says it; copy an excerpt of at most 25 words.
- **partial**: it says part of it (say which in the excerpt).
- **conflicts**: it says something else (record what in `found`, e.g. `{"y": 1951.3, "when": "April 1951"}`).
- **unrelated**: it does not bear on it (it will no longer be shown as a source).

By reason:

- `no_second_source`: find a reputable non-Wikipedia page that explicitly supports the claim and record it on the
  atomic parts it supports (the date, the place, a number: their ids are in `parts`). New citations go on parts;
  the record claim's list is the entry's own cites (the API refuses a new one there; ADR 0021 leaves lifting that to a later decision).
- `conflict`: read both sources. If ours is wrong or reputable sources disagree, put the corrected text in
  `proposed_text` ("Sources differ: …" or "Wikipedia says …; Britannica says …", which the publishing rule and the
  release gate require for a contested claim); the owner applies it. If the conflicting page is about something
  else, record it `unrelated`.
- `dead_link` / `content_changed` / `scheduled` / `value_changed`: re-read and record each page's stance again.

## 3. Complete with what you read

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/complete" -d '{"result": {"claim": <claim id>,
  "evidence": [{"claim": <part id, or omit for the claim>, "url": "https://…", "stance": "supports",
                "excerpt": "≤ 25 words", "method": "agent_read", "title": "…"}],
  "note": "…"}}'
```

Each evidence row is recorded through `evidence.services.record_evidence`: it stamps the check time and the page's
hash and recomputes the claim's status, confidence and next recheck. The response's `result.applied` has the
claim's new status. Corroborated needs two independent publishers (Wikipedia counts once).
