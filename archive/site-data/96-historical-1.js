// New branches: khedivate-egypt, nguyen-vietnam, sokoto. Every cite was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const EG = (sec, title) => B("place/Egypt/" + sec, title);
const EGMA = EG("Muhammad-Ali-and-his-successors-1805-82", "Egypt: Muhammad Ali and his successors, 1805–82");
const EGEU = EG("Renewed-European-intervention-1879-82", "Egypt: Renewed European intervention, 1879–82");
const EGAS = EG("Abbas-I-and-Said-1848-63", "Egypt: Abbas I and Said, 1848–63");
const EGWW = EG("World-War-I-and-independence", "Egypt: World War I and independence");
const ev = [];
const e = (id, branch, y, end, when, title, text, imp, cites, geo, link) => {
  const o = { id: "n96-" + id, branch, y, when, title, text, imp, cites };
  if (end) o.end = end;
  if (link) o.link = link;
  ev.push(o);
  TL.geo(o.id, geo);
};
const P = (lat, lon, label, slug, r = 40) => ({ scope: "place", lat, lon, r, label, src: "https://en.wikipedia.org/wiki/" + slug });
const R = (lat, lon, label, slug, r) => ({ scope: "region", lat, lon, r, label, src: "https://en.wikipedia.org/wiki/" + slug });

TL.add({ branches: [
  { id: "khedivate-egypt", name: "Egypt under Muhammad Ali's dynasty", region: "mideast", start: 1805.35, end: 1922.16, startWhen: "May 1805", endWhen: "February 28, 1922",
    parents: [], into: ["modern-egypt"],
    text: "Muhammad Ali became viceroy in 1805; his family ruled as hereditary viceroys, then khedives from 1867, under British occupation from 1882 and a British protectorate (sultanate) from 1914, until independence in 1922.",
    cites: [EGMA, EGEU, EGWW] },
  { id: "nguyen-vietnam", name: "Nguyễn Vietnam", region: "eastasia", start: 1802.42, end: 1887, startWhen: "June 1, 1802", endWhen: "1887 (the dynasty reigned nominally until 1945)",
    parents: [], into: ["french-indochina"],
    text: "Gia Long founded the Nguyễn dynasty at Huế in 1802. France took Cochinchina in 1862 and protectorates over Annam and Tonkin by 1884–85; the dynasty reigned nominally under French Indochina until Bảo Đại abdicated in 1945.",
    cites: [B("topic/Nguyen-dynasty", "Nguyen dynasty"), B("biography/Gia-Long", "Gia Long"), W("Nguyễn_dynasty", "Nguyễn dynasty")] },
  { id: "sokoto", name: "Sokoto Caliphate", region: "africa", start: 1804.12, end: 1903.57, startWhen: "1804", endWhen: "July 1903",
    parents: [], into: ["nigeria"],
    text: "Usman dan Fodio's jihad (1804–08) overthrew the Hausa kings and founded this Fulani-led Muslim state in northern Nigeria. British forces took Sokoto in March 1903 and absorbed it into Northern Nigeria.",
    cites: [B("biography/Usman-dan-Fodio", "Usman dan Fodio"), B("topic/Fulani-empire", "Fulani empire"), W("Sokoto_Caliphate", "Sokoto Caliphate")] },
] });

