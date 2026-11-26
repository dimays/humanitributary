// Fill-in W5-04: 1000 BCE – 1000 CE — Etruscans, Franks, Germanic peoples, Hellenistic world, Navarre, Picts, Roman Empire, Roman Kingdom, Roman Republic, Scotland, Vikings and Visigoths (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });

TL.add({ events: [
  // ---------- Roman Kingdom ----------
  { id: "w504-rome-founded", branch: "roman-kingdom", y: -753, when: "753 BCE (traditional)", title: "Traditional founding of Rome",
    text: "Roman tradition dated the city's founding, and the start of the regal period, to 753 BCE. Britannica describes seven kings, from Romulus on, who ruled before the Republic began.", imp: 2,
    cites: [B("place/ancient-Rome", "Ancient Rome"), B("biography/Numa-Pompilius", "Numa Pompilius")] },
  { id: "w504-numa", branch: "roman-kingdom", y: -715, end: -673, when: "traditionally 715–673 BCE", title: "Numa Pompilius and Rome's religious calendar",
    text: "Tradition made Numa the second king and credited him with the religious calendar, the Vestal Virgins and the pontifex maximus. Britannica notes these institutions in fact accumulated over centuries.", imp: 3,
    cites: [B("biography/Numa-Pompilius", "Numa Pompilius")] },
  { id: "w504-servius-tullius", branch: "roman-kingdom", y: -578, end: -535, when: "traditionally 578–535 BCE", title: "Servius Tullius and the five property classes",
    text: "The sixth king is credited with the Servian Constitution, which divided citizens into five classes by wealth, and with founding Diana's shrine on the Aventine. Britannica suspects later reforms were read back into his reign.", imp: 3,
    cites: [B("biography/Servius-Tullius", "Servius Tullius")] },
  { id: "w504-cloaca-maxima", branch: "roman-kingdom", y: -575, when: "6th century BCE", title: "Cloaca Maxima drains the Forum",
    text: "Rome's great sewer began as an open channel made in the 6th century BCE by lining a stream bed with stone. It was vaulted over from the 3rd century BCE and carried storm water from the Forum district to the Tiber.", imp: 3,
    cites: [B("topic/Cloaca-Maxima", "Cloaca Maxima")] },

  // ---------- Etruscans ----------
  { id: "w504-regolini-galassi", branch: "etruscans", y: -650, when: "7th century BCE", title: "Regolini-Galassi tomb at Caere",
    text: "Caere (Cerveteri) produced Orientalizing works, such as those found in the Regolini-Galassi tomb, and Britannica notes the area's tombs date from the 9th century BCE onward.", imp: 3,
    cites: [B("place/Caere", "Caere")] },
  { id: "w504-fowling-fishing-tomb", branch: "etruscans", y: -520, when: "c. 520 BCE", title: "Painted tombs of Tarquinia: Fowling and Fishing",
    text: "Tarquinia's necropolis holds the most important painted tombs of Etruria, rock-cut chambers from the 6th to 4th century BCE. The Tomb of Fowling and Fishing, with polychrome frescoes, dates to about 520 BCE.", imp: 2,
    cites: [B("place/Tarquinia", "Tarquinia")] },
  { id: "w504-veii-destroyed", branch: "etruscans", y: -396, when: "396 BCE", title: "Rome destroys Veii",
    text: "After a series of wars, Rome destroyed Veii, the Etruscan city ten miles northwest of it that had once dominated Rome.", imp: 2, link: "roman-republic",
    cites: [B("place/Veii", "Veii")] },
  { id: "w504-sentinum", branch: "etruscans", y: -295, when: "295 BCE", title: "Battle of Sentinum breaks the Italic coalition",
    text: "Rome beat an alliance of Samnites, Senone Gauls, Etruscans and Umbrians near Sentinum, the largest coalition of the Samnite Wars. The Etruscans withdrew to defend their own lands, and the alliance broke up.", imp: 2, link: "roman-republic",
    cites: [W("Battle_of_Sentinum", "Battle of Sentinum"), { t: "The Battle of Sentinum — UNRV Roman History", u: "https://www.unrv.com/articles/the-battle-of-sentinum.php" }] },
  { id: "w504-liber-linteus", branch: "etruscans", y: -250, when: "c. 250 BCE (3rd century BCE)", title: "The Zagreb linen book, longest Etruscan text",
    text: "A linen ritual book of about 1,300 words was later cut into strips to wrap an Egyptian mummy. It is the longest surviving Etruscan text and is now in Zagreb.", imp: 3,
    cites: [W("Liber_Linteus", "Liber Linteus"), B("topic/Etruscan-language", "Etruscan language")] },

  // ---------- Roman Republic ----------
  { id: "w504-gallic-sack", branch: "roman-republic", y: -390, when: "390 BCE", title: "Gauls sack Rome",
    text: "A Gallic tribe that had swept down the Po valley sacked Rome in 390 BCE and left only after receiving a ransom in gold.", imp: 2,
    cites: [B("topic/Roman-Republic", "Roman Republic")] },
  { id: "w504-appian-way", branch: "roman-republic", y: -312, when: "312 BCE", title: "Appius Claudius builds the Appian Way and first aqueduct",
    text: "As censor, Appius Claudius Caecus began the Appian Way and completed the Aqua Appia, Rome's first aqueduct, bringing water from the Sabine Hills.", imp: 2,
    cites: [B("biography/Appius-Claudius-Caecus", "Appius Claudius Caecus"), B("topic/Appian-Way", "Appian Way")] },

  // ---------- Hellenistic ----------
  { id: "w504-pydna", branch: "hellenistic", y: -168.4, when: "June 22, 168 BCE", title: "Battle of Pydna ends Macedonian independence",
    text: "Lucius Aemilius Paullus drew King Perseus out of a strong position and beat him on the plain at Pydna. The legion proved more flexible than the phalanx, and the Roman victory ended the Third Macedonian War.", imp: 2, link: "roman-republic",
    cites: [B("event/Battle-of-Pydna", "Battle of Pydna")] },
  { id: "w504-hipparchus", branch: "hellenistic", y: -147, end: -127, when: "observations 147–127 BCE", title: "Hipparchus charts the stars from Rhodes",
    text: "Hipparchus spent most of his adult life on Rhodes. Ptolemy cites over 20 of his observations from 147 to 127 BCE, and he is credited with a star catalog assigning names and positions to stars.", imp: 2,
    cites: [B("biography/Hipparchus-Greek-astronomer", "Hipparchus")] },
  { id: "w504-antikythera", branch: "hellenistic", y: -100, when: "c. 100 BCE", title: "The Antikythera mechanism",
    text: "This Greek mechanical device, made around 100 BCE, had the earliest known scientific dials and scales. It was recovered in 1901 from a trading ship that sank near the island of Antikythera.", imp: 2,
    cites: [B("topic/Antikythera-mechanism", "Antikythera mechanism")] },

  // ---------- Germanic peoples ----------
  { id: "w504-ariovistus", branch: "germanic-peoples", y: -58, when: "58 BCE", title: "Caesar defeats the Germanic king Ariovistus",
    text: "Ariovistus, invited into Gaul by the Arverni against the Aedui, gave Caesar a pretext for the Gallic Wars. Caesar defeated him in the Sundgau in 58 BCE.", imp: 3, link: "roman-republic",
    cites: [B("biography/Ariovistus", "Ariovistus")] },
  { id: "w504-teutoburg", branch: "germanic-peoples", y: 9.7, when: "autumn 9 CE", title: "Arminius destroys three Roman legions",
    text: "Arminius ambushed the army of Publius Quinctilius Varus in the Teutoburg Forest and destroyed all three legions over four days. The defeat stopped Rome from conquering Germania east of the Rhine.", imp: 2, link: "roman-empire",
    cites: [B("event/Battle-of-the-Teutoburg-Forest", "Battle of the Teutoburg Forest"), B("biography/Arminius", "Arminius")] },
  { id: "w504-marcomannic", branch: "germanic-peoples", y: 168, when: "167 or 168 CE", title: "Germanic tribes invade Italy and besiege Aquileia",
    text: "While Marcus Aurelius and Lucius Verus marched on the Danube, a horde of German tribes invaded Italy and besieged Aquileia. About three years of fighting restored the frontier.", imp: 3, link: "roman-empire",
    cites: [B("biography/Marcus-Aurelius-Roman-emperor", "Marcus Aurelius")] },
  { id: "w504-runes", branch: "germanic-peoples", y: 250, when: "from the 3rd century CE", title: "Runic writing used by Germanic peoples",
    text: "Germanic peoples wrote in runes from the 3rd century. The earliest script had 24 letters, its first six (f, u, th, a, r, k) giving the “futhark” its name.", imp: 3,
    cites: [B("topic/runic-alphabet", "Runic alphabet")] },
  { id: "w504-ulfilas", branch: "germanic-peoples", y: 341, when: "341 CE", title: "Ulfilas becomes bishop and gives the Goths a Bible",
    text: "Ulfilas became bishop of the Gothic Christians in 341. He is credited with creating the Gothic alphabet and translating the Bible into Gothic, the first Bible in a Germanic language.", imp: 2,
    cites: [B("biography/Ulfilas", "Ulfilas")] },
  { id: "w504-adrianople", branch: "germanic-peoples", y: 378.6, when: "August 9, 378", title: "Goths destroy a Roman army at Adrianople",
    text: "Fritigern's Visigoths, joined by Ostrogoths and others, defeated a Roman army under Emperor Valens near Adrianople. Britannica says it exposed Roman vulnerability to peoples beyond the frontier.", imp: 2, link: "roman-empire",
    cites: [B("event/Battle-of-Adrianople", "Battle of Adrianople")] },
  { id: "w504-odoacer", branch: "germanic-peoples", y: 476, when: "476 CE", title: "Odoacer takes power in Italy",
    text: "Odoacer, a Germanic warrior probably of the Sciri, took power in 476, the date traditionally seen as the end of the Western Roman Empire.", imp: 2,
    cites: [B("biography/Odoacer", "Odoacer")] },
  { id: "w504-codex-argenteus", branch: "germanic-peoples", y: 525, when: "6th century CE", title: "The Codex Argenteus, the Gothic “Silver Bible”",
    text: "A Gothic Gospel book in gold and silver ink on purple parchment, thought to have belonged to Theodoric the Great. Radiocarbon dating placed it in the 6th century. UNESCO listed it in 2011.", imp: 2,
    cites: [W("Codex_Argenteus", "Codex Argenteus"), { t: "Codex Argenteus — Uppsala University Library", u: "https://www.uu.se/en/library/visit-and-contact/exhibitions/codex-argenteus" }, B("topic/Codex-Argenteus", "Codex Argenteus")] },

  // ---------- Roman Empire ----------
  { id: "w504-aeneid", branch: "roman-empire", y: -19, when: "c. 30–19 BCE", title: "Virgil writes the Aeneid",
    text: "Virgil composed the Latin epic from about 30 to 19 BCE, leaving about 60 lines unfinished at his death. It makes the Trojan Aeneas the founder of Roman greatness.", imp: 1,
    cites: [B("topic/Aeneid", "Aeneid")] },
  { id: "w504-colosseum", branch: "roman-empire", y: 80, when: "begun 70–72, dedicated 80 CE", title: "The Colosseum is dedicated",
    text: "Vespasian began the Flavian Amphitheater between 70 and 72 CE as an entertainment venue. His son Titus dedicated it in 80, paid for with plunder from his campaign.", imp: 2,
    cites: [B("topic/Colosseum", "Colosseum")] },
  { id: "w504-pantheon", branch: "roman-empire", y: 123, when: "between 118 and 128 CE", title: "Hadrian rebuilds the Pantheon",
    text: "The Pantheon, begun in 27 BCE by Agrippa, was completely rebuilt by Hadrian between 118 and 128 CE. Septimius Severus and Caracalla later altered it.", imp: 2,
    cites: [B("topic/Pantheon-building-Rome-Italy", "Pantheon")] },
  { id: "w504-antonine-edict", branch: "roman-empire", y: 212, when: "212 CE", title: "Caracalla grants citizenship to free inhabitants",
    text: "The Constitutio Antoniniana extended Roman citizenship to nearly all free inhabitants of the empire. Some historians suspect the motive was tax revenue.", imp: 2,
    cites: [B("biography/Caracalla", "Caracalla"), B("topic/Edict-of-Caracalla", "Edict of Caracalla")] },

  // ---------- Franks ----------
  { id: "w504-vouille", branch: "franks", y: 507, when: "507 CE", title: "Clovis defeats the Visigoths at Vouillé",
    text: "Clovis I beat the Visigoths under Alaric II, who was killed. The Franks took most Visigothic lands in Gaul.", imp: 2, link: "visigoths",
    cites: [B("event/Battle-of-Vouille", "Battle of Vouillé")] },
  { id: "w504-salic-law", branch: "franks", y: 509, when: "c. 507–511 CE", title: "Salic Law is issued under Clovis",
    text: "The code of the Salian Franks was issued in the reign of Clovis. Britannica calls it the most important of the Germanic law codes, though not the oldest.", imp: 2,
    cites: [B("topic/Salic-law", "Salic law")] },
  { id: "w504-gregory-of-tours", branch: "franks", y: 594, when: "by 594 CE", title: "Gregory of Tours writes the Histories",
    text: "Bishop Gregory of Tours (died 594) wrote the Ten Books of Histories, the key 6th-century source on the Merovingian Franks.", imp: 2,
    cites: [B("biography/Saint-Gregory-of-Tours", "Gregory of Tours")] },
  { id: "w504-tertry", branch: "franks", y: 687, when: "687 CE", title: "Pippin II wins at Tertry",
    text: "Pippin II, mayor of the palace of Austrasia, defeated Theuderic III of Neustria at Tertry. He became the Franks' effective ruler, strengthening the Carolingian family.", imp: 2,
    cites: [B("event/Battle-of-Tertry", "Battle of Tertry")] },

  // ---------- Picts ----------
  { id: "w504-great-conspiracy", branch: "picts", y: 367, end: 368, when: "367–368 CE", title: "The Great Conspiracy: Picts raid Roman Britain",
    text: "Picts, Attacotti, Scoti and Saxons raided Roman Britain at once, with Franks and Saxons landing in Gaul. Theodosius the Elder, sent by Valentinian I, arrived in 368 and restored order.", imp: 2, link: "roman-empire",
    cites: [W("Great_Conspiracy", "Great Conspiracy"), B("biography/Valentinian-I", "Valentinian I")] },
  { id: "w504-symbol-stones", branch: "picts", y: 550, end: 850, when: "6th–9th centuries", title: "Pictish symbol stones are carved",
    text: "Pictish stones carry symbols such as the crescent and V-rod, mirror and comb, and the Pictish Beast. Class I stones date from the 6th to 8th century, and about 350 survive.", imp: 2,
    cites: [W("Pictish_stone", "Pictish stone"), { t: "Designs and Symbols — Groam House Museum", u: "https://openvirtualworlds.org/omeka/exhibits/show/groam-house-museum/pictish-art/designs-and-symbols" }] },
  { id: "w504-nechtan-easter", branch: "picts", y: 710, when: "c. 710 CE", title: "Nechtan seeks Rome's Easter reckoning",
    text: "Pictish king Nechtan adopted the Roman Easter date and asked Abbot Ceolfrid of Jarrow for arguments supporting it. In 717 he drove out clergy tied to Iona, possibly as part of the dispute.", imp: 3,
    cites: [W("Nechtan_mac_Der-Ilei", "Nechtan mac Der-Ilei"), { t: "Nechtan — Dictionary of National Biography (Wikisource)", u: "https://en.wikisource.org/wiki/Nechtan_(DNB00)" }] },
  { id: "w504-aberlemno", branch: "picts", y: 850, when: "mid-9th century CE (debated)", title: "Aberlemno churchyard cross-slab",
    text: "The Aberlemno churchyard cross-slab has a narrative battle scene. It was once linked to Dun Nechtain (685), but redating to the mid-9th century weakened that view. Historic Environment Scotland dates the stones broadly to AD 500–800.", imp: 3,
    cites: [W("Aberlemno_sculptured_stones", "Aberlemno sculptured stones"), { t: "Aberlemno Sculptured Stones — Historic Environment Scotland", u: "https://www.historicenvironment.scot/visit-a-place/places/aberlemno-sculptured-stones/" }] },

  // ---------- Scotland ----------
  { id: "w504-kenneth", branch: "scotland", y: 843, when: "842 or 843", title: "Kenneth MacAlpin unites Scots and Picts",
    text: "Kenneth I MacAlpin, king of the Scots of Dalriada, also became king of the Picts around 843. Britannica calls him the first king of Scotland north of the Forth–Clyde line.", imp: 2,
    cites: [B("biography/Kenneth-I", "Kenneth I"), B("topic/Pict", "Pict"), W("Kenneth_MacAlpin", "Kenneth MacAlpin")] },
  { id: "w504-scone-906", branch: "scotland", y: 906, when: "906", title: "Constantine II and Bishop Cellach meet at Scone",
    text: "Constantine II (reigned 900–943) and Bishop Cellach met at the Hill of Belief near Scone. Historians debate what was agreed, though it is linked to church law and religious practice.", imp: 3,
    cites: [W("Constantine_II_of_Scotland", "Constantine II of Scotland"), B("biography/Constantine-II-king-of-Scotland", "Constantine II")] },

  // ---------- Vikings ----------
  { id: "w504-oseberg", branch: "vikings", y: 834.7, when: "autumn 834", title: "Oseberg ship burial of two women",
    text: "Tree-ring dating places the Oseberg burial in autumn 834. Excavated in 1904–05, the mound held two women, four sleighs, a cart and textiles; the ship is in Oslo.", imp: 2,
    cites: [W("Oseberg_ship", "Oseberg ship"), B("topic/Oseberg-ship", "Oseberg ship")] },
  { id: "w504-great-heathen-army", branch: "vikings", y: 865, when: "865", title: "The Great Heathen Army lands in East Anglia",
    text: "A large Viking force arrived in East Anglia in 865 intending to conquer, not just plunder. It overran Northumbria, East Anglia and Mercia.", imp: 2, link: "anglo-saxons",
    cites: [B("topic/Great-Heathen-Army", "Great Heathen Army")] },
  { id: "w504-iceland-settled", branch: "vikings", y: 874, end: 930, when: "traditionally 874–930", title: "Norse settlement of Iceland",
    text: "Iceland was settled by a mixed Norse and Celtic population. Tradition names Ingólfr Arnarson as first permanent settler in 874; the settlement period is held to end c. 930.", imp: 2,
    cites: [W("Settlement_of_Iceland", "Settlement of Iceland"), B("place/Iceland", "Iceland")] },
  { id: "w504-althing", branch: "vikings", y: 930, when: "c. 930", title: "The Althing is founded at Thingvellir",
    text: "Iceland's national assembly, the Althing, was founded at Thingvellir c. 930. Britannica gives its span as c. 930 to 1798, before its 1845 revival.", imp: 2,
    cites: [B("topic/Althing", "Althing")] },
  { id: "w504-jelling", branch: "vikings", y: 965, when: "c. 965", title: "Harald Bluetooth raises the Jelling stone",
    text: "Harald Bluetooth's runestone at Jelling says he won all of Denmark and made the Danes Christian. A carved Christ on one side earns it the name “Denmark's baptismal certificate.”", imp: 2,
    cites: [W("Jelling_stones", "Jelling stones"), B("biography/Harald-I-king-of-Denmark", "Harald I")] },

  // ---------- Navarre ----------
  { id: "w504-sancho-garces-i", branch: "navarre", y: 905, when: "905", title: "Sancho I Garcés becomes king of Pamplona",
    text: "Sancho I Garcés ruled Pamplona (Navarre) from 905 until his death in 925.", imp: 3,
    cites: [B("biography/Sancho-I-Garces", "Sancho I Garcés")] },
  { id: "w504-valdejunquera", branch: "navarre", y: 920.55, when: "July 26, 920", title: "Battle of Valdejunquera",
    text: "Pamplona and León, led by Sancho Garcés I and Ordoño II, fought Abd al-Rahman III's Córdoban army near Muez in Navarre. The Cordobans won, and Ordoño's Leonese army was routed.", imp: 3,
    cites: [W("Battle_of_Valdejunquera", "Battle of Valdejunquera"), B("biography/Abd-al-Rahman-III", "Abd al-Rahman III")] },
  { id: "w504-codex-vigilanus", branch: "navarre", y: 976, when: "881, updated to 976", title: "Codex Vigilanus made at Albelda",
    text: "Monks of San Martín de Albelda in La Rioja, then Pamplona's cultural center, finished it in 881 and updated it to 976. It holds an early record of Hindu-Arabic numerals in Europe.", imp: 2,
    cites: [W("Codex_Vigilanus", "Codex Vigilanus"), { t: "Arabic numerals — MacTutor History of Mathematics, University of St Andrews", u: "https://mathshistory.st-andrews.ac.uk/HistTopics/Arabic_numerals/", k: "reference" }] },

  // ---------- Visigoths ----------
  { id: "w504-euric-code", branch: "visigoths", y: 475, when: "c. 475", title: "King Euric's law code",
    text: "Euric ruled as a Roman federate until 475, when he was recognized as independent king. His realm included southwestern Gaul and most of Spain, and he is best known for his Code of Euric.", imp: 2,
    cites: [B("biography/Euric", "Euric")] },
  { id: "w504-breviary-alaric", branch: "visigoths", y: 506, when: "506", title: "Breviary of Alaric",
    text: "Alaric II issued a code of Roman law in 506, known as the Lex Romana Visigothorum or Breviary of Alaric. He also allowed the Catholic council at Agde that year.", imp: 2,
    cites: [B("biography/Alaric-II", "Alaric II")] },
  { id: "w504-third-toledo", branch: "visigoths", y: 589.35, when: "May 589", title: "Reccared renounces Arianism at Toledo",
    text: "At the Third Council of Toledo, King Reccared renounced Arianism and anathematized Arius, and the Gothic nobles and clergy followed. It aligned the Visigothic kingdom with Catholicism.", imp: 2, link: "christianity",
    cites: [W("Third_Council_of_Toledo", "Third Council of Toledo"), B("place/Toledo-Spain", "Toledo")] },
  { id: "w504-etymologiae", branch: "visigoths", y: 625, when: "c. 600–625", title: "Isidore of Seville writes the Etymologiae",
    text: "Isidore began the Etymologiae around 600 and kept writing until about 625. The 20-book Latin encyclopedia gathered classical and Christian knowledge from grammar to geography, medicine and crafts.", imp: 2,
    cites: [W("Etymologiae", "Etymologiae"), B("topic/Etymologiae", "Etymologies")] },
  { id: "w504-liber-iudiciorum", branch: "visigoths", y: 654, when: "654", title: "Recceswinth promulgates the Liber Iudiciorum",
    text: "King Recceswinth issued the Liber Iudiciorum, a Latin law code heavily influenced by Roman law.", imp: 2,
    cites: [B("biography/Recceswinth", "Recceswinth")] },
  { id: "w504-guarrazar", branch: "visigoths", y: 660, when: "reign of Recceswinth, 649–72", title: "Votive crowns of Guarrazar",
    text: "A votive crown naming King Recceswinth, who reigned 649–72, came from the Guarrazar hoard of jeweled crowns and crosses, found in 1858 near Toledo. The hoard was split between Paris and Madrid.", imp: 3,
    cites: [W("Treasure_of_Guarrazar", "Treasure of Guarrazar"), B("topic/Visigothic-art", "Visigothic art"), { t: "Crown of Recceswinth — Art and Architecture of the Middle Ages", u: "https://artofthemiddleages.com/s/main/item/102" }] },
] });

