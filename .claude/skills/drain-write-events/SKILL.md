---
name: drain-write-events
description: Work the write_event queue in the ManyAges repo through the agent API. Claim a story that ingestion clustered (Wikipedia Current events, "<Year> in X", official feeds), read its sources, draft one event in the SCHEMA style, cite pages actually read, and complete the task with the event, which lands in review. Use when asked to drain or work write_event tasks, add current events, or turn queued candidates into timeline events.
---

# Drain the write_event queue

Read `AGENTS.md` and `site/SCHEMA.md` ("Event", "Style", "Citation rules") first; the owner's `manage.py digest`
gives the overview. Jobs did the searching: each task's payload has the story's items, its sources, entities with
QIDs and coordinates, suggested branches and date, possible duplicates, and suggested sources from open APIs. You
make the judgment calls and do the reading.

## The API

Work through the agent API, never the database: you hold a token, not database credentials (ADR 0017). Two
variables come from your environment: `MANYAGES_API` (the base URL: `http://127.0.0.1:8000/api/agent` when
the owner runs `make up`, the production URL later) and `MANYAGES_API_TOKEN` (made by the owner with
`manage.py agent_token create <name> --scope <kind>`; never print or log it).
Until the owner deletes the old names (ADR 0047), `HUMANITRIBUTARY_API` and `HUMANITRIBUTARY_API_TOKEN` stand in
for them: every call below falls back to them. The same calls work locally and in
production.

```bash
api() { curl -sS -H "Authorization: Bearer ${MANYAGES_API_TOKEN:-$HUMANITRIBUTARY_API_TOKEN}" -H "Content-Type: application/json" "$@"; }
api "${MANYAGES_API:-$HUMANITRIBUTARY_API}/"                        # who you are, your scopes, every endpoint
api "${MANYAGES_API:-$HUMANITRIBUTARY_API}/schemas/<kind>"          # the result shape `complete` accepts
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
api -X POST "${MANYAGES_API:-$HUMANITRIBUTARY_API}/tasks/<id>/extend" -d '{"minutes": 30}'
```

