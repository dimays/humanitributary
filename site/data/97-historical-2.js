// New branches: Spanish Philippines (1565–1898), Kingdom of Hawaiʻi (1795–1898), Kingdom of Tonga (1845–). Every cite below was fetched and read while writing; see SCHEMA.md.
const D = (y, m, d) => y + (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / (365.25 * 864e5);
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const X = (t, u) => ({ t, u });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });

TL.add({
  branches: [
    { id: "spanish-philippines", name: "Spanish Philippines", region: "eastasia",
      start: 1565.3, end: 1898.94, startWhen: "April 1565 (Legazpi reaches Cebu)", endWhen: "December 10, 1898 (Treaty of Paris)",
      parents: [], into: ["philippines"],
      text: "Spain's colony in the archipelago, begun when Legazpi reached Cebu in 1565 and ruled from Manila. It was run from New Spain until 1821, was shaken by the 1896 revolution, and passed to the United States in 1898.",
      cites: [B("biography/Miguel-Lopez-de-Legazpi", "Miguel López de Legazpi"), W("Spanish_East_Indies", "Spanish East Indies"), B("event/Treaty-of-Paris-1898", "Treaty of Paris")] },
    { id: "hawaii-kingdom", name: "Kingdom of Hawaiʻi", region: "oceania",
      start: 1795.4, end: 1898.61, startWhen: "1795 (all islands but Kauaʻi and Niʻihau; whole group by 1810)", endWhen: "August 12, 1898 (annexed; monarchy overthrown January 17, 1893)",
      parents: [], into: ["usa"],
      text: "Kamehameha I united the islands by 1810. His dynasty and its successors ruled until Queen Liliʻuokalani was deposed in 1893; the Republic of Hawaiʻi followed in 1894 and the United States annexed the islands in 1898.",
      cites: [B("biography/Kamehameha-I", "Kamehameha I"), B("biography/Liliuokalani", "Liliuokalani"), W("Republic_of_Hawaii", "Republic of Hawaii")] },
    { id: "tonga", name: "Kingdom of Tonga", region: "oceania",
      start: 1845.9, end: null, startWhen: "1845", endWhen: "",
      parents: [], into: [],
      text: "Taufaʻāhau took the title King George Tupou I in 1845 and unified Tonga, which got a constitution in 1875. A British protected state from 1900, it regained full sovereignty in 1970 and remains a constitutional monarchy.",
      cites: [B("place/Tonga/History", "Tonga: History"), B("biography/George-Tupou-I", "George Tupou I"), W("Tonga", "Tonga")] },
  ],
  events: [
    // ---------- Spanish Philippines
    { id: "n97-sp-legazpi-cebu", branch: "spanish-philippines", y: 1565.3, when: "April 1565", imp: 2, link: "new-spain",
      title: "Legazpi founds the first Spanish settlement, at Cebu",
      text: "Sent from Mexico by the viceroy of New Spain, Miguel López de Legazpi reached Cebu with five ships and founded the first Spanish settlement in the islands. He served as the first governor until his death in 1572.",
      cites: [B("biography/Miguel-Lopez-de-Legazpi", "Miguel López de Legazpi"), W("Spanish_East_Indies", "Spanish East Indies")] },
    { id: "n97-sp-manila-capital", branch: "spanish-philippines", y: D(1571, 6, 24), when: "June 24, 1571", imp: 2,
      title: "Manila becomes the colonial capital",
      text: "Legazpi took the Luzon settlement of Maynila, renamed it Manila and set up a city council inside what became Intramuros. It stayed the capital of the Spanish East Indies for about three centuries.",
      cites: [B("place/Manila/History", "Manila: History"), W("Manila", "Manila"), B("biography/Miguel-Lopez-de-Legazpi", "Miguel López de Legazpi")] },
    { id: "n97-sp-doctrina", branch: "spanish-philippines", y: 1593, when: "1593", imp: 3,
      title: "The first books are printed in Manila",
      text: "Dominican friars printed two catechisms in Manila by woodblock. The Spanish–Tagalog Doctrina Christiana was the first book written in a Philippine language; the date of the Chinese edition is uncertain.",
      cites: [W("Doctrina_Christiana", "Doctrina Christiana"), X("Early Printing in the Philippines — BiblioAsia (National Library Board, Singapore)", "https://biblioasia.nlb.gov.sg/vol-17/issue-2/jul-sep-2021/early-printing/")] },
    { id: "n97-sp-ust", branch: "spanish-philippines", y: D(1611, 4, 28), when: "April 28, 1611", imp: 3,
      title: "University of Santo Tomas founded in Manila",
      text: "Funded by a bequest of the archbishop Miguel de Benavides, the Dominican college became a university. It holds the oldest extant university charter in Asia, and a 1645 papal bull placed it under papal authority.",
      cites: [W("University_of_Santo_Tomas", "University of Santo Tomas"), X("University of Santo Tomas — Times Higher Education", "https://www.timeshighereducation.com/world-university-rankings/university-santo-tomas")] },
    { id: "n97-sp-british-manila", branch: "spanish-philippines", y: D(1762, 10, 6), end: 1764.3, when: "October 6, 1762 – April 1764", imp: 2,
      title: "Britain captures and holds Manila",
      text: "During the Seven Years' War a British force under Draper and Cornish took Manila after a siege that began September 24. The British could not extend control beyond Manila and Cavite, and returned the city under the 1763 Treaty of Paris.",
      cites: [W("Battle_of_Manila_(1762)", "Battle of Manila (1762)"), B("place/Manila/History", "Manila: History")] },
    { id: "n97-sp-gomburza", branch: "spanish-philippines", y: D(1872, 2, 17), when: "February 17, 1872", imp: 2,
      title: "Gomburza executed after the Cavite Mutiny",
      text: "After a January 20 revolt by about 200 troops and workers at the Cavite arsenal, the priests Gómez, Burgos and Zamora, advocates of native clergy, were garroted at Bagumbayan. Their deaths became a spur to Filipino nationalism.",
      cites: [B("topic/Cavite-Mutiny", "Cavite Mutiny"), W("Gomburza", "Gomburza")] },
    { id: "n97-sp-katipunan", branch: "spanish-philippines", y: D(1892, 7, 7), when: "July 7, 1892", imp: 2,
      title: "Bonifacio founds the Katipunan",
      text: "Andrés Bonifacio, a former messenger and warehouse keeper, helped found this secret society in Manila to win independence from Spain by armed revolution. Britannica estimates it had 100,000 members by 1896.",
      cites: [B("biography/Andres-Bonifacio", "Andrés Bonifacio"), W("Katipunan", "Katipunan")] },
    { id: "n97-sp-revolution", branch: "spanish-philippines", y: 1896.65, when: "August 1896", imp: 1,
      title: "The Philippine Revolution begins",
      text: "The Spanish discovered the Katipunan in August 1896 and Bonifacio's revolt began. The struggle, 1896–98, exposed the weakness of Spanish rule without driving Spain from the islands.",
      cites: [B("event/Philippine-Revolution", "Philippine Revolution"), B("biography/Andres-Bonifacio", "Andrés Bonifacio")] },
    { id: "n97-sp-bonifacio-executed", branch: "spanish-philippines", y: D(1897, 5, 10), when: "May 10, 1897", imp: 3,
      title: "Bonifacio executed by revolutionary rivals",
      text: "After trying to set up his own rebel government in rivalry with Aguinaldo's, Bonifacio was executed by firing squad. Emilio Aguinaldo's faction then led the revolution.",
      cites: [B("biography/Andres-Bonifacio", "Andrés Bonifacio"), B("biography/Emilio-Aguinaldo", "Emilio Aguinaldo")] },
    { id: "n97-sp-biak-na-bato", branch: "spanish-philippines", y: D(1897, 12, 14), when: "December 14–15, 1897", imp: 2,
      title: "Pact of Biak-na-Bato",
      text: "Aguinaldo and Governor-General Primo de Rivera agreed a truce: Spain would pay 800,000 pesos and the leaders went into exile in Hong Kong. Britannica says neither side honored the terms.",
      cites: [W("Pact_of_Biak-na-Bato", "Pact of Biak-na-Bato"), B("event/Philippine-Revolution", "Philippine Revolution")] },
    { id: "n97-sp-manila-bay", branch: "spanish-philippines", y: D(1898, 5, 1), when: "May 1, 1898", imp: 1, link: "usa",
      title: "Dewey destroys the Spanish fleet at Manila Bay",
      text: "In the Spanish–American War, Commodore George Dewey's Asiatic Squadron defeated Admiral Montojo's fleet. Britannica says the annihilation of the Spanish fleet signaled the end of Spanish rule in the Philippines.",
      cites: [B("event/Battle-of-Manila-Bay", "Battle of Manila Bay")] },
    { id: "n97-sp-aguinaldo-returns", branch: "spanish-philippines", y: D(1898, 5, 19), when: "May 19, 1898", imp: 3,
      title: "Aguinaldo returns and renews the revolution",
      text: "Aguinaldo came back from exile in Hong Kong after the Battle of Manila Bay and announced a renewed struggle against Spain. Independence was declared on June 12, 1898 and a provisional republic proclaimed.",
      cites: [B("biography/Emilio-Aguinaldo", "Emilio Aguinaldo"), B("event/Philippine-Revolution", "Philippine Revolution")] },
    { id: "n97-sp-treaty-paris", branch: "spanish-philippines", y: D(1898, 12, 10), when: "December 10, 1898", imp: 1, link: "usa",
      title: "Treaty of Paris cedes the Philippines to the US",
      text: "The treaty ending the Spanish–American War, signed December 10, 1898, ceded the Philippines, Puerto Rico and Guam to the United States, ending 333 years of Spanish rule.",
      cites: [B("event/Treaty-of-Paris-1898", "Treaty of Paris"), B("biography/Emilio-Aguinaldo", "Emilio Aguinaldo"), B("place/Philippines", "Philippines")] },

    // ---------- Kingdom of Hawaiʻi
    { id: "n97-hk-nuuanu", branch: "hawaii-kingdom", y: 1795.4, when: "May 1795", imp: 2,
      title: "Kamehameha wins the Battle of Nuʻuanu",
      text: "Kamehameha I defeated the Oʻahu forces of Kalanikupule at the Nuʻuanu Pali cliffs. By 1795 his conquests had brought all the islands but Kauaʻi and Niʻihau under his control.",
      cites: [W("Battle_of_Nu%CA%BBuanu", "Battle of Nuʻuanu"), B("biography/Kamehameha-I", "Kamehameha I")] },
    { id: "n97-hk-kamehameha-dies", branch: "hawaii-kingdom", y: D(1819, 5, 8), when: "May 8, 1819", imp: 3,
      title: "Kamehameha I dies at Kailua",
      text: "The conqueror who united the islands and founded the Kamehameha dynasty died at Kailua. The kapu system fell within months of his death, and his son Liholiho became Kamehameha II.",
      cites: [B("biography/Kamehameha-I", "Kamehameha I"), W("%CA%BBAi_Noa", "ʻAi Noa")] },
    { id: "n97-hk-constitution-1840", branch: "hawaii-kingdom", y: D(1840, 10, 8), when: "October 8, 1840", imp: 2,
      title: "Hawaiʻi becomes a constitutional monarchy",
      text: "Kamehameha III, advised by the American clergyman William Richards, had issued a Declaration of Rights in 1839, called Hawaiʻi's Magna Carta. The 1840 constitution made the kingdom a constitutional monarchy.",
      cites: [B("biography/Kamehameha-III", "Kamehameha III"), W("Hawaiian_Kingdom", "Hawaiian Kingdom")] },
    { id: "n97-hk-independence-recognized", branch: "hawaii-kingdom", y: D(1843, 11, 28), when: "November 28, 1843", imp: 2, link: "uk",
      title: "Britain and France recognize Hawaiian independence",
      text: "Months after a British naval officer forced Kamehameha III to cede the islands in February 1843 (sovereignty was restored July 31), Britain and France formally recognized the kingdom's independence.",
      cites: [W("Hawaiian_Kingdom", "Hawaiian Kingdom"), B("biography/Kamehameha-III", "Kamehameha III")] },
    { id: "n97-hk-honolulu-capital", branch: "hawaii-kingdom", y: 1845, when: "1845", imp: 3,
      title: "Honolulu becomes the capital",
      text: "A trade and whaling hub, Honolulu became the de facto capital in 1845 and was declared a city by Kamehameha III in 1850.",
      cites: [B("place/Honolulu", "Honolulu")] },
    { id: "n97-hk-kalakaua-elected", branch: "hawaii-kingdom", y: D(1874, 2, 12), when: "February 12, 1874", imp: 3,
      title: "Kalākaua elected king",
      text: "After Lunalilo's death, the legislature chose David Kalākaua over Queen Emma; her supporters rioted. He reigned from 1874 to 1891.",
      cites: [B("biography/Kalakaua", "Kalākaua"), X("The 1874 Election Riot in Honolulu — Ka Wai Ola (Office of Hawaiian Affairs)", "https://kawaiola.news/ea/the-1874-election-riot-in-honolulu/"), W("Hawaiian_Kingdom", "Hawaiian Kingdom")] },
    { id: "n97-hk-reciprocity", branch: "hawaii-kingdom", y: 1876, when: "1876", imp: 2, link: "usa",
      title: "Reciprocity treaty with the United States",
      text: "King Kalākaua secured a somewhat favorable reciprocity treaty with the United States, tying the kingdom's economy more closely to American markets.",
      cites: [B("biography/Kalakaua", "Kalākaua")] },
    { id: "n97-hk-ukulele", branch: "hawaii-kingdom", y: 1879.6, when: "August 1879", imp: 3,
      title: "Portuguese immigrants bring the ukulele's ancestor",
      text: "Madeiran islanders arrived on the SS Ravenscrag in late August 1879, bringing the machete, a small guitar. Cabinetmakers such as Manuel Nunes are credited as the first ukulele makers, and King Kalākaua championed the instrument.",
      cites: [W("Ukulele", "Ukulele"), B("topic/ukulele", "ukulele")] },
    { id: "n97-hk-world-tour", branch: "hawaii-kingdom", y: 1881, when: "1881", imp: 3,
      title: "Kalākaua circles the globe",
      text: "King Kalākaua made a trip around the world. His sister Liliʻuokalani served as regent and organized schools for Hawaiian youth.",
      cites: [B("biography/Kalakaua", "Kalākaua"), B("biography/Liliuokalani", "Liliuokalani")] },
    { id: "n97-hk-iolani-palace", branch: "hawaii-kingdom", y: 1882, when: "1882", imp: 3,
      title: "ʻIolani Palace completed in Honolulu",
      text: "King Kalākaua was instrumental in building the palace, which served as the seat of the legislature and is now a museum.",
      cites: [B("place/Iolani-Palace", "Iolani Palace")] },
    { id: "n97-hk-bayonet", branch: "hawaii-kingdom", y: D(1887, 7, 6), when: "July 6, 1887", imp: 1,
      title: "The Bayonet Constitution",
      text: "Threatened by the Honolulu Rifles, a militia, Kalākaua signed a constitution that curbed his powers and limited voting by property. Britannica adds that in 1887 he also gave the US rights to Pearl Harbor.",
      cites: [W("Bayonet_Constitution", "Bayonet Constitution"), X("Iulai 6: Kumukānāwai o ka Makahiki 1887 — University of Hawaiʻi at Mānoa", "https://manoa.hawaii.edu/punawaiola/2018/07/06/iulai-6-kumukanawai-o-ka-makahiki-1887/"), X("Constitutions — Hawaiʻi Legal Research, UH Richardson School of Law", "https://law-hawaii.libguides.com/c.php?g=125434&p=821605"), B("biography/Kalakaua", "Kalākaua")] },
    { id: "n97-hk-liliuokalani", branch: "hawaii-kingdom", y: 1891.1, when: "1891", imp: 2,
      title: "Liliʻuokalani becomes queen",
      text: "After her brother Kalākaua died, she ascended the throne as the first and only queen and the last sovereign of Hawaiʻi. She fought the annexation of the islands by the United States.",
      cites: [B("biography/Liliuokalani", "Liliuokalani")] },
    { id: "n97-hk-republic", branch: "hawaii-kingdom", y: D(1894, 7, 4), when: "July 4, 1894", imp: 2,
      title: "Republic of Hawaiʻi proclaimed",
      text: "The Provisional Government that deposed the queen in 1893 was reorganized as the Republic of Hawaiʻi, with Sanford B. Dole as president. Dole's Missionary Party had requested annexation by the United States.",
      cites: [W("Republic_of_Hawaii", "Republic of Hawaii"), B("biography/Sanford-Ballard-Dole", "Sanford Ballard Dole"), B("biography/Liliuokalani", "Liliuokalani")] },
    { id: "n97-hk-wilcox", branch: "hawaii-kingdom", y: 1895.05, when: "January 1895", imp: 3,
      title: "Royalist counter-revolution crushed",
      text: "Robert Wilcox led an attempt to restore Liliʻuokalani that was put down within days. She was convicted after weapons were found at her home and sentenced to five years' hard labor, later commuted and pardoned.",
      cites: [W("Republic_of_Hawaii", "Republic of Hawaii"), X("Washington Place — National Park Service", "https://www.nps.gov/places/washington-place-honolulu-hawaii.htm")] },

    // ---------- Kingdom of Tonga
    { id: "n97-to-treaties", branch: "tonga", y: 1876, when: "1876–1888", imp: 2,
      title: "Germany, Britain and the US recognize Tonga",
      text: "Separate treaties with Germany (1876), Great Britain (1879) and the United States (1888) recognized Tonga's independence.",
      cites: [B("place/Tonga/History", "Tonga: History")] },
    { id: "n97-to-free-church", branch: "tonga", y: 1885, when: "1885", imp: 3,
      title: "Free Church of Tonga founded",
      text: "Shirley Baker, a Methodist missionary, adviser to King George Tupou I and premier 1881–90, helped found the Free Church as a rival to the Australian-led Wesleyan mission. Britain had him deported in 1890.",
      cites: [W("Shirley_Waldemar_Baker", "Shirley Waldemar Baker"), X("Baker, Shirley Waldemar — Dictionary of Methodism in Britain and Ireland", "https://dmbi.online/index.php?do=app.entry&id=118")] },
    { id: "n97-to-tupou-i-dies", branch: "tonga", y: 1893, when: "1893", imp: 3,
      title: "George Tupou I dies after 48 years as king",
      text: "His reign, 1845–93, left Tonga unified and independent with a constitution, legal code and administration. His great-grandson George Tupou II succeeded him.",
      cites: [B("biography/George-Tupou-I", "George Tupou I"), B("place/Tonga/History", "Tonga: History")] },
    { id: "n97-to-protectorate", branch: "tonga", y: D(1900, 5, 18), when: "May 18, 1900", imp: 1, link: "uk",
      title: "Treaty of Friendship makes Tonga a British protected state",
      text: "Britain acted partly to discourage German advances. Tonga agreed to conduct foreign affairs through a British consul with veto power; the 1900 treaty was amended in 1905.",
      cites: [B("place/Tonga/History", "Tonga: History"), W("Tonga", "Tonga")] },
    { id: "n97-to-salote", branch: "tonga", y: D(1918, 4, 5), when: "April 1918", imp: 2,
      title: "Queen Sālote Tupou III takes the throne",
      text: "She ruled almost 48 years, the longest reign of any Tongan monarch, and has been called the leader of a golden age. She also wrote songs and poems.",
      cites: [W("Salote_Tupou_III", "Sālote Tupou III"), B("place/Tonga/History", "Tonga: History")] },
    { id: "n97-to-coronation-1953", branch: "tonga", y: 1953.4, when: "1953", imp: 3, link: "uk",
      title: "Sālote rides in the rain at Elizabeth II's coronation",
      text: "On her only visit to Europe, the queen rode in an open carriage through heavy rain without a hood, which won over London spectators.",
      cites: [W("Salote_Tupou_III", "Sālote Tupou III"), X("Queen Sālote on the world stage — Te Papa blog", "https://blog.tepapa.govt.nz/2014/09/05/queen-salote-on-the-world-stage/")] },
    { id: "n97-to-salote-dies", branch: "tonga", y: D(1965, 12, 16), when: "December 16, 1965", imp: 3,
      title: "Sālote dies; her son becomes Tupou IV",
      text: "The queen died in Auckland. Her son Prince Tupouto'a Tungi, prime minister since 1949, succeeded as King Taufa'ahau Tupou IV.",
      cites: [W("Salote_Tupou_III", "Sālote Tupou III"), B("place/Tonga/History", "Tonga: History")] },
    { id: "n97-to-passports", branch: "tonga", y: 1983, end: 1991, when: "1983–1991", imp: 3,
      title: "Tonga sells 6,600 passports",
      text: "Despite domestic and international objections, the government sold some 6,600 Tongan passports to foreign nationals.",
      cites: [B("place/Tonga/History", "Tonga: History")] },
    { id: "n97-to-olympics-1984", branch: "tonga", y: 1984.55, when: "1984", imp: 3,
      title: "Tonga debuts at the Olympics",
      text: "Tonga first competed at the 1984 Los Angeles Summer Games and has since entered 11 Summer Games.",
      cites: [W("Tonga_at_the_Olympics", "Tonga at the Olympics"), X("Tonga — Olympedia", "https://www.olympedia.org/countries/TGA")] },
    { id: "n97-to-wolfgramm-silver", branch: "tonga", y: 1996.58, when: "1996", imp: 2,
      title: "Paea Wolfgramm wins Tonga's only Olympic medal",
      text: "The boxer took silver at the Atlanta Games, Tonga's only Olympic medal so far.",
      cites: [W("Tonga_at_the_Olympics", "Tonga at the Olympics"), X("Tonga — Olympedia", "https://www.olympedia.org/countries/TGA")] },
    { id: "n97-to-un", branch: "tonga", y: 1999.7, when: "September 1999", imp: 3,
      title: "Tonga joins the United Nations",
      text: "Tonga became a United Nations member in September 1999. It is also a member of the Commonwealth.",
      cites: [W("Tonga", "Tonga"), B("place/Tonga", "Tonga")] },
    { id: "n97-to-sevele", branch: "tonga", y: 2006.2, when: "March 2006", imp: 3,
      title: "First non-noble prime minister appointed",
      text: "Feleti (Fred) Sevele became Tonga's first prime minister who was not a noble, amid a growing pro-democracy movement.",
      cites: [B("place/Tonga/History", "Tonga: History")] },
    { id: "n97-to-riots-2006", branch: "tonga", y: D(2006, 11, 16), when: "November 16, 2006", imp: 2,
      title: "Riots devastate Nukuʻalofa",
      text: "A pro-democracy demonstration after a slow reform vote became a riot with looting and arson. Britannica reports seven dead, though other counts say six; estimates put 60–80 percent of the central business district destroyed.",
      cites: [W("2006_Nuku%CA%BBalofa_riots", "2006 Nukuʻalofa riots"), B("place/Tonga/History", "Tonga: History")] },
    { id: "n97-to-tupou-v", branch: "tonga", y: 2008.6, when: "August 2008", imp: 3,
      title: "George Tupou V crowned",
      text: "Before his coronation, the king divested himself of many state assets that had made up much of the monarchy's wealth.",
      cites: [B("biography/George-Tupou-V", "George Tupou V"), B("place/Tonga/History", "Tonga: History")] },
    { id: "n97-to-tupou-vi", branch: "tonga", y: D(2012, 3, 18), when: "March 18, 2012", imp: 2,
      title: "Tupou VI succeeds his brother",
      text: "George Tupou V died in Hong Kong, and Crown Prince Tupouto'a Lavaka, a former naval officer and prime minister, became King Tupou VI. He was crowned on July 4, 2015.",
      cites: [W("Tupou_VI", "Tupou VI"), B("place/Tonga/History", "Tonga: History")] },
  ],
});

