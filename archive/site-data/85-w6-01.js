// Gap-filling events, 3500–1000 BCE: Egypt, Mesopotamia, the Levant, Anatolia, the Aegean, Neolithic Europe, the steppe and the Bantu expansion. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
// Mesopotamian dates follow the middle chronology unless an entry says otherwise; Egyptian and Aegean dates are "c." and sources differ by decades.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const X = (t, u) => ({ t, u });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
TL.add({ events: [
  // ---- Naqada / Egypt
  { id: "w601-hierakonpolis-painted-tomb", branch: "naqada", y: -3400, end: -3200, when: "c. 3500–3200 BCE",
    title: "Painted Tomb 100 at Hierakonpolis",
    text: "Tomb 100 at Nekhen (Hierakonpolis), of the Naqada II period, has painted plaster walls, the only known predynastic tomb with a mural. Its paintings show boats, animals and figures and may mark an early king.",
    imp: 3, cites: [W("Hierakonpolis", "Hierakonpolis"), X("Hierakonpolis, tomb 100 — Digital Egypt for Universities, UCL", "https://www.ucl.ac.uk/museums-static/digitalegypt/hierakonpolis/tomb100/index.html"), B("place/Hierakonpolis", "Hierakonpolis")] },
  { id: "w601-narmer-palette", branch: "egypt", y: -3100, when: "c. 31st century BCE (Britannica caption: c. 2925 BCE)",
    title: "The Narmer Palette is carved",
    text: "A ceremonial slate palette from Hierakonpolis shows King Narmer in the White Crown and the Red Crown, and striking a captive. Some read it as showing Egypt's unification; others see an object that built a myth of united rule.",
    imp: 2, cites: [W("Narmer_Palette", "Narmer Palette"), B("topic/Narmer-Palette", "Narmer Palette")] },
  { id: "w601-djoser-step-pyramid", branch: "egypt", y: -2670, when: "c. 2670 BCE (reign dated c. 2686–2648 BCE; Britannica: designed c. 26th century BCE)",
    title: "Djoser's Step Pyramid rises at Saqqara",
    text: "The architect Imhotep designed this six-tier pyramid for King Djoser, begun as a square mastaba. Britannica calls it the oldest important stone building in Egypt, and its form led to the true pyramid.",
    imp: 2, cites: [W("Djoser", "Djoser"), B("topic/Step-Pyramid-of-Djoser", "Step Pyramid of Djoser")] },
  { id: "w601-great-sphinx", branch: "egypt", y: -2550, when: "c. 2600–2500 BCE",
    title: "The Great Sphinx is carved at Giza",
    text: "A limestone lion with a human head, 73 m long, was carved from the bedrock of the Giza plateau. Britannica says it likely dates to Khafre's reign; others credit Khufu, and whose face it bears is disputed.",
    imp: 2, cites: [W("Great_Sphinx_of_Giza", "Great Sphinx of Giza"), B("topic/Great-Sphinx", "Great Sphinx of Giza")] },
  { id: "w601-pyramid-texts", branch: "egypt", y: -2350, when: "c. 2400–2300 BCE",
    title: "Pyramid Texts: the oldest religious writings",
    text: "Spells and hymns to protect a dead king and give him life in the hereafter were carved inside the pyramid of Unas at Saqqara. They are the oldest surviving body of Egyptian religious and funerary writings.",
    imp: 2, cites: [W("Pyramid_Texts", "Pyramid Texts"), B("topic/Pyramid-Texts", "Pyramid Texts")] },
  { id: "w601-mentuhotep-reunifies", branch: "egypt", y: -2009, end: -1968, when: "c. 2009–1968 BCE (Britannica dates)",
    title: "Mentuhotep II reunifies Egypt",
    text: "Ruler of southern Egypt from about 2009 BCE, Mentuhotep II defeated the Heracleopolitan kingdom that held the north and, by 1968 BCE at the latest, had reunited Egypt, opening the Middle Kingdom.",
    imp: 2, cites: [B("biography/Mentuhotep-II", "Mentuhotep II")] },
  { id: "w601-hyksos-rule", branch: "egypt", y: -1650, end: -1550, when: "c. 1650–1550 BCE (Britannica: c. 1630–1530)", link: "canaanites",
    title: "Hyksos kings rule the Nile Delta",
    text: "The Hyksos, kings of probable Canaanite origin, ruled northern Egypt from Avaris as the 15th Dynasty, alongside Theban dynasties in the south, until Ahmose I defeated them.",
    imp: 2, cites: [W("Hyksos", "Hyksos"), B("topic/Hyksos-Egyptian-dynasty", "Hyksos")] },
  { id: "w601-nefertiti-bust", branch: "egypt", y: -1345, when: "c. 1345 BCE",
    title: "The bust of Nefertiti is sculpted at Amarna",
    text: "The sculptor Thutmose made a painted limestone bust of Akhenaten's queen in his Amarna workshop. German archaeologists found it in 1912, and it is now in Berlin's Neues Museum.",
    imp: 2, cites: [W("Nefertiti_Bust", "Nefertiti Bust"), B("biography/Nefertiti", "Nefertiti")] },
  { id: "w601-tutankhamun", branch: "egypt", y: -1332, end: -1323, when: "c. 1332–1323 BCE (Britannica: c. 1333–1324)",
    title: "Tutankhamun restores Amun; his tomb survives",
    text: "The boy king undid his father Akhenaten's Aten worship and left Amarna. His small tomb, KV62, was found largely intact by Howard Carter in November 1922.",
    imp: 2, cites: [W("Tutankhamun", "Tutankhamun"), B("biography/Tutankhamun", "Tutankhamun")] },
  { id: "w601-ramesses-iii-sea-peoples", branch: "egypt", y: -1180, when: "c. 1180 BCE (year 8 of his reign)",
    title: "Ramesses III defeats the Sea Peoples",
    text: "In his eighth year Ramesses III defeated a coalition of Sea Peoples in land and sea battles, after earlier turning back a Libyan invasion. He is considered the last New Kingdom pharaoh to hold substantial power.",
    imp: 2, cites: [B("biography/Ramses-III", "Ramses III"), W("Ramesses_III", "Ramesses III")] },

  // ---- Sumer
  { id: "w601-uruk-first-city", branch: "sumer", y: -3200, when: "c. 3200–3100 BCE",
    title: "Uruk grows into a city of tens of thousands",
    text: "Around 3100 BCE Uruk, with its Eanna precinct of the goddess Inanna, may have held up to 50,000 people. Its Eanna levels hold some of the earliest writing, tablets dated c. 3300 BCE.",
    imp: 2, cites: [W("Uruk", "Uruk"), B("place/Sumer", "Sumer")] },
  { id: "w601-gilgamesh-of-uruk", branch: "sumer", y: -2700, when: "c. 27th century BCE",
    title: "Gilgamesh, king of Uruk",
    text: "The Sumerian King List places Gilgamesh in the 27th century BCE, in Early Dynastic II. Later poems, including the Epic of Gilgamesh, made this king of Uruk a legend.",
    imp: 2, cites: [W("Uruk", "Uruk"), B("topic/Epic-of-Gilgamesh", "Epic of Gilgamesh")] },
  { id: "w601-standard-of-ur", branch: "sumer", y: -2500, when: "c. 2600–2400 BCE",
    title: "The Standard of Ur is made",
    text: "A box inlaid with a mosaic of shell, red limestone and lapis lazuli shows scenes of war and of a banquet with a lyrist. Woolley found it in a royal tomb at Ur in 1927–28 and called it a standard.",
    imp: 2, cites: [W("Standard_of_Ur", "Standard of Ur"), X("The Standard of Ur — Google Arts & Culture (British Museum)", "https://artsandculture.google.com/asset/7gGnYlXZRuvAAA")] },
  { id: "w601-stele-of-vultures", branch: "sumer", y: -2450, when: "c. 2450 BCE (Britannica: Eannatum reigned perhaps in the 26th century BCE)",
    title: "Eannatum of Lagash defeats Umma",
    text: "The Stele of the Vultures commemorates King Eannatum's victory over Umma. Its carvings show a phalanx of shield-bearing foot soldiers.",
    imp: 3, cites: [B("place/Stele-of-the-Vultures", "Stele of the Vultures"), B("biography/Eannatum", "Eannatum")] },
  { id: "w601-sargon-akkad", branch: "sumer", y: -2334, end: -2279, when: "c. 2334–2279 BCE (reign dates are uncertain; other proposals c. 2324–2285)",
    title: "Sargon of Akkad founds an empire",
    text: "Sargon conquered all of southern Mesopotamia, defeating Lugalzagesi of Uruk, plus parts of Syria, Anatolia and Elam. His Akkadian Empire is sometimes counted as the first empire in recorded history.",
    imp: 2, cites: [W("Sargon_of_Akkad", "Sargon of Akkad"), B("biography/Sargon", "Sargon")] },

  // ---- Assyria
  { id: "w601-kanesh-karum", branch: "assyria", y: -1900, end: -1700, when: "c. 1900–1700 BCE",
    title: "Assyrian merchants trade at Kanesh",
    text: "Merchants from Assur ran a trading quarter (karum) at Kanesh in Anatolia, trading tin and woven cloth. Over 22,000 Old Assyrian tablets from the site are the earliest historical documents found in Anatolia.",
    imp: 2, cites: [W("K%C3%BCltepe", "Kültepe"), B("place/Kultepe", "Kültepe")] },
  { id: "w601-shamshi-adad", branch: "assyria", y: -1808, end: -1776, when: "c. 1809–1776 BCE (Britannica: c. 1813–1781)",
    title: "Shamshi-Adad I builds a kingdom of Upper Mesopotamia",
    text: "An Amorite ruler who held Assur, he made Shubat-Enlil his capital and occupied Mari around 1796 BCE, placing his son Yasmah-Adad there. After his death the realm broke up and Mari was lost.",
    imp: 2, cites: [W("Shamshi-Adad_I", "Shamshi-Adad I"), B("biography/Shamshi-Adad-I", "Shamshi-Adad I")] },
  { id: "w601-ashur-uballit", branch: "assyria", y: -1363, end: -1328, when: "c. 1363–1328 BCE (Britannica: c. 1365–1330)", link: "babylonia",
    title: "Ashur-uballit I founds the Middle Assyrian Empire",
    text: "He defeated Mitanni, wrote to the pharaoh in the Amarna letters, and intervened in Babylon, where he installed Kurigalzu II as king.",
    imp: 2, cites: [W("Ashur-uballit_I", "Ashur-uballit I"), B("biography/Ashur-uballit-I", "Ashur-uballit I")] },
  { id: "w601-tukulti-ninurta", branch: "assyria", y: -1243, end: -1207, when: "reigned c. 1243–1207 BCE", link: "babylonia",
    title: "Tukulti-Ninurta I subdues Babylonia",
    text: "He asserted Assyrian supremacy over Kassite Babylonia, held it for a time, and built a ziggurat to Ishtar and a new capital, Kar-Tukulti-Ninurta. His own son killed him.",
    imp: 2, cites: [B("biography/Tukulti-Ninurta-I", "Tukulti-Ninurta I"), B("topic/Assyria", "Assyria")] },
  { id: "w601-tiglath-pileser-i", branch: "assyria", y: -1114, end: -1076, when: "reigned c. 1114–1076 BCE (Britannica: c. 1115–1077)",
    title: "Tiglath-pileser I reaches the Mediterranean",
    text: "He campaigned across Anatolia and the Levant, reached the Phoenician coast and boarded a ship at Arvad, and restored the temples of Ashur and Adad at Assur.",
    imp: 3, cites: [W("Tiglath-Pileser_I", "Tiglath-Pileser I"), B("biography/Tiglath-pileser-I", "Tiglath-pileser I")] },

  // ---- Babylonia
  { id: "w601-atrahasis", branch: "babylonia", y: -1650, when: "c. 1650 BCE (copy dated to Ammi-Saduqa's reign)",
    title: "The Atra-Hasis flood epic is copied",
    text: "The most complete surviving copy of this Akkadian epic, about a flood sent by the gods and the man Enki warned, is an Old Babylonian tablet of about 1650 BCE. A later flood story in Gilgamesh draws on it.",
    imp: 3, cites: [W("Atra-Hasis", "Atra-Hasis"), B("topic/myth-of-Atrahasis", "Myth of Atrahasis")] },
  { id: "w601-kassites-rule-babylon", branch: "babylonia", y: -1531, end: -1155, when: "c. 1531–1155 BCE (short chronology)",
    title: "Kassites take Babylonia after the Hittite sack",
    text: "After the Hittites sacked Babylon, the Kassites controlled Babylonia for about 375 years (short chronology). Babylon was renamed Karanduniash, and Dur-Kurigalzu became a new capital.",
    imp: 2, cites: [W("Kassites", "Kassites"), B("topic/Kassite", "Kassite")] },
  { id: "w601-amarna-letters", branch: "babylonia", y: -1350, when: "c. 14th century BCE", link: "egypt",
    title: "Amarna letters: diplomacy in Babylonian cuneiform",
    text: "A cache of clay tablets from Akhenaten's capital records letters between great kings in Babylonian cuneiform. Kassite king Burnaburiash and Assyria's Ashur-uballit were among the writers.",
    imp: 2, cites: [B("topic/Amarna-Letters", "Amarna letters"), W("Ashur-uballit_I", "Ashur-uballit I")] },
  { id: "w601-nebuchadnezzar-i", branch: "babylonia", y: -1119, end: -1098, when: "reigned 1119–1098 BCE",
    title: "Nebuchadnezzar I captures Susa",
    text: "The most famous king of the Second Dynasty of Isin avenged Elamite conquests by capturing Susa, the Elamite capital.",
    imp: 3, cites: [B("biography/Nebuchadrezzar-I", "Nebuchadrezzar I")] },

  // ---- Canaanites
  { id: "w601-execration-texts", branch: "canaanites", y: -1900, when: "c. 20th–18th century BCE (Britannica: 20th–19th)", link: "egypt",
    title: "Egyptian execration texts list Canaanite rulers",
    text: "Egyptians wrote the names of enemies on pottery and figurines, then smashed them as a curse. Two groups name dozens of places and rulers in Canaan and Phoenicia, possibly including the first mention of Jerusalem.",
    imp: 3, cites: [W("Execration_texts", "Execration texts"), B("topic/Execration-Texts", "Execration Texts")] },
  { id: "w601-megiddo-thutmose-iii", branch: "canaanites", y: -1457, when: "c. 1457 BCE (sources range c. 1482–1457 BCE; Britannica: c. 1468)", link: "egypt",
    title: "Thutmose III defeats a Canaanite coalition at Megiddo",
    text: "Egypt's king routed rebel Canaanite states led by Kadesh, then besieged Megiddo for about seven months until it surrendered. His account is carved at Karnak.",
    imp: 2, cites: [W("Battle_of_Megiddo_(15th_century_BC)", "Battle of Megiddo (15th century BC)"), B("place/Megiddo", "Megiddo")] },
  { id: "w601-ugaritic-alphabet", branch: "canaanites", y: -1400, when: "c. 1400–1300 BCE",
    title: "Ugarit writes with a 30-letter cuneiform alphabet",
    text: "Scribes at the port of Ugarit wrote the local language with wedge-shaped letters on clay. Found in 1928, it is the earliest known large-scale use of an alphabet for administration.",
    imp: 2, cites: [W("Ugaritic_alphabet", "Ugaritic alphabet"), B("place/Ugarit", "Ugarit")] },

  // ---- Hittites
  { id: "w601-suppiluliuma", branch: "hittites", y: -1350, end: -1322, when: "reigned c. 1350–1322 BCE", link: "egypt",
    title: "Suppiluliuma I breaks Mitanni and takes Syria",
    text: "In the One-Year War he sacked Mitanni's capital and made Syrian kingdoms, including Ugarit and Kadesh, allies or vassals. The empire reached its peak.",
    imp: 2, cites: [W("Suppiluliuma_I", "Suppiluliuma I"), B("biography/Suppiluliumas-I", "Suppiluliumas I")] },

  // ---- Minoan
  { id: "w601-kamares-ware", branch: "minoan", y: -2000, end: -1700, when: "c. 2000–1700 BCE",
    title: "Kamares ware: ornate Minoan pottery",
    text: "Polychrome pottery with white, red and orange designs on a dark ground, called Kamares ware, typifies the Early Palace period in Crete. Its flower, fish and other naturalistic motifs were made in palace workshops.",
    imp: 3, cites: [W("Minoan_art", "Minoan art"), B("topic/Early-Palace-Period", "Early Palace Period")] },
  { id: "w601-first-palaces", branch: "minoan", y: -1900, when: "c. 1900 BCE (Britannica: from c. 2000 BCE)",
    title: "The first palaces rise at Knossos, Phaistos and Malia",
    text: "Large palaces built around central courts appear on Crete, opening the Early Palace period. The first Knossos palace went up at the start of the Middle Minoan period; earthquakes later destroyed these palaces.",
    imp: 2, cites: [W("Minoan_palace", "Minoan palace"), B("place/Knossos", "Knossos"), B("topic/Early-Palace-Period", "Early Palace Period")] },
  { id: "w601-linear-a", branch: "minoan", y: -1850, end: -1400, when: "c. 1850–1400 BCE",
    title: "Linear A script appears on Crete",
    text: "A syllabic script written left to right is attested in Crete and on Aegean islands from about 1850 BCE. The Mycenaeans later borrowed it to make Linear B.",
    imp: 3, cites: [B("topic/Linear-A", "Linear A")] },
  { id: "w601-knossos-frescoes", branch: "minoan", y: -1700, end: -1400, when: "from the Middle Minoan III period (c. 1700 BCE); peak c. 1600–1400 BCE",
    title: "Minoan wall painting flowers at Knossos",
    text: "Figurative frescoes appear in the palaces from Middle Minoan IIIA, among them the bull-leaping scene, and reach their peak with scenes of dancing and sport. Evans's restorations have been widely criticized.",
    imp: 2, cites: [W("Minoan_art", "Minoan art"), B("place/Knossos", "Knossos")] },
  { id: "w601-karphi", branch: "minoan", y: -1100, end: -900, when: "c. 1100–900 BCE",
    title: "Minoans retreat to the mountain town of Karphi",
    text: "Late in the Bronze Age, people moved to remote hills. At Karphi, about 1,100 m up, a town of houses, paved passages and a shrine was occupied for about two centuries. Pendlebury excavated it in 1937–39.",
    imp: 3, cites: [W("Karphi", "Karphi"), X("Karphi — Visit Greece (Greek National Tourism Organisation)", "https://www.gtp.gr/destinations/karphi")] },

  // ---- Mycenaean
  { id: "w601-shaft-graves", branch: "mycenaean", y: -1600, end: -1500, when: "c. 1600–1500 BCE",
    title: "Royal shaft graves at Mycenae",
    text: "Grave Circle A held 19 bodies with gold masks, weapons and cups. Schliemann dug it in 1876–77 and named one mask Agamemnon's, though the graves predate his supposed era by about three centuries.",
    imp: 2, cites: [W("Grave_Circle_A,_Mycenae", "Grave Circle A, Mycenae"), B("place/Mycenae", "Mycenae")] },
  { id: "w601-linear-b", branch: "mycenaean", y: -1400, end: -1200, when: "c. 1400–1200 BCE",
    title: "Linear B records the oldest Greek",
    text: "Mycenaean palaces at Knossos, Pylos and elsewhere kept their accounts in Linear B, adapted from Linear A. Michael Ventris showed in 1952 that it writes an early form of Greek.",
    imp: 2, cites: [B("topic/Linear-B", "Linear B"), B("topic/Linear-A", "Linear A")] },
  { id: "w601-uluburun-shipwreck", branch: "mycenaean", y: -1320, when: "c. 1320 BCE (radiocarbon, ±15 years)", link: "canaanites",
    title: "The Uluburun ship sinks off Turkey",
    text: "A ship from the Levant, carrying copper and tin ingots, Canaanite jars and glass ingots, sank near Kaş. It likely had a Syro-Canaanite crew and Greek passengers. A sponge diver found the wreck in 1982.",
    imp: 2, cites: [W("Uluburun_shipwreck", "Uluburun shipwreck"), X("Uluburun Late Bronze Age Shipwreck Excavation — Institute of Nautical Archaeology", "https://nauticalarch.org/projects/uluburun-late-bronze-age-shipwreck-excavation/")] },
  { id: "w601-lion-gate", branch: "mycenaean", y: -1250, when: "c. 1250 BCE",
    title: "The Lion Gate is built at Mycenae",
    text: "As the citadel's walls were extended, a gateway of two monoliths and a lintel was topped by a relief of two lionesses, the largest surviving Bronze Age Aegean sculpture.",
    imp: 2, cites: [W("Lion_Gate", "Lion Gate"), B("place/Mycenae", "Mycenae")] },

  // ---- Neolithic Europe
  { id: "w601-newgrange", branch: "neolithic-europe", y: -3200, when: "c. 3200 BCE",
    title: "Newgrange passage tomb built in Ireland",
    text: "Stone Age farmers built this passage grave in the Boyne valley. At the winter solstice the rising sun shines along its 19 m passage into the burial chamber.",
    imp: 2, cites: [B("topic/Newgrange", "Newgrange")] },
  { id: "w601-skara-brae", branch: "neolithic-europe", y: -3200, end: -2200, when: "c. 3200–2200 BCE (radiocarbon dates differ; Wikipedia: c. 3180–2500)",
    title: "Skara Brae village is inhabited on Orkney",
    text: "A village of one-room stone houses with stone furniture was lived in for centuries. A great storm exposed it in 1850, and it is part of the UNESCO World Heritage site Heart of Neolithic Orkney.",
    imp: 2, cites: [B("place/Skara-Brae", "Skara Brae")] },
  { id: "w601-bell-beaker", branch: "neolithic-europe", y: -2800, end: -1800, when: "from c. 2800 BCE",
    title: "The Bell Beaker culture spreads across Europe",
    text: "Early Beaker pottery is found at the Tagus estuary in Portugal. The style spread from Iberia to the Danube and, from about 2450 BCE, to Britain, as people sought copper and gold.",
    imp: 2, cites: [W("Bell_Beaker_culture", "Bell Beaker culture"), B("topic/Beaker-folk", "Beaker folk")] },
  { id: "w601-amesbury-archer", branch: "neolithic-europe", y: -2320, when: "c. 2340–2300 BCE",
    title: "The Amesbury Archer is buried near Stonehenge",
    text: "A man buried with copper knives and the earliest gold objects found in Britain. Tooth isotopes show he grew up in central Europe, probably the Alps. Archaeologists found the grave in 2002.",
    imp: 3, cites: [W("Amesbury_Archer", "Amesbury Archer"), X("The Amesbury Archer — Wessex Archaeology", "https://www.wessexarch.co.uk/our-work/amesbury-archer")] },

  // ---- Yamnaya
  { id: "w601-yamnaya-horizon", branch: "yamnaya", y: -3400, end: -3200, when: "c. 3400–3200 BCE (Anthony's dating)",
    title: "The Yamnaya horizon spreads over the steppe",
    text: "The Yamnaya, or Pit Grave, culture spread quickly across the Pontic–Caspian steppe. Its people buried their dead under kurgans and used wheeled carts and wagons; some elite men were buried with wagons.",
    imp: 3, cites: [W("Yamnaya_culture", "Yamnaya culture"), X("Early Herders of the Eurasian Steppe — Penn Museum Expedition", "https://www.penn.museum/sites/expedition/early-herders-of-the-eurasian-steppe/"), X("The Genetic Origin of the Indo-Europeans (preprint) — PubMed Central", "https://pmc.ncbi.nlm.nih.gov/articles/PMC11042377/")] },
  { id: "w601-yamnaya-danube", branch: "yamnaya", y: -3000, when: "by c. 3000 BCE",
    title: "Yamnaya reach Hungary at their greatest extent",
    text: "By about 3000 BCE the Yamnaya complex stretched from Hungary in the west to Kazakhstan in the east. Ancient DNA shows its people drew on Eastern European and Caucasus hunter-gatherer ancestry.",
    imp: 3, cites: [W("Yamnaya_culture", "Yamnaya culture"), X("The Genetic Origin of the Indo-Europeans (preprint) — PubMed Central", "https://pmc.ncbi.nlm.nih.gov/articles/PMC11042377/")] },

  // ---- Bantu expansion
  { id: "w601-bantu-forest-corridors", branch: "bantu-expansion", y: -2000, end: -500, when: "from c. 2000 BCE (rainforest thinning c. 2000–500 BCE)",
    title: "Forest degradation opens routes for the Bantu",
    text: "By about 4,000 years ago climate change had opened savannah corridors at the rainforest's edge. Bantu speakers followed them and moved slowly through dense forest, lacking iron tools until later.",
    imp: 3, cites: [W("Bantu_expansion", "Bantu expansion"), X("Bantu expansion shows that habitat alters the route and pace of human dispersals — PNAS (PubMed Central)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4629331/")] },
  { id: "w601-bantu-central-cameroon", branch: "bantu-expansion", y: -1500, when: "c. 1500 BCE",
    title: "Western Bantu reach central Cameroon",
    text: "Setting out from the Cameroon–Nigeria border region, the slow-moving Western Stream is thought to have reached only central Cameroon by about 1500 BCE.",
    imp: 3, cites: [W("Bantu_expansion", "Bantu expansion"), X("Bantu expansion shows that habitat alters the route and pace of human dispersals — PNAS (PubMed Central)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4629331/"), B("art/Bantu-languages", "Bantu languages")] },
] });

