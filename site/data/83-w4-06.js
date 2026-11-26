// Fill-in W4-06: Chola, Delhi Sultanate, Ghaznavid, Ghurid, Vijayanagara, Ayutthaya, Goryeo, Japan, Joseon, Khmer and Majapahit events, 1000–1500. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const X = (t, u) => ({ t, u });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });

TL.add({ events: [
  // ---------- Chola ----------
  { id: "w406-brihadisvara-temple", branch: "chola", y: 1010, when: "1010 (built 1003–1010)", title: "Rajaraja I completes the Brihadisvara Temple at Thanjavur",
    text: "Rajaraja I's great Shiva temple, topped by a 63-meter vimana, was finished at the Chola capital and became the model for Chola temple architecture; it is now a UNESCO World Heritage Site.", imp: 2,
    cites: [W("Brihadisvara_Temple,_Thanjavur", "Brihadisvara Temple, Thanjavur"), B("place/Brihadishvara-Temple", "Brihadishvara Temple"), B("biography/Rajaraja-I", "Rajaraja I")] },
  { id: "w406-kulottunga-i", branch: "chola", y: 1070, when: "1070", title: "Kulottunga I joins the Chola and Eastern Chalukya thrones",
    text: "Kulottunga I, a Chola on his mother's side and a Chalukya on his father's, took the Chola throne in 1070 and ruled it until 1122, ending a period of anarchy after the death of the previous Chola king.", imp: 2,
    cites: [W("Kulottunga_I", "Kulottunga I"), B("biography/Kulottunga-I", "Kulottunga I")] },

  // ---------- Delhi Sultanate ----------
  { id: "w406-qutb-minar", branch: "delhi-sultanate", y: 1199, end: 1220, when: "1199–c. 1220", title: "Qutb Minar rises in Delhi",
    text: "Qutb ud-Din Aibak began the victory tower beside the Quwwat-ul-Islam mosque, and his successor Iltutmish completed it; at 72.5 meters it is among the tallest minarets in Asia.", imp: 2,
    cites: [W("Qutb_Minar", "Qutb Minar"), B("place/Qutb-Minar", "Qutb Minar")] },
  { id: "w406-razia-sultana", branch: "delhi-sultanate", y: 1236, when: "1236", title: "Razia Sultan takes the throne of Delhi",
    text: "Iltutmish's daughter Razia became sultan after her half-brother Ruknuddin Firuz was removed, the only woman to rule the sultanate in her own right. She reigned until her deposition in 1240.", imp: 2,
    cites: [W("Razia_Sultan", "Razia Sultan"), B("biography/Raziyya", "Raziyyah")] },
  { id: "w406-khalji-dynasty", branch: "delhi-sultanate", y: 1290.5, when: "1290", title: "Jalal-ud-din Khalji founds the Khalji dynasty",
    text: "Jalal-ud-din Khalji, a Mamluk-dynasty officer, deposed the infant sultan Kayumars and became the first Khalji sultan, founding a dynasty that ruled the Delhi Sultanate from 1290 to 1320.", imp: 2,
    cites: [W("Jalal-ud-Din_Khalji", "Jalal-ud-Din Khalji"), B("topic/Khalji-dynasty", "Khalji dynasty")] },
  { id: "w406-chittor-1303", branch: "delhi-sultanate", y: 1303.6, when: "1303", title: "Alauddin Khalji captures Chittor Fort",
    text: "After an eight-month siege Alauddin Khalji took the Guhila stronghold of Chittor from Ratnasimha. It came two years after he captured Ranthambore (1301) and two before he took Mandu (1305).", imp: 3,
    cites: [W("Siege_of_Chittorgarh_(1303)", "Siege of Chittorgarh (1303)"), B("topic/Khalji-dynasty", "Khalji dynasty")] },
  { id: "w406-amir-khusrau", branch: "delhi-sultanate", y: 1325.8, when: "October 1325", title: "Amir Khusrau, poet and father of qawwali, dies",
    text: "The Indo-Persian court poet and musician, who served several Delhi sultans, is credited with creating qawwali and introducing the ghazal style of song into India; he wrote mainly in Persian but also in Hindavi.", imp: 2,
    cites: [W("Amir_Khusrau", "Amir Khusrau"), B("biography/Amir-Khosrow", "Amir Khusrow")] },
  { id: "w406-daulatabad-capital", branch: "delhi-sultanate", y: 1327, when: "1327", title: "Muhammad bin Tughluq moves the capital to Daulatabad",
    text: "Seeking to control the wealthy Deccan, the sultan ordered Delhi's court relocated to Daulatabad. The experiment failed, and the Deccan nobles founded the independent Bahmani sultanate in 1347.", imp: 2,
    cites: [W("Muhammad_bin_Tughluq", "Muhammad bin Tughluq"), B("biography/Muhammad-ibn-Tughluq", "Muhammad ibn Tughluq")] },
  { id: "w406-sayyid-dynasty", branch: "delhi-sultanate", y: 1414, when: "1414", title: "Khizr Khan founds the Sayyid dynasty",
    text: "Khizr Khan, a governor in the Punjab and Multan and a vassal of the Timurids, took Delhi after the last Tughluq died and began the Sayyid dynasty, which ruled a much-reduced sultanate until 1451.", imp: 3,
    cites: [W("Sayyid_dynasty", "Sayyid dynasty"), B("biography/Khizr-Khan", "Khizr Khan")] },
  { id: "w406-bahlul-lodi", branch: "delhi-sultanate", y: 1451.3, when: "April 19, 1451", title: "Bahlul Lodi founds the Lodi dynasty",
    text: "The Afghan noble Bahlul Lodi ascended the Delhi throne after the Sayyid Alam Shah abdicated, beginning the Lodi dynasty, the last of the five that made up the Delhi Sultanate.", imp: 2,
    cites: [W("Bahlul_Khan_Lodi", "Bahlul Khan Lodi"), B("biography/Bahlul-Lodi", "Bahlul Lodi")] },

  // ---------- Ghaznavids ----------
  { id: "w406-masud-iii-tower", branch: "ghaznavids", y: 1099, end: 1115, when: "1099–1115", title: "Masud III's victory tower built at Ghazni",
    text: "The victory tower of Masud III at Ghazni, built 1099–1115, is a precursor of the Seljuq tomb-tower; little else survives of Ghaznavid art.", imp: 3,
    cites: [B("topic/Ghaznavid-dynasty", "Ghaznavid dynasty")] },
  { id: "w406-ghazni-sacked-1151", branch: "ghaznavids", y: 1151, when: "1150–1151", title: "Ghurids sack Ghazni",
    text: "The Ghurid chief Ala al-Din Husayn took revenge on the Ghaznavid ruler for poisoning a Ghurid leader by sacking their capital, which burned for days; Ghaznavid power was broken, and they held on in the east until 1186.", imp: 2,
    cites: [B("place/Ghazni", "Ghazni"), W("Ghurid_dynasty", "Ghurid dynasty"), B("topic/Ghaznavid-dynasty", "Ghaznavid dynasty"), X("Kingdoms of South Asia - Ghurids — The History Files", "https://www.historyfiles.co.uk/KingListsFarEast/AsiaKhorasanGhurids.htm")] },

  // ---------- Ghurids ----------
  { id: "w406-mahmud-conquers-ghur", branch: "ghurids", y: 1011, when: "c. 1011", title: "Mahmud of Ghazni conquers Ghur",
    text: "Mahmud led an expedition into the mountain homeland of Ghur, defeated its ruler Muhammad ibn Suri and took him prisoner, bringing the Ghurids under Ghaznavid rule; they gradually converted to Sunni Islam.", imp: 2,
    cites: [W("Mahmud_of_Ghazni", "Mahmud of Ghazni"), W("Ghurid_dynasty", "Ghurid dynasty"), X("Kingdoms of South Asia - Ghurids — The History Files", "https://www.historyfiles.co.uk/KingListsFarEast/AsiaKhorasanGhurids.htm")] },
  { id: "w406-minaret-of-jam", branch: "ghurids", y: 1192, when: "c. 1190–1194", title: "Ghurids raise the Minaret of Jam",
    text: "The 65-meter minaret of fired brick, covered in geometric relief and Kufic and Naskhi calligraphy, stands at what was probably the Ghurid summer capital Firuzkuh; UNESCO dates it to 1194 and lists it as a World Heritage Site.", imp: 2,
    cites: [W("Minaret_of_Jam", "Minaret of Jam"), X("Minaret and Archaeological Remains of Jam — UNESCO World Heritage Centre", "https://whc.unesco.org/en/list/211")] },
  { id: "w406-ghazni-1173", branch: "ghurids", y: 1173, when: "1173", title: "Muizz al-Din takes Ghazni",
    text: "Muizz al-Din Muhammad (Muhammad of Ghor) expelled the Oghuz nomads from Ghazni and made it his base, from which he launched the conquests of the Indus plain and northern India.", imp: 2,
    cites: [W("Muhammad_of_Ghor", "Muhammad of Ghor"), B("biography/Muizz-al-Din-Muhammad-ibn-Sam", "Muʿizz al-Dīn Muḥammad ibn Sām")] },

  // ---------- Vijayanagara ----------
  { id: "w406-vijayanagara-founded", branch: "vijayanagara", y: 1336.3, when: "April 18, 1336", title: "Harihara and Bukka found Vijayanagara",
    text: "Harihara I and his brother Bukka, sons of Sangama, founded the city and empire on the Tungabhadra that became the great Hindu power of the south.", imp: 2,
    cites: [W("Harihara_I", "Harihara I"), B("place/Vijayanagar", "Vijayanagara")] },
  { id: "w406-bukka-madurai", branch: "vijayanagara", y: 1371, when: "1371", title: "Bukka Raya defeats the Madurai Sultanate",
    text: "Bukka Raya I defeated the Sultanate of Madurai and extended Vijayanagara's territory south as far as Rameswaram.", imp: 3,
    cites: [W("Bukka_Raya_I", "Bukka Raya I"), X("Kingdoms of South Asia - Indian Kingdom of Vijayanagar — The History Files", "https://www.historyfiles.co.uk/KingListsFarEast/IndiaVijayanagar.htm")] },
  { id: "w406-abd-al-razzaq", branch: "vijayanagara", y: 1443, when: "1443 (mission 1442–1445)", title: "Abd al-Razzaq describes Vijayanagara",
    text: "Abd al-Razzaq, ambassador of the Timurid ruler Shah Rukh on a mission to India in 1442–1444, visited Vijayanagara and left a description of its court and great city.", imp: 3,
    cites: [W("Abd_al-Razzaq_Samarqandi", "Abd al-Razzaq Samarqandi"), X("ʿAbd-al-Razzāq Samarqandī — Encyclopaedia Iranica", "https://www.iranicaonline.org/articles/abd-al-razzaq-samarqandi-historian-and-scholar-1413-82/")] },
  { id: "w406-saluva-usurpation", branch: "vijayanagara", y: 1485, when: "c. 1485", title: "Saluva Narasimha ends the Sangama dynasty",
    text: "Under pressure from the Bahmani sultan and the raja of Odisha, the general Saluva Narasimha usurped power from the weakened Sangama line and founded the second dynasty.", imp: 3,
    cites: [W("Saluva_Narasimha_Deva_Raya", "Saluva Narasimha Deva Raya"), B("place/Vijayanagar", "Vijayanagara")] },

  // ---------- Ayutthaya ----------
  { id: "w406-ayutthaya-founded", branch: "ayutthaya", y: 1351, when: "1351", title: "Ramathibodi I founds Ayutthaya",
    text: "Ramathibodi (U Thong) moved his capital to an island in the Chao Phraya River and was enthroned as the first king of Ayutthaya, a kingdom that lasted until 1767.", imp: 2,
    cites: [W("Uthong", "Uthong"), B("biography/Ramathibodi-I", "Ramathibodi I")] },
  { id: "w406-sakdi-na", branch: "ayutthaya", y: 1455, when: "1455", title: "Trailok's Palatine Law and the sakdi na ranking",
    text: "King Borommatrailokkanat centralized and institutionalized government through the Palatine Law of 1455, and gave every subject a numerical rank (sakdi na) expressed in units of land.", imp: 2,
    cites: [W("Ayutthaya_Kingdom", "Ayutthaya Kingdom"), B("topic/Sakdi-na", "Sakdi Na")] },

  // ---------- Goryeo ----------
  { id: "w406-first-tripitaka", branch: "goryeo", y: 1011, end: 1087, when: "1011–1087", title: "First Tripitaka carved at Goryeo's court",
    text: "King Hyeonjong ordered a woodblock edition of the Buddhist canon during the Khitan wars, hoping for divine protection; the first set took until 1087 and later burned, leading to the Tripitaka Koreana.", imp: 2,
    cites: [W("Tripitaka_Koreana", "Tripitaka Koreana"), W("Hyeonjong_of_Goryeo", "Hyeonjong of Goryeo"), X("Printed Version of the Tripitaka Koreana Produced in the Hope of Expelling the Khitan — National Museum of Korea", "https://www.museum.go.kr/site/eng/relic/represent/view?relicId=3152")] },
  { id: "w406-gwiju", branch: "goryeo", y: 1019, when: "1019", title: "Goryeo crushes the Khitan at Gwiju",
    text: "General Gang Gam-chan annihilated most of a retreating Khitan (Liao) army at Gwiju, ending the third Goryeo–Khitan war; a long period of peace between the two followed.", imp: 2,
    cites: [W("Battle_of_Kuju", "Battle of Kuju"), W("Goryeo–Khitan_War", "Goryeo–Khitan War"), X("Battle of Gwiju — Google Arts & Culture", "https://artsandculture.google.com/asset/battle-of-gwiju/1AEs1TK77VO1Ng?hl=en")] },
  { id: "w406-nine-fortresses", branch: "goryeo", y: 1107.95, when: "December 1107", title: "Yun Gwan campaigns against the Jurchens",
    text: "General Yun Gwan led the new Byeolmuban army of about 170,000 men against the Jurchens and built nine fortresses in the northeast, which were returned to the Jurchens soon after.", imp: 3,
    cites: [W("Yun_Kwan", "Yun Kwan"), W("Goryeo", "Goryeo")] },
  { id: "w406-celadon-inlay", branch: "goryeo", y: 1100, end: 1200, when: "12th century", title: "Goryeo potters perfect inlaid celadon",
    text: "Having learned celadon glazing from China, Goryeo potters developed their own style by the 12th century, notably the sanggam inlay technique unique to Korea and admired for its jade-green glaze.", imp: 2,
    cites: [W("Goryeo_ware", "Goryeo ware"), B("topic/Korean-pottery", "Korean pottery"), X("Goryeo — World History Encyclopedia", "https://www.worldhistory.org/Goryeo/")] },
  { id: "w406-samguk-sagi", branch: "goryeo", y: 1145, when: "1145 (some sources 1146)", title: "Kim Busik completes the Samguk sagi",
    text: "Kim Busik's \"History of the Three Kingdoms\" is the oldest surviving chronicle of Korean history and the foundation for later accounts of Silla, Goguryeo and Baekje.", imp: 2,
    cites: [W("Samguk_sagi", "Samguk sagi"), B("topic/Samguk-sagi", "Samguk sagi"), X("Goryeo — World History Encyclopedia", "https://www.worldhistory.org/Goryeo/")] },
  { id: "w406-military-coup-1170", branch: "goryeo", y: 1170, when: "1170", title: "Army officers seize power in Goryeo",
    text: "A coup led by Jeong Jung-bu, Yi Ui-bang and Yi Go began a century of warrior rule in which families such as the Choe controlled the state behind a figurehead king, much like a shogunate.", imp: 2,
    cites: [W("Goryeo", "Goryeo"), X("Goryeo — World History Encyclopedia", "https://www.worldhistory.org/Goryeo/"), X("Choe in Korea — EBSCO Research Starters", "https://www.ebsco.com/research-starters/history/choe-korea/")] },
  { id: "w406-sambyeolcho", branch: "goryeo", y: 1270, end: 1273, when: "1270–1273", title: "Military rule ends; Sambyeolcho rebels against the Mongols",
    text: "The pro-Mongol faction killed the last military ruler in 1270, ending the regime. The Sambyeolcho elite troops refused to submit and fought on from Jindo island and then Jeju until crushed in 1273.", imp: 3,
    cites: [W("Sambyeolcho_Rebellion", "Sambyeolcho Rebellion"), X("Jeju during the Goryeo Dynasty — Jeju National Museum", "https://jeju.museum.go.kr/html/en/sub03/sub03_030106.html", "museum")] },
  { id: "w406-cotton-korea", branch: "goryeo", y: 1364, when: "1363–1364", title: "Mun Ik-jeom brings cotton to Korea",
    text: "Returning from Yuan China, the envoy Mun Ik-jeom brought cottonseed home in 1363 (tradition says hidden in his writing-brush cap) and grew the first plants in 1364. Cotton cloth later changed everyday clothing.", imp: 3,
    cites: [W("Mun_Ikchŏm", "Mun Ikchŏm"), X("Korean cotton culture may have begun 800 years earlier — The Korea Times", "https://www.koreatimes.co.kr/lifestyle/arts-theater/20100715/korean-cotton-culture-may-have-begun-800-years-earlier")] },

  // ---------- Japan ----------
  { id: "w406-phoenix-hall", branch: "japan", y: 1053, when: "1053", title: "Phoenix Hall of Byodo-in completed at Uji",
    text: "Fujiwara no Yorimichi turned a family villa into a temple and built the Amida hall, whose bird-like form on a pond became the landmark of Pure Land architecture in Heian Japan.", imp: 2,
    cites: [W("Byōdō-in", "Byōdō-in"), B("place/Phoenix-Hall", "Phoenix Hall")] },
  { id: "w406-konjikido", branch: "japan", y: 1124, when: "1124", title: "Golden Hall completed at Chuson-ji",
    text: "The Northern Fujiwara of Hiraizumi finished the Konjikido, a small hall covered in gold leaf and decorated with lacquer and mother-of-pearl; it is one of two original buildings surviving at Chuson-ji.", imp: 3,
    cites: [W("Chūson-ji", "Chūson-ji"), X("Hiraizumi: Temples, Gardens and Archaeological Sites Representing the Buddhist Pure Land — UNESCO World Heritage Centre", "https://whc.unesco.org/en/list/1277")] },
  { id: "w406-jokyu-war", branch: "japan", y: 1221, when: "1221", title: "Jokyu War: Kamakura crushes the retired emperor",
    text: "Retired Emperor Go-Toba called warriors to overthrow the Hojo regents but was defeated at Uji; the shogunate exiled him and made its authority over the court plain.", imp: 2,
    cites: [W("Jōkyū_War", "Jōkyū War"), B("biography/Go-Toba", "Go-Toba")] },
  { id: "w406-dogen-soto", branch: "japan", y: 1227, when: "1227", title: "Dogen returns from China and brings Soto Zen",
    text: "After studying in Song China from 1223, Dogen came home and later founded Eihei-ji; his writings, especially the Shobogenzo, made him the founder of the Soto school.", imp: 2,
    cites: [W("Dōgen", "Dōgen"), B("biography/Dogen", "Dōgen")] },
  { id: "w406-kamakura-falls", branch: "japan", y: 1333.5, when: "1333", title: "Kamakura falls and the Hojo regency ends",
    text: "Nitta Yoshisada, backing Emperor Go-Daigo, stormed Kamakura and the last Hojo regent, Takatoki, died with his clan, ending the shogunate that had governed Japan since 1192.", imp: 2,
    cites: [W("Siege_of_Kamakura_(1333)", "Siege of Kamakura (1333)"), B("biography/Nitta-Yoshisada", "Nitta Yoshisada"), B("biography/Hojo-Takatoki", "Hōjō Takatoki")] },
  { id: "w406-noh-kanami", branch: "japan", y: 1374, when: "1374", title: "Shogun Yoshimitsu's patronage launches Noh",
    text: "Ashikaga Yoshimitsu saw Kan'ami and his young son Zeami perform and became their patron, helping Noh grow from rough folk entertainment into a refined, aristocratic theater.", imp: 2,
    cites: [W("Kan'ami", "Kan'ami"), B("biography/Zeami", "Zeami")] },
  { id: "w406-kinkaku-ji", branch: "japan", y: 1397, when: "1397", title: "Yoshimitsu builds the Golden Pavilion",
    text: "Shogun Yoshimitsu acquired a villa at Kitayama and turned it into a sumptuous retreat with a gold-leaf pavilion, the future Kinkaku-ji and the emblem of Muromachi court culture.", imp: 2,
    cites: [B("topic/Kinkaku-ji", "Kinkaku-ji"), W("Ashikaga_Yoshimitsu", "Ashikaga Yoshimitsu")] },
  { id: "w406-onin-war", branch: "japan", y: 1467.4, end: 1477.96, when: "1467–1477", title: "Ōnin War shatters Ashikaga authority",
    text: "A succession dispute split the warlords into Hosokawa and Yamana armies that fought largely in Kyoto and burned much of it, opening the Age of Warring States.", imp: 2,
    cites: [W("Ōnin_War", "Ōnin War"), B("event/Onin-War", "Ōnin War")] },
  { id: "w406-ginkaku-ji", branch: "japan", y: 1482.14, when: "February 21, 1482", title: "Yoshimasa starts building the Silver Pavilion",
    text: "Construction began on the two-story Kannon hall of Shogun Ashikaga Yoshimasa's retirement villa in Kyoto, modeled on Kinkaku-ji. After his death the villa became a Zen temple; it represents Higashiyama culture.", imp: 3,
    cites: [W("Ginkaku-ji", "Ginkaku-ji"), B("biography/Ashikaga-Yoshimasa", "Ashikaga Yoshimasa")] },

  // ---------- Joseon ----------
  { id: "w406-gyeyu-coup", branch: "joseon", y: 1453.8, when: "1453", title: "Prince Suyang's coup against the boy king Danjong",
    text: "Prince Suyang killed the leading minister Kim Jongseo and his faction, took control of the state, and in 1455 forced Danjong to abdicate, becoming King Sejo.", imp: 2,
    cites: [W("Sejo_of_Joseon", "Sejo of Joseon"), X("Gyeyu Jeongnan: The Bloody 1453 Coup Of Joseon Dynasty — K Culture", "https://kculture.com/gyeyu-jeongnan-the-bloody-1453-coup-of-joseon-dynasty/")] },
  { id: "w406-gyeongguk-daejeon", branch: "joseon", y: 1485, when: "1485", title: "Gyeongguk daejeon law code finalized",
    text: "The third revision of the Great Code of Administration, issued under King Seongjong, became its final version; the code, begun under Sejo, was the legal foundation of Joseon government.", imp: 2,
    cites: [W("Kyŏngguk_taejŏn", "Kyŏngguk taejŏn"), X("Medieval and Early Modern History: Gyeongguk daejeon — National Museum of Korea", "https://www.museum.go.kr/site/eng/showroom/759/view?relicId=752")] },

  // ---------- Khmer ----------
  { id: "w406-suryavarman-i", branch: "khmer", y: 1002, when: "by 1002", title: "Suryavarman I seizes the Khmer throne",
    text: "Suryavarman defeated King Udayadityavarman by 1002 and, after years of war with a rival claimant, secured the throne by 1010, beginning a reign (to 1050) of expansion and temple building.", imp: 2,
    cites: [W("Suryavarman_I", "Suryavarman I"), B("biography/Suryavarman-I", "Suryavarman I")] },
  { id: "w406-jayavarman-vii", branch: "khmer", y: 1181, when: "1177–1181", title: "Jayavarman VII drives out the Chams and is crowned",
    text: "After Champa fleets sacked Angkor in 1177, Jayavarman retook it and was crowned in 1181, beginning a reign of temples, roads, rest houses and hospitals at the empire's zenith.", imp: 2,
    cites: [W("Jayavarman_VII", "Jayavarman VII"), B("topic/Khmer-Empire", "Khmer empire"), B("biography/Jayavarman-VII", "Jayavarman VII")] },
  { id: "w406-bayon", branch: "khmer", y: 1190, end: 1220, when: "late 12th–early 13th century", title: "The Bayon, temple of the smiling faces, built at Angkor Thom",
    text: "Jayavarman VII's Buddhist state temple at the center of Angkor Thom, with towers carved with serene giant faces and bas-reliefs of the Cham war, was the last state temple built at Angkor.", imp: 2,
    cites: [W("Bayon", "Bayon"), B("biography/Jayavarman-VII", "Jayavarman VII")] },
  { id: "w406-theravada-state", branch: "khmer", y: 1295, when: "1295", title: "Indravarman III makes Theravada Buddhism the state religion",
    text: "Indravarman III, a follower of Theravada, made it the Khmer state religion on taking the throne. Some historians see a mass conversion to Theravada as a factor in the empire's later decline.", imp: 2,
    cites: [W("Indravarman_III", "Indravarman III"), B("topic/Khmer-Empire", "Khmer empire")] },
  { id: "w406-zhou-daguan", branch: "khmer", y: 1296.62, when: "August 1296", title: "Zhou Daguan reaches Angkor",
    text: "The Chinese envoy lived at Angkor until July 1297 and wrote The Customs of Cambodia, the longest surviving eyewitness description of the Khmer capital.", imp: 2,
    cites: [W("Zhou_Daguan", "Zhou Daguan"), B("topic/Khmer-Empire", "Khmer empire")] },

  // ---------- Majapahit ----------
  { id: "w406-kuti-rebellion", branch: "majapahit", y: 1319, when: "1319", title: "Kuti rebellion drives Jayanegara from his capital",
    text: "The rebel Kuti seized the palace and capital, and King Jayanegara escaped with Gajah Mada's guards; Gajah Mada then organized a counterrising that killed Kuti and restored the king, and he rose to power.", imp: 3,
    cites: [W("Jayanegara", "Jayanegara"), B("biography/Gajah-Mada", "Gajah Mada")] },
  { id: "w406-bubat", branch: "majapahit", y: 1357, when: "1357", title: "Battle of Bubat between Majapahit and Sunda",
    text: "A planned marriage between a Sundanese princess and Hayam Wuruk ended in a massacre of the Sundanese party at Bubat, north of the Majapahit capital; the story survives in later Sundanese and Javanese chronicles.", imp: 3,
    cites: [W("Battle_of_Bubat", "Battle of Bubat"), B("biography/Gajah-Mada", "Gajah Mada")] },
  { id: "w406-nagarakretagama", branch: "majapahit", y: 1365, when: "1365", title: "Prapanca writes the Nagarakretagama",
    text: "The Buddhist cleric Prapanca composed this Old Javanese poem praising King Hayam Wuruk; it describes the court and lists the states of the archipelago under Majapahit.", imp: 2,
    cites: [W("Nagarakretagama", "Nagarakretagama"), B("topic/Nagarakrtagama", "Nagarakrtagama")] },
  { id: "w406-regreg-war", branch: "majapahit", y: 1404, end: 1406, when: "c. 1404–1406", title: "Regreg War splits Majapahit's royal court",
    text: "The western court under Wikramawardhana fought the breakaway eastern court of Bhre Wirabhumi in a civil war that weakened the realm.", imp: 3,
    cites: [W("Regreg_War", "Regreg War")] },
  { id: "w406-girindrawardhana", branch: "majapahit", y: 1478, when: "1478", title: "Girindrawardhana's army attacks Trowulan",
    text: "After Prince Kertabhumi seized Trowulan in 1468, Ranawijaya (Girindrawardhana) attacked its defenses in 1478 and defeated him; he styled himself ruler of Majapahit, Janggala and Kediri.", imp: 3,
    cites: [W("Girindrawardhana", "Girindrawardhana")] },
] });

