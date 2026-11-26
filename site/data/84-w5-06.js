// Fill-in W5-06: 1000 BCE – 1000 CE — Ife, Kush, Nok, Tichitt, Chola, Ghurids, Gupta (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const HOLL = { t: "Coping with uncertainty: Neolithic life in the Dhar Tichitt-Walata, Mauritania (Holl, Comptes Rendus Géoscience, 2009)", u: "https://comptes-rendus.academie-sciences.fr/geoscience/articles/en/10.1016/j.crte.2009.04.005/" };
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });

TL.add({ events: [
  // ---------- Kush ----------
  { id: "w506-taharqa-reign", branch: "kush", y: -690, end: -664, when: "reigned 690–664 BCE", title: "Taharqa rules Egypt and Kush and builds at Napata",
    text: "The fourth king of Egypt's 25th Dynasty built Egyptian-style temples at Napata and was buried under the largest pyramid at Nuri.", imp: 2,
    cites: [B("biography/Taharqa", "Taharqa"), B("place/Napata", "Napata")] },
  { id: "w506-esarhaddon-memphis", branch: "kush", y: -671, when: "671 BCE", title: "Esarhaddon defeats Taharqa and seizes Memphis", link: "assyria",
    text: "Assyria's king Esarhaddon beat Taharqa's army, captured Memphis and set up an Assyrian administration. Taharqa returned after the Assyrians withdrew, but was later routed by Ashurbanipal and fled to Nubia.", imp: 2,
    cites: [B("biography/Taharqa", "Taharqa"), B("place/Napata", "Napata")] },
  { id: "w506-napata-sacked-meroe", branch: "kush", y: -592, when: "c. 592 BCE", title: "Psamtik II sacks Napata; Meroë becomes the capital", link: "egypt",
    text: "An Egyptian expedition of Greek and Carian mercenaries sacked Napata, and Kush's capital moved some 150 miles southeast to Meroë. Napata stayed the religious center; dates of 590–591 BCE also appear.", imp: 2,
    cites: [B("place/Napata", "Napata"), B("place/Meroe", "Meroe"), W("Kingdom_of_Kush", "Kingdom of Kush")] },
  { id: "w506-meroe-pyramids", branch: "kush", y: -300, end: 300, when: "c. 300 BCE – c. 300 CE", title: "Meroë's royal pyramids are built",
    text: "After royal burials at Nuri ended around 315 BCE, Kush's rulers and elites were buried under steep-sided pyramids at Meroë. At least 147 pyramids stand there, many under 30 meters tall; UNESCO listed the site in 2011.", imp: 2,
    cites: [W("Pyramids_of_Meroë", "Pyramids of Meroë"), B("place/Napata", "Napata"), B("place/Meroe", "Meroe")] },
  { id: "w506-meroitic-script", branch: "kush", y: -200, when: "from c. 200 BCE (3rd century BCE by some)", title: "Kush writes its own language in the Meroitic script",
    text: "Meroitic was written in two scripts: a cursive derived from Demotic and a hieroglyphic one for royal and religious texts. The signs can be read, but the language is still poorly understood.", imp: 2,
    cites: [B("topic/Meroitic-language", "Meroitic language"), W("Meroitic_script", "Meroitic script")] },
  { id: "w506-amanirenas-rome", branch: "kush", y: -25, end: -22, when: "25–22 BCE", title: "Queen Amanirenas fights Rome", link: "roman-empire",
    text: "While Rome's governor was away, Kushite forces took Syene, Elephantine and Philae and toppled Augustus's statues. Rome's Petronius sacked Napata in 22 BCE, but Augustus then imposed no further tribute, and Meroë survived.", imp: 2,
    cites: [W("Amanirenas", "Amanirenas"), W("Meroë", "Meroë"), B("place/Meroe", "Meroe")] },
  { id: "w506-aksum-meroe", branch: "kush", y: 330, when: "c. 320–350 CE (debated)", title: "Aksum's armies overrun Meroë", link: "aksum",
    text: "Meroë, already in decline from raiding peoples, fell to Aksumite armies, probably under Ella-Amida. Britannica ends that reign about 320–325; Wikipedia dates Meroë's destruction to 350. The Aksumite presence was likely short-lived.", imp: 2,
    cites: [B("place/Meroe", "Meroe"), W("Meroë", "Meroë"), W("Kingdom_of_Kush", "Kingdom of Kush")] },

  // ---------- Nok ----------
  { id: "w506-nok-ends", branch: "nok", y: -1, when: "c. 1 BCE (Wikipedia); Britannica gives c. 200 CE", title: "The Nok figurine culture fades",
    text: "Nok sites on Nigeria's Benue Plateau, known for terracotta figures and iron tools, are dated about 1500 BCE to 1 BCE in one account and about 500 BCE to 200 CE in another. Why the culture ended is not settled.", imp: 3,
    cites: [B("topic/Nok-culture", "Nok culture"), W("Nok_culture", "Nok culture")] },

  // ---------- Tichitt ----------
  { id: "w506-tichitt-late", branch: "tichitt", y: -1000, end: -400, when: "c. 1000–400 BCE", title: "Late Tichitt: aridity and population decline",
    text: "As the Sahara dried, the Tichitt-Oualata region saw intense aridification and falling population. Holl dates an intense arid spell around the mid-first millennium BCE that triggered the collapse of the farming-herding system.", imp: 3,
    cites: [W("Dhar_Tichitt", "Dhar Tichitt"), HOLL] },
  { id: "w506-tichitt-abandoned", branch: "tichitt", y: -300, when: "c. 400–300 BCE", title: "The Tichitt plateau settlements are abandoned", link: "ghana",
    text: "Stone-walled plateau settlements built from about 1400 BCE were deserted by about 300 BCE, probably gradually, as small groups moved south. The displaced populations are linked to the later rise of Ghana.", imp: 3,
    cites: [W("Dhar_Tichitt", "Dhar Tichitt"), HOLL] },

  // ---------- Ife ----------
  { id: "w506-ife-emporium", branch: "ife", y: 900, when: "by c. 900 CE", title: "Ife becomes an important West African emporium",
    text: "Wikipedia says that by about 900 the city, founded between 1000 and 500 BCE, had become a West African emporium producing sophisticated art. Britannica says that by the early 11th century it was the capital of a well-established kingdom.", imp: 3,
    cites: [W("Ife", "Ife"), B("place/Ile-Ife", "Ile-Ife")] },

  // ---------- Chola ----------
  { id: "w506-vijayalaya", branch: "chola", y: 850, when: "c. 850–870 CE (dynasty dated from 848)", title: "Vijayalaya begins the Chola revival in Pallava lands",
    text: "Vijayalaya started occupying the Pallavas' territory, and his son Aditya I expanded it. This laid the base of the medieval Chola state.", imp: 2,
    cites: [B("topic/Chola-dynasty", "Chola dynasty"), W("Chola_dynasty", "Chola dynasty")] },
  { id: "w506-parantaka-madurai", branch: "chola", y: 926, end: 942, when: "926–942 CE", title: "Parantaka I, “destroyer of Madurai,” unites Chola and Pandya lands",
    text: "Parantaka I (reigned 907–c. 955) defeated Sinhalese invaders and joined the Chola and Pandya lands. He took Nellore from the Rashtrakutas, whose king Krishna III later stopped his advance.", imp: 2,
    cites: [B("biography/Parantaka-I", "Parantaka I"), B("topic/Chola-dynasty", "Chola dynasty")] },
  { id: "w506-takkolam", branch: "chola", y: 949, when: "948–949 CE", title: "Battle of Takkolam: Cholas defeated by the Rashtrakutas",
    text: "Rashtrakuta forces under Krishna III defeated a Chola army at Takkolam, and the Chola crown prince Rajaditya died in the fight. Krishna III went on to occupy Kanchi and much of the Tamil plains, Britannica says.", imp: 3,
    cites: [W("Battle_of_Takkolam", "Battle of Takkolam"), B("topic/Rashtrakuta-dynasty", "Rashtrakuta dynasty"), B("biography/Parantaka-I", "Parantaka I")] },

  // ---------- Ghurids ----------
  { id: "w506-banji", branch: "ghurids", y: 786, when: "late 8th century (traditional; dynasty dated from 786)", title: "Tradition: caliph Harun al-Rashid backs Ghurid ancestor Banji",
    text: "Tradition names Amir Banji as ancestor of the Ghurids and says the Abbasid caliph Harun al-Rashid legitimized his rule in Ghor. Firm history begins only in the early 11th century, when Ghor was still a pagan enclave.", imp: 3,
    cites: [W("Ghurid_dynasty", "Ghurid dynasty"), { t: "Ghurids — Encyclopaedia Iranica", u: "https://iranicaonline.org/articles/ghurids" }] },

  // ---------- Gupta ----------
  { id: "w506-chandragupta-i", branch: "gupta", y: 320, when: "c. 319–320", title: "Chandragupta I begins the Gupta empire",
    text: "The grandson of Sri Gupta, Chandragupta I extended the family kingdom and allied with the Lichchhavis by marrying Kumaradevi. He is considered the empire's founder; some historians date his accession to 319–320, the Gupta era's start.", imp: 2,
    cites: [B("topic/Gupta-dynasty", "Gupta dynasty"), W("Gupta_Empire", "Gupta Empire")] },
  { id: "w506-allahabad-pillar", branch: "gupta", y: 350, when: "c. 350 CE", title: "Samudragupta's conquests are inscribed on the Allahabad Pillar",
    text: "The court poet Harishena composed a Sanskrit eulogy of Samudragupta's campaigns, carved on an older Ashoka pillar. It is the most important historical document of the Gupta age.", imp: 2,
    cites: [W("Allahabad_Pillar", "Allahabad Pillar"), B("biography/Samudra-Gupta", "Samudragupta")] },
  { id: "w506-samudragupta-harp-coin", branch: "gupta", y: 355, when: "4th century CE, reign of Samudragupta", title: "Samudragupta issues gold coins, one showing him playing the harp",
    text: "Pictured as a warrior, poet and musician, Samudragupta issued high-quality gold coins. One commemorated his horse sacrifice and another showed him with a harp.", imp: 3,
    cites: [B("biography/Samudra-Gupta", "Samudragupta")] },
  { id: "w506-chandragupta-ii-shakas", branch: "gupta", y: 388, end: 409, when: "388–409 CE", title: "Chandragupta II conquers the Shaka lands of western India",
    text: "He subjugated Gujarat, Saurashtra and Malwa, ruled by Shaka chiefs, and issued silver coins with the title Vikramaditya. His court included Kalidasa and the astronomer Varahamihira, according to Britannica.", imp: 2,
    cites: [B("biography/Chandra-Gupta-II", "Chandragupta II"), W("Gupta_Empire", "Gupta Empire")] },
  { id: "w506-kalidasa", branch: "gupta", y: 400, when: "4th–5th century CE (dating uncertain)", title: "Kalidasa writes Shakuntala and the Meghaduta",
    text: "Sanskrit's best-known poet and dramatist likely lived under the Guptas. His play Abhijnanashakuntala is usually judged the finest Indian literary work of any period; the Raghuvamsha and the Meghaduta are also his.", imp: 2,
    cites: [B("biography/Kalidasa", "Kalidasa"), W("Kalidasa", "Kalidasa")] },
  { id: "w506-iron-pillar", branch: "gupta", y: 420, when: "early 5th century CE", title: "The iron pillar later moved to Delhi is raised",
    text: "A rust-resistant iron pillar of over six tonnes carries a Sanskrit verse praising a king Chandra, likely Chandragupta II, and was dedicated to Vishnu. Its original site is debated.", imp: 2,
    cites: [B("topic/Iron-Pillar-of-Delhi", "Iron Pillar of Delhi"), W("Iron_pillar_of_Delhi", "Iron pillar of Delhi")] },
  { id: "w506-ajanta-vakataka", branch: "gupta", y: 460, end: 480, when: "5th–6th century (some scholars: c. 460–480)", title: "Ajanta's richest caves are added in the Gupta era",
    text: "UNESCO says many richly decorated caves were added in the Gupta period, under the Vakataka dynasty and its feudatories. Some scholars place most of the work in 460–480, under Harishena. The site was listed in 1983.", imp: 2,
    cites: [{ t: "Ajanta Caves — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/242/" }, B("place/Ajanta-Caves", "Ajanta Caves"), W("Ajanta_Caves", "Ajanta Caves")] },
  { id: "w506-skandagupta-huns", branch: "gupta", y: 455, when: "c. 455 CE", title: "Skandagupta repels a Huna attack",
    text: "He repelled a Huna attack around 455, but the cost of the wars drained the empire. Britannica says repeated Huna invasions brought its gradual decline after his reign (454–467).", imp: 2,
    cites: [W("Gupta_Empire", "Gupta Empire"), B("topic/Gupta-dynasty", "Gupta dynasty")] },
  { id: "w506-last-gupta-inscription", branch: "gupta", y: 543, when: "542/543 CE", title: "The last known Gupta inscription",
    text: "Vishnugupta's Damodarpur copper-plate is the last known Gupta inscription. The Alchon Huns had broken through in the northwest in the late 490s; Vishnugupta, the last recognized ruler of the main line, reigned to about 550.", imp: 3,
    cites: [W("Gupta_Empire", "Gupta Empire"), B("topic/Gupta-dynasty", "Gupta dynasty")] },
] });

