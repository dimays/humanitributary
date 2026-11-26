// w91: split "first-americans" (Indigenous peoples of the Americas, 23,000 years ago → present) into a deep-time root,
// "Peopling of the Americas", plus regional Indigenous branches and a modern Indigenous rights movements branch.
const B = (path, t) => ({ t: `${t} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const W = (slug, t) => ({ t: `${t} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });

const C = {
  paleo: B("topic/Paleo-Indian-culture", "Paleo-Indian culture"),
  archaic: B("topic/Archaic-culture", "Archaic culture"),
  usgs: { t: "Study confirms age of oldest fossil human footprints in North America — USGS (2023)", u: "https://www.usgs.gov/news/national-news-release/study-confirms-age-oldest-fossil-human-footprints-north-america" },
  mississippian: B("topic/Mississippian-culture", "Mississippian culture"),
  pueblo: B("topic/Ancestral-Pueblo-culture", "Ancestral Pueblo culture"),
  thule: B("topic/Thule-culture", "Thule culture"),
  meso: B("topic/Mesoamerican-civilization", "Mesoamerican civilization"),
  mexIndig: W("Indigenous_peoples_of_Mexico", "Indigenous peoples of Mexico"),
  mitla: B("place/Mitla", "Mitla"),
  mixtec: B("topic/Mixtec", "Mixtec"),
  eightDeer: W("Eight_Deer_Jaguar_Claw", "Eight Deer Jaguar Claw"),
  tarascanWp: W("Tarascan_state", "Tarascan state"),
  michoacan: B("place/Michoacan", "Michoacán"),
  tlaxcalan: B("topic/Tlaxcalan", "Tlaxcalan"),
  tlaxcalaCity: B("place/Tlaxcala-Mexico", "Tlaxcala (city)"),
  casteWp: W("Caste_War_of_Yucat%C3%A1n", "Caste War of Yucatán"),
  casteEb: B("event/Caste-War", "Caste War"),
  chinchorroUnesco: { t: "Settlement and Artificial Mummification of the Chinchorro Culture in the Arica and Parinacota Region — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/1634/" },
  chinchorroWp: W("Chinchorro_culture", "Chinchorro culture"),
  huari: B("place/Huari", "Huari"),
  chanChan: B("place/Chan-Chan", "Chan Chan"),
  chimu: B("topic/Chimu", "Chimú"),
  llanosWp: W("Llanos_de_Moxos_(archaeology)", "Llanos de Moxos (archaeology)"),
  casarabe: { t: "Lidar reveals pre-Hispanic low-density urbanism in the Bolivian Amazon (Prümers et al., Nature, 2022)", u: "https://www.nature.com/articles/s41586-022-04780-4" },
  upanoBbc: { t: "Huge ancient lost city found in the Amazon — BBC News (2024)", u: "https://www.bbc.com/news/science-environment-67940671" },
  upanoWp: W("Upano_Valley_sites", "Upano Valley sites"),
  terraWp: W("Terra_preta", "Terra preta"),
  terraCornell: { t: "Terra Preta de Indio — Johannes Lehmann, Cornell University", u: "https://www.css.cornell.edu/faculty/lehmann/research/terra%20preta/terrapretamain.html" },
  marajoaraWp: W("Marajoara_culture", "Marajoara culture"),
  marajoaraEb: B("topic/Marajoara-culture", "Marajoara culture"),
  orellana: B("biography/Francisco-de-Orellana", "Francisco de Orellana"),
  xinguWp: W("Xingu_Indigenous_Park", "Xingu Indigenous Park"),
  yanomamiEb: B("topic/Yanomami", "Yanomami"),
  yanomamiWp: W("Yanomami_Indigenous_Territory", "Yanomami Indigenous Territory"),
  caribDna: { t: "A genetic history of the pre-contact Caribbean (Fernandes et al., Nature, 2021)", u: "https://www.nature.com/articles/s41586-020-03053-2" },
  tainoWp: W("Ta%C3%ADno", "Taíno"),
  tainoEb: B("topic/Taino", "Taíno"),
  hispaniola: B("place/Hispaniola", "Hispaniola"),
  saladoid: W("Saladoid", "Saladoid"),
  svg: B("place/Saint-Vincent-and-the-Grenadines/History", "Saint Vincent and the Grenadines: History"),
  kalinagoWp: W("Kalinago", "Kalinago"),
  hatuey: W("Hatuey", "Hatuey"),
  enriquillo: W("Enriquillo", "Enriquillo"),
  garifuna: W("Garifuna", "Garifuna"),
  kalinagoTerr: W("Kalinago_Territory", "Kalinago Territory"),
  kalinagoBbc: { t: "Kalinago please — BBC Caribbean (November 2010)", u: "https://www.bbc.co.uk/caribbean/news/story/2010/11/101117_kalinago.shtml" },
  aim: B("topic/American-Indian-Movement", "American Indian Movement (AIM)"),
  ocmulgee: { t: "Archaic Culture — Ocmulgee Mounds National Historical Park, National Park Service", u: "https://www.nps.gov/ocmu/learn/historyculture/archaic-culture.htm" },
  tarascanWhe: { t: "Tarascan Civilization — World History Encyclopedia", u: "https://www.worldhistory.org/Tarascan_Civilization/" },
  zouche: { t: "Codex Zouche-Nuttall, Eight-Deer — University of Kentucky Libraries (Mexican codices)", u: "https://uknowledge.uky.edu/world_mexico_codices/6" },
  uncCaste: { t: "Caste War — The Maya, University of North Carolina Libraries exhibit", u: "https://exhibits.lib.unc.edu/exhibits/show/maya/caste-war" },
  berkeleyMarajo: { t: "Ancient Marajó — ORIAS, University of California, Berkeley", u: "https://orias.berkeley.edu/resources-teachers/societies-americas/ancient-maraj%C3%B3" },
  xinguEnc: { t: "Xingu Reserve — Encyclopedia.com", u: "https://encyclopedia.com/humanities/encyclopedias-almanacs-transcripts-and-maps/xingu-reserve" },
  hatueyZinn: { t: "Hatuey burned at the stake (This Day in History) — Zinn Education Project", u: "https://www.zinnedproject.org/news/tdih/hatuey/" },
  enriqAcento: { t: "El cacique Enriquillo y el triunfo de la rebelión del Bahoruco, 1519–1534 — Acento", u: "https://acento.com.do/cultura/el-cacique-enriquillo-y-el-triunfo-de-la-rebelion-del-bahoruco-contra-los-conquistadores-espanoles-entre-1519-y-1534-9550114.html" },
  dominicaEb: B("place/Dominica", "Dominica"),
  morales: B("biography/Evo-Morales", "Evo Morales"),
};

