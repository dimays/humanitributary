"""Applying a decision is mechanical: a proposal's operations, run through the service layer (docs/branch-rules.md,
"Applying and reverting").

    {"op": "move",  "event": "w508-chavin", "branch": "first-americans-andes"}
    {"op": "patch", "id": "eu", "fields": {"name": …, "start": …, "start_when": …, "end": …, "end_when": …, "text": …,
                                            "region": …, "parents": [...], "into": [...], "title": …, "when": …, "y": …, "imp": …}}
    {"op": "merge", "from": "ecsc", "into": "eu"}
    {"op": "create_branch", "id": "…", "fields": {"name", "region", "start", "end", "start_when", "end_when", "parents", "text",
                                                  "cites": [{"t": …, "u": …, "k": …}]}}
    {"op": "map_entity", "qid": "Q…", "branch": "…", "role": "…"}     (ingest routing, not canonical)

These are the static site's restructure operations (site/restructure.mjs: move, patch, merge, plus TL.add for a new
branch), with the same semantics, so `legacy_js()` can write the same change as a data file: until the cutover the
legacy files are imported over Postgres (ADR 0001), and a change made only here would be undone by the next
`make import`.

`apply()` runs them in one `revising()` block and records its transaction id; `revert()` undoes exactly the rows that
transaction changed, from their Revisions (before → after), refusing if any of those rows changed since.
"""

import json

from django.apps import apps
from django.db import connection
from django.utils import timezone

from evidence.conflicts import citation_for
from evidence.models import Claim, Evidence
from revisions import revising
from revisions.models import Revision
from timeline import services
from timeline.models import Branch, BranchLink, Connection, Event, EventLink, Image, Location, Region, Status

from .rules import PLACEHOLDER

BRANCH_FIELDS = {"name", "start", "end", "start_when", "end_when", "text", "region", "parents", "into"}
EVENT_FIELDS = {"title", "when", "y", "end", "imp", "text", "link"}
JS_NAMES = {"start_when": "startWhen", "end_when": "endWhen"}


class OperationError(Exception):
    pass


def validate(ops: list[dict]) -> list[str]:
    """Problems that must be fixed before the operations may run (placeholders an agent has not written yet …)."""
    out = []
    created = {o["id"] for o in ops if o.get("op") == "create_branch"}
    for i, o in enumerate(ops):
        kind = o.get("op")
        if kind == "create_branch":
            f = o.get("fields", {})
            for k in ("name", "text", "start_when", "region"):
                if not f.get(k) or PLACEHOLDER in str(f.get(k)):
                    out.append(f"op {i} create_branch {o['id']}: write its {k}")
            if not f.get("cites"):
                out.append(f"op {i} create_branch {o['id']}: cite at least one source that supports its text")
            if Branch.objects.filter(slug=o["id"]).exists():
                out.append(f"op {i}: branch {o['id']} already exists")
        elif kind == "patch":
            for k, v in o.get("fields", {}).items():
                if isinstance(v, str) and PLACEHOLDER in v:
                    out.append(f"op {i} patch {o['id']}: write its {k}")
        elif kind == "move":
            if not Event.objects.filter(slug=o["event"]).exists():
                out.append(f"op {i}: no event {o['event']}")
            if o["branch"] not in created and not Branch.objects.filter(slug=o["branch"]).exists():
                out.append(f"op {i}: no branch {o['branch']}")
        elif kind == "merge":
            for s in (o["from"], o["into"]):
                if not Branch.objects.filter(slug=s).exists():
                    out.append(f"op {i}: no branch {s}")
        elif kind != "map_entity":
            out.append(f"op {i}: unknown op {kind!r}")
    return out


def _set_links(branch: Branch, relation: str, slugs: list[str]):
    """Make a branch's parent or into list exactly `slugs`, in order (origin links stay, after them)."""
    want = [Branch.objects.get(slug=s) for s in slugs]
    have = {link.target_id: link for link in BranchLink.objects.filter(branch=branch, relation=relation)}
    for i, t in enumerate(want):
        link = have.pop(t.pk, None)
        if link is None:
            services.apply_changes(BranchLink(branch=branch, target=t, relation=relation), {"position": i})
        else:
            services.apply_changes(link, {"position": i})
    for j, link in enumerate(sorted(have.values(), key=lambda link: link.position)):
        if link.origin_position is not None:
            services.apply_changes(link, {"position": len(want) + j})
        else:
            services.delete(link)


