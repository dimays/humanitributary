// "Why it matters" context and cross-links: classical and early medieval entries (batch 3, November 2026).
// Every sentence in `why` and every connection note is supported by the enrich cites below.

const wp = (slug, title) => ({ t: `${title} — Wikipedia`, u: "https://en.wikipedia.org/wiki/" + slug });

TL.enrich("an-kalinga", {
  why: "Ashoka's Rock Edict 13 reports that in the conquest of Kalinga 150,000 people were deported and 100,000 killed, and that he felt “deep remorse” for it; in the following years he was drawn toward Buddhism. His edicts, inscribed on rocks and pillars across today's India, Pakistan, Nepal, Bangladesh and Afghanistan, describe medical treatment for people and cattle, wells and roadside trees. His dharma was not limited to one religion, and his edicts set Buddhism beside Brahmanism, Jainism and the Ajivikas, yet he is credited with an important role in spreading Buddhism across ancient Asia, sending missionaries such as his son Mahinda to Sri Lanka.",
  connections: [
    { id: "an-ashoka-missions", note: "Ashoka sent missionaries, among them his son Mahinda to Sri Lanka" },
    { id: "buddhism", note: "Ashoka is credited with an important role in spreading Buddhism across Asia" },
  ],
  cites: [wp("Kalinga_War", "Kalinga War"), wp("Ashoka", "Ashoka"), wp("Edicts_of_Ashoka", "Edicts of Ashoka")],
});

TL.enrich("qin", {
  why: "The Qin ended aristocratic rule in China, replacing it with a centralized, bureaucratic government, and standardized currency, weights, measures and the writing system. Han-era scholars portrayed it as a “monolithic, legalist tyranny,” and its law would generally be considered harsh by modern standards. Men all over China revolted in the years after the First Emperor's death, and its 14-year existence was the shortest of any major Chinese dynasty. Yet the Han essentially inherited the administrative state the Qin had built. Some modern scholars dispute the earliest account, in the Shiji, of the First Emperor's purge of scholars.",
  connections: [
    { id: "han", note: "The Han essentially inherited the administrative state built by the Qin" },
    { id: "an-great-wall", note: "Qin labor connected northern walls into what became the Great Wall" },
  ],
  cites: [wp("Qin_dynasty", "Qin dynasty")],
});

TL.enrich("an-great-wall", {
  why: "The First Emperor ordered the walls between the former states torn down and new walls built to connect the remaining fortifications along the northern frontier, positioning the empire against the Xiongnu; hundreds of thousands of peasants and convicts labored on such Qin projects. Later dynasties, among them the Han, the Northern dynasties and the Sui, repaired, rebuilt or expanded sections at great cost, and the best-known sections were built by the Ming (1368–1644). The wall also allowed border controls and duties on goods moved along the Silk Road. Its builders followed the principle “build and move on,” so it was never a permanently fixed border.",
  connections: [
    { id: "xiongnu", note: "Qin built new walls to position the empire against the Xiongnu" },
    { id: "ming", note: "The best-known sections of the Great Wall were built under the Ming" },
  ],
  cites: [wp("Great_Wall_of_China", "Great Wall of China"), wp("Qin_dynasty", "Qin dynasty")],
});

TL.enrich("han", {
  why: "The Han copied the Qin's centralized administration but emphasized meritocracy and virtue. Its armies cut the Hexi Corridor off from the Xiongnu, who were eventually defeated and forced to accept the status of Han vassals, and Han expansion into Central Asia, through the missions of the envoy Zhang Qian and the campaigns that followed, began the Silk Road trade network. In 108 BCE Han forces conquered Gojoseon and set up the Lelang and Xuantu commanderies in Korea; Goguryeo wiped out Lelang, the last of them, in 313. The dynasty ended in 220 CE, when Cao Pi of Wei usurped the throne.",
  connections: [
    { id: "xiongnu", note: "The defeated Xiongnu were forced to accept the status of Han vassals" },
    { id: "an-silk-road", note: "Han expansion into Central Asia began the Silk Road trade network" },
    { id: "korea-three-kingdoms", note: "Goguryeo destroyed Lelang, the last Han commandery in Korea, in 313" },
  ],
  cites: [wp("Han_dynasty", "Han dynasty"), wp("Silk_Road", "Silk Road"), wp("Three_Kingdoms_of_Korea", "Three Kingdoms of Korea")],
});

TL.enrich("an-silk-road", {
  why: "The Silk Road was a web of land and sea routes linking Central, East, South, Southeast and West Asia, active from the second century BCE until the mid-15th century, with Parthia as a bridge to the Mediterranean. It began with the Han dynasty's expansion into Central Asia through the missions of the envoy Zhang Qian, and Han forces policed it against nomadic raiders generally identified as the Xiongnu. Caravans carried silk brocade, lacquerware, porcelain, horses, wine and gold, and the network enabled an unprecedented exchange of religious ideas, while the spread of paper and gunpowder shaped political history.",
  connections: [
    { id: "xiongnu", note: "Han forces policed the routes against raiders identified as the Xiongnu" },
  ],
  cites: [wp("Silk_Road", "Silk Road")],
});

TL.enrich("korea-three-kingdoms", {
  why: "Goguryeo emerged after the fall of Gojoseon and in 313 wiped out Lelang, the last of the Han commanderies. The three kingdoms were increasingly influenced by Chinese culture, particularly Confucianism and Taoism; Buddhism arrived in the fourth century and became Silla's official religion in 528. Baekje, a great maritime power with political and trade ties to China and Japan, introduced Chinese writing, Buddhism, advanced pottery and other culture to Japan. Silla allied with the Tang to conquer Baekje in 660 and Goguryeo in 668, then drove out Tang forces, and by 676 it held all the territory south of the Taedong River.",
  connections: [
    { id: "me-silla-unifies", note: "Silla and the Tang conquered Baekje in 660 and Goguryeo in 668" },
    { id: "me-buddhism-to-japan", note: "Baekje introduced Chinese writing and Buddhism to Japan" },
    { id: "han", note: "Goguryeo wiped out Lelang, the last Han commandery, in 313" },
  ],
  cites: [wp("Three_Kingdoms_of_Korea", "Three Kingdoms of Korea"), wp("Baekje", "Baekje"), wp("Silla%E2%80%93Tang_War", "Silla–Tang War")],
});

