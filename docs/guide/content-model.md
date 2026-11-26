---
title: The content model
summary: The tables that hold what the timeline says (branches, events, their links, places and pictures), how dates and order are stored, and the service layer every write goes through.
order: 20
covers:
  - timeline/**
  - "!timeline/migrations/**"
  - site/SCHEMA.md
  - site/canonical.mjs
  - site/template.html
---

The timeline is made of branches (a people, state, faith, idea or era, drawn as a
lane that starts, splits, merges and ends) and events (moments or spans on a
branch). This chapter covers the tables in `timeline/` that hold them, how their
dates and order are stored, and the small set of functions every write goes
through.

Every table here is **canonical**: it holds the content readers see, and it
accepts writes only inside `revisions.revising()`, each one recorded (see
[revisions](revisions.md)). The field-level detail is in each model's
`help_text` in `timeline/models.py`. [The data model](../data-model.md) has
every table and an entity diagram. The authoring rules for content (lengths,
citation rules, style) are in [site/SCHEMA.md](../../site/SCHEMA.md).

## The tables at a glance

| Model | Name in the legacy files (`archive/site-data/`) | What it holds |
|---|---|---|
| `Region` | `region` | A lane group on the page (cosmos, life, humans, global, faiths, culture, mideast, europe, africa, southasia, eastasia, americas, oceania), with a name and `position`. |
| `Entry` | `id` | Anything with an id: the shared part of a branch or an event. |
| `Branch` | `TL.add({branches})` | A lane: `name`, `region`, `start`/`end`, dates as written, origin note. |
| `Event` | `TL.add({events})` | A moment or span on a branch: `title`, `y`/`end`, `when`, `imp`. |
| `BranchLink` | `parents`, `into`, `TL.origin` links | A branch's link to another branch. |
| `EventLink` | `link` | An event's contact or conflict with another branch (a dashed connector). |
| `Connection` | `TL.enrich` connections | A sourced link from one entry to another. |
| `Location` | `TL.geo` | Where an entry happened, for the globe. |
| `PaleoPin` | `site/globe-assets.json` `pts` | Where a present-day point lay millions of years ago. |
| `Image` | `TL.image` | A public-domain or CC0 picture from Wikimedia Commons. |

Citations are not in this app. An entry's sources are `Claim` and `Evidence`
rows in `evidence/` that point at the `Entry` (see
[evidence and fact-checking](evidence-and-fact-checking.md)).

## Entries: one id namespace for branches and events

`Entry` holds what branches and events share. `Branch` and `Event` are Django
multi-table children of it: each branch or event is two rows, one in
`timeline_entry` and one in `timeline_branch` or `timeline_event`, with the same
primary key (the child's `entry_ptr_id`).

| Field | Meaning |
|---|---|
| `slug` | The stable id (the legacy `id`). Kebab-case (`SLUG_RE`: `^[a-z0-9][a-z0-9-]*$`), unique across both kinds. |
| `kind` | `branch` or `event`. Set by `Branch.save()` / `Event.save()`, never edited. |
| `status` | `draft` (the default), `review`, `published` or `retracted`. Only `published` reaches a snapshot (see [publishing](publishing.md)). |
| `text` | One or two sentences, every claim supported by the entry's citations. |
| `why` | "Why it matters" (`TL.enrich`). Blank means the entry has none. |
| `sort_key` | Its place in the snapshot's order (see [How entries are ordered](#how-entries-are-ordered)). |
| `created_at`, `updated_at` | Set by Django. `created_at` starts the current-events grace period in the publishing rule. |

Because the namespace is shared, anything that can point at "an entry"
(claims, locations, images, connections) has a foreign key to `Entry`, not to
`Branch` or `Event`. `Entry.concrete` returns the `Branch` or `Event` behind an
entry. The legacy import refuses a dump in which a slug changes kind
(`publish/legacy.py` `LegacyImportError`).

### Branch fields

| Field | Meaning |
|---|---|
| `name`, `region` | Its label and lane group. `region` is protected: a region with branches can't be deleted. |
| `start`, `end` | Calendar years as doubles (see [How dates are stored](#how-dates-are-stored)). `end` null means it continues to today. A check constraint requires `end > start`. |
| `start_when`, `end_when` | The dates as the source writes them ("509 BCE"). `end_when` keeps null and `""` apart, because the snapshot does (a null `end_when` writes no `endWhen` key; `""` writes `"endWhen": ""`). |
| `start_precision`, `start_approximate`, `start_date` and the `end_` trio | Derived from the text (see below). Read-only in the admin. |
| `origin_note` | `TL.origin`'s note. Null means the branch has no origin block; an empty `links` list is allowed. |

### Event fields

| Field | Meaning |
|---|---|
| `branch` | The branch it sits on (protected). |
| `title` | ≤ 60 characters by the style rules. |
| `y`, `end` | Calendar years as doubles; `end` for an event with duration (a war, a reign). A check constraint requires `end > y`. |
| `when` | The date as written ("15 March 44 BCE"). |
| `precision`, `approximate`, `date`, `end_date` | Derived from `when`. |
| `imp` | 1 = landmark (shown at wide zoom), 2 = notable, 3 = detail (constraint `event_imp_1_to_3`). |

Two trigram indexes (`branch_name_trgm`, `event_title_trgm`) serve duplicate
matching in ingestion; the `pg_trgm` extension comes from
`timeline/migrations/0001_initial.py`.

## Links between branches and to events

`BranchLink` is one branch's link to another, in two relations:

- `parent`: a branch it split from or grew out of (drawn as a split).
- `into`: what it became or merged into when it ended (drawn as a merge).

`position` keeps each list in its authored order. A branch may not link to
itself, and each (branch, target, relation) is unique.

**Origins.** `TL.origin` (where a branch came from) is stored across three
places: the note in `Branch.origin_note`, each origin link as a `parent`
`BranchLink` with `origin_position` set, a `how` and a `note`, and the origin's
citations on the branch's `origin` claim. The constraint
`branchlink_origin_is_parent_with_how` makes an origin link a parent link with a
`how`. The legacy build adds every origin link to `parents` too, so an origin
link is always also drawn. `how` is one of `HOWS` in `timeline/models.py`:

| `how` | Meaning |
|---|---|
| `independence` | won independence from |
| `split` | broke away from |
| `successor` | the state it replaced |
| `merger` | formed by uniting with |
| `conquest` | conquest |
| `peoples` | the peoples or cultures it came from |
| `context` | grew out of an era or crisis |
| `ideas` | intellectual or religious roots |
| `reaction` | arose in opposition to |

The page draws `peoples`, `context`, `ideas` and `reaction` lighter than
political lineage ([site/SCHEMA.md](../../site/SCHEMA.md), "Origins").

`EventLink` ties an event to another branch at that moment (the legacy `link`).
The page draws one, so the snapshot writes only the first by `position`; the
table allows several, unique per (event, branch).

`Connection` is `TL.enrich`'s link from one entry to another (event or branch),
with a note the build caps at 90 characters. `position` is unique per source.
Connections, like `why`, appear in the snapshot only when the entry has a
`why`.

## Places and pictures

`Location` (one per entry) is `TL.geo`, for the globe in the side panel:

| `scope` | Means | Required |
|---|---|---|
| `place` | a city, site or battlefield | `lat`, `lon`, `radius_km` (30–150 km by the schema), `label`, an https `src` |
| `region` | a country, empire, sea or basin | the same, with `radius_km` roughly covering it |
| `global` | worldwide | nothing else |
| `cosmic` | before Earth or beyond it | optional `scale`: `solar-system`, `galaxy` or `universe` |

Check constraints in `timeline/models.py` hold these: `location_place_complete`,
latitude and longitude ranges, `radius_km` in (0, 6000], and `scale` only for
`cosmic`. `src` is a page whose own coordinates are the place meant.
`radius_km` is the snapshot's `r`.

`PaleoPin` records where a present-day coordinate lay at one of the PaleoDEM
slices (`slice_ma`, millions of years ago), from the PALEOMAP plate model via
the GPlates Web Service. The import reads them from
`site/globe-assets.json`. They make the positions queryable; the page still
reads the JSON file, and pins are not part of the snapshot.

`Image` is `TL.image`: `src` is a path under `site/images/`, with `width` and
`height` (the snapshot's `w`/`h`), title, credit, license and the Commons
page. The constraint `image_license_pd_or_cc0` refuses any license that doesn't
start with "PD", "Public domain" or "CC0". Images are ordered by `position`,
unique per entry.

## How dates are stored

A date is stored twice: as a number the page can place, and as the text the
source supports.

- **The number** (`Branch.start`/`end`, `Event.y`/`end`) is a calendar year as
  a double: positive CE, negative BCE or years ago, fractions for modern
  dates. 13.8 billion years ago is `-13.8e9`; June 1945 is about `1945.48`.
  `ingest/candidates.py` `decimal_year()` converts a day: year plus
  (day of year − 1) / days in the year, to three places.
- **The text** (`start_when`, `end_when`, `when`) is written exactly as the
  source supports it: "c. 3100 BCE", "4.54 ± 0.05 billion years ago",
  "April 12, 1861".

The number and the text are the truth. The snapshot is built from them, never
from the derived fields.

### Derived fields

`timeline/dates.py` `parse_when()` reads the text and returns a `DateInfo`:
how fine the date is, whether it is hedged, and the exact calendar date when
the text names a CE day. It never guesses past the text. The first rule that
matches wins:

| Text contains | Precision | Exact date |
|---|---|---|
| "billion" or "Ga" | `billion_years` | none |
| "million" or "Ma" | `million_years` | none |
| "years ago" | `thousand_years` | none |
| a CE day, US style ("April 26–29, 1994") | `day` | start, and end for a range |
| a CE day, day-first ("20 July 1969") | `day` | start |
| a BCE day ("15 March 44 BCE") | `day` | none (Python dates are CE only) |
| a month and year | `month` | none |
| "millenni…" | `millennium` | none |
| "century" or "centuries" | `century` | none |
| a decade ("1960s") | `decade` | none |
| anything else | `year` | none |

`approximate` is true when the text hedges: "c.", "ca.", "circa", "about",
"around", "approximately", "possibly", "probably", "perhaps", "debated",
"traditionally", "by", "before", "after", "or", "from", "±", "?" or "/"
(`APPROX` in `timeline/dates.py`). A text counts as BCE when it contains
"bce", " bc" or "years ago".

`timeline/services.py` `branch_date_fields()` and `event_date_fields()` turn
those into model fields; a branch's `end_date` is the end of the `end_when`
range when it has one. The services and the import recompute them on every
save. **The admin does not**: editing `when` there leaves the derived fields
as they were, so prefer the services for date changes.

### How the page places a date

The page draws time on a logarithmic scale, so deep time is compressed and
recent centuries get most of the width. The scale is defined at the top of
the page's script in `site/template.html` ("time scale"):

```js
const NOW = /* the current date as a decimal year, computed in the browser */;
const C = 40;
const sOf = (y) => -Math.log10(Math.max(NOW - y, 0) + C);   // year → position
const yOf = (s) => NOW - (Math.pow(10, -s) - C);             // position → year
```

The position `s` is minus the log of "years before now, plus 40". One unit of
`s` is a factor of ten in years before now; the constant `C` (40 years) keeps
the last few decades from stretching without bound, and a date in the future
sits at now. With `NOW` late in 2026:

| Year | `s` |
|---|---|
| now | −1.60 |
| 2000 | −1.83 |
| 1900 | −2.22 |
| 1000 | −3.03 |
| 3000 BCE | −3.70 |
| 300,000 years ago | −5.48 |
| 66 million years ago | −7.82 |
| 13.8 billion years ago | −10.14 |

Since `NOW` comes from the reader's clock, the same content shifts slightly
year to year; nothing stored depends on it. The branch rules measure branches
on the same scale: `governance/metrics.py` copies the constant as `C_YEARS`
(see [branch governance](branch-governance.md)).

## How entries are ordered

The page breaks ties in its sorts by array order, so the snapshot lists
entries in a fixed order, and that order is data
([ADR 0007](../adr/0007-one-snapshot-shape-byte-identical-both-ways.md)).
`Entry.sort_key` holds it, as a **fractional index**: a key assigned once,
chosen to fall between its neighbors, so inserting, deleting or moving one
entry never changes another's key
([ADR 0008](../adr/0008-entry-order.md)).

How the keys work (`timeline/ordering.py`):

- A key is a string of base-62 digits (`DIGITS`: 0–9, A–Z, a–z, in ASCII
  order) read as a fraction 0.k₁k₂k₃…. A valid key is non-empty and never ends
  in "0".
- Keys compare byte by byte. The column uses the "C" collation, so Postgres
  sorts exactly as Python does.
- `between(lo, hi)` returns a key strictly between two others (`None` is an
  open end). There is always one; a key grows by a digit only after about 60
  entries have gone into the same gap.
- `spread(n, lo, hi)` returns `n` evenly spaced keys. A fresh list of 5,400
  gets keys of at most four digits (tested in `tests/test_ordering.py`).
- `reconcile(order, current, others)` makes keys follow a wanted order with as
  few writes as possible: the longest run of entries already in order (a
  longest increasing subsequence) keeps its keys; only the rest get new keys
  in the gaps, avoiding keys held by entries outside `order`.

Keys are unique per kind by a deferred constraint (`entry_sort_key_unique`),
so a reorder may pass through a moment of two equal keys inside one
transaction. Keys mean nothing beyond order: compare them only to each other,
and never type one by hand.

Where keys come from:

| Writer | What it does |
|---|---|
| `services.save_branch` / `save_event` | A new entry goes after the last of its kind. |
| `services.place(entry, after=slug)` or `before=slug` | Moves one entry; writes its key only. |
| The loader (`publish/legacy.py` `_sort_keys`, `import_legacy`) | `reconcile()` against the file's order: removing an entry writes nothing, inserting or moving one writes one key. |
| Migration `timeline/migrations/0003_entry_sort_key.py` | Gave existing rows evenly spaced keys in their old (position, slug) order, as `job:migrate`. |

Since the cutover ([ADR 0021](../adr/0021-the-cutover.md)) nothing imports
over Postgres, so an entry you `place()` stays where you put it. (Loading a
file with `import_legacy` reorders the entries it has to that file's order.)

## The service layer: how to write content

Every write to a timeline table goes through `timeline/services.py`, inside
`revising()`. The database refuses anything outside `revising()`; the services
add two things the database can't: derived fields kept in step, and only real
changes written, so re-applying the same content leaves no Revision.

```python
from revisions import revising
from timeline import services