def _patch(slug: str, fields: dict):
    fields = dict(fields)
    b = Branch.objects.filter(slug=slug).first()
    if b is not None:
        bad = set(fields) - BRANCH_FIELDS
        if bad:
            raise OperationError(f"patch {slug}: not patchable on a branch: {sorted(bad)}")
        parents, into = fields.pop("parents", None), fields.pop("into", None)
        if "region" in fields:
            fields["region"] = Region.objects.get(slug=fields["region"])
        services.save_branch(slug, **fields)
        if parents is not None:
            _set_links(b, "parent", parents)
        if into is not None:
            _set_links(b, "into", into)
        return
    e = Event.objects.get(slug=slug)
    bad = set(fields) - EVENT_FIELDS
    if bad:
        raise OperationError(f"patch {slug}: not patchable on an event: {sorted(bad)}")
    link = fields.pop("link", None)
    services.save_event(slug, **fields)
    if link is not None:
        for el in EventLink.objects.filter(event=e):
            services.delete(el)
        if link and link != e.branch.slug:
            services.apply_changes(EventLink(event=e, branch=Branch.objects.get(slug=link)), {"position": 0})


def _move(event_slug: str, branch_slug: str):
    ev, _ = services.save_event(event_slug, branch=branch_slug)
    for el in EventLink.objects.filter(event=ev, branch=ev.branch):  # a link to its own branch means nothing
        services.delete(el)


def _merge(frm: str, into: str):
    """TL.merge: every reference to `frm` now points at `into`; `frm` is retracted (its own rows stay, for history)."""
    a, b = Branch.objects.get(slug=frm), Branch.objects.get(slug=into)
    for ev in Event.objects.filter(branch=a).order_by("sort_key"):
        services.save_event(ev.slug, branch=b)
    for el in EventLink.objects.filter(branch=a).select_related("event"):
        if el.event.branch_id == b.pk or EventLink.objects.filter(event=el.event, branch=b).exists():
            services.delete(el)
        else:
            services.apply_changes(el, {"branch": b})
    for el in EventLink.objects.filter(event__branch=b, branch=b):
        services.delete(el)
    for link in BranchLink.objects.filter(target=a).exclude(branch=a).select_related("branch"):
        if link.branch_id == b.pk or BranchLink.objects.filter(branch=link.branch, target=b, relation=link.relation).exists():
            services.delete(link)
        else:
            services.apply_changes(link, {"target": b})
    for c in Connection.objects.filter(target=a):
        if c.source_id == b.pk:
            services.delete(c)
        else:
            services.apply_changes(c, {"target": b})
    if not Location.objects.filter(entry=b).exists():
        for loc in Location.objects.filter(entry=a):
            services.apply_changes(loc, {"entry": b.entry_ptr})
    if not Image.objects.filter(entry=b).exists():
        for im in Image.objects.filter(entry=a):
            services.apply_changes(im, {"entry": b.entry_ptr})
    # The merged branch's citations join the survivor's (TL.merge appends those it lacks).
    src = Claim.objects.filter(entry=a, field="as_written", key="").first()
    dst = Claim.objects.filter(entry=b, field="as_written", key="").first()
    if src and dst:
        have = set(dst.evidence.values_list("citation_id", flat=True))
        pos = (max(dst.evidence.values_list("position", flat=True), default=-1)) + 1
        for ev in src.evidence.order_by("position"):
            if ev.citation_id in have:
                continue
            services.apply_changes(Evidence(claim=dst, citation_id=ev.citation_id, position=pos), {
                "stance": ev.stance, "excerpt": ev.excerpt, "checked_at": ev.checked_at, "checked_by": ev.checked_by, "method": ev.method,
                "cited_title": ev.cited_title, "cited_kind": ev.cited_kind, "content_hash": ev.content_hash})
            have.add(ev.citation_id)
            pos += 1
    services.apply_changes(a, {"status": Status.RETRACTED})


def _create_branch(slug: str, fields: dict, actor: str):
    f = dict(fields)
    cites, parents = f.pop("cites", []), f.pop("parents", [])
    into = f.pop("into", [])
    b, _ = services.save_branch(slug, status=Status.PUBLISHED, why="", origin_note=None, **f)
    _set_links(b, "parent", parents)
    _set_links(b, "into", into)
    claim = Claim(entry=b.entry_ptr, field="as_written", key="")
    services.apply_changes(claim, {"value": {"name": b.name, "startWhen": b.start_when, "endWhen": b.end_when, "text": b.text, "parents": parents, "into": into}})
    for i, c in enumerate(cites):
        cit = citation_for(c["u"], c["t"])
        if cit is None:
            raise OperationError(f"create_branch {slug}: {c['u']} cannot be cited")
        services.apply_changes(Evidence(claim=claim, citation=cit, position=i), {
            "stance": "supports", "cited_title": c["t"], "cited_kind": c.get("k", ""), "checked_by": actor, "method": "agent_read",
            "checked_at": timezone.now(), "excerpt": c.get("excerpt", "")})


