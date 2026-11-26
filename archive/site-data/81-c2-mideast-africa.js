// C2 culture fill: Middle East and Africa, 1800–1925 (Egypt and the Levant sit on "ottoman", nominally Ottoman until 1914/1922). Every cite was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const ev = [];
const geos = [];
const e = (id, branch, y, end, when, title, text, imp, cites, geo) => {
  const o = { id: "c2ma-" + id, branch, y, when, title, text, imp, cites };
  if (end) o.end = end;
  ev.push(o);
  geos.push([o.id, geo]);
};
const P = (lat, lon, label, slug, r = 40) => ({ scope: "place", lat, lon, r, label, src: "https://en.wikipedia.org/wiki/" + slug });
const R = (lat, lon, label, slug, r) => ({ scope: "region", lat, lon, r, label, src: "https://en.wikipedia.org/wiki/" + slug });
const CAIRO = P(30.04, 31.24, "Cairo, Egypt", "Cairo");
const IST = P(41.01, 28.98, "Istanbul, Turkey", "Istanbul");
const TEH = P(35.69, 51.39, "Tehran, Iran", "Tehran");
const ADD = P(9.04, 38.75, "Addis Ababa, Ethiopia", "Addis_Ababa");
const JHB = P(-26.2, 28.05, "Johannesburg, South Africa", "Johannesburg");

// ---- Ottoman lands (including Egypt, the Levant) ----
e("bulaq-press", "ottoman", 1821, null, "1820–21", "Muhammad Ali's Bulaq Press opens in Cairo",
  "Muhammad Ali's government press, in Cairo's Bulaq district, is described as Egypt's first government-owned Arabic printing press. It was founded in 1820, opened officially in 1821 and printed its first book in 1822. (Egypt was then an Ottoman province under a near-autonomous pasha.)", 2,
  [W("Bulaq_Press", "Bulaq Press"), B("place/Bulaq", "Būlāq")], P(30.06, 31.23, "Bulaq, Cairo", "Bulaq"));
e("donizetti-pasha", "ottoman", 1828, null, "1828", "Giuseppe Donizetti becomes Ottoman court music master",
  "From 1828 the Italian Giuseppe Donizetti was Instructor General of Imperial Ottoman Music under Mahmud II. He trained European-style military bands, taught palace members and is believed to have composed the first Ottoman anthem.", 3,
  [W("Giuseppe_Donizetti", "Giuseppe Donizetti"), { t: "Music to a Sultan's Ears — Cornucopia", u: "https://www.cornucopia.net/magazine/articles/music-to-a-sultans-ears" }], IST);
e("tahtawi-paris", "ottoman", 1834, null, "1834", "Tahtawi publishes his account of Paris",
  "Rifa'a al-Tahtawi, who went to Paris in 1826 as religious teacher to a group of Egyptian students, published Takhlis al-Ibriz about his stay in France. It is an early work of the Arabic Nahda (awakening). (Egypt was then an Ottoman province.)", 2,
  [W("Rifa%27a_al-Tahtawi", "Rifa'a al-Tahtawi"), B("biography/Rifaah-Rafi-al-Tahtawi", "Rifāʿah Rāfiʿ al-Ṭahṭāwī")], CAIRO);
e("tercuman-i-ahval", "ottoman", 1860.802, null, "October 21, 1860", "Tercüman-ı Ahval, first private Turkish newspaper",
  "Agâh Efendi published the paper with the writer İbrahim Şinasi. It and Tasvir-i Efkâr (1862) became vehicles for Young Ottoman ideas.", 2,
  [{ t: "Agâh Efendi — Republic of Türkiye Ministry of Culture and Tourism", u: "https://www.ktb.gov.tr/EN-118056/agah-efendi.html" }, B("topic/Tercuman-i-Ahval", "Tercüman-i Ahval")], IST);
