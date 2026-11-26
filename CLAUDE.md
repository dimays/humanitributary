# CLAUDE.md

See [AGENTS.md](AGENTS.md): it is the guide for every agent and contributor working in this repo.

One of its rules touches every change: every change that alters behavior updates the technical guide (`docs/guide/`) in the same PR; `make check-guide` names the chapters to review, then `make guide-stamp CHAPTER=<chapter>` (AGENTS.md rule 14). Every canonical write goes through `revisions.revising(actor, reason, task)` and the service layer (rule 2), and `make check-pr` is the gate before a pull request.
