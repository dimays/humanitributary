// Predecessor branches for East/Southeast Asia and Central Asia: Funan, Chenla, Singhasari, Gojoseon, the Yuezhi.
const W = (s, t) => ({ t: t + " - Wikipedia", u: "https://en.wikipedia.org/wiki/" + s });
TL.add({ branches: [
  { id: "funan", name: "Funan", region: "eastasia", start: 50, end: 627,
    startWhen: "c. 1st century CE (Chinese sources; archaeology suggests settlement from the 4th century BCE)", endWhen: "c. 550–627 (Chenla's secession and conquest; debated)",
    parents: [], into: ["chenla"],
    text: "Loose network of Indianized trading states in the Mekong Delta, centered on Oc Eo and Angkor Borei. It was known mostly through Chinese sources and was later absorbed by its former vassal Chenla.",
    cites: [W("Funan", "Funan"), { t: "Funan | Cambodia, Map, & Facts | Britannica", u: "https://www.britannica.com/place/Funan" }] },
  { id: "chenla", name: "Chenla", region: "eastasia", start: 550, end: 802,
    startWhen: "c. 550 (Chenla secession from Funan)", endWhen: "802 (Jayavarman II proclaims the Khmer Empire)",
    parents: ["funan"], into: ["khmer"],
    text: "Chinese name for the Pre-Angkor Khmer polity, a vassal that broke from Funan and absorbed its lands. Historians doubt it was one kingdom; it split into Land and Water Chenla c. 707.",
    cites: [W("Chenla", "Chenla"), { t: "Chenla | ancient state, Indochina | Britannica", u: "https://www.britannica.com/place/Chenla" }] },
  { id: "singhasari", name: "Singhasari", region: "eastasia", start: 1222, end: 1292,
    startWhen: "1222", endWhen: "1292 (Kertanegara killed by Jayakatwang of Kediri)",
    parents: [], into: ["majapahit"],
    text: "East Javanese kingdom founded by Ken Arok, centered near modern Malang. Under Kertanegara it sent the Pamalayu expedition toward Srivijaya's former lands and refused Kublai Khan's demands.",
    cites: [W("Singhasari", "Singhasari"), { t: "Singhasari | Javanese Empire, Majapahit, East Java | Britannica", u: "https://www.britannica.com/place/Singhasari" }] },
  { id: "gojoseon", name: "Gojoseon", region: "eastasia", start: -400, end: -108,
    startWhen: "By the 4th century BCE in Chinese texts (the traditional 2333 BCE founding by Dangun is legendary)", endWhen: "108 BCE (fell to Han China)",
    parents: [], into: ["korea-three-kingdoms"],
    text: "Old Joseon, an early Korean polity. Chinese texts of the 7th–4th centuries BCE mention it; it fought Yan, fell to Han in 108 BCE, and successors such as Buyeo and the Samhan gave rise to the Three Kingdoms.",
    cites: [W("Gojoseon", "Gojoseon"), { t: "Chosŏn | ancient state, Korea | Britannica", u: "https://www.britannica.com/place/Choson" }] },
  { id: "yuezhi", name: "Yuezhi", region: "eastasia", start: -300, end: 30,
    startWhen: "c. 3rd century BCE (Chinese texts may mention them earlier)", endWhen: "c. 30 CE (Kushan dominance)",
    parents: [], into: ["kushan"],
    text: "Nomadic people first recorded in China's jade and horse trade. Defeated by the Xiongnu c. 176 BCE, the Greater Yuezhi moved west to Bactria, where one tribe, the Kushans, later founded an empire.",
    cites: [W("Yuezhi", "Yuezhi"), { t: "Yuezhi | Central Asia, Nomads, Migration | Britannica", u: "https://www.britannica.com/topic/Yuezhi" }] },
], events: [
  { id: "p17d-funan-fan-shiman", branch: "funan", y: 230, when: "3rd century CE",
    title: "Fan Shiman raises Funan to its peak",
    text: "Chinese sources describe Fan Shiman as Funan's most powerful ruler; he expanded its navy and sent embassies to China and India.",
    imp: 2, cites: [W("Funan", "Funan")] },
  { id: "p17d-funan-chenla-conquest", branch: "funan", y: 627, when: "c. 627–649 CE",
    title: "Chenla absorbs Funan",
    text: "Chenla, once a vassal, gained independence and took over Funan; the New Book of Tang places the annexation in the early Zhenguan era (627–649). Some scholars see a shift of power to inland Khmer rulers.",
    imp: 2, link: "chenla", cites: [W("Funan", "Funan"), W("Chenla", "Chenla")] },
  { id: "p17d-chenla-isanapura", branch: "chenla", y: 616, when: "c. 616–635 CE",
    title: "Isanavarman I founds Isanapura",
    text: "Isanavarman I absorbed former Funan territory and founded Isanapura, the site of Sambor Prei Kuk north of the Tonle Sap.",
    imp: 2, cites: [W("Chenla", "Chenla")] },
  { id: "p17d-chenla-split", branch: "chenla", y: 707, when: "c. 707 CE",
    title: "Chenla divides into Land and Water",
    text: "Tang histories say Chenla split into inland Land Chenla and Water Chenla; some historians consider the division misleading. Land Chenla later produced the Khmer Empire.",
    imp: 2, cites: [W("Chenla", "Chenla")] },
  { id: "p17d-singhasari-founded", branch: "singhasari", y: 1222, when: "1222",
    title: "Ken Arok founds Singhasari",
    text: "Ken Arok founded the kingdom, also called Tumapel, and began the Rajasa dynasty.",
    imp: 2, cites: [W("Singhasari", "Singhasari")] },
  { id: "p17d-singhasari-kertanegara-killed", branch: "singhasari", y: 1292, when: "1292",
    title: "Kertanegara killed; Singhasari falls",
    text: "Jayakatwang of Kediri attacked from two sides and sacked the capital, killing King Kertanegara. His son-in-law Raden Wijaya later founded Majapahit.",
    imp: 2, link: "majapahit", cites: [W("Singhasari", "Singhasari")] },
  { id: "p17d-gojoseon-wiman", branch: "gojoseon", y: -194, when: "194 BCE",
    title: "Wiman seizes the throne",
    text: "Wiman, a refugee from the Yan region, overthrew King Jun and founded Wiman Joseon; Jun fled south to the state of Jin.",
    imp: 2, cites: [W("Gojoseon", "Gojoseon")] },
  { id: "p17d-gojoseon-fall", branch: "gojoseon", y: -108, when: "108 BCE",
    title: "Han conquers Gojoseon",
    text: "After a dispute over diplomatic passage, Emperor Wu of Han attacked by land and sea; Wanggeom fell in 108 BCE and Han set up the Four Commanderies in the west.",
    imp: 2, link: "han", cites: [W("Gojoseon", "Gojoseon")] },
  { id: "p17d-yuezhi-defeat", branch: "yuezhi", y: -176, when: "c. 176 BCE",
    title: "Xiongnu crush the Yuezhi",
    text: "The Xiongnu inflicted a crushing defeat, and the Yuezhi king was killed; Modu's 174 BCE letter boasts of it. The Greater Yuezhi then migrated west.",
    imp: 2, link: "xiongnu", cites: [W("Yuezhi", "Yuezhi")] },
  { id: "p17d-yuezhi-bactria", branch: "yuezhi", y: -132, when: "132 BCE",
    title: "Yuezhi driven into Bactria",
    text: "Driven out of the Ili valley by the Wusun, the Greater Yuezhi moved through Ferghana to northern Bactria. The Book of Han later lists five Yuezhi tribes there, including the Guishuang.",
    imp: 2, cites: [W("Yuezhi", "Yuezhi")] },
] });

