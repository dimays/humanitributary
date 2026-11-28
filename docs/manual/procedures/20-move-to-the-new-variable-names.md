# 20. Move to the new variable names

Purpose: This procedure tells how to move the agent environments from the old `HUMANITRIBUTARY_*` variables to
the new `MANYAGES_*` variables.

The skills and `manage.py tasks` read the new name of a variable first. If the new name has no value, they read
the old name. Thus a round operates when only one of the two names has a value. ADR 0047 gives the reason.

| Old name | New name |
|---|---|
| `HUMANITRIBUTARY_API` | `MANYAGES_API` |
| `HUMANITRIBUTARY_API_TOKEN` | `MANYAGES_API_TOKEN` |
| `HUMANITRIBUTARY_TOKEN_<ROLE>` | `MANYAGES_TOKEN_<ROLE>` |
| `HUMANITRIBUTARY_AGENT` | `MANYAGES_AGENT` |

Do this procedure one time.

## Before you start

- You have access to the cloud environment `manyages-work` at `https://claude.ai/code`.
- The pull request that adds the new names is in `main`.
- You have the seven round tokens in your password manager.

## Procedure

1. Open the cloud environment `manyages-work` at `https://claude.ai/code`.
   Make sure that the page shows the environment variables.
2. Find the variable `MANYAGES_API`.
   Make sure that its value is `https://data.manyages.com/api/agent`.
3. Find the seven `MANYAGES_TOKEN_*` variables. The table in [the daily round](../daily-round.md#the-tokens)
   gives their names.
   Make sure that each variable has the token of its role.
4. Let one round end. Monitor the Work page of the console.
   Make sure that the round has the status `published`, `held` or `finished`.
5. Read the summary of that round.
   Make sure that the summary does not tell about a token that is absent.
6. Delete `HUMANITRIBUTARY_API` and the seven `HUMANITRIBUTARY_TOKEN_*` variables from the environment.
   Make sure that no variable of the environment has a name that starts with `HUMANITRIBUTARY_`.
7. If a shell of your computer has an old variable, delete it there too. This command shows the names only:

   ```bash
   env | cut -d= -f1 | grep '^HUMANITRIBUTARY_'
   ```

   Make sure that the command shows no name.
8. Let the next round end.
   Make sure that the round has the status `published`, `held` or `finished`.
9. Ask for a pull request that removes the fallback to the old names.
   Make sure that the pull request refers to ADR 0047.

> **CAUTION:** Do not delete an old variable before a round ends with the new variables. If the new variable has
> no value and you deleted the old variable, the round leaves out the role of that token, or it stops.

> **NOTE:** A new variable with an incorrect token does not go back to the old variable. The API refuses the
> token with 401, and the round stops. Thus the round of step 4 tests the values of the new variables.

> **NOTE:** Do not show the value of a token on the screen. The command of step 7 shows the names of the
> variables only.
