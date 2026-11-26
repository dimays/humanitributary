// Restructuring approved by the owner: one European integration branch, two philosophy branches closed at the end of
// their classical period, clearer scopes for overlapping branches, and five contradicted dates.

const B = (path, title) => ({ t: title, u: `https://www.britannica.com/${path}` });
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const EU = (page, title) => ({ t: `${title} — European Union`, u: `https://european-union.europa.eu/principles-countries-history/history-eu/${page}_en` });

// ---------- 1. European integration: ECSC, EEC and EU as one branch ----------
TL.patch("eu", {
  name: "European integration (ECSC → EEC → EU)",
  start: 1952.56,
  startWhen: "1952 (ECSC, in force July 23); EEC January 1, 1958; EU from November 1, 1993",
  endWhen: "",
  text: "Six states pooled coal and steel (ECSC, 1952), formed the EEC (1958) and, through the Maastricht Treaty (in force November 1, 1993), the European Union, which has 27 members since the UK left in 2020.",
  addCites: [
    EU("1945-59", "History of the EU, 1945–59"),
    B("topic/European-Coal-and-Steel-Community", "European Coal and Steel Community (ECSC) | Britannica"),
    B("event/Maastricht-Treaty", "Maastricht Treaty | Date, Purpose, Significance, & Facts | Britannica"),
    W("European_Coal_and_Steel_Community", "European Coal and Steel Community"),
  ],
});
TL.merge("ecsc", "eu");
TL.merge("eec", "eu");
TL.origin("eu", {
  note: "French foreign minister Robert Schuman proposed pooling coal and steel on May 9, 1950, to end Franco-German rivalry; the six-nation ECSC of 1952 was the first step of European integration after World War II.",
  links: [
    { id: "ww2", how: "context", note: "Schuman aimed to make war between France and Germany unthinkable" },
  ],
  cites: [EU("1945-59", "History of the EU, 1945–59"), B("topic/European-Coal-and-Steel-Community", "European Coal and Steel Community (ECSC) | Britannica")],
});

// ---------- 2. Philosophy branches closed at the end of their classical period ----------
TL.patch("buddhist-philosophy", {
  end: 1200,
  endWhen: "c. 1200 (Britannica: Nālandā, the great monastic center, was probably sacked in raids c. 1200 and never recovered; later schools continue on Buddhism)",
  text: "Madhyamaka (Nāgārjuna, 2nd century) and Yogācāra (Asaṅga and Vasubandhu, 4th–5th century), the two great Mahāyāna schools of India. This branch covers their Indian period; later Tibetan and East Asian developments sit on Buddhism.",
  addCites: [
    B("place/Nalanda", "Nalanda | University, History & Facts | Britannica"),
    B("topic/Madhyamika", "Mādhyamika | Nagarjuna, Yogacara, Sunyata | Britannica"),
    B("topic/Yogachara", "Yogachara | Mahayana School, 8th Century India | Britannica"),
  ],
});
TL.move("w401-sakya-pandita-godan", "buddhism");
TL.move("w401-lamrim-chenmo", "buddhism");
TL.move("w301-taranatha-history", "buddhism");

TL.patch("classical-hindu-schools", {
  end: 1100,
  endWhen: "c. 1100 (Britannica: Old Nyāya gives way to Navya-Nyāya in the 11th century; later developments continue on Hinduism)",
  text: "Classical schools of Indian philosophy: Nyāya (logic), Sāṃkhya (dualism) and Yoga. This branch covers their classical period to c. 1100, when Navya-Nyāya arose; later and modern developments, including modern yoga, sit on Hinduism.",
  addCites: [
    B("topic/Nyaya", "Nyaya | Logic, Epistemology, Ethics | Britannica"),
    B("topic/Indian-philosophy", "Indian philosophy | History, Characteristics, Schools, Importance, Philosophers, & Facts | Britannica"),
  ],
});
TL.move("w401-gangesa-navya-nyaya", "hinduism");
TL.move("w401-hatha-yoga-pradipika", "hinduism");
TL.move("w201-vivekananda-raja-yoga", "hinduism");
TL.move("w103-krishnamacharya-yogashala", "hinduism");
TL.move("w103-international-day-of-yoga", "hinduism");

