// W3-06 fill: Ethiopia, Ife, Kongo, Mali, Songhai, Afghanistan, Deccan sultanates, 1500-1800. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Britannica`, u: `https://www.britannica.com/${path}` });
const H = (path, title) => ({ t: `${title} — World History Encyclopedia`, u: `https://www.worldhistory.org/${path}` });
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };
TL.add({ events: [
  // Ethiopia
  { id: "w306-eth-wayna-daga", branch: "ethiopia", y: D(1543, 2, 21), when: "February 21, 1543", imp: 2, link: "portugal",
    title: "Battle of Wayna Daga ends Ahmad Gragn's war",
    text: "Ethiopian and Portuguese forces defeated the army of the Adal imam Ahmad Gragn east of Lake Tana, and he was killed. Emperor Galawdewos regained his kingdom.",
    cites: [W("Battle_of_Wayna_Daga", "Battle of Wayna Daga"), B("biography/Ahmad-Gran", "Aḥmad Grāñ")] },
  { id: "w306-eth-paez-blue-nile", branch: "ethiopia", y: D(1618, 4, 21), when: "April 21, 1618", imp: 3,
    title: "Pedro Páez reaches the source of the Blue Nile",
    text: "The Spanish Jesuit Pedro Páez, working at the imperial court, traced the Blue Nile to its source near Lake Tana. He is credited as the first European to see and describe it.",
    cites: [B("biography/Pedro-Paez", "Pedro Páez"), W("Pedro_P%C3%A1ez", "Pedro Páez")] },
  { id: "w306-eth-susenyos-converts", branch: "ethiopia", y: 1622, when: "1622", imp: 2,
    title: "Emperor Susenyos converts to Catholicism",
    text: "Persuaded by the Jesuit Pedro Páez, Susenyos publicly converted in 1622. Catholic influence at court met strong resistance from the Ethiopian Orthodox Church and much of the population.",
    cites: [W("Susenyos_I", "Susenyos I"), B("biography/Susenyos", "Susenyos")] },
  { id: "w306-eth-fasilides-orthodoxy", branch: "ethiopia", y: 1632.45, when: "1632", imp: 2,
    title: "Fasilides succeeds and restores Orthodoxy",
    text: "Susenyos allowed his subjects freedom of faith and abdicated to his son Fasilides. Fasilides expelled the Catholic missionaries and began a policy of isolation from Europe that lasted over two centuries.",
    cites: [B("biography/Susenyos", "Susenyos"), B("biography/Fasilides", "Fasilides")] },
  { id: "w306-eth-gondar-founded", branch: "ethiopia", y: 1636, when: "1636", imp: 2,
    title: "Fasilides makes Gondar his royal camp",
    text: "Fasilides chose Gondar as his katama, or royal camp; it became the capital of Ethiopia from 1632 to 1855 by Britannica's account. The city later held 44 churches.",
    cites: [W("Gondar", "Gondar"), B("place/Gonder", "Gonder")] },
  { id: "w306-eth-gondar-castles", branch: "ethiopia", y: 1636, end: 1755, when: "17th–18th centuries", imp: 2,
    title: "Gondar's castles and palaces are built",
    text: "A series of emperors from Fasilides to Iyasu II raised castles and palaces in Gondar's royal enclosure. Fasil Ghebbi is now a UNESCO World Heritage Site, and the city's churches are richly decorated.",
    cites: [B("place/Gonder", "Gonder"), W("Gondar", "Gondar")] },
  { id: "w306-eth-iyasu-great", branch: "ethiopia", y: D(1682, 7, 19), end: D(1706, 10, 13), when: "July 19, 1682 – October 13, 1706", imp: 3,
    title: "Iyasu the Great reigns at Gondar",
    text: "Iyasu I built a new palace in Gondar and donated a bell from the Dutch East Indies governor to Debre Berhan Selassie church. He was deposed and assassinated in 1706.",
    cites: [W("Iyasu_I", "Iyasu I"), B("place/Gonder", "Gonder")] },
  { id: "w306-eth-mentewab-qusquam", branch: "ethiopia", y: D(1730, 12, 23), when: "December 23, 1730", imp: 3,
    title: "Empress Mentewab rules and builds Qusquam",
    text: "Crowned co-ruler as her son Iyasu II took the throne, Mentewab held great power over his government. She built a church of the Virgin Mary at Qusquam outside Gondar, with an adjoining palace.",
    cites: [W("Mentewab", "Mentewab"), B("place/Gonder", "Gonder")] },
  // Kongo
  { id: "w306-kongo-henrique-bishop", branch: "kongo", y: 1518, when: "1518", imp: 2, link: "portugal",
    title: "Afonso I's son Henrique is made a bishop",
    text: "Afonso I, who made Catholicism the royal household's faith and sought a Kongo bishop from the pope, saw his son Henrique raised to bishop in 1518. By 1516 the royal school had over 1,000 students.",
    cites: [W("Afonso_I_of_Kongo", "Afonso I of Kongo"), H("Kingdom_of_Kongo/", "Kingdom of Kongo")] },
  { id: "w306-kongo-oliphants", branch: "kongo", y: 1500, end: 1600, when: "16th century", imp: 3,
    title: "Kongo carvers make Afro-Portuguese ivory oliphants",
    text: "Richly decorated side-blown ivory horns were among the Kongo kingdom's earliest royal commissions. Blending African and Renaissance European elements, many were given or sold to Portuguese elites and missionaries.",
    cites: [{ t: "Kongo Ivories — The Metropolitan Museum of Art", u: "https://www.metmuseum.org/toah/hd/kong/hd_kong.htm" }] },
  { id: "w306-kongo-jaga", branch: "kongo", y: 1568, when: "1568", imp: 2,
    title: "Jaga warriors invade Kongo",
    text: "A group of warriors known as the Jaga invaded from the south or east, and an overtaxed population rose in their support. King Álvaro I fled the capital for an island in the Congo River.",
    cites: [H("Kingdom_of_Kongo/", "Kingdom of Kongo"), W("Kingdom_of_Kongo", "Kingdom of Kongo")] },
  { id: "w306-kongo-mbumbi", branch: "kongo", y: 1622, when: "1622", imp: 3, link: "portugal",
    title: "Portuguese win at Mbumbi in the first Kongo war",
    text: "Angola's Portuguese governor invaded southern Kongo in 1622, and his forces won the Battle of Mbumbi in the first war between Kongo and Portugal. Relations had been souring for years.",
    cites: [W("Kingdom_of_Kongo", "Kingdom of Kongo"), B("place/Kongo-historical-kingdom-Africa", "Kongo")] },
  { id: "w306-kongo-dutch-alliance", branch: "kongo", y: 1641, when: "1641", imp: 3,
    title: "Garcia II allies with the Dutch after they take Luanda",
    text: "After the Dutch captured Luanda in 1641, Kongo made a formal agreement with the new government. Garcia II ejected most Portuguese and Luso-African merchants from his kingdom.",
    cites: [W("Kingdom_of_Kongo", "Kingdom of Kongo"), B("place/Kongo-historical-kingdom-Africa", "Kongo")] },
  { id: "w306-kongo-mbwila", branch: "kongo", y: D(1665, 10, 29), when: "October 29, 1665", imp: 2, link: "portugal",
    title: "Battle of Mbwila: King António I killed",
    text: "Portuguese forces from Angola defeated the Kongo army and killed António I. With no immediate heir, the kingdom fell into a civil war that lasted about fifty years.",
    cites: [W("Battle_of_Mbwila", "Battle of Mbwila"), H("Kingdom_of_Kongo/", "Kingdom of Kongo")] },
  { id: "w306-kongo-sao-salvador-sack", branch: "kongo", y: 1678, when: "1678", imp: 3,
    title: "São Salvador is sacked in the civil war",
    text: "Fighting between the rival Kimpanzu and Kinlaza factions led to the sack of the capital, São Salvador, which was then abandoned. The civil war ran for most of the rest of the century.",
    cites: [W("Kingdom_of_Kongo", "Kingdom of Kongo"), H("Kingdom_of_Kongo/", "Kingdom of Kongo")] },
  { id: "w306-kongo-kimpa-vita", branch: "kongo", y: D(1706, 7, 2), when: "July 2, 1706", imp: 2,
    title: "Kimpa Vita, prophet of the Antonian movement, is burned",
    text: "She taught that Jesus and Mary were Kongolese and urged Kongo to reunite under one king. King Pedro IV, advised by Capuchin friars, had her tried as a witch and heretic and burned.",
    cites: [W("Kimpa_Vita", "Kimpa Vita"), B("place/Kongo-historical-kingdom-Africa", "Kongo")] },
  // Songhai
  { id: "w306-songhai-timbuktu-golden-age", branch: "songhai", y: 1493, end: 1591, when: "Askia period, 1493–1591", imp: 2,
    title: "Timbuktu's golden age of scholarship",
    text: "Under the Askia dynasty, Timbuktu reached the height of its commercial and intellectual life. A class of religious scholars wrote on subjects from law to science and history.",
    cites: [B("place/Timbuktu-Mali", "Timbuktu"), H("Songhai_Empire/", "Songhai Empire")] },
  { id: "w306-songhai-leo-africanus", branch: "songhai", y: 1526, when: "c. 1526", imp: 3,
    title: "Leo Africanus completes his Description of Africa",
    text: "The Moroccan-born traveler, who may have visited Timbuktu, wrote his account of Africa in Italy around 1526. Published in 1550, it became Europe's best-known description of Songhai and the Sahel.",
    cites: [B("biography/Leo-Africanus", "Leo Africanus"), H("Leo_Africanus/", "Leo Africanus")] },
  { id: "w306-songhai-musa-revolt", branch: "songhai", y: 1528, when: "1528", imp: 3,
    title: "Askia Muhammad's sons depose him",
    text: "His children revolted and declared his son Askia Musa king in 1528. Musa was overthrown in 1531, and ineffectual rulers and succession wars weakened the empire.",
    cites: [W("Songhai_Empire", "Songhai Empire"), B("topic/Askia-dynasty", "Askia dynasty")] },
  { id: "w306-songhai-ahmad-baba-born", branch: "songhai", y: D(1556, 10, 26), when: "October 26, 1556", imp: 3,
    title: "Ahmad Baba is born near Timbuktu",
    text: "The future jurist, writer and cultural leader of the western Sudan was born at Arawan. He became one of the most prolific scholars of Timbuktu.",
    cites: [B("biography/Ahmad-Baba", "Aḥmad Bābā")] },
  { id: "w306-songhai-ishaq-ii", branch: "songhai", y: 1588, when: "1588", imp: 3,
    title: "Askia Ishaq II takes the throne after a succession struggle",
    text: "A long dynastic struggle followed the death of Askia Daoud. Ishaq II ruled from 1588, and in 1590–91 Morocco exploited the empire's civil conflict to invade.",
    cites: [W("Songhai_Empire", "Songhai Empire")] },
  { id: "w306-songhai-timbuktu-conquest", branch: "songhai", y: 1591, when: "1591", imp: 2,
    title: "Morocco conquers Timbuktu",
    text: "The sultan of Morocco conquered Timbuktu in 1591. The jurist Ahmad Baba was accused of refusing to recognize his authority and plotting rebellion, and was deported to Marrakesh in 1594.",
    cites: [B("biography/Ahmad-Baba", "Aḥmad Bābā"), H("Songhai_Empire/", "Songhai Empire")] },
  // Mali
  { id: "w306-mali-diafunu", branch: "mali", y: 1502, when: "1502", imp: 3, link: "songhai",
    title: "Songhai defeat Mali and seize Diafunu",
    text: "Forces under Askia Muhammad I beat the Mali general Fati Quali Keita and took the province of Diafunu, one of the western territories Mali was losing.",
    cites: [W("Mali_Empire", "Mali Empire"), { t: "Mali Empire (ca. 1200-1545) — BlackPast", u: "https://blackpast.org/global-african-history/mali-empire-ca-1200/" }] },
  { id: "w306-mali-niani-sacked", branch: "mali", y: 1544.5, when: "1544 or 1545", imp: 2, link: "songhai",
    title: "Songhai force sacks Mali's capital",
    text: "A Songhai army led by Dawud sacked the Mali capital. The Songhai did not hold it, but the blow further weakened the old empire.",
    cites: [W("Mali_Empire", "Mali Empire"), { t: "Mali Empire (ca. 1200-1545) — BlackPast", u: "https://blackpast.org/global-african-history/mali-empire-ca-1200/" }] },
  { id: "w306-mali-jenne", branch: "mali", y: D(1599, 4, 26), when: "April 26, 1599", imp: 3,
    title: "Mansa Mahmud IV's army fights at Djenné",
    text: "Mali's army under Mahmud IV and a Moroccan army fought at Djenné on April 26, 1599, as the Keitas contested the Niger trading cities after Songhai's fall.",
    cites: [W("Mali_Empire", "Mali Empire")] },
  { id: "w306-mali-end", branch: "mali", y: 1610, when: "c. 1610 (some sources give 1645)", imp: 2,
    title: "Mahmud Keita IV dies and the Mali Empire ends",
    text: "No single Keita ruled the Manden after his death, ending the empire. It had been reduced to a small western pocket well before the 17th century.",
    cites: [W("Mali_Empire", "Mali Empire"), B("place/Mali-historical-empire-Africa", "Mali")] },
  // Afghanistan
  { id: "w306-afg-ahmad-crowned", branch: "afghanistan", y: D(1747, 7, 23), when: "July 23, 1747", imp: 2,
    title: "Ahmad Shah is crowned near Kandahar",
    text: "Ahmad Shah Durrani was crowned in 1747 and set up his capital at Kandahar, the first capital of a unified Afghanistan. The jirga story of his selection lacks contemporary evidence.",
    cites: [B("biography/Ahmad-Shah-Durrani", "Ahmad Shah Durrani"), W("Ahmad_Shah_Durrani", "Ahmad Shah Durrani")] },
  { id: "w306-afg-delhi-1757", branch: "afghanistan", y: 1757, when: "1757", imp: 3, link: "mughal",
    title: "Ahmad Shah marches unopposed into Delhi",
    text: "Ahmad Shah invaded India nine times between 1747 and 1769. In 1757 he marched unopposed to Delhi and plundered Delhi, Agra, Mathura and Vrindavan.",
    cites: [B("biography/Ahmad-Shah-Durrani", "Ahmad Shah Durrani"), B("biography/Timur-Shah", "Tīmūr Shah")] },
  { id: "w306-afg-cloak", branch: "afghanistan", y: 1768, when: "1768", imp: 3,
    title: "Ahmad Shah brings the Prophet's cloak to Kandahar",
    text: "Ahmad Shah brought a cloak believed to be Muhammad's to Kandahar, reportedly a gift from the Bukharan leader under a peace treaty, though its origin is disputed. It is kept in a shrine in front of his mausoleum.",
    cites: [W("Shrine_of_the_Cloak", "Shrine of the Cloak"), { t: "Under the Cloak of History — Afghanistan Analysts Network", u: "https://www.afghanistan-analysts.org/en/reports/context-culture/under-the-cloak-of-history-the-kherqa-sharif-from-faizabad-to-kandahar/" }] },
  { id: "w306-afg-ahmad-dies", branch: "afghanistan", y: D(1772, 10, 17), when: "October 16–17, 1772", imp: 2,
    title: "Ahmad Shah Durrani dies",
    text: "The founder of Afghanistan died at Toba Maruf. His empire stretched from Mashhad to Kashmir and from the Amu Darya to the Arabian Sea.",
    cites: [B("biography/Ahmad-Shah-Durrani", "Ahmad Shah Durrani"), B("place/Kandahar", "Kandahār")] },
  { id: "w306-afg-kabul-capital", branch: "afghanistan", y: 1776, when: "1776", imp: 3,
    title: "Timur Shah moves the capital to Kabul",
    text: "Facing opposition around Kandahar, Timur Shah shifted the Durrani capital from Kandahar to Kabul, which has remained the capital since.",
    cites: [B("biography/Timur-Shah", "Tīmūr Shah")] },
  // Deccan sultanates
  { id: "w306-dec-goa-lost", branch: "deccan-sultanates", y: D(1510, 11, 25), when: "November 25, 1510", imp: 2, link: "portugal",
    title: "Portugal takes Goa from Bijapur",
    text: "Afonso de Albuquerque retook Goa on St. Catherine's day after Ismail Adil Shah's forces had driven the Portuguese out that May. Goa became the center of Portugal's empire in Asia.",
    cites: [W("Conquest_of_Goa_(1510)", "Conquest of Goa (1510)"), B("biography/Afonso-de-Albuquerque", "Afonso de Albuquerque")] },
  { id: "w306-dec-golconda-independent", branch: "deccan-sultanates", y: 1518, when: "1518", imp: 2,
    title: "Quli Qutb Shah declares Golconda independent",
    text: "A Bahmani governor declared independence in 1518 and moved his capital to Golconda, founding the Qutb Shahi dynasty. The kingdom became noted for its gold and diamonds.",
    cites: [B("topic/Qutb-Shahi-dynasty", "Quṭb Shāhī dynasty")] },
  { id: "w306-dec-talikota", branch: "deccan-sultanates", y: 1565, when: "1565", imp: 2, link: "vijayanagara",
    title: "Sultans ally to destroy Vijayanagara",
    text: "Aggrieved by Rama Raya, at least four of the five sultans marched on Vijayanagara in 1564. Their victory at Talikota in early 1565 was followed by the sack of the city.",
    cites: [B("place/India/Decline-of-Vijayanagar", "India: Decline of Vijayanagar")] },
  { id: "w306-dec-charminar", branch: "deccan-sultanates", y: 1591, when: "1591", imp: 2,
    title: "Hyderabad and the Charminar are founded",
    text: "Muhammad Quli Qutb Shah built a new capital on the Musi River. The Charminar, said to be its first building, is regarded as the supreme achievement of the Qutb Shahi period.",
    cites: [B("topic/Charminar", "Charminar"), B("place/Hyderabad-India", "Hyderabad")] },
  { id: "w306-dec-quli-poet", branch: "deccan-sultanates", y: 1580.43, end: 1612.03, when: "1580–1612", imp: 3,
    title: "Muhammad Quli Qutb Shah, sultan and poet of Deccani Urdu",
    text: "He wrote poetry in Persian, Telugu and Urdu and is considered one of the first poets of Deccani Urdu. His collected works run to about 1,800 pages, over half of them ghazals.",
    cites: [W("Muhammad_Quli_Qutb_Shah", "Muhammad Quli Qutb Shah"), B("topic/Qutb-Shahi-dynasty", "Quṭb Shāhī dynasty")] },
  { id: "w306-dec-ibrahim-ii", branch: "deccan-sultanates", y: 1579, end: 1626, when: "1579–1626", imp: 3,
    title: "Ibrahim Adil Shah II's reign and Deccani painting",
    text: "Britannica calls the reign the Adil Shahi dynasty's greatest period. Deccani miniature painting, with its rich, luminous color, flourished among the sultanates from the late 16th century.",
    cites: [B("topic/Adil-Shahi-dynasty", "Adil Shahi dynasty"), B("topic/Deccani-painting", "Deccani painting")] },
  { id: "w306-dec-chand-bibi", branch: "deccan-sultanates", y: 1595.85, end: 1596.15, when: "November 1595 – February 1596", imp: 3,
    title: "Chand Bibi defends Ahmadnagar against the Mughals",
    text: "When the Mughals invaded in November 1595, the regent Chand Bibi took command and held the fort. In February 1596 she made peace by ceding Berar.",
    cites: [W("Chand_Bibi", "Chand Bibi"), B("topic/Nizam-Shahi-dynasty", "Nizam Shahi dynasty")] },
  { id: "w306-dec-ahmadnagar-falls", branch: "deccan-sultanates", y: D(1600, 8, 18), when: "August 18, 1600", imp: 2, link: "mughal",
    title: "Mughals capture Ahmadnagar fort",
    text: "After Chand Bibi's death the Mughals took Ahmadnagar and imprisoned its sultan. Malik Ambar later revived the Nizam Shahi cause from a new capital.",
    cites: [W("Chand_Bibi", "Chand Bibi"), W("Ahmadnagar_Sultanate", "Ahmadnagar Sultanate"), B("topic/Nizam-Shahi-dynasty", "Nizam Shahi dynasty")] },
  { id: "w306-dec-ibrahim-rauza", branch: "deccan-sultanates", y: 1626.5, when: "1626–1627", imp: 3,
    title: "Ibrahim Rauza is completed at Bijapur",
    text: "Taj Sultana, wife of Ibrahim Adil Shah II, was the patron of this tomb-and-mosque complex, finished after more than eight years. Its carved stone and jali screens earned it the nickname “Black Taj Mahal.”",
    cites: [W("Ibrahim_Rauza", "Ibrahim Rauza"), B("place/Bijapur", "Vijayapura")] },
  { id: "w306-dec-gol-gumbaz", branch: "deccan-sultanates", y: 1627, end: 1656, when: "c. 1627–1656", imp: 2,
    title: "Gol Gumbaz is built for Muhammad Adil Shah",
    text: "Work on the sultan's mausoleum began early in his reign and continued until his death in 1656. Its dome, 44 meters across, was the largest unsupported dome in India, and its gallery produces many echoes.",
    cites: [W("Gol_Gumbaz", "Gol Gumbaz"), B("place/Bijapur", "Vijayapura")] },
  { id: "w306-dec-nizam-shahi-ends", branch: "deccan-sultanates", y: 1636.8, when: "October 1636", imp: 3, link: "mughal",
    title: "Ahmadnagar sultanate is partitioned",
    text: "After Daulatabad fell in 1633, Aurangzeb, then Mughal viceroy of the Deccan, defeated the regent Shahaji and divided the remaining Nizam Shahi territory between the Mughals and Bijapur.",
    cites: [W("Ahmadnagar_Sultanate", "Ahmadnagar Sultanate"), B("topic/Nizam-Shahi-dynasty", "Nizam Shahi dynasty")] },
  { id: "w306-dec-afzal-khan", branch: "deccan-sultanates", y: 1659.8, when: "1659", imp: 3,
    title: "Shivaji kills Bijapur's general Afzal Khan",
    text: "The sultan sent Afzal Khan with a large army to subdue Shivaji, who lured him to a meeting in difficult mountain terrain and killed him. The victory raised Shivaji's standing.",
    cites: [B("biography/Afzal-Khan", "Afẕal Khān")] },
] });
// Ethiopia
TL.geo("w306-eth-wayna-daga", { scope: "place", lat: 12, lon: 37.25, r: 80, label: "Lake Tana, Ethiopia", src: "https://en.wikipedia.org/wiki/Lake_Tana" });
TL.geo("w306-eth-paez-blue-nile", { scope: "place", lat: 12, lon: 37.25, r: 80, label: "Lake Tana, Ethiopia", src: "https://en.wikipedia.org/wiki/Lake_Tana" });
TL.geo("w306-eth-susenyos-converts", { scope: "region", lat: 9, lon: 39, r: 600, label: "Ethiopia", src: "https://en.wikipedia.org/wiki/Ethiopia" });
TL.geo("w306-eth-fasilides-orthodoxy", { scope: "region", lat: 9, lon: 39, r: 600, label: "Ethiopia", src: "https://en.wikipedia.org/wiki/Ethiopia" });
TL.geo("w306-eth-gondar-founded", { scope: "place", lat: 12.61, lon: 37.46, r: 40, label: "Gondar", src: "https://en.wikipedia.org/wiki/Gondar" });
TL.geo("w306-eth-gondar-castles", { scope: "place", lat: 12.61, lon: 37.46, r: 40, label: "Gondar", src: "https://en.wikipedia.org/wiki/Gondar" });
TL.geo("w306-eth-iyasu-great", { scope: "place", lat: 12.61, lon: 37.46, r: 40, label: "Gondar", src: "https://en.wikipedia.org/wiki/Gondar" });
TL.geo("w306-eth-mentewab-qusquam", { scope: "place", lat: 12.61, lon: 37.46, r: 40, label: "Gondar", src: "https://en.wikipedia.org/wiki/Gondar" });
// Kongo
for (const id of ["henrique-bishop", "jaga", "mbwila", "sao-salvador-sack", "kimpa-vita"]) TL.geo("w306-kongo-" + id, { scope: "place", lat: -6.27, lon: 14.24, r: 60, label: "Mbanza Kongo (São Salvador), Angola", src: "https://en.wikipedia.org/wiki/Mbanza_Kongo" });
for (const id of ["oliphants", "mbumbi", "dutch-alliance"]) TL.geo("w306-kongo-" + id, { scope: "region", lat: -6.27, lon: 14.24, r: 400, label: "Kingdom of Kongo", src: "https://en.wikipedia.org/wiki/Mbanza_Kongo" });
// Songhai
for (const id of ["timbuktu-golden-age", "leo-africanus", "ahmad-baba-born", "timbuktu-conquest"]) TL.geo("w306-songhai-" + id, { scope: "place", lat: 16.77, lon: -3.01, r: 60, label: "Timbuktu, Mali", src: "https://en.wikipedia.org/wiki/Timbuktu" });
for (const id of ["musa-revolt", "ishaq-ii"]) TL.geo("w306-songhai-" + id, { scope: "place", lat: 16.27, lon: -0.04, r: 60, label: "Gao, Mali", src: "https://en.wikipedia.org/wiki/Gao" });
// Mali
for (const id of ["diafunu", "niani-sacked", "end"]) TL.geo("w306-mali-" + id, { scope: "place", lat: 11.43, lon: -9.15, r: 80, label: "Niani, Guinea", src: "https://en.wikipedia.org/wiki/Niani" });
TL.geo("w306-mali-jenne", { scope: "place", lat: 13.91, lon: -4.55, r: 50, label: "Djenné, Mali", src: "https://en.wikipedia.org/wiki/Djenn%C3%A9" });
// Afghanistan
TL.geo("w306-afg-ahmad-crowned", { scope: "place", lat: 31.62, lon: 65.72, r: 50, label: "Kandahar", src: "https://en.wikipedia.org/wiki/Kandahar" });
TL.geo("w306-afg-delhi-1757", { scope: "place", lat: 28.61, lon: 77.23, r: 50, label: "Delhi", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w306-afg-cloak", { scope: "place", lat: 31.62, lon: 65.72, r: 30, label: "Kandahar", src: "https://en.wikipedia.org/wiki/Kandahar" });
TL.geo("w306-afg-ahmad-dies", { scope: "place", lat: 31.62, lon: 65.72, r: 60, label: "Kandahar", src: "https://en.wikipedia.org/wiki/Kandahar" });
TL.geo("w306-afg-kabul-capital", { scope: "place", lat: 34.53, lon: 69.17, r: 40, label: "Kabul", src: "https://en.wikipedia.org/wiki/Kabul" });
// Deccan
TL.geo("w306-dec-goa-lost", { scope: "place", lat: 15.5, lon: 73.83, r: 60, label: "Goa", src: "https://en.wikipedia.org/wiki/Goa" });
TL.geo("w306-dec-golconda-independent", { scope: "place", lat: 17.38, lon: 78.4, r: 40, label: "Golconda Fort", src: "https://en.wikipedia.org/wiki/Golconda_Fort" });
TL.geo("w306-dec-talikota", { scope: "place", lat: 15.33, lon: 76.46, r: 60, label: "Hampi (Vijayanagara)", src: "https://en.wikipedia.org/wiki/Hampi" });
TL.geo("w306-dec-charminar", { scope: "place", lat: 17.36, lon: 78.47, r: 30, label: "Charminar, Hyderabad", src: "https://en.wikipedia.org/wiki/Charminar" });
TL.geo("w306-dec-quli-poet", { scope: "place", lat: 17.36, lon: 78.47, r: 40, label: "Hyderabad", src: "https://en.wikipedia.org/wiki/Hyderabad" });
for (const id of ["ibrahim-ii", "ibrahim-rauza"]) TL.geo("w306-dec-" + id, { scope: "place", lat: 16.83, lon: 75.71, r: 40, label: "Bijapur (Vijayapura)", src: "https://en.wikipedia.org/wiki/Vijayapura,_Karnataka" });
TL.geo("w306-dec-gol-gumbaz", { scope: "place", lat: 16.83, lon: 75.74, r: 30, label: "Gol Gumbaz, Bijapur", src: "https://en.wikipedia.org/wiki/Gol_Gumbaz" });
for (const id of ["chand-bibi", "ahmadnagar-falls", "nizam-shahi-ends"]) TL.geo("w306-dec-" + id, { scope: "place", lat: 19.09, lon: 74.74, r: 50, label: "Ahmednagar", src: "https://en.wikipedia.org/wiki/Ahmednagar" });
TL.geo("w306-dec-afzal-khan", { scope: "place", lat: 17.94, lon: 73.58, r: 40, label: "Pratapgad", src: "https://en.wikipedia.org/wiki/Pratapgad" });
