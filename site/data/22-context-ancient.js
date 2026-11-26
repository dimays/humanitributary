// "Why it matters" context and cross-links for ancient branches and landmark events, c. 3500–146 BCE (November 2026).
// Every sentence in `why` and every connection note rests on the enrich cites below (primary texts in translation,
// the Stanford Encyclopedia of Philosophy, institutional pages and the Wikipedia articles named), all read in this session.

const WP = (title, slug) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const CNRS = { t: "Origin of domestic horses finally established — CNRS", u: "https://www.cnrs.fr/en/origin-domestic-horses-finally-established", k: "news" };
const MPG = { t: "A massive migration from the steppe brought Indo-European languages to Europe — Max Planck Society", u: "https://www.mpg.de/9005184/humans-migration-indo-european-languages", k: "news" };

TL.enrich("px-wheeled-vehicles", {
  why: "The solid wooden wheel belongs to a cluster of late Neolithic advances that gave rise to the early Bronze Age. In Mesopotamia, pictographs on clay tablets from the Eanna district of Uruk, c. 3500–3350 BCE, depict wheeled wagons. Steppe herders of the Yamnaya culture relied on carts and wagons for long-distance travel, and the spoked wheel of c. 2000 BCE allowed lighter, swifter vehicles such as the war chariot. The Americas took another path: wheeled toys appear in Mexico, but the wheel was never put to practical use there, perhaps for lack of large draft animals.",
  connections: [
    { id: "yamnaya", note: "Steppe herders who relied on carts and wagons for long-distance travel" },
    { id: "px-horse-domestication", note: "Domestic horses spread across Asia together with spoke-wheeled chariots" },
  ],
  cites: [WP("Wheel", "Wheel"), WP("Yamnaya culture", "Yamnaya_culture"), CNRS],
});

TL.enrich("caral", {
  why: "Caral–Supe was a complex pre-Columbian society of as many as thirty major population centers in north-central coastal Peru. Complex society there arose a millennium after Sumer, was contemporaneous with the Egyptian pyramids, and predated the Olmec by nearly two millennia. Its most impressive achievement was monumental architecture, including large earthwork platform mounds and sunken circular plazas. Knotted-string quipu found at Caral suggest a writing or proto-writing system, though that discovery was reported in the press before formal publication.",
  connections: [],
  cites: [WP("Norte Chico civilization", "Norte_Chico_civilization")],
});

TL.enrich("yamnaya", {
  why: "Ancient DNA has put the Yamnaya at the center of a two-century puzzle: why the Indo-European languages, now spoken by almost three billion people, are related. A 2015 study estimated that about 75% of the ancestry of Germany's Corded Ware people came from a Yamnaya-related population, a turnover its authors argue likely brought at least some Indo-European languages to Europe, against the view that all arrived with Anatolian farmers. The family's ultimate homeland is still unresolved, and whether the Yamnaya rode horses is disputed.",
  connections: [
    { id: "px-steppe-migration", note: "The westward migration behind Corded Ware ancestry in Central Europe" },
    { id: "px-horse-domestication", note: "Steppe migrations to Europe predate the modern domestic horse, CNRS reports" },
  ],
  cites: [MPG, WP("Yamnaya culture", "Yamnaya_culture"), CNRS],
});

TL.enrich("px-bronze-age-begins", {
  why: "The Bronze Age is the middle period of the three-age system, between the Stone Age and the Iron Age, and its societies made extensive use of metals and developed trade networks. Bronze Age cultures were also the first to develop writing. In the Late Bronze Age (c. 1550–1200 BCE), prominent societies such as the Egyptians, Hittites, Mesopotamians and Mycenaeans had monumental architecture, advanced metallurgy and literacy. After the Late Bronze Age collapse, gradual changes in metallurgical technology led to the Iron Age across Europe, Asia and Africa during the first millennium BCE.",
  connections: [
    { id: "an-bronze-age-collapse", note: "The Late Bronze Age world collapsed after c. 1200 BCE" },
    { id: "px-iron-age-begins", note: "Changes in metallurgy after the collapse led to the Iron Age" },
  ],
  cites: [WP("Bronze Age", "Bronze_Age"), WP("Late Bronze Age collapse", "Late_Bronze_Age_collapse")],
});

TL.enrich("writing", {
  why: "Writing let societies keep records beyond living memory. Archaeological evidence points to Mesopotamian cuneiform and Egyptian hieroglyphs as the earliest practical writing systems, and Bronze Age cultures were the first to develop writing. Cuneiform had to be deciphered in the 19th century as a completely unknown script, and Champollion deciphered hieroglyphs in the 1820s with the help of the Rosetta Stone. In China, oracle-bone inscriptions are the direct ancestor of the Chinese family of scripts developed over the next three millennia.",
  connections: [
    { id: "an-phoenician-alphabet", note: "The alphabet is a later script that Greeks adopted and adapted" },
    { id: "an-oracle-bones", note: "Oracle-bone script is the direct ancestor of Chinese scripts" },
  ],
  cites: [WP("Bronze Age", "Bronze_Age"), WP("Cuneiform", "Cuneiform"), WP("Egyptian hieroglyphs", "Egyptian_hieroglyphs"), WP("Oracle bone script", "Oracle_bone_script")],
});

TL.enrich("indus", {
  why: "The Indus Valley Civilization was a Bronze Age civilization lasting from 3300 to 1300 BCE, in its mature form 2600 to 1900 BCE. More than a thousand Mature Harappan sites have been reported, with five major urban centers including Mohenjo-daro and Harappa, and its cities were noted for urban planning, baked-brick houses and elaborate drainage systems. An extensive maritime trade network linked it with Mesopotamia, and Sumerian cuneiform records the name Meluhha. Its script remains undeciphered. Signs of decline emerged around 1900 BCE and by about 1700 BCE most cities were abandoned; skeletons from Harappa show increased violence and infectious disease.",
  connections: [
    { id: "sumer", note: "Maritime trade linked it with Mesopotamia, where texts name it Meluhha" },
    { id: "vedic", note: "The theory that Indo-Aryans destroyed it was later discarded" },
  ],
  cites: [WP("Indus Valley Civilisation", "Indus_Valley_Civilisation"), WP("Indo-Aryan migrations", "Indo-Aryan_migrations")],
});

