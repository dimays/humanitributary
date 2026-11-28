---
title: Sources and terms
summary: Which sites the jobs may read automatically, which they must never touch, the terms clause each decision rests on, and how the code enforces it, keys included.
order: 40
covers:
  - ingest/policy.py
  - ingest/seed.py
  - ingest/http.py
  - ingest/lookup.py
  - evidence/publishers.py
  - tests/cassette.py
  - .env.example
---

Ingestion reads other people's sites on a schedule, and AI agents read what it collects. Many publishers' terms now
speak to exactly that, so every source has a written verdict: what jobs may do with it and which clause of its terms
allows or forbids it. The rule lives in code, checked before any request leaves the machine, so it never depends on
a job's author remembering it ([ADR 0013](../adr/0013-source-policy.md)).

How the jobs use these sources is in [ingestion](ingestion.md).

## What the Fetcher checks before a request

Every job request goes through `ingest.http.Fetcher` ([ingest/http.py](../../ingest/http.py)). Its `refusal(url)`
runs these checks in order; the first that fails raises `Refused` with the reason, and no request is made (a test,
`test_never_fetch_hosts_and_browser_only_publishers_are_refused_before_any_request`, checks that the request count
stays at zero). Before the checks, a Fetcher a job run holds calls its `stop_check`: the run's safe point, which
raises `RunStopped` once the job is archived ([ADR 0041](../adr/0041-archive-a-job.md); see
[ingestion](ingestion.md)).

| # | Check | Where it lives | Refused when |
|---|---|---|---|
| 1 | Scheme | `Fetcher.refusal` | The URL isn't http or https. |
| 2 | NEVER_FETCH | `ingest/policy.py` `NEVER_FETCH`, `never_fetch_reason()` | The host is a listed domain or a subdomain of one, whatever its Publisher row says. |
| 3 | The publisher's `fetch_policy` | `evidence.models.Publisher`, looked up by `_db_publisher_policy()` | The policy is `browser_only`, `citation_only` or `forbidden`; or `api_only` and the URL (with its query parameters, `full_url`) isn't under the publisher's `api_base`, or the API needs a key that isn't set (`api_refusal`, `ingest.policy.api_base_allows`). |
| 4 | Bot wall this run | `Fetcher.blocked` | The host answered with a CAPTCHA or challenge earlier in this run. |
| 5 | robots.txt | `Fetcher._robots_allow()` | robots.txt disallows our User-Agent token (skipped for `ingest/policy.py` `API_HOSTS`). |

