# Troubleshooting

Purpose: This file gives the usual symptoms, their causes, and the actions that correct them.

Find the symptom in the first column. Do the action in the third column. If the action names a procedure, do the
procedure.

## Jobs and the worker

| Symptom | Cause | Action |
|---|---|---|
| A job fails at each run. The console shows its row in red, and an alert came. | The source is down, the source changed its format, or the code has a fault. | Read the error of the newest run. Do procedure [05](procedures/05-run-a-failed-job-again.md). If it fails again, pause the job with procedure [06](procedures/06-pause-and-resume-a-job.md). |
| The error says `interrupted (the runner exited before finishing)`. | The process stopped in the run: a deploy, a restart or a config change. | No action. The job runs again at its next due time. |
| The error says that a publisher is `browser_only`, names `NEVER_FETCH`, or says that `robots.txt` disallows the path. | The source policy refused the request. The policy is correct. The feed or the URL is not. | Clear `enabled` on the `Feed` row in the admin, and give a `disabled_reason`. |
| The error says `answered with a bot challenge`. | The host showed a CAPTCHA. The Fetcher stops all requests to that host for the rest of the run. | No action for one run. `link_health` skips the host for 14 days (`BLOCKED_COOLDOWN_DAYS`). If it occurs at each run, stop the feed. |
| The runs of one source show many 429 or 503 answers. | The source limits the rate of requests. The Fetcher waits and tries again, with the `Retry-After` time. | If the source states a rate, add the host to `HOST_DELAY` in `ingest/policy.py`. Increase the interval of the `Feed` row. |
| The error is a Python exception in a parser. | The source changed the format of its pages. | Correct the parser. Record the test cassette again with `tests/record_fixtures.py`. Deploy with procedure [11](procedures/11-deploy-a-code-change.md). |
| The Dashboard of the console says that no worker runs, or no job ran for 30 minutes. | The `worker` dyno is not up, or it is at 0. | Run `heroku ps -a humanitributary-staging`. If no worker shows, run `heroku ps:scale worker=1 -a humanitributary-staging`. Read `heroku logs --tail -a humanitributary-staging`. |
| The card of a run shows a runtime in amber, for example `2.1× usual`. | The run took at least 1.5 times the median runtime of the job, and more than its p90. A source is slow, the job had more items, or the database was busy. | Open the run. Read the times of the requests in its log. If each run of the job is slow, examine the source or the size of the batch. |
| The card of a run shows a long gray `Wait after due` or `Queued` segment. | The worker ran other jobs first, or no worker ran. | Examine the run graph for long runs before it. If no worker runs, do the action for "no worker runs" in this table. |
| The card of a run says `Wait: not recorded`. | The run is older than the record of due times, or it is the first run of the job. | No action. New runs record the time. |
| A console action stays `pending`. | No worker holds the scheduler lock, or the worker is in a long job. | If the action page says that no worker runs, start the worker. Otherwise wait for the job to end. You can withdraw a `pending` action from its page. |
| `run_job` prints `another run_jobs holds the lock; exiting`. | The worker runs a job now. Only one runner can hold the lock. | Wait some minutes and do the command again. Or use the console action, which runs between jobs. |
| `run_jobs --list` shows a job as paused. | An operator paused it from the console. | Read who paused it and why on the page of the job in the console. Resume it with procedure [06](procedures/06-pause-and-resume-a-job.md). |

## The queue and the agents

