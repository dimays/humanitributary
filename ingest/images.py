"""The image_search job: a picture for each event that has none, from openly licensed sources (docs/adr/0048-event-images.md).

Deterministic, like every job (AGENTS.md rule 3): no LLM calls; the same sources' answers give the same candidates,
scores and flags.

**What it asks, and where.** Only official APIs the source policy lets a job read (every request goes through
`ingest.http.Fetcher`, which refuses what the Publisher rows, robots.txt and NEVER_FETCH forbid; each source is
asked once per run whether the policy allows it at all, `preflight`):

| source | API | kept | rated |
|---|---|---|---|
| `commons` | Wikidata (P18 of the event's entities), the Commons API (`imageinfo`, `haswbstatement:P180` depicts search, a title search) | public domain, CC0, CC BY, CC BY-SA, with the license, its URL and the author | ADR 0013 (Wikimedia), ADR 0048 (the Commons API) |
| `loc` | www.loc.gov `/photos/?fo=json`, then the item `?fo=json` | `rights_advisory` "No known restrictions" | ADR 0037 (api_only, `?fo=json`) |
| `smithsonian` | api.si.edu Open Access (key in the header) | media marked `usage.access` CC0 | ADR 0013 (si.edu ALLOW) |
| `nasa` | images-api.nasa.gov `/search` | NASA's own media, not a third party's copyright | ADR 0048 |

The Met, the Art Institute of Chicago, Cleveland and the Rijksmuseum are not asked: their ratings were not applied
(low confidence, ADR 0037), and the Met's site is `browser_only` (ADR 0044).

**Which entities.** An event's Wikidata items are those of the English Wikipedia articles its record claim cites
(`WikiTitle`, `Entity`), the first cited one being its *primary* entity, plus the entities of the candidate it was
written from.

**Score** (0–1, `score()`): how the picture was found (the primary entity's own P18 0.6, another cited entity's
P18 0.45, a Commons file whose structured data depicts the primary entity 0.5, a catalog search 0.2, a Commons
title search 0.15), plus the words it shares with the event's title (up to 0.2), its date against the event's (a
photograph within two years +0.1; a pre-1900 work for a pre-photography event +0.05; for a search hit, a picture
made before the event −0.25) and the event's place in its text (+0.1).

**Where it goes.** A candidate is attached at once (a `timeline.Image` row, as `job:image_search`) only when it
is the primary entity's own P18, that entity is an event or a work, the license is public domain or CC0, nothing
restricts it, the sensitivity signals are quiet and it scores AUTO_SCORE or more. Anything else at REVIEW_SCORE or
more goes to the owner's Review page (`opsconsole/review.py`, item `image-<id>`): the best one, with up to KEEP-1
runners-up kept as alternates, promoted one by one if the owner denies the one before. Below that, nothing is kept.

**Pacing.** Each event is searched at most MAX_ATTEMPTS times, the n-th retry COOLDOWN_DAYS[n-1] days after the
attempt before it, PER_RUN events a run, never-searched and important events first. An event with a picture or a
candidate in review is not searched; an attempt that finds nothing (or fails) waits its cooldown. Every attempt is
recorded on the event's `ImageSearch` row.

**Never AI-generated imagery** (the owner's standing rule; `ai_refusal()`): a Commons file in any AI-generated
category or with the {{PD-algorithm}} tag, AI-upscaled, -restored or -colorized, or whose author, credit or
description names an image generator or a prompt, is refused; so is any picture made in 2020 or later for an
event before 2015 (it can only be a modern rendering), and any catalog record whose text says it was made with AI.

**Sensitive pictures** (`sensitivity()`): flagged from deterministic signals, the Commons categories (corpses,
massacres, executions, war dead, victims, wounds, autopsies, the Holocaust …), the picture's own text, and the
event's words and branch. A flagged picture is never attached without the owner, and renders blurred on the page
until a viewer chooses to see it. The job also reads the categories of pictures already attached (a watermark,
FLAG_PER_RUN a run) and flags those the signals name, as a `flag` item the owner confirms or clears.

**What is stored.** A reference, never the image: the file page, the source's image URL, the thumbnail URL the page
shows (the source's own resized copy: `thumbnail_note` says which), the sizes, the license and its URL, the
creator, the credit line, the score and its signals, the checks. Nothing is downloaded, cropped or altered.
"""

import html
import re
from collections import Counter
from dataclasses import dataclass, field
from datetime import timedelta
from urllib.parse import parse_qsl, quote, unquote, urlencode, urlsplit, urlunsplit

from django.conf import settings
from django.db import transaction
from django.db.models import Exists, F, Max, OuterRef
from django.utils import timezone

from . import wikidata
from .http import FetchError, Refused
from .lookup import keywords
from .models import ImageCandidate, ImageSearch, JobState

MAX_ATTEMPTS = 3
COOLDOWN_DAYS = (14, 42)       # after the 1st attempt, 14 days; after the 2nd, 42; after the 3rd, none
PER_RUN = 25                   # events searched a run
FLAG_PER_RUN = 50              # attached pictures whose sensitivity is read a run
AUTO_SCORE = 0.7
REVIEW_SCORE = 0.35
KEEP = 3                       # candidates kept an attempt: one for review, the rest alternates
THUMB_WIDTH = 500              # a standard Wikimedia thumbnail width; the panel is at most ~420 px wide
HISTORY_MAX = 10
TEXT_MAX = 300
FLAG_STATE = "image_flags"     # JobState: {"upto": the last timeline.Image id whose sensitivity was read}
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
BASE = {"p18_primary": 0.6, "p18": 0.45, "depicts": 0.5, "catalog": 0.2, "search": 0.15}
AUTO_KINDS = ("event", "work")
OPEN_LICENSE_RE = re.compile(r"^(Public domain|No known restrictions|CC0|CC BY [0-9]|CC BY-SA [0-9])")
PD_LICENSE_RE = re.compile(r"^(Public domain|CC0)")

