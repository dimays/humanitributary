---
title: How this guide stays true
summary: How the guide, the ADRs and the gate keep the docs in step with the code, and what blocks a commit or a pull request when they drift.
order: 110
covers:
  - guide/**
  - scripts/check_adr.py
  - scripts/check_pr.py
  - .claude/settings.json
  - .claude/hooks/**
  - .github/pull_request_template.md
  - docs/guide/README.md
  - tests/test_guide.py
---

Docs about code usually go wrong quietly: the code changes and the words
don't. This guide declares, chapter by chapter, which code each one
explains, and keeps a stamp of that code. When the code changes, the check
names the chapters to read again and the diff to read, and the commit is
blocked until someone has.

Decisions get the same care. The why behind the code lives in ADRs
(`docs/adr/`), and a check holds them to each other: a new decision that
changes an old one says so, and the old one says it was changed. One
command, `make check-pr`, runs every check and the tests before a pull
request, and CI runs the same command.

## Where it lives

| Path | What it does |
|---|---|
| `docs/guide/` | The chapters, `README.md` (the chapter list and the writers' guide) and `stamps.json` (each chapter's stamp). |
| `guide/chapters.py` | Reads a chapter's front matter and body, and reads and writes `stamps.json`. |
| `guide/coverage.py` | Which files a chapter covers, their hash, and what changed since the stamp. |
| `guide/checks.py` | `make check-guide`: everything the guide is held to. |
| `guide/management/commands/guide.py` | `manage.py guide check`, `stamp`, `status`, `covers`, `index`. |
| `scripts/check_adr.py` | `make check-adr`: the ADRs agree with each other and the index is complete. |
| `scripts/check_pr.py` | `make check-pr`: the gate, and its receipt. |
| `.claude/settings.json`, `.claude/hooks/` | The Claude Code hooks that block a stale commit and hold a pull request until the gate passed. |
| `.github/pull_request_template.md` | What a pull request says: what changed, decisions, chapters, checks, data impact. |
| `tests/test_guide.py` | Tests for all of the above. |

The `guide` app has no models and no URLs; it is in `INSTALLED_APPS` only
so `manage.py guide` exists. Its modules use the standard library alone, so
the check needs no database (the command skips Django's system checks).

## A chapter and its stamp

A chapter is a Markdown file with front matter:

```yaml
---
title: Ingestion
summary: One sentence, for the chapter list.
order: 30
covers:
  - ingest/**
  - "!ingest/migrations/**"
---
```

`covers` lists paths and globs: `**` crosses folders, `*` doesn't, a folder
takes everything in it, and `!pattern` leaves something out (after every
other pattern has been applied). `guide/coverage.py` `covered()` turns them
into a list of files: the files git would commit, which are the tracked ones
plus new ones git doesn't ignore. So a stamp made before `git add` still
matches in CI.

`fingerprint()` hashes them. Each file's hash is the one git gives it (a
SHA-1 of the file as a blob), and the chapter's hash is a SHA-256 of every
path and blob hash, cut to 12 characters. It changes when a covered file is
edited, added, removed or renamed, and never because of a commit elsewhere
or a rebase.

`make guide-stamp CHAPTER=ingestion` writes the date and that hash to
`docs/guide/stamps.json`, one chapter a line:

```json
{
  "ingestion": {"reviewed": "2026-11-26", "hash": "3f2a9c1b4d5e"}
}
```

A stamp means "I read this chapter against this code". It doesn't mean
"make the check pass". Stamping without reading is the one way to defeat
the system. The stamp refuses while the chapter has any other problem (a
broken link, a missing path, a pattern that matches nothing).

## When the check fails

Say a change edits `ingest/routing.py`. `make check-guide` then says:

```text
✖ ingestion (docs/guide/ingestion.md) covers files that changed since it was reviewed on 2026-11-26:
      ingest/routing.py  changed
    What changed: git diff 6b7a43791c -- ingest/routing.py
    Review the chapter, update it, then run: make guide-stamp CHAPTER=ingestion
```

To find "since", `coverage.stamped_at()` asks git which commit last added
the stamp's hash to `stamps.json` (`git log -S<hash>`), and
`changed_since()` lists the covered files that changed, appeared or went
away from that commit to now. When the stamp isn't committed yet, or there's
no history (a shallow clone), it lists every covered file instead.

The fix is always the same: read the diff, update the chapter, stamp it,
and commit the chapter and `stamps.json` with the change.

## What else the check holds

`guide/checks.py` `run()` also fails on:

- **Front matter** that doesn't read, lacks `title`, `summary`, `order` or
  `covers`, takes another chapter's `order`, or has a `reviewed:` line (the
  stamp lives in `stamps.json`).
- **Patterns that match nothing**: a renamed file must not quietly drop out
  of a chapter's coverage.
- **Links that don't land.** Every relative link must reach a file or
  folder in the repository. A link to a chapter's heading, or to a heading
  in the same chapter, must find that heading, with anchors made as GitHub
  makes them (`anchor()`). Links in code blocks and web links aren't
  checked.
- **Paths that don't exist.** A backticked word that looks like a path
  rooted at the repository (its first folder is one of the repository's,
  and it has a slash or a file ending) must exist. Placeholders with `<…>`,
  globs, paths under `var/` and files git ignores (`site/timeline.html`)
  are let through.
- **The chapter list** in `docs/guide/README.md` must be every chapter, in
  order, with its title and summary (`make guide-index` rewrites it).
- **Stamps for chapters that are gone**: remove the line.

## The ADR check

`make check-adr` (`scripts/check_adr.py`) holds the decisions to each
other:

- Each file is `NNNN-words.md`, its title `# NNNN — …` with the same number,
  and no number is used twice. Sessions working at once each reach for the
  next number; the second to merge renumbers.
- Each has a `**Status:**` line starting accepted, proposed, superseded or
  deprecated.
- An ADR whose Status says it amends, supersedes or refines another names
  it with a link (`Amends [0007](0007-….md)`), and that one's Status names
  it back (`amended by [0008](0008-….md)`). A plain "ADR 0007" in such a
  clause fails, since a reader of the old ADR would never learn it changed.
- Every link to an ADR file resolves.
- The index in `docs/adr/README.md` lists every ADR with its title and
  status word (`make adr-index` rewrites it). The README also holds the
  template.

## The gate

`make check-pr` (`scripts/check_pr.py`) runs everything a pull request must
pass, and it is what CI runs too:

1. `manage.py guide check` first, alone: it is quick, and a stale guide is
   the most common failure.
2. Then three lanes side by side:
   - **quick checks**, one after another: `check-adr`, `manage.py check`,
     `makemigrations --check --dry-run`, and `ruff check` when
     `pyproject.toml` or a `ruff.toml` configures ruff;
   - **tests**: `manage.py test` (on its own `test_<database>`);
   - **release gates**: `make roundtrip` (`manage.py publish --check`: the
     release gates on the database's content, deterministic, build, contested
     and the change report, writing nothing: [Publishing](publishing.md#release-gates)).

The tests and the release gates both need a Postgres: the Docker one
locally, a service container in CI (filled from the frozen legacy files by
`make import-archive`, since the real content isn't in git). The tests never
touch object storage (the runner swaps in temporary directories), and the
release gates write nothing: they read the database in `DATABASE_URL` and
the release pointer in the store `.env` names (for the change report). A
worktree that runs the gate while another session ingests can still have a
database of its own (a `humanitributary_<branch>` database on the same
server, named in that worktree's `.env`), so its gates see its own content.

On a pass, the gate writes `var/gate-receipt.json`: the commit and the
tree of the files as they were on disk when the gate began (a git tree hash,
built in a throwaway index, so new and uncommitted files count). An edit
made while the gate ran isn't what passed. `python3 scripts/check_pr.py
--receipt` says yes only when `HEAD`'s tree is that tree: you ran the gate,
then committed exactly what it checked. `var/` is per worktree, so each
worktree keeps its own receipt.

CI is GitHub Actions (`.github/workflows/check.yml`): `make check-pr` on
every pull request and every push to main, after `uv sync --frozen` and
`manage.py migrate`. It gets a throwaway Postgres 16 as a service container
on port 5433, Node for the site's build, a full clone (`fetch-depth: 0`,
since stamps are checked against git history) and `STORAGE_BACKEND=local`,
so it uses no secrets and nothing reaches MinIO, S3 or the network.

## The hooks

`.claude/settings.json` gives Claude Code sessions in this repository
three hooks, and nothing else (no permission allow-lists):

| When | Hook | Does |
|---|---|---|
| Before a Bash `git commit` | `check-guide.sh commit` | Runs `make check-guide`; if it fails, blocks the commit (exit 2) and prints what to review. |
| Before a Bash `gh pr create` | `gate-receipt.sh` | Asks `check_pr.py --receipt`; blocks unless the gate passed on the committed code. A `--draft` pull request isn't held. |
| When a turn ends | `check-guide.sh stop` | Runs `make check-guide`; if it fails, a reminder (a system message), never a block. |

Both scripts start with `.claude/hooks/hook_input.py`, which reads the
hook's JSON and answers two questions:

- **Does the command really run `git commit`?** The settings' `if`
  matches loosely, so the hook parses the shell command itself: a program at
  the start of a command, after `&&`, `||`, `;`, `|` or a newline, or inside
  `$( )`, counts. Words in quotes, a heredoc's body or a comment don't. A
  heredoc that writes a file mentioning `git commit` isn't a commit.
  Options with values (`git -C dir commit`, `gh -R repo pr create`) are
  skipped over.
- **Which folder is it about?** The hook's `cwd`, or the folder a leading
  `cd <dir> &&` or `git -C <dir>` moves to. Not `$CLAUDE_PROJECT_DIR`: a
  session working in a worktree often has its project folder in the main
  checkout, and the stamps and the receipt belong to the worktree.

Each hook exits quietly in a folder without the check (another repository,
or a branch from before the guide), so the hooks never get in the way of
older branches.

The commit hook runs before the whole command, so `make guide-stamp … &&
git commit` is checked before the stamp has run. The hook notices this and
says to stamp first, then commit in a separate command.

## Changing it

- **A new chapter:** write `docs/guide/<name>.md` with its front matter
  (`docs/guide/README.md` has the rules and the style), add it to the
  [glossary](glossary.md) where it defines terms, `make guide-index`, then
  `make guide-stamp CHAPTER=<name>`.
- **Renaming or deleting a chapter:** move or delete the file, then remove
  or rename its line in `stamps.json` (the check names it), `make
  guide-index`, and fix the links the check reports.
- **A new check in the gate:** add a step to `lanes()` in
  `scripts/check_pr.py`. A lane that needs a service CI doesn't have is
  CI's problem first: say so in its ADR.
- **Changing the hash or the covers syntax** changes every chapter's
  hash though no code they explain changed: re-stamp every chapter in the
  same commit and say why in the pull request.
- **Changing the hooks:** keep them to blocking on the guide and the gate.
  `tests/test_guide.py` holds the command parsing; add a case for any
  command shape that fooled it.

The decisions are [ADR 0014](../adr/0014-technical-guide.md) (the
guide and its stamps) and [ADR 0015](../adr/0015-the-gate-and-hooks.md)
(the gate, the receipt and the hooks).
