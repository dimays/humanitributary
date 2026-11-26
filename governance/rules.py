"""The branch rules: named, versioned, one function each (docs/branch-rules.md has each rule's rationale and an
example from real data; the thresholds are in governance/thresholds.py).

A rule reads the metrics (governance/metrics.py) and returns Findings: what it saw (evidence), how strongly
(`strength`, 1.0 = exactly at the threshold), and the exact operations that would apply the change
(governance/operations.py). Rules never write; `review` turns findings into proposals and tasks.
"""

import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from difflib import SequenceMatcher

from evidence.claims import slugify

from .metrics import centroid, km, macro_region, s_of
from .thresholds import get

PLACEHOLDER = "TODO"


@dataclass
class Finding:
    rule: str                 # e.g. "SPLIT-PLACE-v1"
    kind: str                 # BranchProposal.Kind
    branch: str | None        # the branch it concerns (None for a new branch)
    others: list[str]
    strength: float
    summary: str
    evidence: dict
    operations: list[dict] = field(default_factory=list)
    needs_agent: list[str] = field(default_factory=list)  # fields an agent must write before applying
    key: str = ""             # identity for hysteresis: the same change has the same key

    def __post_init__(self):
        if not self.key:
            self.key = f"{self.rule.rsplit('-v', 1)[0]}:{'+'.join(sorted(filter(None, [self.branch, *self.others])))}"


def fmt_year(y: float, now: float) -> str:
    if y is None:
        return ""
    if now - y >= 100_000:
        ago = now - y
        return f"c. {ago / 1e6:,.1f} million years ago" if ago >= 1e6 else f"c. {round(ago, -3):,.0f} years ago"
    if y < 0:
        return f"c. {-round(y):,} BCE" if y < -10000 else f"c. {-round(y)} BCE"
    return f"c. {round(y)}"


def event_brief(e: dict, geo: dict) -> dict:
    g = geo.get(e["pk"])
    return {"id": e["slug"], "title": e["title"], "when": e["when"], "y": e["y"], "place": g[2] if g else None}


# ── SPLIT-PLACE ──

def split_place(M: dict, ctx) -> list[Finding]:
    t = get("split_place")
    out = []
    for slug, m in M.items():
        if m["region"] in t["exempt_regions"] or m["events"] < t["min_events"]:
            continue
        ext = m["geo"]["extent"]
        abroad = [c for c in m["geo"]["clusters"] if ext and ext["r_km"] and km(c["centroid"], ext["centroid"]) > ext["r_km"] * t["abroad_factor"]]
        sig = [c for c in m["geo"]["clusters"] if c not in abroad and c["n"] >= t["min_cluster_events"] and c["n"] >= t["min_cluster_share"] * m["events"]]
        need = t["min_clusters"] * (get("undo_factor") if slug in ctx.protected.get("merge-survivor", set()) else 1)
        if len(sig) < need:
            continue
        seps = [km(a["centroid"], b["centroid"]) for i, a in enumerate(sig) for b in sig[i + 1:]]
        if min(seps) < t["min_separation_km"]:
            # Keep only clusters clearly apart from a larger one.
            keep = []
            for c in sig:
                if all(km(c["centroid"], k["centroid"]) >= t["min_separation_km"] for k in keep):
                    keep.append(c)
            sig = keep
            if len(sig) < need:
                continue
            seps = [km(a["centroid"], b["centroid"]) for i, a in enumerate(sig) for b in sig[i + 1:]]
        member = {s: i for i, c in enumerate(sig) for s in c["events"]}
        cross = sum(1 for a, b in ctx.connections.get(slug, []) if a in member and b in member and member[a] != member[b])
        ties = max(1, sum(1 for a, b in ctx.connections.get(slug, []) if a in member and b in member))
        cross_share = cross / max(1, sum(c["n"] for c in sig))
        if cross_share > t["max_cross_link_share"]:
            continue
        branch = ctx.branches[slug]
        ops, children, names = [], [], Counter()
        for c in sig:
            names[c["name"]] += 1
        seen = Counter()
        for c in sig:
            seen[c["name"]] += 1
            label = c["name"] if names[c["name"]] == 1 else f"{c['name']} ({seen[c['name']]})"
            child = f"{slug}-{slugify(re.sub(r'^the ', '', label))}"[:110]
            children.append(child)
            first = min(c["from"], max(branch.start, c["from"]))
            ops.append({"op": "create_branch", "id": child, "fields": {
                "name": f"{branch.name}: {re.sub(r'^the ', '', label)}", "region": m["region"], "start": first, "end": branch.end,
                "start_when": fmt_year(first, ctx.now), "end_when": branch.end_when, "parents": [slug], "text": PLACEHOLDER, "cites": []}})
            ops += [{"op": "move", "event": e, "branch": child} for e in c["events"]]
        stay = [e["slug"] for e in M[slug]["_event_rows"] if e["slug"] not in member]
        strength = round(min(len(sig) / t["min_clusters"], min(seps) / t["min_separation_km"]), 3)
        out.append(Finding(
            rule="SPLIT-PLACE-v1", kind="split", branch=slug, others=[], strength=strength,
            summary=f"{branch.name}: {len(sig)} separate regions ({', '.join(c['name'] + f' {c['n']}' for c in sig)}), at least {min(seps):,.0f} km apart, "
                    f"{cross} cross-region connections. Propose regional child branches; {len(stay)} events stay.",
            evidence={"clusters": [{**{k: v for k, v in c.items() if k != "events"}, "events": [event_brief(ctx.event(e), ctx.geo) for e in c["events"]]} for c in sig],
                      "separation_km": [round(s) for s in seps], "cross_connections": cross, "connections_within": ties, "stay": stay},
            operations=ops, needs_agent=[f"{c}.name" for c in children] + [f"{c}.text" for c in children] + [f"{c}.cites" for c in children] + [f"{c}.start_when" for c in children],
        ))
    return out


