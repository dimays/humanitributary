// Fill-in W6-03: Americas and Oceania 3500–1000 BCE (first Americans, Maya, Olmec, Austronesian expansion, first Australians, Lapita). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });

TL.add({ events: [
  // ---------- first-americans ----------

  // ---------- maya ----------
  { id: "w603-first-maya-farmers", branch: "maya", y: -2000, when: "before c. 2000 BCE", title: "Early Maya farmers enter the Belize lowlands",
    text: "Archaeologists think the first Maya reached Belize and the adjacent lowlands as farmers before 2000 BCE, though they leave little trace in the archaeological record for nearly a thousand years.", imp: 3,
    cites: [{ t: "Preclassic Period — UC Santa Barbara Maya Research Center", u: "https://marc.ucsb.edu/node/211", k: "reference" }] },
  { id: "w603-cuello", branch: "maya", y: -1200, when: "c. 1200 BCE (earlier radiocarbon dates of 2600 BCE were revised)", title: "Cuello: an early lowland Maya village",
    text: "At Cuello in Belize, early radiocarbon dates as old as 2600 BCE were corrected, and the Swasey-phase village is now dated from about 1200 BCE; later dating work places it in about 1100–400 BCE.", imp: 2,
    cites: [{ t: "Redefinition of the Swasey Phase at Cuello, Belize — American Antiquity", u: "https://www.cambridge.org/core/journals/american-antiquity/article/redefinition-of-the-swasey-phase-at-cuello-belize/1A5F8B1B8FB915AA4317DE309C1C94AF", k: "paper" }, W("Cuello", "Cuello")] },

  // ---------- olmec ----------
  { id: "w603-el-manati", branch: "olmec", y: -1400, end: -1200, when: "bog used c. 1600–1200 BCE", title: "El Manatí bog: offerings and the earliest rubber balls",
    text: "Olmec people made offerings in the El Manatí spring bog, including ceremonial axes, carved wooden busts and rubber balls, the oldest known, possibly linked to the Mesoamerican ballgame.", imp: 2,
    cites: [{ t: "Ancient Olmec rubber balls to be preserved with anoxia technology — Archaeology Magazine", u: "https://archaeologymag.com/2025/09/ancient-olmec-rubber-balls-to-be-preserved/", k: "news" }, W("El_Manat%C3%AD", "El Manatí")] },

  // ---------- austronesian-expansion ----------
  { id: "w603-dapenkeng", branch: "austronesian-expansion", y: -3000, end: -2500, when: "c. 3500–2500 BCE (sources vary)", title: "Dapenkeng culture settles Taiwan's coasts",
    text: "The Dapenkeng culture of cord-marked pottery spread along Taiwan's coasts and to the Penghu islands. Most scholars see its people as ancestors of Taiwan's Indigenous peoples and of early Austronesian speakers.", imp: 2,
    cites: [W("Dapenkeng_culture", "Dapenkeng culture")] },
  { id: "w603-marianas", branch: "austronesian-expansion", y: -1500, when: "c. 1500 BCE", title: "Austronesians cross 2,300 km to the Marianas",
    text: "Seafarers from the Philippines settled the Marianas around 1500 BCE, apparently carrying cultivated plants. This was the first human settlement of Remote Oceania, linked to the Philippines by pottery and by the Chamorro language.", imp: 2,
    cites: [{ t: "The first settlement of Remote Oceania: the Philippines to the Marianas — Antiquity (ANU repository)", u: "https://openresearch-repository.anu.edu.au/items/a1dee7a3-43b5-4a45-a7b8-7b23aa8a79f8", k: "paper" }, { t: "Pacific Islands: Early period — Encyclopaedia Britannica", u: "https://www.britannica.com/place/Pacific-Islands/Early-period" }, W("Prehistory_of_the_Mariana_Islands", "Prehistory of the Mariana Islands")] },

  // ---------- first-australians ----------
  { id: "w603-pama-nyungan", branch: "first-australians", y: -3000, when: "perhaps c. 5,000 years ago (debated)", title: "Pama–Nyungan languages begin to spread",
    text: "A phylogenetic study suggests Proto-Pama–Nyungan was spoken perhaps 5,000 years ago in the Gulf Plains, and then spread over most of the mainland; the model and the date are disputed.", imp: 2,
    cites: [{ t: "The origin and expansion of Pama-Nyungan languages across Australia — Nature Ecology & Evolution (PubMed)", u: "https://pubmed.ncbi.nlm.nih.gov/29531347/", k: "paper" }, W("Pama%E2%80%93Nyungan_languages", "Pama–Nyungan languages")] },
  { id: "w603-backed-artefacts", branch: "first-australians", y: -2500, when: "mid-Holocene, c. 4,000–5,000 years ago", title: "Backed stone artifacts proliferate in southeastern Australia",
    text: "Small backed artifacts appeared by the end of the Ice Age but became the dominant retouched tool in the southeast in the mid-Holocene, after a more El Niño-dominated climate set in.", imp: 3,
    cites: [{ t: "Pattern and context in the Holocene proliferation of backed artifacts in Australia — Hiscock (ANU)", u: "https://openresearch-repository.anu.edu.au/entities/publication/5125e4cf-ff35-4e09-b47b-c158f547fb41/full", k: "paper" }] },
  { id: "w603-dingo", branch: "first-australians", y: -1500, when: "c. 3,500 years ago (debated)", title: "The dingo arrives in Australia",
    text: "Direct dating of dingo bones from Madura Cave, 3,081–3,348 years old, suggests dingoes arrived about 3,500 years ago, later than the 4,000–8,000 years many assumed; DNA-based estimates run as old as 18,000.", imp: 2,
    cites: [{ t: "Research reveals when dingoes first arrived in Australia — Australian National University", u: "https://reporter.anu.edu.au/all-stories/research-reveals-when-dingoes-first-arrived-in-australia", k: "reference" }, { t: "Study Claims Dingoes Reached Australia 3,500 Years Ago — Sci.News", u: "https://www.sci.news/archaeology/dingo-arrival-australia-06243.html", k: "news" }, W("Dingo", "Dingo")] },

  // ---------- polynesians ----------
  { id: "w603-lapita-bismarcks", branch: "polynesians", y: -1500, end: -1200, when: "c. 3,500 years ago (classic style c. 1600–1200 BCE)", title: "Lapita pottery emerges in the Bismarck Archipelago",
    text: "The Lapita complex, with dentate-stamped pottery resembling that of northern Luzon, appeared in the Bismarcks, apparently brought by migrating Austronesian speakers rather than evolving locally.", imp: 2, link: "austronesian-expansion",
    cites: [{ t: "Pacific Islands: Early period — Encyclopaedia Britannica", u: "https://www.britannica.com/place/Pacific-Islands/Early-period" }, W("Lapita_culture", "Lapita culture")] },
  { id: "w603-lapita-remote", branch: "polynesians", y: -1200, when: "after c. 1200 BCE", title: "Lapita voyagers push beyond the Bismarcks",
    text: "Lapita-style artifacts appear in the Solomon Islands, Vanuatu and New Caledonia after about 1200 BCE, a stage in the settlement of Remote Oceania that led to Fiji and Tonga.", imp: 3,
    cites: [{ t: "Lapita culture — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/Lapita-culture" }, W("Lapita_culture", "Lapita culture")] },
] });