PROBES = {  # one URL per source, asked of the policy (Fetcher.refusal) before the source is used in a run
    "commons": COMMONS_API + "?action=query&format=json",
    "loc": "https://www.loc.gov/photos/?fo=json",
    "smithsonian": "https://api.si.edu/openaccess/api/v1.0/search",
    "nasa": "https://images-api.nasa.gov/search",
}
THUMBNAIL_NOTE = {
    "commons": "Wikimedia's own {w}px thumbnail, shown by its URL; not copied, cropped or altered",
    "loc": "the Library of Congress's own {w}px derivative (tile.loc.gov), shown by its URL; not copied or altered",
    "smithsonian": "the Smithsonian's IDS delivery service at max {w}px, shown by its URL; not copied or altered",
    "nasa": "NASA's own ~small rendition ({w}px), shown by its URL; not copied or altered",
}

# ── AI-generated imagery: never (the owner's rule) ───────────────────────────────────────────────────────────────
AI_CATEGORY_RE = re.compile(
    r"AI[- ]generated|AI[- ]misgenerated|PD[- ]algorithm|AI[- ](?:upscal|restor|coloriz|colouris|enhanc)|"
    r"\bDALL[-·]?E\b|Midjourney|Stable Diffusion|Generative AI|Adobe Firefly|Text-to-image|Images? generated (?:by|with|using)", re.I)
AI_TEXT_RE = re.compile(
    r"\bAI[- ]generated\b|generated (?:by|with|using) (?:an? )?(?:AI|artificial intelligence)\b|\bprompt(?:ed)? by\b|\bmidjourney\b|"
    r"\bdall[-·]?e\b|stable diffusion|generative AI|text-to-image|\bAI[- ](?:upscaled|restored|colou?ri[sz]ed|enhanced)\b", re.I)
COLORIZED_RE = re.compile(r"\bcolou?ri[sz]ed\b", re.I)
RECENT_YEAR, MODERN_EVENT_YEAR = 2020, 2015

# ── sensitivity signals ──────────────────────────────────────────────────────────────────────────────────────────
SENSITIVE_CATEGORY_RE = re.compile(
    r"\b(?:corpses?|dead bodies|dead people|human remains|cadavers?|killed|casualt\w*|massacres?|atrocit\w*|genocides?|"
    r"holocaust|war crimes?|executions?|executed|hangings?|hanged|lynch\w*|beheading|decapitat\w*|tortur\w*|mass graves?|"
    r"famine victims|victims|wounded|wounds|injur\w*|gore|bloodshed|autops\w*|surger(?:y|ies)|medical photographs?|"
    r"pathology|deformit\w*|skin diseases?|concentration camps?|extermination)\b", re.I)
SENSITIVE_TEXT_RE = SENSITIVE_CATEGORY_RE
EVENT_WORD_RE = re.compile(
    r"\b(?:massacres?|genocides?|holocaust|execut(?:ed|ions?)|beheaded|hanged|lynch(?:ed|ing)|atrocit\w*|slaughter\w*|"
    r"famine|mass graves?|war crimes?|bombing|bombed|shot dead|casualties|killed|killings?|dead|deaths|epidemic|plague|"
    r"pogroms?|ethnic cleansing|terror(?:ist)? attack)\b", re.I)
BRANCH_RE = re.compile(r"war|genocide|holocaust|massacre|disaster|pandemic|plague|famine|terror|conflict|revolution", re.I)
SPACE_RE = re.compile(r"\b(?:nasa|space\w*|apollo|gemini|mercury program|rocket\w*|satellite\w*|orbit\w*|astronaut\w*|moon|lunar|mars|"
                      r"shuttle|telescope|hubble|aviation|aircraft|airplane|flight|wright brothers|probe|voyager|iss)\b", re.I)
NASA_THIRD_PARTY_RE = re.compile(r"©|\bcopyright(?:ed)?\b|\bcourtesy of\b|\bused with permission\b|\(c\) ", re.I)
YEAR_RE = re.compile(r"(?<![\d.])(\d{3,4})(?![\d])")


class SourceError(Exception):
    """A source answered with something the job can't use (an HTTP error, an unexpected shape)."""


# ── small helpers ────────────────────────────────────────────────────────────────────────────────────────────────

def clean(s, limit: int = TEXT_MAX) -> str:
    """HTML (as the Commons API returns its metadata) to one line of plain text: hidden parts dropped, tags removed."""
    s = str(s or "")
    s = re.sub(r"<(div|span)[^>]*display:\s*none[^>]*>.*?</\1>", " ", s, flags=re.S | re.I)
    s = html.unescape(re.sub(r"<[^>]+>", " ", s))
    s = " ".join(s.split())
    return s if len(s) <= limit else s[: limit - 1].rstrip() + "…"


def strip_tracking(url: str) -> str:
    """The URL without the utm_* parameters the Commons API adds to its file URLs."""
    p = urlsplit(url or "")
    q = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True) if not k.startswith("utm_")]
    return urlunsplit((p.scheme, p.netloc, p.path, urlencode(q), p.fragment))


def year_of(text) -> int | None:
    """The first plausible year in a date as a source writes it ("between 1804 and 1805", "1969-07-21")."""
    for m in YEAR_RE.finditer(str(text or "")):
        y = int(m.group(1))
        if 100 <= y <= timezone.now().year + 1:
            return y
    return None


def file_title(url_or_title: str) -> str:
    """"File:Foo bar.jpg" from a Commons file page URL, a Special:FilePath URL or a title."""
    s = unquote(url_or_title or "")
    for marker in ("/wiki/Special:FilePath/", "/wiki/"):
        if marker in s:
            s = s.split(marker, 1)[1]
            break
    s = s.split("?", 1)[0].replace("_", " ").strip()
    if not s:
        return ""
    return s if s.lower().startswith("file:") else f"File:{s}"


# ── a picture found ──────────────────────────────────────────────────────────────────────────────────────────────

@dataclass
class Found:
    source: str
    source_id: str
    file_page: str
    thumb_url: str
    title: str
    via: str                                  # p18_primary, p18, depicts, catalog, search
    license: str = ""
    license_url: str = ""
    image_url: str = ""
    thumb_width: int | None = None
    thumb_height: int | None = None
    width: int | None = None
    height: int | None = None
    mime: str = ""
    alt: str = ""
    creator: str = ""
    credit: str = ""
    file_date: str = ""
    text: str = ""                            # the source's own words about it: description, subjects, keywords
    categories: list = field(default_factory=list)
    restrictions: str = ""
    qid: str = ""
    refused: str = ""                         # why it can't be used (license, AI, attribution), "" when it can

    @property
    def file_year(self) -> int | None:
        return year_of(self.file_date)