// ── The root, narrowed to the peopling itself ──
TL.patch("first-americans", {
  name: "Peopling of the Americas",
  end: -8000,
  endWhen: "c. 8000 BCE (Archaic cultures replace Paleo-Indian ways)",
  text: "Paleo-Indians came from Asia during the last ice age; Britannica puts the migration 16,000–13,000 years ago, but White Sands footprints, reaffirmed in 2023, date to 23,000–21,000 years ago. Archaic cultures followed, from about 8000 BCE in Mesoamerica.",
  addCites: [C.paleo, C.archaic],
});

TL.add({ branches: [
  { id: "indigenous-north-america", name: "Indigenous North America", region: "americas", start: -8000, end: null,
    startWhen: "c. 8000 BCE (Archaic period; dates vary by region)", parents: ["first-americans"], into: [],
    text: "Archaic cultures north of Mexico grew out of Paleo-Indian ways from about 8000 BCE. Later came Ancestral Pueblo towns, Mississippian mound cities from c. 700 CE, and the Thule, who spread across the Arctic from about 900 CE.",
    cites: [C.archaic, C.ocmulgee, C.paleo, C.pueblo, C.mississippian, C.thule] },
  { id: "indigenous-mesoamerica", name: "Indigenous Mesoamerica", region: "americas", start: -8000, end: null,
    startWhen: "c. 8000 BCE (Archaic period)", parents: ["first-americans"], into: [],
    text: "Archaic Mesoamericans (c. 8000–2000 BCE) tended wild maize; Zapotec, Mixtec, Purépecha and Tlaxcalan peoples later built states beside the Olmec, Maya and Aztec. Mexico counted about 15 million Indigenous people in 68 groups in 2012.",
    cites: [C.archaic, C.meso, C.tarascanWp, C.tlaxcalan, C.mexIndig] },
  { id: "indigenous-andes", name: "Indigenous Andes", region: "americas", start: -7000, end: null,
    startWhen: "c. 7000 BCE (Chinchorro; UNESCO dates the culture from c. 5450 BCE)", parents: ["first-americans"], into: [],
    text: "From Chinchorro fishers on the Atacama coast to the Chavín, Moche, Wari, Tiwanaku and Chimú, Andean and Pacific-coast peoples built the societies the Inca later absorbed; the Inca conquered the Chimú kingdom in 1465–70.",
    cites: [C.chinchorroUnesco, C.chinchorroWp, C.huari, C.chimu, C.chanChan] },
  { id: "indigenous-amazonia", name: "Indigenous Amazonia", region: "americas", start: -8000, end: null,
    startWhen: "by c. 8000 BCE (people in the Llanos de Moxos)", parents: ["first-americans"], into: [],
    text: "People lived in Bolivia's Llanos de Moxos by 8000 BCE. Amazonians later built garden cities in Ecuador's Upano Valley, Marajoara mounds and Casarabe causeway towns and left fertile terra preta; the Yanomami still hold forest land.",
    cites: [C.llanosWp, C.upanoBbc, C.casarabe, C.terraCornell, C.marajoaraWp, C.yanomamiEb] },
  { id: "indigenous-caribbean", name: "Indigenous Caribbean", region: "americas", start: -4000, end: null,
    startWhen: "about 6,000 years ago", parents: ["first-americans"], into: [],
    text: "Archaic Age people settled the Caribbean about 6,000 years ago; Arawak-related potters from South America later spread through the islands. Their Taíno descendants and the Kalinago met the Spanish, and Kalinago still live on Dominica.",
    cites: [C.caribDna, C.tainoEb, C.kalinagoWp, C.kalinagoTerr] },
  { id: "indigenous-rights-movements", name: "Indigenous rights movements", region: "americas", start: 1961.45, end: null,
    startWhen: "June 1961 (American Indian Chicago Conference)", parents: ["first-americans"], into: [],
    text: "From the 1960s Indigenous activists in the Americas pressed for treaty rights and self-determination: the American Indian Movement, founded in 1968, joined protests from Alcatraz to Wounded Knee; Bolivia elected an Aymara president in 2005.",
    cites: [C.aim, C.morales] },
] });

