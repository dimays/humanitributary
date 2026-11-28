---
name: fill-gaps
description: Work the fill_gap queue in the Humanitributary repo through the agent API. Claim a gap the gap_waves job found (a branch with no published events, or far fewer than its peers, in one window of a content wave), read sources on that branch in that window, write 1–3 events in the SCHEMA style that cite pages actually read (at least one not Wikipedia), or report that nothing notable is sourceable, and complete the task. Use when asked to fill gaps, work fill_gap tasks, run a content wave, or deepen a branch's history.
---

# Fill gaps in the timeline

Read `AGENTS.md` and `site/SCHEMA.md` ("Dates", "Event", "Style", "Citation rules") first; the owner's `manage.py
digest` has a "Content waves" section with the active wave. The `gap_waves` job did the measuring: each task names
one branch and one window of a content wave in which that branch has no published event (`empty`) or far fewer
than its peers (`sparse`). You decide what, if anything, belongs there, read the sources, and write it.

How the waves and gaps are computed is in `docs/guide/content-waves.md`; the decision is ADR 0026.

## The API

Work through the agent API, never the database (ADR 0017). Two variables come from your environment:
`HUMANITRIBUTARY_API` (the base URL: `http://127.0.0.1:8000/api/agent` with `make up`, the hosted URL otherwise) and
`HUMANITRIBUTARY_API_TOKEN` (made by the owner with `manage.py agent_token create <name> --scope fill_gap`; never
print or log it).

```bash
api() { curl -sS -H "Authorization: Bearer $HUMANITRIBUTARY_API_TOKEN" -H "Content-Type: application/json" "$@"; }
api "$HUMANITRIBUTARY_API/schemas/fill_gap"         # the result shape `complete` accepts
```

A claim is a lease (30 minutes by default): `POST tasks/<id>/extend` for more, `POST tasks/<id>/release` to hand it
back untouched, `POST tasks/<id>/fail -d '{"error": "why", "retry": true}'` to give up (a source is down, say).
`complete` checks the result against the schema (a 422 lists the problems; the task stays yours to fix and resend)
and applies it as `agent:<your name>`, linked to the task. What you write lands in review, never published. A 429
means you are over the rate limit: wait `retry_after` seconds.

**Extend a long lease.** A lease runs 30 minutes (`TASK_LEASE_MINUTES`). When one task's work passes about 20
minutes (a slow site, a long read, a second source to find), extend it before it runs out, and again every 20
minutes while you still work on it:

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/extend" -d '{"minutes": 30}'
```

A lease that runs out may be taken over by another agent; then your `complete` is refused (409) and the work is
lost. If you can't finish, `release` the task (untouched) or `fail` it with the reason; never leave it to lapse.
A release is deferred (ADR 0041): the task isn't offered again for an hour, so neither you nor the next agent claims it
straight back. Say why, `-d '{"reason": "…"}'` (`"defer_minutes"`: 0 to 10080 for another wait). When only a person
can unblock it, add `"needs": "browser"` (a page only a browser may read) or `"needs": "owner"` (the owner's call): it
waits a week, and the round's summary lists it for the owner. Never release and re-claim the same task in a loop.

## Fetching: honest, one tab, never forced

- **Ask the policy before every fetch.** Before any WebFetch or `curl` of a source page (anything but the agent API
  itself), ask the API whether your script may read it (ADR 0041):

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
     It waits a week for the owner instead of coming straight back to you or the next agent.
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
  Don't force them. Find another readable, independent, reputable source; an event you can't support with a page you read stays unwritten (`nothing_notable` says why).

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

## 1. Claim and read the payload

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/claim" -d '{"kinds": ["fill_gap"]}'    # {"task": {...}} or {"task": null}
```

