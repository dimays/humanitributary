---
name: drain-write-events
description: Work the write_event queue in the Humanitributary repo through the agent API. Claim a story that ingestion clustered (Wikipedia Current events, "<Year> in X", official feeds), read its sources, draft one event in the SCHEMA style, cite pages actually read, and complete the task with the event, which lands in review. Use when asked to drain or work write_event tasks, add current events, or turn queued candidates into timeline events.
---

# Drain the write_event queue

Read `AGENTS.md` and `site/SCHEMA.md` ("Event", "Style", "Citation rules") first; the owner's `manage.py digest`
gives the overview. Jobs did the searching: each task's payload has the story's items, its sources, entities with
QIDs and coordinates, suggested branches and date, possible duplicates, and suggested sources from open APIs. You
make the judgment calls and do the reading.

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

## Fetching: honest, one tab, never forced

- **Never disguise the client.** Every page you fetch by script sends the project's honest User-Agent:
  `curl -sS -A "$INGEST_USER_AGENT" <url>` (the same value as the app's `INGEST_USER_AGENT`). No spoofed browser
  User-Agent, no header tricks, no proxies, mirrors or caches to get round a site that refuses automated reads.
  The safety checks block such attempts, and they break the source policy (ADR 0013). If a site refuses, use
  another reputable source, or hold or reject the work.
- **Exactly one in-app browser tab per agent.** Open one tab, reuse it for every page you read, and close it when
  you finish, also when you stop early, fail or release a task. Leftover tabs fill the pane's cap (about eight)
  and starve the other agents. A cloud session has no in-app browser: there a `browser_only` page can't be read
  at all (see the `run-round` skill).
- **Paid and blocked wires are common in news.** Reuters (401), AFP (access denied) and CNN (451) often refuse.
  Don't force them. Find another readable, independent, reputable source: a `write_event` story without two readable independent sources is completed `rejected` with a note saying what refused, or failed with `{"retry": false}`; never written on one source you could not read.

## 1. Claim

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/claim" -d '{"kinds": ["write_event"]}'    # {"task": {...}} or {"task": null}
```

Payload keys:

| Key | What |
|---|---|
| `suggested` | Branches, with scores. Also `when`, `y`, `precision`, `first_date`/`last_date`, `title_hint`, `link_branches`. |
| `items` | What Wikipedia or the feed said, with `attribution`. Portal text is CC BY-SA: paraphrase, don't copy. |
| `sources` | URL, publisher, `tier`, `fetch_policy` and an `excerpt` of at most 25 words. |
| `entities` | `qid`, `label`, `kind`, `lat`/`lon` and the `wikipedia` article. |
| `story_article` | The story's own Wikipedia article. |
| `possible_duplicates` | Existing events that look alike, with similarity. |
| `suggested_sources` | Lookup hits: scholarship, archives, official data. Not evidence until read. |

Look things up with `GET entries/<slug>`, `GET branches/<slug>` (its events, metrics, open proposals) and
`GET search?q=…&kind=event`.

## 2. Decide

- **Duplicate.** If a `possible_duplicates` event already covers it, don't add a second one: complete with
  `{"decision": "duplicate", "entry": "<that slug>", "note": "…"}`. If the story adds something, say so in the note.
- **Not timeline-worthy.** A routine daily incident in a long war, say: `{"decision": "rejected", "note": "why"}`.
  The `process` job then marks the story's candidates rejected.
- **Worth one event.** The landmark or the story as a whole (for example "2026 Strait of Hormuz crisis" with a span
  `y`…`end`), not each day's item. `imp`: 1 is a landmark, 2 is notable, 3 is a detail. Current events are rarely 1.

## 3. Read and cite

- **Copy excerpts from the page itself, never from a fetch tool's summary.** Tools such as WebFetch hand back a
  model-written summary of the page, and the "quotes" in it are often paraphrased, shortened or straightened. For
  every excerpt (and every stance you record), read the page's own text: the in-app browser's `get_page_text`, or
  `javascript_tool` returning the matching sentence from `document.body.innerText`, or the raw page via `curl` where
  the site allows scripts. Then copy the sentence character for character. If only a summary is reachable, cite the
  page without an excerpt and say so in your note. Every review round so far has had to re-copy summarized excerpts.
- **Fetch and read every page you cite** (SCHEMA citation rule 1). A source whose `fetch_policy` is `browser_only`
  (Britannica, the Guardian, BBC, NPR, AP, Al Jazeera, un.org, nobelprize.org …) is read in a browser, never by
  script; mark that cite `"method": "browser_read"`. Never use openstax.org (the API refuses it).
- **Get a second source.** Aim for at least one non-Wikipedia source that explicitly supports the date and every
  claim. Official sources in `sources` / `suggested_sources` (WHO, Federal Register, the Gazette, Nobel) are good
  candidates. The publishing rule (ADR 0010) holds an event without one after 14 days, and the page marks an event
  that rests on one publisher as "Single source" (ADR 0018).
- **Write it in SCHEMA style:** American English, dates as "November 20, 2026", title ≤ 60 characters, text ≤ 240
  characters, neutral tone, and attributed claims ("according to the WHO").

## 4. Complete

```bash
cat > /tmp/result.json <<'JSON'
{"result": {"decision": "written", "sources_read": ["https://…"], "note": "",
  "event": {"id": "<prefix>-<slug>", "branch": "<branch>", "y": 2026.89, "when": "November 20, 2026",
            "title": "…", "text": "…", "imp": 2, "link": "<other branch, optional>",
            "cites": [{"t": "…", "u": "https://…", "k": "primary", "excerpt": "≤ 25 words from the page"}],
            "geo": {"scope": "place", "lat": 0.0, "lon": 0.0, "r": 30, "label": "…", "src": "https://en.wikipedia.org/wiki/…"}}}}
JSON
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/complete" -d @/tmp/result.json
```

The event is created with status `review`, with its record claim, one evidence row per cite (checked by you, with
your excerpt), its location and link; every row leaves a Revision linked to the task. `geo` comes from the payload's
entity coordinates (`src` is that entity's Wikipedia article). The owner reviews and publishes it (`manage.py facts
publish <slug>`, under the publishing rule), and the next release carries it. Postgres is the only record of
content (ADR 0021): nothing else needs to be edited.

The `process` job reads `result.entry`: the story's candidates become accepted and point at the entry; a null entry
rejects them. New items on the same story later get a new task that names your event as a possible duplicate.