// ---------- 3. Overlaps ----------
TL.patch("aristotelianism", {
  text: "Aristotle's Lyceum and the long tradition of translating and commenting on his works in Greek, Syriac, Arabic and Latin, to the Renaissance. The Latin university method built on them is on the Scholasticism branch.",
  addCites: [B("topic/Aristotelianism", "Aristotelianism | Definition, Philosophy, & History | Britannica")],
});
TL.patch("scholasticism", {
  text: "The method of the medieval Christian schools and universities, built on disputed questions and on Aristotle's newly translated works. The Aristotelian tradition itself (translation, commentary) is on the Aristotelianism branch.",
  addCites: [B("topic/Scholasticism", "Scholasticism | Nature, History, Influence, & Facts | Britannica")],
});
TL.move("w401-albert-teaches-aquinas", "scholasticism");

TL.patch("austronesian-expansion", {
  endWhen: "c. 1500 BCE (Taiwan, the Philippines, island Southeast Asia and the Marianas; Lapita and Pacific settlement follow on Lapita & Polynesian peoples)",
  text: "Austronesian speakers from Taiwan spread through the Philippines and island Southeast Asia and across to the Marianas. This branch stops at about 1500 BCE; Lapita settlement of Island Melanesia (from c. 1600 BCE) and Polynesian settlement are on the Polynesian branch.",
  addCites: [
    B("topic/Austronesian-languages", "Austronesian languages | Origin, History, Language Map, & Facts | Britannica"),
    B("topic/Lapita-culture", "Lapita culture | Polynesia, Melanesia, Micronesia | Britannica"),
  ],
});
TL.patch("polynesians", {
  text: "Austronesian-speaking Lapita people spread through Island Melanesia from c. 1600 BCE and reached Fiji and Tonga by 1000 BCE, ancestors of the Polynesians. The earlier Taiwan and Southeast Asian phase is on the Austronesian branch.",
  addCites: [B("topic/Lapita-culture", "Lapita culture | Polynesia, Melanesia, Micronesia | Britannica")],
});

// ---------- 4. Contradicted dates ----------
TL.patch("ife", {
  start: 550,
  startWhen: "c. 6th century CE (the Met: a cluster of about thirteen hamlets); a well-established kingdom by the early 11th century (Britannica)",
  text: "Yoruba city in southwestern Nigeria, begun as about thirteen hamlets in the 6th century and the traditional seat of Oduduwa's dynasty. Its naturalistic bronze and terracotta sculpture dates to c. 1200–1500; the Ooni of Ife still rules there.",
  addCites: [
    { t: "Ife (from ca. 6th Century) — Heilbrunn Timeline of Art History, The Metropolitan Museum of Art", u: "https://www.metmuseum.org/essays/ife-from-ca-6th-century", k: "museum" },
    B("place/Ile-Ife", "Ile-Ife | Meaning, Artifacts, Culture, & Map | Britannica"),
  ],
});

TL.patch("indus", {
  endWhen: "c. 1300 BCE (end of the Late Harappan phase; the urban Mature phase ended c. 1900 BCE)",
  text: "Bronze Age civilization of the Indus basin. Its urban Mature phase ran c. 2600–1900 BCE (Harappa, Mohenjo-daro, an undeciphered script); the branch follows the Late Harappan phase, c. 1900–1300 BCE, when southern sites lasted longer.",
  addCites: [
    B("topic/Indus-civilization", "Indus civilization | History, Location, Map, Artifacts, Language, & Facts | Britannica"),
    W("Indus_Valley_Civilisation", "Indus Valley Civilisation"),
  ],
});

TL.patch("mali", {
  endWhen: "c. 1610 (Mahmud Keita IV, the last Keita ruler of the rump state, died; the empire had lost most of its territory long before)",
  text: "Mande empire founded by Sundiata Keita after Kirina (c. 1235). Mansa Musa annexed Timbuktu in 1324; Songhai took Mema in 1465 and sacked the capital in the 1540s, and a small Keita state survived until Mahmud Keita IV died (c. 1610).",
  addCites: [
    { t: "Mali Empire — World History Encyclopedia", u: "https://www.worldhistory.org/Mali_Empire/", k: "encyclopedia" },
    B("place/Mali-historical-empire-Africa", "Mali | Empire, History, Religion, Map, & Mansa Mūsā | Britannica"),
  ],
});

TL.patch("w405-ghana-audaghost", {
  y: 990,
  when: "c. 990 (Wikipedia); by 1050 (the Met)",
  text: "Wikipedia says Ghana conquered the Berber town of Audaghost in 990 and installed a governor; the Met says only that by 1050 Ghana controlled it. The Almoravids took Audaghost in 1054.",
  addCites: [W("Ghana_Empire", "Ghana Empire")],
});
