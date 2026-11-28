"""The owner's review queue: /ops/review/ (docs/adr/0046-the-owners-review-queue.md).

A `browser_only` (or `citation_only`) page is read by a person, never by an agent's script (AGENTS.md rule 6). This
module finds the work that waits for that read, shows it one item at a time, and carries out the owner's decision.

Items, each named by a key the page and the actions share:

| key | what | from |
|---|---|---|
| `task-<id>` (claim) | a `verify_claim` task released with `needs` browser or owner | work/queue.py `release(needs=…)` |
| `draft-<slug>` | a draft in review whose only support besides Wikipedia is a page only a person reads | work/rounds.py `owner_read_drafts` |
| `task-<id>` (task) | a `fill_gap` or `write_event` task released with `needs: browser` | the same release |
| `task-<id>` (agent) | a `verify_claim` task agents can still claim, shown only with the filter on | `queue.available_q` |
| `image-<id>` (image) | a picture the image_search job found but may not attach alone (ADR 0048) | ingest/images.py, `ImageCandidate` |
| `image-<id>` (flag) | a picture already attached that the job's signals blurred, to confirm or clear | ingest/images.py `flag_pass` |

Decisions (each an `OpsAction`, made in the request without a confirmation page: opsconsole/actions.py):

- **approve**: a claim gets the owner's read as evidence (`human:<username>`, method `browser_read`, the URL and an
  optional excerpt) through the agent API's own applier, so the claim is recomputed by the usual rules, and the task
  completes; a draft gets the same stamp on its person-read sources, then the edit file's `approve` op
  (`timeline.edits.apply`), so the publishing rule decides and the next release carries it; a fill_gap or write_event
  task goes back to the agents with `payload["owner_read"]`: a readable source the owner named (one `GET policy`
  lets an agent fetch) or the owner's own summary, a lead and never a source.
- **deny**: a claim gets evidence that the page does not support it (`unrelated`), or contradicts it (`conflicts`,
  which can make it contested); a draft is rejected (`reject` op: retracted); a task is cancelled.
- **defer**: the item goes to the backlog, out of the Review count, the sidebar badge, the health counts and every
  agent's queue, until the owner brings it back. A task records it in `payload["needs"]["backlog"]`; a draft in the
  `owner_review` JobState row.
- **pictures** (ADR 0048): approve attaches the picture (a `timeline.Image`, as `human:<username>`), blurred on the
  page when the Sensitive box is ticked (the job's signals tick it); deny refuses it for good (the next runner-up, if
  any, takes its place); a flag item's approve keeps the flag as the box says, its deny clears it. **flag** (its own
  form, any entry with a picture) sets or clears a picture's sensitive flag directly.
- **restore**: brings a backlog item back where it was: an item that needed a person to Review, an item agents could
  do to the agents' queue.

The agent-workable items (the filter) are leased to the owner while their page is open (`queue.claim_for`, as
`human:<username>`), so a round's agent can't take one mid-read; leaving the page hands it back (`queue.let_go`).
"""

import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta

from django.db import transaction
from django.db.models import BooleanField, CharField, Exists, Func, Max, OuterRef, Q, Subquery
from django.db.models.fields.json import KeyTransform
from django.db.models.functions import Cast
from django.utils import timezone

from evidence.models import Claim, Evidence
from ingest.models import ImageCandidate, JobState
from timeline.models import Entry
from work import queue
from work import rounds as WR
from work.models import AgentTask

STATE = "owner_review"                     # JobState: {"backlog": {slug: {"by", "at", "note", "action"}}} for drafts
PERSON_NEEDS = {"verify_claim": ("browser", "owner"), "fill_gap": ("browser",), "write_event": ("browser",)}
AGENT_KINDS = ("verify_claim",)            # kinds an agent may still do that fit approve / deny / defer
AGENT_LIMIT = 50                           # agent-workable items listed under the filter, in the agents' order
NOTE_MAX = 500
EXCERPT_WORDS = 25
DECISIONS = ("approve", "deny", "defer", "restore", "flag")
URL_RE = re.compile(r"https?://[^\s<>\"'()\[\]]+[^\s<>\"'()\[\].,;:!?]")
KIND_LABEL = {"claim": "Claim", "draft": "Draft", "task": "Task", "agent": "Agents can do", "image": "Image", "flag": "Image flag"}
TRUE = ("1", "on", "true", True)


class ReviewError(Exception):
    """The decision can't be made (now): the message says why, for the owner."""


# ── what waits ────────────────────────────────────────────────────────────────────────────────────────────────────

