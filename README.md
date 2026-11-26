# Humanitributary

<!-- The product's name lives here, in config/settings.py SITE_NAME and in site/template.html, nowhere else. -->

An interactive, cited timeline of all history, from the Big Bang to today: about 380 branches (peoples, states, faiths, ideas, cultures) and 5,400 events, every one cited. This repository is its data platform: Postgres holds the content and the evidence behind every fact, scheduled deterministic jobs will feed a review queue that Claude agents drain, and each release is a static snapshot the single-file site is built from.

**Start with [AGENTS.md](AGENTS.md)** for how it's put together and the rules that keep it that way, [docs/data-model.md](docs/data-model.md) for every table, and [docs/adr/](docs/adr/) for the decisions behind both.

## How it fits together

```
                                                    Postgres ◀── agents (work queue), jobs (ingest, governance)
                                                                 │
                                                              publish
                                                                 ▼
                       var/releases/<version>/content.json ──(build.mjs --from-json)──▶ site/timeline.html ──▶ CDN
```

The public page never touches the database (ADR 0001). Every change to canonical content goes through `revisions.revising()` and leaves a Revision, enforced by a Postgres trigger (ADR 0006). Postgres is the only source of truth: the content files the site was first written in are frozen in `archive/site-data/` since the cutover, and the page is built only from releases (ADR 0021). A snapshot loaded into an empty database exports to the same bytes (ADR 0007).

| App | What it does |
|---|---|
| `timeline` | Canonical content: branches, events, their links, locations, images, connections. |
| `evidence` | Publishers (rated 1–4), citations, claims and the evidence tying them together, with computed confidence. |
| `revisions` | The audit log of every canonical change, and `revising()`, the only way to make one. |
| `ingest` | Feeds, fetch runs, documents and their versions, Wikidata entities, routing to branches, and candidates. |
| `work` | The agents' task queue, with leases (`manage.py tasks`). |
| `governance` | Branch metrics and proposals (tables only, for now). |
| `publish` | Releases, their gates, the snapshot export and the loader (`import_legacy`). |

## Running it

```bash
make env       # .env with a random local-only Postgres password
make db        # Postgres 16 in Docker on localhost:5433 (Postgres.app keeps 5432)
uv sync
make migrate
make import-archive  # an empty database: the frozen legacy content (archive/site-data) → Postgres
make publish   # Postgres → a release (releases/<version>/content.json in the object store)
make build && open site/timeline.html   # from the latest release
make roundtrip # the release gates on your content, writing nothing
make test
uv run python manage.py createsuperuser && make serve   # the admin, the review screen: http://localhost:8000/admin/
```

`make help` lists every command.

## The site (`site/`)

A single, zoomable, cited timeline from the Big Bang to today. Build it from the latest release (`make build`) and open **`site/timeline.html`** in any browser; it is self-contained and works offline (source links need a connection).

- Each colored line is a branch: a society, polity, lineage, faith or long-running movement. Curves show where branches split off, merge or turn into one another; dashed lines mark contact or blending between two branches.
- Time is logarithmic (years before now + 40), so deep time compresses and the last century gets the most room. To keep that visible, the axis labels each gap between dates with the time it spans, a row under the overview gives the date at the left edge, center and right edge of the window, and a true-scale strip above it shows the current view at real proportions (the last century is about 1/120 millionth of all time).
- Trackpad: scroll up/down to move between branches, sideways to move through time, pinch to zoom. Mouse: wheel moves between branches, Shift+wheel moves through time, Ctrl/⌘+wheel or double-click zooms. Drag to pan. `←`/`→` step along a branch (and on into its successor), `↑`/`↓` switch to the nearest branch at the same moment, `0`–`8` jump to eras, `/` searches. The URL hash links to the selected event or branch (`timeline.html#me-hastings`, `timeline.html#roman-empire`). "All time" is centered on exactly 1 million years ago at any window width. On phones the details open as a bottom sheet in portrait (tap or swipe its grip to expand, swipe down to close) and as a narrower side panel in landscape. Click empty space, press `Esc` or use the panel's × to clear the selection and close the side panel; `?` or the Guide button brings back the guide.
- Selecting something highlights its period as a column across every lane (an event with a duration, or a whole branch when you select its start or end), shows its length on the date axis, and fades branches unrelated to it.

