// Predecessor branches for Middle East and South Asia (set c)
const W17c = (p, t) => ({ t: t + " - Wikipedia", u: "https://en.wikipedia.org/wiki/" + p });

TL.add({
  branches: [
    { id: "naqada", name: "Naqada culture", region: "mideast", start: -4000, end: -3000,
      startWhen: "c. 4000 BCE", endWhen: "c. 3000 BCE", parents: [], into: ["egypt"],
      text: "Chalcolithic predynastic culture of Upper Egypt, named for Naqada. Radiocarbon work suggests it began between 3800 and 3700 BCE; its last phase, Naqada III, saw the first pharaohs.",
      cites: [W17c("Naqada_culture", "Naqada culture"), { t: "Naqādah | Culture, Period, Ancient City, Ruins, Archaeology, & Egypt | Britannica", u: "https://www.britannica.com/place/Naqadah" }] },
    { id: "canaanites", name: "Canaanites", region: "mideast", start: -2000, end: -1200,
      startWhen: "c. 2000 BCE (Middle Bronze Age)", endWhen: "c. 1200 BCE (Late Bronze Age collapse)", parents: [], into: ["phoenicia"],
      text: "People of the Bronze Age city-states of the southern Levant, under Egyptian rule for much of the Late Bronze Age. The name “Canaan” almost disappears after the collapse of c. 1206–1150 BCE.",
      cites: [W17c("Canaan", "Canaan"), W17c("Phoenicia", "Phoenicia"), { t: "Canaan | Definition, Map, Bible, History, & Facts | Britannica", u: "https://www.britannica.com/place/Canaan-historical-region-Middle-East" }] },
    { id: "israel-judah", name: "Kingdoms of Israel and Judah", region: "mideast", start: -930, end: -587,
      startWhen: "c. 930 BCE", endWhen: "c. 587 BCE (Israel fell c. 720 BCE)", parents: [], into: [],
      text: "The Iron Age Israelite kingdoms that split after Solomon c. 930 BCE. Neo-Assyria conquered Israel around 720 BCE; Nebuchadnezzar II ended Judah with the fall of Jerusalem, dated 587 or 586 BCE.",
      cites: [W17c("Kingdom_of_Judah", "Kingdom of Judah"), W17c("Kingdom_of_Israel_(Samaria)", "Kingdom of Israel (Samaria)"), { t: "Israel (Biblical Kingdom) | Map, History, & Kings | Britannica", u: "https://www.britannica.com/topic/Israel-Old-Testament-kingdom" }] },
    { id: "pallavas", name: "Pallava dynasty", region: "southasia", start: 275, end: 897,
      startWhen: "275 CE", endWhen: "897 CE", parents: [], into: [],
      text: "Dynasty of southern India ruling from Kanchipuram, noted for Vaishnava temple architecture such as the Shore Temple at Mamallapuram. Its last ruler was Aparajita Varman; the Cholas defeated it.",
      cites: [W17c("Pallava_dynasty", "Pallava dynasty"), { t: "Pallava dynasty | Time Period, Foundation, & Capital | Britannica", u: "https://www.britannica.com/topic/Pallava-dynasty" }] },
    { id: "ghaznavids", name: "Ghaznavid Empire", region: "southasia", start: 977, end: 1186,
      startWhen: "977", endWhen: "1186", parents: [], into: [],
      text: "Dynasty founded by Sabuktigin at Ghazna. Under Mahmud it reached the Indus and Rey; after Dandanaqan (1040) it shrank to Afghanistan and northern India, and the Ghurids took Lahore in 1186.",
      cites: [W17c("Ghaznavids", "Ghaznavids"), { t: "Ghaznavid dynasty | Empire, Rulers, & History | Britannica", u: "https://www.britannica.com/topic/Ghaznavid-dynasty" }] },
    { id: "ghurids", name: "Ghurid dynasty", region: "southasia", start: 786, end: 1215,
      startWhen: "786", endWhen: "1215", parents: [], into: ["delhi-sultanate"],
      text: "Dynasty from the hills of Ghor in central Afghanistan. Muhammad of Ghor won at Tarain in 1192; after his 1206 death his general Aibak became Sultan of Delhi. Khwarazmian forces ended the dynasty in 1215.",
      cites: [W17c("Ghurid_dynasty", "Ghurid dynasty"), { t: "Ghurid sultanate | History, Dynasty, & Importance | Britannica", u: "https://www.britannica.com/place/Ghurid-sultanate" }] },
    { id: "afsharid", name: "Afsharid Iran", region: "mideast", start: 1736, end: 1796,
      startWhen: "1736", endWhen: "1796", parents: ["safavid"], into: [],
      text: "Dynasty founded by Nader Shah, of Turkoman origin, who was crowned in 1736. After his 1747 death the Zand dynasty followed; Shahrokh Shah reigned 1750–1796 and the dynasty was deposed in 1796.",
      cites: [W17c("Afsharid_dynasty", "Afsharid dynasty"), W17c("Nader_Shah", "Nader Shah"), { t: "Nadir Shah | Biography, Empire, & Peacock Throne | Britannica", u: "https://www.britannica.com/biography/Nadir-Shah" }] },
    { id: "deccan-sultanates", name: "Deccan sultanates", region: "southasia", start: 1490, end: 1687,
      startWhen: "1490", endWhen: "1687", parents: [], into: ["mughal"],
      text: "Successor states of the Bahmani Sultanate: Ahmadnagar, Bijapur and Berar from 1490, then Bidar and Golconda. They defeated Vijayanagara in 1565; Aurangzeb conquered Bijapur in 1686 and Golconda in 1687.",
      cites: [W17c("Deccan_sultanates", "Deccan sultanates"), { t: "Bahmani sultanate | India, Map, & History | Britannica", u: "https://www.britannica.com/place/Bahmani-sultanate" }] },
  ],
  events: [
    { id: "p17c-naqada-begins", branch: "naqada", y: -3750, when: "between 3800 and 3700 BCE", title: "Naqada culture begins (radiocarbon estimate)",
      text: "A 2013 Oxford radiocarbon study suggests the Naqada culture began between 3800 and 3700 BCE; the infobox gives c. 4000–3000 BCE for the culture as a whole.",
      imp: 2, cites: [W17c("Naqada_culture", "Naqada culture")] },
    { id: "p17c-naqada-iii", branch: "naqada", y: -3200, end: -3000, when: "c. 3200–3000 BCE", title: "Naqada III: the Protodynastic Period",
      text: "Naqada III is coterminous with the Protodynastic Period, c. 3200–3000 BCE, and saw the first pharaohs; the First Dynasty of Egypt followed.",
      imp: 2, cites: [W17c("Naqada_culture", "Naqada culture")] },
    { id: "p17c-merneptah-stele", branch: "canaanites", y: -1250, when: "13th century BCE", title: "Merneptah Stele names Canaan and Israel",
      text: "Egyptian hieroglyphs on the Merneptah Stele name Canaan and record a people called “Israel,” the first extra-biblical mention of Israel.",
      imp: 2, cites: [W17c("Canaan", "Canaan"), W17c("Kingdom_of_Israel_(united_monarchy)", "Kingdom of Israel (united monarchy)")] },
    { id: "p17c-canaan-collapse", branch: "canaanites", y: -1206, end: -1150, when: "c. 1206–1150 BCE", title: "Late Bronze Age collapse; “Canaan” fades",
      text: "After the Late Bronze Age collapse the name Canaan almost disappears, and Egypt withdrew from the southern Levant over about a century.",
      imp: 2, cites: [W17c("Canaan", "Canaan")] },
    { id: "p17c-israel-judah-split", branch: "israel-judah", y: -930, when: "c. 930 BCE", title: "Kingdom divides into Israel and Judah",
      text: "After Solomon's death, Rehoboam refused to lighten taxes and labor; ten tribes rebelled and made Jeroboam king, while Judah stayed loyal to the House of David.",
      imp: 2, cites: [W17c("Kingdom_of_Judah", "Kingdom of Judah"), W17c("Kingdom_of_Israel_(united_monarchy)", "Kingdom of Israel (united monarchy)")] },
    { id: "p17c-sennacherib-jerusalem", branch: "israel-judah", y: -701, when: "701 BCE", title: "Sennacherib besieges Jerusalem",
      text: "Hezekiah refused tribute to Assyria; Sennacherib attacked Judah and besieged Jerusalem in 701 BCE, though the city was never taken.",
      imp: 2, cites: [W17c("Kingdom_of_Judah", "Kingdom of Judah")] },
    { id: "p17c-pallava-founded", branch: "pallavas", y: 275, when: "275 CE", title: "Pallava rule begins under Simhavarman I",
      text: "The dynasty's listed rule begins in 275 CE with Simhavarman I; its capital was Kanchipuram.",
      imp: 2, cites: [W17c("Pallava_dynasty", "Pallava dynasty")] },
    { id: "p17c-pallava-ends", branch: "pallavas", y: 897, when: "897 CE", title: "Last Pallava ruler Aparajita Varman",
      text: "The last listed Pallava ruler, Aparajita Varman, reigned 880–897; the dynasty was finally defeated by the Chola ruler Aditya I.",
      imp: 2, link: "chola", cites: [W17c("Pallava_dynasty", "Pallava dynasty")] },
    { id: "p17c-mahmud-ghazni", branch: "ghaznavids", y: 998, when: "998", title: "Mahmud of Ghazni takes power",
      text: "Sabuktigin's son Mahmud (r. 998–1030) expanded the empire east to the Indus and west to Rey and Hamadan.",
      imp: 2, cites: [W17c("Ghaznavids", "Ghaznavids")] },
    { id: "p17c-dandanaqan", branch: "ghaznavids", y: 1040, when: "1040", title: "Seljuks defeat Mas'ud at Dandanaqan",
      text: "The Seljuks decisively defeated Mas'ud I at Dandanaqan, and the Ghaznavids lost most of their western territories.",
      imp: 2, link: "seljuk", cites: [W17c("Ghaznavids", "Ghaznavids"), W17c("Seljuk_Empire", "Seljuk Empire")] },
    { id: "p17c-ghurid-tarain", branch: "ghurids", y: 1192, when: "1192", title: "Muhammad of Ghor wins the Second Battle of Tarain",
      text: "Muhammad of Ghor returned with Turkish mounted archers, routed the Rajput forces and soon executed Prithviraja.",
      imp: 2, cites: [W17c("Ghurid_dynasty", "Ghurid dynasty")] },
    { id: "p17c-ghurid-end", branch: "ghurids", y: 1215, when: "1215", title: "Khwarazmians take Ghazni; Ghurids uprooted",
      text: "Khwarazmian forces took Ghazni in 1215 and Shah Muhammad II uprooted the Ghurids; their Indian conquests survived under the Delhi Sultanate.",
      imp: 2, cites: [W17c("Ghurid_dynasty", "Ghurid dynasty")] },
    { id: "p17c-nader-crowned", branch: "afsharid", y: 1736.18, when: "March 8, 1736", title: "Nader crowned Shah on the Moghan plain",
      text: "At a large assembly on the Moghan plain, Nader proposed replacing the young Abbas III with himself and was crowned Shah of Iran.",
      imp: 2, cites: [W17c("Nader_Shah", "Nader Shah")] },
    { id: "p17c-karnal-delhi", branch: "afsharid", y: 1739.12, when: "February 13, 1739", title: "Nader defeats the Mughals at Karnal; Delhi sacked",
      text: "Nader beat Emperor Muhammad Shah's army at Karnal, entered Delhi, and ordered it sacked after a rumor of his death; he took the Peacock Throne.",
      imp: 2, link: "mughal", cites: [W17c("Nader_Shah", "Nader Shah")] },
    { id: "p17c-ahmadnagar-independent", branch: "deccan-sultanates", y: 1490, when: "1490", title: "Ahmadnagar declares independence from the Bahmanis",
      text: "Ahmadnagar was the first to declare independence; Bijapur and Berar followed the same year, and Bidar c. 1492.",
      imp: 2, cites: [W17c("Deccan_sultanates", "Deccan sultanates")] },
    { id: "p17c-golconda-falls", branch: "deccan-sultanates", y: 1687, when: "1687", title: "Aurangzeb conquers Golconda",
      text: "Aurangzeb's army besieged and conquered Golconda in 1687, a year after he ended the Adil Shahi dynasty of Bijapur.",
      imp: 2, link: "mughal", cites: [W17c("Deccan_sultanates", "Deccan sultanates")] },
  ],
});

