// Predecessor branches (Europe and global): WWI, Germanic peoples, Picts, Dál Riata, Etruscans, Navarre.
const W17 = (p, t) => ({ t: t + " — Wikipedia", u: "https://en.wikipedia.org/wiki/" + p });

TL.add({
  branches: [
    {
      id: "ww1", name: "First World War", region: "global",
      start: 1914.57, end: 1918.86, startWhen: "July 28, 1914", endWhen: "November 11, 1918 (armistice)",
      parents: [], into: [],
      text: "Global war that began when Austria-Hungary declared war on Serbia after the Sarajevo assassination. Germany's invasion of Belgium brought in Britain; Russia left in 1918. It ended with the armistice of November 11, 1918.",
      cites: [W17("World_War_I", "World War I"), { t: "World War I | Causes, Years, Combatants, Casualties, Maps, & Facts | Britannica", u: "https://www.britannica.com/event/World-War-I" }],
    },
    {
      id: "germanic-peoples", name: "Early Germanic peoples", region: "europe",
      start: -500, end: 568, startWhen: "after c. 500 BCE (Jastorf culture, 6th–1st centuries BCE)", endWhen: "568 (Lombards enter Italy, end of the Migration Period)",
      parents: [], into: ["anglo-saxons", "visigoths"],
      text: "Germanic-speaking peoples, identifiable from after 500 BCE; the Franks, Goths, Saxons and Alemanni appear in the record from the 3rd century CE. The Migration Period (375–568) saw groups found kingdoms inside Roman lands.",
      cites: [W17("Germanic_peoples", "Germanic peoples"), { t: "Germanic peoples | Migration, Culture & History | Britannica", u: "https://www.britannica.com/topic/Germanic-peoples" }],
    },
    {
      id: "picts", name: "Picts", region: "europe",
      start: 297, end: 900, startWhen: "297 (first mention of the Picti)", endWhen: "c. 900 (region called Alba, not Pictland)",
      parents: [], into: ["scotland"],
      text: "People of northern Britain, first named Picti in a Latin panegyric of 297. Their kingdom merged with Dál Riata into the Kingdom of Alba under the House of Alpin; by about 900 outsiders called the region Alba.",
      cites: [W17("Picts", "Picts"), { t: "Pict | Celtic Culture, Iron Age & Scotland | Britannica", u: "https://www.britannica.com/topic/Pict" }],
    },
    {
      id: "dal-riata", name: "Dál Riata", region: "europe",
      start: 498, end: 850, startWhen: "c. 498 (said to be founded by Fergus Mór in the 5th century)", endWhen: "c. 850 (merged with Pictland into Alba)",
      parents: [], into: ["scotland"],
      text: "Gaelic kingdom of western Scotland, said to have been founded by Fergus Mór. Viking raids from 795 weakened it; Cináed mac Ailpín, king of the Picts c. 843, led the merger of Dál Riata and Pictland into Alba.",
      cites: [W17("D%C3%A1l_Riata", "Dál Riata"), { t: "Dalriada | Celtic, Scotland & Ulster | Britannica", u: "https://www.britannica.com/place/Dalriada" }],
    },
    {
      id: "etruscans", name: "Etruscan civilization", region: "europe",
      start: -900, end: -27, startWhen: "c. 900 BCE (earliest identifiably Etruscan culture)", endWhen: "27 BCE (last Etruscan cities absorbed by Rome)",
      parents: [], into: ["roman-empire"],
      text: "Iron Age civilization of central Italy, identifiable from about 900 BCE. From the late 4th century BCE it succumbed to Rome in the Roman–Etruscan Wars; its people received Roman citizenship in 90 BCE.",
      cites: [W17("Etruscan_civilization", "Etruscan civilization"), { t: "Etruscan | History, Art & Religion | Britannica", u: "https://www.britannica.com/topic/Etruscan" }],
    },
    {
      id: "navarre", name: "Kingdom of Pamplona / Navarre", region: "europe",
      start: 824, end: 1620, startWhen: "824 (traditionally; Britannica dates Íñigo Arista's independent rule from c. 798)", endWhen: "1620 (northern Navarre merged into France; Britannica gives 1589)",
      parents: [], into: ["france"],
      text: "Traditionally dated from 824, when Íñigo Arista was made ruler around Pamplona, opposing Frankish expansion. Sancho III's realm split in 1035; Ferdinand II of Aragon conquered the south in 1512, and the north merged into France in 1620.",
      cites: [W17("Kingdom_of_Pamplona", "Kingdom of Navarre"), W17("Kingdom_of_Navarre", "Kingdom of Navarre"), { t: "Kingdom of Navarre | Facts & History | Britannica", u: "https://www.britannica.com/place/Kingdom-of-Navarre" }],
    },
  ],
  events: [
    { id: "p17a-marne-1914", branch: "ww1", y: 1914.68, end: 1914.7, when: "September 5–12, 1914", imp: 2,
      title: "First Battle of the Marne halts Germany's advance",
      text: "French and British forces stopped the German advance on Paris along the Marne. The Schlieffen Plan failed, and the Germans fell back to the Aisne River.",
      cites: [W17("First_Battle_of_the_Marne", "First Battle of the Marne")] },
    { id: "p17a-verdun-1916", branch: "ww1", y: 1916.14, end: 1916.96, when: "February 21 – December 18, 1916", imp: 2,
      title: "Battle of Verdun",
      text: "A 302-day German offensive against French positions on the Meuse. The Germans did not take Verdun, and French counter-offensives later in 1916 recovered much ground.",
      cites: [W17("Battle_of_Verdun", "Battle of Verdun")] },
    { id: "p17a-cimbrian-war", branch: "germanic-peoples", y: -113, end: -101, when: "113–101 BCE", imp: 2,
      title: "Cimbrian War with Rome",
      text: "Cimbri, Teutones and Ambrones migrated south late in the 2nd century BCE and won several battles against Rome before being defeated; Caesar later classed them as Germanic.",
      cites: [W17("Germanic_peoples", "Germanic peoples")] },
    { id: "p17a-germania", branch: "germanic-peoples", y: 98, when: "c. 98 CE", imp: 2,
      title: "Tacitus writes the Germania",
      text: "Tacitus's Germania, dated to c. 98 CE, describes the Germani. Caesar, writing around 55 BCE, was the first author to treat them as a category distinct from Gauls and Scythians.",
      cites: [W17("Germanic_peoples", "Germanic peoples")] },
    { id: "p17a-picti-297", branch: "picts", y: 297, when: "297", imp: 2,
      title: "The Picti first named",
      text: "The Latin word Picti first appears in a panegyric of 297.",
      cites: [W17("Picts", "Picts")] },
    { id: "p17a-dun-nechtain", branch: "picts", y: 685, when: "685", imp: 2,
      title: "Battle of Dun Nechtain",
      text: "Bridei mac Beli defeated the Anglians, halting their expansion north.",
      cites: [W17("Picts", "Picts")] },
    { id: "p17a-degsastan", branch: "dal-riata", y: 603, when: "c. 603", imp: 2, link: "anglo-saxons",
      title: "Áedán mac Gabráin defeated at Degsastan",
      text: "The Dál Riata king Áedán was defeated by the Bernician king Æthelfrith; Áedán died c. 608.",
      cites: [W17("D%C3%A1l_Riata", "Dál Riata")] },
    { id: "p17a-viking-raids-dal-riata", branch: "dal-riata", y: 795, when: "795", imp: 2,
      title: "Viking raids begin on Dál Riata",
      text: "Viking raids began in 795. Pictish forces were defeated by Vikings in 839, and a Viking conquest of the Inner Hebrides may be recorded in 847.",
      cites: [W17("D%C3%A1l_Riata", "Dál Riata")] },
    { id: "p17a-etruscan-start", branch: "etruscans", y: -900, when: "c. 900 BCE", imp: 2,
      title: "Earliest identifiably Etruscan culture",
      text: "The earliest evidence of an identifiably Etruscan culture dates from about 900 BCE, in the Iron Age Villanovan culture.",
      cites: [W17("Etruscan_civilization", "Etruscan civilization")] },
    { id: "p17a-etruscan-citizenship", branch: "etruscans", y: -90, when: "90 BCE", imp: 2, link: "roman-republic",
      title: "Etruscans granted Roman citizenship",
      text: "Etruscans were granted Roman citizenship in 90 BCE; by 27 BCE their whole territory was incorporated into the Roman Empire.",
      cites: [W17("Etruscan_civilization", "Etruscan civilization")] },
    { id: "p17a-pamplona-824", branch: "navarre", y: 824, when: "824 (traditionally)", imp: 2, link: "franks",
      title: "Íñigo Arista made ruler of Pamplona",
      text: "Íñigo Arista was elected or declared ruler around Pamplona in opposition to Frankish expansion, at first as a vassal of the Córdoba emirate.",
      cites: [W17("Kingdom_of_Pamplona", "Kingdom of Navarre")] },
    { id: "p17a-sancho-iii-1035", branch: "navarre", y: 1035, when: "1035", imp: 2, link: "aragon",
      title: "Sancho III dies; his realm is divided",
      text: "At the death of Sancho III the Great, lands in Aragon went to his son Ramiro; after Gonzalo's death Ramiro gained Sobrarbe and Ribagorza, forming the Kingdom of Aragon.",
      cites: [W17("Kingdom_of_Pamplona", "Kingdom of Navarre"), W17("Kingdom_of_Aragon", "Kingdom of Aragon")] },
    { id: "p17a-navarre-1512", branch: "navarre", y: 1512, when: "1512", imp: 2, link: "aragon",
      title: "Ferdinand II conquers southern Navarre",
      text: "Ferdinand II of Aragon conquered the southern part in 1512; it was annexed in 1524 and, in 1515, joined Castile as a separate kingdom.",
      cites: [W17("Kingdom_of_Pamplona", "Kingdom of Navarre")] },
  ],
});

