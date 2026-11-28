"""The loader: content in the snapshot shape → Postgres. Since the cutover (ADR 0021) it runs only when asked:
`import_legacy --archive` (the frozen legacy files in archive/site-data/, read by `node site/build.mjs --archive
--dump-json`) or `import_legacy <content.json>` (a release snapshot, e.g. to fill a fresh database). Loading a
snapshot that this database exported writes nothing: export and load are exact inverses (tests/
test_import_and_roundtrip.py). Keys the export derives (publish/content.py ADDITIVE) are ignored.

Idempotent upsert by slug: every row is compared with what's there and written only if it differs, so re-running on
unchanged input writes nothing and leaves no Revision. For each entry in the dump its owned rows (links, citations,
location, images, connections, legacy claims and their evidence) are made to match the dump exactly; entries that
are in Postgres but not in the dump are left alone and counted (`--retract-missing` retracts them).

Things the import never overwrites on an existing row, because they belong to review, not to the legacy source:
an entry's status, a publisher's rating and notes, a citation's check results, and evidence stance / excerpt /
check fields. Claim status and confidence are recomputed from the evidence (evidence/confidence.py).
"""

import hashlib
from collections import Counter
from pathlib import Path

from django.conf import settings

from evidence.sweep import reassess
from evidence.models import Citation, Claim, Evidence, Publisher
from evidence.publishers import defaults_for, domain_of
from revisions import revising
from timeline.models import Branch, BranchLink, Connection, Entry, Event, EventLink, Image, Location, PaleoPin, Region, Status
from timeline.ordering import reconcile
from timeline.services import apply_changes, branch_date_fields, event_date_fields

ACTOR = "job:import_legacy"

# The legacy content, frozen at the cutover (ADR 0021). ARCHIVE_SHA256 is archive_hash() of it then; a test fails if
# a file there changes, is added or removed: content changes go into Postgres now.
ARCHIVE_DIR = Path(settings.BASE_DIR) / "archive" / "site-data"
ARCHIVE_SHA256 = "c7c9a06554112c6bef626642ec4d17f1237b5577406218f6f9509e0b893a706e"


def archive_hash(directory: Path = ARCHIVE_DIR) -> str:
    """sha256 over the archive's file names and bytes, in name order."""
    h = hashlib.sha256()
    for f in sorted(directory.iterdir()):
        if f.is_file():
            h.update(f.name.encode() + b"\0" + hashlib.sha256(f.read_bytes()).hexdigest().encode() + b"\n")
    return h.hexdigest()

# The page's lanes, in its order (site/template.html REGIONS).
REGIONS = [
    ("cosmos", "Cosmos & Earth"), ("life", "Life"), ("humans", "Human origins"),
    ("global", "Ideas, technology & global institutions"), ("faiths", "Religions & philosophies"),
    ("culture", "Arts, culture & sport"), ("mideast", "Middle East, North Africa & Iran"), ("europe", "Europe"),
    ("africa", "Sub-Saharan Africa"), ("southasia", "South Asia"), ("eastasia", "East, Central & Southeast Asia"),
    ("americas", "The Americas"), ("oceania", "Oceania"),
]


class LegacyImportError(Exception):
    pass


def _sync(model, existing: dict, desired: dict, make, stats: Counter, label: str, delete_extra=True):
    """Make `existing` (key → row) match `desired` (key → field values): update in place, create, delete extras."""
    new = []
    for key, values in desired.items():
        row = existing.get(key)
        if row is None:
            new.append(make(key, values))
        else:
            stats[f"{label}.{apply_changes(row, values)}"] += 1
    if new:
        model.objects.bulk_create(new, batch_size=1000)
        stats[f"{label}.created"] += len(new)
    if delete_extra:
        extra = [row.pk for key, row in existing.items() if key not in desired]
        if extra:
            model.objects.filter(pk__in=extra).delete()
            stats[f"{label}.deleted"] += len(extra)


