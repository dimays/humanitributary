"""Compare two snapshots structurally: entries matched by id, so a difference names the entry and the path in it."""


def _walk(a, b, path, out):
    if isinstance(a, dict) and isinstance(b, dict):
        for k in list(a) + [k for k in b if k not in a]:
            if k not in a:
                out.append(f"{path}.{k}: only in second ({b[k]!r:.80})")
            elif k not in b:
                out.append(f"{path}.{k}: only in first ({a[k]!r:.80})")
            else:
                _walk(a[k], b[k], f"{path}.{k}", out)
        if list(a) != list(b) and set(a) == set(b):
            out.append(f"{path}: key order differs")
    elif isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            out.append(f"{path}: length {len(a)} vs {len(b)}")
        for i, (x, y) in enumerate(zip(a, b)):
            _walk(x, y, f"{path}[{i}]", out)
    elif isinstance(a, bool) or isinstance(b, bool):
        if a is not b:
            out.append(f"{path}: {a!r} vs {b!r}")
    elif isinstance(a, (int, float)) and isinstance(b, (int, float)):
        if a != b:
            out.append(f"{path}: {a!r} vs {b!r}")
    elif a != b:
        out.append(f"{path}: {a!r:.80} vs {b!r:.80}")


def differences(a: dict, b: dict) -> list[str]:
    out = []
    for kind in ("branches", "events"):
        xa, xb = a.get(kind, []), b.get(kind, [])
        ida, idb = [x["id"] for x in xa], [x["id"] for x in xb]
        if ida != idb:
            sa, sb = set(ida), set(idb)
            for i in sorted(sa - sb)[:20]:
                out.append(f"{kind} {i}: only in first")
            for i in sorted(sb - sa)[:20]:
                out.append(f"{kind} {i}: only in second")
            if sa == sb:
                out.append(f"{kind}: same ids in a different order")
        mb = {x["id"]: x for x in xb}
        for x in xa:
            if x["id"] in mb:
                _walk(x, mb[x["id"]], f"{kind} {x['id']}", out)
    for k in set(a) ^ set(b):
        out.append(f"top-level key {k!r} only in one")
    return out
