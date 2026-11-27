"""A reviewer's verdicts as an edit file, applied in one audited transaction (docs/adr/0023-edit-files.md).

    manage.py apply_edits var/reviews/2026-11-26-round1.edits.json --actor human:owner [--dry-run | --validate-only]

An edit file is a JSON list of operations, each with an `op` and a `reason` (and optionally a `note`, kept in the
file only):

| op | does |
|---|---|
| `edit` | change an event's `title`, `text`, `y`, `end`, `when`, `branch`, `links` (branch slugs, in order) and `imp` (a branch: `text` only); `add_cites` / `remove_cites` change the record claim's sources |
| `rename` | change an entry's slug (`to`); every reference is a foreign key, so history and links follow |
| `approve` | a `review` entry → `published`, through `evidence.publishing.publish_entry` (the rule applies; `override` is recorded) |
| `reject` | a `draft` or `review` entry → `retracted` |
| `add_evidence` | a citation's stance (and a verbatim excerpt of at most 25 words) on one of the entry's claims, through `record_evidence` |
| `resolve_conflict` | the entry's conflicting evidence (or one claim's, or some URLs') marked resolved, and the claims recomputed |
| `add_branch` | a new branch (`branch`: SCHEMA's Branch keys, with its `cites`), its `origin` (TL.origin) and `geo` (TL.geo); in review, or `status: "published"` through the publishing rule |
| `add_event` | a new event (`event`: SCHEMA's Event keys, `link` or `links`, `cites`) and its `geo`; in review, or published through the rule |
| `add_connection` | a connection (TL.enrich) from `entry` to `to` with a `note`; an entry without "why it matters" text needs `why` and `cites` too |

An op may name an entry an earlier op in the same file adds (an event on a new branch, a connection to a new event);
a later op is too late, since the ops run in order.

Everything is checked before anything is written (`check`: the shape of every op, the SCHEMA limits, https cites and
never openstax.org, slugs, branches and regions), then applied in order inside one `revising(actor)` block, each op in its own
nested block whose reason names the file, the op and its `reason`. Every problem, from either pass, is listed and
then nothing is kept; a dry run rolls back the same way after printing the Revisions it would have written.
"""

import json
import re
from collections import Counter
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from urllib.parse import unquote, urlsplit

from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import DatabaseError, connection, transaction
from django.db.models import Max, TextField
from django.db.models.functions import Cast
from django.utils import timezone

from evidence import publishing
from evidence.conflicts import citation_for
from evidence.models import OPENSTAX_RE, Citation, Claim, Evidence
from evidence.publishers import domain_of
from evidence.services import STANCES, record_evidence
from evidence.sweep import reassess_all, split_all
from revisions import revising
from revisions.context import ACTOR_RE
from revisions.models import Revision

from . import services
from .models import HOWS, SLUG_RE, Branch, BranchLink, Connection, Entry, EventLink, Location, Region, Status

TITLE_MAX, TEXT_MAX, EXCERPT_WORDS = 60, 240, 25  # site/SCHEMA.md; evidence_excerpt_25_words
ORIGIN_NOTE_MAX, ORIGIN_LINK_NOTE_MAX, CONNECTION_NOTE_MAX, WHY_MAX, NAME_MAX = 300, 100, 90, 700, 200  # site/SCHEMA.md
COMMON = {"op", "reason", "note"}
KEYS = {  # op → (required, optional)
    "edit": ({"entry"}, {"fields", "add_cites", "remove_cites"}),
    "rename": ({"entry", "to"}, set()),
    "approve": ({"entry"}, {"override"}),
    "reject": ({"entry"}, set()),
    "add_evidence": ({"entry", "url", "stance"}, {"claim", "title", "excerpt", "method", "found"}),
    "resolve_conflict": ({"entry"}, {"claim", "urls"}),
    "add_branch": ({"branch"}, {"origin", "geo", "status", "override"}),
    "add_event": ({"event"}, {"geo", "status", "override"}),
    "add_connection": ({"entry", "to", "note"}, {"why", "cites"}),
}
ADDS = {"add_branch": "branch", "add_event": "event"}  # op → the key holding the new entry (its id is the op's entry)
BRANCH_KEYS = ({"id", "name", "region", "start", "startWhen", "text", "cites"}, {"end", "endWhen", "parents", "into"})
EVENT_KEYS = ({"id", "branch", "y", "when", "title", "text", "imp", "cites"}, {"end", "link", "links"})
GEO_KEYS = {"scope", "lat", "lon", "r", "label", "src", "scale"}
SCOPES = set(Location.Scope.values)
SCALES = set(Location.Scale.values)
NEW_STATUSES = ("review", "published")
EVENT_FIELDS = {"title", "text", "y", "end", "when", "branch", "links", "imp"}
BRANCH_FIELDS = {"text"}
CITE_KEYS = {"t", "u", "k", "stance", "method", "excerpt"}
KINDS = set(Citation.Kind.values)
CITE_STANCES = ("supports", "partial")  # a cite is a published source: only these are shown (publish/export.py)
METHODS = ("agent_read", "browser_read", "human")
CLAIM_FIELDS = set(Claim.Field.values)


class EditsInvalid(Exception):
    def __init__(self, problems):
        super().__init__(f"{len(problems)} problem(s):\n" + "\n".join(f"  - {p}" for p in problems))
        self.problems = problems


class _Problem(Exception):
    """One op can't be applied as written (an unknown entry, a cite that isn't there …)."""


class _Rollback(Exception):
    pass


@dataclass
class Outcome:
    ops: list = field(default_factory=list)  # (index, op dict, notes, diff lines)
    counts: Counter = field(default_factory=Counter)
    revisions: int = 0
    applied: bool = False
    txid: int | None = None  # the transaction's id: every Revision the file wrote carries it (Revision.txid)


def load(path: str | Path) -> list:
    try:
        data = json.loads(Path(path).read_text())
    except (OSError, json.JSONDecodeError) as e:
        raise EditsInvalid([f"{path}: {e}"]) from e
    if not isinstance(data, list):
        raise EditsInvalid([f"{path}: an edit file is a JSON list of operations"])
    return data


