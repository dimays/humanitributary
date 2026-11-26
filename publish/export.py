"""Postgres → snapshot: the published content in the site's canonical shape (docs/adr/0001).

Only `published` entries go out; links to anything unpublished are left out. A claim's citations go out in their
order, except evidence an agent has found to conflict with the claim or be unrelated to it: the page lists a source
only where it supports (or partly supports) what the entry says.

An event whose facts rest on one independent publisher carries `"singleSource": true` (docs/adr/0018-single-
source-marker.md): every supporting piece of evidence on its record claim and that claim's atomic parts (date, place,
numbers, actors) comes from one witness (evidence/independence.py; all of Wikipedia is one). It is derived from the
evidence rows alone, never from the date or a stored status, so the same database always gives the same snapshot.
"""

from collections import defaultdict

from evidence.independence import witness
from evidence.models import Claim, Evidence
from timeline.models import Branch, BranchLink, Connection, Event, EventLink, Image, Location, Status

from .content import KEYS, num

SHOWN_STANCES = ("supports", "partial")


def _ordered(d: dict, kind: str) -> dict:
    return {k: d[k] for k in KEYS[kind] if k in d}


def build_content() -> dict:
    branches = list(Branch.objects.filter(status=Status.PUBLISHED).select_related("region").order_by("sort_key", "slug"))
    events = list(
        Event.objects.filter(status=Status.PUBLISHED, branch__status=Status.PUBLISHED)
        .select_related("branch")
        .order_by("sort_key", "slug")
    )
    slug = {b.pk: b.slug for b in branches} | {e.pk: e.slug for e in events}
    branch_ids = {b.pk for b in branches}

    parents, into, origin_links = defaultdict(list), defaultdict(list), defaultdict(list)
    for link in BranchLink.objects.filter(branch_id__in=branch_ids, target_id__in=branch_ids).order_by("position", "id"):
        (parents if link.relation == "parent" else into)[link.branch_id].append(link)
        if link.origin_position is not None:
            origin_links[link.branch_id].append(link)
    for v in origin_links.values():
        v.sort(key=lambda link: link.origin_position)

    first_link = {}
    for el in EventLink.objects.filter(branch_id__in=branch_ids).order_by("event_id", "position", "id"):
        first_link.setdefault(el.event_id, el.branch_id)

    connections = defaultdict(list)
    for c in Connection.objects.filter(source_id__in=slug, target_id__in=slug).order_by("source_id", "position"):
        connections[c.source_id].append(_ordered({"id": slug[c.target_id], "note": c.note}, "connection"))

    geo = {}
    for loc in Location.objects.filter(entry_id__in=slug):
        g = {"scope": loc.scope, "lat": num(loc.lat), "lon": num(loc.lon), "r": num(loc.radius_km), "label": loc.label, "src": loc.src, "scale": loc.scale}
        geo[loc.entry_id] = _ordered({k: v for k, v in g.items() if v is not None}, "geo")

    images = defaultdict(list)
    for im in Image.objects.filter(entry_id__in=slug).order_by("entry_id", "position"):
        d = {"src": im.src, "w": im.width, "h": im.height, "title": im.title, "credit": im.credit, "license": im.license, "page": im.page}
        images[im.entry_id].append(_ordered({k: v for k, v in d.items() if v is not None}, "image"))

    claim_of = {}
    for cid, entry_id, field in Claim.objects.filter(entry_id__in=slug, key="", field__in=["as_written", "why", "origin"]).values_list("id", "entry_id", "field"):
        claim_of[cid] = (entry_id, field)
    cites = defaultdict(list)
    rows = (
        Evidence.objects.filter(claim_id__in=claim_of, stance__in=SHOWN_STANCES)
        .order_by("claim_id", "position")
        .values_list("claim_id", "cited_title", "citation__url", "cited_kind")
    )
    for cid, t, u, k in rows:
        c = {"t": t, "u": u}
        if k:
            c["k"] = k
        cites[claim_of[cid]].append(c)

    single = single_source_events([e.pk for e in events])

    def common(o, x):
        if x.pk in geo:
            o["geo"] = geo[x.pk]
        if images[x.pk]:
            o["images"] = images[x.pk]
        if x.why:
            o["why"] = x.why
            o["connections"] = connections[x.pk]
            o["whyCites"] = cites[(x.pk, "why")]

    out_b = []
    for b in branches:
        o = {
            "id": b.slug, "name": b.name, "region": b.region.slug, "start": num(b.start), "end": num(b.end), "startWhen": b.start_when,
            "parents": [slug[link.target_id] for link in parents[b.pk]],
            "into": [slug[link.target_id] for link in into[b.pk]],
            "text": b.text, "cites": cites[(b.pk, "as_written")],
        }
        if b.end_when is not None:
            o["endWhen"] = b.end_when
        if b.origin_note is not None:
            o["origin"] = {
                "note": b.origin_note,
                "links": [_ordered({"id": slug[link.target_id], "how": link.how, "note": link.note}, "originLink") for link in origin_links[b.pk]],
                "cites": cites[(b.pk, "origin")],
            }
        common(o, b)
        out_b.append(_ordered(o, "branch"))

    out_e = []
    for e in events:
        o = {"id": e.slug, "branch": e.branch.slug, "y": num(e.y), "when": e.when, "title": e.title, "text": e.text, "imp": e.imp, "cites": cites[(e.pk, "as_written")]}
        if e.end is not None:
            o["end"] = num(e.end)
        if e.pk in first_link:
            o["link"] = slug[first_link[e.pk]]
        common(o, e)
        if e.pk in single:
            o["singleSource"] = True
        out_e.append(_ordered(o, "event"))
    return {"branches": out_b, "events": out_e}


def single_source_events(event_ids: list[int]) -> set[int]:
    """The events among `event_ids` whose supporting evidence (record claim and its atomic parts) has one witness."""
    record = dict(Claim.objects.filter(entry_id__in=event_ids, field="as_written", key="", parent__isnull=True).values_list("id", "entry_id"))
    of_claim = dict(record)
    of_claim |= dict(Claim.objects.filter(parent_id__in=record).values_list("id", "entry_id"))
    witnesses = defaultdict(set)
    rows = Evidence.objects.filter(claim_id__in=of_claim, stance__in=SHOWN_STANCES).values_list("claim_id", "citation__publisher__domain")
    for cid, domain in rows:
        witnesses[of_claim[cid]].add(witness(domain))
    return {e for e, w in witnesses.items() if len(w) == 1}
