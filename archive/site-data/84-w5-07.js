// Fill-in W5-07: South and East Asia 1000 BCE–1000 CE (Kushan, Mahajanapadas, Pallavas, Vedic, Chenla, Six Dynasties, Funan, Gojoseon, Goryeo, Han, Japan, Jōmon). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const WH = (slug, title) => ({ t: `${title} — World History Encyclopedia`, u: `https://www.worldhistory.org/${slug}/` });
const X = (t, u) => ({ t, u });
const U = (n, title) => ({ t: `${title} — UNESCO World Heritage Centre`, u: `https://whc.unesco.org/en/list/${n}/`, k: "reference" });

TL.add({ events: [
  // ---------- Kushan Empire ----------
  { id: "w507-gandharan-art", branch: "kushan", y: 50, end: 250, when: "c. 1st–3rd centuries CE", title: "Gandharan Buddhist art flourishes under the Kushans",
    text: "In what is now northwestern Pakistan and eastern Afghanistan, a Greco-Roman-influenced style of Buddhist sculpture flourished largely under Kushan rule, alongside a different school at Mathura.", imp: 2,
    cites: [B("art/Gandhara-art", "Gandhara art"), W("Gandharan_art", "Gandharan art")] },
  { id: "w507-sasanians-take-bactria", branch: "kushan", y: 230, when: "c. 230 CE", title: "Sasanians seize Bactria from the Kushans",
    text: "Sasanian Persia pushed into Bactria under Ardashir I and then Shapur I, setting up Sasanian governors titled Kushanshah (\"King of the Kushans\") in a Kushano-Sasanian kingdom.", imp: 2, link: "sasanian",
    cites: [W("Kushano-Sasanian_Kingdom", "Kushano-Sasanian Kingdom"), B("topic/Kushan-dynasty", "Kushan dynasty")] },
  { id: "w507-kidarites-end-kushano-sasanian", branch: "kushan", y: 365, when: "c. 360–370 CE", title: "Kidarites overrun the last Kushan lands",
    text: "Around 360–370 the Kidarites took much of the Kushano-Sasanian territory, and the remainder was absorbed by the Sasanian Empire, ending Kushan-titled rule in Bactria.", imp: 3,
    cites: [W("Kushano-Sasanian_Kingdom", "Kushano-Sasanian Kingdom")] },

  // ---------- Mahajanapadas ----------
  { id: "w507-panini-ashtadhyayi", branch: "mahajanapadas", y: -350, when: "c. 4th century BCE (dated variously 6th–4th centuries BCE)", title: "Pāṇini composes the Aṣṭādhyāyī",
    text: "The grammarian Pāṇini set Sanskrit out in some 4,000 terse rules, the earliest Sanskrit grammar to survive complete; it fixed the classical language and has been compared to a formal system.", imp: 2,
    cites: [B("biography/Panini-Indian-grammarian", "Panini"), W("Panini_(grammarian)", "Pāṇini")] },
  { id: "w507-nanda-seize-magadha", branch: "mahajanapadas", y: -343, when: "c. 345–343 BCE", title: "Mahapadma Nanda takes power in Magadha",
    text: "Mahapadma, of low social origin, took over Magadha from the Shishunagas and their policy of expansion; the Nandas ruled until about 321 BCE, when Chandragupta Maurya ended the line.", imp: 2,
    cites: [B("topic/Nanda-dynasty", "Nanda dynasty"), W("Nanda_Empire", "Nanda Empire")] },

  // ---------- Pallavas ----------
  { id: "w507-vishnugopa-defeated", branch: "pallavas", y: 350, when: "mid-4th century CE", title: "Samudragupta defeats the Pallava Vishnugopa",
    text: "The Gupta emperor Samudragupta marched south, defeated Vishnugopa of Kanchi, and restored him on payment of tribute, according to the Allahabad Pillar inscription.", imp: 3, link: "gupta",
    cites: [B("topic/Pallava-dynasty", "Pallava dynasty"), B("biography/Samudragupta", "Samudragupta"), W("Samudragupta", "Samudragupta")] },
  { id: "w507-simhavishnu-kalabhras", branch: "pallavas", y: 575, when: "c. 575–600 CE", title: "Simhavishnu strikes the Kalabhras",
    text: "Toward the close of the 6th century the Pallava king Simhavishnu struck a blow against the Kalabhras who had invaded the Tamil country, opening the dynasty's great age.", imp: 3,
    cites: [W("Pallava_dynasty", "Pallava dynasty")] },
  { id: "w507-mahendravarman-rock-cut", branch: "pallavas", y: 610, when: "c. 600–630 CE", title: "Mahendravarman I pioneers Pallava rock-cut temples",
    text: "Mahendravarman I excavated cave temples across the Tamil country, one inscription boasting of a shrine built without brick, timber, metal or mortar, and wrote the Sanskrit farce Mattavilasa Prahasana.", imp: 2,
    cites: [W("Mahendravarman_I", "Mahendravarman I"), B("topic/Pallava-dynasty", "Pallava dynasty")] },
  { id: "w507-vatapi-captured", branch: "pallavas", y: 642, when: "c. 642 CE", title: "Narasimhavarman I captures Vatapi",
    text: "Avenging his father's defeat, Narasimhavarman I destroyed the Chalukya capital Vatapi, killing Pulakeshin II, and took the title Vatapikondan; Britannica dates the Pallava raids 641–647.", imp: 2,
    cites: [W("Narasimhavarman_I", "Narasimhavarman I"), B("topic/Chalukya-dynasty", "Chalukya dynasty")] },
  { id: "w507-shore-temple", branch: "pallavas", y: 725, when: "c. 725 CE", title: "Shore Temple rises at Mamallapuram",
    text: "Under Narasimhavarman II (Rajasimha), the granite Shore Temple was built on the Bay of Bengal coast, one of southern India's oldest structural stone temples and part of a UNESCO World Heritage Site.", imp: 2,
    cites: [W("Shore_Temple", "Shore Temple"), U(249, "Group of Monuments at Mahabalipuram"), B("place/Mahabalipuram", "Mahabalipuram")] },

  // ---------- Vedic period ----------
  { id: "w507-kuru-kingdom", branch: "vedic", y: -1000, when: "c. 1200–900 BCE", title: "The Kuru kingdom forms",
    text: "A union of Bharata and Puru tribes created the Kuru kingdom, the first recorded state-level society in the subcontinent, whose priests collected and standardized the Vedic hymns and developed Shrauta ritual.", imp: 2,
    cites: [W("Kuru_Kingdom", "Kuru Kingdom")] },
  { id: "w507-painted-grey-ware", branch: "vedic", y: -900, end: -600, when: "c. 1200–600 BCE (conventional dating)", title: "Painted Grey Ware culture spreads across the Ganges plain",
    text: "A culture of fine grey pottery and early ironworking in the western Gangetic plain probably corresponds to the middle and late Vedic age and the Kuru-Panchala kingdom.", imp: 3,
    cites: [W("Painted_Grey_Ware_culture", "Painted Grey Ware culture")] },
  { id: "w507-brahmanas", branch: "vedic", y: -800, end: -700, when: "c. 900–700 BCE", title: "The Brahmanas explain the sacrifice",
    text: "Prose commentaries on the Vedas, the Brahmanas, set out the meaning of ritual sacrifice; the Shatapatha Brahmana, attributed to Yajnavalkya, is the most complete and ends with the Brihadaranyaka Upanishad.", imp: 2,
    cites: [B("topic/Brahmana", "Brahmana"), W("Shatapatha_Brahmana", "Shatapatha Brahmana")] },
  { id: "w507-shulba-sutras", branch: "vedic", y: -600, when: "c. 800–500 BCE (dating uncertain)", title: "Shulba Sutras record altar geometry",
    text: "Ritual manuals such as Baudhayana's Shulba Sutra, built on fire-altar construction, state the Pythagorean theorem and give a close approximation of the square root of 2.", imp: 2,
    cites: [W("Shulba_Sutras", "Shulba Sutras"), B("topic/Sulba-Sutra", "Sulba Sutra")] },

  // ---------- Chenla ----------
  { id: "w507-bhavavarman-expands", branch: "chenla", y: 550, when: "c. 550 CE", title: "Bhavavarman I expands into the Mekong valley",
    text: "The Chenla king Bhavavarman I pushed Kambuja into the Mekong valley and attacked Funan; Chinese records credit his successor Chitrasena (Mahendravarman) with Funan's conquest.", imp: 2, link: "funan",
    cites: [W("Bhavavarman_I", "Bhavavarman I"), B("place/Chenla", "Chenla")] },

  // ---------- Six Dynasties ----------
  { id: "w507-red-cliffs", branch: "china-division", y: 208.9, when: "winter 208–209 CE", title: "Battle of Red Cliffs",
    text: "On the Yangtze, the allied forces of Sun Quan and Liu Bei routed the larger army of Cao Cao, blocking his reunification of the Han lands and setting the stage for Shu Han and Eastern Wu.", imp: 2,
    cites: [W("Battle_of_Red_Cliffs", "Battle of Red Cliffs"), WH("Battle_of_Red_Cliffs", "Battle of Red Cliffs")] },
  { id: "w507-jin-conquers-wu", branch: "china-division", y: 280.33, when: "May 1, 280 CE", title: "Jin conquers Wu and reunifies China",
    text: "Sun Hao surrendered to the Jin general Wang Jun at Shitou, ending Eastern Wu and the Three Kingdoms and briefly reuniting China under the Western Jin.", imp: 2,
    cites: [W("Conquest_of_Wu_by_Jin", "Conquest of Wu by Jin"), B("topic/Six-Dynasties", "Six Dynasties")] },
  { id: "w507-lanting-preface", branch: "china-division", y: 353.3, when: "353 CE", title: "Wang Xizhi writes the Lanting Preface",
    text: "At a spring gathering of 42 literati at the Orchid Pavilion, the governor Wang Xizhi wrote a preface in running script that became his best-known work; the original is lost.", imp: 2,
    cites: [B("biography/Wang-Xizhi", "Wang Xizhi"), W("Lantingji_Xu", "Lantingji Xu")] },
  { id: "w507-fei-river", branch: "china-division", y: 383.91, when: "November 30, 383 CE", title: "Battle of the Fei River",
    text: "The Eastern Jin generals Xie Shi and Xie Xuan defeated Fu Jian's Former Qin army; Former Qin then fell apart, and the victory ensured the survival of Han-ruled states in the south.", imp: 2,
    cites: [W("Battle_of_Fei_River", "Battle of Fei River")] },
  { id: "w507-yungang", branch: "china-division", y: 460, end: 525, when: "c. 460–525 CE", title: "Yungang grottoes are carved at Pingcheng",
    text: "Beginning with five caves ordered by the monk Tanyao, Northern Wei rulers had colossal Buddhas cut into the cliffs near their capital, a landmark of Chinese Buddhist cave art.", imp: 2,
    cites: [B("topic/Yungang-Caves", "Yungang caves"), U(1039, "Yungang Grottoes"), W("Yungang_Grottoes", "Yungang Grottoes")] },
  { id: "w507-zu-chongzhi", branch: "china-division", y: 462, when: "c. 462 CE", title: "Zu Chongzhi proposes the Daming calendar",
    text: "The mathematician Zu Chongzhi urged a more precise calendar accounting for precession; adopted in 510, it came with his bounds on pi (3.1415926 to 3.1415927) and the ratio 355/113.", imp: 2,
    cites: [B("biography/Zu-Chongzhi", "Zu Chongzhi"), W("Zu_Chongzhi", "Zu Chongzhi")] },
  { id: "w507-longmen", branch: "china-division", y: 494, when: "c. 494 CE", title: "Longmen caves begin after Luoyang becomes capital",
    text: "When Emperor Xiaowen moved the Northern Wei court to Luoyang, a new series of Buddhist cave temples was begun at Longmen, which grew to over 2,000 caves and niches.", imp: 2,
    cites: [B("topic/Yungang-Caves", "Yungang caves"), U(1003, "Longmen Grottoes"), W("Longmen_Grottoes", "Longmen Grottoes")] },
  { id: "w507-northern-wei-ends", branch: "china-division", y: 534, when: "534–535 CE", title: "The Northern Wei dynasty ends",
    text: "The Tuoba-founded Northern Wei, which had ruled North China since 386 and sinicized under Xiaowen, came to an end in 534/535, leaving the north to rival successor regimes.", imp: 3,
    cites: [B("topic/Six-Dynasties", "Six Dynasties"), B("biography/Xiaowendi", "Xiaowendi")] },

  // ---------- Funan ----------
  { id: "w507-hun-tian-legend", branch: "funan", y: 50, when: "c. 1st century CE (legend)", title: "Hun Tian and the founding legend of Funan",
    text: "Chinese sources tell of a foreigner with a divine bow who arrived by ship and founded Funan; some scholars identify Hun Tian with the Brahmin Kaundinya, reflecting early Indian influence.", imp: 3,
    cites: [W("Funan", "Funan"), B("place/Funan", "Funan")] },
  { id: "w507-oc-eo-roman-medallions", branch: "funan", y: 150, when: "c. 2nd century CE", title: "Roman gold medallions reach Funan's port of Óc Eo",
    text: "Excavations at Óc Eo in the Mekong Delta found gold medallions from the reign of Antoninus Pius, evidence that Funan's port was linked to trade stretching to the Roman world.", imp: 2, link: "roman-empire",
    cites: [W("Oc_Eo", "Oc Eo"), B("place/Oc-Eo", "Oc Eo")] },

  // ---------- Gojoseon ----------
  { id: "w507-yan-takes-western-territory", branch: "gojoseon", y: -300, when: "c. 300 BCE", title: "Yan wins land from Old Joseon",
    text: "After a war with the Chinese state of Yan, Old Joseon lost western territory (reported as 2,000 li) and is thought to have moved its capital toward the Pyongyang region.", imp: 3,
    cites: [W("Gojoseon", "Gojoseon"), WH("Gojoseon", "Gojoseon")] },

  // ---------- Goryeo ----------
  { id: "w507-wang-geon-unifies", branch: "goryeo", y: 936, when: "936", title: "Wang Geon unifies the Korean peninsula",
    text: "After Silla surrendered in 935 and Later Baekje in 936, Taejo (Wang Geon) ruled a unified Goryeo, absorbing the elites of the toppled states into his government.", imp: 2,
    cites: [B("biography/Wang-Kon", "Wang Kon"), B("topic/Goryeo-dynasty", "Goryeo dynasty")] },
  { id: "w507-civil-service-exam", branch: "goryeo", y: 958, when: "958", title: "Gwangjong introduces civil service examinations",
    text: "On the advice of the Chinese envoy Shuang Ji, King Gwangjong created a state examination to choose officials by merit rather than family, weakening the noble clans.", imp: 2,
    cites: [W("Gwangjong_of_Goryeo", "Gwangjong of Goryeo")] },

  // ---------- Han dynasty ----------
  { id: "w507-shiji", branch: "han", y: -91, when: "c. 91 BCE (Britannica: c. 85 BCE)", title: "Sima Qian completes the Shiji",
    text: "Sima Qian finished his Records of the Grand Historian, 130 chapters of some 526,500 characters on about 2,500 years from the Yellow Emperor to Emperor Wu, the model for later dynastic histories.", imp: 2,
    cites: [B("biography/Sima-Qian", "Sima Qian"), W("Records_of_the_Grand_Historian", "Records of the Grand Historian")] },
  { id: "w507-wang-zhaojun", branch: "han", y: -33, when: "33 BCE", title: "Wang Zhaojun marries the Xiongnu chanyu",
    text: "When Chanyu Huhanye came to Chang'an and asked to be an imperial son-in-law, the court-woman Wang Zhaojun was sent to him in a marriage alliance; she became a favorite subject of Chinese poetry and drama.", imp: 3, link: "xiongnu",
    cites: [W("Wang_Zhaojun", "Wang Zhaojun")] },

  // ---------- Japan ----------
  { id: "w507-yayoi-rice", branch: "japan", y: -300, when: "c. 300 BCE (radiocarbon dates debated)", title: "Wet-rice farming and metals mark the Yayoi",
    text: "Yayoi culture arose in Kyushu and spread northeast, with wet paddy rice and bronze and iron casting; radiocarbon evidence puts its start between 500 and 300 BCE.", imp: 2,
    cites: [B("topic/Yayoi-culture", "Yayoi culture"), W("J%C5%8Dmon_period", "Jōmon period")] },
  { id: "w507-dotaku-bells", branch: "japan", y: -150, end: 150, when: "c. 2nd century BCE–2nd century CE", title: "Yayoi smiths cast dōtaku bronze bells",
    text: "For about 400 years Yayoi communities made ceremonial dōtaku bells, decorated with matchstick figures and likely used in harvest rites, then buried them on hillsides.", imp: 3,
    cites: [W("Dotaku", "Dōtaku"), B("topic/Yayoi-culture", "Yayoi culture")] },
  { id: "w507-na-gold-seal", branch: "japan", y: 57, when: "57 CE", title: "Han emperor grants a gold seal to the king of Na",
    text: "The Book of the Later Han records that Emperor Guangwu gave a gold seal to an envoy from the Na state of Wa; a seal found on Shikanoshima in 1784 is a National Treasure.", imp: 2, link: "han",
    cites: [W("King_of_Na_gold_seal", "King of Na gold seal"), X("The King of Na gold seal — Kyushu Regional Development Bureau, MLIT", "https://www.qsr.mlit.go.jp/suishin/story2019/english/01_6.html")] },
  { id: "w507-himiko-wei", branch: "japan", y: 239, when: "238 or 239 CE", title: "Queen Himiko sends an embassy to Wei",
    text: "Himiko, who ruled a confederation of some thirty states, sent envoys to Wei and received the title \"Queen of Wa Friendly to Wei\" and a gold seal; the location of Yamatai is still disputed.", imp: 2, link: "china-division",
    cites: [W("Himiko", "Himiko"), B("place/Yamatai", "Yamatai")] },
  { id: "w507-kofun-begin", branch: "japan", y: 250, when: "c. 250–300 CE", title: "The Kofun tomb-building era begins",
    text: "Japan's elite began raising large mounded tombs, many keyhole-shaped; some 160,000 kofun survive, marking the rise of the Yamato kingship in the Kofun period (3rd to 6th century).", imp: 2,
    cites: [U(1593, "Mozu-Furuichi Kofun Group"), W("Kofun_period", "Kofun period")] },
  { id: "w507-haniwa", branch: "japan", y: 300, end: 552, when: "from the early 4th century CE", title: "Haniwa clay figures guard the tombs",
    text: "From the early 4th century, plain clay cylinders around kofun gained sculpted figures of warriors, attendants, animals, boats and houses, thought to represent service to the dead.", imp: 2,
    cites: [B("art/haniwa", "Haniwa"), W("Kofun_period", "Kofun period")] },
  { id: "w507-daisen-kofun", branch: "japan", y: 450, when: "mid-5th century CE", title: "The Daisen Kofun is raised at Sakai",
    text: "The roughly 500-meter keyhole tomb attributed to Emperor Nintoku, the largest kofun in Japan, is the centerpiece of the Mozu group, inscribed by UNESCO in 2019.", imp: 2,
    cites: [W("Daisen_Kofun", "Daisen Kofun"), U(1593, "Mozu-Furuichi Kofun Group")] },
  { id: "w507-king-bu-song", branch: "japan", y: 478, when: "478 CE", title: "King Bu of Wa petitions the Liu Song court",
    text: "The Wa king Bu, usually identified as Emperor Yūryaku, sought higher Chinese titles from Liu Song; Emperor Shun made him general over six realms, including Silla and Gaya but not Baekje.", imp: 3, link: "china-division",
    cites: [W("Five_kings_of_Wa", "Five kings of Wa")] },
  { id: "w507-kojiki", branch: "japan", y: 712, when: "712", title: "Kojiki compiled for Empress Genmei",
    text: "Ō no Yasumaro compiled the Kojiki at the empress's request, setting down Hieda no Are's recitation of myths and imperial genealogy; it is usually considered Japan's oldest surviving literary work.", imp: 2,
    cites: [B("topic/Kojiki", "Kojiki"), WH("Kojiki", "Kojiki: Japan's Oldest Book"), W("Kojiki", "Kojiki")] },
  { id: "w507-heijo-kyo", branch: "japan", y: 710, when: "710", title: "Heijō-kyō (Nara) becomes the capital",
    text: "Modeled on Tang Chang'an, Empress Genmei's new capital at Nara served as Japan's seat from 710 to 784, with a break from 740 to 745, and anchored the Nara period of state Buddhism.", imp: 2, link: "tang",
    cites: [B("place/Nara-Japan", "Nara"), W("Heij%C5%8D-ky%C5%8D", "Heijō-kyō")] },
  { id: "w507-todaiji-great-buddha", branch: "japan", y: 752, when: "752", title: "Tōdai-ji's Great Buddha is consecrated",
    text: "Emperor Shōmu's bronze Vairocana, which temple records say drew contributions from more than 2.6 million people, had its eye-opening ceremony at Tōdai-ji, Nara.", imp: 2,
    cites: [B("topic/Todai-Temple", "Todai Temple"), W("T%C5%8Ddai-ji", "Tōdai-ji")] },
  { id: "w507-manyoshu", branch: "japan", y: 759, when: "after 759", title: "The Man'yōshū poetry anthology takes shape",
    text: "Japan's oldest surviving collection of waka, 20 volumes with over 4,500 poems by emperors and commoners, was compiled after 759, probably by Ōtomo no Yakamochi, using man'yōgana script.", imp: 2,
    cites: [W("Man%27y%C5%8Dsh%C5%AB", "Man'yōshū"), B("topic/Nara-period", "Nara period")] },
  { id: "w507-heian-kyo", branch: "japan", y: 794.8, when: "794", title: "Emperor Kanmu founds Heian-kyō",
    text: "Kanmu moved the capital to Heian-kyō, later Kyoto, a Tang-style grid city that stayed the imperial seat until the 19th century and gave its name to the Heian period.", imp: 2,
    cites: [B("topic/Heian-period", "Heian period"), W("Heian-ky%C5%8D", "Heian-kyō")] },
  { id: "w507-kentoshi-cancelled", branch: "japan", y: 894, when: "894", title: "Japan cancels its mission to Tang China",
    text: "A mission planned for 894, with Sugawara no Michizane named envoy, was cancelled; the last mission to China had sailed in 838–839, after 19 missions since 607.", imp: 3, link: "tang",
    cites: [W("Kent%C5%8Dshi", "Kentōshi")] },
  { id: "w507-kokinshu", branch: "japan", y: 905, when: "c. 905", title: "Kokinshū, first imperial waka anthology",
    text: "Ki no Tsurayuki and others compiled the Kokinshū on imperial order, 1,111 poems in 20 books; Tsurayuki's preface in Japanese began Japanese poetic criticism.", imp: 2,
    cites: [B("topic/Kokinshu", "Kokinshu"), W("Kokin_Wakash%C5%AB", "Kokin Wakashū")] },

  // ---------- Jōmon culture ----------
  { id: "w507-shakokidogu", branch: "jomon", y: -1000, end: -400, when: "c. 1000–400 BCE", title: "Goggle-eyed dogū figurines are made",
    text: "Late Jōmon potters in northern Honshu, as at Kamegaoka, made shakōkidogū clay figures with goggle-like eyes and exaggerated bodies; their exact function is unknown, though they may have served as fertility symbols or childbirth aids.", imp: 2,
    cites: [W("Dog%C5%AB", "Dogū"), B("art/dogu", "Dogu")] },
  { id: "w507-kyushu-rice-settlements", branch: "jomon", y: -900, when: "c. 900 BCE", title: "Korean-type rice-farming settlements appear in Kyushu",
    text: "Contact with the peninsula brought settlements in western Kyushu from about 900 BCE, with wet-rice farming and metallurgy; they coexisted with Jōmon communities for centuries.", imp: 2,
    cites: [W("J%C5%8Dmon_period", "Jōmon period")] },
] });