def _map_entity(qid: str, branch: str, role: str, actor: str):
    from ingest.models import BranchEntity, Entity

    ent = Entity.objects.filter(qid=qid).first()
    if ent is None:
        return
    BranchEntity.objects.get_or_create(branch=Branch.objects.get(slug=branch), entity=ent, defaults={"role": role or "", "created_by": actor})


def run(ops: list[dict], actor: str) -> None:
    """Run operations in order (inside revising()), in the static site's order: creations, patches, merges, moves."""
    order = {"create_branch": 0, "patch": 1, "merge": 2, "move": 3, "map_entity": 4}
    for o in sorted(ops, key=lambda o: order.get(o["op"], 9)):
        if o["op"] == "create_branch":
            _create_branch(o["id"], o["fields"], actor)
        elif o["op"] == "patch":
            _patch(o["id"], o["fields"])
        elif o["op"] == "merge":
            _merge(o["from"], o["into"])
        elif o["op"] == "move":
            _move(o["event"], o["branch"])
        elif o["op"] == "map_entity":
            _map_entity(o["qid"], o["branch"], o.get("role", ""), actor)
        else:
            raise OperationError(f"unknown op {o['op']!r}")


def _txid() -> int:
    with connection.cursor() as c:
        c.execute("SELECT txid_current()")
        return c.fetchone()[0]


def apply(proposal, ops: list[dict] | None = None, *, actor: str, task=None, note: str = "") -> dict:
    """Run a proposal's operations (or the agent's final version of them) and mark it applied. → what was recorded.

    Without `ops`: the operations an agent accepted it with over the API (payload["accepted"]), else the rule's own."""
    if ops is None:
        ops = (proposal.payload.get("accepted") or {}).get("operations") or proposal.payload.get("operations", [])
    problems = validate(ops)
    if problems:
        raise OperationError("; ".join(problems))
    if proposal.status not in ("proposed", "accepted"):
        raise OperationError(f"proposal {proposal.pk} is {proposal.status}")
    with revising(actor, reason=f"apply branch proposal {proposal.pk} ({proposal.rule_id}){': ' + note if note else ''}", task=task):
        txid = _txid()
        first = (Revision.objects.order_by("-id").values_list("id", flat=True).first() or 0) + 1
        run(ops, actor)
        last = Revision.objects.order_by("-id").values_list("id", flat=True).first() or 0
    # The Revisions this apply wrote: its transaction, between these ids (an outer transaction may hold others).
    applied = {"txid": txid, "revision_ids": [first, last], "at": timezone.now().isoformat(), "by": actor, "operations": ops,
               "revisions": Revision.objects.filter(txid=txid, id__gte=first, id__lte=last).count()}
    proposal.payload = {**proposal.payload, "applied": applied}
    proposal.status, proposal.decided_by, proposal.decided_at = "applied", actor, timezone.now()
    if note:
        proposal.decision_note = note
    proposal.save(update_fields=["payload", "status", "decided_by", "decided_at", "decision_note"])
    return applied


def _model_for(table: str):
    for m in apps.get_models():
        if m._meta.db_table == table:
            return m
    raise OperationError(f"no model for table {table}")


CANONICAL_APPS = ("timeline", "evidence")


def _detach(table: str, pk: str):
    """Before un-inserting a canonical row, let go of what non-canonical tables hold on to it (metrics, tasks,
    routing, proposals about a branch that will no longer exist), by each relation's own on_delete rule."""
    from django.db import models as m

    model = _model_for(table)
    for rel in model._meta.related_objects:
        if rel.related_model._meta.app_label in CANONICAL_APPS or rel.related_model._meta.app_label == "revisions":
            continue
        if rel.many_to_many:
            through = rel.through if hasattr(rel, "through") else rel.field.remote_field.through
            for f in through._meta.fields:
                if f.is_relation and f.related_model is model:
                    through._base_manager.filter(**{f.name: pk}).delete()
            continue
        qs = rel.related_model._base_manager.filter(**{rel.field.name: pk})
        if rel.on_delete is m.SET_NULL:
            qs.update(**{rel.field.name: None})
        elif rel.on_delete is m.CASCADE:
            qs.delete()
        elif qs.exists():
            raise OperationError(f"{rel.related_model._meta.label} rows still point at {table} #{pk}")


