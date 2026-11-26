// Fill-in W4-03: 1000–1500 — Aragon, Asturias–León, Byzantium, Castile, England, France and Golden Horde events (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const U = (t, u) => ({ t, u });
const D = (y, m, d) => y + (Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5) + 0.5) / 365;

TL.add({ events: [
  // ---------- Crown of Aragon ----------
  { id: "w403-muret", branch: "aragon", y: D(1213, 9, 12), when: "September 12, 1213", title: "Battle of Muret: Peter II of Aragon defeated",
    text: "Peter II answered Count Raymond of Toulouse's appeal against the Albigensian crusaders and lost to Simon de Montfort. The defeat ended Aragonese ambitions north of the Pyrenees.", imp: 2,
    cites: [B("event/Battle-of-Muret", "Battle of Muret")] },
  { id: "w403-majorca", branch: "aragon", y: 1229.96, when: "December 1229", title: "James I captures Majorca",
    text: "James I took the island of Majorca in December 1229 and went on to conquer Valencia, adding the Balearic Islands and Valencia to his realm and launching Catalan-Aragonese expansion in the Mediterranean.", imp: 2,
    cites: [B("biography/James-I-king-of-Aragon", "James I")] },
  { id: "w403-llull-ars", branch: "aragon", y: 1272, when: "c. 1272", title: "Ramon Llull conceives the Ars magna",
    text: "The Majorcan mystic Ramon Llull devised a system of logic and symbolic notation meant to relate all knowledge. He wrote in Catalan, Arabic and Latin, helping make Catalan a literary language.", imp: 2,
    cites: [B("biography/Ramon-Llull", "Ramon Llull"), B("topic/Catalan-literature", "Catalan literature")] },
  { id: "w403-vespers", branch: "aragon", y: D(1282, 3, 30), when: "March 30, 1282", title: "Sicilian Vespers: Aragon contests the Sicilian crown",
    text: "Sicilians rose against Charles of Anjou at the hour of vespers, a revolt that Peter III of Aragon had conspired to raise. It began a long French-Aragonese struggle over the kingdom.", imp: 2,
    cites: [B("event/Sicilian-Vespers", "Sicilian Vespers")] },
  { id: "w403-santa-maria-del-mar", branch: "aragon", y: 1329, end: 1383, when: "March 25, 1329 – November 3, 1383", title: "Santa Maria del Mar built in Barcelona",
    text: "The foundation stone was laid in 1329 and the last stone in 1383. The church is called an outstanding example of Catalan Gothic, with a purity and unity of style unusual in large medieval buildings.", imp: 3,
    cites: [W("Santa_Maria_del_Mar,_Barcelona", "Santa Maria del Mar, Barcelona"), U("Parish of Santa Maria del Mar (Basilica) — Barcelona City Council", "https://www.barcelona.cat/en/coneixbcn/pics/parroquia-de-santa-maria-del-mar-basilica-92086001318")] },
  { id: "w403-caspe", branch: "aragon", y: 1412.5, when: "1412", title: "Compromise of Caspe chooses a new king",
    text: "After Martin I died in 1410 without a clear heir, nine delegates from Aragon, Valencia and Catalonia met at Caspe. In 1412 they chose Ferdinand of Antequera, brother of the king of Castile.", imp: 2, link: "castile",
    cites: [B("event/Compromise-of-Caspe", "Compromise of Caspe")] },
  { id: "w403-tirant", branch: "spain", y: 1490, when: "1490", title: "Tirant lo Blanc printed in Valencia",
    text: "Joanot Martorell's chivalric romance, written c. 1460–1464 and finished by Martí Joan de Galba, appeared in print in 1490. Don Quixote praises it.", imp: 3,
    cites: [W("Tirant_lo_Blanc", "Tirant lo Blanc"), B("topic/Catalan-literature", "Catalan literature")] },

  // ---------- Kingdom of Asturias and León ----------
  { id: "w403-ferdinand-emperor", branch: "asturias-leon", y: 1037, end: 1039, when: "1037–1039", title: "Ferdinand I takes León and is crowned emperor",
    text: "Ferdinand of Castile defeated and killed his brother-in-law Bermudo III of León at Tamarón in 1037. He had himself crowned emperor in the city of León in 1039, uniting the two realms.", imp: 2,
    cites: [B("biography/Ferdinand-I-king-of-Castile-and-Leon", "Ferdinand I")] },
  { id: "w403-san-isidoro", branch: "asturias-leon", y: 1063, when: "1063", title: "Relics of Saint Isidore brought to León",
    text: "The relics of Isidore of Seville were moved to León and housed in the chapel that became the royal pantheon of San Isidoro. Its 12th-century Romanesque paintings survive.", imp: 3,
    cites: [W("Basilica_of_San_Isidoro,_Le%C3%B3n", "Basilica of San Isidoro, León"), U("Real Colegiata of San Isidoro — Turismo Castilla y León", "https://www.turismocastillayleon.com/en/heritage-culture/churches-chapels/real-colegiata-san-isidoro")] },
  { id: "w403-toledo-1085", branch: "asturias-leon", y: 1085.4, when: "1085", title: "Alfonso VI conquers Toledo",
    text: "Alfonso VI took Toledo, a Muslim-held strategic and cultural center since the 8th century. It became the main political and social center of Castile and later home to the translators' school.", imp: 2,
    cites: [B("biography/Alfonso-VI", "Alfonso VI"), B("place/Toledo-Spain", "Toledo")] },
  { id: "w403-decreta-1188", branch: "asturias-leon", y: 1188, when: "1188", title: "Alfonso IX summons the Cortes at León",
    text: "Alfonso IX gathered nobles, clergy and townsmen at San Isidoro. The Decreta covered property rights, the inviolability of the home and the king's duty to consult before war. León styles itself the cradle of parliamentarism.", imp: 2,
    cites: [W("Cortes_of_Le%C3%B3n_(1188)", "Cortes of León (1188)"), B("biography/Alfonso-IX", "Alfonso IX"), U("The courts of Leon in 1188 — Turismo Castilla y León", "https://www.turismocastillayleon.com/en/augmented-reality/leon"), B("topic/Cortes-Spanish-and-Portuguese-parliament", "Cortes")] },
  { id: "w403-salamanca-university", branch: "asturias-leon", y: 1218, when: "1218", title: "Alfonso IX founds the University of Salamanca",
    text: "Alfonso IX founded the school at Salamanca in 1218. Under his grandson Alfonso X in 1254 it received chairs in canon law, grammar, arts and physics.", imp: 2,
    cites: [B("topic/University-of-Salamanca", "University of Salamanca")] },

  // ---------- Byzantine Empire ----------
  { id: "w403-kleidion", branch: "byzantine", y: D(1014, 7, 29), when: "July 29, 1014", title: "Basil II crushes the Bulgarians at Kleidion",
    text: "A flanking force trapped Tsar Samuel's army in the Belasitsa valley. Basil is said to have blinded most prisoners, earning the name “Bulgar-slayer”; Bulgaria fell by 1018.", imp: 2,
    cites: [W("Battle_of_Kleidion", "Battle of Kleidion"), B("biography/Basil-II", "Basil II")] },
  { id: "w403-alexios-crowned", branch: "byzantine", y: D(1081, 4, 4), when: "April 4, 1081", title: "Alexios I Komnenos crowned; the empire recovers",
    text: "Alexios founded the Komnenian dynasty and restored an empire described by his daughter as “at its last gasp.” He drove back the Normans with Venetian help and halted the Seljuk advance.", imp: 2,
    cites: [B("biography/Alexius-I-Comnenus", "Alexius I Comnenus")] },
  { id: "w403-anna-alexiad", branch: "byzantine", y: 1118, when: "after 1118", title: "Anna Komnene writes the Alexiad",
    text: "After a failed plot against her brother, the princess Anna retired to a convent. There she wrote the Alexiad on her father's reign, a valuable pro-Byzantine account of the early Crusades.", imp: 2, link: "catholicism",
    cites: [B("biography/Anna-Comnena", "Anna Comnena")] },
  { id: "w403-myriokephalon", branch: "byzantine", y: D(1176, 9, 17), when: "September 17, 1176", title: "Battle of Myriokephalon",
    text: "Manuel I Komnenos's army was ambushed by Kilij Arslan II's Seljuks in a mountain pass west of Iconium. It ended Byzantine attempts to recover the Anatolian plateau.", imp: 2, link: "seljuk",
    cites: [W("Battle_of_Myriokephalon", "Battle of Myriokephalon"), B("biography/Manuel-I-Comnenus", "Manuel I Comnenus")] },
  { id: "w403-reconquest-1261", branch: "byzantine", y: 1261.6, when: "July–August 1261", title: "Michael VIII Palaiologos retakes Constantinople",
    text: "His troops recovered the city from the Latin rulers after 57 years. Michael was crowned in Hagia Sophia in August 1261, founding the last Byzantine dynasty.", imp: 1,
    cites: [B("biography/Michael-VIII-Palaeologus", "Michael VIII Palaeologus")] },
  { id: "w403-chora", branch: "byzantine", y: 1310, end: 1317, when: "c. 1310–1317", title: "Chora Church mosaics and frescoes completed",
    text: "The statesman Theodore Metochites had the interior decorated with mosaics and frescoes, a leading work of the Palaiologan revival. He commissioned a funerary chapel and narthexes between 1315 and 1321.", imp: 2,
    cites: [W("Chora_Church", "Chora Church"), B("topic/Kariye-Museum", "Kariye Museum")] },
  { id: "w403-hesychast-council", branch: "byzantine", y: 1351, when: "1351", title: "Council confirms Palamas and Hesychasm",
    text: "Orthodox councils at Constantinople in 1341, 1347 and 1351 upheld the monk Gregory Palamas's defense of Hesychast prayer. His teaching became central to Orthodox theology.", imp: 3,
    cites: [B("topic/Hesychasm", "Hesychasm")] },
  { id: "w403-florence-union", branch: "byzantine", y: 1439, when: "1439", title: "Council of Ferrara-Florence proclaims union with Rome",
    text: "John VIII Palaiologos traveled to Italy in 1437 and brought about a union of the Byzantine and Latin churches in 1439, seeking Western help against the Turks. Most Byzantines rejected it.", imp: 2, link: "catholicism",
    cites: [B("biography/John-VIII-Palaeologus", "John VIII Palaeologus"), W("Gemistus_Pletho", "Gemistus Pletho")] },
  { id: "w403-plethon-florence", branch: "byzantine", y: 1438, end: 1439, when: "1438–1439", title: "Plethon presents Plato to Italy",
    text: "The Byzantine philosopher Gemistos Plethon was in the emperor's entourage at the Council of Ferrara-Florence. His exchanges with Italian humanists helped reintroduce Plato's ideas to Western Europe.", imp: 3, link: "renaissance-humanism",
    cites: [W("Gemistus_Pletho", "Gemistus Pletho"), B("biography/John-VIII-Palaeologus", "John VIII Palaeologus")] },

  // ---------- Crown of Castile ----------
  { id: "w403-alfonso-scholars", branch: "castile", y: 1252, end: 1284, when: "reign of 1252–1284", title: "Alfonso X's court scholars write in Castilian",
    text: "Alfonso X's scholars turned Castilian into a literary language, producing chronicles, the Alfonsine astronomical tables and law. Toledo's School of Translators is credited to him.", imp: 2,
    cites: [B("biography/Alfonso-X", "Alfonso X"), B("place/Toledo-Spain", "Toledo"), W("Alfonsine_Tables", "Alfonsine Tables")] },
  { id: "w403-siete-partidas", branch: "castile", y: 1256, end: 1265, when: "1256–1265", title: "Siete Partidas compiled under Alfonso X",
    text: "A commission of jurists wrote this Castilian legal code under the king's direction. It became law only in 1348 but shaped Spanish and Latin American law for centuries.", imp: 2,
    cites: [W("Siete_Partidas", "Siete Partidas"), B("biography/Alfonso-X", "Alfonso X")] },
  { id: "w403-salado", branch: "castile", y: D(1340, 10, 30), when: "October 30, 1340", title: "Battle of Río Salado",
    text: "Castilian and Portuguese forces defeated the Marinids of North Africa in their last attempt to invade the Iberian Peninsula.", imp: 2,
    cites: [B("event/Battle-of-Rio-Salado", "Battle of Río Salado")] },
  { id: "w403-libro-buen-amor", branch: "castile", y: 1330, when: "1330 (expanded 1343)", title: "Juan Ruiz writes the Libro de buen amor",
    text: "The cleric Juan Ruiz's long poem, expanded in 1343, is perhaps the most important long poem of medieval Spain. It contrasts “good love,” the love of God, with carnal love.", imp: 2,
    cites: [B("biography/Juan-Ruiz", "Juan Ruiz")] },
  { id: "w403-montiel", branch: "castile", y: D(1369, 3, 23), when: "March 23, 1369", title: "Henry of Trastámara kills Peter and takes the throne",
    text: "With French aid Henry captured his half-brother Peter and murdered him in 1369. As Henry II he founded the Trastámara house, which ruled until 1504.", imp: 2,
    cites: [B("biography/Henry-II-king-of-Castile", "Henry II")] },
  { id: "w403-seville-cathedral", branch: "castile", y: 1402, end: 1506, when: "1402 or 1403 – 1506", title: "Seville Cathedral construction begins",
    text: "Seville resolved in 1401 to replace its grand mosque, then the cathedral, with a church on a grand scale. Built on the mosque's foundations, it supplanted Hagia Sophia as the largest cathedral in the world.", imp: 2,
    cites: [W("Seville_Cathedral", "Seville Cathedral"), B("topic/Catedral-de-Sevilla-", "Catedral de Sevilla")] },
  { id: "w403-isabella-queen", branch: "castile", y: 1474.95, when: "December 1474", title: "Isabella becomes queen of Castile",
    text: "Henry IV died on December 11, 1474. His half sister Isabella, who had married Ferdinand of Aragon without his consent, succeeded him and ruled jointly with Ferdinand from 1479.", imp: 2, link: "aragon",
    cites: [B("biography/Isabella-I-queen-of-Spain", "Isabella I"), B("biography/Henry-IV-king-of-Castile", "Henry IV")] },

  // ---------- Kingdom of England ----------
  { id: "w403-beowulf-ms", branch: "england", y: 1000, when: "c. 1000", title: "The Beowulf manuscript is written",
    text: "The only surviving copy of the Old English epic Beowulf dates to about 1000. It is known as Cotton MS Vitellius A XV.", imp: 2,
    cites: [B("topic/Beowulf", "Beowulf")] },
  { id: "w403-cnut", branch: "england", y: 1016, when: "1016", title: "Cnut becomes king of England",
    text: "After Aethelred's death in 1016, the Danish prince Cnut was elected king by the English council at Southampton. He also ruled Denmark and Norway.", imp: 2,
    cites: [B("biography/Canute-I", "Canute I")] },
  { id: "w403-domesday", branch: "england", y: 1086, when: "1086", title: "Domesday Book compiled",
    text: "William I ordered a survey of England in 1086 to record the estates of the king and his tenants-in-chief and their values.", imp: 2,
    cites: [B("topic/Domesday-Book", "Domesday Book")] },
  { id: "w403-geoffrey-monmouth", branch: "england", y: 1136, when: "between 1135 and 1139", title: "Geoffrey of Monmouth's History of the Kings of Britain",
    text: "The Historia regum Britanniae was one of the most popular books of the Middle Ages. It brought King Arthur into European literature, though historians give it almost no value as history.", imp: 2,
    cites: [B("biography/Geoffrey-of-Monmouth", "Geoffrey of Monmouth")] },
  { id: "w403-becket", branch: "england", y: D(1170, 12, 29), when: "December 29, 1170", title: "Thomas Becket murdered in Canterbury Cathedral",
    text: "The archbishop's long quarrel with Henry II, who had issued the Constitutions of Clarendon curbing church courts, ended in his murder. He was canonized in 1173.", imp: 2,
    cites: [B("biography/Saint-Thomas-Becket", "Saint Thomas Becket"), B("biography/Henry-II-king-of-England", "Henry II")] },
  { id: "w403-provisions-oxford", branch: "england", y: 1258.4, when: "1258", title: "Provisions of Oxford",
    text: "Bankrupted by a venture in Sicily, Henry III accepted a reform plan in return for a grant of revenue. It can be regarded as England's first written constitution.", imp: 2,
    cites: [B("event/Provisions-of-Oxford", "Provisions of Oxford")] },
  { id: "w403-peasants-revolt", branch: "england", y: 1381.41, end: 1381.85, when: "May–November 1381", title: "Peasants' Revolt",
    text: "Resistance to a poll tax set off England's first great popular rebellion. Wat Tyler was killed at Smithfield on June 15, and royal forces put the revolt down by November.", imp: 2,
    cites: [B("event/Peasants-Revolt", "Peasants' Revolt"), W("Peasants%27_Revolt", "Peasants' Revolt")] },
  { id: "w403-canterbury-tales", branch: "england", y: 1387, end: 1400, when: "1387–1400", title: "Chaucer writes The Canterbury Tales",
    text: "Geoffrey Chaucer's tales of pilgrims traveling from London to Canterbury, in Middle English, are ranked among the greatest poems in English. He left them unfinished.", imp: 2,
    cites: [B("biography/Geoffrey-Chaucer", "Geoffrey Chaucer"), W("The_Canterbury_Tales", "The Canterbury Tales")] },
  { id: "w403-agincourt", branch: "england", y: D(1415, 10, 25), when: "October 25, 1415", title: "Henry V wins at Agincourt",
    text: "Henry V's decisive victory over the French in the Hundred Years' War made England one of the strongest kingdoms in Europe.", imp: 2, link: "france",
    cites: [B("event/Battle-of-Agincourt", "Battle of Agincourt"), B("biography/Henry-V-king-of-England", "Henry V")] },
  { id: "w403-caxton", branch: "england", y: 1476, when: "1476", title: "William Caxton sets up the first English press",
    text: "Caxton, who had printed the first book in English abroad, set up a press at Westminster in 1476. He later printed Chaucer's Canterbury Tales and Malory's Le Morte Darthur.", imp: 2,
    cites: [B("biography/William-Caxton", "William Caxton")] },
  { id: "w403-bosworth", branch: "england", y: D(1485, 8, 22), when: "August 22, 1485", title: "Battle of Bosworth Field ends the Wars of the Roses",
    text: "Henry Tudor, returning from exile, defeated Richard III near Market Bosworth. It was effectively the last battle of the Wars of the Roses and established the Tudor dynasty.", imp: 2,
    cites: [B("event/Battle-of-Bosworth-Field", "Battle of Bosworth Field"), B("biography/Henry-VII-king-of-England", "Henry VII")] },

  // ---------- France ----------
  { id: "w403-cluny-iii", branch: "france", y: 1088, end: 1130, when: "1088–1130", title: "Cluny III, the world's largest church, is built",
    text: "The third abbey church at Cluny, a Romanesque basilica, was built between 1088 and 1130. It was the largest church in the world until St. Peter's Basilica was built.", imp: 2,
    cites: [B("topic/Cluny-Abbey", "Cluny Abbey"), W("Cluny_Abbey", "Cluny Abbey")] },
  { id: "w403-troubadours", branch: "france", y: 1095, end: 1350, when: "late 11th century – c. 1350", title: "Troubadours sing courtly love in Occitan",
    text: "Poets in southern France composed songs of chivalry and courtly love in Old Occitan. The earliest whose work survives is Duke William IX of Aquitaine.", imp: 2,
    cites: [W("Troubadour", "Troubadour"), B("biography/William-IX", "William IX")] },
  { id: "w403-roland", branch: "france", y: 1100, when: "c. 1040–1115", title: "The Song of Roland takes shape",
    text: "The epic of Roland's death at Roncevaux, a masterpiece of French literature, took shape in an early version c. 1040, with additions up to about 1115. Its only surviving manuscript, at Oxford, dates from 1129–1165.", imp: 2,
    cites: [W("Song_of_Roland", "Song of Roland"), B("topic/Chanson-de-geste", "Chanson de geste")] },
  { id: "w403-saint-denis", branch: "france", y: 1144, when: "1144", title: "Suger's choir at Saint-Denis completed",
    text: "Abbot Suger rebuilt the abbey church of Saint-Denis. Its choir, completed in 1144, is widely considered the first structure to use all the elements of Gothic architecture.", imp: 1,
    cites: [W("Basilica_of_St_Denis", "Basilica of St Denis"), B("biography/Suger", "Suger")] },
  { id: "w403-notre-dame", branch: "france", y: 1163, end: 1345, when: "1163 – c. 1345", title: "Construction of Notre-Dame de Paris begins",
    text: "Bishop Maurice de Sully began a single large Gothic cathedral to replace two basilicas, with the stone laid by Pope Alexander III. Work continued into the 14th century.", imp: 2,
    cites: [B("topic/Notre-Dame-de-Paris", "Notre-Dame de Paris")] },
  { id: "w403-chartres", branch: "france", y: 1194, end: 1260, when: "1194–1260", title: "Chartres Cathedral rebuilt after the fire",
    text: "After fire destroyed a Romanesque church in 1194, the present High Gothic cathedral rose, consecrated in 1260. It holds 176 stained-glass windows.", imp: 2,
    cites: [B("topic/Chartres-Cathedral", "Chartres Cathedral")] },
  { id: "w403-albigensian", branch: "france", y: 1209, end: 1229, when: "1209–1229", title: "Albigensian Crusade in the south",
    text: "Pope Innocent III launched a crusade against the Cathars of southern France. It brought Languedoc under the influence of the French crown.", imp: 2,
    cites: [B("event/Albigensian-Crusade", "Albigensian Crusade"), B("event/Battle-of-Muret", "Battle of Muret")] },
  { id: "w403-bouvines", branch: "france", y: D(1214, 7, 27), when: "July 27, 1214", title: "Philip II wins at Bouvines",
    text: "Philip II Augustus defeated a coalition led by Emperor Otto IV and King John of England, who had organized it to reclaim lands lost to Philip.", imp: 2, link: "england",
    cites: [B("event/Battle-of-Bouvines-1214", "Battle of Bouvines")] },
  { id: "w403-poitiers", branch: "france", y: D(1356, 9, 19), when: "September 19, 1356", title: "Battle of Poitiers: King John II captured",
    text: "The Black Prince's smaller Anglo-Gascon army routed the French near Poitiers and captured King John II. Revolts followed, and the Treaty of Brétigny in 1360 ceded large territories to England.", imp: 2, link: "england",
    cites: [W("Battle_of_Poitiers_(1356)", "Battle of Poitiers (1356)"), B("biography/John-II-king-of-France", "John II")] },
  { id: "w403-christine-pizan", branch: "france", y: 1405, when: "1405", title: "Christine de Pizan writes The Book of the City of Ladies",
    text: "The Italian-born court writer, who took up writing to support her family, wrote in this 1405 work of women known for heroism and virtue. Many of her writings defended women.", imp: 2,
    cites: [B("biography/Christine-de-Pisan", "Christine de Pisan")] },
  { id: "w403-orleans", branch: "france", y: D(1429, 5, 8), when: "May 8, 1429", title: "Joan of Arc relieves Orléans",
    text: "Joan, a peasant girl acting on what she took as divine guidance, entered Orléans on April 29, and the English abandoned the siege on May 8.", imp: 1, link: "england",
    cites: [W("Siege_of_Orl%C3%A9ans_(1428%E2%80%931429)", "Siege of Orléans (1428–1429)"), B("biography/Saint-Joan-of-Arc", "Saint Joan of Arc")] },
  { id: "w403-castillon", branch: "france", y: D(1453, 7, 17), when: "July 17, 1453", title: "Battle of Castillon ends the Hundred Years' War",
    text: "The French victory at Castillon in 1453 was the concluding battle of the Hundred Years' War between France and England.", imp: 2, link: "england",
    cites: [B("event/Battle-of-Castillon", "Battle of Castillon")] },

  // ---------- Golden Horde ----------
  { id: "w403-oz-beg", branch: "golden-horde", y: 1312, end: 1341, when: "1312–1341", title: "Öz Beg makes the Horde Muslim and Turkic",
    text: "Under its greatest khan, Öz Beg, the Horde became increasingly Turkified and Islamized. The traveler Ibn Battuta visited his capital, Sarai on the lower Volga.", imp: 2,
    cites: [B("topic/Golden-Horde", "Golden Horde"), B("biography/Ibn-Battutah", "Ibn Battūtah")] },
  { id: "w403-kulikovo", branch: "golden-horde", y: D(1380, 9, 8), when: "September 8, 1380", title: "Battle of Kulikovo",
    text: "Prince Dmitry of Moscow beat the Horde general Mamai near the Don, the first Russian victory over the Golden Horde Tatars after Batu's conquest.", imp: 2, link: "muscovy",
    cites: [B("event/Battle-of-Kulikovo", "Battle of Kulikovo"), B("biography/Mamai", "Mamai")] },
  { id: "w403-moscow-1382", branch: "golden-horde", y: D(1382, 8, 26), when: "August 26, 1382", title: "Tokhtamysh sacks Moscow",
    text: "Khan Tokhtamysh took Moscow by surprise while Dmitry Donskoy was away. Dmitry had to resume paying tribute, probably at a higher rate, and give up his son as a hostage.", imp: 2, link: "muscovy",
    cites: [W("Siege_of_Moscow_(1382)", "Siege of Moscow (1382)"), B("biography/Tokhtamysh", "Tokhtamysh")] },
  { id: "w403-timur-sarai", branch: "golden-horde", y: 1395, when: "1395", title: "Timur destroys Sarai Berke",
    text: "Timur broke Tokhtamysh, his former ally, in 1395. He destroyed Sarai Berke, the Horde's great capital, and deported its craftsmen to Central Asia, crippling the Horde.", imp: 1, link: "timurid",
    cites: [B("topic/Golden-Horde", "Golden Horde"), B("biography/Tokhtamysh", "Tokhtamysh"), B("biography/Timur", "Timur")] },
  { id: "w403-vorskla", branch: "golden-horde", y: D(1399, 8, 12), when: "August 12, 1399", title: "Edigu wins at the Vorskla River",
    text: "Edigu and Temür Kutlugh defeated Vytautas of Lithuania, who had backed the deposed Tokhtamysh. The defeat ended his attempt to extend control over southern Rus lands.", imp: 3,
    cites: [W("Battle_of_the_Vorskla_River", "Battle of the Vorskla River"), B("event/Battle-of-the-Vorskla-River", "Battle of the Vorskla River")] },
  { id: "w403-crimea-khanate", branch: "golden-horde", y: 1441, when: "1441 (Britannica: 1443)", title: "Hacı I Giray founds the Crimean Khanate",
    text: "Invited by Crimean separatists, the Genghisid Hacı I Giray founded a khanate. It saw itself as the Horde's legal successor.", imp: 2,
    cites: [W("Crimean_Khanate", "Crimean Khanate"), B("place/khanate-of-Crimea", "Khanate of Crimea")] },
  { id: "w403-kazan-khanate", branch: "golden-horde", y: 1445, when: "1437–1438 or 1445 (disputed)", title: "Khanate of Kazan emerges on the Volga",
    text: "Kazan broke from the disintegrating Horde under Ulugh Muhammad or his son Maxmud; historians disagree whether the date is 1437–38 or 1445.", imp: 3,
    cites: [W("Khanate_of_Kazan", "Khanate of Kazan"), B("place/Kazan-Russia", "Kazan")] },
  { id: "w403-great-horde-end", branch: "golden-horde", y: 1502, when: "1502", title: "Meñli I Giray defeats the last khan of the Great Horde",
    text: "The Crimean khan Meñli I Giray defeated the last khan of the Great Horde in 1502, ending the Horde's claims on Crimea. Britannica calls this the destruction of the last remnant of the Golden Horde.", imp: 2, link: "muscovy",
    cites: [W("Crimean_Khanate", "Crimean Khanate"), B("topic/Golden-Horde", "Golden Horde")] },
] });

