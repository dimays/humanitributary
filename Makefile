# Common commands. `make help` lists them.
PY := uv run python
M := $(PY) manage.py
TODAY := $(shell date +%F)

.PHONY: help env db db-stop psql migrate dump import publish build build-release roundtrip test check serve jobs digest schedule-install schedule-uninstall schedule-status

help: ## List the commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-14s %s\n", $$1, $$2}'

env: ## Write .env with a random local-only Postgres password (once)
	@$(PY) scripts/make_env.py

db: ## Start the local Postgres (Docker, host port 5433) and wait for it
	@docker info >/dev/null 2>&1 || { open -a Docker; until docker info >/dev/null 2>&1; do sleep 2; done; }
	docker compose up -d --wait db

db-stop: ## Stop the local Postgres (the data stays in the volume)
	docker compose stop db

psql: ## A psql shell on the local database
	docker compose exec db psql -U tributaries tributaries

migrate: ## Apply migrations
	$(M) migrate

dump: ## Static site's resolved content -> var/legacy.json
	@mkdir -p var
	node site/build.mjs --dump-json var/legacy.json

import: dump ## Dump, then upsert it into Postgres (idempotent; leaves Revisions)
	$(M) import_legacy var/legacy.json --retract-missing

publish: ## Published content -> var/releases/<version>/content.json (+ releases/latest)
	$(M) publish

build: ## site/timeline.html from data/*.js (the legacy path)
	node site/build.mjs

build-release: ## site/timeline.html from the latest release snapshot
	node site/build.mjs --from-json var/releases/latest/content.json

roundtrip: import publish ## Dump -> import -> publish, then diff the JSON and the two built pages
	$(M) compare_content var/legacy.json var/releases/latest/content.json
	node site/build.mjs --built $(TODAY) --out var/timeline-legacy.html
	node site/build.mjs --from-json var/releases/latest/content.json --built $(TODAY) --out var/timeline-release.html
	cmp var/timeline-legacy.html var/timeline-release.html && echo "timeline.html: byte-identical"

test: ## The Django test suite (needs `make db`)
	$(M) test

check: ## Django checks, missing migrations, and the site's data validation
	$(M) check
	$(M) makemigrations --check --dry-run
	node site/build.mjs --check | tail -1

serve: ## The admin (the owner's review screen) at http://localhost:8000/admin/
	$(M) runserver 8000

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
