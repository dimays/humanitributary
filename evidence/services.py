"""Writing evidence: what an agent records after reading a page against a claim (inside `revisions.revising()`).

    with revising("agent:claude-verifier", reason="verify_claim #812", task=task):
        record_evidence(claim, url="https://…", stance="supports", excerpt="…", checked_by="agent:claude-verifier",
                        method="agent_read")

The evidence row is created or updated for (claim, citation), stamped with the check time and the citation's
current content hash (so a later page change is noticed), and the claim's status, confidence and recheck date are
recomputed. On the legacy "as written" claim an existing row is updated in place (the import owns that list, so new
citations for it go in the data files, or on an atomic part); on every other claim a new citation is appended.
"""

from datetime import date

from django.db.models import Max
from django.utils import timezone

from revisions import require_revising
from timeline.services import apply_changes

from .conflicts import _excerpt, citation_for
from .models import Claim, Evidence

STANCES = ("supports", "partial", "conflicts", "unrelated")


def record_evidence(claim: Claim, *, url: str, stance: str, checked_by: str, excerpt: str = "", method: str = "agent_read", title: str = "", found_value: dict | None = None, today: date | None = None) -> Evidence:
    require_revising()
    if stance not in STANCES:
        raise ValueError(f"stance must be one of {STANCES}")
    cit = citation_for(url, title)
    if cit is None:
        raise ValueError(f"{url}: not citable (https only; never a forbidden publisher such as openstax.org)")
    ev = Evidence.objects.filter(claim=claim, citation=cit).order_by("position").first()
    if ev is None:
        if claim.field == "as_written" and claim.parent_id is None and claim.key == "":
            raise ValueError("the as-written claim's citations come from the entry's cites (legacy import): add new evidence to an atomic part instead")
        last = claim.evidence.aggregate(m=Max("position"))["m"]
        pos = 0 if last is None else last + 1
        ev = Evidence(claim=claim, citation=cit, position=pos, cited_title=(title or cit.title)[:500], cited_kind=cit.kind)
    apply_changes(ev, {
        "stance": stance, "excerpt": _excerpt(excerpt), "checked_by": checked_by, "method": method, "checked_at": timezone.now(),
        "content_hash": cit.content_hash, "found_value": found_value,
    })
    from .sweep import reassess_all

    reassess_all(today or date.today(), {}, claim_ids=[claim.pk])
    return ev
