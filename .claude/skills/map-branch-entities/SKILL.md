---
name: map-branch-entities
description: Work the map_branch_entities queue in the Humanitributary repo through the agent API. A branch the seed_branch_entities job could not match to Wikidata by exact title needs its Wikidata items (its polity, faith, movement, organization, or the member states of a group) so ingestion can route new stories to it. Read the payload, look the candidates up on Wikidata, pick only items the branch is about, and complete the task with them (or an empty list). Use when asked to map branches to Wikidata, fix routing, or work map_branch_entities tasks.
---

# Map branches to their Wikidata items

Ingestion routes each new story to branches through the Wikidata items the story mentions (`ingest/routing.py`,
ADR 0012, ADR 0022): a branch with no items gets no stories. The weekly `seed_branch_entities` job maps a branch
when a name variant is itself an English Wikipedia title of the expected kind; everything else becomes a
`map_branch_entities` task for you. Read `AGENTS.md` and the routing section of `docs/guide/ingestion.md` first.

What you write is routing data (`BranchEntity` rows), not content: it never reaches the page, but a wrong item
routes the wrong stories to the branch for months. Precision beats recall: an empty list is a good answer.

## The API

Work through the agent API, never the database (ADR 0017). Two variables come from your environment:
`HUMANITRIBUTARY_API` (the base URL) and `HUMANITRIBUTARY_API_TOKEN` (made by the owner with
`manage.py agent_token create <name> --scope map_branch_entities`; never print or log it).

```bash
api() { curl -sS -H "Authorization: Bearer $HUMANITRIBUTARY_API_TOKEN" -H "Content-Type: application/json" "$@"; }
api "$HUMANITRIBUTARY_API/schemas/map_branch_entities"   # the result shape `complete` accepts
```

A claim is a lease (30 minutes by default): `POST tasks/<id>/release` hands it back untouched,
`POST tasks/<id>/fail -d '{"error": "why", "retry": true}'` gives up. `complete` checks the result against the
schema (a 422 lists the problems; the task stays yours) and applies it as `agent:<your name>`. A 429 means you are
over the rate limit: wait `retry_after` seconds.

**Extend a long lease.** A lease runs 30 minutes (`TASK_LEASE_MINUTES`). When one task's work passes about 20
minutes (a slow site, a long read, a second source to find), extend it before it runs out, and again every 20
minutes while you still work on it:

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/extend" -d '{"minutes": 30}'
```

A lease that runs out may be taken over by another agent; then your `complete` is refused (409) and the work is
lost. If you can't finish, `release` the task (untouched) or `fail` it with the reason; never leave it to lapse.

## Fetching: honest, one tab, never forced

- **Never disguise the client.** Every page you fetch by script sends the project's honest User-Agent:
  `curl -sS -A "$INGEST_USER_AGENT" <url>` (the same value as the app's `INGEST_USER_AGENT`). No spoofed browser
  User-Agent, no header tricks, no proxies, mirrors or caches to get round a site that refuses automated reads.
  Wikidata and Wikipedia welcome scripts that say who they are; keep to a request a second.
- **Exactly one in-app browser tab per agent**, if you use the browser at all: reuse it, and close it when you
  finish, also when you stop early. A cloud session has no in-app browser; you don't need one here.

## 1. Claim and read the payload

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/claim" -d '{"kinds": ["map_branch_entities"]}'   # {"task": {...}} or {"task": null}
```

| Key | What |
|---|---|
| `branch`, `name` | The branch's slug and name, e.g. `gulf-states`, "Gulf states (Kuwait, Bahrain, Qatar, UAE, Oman)". |
| `variants` | The name forms the job tried as Wikipedia titles, best first. None matched a usable item. |
| `cited_articles` | English Wikipedia articles the branch's own entries cite (up to 10): strong hints of what it is about. |
| `cited_items` | The Wikidata items of those articles (up to 10). |
| `instructions` | The result shape. |

`GET branches/<slug>` shows the branch: its text, span, region and events. Read it: the span decides between a
state and its predecessor.

## 2. Find the candidates

Look each candidate up on Wikidata (read-only, with the honest User-Agent):

```bash
UA="$INGEST_USER_AGENT"
curl -sS -A "$UA" "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=10&search=<name>"
curl -sS -A "$UA" "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels|descriptions|claims|sitelinks&sitefilter=enwiki&ids=Q123|Q456"
```

Start with `cited_items` (the branch already cites their articles), then the article titles in `cited_articles`,
then a search on each variant. For each item read its label, description, `P31` (instance of), `P571`/`P576`
(inception, dissolved) or `P580`/`P582` (start, end), and its English Wikipedia article.

## 3. Decide

Keep an item only when the branch is about it:

- **The thing itself.** The state, dynasty, faith, movement, organization or people the branch follows. "Iran
  (Qajar to Islamic Republic)" is Iran (Q794), role `polity`.
- **Members of a group branch.** A branch that names its members ("Gulf states (Kuwait, …)") gets each member
  state, role `member`. Don't map the group's umbrella organization unless the branch is about it.
- **Not a disambiguation page or a category** (`P31` Q4167410, Q22808320, Q4167836), and not a list.
- **The right era.** An item that ended within the first tenth of the branch's span is a predecessor, not the
  branch: SFR Yugoslavia is not "post-Yugoslav states". A state's inception is often only its latest
  constitution; judge by the end date.
- **Not a place when the branch is a state.** "Ireland" the island (Q22890) is not the state (Q27). When a place
  and a polity share a name, prefer the polity, and add the place only when stories about the land belong here.
- **Not a person** unless the branch is about one movement that is that person's (rare). Founders and capitals
  route too much: leave them out.

Roles are free text, at most 40 characters; use `polity`, `faith`, `movement`, `org`, `people`, `member` or
`place`. At most 20 items; usually one to three. If nothing fits, complete with an empty list and say why in the
note; the job then leaves the branch alone, and the owner can add a hand-checked mapping
(`ingest/routing.py` `CORRECTIONS`).

## 4. Complete

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/complete" -d '{"result": {"branch": "<slug>",
  "entities": [{"qid": "Q794", "role": "polity", "label": "Iran"}],
  "note": "Q794 is the state across the whole span (cited article Iran); Q1356 (Qajar Iran) ended 1925, too early."}}'
```

The API adds a `BranchEntity` per item (weight 1.0, created by you) and a stub `Entity` for an item not fetched
yet; the daily `refresh_entities` job reads its facts. The task must be about that branch (a 422 otherwise). New
stories that mention the items route to the branch from the next `process` run.
