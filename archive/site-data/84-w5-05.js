// Fill-in W5-05: 1000 BCE – 1000 CE — West Francia, Aksum, Bantu expansion, Dʿmt, Ghana Empire and Ife (about a third cultural). Cites were fetched and read while writing; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const H = (slug, title) => ({ t: `${title} — World History Encyclopedia`, u: `https://www.worldhistory.org/${slug}/` });
const UN = { t: "Aksum — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/15/", k: "museum" };
const MET_ETH = { t: "Ethiopia's Enduring Cultural Heritage — Heilbrunn Timeline of Art History, The Metropolitan Museum of Art", u: "https://www.metmuseum.org/essays/ethiopias-enduring-cultural-heritage", k: "museum" };

TL.add({ events: [
  // ---------- West Francia ----------
  { id: "w505-wf-siege-of-paris", branch: "west-francia", y: 885.9, end: 886.78, when: "November 885 – October 886", title: "Vikings besiege Paris",
    text: "A large Viking fleet reached Paris in late November 885 and demanded tribute. Odo, who held the city, refused despite a small force of perhaps 200 men. The Vikings failed to break through the walls.", imp: 2,
    cites: [B("event/Siege-of-Paris-885-886", "Siege of Paris"), W("Siege_of_Paris_(885%E2%80%93886)", "Siege of Paris (885–886)")] },
  { id: "w505-wf-eulalia", branch: "west-francia", y: 881, when: "c. 880–882", title: "Sequence of Saint Eulalia is composed",
    text: "A short verse sequence honoring the martyr Eulalia of Barcelona was composed in the northern French vernacular soon after 881. It is among the earliest surviving texts in that language; the manuscript, copied around 900, is in Valenciennes.", imp: 3,
    cites: [{ t: "Séquence de sainte Eulalie — Base de français médiéval (BFM), ENS de Lyon / huma-num", u: "https://txm-bfm.huma-num.fr/txm/catalog/eulaliBfm", k: "reference" }, W("Sequence_of_Saint_Eulalia", "Sequence of Saint Eulalia")] },
  { id: "w505-wf-cluny", branch: "west-francia", y: 910, when: "910", title: "Cluny Abbey is founded",
    text: "William I of Aquitaine founded the Benedictine abbey of Cluny in Burgundy, answerable only to the pope. Its strict observance of the Benedictine Rule made it the center of a monastic reform movement.", imp: 2,
    cites: [B("place/Cluny-Abbey", "Cluny Abbey"), W("Cluny_Abbey", "Cluny Abbey")] },
  { id: "w505-wf-soissons-923", branch: "west-francia", y: 923.45, when: "June 15, 923", title: "King Charles the Simple loses at Soissons",
    text: "Rebel nobles under Robert I, whom they had elected king in 922, fought Charles III's army at Soissons. Robert died but his side won; Charles was imprisoned and Robert's son-in-law Rudolph became king.", imp: 2,
    cites: [W("Battle_of_Soissons_(923)", "Battle of Soissons (923)"), B("biography/Charles-III-king-of-France", "Charles III")] },
  { id: "w505-wf-louis-iv", branch: "west-francia", y: 936.47, when: "June 19, 936", title: "Louis IV is recalled from England and crowned",
    text: "After the death of King Rudolph, Hugh the Great invited the exiled Carolingian Louis, son of the captive Charles III, back from England. He was crowned at Laon at age 15 and spent his reign resisting Hugh.", imp: 3,
    cites: [B("biography/Louis-IV-king-of-France", "Louis IV"), W("Louis_IV_of_France", "Louis IV of France")] },
  { id: "w505-wf-hugh-capet", branch: "west-francia", y: 987.5, when: "987", title: "Hugh Capet is elected king",
    text: "After Louis V, the last Carolingian king of West Francia, died childless in May 987, the magnates elected Hugh Capet. His Capetian dynasty ruled France from 987 to 1328 in the direct line, ending Carolingian rule.", imp: 2,
    cites: [B("topic/Capetian-dynasty", "Capetian dynasty"), W("Hugh_Capet", "Hugh Capet")] },

  // ---------- Aksum ----------
  { id: "w505-ak-coinage", branch: "aksum", y: 270, end: 310, when: "c. 270–310 (reign of Endubis; dates vary)", title: "Aksum begins minting coins",
    text: "Aksum began minting its own coins, traditionally under King Endubis, whose reign is dated variously. Coins have been found as far away as southern India. Their weights and designs followed Roman and later Byzantine models.", imp: 2,
    cites: [W("Kingdom_of_Aksum", "Kingdom of Aksum"), MET_ETH, H("Kingdom_of_Axum", "Kingdom of Axum")] },
  { id: "w505-ak-stelae", branch: "aksum", y: 250, end: 400, when: "3rd–4th century CE", title: "Aksum raises its giant granite stelae",
    text: "Royal tombs at Aksum were marked with monolithic stelae carved to resemble multi-story buildings. The largest standing one is over 23 meters tall; the fallen 33-meter one may be the largest monolithic stele ever attempted.", imp: 2,
    cites: [UN, W("Obelisk_of_Axum", "Obelisk of Axum")] },
  { id: "w505-ak-garima", branch: "aksum", y: 390, end: 570, when: "c. 390–570 CE (radiocarbon); tradition c. 500", title: "The Garima Gospels are copied",
    text: "Garima 2 is believed to be the earliest surviving complete illuminated Christian manuscript. Radiocarbon dating puts it between about 390 and 570, and monastic tradition places the two oldest books near 500.", imp: 2,
    cites: [W("Garima_Gospels", "Garima Gospels"), { t: "Navigating a Global Middle Ages through Manuscripts & Cultural Heritage — UCL Art History", u: "https://www.ucl.ac.uk/social-historical-sciences/art-history/research/demarginalizing-medieval-africa-images-texts-and-identity-early-solomonic-ethiopia-1270-1527/2-navigating-global-middle-ages-through-manuscripts-cultural-heritage", k: "reference" }] },
  { id: "w505-ak-himyar-525", branch: "aksum", y: 525, when: "525", title: "Kaleb of Aksum defeats Himyar",
    text: "After Himyar's king Dhu Nuwas massacred Christians at Najran, Aksum's king Kaleb invaded Yemen, backed by Rome, and defeated the Himyarites in 525. Aksumite rule there ended with Persian intervention in the 570s.", imp: 2, link: "byzantine",
    cites: [B("topic/Himyar", "Ḥimyar"), W("Aksumite_invasion_of_Himyar", "Aksumite invasion of Himyar"), W("Kingdom_of_Aksum", "Kingdom of Aksum")] },
  { id: "w505-ak-first-hijra", branch: "aksum", y: 614, when: "613 or 615 CE (sources differ)", title: "Early Muslims take refuge in Aksum",
    text: "Fleeing persecution in Mecca, a group of Muhammad's followers sought and were given refuge by the Christian king of Aksum, known in Islamic sources as the Najashi. It is called the First Hijrah; the date is uncertain.", imp: 2,
    cites: [W("Migration_to_Abyssinia", "Migration to Abyssinia"), B("event/Hijrah-Islam", "Hijrah")] },
  { id: "w505-ak-decline", branch: "aksum", y: 650, end: 800, when: "from the 7th century", title: "Aksum's trade and power decline",
    text: "From the 7th century Muslim Arab traders competed for Red Sea trade, the Persians had taken Yemen, and rivals such as the Beja rose. Aksum's population shrank and its coinage ceased.", imp: 2,
    cites: [H("Kingdom_of_Axum", "Kingdom of Axum"), W("Kingdom_of_Aksum", "Kingdom of Aksum"), UN] },
  { id: "w505-ak-kubar", branch: "aksum", y: 800, when: "after c. 800 (date uncertain)", title: "The capital reportedly moves south to Kubar",
    text: "Aksum's capital is reported to have been relocated south to a site called Kubar, with no firm date. Aksum city was largely abandoned by the end of the 9th century. Details of this shift are poorly documented.", imp: 3,
    cites: [W("Kingdom_of_Aksum", "Kingdom of Aksum"), W("Axum", "Axum"), { t: "Gudit — Encyclopaedia Africana (notes the transfer of the seat of power southwards)", u: "https://encyclopaediaafricana.com/gudit/", k: "reference" }] },
  { id: "w505-ak-gudit", branch: "aksum", y: 960, when: "c. 960 (traditional; dating uncertain)", title: "Queen Gudit is said to destroy Aksum",
    text: "Ethiopian tradition tells of a queen, Gudit or Yodit, who destroyed churches and harried the Aksumite dynasty around 960. Her identity and the details are uncertain, but Aksum's political decline in the 10th century is documented.", imp: 3,
    cites: [W("Gudit", "Gudit"), { t: "Gudit — Encyclopaedia Africana", u: "https://encyclopaediaafricana.com/gudit/", k: "reference" }, UN] },

  // ---------- Bantu expansion ----------
  { id: "w505-bx-angola", branch: "bantu-expansion", y: -500, when: "c. 500 BCE (linguistic estimate)", title: "Western Bantu speakers may reach central Angola",
    text: "Linguistic analysis suggests the Western Stream of the expansion, moving along the coast or the Congo's rivers, reached central Angola around 500 BCE. The oldest pottery found at Benfica in Angola dates to about 200 CE.", imp: 3,
    cites: [W("Bantu_expansion", "Bantu expansion"), { t: "Modelling the Spread of Farming in the Bantu-Speaking Regions of Africa — PLOS ONE", u: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0087854", k: "paper" }] },
  { id: "w505-bx-urewe", branch: "bantu-expansion", y: -500, when: "by c. 500 BCE", title: "Urewe pottery appears around Lake Victoria",
    text: "Distinctive Urewe pottery shows Bantu-speaking farmers west of Lake Victoria by 500 BCE. The Urewe culture, with sophisticated ironworking, lasted into the 6th century CE and carried its tradition south.", imp: 2,
    cites: [W("Bantu_expansion", "Bantu expansion"), W("Urewe", "Urewe"), { t: "Modelling the Spread of Farming in the Bantu-Speaking Regions of Africa — PLOS ONE", u: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0087854", k: "paper" }] },
  { id: "w505-bx-steel", branch: "bantu-expansion", y: 0, end: 450, when: "c. 1,500–2,000 years ago (estimates vary)", title: "Haya ancestors smelt carbon steel in Tanzania",
    text: "A 1978 study found that the Haya of northwestern Tanzania and their forebears, 1,500 to 2,000 years ago, used preheated-air furnaces that produced carbon steel. Other accounts put Great Lakes steel in the first century BCE.", imp: 3,
    cites: [{ t: "Complex Iron Smelting and Prehistoric Culture in Tanzania — Science (abstract via Europe PMC)", u: "https://doi.org/10.1126/science.201.4361.1085", k: "paper" }, W("Bantu_expansion", "Bantu expansion")] },
  { id: "w505-bx-coast", branch: "bantu-expansion", y: -100, end: 300, when: "c. 100 BCE – 300 CE", title: "Bantu farmers settle the East African coast",
    text: "Archaeology shows Bantu-speaking communities at Misasa in Tanzania and Kwale in Kenya between about 100 BCE and 300 CE. East Bantu peoples later moved south toward Zimbabwe, Botswana and Mozambique.", imp: 2,
    cites: [W("Bantu_expansion", "Bantu expansion"), H("Bantu_Migration", "Bantu Migration")] },
  { id: "w505-bx-limpopo", branch: "bantu-expansion", y: 500, when: "by c. 500 CE", title: "Bantu speakers reach Limpopo Province",
    text: "Pioneering groups had reached KwaZulu-Natal along the coast by about 300 CE and the Limpopo Province by about 500 CE, near the southern limit of the expansion.", imp: 3,
    cites: [W("Bantu_expansion", "Bantu expansion"), { t: "Modelling the Spread of Farming in the Bantu-Speaking Regions of Africa — PLOS ONE", u: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0087854", k: "paper" }] },

  // ---------- Dʿmt ----------
  { id: "w505-dm-yeha-temple", branch: "dmt", y: -700, when: "c. 700 BCE", title: "The Great Temple of Yeha is built",
    text: "A temple in Sabaean style rose at Yeha, probably Dʿmt's capital. Dated to about the 7th century BCE, it is the earliest surviving structure in sub-Saharan Africa, according to UNESCO.", imp: 2,
    cites: [W("Yeha", "Yeha"), W("D%CA%BFmt", "Dʿmt"), { t: "The Cultural Heritage of Yeha — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/tentativelists/6477/", k: "reference" }] },
  { id: "w505-dm-proto-aksum", branch: "dmt", y: -400, when: "by the 4th century BCE", title: "A Proto-Aksumite polity rises as Dʿmt fades",
    text: "Radiometric dates from Betä Giyorgis show a Proto-Aksumite polity in northern Tigray by the 4th century BCE, suggesting Dʿmt was already in decline. Yeha's monumental buildings were abandoned.", imp: 3,
    cites: [W("D%CA%BFmt", "Dʿmt"), H("Kingdom_of_Axum", "Kingdom of Axum")] },

  // ---------- Ghana Empire ----------
  { id: "w505-gh-trade-rise", branch: "ghana-empire", y: 650, when: "from the 6th or 7th century", title: "Ghana comes to dominate trade on the upper Niger",
    text: "Ghana's rulers controlled iron, copper and gold, and used camels, to dominate trade in the upper Niger valley from the 6th or 7th century. Written sources are scarce, and the details remain uncertain.", imp: 3,
    cites: [H("Ghana_Empire", "Ghana Empire"), W("Ghana_Empire", "Ghana Empire")] },
  { id: "w505-gh-masudi", branch: "ghana-empire", y: 940, when: "first half of the 10th century", title: "Al-Masudi calls Ghana's king supreme",
    text: "Writing in the first half of the 10th century, the Arab historian al-Masudi described Ghana's king as supreme over vassal rulers and the kingdom as important because of its gold trade.", imp: 3,
    cites: [W("Ghana_Empire", "Ghana Empire"), B("biography/al-Masudi", "al-Masudi")] },
  { id: "w505-gh-hawqal", branch: "ghana-empire", y: 980, when: "late 10th century (c. 977–988)", title: "Ibn Hawqal: the wealthiest king on earth",
    text: "The geographer Ibn Hawqal wrote in the late 10th century that the king of Ghana was the “wealthiest king on the face of the earth.” Control of the gold trade lay behind Ghana's wealth.", imp: 2,
    cites: [W("Ghana_Empire", "Ghana Empire"), B("place/Ghana-historical-West-African-empire", "Ghana")] },

  // ---------- Ife ----------
  { id: "w505-if-hamlets", branch: "ife", y: 550, when: "c. 6th century CE", title: "Ife begins as a cluster of thirteen hamlets",
    text: "The Met traces Ife's origins to the sixth century, when it began as about thirteen hamlets. By the 11th century it had grown into a large walled city of palaces, workshops and shrines.", imp: 3,
    cites: [{ t: "Ife (from ca. 6th Century) — Heilbrunn Timeline of Art History, The Metropolitan Museum of Art", u: "https://www.metmuseum.org/essays/ife-from-ca-6th-century", k: "museum" }, H("Ife", "Ife")] },
] });

TL.geo("w505-wf-siege-of-paris", { scope: "place", lat: 48.86, lon: 2.35, r: 50, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w505-wf-eulalia", { scope: "place", lat: 50.36, lon: 3.52, r: 40, label: "Valenciennes, France", src: "https://en.wikipedia.org/wiki/Valenciennes" });
TL.geo("w505-wf-cluny", { scope: "place", lat: 46.43, lon: 4.66, r: 40, label: "Cluny, France", src: "https://en.wikipedia.org/wiki/Cluny_Abbey" });
TL.geo("w505-wf-soissons-923", { scope: "place", lat: 49.38, lon: 3.32, r: 40, label: "Soissons, France", src: "https://en.wikipedia.org/wiki/Soissons" });
TL.geo("w505-wf-louis-iv", { scope: "place", lat: 49.56, lon: 3.62, r: 40, label: "Laon, France", src: "https://en.wikipedia.org/wiki/Laon" });
TL.geo("w505-wf-hugh-capet", { scope: "region", lat: 47, lon: 2, r: 500, label: "France", src: "https://en.wikipedia.org/wiki/France" });
TL.geo("w505-ak-coinage", { scope: "place", lat: 14.12, lon: 38.73, r: 60, label: "Axum, Ethiopia", src: "https://en.wikipedia.org/wiki/Axum" });
TL.geo("w505-ak-stelae", { scope: "place", lat: 14.12, lon: 38.73, r: 60, label: "Axum, Ethiopia", src: "https://en.wikipedia.org/wiki/Axum" });
TL.geo("w505-ak-garima", { scope: "place", lat: 14.12, lon: 38.73, r: 60, label: "Axum, Ethiopia", src: "https://en.wikipedia.org/wiki/Axum" });
TL.geo("w505-ak-himyar-525", { scope: "region", lat: 15.35, lon: 44.21, r: 700, label: "Yemen (Himyar)", src: "https://en.wikipedia.org/wiki/Yemen" });
TL.geo("w505-ak-first-hijra", { scope: "place", lat: 14.12, lon: 38.73, r: 60, label: "Axum, Ethiopia", src: "https://en.wikipedia.org/wiki/Axum" });
TL.geo("w505-ak-decline", { scope: "region", lat: 14.12, lon: 38.73, r: 400, label: "Aksum and the Red Sea coast", src: "https://en.wikipedia.org/wiki/Axum" });
TL.geo("w505-ak-kubar", { scope: "region", lat: 9, lon: 39, r: 400, label: "Northern Ethiopia", src: "https://en.wikipedia.org/wiki/Ethiopia" });
TL.geo("w505-ak-gudit", { scope: "place", lat: 14.12, lon: 38.73, r: 60, label: "Axum, Ethiopia", src: "https://en.wikipedia.org/wiki/Axum" });
TL.geo("w505-bx-angola", { scope: "region", lat: -12.5, lon: 18.5, r: 600, label: "Central Angola", src: "https://en.wikipedia.org/wiki/Angola" });
TL.geo("w505-bx-urewe", { scope: "region", lat: -1, lon: 33, r: 400, label: "Lake Victoria region", src: "https://en.wikipedia.org/wiki/Lake_Victoria" });
TL.geo("w505-bx-steel", { scope: "region", lat: -1, lon: 33, r: 400, label: "Lake Victoria region", src: "https://en.wikipedia.org/wiki/Lake_Victoria" });
TL.geo("w505-bx-coast", { scope: "region", lat: -4.17, lon: 39.45, r: 700, label: "Kenya and Tanzania coast", src: "https://en.wikipedia.org/wiki/Kwale_County" });
TL.geo("w505-bx-limpopo", { scope: "region", lat: -24, lon: 29, r: 300, label: "Limpopo Province, South Africa", src: "https://en.wikipedia.org/wiki/Limpopo" });
TL.geo("w505-dm-yeha-temple", { scope: "place", lat: 14.29, lon: 39.02, r: 40, label: "Yeha, Ethiopia", src: "https://en.wikipedia.org/wiki/Yeha" });
TL.geo("w505-dm-proto-aksum", { scope: "region", lat: 14.12, lon: 38.72, r: 250, label: "Tigray, Ethiopia", src: "https://en.wikipedia.org/wiki/Tigray_Region" });
TL.geo("w505-gh-trade-rise", { scope: "region", lat: 15.77, lon: -7.97, r: 700, label: "Ghana Empire (upper Niger and Sahel)", src: "https://en.wikipedia.org/wiki/Koumbi_Saleh" });
TL.geo("w505-gh-masudi", { scope: "region", lat: 15.77, lon: -7.97, r: 700, label: "Ghana Empire (Koumbi Saleh)", src: "https://en.wikipedia.org/wiki/Koumbi_Saleh" });
TL.geo("w505-gh-hawqal", { scope: "region", lat: 15.77, lon: -7.97, r: 700, label: "Ghana Empire (Koumbi Saleh)", src: "https://en.wikipedia.org/wiki/Koumbi_Saleh" });
TL.geo("w505-if-hamlets", { scope: "place", lat: 7.48, lon: 4.56, r: 40, label: "Ile-Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ile-Ife" });