def norm_url(u: str) -> str:
    """For matching a cite by URL: percent-decoding, case of scheme and host, www. and a trailing slash don't count."""
    p = urlsplit(unquote(u.strip()))
    host = (p.hostname or "").lower().removeprefix("www.")
    return f"{p.scheme.lower()}://{host}{p.path.rstrip('/')}" + (f"?{p.query}" if p.query else "")


def words(s: str) -> int:
    return len((s or "").split())


def target(op) -> str | None:
    """The entry an op is about: its `entry`, or the id of the entry an add_branch / add_event creates."""
    if not isinstance(op, dict):
        return None
    if op.get("op") in ADDS:
        new = op.get(ADDS[op["op"]])
        return new.get("id") if isinstance(new, dict) and isinstance(new.get("id"), str) else None
    return op["entry"] if isinstance(op.get("entry"), str) else None


def _label(i: int, op) -> str:
    if not isinstance(op, dict):
        return f"#{i}"
    t = target(op)
    return f"#{i} {op.get('op', '?')}" + (f" {t}" if t else "")


def _url_problems(u, where: str) -> list[str]:
    if not isinstance(u, str) or not u:
        return [f"{where}: a URL is required"]
    if not u.startswith("https://"):
        return [f"{where}: {u} is not https (SCHEMA citation rule 5; the citation table refuses anything else)"]
    if re.match(OPENSTAX_RE, u, re.I):
        return [f"{where}: {u} is openstax.org, which is never cited (AGENTS.md rule 6)"]
    return []


def _excerpt_problems(x, where: str) -> list[str]:
    if x is None:
        return []
    if not isinstance(x, str):
        return [f"{where}: excerpt must be a string"]
    if words(x) > EXCERPT_WORDS:
        return [f"{where}: excerpt is {words(x)} words (at most {EXCERPT_WORDS})"]
    return []


def _claim_problems(c, where: str) -> list[str]:
    if c is None:
        return []
    if isinstance(c, str):
        c = {"field": c}
    if not isinstance(c, dict) or set(c) - {"field", "key"} or "field" not in c:
        return [f"{where}: claim is a field name or {{\"field\": …, \"key\": …}}"]
    if c["field"] not in CLAIM_FIELDS:
        return [f"{where}: no claim field {c['field']!r} (one of {sorted(CLAIM_FIELDS)})"]
    if not isinstance(c.get("key", ""), str):
        return [f"{where}: claim key must be a string"]
    return []


def _claim_sel(c) -> tuple[str, str]:
    if c is None:
        return ("as_written", "")
    if isinstance(c, str):
        return (c, "")
    return (c["field"], c.get("key", ""))


def _fields_problems(f, where: str) -> list[str]:
    out = []
    if not isinstance(f, dict) or not f:
        return [f"{where}: fields must be a non-empty object"]
    if extra := set(f) - EVENT_FIELDS:
        out.append(f"{where}: unknown fields {sorted(extra)} (an event has {sorted(EVENT_FIELDS)})")
    if "title" in f and (not isinstance(f["title"], str) or not f["title"].strip() or len(f["title"]) > TITLE_MAX):
        out.append(f"{where}: title must be 1–{TITLE_MAX} characters (is {len(f['title']) if isinstance(f['title'], str) else 'not a string'})")
    if "text" in f and (not isinstance(f["text"], str) or not f["text"].strip() or len(f["text"]) > TEXT_MAX):
        out.append(f"{where}: text must be 1–{TEXT_MAX} characters (is {len(f['text']) if isinstance(f['text'], str) else 'not a string'})")
    if "when" in f and (not isinstance(f["when"], str) or not f["when"].strip()):
        out.append(f"{where}: when must be a non-empty string")
    num = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool)  # noqa: E731
    if "y" in f and not num(f["y"]):
        out.append(f"{where}: y must be a number")
    if "end" in f and f["end"] is not None and not num(f["end"]):
        out.append(f"{where}: end must be a number or null")
    if num(f.get("y")) and num(f.get("end")) and f["end"] <= f["y"]:
        out.append(f"{where}: end ({f['end']}) must be after y ({f['y']})")
    if "imp" in f and f["imp"] not in (1, 2, 3):
        out.append(f"{where}: imp must be 1, 2 or 3")
    if "branch" in f and (not isinstance(f["branch"], str) or not re.match(SLUG_RE, f["branch"])):
        out.append(f"{where}: branch must be a branch slug")
    if "links" in f:
        links = f["links"]
        if not isinstance(links, list) or not all(isinstance(s, str) and re.match(SLUG_RE, s) for s in links):
            out.append(f"{where}: links must be a list of branch slugs")
        elif len(set(links)) != len(links):
            out.append(f"{where}: links name a branch twice")
        elif isinstance(f.get("branch"), str) and f["branch"] in links:
            out.append(f"{where}: an event can't link to its own branch ({f['branch']})")
    return out


def _cite_list_problems(cites: list, where: str, seen: set | None = None) -> list[str]:
    """Each cite's shape: {"t", "u", "k"?} (plus a stance, method and excerpt for the evidence row), no page twice."""
    out, seen = [], set() if seen is None else seen
    for j, c in enumerate(cites):
        w = f"{where}[{j}]"
        if not isinstance(c, dict):
            out.append(f"{w}: a cite is {{\"t\", \"u\", \"k\"?}}")
            continue
        if extra := set(c) - CITE_KEYS:
            out.append(f"{w}: unknown keys {sorted(extra)}")
        if not isinstance(c.get("t"), str) or not c["t"].strip():
            out.append(f"{w}: t (the page's title) is required")
        out += _url_problems(c.get("u"), w)
        if "k" in c and c["k"] not in KINDS:
            out.append(f"{w}: k must be one of {sorted(KINDS)}")
        if c.get("stance", "supports") not in CITE_STANCES:
            out.append(f"{w}: a cite's stance is supports or partial (conflicting evidence goes on a claim: add_evidence)")
        if c.get("method", "agent_read") not in METHODS:
            out.append(f"{w}: method must be one of {METHODS}")
        out += _excerpt_problems(c.get("excerpt"), w)
        if isinstance(c.get("u"), str):
            if norm_url(c["u"]) in seen:
                out.append(f"{w}: {c['u']} is cited twice")
            seen.add(norm_url(c["u"]))
    return out


