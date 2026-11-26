---
name: drain-write-events
description: Work the write_event queue in the Humanitributary repo. Claim a story that ingestion clustered (Wikipedia Current events, "<Year> in X", official feeds), read its sources, draft one event in the SCHEMA style, cite pages actually read, write it, and complete the task. Use when asked to drain or work write_event tasks, add current events, or turn queued candidates into timeline events.
---

# Drain the write_event queue

Read `AGENTS.md`, `site/SCHEMA.md` ("Event", "Style", "Citation rules") and `uv run python manage.py digest` first.
Jobs did the searching: each task's payload has the story's items, its sources, entities with QIDs and coordinates,
suggested branches and date, possible duplicates, and suggested sources from open APIs. You make the judgment
calls and do the reading.

## 1. Claim

```bash
uv run python manage.py tasks next --kind write_event --claim --agent agent:<you>
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

## 2. Decide

- **Duplicate.** If a `possible_duplicates` event already covers it, don't add a second one. Complete the task with
  `{"entry": "<that slug>", "decision": "duplicate"}`. If the story adds something, queue a `verify_claim` task or
  edit that entry instead.
- **Not timeline-worthy.** A routine daily incident in a long war, say: complete with
  `{"entry": null, "decision": "rejected", "note": "why"}`. The job then marks the story's candidates rejected.
- **Worth one event.** The landmark or the story as a whole (for example "2026 Strait of Hormuz crisis" with a span
  `y`…`end`), not each day's item. `imp`: 1 is a landmark, 2 is notable, 3 is a detail. Current events are rarely 1.

## 3. Read and cite

- **Fetch and read every page you cite** (SCHEMA citation rule 1). A source whose `fetch_policy` is `browser_only`
  (Britannica, the Guardian, BBC, NPR, AP, Al Jazeera, un.org, nobelprize.org …) is read in a browser, never by
  script. Never use openstax.org.
- **Get a second source.** Aim for at least one non-Wikipedia source that explicitly supports the date and every
  claim. Official sources in `sources` / `suggested_sources` (WHO, Federal Register, the Gazette, Nobel) are good
  candidates. The publishing rule (ADR 0010) holds an event without one after 14 days.
- **Write it in SCHEMA style:** American English, dates as "November 20, 2026", title ≤ 60 characters, text ≤ 240
  characters, neutral tone, and attributed claims ("according to the WHO").

## 4. Write

Until the cutover (ADR 0001) the legacy data files are the record, so the event survives the next import:

1. Add it to `site/data/` (a recent-events file, e.g. `28-context-recent.js`, or the file of the branch's era) as
   `TL.add({ events: [{ id, branch, y, end?, when, title, text, imp, link?, cites: [{t, u, k?}] }] })`, plus
   `TL.geo(id, {scope: "place", lat, lon, r, label, src})` from the payload's entity coordinates (`src` is that
   entity's Wikipedia article).
2. `node site/build.mjs --check | tail -1`
3. `make import` (idempotent; it writes the event, its claim and evidence through `revising("job:import_legacy")`).
4. Optionally record what you read on the new event's atomic parts:
   `uv run python manage.py facts record --claim <part id> --url … --stance supports --excerpt "…" --agent agent:<you> --task <task>`.

Writing straight to Postgres (`timeline.services.save_event` inside
`revising("agent:<you>", reason="write_event #<task>", task=task)`) is fine for a draft or review entry. A
published entry that exists only in Postgres is retracted by the next `make import --retract-missing`.

## 5. Finish

```bash
echo '{"entry": "<slug>", "decision": "written", "sources_read": ["https://…"], "note": ""}' > /tmp/result.json
uv run python manage.py tasks complete <task> --result /tmp/result.json --agent agent:<you>
```

The `process` job reads `result.entry`. The story's candidates become accepted and point at the entry; a null
entry rejects them. New items on the same story later get a new task that names your event as a possible
duplicate. If you can't finish, `tasks release <task>` (untouched) or `tasks fail <task> --error "…"`.
