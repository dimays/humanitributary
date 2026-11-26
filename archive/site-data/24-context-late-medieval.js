// "Why it matters" context and cross-links: late medieval and early modern entries (1066–1607).
// TL.enrich(id, { why, connections: [{ id, note }], cites }); see SCHEMA.md, "Context: why it matters, and connections".

TL.enrich("me-hastings", {
  why: "The conquest replaced England's ruling class: by the Domesday survey of 1086 only about 5 percent of land south of the Tees was still in English hands, and after 1075 every earldom was held by a Norman. Anglo-Norman French displaced Old English among the elite, and French words and names entered English. Historians still debate how radical the change was; Richard Southern saw it as a turning point without parallel in Europe, while others think it less sweeping.",
  connections: [
    { id: "me-normandy-settled", note: "The Normans descended from Vikings allowed to settle in Normandy in 911" },
  ],
  cites: [
    { t: "Norman Conquest — Wikipedia", u: "https://en.wikipedia.org/wiki/Norman_Conquest" },
    { t: "What does Domesday Book tell us? — The National Archives (UK)", u: "https://www.nationalarchives.gov.uk/education/resources/domesday-book/", k: "archive" },
  ],
});

TL.enrich("me-first-crusade", {
  why: "Pope Urban II answered the Byzantine emperor Alexios I's appeal for military aid by urging Christians to undertake an armed pilgrimage to Jerusalem, perhaps hoping to heal the East–West Schism; the preaching of the crusade also ignited the Rhineland massacres of Jews. Crusaders kept a presence in the Levant until the Mamluks took their last mainland strongholds in 1291, and Italian merchants supplanted Muslim and Jewish rivals as the leading force in Mediterranean trade. Over time the movement grew to include campaigns against pagans, Christian dissidents and other enemies of the papacy.",
  connections: [
    { id: "me-great-schism", note: "Urban II may have hoped to heal the East–West Schism of 40 years earlier" },
    { id: "me-fourth-crusade", note: "A later crusade was diverted to Byzantium and sacked Constantinople" },
    { id: "seljuk", note: "Seljuk advances prompted the Byzantine appeal for aid" },
  ],
  cites: [
    { t: "First Crusade — Wikipedia", u: "https://en.wikipedia.org/wiki/First_Crusade" },
    { t: "Crusades — Wikipedia", u: "https://en.wikipedia.org/wiki/Crusades" },
  ],
});

TL.enrich("aragon", {
  why: "The Crown of Aragon was a composite monarchy: Aragon, Catalonia, Valencia and its other realms kept their own laws, taxes and parliaments (Corts), united only in the person of the king. At its 14th–15th-century height it was a sea power across much of the western Mediterranean. Ferdinand's 1469 marriage to Isabella of Castile created a dynastic union that became the founding event of the Spanish monarchy, but Aragon's own institutions and public law survived until Philip V's Nueva Planta decrees abolished them between 1707 and 1716.",
  connections: [
    { id: "castile", note: "Joined to Castile through Ferdinand and Isabella's marriage" },
    { id: "me-columbus-landfall", note: "Ferdinand II of Aragon and Isabella I of Castile sponsored Columbus" },
  ],
  cites: [
    { t: "Crown of Aragon — Wikipedia", u: "https://en.wikipedia.org/wiki/Crown_of_Aragon" },
    { t: "Christopher Columbus — Wikipedia", u: "https://en.wikipedia.org/wiki/Christopher_Columbus" },
  ],
});

TL.enrich("portugal", {
  why: "Portugal's 1415 conquest of Ceuta marked the beginning of its empire, and voyages sponsored by Prince Henry \"the Navigator\" pushed ever farther down Africa's west coast; Dias rounded Africa's southern tip in 1488 and da Gama reached India in 1498. Forts and trading posts, the first on Arguin in 1445, brought gold, ivory, pepper and enslaved people into the European market, and the 1494 Treaty of Tordesillas divided the world beyond Europe with Spain. Cabral reached Brazil, probably by accident, in 1500; it became the most valuable colony of the empire's second era (1663-1825), but Portugal's small population struggled to defend its overstretched network of trading posts.",
  connections: [
    { id: "me-tordesillas", note: "Divided newly found lands between Portugal and Spain" },
    { id: "me-da-gama-calicut", note: "Portugal's sea route to India around Africa" },
    { id: "kongo", note: "Diogo Cão's expedition met Kongo, and the two soon developed a rapport" },
  ],
  cites: [
    { t: "Portuguese Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Portuguese_Empire" },
    { t: "Kingdom of Portugal — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Portugal" },
  ],
});

TL.enrich("castile", {
  why: "The Christian conquest of Iberia was completed under Castile's crown: after the conquests of Córdoba and Seville only Granada remained under Muslim rule, and Isabella and Ferdinand entered it in January 1492 (many current historians dispute the very concept of the “Reconquista” as a later construction). That same year Columbus's expedition claimed lands in the Americas for the Crown of Castile, which later included them; the conquests of the Aztec and Inca empires and the Philippines made it a global empire in the 16th century.",
  connections: [
    { id: "al-andalus", note: "Its conquests pushed Iberia's Muslim states back to Granada" },
    { id: "me-columbus-landfall", note: "Columbus's 1492 expedition claimed the new lands for the Crown of Castile" },
    { id: "me-fall-tenochtitlan", note: "The conquest of the Aztec Empire helped make Castile a global empire" },
  ],
  cites: [
    { t: "Crown of Castile — Wikipedia", u: "https://en.wikipedia.org/wiki/Crown_of_Castile" },
    { t: "Reconquista — Wikipedia", u: "https://en.wikipedia.org/wiki/Reconquista" },
  ],
});

TL.enrich("spain", {
  why: "With Portugal, Spain ushered in Europe's Age of Discovery, and its empire became one of the largest in history. Gold and silver from mines in Mexico and at Potosí enriched the crown and financed its wars and expansion, and from 1565 the Manila galleons traded New World silver for Chinese and other Asian goods. The Bourbon reforms that centralized power and tensions between peninsular Spaniards and Creoles helped set the stage for the independence movements that cost Spain mainland America by the mid-1820s.",
  connections: [
    { id: "ming", note: "Manila galleons traded American silver for Chinese and other Asian goods" },
    { id: "viceroyalty-peru", note: "Potosí's Cerro Rico made Peru the world's greatest distributor of silver" },
    { id: "mexico", note: "Spain had lost Mexico and its other mainland colonies by the mid-1820s" },
  ],
  cites: [
    { t: "Spanish Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Spanish_Empire" },
    { t: "Manila galleon — Wikipedia", u: "https://en.wikipedia.org/wiki/Manila_galleon" },
    { t: "Viceroyalty of Peru — Wikipedia", u: "https://en.wikipedia.org/wiki/Viceroyalty_of_Peru" },
  ],
});

TL.enrich("benin-kingdom", {
  why: "Benin was one of the oldest and most developed states of West Africa's coastal hinterland; at its 15th–16th-century height it expanded and traded ivory, pepper and enslaved people with the Portuguese. Its palace plaques and heads, cast mostly in brass by a royal guild using the lost-wax method, are counted among the finest African sculptures; late-19th-century scholars wrongly credited the technique to the Portuguese, though such works were made in Benin before they arrived. Taken by British forces in 1897, the Benin Bronzes became a test case in the debate over returning cultural objects to Africa.",
  connections: [
    { id: "me-benin-portuguese", note: "Portuguese manillas became a source of brass for Benin's casters" },
    { id: "nigeria", note: "Nigeria has sought the Bronzes' return since its independence in 1960" },
  ],
  cites: [
    { t: "Kingdom of Benin — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Benin" },
    { t: "Benin Bronzes — Wikipedia", u: "https://en.wikipedia.org/wiki/Benin_Bronzes" },
  ],
});