TL.geo("ww1", { scope: "global" });
TL.geo("germanic-peoples", { scope: "region", lat: 53.5, lon: 10.0, r: 900, label: "Germania (northern Europe)", src: "https://en.wikipedia.org/wiki/Germania" });
TL.geo("picts", { scope: "region", lat: 57.0, lon: -4.0, r: 250, label: "Pictland, Scotland", src: "https://en.wikipedia.org/wiki/Scotland" });
TL.geo("dal-riata", { scope: "region", lat: 56.1, lon: -5.5, r: 150, label: "Argyll, Scotland", src: "https://en.wikipedia.org/wiki/Argyll_and_Bute" });
TL.geo("etruscans", { scope: "region", lat: 43.45, lon: 11.2, r: 250, label: "Etruria (Tuscany)", src: "https://en.wikipedia.org/wiki/Tuscany" });
TL.geo("navarre", { scope: "region", lat: 42.82, lon: -1.64, r: 150, label: "Pamplona, Spain", src: "https://en.wikipedia.org/wiki/Pamplona" });
TL.geo("p17a-marne-1914", { scope: "place", lat: 48.95, lon: 3.4, r: 60, label: "Marne River, France", src: "https://en.wikipedia.org/wiki/First_Battle_of_the_Marne" });
TL.geo("p17a-verdun-1916", { scope: "place", lat: 49.16, lon: 5.38, r: 40, label: "Verdun, France", src: "https://en.wikipedia.org/wiki/Verdun" });
TL.geo("p17a-cimbrian-war", { scope: "region", lat: 45.0, lon: 6.0, r: 800, label: "Gaul and northern Italy", src: "https://en.wikipedia.org/wiki/Gaul" });
TL.geo("p17a-germania", { scope: "region", lat: 53.5, lon: 10.0, r: 900, label: "Germania", src: "https://en.wikipedia.org/wiki/Germania" });
TL.geo("p17a-picti-297", { scope: "region", lat: 57.0, lon: -4.0, r: 250, label: "Pictland, Scotland", src: "https://en.wikipedia.org/wiki/Scotland" });
TL.geo("p17a-dun-nechtain", { scope: "region", lat: 57.0, lon: -4.0, r: 250, label: "Pictland, Scotland", src: "https://en.wikipedia.org/wiki/Scotland" });
TL.geo("p17a-degsastan", { scope: "region", lat: 57, lon: -4, r: 150, label: "Southern Scotland", src: "https://en.wikipedia.org/wiki/Scotland" });
TL.geo("p17a-viking-raids-dal-riata", { scope: "region", lat: 56.1, lon: -5.5, r: 150, label: "Argyll, Scotland", src: "https://en.wikipedia.org/wiki/Argyll_and_Bute" });
TL.geo("p17a-etruscan-start", { scope: "region", lat: 43.45, lon: 11.2, r: 250, label: "Etruria (Tuscany)", src: "https://en.wikipedia.org/wiki/Tuscany" });
TL.geo("p17a-etruscan-citizenship", { scope: "region", lat: 43.45, lon: 11.2, r: 250, label: "Etruria (Tuscany)", src: "https://en.wikipedia.org/wiki/Tuscany" });
TL.geo("p17a-pamplona-824", { scope: "place", lat: 42.82, lon: -1.64, r: 50, label: "Pamplona, Spain", src: "https://en.wikipedia.org/wiki/Pamplona" });
TL.geo("p17a-sancho-iii-1035", { scope: "region", lat: 42.82, lon: -1.65, r: 150, label: "Pyrenees, Navarre and Aragon", src: "https://en.wikipedia.org/wiki/Pamplona" });
TL.geo("p17a-navarre-1512", { scope: "region", lat: 42.82, lon: -1.65, r: 150, label: "Navarre, Spain", src: "https://en.wikipedia.org/wiki/Pamplona" });