def _person_q() -> Q:
    q = Q()
    for kind, needs in PERSON_NEEDS.items():
        q |= Q(kind=kind, payload__needs__kind__in=list(needs))
    return Q(status=AgentTask.Status.QUEUED) & q


def person_tasks(*, backlog: bool = False):
    """Tasks that wait for a person's read (or, with backlog, the ones the owner deferred)."""
    qs = AgentTask.objects.filter(_person_q())
    return qs.filter(queue.backlog_q()) if backlog else qs.exclude(queue.backlog_q())


def agent_tasks(now):
    """verify_claim tasks an agent could take now, and the ones leased now (to an agent, or to a person reading), in
    the order the agents' queue takes them."""
    live = Q(status=AgentTask.Status.CLAIMED, lease_until__gte=now) & ~Q(payload__has_key="needs")
    return (AgentTask.objects.filter(kind__in=AGENT_KINDS).filter(queue.available_q(now) | live)
            .order_by("-priority", "created_at", "id"))


def draft_backlog() -> dict:
    st = JobState.objects.filter(name=STATE).values_list("state", flat=True).first() or {}
    return dict(st.get("backlog") or {})


def _in_backlog(slug_ref):
    """An Exists for "the owner deferred this draft": its slug is a key of the `owner_review` row's backlog."""
    return Exists(JobState.objects.filter(name=STATE).alias(
        hit=Func(KeyTransform("backlog", "state"), slug_ref, function="jsonb_exists", output_field=BooleanField())).filter(hit=True))


def _draft_qs(*, backlog: bool):
    qs = WR.owner_read_drafts()
    return qs.filter(_in_backlog(OuterRef("slug"))) if backlog else qs.filter(~_in_backlog(OuterRef("slug")))


def _drafts(*, backlog: bool):
    from revisions.models import Revision

    last = (Revision.objects.filter(table_name__in=WR.ENTRY_TABLES, row_pk=Cast(OuterRef("pk"), CharField()), reason__startswith="apply_edits")
            .order_by().values("row_pk").annotate(m=Max("at")).values("m"))
    return _draft_qs(backlog=backlog).annotate(held_at=Subquery(last[:1]))


def image_qs(*, backlog: bool = False):
    """Pictures and flags waiting for the owner (ADR 0048), or the deferred ones."""
    qs = ImageCandidate.objects.filter(status=ImageCandidate.Status.REVIEW)
    return qs.exclude(backlog={}) if backlog else qs.filter(backlog={})


def count(*, backlog: bool = False) -> int:
    """The To review tab's count and the sidebar's badge: the reads waiting for the owner, claims, drafts and tasks
    (never the backlog, never the items agents can still do, never pictures: they have their own tab, ADR 0048).
    With `backlog`, every deferred item, pictures included (one backlog). One query: the sidebar reads it on every
    console page."""
    tasks = person_tasks(backlog=backlog).order_by().values_list("pk")
    parts = [_draft_qs(backlog=backlog).order_by().values_list("pk")]
    if backlog:
        parts.append(image_qs(backlog=True).order_by().values_list("pk"))
    return tasks.union(*parts, all=True).order_by().count()


def image_count() -> int:
    """The Images tab's count: pictures and flags waiting for the owner, not deferred (ADR 0048)."""
    return image_qs().count()


@dataclass
class Item:
    key: str
    kind: str                       # claim, draft, task, agent
    title: str
    since: datetime
    task: AgentTask | None = None
    entry: Entry | None = None
    holder: str = ""                # a live lease's holder (agent-workable items)
    backlog: dict = field(default_factory=dict)
    image: ImageCandidate | None = None  # a picture or a flag (ADR 0048)

    @property
    def kind_label(self) -> str:
        return KIND_LABEL[self.kind]


def _parse(s) -> datetime | None:
    try:
        return datetime.fromisoformat(s) if s else None
    except (TypeError, ValueError):
        return None


def _task_title(t: AgentTask) -> str:
    p = t.payload or {}
    if t.kind == "verify_claim":
        e = p.get("entry") or {}
        c = p.get("claim") or {}
        what = e.get("title") or e.get("name") or e.get("slug") or (t.target_entry.slug if t.target_entry_id else "")
        return f"{what} · {c.get('field', 'claim')}" + (f" {c.get('key')}" if c.get("key") else "")
    if t.kind == "fill_gap":
        return f"{(p.get('branch') or {}).get('name', '?')}, {(p.get('window') or {}).get('label', '')}".strip(", ")
    return ((p.get("suggested") or {}).get("title_hint") or t.dedupe_key or f"task #{t.pk}")[:90]