e("abdullah-freres", "ottoman", 1863, null, "1863", "Abdullah Frères named Ottoman court photographers",
  "Sultan Abdulaziz declared the Abdullah Frères official court photographers in 1863, a title they kept until 1899. They photographed sultans and statesmen, and took much of the work in Abdülhamid II's photograph albums.", 3,
  [W("Abdullah_Fr%C3%A8res", "Abdullah Frères"), { t: "Abdul-Hamid II Photographs — Library of Congress", u: "https://guides.loc.gov/ottoman-turkish/abdul-hamid-ii-photographs" }], IST);
e("syrian-protestant-college", "ottoman", 1866.918, null, "December 3, 1866", "Syrian Protestant College opens in Beirut",
  "Chartered in 1863, the college opened with 16 students and taught in Arabic at first; English became the language of instruction in 1887. It later became the American University of Beirut.", 2,
  [W("American_University_of_Beirut", "American University of Beirut"), B("topic/American-University-of-Beirut", "American University of Beirut")], P(33.9, 35.48, "Beirut, Lebanon", "Beirut"));
e("khedivial-opera", "ottoman", 1869.834, null, "November 1869", "Khedive Ismail opens Cairo's Opera House",
  "Built for the Suez Canal celebrations, the Khedivial Opera House opened with Verdi's Rigoletto; Aida, written for Cairo, premiered there in 1871. It burned down in 1971. (Egypt was then an Ottoman province under its khedives.)", 2,
  [W("Cairo_Opera_House", "Cairo Opera House"), { t: "About — Cairo Opera House", u: "https://cairoopera.org/en/about/" }], CAIRO);
e("muhit-al-muhit", "ottoman", 1869, null, "1869", "Bustani completes the Arabic dictionary Muhit al-Muhit",
  "After eleven years' work, the Lebanese scholar Butrus al-Bustani finished this modernizing Arabic dictionary. He also began an Arabic encyclopedia, part of his program to revive Arabic for modern knowledge.", 2,
  [W("Muhit_al-Muhit", "Muhit al-Muhit"), B("biography/Butrus-al-Bustani", "Buṭrus al-Bustānī")], P(33.89, 35.5, "Beirut, Lebanon", "Beirut"));
e("vatan-yahut-silistre", "ottoman", 1873.5, null, "1873", "Namık Kemal's Vatan yahut Silistre stages patriotism",
  "At Istanbul's Gedikpaşa theater, Kemal's play on the 1854 siege of Silistria drew a roaring audience and protest. Within about a week he was arrested and sent to Cyprus (1873–76).", 2,
  [W("Vatan_yahut_Silistre", "Vatan yahut Silistre"), B("biography/Namik-Kemal", "Namık Kemal")], IST);
e("al-ahram", "ottoman", 1876.594, null, "August 5, 1876", "Al-Ahram founded in Alexandria",
  "The Lebanese Takla brothers started the weekly (Britannica dates its founding to 1875). It became a daily in 1881 and moved to Cairo in the late 1890s, becoming Egypt's leading newspaper. (Egypt was then an Ottoman province under its khedives.)", 2,
  [W("Al-Ahram", "Al-Ahram"), B("topic/Al-Ahram", "Al-Ahram")], P(31.2, 29.92, "Alexandria, Egypt", "Alexandria"));
e("al-hilal", "ottoman", 1892, null, "1892", "Jurji Zaydan launches the magazine Al-Hilal",
  "The Lebanese-born writer serialized his historical novels in the magazine. Britannica says they reached generations of readers and made the historical novel a favorite genre. (Egypt was then an Ottoman province under British occupation.)", 2,
  [W("Jurji_Zaydan", "Jurji Zaydan"), B("biography/Jurji-Zaydan", "Jurjī Zaydān")], R(26.8, 30.8, "Egypt", "Egypt", 600));