### Data and sources

The content lives in Postgres (schema and citation rules in `site/SCHEMA.md`). It was first written as JavaScript files, one per era, now frozen in `archive/site-data/`; the file names below are those. Every branch and event cites pages that were fetched and read when the entry was written; dates and wording follow the source, and contested dates are labeled as such.

A full audit (November 2026) checked all 905 entries against their cited pages: every date, every claim, every "grew out of / became" link. 835 were fully supported; 51 partly supported and 3 contradicted by a source were reworded to match their sources (for example the Sharpeville death toll, how the Falklands War ended, and Egypt's 1922 independence, which Britain declared); 16 could not be read by automated tools (un.org, nobelprize.org) and were checked by hand in a browser instead. The same audit added 60 missing entries (21 branches, 39 events) such as Stonehenge, dog and horse domestication, the Bantu expansion, the Hittites, the Renaissance, Sikhism, the Chola and Maratha empires, the Spanish Civil War, the Vietnam War, the Iraq and Afghanistan wars and the Cambodian genocide, each checked by a second auditor. An earlier spot-check of 56 random entries had found 51 supported and 5 partial (since fixed).

Many reputable publishers (Britannica, UNESCO, World History Encyclopedia, several national archives) block automated fetching, so a large share of citations are Wikipedia articles; the rest are institutional sources such as the US Office of the Historian, NASA, the Smithsonian, the EU, the UN, WHO, the Nobel Prize site and the Stanford Encyclopedia of Philosophy.

Landmark events were then given a second, non-Wikipedia source: each Britannica article was opened in a browser and the passages with the dates and key facts were read before it was added (`archive/site-data/9-britannica.js`, which notes what each page states). 124 of the 126 landmark events now cite a non-Wikipedia source; the two exceptions (founder-crop domestication, Deng's 1978 reforms) had no Britannica page that stated the claim. Where Britannica differed from the original source the entry was reworded to fit both (siege of Constantinople "nearly two months"; Enabling Act vote) or the difference is shown (Rigveda date). Britannica sometimes gives different estimates for figures such as death tolls; those added citations back the event and its date, while the specific figure in the text rests on the first source.

### Context, density and the 2026 expansion

A second round (November 2026) added about 1,650 events and the philosophy branches, so that every branch still active since 1926 has at least one or two entries in each five-year window wherever the sources support it, and merged short-lived states into regional groups (for example the post-Yugoslav states and the South Caucasus). Every added event was audited against its cited pages by a second agent: in each batch 8–14% were partly supported and were reworded or given another source, none was contradicted, and duplicates across batches were merged. The **Why it matters** paragraphs (425 entries) and their 925 **Connections** were audited the same way; notes a source didn't support were cut.

Sources were widened beyond encyclopedias to primary documents (treaty and constitution texts, the Rosetta Stone and other museum objects, Darwin Online), open-access and public-domain papers, open textbooks, museum and archive pages and statistical agencies; each citation shows its kind in the panel. 1,086 of 4,255 citations are non-Wikipedia. OpenStax textbooks are not used, because their terms forbid use by AI systems. Weak spots remain: late-medieval context and many of the newer events lean on Wikipedia (several institutional sites refuse automated readers), and a few windows are thin where sources are scarce (Belgian Congo 1935–39, DR Congo 1985–89, some decades on faith branches, the Non-Aligned Movement in the 2000s, the Warsaw Pact in the 1970s).

### The overnight expansion (November 2026)

A third round filled the timeline backward from today in six waves (1925–now, 1800–1925, 1500–1800, 1000–1500,
1000 BCE–1000 CE, 3500–1000 BCE), adding about 2,650 events in `archive/site-data/79-culture-branches.js` and `archive/site-data/80-*`–`85-*`
(4,938 events in all). Each wave targeted the empty time windows of every branch, plus culture-focused passes by region
for 1900–today and 1800–1925, and a new region, **Arts, culture & sport**, with twelve cross-border branches (Romanticism
to video games). Roughly a third of the additions are cultural. Every file was then audited by a second agent against
its cited pages (dates and every claim; unsupported superlatives and invented specifics were cut, duplicates removed,
non-Wikipedia sources added); three partial audits were redone in full, and a domain scan replaced about 20 citations to
blogs and aggregators. About 4% of the new events still cite only Wikipedia — mostly ancient entries where no other
reachable source stated the claim. See `site/OVERNIGHT-REPORT.md` for the full account and branch suggestions.

### Origins

No branch starts out of nothing. Every branch now either has a parent or a sourced **Origins** note (`archive/site-data/16*-origins-*.js`, `archive/site-data/17*-predecessors-*.js`; schema in `site/SCHEMA.md`): who its people were and what it grew out of, named in plain words even when the predecessor is not a branch. 165 branches carry such a note, and 127 of them also link to the earlier branches they came from, with the kind of link: independence from (20), successor to, broke away from, union of, conquest, peoples and roots, grew out of, ideas it built on, or in reaction to. 33 predecessors that were missing were added as branches, each with its own origin, location and one to three events — among them the First World War, Belgium, the Germanic peoples, the Picts and Dál Riata, the Etruscans, Navarre, Anglo-Saxon England, the Visigoths, Asturias and León, medieval Poland and Lithuania, the Kingdom of Sardinia, Dʿmt, Ife, the Tichitt tradition, Denkyira, the Naqada culture, the Canaanites, Israel and Judah, the Pallavas, Ghaznavids and Ghurids, Afsharid Iran, the Deccan sultanates, Funan, Chenla, Singhasari, Gojoseon, the Yuezhi, the Viceroyalties of New Granada and the Río de la Plata, and the Dutch East Indies.

On the canvas the most direct link is written just before each branch's start (e.g. "independence from United Kingdom"); links between regions are drawn fainter unless one end is selected. The side panel lists the links by kind with a one-line note each. Weak spots: 38 origins are note-only — the deepest roots (the universe, Bantu and Nok origins, the Xiongnu, the newly added ancient predecessors) and modern phenomena with no branch-shaped parent (HIV/AIDS, COVID-19) — Every origin and every added branch now has at least one non-Wikipedia source (mostly Britannica, read through the in-app browser because Britannica refuses automated fetchers; also the Stanford and Internet Encyclopedias of Philosophy, World History Encyclopedia, the Office of the Historian and others), except Yamnaya, for which no reachable non-Wikipedia page was found. Several second sources support the main claims but not every detail, and where they disagree the note gives both (Navarre c. 798 or 824, the Kingdom of Ireland 1541 or 1542, Nok c. 1500 or c. 500 BCE).

### Globe and images

Every entry has a location (1,494 places, 908 regions, 137 worldwide, 12 cosmic). The panel shows a small spinning globe centered on it with the place marked. The globe depends on the entry's date:

- **Last 12,000 years:** present-day coastlines (Natural Earth, public domain).
- **12,000 years to 540 million years ago:** the nearest PALEOMAP PaleoDEM reconstruction (Scotese & Wright 2018, CC BY 4.0, doi:10.5281/zenodo.5460860; slices at 0, 20, 35, 50, 65, 100, 150, 200, 250, 300, 350, 400, 450, 500 and 540 Ma), drawn in four elevation classes. Markers sit where the place lay at that slice's age, reconstructed with the same plate model (PALEOMAP) through the GPlates Web Service (`gws.gplates.org`, University of Sydney) by `build-paleo-points.mjs`; when no reconstruction exists (crust that did not exist yet, or a new entry since the last run) the marker falls back to the present-day location and the caption says which it is.
- **Ice ages** in that span are overlaid as approximate ice, and the caption says "ice extent approximate": the Andean-Saharan (c. 460–420 Ma) and Late Paleozoic (c. 360–260 Ma) ice ages as ice on land past 58°S/54°S paleo-latitude on that map; the Antarctic ice sheet from 33.9 Ma; the Quaternary from 2.58 Ma as Antarctic and Greenland ice plus, faint, the Last Glacial Maximum ice sheets; and the LGM itself (c. 26,000–19,000 years ago) as solid ice sheets with the coastline redrawn for a sea 120 m lower (Beringia, Sundaland, Sahul, Doggerland). The LGM outlines are coarse polygons drawn by hand from the limits the sources below describe. The openly published Batchelor et al. (2019) reconstructions were considered, but their shapefiles (on OSF) carry no license, so they are not used. An entry with a date range shows an ice age (or a deep-time stage) that covers at least 40% of it, so the Great Oxidation Event shows the Huronian glaciation.
- **4.54 billion to 540 million years ago:** no maps exist, so the globe paints an **artist's impression** of the stage, generated in the browser from noise (no image generators, no external images) and captioned "artist’s impression (AI-assisted render), not a map". Places are not marked on these, since where they lay is unknown. Stages: molten Hadean Earth with a magma ocean after the Moon-forming impact (4.54–4.46 Ga); a Hadean water world with volcanic islands (4.46–3.6 Ga); Archean Earth with the first small cratons under an orange methane haze (3.6–2.4 Ga); the Huronian glaciation (2.4–2.1 Ga); the supercontinent Columbia/Nuna (2.1–1.3 Ga) and then Rodinia (1.3 Ga–720 Ma), the "boring billion"; the Sturtian (717–660 Ma) and Marinoan (650–635 Ma) Snowball Earths with the Cryogenian interglacial between; and the Ediacaran (635–539 Ma). Land shapes are schematic and unlabeled.
- **Before Earth existed, or beyond it:** a nested scale diagram (Solar System, Milky Way, observable universe).

**Outlines of states and empires (3400 BCE to today).** Instead of a radius circle, entries tied to a state show its outline at that date: the branch itself (its start, end, or any moment along it) and its events whose region is the state, centered on the outline and captioned e.g. "Approximate extent of the Ming dynasty in 1500 · Cliopatria (CC BY 4.0)". An event at a place inside the state (a battle, a city) keeps its own pin, with the state's outline faint behind it for context. The outlines are polygons from [Cliopatria](https://github.com/Seshat-Global-History-Databank/cliopatria) v0.2.2, the Seshat Global History Databank's dataset of polities from 3400 BCE to 2024 CE ([Scientific Data, 2025](https://doi.org/10.1038/s41597-025-04516-9); data [doi:10.5281/zenodo.13363120](https://doi.org/10.5281/zenodo.13363120)), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (license checked in the repository's LICENSE.md and on Zenodo); they are simplified for the globe (Douglas–Peucker at 0.14°, holes and islands under 2,500 km² dropped, coordinates rounded to 0.1°), which the caption notes. Cliopatria is one reconstruction among several and historical borders are uncertain, so the caption always says "approximate". A few groups and states without a Cliopatria outline for the date (the Baltic states, the South Caucasus, the former Yugoslav states, and New Zealand, the Philippines and South Africa before Cliopatria's first outline of them) use present-day borders from [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) 1:50m admin-0 countries (public domain), captioned "present-day borders of …". Branches are matched to polities by a hand-checked table in `build-outlines.mjs` (a new branch is matched automatically only on an exact, unique name that covers at least half its span); a region event whose label exactly names a polity existing that year, and whose point lies inside it, gets that polity's outline. Anything ambiguous keeps the radius circle: cultures, faiths, movements, Spanish viceroyalties (not separate polities in Cliopatria), and states smaller than about 15,000 km² (a pin reads better). Where Cliopatria's dates start or end up to 15 years from a branch's, the nearest outline is used and the caption gives its year (e.g. the Ming dynasty's start in 1368 shows "in 1375").

Sources for the stages and ice ages (each read for this): Wikipedia's [Hadean](https://en.wikipedia.org/wiki/Hadean), [Giant-impact hypothesis](https://en.wikipedia.org/wiki/Giant-impact_hypothesis), [Archean](https://en.wikipedia.org/wiki/Archean), [Huronian glaciation](https://en.wikipedia.org/wiki/Huronian_glaciation), [Boring Billion](https://en.wikipedia.org/wiki/Boring_Billion), [Cryogenian](https://en.wikipedia.org/wiki/Cryogenian), [Ediacaran](https://en.wikipedia.org/wiki/Ediacaran), [Andean-Saharan glaciation](https://en.wikipedia.org/wiki/Andean-Saharan_glaciation), [Late Paleozoic icehouse](https://en.wikipedia.org/wiki/Late_Paleozoic_icehouse), [Quaternary glaciation](https://en.wikipedia.org/wiki/Quaternary_glaciation) and [Last Glacial Maximum](https://en.wikipedia.org/wiki/Last_Glacial_Maximum); [snowballearth.org: “When did it happen?”](https://www.snowballearth.org/when.html); Batchelor et al. (2019), [The configuration of Northern Hemisphere ice sheets through the Quaternary](https://doi.org/10.1038/s41467-019-11601-2), Nature Communications 10:3713 (CC BY 4.0), and its [data notes](https://osf.io/7jen3/). The intervals match the timeline's own entries (e.g. `cl-sturtian`, `cl-marinoan`, `cl-antarctic-ice`, `ho-last-glacial-maximum`).

Globe assets are rebuilt with `node site/build-globe.mjs` (land, PaleoDEM slices and the LGM coastline into `globe-assets.json`) and then `node site/build-paleo-points.mjs` (queries the GPlates Web Service for every located entry dated on a paleo slice, 60 points per request with a pause between requests, cached in the gitignored `.paleo-cache.json`, and stores the positions in `globe-assets.json` as `pts`); rerun the second after adding located deep-time entries, then `node site/build.mjs`. Outlines are rebuilt with `node site/build-outlines.mjs` (downloads Cliopatria and Natural Earth once into the gitignored `.outline-cache/`, matches branches and events, writes `outlines.js` and prints a report; rerun it after adding branches or events, `--verbose` lists every match). Coordinates were checked against Wikipedia's coordinates with `verify-geo.mjs`.

488 entries have an image (about 27 MB in `images/`): branches, landmark events and notable events. Images are public domain or CC0 only, from Wikimedia Commons, each credited and linked to its Commons page. Picks were made from Commons metadata and then reviewed by hand; about one in twelve was rejected (modern reconstructions, memorials standing in for events, amateur maps, logos, wrong-event photos, doubtful licenses), and non-English or catalog-style captions were rewritten in English. Some photographs of atrocities and disasters (e.g. Sharpeville, Nanjing, the Holodomor) are shown as the historical record they are. No AI-generated or AI-altered imagery is used: candidates in AI-related categories or dated 2020 or later are excluded, the chooser prefers contemporary artworks, artifacts, documents and photographs, and entries with no clearly fitting image have none.

Selected entries also carry a short, sourced **Why it matters** paragraph and **Connections** to related moments elsewhere on the timeline (drawn as dashed arcs when the entry is selected); see `archive/site-data/20-context-pilot.js`. Search groups its results into branches (jumps to the branch's beginning), periods (shows the whole span) and events (centers the moment with context that scales with its age).

### Rebuilding

```bash
make release-pull                       # mirror the latest release into var/releases/latest/
node site/build.mjs --from-json var/releases/latest/content.json --check   # validate it (ids, references, citations, dates)
node site/build.mjs --from-json var/releases/latest/content.json           # regenerate site/timeline.html (make build)
node site/build-globe.mjs               # rebuild globe-assets.json (Natural Earth land + PaleoDEM textures)
node site/build-outlines.mjs            # rebuild outlines.js from the latest release (Cliopatria polity outlines; report of matches)
node site/build-paleo-points.mjs        # paleo positions for located deep-time entries in the latest release
```

The tools that audited and rewrote the legacy files (`sample-cites.mjs`, `apply-fixes.mjs`, `apply-enrich-fixes.mjs`, `verify-geo.mjs`, `image-candidates.mjs`, `fetch-images.mjs`) are retired in `archive/site-tools/`: content changes go through the database now (ADR 0021).

The globe data and images live next to `site/timeline.html` (`globe-assets.json` is inlined; `images/` and `outlines.js` must be kept alongside the page — `outlines.js`, about 1.5 MB, is loaded with a script tag when the page is idle, and without it the globe simply shows radius circles).