TL.enrich("an-proto-cuneiform", {
  why: "How writing began is still debated: in 1977 Denise Schmandt-Besserat proposed that cuneiform grew out of a system of clay tokens used to track and exchange commodities, and the tokens were later replaced by flat tablets marked with a stylus. Over its history cuneiform was adapted to write languages besides Sumerian, and Akkadian texts make up the bulk of the cuneiform record. It was rediscovered in the early 17th century and deciphered as a completely unknown script by 1857, and an estimated half a million tablets are held in museums worldwide.",
  connections: [
    { id: "an-hammurabi", note: "Hammurabi's laws were inscribed in Akkadian cuneiform" },
    { id: "an-gilgamesh", note: "Cuneiform served literary as well as administrative uses" },
  ],
  cites: [WP("Cuneiform", "Cuneiform"), WP("History of writing", "History_of_writing")],
});

TL.enrich("egypt", {
  why: "By conventional chronology Egypt emerged around 3150 BCE, when Upper and Lower Egypt were united by Menes, whom most Egyptologists identify with Narmer. A bureaucracy of scribes, religious leaders and administrators under the pharaoh organized its mineral exploitation, collective building projects and trade, and the Naqada culture's written symbols grew into a full system of hieroglyphs. Over its history Egypt was invaded or conquered by the Hyksos, Kushites, Assyrians, Persians, Greeks and Romans. Ramesses II fought the Hittites at Kadesh and then agreed to the first recorded peace treaty, around 1258 BCE.",
  connections: [
    { id: "kush", note: "Kush shared the veneration of Amun, and Kushite kings later ruled Egypt" },
    { id: "hittites", note: "Rival powers that fought at Kadesh and made peace in 1258 BCE" },
  ],
  cites: [WP("Ancient Egypt", "Ancient_Egypt"), WP("Kingdom of Kush", "Kingdom_of_Kush"), WP("Battle of Kadesh", "Battle_of_Kadesh")],
});

TL.enrich("minoan", {
  why: "The Minoans developed two writing systems, Cretan hieroglyphs and Linear A, and traded extensively, exporting agricultural products and luxury crafts in exchange for raw metals that were scarce on Crete. Their cultural influence reached the Aegean and the eastern Mediterranean. Early excavators such as Arthur Evans proposed that Crete saw little internal armed conflict, but later scholarship has questioned this “Minoan peace.” After c. 1450 BCE a Mycenaean elite clearly ruled Knossos, and Linear B, a modified Linear A, wrote Mycenaean Greek. The modern name comes from the mythical King Minos, whom Classical Greeks believed ruled Knossos.",
  connections: [
    { id: "mycenaean", note: "A Mycenaean elite ruled Knossos from around 1450 BCE" },
    { id: "an-knossos-mycenaean", note: "Linear B, adapted from Linear A, wrote Mycenaean Greek at Knossos" },
  ],
  cites: [WP("Minoan civilization", "Minoan_civilization"), WP("Linear B", "Linear_B")],
});

TL.enrich("austronesian-expansion", {
  why: "Austronesians were the first people with vessels able to cross great distances of open ocean; sails, outriggers, catamarans and the crab-claw sail allowed rapid dispersal across the Indo-Pacific. Before the 16th century theirs was the most widespread language family in the world, spanning half the planet from Easter Island to Madagascar. Its eastern branch produced the Lapita, ancestors of the Polynesians. A 2016 genetic study argued that the migration from Taiwan accounts for only about 20% of the region's population, suggesting the languages may have spread partly by emulation.",
  connections: [
    { id: "polynesians", note: "The Lapita, ancestors of the Polynesians, came from its eastern branch" },
    { id: "maori", note: "Reaching New Zealand by c. 1200 CE completed the Polynesian expansion" },
  ],
  cites: [WP("Austronesian peoples", "Austronesian_peoples"), WP("Lapita culture", "Lapita_culture"), WP("Polynesians", "Polynesians"),
    { t: "New Thoughts on the “Out of Taiwan” Theory — Archaeology Magazine", u: "https://archaeology.org/news/2016/01/29/160129-taiwan-language-migration/", k: "news" }],
});

TL.enrich("px-stonehenge", {
  why: "Stonehenge was also a burial ground: about 64 cremations have been found there, and perhaps 150 people were buried, making it the largest late Neolithic cemetery in the British Isles. Its stones went up at a time of great change, as Beaker pottery, metalworking and individual burial with grave goods arrived from the Continent, and early Bronze Age barrows were built on hilltops visible from it. With Avebury it forms the heart of a World Heritage Site, and English Heritage calls it perhaps the world's most famous prehistoric monument.",
  connections: [
    { id: "yamnaya", note: "Bell Beaker people drew much of their ancestry from a Yamnaya-related population" },
  ],
  cites: [{ t: "History of Stonehenge — English Heritage", u: "https://www.english-heritage.org.uk/visit/places/stonehenge/history-and-stories/history/", k: "museum" }, WP("Yamnaya culture", "Yamnaya_culture")],
});

TL.enrich("an-great-pyramid", {
  why: "The Great Pyramid was built by quarrying an estimated 2.3 million large blocks, weighing about 6 million tonnes in total, with an average block of about 2.5 tonnes. Herodotus, writing some two thousand years later, claimed gangs of 100,000 laborers worked in three-month shifts; a 1999 construction-management study estimated an average workforce of about 13,200 and a peak of roughly 40,000. The ancient Greeks believed slave labor was used, but discoveries at nearby workers' camps suggest it was built by thousands of conscript laborers organized in work gangs.",
  connections: [
    { id: "kush", note: "Under Kushite rule, pyramid building revived, many in modern Sudan" },
  ],
  cites: [WP("Great Pyramid of Giza", "Great_Pyramid_of_Giza"), WP("Kingdom of Kush", "Kingdom_of_Kush")],
});

TL.enrich("akkad", {
  why: "By uniting the Semitic Akkadian and Sumerian speakers under one rule, the Akkadian Empire is often seen as the first empire in world history, and it succeeded the long-lived city-states of the Early Dynastic Period. Its successors carried Sargon's legacy on for about a century, and later kings treated Sargon and Naram-Sin as models or counter-models. Akkadian became the empire's lingua franca, though Sumerian stayed important in religion and literature. The empire probably collapsed from internal unrest, severe drought and pressure from Gutians, Amorites and Elamites.",
  connections: [
    { id: "an-ur-iii", note: "Ur III reunited southern Mesopotamia and took Akkad as a model" },
  ],
  cites: [WP("Akkadian Empire", "Akkadian_Empire"), WP("Sargon of Akkad", "Sargon_of_Akkad"), WP("Third Dynasty of Ur", "Third_Dynasty_of_Ur")],
});

