# 0037 — The November 28 source ratings become Publisher policy, with two new policies: api_only and citation_only

**Status:** proposed (November 2026); amends [0013](0013-source-policy.md) (two more fetch policies, and 104 sources rated) and [0036](0036-evidence-packs.md) (what the evidence-pack job may fetch: API bases, keys, AI-crawler blocks); amended by [0042](0042-deferred-releases-and-the-fetch-policy-endpoint.md) (the ratings bind agents' scripted reads too)

## Context

The first evidence-pack measurement (ADR 0036) found that most queued tasks point at Wikipedia, at catalog pages that
refuse scripts, or at publishers nobody had rated: 575 of 633 Publisher rows had no tier. A source-discovery round
on November 28, 2026 read the robots.txt and terms of 104 candidate sources (scholarly, archival, museum,
government, intergovernmental, broadcasters and news) and rated each `allowed`, `api_only`, `browser_only`,
`citation_only` or `forbidden`, with the terms URL, the clause relied on, what robots.txt said, whether a key is
needed and notes. Its records are `ingest/ratings/2026-11-28-scholarly.json` (48) and `-gov-news.json` (56).

The round said where it was unsure: licenses "not re-verified", terms "not read", robots.txt or terms behind a bot
wall (403), terms seen only through a search snippet, "LOW CONFIDENCE". Many sites' robots.txt names AI crawlers
(ClaudeBot, anthropic-ai, GPTBot …) and disallows them, while allowing `*`, which our User-Agent token falls under.
Some publishers allow only their API, some only with a key we don't have, and some robots.txt files disallow the API
path but allow the article pages (Wikisource, Wikinews) or set a Crawl-delay.

## Decision

**Two more fetch policies** on `evidence.Publisher` (migration `evidence` 0004, with the check constraint):

- `api_only`: a job may request only URLs under the publisher's `api_base` (a prefix, optionally a query parameter
  the URL must carry, "https://www.loc.gov/ ?fo=json"; several joined by " | "), and only when `api_needs_key` is
  false or `api_key_setting` names a setting that is set. A keyed API with no key stays recorded and off. No key is
  requested.
- `citation_only`: never fetched by a job; an agent may cite the link and read it in a browser (ADR 0013's
  "citation only", now a policy rather than a note).

The Fetcher enforces both for every job (`ingest.http.Fetcher.refusal`, `api_refusal`; the query parameters a job
passes count toward the API base), so the LoC lookups (`?fo=json`) keep working and loc.gov HTML is refused.

**The ratings become policy once per database**, through the service layer as `job:seed_sources`, like ADR 0013's
verdicts (`ingest/ratings.py`, called by `seed_sources`; JobState "ratings_2026_11_28"):

- **Restrictive ratings** (`browser_only`, `citation_only`, `forbidden`) are recorded whatever the confidence: they
  only stop jobs. They add no tier, so the publisher stays unrated for the evidence-pack job. The round's
  `forbidden` (Al Jazeera: its robots.txt forbids mining) is recorded as `citation_only`, because `forbidden` here
  also bars citing (OpenStax).
- **Permissive ratings** (`allowed`, `api_only`) are applied only when the record shows no doubt: none of its
  license, robots, clause or notes matches `ratings.LOW_CONFIDENCE` (not re-verified, not read, bot wall, 403,
  robots-only, via search, low confidence …). Then the publisher gets the policy, a tier where it has none (`TIERS`)
  and, for `api_only`, the API base (`API_BASES`, the round's base normalized to a prefix) and the key rule. A
  low-confidence permissive rating changes no policy: the domain stays as it was, so an unrated one is still not
  fetched by the evidence-pack job, and its note says why.
- Every record adds a note to each of its publishers' `access_notes`: "Rated 2026-11-28 (source discovery, ADR
  0037)", the verdict and whether it was applied, the terms URL, the clause and what robots.txt said. Domains are
  normalized ("www." dropped, a listed subdomain folded into its listed parent); paths and shared hosts
  (github.com/…, raw.githubusercontent.com) get no row.

Applied on the scratch database: 117 domains (78 rows created), 6 `allowed` (the Stanford Encyclopedia of
Philosophy, Wikidata, GovInfo, NASA, USGS, Our World in Data), 5 `api_only` (Semantic Scholar, the Library of
Congress with Chronicling America, Open Government Canada; Congress.gov and the National Archives Catalog are keyed
and off), 26 `browser_only`, 26 `citation_only`, and 54 notes only (the low-confidence permissive ratings: OpenAlex,
Crossref, Wikisource, Pleiades, the Internet Archive, PubMed Central, the Met, Papers Past, WHO, GOV.UK,
legislation.gov.uk … keep their earlier state).

**AI-crawler blocks.** The evidence-pack job doesn't fetch a site whose robots.txt names an AI crawler
(`ingest/policy.py` `AI_AGENTS`: ClaudeBot, Claude-User, anthropic-ai, GPTBot, CCBot, Google-Extended …) and
disallows it the URL, whatever our User-Agent says (`Fetcher.ai_blocked`; reason `ai_blocked`, a stored copy is
purged). The site has said it wants no AI readers; reading it under a token it didn't name would be getting round
that. Other jobs keep the Fetcher's robots.txt check for our own token.

**Path limits and delays** are the Fetcher's: robots.txt is honored per URL (Wikisource's and Wikinews' `/w/`
disallowed, `/wiki/` read), and Crawl-delay is waited out (capped at 30 s). The delays the round recorded are also
in `HOST_DELAY` (legislation.gov.uk and the Stanford Encyclopedia 5 s, Pleiades 3 s, CCEL and Zenodo 10 s,
open.canada.ca 20 s, arXiv 15 s; loc.gov was already 6 s).

**Corpora, recorded and not fetched.** The GitHub TEI corpora (Perseus / First1KGreek), CBETA and papyri.info are
listed (`ratings.CORPORA`, `ratings.follow_ups()`); no fetcher reads them in this change.

## Consequences

- The evidence-pack job reads more scholarly and official pages, and fewer news pages: most news publishers are now
  `citation_only` or `browser_only` (BBC, CNN, NBC, Reuters, AP, the Guardian, the New York Times, FT, Bloomberg,
  France 24, RNZ …) or still unrated. News stories rest on agents' browser reads and on the official sources the
  stories cite.
- loc.gov and archives.gov change for every job: loc.gov only through `?fo=json` (its HTML was bot-walled anyway;
  link health stops checking loc.gov HTML citations), archives.gov not at all until the National Archives Catalog
  has a key, and even then its terms forbid caching or storing (recorded in the note): a key alone must not turn the
  evidence-pack job on for it.
- Low-confidence ratings wait for a human read. `manage.py unrated_domains` and the coverage report list what is
  left; re-rating a source means editing its record in `ingest/ratings/`, or its row in the admin as `human:`, and
  a new rating round adds a new file and JobState rather than rewriting this one.
- Follow-up work: fetchers for the TEI corpora; keys for the keyed APIs worth having (Congress.gov, DPLA, CORE)
  only if the owner asks for them; a second read of the low-confidence sources from a host their bot walls accept.
