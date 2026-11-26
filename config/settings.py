"""Settings for the Tributaries data platform.

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

# The product's name, in one place (with the README's title). A rename is coming: change it here.
SITE_NAME = "Tributaries"

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
DATABASES = {"default": dj_database_url.config(conn_max_age=600, conn_health_checks=True)}

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
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    # Hashed, compressed files in production (after collectstatic); plain files locally and in tests.
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage" if DEV else "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# Where things live on disk. `var/` is gitignored: raw fetched documents (by content hash) and release snapshots.
SITE_DIR = BASE_DIR / "site"
VAR_DIR = Path(os.getenv("VAR_DIR", BASE_DIR / "var"))
RAW_DIR = VAR_DIR / "raw"
RELEASES_DIR = VAR_DIR / "releases"

# How long an agent's claim on a task lasts before another agent may take it (work/queue.py).
TASK_LEASE_MINUTES = int(os.getenv("TASK_LEASE_MINUTES", "30"))

# Ingestion (ingest/, docs/adr/0008-ingest-design.md). The User-Agent names the bot and a generic contact, never a
# person: set INGEST_CONTACT to a project address or URL before running hosted (Wikimedia asks for one).
INGEST_CONTACT = os.getenv("INGEST_CONTACT", "operator contact via the project repository")
INGEST_USER_AGENT = os.getenv("INGEST_USER_AGENT", f"{SITE_NAME}Bot/0.1 (history timeline research; +{INGEST_CONTACT}) python-httpx")
# Free keys for two lookup adapters (ingest/lookup.py); without them those adapters stay disabled.
SMITHSONIAN_API_KEY = os.getenv("SMITHSONIAN_API_KEY", "")  # api.data.gov
EUROPEANA_API_KEY = os.getenv("EUROPEANA_API_KEY", "")
LOG_DIR = VAR_DIR / "logs"

if not DEV:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