TL.enrich("px-horse-domestication", {
  why: "Genomes of 273 ancient horses showed that a lineage from the Pontic steppe replaced every wild population from the Atlantic to Mongolia within a few centuries after c. 2200 BCE. Researchers link its success to genes for more docile behavior and a stronger backbone at a time when horse travel was becoming “global,” and it spread through Asia together with spoke-wheeled chariots and Indo-Iranian languages. The finding also revised the history of human migration: steppe migrations into Europe in the third millennium BCE could not have been based on the horse.",
  connections: [
    { id: "yamnaya", note: "Their westward migrations came before the modern horse spread, CNRS reports" },
    { id: "px-wheeled-vehicles", note: "The domestic horse spread together with spoke-wheeled chariots" },
  ],
  cites: [CNRS],
});

TL.enrich("assyria", {
  why: "Beginning with Adad-nirari II in 911 BCE, the Neo-Assyrian Empire grew to dominate the ancient Near East and became the largest empire in history up to that point. Its central standing army, the kiṣir šarri, was new to the empire, and it developed a sophisticated communication system of relay stations and well-maintained roads, with message speeds not surpassed in the Middle East until the 19th century. It resettled portions of conquered populations in the Assyrian heartland and underdeveloped provinces. Esarhaddon conquered Egypt, but the empire fell in the late 7th century BCE, destroyed by a Babylonian uprising and a Median invasion.",
  connections: [
    { id: "an-israel-falls", note: "Assyria probably conquered Samaria, ending the Kingdom of Israel" },
    { id: "an-assyria-expels-kush", note: "Esarhaddon and Ashurbanipal dethroned the Kushite rulers of Egypt" },
    { id: "achaemenid", note: "The Achaemenids were among empires Assyria influenced administratively" },
  ],
  cites: [WP("Neo-Assyrian Empire", "Neo-Assyrian_Empire"), WP("Kingdom of Kush", "Kingdom_of_Kush")],
});

TL.enrich("maya", {
  why: "The Maya script is the most sophisticated and highly developed writing system of the pre-Columbian Americas, in use by the 3rd century BCE, and texts on stelae and ceramics survive in great numbers. The Maya developed interlocking ritual calendars and mathematics that included one of the earliest explicit zeros, and the Classic period (c. 250–900 CE) is largely defined by lowland monuments carrying Long Count dates. They dealt with neighbors including the Olmec and Teotihuacan, whose city intervened in Maya dynastic politics. In the 9th century a widespread political collapse in the central Maya region brought civil wars, abandoned cities and a northward shift of population.",
  connections: [
    { id: "olmec", note: "The Maya had a dynamic relationship with neighbors including the Olmec" },
    { id: "teotihuacan", note: "Teotihuacan intervened in Maya dynastic politics in the Classic period" },
    { id: "me-maya-collapse", note: "The widespread political collapse of the 9th century CE" },
  ],
  cites: [WP("Maya civilization", "Maya_civilization")],
});

TL.enrich("babylonia", {
  why: "Hammurabi (fl. c. 1792–1752 BCE, middle chronology) made Babylonia briefly the major power in the region, with an empire that succeeded Akkad, the Third Dynasty of Ur and Old Assyria. A Kassite dynasty ruled Babylon from 1595 to 1155 BCE, the longest-lived dynasty in its history, and Babylonia kept written Akkadian for official use despite its Amorite founders and Kassite successors. The Neo-Babylonian (Chaldean) Empire arose as Assyria's vast empire unraveled; in 587 BCE Nebuchadnezzar II destroyed Jerusalem and exiled Judeans to Babylonia. After Babylon fell to Persia in 539 BCE, the exiles were permitted to return.",
  connections: [
    { id: "an-jerusalem-587", note: "Babylon destroyed Jerusalem and exiled Judeans to Babylonia" },
    { id: "an-cyrus-cylinder", note: "After Persia took Babylon, exiled Judeans were permitted to return" },
  ],
  cites: [WP("Babylonia", "Babylonia"), WP("Babylonian captivity", "Babylonian_captivity")],
});

TL.enrich("an-hammurabi", {
  why: "The prologue presents Hammurabi as called by the gods “so that the strong should not harm the weak,” and copies on stone pillars told his subjects the laws of the land. The code's scope is broad, covering criminal, family, property and commercial law, and its first two laws punish unsubstantiated accusations, a principle scholars compare to the presumption of innocence. Its justice depended on class: putting out another man's eye was punished in kind, but the same injury to a freed man cost one gold mina.",
  connections: [
    { id: "an-ur-iii", note: "Ur-Nammu of Ur III had published an earlier law code" },
    { id: "an-proto-cuneiform", note: "Cuneiform let rulers record their laws" },
  ],
  cites: [{ t: "The Code of Hammurabi, translated by L. W. King — Avalon Project, Yale Law School", u: "https://avalon.law.yale.edu/ancient/hamcode.asp", k: "primary" }, WP("Code of Hammurabi", "Code_of_Hammurabi"), WP("Third Dynasty of Ur", "Third_Dynasty_of_Ur"), WP("Cuneiform", "Cuneiform")],
});

TL.enrich("mycenaean", {
  why: "The Mycenaeans wrote in Linear B, a syllabic script adapted from the undeciphered Linear A, which offers the first written records of the Greek language. Their centers of power included Mycenae, Pylos, Tiryns, Thebes and Athens, and Homer later used collective terms for them in the Iliad. Mycenaean Greece perished with the collapse of Bronze Age culture in the eastern Mediterranean, followed by the Greek Dark Ages, a recordless transitional period; Linear B disappeared with it. Theories about the end include a Dorian invasion and the Sea Peoples, whose activity coincides with the collapse.",
  connections: [
    { id: "an-bronze-age-collapse", note: "Mycenaean Greece perished in the wider Bronze Age collapse" },
    { id: "an-greek-alphabet", note: "The Greek alphabet came several centuries after Linear B" },
  ],
  cites: [WP("Mycenaean Greece", "Mycenaean_Greece"), WP("Linear B", "Linear_B")],
});