TL.geo("w403-muret", { scope: "place", lat: 43.46, lon: 1.33, r: 40, label: "Muret, France", src: "https://en.wikipedia.org/wiki/Muret,_Haute-Garonne" });
TL.geo("w403-majorca", { scope: "place", lat: 39.57, lon: 2.65, r: 60, label: "Majorca, Spain", src: "https://en.wikipedia.org/wiki/Palma,_Majorca" });
TL.geo("w403-llull-ars", { scope: "place", lat: 39.57, lon: 2.65, r: 60, label: "Palma, Majorca", src: "https://en.wikipedia.org/wiki/Palma,_Majorca" });
TL.geo("w403-vespers", { scope: "place", lat: 38.11, lon: 13.35, r: 50, label: "Palermo, Sicily", src: "https://en.wikipedia.org/wiki/Palermo" });
TL.geo("w403-santa-maria-del-mar", { scope: "place", lat: 41.38, lon: 2.18, r: 30, label: "Barcelona, Spain", src: "https://en.wikipedia.org/wiki/Barcelona" });
TL.geo("w403-caspe", { scope: "place", lat: 41.23, lon: -0.04, r: 40, label: "Caspe, Spain", src: "https://en.wikipedia.org/wiki/Caspe" });
TL.geo("w403-tirant", { scope: "place", lat: 39.47, lon: -0.38, r: 40, label: "Valencia, Spain", src: "https://en.wikipedia.org/wiki/Valencia" });
TL.geo("w403-ferdinand-emperor", { scope: "place", lat: 42.61, lon: -5.57, r: 50, label: "León, Spain", src: "https://en.wikipedia.org/wiki/Le%C3%B3n,_Spain" });
TL.geo("w403-san-isidoro", { scope: "place", lat: 42.61, lon: -5.57, r: 30, label: "León, Spain", src: "https://en.wikipedia.org/wiki/Le%C3%B3n,_Spain" });
TL.geo("w403-toledo-1085", { scope: "place", lat: 39.86, lon: -4.02, r: 40, label: "Toledo, Spain", src: "https://en.wikipedia.org/wiki/Toledo,_Spain" });
TL.geo("w403-decreta-1188", { scope: "place", lat: 42.61, lon: -5.57, r: 30, label: "León, Spain", src: "https://en.wikipedia.org/wiki/Le%C3%B3n,_Spain" });
TL.geo("w403-salamanca-university", { scope: "place", lat: 40.97, lon: -5.66, r: 30, label: "Salamanca, Spain", src: "https://en.wikipedia.org/wiki/Salamanca" });
TL.geo("w403-kleidion", { scope: "place", lat: 41.34, lon: 22.93, r: 60, label: "Belasica mountains, Bulgaria/North Macedonia/Greece", src: "https://en.wikipedia.org/wiki/Belasica" });
TL.geo("w403-alexios-crowned", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Constantinople (Istanbul)", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w403-anna-alexiad", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Constantinople (Istanbul)", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w403-myriokephalon", { scope: "place", lat: 37.87, lon: 32.49, r: 100, label: "near Konya, Turkey", src: "https://en.wikipedia.org/wiki/Konya" });
TL.geo("w403-reconquest-1261", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Constantinople (Istanbul)", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w403-chora", { scope: "place", lat: 41.03, lon: 28.94, r: 30, label: "Istanbul, Turkey", src: "https://en.wikipedia.org/wiki/Chora_Church" });
TL.geo("w403-hesychast-council", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Constantinople (Istanbul)", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w403-florence-union", { scope: "place", lat: 43.77, lon: 11.26, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w403-plethon-florence", { scope: "place", lat: 43.77, lon: 11.26, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w403-alfonso-scholars", { scope: "place", lat: 39.86, lon: -4.02, r: 40, label: "Toledo, Spain", src: "https://en.wikipedia.org/wiki/Toledo,_Spain" });
TL.geo("w403-siete-partidas", { scope: "region", lat: 41.65, lon: -4.73, r: 300, label: "Castile and León, Spain", src: "https://en.wikipedia.org/wiki/Castile_and_Le%C3%B3n" });
TL.geo("w403-salado", { scope: "place", lat: 36.01, lon: -5.6, r: 50, label: "Tarifa, Spain", src: "https://en.wikipedia.org/wiki/Tarifa" });
TL.geo("w403-libro-buen-amor", { scope: "region", lat: 41.65, lon: -4.73, r: 300, label: "Castile and León, Spain", src: "https://en.wikipedia.org/wiki/Castile_and_Le%C3%B3n" });
TL.geo("w403-montiel", { scope: "region", lat: 41.65, lon: -4.73, r: 300, label: "Castile and León, Spain", src: "https://en.wikipedia.org/wiki/Castile_and_Le%C3%B3n" });
TL.geo("w403-seville-cathedral", { scope: "place", lat: 37.39, lon: -5.99, r: 30, label: "Seville, Spain", src: "https://en.wikipedia.org/wiki/Seville" });
TL.geo("w403-isabella-queen", { scope: "region", lat: 41.65, lon: -4.73, r: 300, label: "Castile and León, Spain", src: "https://en.wikipedia.org/wiki/Castile_and_Le%C3%B3n" });
TL.geo("w403-beowulf-ms", { scope: "region", lat: 53.13, lon: -1.38, r: 300, label: "England", src: "https://en.wikipedia.org/wiki/England" });
TL.geo("w403-cnut", { scope: "place", lat: 50.9, lon: -1.4, r: 40, label: "Southampton, England", src: "https://en.wikipedia.org/wiki/Southampton" });
TL.geo("w403-domesday", { scope: "region", lat: 53.13, lon: -1.38, r: 300, label: "England", src: "https://en.wikipedia.org/wiki/England" });
TL.geo("w403-geoffrey-monmouth", { scope: "place", lat: 51.81, lon: -2.72, r: 30, label: "Monmouth, Wales", src: "https://en.wikipedia.org/wiki/Monmouth,_Wales" });
TL.geo("w403-becket", { scope: "place", lat: 51.28, lon: 1.08, r: 30, label: "Canterbury, England", src: "https://en.wikipedia.org/wiki/Canterbury" });
TL.geo("w403-provisions-oxford", { scope: "place", lat: 51.75, lon: -1.26, r: 30, label: "Oxford, England", src: "https://en.wikipedia.org/wiki/Oxford" });
TL.geo("w403-peasants-revolt", { scope: "place", lat: 51.51, lon: -0.13, r: 60, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w403-canterbury-tales", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w403-agincourt", { scope: "place", lat: 50.46, lon: 2.14, r: 30, label: "Azincourt, France", src: "https://en.wikipedia.org/wiki/Azincourt" });
TL.geo("w403-caxton", { scope: "place", lat: 51.49, lon: -0.14, r: 30, label: "Westminster, London", src: "https://en.wikipedia.org/wiki/Westminster" });
TL.geo("w403-bosworth", { scope: "place", lat: 52.62, lon: -1.41, r: 30, label: "Market Bosworth, England", src: "https://en.wikipedia.org/wiki/Market_Bosworth" });
TL.geo("w403-cluny-iii", { scope: "place", lat: 46.44, lon: 4.66, r: 30, label: "Cluny, France", src: "https://en.wikipedia.org/wiki/Cluny" });
TL.geo("w403-troubadours", { scope: "region", lat: 44, lon: 2, r: 400, label: "Occitania, southern France", src: "https://en.wikipedia.org/wiki/Occitania" });
TL.geo("w403-roland", { scope: "region", lat: 47, lon: 2, r: 500, label: "France", src: "https://en.wikipedia.org/wiki/France" });
TL.geo("w403-saint-denis", { scope: "place", lat: 48.94, lon: 2.36, r: 30, label: "Saint-Denis, France", src: "https://en.wikipedia.org/wiki/Saint-Denis,_Seine-Saint-Denis" });
TL.geo("w403-notre-dame", { scope: "place", lat: 48.86, lon: 2.35, r: 30, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w403-chartres", { scope: "place", lat: 48.46, lon: 1.48, r: 30, label: "Chartres, France", src: "https://en.wikipedia.org/wiki/Chartres" });
TL.geo("w403-albigensian", { scope: "region", lat: 43.6, lon: 2.0, r: 200, label: "Languedoc, southern France", src: "https://en.wikipedia.org/wiki/Languedoc" });
TL.geo("w403-bouvines", { scope: "place", lat: 50.58, lon: 3.19, r: 30, label: "Bouvines, France", src: "https://en.wikipedia.org/wiki/Bouvines" });
TL.geo("w403-poitiers", { scope: "place", lat: 46.58, lon: 0.34, r: 40, label: "Poitiers, France", src: "https://en.wikipedia.org/wiki/Poitiers" });
TL.geo("w403-christine-pizan", { scope: "place", lat: 48.86, lon: 2.35, r: 30, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w403-orleans", { scope: "place", lat: 47.9, lon: 1.91, r: 30, label: "Orléans, France", src: "https://en.wikipedia.org/wiki/Orl%C3%A9ans" });
TL.geo("w403-castillon", { scope: "place", lat: 44.85, lon: -0.04, r: 30, label: "Castillon-la-Bataille, France", src: "https://en.wikipedia.org/wiki/Castillon-la-Bataille" });
TL.geo("w403-oz-beg", { scope: "region", lat: 48.7, lon: 44.5, r: 1500, label: "Golden Horde (lower Volga)", src: "https://en.wikipedia.org/wiki/Golden_Horde" });
TL.geo("w403-kulikovo", { scope: "place", lat: 53.61, lon: 38.67, r: 40, label: "Kulikovo Field, Russia", src: "https://en.wikipedia.org/wiki/Kulikovo_Field" });
TL.geo("w403-moscow-1382", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("w403-timur-sarai", { scope: "region", lat: 48.7, lon: 44.5, r: 1500, label: "Golden Horde (lower Volga)", src: "https://en.wikipedia.org/wiki/Golden_Horde" });
TL.geo("w403-vorskla", { scope: "place", lat: 49.59, lon: 34.55, r: 60, label: "Poltava, Ukraine", src: "https://en.wikipedia.org/wiki/Poltava" });
TL.geo("w403-crimea-khanate", { scope: "region", lat: 45.3, lon: 34.4, r: 200, label: "Crimea", src: "https://en.wikipedia.org/wiki/Crimea" });
TL.geo("w403-kazan-khanate", { scope: "place", lat: 55.8, lon: 49.11, r: 60, label: "Kazan, Russia", src: "https://en.wikipedia.org/wiki/Kazan" });
TL.geo("w403-great-horde-end", { scope: "region", lat: 48.7, lon: 44.5, r: 1500, label: "Golden Horde (lower Volga)", src: "https://en.wikipedia.org/wiki/Golden_Horde" });
