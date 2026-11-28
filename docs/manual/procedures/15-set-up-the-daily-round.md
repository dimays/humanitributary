# 15. Set up the daily round

Purpose: This procedure tells how to make the tokens of the daily round, keep them in a cloud environment, and
make the routine.

Do this procedure one time. After that, the routine starts one round each day ([the daily round](../daily-round.md)).

## Before you start

- You have the Heroku CLI, and it has access to the app `humanitributary-staging`.
- You have a claude.ai account with Claude Code on the web, and access to the GitHub repository
  `dimays/humanitributary`.
- You have a password manager for the tokens.

## Procedure

1. Make the seven round tokens. Do each command, and copy each token into your password manager:

   ```bash
   A="-a humanitributary-staging"; B="--by human:<your user name>"
   heroku run python manage.py agent_token create round-recorder  --scope round               $B $A
   heroku run python manage.py agent_token create round-writer    --scope write_event         $B $A
   heroku run python manage.py agent_token create round-filler    --scope fill_gap            $B $A
   heroku run python manage.py agent_token create round-verifier  --scope verify_claim        $B $A
   heroku run python manage.py agent_token create round-mapper    --scope map_branch_entities $B $A
   heroku run python manage.py agent_token create round-reviewer  --scope review              $B $A
   heroku run python manage.py agent_token create round-publisher --scope publish             $B $A
   ```

   Make sure that you have seven tokens in the password manager.

   > **NOTE:** Use these names. The console shows the progress of a round from the tasks that `round-writer`,
   > `round-filler`, `round-verifier` and `round-mapper` get.
2. Show the tokens:

   ```bash
   heroku run python manage.py agent_token list -a humanitributary-staging
   ```

   Make sure that each of the seven names has the scope of the table in [the daily round](../daily-round.md#the-tokens).
3. Get the User-Agent of the project:

   ```bash
   heroku config:get INGEST_USER_AGENT -a humanitributary-staging
   ```

   Make sure that the value names the project and a contact address.
4. Open `https://claude.ai/code` and make a new cloud environment with the name `humanitributary-round`.
   Make sure that no other routine or person uses this environment.
5. Set the network access of the environment to Full.
   Make sure that the agents can get pages from many sites, and from `data.manyages.com`.
6. Add the environment variables in the form `KEY=value`, one on each line:

   ```text
   HUMANITRIBUTARY_API=https://data.manyages.com/api/agent
   INGEST_USER_AGENT=<the value from step 3>
   HUMANITRIBUTARY_TOKEN_ROUND=<the token of round-recorder>
   HUMANITRIBUTARY_TOKEN_WRITER=<the token of round-writer>
   HUMANITRIBUTARY_TOKEN_FILLER=<the token of round-filler>
   HUMANITRIBUTARY_TOKEN_VERIFIER=<the token of round-verifier>
   HUMANITRIBUTARY_TOKEN_MAPPER=<the token of round-mapper>
   HUMANITRIBUTARY_TOKEN_REVIEWER=<the token of round-reviewer>
   HUMANITRIBUTARY_TOKEN_PUBLISHER=<the token of round-publisher>
   ```

   Make sure that each token is in the variable with the correct name.
7. Open `https://claude.ai/code/routines` and make a new scheduled task. Use the values of the table below.
   Make sure that the task uses the environment `humanitributary-round`.
8. Set the schedule to the custom cron `0 6 * * *`.
   Make sure that the page shows the time 06:00 UTC each day.
9. If you use another schedule, set the same cron on the app:

   ```bash
   heroku config:set ROUND_SCHEDULE="0 6 * * *" -a humanitributary-staging
   ```

   Make sure that the Work page of the console shows the same time.
10. Remove the connectors that the task does not need.
    Make sure that the task has no connector.
11. Save the task. Then click "Run now".
    Make sure that a session starts.
12. Monitor the Work page of the console.
    Make sure that a new round shows the trigger "scheduled".
13. Read the summary at the end of the session.
    Make sure that it gives the round number and the release, or the reason for no release.

| Field | Value |
|---|---|
| Name | `Daily agent round` |
| Repository | `dimays/humanitributary`, the default branch `main` |
| Cloud environment | `humanitributary-round` |
| Schedule | the cron `0 6 * * *` (UTC) |
| Prompt | `Run today's agent round. Follow .claude/skills/run-round/SKILL.md exactly, with the trigger "schedule". Do not change, commit or push files in the repository.` |

> **WARNING:** Each person who can use the environment can read its variables. Give the environment to nobody else.
> If a token goes to another person, revoke it with procedure [09](09-replace-an-agent-token.md) and change the
> variable.

> **CAUTION:** Do not put a token in the prompt, in the repository or in a URL. The routine reads the tokens from
> the environment only.

> **NOTE:** To stop the rounds for a time, use procedure [14](14-control-the-daily-round.md). To stop them
> permanently, pause or delete the scheduled task at `https://claude.ai/code/routines`.
