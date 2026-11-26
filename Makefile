# Common commands. `make help` lists them.
PY := uv run python
M := $(PY) manage.py

.PHONY: help env db db-stop psql migrate import-archive publish release-pull build build-release roundtrip test check check-adr adr-index check-guide guide-stamp guide-status guide-index check-pr serve up worker jobs digest storage-init storage-status storage-migrate schedule-install schedule-uninstall schedule-status

help: ## List the commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-14s %s\n", $$1, $$2}'

env: ## Write .env with random local-only passwords (adds missing keys to an existing one; prints no values)
	@$(PY) scripts/make_env.py

db: ## Start the local Postgres (host port 5433) and MinIO (127.0.0.1:9000/9001), and create the buckets
	@docker info >/dev/null 2>&1 || { open -a Docker; until docker info >/dev/null 2>&1; do sleep 2; done; }
	docker compose up -d --wait db minio
	@$(MAKE) --no-print-directory storage-init

db-stop: ## Stop Postgres and MinIO (the data stays in their volumes)
	docker compose stop db minio

storage-init: ## Create the object-store buckets if missing (make db does this)
	$(M) storage init

storage-status: ## Backend, buckets reachable, the latest release pointer
	$(M) storage status

storage-migrate: ## Copy var/raw and var/releases into the object store (idempotent; deletes nothing; VAR=dir to pick another)
	$(M) storage migrate_local $(if $(VAR),--var-dir $(VAR))

psql: ## A psql shell on the local database
	docker compose exec db psql -U humanitributary humanitributary

migrate: ## Apply migrations
	$(M) migrate

import-archive: ## Load the frozen legacy files (archive/site-data/) into an empty database (CI's corpus; ADR 0020)
	$(M) import_legacy --archive

publish: ## A release in the object store (gates first), latest -> it
	$(M) publish

release-pull: ## Mirror the latest release (or VERSION=…) from the store into var/releases/<version>/ (+ latest)
	$(M) storage pull-release $(VERSION)

build: build-release ## site/timeline.html from the latest release (the only way the page is built)

build-release: release-pull ## site/timeline.html from the latest release snapshot
	node site/build.mjs --from-json var/releases/latest/content.json

roundtrip: ## The release gates on your database's content, writing nothing: deterministic export, build --check and read-back, contested, change report
	$(M) publish --check

test: ## The Django test suite (needs `make db`)
	$(M) test

check: ## Django checks and missing migrations (the content is checked by the release gates: make roundtrip)
	$(M) check
	$(M) makemigrations --check --dry-run

check-adr: ## The ADRs agree: names, numbers, Status lines, amendments both ways, the index
	@python3 scripts/check_adr.py

adr-index: ## Rewrite docs/adr/README.md's index
	@python3 scripts/check_adr.py --write

check-guide: ## Every guide chapter reviewed against the code it covers (names what to read)
	@$(M) guide check

guide-stamp: ## After reviewing a chapter against the change: make guide-stamp CHAPTER=ingestion
	@test -n "$(CHAPTER)" || { echo "name it: make guide-stamp CHAPTER=<chapter> (make guide-status lists them)"; exit 2; }
	@$(M) guide stamp $(CHAPTER)

guide-status: ## Every guide chapter, when it was reviewed, fresh or not
	@$(M) guide status

guide-index: ## Rewrite docs/guide/README.md's chapter list
	@$(M) guide index

check-pr: ## The gate before a pull request (and CI): guide, ADRs, checks, tests, release gates; writes a receipt
	@$(PY) scripts/check_pr.py

serve: ## The admin (the owner's review screen) at http://localhost:8000/admin/ (runserver only)
	$(M) runserver 8000

up: db migrate ## Production's processes locally: web (gunicorn, 127.0.0.1:8000) and worker (run_jobs --loop), via honcho
	GUNICORN_CMD_ARGS="--bind 127.0.0.1:8000 --workers 2" uv run honcho -f Procfile start web worker

worker: ## Just the worker: run_jobs --loop in the foreground (Ctrl-C stops it after the job that is running)
	$(M) run_jobs --loop

jobs: ## Run whatever ingestion jobs are due, once (manage.py run_jobs)
	$(M) run_jobs

digest: ## The queue digest an agent session reads first
	$(M) digest

schedule-install: ## Install the launchd agent: run_jobs every 15 minutes (owner's decision)
	@ops/schedule.sh install

schedule-uninstall: ## Remove the launchd agent
	@ops/schedule.sh uninstall

schedule-status: ## Is the schedule installed, and the latest log lines
	@ops/schedule.sh status
