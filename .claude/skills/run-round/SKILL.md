---
name: run-round
description: Run one agent round of the Humanitributary platform end to end through the agent API — the daily cloud routine's job, or a round started by hand. Check the round settings first (paused, skipped), read the queue, plan the mix by value and budget, start role agents with the task skills (fill-gaps, map-branch-entities, drain-write-events, verify-claims), then independent reviewers who read every cited page and write an edit file, check and apply it, run the release gates and publish when everything passes, record the round, and post a short summary. Use when asked to run a round, run the daily round, or when the scheduled routine starts.
---

# Run an agent round

A round is one session of agents on the work queue: role agents draft, independent reviewers check every draft
against the pages it cites, the reviewers' edit file is applied in one transaction, and a release is published
when the review approved something and every release gate passes (the owner's policy: ADR 0035). The daily cloud
routine runs this skill on a schedule; the owner can run it by hand the same way (`trigger: manual`). Everything
goes through the agent API: you hold tokens, never database credentials, and you never need a shell on the host.

Read `AGENTS.md` (rules 4, 5, 6, 11, 13) and `site/SCHEMA.md` ("Event", "Style", "Citation rules") first. The
role skills are `.claude/skills/fill-gaps`, `map-branch-entities`, `drain-write-events` and `verify-claims`: the
agents you start follow them, so read them too.

## 0. The environment

The routine's environment holds these variables (the owner stores the tokens as secrets; see
`docs/manual/daily-round.md`). **Never print, echo, log or write a token anywhere**, not even in a brief to a
subagent: pass the variable's *name*.

| Variable | What | Scope |
|---|---|---|
| `HUMANITRIBUTARY_API` | `https://data.humanitributary.com/api/agent` | |
| `INGEST_USER_AGENT` | The project's honest User-Agent, for every page fetched by script | |
| `HUMANITRIBUTARY_TOKEN_ROUND` | records the round (`POST rounds`, `PATCH rounds/<id>`) | `round` |
| `HUMANITRIBUTARY_TOKEN_WRITER` | the writers | `write_event` |
| `HUMANITRIBUTARY_TOKEN_FILLER` | the gap fillers | `fill_gap` |
| `HUMANITRIBUTARY_TOKEN_VERIFIER` | the verifiers | `verify_claim` |
| `HUMANITRIBUTARY_TOKEN_MAPPER` | the mappers | `map_branch_entities` |
| `HUMANITRIBUTARY_TOKEN_REVIEWER` | the reviewers' edit file (`edits/check`, `edits/apply`) | `review` |
| `HUMANITRIBUTARY_TOKEN_PUBLISHER` | the release (`releases/check`, `releases/publish`) | `publish` |

```bash
api() { local tok="$1"; shift; curl -sS -H "Authorization: Bearer ${!tok}" -H "Content-Type: application/json" "$@"; }
api HUMANITRIBUTARY_TOKEN_ROUND "$HUMANITRIBUTARY_API/"     # who you are and your scopes (check each token once)
```

A role whose token is missing is left out of the plan; say so in the summary. If the round or reviewer token is
missing, stop before any agent starts: a round that can't be reviewed or recorded must not draft.

## 1. Preflight: the settings first

Before anything else, read the round settings. The console's operators pause rounds, skip the next one, set the
round size and send held drafts to the next review; the routine obeys them.

```bash
api HUMANITRIBUTARY_TOKEN_ROUND "$HUMANITRIBUTARY_API/rounds/settings"
```

- **`paused` is set** and this is the scheduled routine: stop now. Print one line ("Rounds are paused by <by>:
  <reason>; nothing done") and end the session. Start no agent and record nothing. (A round started by hand may
  still run.)
- Otherwise note `size` (agents per role, tasks per agent), `drafts_per_reviewer` and `skip_next`. A skipped round
  is recorded by `POST rounds` in step 3, which then answers `"proceed": false`.

## 2. Plan the mix

