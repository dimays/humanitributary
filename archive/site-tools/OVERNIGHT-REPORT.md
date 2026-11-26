The app was renamed Humanitributary on 2026-11-26.

# Overnight report — November 26, 2026

## What changed

**New name.** The app is now **Tributaries** ("all of history, from the Big Bang to now"), with a braided-river logo in
the header and a matching favicon. A new region, **Arts, culture & sport**, holds 12 cross-border branches: Romanticism,
Realism & Impressionism, Modernism, Photography, Cinema, Radio & television, Jazz & blues, Rock & pop, Hip hop, the
modern Olympics, Association football and Video games, each linked to the country branches its events belong to.

**Much more history, working backward from today.** Events went from **2,283 to 4,938** (357 branches). Six waves
filled empty time windows on every branch: 1925–now (5-year windows), 1800–1925 (10), 1500–1800 (25), 1000–1500 (50),
1000 BCE–1000 CE (100) and 3500–1000 BCE (250); faith and philosophy branches used 4× wider windows. Writers skipped a
window rather than pad it when nothing notable or sourceable happened. Roughly a third of the additions are cultural:
literature, art, architecture, music, film, theater, sport, science, everyday life — plus dedicated culture passes for
every region since 1800.

**Every new file was audited by a second agent** against its cited pages: dates, every claim, a non-Wikipedia source
where reachable, duplicates, locations. Typical audit outcome per ~50-event file: 15–35 rewordings (unsupported
superlatives and invented specifics cut), 5–30 events re-sourced, 0–5 deletions (duplicates, invented dates). About 60
duplicate events created by parallel writers were removed. All new coordinates were checked against Wikipedia's
(≈ 1,100 corrected over four passes).

**The globe.**
- **Before 540 Ma** it now shows labeled artist's impressions (AI-assisted, procedurally rendered — not maps) of each
  stage: molten Hadean Earth, the Hadean/Archean water world, early cratons, the Huronian glaciation, the
  Columbia/Rodinia supercontinents, the Sturtian and Marinoan Snowball Earths and the Ediacaran.
- **Ice ages** (Andean-Saharan, Late Paleozoic, Antarctic from 34 Ma, Quaternary, Last Glacial Maximum with lowered sea
  level) are drawn as approximate ice; captions say so.
- **Pins on ancient land:** for entries on paleo maps, the pin sits where that place was at the time, from the same
  PALEOMAP plate model as the maps (GPlates Web Service). Only ~10 entries qualify so far.
- **Region outlines:** 192 states and empires now show their real outline at the event's date, from **Cliopatria**
  (Seshat Global History Databank, CC BY 4.0) and Natural Earth (public domain) for modern countries. 677 events show
  the outline fully and 2,121 faintly behind their pin; the rest keep the radius circle. Outlines live in
  `outlines.js` (1.5 MB) next to `timeline.html`.

## Weak spots (honest list)

- **4.3% of new events still cite only Wikipedia** (115 of 2,655) — mostly ancient and prehistoric entries, plus the
  Austria/Belgium 1925+ file, where Britannica/UNESCO pages were missing or blocked to automated readers. A few second
  sources are secondary (a bioRxiv preprint for a Yamnaya event, news sites for some recent cultural events).
- A few audits were partial at first (Pacific 1925+, faiths 1800–1925, Ireland/Poland 1500–1800); all three were
  re-audited in full.
- ~20 citations to weak sites (blogs, popular-history aggregators) were found by a domain scan and sent for replacement.
- Many ancient dates are honest ranges ("c.", "debated", "sources differ"); where Britannica and Wikipedia disagree, the
  entry usually says so.
- Not done overnight: images for the ~2,700 new events, and "why it matters" paragraphs for them.

## Suggestions: split, add, consolidate (for your review)

**Missing states and peoples (biggest gaps)**
- Many modern African states have no branch: Senegal, Uganda, Tanzania, Zimbabwe, modern Mali, Cameroon, Morocco, Libya.
  (Négritude, FESPACO and Sembène have nowhere to go.)
- No branch for Egypt 1805–1922 (Muhammad Ali, the khedivate, the Nahda), Vietnam before 1887 (Nguyễn dynasty),
  Company-era India before 1858, the Sokoto Caliphate/Hausa states, Oyo, the Zulu kingdom, the Mahdist Sudan,
  Morocco's sultanates.
- Middle East: no Lebanon, Jordan, Gulf states; `palestine` starts in 1994 (nothing for 1948–94); `south-caucasus`
  starts in 1991 (no Armenia/Georgia before).
- No Hong Kong/Macau branch; no Sri Lanka or Nepal; no Spanish-colonial Philippines (Rizal, 1896); no pre-1990
  Baltic states.
