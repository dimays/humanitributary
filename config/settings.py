"""Settings for the Humanitributary data platform.

Everything secret or environment-specific comes from the environment (`.env` locally, config vars on Heroku).
Postgres only: the data model leans on JSONB, GIN and trigram indexes, check constraints and the revision triggers
(docs/adr/0005), none of which SQLite has.
"""

import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# The product's name, in one place (with the README's title and the page template).
SITE_NAME = "Humanitributary"

# "dev" locally, "prod" on Heroku. Anything but "dev" gets production safety.
ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")
DEV = ENVIRONMENT == "dev"
DEBUG = DEV and os.getenv("DEBUG", "True") == "True"

SECRET_KEY = os.getenv("SECRET_KEY") or ("dev-only-not-secret" if DEV else None)
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY must be set outside local development.")

ALLOWED_HOSTS = [h for h in os.getenv("ALLOWED_HOSTS", "").split(",") if h] or (
    ["localhost", "127.0.0.1", ".localhost"] if DEV else []
)
CSRF_TRUSTED_ORIGINS = [f"https://{h.lstrip('.')}" for h in ALLOWED_HOSTS if h not in ("localhost", "127.0.0.1", ".localhost")]

INSTALLED_APPS = [
    # Ours, in dependency order (docs/adr/0002): content and its evidence, the audit log they write to,
    # what's collected, the agents' queue, branch governance, and the releases built from content.
    "revisions",
    "timeline",
    "evidence",
    "ingest",
    "governance",
    "work",
    "publish",
    "guide",  # the technical guide's tools (manage.py guide): no models
    # The platform around the content: object storage, health and alerts; the agents' HTTP door to the queue.
    "infra",
    "agentapi",
    # Staff's operations console at /ops/ and the OpsAction audit of its actions (docs/adr/0028-operations-console.md);
    # before the admin, so its admin/base_site.html (the header's link to it) wins.
    "opsconsole",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "infra.site.WwwRedirect",  # www.<host> → <host> (infra/site.py)
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set: copy .env.example to .env (or run `make env`), then `make db`.")
# Outside dev the connection must be encrypted (Heroku Postgres: docs/adr/0020-heroku-hosting.md).
DATABASES = {"default": dj_database_url.config(conn_max_age=600, conn_health_checks=True, ssl_require=not DEV)}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
# Where things live on disk. `var/` is gitignored: dumps, the local mirror of the latest release (for the site
# build), scheduled-run logs, and (with STORAGE_BACKEND=local) the stand-in for the object store.
SITE_DIR = BASE_DIR / "site"
VAR_DIR = Path(os.getenv("VAR_DIR", BASE_DIR / "var"))
LOG_DIR = VAR_DIR / "logs"
RELEASES_MIRROR_DIR = VAR_DIR / "releases"  # `manage.py storage pull-release` mirrors a release here

# Object storage (docs/adr/0016-object-storage.md). Every file that isn't a database row goes through one of
# two Django storages: "raw" (fetched documents by content hash, private) and "releases" (versioned snapshots, their
# change reports and built pages, and the `latest` pointer; the CDN's origin later). Locally that is MinIO in
# docker-compose.yml; in production S3 or Cloudflare R2, by the same variables. STORAGE_BACKEND=local keeps both in
# var/storage/<bucket>/ (no Docker needed); the test runner always uses temporary directories (tests/runner.py).
STORAGE_BACKEND = os.getenv("STORAGE_BACKEND") or ("s3" if os.getenv("S3_ENDPOINT_URL") or os.getenv("S3_BUCKET_RAW") else "local")
STORAGE_BUCKETS = {
    "raw": os.getenv("S3_BUCKET_RAW", "humanitributary-raw"),
    "releases": os.getenv("S3_BUCKET_RELEASES", "humanitributary-releases"),
}


def _storage(alias: str) -> dict:
    if STORAGE_BACKEND == "s3":
        return {"BACKEND": "storages.backends.s3.S3Storage", "OPTIONS": {
            "bucket_name": STORAGE_BUCKETS[alias],
            "endpoint_url": os.getenv("S3_ENDPOINT_URL") or None,  # empty for AWS; MinIO or R2's account endpoint otherwise
            "access_key": os.getenv("S3_ACCESS_KEY_ID", ""),
            "secret_key": os.getenv("S3_SECRET_ACCESS_KEY", ""),
            "region_name": os.getenv("S3_REGION", "us-east-1"),  # "auto" for R2
            "addressing_style": "path" if os.getenv("S3_ENDPOINT_URL") else None,
            "signature_version": "s3v4",
            "default_acl": None,
            "querystring_auth": True,
            "file_overwrite": True,  # immutability is the code's job (infra/storage.py), so the pointer can move
        }}
    if STORAGE_BACKEND != "local":
        raise RuntimeError(f"STORAGE_BACKEND must be s3 or local (got {STORAGE_BACKEND!r})")
    if not DEV and os.getenv("STORAGE_BACKEND") != "local":
        # A dyno's disk is thrown away on every restart: hosted, the local backend is only ever a stated choice.
        raise RuntimeError("Outside dev, set the S3_* variables (docs/adr/0016-object-storage.md), or STORAGE_BACKEND=local "
                           "to accept a disk that is thrown away on restart.")
    return {"BACKEND": "django.core.files.storage.FileSystemStorage",
            "OPTIONS": {"location": str(VAR_DIR / "storage" / STORAGE_BUCKETS[alias]), "allow_overwrite": True}}


STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    # Hashed, compressed files in production (after collectstatic); plain files locally and in tests.
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage" if DEV else "whitenoise.storage.CompressedManifestStaticFilesStorage"},
    "raw": _storage("raw"),
    "releases": _storage("releases"),
}

