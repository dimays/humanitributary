"""The console's Docs page (ADR 0031): the Markdown in `docs/manual/` (the maintainer manual), `docs/guide/` (the
developer reference) and `docs/adr/` (the decisions), rendered on the server and sanitized.

- A document is a `.md` file in one of `SECTIONS`' folders or one folder below (`manual/procedures/`); its slug is
  its path there without `.md` (a README is `readme`, `procedures/03-publish-a-release` one below). Its title is the front matter's `title` (the guide's chapters), else its first `# ` heading, else the
  slug; its order is the front matter's `order`, else the file name. Nothing outside those folders is read: a slug is
  looked up in the folder's listing, never joined onto a path.
- Markdown is rendered with Python-Markdown (tables, fenced code, a heading id for each heading, the table of
  contents) and the HTML is then cleaned by `nh3` (an allow-list of tags and attributes; links get
  `rel="noopener noreferrer"`), so a document can't put a script or an event handler on a staff page.
- Links between documents (`operations.md`, `../adr/0028-operations-console.md#phase-2`) become console links; a
  link to a code file becomes its path in `<code>`, since the console doesn't serve the code.
- Fenced ```mermaid blocks stay code blocks (`<pre><code class="language-mermaid">`); the page's script draws them
  with Mermaid from a pinned version on jsDelivr, and leaves the code as it is if that fails.

Rendered pages are cached per process by file and modification time.
"""

from __future__ import annotations

import posixpath
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from xml.etree import ElementTree as etree

import markdown
import nh3
from markdown.extensions import Extension
from markdown.treeprocessors import Treeprocessor
from django.conf import settings
from django.urls import reverse

DOCS_DIR = Path(settings.BASE_DIR) / "docs"
SECTIONS = {  # key → (title, folder under docs/, what it is)
    "manual": ("Maintainer manual", "manual", "How to run and look after the platform, for its maintainers."),
    "guide": ("Developer reference", "guide", "How each part works, from the code: the technical guide."),
    "adr": ("Decisions", "adr", "Why: the architecture decision records."),
}
MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"  # pinned; loaded on Docs pages only

TAGS = {"a", "abbr", "b", "blockquote", "br", "code", "dd", "del", "details", "div", "dl", "dt", "em", "h1", "h2", "h3",
        "h4", "h5", "h6", "hr", "i", "img", "ins", "kbd", "li", "ol", "p", "pre", "s", "span", "strong", "sub", "summary",
        "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul"}
ATTRIBUTES = {"*": {"id", "title"}, "a": {"href"}, "code": {"class"}, "div": {"class"}, "span": {"class"},
              "img": {"src", "alt", "width", "height"}, "th": {"align", "colspan", "rowspan"}, "td": {"align", "colspan", "rowspan"},
              "ol": {"start"}}
SLUG = re.compile(r"^[a-z0-9][a-z0-9._-]*(/[a-z0-9][a-z0-9._-]*)?$")  # a file, or a file one folder down


@dataclass(frozen=True)
class Doc:
    section: str
    slug: str
    path: Path
    title: str
    order: tuple
    summary: str = ""

    @property
    def group(self) -> str:
        """The subfolder it is in ("" at the top), as words: "procedures" → "Procedures"."""
        return self.slug.rpartition("/")[0].replace("-", " ").capitalize()


@dataclass
class Rendered:
    title: str
    html: str
    toc: list = field(default_factory=list)  # [{"id", "name", "level", "children": [...]}] from the toc extension
    summary: str = ""
    has_mermaid: bool = False
    has_h1: bool = False


def _front_matter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n"):
        return {}, text
    from guide.chapters import FrontMatterError, parse_front_matter

    try:
        fields, body, _ = parse_front_matter(text)
    except FrontMatterError:
        return {}, text
    return fields, body


def _title_of(fields: dict, body: str, slug: str) -> str:
    if fields.get("title"):
        return str(fields["title"])
    m = re.search(r"^# +(.+?)\s*#*\s*$", body, re.M)
    return m.group(1).strip() if m else slug.replace("-", " ").capitalize()


def folder(section: str) -> Path:
    return DOCS_DIR / SECTIONS[section][1]