TL.geo("funan", { scope: "region", lat: 10.23, lon: 105.15, r: 500, label: "Funan (Mekong Delta)", src: "https://en.wikipedia.org/wiki/Oc_Eo" });
TL.geo("chenla", { scope: "region", lat: 12.87, lon: 105.04, r: 500, label: "Chenla (Sambor Prei Kuk)", src: "https://en.wikipedia.org/wiki/Sambor_Prei_Kuk" });
TL.geo("singhasari", { scope: "region", lat: -7.98, lon: 112.62, r: 250, label: "Singhasari (East Java)", src: "https://en.wikipedia.org/wiki/Malang" });
TL.geo("gojoseon", { scope: "region", lat: 39.02, lon: 125.75, r: 600, label: "Gojoseon (northwestern Korea and Liaodong)", src: "https://en.wikipedia.org/wiki/Pyongyang" });
TL.geo("yuezhi", { scope: "region", lat: 40.14, lon: 94.66, r: 700, label: "Yuezhi homeland (western Gansu)", src: "https://en.wikipedia.org/wiki/Dunhuang" });
TL.geo("p17d-funan-fan-shiman", { scope: "place", lat: 10.23, lon: 105.15, r: 100, label: "Oc Eo", src: "https://en.wikipedia.org/wiki/Oc_Eo" });
TL.geo("p17d-funan-chenla-conquest", { scope: "region", lat: 12.5, lon: 105, r: 400, label: "Funan and Chenla (Cambodia and Mekong Delta)", src: "https://en.wikipedia.org/wiki/Cambodia" });
TL.geo("p17d-chenla-isanapura", { scope: "place", lat: 12.87, lon: 105.04, r: 60, label: "Sambor Prei Kuk", src: "https://en.wikipedia.org/wiki/Sambor_Prei_Kuk" });
TL.geo("p17d-chenla-split", { scope: "region", lat: 12.5, lon: 105, r: 400, label: "Chenla (Cambodia)", src: "https://en.wikipedia.org/wiki/Cambodia" });
TL.geo("p17d-singhasari-founded", { scope: "place", lat: -7.98, lon: 112.62, r: 60, label: "Malang, East Java", src: "https://en.wikipedia.org/wiki/Malang" });
TL.geo("p17d-singhasari-kertanegara-killed", { scope: "place", lat: -7.98, lon: 112.62, r: 60, label: "Malang, East Java", src: "https://en.wikipedia.org/wiki/Malang" });
TL.geo("p17d-gojoseon-wiman", { scope: "region", lat: 39.02, lon: 125.75, r: 500, label: "Gojoseon (northwestern Korea)", src: "https://en.wikipedia.org/wiki/Pyongyang" });
TL.geo("p17d-gojoseon-fall", { scope: "region", lat: 39.02, lon: 125.75, r: 500, label: "Gojoseon (northwestern Korea)", src: "https://en.wikipedia.org/wiki/Pyongyang" });
TL.geo("p17d-yuezhi-defeat", { scope: "region", lat: 40.14, lon: 94.66, r: 700, label: "Western Gansu", src: "https://en.wikipedia.org/wiki/Dunhuang" });
TL.geo("p17d-yuezhi-bactria", { scope: "region", lat: 36.76, lon: 66.9, r: 600, label: "Bactria", src: "https://en.wikipedia.org/wiki/Balkh" });