TL.origin("spanish-philippines", {
  note: "Austronesian-speaking peoples had long lived on the islands. Spain claimed them after Magellan's 1521 visit and began settlement in 1565 with an expedition from Mexico under Legazpi; New Spain governed them until 1821.",
  links: [
    { id: "spain", how: "conquest", note: "Spanish expedition under Legazpi settled Cebu in 1565 and took Manila in 1571" },
    { id: "austronesian-expansion", how: "peoples", note: "Filipino peoples speak Austronesian languages" },
    { id: "new-spain", how: "context", note: "Governed from the Viceroyalty of New Spain from 1565 until 1821" },
  ],
  cites: [B("biography/Miguel-Lopez-de-Legazpi", "Miguel López de Legazpi"), W("Spanish_East_Indies", "Spanish East Indies")],
});
TL.origin("hawaii-kingdom", {
  note: "Polynesian voyagers settled the islands, which were ruled by rival chiefs. Kamehameha I, a chief of Hawaiʻi island, conquered the other islands by 1795 and gained Kauaʻi and Niʻihau peacefully in 1810.",
  links: [
    { id: "polynesians", how: "peoples", note: "Native Hawaiians descend from Polynesian settlers" },
  ],
  cites: [B("biography/Kamehameha-I", "Kamehameha I"), W("Battle_of_Nu%CA%BBuanu", "Battle of Nuʻuanu")],
});
TL.origin("tonga", {
  note: "Tonga was ruled for centuries by a line of sacred kings, the Tuʻi Tonga. After decades of war from 1799 to 1852, the Christian convert Taufaʻāhau took the Tuʻi Kanokupolu title and became King George Tupou I in 1845.",
  links: [
    { id: "polynesians", how: "peoples", note: "Tongans are a Polynesian people; the Tuʻi Tonga line of kings began earlier" },
  ],
  cites: [B("place/Tonga/History", "Tonga: History"), B("biography/George-Tupou-I", "George Tupou I")],
});

