# CLAUDE.md

See [AGENTS.md](AGENTS.md): it is the guide for every agent and contributor working in this repo.

One of its rules touches every change: every write to a canonical table (timeline, evidence) goes through `revisions.revising(actor, reason, task)` and the service layer, and leaves a Revision; the database refuses anything else (AGENTS.md rule 2). Postgres is the source of truth, so never edit a release snapshot or `site/timeline.html` by hand (rule 1).
