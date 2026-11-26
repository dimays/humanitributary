// Fill-in W5-03: 1000 BCE – 1000 CE — Phoenicia, Sasanians, Seleucids, Umayyads, al-Andalus, ancient Greece, Anglo-Saxons, Asturias–León, Byzantium, Dál Riata, East Francia, England (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const O = (t, u) => ({ t, u });
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };

TL.add({ events: [
  // ---------- Phoenicia ----------
  { id: "w503-hiram-solomon", branch: "phoenicia", y: -969, end: -936, when: "reigned c. 969–936 BCE", title: "Hiram I of Tyre supplies Solomon's Temple", imp: 2, link: "israel-judah",
    text: "Hiram, king of Tyre, allied with David and Solomon of Israel, sending men and materials for the Temple at Jerusalem and joining Solomon in Mediterranean and Red Sea trading voyages. His reign is dated c. 969–936 BCE.",
    cites: [B("biography/Hiram-king-of-Tyre", "Hiram"), W("Hiram_I", "Hiram I")] },
  { id: "w503-carthage-founded", branch: "phoenicia", y: -814, when: "traditionally 814 BCE", title: "Tyrian colonists found Carthage", imp: 2, link: "carthage",
    text: "According to tradition, Carthage was founded by Tyrians in 814 BCE; Timaeus credits the princess Dido (Elissa). The date may be exaggerated, and other ancient accounts name different founders.",
    cites: [B("place/Carthage-ancient-city-Tunisia", "Carthage"), W("Dido", "Dido")] },
  { id: "w503-necho-circumnavigation", branch: "phoenicia", y: -600, when: "between 610 and 594 BCE", title: "Phoenicians reportedly sail around Africa", imp: 3,
    text: "Herodotus reports that Pharaoh Necho II sent a Phoenician crew from the Red Sea around Africa to the Nile mouth in three years. Some ancient writers doubted the voyage.",
    cites: [B("biography/Necho-II", "Necho II"), W("Necho_II", "Necho II")] },
  { id: "w503-nebuchadnezzar-tyre", branch: "phoenicia", y: -585, end: -573, when: "585–573 BCE (consensus)", title: "Nebuchadnezzar II besieges Tyre", imp: 3,
    text: "Babylon's king besieged island Tyre after taking Jerusalem in 587 BCE; Britannica says the city withstood it. The thirteen-year length rests on Josephus alone.",
    cites: [B("place/Tyre", "Tyre"), W("Phoenicia", "Phoenicia")] },
  { id: "w503-alexander-tyre", branch: "phoenicia", y: -332, end: -331.5, when: "January–July 332 BCE", title: "Alexander storms Tyre after a seven-month siege", imp: 2, link: "hellenistic",
    text: "Alexander built a causeway to island Tyre and took it, denying Persia its last major harbor in the region. Thousands of Tyrians were killed and some 30,000 sold into slavery.",
    cites: [B("place/Tyre", "Tyre"), W("Siege_of_Tyre_(332_BC)", "Siege of Tyre (332 BC)")] },

  // ---------- Sasanian Empire ----------
  { id: "w503-peace-jovian", branch: "sasanian", y: 363.5, when: "363", title: "After Julian's death, Rome cedes Nisibis to Shapur II", imp: 2, link: "roman-empire",
    text: "Emperor Julian's army reached Ctesiphon in 363 but he died; his successor Jovian made peace, giving up Nisibis, Singara and lands beyond the Tigris, and agreeing not to interfere in Armenia.",
    cites: [B("biography/Shapur-II", "Shapur II"), W("Shapur_II", "Shapur II")] },
  { id: "w503-peroz-killed", branch: "sasanian", y: 484, when: "484", title: "Peroz I killed fighting the Hephthalites", imp: 3,
    text: "The shah was defeated and killed in his third war with the Hephthalites. Afterward Persia paid them tribute and the nobility gained power as king-makers.",
    cites: [B("place/ancient-Iran/The-Sasanian-period", "Ancient Iran: The Sasanian period"), W("Peroz_I", "Peroz I")] },
  { id: "w503-khosrow-antioch", branch: "sasanian", y: 540, when: "540", title: "Khosrow I conquers Antioch", imp: 2, link: "byzantine",
    text: "Khosrow I conquered Antioch and held it briefly. He settled many of its prisoners in a new town near his capital Ctesiphon, modeled on the old Antioch.",
    cites: [B("biography/Khosrow-I", "Khosrow I")] },
  { id: "w503-taq-kasra", branch: "sasanian", y: 540, when: "date uncertain; possibly c. 540 under Khosrow I", title: "Taq Kasra, Ctesiphon's great arch, raised", imp: 3,
    text: "The vaulted iwan of the palace at Ctesiphon, about 37 m high, was among the largest brick vaults ever built. Its builder is debated: Shapur I or Khosrow I, perhaps after the 540 campaign against the Byzantines.",
    cites: [W("Taq_Kasra", "Taq Kasra"), B("place/Ctesiphon-ancient-city-Iraq", "Ctesiphon")] },
  { id: "w503-nineveh-627", branch: "sasanian", y: D(627, 12, 12), when: "December 12, 627", title: "Heraclius defeats the Persians at Nineveh", imp: 2, link: "byzantine",
    text: "Heraclius beat a Persian army near Nineveh and plundered Khosrow II's palace at Dastagird. Khosrow was overthrown, his son made peace, and the civil war weakened Persia before the Arab conquest.",
    cites: [W("Battle_of_Nineveh_(627)", "Battle of Nineveh (627)"), B("biography/Heraclius-Byzantine-emperor", "Heraclius")] },
  { id: "w503-nahavand", branch: "sasanian", y: 642, when: "642", title: "Muslim army wins at Nahavand", imp: 2, link: "rashidun",
    text: "A Rashidun army under An-Numan ibn Muqarrin defeated a much larger Sasanian force near Hamadan. Yazdegerd III escaped east, unable to raise another large army, and was killed in 651.",
    cites: [B("event/Battle-of-Nahavand", "Battle of Nahāvand"), W("Battle_of_Nahavand", "Battle of Nahavand")] },

  // ---------- Seleucid Empire ----------
  { id: "w503-antioch-founded", branch: "seleucid", y: -300, when: "300 BCE", title: "Seleucus I founds Antioch on the Orontes", imp: 2,
    text: "Seleucus I Nicator founded Antioch, one of four cities meant to secure his new realm. Controlling trade routes, it served as the Seleucid capital from 240 BCE until Rome took over in 64 or 63 BCE.",
    cites: [B("place/Antioch-modern-and-ancient-city-south-central-Turkey", "Antioch"), W("Antioch", "Antioch")] },
  { id: "w503-panium", branch: "seleucid", y: -200, when: "summer 200 BCE", title: "Antiochus III wins Coele-Syria at Panium", imp: 3,
    text: "Antiochus III destroyed the Ptolemaic army of Scopas near Paneas in the Fifth Syrian War and took Coele-Syria. Ptolemaic Egypt never recovered as a great power.",
    cites: [B("biography/Antiochus-III-the-Great", "Antiochus III the Great"), W("Battle_of_Panium", "Battle of Panium")] },
  { id: "w503-magnesia", branch: "seleucid", y: -190, when: "December 190 or January 189 BCE", title: "Rome crushes Antiochus III at Magnesia", imp: 2, link: "roman-republic",
    text: "Roman and Pergamene forces routed Antiochus III near Magnesia. The Treaty of Apamea (188 BCE) forced the Seleucids out of Asia Minor west of the Taurus Mountains.",
    cites: [W("Battle_of_Magnesia", "Battle of Magnesia"), B("biography/Antiochus-III", "Antiochus III")] },
  { id: "w503-maccabean-revolt", branch: "seleucid", y: -167, end: -160, when: "167–160 BCE (main phase)", title: "Maccabean Revolt against Antiochus IV", imp: 2, link: "israel-judah",
    text: "Antiochus IV banned Jewish practice and made the Jerusalem Temple a mixed cult site. The Maccabees retook Jerusalem in 164 BCE and rededicated the altar, the origin of Hanukkah.",
    cites: [W("Maccabean_Revolt", "Maccabean Revolt"), B("biography/Antiochus-IV-Epiphanes", "Antiochus IV Epiphanes")] },

  // ---------- Umayyad Caliphate ----------
  { id: "w503-damascus-mosque", branch: "umayyad", y: 706, end: 715, when: "706–c. 715 (Britannica: 705–715)", title: "Al-Walid I builds the Great Mosque of Damascus", imp: 2,
    text: "Caliph al-Walid I replaced the cathedral with the earliest surviving stone mosque, its gold mosaics covering some 4,000 square meters. Its basilican plan influenced later Islamic architecture.",
    cites: [B("topic/Great-Mosque-of-Damascus", "Great Mosque of Damascus"), W("Great_Mosque_of_Damascus", "Great Mosque of Damascus")] },
  { id: "w503-siege-constantinople-717", branch: "umayyad", y: 717.55, end: 718.62, when: "July/August 717 – August 15, 718", title: "Umayyad siege of Constantinople fails", imp: 2, link: "byzantine",
    text: "An Umayyad army and fleet besieged Constantinople for about a year. Greek fire, winter, famine and Bulgar attacks broke them; the caliphate largely gave up conquering the city.",
    cites: [B("biography/Leo-III", "Leo III"), W("Siege_of_Constantinople_(717%E2%80%93718)", "Siege of Constantinople (717–718)")] },
  { id: "w503-zab", branch: "umayyad", y: D(750, 1, 25), when: "January 25, 750", title: "Abbasids destroy the Umayyad army at the Zab", imp: 2, link: "abbasid",
    text: "Marwan II's army was routed by Abbasid forces on the Great Zab River; Marwan fled to Egypt and was killed. The defeat ended the Umayyad Caliphate and began the Abbasid.",
    cites: [B("biography/Marwan-II", "Marwān II"), W("Battle_of_the_Zab", "Battle of the Zab")] },

  // ---------- al-Andalus ----------
  { id: "w503-tariq-landing", branch: "al-andalus", y: 711.3, when: "spring 711", title: "Tariq ibn Ziyad lands at Gibraltar", imp: 2,
    text: "Tariq crossed with about 7,000 men, mostly Berbers, and the mountain took his name (Jabal Tariq). He beat King Roderic and within a few years Muslim armies held about two-thirds of Iberia.",
    cites: [B("biography/Tariq-ibn-Ziyad", "Tariq ibn Ziyad"), W("Tariq_ibn_Ziyad", "Tariq ibn Ziyad")] },
  { id: "w503-abd-rahman-i", branch: "al-andalus", y: 756.37, when: "May 756", title: "Abd al-Rahman I founds the Emirate of Córdoba", imp: 2,
    text: "An Umayyad prince who escaped the Abbasid massacre won at al-Musarah and entered Córdoba, making it his capital. His emirate kept Iberia independent of the Abbasid caliphs in Baghdad.",
    cites: [W("Abd_al-Rahman_I", "Abd al-Rahman I"), B("place/Cordoba-Spain", "Córdoba")] },
  { id: "w503-great-mosque-cordoba", branch: "al-andalus", y: 785.5, when: "785–786", title: "Abd al-Rahman I begins the Great Mosque of Córdoba", imp: 2,
    text: "He bought the Christian half of the shared church of St. Vincent and built the mosque on the site. Enlarged by his successors, it is now a UNESCO World Heritage Site.",
    cites: [W("Mosque%E2%80%93Cathedral_of_C%C3%B3rdoba", "Mosque–Cathedral of Córdoba"), B("place/Cordoba-Spain", "Córdoba")] },
  { id: "w503-ziryab", branch: "al-andalus", y: 822, when: "822", title: "Ziryab brings Baghdad's music and manners to Córdoba", imp: 3,
    text: "The Baghdad musician Ziryab settled at the Córdoba court, added a fifth string to the lute and founded a music school. Later accounts credit him with fashions and table customs; some are doubted.",
    cites: [B("biography/Ziryab", "Ziryab"), W("Ziryab", "Ziryab")] },

  // ---------- Archaic & Classical Greece ----------
  { id: "w503-homer-epics", branch: "ancient-greece", y: -750, when: "c. 8th century BCE (debated)", title: "The Iliad and Odyssey take shape", imp: 2,
    text: "The Homeric epics are usually dated to about the 8th century BCE, though some scholars say the early 7th, and Homer himself is uncertain. The poems stayed central to Greek education and ideals of heroism.",
    cites: [W("Homer", "Homer"), B("biography/Homer-Greek-poet", "Homer")] },
  { id: "w503-draco-code", branch: "ancient-greece", y: -621, when: "c. 621/620 BCE", title: "Draco's code, Athens' first written laws", imp: 3,
    text: "Draco's code, generally dated to 621 BCE, set down Athenian law in writing, enforced by courts rather than blood feud, and made death the penalty for most offenses. It gave English the word “draconian.”",
    cites: [B("biography/Draco-Greek-lawgiver", "Draco"), W("Draco_(lawgiver)", "Draco (lawgiver)")] },
  { id: "w503-parthenon", branch: "ancient-greece", y: -447, end: -432, when: "447–432 BCE", title: "The Parthenon is built on the Acropolis", imp: 2,
    text: "Pericles' rebuilding program produced the Parthenon, designed by Iktinos and Callicrates with sculpture supervised by Phidias. The temple was completed in 438 BCE; sculpture continued to 432.",
    cites: [W("Parthenon", "Parthenon"), B("topic/Parthenon", "Parthenon")] },

  // ---------- Anglo-Saxon England ----------
  { id: "w503-hengist-horsa", branch: "anglo-saxons", y: 449, when: "449 (traditional)", title: "Hengist and Horsa, according to tradition, land in Kent", imp: 3,
    text: "According to tradition, the Anglo-Saxon Chronicle dating it to 449, Hengist and Horsa landed at Ebbsfleet, invited by Vortigern to fight the Picts. Modern scholars treat the brothers as legendary.",
    cites: [B("topic/Hengist", "Hengist and Horsa"), W("Hengist_and_Horsa", "Hengist and Horsa")] },
  { id: "w503-sutton-hoo", branch: "anglo-saxons", y: 625, when: "c. 620s", title: "Sutton Hoo ship burial", imp: 2,
    text: "A richly furnished ship, with a crested helmet and gold and garnet fittings, was buried at Sutton Hoo in Suffolk, probably for the East Anglian king Rædwald. Basil Brown excavated it in 1939.",
    cites: [W("Sutton_Hoo", "Sutton Hoo"), B("topic/Sutton-Hoo", "Sutton Hoo")] },
  { id: "w503-whitby", branch: "anglo-saxons", y: 664, when: "663/664", title: "Synod of Whitby chooses Roman Easter practice", imp: 3,
    text: "Northumbria's church, converted mainly by Celtic missionaries, met at Whitby to decide between Celtic and Roman usages. King Oswiu chose Rome; Britannica calls the meeting a vital turning point for the church in England.",
    cites: [B("event/Synod-of-Whitby", "Synod of Whitby")] },
  { id: "w503-bede-history", branch: "anglo-saxons", y: 731, when: "c. 731", title: "Bede completes the Ecclesiastical History", imp: 2,
    text: "Bede's Historia ecclesiastica gentis Anglorum told England's conversion to Christianity in five books. Bede also helped popularize dating from Christ's birth (Anno Domini).",
    cites: [B("topic/Ecclesiastical-History-of-the-English-People", "Ecclesiastical History of the English People"), W("Bede", "Bede")] },
  { id: "w503-lindisfarne", branch: "anglo-saxons", y: D(793, 6, 8), when: "June 8, 793", title: "Vikings raid Lindisfarne", imp: 2, link: "vikings",
    text: "Norse raiders looted the Northumbrian island monastery and killed or enslaved monks. The shock to Christian Europe is often taken as the start of the Viking Age.",
    cites: [B("event/Lindisfarne-Raid", "Lindisfarne raid"), W("Viking_raid_on_Lindisfarne", "Viking raid on Lindisfarne")] },
  { id: "w503-edington", branch: "anglo-saxons", y: D(878, 5, 12), when: "May 6–12, 878", title: "Alfred defeats the Danes at Edington", imp: 2, link: "vikings",
    text: "After fleeing Guthrum's surprise attack at Chippenham, Alfred won decisively at Edington. Britannica says this victory saved Anglo-Saxon independence.",
    cites: [B("event/Battle-of-Edington", "Battle of Edington")] },
  { id: "w503-chronicle", branch: "anglo-saxons", y: 890, when: "compiled in Alfred's reign (871–899)", title: "The Anglo-Saxon Chronicle begins", imp: 2,
    text: "Compiled in King Alfred's reign from Bede, genealogies and West Saxon annals, the year-by-year Chronicle survives in nine manuscripts and fragments, and one version was kept up until 1154.",
    cites: [B("topic/Anglo-Saxon-Chronicle", "Anglo-Saxon Chronicle"), W("Anglo-Saxon_Chronicle", "Anglo-Saxon Chronicle")] },

  // ---------- Asturias and León ----------
  { id: "w503-covadonga", branch: "asturias-leon", y: 722, when: "722 (Britannica: c. 720)", title: "Pelagius's victory at Covadonga", imp: 2,
    text: "Pelagius (Pelayo) held out against an Umayyad force led by Alqama in the Asturian mountains. Tradition sees it as the founding of the Kingdom of Asturias and the start of the Reconquista.",
    cites: [W("Battle_of_Covadonga", "Battle of Covadonga"), B("event/Battle-of-Covadonga", "Battle of Covadonga")] },
  { id: "w503-beatus", branch: "asturias-leon", y: 776, when: "776 (revised 784, 786)", title: "Beatus of Liébana writes his Apocalypse Commentary", imp: 3,
    text: "Beatus compiled a commentary on the Apocalypse that was designed to be illustrated. Its later copies, from the 9th to 13th centuries, are among the finest Mozarabic illuminated manuscripts.",
    cites: [B("topic/Beatus-Apocalypses", "Beatus Apocalypses"), W("Beatus_of_Li%C3%A9bana", "Beatus of Liébana")] },
  { id: "w503-st-james-tomb", branch: "asturias-leon", y: 814, when: "c. 814 (tradition)", title: "Tomb of St. James found; pilgrimage begins", imp: 2,
    text: "Tradition holds that the apostle James's body was discovered at Compostela around 814 under Alfonso II, who became its first pilgrim. The Camino de Santiago grew into a major medieval pilgrimage.",
    cites: [W("Alfonso_II_of_Asturias", "Alfonso II of Asturias"), W("Camino_de_Santiago", "Camino de Santiago")] },
  { id: "w503-simancas", branch: "asturias-leon", y: D(939, 7, 19), when: "July 19, 939", title: "Ramiro II defeats Abd al-Rahman III at Simancas", imp: 3, link: "al-andalus",
    text: "Ramiro II of León, with Castilian and Navarrese allies, defeated the caliph's army near Simancas, which Britannica counts among his major victories over Córdoba.",
    cites: [B("biography/Ramiro-II-king-of-Leon-and-Asturias", "Ramiro II"), W("Battle_of_Simancas", "Battle of Simancas")] },

  // ---------- Byzantine Empire ----------
  { id: "w503-theodosian-walls", branch: "byzantine", y: 413, when: "413", title: "Theodosian Walls completed at Constantinople", imp: 2,
    text: "Under the young Theodosius II, prefect Anthemius had the great land walls built; they were restored in about sixty days after the 447 earthquake. They held against sieges until 1453.",
    cites: [B("biography/Theodosius-II", "Theodosius II"), W("Theodosian_Walls", "Theodosian Walls")] },
  { id: "w503-siege-626", branch: "byzantine", y: 626.5, when: "June–August 626", title: "Avars and Persians fail to take Constantinople", imp: 2, link: "sasanian",
    text: "While Heraclius was away fighting Persia, an Avar and Slav host and a Persian army besieged the capital. Byzantine ships defeated the Slav boats and the Avars withdrew; Patriarch Sergius's icon processions kept morale high.",
    cites: [B("place/Byzantine-Empire/The-successors-of-Justinian-565-610", "Byzantine Empire: The successors of Justinian"), W("Siege_of_Constantinople_(626)", "Siege of Constantinople (626)")] },
  { id: "w503-crete-reconquest", branch: "byzantine", y: D(961, 3, 6), when: "March 6–7, 961", title: "Nikephoros Phokas retakes Crete", imp: 3,
    text: "After a nine-month siege of Chandax, Nikephoros Phokas ended Arab rule on Crete, held since 826, and later became emperor. The victory restored Byzantine control of the Aegean.",
    cites: [W("Nikephoros_II_Phokas", "Nikephoros II Phokas"), B("biography/Nicephorus-II-Phocas", "Nicephorus II Phocas")] },

  // ---------- Dál Riata ----------
  { id: "w503-iona-founded", branch: "dal-riata", y: 563, when: "563", title: "Columba founds the monastery of Iona", imp: 2, link: "ireland",
    text: "Columba (Colm Cille) sailed from Ireland with twelve companions and founded an abbey on Iona, in Dál Riata. It became a leading center of Celtic Christianity and learning in Britain and Ireland.",
    cites: [B("biography/Saint-Columba", "Saint Columba"), W("Iona", "Iona")] },
  { id: "w503-book-kells", branch: "dal-riata", y: 800, when: "c. 800", title: "The Book of Kells, probably begun on Iona", imp: 2,
    text: "A richly illuminated Gospel book, made about 800 by Columban monks and probably begun at Iona and finished at Kells. It is held at Trinity College Dublin. Its exact place of making is debated.",
    cites: [O("The Book of Kells — Trinity College Dublin Library", "https://www.tcd.ie/library/research-collections/book-of-kells.php"), B("topic/Book-of-Kells", "Book of Kells"), W("Book_of_Kells", "Book of Kells")] },

  // ---------- East Francia ----------
  { id: "w503-conrad-i", branch: "east-francia", y: D(911, 11, 10), when: "November 10, 911", title: "Conrad I elected, the first non-Carolingian king", imp: 2,
    text: "After Louis the Child died, the dukes of Saxony, Swabia and Bavaria chose Conrad at Forchheim, passing over the West Frankish Carolingian Charles the Simple. Lotharingia turned to the West Frankish king.",
    cites: [B("biography/Conrad-I-king-of-Germany", "Conrad I"), W("Conrad_I_of_Germany", "Conrad I of Germany")] },
  { id: "w503-lechfeld", branch: "east-francia", y: D(955, 8, 10), when: "August 10–12, 955", title: "Otto I crushes the Magyars at the Lechfeld", imp: 2,
    text: "Otto I's army defeated the Hungarian host that was besieging Augsburg. The victory ended their major raids in the West and bolstered his claim to the imperial crown in 962.",
    cites: [W("Battle_of_Lechfeld_(955)", "Battle of Lechfeld"), B("event/Battle-of-Lechfeld", "Battle of Lechfeld")] },

  // ---------- Kingdom of England ----------
  { id: "w503-brunanburh", branch: "england", y: 937.75, when: "autumn 937", title: "Æthelstan wins at Brunanburh", imp: 2,
    text: "Æthelstan beat an alliance of Olaf Guthfrithson of Dublin, Constantine II of Scotland and Owain of Strathclyde. Some historians credit the victory with helping make England a unified kingdom.",
    cites: [W("Battle_of_Brunanburh", "Battle of Brunanburh"), B("event/Battle-of-Brunanburh", "Battle of Brunanburh")] },
  { id: "w503-edgar-bath", branch: "england", y: D(973, 5, 11), when: "Whitsunday, May 11, 973", title: "Edgar crowned at Bath", imp: 2,
    text: "Edgar was crowned at Bath; Britannica calls him the first king of all England, and the rite descends into later English coronations. His queen Ælfthryth was consecrated the same year.",
    cites: [B("place/Bath-England", "Bath"), W("Edgar,_King_of_England", "Edgar, King of England")] },
  { id: "w503-exeter-book", branch: "england", y: 975, when: "c. 960–990", title: "The Exeter Book, great codex of Old English verse", imp: 2,
    text: "Copied in the late 10th century, the manuscript holds 95 riddles and elegies such as The Wanderer and The Seafarer. UNESCO inscribed it on its Memory of the World register in 2016.",
    cites: [B("topic/Exeter-Book", "Exeter Book"), O("The Exeter Book — Exeter Cathedral", "https://www.exeter-cathedral.org.uk/learning-collections/explore-the-collections/the-exeter-book/"), W("Exeter_Book", "Exeter Book")] },
] });

