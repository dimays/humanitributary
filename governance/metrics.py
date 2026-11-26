"""Branch metrics: `manage.py branches metrics` (docs/branch-rules.md, "Metrics").

A deterministic snapshot of every published branch's shape, from its published events, as of a date. "Relative to
era" means on the page's own time scale, s = −log10(years before now + 40) (site/template.html `sOf`): deep time is
compressed and recent centuries get the room, so a gap of 0.2 in s is as wide on screen in 500 BCE as in 1950, and
that is what the rules compare. One s-unit is a factor of ten in "years before now".

Per branch:

- `events`, `span` (years and s), `windows` (event counts per calendar-friendly window), `density` (events per
  s-unit) and `relative_density` (against the median of branches in the same region and era: "peers");
- `gaps`: the empty stretch before the first event, the longest inside, and the one after the last event to the
  branch's end (or now), in years and s (an event with an end covers its whole span);
- `phases`: runs of events separated by gaps of at least `phase_gap_s`;
- `links`: the share of its events linked to each other branch (EventLink), and incoming links;
- `geo`: centroid, mean distance from it (km), and clusters (average-linkage, joining while clusters are within
  `cluster_km` on average), each with a suggested macro-region name;
- `structure`: parents, into, children.

`countries` (distinct countries of the events' places via Wikidata P17) is null until ingestion's Entity rows carry
countries; the rules do not depend on it.
"""

import math
from collections import Counter, defaultdict
from datetime import date
from statistics import median

from timeline.models import Branch, BranchLink, Event, EventLink, Location, Status

from .thresholds import METRICS_VERSION, get

C_YEARS = 40  # the page's constant (template.html)

# Named boxes for suggested names: (name, lat_min, lat_max, lon_min, lon_max). First match wins, so the specific
# come before the broad. Only a label for a human to improve; no rule depends on it.
MACRO_REGIONS = [
    ("the Caribbean", 10, 27, -86, -59), ("Mesoamerica", 7, 26, -118, -86), ("the Arctic", 60, 90, -180, 180),
    ("the Andes and Pacific coast", -56, 12, -82, -66), ("Amazonia", -20, 6, -66, -44), ("eastern South America", -56, 6, -66, -30),
    ("North America", 24, 72, -170, -50), ("the British Isles", 49, 61, -11, 2), ("Iberia", 35, 44, -10, 4),
    ("western Europe", 42, 56, -5, 16), ("Italy", 36, 47.5, 6, 19), ("the Balkans and Greece", 34, 47, 13, 30),
    ("Scandinavia", 54, 72, 4, 32), ("eastern Europe", 44, 60, 14, 45), ("Anatolia", 35, 42.5, 25, 45),
    ("the Levant", 29, 37.5, 33, 39), ("Mesopotamia and Iran", 25, 40, 39, 63), ("Egypt and North Africa", 18, 37.5, -17, 36),
    ("Arabia", 12, 32, 36, 60), ("West Africa", -2, 18, -18, 15), ("East Africa", -12, 18, 22, 52), ("southern Africa", -35, -12, 10, 41),
    ("Central Africa", -12, 8, 8, 32), ("Central Asia", 35, 55, 46, 90), ("South Asia", 5, 37, 60, 97), ("China", 18, 54, 97, 135),
    ("Japan and Korea", 30, 46, 124, 146), ("Southeast Asia", -11, 28, 92, 141), ("Siberia", 50, 78, 60, 180),
    ("Australia", -45, -10, 112, 155), ("Hawaii", 18, 23, -161, -154), ("New Zealand", -48, -33, 165, 180),
    ("Melanesia", -25, 0, 140, 172), ("Micronesia", 0, 22, 130, 180), ("western Polynesia", -25, -8, 172, 180),
    ("western Polynesia", -25, -8, -180, -168), ("eastern Polynesia", -30, 0, -168, -100),
    ("the Pacific", -50, 30, 155, 180), ("the Pacific", -50, 30, -180, -130),
]


def s_of(y: float, now: float) -> float:
    return -math.log10(max(now - y, 0) + C_YEARS)


def now_year(today: date) -> float:
    return today.year + (today.timetuple().tm_yday - 1) / 365.2425


def km(a, b) -> float:
    (lat1, lon1), (lat2, lon2) = a, b
    p1, p2, dl = math.radians(lat1), math.radians(lat2), math.radians(lon2 - lon1)
    c = math.sin(p1) * math.sin(p2) + math.cos(p1) * math.cos(p2) * math.cos(dl)
    return 6371.0 * math.acos(max(-1.0, min(1.0, c)))