def revert(proposal, *, actor: str, task=None, force: bool = False) -> dict:
    """Undo an applied proposal: every row its transaction changed goes back to its `before`, newest first."""
    applied = (proposal.payload or {}).get("applied")
    if proposal.status != "applied" or not applied:
        raise OperationError(f"proposal {proposal.pk} has not been applied")
    lo, hi = applied["revision_ids"]
    revs = list(Revision.objects.filter(txid=applied["txid"], id__gte=lo, id__lte=hi).order_by("-id"))
    rows = {(r.table_name, r.row_pk) for r in revs}
    last_id = revs[0].id if revs else 0
    later = [r for r in Revision.objects.filter(id__gt=last_id, table_name__in={t for t, _ in rows}).only("table_name", "row_pk", "id") if (r.table_name, r.row_pk) in rows]
    if later and not force:
        raise OperationError(f"{len(later)} of the rows it changed have changed since (e.g. {later[0].table_name} #{later[0].row_pk}): revert by hand, or --force")
    with revising(actor, reason=f"revert branch proposal {proposal.pk} ({proposal.rule_id})", task=task):
        txid = _txid()
        with connection.cursor() as c:
            for r in revs:
                pk_col = _model_for(r.table_name)._meta.pk.column
                t = connection.ops.quote_name(r.table_name)
                if r.action == "insert":
                    _detach(r.table_name, r.row_pk)
                    c.execute(f"DELETE FROM {t} WHERE {connection.ops.quote_name(pk_col)}::text = %s", [r.row_pk])
                elif r.action == "delete":
                    c.execute(f"INSERT INTO {t} SELECT * FROM jsonb_populate_record(NULL::{t}, %s::jsonb)", [json.dumps(r.before)])
                else:
                    cols = ", ".join(connection.ops.quote_name(col) for col in r.changed)
                    c.execute(f"UPDATE {t} SET ({cols}) = (SELECT {cols} FROM jsonb_populate_record(NULL::{t}, %s::jsonb)) "
                              f"WHERE {connection.ops.quote_name(pk_col)}::text = %s", [json.dumps(r.before), r.row_pk])
    reverted = {"txid": txid, "at": timezone.now().isoformat(), "by": actor, "rows": len(revs)}
    proposal.payload = {**proposal.payload, "reverted": reverted}
    proposal.status, proposal.decided_by, proposal.decided_at = "withdrawn", actor, timezone.now()
    proposal.decision_note = (proposal.decision_note + "\n" if proposal.decision_note else "") + f"reverted by {actor}"
    proposal.save(update_fields=["payload", "status", "decided_by", "decided_at", "decision_note"])
    return reverted


def _js(v) -> str:
    return json.dumps(v, ensure_ascii=False)


def legacy_js(proposal, ops: list[dict]) -> str:
    """The same change as a site/data file (TL.add / TL.patch / TL.merge / TL.move), so the legacy import keeps it."""
    lines = [f"// Branch proposal {proposal.pk} ({proposal.rule_id}), applied with `manage.py branches apply`: {proposal.summary[:200]}", ""]
    for o in ops:
        if o["op"] == "create_branch":
            f = o["fields"]
            b = {"id": o["id"], "name": f["name"], "region": f["region"], "start": f["start"], "end": f.get("end"), "startWhen": f["start_when"]}
            if f.get("end_when") is not None:
                b["endWhen"] = f["end_when"]
            b |= {"parents": f.get("parents", []), "into": f.get("into", []), "text": f["text"],
                  "cites": [{k: c[k] for k in ("t", "u", "k") if c.get(k)} for c in f.get("cites", [])]}
            lines.append(f"TL.add({{ branches: [{_js(b)}] }});")
    for o in ops:
        if o["op"] == "patch":
            lines.append(f"TL.patch({_js(o['id'])}, {_js({JS_NAMES.get(k, k): v for k, v in o['fields'].items()})});")
    for o in ops:
        if o["op"] == "merge":
            lines.append(f"TL.merge({_js(o['from'])}, {_js(o['into'])});")
    for o in ops:
        if o["op"] == "move":
            lines.append(f"TL.move({_js(o['event'])}, {_js(o['branch'])});")
    return "\n".join(lines) + "\n"
