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
numbers. Actors are runs of capitalized words (with up to two of "de", "of", "the" … between them, and an "al-" before),
less what `junk_actor()` rejects: sentence-initial function words and lowercase articles ("the Franks" is "Franks"),
month names and fragments ending in one ("the March 1983 election", "ASEAN Declaration of August 8"), single letters
("U.S." is not "U" and "S"), lone common words (`COMMON_WORDS`: "Literature", "Republic", "Games"), hyphenated
adjectives ("US-led"), a possessive mark and a sentence-opening participle ("Proclaimed British"). "New", "Great",
"Old", ordinals and numbers stay at the front of a name they begin ("New Zealand", "Three Kingdoms", "First World
War"). The sources' own names (Wikipedia, Britannica …) are left out; with ingest's `Entity` rows, an exact label
match counts too. It is a heuristic: it errs toward claims an agent can quickly dismiss rather than toward missing one.

`sync(entry)` makes an entry's children match what the splitter derives, writing only differences: a new part is
created; a part that disappeared is deleted unless something has checked it (then it is kept and marked for recheck,
reason "value_changed"); a part whose value changed keeps its evidence and is marked for recheck the same way. An
actor claim that `junk_actor()` rejects (made before these rules, or a fragment of a name now found whole) is left as
it is: removing those is the owner's decision, and `facts sweep --junk-actors --dry-run` reports them (ADR 0025).
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
# Words in NOT_NAMES that begin real names when another capitalized word follows ("New Zealand", "Great Britain",
# "Three Kingdoms", "First World War", "Old World"): kept then, stripped only when they stand alone.
NAME_PREFIXES = {"New", "Great", "Old", "First", "Second", "Third", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"}
DAYS = set("Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split())
SEASONS = {"Spring", "Summer", "Autumn", "Fall", "Winter"}
# Lone capitalized words that are ordinary English nouns and adjectives, not actors: what is left of a longer name
# ("Nobel Prize in Literature" → "Literature", "the People's Republic" → "Republic") or a sentence's capitalized
# first word. Collected from the actor claims the splitter made on the archive corpus (ADR 0025); institutions that
# act on their own (Congress, Parliament, the Senate, the Crown) are not in it.
COMMON_WORDS = set(
    """Literature Physics Chemistry Medicine Economics Peace Science Sciences Philosophy History Art Arts Music Poetry
    Republic Kingdom Kingdoms Empire Empires Dynasty Dynasties State States Nation Nations Union Federation Confederation
    Province Colony Dominion Territory Island Islands World War Wars Battle Revolution Revolt Uprising Rebellion Coup Riots
    Protests Strike Crusade Campaign Expedition Invasion Siege Treaty Accord Agreement Pact Charter Declaration Act Bill Law
    Laws Amendment Article Resolution Constitution Convention Referendum Proclamation Order Council Commission Committee
    Assembly League Association Society Company Academy Institute Organization Museum Party Movement Coalition Opposition
    Military Army Navy Police Government Court Church Temple Mosque Palace House Hall Wall Park Tower Bridge Games Prize
    Award Medal Cup People Women Men Children Voters Soldiers Kings Princes Communities Man Child Youth
    West Western East Eastern North Northern South Southern Southeast Central Middle Upper Lower Black White Red Native
    Indigenous Allied Civil Royal Federal National International Imperial Nuclear Economic Presidential Constitutional
    Communist Socialist Nationalist Conservative Liberal Democratic Earliest Oldest Largest Longest Biggest Former Disputed
    Main Annual Nationwide Coastal Digital Mobile Artificial Analytic Mature Rooted Launched
    Age Era Period Year Years Day Night Time Times Life Land Way Place End Fall Return Trial Test Deal Ban Emergency
    Famine Drought Earthquake Magnitude Flight Sinking Defeat Partition Construction Development Progress Reform Trade
    Oil Water Stone Iron Copper Rice Wheat Maize Pottery Writing Language Religion Power Capital Security Freedom Equality
    Democracy Slavery Truth Nature Book Books Story Song Album Letter Essay Essays Chronicle Narrative Treatise Magazine
    Theater Cinema Radio Video Jazz Rock Football Introduction Guide Classic Classics Method Structure Vision Voice Being
    Mass Secretary President Governor Viceroyalty Envoys Embassies""".split()
)
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
# Up to two connectors between capitalized words: "Republic of the Congo", "Juana Inés de la Cruz".
NAME_RE = re.compile(_W + r"(?:(?:\s+(?:(?:" + "|".join(CONNECTORS) + r")\s+){0,2}(?:al-)?|[–-])" + _W + r")*")
ARTICLE_PREFIX = re.compile(r"^(?:the|of|y)\s+")  # a lowercase article or preposition left at a run's front
PARTICLE_BEFORE = re.compile(r"(?:^|(?<=\s))(al|el|ad|an|as|at|az|ar)-$")  # "al-Qaeda": the particle before the run's capital
TRAILING_MONTH = re.compile(r"\s+of\s+(?:" + MONTH_RE + r")$")  # "ASEAN Declaration of August (8, 1967)"
# A sentence's capitalized first word ending in -ed is a participle ("Proclaimed British", "Launched November") only
# before a month or a people's name, and never one of these (names and words that begin names).
KEEP_ED = set("""United Federated Reformed Unified Painted Mohammed Muhammed Mehmed Ahmed Khaled Saeed Rasheed Waleed Hamed Alfred
    Wilfred Manfred Siegfried Winifred Mildred Ethelred Æthelred Fred Ned Ted""".split())
PEOPLE_RE = re.compile(r"^[A-Z]\w*(?:ish|ese|ans?|ians?)$|^(?:" + "|".join(MONTHS) + r")$")
NUMBERED = NAME_PREFIXES - {"New", "Great", "Old"}
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


def _prefix_belongs(words: list[str]) -> bool:
    """Whether a run's "New", "Great" or "Old" (always) or ordinal or number begins its name: a numbered name ends
    in a common noun or a plural ("First World War", "Second Temple", "Three Kingdoms", "Four Books"), where
    "Two French DGSE agents" or "First Maya cities" don't."""
    if words[0] not in NUMBERED:
        return True
    return any(w in COMMON_WORDS or (w.endswith("s") and not w.isupper()) for w in words[1:])


def junk_actor(name: str, derived: list[str] = ()) -> str | None:
    """Why `name` is not an actor, or None if it may be one. The rules actors() applies before it keeps a name, and
    what `facts sweep --junk-actors` reports on the actor claims already made. With `derived` (the names the splitter
    now finds in the same entry), a name that is only part of one of them ("Zealand" of "New Zealand") is a fragment."""
    name = (name or "").strip()
    words = name.split()
    if not words:
        return "empty"
    if words[0] in ("the", "of", "y") or (words[0] in NOT_NAMES and words[0] not in NAME_PREFIXES) or name in NOT_NAMES:
        return "article"
    if len(name.replace(".", "")) == 1:
        return "letter"
    if words[0] in MONTHS or name in DAYS or name in SEASONS or TRAILING_MONTH.search(name) or re.fullmatch(rf"(?:the|of)\s+(?:{MONTH_RE})", name):
        return "month"
    if len(words) == 1 and (name in COMMON_WORDS or re.fullmatch(r"[^\W\d_][\w’']*(?:-[a-z][\w’']*)+", name) and not name.isupper()):
        return "common word"  # "Literature"; "US-led", "Second-wave" (a hyphenated word ending in lowercase)
    if name.endswith(("’", "'")):
        return "possessive"
    if len(words) == 2 and words[0].endswith("ed") and "-" not in words[0] and words[0] not in KEEP_ED and PEOPLE_RE.match(words[1]):
        return "participle"  # "Proclaimed British", "Launched November"
    if name in NAME_PREFIXES:
        return "article"
    low = f" {name.lower()} "
    for d in derived:
        if d != name and len(d) > len(name) and f" {d.lower().replace('-', ' ')} ".find(low.replace("-", " ")) >= 0:
            return "fragment"
    return None


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
            whole = len(words)
            # Strip what opens a run without being part of the name: function words ("After the March …"), lowercase
            # articles a connector let in ("the Franks"), and a capitalized participle opening a sentence of the text
            # before a single word ("Proclaimed British", "Launched November"). "New", "Great", "Three", "First" …
            # stay when they begin a name ("New Zealand", "Three Kingdoms", "First World War"; not "Two French …").
            while words:
                w = words[0]
                if w in NAME_PREFIXES and len(words) > 1 and words[1][:1].isupper() and _prefix_belongs(words):
                    break
                if w in NOT_NAMES or w.lower() in CONNECTORS and w.islower():
                    words = words[1:]
                elif (si > 0 and m.start() == 0 and len(words) == 2 and w.endswith("ed") and "-" not in w and w not in KEEP_ED
                      and w not in later and PEOPLE_RE.match(words[1])):
                    words = words[1:]
                else:
                    break
            while words and words[-1].lower() in CONNECTORS:
                words = words[:-1]
            if not words:
                continue
            words[-1] = words[-1].rstrip("’'")  # "the Communists’ victory": the possessive mark goes
            name = " ".join(words)
            name = TRAILING_MONTH.sub("", name)  # "Rio Protocol of January (29, 1942)" → "Rio Protocol"
            if (p := PARTICLE_BEFORE.search(sent[: m.start()])) and len(words) == whole:
                name = f"{p.group(1)}-{name}"  # "al-Qaeda", not "Qaeda"
            if not name or junk_actor(name) or name in SOURCES or re.fullmatch(r"[IVXLC]+", name):
                continue
            if len(name) < 3 and not name.isupper():
                continue
            # A lone capitalized word opening a sentence of the text ("Soldiers …") is a name only if it is
            # capitalized elsewhere too; the title's first word is usually its subject.
            if m.start() == 0 and len(words) == whole and si > 0 and " " not in name and name not in later:
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
    stats = {"created": 0, "updated": 0, "deleted": 0, "kept": 0, "junk_kept": 0}
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
    derived_names = [v["name"] for (field, _), v in desired.items() if field == "actor"]
    for k, c in have.items():
        if k in desired:
            continue
        if c.field == "actor" and junk_actor((c.value or {}).get("name", ""), derived_names):
            # An actor claim the splitter now rejects as junk stays as it is until the owner decides what to do with
            # them (`facts sweep --junk-actors --dry-run` reports them; ADR 0025): never deleted or rechecked here.
            stats["junk_kept"] += 1
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
