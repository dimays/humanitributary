// Fill-in W3-07: 1500–1800 — Delhi Sultanate, Maratha, Mughal, Vijayanagara, Ayutthaya, Japan and Joseon events (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const U = (id, title) => ({ t: `${title} — UNESCO World Heritage Centre`, u: `https://whc.unesco.org/en/list/${id}/`, k: "reference" });

TL.add({ events: [
  // ---------- Delhi Sultanate ----------
  { id: "w307-agra-founded", branch: "delhi-sultanate", y: 1504, when: "1504–1505", title: "Sikandar Lodi founds Agra as a capital",
    text: "Sultan Sikandar Lodi established Agra on the Yamuna as a capital of the Delhi sultanate. The city later became the first capital of the Mughals.", imp: 3,
    cites: [B("place/Agra", "Agra"), W("Agra", "Agra")] },

  // ---------- Maratha ----------
  { id: "w307-sambhaji-executed", branch: "maratha", y: 1689.19, when: "March 11, 1689", title: "Sambhaji captured and executed by Aurangzeb",
    text: "Shivaji's son Sambhaji, who had ruled since 1681, was captured by Mughal forces and put to death. His brother Rajaram carried on the resistance from the Tamil country.", imp: 2, link: "mughal",
    cites: [B("biography/Sambhaji", "Sambhaji"), W("Sambhaji", "Sambhaji")] },
  { id: "w307-shahu-released", branch: "maratha", y: 1707, when: "1707", title: "Shahu is released and Maratha power revives",
    text: "After Aurangzeb died in 1707, the Mughals released Shivaji's grandson Shahu from custody. His rule, with hereditary Brahman peshwas as ministers, revived Maratha power.", imp: 2, link: "mughal",
    cites: [B("topic/Maratha-confederacy", "Maratha confederacy"), W("Shahu_I", "Shahu I")] },
  { id: "w307-shaniwar-wada", branch: "maratha", y: 1732, when: "1732", title: "Shaniwar Wada palace begun at Pune",
    text: "Peshwa Baji Rao I began building the fortified palace of Shaniwar Wada at Pune in 1732. It served as the seat of the Peshwas of the Maratha Confederacy until 1818.", imp: 3,
    cites: [W("Shaniwar_Wada", "Shaniwar Wada"), { t: "Shaniwar Wada — Incredible India (Ministry of Tourism)", u: "https://www.incredibleindia.gov.in/en/maharashtra/pune/shaniwar-wada", k: "reference" }] },
  { id: "w307-treaty-salbai", branch: "maratha", y: 1782.37, when: "May 17, 1782", title: "Treaty of Salbai ends the First Anglo-Maratha War",
    text: "The Maratha Confederacy and the East India Company signed the treaty at Salbai, ending the First Anglo-Maratha War. The British abandoned Raghunatha's cause and kept only the island of Salsette.", imp: 2, link: "great-britain",
    cites: [B("topic/Treaty-of-Salbai", "Treaty of Salbai"), W("Treaty_of_Salbai", "Treaty of Salbai")] },

  // ---------- Mughal ----------
  { id: "w307-kannauj", branch: "mughal", y: 1540.37, when: "May 17, 1540", title: "Sher Shah defeats Humayun at Kannauj",
    text: "Sher Shah Suri beat the second Mughal emperor Humayun at Kannauj and took his empire, ending Humayun's first reign (1530–1540). Humayun regained India only in 1555 with Safavid aid.", imp: 2,
    cites: [B("biography/Humayun-Mughal-emperor", "Humayun"), W("Battle_of_Kannauj", "Battle of Kannauj")] },
  { id: "w307-second-panipat", branch: "mughal", y: 1556.85, when: "November 5, 1556 (believed)", title: "Second Battle of Panipat",
    text: "The young Akbar's forces defeated the Hindu minister Hemu at Panipat, which secured Mughal rule in northern India after Humayun's death.", imp: 2,
    cites: [B("topic/Second-Battle-of-Panipat", "Second Battle of Panipat")] },
  { id: "w307-hamzanama", branch: "mughal", y: 1562, when: "from about 1562", title: "Akbar commissions the Hamzanama paintings",
    text: "Akbar commissioned a series of large miniatures illustrating the romance of Amir Hamza, probably from about 1562. It was a great early project of Mughal painting, which blended Persian and Indian styles.", imp: 2,
    cites: [B("topic/Mughal-painting", "Mughal painting"), W("Hamzanama", "Hamzanama")] },
  { id: "w307-fatehpur-sikri", branch: "mughal", y: 1571, end: 1585, when: "c. 1571–1585", title: "Akbar builds and rules from Fatehpur Sikri",
    text: "Akbar built a new capital near Agra, with the Jama Masjid and the tomb of the Chishti saint. He left about 1585 and the city was nearly deserted by 1610.", imp: 2,
    cites: [B("place/Fatehpur-Sikri", "Fatehpur Sikri"), U(255, "Fatehpur Sikri"), W("Fatehpur_Sikri", "Fatehpur Sikri")] },
  { id: "w307-taj-mahal", branch: "mughal", y: 1632, end: 1648, when: "1632–1648 (complex finished 1653)", title: "Shah Jahan builds the Taj Mahal",
    text: "Shah Jahan had the white marble mausoleum raised at Agra for his wife Mumtaz Mahal, who died in 1631. UNESCO calls it the greatest achievement of Indo-Islamic architecture.", imp: 1,
    cites: [U(252, "Taj Mahal"), B("topic/Taj-Mahal", "Taj Mahal"), W("Taj_Mahal", "Taj Mahal")] },
  { id: "w307-red-fort", branch: "mughal", y: 1639.36, end: 1648.26, when: "May 12, 1639 – April 6, 1648", title: "Shah Jahan builds the Red Fort at Delhi",
    text: "When Shah Jahan moved the capital from Agra to Delhi, he raised the red sandstone palace fort of the new city of Shahjahanabad. UNESCO calls it a zenith of Mughal creativity.", imp: 2,
    cites: [U(231, "Red Fort Complex"), B("topic/Red-Fort", "Red Fort"), W("Red_Fort", "Red Fort")] },
  { id: "w307-badshahi-mosque", branch: "mughal", y: 1671, end: 1673, when: "1671–1673", title: "Aurangzeb builds the Badshahi Mosque at Lahore",
    text: "The Imperial Mosque opposite Lahore Fort was built under Aurangzeb and remains one of the largest mosques in the world.", imp: 3,
    cites: [B("topic/Badshahi-Mosque", "Badshahi Mosque"), W("Badshahi_Mosque", "Badshahi Mosque")] },
  { id: "w307-jizya-reimposed", branch: "mughal", y: 1679, when: "1679", title: "Aurangzeb reimposes the jizya tax",
    text: "Aurangzeb revived the jizya on non-Muslims, abolished a century earlier by Akbar. Many Hindu rulers and some Mughal officials criticized the move.", imp: 2,
    cites: [W("Jizya", "Jizya"), W("Aurangzeb", "Aurangzeb")] },
  { id: "w307-aurangzeb-dies", branch: "mughal", y: 1707.17, when: "March 3, 1707", title: "Aurangzeb dies; the empire begins to fray",
    text: "The last of the great Mughals died after nearly fifty years on the throne, much of it spent in long sieges of Maratha forts. Revived Maratha power followed his death.", imp: 2,
    cites: [B("biography/Aurangzeb", "Aurangzeb"), B("topic/Maratha-confederacy", "Maratha confederacy")] },
  { id: "w307-buxar", branch: "mughal", y: 1764.81, when: "October 22, 1764", title: "Battle of Buxar",
    text: "The East India Company's army under Major Hector Munro beat a combined force that included the Mughal emperor Shah Alam II, who surrendered. It began the Company's rise over eastern India.", imp: 2, link: "great-britain",
    cites: [B("topic/Battle-of-Buxar", "Battle of Buxar"), W("Battle_of_Buxar", "Battle of Buxar")] },
  { id: "w307-shah-alam-blinded", branch: "mughal", y: 1788, when: "1788", title: "Ghulam Qadir blinds Shah Alam II",
    text: "The Rohilla chief Ghulam Qadir seized Delhi and blinded the emperor in rage at finding no treasure. Maratha forces under Mahadji Shinde retook the city that autumn.", imp: 3, link: "maratha",
    cites: [B("biography/Shah-Alam-II", "Shah Alam II"), W("Ghulam_Kadir", "Ghulam Kadir")] },

  // ---------- Vijayanagara ----------
  { id: "w307-krishnadevaraya", branch: "vijayanagara", y: 1509, end: 1529, when: "1509–1529", title: "Krishnadevaraya's reign: empire at its height",
    text: "Generally regarded as Vijayanagara's greatest king, he made the kingdom more powerful than ever. He beat Bijapur in 1520 and himself wrote the Telugu poem Amuktamalyada.", imp: 2,
    cites: [B("biography/Krishna-Deva-Raya", "Krishna Deva Raya"), W("Krishnadevaraya", "Krishnadevaraya")] },
  { id: "w307-madras-grant", branch: "vijayanagara", y: 1639, when: "1639", title: "English acquire the site of Madras",
    text: "Francis Day negotiated with the raja of Chandragiri, a late Vijayanagara capital, for coastal land and leave to build Fort St. George, the Company's first fortified settlement in India.", imp: 3, link: "great-britain",
    cites: [B("topic/Fort-Saint-George", "Fort Saint George"), W("Fort_St._George,_Chennai", "Fort St. George, Chennai"), W("Chandragiri", "Chandragiri")] },

  // ---------- Ayutthaya ----------
  { id: "w307-burmese-siege-1548", branch: "ayutthaya", y: 1548, when: "1548", title: "Burmese king Tabinshwehti besieges Ayutthaya",
    text: "The Toungoo king Tabinshwehti besieged the Siamese capital but was forced to make an ignominious retreat to Myanmar.", imp: 3,
    cites: [B("biography/Tabinshwehti", "Tabinshwehti")] },
  { id: "w307-fall-1569", branch: "ayutthaya", y: 1569.62, when: "August 1569", title: "Bayinnaung captures Ayutthaya",
    text: "After fierce Siamese resistance, the Burmese king Bayinnaung took the capital, installed a vassal on the throne and deported thousands of Siamese to Myanmar as slaves.", imp: 2,
    cites: [B("biography/Bayinnaung", "Bayinnaung")] },
  { id: "w307-naresuan", branch: "ayutthaya", y: 1593, when: "early 1593 (independence declared 1584)", title: "Naresuan kills the Burmese crown prince in combat",
    text: "Having renounced allegiance to Myanmar in 1584, Naresuan defeated a huge Burmese army and killed the crown prince in personal combat, winning Siamese independence for almost two centuries.", imp: 2,
    cites: [B("biography/Naresuan", "Naresuan")] },
  { id: "w307-chaiwatthanaram", branch: "ayutthaya", y: 1630, when: "1630", title: "King Prasat Thong builds Wat Chaiwatthanaram",
    text: "Prasat Thong built the temple as the first of his reign, as a memorial on the site where his mother had lived. Its Khmer-style towers are among Ayutthaya's landmarks.", imp: 3,
    cites: [W("Wat_Chaiwatthanaram", "Wat Chaiwatthanaram")] },
  { id: "w307-narai-golden-age", branch: "ayutthaya", y: 1656, end: 1688, when: "1656–1688", title: "King Narai's court and Thai literature's first golden age",
    text: "Narai courted foreign trade and, to counter the Dutch, an alliance with France, advised by the Greek adventurer Constantine Phaulkon. His court also produced the first golden age of Thai literature.", imp: 2, link: "france",
    cites: [B("biography/Narai", "Narai"), B("biography/Constantine-Phaulkon", "Constantine Phaulkon")] },
  { id: "w307-alaungpaya-1760", branch: "ayutthaya", y: 1760.27, when: "April 1760", title: "Alaungpaya's army surrounds Ayutthaya",
    text: "King Alaungpaya of Myanmar led his army through Tenasserim to the Siamese capital, which he surrounded in April 1760. He died soon after, on the campaign.", imp: 3,
    cites: [B("biography/Alaungpaya", "Alaungpaya"), W("Burmese%E2%80%93Siamese_War_(1759%E2%80%931760)", "Burmese–Siamese War (1759–1760)")] },

  // ---------- Japan ----------
  { id: "w307-tanegashima-guns", branch: "japan", y: 1543, when: "1543", title: "Portuguese introduce matchlock guns to Japan",
    text: "The matchlock arquebus, called tanegashima, reached Japan through the Portuguese in 1543 and soon changed how the warring daimyo fought.", imp: 2,
    cites: [B("biography/Oda-Nobunaga", "Oda Nobunaga"), W("Tanegashima_(gun)", "Tanegashima (gun)")] },
  { id: "w307-nagashino", branch: "japan", y: 1575.49, when: "June 28, 1575", title: "Battle of Nagashino",
    text: "Oda Nobunaga and Tokugawa Ieyasu beat the Takeda army using firearms and simple defenses, in a battle that Britannica says revolutionized Japanese warfare.", imp: 2,
    cites: [B("topic/Battle-of-Nagashino", "Battle of Nagashino"), W("Battle_of_Nagashino", "Battle of Nagashino")] },
  { id: "w307-honnoji", branch: "japan", y: 1582.47, when: "June 21, 1582", title: "Oda Nobunaga dies at Honnō-ji",
    text: "Nobunaga was attacked and killed at the Honnō-ji temple in Kyoto before he could unify Japan. Toyotomi Hideyoshi took up his work and had unified most of Japan by 1590.", imp: 2,
    cites: [B("biography/Oda-Nobunaga", "Oda Nobunaga"), B("biography/Toyotomi-Hideyoshi", "Toyotomi Hideyoshi"), W("Honn%C5%8D-ji_Incident", "Honnō-ji Incident")] },
  { id: "w307-sen-no-rikyu", branch: "japan", y: 1591, when: "1591", title: "Sen no Rikyū, master of the tea ceremony, dies",
    text: "Rikyū perfected the tea ceremony, reshaping its rules, utensils, teahouse and tea garden around utter simplicity. He died in Kyoto in 1591, by his own hand on Hideyoshi's order.", imp: 3,
    cites: [B("biography/Sen-Rikyu", "Sen Rikyū"), W("Sen_no_Riky%C5%AB", "Sen no Rikyū")] },
  { id: "w307-himeji-castle", branch: "japan", y: 1601, end: 1609, when: "1601–1609", title: "Himeji Castle rebuilt in its present form",
    text: "Ikeda Terumasa, awarded the site after Sekigahara, rebuilt and expanded the castle and raised its main keep. UNESCO calls it the finest surviving early 17th-century Japanese castle.", imp: 2,
    cites: [B("topic/Himeji-Castle", "Himeji Castle"), U(661, "Himeji-jo"), W("Himeji_Castle", "Himeji Castle")] },
  { id: "w307-kabuki-origins", branch: "japan", y: 1603, when: "1603", title: "Okuni's troupe performs the first kabuki",
    text: "A dancer named Okuni led a female troupe in a popular performance of dances and light sketches on the Kamo River bed in Kyoto, the start of kabuki theater.", imp: 2,
    cites: [B("biography/Okuni", "Okuni"), B("art/kabuki", "Kabuki")] },
  { id: "w307-shimabara", branch: "japan", y: 1637.9, end: 1638, when: "1637–1638", title: "Shimabara Rebellion of Japanese Catholics",
    text: "Rōnin and mostly Catholic peasants led by Amakusa Shirō rose against the shogunate. Its failure virtually ended Christianity in Japan and hardened the policy of isolation.", imp: 2,
    cites: [B("topic/Shimabara-Rebellion", "Shimabara Rebellion"), W("Shimabara_Rebellion", "Shimabara Rebellion")] },
  { id: "w307-genroku-culture", branch: "japan", y: 1688, end: 1704, when: "1688–1704", title: "Genroku era: Edo-period city culture flowers",
    text: "A booming commercial economy fed a vibrant urban culture in Kyoto, Osaka and Edo, including Saikaku's stories, Bashō's haiku and the plays of Chikamatsu.", imp: 2,
    cites: [B("event/Genroku-period", "Genroku period"), B("biography/Ihara-Saikaku", "Ihara Saikaku")] },
  { id: "w307-basho-narrow-road", branch: "japan", y: 1689.37, when: "May 16, 1689", title: "Bashō sets out on The Narrow Road to the Deep North",
    text: "The haiku master Matsuo Bashō left Edo on the journey he recorded in Oku no Hosomichi, which he reworked until 1694. It became his masterwork.", imp: 2,
    cites: [W("Matsuo_Bash%C5%8D", "Matsuo Bashō"), B("event/Genroku-period", "Genroku period")] },
  { id: "w307-sonezaki-suicides", branch: "japan", y: 1703, when: "1703", title: "Chikamatsu's Love Suicides at Sonezaki",
    text: "One of the first domestic tragedies of the playwright Chikamatsu Monzaemon, it marked his return to writing for the puppet (jōruri) theater after years writing for kabuki actors.", imp: 3,
    cites: [B("biography/Chikamatsu-Monzaemon", "Chikamatsu Monzaemon")] },
  { id: "w307-chushingura", branch: "japan", y: 1748, when: "1748", title: "Chūshingura staged for puppet theater",
    text: "The 11-act bunraku play Kanadehon Chūshingura, based on the revenge of the forty-seven rōnin, was an instant success and became a staple of puppet and kabuki theater.", imp: 3,
    cites: [B("topic/Chushingura", "Chūshingura"), W("Kanadehon_Ch%C5%ABshingura", "Kanadehon Chūshingura"), W("Forty-seven_r%C5%8Dnin", "Forty-seven rōnin")] },
  { id: "w307-nishiki-e", branch: "japan", y: 1765, when: "1765", title: "Harunobu introduces full-color nishiki-e prints",
    text: "Suzuki Harunobu began designing polychrome woodblock prints from many blocks, first for haiku calendars, and so established the art of nishiki-e.", imp: 2,
    cites: [B("biography/Suzuki-Harunobu", "Suzuki Harunobu"), B("art/ukiyo-e", "Ukiyo-e")] },
  { id: "w307-kaitai-shinsho", branch: "japan", y: 1774, when: "1774", title: "Kaitai shinsho: Dutch anatomy translated",
    text: "Sugita Genpaku and colleagues published a translation of a Dutch anatomical book, a landmark of rangaku (“Dutch learning”) under the Tokugawa.", imp: 2, link: "dutch-republic",
    cites: [B("topic/Kaitai-shinsho", "Kaitai shinsho"), B("topic/Rangaku", "Rangaku")] },
  { id: "w307-sharaku-prints", branch: "japan", y: 1794, when: "1794–1795", title: "Sharaku's kabuki actor portraits",
    text: "The ukiyo-e designer Tōshūsai Sharaku produced striking portraits of kabuki actors in about ten months of activity, now among the best-known Japanese prints.", imp: 3,
    cites: [W("Toshusai_Sharaku", "Tōshūsai Sharaku"), B("art/ukiyo-e", "Ukiyo-e")] },

  // ---------- Joseon ----------
  { id: "w307-jungjong-coup", branch: "joseon", y: 1506.67, when: "September 1506", title: "Coup deposes Yeonsangun; Jungjong enthroned",
    text: "Officials deposed the king Yeonsangun, and the court placed Jungjong on the throne. He later carried out reforms with the Sarim scholar Cho Kwangjo.", imp: 3,
    cites: [W("Jungjong_of_Joseon", "Jungjong of Joseon")] },
  { id: "w307-donguibogam", branch: "joseon", y: 1613, when: "1613", title: "Heo Jun's Donguibogam published",
    text: "The royal physician Heo Jun led the compilation of the Dongui Bogam, “Principles and Practice of Eastern Medicine,” interrupted by the 1597 Japanese invasion and first published in 1613.", imp: 2,
    cites: [{ t: "Donguibogam — National Library of Korea", u: "https://www.nl.go.kr/EN/contents/EN30701000000.do" }, W("Donguibogam", "Donguibogam")] },
  { id: "w307-hamel-jeju", branch: "joseon", y: 1653, when: "1653", title: "Dutch sailors shipwrecked on Jeju",
    text: "Hendrick Hamel and his crew were wrecked off Jeju while sailing to Japan. His journal of 1653–1666 became the first first-hand Western account of Korea, published in 1668.", imp: 3, link: "dutch-republic",
    cites: [{ t: "The shipwreck of Hendrik Hamel with the Sperwer — Atlas of Mutual Heritage", u: "https://www.atlasofmutualheritage.nl/page/11075/the-schipwreck-of-hendrik-hamel-with-the-sperwer" }, W("Hendrick_Hamel", "Hendrick Hamel")] },
  { id: "w307-yeongjo-reforms", branch: "joseon", y: 1724, end: 1776, when: "1724–1776", title: "Yeongjo's reforms and Tangpyeong policy",
    text: "King Yeongjo cut the military service tax in half, made up the loss with other taxes, and tried to reconcile court factions through his Tangpyeong policy.", imp: 2,
    cites: [B("biography/Yeongjo", "Yeongjo"), W("Yeongjo_of_Joseon", "Yeongjo of Joseon")] },
  { id: "w307-jeong-seon-inwang", branch: "joseon", y: 1751, when: "1751", title: "Jeong Seon paints Inwangjesaekdo",
    text: "Jeong Seon, the first painter of Korean “true-view” landscapes, painted Inwangjesaekdo in 1751. It is one of the best-known works of Joseon painting.", imp: 3,
    cites: [{ t: "Rediscovering landscape painter Jeong Seon — The Korea Herald", u: "https://www.koreaherald.com/article/10455600" }, B("biography/Chong-Son", "Chŏng Sŏn"), W("Jeong_Seon", "Jeong Seon")] },
  { id: "w307-gyujanggak", branch: "joseon", y: 1776, when: "1776", title: "Jeongjo founds the Gyujanggak royal library",
    text: "King Jeongjo founded the Gyujanggak on the grounds of Changdeokgung palace as a royal library and a major policy arm of his government.", imp: 3,
    cites: [{ t: "Gyujanggak: a trove of national treasures — The Korea Times", u: "https://www.koreatimes.co.kr/www/culture/2024/06/135_89089.html" }, W("Gyujanggak", "Kyujanggak")] },
  { id: "w307-hwaseong", branch: "joseon", y: 1794, end: 1796, when: "1794–1796", title: "Jeongjo builds Hwaseong Fortress at Suwon",
    text: "To honor his father Crown Prince Sado, Jeongjo moved the tomb to Suwon and ringed it with a stone-and-brick fortress. It is now a UNESCO World Heritage site.", imp: 2,
    cites: [U(817, "Hwaseong Fortress"), B("place/Suwon", "Suwon"), W("Hwaseong_Fortress", "Hwaseong Fortress")] },
] });

