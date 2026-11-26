"""Which publishers are independent witnesses (docs/fact-checking.md, "Independence").

A Publisher row is a domain; an independent witness is an organization. science.nasa.gov and nasa.gov, un.org and
news.un.org, or european-union.europa.eu and ec.europa.eu are one witness each, so the witness key is the
registrable domain (the part an organization registers: `nasa.gov`, `bbc.co.uk`). Every Wikipedia edition is already
one publisher (`wikipedia.org`), so Wikipedia counts once however many articles are cited. Hosting platforms where
each subdomain is someone else (github.io, blogspot.com …) keep the full host.
"""

# Two-label public suffixes we see in citations (a full public-suffix list is overkill for a few hundred domains).
TWO_LABEL_SUFFIXES = {
    "co.uk", "ac.uk", "gov.uk", "org.uk", "nhs.uk", "com.au", "gov.au", "edu.au", "org.au", "net.au", "co.nz",
    "govt.nz", "ac.nz", "org.nz", "co.jp", "ac.jp", "go.jp", "or.jp", "com.br", "gov.br", "org.br", "co.za",
    "org.za", "ac.za", "gov.za", "com.cn", "gov.cn", "edu.cn", "gov.in", "ac.in", "nic.in", "co.in", "gov.sg",
    "edu.sg", "com.sg", "gouv.fr", "gob.mx", "com.mx", "gob.ar", "com.ar", "gov.il", "ac.il", "co.il", "go.kr",
    "ac.kr", "co.kr", "gov.tr", "edu.tr", "gov.ph", "edu.ph", "gov.pk", "edu.pk", "gov.ng", "gov.eg", "gov.ie",
    "gc.ca", "qc.ca", "gov.hk", "edu.hk", "gov.tw", "edu.tw", "ac.id", "go.id", "gov.my", "edu.my",
}
PLATFORMS = {"github.io", "blogspot.com", "wordpress.com", "substack.com", "medium.com", "tumblr.com", "wixsite.com", "weebly.com"}


def witness(domain: str) -> str:
    """The independence key of a publisher's domain."""
    domain = (domain or "").lower().strip(".")
    if domain == "wikipedia.org" or domain.endswith(".wikipedia.org"):
        return "wikipedia.org"
    labels = domain.split(".")
    if len(labels) <= 2:
        return domain
    last2 = ".".join(labels[-2:])
    if last2 in PLATFORMS:
        return ".".join(labels[-3:])
    if last2 in TWO_LABEL_SUFFIXES:
        return ".".join(labels[-3:])
    return last2


def is_wikipedia(domain: str) -> bool:
    return witness(domain) == "wikipedia.org"
