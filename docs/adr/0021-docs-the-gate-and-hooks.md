# 0021 — One gate before every pull request, a receipt for it, and hooks that hold the line

**Status:** proposed (November 2026)

## Context

Before this, AGENTS.md asked for `make check`, `make test` and, when content
changed, `make roundtrip` before a pull request. Nothing checked that they
ran, or that they ran on the code being proposed rather than on an earlier
state of it. `make check` also piped the site's data check through `tail`,
so a failure there passed. Agent sessions open most pull requests here;
a rule an agent can forget at the end of a long task will be forgotten.

## Decision

- `make check-pr` (`scripts/check_pr.py`) is the gate: the guide's check
  first, then side by side the quick checks (`check-adr`, Django's checks,
  `makemigrations --check`, the site's data check, ruff when configured),
  the test suite and the round trip. CI runs the same command, so local and
  CI can't disagree about what passing means.
- A pass writes a receipt, `var/gate-receipt.json`: the commit and the git
  tree of the files on disk when the gate began. `check_pr.py --receipt`
  says whether `HEAD`'s tree is that tree.
- Claude Code hooks in `.claude/settings.json` (hooks only, no permission
  allow-lists): before `git commit`, `make check-guide` must pass or the
  commit is blocked; before `gh pr create` (not `--draft`), the receipt
  must match the committed code; when a turn ends, a non-blocking reminder
  if the guide is stale. The hooks parse the shell command (a commit
  mentioned in a heredoc or a string isn't one) and check the folder the
  command runs in, so worktrees are checked against themselves.
- The pull request template asks what changed and why, the decisions (ADRs
  added or amended), the guide chapters updated, how it was checked, and the
  data and content impact.

## Consequences

- A pull request opened from a session has passed the gate on exactly its
  code. Changing anything after the gate means running it again; drafts are
  exempt for early review.
- The gate needs the Docker Postgres and Node, and the round trip writes
  to the database in `DATABASE_URL`. A worktree running it beside a live
  ingestion run needs its own database.
- Humans committing outside Claude Code aren't blocked by the hooks; CI
  running `make check-pr` catches what they skip.
- The hooks run `make check-guide` on every commit and at the end of every
  turn: a few seconds each, without a database.
- The `parity` branch adds CI; when it merges, CI's job is `make check-pr`
  and this ADR's "CI runs the same command" becomes true in fact.
