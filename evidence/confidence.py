"""A claim's status and confidence, computed from its evidence (docs/adr/0009-govern-fact-base.md; the formula is in
docs/fact-checking.md). Deterministic, so a job can recompute every claim at any time; never edited by hand.

Witnesses. Evidence is grouped by independent publisher (evidence/independence.py: one organization, one witness;
all of Wikipedia is one). A witness's weight is its strongest evidence's

    w = tier_weight[tier] × stance_factor[stance] × method_factor[method] × freshness(age of the check)

and witnesses combine as independent probabilities:

    support  = 1 − Π (1 − w)   over supporting witnesses (supports, partial)
    conflict = 1 − Π (1 − w)   over conflicting witnesses
    confidence = support × (1 − conflict) × agreement

where `agreement` (1 unless sources give dates in `Evidence.found_value`) is floor + (1 − floor) × the share of
those dates that agree with the claim's.

Status, in order of precedence:

- unverified:    no evidence that supports or conflicts
- contested:     conflict ≥ contested_conflict (0.3), or any conflict at least as strong as the support
- stale:         `recheck_after` is today or earlier
- corroborated:  at least two independent witnesses fully support it (Wikipedia counting as one, at most)
- single_source: supported, but by only one independent witness (or only partly)

Whether a claim rests on Wikipedia alone (the publishing rule's question) is a separate axis: `wikipedia_only()`.
"""

from datetime import date, datetime

from . import policy
from .independence import is_wikipedia, witness

EVIDENCE_FIELDS = ("stance", "citation__publisher__domain", "citation__publisher__tier", "method", "checked_at", "found_value")


def _row(r):
    """Evidence as (stance, domain, tier, method, checked_at, found_value); shorter tuples are padded with None."""
    r = tuple(r) + (None,) * (6 - len(r))
    return r[:6]


def freshness(checked_at, interval_days: int | None, today: date) -> float:
    if checked_at is None or not interval_days:
        return 1.0
    d = checked_at.date() if isinstance(checked_at, datetime) else checked_at
    age = (today - d).days / interval_days
    steps = policy.get("freshness")
    for limit, factor in steps:
        if limit is None or age <= limit:
            return factor
    return steps[-1][1]


def _agreement(rows, claim_y, tolerance) -> float:
    if claim_y is None or tolerance is None:
        return 1.0
    found = [fv["y"] for (*_, fv) in rows if isinstance(fv, dict) and isinstance(fv.get("y"), (int, float))]
    if not found:
        return 1.0
    share = sum(abs(y - claim_y) <= tolerance for y in found) / len(found)
    floor = policy.get("agreement_floor")
    return floor + (1 - floor) * share


def assess_detail(evidence_rows, recheck_after=None, today=None, *, interval_days=None, claim_y=None, tolerance=None) -> dict:
    """The status, confidence and the numbers behind them (for reports and task payloads)."""
    today = today or date.today()
    tiers, stances, methods = policy.get("tier_weight"), policy.get("stance_factor"), policy.get("method_factor")
    rows = [_row(r) for r in evidence_rows]
    support, full, conflict = {}, set(), {}
    for stance, domain, tier, method, checked_at, _ in rows:
        w = tiers.get(tier, tiers[None]) * methods.get(method or "legacy", 1.0) * freshness(checked_at, interval_days, today)
        key = witness(domain)
        if stance in stances:
            support[key] = max(support.get(key, 0.0), w * stances[stance])
            if stance == "supports":
                full.add(key)
        elif stance == "conflicts":
            conflict[key] = max(conflict.get(key, 0.0), w)
    p_s = p_c = 1.0
    for w in support.values():
        p_s *= 1 - w
    for w in conflict.values():
        p_c *= 1 - w
    s, c = 1 - p_s, 1 - p_c
    agreement = _agreement([r for r in rows if r[0] in stances or r[0] == "conflicts"], claim_y, tolerance)
    confidence = round(max(0.0, min(1.0, s * (1 - c) * agreement)), 3)
    if not support and not conflict:
        status = "unverified"
    elif conflict and (c >= policy.get("contested_conflict") or c >= s):
        status = "contested"
    elif recheck_after and recheck_after <= today:
        status = "stale"
    elif len(full) >= policy.get("corroborated_min_witnesses"):
        status = "corroborated"
    else:
        status = "single_source"
    return {
        "status": status, "confidence": confidence, "support": round(s, 3), "conflict": round(c, 3), "agreement": round(agreement, 3),
        "witnesses": sorted(support), "full_witnesses": sorted(full), "conflicting": sorted(conflict),
    }


def assess(evidence_rows, recheck_after=None, today=None, **kw) -> tuple[str, float]:
    """evidence_rows: iterable of (stance, publisher_domain, publisher_tier[, method, checked_at, found_value])."""
    d = assess_detail(evidence_rows, recheck_after, today, **kw)
    return d["status"], d["confidence"]


def wikipedia_only(evidence_rows) -> bool:
    """Supported, but by no publisher other than Wikipedia."""
    stances = policy.get("stance_factor")
    sup = [r[1] for r in map(_row, evidence_rows) if r[0] in stances]
    return bool(sup) and all(is_wikipedia(d) for d in sup)


def refresh(claim, today=None) -> str:
    """Recompute one claim's status and confidence and save them if they changed (inside revising())."""
    from timeline.services import apply_changes

    from .staleness import assess_kwargs

    rows = list(claim.evidence.values_list(*EVIDENCE_FIELDS))
    status, confidence = assess(rows, claim.recheck_after, today, **assess_kwargs(claim, today))
    return apply_changes(claim, {"status": status, "confidence": confidence})
