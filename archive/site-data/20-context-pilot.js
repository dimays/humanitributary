// "Why it matters" context and cross-links (pilot, November 2026).
// TL.enrich(id, { why, connections: [{ id, note }], cites }) adds a short, sourced explanation of what an entry
// means for its branch and for the bigger picture, plus links to related moments elsewhere on the timeline.
// Every sentence in `why` and every connection note must be supported by the entry's cites or by the enrich cites,
// which are listed together under the entry's Sources. Citation kinds (k) label the type of source in the panel.

TL.add({
  events: [
    { id: "an-rosetta-stone", branch: "egypt", y: -196, when: "March 27, 196 BCE (decree); found 1799",
      title: "Rosetta Stone decree", imp: 2, link: "hellenistic",
      text: "Priests at Memphis issued a decree honoring Ptolemy V, carved in Egyptian hieroglyphs, Demotic and Greek. A Frenchman, Pierre-François Bouchard, found it near Rosetta in 1799; it is now in the British Museum.",
      cites: [
        { t: "Rosetta Stone — Wikipedia", u: "https://en.wikipedia.org/wiki/Rosetta_Stone" },
        { t: "Rosetta Stone — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/Rosetta-Stone" },
      ] },
  ],
});

TL.enrich("an-rosetta-stone", {
  why: "Because the same decree appears in three scripts, the Greek text gave scholars a key to Egyptian hieroglyphs. Thomas Young and Jean-François Champollion did most of the decoding, and Champollion announced his decipherment in 1822, the start of modern scholars’ ability to read Egyptian inscriptions and literature. Other bilingual Ptolemaic decrees are now known, but this was the essential key.",
  connections: [
    { id: "hellenistic", note: "Carved in the Hellenistic period, under Egypt's Greek-speaking Ptolemies" },
    { id: "writing", note: "Made Egyptian hieroglyphic writing readable again" },
  ],
  cites: [
    { t: "Rosetta Stone — Wikipedia", u: "https://en.wikipedia.org/wiki/Rosetta_Stone" },
    { t: "Rosetta Stone — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/Rosetta-Stone" },
  ],
});

TL.enrich("me-magna-carta", {
  why: "Magna Carta began as a feudal settlement between King John and his barons, not a charter of democracy. Its promise that no free man be imprisoned except “by lawful judgement of his peers or by the law of the land” was revived by Sir Edward Coke in the 17th century and inspired American colonists. The US Constitution declared itself “the supreme Law of the Land,” as Magna Carta had been held superior to other law.",
  connections: [
    { id: "me-us-constitution", note: "Echoed as “the supreme Law of the Land”" },
    { id: "me-glorious-revolution", note: "Colonists also drew on the 1689 English Bill of Rights" },
  ],
  cites: [
    { t: "Magna Carta (1297 confirmation), English translation — US National Archives", u: "https://www.archives.gov/exhibits/featured-documents/magna-carta/translation.html", k: "primary" },
    { t: "Magna Carta and Its American Legacy — US National Archives", u: "https://www.archives.gov/exhibits/featured-documents/magna-carta/legacy.html", k: "archive" },
    { t: "Magna Carta — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/Magna-Carta" },
  ],
});

TL.enrich("lc-origin-of-species", {
  why: "In June 1858 Darwin received Alfred Russel Wallace's independent account of natural selection, and their papers were presented together at the Linnean Society that July; the book set out the case in detail. Gregor Mendel's work was rediscovered in 1900, and after an “eclipse of Darwinism,” the modern synthesis of the 1930s and 1940s joined Mendelian genetics with natural selection, making Darwin's idea central to evolutionary theory.",
  connections: [
    { id: "genomics", note: "Mendelian genetics, joined to natural selection in the modern synthesis" },
  ],
  cites: [
    { t: "On the Origin of Species, 1st edition (1859) — Darwin Online, University of Cambridge", u: "https://darwin-online.org.uk/content/frameset?itemID=F373&viewtype=text&pageseq=1", k: "primary" },
    { t: "On the Origin of Species — Wikipedia", u: "https://en.wikipedia.org/wiki/On_the_Origin_of_Species" },
    { t: "Modern synthesis (20th century) — Wikipedia", u: "https://en.wikipedia.org/wiki/Modern_synthesis_(20th_century)" },
  ],
});

TL.enrich("g7-apollo-11", {
  why: "Apollo grew out of the Cold War. Sputnik's 1957 launch shocked the United States and set off a space race; in 1961 President Kennedy set the goal of landing a crew on the Moon and returning it safely before the decade was out, and Apollo 11 met it. In 2026 Artemis II made NASA's first crewed lunar flyby in 50 years, which NASA calls a step toward a long-term return to the Moon and missions to Mars.",
  connections: [
    { id: "g7-sputnik", note: "The Soviet satellite that started the space race" },
    { id: "g7-artemis-ii", note: "The first crewed flight around the Moon in 50 years" },
    { id: "cold-war", note: "The rivalry that drove the race to the Moon" },
  ],
  cites: [
    { t: "Apollo 11 — NASA", u: "https://www.nasa.gov/mission/apollo-11/", k: "primary" },
    { t: "Sputnik, 1957 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1953-1960/sputnik", k: "archive" },
    { t: "Artemis II — NASA", u: "https://www.nasa.gov/mission/artemis-ii/", k: "primary" },
  ],
});

TL.enrich("g7-udhr", {
  why: "Drafted by representatives from every region after the Second World War, the Declaration set out, for the first time, fundamental human rights to be universally protected. It has been translated into more than 500 languages, and the UN credits it with inspiring more than seventy human rights treaties, among them the 1979 convention on discrimination against women.",
  connections: [
    { id: "ww2", note: "Written so that the war's atrocities would never happen again" },
    { id: "g7-cedaw", link: "un", note: "A treaty that followed 31 years later" },
  ],
  cites: [
    { t: "Universal Declaration of Human Rights (full text) — United Nations", u: "https://www.un.org/en/about-us/universal-declaration-of-human-rights", k: "primary" },
    { t: "History of the Declaration — United Nations", u: "https://www.un.org/en/about-us/udhr/history-of-the-declaration" },
    { t: "Conferences: Women and gender equality — United Nations", u: "https://www.un.org/en/conferences/women" },
  ],
});