def _sort_keys(kind: str, order: list[str]) -> dict[str, str]:
    """Sort keys that put `order` (the dump's ids) in the dump's order, changing as few existing keys as possible:
    removing or inserting an entry moves nothing else (timeline/ordering.py)."""
    current = dict(Entry.objects.filter(kind=kind).values_list("slug", "sort_key"))
    wanted = set(order)
    others = [k for s, k in current.items() if s not in wanted and k]
    new = reconcile(order, current, others)
    return {s: new.get(s) or current[s] for s in order}


def _all_cites(x):
    yield from x.get("cites", [])
    yield from x.get("whyCites", [])
    yield from (x.get("origin") or {}).get("cites", [])


def import_content(data: dict, *, actor: str = ACTOR, reason: str = "", globe: dict | None = None, retract_missing: bool = False) -> Counter:
    stats = Counter()
    branches, events = data["branches"], data["events"]
    with revising(actor, reason or "legacy import"):
        # Regions: create any missing (names are the page's; edits in the admin stay).
        have = set(Region.objects.values_list("slug", flat=True))
        order = {s: i for i, (s, _) in enumerate(REGIONS)}
        names = dict(REGIONS)
        used = sorted({b["region"] for b in branches} - have, key=lambda s: order.get(s, 99))
        Region.objects.bulk_create([Region(slug=s, name=names.get(s, s), position=order.get(s, 99)) for s in used])
        stats["region.created"] += len(used)
        region_id = dict(Region.objects.values_list("slug", "id"))

        # Publishers and citations: create what's missing; never overwrite a rating or a check.
        first = {}
        for x in branches + events:
            for c in _all_cites(x):
                first.setdefault(c["u"], c)
        domains = {domain_of(u) for u in first}
        have = set(Publisher.objects.values_list("domain", flat=True))
        Publisher.objects.bulk_create([Publisher(domain=d, **defaults_for(d)) for d in sorted(domains - have)])
        stats["publisher.created"] += len(domains - have)
        publisher_id = dict(Publisher.objects.values_list("domain", "id"))
        have = set(Citation.objects.filter(url__in=list(first)).values_list("url", flat=True))
        Citation.objects.bulk_create(
            [Citation(url=u, title=c["t"][:500], kind=c.get("k") or "", publisher_id=publisher_id[domain_of(u)]) for u, c in first.items() if u not in have],
            batch_size=1000,
        )
        stats["citation.created"] += len(set(first) - have)
        citation_id = dict(Citation.objects.filter(url__in=list(first)).values_list("url", "id"))

        # Entries. A slug may not change kind.
        kinds = dict(Entry.objects.filter(slug__in=[x["id"] for x in branches + events]).values_list("slug", "kind"))
        clash = [b["id"] for b in branches if kinds.get(b["id"], "branch") != "branch"] + [e["id"] for e in events if kinds.get(e["id"], "event") != "event"]
        if clash:
            raise LegacyImportError(f"ids that changed kind (branch ↔ event): {clash[:10]}")

        existing = {b.slug: b for b in Branch.objects.filter(slug__in=[b["id"] for b in branches])}
        sort_key = _sort_keys("branch", [b["id"] for b in branches])
        for b in branches:
            values = {
                "name": b["name"], "region_id": region_id[b["region"]], "start": b["start"], "end": b["end"],
                "start_when": b["startWhen"], "end_when": b.get("endWhen"), "text": b["text"], "why": b.get("why") or "",
                "origin_note": b["origin"]["note"] if "origin" in b else None, "sort_key": sort_key[b["id"]],
                **branch_date_fields(b["startWhen"], b.get("endWhen")),
            }
            row = existing.get(b["id"])
            if row is None:
                existing[b["id"]] = row = Branch(slug=b["id"], status=Status.PUBLISHED)
            stats[f"branch.{apply_changes(row, values)}"] += 1
        branch_pk = {s: r.pk for s, r in existing.items()}
        missing_parent = {e["branch"] for e in events} - set(branch_pk)
        branch_pk |= dict(Branch.objects.filter(slug__in=missing_parent).values_list("slug", "pk"))

        existing_e = {e.slug: e for e in Event.objects.filter(slug__in=[e["id"] for e in events])}
        sort_key = _sort_keys("event", [e["id"] for e in events])
        for e in events:
            values = {
                "branch_id": branch_pk[e["branch"]], "y": e["y"], "end": e.get("end"), "when": e["when"], "title": e["title"],
                "text": e["text"], "imp": e["imp"], "why": e.get("why") or "", "sort_key": sort_key[e["id"]], **event_date_fields(e["when"]),
            }
            row = existing_e.get(e["id"])
            if row is None:
                existing_e[e["id"]] = row = Event(slug=e["id"], status=Status.PUBLISHED)
            stats[f"event.{apply_changes(row, values)}"] += 1

        pk = branch_pk | {s: r.pk for s, r in existing_e.items()}
        refs = {c["id"] for x in branches + events for c in x.get("connections", [])} - set(pk)
        pk |= dict(Entry.objects.filter(slug__in=refs).values_list("slug", "pk"))
        b_pks = [branch_pk[b["id"]] for b in branches]
        e_pks = [pk[e["id"]] for e in events]
        all_pks = b_pks + e_pks

        # Branch links: parents and into in order; origin links mark their parent link with how/note.
        desired = {}
        for b in branches:
            me = pk[b["id"]]
            for i, p in enumerate(b["parents"]):
                desired[(me, pk[p], "parent")] = {"position": i, "origin_position": None, "how": "", "note": ""}
            for i, t in enumerate(b["into"]):
                desired[(me, pk[t], "into")] = {"position": i, "origin_position": None, "how": "", "note": ""}
            for j, link in enumerate((b.get("origin") or {}).get("links", [])):
                d = desired.setdefault((me, pk[link["id"]], "parent"), {"position": len(b["parents"]) + j, "origin_position": None, "how": "", "note": ""})
                d.update(origin_position=j, how=link["how"], note=link["note"])
        existing = {(r.branch_id, r.target_id, r.relation): r for r in BranchLink.objects.filter(branch_id__in=b_pks)}
        _sync(BranchLink, existing, desired, lambda k, v: BranchLink(branch_id=k[0], target_id=k[1], relation=k[2], **v), stats, "branchlink")

        # Event links (the page draws one; the model allows several).
        desired = {(pk[e["id"]], pk[e["link"]]): {"position": 0} for e in events if e.get("link")}
        existing = {(r.event_id, r.branch_id): r for r in EventLink.objects.filter(event_id__in=e_pks)}
        _sync(EventLink, existing, desired, lambda k, v: EventLink(event_id=k[0], branch_id=k[1], **v), stats, "eventlink")

        # Connections (TL.enrich).
        desired = {(pk[x["id"]], i): {"target_id": pk[c["id"]], "note": c["note"]} for x in branches + events for i, c in enumerate(x.get("connections", []))}
        existing = {(r.source_id, r.position): r for r in Connection.objects.filter(source_id__in=all_pks)}
        _sync(Connection, existing, desired, lambda k, v: Connection(source_id=k[0], position=k[1], **v), stats, "connection")

        # Locations (TL.geo).
        desired = {}
        for x in branches + events:
            if g := x.get("geo"):
                desired[pk[x["id"]]] = {"scope": g["scope"], "lat": g.get("lat"), "lon": g.get("lon"), "radius_km": g.get("r"), "label": g.get("label"), "src": g.get("src"), "scale": g.get("scale")}
        existing = {r.entry_id: r for r in Location.objects.filter(entry_id__in=all_pks)}
        _sync(Location, existing, desired, lambda k, v: Location(entry_id=k, **v), stats, "location")

        # Images (TL.image).
        desired = {
            (pk[x["id"]], i): {"src": im["src"], "width": im.get("w"), "height": im.get("h"), "title": im["title"], "alt": im.get("alt", ""), "credit": im["credit"],
                               "license": im["license"], "license_url": im.get("licenseUrl", ""), "page": im["page"], "sensitive": bool(im.get("sensitive"))}
            for x in branches + events for i, im in enumerate(x.get("images", []))
        }
        existing = {(r.entry_id, r.position): r for r in Image.objects.filter(entry_id__in=all_pks)}
        _sync(Image, existing, desired, lambda k, v: Image(entry_id=k[0], position=k[1], **v), stats, "image")

        # Claims: one "as written" claim per entry, plus "why" and "origin" where the dump has them.
        claim_values, claim_cites = {}, {}
        for b in branches:
            me = pk[b["id"]]
            claim_values[(me, "as_written")] = {"name": b["name"], "startWhen": b["startWhen"], "endWhen": b.get("endWhen"), "text": b["text"], "parents": b["parents"], "into": b["into"]}
            claim_cites[(me, "as_written")] = b["cites"]
            if "origin" in b:
                claim_values[(me, "origin")] = {"note": b["origin"]["note"], "links": [link["id"] for link in b["origin"]["links"]]}
                claim_cites[(me, "origin")] = b["origin"]["cites"]
        for e in events:
            me = pk[e["id"]]
            claim_values[(me, "as_written")] = {"when": e["when"], "title": e["title"], "text": e["text"]}
            claim_cites[(me, "as_written")] = e["cites"]
        for x in branches + events:
            if x.get("why"):
                me = pk[x["id"]]
                claim_values[(me, "why")] = {"why": x["why"], "connections": [c["id"] for c in x.get("connections", [])]}
                claim_cites[(me, "why")] = x.get("whyCites", [])
        existing = {(r.entry_id, r.field): r for r in Claim.objects.filter(entry_id__in=all_pks, key="", field__in=["as_written", "why", "origin"])}
        desired = {k: {"value": v} for k, v in claim_values.items()}
        _sync(Claim, existing, desired, lambda k, v: Claim(entry_id=k[0], field=k[1], key="", **v), stats, "claim")
        claim_id = {(r.entry_id, r.field): r.pk for r in Claim.objects.filter(entry_id__in=all_pks, key="", field__in=["as_written", "why", "origin"])}

        desired = {
            (claim_id[k], i): {"citation_id": citation_id[c["u"]], "cited_title": c["t"], "cited_kind": c.get("k") or ""}
            for k, cs in claim_cites.items() for i, c in enumerate(cs)
        }
        existing = {(r.claim_id, r.position): r for r in Evidence.objects.filter(claim_id__in=claim_id.values())}
        _sync(Evidence, existing, desired, lambda k, v: Evidence(claim_id=k[0], position=k[1], stance="supports", method="legacy", checked_by=ACTOR, **v), stats, "evidence")

        # Status and confidence, from the evidence as it now stands (the same computation as `facts sweep`).
        stats["claim.assessed"] += reassess(claim_id.values()).get("updated", 0)

        # Paleo pins (globe-assets.json `pts`: slice → "lat,lon" → [lat, lon]).
        if globe and globe.get("pts"):
            desired = {}
            for slice_ma, points in globe["pts"].items():
                for key, (plat, plon) in points.items():
                    lat, lon = (float(v) for v in key.split(","))
                    desired[("PALEOMAP", int(slice_ma), lat, lon)] = {"lat": plat, "lon": plon}
            existing = {(r.model, r.slice_ma, r.present_lat, r.present_lon): r for r in PaleoPin.objects.all()}
            _sync(PaleoPin, existing, desired, lambda k, v: PaleoPin(model=k[0], slice_ma=k[1], present_lat=k[2], present_lon=k[3], **v), stats, "paleopin")

        # Entries Postgres has that the dump doesn't (removed or merged away in the legacy data, or written here).
        missing = Entry.objects.filter(status=Status.PUBLISHED).exclude(pk__in=all_pks)
        stats["entry.not_in_dump"] = missing.count()
        if retract_missing:
            for row in missing:
                apply_changes(row.concrete, {"status": Status.RETRACTED})
                stats["entry.retracted"] += 1
    return stats


def changes(stats: Counter) -> int:
    """How many rows the import wrote (zero on a re-run of unchanged input)."""
    return sum(n for k, n in stats.items() if k.rsplit(".", 1)[-1] in ("created", "updated", "deleted", "assessed", "retracted"))