def _task_item(t: AgentTask, kind: str, now) -> Item:
    needs = (t.payload or {}).get("needs") if isinstance((t.payload or {}).get("needs"), dict) else {}
    holder = t.claimed_by if t.status == AgentTask.Status.CLAIMED and t.lease_until and t.lease_until >= now else ""
    return Item(f"task-{t.pk}", kind, _task_title(t), _parse(needs.get("at")) or t.created_at, task=t, holder=holder,
                backlog=needs.get("backlog") or {})


def _image_item(c: ImageCandidate) -> Item:
    x = c.entry.concrete
    what = getattr(x, "title", None) or getattr(x, "name", c.entry.slug)
    kind = "flag" if c.kind == ImageCandidate.Kind.FLAG else "image"
    return Item(f"image-{c.pk}", kind, f"{what} · {c.source}" if kind == "image" else what, c.created_at, entry=c.entry, image=c,
                backlog=c.backlog or {})


def image_items() -> list[Item]:
    """The Images tab: pictures and flags waiting for the owner, oldest first (ADR 0048)."""
    out = [_image_item(c) for c in image_qs().select_related("entry__as_event", "entry__as_branch")]
    out.sort(key=lambda i: (i.since, i.key))
    return out


def items(now, *, backlog: bool = False, agents: bool = False) -> list[Item]:
    """The To review queue of reads (claims, drafts, tasks), oldest first; with `agents`, then the agent-workable
    items in the agents' order. Pictures are on their own tab (`image_items`). The backlog tab lists every deferred
    item, pictures included, oldest deferral first."""
    out = []
    for t in person_tasks(backlog=backlog).select_related("target_entry"):
        out.append(_task_item(t, "claim" if t.kind == "verify_claim" else "task", now))
    held = draft_backlog()
    for e in _drafts(backlog=backlog).select_related("as_event", "as_branch"):
        x = e.concrete
        out.append(Item(f"draft-{e.slug}", "draft", getattr(x, "title", None) or getattr(x, "name", e.slug), e.held_at or e.created_at, entry=e,
                        backlog=held.get(e.slug) or {}))
    if backlog:
        for c in image_qs(backlog=True).select_related("entry__as_event", "entry__as_branch"):
            out.append(_image_item(c))
    if backlog:
        out.sort(key=lambda i: (_parse(i.backlog.get("at")) or i.since, i.key))
        return out
    out.sort(key=lambda i: (i.since, i.key))
    if agents:
        out += [_task_item(t, "agent", now) for t in agent_tasks(now).select_related("target_entry")[:AGENT_LIMIT]]
    return out


def find(key: str, now) -> Item | None:
    """One item by its key, wherever it is (review, backlog, agent-workable), or None."""
    if key.startswith("task-") and key[5:].isdigit():
        t = AgentTask.objects.select_related("target_entry").filter(pk=int(key[5:])).first()
        if t is None:
            return None
        if person_tasks(backlog=False).filter(pk=t.pk).exists() or person_tasks(backlog=True).filter(pk=t.pk).exists():
            return _task_item(t, "claim" if t.kind == "verify_claim" else "task", now)
        if t.kind in AGENT_KINDS and agent_tasks(now).filter(pk=t.pk).exists():
            return _task_item(t, "agent", now)
        return None
    if key.startswith("image-") and key[6:].isdigit():
        c = ImageCandidate.objects.select_related("entry__as_event", "entry__as_branch").filter(pk=int(key[6:]), status=ImageCandidate.Status.REVIEW).first()
        return _image_item(c) if c else None
    if key.startswith("draft-"):
        slug = key[6:]
        e = WR.owner_read_drafts().filter(slug=slug).select_related("as_event", "as_branch").first()
        if e is None:
            return None
        x = e.concrete
        return Item(key, "draft", getattr(x, "title", None) or getattr(x, "name", slug), e.created_at, entry=e, backlog=draft_backlog().get(slug) or {})
    return None


# ── what the page shows for one item ──────────────────────────────────────────────────────────────────────────────

def policy_of(url: str) -> dict:
    """What `GET policy?url=` says about a page: {policy, may_fetch, why} (agentapi/policy.py)."""
    from agentapi.policy import decide

    try:
        d = decide(url)
    except Exception:  # noqa: BLE001 — a URL the policy can't parse is shown as such
        return {"policy": "unknown", "may_fetch": False, "why": "the policy can't read this URL"}
    return {"policy": d["policy"], "may_fetch": d["may_fetch"], "why": d["why"]}


def claim_text(claim: Claim) -> str:
    v = claim.value or {}
    if claim.field == "as_written":
        return " — ".join(x for x in (v.get("when"), v.get("title")) if x) + (f": {v['text']}" if v.get("text") else "")
    for k in ("text", "label", "value", "when", "name"):
        if v.get(k) not in (None, ""):
            return str(v[k])
    return ", ".join(f"{k}: {x}" for k, x in v.items())