TL.geo("naqada", { scope: "region", lat: 25.9, lon: 32.72, r: 450, label: "Upper Egypt (Naqada)", src: "https://en.wikipedia.org/wiki/Naqada,_Egypt" });
TL.geo("canaanites", { scope: "region", lat: 33, lon: 35.5, r: 300, label: "Canaan, southern Levant", src: "https://en.wikipedia.org/wiki/Canaan" });
TL.geo("israel-judah", { scope: "region", lat: 31.78, lon: 35.22, r: 150, label: "Israel and Judah", src: "https://en.wikipedia.org/wiki/Jerusalem" });
TL.geo("pallavas", { scope: "region", lat: 12.83, lon: 79.7, r: 400, label: "Kanchipuram, Tamil Nadu", src: "https://en.wikipedia.org/wiki/Kanchipuram" });
TL.geo("ghaznavids", { scope: "region", lat: 33.55, lon: 68.42, r: 1500, label: "Ghazni, Afghanistan", src: "https://en.wikipedia.org/wiki/Ghazni" });
TL.geo("ghurids", { scope: "region", lat: 34, lon: 65, r: 700, label: "Ghor, Afghanistan", src: "https://en.wikipedia.org/wiki/Ghor_Province" });
TL.geo("afsharid", { scope: "region", lat: 36.33, lon: 59.54, r: 1500, label: "Mashhad, Iran", src: "https://en.wikipedia.org/wiki/Mashhad" });
TL.geo("deccan-sultanates", { scope: "region", lat: 15, lon: 77, r: 600, label: "Deccan Plateau, India", src: "https://en.wikipedia.org/wiki/Deccan_Plateau" });