e("lumiere-alexandria", "ottoman", 1896.873, null, "November 15, 1896", "First film screening in Egypt, Alexandria",
  "The Lumière brothers' cinématographe was shown at the Toussoun Exchange in Alexandria, followed by a Cairo screening on November 28. Egypt later built the Arab world's largest film industry. (Egypt was then under British occupation.)", 3,
  [W("Cinema_of_Egypt", "Cinema of Egypt"), { t: "Introduction to Egyptian Cinema — Festival de Cannes", u: "https://www.festival-cannes.com/en/2011/introduction-to-egyptian-cinema/" }], P(31.2, 29.92, "Alexandria, Egypt", "Alexandria"));
e("tahrir-al-mara", "ottoman", 1899, null, "1899", "Qasim Amin publishes The Liberation of Women",
  "The Egyptian jurist's book criticized the veil and seclusion and called for girls' education. It drew sharp attacks in the press and a debate that ran hot for a year or two. (Egypt was then an Ottoman province under British occupation.)", 2,
  [W("Qasim_Amin", "Qasim Amin"), { t: "The Other Legacy of Qasim Amin: The View from 1908 — International Journal of Middle East Studies", u: "https://www.cambridge.org/core/product/C8815B083C949AC1AC9B2C943F1A33E8" }], CAIRO);
e("egyptian-museum-tahrir", "ottoman", 1902.871, null, "November 15, 1902", "Egyptian Museum opens in its Tahrir Square building",
  "Designed by Marcel Dourgnon, the museum building replaced earlier homes at Bulaq and Giza for the collection begun under Mariette. (Egypt was then under British occupation, though still nominally Ottoman.)", 2,
  [W("Egyptian_Museum", "Egyptian Museum"), B("topic/Egyptian-Museum-Cairo-Egypt", "Egyptian Museum")], CAIRO);
e("galatasaray-founded", "ottoman", 1905.83, null, "October 1905", "Galatasaray Sports Club founded in Istanbul",
  "Ali Sami Yen and fellow students of Galatasaray High School founded the club, which became one of Turkey's leading football clubs.", 3,
  [W("Galatasaray_S.K._(football)", "Galatasaray S.K. (football)"), { t: "Galatasaray SK — Store norske leksikon", u: "https://snl.no/Galatasaray_SK" }], IST);
e("tortoise-trainer", "ottoman", 1906, null, "1906", "Osman Hamdi Bey paints The Tortoise Trainer",
  "The Ottoman painter, archaeologist and museum founder painted a dervish patiently teaching a tortoise, often read as satire on slow Ottoman reform. It sold for $3.5 million in 2004.", 2,
  [W("The_Tortoise_Trainer", "The Tortoise Trainer"), B("biography/Osman-Hamdi-Bey", "Osman Hamdi Bey")], IST);
e("zaynab-novel", "ottoman", 1913, null, "1913", "Haykal's Zaynab, often called the first Arabic novel",
  "Muhammad Husayn Haykal's novel of Egyptian village life and cotton laborers is often regarded as the first Arabic novel. (Egypt was then an Ottoman province under British occupation; the protectorate began in 1914.)", 2,
  [W("Zaynab_(novel)", "Zaynab (novel)"), B("biography/Muhammad-Husayn-Haykal", "Muḥammad Ḥusayn Haykal")], CAIRO);

// ---- Iran ----
e("kaghaz-e-akhbar", "iran", 1837, null, "1837", "Kaghaz-e Akhbar, Iran's first newspaper",
  "Mirza Saleh Shirazi published the paper in 1837, using printing machinery he had brought from England in 1819.", 2,
  [W("Mirza_Saleh_Shirazi", "Mirza Saleh Shirazi")], TEH);
