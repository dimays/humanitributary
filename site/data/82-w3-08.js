// W3-08 fill: Joseon, Majapahit, Ming, Qing, colonial Brazil, Indigenous peoples of the Americas, Inca, Maya, 1500–1800. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };
TL.add({ events: [
  // ---------- Majapahit ----------
  { id: "w308-majapahit-falls", branch: "majapahit", y: 1527, when: "c. 1527", title: "Majapahit ends as Muslim Demak rises in Java",
    text: "Weakened by civil war, the last Hindu-Buddhist empire in Java declined and collapsed around 1527. Wikipedia credits an invasion by the Sultanate of Demak; Britannica says Demak emerged as Majapahit faded.", imp: 2,
    cites: [B("place/Majapahit-empire", "Majapahit empire"), B("place/Demak", "Demak"), W("Majapahit", "Majapahit")] },
  // ---------- Ming ----------
  { id: "w308-jingdezhen-ming", branch: "ming", y: 1500, end: 1644, when: "Ming dynasty (1368–1644)", title: "Jingdezhen porcelain for the Ming court",
    text: "Under the Ming, Jingdezhen began making high-quality ware on a vast scale for the imperial household, its official kilns controlled by the emperor. Its blue-and-white porcelain became prized far beyond China.", imp: 2,
    cites: [B("place/Jingdezhen", "Jingdezhen"), B("topic/blue-and-white-ware", "Blue-and-white ware"), W("Jingdezhen", "Jingdezhen")] },
  { id: "w308-altan-beijing", branch: "ming", y: 1550, when: "1550", title: "Altan Khan raids Beijing",
    text: "The Tümed Mongol leader Altan Khan crossed the Great Wall and raided the outskirts of Beijing, setting its suburbs on fire, as part of the Mongol pressure that dogged the Ming northern border.", imp: 3,
    cites: [B("biography/Altan", "Altan"), W("Altan_Khan", "Altan Khan")] },
  { id: "w308-macau", branch: "ming", y: 1557, when: "1557", title: "Portuguese settle at Macau",
    text: "Portuguese merchants founded a colony at Macau, on China's south coast. It stayed under Portuguese rule until 1999 and served as a key port for trade between China and Japan.", imp: 2, link: "portugal",
    cites: [B("place/Portugal/Control-of-the-sea-trade", "Portugal: control of the sea trade"), B("place/Macau-administrative-region-China", "Macau"), W("Portuguese_Macau", "Portuguese Macau")] },
  { id: "w308-zhang-juzheng", branch: "ming", y: 1572, end: 1582, when: "1572–1582", title: "Zhang Juzheng governs for the young Wanli Emperor",
    text: "Zhang Juzheng was senior grand secretary from the Wanli Emperor's accession in 1572 until his death in 1582, a decade of peak efficiency in Ming state administration.", imp: 2,
    cites: [B("biography/Zhang-Juzheng", "Zhang Juzheng"), W("Zhang_Juzheng", "Zhang Juzheng")] },
  { id: "w308-bencao-gangmu", branch: "ming", y: 1578, when: "1578 (printed 1596)", title: "Li Shizhen completes the Compendium of Materia Medica",
    text: "Li Shizhen finished the first draft of the Bencao gangmu, describing 1,892 drugs. It was printed in Nanjing in 1596, three years after his death.", imp: 2,
    cites: [B("biography/Li-Shizhen", "Li Shizhen"), W("Compendium_of_Materia_Medica", "Compendium of Materia Medica")] },
  { id: "w308-journey-west", branch: "ming", y: 1592, when: "1592", title: "Journey to the West printed in Nanjing",
    text: "The earliest surviving edition of the comic novel traditionally credited to Wu Cheng'en appeared in 1592. It turned older folk tales of the monk Xuanzang's pilgrimage into one of China's great novels.", imp: 2,
    cites: [W("Journey_to_the_West", "Journey to the West"), B("topic/Journey-to-the-West", "Journey to the West")] },
  { id: "w308-jin-ping-mei", branch: "ming", y: 1610, when: "circulated from 1596; first printed 1610", title: "Jin Ping Mei, a masterwork of the Ming novel",
    text: "The 100-chapter novel by the pseudonymous “Scoffing Scholar of Lanling” circulated in manuscript from 1596 and was first printed in 1610. It is ranked among the four masterworks of the Ming novel.", imp: 3,
    cites: [W("Jin_Ping_Mei", "Jin Ping Mei")] },
  { id: "w308-tiangong-kaiwu", branch: "ming", y: D(1637, 5, 15), when: "May 1637", title: "Song Yingxing publishes Tiangong Kaiwu",
    text: "Song Yingxing's encyclopedia of Chinese technology, covering subjects such as gunpowder, was published with funding from his patron Tu Shaokui.", imp: 3,
    cites: [W("Tiangong_Kaiwu", "Tiangong Kaiwu"), B("topic/Tiangong-kaiwu", "Tiangong kaiwu")] },
  // ---------- Qing ----------
  { id: "w308-three-feudatories", branch: "qing", y: 1673, end: 1681, when: "1673–1681", title: "Revolt of the Three Feudatories",
    text: "Wu Sangui, a former Ming general who had helped the Manchu establish the Qing, led a rebellion with the other feudatories in southern China. The Kangxi Emperor suppressed it by 1681.", imp: 2,
    cites: [B("event/Revolt-of-the-Three-Feudatories", "Revolt of the Three Feudatories"), W("Revolt_of_the_Three_Feudatories", "Revolt of the Three Feudatories")] },
  { id: "w308-kangxi-dictionary", branch: "qing", y: 1716, when: "1716", title: "Kangxi Dictionary printed",
    text: "Ordered by the Kangxi Emperor in 1710 to foster standardization of the writing system, the dictionary lists over 40,000 characters and remained the authoritative reference into the early 20th century.", imp: 2,
    cites: [W("Kangxi_Dictionary", "Kangxi Dictionary"), B("topic/Kangxi-zidian", "Kangxi zidian")] },
  { id: "w308-gujin-tushu", branch: "qing", y: 1725, when: "begun 1700; completed 1725", title: "Gujin Tushu Jicheng encyclopedia completed",
    text: "Chen Menglei headed the huge Complete Classics Collection of Ancient and Modern Times, begun in 1700 under the Kangxi Emperor and completed in 1725. Britannica dates its publication to 1726.", imp: 3,
    cites: [W("Gujin_Tushu_Jicheng", "Gujin Tushu Jicheng"), B("topic/Gujin-tushu-jicheng", "Gujin tushu jicheng")] },
  { id: "w308-canton-system", branch: "qing", y: 1757, end: 1842, when: "1757–1842", title: "Canton System confines foreign trade to Guangzhou",
    text: "From 1757 by Wikipedia's dating (Britannica says about 1759–60) until 1842, Qing policy under the Qianlong Emperor confined foreign trade to Canton (Guangzhou) and subjected merchants to Chinese regulation.", imp: 2,
    cites: [W("Canton_System", "Canton System"), B("topic/Canton-system", "Canton system")] },
  { id: "w308-siku-quanshu", branch: "qing", y: 1772, end: 1782, when: "1772–1782", title: "Siku Quanshu compiled for the Qianlong Emperor",
    text: "Editors and copyists assembled the Complete Library of the Four Treasuries, the largest collection of books in imperial Chinese history, with 36,381 volumes by Wikipedia's count.", imp: 2,
    cites: [W("Siku_Quanshu", "Siku Quanshu"), B("topic/Sikuquanshu", "Sikuquanshu")] },
  { id: "w308-peking-opera", branch: "qing", y: D(1790, 9, 25), when: "September 25, 1790", title: "Anhui troupes bring the roots of Peking opera to the capital",
    text: "Four great Anhui troupes came to Beijing for the Qianlong Emperor's eightieth birthday; their Hui opera, mixed with other regional styles, gave rise to Peking opera, which matured over the following decades.", imp: 2,
    cites: [W("Peking_opera", "Peking opera"), B("art/Chinese-music/Jingxi-Peking-opera", "Jingxi (Peking opera)")] },
  { id: "w308-red-chamber", branch: "qing", y: 1791, when: "1791", title: "Dream of the Red Chamber published in full",
    text: "Cheng Weiyuan and Gao E printed the 120-chapter version of Cao Xueqin's novel, almost 30 years after his death. Cao had begun composing it in the 1740s; the final 40 chapters' authorship is uncertain.", imp: 2,
    cites: [B("topic/Dream-of-the-Red-Chamber", "Dream of the Red Chamber"), W("Dream_of_the_Red_Chamber", "Dream of the Red Chamber")] },
  // ---------- Colonial Brazil ----------
  { id: "w308-cabral", branch: "colonial-brazil", y: D(1500, 4, 22), when: "April 22, 1500", title: "Cabral sights Brazil",
    text: "Pedro Álvares Cabral, bound for India, became the first European credited with reaching Brazil. He named it the Island of the True Cross and took formal possession for Portugal.", imp: 2, link: "portugal",
    cites: [B("biography/Pedro-Alvares-Cabral", "Pedro Álvares Cabral"), W("Pedro_%C3%81lvares_Cabral", "Pedro Álvares Cabral")] },
  { id: "w308-captaincies", branch: "colonial-brazil", y: D(1534, 9, 24), when: "September 24, 1534", title: "John III begins dividing Brazil into captaincies",
    text: "The Portuguese king began granting Brazil in captaincies, the first being Pernambuco by royal charter. Duarte Coelho founded Olinda there in 1535.", imp: 3,
    cites: [W("Captaincies_of_Brazil", "Captaincies of Brazil"), B("place/Pernambuco", "Pernambuco"), B("biography/John-III-king-of-Portugal", "John III")] },
  { id: "w308-salvador", branch: "colonial-brazil", y: 1549, when: "1549", title: "Salvador founded as capital of Brazil",
    text: "Tomé de Sousa, Brazil's first governor-general, led about 1,000 men to the Bay of All Saints and built the fortified city of Salvador as the colony's capital.", imp: 2,
    cites: [B("place/Salvador-Brazil", "Salvador"), B("biography/Tome-de-Sousa", "Tomé de Sousa")] },
  { id: "w308-sao-paulo", branch: "colonial-brazil", y: D(1554, 1, 25), when: "January 25, 1554", title: "Jesuits found São Paulo",
    text: "Jesuit missionaries founded a small settlement on the anniversary of St. Paul's conversion. It grew slowly, with only about 300 residents by 1600.", imp: 3,
    cites: [B("place/Sao-Paulo-Brazil", "São Paulo"), W("São_Paulo", "São Paulo")] },
  { id: "w308-rio-founded", branch: "colonial-brazil", y: D(1565, 3, 1), when: "March 1, 1565", title: "Rio de Janeiro founded",
    text: "The Portuguese founded the city of São Sebastião do Rio de Janeiro on Guanabara Bay. In 1763 it replaced Salvador as the colonial capital.", imp: 2,
    cites: [W("History_of_Rio_de_Janeiro", "History of Rio de Janeiro"), B("place/Rio-de-Janeiro-Brazil", "Rio de Janeiro"), B("place/Brazil/Colonial-reforms", "Brazil: colonial reforms")] },
  { id: "w308-dutch-brazil", branch: "colonial-brazil", y: 1630, end: 1654, when: "1630–1654", title: "Dutch rule in Pernambuco",
    text: "The Dutch West India Company captured Recife in 1630 and conquered almost half of Brazil's settled area, holding Recife for 24 years until a Dutch surrender in January 1654.", imp: 2, link: "dutch-republic",
    cites: [B("place/Recife", "Recife"), W("Dutch_Brazil", "Dutch Brazil")] },
  { id: "w308-nassau-artists", branch: "colonial-brazil", y: D(1637, 1, 23), when: "January 23, 1637", title: "John Maurice of Nassau arrives to govern Dutch Brazil",
    text: "The count, governor from 1637 (Britannica dates his administration 1636–44), invited artists and scientists to the colony to promote it and attract settlers, and Recife prospered.", imp: 3, link: "dutch-republic",
    cites: [W("Dutch_Brazil", "Dutch Brazil"), B("place/Recife", "Recife"), B("topic/Dutch-West-India-Company", "Dutch West India Company")] },
  { id: "w308-guararapes", branch: "colonial-brazil", y: D(1649, 2, 19), when: "February 19, 1649", title: "Portuguese win the Second Battle of Guararapes",
    text: "A significant Portuguese victory turned the tide against the Dutch, whose company capitulated to the Portuguese in 1654.", imp: 3,
    cites: [W("Dutch_Brazil", "Dutch Brazil"), B("topic/Dutch-West-India-Company", "Dutch West India Company")] },
  { id: "w308-palmares-falls", branch: "colonial-brazil", y: 1694, when: "1694", title: "Palmares destroyed",
    text: "Palmares, an autonomous republic of fugitive enslaved people in Alagoas with about 20,000 inhabitants by the 1690s, was destroyed in 1694 by one of several slave-hunting expeditions.", imp: 2,
    cites: [B("place/Palmares", "Palmares"), B("topic/quilombo", "Quilombo")] },
  { id: "w308-minas-gold", branch: "colonial-brazil", y: 1698, when: "1698", title: "Gold discovered in Minas Gerais",
    text: "Bandeirantes found large gold deposits in the mountains of Minas Gerais, starting a gold rush; Vila Rica (later Ouro Preto) was founded in 1698.", imp: 2,
    cites: [B("place/Minas-Gerais", "Minas Gerais"), W("Brazilian_gold_rush", "Brazilian gold rush")] },
  { id: "w308-diamonds", branch: "colonial-brazil", y: 1729, when: "1729", title: "Diamonds discovered in Minas Gerais",
    text: "Diamonds were found in the same mining region that had yielded gold since 1698, adding a second source of colonial wealth.", imp: 3,
    cites: [B("place/Minas-Gerais", "Minas Gerais")] },
  { id: "w308-treaty-madrid", branch: "colonial-brazil", y: 1750, when: "1750", title: "Treaty of Madrid redraws Brazil's borders",
    text: "Spain and Portugal set a new line of demarcation between their South American colonies. Its terms for the Jesuit missions on the Uruguay River sparked the Guaraní War of the 1750s.", imp: 2, link: "spain",
    cites: [W("Guaraní_War", "Guaraní War")] },
  { id: "w308-aleijadinho-congonhas", branch: "colonial-brazil", y: 1796, when: "commissioned 1796", title: "Aleijadinho begins the Prophets at Congonhas",
    text: "In 1796 the sculptor-architect Aleijadinho, son of an enslaved African mother, received the commission for the Via Sacra and Prophets at the Bom Jesus sanctuary, Congonhas, considered his masterpiece.", imp: 2,
    cites: [B("biography/Aleijadinho", "Aleijadinho"), W("Aleijadinho", "Aleijadinho")] },
  { id: "w308-jesuits-expelled", branch: "colonial-brazil", y: 1759, when: "1759", title: "Jesuits expelled from Brazil",
    text: "Pombal expelled the Jesuits from Portugal and Brazil in 1759, the first of several European expulsions of the order.", imp: 3, link: "portugal",
    cites: [B("place/Brazil/Agriculture-and-prospecting", "Brazil: agriculture and prospecting"), W("Expulsion_of_the_Jesuits", "Suppression of the Society of Jesus")] },
  { id: "w308-inconfidencia", branch: "colonial-brazil", y: 1789, when: "1789", title: "Inconfidência Mineira plot exposed",
    text: "Inspired by the Enlightenment and the American Revolution, a plot to revolt in Minas Gerais over Portuguese tax demands was denounced before it began. Tiradentes was captured in Rio in April 1789.", imp: 2,
    cites: [B("biography/Joaquim-Jose-da-Silva-Xavier", "Joaquim José da Silva Xavier"), W("Inconfidência_Mineira", "Inconfidência Mineira")] },
  // ---------- Indigenous peoples of the Americas ----------
  { id: "w308-de-soto", branch: "first-americans", y: 1539, end: 1542, when: "1539–1542", title: "Hernando de Soto's expedition crosses the Southeast",
    text: "De Soto led a Spanish expedition from Florida through the Southeast to the Mississippi, and died on the river in 1542.", imp: 3, link: "spain",
    cites: [B("biography/Hernando-de-Soto", "Hernando de Soto"), W("Hernando_de_Soto", "Hernando de Soto")] },
  { id: "w308-mixton", branch: "first-americans", y: 1540, end: 1542, when: "1540–1542", title: "Mixtón War in western Mexico",
    text: "The Caxcanes and their allies rose against Spanish rule in western Mexico. Pedro de Alvarado died in the fighting, and Viceroy Mendoza led the army that crushed the revolt.", imp: 3, link: "new-spain",
    cites: [W("Mixtón_War", "Mixtón War"), B("place/Mexico/Expansion-of-Spanish-rule", "Mexico: expansion of Spanish rule")] },
  { id: "w308-haudenosaunee", branch: "first-americans", y: 1600, end: 1800, when: "17th–18th centuries", title: "Haudenosaunee Confederacy and the Great Law of Peace",
    text: "The League of five, later six, nations in upper New York played a strategic role between France and Britain. Its oral Great Law of Peace, kept on wampum belts, dates from between 1142 and 1660 by differing accounts.", imp: 2,
    cites: [B("topic/Iroquois-Confederacy", "Haudenosaunee Confederacy"), W("Iroquois", "Iroquois"), W("Great_Law_of_Peace", "Great Law of Peace")] },
  { id: "w308-guaman-poma", branch: "first-americans", y: 1615, when: "written c. 1600–1615", title: "Guamán Poma writes the Nueva corónica y buen gobierno",
    text: "The Inca nobleman Felipe Guamán Poma de Ayala wrote and illustrated a long letter to Philip III denouncing Spanish rule in Peru. The manuscript went unseen until 1908.", imp: 2,
    cites: [B("biography/Felipe-Guaman-Poma-de-Ayala", "Felipe Guamán Poma de Ayala"), W("Felipe_Guamán_Poma_de_Ayala", "Felipe Guamán Poma de Ayala")] },
  { id: "w308-garcilaso", branch: "first-americans", y: 1609, when: "1609", title: "Inca Garcilaso publishes Comentarios Reales de los Incas",
    text: "Garcilaso de la Vega, son of a Spanish conquistador and an Inca noblewoman, wrote his best-known work in Spain. It was published in Lisbon in 1609 and shaped how Europe pictured the Incas.", imp: 2,
    cites: [B("topic/Royal-Commentaries-of-the-Incas", "Royal Commentaries of the Incas"), W("Inca_Garcilaso_de_la_Vega", "Inca Garcilaso de la Vega")] },
  { id: "w308-pequot-war", branch: "first-americans", y: 1637, when: "1636–1637", title: "Pequot War and the Mystic massacre",
    text: "English colonists from Connecticut and Massachusetts and Narragansett and Mohegan allies burned the Pequot fort at Mystic in May 1637 and shot those who tried to escape, breaking Pequot power in southern New England.", imp: 3,
    cites: [B("event/Pequot-War", "Pequot War"), W("Pequot_War", "Pequot War")] },
  { id: "w308-pueblo-revolt", branch: "first-americans", y: 1680.6, when: "August 1680", title: "Pueblo Revolt drives the Spanish from New Mexico",
    text: "Led by Popé, the Pueblo peoples rose together against Spanish rule on August 10. Governor Otermín was besieged in Santa Fe, then retreated south toward El Paso; Spanish rule ended for about 12 years.", imp: 2, link: "new-spain",
    cites: [B("event/Pueblo-Rebellion", "Pueblo Rebellion"), B("biography/Pope-Tewa-Pueblo-leader", "Popé"), W("Pueblo_Revolt", "Pueblo Revolt")] },
  { id: "w308-great-peace-montreal", branch: "first-americans", y: D(1701, 8, 4), when: "August 4, 1701", title: "Great Peace of Montreal",
    text: "Over 1,300 delegates from some 40 Indigenous nations joined the governor of New France in making peace between the French allies and the Haudenosaunee, who agreed to neutrality in French-English wars.", imp: 2,
    cites: [{ t: "The Great Peace of Montréal Treaty — Canadian Museum of History", u: "https://www.historymuseum.ca/digital-on-demand/history-hall-article-the-great-peace-of-montreal-treaty" }, W("Great_Peace_of_Montreal", "Great Peace of Montreal")] },
  { id: "w308-pontiacs-war", branch: "first-americans", y: 1763.35, end: 1764, when: "1763–1764", title: "Pontiac's War",
    text: "The Ottawa chief Pontiac organized a coalition that overwhelmed several British outposts in the Great Lakes region. The uprising helped prompt the Proclamation of 1763 reserving western lands for Indigenous peoples.", imp: 2, link: "uk",
    cites: [B("event/Pontiacs-War", "Pontiac's War"), W("Pontiac%27s_War", "Pontiac's War")] },
  { id: "w308-sullivan-expedition", branch: "first-americans", y: 1779.5, when: "June–October 1779", title: "Sullivan Expedition against the Haudenosaunee",
    text: "A Continental Army force under Sullivan and Clinton marched into Seneca and Cayuga country in 1779, answering the 1778 frontier raids. It destroyed more than 40 villages and at least 160,000 bushels of corn.", imp: 3, link: "usa",
    cites: [{ t: "The Clinton-Sullivan Campaign of 1779 — National Park Service", u: "https://www.nps.gov/articles/000/the-clinton-sullivan-campaign-of-1779.htm" }, W("Sullivan_Expedition", "Sullivan Expedition")] },
  { id: "w308-tupac-amaru-ii", branch: "first-americans", y: 1780.84, end: 1781.38, when: "November 1780 – May 1781", title: "Túpac Amaru II leads the Peruvian uprising",
    text: "A descendant of the last Inca ruler, he executed a cruel corregidor in 1780 and led Peruvian peasants against Spanish rule. Captured in 1781, he was executed in Cuzco on May 18.", imp: 2, link: "spain",
    cites: [B("biography/Tupac-Amaru-II", "Túpac Amaru II"), W("Túpac_Amaru_II", "Túpac Amaru II")] },
  // ---------- Inca ----------
  { id: "w308-huayna-capac-dies", branch: "inca", y: 1526, when: "c. 1525–1527", title: "Huayna Capac dies; succession in dispute",
    text: "The eleventh Sapa Inca died between about 1525 and 1527 (sources differ), likely of an epidemic such as smallpox, and a succession crisis followed.", imp: 2,
    cites: [B("biography/Huayna-Capac", "Huayna Capac"), W("Huayna_Capac", "Huayna Capac")] },
  { id: "w308-inca-civil-war", branch: "inca", y: 1529, end: 1532, when: "1529–1532", title: "Civil war between Huáscar and Atahuallpa",
    text: "The sons of Huayna Capac fought for the throne, and Atahuallpa won, leaving the empire weakened just before Pizarro's arrival.", imp: 2,
    cites: [B("biography/Huascar-Inca-chieftain", "Huascar"), B("biography/Atahuallpa", "Atahuallpa"), W("Inca_Civil_War", "Inca Civil War")] },
  { id: "w308-tupac-amaru-executed", branch: "first-americans", y: 1572, when: "1572", title: "Túpac Amaru I executed; Neo-Inca State ends",
    text: "The last ruler of the Neo-Inca State at Vilcabamba, successor to Manco Inca, was pursued, captured and executed by the Spanish in 1572.", imp: 2, link: "spain",
    cites: [B("topic/Tupac-Amaru", "Túpac Amaru"), W("Tupac_Amaru", "Túpac Amaru")] },
  // ---------- Maya ----------
  { id: "w308-aguilar-guerrero", branch: "maya", y: 1511, when: "1511", title: "Shipwreck leaves Spaniards among the Maya",
    text: "The caravel Santa María de la Barca foundered on a reef off Jamaica; survivors drifted to Yucatán. Gerónimo de Aguilar and Gonzalo Guerrero lived among the Maya, Guerrero becoming a respected warrior.", imp: 3, link: "spain",
    cites: [W("Spanish_conquest_of_the_Maya", "Spanish conquest of the Maya"), W("Gonzalo_Guerrero", "Gonzalo Guerrero")] },
  { id: "w308-guatemala-conquest", branch: "maya", y: 1524, end: 1530, when: "1524–1530", title: "Alvarado conquers the Guatemalan highlands",
    text: "Pedro de Alvarado led Spanish and Tlaxcalan forces against the K'iche' and Kaqchikel. The Kaqchikel rebelled over tribute demands and did not finally surrender until 1530.", imp: 2, link: "spain",
    cites: [B("biography/Pedro-de-Alvarado", "Pedro de Alvarado"), W("Spanish_conquest_of_Guatemala", "Spanish conquest of Guatemala")] },
  { id: "w308-yucatan-conquest", branch: "maya", y: 1527, end: 1546, when: "1527–1546", title: "Spanish conquest of Yucatán",
    text: "Francisco de Montejo set sail in 1527; Mérida and Campeche were founded in 1541–42. Eastern provinces rose in an unsuccessful uprising in late 1546.", imp: 2, link: "spain",
    cites: [B("place/Yucatan", "Yucatán"), W("Spanish_conquest_of_Yucatán", "Spanish conquest of Yucatán")] },
  { id: "w308-popol-vuh-written", branch: "maya", y: 1554, end: 1558, when: "c. 1554–1558", title: "K'iche' nobles set down the Popol Vuh",
    text: "Britannica dates the K'iche' Maya book of creation myth and dynastic history to 1554–58. Its oldest surviving copy is Friar Francisco Ximénez's early-1700s transcription and Spanish translation, found at Chichicastenango.", imp: 2,
    cites: [B("topic/Popol-Vuh", "Popol Vuh"), W("Popol_Vuh", "Popol Vuh")] },
  { id: "w308-landa-auto-da-fe", branch: "maya", y: D(1562, 7, 12), when: "July 12, 1562", title: "Landa burns Maya books at Maní",
    text: "The Franciscan Diego de Landa held an auto-da-fé that destroyed about 5,000 Maya cult images and many Maya codices. He later wrote the Relación de las cosas de Yucatán, a key record of Maya culture.", imp: 2,
    cites: [B("biography/Diego-de-Landa", "Diego de Landa"), W("Diego_de_Landa", "Diego de Landa")] },
  { id: "w308-nojpeten-falls", branch: "maya", y: D(1697, 3, 13), when: "March 13, 1697", title: "Nojpetén falls to the Spanish",
    text: "Martín de Ursúa's waterborne assault captured the island capital of the Itza kingdom, the last independent Maya state, over 150 years after the rest of Yucatán was conquered.", imp: 2, link: "spain",
    cites: [B("place/Peten", "Petén"), W("Spanish_conquest_of_Petén", "Spanish conquest of Petén")] },
] });

