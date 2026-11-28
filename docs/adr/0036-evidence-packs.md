# 0036 — Evidence packs: a job pre-fetches the allowed pages a task needs, stores their text privately for a limited time, and the API checks every excerpt against it

**Status:** proposed (November 2026; revised before merge: rated publishers only, official APIs for catalog pages); amends [0013](0013-source-policy.md) (full text of `allowed` pages kept privately, with a retention limit; task payloads carry ranked passages; a verdict for sec.gov), [0016](0016-object-storage.md) (a second, deletable prefix in the `raw` store) and [0017](0017-agent-api.md) (stored pages over the API, and excerpts checked on `complete` and on edit files); amended by [0037](0037-source-ratings-2026-11-28.md) (API bases, keys and AI-crawler blocks)

## Context

Agents spend most of a task fetching and reading pages that a deterministic job could fetch ahead of time: round 4's
writers made 5 to 15 fetches a task, and every review round had to re-copy excerpts that a fetch tool had
paraphrased (AGENTS.md's excerpt rule exists because of it). A cloud round (ADR 0035) has no browser at all, so it
reads only what a script may fetch, and its agents re-implemented polite fetching task by task, twice with a spoofed
User-Agent. The queue already names what each task will read: a `write_event` payload's `sources` and
`suggested_sources`, a `fill_gap` task's `pointers`, a `verify_claim` task's cited pages and suggestions, the story's
or branch's Wikipedia article.

Constraints. Jobs fetch only what ADR 0013 allows, through `ingest.http.Fetcher` (NEVER_FETCH, the publisher's
`fetch_policy`, robots.txt, bot walls, delays, the honest `INGEST_USER_AGENT`). ADR 0013 said we never keep an
article's full text and that a payload quotes at most 25 words from a source. The `raw` store is write-once and
deletes nothing (ADR 0016). Excerpts are at most 25 words and must be verbatim (AGENTS.md rule 5).

## Decision

**A job, `prefetch_sources`** (`ingest/prefetch.py`; every 15 minutes, last in the run order, so `process`,
`enrich_tasks`, the sweep, `second_source` and `gap_pointers` have filled the payloads it reads):

- For each queued `write_event`, `fill_gap` and `verify_claim` task, best first, it collects up to 12 candidate URLs
  (citations and sources first, at most a third Wikipedia), plus, for a story naming an SEC filing (8-K, 10-K …),
  the filing itself on EDGAR: the company's Central Index Key from Wikidata (P5531), EDGAR's submissions API, and the
  filing's primary document filed within 3 days of the story.
- **Policy first: only rated, `allowed` publishers.** The job fetches a page only when its publisher (the nearest
  Publisher row for the domain or a parent) is **rated** (has a tier: someone read its terms and rated it) and
  `allowed`. An unrated domain (no row, or a row the import made without a tier: 575 of 633 rows when this was
  written) is never requested and goes in `unreadable` as `unrated`, so it shows up for rating; `manage.py
  unrated_domains` lists them with counts. A `browser_only` or `forbidden` publisher, or a NEVER_FETCH host, is
  never requested either; `browser_only` is what tells an agent to open a browser. A page that reserves text and
  data mining (the W3C TDM Reservation Protocol's `tdm-reservation: 1` header or meta tag) is read but never stored
  (`tdm_reserved`). Everything else goes through the Fetcher (robots.txt, bot walls, backoff). A host that blocked
  us or refused by robots.txt in the last 14 days is not asked again (read from its page rows). The rule is the
  job's: link health and the other jobs keep the Fetcher's policy as it was.
- **Official APIs for catalog pages** (`ingest/prefetch_api.py`). The lookup adapters point at pages that refuse
  scripts. Each of those has a published API whose terms (ADR 0013's verdicts) allow what we do, so the job reads
  the API and never the page, and stores the record with `via` naming the API and the clause relied on:

  | Page | API | Stored | Clause relied on |
  |---|---|---|---|
  | openalex.org works; a DOI (doi.org), first | api.openalex.org | title, venue, year, authors, the abstract (rebuilt from its inverted index), the open-access link | openalex.org: "ALLOW: CC0 metadata, keyless …; descriptive User-Agent" |
  | a DOI OpenAlex lacks | api.crossref.org | title, venue, date, publisher, type: no abstract | crossref.org: "public pool, 1 request a second …; titles as snippets (not abstracts)" |
  | loc.gov `/item/`, `/resource/` | the same URL with `?fo=json` | title, date, contributors, subjects, summary, description, notes | loc.gov: "no more than 10 requests a minute …; uses … ?fo=json" |
  | Smithsonian records (siris-libraries.si.edu, n2t.net ARKs, repository.si.edu), by the hit's EDAN id | api.si.edu content (key in a header) | title and the record's free-text fields | si.edu: "Open Access API (api.data.gov key …), CC0 metadata; store metadata only" |
  | europeana.eu items | api.europeana.eu Record API (key in a header) | title, description, date, creator, provider | europeana.eu: "key in the X-Api-Key header …; metadata CC0" |

  The API's publisher must itself be rated and `allowed`; a keyed API without its key is skipped
  (`api_key_missing`). The record is less than the page, so `complete` never refuses an excerpt because it isn't in
  an API's record (auto-verify reads only `via`-less pages); `check-excerpt` still answers. OpenAlex's abstracts are
  the publishers' text: they are kept privately under the same retention as any page and quoted at most 25 words.
- Caps: 60 requests a run, 8 a host (24 for the Wikimedia API), 40 tasks a run; what a cap leaves is `deferred` and
  done next run. A page stored less than 7 days ago is reused without a request; an older one gets a conditional GET.
  English Wikipedia is read through the MediaWiki API (TextExtracts' plain text), other pages with the existing
  extractor (`ingest/extract.py`, trafilatura, called without its cross-call de-duplication).
- **Passages** (`ingest/passages.py`): the clean text split into sentences (at most 50 words a piece), each scored
  against the task by what it names: 3 for a date ("June 6"), 2 for a year (or a year in a gap's window), a number
  or an entity label (with its QID, and its Wikidata aliases), 1 for a title word. The top 5 per page, with their
  matches, go in the payload; the whole pack is at most 20,000 bytes of JSON (passages trimmed worst first). Every
  passage is a slice of the normalized stored text, so an excerpt copied from one is verbatim by construction.

The payload gains `evidence_pack` (`[{url, title, publisher, tier, fetched_at, doc_id, words, passages: [{text,
score, matches}]}]`), `unreadable` (`[{url, reason, detail}]`), `evidence_ready` (a non-Wikipedia page is stored),
`evidence_pack_at` and `evidence_urls` (the hash of the URLs it was built from: a payload that gains sources or
pointers is repacked). `process` and `gap_waves` keep these keys when they refresh a queued payload.

**Data.** One new table, `ingest.PrefetchedPage`: one row per canonical URL (`ingest.prefetch.page_key`: the
canonical URL, an English Wikipedia article by its decoded title), with its host, publisher, status (`stored`,
`unreadable` with a reason, `purged`), the conditional-GET validators, the content hashes and store keys, the word
count, `via` (empty, or the API whose record is stored) and `retain_until`. It is the page's record and, grouped by host, the host's fetch health (the console and the
coverage report read it), so no separate host table. Passages stay in the payload rather than a table: they are
ranked against one task's terms, so they aren't shared between tasks, and the payload is what the agent already
reads; the page's text is what is shared. Not canonical (no audit trigger), like the rest of `ingest`.

**Storage, copyright and retention** (amends ADR 0013 and 0016). Raw bytes and clean text go in the private `raw`
store under `pages/raw/<hash[:2]>/<hash>` and `pages/text/<hash[:2]>/<hash>`, only for a rated, `allowed`
publisher (checked again just before writing). A stored page whose publisher stops being rated and `allowed` is
purged on the job's next run, as a page past its retention is. They are never published: not in a snapshot, a release or the public page,
and served only over the agent API to the agents below. Each page's text and bytes are deleted
`EVIDENCE_RETENTION_DAYS` (180) after it was last fetched, or `EVIDENCE_RETENTION_DAYS_OPEN` (365) when the
publisher's license is open (CC0, CC BY, public domain, the Open Government Licence); the row stays as `purged`, and
the packs that quoted it lose those passages. `pages/` is the one prefix of the store that is deleted from; `raw/`
(ingestion's documents) stays write-once. ADR 0013's line on news feeds still holds for the feed jobs: they keep a
headline, date, link and a lead. What changes is narrower: a job may now keep a page's full text, privately and for a
limited time, when the publisher's terms allow automated fetching, to check agents' excerpts against it; and a task
payload may carry up to 5 passages of at most 50 words per stored page (an excerpt that is cited stays at most 25
words).

**The API** (amends ADR 0017; `agentapi/evidence.py`):

- `GET documents/<id>` and `GET documents?url=` return a stored page's clean text to an agent holding a claimed task
  whose pack names it, or to a token with scope `review` when an entry in review cites the page. Anyone else: 403.
- `POST evidence/check-excerpt {doc_id | url, excerpt}`: whether the excerpt is on the stored page, verbatim up to
  whitespace (and Unicode NFC), with the closest passage when it isn't; 404 when the page isn't stored.
- **Auto-verify.** `complete` (`write_event`, `fill_gap`, `verify_claim`) and `edits/check` / `edits/apply` check
  every excerpt whose cited page is stored. A mismatch is a 422 listing the excerpt, the document and the closest
  passage; nothing is applied and the task stays the agent's. A page not in the store (browser_only, not fetched yet,
  purged) is not checked by the API; the reviewer reads it.

**The skills** read the pack first (`drain-write-events`, `fill-gaps`, `verify-claims`, `verify-stale-claims`,
`run-round` and its reviewers): passages and `GET documents/<id>`, excerpts copied from stored text; a browser only
for the `browser_only` URLs in `unreadable`; in a cloud round, a draft only those support is held.

**A new source verdict: sec.gov (EDGAR)**, checked 2026-11-27. "Accessing EDGAR Data": at most 10 requests a second
for all machines together, declare the user agent, no crawling; the submissions API and single filings are the
published routes. robots.txt allows `/Archives/edgar/data` and disallows `/cgi-bin`; data.sec.gov has no robots.txt.
The sec.gov privacy page: public information "may be copied or further distributed … without the SEC's permission".
Publisher `sec.gov`, tier 1, `allowed`; `HOST_DELAY` 0.5 s. The SEC's sample User-Agent shows a company name and an
e-mail; ours names the bot and `INGEST_CONTACT` (a project address, never a person's): if the SEC refuses it, the
filings show as `blocked` and are read by hand.

**Measuring it.** `manage.py evidence_coverage [--out var/]` (`ingest/coverage.py`, no requests) reports, per task
kind, region and era, the share of queued tasks whose pack holds a non-Wikipedia page ("ready"), that point at one
a job may fetch at all, as a page or through its API ("possible"), and at one on a site that hasn't refused us
("open"), the pages stored through each API, the unrated domains, the unreadable hosts and reasons, and the host
health: where new sources are needed. `manage.py unrated_domains [--json]` lists the unrated domains alone: each
with the tasks and URLs that name it and an example, for the round that rates them. The console's Work page shows the "evidence ready" share per queue, and a task's page shows its pack.

## Consequences

- Agents verify against stored text: fewer fetches, no paraphrased excerpts on stored pages, and cloud rounds can
  write from pages they could not fetch themselves. What agents still do by hand: read `browser_only` pages, pages
  the job could not read (robots, blocks, PDFs, errors), and judge what the passages mean.
- A wrong excerpt on a stored page is now refused at the door instead of in review. Whitespace aside, the match is
  exact: an excerpt copied from a browser with a footnote marker ("[12]") or a changed quote mark is refused, and the
  422 shows the stored sentence to copy instead.
- We hold full text of third-party pages, privately, for up to six months (a year for openly licensed ones). The
  retention purge, the `allowed`-only rule and the 403 on documents are what keep that within the terms we read;
  a publisher whose policy changes to `browser_only` is no longer fetched, and its stored pages age out.
- **The measurements** (a scratch database loaded with the archive and filled by the real jobs, November 28, 2026:
  20 `write_event`, 40 `fill_gap`, 248 `verify_claim`). With unrated domains fetched by default, 55% of
  `write_event` tasks were ready (news pages) and 0% of the others: their candidates were catalog pages that refuse
  scripts, and 200 of the 248 claims cite Wikipedia alone. With only rated publishers, the official APIs and the
  November 28 ratings (ADR 0037): `write_event` 60%, `fill_gap` 100%, `verify_claim` 19% ready, all of it through
  API records (Smithsonian 151, OpenAlex 59, Europeana 56, LoC 15 entries in packs); no non-Wikipedia page itself
  is stored, because the stories' news outlets are unrated or `citation_only`. By era, 500–1500 (8%) and 1500–1800
  (0%) are thinnest. The coverage report in `var/` lists what is left.
- **Unrated means not fetched.** The Fetcher's default for a domain nobody rated is `allowed`
  (`evidence.publishers.defaults_for`), and a first version of this job followed it: it stored news pages from
  publishers whose terms nobody had read (ft.com, time.com, nbcnews.com among them). Now the job needs a rating,
  those pages were deleted, and a stored page whose publisher loses its rating is purged. The cost: most news
  sources wait for a rating, so the share of ready `write_event` tasks drops until a source-discovery round rates
  the frequent hosts (`manage.py unrated_domains`), terms first.
- The job adds up to 60 polite requests every 15 minutes to the worker's load; the caps are job options.
- What would make us revisit it: a publisher objecting to stored copies (shorten the retention or drop the host),
  passages that rank badly (the weights are in `ingest/passages.py`), or a need to share passages across tasks
  (then a passage table).