# ── SPLIT-TIME ──

def split_time(M: dict, ctx) -> list[Finding]:
    t = get("split_time")
    out = []
    for slug, m in M.items():
        if m["events"] < t["min_events"]:
            continue
        factor = get("undo_factor") if slug in ctx.protected.get("merge-survivor", set()) else 1
        branch = ctx.branches[slug]
        rows = sorted(m["_event_rows"], key=lambda e: (e["y"], e["slug"]))
        cut, why, strength, ev = None, None, 0.0, {}
        # (a) phases separated by a long gap
        phases = [p for p in m["phases"]]
        big = [p for p in phases if p["events"] >= t["min_phase_events"] and p["events"] >= t["min_phase_share"] * m["events"]]
        if len(big) >= 2:
            gaps = []
            for a, b in zip(phases, phases[1:]):
                gaps.append((s_of(b["from"], ctx.now) - s_of(a["to"], ctx.now), a, b))
            g, a, b = max(gaps, key=lambda x: x[0])
            if g >= t["min_gap_s"] * factor:
                cut, why, strength = b["from"], "gap", g / t["min_gap_s"]
                ev = {"gap_s": round(g, 3), "before": a, "after": b}
        # (b) a sharp change of place at some date
        if cut is None:
            located = [(e, ctx.geo[e["pk"]][:2]) for e in rows if e["pk"] in ctx.geo]
            n = t["min_side_events"]
            best = None
            for i in range(n, len(located) - n + 1):
                left, right = [p for _, p in located[:i]], [p for _, p in located[i:]]
                cl, cr = centroid(left), centroid(right)
                d = km(cl, cr)
                spread = max(sum(km(cl, p) for p in left) / len(left), sum(km(cr, p) for p in right) / len(right))
                if d >= t["min_shift_km"] * factor and spread <= t["max_side_spread_ratio"] * d and (best is None or d > best[0]):
                    best = (d, i, cl, cr, spread)
            if best:
                d, i, cl, cr, spread = best
                cut, why, strength = located[i][0]["y"], "shift", d / t["min_shift_km"]
                ev = {"shift_km": round(d), "before": {"centroid": cl, "name": macro_region(cl), "events": i},
                      "after": {"centroid": cr, "name": macro_region(cr), "events": len(located) - i}, "spread_km": round(spread)}
        if cut is None:
            continue
        later = [e["slug"] for e in rows if e["y"] >= cut]
        new = f"{slug}-from-{slugify(str(round(cut)) if cut >= 0 else str(-round(cut)) + '-bce')}"
        ops = [
            {"op": "create_branch", "id": new, "fields": {"name": f"{branch.name} (from {fmt_year(cut, ctx.now)[3:]})", "region": m["region"], "start": cut,
             "end": branch.end, "start_when": fmt_year(cut, ctx.now), "end_when": branch.end_when, "parents": [slug], "text": PLACEHOLDER, "cites": []}},
            {"op": "patch", "id": slug, "fields": {"end": cut, "end_when": fmt_year(cut, ctx.now), "into": [*ctx.into.get(slug, []), new]}},
            *({"op": "move", "event": e, "branch": new} for e in later),
        ]
        out.append(Finding(
            rule="SPLIT-TIME-v1", kind="split", branch=slug, others=[], strength=round(strength, 3),
            summary=f"{branch.name}: " + (f"two phases {ev['gap_s']} s apart" if why == "gap" else f"its events move {ev['shift_km']:,} km ({ev['before']['name']} → {ev['after']['name']})")
                    + f" around {fmt_year(cut, ctx.now)}. Propose ending it there and continuing on a successor branch ({len(later)} events move).",
            evidence={"cut": cut, "why": why, **ev, "moving": [event_brief(ctx.event(e), ctx.geo) for e in later]},
            operations=ops, needs_agent=[f"{new}.name", f"{new}.text", f"{new}.cites", f"{slug}.end_when"],
        ))
    return out


