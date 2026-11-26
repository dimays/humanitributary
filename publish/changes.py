"""The change report written next to every snapshot: what a release adds, changes and retracts compared with the
release readers had before it, grouped by branch (docs/adr/0019-processes-and-release-gates.md).

Deterministic: the same two snapshots give the same report, byte for byte (no timestamps, sorted keys and ids).
"""

import json
from collections import defaultdict


def _index(content: dict | None) -> dict[str, tuple[str, dict]]:
    """id → (kind, entry)."""
    if not content:
        return {}
    out = {b["id"]: ("branch", b) for b in content.get("branches", [])}
    out |= {e["id"]: ("event", e) for e in content.get("events", [])}
    return out


def _branch_of(kind: str, x: dict) -> str:
    return x["id"] if kind == "branch" else x["branch"]


def _label(kind: str, x: dict) -> str:
    return x.get("name") if kind == "branch" else x.get("title", "")


def report(prev: dict | None, new: dict, *, from_version: str | None, to_version: str) -> dict:
    a, b = _index(prev), _index(new)
    by_branch = defaultdict(lambda: {"added": [], "changed": [], "retracted": []})
    for i, (kind, x) in b.items():
        if i not in a:
            by_branch[_branch_of(kind, x)]["added"].append({"id": i, "kind": kind, "label": _label(kind, x)})
        else:
            old = a[i][1]
            fields = sorted(k for k in set(old) | set(x) if old.get(k) != x.get(k))
            if fields:
                moved = kind == "event" and old.get("branch") != x.get("branch")
                row = {"id": i, "kind": kind, "label": _label(kind, x), "fields": fields}
                if moved:
                    row["from_branch"] = old["branch"]
                by_branch[_branch_of(kind, x)]["changed"].append(row)
    for i, (kind, x) in a.items():
        if i not in b:
            by_branch[_branch_of(kind, x)]["retracted"].append({"id": i, "kind": kind, "label": _label(kind, x)})
    groups = {}
    for branch in sorted(by_branch):
        g = by_branch[branch]
        groups[branch] = {k: sorted(v, key=lambda r: r["id"]) for k, v in g.items() if v}
    total = {k: sum(len(g.get(k, [])) for g in groups.values()) for k in ("added", "changed", "retracted")}
    return {"from": from_version, "to": to_version, "total": total, "by_branch": groups}


def to_json(rep: dict) -> bytes:
    return (json.dumps(rep, indent=1, sort_keys=True, ensure_ascii=False) + "\n").encode()


def to_markdown(rep: dict, *, limit: int = 12) -> bytes:
    t = rep["total"]
    lines = [f"# Release {rep['to']}", "",
             f"Since {rep['from'] or 'nothing (the first release)'}: {t['added']} added, {t['changed']} changed, {t['retracted']} retracted.", ""]
    for branch, g in rep["by_branch"].items():
        counts = ", ".join(f"{len(g[k])} {k}" for k in ("added", "changed", "retracted") if g.get(k))
        lines.append(f"## {branch} ({counts})")
        for k in ("added", "changed", "retracted"):
            rows = g.get(k, [])
            for r in rows[:limit]:
                extra = f" [{', '.join(r['fields'])}]" if k == "changed" else ""
                lines.append(f"- {k}: `{r['id']}` {r['label']}{extra}")
            if len(rows) > limit:
                lines.append(f"- … and {len(rows) - limit} more {k}")
        lines.append("")
    return ("\n".join(lines).rstrip() + "\n").encode()