TL.enrich("delhi-sultanate", {
  why: "The sultanate drew the Indian subcontinent more closely into the Islamic world's social and economic networks, visible in the rise of the Hindustani language and of Indo-Islamic architecture such as Delhi's Qutb Minar complex. It was one of the few powers to repel the Mongols, whose raids elsewhere drove soldiers, scholars, mystics and artisans from West and Central Asia into India. Sultans generally accepted Hindu officials and vassals, though some campaigns desecrated temples and destroyed libraries. Timur's sack of Delhi in 1398 transformed northern Indian politics.",
  connections: [
    { id: "me-timur-delhi", note: "Timur's 1398 raid weakened the sultanate as rival states rose" },
    { id: "vijayanagara", note: "A rival Hindu power that re-emerged in the upheaval after 1398" },
    { id: "mughal", note: "Babur's conquest in 1526 led to the Mughal Empire" },
  ],
  cites: [
    { t: "Delhi Sultanate — Wikipedia", u: "https://en.wikipedia.org/wiki/Delhi_Sultanate" },
  ],
});

TL.enrich("mongol-empire", {
  why: "Chinggis Khan unified the nomadic tribes of the Mongol heartland and gave them a law code, the Yassa, that forbade theft and fighting among Mongols and decreed religious freedom, along with a Mongolian script adapted from Uyghur. Under Ögedei a chain of relay stations, the yam, sped messengers across the empire, and its war routes became commercial routes. In an enforced Pax Mongolica, trade, technologies and ideas moved across Eurasia; one theory has the Black Death spreading with Mongol armies and traders, though genetic dating has challenged a Silk Road route. The empire later fractured into four khanates.",
  connections: [
    { id: "me-black-death", note: "One theory has the plague spreading west with Mongol armies and traders" },
    { id: "yuan", note: "One of the four parts of the fragmented empire, in China" },
    { id: "golden-horde", note: "Another of the four khanates, in the northwest of the empire" },
  ],
  cites: [
    { t: "Mongol Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Mongol_Empire" },
    { t: "Yam (route) — Wikipedia", u: "https://en.wikipedia.org/wiki/Yam_(route)" },
    { t: "Black Death — Wikipedia", u: "https://en.wikipedia.org/wiki/Black_Death" },
  ],
});

TL.enrich("great-zimbabwe", {
  why: "Great Zimbabwe's gold linked the southern African interior to Indian Ocean commerce through Swahili ports: Sofala was the main entrepôt for its gold and ivory, and Kilwa's acquisition of Sofala brought its sultans a windfall of gold revenue, while Persian earthenware and Chinese celadon and porcelain reached the plateau. Its ruins are among the oldest and largest structures in southern Africa. Because the site's own oral traditions did not survive, its history has been rebuilt mainly from archaeology, and scholars still disagree about the buildings' functions and the causes of its decline.",
  connections: [
    { id: "me-zimbabwe-gold", note: "Gold exports through the Swahili coast were the source of its wealth" },
  ],
  cites: [
    { t: "Kingdom of Zimbabwe — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Zimbabwe" },
    { t: "Great Zimbabwe — Wikipedia", u: "https://en.wikipedia.org/wiki/Great_Zimbabwe" },
    { t: "Kilwa Sultanate — Wikipedia", u: "https://en.wikipedia.org/wiki/Kilwa_Sultanate" },
  ],
});

TL.enrich("golden-horde", {
  why: "The Horde ruled the western steppe and held the Rus' principalities as tributaries, with the princes of Vladimir-Suzdal responsible for delivering the Russian tribute to the khan; Mengu-Timur exempted Russian clergy from taxation, and the Church built up new landed estates. Khans granted Genoese and Venetian merchants trading rights at Caffa and Azov, and the Horde's military power peaked under Özbeg Khan (1312–1341), who adopted Islam. After Timur's 1396 invasion it broke into smaller khanates, and Moscow formally rid itself of the “Tatar yoke” at the Ugra River in 1480.",
  connections: [
    { id: "me-mongols-take-rus", note: "The Mongol conquest of the Rus' lands that the Horde went on to rule" },
    { id: "me-ugra-1480", note: "The standoff that traditionally marks the end of Mongol rule over Russia" },
    { id: "muscovy", note: "Moscow's princes grew rich collecting the khan's tribute, then broke free" },
  ],
  cites: [
    { t: "Golden Horde — Wikipedia", u: "https://en.wikipedia.org/wiki/Golden_Horde" },
    { t: "Grand Duchy of Moscow — Wikipedia", u: "https://en.wikipedia.org/wiki/Grand_Duchy_of_Moscow" },
  ],
});

TL.enrich("ilkhanate", {
  why: "Officially called the “Land of Iran,” the Ilkhanate revived the idea of Iran as one territory, which Wikipedia calls a lasting, if unintended, legacy of Mongol rule; it helped pave the way for the Safavid state and modern Iran. Its links with Yuan China opened Iran to Chinese influence, and Iranian historians switched from Arabic to Persian. Hülegü destroyed the Abbasid Caliphate and faced mass revolts early in his rule; later Ghazan made Islam the state religion and carried out agricultural and fiscal reforms, and Tabriz became a major hub of commerce.",
  connections: [
    { id: "yuan", note: "Close ties with Yuan China carried Chinese influence to Iran" },
    { id: "safavid", note: "Its idea of a unified “Land of Iran” helped pave the way for the Safavids" },
    { id: "me-ghazan-islam", note: "Ghazan's conversion began the Ilkhans' rule as Muslims" },
  ],
  cites: [
    { t: "Ilkhanate — Wikipedia", u: "https://en.wikipedia.org/wiki/Ilkhanate" },
  ],
});

TL.enrich("me-sack-of-baghdad", {
  why: "The fall of Baghdad ended the 500-year-old Abbasid Caliphate; the line survived in Cairo only as Mamluk puppets, and power shifted to Tabriz, the Ilkhanate's capital. Muslim writers long blamed it for the end of the Islamic Golden Age, a view modern historians criticize as simplistic: Michal Biran has shown that large libraries reopened within two years, and later sieges did more to marginalize the city. The caliph's killing also angered Berke of the Golden Horde, who had been close to him, and war between the Horde and the Ilkhanate broke out in 1262.",
  connections: [
    { id: "me-ain-jalut", note: "Two years later the Mamluks defeated a Mongol army at Ain Jalut" },
    { id: "golden-horde", note: "Its khan Berke, close to the murdered caliph, went to war with the Ilkhans" },
    { id: "me-house-of-wisdom", note: "Centers of learning like the House of Wisdom made Baghdad an intellectual capital" },
  ],
  cites: [
    { t: "Siege of Baghdad (1258) — Wikipedia", u: "https://en.wikipedia.org/wiki/Siege_of_Baghdad_(1258)" },
    { t: "Golden Horde — Wikipedia", u: "https://en.wikipedia.org/wiki/Golden_Horde" },
    { t: "Battle of Ain Jalut — Wikipedia", u: "https://en.wikipedia.org/wiki/Battle_of_Ain_Jalut" },
  ],
});

TL.enrich("mali", {
  why: "At its peak Mali was the largest empire in West Africa, covering more land for longer than any West African state before or since, and its rulers were renowned for their wealth. Mansa Musa's 1324 pilgrimage spent so much gold that its value in Egypt and Arabia fell for twelve years, and the 1375 Catalan Atlas showed him holding a gold coin; he built mosques in Timbuktu and Gao and turned Sankore into an Islamic university. Ibn Battuta, whose account is a major source on 14th-century Mali, praised the security travelers enjoyed across the whole country.",
  connections: [
    { id: "me-mansa-musa-hajj", note: "The pilgrimage whose lavish gold spending caused inflation in Egypt" },
    { id: "ghana-empire", note: "Mali began to develop in the 11th-12th centuries as Ghana declined" },
    { id: "songhai", note: "Gao broke free of Mali; Songhai later seized Timbuktu in 1468" },
  ],
  cites: [
    { t: "Mali Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Mali_Empire" },
    { t: "Ibn Battuta: Travels in Asia and Africa, 1325–1354 — Internet Medieval Sourcebook, Fordham University", u: "https://sourcebooks.fordham.edu/source/1354-ibnbattuta.asp", k: "primary" },
  ],
});