def _claim(task: AgentTask) -> Claim | None:
    cid = task.target_claim_id or ((task.payload or {}).get("claim") or {}).get("id")
    return Claim.objects.select_related("entry").filter(pk=cid).first() if cid else None


def _evidence_rows(claim: Claim) -> list[dict]:
    rows = []
    for ev in claim.evidence.select_related("citation__publisher").order_by("position"):
        pub = ev.citation.publisher
        rows.append({"url": ev.citation.url, "title": ev.cited_title or ev.citation.title, "publisher": pub.domain, "tier": pub.tier,
                     "fetch_policy": pub.fetch_policy, "stance": ev.stance, "excerpt": ev.excerpt, "method": ev.method,
                     "checked_by": ev.checked_by, "checked_at": ev.checked_at, "person_read": pub.fetch_policy in WR.PERSON_READ})
    return rows


def _urls_in(text: str) -> list[str]:
    return list(dict.fromkeys(URL_RE.findall(text or "")))


def _to_read(rows: list[dict], needs: dict, payload: dict) -> list[dict]:
    """The pages the owner should read: the ones the agent named, the person-read citations, and the evidence pack's
    unreadable pages; each with what the policy says about it. With none of those, every cited page."""
    seen, out = set(), []

    def add(url, title="", why=""):
        if url and url not in seen and url.startswith(("http://", "https://")):
            seen.add(url)
            out.append({"url": url, "title": title, "why": why, **policy_of(url)})

    for u in _urls_in(needs.get("reason", "")):
        add(u, why="the agent couldn't read it")
    for r in rows:
        if r["person_read"]:
            add(r["url"], r["title"], f"{r['publisher']} is {r['fetch_policy']}")
    for u in payload.get("unreadable") or []:
        if isinstance(u, dict) and u.get("reason") in ("browser_only", "citation_only", "ai_blocked", "never_fetch"):
            add(u.get("url"), "", f"the evidence pack couldn't read it ({u.get('reason')})")
    for s in payload.get("sources") or []:
        if isinstance(s, dict) and s.get("fetch_policy") in WR.PERSON_READ:
            add(s.get("url"), s.get("label", ""), f"{s.get('domain', '')} is {s.get('fetch_policy')}")
    if not out:
        for r in rows:
            add(r["url"], r["title"], f"cited ({r['stance']})")
    return out


def _hold_note(entry: Entry) -> dict | None:
    """The reviewer's note on a held draft: the newest edit-file Revision on the entry or its evidence (its reason
    after the op), preferring one that says HOLD."""
    from revisions.models import Revision

    ev_ids = [str(i) for i in Evidence.objects.filter(claim__entry=entry).values_list("pk", flat=True)]
    revs = Revision.objects.filter(Q(table_name__in=WR.ENTRY_TABLES, row_pk=str(entry.pk)) | Q(table_name="evidence_evidence", row_pk__in=ev_ids),
                                   reason__startswith="apply_edits").order_by("-id").values("reason", "actor", "at")[:50]
    revs = list(revs)
    pick = next((r for r in revs if "HOLD" in r["reason"]), revs[0] if revs else None)
    if pick is None:
        return None
    m = re.match(r"apply_edits \S+ #\d+ \S+ \S+: (.*)$", pick["reason"], re.S)
    return {"text": (m.group(1) if m else pick["reason"]).strip(), "by": pick["actor"], "at": pick["at"]}


def preview_src(src: str) -> str:
    """A picture's URL for the console: the source's own (https), or the public page's copy of a file in site/images/."""
    from django.conf import settings

    return src if src.startswith("https://") else f"{settings.PUBLIC_SITE_URL}/{src.lstrip('/')}" if src else ""


def _image_detail(item: Item) -> dict:
    c = item.image
    x = c.entry.concrete
    im = c.image
    return {"c": c, "entry": c.entry, "entry_title": getattr(x, "title", None) or getattr(x, "name", ""),
            "entry_when": getattr(x, "when", None) or getattr(x, "start_when", ""), "entry_text": c.entry.text,
            "branch": getattr(getattr(x, "branch", None), "name", ""), "preview": preview_src(c.thumb_url or (im.src if im else "")),
            "signals": (c.match or {}).get("signals") or {}, "via": (c.match or {}).get("via", ""), "qid": (c.match or {}).get("qid", ""),
            "alternates": ImageCandidate.objects.filter(entry_id=c.entry_id, kind=c.kind, status=ImageCandidate.Status.ALTERNATE).count(),
            "attached": im}