TL.enrich("hittites", {
  why: "The Hittites were an Anatolian Indo-European people who formed one of the first major civilizations of the Bronze Age in West Asia. Their king Mursili I sacked Babylon around 1595 BCE, and the empire reached its peak in the mid-14th century BCE, encompassing most of Anatolia and parts of northern Syria and Upper Mesopotamia. After fighting Egypt at Kadesh, Ramesses II and the Hittite king Hattusili III ratified a treaty in 1258 BCE, the oldest known surviving peace treaty. In the aftermath of the Late Bronze Age collapse the Hittites splintered into small independent states.",
  connections: [
    { id: "an-kadesh", note: "The battle with Egypt that preceded their 1258 BCE peace treaty" },
    { id: "an-bronze-age-collapse", note: "The empire splintered after the collapse of the 12th century BCE" },
  ],
  cites: [WP("Hittites", "Hittites"), WP("Egyptian–Hittite peace treaty", "Egyptian%E2%80%93Hittite_peace_treaty"), WP("Battle of Kadesh", "Battle_of_Kadesh")],
});

TL.enrich("shang", {
  why: "The Shang are the earliest Chinese dynasty firmly supported by archaeological evidence, and writing is a large part of that evidence: the site of its last capital at Yinxu has yielded the earliest known Chinese writing, mostly divination texts on oracle bones, and Wang Yirong recognized the characters as ancient Chinese writing in 1899. Chinese bronze casting advanced during the Shang, with bronze typically used for ritually significant objects. The oracle-bone script is the direct ancestor of the Chinese family of scripts that developed over the next three millennia.",
  connections: [
    { id: "an-oracle-bones", note: "The divination texts that are the earliest known Chinese writing" },
    { id: "zhou", note: "The Zhou justified overthrowing the Shang with the Mandate of Heaven" },
  ],
  cites: [WP("Shang dynasty", "Shang_dynasty"), WP("Oracle bone script", "Oracle_bone_script"), WP("Mandate of Heaven", "Mandate_of_Heaven")],
});

TL.enrich("polynesians", {
  why: "From Lapita beginnings the Polynesians became renowned navigators who, reading stars, currents, clouds and birds, settled islands as remote as Hawaii, Easter Island and New Zealand. After reaching Fiji, Samoa and Tonga by about 900 BCE, the expansion paused for some 1,500 years, then resumed around 700 CE, reaching Hawaii by 900, Easter Island by 1000 and New Zealand by 1200. Their wayfinding skills have been handed down to the present, and the Māori are today the largest Polynesian population.",
  connections: [
    { id: "an-lapita-polynesia", note: "Lapita voyagers reached Fiji, Samoa and Tonga by about 900 BCE" },
    { id: "maori", note: "The largest Polynesian population today" },
  ],
  cites: [WP("Polynesians", "Polynesians"), WP("Lapita culture", "Lapita_culture")],
});

TL.enrich("vedic", {
  why: "The Vedic period laid foundations for later Indian religion and society. The Vedas were composed and transmitted orally with great precision by speakers of an Old Indo-Aryan language, and as liturgical texts they formed the basis of the Brahmanical ideology that developed in the Kuru kingdom. The early Upanishads were completed in this era, and the varna system emerged, a hierarchical order of estates reflecting a division of labor among social classes. Around the beginning of the Common Era the Vedic tradition became one of the main constituents of what scholars call the “Hindu synthesis.”",
  connections: [
    { id: "hinduism", note: "Brahmanism grew out of Vedic religion, a main constituent of Hinduism" },
    { id: "an-upanishads", note: "The early Upanishads were completed in the Vedic era" },
  ],
  cites: [WP("Vedic period", "Vedic_period"), WP("Historical Vedic religion", "Historical_Vedic_religion")],
});

TL.enrich("nok", {
  why: "The earliest Nok terracotta sculptures may have developed around 900 BCE, and the hollow, coil-built, nearly life-sized figures show highly stylized features, abundant jewelry and varied postures. Later West African artistic traditions, such as Igbo-Ukwu and Ile-Ife, may have been influenced by them. Iron metallurgy may have developed independently in the Nok culture between 750 and 550 BCE. Since the 1970s Nok terracotta figures have been heavily looted, and larger-scale looting began in 1994.",
  connections: [
    { id: "an-nok-iron", note: "Iron metallurgy may have developed independently among the Nok" },
    { id: "bantu-expansion", note: "Iron use is among factors proposed for the Bantu expansion" },
  ],
  cites: [WP("Nok culture", "Nok_culture"), WP("Bantu expansion", "Bantu_expansion")],
});

TL.enrich("olmec", {
  why: "The Olmec appear to have practiced ritual bloodletting and played the Mesoamerican ballgame, hallmarks of nearly all later Mesoamerican societies. Their colossal heads would have required a workforce of sculptors, laborers, overseers and boatmen, and jade, obsidian and magnetite from distant sources suggest an extensive trading network. Because the earliest Long Count dates were found outside the Maya homeland, some scholars argue the calendar may be an Olmec invention, though the Olmec civilization had ended centuries before the earliest known Long Count date, and Olmec influence shows at sites in the southern Maya area.",
  connections: [
    { id: "maya", note: "Olmec influence appears at sites in the southern Maya area" },
    { id: "aztec", note: "The Aztecs also played the ballgame the Olmec played" },
  ],
  cites: [WP("Olmecs", "Olmecs"), WP("Olmec colossal heads", "Olmec_colossal_heads"), WP("Mesoamerican ballgame", "Mesoamerican_ballgame")],
});

TL.enrich("an-rigveda", {
  why: "The Rigveda is the oldest known Vedic Sanskrit text, a collection of hymns that, like the other Vedas, was composed and transmitted orally with precision. Mitanni documents of northern Syria and Iraq (c. 1450–1350 BCE) also name Vedic gods such as Varuna, Mitra and Indra, which gives a date close to the composition of its core. After the 1920s excavations at Harappa and Mohenjo-daro showed that northern India already had an advanced culture, the Indo-Aryan arrival came to be seen as a migration into an urban civilization; Mortimer Wheeler even suggested that “Indra stands accused” of its destruction, but the invasion view was discarded when no evidence of war turned up.",
  connections: [
    { id: "indus", note: "Wheeler linked its decline to Indo-Aryan conquest; the view was discarded" },
    { id: "hinduism", note: "The Vedic tradition became a main constituent of the “Hindu synthesis”" },
  ],
  cites: [WP("Rigveda", "Rigveda"), WP("Indo-Aryan migrations", "Indo-Aryan_migrations"), WP("Vedic period", "Vedic_period")],
});

