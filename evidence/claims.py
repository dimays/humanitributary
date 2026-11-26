"""The claim splitter: atomic claims derived from an entry, deterministically (docs/fact-checking.md, "Atomic claims").

An entry's legacy "as written" claim covers its whole record. Evidence is more useful when it attaches to the part it
supports, so each entry also gets child claims (`Claim.parent` = the "as written" claim):

| field      | key                    | value                                                     |
|------------|------------------------|-----------------------------------------------------------|
| `date`     | "" (event), "start"/"end" (branch) | {"when": …, "y": …, "end": …}                  |
| `location` | ""                     | {"scope", "label", "lat", "lon"} from TL.geo (place/region) |
| `number`   | the number's phrase, kebab-cased | {"text": "about 2,500", "value": 2500, "unit": "survived", "sentence": 2} |
| `actor`    | the name, kebab-cased  | {"name": "Diego Velázquez"}                                 |

Numbers are counts, magnitudes and percentages: years, days of the month, ordinals and decades are dates, not
numbers. Actors are runs of capitalized words (with "de", "of", "al-" … inside), less month names, sentence-initial
function words and the sources' own names (Wikipedia, Britannica …); with ingest's `Entity` rows, an exact label match
counts too. It is a heuristic: it errs toward claims an agent can quickly dismiss rather than toward missing one.

`sync(entry)` makes an entry's children match what the splitter derives, writing only differences: a new part is
created; a part that disappeared is deleted unless something has checked it (then it is kept and marked for recheck,
reason "value_changed"); a part whose value changed keeps its evidence and is marked for recheck the same way.
"""

import re
from datetime import date

from django.utils import timezone

from timeline.models import Branch, Entry, Event, Location

MONTHS = "January February March April May June July August September October November December".split()
MONTH_RE = "|".join(MONTHS + [m[:3] + r"\." for m in MONTHS])
SCALE = {"thousand": 1e3, "million": 1e6, "billion": 1e9, "trillion": 1e12, "hundred": 1e2}

# Words that start a sentence or a name-like run but are not names.
NOT_NAMES = set(
    """A An The This That These Those Its It His Her Their Our In On At By For From To Of And Or But After Before
    During Under Over Into With Without Within Between Among About Around Against Through Since Until Upon While When
    Where Which Who Whose What Why How As Also Then Later Earlier Early Late Some Many Most Several Each Every Both
    Other Others Another One Two Three Four Five Six Seven Eight Nine Ten First Second Third Last New Old Great
    Here There Today Now Once Than Only Even Still Yet So Such Not No Nor Its Ancient Modern Medieval Classical
    BCE CE AD BC Mya Ma ka I II III IV V VI VII VIII IX X They He She We You Mr Mrs Dr St Saint""".split()
)
SOURCES = {"Wikipedia", "Britannica", "Encyclopaedia Britannica", "Met", "The Met", "World History Encyclopedia", "UNESCO World Heritage Centre", "Cornell", "BBC", "USGS"}
CONNECTORS = {"de", "da", "del", "della", "di", "du", "des", "la", "le", "of", "the", "von", "van", "der", "den", "al", "el", "bin", "ibn", "y"}
NOT_UNITS = {"of", "the", "and", "to", "in", "on", "at", "by", "for", "from", "or", "a", "an", "as", "is", "was", "were", "are", "with", "that", "than", "into"}

