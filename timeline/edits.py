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

Everything is checked before anything is written (`check`: the shape of every op, the SCHEMA limits, https cites and
never openstax.org, slugs, branches), then applied in order inside one `revising(actor)` block, each op in its own
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
from django.db import DatabaseError, transaction
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
from .models import SLUG_RE, Branch, Entry, EventLink, Status

TITLE_MAX, TEXT_MAX, EXCERPT_WORDS = 60, 240, 25  # site/SCHEMA.md; evidence_excerpt_25_words
COMMON = {"op", "reason", "note"}
KEYS = {  # op → (required, optional)
    "edit": ({"entry"}, {"fields", "add_cites", "remove_cites"}),
    "rename": ({"entry", "to"}, set()),
    "approve": ({"entry"}, {"override"}),
    "reject": ({"entry"}, set()),
    "add_evidence": ({"entry", "url", "stance"}, {"claim", "title", "excerpt", "method", "found"}),
    "resolve_conflict": ({"entry"}, {"claim", "urls"}),
}
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


def _label(i: int, op) -> str:
    if not isinstance(op, dict):
        return f"#{i}"
    return f"#{i} {op.get('op', '?')}" + (f" {op['entry']}" if isinstance(op.get("entry"), str) else "")


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


def _cites_problems(op, where: str) -> list[str]:
    out, seen = [], set()
    adds, removes = op.get("add_cites", []), op.get("remove_cites", [])
    if not isinstance(adds, list):
        return [f"{where}: add_cites must be a list"]
    if not isinstance(removes, list):
        return [f"{where}: remove_cites must be a list"]
    for j, c in enumerate(adds):
        w = f"{where} add_cites[{j}]"
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
    """Every problem with the file's shape and limits, without reading any row but the branches it names."""
    out = []
    targets, retired = {}, {}  # a rename's new id → (old id, op); a slug → why a later op can't use it
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
    named = set()
    for op in ops:
        if isinstance(op, dict) and op.get("op") == "edit" and isinstance(op.get("fields"), dict):
            f = op["fields"]
            if isinstance(f.get("branch"), str):
                named.add(f["branch"])
            if isinstance(f.get("links"), list):
                named |= {s for s in f["links"] if isinstance(s, str)}
    have = set(Branch.objects.filter(slug__in=named).values_list("slug", flat=True))
    out += [f"branch {s!r} doesn't exist" for s in sorted(named - have)]
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
        ev = _find_row(claim, c["u"])
        cit = ev.citation if ev else citation_for(_known_url(c["u"]), c["t"])
        if cit is None:
            raise _Problem(f"add_cites: {c['u']} can't be cited (its publisher is forbidden)")
        if ev is None:
            last = claim.evidence.aggregate(m=Max("position"))["m"]
            ev = Evidence(claim=claim, citation=cit, position=0 if last is None else last + 1)
            notes.append(f"added cite {cit.url}")
        else:
            notes.append(f"updated cite {cit.url}")
        services.apply_changes(ev, {
            "stance": c.get("stance", "supports"), "cited_title": c["t"][:500], "cited_kind": c.get("k", ""), "checked_by": actor,
            "method": c.get("method", "agent_read"), "checked_at": timezone.now(), "content_hash": cit.content_hash,
            "excerpt": c["excerpt"] if "excerpt" in c else ev.excerpt,
        })
    _resplit(entry, today)
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
            "resolve_conflict": op_resolve_conflict}


# ── the diff: the Revisions an op wrote ──

SHORT = {"timeline_entry": "entry", "timeline_event": "event", "timeline_branch": "branch", "timeline_eventlink": "link",
         "evidence_claim": "claim", "evidence_evidence": "evidence", "evidence_citation": "citation", "evidence_publisher": "publisher"}
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
            for i, op in enumerate(ops):
                high = Revision.objects.aggregate(m=Max("id"))["m"] or 0
                try:
                    with revising(actor, reason=f"apply_edits {name} #{i} {op['op']} {op['entry']}: {op['reason']}"[:2000]):
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