def _required_cites(cites, where: str) -> list[str]:
    if not isinstance(cites, list) or not cites:
        return [f"{where}: at least one cite is required (SCHEMA citation rules: every claim supported)"]
    return _cite_list_problems(cites, where)


def _str_problems(d: dict, key: str, where: str, most: int, *, required: bool = True) -> list[str]:
    v = d.get(key)
    if v is None and not required:
        return []
    if not isinstance(v, str) or not v.strip() or len(v) > most:
        return [f"{where}: {key} must be 1–{most} characters (is {len(v) if isinstance(v, str) else 'not a string'})"]
    return []


def _num(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _slug_list(v, where: str, key: str, me: str | None) -> list[str]:
    if not isinstance(v, list) or not all(isinstance(s, str) and re.match(SLUG_RE, s) for s in v):
        return [f"{where}: {key} must be a list of branch slugs"]
    if len(set(v)) != len(v):
        return [f"{where}: {key} names a branch twice"]
    if me in v:
        return [f"{where}: {key} names the entry itself ({me})"]
    return []


def _geo_problems(g, where: str) -> list[str]:
    """TL.geo (site/SCHEMA.md, "Location"), as the Location table's constraints and the build check it."""
    w = f"{where} geo"
    if not isinstance(g, dict):
        return [f"{w}: an object {{scope, lat, lon, r, label, src}} or {{scope: global}} / {{scope: cosmic, scale}}"]
    out = []
    if extra := set(g) - GEO_KEYS:
        out.append(f"{w}: unknown keys {sorted(extra)}")
    scope = g.get("scope")
    if scope not in SCOPES:
        return out + [f"{w}: scope must be one of {sorted(SCOPES)}"]
    if scope in ("place", "region"):
        if not (_num(g.get("lat")) and -90 <= g["lat"] <= 90 and _num(g.get("lon")) and -180 <= g["lon"] <= 180):
            out.append(f"{w}: lat must be -90–90 and lon -180–180")
        if not (_num(g.get("r")) and 0 < g["r"] <= 6000):
            out.append(f"{w}: r (km) must be more than 0 and at most 6000")
        if not isinstance(g.get("label"), str) or not g["label"].strip():
            out.append(f"{w}: a label is required")
        out += _url_problems(g.get("src"), f"{w} src")
    elif set(g) & {"lat", "lon", "r", "label", "src"}:
        out.append(f"{w}: a {scope} location has no lat, lon, r, label or src")
    if "scale" in g and (scope != "cosmic" or g["scale"] not in SCALES):
        out.append(f"{w}: scale is only for cosmic scope, one of {sorted(SCALES)}")
    return out


def _status_problems(op, where: str) -> list[str]:
    out = []
    if op.get("status", "review") not in NEW_STATUSES:
        out.append(f"{where}: status must be review or published (a new entry is published through the publishing rule)")
    if "override" in op:
        if not isinstance(op["override"], str) or not op["override"].strip():
            out.append(f"{where}: override must be a non-empty note")
        elif op.get("status") != "published":
            out.append(f"{where}: override is only for status published")
    return out


def _keys_problems(d, keys: tuple[set, set], where: str, what: str) -> list[str]:
    if not isinstance(d, dict):
        return [f"{where}: {what} must be an object"]
    required, optional = keys
    out = []
    if missing := required - set(d):
        out.append(f"{where}: {what} is missing {sorted(missing)}")
    if extra := set(d) - required - optional:
        out.append(f"{where}: {what} has unknown keys {sorted(extra)}")
    return out


def _new_id_problems(slug, where: str) -> list[str]:
    if not isinstance(slug, str) or not re.match(SLUG_RE, slug) or len(slug) > 120:
        return [f"{where}: id must be a kebab-case slug (lowercase letters, digits, hyphens; at most 120)"]
    return []


def _branch_problems(op, where: str) -> list[str]:
    """add_branch: a Branch as site/SCHEMA.md writes it, its origin (TL.origin) and location (TL.geo)."""
    b = op.get("branch")
    out = _keys_problems(b, BRANCH_KEYS, where, "branch")
    if not isinstance(b, dict):
        return out
    me = b.get("id")
    out += _new_id_problems(me, where)
    out += _str_problems(b, "name", where, NAME_MAX)
    out += _str_problems(b, "text", where, TEXT_MAX)
    out += _str_problems(b, "startWhen", where, 300)
    if not isinstance(b.get("region"), str) or not b["region"]:
        out.append(f"{where}: region must be a region's slug")
    if not _num(b.get("start")):
        out.append(f"{where}: start must be a number")
    end = b.get("end")
    if end is not None and not _num(end):
        out.append(f"{where}: end must be a number or null (null: continues to today)")
    if _num(end) and _num(b.get("start")) and end <= b["start"]:
        out.append(f"{where}: end ({end}) must be after start ({b['start']})")
    if end is not None:
        out += _str_problems(b, "endWhen", where, 300)
    elif b.get("endWhen") not in (None, ""):
        out.append(f"{where}: endWhen is only for a branch with an end")
    for key in ("parents", "into"):
        out += _slug_list(b.get(key, []), where, key, me)
    out += _required_cites(b.get("cites"), f"{where} cites")
    if "origin" in op:
        o = op["origin"]
        out += _keys_problems(o, ({"note", "links", "cites"}, set()), where, "origin")
        if isinstance(o, dict):
            out += _str_problems(o, "note", f"{where} origin", ORIGIN_NOTE_MAX)
            links = o.get("links", [])
            if not isinstance(links, list):
                out.append(f"{where} origin: links must be a list (it may be empty)")
                links = []
            ids = []
            for j, link in enumerate(links):
                w = f"{where} origin links[{j}]"
                if not isinstance(link, dict) or set(link) != {"id", "how", "note"}:
                    out.append(f"{w}: a link is {{\"id\", \"how\", \"note\"}}")
                    continue
                ids.append(link["id"])
                if link["how"] not in HOWS:
                    out.append(f"{w}: how must be one of {HOWS}")
                out += _str_problems(link, "note", w, ORIGIN_LINK_NOTE_MAX)
            out += _slug_list(ids, f"{where} origin", "links", me)
            out += _required_cites(o.get("cites"), f"{where} origin cites")
    if "geo" in op:
        out += _geo_problems(op["geo"], where)
    return out + _status_problems(op, where)


def _event_problems(op, where: str) -> list[str]:
    """add_event: an Event as site/SCHEMA.md writes it, and its location."""
    e = op.get("event")
    out = _keys_problems(e, EVENT_KEYS, where, "event")
    if not isinstance(e, dict):
        return out
    out += _new_id_problems(e.get("id"), where)
    out += _fields_problems({k: e[k] for k in ("title", "text", "y", "end", "when", "branch", "imp") if k in e}, where)
    if "link" in e and "links" in e:
        out.append(f"{where}: give link or links, not both")
    links = [e["link"]] if "link" in e else e.get("links", [])
    if "link" in e and not isinstance(e["link"], str):
        out.append(f"{where}: link must be a branch slug")
    else:
        out += _slug_list(links, where, "links", None)
        if isinstance(e.get("branch"), str) and e["branch"] in links:
            out.append(f"{where}: an event can't link to its own branch ({e['branch']})")
    out += _required_cites(e.get("cites"), f"{where} cites")
    if "geo" in op:
        out += _geo_problems(op["geo"], where)
    return out + _status_problems(op, where)


def _connection_problems(op, where: str) -> list[str]:
    """add_connection: a TL.enrich connection, ≤ 90 characters; a `why` (≤ 700) and cites when the entry has none."""
    out = []
    to = op.get("to")
    if not isinstance(to, str) or not re.match(SLUG_RE, to):
        out.append(f"{where}: to must be an entry's slug")
    elif to == op.get("entry"):
        out.append(f"{where}: an entry can't connect to itself")
    out += _str_problems(op, "note", where, CONNECTION_NOTE_MAX)
    out += _str_problems(op, "why", where, WHY_MAX, required=False)
    if "cites" in op:
        out += _required_cites(op["cites"], f"{where} cites")
    return out


def new_links(op) -> set[str]:
    """The branch slugs an add_branch / add_event names (its branch, parents, into, origin links, event links)."""
    if op.get("op") == "add_branch" and isinstance(op.get("branch"), dict):
        b = op["branch"]
        out = {s for k in ("parents", "into") if isinstance(b.get(k), list) for s in b[k]}
        o = op.get("origin")
        if isinstance(o, dict) and isinstance(o.get("links"), list):
            out |= {link.get("id") for link in o["links"] if isinstance(link, dict)}
        return {s for s in out if isinstance(s, str)}
    if op.get("op") == "add_event" and isinstance(op.get("event"), dict):
        e = op["event"]
        out = {e.get("branch"), e.get("link")} | set(e["links"] if isinstance(e.get("links"), list) else [])
        return {s for s in out if isinstance(s, str)}
    return set()


def _cites_problems(op, where: str) -> list[str]:
    out, seen = [], set()
    adds, removes = op.get("add_cites", []), op.get("remove_cites", [])
    if not isinstance(adds, list):
        return [f"{where}: add_cites must be a list"]
    if not isinstance(removes, list):
        return [f"{where}: remove_cites must be a list"]
    out += _cite_list_problems(adds, f"{where} add_cites", seen)
    for j, r in enumerate(removes):
        w = f"{where} remove_cites[{j}]"
        if isinstance(r, dict):
            if set(r) != {"domain"} or not isinstance(r["domain"], str) or not r["domain"]:
                out.append(f"{w}: a URL, or {{\"domain\": …}} to remove every cite from one site")
        elif not isinstance(r, str) or not r.startswith(("https://", "http://")):
            out.append(f"{w}: a URL, or {{\"domain\": …}}")
        elif norm_url(r) in seen:
            out.append(f"{w}: {r} is both added and removed")
    return out


def check(ops: list) -> list[str]:
    """Every problem with the file's shape and limits, without reading any row but the branches and regions it names."""
    out = []
    targets, retired = {}, {}  # a rename's new id → (old id, op); a slug → why a later op can't use it
    added = {}  # an id an add_branch / add_event creates → (its kind, the op's index)
    for i, op in enumerate(ops):
        where = _label(i, op)
        if not isinstance(op, dict):
            out.append(f"{where}: an operation is an object")
            continue
        kind = op.get("op")
        if kind not in KEYS:
            out.append(f"{where}: unknown op {kind!r} (one of {sorted(KEYS)})")
            continue
        required, optional = KEYS[kind]
        if missing := required - set(op):
            out.append(f"{where}: missing {sorted(missing)}")
        if extra := set(op) - required - optional - COMMON:
            out.append(f"{where}: unknown keys {sorted(extra)}")
        if not isinstance(op.get("reason"), str) or not op["reason"].strip():
            out.append(f"{where}: a reason is required")
        if kind in ADDS:
            out += (_branch_problems if kind == "add_branch" else _event_problems)(op, where)
            slug = target(op)
            if slug is None:
                continue
            if slug in added:
                out.append(f"{where}: {slug} is already added by op #{added[slug][1]}")
            elif slug in targets:
                out.append(f"{where}: {slug} is already the new id of {targets[slug][0]} (op #{targets[slug][1]})")
            for ref in sorted(new_links(op)):
                if added.get(ref, ("branch",))[0] != "branch":
                    out.append(f"{where}: {ref} is an event, not a branch")
                if ref in retired:
                    out.append(f"{where}: {ref} {retired[ref]}")
            added[slug] = (ADDS[kind], i)
            retired.pop(slug, None)
            continue
        slug = op.get("entry")
        if not isinstance(slug, str) or not re.match(SLUG_RE, slug):
            out.append(f"{where}: entry must be an entry's slug")
            continue
        if slug in retired:
            out.append(f"{where}: {slug} {retired[slug]}")
        if kind == "edit":
            if "fields" not in op and not op.get("add_cites") and not op.get("remove_cites"):
                out.append(f"{where}: nothing to change (fields, add_cites or remove_cites)")
            if "fields" in op:
                out += _fields_problems(op["fields"], where)
            out += _cites_problems(op, where)
        elif kind == "rename":
            to = op.get("to")
            if not isinstance(to, str) or not re.match(SLUG_RE, to) or len(to) > 120:
                out.append(f"{where}: to must be a kebab-case slug (lowercase letters, digits, hyphens; at most 120)")
            elif to == slug:
                out.append(f"{where}: renames {slug} to itself")
            elif to in targets:
                out.append(f"{where}: {to} is already the new id of {targets[to][0]} (op #{targets[to][1]})")
            elif to in added:
                out.append(f"{where}: {to} is added by op #{added[to][1]}")
            else:
                targets[to] = (slug, i)
                retired[slug] = f"was renamed to {to} in op #{i}: use the new id"
                retired.pop(to, None)
        elif kind == "approve":
            if "override" in op and (not isinstance(op["override"], str) or not op["override"].strip()):
                out.append(f"{where}: override must be a non-empty note")
        elif kind == "reject":
            retired[slug] = f"was rejected in op #{i}"
        elif kind == "add_evidence":
            out += _url_problems(op.get("url"), where)
            if op.get("stance") not in STANCES:
                out.append(f"{where}: stance must be one of {STANCES}")
            if op.get("method", "agent_read") not in METHODS:
                out.append(f"{where}: method must be one of {METHODS}")
            if "title" in op and (not isinstance(op["title"], str) or not op["title"].strip()):
                out.append(f"{where}: title must be a non-empty string")
            if "found" in op and not isinstance(op["found"], dict):
                out.append(f"{where}: found must be an object (what the source says)")
            out += _excerpt_problems(op.get("excerpt"), where)
            out += _claim_problems(op.get("claim"), where)
        elif kind == "resolve_conflict":
            out += _claim_problems(op.get("claim"), where)
            urls = op.get("urls", [])
            if not isinstance(urls, list) or not all(isinstance(u, str) and u for u in urls):
                out.append(f"{where}: urls must be a list of URLs")
        elif kind == "add_connection":
            out += _connection_problems(op, where)
            to = op.get("to")
            if isinstance(to, str) and to in retired:
                out.append(f"{where}: {to} {retired[to]}")
    # Branches and regions named must exist, or be added by an earlier op (a later one is too late: ops run in order).
    named, regions = set(), set()
    for i, op in enumerate(ops):
        if not isinstance(op, dict):
            continue
        refs = set()
        if op.get("op") == "edit" and isinstance(op.get("fields"), dict):
            f = op["fields"]
            if isinstance(f.get("branch"), str):
                refs.add(f["branch"])
            if isinstance(f.get("links"), list):
                refs |= {s for s in f["links"] if isinstance(s, str)}
        elif op.get("op") in ADDS:
            refs = new_links(op)
            if op["op"] == "add_branch" and isinstance(op.get("branch"), dict) and isinstance(op["branch"].get("region"), str):
                regions.add(op["branch"]["region"])
        elif op.get("op") == "add_connection":
            for s in (op.get("entry"), op.get("to")):
                if isinstance(s, str) and s in added and added[s][1] > i:
                    out.append(f"{_label(i, op)}: {s} is added later, by op #{added[s][1]}: move that op first")
        for s in refs:
            if s in added and added[s][1] >= i:
                out.append(f"{_label(i, op)}: {s} is added later, by op #{added[s][1]}: move that op first")
        named |= {s for s in refs if s not in added}
    have = set(Branch.objects.filter(slug__in=named).values_list("slug", flat=True))
    out += [f"branch {s!r} doesn't exist" for s in sorted(named - have)]
    have = set(Region.objects.filter(slug__in=regions).values_list("slug", flat=True))
    out += [f"region {s!r} doesn't exist (one of {', '.join(Region.objects.values_list('slug', flat=True))})" for s in sorted(regions - have)]
    return out


# ── applying ──

def _entry(slug: str) -> Entry:
    e = Entry.objects.filter(slug=slug).first()
    if e is None:
        raise _Problem(f"no entry {slug!r}")
    return e


def _record_claim(entry: Entry) -> Claim:
    c = Claim.objects.filter(entry=entry, field="as_written", key="", parent__isnull=True).first()
    if c is None:
        c = Claim(entry=entry, field="as_written", key="")
        services.apply_changes(c, {"value": {}})
    return c


def _record_value(x) -> dict:
    if x.kind == "event":
        return {"when": x.when, "title": x.title, "text": x.text}
    claim = Claim.objects.filter(entry_id=x.pk, field="as_written", key="", parent__isnull=True).first()
    return {**(claim.value if claim else {}), "text": x.text}


def _resplit(entry: Entry, today: date) -> None:
    split_all(today, entries=[entry.pk])
    reassess_all(today, {}, claim_ids=list(Claim.objects.filter(entry=entry).values_list("pk", flat=True)))


def _known_url(url: str) -> str:
    """The URL as a Citation already has it, when one matches up to norm_url(); else the URL as given."""
    if Citation.objects.filter(url=url).exists():
        return url
    n = norm_url(url)
    host = urlsplit(url).hostname or ""
    for u in Citation.objects.filter(url__icontains=host.removeprefix("www.")).values_list("url", flat=True):
        if norm_url(u) == n:
            return u
    return url


def _find_row(claim: Claim, url: str) -> Evidence | None:
    n = norm_url(url)
    for ev in claim.evidence.select_related("citation").order_by("position"):
        if norm_url(ev.citation.url) == n:
            return ev
    return None


def op_edit(op: dict, actor: str, today: date) -> list[str]:
    entry = _entry(op["entry"])
    x = entry.concrete
    f = dict(op.get("fields") or {})
    notes = []
    if x.kind == "branch" and set(f) - BRANCH_FIELDS:
        raise _Problem(f"{x.slug} is a branch: an edit may change only {sorted(BRANCH_FIELDS)} (and its cites); branch structure goes through proposals")
    if x.kind == "event":
        y = f.get("y", x.y)
        end = f["end"] if "end" in f else x.end
        if end is not None and end <= y:
            raise _Problem(f"end ({end}) must be after y ({y})")
        branch = f.pop("branch", None)
        links = f.pop("links", None)
        if links is not None and (branch or x.branch.slug) in links:
            raise _Problem(f"an event can't link to its own branch ({branch or x.branch.slug})")
        values = {k: f[k] for k in ("title", "text", "y", "end", "when", "imp") if k in f}
        x, r = services.save_event(x.slug, branch=branch, **values)
        notes.append(f"event {r}")
        if links is not None:
            have = {link.branch.slug: link for link in x.event_links.select_related("branch")}
            for slug, link in have.items():
                if slug not in links:
                    services.delete(link)
            for i, slug in enumerate(links):
                link = have.get(slug) or EventLink(event=x, branch=Branch.objects.get(slug=slug))
                services.apply_changes(link, {"position": i})
    elif "text" in f:
        x, r = services.save_branch(x.slug, text=f["text"])
        notes.append(f"branch {r}")
    claim = _record_claim(entry)
    services.apply_changes(claim, {"value": _record_value(x)})
    for r in op.get("remove_cites", []):
        rows = list(claim.evidence.select_related("citation"))
        if isinstance(r, dict):
            hit = [ev for ev in rows if domain_of(ev.citation.url) == r["domain"].lower().removeprefix("www.")]
        else:
            hit = [ev for ev in rows if norm_url(ev.citation.url) == norm_url(r)]
        if not hit:
            raise _Problem(f"remove_cites: {r if isinstance(r, str) else r['domain']} is not one of {x.slug}'s cites ({', '.join(ev.citation.url for ev in rows) or 'none'})")
        for ev in hit:
            services.delete(ev)
            notes.append(f"removed cite {ev.citation.url}")
    for c in op.get("add_cites", []):
        notes.append(_add_cite(claim, c, actor, "add_cites"))
    _resplit(entry, today)
    return notes


def _add_cite(claim: Claim, c: dict, actor: str, where: str = "cites") -> str:
    """A cite as a supporting (or partial) evidence row on a record claim: appended, or the same page's row updated."""
    ev = _find_row(claim, c["u"])
    cit = ev.citation if ev else citation_for(_known_url(c["u"]), c["t"])
    if cit is None:
        raise _Problem(f"{where}: {c['u']} can't be cited (its publisher is forbidden)")
    if ev is None:
        last = claim.evidence.aggregate(m=Max("position"))["m"]
        ev = Evidence(claim=claim, citation=cit, position=0 if last is None else last + 1)
        note = f"added cite {cit.url}"
    else:
        note = f"updated cite {cit.url}"
    services.apply_changes(ev, {
        "stance": c.get("stance", "supports"), "cited_title": c["t"][:500], "cited_kind": c.get("k", ""), "checked_by": actor,
        "method": c.get("method", "agent_read"), "checked_at": timezone.now(), "content_hash": cit.content_hash,
        "excerpt": c["excerpt"] if "excerpt" in c else ev.excerpt,
    })
    return note


def _record(entry: Entry, field: str, value: dict, cites: list, actor: str) -> tuple[Claim, list[str]]:
    """A new entry's record claim (as_written, origin or why) with its cites."""
    claim = Claim.objects.filter(entry=entry, field=field, key="", parent__isnull=True).first() or Claim(entry=entry, field=field, key="")
    services.apply_changes(claim, {"value": value})
    return claim, [_add_cite(claim, c, actor, f"{field} cites") for c in cites]


def _new_entry_free(slug: str) -> None:
    if (have := Entry.objects.filter(slug=slug).first()) is not None:
        raise _Problem(f"{slug} is already an entry's id (a {have.kind}, {have.status}): an add creates a new entry; change one with edit")


def _place(entry: Entry, geo: dict | None) -> list[str]:
    if geo is None:
        return []
    values = {"scope": geo["scope"], "lat": geo.get("lat"), "lon": geo.get("lon"), "radius_km": geo.get("r"), "label": geo.get("label"),
              "src": geo.get("src"), "scale": geo.get("scale")}
    services.apply_changes(Location.objects.filter(entry=entry).first() or Location(entry=entry), values)
    return [f"location {geo.get('label') or geo['scope']}"]


def _publish(entry: Entry, op: dict, today: date) -> list[str]:
    """A new entry starts in review; status "published" moves it through the publishing rule, as approve does."""
    if op.get("status", "review") != "published":
        return ["in review"]
    try:
        publishing.publish_entry(entry.slug, override=op.get("override", ""), today=today)
    except publishing.PublishBlocked as e:
        raise _Problem(f"the publishing rule refuses it: {'; '.join(e.problems)} (add it in review, or give an override note)") from e
    return ["published"]


def op_add_branch(op: dict, actor: str, today: date) -> list[str]:
    b, origin = op["branch"], op.get("origin")
    _new_entry_free(b["id"])
    parents, into = b.get("parents", []), b.get("into", [])
    values = {"name": b["name"], "start": b["start"], "end": b.get("end"), "start_when": b["startWhen"], "end_when": b.get("endWhen"),
              "text": b["text"], "origin_note": origin["note"] if origin else None, "status": Status.REVIEW}
    x, _ = services.save_branch(b["id"], region=b["region"], **values)
    notes = [f"branch {x.slug} in {b['region']}, {b['startWhen']}" + (f" to {b['endWhen']}" if b.get("endWhen") else "")]
    # Parents and into in order; origin links mark their parent link with how and note (as publish/legacy.py loads them).
    desired = {}
    for i, slug in enumerate(parents):
        desired[(slug, "parent")] = {"position": i, "origin_position": None, "how": "", "note": ""}
    for i, slug in enumerate(into):
        desired[(slug, "into")] = {"position": i, "origin_position": None, "how": "", "note": ""}
    for j, link in enumerate((origin or {}).get("links", [])):
        d = desired.setdefault((link["id"], "parent"), {"position": len(parents) + j, "origin_position": None, "how": "", "note": ""})
        d.update(origin_position=j, how=link["how"], note=link["note"])
    for (slug, relation), v in desired.items():
        services.apply_changes(BranchLink(branch=x, target=Branch.objects.get(slug=slug), relation=relation), v)
        notes.append(f"{relation} {slug}" + (f" ({v['how']})" if v["how"] else ""))
    _, cited = _record(x, "as_written", {"name": b["name"], "startWhen": b["startWhen"], "endWhen": b.get("endWhen"), "text": b["text"],
                                          "parents": parents, "into": into}, b["cites"], actor)
    notes += cited
    if origin:
        _, cited = _record(x, "origin", {"note": origin["note"], "links": [link["id"] for link in origin["links"]]}, origin["cites"], actor)
        notes += [f"origin: {n}" for n in cited]
    notes += _place(x, op.get("geo"))
    _resplit(x, today)
    return notes + _publish(x, op, today)


def op_add_event(op: dict, actor: str, today: date) -> list[str]:
    e = op["event"]
    _new_entry_free(e["id"])
    values = {k: e[k] for k in ("y", "when", "title", "text", "imp")} | {"end": e.get("end"), "status": Status.REVIEW}
    x, _ = services.save_event(e["id"], branch=e["branch"], **values)
    notes = [f"event {x.slug} on {e['branch']}, {e['when']}"]
    for i, slug in enumerate([e["link"]] if "link" in e else e.get("links", [])):
        services.apply_changes(EventLink(event=x, branch=Branch.objects.get(slug=slug)), {"position": i})
        notes.append(f"link {slug}")
    _, cited = _record(x, "as_written", {"when": e["when"], "title": e["title"], "text": e["text"]}, e["cites"], actor)
    notes += cited
    notes += _place(x, op.get("geo"))
    _resplit(x, today)
    return notes + _publish(x, op, today)


def op_add_connection(op: dict, actor: str, today: date) -> list[str]:
    """A TL.enrich connection. The snapshot writes an entry's connections only with its "why it matters" text, and the
    why claim's cites support every note, so an entry without a why needs one (and cites) in the op."""
    entry, to = _entry(op["entry"]), _entry(op["to"])
    x = entry.concrete
    notes = []
    if not x.why:
        if not op.get("why") or not op.get("cites"):
            raise _Problem(f"{x.slug} has no why: connections are shown only with one, so give why (≤ {WHY_MAX} characters) and cites")
        services.apply_changes(x, {"why": op["why"]})
        notes.append("why added")
    elif op.get("why") and op["why"] != x.why:
        raise _Problem(f"{x.slug} already has a why: add_connection doesn't replace it (leave why out)")
    have = list(Connection.objects.filter(source=entry).order_by("position"))
    row = next((c for c in have if c.target_id == to.pk), None)
    if row is None:
        row = Connection(source=entry, target=to, position=have[-1].position + 1 if have else 0)
        have.append(row)
    r = services.apply_changes(row, {"note": op["note"]})
    notes.append(f"connection → {to.slug} {r}")
    value = {"why": x.why, "connections": [Entry.objects.get(pk=c.target_id).slug for c in have]}
    claim, cited = _record(entry, "why", value, op.get("cites", []), actor)
    notes += cited
    if not claim.evidence.filter(stance__in=CITE_STANCES).exists():
        raise _Problem(f"{x.slug}'s why has no supporting cite: give cites for the connection")
    reassess_all(today, {}, claim_ids=[claim.pk])
    return notes


def op_rename(op: dict, actor: str, today: date) -> list[str]:
    old, new = op["entry"], op["to"]
    entry = Entry.objects.filter(slug=old).first()
    if entry is None and Entry.objects.filter(slug=new).exists():
        return [f"already renamed: {new} exists and {old} doesn't"]
    if entry is None:
        raise _Problem(f"no entry {old!r}")
    if Entry.objects.filter(slug=new).exists():
        raise _Problem(f"{new} is already an entry's id")
    from governance.models import BranchProposal

    open_proposals = (BranchProposal.objects.filter(status__in=["proposed", "accepted"]).annotate(t=Cast("payload", TextField()))
                      .filter(t__contains=f'"{old}"').values_list("pk", flat=True))
    if open_proposals:
        raise _Problem(f"open branch proposals {list(open_proposals)} name {old} in their operations: decide them first")
    services.apply_changes(entry.concrete, {"slug": new})
    return [f"{old} → {new}"]


def op_approve(op: dict, actor: str, today: date) -> list[str]:
    entry = _entry(op["entry"])
    if entry.status == Status.PUBLISHED:
        return ["already published"]
    if entry.status != Status.REVIEW:
        raise _Problem(f"{entry.slug} is {entry.status}: approve moves an entry in review to published")
    try:
        publishing.publish_entry(entry.slug, override=op.get("override", ""), today=today)
    except publishing.PublishBlocked as e:
        raise _Problem(f"the publishing rule refuses it: {'; '.join(e.problems)} (give an override note to publish anyway)") from e
    return ["published"]


def op_reject(op: dict, actor: str, today: date) -> list[str]:
    entry = _entry(op["entry"])
    if entry.status == Status.RETRACTED:
        return ["already retracted"]
    if entry.status not in (Status.DRAFT, Status.REVIEW):
        raise _Problem(f"{entry.slug} is {entry.status}: reject retracts a draft or an entry in review")
    services.set_status(entry.slug, Status.RETRACTED)
    return ["retracted"]


def _claim(entry: Entry, sel) -> Claim:
    fld, key = _claim_sel(sel)
    c = Claim.objects.filter(entry=entry, field=fld, key=key).first()
    if c is None:
        have = sorted(Claim.objects.filter(entry=entry, field=fld).values_list("key", flat=True))
        raise _Problem(f"{entry.slug} has no {fld} claim {key!r}" + (f" (its {fld} claims: {', '.join(repr(k) for k in have)})" if have else ""))
    return c


def op_add_evidence(op: dict, actor: str, today: date) -> list[str]:
    entry = _entry(op["entry"])
    claim = _claim(entry, op.get("claim"))
    row = _find_row(claim, op["url"])
    url = row.citation.url if row else _known_url(op["url"])
    excerpt = op["excerpt"] if "excerpt" in op else (row.excerpt if row else "")
    try:
        record_evidence(claim, url=url, stance=op["stance"], checked_by=actor, excerpt=excerpt, method=op.get("method", "agent_read"),
                        title=op.get("title", ""), found_value=op.get("found"), today=today)
    except ValueError as e:
        hint = " (a new source for the record itself is a cite: an edit's add_cites)" if claim.field == "as_written" and row is None else ""
        raise _Problem(f"{e}{hint}") from e
    claim.refresh_from_db()
    return [f"{claim.field} {claim.key!r}: {op['stance']} from {url} → {claim.status} ({claim.confidence})"]


def op_resolve_conflict(op: dict, actor: str, today: date) -> list[str]:
    entry = _entry(op["entry"])
    claims = [_claim(entry, op["claim"])] if op.get("claim") is not None else list(Claim.objects.filter(entry=entry))
    rows = list(Evidence.objects.filter(claim__in=claims, stance="conflicts").select_related("citation", "claim"))
    if op.get("urls"):
        wanted = {norm_url(u): u for u in op["urls"]}
        rows = [ev for ev in rows if norm_url(ev.citation.url) in wanted]
        if missing := set(wanted) - {norm_url(ev.citation.url) for ev in rows}:
            raise _Problem(f"no conflicting evidence from {', '.join(wanted[m] for m in sorted(missing))}")
    if not rows:
        return ["no conflicting evidence: nothing to resolve"]
    now = timezone.now()
    notes = []
    for ev in rows:
        resolved = {"by": actor, "at": now.isoformat(timespec="seconds"), "reason": op["reason"][:500], "was": "conflicts"}
        services.apply_changes(ev, {"stance": "unrelated", "found_value": {**(ev.found_value or {}), "resolved": resolved}, "checked_by": actor, "checked_at": now})
        notes.append(f"resolved {ev.claim.field} {ev.claim.key!r} ← {ev.citation.url}")
    reassess_all(today, {}, claim_ids=sorted({ev.claim_id for ev in rows}))
    for c in Claim.objects.filter(pk__in={ev.claim_id for ev in rows}).order_by("pk"):
        notes.append(f"{c.field} {c.key!r} is now {c.status}")
    return notes


HANDLERS = {"edit": op_edit, "rename": op_rename, "approve": op_approve, "reject": op_reject, "add_evidence": op_add_evidence,
            "resolve_conflict": op_resolve_conflict, "add_branch": op_add_branch, "add_event": op_add_event, "add_connection": op_add_connection}


# ── the diff: the Revisions an op wrote ──

SHORT = {"timeline_entry": "entry", "timeline_event": "event", "timeline_branch": "branch", "timeline_eventlink": "link",
         "evidence_claim": "claim", "evidence_evidence": "evidence", "evidence_citation": "citation", "evidence_publisher": "publisher",
         "timeline_branchlink": "branch link", "timeline_connection": "connection", "timeline_location": "location"}
QUIET = {"updated_at", "created_at", "id"}


def _show(v) -> str:
    s = json.dumps(v, ensure_ascii=False, default=str)
    return s if len(s) <= 300 else s[:297] + "…"


def _describe(rev: Revision) -> str:
    row = rev.after or rev.before or {}
    t = rev.table_name
    if t in ("timeline_entry", "timeline_event", "timeline_branch"):
        slug = Entry.objects.filter(pk=rev.row_pk).values_list("slug", flat=True).first() or row.get("slug") or rev.row_pk
        return f"{SHORT[t]} {slug}"
    if t == "evidence_claim":
        slug = Entry.objects.filter(pk=row.get("entry_id")).values_list("slug", flat=True).first()
        return f"claim {rev.row_pk} ({slug} {row.get('field')}{' ' + row['key'] if row.get('key') else ''})"
    if t == "evidence_evidence":
        url = Citation.objects.filter(pk=row.get("citation_id")).values_list("url", flat=True).first()
        return f"evidence {rev.row_pk} (claim {row.get('claim_id')} ← {url})"
    if t == "timeline_branchlink":
        a, b = (Branch.objects.filter(pk=row.get(k)).values_list("slug", flat=True).first() for k in ("branch_id", "target_id"))
        return f"branch link {rev.row_pk} ({a} {row.get('relation')} {b})"
    if t == "timeline_connection":
        a, b = (Entry.objects.filter(pk=row.get(k)).values_list("slug", flat=True).first() for k in ("source_id", "target_id"))
        return f"connection {rev.row_pk} ({a} → {b})"
    if t == "timeline_location":
        return f"location {rev.row_pk} ({Entry.objects.filter(pk=row.get('entry_id')).values_list('slug', flat=True).first()})"
    if t == "timeline_eventlink":
        b = Branch.objects.filter(pk=row.get("branch_id")).values_list("slug", flat=True).first()
        return f"link {rev.row_pk} (→ {b})"
    return f"{SHORT.get(t, t)} {rev.row_pk}"


def diff_lines(revs) -> list[str]:
    out = []
    for rev in revs:
        what = _describe(rev)
        if rev.action == "update":
            for col in rev.changed or []:
                if col not in QUIET:
                    out.append(f"  ~ {what} {col}: {_show(rev.before.get(col))} → {_show(rev.after.get(col))}")
        elif rev.action == "insert":
            shown = {k: v for k, v in rev.after.items() if k not in QUIET and v not in (None, "", {}, [])}
            out.append(f"  + {what} {_show(shown)}")
        else:
            out.append(f"  - {what}")
    return out


def apply(ops: list, *, actor: str, source: str = "edits", dry_run: bool = False, today: date | None = None) -> Outcome:
    """Check, then apply every op in order in one transaction. Raises EditsInvalid with every problem (nothing kept)."""
    if not re.match(ACTOR_RE, actor or ""):
        raise EditsInvalid([f"actor {actor!r} must be agent:<name>, human:<name> or job:<name>"])
    problems = check(ops)
    if problems:
        raise EditsInvalid(problems)
    today = today or date.today()
    outcome = Outcome()
    name = Path(source).name
    try:
        with transaction.atomic(), revising(actor, reason=f"apply_edits {name}"):
            with connection.cursor() as c:
                c.execute("SELECT txid_current()")
                outcome.txid = c.fetchone()[0]
            for i, op in enumerate(ops):
                high = Revision.objects.aggregate(m=Max("id"))["m"] or 0
                try:
                    with revising(actor, reason=f"apply_edits {name} #{i} {op['op']} {target(op)}: {op['reason']}"[:2000]):
                        notes = HANDLERS[op["op"]](op, actor, today)
                except (_Problem, ValueError, ValidationError, ObjectDoesNotExist, DatabaseError) as e:
                    problems.append(f"{_label(i, op)}: {e}")
                    continue
                revs = list(Revision.objects.filter(id__gt=high).order_by("id"))
                outcome.ops.append((i, op, notes, diff_lines(revs)))
                outcome.counts[op["op"]] += 1
                outcome.revisions += len(revs)
            if problems or dry_run:
                raise _Rollback
    except _Rollback:
        pass
    if problems:
        raise EditsInvalid(problems)
    outcome.applied = not dry_run
    return outcome