e("dar-al-fonun", "iran", 1851.994, null, "December 29, 1851", "Dar al-Fonun opens in Tehran",
  "Founded by the chief minister Amir Kabir, who was dismissed before it opened, this polytechnic with European instructors began modern education in Iran. It later set up its own photographic studio.", 2,
  [{ t: "Dār al-Fonūn — Encyclopaedia Iranica", u: "https://www.iranicaonline.org/articles/dar-al-fonun-lit/" }, { t: "Introduction of Photography in Iran — Smithsonian National Museum of Asian Art", u: "https://asia-archive.si.edu/research/iran-in-photographs/introduction-of-photography-in-iran/" }], TEH);
e("takyeh-dowlat", "iran", 1868, null, "1868 (Iranica elsewhere: 1870s)", "Takyeh Dowlat built for royal ta'ziyeh in Tehran",
  "Naser al-Din Shah's royal theater, a huge circular arena, staged the Muharram passion play ta'ziyeh and other plays. Its date is uncertain: Iranica gives 1868 in one entry and the 1870s in another.", 2,
  [{ t: "TAʿZIA — Encyclopaedia Iranica", u: "https://www.iranicaonline.org/articles/tazia/" }, { t: "PIŠ-PARDA — Encyclopaedia Iranica", u: "https://www.iranicaonline.org/articles/pish-parda/" }, W("Tekyeh_Dowlat", "Tekyeh Dowlat")], TEH);
e("sevruguin-studio", "iran", 1875, null, "1870s", "Antoin Sevruguin's studio photographs Qajar Iran",
  "After returning in the early 1870s, Sevruguin set up in Tabriz and then on Tehran's Ala al-Dawla Street, photographing the court, dervishes and landscapes. The Smithsonian holds the largest public collection of his work.", 2,
  [{ t: "Antoin Sevruguin — Smithsonian National Museum of Asian Art", u: "https://asia.si.edu/research/iran-in-photographs/antoin-sevruguin/" }, W("Antoin_Sevruguin", "Antoin Sevruguin")], TEH);
e("hall-of-mirrors-painting", "iran", 1896, null, "1896", "Kamal-ol-Molk finishes his Hall of Mirrors painting",
  "The court painter spent almost five years on the canvas of the Hall of Mirrors, commissioned by Naser al-Din Shah. It was completed as the Shah was assassinated in 1896.", 2,
  [{ t: "Kamāl-al-Molk, Moḥammad Ḡaffāri i. Life — Encyclopaedia Iranica", u: "https://www.iranicaonline.org/articles/kamal-al-molk-mohammad-gaffari/kamal-al-molk-mo%e1%b8%a5ammad-%e1%b8%a1affari-i-life/" }, W("Kamal-ol-Molk", "Kamal-ol-Molk")], TEH);
e("akkas-bashi-film", "iran", 1900.62, null, "August 1900", "Akkas-Bashi films Mozaffar ad-Din Shah in Europe",
  "On the Shah's first European trip, the court photographer Mirza Ebrahim Khan Akkas-Bashi filmed at Ostend, Belgium (Iranica says the flower festival on August 18; Wikipedia says August 15). These are called Iran's first films.", 3,
  [{ t: "ʿAKKĀS-BĀŠĪ — Encyclopaedia Iranica", u: "https://www.iranicaonline.org/articles/akkas-basi/" }, W("Mirza_Ebrahim_Khan_Akkas_Bashi", "Mirza Ebrahim Khan Akkas Bashi")], P(51.23, 2.92, "Ostend, Belgium", "Ostend"));
e("yeki-bud-yeki-nabud", "iran", 1921, null, "1921", "Jamalzadeh's Yeki Bud Yeki Nabud published in Berlin",
  "His six stories of Iranian society, in plain spoken Persian, are seen as founding the Persian short story. Clergy reacted so angrily when it reached Iran that copies were reportedly burned.", 2,
  [W("Mohammad_Ali_Jamalzadeh", "Mohammad Ali Jamalzadeh")], P(52.52, 13.4, "Berlin, Germany", "Berlin"));