// Origins of the new branches
TL.origin("ww1", {
  note: "Austria-Hungary blamed Serbia for the June 28, 1914 assassination of Franz Ferdinand at Sarajevo and declared war on July 28, 1914, which began the war. Germany declared war on Russia and France; its invasion of Belgium brought in Britain.",
  links: [
    { id: "austria-hungary", how: "context", note: "Declared war on Serbia July 28, 1914 after the Sarajevo assassination of its heir" },
  ],
  cites: [W17("World_War_I", "World War I"), { t: "World War I | Causes, Years, Combatants, Casualties, Maps, & Facts | Britannica", u: "https://www.britannica.com/event/World-War-I" }],
});
TL.origin("germanic-peoples", {
  note: "Archaeologists link the earliest identifiable Germanic speakers to the Jastorf culture (6th–1st centuries BCE); the Nordic Bronze Age shows cultural and population continuity with later Germanic peoples. Whether they shared a common identity is disputed.",
  links: [],
  cites: [W17("Germanic_peoples", "Germanic peoples"), { t: "Germanic peoples | Migration, Culture & History | Britannica", u: "https://www.britannica.com/topic/Germanic-peoples" }],
});
TL.origin("picts", {
  note: "The Latin word Picti first appears in 297. Who the Picts were before then is not given in the source used here, so no earlier branch is shown.",
  links: [],
  cites: [W17("Picts", "Picts"), { t: "Pict | Celtic Culture, Iron Age & Scotland | Britannica", u: "https://www.britannica.com/topic/Pict" }],
});
TL.origin("dal-riata", {
  note: "The kingdom is said to have been founded by Fergus Mór in the 5th century. Nothing the source says ties it to an earlier branch on this timeline.",
  links: [],
  cites: [W17("D%C3%A1l_Riata", "Dál Riata"), { t: "Dalriada | Celtic, Scotland & Ulster | Britannica", u: "https://www.britannica.com/place/Dalriada" }],
});
TL.origin("etruscans", {
  note: "The earliest evidence of an identifiably Etruscan culture dates from about 900 BCE, in the Iron Age Villanovan culture. The source used here does not say who came before.",
  links: [],
  cites: [W17("Etruscan_civilization", "Etruscan civilization"), { t: "Etruscan | History, Art & Religion | Britannica", u: "https://www.britannica.com/topic/Etruscan" }],
});
TL.origin("navarre", {
  note: "The kingdom emerged from conflict between the Carolingian Empire and the Umayyad Emirate of Córdoba. Íñigo Arista was made ruler of Pamplona in 824 (Britannica: c. 798) in opposition to Frankish expansion, though he accepted Frankish suzerainty for a time.",
  links: [
    { id: "franks", how: "reaction", note: "Íñigo Arista rose in 824 against Frankish expansion into the Pamplona area" },
  ],
  cites: [W17("Kingdom_of_Pamplona", "Kingdom of Navarre"), W17("Kingdom_of_Navarre", "Kingdom of Navarre"), { t: "Kingdom of Navarre | Facts & History | Britannica", u: "https://www.britannica.com/place/Kingdom-of-Navarre" }],
});

