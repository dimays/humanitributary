#!/bin/bash
# One scheduled tick: make sure the local Postgres is up (or skip cleanly), then `manage.py run_jobs`.
# Called by launchd every 15 minutes (ops/launchd/run-jobs.plist, installed by `make schedule-install`);
# safe to run by hand. Logs go to var/logs/run-jobs-YYYY-MM-DD.log. Exit 0 when skipped, so launchd doesn't
# back off; the runner's own lock keeps two ticks from overlapping.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
REPO="$(pwd)"
mkdir -p var/logs
LOG="var/logs/run-jobs-$(date +%F).log"
log() { echo "$(date '+%F %T') $*" >>"$LOG"; }
export PATH="/opt/homebrew/bin:/usr/local/bin:/Applications/Docker.app/Contents/Resources/bin:$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

# The database: Docker's Postgres on 5433 (never 5432). Already answering (from any checkout or worktree)? Go.
# Otherwise start Docker Desktop if it isn't running (wait up to 2 min) and the compose service.
if nc -z localhost 5433 >/dev/null 2>&1; then
  :
elif ! docker info >/dev/null 2>&1; then
  if [ "${INGEST_START_DOCKER:-1}" = "1" ] && [ -d /Applications/Docker.app ]; then
    log "Docker is not running: starting Docker Desktop"
    open -g -a Docker
    for _ in $(seq 1 60); do docker info >/dev/null 2>&1 && break; sleep 2; done
  fi
  if ! docker info >/dev/null 2>&1; then
    log "skipped: Docker is not running"
    exit 0
  fi
fi
if ! nc -z localhost 5433 >/dev/null 2>&1 && ! docker compose up -d --wait db >>"$LOG" 2>&1; then
  log "skipped: the database container did not become healthy"
  exit 0
fi

UV="$(command -v uv || true)"
if [ -z "$UV" ]; then
  log "skipped: uv not found on PATH ($PATH)"
  exit 0
fi
log "run_jobs start ($REPO)"
"$UV" run --quiet python manage.py run_jobs >>"$LOG" 2>&1
status=$?
log "run_jobs exit $status"
exit 0
