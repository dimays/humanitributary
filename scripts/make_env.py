"""`make env`: write .env with random, local-only passwords; on an existing .env, add only the keys it lacks.

Never prints a value. Postgres (docker-compose `db`) and MinIO (`minio`, the local S3: ADR 0016) each get their own
random password; the S3_* variables are the same ones production sets for S3 or Cloudflare R2.
"""

import re
import secrets
from pathlib import Path

env = Path(__file__).resolve().parent.parent / ".env"


def storage_block(minio_user: str, minio_pw: str) -> dict[str, str]:
    return {
        "MINIO_ROOT_USER": minio_user,
        "MINIO_ROOT_PASSWORD": minio_pw,
        "S3_ENDPOINT_URL": "http://127.0.0.1:9000",
        "S3_ACCESS_KEY_ID": minio_user,
        "S3_SECRET_ACCESS_KEY": minio_pw,
        "S3_REGION": "us-east-1",
        "S3_BUCKET_RAW": "humanitributary-raw",
        "S3_BUCKET_RELEASES": "humanitributary-releases",
    }


if not env.exists():
    pw = secrets.token_urlsafe(24)
    lines = {"ENVIRONMENT": "dev", "POSTGRES_PASSWORD": pw,
             "DATABASE_URL": f"postgres://humanitributary:{pw}@localhost:5433/humanitributary"}
    lines |= storage_block("humanitributary", secrets.token_urlsafe(24))
    env.write_text("".join(f"{k}={v}\n" for k, v in lines.items()))
    env.chmod(0o600)
    print("wrote .env")
else:
    text = env.read_text()
    have = set(re.findall(r"^([A-Z_][A-Z0-9_]*)=", text, re.M))
    current = dict(re.findall(r"^([A-Z_][A-Z0-9_]*)=(.*)$", text, re.M))
    user = current.get("MINIO_ROOT_USER", "humanitributary")
    pw = current.get("MINIO_ROOT_PASSWORD") or secrets.token_urlsafe(24)
    missing = {k: v for k, v in storage_block(user, pw).items() if k not in have}
    if not missing:
        print(".env exists and has every key; leaving it")
    else:
        sep = "" if text.endswith("\n") or not text else "\n"
        env.write_text(text + sep + "# Object storage (MinIO locally; S3 or R2 in production: ADR 0016)\n" + "".join(f"{k}={v}\n" for k, v in missing.items()))
        print(f".env exists; added {', '.join(missing)}")
