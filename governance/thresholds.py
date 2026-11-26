"""Every branch-rule threshold, in one dict (docs/branch-rules.md explains each one, with an example from real data).

Override with `settings.BRANCH_RULES` (merged over this). Changing a threshold that changes what the rules propose
means bumping RULES_VERSION, so proposals record which rules made them.

"s" is the page's time scale (governance/metrics.py): −log10(years before now + 40). 0.1 s is about a 26% change in
"years before now": 1500 → 1600, 500 BCE → 0, or 1960 → 1975.
"""

from django.conf import settings

METRICS_VERSION = "metrics-v1"
RULES_VERSION = "branch-rules-v2"  # v2: NEW-BRANCH proposes only what can be a branch, parents from Wikidata relations (ADR 0021)

DEFAULTS = {
    # ── metrics ──
    "eras": [(-1e12, "deep time"), (-3000, "ancient"), (500, "medieval"), (1500, "early modern"), (1800, "modern"), (1945, "since 1945")],
    "phase_gap_s": 0.25,         # a gap this wide (s) between events separates two phases
    "cluster_km": 2500,          # geographic clusters join while their average distance is within this
    "geo_max_radius_km": 1500,   # locations vaguer than this (a whole continent) are left out of the geography
    "min_peers": 5,              # fewer peers in a region and era: compare with the era, then with everyone

    # ── SPLIT-TIME: two or more phases, or a sharp change of place at some date ──
    "split_time": {
        "min_events": 30, "min_gap_s": 0.4, "min_phase_events": 8, "min_phase_share": 0.2,
        # Change point: the best date to cut the events in two, if the halves' centroids are this far apart and each
        # half is tighter than the distance between them.
        "min_shift_km": 3000, "min_side_events": 10, "max_side_spread_ratio": 0.5,
    },
    # ── SPLIT-PLACE: clearly separate geographic clusters with few links between them ──
    "split_place": {
        "min_events": 30, "min_clusters": 3, "min_cluster_events": 5, "min_cluster_share": 0.05,
        "min_separation_km": 2000, "max_cross_link_share": 0.1,
        # A cluster outside the branch's own area (its TL.geo region, widened by this factor) is events abroad (a
        # treaty in London on Canada's lane), not a region of the branch.
        "abroad_factor": 1.25,
        # Lanes about the whole world or deep time, which are meant to span continents.
        "exempt_regions": ["cosmos", "life", "humans", "global", "faiths", "culture"],
    },
    # ── MERGE-OVERLAP: two branches telling the same story in the same time and place ──
    # "Shared" = the share of the smaller branch's events that duplicate one of the other's (similar title within two
    # years) or cite a page the other's events cite. Contact (an event linked to the other branch) does not count:
    # neighbours at war are linked, not the same.
    "merge_overlap": {
        "min_overlap": 0.6,          # spans overlap this much of the shorter one (in s) …
        "max_distance_km": 800,      # … centroids this close …
        "min_shared": 0.25, "min_shared_events": 3,  # … this much shared …
        # … and a direct lineage link (parent / into) between them, unless shared is at least this:
        "shared_without_lineage": 0.5,
        # Or: the smaller has fewer than `small_events` and sits inside the other's span (`contained`) and place,
        # sharing at least `min_shared` (and two events), with the same lineage condition.
        "small_events": 15, "contained": 0.9, "small_min_shared_events": 2,
        # A small successor (an `into` link, starting within this many s of its predecessor's end, in the same place)
        # joins a merge group: a renamed continuation (EEC → EU).
        "succession_gap_s": 0.01,
        # Title similarity that counts two events as the same happening (Python difflib ratio).
        "duplicate_title": 0.75,
    },
    # ── END-STALE: nothing for a long time at the end of the span ──
    "end_stale": {"min_events": 8, "min_trail_s": 0.6, "exempt_regions": ["cosmos", "life", "humans"]},
    # ── NEW-BRANCH: an entity that keeps coming up with no branch to route it to ──
    "new_branch": {"min_clusters": 5, "min_days": 7},
    # ── THIN: much sparser than its peers ──
    "thin": {"max_relative_density": 0.15, "min_span_s": 0.15, "fill_after_days": 90},

    # ── hysteresis: re-proposing what was decided ──
    # A rejected proposal comes back only if its strength grew by this factor, and never within the cool-down.
    "reject_regrowth": 1.5, "reject_cooldown_days": 180,
    # The inverse of an applied change (merging what was split, splitting what was merged) needs this many times the
    # usual strength.
    "undo_factor": 2.0,
}


def get(name: str):
    over = getattr(settings, "BRANCH_RULES", {}) or {}
    v = over.get(name, DEFAULTS[name])
    if isinstance(v, dict) and isinstance(DEFAULTS[name], dict):
        return {**DEFAULTS[name], **v}
    return v
