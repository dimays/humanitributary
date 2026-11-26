// Origins (parents/links) for East and Southeast Asia branches, plus the new branch dutch-east-indies.
TL.add({ branches: [
  { id: "dutch-east-indies", name: "Dutch East Indies", region: "eastasia", start: 1800, end: 1949.99,
    startWhen: "1800 (Dutch state takes over the bankrupt VOC's possessions)", endWhen: "December 27, 1949 (Dutch recognition of Indonesian sovereignty)",
    parents: ["dutch-republic"], into: ["indonesia"],
    text: "Dutch colony in the archipelago, run from Batavia. Japan occupied it in 1942; after the 1945 declaration of independence, the Netherlands recognized Indonesian sovereignty in December 1949, except Western New Guinea.",
    cites: [{ t: "Dutch East Indies - Wikipedia", u: "https://en.wikipedia.org/wiki/Dutch_East_Indies" }, { t: "Dutch East Indies | Map, Location, World War II, History, & Facts | Britannica", u: "https://www.britannica.com/place/Dutch-East-Indies" }] }
] });
TL.geo("dutch-east-indies", { scope: "region", lat: -5, lon: 120, r: 2300, label: "Dutch East Indies", src: "https://en.wikipedia.org/wiki/Dutch_East_Indies" });

TL.origin("srivijaya", {
  note: "A Malay-speaking maritime kingdom founded near Palembang on the Musi River; Chinese sources mention an older kingdom, Kantoli, that could be considered its predecessor. The Kedukan Bukit inscription (682) names its first ruler.",
  links: [
    { id: "austronesian-expansion", how: "peoples", note: "Its people spoke Malay, an Austronesian language; its inscriptions are in Old Malay" },
  ],
  cites: [{ t: "Srivijaya - Wikipedia", u: "https://en.wikipedia.org/wiki/Srivijaya" }, { t: "Old Malay - Wikipedia", u: "https://en.wikipedia.org/wiki/Old_Malay" }, { t: "Srivijaya empire | History, Location, Religion, Government, & Map | Britannica", u: "https://www.britannica.com/place/Srivijaya-empire" }],
});
TL.origin("majapahit", {
  note: "Founded by Raden Wijaya, son-in-law of Kertanagara, last king of the Javanese kingdom of Singhasari, after Kertanagara was killed by Jayakatwang. Wijaya used a Yuan Mongol expedition against Jayakatwang, then drove it out; he was crowned in 1293.",
  links: [
    { id: "singhasari", how: "successor", note: "Raden Wijaya, Kertanegara's son-in-law, founded Majapahit after Singhasari fell in 1292" },
  ],
  cites: [{ t: "Majapahit - Wikipedia", u: "https://en.wikipedia.org/wiki/Majapahit" }, { t: "Singhasari - Wikipedia", u: "https://en.wikipedia.org/wiki/Singhasari" }, { t: "Majapahit empire | Maritime trade, Hinduism, Buddhism | Britannica", u: "https://www.britannica.com/place/Majapahit-empire" }],
});
TL.origin("ayutthaya", {
  note: "Grew from a mandala of four city-states of the lower Chao Phraya valley (Ayodhya, Lavo, Phrip Phri, Suphannaphum), whose Tai-speaking population absorbed Khmer and Mon influences. Uthong, whose identity is disputed, united them c. 1351.",
  links: [],
  cites: [{ t: "Ayutthaya Kingdom - Wikipedia", u: "https://en.wikipedia.org/wiki/Ayutthaya_Kingdom" }, { t: "Ayutthaya | kingdom, Thailand | Britannica", u: "https://www.britannica.com/place/Ayutthaya-kingdom-Thailand" }],
});
TL.origin("xiongnu", {
  note: "The Xiongnu's origins are debated. Genetic research points to the Slab Grave culture of Mongolia as primary ancestors; Chinese writers named Rong tribes as possible forebears. Modu unified the tribes into a confederation after 209 BCE.",
  links: [],
  cites: [{ t: "Xiongnu - Wikipedia", u: "https://en.wikipedia.org/wiki/Xiongnu" }, { t: "Xiongnu | People & History | Britannica", u: "https://www.britannica.com/topic/Xiongnu" }],
});
TL.origin("korea-three-kingdoms", {
  note: "Rose after Han China destroyed Gojoseon in 108 BCE and set up commanderies. Goguryeo emerged along the Yalu River; Baekje and Silla grew from the Mahan and Jinhan confederacies of small polities. Buyeo myths likely lie behind Goguryeo and Baekje.",
  links: [
    { id: "gojoseon", how: "successor", note: "Buyeo and the Samhan, successors of broken-up Gojoseon, gave rise to the kingdoms" },
    { id: "han", how: "context", note: "Han conquered Gojoseon in 108 BCE and set up the Four Commanderies" },
  ],
  cites: [{ t: "Three Kingdoms of Korea - Wikipedia", u: "https://en.wikipedia.org/wiki/Three_Kingdoms_of_Korea" }, { t: "Gojoseon - Wikipedia", u: "https://en.wikipedia.org/wiki/Gojoseon" }, { t: "Three Kingdoms period | Korea, History, Silla, Goguryeo, & Baekje | Britannica", u: "https://www.britannica.com/topic/Three-Kingdoms-period" }],
});
TL.origin("song", {
  note: "Founded in 960 when Emperor Taizu took the throne of the Later Zhou, one of the Five Dynasties. He then spent sixteen years conquering the rest of China proper, reuniting much of the former Han and Tang territory and ending the Five Dynasties and Ten Kingdoms era.",
  links: [
    { id: "tang", how: "successor", note: "Song reunified much of the former Han and Tang territory after the Five Dynasties era" },
  ],
  cites: [{ t: "Song dynasty - Wikipedia", u: "https://en.wikipedia.org/wiki/Song_dynasty" }, { t: "Song dynasty | Chinese History, Art & Culture | Britannica", u: "https://www.britannica.com/topic/Song-dynasty" }],
});
TL.origin("mongol-empire", {
  note: "Mongol predecessors moved onto the Mongolian Plateau in the late 10th century. Temüjin, born c. 1162, defeated rival tribes (Tatars, Naimans) and was proclaimed Genghis Khan of the Great Mongol Nation at a kurultai in 1206.",
  links: [],
  cites: [{ t: "Mongol Empire - Wikipedia", u: "https://en.wikipedia.org/wiki/Mongol_Empire" }, { t: "Mongol empire | Origins, Organization, History, Map, & Legacy | Britannica", u: "https://www.britannica.com/topic/Mongol-empire" }],
});
TL.origin("khmer", {
  note: "Grew out of the earlier civilization of Chenla. Jayavarman II, ruling a realm called Kambuja by 790, proclaimed himself universal ruler in 802; inscriptions say he declared independence from “Java,” whose meaning scholars debate.",
  links: [
    { id: "chenla", how: "successor", note: "Jayavarman II, ruling Land Chenla, proclaimed the Khmer Empire in 802" },
  ],
  cites: [{ t: "Khmer Empire - Wikipedia", u: "https://en.wikipedia.org/wiki/Khmer_Empire" }, { t: "Chenla - Wikipedia", u: "https://en.wikipedia.org/wiki/Chenla" }, { t: "Khmer empire | History, Map, Notable Sites, & Facts | Britannica", u: "https://www.britannica.com/place/Khmer-empire" }],
});
TL.origin("french-indochina", {
  note: "France combined the protectorates of Annam, Tonkin, Cochinchina and Cambodia into one federation on October 17, 1887, then added Laos in 1899. Nguyen emperors kept their titles in Annam and Tonkin but the French held real power.",
  links: [
    { id: "france", how: "conquest", note: "France won Cochinchina and Tonkin in the 1860s and 1880s and ruled Indochina as a federation" },
  ],
  cites: [{ t: "French Indochina - Wikipedia", u: "https://en.wikipedia.org/wiki/French_Indochina" }, { t: "Vietnam - French Colonization, Indochina, Unification | Britannica", u: "https://www.britannica.com/place/Vietnam/The-conquest-of-Vietnam-by-France" }],
});
TL.origin("indonesia", {
  note: "Sukarno and Hatta declared independence from the Dutch East Indies colony in August 1945, after Japan's wartime occupation. A four-and-a-half-year conflict followed, and the Netherlands recognized Indonesian sovereignty in December 1949.",
  links: [
    { id: "dutch-east-indies", how: "independence", note: "Declared independence August 1945; Dutch recognized sovereignty December 1949" },
  ],
  cites: [{ t: "Dutch East Indies - Wikipedia", u: "https://en.wikipedia.org/wiki/Dutch_East_Indies" }, { t: "Indonesia | History, Flag, Map, Capital, Language, Religion, & Facts | Britannica", u: "https://www.britannica.com/place/Indonesia" }],
});
TL.origin("malaysia", {
  note: "Formed on September 16, 1963, when the Federation of Malaya, independent from the United Kingdom since August 31, 1957, joined with Singapore, North Borneo (Sabah) and Sarawak. Singapore separated in August 1965.",
  links: [
    { id: "uk", how: "independence", note: "The Federation of Malaya became independent from Britain on August 31, 1957" },
  ],
  cites: [{ t: "Malaysia - Wikipedia", u: "https://en.wikipedia.org/wiki/Malaysia" }, { t: "Malaysia | History, Flag, Map, Population, Language, Religion, & Facts | Britannica", u: "https://www.britannica.com/place/Malaysia" }],
});
TL.origin("asean", {
  note: "Grew from the Association of Southeast Asia (1961: Thailand, the Philippines, Malaya). The ASEAN Declaration, signed in Bangkok on August 8, 1967 by Indonesia, Malaysia, the Philippines, Singapore and Thailand, was originally aimed at containing communism.",
  links: [
    { id: "indonesia", how: "merger", note: "Founding member; signed the 1967 ASEAN Declaration" },
    { id: "malaysia", how: "merger", note: "Founding member; signed the 1967 ASEAN Declaration" },
    { id: "philippines", how: "merger", note: "Founding member; signed the 1967 ASEAN Declaration" },
    { id: "singapore", how: "merger", note: "Founding member; signed the 1967 ASEAN Declaration" },
  ],
  cites: [{ t: "ASEAN - Wikipedia", u: "https://en.wikipedia.org/wiki/ASEAN" }, { t: "ASEAN | Definition, History, Economics, & Facts | Britannica", u: "https://www.britannica.com/topic/ASEAN" }],
});