TL.geo("w406-brihadisvara-temple", { scope: "place", lat: 10.79, lon: 79.14, r: 40, label: "Thanjavur, India", src: "https://en.wikipedia.org/wiki/Thanjavur" });
TL.geo("w406-kulottunga-i", { scope: "region", lat: 11, lon: 79, r: 300, label: "Chola country, Tamil Nadu", src: "https://en.wikipedia.org/wiki/Tamil_Nadu" });
TL.geo("w406-qutb-minar", { scope: "place", lat: 28.5245, lon: 77.1855, r: 30, label: "Qutb Minar, Delhi", src: "https://en.wikipedia.org/wiki/Qutb_Minar" });
TL.geo("w406-razia-sultana", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w406-khalji-dynasty", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w406-chittor-1303", { scope: "place", lat: 24.887, lon: 74.646, r: 40, label: "Chittor Fort, Rajasthan", src: "https://en.wikipedia.org/wiki/Chittor_Fort" });
TL.geo("w406-amir-khusrau", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w406-daulatabad-capital", { scope: "place", lat: 19.94, lon: 75.22, r: 40, label: "Daulatabad, Maharashtra", src: "https://en.wikipedia.org/wiki/Daulatabad" });
TL.geo("w406-sayyid-dynasty", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w406-bahlul-lodi", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w406-masud-iii-tower", { scope: "place", lat: 33.55, lon: 68.42, r: 40, label: "Ghazni, Afghanistan", src: "https://en.wikipedia.org/wiki/Ghazni" });
TL.geo("w406-ghazni-sacked-1151", { scope: "place", lat: 33.55, lon: 68.42, r: 40, label: "Ghazni, Afghanistan", src: "https://en.wikipedia.org/wiki/Ghazni" });
TL.geo("w406-mahmud-conquers-ghur", { scope: "region", lat: 34, lon: 65, r: 150, label: "Ghor Province, Afghanistan", src: "https://en.wikipedia.org/wiki/Ghor_Province" });
TL.geo("w406-minaret-of-jam", { scope: "place", lat: 34.396, lon: 64.516, r: 30, label: "Minaret of Jam, Afghanistan", src: "https://en.wikipedia.org/wiki/Minaret_of_Jam" });
TL.geo("w406-ghazni-1173", { scope: "place", lat: 33.55, lon: 68.42, r: 40, label: "Ghazni, Afghanistan", src: "https://en.wikipedia.org/wiki/Ghazni" });
TL.geo("w406-vijayanagara-founded", { scope: "place", lat: 15.335, lon: 76.46, r: 40, label: "Hampi (Vijayanagara)", src: "https://en.wikipedia.org/wiki/Hampi" });
TL.geo("w406-bukka-madurai", { scope: "place", lat: 9.93, lon: 78.12, r: 60, label: "Madurai, India", src: "https://en.wikipedia.org/wiki/Madurai" });
TL.geo("w406-abd-al-razzaq", { scope: "place", lat: 15.335, lon: 76.46, r: 40, label: "Hampi (Vijayanagara)", src: "https://en.wikipedia.org/wiki/Hampi" });
TL.geo("w406-saluva-usurpation", { scope: "place", lat: 15.335, lon: 76.46, r: 40, label: "Hampi (Vijayanagara)", src: "https://en.wikipedia.org/wiki/Hampi" });
TL.geo("w406-ayutthaya-founded", { scope: "place", lat: 14.35, lon: 100.56, r: 40, label: "Ayutthaya, Thailand", src: "https://en.wikipedia.org/wiki/Ayutthaya_(city)" });
TL.geo("w406-sakdi-na", { scope: "place", lat: 14.35, lon: 100.56, r: 40, label: "Ayutthaya, Thailand", src: "https://en.wikipedia.org/wiki/Ayutthaya_(city)" });
TL.geo("w406-first-tripitaka", { scope: "place", lat: 37.97, lon: 126.55, r: 40, label: "Kaesong, Goryeo's capital", src: "https://en.wikipedia.org/wiki/Kaesong" });
TL.geo("w406-gwiju", { scope: "place", lat: 39.97, lon: 125.17, r: 60, label: "Gwiju (Kusong), northwest Korea", src: "https://en.wikipedia.org/wiki/Kusong" });
TL.geo("w406-nine-fortresses", { scope: "region", lat: 40.0, lon: 128.5, r: 200, label: "Northeast Korea (Hamgyeong)", src: "https://en.wikipedia.org/wiki/Hamgyong_Province" });
TL.geo("w406-celadon-inlay", { scope: "place", lat: 34.64, lon: 126.77, r: 60, label: "Gangjin, Korea", src: "https://en.wikipedia.org/wiki/Gangjin_County" });
TL.geo("w406-samguk-sagi", { scope: "place", lat: 37.97, lon: 126.55, r: 40, label: "Kaesong, Goryeo's capital", src: "https://en.wikipedia.org/wiki/Kaesong" });
TL.geo("w406-military-coup-1170", { scope: "place", lat: 37.97, lon: 126.55, r: 40, label: "Kaesong, Goryeo's capital", src: "https://en.wikipedia.org/wiki/Kaesong" });
TL.geo("w406-sambyeolcho", { scope: "place", lat: 34.48, lon: 126.26, r: 60, label: "Jindo, Korea", src: "https://en.wikipedia.org/wiki/Jindo_Island" });
TL.geo("w406-cotton-korea", { scope: "place", lat: 35.2, lon: 128.08, r: 50, label: "Jinju, Korea", src: "https://en.wikipedia.org/wiki/Jinju" });
TL.geo("w406-phoenix-hall", { scope: "place", lat: 34.88, lon: 135.8, r: 30, label: "Uji, Kyoto Prefecture", src: "https://en.wikipedia.org/wiki/Uji,_Kyoto" });
TL.geo("w406-konjikido", { scope: "place", lat: 38.99, lon: 141.11, r: 40, label: "Hiraizumi, Iwate", src: "https://en.wikipedia.org/wiki/Hiraizumi" });
TL.geo("w406-jokyu-war", { scope: "place", lat: 34.88, lon: 135.8, r: 50, label: "Uji, near Kyoto", src: "https://en.wikipedia.org/wiki/Uji,_Kyoto" });
TL.geo("w406-dogen-soto", { scope: "place", lat: 35.01, lon: 135.77, r: 40, label: "Kyoto", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w406-kamakura-falls", { scope: "place", lat: 35.32, lon: 139.55, r: 40, label: "Kamakura, Japan", src: "https://en.wikipedia.org/wiki/Kamakura" });
TL.geo("w406-noh-kanami", { scope: "place", lat: 35.01, lon: 135.77, r: 40, label: "Kyoto", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w406-kinkaku-ji", { scope: "place", lat: 35.039, lon: 135.729, r: 30, label: "Kinkaku-ji, Kyoto", src: "https://en.wikipedia.org/wiki/Kinkaku-ji" });
TL.geo("w406-onin-war", { scope: "place", lat: 35.01, lon: 135.77, r: 40, label: "Kyoto", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w406-ginkaku-ji", { scope: "place", lat: 35.027, lon: 135.798, r: 30, label: "Ginkaku-ji, Kyoto", src: "https://en.wikipedia.org/wiki/Ginkaku-ji" });
TL.geo("w406-gyeyu-coup", { scope: "place", lat: 37.56, lon: 126.99, r: 40, label: "Seoul (Hanyang)", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w406-gyeongguk-daejeon", { scope: "place", lat: 37.56, lon: 126.99, r: 40, label: "Seoul (Hanyang)", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w406-suryavarman-i", { scope: "place", lat: 13.41, lon: 103.87, r: 40, label: "Angkor, Cambodia", src: "https://en.wikipedia.org/wiki/Angkor" });
TL.geo("w406-jayavarman-vii", { scope: "place", lat: 13.41, lon: 103.87, r: 40, label: "Angkor, Cambodia", src: "https://en.wikipedia.org/wiki/Angkor" });
TL.geo("w406-bayon", { scope: "place", lat: 13.441, lon: 103.859, r: 30, label: "Bayon, Angkor Thom", src: "https://en.wikipedia.org/wiki/Bayon" });
TL.geo("w406-theravada-state", { scope: "place", lat: 13.41, lon: 103.87, r: 40, label: "Angkor, Cambodia", src: "https://en.wikipedia.org/wiki/Angkor" });
TL.geo("w406-zhou-daguan", { scope: "place", lat: 13.41, lon: 103.87, r: 40, label: "Angkor, Cambodia", src: "https://en.wikipedia.org/wiki/Angkor" });
TL.geo("w406-kuti-rebellion", { scope: "place", lat: -7.54, lon: 112.39, r: 40, label: "Trowulan, East Java", src: "https://en.wikipedia.org/wiki/Trowulan" });
TL.geo("w406-bubat", { scope: "place", lat: -7.54, lon: 112.39, r: 40, label: "Trowulan, East Java", src: "https://en.wikipedia.org/wiki/Trowulan" });
TL.geo("w406-nagarakretagama", { scope: "place", lat: -7.54, lon: 112.39, r: 40, label: "Trowulan, East Java", src: "https://en.wikipedia.org/wiki/Trowulan" });
TL.geo("w406-regreg-war", { scope: "region", lat: -7.7, lon: 112.5, r: 150, label: "East Java", src: "https://en.wikipedia.org/wiki/East_Java" });
TL.geo("w406-girindrawardhana", { scope: "place", lat: -7.54, lon: 112.39, r: 40, label: "Trowulan, East Java", src: "https://en.wikipedia.org/wiki/Trowulan" });
