# 0044 — A second batch of source ratings: 44 more records, a Batch for each round, and a rating never loosens a restrictive policy

**Status:** proposed (November 2026); amends [0037](0037-source-ratings-2026-11-28.md) (the ratings code serves more than one batch; a later rating cannot loosen an earlier restrictive one)

## Context

Agents check `GET /api/agent/policy?url=` before they fetch a page (ADR 0042), and a domain with no rating is
refused. The first agent rounds after ADR 0037 released dozens of tasks over domains it had not rated or had left
unread: international bodies (WTO, African Union, OAS, Council of the EU, UN, UNESCO), sport (FIFA, IOC),
broadcasters (PBS, Rappler), science (Nature, the Royal Society, PubMed Central), museums (the Met's web pages, the
British Museum, Smarthistory, the Smithsonian sites), reference (World History Encyclopedia, Iranica,
GlobalSecurity, GSMA, doi.org), government (FCC, State, the White House), standards bodies (ETSI, ITU) and the
Internet Archive. A new read of each site's robots.txt and terms, with the same method and record format as the first
round, covers them and eight more sites that Wikipedia cites often for world history and current events (the CIA
World Factbook, the National Park Service, the UK National Archives, the World Bank, History.com, the US Holocaust
Memorial Museum, the International Court of Justice, the ILO).

Many fetches failed in this round: eleven sites answered 403 or 429 to the robots.txt request (PBS, Rappler, the OAS,
the Council of the EU, the UN, the Met, Smarthistory, africa.si.edu, FCC, State, the US Holocaust Memorial Museum),
one refused the TLS handshake (sice.oas.org), our fetch tool refuses web.archive.org, and some terms pages were
refused or never loaded. Those sites were not retried. Nine more name AI crawlers in robots.txt with `Disallow: /`
(Nature, the African Union, UNESCO and its two World Heritage and Intangible Heritage sub-sites, the British Museum, africa.si.edu, americanhistory.si.edu,
GlobalSecurity).

## Decision

**A second record file**, `ingest/ratings/2026-11-28b-sources.json` (44 records, the first batch's format), applied by
the same rules as ADR 0037: restrictive verdicts are recorded whatever the confidence, permissive ones only when no
field of the record says it rests on something unread (`LOW_CONFIDENCE`). Where a site's terms or robots.txt could
not be read, the rating is `browser_only` (scripts refused, an agent may read it in a browser) or, for a permissive
verdict, stays unapplied with a note saying why. Nothing is rated `allowed` on robots.txt alone.

Result: 26 `browser_only`, 3 `citation_only` (Iranica, ETSI, History.com), 11 `allowed` records and 4 `api_only`
records. Applied: `allowed` for the ITU, the National Park Service and the World Bank (tier 1; terms read: private
and non-commercial use, public domain, non-commercial use with attribution); `api_only` for PubMed Central and NCBI
(E-utilities, the PMC OAI-PMH service and the ID converter; PMC's copyright page bars bulk download from the web
pages, and pmc.ncbi.nlm.nih.gov's robots.txt disallows `/` for everyone; no key). Not applied, low confidence: the
WTO, the IOC, the Royal Society, doi.org, the White House, the CIA, the ICJ, the ILO (all `allowed`), and the
Smithsonian and the Internet Archive (`api_only`). They stay as they were; their notes say what to read.

**A `Batch` for each round** (`ingest/ratings.py`: `BATCH_1`, `BATCH_2`, `BATCHES`): a label for the notes
("Rated 2026-11-28b (source discovery, ADR 0044)"), its own JobState (`ratings_2026_11_28b`, so a database that
applied batch 1 still applies batch 2 once), its ADR and its files. `seed_sources` calls `apply_all`, which applies
each batch in order. `decisions`, `merged`, `apply` and `follow_ups` take a batch and default to the first.

**A rating never loosens a restrictive policy.** When a row is already `citation_only` (or `forbidden`) and a rating
says `browser_only`, the stricter policy stays and the note is still appended. ADR 0037 did not need this with one
batch; with two, an overlap such as the Wayback Machine or the Smithsonian would otherwise reopen a closed site.

**AI-crawler blocks stay with the Fetcher** (ADR 0037): the evidence-pack job does not read a site whose robots.txt
names an AI crawler and disallows the URL. The sites above that do so are rated `browser_only` too, so an agent's
script does not read them either.

## Consequences

- Twenty-nine domains now answer `browser_only` or `citation_only` in the policy lookup, with a note saying why,
  instead of "unrated". Six became readable by script: itu.int, nps.gov and worldbank.org (`allowed`), and
  pmc.ncbi.nlm.nih.gov, eutils.ncbi.nlm.nih.gov and ncbi.nlm.nih.gov (`api_only`, only through the listed services).
- Ten domains keep their earlier state (unrated, or batch 1's) because a rating rests on terms never read, or only on
  a search snippet. A person with a browser can re-rate them: read the terms, then add a record to a new batch (this
  file is not edited).
- The Met's Open Access API, the Smithsonian's keyed API and the Internet Archive's APIs keep their batch 1 state.