TL.enrich("px-iron-age-begins", {
  why: "Meteoric iron was used for millennia, with the earliest known artifacts nine small beads from Gerzeh in Egypt dated to 3200 BCE. The Iron Age is defined locally by the point when smelted iron, especially steel tools and weapons, replaces bronze equivalents in common use, and only with carbon steel does iron yield tools harder and lighter than bronze. In the ancient Near East the transition coincided with the Late Bronze Age collapse of the 12th century BCE. Some archaeologists believe iron metallurgy developed independently in sub-Saharan Africa as early as 2000 BCE, and many African areas moved directly from stone to iron.",
  connections: [
    { id: "an-bronze-age-collapse", note: "In the Near East the transition coincided with the collapse" },
    { id: "an-nok-iron", note: "Iron metallurgy may have developed independently among the Nok" },
  ],
  cites: [WP("Iron Age", "Iron_Age"), WP("Nok culture", "Nok_culture")],
});

TL.enrich("phoenicia", {
  why: "The Phoenicians were Semitic-speaking people of independent city-states on the Levantine coast, notably Byblos, Sidon and Tyre, who extended their influence by trade and colonization from Cyprus to the Maghreb and the Iberian Peninsula. Their commercial networks played a foundational role in the economic and cultural development of classical Mediterranean civilization. Their most enduring legacy is the earliest verified alphabet, derived from the Proto-Sinaitic script, which gave rise to the Greek alphabet. Carthage, founded in 814 BCE by the date modern historians generally accept, grew into a major power.",
  connections: [
    { id: "carthage", note: "Their colony Carthage grew into a major power by the 7th century BCE" },
    { id: "an-greek-alphabet", note: "The Phoenician alphabet gave rise to the Greek alphabet" },
  ],
  cites: [WP("Phoenicia", "Phoenicia")],
});

TL.enrich("an-bronze-age-collapse", {
  why: "The collapse ended the Late Bronze Age (c. 1550–1200 BCE), a world of advanced civilizations with extensive trade networks and complex institutions. It was sudden, violent and culturally disruptive: the Hittite Empire, already fragmenting under famine, plague and civil war, collapsed, and the palace economy of Mycenaean Greece broke apart into the small village cultures of the Greek Dark Ages. Egypt's New Kingdom and Middle Assyria survived in weakened forms. Proposed causes include climate change, earthquakes, drought, epidemic disease, Sea Peoples invasions and economic disruption linked to ironworking; gradual metallurgical change led to the Iron Age.",
  connections: [
    { id: "px-iron-age-begins", note: "Gradual changes in metallurgy led to the Iron Age that followed" },
    { id: "hittites", note: "The empire collapsed after fragmenting under famine, plague and civil war" },
    { id: "an-phoenician-alphabet", note: "Phoenicians gained autonomy as Egypt's and Assyria's presence waned" },
  ],
  cites: [WP("Late Bronze Age collapse", "Late_Bronze_Age_collapse")],
});

TL.enrich("judaism", {
  why: "Judaism is considered one of the earliest monotheistic religions, and its texts, traditions and values strongly influenced Christianity and Islam, together called the Abrahamic religions. Archaeological evidence suggests ancient Israelite culture evolved from the earlier Canaanite civilization. Nebuchadnezzar II's destruction of Jerusalem and Solomon's Temple sent many Israelites into the Babylonian captivity, which ended when Persia conquered Babylon. Wikipedia's article on monotheism adds that Zoroastrianism left a lasting influence on Second Temple Judaism and, through it, on later monotheistic religions.",
  connections: [
    { id: "christianity", note: "Judaism's texts and values strongly influenced Christianity" },
    { id: "islam", note: "Judaism's texts and values strongly influenced Islam" },
    { id: "zoroastrianism", note: "Zoroastrianism influenced Second Temple Judaism, per Wikipedia" },
  ],
  cites: [WP("Judaism", "Judaism"), WP("History of ancient Israel and Judah", "History_of_ancient_Israel_and_Judah"), WP("Monotheism", "Monotheism")],
});

TL.enrich("kush", {
  why: "Kush developed many cultural affinities with Egypt, such as the veneration of Amun, yet its culture, language and ethnicity stayed distinct. King Piye invaded Lower Egypt and founded the Kushite-ruled 25th Dynasty, whose monarchs ruled Egypt for over a century until the Assyrian conquest of the mid-7th century BCE. The kingdom's capital later stood at Meroë, rich in iron ore and hardwood, where the Kushites developed the Meroitic alphabet, influenced by Egyptian writing, and traded iron products, gold and ivory with Rome. Kush persisted until the 4th century CE, when it weakened amid worsening climate, rebellions and invasions.",
  connections: [
    { id: "an-kushite-dynasty", note: "Piye's invasion of Lower Egypt founded the Kushite 25th Dynasty" },
    { id: "an-assyria-expels-kush", note: "The Assyrian conquest ended Kushite rule of Egypt" },
  ],
  cites: [WP("Kingdom of Kush", "Kingdom_of_Kush")],
});

TL.enrich("an-phoenician-alphabet", {
  why: "Like most Semitic scripts, the Phoenician script was an abjad of 22 consonant letters, one of the first alphabets. The other scripts of its time, cuneiform and Egyptian hieroglyphs, used many complex characters and required long professional training, which had restricted literacy to a small elite. The alphabet upset the long-standing status of literacy as an exclusive achievement of royal and religious elites, scribes who used their monopoly on information to control the common population. From the 9th century BCE it was adapted into Greek, Old Italic and Anatolian scripts, and its descendants include the Aramaic alphabet.",
  connections: [
    { id: "an-greek-alphabet", note: "Greeks adapted it from the 9th century BCE and added vowels" },
    { id: "an-oracle-bones", note: "Chinese writing instead descends from oracle-bone script" },
  ],
  cites: [WP("Phoenician alphabet", "Phoenician_alphabet"), WP("Oracle bone script", "Oracle_bone_script")],
});

TL.enrich("zhou", {
  why: "The Zhou justified taking power from the Shang with the Mandate of Heaven: Heaven bestows its mandate on a virtuous ruler, and the Zhou held that the Shang house had become morally corrupt. Chinese historians later read a successful revolt as proof that Heaven had withdrawn its mandate, and famine or flood was taken as a sign of Heaven's displeasure. To hold its enlarged territory the Zhou set up the fengjian system. The Eastern Zhou is remembered as the golden age of Chinese philosophy, when the Hundred Schools of Thought flourished as rival lords patronized itinerant scholars.",
  connections: [
    { id: "confucianism", note: "One of the schools that came to dominate the Eastern Zhou era" },
    { id: "an-warring-states", note: "Rivalry among the lords ended with Qin's unification in 221 BCE" },
  ],
  cites: [WP("Zhou dynasty", "Zhou_dynasty"), WP("Mandate of Heaven", "Mandate_of_Heaven")],
});

