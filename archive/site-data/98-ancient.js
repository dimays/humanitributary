// Night N-98: new ancient/medieval branches — Erlitou, Zagwe, Neo-Inca State, Sultanate of Rum, Goths. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const D = (y, m, d) => y + (Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5) + 0.5) / 365;

TL.add({
  branches: [
    { id: "erlitou", name: "Erlitou culture", region: "eastasia",
      start: -1900, end: -1530, startWhen: "c. 1900 BCE (Britannica and early estimates; radiocarbon studies since 2007 give c. 1750 BCE)", endWhen: "c. 1530 BCE (Wikipedia, radiocarbon-based; Britannica gives 1350 BCE)",
      parents: [], into: ["shang"],
      text: "Bronze Age culture of the Yi–Luo valley in Henan, with palaces and the earliest large-scale bronze workshops in China. Chinese archaeologists generally link it to the Xia dynasty; some Western scholars call that premature.",
      cites: [B("topic/Erlitou-culture", "Erlitou culture"), W("Erlitou_culture", "Erlitou culture")] },
    { id: "zagwe", name: "Zagwe dynasty", region: "africa",
      start: 1137, end: 1270, startWhen: "1137 (some sources date its start to c. 900–930)", endWhen: "1270",
      parents: [], into: ["ethiopia"],
      text: "Agaw-descended Christian kings who moved the Ethiopian seat to Lasta, with a capital at Roha (now Lalibela). Remembered for rock-hewn churches; overthrown in 1270 by Yekuno Amlak, who founded the Solomonic line.",
      cites: [B("topic/Zagwe-dynasty", "Zagwe dynasty"), W("Zagwe_dynasty", "Zagwe dynasty")] },
    { id: "neo-inca", name: "Neo-Inca State", region: "americas",
      start: 1537, end: 1572, startWhen: "1537", endWhen: "1572",
      parents: [], into: ["viceroyalty-peru"],
      text: "Inca holdout founded when Manco Inca withdrew to the forests of Vilcabamba after his 1536 rebellion. It lasted until Viceroy Toledo's troops took Vilcabamba and executed Túpac Amaru in 1572.",
      cites: [W("Neo-Inca_State", "Neo-Inca State"), B("place/Peru/Discovery-and-exploration-by-Europeans", "Peru: Discovery and exploration by Europeans")] },
    { id: "sultanate-of-rum", name: "Sultanate of Rum", region: "mideast",
      start: 1077, end: 1308, startWhen: "1077 (Britannica: c. 1075–1080)", endWhen: "1308 (some lists give 1307)",
      parents: ["seljuk"], into: [],
      text: "Seljuk Turkic state in Anatolia, capital at Nicaea and then Konya from 1097. It reached its height in the early 13th century, became a Mongol vassal after 1243 and ended with Mesud II's death.",
      cites: [B("topic/Sultanate-of-Rum", "Sultanate of Rūm"), W("Sultanate_of_Rum", "Sultanate of Rum")] },
    { id: "goths", name: "Goths", region: "europe",
      start: 100, end: 554, startWhen: "c. 1st–2nd century CE (Gutones in Roman sources; link to later Goths debated)", endWhen: "554 (end of Ostrogothic Italy; the Visigoths continued)",
      parents: [], into: ["visigoths"],
      text: "Germanic people reported by Jordanes to have come from Scandinavia. They reached the Black Sea, raided the Roman Empire, and split into Visigoths and Ostrogoths; Theodoric's Ostrogothic Italy fell to Justinian.",
      cites: [B("topic/Goth", "Goth"), W("Goths", "Goths")] },
  ],
  events: [
    // ---------- Erlitou ----------
    { id: "n98-erlitou-first-state", branch: "erlitou", y: -1750, when: "c. 1900–1350 BCE (Britannica); c. 1750 BCE (radiocarbon)", title: "Erlitou, China's first state-level society?",
      text: "Britannica calls the Erlitou culture the first state-level society in China, with palaces, royal tombs and paved roads. Radiocarbon studies place its core at about 1750–1500 BCE.", imp: 1,
      cites: [B("topic/Erlitou-culture", "Erlitou culture"), W("Erlitou_culture", "Erlitou culture")] },
    { id: "n98-erlitou-proto-writing", branch: "erlitou", y: -1750, when: "Erlitou period", title: "Pottery marks that may be proto-writing",
      text: "Symbols incised on Erlitou pottery are considered markings or proto-writing. No clear link to later Chinese characters has been proven.", imp: 3,
      cites: [W("Erlitou_culture", "Erlitou culture")] },
    { id: "n98-erlitou-city-grows", branch: "erlitou", y: -1700, when: "Phase II (within c. 1750–1500 BCE)", title: "Erlitou grows into a city with a palace zone and foundry",
      text: "In its second phase Erlitou reached about 300 hectares and roughly 11,000 people, with a walled palace area and a bronze foundry to the south. By phase III its population peaked near 24,000.", imp: 2,
      cites: [W("Erlitou_culture", "Erlitou culture")] },
    { id: "n98-erlitou-bronze", branch: "erlitou", y: -1600, when: "Phases III–IV", title: "Erlitou casts China's earliest ritual bronzes",
      text: "Wikipedia calls Erlitou the earliest large-scale bronze-producing culture in China, and its earliest bronze ding comes from phase IV. Britannica says its simple ritual bronzes are the earliest yet found in China.", imp: 1,
      cites: [W("Erlitou_culture", "Erlitou culture"), B("topic/history-of-China/The-first-historical-dynasty-the-Shang", "History of China: The first historical dynasty, the Shang")] },
    { id: "n98-erlitou-turquoise", branch: "erlitou", y: -1650, when: "Erlitou period", title: "Turquoise-inlaid bronze plaques and ceremonial jades",
      text: "Erlitou artisans inlaid bronze plaques with turquoise, and an Erlitou axe is dated 1800–1500 BCE. Jade ritual blades and a jade dagger-axe were also made.", imp: 2,
      cites: [W("Erlitou_culture", "Erlitou culture"), { t: "The Erlitou Site in Yanshi: A 'Dynasty' in a Small Village — Henan Provincial Government", u: "https://english.henan.gov.cn/2021/10-04/2322979.html" }] },
    { id: "n98-yanshi-city", branch: "erlitou", y: -1600, when: "c. 1600 BCE", title: "Walled city built at Yanshi, near Erlitou",
      text: "Around 1600 BCE a walled city was built at Yanshi, about 6 km northeast of Erlitou. Britannica dates its rammed-earth fortification to the Erligang period, and its dynastic affiliation is not firmly established.", imp: 2, link: "shang",
      cites: [W("Erlitou_culture", "Erlitou culture"), B("topic/history-of-China/The-first-historical-dynasty-the-Shang", "History of China: The first historical dynasty, the Shang")] },
    { id: "n98-erlitou-abandoned", branch: "erlitou", y: -1450, end: -1300, when: "c. 1450–1300 BCE", title: "Erlitou's palaces are abandoned",
      text: "During the Upper Erligang phase, all the palaces were abandoned and the site shrank to a village of about 30 hectares.", imp: 3, link: "shang",
      cites: [W("Erlitou_culture", "Erlitou culture")] },

    // ---------- Zagwe ----------
    { id: "n98-zagwe-rise", branch: "zagwe", y: 1137, when: "c. 1137 (sources vary)", title: "Agaw princes found the Zagwe dynasty in Lasta",
      text: "After Aksum's decline, Agaw princes who had adopted Ge'ez and Christianity moved the seat of the empire south to Lasta. Wikipedia gives 1137 as the dynasty's start and Mara Takla Haymanot as founder.", imp: 2, link: "aksum",
      cites: [B("place/Ethiopia/The-Zagwe-and-Solomonic-dynasties", "Ethiopia: The Zagwe and Solomonic dynasties"), W("Zagwe_dynasty", "Zagwe dynasty")] },
    { id: "n98-zagwe-tigray-muslims", branch: "zagwe", y: 1150, when: "Zagwe period", title: "A Muslim community in eastern Tigray",
      text: "A Muslim community lived in eastern Tigray during the Zagwe period, and an Islamic frieze survives at Wukro Chirkos.", imp: 3,
      cites: [W("Zagwe_dynasty", "Zagwe dynasty")] },
    { id: "n98-zagwe-lalibela-reign", branch: "zagwe", y: 1185, end: 1225, when: "c. 1185–1225", title: "Reign of King Lalibela",
      text: "Britannica dates the reign of the best-known Zagwe king to about 1185–1225. He directed the hewing of 11 churches from living rock at the capital Roha, which was later renamed for him.", imp: 2,
      cites: [B("place/Ethiopia/The-Zagwe-and-Solomonic-dynasties", "Ethiopia: The Zagwe and Solomonic dynasties"), B("place/Lalibela-Ethiopia", "Lalibela")] },
    { id: "n98-zagwe-medhane-alem", branch: "zagwe", y: 1210, when: "attributed to Lalibela's reign", title: "Bete Medhane Alem, largest of the rock-hewn churches",
      text: "House of Medhane Alem (“Saviour of the World”) is the largest of the Lalibela churches, about 33 m long and 23 m wide. The churches were carved from the top downward out of solid rock, below ground level.", imp: 3,
      cites: [B("place/Lalibela-Ethiopia", "Lalibela")] },
    { id: "n98-zagwe-ifat", branch: "zagwe", y: 1250, when: "13th century", title: "Muslim sultanates take the eastern Shewa plateau",
      text: "Britannica says any Zagwe claim to the hilly country east of the Shewa plateau lapsed as Muslim states such as Ifat and Hadya increasingly occupied it.", imp: 3,
      cites: [B("topic/Zagwe-dynasty", "Zagwe dynasty")] },
    { id: "n98-zagwe-opposition", branch: "zagwe", y: 1260, when: "13th century", title: "Tigrayan and Amhara elites contest Zagwe legitimacy",
      text: "Zagwe hegemony was never complete. Opposition from the Semitic-speaking elite of Tigray and the emerging Amhara focused on whether the dynasty was of “Solomonic” descent.", imp: 3,
      cites: [B("place/Ethiopia/The-Zagwe-and-Solomonic-dynasties", "Ethiopia: The Zagwe and Solomonic dynasties")] },

    // ---------- Neo-Inca State ----------
    { id: "n98-manco-vilcabamba", branch: "neo-inca", y: 1537, when: "1537", title: "Manco Inca retreats to Vilcabamba",
      text: "After his ten-month siege of Cusco in 1536 failed and he held Ollantaytambo in January 1537, Manco withdrew to Vitcos and the forests of Vilcabamba. There he founded the Neo-Inca State.", imp: 1, link: "inca",
      cites: [W("Manco_Inca_Yupanqui", "Manco Inca Yupanqui"), W("Neo-Inca_State", "Neo-Inca State"), B("place/Peru/Discovery-and-exploration-by-Europeans", "Peru: Discovery and exploration by Europeans")] },
    { id: "n98-manco-murdered", branch: "neo-inca", y: 1544, when: "1544", title: "Manco Inca murdered at Vitcos",
      text: "Supporters of Diego de Almagro, who had been hiding under Manco's protection, murdered him at Vitcos. His soldiers then killed them.", imp: 2,
      cites: [W("Manco_Inca_Yupanqui", "Manco Inca Yupanqui"), W("Neo-Inca_State", "Neo-Inca State")] },
    { id: "n98-sayri-tupac-lima", branch: "neo-inca", y: D(1558, 1, 5), when: "January 5, 1558", title: "Sayri Túpac leaves Vilcabamba for Lima",
      text: "After negotiations with Viceroy Hurtado de Mendoza, Sayri Túpac was received in Lima, accepted baptism, gave up his claim to the empire and got a pardon and estates at Yucay. He died there in 1560.", imp: 3, link: "spain",
      cites: [W("Sayri_T%C3%BApac", "Sayri Túpac"), W("Neo-Inca_State", "Neo-Inca State")] },
    { id: "n98-titu-cusi-relacion", branch: "neo-inca", y: 1570, when: "1570", title: "Titu Cusi dictates an Inca account of the conquest",
      text: "Titu Cusi, ruler of Vilcabamba and son of Manco, was baptized as Diego de Castro around 1568. In 1570 he produced the Relación de la conquista del Perú, a rare Inca elite account of the Spanish conquest.", imp: 2,
      cites: [W("Titu_Cusi", "Titu Cusi")] },
    { id: "n98-titu-cusi-dies", branch: "neo-inca", y: 1571, when: "1571", title: "Titu Cusi dies; Túpac Amaru succeeds",
      text: "Titu Cusi died suddenly, probably of pneumonia; his companion Martín de Pando and the friar Diego Ortiz were blamed for poisoning him and later killed. His successor was Túpac Amaru.", imp: 3,
      cites: [W("Titu_Cusi", "Titu Cusi"), W("Neo-Inca_State", "Neo-Inca State")] },
    { id: "n98-toledo-declares-war", branch: "neo-inca", y: D(1572, 4, 14), when: "April 14, 1572", title: "Viceroy Toledo declares war on Vilcabamba",
      text: "Viceroy Francisco de Toledo declared war on the Neo-Inca State. Britannica says he feared Túpac Amaru and the remaining free Inca in Vilcabamba might prove dangerous to Spanish authority.", imp: 2, link: "viceroyalty-peru",
      cites: [W("Neo-Inca_State", "Neo-Inca State"), B("place/Peru/Discovery-and-exploration-by-Europeans", "Peru: Discovery and exploration by Europeans")] },
    { id: "n98-vilcabamba-taken", branch: "neo-inca", y: D(1572, 6, 24), when: "June 24, 1572", title: "Spanish troops enter deserted Vilcabamba",
      text: "The fort of Huayna Pucará had surrendered to Spanish artillery the day before. Spanish forces found Vilcabamba deserted, and the Neo-Inca State officially ended.", imp: 2,
      cites: [W("Neo-Inca_State", "Neo-Inca State"), W("T%C3%BApac_Amaru", "Túpac Amaru")] },

    // ---------- Sultanate of Rum ----------
    { id: "n98-rum-founded", branch: "sultanate-of-rum", y: 1077, when: "1077 (Britannica: c. 1075–1080)", title: "Sulayman ibn Qutalmish founds the Sultanate of Rum",
      text: "After Manzikert opened Anatolia to Turkmen settlement, Sulayman captured Nicaea around 1075 and by 1080 had made it his capital. Wikipedia dates the sultanate to 1077.", imp: 1, link: "byzantine",
      cites: [B("biography/Sulayman-ibn-Qutalmish", "Sulaymān ibn Qutalmïsh"), W("Sultanate_of_Rum", "Sultanate of Rum")] },
    { id: "n98-rum-konya", branch: "sultanate-of-rum", y: 1097, when: "1097", title: "Crusaders defeat Kilij Arslan I, who makes Konya his capital",
      text: "Kilij Arslan I lost Nicaea and Dorylaeum to the First Crusade in 1097 and withdrew to the Anatolian plateau, where he set up a capital at Konya. It remained the main Seljuk center to the dynasty's end.", imp: 2, link: "byzantine",
      cites: [B("place/Anatolia/Seljuq-expansion", "Anatolia: Seljuq expansion"), W("Sultanate_of_Rum", "Sultanate of Rum")] },
    { id: "n98-rum-third-crusade", branch: "sultanate-of-rum", y: 1190, when: "1190", title: "Third Crusade occupies Konya",
      text: "Frankish warriors of the Third Crusade occupied Konya in 1190. With princely rivalries after Kilij Arslan II's division of the realm, this checked the state's expansion for a time.", imp: 3,
      cites: [B("place/Anatolia/Seljuq-expansion", "Anatolia: Seljuq expansion")] },
    { id: "n98-rum-antalya", branch: "sultanate-of-rum", y: 1207, when: "1207", title: "Kay-Khusraw I takes the port of Antalya",
      text: "Capturing the harbor of Antalya on the Mediterranean in 1207 let the Seljuks trade beyond the Anatolian plateau, and led to commercial treaties with the Italians.", imp: 2,
      cites: [B("place/Anatolia/Seljuq-expansion", "Anatolia: Seljuq expansion")] },
    { id: "n98-rum-sinop", branch: "sultanate-of-rum", y: 1214, when: "1214", title: "Kay-Kaus I seizes Sinop; Trebizond submits to Seljuks",
      text: "Taking Sinop in 1214 gave the Seljuks an outlet on the Black Sea. The Greek ruler of Trebizond was also forced to accept their overlordship.", imp: 3, link: "byzantine",
      cites: [B("place/Anatolia/Seljuq-expansion", "Anatolia: Seljuq expansion"), W("Sultanate_of_Rum", "Sultanate of Rum")] },
    { id: "n98-rum-kayqubad", branch: "sultanate-of-rum", y: 1220, end: 1237, when: "1220–1237", title: "Kay-Qubadh I brings the sultanate to its height",
      text: "He conquered most of the Mediterranean coast in 1221–25 and sent an expedition to Crimea. After beating the Khwarazmian Jalal al-Din in 1230, he pushed the borders to the old eastern frontier of Byzantium.", imp: 2,
      cites: [B("place/Anatolia/Seljuq-expansion", "Anatolia: Seljuq expansion")] },
    { id: "n98-rum-konya-madrasas", branch: "sultanate-of-rum", y: 1251, when: "1242–1258", title: "Konya's Seljuk madrasas: Sirçali, Karatay and İnce Minare",
      text: "Seljuk rulers endowed Konya with fine buildings, including the Sirçali Medrese (1242), the richly decorated Karatay Medrese (1251) and the İnce Minare (built 1258). Now museums, they are among the finest surviving Seljuk art.", imp: 2,
      cites: [B("place/Konya", "Konya")] },
    { id: "n98-rum-kose-dag", branch: "sultanate-of-rum", y: 1243, when: "1243", title: "Mongols crush the Seljuks at Köse Dağ",
      text: "The Mongol commander Baiju defeated Sultan Kay-Khusraw II between Sivas and Erzincan. The Anatolian Seljuks passed under Mongol suzerainty as vassals.", imp: 1, link: "ilkhanate",
      cites: [B("topic/Battle-of-Kose-Dag", "Battle of Köse Dağ"), B("place/Anatolia/Seljuq-expansion", "Anatolia: Seljuq expansion")] },
    { id: "n98-rum-end", branch: "sultanate-of-rum", y: 1308, when: "1308 (some lists give 1307)", title: "Mesud II dies, last of the Seljuks of Rum",
      text: "Wikipedia says Mesud II, a Mongol vassal with no real authority, was dead by 1308, last of the Seljuks of Rum. Britannica says the Seljuk dynasty died out early in the 14th century.", imp: 2, link: "ilkhanate",
      cites: [W("Mesud_II", "Mesud II"), W("Sultanate_of_Rum", "Sultanate of Rum"), B("topic/Battle-of-Kose-Dag", "Battle of Köse Dağ")] },

    // ---------- Goths ----------
    { id: "n98-goths-black-sea", branch: "goths", y: 175, when: "second half of the 2nd century CE", title: "The Goths migrate from the Vistula to the Black Sea",
      text: "Jordanes reports that the Goths came from Scandinavia and moved south from the Vistula to the Black Sea. Britannica dates this movement to the second half of the 2nd century CE.", imp: 2,
      cites: [B("topic/Goth", "Goth"), W("Goths", "Goths")] },
    { id: "n98-goths-histria", branch: "goths", y: 238, when: "238 CE", title: "Goths sack Histria",
      text: "The first raid attributed to the Goths sacked the Black Sea city of Histria in 238. Seaborne raids later reached Asia Minor and Greece.", imp: 3, link: "roman-empire",
      cites: [W("Goths", "Goths"), B("topic/Goth", "Goth")] },
    { id: "n98-goths-abritus", branch: "goths", y: 251.45, when: "June 251 CE", title: "Cniva's Goths kill Emperor Decius at Abritus",
      text: "Gothic forces under Cniva defeated and killed the Roman emperor Decius at the Battle of Abritus (Abrittus), in the Dobruja.", imp: 2, link: "roman-empire",
      cites: [W("Goths", "Goths"), B("biography/Decius", "Decius")] },
    { id: "n98-goths-dacia", branch: "goths", y: 272, when: "270–275 CE (reign of Aurelian)", title: "Gothic pressure forces Rome out of Dacia",
      text: "During Aurelian's reign (270–275) Gothic raids obliged the Romans to evacuate the province of Dacia north of the Danube. Britannica says those Goths between the Danube and Dniester came to be called Visigoths.", imp: 2, link: "roman-empire",
      cites: [B("topic/Goth", "Goth"), W("Goths", "Goths")] },
    { id: "n98-goths-ermanaric", branch: "goths", y: 370, when: "c. 370", title: "The Huns subjugate the Ostrogoths of Ermanaric",
      text: "The Ostrogothic kingdom stretched from the Don to the Dniester, reaching its height under Ermanaric. Britannica says he is said to have killed himself when the Huns attacked and subjugated his people about 370.", imp: 2,
      cites: [B("topic/Ostrogoth", "Ostrogoth")] },
    { id: "n98-goths-danube", branch: "goths", y: 376, when: "376", title: "Goths cross the Danube into the Roman Empire",
      text: "Attacked by the Huns in 376, the Visigoths were driven south across the Danube and allowed to enter the empire. Mistreatment by Roman officials soon drove them to revolt in Thrace.", imp: 1, link: "roman-empire",
      cites: [B("topic/Visigoth", "Visigoth"), W("Goths", "Goths")] },
    { id: "n98-goths-treaty-382", branch: "goths", y: D(382, 10, 3), when: "October 3, 382", title: "Theodosius I makes the Goths federates south of the Danube",
      text: "Theodosius I concluded a treaty with the main body of the Visigoths in the fall of 382. They pledged military help and received land between the lower Danube and the Balkan Mountains; Wikipedia dates the peace to October 3.", imp: 2, link: "roman-empire",
      cites: [B("biography/Theodosius-I", "Theodosius I"), W("Goths", "Goths")] },
    { id: "n98-goths-theodoric-italy", branch: "goths", y: 493, when: "489–493", title: "Theodoric leads the Ostrogoths into Italy; rules at Ravenna",
      text: "Sent by Emperor Zeno against Odoacer, Theodoric arrived in Italy in late August 489. By 493 he held virtually all the peninsula and was king of Italy, with his capital at Ravenna; he died in 526.", imp: 1, link: "byzantine",
      cites: [B("biography/Theodoric-king-of-Italy", "Theodoric"), B("topic/Ostrogoth", "Ostrogoth")] },
    { id: "n98-goths-gothic-war", branch: "goths", y: 535, end: 554, when: "535–554", title: "Justinian's war ends the Ostrogothic kingdom",
      text: "Justinian declared war on the Ostrogoths in 535 to take Italy. The war went on for almost 20 years with great damage to Italy, and the Ostrogoths afterward had no national existence.", imp: 1, link: "byzantine",
      cites: [B("topic/Ostrogoth", "Ostrogoth"), W("Goths", "Goths")] },
  ],
});