def detail(item: Item) -> dict:
    """Everything the page shows for the current item."""
    if item.kind in ("image", "flag"):
        return _image_detail(item)
    if item.kind in ("claim", "agent"):
        t = item.task
        claim = _claim(t)
        needs = (t.payload or {}).get("needs") or {}
        rows = _evidence_rows(claim) if claim else []
        if claim and claim.parent_id:  # an atomic part: its record's citations are where to read it
            rows += [r | {"of_record": True} for r in _evidence_rows(claim.parent) if r["url"] not in {x["url"] for x in rows}]
        entry = claim.entry if claim else t.target_entry
        x = entry.concrete if entry else None
        return {"claim": claim, "claim_text": claim_text(claim) if claim else "", "entry": entry, "entry_title": getattr(x, "title", None) or getattr(x, "name", ""),
                "entry_when": getattr(x, "when", None) or getattr(x, "start_when", ""), "entry_text": entry.text if entry else "",
                "needs": needs, "evidence": rows, "read": _to_read(rows, needs, t.payload or {}),
                "reason": (t.payload or {}).get("reason", ""), "todo": (t.payload or {}).get("todo", "")}
    if item.kind == "draft":
        e = item.entry
        x = e.concrete
        rec = Claim.objects.filter(entry=e, field="as_written", key="", parent__isnull=True).first()
        rows = _evidence_rows(rec) if rec else []
        return {"entry": e, "entry_title": getattr(x, "title", None) or getattr(x, "name", ""), "entry_when": getattr(x, "when", None) or getattr(x, "start_when", ""),
                "entry_text": e.text, "branch": getattr(getattr(x, "branch", None), "name", ""), "evidence": rows,
                "read": [r | policy_of(r["url"]) for r in rows if r["person_read"] and not r["checked_by"].startswith("human:")],
                "hold": _hold_note(e)}
    t = item.task
    p = t.payload or {}
    needs = p.get("needs") or {}
    ctx = {"needs": needs, "read": _to_read([], needs, p), "kind": t.kind, "owner_read": p.get("owner_read")}
    if t.kind == "fill_gap":
        b = p.get("branch") or {}
        ctx["context"] = [("Branch", f"{b.get('name', '?')} ({b.get('id', '')})"), ("Window", (p.get("window") or {}).get("label", "")),
                          ("Gap", f"{(p.get('gap') or {}).get('kind', '')}: {(p.get('gap') or {}).get('events_in_window', 0)} events in the window"),
                          ("Branch text", b.get("text", ""))]
    else:
        s = p.get("suggested") or {}
        ctx["context"] = [("Story", s.get("title_hint", "")), ("When", s.get("when") or s.get("first_date") or "")]
        ctx["items"] = [i.get("text", "")[:400] for i in (p.get("items") or [])[:3]]
    return ctx


# ── decisions ─────────────────────────────────────────────────────────────────────────────────────────────────────

def clean_note(s) -> str:
    return " ".join(str(s or "").split())[:NOTE_MAX]


def _entry_picture(slug: str):
    from timeline.models import Image

    return Image.objects.select_related("entry").filter(entry__slug=slug).order_by("position").first()


def check_flag(data, now) -> tuple[Item, dict]:
    """The flag form: set or clear the sensitive flag of an entry's picture (the first one, the one the page shows)."""
    slug = (data.get("entry") or "").strip().lstrip("#")
    im = _entry_picture(slug) if slug else None
    if im is None:
        raise ReviewError(f"{slug or '(no entry)'} has no picture" if slug else "name the entry whose picture to flag")
    want = data.get("sensitive") in TRUE
    if im.sensitive == want:
        raise ReviewError(f"{slug}'s picture is already {'blurred' if want else 'shown unblurred'}")
    x = im.entry.concrete
    item = Item(f"picture-{slug}", "flag", getattr(x, "title", None) or getattr(x, "name", slug), now, entry=im.entry)
    return item, {"item": item.key, "kind": "flag", "decision": "flag", "entry": slug, "image": im.pk, "sensitive": want,
                  "note": clean_note(data.get("note"))}