| Symptom | Cause | Action |
|---|---|---|
| The queue of `write_event` tasks is empty. | The daily cap is full, no story is at the threshold, an operator paused `process`, or the worker is not up. | Examine the card of the kind on the Work page of the console. If the cap holds stories (`tasks_held_by_daily_cap`), wait for the next day or do procedure [08](procedures/08-change-a-cap-or-a-threshold.md). |
| The queue of `fill_gap` tasks is empty. | The daily cap `FILL_GAP_TASKS_PER_DAY` is full, or each branch has its maximum of open tasks. | Examine the wave card on the Work page of the console. It shows the gaps that waited for the daily cap. Complete the open tasks first. |
| An agent gets `{"task": null}`. | No queued task has a kind in the scopes of the agent. | Examine the queue for each kind on the console. Give the agent a token for a kind that has tasks. |
| An agent gets 401. | The session has no token, or the token is unknown or revoked. | Make sure that the session has `HUMANITRIBUTARY_API_TOKEN`. Do procedure [09](procedures/09-replace-an-agent-token.md). |
| An agent gets 403. | The token does not have the scope of that task kind. | Make a token with that scope with procedure [09](procedures/09-replace-an-agent-token.md). |
| An agent gets 409 on `complete`. | The agent does not hold the task now. Another agent took it after the lease time. | Tell the agent to claim a new task. |
| An agent gets 422 on `complete`. | The result does not match the schema of its kind, or the API cannot apply it. | Read the list of problems in the answer. The agent still holds the task. Correct the result and send it again. |
| An agent gets 429 from the agent API. | The token made more than `AGENT_API_RATE_PER_MINUTE` (120) requests in one minute. | Wait the number of seconds in `retry_after`, then continue. |
| A task shows as stuck on the console. | The lease time is past, and the agent did not release the task. | Do procedure [07](procedures/07-release-a-stuck-task.md). |
| A task failed with `lease expired after 3 attempts`. | Three agents claimed the task and none completed it. | Read the payload and the error of the task. If the task is valid, requeue it on the console. |
| `agent_token create` says that a token with that name exists. | Each name can have only one token, also after a revoke. | Choose a new name. See procedure [09](procedures/09-replace-an-agent-token.md). |

## Publish and the page

| Symptom | Cause | Action |
|---|---|---|
| `publish` says `Unchanged since <version> (content and page)`. | No published entry and no page input changed since the newest release. The drafts can still have the status `review`. | Make sure that you applied the edit file and that its `approve` operations ran. Find the drafts in the admin with the status `review`. |
| `publish` says `publish refused:` and names the gates. | A release gate failed. The command wrote nothing. | See the gate table in procedure [03](procedures/03-publish-a-release.md). |
| The page did not change after a deploy. | The page at `/` comes from the latest release, not from the deployed code. | If the change is in a page input, such as `site/template.html`, publish with procedure [03](procedures/03-publish-a-release.md). |
| The page did not change after a publish. | The `web` dyno reads the pointer at most once a minute. A browser can keep the page for 5 minutes. | Run `curl -sI https://humanitributary.com/` and read `X-Release`. If it names the new version, load the page again after 5 minutes. |
| `/` answers 503 with `Nothing is published yet.` | The `releases` bucket has no pointer. | Publish a release with procedure [03](procedures/03-publish-a-release.md). |
| `/healthz` answers 503. | The database or one of the two stores does not answer. | Read the JSON of `/healthz`. Run `heroku pg:info -a humanitributary-staging`. Make sure that the app has the S3 config vars. |
| `apply_edits` says `nothing applied` and lists problems. | One or more operations are not valid. The command keeps nothing. | Send the problems to the reviewer. Apply the corrected file with procedure [02](procedures/02-review-drafts-and-apply-an-edit-file.md). |

## CI and deploys

| Symptom | Cause | Action |
|---|---|---|
| CI fails on `check-guide`. | The change touches code that a guide chapter covers, and the chapter has no new stamp. | Run `make check-guide`. Read the diff that it names. Update the chapter. Run `make guide-stamp CHAPTER=<chapter>`, and commit `docs/guide/stamps.json`. |
| CI fails on `check-adr`. | An ADR has a bad name, title or Status line, or the index is old. | Run `make check-adr` and read the problems. Run `make adr-index` to write the index again. |
| CI fails on `check-manual`. | A sentence in `docs/manual/` breaks an STE rule. | Run `make check-manual`. Write the sentence again with the rules in [the manual's README](README.md#the-rules-of-the-text). |
| CI fails in the tests or the release gates. | The change has a fault, or the content in the archive fails a gate. | Run `make check-pr` on your computer. Read the output of the lane that failed. |
| A deploy fails in the release phase. | A migration failed. Heroku keeps the earlier release live. | Run `heroku releases:output -a humanitributary-staging`. Correct the migration with procedure [11](procedures/11-deploy-a-code-change.md). |
| Heroku did not deploy after a merge. | CI did not pass on `main`, or the automatic deploy is off. | Examine the checks of the newest commit on `main`. Examine the Deploy tab of the app on the Heroku dashboard. |