TL.origin("khedivate-egypt", {
  note: "After the French occupation of 1798–1801, a Cairo revolt against the Ottoman viceroy in 1805 ended with the ulama investing Muhammad Ali as viceroy. His family ruled Egypt, under Ottoman suzerainty, until Britain's protectorate of 1914.",
  links: [
    { id: "ottoman", how: "split", note: "Ottoman province whose viceroy Muhammad Ali became in 1805 and made hereditary in 1841" },
    { id: "france", how: "context", note: "The French occupation of 1798–1801 was the first European conquest of Egypt" },
  ],
  cites: [EGMA, B("place/Egypt/The-British-occupation", "Egypt: The British occupation")],
});
TL.origin("nguyen-vietnam", {
  note: "Nguyễn Ánh, heir of the Nguyễn lords of southern Vietnam, defeated the Tây Sơn rebels with French help and proclaimed himself emperor Gia Long in 1802, reuniting the country and modeling his court on Qing China.",
  links: [
    { id: "france", how: "context", note: "French mercenaries and equipment helped Nguyễn Ánh win the 1802 victories" },
    { id: "qing", how: "ideas", note: "Gia Long modeled his administration after China's Qing dynasty" },
  ],
  cites: [B("biography/Gia-Long", "Gia Long"), B("event/Tay-Son-Rebellion", "Tay Son rebellion"), B("topic/Nguyen-dynasty", "Nguyen dynasty")],
});
TL.origin("sokoto", {
  note: "The caliphate grew from a Fulani Muslim reform community in Gobir, one of the Hausa states (Kano, Katsina, Zaria and others). Usman dan Fodio accused the Hausa kings of mixing Islam with older beliefs, and Hausa commoners and Fulani herders joined his jihad.",
  links: [
    { id: "islam", how: "ideas", note: "Usman's movement aimed at government by Islamic law, in the Qadiri tradition" },
  ],
  cites: [B("topic/Fulani-empire", "Fulani empire"), B("place/Nigeria/Igboland-and-the-delta-city-states", "Nigeria: Igboland and the delta city-states (the jihad in the Hausa states)"), B("biography/Usman-dan-Fodio", "Usman dan Fodio")],
});

TL.geo("khedivate-egypt", R(27, 30.5, "Egypt", "Egypt", 700));
TL.geo("nguyen-vietnam", R(16, 107.5, "Vietnam", "Vietnam", 900));
TL.geo("sokoto", R(13.06, 5.25, "Sokoto Caliphate (northern Nigeria)", "Sokoto_Caliphate", 500));

// ---- Egypt ----
e("eg-viceroy-1805", "khedivate-egypt", 1805.4, null, "May–July 1805", "Muhammad Ali made viceroy of Egypt",
  "A Cairo revolt against the Ottoman viceroy Khurshid Pasha led the ulama to invest Muhammad Ali, and Sultan Selim III confirmed him in office in July 1805.", 1,
  [EGMA], P(30.04, 31.24, "Cairo, Egypt", "Cairo"), "ottoman");
e("eg-mamluk-massacre", "khedivate-egypt", 1811.2, null, "1811", "Muhammad Ali massacres the Mamluk leaders",
  "He lured many Mamluk leaders to a celebration at the Citadel and had them massacred; his son Ibrahim then drove survivors from Upper Egypt, ending the Mamluks as a political force.", 2,
  [EGMA], P(30.03, 31.26, "Citadel of Cairo", "Cairo_Citadel"));
e("eg-sudan-1820", "khedivate-egypt", 1820.5, 1821.5, "1820–1821", "Egypt conquers northern Sudan",
  "Muhammad Ali sent an expedition up the Nile that conquered much of what is now northern Sudan, opening an Egyptian empire in Africa that his successors expanded.", 2,
  [EGMA], R(15, 32, "Sudan", "Sudan", 800));
e("eg-syria-1831", "khedivate-egypt", 1831.9, 1833.5, "1831–1833", "Muhammad Ali's army takes Syria from the sultan",
  "Egyptian forces invaded Syria in 1831, defeated the Ottomans at Kütahya in December 1832, and in 1833 the sultan ceded his Syrian provinces to Muhammad Ali.", 2,
  [EGMA], R(35, 38, "Syria", "Syria", 500), "ottoman");
e("eg-hereditary-1841", "khedivate-egypt", 1841.5, null, "1841", "Sultan grants Muhammad Ali's family hereditary rule",
  "After the European powers forced Ibrahim Pasha out of Syria in 1840, Sultan Abdülmecid I in 1841 conferred hereditary rule of Egypt on Muhammad Ali's family, though the viceroy's power was declining.", 2,
  [EGMA], P(30.04, 31.24, "Cairo, Egypt", "Cairo"), "ottoman");
e("eg-railway-1851", "khedivate-egypt", 1851, 1856, "1851–1856", "Alexandria–Cairo railway built",
  "Britain won from Abbas I a concession to build a railway from Alexandria to Cairo to speed communications with India; it was completed between 1851 and 1856 and extended to Suez two years later.", 3,
  [EGAS], P(30.04, 31.24, "Cairo, Egypt", "Cairo"), "uk");