TL.enrich("muscovy", {
  why: "Moscow rose by serving the Golden Horde: Ivan I collected the khan's tribute from other Russian princes, which enriched Moscow, and the head of the Russian Orthodox Church moved there, making it the spiritual center of Russian Orthodoxy. The Russian Church declared itself autocephalous in 1448, and the fall of Constantinople in 1453 confirmed its independence. Ivan III absorbed nearly all the other Russian states, styled himself sovereign of all Russia and laid the foundations of the centralized state that became Tsarist Russia.",
  connections: [
    { id: "golden-horde", note: "Its princes held their title from the khan and gathered his tribute" },
    { id: "me-fall-of-constantinople", note: "Confirmed the independence of the Russian Orthodox Church" },
    { id: "me-ugra-1480", note: "Ivan III's 1480 stand traditionally ends Tatar suzerainty" },
  ],
  cites: [
    { t: "Grand Duchy of Moscow — Wikipedia", u: "https://en.wikipedia.org/wiki/Grand_Duchy_of_Moscow" },
    { t: "Golden Horde — Wikipedia", u: "https://en.wikipedia.org/wiki/Golden_Horde" },
  ],
});

TL.enrich("ethiopia", {
  why: "By claiming descent from Aksum's last king and from Solomon and the Queen of Sheba, the Solomonic rulers tied their state to an ancient Christian heritage, which it maintained despite hostile neighbors. The empire peaked under Zara Yaqob (1434–1468) and survived the Ottoman-backed Adal jihad with Portuguese help in 1543. Menelik II's victory at Adwa in 1896 secured its independence from Italy, and after Mussolini's occupation it became a founding member of the United Nations.",
  connections: [
    { id: "aksum", note: "Its founder claimed descent from the last Aksumite king" },
    { id: "me-adal-war", note: "The Adal jihad, defeated with Portuguese help in 1543" },
    { id: "lc-adwa", note: "The victory over Italy that preserved Ethiopian independence" },
  ],
  cites: [
    { t: "Ethiopian Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Ethiopian_Empire" },
  ],
});

TL.enrich("yuan", {
  why: "Kublai's conquest of the Song reunited northern and southern China for the first time in three hundred years, under a Mongol rather than a Han Chinese emperor; he ranked Yuan society in classes with the Han at the bottom, and educated Chinese lost much of the esteem they had held under native dynasties. The Pax Mongolica promoted East–West exchange: Muslims brought Middle Eastern astronomy, cartography and medicine, Chinese printing techniques and porcelain reached Europe and West Asia, and Marco Polo wrote the most influential European account of Yuan China. Drama and the novel flourished, and the Ming founder adopted the Yuan garrison system.",
  connections: [
    { id: "me-song-falls", note: "The 1279 battle that completed the conquest of the Song" },
    { id: "me-mongol-invasions-japan", note: "Kublai's two attempted sea invasions of Japan" },
    { id: "ming", note: "The Ming founder admired the Mongols' unification and kept their garrisons" },
  ],
  cites: [
    { t: "Yuan dynasty — Wikipedia", u: "https://en.wikipedia.org/wiki/Yuan_dynasty" },
  ],
});

TL.enrich("majapahit", {
  why: "One of the last major Hindu-Buddhist empires of Southeast Asia, Majapahit is considered one of the greatest in the region's history; the 1365 court poem Nagarakṛtāgama lists 98 tributaries from Sumatra to New Guinea, though historians debate how far its power reached. Its influence extended beyond modern Indonesia, and after its fall many courtiers, artisans, priests and royals moved east to Bali. The Majapahit-era poem Sutasoma is an important text for modern Indonesian nationhood and the source of Indonesia's motto, “Bhinneka Tunggal Ika” (usually translated as Unity in Diversity).",
  connections: [
    { id: "srivijaya", note: "Its 1377 attack on Palembang helped end the Srivijayan successor kingdom" },
    { id: "yuan", note: "Majapahit rose to power after the Mongol invasion of Java" },
    { id: "indonesia", note: "A Majapahit-era poem supplied Indonesia's national motto" },
  ],
  cites: [
    { t: "Majapahit — Wikipedia", u: "https://en.wikipedia.org/wiki/Majapahit" },
  ],
});

TL.enrich("ottoman", {
  why: "At its height the empire spanned much of southeastern Europe, West Asia and North Africa: Suleiman I conquered southern and central Hungary, besieged Vienna in 1529 and, by taking Baghdad, gained access to the Persian Gulf. It gave its confessional communities varying autonomy, with Jewish and Christian leaders over their own communities, and Mehmed II and Bayezid II encouraged Jews persecuted in Spain to settle in Istanbul and Salonica; the devshirme forcibly recruited Balkan Christian boys as soldiers and officials. Scholars date its decline from the 1683 defeat at Vienna, and after World War I the Allies partitioned it, giving its southern lands to Britain and France.",
  connections: [
    { id: "me-fall-of-constantinople", note: "Made the conquered city the Ottoman capital in 1453" },
    { id: "me-vienna-1683", note: "The defeat from which modern scholars date its decline" },
    { id: "lc-tanzimat", note: "19th-century reforms that made the state stronger and more organized" },
  ],
  cites: [
    { t: "Ottoman Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Ottoman_Empire" },
    { t: "Devshirme — Wikipedia", u: "https://en.wikipedia.org/wiki/Devshirme" },
  ],
});

TL.enrich("renaissance", {
  why: "Renaissance humanism revived the literary, philosophical and artistic achievements of classical antiquity and, as HISTORY puts it, urged people to embrace human achievement in education, the arts and science. Painters developed linear perspective, and the period contributed to modern diplomacy, banking and accounting. Historians debate its causes, pointing to Florence's politics and Medici patronage, Greek scholars who brought manuscripts to Italy after 1453, and the Black Death's effect on how people saw the world. Humanism also encouraged Europeans to question the role of the Catholic Church.",
  connections: [
    { id: "me-fall-of-constantinople", note: "Sent émigré Greek scholars and manuscripts to Italy" },
    { id: "me-black-death", note: "One theory links the plague's toll in Florence to a new worldview" },
    { id: "me-gutenberg-bible", note: "The printing press spread Renaissance ideas more quickly" },
  ],
  cites: [
    { t: "Renaissance — Wikipedia", u: "https://en.wikipedia.org/wiki/Renaissance" },
    { t: "Renaissance — HISTORY", u: "https://www.history.com/articles/renaissance", k: "reference" },
  ],
});

TL.enrich("hx-florence-dome", {
  why: "No dome of its size had been built in Europe since antiquity, and with buttresses forbidden and timber for scaffolding unobtainable, no one knew how one could stand without collapsing. Brunelleschi's solution used a new hoisting machine, later admired by Leonardo da Vinci, and a herringbone brick pattern seemingly forgotten in Europe. Considered a founding father of Renaissance architecture and the first modern engineer, he also received the first patent in the Western world (1421) and devised the linear perspective that governed depictions of space in art until the late 19th century.",
  connections: [
    { id: "renaissance", note: "Brunelleschi is seen as a founding father of Renaissance architecture" },
  ],
  cites: [
    { t: "Filippo Brunelleschi — Wikipedia", u: "https://en.wikipedia.org/wiki/Filippo_Brunelleschi" },
    { t: "Florence Cathedral — Wikipedia", u: "https://en.wikipedia.org/wiki/Florence_Cathedral" },
  ],
});