# How long an agent's claim on a task lasts before another agent may take it (work/queue.py).
TASK_LEASE_MINUTES = int(os.getenv("TASK_LEASE_MINUTES", "30"))
# At most this many new write_event tasks a day from the `process` job (highest priority first; the rest wait for a
# later day): a backfill or a busy news day can't flood the queue (docs/adr/0022-ingestion-tuning.md).
WRITE_EVENT_TASKS_PER_DAY = int(os.getenv("WRITE_EVENT_TASKS_PER_DAY", "20"))
# At most this many new fill_gap tasks a day from the `gap_waves` job (governance/waves.py, docs/adr/0026-content-waves.md),
# best first; the rest wait. The waves themselves (CONTENT_WAVES) and the gap thresholds (GAP_RULES) default in
# governance/waves.py; a deployment may set either here.
FILL_GAP_TASKS_PER_DAY = int(os.getenv("FILL_GAP_TASKS_PER_DAY", "40"))
# Overrides for governance/waves.py GAP_RULES. Two open fill_gap tasks per branch (was one): round 3 showed gap
# tasks are the highest-value work and ran out mid-round (docs/adr/0027-caps-after-round-3.md).
GAP_RULES = {"max_open_per_branch": int(os.getenv("FILL_GAP_MAX_OPEN_PER_BRANCH", "2"))}
# A story becomes a write_event task at this priority (ingest/process.py). 64 let through too many routine stories:
# about 45% of round 3's write_event tasks were rejected, so the owner raised it to 70 (docs/adr/0027-caps-after-round-3.md).
WRITE_EVENT_THRESHOLD = float(os.getenv("WRITE_EVENT_THRESHOLD", "70"))

# Ingestion (ingest/, docs/adr/0012-ingestion.md). The User-Agent names the bot and a generic contact, never a
# person: the project's repository by default (Wikimedia asks for a contact).
INGEST_CONTACT = os.getenv("INGEST_CONTACT", "https://github.com/dimays/humanitributary")
INGEST_USER_AGENT = os.getenv("INGEST_USER_AGENT", f"{SITE_NAME}Bot/0.1 (history timeline research; +{INGEST_CONTACT}) python-httpx")
# Evidence packs (ingest/prefetch.py, docs/adr/0036-evidence-packs.md): the clean text of a page the prefetch_sources
# job stored is deleted from the private store this many days after it was last fetched; a publisher whose license
# is open (CC0, CC BY, public domain, the Open Government Licence: Wikipedia, government sites) keeps it longer. News
# and everything else keeps the shorter one.
EVIDENCE_RETENTION_DAYS = int(os.getenv("EVIDENCE_RETENTION_DAYS", "180"))
EVIDENCE_RETENTION_DAYS_OPEN = int(os.getenv("EVIDENCE_RETENTION_DAYS_OPEN", "365"))
# Free keys for two lookup adapters (ingest/lookup.py); without them those adapters stay disabled.
SMITHSONIAN_API_KEY = os.getenv("SMITHSONIAN_API_KEY", "")  # api.data.gov
EUROPEANA_API_KEY = os.getenv("EUROPEANA_API_KEY", "")