// ---- Moves
TL.move("w207-ph-noli-me-tangere", "spanish-philippines");
TL.move("w207-ph-rizal-executed", "spanish-philippines");
TL.move("w309-ns-galleon", "spanish-philippines");
TL.patch("w309-ns-galleon", { y: 1565.45, link: "new-spain" }); // Urdaneta sailed from Cebu in June 1565, after the branch start
for (const id of ["w210-pl-kamehameha-unites", "w210-pl-ai-noa", "w210-pl-hawaiian-print", "w210-pl-mahele", "w210-pl-kalakaua-coronation", "w210-pl-hawaii-overthrow"]) TL.move(id, "hawaii-kingdom");
for (const id of ["w210-pl-tupou-king", "w210-pl-tonga-constitution", "w111-tonga-protectorate-ends", "w111-tonga-election-2010", "w111-hunga-tonga-eruption"]) TL.move(id, "tonga");

// ---- Locations
const G = (id, lat, lon, r, label, slug, scope = "place") => TL.geo(id, { scope, lat, lon, r, label, src: `https://en.wikipedia.org/wiki/${slug}` });
G("spanish-philippines", 12.9, 122.9, 900, "Philippines", "Philippines", "region");
G("hawaii-kingdom", 20.8, -157.0, 450, "Hawaiian Islands", "Hawaii", "region");
G("tonga", -20.2, -175.2, 450, "Tonga", "Tonga", "region");
G("n97-sp-legazpi-cebu", 10.3, 123.9, 40, "Cebu City", "Cebu_City");
G("n97-sp-manila-capital", 14.59, 120.97, 40, "Intramuros, Manila", "Intramuros");
G("n97-sp-doctrina", 14.59, 120.97, 40, "Manila", "Manila");
G("n97-sp-ust", 14.61, 120.99, 30, "Manila", "University_of_Santo_Tomas");
G("n97-sp-british-manila", 14.59, 120.97, 40, "Manila", "Manila");
G("n97-sp-gomburza", 14.58, 120.98, 30, "Bagumbayan (Luneta), Manila", "Rizal_Park");
G("n97-sp-katipunan", 14.59, 120.97, 40, "Manila", "Manila");
G("n97-sp-revolution", 14.59, 120.97, 80, "Manila and Cavite", "Manila");
G("n97-sp-bonifacio-executed", 14.27, 120.74, 60, "Maragondon, Cavite", "Maragondon");
G("n97-sp-biak-na-bato", 15.14, 121.0, 40, "San Miguel, Bulacan", "San_Miguel,_Bulacan");
G("n97-sp-manila-bay", 14.5, 120.8, 70, "Manila Bay", "Manila_Bay");
G("n97-sp-aguinaldo-returns", 14.44, 120.9, 40, "Cavite", "Cavite");
G("n97-sp-treaty-paris", 48.86, 2.35, 40, "Paris", "Paris");
G("n97-hk-nuuanu", 21.36, -157.79, 30, "Nuʻuanu Pali, Oʻahu", "Nu%CA%BBuanu_Pali");
G("n97-hk-kamehameha-dies", 19.64, -155.99, 30, "Kailua-Kona, Hawaiʻi", "Kailua-Kona,_Hawaii");
G("n97-hk-constitution-1840", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-hk-independence-recognized", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-hk-honolulu-capital", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-hk-kalakaua-elected", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-hk-reciprocity", 38.9, -77.04, 40, "Washington, D.C.", "Washington,_D.C.");
G("n97-hk-ukulele", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-hk-world-tour", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-hk-iolani-palace", 21.31, -157.86, 30, "ʻIolani Palace, Honolulu", "%CA%BBIolani_Palace");
G("n97-hk-bayonet", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-hk-liliuokalani", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-hk-republic", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-hk-wilcox", 21.31, -157.86, 30, "Honolulu", "Honolulu");
G("n97-to-treaties", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
G("n97-to-free-church", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
G("n97-to-tupou-i-dies", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
G("n97-to-protectorate", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
G("n97-to-salote", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
G("n97-to-coronation-1953", 51.5, -0.13, 30, "Westminster, London", "Westminster_Abbey");
G("n97-to-salote-dies", -36.85, 174.76, 40, "Auckland", "Auckland");
G("n97-to-passports", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
G("n97-to-olympics-1984", 34.05, -118.24, 40, "Los Angeles", "Los_Angeles");
G("n97-to-wolfgramm-silver", 33.75, -84.39, 40, "Atlanta", "Atlanta");
G("n97-to-un", 40.75, -73.97, 30, "United Nations, New York", "United_Nations_Headquarters");
G("n97-to-sevele", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
G("n97-to-riots-2006", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
G("n97-to-tupou-v", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
G("n97-to-tupou-vi", -21.14, -175.2, 30, "Nukuʻalofa, Tonga", "Nuku%CA%BBalofa");
