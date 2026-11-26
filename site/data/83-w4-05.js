// Fill-in W4-05: 1000–1500 — Renaissance, Scotland, Benin, Ethiopia, Ghana Empire, Great Zimbabwe, Ife, Kongo and Mali events (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const H = (slug, title) => ({ t: `${title} — World History Encyclopedia`, u: `https://www.worldhistory.org/${slug}/` });
const X = (t, u, k) => (k ? { t, u, k } : { t, u });
const M = (slug, title) => ({ t: `${title} — Heilbrunn Timeline of Art History, The Metropolitan Museum of Art`, u: `https://www.metmuseum.org/essays/${slug}`, k: "museum" });

TL.add({ events: [
  // ---------- The Renaissance ----------
  { id: "w405-dante-commedia", branch: "renaissance", y: 1308, end: 1321, when: "c. 1308–1321", title: "Dante writes the Divine Comedy",
    text: "Dante wrote his epic of Hell, Purgatory and Paradise in the Italian vernacular rather than Latin, drawing on his exile from Florence. He mainly used the Tuscan dialect, which became standard literary Italian.", imp: 2,
    cites: [B("biography/Dante-Alighieri", "Dante"), W("Divine_Comedy", "Divine Comedy")] },
  { id: "w405-masaccio-trinity", branch: "renaissance", y: 1425, end: 1426, when: "1425–1426", title: "Masaccio paints the Holy Trinity fresco",
    text: "In Santa Maria Novella in Florence, Masaccio painted what Britannica calls the first extant example of systematic one-point linear perspective. It set a pattern for Renaissance painters.", imp: 2,
    cites: [B("biography/Masaccio", "Masaccio")] },
  { id: "w405-cosimo-medici", branch: "renaissance", y: 1434, when: "1434", title: "Cosimo de' Medici's family begins to rule Florence",
    text: "Cosimo, the wealthiest man of his time, ran a Medici bank with branches in every important financial market of Europe. The Medici family ruled Florence from 1434 to 1537 and were major patrons of Renaissance art.", imp: 2,
    cites: [B("biography/Cosimo-de-Medici", "Cosimo de' Medici"), B("topic/Medici-family", "Medici family")] },
  { id: "w405-botticelli-venus", branch: "renaissance", y: 1485, when: "c. 1485", title: "Botticelli paints the Birth of Venus",
    text: "Sandro Botticelli's Birth of Venus and La Primavera are often said to epitomize the spirit of the Renaissance for modern viewers. Both were painted for patrons in Medici Florence.", imp: 2,
    cites: [B("biography/Sandro-Botticelli", "Sandro Botticelli")] },
  { id: "w405-last-supper", branch: "renaissance", y: 1495, end: 1498, when: "1495–1498", title: "Leonardo paints the Last Supper in Milan",
    text: "Leonardo da Vinci painted the wall painting of the Last Supper in Milan. Britannica calls it one of the most famous artworks in the world and part of humanity's common heritage.", imp: 2,
    cites: [B("biography/Leonardo-da-Vinci", "Leonardo da Vinci")] },

  // ---------- Kingdom of Scotland ----------
  { id: "w405-duncan-killed", branch: "scotland", y: 1040.6, when: "August 1040", title: "Macbeth kills King Duncan I",
    text: "Duncan I, king of the Scots from 1034, besieged Durham unsuccessfully in 1039 and was murdered in 1040 by Macbeth, Mormaor (subking) of Moray, who probably had a better claim to the throne.", imp: 2,
    cites: [B("biography/Duncan-I", "Duncan I")] },
  { id: "w405-margaret-malcolm", branch: "scotland", y: 1070, when: "c. 1070", title: "Margaret marries Malcolm III Canmore",
    text: "Margaret, an exile of the English royal house, married Malcolm III, who reigned from 1057 or 1058 to 1093. As queen she was a pious reformer, canonized in 1250, and her tomb at Dunfermline became a pilgrimage site.", imp: 3,
    cites: [B("biography/Saint-Margaret-of-Scotland", "Saint Margaret of Scotland")] },
  { id: "w405-david-i", branch: "scotland", y: 1124.3, when: "April 1124", title: "David I becomes king and builds Scotland's burghs",
    text: "David I created a rudimentary central administration, issued the first Scottish royal coinage, and founded castles around which Scotland's first burghs grew, including Edinburgh and Stirling.", imp: 2,
    cites: [B("biography/David-I", "David I")] },
  { id: "w405-falaise", branch: "scotland", y: 1174.9, when: "December 1174", title: "Treaty of Falaise: William the Lion submits to Henry II", link: "england",
    text: "Captured by English forces, William I of Scotland had to recognize Henry II's overlordship and the supremacy of the English church over the Scottish church. William bought back Scotland's independence in 1189.", imp: 2,
    cites: [B("event/Treaty-of-Falaise", "Treaty of Falaise")] },
  { id: "w405-perth-1266", branch: "scotland", y: 1266.5, when: "1266", title: "Norway cedes the Hebrides and Man to Alexander III",
    text: "In 1266 King Magnus V of Norway ceded the Hebrides and the Isle of Man to Alexander III. The treaty extended Scottish rule over the western islands.", imp: 2,
    cites: [B("biography/Alexander-III-king-of-Scotland", "Alexander III")] },
  { id: "w405-alexander-iii-dies", branch: "scotland", y: 1286.2, when: "March 18–19, 1286", title: "Alexander III dies, opening a succession crisis",
    text: "Alexander III died near Kinghorn after a fall, last of the line from Malcolm III. With his children dead, the heir was his infant granddaughter Margaret, the Maid of Norway, and after her death in 1290 Edward I of England stepped in.", imp: 2,
    cites: [B("biography/Alexander-III-king-of-Scotland", "Alexander III"), B("event/Battle-of-Stirling-Bridge", "Battle of Stirling Bridge")] },
  { id: "w405-stirling-bridge", branch: "scotland", y: 1297.7, when: "September 11, 1297", title: "Wallace wins at Stirling Bridge", link: "england",
    text: "William Wallace's Scots defeated an English army at Stirling Bridge during a revolt against Edward I, who had deposed Balliol and ruled Scotland directly. It was a major early victory in the wars of independence.", imp: 2,
    cites: [B("event/Battle-of-Stirling-Bridge", "Battle of Stirling Bridge")] },
  { id: "w405-bannockburn", branch: "scotland", y: 1314.47, when: "June 24, 1314", title: "Robert the Bruce wins at Bannockburn", link: "england",
    text: "A large English army came to relieve the garrison of Stirling and was decisively beaten by Robert the Bruce. Bannockburn secured his kingship and led to English recognition of independence in 1328.", imp: 1,
    cites: [B("biography/Robert-I-king-of-Scotland", "Robert I")] },
  { id: "w405-arbroath", branch: "scotland", y: 1320.3, when: "1320", title: "Declaration of Arbroath sent to the pope",
    text: "Composed at Arbroath Abbey, the letter from the Scottish Parliament to the pope at Avignon asserted Scotland's independence after Bannockburn and pledged nobles' support to King Robert.", imp: 1,
    cites: [B("topic/Declaration-of-Arbroath", "Declaration of Arbroath")] },
  { id: "w405-robert-ii", branch: "scotland", y: 1371.1, when: "February 22, 1371", title: "Robert II becomes the first Stewart king",
    text: "Robert II became king of Scots in 1371, succeeding David II. He was the first of the Stewart (Stuart) sovereigns in Scotland.", imp: 3,
    cites: [B("biography/Robert-II-king-of-Scotland", "Robert II")] },
  { id: "w405-barbour-bruce", branch: "scotland", y: 1376, when: "1376", title: "Barbour completes The Bruce",
    text: "John Barbour finished his 20-book verse romance on Robert the Bruce. Britannica calls it a Scottish national epic and the first major work of Scottish literature.", imp: 2,
    cites: [B("biography/John-Barbour", "John Barbour")] },
  { id: "w405-st-andrews-univ", branch: "scotland", y: 1413, when: "1413", title: "University of St Andrews officially founded",
    text: "St Andrews, in Fife, was officially founded in 1413 and is the oldest university in Scotland.", imp: 2,
    cites: [B("topic/University-of-St-Andrews", "University of St Andrews")] },
  { id: "w405-glasgow-univ", branch: "scotland", y: 1451, when: "1451", title: "University of Glasgow founded by papal bull",
    text: "Pope Nicholas V issued the bull founding the University of Glasgow in 1451, on the petition of King James II of Scotland.", imp: 3,
    cites: [B("topic/University-of-Glasgow", "University of Glasgow")] },

  // ---------- Kingdom of Benin ----------
  { id: "w405-eweka", branch: "benin-kingdom", y: 1200, when: "c. 1200", title: "Eweka crowned: the Oba dynasty begins", link: "ife",
    text: "Edo tradition says the Edo, dissatisfied with the semimythical Ogisos, invited Prince Oranmiyan of Ife to rule them. His son Eweka became Benin's first king.", imp: 2,
    cites: [B("place/Benin-City", "Benin City"), H("Kingdom_of_Benin", "Kingdom of Benin"), W("Benin_Empire", "Benin Empire")] },
  { id: "w405-benin-brass-ife", branch: "benin-kingdom", y: 1280, when: "late 13th century", title: "An Ife master brings brass casting to Benin", link: "ife",
    text: "Benin tradition says Ife's king sent a master craftsman to Benin to teach his skills. The oral tradition may reflect the movement of iron-working Yoruba peoples into Edo territory.", imp: 2,
    cites: [H("Kingdom_of_Benin", "Kingdom of Benin"), B("place/Benin-City", "Benin City")] },
  { id: "w405-ewuare", branch: "benin-kingdom", y: 1440, when: "1440", title: "Ewuare the Great takes power and walls Benin City",
    text: "Ewuare came to power in 1440 and built an earthen inner wall about 7 miles long, girded by a moat. Traces of the wall and moat remain in Benin City, which is famed for its brasswork.", imp: 2,
    cites: [W("Benin_Empire", "Benin Empire"), B("place/Benin-City", "Benin City"), B("topic/Benin-bronzes", "Benin Bronzes")] },

  // ---------- Ethiopian Empire ----------
  { id: "w405-lalibela", branch: "ethiopia", y: 1210, when: "late 12th–early 13th century", title: "Zagwe king Lalibela's rock-hewn churches",
    text: "Under the Zagwe dynasty, which preceded the Solomonic line (1270), King Lalibela is traditionally said to have built the 11 monolithic churches of his capital Roha. A pilgrimage center, it became a World Heritage site in 1978.", imp: 1,
    cites: [B("place/Lalibela-Ethiopia", "Lalibela"), B("biography/Zagwe-dynasty", "Zagwe dynasty"), M("ethiopias-enduring-cultural-heritage", "Ethiopia's Enduring Cultural Heritage")] },
  { id: "w405-yekuno-amlak", branch: "ethiopia", y: 1270, when: "1270", title: "Yekuno Amlak overthrows the Zagwe",
    text: "Yekuno Amlak rebelled with monastic support and claimed descent from King Solomon. His accession in 1270 began the Solomonic dynasty.", imp: 1,
    cites: [B("biography/Yekuno-Amlak", "Yekuno Amlak")] },
  { id: "w405-amda-seyon", branch: "ethiopia", y: 1314, end: 1344, when: "1314–1344", title: "Amda Seyon I fights the Muslim sultanates",
    text: "Amda Seyon ruled from 1314 to 1344 and is remembered in the chronicles as a heroic fighter against the Muslim kingdoms to the southeast, which he generally defeated one by one.", imp: 2,
    cites: [B("biography/Amda-Seyon-I", "Amda Seyon I")] },
  { id: "w405-kebra-nagast", branch: "ethiopia", y: 1321, when: "c. 1314–1322", title: "The Kebra Nagast is composed in Ge'ez",
    text: "Scholars date the Glory of Kings to 1314–1322. It tells of the Queen of Sheba, Solomon and their son Menelik, who brought the Ark of the Covenant to Ethiopia, and it supported the Solomonic dynasty's claim of descent from Solomon.", imp: 2,
    cites: [W("Kebra_Nagast", "Kebra Nagast"), B("biography/Yekuno-Amlak", "Yekuno Amlak"), M("ethiopias-enduring-cultural-heritage", "Ethiopia's Enduring Cultural Heritage")] },
  { id: "w405-dawit-venice", branch: "ethiopia", y: 1402.5, when: "by June 23, 1402", title: "Dawit I's embassy reaches Venice",
    text: "Emperor Dawit I sent an embassy to Europe that had reached Venice by June 1402, asking for craftsmen to be sent to Ethiopia. Five artisans reportedly left Venice that August.", imp: 3,
    cites: [W("Dawit_I", "Dawit I"), X("Dawit I — Encyclopaedia Africana", "https://encyclopaediaafricana.com/dawit-i/")] },
  { id: "w405-florence-ethiopians", branch: "ethiopia", y: 1441.65, when: "August 26, 1441", title: "Ethiopians sent by Zara Yaqob reach the Council of Florence", link: "renaissance",
    text: "The papal envoy Alberto da Sarteano returned to the Council of Florence with four Ethiopians from Emperor Zara Yaqob, and Copts. one of the earliest meetings between Ethiopia and Renaissance Italy.", imp: 3,
    cites: [W("Council_of_Florence", "Council of Florence"), X("Zara Yakub — Dictionary of African Christian Biography", "https://dacb.org/stories/ethiopia/zara-yakub/")] },
  { id: "w405-debre-mitmaq", branch: "ethiopia", y: 1450, when: "1450", title: "Zara Yaqob holds the Council of Debre Mitmaq",
    text: "The emperor (r. 1434–68) conceded a point on Sabbath observance at the Council of Debre Mitmaq in 1450, while reforming the church strongly and executing leaders of heretical sects.", imp: 3,
    cites: [B("biography/Zara-Yaqob", "Zara Yaqob")] },

  // ---------- Ghana Empire ----------
  { id: "w405-ghana-audaghost", branch: "ghana-empire", y: 1050, when: "by 1050", title: "Ghana takes control of the Berber town of Audaghost",
    text: "By 1050 Ghana was strong enough to assume control of Audaghost, a Berber town on the trans-Saharan route. Its wealth rested on the Saharan gold trade, which had begun by the fifth century.", imp: 3,
    cites: [M("the-trans-saharan-gold-trade-7th-14th-century", "The Trans-Saharan Gold Trade (7th–14th Century)")] },
  { id: "w405-al-bakri", branch: "ghana-empire", y: 1068, when: "1067–1068", title: "Al-Bakri describes the court of Ghana",
    text: "The geographer al-Bakri described the king's capital as two towns about six miles apart, and a court with gold-embroidered caps and golden saddles. Tunka Manin had succeeded Ghana Bassi in 1063.", imp: 2,
    cites: [M("the-trans-saharan-gold-trade-7th-14th-century", "The Trans-Saharan Gold Trade (7th–14th Century)"), W("Ghana_Empire", "Ghana Empire")] },
  { id: "w405-almoravid-1076", branch: "ghana-empire", y: 1076.5, end: 1077, when: "1076–1077", title: "The traditional date of the Almoravid conquest",
    text: "Britannica says the Almoravids seized Kumbi in 1076, and tradition dates their conquest of Ghana to 1076–77. Modern scholars question it, and some call a military conquest mere folklore.", imp: 3,
    cites: [B("place/Ghana-historical-West-African-empire", "Ghana"), W("Ghana_Empire", "Ghana Empire")] },
  { id: "w405-sumanguru-kumbi", branch: "ghana-empire", y: 1203, when: "c. 1203", title: "Sumanguru of the Sosso captures Kumbi",
    text: "The Sosso ruler Sumanguru, who had conquered many former tributaries of Ghana, captured Kumbi, its capital, around 1203. Soon afterward the Soninke and North African merchants left Kumbi for other trading centers.", imp: 2,
    cites: [B("biography/Sumanguru", "Sumanguru"), B("place/Kumbi", "Kumbi")] },

  // ---------- Kingdom of Zimbabwe ----------
  { id: "w405-gz-hill-wall", branch: "great-zimbabwe", y: 1250, when: "mid-13th century", title: "A granite wall encircles the Hill Complex",
    text: "In the mid-13th century the Hill Complex was surrounded by a dry-stone wall of locally split granite. Stone building at the site had begun in the 11th century.", imp: 3,
    cites: [H("Great_Zimbabwe", "Great Zimbabwe"), W("Great_Zimbabwe", "Great Zimbabwe")] },
  { id: "w405-gz-great-enclosure", branch: "great-zimbabwe", y: 1350, when: "13th–14th century", title: "The Great Enclosure is built",
    text: "The elliptical dry-stone wall of the Great Enclosure rises up to 36 feet and runs about 820 feet. It is the largest ancient structure south of the Sahara.", imp: 1,
    cites: [M("great-zimbabwe-11th-15th-century", "Great Zimbabwe (11th–15th Century)"), H("Great_Zimbabwe", "Great Zimbabwe")] },
  { id: "w405-gz-birds", branch: "great-zimbabwe", y: 1400, when: "14th–15th century", title: "The Zimbabwe Birds are carved from soapstone",
    text: "Eight soapstone birds, thought to represent the bateleur eagle, stood on columns more than a yard tall. Today a bird appears on the flag of Zimbabwe.", imp: 2,
    cites: [M("great-zimbabwe-11th-15th-century", "Great Zimbabwe (11th–15th Century)"), W("Great_Zimbabwe", "Great Zimbabwe")] },
  { id: "w405-gz-imports", branch: "great-zimbabwe", y: 1400, when: "14th–15th century", title: "Chinese porcelain reaches Great Zimbabwe",
    text: "Excavations found Longquan stoneware and blue-and-white porcelain from the 14th and 15th centuries, with Arabian coins and glass beads. They show links to Swahili ports such as Kilwa.", imp: 3,
    cites: [W("Great_Zimbabwe", "Great Zimbabwe")] },
  { id: "w405-gz-decline", branch: "great-zimbabwe", y: 1450, when: "15th century", title: "Great Zimbabwe declines",
    text: "The city declined in the 15th century, probably as its gold sources were exhausted or its land overpopulated, according to World History Encyclopedia. The Shona moved north to a new site at Mutapa.", imp: 2,
    cites: [H("Great_Zimbabwe", "Great Zimbabwe"), B("place/Great-Zimbabwe", "Great Zimbabwe")] },

  // ---------- Ife ----------
  { id: "w405-ife-oduduwa", branch: "ife", y: 1050, when: "c. 11th century", title: "Oduduwa's royal house of Ife",
    text: "Yoruba tradition makes Ife the origin of humankind and Oduduwa its first divine king; Oduduwa's royal house is dated to about the 11th century. The oni of Ife still determines the right of other Yoruba kings to wear beaded crowns.", imp: 2,
    cites: [M("ife-from-ca-6th-century", "Ife (from ca. 6th Century)"), W("Ife", "Ife"), B("topic/Oduduwa", "Oduduwa")] },
  { id: "w405-ife-pavements", branch: "ife", y: 1150, end: 1400, when: "12th–14th century", title: "Ife's houses get potsherd pavements",
    text: "Ife was a settlement of substantial size between the 12th and 14th centuries, with houses featuring pavements of potsherds. Ife artisans were also producing naturalistic terra-cotta heads and lost-wax bronzes.", imp: 3,
    cites: [W("Ife", "Ife"), B("place/Ile-Ife", "Ile-Ife")] },
  { id: "w405-ife-benin-shift", branch: "ife", y: 1450, when: "15th century", title: "Power shifts from Ife to Benin", link: "benin-kingdom",
    text: "Ife's flourishing artistic period ran from about 1200 to 1500. Afterward production declined as political and economic power shifted to the nearby kingdom of Benin.", imp: 3,
    cites: [M("ife-from-ca-6th-century", "Ife (from ca. 6th Century)"), W("Ife", "Ife")] },

  // ---------- Kingdom of Kongo ----------
  { id: "w405-kongo-expansion", branch: "kongo", y: 1400, when: "c. 1390–1420", title: "Kongo expands by conquest from Mbanza Kongo",
    text: "Lukeni lua Nimi began the expansion of the kingdom, pushing south into Mpemba. The kingdom grew by conquest, controlling about 150 miles of coast and reaching the Kwango River at its peak in the 15th and 16th centuries.", imp: 2,
    cites: [H("Kingdom_of_Kongo", "Kingdom of Kongo"), W("Kingdom_of_Kongo", "Kingdom of Kongo")] },

  // ---------- Mali Empire ----------
  { id: "w405-kirina", branch: "mali", y: 1235, when: "c. 1235", title: "Sundiata wins at Kirina and founds Mali",
    text: "Sundiata Keita defeated the Sosso ruler Sumanguru at Kirina and made the former tributary states of Kaniaga recognize his rule. He founded the Mali empire and moved its seat to Niani.", imp: 1,
    cites: [B("biography/Sundiata-Keita", "Sundiata Keita"), H("Mali_Empire", "Mali Empire")] },
  { id: "w405-manden-charter", branch: "mali", y: 1235, when: "c. 1235", title: "The Manden Charter is proclaimed",
    text: "The Manden Charter, largely oral, was proclaimed at Kurukan Fuga after the founder's victory in the early 13th century; the Mali Empire article dates it to 1235. One line holds that “children's education behooves the entire society.”", imp: 3,
    cites: [X("Manden Charter, proclaimed in Kurukan Fuga — UNESCO Intangible Cultural Heritage", "https://ich.unesco.org/en/RL/manden-charter-proclaimed-in-kurukan-fuga-00290"), W("Mali_Empire", "Mali Empire")] },
  { id: "w405-timbuktu-mosques", branch: "mali", y: 1327, when: "c. 1325–1327", title: "Timbuktu's Sankore and Djinguereber mosques",
    text: "Mansa Musa commissioned the Sankore, built about 1327 by the architect al-Sahili, and the Djinguereber is also traced to him. Timbuktu became a center of Islamic learning, and the mosques are part of Timbuktu's UNESCO World Heritage site.", imp: 1,
    cites: [B("topic/Sankore-Mosque", "Sankore Mosque"), X("Timbuktu — UNESCO World Heritage Centre", "https://whc.unesco.org/en/list/119/")] },
  { id: "w405-ibn-battuta-mali", branch: "mali", y: 1352.5, end: 1353, when: "1352–1353", title: "Ibn Battuta visits Mansa Sulayman's Mali",
    text: "The Moroccan traveler Ibn Battuta reached the Mali capital in July 1352 and stayed into 1353, during Mansa Sulayman's reign. His account describes Islam alongside older animist beliefs.", imp: 2,
    cites: [B("biography/Ibn-Battuta", "Ibn Battuta"), W("Mali_Empire", "Mali Empire"), H("Mali_Empire", "Mali Empire")] },
  { id: "w405-tuareg-timbuktu", branch: "mali", y: 1433, when: "1433", title: "Tuareg take Timbuktu from Mali",
    text: "Mali lost control of Timbuktu to the Tuareg in 1433–34. The Tuareg occupied it until Songhai's Sunni Ali drove them out.", imp: 2, link: "songhai",
    cites: [B("topic/Songhai-empire", "Songhai empire"), W("Mali_Empire", "Mali Empire"), H("Mali_Empire", "Mali Empire")] },
] });

