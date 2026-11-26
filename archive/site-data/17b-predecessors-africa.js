// Predecessor branches (Africa and Belgium): Belgium, Dʿmt, Ife, Tichitt tradition, Denkyira. Every cite was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });

TL.add({
  branches: [
    {
      id: "belgium", name: "Belgium", region: "europe",
      start: 1830.76, end: null, startWhen: "October 4, 1830 (independence declared)", endWhen: "",
      parents: [], into: [],
      text: "Kingdom that broke from the United Kingdom of the Netherlands in the 1830 revolution; Leopold I took the throne on July 21, 1831, and independence was recognized by the Treaty of London in 1839.",
      cites: [W("Belgium", "Belgium"), { t: "History of Belgium | Flag, Map, & Summary | Britannica", u: "https://www.britannica.com/topic/history-of-Belgium" }],
    },
    {
      id: "dmt", name: "Dʿmt", region: "africa",
      start: -980, end: -400, startWhen: "c. 980 BCE (other dates give c. 800/700 BCE)", endWhen: "c. 400 BCE",
      parents: [], into: ["aksum"],
      text: "Kingdom of Eritrea and the Tigray plateau, with South Arabian influence; Yeha may have been its capital. Aksum emerged from it, though scholars debate whether it evolved into Aksum or was absorbed.",
      cites: [W("D%CA%BFmt", "Dʿmt"), W("Kingdom_of_Aksum", "Kingdom of Aksum"), { t: "Yeha in the Ethiopian Highlands | Anthropology | Research Starters | EBSCOhost", u: "https://www.ebsco.com/research-starters/anthropology/yeha-ethiopian-highlands/" }],
    },
    {
      id: "ife", name: "Ife (Ile-Ife)", region: "africa",
      start: -1000, end: null, startWhen: "founded between 1000 BCE and 500 BCE (Oduduwa's dynasty c. 11th century CE)", endWhen: "",
      parents: [], into: [],
      text: "Yoruba city-state in southwestern Nigeria, the traditional seat of Oduduwa's dynasty. Its naturalistic bronze, stone and terracotta sculpture dates to about 1200–1400 CE; the Ooni of Ife still rules there.",
      cites: [W("Ife", "Ife"), { t: "Ile-Ife | Meaning, Artifacts, Culture, & Map | Britannica", u: "https://www.britannica.com/place/Ile-Ife" }],
    },
    {
      id: "tichitt", name: "Tichitt tradition", region: "africa",
      start: -2000, end: -300, startWhen: "c. 2000 BCE (phase chronology begins c. 2600 BCE; contested)", endWhen: "c. 300 BCE",
      parents: [], into: ["ghana-empire"],
      text: "Farming and herding settlements on the sandstone cliffs of Dhar Tichitt in Mauritania. Its people are thought to be ancestors of the Soninke, who later formed the Ghana Empire.",
      cites: [W("Dhar_Tichitt", "Dhar Tichitt"), { t: "The Tichitt tradition in the West African Sahel (Chapter 19) - The Cambridge World History", u: "https://www.cambridge.org/core/books/abs/cambridge-world-history/tichitt-tradition-in-the-west-african-sahel/FA8A6F2725008517F6ABD93007B96405" }],
    },
    {
      id: "denkyira", name: "Denkyira", region: "africa",
      start: 1600, end: 1701, startWhen: "early 1600s (rise as an inland Akan power)", endWhen: "1701 (as an empire)",
      parents: [], into: ["ashanti"],
      text: "Akan kingdom that rose in the early 1600s, once subordinate to Adanse and later overlord of Kwaaman. It was routed at Feyiase in 1701 by Osei Tutu's forces and became a tributary of Asante.",
      cites: [W("Kingdom_of_Denkyira", "Kingdom of Denkyira"), { t: "Denkyera | Ashanti Empire, Gold Coast, Ghana | Britannica", u: "https://www.britannica.com/place/Denkyera" }],
    },
  ],
  events: [
    { id: "p17b-belgian-independence", branch: "belgium", y: 1830.76, when: "October 4, 1830", title: "Belgium declares independence", text: "After the 1830 revolution Belgium declared its independence from the United Kingdom of the Netherlands; Leopold I was installed as king on July 21, 1831.", imp: 2, cites: [W("Belgium", "Belgium")] },
    { id: "p17b-dmt-king-wrn-hywt", branch: "dmt", y: -700, end: -650, when: "c. 700–650 BCE", title: "Reign of Wʿrn Ḥywt", text: "Wʿrn Ḥywt, the earliest of four known Dʿmt rulers, is dated to about 700–650 BCE; Yeha, with its large temple complex, may have been the capital.", imp: 2, cites: [W("D%CA%BFmt", "Dʿmt")] },
    { id: "p17b-ife-sculpture", branch: "ife", y: 1200, end: 1400, when: "c. 1200–1400 CE", title: "Ife's classical sculpture", text: "Ife artists produced bronze, stone and terracotta works, with a refined naturalistic style developing around 1300; production declined after this period.", imp: 2, cites: [W("Ife", "Ife")] },
    { id: "p17b-tichitt-settlements", branch: "tichitt", y: -1400, end: -300, when: "c. 1400–300 BCE", title: "Plateau settlements built at Dhar Tichitt", text: "Stone-walled settlements were constructed on the Tichitt escarpment between about 1400 and 300 BCE.", imp: 2, cites: [W("Dhar_Tichitt", "Dhar Tichitt")] },
    { id: "p17b-feyiase", branch: "denkyira", y: 1701, when: "1701", title: "Denkyira routed at Feyiase", text: "At Feyiase Denkyira's forces were routed and its king Ntim Gyakari was killed; Asante then sacked Abankeseso and Denkyira became a tributary.", imp: 2, link: "ashanti", cites: [W("Kingdom_of_Denkyira", "Kingdom of Denkyira")] },
  ],
});
TL.geo("belgium", { scope: "region", lat: 50.83, lon: 4.0, r: 150, label: "Belgium", src: "https://en.wikipedia.org/wiki/Belgium" });
TL.geo("dmt", { scope: "region", lat: 14.29, lon: 39.02, r: 250, label: "Eritrea and Tigray (Yeha)", src: "https://en.wikipedia.org/wiki/Yeha" });
TL.geo("ife", { scope: "place", lat: 7.48, lon: 4.56, r: 60, label: "Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("tichitt", { scope: "region", lat: 18.45, lon: -9.41, r: 400, label: "Dhar Tichitt, Mauritania", src: "https://en.wikipedia.org/wiki/Dhar_Tichitt" });
TL.geo("denkyira", { scope: "region", lat: 5.97, lon: -1.78, r: 120, label: "Denkyira, Ghana", src: "https://en.wikipedia.org/wiki/Dunkwa-On-Offin" });
TL.geo("p17b-belgian-independence", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("p17b-dmt-king-wrn-hywt", { scope: "place", lat: 14.29, lon: 39.02, r: 40, label: "Yeha, Ethiopia", src: "https://en.wikipedia.org/wiki/Yeha" });
TL.geo("p17b-ife-sculpture", { scope: "place", lat: 7.48, lon: 4.56, r: 40, label: "Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("p17b-tichitt-settlements", { scope: "place", lat: 18.45, lon: -9.41, r: 60, label: "Dhar Tichitt, Mauritania", src: "https://en.wikipedia.org/wiki/Dhar_Tichitt" });
TL.geo("p17b-feyiase", { scope: "region", lat: 5.97, lon: -1.78, r: 80, label: "Denkyira, Ghana", src: "https://en.wikipedia.org/wiki/Dunkwa-On-Offin" });

TL.origin("belgium", {
  note: "Belgium arose from the 1830 revolution against the United Kingdom of the Netherlands, which the Congress of Vienna had created in 1814–15 from the former Dutch Republic, the Austrian Netherlands and the Prince-Bishopric of Liège. That kingdom is not a branch on this timeline.",
  links: [],
  cites: [W("Belgium", "Belgium"), { t: "History of Belgium | Flag, Map, & Summary | Britannica", u: "https://www.britannica.com/topic/history-of-Belgium" }],
});
TL.origin("dmt", {
  note: "Dʿmt had South Arabian (Sabaean) influence, though scholars debate how much; some see an indigenous kingdom, others a mix of Sabaean and local peoples. No earlier branch on the timeline is named as its source.",
  links: [],
  cites: [W("D%CA%BFmt", "Dʿmt"), W("Kingdom_of_Aksum", "Kingdom of Aksum"), { t: "Yeha in the Ethiopian Highlands | Anthropology | Research Starters | EBSCOhost", u: "https://www.ebsco.com/research-starters/anthropology/yeha-ethiopian-highlands/" }],
});
TL.origin("ife", {
  note: "Ife grew from an early settlement on the Yoruba homeland; Yoruba tradition has Oduduwa found its dynasty after taking creation's work from Obatala. No earlier branch on the timeline is a source.",
  links: [],
  cites: [W("Ife", "Ife"), { t: "Ile-Ife | Meaning, Artifacts, Culture, & Map | Britannica", u: "https://www.britannica.com/place/Ile-Ife" }],
});
TL.origin("tichitt", {
  note: "The Tichitt tradition's settlements on the Dhar Tichitt cliffs are dated variously (phases from 2600 BCE; the chronology is contested). Its earlier, Pre-Tichitt phase is named, but no earlier branch on the timeline is.",
  links: [],
  cites: [W("Dhar_Tichitt", "Dhar Tichitt"), { t: "The Tichitt tradition in the West African Sahel (Chapter 19) - The Cambridge World History", u: "https://www.cambridge.org/core/books/abs/cambridge-world-history/tichitt-tradition-in-the-west-african-sahel/FA8A6F2725008517F6ABD93007B96405" }],
});
TL.origin("denkyira", {
  note: "Denkyira was an Akan kingdom that rose as an inland power in the early 1600s; in its formative period it was politically subordinate to the older Adanse state, which it conquered around 1659.",
  links: [],
  cites: [W("Kingdom_of_Denkyira", "Kingdom of Denkyira"), { t: "Denkyera | Ashanti Empire, Gold Coast, Ghana | Britannica", u: "https://www.britannica.com/place/Denkyera" }],
});
