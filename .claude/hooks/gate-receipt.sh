#!/usr/bin/env bash
# The gate must pass before a pull request (AGENTS.md "Working", ADR 0015).
# Run before `gh pr create`: blocks it (exit 2) unless `make check-pr` passed
# on the code committed now. A draft (--draft, -d) isn't held.
# The code is the folder the command runs in (hook_input.py), so a session in
# a worktree is checked against its own receipt. Only a `gh pr create` the
# command really runs, not one in a heredoc or quotes.
{ IFS= read -r dir; IFS= read -r run; IFS= read -r cmd; } < <(python3 "$(dirname "$0")/hook_input.py" gh pr create)
[ -n "$run" ] || exit 0
case " $run " in *" --draft "*|*" -d "*) exit 0 ;; esac
cd "$dir" 2>/dev/null || exit 0
# Not this repository, or a branch from before the receipt: nothing to ask.
[ -f scripts/check_pr.py ] || exit 0
out="$(python3 scripts/check_pr.py --receipt 2>&1)" && exit 0
printf '%s\n(checked in %s)\nThis pull request is held until the gate passes on the code it holds: commit, run `make check-pr`, then open it again (or open it with --draft).\n' "$out" "$dir" >&2
exit 2