TL.enrich("zoroastrianism", {
  why: "Zoroastrians exalt Ahura Mazda as the uncreated, all-wise supreme being, who stands opposed by the destructive spirit Angra Mainyu. Ahura Mazda will ultimately prevail, bringing a cosmic renovation, Frashokereti, in which the souls of the dead are resurrected to immortality. It was the official religion of successive Iranian polities for a millennium, beginning with the Achaemenid Empire, which formalized many of its tenets and rituals, and its decline began with the Muslim conquest of Persia in the 7th century CE. Wikipedia's monotheism article credits Zoroaster with a lasting influence on Second Temple Judaism.",
  connections: [
    { id: "achaemenid", note: "The Achaemenid Empire formalized many of its tenets and rituals" },
    { id: "judaism", note: "Credited with lasting influence on Second Temple Judaism, per Wikipedia" },
  ],
  cites: [WP("Zoroastrianism", "Zoroastrianism"), WP("Achaemenid Empire", "Achaemenid_Empire"), WP("Monotheism", "Monotheism")],
});

TL.enrich("carthage", {
  why: "Carthage was founded, according to legend, by the Tyrian queen Dido, and 814 BCE is the foundation date modern historians generally accept. It developed into a major power by the 7th century BCE and grew into a multi-ethnic empire spanning North Africa, Sardinia, Sicily, Malta, the Balearic Islands and southern Iberia. Its site, where ships crossing the sea had to pass between Sicily and Tunisia, gave it great power and influence. Greek cities contested the western Mediterranean with it, and the Romans fought three Punic Wars against it, ending with the city's destruction after a nearly three-year siege in 146 BCE.",
  connections: [
    { id: "an-punic-wars", note: "Three wars with Rome that ended in the city's destruction" },
    { id: "an-hannibal", note: "Carthage's general marched over the Alps into Italy" },
  ],
  cites: [WP("Carthage", "Carthage"), WP("Phoenicia", "Phoenicia")],
});

TL.enrich("ancient-greece", {
  why: "Ancient Greece was a loose collection of culturally and linguistically related but independent city-states. Greek poleis began to form in the 8th century BCE, ushering in the Archaic period and Greek colonization of the Mediterranean, and Athens developed its democratic system over that period, with Cleisthenes carrying out further democratizing reforms. Classical Greece is generally considered the cradle of Western civilization, and Greek culture, especially philosophy, had a powerful influence on Rome. Alexander's conquests then spread Greek culture into North Africa and western Asia, the Hellenistic period.",
  connections: [
    { id: "an-cleisthenes", note: "The reforms that set Athens on its democratic course" },
    { id: "roman-republic", note: "Greek culture, especially philosophy, strongly influenced Rome" },
    { id: "hellenistic", note: "Alexander's conquests spread Greek culture across West Asia" },
  ],
  cites: [WP("Ancient Greece", "Ancient_Greece"), WP("Cleisthenes", "Cleisthenes")],
});

TL.enrich("roman-kingdom", {
  why: "By Roman tradition, the Kingdom began with the city's founding c. 753 BCE, with settlements around the Palatine Hill on the Tiber, and ended with the overthrow of the kings c. 509 BCE. The traditional account, handed down chiefly through Livy, Plutarch and Dionysius of Halicarnassus, recounts a series of seven kings, but accounts written under the Republic and Empire are thought largely to rest on oral tradition, and their historicity is debated. In that tradition the last king, Tarquinius Superbus, ruled as a tyrant, and when his son Sextus raped Lucretia, Lucius Junius Brutus and others incited the revolt that ended the monarchy.",
  connections: [
    { id: "roman-republic", note: "In tradition, the overthrow of the kings c. 509 BCE established the Republic" },
  ],
  cites: [WP("Roman Kingdom", "Roman_Kingdom")],
});

TL.enrich("mahajanapadas", {
  why: "The Mahajanapadas were sixteen kingdoms and aristocratic republics of ancient India, from the sixth to fourth centuries BCE, during the second urbanization. The 6th–5th centuries BCE are often regarded as a major turning point in early Indian history, and the era saw the rise of śramaṇa movements, including Buddhism and Jainism, that challenged the religious orthodoxy of the Vedic period. The Nandas usurped the throne of the Shishunaga dynasty around 345 BCE, and the later Maurya Empire had its power base in Magadha, where Chandragupta Maurya defeated the Nanda dynasty.",
  connections: [
    { id: "an-buddha", note: "Buddhism arose among the śramaṇa movements of this era" },
    { id: "maurya", note: "The empire's power base was Magadha, a Mahajanapada region" },
  ],
  cites: [WP("Mahajanapadas", "Mahajanapadas"), WP("Maurya Empire", "Maurya_Empire")],
});

TL.enrich("achaemenid", {
  why: "Founded by Cyrus the Great in 550 BCE, the Achaemenid Empire was the largest of its time, roughly 5.5 million square kilometers, stretching from the Balkans and Cyrenaica to the Indus Valley. It allowed regional autonomy through the satrapy system, and has been recognized for its centralized administration, multicultural policy and religious tolerance, especially under Cyrus, and for infrastructure such as the Royal Road and an organized postal system. Cyrus is credited with freeing the Jews from the Babylonian captivity. Persia was defeated by Athens at Marathon in 490 BCE, and Alexander conquered the empire in 330 BCE.",
  connections: [
    { id: "an-return-from-exile", note: "Cyrus is credited with letting Jews return from Babylon to Judah" },
    { id: "an-marathon", note: "Darius I's forces were defeated by Athens at Marathon in 490 BCE" },
    { id: "an-alexander-persia", note: "Alexander conquered the empire in its entirety by 330 BCE" },
  ],
  cites: [WP("Achaemenid Empire", "Achaemenid_Empire")],
});

TL.enrich("an-cyrus-cylinder", {
  why: "The cylinder casts Cyrus in the traditional role of Babylonian and Assyrian royal propaganda: chosen by Babylon's god Marduk, restorer of temples, returning gods' images and their peoples to their homes. It was once thought to confirm the Bible's account of Cyrus freeing the Jews, but its restored lands lie east of the Tigris. In 1971 the Shah of Iran promoted it as the “world's human rights charter,” a reading Livius says ignores its stereotypical nature, and a fake translation still circulates.",
  connections: [
    { id: "an-return-from-exile", note: "Cyrus is credited with letting exiled Judeans return to Judah" },
  ],
  cites: [
    { t: "Cyrus Cylinder — Livius", u: "https://www.livius.org/sources/content/cyrus-cylinder/", k: "reference" },
    { t: "Cyrus Cylinder Translation — Livius", u: "https://www.livius.org/sources/content/cyrus-cylinder/cyrus-cylinder-translation/", k: "primary" },
    WP("Achaemenid Empire", "Achaemenid_Empire"),
  ],
});

