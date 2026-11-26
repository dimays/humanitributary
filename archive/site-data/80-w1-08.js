// W1-08 fill: Tunisia, Afghanistan, British Raj, ASEAN, Cambodia, Dutch East Indies, French Indochina, Kazakhstan, Korean Empire & Japanese rule, Malaysia, North Korea, Singapore, 1925-present. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };
TL.add({ events: [
  // Tunisia
  { id: "w108-tn-jericho-speech", branch: "tunisia", y: D(1965, 3, 3), when: "March 3, 1965", imp: 2, link: "israel",
    title: "Bourguiba's Jericho speech on Palestine",
    text: "On a Middle East tour, Tunisia's president recalled in a Jericho speech that the Arab policy of “all or nothing” had led Palestine to defeat, defying Nasser. Weeks later he proposed peace talks based on the 1947 UN partition.",
    cites: [W("Habib_Bourguiba", "Habib Bourguiba"), { t: "President of Tunisia Reiterates Call for Arab-Israeli Peace Talks — Jewish Telegraphic Agency", u: "https://www.jta.org/archive/president-of-tunisia-reiterates-call-for-arab-israeli-peace-talks" }] },
  { id: "w108-tn-carthage-film-festival", branch: "tunisia", y: D(1966, 12, 4), when: "December 4, 1966", imp: 3,
    title: "Carthage Film Festival founded",
    text: "Conceived by filmmaker Tahar Cheriaa and launched by Culture Minister Chedli Klibi, the first Journées cinématographiques de Carthage opened in Tunis to showcase Arab and African cinema. Ousmane Sembène won the first Tanit d'or.",
    cites: [W("Carthage_Film_Festival", "Carthage Film Festival"), { t: "Tahar Cheriaa: Chronicles of a Pan-African Pioneer — Metrograph", u: "https://metrograph.com/tahar-cheriaa/" }] },
  { id: "w108-tn-djerba-union", branch: "tunisia", y: D(1974, 1, 11), when: "January 1974", imp: 3,
    title: "Djerba Declaration: Tunisia–Libya union announced",
    text: "Bourguiba and Libya's Muammar Gaddafi, meeting on Djerba, agreed to merge into an Arab Islamic Republic with one constitution, army and flag. Bourguiba soon repudiated the plan, and the union never took shape.",
    cites: [W("Djerba_Declaration", "Djerba Declaration"), { t: "Libya and Arab Unity — Library of Congress Country Studies (Libya)", u: "https://countrystudies.us/libya/32.htm" }] },
  { id: "w108-tn-wsis-tunis", branch: "tunisia", y: D(2005, 11, 16), end: D(2005, 11, 18), when: "November 16–18, 2005", imp: 3,
    title: "Tunis hosts the World Summit on the Information Society",
    text: "Tunis held the second phase of the UN-backed summit on the information society and the digital divide, after the Geneva phase of 2003. Tunisia had proposed the summit to the ITU in 1998.",
    cites: [{ t: "World Summit on the Information Society — International Telecommunication Union", u: "https://www.itu.int/net/wsis/" }, W("World_Summit_on_the_Information_Society", "World Summit on the Information Society")] },
  { id: "w108-tn-nobel-quartet", branch: "tunisia", y: 2015.77, when: "October 2015", imp: 2,
    title: "National Dialogue Quartet wins the Nobel Peace Prize",
    text: "The Nobel Committee honored the Tunisian National Dialogue Quartet “for its decisive contribution to the building of a pluralistic democracy in Tunisia in the wake of the Jasmine Revolution of 2011.”",
    cites: [{ t: "The Nobel Peace Prize 2015 — NobelPrize.org", u: "https://www.nobelprize.org/prizes/peace/2015/summary/" }, { t: "The Nobel Peace Prize 2015 – Press release — NobelPrize.org", u: "https://www.nobelprize.org/prizes/peace/2015/press-release/" }] },

  // Afghanistan
  { id: "w108-af-last-soviet-column", branch: "afghanistan", y: D(1989, 2, 15), when: "February 15, 1989", imp: 2, link: "ussr",
    title: "Last Soviet column leaves Afghanistan",
    text: "Under the 1988 Geneva Accords, the final Soviet military column crossed into the Uzbek SSR, ending nearly ten years of occupation. The mujahideen were not party to the accords and the civil war went on.",
    cites: [W("Soviet%E2%80%93Afghan_War", "Soviet–Afghan War"), { t: "The Geneva Accords, 1987-89 — Library of Congress Country Studies (Afghanistan)", u: "https://countrystudies.us/afghanistan/97.htm" }, { t: "Soviet Withdrawal from Afghanistan, 1989 — National Security Archive", u: "https://nsarchive.gwu.edu/briefing-book/afghanistan-russia-programs/2019-02-27/soviet-withdrawal-afghanistan-1989" }] },

  // British Raj
  { id: "w108-raj-simon-commission", branch: "british-raj", y: D(1927, 11, 8), when: "November 1927", imp: 2,
    title: "All-British Simon Commission appointed",
    text: "Britain named a parliamentary commission under Sir John Simon to review India's constitution, with no Indian member. The omission set off boycotts and “Simon go back” protests when it arrived in 1928.",
    cites: [W("Simon_Commission", "Simon Commission"), { t: "Simon Commission — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/Simon-Commission" }] },
  { id: "w108-raj-raman-effect", branch: "british-raj", y: D(1928, 2, 28), when: "February 28, 1928", imp: 2,
    title: "C. V. Raman discovers the Raman effect",
    text: "Working in Calcutta, Raman found that a small part of light scattered by a substance changes wavelength. The discovery earned him the 1930 Nobel Prize in Physics.",
    cites: [{ t: "Sir Venkata Raman – Biographical — NobelPrize.org", u: "https://www.nobelprize.org/prizes/physics/1930/raman/biographical/" }, { t: "Sir Venkata Raman – Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/physics/1930/raman/facts/" }, W("C._V._Raman", "C. V. Raman")] },
  { id: "w108-raj-alam-ara", branch: "british-raj", y: D(1931, 3, 14), when: "March 14, 1931", imp: 2,
    title: "Alam Ara, India's first sound film",
    text: "Ardeshir Irani's fantasy about a prince and a gypsy girl premiered in Bombay as India's first talkie. It brought songs and playback singing into Indian cinema; no complete print survives.",
    cites: [W("Alam_Ara", "Alam Ara"), { t: "Alam Ara: The first sound film — The Quint", u: "https://www.thequint.com/entertainment/indian-cinema/alam-ara-first-indian-sound-film" }, { t: "India's first talkie, not a glorious affair — The Tribune", u: "https://www.tribuneindia.com/news/anniversary/indias-first-talkie-not-a-glorious-affair" }] },
  { id: "w108-raj-government-of-india-act", branch: "british-raj", y: D(1935, 8, 2), when: "August 2, 1935", imp: 2,
    title: "Government of India Act of 1935",
    text: "Parliament ended dyarchy in the provinces, widened the electorate from about 5 million to 35 million, and provided for an all-India federation. Governors kept strong reserve powers; the federal part never came into force.",
    cites: [{ t: "Government of India Act 1935 (enacted text) — legislation.gov.uk", u: "https://www.legislation.gov.uk/ukpga/Geo5and1Edw8/26/2/enacted" }, W("Government_of_India_Act_1935", "Government of India Act 1935")] },
  { id: "w108-raj-progressive-writers", branch: "british-raj", y: D(1936, 4, 9), end: D(1936, 4, 10), when: "April 9–10, 1936", imp: 3,
    title: "Progressive Writers' Association formed in Lucknow",
    text: "Led by Sajjad Zaheer, writers met in Lucknow to found the All-India Progressive Writers' Association, which pressed for social reform and independence through literature. Dawn calls it one of the subcontinent's most influential literary movements.",
    cites: [W("Progressive_Writers%27_Movement", "Progressive Writers' Movement"), { t: "Progressive Writers' Association — South Asian Britain: Connecting Histories", u: "https://southasianbritain.org/organizations/progressive-writers-association/" }, { t: "The rise and fall of the Progressive Writers' Movement — Dawn", u: "https://www.dawn.com/news/1744128" }] },
  { id: "w108-raj-simla-conference", branch: "british-raj", y: D(1945, 6, 25), end: D(1945, 7, 14), when: "June 25 – July 14, 1945", imp: 2,
    title: "Simla Conference fails over Muslim representation",
    text: "Viceroy Wavell convened Indian leaders at Simla to form a new executive council. Talks broke down when the Muslim League insisted on naming all Muslim members and Congress refused.",
    cites: [W("Simla_Conference", "Simla Conference"), { t: "Turning point in Simla 1945 — The Friday Times", u: "https://thefridaytimes.com/06-Jul-2018/turning-point-in-simla-1945" }] },

  // ASEAN
  { id: "w108-asean-zopfan", branch: "asean", y: D(1971, 11, 27), when: "November 27, 1971", imp: 3,
    title: "ZOPFAN declaration signed in Kuala Lumpur",
    text: "ASEAN's foreign ministers declared the aim of making Southeast Asia a Zone of Peace, Freedom and Neutrality, free of outside interference. It was a political statement rather than a treaty.",
    cites: [W("Zone_of_Peace,_Freedom_and_Neutrality", "Zone of Peace, Freedom and Neutrality"), { t: "Treaty on the Southeast Asia Nuclear Weapon-Free Zone — ASEAN Main Portal", u: "https://asean.org/treaty-on-the-southeast-asia-nuclear-weapon-free-zone/" }] },
  { id: "w108-asean-china-fta", branch: "asean", y: D(2010, 1, 1), when: "January 1, 2010", imp: 3,
    title: "ASEAN–China Free Trade Area takes effect",
    text: "Tariffs on most goods fell to zero among ASEAN's six original members and China, and the area became the world's largest free trade area by population. The newer members were to follow by 2015.",
    cites: [W("ASEAN%E2%80%93China_Free_Trade_Area", "ASEAN–China Free Trade Area"), { t: "Backgrounder: ASEAN-China Free Trade Area — Global Times", u: "https://www.globaltimes.cn/content/816206.shtml" }] },

  // Cambodia
  { id: "w108-kh-olympic-stadium", branch: "cambodia", y: 1964.5, when: "1964", imp: 3,
    title: "Vann Molyvann's Olympic Stadium opens in Phnom Penh",
    text: "Cambodia's modernist State Architect designed the stadium in under two years for the 1963 Southeast Asian Peninsular Games, which went to Indonesia. It was inaugurated in 1964 and became his best-known work.",
    cites: [{ t: "Modernist stadium in Cambodia captured in new photos by Virgile Simon Bertrand — Dezeen", u: "https://www.dezeen.com/2016/09/13/the-national-sports-complex-phnom-penh-1964-vann-molyvann-virgile-simon-bertrand/" }, W("Vann_Molyvann", "Vann Molyvann")] },
  { id: "w108-kh-cgdk", branch: "cambodia", y: D(1982, 6, 22), when: "June 22, 1982", imp: 2,
    title: "Resistance forms a coalition government in exile",
    text: "In Kuala Lumpur, Sihanouk's royalists, Son Sann's KPNLF and the Khmer Rouge formed the Coalition Government of Democratic Kampuchea against Vietnam's occupation. Sihanouk became president and Son Sann prime minister.",
    cites: [W("Coalition_Government_of_Democratic_Kampuchea", "Coalition Government of Democratic Kampuchea"), { t: "Coalition Government of Democratic Kampuchea — Library of Congress Country Studies (Cambodia)", u: "https://countrystudies.us/cambodia/72.htm" }] },
  { id: "w108-kh-1997-coup", branch: "cambodia", y: D(1997, 7, 5), end: D(1997, 7, 6), when: "July 5–6, 1997", imp: 2,
    title: "Hun Sen ousts co-premier Ranariddh",
    text: "Fighting in Phnom Penh left Hun Sen's forces in control and Prince Ranariddh's FUNCINPEC troops routed; dozens were killed. Hun Sen's consolidation of power dates from this coup.",
    cites: [W("1997_Cambodian_coup_d%27%C3%A9tat", "1997 Cambodian coup d'état"), { t: "The July 5–6 Coup — Human Rights Watch", u: "https://www.hrw.org/legacy/reports/1997/cambodia/Cambodia-02.htm" }] },
  { id: "w108-kh-preah-vihear-unesco", branch: "cambodia", y: D(2008, 7, 7), when: "July 7, 2008", imp: 2,
    title: "Preah Vihear listed as a World Heritage Site",
    text: "UNESCO inscribed the Khmer temple on the Thai border, a goal Cambodia had pursued since 2001. A military build-up followed in July 2008, with armed clashes in later years.",
    cites: [{ t: "UNESCO status for Cambodian temple — Al Jazeera", u: "https://www.aljazeera.com/news/2008/7/8/unesco-status-for-cambodian-temple" }, { t: "UNESCO to assess damage to Hindu temple caused by Thai-Cambodian clashes — UN News", u: "https://news.un.org/en/story/2011/02/366222" }] },

  // Dutch East Indies
  { id: "w108-dei-communist-revolt-1926", branch: "dutch-east-indies", y: D(1926, 11, 12), when: "November 1926", imp: 2,
    title: "Communist revolts in Java and Sumatra",
    text: "Indonesian communists rose in Batavia and Bantam, followed by West Sumatra in 1927. The Dutch crushed them, and the PKI was forced underground.",
    cites: [{ t: "The Netherlands East Indies 1926 Communist Revolt Revisited — BiblioAsia (National Library Board Singapore)", u: "https://biblioasia.nlb.gov.sg/chapters-of-asia/chapters-on-asia-2014-2017-netherlands-east-indies-communist-revolt/" }] },
  { id: "w108-dei-youth-pledge", branch: "dutch-east-indies", y: D(1928, 10, 28), when: "October 28, 1928", imp: 2,
    title: "Youth Pledge proclaims one nation, one language",
    text: "At the Second Indonesian Youth Congress in Batavia, young nationalists pledged to one motherland, one nation and a unifying language. The pledge helped define Indonesian identity under Dutch rule.",
    cites: [W("Youth_Pledge", "Youth Pledge"), { t: "Youth Pledge — Encyclopaedia Britannica", u: "https://www.britannica.com/event/Youth-Pledge" }] },
  { id: "w108-dei-pujangga-baru", branch: "dutch-east-indies", y: 1933.5, when: "July 1933", imp: 3,
    title: "Pujangga Baru launches modern Indonesian literature",
    text: "Takdir Alisjahbana, Armijn Pane and Amir Hamzah founded the literary magazine Poedjangga Baroe. It published poems, essays and plays for a modern, united nation with Indonesian as its language until 1942.",
    cites: [W("Poedjangga_Baroe", "Poedjangga Baroe"), { t: "Poedjangga Baroe — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/Poedjangga-Baroe" }] },
  { id: "w108-dei-pita-maha", branch: "dutch-east-indies", y: 1936.5, when: "1936", imp: 3,
    title: "Pita Maha artists' guild founded in Bali",
    text: "Under the patronage of the Ubud royal family, Walter Spies and Rudolf Bonnet helped found the Pitamaha guild to professionalize Balinese painting. Its exhibitions toured the Netherlands and London.",
    cites: [W("Balinese_art", "Balinese art"), W("Walter_Spies", "Walter Spies"), { t: "Pita Maha — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/Pita-Maha" }] },
  { id: "w108-dei-japan-conquest", branch: "dutch-east-indies", y: D(1942, 3, 9), when: "March 9, 1942", imp: 2, link: "japan",
    title: "Dutch forces on Java surrender to Japan",
    text: "Dutch commanders capitulated at Kalijati after a ten-day Japanese campaign, ending Dutch rule over the Indies. Some sources date the surrender to March 8.",
    cites: [{ t: "Dutch surrender on Java — HISTORY", u: "https://www.history.com/this-day-in-history/march-9/dutch-surrender-on-java" }, { t: "Japan occupies the Dutch East Indies — Anne Frank House", u: "https://www.annefrank.org/en/timeline/104/japan-occupies-the-dutch-east-indies/" }] },

  // French Indochina
  { id: "w108-fi-yen-bai", branch: "french-indochina", y: D(1930, 2, 10), when: "February 9–10, 1930", imp: 2,
    title: "Yen Bai mutiny against French rule",
    text: "Vietnamese soldiers of the Yen Bai garrison, with Viet Nam Quoc Dan Dang members, killed their French officers. The French crushed the revolt, and the nationalist party was largely destroyed.",
    cites: [W("Y%C3%AAn_B%C3%A1i_mutiny", "Yên Bái mutiny"), { t: "Yen Bai Uprising in French Indochina 1930-1931 — Armed Conflict Events Data", u: "https://onwar.com/data/vietnam1930.html" }] },
  { id: "w108-fi-tu-luc-van-doan", branch: "french-indochina", y: 1933.0, when: "c. 1932–1933", imp: 3,
    title: "Tự Lực văn đoàn modernizes Vietnamese literature",
    text: "Nhất Linh and Khái Hưng founded the Self-Reliant Literary Group, whose journals Phong Hóa and Ngày Nay pushed novels and poetry that broke with Confucian tradition. It became one of Vietnam's most influential literary movements.",
    cites: [W("Self-Reliant_Literary_Group", "Self-Reliant Literary Group"), { t: "The Life, Death and Legacy of 7 Pillars of Vietnam's Quốc Ngữ Literary Wealth — Saigoneer", u: "https://saigoneer.com/trich-or-triet/25576-the-life,-death-and-legacy-of-7-pillars-of-vietnam-s-qu%E1%BB%91c-ng%E1%BB%AF-literary-wealth" }] },
  { id: "w108-fi-japanese-enter-1940", branch: "french-indochina", y: D(1940, 9, 22), end: D(1940, 9, 26), when: "September 22–26, 1940", imp: 2, link: "japan",
    title: "Japan occupies northern Indochina",
    text: "Under an ultimatum, Vichy France's colonial government allowed Japanese bases in Tonkin to close the China border. Japan later extended its occupation to the whole colony.",
    cites: [W("Japanese_invasion_of_French_Indochina", "Japanese invasion of French Indochina"), { t: "Foreign Relations of the United States, 1940, Vol. IV, Document 180 — Office of the Historian", u: "https://history.state.gov/historicaldocuments/frus1940v04/d180" }] },
  { id: "w108-fi-japanese-coup-1945", branch: "french-indochina", y: D(1945, 3, 9), when: "March 9, 1945", imp: 2, link: "japan",
    title: "Japan overthrows the French colonial regime",
    text: "Japanese forces disarmed the French and took control of Indochina, ending nearly sixty years of French sovereignty. Vietnam, Cambodia and Laos then declared independence under Japanese direction.",
    cites: [W("Japanese_coup_d%27%C3%A9tat_in_French_Indochina", "Japanese coup d'état in French Indochina"), { t: "9 mars 1945 en Indochine : le coup de force japonais — Ministère des Armées (Chemins de mémoire)", u: "https://www.defense.gouv.fr/chemins-memoire/histoire-memoires/ressources-historiques/guerre-dindochine/9-mars-1945-indochine-coup-force" }] },

  // Kazakhstan
  { id: "w108-kz-semipalatinsk-closed", branch: "kazakhstan", y: D(1991, 8, 29), when: "August 29, 1991", imp: 2, link: "ussr",
    title: "Semipalatinsk nuclear test site closed",
    text: "After protests by the Nevada-Semipalatinsk Movement, Kazakhstan shut the Soviet Union's main test site, where nuclear weapons had been tested since 1949.",
    cites: [{ t: "Semipalatinsk: From Nuclear Testing Site to Test Ban Treaty Support — Carnegie Endowment", u: "https://carnegieendowment.org/research/2011/08/semipalatinsk-from-nuclear-testing-site-to-test-ban-treaty-support" }, W("Semipalatinsk_Test_Site", "Semipalatinsk Test Site")] },
  { id: "w108-kz-tenge", branch: "kazakhstan", y: D(1993, 11, 15), when: "November 15, 1993", imp: 3,
    title: "Kazakhstan introduces the tenge",
    text: "After Russia's exchange of banknotes pushed Kazakhstan out of the ruble zone, the new currency replaced Soviet money at 1 tenge to 500 rubles.",
    cites: [W("Kazakhstani_tenge", "Kazakhstani tenge"), { t: "The introduction of the national currency of the Republic of Kazakhstan - Tenge — e-history.kz", u: "https://e-history.kz/en/calendar/show/27465" }] },
  { id: "w108-kz-uranium-leader", branch: "kazakhstan", y: 2009.5, when: "2009", imp: 3,
    title: "Kazakhstan becomes the top uranium producer",
    text: "Kazakhstan became the world's leading uranium producer in 2009 and has held that rank since.",
    cites: [{ t: "Uranium and Nuclear Power in Kazakhstan — World Nuclear Association", u: "https://world-nuclear.org/information-library/country-profiles/countries-g-n/kazakhstan" }] },

  // Korean Empire & Japanese rule
  { id: "w108-ko-arirang-film", branch: "korean-empire", y: D(1926, 10, 1), when: "October 1, 1926", imp: 2,
    title: "Na Woon-gyu's silent film Arirang premieres",
    text: "The film, written, directed and starred in by Na Woon-gyu, premiered at Seoul's Dansungsa cinema and became a national sensation. It is now considered a lost film.",
    cites: [W("Arirang_(1926_film)", "Arirang (1926 film)")] },
  { id: "w108-ko-gwangju-students", branch: "korean-empire", y: D(1929, 11, 3), when: "November 3, 1929", imp: 2, link: "japan",
    title: "Gwangju Student Independence Movement",
    text: "After a clash between Korean and Japanese students at Naju station on October 30, Korean students protested Japanese rule in Gwangju. Protests spread nationwide in the largest independence movement after 1919.",
    cites: [W("Gwangju_Student_Independence_Movement", "Gwangju Student Independence Movement"), { t: "Democratic Party Gwangju Branch: “We Will Keep the Spirit of the Gwangju Student Independence Movement in Our Hearts” — Asia Economy", u: "https://www.asiae.co.kr/en/article/2020110316090301778" }] },
  { id: "w108-ko-hongkou-bombing", branch: "korean-empire", y: D(1932, 4, 29), when: "April 29, 1932", imp: 2, link: "japan",
    title: "Yun Bong-gil bombs Japanese officials in Shanghai",
    text: "At a ceremony for Emperor Hirohito's birthday in Hongkou Park, Yun Bong-gil threw a bomb that killed two Japanese officials. He was part of Kim Ku's independence organization and was executed that December.",
    cites: [W("Hongkou_Park_Incident", "Hongkou Park Incident"), W("Yun_Bong-gil", "Yun Bong-gil")] },
  { id: "w108-ko-sohn-marathon", branch: "korean-empire", y: 1936.6, when: "August 1936", imp: 2, link: "japan",
    title: "Sohn Kee-chung wins the Berlin Olympic marathon",
    text: "Competing for Japan as Kitei Son, the Korean runner took Olympic gold in the marathon, the first Korean to win a gold medal. Olympedia lists the medal under Japan.",
    cites: [{ t: "Son Gi-Jeong — Olympedia", u: "https://www.olympedia.org/athletes/72608" }, W("Sohn_Kee-chung", "Sohn Kee-chung"), { t: "Sohn Kee-Chung — Encyclopaedia Britannica", u: "https://www.britannica.com/biography/Sohn-Kee-chung" }] },
  { id: "w108-ko-name-change", branch: "korean-empire", y: D(1940, 2, 11), when: "February 11, 1940", imp: 2, link: "japan",
    title: "Koreans pressed to adopt Japanese-style names",
    text: "The sōshi-kaimei policy required Korean families to register a Japanese-style family name within six months or have one assigned. Historians see it as part of the assimilation drive.",
    cites: [W("S%C5%8Dshi-kaimei", "Sōshi-kaimei")] },

  // Malaysia
  { id: "w108-my-proton-saga", branch: "malaysia", y: D(1985, 7, 9), when: "July 9, 1985", imp: 3,
    title: "Proton Saga, Malaysia's first national car",
    text: "Launched by Prime Minister Mahathir with Mitsubishi's technical help, the Saga became a national symbol. Proton says about 1.95 million had been sold, making it Malaysia's best-selling car.",
    cites: [W("Proton_Saga_(first_generation)", "Proton Saga (first generation)"), { t: "Malaysia's first car Proton Saga celebrates 37th birthday — New Straits Times", u: "https://nst.com.my/amp/business/2022/07/812442/malaysias-first-car-proton-saga-celebrates-37th-birthday" }] },
  { id: "w108-my-vision-2020", branch: "malaysia", y: D(1991, 2, 28), when: "February 28, 1991", imp: 2,
    title: "Mahathir unveils Vision 2020",
    text: "In “The Way Forward,” Mahathir set the goal of making Malaysia a fully developed nation by 2020. It required about 7% annual growth, and later development plans were built around it.",
    cites: [W("Wawasan_2020", "Wawasan 2020"), { t: "Vision 2020 (full text) — Academy of Sciences Malaysia", u: "https://www.akademisains.gov.my/wp-content/uploads/2019/12/Vision-2020_complete.pdf" }] },
  { id: "w108-my-mahathir-retires", branch: "malaysia", y: D(2003, 10, 31), when: "October 31, 2003", imp: 2,
    title: "Mahathir retires after 22 years",
    text: "Mahathir handed power to Abdullah Ahmad Badawi, who took the oath as Malaysia's fifth prime minister. The 77-year-old left after the longest premiership in the country's history.",
    cites: [{ t: "Mahathir steps down — Al Jazeera", u: "https://www.aljazeera.com/news/2003/10/31/mahathir-steps-down" }, { t: "Malaysia's Mahathir steps down — PBS NewsHour", u: "https://www.pbs.org/newshour/politics/asia-july-dec03-malaysia_10-31" }] },

  // North Korea
  { id: "w108-nk-arirang-mass-games", branch: "north-korea", y: 2002.3, when: "2002", imp: 3,
    title: "Arirang Mass Games debut in Pyongyang",
    text: "A mass performance of gymnasts and dancers premiered in 2002 and was staged annually through 2013, apart from 2006. It presented the legacy of Kim Il Sung and Kim Jong Il to huge audiences.",
    cites: [W("Arirang_Mass_Games", "Arirang Mass Games")] },

  // Singapore
  { id: "w108-sg-british-withdrawal", branch: "singapore", y: D(1971, 10, 29), when: "October 29, 1971", imp: 2, link: "uk",
    title: "Britain closes its Far East Command in Singapore",
    text: "The withdrawal came two months ahead of schedule. The Five Power Defence Arrangements with Britain, Australia, New Zealand and Malaysia took effect on November 1, leaving only a token force.",
    cites: [{ t: "Withdrawal of British Far East Command from Singapore in 1971 — SG101 (Government of Singapore)", u: "https://www.sg101.gov.sg/resources/archives/onthisday-withdrawal-of-british-far-east-command-from-singapore-british-far-east-withdrew-from-singapore/" }, { t: "Malaysia and Singapore (Defence Arrangements), HC Deb 19 April 1971 — Hansard", u: "https://api.parliament.uk/historic-hansard/written-answers/1971/apr/19/malaysia-and-singapore-defence" }] },
  { id: "w108-sg-barings-collapse", branch: "singapore", y: D(1995, 2, 26), when: "February 26, 1995", imp: 2, link: "uk",
    title: "Barings Bank collapses over Singapore trading losses",
    text: "Losses hidden by trader Nick Leeson at Barings Futures Singapore bankrupted Barings, one of Britain's oldest merchant banks. Leeson was convicted in Singapore and served over four years in Changi Prison.",
    cites: [W("Barings_Bank", "Barings Bank"), W("Nick_Leeson", "Nick Leeson"), { t: "Implications of the Barings Collapse for Bank Supervisors — Reserve Bank of Australia", u: "https://www.rba.gov.au/publications/bulletin/1995/nov/1.html" }] },
  { id: "w108-sg-esplanade", branch: "singapore", y: D(2002, 10, 12), when: "October 12, 2002", imp: 3,
    title: "Esplanade – Theatres on the Bay opens",
    text: "President S. R. Nathan opened the twin-domed performing arts center on Marina Bay, long planned and completed in 2001. It grew into one of the world's busiest arts centers.",
    cites: [W("Esplanade_%E2%80%93_Theatres_on_the_Bay", "Esplanade – Theatres on the Bay"), { t: "Our Story — Esplanade – Theatres on the Bay", u: "https://www.esplanade.com/about-us/our-story" }] },
  { id: "w108-sg-night-grand-prix", branch: "singapore", y: D(2008, 9, 28), when: "September 28, 2008", imp: 3,
    title: "Singapore hosts Formula One's first night race",
    text: "The Marina Bay street circuit staged the first Formula One race held at night, the 800th World Championship race. Fernando Alonso won, in a race later tainted by the “crashgate” scandal.",
    cites: [{ t: "Do you remember... F1's first ever night race — Formula 1", u: "https://www.formula1.com/en/latest/article/do-you-remember-f1s-first-ever-night-race.40aylFbXcPZSJRGiQv5Dgh" }, W("2008_Singapore_Grand_Prix", "2008 Singapore Grand Prix")] },
] });

