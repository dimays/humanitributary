// Fill-in W4-02: 1000–1500 — Judaism, Neo-Confucianism, Orthodoxy, Renaissance humanism, Zoroastrianism, Abbasids, Fatimids, Ilkhanate, Ottomans, Seljuks, Timurids and al-Andalus (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const UN = (n, title) => ({ t: `${title} — UNESCO World Heritage Centre`, u: `https://whc.unesco.org/en/list/${n}` });
const D = (y, m, d) => y + (Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5) + 0.5) / 365;

TL.add({ events: [
  // ---------- Judaism ----------
  { id: "w402-rhineland", branch: "judaism", y: 1096.4, when: "1096", title: "Crusaders massacre the Jews of the Rhineland",
    text: "Bands of crusaders led by Count Emicho attacked Jewish communities in Speyer, Worms and Mainz and other Rhenish towns. Britannica calls the killings a pivotal moment in the history of antisemitism.", imp: 2, link: "catholicism",
    cites: [B("event/First-Crusade", "First Crusade"), W("Rhineland_massacres", "Rhineland massacres")] },
  { id: "w402-mishneh-torah", branch: "judaism", y: 1170, end: 1180, when: "1170–1180", title: "Maimonides compiles the Mishneh Torah",
    text: "Living in Egypt, Maimonides compiled a fourteen-book code of Jewish law. It is regarded as his magnum opus.", imp: 2,
    cites: [B("biography/Moses-Maimonides", "Moses Maimonides"), W("Mishneh_Torah", "Mishneh Torah")] },
  { id: "w402-zohar", branch: "judaism", y: 1270, end: 1305, when: "13th century (authorship debated)", title: "The Zohar appears in Spain",
    text: "The “Book of Splendor,” the classic text of Kabbala, is a 13th-century work mostly in Aramaic. Modern scholars credit Moses de León (d. 1305) with most of it, though it names the 2nd-century sage Simeon ben Yohai.", imp: 2,
    cites: [B("topic/Sefer-ha-Zohar", "Sefer ha-zohar"), B("biography/Moses-de-Leon", "Moses de León")] },
  { id: "w402-expulsion-england", branch: "judaism", y: D(1290, 7, 18), when: "July 18, 1290", title: "Edward I expels the Jews of England",
    text: "A royal edict ordered all Jews out of England by All Saints' Day, November 1, 1290. It was the first time a European state is known to have permanently banned their presence.", imp: 2,
    cites: [W("Edict_of_Expulsion", "Edict of Expulsion"), { t: "Jews in England in 1290 — The National Archives", u: "https://www.nationalarchives.gov.uk/education/teaching-resources/jews-in-england-in-1290/" }] },

  // ---------- Neo-Confucianism ----------
  { id: "w402-white-deer", branch: "neo-confucianism", y: 1179, end: 1180, when: "1179–1180", title: "Zhu Xi rebuilds the White Deer Grotto Academy",
    text: "Zhu Xi reestablished the academy in 1179. Its prestige lasted eight centuries and it became a model for schools across East Asia.", imp: 3,
    cites: [B("topic/White-Deer-Grotto-Academy", "White Deer Grotto Academy"), W("White_Deer_Grotto_Academy", "White Deer Grotto Academy")] },
  { id: "w402-four-books-exams", branch: "neo-confucianism", y: 1313, when: "1313", title: "Zhu Xi's Four Books become the exam curriculum",
    text: "Under the Yuan dynasty, Zhu Xi's commentaries on the Four Books became the basis of the civil service examinations. They stayed so until the exams were abolished in 1905.", imp: 2,
    cites: [W("Zhu_Xi", "Zhu Xi"), B("biography/Zhu-Xi", "Zhu Xi")] },

  // ---------- Eastern Orthodox Church ----------
  { id: "w402-kyiv-lavra", branch: "orthodoxy", y: 1051, when: "1051 (the Primary Chronicle also gives 1074)", title: "Anthony founds the Kyiv Caves Monastery",
    text: "The monk Anthony, who had lived on Mount Athos, settled in an old cave in a hill near Kyiv. The Kyiv Pechersk Lavra grew from it into a preeminent center of Eastern Christianity in Rus'.", imp: 2,
    cites: [W("Kyiv_Pechersk_Lavra", "Kyiv Pechersk Lavra"), UN(527, "Kyiv: Saint-Sophia Cathedral and Related Monastic Buildings, Kyiv-Pechersk Lavra")] },
  { id: "w402-sava-autocephaly", branch: "orthodoxy", y: 1219, when: "1219", title: "Saint Sava wins Serbian church independence",
    text: "Sava traveled to Nicaea, where the exiled patriarch of Constantinople made him autocephalous archbishop of Serbia. The Serbian church became self-governing in 1219.", imp: 2,
    cites: [B("biography/Saint-Sava", "Saint Sava"), W("Serbian_Orthodox_Church", "Serbian Orthodox Church")] },
  { id: "w402-sergius-trinity", branch: "orthodoxy", y: 1337, when: "1337 (a spiritual center by 1354)", title: "Sergius of Radonezh founds the Trinity monastery",
    text: "Sergius settled in the forest of Radonezh, northeast of Moscow, in 1337. His retreat grew into the Trinity monastery, a center of Russian spiritual renewal, later the Trinity Lavra of St. Sergius.", imp: 2,
    cites: [B("biography/Saint-Sergius-of-Radonezh", "Saint Sergius of Radonezh"), W("Trinity_Lavra_of_St._Sergius", "Trinity Lavra of St. Sergius")] },
  { id: "w402-rublev-trinity", branch: "orthodoxy", y: 1411, end: 1427, when: "c. 1411–1427 (debated)", title: "Rublev paints the Trinity icon",
    text: "Rublev, regarded as one of the greatest medieval Russian icon painters, made the Holy Trinity icon. Britannica dates it about 1410; the official version gives 1411 or 1425–27.", imp: 2,
    cites: [B("topic/The-Old-Testament-Trinity", "The Old Testament Trinity"), W("Trinity_(Rublev)", "Trinity (Rublev)")] },
  { id: "w402-moscow-autocephaly", branch: "orthodoxy", y: 1448, when: "1448", title: "Russian bishops elect their own metropolitan",
    text: "A council of Russian bishops elected their own metropolitan without reference to Constantinople, in protest at the union signed at Florence. The Russian church then functioned independently.", imp: 2,
    cites: [W("Moscow_Patriarchate", "Moscow Patriarchate"), B("biography/Isidore-of-Kiev", "Isidore of Kiev")] },

  // ---------- Renaissance humanism ----------
  { id: "w402-petrarch-laureate", branch: "renaissance-humanism", y: D(1341, 4, 8), when: "April 8, 1341", title: "Petrarch is crowned poet laureate on the Capitol",
    text: "Petrarch became the second poet laureate since classical antiquity, crowned on Rome's Capitoline Hill. He had been honored for his Latin epic Africa.", imp: 2,
    cites: [W("Petrarch", "Petrarch"), B("biography/Petrarch/Moral-and-literary-evolution-1340-46", "Petrarch: Moral and literary evolution, 1340–46")] },
  { id: "w402-decameron", branch: "renaissance-humanism", y: 1349, end: 1353, when: "1349–1353", title: "Boccaccio writes the Decameron",
    text: "Boccaccio's hundred tales, told by ten young people who flee plague-stricken Florence, are regarded as a masterpiece of classical Italian prose.", imp: 2,
    cites: [B("biography/Giovanni-Boccaccio", "Giovanni Boccaccio"), B("topic/Decameron", "Decameron")] },
  { id: "w402-salutati", branch: "renaissance-humanism", y: 1375, when: "1375", title: "Salutati becomes chancellor of Florence",
    text: "The humanist Coluccio Salutati took the Florentine republic's top bureaucratic post and held it until 1406. His classical Latin letters earned him the nickname “Ape of Cicero.”", imp: 3,
    cites: [B("biography/Coluccio-Salutati", "Coluccio Salutati"), W("Coluccio_Salutati", "Coluccio Salutati")] },
  { id: "w402-chrysoloras", branch: "renaissance-humanism", y: 1397, when: "1397", title: "Chrysoloras begins teaching Greek in Florence",
    text: "The Byzantine scholar Manuel Chrysoloras taught Greek in Florence from 1397 to 1400. He is regarded as a pioneer in introducing ancient Greek literature to the West.", imp: 2, link: "byzantine",
    cites: [W("Manuel_Chrysoloras", "Manuel Chrysoloras"), B("biography/Manuel-Chrysoloras", "Manuel Chrysoloras")] },
  { id: "w402-valla-donation", branch: "renaissance-humanism", y: 1440, when: "1440", title: "Valla proves the Donation of Constantine a forgery",
    text: "Lorenzo Valla showed through linguistic analysis that the Latin of the Donation did not match the 4th century. His work undercut a document popes had cited for temporal power.", imp: 2,
    cites: [B("topic/Donation-of-Constantine", "Donation of Constantine"), W("Lorenzo_Valla", "Lorenzo Valla")] },
  { id: "w402-ficino-academy", branch: "renaissance-humanism", y: 1462, when: "c. 1462", title: "Ficino leads the Platonic Academy of Florence",
    text: "Cosimo de' Medici set Marsilio Ficino up in a villa near Careggi to study Greek and translate Plato. Around him gathered a circle known for a modernized, Christianized Platonism.", imp: 2,
    cites: [B("topic/Platonic-Academy", "Platonic Academy"), W("Platonic_Academy_of_Florence", "Platonic Academy of Florence")] },

  // ---------- Zoroastrianism ----------
  { id: "w402-iranshah-navsari", branch: "zoroastrianism", y: 1419, when: "1419", title: "The Iranshah fire moves to Navsari",
    text: "Priests moved the sacred Iranshah Atash Behram fire from Sanjan to Navsari in Gujarat, where it stayed for more than three centuries.", imp: 3,
    cites: [W("Iranshah_Atash_Behram", "Iranshah Atash Behram"), { t: "Udvada — Heritage Institute", u: "https://heritageinstitute.com/zoroastrianism/worship/udvada.htm" }] },
  { id: "w402-first-rivayat", branch: "zoroastrianism", y: 1478, when: "1478", title: "The first Rivayat letters reach the Parsis",
    text: "Nariman Hoshang of Broach brought the first Rivayat from Iran. Parsis and Iranian Zoroastrians exchanged letters on ritual and law until 1768, and 17 survive.", imp: 3,
    cites: [W("Rivayat", "Rivayat"), B("topic/Parsi", "Parsi")] },

  // ---------- Abbasid Caliphate ----------
  { id: "w402-canon-medicine", branch: "abbasid", y: 1025, when: "1025", title: "Ibn Sina completes the Canon of Medicine",
    text: "The Persian physician Avicenna (Ibn Sina), in the Islamic world of the Abbasid era, completed this five-book medical encyclopedia at Hamadan. It is considered one of the most important texts in the history of medicine.", imp: 1,
    cites: [B("topic/The-Canon-of-Medicine", "The Canon of Medicine"), W("The_Canon_of_Medicine", "The Canon of Medicine")] },
  { id: "w402-basasiri", branch: "abbasid", y: 1058.9, when: "1058", title: "Basasiri seizes Baghdad for the Fatimids",
    text: "The Turkish commander al-Basasiri, who backed the Fatimids when the Seljuks ousted the Buyids, conquered Baghdad and ruled it for almost a year.", imp: 3, link: "fatimid",
    cites: [B("place/Iraq/Iraq-from-1055-to-1534", "Iraq: from 1055 to 1534"), W("Al-Basasiri", "Al-Basasiri")] },
  { id: "w402-nizamiyya-baghdad", branch: "abbasid", y: 1065, end: 1067, when: "1065–1067", title: "The Nizamiyya college opens in Baghdad",
    text: "The Seljuk vizier Nizam al-Mulk founded Baghdad's Nizamiyya, the best known of the colleges named for him. Al-Ghazali later taught there, and the poet Sa'di studied there.", imp: 2, link: "seljuk",
    cites: [B("topic/Nizamiyyah", "Niẓāmīyyah"), W("Nizamiyya", "Nizamiyya")] },
  { id: "w402-ghazali-leaves", branch: "abbasid", y: 1095.9, when: "November 1095", title: "Al-Ghazali abandons his Baghdad chair for Sufism",
    text: "The Nizamiyya's leading professor left Baghdad after a spiritual crisis and took up a Sufi's life. His best-known work is the Revival of the Religious Sciences.", imp: 2,
    cites: [B("biography/al-Ghazali", "al-Ghazālī")] },
  { id: "w402-al-nasir", branch: "abbasid", y: 1180, end: 1225, when: "1180–1225", title: "Caliph al-Nasir revives Abbasid power",
    text: "Al-Nasir set about restoring the caliphate's temporal power, especially in the east. He was the last powerful Abbasid caliph before the Mongols destroyed the dynasty.", imp: 2,
    cites: [B("biography/al-Nasir", "al-Nāṣir"), W("Al-Nasir_li-Din_Allah", "Al-Nasir li-Din Allah")] },
  { id: "w402-maqamat-wasiti", branch: "abbasid", y: 1237, when: "1237", title: "Al-Wasiti illustrates al-Hariri's Maqamat in Baghdad",
    text: "Yahya ibn Mahmud al-Wasiti copied and illustrated al-Hariri's Maqamat in 1237. The manuscript, now in Paris, is among the most famous illustrated copies of the work.", imp: 2,
    cites: [B("biography/al-Hariri", "al-Ḥarīrī"), W("Maqamat_al-Hariri", "Maqamat al-Hariri")] },

  // ---------- Fatimid Caliphate ----------
  { id: "w402-optics", branch: "fatimid", y: 1011, end: 1021, when: "1011–1021", title: "Ibn al-Haytham writes the Book of Optics in Cairo",
    text: "Alhazen's Kitab al-Manazir, known in a Latin edition, shaped the study of vision and light for centuries.", imp: 1,
    cites: [W("Ibn_al-Haytham", "Ibn al-Haytham"), B("biography/Ibn-al-Haytham", "Ibn al-Haytham")] },
  { id: "w402-hakim-vanishes", branch: "fatimid", y: D(1021, 2, 13), when: "night of February 12–13, 1021", title: "Caliph al-Hakim vanishes",
    text: "Al-Hakim, known for eccentricity and persecutions, left for a night walk in the Muqattam hills and never returned. The Druze religion developed from teaching about him.", imp: 2,
    cites: [B("biography/al-Hakim", "al-Ḥākim"), W("Al-Hakim_bi-Amr_Allah", "Al-Hakim bi-Amr Allah")] },
  { id: "w402-badr-jamali", branch: "fatimid", y: 1073, when: "1073", title: "Badr al-Jamali seizes power in Cairo",
    text: "The soldier Badr al-Jamali came to Cairo at the caliph's invitation and took control in one night. He took the titles of commander of the armies and director of the missionaries.", imp: 2,
    cites: [B("biography/Badr-al-Jamali", "Badr al-Jamālī")] },
  { id: "w402-aqmar-mosque", branch: "fatimid", y: 1125, when: "1125", title: "The al-Aqmar Mosque is completed",
    text: "Built by the vizier al-Ma'mun al-Bata'ihi, the Cairo neighborhood mosque is known for the exceptional decoration of its facade, a landmark of Fatimid architecture.", imp: 3,
    cites: [B("topic/al-Aqmar-Mosque", "Al-Aqmar Mosque"), W("Al-Aqmar_Mosque", "Al-Aqmar Mosque")] },

  // ---------- Ilkhanate ----------
  { id: "w402-jami-tawarikh", branch: "ilkhanate", y: 1306, end: 1311, when: "c. 1306–1311", title: "Rashid al-Din writes the Jami al-tawarikh",
    text: "The Ilkhanid vizier Rashid al-Din produced a universal history, the Compendium of Chronicles. Its illustrated manuscripts are the largest surviving body of early Persian miniature painting.", imp: 1,
    cites: [B("biography/Rashid-al-Din", "Rashīd al-Dīn"), W("Jami_al-tawarikh", "Jami al-tawarikh")] },
  { id: "w402-soltaniyeh", branch: "ilkhanate", y: 1304, end: 1316, when: "1304–1316", title: "Öljeitü builds Soltaniyeh as his capital",
    text: "Öljeitü moved the Ilkhanid capital to Soltaniyeh. His mausoleum there is practically the only Ilkhanid architecture that remains.", imp: 2,
    cites: [B("biography/Oljeitu", "Öljeitü"), B("topic/Soltaniyeh", "Solṭānīyeh")] },

  // ---------- Ottoman Empire ----------
  { id: "w402-bursa", branch: "ottoman", y: 1326, when: "1326", title: "Orhan takes Bursa and makes it capital",
    text: "The Ottomans captured Byzantine Bursa after a long siege. Orhan made it the first official Ottoman capital, which it stayed until Edirne replaced it in 1366.", imp: 2,
    cites: [W("Siege_of_Bursa", "Siege of Bursa"), B("topic/Bursa-Turkey", "Bursa")] },
  { id: "w402-gallipoli", branch: "ottoman", y: 1354.2, when: "March 1354 (Britannica gives c. 1356)", title: "Ottomans seize Gallipoli, their first foothold in Europe",
    text: "An earthquake on March 1–2, 1354 wrecked Gallipoli's walls, and within a month the Ottomans took it, per Wikipedia; Britannica dates the first Ottoman conquest in Europe c. 1356. It became their staging area for Balkan expansion.", imp: 2, link: "byzantine",
    cites: [W("Gallipoli", "Gallipoli"), B("place/Gallipoli-Turkey", "Gallipoli")] },
  { id: "w402-kosovo-1389", branch: "ottoman", y: 1389.48, when: "June 1389 (traditionally June 28)", title: "Battle of Kosovo: Murad I killed",
    text: "Ottoman and Serbian armies fought on the Kosovo field. Both Prince Lazar and Sultan Murad I were killed.", imp: 2,
    cites: [B("biography/Murad-I", "Murad I"), W("Battle_of_Kosovo", "Battle of Kosovo")] },
  { id: "w402-nicopolis", branch: "ottoman", y: D(1396, 9, 25), when: "September 25, 1396", title: "Bayezid crushes the crusaders at Nicopolis",
    text: "A Hungarian-led crusade met Bayezid I at Nicopolis on the Danube and was routed.", imp: 2,
    cites: [B("event/Battle-of-Nicopolis", "Battle of Nicopolis"), B("biography/Bayezid-I", "Bayezid I")] },
  { id: "w402-green-mosque", branch: "ottoman", y: 1412, end: 1420, when: "1412 – c. 1419–1421", title: "The Green Mosque rises in Bursa",
    text: "Sultan Mehmed I commissioned the Green Mosque after reuniting the empire. Construction began in 1412; an inscription dates completion to about December 1419, while Britannica gives 1421.", imp: 3,
    cites: [W("Green_Mosque_(Bursa)", "Green Mosque (Bursa)"), B("place/Yesil-Mosque", "Yeşil Mosque")] },
  { id: "w402-varna", branch: "ottoman", y: D(1444, 11, 10), when: "November 10, 1444", title: "Murad II wins at Varna",
    text: "Murad II returned from abdication and beat a largely Hungarian force at Varna, ending European efforts to save Constantinople for a time.", imp: 2,
    cites: [B("event/Battle-of-Varna", "Battle of Varna"), B("biography/Murad-II", "Murad II")] },

  // ---------- Seljuk Empire ----------
  { id: "w402-jalali-calendar", branch: "seljuk", y: D(1079, 3, 15), when: "March 15, 1079", title: "Malik-Shah adopts the Jalali calendar",
    text: "On the advice of a committee of astronomers that included Omar Khayyam, Sultan Malik-Shah adopted a solar calendar. His reign is remembered for this reform and for Khayyam's poetry.", imp: 2,
    cites: [W("Jalali_calendar", "Jalali calendar"), B("biography/Malik-Shah", "Malik-Shah")] },
  { id: "w402-qatwan", branch: "seljuk", y: D(1141, 9, 9), when: "September 9, 1141", title: "Sanjar defeated at Qatwan by the Qara Khitai",
    text: "Sultan Sanjar suffered a terrible defeat near Samarkand. Transoxania was lost and the Qara Khitai established a distant suzerainty over Khwarazm.", imp: 2,
    cites: [B("biography/Sanjar", "Sanjar"), W("Seljuk_Empire", "Seljuk Empire")] },
  { id: "w402-sanjar-captured", branch: "seljuk", y: 1153, when: "1153", title: "Oghuz tribes capture Sultan Sanjar",
    text: "The Oghuz, who had been instruments of the Seljuk conquests, rose in revolt and held the old sultan prisoner for two years. He escaped but died without having restored his authority.", imp: 3,
    cites: [B("biography/Sanjar", "Sanjar")] },
  { id: "w402-rumi-dies", branch: "ilkhanate", y: D(1273, 12, 17), when: "December 17, 1273", title: "Rumi dies in Konya",
    text: "The Sufi poet Rumi died in Konya, in the Seljuk Sultanate of Rum, which had been a Mongol vassal of the Ilkhanate since 1243. Britannica calls him the greatest Sufi mystic and poet in Persian; he is regarded as founder of the Mevlevi Order.", imp: 1,
    cites: [B("biography/Rumi", "Rūmī"), W("Rumi", "Rumi"), W("Sultanate_of_Rum", "Sultanate of Rum")] },

  // ---------- Timurid Empire ----------
  { id: "w402-bibi-khanym", branch: "timurid", y: 1399, end: 1404, when: "from 1399", title: "Timur builds the Bibi-Khanym Mosque",
    text: "After his 1399 Indian campaign, Timur ordered a gigantic mosque for his capital Samarkand. It is considered a masterpiece of the Timurid Renaissance.", imp: 2,
    cites: [W("Bibi-Khanym_Mosque", "Bibi-Khanym Mosque"), UN(603, "Samarkand – Crossroad of Cultures")] },
  { id: "w402-registan-madrasa", branch: "timurid", y: 1417, end: 1421, when: "1417–1421", title: "Ulugh Beg builds his madrasa on the Registan",
    text: "Timur's grandson, then governor of Samarkand, built a madrasa that forms part of the Registan, the old heart of the city.", imp: 2,
    cites: [W("Ulugh_Beg_Madrasa", "Ulugh Beg Madrasa"), UN(603, "Samarkand – Crossroad of Cultures")] },
  { id: "w402-ulugh-beg-observatory", branch: "timurid", y: 1428, when: "begun 1428", title: "Ulugh Beg's observatory at Samarkand",
    text: "Ulugh Beg built an observatory and found errors in the computations of the 2nd-century Alexandrian astronomer. Its Zij-i Sultani star catalogue was published in 1438–39.", imp: 2,
    cites: [B("biography/Ulugh-Beg", "Ulugh Beg"), W("Zij-i-Sultani", "Zij-i Sultani")] },
  { id: "w402-herat-bayqara", branch: "timurid", y: 1469, end: 1506, when: "1469–1506", title: "Herat's golden age under Husayn Bayqara",
    text: "Under Sultan Husayn Bayqara, Herat's court fostered Persian and Turkish letters through his minister Navoi. The painter Bihzad led the city's school of miniature painting.", imp: 2,
    cites: [B("biography/Husayn-Bayqara", "Ḥusayn Bayqarah"), W("Herat", "Herat")] },

  // ---------- al-Andalus ----------
  { id: "w402-madinat-sacked", branch: "al-andalus", y: 1010, end: 1013, when: "1010–1013", title: "Madinat al-Zahra is sacked in civil war",
    text: "During the civil war that ended the Caliphate of Córdoba, the palace-city outside Córdoba was sacked and then abandoned. Its materials were reused elsewhere.", imp: 3,
    cites: [W("Medina_Azahara", "Medina Azahara"), B("place/Madinat-al-Zahra", "Madīnat al-Zahrāʾ"), UN(1560, "Caliphate City of Medina Azahara")] },
  { id: "w402-ring-of-dove", branch: "al-andalus", y: 1022, end: 1027, when: "between 1022 and 1027", title: "Ibn Hazm writes The Ring of the Dove",
    text: "The Córdoba-born scholar Ibn Hazm wrote a treatise on the art of love in prose and poetry. It is one of the best-known works of Andalusi literature.", imp: 2,
    cites: [B("biography/Ibn-Hazm", "Ibn Ḥazm"), W("Ibn_Hazm", "Ibn Hazm")] },
  { id: "w402-zallaqa", branch: "al-andalus", y: D(1086, 10, 23), when: "October 23, 1086", title: "Almoravids halt Castile at al-Zallaqa",
    text: "As Toledo fell to Castile, Yusuf ibn Tashufin defeated Alfonso VI near Badajoz. The Almoravids then took over most of Muslim Spain by 1090.", imp: 2, link: "asturias-leon",
    cites: [B("topic/Almoravids", "Almoravids"), W("Battle_of_Sagrajas", "Battle of Sagrajas")] },
  { id: "w402-cid-valencia", branch: "al-andalus", y: D(1094, 6, 17), when: "June 17, 1094", title: "El Cid takes Valencia",
    text: "Rodrigo Díaz de Vivar took the taifa of Valencia and ruled it until his death in 1099. His career crossed the lines between Christian and Muslim rulers.", imp: 2,
    cites: [W("El_Cid", "El Cid"), B("biography/El-Cid-Castilian-military-leader", "El Cid"), B("event/Conquest-of-Valencia", "Conquest of Valencia (1094)")] },
  { id: "w402-almohads-1147", branch: "al-andalus", y: 1147, when: "1147", title: "Almohads topple the Almoravids",
    text: "The Almohads took Marrakech in 1147 and then pressed into Spain. Seville surrendered to them in 1172 and Almohad rule spread over the rest of Islamic Spain.", imp: 2,
    cites: [B("topic/Almohads", "Almohads")] },
  { id: "w402-ibn-rushd-dies", branch: "al-andalus", y: 1198, when: "1198", title: "Ibn Rushd (Averroes) dies in Marrakech",
    text: "The Córdoba-born philosopher wrote commentaries on Aristotle at the Almohad caliph's request. Translated into Latin and Hebrew, they made him “The Commentator” in the West.", imp: 2,
    cites: [B("biography/Averroes", "Averroës"), W("Averroes", "Averroes")] },
  { id: "w402-alarcos", branch: "al-andalus", y: D(1195, 7, 18), when: "July 18, 1195", title: "Almohads crush Castile at Alarcos",
    text: "The Almohad caliph Abu Yusuf Yaqub al-Mansur routed Alfonso VIII's army in a celebrated victory in Muslim Spain.", imp: 3,
    cites: [B("event/Battle-of-Alarcos", "Battle of Alarcos")] },
  { id: "w402-las-navas", branch: "al-andalus", y: D(1212, 7, 16), when: "July 16, 1212", title: "Las Navas de Tolosa breaks Almohad power",
    text: "A crusade backed by Pope Innocent III and led by Castile, Aragon and Navarre severely defeated the Almohads. The Nasrids later rose from the ruin of Almohad rule.", imp: 1, link: "castile",
    cites: [B("event/Battle-of-Las-Navas-de-Tolosa", "Battle of Las Navas de Tolosa"), B("topic/Nasrid-dynasty", "Nasrid dynasty")] },
  { id: "w402-cordoba-1236", branch: "al-andalus", y: 1236, when: "1236", title: "Ferdinand III takes Córdoba; the Great Mosque becomes a cathedral",
    text: "Castile conquered the old caliphal capital. Its Great Mosque was converted into a cathedral under Ferdinand III.", imp: 2, link: "castile",
    cites: [B("biography/Ferdinand-III-king-of-Castile-and-Leon", "Ferdinand III"), UN(313, "Historic Centre of Cordoba")] },
  { id: "w402-nasrid-alhambra", branch: "al-andalus", y: 1238, when: "1238", title: "Muhammad I founds Nasrid Granada and begins the Alhambra",
    text: "Muhammad I ibn al-Ahmar founded the Emirate of Granada, the last Muslim state of al-Andalus. He began the Alhambra, which became the best example of Nasrid art.", imp: 1,
    cites: [B("topic/Nasrid-dynasty", "Nasrid dynasty"), W("Alhambra", "Alhambra"), UN(314, "Alhambra, Generalife and Albayzín, Granada")] },
  { id: "w402-court-of-lions", branch: "al-andalus", y: 1362, end: 1391, when: "1362–1391", title: "Muhammad V builds the Court of the Lions",
    text: "The Nasrid sultan Muhammad V commissioned the Palace of the Lions in the heart of the Alhambra, built between 1362 and 1391. It is one of the most famous palaces in Islamic architecture.", imp: 2,
    cites: [W("Court_of_the_Lions", "Court of the Lions"), UN(314, "Alhambra, Generalife and Albayzín, Granada")] },
] });

