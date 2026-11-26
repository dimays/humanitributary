"""A claim's status and confidence, computed from its evidence (docs/adr/0004). Deterministic, so a job can
recompute every claim at any time; never edited by hand.

Confidence treats each publisher as one independent witness: the strongest stance it takes counts, weighted by its
reliability tier, and witnesses combine as independent probabilities (1 − Π(1 − w)). Conflicting witnesses scale it
down the same way. Status:

- unverified:    no evidence that supports or conflicts
- contested:     at least one supporting and one conflicting witness
- stale:         `recheck_after` has passed
- corroborated:  supported by a publisher other than Wikipedia (the legacy rule the owner set: a non-Wikipedia
                 source exists for the claim)
- single_source: supported, but only by Wikipedia
"""

from datetime import date

TIER_WEIGHT = {1: 0.6, 2: 0.5, 3: 0.35, 4: 0.15, None: 0.25}
STANCE_FACTOR = {"supports": 1.0, "partial": 0.5}


def assess(evidence_rows, recheck_after=None, today=None) -> tuple[str, float]:
    """evidence_rows: iterable of (stance, publisher_domain, publisher_tier)."""
    support, conflict = {}, {}
    for stance, domain, tier in evidence_rows:
        w = TIER_WEIGHT.get(tier, TIER_WEIGHT[None])
        if stance in STANCE_FACTOR:
            support[domain] = max(support.get(domain, 0.0), w * STANCE_FACTOR[stance])
        elif stance == "conflicts":
            conflict[domain] = max(conflict.get(domain, 0.0), w)
    p_s, p_c = 1.0, 1.0
    for w in support.values():
        p_s *= 1 - w
    for w in conflict.values():
        p_c *= 1 - w
    confidence = round((1 - p_s) * p_c, 4)
    if not support and not conflict:
        status = "unverified"
    elif support and conflict:
        status = "contested"
    elif recheck_after and recheck_after < (today or date.today()):
        status = "stale"
    elif not support:
        status = "contested"
    elif any(not (d == "wikipedia.org" or d.endswith(".wikipedia.org")) for d in support):
        status = "corroborated"
    else:
        status = "single_source"
    return status, confidence


def refresh(claim) -> str:
    """Recompute one claim's status and confidence and save them if they changed (inside revising())."""
    from timeline.services import apply_changes

    rows = claim.evidence.values_list("stance", "citation__publisher__domain", "citation__publisher__tier")
    status, confidence = assess(rows, claim.recheck_after)
    return apply_changes(claim, {"status": status, "confidence": confidence})