TL.geo("w308-majapahit-falls", { scope: "region", lat: -7.54, lon: 112.39, r: 300, label: "East Java", src: "https://en.wikipedia.org/wiki/Trowulan" });
TL.geo("w308-jingdezhen-ming", { scope: "place", lat: 29.29, lon: 117.2, r: 50, label: "Jingdezhen, China", src: "https://en.wikipedia.org/wiki/Jingdezhen" });
TL.geo("w308-altan-beijing", { scope: "place", lat: 39.9042, lon: 116.4074, r: 80, label: "Beijing", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("w308-macau", { scope: "place", lat: 22.19, lon: 113.54, r: 30, label: "Macau", src: "https://en.wikipedia.org/wiki/Macau" });
TL.geo("w308-zhang-juzheng", { scope: "place", lat: 39.9042, lon: 116.4074, r: 80, label: "Beijing", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("w308-bencao-gangmu", { scope: "place", lat: 32.06, lon: 118.78, r: 60, label: "Nanjing, China", src: "https://en.wikipedia.org/wiki/Nanjing" });
TL.geo("w308-journey-west", { scope: "place", lat: 32.06, lon: 118.78, r: 60, label: "Nanjing, China", src: "https://en.wikipedia.org/wiki/Nanjing" });
TL.geo("w308-jin-ping-mei", { scope: "region", lat: 36.4, lon: 118.4, r: 400, label: "Ming China", src: "https://en.wikipedia.org/wiki/Shandong" });
TL.geo("w308-tiangong-kaiwu", { scope: "region", lat: 27.3, lon: 116, r: 400, label: "Jiangxi, China", src: "https://en.wikipedia.org/wiki/Jiangxi" });
TL.geo("w308-three-feudatories", { scope: "region", lat: 25.05, lon: 102.71, r: 800, label: "Southwestern China", src: "https://en.wikipedia.org/wiki/Kunming" });
TL.geo("w308-kangxi-dictionary", { scope: "place", lat: 39.9042, lon: 116.4074, r: 80, label: "Beijing", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("w308-gujin-tushu", { scope: "place", lat: 39.9042, lon: 116.4074, r: 80, label: "Beijing", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("w308-canton-system", { scope: "place", lat: 23.1291, lon: 113.2644, r: 60, label: "Guangzhou", src: "https://en.wikipedia.org/wiki/Guangzhou" });
TL.geo("w308-siku-quanshu", { scope: "place", lat: 39.9042, lon: 116.4074, r: 80, label: "Beijing", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("w308-peking-opera", { scope: "place", lat: 39.9042, lon: 116.4074, r: 80, label: "Beijing", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("w308-red-chamber", { scope: "place", lat: 39.9042, lon: 116.4074, r: 80, label: "Beijing", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("w308-cabral", { scope: "place", lat: -16.43, lon: -39.08, r: 80, label: "Porto Seguro, Bahia", src: "https://en.wikipedia.org/wiki/Porto_Seguro" });
TL.geo("w308-captaincies", { scope: "region", lat: -8.0, lon: -36.0, r: 1500, label: "Colonial Brazil", src: "https://en.wikipedia.org/wiki/Captaincies_of_Brazil" });
TL.geo("w308-salvador", { scope: "place", lat: -12.97, lon: -38.48, r: 40, label: "Salvador, Bahia", src: "https://en.wikipedia.org/wiki/Salvador,_Bahia" });
TL.geo("w308-sao-paulo", { scope: "place", lat: -23.5505, lon: -46.6333, r: 40, label: "São Paulo", src: "https://en.wikipedia.org/wiki/S%C3%A3o_Paulo" });
TL.geo("w308-rio-founded", { scope: "place", lat: -22.91, lon: -43.21, r: 40, label: "Rio de Janeiro", src: "https://en.wikipedia.org/wiki/Rio_de_Janeiro" });
TL.geo("w308-dutch-brazil", { scope: "place", lat: -8.05, lon: -34.9, r: 120, label: "Recife, Pernambuco", src: "https://en.wikipedia.org/wiki/Recife" });
TL.geo("w308-nassau-artists", { scope: "place", lat: -8.05, lon: -34.9, r: 60, label: "Recife, Pernambuco", src: "https://en.wikipedia.org/wiki/Recife" });
TL.geo("w308-guararapes", { scope: "place", lat: -8.11, lon: -35.02, r: 40, label: "Jaboatão dos Guararapes, Pernambuco", src: "https://en.wikipedia.org/wiki/Jaboat%C3%A3o_dos_Guararapes" });
TL.geo("w308-palmares-falls", { scope: "place", lat: -9.1594, lon: -36.0222, r: 80, label: "União dos Palmares, Alagoas", src: "https://en.wikipedia.org/wiki/Uni%C3%A3o_dos_Palmares" });
TL.geo("w308-minas-gold", { scope: "region", lat: -19.78, lon: -43.95, r: 400, label: "Minas Gerais", src: "https://en.wikipedia.org/wiki/Minas_Gerais" });
TL.geo("w308-diamonds", { scope: "place", lat: -18.2447, lon: -43.6, r: 100, label: "Diamantina, Minas Gerais", src: "https://en.wikipedia.org/wiki/Diamantina" });
TL.geo("w308-treaty-madrid", { scope: "region", lat: -15.0, lon: -55.0, r: 2500, label: "Colonial South America", src: "https://en.wikipedia.org/wiki/Treaty_of_Madrid_(1750)" });
TL.geo("w308-aleijadinho-congonhas", { scope: "place", lat: -20.4992, lon: -43.8575, r: 30, label: "Congonhas, Minas Gerais", src: "https://en.wikipedia.org/wiki/Congonhas" });
TL.geo("w308-jesuits-expelled", { scope: "region", lat: -10, lon: -52, r: 2500, label: "Brazil", src: "https://en.wikipedia.org/wiki/Brazil" });
TL.geo("w308-inconfidencia", { scope: "place", lat: -20.3856, lon: -43.5036, r: 60, label: "Ouro Preto, Minas Gerais", src: "https://en.wikipedia.org/wiki/Ouro_Preto" });
TL.geo("w308-de-soto", { scope: "region", lat: 34, lon: -85, r: 1000, label: "Southeastern United States", src: "https://en.wikipedia.org/wiki/Southeastern_United_States" });
TL.geo("w308-mixton", { scope: "region", lat: 23.3, lon: -102.7, r: 300, label: "Zacatecas and Jalisco, Mexico", src: "https://en.wikipedia.org/wiki/Zacatecas" });
TL.geo("w308-haudenosaunee", { scope: "region", lat: 42.67, lon: -76.83, r: 300, label: "Upstate New York", src: "https://en.wikipedia.org/wiki/Finger_Lakes" });
TL.geo("w308-guaman-poma", { scope: "place", lat: -13.1631, lon: -74.2236, r: 80, label: "Ayacucho, Peru", src: "https://en.wikipedia.org/wiki/Ayacucho" });
TL.geo("w308-garcilaso", { scope: "place", lat: 38.73, lon: -9.15, r: 40, label: "Lisbon", src: "https://en.wikipedia.org/wiki/Lisbon" });
TL.geo("w308-pequot-war", { scope: "place", lat: 41.3548, lon: -71.9664, r: 50, label: "Mystic, Connecticut", src: "https://en.wikipedia.org/wiki/Mystic,_Connecticut" });
TL.geo("w308-pueblo-revolt", { scope: "place", lat: 35.687, lon: -105.9378, r: 150, label: "Santa Fe, New Mexico", src: "https://en.wikipedia.org/wiki/Santa_Fe,_New_Mexico" });
TL.geo("w308-great-peace-montreal", { scope: "place", lat: 45.51, lon: -73.55, r: 40, label: "Montreal", src: "https://en.wikipedia.org/wiki/Montreal" });
TL.geo("w308-pontiacs-war", { scope: "place", lat: 42.3314, lon: -83.0458, r: 400, label: "Detroit and the Great Lakes", src: "https://en.wikipedia.org/wiki/Detroit" });
TL.geo("w308-sullivan-expedition", { scope: "region", lat: 42.67, lon: -76.83, r: 250, label: "Finger Lakes, New York", src: "https://en.wikipedia.org/wiki/Finger_Lakes" });
TL.geo("w308-tupac-amaru-ii", { scope: "place", lat: -13.52, lon: -71.98, r: 100, label: "Cusco, Peru", src: "https://en.wikipedia.org/wiki/Cusco" });
TL.geo("w308-huayna-capac-dies", { scope: "region", lat: -13.5, lon: -72.0, r: 1500, label: "Inca Empire", src: "https://en.wikipedia.org/wiki/Inca_Empire" });
TL.geo("w308-inca-civil-war", { scope: "region", lat: -8.0, lon: -78.0, r: 1500, label: "Inca Empire", src: "https://en.wikipedia.org/wiki/Inca_Empire" });
TL.geo("w308-tupac-amaru-executed", { scope: "place", lat: -13.52, lon: -71.98, r: 100, label: "Cusco, Peru", src: "https://en.wikipedia.org/wiki/Cusco" });
TL.geo("w308-aguilar-guerrero", { scope: "region", lat: 19.55, lon: -89.3, r: 300, label: "Yucatán coast", src: "https://en.wikipedia.org/wiki/Yucat%C3%A1n_Peninsula" });
TL.geo("w308-guatemala-conquest", { scope: "region", lat: 14.8, lon: -91.5, r: 250, label: "Guatemalan highlands", src: "https://en.wikipedia.org/wiki/Guatemalan_Highlands" });
TL.geo("w308-yucatan-conquest", { scope: "region", lat: 19.55, lon: -89.3, r: 400, label: "Yucatán Peninsula", src: "https://en.wikipedia.org/wiki/Yucat%C3%A1n_Peninsula" });
TL.geo("w308-popol-vuh-written", { scope: "region", lat: 15.0, lon: -91.2, r: 150, label: "K'iche' highlands, Guatemala", src: "https://en.wikipedia.org/wiki/Guatemalan_Highlands" });
TL.geo("w308-landa-auto-da-fe", { scope: "place", lat: 20.3833, lon: -89.3917, r: 40, label: "Maní, Yucatán", src: "https://en.wikipedia.org/wiki/Man%C3%AD,_Yucat%C3%A1n" });
TL.geo("w308-nojpeten-falls", { scope: "place", lat: 16.9333, lon: -89.8833, r: 40, label: "Flores, Petén, Guatemala", src: "https://en.wikipedia.org/wiki/Flores,_Guatemala" });