TL.enrich("maori", {
  why: "Over centuries of isolation, Māori developed a distinct culture whose language, mythology, crafts and performing arts evolved independently of other East Polynesian cultures; some moved to the Chatham Islands, where their descendants became the Moriori. After the 1840 Treaty of Waitangi, disputes over land sales led to war in the 1860s and land confiscations, and disease and upheaval cut the population sharply before it recovered from about 1900. A protest movement from the 1960s and Treaty claims have fueled a cultural revival and ongoing redress; in 2023 Māori were 19.6 percent of New Zealanders.",
  connections: [
    { id: "polynesians", note: "Descended from East Polynesian voyagers" },
    { id: "lc-treaty-of-waitangi", note: "The 1840 treaty at the center of later efforts at redress" },
    { id: "new-zealand", note: "Māori are New Zealand's second-largest ethnic group" },
  ],
  cites: [
    { t: "Māori people — Wikipedia", u: "https://en.wikipedia.org/wiki/M%C4%81ori_people" },
  ],
});

TL.enrich("vijayanagara", {
  why: "Vijayanagara rose amid the disruption caused by the Delhi Sultanate's incursions into the Deccan and at its peak held primacy across the southern peninsula. Its temple complexes, with tall gateway towers (rajagopurams) and pillared halls, synthesized earlier Chalukya, Hoysala, Pandya and Chola forms; its court fostered literature in Kannada, Telugu, Tamil and Sanskrit, and Carnatic music took its classical framework in this era. European travelers ranked it with Ming China and Ayutthaya among Asia's great powers. Defeat by the allied Deccan sultanates at Talikota in 1565 broke its central authority.",
  connections: [
    { id: "delhi-sultanate", note: "Rose after the sultanate's incursions into the Deccan" },
    { id: "me-talikota", note: "The 1565 defeat that sharply diminished its central power" },
    { id: "ayutthaya", note: "Named with Ayutthaya and Ming China as Asia's three great powers" },
  ],
  cites: [
    { t: "Vijayanagara Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Vijayanagara_Empire" },
    { t: "Ayutthaya Kingdom — Wikipedia", u: "https://en.wikipedia.org/wiki/Ayutthaya_Kingdom" },
  ],
});

TL.enrich("me-black-death", {
  why: "One theory traces the plague's spread west along Silk Road routes with Mongol armies and traders, though genetic dating has challenged that route; trade disruption it caused helped bring down the Mongol Empire. In Cairo between a third and 40 percent of residents died within eight months. In Europe Jews were accused of poisoning wells, and by 1351, 60 major and 150 smaller Jewish communities had been destroyed. For survivors, labor shortages sent wages soaring and gave commoners more freedom, which probably helped destabilize feudalism; some historians tie the toll in Italy to the worldview that led to the Renaissance.",
  connections: [
    { id: "mongol-empire", note: "One theory has the disease spreading with Mongol armies and traders" },
    { id: "me-hundred-years-war", note: "Plague and war together brought labor shortages and unrest in France and England" },
    { id: "renaissance", note: "Some historians tie the plague's toll in Florence to the Renaissance" },
  ],
  cites: [
    { t: "Black Death — Wikipedia", u: "https://en.wikipedia.org/wiki/Black_Death" },
    { t: "Hundred Years' War — Wikipedia", u: "https://en.wikipedia.org/wiki/Hundred_Years%27_War" },
    { t: "Renaissance — Wikipedia", u: "https://en.wikipedia.org/wiki/Renaissance" },
  ],
});

TL.enrich("ayutthaya", {
  why: "European travelers of the early 16th century counted Ayutthaya among the three great powers of Asia, with Vijayanagara and Ming China, and it is considered the precursor of modern Thailand. A center of international trade in the 17th and 18th centuries, it felt strong Persian and then European influence under Narai, who sent an embassy to Louis XIV in 1686. Its late period has been called a golden age of Siamese culture, and after its destruction Siam recovered quickly, moving its capital to Thonburi and then Bangkok.",
  connections: [
    { id: "ming", note: "In 1419 the Yongle emperor sent an envoy to warn Siam off Malacca" },
    { id: "vijayanagara", note: "Ranked with Vijayanagara and Ming China as Asia's great powers" },
  ],
  cites: [
    { t: "Ayutthaya Kingdom — Wikipedia", u: "https://en.wikipedia.org/wiki/Ayutthaya_Kingdom" },
    { t: "Malacca Sultanate — Wikipedia", u: "https://en.wikipedia.org/wiki/Malacca_Sultanate" },
  ],
});

TL.enrich("ming", {
  why: "Hongwu issued edicts forbidding Mongol practices and vowed to purify China of “barbarian” influence, and his maritime bans, meant to stop Japanese pirates, instead turned many coastal people into smugglers. His son, the Yongle emperor, moved the capital to Beijing and sent Zheng He on seven voyages into the Indian Ocean as far as Arabia and East Africa. Later, Portuguese, Spanish and Dutch trade brought a massive influx of American silver, and New World chili peppers, maize and potatoes reshaped diets and spurred population growth. In 1644 Li Zicheng's rebels took Beijing, and the Manchu-led Qing then defeated them.",
  connections: [
    { id: "me-zheng-he", note: "Yongle's seven voyages into the Indian Ocean as far as East Africa" },
    { id: "me-imjin-war", note: "Ming armies helped Korea repel Japan's invasions of the 1590s" },
    { id: "me-columbian-exchange", note: "Chili peppers, maize and potatoes from the Americas reshaped diets" },
  ],
  cites: [
    { t: "Ming dynasty — Wikipedia", u: "https://en.wikipedia.org/wiki/Ming_dynasty" },
    { t: "Joseon — Wikipedia", u: "https://en.wikipedia.org/wiki/Joseon" },
  ],
});

TL.enrich("timurid", {
  why: "Timur saw himself as the great restorer of Chinggis Khan's empire; at Delhi he massacred the population but spared craftsmen to send to Samarkand. He would not integrate autonomous tribes into his power structure, and after his death many of his governors became independent. His 1402 defeat of the Ottomans at Ankara plunged their empire into civil war. Under Shahrukh and Ulugh Beg, Samarkand and Herat were centers of a Timurid Renaissance that joined the dynasty's Turco-Mongol origins with Persian high culture, and the Timurid prince Babur went on to found the Mughal Empire.",
  connections: [
    { id: "me-ankara", note: "Timur's victory over the Ottoman sultan Bayezid I" },
    { id: "me-timur-delhi", note: "Timur's army took Delhi in 1398 and massacred its people" },
    { id: "mughal", note: "Founded by the Timurid prince Babur in 1526" },
  ],
  cites: [
    { t: "Timurid Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Timurid_Empire" },
  ],
});

TL.enrich("kongo", {
  why: "Kongo's ties with Portugal were especially close: its king was baptized in 1491 as João I, named for Portugal's king, and Catholicism became the state cult of its ruling class. As São Tomé's sugar plantations grew, Kongo became a major source of enslaved people. King Afonso I insisted that Kongolese law be followed and free Kongolese not be enslaved, and set up a committee to check whether those being sold were lawfully enslaved, at one point threatening to stop the trade altogether. Its lands were later absorbed into Portuguese Angola and the Congo Free State, and a modern movement, Bundu dia Kongo, seeks to revive the kingdom.",
  connections: [
    { id: "me-kongo-portuguese", note: "The first Portuguese contact and the king's baptism" },
    { id: "me-afonso-letters", note: "Afonso's protests about the slave trade's effects on Kongo" },
    { id: "me-atlantic-slave-trade", note: "Kongo became a major source of enslaved Africans" },
  ],
  cites: [
    { t: "Kingdom of Kongo — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Kongo" },
  ],
});

