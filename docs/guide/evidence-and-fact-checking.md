---
title: Evidence and fact checking
summary: How every statement on the timeline is tied to the pages that support it, how its status and confidence are computed, when it is re-read, and the daily sweep that keeps the whole base honest.
order: 60
covers:
  - evidence/**
  - "!evidence/migrations/**"
  - tests/test_fact_base.py
  - tests/test_evidence_and_dates.py
---

Every statement the timeline makes is a claim, and every claim is backed by
evidence: a cited page, what that page says about the claim, who read it and
how. From that evidence the code computes how well each claim is supported
and when it should be read again. A daily job, the sweep, recomputes
everything, notices dead or changed pages and sources that disagree, and
queues the reading that needs a person or an agent.

Nothing here is typed in by hand or guessed by a model: the same evidence on
the same day always gives the same result. The decisions are
[ADR 0004](../adr/0004-every-fact-has-evidence.md),
[ADR 0009](../adr/0009-fact-base.md) and
[ADR 0010](../adr/0010-publishing-rule.md); the policy behind the numbers is
discussed in [fact checking](../fact-checking.md). Every number below lives
in `evidence/policy.py` `DEFAULTS`, and a deployment can override any of them
with a `FACTS` dict in settings.

## The four tables

```
Publisher ─< Citation ─< Evidence >─ Claim >─ timeline.Entry
```

All four are canonical: they are written only inside `revisions.revising()`,
and every change leaves a Revision ([revisions](revisions.md)).

**Publisher**: a site we cite, by domain (`www.` stripped; every Wikipedia
language edition is one publisher, `wikipedia.org`).

| Field | What |
|---|---|
| `domain`, `name` | Unique domain, display name. |
| `tier` | 1 primary, official or peer-reviewed; 2 scholarly or institutional reference; 3 general reference (Wikipedia); 4 weak; empty = not rated. A check constraint keeps it 1–4. |
| `fetch_policy` | `allowed`, `browser_only` (read in a browser by an agent, never by a job) or `forbidden` (never fetched or cited). |
| `license`, `access_notes` | What we may do with it, and why. |

A new Publisher row starts with the ratings in `evidence/publishers.py`
`KNOWN` (`defaults_for`); a subdomain of a known publisher starts with its
parent's (Wikipedia excepted). After that the row in the admin is the truth.
A check constraint makes any openstax.org publisher `forbidden`. Fetch
policies and terms are covered in [sources and terms](sources-and-terms.md).

**Citation**: one cited page, by URL, shared by every claim that cites it.
`url` (unique, https only, never openstax.org: both are check
constraints), `canonical_url`, `title`, `publisher`, `kind` (primary,
textbook, paper, museum, archive, reference, encyclopedia, news, data), and
the link-health results: `last_checked_at`, `http_status`, `content_hash`
(sha256 of the extracted text), `archive_url`.

**Claim**: one statement about an entry. `field` (below), `key` (to tell
several claims on one field apart), `value` (JSON), `parent` (for an atomic
claim), and the computed `status`, `confidence` (0–1),
`recheck_after`, `recheck_reason`, `recheck_requested_at`. (`entry`, `field`,
`key`) is unique.

**Evidence**: a citation's bearing on a claim.

| Field | What |
|---|---|
| `stance` | `supports`, `partial`, `conflicts` or `unrelated`. |
| `excerpt` | The passage that bears on the claim, at most 25 words (a check constraint). |
| `checked_at`, `checked_by` | When the page was last read against the claim, and by whom (`agent:`, `human:` or `job:`, a check constraint). Empty for legacy evidence never re-read here. |
| `method` | `legacy` (cited by the static site's author), `fetch_match` (a job found it in a fetched page), `agent_read`, `browser_read`, `human`. |
| `found_value` | What the source itself says when it differs, e.g. `{"y": 1951.3, "when": "April 1951"}`. |
| `content_hash` | The citation's hash when this evidence was checked: a later change means re-read. |
| `position`, `cited_title`, `cited_kind` | The order and wording of the entry's `cites`, kept per use so a snapshot reproduces them exactly. |

Only `supports` and `partial` evidence is published as a source.

## Record claims and atomic parts

**Record claims** are the ones the page is built from. The legacy import
writes one `as_written` claim per entry (its date, title and text together,
cited by the entry's `cites`), plus a `why` claim and an `origin` claim where
the entry has them. The import wrote their evidence lists, and since the
cutover only an edit file changes the record claim's cites (`edit` with
`add_cites` / `remove_cites`, [ADR 0023](../adr/0023-edit-files.md)); the
agent API and `record_evidence` never add a row there.

**Atomic claims** are derived from each entry by a deterministic splitter,
`evidence/claims.py`, as children of its `as_written` claim, so evidence can
attach to the part it supports:

| `field` | `key` | `value` |
|---|---|---|
| `date` | `""` for an event; `start` / `end` for a branch | `{"when", "y", "end"}` (`end` on events) |
| `location` | `""` | `{"scope", "label", "lat", "lon"}`, only for a `place` or `region` location |
| `number` | the number's phrase, kebab-cased | `{"text", "value", "unit", "sentence"}` |
| `actor` | the name, kebab-cased | `{"name"}`, at most 8 per entry |

- `numbers()` keeps counts, magnitudes and percentages, with qualifiers
  ("about", "more than") and scale words ("2.5 million"). It drops years
  (whole numbers 1000–2100 without a comma), days after a month name, the
  ends of ranges, BCE/CE years, decades and ordinals, and bare whole numbers
  of 100 or more after "in", "by", "since" and similar words (likely years).
- `actors()` takes runs of capitalized words (with connectors like *de*,
  *of*, *al-* inside), drops leading function words (`NOT_NAMES`), month
  names, the sources' own names (`SOURCES`: Wikipedia, Britannica …) and
  Roman numerals, and drops a lone capitalized word opening a sentence of the
  text unless it is capitalized somewhere else too. Labels of the branch's
  `BranchEntity` items count when they appear verbatim.

The splitter is a heuristic that errs toward a claim an agent can dismiss.
`sync()` brings an entry's children in line with what it derives, writing only
differences:

| What changed | What happens |
|---|---|
| A new part | Created. |
| A part's value changed | Updated. If it has evidence, `recheck_after` = today, `recheck_reason` = `value_changed`. |
| A part disappeared, no evidence | Deleted. |
| A part disappeared, with evidence | Kept, and marked for recheck (`value_changed`) once. |

## Independent witnesses

Corroboration means independent sources agree, so evidence is grouped by
**witness**, not by domain (`evidence/independence.py` `witness()`). A witness
is the registrable domain: `science.nasa.gov` and `nasa.gov` are one witness,
`news.un.org` and `un.org` another. Any Wikipedia domain is the witness
`wikipedia.org`, so Wikipedia counts once however many articles are cited.

- Two-label public suffixes in `TWO_LABEL_SUFFIXES` (`co.uk`, `gov.au`,
  `ac.jp` …) keep three labels: `bbc.co.uk`.
- Hosting platforms in `PLATFORMS` (`github.io`, `blogspot.com`,
  `substack.com` …) keep three labels, because each subdomain is someone else.

## Status and confidence

`evidence/confidence.py` `assess_detail()` computes both from a claim's
evidence rows. Each witness counts once, with its strongest evidence. A row's
weight is

```
w = tier_weight[tier] × method_factor[method] × freshness(age of the check)
support row:  × stance_factor[stance]
```

| Setting (`evidence/policy.py`) | Values |
|---|---|
| `tier_weight` | tier 1: 0.6, 2: 0.5, 3: 0.35, 4: 0.15, unrated: 0.25 |
| `stance_factor` | supports 1.0, partial 0.5 (conflicts weigh on the other side at full weight; unrelated not at all) |
| `method_factor` | legacy 0.85, fetch_match 0.8, agent_read 1.0, browser_read 1.0, human 1.0 (an empty method counts as legacy) |
| `freshness` | the check's age divided by the claim's recheck interval: ≤ 1 → 1.0, ≤ 2 → 0.9, older → 0.75. Never checked here → 1.0 (the legacy method factor discounts it instead). |

Witnesses combine as independent probabilities:

```
support    = 1 − Π (1 − w)   over supporting witnesses (supports, partial)
conflict   = 1 − Π (1 − w)   over conflicting witnesses
agreement  = floor + (1 − floor) × share of the sources' dates that agree
confidence = support × (1 − conflict) × agreement     (rounded to 3 places)
```

`agreement` applies only to a `date` claim with a numeric `y` and a known
precision: the share of `found_value.y` values within the precision's
tolerance (`date_tolerance_years`, below). `agreement_floor` is 0.5. Without
such dates, agreement is 1.

Status, first match wins:

| Status | When |
|---|---|
| `unverified` | No evidence that supports or conflicts. |
| `contested` | Some conflict, and conflict ≥ `contested_conflict` (0.3) or conflict ≥ support. |
| `stale` | `recheck_after` is today or earlier. |
| `corroborated` | At least `corroborated_min_witnesses` (2) witnesses with `supports` (not `partial`). |
| `single_source` | Anything else that is supported. |

**Worked example.** An entry cites Wikipedia and Britannica, both legacy
evidence. Wikipedia: 0.35 × 0.85 = 0.2975. Britannica: 0.5 × 0.85 = 0.425.
Support = 1 − (0.7025 × 0.575) = 0.596, two full witnesses: corroborated,
confidence 0.596. A tier-4 blog that disagrees (read by an agent: 0.15)
lowers confidence to 0.596 × 0.85 = 0.507 but doesn't contest it; a tier-1
source that disagrees (0.6) does.

Whether a claim rests on Wikipedia *alone* is a separate question,
`wikipedia_only()`: supported, and every supporting row is Wikipedia. The
publishing rule, the sweep and the report ask it; ADR 0009 says why it is not
a status.

`refresh(claim)` recomputes one claim. The legacy import recomputes the
claims it touched with `evidence.sweep.reassess()`, the sweep's own code
without the scheduling step, so the two never disagree.

## When a claim is re-read

`evidence/staleness.py` sets `recheck_after`, the date from which a claim is
stale until someone reads its pages again.

### The schedule

`recheck_after = last check + interval`. The last check is the newest
`Evidence.checked_at` on the claim whose method isn't `legacy` (any stance
counts); without one, the claim's creation date. The interval
(`recheck_days`, in days) depends on what the claim states and how recent its
entry is:

| Field | Current | Last 2 years | Since 1945 | Since 1800 | Before 1800 |
|---|---:|---:|---:|---:|---:|
| `date` | 30 | 180 | 730 | 1,825 | 3,650 |
| `number` | 7 | 60 | 730 | 1,825 | 3,650 |
| `location` | 90 | 365 | 1,825 | 3,650 | 3,650 |
| `actor` | 30 | 180 | 1,825 | 3,650 | 3,650 |
| `as_written`, `text` | 30 | 180 | 730 | 1,825 | 3,650 |
| `title` | 30 | 180 | 1,825 | 3,650 | 3,650 |
| `why`, `connection`, `link` | 180 | 365 | 1,825 | 1,825 | 1,825 |
| `origin` | 365 | 730 | 1,825 | 1,825 | 1,825 |

The column comes from the entry's latest year (`era_column`):

- An event: the later of `y` and `end`. It is **ongoing** if its `when`
  matches `ongoing_words` ("ongoing", "present", "to date", "continues", or
  "since 2023" at the end).
- A branch with an end: its `end`, ongoing if `end_when` matches. A branch
  that continues: its latest event's `y` (or its start), never ongoing.
- **Current**: ongoing, no year, or a year in the current year or later.
  **Last 2 years**: the year is at least the current year − 2. Then 1945 and
  1800 are the cut-offs.

A field not in the table uses the `as_written` row.

### Earlier rechecks that others ask for

Anyone may pull a claim's `recheck_after` earlier (the splitter does, with
`value_changed`). `schedule()` respects that: if the claim already has an
earlier date than the scheduled one, it keeps it until a check answers it. A
check answers it if it is newer than `recheck_requested_at` (or, without
one, on or after the earlier date). A kept date keeps its reason (or becomes
`requested`); the sweep never pushes a pending recheck later.

### Dead and changed pages

`link_problem()` looks at each `supports` or `partial` evidence row beside its
citation's latest link check (`Citation.last_checked_at`, `http_status`,
`content_hash`, written by ingestion's link-health job,
[ingestion](ingestion.md)). If the evidence was checked after the citation's
last check, there is no problem. Otherwise:

- `dead_link`: the citation's `http_status` is at least `dead_http_status`
  (400) and not one of `blocked_http_statuses` (401, 403, 429). Those say the
  site refused an automated reader, not that the page is gone; link health
  records them as `blocked` and doesn't write them to the citation anyway, so
  the exclusion covers statuses stored before it did. A 5xx still counts as
  dead. Link health writes 599 (`ingest/linkhealth.py` `UNREACHABLE`) for a
  page dead without an HTTP answer.
- `content_changed`: the evidence's `content_hash` and the citation's are
  both set and differ.

A dead link outranks a changed page for the same claim. Either one pulls the
claim's `recheck_after` to today with that reason, which makes it stale.
Evidence first seen with no hash takes the citation's current hash as its
baseline (we can't tell whether the page changed before we first hashed it).

## Conflicts

A source that says something else is evidence too: an `Evidence` row with
stance `conflicts` and what the source says in `found_value`, with the
claim's own value beside it as `claim_value` (`evidence/conflicts.py`
`record_conflict`). Conflicts attach only to atomic parts; `record_conflict`
refuses the `as_written` claim, whose evidence the import owns. If the page
already has evidence on the claim that an agent recorded as supporting, that
reading stands and the conflict isn't written. The same goes for a conflict a
reviewer has resolved: when an edit file corrects the text, its
`resolve_conflict` sets the conflicting rows to `unrelated` with
`found_value.resolved` (who, when, why, and that it was `conflicts`), the
claim is recomputed, and `record_conflict` leaves a resolved row alone, so the
sweep doesn't reopen it from the same page
([content model](content-model.md#applying-a-reviewers-edits),
[ADR 0023](../adr/0023-edit-files.md)).

Agents record conflicts as evidence with stance `conflicts` and a `found`
value in a `verify_claim` result through the agent API (the owner's
equivalent is `facts record --stance conflicts --found '{…}'`).
Jobs find date conflicts in ingestion's output with `from_candidates()`:

1. Take each `Candidate` that ingestion matched to an existing event
   (`duplicate_of` set, `similarity` ≥ `conflict_min_similarity`, 0.75), with
   a `y_guess`, not rejected.
2. Look up the tolerance for the event's precision (`date_tolerance_years`,
   in years): day 0.01, month 0.09, year 0.99, decade 5, century 50,
   millennium 500, thousand years 2,000, million years 200,000, billion years
   200 million. No precision, no check.
3. The event's range is `y` to `end` (or `y`). If the guess is inside the
   range widened by the tolerance, it agrees. Otherwise its distance to the
   range is a conflict, unless it is more than `date_plausible_tolerances`
   (50) tolerances or `date_plausible_min_years` (10) years, whichever is
   more: then it is probably another event of the same name.
4. Each of the candidate's documents becomes one conflicting evidence row on
   the event's `date` claim (method `fetch_match`, checked at the document's
   fetch time).

## The daily sweep

`manage.py facts sweep` (`evidence/sweep.py` `sweep()`) is one deterministic
pass over the whole fact base. It runs as `job:facts_sweep`, daily, from the
job runner (the `facts_sweep` job, registered right after `link_health` in
`ingest/job_defs.py`), inside one `revising()` block, so one transaction.

1. **Split.** For every branch and event that isn't retracted and has an
   `as_written` claim, `claims.sync()` brings its atomic claims in line (new
   ones are bulk-created at the end). `split_all(today, entries=[…])` does the
   same for some entries only, reading just their claims: an edit file
   re-splits each entry it edits this way.
2. **Link health.** `link_health()` sets baseline hashes and finds each
   claim's link problem (above).
3. **Conflicts.** `conflicts.from_candidates()` records date conflicts.
4. **Schedule and assess.** For every claim, `reassess_all()` computes the
   new `recheck_after` and `recheck_reason` (the schedule, kept requests,
   then a link problem pulling it to today), then status and confidence.
   A claim with no evidence keeps only a non-scheduled recheck someone asked
   for.
5. **Tasks.** `queue_tasks()` queues `verify_claim` tasks (below).

It writes only real changes (`timeline.services.apply_changes`), so a second
run on the same input writes nothing and leaves no Revision. It returns
counts per step as JSON.

| Option | Effect |
|---|---|
| `--today YYYY-MM-DD` | Run as of that date. |
| `--dry-run` | Compute everything, then roll the transaction back. |
| `--no-split` | Skip step 1. |
| `--no-tasks` | Skip step 5. |

### Queueing verify tasks

What wants an agent, with its priority (`task_priority`):

| Reason | Which claims | Priority |
|---|---|---:|
| `conflict` | Contested claims | 60 |
| `dead_link` | Stale, reason `dead_link` | 50 |
| `content_changed` | Stale, reason `content_changed` | 45 |
| `no_second_source` | The `as_written` claim of a published event, not stale or contested, whose supporting evidence is all Wikipedia (or that has no evidence). Skipped while the event is recent (`y` ≥ current year − 1) and the claim is at most `grace_days` (14) days old. | 20 |
| `scheduled` | Any other stale claim (including `value_changed` and `requested`) | 10 |

The list is sorted by priority, then by the entry's importance (imp 1 first),
then by claim id. A claim whose key `claim:<id>` already has an open
`verify_claim` task (from any job) is skipped. New tasks are capped at
`max_tasks_per_sweep` (200) a run and at `max_open_tasks` (500) of the sweep's
own open at once; the rest wait for a later run. Each task's priority is the
reason's plus 4 for an imp-1 entry, 2 for imp 2 (and for branches), 0 for
imp 3. The payload is described in
[the work queue chapter](work-queue-and-agents.md#verify-tasks-from-the-sweep).

For a changed page the payload carries `page_changes`, from ingestion's
documents (`sweep._page_diff`): when the page's `Document` has an earlier
version, its raw bytes are read from the `raw` object store with
`ingest.store.read_raw` and diffed, sentence by sentence, against the current
extracted text (at most 80 lines). If the store doesn't have that version
(`read_raw` returns None, e.g. a document fetched before
`make storage-migrate`), the diff is skipped and the payload gives the first 1,500
characters of the new text instead.

## The self-healing loop

The parts above make a loop that repairs the fact base without anyone
watching it:

1. `link_health` (daily, [ingestion](ingestion.md)) re-checks cited URLs
   and writes each citation's status, hash and archive URL.
2. The sweep sees a dead or changed page, pulls the claim's recheck to
   today (stale) and queues a `verify_claim` task with the page's diff.
3. An agent reads the page, or its archived copy, or a replacement, and
   records what it says in the task's result, which the agent API applies
   through `record_evidence()` ([work queue](work-queue-and-agents.md#the-agent-api)).
4. That evidence is checked after the citation's last check and carries
   its current hash, so the problem is answered. The claim is recomputed at
   once, and its next recheck counts from this check.

The same loop runs for scheduled rechecks, changed wording
(`value_changed`), conflicts from ingestion and Wikipedia-only events.
`second_source` feeds it too: it attaches suggested sources to the same
`claim:<id>` task ([work queue](work-queue-and-agents.md)).

## Recording evidence

`evidence/services.py` `record_evidence()` is the door agents use: the agent
API calls it for each evidence row of a `verify_claim` result, inside
`revising("agent:<name>", task=…)`, and the owner's `manage.py facts record`
calls it from a shell. Inside `revising()`:

1. The stance must be one of the four.
2. `citation_for(url, title)` finds or creates the Citation, and its
   Publisher with the default ratings. A non-https URL or a `forbidden`
   publisher is refused.
3. If the claim already has evidence from that citation, that row is
   updated. Otherwise a new row is appended at the next position, except on
   a record `as_written` claim: its citations come from the entry's `cites`,
   so new sources go on an atomic part (or, from an edit file, become a cite).
4. The row gets the stance, the excerpt (cut to 25 words), `checked_by`,
   `method`, `checked_at` = now, the citation's current `content_hash` and
   `found_value`.
5. `reassess_all()` recomputes that claim's recheck date, status and
   confidence.

## What may be published

`evidence/publishing.py` holds the publishing rule and `publish_entry()`,
the only door to `published`:

1. No record claim is contested unless the text says the sources differ
   (`unflagged_contested()`, which the release gate asks too).
2. An event needs supporting evidence (stance `supports` or `partial`) that
   isn't all Wikipedia, after the grace period. Evidence that only conflicts
   (or is unrelated) supports nothing: an event with no supporting row is
   held like one with only Wikipedia.

The rule and its overrides are in [publishing](publishing.md). Nothing the
agent API writes is published: it creates events in `review`.

## The health report

`evidence/health.py` is read-only. `collect()` gathers, over published
entries:

- record claims (`as_written`, `why`, `origin`) by status, by era (`ERAS`:
  deep time, ancient from 3000 BCE, medieval from 500, early modern from
  1500, modern from 1800, since 1945) and by region;
- atomic claims by field and status;
- how many entries, and how many events, rest on Wikipedia alone;
- entries with a contested claim whose text doesn't say the sources differ;
- rechecks due now, within 30 days and within a year;
- citations checked and dead (status ≥ 400);
- open `verify_claim` tasks.

`markdown()` prints it; `digest_section()` is the short form in
`manage.py digest`.

## The facts command

`evidence/management/commands/facts.py`:

| Subcommand | What |
|---|---|
| `facts sweep [--today D] [--dry-run] [--no-split] [--no-tasks]` | The sweep, as `job:facts_sweep`. Prints its counts as JSON. |
| `facts report [--today D] [--brief]` | The health report as Markdown; `--brief` leaves out the era and region tables. |
| `facts check <slug>` | What stands between an entry and publication, as JSON. |
| `facts record --claim ID --url U --stance S --agent A [--excerpt E] [--title T] [--method M] [--found JSON] [--task ID]` | Record evidence (method `agent_read` by default; also `browser_read`, `human`, `fetch_match`). Runs inside `revising(agent, task=…)` and prints the claim's new status and confidence. |
| `facts publish <slug> --agent A [--task ID] [--override "why"]` | Publish under the rule. |

These are the owner's commands (and a job's); agents reach the same services
through the agent API ([work queue](work-queue-and-agents.md#the-agent-api)).

## Changing it

| Change | What it needs |
|---|---|
| A threshold, weight or interval | Change it in `evidence/policy.py` `DEFAULTS` (or override it with `settings.FACTS`). If it changes what the sweep computes, bump `RULES_VERSION` (`facts-v1`); it is stamped on task payloads and the sweep's Revision reason. Update [fact checking](../fact-checking.md) and the tables here. Lowering an interval takes effect at the next sweep; raising one waits for each claim's next check. |
| A new claim field | Add it to `Claim.Field` and the `claim_field_valid` constraint (a migration), and give it a `recheck_days` row. |
| The status rule | `assess_detail()` in `evidence/confidence.py`; tests in `tests/test_fact_base.py` (`IndependenceAndStatusTests`) and `tests/test_evidence_and_dates.py`. A change of meaning needs an ADR (it refines ADR 0009). |
| The splitter | `evidence/claims.py`. Changing what it derives changes claims' keys: the next sweep replaces unchecked parts and keeps checked ones for recheck. Tests: `SplitterTests`. |
| A new kind of link problem or task reason | `staleness.link_problem()`, a `task_priority` entry, a `todo` sentence in `sweep.task_payload()`, and the `verify-claims` skill. |
| A new known publisher | `evidence/publishers.py` `KNOWN` (applies only to rows created after; existing rows are edited in the admin). |
| A new evidence table or column | Canonical: the migration needs `audit_table()` for a new table ([revisions](revisions.md)). |
