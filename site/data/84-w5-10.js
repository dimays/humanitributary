// Fill-in W5-10: 1000 BCE – 1000 CE — Lapita & Polynesian peoples (Aboriginal Australians: no notable events found for 700–900 CE). Cites fetched and read.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });

TL.add({ events: [
  { id: "w510-nukuleka", branch: "polynesians", y: -888, when: "c. 888 BCE (2838 ± 8 years BP)", title: "Nukuleka founded as Polynesia's first colony",
    text: "Uranium-thorium dates on coral tools put the Lapita founding of Nukuleka, Tonga, at about 2838 years before present. Burley's team calls it a founder colony through which first settlement of Polynesia was funneled.", imp: 2,
    cites: [{ t: "High Precision U/Th Dating of First Polynesian Settlement — PLOS ONE (via PubMed Central)", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3492438/", k: "paper" }, W("Nukuleka", "Nukuleka")] },
  { id: "w510-long-pause", branch: "polynesians", y: -900, end: 1025, when: "c. 900 BCE – c. 1025 CE (debated)", title: "The “long pause” in West Polynesia",
    text: "After reaching Fiji, Samoa and Tonga by about 900 BCE, Polynesians did not push east for well over a thousand years. A 2011 radiocarbon study dates the first East Polynesian landfall to c. 1025–1120 CE; the delay's cause is unsettled.", imp: 2,
    cites: [{ t: "High-precision radiocarbon dating shows recent and rapid initial human colonization of East Polynesia — PNAS (via PubMed Central)", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3033267/", k: "paper" }, W("Polynesians", "Polynesians")] },
  { id: "w510-plainware-ends", branch: "polynesians", y: -400, when: "by c. 2350 years ago (c. 400 BCE)", title: "Pottery making ends in Tonga",
    text: "Radiocarbon dates from 13 Tongan sites put the end of Polynesian Plainware, the simplified successor to Lapita pottery, by about 2350 years ago, 800 years earlier than once thought. Samoan production lasted longer.", imp: 3,
    cites: [{ t: "Early cessation of ceramic production for ancestral Polynesian society in Tonga — PLOS ONE (via PubMed Central)", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5825035/", k: "paper" }] },
  { id: "w510-marquesas-old-date", branch: "polynesians", y: -340, when: "from as early as 340 BCE (debated)", title: "Marquesas settlement dated as early as 340 BCE",
    text: "Britannica says the Marquesas may have been inhabited as early as 340 BCE, and other estimates run from 600 CE. A 2011 radiocarbon study instead favors rapid settlement of East Polynesia, with the remaining Marquesas c. 1190–1290 CE.", imp: 3,
    cites: [{ t: "Marquesas Islands — Encyclopaedia Britannica", u: "https://www.britannica.com/place/Marquesas-Islands" }, { t: "High-precision radiocarbon dating shows recent and rapid initial human colonization of East Polynesia — PNAS (via PubMed Central)", u: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3033267/", k: "paper" }, W("Marquesas_Islands", "Marquesas Islands")] },
  { id: "w510-tui-tonga", branch: "polynesians", y: 950, when: "c. 10th century CE", title: "The Tuʻi Tonga line of sacred kings begins",
    text: "Britannica says Tonga was ruled from at least the 10th century by the Tuʻi Tonga, sacred kings and queens. Tradition names ʻAhoʻeitu, son of a god, as the first; dates are approximate.", imp: 2,
    cites: [{ t: "History of Tonga — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/history-of-Tonga" }, W("Tu%CA%BBi_Tonga_Empire", "Tuʻi Tonga Empire")] },
] });

TL.geo("w510-nukuleka", { scope: "place", lat: -21.15, lon: -175.13, r: 40, label: "Nukuleka, Tongatapu, Tonga", src: "https://en.wikipedia.org/wiki/Nukuleka" });
TL.geo("w510-long-pause", { scope: "region", lat: -13.74, lon: -172.22, r: 700, label: "Samoa and Tonga", src: "https://en.wikipedia.org/wiki/Samoa" });
TL.geo("w510-plainware-ends", { scope: "region", lat: -13.74, lon: -172.22, r: 700, label: "Samoa and Tonga", src: "https://en.wikipedia.org/wiki/Samoa" });
TL.geo("w510-marquesas-old-date", { scope: "region", lat: -8.9, lon: -139.6, r: 400, label: "Marquesas Islands", src: "https://en.wikipedia.org/wiki/Marquesas_Islands" });
TL.geo("w510-tui-tonga", { scope: "region", lat: -20, lon: -175, r: 400, label: "Tonga", src: "https://en.wikipedia.org/wiki/Tonga" });