TL.geo("w405-dante-commedia", { scope: "place", lat: 43.7696, lon: 11.2558, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w405-masaccio-trinity", { scope: "place", lat: 43.7746, lon: 11.2480, r: 30, label: "Santa Maria Novella, Florence", src: "https://en.wikipedia.org/wiki/Santa_Maria_Novella" });
TL.geo("w405-cosimo-medici", { scope: "place", lat: 43.7696, lon: 11.2558, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w405-botticelli-venus", { scope: "place", lat: 43.7696, lon: 11.2558, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w405-last-supper", { scope: "place", lat: 45.4659, lon: 9.1710, r: 30, label: "Santa Maria delle Grazie, Milan", src: "https://en.wikipedia.org/wiki/Santa_Maria_delle_Grazie,_Milan" });
TL.geo("w405-duncan-killed", { scope: "place", lat: 57.6486, lon: -3.3098, r: 60, label: "Elgin, Moray, Scotland", src: "https://en.wikipedia.org/wiki/Elgin,_Moray" });
TL.geo("w405-margaret-malcolm", { scope: "place", lat: 56.0719, lon: -3.4393, r: 40, label: "Dunfermline, Scotland", src: "https://en.wikipedia.org/wiki/Dunfermline" });
TL.geo("w405-david-i", { scope: "region", lat: 57, lon: -4, r: 250, label: "Scotland", src: "https://en.wikipedia.org/wiki/Scotland" });
TL.geo("w405-falaise", { scope: "place", lat: 48.8959, lon: -0.1953, r: 40, label: "Falaise, Normandy", src: "https://en.wikipedia.org/wiki/Falaise,_Calvados" });
TL.geo("w405-perth-1266", { scope: "region", lat: 57, lon: -7, r: 300, label: "Hebrides, Scotland", src: "https://en.wikipedia.org/wiki/Hebrides" });
TL.geo("w405-alexander-iii-dies", { scope: "place", lat: 56.0710, lon: -3.1760, r: 30, label: "Kinghorn, Fife", src: "https://en.wikipedia.org/wiki/Kinghorn" });
TL.geo("w405-stirling-bridge", { scope: "place", lat: 56.1190, lon: -3.9370, r: 30, label: "Stirling, Scotland", src: "https://en.wikipedia.org/wiki/Stirling" });
TL.geo("w405-bannockburn", { scope: "place", lat: 56.09, lon: -3.94, r: 30, label: "Bannockburn, Stirling", src: "https://en.wikipedia.org/wiki/Battle_of_Bannockburn" });
TL.geo("w405-arbroath", { scope: "place", lat: 56.5600, lon: -2.5850, r: 30, label: "Arbroath Abbey, Angus", src: "https://en.wikipedia.org/wiki/Arbroath_Abbey" });
TL.geo("w405-robert-ii", { scope: "region", lat: 57, lon: -4, r: 250, label: "Scotland", src: "https://en.wikipedia.org/wiki/Scotland" });
TL.geo("w405-barbour-bruce", { scope: "place", lat: 57.1500, lon: -2.0944, r: 40, label: "Aberdeen, Scotland", src: "https://en.wikipedia.org/wiki/Aberdeen" });
TL.geo("w405-st-andrews-univ", { scope: "place", lat: 56.3398, lon: -2.7967, r: 30, label: "St Andrews, Fife", src: "https://en.wikipedia.org/wiki/St_Andrews" });
TL.geo("w405-glasgow-univ", { scope: "place", lat: 55.8642, lon: -4.2518, r: 30, label: "Glasgow, Scotland", src: "https://en.wikipedia.org/wiki/Glasgow" });
TL.geo("w405-eweka", { scope: "place", lat: 6.33, lon: 5.62, r: 60, label: "Benin City, Nigeria", src: "https://en.wikipedia.org/wiki/Benin_City" });
TL.geo("w405-benin-brass-ife", { scope: "place", lat: 6.33, lon: 5.62, r: 60, label: "Benin City, Nigeria", src: "https://en.wikipedia.org/wiki/Benin_City" });
TL.geo("w405-ewuare", { scope: "place", lat: 6.33, lon: 5.62, r: 60, label: "Benin City, Nigeria", src: "https://en.wikipedia.org/wiki/Benin_City" });
TL.geo("w405-lalibela", { scope: "place", lat: 12.0319, lon: 39.0473, r: 40, label: "Lalibela, Ethiopia", src: "https://en.wikipedia.org/wiki/Lalibela" });
TL.geo("w405-yekuno-amlak", { scope: "region", lat: 9, lon: 39, r: 600, label: "Ethiopia", src: "https://en.wikipedia.org/wiki/Ethiopia" });
TL.geo("w405-amda-seyon", { scope: "region", lat: 9, lon: 39, r: 600, label: "Ethiopia", src: "https://en.wikipedia.org/wiki/Ethiopia" });
TL.geo("w405-kebra-nagast", { scope: "region", lat: 9, lon: 39, r: 600, label: "Ethiopia", src: "https://en.wikipedia.org/wiki/Ethiopia" });
TL.geo("w405-dawit-venice", { scope: "place", lat: 45.4375, lon: 12.3358, r: 40, label: "Venice, Italy", src: "https://en.wikipedia.org/wiki/Venice" });
TL.geo("w405-florence-ethiopians", { scope: "place", lat: 43.7696, lon: 11.2558, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w405-debre-mitmaq", { scope: "region", lat: 9, lon: 39, r: 600, label: "Ethiopia", src: "https://en.wikipedia.org/wiki/Ethiopia" });
TL.geo("w405-ghana-audaghost", { scope: "region", lat: 15.67, lon: -8, r: 500, label: "Ghana Empire (Wagadu)", src: "https://en.wikipedia.org/wiki/Ghana_Empire" });
TL.geo("w405-al-bakri", { scope: "place", lat: 15.77, lon: -7.97, r: 60, label: "Koumbi Saleh, Mauritania", src: "https://en.wikipedia.org/wiki/Koumbi_Saleh" });
TL.geo("w405-almoravid-1076", { scope: "place", lat: 15.77, lon: -7.97, r: 60, label: "Koumbi Saleh, Mauritania", src: "https://en.wikipedia.org/wiki/Koumbi_Saleh" });
TL.geo("w405-sumanguru-kumbi", { scope: "place", lat: 15.77, lon: -7.97, r: 60, label: "Koumbi Saleh, Mauritania", src: "https://en.wikipedia.org/wiki/Koumbi_Saleh" });
TL.geo("w405-gz-hill-wall", { scope: "place", lat: -20.2674, lon: 30.9338, r: 40, label: "Great Zimbabwe", src: "https://en.wikipedia.org/wiki/Great_Zimbabwe" });
TL.geo("w405-gz-great-enclosure", { scope: "place", lat: -20.2674, lon: 30.9338, r: 40, label: "Great Zimbabwe", src: "https://en.wikipedia.org/wiki/Great_Zimbabwe" });
TL.geo("w405-gz-birds", { scope: "place", lat: -20.2674, lon: 30.9338, r: 40, label: "Great Zimbabwe", src: "https://en.wikipedia.org/wiki/Great_Zimbabwe" });
TL.geo("w405-gz-imports", { scope: "place", lat: -20.2674, lon: 30.9338, r: 40, label: "Great Zimbabwe", src: "https://en.wikipedia.org/wiki/Great_Zimbabwe" });
TL.geo("w405-gz-decline", { scope: "place", lat: -20.2674, lon: 30.9338, r: 40, label: "Great Zimbabwe", src: "https://en.wikipedia.org/wiki/Great_Zimbabwe" });
TL.geo("w405-ife-oduduwa", { scope: "place", lat: 7.48, lon: 4.56, r: 40, label: "Ile-Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("w405-ife-pavements", { scope: "place", lat: 7.48, lon: 4.56, r: 40, label: "Ile-Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("w405-ife-benin-shift", { scope: "place", lat: 7.48, lon: 4.56, r: 40, label: "Ile-Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("w405-kongo-expansion", { scope: "place", lat: -6.2667, lon: 14.2500, r: 80, label: "Mbanza-Kongo, Angola", src: "https://en.wikipedia.org/wiki/M%27banza-Kongo" });
TL.geo("w405-kirina", { scope: "place", lat: 12.31, lon: -8.15, r: 60, label: "Kirina, Mali", src: "https://en.wikipedia.org/wiki/Battle_of_Kirina" });
TL.geo("w405-manden-charter", { scope: "region", lat: 12.5, lon: -8.0, r: 400, label: "Mali Empire", src: "https://en.wikipedia.org/wiki/Mali_Empire" });
TL.geo("w405-timbuktu-mosques", { scope: "place", lat: 16.78, lon: -3.01, r: 30, label: "Timbuktu, Mali", src: "https://en.wikipedia.org/wiki/Timbuktu" });
TL.geo("w405-ibn-battuta-mali", { scope: "region", lat: 12.5, lon: -8.0, r: 400, label: "Mali Empire", src: "https://en.wikipedia.org/wiki/Mali_Empire" });
TL.geo("w405-tuareg-timbuktu", { scope: "place", lat: 16.78, lon: -3.01, r: 30, label: "Timbuktu, Mali", src: "https://en.wikipedia.org/wiki/Timbuktu" });