TL.enrich("roman-republic", {
  why: "The Roman Republic (Res publica Romana) was the era of classical Roman civilization from the overthrow of the Kingdom, traditionally dated to 509 BCE, to the establishment of the Empire in 27 BCE. It was governed by collective, annual magistracies overseen by a senate; tradition has the first consuls elected for one year, each able to check his colleague by veto. The plebs elected tribunes who were sacrosanct and held veto power over legislation, and in the 4th century BCE plebeians gradually obtained political equality with patricians. Its greatest strategic rival was Carthage, defeated at Zama in 202 BCE, after which Rome became the dominant power of the Mediterranean world.",
  connections: [
    { id: "an-punic-wars", note: "Three wars with Carthage, its greatest strategic rival" },
  ],
  cites: [WP("Roman Republic", "Roman_Republic")],
});

TL.enrich("an-cleisthenes", {
  why: "Aristotle's Constitution of the Athenians judged that these reforms made the constitution “much more democratic than that of Solon.” Cleisthenes divided citizens into ten tribes mixing people from all over Attica, so that more could take part in government and had to work together politically; his law on ostracism targeted men suspected of aiming at tyranny. Historians call him “the father of Athenian democracy”; his reforms gave Athens institutions of equal rights for all citizens, though only free people counted as citizens.",
  connections: [
    { id: "an-marathon", note: "Aristotle says ostracism was first used two years after Marathon" },
  ],
  cites: [
    { t: "Aristotle, Athenian Constitution 21–22 (trans. H. Rackham) — Perseus Digital Library", u: "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0046%3Achapter%3D22", k: "primary" },
    { t: "Aristotle, Athenian Constitution 21 (trans. H. Rackham) — Perseus Digital Library", u: "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0046%3Achapter%3D21", k: "primary" },
    WP("Cleisthenes", "Cleisthenes"),
  ],
});

TL.enrich("hinduism", {
  why: "Scholars regard Hinduism as a fusion or synthesis of Brahmanical orthopraxy with various Indian cultures, with diverse roots and no specific founder. This Hindu synthesis emerged after the Vedic period, between c. 500–200 BCE and c. 300 CE, in the era of the second urbanization when the epics and first Puranas were composed. Its major scriptures include the Vedas, the Upanishads, the Puranas, the Ramayana and the Mahabharata, which contains the Bhagavad Gita. Wikipedia's article on Buddhism adds that Buddhism may have influenced Hindu theories of karma.",
  connections: [
    { id: "vedic", note: "Brahmanical orthopraxy from the Vedic period was a core of the synthesis" },
    { id: "buddhism", note: "Buddhism may have influenced karma theories of Hinduism" },
    { id: "gupta", note: "Hindu temple architecture survives from the Gupta Empire onward" },
  ],
  cites: [WP("Hinduism", "Hinduism"), WP("Buddhism", "Buddhism")],
});

TL.enrich("buddhism", {
  why: "Widely observed Buddhist teachings include the Four Noble Truths, the Noble Eightfold Path and the doctrine of karma. The Buddha's dates are uncertain, with the 5th century BCE the best estimate, and Buddhism arose among the śramaṇa movements that challenged the religious orthodoxy of the Vedic period. Under the Maurya emperor Ashoka, missionaries were sponsored to Sri Lanka, northwest India and Central Asia, which helped make Buddhism a world religion. Its Mahāyāna branch, the largest, is practiced mainly in China, Korea, Japan, Vietnam and elsewhere in East Asia, and Theravada mainly in Myanmar, Thailand, Laos, Cambodia and Sri Lanka.",
  connections: [
    { id: "an-ashoka-missions", note: "Ashoka sponsored missionaries to Sri Lanka, northwest India and Central Asia" },
    { id: "hinduism", note: "Buddhism may have influenced karma theories of Hinduism" },
  ],
  cites: [WP("Buddhism", "Buddhism"), WP("Mahajanapadas", "Mahajanapadas"), WP("Maurya Empire", "Maurya_Empire")],
});

TL.enrich("confucianism", {
  why: "The Stanford Encyclopedia of Philosophy calls Confucius arguably the most significant thinker in East Asian history. In pre-modern China he was closely associated with good government, moral education, proper ritual performance and the reciprocal obligations of social roles, and Zhu Xi's Neo-Confucian curriculum of the “Four Books” became widely influential in China, Korea and Japan. By the Han, Confucius was an authoritative figure, and select experts in the Five Classics held government positions. In the 20th century modernizers debated his legacy: some reformers and many in the Communist Party rejected him as a symbol of traditional hierarchy.",
  connections: [
    { id: "an-confucian-han", note: "Han experts in the Five Classics received government positions" },
  ],
  cites: [{ t: "Confucius — Stanford Encyclopedia of Philosophy", u: "https://plato.stanford.edu/entries/confucius/", k: "reference" }],
});

TL.enrich("an-buddha", {
  why: "Siddhartha Gautama, known as the Buddha, was a wandering religious teacher in the eastern Indo-Gangetic Plains in the 6th or 5th century BCE who founded Buddhism. After a life of mendicancy, asceticism and meditation he is said to have attained nirvana at Bodh Gaya; his core teachings are summarized in the Four Noble Truths and the Noble Eightfold Path. He wandered the lower Indo-Gangetic Plain teaching and building a monastic order, the sangha, and early texts say he eventually agreed to ordain women. Scholars are hesitant about the facts of his life: the oldest surviving written records naming the Buddha are Ashoka's edicts of the mid-3rd century BCE.",
  connections: [
    { id: "an-kalinga", note: "Ashoka, drawn to Buddhism after Kalinga, left the oldest written records naming the Buddha" },
  ],
  cites: [WP("Gautama Buddha", "Gautama_Buddha"), WP("Ashoka", "Ashoka")],
});