def listing(section: str) -> list[Doc]:
    """The documents of a section, in reading order (a README first)."""
    d = folder(section)
    if not d.is_dir():
        return []
    out = []
    for p in sorted([*d.glob("*.md"), *d.glob("*/*.md")]):
        slug = p.relative_to(d).with_suffix("").as_posix().lower()
        if not SLUG.match(slug):
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except OSError:
            continue
        fields, body = _front_matter(text)
        try:
            order = int(fields.get("order", "")) if str(fields.get("order", "")).strip() else None
        except ValueError:
            order = None
        sub = slug.rpartition("/")[0]
        first = 0 if slug.rpartition("/")[2] == "readme" else 1
        out.append(Doc(section, slug, p, _title_of(fields, body, slug.rpartition("/")[2]), (sub, first, order if order is not None else 10**6, p.name),
                       str(fields.get("summary", ""))))
    return sorted(out, key=lambda x: x.order)


def find(section: str, slug: str) -> Doc | None:
    if section not in SECTIONS or not SLUG.match(slug or ""):
        return None
    return next((x for x in listing(section) if x.slug == slug), None)


def _doc_url(section: str, slug: str, anchor: str = "") -> str:
    return reverse("opsconsole:doc", args=[section, slug]) + (f"#{anchor}" if anchor else "")


class _Links(Treeprocessor):
    """Relative links: to another document → the console's page for it; to anything else → its path as code."""

    def __init__(self, md, section: str | None, subdir: str = ""):
        super().__init__(md)
        self.section, self.subdir = section, subdir

    def run(self, root):
        if self.section is None:
            return
        here = posixpath.join(SECTIONS[self.section][1], self.subdir)  # the folder under docs/ the document is in
        for parent in root.iter():
            for i, a in enumerate(list(parent)):
                if a.tag != "a":
                    continue
                href = a.get("href", "")
                if not href or re.match(r"^[a-z][a-z0-9+.-]*:", href, re.I) or href.startswith(("#", "/")):
                    continue
                path, _, anchor = href.partition("#")
                target = posixpath.normpath(posixpath.join("docs", here, path))
                hit = None
                if target.endswith(".md"):
                    for key, (_, sub, _) in SECTIONS.items():
                        root_dir = posixpath.join("docs", sub) + "/"
                        if target.startswith(root_dir):
                            hit = (key, target[len(root_dir):-3].lower())
                if hit and SLUG.match(hit[1]):
                    a.set("href", _doc_url(hit[0], hit[1], anchor))
                else:  # code, or a document outside these folders: show where it is
                    code = etree.Element("code")
                    code.text = "".join(a.itertext()) or target
                    code.tail = a.tail
                    code.set("title", target)
                    parent.remove(a)
                    parent.insert(i, code)


class _LinksExtension(Extension):
    def __init__(self, section, subdir=""):
        super().__init__()
        self.section, self.subdir = section, subdir

    def extendMarkdown(self, md):
        md.treeprocessors.register(_Links(md, self.section, self.subdir), "ops_links", 5)


def render_markdown(text: str, *, section: str | None = None, subdir: str = "") -> Rendered:
    """Markdown → sanitized HTML, with the headings' table of contents."""
    fields, body = _front_matter(text)
    md = markdown.Markdown(extensions=["tables", "fenced_code", "sane_lists", "def_list", "abbr",
                                       "toc", _LinksExtension(section, subdir)],
                           extension_configs={"toc": {"permalink": False, "toc_depth": "2-3"}})
    raw = md.convert(body)
    html = nh3.clean(raw, tags=TAGS, attributes=ATTRIBUTES, url_schemes={"http", "https", "mailto"},
                     link_rel="noopener noreferrer", strip_comments=True)
    return Rendered(title=_title_of(fields, body, section or "document"), html=html, toc=getattr(md, "toc_tokens", []),
                    summary=str(fields.get("summary", "")), has_mermaid='class="language-mermaid"' in html,
                    has_h1="<h1" in html)


@lru_cache(maxsize=256)
def _render_file(path: str, mtime_ns: int, section: str, subdir: str) -> Rendered:
    return render_markdown(Path(path).read_text(encoding="utf-8"), section=section, subdir=subdir)


def render(doc: Doc) -> Rendered:
    r = _render_file(str(doc.path), doc.path.stat().st_mtime_ns, doc.section, doc.slug.rpartition("/")[0])
    return Rendered(title=doc.title, html=r.html, toc=r.toc, summary=doc.summary or r.summary, has_mermaid=r.has_mermaid, has_h1=r.has_h1)


def tree() -> list[dict]:
    """Every section with its documents, for the left table of contents."""
    return [{"key": k, "title": t, "about": about, "docs": listing(k)}
            for k, (t, _, about) in SECTIONS.items()]
