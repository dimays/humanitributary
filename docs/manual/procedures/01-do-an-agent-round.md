# 01. Do an agent round

Purpose: This procedure tells how to start Claude agents on the work queue and stop them when the round is complete.

An agent round has three parts. First, agents do the queued tasks. Then a reviewer examines the drafts (procedure
[02](02-review-drafts-and-apply-an-edit-file.md)). Then the owner publishes a release (procedure
[03](03-publish-a-release.md)).

## Before you start

- You have the Heroku CLI, and it has access to the app `humanitributary-staging`.
- You have a staff user for `https://data.humanitributary.com/admin/`.
- You have a checkout of the repository on the computer that runs Claude Code. The skills are in `.claude/skills/`.

| Skill | Task kind that it does |
|---|---|
| `drain-write-events` | `write_event` |
| `fill-gaps` | `fill_gap` |
| `verify-claims` | `verify_claim` |
| `verify-stale-claims` | `verify_claim` tasks about dead links, changed pages and second sources |
| `review-branch-proposals` | `review_branch_proposal` |

## Procedure

1. Open the console at `https://data.humanitributary.com/ops/`.
   Make sure that no health card is red.
2. Find the queue table for each task kind.
   Make sure that each kind that you plan to work has queued tasks.
3. Show the agent tokens:

   ```bash
   heroku run python manage.py agent_token list -a humanitributary-staging
   ```

   Make sure that each agent has a token with `"revoked": false` and the correct scope.
4. If an agent has no token, make one with procedure [09](09-replace-an-agent-token.md).
   Make sure that you have the token of each agent.
5. Open a terminal in the checkout of the repository.
   Make sure that the terminal is in the root folder of the checkout.
6. Set the base URL of the agent API:

   ```bash
   export HUMANITRIBUTARY_API=https://data.humanitributary.com/api/agent
   ```

   Make sure that the URL has no token in it.
7. Put the token of this agent in `HUMANITRIBUTARY_API_TOKEN`. Paste the token when the shell waits:

   ```bash
   read -rs HUMANITRIBUTARY_API_TOKEN && export HUMANITRIBUTARY_API_TOKEN
   ```

   Make sure that the token is not on the screen and not in a file that git tracks.
8. Start Claude Code in this terminal.
   Make sure that Claude Code shows the skills of the repository.
9. Tell the agent which skill to use, for example "Drain the write_event queue".
   Make sure that the first call of the agent (`GET /api/agent/`) shows the correct name and scopes.
10. Do steps 5 to 9 again for each other agent.
    Make sure that each agent has its own token.
11. Monitor the queue on the console work queue page.
    Make sure that the number of claimed tasks goes up and the number of queued tasks goes down.
12. If a task shows `stale` (the lease time is past), examine the agent that holds it.
    Make sure that the agent is still at work on the task.
13. At the end of the round, tell each agent to stop after its current task.
    Make sure that each agent completes, releases or fails its task.
14. Find the tasks that are still `claimed` on the console work queue page.
    Make sure that no stopped agent holds a task.
15. If a stopped agent holds a task, release it with procedure [07](07-release-a-stuck-task.md).
    Make sure that the task is `queued` again.
16. Open the list of entries in the admin and filter by the status `review`.
    Make sure that the list shows the drafts of this round.
17. Write the slugs of the drafts in a list for the reviewer.
    Make sure that the list has each draft of this round.

Then do procedure [02](02-review-drafts-and-apply-an-edit-file.md).

> **CAUTION:** Do not put a token in a URL, in a command line that a log keeps, or in a file that git tracks. If another
> person gets the token, revoke it at once with `manage.py agent_token revoke <name>`.

> **NOTE:** A token can claim only the task kinds of its scope. If an agent asks for another kind, the API returns
> 403. Each token can make `AGENT_API_RATE_PER_MINUTE` (120) requests each minute. Above that, the API returns 429.

> **NOTE:** The lease of a task is `TASK_LEASE_MINUTES` (30) minutes. If an agent stops without a release, another
> agent can take the task after the lease time. After `max_attempts` (3) claims, the task fails.
