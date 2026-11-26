// Fill-in W2-10: Venezuela, Viceroyalty of Peru, Australia, First Australians, Māori, New Zealand, Polynesians, 1800–1925. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const N = (path, title) => ({ t: `${title} — National Museum of Australia`, u: `https://www.nma.gov.au/defining-moments/resources/${path}` });
const D = (y, m, d) => y + (Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5) + 0.5) / 365;
const G = (id, lat, lon, r, label, slug, scope = "place") => TL.geo("w210-" + id, { scope, lat, lon, r, label, src: `https://en.wikipedia.org/wiki/${slug}` });

TL.add({ events: [
  // ---------- Venezuela ----------
  { id: "w210-ve-abolition-slavery", branch: "venezuela", y: D(1854, 3, 24), when: "March 24, 1854", title: "Venezuela abolishes slavery",
    text: "President José Gregorio Monagas signed the edict declaring Venezuela a nation free of slavery. Historians count the decision among the causes of the Federal War of the 1860s.", imp: 2,
    cites: [W("Jos%C3%A9_Gregorio_Monagas", "José Gregorio Monagas"), B("biography/Jose-Gregorio-Monagas", "José Gregorio Monagas")] },
  { id: "w210-ve-zumaque", branch: "venezuela", y: D(1914, 7, 31), when: "July 31, 1914", title: "Zumaque I, Venezuela's first commercial oil well",
    text: "Drilled by the Caribbean Petroleum Company at Mene Grande near Lake Maracaibo, the well was declared commercially useful at 264 barrels a day, opening Venezuela's oil era.", imp: 2,
    cites: [W("Zumaque_I", "Zumaque I")] },

  // ---------- Viceroyalty of Peru ----------
  { id: "w210-vp-cemetery", branch: "viceroyalty-peru", y: D(1808, 5, 31), when: "May 31, 1808", title: "Lima opens the Presbítero Maestro cemetery",
    text: "Viceroy Abascal inaugurated a walled general cemetery designed by the priest Matías Maestro, ending burial inside Lima's churches. It is often called the oldest in Latin America.", imp: 3,
    cites: [{ t: "El Presbítero Maestro cumple 216 años — Andina", u: "https://andina.pe/agencia/noticia-el-presbitero-maestro-cumple-216-anos-como-cementerio-mas-antiguo-america-latina-987586.aspx" }, W("Cementerio_Presb%C3%ADtero_Mat%C3%ADas_Maestro", "Cementerio Presbítero Matías Maestro")] },
  { id: "w210-vp-guaqui", branch: "viceroyalty-peru", y: D(1811, 6, 20), when: "June 20, 1811", title: "Royalists win at Guaqui and hold Upper Peru",
    text: "General Goyeneche, sent by Viceroy Abascal, routed the Buenos Aires army on the Desaguadero. The victory returned Upper Peru (now Bolivia) to royalist control for years to come.", imp: 2,
    cites: [W("Battle_of_Huaqui", "Battle of Huaqui"), W("Jos%C3%A9_Fernando_de_Abascal_y_Sousa", "José Fernando de Abascal y Sousa")] },
  { id: "w210-vp-cusco-1814", branch: "viceroyalty-peru", y: D(1814, 8, 3), end: D(1815, 3, 25), when: "August 3, 1814 – March 25, 1815", title: "Cuzco rebellion of the Angulo brothers and Pumacahua",
    text: "Creole officers and the Indigenous curaca Mateo Pumacahua set up a Cuzco junta and drew more than 20,000 Indigenous supporters. Royalists defeated it at Umachiri and executed its leaders.", imp: 2,
    cites: [W("Cuzco_Rebellion_of_1814", "Cuzco Rebellion of 1814"), { t: "Pumacahua Rebellion — Encyclopedia.com", u: "https://www.encyclopedia.com/humanities/encyclopedias-almanacs-transcripts-and-maps/pumacahua-rebellion" }] },
  { id: "w210-vp-lima-independence", branch: "viceroyalty-peru", y: D(1821, 7, 28), when: "July 28, 1821", title: "San Martín proclaims Peru independent in Lima",
    text: "After taking Lima, José de San Martín proclaimed independence and became protector. The viceregal government retreated to Cusco, and royalist resistance lasted until its defeat in 1824.", imp: 2, link: "peru",
    cites: [B("biography/Jose-de-San-Martin", "José de San Martín"), W("Peruvian_War_of_Independence", "Peruvian War of Independence")] },

  // ---------- Australia ----------
  { id: "w210-au-kelly-gang", branch: "australia", y: D(1906, 12, 26), when: "December 26, 1906", title: "The Story of the Kelly Gang premieres in Melbourne",
    text: "Charles Tait's film, thought to be the world's first feature-length narrative movie, drew crowds across the country. About a quarter of it survives and it is on UNESCO's Australian Memory of the World register.", imp: 2,
    cites: [{ t: "The Story of the Kelly Gang — National Film and Sound Archive of Australia", u: "https://www.nfsa.gov.au/stories/articles/story-kelly-gang" }] },
  { id: "w210-au-my-country", branch: "australia", y: D(1908, 9, 5), when: "September 5, 1908", title: "Dorothea Mackellar's “My Country” appears in London",
    text: "The poem, written about 1904, ran in the London Spectator as “Core of My Heart.” It appeared several times in Australia, then as “My Country” in her 1911 book, The Closed Door.", imp: 3,
    cites: [{ t: "Isobel Marion Dorothea Mackellar — Australian Dictionary of Biography", u: "https://adb.anu.edu.au/biography/mackellar-isobel-marion-dorothea-7383" }] },
  { id: "w210-au-labor-majority", branch: "australia", y: D(1910, 4, 13), when: "April 13, 1910", title: "Labor wins Australia's first federal majority government",
    text: "Andrew Fisher's Labor Party won a House majority and control of the Senate, the first time one party held both houses. His governments sponsored major social welfare, economic development and defense laws.", imp: 2,
    cites: [W("1910_Australian_federal_election", "1910 Australian federal election"), B("biography/Andrew-Fisher", "Andrew Fisher")] },
  { id: "w210-au-mawson-aae", branch: "australia", y: 1911, end: 1914, when: "1911–1914", title: "Mawson leads the Australasian Antarctic Expedition",
    text: "Douglas Mawson's expedition built its main base at Cape Denison, charted some 3,000 km of unmapped coastline and used radio successfully on the continent for the first time.", imp: 2,
    cites: [N("mawson-in-the-antarctic", "Mawson in the Antarctic"), W("Australasian_Antarctic_Expedition", "Australasian Antarctic Expedition")] },
  { id: "w210-au-canberra-named", branch: "australia", y: D(1913, 3, 12), when: "March 12, 1913", title: "Lady Denman names Canberra",
    text: "On Capital Hill the Governor-General's wife announced the name of the new national capital. Work on the city, later designed by Walter Burley Griffin, then began, though both world wars slowed it.", imp: 2,
    cites: [N("founding-of-canberra", "Founding of Canberra")] },
  { id: "w210-au-anzac-landing", branch: "australia", y: D(1915, 4, 25), when: "April 25, 1915", title: "Australian troops land at Anzac Cove",
    text: "About 16,000 Australians and New Zealanders landed at Gallipoli; by evening 2,000 were dead or wounded. A military failure, it became central to Australian ideas of national character, remembered each Anzac Day.", imp: 2, link: "ottoman",
    cites: [N("gallipoli-landing", "Gallipoli landing"), B("topic/Anzac", "ANZAC")] },
  { id: "w210-au-qantas", branch: "australia", y: D(1920, 11, 16), when: "November 16, 1920", title: "Qantas is founded in Queensland",
    text: "Former Australian Flying Corps pilots Hudson Fysh and Paul McGinness, with Fergus McMaster, formed Queensland and Northern Territory Aerial Services, based first in Winton. It began operating in 1922 and became an Australian icon.", imp: 2,
    cites: [N("qantas-established", "Qantas established"), W("Qantas", "Qantas")] },

  // ---------- First Australians ----------
  { id: "w210-fa-pemulwuy", branch: "first-australians", y: D(1802, 6, 2), when: "c. June 2, 1802", title: "Pemulwuy, Bidjigal resistance leader, is killed",
    text: "Pemulwuy had led raids against Sydney's settlers from 1792 and survived serious wounding in 1797. He was shot dead in 1802 and his head sent to Joseph Banks in England.", imp: 2,
    cites: [N("pemulwuy", "Pemulwuy")] },
  { id: "w210-fa-appin", branch: "first-australians", y: D(1816, 4, 17), when: "April 17, 1816", title: "Soldiers attack a camp at Appin",
    text: "Soldiers under Captain Wallis, sent by Governor Macquarie after attacks on settlers, raided an Aboriginal camp and killed at least 14 people; some fled over cliffs. It is described as a military massacre.", imp: 2,
    cites: [{ t: "The Appin Massacre — Australian Museum", u: "https://australian.museum/learn/first-nations/unsettled/fighting-wars/appin-massacre/" }, { t: "The Appin massacre – 200 years on — Dictionary of Sydney", u: "https://dictionaryofsydney.org/blog/the_appin_massacre_200_years_on" }, W("Appin_massacre", "Appin massacre")] },
  { id: "w210-fa-black-line", branch: "first-australians", y: D(1830, 10, 7), end: D(1830, 11, 26), when: "October 7 – November 26, 1830", title: "Tasmania's “Black Line” fails to drive out Aboriginal nations",
    text: "Lieutenant-Governor Arthur mobilized some 2,200 soldiers, convicts and settlers to sweep Aboriginal people onto a peninsula. The cordon failed, but the war's pressure led to their removal to Flinders Island.", imp: 2,
    cites: [W("Black_Line", "Black Line"), B("event/Black-War", "Black War")] },
  { id: "w210-fa-myall-creek", branch: "first-australians", y: D(1838, 6, 10), when: "June 10, 1838", title: "Myall Creek massacre and the hanging of seven stockmen",
    text: "Convicts and ex-convicts killed at least 28 Wirrayaraay people at a New South Wales station. Seven men were hanged in December, the first British subjects executed for killing Aboriginal people.", imp: 2,
    cites: [N("myall-creek-massacre", "Myall Creek massacre")] },
  { id: "w210-fa-coranderrk", branch: "first-australians", y: 1863.45, when: "June 1863", title: "Coranderrk reserve founded in Victoria",
    text: "Gazetted as a reserve for Aboriginal people of south-central Victoria, Coranderrk was productive in its early years. Kulin leaders, notably William Barak, led delegations and protests against Board control for decades.", imp: 2,
    cites: [N("coranderrk", "Coranderrk")] },
  { id: "w210-fa-cricket-tour", branch: "first-australians", y: 1868.37, end: 1868.8, when: "May–October 1868", title: "Aboriginal cricketers tour England",
    text: "Thirteen Jardwadjali, Gunditjmara and Wotjobaluk men from western Victoria played 47 matches in England, the first Australian sporting team to tour overseas. Johnny Mullagh was the standout performer.", imp: 2,
    cites: [N("aboriginal-cricket-team", "Aboriginal cricket team")] },
  { id: "w210-fa-truganini", branch: "first-australians", y: D(1876, 5, 8), when: "May 8, 1876", title: "Truganini dies in Hobart",
    text: "The palawa woman who had lived through Tasmania's colonization died at about 64. Her death was widely and wrongly reported as the end of Tasmanian Aboriginal people, whose descendants live on.", imp: 2,
    cites: [B("biography/Truganini", "Truganini"), { t: "Trugernanner (1812–1876) — Australian Dictionary of Biography", u: "https://adb.anu.edu.au/biography/trugernanner-truganini-4752" }] },
  { id: "w210-fa-barak-art", branch: "first-australians", y: 1880, end: 1903.62, when: "1880s – 1903", title: "William Barak paints and draws Wurundjeri ceremony",
    text: "From Coranderrk, the Wurundjeri elder produced drawings and paintings of corroborees in possum-skin cloaks. They preserve Wurundjeri tradition and now hang in Australian and European collections.", imp: 3,
    cites: [W("William_Barak", "William Barak"), B("biography/William-Barak", "William Barak")] },
  { id: "w210-fa-jandamarra", branch: "first-australians", y: 1894.8, end: D(1897, 4, 1), when: "1894 – April 1, 1897", title: "Jandamarra leads Bunuba resistance in the Kimberley",
    text: "A Bunuba police tracker shot a constable and freed prisoners, then resisted for about three years from caves in the Napier and Oscar Ranges. He was shot dead at Tunnel Creek in 1897.", imp: 2,
    cites: [W("Jandamarra", "Jandamarra"), { t: "Jandamarra (1870–1897) — Australian Dictionary of Biography", u: "https://adb.anu.edu.au/biography/jandamarra-8822" }] },
  { id: "w210-fa-nsw-1915", branch: "first-australians", y: 1915.5, when: "1915", title: "NSW amends law to let Board remove Aboriginal children",
    text: "A 1915 amendment to the Aborigines Protection Act let New South Wales's Board assume custody of any Aboriginal child it judged better removed. Thousands of children were taken in what became known as the Stolen Generations.", imp: 2,
    cites: [N("aborigines-protection-act", "Aborigines Protection Act")] },

  // ---------- Māori ----------
  { id: "w210-mi-marsden", branch: "maori", y: D(1814, 12, 25), when: "December 25, 1814", title: "Samuel Marsden preaches at Oihi Bay",
    text: "The Anglican chaplain, with the Ngāpuhi chief Ruatara, held a Christmas service before some 400 Māori, launching the Church Missionary Society's first mission in Aotearoa.", imp: 2,
    cites: [{ t: "2014 Bicentenary of Samuel Marsden's first Sermon with Ruatara in Oihi Bay — Anglican Church in Aotearoa, New Zealand and Polynesia", u: "https://www.anglican.org.nz/News/2014-Bicentenary-of-Samuel-Marsden-s-first-Sermon-with-Ruatara-in-Oihi-Bay-Bay-of-Islands" }, W("Samuel_Marsden", "Samuel Marsden")] },
  { id: "w210-mi-hongi-england", branch: "maori", y: 1820.5, when: "1820", title: "Hongi Hika sails to England with Thomas Kendall",
    text: "The Ngāpuhi chief helped Professor Samuel Lee at Cambridge write a grammar of Māori, then traded many of his English gifts for muskets, which he used in the Musket Wars.", imp: 2,
    cites: [B("biography/Hongi-Hika", "Hongi Hika"), W("Hongi_Hika", "Hongi Hika")] },
  { id: "w210-mi-declaration-1835", branch: "maori", y: D(1835, 10, 28), when: "October 28, 1835", title: "Northern chiefs sign He Whakaputanga",
    text: "Chiefs gathered at Waitangi declared the independence of the “United Tribes of New Zealand” and asked the British king to act as protector. The Crown acknowledged the declaration in 1836.", imp: 2,
    cites: [{ t: "The Declaration of the Independence of New Zealand — Archives New Zealand", u: "https://www.archives.govt.nz/discover-our-stories/the-declaration-of-independence-of-new-zealand" }, W("Declaration_of_the_Independence_of_New_Zealand", "Declaration of the Independence of New Zealand")] },
  { id: "w210-mi-kingitanga", branch: "maori", y: 1858.45, when: "June 1858", title: "Pōtatau Te Wherowhero is crowned the first Māori king",
    text: "Waikato and allied iwi crowned him at Ngāruawāhia to unite Māori, make laws and halt the loss of land. The Kīngitanga became the center of resistance to colonial expansion and endures today.", imp: 2,
    cites: [W("M%C4%81ori_King_Movement", "Māori King Movement"), B("topic/Maori-King-Movement", "Māori King Movement")] },
  { id: "w210-mi-waikato-war", branch: "maori", y: D(1863, 7, 12), end: 1864.25, when: "July 1863 – April 1864", title: "Government forces invade the Waikato",
    text: "Troops crossed the Mangatāwhiri Stream to break the Kīngitanga. The war ended with Māori defeats at Rangiriri and Ōrākau and the confiscation of vast tracts of Waikato land.", imp: 2, link: "new-zealand",
    cites: [B("event/Waikato-War", "Waikato War"), W("Invasion_of_the_Waikato", "Invasion of the Waikato")] },
  { id: "w210-mi-parihaka", branch: "maori", y: D(1881, 11, 5), when: "November 5, 1881", title: "Troops occupy Parihaka",
    text: "About 1,600 troops entered the Taranaki village of prophets Te Whiti and Tohu, who had led peaceful resistance to land confiscation. Children met them with song and food; the leaders were arrested and the village was destroyed.", imp: 2, link: "new-zealand",
    cites: [{ t: "Parihaka: Remembering a legacy of peaceful resistance — RNZ", u: "https://www.rnz.co.nz/news/te-ao-maori/532913/parihaka-remembering-a-legacy-of-peaceful-resistance" }, W("Parihaka", "Parihaka")] },
  { id: "w210-mi-tongariro-gift", branch: "maori", y: D(1887, 9, 23), when: "September 23, 1887", title: "Te Heuheu conveys the Tongariro peaks to the Crown",
    text: "Ngāti Tūwharetoa chief Horonuku Te Heuheu Tukino IV protected the volcanic summits by a tuku, conveyed to the Crown. It became the core of Tongariro National Park, later a dual World Heritage site.", imp: 2,
    cites: [{ t: "History and culture: Tongariro National Park — Department of Conservation", u: "https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/about-tongariro-national-park/history-and-culture/" }, W("Tongariro_National_Park", "Tongariro National Park")] },
  { id: "w210-mi-tohunga-act", branch: "maori", y: D(1907, 9, 24), when: "September 24, 1907", title: "Tohunga Suppression Act targets Māori healers",
    text: "Introduced by James Carroll and backed by all four Māori MPs, the Act made it an offense to profess supernatural powers to cure disease. It was partly aimed at the prophet Rua Kenana and stayed law until 1962.", imp: 2,
    cites: [{ t: "Tohunga Suppression Act 1907 — New Zealand Legislation", u: "https://www.legislation.govt.nz/act/public/1907/13/en/latest/" }, W("Tohunga_Suppression_Act_1907", "Tohunga Suppression Act 1907")] },

  // ---------- New Zealand ----------
  { id: "w210-nz-constitution-1852", branch: "new-zealand", y: D(1852, 6, 30), when: "June 30, 1852", title: "New Zealand Constitution Act grants self-government",
    text: "The British act created six provinces and a General Assembly. In force from 1853, it gave settlers representative government; the first Parliament met in Auckland in 1854.", imp: 2,
    cites: [W("New_Zealand_Constitution_Act_1852", "New Zealand Constitution Act 1852"), B("topic/history-of-New-Zealand", "History of New Zealand")] },
  { id: "w210-nz-gabriels-gully", branch: "new-zealand", y: D(1861, 5, 25), when: "May 25, 1861", title: "Gabriel Read finds gold in Otago",
    text: "His strike at Gabriels Gully started the colony's first major gold rush. Otago became the richest and most populous province, and Dunedin boomed.", imp: 2,
    cites: [{ t: "History of Gabriels Gully — Department of Conservation", u: "https://www.doc.govt.nz/parks-and-recreation/places-to-go/otago/places/gabriels-gully-historic-reserve/things-to-do/history-of-gabriels-gully/" }, W("Gabriel%27s_Gully", "Gabriel's Gully")] },
  { id: "w210-nz-tarawera", branch: "new-zealand", y: D(1886, 6, 10), when: "June 10, 1886", title: "Mount Tarawera erupts, burying Te Wairoa",
    text: "The night eruption opened a 17 km rift, killed an estimated 120 people, nearly all Māori, and destroyed the Pink and White Terraces, a major tourist attraction.", imp: 2,
    cites: [{ t: "Eruption of Mt Tarawera — University of Waikato (O Nehera)", u: "https://onehera.waikato.ac.nz/nodes/view/5279" }, W("1886_eruption_of_Mount_Tarawera", "1886 eruption of Mount Tarawera")] },
  { id: "w210-nz-originals", branch: "new-zealand", y: D(1905, 12, 16), when: "December 16, 1905", title: "The Originals lose to Wales at Cardiff",
    text: "The first New Zealand rugby side to tour Britain won almost every match but lost 3–0 to Wales after referee Dallas disallowed Bob Deans's try, a dispute still remembered in both countries.", imp: 3,
    cites: [{ t: "Barnes to mark 100th Test with whistle from famous 1905 match — All Blacks", u: "https://www.allblacks.com/news/barnes-to-mark-100th-test-with-whistle-from-famous-1905-match" }] },
  { id: "w210-nz-rutherford-nobel", branch: "new-zealand", y: 1908.94, when: "1908", title: "Ernest Rutherford wins the Nobel Prize in Chemistry",
    text: "The New Zealand-born physicist, educated at Canterbury College, was honored for his work on radioactivity. He later split the atom and was raised to the peerage as Lord Rutherford of Nelson.", imp: 2,
    cites: [B("biography/Ernest-Rutherford", "Ernest Rutherford")] },
  { id: "w210-nz-great-strike", branch: "new-zealand", y: D(1913, 10, 19), end: 1914.04, when: "October 19, 1913 – January 1914", title: "Great Strike convulses the waterfront",
    text: "A miners' and waterfront dispute escalated into a near general strike. Mounted special constables, nicknamed “Massey's Cossacks,” took the Wellington wharves, and the strike ended in defeat for the unions.", imp: 2,
    cites: [B("biography/William-Ferguson-Massey", "William Ferguson Massey"), W("1913_Great_Strike", "1913 Great Strike")] },

  // ---------- Polynesians ----------
  { id: "w210-pl-kamehameha-unites", branch: "polynesians", y: 1810.5, when: "1810", title: "Kamehameha I unites the Hawaiian Islands",
    text: "After conquests ending in 1795 left only Kauaʻi and Niʻihau outside his rule, those islands were ceded peacefully in 1810. He founded the dynasty that governed the kingdom for the century.", imp: 1,
    cites: [B("biography/Kamehameha-I", "Kamehameha I")] },
  { id: "w210-pl-ai-noa", branch: "polynesians", y: 1819.8, when: "October 1819", title: "ʻAi Noa: Hawaiians break the kapu",
    text: "After Kamehameha I died, his son Liholiho ate with women, and messengers announced that eating was free. The kapu system fell, and the first missionaries arrived in 1820.", imp: 2,
    cites: [W("%CA%BBAi_Noa", "ʻAi Noa"), B("biography/Kamehameha-II", "Kamehameha II")] },
  { id: "w210-pl-hawaiian-print", branch: "polynesians", y: D(1822, 1, 7), when: "January 7, 1822", title: "First printing in Hawaiian",
    text: "Missionaries and Hawaiian teachers fitted a Latin alphabet to the language and printed in it. Literacy spread fast, and Hawaiian-language newspapers followed from 1834.", imp: 3,
    cites: [W("Hawaiian_language", "Hawaiian language"), B("biography/Kamehameha-II", "Kamehameha II")] },
  { id: "w210-pl-tahiti-protectorate", branch: "polynesians", y: 1842.7, when: "1842", title: "France imposes a protectorate on Tahiti",
    text: "After Queen Pōmare IV expelled two French Catholic missionaries in 1836, French naval pressure forced her and the chiefs to accept a protectorate. Resistance became the Franco-Tahitian War, 1844–47.", imp: 2, link: "france",
    cites: [B("place/French-Polynesia/History", "French Polynesia"), W("Franco-Tahitian_War", "Franco-Tahitian War")] },
  { id: "w210-pl-tupou-king", branch: "polynesians", y: 1845.9, when: "1845", title: "Taufaʻāhau becomes King George Tupou I of Tonga",
    text: "A Christian convert and warrior-chief took the Tuʻi Kanokupolu title and unified Tonga. During his reign, which lasted to 1893, Tonga became unified and independent, with a constitution adopted in 1875.", imp: 2,
    cites: [B("biography/George-Tupou-I", "George Tupou I")] },
  { id: "w210-pl-mahele", branch: "polynesians", y: D(1848, 3, 7), when: "March 7, 1848", title: "The Great Māhele divides Hawaiian land",
    text: "The king and some 245 chiefs divided Hawaiian land into crown, government and chiefly holdings, ending the feudal system. Few commoners made claims, and much land later passed to foreign settlers and planters.", imp: 2,
    cites: [{ t: "Land in Hawaiʻi — Hawaiʻi Department of Commerce and Consumer Affairs", u: "https://files.hawaii.gov/dcca/reb/real_ed/re_ed/ce_prelic/land_in_hawaii.pdf" }, W("Great_M%C4%81hele", "Great Māhele")] },
  { id: "w210-pl-rapanui-raids", branch: "polynesians", y: 1862.95, end: 1863.5, when: "December 1862 onward", title: "Peruvian slavers raid Rapa Nui",
    text: "Raiders abducted about 1,500 people, roughly half the island. The few survivors who returned brought smallpox, and the population fell to 111 by 1877.", imp: 2,
    cites: [B("place/Easter-Island/People", "Easter Island"), W("Easter_Island", "Easter Island")] },
  { id: "w210-pl-tonga-constitution", branch: "polynesians", y: D(1875, 11, 4), when: "November 4, 1875", title: "Tonga's constitution enacted",
    text: "King George Tupou I enacted a constitution with a declaration of rights, a legislature and a hereditary nobility, drafted partly with missionary Shirley Baker. Tonga marks it as Constitution Day.", imp: 2,
    cites: [W("Constitution_of_Tonga", "Constitution of Tonga"), B("place/Tonga", "Tonga")] },
  { id: "w210-pl-kalakaua-coronation", branch: "polynesians", y: D(1883, 2, 12), when: "February 12, 1883", title: "Kalākaua's coronation revives hula at ʻIolani Palace",
    text: "King Kalākaua staged a coronation that returned hula and chant to public life. His reign, called the first Hawaiian Renaissance, also saw the Kumulipo published and ʻIolani Palace built.", imp: 2,
    cites: [W("Kal%C4%81kaua", "Kalākaua"), B("place/Iolani-Palace", "Iolani Palace")] },
  { id: "w210-pl-gauguin-tahiti", branch: "polynesians", y: 1891.4, when: "1891", title: "Gauguin sails to Tahiti",
    text: "The French painter left for a self-imposed exile in Tahiti and painted Tahitian subjects. He later moved to the Marquesas, where he died in 1903.", imp: 3, link: "france",
    cites: [B("biography/Paul-Gauguin", "Paul Gauguin"), W("Paul_Gauguin", "Paul Gauguin")] },
  { id: "w210-pl-hawaii-overthrow", branch: "polynesians", y: D(1893, 1, 17), when: "January 17, 1893", title: "Queen Liliʻuokalani is overthrown",
    text: "A committee of mostly foreign-born residents, backed by about 162 U.S. Marines and sailors, deposed the last monarch of Hawaiʻi. A provisional government followed; annexation came in 1898.", imp: 2, link: "usa",
    cites: [W("Overthrow_of_the_Hawaiian_Kingdom", "Overthrow of the Hawaiian Kingdom"), B("biography/Liliuokalani", "Liliuokalani")] },
  { id: "w210-pl-duke-kahanamoku", branch: "polynesians", y: 1912.55, when: "1912", title: "Duke Kahanamoku wins Olympic gold in Stockholm",
    text: "The Hawaiian swimmer won the 100-meter freestyle, repeated the feat in 1920 and became one of the icons of surfing.", imp: 3,
    cites: [B("biography/Duke-Kahanamoku", "Duke Kahanamoku")] },
] });

