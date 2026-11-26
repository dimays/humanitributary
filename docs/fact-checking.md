# Fact checking: corroboration, conflict and staleness

How the fact base keeps itself honest: which statements the timeline makes
(claims), how well each is supported (status and confidence), when it should
be read again (staleness), what happens when sources disagree (conflicts),
and the job that ties it together (`manage.py facts sweep`). Everything here
is deterministic: no LLM calls, the same evidence and date give the same
result. Judgment goes to agents as `verify_claim` tasks. The decision record
is ADR 0009 (and ADR 0010 for the publishing rule); every threshold is in
`evidence/policy.py` and can be overridden with `settings.FACTS`.

## Claims

- **Record claims** are the ones the page publishes from: one `as_written`
  claim per entry (its date, title and text, citing the entry's `cites`), and
  `why` and `origin` claims where the entry has them. The legacy import owns
  their evidence lists.
- **Atomic claims** are derived from each entry by a deterministic splitter
  (`evidence/claims.py`) as children of its `as_written` claim
  (`Claim.parent`), so evidence can attach to the part it supports:

  | field | key | value |
  |---|---|---|
  | `date` | `""` (event), `start` / `end` (branch) | `{"when", "y", "end"}` |
  | `location` | `""` | `{"scope", "label", "lat", "lon"}` from TL.geo (place or region) |
  | `number` | the phrase, kebab-cased (`more-than-5-000-garifuna`) | `{"text", "value", "unit", "sentence"}` |
  | `actor` | the name, kebab-cased | `{"name"}` |

  Numbers are counts, magnitudes and percentages; years, days of the month,
  ordinals, decades and the low end of year ranges are left out. Actors are
  runs of capitalized words (with *de*, *of*, *the*, *al-* … inside), less
  what isn't a name: sentence-opening function words and articles ("of
  March", "the Franks" → "Franks"), months, single letters ("U.S." is not "U"
  and "S"), lone common words ("Literature", "Republic"), hyphenated adjectives
  ("US-led"), a lone capitalized word opening a sentence unless it is
  capitalized elsewhere too, and the sources' own names (Wikipedia,
  Britannica, the Met …). "New", "Great", "Three", "First" … stay at the front
  of the name they begin ("New Zealand", "Three Kingdoms"). With ingestion's
  `Entity` rows routed to the branch, an exact label match counts too. At most
  eight actors an entry.
  It is a heuristic and errs toward a claim an agent can dismiss in a second.
  On today's content it derives 41,739 atomic claims: 5,998 dates, 5,589
  places, 2,584 numbers and 27,568 actors.
- When an entry's wording changes, its parts follow: new parts are created,
  vanished ones deleted, unless something checked them, in which case they
  are kept (or updated) and marked for recheck (`recheck_reason =
  "value_changed"`). Actor claims the rules now reject as junk (made before
  them) are left alone: `manage.py facts sweep --junk-actors --dry-run`
  counts them, and removing them is the owner's decision (ADR 0025).

## Independence

A `Publisher` row is a domain; an independent witness is an organization
(`evidence/independence.py`): the registrable domain, so `science.nasa.gov`
and `nasa.gov`, `news.un.org` and `un.org`, `european-union.europa.eu` and
`ec.europa.eu` are one witness each. Every Wikipedia edition is one publisher
already, so Wikipedia counts once however many of its articles are cited.
Hosting platforms (`github.io`, `blogspot.com` …) keep the full host.

## Status and confidence

A witness's weight is its strongest evidence's

    w = tier_weight[tier] × stance_factor[stance] × method_factor[method] × freshness

