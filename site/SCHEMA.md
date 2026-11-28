# Timeline data schema

All content lives in Postgres and reaches the page as a release snapshot, `{"branches": [...], "events": [...]}`, in
the shape below (`canonical.mjs`, `publish/content.py`); `node build.mjs --from-json <snapshot> --check` validates
one, and without `--check` also writes `timeline.html`. The content was first written as JavaScript files calling
`TL.add({ branches: [...], events: [...] })` and the other `TL.*` forms described here; those files are frozen in
`archive/site-data/` since the cutover (ADR 0021), and each `TL.*` form maps onto the snapshot's keys.

## Dates

All positions are **calendar years as numbers**: positive = CE, negative = BCE / years ago.
Deep time is written the same way: 13.8 billion years ago is `-13.8e9`; 300,000 years ago is `-300000`.
Fractions are allowed for precise modern dates (`1969.55` ≈ July 1969).
The human-readable date always goes in a separate string (`when`, `startWhen`, `endWhen`),
written exactly as the source supports it: "c. 3100 BCE", "4.54 ± 0.05 billion years ago", "20 July 1969".

## Branch (a society, polity, lineage, tradition or long-running era)

```js
{
  id: "roman-republic",            // kebab-case, globally unique across all files
  name: "Roman Republic",
  region: "europe",                // cosmos | life | humans | global | faiths | mideast | europe | africa | southasia | eastasia | americas | oceania
  start: -509, end: -27,           // end: null if it continues to today
  startWhen: "509 BCE", endWhen: "27 BCE",
  parents: ["roman-kingdom"],      // branches it diverged from / was formed out of (drawn as a split)
  into: ["roman-empire"],          // branches it became or merged into when it ended (drawn as a merge)
  text: "One or two sentences, ≤ 240 characters, every claim supported by cites.",
  cites: [{ t: "Roman Republic — Encyclopaedia Britannica", u: "https://www.britannica.com/place/Roman-Republic" }]
}
```

## Event

```js
{
  id: "an-caesar-assassinated",    // file prefix + slug, globally unique
  branch: "roman-republic",        // any branch id from any file
  y: -44, end: undefined,          // optional `end` for an event with duration (a war, a reign)
  when: "15 March 44 BCE",
  title: "Julius Caesar assassinated",   // ≤ 60 characters
  text: "One or two sentences, ≤ 240 characters.",
  imp: 1,                          // 1 = landmark (shown at wide zoom), 2 = notable, 3 = detail
  link: "other-branch-id",         // optional: a contact / blending / conflict with another branch at this moment (drawn as a dashed connector)
  cites: [{ t: "…", u: "https://…" }]
}
```

Snapshots from Postgres (`manage.py publish`) may also carry `singleSource: true` on an event: everything that
supports its facts comes from one independent publisher (Wikipedia counts as one). It is derived at publish time
from the evidence, never stored as content; the event panel shows it as a quiet "Single source" note (ADR 0018).

## Extra sources for an existing entry

```js
TL.cite("me-hastings", "Battle of Hastings — Encyclopaedia Britannica", "https://www.britannica.com/event/Battle-of-Hastings"); // what the page states
```

Appends a citation to a branch or event defined in another file (the build rejects unknown ids).

## Origins: where a branch came from

```js
TL.origin("ghana", {
  note: "≤ 300 chars, plain words: who the people were and what this branch grew out of (named even when no branch fits).",
  links: [
    { id: "uk", how: "independence", note: "≤ 100 chars: Gold Coast colony won independence from Britain in 1957" },
    { id: "ashanti", how: "peoples", note: "The Asante kingdom was annexed into the Gold Coast in 1902" },
  ],
  cites: [{ t: "…", u: "https://…" }],   // supports the note and every link
});
```