// ---------- Origins ----------
TL.origin("erlitou", {
  note: "Erlitou rose in the Yi–Luo valley in Henan out of Late Neolithic cultures. Britannica notes its developmental sequence links Early Shang culture to those Neolithic cultures, and that Erlitou is taken to be a correlate of the Xia.",
  links: [{ id: "neolithic-china", how: "peoples", note: "Grew out of Late Neolithic cultures" }],
  cites: [B("topic/history-of-China/The-first-historical-dynasty-the-Shang", "History of China: The first historical dynasty, the Shang"), B("topic/Erlitou-culture", "Erlitou culture"), W("Erlitou_culture", "Erlitou culture")],
});
TL.origin("zagwe", {
  note: "Agaw princes who had learned Ge'ez and become Christian under Aksumite rule moved the seat of the empire to their own Lasta region. Their claim to succeed Aksum rested on a legendary marriage to an Aksumite king's daughter, later confirmed by the church.",
  links: [{ id: "aksum", how: "successor", note: "Zagwe ruled the highlands after Aksum's decline and claimed its succession" }],
  cites: [B("place/Ethiopia/The-Zagwe-and-Solomonic-dynasties", "Ethiopia: The Zagwe and Solomonic dynasties"), B("topic/Zagwe-dynasty", "Zagwe dynasty")],
});
TL.origin("neo-inca", {
  note: "After the Spanish conquest of the Inca Empire, Manco Inca, first installed as emperor by Pizarro, rebelled in 1536 and then withdrew to the forests of Vilcabamba, where the Inca line continued for 35 years.",
  links: [{ id: "inca", how: "successor", note: "Manco Inca carried the Inca royal line into exile at Vilcabamba" }],
  cites: [W("Neo-Inca_State", "Neo-Inca State"), B("place/Peru/Discovery-and-exploration-by-Europeans", "Peru: Discovery and exploration by Europeans")],
});
TL.origin("sultanate-of-rum", {
  note: "Sulayman ibn Qutalmish, a Seljuk relative, seized Nicaea in Anatolia after Manzikert opened the region to Turkmen settlement, and broke from the Great Seljuk empire. The state was named Rum, “Rome,” for the Byzantine lands it took.",
  links: [{ id: "seljuk", how: "split", note: "Sulayman ibn Qutalmish seceded from the Great Seljuk empire in Anatolia" }],
  cites: [B("topic/Sultanate-of-Rum", "Sultanate of Rūm"), B("biography/Sulayman-ibn-Qutalmish", "Sulaymān ibn Qutalmïsh"), W("Sultanate_of_Rum", "Sultanate of Rum")],
});
TL.origin("goths", {
  note: "Greek and Roman writers first mention the Gutones in the 1st century CE, though whether they are the later Goths is disputed. Jordanes traces the Goths to Scandinavia; scholars link them to the Wielbark culture on the Vistula.",
  links: [{ id: "germanic-peoples", how: "peoples", note: "The Goths were one of the Germanic peoples of the Migration Period" }],
  cites: [W("Goths", "Goths"), B("topic/Goth", "Goth")],
});