def check(data, actor: str, decision: str, now=None) -> tuple[Item, dict]:
    """Validate a decision against the database now (before the OpsAction is written). → (item, params)"""
    now = now or timezone.now()
    if decision == "flag":
        return check_flag(data, now)
    key = (data.get("item") or "").strip()
    item = find(key, now)
    if item is None:
        raise ReviewError(f"{key or '(no item)'} is no longer waiting for review: someone decided it, or it changed")
    in_backlog = bool(item.backlog)
    if decision == "restore" and not in_backlog:
        raise ReviewError(f"{key} is not in the backlog")
    if decision != "restore" and in_backlog:
        raise ReviewError(f"{key} is in the backlog: bring it back first")
    if item.kind == "agent" and item.holder and item.holder != actor:
        raise ReviewError(f"{item.holder} holds {key} now (until its lease ends or it is done): an agent is on it")
    params = {"item": key, "kind": item.kind, "decision": decision, "note": clean_note(data.get("note"))}
    if item.kind in ("image", "flag") and decision == "approve":
        params["sensitive"] = data.get("sensitive") in TRUE
    if decision in ("approve", "deny") and item.kind in ("claim", "agent"):
        url = (data.get("url") or "").strip()
        d = detail(item)
        urls = [r["url"] for r in d["read"]] + [r["url"] for r in d["evidence"]]
        if len(set(urls)) == 1 and not url:
            url = urls[0]
        if url not in urls:
            raise ReviewError("choose the page you read" if not url else f"{url} is not one of this claim's pages")
        params["url"] = url
        if decision == "approve":
            excerpt = " ".join((data.get("excerpt") or "").split())
            if len(excerpt.split()) > EXCERPT_WORDS:
                raise ReviewError(f"an excerpt is at most {EXCERPT_WORDS} words, copied from the page")
            params["excerpt"] = excerpt
        else:
            params["contradicts"] = data.get("contradicts") in ("1", "on", "true", True)
    if decision == "approve" and item.kind == "task":
        source = (data.get("source") or "").strip()
        if not source and not params["note"]:
            raise ReviewError("name a page agents can read, or write what the page says: approve hands the task back with it")
        if source:
            pol = policy_of(source) if source.startswith(("http://", "https://")) else {"may_fetch": False, "why": "not an http(s) URL"}
            if not pol["may_fetch"]:
                raise ReviewError(f"agents may not read {source} by script ({pol['why']}): name another page, or write a summary instead")
        params["source"] = source
    return item, params


def _take(task: AgentTask, actor: str, now) -> None:
    """The owner holds the task for the moment of the decision: their own lease, or a task waiting for a person
    (which no agent is offered), or an agent-workable one nobody holds (claimed for them now)."""
    task.refresh_from_db()
    if task.status == AgentTask.Status.CLAIMED and task.claimed_by == actor:
        return
    if task.status == AgentTask.Status.QUEUED and "needs" in (task.payload or {}):
        task.status, task.claimed_by, task.claimed_at = AgentTask.Status.CLAIMED, actor, now
        task.lease_until = now + timedelta(minutes=queue.HUMAN_LEASE_MINUTES)
        task.save(update_fields=["status", "claimed_by", "claimed_at", "lease_until"])
        return
    try:
        queue.claim_for(task.pk, agent=actor)
    except queue.TaskError as e:
        raise ReviewError(str(e)) from e


def _reason(params: dict, what: str) -> str:
    return f"review ({params['item']}): {what}" + (f": {params['note']}" if params.get("note") else "")


def _decide_claim(task: AgentTask, params: dict, actor: str, action_pk: int, now) -> dict:
    from agentapi import apply as A
    from agentapi.evidence import problems_of, result_mismatches
    from revisions import revising

    claim = _claim(task)
    if claim is None:
        raise ReviewError(f"task #{task.pk} names no claim")
    approve = params["decision"] == "approve"
    stance = "supports" if approve else ("conflicts" if params.get("contradicts") else "unrelated")
    ev = {"url": params["url"], "stance": stance, "method": "browser_read"}
    if params.get("excerpt"):
        ev["excerpt"] = params["excerpt"]
    result = {"claim": claim.pk, "evidence": [ev]}
    if params.get("note"):
        result["note"] = params["note"]
    if bad := problems_of(result_mismatches("verify_claim", result)):
        raise ReviewError("; ".join(bad))
    _take(task, actor, now)
    what = (f"read {params['url']} in a browser: it supports the claim" if approve else
            f"read {params['url']} in a browser: it {'contradicts' if stance == 'conflicts' else 'does not support'} the claim")
    try:
        with revising(actor, reason=_reason(params, what)[:2000], task=task):
            applied = A.verify_claim(task, result, actor)
    except A.ApplyError as e:
        raise ReviewError(str(e)) from e
    result |= {"decision": params["decision"], "by": actor, "via": "review", "action": action_pk, "applied": applied}
    queue.complete(task.pk, agent=actor, result=result)
    return {"task": task.pk, "claim": claim.pk, "stance": stance, "status": applied["status"], "confidence": applied["confidence"]}


