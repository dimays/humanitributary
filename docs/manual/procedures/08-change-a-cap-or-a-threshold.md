# 08. Change a cap or a threshold

Purpose: This procedure tells how to change a daily cap, a threshold or a limit with a Heroku config var, with no deploy.

## The values that a config var can change

| Config var | Default | What it controls |
|---|---|---|
| `WRITE_EVENT_TASKS_PER_DAY` | 20 | The maximum number of new `write_event` tasks that `process` makes each day |
| `WRITE_EVENT_THRESHOLD` | 70 | The priority that a story must have to become a `write_event` task |
| `FILL_GAP_TASKS_PER_DAY` | 40 | The maximum number of new `fill_gap` tasks that `gap_waves` makes each day |
| `FILL_GAP_MAX_OPEN_PER_BRANCH` | 2 | The maximum number of open `fill_gap` tasks for one branch |
| `TASK_LEASE_MINUTES` | 30 | The length of a lease when an agent claims a task |
| `AGENT_API_RATE_PER_MINUTE` | 120 | The maximum number of requests for each agent token each minute |
| `ALERT_AFTER_FAILURES` | 3 | The number of failed runs in a row that send an alert |
| `WORKER_TICK_SECONDS` | 60 | The time between two passes of the worker |

The defaults are in `config/settings.py`. A daily cap counts the tasks that the job made since midnight.

## Before you start

- You have the Heroku CLI, and it has access to the app `humanitributary-staging`.
- You have the numbers that show why the value must change, for example the reject rate of a round.

## Procedure

1. Record the reason and the numbers in an ADR, or in a new ADR that amends ADR 0027.
   Make sure that the ADR names the old value and the new value.
2. Show the value that the app uses now:

   ```bash
   heroku config:get WRITE_EVENT_THRESHOLD -a humanitributary-staging
   ```

   Make sure that you know the old value. An empty output means that the app uses the default.
3. Set the new value:

   ```bash
   heroku config:set WRITE_EVENT_THRESHOLD=75 -a humanitributary-staging
   ```

   Make sure that the output says that Heroku restarts the dynos.
4. Show the dynos:

   ```bash
   heroku ps -a humanitributary-staging
   ```

   Make sure that the `web` dyno and the `worker` dyno are `up`.
5. Open the Work page of the console, `https://data.manyages.com/ops/work/`.
   If you changed a cap, make sure that the card of the task kind shows the new cap.
6. Commit the ADR with procedure [11](11-deploy-a-code-change.md).
   Make sure that CI passes.

To return to the default, remove the config var:

```bash
heroku config:unset WRITE_EVENT_THRESHOLD -a humanitributary-staging
```

> **CAUTION:** A change to a config var restarts all dynos. The worker stops after the job that runs now. Heroku gives
> it 30 seconds. If the job runs longer, Heroku stops it, and the next run records it as `failed` ("interrupted").

> **NOTE:** A change to a threshold does not change the tasks that are open now. A new cap applies from the next run
> of the job.

> **NOTE:** The rules of branch governance (`governance/thresholds.py`) and of the fact base (`evidence/policy.py`)
> are in the code, not in config vars. To change one of them, change the code, increase its `RULES_VERSION`, and
> deploy with procedure [11](11-deploy-a-code-change.md).