e("eg-suez-concession", "khedivate-egypt", 1854.5, null, "1854", "Said grants de Lesseps the Suez Canal concession",
  "The viceroy Said gave his French friend Ferdinand de Lesseps a concession to cut a canal across the isthmus of Suez, embroiling him with the sultan and with Britain.", 2,
  [EGAS], P(29.97, 32.55, "Suez, Egypt", "Suez"), "france");
e("eg-assembly-1866", "khedivate-egypt", 1866.85, null, "November 1866", "Ismail convenes an Assembly of Delegates",
  "The viceroy Ismail set up an advisory assembly of delegates in 1866; dominated by village headmen, it came to have an important influence on affairs of government.", 3,
  [B("biography/Ismail-Pasha", "Ismāʿīl Pasha")], P(30.04, 31.24, "Cairo, Egypt", "Cairo"));
e("eg-khedive-1867", "khedivate-egypt", 1867.5, null, "1867", "Ismail obtains the title of khedive",
  "In 1867 Ismail won from the Ottoman sultan the hereditary title of khedive; his spending built modern Egypt but raised the national debt from about £7 million to almost £100 million by 1876.", 1,
  [B("biography/Ismail-Pasha", "Ismāʿīl Pasha")], P(30.04, 31.24, "Cairo, Egypt", "Cairo"), "ottoman");
e("eg-ismail-deposed", "khedivate-egypt", 1879.45, null, "June 1879", "Ismail deposed by the sultan; European control revived",
  "The Ottoman sultan dismissed Ismail in June 1879 over the debt crisis; the Dual Control by Britain and France was revived, and the Law of Liquidation of 1880 split revenues with the debt commission.", 2,
  [B("biography/Ismail-Pasha", "Ismāʿīl Pasha"), EGEU], P(30.04, 31.24, "Cairo, Egypt", "Cairo"), "uk");
e("eg-urabi-1881", "khedivate-egypt", 1881.69, null, "September 1881", "Urabi's officers force a new ministry",
  "Colonel Ahmad Urabi led Egyptian officers resentful of the khedive and of European control; a military demonstration in Cairo in September 1881 forced Tawfiq to name a new ministry and convene an assembly.", 2,
  [EGEU], P(30.04, 31.24, "Cairo, Egypt", "Cairo"));
e("eg-alexandria-1882", "khedivate-egypt", 1882.53, null, "July 11, 1882", "Alexandria bombarded; France declines to join",
  "After riots in June 1882 and a British–French naval presence at Alexandria, France refused to join in the bombardment of July 11; Britain then resolved to intervene and sent Wolseley's force.", 2,
  [EGEU], P(31.2, 29.89, "Alexandria, Egypt", "Alexandria"), "uk");
e("eg-tel-el-kebir", "khedivate-egypt", 1882.7, null, "September 13, 1882", "Britain defeats Urabi at Tel el-Kebir and occupies Egypt",
  "Wolseley's expedition soundly defeated the Urabists at Tel el-Kebir, and Cairo was occupied the next day, beginning the British occupation of Egypt.", 1,
  [EGEU, W("Battle_of_Tell_El_Kebir", "Battle of Tel El Kebir")], P(30.55, 31.78, "Tel el-Kebir, Egypt", "Tell_El_Kebir"), "uk");
e("eg-protectorate-1914", "khedivate-egypt", 1914.95, null, "December 1914", "Britain declares a protectorate over Egypt",
  "After war with the Ottoman Empire began in November 1914, Britain proclaimed a protectorate, deposed Khedive Abbas, and made his uncle Husayn Kamil sultan.", 1,
  [EGWW], P(30.04, 31.24, "Cairo, Egypt", "Cairo"), "uk");
e("eg-revolution-1919", "khedivate-egypt", 1919.2, null, "1919", "Egyptian revolution of 1919",
  "Britain's refusal to receive Saad Zaghloul's delegation (wafd) and his arrest produced a widespread revolt; the Wafd became a countrywide organization dominating Egyptian politics.", 1,
  [EGWW], P(30.04, 31.24, "Cairo, Egypt", "Cairo"), "uk");
e("eg-independence-1922", "khedivate-egypt", 1922.16, null, "February 28, 1922", "Britain declares Egypt independent",
  "The declaration ended the protectorate but reserved imperial communications, defense, foreign interests and the Sudan to Britain; the sultan became King Fuad I on March 15.", 1,
  [EGWW], P(30.04, 31.24, "Cairo, Egypt", "Cairo"), "modern-egypt");