TL.geo("w503-hiram-solomon", { scope: "place", lat: 33.27, lon: 35.2, r: 40, label: "Tyre, Lebanon", src: "https://en.wikipedia.org/wiki/Tyre,_Lebanon" });
TL.geo("w503-carthage-founded", { scope: "place", lat: 36.853, lon: 10.323, r: 40, label: "Carthage, Tunisia", src: "https://en.wikipedia.org/wiki/Carthage" });
TL.geo("w503-necho-circumnavigation", { scope: "region", lat: 0, lon: 20, r: 4000, label: "Africa", src: "https://en.wikipedia.org/wiki/Africa" });
TL.geo("w503-nebuchadnezzar-tyre", { scope: "place", lat: 33.27, lon: 35.2, r: 40, label: "Tyre, Lebanon", src: "https://en.wikipedia.org/wiki/Tyre,_Lebanon" });
TL.geo("w503-alexander-tyre", { scope: "place", lat: 33.27, lon: 35.2, r: 40, label: "Tyre, Lebanon", src: "https://en.wikipedia.org/wiki/Tyre,_Lebanon" });
TL.geo("w503-peace-jovian", { scope: "place", lat: 37.08, lon: 41.22, r: 60, label: "Nusaybin (Nisibis), Turkey", src: "https://en.wikipedia.org/wiki/Nusaybin" });
TL.geo("w503-peroz-killed", { scope: "region", lat: 36.76, lon: 66.9, r: 600, label: "Khorasan and Bactria (east Iran)", src: "https://en.wikipedia.org/wiki/Khorasan_(region)" });
TL.geo("w503-khosrow-antioch", { scope: "place", lat: 36.2, lon: 36.16, r: 40, label: "Antakya (Antioch), Turkey", src: "https://en.wikipedia.org/wiki/Antakya" });
TL.geo("w503-taq-kasra", { scope: "place", lat: 33.0936, lon: 44.5806, r: 40, label: "Ctesiphon, Iraq", src: "https://en.wikipedia.org/wiki/Ctesiphon" });
TL.geo("w503-nineveh-627", { scope: "place", lat: 36.36, lon: 43.15, r: 60, label: "Nineveh, Iraq", src: "https://en.wikipedia.org/wiki/Nineveh" });
TL.geo("w503-nahavand", { scope: "place", lat: 34.19, lon: 48.37, r: 50, label: "Nahavand, Iran", src: "https://en.wikipedia.org/wiki/Nahavand" });
TL.geo("w503-antioch-founded", { scope: "place", lat: 36.2, lon: 36.16, r: 40, label: "Antakya (Antioch), Turkey", src: "https://en.wikipedia.org/wiki/Antakya" });
TL.geo("w503-panium", { scope: "place", lat: 33.248, lon: 35.694, r: 40, label: "Banias, Golan Heights", src: "https://en.wikipedia.org/wiki/Banias" });
TL.geo("w503-magnesia", { scope: "place", lat: 38.61, lon: 27.43, r: 60, label: "Manisa, Turkey", src: "https://en.wikipedia.org/wiki/Manisa" });
TL.geo("w503-maccabean-revolt", { scope: "place", lat: 31.78, lon: 35.23, r: 50, label: "Jerusalem", src: "https://en.wikipedia.org/wiki/Jerusalem" });
TL.geo("w503-damascus-mosque", { scope: "place", lat: 33.511, lon: 36.307, r: 30, label: "Damascus, Syria", src: "https://en.wikipedia.org/wiki/Umayyad_Mosque" });
TL.geo("w503-siege-constantinople-717", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Istanbul (Constantinople)", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w503-zab", { scope: "region", lat: 35.99, lon: 43.34, r: 100, label: "Great Zab River, Iraq", src: "https://en.wikipedia.org/wiki/Great_Zab" });
TL.geo("w503-tariq-landing", { scope: "place", lat: 36.14, lon: -5.35, r: 40, label: "Gibraltar", src: "https://en.wikipedia.org/wiki/Gibraltar" });
TL.geo("w503-abd-rahman-i", { scope: "place", lat: 37.89, lon: -4.78, r: 40, label: "Córdoba, Spain", src: "https://en.wikipedia.org/wiki/C%C3%B3rdoba,_Spain" });
TL.geo("w503-great-mosque-cordoba", { scope: "place", lat: 37.879, lon: -4.78, r: 30, label: "Córdoba, Spain", src: "https://en.wikipedia.org/wiki/Mosque%E2%80%93Cathedral_of_C%C3%B3rdoba" });
TL.geo("w503-ziryab", { scope: "place", lat: 37.89, lon: -4.78, r: 40, label: "Córdoba, Spain", src: "https://en.wikipedia.org/wiki/C%C3%B3rdoba,_Spain" });
TL.geo("w503-homer-epics", { scope: "region", lat: 38.2, lon: 27.5, r: 300, label: "Ionia, Aegean coast", src: "https://en.wikipedia.org/wiki/Ionia" });
TL.geo("w503-draco-code", { scope: "place", lat: 37.98, lon: 23.73, r: 40, label: "Athens, Greece", src: "https://en.wikipedia.org/wiki/Athens" });
TL.geo("w503-parthenon", { scope: "place", lat: 37.9715, lon: 23.7267, r: 30, label: "Acropolis, Athens", src: "https://en.wikipedia.org/wiki/Parthenon" });
TL.geo("w503-hengist-horsa", { scope: "place", lat: 51.31, lon: 1.35, r: 40, label: "Ebbsfleet, Isle of Thanet", src: "https://en.wikipedia.org/wiki/Ebbsfleet,_Thanet" });
TL.geo("w503-sutton-hoo", { scope: "place", lat: 52.0897, lon: 1.3379, r: 30, label: "Sutton Hoo, Suffolk", src: "https://en.wikipedia.org/wiki/Sutton_Hoo" });
TL.geo("w503-whitby", { scope: "place", lat: 54.486, lon: -0.613, r: 40, label: "Whitby, England", src: "https://en.wikipedia.org/wiki/Whitby" });
TL.geo("w503-bede-history", { scope: "place", lat: 54.98, lon: -1.49, r: 40, label: "Jarrow, England", src: "https://en.wikipedia.org/wiki/Jarrow" });
TL.geo("w503-lindisfarne", { scope: "place", lat: 55.68, lon: -1.8, r: 40, label: "Lindisfarne, England", src: "https://en.wikipedia.org/wiki/Lindisfarne" });
TL.geo("w503-edington", { scope: "place", lat: 51.28, lon: -2.1, r: 50, label: "Edington, Wiltshire", src: "https://en.wikipedia.org/wiki/Edington,_Wiltshire" });
TL.geo("w503-chronicle", { scope: "place", lat: 51.06, lon: -1.31, r: 40, label: "Winchester, England", src: "https://en.wikipedia.org/wiki/Winchester" });
TL.geo("w503-covadonga", { scope: "place", lat: 43.32, lon: -5.05, r: 40, label: "Covadonga, Asturias", src: "https://en.wikipedia.org/wiki/Covadonga" });
TL.geo("w503-beatus", { scope: "region", lat: 43.15, lon: -4.62, r: 80, label: "Liébana, Cantabria", src: "https://en.wikipedia.org/wiki/Li%C3%A9bana" });
TL.geo("w503-st-james-tomb", { scope: "place", lat: 42.88, lon: -8.54, r: 40, label: "Santiago de Compostela", src: "https://en.wikipedia.org/wiki/Santiago_de_Compostela" });
TL.geo("w503-simancas", { scope: "place", lat: 41.59, lon: -4.82, r: 40, label: "Simancas, Spain", src: "https://en.wikipedia.org/wiki/Simancas" });
TL.geo("w503-theodosian-walls", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Istanbul (Constantinople)", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w503-siege-626", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Istanbul (Constantinople)", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w503-crete-reconquest", { scope: "place", lat: 35.34, lon: 25.13, r: 40, label: "Heraklion, Crete", src: "https://en.wikipedia.org/wiki/Heraklion" });
TL.geo("w503-iona-founded", { scope: "place", lat: 56.33, lon: -6.41, r: 30, label: "Iona, Scotland", src: "https://en.wikipedia.org/wiki/Iona" });
TL.geo("w503-book-kells", { scope: "place", lat: 56.33, lon: -6.41, r: 30, label: "Iona, Scotland", src: "https://en.wikipedia.org/wiki/Iona" });
TL.geo("w503-conrad-i", { scope: "place", lat: 49.72, lon: 11.06, r: 40, label: "Forchheim, Germany", src: "https://en.wikipedia.org/wiki/Forchheim" });
TL.geo("w503-lechfeld", { scope: "place", lat: 48.35, lon: 10.92, r: 50, label: "Lechfeld, near Augsburg", src: "https://en.wikipedia.org/wiki/Lechfeld" });
TL.geo("w503-brunanburh", { scope: "place", lat: 53.34, lon: -2.98, r: 60, label: "Bromborough, Wirral", src: "https://en.wikipedia.org/wiki/Bromborough" });
TL.geo("w503-edgar-bath", { scope: "place", lat: 51.38, lon: -2.36, r: 30, label: "Bath, England", src: "https://en.wikipedia.org/wiki/Bath,_Somerset" });
TL.geo("w503-exeter-book", { scope: "place", lat: 50.73, lon: -3.53, r: 30, label: "Exeter, England", src: "https://en.wikipedia.org/wiki/Exeter" });
