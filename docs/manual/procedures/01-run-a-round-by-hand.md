# 01. Run a round by hand

Purpose: This procedure tells how to start one agent round from a Claude Code session on your computer, and how to
examine its result.

The daily cloud routine does the same round each day ([the daily round](../daily-round.md)). Run a round by hand when
you want one now, or when drafts need the in-app browser. A cloud session has no browser, so it cannot read the
`browser_only` publishers. A desktop session can read them.

The skill `run-round` does all the stages: the plan, the role agents, the review, the edit file and the release.
To review and publish without the skill, use procedures [02](02-review-drafts-and-apply-an-edit-file.md) and
[03](03-publish-a-release.md).

## Before you start

- You have the Heroku CLI, and it has access to the app `humanitributary-staging`.
- You have a staff user for `https://data.humanitributary.com/ops/`.
- You have the round tokens from procedure [15](15-set-up-the-daily-round.md), or you make them with procedure
  [09](09-replace-an-agent-token.md).
- You have the Claude Code desktop app and a checkout of the repository. The skills are in `.claude/skills/`.

| Skill | What it does |
|---|---|
| `run-round` | A full round: the configuration, the plan, the agents, the review, the edit file and the release |
| `fill-gaps` | `fill_gap` tasks |
| `map-branch-entities` | `map_branch_entities` tasks |
| `drain-write-events` | `write_event` tasks |
| `verify-claims` | `verify_claim` tasks |
| `verify-stale-claims` | `verify_claim` tasks about dead links, changed pages and second sources |
| `review-branch-proposals` | `review_branch_proposal` tasks |

## Procedure

1. Open the Work page of the console.
   Make sure that the last round does not show the state `running` or `reviewing`.
2. Show the agent tokens:

   ```bash
   heroku run python manage.py agent_token list -a humanitributary-staging
   ```

   Make sure that each round token has `"revoked": false` and the correct scope.
3. Open a terminal in the root folder of the checkout.
   Make sure that the folder contains `AGENTS.md`.
4. Set the base URL of the agent API:

   ```bash
   export HUMANITRIBUTARY_API=https://data.humanitributary.com/api/agent
   ```

   Make sure that the URL has no token in it.
5. Set the User-Agent of the project. Use the value of the app:

   ```bash
   export INGEST_USER_AGENT="$(heroku config:get INGEST_USER_AGENT -a humanitributary-staging)"
   ```

   Make sure that the value names the project and a contact address.
6. Put the round token in its variable. Paste the token when the shell waits:

   ```bash
   read -rs HUMANITRIBUTARY_TOKEN_ROUND && export HUMANITRIBUTARY_TOKEN_ROUND
   ```

   Make sure that the token is not on the screen.
7. Do step 6 again for each other token of the table in [the daily round](../daily-round.md#the-tokens).
   Make sure that each variable has its own token.
8. Start Claude Code in this terminal.
   Make sure that Claude Code shows the skill `run-round`.
9. Tell Claude: "Run a round with the run-round skill. The trigger is manual."
   Make sure that its first API call is `GET rounds/settings`.
10. Monitor the Work page of the console.
    Make sure that the new round shows the state `running`, and later `reviewing`.
11. If a draft has support only from a `browser_only` page, tell Claude to read that page in the in-app browser.
    Make sure that each agent uses only one tab and closes it at the end.
12. Read the summary at the end of the session.
    Make sure that it gives the round number and the release, or the reason for no release.
13. Open the page of the round. On the Work page, click the square of the round.
    Make sure that each stage shows done, skipped or a reason.
14. If the round shows "Held for review", read the notes on its page.
    Make sure that you know the cause before the next round starts.
15. Find the tasks that are still in progress on the Work page of the console.
    Make sure that no stopped agent holds a task.
16. If a stopped agent holds a task, release it with procedure [07](07-release-a-stuck-task.md).
    Make sure that the task is `queued` again.

> **CAUTION:** Do not put a token in a URL, in a command line that a log keeps, or in a file that git tracks. If another
> person gets the token, revoke it at once with `manage.py agent_token revoke <name>`.

> **NOTE:** If an operator paused the scheduled rounds, a round with the trigger `manual` still runs. Only one round
> can be open at a time. If the API says `busy`, wait until the open round finishes.

> **NOTE:** A token can claim only the task kinds of its scope. If an agent asks for another kind, the API returns
> 403. Each token can make `AGENT_API_RATE_PER_MINUTE` (120) requests each minute. Above that, the API returns 429.

> **NOTE:** The lease of a task is `TASK_LEASE_MINUTES` (30) minutes. An agent extends it after about 20 minutes of
> work on one task. If an agent stops without a release, another agent can take the task after the lease time.
