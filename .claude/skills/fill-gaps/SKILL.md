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

- **Copy excerpts from the page itself, never from a fetch tool's summary.** Tools such as WebFetch hand back a
  model-written summary of the page, and the "quotes" in it are often paraphrased, shortened or straightened. For
  every excerpt (and every stance you record), read the page's own text: the in-app browser's `get_page_text`, or
  `javascript_tool` returning the matching sentence from `document.body.innerText`, or the raw page via `curl` where
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