// anglo-saxons and visigoths had no TL.origin yet
TL.origin("anglo-saxons", {
  note: "The Anglo-Saxons traced their origins to Germanic settlers; Bede names Angles, Saxons and Jutes from Germania. Their culture was not simply transplanted but developed in Britain, and a 2022 genetic study found large-scale immigration into eastern England.",
  links: [
    { id: "germanic-peoples", how: "peoples", note: "Descended from Germanic settlers: Angles, Saxons and Jutes, per Bede" },
  ],
  cites: [W17("Anglo-Saxons", "Anglo-Saxons"), { t: "Anglo-Saxon | Definition, History, Language, Countries, Culture, & Facts | Britannica", u: "https://www.britannica.com/topic/Anglo-Saxon" }],
});
TL.origin("visigoths", {
  note: "The Visigoths were a Gothic people who emerged in the Balkans in late antiquity and spoke an eastern Germanic language distinct by the 4th century. They won at Adrianople in 378 and sacked Rome in 410.",
  links: [
    { id: "germanic-peoples", how: "peoples", note: "A Germanic people of late antiquity speaking an East Germanic language" },
  ],
  cites: [W17("Visigoths", "Visigoths"), { t: "Visigoth | History, Culture & Legacy | Britannica", u: "https://www.britannica.com/topic/Visigoth" }],
});

