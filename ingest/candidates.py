"""Shared helpers for the source jobs: dates as the timeline writes them, candidate upserts keyed by `source_key`,
attaching entities to documents and candidates, and the cheap alias matcher for text without wikilinks (news items).
"""

import re
from collections import Counter
from datetime import date, datetime

from django.db.models import Count

from evidence.models import Publisher
from evidence.publishers import defaults_for, domain_of

from .models import Candidate, DocumentEntity, Entity

MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def when_text(d: date) -> str:
    """"November 20, 2026" (SCHEMA.md style)."""
    return f"{MONTH_NAMES[d.month - 1]} {d.day}, {d.year}"


def decimal_year(d: date) -> float:
    """The timeline's `y` for a day: year + (day of year − 1) / days in year, to 3 places (June 26, 1945 → 1945.482)."""
    start = date(d.year, 1, 1)
    days = (date(d.year + 1, 1, 1) - start).days
    return round(d.year + (d - start).days / days, 3)


def first_sentence(text: str, limit: int = 200) -> str:
    m = re.match(r"(.+?[.!?])(\s|$)", text)
    s = m.group(1) if m else text
    if len(s) > limit:
        s = s[:limit].rsplit(" ", 1)[0] + " …"
    return s


def upsert_candidate(source_key: str, *, created_by: str, values: dict, entities=None, documents=None) -> tuple[Candidate, str]:
    """Create or refresh a candidate by its source key. Review state (status, decisions, result) is never touched
    here; the routing, duplicate and priority fields belong to the `process` job. → (candidate, "new"|"changed"|"unchanged")"""
    c = Candidate.objects.filter(source_key=source_key).first()
    state = "new"
    values = dict(values)
    new_details = values.pop("details", None)
    if c is None:
        c = Candidate(source_key=source_key, created_by=created_by)
    else:
        same = all(getattr(c, k) == v for k, v in values.items())
        if new_details is not None:
            same = same and all(c.details.get(k) == v for k, v in new_details.items())
        state = "unchanged" if same else "changed"
    for k, v in values.items():
        setattr(c, k, v)
    if new_details is not None:
        # The source owns the keys it writes; the process job's keys (routing, duplicates, priority) are kept.
        c.details = {**(c.details or {}), **new_details}
    if state != "unchanged":
        c.save()
    if entities is not None:
        want = {e.pk for e in entities}
        have = set(c.entities.values_list("pk", flat=True))
        if want != have:
            c.entities.set(list(want))
            state = "changed" if state == "unchanged" else state
    if documents is not None:
        want = {d.pk for d in documents}
        if want != set(c.documents.values_list("pk", flat=True)):
            c.documents.set(list(want))
    return c, state


def set_document_entities(doc, mentions: Counter):
    """mentions: {Entity: count}. Salience = count / the document's highest count."""
    top = max(mentions.values(), default=1)
    DocumentEntity.objects.filter(document=doc).exclude(entity__in=list(mentions)).delete()
    for e, n in mentions.items():
        DocumentEntity.objects.update_or_create(document=doc, entity=e, defaults={"mentions": n, "salience": round(n / top, 3)})


def publisher_for(url: str, *, actor: str = "job:ingest"):
    """The Publisher for a URL's domain, created with the known defaults if new (a canonical write, so in revising())."""
    from revisions import revising

    domain = domain_of(url)
    if not domain:
        return None
    p = Publisher.objects.filter(domain=domain).first()
    if p:
        return p
    with revising(actor, reason=f"new publisher seen by ingestion: {domain}"):
        p, _ = Publisher.objects.get_or_create(domain=domain, defaults=defaults_for(domain))
    return p


# Alias matching ------------------------------------------------------------------------------------------------
TOKEN_RE = re.compile(r"[\w'’.-]+", re.U)
MATCH_KINDS = ("person", "polity", "place", "org", "event")


class AliasMatcher:
    """Proper-noun n-grams (1–6 words, capitalized in the text) looked up in the labels and aliases of known entities.

    Ambiguous names go to the entity mentioned in the most documents (ties: the lower QID number), so the result is
    deterministic. Only entities of MATCH_KINDS with names of 4+ characters take part, which keeps common words out.
    """

    def __init__(self, entities=None):
        qs = entities if entities is not None else Entity.objects.filter(kind__in=MATCH_KINDS).annotate(n=Count("documententity"))
        index: dict[str, tuple] = {}
        for e in qs:
            n = getattr(e, "n", 0)
            for name in [e.label, *(e.aliases or [])]:
                key = " ".join(name.split()).lower()
                if len(key) < 4 or not any(ch.isalpha() for ch in key):
                    continue
                rank = (-n, int(e.qid[1:]))
                if key not in index or rank < index[key][0]:
                    index[key] = (rank, e)
        self.index = {k: v[1] for k, v in index.items()}
        self.max_words = 6

    def match(self, text: str) -> Counter:
        tokens = [t.strip(".,'’") for t in TOKEN_RE.findall(text or "")]
        found = Counter()
        i = 0
        while i < len(tokens):
            hit = None
            for n in range(min(self.max_words, len(tokens) - i), 0, -1):
                words = tokens[i:i + n]
                if not words[0][:1].isupper():
                    break
                e = self.index.get(" ".join(words).lower())
                if e:
                    hit = (e, n)
                    break
            if hit:
                found[hit[0]] += 1
                i += hit[1]
            else:
                i += 1
        return found


def parse_any_date(value) -> date | None:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    from .extract import parse_date

    dt = parse_date(str(value or ""))
    return dt.date() if dt else None