e("nima-afsaneh", "iran", 1922, null, "1922", "Nima Yushij's Afsaneh breaks with classical Persian verse",
  "Nima's poem Afsaneh (Myth) was an early step in his break from classical conventions. Britannica says he first proposed a radical renewal of Persian poetry's content, prosody and imagery.", 3,
  [W("Nima_Yooshij", "Nima Yooshij"), B("biography/Nima-Yushij", "Nima Yushij")], P(36.57, 52.68, "Yush, Iran", "Yush,_Iran"));

// ---- Africa ----
e("adinkra-cloth", "ashanti", 1817.5, null, "1817", "Earliest surviving adinkra cloth collected in Kumasi",
  "Thomas Bowdich visited Kumasi in 1817 and gave the British Museum an adinkra cloth stamped with 15 symbols in 1818. It is described as the oldest surviving example of the Akan textile art.", 2,
  [W("Adinkra_symbols", "Adinkra symbols"), { t: "Adinkra: From Kumase to the British Museum — British Art Studies", u: "https://britishartstudies.ac.uk/issues/28/adinkra-from-kumase-to-the-british-museum/" }], P(6.69, -1.62, "Kumasi, Ghana", "Kumasi"));
e("aimro-newspaper", "ethiopia", 1901.04, null, "c. 1901", "Aimro, early Ethiopian newspaper, begins at Menelik's court",
  "Aimro (Aemero) began around 1901 under Menelik II: four pages, about 25 handwritten copies, later about 200 once a press arrived. Wikipedia calls it Ethiopia's first government newspaper, dated January 17, 1901.", 3,
  [W("Media_of_Ethiopia", "Media of Ethiopia"), { t: "The fading press — The Reporter (Ethiopia)", u: "https://www.thereporterethiopia.com/1182/" }], ADD);
e("taitu-hotel", "ethiopia", 1905.5, null, "1905", "Empress Taytu founds Addis Ababa's Taitu Hotel",
  "Taytu opened what is called Ethiopia's oldest hotel in the Piazza district to give foreign guests a place to rest and dine. Evelyn Waugh later fictionalized it in Scoop.", 3,
  [W("Taitu_Hotel", "Taitu Hotel")], ADD);
e("menelik-school", "ethiopia", 1908.79, null, "October 1908", "Menelik II School opens in Addis Ababa",
  "Led by the Egyptian Coptic educator Hanna Saleb, the school began with about 100 boys, mostly from leading families, and is called Ethiopia's first modern school. Menelik had approved modern education in 1906.", 2,
  [W("Menelik_II_School", "Menelik II School"), { t: "Educational advances in Menelik's day — twlethiopia.org", u: "https://twlethiopia.org/article/educational-advances-in-menileks-day/" }, B("biography/Menilek-II", "Menilek II")], ADD);
e("history-of-yorubas", "ife", 1921, null, "1921", "Samuel Johnson's History of the Yorubas published",
  "The Yoruba Anglican minister finished the book in 1897, but the manuscript was lost; his brother Obadiah rebuilt it from notes. Published in 1921, it remains the standard reference on Yoruba history. (Yoruba-wide, not only Ife.)", 2,
  [{ t: "The History of the Yorubas — Cambridge University Press", u: "https://www.cambridge.org/core/books/history-of-the-yorubas/2389E85E75E370E76B6189F44A6A9646" }, { t: "Johnson, Samuel — Dictionary of African Christian Biography", u: "https://dacb.org/stories/nigeria/johnson-1samuel/" }, W("The_History_of_the_Yorubas", "The History of the Yorubas")], R(8, 4, "Yorubaland, Nigeria", "Yorubaland", 300));
e("tervuren-exposition", "congo-free-state", 1897.5, null, "1897", "Congo showcased at the Tervuren colonial exposition",
  "Leopold II's colonial section of the Brussels exposition was moved to Tervuren, where a temporary “human zoo” village held 267 Congolese people, seven of whom died. It became the Museum of the Congo in 1898.", 2,
  [W("Royal_Museum_for_Central_Africa", "Royal Museum for Central Africa"), { t: "History and renovation — AfricaMuseum", u: "https://www.africamuseum.be/en/about_us/history_renovation" }], P(50.83, 4.52, "Tervuren, Belgium", "Tervuren"));