TL.origin("franks", {
  note: "The Franks began in the 3rd century as a group of Germanic tribes near the Lower Rhine, such as the Bructeri and Chattuari, who had long lived across the river under Roman hegemony; they later took over much of Roman Gaul as Roman rule broke down.",
  links: [
    { id: "germanic-peoples", how: "peoples", note: "Germanic tribes of the Lower Rhine came to be called Franks in the 3rd century" },
    { id: "western-roman", how: "successor", note: "Took over northern Gaul as Roman administration broke down in the 5th century" },
  ],
  cites: [{ t: "Franks - Wikipedia", u: "https://en.wikipedia.org/wiki/Franks" }, { t: "Frank | People, Definition, & Maps | Britannica", u: "https://www.britannica.com/topic/Frank-people" }],
});

TL.origin("kingdom-of-poland", {
  note: "Grew out of Civitas Schinesghe, the 10th-century Duchy of Poland centered on Gniezno and ruled by the Piast dynasty, considered the predecessor of the kingdom formally established in 1025.",
  links: [],
  cites: [{ t: "Civitas Schinesghe - Wikipedia", u: "https://en.wikipedia.org/wiki/Civitas_Schinesghe" }, { t: "Poland - Medieval, Unification, Partitions | Britannica", u: "https://www.britannica.com/place/Poland/History" }],
});
TL.origin("lithuania", {
  note: "Founded by the Lithuanians, then a polytheistic union of Baltic tribes from Aukštaitija; Mindaugas was crowned king in 1253. The grand duchy later expanded over large parts of the former Kievan Rus'.",
  links: [{ id: "kievan-rus", how: "conquest", note: "Expanded to include large portions of the former Kievan Rus'" }],
  cites: [{ t: "Grand Duchy of Lithuania - Wikipedia", u: "https://en.wikipedia.org/wiki/Grand_Duchy_of_Lithuania" }, { t: "Lithuania - Baltic Region, Soviet Union, Independence | Britannica", u: "https://www.britannica.com/place/Lithuania/History" }],
});
TL.origin("savoy-sardinia", {
  note: "The Kingdom of Sardinia was part of the Aragonese and then Spanish crowns from 1324. In 1720 it was ceded to Victor Amadeus II, Duke of Savoy, who united it with Savoy's mainland possessions in Piedmont.",
  links: [
    { id: "spain", how: "split", note: "Ceded by the Spanish throne's claimants to the Duke of Savoy in 1720" },
    { id: "aragon", how: "context", note: "Part of the Crown of Aragon from 1324" },
  ],
  cites: [{ t: "Kingdom of Sardinia - Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Sardinia" }, { t: "Sardinia | Map, History, & Facts | Britannica", u: "https://www.britannica.com/place/Sardinia-historical-kingdom-Italy" }],
});