def _decide_draft(entry: Entry, params: dict, actor: str, action_pk: int) -> dict:
    from timeline import edits

    reason = _reason(params, "approved after reading its sources in a browser" if params["decision"] == "approve" else "rejected")
    if params["decision"] == "approve":
        rec = Claim.objects.filter(entry=entry, field="as_written", key="", parent__isnull=True).first()
        urls = [r["url"] for r in (_evidence_rows(rec) if rec else []) if r["person_read"] and r["stance"] in ("supports", "partial")]
        ops = [{"op": "add_evidence", "entry": entry.slug, "url": u, "stance": "supports", "method": "browser_read", "reason": reason} for u in urls]
        ops.append({"op": "approve", "entry": entry.slug, "reason": reason})
    else:
        ops = [{"op": "reject", "entry": entry.slug, "reason": reason}]
    try:
        out = edits.apply(ops, actor=actor, source=f"ops-review-{action_pk}.edits.json")
    except edits.EditsInvalid as e:
        raise ReviewError("; ".join(p.split(": ", 1)[-1] for p in e.problems)) from e
    entry.refresh_from_db()
    return {"entry": entry.slug, "status": entry.status, "ops": dict(out.counts), "revisions": out.revisions, "txid": out.txid}


def _decide_task(task: AgentTask, params: dict, actor: str, action_pk: int, now) -> dict:
    if params["decision"] == "deny":
        out = queue.cancel([task.pk], by=actor, reason=params["note"] or "denied from the Review page")
        if task.pk not in out["done"]:
            raise ReviewError(f"task #{task.pk} could not be cancelled: {out['skipped'].get(task.pk)}")
        return {"task": task.pk, "status": "cancelled"}
    lead = f"a readable source: {params['source']}" if params.get("source") else "the owner's summary"
    out = queue.requeue([task.pk], by=actor, reason=f"from the Review page with {lead}" + (f": {params['note']}" if params["note"] else ""))
    if task.pk not in out["done"]:
        raise ReviewError(f"task #{task.pk} could not be handed back: {out['skipped'].get(task.pk)}")
    task.refresh_from_db()
    task.payload = {**(task.payload or {}), "owner_read": {
        "by": actor, "at": now.isoformat(timespec="seconds"), "action": action_pk, "source": params.get("source") or None,
        "summary": params["note"] or None,
        "note": ("The owner read the page this task couldn't. `source` is a page an agent may fetch (GET policy says so): read it and "
                 "cite it if it supports the event. `summary` is the owner's account of the unreadable page: a lead for what to "
                 "look for, never a source; cite only pages you read.")}}
    task.save(update_fields=["payload"])
    return {"task": task.pk, "status": "queued", "owner_read": True}


def _defer_task(task: AgentTask, params: dict, actor: str, action_pk: int, now) -> dict:
    task.refresh_from_db()
    if task.status == AgentTask.Status.CLAIMED:
        if task.claimed_by != actor and task.lease_until and task.lease_until >= now:
            raise ReviewError(f"{task.claimed_by} holds task #{task.pk}")
        task.status, task.claimed_by, task.lease_until = AgentTask.Status.QUEUED, "", None
    elif task.status != AgentTask.Status.QUEUED:
        raise ReviewError(f"task #{task.pk} is {task.status}")
    p = dict(task.payload or {})
    mark = {"by": actor, "at": now.isoformat(timespec="seconds"), "note": params["note"], "action": action_pk}
    if isinstance(p.get("needs"), dict):
        p["needs"] = {**p["needs"], "backlog": mark}
    else:  # an item agents could do: the defer is what keeps them off it
        p["needs"] = {"kind": "owner", "by": actor, "at": mark["at"], "reason": "deferred to the backlog from the Review page",
                      "backlog": {**mark, "from_defer": True}}
    task.payload = p
    queue._note(task, actor, "deferred to the owner's backlog" + (f": {params['note']}" if params["note"] else ""))
    task.save(update_fields=["status", "claimed_by", "lease_until", "payload", "error"])
    return {"task": task.pk, "backlog": True}


def _restore_task(task: AgentTask, params: dict, actor: str) -> dict:
    task.refresh_from_db()
    p = dict(task.payload or {})
    needs = dict(p.get("needs") or {})
    mark = needs.pop("backlog", None) or {}
    if mark.get("from_defer"):
        p.pop("needs", None)
        where = "the agents' queue"
    else:
        p["needs"] = needs
        where = "review"
    task.payload = p
    queue._note(task, actor, f"brought back from the owner's backlog to {where}" + (f": {params['note']}" if params["note"] else ""))
    task.save(update_fields=["payload", "error"])
    return {"task": task.pk, "to": where}


