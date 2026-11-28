"""Entry order: a sort key per entry, stable under insertion and deletion (docs/adr/0008-entry-order.md, ADR 0045).

The page breaks ties in its sorts by array order, so the snapshot lists entries in a fixed order (ADR 0007). That
order is `Entry.sort_key`: a fractional index, a string of base-62 digits read as a fraction (0.k₁k₂k₃…) and compared
byte by byte (the column uses the "C" collation, so Postgres sorts exactly as Python does). Between any two keys
there is always another, so

- inserting an entry writes one key (between its neighbours), and nothing else moves, until that key would be longer
  than `MAX_LEN`: then `respace()` gives a neighbourhood around the insertion point fresh, short keys, in the same
  relative order (ADR 0045);
- deleting or retracting an entry writes nothing;
- moving an entry writes its key only (with the same exception).

Keys are kept short two ways (ADR 0045). `between()` picks the key with the fewest digits in the gap (the middle one
of those), and an append (no upper neighbour) takes a small step past the last key, 1/BASE² of the room left, rather
than halving the way to the end: halving added a digit every six appends, and a few hundred new events since the
import had pushed the last keys past the column's 64 characters. Inserting again and again at one point still halves
its gap (a digit every six inserts), which `respace()` absorbs.

`reconcile()` brings the keys in line with a desired order (the legacy files' order, on import) with as few writes
as possible: the longest run of entries already in order keeps its keys, and only the rest get new ones.
"""

import math
from bisect import bisect_left, bisect_right
from fractions import Fraction

DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"  # ASCII order, so "C" collation agrees
BASE = len(DIGITS)
_INDEX = {c: i for i, c in enumerate(DIGITS)}

MAX_LEN = 16  # a new key longer than this respaces its neighbourhood instead (the column holds 255: a backstop)
RESPACED_LEN = 8  # respace() widens its window until the fresh keys are at most this long
APPEND_STEP = BASE**2  # an append uses 1/APPEND_STEP of the room after the last key


def _check(key: str) -> None:
    if not key or key[-1] == "0" or any(c not in _INDEX for c in key):
        raise ValueError(f"not a sort key: {key!r}")


def _value(key: str) -> Fraction:
    n = 0
    for c in key:
        n = n * BASE + _INDEX[c]
    return Fraction(n, BASE ** len(key))


def _digits(n: int, width: int) -> str:
    out = []
    for _ in range(width):
        n, d = divmod(n, BASE)
        out.append(DIGITS[d])
    return "".join(reversed(out)).rstrip("0")


def _shortest(lo: Fraction, hi: Fraction) -> str:
    """The key with the fewest digits strictly between fractions lo and hi (0 ≤ lo < hi ≤ 1): the middle one of those.

    At the shortest width no candidate ends in "0" (it would be a shorter key in the gap), so the result is a key."""
    width = 1
    while True:
        scale = BASE**width
        first, last = math.floor(lo * scale) + 1, math.ceil(hi * scale) - 1
        if first <= last:
            return _digits((first + last) // 2, width)
        width += 1


def between(lo: str | None, hi: str | None) -> str:
    """A key that sorts after `lo` and before `hi` (None = open end), with as few digits as the gap allows.

    With an open end the key takes a small step from the closed one (an append or a prepend), so repeated appends
    grow a key by one digit only every few thousand entries."""
    if lo is not None:
        _check(lo)
    if hi is not None:
        _check(hi)
        if lo is not None and not lo < hi:
            raise ValueError(f"{lo!r} is not before {hi!r}")
    a = _value(lo) if lo is not None else Fraction(0)
    b = _value(hi) if hi is not None else Fraction(1)
    if lo is not None and hi is None:
        b = a + (1 - a) / APPEND_STEP
    elif lo is None and hi is not None:
        a = b - b / APPEND_STEP
    return _shortest(a, b)


def spread(n: int, lo: str | None = None, hi: str | None = None) -> list[str]:
    """`n` increasing keys between lo and hi (None = open end), evenly spaced at one width: the narrowest that leaves
    room for about 60 inserts between neighbours before a key grows by a digit."""
    if n <= 0:
        return []
    a = _value(lo) if lo is not None else Fraction(0)
    b = _value(hi) if hi is not None else Fraction(1)
    if not a < b:
        raise ValueError(f"{lo!r} is not before {hi!r}")
    width = 1
    while (b - a) * BASE**width < 64 * (n + 1):
        width += 1
    scale = BASE**width
    step = (b - a) * scale / (n + 1)  # at least 64, so each key is strictly inside and they strictly increase
    return [_digits(math.floor(a * scale + i * step), width) for i in range(1, n + 1)]


def respace(keys: list[str], i: int) -> tuple[int, int, list[str]]:
    """Room for a new key at index `i` of the sorted `keys` (between keys[i-1] and keys[i]) when `between()` would
    make one longer than MAX_LEN.

    Returns (start, stop, fresh): keys[start:stop] are replaced, and fresh holds stop - start + 1 keys between
    keys[start-1] and keys[stop] (or the open ends), the new entry's at fresh[i - start]. The window starts at four
    entries each side and doubles until the fresh keys are at most RESPACED_LEN long (the whole list, at worst).
    Relative order never changes; only the keys inside the window do."""
    w = 4
    while True:
        start, stop = max(0, i - w), min(len(keys), i + w)
        lo = keys[start - 1] if start else None
        hi = keys[stop] if stop < len(keys) else None
        fresh = spread(stop - start + 1, lo, hi)
        if max(map(len, fresh)) <= RESPACED_LEN or (lo is None and hi is None):
            return start, stop, fresh
        w *= 2


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
