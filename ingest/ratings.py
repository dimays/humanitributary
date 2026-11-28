"""The source ratings of the November 28, 2026 source-discovery round, turned into Publisher policy
(docs/adr/0037-source-ratings-2026-11-28.md). Applied once per database by `seed_sources` (JobState
"ratings_2026_11_28"), through the service layer as the job, like the terms verdicts of ADR 0013.

The round's records are `ingest/ratings/2026-11-28-scholarly.json` (48) and `-gov-news.json` (56), as the round wrote
them: name, domains, verdict (allowed, api_only, browser_only, citation_only, forbidden), whether a key is needed, the
license, what robots.txt said, the terms URL and the clause relied on, rate limits, eras, regions, notes.

How a record becomes policy (`decisions`), deterministically:

- **Restrictive verdicts** (`browser_only`, `citation_only`, `forbidden`) are recorded whatever the confidence: they
  only stop jobs. They set `fetch_policy` (never loosening a `forbidden` row; the round's `forbidden` is recorded as
  `citation_only`, `POLICY_FOR`, since `forbidden` here also bars citing) and add no tier, so the publisher stays
  unrated for the evidence-pack job.
- **Permissive verdicts** (`allowed`, `api_only`) are applied only with confidence: none of the record's license,
  robots, clause or notes may say it rests on something unread or unverified (`LOW_CONFIDENCE`: "not re-verified",
  "not read", "bot wall", "403", "low confidence", "via search" …). A confident one sets `fetch_policy`, a tier
  (`TIERS`, else the row's own) and, for `api_only`, the API base (`API_BASES`) and whether it needs a key; a key
  with no setting in `config/settings.py` keeps the API off. A low-confidence one changes no policy: the domain
  stays as it was (unrated if it was), and its note says why the rating wasn't applied.
- **Corpora** (`CORPORA`: the GitHub TEI corpora, CBETA, papyri.info) are recorded as sources only; no fetcher reads
  them yet (follow-up work).
- Every record adds a note to each of its publishers' `access_notes`: "Rated 2026-11-28 …", the verdict, whether it
  was applied, the terms URL, the clause and what robots.txt said.

Domains are normalized like `evidence.publishers.domain_of` ("www." dropped); a subdomain listed beside its parent
("api.openalex.org", "openalex.org") is the parent's; paths (github.com/…) and shared hosts (raw.githubusercontent.com)
get no row.
"""

import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path

from django.conf import settings

RATED_ON = "2026-11-28"
STATE = "ratings_2026_11_28"
FILES = [Path(__file__).parent / "ratings" / f"{RATED_ON}-scholarly.json", Path(__file__).parent / "ratings" / f"{RATED_ON}-gov-news.json"]
RESTRICTIVE = ("browser_only", "citation_only", "forbidden")
PERMISSIVE = ("allowed", "api_only")
LOW_CONFIDENCE = re.compile(
    r"not re-verified|unverified|not verified|low confidence|low-medium|medium-low|\bnot read\b|not fetched|not retrieved|none retrieved|"
    r"not retried|bot wall|\b403\b|\b429\b|\b500\b|\b503\b|fetch failed|timed out|not determinable|unknown|connection refused|"
    r"unable to fetch|refused this domain|truncated|via search|search snippet|summari[sz]ed|paraphrase|not tested|not checked|"
    r"unreachable|no tou|no terms|terms unread|terms not", re.I)
CORPORA = {"Perseus / First1KGreek TEI corpora on GitHub", "CBETA / DILA Buddhist canon API", "Papyri.info / Trismegistos-style papyrology"}
SHARED_HOSTS = {"raw.githubusercontent.com", "github.com"}
HOST_RE = re.compile(r"^[a-z0-9-]+(\.[a-z0-9-]+)+$")
# The round's `forbidden` means "never fetched, terms forbid mining" (Al Jazeera). Here `forbidden` also means "never
# cited" (OpenStax: the database refuses its citations), so it is recorded as `citation_only`: jobs never fetch it,
# agents may still cite it and read it in a browser, as ADR 0013 already had it.
POLICY_FOR = {"forbidden": "citation_only"}
# Reliability tiers for confident permissive ratings (1 primary, official; 2 scholarly or institutional; 3 general).
TIERS = {"api.semanticscholar.org": 2, "loc.gov": 1, "plato.stanford.edu": 2, "wikidata.org": 3, "govinfo.gov": 1, "congress.gov": 1,
         "archives.gov": 1, "nasa.gov": 1, "usgs.gov": 1, "ourworldindata.org": 2, "open.canada.ca": 1}