TL.origin("indigenous-north-america", {
  note: "Descendants of the first Americans: Archaic cultures developed from Paleo-Indian traditions, and in eastern North America people began tending plants such as pigweed.",
  links: [{ id: "first-americans", how: "peoples", note: "Archaic cultures developed from Paleo-Indian traditions" }],
  cites: [C.archaic, C.paleo],
});
TL.origin("indigenous-mesoamerica", {
  note: "Descendants of the first Americans in Mexico and Central America: after about 7000 BCE Archaic peoples turned toward farming, working with wild maize, and village life followed by about 1500 BCE.",
  links: [{ id: "first-americans", how: "peoples", note: "Archaic peoples of Mesoamerica grew out of Paleo-Indian hunters" }],
  cites: [C.archaic, C.meso],
});
TL.origin("indigenous-andes", {
  note: "Descendants of the first South Americans: marine hunter-gatherers such as the Chinchorro of the Atacama coast, and the highland and coastal peoples who domesticated the potato and lima bean.",
  links: [{ id: "first-americans", how: "peoples", note: "Early hunter-gatherers of the Andes and the Pacific coast" }],
  cites: [C.chinchorroUnesco, C.chinchorroWp, C.archaic],
});
TL.origin("indigenous-amazonia", {
  note: "Descendants of the first South Americans who settled the Amazon basin; people lived in the Llanos de Moxos of northern Bolivia by about 8000 BCE.",
  links: [{ id: "first-americans", how: "peoples", note: "Early inhabitants of the Amazon basin" }],
  cites: [C.llanosWp],
});
TL.origin("indigenous-caribbean", {
  note: "Archaic Age settlers related to Central and northern South Americans reached the islands about 6,000 years ago; Arawak-related ceramic users from northeast South America later replaced them almost entirely.",
  links: [{ id: "first-americans", how: "peoples", note: "Settlers from Central and northern South America" }],
  cites: [C.caribDna],
});
TL.origin("indigenous-rights-movements", {
  note: "Grew out of Native nations' long resistance and out of the civil rights era: many Native Americans had moved to cities under relocation and termination, and AIM adopted protest tactics like those of Black civil rights groups.",
  links: [
    { id: "indigenous-north-america", how: "peoples", note: "Native American and First Nations activists" },
    { id: "civil-rights", how: "context", note: "AIM borrowed protest strategies from Black civil rights organizations" },
  ],
  cites: [C.aim],
});