def centroid(points) -> tuple[float, float] | None:
    if not points:
        return None
    x = y = z = 0.0
    for lat, lon in points:
        p, l = math.radians(lat), math.radians(lon)
        x += math.cos(p) * math.cos(l)
        y += math.cos(p) * math.sin(l)
        z += math.sin(p)
    n = len(points)
    x, y, z = x / n, y / n, z / n
    return round(math.degrees(math.atan2(z, math.hypot(x, y))), 3), round(math.degrees(math.atan2(y, x)), 3)


def macro_region(pt) -> str:
    if pt is None:
        return "?"
    lat, lon = pt
    for name, a, b, c, d in MACRO_REGIONS:
        if a <= lat <= b and c <= lon <= d:
            return name
    return f"{lat:.0f}°, {lon:.0f}°"


def era_of(y: float) -> str:
    for start, name in reversed(get("eras")):
        if y >= start:
            return name
    return get("eras")[0][1]


def clusters(points: list[tuple[str, tuple[float, float]]], limit_km: float) -> list[list[str]]:
    """Average-linkage agglomerative clustering of (id, (lat, lon)), joining the closest pair of clusters while their
    mean pairwise distance is within `limit_km`. Deterministic: ties go to the lowest indexes."""
    ids = [i for i, _ in points]
    pts = [p for _, p in points]
    n = len(pts)
    if n == 0:
        return []
    d = [[km(pts[i], pts[j]) if i != j else 0.0 for j in range(n)] for i in range(n)]
    groups = {i: [i] for i in range(n)}
    # Sum of pairwise distances between groups, so the average updates in O(1) per merge.
    sums = {(i, j): d[i][j] for i in range(n) for j in range(i + 1, n)}
    while len(groups) > 1:
        best, pair = None, None
        keys = sorted(groups)
        for a_i, a in enumerate(keys):
            for b in keys[a_i + 1:]:
                avg = sums[(a, b)] / (len(groups[a]) * len(groups[b]))
                if best is None or avg < best:
                    best, pair = avg, (a, b)
        if best > limit_km:
            break
        a, b = pair
        for k in keys:
            if k in (a, b):
                continue
            ka, kb = (min(k, a), max(k, a)), (min(k, b), max(k, b))
            sums[ka] = sums[ka] + sums.pop(kb)
        sums.pop((a, b))
        groups[a] = groups[a] + groups.pop(b)
    out = [[ids[i] for i in sorted(g)] for g in groups.values()]
    return sorted(out, key=lambda g: (-len(g), g[0]))


def _window(span_years: float) -> float:
    for limit, size in ((200, 10), (3000, 100), (50000, 1000)):
        if span_years <= limit:
            return size
    return 10 ** max(4, math.floor(math.log10(span_years)) - 1)


