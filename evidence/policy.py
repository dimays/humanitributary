"""The fact base's thresholds, in one place (docs/fact-checking.md explains each; docs/adr/0009-fact-base.md says
why). Override any of them with `settings.FACTS` (a dict merged over this one) rather than editing the code that reads
them, so a change is one line and shows up in review.

Everything here is deterministic: the same evidence, the same `today` → the same statuses, dates and tasks.
"""

from django.conf import settings

RULES_VERSION = "facts-v1"

DEFAULTS = {
    # ── Confidence (evidence/confidence.py) ──
    # A witness's weight: tier × stance × method × freshness. Witnesses are publishers grouped by organization
    # (evidence/independence.py); each counts once, with its strongest evidence.
    "tier_weight": {1: 0.6, 2: 0.5, 3: 0.35, 4: 0.15, None: 0.25},
    "stance_factor": {"supports": 1.0, "partial": 0.5},
    # How much we trust the check itself. "legacy": the static site's author read the page in their session; it
    # has not been re-read here.
    "method_factor": {"legacy": 0.85, "fetch_match": 0.8, "agent_read": 1.0, "browser_read": 1.0, "human": 1.0},
    # Freshness of a check, by its age against the claim's recheck interval: within it, within twice it, older.
    # Evidence never checked here (legacy) is discounted by its method instead.
    "freshness": [(1.0, 1.0), (2.0, 0.9), (None, 0.75)],
    # Corroborated = at least this many independent witnesses that fully support the claim.
    "corroborated_min_witnesses": 2,
    # Contested = tier-weighted conflict of at least this (1 − Π(1 − w) over conflicting witnesses), or any conflict
    # at least as strong as the support.
    "contested_conflict": 0.3,
    # When sources give dates (Evidence.found_value), their agreement with the claim scales confidence by
    # floor + (1 − floor) × share agreeing.
    "agreement_floor": 0.5,

    # ── Staleness (evidence/staleness.py) ──
    # Days from the last check until a claim should be re-read, by what it states (the row) and how recent its
    # entry is (the column, by the entry's latest date). An entry in the current year, or one still going on
    # ("ongoing" in its date, an event or branch with no end that reaches the current year), uses "current".
    "recheck_days": {
        #             current  last 2 yrs  since 1945  since 1800  before 1800
        "date":       (30,     180,        730,        1825,       3650),
        "number":     (7,      60,         730,        1825,       3650),
        "location":   (90,     365,        1825,       3650,       3650),
        "actor":      (30,     180,        1825,       3650,       3650),
        "as_written": (30,     180,        730,        1825,       3650),
        "why":        (180,    365,        1825,       1825,       1825),
        "origin":     (365,    730,        1825,       1825,       1825),
        "title":      (30,     180,        1825,       3650,       3650),
        "text":       (30,     180,        730,        1825,       3650),
        "connection": (180,    365,        1825,       1825,       1825),
        "link":       (180,    365,        1825,       1825,       1825),
    },
    "ongoing_words": r"\b(ongoing|present|to date|continues|since \d{4}\s*$)\b",
    # Link health: an HTTP status at or above this is a dead link.
    "dead_http_status": 400,
    # … except these, which say the site refuses automated readers, not that the page is gone ("blocked").
    "blocked_http_statuses": (401, 403, 429),

    # ── Conflicts from ingestion (evidence/conflicts.py) ──
    # A candidate counts as being about an existing event when its title is this similar (pg_trgm) …
    "conflict_min_similarity": 0.75,
    # … and its date disagrees by more than the tolerance for the event's precision (years) …
    "date_tolerance_years": {
        "billion_years": 2e8, "million_years": 2e5, "thousand_years": 2000, "millennium": 500, "century": 50,
        "decade": 5, "year": 0.99, "month": 0.09, "day": 0.01,
    },
    # … but by less than this many tolerances, or this many years if more (beyond it, it is more likely a
    # different event of the same name).
    "date_plausible_tolerances": 50,
    "date_plausible_min_years": 10,

    # ── The sweep (evidence/sweep.py) ──
    "max_tasks_per_sweep": 200,  # verify_claim tasks it may queue in one run (highest priority first) …
    "max_open_tasks": 500,  # … and at most this many of its verify_claim tasks open at once
    "task_priority": {"conflict": 60, "dead_link": 50, "content_changed": 45, "no_second_source": 20, "scheduled": 10},

    # ── Publishing (docs/adr/0010-publishing-rule.md) ──
    # A newly published event needs a non-Wikipedia supporting source once it is this many days old (current
    # events may go out on Wikipedia and wire reports first).
    "grace_days": 14,
    # A contested claim may be published only if the entry says the sources differ, in words like these.
    "sources_differ": r"sources (differ|disagree|vary)|estimates (vary|differ|range)|some (sources|historians|scholars|date|say)"
    r"|\bdates? (vary|differ)\b|\bdebated\b|\bdisputed\b|\bcontested\b",
    # … or attributes the claim to two or more named sources ("Wikipedia says …; the Met says …").
    "attribution": r"\b(says|say|puts|put|dates|according to|per)\b",
}


def get(name: str):
    over = getattr(settings, "FACTS", {}) or {}
    return over.get(name, DEFAULTS[name])