TL.enrich("joseon", {
  why: "Over 505 years Joseon entrenched Neo-Confucian ideals in Korean society while discouraging Buddhism, and it saw the height of classical Korean culture, science and technology; King Sejong's best-remembered contribution was the Hangul alphabet. Its rulers sought to limit contact with foreign countries, and after the Japanese and Manchu invasions its harsh isolationism earned it the name “hermit kingdom” in the West. Modern Korean bureaucracy and administrative divisions, the modern Korean language and much of Korean etiquette and social norms derive from the Joseon period.",
  connections: [
    { id: "me-hangul", note: "Sejong's alphabet, created in 1443" },
    { id: "me-imjin-war", note: "Ming armies helped Korea repel Japan's invasions of 1592 and 1597" },
    { id: "confucianism", note: "Neo-Confucianism was Joseon's state ideology" },
  ],
  cites: [
    { t: "Joseon — Wikipedia", u: "https://en.wikipedia.org/wiki/Joseon" },
  ],
});

TL.enrich("aztec", {
  why: "Aztec rule was hegemonic: conquered cities kept their own rulers so long as they paid tribute and supplied troops, creating an integrated economic network of diverse peoples with significant local autonomy. That indirect rule also made rebellions commonplace, and Cortés allied with Tlaxcala and returned to besiege Tenochtitlan with up to 100,000 mostly Indigenous warriors. A smallpox outbreak killed more than half the region's population, including the emperor Cuitláhuac, and after the conquest the Spanish built Mexico City, capital of New Spain, on Tenochtitlan's site.",
  connections: [
    { id: "me-tenochtitlan-founded", note: "The Mexica capital that came to dominate the alliance" },
    { id: "me-fall-tenochtitlan", note: "Tlaxcalan and other Indigenous allies made up most of Cortés's army" },
  ],
  cites: [
    { t: "Aztec Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Aztec_Empire" },
    { t: "Fall of Tenochtitlan — Wikipedia", u: "https://en.wikipedia.org/wiki/Fall_of_Tenochtitlan" },
    { t: "New Spain — Wikipedia", u: "https://en.wikipedia.org/wiki/New_Spain" },
  ],
});

TL.enrich("inca", {
  why: "The anthropologist Gordon McEwan wrote that the Incas built \"one of the greatest imperial states in human history\" without the wheel, draft animals, iron or writing, keeping records on knotted strings (quipu) and binding their realm with an extensive road network. The empire worked largely without money or markets: subjects owed labor, usually as mit'a, and rulers reciprocated with access to land and goods and with feasts. Weakened by a war of succession and by disease, which possibly killed the ruler Huayna Capac a disputed claim, it fell to Pizarro; Manco Inca's siege of Cusco, begun in May 1536, was lifted after about ten months, with Spanish reinforcements probably a factor.",
  connections: [
    { id: "me-cajamarca", note: "Pizarro's seizure of Atahualpa opened the Spanish conquest" },
    { id: "viceroyalty-peru", note: "Created in 1542 to govern the conquered Inca lands" },
  ],
  cites: [
    { t: "Inca Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Inca_Empire" },
    { t: "Spanish conquest of the Inca Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Spanish_conquest_of_the_Inca_Empire" },
    { t: "Siege of Cusco — Wikipedia", u: "https://en.wikipedia.org/wiki/Siege_of_Cusco" },
    { t: "Viceroyalty of Peru — Wikipedia", u: "https://en.wikipedia.org/wiki/Viceroyalty_of_Peru" },
  ],
});

TL.enrich("me-fall-tenochtitlan", {
  why: "The Spanish-led coalition that took the city on August 13, 1521, was made up mainly of Tlaxcalan warriors, and the Aztec Empire, many of whose tributary states were divided internally, was highly susceptible to such division. A smallpox epidemic, to which the Spanish were largely immune, had already killed much of its leadership. Cortés built Mexico City, the capital of New Spain, on the site, and colonial rule brought the forced conversion of Indigenous peoples to Catholicism. His Nahua interpreter, La Malinche, is seen today as the embodiment of treachery, the quintessential victim, or the symbolic mother of the Mexican people.",
  connections: [
    { id: "new-spain", note: "The rebuilt city became the capital of New Spain" },
    { id: "me-columbian-exchange", note: "Smallpox brought by the Spanish devastated the city" },
    { id: "castile", note: "The conquest helped make the Crown of Castile a global empire" },
  ],
  cites: [
    { t: "Fall of Tenochtitlan — Wikipedia", u: "https://en.wikipedia.org/wiki/Fall_of_Tenochtitlan" },
    { t: "New Spain — Wikipedia", u: "https://en.wikipedia.org/wiki/New_Spain" },
    { t: "La Malinche — Wikipedia", u: "https://en.wikipedia.org/wiki/La_Malinche" },
    { t: "Crown of Castile — Wikipedia", u: "https://en.wikipedia.org/wiki/Crown_of_Castile" },
  ],
});

TL.enrich("me-cajamarca", {
  why: "Pizarro arrived in November 1532 while the empire was in the midst of a war of succession, begun after Huayna Capac died, probably of smallpox, and the turmoil greatly aided the Spanish. Many scholars now call the event the Cajamarca massacre: the Spanish killed thousands of Atahualpa's counselors, commanders and unarmed attendants in the town's plaza. Atahualpa offered to fill a large room with gold and twice that amount in silver, but Pizarro had no intention of releasing him, and he was garroted in August 1533; the capture opened the long Spanish conquest of Peru.",
  connections: [
    { id: "me-fall-tenochtitlan", note: "Pizarro's audacious scheme recalled Cortés's exploits in Mexico" },
    { id: "viceroyalty-peru", note: "Created in 1542 to govern the lands of the fallen Inca Empire" },
  ],
  cites: [
    { t: "Battle of Cajamarca — Wikipedia", u: "https://en.wikipedia.org/wiki/Battle_of_Cajamarca" },
    { t: "Spanish conquest of the Inca Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Spanish_conquest_of_the_Inca_Empire" },
    { t: "Viceroyalty of Peru — Wikipedia", u: "https://en.wikipedia.org/wiki/Viceroyalty_of_Peru" },
  ],
});

TL.enrich("me-fall-of-constantinople", {
  why: "For many modern historians the city's fall marks the end of the medieval period and the start of the early modern; it also heralded a change in siege warfare, as Ottoman gunpowder artillery overcame walls that had held off attackers for about 800 years. Greek scholars such as John Argyropoulos and Constantine Lascaris found refuge in the Latin West, bringing Greco-Roman learning that helped propel the Renaissance. In the West the loss shocked many, who feared other Christian kingdoms would share its fate, and Pope Pius II strongly advocated a new crusade.",
  connections: [
    { id: "byzantine", note: "The effective end of a Roman state that had lasted nearly 1,500 years" },
    { id: "renaissance", note: "Fleeing Greek scholars contributed to Italy's Renaissance" },
    { id: "muscovy", note: "Confirmed the independence of the Russian Orthodox Church" },
  ],
  cites: [
    { t: "Fall of Constantinople — Wikipedia", u: "https://en.wikipedia.org/wiki/Fall_of_Constantinople" },
    { t: "Grand Duchy of Moscow — Wikipedia", u: "https://en.wikipedia.org/wiki/Grand_Duchy_of_Moscow" },
  ],
});