@dataclass
class EventInfo:
    """What the job knows about one event: its words, date, place, branch and Wikidata items."""
    pk: int
    slug: str
    title: str
    text: str
    year: float
    branch: str
    place: str = ""
    primary: object = None                    # the Entity of its first cited Wikipedia article
    entities: list = field(default_factory=list)


# ── licenses ─────────────────────────────────────────────────────────────────────────────────────────────────────

CC_CODE_RE = re.compile(r"^cc-by(-sa)?-(\d(?:\.\d)?)(?:-([a-z]{2,}))?$")


def commons_license(meta: dict) -> tuple[str, str, str]:
    """(license, license URL, refusal) from a Commons file's extmetadata. Only public domain, CC0, CC BY and CC BY-SA
    pass; GFDL-only, non-commercial, no-derivatives and non-free files are refused."""
    def v(k):
        return clean((meta.get(k) or {}).get("value"), 200)

    code, short = v("License").lower(), v("LicenseShortName")
    if v("NonFree").lower() == "true":
        return "", "", "non-free file"
    if code == "cc0" or short.upper().startswith("CC0"):
        return "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/", ""
    if code == "pd" or code.startswith("pd-") or short.lower().startswith("public domain"):
        return "Public domain", "", ""
    m = CC_CODE_RE.match(code)
    if m:
        sa, ver, port = bool(m.group(1)), m.group(2), m.group(3)
        name = f"CC BY{'-SA' if sa else ''} {ver}" + (f" {port.upper()}" if port else "")
        url = strip_tracking(v("LicenseUrl")) or f"https://creativecommons.org/licenses/by{'-sa' if sa else ''}/{ver}/" + (f"{port}/" if port else "")
        if url.startswith("//"):
            url = "https:" + url
        return name, url.replace("http://", "https://"), ""
    return "", "", f"license {short or code or 'unknown'} is not public domain, CC0, CC BY or CC BY-SA"


def ai_refusal(f: Found, event_year: float | None) -> str:
    """Why `f` may be AI-generated (refused), or "". The rules, for the record on each candidate: AI_RULES."""
    for c in f.categories:
        if AI_CATEGORY_RE.search(c):
            return f"AI-generated media category: {c}"
        if COLORIZED_RE.search(c):
            return f"a colorized version (often made with AI, and an altered original): {c}"
    blob = " ".join((f.creator, f.credit, f.title, f.text))
    if m := AI_TEXT_RE.search(blob):
        return f"its description names AI generation ({m.group(0)})"
    fy = f.file_year
    if fy and fy >= RECENT_YEAR and event_year is not None and event_year < MODERN_EVENT_YEAR:
        return f"made in {fy} for an event of {int(event_year)}: a modern rendering, possibly AI-made"
    return ""


AI_RULES = ["Commons categories: AI-generated, AI-misgenerated, PD-algorithm, AI-upscaled/restored/colorized, image generators",
            "colorized versions", "author, credit, title or description naming AI generation or a prompt",
            f"made {RECENT_YEAR} or later for an event before {MODERN_EVENT_YEAR}"]


def sensitivity(f: Found, ev: EventInfo) -> list[str]:
    """The deterministic signals that the picture may disturb (empty: none). A Commons category is enough alone; the
    event's own words count only with the picture's text or the event's branch agreeing."""
    signals = [f"category: {c}" for c in f.categories if SENSITIVE_CATEGORY_RE.search(c)][:5]
    pic = SENSITIVE_TEXT_RE.search(" ".join((f.title, f.alt, f.text)))
    word = EVENT_WORD_RE.search(f"{ev.title} {ev.text}")
    branch = BRANCH_RE.search(ev.branch or "")
    if pic and (word or branch or signals):
        signals.append(f"picture: {pic.group(0).lower()}")
    if word and (pic or branch):
        signals.append(f"event: {word.group(0).lower()}")
        if branch:
            signals.append(f"branch: {ev.branch}")
    return signals


def score(f: Found, ev: EventInfo) -> tuple[float, dict]:
    """0–1 and its parts (module docstring, "Score")."""
    parts = {"via": BASE[f.via]}
    ev_kw = keywords(ev.title)[:8]
    f_kw = set(keywords(f.title, f.text[:600], " ".join(f.categories)[:600]))
    if ev_kw:
        shared = sum(1 for w in ev_kw if w in f_kw)
        if shared:
            parts["title_words"] = round(0.2 * min(1.0, shared / min(len(ev_kw), 4)), 3)
    fy, ey = f.file_year, ev.year
    if fy and ey is not None:
        if ey >= 1830 and abs(fy - ey) <= 2:
            parts["date"] = 0.1
        elif ey < 1830 and fy < 1900:
            parts["date"] = 0.05
        if f.via in ("catalog", "search") and fy < ey - 2:
            parts["made_before"] = -0.25
    if ev.place:
        place_kw = keywords(ev.place)[:3]
        if place_kw and any(w in f_kw for w in place_kw):
            parts["place"] = 0.1
    return round(max(0.0, min(1.0, sum(parts.values()))), 3), parts


# ── the sources ──────────────────────────────────────────────────────────────────────────────────────────────────

def _commons_found(page: dict, via: str, qid: str = "") -> Found | None:
    infos = page.get("imageinfo") or []
    if page.get("missing") or not infos:
        return None
    ii = infos[0]
    meta = ii.get("extmetadata") or {}

    def v(k, n=TEXT_MAX):
        return clean((meta.get(k) or {}).get("value"), n)

    title = page.get("title") or ""
    mime = ii.get("mime") or ""
    name = re.sub(r"\.[A-Za-z0-9]{2,5}$", "", title.split(":", 1)[-1])
    lic, lic_url, refused = commons_license(meta)
    creator = v("Artist", 200)
    f = Found(source="commons", source_id=title, file_page=strip_tracking(ii.get("descriptionurl") or ""), via=via, qid=qid,
              thumb_url=strip_tracking(ii.get("thumburl") or ""), thumb_width=ii.get("thumbwidth"), thumb_height=ii.get("thumbheight"),
              image_url=strip_tracking(ii.get("url") or ""), width=ii.get("width"), height=ii.get("height"), mime=mime,
              title=(v("ObjectName", 200) or name)[:200], text=v("ImageDescription", 600), creator=creator,
              credit=(creator or v("Credit", 200)), file_date=v("DateTimeOriginal", 100),
              categories=[c.strip() for c in ((meta.get("Categories") or {}).get("value") or "").split("|") if c.strip()],
              restrictions=v("Restrictions", 200), license=lic, license_url=lic_url, refused=refused)
    f.alt = (f.text.split(". ")[0] if f.text else f.title)[:200]
    if not mime.startswith("image/"):
        f.refused = f.refused or f"not a picture ({mime or 'no type'})"
    if not f.thumb_url.startswith("https://"):
        f.refused = f.refused or "no https thumbnail"
    if lic.startswith("CC BY") and not creator:
        f.refused = f.refused or "an attribution license with no author to credit"
    if f.credit:
        f.credit = f"{f.credit}, via Wikimedia Commons"[:300]
    return f