# ── MERGE-OVERLAP ──

def _overlap_s(a, b, now) -> tuple[float, float]:
    a0, a1 = s_of(a["start"], now), s_of(a["end"] if a["end"] is not None else now, now)
    b0, b1 = s_of(b["start"], now), s_of(b["end"] if b["end"] is not None else now, now)
    ov = max(0.0, min(a1, b1) - max(a0, b0))
    return ov, ov / max(1e-9, min(a1 - a0, b1 - b0))


def _shared(small: str, big: str, M, ctx) -> tuple[float, dict]:
    """The share of `small`'s events that duplicate one of `big`'s or cite a page `big`'s events cite."""
    t = get("merge_overlap")
    same, why = set(), Counter()
    big_rows = M[big]["_event_rows"]
    big_urls = set().union(*(ctx.urls.get(e["slug"], set()) for e in big_rows)) if big_rows else set()
    for e in M[small]["_event_rows"]:
        s = e["slug"]
        if ctx.urls.get(s, set()) & big_urls:
            same.add(s)
            why["shared_source"] += 1
        for f in big_rows:
            if abs(f["y"] - e["y"]) <= 2 and SequenceMatcher(None, e["title"].lower(), f["title"].lower()).ratio() >= t["duplicate_title"]:
                same.add(s)
                why["duplicate"] += 1
                break
        if big in ctx.event_links.get(s, set()):
            why["linked"] += 1
    n = max(1, M[small]["events"])
    lineage = big in ctx.into.get(small, []) or small in ctx.into.get(big, []) or big in ctx.parents.get(small, []) or small in ctx.parents.get(big, [])
    return len(same) / n, {"shared_events": len(same), "of": M[small]["events"], **why, "lineage": lineage}