| | values |
|---|---|
| tier | 1: 0.6, 2: 0.5, 3: 0.35, 4: 0.15, unrated: 0.25 |
| stance | supports 1.0, partial 0.5 (conflicts weigh on the other side; unrelated not at all) |
| method | legacy 0.85 (the static site's author read it; not re-read here), fetch_match 0.8, agent_read / browser_read / human 1.0 |
| freshness | the check's age against the claim's recheck interval: within it 1.0, within twice it 0.9, older 0.75; never checked here: 1.0 (the method discount covers it) |

Witnesses combine as independent probabilities:

    support    = 1 − Π (1 − w)  over supporting witnesses
    conflict   = 1 − Π (1 − w)  over conflicting witnesses
    agreement  = 0.5 + 0.5 × (share of the dates sources give, in Evidence.found_value, that agree with the claim's)
    confidence = support × (1 − conflict) × agreement

Status, first match wins:

| status | when |
|---|---|
| unverified | no evidence that supports or conflicts |
| contested | conflict ≥ 0.3, or any conflict at least as strong as the support |
| stale | `recheck_after` is today or earlier |
| corroborated | at least **two independent witnesses** fully support it (Wikipedia counting as one, at most) |
| single_source | supported by one independent witness (or only partly) |

So Wikipedia + Britannica is corroborated; Britannica alone, two Wikipedia
articles, or NASA plus NASA Science are single source. One tier-4 blog that
disagrees lowers confidence but does not contest a corroborated claim; a
peer-reviewed paper that disagrees does. Whether a claim rests on Wikipedia
*alone* is a separate question (`confidence.wikipedia_only()`), the one the
publishing rule asks; see ADR 0009 for why that is not a status of its own.

**Distribution on today's content** (record claims on published entries,
before → after the change of rule):

| | corroborated | single source |
|---|---:|---:|
| as written | 3,687 → 2,898 | 2,087 → 2,876 |
| origin | 204 → 158 | 4 → 50 |
| why | 234 → 183 | 189 → 240 |
| **all 6,405** | **4,125 (64.4%) → 3,239 (50.6%)** | **2,280 → 3,166 (49.4%)** |

Of the 3,166 single-source claims, 2,280 rest on Wikipedia alone and 886 on
one other publisher (most of them Britannica alone). None are contested,
stale or unverified yet: nothing has been re-read since the import.

## Staleness

`recheck_after = last check + interval`. The last check is the newest
evidence checked here (`Evidence.checked_at`, not legacy), or the claim's
creation if there is none. The interval depends on what the claim states
and how recent its entry is (`policy.recheck_days`, in days):

| field | current year / ongoing | last 2 years | since 1945 | since 1800 | before 1800 |
|---|---:|---:|---:|---:|---:|
| date | 30 | 180 | 730 | 1,825 | 3,650 |
| number | 7 | 60 | 730 | 1,825 | 3,650 |
| location | 90 | 365 | 1,825 | 3,650 | 3,650 |
| actor | 30 | 180 | 1,825 | 3,650 | 3,650 |
| as written, text | 30 | 180 | 730 | 1,825 | 3,650 |
| title | 30 | 180 | 1,825 | 3,650 | 3,650 |
| why, connection, link | 180 | 365 | 1,825 | 1,825 | 1,825 |
| origin | 365 | 730 | 1,825 | 1,825 | 1,825 |

"Ongoing": the entry's date says so ("ongoing", "present", "since 2023" …).
A medieval battle's date is re-read every ten years; a death toll from this
year's disaster every week.

**Link health** (ingestion's job records `Citation.last_checked_at`,
`http_status`, `content_hash`): a dead link (status ≥ 400) or a page whose
hash differs from the one the evidence was checked against
(`Evidence.content_hash`) pulls `recheck_after` to today, with
`recheck_reason` `dead_link` or `content_changed`, until someone re-reads the
page (evidence checked after the citation's last check). Evidence seen for
the first time with no hash takes the citation's current hash as its
baseline.

**Other writers may pull a recheck earlier.** The contract for any job
(ingestion's link-health job does this): set `Claim.recheck_after` to today
or earlier (and `recheck_reason`, `recheck_requested_at` if you can). The
sweep keeps an earlier date until a check newer than the request answers it,
and never pushes a pending recheck later. Queue the `verify_claim` task with
`dedupe_key = "claim:<id>"`, the key the sweep uses, so the two never
duplicate each other.

## Conflicts

A source that says something else is evidence too:
`Evidence(stance="conflicts")` with what the source says in `found_value`
and the claim's own value beside it (`claim_value`). Conflicts attach to the
atomic part (the `date` child, a `number` child), never to the legacy
`as_written` claim, whose evidence list the import owns. They come from:

- **ingestion**: a `Candidate` matched to an existing event (`duplicate_of`,
  trigram `similarity` ≥ 0.75) whose `y_guess` differs from the event's date
  by more than the tolerance for its precision (a day 0.01 yr, a year 0.99, a
  decade 5, a century 50 …) but by less than 50 tolerances or 10 years,
  beyond which it is more likely another event of the same name. Each of the
  candidate's documents becomes one conflicting evidence row (method
  `fetch_match`);
- **agents**: `manage.py facts record --stance conflicts --found '{"y": …}'`.

## The sweep

`manage.py facts sweep [--today YYYY-MM-DD] [--dry-run]` runs as
`job:facts_sweep`, daily (register it with ingestion's job runner): split →
link health → conflicts → schedule and assess every claim → tasks. It writes
only real changes, so a second run writes nothing. On today's content the
first sweep takes about 20 seconds.

Tasks (`verify_claim`, `dedupe_key = claim:<id>`), highest priority first:
conflicts (60), dead links (50), changed pages (45), due rechecks (10), and
published events that rest on Wikipedia alone (20) once past the grace
period for current events. At most 200 new tasks a run and 500 of the
sweep's open at once; landmarks (imp 1) first within a priority. Each
payload carries the claim and its value, the entry, every piece of evidence
(URL, publisher, tier, fetch policy, excerpt, check, HTTP status, archive
URL), the atomic parts, the reason with what to do, and for a changed page
the diff of its text from ingestion's stored versions.

On today's content: 1,821 published events want a second source (200
queued, the rest deferred to later runs).

## Reports

`manage.py facts report [--brief]` prints the health of the base as
Markdown: shares by status, by era and by region; how many entries rest on
Wikipedia alone; rechecks due; link-checked and dead citations; open tasks;
atomic claims; and the publishing rule's count. `evidence.health.
digest_section()` is the short form for `manage.py digest`.

## The agents' doors

- `manage.py facts record --claim <id> --url … --stance supports|partial|conflicts|unrelated --excerpt "…" --agent agent:<you> [--task <id>] [--found '{…}']`:
  records what a page says about a claim (`evidence.services.record_evidence`),
  stamps the check and the page's hash, and recomputes the claim. New
  sources go on atomic parts (or into the data files, for the record claim).
- `manage.py facts check <slug>`: what stands between an entry and
  publication.
- `manage.py facts publish <slug> --agent … [--override "why"]`: publishes
  under the rule (ADR 0010).

The skill `.claude/skills/verify-claims` walks an agent through a
`verify_claim` task.