# The worker (Procfile `worker`: `manage.py run_jobs --loop`) wakes this often to run whatever is due.
WORKER_TICK_SECONDS = int(os.getenv("WORKER_TICK_SECONDS", "60"))

# Alerts (infra/alerts.py): a job that fails this many runs in a row sends one email to ALERT_EMAILS (comma-
# separated) through Django's mail settings. Locally the console backend prints it instead of sending.
ALERT_AFTER_FAILURES = int(os.getenv("ALERT_AFTER_FAILURES", "3"))
ALERT_EMAILS = [a.strip() for a in os.getenv("ALERT_EMAILS", "").split(",") if a.strip()]
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND") or ("django.core.mail.backends.console.EmailBackend" if DEV else "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", f"{SITE_NAME} alerts <alerts@localhost>")
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# The agent API (agentapi/, docs/adr/0017-agent-api.md): requests per token per minute.
AGENT_API_RATE_PER_MINUTE = int(os.getenv("AGENT_API_RATE_PER_MINUTE", "120"))
# The agent API's heavy operations (ADR 0035), per token: edit files checked and applied per hour, release checks per
# hour, releases published per day.
AGENT_API_EDITS_CHECKS_PER_HOUR = int(os.getenv("AGENT_API_EDITS_CHECKS_PER_HOUR", "20"))
AGENT_API_EDITS_APPLIES_PER_HOUR = int(os.getenv("AGENT_API_EDITS_APPLIES_PER_HOUR", "6"))
AGENT_API_RELEASE_CHECKS_PER_HOUR = int(os.getenv("AGENT_API_RELEASE_CHECKS_PER_HOUR", "10"))
AGENT_API_PUBLISHES_PER_DAY = int(os.getenv("AGENT_API_PUBLISHES_PER_DAY", "4"))

# The daily agent round (work/rounds.py, ADR 0035). The routine itself is a Claude Code cloud routine the owner makes,
# with its own cron; ROUND_SCHEDULE repeats that cron (UTC) so the console can show it in words and say when the next
# round is due. ROUND_ROUTINE names where it runs.
ROUND_SCHEDULE = os.getenv("ROUND_SCHEDULE", "0 6 * * *")
ROUND_ROUTINE = os.getenv("ROUND_ROUTINE", "cloud routine")
# The ceilings on the round size an operator may set (ADR 0038). A cloud session runs at most 20 subagents at once
# (Claude Code's default), and the round's lead starts the role agents together, so the agents in all stay under it.
ROUND_MAX_AGENTS_PER_ROLE = int(os.getenv("ROUND_MAX_AGENTS_PER_ROLE", "8"))
ROUND_MAX_AGENTS = int(os.getenv("ROUND_MAX_AGENTS", "16"))
ROUND_MAX_TASKS_PER_AGENT = int(os.getenv("ROUND_MAX_TASKS_PER_AGENT", "20"))

# The operations console (/ops/, opsconsole/): when set, only these hosts serve it and every other host answers 404, so
# the public page's domain has no /ops/ (comma-separated, e.g. data.humanitributary.com). Empty: any allowed host.
OPS_HOSTS = [h.strip() for h in os.getenv("OPS_HOSTS", "").split(",") if h.strip()]
# The public page, for the console's links to an entry on it (`<PUBLIC_SITE_URL>/#<slug>`; the New events page).
PUBLIC_SITE_URL = os.getenv("PUBLIC_SITE_URL", f"https://{SITE_NAME.lower()}.com").rstrip("/")

# Tests never touch the object store or the network: the runner swaps both storages for temporary directories.
TEST_RUNNER = "tests.runner.Runner"

if not DEV:
    # Hosted (Heroku: docs/adr/0020-heroku-hosting.md). The router ends TLS and says so in X-Forwarded-Proto.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # An hour until the custom domain has proved itself over HTTPS; raise it (a year) at launch. No subdomains or
    # preload: those are hard to undo. (*.herokuapp.com is preloaded by Heroku already.)
    SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "3600"))
    # Logs are the process's stdout (heroku logs). Django's defaults print nothing with DEBUG off, so a 500's
    # traceback would vanish: everything at LOG_LEVEL and above goes to the console.
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "handlers": {"console": {"class": "logging.StreamHandler"}},
        "root": {"handlers": ["console"], "level": os.getenv("LOG_LEVEL", "INFO")},
        # httpx logs every request's full URL at INFO: noise at best, and a key in a query string at worst. The
        # fetcher records what matters (FetchRun, with keys masked).
        "loggers": {name: {"level": "WARNING"} for name in ("httpx", "httpcore")},
    }