const SGP = { scope: "place", lat: 1.29, lon: 103.86, r: 40, label: "Marina Bay, Singapore", src: "https://en.wikipedia.org/wiki/Marina_Bay,_Singapore" };
TL.geo("w108-tn-jericho-speech", { scope: "place", lat: 31.86, lon: 35.46, r: 40, label: "Jericho", src: "https://en.wikipedia.org/wiki/Jericho" });
TL.geo("w108-tn-carthage-film-festival", { scope: "place", lat: 36.81, lon: 10.18, r: 40, label: "Tunis, Tunisia", src: "https://en.wikipedia.org/wiki/Tunis" });
TL.geo("w108-tn-djerba-union", { scope: "place", lat: 33.8, lon: 10.88, r: 50, label: "Djerba, Tunisia", src: "https://en.wikipedia.org/wiki/Djerba" });
TL.geo("w108-tn-wsis-tunis", { scope: "place", lat: 36.81, lon: 10.18, r: 40, label: "Tunis, Tunisia", src: "https://en.wikipedia.org/wiki/Tunis" });
TL.geo("w108-tn-nobel-quartet", { scope: "region", lat: 36.81, lon: 10.18, r: 450, label: "Tunisia", src: "https://en.wikipedia.org/wiki/Tunis" });
TL.geo("w108-af-last-soviet-column", { scope: "region", lat: 34.53, lon: 69.17, r: 700, label: "Afghanistan", src: "https://en.wikipedia.org/wiki/Kabul" });
TL.geo("w108-raj-simon-commission", { scope: "region", lat: 28.61, lon: 77.21, r: 2000, label: "British India", src: "https://en.wikipedia.org/wiki/New_Delhi" });
TL.geo("w108-raj-raman-effect", { scope: "place", lat: 22.57, lon: 88.37, r: 40, label: "Kolkata, India", src: "https://en.wikipedia.org/wiki/Kolkata" });
TL.geo("w108-raj-alam-ara", { scope: "place", lat: 19.08, lon: 72.88, r: 40, label: "Mumbai, India", src: "https://en.wikipedia.org/wiki/Mumbai" });
TL.geo("w108-raj-government-of-india-act", { scope: "region", lat: 28.61, lon: 77.21, r: 2000, label: "British India", src: "https://en.wikipedia.org/wiki/New_Delhi" });
TL.geo("w108-raj-progressive-writers", { scope: "place", lat: 26.85, lon: 80.95, r: 40, label: "Lucknow, India", src: "https://en.wikipedia.org/wiki/Lucknow" });
TL.geo("w108-raj-simla-conference", { scope: "place", lat: 31.1, lon: 77.17, r: 40, label: "Shimla, India", src: "https://en.wikipedia.org/wiki/Shimla" });
TL.geo("w108-asean-zopfan", { scope: "place", lat: 3.15, lon: 101.7, r: 40, label: "Kuala Lumpur, Malaysia", src: "https://en.wikipedia.org/wiki/Kuala_Lumpur" });
TL.geo("w108-asean-china-fta", { scope: "region", lat: 8, lon: 105, r: 2500, label: "Southeast Asia and China", src: "https://en.wikipedia.org/wiki/Southeast_Asia" });
TL.geo("w108-kh-olympic-stadium", { scope: "place", lat: 11.57, lon: 104.92, r: 40, label: "Phnom Penh, Cambodia", src: "https://en.wikipedia.org/wiki/Phnom_Penh" });
TL.geo("w108-kh-cgdk", { scope: "place", lat: 3.15, lon: 101.7, r: 40, label: "Kuala Lumpur, Malaysia", src: "https://en.wikipedia.org/wiki/Kuala_Lumpur" });
TL.geo("w108-kh-1997-coup", { scope: "place", lat: 11.57, lon: 104.92, r: 40, label: "Phnom Penh, Cambodia", src: "https://en.wikipedia.org/wiki/Phnom_Penh" });
TL.geo("w108-kh-preah-vihear-unesco", { scope: "place", lat: 14.39, lon: 104.68, r: 40, label: "Preah Vihear Temple", src: "https://en.wikipedia.org/wiki/Prasat_Preah_Vihear" });
TL.geo("w108-dei-communist-revolt-1926", { scope: "region", lat: -6.18, lon: 106.83, r: 700, label: "Java and Sumatra", src: "https://en.wikipedia.org/wiki/Jakarta" });
TL.geo("w108-dei-youth-pledge", { scope: "place", lat: -6.18, lon: 106.83, r: 40, label: "Batavia (Jakarta)", src: "https://en.wikipedia.org/wiki/Jakarta" });
TL.geo("w108-dei-pujangga-baru", { scope: "place", lat: -6.18, lon: 106.83, r: 40, label: "Batavia (Jakarta)", src: "https://en.wikipedia.org/wiki/Jakarta" });
TL.geo("w108-dei-pita-maha", { scope: "place", lat: -8.51, lon: 115.26, r: 40, label: "Ubud, Bali", src: "https://en.wikipedia.org/wiki/Ubud" });
TL.geo("w108-dei-japan-conquest", { scope: "place", lat: -6.92, lon: 107.61, r: 60, label: "Bandung, Java", src: "https://en.wikipedia.org/wiki/Bandung" });
TL.geo("w108-fi-yen-bai", { scope: "place", lat: 21.71, lon: 104.89, r: 40, label: "Yên Bái, Vietnam", src: "https://en.wikipedia.org/wiki/Y%C3%AAn_B%C3%A1i" });
TL.geo("w108-fi-tu-luc-van-doan", { scope: "place", lat: 21, lon: 105.85, r: 40, label: "Hanoi, Vietnam", src: "https://en.wikipedia.org/wiki/Hanoi" });
TL.geo("w108-fi-japanese-enter-1940", { scope: "region", lat: 21, lon: 105.85, r: 500, label: "Tonkin (northern Vietnam)", src: "https://en.wikipedia.org/wiki/Hanoi" });
TL.geo("w108-fi-japanese-coup-1945", { scope: "region", lat: 16, lon: 108, r: 1200, label: "French Indochina", src: "https://en.wikipedia.org/wiki/Vietnam" });
TL.geo("w108-kz-semipalatinsk-closed", { scope: "place", lat: 50.43, lon: 80.26, r: 100, label: "Semey, Kazakhstan", src: "https://en.wikipedia.org/wiki/Semey" });
TL.geo("w108-kz-tenge", { scope: "region", lat: 48.0, lon: 68.0, r: 1500, label: "Kazakhstan", src: "https://en.wikipedia.org/wiki/Kazakhstan" });
TL.geo("w108-kz-uranium-leader", { scope: "region", lat: 48.0, lon: 68.0, r: 1500, label: "Kazakhstan", src: "https://en.wikipedia.org/wiki/Kazakhstan" });
TL.geo("w108-ko-arirang-film", { scope: "place", lat: 37.56, lon: 126.99, r: 40, label: "Seoul, Korea", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w108-ko-gwangju-students", { scope: "place", lat: 35.17, lon: 126.85, r: 40, label: "Gwangju, Korea", src: "https://en.wikipedia.org/wiki/Gwangju" });
TL.geo("w108-ko-hongkou-bombing", { scope: "place", lat: 31.23, lon: 121.47, r: 40, label: "Shanghai, China", src: "https://en.wikipedia.org/wiki/Shanghai" });
TL.geo("w108-ko-sohn-marathon", { scope: "place", lat: 52.52, lon: 13.4, r: 40, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("w108-ko-name-change", { scope: "region", lat: 37.56, lon: 126.99, r: 500, label: "Korea", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w108-my-proton-saga", { scope: "place", lat: 3.07, lon: 101.52, r: 40, label: "Shah Alam, Malaysia", src: "https://en.wikipedia.org/wiki/Shah_Alam" });
TL.geo("w108-my-vision-2020", { scope: "place", lat: 3.15, lon: 101.7, r: 40, label: "Kuala Lumpur, Malaysia", src: "https://en.wikipedia.org/wiki/Kuala_Lumpur" });
TL.geo("w108-my-mahathir-retires", { scope: "place", lat: 3.15, lon: 101.7, r: 40, label: "Kuala Lumpur, Malaysia", src: "https://en.wikipedia.org/wiki/Kuala_Lumpur" });
TL.geo("w108-nk-arirang-mass-games", { scope: "place", lat: 39.02, lon: 125.75, r: 40, label: "Pyongyang, North Korea", src: "https://en.wikipedia.org/wiki/Pyongyang" });
TL.geo("w108-sg-british-withdrawal", { scope: "region", lat: 1.28, lon: 103.83, r: 30, label: "Singapore", src: "https://en.wikipedia.org/wiki/Singapore" });
TL.geo("w108-sg-barings-collapse", { scope: "region", lat: 1.28, lon: 103.83, r: 30, label: "Singapore", src: "https://en.wikipedia.org/wiki/Singapore" });
TL.geo("w108-sg-esplanade", { ...SGP, src: "https://en.wikipedia.org/wiki/Esplanade_%E2%80%93_Theatres_on_the_Bay" });
TL.geo("w108-sg-night-grand-prix", { ...SGP });
