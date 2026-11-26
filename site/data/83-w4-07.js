// Fill-in W4-07: East Asia (Ming, Mongol, Song, Yuan), Aztec, first Americans, Maya, Māori and Polynesians, 1000–1500. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };

TL.add({ events: [
  // ---------- Ming ----------
  { id: "w407-hongwu-enthroned", branch: "ming", y: D(1368, 1, 23), when: "January 23, 1368", title: "Zhu Yuanzhang enthroned as the Hongwu Emperor",
    text: "The rebel leader Zhu Yuanzhang took the throne as the Hongwu Emperor, founding the Ming dynasty and ending Mongol rule over China.", imp: 2,
    cites: [W("Hongwu_Emperor", "Hongwu Emperor"), B("biography/Hongwu", "Hongwu")] },
  { id: "w407-hu-weiyong", branch: "ming", y: D(1380, 2, 12), when: "February 12, 1380", title: "Chancellor Hu Weiyong executed; the chancellor's office ends",
    text: "Hongwu had his chief minister Hu Weiyong executed for treason and abolished the post of grand chancellor, so the emperor ran the government himself.", imp: 2,
    cites: [W("Hu_Weiyong", "Hu Weiyong"), W("Hongwu_Emperor", "Hongwu Emperor"), B("biography/Hongwu", "Hongwu")] },
  { id: "w407-yongle-dadian", branch: "ming", y: 1408, when: "1408", title: "Yongle Encyclopedia completed",
    text: "Thousands of scholars working under the Yongle Emperor finished the Yongle dadian, a vast Chinese encyclopedia compiled from earlier writings.", imp: 2,
    cites: [B("topic/Yongle-dadian", "Yongle dadian"), W("Yongle_Encyclopedia", "Yongle Encyclopedia")] },
  { id: "w407-tumu", branch: "ming", y: D(1449, 9, 1), when: "September 1, 1449", title: "Tumu Crisis: Zhengtong Emperor captured by the Oirats",
    text: "An Oirat Mongol army under Esen Taishi crushed the Ming force near Tumu and captured the emperor, shaking the dynasty.", imp: 2, link: "mongol-empire",
    cites: [W("Tumu_Crisis", "Tumu Crisis"), B("biography/Zhengtong", "Zhengtong")] },

  // ---------- Mongol Empire ----------
  { id: "w407-marco-polo", branch: "mongol-empire", y: 1271, end: 1295, when: "1271–1295", title: "Marco Polo travels in Asia under Kublai Khan",
    text: "The Venetian merchant Marco Polo journeyed from Europe to Asia in 1271–95 and spent 17 of those years in China; his account made the Mongol world known in Europe.", imp: 2,
    cites: [B("biography/Marco-Polo", "Marco Polo"), W("Marco_Polo", "Marco Polo")] },

  // ---------- Song ----------
  { id: "w407-wang-anshi", branch: "song", y: 1069, end: 1076, when: "1069–1076", title: "Wang Anshi's New Policies",
    text: "As a senior minister Wang Anshi launched the New Policies, with agricultural loans and more circulating currency, a controversial fiscal reform that split the court.", imp: 2,
    cites: [B("biography/Wang-Anshi", "Wang Anshi"), W("Wang_Anshi", "Wang Anshi")] },
  { id: "w407-dream-pool", branch: "song", y: 1088, when: "1088", title: "Shen Kuo's Dream Pool Essays",
    text: "In retirement Shen Kuo compiled his Mengxi bitan, which holds the earliest Chinese reference to the magnetic compass and the first description of movable type.", imp: 2,
    cites: [B("biography/Shen-Kuo", "Shen Kuo"), W("Dream_Pool_Essays", "Dream Pool Essays")] },
  { id: "w407-su-song-clock", branch: "song", y: 1092, when: "1092", title: "Su Song writes up his astronomical clock tower",
    text: "Su Song's treatise describes a water-powered astronomical clock tower at Kaifeng, whose chain drive anticipated techniques not used in Europe for centuries.", imp: 3,
    cites: [B("biography/Su-Song", "Su Song"), W("Su_Song", "Su Song")] },
  { id: "w407-qingming-scroll", branch: "song", y: 1125, when: "12th century", title: "Along the River During the Qingming Festival",
    text: "Zhang Zeduan's handscroll shows the bustle of the Song capital's streets, river and city gate, and is prized as both a masterpiece and a record of daily life.", imp: 2,
    cites: [B("biography/Zhang-Zeduan", "Zhang Zeduan"), W("Along_the_River_During_the_Qingming_Festival", "Along the River During the Qingming Festival")] },
  { id: "w407-caishi", branch: "song", y: D(1161, 11, 26), end: D(1161, 11, 27), when: "November 26–27, 1161", title: "Song fleet beats the Jin at Caishi",
    text: "A Song river fleet armed with trebuchets turned back Jin emperor Wanyan Liang's invasion at Caishi on the Yangzi, ending nearly two decades of peace.", imp: 2,
    cites: [W("Battle_of_Caishi", "Battle of Caishi")] },
  { id: "w407-xiangyang", branch: "song", y: D(1268, 10, 16), end: D(1273, 3, 14), when: "October 16, 1268 – March 14, 1273", title: "Siege of Xiangyang",
    text: "Mongol forces besieged the Song stronghold of Xiangyang for nearly five years until its commander Lü Wenhuan surrendered to Kublai Khan, opening the way to the Yangzi.", imp: 2, link: "yuan",
    cites: [W("Battle_of_Xiangyang", "Battle of Xiangyang"), B("place/Xiangyang", "Xiangyang")] },
  { id: "w407-linan-falls", branch: "song", y: D(1276, 2, 4), when: "February 4, 1276", title: "Lin'an, the Southern Song capital, falls",
    text: "The Mongol army took Lin'an (Hangzhou), capital of the Southern Song since 1138, leaving only remnants of the dynasty to resist until Yamen three years later.", imp: 2, link: "yuan",
    cites: [W("Song_dynasty", "Song dynasty"), B("topic/Southern-Song-dynasty", "Southern Song dynasty")] },

  // ---------- Yuan ----------
  { id: "w407-zaju", branch: "yuan", y: 1300, end: 1368, when: "Yuan dynasty", title: "Zaju drama matures under the Yuan",
    text: "The northern variety play grew into a mature four-act form alternating songs and dialogue; Guan Hanqing and Wang Shifu are among its famed authors.", imp: 2,
    cites: [B("art/zaju", "zaju"), W("Zaju", "Zaju"), W("Guan_Hanqing", "Guan Hanqing")] },
  { id: "w407-fuchun", branch: "yuan", y: 1347, end: 1350, when: "1347–1350", title: "Huang Gongwang paints Dwelling in the Fuchun Mountains",
    text: "The scholar-painter Huang Gongwang, one of the Four Masters of the Yuan, made this long handscroll, a landmark of Chinese landscape painting.", imp: 2,
    cites: [B("biography/Huang-Gongwang", "Huang Gongwang")] },
  { id: "w407-red-turbans", branch: "yuan", y: 1351, end: 1368, when: "1351–1368", title: "Red Turban Rebellion",
    text: "Peasant uprisings spread across the Yuan realm; one rebel commander, Zhu Yuanzhang, went on to found the Ming dynasty in 1368.", imp: 2, link: "ming",
    cites: [W("Red_Turban_Rebellion", "Red Turban Rebellion"), B("biography/Hongwu", "Hongwu")] },

  // ---------- Aztec ----------
  { id: "w407-templo-mayor-1487", branch: "aztec", y: D(1487, 12, 19), when: "December 19, 1487", title: "Templo Mayor of Tenochtitlan dedicated",
    text: "A commemoration stone records that the rebuilt Great Temple of Huitzilopochtli was opened amid ceremony on the last day of the month Panquetzaliztli, the 19th of December 1487.", imp: 2,
    cites: [W("Templo_Mayor", "Templo Mayor"), B("topic/Templo-Mayor", "Templo Mayor")] },

  // ---------- Indigenous peoples of the Americas ----------
  { id: "w407-thule", branch: "first-americans", y: 1000, end: 1300, when: "c. 900–1300", title: "Thule people spread from Alaska across the Arctic",
    text: "The Thule, ancestors of the Inuit, developed in coastal Alaska by about 1000 and spread east across Arctic Canada, reaching Greenland in the 12th or 13th century by different accounts.", imp: 2,
    cites: [W("Thule_people", "Thule people"), B("topic/Thule-culture", "Thule culture")] },
  { id: "w407-chaco", branch: "first-americans", y: 900, end: 1150, when: "c. 900–1150", title: "Chaco Canyon, center of the Ancestral Puebloans",
    text: "Chaco Canyon was a major Ancestral Puebloan center in 900–1150; its Great Houses, multistory stone buildings with hundreds of rooms, include Pueblo Bonito.", imp: 2,
    cites: [W("Chaco_Culture_National_Historical_Park", "Chaco Culture National Historical Park"), { t: "History & Culture — Chaco Culture National Historical Park, National Park Service", u: "https://www.nps.gov/chcu/learn/historyculture/index.htm" }, B("place/Chaco-Culture-National-Historical-Park", "Chaco Culture National Historical Park")] },
  { id: "w407-mesa-verde", branch: "first-americans", y: 1150, end: 1300, when: "c. 1150–1300", title: "Cliff dwellings of Mesa Verde",
    text: "In the Pueblo III period the Ancestral Puebloans of Mesa Verde lived in dwellings built under the cliffs; Cliff Palace is the largest in the park.", imp: 2,
    cites: [W("Mesa_Verde_National_Park", "Mesa Verde National Park"), B("place/Mesa-Verde-National-Park", "Mesa Verde National Park"), { t: "History & Culture — Mesa Verde National Park, National Park Service", u: "https://www.nps.gov/meve/learn/historyculture/index.htm" }] },
  { id: "w407-mesa-verde-leaves", branch: "first-americans", y: 1285, when: "by 1285", title: "Mesa Verde's people migrate south",
    text: "After severe, prolonged droughts and social instability, the Mesa Verde Puebloans moved south into Arizona and New Mexico; most had gone by 1300.", imp: 3,
    cites: [W("Mesa_Verde_National_Park", "Mesa Verde National Park"), B("place/Mesa-Verde-National-Park", "Mesa Verde National Park")] },
  { id: "w407-paquime", branch: "first-americans", y: 1200, end: 1450, when: "c. 1200–1450", title: "Paquimé flourishes in northern Mexico",
    text: "In the Medio period the adobe town of Paquimé (Casas Grandes) in Chihuahua, with its multistory room blocks, was a regional center; it is now a UNESCO World Heritage Site.", imp: 3,
    cites: [W("Casas_Grandes", "Casas Grandes"), B("place/Casas-Grandes", "Casas Grandes"), { t: "Archaeology and Prehistory of Northwest Mexico: Paquimé and Northwest Chihuahua, University of New Mexico", u: "https://www.unm.edu/~dap/nwm/nw-chih.html" }] },

  // ---------- Maya ----------
  { id: "w407-dresden-codex", branch: "maya", y: 1100, end: 1200, when: "11th or 12th century", title: "The Dresden Codex is made",
    text: "One of the oldest surviving books of the Americas, this Maya codex holds astronomical calculations of high accuracy, including eclipse-prediction tables and the cycle of Venus.", imp: 2,
    cites: [W("Dresden_Codex", "Dresden Codex"), B("topic/Dresden-Codex", "Dresden Codex")] },
  { id: "w407-mayapan", branch: "maya", y: 1220, end: 1450, when: "c. 1220–1450", title: "Mayapán rules Yucatán",
    text: "After Chichén Itzá declined, Mayapán, ruled by the Cocom family, was the political and religious capital of Yucatán until the mid-15th century.", imp: 2,
    cites: [W("Mayapan", "Mayapan"), B("place/Mayapan", "Mayapán")] },
  { id: "w407-tulum", branch: "maya", y: 1250, end: 1550, when: "c. 1250–1550", title: "Tulum thrives on the Caribbean coast",
    text: "The walled Postclassic Maya city of Tulum in Quintana Roo, occupied from about 1200, has most of its standing buildings from c. 1250–1550 and faces the Caribbean.", imp: 3,
    cites: [W("Tulum", "Tulum"), { t: "Tulum — INAH Lugares", u: "https://lugares.inah.gob.mx/en/node/4361" }] },
  { id: "w407-iximche", branch: "maya", y: 1470, end: 1524, when: "1470–1524", title: "Iximché, Kaqchikel Maya capital",
    text: "The Kaqchikel founded Iximché in the Guatemalan highlands about 1470 and ruled from it until 1524, when the city was abandoned amid the Spanish conquest.", imp: 3,
    cites: [W("Iximche", "Iximche"), { t: "The Ancient Cakchiquel Capital of Iximche — Expedition Magazine, Penn Museum", u: "https://www.penn.museum/sites/expedition/the-ancient-cakchiquel-capital-of-iximche/" }] },

  // ---------- Māori ----------
  { id: "w407-wairau-bar", branch: "maori", y: 1288, when: "c. 1288–1300", title: "Polynesian settlers at Wairau Bar",
    text: "East Polynesian voyagers settled at Wairau Bar in the South Island; radiocarbon dates of moa eggs place the site at 1288–1300, among the earliest in New Zealand.", imp: 2,
    cites: [W("Wairau_Bar", "Wairau Bar"), { t: "The First New Zealanders: Patterns of Diet and Mobility Revealed through Isotope Analysis — PLOS ONE", u: "https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0064580" }] },
  { id: "w407-moa-extinct", branch: "maori", y: 1425, when: "by c. 1425", title: "The moa are hunted to extinction",
    text: "New Zealand's giant flightless moa, hunted only by Haast's eagle before people arrived, died out within about a century of Polynesian settlement, mainly through overhunting.", imp: 2,
    cites: [W("Moa", "Moa"), B("topic/moa", "moa"), { t: "New Zealand's moa were exterminated by an extremely low-density human population — ScienceDaily (University of Otago)", u: "https://www.sciencedaily.com/releases/2014/11/141107091656.htm" }] },

  // ---------- Lapita & Polynesian peoples ----------
  { id: "w407-rapa-nui-settled", branch: "polynesians", y: 1200, when: "c. 1200", title: "Polynesians settle Rapa Nui",
    text: "Evidence from a 2007 study suggests Polynesians reached Easter Island about 1200, later than the 800 once favored; oral tradition tells of chief Hotu Matu'a.", imp: 2,
    cites: [W("Rapa_Nui", "Rapa Nui"), B("place/Easter-Island", "Easter Island")] },
  { id: "w407-moai", branch: "polynesians", y: 1250, end: 1500, when: "c. 1250–1500", title: "The Rapa Nui carve their moai",
    text: "Between 1250 and 1500 the Rapa Nui carved monolithic stone figures, nearly half still at the Rano Raraku quarry and hundreds set on stone platforms called ahu.", imp: 2,
    cites: [W("Moai", "Moai"), B("place/Easter-Island", "Easter Island")] },
  { id: "w407-tongan-maritime", branch: "polynesians", y: 1200, end: 1500, when: "c. 1200–1500", title: "Tongan maritime chiefdom at its height",
    text: "The Tuʻi Tonga, rulers of Tonga from at least the 10th century, extended their influence abroad; the so-called Tongan Empire is said to have peaked in 1200–1500, with wide trade across Oceania.", imp: 2,
    cites: [W("Tuʻi_Tonga_Empire", "Tuʻi Tonga Empire"), B("place/Tonga/History", "Tonga")] },
  { id: "w407-haamonga", branch: "polynesians", y: 1250, when: "13th century", title: "Haʻamonga ʻa Maui trilithon raised in Tonga",
    text: "King Tuʻitātui had the great stone trilithon built at Niutōua on Tongatapu in honor of his two sons; it is sometimes called the Stonehenge of the Pacific.", imp: 3,
    cites: [W("Haʻamonga_ʻa_Maui", "Haʻamonga ʻa Maui")] },
] });