TL.enrich("me-gutenberg-bible", {
  why: "Movable type was already in use in East Asia, but Gutenberg's press, type-casting method and oil-based ink allowed much faster printing. The spread of printing brought an era of mass communication to Europe: printed texts grew cheaper and more available, adult literacy rose, books increasingly appeared in vernacular languages rather than Latin, and national languages were standardized. Printing had a profound impact on the Renaissance and the Reformation and contributed to the Scientific Revolution; Luther's Ninety-five Theses were printed and circulated widely, and German printers turned out 291 editions of his works.",
  connections: [
    { id: "me-bi-sheng-type", note: "Bi Sheng invented the first movable type, of baked clay, in the 11th century" },
    { id: "me-jikji", note: "The oldest surviving book printed with metal movable type" },
    { id: "protestantism", note: "Printing helped Luther's challenge spread across Germany" },
  ],
  cites: [
    { t: "Johannes Gutenberg — Wikipedia", u: "https://en.wikipedia.org/wiki/Johannes_Gutenberg" },
    { t: "Printing press — Wikipedia", u: "https://en.wikipedia.org/wiki/Printing_press" },
  ],
});

TL.enrich("songhai", {
  why: "At its peak Songhai was one of the largest African empires in history; under Sonni Ali it surpassed Mali in area, wealth and power, taking Timbuktu in 1468 and Djenné after a seven-year siege. Askia Muhammad centralized the administration, made the pilgrimage to Mecca and founded centers of learning, and Timbuktu saw a revival of Islamic scholarship while trans-Saharan trade flourished. A war of succession after Askia Daoud's death split the empire, and in 1591 a Moroccan army with thousands of arquebusiers and eight English cannons routed a far larger Songhai force at Tondibi.",
  connections: [
    { id: "mali", note: "Songhai expanded as Mali weakened and surpassed it in area and wealth" },
    { id: "me-tondibi", note: "Morocco's firearms defeated the larger Songhai army in 1591" },
  ],
  cites: [
    { t: "Songhai Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Songhai_Empire" },
    { t: "Battle of Tondibi — Wikipedia", u: "https://en.wikipedia.org/wiki/Battle_of_Tondibi" },
  ],
});

TL.enrich("me-columbus-landfall", {
  why: "Columbus continued to claim he had reached Asia; the continents came to be named for Amerigo Vespucci, and his first voyage began the European exploration and colonization of the Americas. Fordham's Medieval Sourcebook calls the voyage's meaning highly contested: it showed the vitality of a Europe on the verge of world hegemony, but its direct result, with later voyages, was the virtual extermination of most Native inhabitants by ill-treatment and disease and the enormous growth of the transatlantic slave trade. That debate continues in the US, where cities such as Berkeley and Los Angeles have replaced Columbus Day with Indigenous Peoples' Day.",
  connections: [
    { id: "me-lanse-aux-meadows", note: "Norse explorers had reached North America nearly 500 years earlier" },
    { id: "me-tordesillas", note: "Portugal objected to the voyage, and the 1494 treaty settled the claims" },
    { id: "me-columbian-exchange", note: "The voyages opened the two-way exchange of crops, animals and disease" },
  ],
  cites: [
    { t: "Christopher Columbus: Extracts from Journal — Internet Medieval Sourcebook, Fordham University", u: "https://sourcebooks.fordham.edu/source/columbus1.asp", k: "primary" },
    { t: "Christopher Columbus — Wikipedia", u: "https://en.wikipedia.org/wiki/Christopher_Columbus" },
    { t: "Indigenous Peoples' Day (United States) — Wikipedia", u: "https://en.wikipedia.org/wiki/Indigenous_Peoples%27_Day_(United_States)" },
  ],
});

TL.enrich("me-columbian-exchange", {
  why: "Lacking immunity to Old World diseases, the Indigenous peoples of the Americas suffered a population collapse of 80 to 95 percent, worsened by Spanish exploitation; smallpox alone is estimated to have killed 40 percent of Tenochtitlan's 200,000 people in 1520. American crops spread across the world: potatoes became a staple in Europe, cassava replaced sorghum and millet as Africa's most important food crop, and maize and sweet potatoes reached Asia. The colonists' need for labor and the cultivation of crops such as sugar cane increased demand for enslaved Africans, while horses dramatically expanded the hunting range of Native Americans such as the Plains peoples.",
  connections: [
    { id: "me-atlantic-slave-trade", note: "Sugar cultivation in the Americas increased the demand for enslaved labor" },
    { id: "me-fall-tenochtitlan", note: "Smallpox weakened Tenochtitlan before its fall" },
    { id: "ming", note: "Chili peppers entered Sichuan cooking; maize and potatoes fed population growth" },
  ],
  cites: [
    { t: "Columbian exchange — Wikipedia", u: "https://en.wikipedia.org/wiki/Columbian_exchange" },
    { t: "Ming dynasty — Wikipedia", u: "https://en.wikipedia.org/wiki/Ming_dynasty" },
  ],
});

TL.enrich("me-atlantic-slave-trade", {
  why: "About 12.75 million Africans were loaded onto slave ships for the Americas, and up to 2 million died on the voyage; about 3.8 million were taken to the Caribbean and roughly as many to Brazil. Europeans usually bought people captured in endemic warfare between African states, paying with muskets, cloth and alcohol, and rulers used slaving profits partly to buy guns for their armies; the historian J. C. Sharman links the trade's late-17th-century expansion to highly militarized predatory slaving states in West Africa. Patrick Manning estimates that some 4 million more died inside Africa after capture.",
  connections: [
    { id: "colonial-brazil", note: "Brazil received about as many captives as the whole Caribbean" },
    { id: "me-columbian-exchange", note: "Sugar cultivation in the Americas increased demand for enslaved labor" },
    { id: "lc-slave-trade-act", note: "Britain abolished its slave trade in 1807" },
  ],
  cites: [
    { t: "Atlantic slave trade — Wikipedia", u: "https://en.wikipedia.org/wiki/Atlantic_slave_trade" },
    { t: "Columbian exchange — Wikipedia", u: "https://en.wikipedia.org/wiki/Columbian_exchange" },
  ],
});

TL.enrich("sikhism", {
  why: "UCLA's capsule account describes Guru Nanak's teaching as a simple monotheistic faith without idolatry, founded on human equality, critical of caste distinctions and respectful of the dignity of labor. Later Gurus gave it the Gurmukhi script and the holy city of Amritsar; Mughal hostility brought the execution of Guru Arjan and, on the conventional account, of Guru Tegh Bahadur, and Gobind Singh founded the Khalsa to safeguard the community. A Sikh kingdom under Ranjit Singh held out until the Anglo-Sikh wars of the 1840s, and though Sikhism is clearly a distinct religion, its boundary with Hinduism was long blurred.",
  connections: [
    { id: "hx-khalsa-founded", note: "Gobind Singh's plan to safeguard the Sikh community" },
    { id: "mughal", note: "Mughal rulers executed Guru Arjan and persecuted Sikhs under Aurangzeb" },
    { id: "hinduism", note: "The line between Sikh and Hindu practice was long porous in the Punjab" },
  ],
  cites: [
    { t: "Sikhism: A Capsule Account — UCLA Center for India and South Asia", u: "https://southasia.ucla.edu/religions/paths/sikhism", k: "reference" },
  ],
});

TL.enrich("colonial-brazil", {
  why: "Brazil's colonial economy moved through cycles of brazilwood, sugar, and gold and diamond mining, worked mainly by enslaved Africans; an estimated 35 percent of all Africans captured in the Atlantic slave trade were sent to Brazil. Dutch and French sugar from the Antilles undercut its sugar boom, and in 1763 the capital moved from Salvador to Rio de Janeiro. Unlike Spanish America, which split into many republics, Brazil stayed a single unit under a monarch and became Latin America's largest country, with Portuguese central to its identity; in 1888 it became the last country in the Americas to abolish slavery.",
  connections: [
    { id: "me-tordesillas", note: "The 1494 treaty divided the New World; Cabral landed in Brazil in 1500" },
    { id: "me-atlantic-slave-trade", note: "Brazil's plantations and mines drew a vast share of enslaved Africans" },
    { id: "lc-lei-aurea", note: "Brazil abolished slavery only in 1888" },
  ],
  cites: [
    { t: "Colonial Brazil — Wikipedia", u: "https://en.wikipedia.org/wiki/Colonial_Brazil" },
    { t: "Lei Áurea — Wikipedia", u: "https://en.wikipedia.org/wiki/Lei_%C3%81urea" },
  ],
});