TL.geo("w504-rome-founded", { scope: "place", lat: 41.89, lon: 12.49, r: 40, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("w504-numa", { scope: "place", lat: 41.89, lon: 12.49, r: 40, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("w504-servius-tullius", { scope: "place", lat: 41.89, lon: 12.49, r: 40, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("w504-cloaca-maxima", { scope: "place", lat: 41.89, lon: 12.49, r: 40, label: "Cloaca Maxima, Rome", src: "https://en.wikipedia.org/wiki/Cloaca_Maxima" });
TL.geo("w504-regolini-galassi", { scope: "place", lat: 42.01, lon: 12.11, r: 40, label: "Cerveteri, Italy", src: "https://en.wikipedia.org/wiki/Cerveteri" });
TL.geo("w504-fowling-fishing-tomb", { scope: "place", lat: 42.25, lon: 11.76, r: 40, label: "Tarquinia, Italy", src: "https://en.wikipedia.org/wiki/Tarquinia" });
TL.geo("w504-veii-destroyed", { scope: "place", lat: 42.02, lon: 12.4, r: 40, label: "Veii, Italy", src: "https://en.wikipedia.org/wiki/Veii" });
TL.geo("w504-sentinum", { scope: "place", lat: 43.42, lon: 12.85, r: 40, label: "Sentinum, Italy", src: "https://en.wikipedia.org/wiki/Battle_of_Sentinum" });
TL.geo("w504-liber-linteus", { scope: "place", lat: 45.81, lon: 15.98, r: 40, label: "Zagreb, Croatia", src: "https://en.wikipedia.org/wiki/Zagreb" });
TL.geo("w504-gallic-sack", { scope: "place", lat: 41.89, lon: 12.49, r: 40, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("w504-appian-way", { scope: "place", lat: 41.84, lon: 12.53, r: 60, label: "Appian Way, Italy", src: "https://en.wikipedia.org/wiki/Appian_Way" });
TL.geo("w504-pydna", { scope: "place", lat: 40.37, lon: 22.58, r: 40, label: "Pydna, Greece", src: "https://en.wikipedia.org/wiki/Pydna" });
TL.geo("w504-hipparchus", { scope: "place", lat: 36.43, lon: 28.22, r: 40, label: "Rhodes, Greece", src: "https://en.wikipedia.org/wiki/Rhodes_(city)" });
TL.geo("w504-antikythera", { scope: "place", lat: 35.87, lon: 23.3, r: 40, label: "Antikythera, Greece", src: "https://en.wikipedia.org/wiki/Antikythera" });
TL.geo("w504-ariovistus", { scope: "place", lat: 47.65, lon: 7.3, r: 60, label: "Sundgau, France", src: "https://en.wikipedia.org/wiki/Sundgau" });
TL.geo("w504-teutoburg", { scope: "place", lat: 52.41, lon: 8.13, r: 60, label: "Kalkriese, Germany", src: "https://en.wikipedia.org/wiki/Kalkriese" });
TL.geo("w504-marcomannic", { scope: "place", lat: 45.77, lon: 13.37, r: 60, label: "Aquileia, Italy", src: "https://en.wikipedia.org/wiki/Aquileia" });
TL.geo("w504-runes", { scope: "region", lat: 60, lon: 15, r: 1200, label: "Scandinavia and northern Europe", src: "https://en.wikipedia.org/wiki/Scandinavia" });
TL.geo("w504-ulfilas", { scope: "region", lat: 44, lon: 35, r: 600, label: "Gothic lands near the Black Sea", src: "https://en.wikipedia.org/wiki/Black_Sea" });
TL.geo("w504-adrianople", { scope: "place", lat: 41.68, lon: 26.56, r: 60, label: "Edirne, Turkey", src: "https://en.wikipedia.org/wiki/Edirne" });
TL.geo("w504-odoacer", { scope: "region", lat: 43, lon: 12, r: 500, label: "Italy", src: "https://en.wikipedia.org/wiki/Italy" });
TL.geo("w504-codex-argenteus", { scope: "place", lat: 59.86, lon: 17.64, r: 40, label: "Uppsala, Sweden", src: "https://en.wikipedia.org/wiki/Uppsala" });
TL.geo("w504-aeneid", { scope: "place", lat: 41.89, lon: 12.49, r: 40, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("w504-colosseum", { scope: "place", lat: 41.89, lon: 12.49, r: 40, label: "Colosseum, Rome", src: "https://en.wikipedia.org/wiki/Colosseum" });
TL.geo("w504-pantheon", { scope: "place", lat: 41.9, lon: 12.48, r: 40, label: "Pantheon, Rome", src: "https://en.wikipedia.org/wiki/Pantheon,_Rome" });
TL.geo("w504-antonine-edict", { scope: "region", lat: 41.89, lon: 12.48, r: 2500, label: "Roman Empire", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("w504-vouille", { scope: "place", lat: 46.64, lon: 0.17, r: 40, label: "Vouillé, France", src: "https://en.wikipedia.org/wiki/Vouill%C3%A9,_Vienne" });
TL.geo("w504-salic-law", { scope: "region", lat: 48.86, lon: 2.35, r: 400, label: "Francia (northern Gaul)", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w504-gregory-of-tours", { scope: "place", lat: 47.39, lon: 0.69, r: 40, label: "Tours, France", src: "https://en.wikipedia.org/wiki/Tours" });
TL.geo("w504-tertry", { scope: "place", lat: 49.86, lon: 3.07, r: 40, label: "Tertry, France", src: "https://en.wikipedia.org/wiki/Tertry" });
TL.geo("w504-great-conspiracy", { scope: "region", lat: 55.02, lon: -2.28, r: 300, label: "Hadrian's Wall, northern Britain", src: "https://en.wikipedia.org/wiki/Hadrian%27s_Wall" });
TL.geo("w504-symbol-stones", { scope: "region", lat: 57, lon: -4, r: 200, label: "Pictland, Scotland", src: "https://en.wikipedia.org/wiki/Scotland" });
TL.geo("w504-nechtan-easter", { scope: "region", lat: 57, lon: -4, r: 200, label: "Pictland, Scotland", src: "https://en.wikipedia.org/wiki/Scotland" });
TL.geo("w504-aberlemno", { scope: "place", lat: 56.69, lon: -2.78, r: 30, label: "Aberlemno, Scotland", src: "https://en.wikipedia.org/wiki/Aberlemno" });
TL.geo("w504-kenneth", { scope: "place", lat: 56.34, lon: -3.54, r: 40, label: "Forteviot, Scotland", src: "https://en.wikipedia.org/wiki/Forteviot" });
TL.geo("w504-scone-906", { scope: "place", lat: 56.42, lon: -3.4, r: 40, label: "Scone, Scotland", src: "https://en.wikipedia.org/wiki/Scone,_Perth_and_Kinross" });
TL.geo("w504-oseberg", { scope: "place", lat: 59.27, lon: 10.41, r: 40, label: "Tønsberg, Norway", src: "https://en.wikipedia.org/wiki/T%C3%B8nsberg" });
TL.geo("w504-great-heathen-army", { scope: "region", lat: 52.5, lon: 1, r: 120, label: "East Anglia, England", src: "https://en.wikipedia.org/wiki/East_Anglia" });
TL.geo("w504-iceland-settled", { scope: "place", lat: 64.15, lon: -21.94, r: 100, label: "Reykjavík, Iceland", src: "https://en.wikipedia.org/wiki/Reykjav%C3%ADk" });
TL.geo("w504-althing", { scope: "place", lat: 64.25, lon: -21.04, r: 40, label: "Þingvellir, Iceland", src: "https://en.wikipedia.org/wiki/%C3%9Eingvellir" });
TL.geo("w504-jelling", { scope: "place", lat: 55.75, lon: 9.41, r: 40, label: "Jelling, Denmark", src: "https://en.wikipedia.org/wiki/Jelling" });
TL.geo("w504-sancho-garces-i", { scope: "place", lat: 42.82, lon: -1.65, r: 40, label: "Pamplona, Spain", src: "https://en.wikipedia.org/wiki/Pamplona" });
TL.geo("w504-valdejunquera", { scope: "region", lat: 42.82, lon: -1.65, r: 60, label: "Navarre, Spain", src: "https://en.wikipedia.org/wiki/Navarre" });
TL.geo("w504-codex-vigilanus", { scope: "place", lat: 42.37, lon: -2.47, r: 40, label: "Albelda de Iregua, Spain", src: "https://en.wikipedia.org/wiki/Albelda_de_Iregua" });
TL.geo("w504-euric-code", { scope: "place", lat: 43.6, lon: 1.44, r: 60, label: "Toulouse, France", src: "https://en.wikipedia.org/wiki/Toulouse" });
TL.geo("w504-breviary-alaric", { scope: "place", lat: 43.6, lon: 1.44, r: 60, label: "Toulouse, France", src: "https://en.wikipedia.org/wiki/Toulouse" });
TL.geo("w504-third-toledo", { scope: "place", lat: 39.86, lon: -4.02, r: 40, label: "Toledo, Spain", src: "https://en.wikipedia.org/wiki/Toledo,_Spain" });
TL.geo("w504-etymologiae", { scope: "place", lat: 37.39, lon: -6, r: 40, label: "Seville, Spain", src: "https://en.wikipedia.org/wiki/Seville" });
TL.geo("w504-liber-iudiciorum", { scope: "place", lat: 39.86, lon: -4.02, r: 40, label: "Toledo, Spain", src: "https://en.wikipedia.org/wiki/Toledo,_Spain" });
TL.geo("w504-guarrazar", { scope: "place", lat: 39.82, lon: -4.15, r: 30, label: "Guadamur, Spain", src: "https://en.wikipedia.org/wiki/Guadamur" });