// ── New events ──
TL.add({ events: [
  // Mesoamerica
  { id: "w91-mitla-mixtec", branch: "indigenous-mesoamerica", y: 900, end: 1500, when: "c. 900–1500", title: "Mixtecs take over Mitla, the Zapotec “Place of the Dead”",
    text: "Mitla in Oaxaca, probably founded long before the Common Era by Zapotecs as a sacred burial site, passed to Mixtecs moving down from northern Oaxaca between 900 and 1500; their style dominates the surviving ruins.",
    imp: 2, cites: [C.mitla] },
  { id: "w91-eight-deer", branch: "indigenous-mesoamerica", y: 1063.76, end: 1115, when: "1063–1115", title: "Eight Deer Jaguar Claw builds a Mixtec realm",
    text: "The Mixtec ruler Eight Deer Jaguar Claw, son of a high priest of Tilantongo, is remembered in the Codex Zouche-Nuttall, which shows his claim to the Tilantongo throne and counts 94 cities conquered during his reign.",
    imp: 3, cites: [C.eightDeer, C.zouche] },
  { id: "w91-tarascan-state", branch: "indigenous-mesoamerica", y: 1320, end: 1530, when: "early 14th century – 1530", title: "The Purépecha (Tarascan) state at Tzintzuntzan",
    text: "Founded in the early 14th century and ruled from Tzintzuntzan on Lake Pátzcuaro, the Purépecha kingdom fought the Aztec and blocked their westward expansion. It was Mesoamerica's second-largest state when it fell to Spain in 1530.",
    imp: 2, link: "aztec", cites: [C.tarascanWp, C.tarascanWhe] },
  { id: "w91-tlaxcala-alliance", branch: "indigenous-mesoamerica", y: 1519.7, when: "1519", title: "Tlaxcala allies with Cortés against the Aztec",
    text: "The Nahuatl-speaking Tlaxcalans, who had refused Aztec rule, fought Cortés briefly in 1519 and then allied with him; their army helped him take Tenochtitlan, and their loyalty to Spain later brought them privileges.",
    imp: 2, link: "aztec", cites: [C.tlaxcalan, C.tlaxcalaCity] },
  { id: "w91-caste-war", branch: "indigenous-mesoamerica", y: 1847.5, end: 1901, when: "1847–1901 (some date the end to 1915)", title: "Caste War of Yucatán",
    text: "Maya of the Yucatán Peninsula, squeezed by hacienda land grabs and higher taxes, rose in 1847. Independent Maya held the southeast for decades, trading with British Honduras; the war was officially declared over in 1901.",
    imp: 2, link: "mexico", cites: [C.casteWp, C.casteEb, C.uncCaste] },
  // Andes
  { id: "w91-wari", branch: "indigenous-andes", y: 600, end: 1000, when: "c. 600–1000 CE (Middle Horizon)", title: "Wari empire dominates the Peruvian highlands",
    text: "Huari, in Peru's central highlands, was probably the center of a militaristic empire that dominated much of the Peruvian highlands and coast in the Middle Horizon. Its art is closely linked to Tiwanaku's.",
    imp: 2, cites: [C.huari] },
  { id: "w91-chan-chan", branch: "indigenous-andes", y: 1100, end: 1470, when: "c. 1100–1470", title: "Chan Chan, adobe capital of the Chimú kingdom",
    text: "On Peru's north coast near Trujillo, Chan Chan's adobe compounds covered about 36 square kilometers, the largest city in pre-Columbian America. The Chimú, successors of the Moche, fell to the Inca in 1465–70.",
    imp: 2, link: "inca", cites: [C.chanChan, C.chimu] },
  // Amazonia
  { id: "w91-upano", branch: "indigenous-amazonia", y: -500, end: 500, when: "from c. 500 BCE, for up to 1,000 years", title: "Garden cities of Ecuador's Upano Valley",
    text: "Lidar over 300 square kilometers of the Upano Valley found some 6,000 earthen platforms linked by straight roads, one 25 km long. Built about 2,500 years ago, they are the oldest known complex society in the Amazon.",
    imp: 2, cites: [C.upanoBbc, C.upanoWp] },
  { id: "w91-terra-preta", branch: "indigenous-amazonia", y: -450, end: 1450, when: "c. 450 BCE – 1450 CE (sources differ)", title: "Amazonians leave fertile terra preta soils",
    text: "Pre-Columbian Amazonians left dark, fertile soils rich in charcoal, bone and broken pottery; whether they made them on purpose is debated. Dates run from 2,500 to 500 years ago (Cornell) or 450 BCE to 950 CE (Wikipedia).",
    imp: 2, cites: [C.terraCornell, C.terraWp] },
  { id: "w91-casarabe", branch: "indigenous-amazonia", y: 500, end: 1400, when: "c. 500–1400 CE", title: "Casarabe towns and causeways in the Llanos de Mojos",
    text: "In the Bolivian Amazon the Casarabe culture built platform mounds and pyramids up to 22 m tall in sites of 147 and 315 hectares, linked by raised causeways. Lidar revealed this low-density urbanism in 2022.",
    imp: 2, cites: [C.casarabe, C.llanosWp] },
  { id: "w91-marajoara", branch: "indigenous-amazonia", y: 300, end: 1350, when: "c. 300–1350 CE (estimates vary)", title: "Marajoara mound builders at the mouth of the Amazon",
    text: "On Marajó Island, people raised earthen mounds above the yearly floods and made modeled, painted and carved pottery. Mound building began about 300 CE and ended by about 1350; population estimates range from thousands to 100,000.",
    imp: 2, cites: [C.berkeleyMarajo, C.marajoaraWp, C.marajoaraEb] },
  { id: "w91-orellana", branch: "indigenous-amazonia", y: 1542.6, when: "1541 – August 1542", title: "Orellana's expedition descends the Amazon",
    text: "Sent ahead of a Spanish expedition for supplies in 1541, Francisco de Orellana instead followed the Napo and the Amazon to its mouth by August 1542. His tales of women-led tribes, like Greek Amazons, likely named the river.",
    imp: 2, link: "spain", cites: [C.orellana] },
  { id: "w91-xingu-park", branch: "indigenous-amazonia", y: 1961.3, when: "1961", title: "Brazil creates the Xingu Indigenous Park",
    text: "After a campaign by the Villas-Bôas brothers, Brazil created the Xingu park in Mato Grosso in 1961 to protect the forest and its several Indigenous nations. It now covers 26,420 square kilometers.",
    imp: 2, link: "brazil", cites: [C.xinguWp, C.xinguEnc] },
  { id: "w91-yanomami-territory", branch: "indigenous-amazonia", y: 1992.4, when: "1991 – May 25, 1992", title: "Brazil sets aside a Yanomami homeland",
    text: "After gold miners invaded Yanomami land in Roraima, Brazil set aside about 30% of their ancestral territory as a homeland (1991, per Britannica). The territory was created on May 25, 1992, and the miners were removed.",
    imp: 2, link: "brazil", cites: [C.yanomamiEb, C.yanomamiWp] },
  // Caribbean
  { id: "w91-caribbean-archaic", branch: "indigenous-caribbean", y: -4000, when: "about 6,000 years ago", title: "First people settle the Caribbean islands",
    text: "Stone-tool-using Archaic Age people, closest genetically to Central and northern South Americans, settled the Caribbean about 6,000 years ago, according to a 2021 ancient-DNA study.",
    imp: 2, cites: [C.caribDna, C.tainoWp] },
  { id: "w91-saladoid", branch: "indigenous-caribbean", y: -500, when: "c. 500–280 BCE", title: "Saladoid potters move from the Orinoco into the Antilles",
    text: "Seafaring Saladoid farmers from the lower Orinoco carried pottery into the Lesser Antilles and Puerto Rico. Ancient DNA shows these Arawak-related ceramic users almost entirely replaced the islands' Archaic people.",
    imp: 2, cites: [C.saladoid, C.caribDna] },
  { id: "w91-carib-windwards", branch: "indigenous-caribbean", y: 1400, when: "c. 1400", title: "Caribs displace Arawak peoples on Saint Vincent",
    text: "About a century before Europeans arrived, Caribs from South America displaced the Arawak of Saint Vincent, Britannica says. Their Kalinago descendants lived across the Windward Islands and Dominica.",
    imp: 3, cites: [C.svg, C.kalinagoWp] },
  { id: "w91-taino-contact", branch: "indigenous-caribbean", y: 1492.93, when: "December 6, 1492", title: "Columbus reaches the Taíno island of Quisqueya",
    text: "Columbus sighted the island the Taíno called Quisqueya and named it Hispaniola. The Arawakan-speaking Taíno of Cuba, Jamaica, Hispaniola, Puerto Rico and the Virgin Islands then numbered from one to over three million.",
    imp: 2, link: "spain", cites: [C.hispaniola, C.tainoEb] },
  { id: "w91-hatuey", branch: "indigenous-caribbean", y: 1512.09, when: "February 2, 1512", title: "Taíno cacique Hatuey burned at Yara",
    text: "Hatuey, a Taíno chief from Hispaniola, crossed to Cuba with some 400 people to warn its people of the Spanish. He resisted Diego Velázquez's conquest and was burned at the stake at Yara; Cubans call him their first national hero.",
    imp: 3, cites: [C.hatuey, C.hatueyZinn] },
  { id: "w91-enriquillo", branch: "indigenous-caribbean", y: 1519, end: 1534, when: "1519–1534 (some sources say 1533)", title: "Enriquillo's revolt in the Bahoruco mountains",
    text: "The Taíno cacique Enriquillo led a rebellion against Spanish colonists on Hispaniola from the Bahoruco mountains from 1519. A 1534 settlement gave his people land and local autonomy, a rare Indigenous success.",
    imp: 3, cites: [C.enriquillo, C.enriqAcento] },
  { id: "w91-garifuna-exile", branch: "indigenous-caribbean", y: 1797.28, when: "April 12, 1797", title: "Britain exiles the Garifuna from Saint Vincent",
    text: "After the Second Carib War (1795–96), Britain deported more than 5,000 Garifuna, or Black Caribs, from Saint Vincent. About 2,500 survived to land on Roatán, Honduras, founding the Garifuna of Central America.",
    imp: 2, cites: [C.svg, C.garifuna] },
  { id: "w91-carib-territory", branch: "indigenous-caribbean", y: 1903, when: "1903", title: "Britain creates the Carib Territory on Dominica",
    text: "British colonial authorities formed a 3,700-acre district for Dominica's Kalinago on the island's remote Atlantic coast in 1903. The Carib Reserve Act of 1978 reaffirmed its boundaries and local government.",
    imp: 3, cites: [C.kalinagoTerr, C.dominicaEb] },
  { id: "w91-kalinago-name", branch: "indigenous-caribbean", y: 2015, when: "2010–2015", title: "Dominica's Caribs officially become the Kalinago",
    text: "In 2010 Kalinago leaders asked Dominica to drop “Carib,” a colonial name linked to the word cannibal, for their own name, Kalinago. The change was made official in 2015.",
    imp: 3, cites: [C.kalinagoBbc, C.kalinagoWp] },
  // Rights movements
  { id: "w91-aim-founded", branch: "indigenous-rights-movements", y: 1968.5, when: "1968", title: "American Indian Movement founded in Minneapolis",
    text: "Ojibwe activists Dennis Banks, Clyde Bellecourt, Eddie Benton Banai, Pat Bellanger and George Mitchell founded AIM, which stressed tribal sovereignty and broken treaties and borrowed civil rights protest tactics.",
    imp: 1, link: "civil-rights", cites: [C.aim] },
  { id: "w91-morales-elected", branch: "indigenous-rights-movements", y: 2006.05, when: "elected 2005; took office January 2006", title: "Evo Morales becomes Bolivia's first Indigenous president",
    text: "Evo Morales, an Aymara labor leader, won Bolivia's 2005 election with 54% of the vote, becoming its first president of Indigenous descent. A new constitution in 2009 furthered Indigenous rights.",
    imp: 2, cites: [C.morales] },
] });