- Pacific: the Kingdom of Hawaiʻi and Tonga deserve their own branches (now crowded into `polynesians`).
- Ancient: Erlitou (between Neolithic China and Shang), the Zagwe dynasty (before `ethiopia` 1270), Sangam-era
  Cholas, the Vakatakas, Igbo-Ukwu/Nri, Jenne-Jeno, the Neo-Inca state (1533–72), the Sultanate of Rum, a Goths branch.

**Too broad — consider splitting**
- `first-americans` (23,000 years to today, both continents) → regional Indigenous branches (North America,
  Mesoamerica, Andes, Amazonia) and a modern Indigenous-movements branch.
- `first-australians` (65,000 years to today) → deep prehistory vs. modern Aboriginal and Torres Strait Islander
  history (several Indigenous milestones sit on `australia`).
- `yugoslavia` (kingdom, WWII, socialist state in one); `korean-empire` (1897–1945 includes Japanese rule);
  `babylonia` (Old and Neo-Babylonian); `mahajanapadas` (includes the Nanda empire).

**Overlaps — consider consolidating or re-scoping**
- `ecsc` / `eec` / `eu` → one "European integration" branch with phases.
- `aristotelianism` overlaps `scholasticism`; `austronesian-expansion` overlaps `polynesians` at Lapita.
- `buddhist-philosophy` (Madhyamaka & Yogācāra) and `classical-hindu-schools` have no natural modern continuation
  (the latter after 1925 is really modern yoga) — end them or rename.

**Dates to re-check**
- `ife` starts 1000–500 BCE; the Met traces Ife to c. 6th century CE.
- `indus` ends 1300 BCE, but Mohenjo-daro was abandoned c. 1700 BCE.
- `mali` ends c. 1610, but World History Encyclopedia says the empire collapsed in the 1460s.
- `ethiopia` starts 1270, after Lalibela (Zagwe, early 1200s).
- Existing event "Audaghost taken, 1050" (Ghana) conflicts with 990 in Wikipedia.

## Follow-up: suggestions applied (November 26, afternoon)

All approved suggestions are done, each new file written by one agent and audited by another against its cited pages
(in-app browser for Britannica/UNESCO). Totals now **386 branches, 5,388 events**, 0 build errors.

- **New branches (31):** Senegal, Uganda, Tanzania, Zimbabwe, Mali (since 1960), Cameroon, Morocco (Alaouite, from
  1666), Libya; Lebanon, Jordan, Gulf states; Sri Lanka (from Anuradhapura), Nepal, Hong Kong; Egypt under Muhammad
  Ali's dynasty, Nguyễn Vietnam, the Sokoto Caliphate, Spanish Philippines, the Kingdom of Hawaiʻi, Tonga; Erlitou, the
  Zagwe dynasty, the Neo-Inca state, the Sultanate of Rum, the Goths. Each has an origin, a location and 8–30 events;
  ~60 existing events were moved onto them.
- **First Americans split:** the old 23,000-year branch is now "Peopling of the Americas" (to c. 8000 BCE) with six
  children: Indigenous North America, Mesoamerica, Andes, Amazonia, Caribbean, and Indigenous rights movements (from
  1961). 72 events moved, 25 added; Olmec, Maya, Teotihuacan, Aztec, Caral, Inca and colonial Brazil now descend from
  the right regional branch.
- **Consolidated:** ECSC + EEC + EU → one "European integration" branch; Buddhist philosophy ends c. 1200 and Classical
  Hindu schools c. 1100 (later events moved to Buddhism/Hinduism); Aristotelianism vs. scholasticism and Austronesian
  expansion vs. Polynesians re-scoped.
- **Dates fixed:** Ife from c. 550 CE; the Indus end restated as Late Harappan; Mali as a Keita rump state to c. 1610;
  Audaghost c. 990; Ethiopia's Zagwe prelude now its own branch.
- **How:** restructuring is data, not edits — `TL.move`, `TL.patch`, `TL.merge` in `data/90-*`… (see SCHEMA.md,
  `restructure.mjs`); conflicting moves fail the build.
- **Outlines:** 209 branches now have real outlines (17 new table entries in `build-outlines.mjs`).
- **Still Wikipedia-only (no reachable second source):** 9 ancient events (3 Erlitou, Zagwe/Tigray, 5 Neo-Inca) and a
  handful of single facts inside otherwise-sourced Mali/Libya/Caribbean events; listed in the audit notes.

## Housekeeping

- Nothing is committed. New data files: `data/79-culture-branches.js`, `data/80-*` … `data/85-*` (one per job).
- New/changed scripts: `build-outlines.mjs`, `build-paleo-points.mjs`, `verify-geo.mjs` (now only rewrites changed
  files, safely), globe code in `template.html`.
- `images/` (27 MB) and `outlines.js` must stay next to `timeline.html`.