def commons_files(fetcher, titles: list[str], *, via: str, qids: dict | None = None) -> list[Found]:
    """Found records for Commons file titles (imageinfo with extmetadata, 25 a request)."""
    out = []
    titles = list(dict.fromkeys(t for t in titles if t))
    for i in range(0, len(titles), 25):
        batch = titles[i:i + 25]
        data = wikidata.api_get(fetcher, {"action": "query", "titles": "|".join(batch), "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata",
                                          "iiurlwidth": str(THUMB_WIDTH), "iiextmetadatalanguage": "en"}, url=COMMONS_API)
        q = data.get("query") or {}
        norm = {n["to"]: n["from"] for n in q.get("normalized", [])}
        for page in q.get("pages", []):
            asked = norm.get(page.get("title"), page.get("title"))
            f = _commons_found(page, via, (qids or {}).get(asked, "") or (qids or {}).get(page.get("title"), ""))
            if f:
                out.append(f)
    return out


def p18_files(fetcher, qids: list[str]) -> dict[str, list[str]]:
    """{qid: [Commons file titles]} from Wikidata's P18 (image) statements, one query for all."""
    qids = [q for q in dict.fromkeys(qids) if re.match(r"^Q\d+$", q or "")]
    out: dict[str, list[str]] = {}
    for i in range(0, len(qids), wikidata.SPARQL_BATCH):
        values = " ".join(f"wd:{q}" for q in qids[i:i + wikidata.SPARQL_BATCH])
        for b in wikidata._sparql(fetcher, f"SELECT ?item ?img WHERE {{ VALUES ?item {{ {values} }} ?item wdt:P18 ?img . }}"):
            q = b["item"]["value"].rsplit("/", 1)[-1]
            t = file_title(b["img"]["value"])
            if t and t not in out.setdefault(q, []):
                out[q].append(t)
    return out


def commons_search(fetcher, query: str, *, limit: int = 4) -> list[str]:
    data = wikidata.api_get(fetcher, {"action": "query", "list": "search", "srsearch": query, "srnamespace": "6", "srlimit": str(limit),
                                      "srprop": ""}, url=COMMONS_API)
    return [r["title"] for r in (data.get("query") or {}).get("search", [])]


def loc_search(fetcher, ev: EventInfo, *, limit: int = 2) -> list[Found]:
    """Library of Congress photos and prints near the event's year; each kept only when its item record says "No known
    restrictions" (one item request each: the search results carry no rights)."""
    y = int(ev.year)
    r = fetcher.get("https://www.loc.gov/photos/", params={"q": " ".join(keywords(ev.title)[:6]) or ev.title, "fo": "json", "c": "5",
                                                         "at": "results", "dates": f"{y - 1}/{y + 1}"}, timeout=90)
    if not r.ok:
        raise SourceError(f"LoC HTTP {r.status}")
    out = []
    for res in (r.json().get("results") or [])[: limit]:
        url = (res.get("url") or res.get("id") or "").replace("http://", "https://")
        if not re.match(r"^https://www\.loc\.gov/item/[^/?#]+/?$", url) or res.get("access_restricted"):
            continue
        it = fetcher.get(url.rstrip("/") + "/", params={"fo": "json"}, timeout=90)
        if not it.ok:
            continue
        item = it.json().get("item") or {}
        rights = " ".join(str(item.get(k) or "") for k in ("rights_advisory", "rights_information"))
        imgs = [u for u in (item.get("image_url") or res.get("image_url") or []) if isinstance(u, str) and u.startswith("https://")]

        def size(u):
            m = re.search(r"#h=(\d+)&w=(\d+)", u)
            return (int(m.group(2)), int(m.group(1))) if m else (0, 0)

        fit = [u for u in imgs if u.split("#")[0].endswith(".jpg") and 0 < size(u)[0] <= 700]
        if not fit:
            continue
        thumb = max(fit, key=lambda u: size(u)[0])
        big = max(imgs, key=lambda u: size(u)[0])
        w, h = size(thumb)
        creator = clean("; ".join(item.get("contributor_names") or []), 200)
        title = clean(item.get("title") or res.get("title"), 200)
        subjects = " ".join(str(s) for s in (item.get("subjects") or res.get("subject") or []))
        f = Found(source="loc", source_id=url.rstrip("/").rsplit("/", 1)[-1], file_page=url, via="catalog", thumb_url=thumb.split("#")[0],
                  thumb_width=w, thumb_height=h, image_url=big.split("#")[0], width=size(big)[0] or None, height=size(big)[1] or None,
                  mime="image/jpeg", title=title, alt=title, creator=creator,
                  credit=(f"{creator}; " if creator else "") + "Library of Congress, Prints & Photographs Division",
                  file_date=clean(item.get("date") or res.get("date"), 100),
                  text=clean(" ".join([" ".join(item.get("summary") or []) if isinstance(item.get("summary"), list) else str(item.get("summary") or ""), subjects]), 600))
        m = re.search(r"https://www\.loc\.gov/rr/[^\s\"'<>]+", rights)
        if rights.strip().lower().startswith("no known restrictions"):
            f.license, f.license_url = "No known restrictions (Library of Congress)", (m.group(0) if m else "https://www.loc.gov/legal/")
        else:
            f.refused = "the Library of Congress states no \"No known restrictions\" rights advisory"
        out.append(f)
    return out


