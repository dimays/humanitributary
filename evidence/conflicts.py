"""Conflicting evidence (docs/fact-checking.md, "Conflicts").

When a source says something different from a claim (another date, another number), that is evidence too: an
`Evidence(stance="conflicts")` row with what the source says in `found_value`, beside the claim's own value. It
lowers the claim's confidence and, past the threshold, makes it contested; the sweep then queues a `verify_claim`
task for an agent to adjudicate (fix the entry, attribute the disagreement, or mark the evidence unrelated).

Conflicts attach to the atomic claim (the `date` child, a `number` child …), never to the legacy "as written" claim:
the legacy import owns that claim's evidence list and would remove anything it did not write.

`from_candidates()` finds date conflicts in ingestion's output deterministically: a Candidate that ingestion matched
to an existing event (`duplicate_of`, trigram `similarity` ≥ conflict_min_similarity) whose `y_guess` differs from
the event's date by more than the tolerance for the event's precision, but not absurdly (≤ date_plausible_tolerances
tolerances, or date_plausible_min_years if that is more, beyond which it is more likely another event of the same
name).
"""

from django.db.models import Max
from django.utils import timezone

from timeline.services import apply_changes

from . import policy
from .models import Citation, Claim, Evidence, Publisher
from .publishers import defaults_for, domain_of
from .staleness import tolerance


def _excerpt(text: str, n: int = 25) -> str:
    return " ".join((text or "").split()[:n])[:400]


def citation_for(url: str, title: str) -> Citation | None:
    """The Citation row for a URL (created, with its publisher, if new). None for a URL we may not cite."""
    if not url.startswith("https://"):
        return None
    domain = domain_of(url)
    pub = Publisher.objects.filter(domain=domain).first()
    if pub is None:
        pub = Publisher.objects.create(domain=domain, **defaults_for(domain))
    if pub.fetch_policy == "forbidden":
        return None
    cit = Citation.objects.filter(url=url).first()
    return cit or Citation.objects.create(url=url, title=(title or url)[:500], publisher=pub)


def record_conflict(claim: Claim, *, url: str, title: str, found_value: dict, excerpt: str = "", checked_by: str, method: str = "fetch_match", checked_at=None) -> tuple[Evidence | None, bool]:
    """Add (or refresh) a conflicting evidence row on `claim` from the page at `url`. Inside revising().

    found_value: what the source says, e.g. {"y": 1951.3, "when": "April 1951"}; the claim's own value is kept beside
    it (`claim_value`) so the task shows both. → (evidence, created)
    """
    if claim.field == "as_written":
        raise ValueError("record conflicts on an atomic claim (date, number …), not on the legacy as-written claim")
    cit = citation_for(url, title)
    if cit is None:
        return None, False
    value = dict(found_value, claim_value=claim.value)
    ev = Evidence.objects.filter(claim=claim, citation=cit).first()
    fields = {"stance": "conflicts", "found_value": value, "excerpt": _excerpt(excerpt), "checked_by": checked_by, "method": method, "checked_at": checked_at or timezone.now(), "content_hash": cit.content_hash}
    if ev is not None:
        if ev.stance in ("supports", "partial") and ev.method != "legacy":
            return ev, False  # an agent already read this page and found it supports the claim: theirs stands
        if (ev.found_value or {}).get("resolved"):
            return ev, False  # a reviewer resolved this conflict (apply_edits resolve_conflict): their decision stands
        fields.pop("checked_at")  # unchanged findings leave no Revision
        apply_changes(ev, fields)
        return ev, False
    last = claim.evidence.aggregate(m=Max("position"))["m"]
    pos = 0 if last is None else last + 1
    ev = Evidence(claim=claim, citation=cit, position=pos, cited_title=cit.title, cited_kind=cit.kind)
    apply_changes(ev, fields)
    return ev, True


def from_candidates(actor: str, today=None) -> dict:
    """Date conflicts between ingestion's matched candidates and existing events. Inside revising()."""
    from ingest.models import Candidate

    stats = {"seen": 0, "conflicts": 0, "created": 0}
    min_sim, plausible = policy.get("conflict_min_similarity"), policy.get("date_plausible_tolerances")
    qs = (
        Candidate.objects.filter(duplicate_of__isnull=False, similarity__gte=min_sim, y_guess__isnull=False)
        .exclude(status="rejected")
        .select_related("duplicate_of")
        .prefetch_related("documents")
        .order_by("id")
    )
    for cand in qs:
        stats["seen"] += 1
        event = cand.duplicate_of
        tol = tolerance(event.precision)
        if tol is None:
            continue
        lo, hi = (event.y, event.end if event.end is not None else event.y)
        diff = 0.0 if lo - tol <= cand.y_guess <= hi + tol else min(abs(cand.y_guess - lo), abs(cand.y_guess - hi))
        if diff <= tol or diff > max(plausible * tol, policy.get("date_plausible_min_years")):
            continue
        claim = Claim.objects.filter(entry_id=event.pk, field="date", key="").first()
        if claim is None:
            continue
        stats["conflicts"] += 1
        found = {"y": cand.y_guess, "when": cand.when_text, "candidate": cand.pk}
        for doc in sorted(cand.documents.all(), key=lambda d: d.pk):
            _, created = record_conflict(claim, url=doc.canonical_url or doc.url, title=doc.title, found_value=found, excerpt=cand.when_text or cand.title, checked_by=actor, checked_at=doc.fetched_at)
            stats["created"] += created
    return stats