// ---------- Moves ----------
TL.move("w405-lalibela", "zagwe");
TL.move("w308-tupac-amaru-executed", "neo-inca");
TL.move("w402-rumi-dies", "sultanate-of-rum");
TL.move("w403-myriokephalon", "sultanate-of-rum");
TL.move("w504-ulfilas", "goths");
TL.move("w504-adrianople", "goths");
TL.move("w504-codex-argenteus", "goths");

// ---------- Locations ----------
const G = (id, scope, lat, lon, r, label, src) => TL.geo(id, { scope, lat, lon, r, label, src: `https://en.wikipedia.org/wiki/${src}` });
G("erlitou", "region", 34.7, 112.7, 300, "Yi–Luo valley, Henan, China", "Yanshi_District");
G("n98-erlitou-first-state", "place", 34.727, 112.79, 60, "Yanshi, Henan, China", "Yanshi_District");
G("n98-erlitou-proto-writing", "place", 34.727, 112.79, 60, "Yanshi, Henan, China", "Yanshi_District");
G("n98-erlitou-city-grows", "place", 34.727, 112.79, 60, "Yanshi, Henan, China", "Yanshi_District");
G("n98-erlitou-bronze", "place", 34.727, 112.79, 60, "Yanshi, Henan, China", "Yanshi_District");
G("n98-erlitou-turquoise", "place", 34.727, 112.79, 60, "Yanshi, Henan, China", "Yanshi_District");
G("n98-yanshi-city", "place", 34.727, 112.79, 60, "Yanshi, Henan, China", "Yanshi_District");
G("n98-erlitou-abandoned", "place", 34.727, 112.79, 60, "Yanshi, Henan, China", "Yanshi_District");