// ── Re-home the events that were on first-americans ──
// Kept on the root (the peopling itself): ho-monte-verde, ho-clovis.
// w308-tupac-amaru-executed belongs to neo-inca (moved in another file).
for (const id of [
  "w602-fa-watson-brake", "w602-fa-poverty-point", "w508-dorset", "w508-adena", "w508-hopewell", "w508-basketmaker-iii",
  "w508-mississippian", "w407-chaco", "w407-thule", "me-cahokia", "w407-mesa-verde", "w407-paquime", "w407-mesa-verde-leaves",
  "me-columbian-exchange", "w308-de-soto", "w308-haudenosaunee", "w308-pequot-war", "w308-pueblo-revolt",
  "w308-great-peace-montreal", "w308-pontiacs-war", "w308-sullivan-expedition",
  "w208-fa-tippecanoe", "w208-fa-sequoyah", "w208-fa-cherokee-phoenix", "w208-fa-trail-of-tears", "w208-fa-fort-laramie-1851",
  "w208-fa-dakota-1862", "w208-fa-long-walk", "w208-fa-sand-creek", "w208-fa-little-bighorn",
  "w209-carlisle", "w209-dawes-act", "c2ao-ghost-dance", "w209-wounded-knee-1890", "w209-old-indian-legends",
  "c1am-jim-thorpe-1912", "c2ao-native-american-church", "w209-citizenship-act",
  "w109-fa-indian-reorganization-act", "w109-fa-navajo-code-talkers", "w109-fa-indian-claims-commission",
  "w109-fa-termination-policy", "w109-fa-hayes-pond", "w109-fa-house-made-of-dawn", "w109-fa-self-determination-act",
  "c1am-smoke-signals", "w109-fa-nmai-opens", "w109-fa-kamloops",
]) TL.move(id, "indigenous-north-america");

