# 0047 — The agent environment variables take the ManyAges name, with a fallback to the old one until the owner deletes it

**Status:** proposed (November 2026); amends [0043](0043-the-manyages-name.md) (the environment variables are renamed after all)

## Context

ADR 0043 kept the agent environment variables' old names (`HUMANITRIBUTARY_API`, `HUMANITRIBUTARY_API_TOKEN`,
`HUMANITRIBUTARY_TOKEN_<ROLE>`, `HUMANITRIBUTARY_AGENT`), because renaming them meant pasting nine secrets into the
cloud environment again. The owner has since done that: the `manyages-work` cloud environment holds `MANYAGES_API`
and the seven `MANYAGES_TOKEN_*` beside the old ones. The old names are now the last place an agent meets the old
site name, and every new environment would have to learn them.

The readers are the seven task skills in `.claude/skills/` (bash snippets an agent copies into its shell), the
`run-round` skill (which reads a role's token by its variable's name, `${!tok}`), `manage.py tasks`
(`HUMANITRIBUTARY_AGENT`), the token command's hint, and the docs. A rename that lands in `main` before every
environment has the new names must not break a scheduled round, and a round must not depend on which names the
environment has on a given day.

## Decision

**Every reader takes the new name first, then the old one.**

- The task skills' `api()` sends `${MANYAGES_API_TOKEN:-$HUMANITRIBUTARY_API_TOKEN}`, and every URL is
  `"${MANYAGES_API:-$HUMANITRIBUTARY_API}/…"`.
- `run-round` names a role's token with `tokvar <ROLE>`: `MANYAGES_TOKEN_<ROLE>` when it has a value, else
  `HUMANITRIBUTARY_TOKEN_<ROLE>`, else a non-zero exit. It prints the variable's name, never its value, and works
  under `set -u` (`${!name:-}`). `api <ROLE>` calls the API with it, and a role agent gets its token with
  `v=$(tokvar WRITER) && export MANYAGES_API_TOKEN="${!v}"`.
- `work/management/commands/tasks.py` reads `MANYAGES_AGENT`, else `HUMANITRIBUTARY_AGENT`, through one helper,
  `_env`.
- An empty value counts as unset, so a new variable left blank falls back. A new variable with a wrong token does
  not fall back: the API answers 401, as it would for the old one.
- `tests/test_agent_env.py` (no database) runs each skill's helper in a subprocess with fake values and a stand-in
  `curl`, and checks both orders; it also checks that no skill reads an old name without the fallback.

**The old names go in two steps** (the manual's procedure 20): after a round ends `published`, `held` or
`finished` on the new names, the owner deletes the old `HUMANITRIBUTARY_*` variables; then a follow-up pull request
removes the fallback, the test's old-name cases and this ADR's transition text from the skills and docs.

The other identifiers ADR 0043 kept (the Django project, the audit functions, the database and MinIO users, the S3
buckets, the Heroku app and pipeline) stay as they are, for the reasons it gives.

## Consequences

- No round breaks on the day this merges: an environment with only the old names, only the new ones or both works.
- New environments, the manual's procedures 01 and 15 and `agent_token create`'s hint use the new names.
- Until the follow-up, every snippet is longer by the fallback. A correct new variable always wins over a stale old
  one; only a blank new variable lets a stale old token through, and the API refuses it if it was revoked.
- The follow-up is a plain find and replace of `${MANYAGES_API:-$HUMANITRIBUTARY_API}` and the helpers; the test
  then checks only the new names.
