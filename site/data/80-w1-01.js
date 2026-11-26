// Fill-in W1-01: global science, economy and decolonization branches, 1925–present. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const AIP = { t: "The Discovery of Global Warming: Timeline (Milestones) — American Institute of Physics", u: "https://history.aip.org/climate/timeline.htm", k: "reference" };

TL.add({ events: [
  // ---------- Artificial intelligence ----------
  { id: "w101-bkg-beats-world-champion", branch: "ai", y: 1979.55, when: "July 1979", title: "BKG 9.8 beats the backgammon world champion",
    text: "Hans Berliner's program BKG 9.8 won a Monte Carlo match 7–1 against world champion Luigi Villa, the first time a computer program defeated a world champion in any game; Berliner credited luck with the dice.", imp: 2,
    cites: [W("BKG_9.8", "BKG 9.8"), { t: "Computer Backgammon — Hans J. Berliner, bkgm.com", u: "https://bkgm.com/articles/Berliner/ComputerBackgammon/", k: "paper" }] },
  { id: "w101-td-gammon", branch: "ai", y: 1992.5, end: 1993.9, when: "1992–1993", title: "TD-Gammon teaches itself backgammon",
    text: "Gerald Tesauro's neural network, trained by self-play with temporal-difference learning, reached strong-master level and became an early landmark for reinforcement learning.", imp: 2,
    cites: [W("TD-Gammon", "TD-Gammon"), { t: "Temporal Difference Learning and TD-Gammon — Gerald Tesauro, bkgm.com", u: "https://www.bkgm.com/articles/tesauro/tdl.html", k: "paper" }] },
  { id: "w101-roomba", branch: "ai", y: 2002.71, when: "September 17, 2002", title: "Roomba brings robots into the living room",
    text: "iRobot introduced the Roomba, an autonomous robotic vacuum cleaner and one of the first mass-market robots to work unattended in ordinary homes.", imp: 3,
    cites: [W("Roomba", "Roomba"), { t: "Roomba — Encyclopaedia Britannica", u: "https://www.britannica.com/technology/Roomba" }] },

  // ---------- Antibiotic era ----------
  { id: "w101-tyrothricin", branch: "antibiotics", y: 1939.5, when: "1939", title: "Dubos isolates tyrothricin, a soil-derived antibiotic",
    text: "René Dubos isolated tyrothricin, a mixture mainly of tyrocidine and gramicidin, from a soil bacterium. It was the first antibiotic to be manufactured commercially but proved too toxic for general use.", imp: 3,
    cites: [{ t: "Tyrothricin — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/tyrothricin" }, W("Gramicidin", "Gramicidin")] },
  { id: "w101-6apa-semisynthetic", branch: "antibiotics", y: 1957.5, when: "1957", title: "Beecham scientists unlock semisynthetic penicillins",
    text: "Research at Beecham's Brockham Park laboratory in Surrey led to 6-aminopenicillanic acid, the nucleus of the penicillin molecule; chemically modifying it made new semisynthetic penicillins possible.", imp: 2,
    cites: [{ t: "Brockham Park and semi-synthetic penicillins — Dorking Museum", u: "https://dorkingmuseum.org.uk/brockham-park-and-semi-synthetic-penicillins/", k: "museum" }, W("6-Aminopenicillanic_acid", "6-Aminopenicillanic acid")] },
  { id: "w101-visa-japan", branch: "antibiotics", y: 1996.4, when: "May 1996", title: "First vancomycin-intermediate Staph aureus found in Japan",
    text: "Doctors in Japan treated an infant whose MRSA wound infection involved Staphylococcus aureus with reduced susceptibility to vancomycin, a drug long relied on against MRSA; CDC called it the first documented case.", imp: 2,
    cites: [{ t: "Reduced Susceptibility of Staphylococcus aureus to Vancomycin — Japan, 1996 — MMWR, CDC", u: "https://www.cdc.gov/mmwr/preview/mmwrhtml/00048375.htm", k: "paper" }, W("Vancomycin-resistant_Staphylococcus_aureus", "Vancomycin-resistant Staphylococcus aureus")] },
  { id: "w101-ndm1", branch: "antibiotics", y: 2008.5, when: "2008 (reported in 2009)", title: "NDM-1 resistance gene found and spreads worldwide",
    text: "NDM-1, an enzyme that makes bacteria resistant to carbapenems, was first detected in 2008 in Klebsiella from a Swedish patient who had been treated in India; it later turned up on several continents.", imp: 2,
    cites: [W("New_Delhi_metallo-beta-lactamase_1", "New Delhi metallo-beta-lactamase 1")] },

  // ---------- Bretton Woods ----------
  { id: "w101-epu", branch: "bretton-woods", y: 1950.5, end: 1958.99, when: "July 1, 1950 – December 1958", title: "European Payments Union begins",
    text: "The European Payments Union was established on July 1, 1950 within the OEEC. It cleared trade payments among Western European states, more than doubled trade, and prepared the way for currency convertibility by 1958.", imp: 2,
    cites: [W("European_Payments_Union", "European Payments Union"), { t: "European Payments Union — Historical Archives of the European Union", u: "https://archives.eui.eu/en/isaar/31", k: "archive" }] },
  { id: "w101-sdr-created", branch: "bretton-woods", y: 1969.5, when: "1969", title: "IMF creates Special Drawing Rights",
    text: "The IMF created Special Drawing Rights, a reserve asset first valued at 0.888671 grams of gold (about one US dollar), to supplement gold and dollars within the fixed-rate system.", imp: 2,
    cites: [W("Special_drawing_rights", "Special drawing rights"), { t: "Special Drawing Rights (SDR) — IMF", u: "https://www.imf.org/en/About/Factsheets/Sheets/2023/special-drawing-rights-sdr", k: "reference" }] },

  // ---------- Climate ----------
  { id: "w101-keeling-1960", branch: "climate", y: 1960.5, when: "1960", title: "Keeling's Mauna Loa CO₂ record appears in Tellus",
    text: "Charles Keeling's 1960 Tellus paper began the Keeling Curve: Mauna Loa measurements showed CO₂ falling each summer and rising each winter, on top of a rising average from year to year.", imp: 2,
    cites: [{ t: "The Early Keeling Curve — Scripps CO2 Program", u: "https://scrippsco2.ucsd.edu/history-and-legacy/the-early-keeling-curve/", k: "reference" }, AIP, W("Keeling_Curve", "Keeling Curve")] },
  { id: "w101-broecker-1975", branch: "climate", y: 1975.6, when: "1975", title: "Broecker’s paper puts “global warming” in its title",
    text: "Wallace Broecker's 1975 Science paper “Climatic Change: Are We on the Brink of a Pronounced Global Warming?” is credited by NASA with the first use of the term “global warming.”", imp: 3,
    cites: [{ t: "What’s in a Name? — NASA Jet Propulsion Laboratory", u: "https://www.jpl.nasa.gov/news/whats-in-a-name/", k: "reference" }, W("Wallace_Smith_Broecker", "Wallace Smith Broecker")] },
  { id: "w101-wcc-1979", branch: "climate", y: 1979.12, end: 1979.15, when: "February 12–23, 1979", title: "First World Climate Conference in Geneva",
    text: "Sponsored by the World Meteorological Organization, the conference gathered scientists from many fields in Geneva and was one of the first major international meetings on climate change.", imp: 2,
    cites: [W("World_Climate_Conference", "World Climate Conference"), { t: "The First World Climate Conference in Geneva — SNS Chronik", u: "https://sns.uba.de/chronik/en/concepts/t-1161bc99_1521f2d78fa_38c5.html", k: "reference" }] },
  { id: "w101-giss-1981", branch: "climate", y: 1981.5, when: "1981", title: "Hansen’s NASA team ties warming to rising CO₂",
    text: "A NASA Goddard Institute for Space Studies team led by James Hansen reported in Science that global temperature rose 0.2°C from the mid-1960s to 1980, consistent with the calculated effect of rising atmospheric CO₂.", imp: 3,
    cites: [{ t: "Hansen et al. 1981: Climate impact of increasing atmospheric carbon dioxide — NASA GISS", u: "https://www.giss.nasa.gov/pubs/abs/ha04600x.html", k: "paper" }] },
  { id: "w101-ipcc-tar", branch: "climate", y: 2001.5, when: "2001", title: "IPCC Third Assessment Report",
    text: "The IPCC's third assessment concluded that Earth's surface was warming, that the 1990s were very likely the warmest decade on record, and that most warming since the mid-20th century was likely due to human activity.", imp: 2,
    cites: [W("IPCC_Third_Assessment_Report", "IPCC Third Assessment Report")] },
  { id: "w101-ipcc-ar5", branch: "climate", y: 2013.7, when: "September 27, 2013", title: "IPCC Fifth Assessment: warming is “unequivocal”",
    text: "The Working Group I report called warming of the climate system unequivocal and judged it extremely likely, with at least 95% certainty, that human activities caused most of the observed rise in surface temperature over the previous 60 years.", imp: 2,
    cites: [{ t: "IPCC science report: climate change unequivocal, human influence at least 95% certain — Climate Action", u: "https://climate.ec.europa.eu/news-your-voice/news/ipcc-science-report-climate-change-unequivocal-human-influence-least-95-certain-2013-09-27_en", k: "reference" }, W("IPCC_Fifth_Assessment_Report", "IPCC Fifth Assessment Report")] },
  // ---------- Digital computing ----------
  { id: "w101-system-360", branch: "computing", y: 1964.27, when: "April 7, 1964", title: "IBM announces System/360",
    text: "IBM's System/360 introduced a family of computers sharing one architecture, so software written for one machine could run on any other in the line. IBM bet about $5 billion on it.", imp: 2,
    cites: [{ t: "The IBM System/360 — IBM Heritage", u: "https://www.ibm.com/history/system-360", k: "museum" }, W("IBM_System/360", "IBM System/360")] },
  { id: "w101-altair-8800", branch: "computing", y: 1975.0, when: "January 1975", title: "Altair 8800 on the cover of Popular Electronics",
    text: "The Altair 8800, an Intel 8080 kit computer from MITS selling for $439, was featured on the January 1975 cover of Popular Electronics. It is often called the first commercially successful personal computer.", imp: 2,
    cites: [W("Altair_8800", "Altair 8800"), { t: "Altair 8800 — CHM Revolution, Computer History Museum", u: "https://www.computerhistory.org/revolution/personal-computers/17/312/1140", k: "museum" }] },
  { id: "w101-apple-ii", branch: "computing", y: 1977.4, when: "1977", title: "Apple II is released",
    text: "Steve Wozniak's Apple II, released in 1977, was the first of a line of Apple microcomputers sold until 1993 and helped bring personal computers into homes and schools.", imp: 2,
    cites: [W("Apple_II", "Apple II"), { t: "Apple II — Encyclopaedia Britannica", u: "https://www.britannica.com/technology/Apple-II" }] },
  { id: "w101-windows-95", branch: "computing", y: 1995.64, when: "August 24, 1995", title: "Windows 95 launches with the Start menu",
    text: "Microsoft's Windows 95 brought a new graphical interface with the taskbar, Start menu and Windows Explorer, and launched alongside the online service MSN, putting the desktop computer in millions of homes.", imp: 2,
    cites: [W("Windows_95", "Windows 95"), { t: "Windows 95 — Encyclopaedia Britannica", u: "https://www.britannica.com/technology/Windows-95" }] },
  { id: "w101-ipad", branch: "computing", y: 2010.07, when: "January 27, 2010", title: "Apple unveils the iPad",
    text: "Steve Jobs announced Apple's tablet computer, the iPad, at a press event; it opened a new category of device between the phone and the laptop.", imp: 3,
    cites: [W("IPad_(1st_generation)", "iPad (1st generation)"), { t: "iPad — Encyclopaedia Britannica", u: "https://www.britannica.com/technology/iPad" }] },

  // ---------- Decolonization ----------
  { id: "w101-indonesia-proclaimed", branch: "decolonization", y: 1945.62, when: "August 17, 1945", title: "Sukarno and Hatta proclaim Indonesia's independence",
    text: "Sukarno and Mohammad Hatta proclaimed Indonesia's independence, beginning the Indonesian National Revolution against the returning Dutch, a major episode in the decolonization of Asia.", imp: 2,
    cites: [W("Indonesian_National_Revolution", "Indonesian National Revolution"), { t: "Sukarno — Encyclopaedia Britannica", u: "https://www.britannica.com/biography/Sukarno" }] },
  { id: "w101-india-pakistan-independence", branch: "decolonization", y: 1947.62, when: "August 15, 1947", title: "India and Pakistan become independent",
    text: "Under the Indian Independence Act, which received Royal Assent on July 18, 1947, British rule ended and the two new dominions of India and Pakistan came into being on August 15.", imp: 1, link: "india",
    cites: [W("Indian_Independence_Act_1947", "Indian Independence Act 1947"), { t: "Indian Independence Act — Encyclopaedia Britannica", u: "https://www.britannica.com/event/Indian-Independence-Act" }] },
  { id: "w101-libya-independent", branch: "decolonization", y: 1951.98, when: "December 24, 1951", title: "Libya becomes an independent kingdom",
    text: "Following a United Nations resolution providing for its independence, the United Kingdom of Libya became independent from Britain and France after Allied occupation that began in 1943.", imp: 2,
    cites: [W("Kingdom_of_Libya", "Kingdom of Libya"), { t: "Libya: History — Encyclopaedia Britannica", u: "https://www.britannica.com/place/Libya/History" }] },
  { id: "w101-botswana-independent", branch: "decolonization", y: 1966.75, when: "September 30, 1966", title: "Bechuanaland becomes independent Botswana",
    text: "The British protectorate of Bechuanaland became the independent Commonwealth republic of Botswana, one of the new African states created as the colonial empires were dissolved.", imp: 3,
    cites: [W("Botswana", "Botswana"), { t: "Botswana — Encyclopaedia Britannica", u: "https://www.britannica.com/place/Botswana" }] },
  { id: "w101-guinea-bissau-declares", branch: "decolonization", y: 1973.73, when: "September 24, 1973", title: "Guinea-Bissau declares independence from Portugal",
    text: "After a war of independence begun in 1963, the nationalists unilaterally declared independence; Portugal recognized it on September 10, 1974, after its own revolution.", imp: 2,
    cites: [W("Guinea-Bissau", "Guinea-Bissau"), { t: "Guinea-Bissau: History — Encyclopaedia Britannica", u: "https://www.britannica.com/place/Guinea-Bissau/History" }] },

  // ---------- GATT ----------
  { id: "w101-geneva-round-1956", branch: "gatt", y: 1955.0, end: 1956.4, when: "1955 – May 1956", title: "Geneva Round of GATT tariff talks",
    text: "The fourth GATT round returned to Geneva, with 26 countries taking part, and eliminated or reduced some $2.5 billion in tariffs.", imp: 3,
    cites: [W("General_Agreement_on_Tariffs_and_Trade", "General Agreement on Tariffs and Trade"), { t: "General Agreement on Tariffs and Trade — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/General-Agreement-on-Tariffs-and-Trade" }, { t: "The GATT years: from Havana to Marrakesh — WTO", u: "https://www.wto.org/english/thewto_e/whatis_e/tif_e/fact4_e.htm", k: "reference" }] },
  { id: "w101-enabling-clause", branch: "gatt", y: 1979.9, when: "1979", title: "Enabling Clause permits preferences for developing countries",
    text: "Adopted as part of the Tokyo Round, the Enabling Clause let trading preferences be targeted at developing and least developed countries without violating GATT's most-favored-nation rule.", imp: 2,
    cites: [{ t: "Enabling Clause — WTO legal texts", u: "https://www.wto.org/english/docs_e/legal_e/enabling1979_e.htm", k: "primary" }, W("Enabling_clause", "Enabling clause")] },

  // ---------- Molecular biology & genomics ----------
  { id: "w101-nobel-genetic-code", branch: "genomics", y: 1968.8, when: "1968", title: "Nobel Prize for interpreting the genetic code",
    text: "Robert Holley, Har Gobind Khorana and Marshall Nirenberg shared the Nobel Prize in Physiology or Medicine for interpreting the genetic code and its function in protein synthesis.", imp: 2,
    cites: [{ t: "The Nobel Prize in Physiology or Medicine 1968 — NobelPrize.org", u: "https://www.nobelprize.org/prizes/medicine/1968/summary/", k: "primary" }, W("Genetic_code", "Genetic code")] },
  { id: "w101-automated-dna-sequencer", branch: "genomics", y: 1986.5, when: "1986", title: "Hood's team builds the first automated DNA sequencer",
    text: "Leroy Hood and colleagues at Caltech developed the first automated DNA sequencer, which replaced hand-read gels and made large-scale sequencing practical.", imp: 2,
    cites: [W("Leroy_Hood", "Leroy Hood"), { t: "Fluorescence detection in automated DNA sequence analysis — Nature", u: "https://www.nature.com/articles/321674a0", k: "paper" }] },
  { id: "w101-genome-draft-2000", branch: "genomics", y: 2000.49, when: "June 26, 2000", title: "Clinton and Blair announce the human genome draft",
    text: "President Bill Clinton and Prime Minister Tony Blair jointly announced a “rough draft” of the human genome, a milestone reached after the public project and a private rival sped up their work.", imp: 2,
    cites: [W("Human_Genome_Project", "Human Genome Project"), { t: "Completion of the Human Genome Project: Frequently Asked Questions — NHGRI", u: "https://www.genome.gov/human-genome-project/Completion-FAQ", k: "reference" }] },
  { id: "w101-ips-cells", branch: "genomics", y: 2006.6, when: "2006", title: "Yamanaka reprograms adult cells into stem cells",
    text: "Shinya Yamanaka and Kazutoshi Takahashi in Kyoto showed that four genes could turn ordinary cells into pluripotent stem cells, work that earned Yamanaka the 2012 Nobel Prize.", imp: 2,
    cites: [{ t: "The Nobel Prize in Physiology or Medicine 2012: Press release — NobelPrize.org", u: "https://www.nobelprize.org/prizes/medicine/2012/press-release/", k: "primary" }, W("Induced_pluripotent_stem_cell", "Induced pluripotent stem cell")] },
  { id: "w101-crispr-babies", branch: "genomics", y: 2018.9, when: "November 2018", title: "He Jiankui announces gene-edited babies",
    text: "He Jiankui announced in Hong Kong that twin girls had been born with edited genes. The claim drew wide condemnation from scientists, and he was dismissed from his university in January 2019.", imp: 2,
    cites: [W("He_Jiankui", "He Jiankui"), { t: "Chinese University Fires Scientist Behind Gene-Edited Babies — TIME", u: "https://time.com/5509239/china-university-fires-he-jiankui-gene-editing/", k: "news" }] },

  // ---------- Great Depression ----------
  { id: "w101-general-theory", branch: "great-depression", y: 1936.12, when: "February 1936", title: "Keynes publishes The General Theory",
    text: "John Maynard Keynes's General Theory of Employment, Interest and Money gave macroeconomics a central place in economic theory and sparked what was called the Keynesian Revolution.", imp: 2,
    cites: [W("The_General_Theory_of_Employment,_Interest_and_Money", "The General Theory of Employment, Interest and Money"), { t: "John Maynard Keynes — Britannica Money", u: "https://www.britannica.com/money/John-Maynard-Keynes" }] },

  // ---------- Green Revolution ----------
  { id: "w101-mexico-wheat-self-sufficient", branch: "green-revolution", y: 1963.5, when: "1963", title: "Mexico becomes self-sufficient in wheat",
    text: "By 1963, 95% of Mexico's wheat used Borlaug's semi-dwarf varieties and the harvest was six times that of 1944, making Mexico a net exporter and a showcase for the Green Revolution.", imp: 2,
    cites: [W("Norman_Borlaug", "Norman Borlaug"), { t: "Norman Borlaug – Nobel Lecture — NobelPrize.org", u: "https://www.nobelprize.org/prizes/peace/1970/borlaug/lecture/", k: "primary" }] },
  { id: "w101-ir36", branch: "green-revolution", y: 1981.5, when: "by 1981", title: "IR36 rice spreads across Asia",
    text: "Gurdev Khush's semi-dwarf rice IR36, bred from IR8 and 13 other parents, resisted major pests and matured in 105 days. By 1981 about 110,000 square kilometers were planted with it.", imp: 3,
    cites: [W("Semi-dwarf_IR36", "Semi-dwarf IR36")] },
] });

