"""Derived date fields, read from a date's text ("c. 3100 BCE", "April 26–29, 1994", "4.54 billion years ago").

The text and the decimal year are the truth (SCHEMA.md); these are conveniences for querying and review: how fine the
date is, whether it is hedged, and the exact calendar date when the text names a day. Deterministic, no guessing past
the text: anything unrecognized is "year" precision with no exact date.
"""

import datetime as dt
import re
from dataclasses import dataclass

MONTHS = {m: i for i, m in enumerate(
    ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"], 1)}
MONTH = r"(January|February|March|April|May|June|July|August|September|October|November|December)"
APPROX = re.compile(r"(?<!\w)(c|ca)\.|\b(circa|about|around|approximately|possibly|probably|perhaps|debated|traditionally|by|before|after|or|from)\b|±|\?|/", re.I)
# "April 12, 1861", "April 26–29, 1994", "November 20 – December 4, 1979", "December 17, 2010 – January 14, 2011"
DAY_US = re.compile(rf"{MONTH} (\d{{1,2}})(?:\s*[–-]\s*(?:{MONTH} )?(\d{{1,2}}))?,? (\d{{1,4}})(?!\d)(?:\s*[–-]\s*{MONTH} (\d{{1,2}}),? (\d{{3,4}}))?", re.I)
# "15 March 44 BCE", "20 July 1969"
DAY_EU = re.compile(rf"(\d{{1,2}}) {MONTH},? (\d{{1,4}})(?!\d)", re.I)
MONTH_YEAR = re.compile(rf"{MONTH},? \d{{1,4}}", re.I)
DECADE = re.compile(r"\b\d{2,3}0s\b")


@dataclass(frozen=True)
class DateInfo:
    precision: str
    approximate: bool
    date: dt.date | None = None
    end_date: dt.date | None = None


def _mk(y: int, m: str | int, d: str | int) -> dt.date | None:
    try:
        return dt.date(int(y), MONTHS[m.lower()] if isinstance(m, str) else m, int(d))
    except (ValueError, KeyError):
        return None


def parse_when(text: str | None) -> DateInfo:
    t = (text or "").strip()
    approx = bool(APPROX.search(t))
    low = t.lower()
    bce = "bce" in low or " bc" in low or "years ago" in low
    if "billion" in low or re.search(r"\bGa\b", t):
        return DateInfo("billion_years", approx)
    if "million" in low or re.search(r"\bMa\b", t):
        return DateInfo("million_years", approx)
    if "years ago" in low:
        return DateInfo("thousand_years", approx)
    if (m := DAY_US.search(t)) and not bce:
        mon, d1, mon2, d2, y, emon, ed, ey = m.groups()
        start = _mk(y, mon, d1)
        end = None
        if emon:
            end = _mk(ey, emon, ed)
        elif d2:
            end = _mk(y, mon2 or mon, d2)
        return DateInfo("day", approx, start, end)
    if (m := DAY_EU.search(t)) and not bce:
        return DateInfo("day", approx, _mk(m.group(3), m.group(2), m.group(1)))
    if DAY_US.search(t) or DAY_EU.search(t):
        return DateInfo("day", approx)
    if MONTH_YEAR.search(t):
        return DateInfo("month", approx)
    if "millenni" in low:
        return DateInfo("millennium", approx)
    if "century" in low or "centuries" in low:
        return DateInfo("century", approx)
    if DECADE.search(t):
        return DateInfo("decade", approx)
    return DateInfo("year", approx)
