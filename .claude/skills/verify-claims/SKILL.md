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

## Fetching: honest, one tab, never forced

- **Ask the policy before every fetch.** Before any WebFetch or `curl` of a source page (anything but the agent API
  itself), ask the API whether your script may read it (ADR 0042):

  ```bash
  api -G "$HUMANITRIBUTARY_API/policy" --data-urlencode "url=<the page>"
  # {"policy": "allowed", "may_fetch": true, "browser_read": true, "why": "…", "crawl_delay": 1.0, "publisher": {…}}
  ```

  Fetch only when `may_fetch` is true, and leave `crawl_delay` seconds between requests to one host. When it is
  false, don't fetch, and don't reach the page another way (another tool, a mirror, a cache): `citation_only`,
  `browser_only`, `never_fetch`, `ai_blocked`, `robots`, `blocked`, `unrated`, `forbidden`, and `api_only` outside
  its `api_base` are never read by script. `why` says which (for `api_only`, the API base to use instead). Then:
  1. **Use another source.** Wikipedia's article on the subject cites several; its references often lead to a
     readable one (ask the policy for each). Wikipedia and Wikidata themselves are `allowed`.
  2. **Read it in a browser** only if you have one (a local session's in-app browser) and `browser_read` is true;
     mark the cite `"method": "browser_read"`. A cloud session has no browser.
  3. **Don't cite it unread.** No task skill allows a citation-only cite: a page you could not read is no source.
  4. **Release the task** when it can't be done without that page, so a person can read it:
     `api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/release" -d '{"needs": "browser", "reason": "<url>: <why>"}'`.
     It waits for the owner (the console's Review page) instead of coming straight back to you or the next agent.
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
  Don't force them. Find another readable, independent, reputable source; record only pages you read (a page you could not read is no evidence either way).

## The evidence pack: read it first

The `prefetch_sources` job (every 15 minutes, ADR 0036) has usually fetched this task's pages already, from the
publishers whose policy lets a job read them, and put them in the payload:

- `evidence_pack`: one entry per stored page: `url`, `title`, `publisher`, `tier`, `fetched_at`, `doc_id`, `words`
  and `passages` (the page's sentences that name the task's dates, years, numbers, entities or title words, best
  first, each with its `score` and `matches`, such as `"date:June 6"`, `"entity:Normandy (Q8205)"`).
- `unreadable`: the URLs it did not read, each with a `reason`: `browser_only` or `citation_only` (read it in a
  browser), `ai_blocked` (its robots.txt shuts out AI crawlers by name: a browser read only, never a script), `api_only`
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
4. **Open a browser only for `unreadable` URLs whose reason is `browser_only`, `citation_only` or `ai_blocked`** (one tab, closed at the end), and
   mark those cites `"method": "browser_read"`. Other unreadable pages: fetch one yourself only when `GET policy` says
   `may_fetch` (below), with the honest User-Agent; never one that `robots` or `blocked` refused. In a cloud round there is no browser: a
   draft that only `browser_only` pages support is held (the `run-round` skill).
5. **No pack yet** (no `evidence_pack` key, or a `deferred` reason): read the pages yourself as below.

```bash
api "$HUMANITRIBUTARY_API/documents/<doc_id>"                       # the stored text (a task you hold)
api -X POST "$HUMANITRIBUTARY_API/evidence/check-excerpt" -d '{"doc_id": 42, "excerpt": "…"}'
```

## 1. Claim a task

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/claim" -d '{"kinds": ["verify_claim"]}'
```

The payload: `reason`, `todo` (what to do), `claim` (id, field, value, status, witnesses), `entry` (title, date,
text), `evidence` (each citation's URL, publisher, tier, fetch policy, excerpt, last check, HTTP status, archive URL,
whether the page changed), `parts` (its atomic claims: date, location, numbers, actors) and, for a changed page,
`page_changes` (the text diff). `GET claims/<id>` gives the same view of any claim; `GET entries/<slug>` the entry.

## 2. Read

- **Copy excerpts from the evidence pack's stored text when the page is in it** (above); otherwise **from the page itself, never from a fetch tool's summary.** Tools such as WebFetch hand back a
  model-written summary of the page, and the "quotes" in it are often paraphrased, shortened or straightened. For
  every excerpt (and every stance you record), read the page's own text: the in-app browser's `get_page_text`, or
  `javascript_tool` returning the matching sentence from `document.body.innerText`, or the raw page via `curl` where `GET policy` says `may_fetch` and
  the site allows scripts. Then copy the sentence character for character. If only a summary is reachable, cite the
  page without an excerpt and say so in your note. Every review round so far has had to re-copy summarized excerpts.

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