TL.geo("p17c-naqada-begins", { scope: "place", lat: 25.9, lon: 32.72, r: 60, label: "Naqada, Egypt", src: "https://en.wikipedia.org/wiki/Naqada,_Egypt" });
TL.geo("p17c-naqada-iii", { scope: "place", lat: 25.9, lon: 32.72, r: 60, label: "Naqada, Egypt", src: "https://en.wikipedia.org/wiki/Naqada,_Egypt" });
TL.geo("p17c-merneptah-stele", { scope: "place", lat: 25.7, lon: 32.64, r: 60, label: "Thebes, Egypt", src: "https://en.wikipedia.org/wiki/Luxor" });
TL.geo("p17c-canaan-collapse", { scope: "region", lat: 33, lon: 35.5, r: 300, label: "Canaan, southern Levant", src: "https://en.wikipedia.org/wiki/Canaan" });
TL.geo("p17c-israel-judah-split", { scope: "place", lat: 31.78, lon: 35.22, r: 60, label: "Jerusalem", src: "https://en.wikipedia.org/wiki/Jerusalem" });
TL.geo("p17c-sennacherib-jerusalem", { scope: "place", lat: 31.78, lon: 35.22, r: 40, label: "Jerusalem", src: "https://en.wikipedia.org/wiki/Jerusalem" });
TL.geo("p17c-pallava-founded", { scope: "place", lat: 12.83, lon: 79.7, r: 50, label: "Kanchipuram, India", src: "https://en.wikipedia.org/wiki/Kanchipuram" });
TL.geo("p17c-pallava-ends", { scope: "place", lat: 12.83, lon: 79.7, r: 50, label: "Kanchipuram, India", src: "https://en.wikipedia.org/wiki/Kanchipuram" });
TL.geo("p17c-mahmud-ghazni", { scope: "place", lat: 33.55, lon: 68.42, r: 50, label: "Ghazni, Afghanistan", src: "https://en.wikipedia.org/wiki/Ghazni" });
TL.geo("p17c-dandanaqan", { scope: "place", lat: 37.39, lon: 61.35, r: 80, label: "Dandanaqan, near Merv", src: "https://en.wikipedia.org/wiki/Battle_of_Dandanaqan" });
TL.geo("p17c-ghurid-tarain", { scope: "place", lat: 29.78, lon: 76.94, r: 50, label: "Tarain (Taraori), India", src: "https://en.wikipedia.org/wiki/Taraori" });
TL.geo("p17c-ghurid-end", { scope: "place", lat: 33.55, lon: 68.42, r: 50, label: "Ghazni, Afghanistan", src: "https://en.wikipedia.org/wiki/Ghazni" });
TL.geo("p17c-nader-crowned", { scope: "place", lat: 39.5, lon: 48, r: 100, label: "Moghan plain", src: "https://en.wikipedia.org/wiki/Mughan_plain" });
TL.geo("p17c-karnal-delhi", { scope: "place", lat: 29.69, lon: 76.99, r: 50, label: "Karnal, India", src: "https://en.wikipedia.org/wiki/Karnal" });
TL.geo("p17c-ahmadnagar-independent", { scope: "place", lat: 19.08, lon: 74.73, r: 50, label: "Ahmednagar, India", src: "https://en.wikipedia.org/wiki/Ahmednagar" });
TL.geo("p17c-golconda-falls", { scope: "place", lat: 17.38, lon: 78.4, r: 40, label: "Golconda Fort", src: "https://en.wikipedia.org/wiki/Golconda" });