def compute(today: date | None = None, context: dict | None = None) -> dict[str, dict]:
    """slug → metrics for every published branch (with its event rows under "_event_rows", for the rules). Pass a dict
    as `context` to get the working data back too (branches, event places, links)."""
    today = today or date.today()
    now = now_year(today)
    branches = list(Branch.objects.filter(status=Status.PUBLISHED).select_related("region").order_by("sort_key"))
    ids = {b.pk: b for b in branches}
    evs = defaultdict(list)
    for e in Event.objects.filter(status=Status.PUBLISHED, branch_id__in=ids).order_by("y", "sort_key").values("pk", "slug", "title", "y", "end", "when", "branch_id", "imp"):
        evs[e["branch_id"]].append(e)
    ev_ids = {e["pk"] for v in evs.values() for e in v}
    geo = {}
    max_r = get("geo_max_radius_km")
    extent = {}
    for loc in Location.objects.filter(entry_id__in=ev_ids | set(ids), scope__in=["place", "region"]):
        if loc.lat is None:
            continue
        if loc.entry_id in ids and loc.scope == "region":
            extent[loc.entry_id] = {"centroid": (loc.lat, loc.lon), "r_km": loc.radius_km, "label": loc.label}
        if (loc.radius_km or 0) <= max_r:
            geo[loc.entry_id] = (loc.lat, loc.lon, loc.label)
    links_out = defaultdict(Counter)
    links_in = defaultdict(Counter)
    ev_branch = {e["pk"]: e["branch_id"] for v in evs.values() for e in v}
    for event_id, target in EventLink.objects.filter(event_id__in=ev_ids, branch_id__in=ids).values_list("event_id", "branch_id"):
        src = ev_branch[event_id]
        if target != src:
            links_out[src][ids[target].slug] += 1
            links_in[target][ids[src].slug] += 1
    parents, into, children = defaultdict(list), defaultdict(list), defaultdict(list)
    for b_id, t_id, rel in BranchLink.objects.filter(branch_id__in=ids, target_id__in=ids).order_by("position").values_list("branch_id", "target_id", "relation"):
        (parents if rel == "parent" else into)[b_id].append(ids[t_id].slug)
        if rel == "parent":
            children[t_id].append(ids[b_id].slug)

    out = {}
    phase_gap, cluster_km = get("phase_gap_s"), get("cluster_km")
    for b in branches:
        es = evs.get(b.pk, [])
        start, end = b.start, (b.end if b.end is not None else now)
        s0, s1 = s_of(start, now), s_of(end, now)
        es = sorted(es, key=lambda e: (e["y"], e["slug"]))
        lead = trail = longest = None
        phases = []
        if es:
            stop = lambda e: e["end"] if e["end"] is not None else e["y"]  # noqa: E731
            lead = {"s": round(max(0.0, s_of(es[0]["y"], now) - s0), 3), "from": start, "to": es[0]["y"]}
            cov, phase = stop(es[0]), [es[0]]
            for e in es[1:]:
                g = s_of(e["y"], now) - s_of(cov, now) if e["y"] > cov else 0.0
                if longest is None or g > longest["s"]:
                    longest = {"s": round(g, 3), "from": cov, "to": e["y"]}
                if g >= phase_gap:
                    phases.append(phase)
                    phase = []
                phase.append(e)
                cov = max(cov, stop(e))
            phases.append(phase)
            trail = {"s": round(max(0.0, s1 - s_of(cov, now)), 3), "from": cov, "to": b.end}
            phases = [{"from": p[0]["y"], "to": max(map(stop, p)), "events": len(p), "first": p[0]["slug"], "last": p[-1]["slug"]} for p in phases]
        span_years = end - start
        span_s = max(s1 - s0, 1e-6)
        w = _window(span_years)
        windows = Counter(int(math.floor(e["y"] / w) * w) for e in es)
        pts = [(e["slug"], geo[e["pk"]][:2]) for e in es if e["pk"] in geo]
        cl = clusters(pts, cluster_km) if len(pts) >= 2 else ([[pts[0][0]]] if pts else [])
        by_slug = {e["slug"]: e for e in es}
        pt_of = dict(pts)
        cl_out = []
        for g in cl:
            c = centroid([pt_of[s] for s in g])
            cl_out.append({
                "n": len(g), "centroid": c, "name": macro_region(c), "from": min(by_slug[s]["y"] for s in g),
                "to": max(by_slug[s]["end"] if by_slug[s]["end"] is not None else by_slug[s]["y"] for s in g), "events": g,
            })
        cen = centroid([p for _, p in pts])
        out[b.slug] = {
            "branch": b.slug, "name": b.name, "region": b.region.slug, "era": era_of(now - (10 ** -((s0 + s1) / 2) - C_YEARS)),  # the era at the middle of its span on the page
            "events": len(es), "start": start, "end": b.end, "continues": b.end is None,
            "span": {"years": round(span_years, 2), "s": round(span_s, 4)},
            "windows": {"size_years": w, "counts": {str(k): v for k, v in sorted(windows.items())}},
            "density": round(len(es) / span_s, 3),
            "gaps": {"lead": lead, "longest": longest, "trail": trail},
            "phases": phases,
            "links": {"out": dict(links_out[b.pk].most_common()), "in": dict(links_in[b.pk].most_common()),
                      "out_share": {k: round(v / len(es), 3) for k, v in links_out[b.pk].most_common(5)} if es else {}},
            "geo": {"located": len(pts), "centroid": cen, "extent": extent.get(b.pk), "mean_km": round(sum(km(cen, p) for _, p in pts) / len(pts), 1) if pts else None,
                    "clusters": cl_out, "countries": None},
            "structure": {"parents": parents[b.pk], "into": into[b.pk], "children": children[b.pk]},
            "_event_rows": es,
        }
    # Density relative to peers (same region and era; else same era; else everyone).
    by_re, by_e = defaultdict(list), defaultdict(list)
    for m in out.values():
        if m["events"]:
            by_re[(m["region"], m["era"])].append(m["density"])
            by_e[m["era"]].append(m["density"])
    everyone = [m["density"] for m in out.values() if m["events"]]
    min_peers = get("min_peers")
    for m in out.values():
        peers = by_re[(m["region"], m["era"])]
        group = f"{m['region']} / {m['era']}"
        if len(peers) < min_peers:
            peers, group = by_e[m["era"]], m["era"]
        if len(peers) < min_peers:
            peers, group = everyone, "all"
        med = median(peers) if peers else 0
        m["peers"] = {"group": group, "n": len(peers), "median_density": round(med, 3)}
        m["relative_density"] = round(m["density"] / med, 3) if med else None
    for m in out.values():
        m["version"] = METRICS_VERSION
    if context is not None:
        context.update(now=now, branches={b.slug: b for b in branches}, geo=geo,
                       parents={ids[k].slug: v for k, v in parents.items()}, into={ids[k].slug: v for k, v in into.items()})
    return out


def public(m: dict) -> dict:
    """A metric without the working rows (what is stored and shown)."""
    return {k: v for k, v in m.items() if not k.startswith("_")}