G("zagwe", "region", 12.0356, 39.0472, 300, "Lasta, Ethiopia", "Lasta");
G("n98-zagwe-rise", "place", 12.0356, 39.0472, 100, "Lasta, Ethiopia", "Lasta");
G("n98-zagwe-tigray-muslims", "place", 13.78, 39.6, 60, "Wukro, Tigray, Ethiopia", "Wukro");
G("n98-zagwe-lalibela-reign", "place", 12.0319, 39.0473, 40, "Lalibela, Ethiopia", "Lalibela");
G("n98-zagwe-medhane-alem", "place", 12.0319, 39.0473, 40, "Lalibela, Ethiopia", "Lalibela");
G("n98-zagwe-ifat", "region", 9.0, 39.0, 250, "Eastern Shewa, Ethiopia", "Shewa");
G("n98-zagwe-opposition", "region", 12.0, 39.0, 300, "Northern Ethiopia", "Lasta");

G("neo-inca", "region", -13.0, -72.9, 120, "Vilcabamba region, Peru", "Vitcos");
G("n98-manco-vilcabamba", "place", -13.098, -72.932, 80, "Vitcos, Peru", "Vitcos");
G("n98-manco-murdered", "place", -13.098, -72.932, 80, "Vitcos, Peru", "Vitcos");
G("n98-sayri-tupac-lima", "place", -12.05, -77.04, 40, "Lima, Peru", "Lima");
G("n98-titu-cusi-relacion", "place", -13.098, -72.932, 80, "Vitcos, Peru", "Vitcos");
G("n98-titu-cusi-dies", "place", -13.098, -72.932, 80, "Vitcos, Peru", "Vitcos");
G("n98-toledo-declares-war", "place", -13.52, -71.97, 60, "Cusco, Peru", "Cusco");
G("n98-vilcabamba-taken", "place", -13.098, -72.932, 80, "Vitcos, Peru", "Vitcos");

