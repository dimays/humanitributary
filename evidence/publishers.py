"""What we know about publishers before anyone rates them: the defaults a new Publisher row starts with.

Only applied when a publisher is first created (by the legacy import or a job); after that the row in the admin is
the truth. Tiers: 1 primary/official/peer-reviewed, 2 scholarly or institutional reference, 3 general reference,
4 weak. Access notes come from the static site's experience (site/README.md).
"""

from urllib.parse import urlsplit

KNOWN = {
    "wikipedia.org": dict(name="Wikipedia", tier=3, license="CC BY-SA 4.0", access_notes="Automated reading allowed (use the API)."),
    "britannica.com": dict(name="Encyclopaedia Britannica", tier=2, license="all rights reserved", fetch_policy="browser_only",
                           access_notes="Blocks automated fetching: read in a browser."),
    "openstax.org": dict(name="OpenStax", tier=None, fetch_policy="forbidden",
                         access_notes="Never read or cite: its terms forbid use of its textbooks by AI systems."),
    "worldhistory.org": dict(name="World History Encyclopedia", tier=3, fetch_policy="browser_only", access_notes="Blocks automated fetching."),
    "unesco.org": dict(name="UNESCO", tier=2, fetch_policy="browser_only", access_notes="Often blocks automated fetching."),
    "whc.unesco.org": dict(name="UNESCO World Heritage Centre", tier=2, fetch_policy="browser_only", access_notes="Often blocks automated fetching."),
    "un.org": dict(name="United Nations", tier=1, fetch_policy="browser_only", access_notes="Refuses automated readers: checked by hand in a browser."),
    "nobelprize.org": dict(name="The Nobel Prize", tier=1, fetch_policy="browser_only", access_notes="Refuses automated readers: checked by hand in a browser."),
    "history.state.gov": dict(name="Office of the Historian (US State Department)", tier=1),
    "nasa.gov": dict(name="NASA", tier=1),
    "science.nasa.gov": dict(name="NASA Science", tier=1),
    "esa.int": dict(name="European Space Agency", tier=1),
    "si.edu": dict(name="Smithsonian Institution", tier=2),
    "nhm.ac.uk": dict(name="Natural History Museum, London", tier=2),
    "metmuseum.org": dict(name="The Metropolitan Museum of Art", tier=2),
    "plato.stanford.edu": dict(name="Stanford Encyclopedia of Philosophy", tier=2),
    "iep.utm.edu": dict(name="Internet Encyclopedia of Philosophy", tier=2),
    "loc.gov": dict(name="Library of Congress", tier=1),
    "archives.gov": dict(name="US National Archives", tier=1),
    "europa.eu": dict(name="European Union", tier=1),
    "who.int": dict(name="World Health Organization", tier=1),
    "nature.com": dict(name="Nature", tier=1),
    "commons.wikimedia.org": dict(name="Wikimedia Commons", tier=3, license="per file"),
}


def domain_of(url: str) -> str:
    host = (urlsplit(url).hostname or "").lower()
    host = host[4:] if host.startswith("www.") else host
    # Every language edition of Wikipedia is one publisher.
    if host.endswith(".wikipedia.org"):
        return "wikipedia.org"
    return host


def defaults_for(domain: str) -> dict:
    if domain in KNOWN:
        return {"tier": None, **KNOWN[domain]}
    # A subdomain of a known publisher (science.nasa.gov → nasa.gov) starts with its parent's rating.
    parts = domain.split(".")
    for i in range(1, len(parts) - 1):
        parent = ".".join(parts[i:])
        if parent in KNOWN and parent != "wikipedia.org":
            d = dict(KNOWN[parent])
            d["name"] = f"{d['name']} ({domain})"
            return {"tier": None, **d}
    return {"name": domain, "tier": None}