TL.geo("w603-first-maya-farmers", { scope: "region", lat: 17.07, lon: -88.7, r: 200, label: "Belize", src: "https://en.wikipedia.org/wiki/Belize" });
TL.geo("w603-cuello", { scope: "place", lat: 18.067, lon: -88.6, r: 40, label: "Cuello, Belize", src: "https://en.wikipedia.org/wiki/Cuello" });
TL.geo("w603-el-manati", { scope: "place", lat: 17.622, lon: -94.642, r: 40, label: "El Manatí, Veracruz", src: "https://en.wikipedia.org/wiki/El_Manat%C3%AD" });
TL.geo("w603-dapenkeng", { scope: "region", lat: 24, lon: 121, r: 200, label: "Taiwan", src: "https://en.wikipedia.org/wiki/Taiwan" });
TL.geo("w603-marianas", { scope: "region", lat: 16.7, lon: 145.78, r: 400, label: "Mariana Islands", src: "https://en.wikipedia.org/wiki/Mariana_Islands" });
TL.geo("w603-pama-nyungan", { scope: "region", lat: -14, lon: 139, r: 600, label: "Gulf of Carpentaria", src: "https://en.wikipedia.org/wiki/Gulf_of_Carpentaria" });
TL.geo("w603-backed-artefacts", { scope: "region", lat: -33.0, lon: 148, r: 800, label: "Southeastern Australia", src: "https://en.wikipedia.org/wiki/South_Eastern_Australia" });
TL.geo("w603-dingo", { scope: "region", lat: -30.3, lon: 129, r: 600, label: "Nullarbor Plain", src: "https://en.wikipedia.org/wiki/Nullarbor_Plain" });
TL.geo("w603-lapita-bismarcks", { scope: "region", lat: -5, lon: 150.1, r: 500, label: "Bismarck Archipelago", src: "https://en.wikipedia.org/wiki/Bismarck_Archipelago" });
TL.geo("w603-lapita-remote", { scope: "region", lat: -17, lon: 168, r: 800, label: "Vanuatu", src: "https://en.wikipedia.org/wiki/Vanuatu" });