# The API base a job may use for a confident api_only rating: a URL prefix, optionally a required query parameter.
API_BASES = {
    "Semantic Scholar API": "https://api.semanticscholar.org/graph/v1/",
    "Library of Congress JSON API": "https://www.loc.gov/ ?fo=json",
    "Chronicling America (via loc.gov)": "https://www.loc.gov/collections/chronicling-america/ ?fo=json",
    "Congress.gov / Congress API": "https://api.congress.gov/v3/",
    "National Archives Catalog API": "https://catalog.archives.gov/api/v2/",
    "Open Government Canada (open.canada.ca)": "https://open.canada.ca/data/api/3/action/",
}
# Settings holding a key for a keyed API (none of the confident keyed ones has one: they stay off).
KEY_SETTINGS: dict[str, str] = {}


@dataclass
class Decision:
    name: str
    verdict: str
    domains: list
    confident: bool
    flags: list
    apply_policy: bool
    tier: int | None = None
    api_base: str = ""
    needs_key: bool = False
    key_setting: str = ""
    corpus: bool = False
    record: dict = field(default_factory=dict)

    @property
    def note(self) -> str:
        r = self.record
        if self.corpus:
            state = "recorded as a corpus; no fetcher yet (follow-up)"
        elif self.apply_policy:
            state = "applied" + (" (its API needs a key that isn't set: off)" if self.verdict == "api_only" and self.needs_key and not self._key_set else "")
        else:
            state = f"not applied: low confidence ({', '.join(self.flags[:4])})"
        parts = [f"Rated {RATED_ON} (source discovery, ADR 0037): {self.verdict}, {state}.",
                 f"Terms: {r.get('terms_url') or 'none found'}.", f"Clause: {_short(r.get('clause'), 220)}.",
                 f"robots.txt: {_short(r.get('robots'), 200)}."]
        if self.api_base:
            parts.append(f"API: {self.api_base}.")
        return " ".join(parts)

    @property
    def _key_set(self) -> bool:
        return bool(self.key_setting and getattr(settings, self.key_setting, ""))


def _short(v, n: int) -> str:
    s = " ".join(str(v or "").split()).rstrip(".")
    return s if len(s) <= n else s[: n - 1] + "…"


def records() -> list[dict]:
    out = []
    for f in FILES:
        out += json.loads(f.read_text())
    return out


def domains(listed: list[str]) -> list[str]:
    """The Publisher domains a record names: "www." dropped, paths and shared hosts skipped, a subdomain listed
    beside its parent folded into it."""
    ds = []
    for d in listed:
        d = d.strip().lower()
        if "/" in d or d in SHARED_HOSTS or not HOST_RE.match(d):
            continue
        d = d[4:] if d.startswith("www.") else d
        if d not in ds:
            ds.append(d)
    return [d for d in ds if not any(d != p and d.endswith("." + p) for p in ds)]


def _needs_key(v) -> bool:
    return v is True or (isinstance(v, str) and v.strip().lower().startswith("yes"))


