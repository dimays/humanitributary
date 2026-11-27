---
title: Glossary
summary: Every term the guide uses, in a sentence or two, with the chapter that explains it.
order: 120
covers:
  - "*/models.py"
---

The platform has its own words for its pieces: branches and events, claims and evidence, candidates and tasks.
This page defines each one briefly, in alphabetical order, and links to the chapter that explains it in full.
Table and field names are as they appear in the code.

## Terms

| Term | Meaning | Explained in |
|---|---|---|
| **Access notes** | A Publisher's record of its terms for automated reading: the verdict and the clause it rests on. | [Sources and terms](sources-and-terms.md) |
| **Actor** | Who made a canonical change, written `agent:<name>`, `human:<username>` or `job:<command>`. Every Revision records one, and `revising()` refuses any other shape. | [Revisions](revisions.md) |
| **Additive key** | A derived key: a snapshot key the export computes at publish time from other rows, never stored as content and ignored by the loader (`publish/content.py` `ADDITIVE`; today only an event's `singleSource`). | [Publishing](publishing.md#the-snapshot-format) |
| **Agent** | A Claude session that claims tasks from the queue over the agent API and whose results the API writes through the service layer, into review. The only part of the platform that calls a language model. | [Work queue and agents](work-queue-and-agents.md) |
| **Agent API** | The agents' HTTP door under `/api/agent/` (`agentapi/`, served by `web`): the queue, reads, and results checked against a JSON Schema per task kind, then applied as `agent:<name>`. Agents never hold database credentials. | [Work queue and agents](work-queue-and-agents.md) |
| **Agent token** | An `AgentToken`: the bearer token an agent uses on the agent API, made by the owner with `manage.py agent_token create`, stored only as its sha256, scoped to the task kinds it may claim, rate-limited and revocable. | [Work queue and agents](work-queue-and-agents.md) |
| **AgentTask** | One piece of judgment work in the queue (write an event, verify a claim, review a proposal), with a target, a payload, a priority and a status (queued, claimed, done, failed, cancelled). | [Work queue and agents](work-queue-and-agents.md) |
| **Alias matcher** | Matches names in text without wikilinks (news items) against known entities' labels and aliases. Less certain than a wikilink, so routing weighs it less. | [Ingestion](ingestion.md) |
| **As-written claim** | The record claim covering a whole entry as the legacy content states it: date, title and text together, cited by the entry's cites. Atomic claims are its children. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Atomic claim** | A claim on one part of an entry (a date, a place, a number, a named actor), split out of the as-written claim so evidence can attach to exactly what it supports. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Audit (task)** | A task to fill in a branch that is much sparser than its peers, queued by the THIN rule instead of a proposal. | [Branch governance](branch-governance.md) |
| **Branch** | A line on the timeline: a society, polity, lineage, faith, idea or era, with a start, an optional end and a region. A kind of Entry. | [Content model](content-model.md) |
| **BranchEntity** | Ties a Wikidata item to a branch, with a role and a weight. It routes new material to branches deterministically. Working state, not canonical. | [Ingestion](ingestion.md) |
| **BranchLink** | A branch's parent link (split from, grew out of) or into link (became, merged into). An origin link is a parent link with how it happened and a note. | [Content model](content-model.md) |
| **BranchMetric** | A stored measurement of one branch's shape (events, span, density, gaps, phases, places), kept when it changes. | [Branch governance](branch-governance.md) |
| **BranchProposal** | See *proposal*. | [Branch governance](branch-governance.md) |
| **browser_only** | A Publisher's `fetch_policy` for a site no job may fetch. Agents read it in a browser. | [Sources and terms](sources-and-terms.md) |
| **Candidate** | A proposed timeline item built from one or more documents: a title, a date guess, entities, branch scores, a possible duplicate, a cluster and a priority. Kinds: new_event, update, new_branch_signal. | [Ingestion](ingestion.md) |
| **Canonical** | The tables that hold what the timeline says and its evidence (every table in `timeline` and `evidence`). They accept writes only inside `revising()`, and each change leaves a Revision. | [Revisions](revisions.md) |
| **Change report** | `changes.json` and `changes.md` beside each release: what it adds, changes (with the keys) and retracts, by branch, compared with the release the pointer named before it. | [Publishing](publishing.md#the-change-report) |
| **Citation** | One cited URL (https only, never openstax.org), shared by every claim that cites it, with the result of its last check. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Citation-only** | A publisher we may cite but no job may fetch: one in `ingest/policy.py` `NEVER_FETCH`, or one whose `fetch_policy` isn't `allowed`. | [Sources and terms](sources-and-terms.md) |
| **Claim** | One statement the timeline makes about an entry, with a computed status and confidence and a date to re-read it. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Cluster** | Candidates about the same story, grouped by a cluster key, so one story gets one `write_event` task. | [Ingestion](ingestion.md) |
| **Confidence** | A number from 0 to 1, computed from a claim's evidence: independent witnesses weighted by tier, stance, method and freshness, lowered by conflicts. Never typed in. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Connection** | A sourced link from one entry to another, with a short note. | [Content model](content-model.md) |
| **Content wave** | A stretch of history cut into equal windows (W1 1925 to this year in 5-year windows … W6 3500–1000 BCE in 250-year ones; four times wider for faith and culture branches). The `gap_waves` job measures every branch window by window, newest wave first, and queues its gaps; the active wave moves back in time when it is nearly done. | [Content waves](content-waves.md) |
| **Contested** | A claim status: conflicting sources weigh enough against it. A contested claim is published only if the entry says the sources differ. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Corroborated** | A claim status: at least two independent witnesses fully support it. All of Wikipedia counts as one. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Covers** | A chapter's list of the files it explains, in its front matter. A change to one of them asks for the chapter to be read again. | [This guide](this-guide.md) |
| **Cutover** | November 2026, when the legacy content files stopped being imported and Postgres became the only source of truth: the files are frozen in `archive/site-data/`, and the page is built only from releases (ADR 0021). | [Publishing](publishing.md#the-loader-and-the-archive) |
| **Dedupe key** | A job's key for a task. At most one open task may exist per kind and key, so re-running a job never queues the same work twice. | [Work queue and agents](work-queue-and-agents.md) |
| **Digest** | `manage.py digest`: the Markdown summary of the queue, signals, the fact base, proposals and recent job runs that an agent session reads first. | [Operations](operations.md#is-it-healthy) |
| **Document** | A fetched page or record, by canonical URL: its latest content hash, extracted text and metadata. The raw bytes live in the `raw` object store under the content hash (`Document.raw_path`). | [Ingestion](ingestion.md) |
| **DocumentEntity** | Which entities a document mentions, with salience and a mention count. | [Ingestion](ingestion.md) |
| **DocumentVersion** | Each distinct content hash a document has had, so a changed page is detectable. | [Ingestion](ingestion.md) |
| **Draft, review, published, retracted** | An entry's status. Only published entries reach a snapshot. Retracted entries stay in the database. | [Content model](content-model.md) |
| **Entity** | A Wikidata item (by QID): label, kind, coordinates, aliases, its Wikipedia article, the facts routing needs, pageviews, and (for possible new branches) its relations: part of, follows, replaces, subclass of, and whether it is a subnational unit or a party. | [Ingestion](ingestion.md) |
| **Entry** | Anything with an id on the timeline: a branch or an event. They share one slug namespace, so claims, locations and images point at an Entry whichever kind it is. | [Content model](content-model.md) |
| **Event** | A moment or span on a branch, with a date, a title, text and an importance from 1 (landmark) to 3 (detail). A kind of Entry. | [Content model](content-model.md) |
| **EventLink** | An event's contact, blending or conflict with another branch: the page's dashed connector. | [Content model](content-model.md) |
| **Evidence** | A claim–citation pair: the citation's stance on the claim, an excerpt of at most 25 words, who checked it, how and when. Only supporting evidence is published. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Facts sweep** | `manage.py facts sweep`, the daily `facts_sweep` job: splits claims, recomputes statuses, schedules rechecks, records conflicts and queues `verify_claim` tasks. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Feed** | Something a job reads on a schedule: a URL, a publisher, an interval, an on/off switch and a config naming its job. A lookup adapter's Feed is only its switch. | [Sources and terms](sources-and-terms.md) |
| **fetch_policy** | How jobs may read a publisher: `allowed`, `browser_only` or `forbidden`. | [Sources and terms](sources-and-terms.md) |
| **Fetcher** | `ingest.http.Fetcher`, the one HTTP client every job uses. It refuses what the source policy forbids before a request leaves the machine. | [Sources and terms](sources-and-terms.md) |
| **FetchRun** | One run of one job (on one feed, for feed jobs): timings, status (running, ok, partial, failed), counts and the error, with keys masked. | [Operations](operations.md#is-it-healthy) |
| **Fill-gap task** | A `fill_gap` task: write 1–3 events for one branch in one window of a content wave, or report that nothing notable is sourceable. | [Content waves](content-waves.md) |
| **forbidden** | A Publisher's `fetch_policy` for a site that must never be fetched or cited, such as OpenStax. | [Sources and terms](sources-and-terms.md) |
| **Gap** | A window of a content wave in which a branch has no published event (empty), or fewer than a third of its peers' median (sparse). | [Content waves](content-waves.md#what-counts-as-a-gap) |
| **Gate** | `make check-pr`: every check and the tests a pull request must pass, and what CI runs. A pass writes a receipt. | [How this guide stays true](this-guide.md) |
| **Grace period** | How long a newly written current event may stay published on Wikipedia alone before it needs another source. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Hysteresis** | The rules that stop branch review from proposing the same change over and over: an open proposal is refreshed, a decided one isn't proposed again, a rejected one returns only after a cool-down and stronger, and undoing an applied change needs extra strength. | [Branch governance](branch-governance.md) |
| **Image** | A public-domain or CC0 Commons image of an entry, with its credit and license. | [Content model](content-model.md) |
| **Independent witness** | An organization, not a domain: publishers sharing a registrable domain count once, and every Wikipedia edition is one witness. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Job** | A scheduled, deterministic function registered in `ingest/job_defs.py` with a name and an interval. Jobs never call a language model. | [Ingestion](ingestion.md) |
| **JobState** | A job's bookmark between runs, such as where the second-source walk stopped or whether the terms verdicts were applied; also which jobs are paused ("paused_jobs"). | [Ingestion](ingestion.md) |
| **Lease** | An agent's claim on a task until `lease_until`. Another agent may take over a task whose lease ran out, counting an attempt; past `max_attempts` it fails. | [Work queue and agents](work-queue-and-agents.md) |
| **Legacy import** | `manage.py import_legacy`: content in the snapshot shape (`--archive`: the frozen legacy files; or a release snapshot) upserted into Postgres as `job:import_legacy`, writing only what changed and never overwriting review state. Since the cutover, only on request (`make import-archive` for an empty database). | [Publishing](publishing.md#loading-content-import_legacy) |
| **Link health** | The daily `link_health` job that re-checks cited URLs and records each result as a LinkCheck. | [Ingestion](ingestion.md) |
| **LinkCheck** | One re-check of a citation: method, HTTP status, content hash and outcome (ok, changed, redirected, dead, error, blocked, skipped). | [Ingestion](ingestion.md) |
| **Location** | Where an entry happened: a scope (place, region, global, cosmic), coordinates, a radius and a label. | [Content model](content-model.md) |
| **Lookup adapter** | Code that searches an open source (OpenAlex, Crossref, the Library of Congress …) for material that may support a claim. Its hits are suggestions, never evidence. | [Sources and terms](sources-and-terms.md) |
| **Manifest** | `releases/<version>/manifest.json` in the releases store, beside a snapshot: its version, content hash, counts, revision high-water mark, the release before it, the change totals and the list of files. | [Publishing](publishing.md) |
| **NEVER_FETCH** | The hosts in `ingest/policy.py` that no job ever requests, whatever their Publisher row says. | [Sources and terms](sources-and-terms.md) |
| **New-branch signal** | A candidate of kind new_branch_signal: an entity that keeps appearing in stories with no branch to route to. NEW-BRANCH proposes a branch for it only if it can be one (`ingest/branchable.py`). | [Ingestion](ingestion.md#new-branch-signals) |
| **Object storage** | Where every file that isn't a row lives: the `raw` store (fetched documents by hash) and the `releases` store, through `infra/storage.py`. MinIO locally, S3 or R2 in production, a directory with `STORAGE_BACKEND=local`. Write-once, except the release pointer. | [Publishing](publishing.md#releases) |
| **Operations console** | The staff-only pages under `/ops/` (`opsconsole/`): health, job runs, the queue, Revisions, releases and the content programs on one screen each, and, for operators, a few audited actions. | [The operations console](operations-console.md) |
| **OpsAction** | The audit row of one action taken from the operations console: who (`human:<username>`), what, why, what the confirmation showed, an idempotency key, the status (pending, running, done, failed, cancelled) and the result. | [The operations console](operations-console.md#actions) |
| **ops_operator** | The permission (`opsconsole.ops_operator`) staff need to act from the console; without it the console is read-only. Superusers have it implicitly. | [The operations console](operations-console.md#who-can-see-it) |
| **Page hash** | A release's sha256 of the files the build reads besides the snapshot (`publish.release.PAGE_INPUTS`). With the content hash it is the release's identity, so a page-only change makes a release. | [Publishing](publishing.md#a-releases-identity-the-content-and-the-page) |
| **PaleoPin** | Where a present-day coordinate lay at a given age of the Earth, for the page's globe. | [Content model](content-model.md) |
| **Payload** | A task's JSON with everything the agent needs that isn't in its target. | [Work queue and agents](work-queue-and-agents.md) |
| **Precision** | How finely a date is known, from billion_years to day, derived from its text. | [Content model](content-model.md) |
| **Priority** | A candidate cluster's documented score from 0 to 100. Over the threshold, the cluster becomes a `write_event` task. Tasks have a priority too: higher runs first. | [Ingestion](ingestion.md) |
| **Proposal** | A BranchProposal: a rule's suggested split, merge, rename, new branch or end, with what it saw and the operations it would run. An agent accepts it (with the operations written out) or rejects it over the API; the owner applies an accepted one, or decides it from the CLI. | [Branch governance](branch-governance.md) |
| **Publisher** | A cited site, by domain, with a reliability tier, a license, a fetch policy and access notes. Canonical. | [Sources and terms](sources-and-terms.md) |
| **Publishing rule** | What an entry needs before it may be published: no contested claim unless its text says sources differ, and for an event, a non-Wikipedia source after the grace period. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **QID** | A Wikidata item's id, such as Q1490. | [Ingestion](ingestion.md) |
| **Receipt** | `var/gate-receipt.json`: the commit and file tree the gate last passed on. `gh pr create` is held unless the committed code is that tree. | [How this guide stays true](this-guide.md) |
| **Record claim** | A claim the page publishes from: an entry's as-written claim, and its why and origin claims where they exist. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Region** | A group of lanes on the page (cosmos, life, humans, europe, …), with its order. | [Content model](content-model.md) |
| **Release** | One `manage.py publish`: a version (`YYYY.MM.DD.N`), the content's hash and the page's, the snapshot's key in the releases store, counts and the last Revision included. Its files under `releases/<version>/` are written once and never overwritten. | [Publishing](publishing.md#releases) |
| **Release gate** | A check `manage.py publish` must pass before it writes a release: deterministic, build, contested and report (`publish/gates.py`). `publish --check` (`make roundtrip`) runs them and computes the change report, writing nothing. Not the same as the *gate*, `make check-pr`. | [Publishing](publishing.md#release-gates) |
| **releases/latest.json** | The pointer in the releases store: which release readers get. `publish` moves it; `publish --rollback <version>` points it back. The only release object ever rewritten. Its local mirror, `var/releases/latest`, is a symlink to the version `make release-pull` fetched. | [Publishing](publishing.md#rolling-back) |
| **revising()** | `revisions.revising(actor, reason, task)`, the only way to write a canonical row. It opens a transaction and tells the trigger who is writing and why. | [Revisions](revisions.md) |
| **Revision** | One changed canonical row, written by a Postgres trigger: the actor, the row before and after, the changed columns, the reason and the task. Append-only. | [Revisions](revisions.md) |
| **Revision high-water mark** | The id of the last Revision a release includes, so "what changed since" is every Revision after it. | [Publishing](publishing.md) |
| **Round trip** | DB → snapshot → DB: a snapshot loaded into an empty database exports to the same bytes, and loading it again writes nothing (tested on the fixture). `make roundtrip` is `publish --check`, the release gates on your database's content. | [Publishing](publishing.md#the-round-trip) |
| **Routing** | Scoring a candidate's branches from its entities through BranchEntity: its strongest mention, where a branch's own entities count most, places in its country less (split among the countries), its citizens least, and passing mentions half. | [Ingestion](ingestion.md#routing) |
| **Rules version** | The version string a set of thresholds is known by (`governance/thresholds.py` `RULES_VERSION`, `evidence/policy.py` `RULES_VERSION`). A threshold change that changes the output bumps it. | [Branch governance](branch-governance.md) |
| **Self-healing loop** | Link health, the facts sweep and branch review reading canonical content and queueing tasks for what they find broken, stale, conflicting or out of shape. | [Architecture](architecture.md#stage-6-canonical-postgres-and-validation) |
| **Service layer** | `timeline.services` (and the evidence and governance doors built on it): the functions that write canonical rows, keeping derived fields in step and writing only real changes. | [Content model](content-model.md) |
| **Single source** | A claim status: supported, but by only one independent witness, or only partly. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Single source marker** | `"singleSource": true` on an event in a release: everything supporting its record claim and that claim's atomic parts comes from one independent witness. Derived at publish time; the page shows a quiet "Single source" note above the event's sources. | [Publishing](publishing.md#from-rows-to-the-snapshot) |
| **Skill** | Instructions in `.claude/skills/` that teach an agent to drain one kind of task. | [Work queue and agents](work-queue-and-agents.md) |
| **Slug** | An entry's stable kebab-case id, unique across branches and events. | [Content model](content-model.md) |
| **Snapshot** | `releases/<version>/content.json` in the releases store (mirrored to `var/releases/<version>/`): the published content in the site's one canonical shape, never edited by hand. The page is built from it. | [Publishing](publishing.md) |
| **Sort key** | An entry's fractional index: its fixed place in the snapshot's order, so inserting an entry moves no other. | [Content model](content-model.md) |
| **source_key** | A candidate's stable key from where it came from, so re-reading a source updates the same candidate. | [Ingestion](ingestion.md) |
| **Stale** | A claim status: its recheck date has come, so it should be read again. How soon depends on what it states and how recent the entry is. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Stamp** | A chapter's record, written by `make guide-stamp`, that someone read it against the current code: the date and a hash of the files it covers. | [This guide](this-guide.md) |
| **Stance** | What a citation does for a claim: supports, partial, conflicts or unrelated. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **SuggestedSource** | A lookup adapter's hit for a claim or candidate (URL, title, short snippet, score), for an agent to read. Never evidence. | [Ingestion](ingestion.md) |
| **Task kind** | What a task asks for: write_event, verify_claim, enrich, audit, review_branch_proposal, recheck_citation, map_branch_entities. | [Work queue and agents](work-queue-and-agents.md) |
| **Tier** | A publisher's reliability: 1 primary, official or peer-reviewed; 2 scholarly or institutional reference; 3 general reference; 4 weak; empty for unrated. | [Sources and terms](sources-and-terms.md) |
| **Trigram similarity** | Postgres's `pg_trgm` measure of how alike two strings are, used to match candidates to existing events. | [Ingestion](ingestion.md) |
| **Unverified** | A claim status: no evidence supports or conflicts with it. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **Verdict** | The result of reading a source's terms: allow, drop for jobs, or links only, with the clause. Recorded in its access notes and ADR 0013. | [Sources and terms](sources-and-terms.md) |
| **Wikipedia-only** | A claim whose only supporting witness is Wikipedia. It can't be corroborated, and an event resting on it gets a `verify_claim` task for a second source. | [Evidence and fact-checking](evidence-and-fact-checking.md) |
| **WikiTitle** | The cache from an English Wikipedia title to its QID, redirects followed. An empty QID means no page or no item. | [Ingestion](ingestion.md) |

## Changing it

- A chapter that introduces a term adds it here, in alphabetical order, with a link to that chapter.
- A renamed model, field or status changes its row here in the same pull request.
- Link to the chapter that explains the term, by file name.