TL.origin("naqada", {
  note: "The Naqada culture of Upper Egypt followed the Badarian culture, the largest early culture there, and over about 1,000 years grew from small farming communities into a powerful civilization.",
  links: [],
  cites: [W17c("Ancient_Egypt", "Ancient Egypt"), W17c("Naqada_culture", "Naqada culture"), { t: "Naqādah | Culture, Period, Ancient City, Ruins, Archaeology, & Egypt | Britannica", u: "https://www.britannica.com/place/Naqadah" }],
});

TL.origin("canaanites", {
  note: "The Canaanites were the Bronze Age peoples of the southern Levant; the name is first certain in the 18th century BCE or later, and Egypt held the land for much of the Late Bronze Age.",
  links: [],
  cites: [W17c("Canaan", "Canaan"), { t: "Canaan | Definition, Map, Bible, History, & Facts | Britannica", u: "https://www.britannica.com/place/Canaan-historical-region-Middle-East" }],
});

TL.origin("israel-judah", {
  note: "Israelite culture largely overlapped with and derived from Canaanite culture. Highland settlement dates to the 13th–10th centuries BCE; the monarchy's early history and its unity are debated.",
  links: [
    { id: "canaanites", how: "peoples", note: "Israelite culture largely overlapped with and derived from Canaanite culture" },
  ],
  cites: [W17c("Canaan", "Canaan"), W17c("Kingdom_of_Israel_(united_monarchy)", "Kingdom of Israel (united monarchy)"), { t: "Israel (Biblical Kingdom) | Map, History, & Kings | Britannica", u: "https://www.britannica.com/topic/Israel-Old-Testament-kingdom" }],
});