| Key | What |
|---|---|
| `window` | `from` and `to` (from the first year up to, not including, the second; BCE negative) and a `label`. Every event you write must have `y` inside it, or a span (`y`…`end`) that overlaps it: the API refuses anything else. |
| `wave` | Which wave (`W1` is 1925 to last year, `W2` 1800–1925, …), its window size, and `wide` for faith and culture branches (windows four times wider). |
| `gap` | `kind` (`empty` or `sparse`), `events_in_window`, the peers' median and who the peers are, and `run`: how long the silence around this window is. |
| `branch` | `id`, `name`, `text`, span, `region`, `parents` / `into` / `children`, the branches its events link to and from, `events`, `id_prefixes` (the prefixes its ids use, most common first), `wikipedia` (articles it cites), `qids` (its Wikidata items), and `article` (its Wikipedia article title). |
| `before`, `after` | Up to three published events just before and just after the window: id, title, `when`, `y`. Your events should read well between them. |
| `in_window` | For a sparse gap, what is already there. Don't repeat it. |
| `pointers` | Added by the `gap_pointers` job, when it has run: `wikipedia_sections` (headings of the branch's "History of X" / "Timeline of X" pages whose years overlap the window, with links) and `lookups` (Library of Congress, Smithsonian, Europeana, OpenAlex hits). **Unread suggestions, not evidence.** |

Look things up with `GET branches/<slug>` (the branch's events and metrics), `GET entries/<slug>` and
`GET search?q=…&kind=event`.

## 2. Find what happened

Start with the pointers' Wikipedia sections, then the branch's own article and cited pages, then the history of its
parents and the branches its events link to. Ask: what in this window would a reader of a world timeline miss on
this branch? A change of government, a war or treaty, a founding, a law, a disaster, a turning point in a movement,
a landmark work.

- **Check duplicates first.** `GET search?q=<key words>&kind=event` for each candidate event: the same happening may
  sit on a parent, a neighbor or a linked branch. If it does and belongs there, don't copy it; say so in a note, or
  write the branch's own side of it with `link` to the other branch.
- **One to three events.** Prefer the window's landmark (`imp` 1 or 2) over details. Spread them across the window
  where you can. Never pad: two good events beat three thin ones.
- **Nothing notable.** If, after reading, nothing in the window is both notable and sourceable for this branch (a
  quiet decade, or what happened is already on another branch and belongs there), complete with
  `nothing_notable` and a note saying what you searched and read. The job then leaves this window alone for months.

## 3. Read and cite

- **Copy excerpts from the evidence pack's stored text when the page is in it** (above); otherwise **from the page itself, never from a fetch tool's summary.** Tools such as WebFetch hand back a
  model-written summary of the page, and the "quotes" in it are often paraphrased, shortened or straightened. For
  every excerpt (and every stance you record), read the page's own text: the in-app browser's `get_page_text`, or
  `javascript_tool` returning the matching sentence from `document.body.innerText`, or the raw page via `curl` where `GET policy` says `may_fetch` and
  the site allows scripts. Then copy the sentence character for character. If only a summary is reachable, cite the
  page without an excerpt and say so in your note. Every review round so far has had to re-copy summarized excerpts.
- **Fetch and read every page you cite** (SCHEMA citation rule 1). A `browser_only` publisher (Britannica, un.org,
  nobelprize.org, the Guardian, BBC …) is read in a browser, never by script; mark that cite
  `"method": "browser_read"`. Never openstax.org (the API refuses it).
- **At least one non-Wikipedia source** for each event, that explicitly supports its date and every claim: a
  national archive, a university or museum page, a reputable encyclopedia, a peer-reviewed paper, an official
  history. Wikipedia alone holds the event at review (the publishing rule, ADR 0010).
- **Excerpts are verbatim**, at most 25 words, copied from the page character for character: curly apostrophes and
  quotes, dashes and accents exactly as the page has them. The review rounds caught paraphrased and "straightened"
  excerpts (an excerpt with ' where the page has ’ fails); copy, don't retype.
- **Attribute contested claims.** Death tolls, dates scholars dispute, judgments: say whose figure it is ("the
  government put the toll at …; other estimates were far lower") and give the range when sources differ.

## 4. Write it in SCHEMA style

- `id`: the branch's existing prefix (`branch.id_prefixes[0].prefix`) plus a short slug, e.g. `ga10-ng-civil-war`.
  Where a prefix covers many countries, it already carries a two-letter code (`n92-sn`); keep it. Check the id is
  free with `GET entries/<id>` (a 404 is what you want).
- `branch`: the task's branch. An event that involves another branch gets `link` to it (one link).
- `y`: inside the window; fractions for a known month or day (`1960.75` ≈ October 1960). `when`: as the source
  supports it ("October 1, 1960", "c. 1350", "1914–1918"); `end` for an event with duration.
- `title`: at most 60 characters. `text`: one or two sentences, at most 240 characters, neutral, every claim in it
  supported by the cites. American English; dates as "April 12, 1861".
- `imp`: 1 landmark, 2 notable, 3 detail. `geo`: a place (lat, lon, `r` 30–150 km, `label`, `src` a Wikipedia page
  whose coordinates are the place) when the event has one.

## 5. Complete

```bash
cat > /tmp/result.json <<'JSON'
{"result": {"decision": "written", "sources_read": ["https://…", "https://…"], "note": "",
  "events": [
    {"id": "<prefix>-<slug>", "branch": "<task branch>", "y": 1960.75, "when": "October 1, 1960",
     "title": "…", "text": "…", "imp": 1, "link": "<other branch, optional>",
     "cites": [{"t": "…", "u": "https://…", "k": "archive", "excerpt": "≤ 25 words, verbatim"},
               {"t": "… — Wikipedia", "u": "https://en.wikipedia.org/wiki/…", "excerpt": "…"}],
     "geo": {"scope": "place", "lat": 9.06, "lon": 7.49, "r": 50, "label": "…", "src": "https://en.wikipedia.org/wiki/…"}}]}}
JSON
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/complete" -d @/tmp/result.json

# or, when nothing belongs there:
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/complete" \
  -d '{"result": {"decision": "nothing_notable", "note": "Read History of X (1960s section), Y archive and Z; the only events are …, already on <branch>."}}'
```

Each event is created with status `review`, with its record claim, one evidence row per cite (checked by you, with
your excerpt), its location and link; every row leaves a Revision linked to the task, and the slugs go in
`result.entries`. The owner reviews and publishes them (`manage.py facts publish <slug>`), and the next release
carries them. Until then the window still counts as a gap, so the job leaves it alone for `retry_after_days`
(`governance/waves.py`); once an event is published there, the gap is gone.

Before you finish a round, re-read your events against `before` and `after`: the branch should now read as one
story through the window.