// ---- Vietnam ----
e("vn-gia-long", "nguyen-vietnam", 1802.42, null, "June 1, 1802", "Gia Long proclaims himself emperor",
  "After decisive victories at Huế and Hanoi in 1802 with French forces and weapons, Nguyễn Ánh took the title Gia Long and founded the Nguyễn dynasty, the last of Vietnam.", 1,
  [B("biography/Gia-Long", "Gia Long"), B("topic/Nguyen-dynasty", "Nguyen dynasty")], P(16.46, 107.59, "Huế, Vietnam", "Huế"), "france");
e("vn-hue-citadel", "nguyen-vietnam", 1804, 1833, "1804–1833", "Huế citadel and Imperial City built",
  "Gia Long ordered a palace complex modeled on Beijing's Forbidden City at Huế, begun in 1804 and enlarged to its present scale in 1833; the Complex of Huế Monuments was listed by UNESCO in 1993.", 2,
  [{ t: "Complex of Hué Monuments — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/678", k: "reference" }, W("Imperial_City,_Huế", "Imperial City of Huế")], P(16.47, 107.58, "Imperial City, Huế", "Huế"));
e("vn-minh-mang", "nguyen-vietnam", 1820.1, 1841.05, "1820–1841", "Minh Mang reigns, a strict Confucian",
  "Gia Long's fourth son, a strict Confucian, barred new Christian missionaries in 1825 and persecuted them after a Saigon rebellion in 1833.", 2,
  [B("biography/Minh-Mang", "Minh Mang")], P(16.47, 107.58, "Huế, Vietnam", "Huế"));
e("vn-kieu", "nguyen-vietnam", 1813.5, 1820, "c. 1813–1820", "Nguyễn Du writes The Tale of Kiều",
  "The poet Nguyễn Du, who died in 1820, rendered a Chinese novel into Vietnamese verse as Truyện Kiều (Kim Vân Kiều) while on a mission to Beijing; it is the best-loved work of Vietnamese literature.", 1,
  [B("biography/Nguyen-Du", "Nguyen Du"), W("The_Tale_of_Kiều", "The Tale of Kiều")], P(16.47, 107.59, "Huế, Vietnam", "Huế"));
e("vn-khoi-revolt", "nguyen-vietnam", 1833.36, 1835.7, "1833–1835", "Lê Văn Khôi revolt in Saigon",
  "Lê Văn Khôi, adopted son of the late general Lê Văn Duyệt, escaped prison in May 1833 and held the Saigon citadel against Minh Mạng until it fell in September 1835.", 3,
  [B("biography/Minh-Mang", "Minh Mang"), W("Lê_Văn_Khôi", "Lê Văn Khôi")], P(10.78, 106.7, "Saigon, Vietnam", "Ho_Chi_Minh_City"));
e("vn-tu-duc", "nguyen-vietnam", 1847.3, 1883.52, "1847–1883", "Tự Đức reigns; persecution foreshadows French conquest",
  "Tự Đức followed a policy of conservatism and isolation and continued persecuting missionaries; executions led the French in 1856 to send a protest to the court at Huế, and his persecution foreshadowed French conquest.", 2,
  [B("biography/Tu-Duc", "Tu Duc")], P(16.47, 107.58, "Huế, Vietnam", "Huế"));
e("vn-tourane-1858", "nguyen-vietnam", 1858.67, null, "September 1, 1858", "France attacks Tourane (Da Nang)",
  "Napoleon III decided in 1857 to invade Vietnam; Rigault de Genouilly stormed the harbor defenses at Tourane on September 1, 1858, then turned south and seized Saigon in February 1859.", 1,
  [B("place/Vietnam/The-conquest-of-Vietnam-by-France", "Vietnam: the conquest of Vietnam by France")], P(16.07, 108.21, "Da Nang, Vietnam", "Da_Nang"), "france");