TL.enrich("safavid", {
  why: "Ismail I made Twelver Shi'ism the official religion and conversion mandatory for a largely Sunni population, a turning point in Islamic history whose mark lasts in Iran, where Twelver Shi'ism is still the state religion. Ottoman hostility to Ismail's followers as heretics fed long wars: Selim I's victory at Chaldiran in 1514 let the Ottomans briefly occupy Tabriz and shattered Ismail's aura of invincibility. Abbas I, generally considered one of the most important rulers in Iranian history, reigned over the state at its military, political and economic height, moved the capital to Isfahan in 1598 and, with English ships' help, retook Hormuz from the Portuguese in 1622.",
  connections: [
    { id: "me-chaldiran", note: "Selim I's 1514 victory briefly took Tabriz and shattered Ismail's aura" },
    { id: "ilkhanate", note: "Developed the Ilkhanid idea of Iran as one “Land of Iran”" },
    { id: "iran", note: "Twelver Shi'ism, made state religion by the Safavids, remains so in Iran" },
  ],
  cites: [
    { t: "Safavid Iran — Wikipedia", u: "https://en.wikipedia.org/wiki/Safavid_Iran" },
    { t: "Battle of Chaldiran — Wikipedia", u: "https://en.wikipedia.org/wiki/Battle_of_Chaldiran" },
    { t: "Abbas the Great — Wikipedia", u: "https://en.wikipedia.org/wiki/Abbas_the_Great" },
    { t: "Ilkhanate — Wikipedia", u: "https://en.wikipedia.org/wiki/Ilkhanate" },
  ],
});

TL.enrich("protestantism", {
  why: "Luther's Ninety-five Theses of 1517, a reaction against abuses in the sale of indulgences, began a movement that aimed to reform the Catholic Church. The 1555 Peace of Augsburg let princes of the Holy Roman Empire adopt either Lutheranism or Catholicism for their lands; Calvinist churches spread in Germany, Hungary, the Netherlands, Scotland, Switzerland and France, and Henry VIII's break with Rome began Anglicanism. Anabaptists, who rejected infant baptism, were persecuted by Catholics and Protestants alike, while the Catholic Counter-Reformation's Council of Trent clarified disputed Catholic positions.",
  connections: [
    { id: "hx-peace-of-augsburg", note: "Let rulers in the empire make Lutheranism their official faith" },
    { id: "hx-council-of-trent", note: "The Catholic Church's response to Luther's challenge" },
    { id: "me-english-reformation", note: "England broke with Rome under Henry VIII" },
  ],
  cites: [
    { t: "Protestantism — Wikipedia", u: "https://en.wikipedia.org/wiki/Protestantism" },
    { t: "Reformation — Wikipedia", u: "https://en.wikipedia.org/wiki/Reformation" },
    { t: "Peace of Augsburg — Wikipedia", u: "https://en.wikipedia.org/wiki/Peace_of_Augsburg" },
    { t: "Anabaptism — Wikipedia", u: "https://en.wikipedia.org/wiki/Anabaptism" },
  ],
});

TL.enrich("new-spain", {
  why: "New Spain was built on Indigenous tribute and labor: the encomiendas granted to conquistadors often intensified existing exploitation. After denunciations by reformers such as the Dominican friar Bartolomé de las Casas, Charles V issued the New Laws of 1542 to curb abuses, but encomenderos revolted in Peru, the Crown suspended parts of the laws, and the system survived. Its silver mining transformed the global economy, and Acapulco's transpacific trade made New Spain a vital link between Spain's American and East Indies empires; a crisis worsened by Napoleon's 1808 invasion of Iberia led to the Mexican War of Independence.",
  connections: [
    { id: "me-fall-tenochtitlan", note: "Mexico City, New Spain's capital, rose on Tenochtitlan's site" },
    { id: "ming", note: "Manila galleons traded New World silver for Chinese and other Asian goods" },
    { id: "lc-mexican-independence-war", note: "The war that dissolved the viceroyalty in 1821" },
  ],
  cites: [
    { t: "New Spain — Wikipedia", u: "https://en.wikipedia.org/wiki/New_Spain" },
    { t: "New Laws — Wikipedia", u: "https://en.wikipedia.org/wiki/New_Laws" },
    { t: "Manila galleon — Wikipedia", u: "https://en.wikipedia.org/wiki/Manila_galleon" },
  ],
});

TL.enrich("mughal", {
  why: "Babur's firearms and cannons shattered Ibrahim Lodi's larger army at Panipat in 1526. Akbar, generally considered one of the greatest Mughal emperors, allied with Rajput rulers through marriage, made them his strongest allies, opened imperial employment to all on merit and abolished the sectarian tax on non-Muslims, while Aurangzeb later encouraged conversion to Islam and reinstated the jizya. Demand for Indian goods, including the textiles and silks on which European fashion came to depend, drew a steady stream of precious metals into India, and Shah Jahan's reign, exemplified by the Taj Mahal, was the golden age of Mughal architecture.",
  connections: [
    { id: "timurid", note: "Babur was a descendant of Timur, ousted from his Central Asian lands" },
    { id: "me-akbar", note: "The reign of religious tolerance and Rajput alliances" },
    { id: "sikhism", note: "Mughal rulers executed Sikh Gurus and persecuted the community" },
  ],
  cites: [
    { t: "Mughal Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Mughal_Empire" },
    { t: "Akbar — Wikipedia", u: "https://en.wikipedia.org/wiki/Akbar" },
    { t: "Sikhism: A Capsule Account — UCLA Center for India and South Asia", u: "https://southasia.ucla.edu/religions/paths/sikhism", k: "reference" },
  ],
});

TL.enrich("viceroyalty-peru", {
  why: "Potosí's Cerro Rico became the largest silver mine in the world, making Peru the greatest distributor of silver, and the boom town of Potosí grew to more than 200,000 people. Viceroy Francisco de Toledo's reforms, including the distribution of Indigenous labor through the mita, reshaped South America's administration and economy and led to the exploitation of Indigenous peoples. The 18th-century creation of New Granada and Río de la Plata shifted the Andean trade to Buenos Aires, and the 1824 capitulation at Ayacucho ended the royalist military effort.",
  connections: [
    { id: "inca", note: "Built on the conquered Inca Empire" },
    { id: "spain", note: "Peru's silver passed through Lima and Panama on its way to Seville" },
    { id: "lc-ayacucho", note: "The 1824 capitulation that ended royalist rule" },
  ],
  cites: [
    { t: "Viceroyalty of Peru — Wikipedia", u: "https://en.wikipedia.org/wiki/Viceroyalty_of_Peru" },
  ],
});

TL.enrich("kingdom-of-ireland", {
  why: "Though formally a kingdom equal to England, Ireland was for most of its history a dependency run from Dublin Castle. The Tudor conquest, completed early in the 17th century, confiscated land from Irish Catholics and settled Protestants from Britain, and under the penal laws the Catholic majority was barred from parliament, the military and most public offices, a main driver of the Confederate Wars of 1641–1653. The Williamite victory of 1691 strengthened the Protestant Ascendancy, and after the failed rebellion of 1798 the Acts of Union merged Ireland into the United Kingdom.",
  connections: [
    { id: "me-glorious-revolution", note: "Catholic James II's fall led to the Williamite War in Ireland" },
    { id: "uk", note: "The Acts of Union created the United Kingdom of Great Britain and Ireland" },
  ],
  cites: [
    { t: "Kingdom of Ireland — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Ireland" },
  ],
});