// ---- Sources for the remaining entries ----
const FORDHAM_MILAN = { t: "Edicts of Toleration 311/313 AD — Internet History Sourcebooks, Fordham University", u: "https://sourcebooks.fordham.edu/source/edict-milan.asp", k: "primary" };
const FORDHAM_THEOD = { t: "Banning of Other Religions, Theodosian Code XVI.i.2 — Internet Medieval Sourcebook, Fordham University", u: "https://sourcebooks.fordham.edu/source/theodcodeXVI.asp", k: "primary" };
const FORDHAM_EINHARD = { t: "Einhard: The Life of Charlemagne — Internet Medieval Sourcebook, Fordham University", u: "https://sourcebooks.fordham.edu/basis/einhard.asp", k: "primary" };
const TACITUS = { t: "Tacitus, The Annals 15.44 (trans. Church and Brodribb) — Perseus Digital Library, Tufts University", u: "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0078:book=15:chapter=44", k: "primary" };
const JVL_REVOLT = { t: "Ancient Jewish History: The Great Revolt (66–70 CE) — Jewish Virtual Library", u: "https://www.jewishvirtuallibrary.org/the-great-revolt-66-70-ce", k: "reference" };
const ASI_CHOLA = { t: "Great Living Chola Temples — Archaeological Survey of India", u: "https://asi.nic.in/pages/WorldHeritageCholaTemples", k: "reference" };

TL.enrich("parthia", {
  why: "Parthia was Rome's great eastern rival: the two competed to make the kings of Armenia their tributaries, and Roman emperors repeatedly invaded Mesopotamia. Its Arsacid rulers accepted many local kings as vassals. At Carrhae in 53 BCE its horse archers destroyed Crassus's army, and an early agreement made the Euphrates the border between the two powers. Astride the Silk Road, it grew rich by taxing the caravan trade in silk, and a Han delegation reached Mithridates II in 121 BCE. Its court first adopted Greek culture and later saw a gradual revival of Iranian traditions. Native sources are scarce, so much of its history is known through Greek, Roman and Chinese writers.",
  connections: [
    { id: "an-carrhae", note: "Parthian horse archers destroyed Crassus's army in 53 BCE" },
    { id: "an-silk-road", note: "Parthia grew rich by taxing the caravan trade in silk" },
    { id: "sasanian", note: "Ardashir I killed the last Parthian king in 224 and founded the Sasanian Empire" },
  ],
  cites: [wp("Parthian_Empire", "Parthian Empire"), wp("Sasanian_Empire", "Sasanian Empire")],
});

TL.enrich("an-caesar", {
  why: "The conspirators feared that Caesar, named dictator for life early in 44 BCE, meant to make himself king, and they justified the killing as a defense of the Republic. His death brought new civil wars instead. Caesar's heir Octavian joined the Second Triumvirate, defeated the assassins at Philippi and later Antony at Actium, and in 27 BCE, restyled Augustus, established the Principate as the first Roman emperor. Augustus restored “the façade of a free republic” while keeping autocratic power, and to avoid the appearance of monarchy or dictatorship he eventually stopped standing for the consulship. Shakespeare's 1599 play Julius Caesar fixed the murder, and “Et tu, Brute?”, in popular memory.",
  connections: [
    { id: "an-actium", note: "Octavian's victory over Antony ended the civil wars that followed" },
    { id: "roman-empire", note: "Caesar's heir Octavian became Augustus, the first emperor" },
  ],
  cites: [wp("Assassination_of_Julius_Caesar", "Assassination of Julius Caesar"), wp("Augustus", "Augustus")],
});

TL.enrich("roman-empire", {
  why: "Although the Republic stood in name, Augustus held all meaningful authority. The 200 years that began with his rule are traditionally regarded as the Pax Romana, a time of unprecedented stability and prosperity for a state of, by traditional estimates, 55–60 million people, one-sixth to one-fourth of the world's population; newer studies suggest 70 million or more. Spoken Latin later split into the Romance languages, and Rome's republican institutions influenced later republics, including the United States. The empire became Christian under Constantine and Theodosius I and after 395 was ruled as eastern and western halves.",
  connections: [
    { id: "christianity", note: "Nicene Christianity became the empire's state religion in 380" },
    { id: "byzantine", note: "The eastern half survived as the Byzantine Empire until 1453" },
  ],
  cites: [wp("Roman_Empire", "Roman Empire")],
});

TL.enrich("kushan", {
  why: "The Kushan Empire grew from the Yuezhi, whom the Xiongnu forced to migrate west in 176–160 BCE, and under Kanishka, from about 127 CE, it ruled a huge territory. Kushan rule linked the seagoing trade of the Indian Ocean with the Silk Road and put the empire at the center of trade between Rome and China. Its art drew on Hellenistic traditions, Gandhara developed Greco-Buddhist art, and Kushan missionaries such as Lokaksema worked in Luoyang as Mahayana Buddhism spread to China. After 225 the empire split into western and eastern halves, pressed by the Sasanians and the Guptas, and the Kidarites and later the Hephthalites overwhelmed its last kingdoms.",
  connections: [
    { id: "an-kanishka", note: "Kanishka ruled a huge territory from about 127 CE" },
    { id: "an-buddhism-china", note: "Kushan missionaries such as Lokaksema worked in China's capitals" },
    { id: "gupta", note: "The Guptas pressed the Kushans from the east in the 4th century" },
  ],
  cites: [wp("Kushan_Empire", "Kushan Empire")],
});

TL.enrich("christianity", {
  why: "Christianity began in the first century as a Jewish movement in Judaea. Jesus's followers spread it despite significant persecution, and as Paul and others brought in Gentiles it slowly separated from Judaism. Christians, who could not accept the emperor's divinity, refused the state rites and emperor worship expected of Romans, and persecutions ran from Nero in 64 to Diocletian's, begun in 303. Constantine legalized the faith in 313, when Christians were perhaps 5 percent of the population, and in 380 Nicene Christianity became the state church. Its Latin and Greek branches split in 1054. Today it is the world's largest religion, with over 2.3 billion followers.",
  connections: [
    { id: "an-edict-milan", note: "Constantine ended state persecution in 313" },
    { id: "an-thessalonica", note: "Nicene Christianity became the Roman state church in 380" },
    { id: "me-great-schism", note: "The Catholic and Eastern Orthodox churches separated in 1054" },
  ],
  cites: [wp("Christianity", "Christianity"), wp("Persecution_of_Christians_in_the_Roman_Empire", "Persecution of Christians in the Roman Empire")],
});

TL.enrich("an-crucifixion", {
  why: "Scholars broadly agree that Jesus was crucified under Pontius Pilate, governor of Judaea from 26 to 36 CE; with his baptism, it is counted among the most certain facts about him. A non-Christian writer confirms it: the Roman historian Tacitus wrote that Christus “suffered the extreme penalty during the reign of Tiberius” at Pilate's hands. For Christians, his death and the belief that he was raised on the third day became central to the doctrines of salvation and atonement, and the cross became one of the faith's most widely recognized symbols.",
  connections: [
    { id: "christianity", note: "His death and reported resurrection are central to Christian theology" },
  ],
  cites: [wp("Crucifixion_of_Jesus", "Crucifixion of Jesus"), TACITUS],
});