NUMBER_RE = re.compile(
    r"(?P<qual>\b(?:about|some|more than|over|nearly|almost|up to|at least|around|roughly|approximately|c\.|fewer than|under)\s+)?"
    r"(?<![\w.,/-])(?P<num>\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)(?![\w,]\d|\w|[.]\d)"
    r"(?P<pct>\s*(?:%|percent\b|per cent\b))?"
    r"(?:\s+(?P<scale>thousand|million|billion|trillion|hundred)\b)?"
    r"(?:(?:\s+|-)(?P<unit>(?:square |cubic )?[a-zA-Z][\w’'-]*))?"
)
YEARISH_UNIT = re.compile(r"^(BCE|CE|AD|BC|B\.C\.|A\.D\.)$")
_W = r"[A-ZÀ-ÖØ-Þ](?:[\w-]|[’'](?!s\b))*"  # a capitalized word; a possessive ’s ends the name
NAME_RE = re.compile(_W + r"(?:(?:\s+(?:(?:" + "|".join(CONNECTORS) + r")\s+)?(?:al-)?|[–-])" + _W + r")*")
SENTENCE_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z“\"(])")


def slugify(s: str, n: int = 90) -> str:
    s = re.sub(r"[^\w]+", "-", s.lower(), flags=re.UNICODE).strip("-")
    return s[:n].strip("-") or "x"


def sentences(text: str) -> list[str]:
    return [s for s in SENTENCE_RE.split(text or "") if s.strip()]


def numbers(text: str) -> list[dict]:
    """Counts, magnitudes and percentages in the text, in order (dates and ordinals left out)."""
    out = []
    for si, sent in enumerate(sentences(text)):
        for m in NUMBER_RE.finditer(sent):
            raw, unit, scale, pct = m["num"], (m["unit"] or ""), m["scale"], bool(m["pct"])
            value = float(raw.replace(",", ""))
            before = sent[: m.start("num")]
            after = sent[m.end("num"):]
            if re.search(r"\d\s*[–-]\s*$", before) and not pct and not scale:  # the end of a range like 460–480
                continue
            if re.match(r"[–-]\d", after) and not pct and not scale and value >= 100 and "," not in raw:
                continue  # the start of a year range
            if re.search(rf"\b({MONTH_RE})\s*$", before):  # "May 25", "April 12, 1797"
                continue
            if re.search(rf"\b({MONTH_RE})\s+\d{{1,2}},\s*$", before):
                continue
            if YEARISH_UNIT.match(unit) or re.match(r"^(BCE|CE|AD|BC)\b", after.strip()):
                continue
            if after.startswith("s") or re.match(r"^(st|nd|rd|th)\b", after):  # decades, ordinals
                continue
            is_int = "." not in raw
            if not pct and not scale and is_int and "," not in raw and 1000 <= value <= 2100:
                continue  # a year
            spans_to_count = bool(re.match(r"\s+to\s+\d{1,3}(,\d{3})+", after))  # "from 300 to 10,000 dead"
            if not spans_to_count and not pct and not scale and is_int and "," not in raw and value >= 100 and re.search(r"\b(in|by|from|since|until|to|of|after|before|around|c\.|circa|between|and|year|years|the)\s*$", before, re.I) and not unit:
                continue
            if not spans_to_count and re.search(r"\b(in|by|from|since|until|after|before|c\.|circa)\s*$", before) and is_int and "," not in raw and 100 <= value <= 2100 and not pct and not scale:
                continue
            if pct:
                unit = "%"
            elif unit.lower() in NOT_UNITS:
                unit = ""
            if scale:
                value *= SCALE[scale]
            if unit.lower() in ("bce", "ce"):
                continue
            end = m.end("pct") if pct else (m.end("unit") if unit else (m.end("scale") if scale else m.end("num")))
            text_ = sent[m.start():end].strip()
            out.append({"text": text_, "value": value, "unit": unit, "sentence": si})
    return out