with revising("agent:claude-writer", reason="write_event from candidate 412", task=task):
    event, result = services.save_event(
        "ww2-dday", branch="world-war-ii", y=1944.43, when="June 6, 1944",
        title="D-Day landings in Normandy", text="…", imp=1, status="review",
    )
    services.place(event, after="ww2-normandy-planning")
```

| Function | What it does | Returns |
|---|---|---|
| `apply_changes(obj, values)` | Sets `values` on `obj` and saves only the fields that differ (plus `updated_at`, when the model has it). A new object is saved whole. | `"created"`, `"updated"` or `"unchanged"` |
| `save_branch(slug, region=…, **fields)` | Creates or updates a branch by slug. `region` may be a slug or a `Region`. Recomputes the date-derived fields from `start_when`/`end_when` (the new ones or those stored). | `(branch, result)` |
| `save_event(slug, branch=…, **fields)` | The same for an event; `branch` may be a slug or a `Branch`. Derived fields follow `when`. | `(event, result)` |
| `place(entry, after=… \| before=…)` | Moves an entry within its kind to just after or before another (by slug). | the `apply_changes` result |
| `set_status(slug, status)` | Sets an entry's status. Doesn't check the publishing rule: agents publish through `evidence/publishing.py` instead (see [publishing](publishing.md)). | the `apply_changes` result |
| `delete(obj)` | Deletes a row. | nothing |

Every function calls `revisions.require_revising()` first, so it fails early
with a clear `RuntimeError` outside a `revising()` block.

Why compare before saving: Django's `save()` writes every column, and
`updated_at` changes on every save, so a plain `save()` of an unchanged
`Entry` still leaves a Revision. `apply_changes` writes nothing when nothing
differs.

New entries start as `draft`. There is no service for links, locations,
images or connections yet: the import writes those with `apply_changes` and
bulk creates, and `governance/operations.py` with `apply_changes` and
`delete`.

## The snapshot shape

The snapshot (what the page is built from) has one shape, declared in
`site/canonical.mjs` `KEYS` and mirrored in `publish/content.py` `KEYS`: the
keys of each object in a fixed order, and only the keys
[site/SCHEMA.md](../../site/SCHEMA.md) defines. Null is kept only for a
branch's `end` (it continues); elsewhere null and absent mean the same to the
page and null is dropped (`NULL_MEANS_SOMETHING`). Unknown keys are dropped and
counted, and the build warns about them. How each row becomes a snapshot key
is in [publishing](publishing.md#from-rows-to-the-snapshot).

An event's keys, in order, are `id`, `branch`, `y`, `end`, `when`, `title`,
`text`, `imp`, `link`, `cites`, `geo`, `images`, `why`, `connections`,
`whyCites` and `singleSource`. The last is the one key no table stores:
`manage.py publish` sets `"singleSource": true`
on an event whose supporting evidence, on its record claim and that claim's
atomic parts, comes from exactly one independent witness (all of Wikipedia
counts as one), and leaves it out otherwise. It is a **derived** key
(`publish/content.py` `ADDITIVE`): never stored, and ignored when a snapshot
is loaded ([ADR 0018](../adr/0018-single-source-marker.md)).
In `site/template.html`, `renderPanel()` shows it as a quiet "Single source"
note (the `.single` style) under the event's Sources heading, above the
list; nothing else on the page reads it, and there is no filter for it.

## Changing it

- **A new field on an entry that the page shows.** Change
  [site/SCHEMA.md](../../site/SCHEMA.md), `site/canonical.mjs` `KEYS`,
  `publish/content.py` `KEYS` (a test checks the two match), the model (a
  migration), `publish/legacy.py` (the loader) and `publish/export.py`
  (export), then run `make test` and `make roundtrip` (see
  [publishing](publishing.md#changing-it)).
- **A field only Postgres needs** (not in the snapshot). A model field and a
  migration; the round trip is unaffected.
- **A key the page shows that is derived at publish time**, like
  `singleSource`. No model field: compute it in `publish/export.py`, add it
  to both `KEYS` lists and to `ADDITIVE`, and describe it in
  [site/SCHEMA.md](../../site/SCHEMA.md) (see
  [publishing](publishing.md#changing-it)).
- **A new canonical table.** Its migration must call
  `revisions.sql.audit_table()`; `tests/test_revisions.py` fails until it does
  (see [revisions](revisions.md#changing-it)).
- **A new region.** Add it to `REGIONS` in `site/template.html` (name and hue),
  in `site/build.mjs` (validation) and in `publish/legacy.py` (names and
  order for the loader), and to the region list in
  [site/SCHEMA.md](../../site/SCHEMA.md).
- **A new date pattern.** Change `timeline/dates.py` and add a case to
  `tests/test_evidence_and_dates.py`. Existing rows keep the old derived values
  until they are saved again through the services or the import.
- **A change to the time scale.** `C` in `site/template.html` and `C_YEARS` in
  `governance/metrics.py` must stay equal, and the branch rules' thresholds
  are measured in `s`: changing the scale means bumping `METRICS_VERSION` and
  `RULES_VERSION` in `governance/thresholds.py` (see
  [branch governance](branch-governance.md)).
- **Reordering entries.** Use `services.place`; never write `sort_key` by hand.
  A change to the key format needs an ADR amending
  [ADR 0008](../adr/0008-entry-order.md) and a data migration.