G("sultanate-of-rum", "region", 38.5, 33.5, 600, "Anatolia, Turkey", "Konya");
G("n98-rum-founded", "place", 40.429, 29.721, 50, "İznik (Nicaea), Turkey", "Iznik");
G("n98-rum-konya", "place", 37.87, 32.48, 40, "Konya, Turkey", "Konya");
G("n98-rum-third-crusade", "place", 37.87, 32.48, 40, "Konya, Turkey", "Konya");
G("n98-rum-antalya", "place", 36.887, 30.703, 40, "Antalya, Turkey", "Antalya");
G("n98-rum-sinop", "place", 42.027, 35.151, 40, "Sinop, Turkey", "Sinop,_Turkey");
G("n98-rum-kayqubad", "place", 37.87, 32.48, 40, "Konya, Turkey", "Konya");
G("n98-rum-konya-madrasas", "place", 37.87, 32.48, 40, "Konya, Turkey", "Konya");
G("n98-rum-kose-dag", "place", 40.2825, 39.595, 120, "Köse Dağ, Turkey", "Battle_of_K%C3%B6se_Da%C4%9F");
G("n98-rum-end", "place", 37.87, 32.48, 40, "Konya, Turkey", "Konya");

G("goths", "region", 47.0, 29.0, 900, "Vistula to the Black Sea", "Moldova");
G("n98-goths-black-sea", "region", 50.74, 25.32, 700, "Vistula to the Black Sea", "Volhynia");
G("n98-goths-histria", "place", 44.5475, 28.7747, 60, "Histria, Romania", "Histria_(ancient_city)");
G("n98-goths-abritus", "place", 43.5333, 26.5167, 60, "Abritus (Razgrad), Bulgaria", "Razgrad");
G("n98-goths-dacia", "region", 45.7, 26.5, 300, "Dacia (Romania)", "Dacia");
G("n98-goths-ermanaric", "region", 50.45, 30.52, 500, "Ukraine", "Ukraine");
G("n98-goths-danube", "region", 44.45, 28.33, 150, "Lower Danube", "Dobruja");
G("n98-goths-treaty-382", "region", 43.25, 25.0, 250, "Lower Danube and Balkan Mountains", "Balkan_Mountains");
G("n98-goths-theodoric-italy", "place", 44.42, 12.2, 40, "Ravenna, Italy", "Ravenna");
G("n98-goths-gothic-war", "region", 43.0, 12.0, 500, "Italy", "Italy");

TL.cite("n98-vilcabamba-taken", "Peru: Discovery and exploration by Europeans — Encyclopaedia Britannica", "https://www.britannica.com/place/Peru/Discovery-and-exploration-by-Europeans");