TL.enrich("an-alexander-persia", {
  why: "Alexander's conquests of 336–323 BCE began with the Achaemenid Empire under Darius III, whose army, personally led, was defeated by a force outnumbered more than two to one. At Persepolis, after Alexander let his troops loot the city, a fire spread through it; it is unclear whether this was a drunken accident or deliberate revenge for the burning of the Acropolis of Athens. Alexander, now the Persian “King of Kings,” adopted Persian dress and mannerisms, which Greeks came to view as decadent and autocratic, and his campaign reached the Indus Valley. After his death in 323 BCE his empire was divided among his generals, and the Hellenistic period began.",
  connections: [
    { id: "hellenistic", note: "Greek leadership and culture shaped the Hellenistic period that followed" },
    { id: "an-alexandria", note: "He set plans in motion for Alexandria, later the Ptolemaic capital" },
  ],
  cites: [WP("Wars of Alexander the Great", "Wars_of_Alexander_the_Great"), WP("Achaemenid Empire", "Achaemenid_Empire"), WP("Hellenistic period", "Hellenistic_period")],
});

TL.enrich("hellenistic", {
  why: "The Hellenistic period runs from Alexander's death in 323 BCE to the death of Cleopatra VII in 30 BCE, when Greek leadership, culture and language shaped the regions Alexander had conquered. As Greek and Levantine cultures interacted, a hybrid Hellenistic culture developed. Under the Ptolemies, Alexandria became a center of literature and research around its library, and the period saw the rise of Stoicism, Epicureanism and Pyrrhonism. In Bactria and northwest India, Hellenistic culture syncretized with Buddhism, and the Indo-Greek king Menander was a great patron of it. In 146 BCE Rome razed Corinth and Greece became a Roman protectorate.",
  connections: [
    { id: "an-library-alexandria", note: "Ptolemy patronized the library and scholars at Alexandria" },
    { id: "an-menander", note: "An Indo-Greek king and great patron of Buddhism" },
    { id: "an-corinth", note: "Rome razed Corinth in 146 BCE; Greece became a protectorate" },
  ],
  cites: [WP("Hellenistic period", "Hellenistic_period")],
});

TL.enrich("maurya", {
  why: "Founded by Chandragupta Maurya around 320 BCE with its power base in Magadha, the empire existed in loose-knit fashion until 185 BCE. Chandragupta defeated the Nanda dynasty and extended his suzerainty as far west as Afghanistan and as far south as the northern Deccan, though technology and infrastructure limited how deeply the state reached beyond its core. The population of South Asia in this period has been estimated at 15 to 30 million. After the Kalinga War, Ashoka embraced Buddhism, promoted its tenets in edicts across South Asia and sponsored missionaries who helped it become a world religion.",
  connections: [
    { id: "an-kalinga", note: "The war after which Ashoka embraced Buddhism" },
  ],
  cites: [WP("Maurya Empire", "Maurya_Empire")],
});

TL.enrich("seleucid", {
  why: "Founded by Seleucus I Nicator in 312 BCE after the division of Alexander's empire, the Seleucid state was ruled from Seleucia and later Antioch until Pompey annexed it for Rome in 63 BCE. At its height it covered Anatolia, Persia, the Levant, Mesopotamia and what are now Kuwait, Afghanistan and parts of Turkmenistan. A war with Chandragupta Maurya in 305 BCE ended in an alliance and the cession of Alexander's Indus territories. In the mid-second century BCE Mithridates I of Parthia conquered much of its eastern lands, while the independent Greco-Bactrian Kingdom kept flourishing in the northeast.",
  connections: [
    { id: "parthia", note: "Mithridates I of Parthia took much of its eastern lands in the 2nd century BCE" },
    { id: "an-menander", note: "The Greco-Bactrian region later saw Indo-Greek Menander, patron of Buddhism" },
  ],
  cites: [WP("Seleucid Empire", "Seleucid_Empire"), WP("Hellenistic period", "Hellenistic_period")],
});

TL.enrich("japan", {
  why: "The Yayoi period followed the hunter-gatherer Jōmon and marked the transition to a productive economy based on wet-rice agriculture, with new pottery and intensive paddy cultivation. Bronze and iron metallurgy were introduced, and “Yayoi people” refers to agricultural migrants from the Korean Peninsula and regions to the south who arrived in this period. Frequent conflicts between settlements or statelets are suggested by the archaeology. Chinese records mention Wo (Japan) in 57 CE, when the Na state received a golden seal from Emperor Guangwu of the Later Han, and by the end of the 2nd century a political entity called Wa-koku had formed.",
  connections: [
    { id: "jomon", note: "The hunter-gatherer period the Yayoi's rice farming followed" },
    { id: "han", note: "Emperor Guangwu of the Later Han gave the Na state of Wo a golden seal" },
  ],
  cites: [WP("Yayoi period", "Yayoi_period")],
});

TL.enrich("xiongnu", {
  why: "According to Chinese sources, the Xiongnu were a tribal confederation of nomads on the eastern Eurasian steppe from the 3rd century BCE to the late 1st century CE, whom Modu Chanyu made an empire after 209 BCE. Following a Han campaign in 200 BCE, the peace settlement gave them a Han princess in marriage and periodic gifts of silk, distilled beverages and rice, and Han marriage alliances continued under the heqin policy. The Han eventually defeated them in a centuries-long conflict that split the confederation in two and resettled many Xiongnu within Han borders. Their descendants founded Han-Zhao, Xia and Northern Liang in northern China during the Sixteen Kingdoms period.",
  connections: [
    { id: "an-silk-road", note: "Zhang Qian's reports spurred Han moves against Xiongnu control of westward routes" },
    { id: "an-xiongnu-split", note: "Defeat by the Han split the confederation in two" },
    { id: "china-division", note: "Descendants founded Han-Zhao, Xia and Northern Liang in northern China" },
  ],
  cites: [WP("Xiongnu", "Xiongnu")],
});

TL.enrich("an-punic-wars", {
  why: "The Punic Wars (264–146 BCE) pitted the Roman Republic against the Carthaginian Empire. Carthage began as the dominant power in the western Mediterranean, with an extensive maritime empire, while Rome was a rapidly expanding power in Italy with a strong army but no navy. In the Second Punic War Hannibal campaigned in Italy for fourteen years, and Scipio defeated him at Zama in 202 BCE. In 146 BCE the Romans stormed Carthage, sacked it, killed or enslaved its population and demolished the city, and its territories became the Roman province of Africa.",
  connections: [
    { id: "an-hannibal", note: "Hannibal's army campaigned in Italy for fourteen years" },
    { id: "an-corinth", note: "Rome razed Corinth in 146 BCE, the year it destroyed Carthage" },
  ],
  cites: [WP("Punic Wars", "Punic_Wars"), WP("Hellenistic period", "Hellenistic_period")],
});