TL.enrich("an-temple-70", {
  why: "The Temple's fall capped a revolt in which up to a million Jews may have died, and it ended Temple sacrifice. Judaism reoriented toward Torah study, deeds of loving-kindness and synagogue prayer, a shift that culminated in Rabbinic Judaism; in the traditional account, Yohanan ben Zakkai, who opposed the revolt, was smuggled out of the city and won concessions from Vespasian that let Jewish communal life continue. The loss is mourned each year on Tisha B'Av, and Jews later dated almost two thousand years of exile from it. Some early Christians read it as a sign that God had turned from the Jewish people.",
  connections: [
    { id: "roman-empire", note: "Rome celebrated the victory with a triumph and the Arch of Titus" },
    { id: "christianity", note: "Some early Christians read the destruction as God turning from the Jews" },
  ],
  cites: [wp("Siege_of_Jerusalem_(70_CE)", "Siege of Jerusalem (70 CE)"), JVL_REVOLT],
});

TL.enrich("aksum", {
  why: "Based in today's Eritrea and northern Ethiopia, Aksum was deeply involved in the trade network between India and the Mediterranean, exporting ivory and gold and importing silk and spices. King Ezana was converted by Frumentius, a native of Tyre once enslaved at the Aksumite court, and Christianity became the state religion in the mid-fourth century; its coins replaced the disc and crescent with the cross. At the Byzantine emperor Justin I's behest, King Kaleb invaded Himyar to end Dhu Nuwas's persecution of Christians, but Persia ended Aksumite rule in Yemen in 575. Aksum's slow decline had begun by the seventh century, and its church gave rise to today's Ethiopian Orthodox Tewahedo Church.",
  connections: [
    { id: "an-aksum-christian", note: "Ezana converted through Frumentius, later the first bishop of Aksum" },
    { id: "byzantine", note: "Kaleb invaded Himyar at the behest of the Byzantine emperor Justin I" },
  ],
  cites: [wp("Kingdom_of_Aksum", "Kingdom of Aksum"), wp("Frumentius", "Frumentius")],
});

TL.enrich("china-division", {
  why: "For more than three centuries after the Han, China was divided among rival regimes, with a chaotic warring period in the north overlapping the Northern and Southern dynasties. It was the first time China's political center lay in the south, where dynasties based at Jiankang (Nanjing) spurred a surge in population and in economic and cultural development. Buddhism flourished in both south and north, where the Northern Wei carved the Buddhas of the Yungang Grottoes near Datong in the 5th and 6th centuries, with construction ending in 525, and it has remained a major Chinese religion ever since. Sui forces took Jiankang in 589, ending the long division.",
  connections: [
    { id: "an-buddhism-china", note: "Buddhism flourished under both the southern and northern dynasties" },
    { id: "sui", note: "Sui forces took Jiankang in 589, ending the division" },
  ],
  cites: [wp("Six_Dynasties", "Six Dynasties"), wp("Yungang_Grottoes", "Yungang Grottoes"), wp("Sui_dynasty", "Sui dynasty")],
});

TL.enrich("sasanian", {
  why: "Founded by Ardashir I, who defeated the Parthian king Artabanus IV in 224, the Sasanian state had a centralized bureaucracy under a shahanshah, or “King of Kings,” and revitalized Zoroastrianism, its official religion, as a unifying ideal. It competed with Rome far more zealously than the Parthians had: Shapur I captured the emperor Valerian, who stayed his prisoner for life, and Khosrow II's war from 602 took the Levant and, for the first time, Egypt before Heraclius's counterattacks forced Persia onto the defensive. That war exhausted both sides just before the Arab conquests; after defeat at Qadisiyya in 636, the last shah, Yazdegerd III, fled east and was killed near Merv in 651.",
  connections: [
    { id: "an-valerian", note: "Shapur I captured the Roman emperor Valerian in 260" },
    { id: "me-arab-conquests", note: "Exhausted by war with Byzantium, the empire fell to the Muslim conquests" },
    { id: "zoroastrianism", note: "Zoroastrianism was the empire's official religion" },
  ],
  cites: [wp("Sasanian_Empire", "Sasanian Empire"), wp("Byzantine%E2%80%93Sasanian_War_of_602%E2%80%93628", "Byzantine–Sasanian War of 602–628"), wp("Yazdegerd_III", "Yazdegerd III")],
});

TL.enrich("ghana-empire", {
  why: "Ghana grew rich on the trans-Saharan trade, keeping a monopoly on gold heading north and salt heading south, though it did not control the goldfields themselves. In 1067/68 the geographer al-Bakri described a two-part capital: a royal town with a palace and sacred grove, and a Muslim merchant town with twelve mosques. Historians debate whether the Almoravids conquered Ghana around 1076; some call the conquest folklore, and archaeology shows no sudden destruction. As the Sahel dried, trade routes shifted, Mali took over the gold trade, and in 1957 the newly independent Gold Coast took Ghana's name.",
  connections: [
    { id: "mali", note: "Mali took over Ghana's gold trade, and Ghana became its ally" },
  ],
  cites: [wp("Ghana_Empire", "Ghana Empire")],
});

TL.enrich("an-edict-milan", {
  why: "Issued by the emperors Constantine and Licinius, the edict granted “to the Christians and others full authority to observe that religion which each preferred” and ordered confiscated churches returned. It decriminalized Christianity, then perhaps 5 percent of the population, along with other religions; Nicene Christianity became the state church only in 380. Christian writers held that Constantine owed his successes to the Christian God. He went on to convene the Council of Nicaea in 325 and to found Constantinople, where figures of the old gods were replaced or set within a framework of Christian symbolism.",
  connections: [
    { id: "an-nicaea", note: "Constantine convened the first ecumenical council in 325" },
    { id: "an-thessalonica", note: "In 380 Nicene Christianity went from tolerated to state religion" },
    { id: "an-constantinople", note: "In Constantine's new capital, old gods were set in a Christian framework" },
  ],
  cites: [FORDHAM_MILAN, wp("Christianity", "Christianity"), wp("Constantine_the_Great", "Constantine the Great")],
});

TL.enrich("gupta", {
  why: "Some historians call the Gupta era India's “Golden Age,” though others dispute the label. Aryabhata's Aryabhatiya proposed that Earth rotates on its axis, and Kalidasa wrote at Chandragupta II's court. The Guptas favored Hinduism: the Mahabharata and Ramayana were canonized and the Puranas were likely written down. They tolerated Buddhism, and Kumaragupta I is said to have founded Nalanda, though Buddhism was gravely weakened when Huna invaders destroyed monasteries. Wars with the Huns drained the empire's resources, and it ended soon after their invasions of the late fifth and early sixth centuries.",
  connections: [
    { id: "an-aryabhata", note: "Aryabhata's astronomy is a hallmark of the Gupta era" },
    { id: "an-faxian", note: "The pilgrim Faxian was pleased with the mildness of Gupta administration" },
    { id: "kushan", note: "Samudragupta subjugated the Eastern Kushans in the mid-4th century" },
  ],
  cites: [wp("Gupta_Empire", "Gupta Empire"), wp("Kushan_Empire", "Kushan Empire")],
});