TL.geo("w507-gandharan-art", { scope: "region", lat: 33.76, lon: 72.83, r: 300, label: "Gandhara", src: "https://en.wikipedia.org/wiki/Gandhara" });
TL.geo("w507-sasanians-take-bactria", { scope: "region", lat: 36.76, lon: 66.9, r: 400, label: "Bactria", src: "https://en.wikipedia.org/wiki/Bactria" });
TL.geo("w507-kidarites-end-kushano-sasanian", { scope: "region", lat: 36.76, lon: 66.9, r: 400, label: "Bactria", src: "https://en.wikipedia.org/wiki/Bactria" });
TL.geo("w507-panini-ashtadhyayi", { scope: "region", lat: 33.76, lon: 72.83, r: 300, label: "Gandhara", src: "https://en.wikipedia.org/wiki/Gandhara" });
TL.geo("w507-nanda-seize-magadha", { scope: "region", lat: 25.2, lon: 85.0, r: 300, label: "Magadha", src: "https://en.wikipedia.org/wiki/Magadha" });
TL.geo("w507-vishnugopa-defeated", { scope: "place", lat: 12.83, lon: 79.7, r: 60, label: "Kanchipuram, India", src: "https://en.wikipedia.org/wiki/Kanchipuram" });
TL.geo("w507-simhavishnu-kalabhras", { scope: "place", lat: 12.83, lon: 79.7, r: 60, label: "Kanchipuram, India", src: "https://en.wikipedia.org/wiki/Kanchipuram" });
TL.geo("w507-mahendravarman-rock-cut", { scope: "region", lat: 11, lon: 79, r: 250, label: "Tamil Nadu", src: "https://en.wikipedia.org/wiki/Tamil_Nadu" });
TL.geo("w507-vatapi-captured", { scope: "place", lat: 15.92, lon: 75.68, r: 50, label: "Badami (Vatapi), India", src: "https://en.wikipedia.org/wiki/Badami" });
TL.geo("w507-shore-temple", { scope: "place", lat: 12.617, lon: 80.192, r: 30, label: "Mamallapuram, India", src: "https://en.wikipedia.org/wiki/Shore_Temple" });
TL.geo("w507-kuru-kingdom", { scope: "region", lat: 29.97, lon: 76.84, r: 250, label: "Kurukshetra region", src: "https://en.wikipedia.org/wiki/Kurukshetra" });
TL.geo("w507-painted-grey-ware", { scope: "region", lat: 29.0, lon: 77.0, r: 500, label: "Upper Ganges plain", src: "https://en.wikipedia.org/wiki/Doab" });
TL.geo("w507-brahmanas", { scope: "region", lat: 29.0, lon: 77.0, r: 500, label: "Upper Ganges plain", src: "https://en.wikipedia.org/wiki/Doab" });
TL.geo("w507-shulba-sutras", { scope: "region", lat: 29.0, lon: 77.0, r: 500, label: "Upper Ganges plain", src: "https://en.wikipedia.org/wiki/Doab" });
TL.geo("w507-bhavavarman-expands", { scope: "region", lat: 12.5, lon: 105, r: 400, label: "Cambodia", src: "https://en.wikipedia.org/wiki/Cambodia" });
TL.geo("w507-red-cliffs", { scope: "place", lat: 29.72, lon: 113.9, r: 60, label: "Chibi, Hubei", src: "https://en.wikipedia.org/wiki/Chibi,_Hubei" });
TL.geo("w507-jin-conquers-wu", { scope: "place", lat: 32.06, lon: 118.79, r: 60, label: "Nanjing, China", src: "https://en.wikipedia.org/wiki/Nanjing" });
TL.geo("w507-lanting-preface", { scope: "place", lat: 30.05, lon: 120.58, r: 40, label: "Shaoxing, China", src: "https://en.wikipedia.org/wiki/Shaoxing" });
TL.geo("w507-fei-river", { scope: "place", lat: 32.55, lon: 116.8, r: 60, label: "Shou County, Anhui", src: "https://en.wikipedia.org/wiki/Shou_County" });
TL.geo("w507-yungang", { scope: "place", lat: 40.11, lon: 113.13, r: 40, label: "Yungang Grottoes, Datong", src: "https://en.wikipedia.org/wiki/Yungang_Grottoes" });
TL.geo("w507-zu-chongzhi", { scope: "place", lat: 32.06, lon: 118.79, r: 60, label: "Nanjing, China", src: "https://en.wikipedia.org/wiki/Nanjing" });
TL.geo("w507-longmen", { scope: "place", lat: 34.56, lon: 112.47, r: 40, label: "Longmen Grottoes, Luoyang", src: "https://en.wikipedia.org/wiki/Longmen_Grottoes" });
TL.geo("w507-northern-wei-ends", { scope: "place", lat: 34.62, lon: 112.45, r: 60, label: "Luoyang, China", src: "https://en.wikipedia.org/wiki/Luoyang" });
TL.geo("w507-hun-tian-legend", { scope: "region", lat: 10.04, lon: 105.8, r: 300, label: "Mekong Delta", src: "https://en.wikipedia.org/wiki/Mekong_Delta" });
TL.geo("w507-oc-eo-roman-medallions", { scope: "place", lat: 10.23, lon: 105.15, r: 60, label: "Óc Eo, Vietnam", src: "https://en.wikipedia.org/wiki/Oc_Eo" });
TL.geo("w507-yan-takes-western-territory", { scope: "region", lat: 40, lon: 122.5, r: 500, label: "Liaodong and northwest Korea", src: "https://en.wikipedia.org/wiki/Liaodong" });
TL.geo("w507-wang-geon-unifies", { scope: "place", lat: 37.97, lon: 126.56, r: 60, label: "Kaesong, Korea", src: "https://en.wikipedia.org/wiki/Kaesong" });
TL.geo("w507-civil-service-exam", { scope: "place", lat: 37.97, lon: 126.56, r: 60, label: "Kaesong, Korea", src: "https://en.wikipedia.org/wiki/Kaesong" });
TL.geo("w507-shiji", { scope: "place", lat: 34.31, lon: 108.86, r: 60, label: "Chang'an, China", src: "https://en.wikipedia.org/wiki/Chang%27an" });
TL.geo("w507-wang-zhaojun", { scope: "place", lat: 34.31, lon: 108.86, r: 60, label: "Chang'an, China", src: "https://en.wikipedia.org/wiki/Chang%27an" });
TL.geo("w507-yayoi-rice", { scope: "region", lat: 33, lon: 131, r: 250, label: "Northern Kyushu", src: "https://en.wikipedia.org/wiki/Kyushu" });
TL.geo("w507-dotaku-bells", { scope: "region", lat: 35, lon: 135, r: 350, label: "Kansai region", src: "https://en.wikipedia.org/wiki/Kansai_region" });
TL.geo("w507-na-gold-seal", { scope: "place", lat: 33.67, lon: 130.3, r: 40, label: "Shikanoshima, Fukuoka", src: "https://en.wikipedia.org/wiki/Shikanoshima" });
TL.geo("w507-himiko-wei", { scope: "region", lat: 36, lon: 138, r: 500, label: "Japan (Wa)", src: "https://en.wikipedia.org/wiki/Japan" });
TL.geo("w507-kofun-begin", { scope: "place", lat: 34.52, lon: 135.84, r: 60, label: "Sakurai, Nara", src: "https://en.wikipedia.org/wiki/Sakurai,_Nara" });
TL.geo("w507-haniwa", { scope: "region", lat: 34.6, lon: 135.6, r: 300, label: "Kinai region", src: "https://en.wikipedia.org/wiki/Kinai" });
TL.geo("w507-daisen-kofun", { scope: "place", lat: 34.57, lon: 135.48, r: 30, label: "Sakai, Osaka", src: "https://en.wikipedia.org/wiki/Sakai,_Osaka" });
TL.geo("w507-king-bu-song", { scope: "region", lat: 34.6, lon: 135.6, r: 300, label: "Yamato, Japan", src: "https://en.wikipedia.org/wiki/Yamato_Province" });
TL.geo("w507-kojiki", { scope: "place", lat: 34.68, lon: 135.81, r: 30, label: "Nara, Japan", src: "https://en.wikipedia.org/wiki/Nara,_Nara" });
TL.geo("w507-heijo-kyo", { scope: "place", lat: 34.69, lon: 135.8, r: 30, label: "Heijō Palace, Nara", src: "https://en.wikipedia.org/wiki/Heij%C5%8D_Palace" });
TL.geo("w507-todaiji-great-buddha", { scope: "place", lat: 34.689, lon: 135.84, r: 30, label: "Tōdai-ji, Nara", src: "https://en.wikipedia.org/wiki/T%C5%8Ddai-ji" });
TL.geo("w507-manyoshu", { scope: "place", lat: 34.68, lon: 135.81, r: 30, label: "Nara, Japan", src: "https://en.wikipedia.org/wiki/Nara,_Nara" });
TL.geo("w507-heian-kyo", { scope: "place", lat: 35.01, lon: 135.77, r: 30, label: "Kyoto, Japan", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w507-kentoshi-cancelled", { scope: "place", lat: 35.01, lon: 135.77, r: 30, label: "Kyoto, Japan", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w507-kokinshu", { scope: "place", lat: 35.01, lon: 135.77, r: 30, label: "Kyoto, Japan", src: "https://en.wikipedia.org/wiki/Kyoto" });
TL.geo("w507-shakokidogu", { scope: "region", lat: 40.96, lon: 140.48, r: 250, label: "Tsugaru, Aomori", src: "https://en.wikipedia.org/wiki/Tsugaru_Peninsula" });
TL.geo("w507-kyushu-rice-settlements", { scope: "region", lat: 33, lon: 131, r: 250, label: "Northern Kyushu", src: "https://en.wikipedia.org/wiki/Kyushu" });