e("union-buildings", "south-africa", 1913, null, "1910–13", "Herbert Baker's Union Buildings built in Pretoria",
  "Designed by Herbert Baker and completed in 1913 on Meintjieskop, the neoclassical complex housed the Union of South Africa's administrative offices and remains the seat of government and the president's offices.", 3,
  [W("Union_Buildings", "Union Buildings"), { t: "Union Buildings, Pretoria — South African History Online", u: "https://www.sahistory.org.za/place/union-buildings-pretoria" }], P(-25.74, 28.21, "Pretoria, South Africa", "Pretoria"));
e("johannesburg-art-gallery", "south-africa", 1915, null, "1915", "Johannesburg Art Gallery opens its Lutyens building",
  "Lady Phillips drove the project, and the gallery opened to the public in 1915 in a building designed by Sir Edwin Lutyens. Its collection had first been shown in 1910.", 3,
  [W("Johannesburg_Art_Gallery", "Johannesburg Art Gallery"), { t: "Johannesburg Art Gallery — Lutyens Trust", u: "https://www.lutyenstrust.org.uk/?p=1114" }], JHB);
e("de-voortrekkers", "south-africa", 1916.952, null, "December 14, 1916", "De Voortrekkers, early South African feature film, premieres",
  "Made by African Film Productions, based at Africa's first film studio in Johannesburg's Killarney, the silent film on the Great Trek premiered in Krugersdorp. Afrikaners screened it yearly and in classrooms.", 2,
  [W("De_Voortrekkers", "De Voortrekkers"), { t: "A History of the South African Film Industry timeline 1895–2003 — South African History Online", u: "https://sahistory.org.za/article/history-south-african-film-industry-timeline-1895-2003" }], P(-26.1, 27.77, "Krugersdorp, South Africa", "Krugersdorp"));
e("native-life-in-sa", "south-africa", 1916.5, null, "1916", "Sol Plaatje publishes Native Life in South Africa",
  "Written in Britain after the failed 1914 deputation against the Natives Land Act, Plaatje's book was an appeal against the Act. He also produced Setswana-language works and later the novel Mhudi (1930).", 2,
  [{ t: "Solomon Tshekisho Plaatje — South African History Online", u: "https://sahistory.org.za/people/solomon-tshekisho-plaatje" }], JHB);
e("shembe-nazareth", "south-africa", 1911, null, "1910–11", "Isaiah Shembe founds the Nazareth Baptist Church",
  "After a healing ministry begun in 1910, Shembe founded the Zulu church (1911 per SAHO; later accounts say 1913), acquired Ekuphakameni, and composed hymns and sacred dances blending Zulu and Christian forms.", 2,
  [{ t: "Isaiah Mdliwamafa Shembe — South African History Online", u: "https://sahistory.org.za/people/isaiah-mdliwamafa-shembe" }, W("Isaiah_Shembe", "Isaiah Shembe")], P(-29.7, 30.95, "Inanda, South Africa", "Inanda,_KwaZulu-Natal"));
e("mofolo-chaka", "south-africa", 1925.5, null, "1925", "Mofolo's Sesotho novel Chaka is published",
  "Thomas Mofolo's tragic novel of the Zulu king Shaka, written by 1910 and printed at the Morija mission press in Lesotho, is a classic of African literature.", 2,
  [B("topic/Chaka-novel-by-Mofolo", "Chaka"), W("Chaka_(novel)", "Chaka (novel)")], P(-29.62, 27.5, "Morija, Lesotho", "Morija"));

TL.add({ events: ev });
for (const [id, g] of geos) TL.geo(id, g);