TL.enrich("an-thessalonica", {
  why: "The edict ordered all peoples to follow the religion “delivered to the Romans by the divine Apostle Peter,” belief in the Trinity, and let its followers “assume the title Catholic Christians,” while branding all others heretics. With it, Theodosius I made Nicene Christianity the state church of the Roman Empire, where Constantine's Edict of Milan had granted toleration, and it authorized the punishment of rival creeds such as Arianism. The First Council of Constantinople in 381 affirmed the Nicene Creed, and the edict was incorporated into Book XVI of the Theodosian Code.",
  connections: [
    { id: "an-edict-milan", note: "Toleration in 313 preceded this move to a single state faith" },
    { id: "an-nicaea", note: "It enforced the Nicene definition of the Trinity" },
  ],
  cites: [FORDHAM_THEOD, wp("Edict_of_Thessalonica", "Edict of Thessalonica")],
});

TL.enrich("western-roman", {
  why: "The historian A. H. M. Jones judged the East strategically less vulnerable than the West. The Visigoths sacked Rome in 410, the Vandals took Carthage in 439, cutting Italy off from the taxes and food of Africa, and in 476 Odoacer forced Romulus Augustulus to abdicate. Edward Gibbon popularized that date as the fall of Rome, and it is still sometimes used to mark the shift from Antiquity to the Middle Ages. Historians debate what “fell”: Gibbon began a lasting controversy over Christianity's role, while others describe a complex cultural transformation rather than a fall. Successor kingdoms kept a pretense of Roman continuity through the old Roman administrative systems.",
  connections: [
    { id: "an-sack-410", note: "The Visigoths' sack of Rome in 410" },
    { id: "franks", note: "Clovis defeated Syagrius, and the Franks came to dominate most of Gaul" },
    { id: "byzantine", note: "Justinian later re-imposed direct rule on large parts of the old West" },
  ],
  cites: [wp("Western_Roman_Empire", "Western Roman Empire"), wp("Fall_of_the_Western_Roman_Empire", "Fall of the Western Roman Empire"), wp("Franks", "Franks")],
});

TL.enrich("byzantine", {
  why: "Its people regarded themselves as Romans; the term “Byzantine Empire” was coined only after its demise. The East outlasted the West thanks to civilian administrators who kept power and a combination of fortune and good political decisions, and Constantinople remained Europe's largest and wealthiest city until Paris overtook it in the 13th century. Justinian I briefly reconquered much of Italy and North Africa, and his Corpus Juris Civilis, a new codification of Roman law, was issued almost entirely in Latin, though Greek was the language most citizens spoke. The Fourth Crusade's sack of 1204 severely fragmented the empire, and the Ottoman conquest of 1453 ended it.",
  connections: [
    { id: "me-justinian-code", note: "Justinian's code was a new, shortened codification of Roman law" },
    { id: "me-fourth-crusade", note: "The crusaders' sack of 1204 fragmented the empire" },
    { id: "me-fall-of-constantinople", note: "The Ottoman conquest brought the empire to an end" },
  ],
  cites: [wp("Byzantine_Empire", "Byzantine Empire"), wp("Corpus_Juris_Civilis", "Corpus Juris Civilis")],
});

TL.enrich("franks", {
  why: "At Soissons in 486 Clovis defeated Syagrius, ending the last Roman rump state outside Italy, and the Franks went on to establish hegemony over most of Gaul. His conversion to Nicene Christianity set him apart from most Germanic kings and may have won him the support of the Catholic Gallo-Roman aristocracy. Pepin the Short, anointed king by the pope in 754, granted the pope the territories of Ravenna in 756, the legal basis for the Papal States. Charlemagne's imperial coronation in 800 and the Carolingian Renaissance followed, but Frankish law demanded equality among male heirs, and in 843 the Treaty of Verdun split the empire among Louis the Pious's sons.",
  connections: [
    { id: "me-charlemagne-crowned", note: "Pope Leo III crowned Charlemagne Emperor of the Romans" },
    { id: "me-treaty-of-verdun", note: "Louis the Pious's sons split the empire into three kingdoms" },
  ],
  cites: [wp("Franks", "Franks"), wp("Clovis_I", "Clovis I"), wp("Donation_of_Pepin", "Donation of Pepin"), wp("Carolingian_Empire", "Carolingian Empire")],
});

TL.enrich("sui", {
  why: "The Sui ended centuries of division when its forces took Jiankang in 589. Emperors Wen and Yang centralized government with the equal-field system, a unified coinage and a restored Confucian examination system, and built the Grand Canal, which linked the north to the economic centers of the southeast and carried grain, trade and culture for centuries. Historians often compare the Sui to the Qin: both reunified China after long division and soon fell, the Sui after four failed campaigns against Goguryeo and revolts against heavy taxes and labor duties. The Tang adopted the Sui system with little initial change.",
  connections: [
    { id: "me-grand-canal", note: "The canal improved grain shipments and military logistics" },
    { id: "tang", note: "The Tang adopted the Sui system with little change at first" },
    { id: "qin", note: "Both unified China after long division and fell quickly" },
  ],
  cites: [wp("Sui_dynasty", "Sui dynasty")],
});

TL.enrich("islam", {
  why: "Muslims believe Muhammad began receiving the revelations of the Quran around 610, and they regard him as God's final prophet, after earlier prophets such as Abraham, Moses and Jesus; Islam is an Abrahamic religion. By his death in 632 most of the Arabian Peninsula had converted to Islam, and under the Rashidun caliphs Muslim rule spread beyond Arabia. Disagreement over who should succeed Muhammad first divided Sunni and Shia Muslims. Today Islam has an estimated 2 billion adherents, the world's second-largest religious population.",
  connections: [
    { id: "me-hijra", note: "The emigration to Medina in 622 is year one of the Islamic calendar" },
    { id: "rashidun", note: "Muslim rule expanded beyond Arabia under the first caliphs" },
    { id: "judaism", note: "Muslims count Abraham and Moses among the prophets before Muhammad" },
  ],
  cites: [wp("Islam", "Islam")],
});

TL.enrich("tang", {
  why: "Historians generally regard the Tang as a high point of Chinese civilization and “a golden age of cosmopolitan culture.” Its capital Chang'an was for much of the era the world's most populous city, and the age is traditionally seen as the greatest in Chinese poetry. The Tang exerted a powerful cultural influence over Japan and Korea: Silla rebuilt its capital on a grid modeled after Chang'an, and Japan's capital at Nara was modeled on it too. Defeat by the Abbasids at Talas in 751 halted Tang westward expansion, and the An Lushan rebellion brought devastation and the decline of central authority before the dynasty ended in 907.",
  connections: [
    { id: "me-an-lushan", note: "The rebellion “destroyed the prosperity” of the Tang" },
    { id: "me-talas", note: "The Abbasid victory halted Tang westward expansion" },
    { id: "unified-silla", note: "Silla rebuilt its capital on a grid modeled after Chang'an" },
  ],
  cites: [wp("Tang_dynasty", "Tang dynasty"), wp("Battle_of_Talas", "Battle of Talas"), wp("Later_Silla", "Later Silla"), wp("Heij%C5%8D-ky%C5%8D", "Heijō-kyō")],
});