def smithsonian_search(fetcher, ev: EventInfo, *, rows: int = 5) -> list[Found]:
    """Smithsonian Open Access records with an image marked CC0 (the key in the X-Api-Key header, never the URL)."""
    q = " ".join(keywords(ev.title)[:6]) or ev.title
    r = fetcher.get("https://api.si.edu/openaccess/api/v1.0/search", params={"q": f'{q} AND online_media_type:"Images"', "rows": str(rows)},
                    headers={"X-Api-Key": settings.SMITHSONIAN_API_KEY})
    if not r.ok:
        raise SourceError(f"Smithsonian HTTP {r.status}")
    out = []
    for row in (r.json().get("response") or {}).get("rows", []):
        c = row.get("content") or {}
        dnr = c.get("descriptiveNonRepeating") or {}
        media = [m for m in ((dnr.get("online_media") or {}).get("media") or []) if m.get("type") == "Images" and m.get("idsId")]
        if not media:
            continue
        m = media[0]
        free = c.get("freetext") or {}
        creator = clean("; ".join(x.get("content", "") for x in (free.get("name") or [])), 200)
        unit = clean(dnr.get("data_source"), 120)
        page = (dnr.get("record_link") or dnr.get("guid") or "").replace("http://", "https://")
        title = clean(row.get("title") or dnr.get("title", {}).get("content"), 200)
        f = Found(source="smithsonian", source_id=str(row.get("id") or m["idsId"])[:300], file_page=page, via="catalog",
                  thumb_url=f"https://ids.si.edu/ids/deliveryService?id={quote(m['idsId'], safe='-_.')}&max={THUMB_WIDTH}",
                  image_url=(m.get("content") or "").replace("http://", "https://"), width=m.get("width"), height=m.get("height"),
                  mime="image/jpeg", title=title, alt=clean(m.get("altTextAccessibility"), 200) or title, creator=creator,
                  credit=(f"{creator}; " if creator else "") + (f"{unit}, " if unit else "") + "Smithsonian Institution",
                  file_date=clean(" ".join(x.get("content", "") for x in (free.get("date") or [])), 100),
                  text=clean(" ".join(x.get("content", "") for k in ("notes", "physicalDescription", "topic") for x in (free.get(k) or [])), 600))
        if m.get("width") and m.get("height"):
            scale = min(1.0, THUMB_WIDTH / max(m["width"], m["height"]))
            f.thumb_width, f.thumb_height = round(m["width"] * scale), round(m["height"] * scale)
        if (m.get("usage") or {}).get("access") == "CC0":
            f.license, f.license_url = "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/"
        else:
            f.refused = f"Smithsonian media usage is {(m.get('usage') or {}).get('access') or 'not stated'}, not CC0"
        if not page.startswith("https://"):
            f.refused = f.refused or "no https record link"
        out.append(f)
    return out


def nasa_search(fetcher, ev: EventInfo, *, rows: int = 5) -> list[Found]:
    """NASA Image and Video Library pictures from the event's year (no key). A third party's copyrighted item is refused."""
    y = int(ev.year)
    r = fetcher.get("https://images-api.nasa.gov/search", params={"q": " ".join(keywords(ev.title)[:6]) or ev.title, "media_type": "image",
                                                                 "year_start": str(y), "year_end": str(y + 1), "page_size": str(rows)})
    if not r.ok:
        raise SourceError(f"NASA HTTP {r.status}")
    out = []
    for it in ((r.json().get("collection") or {}).get("items") or [])[:rows]:
        d = (it.get("data") or [{}])[0]
        nid = d.get("nasa_id") or ""
        links = {re.sub(r".*~(\w+)\.\w+$", r"\1", ln.get("href", "")): ln for ln in it.get("links") or [] if ln.get("render") == "image"}
        small, orig = links.get("small") or links.get("thumb") or {}, links.get("orig") or links.get("large") or {}
        if not nid or not str(small.get("href", "")).startswith("https://"):
            continue
        center = clean(d.get("center"), 40)
        who = clean(d.get("photographer") or d.get("secondary_creator"), 120)
        title = clean(d.get("title"), 200)
        text = clean(" ".join([str(d.get("description") or ""), " ".join(d.get("keywords") or [])]), 600)
        f = Found(source="nasa", source_id=nid[:300], file_page=f"https://images.nasa.gov/details/{quote(nid, safe='-_.')}", via="catalog",
                  thumb_url=small["href"], thumb_width=small.get("width"), thumb_height=small.get("height"),
                  image_url=orig.get("href", ""), width=orig.get("width"), height=orig.get("height"), mime="image/jpeg",
                  title=title, alt=title, creator=who, credit=("NASA" + (f"/{center}" if center else "") + (f", {who}" if who else "")),
                  file_date=clean(d.get("date_created"), 40), text=text,
                  license="Public domain (NASA)", license_url="https://www.nasa.gov/nasa-brand-center/images-and-media/")
        if NASA_THIRD_PARTY_RE.search(f"{d.get('description') or ''} {' '.join(d.get('keywords') or [])} {who}"):
            f.refused = "the record names a third party's copyright"
        out.append(f)
    return out


# ── one event ────────────────────────────────────────────────────────────────────────────────────────────────────

def events_info(fetcher, events, *, counts) -> list[EventInfo]:
    """EventInfo for each event, its Wikidata items resolved from its record claim's English Wikipedia citations."""
    from evidence.models import Evidence
    from timeline.models import Location

    from .models import Candidate

    pks = [e.pk for e in events]
    cited: dict[int, list[str]] = {}
    rows = (Evidence.objects.filter(claim__entry_id__in=pks, claim__field="as_written", claim__key="", claim__parent__isnull=True,
                                    stance__in=["supports", "partial"], citation__url__startswith="https://en.wikipedia.org/wiki/")
            .order_by("claim__entry_id", "position").values_list("claim__entry_id", "citation__url"))
    for pk, url in rows:
        t = wikidata.title_from_url(url)
        if t and t not in cited.setdefault(pk, []):
            cited[pk].append(t)
    titles = sorted({t for ts in cited.values() for t in ts[:3]})
    by_title = wikidata.resolve(fetcher, titles, counts=counts) if titles else {}
    from_candidates: dict[int, list] = {}
    for c in Candidate.objects.filter(result_entry_id__in=pks).prefetch_related("entities"):
        from_candidates.setdefault(c.result_entry_id, []).extend(e for e in c.entities.all() if e.kind in ("event", "work"))
    places = dict(Location.objects.filter(entry_id__in=pks).values_list("entry_id", "label"))
    out = []
    for e in events:
        ents = [by_title[t] for t in cited.get(e.pk, [])[:3] if t in by_title]
        primary = ents[0] if ents else None
        for x in from_candidates.get(e.pk, []):
            if x.qid not in {y.qid for y in ents}:
                ents.append(x)
        out.append(EventInfo(pk=e.pk, slug=e.slug, title=e.title, text=e.text, year=e.y, branch=f"{e.branch.slug} {e.branch.name}",
                             place=places.get(e.pk) or "", primary=primary, entities=ents[:4]))
    return out


