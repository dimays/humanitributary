"""`make env`: write .env with a random, local-only Postgres password, unless .env already exists."""

import secrets
from pathlib import Path

env = Path(__file__).resolve().parent.parent / ".env"
if env.exists():
    print(".env exists; leaving it")
else:
    pw = secrets.token_urlsafe(24)
    env.write_text(f"ENVIRONMENT=dev\nPOSTGRES_PASSWORD={pw}\nDATABASE_URL=postgres://humanitributary:{pw}@localhost:5433/humanitributary\n")
    print("wrote .env")