`how` is one of `independence` (won independence from), `split` (broke away from), `successor` (the state it replaced),
`merger` (formed by uniting with), `conquest`, `peoples` (the peoples or cultures it came from), `context` (grew out of an era or crisis, e.g. the nuclear age out of World War II), `ideas` (intellectual or
religious roots) and `reaction` (arose in opposition to). Each link is added to the branch's `parents`, so it is drawn as
a split or succession; `peoples`, `context`, `ideas` and `reaction` links are drawn lighter than political lineage. The side panel
shows the note and the links under "Origins", and the canvas writes the most direct link (e.g. "independence from United
Kingdom") just before the branch's start. A branch may have one `TL.origin`; `links: []` is allowed when nothing earlier
is a branch.

## Restructuring: move, patch, merge

```js
TL.move("event-id", "new-branch-id");                    // the event now sits on another branch
TL.patch("branch-or-event-id", { start, end, startWhen, endWhen, name, text, region, parents, into, addCites: [...] });
TL.merge("old-branch-id", "into-branch-id");             // repoint every reference to the old branch, then remove it
```

These let a later data file split, merge or re-date branches without editing the files that defined them (see
`restructure.mjs`). Patches apply first, then merges, then moves; two files moving the same event to different branches
is an error. Any changed date or claim needs its citation (`addCites`).

## Context: why it matters, and connections

```js
TL.enrich("me-magna-carta", {
  why: "2–4 sentences (≤ 700 chars): what this meant for its branch and for the bigger picture.",
  connections: [{ id: "me-us-constitution", note: "≤ 90 chars: how the two are linked" }],
  cites: [{ t: "…", u: "https://…", k: "primary" }],   // supports every sentence of `why` and every note
});
```

Connections may point at events or branches. Keep the tone neutral: attribute judgments ("historians call…"), give the
range of views where they differ, and don't draw a connection the sources don't make.

Optional citation kind `k`: primary, textbook, paper, museum, archive, reference, encyclopedia, news, data (shown as a
label in the panel; Wikipedia and Britannica are labeled encyclopedia automatically).

## Location (for the globe)

```js
TL.geo("me-hastings", { scope: "place", lat: 50.91, lon: 0.49, r: 40, label: "Hastings, England", src: "https://en.wikipedia.org/wiki/Battle_of_Hastings" });
TL.geo("roman-empire", { scope: "region", lat: 41.9, lon: 12.5, r: 2500, label: "Roman Empire", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("ww2-ends", { scope: "global" });
TL.geo("solar-system", { scope: "cosmic", scale: "solar-system" });   // or "galaxy", "universe"
```

- `place`: a city, site or battlefield (`r` 30–150 km). `region`: a country, empire, sea or basin, with `r` roughly covering it.
  `global`: worldwide. `cosmic`: before Earth or beyond it; the panel shows a nested-scale diagram instead of a globe.
- `src` is a Wikipedia page whose own coordinates are the place meant (the place, or a battle or site page that has coordinates). `node verify-geo.mjs --apply` re-reads those
  coordinates from the Wikipedia API and corrects `lat`/`lon`; run it after adding locations.
- Choose the place the text names; with none, use the branch's country or region. Don't guess beyond the text.
- Give every event a location. One without (or with `lat`/`lon` the page can't use) still gets a globe for its date, but
  with no marker and the caption "Location data not found", and the build warns.

## Image

```js
TL.image("me-hastings", { src: "images/me-hastings.jpg", w: 480, h: 220, title: "…", credit: "Artist, date",
  license: "Public domain", page: "https://commons.wikimedia.org/wiki/File:…" });
```

Written by `fetch-images.mjs`, not by hand. Only images whose Wikimedia Commons license is public domain or CC0 are
accepted (the build rejects anything else), and never AI-generated or AI-"restored" imagery: candidates in AI-related
Commons categories or dated 2020 or later are dropped, and the chooser is told to prefer contemporary artworks,
artifacts, documents and photographs, then later historical artworks and maps, and to leave the slot empty when unsure.

## Style

Standard American English: American spelling (-ize, -or, center, defense), dates as "April 12, 1861", "April 26–29, 1994", "c. 3100 BCE", and double quotation marks “like this”. Proper names keep their own spelling (Tyre, the Labour Party, HMS Endeavour, Organisation of African Unity), and citation titles stay exactly as the source has them.

## Citation rules (non-negotiable)

1. Every `cites` entry must be a page you actually fetched and read in this session.
2. The page must explicitly support the date and every factual claim in `when`/`title`/`text`
   (and `start`/`end`/`parents`/`into` for branches). If it only supports part, add a second source or cut the claim.
3. Where scholars disagree, say so ("c.", "by", "debated: 50,000–65,000 years ago") and pick the value the source gives.
4. Prefer reputable institutional or scholarly sources (NASA, ESA, Smithsonian, Natural History Museum,
   Britannica, UNESCO, Library of Congress, national archives, museum timelines such as the Met's Heilbrunn
   Timeline, Office of the Historian, UN, EU, Nobel Prize, peer-reviewed papers). Wikipedia is acceptable as a
   source when it explicitly states the claim; aim for at least one non-Wikipedia source where one is reachable.
5. Use the most specific stable URL (article, not a search page). `https://` only.
6. Never cite a URL from memory without fetching it. If a page fails to load, use another source.
7. Don't read or cite openstax.org: its terms forbid use of its textbooks by AI systems. Use other open textbooks
   (for example LibreTexts or university presses), primary documents and papers instead.
