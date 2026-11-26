// Origins (europe, oceania, early humans, universe): new predecessor branches plus TL.origin for 23 input branches.
const W = (p, t) => ({ t: t + " — Wikipedia", u: "https://en.wikipedia.org/wiki/" + p });

TL.add({
  branches: [
    {
      id: "anglo-saxons", name: "Anglo-Saxon England", region: "europe",
      start: 450, end: 927, startWhen: "by about 450", endWhen: "927 (united under Æthelstan)",
      parents: ["western-roman"], into: ["england"],
      text: "Germanic settlers who had reached Britain by the 5th century, after Romano-Britons stopped receiving Roman officials in 409–410. Their kingdoms were united as England when Æthelstan took York in 927.",
      cites: [W("Anglo-Saxons", "Anglo-Saxons"), W("Kingdom_of_England", "Kingdom of England"), { t: "Anglo-Saxon | Definition, History, Language, Countries, Culture, & Facts | Britannica", u: "https://www.britannica.com/topic/Anglo-Saxon" }],
    },
    {
      id: "visigoths", name: "Visigothic Kingdom", region: "europe",
      start: 418, end: 711, startWhen: "418", endWhen: "711 (Umayyad invasion; Septimania fell 721–725)",
      parents: ["western-roman"], into: ["al-andalus"],
      text: "Rome settled the Visigoths as federates in Aquitaine in 418. After the Franks beat them in 507 the kingdom centered on Hispania (Toledo from 542) until the Umayyad invasion of 711.",
      cites: [W("Visigothic_Kingdom", "Visigothic Kingdom"), { t: "Visigoth | History, Culture & Legacy | Britannica", u: "https://www.britannica.com/topic/Visigoth" }],
    },
    {
      id: "asturias-leon", name: "Kingdom of Asturias and León", region: "europe",
      start: 718, end: 1230, startWhen: "718 (or 722; Pelagius's victory at Covadonga)", endWhen: "1230 (León joined to Castile under Ferdinand III)",
      parents: ["visigoths"], into: ["castile"],
      text: "Began when Pelagius, a nobleman, defeated an Umayyad force at Covadonga. Its court moved to León by 924. León and Castile were definitively united in 1230; the County of Portugal was among its successors.",
      cites: [W("Kingdom_of_Asturias", "Kingdom of Asturias"), W("Visigothic_Kingdom", "Visigothic Kingdom"), W("Crown_of_Castile", "Crown of Castile"), { t: "Leon | Medieval Kingdom of Spain | Britannica", u: "https://www.britannica.com/place/Leon-medieval-kingdom-Spain" }],
    },
    {
      id: "kingdom-of-poland", name: "Kingdom of Poland (medieval)", region: "europe",
      start: 1025, end: 1569, startWhen: "1025 (Bolesław I crowned; Polan state from the early 10th century)", endWhen: "July 1, 1569 (joint state with Lithuania)",
      parents: [], into: ["polish-lithuanian"],
      text: "Monarchy of the Polans, a West Slavic people, under the Piast dynasty. Bolesław I was crowned at Gniezno in 1025, after Mieszko I's baptism (966). Tied to Lithuania from 1385, it became a joint state in 1569.",
      cites: [W("Kingdom_of_Poland_(1025%E2%80%931385)", "Kingdom of Poland (1025–1385)"), { t: "Poland - Medieval, Unification, Partitions | Britannica", u: "https://www.britannica.com/place/Poland/History" }],
    },
    {
      id: "lithuania", name: "Grand Duchy of Lithuania", region: "europe",
      start: 1236, end: 1569, startWhen: "c. 1236 (Mindaugas crowned 1253)", endWhen: "July 1, 1569 (federated into the Commonwealth; the Duchy lasted to 1795)",
      parents: [], into: ["polish-lithuanian"],
      text: "State founded by Lithuanians, a people formed from united Baltic tribes. It absorbed much of the former Kievan Rus', allied dynastically with Poland in the 1380s, and joined it in the Commonwealth in 1569.",
      cites: [W("Grand_Duchy_of_Lithuania", "Grand Duchy of Lithuania"), { t: "Lithuania - Baltic Region, Soviet Union, Independence | Britannica", u: "https://www.britannica.com/place/Lithuania/History" }],
    },
    {
      id: "savoy-sardinia", name: "Kingdom of Sardinia (Savoy–Piedmont)", region: "europe",
      start: 1720, end: 1861, startWhen: "February 17, 1720 (Treaty of The Hague)", endWhen: "March 17, 1861",
      parents: [], into: ["italy"],
      text: "Victor Amadeus II of Savoy received Sardinia in exchange for Sicily in 1720, joining it to Savoy, Aosta, Piedmont and Nice. Its parliament proclaimed the Kingdom of Italy on March 17, 1861.",
      cites: [W("Kingdom_of_Sardinia", "Kingdom of Sardinia"), { t: "Sardinia | Map, History, & Facts | Britannica", u: "https://www.britannica.com/place/Sardinia-historical-kingdom-Italy" }],
    },
  ],
});

