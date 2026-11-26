// Fill-in W5-02: 1000 BCE – 1000 CE — Judaism, Platonism, Zoroastrianism, Abbasids, Achaemenids, Assyria, Babylonia, Carthage, Egypt, Fatimids, Israel & Judah, Parthia (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });

TL.add({ events: [
  // ---------- Judaism ----------
  { id: "w502-dead-sea-scrolls-copied", branch: "judaism", y: -250, end: 150, when: "3rd century BCE – 2nd century CE", title: "The Dead Sea Scrolls are written and copied",
    text: "Biblical, sectarian and previously unknown Hebrew texts were copied between the 3rd century BCE and the 2nd century CE. Found near Qumran from 1947, they show Judaism's variety before the rabbinic age.", imp: 2,
    cites: [B("topic/Dead-Sea-Scrolls", "Dead Sea Scrolls"), B("place/Qumran", "Qumran")] },
  { id: "w502-jerusalem-talmud", branch: "judaism", y: 400, when: "c. 400 CE (late 4th to early 5th century)", title: "The Jerusalem Talmud is compiled",
    text: "Rabbis of Galilean schools, probably at Tiberias, compiled a Gemara on the Mishnah. It predates the Babylonian Talmud by about a century and is also called the Palestinian Talmud.", imp: 3,
    cites: [W("Jerusalem_Talmud", "Jerusalem Talmud"), B("topic/Jerusalem-Talmud", "Jerusalem Talmud")] },
  { id: "w502-babylonian-talmud", branch: "judaism", y: 500, when: "c. 500 CE (some historians say mid-6th century)", title: "The Babylonian Talmud is completed",
    text: "Tradition credits Rav Ashi and Ravina II with compiling this vast commentary on the Mishnah in Babylonia, c. 500 CE, though it was more likely completed by the mid-6th century. It became rabbinic Judaism's central text.", imp: 2,
    cites: [W("Babylonian_Talmud", "Babylonian Talmud"), B("topic/Jerusalem-Talmud", "Jerusalem Talmud (notes the Babylonian compilation)")] },
  { id: "w502-aleppo-codex", branch: "judaism", y: 930, when: "c. 930 CE", title: "The Aleppo Codex is written and vocalized",
    text: "Solomon ben Buya'a wrote it and Aaron ben Moses ben Asher corrected it, adding Tiberian vowel signs and accents. It is considered the most important witness to the Masoretic tradition of the Hebrew Bible.", imp: 2,
    cites: [B("topic/Aleppo-Codex", "Aleppo Codex")] },

  // ---------- Platonism ----------
  { id: "w502-enneads-edited", branch: "platonism", y: 270, when: "c. 270 CE", title: "Porphyry edits Plotinus's Enneads",
    text: "After Plotinus died, his pupil Porphyry arranged the 54 treatises into six groups of nine and wrote the master's biography. The Enneads became the foundation text of Neoplatonism.", imp: 2,
    cites: [W("Enneads", "Enneads"), B("topic/Enneads", "Enneads"), B("biography/Plotinus", "Plotinus")] },

  // ---------- Zoroastrianism ----------
  { id: "w502-gathas-composed", branch: "zoroastrianism", y: -1000, when: "c. 1500–900 BCE; many scholars say close to 1000 BCE", title: "The Gathas are composed",
    text: "The 16 or 17 hymns attributed to Zarathushtra, in Old Avestan, are the oldest layer of the Avesta. Their date is debated, but a time close to 1000 BCE is considered likely by many scholars.", imp: 2,
    cites: [W("Avesta", "Avesta"), B("topic/Gatha-Zoroastrian-literature", "Gatha")] },
  { id: "w502-behistun-ahuramazda", branch: "zoroastrianism", y: -520, when: "c. 520 BCE (made between 522 and 486 BCE)", title: "Darius credits Ahuramazda on the Behistun Inscription",
    text: "In a trilingual relief Darius I declared that he was king by the grace of Ahuramazda, who had granted him the kingdom. The Old Persian text was key to deciphering cuneiform.", imp: 2, link: "achaemenid",
    cites: [W("Behistun_Inscription", "Behistun Inscription"), B("place/Bisitun", "Bisitun")] },
  { id: "w502-anahita-mithra-inscriptions", branch: "zoroastrianism", y: -380, when: "reign of Artaxerxes II (404–358 BCE)", title: "Artaxerxes II introduces statues of Anahita",
    text: "Artaxerxes II's reign saw a change in Persian religion: worship of the goddess Anahita, shown in statues, was introduced alongside Ahura Mazda and Mithra.", imp: 3, link: "achaemenid",
    cites: [B("biography/Artaxerxes-II", "Artaxerxes II")] },
  { id: "w502-kartir", branch: "zoroastrianism", y: 274, end: 293, when: "274–293 CE (reign of Bahram II)", title: "The priest Kartir becomes supreme judge under Bahram II",
    text: "Bahram II made Kartir supreme judge and steward of the Anahita temple at Istakhr. His inscription claims he struck down other faiths, though historians question how far this was enforced.", imp: 2,
    cites: [W("Kartir", "Kartir")] },
  { id: "w502-avesta-written", branch: "zoroastrianism", y: 500, when: "around the 5th or 6th century CE", title: "The Avesta is first written down",
    text: "After centuries of oral transmission, priests wrote the Avestan texts in a newly devised alphabet under the Sasanians. Tradition, recorded in the Denkard, links a final revision to Khosrow I in the 6th century.", imp: 2,
    cites: [W("Avesta", "Avesta"), B("topic/Avesta-Zoroastrian-scripture", "Avesta")] },
  { id: "w502-denkard", branch: "zoroastrianism", y: 900, when: "9th–10th century CE", title: "The Denkard, an encyclopedia of Zoroastrianism",
    text: "This Middle Persian compendium of Zoroastrian belief and custom has its first books attributed to the 9th-century priest Adurfarnbag. It has been called an encyclopedia of Mazdaism.", imp: 3,
    cites: [W("Denkard", "Denkard"), B("topic/Denkart", "Denkart")] },

  // ---------- Abbasid Caliphate ----------
  { id: "w502-tabari-history", branch: "abbasid", y: 915, when: "completed in 915 CE (al-Tabari died 923)", title: "al-Tabari's History of Prophets and Kings",
    text: "The Baghdad scholar al-Tabari completed a universal history in annals from creation to the Abbasid era, ending in 915. It is a basic source for early Islamic history, alongside his Qur'an commentary.", imp: 2,
    cites: [B("biography/al-Tabari", "al-Tabari"), W("History_of_the_Prophets_and_Kings", "History of the Prophets and Kings")] },
  { id: "w502-buyids-take-baghdad", branch: "abbasid", y: 945, when: "945 CE", title: "The Buyids seize Baghdad",
    text: "Ahmad, one of three Daylamite brothers who founded the Shi'i Buyid dynasty, seized Baghdad and reduced the Sunni Abbasid caliphs to puppet status.", imp: 2,
    cites: [B("topic/Buyid-dynasty", "Buyid dynasty")] },

  // ---------- Achaemenid Persian Empire ----------
  { id: "w502-persepolis-begun", branch: "achaemenid", y: -518, when: "c. 518 BCE (earliest remains date to c. 515 BCE)", title: "Darius I begins building Persepolis",
    text: "Darius began a great terrace with an audience hall (apadana) and palaces, continued by Xerxes I and Artaxerxes I. Alexander's army took the site in 330 BCE; the ruins are a World Heritage Site.", imp: 2,
    cites: [{ t: "Persepolis — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/114/" }, W("Persepolis", "Persepolis")] },
  { id: "w502-cunaxa", branch: "achaemenid", y: -401, when: "401 BCE", title: "Cunaxa: Cyrus the Younger dies attacking Artaxerxes II",
    text: "Cyrus's army, including nearly 13,000 Greek mercenaries, beat the Persian left but Cyrus was killed in the charge. The Greeks' march home inspired Xenophon's Anabasis.", imp: 3,
    cites: [B("event/Battle-of-Cunaxa", "Battle of Cunaxa")] },

  // ---------- Assyria ----------
  { id: "w502-ashurnasirpal-banquet", branch: "assyria", y: -864, when: "864 BCE", title: "Ashurnasirpal II feasts 69,574 guests at Kalhu",
    text: "To open his new capital at Kalhu (Nimrud) and its palace, the king gave a ten-day banquet for 69,574 guests, recorded on a stele. The palace was designed to surpass those of earlier Assyrian kings.", imp: 2,
    cites: [W("Nimrud", "Nimrud"), B("biography/Ashurnasirpal-II", "Ashurnasirpal II")] },
  { id: "w502-qarqar", branch: "assyria", y: -853, when: "853 BCE", title: "Shalmaneser III fights a coalition at Qarqar",
    text: "A coalition of Syrian kings, including Ahab of Israel, met Shalmaneser III in an indecisive battle. Shalmaneser claimed victory, but could not advance west until the coalition broke up.", imp: 2, link: "israel-judah",
    cites: [W("Battle_of_Qarqar", "Battle of Qarqar"), B("biography/Shalmaneser-III", "Shalmaneser III")] },
  { id: "w502-tiglath-pileser-iii", branch: "assyria", y: -745, when: "745 BCE", title: "Tiglath-pileser III takes the throne",
    text: "A rebellion brought him to power. He reorganized the provincial governorships under Assyrian officials, began Assyria's final great expansion, and in 729 or 728 BCE united Assyria and Babylonia.", imp: 2,
    cites: [B("biography/Tiglath-pileser-III", "Tiglath-pileser III")] },
  { id: "w502-dur-sharrukin", branch: "assyria", y: -717, end: -707, when: "717–707 BCE", title: "Sargon II builds Dur-Sharrukin",
    text: "Sargon II raised a planned city northeast of Nineveh, with seven fortified gates and a temple to Nabu. Soon after it was finished Sargon was killed in battle (705 BCE) and the city was quickly deserted.", imp: 3,
    cites: [B("topic/Dur-Sharrukin", "Dur Sharrukin"), B("biography/Sargon-II", "Sargon II")] },

  // ---------- Babylonia ----------
  { id: "w502-nabonassar-records", branch: "babylonia", y: -747, when: "747 BCE", title: "Nabonassar takes the throne of Babylon",
    text: "King of Babylon 747–734 BCE, he restored native rule. The Babylonian Chronicle and Ptolemy's Canon both begin with his accession, and his reign saw systematic, precisely dated record-keeping begin.", imp: 3,
    cites: [W("Nabonassar", "Nabonassar"), B("biography/Nabonassar", "Nabonassar")] },
  { id: "w502-babylon-destroyed-689", branch: "babylonia", y: -689, when: "689 BCE", title: "Sennacherib destroys Babylon",
    text: "After a siege of over fifteen months, Sennacherib took Babylon, which had been the target of most of his campaigns. He destroyed the city, plundering and leveling its temples.", imp: 2, link: "assyria",
    cites: [W("Sennacherib", "Sennacherib"), B("biography/Sennacherib", "Sennacherib")] },
  { id: "w502-nabopolassar", branch: "babylonia", y: -626, when: "626 BCE", title: "Nabopolassar founds the Neo-Babylonian dynasty",
    text: "A Chaldean leader seized the throne of Babylon and fought the Assyrians and Egyptians. His dynasty ruled until 539 BCE and began restoring the canal network of Babylonia.", imp: 2,
    cites: [B("biography/Nabopolassar", "Nabopolassar")] },
  { id: "w502-carchemish", branch: "babylonia", y: -605, when: "c. 605 BCE", title: "Nebuchadnezzar defeats Egypt at Carchemish",
    text: "Babylonian forces under Nebuchadnezzar defeated Egypt's army, allied with remnants of Assyria, at Carchemish on the Euphrates. Egypt was expelled from the region and Babylon became the leading power.", imp: 2, link: "egypt",
    cites: [W("Battle_of_Carchemish", "Battle of Carchemish"), B("event/Battle-of-Carchemish", "Battle of Carchemish"), B("biography/Nebuchadnezzar-II", "Nebuchadnezzar II")] },
  { id: "w502-ishtar-gate", branch: "babylonia", y: -575, when: "c. 575 BCE (some sources say c. 569 BCE)", title: "The Ishtar Gate is built at Babylon",
    text: "Nebuchadnezzar II's gate, over 38 feet high, was faced with glazed bricks in tiers of dragons and bulls. Its smaller front gate is now rebuilt in Berlin's Pergamon Museum.", imp: 2,
    cites: [B("place/Ishtar-Gate", "Ishtar Gate"), W("Ishtar_Gate", "Ishtar Gate")] },
  { id: "w502-nabonidus-tayma", branch: "babylonia", y: -552, end: -543, when: "c. 552–543 BCE", title: "Nabonidus withdraws to Tayma in Arabia",
    text: "The last Babylonian king left his son Belshazzar in charge and spent about a decade in the Arabian oasis. Some scholars call him the first archaeologist, for his excavations of ancient temples.", imp: 3,
    cites: [W("Nabonidus", "Nabonidus"), B("biography/Nabonidus", "Nabonidus"), B("place/Tayma", "Taymāʾ")] },

  // ---------- Carthage ----------
  { id: "w502-alalia", branch: "carthage", y: -537, when: "c. 540–535 BCE", title: "Battle of Alalia: Carthage and Etruscans fight the Phocaeans",
    text: "Off Corsica a Punic-Etruscan fleet of 120 ships fought 60 Phocaean Greek ships. The Greeks won but lost almost two-thirds of their fleet, and Corsica passed into Etruscan hands.", imp: 3,
    cites: [W("Battle_of_Alalia", "Battle of Alalia")] },
  { id: "w502-first-rome-treaty", branch: "carthage", y: -509, when: "509 BCE (Polybius implies 508)", title: "First treaty between Rome and Carthage",
    text: "The first of four treaties between the two cities is dated to the year the Roman Republic was founded, 509 BCE. Polybius dates it 28 years before Xerxes crossed into Greece, so 508.", imp: 3, link: "roman-republic",
    cites: [W("Treaties_between_Rome_and_Carthage", "Treaties between Rome and Carthage")] },
  { id: "w502-himera", branch: "carthage", y: -480, when: "480 BCE", title: "Carthage defeated at Himera",
    text: "Gelon of Syracuse and Theron of Acragas beat Hamilcar's army, and Hamilcar died. The battle ended Carthage's bid to restore the tyrant of Himera and crippled its power in Sicily for decades.", imp: 2,
    cites: [B("place/Himera", "Himera"), W("Battle_of_Himera_(480_BC)", "Battle of Himera (480 BC)")] },
  { id: "w502-hanno-periplus", branch: "carthage", y: -450, when: "5th century BCE (debated)", title: "Hanno sails down the African coast",
    text: "Hanno led 60 ships of colonists along West Africa. His Periplus survives only in Greek manuscripts, and modern scholars doubt he went beyond Morocco.", imp: 3,
    cites: [B("biography/Hanno-Carthaginian-explorer", "Hanno"), W("Hanno_the_Navigator", "Hanno the Navigator")] },
  { id: "w502-selinus", branch: "carthage", y: -409, when: "409 BCE", title: "Carthage razes Selinus",
    text: "Hannibal Mago's army stormed the Greek city in Sicily; about 16,000 Greeks died and 6,000 were taken prisoner. It opened the Second Sicilian War.", imp: 3,
    cites: [W("Battle_of_Selinus", "Battle of Selinus"), B("place/Selinunte", "Selinunte")] },
  { id: "w502-mago-treatise", branch: "carthage", y: -146, when: "after 146 BCE", title: "Mago's farming treatise saved for Rome",
    text: "When Carthage fell, Mago's 28-book Punic work on agriculture was carried to Rome. It was translated into Latin at the Roman Senate's expense; the Punic original is lost.", imp: 3, link: "roman-republic",
    cites: [W("Mago_(agricultural_writer)", "Mago (agricultural writer)")] },

  // ---------- Ancient Egypt ----------
  { id: "w502-shoshenq-campaign", branch: "egypt", y: -925, when: "c. 925 BCE", title: "Shoshenq I campaigns in Canaan",
    text: "The Libyan pharaoh, generally identified with the Bible's Shishak, raided Israel and Judah. His exploits are carved on the Bubastite Portal at Karnak, and a stela bearing his name was found at Megiddo.", imp: 2, link: "israel-judah",
    cites: [W("Shoshenq_I", "Shoshenq I"), B("biography/Sheshonk-I", "Sheshonk I")] },
  { id: "w502-pelusium", branch: "egypt", y: -525, when: "525 BCE", title: "Cambyses defeats Psamtik III at Pelusium",
    text: "The Persian army won in the eastern Delta and Memphis fell. Egypt became part of the Achaemenid Empire as the Twenty-seventh Dynasty.", imp: 2, link: "achaemenid",
    cites: [W("Battle_of_Pelusium_(525_BC)", "Battle of Pelusium (525 BC)"), B("biography/Cambyses-II", "Cambyses II")] },
  { id: "w502-amyrtaeus-independence", branch: "egypt", y: -404, when: "404 BCE", title: "Amyrtaeus declares Egypt independent of Persia",
    text: "After a long revolt in the western Delta, he took the kingship when Darius II died. Native rule lasted roughly sixty years before Persia reconquered Egypt.", imp: 3, link: "achaemenid",
    cites: [W("Amyrtaeus", "Amyrtaeus")] },
  { id: "w502-pharos", branch: "egypt", y: -280, when: "c. 280 BCE", title: "The Pharos lighthouse is built at Alexandria",
    text: "Sostratus of Cnidus built it on Pharos island, finishing under Ptolemy II. It may have stood over 350 feet tall and became one of the Seven Wonders of the World.", imp: 2,
    cites: [B("place/Pharos-of-Alexandria", "Lighthouse of Alexandria")] },
  { id: "w502-edfu-temple", branch: "egypt", y: -237, end: -57, when: "August 23, 237 – 57 BCE", title: "The Ptolemies build the Temple of Horus at Edfu",
    text: "Begun under Ptolemy III and finished in 57 BCE, this sandstone temple of Horus later lay buried under sand and silt. It is among Egypt's best-preserved temples.", imp: 2,
    cites: [W("Temple_of_Edfu", "Temple of Edfu"), B("place/Idfu", "Idfu")] },
  { id: "w502-dendera-hathor", branch: "egypt", y: -54, when: "54 BCE", title: "Construction begins on the Hathor temple at Dendera",
    text: "Begun under Ptolemy XII and completed under Rome's emperor Tiberius, it is among Egypt's best-preserved temples. Its ceiling carries astronomical scenes, and a zodiac from its roof is now in Paris.", imp: 3,
    cites: [W("Dendera_Temple_complex", "Dendera Temple complex"), B("place/Dandarah", "Dandarah")] },

  // ---------- Fatimid Caliphate ----------
  { id: "w502-fatimids-established", branch: "fatimid", y: 909, when: "909 CE", title: "The Fatimid dynasty is established in North Africa",
    text: "Isma'ili Shi'i rulers claiming descent from Fatima founded a rival caliphate in Tunisia and Sicily. They aimed to replace the Sunni Abbasid caliphs as leaders of the Islamic world.", imp: 2, link: "abbasid",
    cites: [B("topic/Fatimid-dynasty", "Fatimid dynasty")] },
  { id: "w502-fatimid-conquest-egypt", branch: "fatimid", y: 969, when: "969 CE", title: "Jawhar conquers Egypt for the Fatimids",
    text: "General Jawhar al-Siqilli led the invasion, met little resistance and secured Egypt by a treaty with the Ikhshidid vizier. The Fatimids founded Cairo as their capital.", imp: 2, link: "egypt",
    cites: [W("Jawhar_al-Siqilli", "Jawhar al-Siqilli"), B("topic/Fatimid-dynasty", "Fatimid dynasty")] },
  { id: "w502-al-azhar", branch: "fatimid", y: 970, end: 972, when: "970–972 CE", title: "Al-Azhar is founded in Cairo",
    text: "Jawhar founded the mosque on the orders of Caliph al-Mu'izz in the new capital. It opened in 972 and became a formal center of learning in 988, the start of today's Al-Azhar University.", imp: 2,
    cites: [W("Al-Azhar_University", "Al-Azhar University"), B("topic/al-Azhar-University", "Al-Azhar University")] },

  // ---------- Kingdoms of Israel and Judah ----------
  { id: "w502-omri-samaria", branch: "israel-judah", y: -880, when: "c. 880 BCE", title: "Omri founds Samaria as capital of Israel",
    text: "Omri moved the capital from Tirzah to a new hill city. Excavations found a palace expanded under Ahab and about 500 carved ivory fragments.", imp: 2,
    cites: [W("Samaria_(ancient_city)", "Samaria (ancient city)"), B("biography/Omri", "Omri")] },
  { id: "w502-mesha-stele", branch: "israel-judah", y: -840, when: "c. 840 BCE", title: "King Mesha of Moab records his revolt against Israel",
    text: "The Mesha Stele, found at Dhiban in 1868 and kept in the Louvre since 1873, says Moab was subjugated by Israel until Mesha threw off its yoke. It is the most extensive inscription to mention the kingdom of Israel.", imp: 2,
    cites: [W("Mesha_Stele", "Mesha Stele"), B("topic/Moabite-Stone", "Moabite Stone")] },
  { id: "w502-siloam-tunnel", branch: "israel-judah", y: -703, when: "traditionally late 8th century BCE, before 701 BCE (dating debated)", title: "Hezekiah's tunnel brings the Gihon spring into Jerusalem",
    text: "Traditionally credited to Hezekiah as Assyria threatened, this 533-meter conduit was cut through rock to carry the Gihon spring to a reservoir inside the walls. Two teams dug from opposite ends.", imp: 3,
    cites: [B("biography/Hezekiah", "Hezekiah"), W("Hezekiah%27s_Tunnel", "Hezekiah's Tunnel")] },
  { id: "w502-josiah-reform", branch: "israel-judah", y: -622, when: "c. 622–621 BCE", title: "Josiah's reform after the book of the Law is found",
    text: "According to 2 Kings, a \"Book of the Law\" prompted Josiah to centralize worship at the Jerusalem Temple and remove other shrines. How far the reform went is debated; the book is often linked to Deuteronomy.", imp: 2, link: "judaism",
    cites: [B("biography/Josiah", "Josiah"), W("Josiah", "Josiah"), B("topic/Deuteronomy", "Deuteronomy")] },

  // ---------- Parthian Empire ----------
  { id: "w502-mithradates-babylonia", branch: "parthia", y: -141, when: "142 or 141 BCE", title: "Mithradates I conquers Babylonia",
    text: "The Parthian king took Elymais and invaded Babylonia. He then captured the Seleucid king Demetrius II, and Parthia ruled Mesopotamia.", imp: 2, link: "babylonia",
    cites: [B("biography/Mithradates-I", "Mithradates I")] },
  { id: "w502-han-delegation", branch: "parthia", y: -110, end: -91, when: "during the reign of Mithridates II (124–91 BCE)", title: "Parthia opens relations with Han China",
    text: "Under Mithridates II, the Parthian Empire for the first time established diplomatic relations with Han China and, in 92 BCE, concluded its first treaty with Rome.", imp: 2, link: "han",
    cites: [W("Mithridates_II_of_Parthia", "Mithridates II of Parthia"), B("topic/Parthia", "Parthia")] },
  { id: "w502-rhandeia", branch: "parthia", y: 63, when: "63 CE", title: "Treaty of Rhandeia settles Armenia",
    text: "It ended the Roman–Parthian war of 58–63: a Parthian Arsacid prince, Tiridates, would rule Armenia, with the Roman emperor holding the right of investiture. Tiridates later acknowledged Nero as his lord.", imp: 2, link: "roman-empire",
    cites: [W("Treaty_of_Rhandeia", "Treaty of Rhandeia"), B("topic/Treaty-of-Rhandeia", "Treaty of Rhandeia"), B("biography/Tiridates-I", "Tiridates I")] },
  { id: "w502-trajan-ctesiphon", branch: "parthia", y: 116, when: "116 CE", title: "Trajan takes Ctesiphon",
    text: "Trajan captured the Parthian capital Ctesiphon and sailed down to the Persian Gulf, and coins proclaimed Mesopotamia under Roman authority. Revolts and his failure to take Hatra forced him back.", imp: 2, link: "roman-empire",
    cites: [W("Trajan%27s_Parthian_campaign", "Trajan's Parthian campaign"), B("biography/Trajan", "Trajan")] },
] });

