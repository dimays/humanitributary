"""What may be published (docs/adr/0010-govern-publishing-rule.md).

An entry may become `published` only if

1. no record claim of it is **contested** unless its text says the sources differ (in words like "sources differ",
   "estimates vary", or by attributing each version to its source: "Wikipedia says …; the Met says …"); and
2. an **event** has at least one supporting source that is not Wikipedia, except during the grace period for
   current events (an event dated this year or last, for `grace_days` after it was written).

`problems(entry)` lists what stands in the way; `publish_entry()` is the door agents use to publish (it refuses
with the list unless given an override note, which goes into the Revision's reason). Entries published before the
rule (the legacy content) are not unpublished by it; the sweep queues `verify_claim` tasks for them instead.
"""

import re
from datetime import date

from revisions import current, require_revising, revising
from timeline import services
from timeline.models import Entry, Status

from . import policy
from .confidence import EVIDENCE_FIELDS, wikipedia_only


class PublishBlocked(Exception):
    def __init__(self, slug, problems):
        super().__init__(f"{slug}: " + "; ".join(problems))
        self.problems = problems


def says_sources_differ(text: str) -> bool:
    if re.search(policy.get("sources_differ"), text or "", re.I):
        return True
    return len(re.findall(policy.get("attribution"), text or "", re.I)) >= 2


def problems(entry: Entry, today: date | None = None) -> list[str]:
    today = today or date.today()
    x = entry.concrete
    out = []
    words = " ".join(filter(None, [x.text, getattr(x, "when", ""), getattr(x, "start_when", ""), getattr(x, "end_when", "") or ""]))
    for claim in entry.claims.filter(parent__isnull=True, status="contested"):
        if not says_sources_differ(words if claim.field != "why" else x.why):
            out.append(f"{claim.field} claim is contested and the entry does not say the sources differ")
    if x.kind == "event":
        claim = entry.claims.filter(field="as_written", key="").first()
        rows = list(claim.evidence.values_list(*EVIDENCE_FIELDS)) if claim else []
        if not rows or wikipedia_only(rows):
            recent = x.y >= today.year - 1
            age = (today - entry.created_at.date()).days
            if not (recent and age <= policy.get("grace_days")):
                out.append("no supporting source other than Wikipedia" + (f" (grace period of {policy.get('grace_days')} days is over)" if recent else ""))
    return out


def publish_entry(slug: str, *, override: str = "", today: date | None = None) -> str:
    """Set an entry's status to published if the rule allows (inside revising())."""
    require_revising()
    entry = Entry.objects.get(slug=slug)
    found = problems(entry, today)
    if found and not override:
        raise PublishBlocked(slug, found)
    if found:
        ctx = current()
        with revising(ctx.actor, reason=f"{ctx.reason} | published despite: {'; '.join(found)} — {override}"[:2000], task=ctx.task_id):
            return services.set_status(slug, Status.PUBLISHED)
    return services.set_status(slug, Status.PUBLISHED)
