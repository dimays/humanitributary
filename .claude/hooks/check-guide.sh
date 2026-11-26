#!/usr/bin/env bash
# The technical guide must stay true to the code (AGENTS.md rule 14, ADR 0020).
# commit: run before `git commit` and block it (exit 2) if the guide is stale.
# stop:   run when Claude finishes a turn; a reminder only, never blocks.
mode="${1:-commit}"
# The folder the command runs in, or the session's (hook_input.py): a session
# in a worktree is checked against its own guide. Only a `git commit` the
# command really runs, not one in a heredoc or quotes: the settings' `if`
# lets some other commands by.
{ IFS= read -r dir; IFS= read -r run; IFS= read -r cmd; } < <(python3 "$(dirname "$0")/hook_input.py" git commit)
if [ "$mode" = "commit" ] && [ -z "$run" ]; then
  exit 0
fi
cd "$dir" 2>/dev/null || exit 0
# Not this repository, or a branch from before the guide: nothing to enforce.
grep -q '^check-guide:' Makefile 2>/dev/null || exit 0
out="$(make -s check-guide 2>&1)" && exit 0
out="$(printf '%s\n' "$out" | grep -v '^make: \*\*\*')"
if [ "$mode" = "commit" ]; then
  printf 'The technical guide is out of date with the code, so this commit is blocked.\n%s\nReview and update the chapters named above, then run `make guide-stamp CHAPTER=<chapter>` and commit again.\n' "$out" >&2
  # This hook runs before the whole command, so a stamp chained before the
  # commit hasn't run yet when the guide is checked.
  case "$cmd" in *guide-stamp*|*"guide stamp"*)
    printf 'This command stamps the guide and then commits, but the check runs before any of it, so it sees the guide unstamped. Stamp first, then commit in a separate command.\n' >&2 ;;
  esac
  exit 2
fi
msg="Reminder: make check-guide fails in $dir. Update the technical guide chapters it names (then make guide-stamp CHAPTER=…) before committing."
python3 -c 'import json, sys; print(json.dumps({"systemMessage": sys.argv[1]}))' "$msg"
exit 0