TL.enrich("me-hijra", {
  why: "The emigration to Yathrib, later renamed Madinat an-Nabi, “the Prophet's City,” transformed the city's religious and political landscape. Invited as a neutral outsider to arbitrate among its factions, Muhammad was agreed on as its leader, and the Constitution of Medina, whose authenticity and date are debated, declared its believers, Jewish tribes and other residents one community bound to help each other against any invader. The caliph Umar later made the year of the Hijra the first year of the Islamic calendar, so Muslim dates count from 622 CE. From Medina, Muhammad marched on Mecca and entered it without battle in 630.",
  connections: [
    { id: "rashidun", note: "The caliph Umar established the calendar dated from the Hijra" },
  ],
  cites: [wp("Hijrah", "Hijrah"), wp("Medina", "Medina"), wp("Constitution_of_Medina", "Constitution of Medina"), wp("Rashidun_Caliphate", "Rashidun Caliphate")],
});

TL.enrich("rashidun", {
  why: "The four “rightly guided” caliphs who led the community after Muhammad were chosen by a small group of senior companions or named by a predecessor rather than by dynasty, and they presided over the conquest of Sasanian Persia and Byzantine Syria and Egypt. Uthman's most lasting project was the final compilation of the Quran. The era also set lasting divisions: Sunni tradition credits the early caliphs with superior piety, while Shia Muslims hold that the first three usurped the rights of Ali. After Uthman's assassination in 656, Ali's accession set off the first Islamic civil war, and after Ali's assassination in 661 Mu'awiya founded the Umayyad dynasty.",
  connections: [
    { id: "me-arab-conquests", note: "The conquests of Persia, Syria and Egypt came under these caliphs" },
    { id: "umayyad", note: "After Ali's murder, Mu'awiya founded the Umayyad Caliphate" },
  ],
  cites: [wp("Rashidun_Caliphate", "Rashidun Caliphate")],
});

TL.enrich("me-arab-conquests", {
  why: "The Byzantine–Sasanian wars had left both empires exhausted and weakened when the Arabs emerged, and within about a decade Arab-Muslim armies took Byzantine Syria and Egypt and almost all of the Sasanian Empire, a speed one historian likens only to Alexander's conquests. After the victory at Yarmuk in 636, Heraclius ordered Syria abandoned, and after defeats at Qadisiyya and Nahavand the last Sasanian shah, Yazdegerd III, was assassinated in 651. Arab commanders made liberal use of agreements that spared the lives and property of those who surrendered, and Christians could practice their faith undisturbed as long as they paid tribute.",
  connections: [
    { id: "sasanian", note: "The conquest ended the Sasanian Empire" },
    { id: "byzantine", note: "Byzantium lost Greater Syria and Egypt" },
  ],
  cites: [wp("Early_Muslim_conquests", "Early Muslim conquests"), wp("Rashidun_Caliphate", "Rashidun Caliphate")],
});

TL.enrich("umayyad", {
  why: "Mu'awiya made the caliphate hereditary and moved its capital to Damascus, and at its height the Umayyad state was one of the largest empires in history, reaching from Iberia to Central Asia and Sindh. Arabic replaced Greek and Coptic in administration, and an Islamic gold dinar replaced the Byzantine solidus; the Dome of the Rock, completed in 691/692, is considered the oldest surviving major Islamic building. Favoring the old Arab elite over non-Arab converts, the mawali, caused unrest that helped bring on the Abbasid revolution, and an army killed Husayn at Karbala in 680. The Abbasids overthrew the dynasty in 750, but a surviving prince founded an Umayyad state at Córdoba in 756.",
  connections: [
    { id: "me-dome-of-the-rock", note: "The oldest surviving major Islamic building" },
    { id: "abbasid", note: "The Abbasids overthrew the Umayyads in 750" },
    { id: "al-andalus", note: "Abd al-Rahman I founded an Umayyad state at Córdoba in 756" },
  ],
  cites: [wp("Umayyad_Caliphate", "Umayyad Caliphate")],
});

TL.enrich("unified-silla", {
  why: "After a Silla–Tang alliance conquered Baekje in 660 and Goguryeo in 668, Silla drove out Tang forces and ruled the peninsula south of the Taedong River. Its capital at Gyeongju was reorganized on a rectangular grid modeled after the Tang capital Chang'an, a national Confucian college was founded in 682, and Buddhism, the state religion, flourished as many Korean monks went to China to study it. Confucianism was restricted to the elite aristocracy, and through the bone-rank system a small group ruled many subjects. Unified Silla was plagued by intrigue and political turmoil, and in 935 its last king, Gyeongsun, submitted to Wang Geon of Goryeo.",
  connections: [
    { id: "tang", note: "Silla rebuilt its capital on a grid modeled after Tang Chang'an" },
    { id: "goryeo", note: "Silla's last king submitted to Wang Geon of Goryeo in 935" },
  ],
  cites: [wp("Later_Silla", "Later Silla"), wp("Three_Kingdoms_of_Korea", "Three Kingdoms of Korea"), wp("Silla%E2%80%93Tang_War", "Silla–Tang War")],
});

TL.enrich("srivijaya", {
  why: "Srivijaya, a Buddhist maritime empire based on Sumatra, expanded to the Malay Peninsula and grew reliant on the booming regional trade, above all lucrative trade agreements with China that lasted from the Tang to the Song. From the 7th to the 11th century it was an important center for the expansion of Buddhism; the Chinese monk Yijing stayed six months in 671. Rajendra Chola's invasion of 1025 gravely weakened its hegemony, and it was largely forgotten until the French historian George Cœdès proposed its existence in 1918. Twentieth-century Indonesian nationalists then invoked Srivijaya as evidence of an identity older than the Dutch East Indies.",
  connections: [
    { id: "chola", note: "Rajendra Chola's 1025 raids on Srivijayan ports weakened its hold" },
  ],
  cites: [wp("Srivijaya", "Srivijaya"), wp("Chola_dynasty", "Chola dynasty")],
});

TL.enrich("al-andalus", {
  why: "For nearly eight centuries Muslim-ruled Iberia linked the Islamic and Christian worlds. Under the Caliphate of Córdoba, declared in 929, the city became one of the Mediterranean's leading cultural and economic centers, home to scholars such as the physician al-Zahrawi, and later Averroes wrote there. After Castile took Toledo in 1085, translators there rendered Arabic works into Latin, work said to have significantly affected the European Renaissance. The caliphate broke into taifa kingdoms as Christian states advanced, and Granada's surrender on January 2, 1492, was followed by forced conversions and, in 1609–1614, the expulsion of the Moriscos.",
  connections: [
    { id: "me-cordoba-caliphate", note: "Córdoba's caliphate was al-Andalus's golden age" },
    { id: "umayyad", note: "A surviving Umayyad prince founded the state at Córdoba in 756" },
    { id: "spain", note: "Ferdinand and Isabella's united crowns took Granada in 1492" },
  ],
  cites: [wp("Al-Andalus", "al-Andalus"), wp("Umayyad_Caliphate", "Umayyad Caliphate")],
});