**Redirects are checked too.** The HTTP client never follows a redirect itself (`follow_redirects=False`):
`Fetcher._follow` takes each hop by hand and runs `refusal()` on the next URL before requesting it, with the same
checks as the first URL. A redirect to a host the policy refuses raises `Refused` naming the hop ("<url> redirects to
<next>: <reason>"), so a redirect never lands a job on a NEVER_FETCH host, a `browser_only` or `forbidden` publisher,
a host that showed a bot wall, or a path robots.txt disallows. More than 10 hops (`Fetcher.MAX_REDIRECTS`) raise
`FetchError`. A bot wall on the final host is recorded as well as one on the host first asked for.

### NEVER_FETCH

Hosts no job ever requests, because their terms forbid automated reading or AI use. Subdomains are included
(`kids.britannica.com`, `feeds.bbci.co.uk`).

| Host | Why (the reason string in `NEVER_FETCH`, shortened) |
|---|---|
| britannica.com | Terms forbid automated access; a person reads it in their own browser (ADR 0046). |
| openstax.org | Terms forbid use of its textbooks by AI systems: never read or cite. |
| theguardian.com, guardianapis.com | Open Platform terms 6(g) ban TDM, aggregation, AI/ML synthesis and any automated program; clause 5: delete within 24 hours. |
| bbc.co.uk, bbc.com, bbci.co.uk | BBC terms of use §15: no taking metadata from content or RSS feeds; robots.txt bans TDM and AI use. |
| npr.org | Feed copyright line: for personal use only. |
| aljazeera.com, aje.news | robots.txt notice forbids automated scraping and text and data mining without written permission. |
| apnews.com | robots.txt disallows the RSS and feed API paths; no public feed or API; content licensed commercially. |
| olympedia.org | No published terms for automated reuse: links and names only. |

### How a URL finds its publisher's policy

`evidence.publishers.domain_of(url)` gives the publisher domain: the host, lower case, without "www.", with every
language edition of Wikipedia folded into wikipedia.org. `_db_publisher_policy()` then looks for a `Publisher` row
for that domain or its nearest parent (`api.openalex.org` → `openalex.org`), and falls back on
`evidence.publishers.defaults_for(domain)`, which is `allowed` unless the known defaults say otherwise.

A subdomain with its own row keeps its own policy: `api.nobelprize.org` is seeded `allowed`, while `nobelprize.org`
(and so `www.nobelprize.org`) stays `browser_only`.

### robots.txt

The Fetcher reads robots.txt once per host per run and matches it against its token, the part of the User-Agent
before the first "/". Its redirects are checked like any other request's, except against robots.txt itself.

| robots.txt answer | Treated as |
|---|---|
| 2xx | Parsed and applied. |
| 401 or 403 | Disallow everything. |
| Other 4xx (404 …) | Allow everything. |
| 5xx or no answer | Disallow everything (RFC 9309). |
| A redirect to a refused host | No answer: disallow everything. |

Crawl-delay is honored: the wait before a request to a host is the longer of its `HOST_DELAY` and the Crawl-delay,
capped at 30 seconds. `API_HOSTS` skip robots.txt: en.wikipedia.org, www.wikidata.org, query.wikidata.org,
wikimedia.org and archive.org. Their robots.txt is written for crawlers of HTML pages (it disallows /w/, where the
MediaWiki API lives); what we follow there is Wikimedia's API etiquette: serial requests and a descriptive
User-Agent with contact.

### Politeness delays

`ingest/policy.py` `HOST_DELAY`, in seconds between two requests to the same host (subdomains included);
`DEFAULT_HOST_DELAY` is 1.0.

| Host | Delay | Why |
|---|---|---|
| en.wikipedia.org, www.wikidata.org | 0.3 | Wikimedia asks for serial requests. |
| query.wikidata.org | 1.0 | |
| wikimedia.org | 0.1 | Pageviews API. |
| archive.org | 1.0 | Wayback availability API. |
| loc.gov | 6.0 | loc.gov/legal: at most 10 requests a minute (robots.txt Crawl-delay is 5). |
| thegazette.co.uk | 10.0 | robots.txt Crawl-delay. |
| history.state.gov | 20.0 | robots.txt Crawl-delay. |
| api.openalex.org | 0.2 | |
| api.crossref.org | 1.0 | Public pool: 1 request a second, one at a time. |
| news.un.org, press.un.org | 10.0 | un.org robots.txt Crawl-delay. |
| sec.gov (www., data.) | 0.5 | SEC fair access: at most 10 requests a second, all machines together. |

### Bot walls

`looks_like_challenge()` checks the first 30,000 bytes of a 401, 403, 429 or 503 response, or of a 200 page shorter
than 30,000 bytes, for CAPTCHA and challenge markers (`CHALLENGE_RE`: "captcha", Cloudflare's challenge pages,
PerimeterX, DataDome, "are you a robot"). A match marks the response `blocked` and refuses the host for the rest of
the run. Link health then skips that publisher for `ingest/policy.py` `BLOCKED_COOLDOWN_DAYS` (14). A 401, 403 or
429 is recorded as `blocked`, never `dead`: it doesn't overwrite the citation's last real status, and the fact sweep
ignores those statuses (`evidence/policy.py` `blocked_http_statuses`), so a site that refuses automated readers
never turns its citations into dead-link tasks ([ingestion](ingestion.md#link-health)).

## Publishers and their starting ratings

A `Publisher` row (canonical, in `evidence`) holds a site's tier, license, `fetch_policy` and `access_notes`.
`evidence/publishers.py` `KNOWN` is what a new row starts with; after that the row in the admin is the truth, and no
import or job overwrites it. Tiers: 1 primary, official or peer-reviewed; 2 scholarly or institutional reference;
3 general reference; 4 weak. A subdomain of a known publisher starts with its parent's rating
(news.un.org starts as "United Nations (news.un.org)", tier 1, `browser_only`).

The policy values (`evidence.models.Publisher.Fetch`):

| `fetch_policy` | Meaning |
|---|---|
| `allowed` | Jobs may fetch it, subject to robots.txt and the rest. The default. |
| `api_only` | Jobs may fetch only URLs under its `api_base` (a prefix, optionally with a query parameter the URL must carry: "https://www.loc.gov/ ?fo=json"; several joined by " \| "), and only when `api_needs_key` is false or `api_key_setting` names a setting that is set. A keyed API without its key stays off ([ADR 0037](../adr/0037-source-ratings-2026-11-28.md)). |
| `browser_only` | Blocks or forbids automated readers. Jobs never fetch it and no agent reads it, with any tool; a person reads it in their own browser, from the console's Review page (ADR 0046). |
| `citation_only` | Jobs never fetch it and no agent reads it; the link may be cited once a person has read it in their own browser (ADR 0037, ADR 0046). |
| `forbidden` | Never fetched and never cited. |

Known publishers that start as something other than `allowed`:

| Domain | Tier | Policy | Access note |
|---|---|---|---|
| britannica.com | 2 | `browser_only` | Blocks automated fetching: a person reads it in their own browser. |
| openstax.org | unrated | `forbidden` | Never read or cite. |
| worldhistory.org | 3 | `browser_only` | Blocks automated fetching. |
| unesco.org, whc.unesco.org | 2 | `browser_only` | Often blocks automated fetching. |
| un.org | 1 | `browser_only` | Refuses automated readers. |
| nobelprize.org | 1 | `browser_only` | Refuses automated readers. |

## What seed_sources writes

The `seed_sources` job (weekly) runs `ingest.seed.seed()` ([ingest/seed.py](../../ingest/seed.py)). It is safe to
re-run:

1. **Publishers.** For every domain in `PUBLISHERS` and every feed's publisher, it creates a missing row from
   `defaults_for()` overlaid with the `PUBLISHERS` entry, inside `revising("job:seed_sources")`. An existing row is
   never changed here (review state belongs to review, AGENTS.md rule 7).
2. **Verdicts.** `apply_verdicts()` writes each `VERDICTS` entry into its publisher's `access_notes`, prefixed
   "Terms check 2026-11-26" (`CHECKED`), and sets the `fetch_policy` where the verdict names one (never touching a
   `forbidden` row). It runs **once per database**: the `JobState` row "terms_verdicts_v1" records that it has, and
   later admin edits are the owner's and stay.
3. **Ratings.** `ingest.ratings.apply()` turns the November 28, 2026 source-discovery round
   (`ingest/ratings/2026-11-28-*.json`, 104 sources) into Publisher policy, once per database (`JobState`
   "ratings_2026_11_28"); [below](#the-november-28-ratings).
4. **Feeds.** It creates each missing `FEEDS` row. An existing feed keeps its `enabled` flag and state, and only
   gains config keys it lacks.

`SKIPPED` lists the sources considered and not wired, with why; `manage.py digest --sources` prints it.

The publishers `PUBLISHERS` adds beyond `KNOWN`:

| Domain | Name | Tier | License |
|---|---|---|---|
| wikidata.org | Wikidata | 3 | CC0 1.0 |
| federalregister.gov | Federal Register (US) | 1 | public domain (US government work) |
| sec.gov | US Securities and Exchange Commission (EDGAR) | 1 | public domain (US government work); filings are the filers' |
| thegazette.co.uk | The Gazette (UK) | 1 | Open Government Licence v3.0 |
| api.nobelprize.org | Nobel Prize API | 1 | CC0 1.0 (data); policy `allowed` |
| raw.githubusercontent.com | GitHub raw files | unrated | per repository |
| openalex.org | OpenAlex | 2 | CC0 1.0 (metadata) |
| crossref.org | Crossref | 2 | metadata: facts, no rights reserved |
| doi.org | DOI resolver | 2 | per publisher |
| europeana.eu | Europeana | 2 | metadata CC0; media per item (edm:rights) |
| worldbank.org | World Bank Open Data | 1 | CC BY 4.0 |
| theguardian.com, bbc.com, npr.org, aljazeera.com, apnews.com | (each by name) | 3 | all rights reserved |
| olympedia.org | Olympedia | unrated | © OlyMADMen |

wikipedia.org, who.int, history.state.gov, loc.gov and si.edu take their `KNOWN` defaults (tiers 3, 1, 1, 1, 2).

## The verdict for each source

From `ingest/seed.py` `VERDICTS` (each publisher's `access_notes`) and `NEVER_FETCH`; the Wayback row is from
ADR 0013, since archive.org has no verdict entry. "Fetched by" names the job or adapter that reads it.

| Source | What jobs may do | Relied on |
|---|---|---|
| Wikipedia (MediaWiki API) | Read through the API, serially (`portal`, `year_pages`, entities, link health). Keep the CC BY-SA 4.0 attribution on every Document and Candidate. | Wikimedia User-Agent policy: descriptive User-Agent with contact. |
| Wikidata | Query service and API, serially. | CC0. |
| Wayback availability API | Look up a snapshot for a dead link. | robots.txt blocks only its control and report paths; no stated rate rule (we send 1 a second). |
| WHO Disease Outbreak News API | Metadata and a short summary (`who_don`), acknowledging WHO with the URL. | who.int terms: non-commercial research or private study; CC BY-NC-SA 3.0 IGO. |
| Federal Register API | Fetch (`federal_register`). | US government work; robots.txt blocks only search and auth paths. |
| SEC EDGAR (sec.gov, data.sec.gov) | The submissions API and single filings under `/Archives/edgar/data`, for evidence packs (`prefetch_sources`); no crawling, never `/cgi-bin`. Checked 2026-11-27 ([ADR 0036](../adr/0036-evidence-packs.md)). | "Accessing EDGAR Data": at most 10 requests a second, declare the user agent, no crawling; sec.gov privacy page: public information, may be copied without permission, cite the SEC. data.sec.gov has no robots.txt. The SEC's sample User-Agent has an e-mail; ours has `INGEST_CONTACT`: if refused, the filings show as `blocked`. |
| The Gazette (UK) | State notices (codes 11xx) only, never personal-data notices (`gazette`). | Open Government Licence v3.0, with its attribution line; Crawl-delay 10. |
| Nobel Prize API (api.nobelprize.org) | Fetch (`nobel`, the `nobel` adapter); cache locally, don't alter, don't imply endorsement. The website stays `browser_only`. | API data CC0. |
| Office of the Historian Milestones (GitHub raw files) | Weekly at most (`historian_sync`). Never history.state.gov's search. | CC0 / US public domain; GitHub's acceptable-use policy (no excessive bulk activity); robots.txt disallows the site's search, Crawl-delay 20. |
| OpenAlex | Keyless search, no `mailto` (no personal email). | CC0 metadata; 10 requests a second, small daily budget. |
| Crossref | One request a second, one at a time; titles as snippets, not abstracts. | Public pool etiquette. |
| Library of Congress, Chronicling America | JSON (`fo=json`) from the collections and manuscripts paths only. | loc.gov/legal: at most 10 requests a minute; robots.txt disallows search, Crawl-delay 5. |
| Smithsonian Open Access | Search with a key; store metadata only. | CC0 metadata; an api.data.gov key. |
| Europeana | Search with a key in a header; metadata only. | Metadata CC0, media per `edm:rights`; personal key for non-production only. |
| World Bank Indicators | Reasonable volume; attribute "The World Bank: <dataset>: <source>". | CC BY 4.0. |
| UN News, UN press releases | Headline, date and link only, if ever enabled. Feeds seeded disabled; publishers `browser_only`. | un.org terms: personal, non-commercial use, no right to compile; Crawl-delay 10. |
| UNESCO World Heritage list RSS | Headline and link only, if ever enabled. Feed seeded disabled; publisher `browser_only`. | robots.txt `Content-Signal: ai-train=no, use=reference`; tdmrep.json `tdm-reservation: 1`. |
| The Guardian | Nothing. Citation only. | Open Platform terms 6(g) and 5. |
| BBC News | Nothing. Links only. | Terms of use §15; robots.txt bans TDM and AI. |
| NPR | Nothing. Links only. | Feed copyright: for personal use only. |
| Al Jazeera | Nothing. Links only. | robots.txt notice. |
| Associated Press | Nothing. Links only. | No public feed or API; robots.txt disallows its feeds. |
| Olympedia | Nothing. Links and names only. | No published terms for automated reuse; Crawl-delay 10. |
| Britannica | Nothing; a person reads it in their own browser (ADR 0046). | Terms forbid automated access. |
| OpenStax | Nothing, ever, and never cited. | Terms forbid use of its textbooks by AI systems. |

The Guardian, BBC, NPR, Al Jazeera and AP are blocked twice: by `NEVER_FETCH`, and by their publishers'
`fetch_policy`, which the verdicts set to `browser_only`. Olympedia's row stays `allowed`; `NEVER_FETCH` alone keeps
jobs off it.

## The November 28 ratings

[ingest/ratings.py](../../ingest/ratings.py) ([ADR 0037](../adr/0037-source-ratings-2026-11-28.md), a second batch, [ADR 0044](../adr/0044-source-ratings-batch-2.md), and a third, [ADR 0049](../adr/0049-source-ratings-batch-3.md); see the end of this section). Each record of
the round names a source, its domains, a verdict, whether a key is needed, the license, what robots.txt said, the
terms URL and clause, rate limits, eras, regions and notes. `decide()` makes each one a `Decision`:

| Record | Becomes |
|---|---|
| `browser_only`, `citation_only` | That `fetch_policy`, whatever the confidence; no tier. |
| `forbidden` | `citation_only` (`POLICY_FOR`): here `forbidden` also bars citing, as for OpenStax. |
| `allowed`, `api_only`, confident | The policy, a tier from `TIERS` where the row has none, and for `api_only` the base from `API_BASES` and the key rule (`_needs_key`; `KEY_SETTINGS` is empty, so keyed APIs stay off). |
| `allowed`, `api_only`, low confidence | No policy change: the row keeps its state (unrated stays unrated). Low confidence is any match of `LOW_CONFIDENCE` in the license, robots, clause or notes: "not re-verified", "unverified", "not read", "not fetched", "bot wall", "403", "429", "500", "503", "timed out", "via search", "summarized", "paraphrase", "low confidence", "terms not" and the like. |
| `CORPORA` (Perseus / First1KGreek TEI, CBETA, papyri.info) | A note only; no fetcher yet (`follow_ups()`). |

`domains()` drops "www.", skips paths and shared hosts (github.com, raw.githubusercontent.com) and anything that isn't
a host name, and folds a listed subdomain into a listed parent. `merged()` combines the records per domain: the
strictest applied policy wins, API bases join with " | ". `apply()` writes, inside `revising("job:seed_sources")`
through `timeline.services.apply_changes`: a missing row is created from `defaults_for`; each record's note ("Rated
2026-11-28 (source discovery, ADR 0037): <verdict>, applied | not applied: low confidence (…). Terms: … Clause: …
robots.txt: … API: …") is appended to `access_notes`; a `forbidden` row is never changed. On the scratch database:
117 domains, 6 `allowed`, 5 `api_only`, 26 `browser_only`, 26 `citation_only`, 54 notes only.

**Batches.** Each round is a `Batch` (`BATCH_1`, `BATCH_2`, `BATCH_3`, `BATCHES`): its label in the notes, its own JobState (a
database that applied the first still applies the second once), its ADR and its files. `seed_sources` calls
`apply_all`, which applies each batch in order; `decisions`, `merged`, `apply` and `follow_ups` take a batch and
default to the first. A later rating never loosens a restrictive policy a row already has: `citation_only` stays
when a batch says `browser_only` (the note is still added, and `kept_stricter` counts it).

**Batch 2** (`ingest/ratings/2026-11-28b-sources.json`, label "2026-11-28b", JobState "ratings_2026_11_28b"; ADR 0044)
has 44 records for the international bodies, sport, broadcasters, science, museums, reference, government and
standards sites the first round did not read, and eight more. Its rule for a site that refused the fetch (403, 429,
a TLS failure) or whose terms were unread is `browser_only`, and a permissive verdict there is not applied.
Counts on the records: 26 `browser_only`, 3 `citation_only` (Iranica, ETSI, History.com), 11 `allowed` (3 applied:
ITU, National Park Service, World Bank; the other 8 are low confidence), 4 `api_only` (2 applied: PubMed Central and
the NCBI site, through E-utilities, OAI-PMH and the ID converter; the Smithsonian and the Internet Archive are low
confidence). Nine sites name AI crawlers in robots.txt (Nature, the African Union, UNESCO and its two sub-sites, the
British Museum, africa.si.edu, americanhistory.si.edu, GlobalSecurity), and ten refused robots.txt. PMC's web pages
stay closed to scripts: its robots.txt disallows `/`, and its copyright page bars bulk download from the pages.

**Batch 3** (`ingest/ratings/2026-11-28c-sources.json`, label "2026-11-28c", JobState "ratings_2026_11_28c"; ADR 0049)
has 33 records for the domains agents were refused after batch 2 (encyclopedias, university presses and libraries,
religious-text libraries, magazines, open textbooks). Same rules. Counts: 24 `browser_only`, 6 `citation_only`
(Christianity Today, the Vatican, JSTOR, Cambridge, TheCollector, Encyclopedia.com) and 3 `allowed`, all applied:
penelope.uchicago.edu (public-domain pages only; it blocks Wget), ccel.org (non-commercial use, Crawl-delay 10) and
doi.org (the resolver; the publisher it redirects to is checked separately). A site whose robots.txt names AI
crawlers with `Disallow: /`, or whose terms page refused us, is never `allowed`.

## Citation-only sources and browser_only publishers

A **citation-only** source is one we may link to and a person may read in their own browser, but no job ever fetches
and no agent reads ([ADR 0046](../adr/0046-the-owners-review-queue.md)). News
corroboration comes mostly from these: the links Wikipedia's editors cite in the Current events portal. The portal
job stores each item's external links (URL, anchor text, domain) in the candidate's `details.external`. They are
never requested by ingestion, and the `write_event` payload lists each with its publisher's tier and
`fetch_policy`, so the agent knows which ones it may not read: those are the owner's.

What keeps jobs off them:

- **The Fetcher** refuses them before any request (checks 2 and 3 above).
- **Link health** never selects a citation whose host is in `NEVER_FETCH` or whose publisher (or nearest parent
  row) isn't `allowed`. A person re-reads those pages, from the console's Review page.
- **Links built, not fetched.** The Nobel job and adapter build nobelprize.org prize links for candidates and
  suggestions without requesting them; the adapter's hits say "nobelprize.org is browser_only: a person reads it in their own browser, never an agent (ADR 0046)".

Publishers that are `browser_only` after seeding: britannica.com, worldhistory.org, unesco.org, whc.unesco.org,
un.org (and its subdomains news.un.org and press.un.org, which start with its rating), nobelprize.org, and the news
publishers the verdicts set: theguardian.com, bbc.co.uk, bbc.com, npr.org, aljazeera.com, apnews.com.

## The same policy for an agent's own reads

An agent that reads a page itself (WebFetch, `curl`) bypasses the Fetcher, and in live rounds agents did read a
`citation_only` news site whose robots.txt names Claude's crawlers, and a `browser_only` one. So the agent API
answers the policy for any URL: `GET /api/agent/policy?url=…` (`agentapi/policy.py`,
[ADR 0042](../adr/0042-deferred-releases-and-the-fetch-policy-endpoint.md)), from the same rows the Fetcher and
the evidence-pack job read, fetching nothing. Every task skill calls it before a scripted fetch of a source page.

For an agent's script it is stricter than "a job may fetch": `may_fetch` is true only for a rated `allowed`
publisher, or an `api_only` one under its `api_base` (with its key, where it needs one). `forbidden`,
`citation_only`, `browser_only`, NEVER_FETCH hosts, unrated domains (no tier: nobody has read the terms), a host the
evidence-pack job found shutting AI crawlers out in robots.txt (`ai_blocked`) and one that refused our User-Agent or
walled us lately (`robots`, `blocked`) are all `may_fetch: false`. `browser_read` says whether a person may read it
in their own browser instead: true for all of them but `forbidden`. No agent reads such a page with any tool (no
in-app browser, no Claude in Chrome, desktop or cloud: [ADR 0046](../adr/0046-the-owners-review-queue.md)): it uses
another source, or releases the task with `{"needs": "browser"}` for the owner's Review page
([work queue](work-queue-and-agents.md#the-fetch-policy-for-an-agents-own-reads)).

## Evidence packs: full text, privately, for a while

The `prefetch_sources` job ([ingestion](ingestion.md#evidence-packs), [ADR 0036](../adr/0036-evidence-packs.md))
is the one place a job keeps a page's **full text**: the clean main text and the raw bytes, in the private `raw`
store under `pages/`, so agents can check excerpts against it. What holds it to the terms:

- **Only rated, `allowed` publishers.** Jobs keep full text only from publishers whose terms were read and rated
  `allowed`: the nearest Publisher row has a tier and `fetch_policy` `allowed`. An unrated domain is never requested
  by the job (`unrated` in the task's `unreadable` list; `manage.py unrated_domains` lists them for rating), nor is
  a `browser_only` or `forbidden` publisher or a NEVER_FETCH host (`policy_reason`, before the Fetcher's own
  checks), and `store_page` checks the policy again just before writing; a stored page whose publisher loses its
  rating is purged. Those URLs go in the task's `unreadable` list for an agent's browser. A page that reserves text and data
  mining (the W3C TDM Reservation Protocol: a `tdm-reservation: 1` header or meta tag) is never stored either
  (`tdm_reserved`), whatever its publisher's policy.
- **Official APIs, under their own verdicts.** A catalog page that refuses scripts (an OpenAlex work, a DOI, a
  Library of Congress item, a Smithsonian or Europeana record) is read through its API instead, never as a page,
  and only what that API's verdict allows is kept: OpenAlex (CC0 metadata, the abstract), Crossref (titles and
  metadata, never abstracts), loc.gov `?fo=json` (at most 10 requests a minute), the Smithsonian Open Access API
  and Europeana's Record API (keys in headers; metadata only). The clause relied on is stored with each record
  ([ingestion](ingestion.md#evidence-packs)).
- **Rating is the gate.** Rating a publisher (a tier, in the admin, as `human:`) is what lets the job fetch it:
  read its terms first ([adding a source](#adding-a-source)) and record the verdict in `access_notes`.
- **Never published.** The text is in neither a snapshot, a release, the public page nor the database; the agent
  API serves it only to the agent holding a task whose pack names it, or to a reviewer (scope `review`) when an
  entry in review cites it.
- **Retention.** `EVIDENCE_RETENTION_DAYS` (180 days; news and everything else) or `EVIDENCE_RETENTION_DAYS_OPEN`
  (365 days, when the publisher's `license` is CC0, CC BY, public domain or the Open Government Licence) after the
  last fetch, then the text and bytes are deleted and the packs that quoted them lose those passages.
- **Payloads quote passages, not pages**: up to 5 passages of at most 50 words per stored page, 20,000 bytes a
  pack. A cited excerpt stays at most 25 words.

The feed jobs' rule is unchanged: from a news feed they keep the headline, date, link and a short lead.

## OpenStax is refused everywhere

OpenStax's terms forbid use of its textbooks by AI systems, so it is never read and never cited (AGENTS.md rule 6).
Each layer refuses it on its own:

| Layer | What refuses it |
|---|---|
| Jobs | `ingest/policy.py` `NEVER_FETCH["openstax.org"]`: the Fetcher raises `Refused`. Evidence packs list it `forbidden` and never request it. |
| Starting rating | `evidence/publishers.py` `KNOWN["openstax.org"]`: `fetch_policy` `forbidden`. |
| The database: publishers | Check constraint `publisher_openstax_forbidden` on `evidence.Publisher`: a publisher whose domain is openstax.org or a subdomain must be `forbidden`. |
| The database: citations | Check constraint `citation_never_openstax` on `evidence.Citation`: no citation URL on openstax.org or a subdomain (`evidence.models.OPENSTAX_RE`). |
| The agents' door | `evidence.conflicts.citation_for()` returns nothing for a `forbidden` publisher, so `record_evidence` raises "not citable". |
| Seeding | `apply_verdicts()` never changes a `forbidden` row's policy. |

## Lookup adapters

The lookup adapters ([ingest/lookup.py](../../ingest/lookup.py)) search open APIs for pages that may support a claim
or a story. Each returns suggestions only (`SuggestedSource` rows and task payloads, with at most 25 words of
snippet); an agent reads the page and records evidence itself, in a `verify_claim` result through the agent API
(the owner can use `manage.py facts record`). Nothing in the lookups writes Evidence or changes a claim's status.

They run in `ADAPTERS` order, specialists first:

| Adapter | Source | Applies when | Key |
|---|---|---|---|
| `nobel` | Nobel Prize API | year ≥ 1901 and the text says "nobel" | none |
| `worldbank` | World Bank Indicators | year ≥ 1960, the text mentions population, GDP or economy, and an entity has an ISO code (P297) | none |
| `historian` | Milestones Documents already synced (no request) | 1750–2000 | none |
| `chronicling_america` | Library of Congress | 1770–1963 | none |
| `loc` | Library of Congress manuscripts | 1400–2000 | none |
| `smithsonian` | Smithsonian Open Access | always | `SMITHSONIAN_API_KEY` |
| `europeana` | Europeana Search API | always | `EUROPEANA_API_KEY` |
| `openalex` | OpenAlex works | always | none |
| `crossref` | Crossref works | always | none |

An adapter is **enabled** when its key (if it needs one) is set and its `Feed` row (`config.job` = `lookup`,
`config.adapter` = its name) is enabled or absent. A disabled adapter is skipped and counted as `<name>_disabled`;
an adapter that raises is counted as `<name>_errors` and the others still run.

## Keys

API keys come only from the environment, which `config/settings.py` loads from .env (`load_dotenv`). `.env.example`
lists them empty. Without its key an adapter is disabled cleanly, and it starts working once the key is set.

| Setting | Adapter | How it is sent | Key tier |
|---|---|---|---|
| `SMITHSONIAN_API_KEY` | `smithsonian` | api.data.gov's `X-Api-Key` header on api.si.edu (never the `api_key` query parameter: URLs reach logs) | An api.data.gov key (`config/settings.py` comment; the si.edu verdict). Neither the ADR nor the code names a tier beyond that. |
| `EUROPEANA_API_KEY` | `europeana` | The `X-Api-Key` header (Europeana deprecated the `wskey` parameter, and keys in URLs leak into logs) | The europeana.eu verdict: a personal key is for non-production use only; request a Project key (one per service) before production or hosted scheduling. ADR 0013 says the same. The code doesn't check which kind of key it has. |

### Keeping keys out of logs, errors and fixtures

- **Headers, never URLs.** Both keyed adapters send their key in an `X-Api-Key` header (`ingest/lookup.py`), so it
  is never part of a URL that a log line, an error or a cassette could hold. Hosted, `httpx` and `httpcore` log at
  `WARNING` only (`config/settings.py` `LOGGING`), since at `INFO` they print every request's full URL; on November
  26, 2026 that printed the Smithsonian key (then a query parameter) into Heroku's log buffer
  ([ADR 0020](../adr/0020-heroku-hosting.md)). `LookupKeyTests` checks the header.
- **Masking.** `ingest/policy.py` `mask_secrets(text)` replaces the value of every setting in `SECRET_SETTINGS`
  (`SMITHSONIAN_API_KEY`, `EUROPEANA_API_KEY`, when at least 6 characters long) with `***`, then masks any
  `api_key=`, `apikey=`, `api-key=`, `wskey=`, `key=` or `token=` parameter value. The runner applies it to every
  `ctx.error()` message, to the `FetchRun.error` it stores, and to the one-line log per run
  ([ingestion](ingestion.md#the-job-runner)). `test_secrets_are_masked` checks it.
- **Run logs.** The Fetcher logs each request as scheme, host and path, with any query string shown as `?…`
  (`ingest/http.py` `_shown`), so its lines never carry a key parameter. Every line of a run's captured log
  (`ingest/runlog.py`) also goes through `mask_secrets` and `runlog.mask` (bearer tokens, `password=`-style
  values, a URL's `user:password@`), and `httpx`/`httpcore` records below `WARNING` are never kept
  ([ADR 0031](../adr/0031-a-simpler-console-and-run-logs.md)). `RunLogTests` checks it.
- **Lookup errors** are only counted, never logged with their message.
- **Cassettes.** `tests/cassette.py` keys recorded responses by method and URL with `api_key` and `wskey` values
  masked (`KEY_RE`), and matches requests the same way, so a test with a real key in its URL still finds its
  recording. `RecordingTransport` stores only the response's status, a few headers and the body, never request
  headers, so a header key (Smithsonian's, Europeana's) is never recorded.

### The User-Agent

`config/settings.py` `INGEST_USER_AGENT` is "<SITE_NAME>Bot/0.1 (history timeline research; +<INGEST_CONTACT>)
python-httpx". `INGEST_CONTACT` must be a generic project address or URL, never a person's details; it defaults to
the project's GitHub repository (Wikimedia requires a contact). The robots.txt token is the part before "/".

## Adding a source

1. **Read its terms first**: the terms of use, any API terms, robots.txt (including AI or TDM signals such as
   `Content-Signal` or tdmrep.json) and the license of the data. Decide what jobs may keep: metadata, a headline and
   link, a lead of at most 60 words from the feed, or nothing.
2. **If jobs may not read it**, add the host to `NEVER_FETCH` with the reason, and to `SKIPPED` if it was a
   candidate feed. Its links can still be cited and read by a person in their own browser.
3. **If they may**, add its publisher defaults to `PUBLISHERS` (tier, license; `fetch_policy` `allowed` on a
   subdomain whose parent isn't), its verdict to `VERDICTS` with the clause relied on, a `HOST_DELAY` if it states
   a rate or Crawl-delay, and its feed to `FEEDS`. A key goes in `config/settings.py`, `.env.example` (empty),
   `SECRET_SETTINGS`, and the adapter's `key_setting`; send it in a header when the API allows.
4. **Record the verdict** in [ADR 0013](../adr/0013-source-policy.md)'s table too, with the same clause.
5. **Existing databases.** `apply_verdicts()` has already run there (`JobState` "terms_verdicts_v1"), so a new
   `VERDICTS` entry reaches only new databases. On an existing one, write the access note and policy on the
   Publisher row in the admin (it runs as `human:<username>`). Renaming the JobState would re-apply every verdict,
   overwriting the owner's later edits to those rows.
6. **Test it** against a recorded cassette (`tests/record_fixtures.py`), with no keys in the recording.

## Changing it

| Change | What it needs |
|---|---|
| Change a verdict | `ingest/policy.py` (`NEVER_FETCH`), the Publisher row (admin, as `human:`), `ingest/seed.py` `VERDICTS`, and ADR 0013's table, together. |
| A new rating round | A new `ingest/ratings/<date>-*.json`, a new JobState name and its ADR; never rewrite an applied one (it ran once per database). Existing rows change in the admin, as `human:`. |
| An API base or a key for an `api_only` publisher | The row's `api_base`, `api_needs_key`, `api_key_setting` in the admin; a key goes in `config/settings.py`, `.env.example` and `SECRET_SETTINGS` first. |
| Enable a disabled feed (UN, UNESCO) | The owner's call: set its publisher to `allowed` in the admin and the feed `enabled`. Its config keeps `headline_only`. |
| A new host delay | `ingest/policy.py` `HOST_DELAY`, with the rule it comes from in a comment. |
| A new secret setting | Add it to `SECRET_SETTINGS`; if it travels as a query parameter not matched by the masking pattern, extend the pattern and `tests/cassette.py` `KEY_RE`. |
| A new starting rating | `evidence/publishers.py` `KNOWN`. It applies only to rows created after the change. |
| Allow OpenStax | Not possible without a migration dropping two check constraints. Don't. |