TL.enrich("scientific-revolution", {
  why: "The Scientific Revolution broke with earlier natural philosophy, producing a more mechanistic science integrated with mathematics and focused on gathering new evidence. The Stanford Encyclopedia of Philosophy notes that Copernicus's heliocentric model, very controversial at the time, began a change in how the world was viewed. Galileo's telescope gave persuasive evidence for heliocentrism, and Francis Bacon's vision of scientific progress inspired societies such as the Royal Society. Historians still debate whether it was a radical break or built on medieval translations of Greek and Arabic science; David Wootton ranks it with the Neolithic Revolution.",
  connections: [
    { id: "me-copernicus", note: "Copernicus came to be seen as the initiator of the revolution" },
    { id: "me-principia", note: "Newton's Principia of 1687 is seen as its culmination" },
    { id: "me-royal-society", note: "Bacon's ideas inspired scientific societies like the Royal Society" },
  ],
  cites: [
    { t: "Scientific Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Scientific_Revolution" },
    { t: "Nicolaus Copernicus — Stanford Encyclopedia of Philosophy", u: "https://plato.stanford.edu/entries/copernicus/", k: "reference" },
  ],
});

TL.enrich("tsardom-russia", {
  why: "From 1550 to 1700 Russia grew by an average of 35,000 square kilometers a year, conquering Kazan, Astrakhan and Siberia and fighting Poland–Lithuania, Sweden and the Ottomans. The autocracy survived the Time of Troubles, a civil war with Polish and Swedish intervention, thanks to its strong central bureaucracy, and a national assembly chose Mikhail Romanov in 1613, beginning 300 years of Romanov rule. The 1649 law code officially bound peasants to their homes, fully sanctioning serfdom.",
  connections: [
    { id: "me-kazan-1552", note: "Ivan IV's annexation of Kazan opened the Volga to Russia" },
    { id: "me-romanovs", note: "The Romanovs ruled Russia for 300 years" },
    { id: "polish-lithuanian", note: "Poland intervened in the Time of Troubles; its prince was once chosen tsar" },
  ],
  cites: [
    { t: "Tsardom of Russia — Wikipedia", u: "https://en.wikipedia.org/wiki/Tsardom_of_Russia" },
  ],
});

TL.enrich("polish-lithuanian", {
  why: "One of early modern Europe's largest and most populous states, the Commonwealth was run under the “Golden Liberty”: an elected king bound by the Henrician Articles and a parliament (Sejm) chosen by nobles, about 10 percent of the population, an early example of constitutional monarchy. The 1573 Warsaw Confederation guaranteed religious tolerance unusual by European standards. Shortly before its neighbors partitioned it, it adopted the 3 May Constitution, Europe's first modern codified constitution. Modern Poland considers itself the Commonwealth's successor, while Lithuania, at the start of its restored independence, saw its part in the union mostly in a negative light.",
  connections: [
    { id: "me-partitions-poland", note: "Austria, Prussia and Russia divided it in the late 18th century" },
    { id: "me-us-constitution", note: "Its 1791 constitution was the world's second, after the US one" },
    { id: "poland", note: "Today's Poland considers itself the Commonwealth's successor" },
  ],
  cites: [
    { t: "Polish–Lithuanian Commonwealth — Wikipedia", u: "https://en.wikipedia.org/wiki/Polish%E2%80%93Lithuanian_Commonwealth" },
  ],
});

TL.enrich("dutch-republic", {
  why: "With only about 1.5 million people, the republic controlled a worldwide network of seafaring trade routes through its East and West India Companies, whose income let it compete with much larger countries. It allowed more freedom of thought than its contemporaries, sheltering refugees such as Sephardic Jews and Huguenots, and in its 17th-century Golden Age painters such as Rembrandt and Vermeer and scientists such as Hugo Grotius, Christiaan Huygens and Antonie van Leeuwenhoek flourished. Its colonies ranged from New Netherland, surrendered to England in 1664, to the Cape of Good Hope, where Khoikhoi herders returned to find settlers farming their grazing land.",
  connections: [
    { id: "me-voc-founded", note: "The Dutch East India Company built its trading empire" },
    { id: "protestantism", note: "The Calvinist Dutch Reformed Church became its public church" },
    { id: "me-tokugawa", note: "The Dutch were the only Europeans Tokugawa Japan still let trade" },
  ],
  cites: [
    { t: "Dutch Republic — Wikipedia", u: "https://en.wikipedia.org/wiki/Dutch_Republic" },
    { t: "New Netherland — Wikipedia", u: "https://en.wikipedia.org/wiki/New_Netherland" },
    { t: "Dutch Cape Colony — Wikipedia", u: "https://en.wikipedia.org/wiki/Dutch_Cape_Colony" },
    { t: "Sakoku — Wikipedia", u: "https://en.wikipedia.org/wiki/Sakoku" },
  ],
});

TL.enrich("me-tokugawa", {
  why: "Ieyasu rewarded the daimyos who had sided with him and cut the holdings of those who opposed him, and the sankin-kōtai system required daimyos to reside in Edo every other year. In return for this centralization, peace among the daimyos held, and rapid economic growth and urbanization gave rise to a merchant class. Ieyasu banned Catholicism in 1614, and under sakoku, meant to remove Spanish and Portuguese colonial and religious influence, the shogunate expelled all non-Dutch Europeans and barred Japanese from leaving, while Dutch and Chinese merchants traded at Nagasaki. Through “Dutch learning” from Dejima, Western science and medicine still reached Japan.",
  connections: [
    { id: "me-sakoku", note: "The policy that closed Japan to most foreigners" },
    { id: "dutch-republic", note: "The Dutch post at Dejima was the only European presence permitted" },
    { id: "lc-meiji-restoration", note: "Supporters of the imperial court overthrew the shogunate in 1868" },
  ],
  cites: [
    { t: "Tokugawa shogunate — Wikipedia", u: "https://en.wikipedia.org/wiki/Tokugawa_shogunate" },
    { t: "Sakoku — Wikipedia", u: "https://en.wikipedia.org/wiki/Sakoku" },
  ],
});

TL.enrich("thirteen-colonies", {
  why: "Jamestown nearly failed amid disease, starvation, wars with the Powhatans and little gold, until tobacco, first successfully cultivated in 1612, brought an economic boom; the first recorded Africans arrived in Virginia in 1619, and between 1649 and 1690 the law hardened into lifelong, inheritable slavery for Africans. The Pilgrims drew up the Mayflower Compact in 1620, and Puritans settled Massachusetts Bay from 1629. Between 1625 and 1775 the colonial population grew from about 2,000 to 2.4 million, largely displacing Native Americans, and the colonies' self-government and resistance to London's control, voiced as “no taxation without representation,” led to the American Revolution.",
  connections: [
    { id: "me-africans-virginia-1619", note: "The first recorded Africans arrived in English Virginia in 1619" },
    { id: "me-seven-years-war", note: "The French and Indian War heightened tensions with Britain" },
    { id: "usa", note: "The colonies declared independence together in 1776" },
  ],
  cites: [
    { t: "Thirteen Colonies — Wikipedia", u: "https://en.wikipedia.org/wiki/Thirteen_Colonies" },
    { t: "Jamestown, Virginia — Wikipedia", u: "https://en.wikipedia.org/wiki/Jamestown,_Virginia" },
    { t: "Slavery in the colonial history of the United States — Wikipedia", u: "https://en.wikipedia.org/wiki/Slavery_in_the_colonial_history_of_the_United_States" },
  ],
});