def merge_overlap(M: dict, ctx) -> list[Finding]:
    t = get("merge_overlap")
    pairs = []
    slugs = [s for s in M if M[s]["events"]]
    for i, a in enumerate(slugs):
        for b in slugs[i + 1:]:
            A, B = M[a], M[b]
            if A["geo"]["centroid"] is None or B["geo"]["centroid"] is None:
                continue
            dist = km(A["geo"]["centroid"], B["geo"]["centroid"])
            if dist > t["max_distance_km"]:
                continue
            ov, ratio = _overlap_s(A, B, ctx.now)
            small, big = (a, b) if (A["events"], a) < (B["events"], b) else (b, a)
            undo = get("undo_factor") if ctx.siblings(a, b) else 1
            contained = ov / max(1e-9, M[small]["span"]["s"])
            if ratio < t["min_overlap"] and not (M[small]["events"] < t["small_events"] and contained >= t["contained"]):
                continue
            shared, why = _shared(small, big, M, ctx)
            n_shared = why["shared_events"]
            need = t["min_shared"] * undo
            overlapping = (ratio >= t["min_overlap"] and shared >= need and n_shared >= t["min_shared_events"]
                           and (why["lineage"] or shared >= t["shared_without_lineage"] * undo))
            small_inside = (M[small]["events"] < t["small_events"] and contained >= t["contained"] and shared >= need
                            and n_shared >= t["small_min_shared_events"] and (why["lineage"] or shared >= t["shared_without_lineage"] * undo))
            if overlapping or small_inside:
                pairs.append((a, b, {"overlap": round(ratio, 3), "contained": round(contained, 3), "distance_km": round(dist), "shared": round(shared, 3), **why,
                                     "strength": round(shared / t["min_shared"], 3)}))
    # Union the pairs into groups, then add small contiguous successors (renamed continuations).
    parent = {}

    def find(x):
        while parent.get(x, x) != x:
            x = parent[x]
        return x

    for a, b, _ in pairs:
        parent[find(a)] = find(b)
    groups = defaultdict(set)
    for a, b, _ in pairs:
        groups[find(a)] |= {a, b}
    out = []
    for members in groups.values():
        members = set(members)
        succession = []
        changed = True
        while changed:
            changed = False
            for s in sorted(members):
                for nxt in ctx.into.get(s, []) + [p for p, ins in ctx.into.items() if s in ins]:
                    if nxt in members or nxt not in M or M[nxt]["events"] >= t["small_events"] or M[nxt]["geo"]["centroid"] is None:
                        continue
                    early, late = (s, nxt) if M[s]["start"] <= M[nxt]["start"] else (nxt, s)
                    if M[early]["end"] is None:
                        continue
                    gap = abs(s_of(M[late]["start"], ctx.now) - s_of(M[early]["end"], ctx.now))
                    if gap <= t["succession_gap_s"] and km(M[s]["geo"]["centroid"], M[nxt]["geo"]["centroid"]) <= t["max_distance_km"]:
                        members.add(nxt)
                        succession.append({"from": early, "to": late, "gap_s": round(gap, 4)})
                        changed = True
        # The survivor: one that continues, else the most events, else the latest; the others merge into it.
        survivor = sorted(members, key=lambda s: (M[s]["end"] is not None, -M[s]["events"], -(M[s]["end"] or 0), s))[0]
        others = sorted(members - {survivor})
        start = min(M[s]["start"] for s in members)
        sv = ctx.branches[survivor]
        ops = [{"op": "merge", "from": o, "into": survivor} for o in sorted(others, key=lambda s: M[s]["start"])]
        if start < sv.start:
            first = min(members, key=lambda s: M[s]["start"])
            ops.append({"op": "patch", "id": survivor, "fields": {"start": start, "start_when": ctx.branches[first].start_when, "name": " / ".join(ctx.branches[s].name for s in sorted(members, key=lambda s: M[s]["start"]))}})
        prs = [p for p in pairs if p[0] in members and p[1] in members]
        strength = max(p[2]["strength"] for p in prs)
        out.append(Finding(
            rule="MERGE-OVERLAP-v1", kind="merge", branch=survivor, others=others, strength=strength,
            summary=f"{', '.join(ctx.branches[s].name for s in sorted(members, key=lambda s: M[s]['start']))} cover the same time and place and share their events"
                    f" ({'; '.join(f'{a}/{b}: overlap {p['overlap']:.0%}, {p['shared_events']}/{p['of']} events shared' for a, b, p in prs)})"
                    + (f"; {', '.join(x['to'] for x in succession)} continues it" if succession else "") + f". Propose one branch, {survivor}.",
            evidence={"pairs": [{"a": a, "b": b, **p} for a, b, p in prs], "succession": succession,
                      "branches": {s: {"name": ctx.branches[s].name, "start": M[s]["start"], "end": M[s]["end"], "events": M[s]["events"], "centroid": M[s]["geo"]["centroid"]} for s in sorted(members)},
                      "events": {s: [event_brief(e, ctx.geo) for e in M[s]["_event_rows"]] for s in sorted(members)}},
            operations=ops, needs_agent=[f"{survivor}.name", f"{survivor}.text", f"{survivor}.start_when"],
        ))
    return out


# ── END-STALE ──