def actors(title: str, text: str, entity_labels: list[str] = ()) -> list[str]:
    """Named actors (people, states, groups, places), in order of first mention, without duplicates."""
    found, seen = [], set()
    blob = f"{title}. {text}"
    later = set()  # words seen capitalized somewhere other than a sentence's start
    for sent in sentences(blob):
        for m in NAME_RE.finditer(sent):
            if m.start() > 0:
                later.update(m.group(0).split())
    for si, sent in enumerate(sentences(blob)):
        for m in NAME_RE.finditer(sent):
            words = m.group(0).split()
            while words and words[0] in NOT_NAMES:
                words = words[1:]
            while words and words[-1].lower() in CONNECTORS:
                words = words[:-1]
            if not words:
                continue
            name = " ".join(words).rstrip("’'s").strip() if words[-1].endswith(("’s", "'s")) else " ".join(words)
            if not name or name in NOT_NAMES or name in SOURCES or name.split()[0] in MONTHS or re.fullmatch(r"[IVXLC]+", name):
                continue
            if len(name) < 3 and not name.isupper():
                continue
            # A lone capitalized word opening a sentence of the text ("Soldiers …") is a name only if it is
            # capitalized elsewhere too; the title's first word is usually its subject.
            if m.start() == 0 and si > 0 and " " not in name and name not in later:
                continue
            key = name.lower()
            if key not in seen:
                seen.add(key)
                found.append(name)
    for label in entity_labels:
        if label.lower() not in seen and re.search(rf"\b{re.escape(label)}\b", blob):
            seen.add(label.lower())
            found.append(label)
    return found


def derive(entry: Entry, location: Location | None = None, entity_labels: list[str] = ()) -> dict[tuple[str, str], dict]:
    """(field, key) → value for every atomic claim the splitter finds in an entry."""
    x = entry if type(entry) is not Entry else entry.concrete
    out = {}
    if isinstance(x, Event):
        out[("date", "")] = {"when": x.when, "y": x.y, "end": x.end}
        title, text = x.title, x.text
    else:
        assert isinstance(x, Branch)
        out[("date", "start")] = {"when": x.start_when, "y": x.start}
        if x.end is not None or x.end_when:
            out[("date", "end")] = {"when": x.end_when or "", "y": x.end}
        title, text = x.name, x.text
    if location is not None and location.scope in ("place", "region"):
        out[("location", "")] = {"scope": location.scope, "label": location.label, "lat": location.lat, "lon": location.lon}
    for n in numbers(text):
        key = slugify(n["text"])
        if ("number", key) not in out:
            out[("number", key)] = n
    for name in actors(title, text, entity_labels)[:8]:
        out.setdefault(("actor", slugify(name)), {"name": name})
    return out


def sync(entry: Entry, parent, existing: list, *, location=None, entity_labels=(), today: date | None = None, pending: list | None = None) -> dict:
    """Make an entry's child claims match derive(). `parent`: its "as written" claim; `existing`: its children (with
    `evidence_count` annotated). Inside revising(). New claims are created here, or appended to `pending` for the
    caller to bulk-create. Returns counts."""
    from timeline.services import apply_changes, delete

    from .models import Claim

    today = today or date.today()
    desired = derive(entry, location, entity_labels)
    have = {(c.field, c.key): c for c in existing}
    stats = {"created": 0, "updated": 0, "deleted": 0, "kept": 0}
    new = []
    for (field, key), value in desired.items():
        c = have.get((field, key))
        if c is None:
            new.append(Claim(entry=entry, parent=parent, field=field, key=key, value=value))
            continue
        changes = {"value": value}
        if c.value != value and getattr(c, "evidence_count", 0):
            changes |= {"recheck_after": today, "recheck_reason": "value_changed", "recheck_requested_at": timezone.now()}
        if apply_changes(c, changes) == "updated":
            stats["updated"] += 1
    stats["created"] += len(new)
    if pending is not None:
        pending.extend(new)
    elif new:
        Claim.objects.bulk_create(new, batch_size=1000)
    for k, c in have.items():
        if k in desired:
            continue
        if getattr(c, "evidence_count", 0):
            if c.recheck_reason == "value_changed":
                continue
            if apply_changes(c, {"recheck_after": min(c.recheck_after or today, today), "recheck_reason": "value_changed", "recheck_requested_at": timezone.now()}) == "updated":
                stats["kept"] += 1
        else:
            delete(c)
            stats["deleted"] += 1
    return stats