TL.geo("w101-bkg-beats-world-champion", { scope: "place", lat: 43.74, lon: 7.42, r: 30, label: "Monte Carlo, Monaco", src: "https://en.wikipedia.org/wiki/Monte_Carlo" });
TL.geo("w101-td-gammon", { scope: "place", lat: 41.21, lon: -73.80, r: 40, label: "IBM Thomas J. Watson Research Center, New York", src: "https://en.wikipedia.org/wiki/Thomas_J._Watson_Research_Center" });
TL.geo("w101-roomba", { scope: "global" });
TL.geo("w101-tyrothricin", { scope: "global" });
TL.geo("w101-6apa-semisynthetic", { scope: "region", lat: 51.25, lon: -0.45, r: 40, label: "Surrey, England", src: "https://en.wikipedia.org/wiki/Surrey" });
TL.geo("w101-visa-japan", { scope: "region", lat: 36, lon: 138, r: 1000, label: "Japan", src: "https://en.wikipedia.org/wiki/Japan" });
TL.geo("w101-ndm1", { scope: "region", lat: 63, lon: 16, r: 800, label: "Sweden", src: "https://en.wikipedia.org/wiki/Sweden" });
TL.geo("w101-epu", { scope: "region", lat: 48.0, lon: 8.0, r: 1500, label: "Western Europe", src: "https://en.wikipedia.org/wiki/Western_Europe" });
TL.geo("w101-sdr-created", { scope: "global" });
TL.geo("w101-keeling-1960", { scope: "place", lat: 19.54, lon: -155.58, r: 60, label: "Mauna Loa Observatory, Hawaii", src: "https://en.wikipedia.org/wiki/Mauna_Loa_Observatory" });
TL.geo("w101-broecker-1975", { scope: "global" });
TL.geo("w101-wcc-1979", { scope: "place", lat: 46.20, lon: 6.14, r: 30, label: "Geneva, Switzerland", src: "https://en.wikipedia.org/wiki/Geneva" });
TL.geo("w101-giss-1981", { scope: "place", lat: 40.81, lon: -73.97, r: 30, label: "Goddard Institute for Space Studies, New York City", src: "https://en.wikipedia.org/wiki/Goddard_Institute_for_Space_Studies" });
TL.geo("w101-ipcc-tar", { scope: "global" });
TL.geo("w101-ipcc-ar5", { scope: "global" });
TL.geo("w101-system-360", { scope: "global" });
TL.geo("w101-altair-8800", { scope: "global" });
TL.geo("w101-apple-ii", { scope: "global" });
TL.geo("w101-windows-95", { scope: "global" });
TL.geo("w101-ipad", { scope: "global" });
TL.geo("w101-indonesia-proclaimed", { scope: "region", lat: -5, lon: 120, r: 2000, label: "Indonesia", src: "https://en.wikipedia.org/wiki/Indonesia" });
TL.geo("w101-india-pakistan-independence", { scope: "region", lat: 21, lon: 78, r: 1800, label: "India and Pakistan", src: "https://en.wikipedia.org/wiki/India" });
TL.geo("w101-libya-independent", { scope: "region", lat: 27.0, lon: 17.0, r: 1000, label: "Libya", src: "https://en.wikipedia.org/wiki/Libya" });
TL.geo("w101-botswana-independent", { scope: "region", lat: -22, lon: 24, r: 600, label: "Botswana", src: "https://en.wikipedia.org/wiki/Botswana" });
TL.geo("w101-guinea-bissau-declares", { scope: "region", lat: 12.0, lon: -15.0, r: 200, label: "Guinea-Bissau", src: "https://en.wikipedia.org/wiki/Guinea-Bissau" });
TL.geo("w101-geneva-round-1956", { scope: "place", lat: 46.20, lon: 6.14, r: 30, label: "Geneva, Switzerland", src: "https://en.wikipedia.org/wiki/Geneva" });
TL.geo("w101-enabling-clause", { scope: "global" });
TL.geo("w101-nobel-genetic-code", { scope: "global" });
TL.geo("w101-automated-dna-sequencer", { scope: "place", lat: 34.14, lon: -118.13, r: 30, label: "Caltech, Pasadena, California", src: "https://en.wikipedia.org/wiki/California_Institute_of_Technology" });
TL.geo("w101-genome-draft-2000", { scope: "global" });
TL.geo("w101-ips-cells", { scope: "place", lat: 35.01, lon: 135.77, r: 30, label: "Kyoto, Japan", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w101-crispr-babies", { scope: "place", lat: 22.3, lon: 114.2, r: 40, label: "Hong Kong", src: "https://en.wikipedia.org/wiki/Hong_Kong" });
TL.geo("w101-general-theory", { scope: "region", lat: 55, lon: -3, r: 600, label: "United Kingdom", src: "https://en.wikipedia.org/wiki/United_Kingdom" });
TL.geo("w101-mexico-wheat-self-sufficient", { scope: "region", lat: 23, lon: -102, r: 1500, label: "Mexico", src: "https://en.wikipedia.org/wiki/Mexico" });
TL.geo("w101-ir36", { scope: "global" });