TL.geo("w506-taharqa-reign", { scope: "place", lat: 18.53, lon: 31.84, r: 60, label: "Jebel Barkal and Napata, Sudan", src: "https://en.wikipedia.org/wiki/Napata" });
TL.geo("w506-esarhaddon-memphis", { scope: "place", lat: 29.85, lon: 31.25, r: 60, label: "Memphis, Egypt", src: "https://en.wikipedia.org/wiki/Memphis,_Egypt" });
TL.geo("w506-napata-sacked-meroe", { scope: "place", lat: 18.53, lon: 31.84, r: 60, label: "Napata, Sudan", src: "https://en.wikipedia.org/wiki/Napata" });
TL.geo("w506-meroe-pyramids", { scope: "place", lat: 16.93, lon: 33.73, r: 50, label: "Meroë, Sudan", src: "https://en.wikipedia.org/wiki/Meroë" });
TL.geo("w506-meroitic-script", { scope: "place", lat: 16.93, lon: 33.73, r: 50, label: "Meroë, Sudan", src: "https://en.wikipedia.org/wiki/Meroë" });
TL.geo("w506-amanirenas-rome", { scope: "place", lat: 24.09, lon: 32.9, r: 80, label: "Aswan (Syene), Egypt", src: "https://en.wikipedia.org/wiki/Aswan" });
TL.geo("w506-aksum-meroe", { scope: "place", lat: 16.93, lon: 33.73, r: 50, label: "Meroë, Sudan", src: "https://en.wikipedia.org/wiki/Meroë" });
TL.geo("w506-nok-ends", { scope: "region", lat: 9.57, lon: 9.08, r: 250, label: "Benue Plateau, Nigeria", src: "https://en.wikipedia.org/wiki/Jos_Plateau" });
TL.geo("w506-tichitt-late", { scope: "region", lat: 18.44, lon: -9.49, r: 200, label: "Dhar Tichitt, Mauritania", src: "https://en.wikipedia.org/wiki/Tichitt" });
TL.geo("w506-tichitt-abandoned", { scope: "region", lat: 18.44, lon: -9.49, r: 200, label: "Dhar Tichitt, Mauritania", src: "https://en.wikipedia.org/wiki/Tichitt" });
TL.geo("w506-ife-emporium", { scope: "place", lat: 7.48, lon: 4.56, r: 40, label: "Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("w506-vijayalaya", { scope: "place", lat: 10.79, lon: 79.14, r: 60, label: "Thanjavur, India", src: "https://en.wikipedia.org/wiki/Thanjavur" });
TL.geo("w506-parantaka-madurai", { scope: "place", lat: 9.93, lon: 78.12, r: 60, label: "Madurai, India", src: "https://en.wikipedia.org/wiki/Madurai" });
TL.geo("w506-takkolam", { scope: "place", lat: 13.02, lon: 79.73, r: 40, label: "Takkolam, Tamil Nadu", src: "https://en.wikipedia.org/wiki/Takkolam" });
TL.geo("w506-banji", { scope: "region", lat: 34, lon: 65, r: 150, label: "Ghor, Afghanistan", src: "https://en.wikipedia.org/wiki/Ghor_Province" });
TL.geo("w506-chandragupta-i", { scope: "place", lat: 25.59, lon: 85.14, r: 60, label: "Pataliputra (Patna), India", src: "https://en.wikipedia.org/wiki/Patna" });
TL.geo("w506-allahabad-pillar", { scope: "place", lat: 25.44, lon: 81.85, r: 40, label: "Prayagraj, India", src: "https://en.wikipedia.org/wiki/Prayagraj" });
TL.geo("w506-samudragupta-harp-coin", { scope: "region", lat: 25.6, lon: 82.0, r: 600, label: "Gupta heartland, northern India", src: "https://en.wikipedia.org/wiki/Gupta_Empire" });
TL.geo("w506-chandragupta-ii-shakas", { scope: "place", lat: 23.17, lon: 75.79, r: 150, label: "Ujjain, India", src: "https://en.wikipedia.org/wiki/Ujjain" });
TL.geo("w506-kalidasa", { scope: "place", lat: 23.17, lon: 75.79, r: 80, label: "Ujjain, India", src: "https://en.wikipedia.org/wiki/Ujjain" });
TL.geo("w506-iron-pillar", { scope: "place", lat: 28.52, lon: 77.18, r: 30, label: "Qutb complex, Mehrauli, Delhi", src: "https://en.wikipedia.org/wiki/Qutb_complex" });
TL.geo("w506-ajanta-vakataka", { scope: "place", lat: 20.55, lon: 75.7, r: 40, label: "Ajanta Caves, Maharashtra", src: "https://en.wikipedia.org/wiki/Ajanta_Caves" });
TL.geo("w506-skandagupta-huns", { scope: "region", lat: 30.0, lon: 72.0, r: 700, label: "Northwest India", src: "https://en.wikipedia.org/wiki/Gupta_Empire" });
TL.geo("w506-last-gupta-inscription", { scope: "place", lat: 25.2, lon: 89.0, r: 100, label: "Damodarpur, Bengal", src: "https://en.wikipedia.org/wiki/Gupta_Empire" });