e("vn-saigon-treaty-1862", "nguyen-vietnam", 1862.45, null, "June 1862", "Treaty of Saigon cedes Cochinchina provinces to France",
  "Unable to resist, Tự Đức signed a treaty in June 1862 (ratified in April 1863) ceding three southern provinces; five years later more land in the south was added to the colony of Cochinchina.", 1,
  [B("event/Treaty-of-Saigon", "Treaty of Saigon"), B("place/Vietnam/The-conquest-of-Vietnam-by-France", "Vietnam: the conquest of Vietnam by France")], P(10.78, 106.7, "Saigon, Vietnam", "Ho_Chi_Minh_City"), "france");
e("vn-garnier-1873", "nguyen-vietnam", 1873.89, null, "November 1873", "Francis Garnier attacks the Hanoi citadel",
  "Garnier reached Hanoi on November 5, 1873 and took the citadel on November 20 with a small force; his death in battle near Hanoi ended the attempt, but trade concessions followed.", 2,
  [W("Francis_Garnier", "Francis Garnier"), B("biography/Tu-Duc", "Tu Duc")], P(21.03, 105.85, "Hanoi, Vietnam", "Hanoi"), "france");
e("vn-protectorate-1884", "nguyen-vietnam", 1884.43, null, "June 6, 1884", "Treaty of Huế makes Annam and Tonkin protectorates",
  "The Patenôtre treaty, restating the harsher Harmand treaty of August 1883, created French protectorates over Annam and Tonkin and formed the basis of French rule for seven decades.", 1,
  [W("Treaty_of_Huế_(1884)", "Treaty of Huế (1884)"), B("place/Vietnam/The-conquest-of-Vietnam-by-France", "Vietnam: the conquest of Vietnam by France")], P(16.47, 107.58, "Huế, Vietnam", "Huế"), "french-indochina");
e("vn-can-vuong", "nguyen-vietnam", 1885.5, null, "July 4, 1885", "Hàm Nghi's revolt launches the Cần Vương movement",
  "The regents, led by Tôn Thất Thuyết, had the young emperor Hàm Nghi head an attack on the French at Huế; it failed and he fled, was deposed, and was later exiled to Algeria, while Cần Vương resistance went on until 1896.", 1,
  [B("biography/Ham-Nghi", "Ham Nghi"), W("Cần_Vương", "Cần Vương movement")], P(16.47, 107.58, "Huế, Vietnam", "Huế"), "french-indochina");

// ---- Sokoto ----
TL.move("w202-sokoto-jihad", "sokoto");
e("so-tsuntua", "sokoto", 1804.95, null, "December 1804", "Defeat at Tsuntua tests the jihad",
  "The Shaykh's forces lost a major battle at Tsuntua in December 1804, said to cost 2,000 men including 200 who knew the Qurʾān by heart.", 3,
  [B("biography/Usman-dan-Fodio", "Usman dan Fodio"), W("Battle_of_Tsuntua", "Battle of Tsuntua")], R(13.64, 6.29, "Tsuntua area, Gobir (approximate)", "Gobir", 40), "islam");
e("so-bayan-1806", "sokoto", 1806.85, null, "November 1806", "Usman dan Fodio writes Bayān wujūb al-hijra",
  "In this treatise Usman set out a simple, nonexploitative state: a loyal vizier, judges, a police chief and a tax collector, with emirs chosen for learning, piety and justice.", 3,
  [B("biography/Usman-dan-Fodio", "Usman dan Fodio")], P(13.47, 4.43, "Gudu, Nigeria", "Gudu"));
e("so-alkalawa-1808", "sokoto", 1808.75, null, "October 1808", "Fulani victory at Alkalawa ends Gobir's resistance",
  "The Fulani victory over the Gobirawa at Alkalawa in October 1808 achieved the jihad's main military aims; by 1811 almost all Hausa kings had been replaced by Fulani emirs recognizing his authority.", 2,
  [B("biography/Muhammad-Bello", "Muhammad Bello"), B("biography/Usman-dan-Fodio", "Usman dan Fodio")], P(13.61, 6.26, "Alkalawa, Gobir", "Alkalawa"));
e("so-sokoto-capital", "sokoto", 1809.5, 1810.5, "1809–1810", "Muhammad Bello makes Sokoto his headquarters",
  "Bello moved to Sokoto in 1809–10, built a home for his father at Sifawa nearby, and the town became the seat of the caliphate; the Shaykh moved to Sokoto about 1815.", 2,
  [B("biography/Usman-dan-Fodio/Later-life", "Usman dan Fodio: Later life")], P(13.06, 5.24, "Sokoto, Nigeria", "Sokoto"));