TL.origin("pallavas", {
  note: "The Pallavas ruled southern India from Kanchipuram from 275 CE, in constant conflict with the Chalukyas of Vatapi; sources give differing dates for their early kings.",
  links: [],
  cites: [W17c("Pallava_dynasty", "Pallava dynasty"), { t: "Pallava dynasty | Time Period, Foundation, & Capital | Britannica", u: "https://www.britannica.com/topic/Pallava-dynasty" }],
});

TL.origin("ghaznavids", {
  note: "The Ghaznavids were a dynasty founded by Sabuktigin, who succeeded to rule at Ghazna; his son Mahmud made it an empire from the Amu Darya to the Indus and west to Rey.",
  links: [],
  cites: [W17c("Ghaznavids", "Ghaznavids"), { t: "Ghaznavid dynasty | Empire, Rulers, & History | Britannica", u: "https://www.britannica.com/topic/Ghaznavid-dynasty" }],
});

TL.origin("ghurids", {
  note: "The Ghurids were centered in the hills of Ghor in central Afghanistan. They took Ghazni and in 1186 annexed the last Ghaznavid principality, Lahore, before conquering northern India.",
  links: [],
  cites: [W17c("Ghurid_dynasty", "Ghurid dynasty"), W17c("Ghaznavids", "Ghaznavids"), { t: "Ghurid sultanate | History, Dynasty, & Importance | Britannica", u: "https://www.britannica.com/place/Ghurid-sultanate" }],
});

TL.origin("afsharid", {
  note: "Nader Shah, of Turkoman origin, was regent for the last Safavid shah, Abbas III, then deposed the Safavids and was crowned in 1736, founding the Afsharid dynasty.",
  links: [
    { id: "safavid", how: "successor", note: "Nader deposed the last Safavid rulers and declared himself Shah in 1736" },
  ],
  cites: [W17c("Afsharid_dynasty", "Afsharid dynasty"), W17c("Nader_Shah", "Nader Shah"), { t: "Nadir Shah | Biography, Empire, & Peacock Throne | Britannica", u: "https://www.britannica.com/biography/Nadir-Shah" }],
});

TL.origin("deccan-sultanates", {
  note: "The Deccan sultanates arose when the Bahmani Sultanate broke up: Ahmadnagar was the first to declare independence in 1490, followed by Bijapur and Berar that year, then Bidar and Golconda.",
  links: [],
  cites: [W17c("Deccan_sultanates", "Deccan sultanates"), { t: "Bahmani sultanate | India, Map, & History | Britannica", u: "https://www.britannica.com/place/Bahmani-sultanate" }],
});