TL.enrich("abbasid", {
  why: "The Abbasids, who had depended heavily on Persian support, moved the caliphate's capital to Baghdad, whose round city al-Mansur began in 762 and which became a center of science, culture and the arts. Its translation movement put Greek, Persian and Indian works into Arabic, among them Aristotle, Galen and Ptolemy, and scholars corrected and built on the old texts. From the ninth century provinces broke away, and the Buyids, then the Seljuks, took control of Baghdad, while Sunni scholars emerged as a cohesive class whose views did not always align with the caliph's. The Mongol sack of 1258 ended the caliphate in effect, though a powerless line survived in Cairo until 1517.",
  connections: [
    { id: "me-house-of-wisdom", note: "The House of Wisdom was a major intellectual center under the Abbasids" },
    { id: "me-talas", note: "An Abbasid army defeated a Tang force at Talas in 751" },
    { id: "me-sack-of-baghdad", note: "Hulagu's sack marked the caliphate's effective end" },
  ],
  cites: [wp("Abbasid_Caliphate", "Abbasid Caliphate"), wp("Round_city_of_Baghdad", "Round city of Baghdad"), wp("Graeco-Arabic_translation_movement", "Graeco-Arabic translation movement"), wp("Battle_of_Talas", "Battle of Talas")],
});

TL.enrich("vikings", {
  why: "Norse raiders, traders and settlers ranged from North America to the Black Sea and Constantinople. The raid on Lindisfarne in 793, often taken as the era's start, gave way to conquest and settlement: York, the Danelaw, Dublin and Normandy, Iceland and Greenland, and a brief settlement in Newfoundland that made the Norse the first Europeans to reach North America. In the east, Varangians traveled the Dnieper and Volga routes, and Rurik's successors founded Kievan Rus' with its capital in Kiev. In the 11th century the Norse homelands were unified into larger kingdoms as Christianity took hold, and 1066 is often taken as the end of the Viking Age.",
  connections: [
    { id: "me-normandy-settled", note: "Charles the Simple granted land to Rollo, who vowed to guard the Seine" },
    { id: "kievan-rus", note: "Rurik's Varangian successors founded Kievan Rus' with its capital in Kiev" },
    { id: "me-lanse-aux-meadows", note: "The Norse briefly settled in Newfoundland" },
  ],
  cites: [wp("Viking_Age", "Viking Age"), wp("Treaty_of_Saint-Clair-sur-Epte", "Treaty of Saint-Clair-sur-Epte")],
});

TL.enrich("me-charlemagne-crowned", {
  why: "By crowning the Frankish king Roman emperor in 800, Pope Leo III restored the imperial title in the West for the first time in over three centuries, beginning a line that evolved into the Holy Roman Empire. The coronation disregarded the weakened Byzantine Empire's claims, and Charlemagne's biographer Einhard wrote that the Roman emperors in the East “took this step very ill,” and claimed Charlemagne would not have entered the church had he foreseen the pope's design. The Carolingians kept a close alliance with the papacy, and the coronation is listed among the causes of the later split between the Latin and Greek churches.",
  connections: [
    { id: "hre", note: "The Holy Roman Empire is dated from this coronation or from Otto I's in 962" },
    { id: "me-great-schism", note: "Listed among the causes of the East–West Schism" },
  ],
  cites: [FORDHAM_EINHARD, wp("Carolingian_Empire", "Carolingian Empire"), wp("Western_Roman_Empire", "Western Roman Empire"), wp("Holy_Roman_Empire", "Holy Roman Empire"), wp("East%E2%80%93West_Schism", "East–West Schism")],
});

TL.enrich("khmer", {
  why: "Historians generally date the Angkor period from 802, when Jayavarman II proclaimed himself universal ruler and “god king.” Satellite imaging shows that at its peak in the 11th–13th centuries Angkor's network of canals and reservoirs formed the most extensive pre-industrial urban complex in the world, home perhaps to 700,000–900,000 people. Kings built Angkor Wat, dedicated to Vishnu, and the Buddhist Bayon; a later shift to Theravada Buddhism is linked to less temple building. The causes of decline are debated, from religious change and wars with Ayutthaya to droughts and floods that damaged the water system, and in 1431 the court left Angkor.",
  connections: [
    { id: "me-angkor-wat", note: "Suryavarman II built Angkor Wat, dedicated to Vishnu" },
  ],
  cites: [wp("Khmer_Empire", "Khmer Empire")],
});

TL.enrich("west-francia", {
  why: "West Francia was the first stage of the Kingdom of France. Created when the Treaty of Verdun gave Charles the Bald the western part of the Carolingian empire, it saw Norsemen settle in Normandy, and in 911 Charles the Simple granted land to the Viking leader Rollo, who vowed to guard the Seine estuaries from further Viking attacks. Kings were elected by the magnates, and royal power weakened as dukes and counts became hereditary rulers of semi-independent regions. When Hugh Capet was elected in 987, the crown controlled little beyond the Île-de-France, but his Capetian dynasty went on to rule France for more than 800 years.",
  connections: [
    { id: "me-treaty-of-verdun", note: "The treaty gave Charles the Bald the western kingdom" },
    { id: "me-normandy-settled", note: "Charles the Simple granted Normandy to Rollo" },
    { id: "france", note: "Hugh Capet's election in 987 began the Capetian kingdom of France" },
  ],
  cites: [wp("West_Francia", "West Francia"), wp("Treaty_of_Saint-Clair-sur-Epte", "Treaty of Saint-Clair-sur-Epte"), wp("Kingdom_of_France", "Kingdom of France")],
});

TL.enrich("east-francia", {
  why: "The eastern kingdom created at Verdun for Louis the German became the Kingdom of Germany. After 888 the dukes of Bavaria, Swabia, Franconia, Saxony and Lotharingia became hereditary rulers, and in 911 the nobles stopped electing Carolingians. Henry the Fowler prevented the collapse of royal power seen in West Francia and left a much stronger kingdom to his son Otto I, who broke Magyar power at the Lechfeld in 955 and was crowned emperor in Rome in 962, when “the era of the Holy Roman Empire began.” By the 12th century it was called the kingdom of the Germans.",
  connections: [
    { id: "me-treaty-of-verdun", note: "The treaty gave Louis the German the eastern lands" },
    { id: "hre", note: "Otto I's coronation in 962 began the Holy Roman Empire era" },
  ],
  cites: [wp("East_Francia", "East Francia"), wp("Battle_of_Lechfeld", "Battle of Lechfeld")],
});

