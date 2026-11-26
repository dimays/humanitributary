"""Record the first real ingestion run's routing inputs as a test fixture (tests/fixtures/ingest/first_run.json), from a
database that holds that run (read only). Not part of the test suite:

    uv run python tests/record_first_run.py            # the database in .env
    DATABASE_URL=… uv run python tests/record_first_run.py

What it keeps, for tests/test_ingest.py FirstRunTests: the candidates of three stories the first run misrouted
("Ukrainian attacks on the Russian shadow fleet", "2026 United States elections", "Gaza war"), every Wikidata entity
they name, the BranchEntity rows of the first run that those entities (and their countries) reach, with the
branches; and the entities behind the run's new-branch signals with their Wikidata relations and the chain of items
those relations name (ingest/branchable.py). BranchEntity rows added later by routing.CORRECTIONS are left out: the
tests apply CORRECTIONS themselves.
"""

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django  # noqa: E402

django.setup()

from ingest import branchable  # noqa: E402
from ingest.models import BranchEntity, Candidate, Entity  # noqa: E402
from ingest.routing import CORRECTIONS  # noqa: E402

OUT = Path(__file__).parent / "fixtures" / "ingest" / "first_run.json"
STORIES = {"shadow_fleet": "Q137703814", "us_elections": "Q115857612", "gaza_war": "Q122962941"}
KEEP = ("date", "source", "topic", "topic_qid", "topics", "links", "roles", "category", "external")


def main():
    stories, qids = {}, set()
    for name, topic in STORIES.items():
        rows = []
        for c in Candidate.objects.filter(kind="new_event", details__topic_qid=topic).prefetch_related("entities").order_by("pk"):
            rows.append({"source_key": c.source_key, "title": c.title, "summary": c.summary, "when_text": c.when_text, "y_guess": c.y_guess,
                         "precision": c.precision, "details": {k: c.details[k] for k in KEEP if k in c.details},
                         "entities": sorted(e.qid for e in c.entities.all())})
            qids |= set(rows[-1]["entities"])
        stories[name] = rows
    signals = sorted({c.details["qid"] for c in Candidate.objects.filter(kind="new_branch_signal")})
    chain, todo = set(signals), set(signals)
    for _ in range(branchable.MAX_HOPS):
        todo = branchable.relation_targets(Entity.objects.filter(qid__in=todo)) - chain
        chain |= todo
    fixes = {q for fix in CORRECTIONS.values() for q, *_ in fix.get("use", [])}
    ents = Entity.objects.filter(qid__in=qids | chain | fixes)
    reach = {e.qid for e in ents} | {c for e in ents for p in ("P17", "P131", "P27") for c in (e.facts or {}).get(p, [])}
    reach |= {c for e in Entity.objects.filter(qid__in=signals) for c in (e.facts or {}).get("P31", [])}
    be = (BranchEntity.objects.filter(entity__qid__in=reach).exclude(note="routing.CORRECTIONS")
          .select_related("branch", "branch__region", "entity").order_by("branch__slug", "entity__qid"))
    be_ents = Entity.objects.filter(qid__in={b.entity.qid for b in be})
    data = {
        "recorded": "the first ingestion run (November 26, 2026): 844 candidates, 682 clusters",
        "branches": sorted({(b.branch.slug, b.branch.name, b.branch.region.slug, b.branch.start, b.branch.end) for b in be}),
        "branch_entities": [[b.branch.slug, b.entity.qid, b.role, b.weight] for b in be],
        "entities": [{"qid": e.qid, "label": e.label, "kind": e.kind, "description": e.description, "facts": e.facts, "relations": e.relations,
                      "relations_read": e.relations_at is not None}
                     for e in sorted({*ents, *be_ents}, key=lambda e: int(e.qid[1:]))],
        "stories": stories,
        "signals": signals,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + "\n")
    print(f"wrote {OUT} ({len(data['entities'])} entities, {sum(len(v) for v in stories.values())} candidates, {len(signals)} signals)")


if __name__ == "__main__":
    main()