@dataclass
class Attempt:
    found: list = field(default_factory=list)          # (Found, score, parts, signals), usable, best first
    sources: Counter = field(default_factory=Counter)  # hits per source
    refused: Counter = field(default_factory=Counter)  # why candidates were refused
    errors: list = field(default_factory=list)


def search_event(fetcher, ev: EventInfo, *, allowed: set, p18: dict, counts) -> Attempt:
    """Every source that applies, in order of confidence; catalogs and title searches only when Wikidata gave nothing
    worth review."""
    a = Attempt()
    seen = set()

    def take(items):
        for f in items:
            key = (f.source, f.source_id)
            if key in seen:
                continue
            seen.add(key)
            a.sources[f.source] += 1
            f.refused = f.refused or ai_refusal(f, ev.year)
            if f.refused:
                a.refused[f.refused.split(":")[0].split(" (")[0][:60]] += 1
                counts["refused." + ("ai" if "AI" in f.refused or "colorized" in f.refused or "modern rendering" in f.refused else "license")] += 1
                continue
            s, parts = score(f, ev)
            a.found.append((f, s, parts, sensitivity(f, ev)))

    def guarded(name, fn):
        if name not in allowed:
            return
        try:
            take(fn())
        except (Refused, FetchError, SourceError, RuntimeError, ValueError, KeyError) as e:
            a.errors.append(f"{name}: {type(e).__name__}: {str(e)[:160]}")
            counts[f"errors.{name}"] += 1

    if "commons" in allowed:
        titles, qid_of = [], {}
        for ent in ev.entities:
            for t in p18.get(ent.qid, [])[:1]:
                titles.append(t)
                qid_of[t] = ent.qid
        via_of = {t: ("p18_primary" if ev.primary is not None and qid_of[t] == ev.primary.qid else "p18") for t in titles}
        for via in ("p18_primary", "p18"):
            batch = [t for t in titles if via_of[t] == via]
            if batch:
                guarded("commons", lambda b=batch, v=via: commons_files(fetcher, b, via=v, qids=qid_of))
        if ev.primary is not None and ev.primary.kind in AUTO_KINDS:
            guarded("commons", lambda: commons_files(fetcher, commons_search(fetcher, f"haswbstatement:P180={ev.primary.qid}", limit=3),
                                                     via="depicts", qids={}))
    if not any(s >= REVIEW_SCORE for _, s, _, _ in a.found):
        if ev.year >= 1915 and SPACE_RE.search(f"{ev.title} {ev.text} {ev.branch}"):
            guarded("nasa", lambda: nasa_search(fetcher, ev))
        if 1840 <= ev.year <= 1990:
            guarded("loc", lambda: loc_search(fetcher, ev))
        guarded("smithsonian", lambda: smithsonian_search(fetcher, ev))
        if "commons" in allowed:
            words = " ".join(keywords(ev.title)[:6])
            if words:
                guarded("commons", lambda: commons_files(fetcher, commons_search(fetcher, f"{words} filetype:bitmap"), via="search"))
    a.found.sort(key=lambda x: (-x[1], x[0].source, x[0].source_id))
    return a


def auto_ok(f: Found, s: float, signals: list, ev: EventInfo) -> bool:
    """May this candidate be attached without the owner? (module docstring, "Where it goes")."""
    return (f.via == "p18_primary" and ev.primary is not None and ev.primary.kind in AUTO_KINDS and bool(PD_LICENSE_RE.match(f.license))
            and not f.restrictions and not signals and s >= AUTO_SCORE)


def _candidate(ev: EventInfo, f: Found, s: float, parts: dict, signals: list, status: str) -> ImageCandidate:
    return ImageCandidate(
        entry_id=ev.pk, kind=ImageCandidate.Kind.PICTURE, status=status, source=f.source, source_id=f.source_id[:300], file_page=f.file_page,
        image_url=f.image_url, thumb_url=f.thumb_url, thumb_width=f.thumb_width, thumb_height=f.thumb_height, width=f.width, height=f.height,
        mime=f.mime[:60], title=f.title or ev.title, alt=f.alt, creator=f.creator, credit=f.credit or f.creator or f.source, license=f.license[:200],
        license_url=f.license_url, file_date=f.file_date[:100], score=s,
        match={"via": f.via, "qid": f.qid, "signals": parts}, sensitive=bool(signals), sensitive_signals=signals,
        checks={"license": f.license, "restrictions": f.restrictions, "ai": {"clear": True, "rules": AI_RULES},
                "categories": f.categories[:40]},
        thumbnail_note=THUMBNAIL_NOTE[f.source].format(w=f.thumb_width or THUMB_WIDTH)[:300])


def attach(cand: ImageCandidate, *, actor: str, reason: str, sensitive: bool | None = None):
    """Make the candidate the entry's picture: a timeline.Image row through the service layer, audited (rule 2). The
    entry's other open candidates are superseded."""
    from revisions import revising
    from timeline import services
    from timeline.models import Image

    flag = cand.sensitive if sensitive is None else bool(sensitive)
    with transaction.atomic():
        with revising(actor, reason=reason[:2000]):
            top = Image.objects.filter(entry_id=cand.entry_id).aggregate(m=Max("position"))["m"]
            im = Image(entry_id=cand.entry_id, position=0 if top is None else top + 1)
            services.apply_changes(im, {"src": cand.thumb_url, "width": cand.thumb_width, "height": cand.thumb_height, "title": cand.title[:1000],
                                        "alt": cand.alt, "credit": cand.credit, "license": cand.license, "license_url": cand.license_url,
                                        "page": cand.file_page, "sensitive": flag})
        now = timezone.now()
        ImageCandidate.objects.filter(pk=cand.pk).update(status=ImageCandidate.Status.ATTACHED, image=im, sensitive=flag, decided_by=actor, decided_at=now)
        ImageCandidate.objects.filter(entry_id=cand.entry_id, kind=ImageCandidate.Kind.PICTURE,
                                      status__in=[ImageCandidate.Status.REVIEW, ImageCandidate.Status.ALTERNATE]).exclude(pk=cand.pk).update(
            status=ImageCandidate.Status.SUPERSEDED, decided_by=actor, decided_at=now)
        ImageSearch.objects.filter(entry_id=cand.entry_id).update(outcome=ImageSearch.Outcome.ATTACHED, next_attempt_at=None)
    return im