TL.geo("w307-agra-founded", { scope: "place", lat: 27.18, lon: 78.02, r: 40, label: "Agra, India", src: "https://en.wikipedia.org/wiki/Agra" });
TL.geo("w307-sambhaji-executed", { scope: "place", lat: 18.67, lon: 73.99, r: 50, label: "Tulapur, near Pune, India", src: "https://en.wikipedia.org/wiki/Tulapur" });
TL.geo("w307-shahu-released", { scope: "region", lat: 18.97, lon: 72.82, r: 300, label: "Maharashtra, India", src: "https://en.wikipedia.org/wiki/Maharashtra" });
TL.geo("w307-shaniwar-wada", { scope: "place", lat: 18.5195, lon: 73.8553, r: 30, label: "Pune, India", src: "https://en.wikipedia.org/wiki/Shaniwar_Wada" });
TL.geo("w307-treaty-salbai", { scope: "place", lat: 26.21, lon: 78.18, r: 40, label: "Near Gwalior, India", src: "https://en.wikipedia.org/wiki/Gwalior" });
TL.geo("w307-kannauj", { scope: "place", lat: 27.06, lon: 79.92, r: 40, label: "Kannauj, India", src: "https://en.wikipedia.org/wiki/Kannauj" });
TL.geo("w307-second-panipat", { scope: "place", lat: 29.39, lon: 76.97, r: 40, label: "Panipat, India", src: "https://en.wikipedia.org/wiki/Panipat" });
TL.geo("w307-hamzanama", { scope: "place", lat: 27.18, lon: 78.02, r: 60, label: "Agra, India", src: "https://en.wikipedia.org/wiki/Agra" });
TL.geo("w307-fatehpur-sikri", { scope: "place", lat: 27.0937, lon: 77.6679, r: 30, label: "Fatehpur Sikri, India", src: "https://en.wikipedia.org/wiki/Fatehpur_Sikri" });
TL.geo("w307-taj-mahal", { scope: "place", lat: 27.1751, lon: 78.0421, r: 30, label: "Taj Mahal, Agra, India", src: "https://en.wikipedia.org/wiki/Taj_Mahal" });
TL.geo("w307-red-fort", { scope: "place", lat: 28.6562, lon: 77.241, r: 30, label: "Red Fort, Delhi, India", src: "https://en.wikipedia.org/wiki/Red_Fort" });
TL.geo("w307-badshahi-mosque", { scope: "place", lat: 31.5883, lon: 74.3103, r: 30, label: "Lahore, Pakistan", src: "https://en.wikipedia.org/wiki/Badshahi_Mosque" });
TL.geo("w307-jizya-reimposed", { scope: "region", lat: 23.0, lon: 78.0, r: 1500, label: "Mughal Empire", src: "https://en.wikipedia.org/wiki/Mughal_Empire" });
TL.geo("w307-aurangzeb-dies", { scope: "place", lat: 19.08, lon: 74.73, r: 50, label: "Ahmednagar, India", src: "https://en.wikipedia.org/wiki/Ahmednagar" });
TL.geo("w307-buxar", { scope: "place", lat: 25.57, lon: 83.98, r: 40, label: "Buxar, India", src: "https://en.wikipedia.org/wiki/Buxar" });
TL.geo("w307-shah-alam-blinded", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi, India", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w307-krishnadevaraya", { scope: "place", lat: 15.335, lon: 76.46, r: 60, label: "Hampi, India", src: "https://en.wikipedia.org/wiki/Hampi" });
TL.geo("w307-madras-grant", { scope: "place", lat: 13.08, lon: 80.28, r: 40, label: "Chennai, India", src: "https://en.wikipedia.org/wiki/Chennai" });
TL.geo("w307-burmese-siege-1548", { scope: "place", lat: 14.35, lon: 100.57, r: 40, label: "Ayutthaya, Thailand", src: "https://en.wikipedia.org/wiki/Ayutthaya" });
TL.geo("w307-fall-1569", { scope: "place", lat: 14.35, lon: 100.57, r: 40, label: "Ayutthaya, Thailand", src: "https://en.wikipedia.org/wiki/Ayutthaya" });
TL.geo("w307-naresuan", { scope: "place", lat: 14.47, lon: 100.12, r: 80, label: "Suphan Buri, Thailand", src: "https://en.wikipedia.org/wiki/Suphan_Buri" });
TL.geo("w307-chaiwatthanaram", { scope: "place", lat: 14.3445, lon: 100.5436, r: 30, label: "Wat Chaiwatthanaram, Thailand", src: "https://en.wikipedia.org/wiki/Wat_Chaiwatthanaram" });
TL.geo("w307-narai-golden-age", { scope: "place", lat: 14.8, lon: 100.63, r: 40, label: "Lopburi, Thailand", src: "https://en.wikipedia.org/wiki/Lopburi" });
TL.geo("w307-alaungpaya-1760", { scope: "place", lat: 14.35, lon: 100.57, r: 40, label: "Ayutthaya, Thailand", src: "https://en.wikipedia.org/wiki/Ayutthaya" });
TL.geo("w307-tanegashima-guns", { scope: "place", lat: 30.57, lon: 130.98, r: 40, label: "Tanegashima, Japan", src: "https://en.wikipedia.org/wiki/Tanegashima" });
TL.geo("w307-nagashino", { scope: "place", lat: 34.9, lon: 137.5, r: 40, label: "Shinshiro, Japan", src: "https://en.wikipedia.org/wiki/Shinshiro,_Aichi" });
TL.geo("w307-honnoji", { scope: "place", lat: 35.01, lon: 135.76, r: 30, label: "Kyoto, Japan", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w307-sen-no-rikyu", { scope: "place", lat: 35.01, lon: 135.76, r: 30, label: "Kyoto, Japan", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w307-himeji-castle", { scope: "place", lat: 34.8394, lon: 134.6939, r: 30, label: "Himeji Castle, Japan", src: "https://en.wikipedia.org/wiki/Himeji_Castle" });
TL.geo("w307-kabuki-origins", { scope: "place", lat: 35.01, lon: 135.76, r: 30, label: "Kyoto, Japan", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w307-shimabara", { scope: "place", lat: 32.79, lon: 130.37, r: 50, label: "Shimabara, Japan", src: "https://en.wikipedia.org/wiki/Shimabara,_Nagasaki" });
TL.geo("w307-genroku-culture", { scope: "place", lat: 34.69, lon: 135.5, r: 80, label: "Osaka, Japan", src: "https://en.wikipedia.org/wiki/Osaka" });
TL.geo("w307-basho-narrow-road", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Edo (Tokyo), Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w307-sonezaki-suicides", { scope: "place", lat: 34.69, lon: 135.5, r: 40, label: "Osaka, Japan", src: "https://en.wikipedia.org/wiki/Osaka" });
TL.geo("w307-chushingura", { scope: "place", lat: 34.69, lon: 135.5, r: 40, label: "Osaka, Japan", src: "https://en.wikipedia.org/wiki/Osaka" });
TL.geo("w307-nishiki-e", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Edo (Tokyo), Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w307-kaitai-shinsho", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Edo (Tokyo), Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w307-sharaku-prints", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Edo (Tokyo), Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w307-jungjong-coup", { scope: "place", lat: 37.56, lon: 126.99, r: 30, label: "Seoul, South Korea", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w307-donguibogam", { scope: "place", lat: 37.56, lon: 126.99, r: 30, label: "Seoul, South Korea", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w307-hamel-jeju", { scope: "place", lat: 33.38, lon: 126.53, r: 60, label: "Jeju Island, South Korea", src: "https://en.wikipedia.org/wiki/Jeju_Island" });
TL.geo("w307-yeongjo-reforms", { scope: "place", lat: 37.56, lon: 126.99, r: 30, label: "Seoul, South Korea", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w307-jeong-seon-inwang", { scope: "place", lat: 37.58, lon: 126.96, r: 20, label: "Inwangsan, Seoul", src: "https://en.wikipedia.org/wiki/Inwangsan" });
TL.geo("w307-gyujanggak", { scope: "place", lat: 37.5794, lon: 126.991, r: 20, label: "Changdeokgung, Seoul", src: "https://en.wikipedia.org/wiki/Changdeokgung" });
TL.geo("w307-hwaseong", { scope: "place", lat: 37.27, lon: 127.01, r: 30, label: "Hwaseong Fortress, Suwon", src: "https://en.wikipedia.org/wiki/Hwaseong_Fortress" });
