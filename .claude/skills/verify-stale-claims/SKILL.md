---
name: verify-stale-claims
description: Work verify_claim tasks that ingestion caused in the Humanitributary repo. A citation's link died, moved or its page changed (link health → facts sweep), or a Wikipedia-only claim has suggested second sources from open APIs (second_source job). Re-read, record evidence, accept or reject suggestions. Use when asked to fix dead or changed citations, verify stale claims, or check suggested second sources.
---

# Verify stale claims and suggested second sources

This skill adds ingestion's two cases to `.claude/skills/verify-claims` (read that first: the API, claiming,
stances and the result shape are the same). Both arrive as `verify_claim` tasks, keyed `claim:<id>`, so each claim
has at most one open task.

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/claim" -d '{"kinds": ["verify_claim"]}'
```

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
  The safety checks block such attempts, and they break the source policy (ADR 0013). If a site refuses, use
  another reputable source, or hold or reject the work.
- **Exactly one in-app browser tab per agent.** Open one tab, reuse it for every page you read, and close it when
  you finish, also when you stop early, fail or release a task. Leftover tabs fill the pane's cap (about eight)
  and starve the other agents. A cloud session has no in-app browser: there a `browser_only` page can't be read
  at all (see the `run-round` skill).
- **Paid and blocked wires are common in news.** Reuters (401), AFP (access denied) and CNN (451) often refuse.
  Don't force them. Find another readable, independent, reputable source; record only pages you read.

## The evidence pack: read it first

The `prefetch_sources` job (every 15 minutes, ADR 0036) has usually fetched this task's pages already, from the
publishers whose policy lets a job read them, and put them in the payload:

- `evidence_pack`: one entry per stored page: `url`, `title`, `publisher`, `tier`, `fetched_at`, `doc_id`, `words`
  and `passages` (the page's sentences that name the task's dates, years, numbers, entities or title words, best
  first, each with its `score` and `matches`, such as `"date:June 6"`, `"entity:Normandy (Q8205)"`).
- `unreadable`: the URLs it did not read, each with a `reason`: `browser_only` (read it in a browser),
  `forbidden` (never), `never_fetch`, `robots`, `blocked`, `http_404`, `error`, `unsupported` (a PDF, say), `empty`,
  `deferred` (not yet: the next run reads it).
- `evidence_ready`: true when at least one stored page is not Wikipedia.

How to use it:

1. **Read the passages, then the page.** A passage is a lead, not the whole story: `GET documents/<doc_id>` returns
   the page's full stored text while you hold the task. Judge support from that text, as you would from the page.
2. **Copy excerpts from the stored text.** Every passage, and every run of words inside one, is verbatim by
   construction. Check any excerpt with `POST evidence/check-excerpt -d '{"doc_id": <id>, "excerpt": "…"}'`
   (`match` true or false, and the `closest` passage when false). `complete` checks every excerpt whose page is
   stored: one that is not on the page, whitespace aside, is a 422 that names the closest passage; copy that, or
   drop the excerpt. Case, quote marks, dashes and footnote markers ("[12]") all count.
3. **Cite the page's URL** (the entry's `url`), with `"method": "agent_read"`. The stored text is private: never
   paste more than the excerpt anywhere.
4. **Open a browser only for `unreadable` URLs whose reason is `browser_only`** (one tab, closed at the end), and
   mark those cites `"method": "browser_read"`. Other unreadable pages: fetch one yourself only with the honest
   User-Agent (below), and never one that `robots` or `blocked` refused. In a cloud round there is no browser: a
   draft that only `browser_only` pages support is held (the `run-round` skill).
5. **No pack yet** (no `evidence_pack` key, or a `deferred` reason): read the pages yourself as below.

```bash
api "$HUMANITRIBUTARY_API/documents/<doc_id>"                       # the stored text (a task you hold)
api -X POST "$HUMANITRIBUTARY_API/evidence/check-excerpt" -d '{"doc_id": 42, "excerpt": "…"}'
```

## Excerpts

- **Copy excerpts from the evidence pack's stored text when the page is in it** (above); otherwise **from the page itself, never from a fetch tool's summary.** Tools such as WebFetch hand back a
  model-written summary of the page, and the "quotes" in it are often paraphrased, shortened or straightened. For
  every excerpt (and every stance you record), read the page's own text: the in-app browser's `get_page_text`, or
  `javascript_tool` returning the matching sentence from `document.body.innerText`, or the raw page via `curl` where
  the site allows scripts. Then copy the sentence character for character. If only a summary is reachable, cite the
  page without an excerpt and say so in your note. Every review round so far has had to re-copy summarized excerpts.

## Dead, moved or changed links (`reason`: `dead_link`, `content_changed`)

The daily `link_health` job re-checked the citation and the `facts sweep` turned the result into this task. The
payload's `evidence` rows carry what it found (`http_status`, `archive_url`, `page_changed`); the full history is
in the admin (Ingest › Link checks) for the owner.

- **Dead** (404/410, a redirect to the site's home page, or 599, unreachable three rounds running): read the
  `archive_url` (Wayback) copy if there is one. It may stand as the citation (kind `archive`) if it says the same.
  Otherwise find a replacement page that explicitly supports the claim and record it. Mark the dead citation's
  evidence `unrelated` only if it no longer supports anything.
- **Changed**: re-read the page (the payload's `page_changes` has the diff when available). If it still says
  the same, record `supports` again (that stamps the new hash). If it now says something else, record
  `conflicts` with `--found`.
- **Blocked** (403, CAPTCHA) never comes as a task: the page may be fine. If you are re-reading such a page
  anyway, use a browser and `--method browser_read`.

## Suggested second sources (`reason`: `no_second_source`, `suggested_sources` in the payload)

The `second_source` job searched OpenAlex, Crossref, the Library of Congress, Chronicling America, the
Smithsonian, Europeana, the World Bank, the Nobel Prize API and the Office of the Historian for the claim's
subject. Each suggestion has a `url`, `title`, `adapter`, a keyword `score` and a short `snippet`. **A
suggestion is not evidence.** The job matched words, not meaning.

1. Open each suggestion, best score first. A DOI resolves to the publisher's page: read the abstract or the
   text you can reach. A paywalled abstract that doesn't state the claim doesn't count.
2. If it **explicitly** supports the claim (or one atomic part: the date, the place, a number), put it in the
   result's `evidence` on that part (`{"claim": <part id>, "url": …, "stance": "supports", "excerpt": "≤ 25 words"}`)
   and its id in `suggestions.accepted`.
3. Otherwise put its id in `suggestions.rejected`. Two or three rejections with nothing better: search yourself (a
   museum, a university, a national archive), or leave the claim single-source and say so in the note.

Complete as in `verify-claims`, with `"suggestions": {"accepted": [ids], "rejected": [ids]}` in the result: the API
records the evidence and marks each suggestion decided by you.