TL.enrich("scotland", {
  why: "Traditionally founded in 843 under Kenneth MacAlpin, the kingdom grew into Alba and from 1296 to 1357 fought to assert its independence from England. Its Protestant Reformation produced a mostly Calvinist national church, the Kirk, whose confession Parliament adopted in 1560. In 1603 James VI inherited the English throne, though the two realms kept separate identities and institutions for another century. The Acts of Union, in force from May 1, 1707, merged the two parliaments into the Parliament of Great Britain and abolished Scottish currency.",
  connections: [
    { id: "me-union-of-crowns", note: "James VI inherited the English and Irish thrones in 1603" },
    { id: "great-britain", note: "Scotland and England united as Great Britain on May 1, 1707" },
  ],
  cites: [wp("Kingdom_of_Scotland", "Kingdom of Scotland")],
});

TL.enrich("chola", {
  why: "At its height the Chola realm “stretched over all of South India and the neighbouring islands.” Rajaraja I's navy reportedly took Sri Lanka and the Maldives, and in 1025 Rajendra I raided the ports of Srivijaya, weakening its hold and letting Tamil traders expand into waters Malay traders had controlled; he also sent embassies to China. The Archaeological Survey of India calls Rajaraja's Brihadisvara temple at Thanjavur “a landmark in the evolution of building art in south India,” and the imperial era is called the golden age of Tamil culture, celebrated for its bronze sculpture.",
  connections: [
    { id: "srivijaya", note: "Rajendra I's 1025 raids weakened Srivijaya's hold on the region" },
  ],
  cites: [ASI_CHOLA, wp("Chola_dynasty", "Chola dynasty")],
});

TL.enrich("kievan-rus", {
  why: "Ruled by the Rurik dynasty, Kievan Rus' grew on river trade down the Dnieper to the Black Sea and Constantinople, with Kiev at its hub; scholars doubt the chronicle's story that the Varangians were invited to rule. Vladimir's adoption of Byzantine Christianity around 988 brought Orthodoxy, a liturgy written in Cyrillic and translations from Greek that gave the Eastern Slavs rudimentary Greek learning, and Yaroslav the Wise is credited with the first law code, the Russkaya Pravda. Lacking stable succession, it broke into rival principalities and fell to the Mongols in 1240. Belarus, Russia and Ukraine each claim it as a cultural ancestor, and its origins remain politically charged.",
  connections: [
    { id: "me-rus-baptism", note: "Vladimir adopted Byzantine Christianity, likely for ties to Constantinople" },
    { id: "me-mongols-take-rus", note: "The Mongol invasion ended the state; Kiev fell in 1240" },
    { id: "vikings", note: "Rurik's Varangian successors founded Kievan Rus' with its capital in Kiev" },
  ],
  cites: [wp("Kievan_Rus%27", "Kievan Rus'"), wp("Viking_Age", "Viking Age")],
});

TL.enrich("fatimid", {
  why: "Claiming descent from Muhammad's daughter Fatima, the Fatimids were an Ismaili Shia dynasty whose caliphs were acknowledged as the rightful imams by Ismaili communities. After conquering Egypt in 969 they moved their center to the newly founded Cairo, and al-Azhar became an academic institution central to spreading Ismaili teaching. Egypt flourished, and the Fatimids built an extensive trade network in the Mediterranean and the Indian Ocean while aiming at Baghdad, seat of their Abbasid rivals. Seljuk encroachment into Syria from the 1070s and the crusaders' arrival in 1097 weakened them, and in 1171 Saladin abolished the dynasty and returned Egypt to nominal Abbasid authority.",
  connections: [
    { id: "abbasid", note: "An Ismaili Shia rival caliphate that aimed at the Abbasid seat, Baghdad" },
    { id: "seljuk", note: "Seljuk advances into Syria weakened the Fatimids; Seljuks took Jerusalem in 1073" },
  ],
  cites: [wp("Fatimid_Caliphate", "Fatimid Caliphate"), wp("First_Crusade", "First Crusade")],
});

TL.enrich("goryeo", {
  why: "Founded by Wang Geon in 918, Goryeo completed the unification of the Later Three Kingdoms in 936, and the name “Korea” comes from it. Its civil service examinations were based primarily on the Tang model, and King Seongjong supported Confucianism and founded a national university in 992, while Buddhism, the state religion, reached its greatest influence in Korean history; UNESCO calls its Tripitaka Koreana one of the most complete bodies of Buddhist texts, and metal movable type was developed in the early 13th century. Mongol invasions from 1231 made Goryeo a vassal state of the Yuan, and in 1392 Yi Seong-gye's coup established Joseon.",
  connections: [
    { id: "me-tripitaka-koreana", note: "One of the most complete collections of Buddhist texts" },
    { id: "joseon", note: "Yi Seong-gye's coup ended Goryeo and founded Joseon in 1392" },
  ],
  cites: [wp("Goryeo", "Goryeo"), wp("Tripitaka_Koreana", "Tripitaka Koreana")],
});

TL.enrich("england", {
  why: "Æthelstan's conquest of the last Viking kingdom, at York, made him the first Anglo-Saxon ruler of all England. The Norman Conquest of 1066 brought a new dynasty from which all later English monarchs descend. Parliament developed over the following centuries, and after the Civil War and the Glorious Revolution it was established that the monarch could not govern without Parliament's consent, making England in effect a constitutional monarchy. Henry VIII's break with Rome in the 1530s moved England toward Protestantism, and the Acts of Union of 1707 merged it with Scotland into Great Britain.",
  connections: [
    { id: "me-hastings", note: "William's victory began Norman rule over England" },
    { id: "me-glorious-revolution", note: "It established that the monarch must govern with Parliament's consent" },
    { id: "great-britain", note: "The 1707 Acts of Union merged England and Scotland" },
  ],
  cites: [wp("Kingdom_of_England", "Kingdom of England")],
});

TL.enrich("song", {
  why: "China's population doubled between the 10th and 11th centuries, helped by early-ripening rice from Southeast and South Asia, and Kaifeng and Hangzhou each held more than a million people. The Song were the first in world history to issue true paper money, invented gunpowder weapons such as fire arrows, bombs and the fire lance, and made examinations virtually the only way into office, shifting power from a military-aristocratic to a scholar-bureaucratic elite; population growth fomented an economic revolution. The Song alternated between war and diplomacy with northern neighbors, paying tribute to the Liao, lost the north to the Jin in 1127 and fell to the Mongols at Yamen in 1279.",
  connections: [
    { id: "me-southern-song", note: "The Song lost the northern half of its territory to the Jin in 1127" },
    { id: "me-song-falls", note: "The Yuan crushed the last Song resistance at Yamen in 1279" },
  ],
  cites: [wp("Song_dynasty", "Song dynasty")],
});