def _set_draft_backlog(slug: str, mark: dict | None) -> None:
    with transaction.atomic():
        row, _ = JobState.objects.select_for_update().get_or_create(name=STATE, defaults={"state": {}})
        st = dict(row.state or {})
        held = dict(st.get("backlog") or {})
        if mark is None:
            held.pop(slug, None)
        else:
            held[slug] = mark
        st["backlog"] = held
        row.state = st
        row.save(update_fields=["state", "updated_at"])


def _decide_image(c: ImageCandidate, params: dict, actor: str, action_pk: int, now) -> dict:
    from ingest import images as I

    d = params["decision"]
    c = ImageCandidate.objects.select_for_update().get(pk=c.pk)
    if d == "defer":
        c.backlog = {"by": actor, "at": now.isoformat(timespec="seconds"), "note": params["note"], "action": action_pk}
        c.save(update_fields=["backlog"])
        return {"image": c.pk, "backlog": True}
    if d == "restore":
        c.backlog = {}
        c.save(update_fields=["backlog"])
        return {"image": c.pk, "to": "review"}
    if c.kind == ImageCandidate.Kind.FLAG:
        keep = params.get("sensitive", False) if d == "approve" else False
        if c.image is None:
            raise ReviewError(f"image-{c.pk}'s picture is no longer attached")
        changed = I.set_flag(c.image, keep, actor=actor, reason=_reason(params, "sensitive flag " + ("kept" if keep else "cleared")))
        ImageCandidate.objects.filter(pk=c.pk).update(status=ImageCandidate.Status.ATTACHED if keep else ImageCandidate.Status.DENIED,
                                                      sensitive=keep, decided_by=actor, decided_at=now)
        return {"image": c.image_id, "entry": c.entry.slug, "sensitive": keep, "changed": changed == "updated"}
    if d == "approve":
        if c.entry.images.exists():
            raise ReviewError(f"{c.entry.slug} has a picture already: deny this one, or remove that one in the admin first")
        im = I.attach(c, actor=actor, sensitive=params.get("sensitive", False),
                      reason=_reason(params, f"picture {c.source} {c.source_id} attached ({c.license})" + (", blurred" if params.get("sensitive") else "")))
        return {"image": im.pk, "entry": c.entry.slug, "sensitive": im.sensitive, "license": im.license}
    nxt = I.deny(c, actor=actor, now=now)
    return {"candidate": c.pk, "entry": c.entry.slug, "denied": True, "next": nxt.pk if nxt else None}


def _decide_flag(params: dict, actor: str, now) -> dict:
    from ingest import images as I
    from timeline.models import Image

    im = Image.objects.select_for_update().filter(pk=params["image"]).first()
    if im is None:
        raise ReviewError(f"{params['entry']}'s picture is gone")
    changed = I.set_flag(im, params["sensitive"], actor=actor, reason=_reason(params, "sensitive flag " + ("set" if params["sensitive"] else "cleared")))
    ImageCandidate.objects.filter(image=im, kind=ImageCandidate.Kind.FLAG, status=ImageCandidate.Status.REVIEW).update(
        status=ImageCandidate.Status.ATTACHED if params["sensitive"] else ImageCandidate.Status.DENIED, sensitive=params["sensitive"],
        decided_by=actor, decided_at=now)
    return {"image": im.pk, "entry": params["entry"], "sensitive": params["sensitive"], "changed": changed == "updated"}


def decide(params: dict, *, actor: str, action_pk: int) -> dict:
    """Carry out a checked decision (inside the action's transaction). Raises ReviewError."""
    now = timezone.now()
    if params["decision"] == "flag":
        return _decide_flag(params, actor, now)
    item = find(params["item"], now)
    if item is None:
        raise ReviewError(f"{params['item']} is no longer waiting for review")
    d = params["decision"]
    if bool(item.backlog) != (d == "restore"):
        raise ReviewError(f"{params['item']} " + ("is not in the backlog" if d == "restore" else "is in the backlog now"))
    if item.image is not None:
        return _decide_image(item.image, params, actor, action_pk, now)
    if item.task is not None:
        t = AgentTask.objects.select_for_update().get(pk=item.task.pk)
        if d == "defer":
            return _defer_task(t, params, actor, action_pk, now)
        if d == "restore":
            return _restore_task(t, params, actor)
        if item.kind in ("claim", "agent"):
            return _decide_claim(t, params, actor, action_pk, now)
        return _decide_task(t, params, actor, action_pk, now)
    slug = item.entry.slug
    if d == "defer":
        _set_draft_backlog(slug, {"by": actor, "at": now.isoformat(timespec="seconds"), "note": params["note"], "action": action_pk})
        return {"entry": slug, "backlog": True}
    if d == "restore":
        _set_draft_backlog(slug, None)
        return {"entry": slug, "to": "review"}
    return _decide_draft(item.entry, params, actor, action_pk)