for (const id of ["ho-maize", "w508-monte-alban", "me-tenochtitlan-founded", "w308-mixton"]) TL.move(id, "indigenous-mesoamerica");

for (const id of [
  "w602-fa-valdivia-pottery", "w602-fa-chinchorro-red", "w508-chavin", "w508-paracas-textiles", "w508-nazca", "w508-sipan",
  "w508-tiwanaku", "w308-garcilaso", "w308-guaman-poma", "w308-tupac-amaru-ii",
]) TL.move(id, "indigenous-andes");

for (const id of [
  "w109-fa-chicago-conference", "w109-fa-alcatraz", "w109-fa-wounded-knee-1973", "w109-fa-section-35", "w109-fa-ilo-169",
  "w109-fa-menchu-nobel", "w109-fa-delgamuukw", "w109-fa-undrip", "w109-fa-idle-no-more", "w109-fa-standing-rock",
]) TL.move(id, "indigenous-rights-movements");

// ── Locations ──
const WG = (slug) => `https://en.wikipedia.org/wiki/${slug}`;
TL.geo("indigenous-north-america", { scope: "region", lat: 40, lon: -100, r: 3500, label: "North America north of Mexico, including the Arctic", src: WG("United_States") });
TL.geo("indigenous-mesoamerica", { scope: "region", lat: 17.2, lon: -94.7, r: 1200, label: "Mesoamerica: southern Mexico and northern Central America", src: WG("Isthmus_of_Tehuantepec") });
TL.geo("indigenous-andes", { scope: "region", lat: -10, lon: -76, r: 1800, label: "Central Andes and the Pacific coast", src: WG("Peru") });
TL.geo("indigenous-amazonia", { scope: "region", lat: -3, lon: -60, r: 2500, label: "Amazon basin", src: WG("Amazon_basin") });
TL.geo("indigenous-caribbean", { scope: "region", lat: 15, lon: -75, r: 1500, label: "Caribbean islands", src: WG("Caribbean_Sea") });
TL.geo("indigenous-rights-movements", { scope: "region", lat: 19, lon: -96, r: 6000, label: "The Americas", src: WG("Americas") });