TL.enrich("hre", {
  why: "Some historians date the empire from Charlemagne's coronation in 800, others from Otto I's in 962; it lasted until Francis II dissolved it on August 6, 1806, after Napoleon created the Confederation of the Rhine. It was an elective monarchy in which princes and archbishops chose the emperor, and its clashes with the papacy, such as Henry IV's walk to Canossa in 1077, left popes and German princes as major political players. Voltaire mocked it as “in no way holy, nor Roman, nor an empire,” but historians such as David Bachrach credit its Ottonian rulers with a sophisticated Carolingian and late Roman administrative inheritance.",
  connections: [
    { id: "me-charlemagne-crowned", note: "Some historians date the empire to this coronation, others to Otto I in 962" },
    { id: "east-francia", note: "Otto I, king of East Francia, was crowned emperor in 962" },
  ],
  cites: [wp("Holy_Roman_Empire", "Holy Roman Empire"), wp("East_Francia", "East Francia")],
});

TL.enrich("france", {
  why: "The kingdom grew out of West Francia: Hugh Capet's election in 987 began a Capetian dynasty that ruled for more than 800 years through its Valois and Bourbon branches. From a small domain on the middle Seine, kings such as Philip II extended royal rule, and the Ordinance of Villers-Cotterêts (1539) helped French replace Latin in legal acts. Under Louis XIV it became a centralized absolute monarchy and, for much of the era, the dominant European power. The Revolution abolished the monarchy in September 1792; kings returned in 1814 and ruled until the revolution of 1848.",
  connections: [
    { id: "me-hundred-years-war", note: "English kings claimed the French throne after 1328" },
    { id: "me-bastille", note: "The Revolution that began in 1789 ended the monarchy in 1792" },
  ],
  cites: [wp("Kingdom_of_France", "Kingdom of France")],
});

TL.enrich("seljuk", {
  why: "Oghuz Turks who converted to Islam in 985, the Seljuks built an empire stretching from Anatolia and the Levant to the Hindu Kush. Their rulers took the title of sultan while acting as protectors of the Abbasid caliph, re-established Sunni Islam in Iraq and western Persia through madrasas such as Nizam al-Mulk's Nizamiya in Baghdad, and carried Persian culture into Anatolia. Victory at Manzikert in 1071 weakened Byzantine authority there and paved the way for Turkification. Alexios I's appeal for help against the Seljuk-led Turks led Pope Urban II to call the First Crusade, and when the Sultanate of Rum fell apart it divided into beyliks, one of which, the Ottomans, conquered the rest.",
  connections: [
    { id: "me-manzikert", note: "The victory weakened Byzantine power in Anatolia" },
    { id: "me-first-crusade", note: "Alexios I's appeal against the Seljuks led to Urban II's call" },
    { id: "ottoman", note: "The Ottomans began as one of the beyliks of Seljuk Anatolia" },
  ],
  cites: [wp("Seljuk_Empire", "Seljuk Empire"), wp("First_Crusade", "First Crusade")],
});

TL.enrich("catholicism", {
  why: "After 1054 the Latin and Greek churches stayed divided, especially over papal authority. Reforming popes legislated against simony and married priests, and the Investiture Controversy with secular rulers ended in a papal victory that implied papal superiority over them. In 1095 Urban II, backing a Byzantine plea for help, urged Christians to undertake an “armed pilgrimage” to Jerusalem, the First Crusade. The 16th-century Reformation prompted the Counter-Reformation. Today the Catholic Church is the largest Christian denomination, with an estimated 1.28 to 1.41 billion baptized members, and the largest non-governmental provider of education and health care.",
  connections: [
    { id: "me-first-crusade", note: "Urban II called for an armed pilgrimage at Clermont in 1095" },
    { id: "protestantism", note: "The Reformation prompted the Catholic Counter-Reformation" },
  ],
  cites: [wp("Catholic_Church", "Catholic Church"), wp("Gregorian_Reform", "Gregorian Reform"), wp("First_Crusade", "First Crusade")],
});

TL.enrich("orthodoxy", {
  why: "The Eastern Orthodox Church is a communion of self-governing churches led by their own synods, with no central authority like the pope; the ecumenical patriarch of Constantinople is honored as “first among equals.” It carries on the Greek-speaking Christianity of the Byzantine world, whose Byzantine Rite remains predominant, and has played a prominent role in Eastern and Southeastern Europe. Under the Golden Horde, a 1267 decree exempted Russian clergy from all taxation, letting the church build up new landed estates. With some 220 million members it is the second-largest Christian body.",
  connections: [
    { id: "me-rus-baptism", note: "Vladimir's conversion brought Orthodoxy and Cyrillic liturgy to Rus'" },
    { id: "byzantine", note: "The church carries on the Greek-speaking Byzantine tradition and rite" },
  ],
  cites: [wp("Eastern_Orthodox_Church", "Eastern Orthodox Church"), wp("Golden_Horde", "Golden Horde"), wp("Kievan_Rus%27", "Kievan Rus'")],
});

TL.enrich("me-great-schism", {
  why: "Long-building tensions between the Greek East and Latin West, disputes over the Eucharistic bread and above all the pope's claim to universal jurisdiction came to a head when Cardinal Humbert excommunicated Patriarch Michael Cerularius, who excommunicated the legates in turn. Cerularius's sentence applied only to the legates personally, and theirs was of doubtful validity since Pope Leo IX had died. Though 1054 has become the conventional date, the schism culminated in the Fourth Crusade's sack of Constantinople in 1204 and the imposition of Latin patriarchs. In 1965 Pope Paul VI and Patriarch Athenagoras I nullified the anathemas, a goodwill gesture that did not restore communion.",
  connections: [
    { id: "me-fourth-crusade", note: "The 1204 sack and Latin patriarchs made the schism clear" },
    { id: "me-charlemagne-crowned", note: "Charlemagne's coronation is listed among the schism's causes" },
  ],
  cites: [wp("East%E2%80%93West_Schism", "East–West Schism")],
});

TL.enrich("teotihuacan", {
  why: "At its height Teotihuacan was the largest city in the Americas, with perhaps 100,000 to 250,000 people, including migrants from Oaxaca and the Gulf Coast. Its reach extended to the Maya: in 378 the warlord Sihyaj K'ahk' conquered Tikal, about 1,000 km away, though scholars debate whether Teotihuacan's influence rested on direct military dominance or on prestige. Around 550 its major monuments were sacked and burned, which some see as an internal uprising and others link to drought. Regional powers such as Xochicalco and Tula then dominated central Mexico, and the Aztecs, who claimed a common ancestry with its people, made the ruins a place of pilgrimage.",
  connections: [
    { id: "an-tikal-378", note: "The warlord Sihyaj K'ahk' conquered Tikal in 378" },
    { id: "aztec", note: "The Aztecs made the ruins a pilgrimage site and claimed shared ancestry" },
  ],
  cites: [wp("Teotihuacan", "Teotihuacan")],
});