TL.geo("w407-hongwu-enthroned", { scope: "place", lat: 32.06, lon: 118.78, r: 40, label: "Nanjing, China", src: "https://en.wikipedia.org/wiki/Nanjing" });
TL.geo("w407-hu-weiyong", { scope: "place", lat: 32.06, lon: 118.78, r: 40, label: "Nanjing, China", src: "https://en.wikipedia.org/wiki/Nanjing" });
TL.geo("w407-yongle-dadian", { scope: "place", lat: 32.06, lon: 118.78, r: 40, label: "Nanjing, China", src: "https://en.wikipedia.org/wiki/Nanjing" });
TL.geo("w407-tumu", { scope: "place", lat: 40.38, lon: 115.6, r: 50, label: "Tumu, Huailai County, China", src: "https://en.wikipedia.org/wiki/Tumu_Crisis" });
TL.geo("w407-marco-polo", { scope: "region", lat: 40, lon: 85, r: 3500, label: "Silk Road to Yuan China", src: "https://en.wikipedia.org/wiki/Silk_Road" });
TL.geo("w407-wang-anshi", { scope: "place", lat: 34.8, lon: 114.34, r: 60, label: "Kaifeng, China", src: "https://en.wikipedia.org/wiki/Kaifeng" });
TL.geo("w407-dream-pool", { scope: "place", lat: 32.19, lon: 119.42, r: 40, label: "Zhenjiang, China", src: "https://en.wikipedia.org/wiki/Zhenjiang" });
TL.geo("w407-su-song-clock", { scope: "place", lat: 34.8, lon: 114.34, r: 60, label: "Kaifeng, China", src: "https://en.wikipedia.org/wiki/Kaifeng" });
TL.geo("w407-qingming-scroll", { scope: "place", lat: 34.8, lon: 114.34, r: 60, label: "Kaifeng, China", src: "https://en.wikipedia.org/wiki/Kaifeng" });
TL.geo("w407-caishi", { scope: "place", lat: 31.7, lon: 118.44, r: 50, label: "Caishi, Ma'anshan, China", src: "https://en.wikipedia.org/wiki/Battle_of_Caishi" });
TL.geo("w407-xiangyang", { scope: "place", lat: 32.01, lon: 112.12, r: 60, label: "Xiangyang, China", src: "https://en.wikipedia.org/wiki/Xiangyang" });
TL.geo("w407-linan-falls", { scope: "place", lat: 30.27, lon: 120.15, r: 50, label: "Hangzhou (Lin'an), China", src: "https://en.wikipedia.org/wiki/Hangzhou" });
TL.geo("w407-zaju", { scope: "place", lat: 39.91, lon: 116.4, r: 80, label: "Dadu (Beijing), China", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("w407-fuchun", { scope: "place", lat: 30.05, lon: 119.95, r: 60, label: "Fuchun River, Zhejiang", src: "https://en.wikipedia.org/wiki/Fuchun_River" });
TL.geo("w407-red-turbans", { scope: "region", lat: 33, lon: 115, r: 900, label: "Central and southern China", src: "https://en.wikipedia.org/wiki/Red_Turban_Rebellion" });
TL.geo("w407-templo-mayor-1487", { scope: "place", lat: 19.435, lon: -99.131, r: 30, label: "Templo Mayor, Mexico City", src: "https://en.wikipedia.org/wiki/Templo_Mayor" });
TL.geo("w407-thule", { scope: "region", lat: 70, lon: -100, r: 2500, label: "Arctic Alaska, Canada and Greenland", src: "https://en.wikipedia.org/wiki/Thule_people" });
TL.geo("w407-chaco", { scope: "place", lat: 36.06, lon: -107.96, r: 50, label: "Chaco Canyon, New Mexico", src: "https://en.wikipedia.org/wiki/Chaco_Culture_National_Historical_Park" });
TL.geo("w407-mesa-verde", { scope: "place", lat: 37.18, lon: -108.49, r: 40, label: "Mesa Verde, Colorado", src: "https://en.wikipedia.org/wiki/Mesa_Verde_National_Park" });
TL.geo("w407-mesa-verde-leaves", { scope: "region", lat: 37.18, lon: -108.49, r: 500, label: "Southwestern United States", src: "https://en.wikipedia.org/wiki/Mesa_Verde_National_Park" });
TL.geo("w407-paquime", { scope: "place", lat: 30.37, lon: -107.95, r: 40, label: "Paquimé, Chihuahua, Mexico", src: "https://en.wikipedia.org/wiki/Casas_Grandes" });
TL.geo("w407-dresden-codex", { scope: "region", lat: 19.55, lon: -89.3, r: 500, label: "Yucatán Peninsula", src: "https://en.wikipedia.org/wiki/Yucat%C3%A1n_Peninsula" });
TL.geo("w407-mayapan", { scope: "place", lat: 20.63, lon: -89.46, r: 40, label: "Mayapán, Yucatán", src: "https://en.wikipedia.org/wiki/Mayapan" });
TL.geo("w407-tulum", { scope: "place", lat: 20.21, lon: -87.43, r: 30, label: "Tulum, Quintana Roo", src: "https://en.wikipedia.org/wiki/Tulum" });
TL.geo("w407-iximche", { scope: "place", lat: 14.74, lon: -91, r: 30, label: "Iximché, Guatemala", src: "https://en.wikipedia.org/wiki/Iximche" });
TL.geo("w407-wairau-bar", { scope: "place", lat: -41.5, lon: 174.05, r: 40, label: "Wairau Bar, Marlborough", src: "https://en.wikipedia.org/wiki/Wairau_Bar" });
TL.geo("w407-moa-extinct", { scope: "region", lat: -42, lon: 173, r: 800, label: "New Zealand", src: "https://en.wikipedia.org/wiki/New_Zealand" });
TL.geo("w407-rapa-nui-settled", { scope: "place", lat: -27.12, lon: -109.35, r: 40, label: "Rapa Nui (Easter Island)", src: "https://en.wikipedia.org/wiki/Easter_Island" });
TL.geo("w407-moai", { scope: "place", lat: -27.12, lon: -109.35, r: 40, label: "Rapa Nui (Easter Island)", src: "https://en.wikipedia.org/wiki/Easter_Island" });
TL.geo("w407-tongan-maritime", { scope: "region", lat: -20, lon: -175, r: 1500, label: "Tonga and western Polynesia", src: "https://en.wikipedia.org/wiki/Tonga" });
TL.geo("w407-haamonga", { scope: "place", lat: -21.14, lon: -175.05, r: 30, label: "Niutōua, Tongatapu", src: "https://en.wikipedia.org/wiki/Ha%CA%BBamonga_%CA%BBa_Maui" });