def decide(r: dict) -> Decision:
    text = " ".join(str(r.get(k) or "") for k in ("license", "robots", "clause", "notes"))
    flags = sorted({m.group(0).lower() for m in LOW_CONFIDENCE.finditer(text)})
    verdict = r["verdict"]
    ds = domains(r.get("domains") or [])
    d = Decision(name=r["name"], verdict=verdict, domains=ds, confident=not flags, flags=flags, apply_policy=False, record=r,
                 corpus=r["name"] in CORPORA)
    if d.corpus:
        return d
    if verdict in RESTRICTIVE:
        d.apply_policy = True
    elif verdict in PERMISSIVE and d.confident:
        d.apply_policy = True
        d.tier = next((TIERS[x] for x in ds if x in TIERS), None)
        if verdict == "api_only":
            d.api_base = API_BASES.get(r["name"], "")
            d.needs_key = _needs_key(r.get("needs_key"))
            d.key_setting = KEY_SETTINGS.get(r["name"], "")
            if not d.api_base:  # no usable base: nothing a job could safely request
                d.apply_policy, d.flags = False, ["no API base recorded"]
    return d


def decisions() -> list[Decision]:
    return [decide(r) for r in records()]


def merged() -> dict[str, dict]:
    """domain → what to write: the strictest applied verdict wins; API bases of applied api_only ratings join with
    " | "; every record's note is kept."""
    order = {"forbidden": 0, "citation_only": 1, "browser_only": 2, "api_only": 3, "allowed": 4}
    out = defaultdict(lambda: {"notes": [], "policy": None, "tier": None, "api_base": [], "needs_key": False, "key_setting": ""})
    for dec in decisions():
        for dom in dec.domains:
            w = out[dom]
            w["notes"].append(dec.note)
            if not dec.apply_policy:
                continue
            pol = POLICY_FOR.get(dec.verdict, dec.verdict)
            if w["policy"] is None or order[pol] < order[w["policy"]]:
                w["policy"] = pol
            w["tier"] = w["tier"] or dec.tier
            if dec.api_base and dec.api_base not in w["api_base"]:
                w["api_base"].append(dec.api_base)
            w["needs_key"] = w["needs_key"] or dec.needs_key
            w["key_setting"] = w["key_setting"] or dec.key_setting
    return dict(out)


def apply(actor: str = "job:seed_sources", *, force: bool = False) -> Counter:
    """Write the ratings into Publisher rows, once per database (or again with force=True), through the services."""
    from evidence.models import Publisher
    from evidence.publishers import defaults_for
    from revisions import revising
    from timeline.services import apply_changes

    from .models import JobState

    counts = Counter()
    state, _ = JobState.objects.get_or_create(name=STATE)
    if state.state.get("applied") and not force:
        return counts
    with revising(actor, reason=f"Source ratings {RATED_ON} (docs/adr/0037-source-ratings-2026-11-28.md)"):
        for dom, w in sorted(merged().items()):
            p = Publisher.objects.filter(domain=dom).first()
            if p is None:
                p = Publisher.objects.create(domain=dom, **defaults_for(dom))
                counts["created"] += 1
            note = "\n".join(w["notes"])
            values = {"access_notes": (p.access_notes + "\n" + note).strip() if note not in p.access_notes else p.access_notes}
            if w["policy"] and p.fetch_policy != "forbidden":
                values["fetch_policy"] = w["policy"]
                if w["policy"] in PERMISSIVE and p.tier is None and w["tier"]:
                    values["tier"] = w["tier"]
                if w["policy"] == "api_only":
                    values |= {"api_base": " | ".join(w["api_base"]), "api_needs_key": w["needs_key"], "api_key_setting": w["key_setting"]}
                counts[f"policy_{w['policy']}"] += 1
            else:
                counts["notes_only"] += 1
            if apply_changes(p, values) != "unchanged":
                counts["updated"] += 1
    state.state = {"applied": True, **counts}
    state.save()
    return counts


def follow_ups() -> list[dict]:
    """What the ratings leave for later: the corpora with no fetcher, and the confident keyed APIs without a key."""
    out = [{"name": d.name, "why": "TEI/data corpus: record only, no fetcher yet", "where": d.record.get("api_base")} for d in decisions() if d.corpus]
    out += [{"name": d.name, "why": "api_only and needs a key: off until a key exists (none requested)", "where": d.api_base}
            for d in decisions() if d.apply_policy and d.verdict == "api_only" and d.needs_key and not d._key_set]
    return out