G("ve-abolition-slavery", 10.5, -66.92, 400, "Venezuela", "Venezuela", "region");
G("ve-zumaque", 9.82, -70.92, 40, "Mene Grande, Venezuela", "Mene_Grande");
G("vp-cemetery", -12.05, -77.04, 30, "Lima, Peru", "Lima");
G("vp-guaqui", -16.6, -68.85, 40, "Guaqui, Bolivia", "Guaqui");
G("vp-cusco-1814", -13.52, -71.97, 60, "Cusco, Peru", "Cusco");
G("vp-lima-independence", -12.05, -77.04, 30, "Lima, Peru", "Lima");
G("au-kelly-gang", -37.81, 144.96, 40, "Melbourne, Australia", "Melbourne");
G("au-my-country", -25.0, 134.0, 2000, "Australia", "Australia", "region");
G("au-labor-majority", -25.0, 134.0, 2000, "Australia", "Australia", "region");
G("au-mawson-aae", -67.0, 142.67, 300, "Cape Denison, Antarctica", "Cape_Denison", "region");
G("au-canberra-named", -35.31, 149.12, 30, "Canberra, Australia", "Canberra");
G("au-anzac-landing", 40.24, 26.28, 40, "Anzac Cove, Gallipoli, Turkey", "Anzac_Cove");
G("au-qantas", -22.39, 143.04, 60, "Winton, Queensland", "Winton,_Queensland");
G("fa-pemulwuy", -33.82, 151.0, 60, "Parramatta, New South Wales", "Parramatta");
G("fa-appin", -34.2, 150.79, 40, "Appin, New South Wales", "Appin,_New_South_Wales");
G("fa-black-line", -42.0, 147.0, 150, "Tasmania", "Tasmania", "region");
G("fa-myall-creek", -29.5, 150.9, 60, "Myall Creek, New South Wales", "Bingara,_New_South_Wales");
G("fa-coranderrk", -37.65, 145.53, 40, "Healesville, Victoria", "Healesville");
G("fa-cricket-tour", 51.5, -0.12, 400, "England", "England", "region");
G("fa-truganini", -42.88, 147.33, 40, "Hobart, Tasmania", "Hobart");
G("fa-barak-art", -37.65, 145.53, 40, "Healesville, Victoria", "Healesville");
G("fa-jandamarra", -17.4, 125.2, 80, "Tunnel Creek, Kimberley", "Windjana_Gorge_National_Park");
G("fa-nsw-1915", -33.87, 151.21, 600, "New South Wales", "New_South_Wales", "region");
G("mi-marsden", -35.2, 174.0, 40, "Rangihoua Bay, Bay of Islands", "Rangihoua");
G("mi-hongi-england", -35.3, 174.1, 120, "Bay of Islands, New Zealand", "Bay_of_Islands", "region");
G("mi-declaration-1835", -35.27, 174.08, 40, "Waitangi, Bay of Islands", "Waitangi,_New_Zealand");
G("mi-kingitanga", -37.67, 175.15, 50, "Ngāruawāhia, Waikato", "Ng%C4%81ruaw%C4%81hia");
G("mi-waikato-war", -37.6, 175.1, 80, "Waikato, New Zealand", "Waikato", "region");
G("mi-parihaka", -39.3, 173.85, 40, "Parihaka, Taranaki", "Parihaka");
G("mi-tongariro-gift", -39.13, 175.64, 50, "Tongariro National Park", "Tongariro_National_Park");
G("mi-tohunga-act", -41.29, 174.78, 40, "Wellington, New Zealand", "Wellington");
G("nz-constitution-1852", -36.85, 174.76, 40, "Auckland, New Zealand", "Auckland");
G("nz-gabriels-gully", -45.9, 169.7, 40, "Gabriels Gully, Otago", "Gabriel%27s_Gully");
G("nz-tarawera", -38.23, 176.5, 50, "Mount Tarawera, New Zealand", "Mount_Tarawera");
G("nz-originals", 51.48, -3.18, 40, "Cardiff, Wales", "Cardiff");
G("nz-rutherford-nobel", -41.27, 173.28, 40, "Nelson, New Zealand", "Nelson,_New_Zealand");
G("nz-great-strike", -41.29, 174.78, 40, "Wellington, New Zealand", "Wellington");
G("pl-kamehameha-unites", 21.3, -157.86, 300, "Hawaiian Islands", "Hawaii", "region");
G("pl-ai-noa", 19.64, -155.99, 60, "Kailua-Kona, Hawaiʻi", "Kailua-Kona,_Hawaii");
G("pl-hawaiian-print", 21.31, -157.86, 40, "Honolulu, Hawaiʻi", "Honolulu");
G("pl-tahiti-protectorate", -17.65, -149.45, 80, "Tahiti", "Tahiti", "region");
G("pl-tupou-king", -21.14, -175.2, 80, "Tongatapu, Tonga", "Tongatapu", "region");
G("pl-mahele", 21.31, -157.86, 40, "Honolulu, Hawaiʻi", "Honolulu");
G("pl-rapanui-raids", -27.11, -109.35, 40, "Easter Island", "Easter_Island", "region");
G("pl-tonga-constitution", -21.14, -175.2, 80, "Tongatapu, Tonga", "Tongatapu", "region");
G("pl-kalakaua-coronation", 21.31, -157.86, 40, "ʻIolani Palace, Honolulu", "%CA%BBIolani_Palace");
G("pl-gauguin-tahiti", -17.53, -149.57, 60, "Papeete, Tahiti", "Papeete");
G("pl-hawaii-overthrow", 21.31, -157.86, 40, "Honolulu, Hawaiʻi", "Honolulu");
G("pl-duke-kahanamoku", 59.33, 18.07, 40, "Stockholm, Sweden", "Stockholm");
