"""The snapshot format, both ways: the canonical key order (mirroring site/canonical.mjs) and a JSON writer that
produces the same bytes as the site's `JSON.stringify(content, null, 1)`, so a snapshot exported from Postgres and a
dump from data/*.js of the same content are byte-identical and hash the same.
"""

import json
import math
import re
from decimal import Decimal
from pathlib import Path

from django.conf import settings

# Must equal KEYS in site/canonical.mjs (tests/test_content_format.py checks it).
KEYS = {
    "branch": ["id", "name", "region", "start", "end", "startWhen", "endWhen", "parents", "into", "text", "cites", "origin", "geo", "images", "why", "connections", "whyCites"],
    "event": ["id", "branch", "y", "end", "when", "title", "text", "imp", "link", "cites", "geo", "images", "why", "connections", "whyCites"],
    "cite": ["t", "u", "k"],
    "origin": ["note", "links", "cites"],
    "originLink": ["id", "how", "note"],
    "geo": ["scope", "lat", "lon", "r", "label", "src", "scale"],
    "image": ["src", "w", "h", "title", "credit", "license", "page"],
    "connection": ["id", "note"],
}


def read_js_keys(path: Path | None = None) -> dict[str, list[str]]:
    """KEYS as site/canonical.mjs declares them."""
    src = (path or settings.SITE_DIR / "canonical.mjs").read_text()
    body = src[src.index("export const KEYS = {") : src.index("};", src.index("export const KEYS = {"))]
    return {m.group(1): re.findall(r'"([^"]+)"', m.group(2)) for m in re.finditer(r"(\w+): \[([^\]]*)\]", body)}


def js_number(x) -> str:
    """A number as JavaScript prints it (shortest round-trip digits; exponent only past 1e21 or under 1e-6)."""
    if isinstance(x, bool):
        raise TypeError("bool is not a number here")
    if isinstance(x, int):
        return str(x)
    if math.isnan(x) or math.isinf(x):
        return "null"
    if x == int(x) and abs(x) < 1e21:
        return str(int(x))
    r = repr(x)
    if "e" not in r:
        return r
    exp = int(r.split("e")[1])
    if -7 < exp < 21:
        return format(Decimal(r), "f")
    mant = r.split("e")[0]
    return f"{mant}e{'+' if exp > 0 else '-'}{abs(exp)}"


def dumps(value) -> str:
    """JSON exactly as `JSON.stringify(value, null, 1)` writes it."""
    out: list[str] = []

    def w(v, level):
        if v is None:
            out.append("null")
        elif v is True:
            out.append("true")
        elif v is False:
            out.append("false")
        elif isinstance(v, str):
            out.append(json.dumps(v, ensure_ascii=False))
        elif isinstance(v, (int, float)):
            out.append(js_number(v))
        elif isinstance(v, (list, tuple)):
            if not v:
                out.append("[]")
                return
            out.append("[\n")
            for i, item in enumerate(v):
                out.append(" " * (level + 1))
                w(item, level + 1)
                out.append(",\n" if i < len(v) - 1 else "\n")
            out.append(" " * level + "]")
        elif isinstance(v, dict):
            if not v:
                out.append("{}")
                return
            out.append("{\n")
            items = list(v.items())
            for i, (k, item) in enumerate(items):
                out.append(" " * (level + 1) + json.dumps(k, ensure_ascii=False) + ": ")
                w(item, level + 1)
                out.append(",\n" if i < len(items) - 1 else "\n")
            out.append(" " * level + "}")
        else:
            raise TypeError(f"can't write {type(v).__name__}")

    w(value, 0)
    return "".join(out) + "\n"


def num(x):
    """A stored double as the snapshot writes it: whole numbers as ints (JavaScript has no 2.0)."""
    if x is None:
        return None
    return int(x) if float(x).is_integer() and abs(x) < 1e21 else x