A lease that runs out may be taken over by another agent; then your `complete` is refused (409) and the work is
lost. If you can't finish, `release` the task (untouched) or `fail` it with the reason; never leave it to lapse.
A release is deferred (ADR 0042): the task isn't offered again for an hour, so neither you nor the next agent claims it
straight back. Say why, `-d '{"reason": "…"}'` (`"defer_minutes"`: 0 to 10080 for another wait). When only a person
can unblock it, add `"needs": "browser"` (a page only a browser may read) or `"needs": "owner"` (the owner's call): it
waits for the owner (the console's Review page: no agent is offered it again), and the round's summary lists it. Never release and re-claim the same task in a loop.

## Fetching: honest, one tab, never forced

- **Ask the policy before every fetch.** Before any WebFetch or `curl` of a source page (anything but the agent API
  itself), ask the API whether your script may read it (ADR 0042):

  ```bash
  api -G "${MANYAGES_API:-$HUMANITRIBUTARY_API}/policy" --data-urlencode "url=<the page>"
  # {"policy": "allowed", "may_fetch": true, "browser_read": true, "why": "…", "crawl_delay": 1.0, "publisher": {…}}
  ```

  Fetch only when `may_fetch` is true, and leave `crawl_delay` seconds between requests to one host. When it is
  false, don't fetch, and don't reach the page another way (another tool, a mirror, a cache): `citation_only`,
  `browser_only`, `never_fetch`, `ai_blocked`, `robots`, `blocked`, `unrated`, `forbidden`, and `api_only` outside
  its `api_base` are never read by script. `why` says which (for `api_only`, the API base to use instead). Then:
  1. **Use another source.** Wikipedia's article on the subject cites several; its references often lead to a
     readable one (ask the policy for each). Wikipedia and Wikidata themselves are `allowed`.
  2. **Never read it with another tool.** A page the policy refuses is read by a person in their own browser, never by an agent with any tool: not
     the in-app browser, not Claude in Chrome, in a desktop session or a cloud one (ADR 0046). `browser_read: true`
     means a person's browser.
  3. **Don't cite it unread.** No task skill allows a citation-only cite: a page you could not read is no source.
  4. **Release the task** when it can't be done without that page, so a person can read it:
     `api -X POST "${MANYAGES_API:-$HUMANITRIBUTARY_API}/tasks/<id>/release" -d '{"needs": "browser", "reason": "<url>: <why>"}'`.
     It waits for the owner (the console's Review page) instead of coming straight back to you or the next agent.
- **Never disguise the client.** Every page you fetch by script sends the project's honest User-Agent:
  `curl -sS -A "$INGEST_USER_AGENT" <url>` (the same value as the app's `INGEST_USER_AGENT`). No spoofed browser
  User-Agent, no header tricks, no proxies, mirrors or caches to get round a site that refuses automated reads.
  The safety checks block such attempts, and they break the source policy (ADR 0013). If a site refuses, use
  another reputable source, or hold or reject the work.
- **No browser for source pages.** Never open the in-app browser or Claude in Chrome to read a source, in a desktop
  session or a cloud one: a page only a browser may read is the owner's, on the console's Review page (ADR 0046).
  You read what `GET policy` lets a script fetch, and the evidence pack's stored pages.
- **Paid and blocked wires are common in news.** Reuters (401), AFP (access denied) and CNN (451) often refuse.
  Don't force them. Find another readable, independent, reputable source: a `write_event` story without two readable independent sources is completed `rejected` with a note saying what refused, or failed with `{"retry": false}`; never written on one source you could not read.

## The evidence pack: read it first

The `prefetch_sources` job (every 15 minutes, ADR 0036) has usually fetched this task's pages already, from the
publishers whose policy lets a job read them, and put them in the payload:

- `evidence_pack`: one entry per stored page: `url`, `title`, `publisher`, `tier`, `fetched_at`, `doc_id`, `words`
  and `passages` (the page's sentences that name the task's dates, years, numbers, entities or title words, best
  first, each with its `score` and `matches`, such as `"date:June 6"`, `"entity:Normandy (Q8205)"`).
- `unreadable`: the URLs it did not read, each with a `reason`: `browser_only` or `citation_only` (a person reads it in
  their own browser, never you), `ai_blocked` (its robots.txt shuts out AI crawlers by name: a person's read only), `api_only`
  (the publisher allows only its API),
  `unrated` (nobody has rated the publisher yet: never fetched by script, the job's or yours),
  `forbidden` (never), `never_fetch`, `robots`, `blocked`, `tdm_reserved` (the page opts out of text and data mining: read it by hand), `http_404`, `error`, `unsupported` (a PDF, say), `empty`,
  `deferred` (not yet: the next run reads it).
- `evidence_ready`: true when at least one stored page is not Wikipedia.
- An entry with `"via": "api"` is a catalog page read through its official API (`"api"`: openalex,
  crossref, loc, smithsonian, europeana): the record (title, metadata, an abstract), not the page. Cite the entry's
  `url`; an excerpt from the record is fine. If you cite the page for more than the record says, read the page.

How to use it:

1. **Read the passages, then the page.** A passage is a lead, not the whole story: `GET documents/<doc_id>` returns
   the page's full stored text while you hold the task. Judge support from that text, as you would from the page.
2. **Copy excerpts from the stored text.** Every passage, and every run of words inside one, is verbatim by
   construction. Check any excerpt with `POST evidence/check-excerpt -d '{"doc_id": <id>, "excerpt": "…"}'`
   (`match` true or false, and the `closest` passage when false). `complete` checks every excerpt whose page is
   stored: one that is not on the page, whitespace aside, is a 422 that names the closest passage; copy that, or
   drop the excerpt. Case, quote marks, dashes and footnote markers ("[12]") all count.
3. **Cite the page's URL** (the entry's `url`), with `"method": "agent_read"`. The stored text is private: never
   paste more than the excerpt anywhere.
4. **Never read an `unreadable` URL whose reason is `browser_only`, `citation_only` or `ai_blocked`**, with any tool
   (ADR 0046): use another source, or, when the task can't be done without it, release the task with `{"needs":
   "browser", "reason": "<url>: <why>"}` for the owner's Review queue. Other unreadable pages: fetch one yourself only
   when `GET policy` says `may_fetch` (below), with the honest User-Agent; never one that `robots` or `blocked` refused.
5. **No pack yet** (no `evidence_pack` key, or a `deferred` reason): read the pages yourself as below.

```bash
api "${MANYAGES_API:-$HUMANITRIBUTARY_API}/documents/<doc_id>"                       # the stored text (a task you hold)
api -X POST "${MANYAGES_API:-$HUMANITRIBUTARY_API}/evidence/check-excerpt" -d '{"doc_id": 42, "excerpt": "…"}'
```

## 1. Claim

```bash
api -X POST "${MANYAGES_API:-$HUMANITRIBUTARY_API}/tasks/claim" -d '{"kinds": ["write_event"]}'    # {"task": {...}} or {"task": null}
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
| `evidence_pack`, `unreadable`, `evidence_ready` | The pages already fetched and stored, with ranked passages, and the ones left to read by hand (above). |

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

- **Copy excerpts from the evidence pack's stored text when the page is in it** (above); otherwise **from the page itself, never from a fetch tool's summary.** Tools such as WebFetch hand back a
  model-written summary of the page, and the "quotes" in it are often paraphrased, shortened or straightened. For
  every excerpt (and every stance you record), read the page's own text: the stored text (`GET documents/<doc_id>`), or the raw page via `curl` where `GET policy` says `may_fetch` and
  the site allows scripts. Then copy the sentence character for character. If only a summary is reachable, cite the
  page without an excerpt and say so in your note. Every review round so far has had to re-copy summarized excerpts.
- **Fetch and read every page you cite** (SCHEMA citation rule 1). A source whose `fetch_policy` is `browser_only`
  (Britannica, the Guardian, BBC, NPR, AP, Al Jazeera, un.org, nobelprize.org …) is read by a person, never by
  an agent with any tool (ADR 0046): don't cite it unread; use another source, or release the task with `needs: browser`. Never use openstax.org (the API refuses it).
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
api -X POST "${MANYAGES_API:-$HUMANITRIBUTARY_API}/tasks/<id>/complete" -d @/tmp/result.json
```

The event is created with status `review`, with its record claim, one evidence row per cite (checked by you, with
your excerpt), its location and link; every row leaves a Revision linked to the task. `geo` comes from the payload's
entity coordinates (`src` is that entity's Wikipedia article). The owner reviews and publishes it (`manage.py facts
publish <slug>`, under the publishing rule), and the next release carries it. Postgres is the only record of
content (ADR 0021): nothing else needs to be edited.

The `process` job reads `result.entry`: the story's candidates become accepted and point at the entry; a null entry
rejects them. New items on the same story later get a new task that names your event as a possible duplicate.
