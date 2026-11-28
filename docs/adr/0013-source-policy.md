# 0013 — Source policy: what jobs fetch, what they never do, and why

**Status:** accepted (November 2026; terms checked 2026-11-26); amended by [0020](0020-heroku-hosting.md); amended by [0036](0036-evidence-packs.md) (full text of `allowed` pages kept privately for a limited time, payload passages, and the sec.gov row below); amended by [0037](0037-source-ratings-2026-11-28.md) (`api_only` and `citation_only`, and 104 sources rated on November 28)

## Context

Ingestion reads other people's sites on a schedule. We use material for a non-commercial, cited timeline and AI
agents read it. That is exactly what many publishers' terms now address. We need one written rule for each source
that the code enforces, so it does not rest on each job's author remembering it.

## Decision

**Layers, all enforced in `ingest.http.Fetcher` before any request leaves:**

1. `ingest/policy.py` `NEVER_FETCH`: hosts no job requests, whatever else says so (with subdomains).
2. The Publisher's `fetch_policy`: `browser_only` and `forbidden` are never fetched by a job; an agent reads a
   `browser_only` page in a browser (AGENTS.md rule 6). A subdomain inherits its parent's policy unless it has its
   own row (`api.nobelprize.org` is `allowed`; `nobelprize.org` stays `browser_only`).
3. robots.txt for our User-Agent token, cached per host per run, with Crawl-delay honored. An unreachable robots.txt
   means disallow (RFC 9309). Wikimedia's APIs and the Wayback availability API are the exceptions: their robots.txt
   addresses crawlers of HTML pages, and their API etiquette (serial requests, a descriptive User-Agent with contact)
   is what we follow.
4. Bot walls: a CAPTCHA or challenge page blocks the host for the run, and for link health for 14 days. A 401 or 403
   is "blocked", never "dead".

**What we keep.** From news-like feeds we keep metadata, the headline, the date, the link and a short lead (60
words at most) from the feed itself, or headline and link only where the terms say so. We never keep an article's
full text. Task payloads quote at most 25 words from any source. A URL that Wikipedia's portal cites may be stored
as link metadata (the URL and Wikipedia's anchor text) and is never fetched. Lookup hits are suggestions
(`SuggestedSource`) and never Evidence: an agent reads the page and records evidence with `facts record`.

**User-Agent.** `<SITE_NAME>Bot/0.1 (history timeline research; +<INGEST_CONTACT>) python-httpx`. `INGEST_CONTACT`
must be a generic project address or URL, never a person's details; it defaults to the project's repository,
https://github.com/dimays/humanitributary (Wikimedia requires contact information).

**Keys** come only from `.env` (`SMITHSONIAN_API_KEY`, `EUROPEANA_API_KEY`). An adapter without its key is disabled
cleanly. Keys are masked in errors, logs and test cassettes. Europeana's key goes in the `X-Api-Key` header: the
`wskey` parameter is deprecated, and keys in URLs leak. Europeana's personal key is for non-production use; request
a Project key before hosted scheduling.

**Per-source verdicts** (each Publisher's `access_notes` carries its verdict, written once by `seed_sources`):

| Source | Verdict | Relied on |
|---|---|---|
| Wikipedia (MediaWiki API), Wikidata, pageviews | ALLOW | Wikimedia User-Agent policy and API etiquette: serial requests, informative UA with contact; CC BY-SA attribution kept on every Document/Candidate |
| Wayback availability API | ALLOW | robots.txt blocks only /control/, /report/; no stated rate rule (we send 1/s) |
| The Guardian (site and Open Platform) | **DROP**: citation only | OP terms 6(g) ban TDM, aggregation, AI/ML synthesis and any automated program; clause 5: delete content within 24 h. `NEVER_FETCH`, `browser_only`, excluded from link health |
| BBC News RSS | **DROP** | Terms of use §15: "not allowed to pluck metadata from our content or RSS feeds"; robots.txt bans TDM/AI |
| NPR RSS | **DROP** | Feed copyright: "For Personal Use Only" |
| Al Jazeera RSS | **DROP** | robots.txt notice: no "text and data mining" or automated scraping without written permission |
| AP News | **DROP** | No public feed or API; robots.txt `Disallow: /*.rss`, `/api/v2/feed/` |
| UN News, UN press releases | Headline + link only, **disabled** | un.org terms: personal, non-commercial use, no right to compile; our Publisher rows are `browser_only` (owner's call to change); Crawl-delay 10 |
| UNESCO World Heritage list RSS | Headline + link only, **disabled** | robots `Content-Signal: ai-train=no, use=reference`; tdmrep.json `tdm-reservation: 1`; Publisher `browser_only` |
| WHO Disease Outbreak News API | ALLOW (non-commercial) | who.int terms: research or private study, acknowledge WHO with the URL; CC BY-NC-SA 3.0 IGO |
| Federal Register API | ALLOW | US government work; robots.txt blocks only search and auth paths |
| SEC EDGAR (added by [0036](0036-evidence-packs.md), checked 2026-11-27) | ALLOW | "Accessing EDGAR Data": ≤ 10 requests/s, declared user agent, no crawling; submissions API and single filings under /Archives/edgar/data (robots.txt allows it, disallows /cgi-bin); sec.gov privacy page: public information, may be copied |
| The Gazette (UK) data feed | ALLOW | Open Government Licence v3.0 (attribution); Crawl-delay 10; state notices (11xx) only, never personal-data notices |
| Nobel Prize API v2 | ALLOW | Data CC0 ("free to use according to … CC0"); cache, don't alter, no endorsement |
| Office of the Historian Milestones (GitHub TEI) | ALLOW | LICENSE.md: CC0 / US public domain; fetched weekly at most (GitHub AUP: no excessive bulk activity); history.state.gov `/search` is robots-disallowed |
| OpenAlex | ALLOW | CC0 metadata; keyless (10 req/s, small daily budget); no mailto (no personal email) |
| Crossref | ALLOW (public pool) | 1 request/s, one at a time; titles as snippets, not abstracts |
| Library of Congress, Chronicling America | ALLOW | loc.gov/legal: at most 10 requests a minute (we wait 6 s); robots `Disallow: /search`, so `/collections/` and `/manuscripts/` `?fo=json` |
| Smithsonian Open Access | ALLOW (key) | CC0 metadata; api.data.gov key; metadata only (terms pages sat behind a verification wall) |
| Europeana | ALLOW (key, disabled until set) | Metadata CC0, media per `edm:rights`; Project key for production |
| World Bank Indicators | ALLOW | CC BY 4.0, "The World Bank: <dataset>: <source>"; reasonable volume |
| Olympedia | Links and names only, no job | No published terms for automated reuse; robots Crawl-delay 10 |
| Britannica, OpenStax | Never by jobs | Britannica's terms (browser only); OpenStax forbids AI use (rule 6) |

## Consequences

- News corroboration comes from the sources Wikipedia's editors cite in the portal, stored as links (never fetched).
  Official feeds (WHO, Federal Register, Gazette, Nobel) supply corroboration jobs may fetch. A news publisher is
  added back only after its terms are read and allow it. Record the clause here and in its `access_notes`.
- Agents verify `browser_only` sources by hand in a browser. Task payloads say which sources those are.
- Changing a verdict means editing `ingest/policy.py` (NEVER_FETCH), the Publisher row (admin, as `human:`) and
  this table, together.