TL.origin("funan", {
  note: "Chinese sources place Funan's founding in the 1st century CE; archaeology suggests settlement in the Mekong Delta from the 4th century BCE. Its legend tells of a foreigner, Hun Tian, who married the local queen Liuye.",
  links: [],
  cites: [W("Funan", "Funan"), { t: "Funan | Cambodia, Map, & Facts | Britannica", u: "https://www.britannica.com/place/Funan" }],
});
TL.origin("chenla", {
  note: "Chenla began as a vassal of Funan, gained independence, and by the 7th century took over Funan's territory. Chinese records name Bhavavarman and Mahendravarman (Citrasena) as the attackers.",
  links: [
    { id: "funan", how: "conquest", note: "Former vassal Chenla gained independence and annexed Funan in the 7th century" },
  ],
  cites: [W("Chenla", "Chenla"), W("Funan", "Funan"), { t: "Chenla | ancient state, Indochina | Britannica", u: "https://www.britannica.com/place/Chenla" }],
});
TL.origin("singhasari", {
  note: "Founded in 1222 by Ken Arok, who began the Rajasa dynasty at Tumapel in East Java. The infobox ties the founding to the Battle of Genter (1222).",
  links: [],
  cites: [W("Singhasari", "Singhasari"), { t: "Singhasari | Javanese Empire, Majapahit, East Java | Britannica", u: "https://www.britannica.com/place/Singhasari" }],
});
TL.origin("gojoseon", {
  note: "Tradition dates Gojoseon to 2333 BCE under Dangun, a mythological figure. Historical mentions begin in Chinese texts of the 7th–4th centuries BCE, with Bronze Age mandolin-shaped daggers and dolmens in the region.",
  links: [],
  cites: [W("Gojoseon", "Gojoseon"), { t: "Chosŏn | ancient state, Korea | Britannica", u: "https://www.britannica.com/place/Choson" }],
});
TL.origin("yuezhi", {
  note: "Early Chinese texts such as the Guanzi mention the Yuezhi supplying jade to China. The Book of Han places them between Dunhuang and Qilian in western Gansu; the homeland is debated.",
  links: [],
  cites: [W("Yuezhi", "Yuezhi"), { t: "Yuezhi | Central Asia, Nomads, Migration | Britannica", u: "https://www.britannica.com/topic/Yuezhi" }],
});
