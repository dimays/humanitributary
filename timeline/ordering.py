"""Entry order: a sort key assigned once, stable under insertion and deletion (docs/adr/0008-entry-order.md).

The page breaks ties in its sorts by array order, so the snapshot lists entries in a fixed order (ADR 0007). That
order is `Entry.sort_key`: a fractional index, a string of base-62 digits read as a fraction (0.k₁k₂k₃…) and compared
byte by byte (the column uses the "C" collation, so Postgres sorts exactly as Python does). Between any two keys
there is always another, so

- inserting an entry writes one key (between its neighbours), and nothing else moves;
- deleting or retracting an entry writes nothing;
- moving an entry writes its key only.

`reconcile()` brings the keys in line with a desired order (the legacy files' order, on import) with as few writes
as possible: the longest run of entries already in order keeps its keys, and only the rest get new ones.
"""

from bisect import bisect_left, bisect_right

DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"  # ASCII order, so "C" collation agrees
BASE = len(DIGITS)
_INDEX = {c: i for i, c in enumerate(DIGITS)}


def _check(key: str) -> None:
    if not key or key[-1] == "0" or any(c not in _INDEX for c in key):
        raise ValueError(f"not a sort key: {key!r}")


def _midpoint(a: str, b: str | None) -> str:
    """A digit string strictly between fractions 0.a and 0.b (b None = 1). Neither ends in "0"; a may be ""."""
    if b is not None:
        n = 0
        while n < len(b) and (a[n] if n < len(a) else "0") == b[n]:
            n += 1
        if n:
            return b[:n] + _midpoint(a[n:], b[n:])
    da = _INDEX[a[0]] if a else 0
    db = _INDEX[b[0]] if b is not None else BASE
    if db - da > 1:
        return DIGITS[(da + db) // 2]
    if b is not None and len(b) > 1:
        return b[0]
    return DIGITS[da] + _midpoint(a[1:], None)


def between(lo: str | None, hi: str | None) -> str:
    """A key that sorts after `lo` and before `hi` (None = open end)."""
    if lo is not None:
        _check(lo)
    if hi is not None:
        _check(hi)
        if lo is not None and not lo < hi:
            raise ValueError(f"{lo!r} is not before {hi!r}")
    return _midpoint(lo or "", hi)


def spread(n: int, lo: str | None = None, hi: str | None = None) -> list[str]:
    """`n` increasing keys between lo and hi, evenly bisected so they stay short."""
    if n <= 0:
        return []
    if lo is None and hi is None:
        # A fresh list: fixed-width keys at even steps (with room for about 60 inserts between neighbours before a
        # key grows by one digit).
        width = 1
        while BASE**width < 64 * (n + 1):
            width += 1
        out = []
        for i in range(1, n + 1):
            v, digits = i * BASE**width // (n + 1), []
            for _ in range(width):
                v, d = divmod(v, BASE)
                digits.append(DIGITS[d])
            out.append("".join(reversed(digits)).rstrip("0"))
        return out
    m = n // 2
    mid = between(lo, hi)
    return spread(m, lo, mid) + [mid] + spread(n - m - 1, mid, hi)


def _longest_increasing(keys: list[str]) -> set[int]:
    """Indexes of one longest strictly increasing subsequence of `keys` (patience sorting, O(n log n))."""
    tails, tails_idx, prev = [], [], [-1] * len(keys)
    for i, k in enumerate(keys):
        j = bisect_left(tails, k)
        if j == len(tails):
            tails.append(k)
            tails_idx.append(i)
        else:
            tails[j], tails_idx[j] = k, i
        prev[i] = tails_idx[j - 1] if j else -1
    out, i = set(), tails_idx[-1] if tails_idx else -1
    while i != -1:
        out.add(i)
        i = prev[i]
    return out


def reconcile(order: list[str], current: dict[str, str | None], others: list[str] = ()) -> dict[str, str]:
    """New keys for the entries of `order` (ids, in the order wanted) whose current key is missing or out of order.

    current: id → its key now (None or absent = no key yet). others: keys held by entries outside `order` (left where
    they are; new keys are placed so as not to collide with them). Returns only the ids whose key must change.
    """
    have = [(i, current.get(x)) for i, x in enumerate(order) if current.get(x)]
    keep = {have[j][0] for j in _longest_increasing([k for _, k in have])}
    taken = sorted(set(others) | {current[order[i]] for i in keep})
    out, run, lo = {}, [], None

    def flush(hi):
        if not run:
            return
        # Stop short of any key between the anchors that belongs to an entry not in `order`.
        j = bisect_right(taken, lo) if lo is not None else 0
        cap = taken[j] if j < len(taken) else None
        top = cap if hi is None or (cap is not None and cap < hi) else hi
        for x, k in zip(run, spread(len(run), lo, top)):
            out[x] = k
        run.clear()

    for i, x in enumerate(order):
        if i in keep:
            flush(current[x])
            lo = current[x]
        else:
            run.append(x)
    flush(None)
    return out