def set_flag(image, sensitive: bool, *, actor: str, reason: str) -> str:
    """Set or clear an attached image's sensitive flag, audited. → "updated" or "unchanged"."""
    from revisions import revising
    from timeline import services

    with revising(actor, reason=reason[:2000]):
        return services.apply_changes(image, {"sensitive": bool(sensitive)})


def deny(cand: ImageCandidate, *, actor: str, now=None) -> ImageCandidate | None:
    """The owner said no: never proposed again for this entry. The next alternate, if any, goes to review; with none,
    the entry may be searched again after its cooldown (if it has attempts left). → the promoted candidate."""
    now = now or timezone.now()
    ImageCandidate.objects.filter(pk=cand.pk).update(status=ImageCandidate.Status.DENIED, decided_by=actor, decided_at=now, backlog={})
    nxt = (ImageCandidate.objects.filter(entry_id=cand.entry_id, kind=ImageCandidate.Kind.PICTURE, status=ImageCandidate.Status.ALTERNATE)
           .order_by("-score", "id").first())
    if nxt is not None:
        ImageCandidate.objects.filter(pk=nxt.pk).update(status=ImageCandidate.Status.REVIEW)
        return nxt
    s = ImageSearch.objects.filter(entry_id=cand.entry_id).first()
    if s is not None:
        s.outcome = ImageSearch.Outcome.NONE
        s.next_attempt_at = next_attempt(s.attempts, now) if s.attempts else None
        s.save(update_fields=["outcome", "next_attempt_at", "updated_at"])
    return None


def next_attempt(attempts: int, now):
    """When an event that found nothing may be searched again: None once MAX_ATTEMPTS are used."""
    if attempts >= MAX_ATTEMPTS:
        return None
    return now + timedelta(days=COOLDOWN_DAYS[attempts - 1])


def record(ev: EventInfo, a: Attempt, outcome: str, now, *, kept: int) -> ImageSearch:
    s, _ = ImageSearch.objects.get_or_create(entry_id=ev.pk)
    s.attempts += 1
    s.last_attempt_at = now
    s.outcome = outcome
    s.next_attempt_at = next_attempt(s.attempts, now) if outcome in (ImageSearch.Outcome.NONE, ImageSearch.Outcome.ERROR) else None
    best = a.found[0][1] if a.found else None
    srcs = ", ".join(f"{k} {v}" for k, v in sorted(a.sources.items())) or "no hits"
    why = "; ".join(f"{k} ×{v}" for k, v in a.refused.most_common(3))
    s.note = (f"{outcome}: {srcs}" + (f"; best {best:.2f}" if best is not None else "") + (f"; refused: {why}" if why else "")
              + (f"; errors: {'; '.join(a.errors)[:200]}" if a.errors else ""))[:500]
    s.history = (list(s.history or []) + [{"at": now.isoformat(timespec="seconds"), "outcome": outcome, "sources": dict(a.sources),
                                           "best": best, "kept": kept, "refused": dict(a.refused), "errors": a.errors[:3]}])[-HISTORY_MAX:]
    s.save()
    return s


# ── the run ──────────────────────────────────────────────────────────────────────────────────────────────────────

def due(now, *, limit: int, slugs=None):
    """The events to search now: published or in review, with no picture and no candidate waiting, never searched or
    past their cooldown with attempts left; never-searched first, then the most important, in timeline order."""
    from timeline.models import Event, Image

    qs = (Event.objects.filter(status__in=["published", "review"])
          .exclude(Exists(Image.objects.filter(entry_id=OuterRef("pk"))))
          .exclude(Exists(ImageCandidate.objects.filter(entry_id=OuterRef("pk"), kind="picture", status__in=["review", "alternate"]))))
    if slugs:
        return list(qs.filter(slug__in=slugs).select_related("branch").order_by("sort_key"))
    searched = ImageSearch.objects.filter(entry_id=OuterRef("pk"))
    qs = qs.filter(~Exists(searched) | Exists(searched.filter(next_attempt_at__lte=now, attempts__lt=MAX_ATTEMPTS)))
    return list(qs.select_related("branch").order_by(F("image_search__attempts").asc(nulls_first=True), "imp", "sort_key")[:limit])


def preflight(fetcher, *, counts, only=None) -> set:
    """The sources the policy lets this run use: each probe URL through Fetcher.refusal (the Publisher rows, NEVER_FETCH,
    robots.txt), Smithsonian only with its key. A refused source is counted and skipped for the run."""
    ok = set()
    for name, url in PROBES.items():
        if only and name not in only:
            continue
        if name == "smithsonian" and not settings.SMITHSONIAN_API_KEY:
            counts["skipped.smithsonian_no_key"] += 1
            continue
        if fetcher.refusal(url, full_url=url):
            counts[f"refused_source.{name}"] += 1
            continue
        ok.add(name)
    return ok