def end_stale(M: dict, ctx) -> list[Finding]:
    t = get("end_stale")
    out = []
    for slug, m in M.items():
        trail = m["gaps"]["trail"]
        if m["region"] in t["exempt_regions"] or m["events"] < t["min_events"] or not trail or trail["s"] < t["min_trail_s"]:
            continue
        last = trail["from"]
        branch = ctx.branches[slug]
        rows = sorted(m["_event_rows"], key=lambda e: -(e["end"] if e["end"] is not None else e["y"]))[:5]
        out.append(Finding(
            rule="END-STALE-v1", kind="end", branch=slug, others=[], strength=round(trail["s"] / t["min_trail_s"], 3),
            summary=f"{branch.name}: no events after {fmt_year(last, ctx.now)[3:]} ({trail['s']} s of empty span to {'now' if branch.end is None else fmt_year(branch.end, ctx.now)[3:]}). "
                    "Propose an end date there, or fill the gap if it continues.",
            evidence={"trail": trail, "continues": branch.end is None, "last_events": [event_brief(e, ctx.geo) for e in rows]},
            operations=[{"op": "patch", "id": slug, "fields": {"end": round(last, 2) if last != round(last) else last, "end_when": fmt_year(last, ctx.now)}}],
            needs_agent=[f"{slug}.end_when"],
        ))
    return out


# ── NEW-BRANCH ──

def new_branch(M: dict, ctx) -> list[Finding]:
    """From ingestion's `new_branch_signal` candidates: an entity with no BranchEntity mapping that recurs in enough
    distinct clusters over enough days → a new branch under the branch its co-mentioned entities route to most."""
    t = get("new_branch")
    out = []
    for sig in ctx.signals:
        if sig["clusters"] < t["min_clusters"] or sig["days"] < t["min_days"]:
            continue
        parent = sig["parent"]
        region = M[parent]["region"] if parent in M else "global"
        slug = slugify(sig["label"])
        out.append(Finding(
            rule="NEW-BRANCH-v1", kind="new", branch=None, others=[parent] if parent else [], strength=round(min(sig["clusters"] / t["min_clusters"], sig["days"] / t["min_days"]), 3),
            summary=f"{sig['label']} ({sig['qid']}) came up in {sig['clusters']} story clusters over {sig['days']} days with no branch to route it to. "
                    f"Propose a new branch" + (f" under {parent}." if parent else "."),
            evidence=sig,
            operations=[
                {"op": "create_branch", "id": slug, "fields": {"name": sig["label"], "region": region, "start": sig["first_y"], "end": None,
                 "start_when": PLACEHOLDER, "end_when": None, "parents": [parent] if parent else [], "text": PLACEHOLDER, "cites": []}},
                {"op": "map_entity", "qid": sig["qid"], "branch": slug, "role": sig.get("kind", "")},
            ],
            needs_agent=[f"{slug}.name", f"{slug}.text", f"{slug}.cites", f"{slug}.start_when", f"{slug}.region"],
            key=f"NEW-BRANCH:{sig['qid']}",
        ))
    return out


# ── THIN (a fill-in task, not a proposal) ──

def thin(M: dict, ctx) -> list[Finding]:
    t = get("thin")
    out = []
    for slug, m in M.items():
        rd = m["relative_density"]
        if rd is None or rd > t["max_relative_density"] or m["span"]["s"] < t["min_span_s"]:
            continue
        counts = m["windows"]["counts"]
        size = m["windows"]["size_years"]
        start, end = m["start"], m["end"] if m["end"] is not None else ctx.now
        import math

        empty = [w for w in range(int(math.floor(start / size) * size), int(end) + 1, int(size)) if str(w) not in counts][:20]
        out.append(Finding(
            rule="THIN-v1", kind="fill", branch=slug, others=[], strength=round(t["max_relative_density"] / max(rd, 1e-3), 3),
            summary=f"{ctx.branches[slug].name}: {m['events']} events, {rd:.0%} of the median density of its peers ({m['peers']['group']}). Fill in its landmark events.",
            evidence={"events": m["events"], "density": m["density"], "relative_density": rd, "peers": m["peers"], "gaps": m["gaps"],
                      "empty_windows": empty, "window_years": size, "existing": [event_brief(e, ctx.geo) for e in m["_event_rows"]][:40]},
        ))
    return out


RULES = [split_place, split_time, merge_overlap, end_stale, new_branch, thin]