e("so-reorganization-1812", "sokoto", 1812.5, null, "1812", "Caliphate divided between Sokoto and Gwandu",
  "The administration was reorganized in 1812: viziers Abdullahi and Bello took charge of the western and eastern halves, leaving Usman free to teach and write.", 2,
  [B("biography/Usman-dan-Fodio/Later-life", "Usman dan Fodio: Later life"), B("topic/Fulani-empire", "Fulani empire")], P(12.5, 4.64, "Gwandu, Nigeria", "Gwandu"));
e("so-usman-dies-1817", "sokoto", 1817.5, null, "1817", "Usman dan Fodio dies; Muhammad Bello succeeds",
  "Usman died at Sokoto in 1817, aged 62; Bello became amir al-muʾminin, ruling until 1837, while Abdullahi held Gwandu and the western emirates.", 1,
  [B("biography/Usman-dan-Fodio/Later-life", "Usman dan Fodio: Later life"), B("biography/Muhammad-Bello", "Muhammad Bello")], P(13.06, 5.24, "Sokoto, Nigeria", "Sokoto"));
e("so-nana-asmau", "sokoto", 1835, null, "c. 1830–1840", "Nana Asmaʾu trains the jajis to teach women",
  "Usman's daughter, a poet and scholar, wrote in Arabic, Fula and Hausa. Beginning between about 1830 and 1840 she trained women teachers (jajis) who taught rural women across the caliphate.", 2,
  [{ t: "A Plea to Saintly Women: The Life and Legacy of Nana Asma'u — Yaqeen Institute", u: "https://yaqeeninstitute.org/read/paper/a-plea-to-saintly-women-the-life-and-legacy-of-nana-asmau", k: "reference" }, W("Nana_Asmaʼu", "Nana Asmaʾu")], P(13.06, 5.24, "Sokoto, Nigeria", "Sokoto"));
e("so-royal-niger-1886", "sokoto", 1886.5, null, "1886", "Royal Niger Company chartered",
  "Britain chartered George Goldie's Royal Niger Company in 1886 to control trade on the Niger; British rule over what became Northern Nigeria was aided by the decay of the caliphate's system.", 3,
  [B("place/Nigeria/The-arrival-of-the-British", "Nigeria: the arrival of the British"), B("topic/Fulani-empire", "Fulani empire")], R(9, 7, "Niger River basin, Nigeria", "Niger_River", 500), "uk");
e("so-fall-1903", "sokoto", 1903.2, null, "March 15, 1903", "British capture Sokoto",
  "British forces under Lugard's Northern Nigeria Protectorate defeated the Sokoto army on March 15, 1903, and Lugard installed a sultan with reduced powers four days later.", 1,
  [W("Battle_of_Sokoto", "Battle of Sokoto"), B("topic/Fulani-empire", "Fulani empire")], P(13.06, 5.24, "Sokoto, Nigeria", "Sokoto"), "uk");
e("so-burmi-1903", "sokoto", 1903.57, null, "July 27, 1903", "Caliph Attahiru I killed at Burmi",
  "After Sokoto fell, the deposed caliph withdrew east and rebelled; British forces killed him at Burmi (now Gombe State) on July 27, 1903, ending the caliphate's resistance.", 2,
  [B("place/Nigeria/The-arrival-of-the-British", "Nigeria: the arrival of the British"), W("Battle_of_Burmi", "Burmi campaign")], R(10.85, 11.43, "Burmi area near Bajoga, Gombe State (approximate)", "Bajoga", 60), "nigeria");

TL.add({ events: ev });

// ---- Egyptian events moved from the Ottoman branch (1805–1922) ----
for (const id of ["c2ma-bulaq-press", "c2ma-tahtawi-paris", "c2ma-khedivial-opera", "c2ma-al-ahram", "c2ma-al-hilal", "c2ma-lumiere-alexandria", "c2ma-tahrir-al-mara", "c2ma-egyptian-museum-tahrir", "c2ma-zaynab-novel", "lc-suez-canal"]) TL.move(id, "khedivate-egypt");
TL.patch("lc-suez-canal", { link: "france" });
TL.patch("w202-sokoto-jihad", { link: "islam" });