TL.geo("w402-rhineland", { scope: "place", lat: 50.0, lon: 8.27, r: 80, label: "Mainz, Germany", src: "https://en.wikipedia.org/wiki/Mainz" });
TL.geo("w402-mishneh-torah", { scope: "place", lat: 30.0, lon: 31.23, r: 40, label: "Fustat, Egypt", src: "https://en.wikipedia.org/wiki/Fustat" });
TL.geo("w402-zohar", { scope: "place", lat: 40.63, lon: -3.17, r: 60, label: "Guadalajara, Spain", src: "https://en.wikipedia.org/wiki/Guadalajara,_Spain" });
TL.geo("w402-expulsion-england", { scope: "region", lat: 53.13, lon: -1.38, r: 400, label: "England", src: "https://en.wikipedia.org/wiki/England" });
TL.geo("w402-white-deer", { scope: "place", lat: 29.56, lon: 115.99, r: 50, label: "Mount Lu, Jiangxi, China", src: "https://en.wikipedia.org/wiki/Mount_Lu" });
TL.geo("w402-four-books-exams", { scope: "region", lat: 35, lon: 103, r: 2200, label: "China (Yuan dynasty)", src: "https://en.wikipedia.org/wiki/China" });
TL.geo("w402-kyiv-lavra", { scope: "place", lat: 50.43, lon: 30.56, r: 30, label: "Kyiv, Ukraine", src: "https://en.wikipedia.org/wiki/Kyiv_Pechersk_Lavra" });
TL.geo("w402-sava-autocephaly", { scope: "place", lat: 40.43, lon: 29.72, r: 40, label: "Nicaea (İznik), Turkey", src: "https://en.wikipedia.org/wiki/%C4%B0znik" });
TL.geo("w402-sergius-trinity", { scope: "place", lat: 56.31, lon: 38.13, r: 40, label: "Sergiyev Posad, Russia", src: "https://en.wikipedia.org/wiki/Sergiyev_Posad" });
TL.geo("w402-rublev-trinity", { scope: "place", lat: 56.31, lon: 38.13, r: 40, label: "Sergiyev Posad, Russia", src: "https://en.wikipedia.org/wiki/Sergiyev_Posad" });
TL.geo("w402-moscow-autocephaly", { scope: "place", lat: 55.76, lon: 37.62, r: 50, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("w402-petrarch-laureate", { scope: "place", lat: 41.89, lon: 12.48, r: 30, label: "Capitoline Hill, Rome", src: "https://en.wikipedia.org/wiki/Capitoline_Hill" });
TL.geo("w402-decameron", { scope: "place", lat: 43.77, lon: 11.26, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w402-salutati", { scope: "place", lat: 43.77, lon: 11.26, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w402-chrysoloras", { scope: "place", lat: 43.77, lon: 11.26, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w402-valla-donation", { scope: "region", lat: 43, lon: 12, r: 600, label: "Italy", src: "https://en.wikipedia.org/wiki/Italy" });
TL.geo("w402-ficino-academy", { scope: "place", lat: 43.77, lon: 11.26, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w402-iranshah-navsari", { scope: "place", lat: 20.95, lon: 72.93, r: 40, label: "Navsari, India", src: "https://en.wikipedia.org/wiki/Navsari" });
TL.geo("w402-first-rivayat", { scope: "place", lat: 21.71, lon: 72.99, r: 40, label: "Bharuch (Broach), India", src: "https://en.wikipedia.org/wiki/Bharuch" });
TL.geo("w402-canon-medicine", { scope: "place", lat: 34.8, lon: 48.51, r: 50, label: "Hamadan, Iran", src: "https://en.wikipedia.org/wiki/Hamadan" });
TL.geo("w402-basasiri", { scope: "place", lat: 33.32, lon: 44.37, r: 50, label: "Baghdad, Iraq", src: "https://en.wikipedia.org/wiki/Baghdad" });
TL.geo("w402-nizamiyya-baghdad", { scope: "place", lat: 33.32, lon: 44.37, r: 50, label: "Baghdad, Iraq", src: "https://en.wikipedia.org/wiki/Baghdad" });
TL.geo("w402-ghazali-leaves", { scope: "place", lat: 33.32, lon: 44.37, r: 50, label: "Baghdad, Iraq", src: "https://en.wikipedia.org/wiki/Baghdad" });
TL.geo("w402-al-nasir", { scope: "place", lat: 33.32, lon: 44.37, r: 50, label: "Baghdad, Iraq", src: "https://en.wikipedia.org/wiki/Baghdad" });
TL.geo("w402-maqamat-wasiti", { scope: "place", lat: 33.32, lon: 44.37, r: 50, label: "Baghdad, Iraq", src: "https://en.wikipedia.org/wiki/Baghdad" });
TL.geo("w402-optics", { scope: "place", lat: 30.04, lon: 31.24, r: 40, label: "Cairo, Egypt", src: "https://en.wikipedia.org/wiki/Cairo" });
TL.geo("w402-hakim-vanishes", { scope: "place", lat: 30.04, lon: 31.24, r: 40, label: "Cairo, Egypt", src: "https://en.wikipedia.org/wiki/Cairo" });
TL.geo("w402-badr-jamali", { scope: "place", lat: 30.04, lon: 31.24, r: 40, label: "Cairo, Egypt", src: "https://en.wikipedia.org/wiki/Cairo" });
TL.geo("w402-aqmar-mosque", { scope: "place", lat: 30.05, lon: 31.26, r: 30, label: "Cairo, Egypt", src: "https://en.wikipedia.org/wiki/Al-Aqmar_Mosque" });
TL.geo("w402-jami-tawarikh", { scope: "region", lat: 36, lon: 50, r: 900, label: "Ilkhanate, Persia", src: "https://en.wikipedia.org/wiki/Ilkhanate" });
TL.geo("w402-soltaniyeh", { scope: "place", lat: 36.43, lon: 48.8, r: 40, label: "Soltaniyeh, Iran", src: "https://en.wikipedia.org/wiki/Soltaniyeh" });
TL.geo("w402-bursa", { scope: "place", lat: 40.2, lon: 29.06, r: 50, label: "Bursa, Turkey", src: "https://en.wikipedia.org/wiki/Bursa" });
TL.geo("w402-gallipoli", { scope: "place", lat: 40.35, lon: 26.45, r: 50, label: "Gallipoli, Turkey", src: "https://en.wikipedia.org/wiki/Gallipoli" });
TL.geo("w402-kosovo-1389", { scope: "place", lat: 42.72, lon: 21.09, r: 40, label: "Kosovo Polje", src: "https://en.wikipedia.org/wiki/Battle_of_Kosovo" });
TL.geo("w402-nicopolis", { scope: "place", lat: 43.7, lon: 24.89, r: 50, label: "Nikopol, Bulgaria", src: "https://en.wikipedia.org/wiki/Nikopol,_Bulgaria" });
TL.geo("w402-green-mosque", { scope: "place", lat: 40.2, lon: 29.06, r: 30, label: "Bursa, Turkey", src: "https://en.wikipedia.org/wiki/Bursa" });
TL.geo("w402-varna", { scope: "place", lat: 43.22, lon: 27.92, r: 50, label: "Varna, Bulgaria", src: "https://en.wikipedia.org/wiki/Varna,_Bulgaria" });
TL.geo("w402-jalali-calendar", { scope: "place", lat: 32.67, lon: 51.67, r: 50, label: "Isfahan, Iran", src: "https://en.wikipedia.org/wiki/Isfahan" });
TL.geo("w402-qatwan", { scope: "place", lat: 39.65, lon: 66.98, r: 80, label: "Samarkand, Uzbekistan", src: "https://en.wikipedia.org/wiki/Samarkand" });
TL.geo("w402-sanjar-captured", { scope: "place", lat: 37.66, lon: 62.19, r: 80, label: "Merv, Turkmenistan", src: "https://en.wikipedia.org/wiki/Merv" });
TL.geo("w402-rumi-dies", { scope: "place", lat: 37.87, lon: 32.48, r: 40, label: "Konya, Turkey", src: "https://en.wikipedia.org/wiki/Konya" });
TL.geo("w402-bibi-khanym", { scope: "place", lat: 39.65, lon: 66.98, r: 40, label: "Samarkand, Uzbekistan", src: "https://en.wikipedia.org/wiki/Samarkand" });
TL.geo("w402-registan-madrasa", { scope: "place", lat: 39.65, lon: 66.98, r: 40, label: "Samarkand, Uzbekistan", src: "https://en.wikipedia.org/wiki/Samarkand" });
TL.geo("w402-ulugh-beg-observatory", { scope: "place", lat: 39.65, lon: 66.98, r: 40, label: "Samarkand, Uzbekistan", src: "https://en.wikipedia.org/wiki/Samarkand" });
TL.geo("w402-herat-bayqara", { scope: "place", lat: 34.34, lon: 62.2, r: 50, label: "Herat, Afghanistan", src: "https://en.wikipedia.org/wiki/Herat" });
TL.geo("w402-madinat-sacked", { scope: "place", lat: 37.89, lon: -4.87, r: 30, label: "Madinat al-Zahra, Córdoba", src: "https://en.wikipedia.org/wiki/Medina_Azahara" });
TL.geo("w402-ring-of-dove", { scope: "place", lat: 39.0, lon: -0.52, r: 40, label: "Xàtiva, Spain", src: "https://en.wikipedia.org/wiki/X%C3%A0tiva" });
TL.geo("w402-zallaqa", { scope: "place", lat: 38.88, lon: -6.97, r: 50, label: "Badajoz, Spain", src: "https://en.wikipedia.org/wiki/Badajoz" });
TL.geo("w402-cid-valencia", { scope: "place", lat: 39.47, lon: -0.38, r: 50, label: "Valencia, Spain", src: "https://en.wikipedia.org/wiki/Valencia" });
TL.geo("w402-almohads-1147", { scope: "place", lat: 31.63, lon: -8.0, r: 60, label: "Marrakech, Morocco", src: "https://en.wikipedia.org/wiki/Marrakesh" });
TL.geo("w402-ibn-rushd-dies", { scope: "place", lat: 31.63, lon: -8.0, r: 60, label: "Marrakech, Morocco", src: "https://en.wikipedia.org/wiki/Marrakesh" });
TL.geo("w402-alarcos", { scope: "place", lat: 38.98, lon: -3.92, r: 40, label: "Ciudad Real, Spain", src: "https://en.wikipedia.org/wiki/Ciudad_Real" });
TL.geo("w402-las-navas", { scope: "place", lat: 38.35, lon: -3.62, r: 40, label: "Las Navas de Tolosa, Spain", src: "https://en.wikipedia.org/wiki/Battle_of_Las_Navas_de_Tolosa" });
TL.geo("w402-cordoba-1236", { scope: "place", lat: 37.89, lon: -4.78, r: 40, label: "Córdoba, Spain", src: "https://en.wikipedia.org/wiki/C%C3%B3rdoba,_Spain" });
TL.geo("w402-nasrid-alhambra", { scope: "place", lat: 37.18, lon: -3.59, r: 40, label: "Granada, Spain", src: "https://en.wikipedia.org/wiki/Alhambra" });
TL.geo("w402-court-of-lions", { scope: "place", lat: 37.18, lon: -3.59, r: 30, label: "Alhambra, Granada", src: "https://en.wikipedia.org/wiki/Alhambra" });
