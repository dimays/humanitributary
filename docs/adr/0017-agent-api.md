# 0017 — Agents work through an authenticated API, never the database

**Status:** proposed (November 2026); amended by [0021](0021-the-cutover.md) (nothing imports over Postgres now); refined by [0026](0026-content-waves.md) (content waves)

## Context

Agents claimed tasks and wrote results with `manage.py` commands and Python shells, which needs database
credentials and a checkout. In production the database is Heroku Postgres; handing its URL to every agent session
would give each one the power to bypass the queue, the schemas and the review step. The owner wants the same skills
to work locally and in production.

## Decision

A small JSON API under `/api/agent/` (`agentapi/`), served by the `web` process:

- **Tokens.** `manage.py agent_token create <name> --scope <kind> …` (the owner's command) prints a token once and
  stores only its sha256; `list` and `revoke` manage them. A token acts as `agent:<name>` and is scoped to the task
  kinds it may claim and complete (`*` for all); every token may use the read endpoints.
- **The queue over HTTP.** Peek, claim (a lease, under `FOR UPDATE SKIP LOCKED` as before), extend, release, fail
  and complete call `work.queue` unchanged.
- **Results are validated, then applied through the service layer.** Each kind has a JSON Schema
  (`agentapi/schemas.py`, served at `schemas/<kind>`); a result that fails it is a 422 that lists the problems.
  `agentapi/apply.py` applies it inside `revising("agent:<name>", task=…)` and completes the task in the same
  transaction, so a failure leaves nothing behind and the task still held. What an agent writes lands in review:
  new events are `review`; evidence goes through `record_evidence`; an accepted branch proposal stores the agent's
  operations with status `accepted` for the owner's `branches apply`; a corrected text is kept as `proposed_text`.
  Nothing is published by the API.
- **Reads an agent needs:** an entry with its claims, a branch summary (events, latest metrics, open proposals), a
  claim with its evidence and parts, and trigram search.
- **A rate limit per token** (`AGENT_API_RATE_PER_MINUTE`, 120), counted in one UPDATE so it holds across processes.
- The skills in `.claude/skills/` use the API with `HUMANITRIBUTARY_API` (base URL) and `HUMANITRIBUTARY_API_TOKEN`
  from the environment. The CLI (`manage.py tasks`, `facts record`, `branches apply`) stays for the owner.

## Consequences

- Agents never hold database credentials; revoking a token cuts one agent off without touching anyone else.
- The same skill works against `make up` locally and the production URL.
- Kinds without a schema (`enrich`, `recheck_citation`; no job queues them today) can only be completed with the CLI.
- Until the cutover (ADR 0001) a published event that exists only in Postgres is retracted by the next
  `make import --retract-missing`, so the owner carries events written through the API into `site/data/` when they
  publish them.
