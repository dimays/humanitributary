# 09. Replace an agent token

Purpose: This procedure tells how to make an agent token, how to replace one, and how to revoke the old one.

An agent token is a bearer token for the agent API. The system keeps only its sha256 hash. The token shows one time,
when you make it.

## Before you start

- You have the Heroku CLI, and it has access to the app `humanitributary-staging`.
- You know the task kinds that the agent must do. The scopes are the kinds that have a result schema:
  `write_event`, `verify_claim`, `fill_gap`, `review_branch_proposal`, `map_branch_entities` and `audit`, or `*`
  for all of them.

## Procedure

1. Show the tokens that exist:

   ```bash
   heroku run python manage.py agent_token list -a humanitributary-staging
   ```

   Make sure that you know the name and the scopes of the old token.
2. Choose a new name for the new token, for example `writer-2`.
   Make sure that no token in the list has this name, also no revoked token.
3. Make the new token with the same scopes:

   ```bash
   heroku run python manage.py agent_token create writer-2 --scope write_event --by human:<your user name> -a humanitributary-staging
   ```

   Make sure that the output shows the token, which starts with `hta_`.
4. Put the token in your password manager.
   Make sure that the token is not in a file, a chat or a log.
5. Put the new token in the environment of the agent, as in step 7 of procedure
   [01](01-do-an-agent-round.md).
   Make sure that the old token is not in that environment.
6. Ask the API who you are with the new token:

   ```bash
   curl -sS -H "Authorization: Bearer $HUMANITRIBUTARY_API_TOKEN" "$HUMANITRIBUTARY_API/"
   ```

   Make sure that the answer names `agent:writer-2` and the correct scopes.
7. Find the tasks that the old token holds on the Work page of the console. Open the In progress tab of each kind.
   Make sure that the old agent holds no task.
8. If the old token holds a task, release it with procedure [07](07-release-a-stuck-task.md).
   Make sure that the task is `queued`.
9. Revoke the old token:

   ```bash
   heroku run python manage.py agent_token revoke <old name> -a humanitributary-staging
   ```

   Make sure that the output says `revoked agent:<old name>`.
10. Show the tokens again.
    Make sure that the old token shows `"revoked": true`.

> **CAUTION:** A name cannot have a second token. The revoked token keeps its name in the table. Thus each new token
> needs a new name. The agent then writes as `agent:<new name>`.

> **NOTE:** The `--by` option records who made the token. On a one-off dyno, the default is the user of the dyno.
> Give `--by human:<your user name>`.

> **NOTE:** A request with a revoked or unknown token gets the answer 401. A revoke affects only that one token.