TL.geo("w502-dead-sea-scrolls-copied", { scope: "place", lat: 31.74, lon: 35.46, r: 40, label: "Qumran, West Bank", src: "https://en.wikipedia.org/wiki/Qumran" });
TL.geo("w502-jerusalem-talmud", { scope: "place", lat: 32.79, lon: 35.53, r: 40, label: "Tiberias, Galilee", src: "https://en.wikipedia.org/wiki/Tiberias" });
TL.geo("w502-babylonian-talmud", { scope: "region", lat: 31.87, lon: 44.45, r: 250, label: "Babylonia (Sura and Pumbedita academies)", src: "https://en.wikipedia.org/wiki/Sura_Academy" });
TL.geo("w502-aleppo-codex", { scope: "place", lat: 32.79, lon: 35.53, r: 40, label: "Tiberias, Galilee", src: "https://en.wikipedia.org/wiki/Tiberias" });
TL.geo("w502-enneads-edited", { scope: "place", lat: 41.89, lon: 12.48, r: 40, label: "Rome", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("w502-gathas-composed", { scope: "region", lat: 36, lon: 62, r: 1500, label: "Greater Iran", src: "https://en.wikipedia.org/wiki/Greater_Iran" });
TL.geo("w502-behistun-ahuramazda", { scope: "place", lat: 34.39, lon: 47.44, r: 40, label: "Behistun, Iran", src: "https://en.wikipedia.org/wiki/Behistun_Inscription" });
TL.geo("w502-anahita-mithra-inscriptions", { scope: "place", lat: 32.19, lon: 48.26, r: 60, label: "Susa, Iran", src: "https://en.wikipedia.org/wiki/Susa" });
TL.geo("w502-kartir", { scope: "place", lat: 29.99, lon: 52.88, r: 80, label: "Naqsh-e Rostam, Iran", src: "https://en.wikipedia.org/wiki/Naqsh-e_Rostam" });
TL.geo("w502-avesta-written", { scope: "region", lat: 32, lon: 53, r: 1200, label: "Sasanian Iran", src: "https://en.wikipedia.org/wiki/Iran" });
TL.geo("w502-denkard", { scope: "region", lat: 32, lon: 53, r: 1200, label: "Iran", src: "https://en.wikipedia.org/wiki/Iran" });
TL.geo("w502-tabari-history", { scope: "place", lat: 33.32, lon: 44.37, r: 40, label: "Baghdad", src: "https://en.wikipedia.org/wiki/Baghdad" });
TL.geo("w502-buyids-take-baghdad", { scope: "place", lat: 33.32, lon: 44.37, r: 40, label: "Baghdad", src: "https://en.wikipedia.org/wiki/Baghdad" });
TL.geo("w502-persepolis-begun", { scope: "place", lat: 29.93, lon: 52.89, r: 40, label: "Persepolis, Iran", src: "https://en.wikipedia.org/wiki/Persepolis" });
TL.geo("w502-cunaxa", { scope: "place", lat: 33.33, lon: 44.08, r: 60, label: "Cunaxa, near Babylon", src: "https://en.wikipedia.org/wiki/Battle_of_Cunaxa" });
TL.geo("w502-ashurnasirpal-banquet", { scope: "place", lat: 36.1, lon: 43.33, r: 40, label: "Nimrud, Iraq", src: "https://en.wikipedia.org/wiki/Nimrud" });
TL.geo("w502-qarqar", { scope: "place", lat: 35.74, lon: 36.33, r: 60, label: "Qarqar, Syria", src: "https://en.wikipedia.org/wiki/Battle_of_Qarqar" });
TL.geo("w502-tiglath-pileser-iii", { scope: "place", lat: 36.1, lon: 43.33, r: 40, label: "Nimrud, Iraq", src: "https://en.wikipedia.org/wiki/Nimrud" });
TL.geo("w502-dur-sharrukin", { scope: "place", lat: 36.51, lon: 43.23, r: 40, label: "Khorsabad, Iraq", src: "https://en.wikipedia.org/wiki/Dur-Sharrukin" });
TL.geo("w502-nabonassar-records", { scope: "place", lat: 32.54, lon: 44.42, r: 40, label: "Babylon, Iraq", src: "https://en.wikipedia.org/wiki/Babylon" });
TL.geo("w502-babylon-destroyed-689", { scope: "place", lat: 32.54, lon: 44.42, r: 40, label: "Babylon, Iraq", src: "https://en.wikipedia.org/wiki/Babylon" });
TL.geo("w502-nabopolassar", { scope: "place", lat: 32.54, lon: 44.42, r: 40, label: "Babylon, Iraq", src: "https://en.wikipedia.org/wiki/Babylon" });
TL.geo("w502-carchemish", { scope: "place", lat: 36.83, lon: 38.01, r: 40, label: "Carchemish, Turkey and Syria", src: "https://en.wikipedia.org/wiki/Carchemish" });
TL.geo("w502-ishtar-gate", { scope: "place", lat: 32.54, lon: 44.42, r: 40, label: "Babylon, Iraq", src: "https://en.wikipedia.org/wiki/Babylon" });
TL.geo("w502-nabonidus-tayma", { scope: "place", lat: 27.63, lon: 38.55, r: 60, label: "Tayma, Saudi Arabia", src: "https://en.wikipedia.org/wiki/Tayma" });
TL.geo("w502-alalia", { scope: "place", lat: 42.1, lon: 9.51, r: 80, label: "Aléria, Corsica", src: "https://en.wikipedia.org/wiki/Aleria" });
TL.geo("w502-first-rome-treaty", { scope: "place", lat: 36.85, lon: 10.33, r: 30, label: "Carthage, Tunisia", src: "https://en.wikipedia.org/wiki/Carthage" });
TL.geo("w502-himera", { scope: "place", lat: 37.97, lon: 13.82, r: 40, label: "Himera, Sicily", src: "https://en.wikipedia.org/wiki/Himera" });
TL.geo("w502-hanno-periplus", { scope: "region", lat: 20, lon: -14, r: 2000, label: "West African coast", src: "https://en.wikipedia.org/wiki/Hanno_the_Navigator" });
TL.geo("w502-selinus", { scope: "place", lat: 37.58, lon: 12.83, r: 40, label: "Selinunte, Sicily", src: "https://en.wikipedia.org/wiki/Selinunte" });
TL.geo("w502-mago-treatise", { scope: "place", lat: 36.85, lon: 10.33, r: 30, label: "Carthage, Tunisia", src: "https://en.wikipedia.org/wiki/Carthage" });
TL.geo("w502-shoshenq-campaign", { scope: "place", lat: 25.72, lon: 32.66, r: 40, label: "Karnak, Egypt", src: "https://en.wikipedia.org/wiki/Karnak" });
TL.geo("w502-pelusium", { scope: "place", lat: 31.04, lon: 32.55, r: 40, label: "Pelusium, Egypt", src: "https://en.wikipedia.org/wiki/Pelusium" });
TL.geo("w502-amyrtaeus-independence", { scope: "place", lat: 30.96, lon: 30.77, r: 40, label: "Sais, Egypt", src: "https://en.wikipedia.org/wiki/Sais,_Egypt" });
TL.geo("w502-pharos", { scope: "place", lat: 31.2, lon: 29.89, r: 30, label: "Alexandria, Egypt", src: "https://en.wikipedia.org/wiki/Alexandria" });
TL.geo("w502-edfu-temple", { scope: "place", lat: 24.98, lon: 32.87, r: 30, label: "Edfu, Egypt", src: "https://en.wikipedia.org/wiki/Edfu" });
TL.geo("w502-dendera-hathor", { scope: "place", lat: 26.17, lon: 32.66, r: 30, label: "Dendera, Egypt", src: "https://en.wikipedia.org/wiki/Dendera" });
TL.geo("w502-fatimids-established", { scope: "place", lat: 35.6, lon: 10.06, r: 80, label: "Raqqada, Tunisia", src: "https://en.wikipedia.org/wiki/Raqqada" });
TL.geo("w502-fatimid-conquest-egypt", { scope: "place", lat: 30.04, lon: 31.24, r: 40, label: "Cairo, Egypt", src: "https://en.wikipedia.org/wiki/Cairo" });
TL.geo("w502-al-azhar", { scope: "place", lat: 30.05, lon: 31.26, r: 30, label: "Al-Azhar Mosque, Cairo", src: "https://en.wikipedia.org/wiki/Al-Azhar_Mosque" });
TL.geo("w502-omri-samaria", { scope: "place", lat: 32.28, lon: 35.19, r: 40, label: "Samaria, West Bank", src: "https://en.wikipedia.org/wiki/Samaria_(ancient_city)" });
TL.geo("w502-mesha-stele", { scope: "place", lat: 31.5, lon: 35.78, r: 50, label: "Dhiban (Dibon), Jordan", src: "https://en.wikipedia.org/wiki/Dhiban,_Jordan" });
TL.geo("w502-siloam-tunnel", { scope: "place", lat: 31.78, lon: 35.23, r: 30, label: "Jerusalem", src: "https://en.wikipedia.org/wiki/Jerusalem" });
TL.geo("w502-josiah-reform", { scope: "place", lat: 31.78, lon: 35.23, r: 30, label: "Jerusalem", src: "https://en.wikipedia.org/wiki/Jerusalem" });
TL.geo("w502-mithradates-babylonia", { scope: "place", lat: 33.09, lon: 44.52, r: 60, label: "Seleucia on the Tigris", src: "https://en.wikipedia.org/wiki/Seleucia" });
TL.geo("w502-han-delegation", { scope: "region", lat: 33.09, lon: 44.58, r: 1200, label: "Parthian Empire", src: "https://en.wikipedia.org/wiki/Parthian_Empire" });
TL.geo("w502-rhandeia", { scope: "region", lat: 40.18, lon: 44.52, r: 400, label: "Armenia", src: "https://en.wikipedia.org/wiki/Armenia" });
TL.geo("w502-trajan-ctesiphon", { scope: "place", lat: 33.09, lon: 44.58, r: 60, label: "Ctesiphon, Iraq", src: "https://en.wikipedia.org/wiki/Ctesiphon" });