```bash
api HUMANITRIBUTARY_TOKEN_ROUND "$HUMANITRIBUTARY_API/queue"
```

`kinds` lists each task kind: `waiting`, `in_progress`, `stuck`, `priorities` (max, median, min), the top five
waiting, `done_7d`, `cap` (today's tasks made against the daily cap) and `role`. `review` has the drafts in review
and the `held` ones; `round.next_round_takes` is what the size allows per kind.

Plan by value, then budget:

1. **Gaps first** (`fill_gap`, fillers): the content waves' missing history, the platform's main goal now.
2. **`map_branch_entities`** (mappers): cheap, and each one routes future stories to a branch.
3. **`write_event`** (writers): current events, highest priority first.
4. **`verify_claim`** (verifiers): second sources and rechecks.

For each role: agents = `size.agents[role]`, each taking up to `size.tasks_per_agent[role]` tasks, never more
than wait (`next_round_takes`). Leave out a role with nothing waiting. Leave out `stuck` tasks: their leases
lapse and the queue offers them again.

**Stop early when the plan's usage is low.** If the whole plan is fewer than 3 tasks and no held draft was sent on
(`carry_over`), a round costs more than it yields: record it (step 3) and finish it at once with status
`finished` and the summary "Nothing worth a round: <counts>". Also keep the session's own budget in mind: if you
are near your usage limit, start fewer agents, and never start a reviewer you can't let finish.

## 3. Record the round

```bash
api HUMANITRIBUTARY_TOKEN_ROUND -X POST "$HUMANITRIBUTARY_API/rounds" -H "Idempotency-Key: round-$(date -u +%Y-%m-%d)-schedule" -d '{
  "trigger": "schedule",
  "plan": {"mix": {"fill_gap": 6, "map_branch_entities": 4, "write_event": 8, "verify_claim": 8},
           "roles": {"filler": 2, "mapper": 1, "writer": 2, "verifier": 1}, "why": "gaps first; 31 write_event waiting"},
  "agents": [{"name": "round-filler", "role": "filler"}, {"name": "round-writer", "role": "writer"}]}'
```

Use `"trigger": "manual"` (and a key like `round-<date>-manual-<n>`) for a round started by hand. The key makes a
retried routine on the same day get the same round back (`"replayed": true`), never a second one.

- `201` with `"proceed": true`: go on. Keep `round.id`. `carry_over` lists held drafts an operator sent to this
  review: add them to the review in step 5.
- `200` with `"proceed": false`: the round was skipped (`why` says by whom). Post that and stop.
- `409` with `"paused": true`: stop as in step 1. `409` with `"busy": true`: another round is open; post that and
  stop (an open round older than 12 hours is closed as failed by the next start).

Then `PATCH rounds/<id>` with `{"status": "running"}`.

## 4. Role agents

Start the role agents as subagents, in parallel, one per agent in the plan. Brief each one with:

- its role, its skill (`fill-gaps`, `map-branch-entities`, `drain-write-events` or `verify-claims`) and the round id;
- the **name** of its token variable, which it puts in place for the skill:
  `export HUMANITRIBUTARY_API_TOKEN="$HUMANITRIBUTARY_TOKEN_WRITER"` (never the value);
- how many tasks to take (`tasks_per_agent`), one at a time: claim, work, complete; stop when the count is reached
  or a claim returns `{"task": null}`;
- **extend the lease** (`POST tasks/<id>/extend -d '{"minutes": 30}'`) whenever one task passes about 20
  minutes, and again every 20 minutes;
- the fetching rules below (honest User-Agent, one browser tab at most, closed at the end, never force a site);
- the cloud constraint (no `browser_only` pages; see below);
- **the evidence pack first** (each task skill's "The evidence pack: read it first"): passages and `GET
  documents/<doc_id>`, excerpts copied from the stored text (`complete` refuses one that isn't on a stored page),
  a browser only for `unreadable` URLs whose reason is `browser_only`;
- to finish by releasing (`POST tasks/<id>/release`) any task it holds and can't finish, and to report:
  task ids claimed, completed, failed and released per kind; every slug it drafted (`result.entry`,
  `result.entries`); and the sources that refused it.

When every agent has reported, `PATCH rounds/<id>`:

```json
{"status": "reviewing", "agents": [{"name": "round-writer", "role": "writer", "kinds": ["write_event"], "claimed": 4, "completed": 3, "failed": 1, "released": 0}],
 "tasks": {"write_event": {"claimed": 8, "completed": 6, "failed": 1, "released": 1}}, "drafts": ["n92-sn-…", "ga10-…"]}
```

If no agent drafted anything and nothing was carried over, finish the round (`{"status": "finished", "finish":
true, "summary": …}`) and post the summary: there is nothing to review or publish.

## 5. Independent review

The drafts to review are this round's `drafts` plus `carry_over`. Split them into batches of at most
`drafts_per_reviewer` (40) and start one reviewer subagent per batch, **fresh** (never an agent that wrote in this
round), with the reviewer token's variable name. A reviewer reads only (`GET entries/<slug>`, `claims/<id>`,
`branches/<slug>`, `search`, and the stored pages: `GET documents?url=<cited URL>` gives the text of a stored page
that a draft in review cites, and `POST evidence/check-excerpt -d '{"url": …, "excerpt": …}'` checks an excerpt
against it), writes nothing through the API, and returns:

- a verdict per draft: **APPROVE**, **APPROVE WITH EDITS**, **HOLD** or **REJECT**, each with one or two lines why;
- the edit-file ops for its batch (`timeline/edits.py`; the shape `manage.py apply_edits` takes), each with a
  `reason` that starts "Round #<id> review (<date>) §<n>: <VERDICT>; …". Per entry: the `edit` and `add_evidence`
  ops first, then `approve` ("edits applied above") or `reject`. A HOLD has no `approve`: the draft stays in review
  (and, with an edit, it is "held" and can be sent to the next review). Never `"status": "published"` on an
  `add_event` or `add_branch`: over the API an added entry lands in review, for the next round;
- the sources it could only partly read, or could not read.

Brief every reviewer with the hard-won rules below, in full. A reviewer must **read every cited page itself**: a
draft whose excerpt it could not check against the page is not approved. A stored page (ADR 0036) counts as read
from `GET documents?url=`: the reviewer reads the text there, judges the stance from it and checks each excerpt
with `evidence/check-excerpt`; it opens a browser (desktop rounds) only for a `browser_only` page. `edits/check`
refuses an excerpt that isn't on a stored page, naming the closest passage, so a reviewer's `add_evidence` and
`add_cites` excerpts are copied from the stored text too.

## 6. Check and apply the edit file

Merge the reviewers' ops into one list, in draft order, and save it (in the session's scratch space or `/tmp`,
never in the repository: the routine changes, commits and pushes no file) as `<date>-round-<id>.edits.json`.

```bash
api HUMANITRIBUTARY_TOKEN_REVIEWER -X POST "$HUMANITRIBUTARY_API/edits/check" -d @check.json
#   check.json: {"ops": [...], "name": "2026-11-28-round-12.edits.json", "round": 12}
```

`200` with `"valid": true` gives `check` (its id), the counts and each op's diff: read the diff, and make sure it
does what the verdicts say. `422` lists every problem (the same checks as `manage.py apply_edits`: shapes, the
SCHEMA limits, https, never openstax.org; plus: a reviewer never approves an entry it wrote, and nothing is added
straight to `published`). Fix the ops of the draft at fault; if a draft's ops can't be fixed, drop its `approve`
(it becomes a HOLD) and say so. Check again, at most three times in all.

```bash
api HUMANITRIBUTARY_TOKEN_REVIEWER -X POST "$HUMANITRIBUTARY_API/edits/apply" -H "Idempotency-Key: round-12-apply-1" -d @apply.json
#   apply.json: the same ops, name and round, plus "check": <its id> and "reason": "Round #12 review: 9 approved, 2 held, 1 rejected"
```

It applies everything in one transaction as `agent:<reviewer token's name>` (every Revision names the round's
file), or nothing (`422` with the problems). A retry with the same key returns the same answer. Then `PATCH
rounds/<id>` with `{"verdicts": {"approve": 7, "approve_with_edits": 2, "hold": 2, "reject": 1}}`.

## 7. Release: only when everything passes

Publish only if the applied file approved or rejected at least one entry (else there is nothing new for readers):

```bash
api HUMANITRIBUTARY_TOKEN_PUBLISHER -X POST "$HUMANITRIBUTARY_API/releases/check" -d '{"round": 12}'
```

- `200` with `"passed": true` and `unchanged_since` null: publish within 30 minutes of the check.
- `422`: a gate failed (`problems` per gate: deterministic, build, contested). Do not publish. `PATCH rounds/<id>`
  with `{"status": "held", "notes": "<the problems>"}` for the owner, and post that.

```bash
api HUMANITRIBUTARY_TOKEN_PUBLISHER -X POST "$HUMANITRIBUTARY_API/releases/publish" -H "Idempotency-Key: round-12-publish" \
  -d '{"check": <check id>, "round": 12, "reason": "Round #12: 9 drafts approved by independent review; every release gate passed"}'
```

It re-checks that the content and the page still hash as checked, takes the single-publish lock (a `409` with
`"retryable": true` means a publish or rollback is running: wait a minute and send the same request once more),
writes the release and moves `latest`; the round becomes `published`. Held and rejected drafts never publish: a
release carries only `published` entries.

## 8. Finish and post the summary

`PATCH rounds/<id>` with `{"summary": "…", "finish": true}` and, unless publish already set it, a final
`status`: `finished` (nothing to publish), `held` (something needs the owner) or `failed`. Then post the summary as
the session's last message, at most eight lines:

```
Round #12 (scheduled, 2026-11-28): published 2026.11.28.1.
Tasks: fill_gap 6/6, map_branch_entities 4/4, write_event 6/8 (1 failed, 1 released), verify_claim 8/8.
Drafts 11 → approve 7, approve with edits 2, hold 2, reject 1 (duplicate of …).
Edit file: 31 ops (edit 9, add_evidence 12, approve 9, reject 1); 64 revisions.
Held: <slugs and why>. Unreadable sources: <hosts>.
```

## Fetching: honest, one tab, never forced

- **Never disguise the client.** Every page fetched by script sends `curl -sS -A "$INGEST_USER_AGENT" <url>`. No
  spoofed browser User-Agent, no header tricks, no proxies, mirrors or caches to get round a site that refuses
  automated reads (two round-4 agents tried a spoofed User-Agent; the safety checks blocked them). If a site
  refuses, use another reputable source, or hold or reject the draft.
- **Exactly one in-app browser tab per agent**, reused, and always closed at the end, also when an agent stops
  early. Leftover tabs fill the pane's cap (about eight) and starve the other agents.
- **Paid and blocked wires are common for news**: Reuters (401), AFP (access denied), CNN (451). A `write_event`
  with no two readable independent sources is completed `rejected` with a note, or failed with
  `{"retry": false}`; never forced.

## The cloud constraint: no browser

A cloud session has **no in-app browser**. The `browser_only` publishers (Britannica, the BBC, the Guardian, NPR,
AP, Al Jazeera, un.org, nobelprize.org …, the payload's `fetch_policy`) can't be read there, so in a cloud round:

- **Never fetch a `browser_only` page by script**: not with curl, not with a fetch tool, not through a mirror or
  an archive copy of it, and not by driving the VM's headless Chrome (that is a script too). The source policy
  forbids it (AGENTS.md rules 6 and 13).
- **Prefer other reputable sources** that scripts may read: official sites, national archives, universities and
  museums, peer-reviewed papers, reputable outlets that allow automated reads.
- **Hold a draft whose only support is a `browser_only` source** (a reviewer can't check it either). Name it in
  the summary so the owner can review it by hand in a browser (procedure 01). A task's `unreadable` list names
  those sources (reason `browser_only`); its `evidence_pack` holds the ones a cloud round can read and check.
- **Use the evidence packs.** In a cloud round they are most of what can be read: the stored pages, their
  passages, `GET documents/<doc_id>` and `evidence/check-excerpt`.

## Hard-won rules from the review rounds

The review write-ups of rounds 1 to 4 (November 2026) found the same faults again and again. Every agent and every
reviewer applies these:

- **Excerpts are verbatim.** Copy the sentence from the page's own text, character for character: curly
  apostrophes and quotes, dashes, accents, no stray spaces. Never from a fetch tool's summary, whose "quotes" are
  paraphrased. At most 25 words. Reviewers check each excerpt against the page "character by character rather
  than against a fetch summary"; a wrong one is re-recorded with `add_evidence` (method `agent_read`).
- **Read every page you cite.** A 403, 404, a bot check or a PDF that won't decode is not read: don't cite it.
  Behind a paywall or registration wall, cite only what the lead says.
- **Support means the page states it.** A phrase no source states is cut ("Britain's key Indian Ocean base"). A
  page that supports only the background or another fact is `partial`, not `supports`.
- **Two sources for elections, wars and named living people**: two independent reputable publishers. Two pages of
  one publisher count once, and so does a wire story reprinted elsewhere ("The Guardian page is Reuters").
- **No Wikipedia-only publication** beyond the publishing rule: every draft has at least one non-Wikipedia source
  that supports it; a claim on Wikipedia alone gets a second source or is cut; text never says "according to
  Wikipedia". The publishing rule (ADR 0010) refuses an event without a non-Wikipedia source after 14 days.
- **Replace weak publishers** (machine-translated sites, misspelled names) and flag weak but usable ones (unrated
  blogs, opinion pieces, advocacy sites, "topic hub" pages with an AI summary). https only.
- **Duplicates: search before you decide.** `GET search?q=<each key word>&kind=event`, on the draft's branch,
  its parents, its neighbors and the branches it links to. A duplicate can hide in another event's *text*, or on
  another branch under a mirrored slug. On a duplicate: reject the draft, add its branch as a link on the existing
  event, and move any useful evidence there. Related but distinct events are kept and connected.
- **Attribution and neutral tone.** Attribute judgments to whoever made them ("according to HRW"); give the denial
  or the other account; present suspicion as suspicion; use a law's own terms; leave out contestable labels; no
  wording that dates itself ("for over a month"); double quotation marks.
- **Sources that disagree**: don't pick one. Record the `conflicts` evidence, edit the text to state both, then
  `resolve_conflict` for that URL. Different counts that measure different things are not errors: say what each
  counts.
- **Dates.** `y = year + (day of year − 1) / days in year`, rounded up to three decimals so it falls on the right
  day; check `end` the same way (the most common edit of every round). A year-only span is `1955.0`–`1956.0`;
  never invent a month; `when` names the date the event marks and says when sources differ.
- **Limits.** Title ≤ 60 characters, text ≤ 240, excerpt ≤ 25 words; reviewers give the lengths of every new
  title and text.
- **Ids and placement.** The branch's existing id prefix (plus an ISO code where the prefix covers many
  countries). An event sits on the branch of the state that acted and links to the branch where it happened. Every
  linked branch must exist (`GET branches/<slug>` returns 200). Coordinates within 30 km of the `src` page's.

## When things go wrong

- `429`: wait `retry_after` seconds, then go on. `409` with `"retryable": true` (a task completed while another
  agent wrote, or the publish lock): send the same request again once.
- An agent stops without reporting: its leases lapse and the queue offers the tasks again; note it in the summary.
- The session must end early: tell each agent to release what it holds, `PATCH rounds/<id>` with
  `{"status": "failed", "finish": true, "notes": "…"}`, and post why. Never leave the round open.
