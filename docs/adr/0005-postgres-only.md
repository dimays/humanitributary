# 0005 — Postgres only, and its features where they help

**Status:** accepted (November 2026)

## Context

Django can run the same models on SQLite, which makes tests easy. But the
model's guarantees lean on things SQLite lacks: triggers with transaction-local
settings (ADR 0006), row locks with `SKIP LOCKED` (ADR 0003), trigram matching
for duplicates, JSONB with GIN indexes, and check constraints with regular
expressions.

## Decision

Postgres 16 everywhere, tests included. Locally it runs in Docker
(`docker-compose.yml`) on host port **5433**, because Postgres.app owns 5432 on
the owner's laptop; the password is random, generated into the gitignored
`.env`. Features used:

- JSONB with GIN indexes: document metadata, candidates' branch scores,
  entities' aliases, task payloads.
- `pg_trgm` GIN indexes on lowercased event titles, branch names and candidate
  titles, for duplicate matching.
- Check constraints for every enum, ranges (latitude, importance 1–3,
  confidence 0–1, tier 1–4), the kebab-case id rule, https-only citations, the
  openstax ban, public-domain image licenses and the 25-word excerpt.
- Unique and partial unique constraints (one open task per dedupe key).
- Triggers for the audit log.

## Consequences

- Tests need the Docker database running (`make db`); they take seconds.
- What the model promises holds against every writer, not just Django code.
- Moving off Postgres would mean rewriting those guarantees; we don't intend to.
