# 0048 — Events get openly licensed pictures by reference, found by a paced job; pictures that may disturb are blurred until the viewer asks

**Status:** proposed (November 2026); amends [0007](0007-one-snapshot-shape-byte-identical-both-ways.md) (three more image keys, written only when set), [0013](0013-source-policy.md) (the Commons API joins `API_HOSTS`; two image sources rated), [0037](0037-source-ratings-2026-11-28.md) (a third batch of ratings) and [0046](0046-the-owners-review-queue.md) (pictures and their flags on the Review page, and a flag decision)

## Context

About 5,700 events and 391 branches carry 488 pictures, all from one early pass (`fetch-images.mjs`, now in
`archive/site-tools/`): files copied into `site/images/`, public domain or CC0 only, chosen once and never again.
Most events have no picture, and nothing finds one for the events added every day.

The owner asked for pictures from public-domain and openly licensed sources, under standing rules:

- No AI-generated imagery, ever (the labeled procedural globe renders excepted).
- Respect each site's terms, robots.txt and rate limits. Use the honest User-Agent, and never spoof a client.
- Store a reference to the picture, not the picture. Don't host or alter it beyond what its license allows.
- Disturbing pictures (war dead, atrocities, executions, disasters with victims, graphic medicine) are blurred by
  default, and the viewer's consent applies to one picture at a time.

Jobs are deterministic ([0003](0003-deterministic-jobs-and-an-agent-queue.md)), so choosing a picture can't be
left to judgment. Only a narrow case is sure enough to attach without a person. Everything else needs the owner,
and the owner already has one place to decide things: the Review page ([0046](0046-the-owners-review-queue.md)).

## Decision

**A scheduled job, `image_search`** (`ingest/images.py`, hourly, `collect`). It looks for a picture for events
that have none and makes no LLM calls. It reads only official APIs that the Publisher rows let a job read, through
the Fetcher. Each source is also asked once a run whether the policy allows it at all, and a refused source is
skipped for the run.

- **Wikidata.** The P18 (image) of the event's entities: the English Wikipedia articles its record claim cites, the
  first being its primary entity.
- **The Commons API.** `imageinfo` with the file's license metadata and categories; files whose structured data
  depicts the primary entity (`haswbstatement:P180`); and, as a fallback, a title search.
- **The Library of Congress**, through `/photos/?fo=json` (its `api_only` base). A picture is kept only when the
  item's `rights_advisory` says "No known restrictions".
- **Smithsonian Open Access**, with the existing key sent in a header. Only media marked CC0 are kept.
- **NASA's Image and Video Library API**, for space and flight events from 1915 on. A record that names a third
  party's copyright is refused.

The Met's, the Art Institute of Chicago's, Cleveland's and the Rijksmuseum's APIs are not used. Their 2026-11-28
ratings were low confidence, and metmuseum.org is `browser_only`, so their terms wait for the owner's read.

**Licenses.** Public domain, CC0, CC BY and CC BY-SA, plus the Library of Congress's "No known restrictions". The
license, its URL, the creator and a credit line are kept with every picture. A CC BY or CC BY-SA picture without an
author to credit is refused. The database enforces the same list (`image_license_open`) and refuses an attribution
license without a credit and a license URL (`image_attribution_complete`).

**A reference, not a file.** An `ImageCandidate` keeps the file page, the source's image URL, the size, the
license, the creator, the attribution, the score and its parts, the sensitivity signals, and what was checked.
The page shows the source's own resized copy by its URL: a 500 px Wikimedia thumbnail, the Library of Congress's
derivative, the Smithsonian's delivery service, NASA's rendition. `thumbnail_note` records which one. Nothing is
downloaded, cropped or altered. The 488 legacy files stay as they are.

**No AI-generated imagery.** These are refused:

- a Commons file in an AI-generated category, or tagged `{{PD-algorithm}}`;
- an AI-upscaled, AI-restored or colorized version;
- a file whose author, credit, title or description names an image generator or a prompt;
- any picture made in 2020 or later for an event before 2015, since that can only be a modern rendering.

The rules are recorded on every candidate.

**Matching and routing.** A score from 0 to 1 combines:

- how the picture was found (the primary entity's own P18 counts most, a title search least);
- the words it shares with the event's title;
- its date against the event's;
- the event's place in its text.

A picture is attached at once, as `job:image_search` and audited like any canonical row, only when all of these
hold:

- it is the primary entity's own P18, and that entity is an event or a work;
- it is public domain or CC0, with no restrictions;
- no sensitivity signal fires;
- it scores 0.7 or more.

Otherwise the best candidate at 0.35 or more goes to the Review page, and up to two runners-up wait behind it.

**Pacing.** Each event is searched at most three times, 14 and then 42 days apart, 25 events a run. An event with a
picture, or with a candidate waiting, is not searched. Every attempt is recorded on its `ImageSearch` row. A picture
the owner denied is never proposed again for that event.

**Sensitive pictures.** The signals are deterministic:

- the Commons categories (corpses, massacres, executions, war dead, victims, wounds, autopsies, the Holocaust …),
  which are enough alone;
- the picture's own text, and the event's words and branch, each counted only when another signal agrees.

A flagged picture is never attached without the owner. The job also reads the categories of pictures already
attached, 50 a run, the legacy set included. Where the signals fire it sets the flag and asks the owner to confirm
or clear it. A flag the owner cleared is never set again by the job.

**On the Review page** ([0046](0046-the-owners-review-queue.md)) two new item kinds appear: a picture, and an
attached picture's flag. Each has approve (with a Sensitive box), deny, defer and restore. A form below the queue
sets or clears any entry's flag (OpsAction `review_flag`).

**On the page.** A picture renders lazily, with its size, credit, license (linked to its deed) and source page. A
flagged picture is blurred behind "This image may be disturbing." and a native "Show image" button. While hidden it
has no alt text and its link is out of the tab order. Revealing it unblurs that one figure, and the choice isn't
remembered.

**The snapshot.** An image is `{src, w, h, title, alt, credit, license, licenseUrl, page, sensitive}`. `alt` and
`licenseUrl` are written when not empty and `sensitive` only when true, so the older pictures' bytes are unchanged
and a snapshot still loads and exports byte for byte ([0007](0007-one-snapshot-shape-byte-identical-both-ways.md)).
`src` is a path under `site/images/` or an https URL (`image_src_local_or_https`).

**Two ratings** (`ingest/ratings/2026-11-28c-images.json`, batch "2026-11-28c"), both confident and applied as
`allowed`:

- The Commons API. The reuse page allows hotlinking but doesn't recommend it, and asks that the creator be
  credited. Its robots.txt is Wikipedia's, which closes `/w/` to crawlers, so `commons.wikimedia.org` joins
  `API_HOSTS` on the grounds [0013](0013-source-policy.md) gives for Wikipedia: Wikimedia's API etiquette, serial
  requests and a descriptive User-Agent.
- NASA's image API. Its media guidelines allow factual use that implies no endorsement, with NASA credited. It has
  no robots.txt.

## Consequences

- Pictures arrive with the events and keep arriving, and every one carries its license and attribution. A
  machine-made choice is attached only in the narrow sure case; the rest are a click each on the Review page.
- **Hotlinking.** The page loads pictures from Wikimedia's, the Library of Congress's, the Smithsonian's and NASA's
  servers. Commons doesn't recommend that, a URL can change or go away, and a failed picture removes its figure
  (`onerror`). The page sends no referrer. If Wikimedia asks, or the page's traffic grows, the alternative is to
  host copies of the PD and CC0 files, which those licenses allow. That would be a new decision.
- CC BY-SA pictures are shown as they are. ShareAlike binds adaptations, and the page adapts nothing.
- **Coverage.** It depends on Wikidata: events whose cited article's item has a P18 get one quickly, and the rest
  depend on the catalogs and the owner. The license and AI filters will leave some events without a picture, by
  design.
- **The sensitivity signals are coarse on purpose.** A painting of an execution is blurred like a photograph. A
  wrong blur costs the viewer a click and the owner can clear it; a missed one costs more.
- **What would make us revisit it:**
  - a source changing its terms or rate limits;
  - Wikimedia objecting to hotlinking;
  - the owner approving or denying far more than the thresholds predict;
  - a rating that lets a museum's API on.
