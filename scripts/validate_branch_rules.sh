#!/usr/bin/env bash
# Replays the branch rules on the state before two of the owner's restructurings (docs/branch-rules.md, "Validation"):
# the First Americans split (site/data/91-first-americans.js) and the ECSC/EEC/EU merge (site/data/90-restructure.js).
# Builds a legacy dump without those two files into var/history/, imports it into a scratch database
# (<your database>_history, created and dropped here; your own database is not touched), runs `branches review`,
# and compares the proposals with what the owner decided.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a
DB="${DATABASE_URL##*/}"; SCRATCH="${DB}_history"; URL="${DATABASE_URL%/*}/$SCRATCH"
TMP="var/history"; rm -rf "$TMP"; mkdir -p "$TMP/site/data"
cp site/build.mjs site/canonical.mjs site/restructure.mjs site/template.html site/outlines.js site/globe-assets.json "$TMP/site/"
ln -s "$PWD/site/images" "$TMP/site/images"
for f in site/data/*.js; do case "$(basename "$f")" in 90-*|91-*) ;; *) cp "$f" "$TMP/site/data/";; esac; done
node "$TMP/site/build.mjs" --dump-json "$TMP/presplit.json" | tail -1
docker compose exec -T db dropdb -U humanitributary --if-exists "$SCRATCH"
docker compose exec -T db createdb -U humanitributary "$SCRATCH"
trap 'docker compose exec -T db dropdb -U humanitributary --if-exists "$SCRATCH"' EXIT
DATABASE_URL="$URL" uv run python manage.py migrate -v0
DATABASE_URL="$URL" uv run python manage.py import_legacy "$TMP/presplit.json" | tail -1
DATABASE_URL="$URL" uv run python manage.py branches review | grep -v "THIN-v1"
DATABASE_URL="$URL" uv run python manage.py shell -c '
import re, collections
from governance.models import BranchProposal
src = open("site/data/91-first-americans.js").read()
actual = {i: m.group(2) for m in re.finditer(r"for \(const id of \[(.*?)\]\) TL\.move\(id, \"([\w-]+)\"\)", src, re.S) for i in re.findall(r"\"([\w-]+)\"", m.group(1))}
p = BranchProposal.objects.filter(rule_id="SPLIT-PLACE-v1", branch__slug="first-americans").first()
print("\nFirst Americans (data/91):", "proposed" if p else "NOT PROPOSED")
if p:
    prop = {o["event"]: o["branch"] for o in p.payload["operations"] if o["op"] == "move"}
    for (a, b), n in sorted(collections.Counter((prop.get(e, "(stays)"), actual.get(e, "(stays)")) for e in set(prop) | set(actual)).items(), key=lambda kv: -kv[1]):
        print(f"  {n:3}  proposed {a:42} owner {b}")
m = BranchProposal.objects.filter(rule_id="MERGE-OVERLAP-v1", branch__slug="eu").first()
owner = re.findall(r"TL\.merge\(\"([\w-]+)\", \"([\w-]+)\"\)", open("site/data/90-restructure.js").read())
mine = [(o["from"], o["into"]) for o in (m.payload["operations"] if m else []) if o["op"] == "merge"]
print("\nECSC/EEC/EU (data/90): proposed", mine, "| owner", owner, "| same:", sorted(mine) == sorted(owner))
'
