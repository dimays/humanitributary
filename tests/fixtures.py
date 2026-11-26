"""A small content dump with every shape the snapshot format has, in canonical key order (site/canonical.mjs)."""

import copy

W = lambda slug: {"t": f"{slug.replace('_', ' ')} — Wikipedia", "u": f"https://en.wikipedia.org/wiki/{slug}"}  # noqa: E731

SMALL = {
    "branches": [
        {
            "id": "roman-kingdom", "name": "Roman Kingdom", "region": "europe", "start": -753, "end": -509,
            "startWhen": "c. 753 BCE (traditional)", "endWhen": "509 BCE", "parents": [], "into": ["roman-republic"],
            "text": "Rome under kings, by tradition founded in 753 BCE.",
            "cites": [W("Roman_Kingdom")],
            "origin": {"note": "Latin settlements on the Palatine hill.", "links": [], "cites": [{"t": "Rome — Britannica", "u": "https://www.britannica.com/place/Rome"}]},
            "geo": {"scope": "place", "lat": 41.89, "lon": 12.49, "r": 40, "label": "Rome", "src": "https://en.wikipedia.org/wiki/Rome"},
        },
        {
            "id": "roman-republic", "name": "Roman Republic", "region": "europe", "start": -509, "end": -27,
            "startWhen": "509 BCE", "endWhen": "27 BCE", "parents": ["roman-kingdom"], "into": [],
            "text": "Rome governed by elected magistrates and the Senate.",
            "cites": [W("Roman_Republic"), {"t": "Roman Republic | Britannica", "u": "https://www.britannica.com/place/Roman-Republic", "k": "encyclopedia"}],
            "origin": {"note": "Founded when the last king was expelled.", "links": [{"id": "roman-kingdom", "how": "successor", "note": "Replaced the monarchy in 509 BCE"}], "cites": [W("Roman_Republic")]},
            "geo": {"scope": "region", "lat": 41.9, "lon": 12.5, "r": 900, "label": "Roman Republic", "src": "https://en.wikipedia.org/wiki/Roman_Republic"},
            "images": [{"src": "images/roman-republic.jpg", "w": 480, "h": 320, "title": "Cicero denounces Catiline", "credit": "Cesare Maccari, 1889", "license": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Maccari-Cicero.jpg"}],
            "why": "Its institutions shaped later republics.", "connections": [{"id": "un", "note": "Republican ideals echo in modern charters"}],
            "whyCites": [{"t": "Roman Republic — Smithsonian", "u": "https://www.si.edu/roman-republic", "k": "museum"}],
        },
        {
            "id": "un", "name": "United Nations", "region": "global", "start": 1945.8, "end": None, "startWhen": "October 24, 1945", "endWhen": "",
            "parents": [], "into": [], "text": "An intergovernmental organization founded after World War II.",
            "cites": [{"t": "History of the UN", "u": "https://www.un.org/en/about-us/history-of-the-un", "k": "primary"}],
            "geo": {"scope": "global"},
        },
    ],
    "events": [
        {
            "id": "an-caesar-assassinated", "branch": "roman-republic", "y": -44, "when": "15 March 44 BCE", "title": "Julius Caesar assassinated",
            "text": "Senators stabbed Caesar in the Theatre of Pompey.", "imp": 1,
            "cites": [W("Assassination_of_Julius_Caesar"), {"t": "Ides of March", "u": "https://www.britannica.com/story/beware-the-ides-of-march"}, W("Assassination_of_Julius_Caesar")],
            "geo": {"scope": "place", "lat": 41.8955, "lon": 12.4731, "r": 30, "label": "Theatre of Pompey, Rome", "src": "https://en.wikipedia.org/wiki/Theatre_of_Pompey"},
            "why": "It ended the Republic in all but name.", "connections": [{"id": "un-charter", "note": "A later attempt to bind power by law"}],
            "whyCites": [W("Assassination_of_Julius_Caesar")],
        },
        {
            "id": "an-punic-wars", "branch": "roman-republic", "y": -264, "end": -146, "when": "264–146 BCE", "title": "Punic Wars",
            "text": "Three wars with Carthage.", "imp": 2, "cites": [W("Punic_Wars")],
            "geo": {"scope": "region", "lat": 37, "lon": 10, "r": 1500, "label": "Western Mediterranean", "src": "https://en.wikipedia.org/wiki/Punic_Wars"},
        },
        {
            "id": "un-charter", "branch": "un", "y": 1945.48, "when": "June 26, 1945", "title": "UN Charter signed", "text": "Fifty nations signed in San Francisco.",
            "imp": 1, "link": "roman-republic", "cites": [{"t": "UN Charter", "u": "https://www.un.org/en/about-us/un-charter", "k": "primary"}],
            "geo": {"scope": "place", "lat": 37.7793, "lon": -122.4193, "r": 30, "label": "San Francisco", "src": "https://en.wikipedia.org/wiki/San_Francisco"},
            "images": [{"src": "images/un-charter.jpg", "w": 480, "h": 300, "title": "Signing", "credit": "UN Photo, 1945", "license": "PD-US", "page": "https://commons.wikimedia.org/wiki/File:UN_Charter.jpg"}],
        },
        {
            "id": "co-big-bang", "branch": "un", "y": -13.8e9, "when": "13.8 billion years ago", "title": "A deep-time date",
            "text": "Stands in for a deep-time number.", "imp": 3, "cites": [W("Big_Bang")], "geo": {"scope": "cosmic", "scale": "universe"},
        },
    ],
}


def small():
    return copy.deepcopy(SMALL)
