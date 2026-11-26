"""Just enough wikitext to read the Current events portal and "<Year> in <Country>" pages: bullets with their depth,
wikilinks (→ entities), external links and <ref> citations (→ evidence), and the plain text a reader sees.

Deterministic and dependency-free; templates other than the cite family are dropped from the text (the portal's
items are plain prose with links, so little is lost).
"""

import re
from dataclasses import dataclass, field
from html import unescape

WIKILINK_RE = re.compile(r"\[\[([^\[\]|]+)(?:\|([^\[\]]*))?\]\]")
EXTLINK_RE = re.compile(r"\[(https?://[^\s\]]+)(?:\s+([^\]]*))?\]")
REF_RE = re.compile(r"<ref(?:\s[^>/]*)?>(.*?)</ref>|<ref(?:\s[^>]*)?/>", re.S | re.I)
COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
TAG_RE = re.compile(r"</?(?:small|span|sup|sub|abbr|i|b|u|s|nowiki|br)\b[^>]*>", re.I)
BOLD_ITALIC_RE = re.compile(r"'{2,5}")
SKIP_NAMESPACES = ("file:", "image:", "category:", "media:", "wikt:", "wiktionary:", ":category:", "s:", "q:", "commons:", "d:", "special:")


def normalize_title(title: str) -> str:
    """MediaWiki title normalization: underscores → spaces, collapse spaces, first letter upper-case, no fragment."""
    t = unescape(title).split("#", 1)[0].replace("_", " ")
    t = " ".join(t.split()).strip()
    if t.startswith(":"):
        t = t[1:].strip()
    return t[:1].upper() + t[1:] if t else ""


def strip_templates(text: str) -> str:
    """Remove {{…}} templates, innermost first (so nesting works)."""
    prev = None
    while prev != text:
        prev = text
        text = re.sub(r"\{\{[^{}]*\}\}", "", text)
    return text


def template_params(body: str) -> dict:
    """{{cite web |url=… |title=…}} → {"url": …, "title": …} (top-level parameters only)."""
    body = body.strip()
    if body.startswith("{{"):
        body = body[2:]
    if body.endswith("}}"):
        body = body[:-2]
    parts, depth, cur = [], 0, ""
    for ch in body:
        if ch in "{[":
            depth += 1
        elif ch in "}]":
            depth -= 1
        if ch == "|" and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    parts.append(cur)
    out = {"_name": parts[0].strip().lower()}
    for p in parts[1:]:
        if "=" in p:
            k, v = p.split("=", 1)
            out[k.strip().lower()] = plain(v).strip()
    return out


@dataclass
class Link:
    title: str
    text: str


@dataclass
class ExternalLink:
    url: str
    label: str


@dataclass
class Parsed:
    text: str
    links: list = field(default_factory=list)       # [Link]
    external: list = field(default_factory=list)    # [ExternalLink]
    refs: list = field(default_factory=list)        # [{"url", "title", "website", "date", "language"}]


def plain(text: str) -> str:
    """Wikitext → reader's text: links become their labels, external links and refs disappear, markup goes."""
    text = COMMENT_RE.sub("", text)
    text = REF_RE.sub("", text)
    text = strip_templates(text)
    text = WIKILINK_RE.sub(lambda m: (m.group(2) if m.group(2) is not None else m.group(1).split("#")[0]).strip(), text)
    text = EXTLINK_RE.sub("", text)
    text = TAG_RE.sub("", text)
    text = BOLD_ITALIC_RE.sub("", text)
    return " ".join(unescape(text).split())


def parse_inline(wikitext: str) -> Parsed:
    links, external, refs = [], [], []
    body = COMMENT_RE.sub("", wikitext)
    for m in REF_RE.finditer(body):
        inner = m.group(1) or ""
        cite = re.search(r"\{\{\s*cite[^{}]*(?:\{\{[^{}]*\}\}[^{}]*)*\}\}", inner, re.I | re.S)
        if cite:
            p = template_params(cite.group(0))
            if p.get("url", "").startswith("http"):
                refs.append({k: p.get(k, "") for k in ("url", "title", "website", "work", "publisher", "date", "language")})
                continue
        for em in EXTLINK_RE.finditer(inner):
            refs.append({"url": em.group(1), "title": plain(em.group(2) or ""), "website": "", "work": "", "publisher": "", "date": "", "language": ""})
    no_refs = REF_RE.sub("", body)
    for m in WIKILINK_RE.finditer(strip_templates(no_refs)):
        target = m.group(1).strip()
        if target.lower().startswith(SKIP_NAMESPACES) or not target or target.startswith("#"):
            continue
        title = normalize_title(target)
        if title:
            links.append(Link(title, plain(m.group(2) if m.group(2) is not None else target)))
    for m in EXTLINK_RE.finditer(strip_templates(no_refs)):
        label = plain(m.group(2) or "").strip()
        external.append(ExternalLink(m.group(1), label.strip("() ")))
    return Parsed(plain(wikitext), links, external, refs)


@dataclass
class Bullet:
    depth: int
    raw: str
    line: int
    heading: str = ""     # the nearest bold category line ('''Armed conflicts and attacks''') or == section ==
    subheading: str = ""  # === January === on year pages
    children: list = field(default_factory=list)
    parent: "Bullet | None" = None


BOLD_HEADING_RE = re.compile(r"^'''([^']+)'''\s*$")
SECTION_RE = re.compile(r"^(={2,6})\s*(.*?)\s*\1\s*$")


def bullets(wikitext: str) -> list[Bullet]:
    """Every bullet line as a tree (depth from the leading asterisks), with the heading it sits under."""
    roots, stack = [], []
    heading = subheading = ""
    for i, line in enumerate(COMMENT_RE.sub("", wikitext).splitlines()):
        s = line.rstrip()
        if m := BOLD_HEADING_RE.match(s.strip()):
            heading, subheading, stack = m.group(1).strip(), "", []
            continue
        if m := SECTION_RE.match(s.strip()):
            level, name = len(m.group(1)), plain(m.group(2))
            if level == 2:
                heading, subheading = name, ""
            else:
                subheading = name
            stack = []
            continue
        if not s.startswith("*"):
            continue
        depth = len(s) - len(s.lstrip("*"))
        b = Bullet(depth=depth, raw=s[depth:].strip(), line=i, heading=heading, subheading=subheading)
        while stack and stack[-1].depth >= depth:
            stack.pop()
        if stack:
            b.parent = stack[-1]
            stack[-1].children.append(b)
        else:
            roots.append(b)
        stack.append(b)
    return roots


def walk(roots):
    for b in roots:
        yield b
        yield from walk(b.children)


def ancestors(b: Bullet) -> list[Bullet]:
    out, p = [], b.parent
    while p:
        out.append(p)
        p = p.parent
    return list(reversed(out))