def run(ctx):
    """One run of the image_search job. Options: per_run (events), slugs (only these, cooldown ignored), sources
    (a comma list), dry_run (search and score, write nothing), flags (attached pictures to read for sensitivity)."""
    now = timezone.now()
    dry = bool(ctx.opt("dry_run", False))
    slugs = ctx.opt("slugs")
    slugs = [s for s in slugs.split(",") if s] if isinstance(slugs, str) else slugs
    only = ctx.opt("sources")
    only = set(only.split(",")) if isinstance(only, str) else (set(only) if only else None)
    allowed = preflight(ctx.fetcher, counts=ctx.counts, only=only)
    events = due(now, limit=int(ctx.opt("per_run", PER_RUN)), slugs=slugs)
    infos = events_info(ctx.fetcher, events, counts=ctx.counts) if events and "commons" in allowed else \
        [EventInfo(pk=e.pk, slug=e.slug, title=e.title, text=e.text, year=e.y, branch=f"{e.branch.slug} {e.branch.name}") for e in events]
    p18 = {}
    if "commons" in allowed:
        qids = [x.qid for ev in infos for x in ev.entities]
        if qids:
            try:
                p18 = p18_files(ctx.fetcher, qids)
            except (Refused, FetchError, RuntimeError, KeyError) as e:
                ctx.error(f"Wikidata P18: {type(e).__name__}: {e}")
    for ev in infos:
        ctx.check_stop()
        a = search_event(ctx.fetcher, ev, allowed=allowed, p18=p18, counts=ctx.counts)
        ctx.counts["events"] += 1
        kept = [x for x in a.found if x[1] >= REVIEW_SCORE][:KEEP]
        best = kept[0] if kept else None
        if best and auto_ok(best[0], best[1], best[3], ev):
            outcome = ImageSearch.Outcome.ATTACHED
        elif kept:
            outcome = ImageSearch.Outcome.REVIEW
        elif a.errors and not a.found:
            outcome = ImageSearch.Outcome.ERROR
        else:
            outcome = ImageSearch.Outcome.NONE
        ctx.counts[outcome] += 1
        if best and best[3]:
            ctx.counts["flagged"] += 1
        if best and best[0].via.startswith("p18"):
            ctx.counts[f"best_via.{best[0].via}"] += 1
        if dry:
            ctx.log(f"{ev.slug}: {outcome}" + (f" {best[0].source} {best[0].source_id} {best[1]:.2f} {best[0].license}" if best else ""))
            continue
        with transaction.atomic():
            rows = []
            for f, s, parts, signals in kept:
                status = ImageCandidate.Status.REVIEW if not rows else ImageCandidate.Status.ALTERNATE
                new = _candidate(ev, f, s, parts, signals, status)
                c, created = ImageCandidate.objects.get_or_create(
                    entry_id=ev.pk, kind=ImageCandidate.Kind.PICTURE, source=f.source, source_id=f.source_id[:300],
                    defaults={k: getattr(new, k) for k in _CANDIDATE_FIELDS})
                if not created:
                    if c.status in (ImageCandidate.Status.DENIED, ImageCandidate.Status.ATTACHED):
                        continue  # the owner said no to this one before, or it was attached once and since removed
                    ImageCandidate.objects.filter(pk=c.pk).update(status=status, score=s, match=new.match, sensitive=new.sensitive,
                                                                  sensitive_signals=new.sensitive_signals)
                    c.status = status
                rows.append(c)
            if not rows and outcome in (ImageSearch.Outcome.REVIEW, ImageSearch.Outcome.ATTACHED):
                outcome = ImageSearch.Outcome.NONE
            record(ev, a, outcome, now, kept=len(rows))
        if outcome == ImageSearch.Outcome.ATTACHED and rows and rows[0].status == ImageCandidate.Status.REVIEW:
            attach(rows[0], actor=ctx.actor, reason=f"image_search: {rows[0].source} {rows[0].source_id} for {ev.slug}, "
                                                    f"the primary entity's own P18, {rows[0].license}, score {rows[0].score:.2f}")
            ctx.counts["attached_rows"] += 1
    if not dry:
        flag_pass(ctx, limit=int(ctx.opt("flags", FLAG_PER_RUN)), allowed=allowed)


_CANDIDATE_FIELDS = [f.name for f in ImageCandidate._meta.concrete_fields if f.name not in ("id", "entry", "kind", "source", "source_id", "created_at")]


def flag_pass(ctx, *, limit: int, allowed: set) -> None:
    """Read the Commons categories of pictures already attached (from a watermark, `limit` a run) and blur those the
    signals name: the flag is set (as the job) and a `flag` item asks the owner to confirm or clear it. A flag the
    owner cleared is never set again by the job."""
    from timeline.models import Image

    if limit <= 0 or "commons" not in allowed:
        return
    state, _ = JobState.objects.get_or_create(name=FLAG_STATE)
    upto = int((state.state or {}).get("upto") or 0)
    rows = list(Image.objects.filter(pk__gt=upto, sensitive=False).select_related("entry").order_by("pk")[:limit])
    if not rows:
        return
    commons = {file_title(im.page): im for im in rows if "commons.wikimedia.org/wiki/" in im.page}
    found = {}
    if commons:
        try:
            for f in commons_files(ctx.fetcher, list(commons), via="p18"):
                found[f.source_id] = f
        except (Refused, FetchError, RuntimeError, KeyError) as e:
            ctx.error(f"flags: {type(e).__name__}: {e}")
            return
    for im in rows:
        e = im.entry.concrete
        f = found.get(file_title(im.page)) or Found(source="commons", source_id=file_title(im.page) or im.page[:300], file_page=im.page,
                                                    thumb_url="", title=im.title, via="p18")
        ev = EventInfo(pk=e.pk, slug=e.slug, title=getattr(e, "title", None) or getattr(e, "name", ""), text=e.text, year=getattr(e, "y", None),
                       branch=(f"{e.branch.slug} {e.branch.name}" if hasattr(e, "branch") else f"{e.slug} {getattr(e, 'name', '')}"))
        signals = sensitivity(f, ev)
        ctx.counts["flags_read"] += 1
        if not signals:
            continue
        key = dict(entry_id=e.pk, kind=ImageCandidate.Kind.FLAG, source="commons" if f.categories else "page", source_id=(f.source_id or im.page)[:300])
        if ImageCandidate.objects.filter(**key).exists():
            continue  # flagged once already: the owner's decision stands
        with transaction.atomic():
            set_flag(im, True, actor=ctx.actor, reason=f"image_search: sensitivity signals on {e.slug}'s picture: {'; '.join(signals)[:300]}")
            ImageCandidate.objects.create(
                **key, status=ImageCandidate.Status.REVIEW, file_page=im.page, thumb_url=im.src if im.src.startswith("https://") else "",
                thumb_width=im.width, thumb_height=im.height, title=im.title, alt=im.alt, credit=im.credit,
                license=im.license if OPEN_LICENSE_RE.match(im.license) else "Public domain", license_url=im.license_url, score=1.0,
                match={"via": "attached"}, sensitive=True, sensitive_signals=signals, image=im,
                checks={"categories": f.categories[:40]}, thumbnail_note="an image already attached")
        ctx.counts["flags_set"] += 1
    state.state = {**(state.state or {}), "upto": rows[-1].pk, "at": timezone.now().isoformat(timespec="seconds")}
    state.save()