TL.geo("anglo-saxons", { scope: "region", lat: 53.13, lon: -1.38, r: 350, label: "Anglo-Saxon England", src: "https://en.wikipedia.org/wiki/England" });
TL.geo("visigoths", { scope: "region", lat: 39.86, lon: -4.02, r: 800, label: "Toledo, Spain", src: "https://en.wikipedia.org/wiki/Toledo,_Spain" });
TL.geo("asturias-leon", { scope: "region", lat: 43.36, lon: -5.85, r: 400, label: "Oviedo, Asturias", src: "https://en.wikipedia.org/wiki/Oviedo" });
TL.geo("kingdom-of-poland", { scope: "region", lat: 52.54, lon: 17.6, r: 450, label: "Gniezno, Poland", src: "https://en.wikipedia.org/wiki/Gniezno" });
TL.geo("lithuania", { scope: "region", lat: 54.69, lon: 25.28, r: 900, label: "Vilnius, Lithuania", src: "https://en.wikipedia.org/wiki/Vilnius" });
TL.geo("savoy-sardinia", { scope: "region", lat: 45.08, lon: 7.68, r: 400, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Turin" });

TL.origin("universe", {
  note: "The universe is dated to about 13.8 billion years ago (WMAP: 13.77 billion). The source describes its “birth” and early inflation but says nothing about what, if anything, came before, so no earlier branch is shown.",
  links: [],
  cites: [{ t: "WMAP Overview — NASA Science", u: "https://science.nasa.gov/mission/wmap/wmap-overview/" }],
});

TL.origin("yamnaya", {
  note: "Core Yamnaya culture lay on the lower Dnieper–Don steppe, with roots in Sredny Stog, Khvalynsk and Repin; genetically a mix of Eastern European and Caucasus hunter-gatherer ancestry. Whether it spoke Proto-Indo-European is debated.",
  links: [],
  cites: [W("Yamnaya_culture", "Yamnaya culture")],
});

TL.origin("austronesian-expansion", {
  note: "Early Austronesians are believed to descend from “pre-Austronesian” peoples of the southern Chinese coast who reached Taiwan, the broadly accepted homeland, before a seaborne spread. The rival “Out of Sundaland” model is debated.",
  links: [
    { id: "neolithic-china", how: "peoples", note: "Believed to descend from coastal southern Chinese farmers; Yangtze cultures like Hemudu linked" },
  ],
  cites: [W("Austronesian_peoples", "Austronesian peoples"), { t: "History of Southeast Asia | Facts, Kingdoms, & Maps | Britannica", u: "https://www.britannica.com/place/history-of-Southeast-Asia-556509" }],
});

TL.origin("renaissance", {
  note: "The Renaissance was the rediscovery and revival of classical antiquity, with Florence an early center in the 13th–14th centuries. Humanists hunted for Latin texts; Greek studies and manuscripts came from Byzantine scholars. Medieval continuity is stressed today.",
  links: [
    { id: "renaissance-humanism", how: "ideas", note: "Humanists such as Petrarch studied ancient texts in their original languages" },
    { id: "roman-empire", how: "ideas", note: "Revived Latin literary, philosophical and artistic achievements of antiquity" },
    { id: "byzantine", how: "ideas", note: "Greek scholars brought manuscripts to Italy, notably after 1453" },
  ],
  cites: [W("Renaissance", "Renaissance"), { t: "Renaissance | Definition, Meaning, History, Artists, Art, & Facts | Britannica", u: "https://www.britannica.com/event/Renaissance" }],
});

TL.origin("new-zealand", {
  note: "Māori and British signed the Treaty of Waitangi on February 6, 1840; the English text has Māori giving up sovereignty. New Zealand was first governed as part of New South Wales, then became a separate colony on May 3, 1841.",
  links: [
    { id: "maori", how: "peoples", note: "Māori chiefs signed the Treaty of Waitangi with the Crown in 1840" },
    { id: "uk", how: "context", note: "A British Crown colony from 1841, with British settlers arriving in growing numbers" },
  ],
  cites: [W("Colony_of_New_Zealand", "Colony of New Zealand"), { t: "Te Tiriti o Waitangi (1840) | Treaty, Description, & Facts | Britannica", u: "https://www.britannica.com/event/Te-Tiriti-o-Waitangi" }],
});

TL.origin("homo-naledi", {
  note: "Known from the Rising Star cave system, South Africa, dated 335,000–236,000 years ago. Its mix of Australopithecus-like and Homo-like traits means its place in the Homo family tree is unresolved.",
  links: [],
  cites: [{ t: "Homo naledi — Smithsonian National Museum of Natural History, What Does It Mean to Be Human?", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-naledi" }],
});

TL.origin("homo-floresiensis", {
  note: "Known only from Liang Bua cave on Flores. Its ancestry is an open question: it may come from an earlier Homo erectus population, or from a smaller early Homo such as the Dmanisi people; its size may reflect island dwarfism.",
  links: [
    { id: "homo-erectus", how: "peoples", note: "Debated: one hypothesis has it evolving from an earlier H. erectus population" },
  ],
  cites: [{ t: "Homo floresiensis — Smithsonian National Museum of Natural History, What Does It Mean to Be Human?", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-floresiensis" }],
});

TL.origin("mycenaean", {
  note: "Most Mycenologists see Mycenaean civilization beginning c. 1750 BCE, evolving from the Early and Middle Bronze Age peoples of mainland Greece with Minoan influence. Whether Indo-European speakers arrived from the steppe is debated.",
  links: [
    { id: "minoan", how: "ideas", note: "Early Mycenaean art, architecture and symbols were heavily influenced by Minoan Crete" },
  ],
  cites: [W("Mycenaean_Greece", "Mycenaean Greece"), { t: "Mycenaean civilization | ancient Greece | Britannica", u: "https://www.britannica.com/topic/Mycenaean-civilization" }],
});

TL.origin("roman-kingdom", {
  note: "Rome grew from settlements around the Palatine Hill on the Tiber, c. 753 BCE by tradition. Its legendary kings included Sabines and, later, men of Etruscan birth; Rome is also said to have conquered the Latins and absorbed Alba Longa.",
  links: [
    { id: "etruscans", how: "context", note: "Several kings were Etruscan-born; Priscus added senators from conquered Etruscan tribes" },
  ],
  cites: [W("Roman_Kingdom", "Roman Kingdom"), { t: "Ancient Rome | History, Government, Religion, Maps, & Facts | Britannica", u: "https://www.britannica.com/place/ancient-Rome" }],
});

TL.origin("england", {
  note: "The Kingdom of England came into being on July 12, 927, when the Anglo-Saxon kingdoms were united under Æthelstan, who took York, the last Viking-held kingdom. It grew from Wessex, whose kings expanded their authority against the Danelaw.",
  links: [
    { id: "anglo-saxons", how: "successor", note: "The Anglo-Saxon kingdoms were united under Æthelstan in 927" },
  ],
  cites: [W("Kingdom_of_England", "Kingdom of England"), { t: "Athelstan | Anglo-Saxon King, Wessex Ruler, First King of England | Britannica", u: "https://www.britannica.com/biography/Athelstan" }],
});

TL.origin("scotland", {
  note: "Traditionally founded in 843 under Kenneth MacAlpin, king of the Picts. Pictish kingdoms gradually adopted Gaelic language and customs and merged with the Gaelic kingdom; historians debate who took over whom. Viking raids had weakened both.",
  links: [
    { id: "picts", how: "merger", note: "Pictland merged with Dál Riata into the Kingdom of Alba under the House of Alpin" },
    { id: "dal-riata", how: "merger", note: "Merged with Pictland into Alba after Cináed mac Ailpín became king of the Picts c. 843" },
  ],
  cites: [W("Kingdom_of_Scotland", "Kingdom of Scotland"), W("Picts", "Picts"), W("D%C3%A1l_Riata", "Dál Riata"), { t: "Pict | Celtic Culture, Iron Age & Scotland | Britannica", u: "https://www.britannica.com/topic/Pict" }],
});

TL.origin("castile", {
  note: "Castile began as a county of the Kingdom of León, itself grown from Asturias, and became a kingdom in the 11th century. Ferdinand III received Castile in 1217 and León in 1230, uniting the two definitively as the Crown of Castile.",
  links: [
    { id: "asturias-leon", how: "successor", note: "Castile grew from a county of León, which grew from Asturias; united with León in 1230" },
  ],
  cites: [W("Crown_of_Castile", "Crown of Castile"), { t: "Castile | Spain, Map, History, & Facts | Britannica", u: "https://www.britannica.com/place/Castile-region-Spain" }],
});

TL.origin("aragon", {
  note: "The Crown of Aragon began in 1137 as a dynastic union of the Kingdom of Aragon and the County of Barcelona, through the marriage of Petronilla of Aragon and Ramon Berenguer IV. Aragon itself began as a union of the counties of Aragon, Sobrarbe and Ribagorza.",
  links: [
    { id: "navarre", how: "split", note: "A vassal county of Pamplona; Ramiro won independence from it after 1035" },
    { id: "franks", how: "context", note: "Began as a Carolingian feudal county centered on Jaca" },
  ],
  cites: [W("Crown_of_Aragon", "Crown of Aragon"), W("Kingdom_of_Aragon", "Kingdom of Aragon"), { t: "Kingdom of Aragon | medieval kingdom, Spain | Britannica", u: "https://www.britannica.com/place/Kingdom-of-Aragon" }],
});

TL.origin("portugal", {
  note: "Portugal grew out of the County of Portugal, a semi-autonomous county of the Kingdom of León. Afonso Henriques was proclaimed king in 1139, recognized by Alfonso VII at Zamora in 1143 and by Pope Alexander III in 1179.",
  links: [
    { id: "asturias-leon", how: "independence", note: "Afonso Henriques broke from León; recognized 1143 (Zamora) and 1179 (papal bull)" },
  ],
  cites: [W("Kingdom_of_Portugal", "Kingdom of Portugal"), W("Kingdom_of_Asturias", "Kingdom of Asturias"), { t: "Portugal - Age of Discovery, Reconquista, Iberian Peninsula | Britannica", u: "https://www.britannica.com/place/Portugal/History" }],
});

TL.origin("kievan-rus", {
  note: "East Slavic tribes (Ilmen Slavs, Poliane) lived in the region first. The Primary Chronicle has the Varangian prince Oleg take Kiev in 882. Norse founders, if any, were soon assimilated into Slavic language and culture.",
  links: [
    { id: "vikings", how: "peoples", note: "Varangian Norse traders and princes, per the Chronicle; quickly assimilated by Slavs" },
  ],
  cites: [W("Kievan_Rus%27", "Kievan Rus'"), { t: "Kyivan Rus | Definition, Map, Vikings, & Origin | Britannica", u: "https://www.britannica.com/topic/Kyivan-Rus" }],
});

TL.origin("muscovy", {
  note: "Moscow, first mentioned in 1147 within Rostov-Suzdal, became a separate principality in 1263 when Daniel, youngest son of Alexander Nevsky, received it as an appanage carved from the Vladimir grand principality, under Golden Horde suzerainty.",
  links: [{ id: "golden-horde", how: "context", note: "Moscow became a principality in 1263 under Golden Horde suzerainty" }],
  cites: [W("Grand_Duchy_of_Moscow", "Grand Duchy of Moscow"), { t: "Grand Principality of Moscow | Ivan I, Ivan III, Muscovy | Britannica", u: "https://www.britannica.com/place/Grand-Principality-of-Moscow" }],
});

TL.origin("vikings", {
  note: "The Vikings were mainly pagans from present-day Denmark, Norway and Sweden who spoke Old Norse, a North Germanic language. Scholars still debate what set off the Viking Age: trade, politics, shipbuilding or other causes.",
  links: [
    { id: "germanic-peoples", how: "peoples", note: "North Germanic peoples are a main branch of the Germanic peoples; Old Norse is North Germanic" },
  ],
  cites: [W("Viking_Age", "Viking Age"), W("North_Germanic_peoples", "North Germanic peoples"), { t: "Viking | History, Exploration, Facts, & Maps | Britannica", u: "https://www.britannica.com/topic/Viking-people" }],
});

TL.origin("dutch-republic", {
  note: "Grew out of the Dutch Revolt against Philip II of Spain, begun in 1568 under William of Orange. Northern provinces allied in the Union of Utrecht (1579), declared independence in the Act of Abjuration (1581) and formalized their confederation in 1588.",
  links: [
    { id: "spain", how: "independence", note: "Provinces abjured Philip II of Spain in 1581; Spain recognized them in 1648" },
  ],
  cites: [W("Dutch_Republic", "Dutch Republic"), { t: "Netherlands - Dutch, Low Countries, Golden Age | Britannica", u: "https://www.britannica.com/place/Netherlands/History" }],
});

TL.origin("polish-lithuanian", {
  note: "The Kingdom of Poland and the Grand Duchy of Lithuania were joined dynastically at Krewo (1385), then became a joint state by the Union of Lublin, effective July 1, 1569; the Duchy kept its own ministries, laws, army and treasury.",
  links: [
    { id: "kingdom-of-poland", how: "merger", note: "The Crown of Poland, tied to Lithuania from 1385, merged into a joint state in 1569" },
    { id: "lithuania", how: "merger", note: "The Grand Duchy federated with Poland at the Union of Lublin in 1569" },
  ],
  cites: [W("Kingdom_of_Poland_(1025%E2%80%931385)", "Kingdom of Poland (1025–1385)"), W("Grand_Duchy_of_Lithuania", "Grand Duchy of Lithuania"), { t: "Lithuania - Baltic Region, Soviet Union, Independence | Britannica", u: "https://www.britannica.com/place/Lithuania/History" }],
});

TL.origin("kingdom-of-ireland", {
  note: "Created by the Crown of Ireland Act (dated 1542; Britannica says the Irish Parliament recognized Henry VIII as king in 1541), in personal union with England. It succeeded the Lordship of Ireland (from 1177), which followed the Anglo-Norman conquests of 1170–1171.",
  links: [
    { id: "england", how: "context", note: "English kings had held Ireland as a lordship; Henry VIII took the title king of Ireland" },
  ],
  cites: [W("Kingdom_of_Ireland", "Kingdom of Ireland"), { t: "Ireland - Medieval, Plantations, Conflict | Britannica", u: "https://www.britannica.com/place/Ireland/The-14th-and-15th-centuries" }],
});

TL.origin("italy", {
  note: "The Kingdom of Italy was proclaimed by the Sardinian Parliament on March 17, 1861, making the Savoy-led Kingdom of Sardinia (Savoy–Piedmont) the legal predecessor of the Kingdom of Italy.",
  links: [
    { id: "savoy-sardinia", how: "successor", note: "Sardinian Parliament proclaimed the Kingdom of Italy on March 17, 1861" },
  ],
  cites: [W("Kingdom_of_Sardinia", "Kingdom of Sardinia"), { t: "Sardinia | Map, History, & Facts | Britannica", u: "https://www.britannica.com/place/Sardinia-historical-kingdom-Italy" }],
});

TL.origin("ecsc", {
  note: "French foreign minister Robert Schuman proposed it on May 9, 1950, to end Franco-German rivalry by pooling coal and steel under a High Authority, making war “materially impossible.” It is seen as the first step of integration after World War II.",
  links: [
    { id: "ww2", how: "context", note: "Schuman aimed to make war between France and Germany unthinkable" },
  ],
  cites: [W("European_Coal_and_Steel_Community", "European Coal and Steel Community"), { t: "European Coal and Steel Community (ECSC) | Britannica", u: "https://www.britannica.com/topic/European-Coal-and-Steel-Community" }],
});

TL.origin("holocaust", {
  note: "Carried out by Nazi Germany and its allies and collaborators from 1933 to 1945. Antisemitism was central to Nazi ideology, which also cast Jews as a racial threat and blamed them for Germany's problems, including its defeat in World War I.",
  links: [
    { id: "nazi-germany", how: "context", note: "Nazi regime's antisemitic, racial ideology drove the persecution and murder" },
  ],
  cites: [{ t: "Introduction to the Holocaust — United States Holocaust Memorial Museum", u: "https://encyclopedia.ushmm.org/content/en/article/introduction-to-the-holocaust" }],
});