TL.geo("w91-mitla-mixtec", { scope: "place", lat: 16.9272, lon: -96.3594, r: 30, label: "Mitla, Oaxaca", src: WG("Mitla") });
TL.geo("w91-eight-deer", { scope: "place", lat: 17.25, lon: -97.2833, r: 40, label: "Tilantongo, Oaxaca", src: WG("Tilantongo") });
TL.geo("w91-tarascan-state", { scope: "place", lat: 19.6283, lon: -101.5789, r: 60, label: "Tzintzuntzan, Lake Pátzcuaro", src: WG("Tzintzuntzan,_Michoac%C3%A1n") });
TL.geo("w91-tlaxcala-alliance", { scope: "place", lat: 19.3125, lon: -98.24, r: 40, label: "Tlaxcala, Mexico", src: WG("Tlaxcala_(city)") });
TL.geo("w91-caste-war", { scope: "region", lat: 19.5511, lon: -89.2964, r: 400, label: "Yucatán Peninsula", src: WG("Yucat%C3%A1n_Peninsula") });
TL.geo("w91-wari", { scope: "place", lat: -13.0606, lon: -74.1989, r: 50, label: "Huari (Wari), Ayacucho, Peru", src: WG("Wari_(archaeological_site)") });
TL.geo("w91-chan-chan", { scope: "place", lat: -8.1058, lon: -79.0744, r: 30, label: "Chan Chan, near Trujillo, Peru", src: WG("Chan_Chan") });
TL.geo("w91-upano", { scope: "place", lat: -2.1318, lon: -78.1054, r: 60, label: "Upano Valley, Morona-Santiago, Ecuador", src: WG("Upano_Valley_sites") });
TL.geo("w91-terra-preta", { scope: "region", lat: -3, lon: -60, r: 2000, label: "Amazon basin", src: WG("Amazon_basin") });
TL.geo("w91-casarabe", { scope: "region", lat: -14, lon: -65, r: 300, label: "Llanos de Mojos, Beni, Bolivia", src: WG("Beni_Department") });
TL.geo("w91-marajoara", { scope: "region", lat: -0.9833, lon: -49.5833, r: 150, label: "Marajó Island, Pará, Brazil", src: WG("Maraj%C3%B3") });
TL.geo("w91-orellana", { scope: "region", lat: -3, lon: -60, r: 2500, label: "Napo and Amazon rivers", src: WG("Amazon_basin") });
TL.geo("w91-xingu-park", { scope: "region", lat: -11.232, lon: -53.185, r: 200, label: "Xingu Indigenous Park, Mato Grosso", src: WG("Xingu_Indigenous_Park") });
TL.geo("w91-yanomami-territory", { scope: "region", lat: 1.9186, lon: -62.9981, r: 400, label: "Yanomami Indigenous Territory, Roraima and Amazonas", src: WG("Yanomami_Indigenous_Territory") });
TL.geo("w91-caribbean-archaic", { scope: "region", lat: 15, lon: -75, r: 1500, label: "Caribbean islands", src: WG("Caribbean_Sea") });
TL.geo("w91-saladoid", { scope: "region", lat: 14, lon: -61, r: 600, label: "Lesser Antilles", src: WG("Lesser_Antilles") });
TL.geo("w91-carib-windwards", { scope: "place", lat: 13.25, lon: -61.2, r: 60, label: "Saint Vincent", src: WG("Saint_Vincent_and_the_Grenadines") });
TL.geo("w91-taino-contact", { scope: "region", lat: 19, lon: -71, r: 350, label: "Hispaniola (Quisqueya)", src: WG("Hispaniola") });
TL.geo("w91-hatuey", { scope: "place", lat: 20.2767, lon: -76.9469, r: 40, label: "Yara, Cuba", src: WG("Yara,_Cuba") });
TL.geo("w91-enriquillo", { scope: "place", lat: 18.1167, lon: -71.4167, r: 60, label: "Bahoruco mountains, Hispaniola", src: WG("Baoruco_Mountain_Range") });
TL.geo("w91-garifuna-exile", { scope: "place", lat: 16.3833, lon: -86.4, r: 50, label: "Roatán, Honduras", src: WG("Roat%C3%A1n") });
TL.geo("w91-carib-territory", { scope: "place", lat: 15.49, lon: -61.2533, r: 30, label: "Kalinago Territory, Dominica", src: WG("Kalinago_Territory") });
TL.geo("w91-kalinago-name", { scope: "place", lat: 15.4167, lon: -61.3333, r: 50, label: "Dominica", src: WG("Dominica") });
TL.geo("w91-aim-founded", { scope: "place", lat: 44.9819, lon: -93.2692, r: 40, label: "Minneapolis, Minnesota", src: WG("Minneapolis") });
TL.geo("w91-morales-elected", { scope: "place", lat: -16.4958, lon: -68.1333, r: 40, label: "La Paz, Bolivia", src: WG("La_Paz") });

// Re-point links and parents that named the old all-Americas root (now "Peopling of the Americas", to c. 8000 BCE).
for (const id of ["ga1-oka-crisis", "ga1-nunavut", "ga1-residential-schools-apology", "ga1-trc-final-report", "lc-indian-removal-act",
  "w208-ca-indian-act", "w208-ca-north-west-rebellion", "w309-tc-king-philip", "me-lanse-aux-meadows"]) TL.patch(id, { link: "indigenous-north-america" });
TL.patch("ga1-zapatista-uprising", { link: "indigenous-mesoamerica" });
TL.patch("w109-ecuador-1990-uprising", { link: "indigenous-rights-movements" });
TL.patch("me-columbus-landfall", { link: "indigenous-caribbean" });
TL.patch("caral", { parents: ["indigenous-andes"] });
TL.patch("inca", { parents: ["indigenous-andes"] });
for (const id of ["olmec", "maya", "teotihuacan", "aztec"]) TL.patch(id, { parents: ["indigenous-mesoamerica"] });
TL.patch("colonial-brazil", { parents: ["portugal", "indigenous-amazonia"] });