TL.geo("w601-hierakonpolis-painted-tomb", { scope: "place", lat: 25.097, lon: 32.779, r: 40, label: "Hierakonpolis, Egypt", src: "https://en.wikipedia.org/wiki/Hierakonpolis" });
TL.geo("w601-narmer-palette", { scope: "place", lat: 25.097, lon: 32.779, r: 40, label: "Hierakonpolis, Egypt", src: "https://en.wikipedia.org/wiki/Hierakonpolis" });
TL.geo("w601-djoser-step-pyramid", { scope: "place", lat: 29.871, lon: 31.216, r: 40, label: "Saqqara, Egypt", src: "https://en.wikipedia.org/wiki/Pyramid_of_Djoser" });
TL.geo("w601-great-sphinx", { scope: "place", lat: 29.975, lon: 31.138, r: 40, label: "Giza, Egypt", src: "https://en.wikipedia.org/wiki/Great_Sphinx_of_Giza" });
TL.geo("w601-pyramid-texts", { scope: "place", lat: 29.867, lon: 31.215, r: 40, label: "Pyramid of Unas, Saqqara", src: "https://en.wikipedia.org/wiki/Pyramid_of_Unas" });
TL.geo("w601-mentuhotep-reunifies", { scope: "place", lat: 25.721, lon: 32.61, r: 50, label: "Thebes, Egypt", src: "https://en.wikipedia.org/wiki/Thebes,_Egypt" });
TL.geo("w601-hyksos-rule", { scope: "place", lat: 30.78, lon: 31.83, r: 60, label: "Avaris (Tell el-Dab'a), Egypt", src: "https://en.wikipedia.org/wiki/Tell_el-Dab%27a" });
TL.geo("w601-nefertiti-bust", { scope: "place", lat: 27.645, lon: 30.896, r: 40, label: "Amarna, Egypt", src: "https://en.wikipedia.org/wiki/Amarna" });
TL.geo("w601-tutankhamun", { scope: "place", lat: 25.74, lon: 32.602, r: 40, label: "Valley of the Kings, Egypt", src: "https://en.wikipedia.org/wiki/KV62" });
TL.geo("w601-ramesses-iii-sea-peoples", { scope: "region", lat: 30.9, lon: 31.12, r: 150, label: "Nile Delta, Egypt", src: "https://en.wikipedia.org/wiki/Nile_Delta" });
TL.geo("w601-uruk-first-city", { scope: "place", lat: 31.323, lon: 45.636, r: 50, label: "Uruk, Iraq", src: "https://en.wikipedia.org/wiki/Uruk" });
TL.geo("w601-gilgamesh-of-uruk", { scope: "place", lat: 31.323, lon: 45.636, r: 50, label: "Uruk, Iraq", src: "https://en.wikipedia.org/wiki/Uruk" });
TL.geo("w601-standard-of-ur", { scope: "place", lat: 30.963, lon: 46.103, r: 50, label: "Ur, Iraq", src: "https://en.wikipedia.org/wiki/Ur" });
TL.geo("w601-stele-of-vultures", { scope: "place", lat: 31.41, lon: 46.41, r: 60, label: "Lagash, Iraq", src: "https://en.wikipedia.org/wiki/Lagash" });
TL.geo("w601-sargon-akkad", { scope: "region", lat: 32.0, lon: 46.0, r: 400, label: "Sumer and Akkad, Mesopotamia", src: "https://en.wikipedia.org/wiki/Sumer" });
TL.geo("w601-kanesh-karum", { scope: "place", lat: 38.851, lon: 35.632, r: 40, label: "Kültepe (Kanesh), Turkey", src: "https://en.wikipedia.org/wiki/K%C3%BCltepe" });
TL.geo("w601-shamshi-adad", { scope: "place", lat: 36.96, lon: 41.51, r: 80, label: "Tell Leilan (Shubat-Enlil), Syria", src: "https://en.wikipedia.org/wiki/Tell_Leilan" });
TL.geo("w601-ashur-uballit", { scope: "place", lat: 35.456, lon: 43.26, r: 50, label: "Assur, Iraq", src: "https://en.wikipedia.org/wiki/Assur" });
TL.geo("w601-tukulti-ninurta", { scope: "place", lat: 35.456, lon: 43.26, r: 50, label: "Assur, Iraq", src: "https://en.wikipedia.org/wiki/Assur" });
TL.geo("w601-tiglath-pileser-i", { scope: "place", lat: 35.456, lon: 43.26, r: 50, label: "Assur, Iraq", src: "https://en.wikipedia.org/wiki/Assur" });
TL.geo("w601-atrahasis", { scope: "place", lat: 32.536, lon: 44.421, r: 50, label: "Babylon, Iraq", src: "https://en.wikipedia.org/wiki/Babylon" });
TL.geo("w601-kassites-rule-babylon", { scope: "place", lat: 32.536, lon: 44.421, r: 50, label: "Babylon, Iraq", src: "https://en.wikipedia.org/wiki/Babylon" });
TL.geo("w601-amarna-letters", { scope: "place", lat: 27.645, lon: 30.896, r: 40, label: "Amarna, Egypt", src: "https://en.wikipedia.org/wiki/Amarna" });
TL.geo("w601-nebuchadnezzar-i", { scope: "place", lat: 32.19, lon: 48.258, r: 50, label: "Susa, Iran", src: "https://en.wikipedia.org/wiki/Susa" });
TL.geo("w601-execration-texts", { scope: "region", lat: 33, lon: 35.5, r: 250, label: "Canaan", src: "https://en.wikipedia.org/wiki/Canaan" });
TL.geo("w601-megiddo-thutmose-iii", { scope: "place", lat: 32.585, lon: 35.185, r: 40, label: "Megiddo, Israel", src: "https://en.wikipedia.org/wiki/Tel_Megiddo" });
TL.geo("w601-ugaritic-alphabet", { scope: "place", lat: 35.52, lon: 35.778, r: 40, label: "Ugarit, near Latakia, Syria", src: "https://en.wikipedia.org/wiki/Latakia" });
TL.geo("w601-suppiluliuma", { scope: "place", lat: 40.019, lon: 34.615, r: 80, label: "Hattusa, Turkey", src: "https://en.wikipedia.org/wiki/Hattusa" });
TL.geo("w601-kamares-ware", { scope: "region", lat: 35.21, lon: 24.91, r: 120, label: "Crete", src: "https://en.wikipedia.org/wiki/Crete" });
TL.geo("w601-first-palaces", { scope: "place", lat: 35.298, lon: 25.163, r: 40, label: "Knossos, Crete", src: "https://en.wikipedia.org/wiki/Knossos" });
TL.geo("w601-linear-a", { scope: "region", lat: 35.21, lon: 24.91, r: 120, label: "Crete", src: "https://en.wikipedia.org/wiki/Crete" });
TL.geo("w601-knossos-frescoes", { scope: "place", lat: 35.298, lon: 25.163, r: 40, label: "Knossos, Crete", src: "https://en.wikipedia.org/wiki/Knossos" });
TL.geo("w601-karphi", { scope: "place", lat: 35.22, lon: 25.47, r: 30, label: "Karphi, Crete", src: "https://en.wikipedia.org/wiki/Karphi" });
TL.geo("w601-shaft-graves", { scope: "place", lat: 37.731, lon: 22.756, r: 40, label: "Mycenae, Greece", src: "https://en.wikipedia.org/wiki/Mycenae" });
TL.geo("w601-linear-b", { scope: "place", lat: 35.298, lon: 25.163, r: 40, label: "Knossos, Crete", src: "https://en.wikipedia.org/wiki/Knossos" });
TL.geo("w601-uluburun-shipwreck", { scope: "place", lat: 36.13, lon: 29.68, r: 40, label: "Uluburun, near Kaş, Turkey", src: "https://en.wikipedia.org/wiki/Uluburun_shipwreck" });
TL.geo("w601-lion-gate", { scope: "place", lat: 37.731, lon: 22.756, r: 40, label: "Mycenae, Greece", src: "https://en.wikipedia.org/wiki/Mycenae" });
TL.geo("w601-newgrange", { scope: "place", lat: 53.695, lon: -6.476, r: 40, label: "Newgrange, Ireland", src: "https://en.wikipedia.org/wiki/Newgrange" });
TL.geo("w601-skara-brae", { scope: "place", lat: 59.049, lon: -3.343, r: 40, label: "Skara Brae, Orkney", src: "https://en.wikipedia.org/wiki/Skara_Brae" });
TL.geo("w601-bell-beaker", { scope: "region", lat: 40.5, lon: -4, r: 1500, label: "Iberia to Britain and the Danube", src: "https://en.wikipedia.org/wiki/Iberian_Peninsula" });
TL.geo("w601-amesbury-archer", { scope: "place", lat: 51.173, lon: -1.78, r: 40, label: "Amesbury, England", src: "https://en.wikipedia.org/wiki/Amesbury" });
TL.geo("w601-yamnaya-horizon", { scope: "region", lat: 47.086, lon: 39.239, r: 1200, label: "Pontic–Caspian steppe", src: "https://en.wikipedia.org/wiki/Don_(river)" });
TL.geo("w601-yamnaya-danube", { scope: "region", lat: 46.5, lon: 20.0, r: 600, label: "Hungary and the Pannonian Basin", src: "https://en.wikipedia.org/wiki/Pannonian_Basin" });
TL.geo("w601-bantu-forest-corridors", { scope: "region", lat: 0.0, lon: 22.0, r: 900, label: "Congo rainforest", src: "https://en.wikipedia.org/wiki/Congo_Basin" });
TL.geo("w601-bantu-central-cameroon", { scope: "region", lat: 6, lon: 12, r: 400, label: "Central Cameroon", src: "https://en.wikipedia.org/wiki/Cameroon" });
