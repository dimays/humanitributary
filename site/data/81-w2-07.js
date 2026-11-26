// W2-07 fill: Dutch East Indies, French Indochina, Japan, Joseon, Korean Empire, Philippines, Qing, Argentina, 1800-1925. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };
TL.add({ events: [
  // Dutch East Indies
  { id: "w207-dei-max-havelaar", branch: "dutch-east-indies", y: 1860.4, when: "1860", imp: 2,
    title: "Multatuli publishes Max Havelaar",
    text: "Eduard Douwes Dekker, writing as Multatuli, published a novel attacking forced-crop quotas, corrupt officials and the treatment of Javanese under Dutch rule. It stirred reform debate in the Netherlands and later fed Indonesian nationalism.",
    cites: [W("Max_Havelaar", "Max Havelaar"), { t: "Multatuli (Eduard Douwes Dekker) — Encyclopedia.com", u: "https://www.encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/multatuli-eduard-douwes-dekker" }, { t: "Multatuli — Britannica", u: "https://www.britannica.com/biography/Multatuli" }] },
  { id: "w207-dei-krakatoa", branch: "dutch-east-indies", y: D(1883, 8, 27), when: "August 26–27, 1883", imp: 2,
    title: "Krakatoa erupts in the Sunda Strait",
    text: "The volcano's climactic eruption killed some 36,000 people, most by tsunamis on the Java and Sumatra coasts. Its air wave circled the globe and its ash cooled the climate for a year or more.",
    cites: [W("1883_eruption_of_Krakatoa", "1883 eruption of Krakatoa"), { t: "On This Day: Historic Krakatau Eruption of 1883 — NOAA NCEI", u: "https://www.ncei.noaa.gov/news/day-historic-krakatau-eruption-1883" }] },
  { id: "w207-dei-ethical-policy", branch: "dutch-east-indies", y: D(1901, 9, 17), when: "September 17, 1901", imp: 2,
    title: "Queen Wilhelmina announces the Ethical Policy",
    text: "In her throne speech Wilhelmina spoke of a moral obligation to the people of the Indies. The policy promised irrigation, migration from Java and more Western schooling, and trained the first generation of Indonesian nationalists.",
    cites: [W("Dutch_Ethical_Policy", "Dutch Ethical Policy"), { t: "Ethical Policy — Britannica", u: "https://www.britannica.com/topic/Ethical-Policy" }] },
  { id: "w207-dei-budi-utomo", branch: "dutch-east-indies", y: D(1908, 5, 20), when: "May 20, 1908", imp: 2,
    title: "Budi Utomo founded",
    text: "Students of the STOVIA medical school in Batavia, inspired by Dr. Wahidin Soedirohoesodo, founded Budi Utomo. Often called the first nationalist society in the Indies, it marks the start of the Indonesian National Awakening.",
    cites: [W("Budi_Utomo", "Budi Utomo"), { t: "Budi Utomo — Britannica", u: "https://www.britannica.com/topic/Budi-Utomo" }] },
  { id: "w207-dei-kartini-letters", branch: "dutch-east-indies", y: 1911.5, when: "1911", imp: 3,
    title: "Kartini's letters published as Door Duisternis tot Licht",
    text: "J. H. Abendanon edited and published the Dutch letters of the Javanese noble Kartini, who had died in 1904. Her pleas for girls' education and against forced marriage made her an icon of Indonesian women's emancipation.",
    cites: [W("Kartini", "Kartini"), { t: "Raden Adjeng Kartini — Britannica", u: "https://www.britannica.com/biography/Raden-Adjeng-Kartini" }] },
  // French Indochina
  { id: "w207-fi-doumer", branch: "french-indochina", y: 1897.1, when: "1897", imp: 2,
    title: "Paul Doumer becomes Governor-General",
    text: "Doumer built Indochina into a self-financing federation with taxes on opium, wine and salt, and pushed the Yunnan railway and Hanoi's showpiece works, including the bridge that bore his name. His tenure ran to 1902.",
    cites: [W("Paul_Doumer", "Paul Doumer"), { t: "Doumer, Paul — Encyclopedia.com", u: "https://www.encyclopedia.com/reference/encyclopedias-almanacs-transcripts-and-maps/doumer-paul" }, { t: "Paul Doumer — Britannica", u: "https://www.britannica.com/biography/Paul-Doumer" }] },
  { id: "w207-fi-dong-du", branch: "french-indochina", y: 1905, end: 1909, when: "1905–1909", imp: 2,
    title: "Phan Bội Châu's Đông Du movement",
    text: "Phan Bội Châu moved to Japan in 1905 and brought young Vietnamese there to study and prepare resistance to French rule. A Franco-Japanese understanding forced him and the students out in 1908–09.",
    cites: [W("Phan_B%E1%BB%99i_Ch%C3%A2u", "Phan Bội Châu"), { t: "Phan Boi Chau — Britannica", u: "https://www.britannica.com/biography/Phan-Boi-Chau" }] },
  { id: "w207-fi-dong-kinh", branch: "french-indochina", y: D(1907, 3, 15), end: D(1907, 11, 15), when: "March–November 1907", imp: 3,
    title: "Đông Kinh Nghĩa Thục free school in Hanoi",
    text: "Reformers including Lương Văn Can opened a free school teaching science, hygiene and French and promoting the Vietnamese alphabet over Chinese characters. French authorities closed it in November 1907 and arrested its leaders in 1908.",
    cites: [W("%C4%90%C3%B4ng_Kinh_Ngh%C4%A9a_Th%E1%BB%A5c", "Đông Kinh Nghĩa Thục"), { t: "Tonkin Free School — Britannica", u: "https://www.britannica.com/topic/Tonkin-Free-School" }] },
  { id: "w207-fi-duy-tan-revolt", branch: "french-indochina", y: 1916.3, when: "May 1916", imp: 3,
    title: "Emperor Duy Tân's failed uprising",
    text: "While France was absorbed in World War I, the teenage emperor slipped out of the palace at Huế with the mandarin Trần Cao Vân to rally revolt. The plot was betrayed; Duy Tân was exiled to Réunion and his co-conspirators beheaded.",
    cites: [W("Duy_T%C3%A2n", "Duy Tân"), { t: "Duy Tan — Britannica", u: "https://www.britannica.com/biography/Duy-Tan" }] },
  // Japan
  { id: "w207-jp-siebold-dejima", branch: "japan", y: D(1823, 8, 11), when: "August 11, 1823", imp: 3,
    title: "Siebold reaches Dejima",
    text: "The German physician Philipp Franz von Siebold arrived at the Dutch trading post at Nagasaki. His Narutaki school (1824) trained some fifty Japanese pupils and advanced “Dutch learning” in medicine and natural history.",
    cites: [W("Philipp_Franz_von_Siebold", "Philipp Franz von Siebold"), { t: "Siebold: A German Naturalist in Nineteenth-Century Nagasaki — Nippon.com", u: "https://www.nippon.com/en/articles/-/12672" }] },
  { id: "w207-jp-great-wave", branch: "japan", y: 1831, when: "c. 1831", imp: 1,
    title: "Hokusai's Great Wave off Kanagawa",
    text: "Katsushika Hokusai issued “Under the Wave off Kanagawa,” the first print of his Thirty-six Views of Mount Fuji. Using Prussian blue, it became the best-known Japanese image in the world and shaped European Japonisme.",
    cites: [W("The_Great_Wave_off_Kanagawa", "The Great Wave off Kanagawa"), { t: "Under the Wave off Kanagawa — Nelson-Atkins Museum of Art", u: "https://art.nelson-atkins.org/objects/5975/under-the-wave-off-kanagawa" }] },
  { id: "w207-jp-tenpo-reforms", branch: "japan", y: 1841.5, end: 1843.5, when: "1841–1843", imp: 3,
    title: "Tenpō Reforms curb luxury and the arts",
    text: "After Shogun Ienari died, Mizuno Tadakuni tried to revive the economy through frugality edicts, price controls and disbanded merchant guilds. Theaters and ukiyo-e publishing were restricted; the program collapsed in 1843.",
    cites: [W("Tenp%C5%8D_Reforms", "Tenpō Reforms"), { t: "Tempō reforms — Britannica", u: "https://www.britannica.com/topic/Tempo-Reforms" }] },
  { id: "w207-jp-first-railway", branch: "japan", y: 1872.78, when: "October 1872", imp: 2,
    title: "Japan's first railway opens, Shimbashi to Yokohama",
    text: "The line from Tokyo's Shimbashi station to Yokohama opened using British-built locomotives. It began the railway network that tied the Meiji state's industrialization together.",
    cites: [W("Shinbashi_Station", "Shimbashi Station"), { t: "Express Train to Industrialization: Japan’s First Railway Line — Nippon.com", u: "https://nippon.com/en/japan-topics/b06911" }] },
  { id: "w207-jp-satsuma-rebellion", branch: "japan", y: D(1877, 1, 29), end: D(1877, 9, 24), when: "January 29 – September 24, 1877", imp: 2,
    title: "Satsuma Rebellion ends at Shiroyama",
    text: "Saigō Takamori led former Satsuma samurai against the Meiji government and died at Shiroyama. Conscript troops won, ending the samurai as an armed class and marking the last major uprising against the new order.",
    cites: [W("Satsuma_Rebellion", "Satsuma Rebellion"), { t: "Satsuma Rebellion — Japanese Reference", u: "https://jref.com/articles/satsuma-rebellion.759/" }, { t: "Satsuma Rebellion — Britannica", u: "https://www.britannica.com/event/Satsuma-Rebellion" }] },
  { id: "w207-jp-ukigumo", branch: "japan", y: 1887.45, end: 1889.6, when: "June 1887 – August 1889", imp: 3,
    title: "Futabatei Shimei's Ukigumo, the first modern novel",
    text: "Futabatei Shimei's “Drifting Clouds,” published in three parts, used everyday colloquial language and psychological realism. Critics often call it Japan's first modern novel.",
    cites: [W("Ukigumo_(novel)", "Ukigumo (novel)"), { t: "Futabatei Shimei — Britannica", u: "https://www.britannica.com/biography/Futabatei-Shimei" }] },
  { id: "w207-jp-meiji-constitution", branch: "japan", y: D(1889, 2, 11), when: "February 11, 1889", imp: 2,
    title: "Meiji Constitution promulgated",
    text: "The emperor proclaimed Japan's first modern constitution, drafted under Itō Hirobumi. It set up an elected lower house within an order in which sovereignty rested with the emperor, and took effect in 1890.",
    cites: [{ t: "Chronological Table — National Diet Library, Japan", u: "https://www.ndl.go.jp/modern/e/utility/chronology.html" }, W("Imperial_Diet_(Japan)", "Imperial Diet (Japan)")] },
  { id: "w207-jp-first-diet", branch: "japan", y: D(1890, 11, 29), when: "November 29, 1890", imp: 3,
    title: "First Imperial Diet opens",
    text: "Japan's bicameral parliament convened for the first time, with an elected House of Representatives chosen on a limited franchise and a House of Peers of nobles appointed by the emperor.",
    cites: [{ t: "Chronological Table — National Diet Library, Japan", u: "https://www.ndl.go.jp/modern/e/utility/chronology.html" }, W("Imperial_Diet_(Japan)", "Imperial Diet (Japan)")] },
  { id: "w207-jp-rashomon", branch: "japan", y: 1915.9, when: "1915", imp: 3,
    title: "Akutagawa publishes “Rashōmon”",
    text: "Ryūnosuke Akutagawa's short story, reworking tales from the Konjaku Monogatarishū, appeared in the journal Teikoku Bungaku. It launched a career that made him a leading Taishō writer; sources give 1914 or 1915.",
    cites: [W("Rashomon_(short_story)", "Rashōmon (short story)"), { t: "Akutagawa Ryūnosuke — Britannica", u: "https://www.britannica.com/biography/Akutagawa-Ryunosuke" }] },
  { id: "w207-jp-rice-riots", branch: "japan", y: D(1918, 7, 23), end: D(1918, 9, 21), when: "July–September 1918", imp: 2,
    title: "Rice Riots shake Japan",
    text: "Protests over soaring rice prices began in a Toyama fishing town and spread nationwide, perhaps involving a million or more people. Prime Minister Terauchi resigned; Hara Takashi formed Japan's first party cabinet led by a commoner.",
    cites: [W("Rice_Riots_of_1918", "Rice Riots of 1918"), { t: "Chronological Table — National Diet Library, Japan", u: "https://www.ndl.go.jp/modern/e/utility/chronology.html" }] },
  // Joseon
  { id: "w207-jo-sinyu-persecution", branch: "joseon", y: 1801.3, when: "1801", imp: 3,
    title: "Sinyu Persecution of Korean Catholics",
    text: "The regent Queen Jeongsun ordered a crackdown on Catholicism, seen as incompatible with Confucianism and useful in factional purges. More than 100 Catholics were executed and about 400 exiled; some counts of the dead are higher.",
    cites: [W("Sinyu_Persecution", "Sinyu Persecution"), { t: "Religions — organized and not — and a revolt — Korea JoongAng Daily", u: "https://www.koreajoongangdaily.com/lifestyle/religions-organized-and-not-and-a-revolt/10280667" }] },
  { id: "w207-jo-sehando", branch: "joseon", y: 1844.5, when: "1844", imp: 3,
    title: "Kim Jeong-hui paints Sehando in exile",
    text: "Exiled on Jeju Island, the scholar-calligrapher Kim Jeong-hui painted “Winter Scene,” a sparse house between pines, for a loyal disciple. Developed in exile alongside his Chusa calligraphy, it became a Korean literati-art icon.",
    cites: [W("Kim_Jeong-hui", "Kim Jeong-hui"), { t: "[In-Depth Look] The True Value of ‘Sehando’ — The Asia Business Daily", u: "https://view.asiae.co.kr/en/article/2020090414253533744" }, { t: "Kim Chŏng-hui — Britannica", u: "https://www.britannica.com/biography/Kim-Chong-hui" }] },
  { id: "w207-jo-donghak-founded", branch: "joseon", y: D(1860, 5, 25), when: "May 25, 1860", imp: 2,
    title: "Choe Je-u founds Donghak, “Eastern Learning”",
    text: "After a revelation on Mount Gumi, Choe Je-u began preaching an egalitarian faith drawing on Korean shamanism, Daoism, Buddhism and Neo-Confucianism. Joseon executed him in 1864, but the movement spread among the poor.",
    cites: [W("Choe_Je-u", "Choe Je-u"), { t: "Ch'ŏndogyo — Encyclopedia.com", u: "https://www.encyclopedia.com/environment/encyclopedias-almanacs-transcripts-and-maps/chondogyo" }, { t: "Choe Je-u — Britannica", u: "https://www.britannica.com/biography/Choe-Che-u" }] },
  { id: "w207-jo-daedongyeojido", branch: "joseon", y: 1861.5, when: "1861", imp: 2,
    title: "Kim Jeong-ho completes the Daedongyeojido",
    text: "Kim Jeong-ho's map of Korea, printed from 70 woodblocks in 22 folding booklets at about 1:162,000, is regarded as the peak of pre-modern Korean cartography. A second printing followed in 1864.",
    cites: [W("Daedongyeojido", "Daedongyeojido"), { t: "6.7-meter map of Joseon unfurls in full at National Museum of Korea — The Korea Times", u: "https://www.koreatimes.co.kr/lifestyle/koreanheritage/20260212/photos-67-meter-map-of-joseon-unfurls-in-full-at-national-museum-of-korea" }] },
  { id: "w207-jo-gapsin-coup", branch: "joseon", y: D(1884, 12, 4), end: D(1884, 12, 6), when: "December 4–6, 1884", imp: 2,
    title: "Gapsin Coup fails in Seoul",
    text: "Reformers led by Kim Ok-gyun, with Japanese support, seized the palace for three days. Chinese troops under Yuan Shikai crushed them, and Chinese influence over Korea grew until 1894.",
    cites: [W("Gapsin_Coup", "Gapsin Coup"), { t: "Glossary: Gapsin Coup — JACAR, Sino-Japanese War of 1894–1895", u: "https://www.jacar.go.jp/english/jacarbl-fsjwar-e/smart/glossary/g004.html" }, { t: "Coming to the rescue in 1884: Part 3 — The Korea Times", u: "https://www.koreatimes.co.kr/amp/opinion/20211211/coming-to-the-rescue-in-1884-part-3" }] },
  { id: "w207-jo-donghak-revolution", branch: "joseon", y: D(1894, 1, 11), end: D(1895, 12, 25), when: "January 1894 – 1895", imp: 2,
    title: "Donghak Peasant Revolution",
    text: "Peasants under Jeon Bong-jun rose against corrupt officials and took Jeonju. Rival Chinese and Japanese troop landings in response led to the First Sino-Japanese War, and Japanese-backed forces crushed the rebels at Ugeumchi.",
    cites: [W("Donghak_Peasant_Revolution", "Donghak Peasant Revolution"), { t: "Ch'ŏndogyo — Encyclopedia.com", u: "https://www.encyclopedia.com/environment/encyclopedias-almanacs-transcripts-and-maps/chondogyo" }, { t: "Donghak Uprising — Britannica", u: "https://www.britannica.com/event/Tonghak-Uprising" }] },
  { id: "w207-jo-queen-min-killed", branch: "joseon", y: D(1895, 10, 8), when: "October 8, 1895", imp: 2, link: "japan",
    title: "Queen Min assassinated in Gyeongbokgung",
    text: "Japanese agents, with Korean accomplices, killed Queen Min in the palace in the Eulmi Incident; she had sought Russian protection against Japan. The killing provoked an anti-Japanese backlash.",
    cites: [W("Empress_Myeongseong", "Empress Myeongseong"), { t: "The Murder of Empress Myeongseong of Korea — Gale Review", u: "https://review.gale.com/2022/08/16/the-murder-of-empress-myeongseong-of-korea/" }] },
  // Korean Empire
  { id: "w207-ke-eulsa-treaty", branch: "korean-empire", y: D(1905, 11, 17), when: "November 17, 1905", imp: 2, link: "japan",
    title: "Eulsa Treaty makes Korea a Japanese protectorate",
    text: "With Japanese troops around the palace, Korean ministers signed away Korea's diplomatic rights; Itō Hirobumi became Resident-General in 1906. Koreans remember it as coerced.",
    cites: [W("Eulsa_Treaty", "Eulsa Treaty"), { t: "(528) Eulsa Treaty — The Korea Times", u: "https://koreatimes.co.kr/opinion/20091217/528-eulsa-treaty" }] },
  { id: "w207-ke-ito-assassinated", branch: "korean-empire", y: D(1909, 10, 26), when: "October 26, 1909", imp: 2, link: "japan",
    title: "Ahn Jung-geun shoots Itō Hirobumi",
    text: "The independence activist Ahn Jung-geun shot Itō, Japan's former Resident-General in Korea, at Harbin station. Ahn was hanged in March 1910 and became a Korean national hero.",
    cites: [W("It%C5%8D_Hirobumi", "Itō Hirobumi"), W("Ahn_Jung-geun", "Ahn Jung-geun"), { t: "Itō Hirobumi — Britannica", u: "https://www.britannica.com/biography/Ito-Hirobumi" }] },
  { id: "w207-ke-march-first", branch: "korean-empire", y: D(1919, 3, 1), when: "March 1, 1919", imp: 1,
    title: "March First Movement",
    text: "Thirty-three signers read a Declaration of Independence in Seoul, setting off nationwide protests (perhaps 0.8–2 million people). Japan's violent repression did not stop it, and it led to the Provisional Government in exile.",
    cites: [W("March_1st_Movement", "March 1st Movement"), { t: "March First Movement — Britannica", u: "https://www.britannica.com/event/March-First-Movement" }] },
  // Philippines
  { id: "w207-ph-noli-me-tangere", branch: "philippines", y: 1887.2, when: "1887", imp: 2,
    title: "Rizal publishes Noli Me Tángere",
    text: "José Rizal's novel, set in the Spanish colony and printed in Berlin in 1887, exposed friar abuses. Banned but smuggled into the islands, it became a cornerstone of Propaganda Movement literature and Filipino national identity.",
    cites: [W("Noli_Me_Tangere_(novel)", "Noli Me Tángere (novel)"), { t: "Remembering José Rizal, Filipino Revolutionary — Library of Congress", u: "https://blogs.loc.gov/law/2024/02/remembering-jose-rizal-filipino-revolutionary/" }, { t: "José Rizal — Britannica", u: "https://www.britannica.com/biography/Jose-Rizal" }] },
  { id: "w207-ph-rizal-executed", branch: "philippines", y: D(1896, 12, 30), when: "December 30, 1896", imp: 2,
    title: "Rizal executed at Bagumbayan",
    text: "A Spanish court-martial convicted José Rizal of rebellion, and he was shot at Bagumbayan in Manila. Though he had not planned the revolution, his death made him its martyr.",
    cites: [W("Jos%C3%A9_Rizal", "José Rizal"), { t: "Remembering José Rizal, Filipino Revolutionary — Library of Congress", u: "https://blogs.loc.gov/law/2024/02/remembering-jose-rizal-filipino-revolutionary/" }, { t: "José Rizal — Britannica", u: "https://www.britannica.com/biography/Jose-Rizal" }] },
  { id: "w207-ph-aguinaldo-captured", branch: "philippines", y: D(1901, 3, 23), when: "March 23, 1901", imp: 2,
    title: "Aguinaldo captured at Palanan",
    text: "Gen. Frederick Funston, aided by Macabebe Scouts, captured Emilio Aguinaldo in Isabela. His April oath of allegiance to the US ended the First Philippine Republic, though resistance lingered into 1902.",
    cites: [W("Emilio_Aguinaldo", "Emilio Aguinaldo"), { t: "The Philippine-American War — Office of the Historian", u: "https://history.state.gov/milestones/1899-1913/war" }, { t: "Emilio Aguinaldo y Famy — Library of Congress", u: "https://guides.loc.gov/world-of-1898/emilio-aguinaldo-famy" }] },
  { id: "w207-ph-first-assembly", branch: "philippines", y: D(1907, 10, 16), when: "October 16, 1907", imp: 2,
    title: "First Philippine Assembly inaugurated",
    text: "Elected the previous July, the Assembly met at the Manila Grand Opera House under Speaker Sergio Osmeña. It was the first fully elected national legislature in the islands' history.",
    cites: [W("Philippine_Assembly", "Philippine Assembly"), { t: "The First Philippine Assembly — BusinessMirror", u: "https://businessmirror.com.ph/2020/10/15/the-first-philippine-assembly/" }] },
  { id: "w207-ph-up-founded", branch: "philippines", y: D(1908, 6, 18), when: "June 18, 1908", imp: 3,
    title: "University of the Philippines founded",
    text: "Act No. 1870, passed under the American colonial government, created the University of the Philippines, which opened in Manila in 1909 and is now the national university.",
    cites: [W("University_of_the_Philippines", "University of the Philippines"), { t: "Honor, Excellence and Service to the Nation: UP in the Past 118 Years — University of the Philippines", u: "https://up.edu.ph/university-history/" }] },
  { id: "w207-ph-jones-law", branch: "philippines", y: D(1916, 8, 29), when: "August 29, 1916", imp: 2, link: "usa",
    title: "Jones Law promises eventual independence",
    text: "The Philippine Autonomy Act created a Senate and House chosen largely by election and was the first formal US pledge to grant independence once a stable government was established. A US governor-general remained.",
    cites: [W("Philippine_Autonomy_Act", "Philippine Autonomy Act"), { t: "Philippine Autonomy Act of 1916 — The LawPhil Project", u: "https://lawphil.net/consti/cons1916.html" }] },
  { id: "w207-ph-dalagang-bukid", branch: "philippines", y: D(1919, 9, 12), when: "September 12, 1919", imp: 3,
    title: "Dalagang Bukid, the first Filipino feature film",
    text: "José Nepomuceno produced and directed this film adaptation of a popular zarzuela. It premiered in Manila and is recognized as the first full-length Filipino-made feature.",
    cites: [W("Dalagang_Bukid", "Dalagang Bukid"), { t: "Sine Sandaan looks back on 100 years of Philippine cinema — Philstar.com", u: "https://www.philstar.com/entertainment/2019/09/11/1950661/sine-sandaan-looks-back-100-years-philippine-cinema" }] },
  // Qing
  { id: "w207-qing-zheng-yi-sao", branch: "qing", y: D(1810, 4, 20), when: "April 20, 1810", imp: 3,
    title: "Zheng Yi Sao's pirate fleet surrenders",
    text: "The widow Zheng Yi Sao and Zhang Bao surrendered to Guangdong officials with 17,318 pirates and 226 ships, ending their pirate confederation. She and her crews were pardoned.",
    cites: [W("Zheng_Yi_Sao", "Zheng Yi Sao"), { t: "Meet Legendary Pirate Zheng Yi Sao — Google Arts & Culture", u: "https://artsandculture.google.com/story/HgXxq6n_VWdsZQ" }] },
  { id: "w207-qing-wei-yuan-treatise", branch: "qing", y: 1843.5, when: "1843", imp: 3,
    title: "Wei Yuan's Illustrated Treatise on the Maritime Kingdoms",
    text: "Wei Yuan, building on Lin Zexu's materials, published a world geography urging China to master Western technology to resist the West. Expanded in 1847 and 1852, it influenced reformers in Japan.",
    cites: [W("Wei_Yuan", "Wei Yuan"), { t: "Wei Yuan — Britannica", u: "https://www.britannica.com/biography/Wei-Yuan" }] },
  { id: "w207-qing-summer-palace", branch: "qing", y: D(1860, 10, 18), when: "October 18, 1860", imp: 2,
    title: "Old Summer Palace burned",
    text: "In the Second Opium War, Lord Elgin ordered the Yuanmingyuan destroyed in reprisal for the torture deaths of Anglo-French captives. The palace was burned and its art treasures were looted.",
    cites: [W("Old_Summer_Palace", "Old Summer Palace"), { t: "Yuanmingyuan — Britannica", u: "https://www.britannica.com/topic/Yuanmingyuan" }] },
  { id: "w207-qing-jiangnan-arsenal", branch: "qing", y: 1865.4, when: "1865", imp: 2,
    title: "Jiangnan Arsenal founded in Shanghai",
    text: "Developed by Zeng Guofan and Li Hongzhang, the arsenal made firearms and ships and ran a translation bureau. It was a flagship of the Self-Strengthening Movement.",
    cites: [W("Jiangnan_Arsenal", "Jiangnan Arsenal"), { t: "Jiangnan Arsenal — Britannica", u: "https://www.britannica.com/topic/Jiangnan-Arsenal" }] },
  { id: "w207-qing-educational-mission", branch: "qing", y: 1872.7, end: 1881.5, when: "1872–1881", imp: 2, link: "usa",
    title: "Chinese Educational Mission sends boys to New England",
    text: "Yung Wing, the first Chinese graduate of Yale, led 120 boys to study in Connecticut and Massachusetts. Qing officials recalled them in 1881, fearing they were becoming Americanized.",
    cites: [W("Chinese_Educational_Mission", "Chinese Educational Mission"), { t: "Yung Wing’s Dream: The Chinese Educational Mission, 1872–1881 — Connecticut History", u: "https://connecticuthistory.org/yung-wings-dream-the-chinese-educational-mission-1872-1881/" }] },
  { id: "w207-qing-sino-french-war", branch: "qing", y: D(1884, 8, 23), end: D(1885, 6, 9), when: "1884–1885", imp: 2, link: "french-indochina",
    title: "Sino-French War over Tonkin",
    text: "France destroyed China's Fujian fleet and shipyard at Fuzhou in August 1884. The June 1885 Treaty of Tientsin had China recognize French protectorates over Tonkin and Annam, ending its claim of suzerainty over Vietnam.",
    cites: [W("Sino-French_War", "Sino-French War"), { t: "Sino-French War — Britannica", u: "https://www.britannica.com/topic/Sino-French-War" }] },
  { id: "w207-qing-boxer-protocol", branch: "qing", y: D(1901, 9, 7), when: "September 7, 1901", imp: 2,
    title: "Boxer Protocol signed in Beijing",
    text: "China agreed to pay 450 million taels over 39 years, raze the Taku forts, and accept foreign troops in a fortified legation quarter. A new Foreign Office replaced the Zongli Yamen.",
    cites: [W("Boxer_Protocol", "Boxer Protocol"), { t: "Final Protocol (Boxer Protocol) — Office of the Historian, FRUS 1901", u: "https://history.state.gov/historicaldocuments/frus1901China/d179" }] },
  // Argentina
  { id: "w207-ar-rosas-governor", branch: "argentina", y: D(1829, 12, 6), when: "December 6, 1829", imp: 2,
    title: "Rosas becomes governor of Buenos Aires",
    text: "Juan Manuel de Rosas, a federalist estancia owner, took power in Buenos Aires province. His rule, with an interval, lasted until Caseros in 1852 and dominated the Argentine Confederation.",
    cites: [W("Juan_Manuel_de_Rosas", "Juan Manuel de Rosas"), { t: "Juan Manuel de Rosas — Britannica", u: "https://www.britannica.com/biography/Juan-Manuel-de-Rosas" }] },
  { id: "w207-ar-facundo", branch: "argentina", y: 1845.4, when: "1845", imp: 2,
    title: "Sarmiento publishes Facundo",
    text: "Domingo Sarmiento, exiled in Chile, published Facundo in 1845. It indicted Rosas and framed Argentina as a struggle between European “civilization” and rural “barbarism.”",
    cites: [W("Domingo_Faustino_Sarmiento", "Domingo Faustino Sarmiento"), { t: "Domingo Faustino Sarmiento — Britannica", u: "https://www.britannica.com/biography/Domingo-Faustino-Sarmiento" }] },
  { id: "w207-ar-caseros", branch: "argentina", y: D(1852, 2, 3), when: "February 3, 1852", imp: 2,
    title: "Battle of Caseros overthrows Rosas",
    text: "Justo José de Urquiza's allied army of Entre Ríos, Corrientes, Brazil and Uruguay defeated Rosas, who fled to England. It led to the San Nicolás agreement and the 1853 Constitution.",
    cites: [W("Battle_of_Caseros", "Battle of Caseros"), { t: "Battle of Caseros — Britannica", u: "https://www.britannica.com/event/Battle-of-Caseros" }] },
  { id: "w207-ar-pavon", branch: "argentina", y: D(1861, 9, 17), when: "September 17, 1861", imp: 3,
    title: "Battle of Pavón: Buenos Aires prevails",
    text: "Bartolomé Mitre's Buenos Aires forces took the field after Urquiza withdrew. The Confederation government dissolved, Mitre became president, and Buenos Aires came to dominate the reunified nation.",
    cites: [W("Battle_of_Pav%C3%B3n", "Battle of Pavón"), { t: "Battle of Pavón — Britannica", u: "https://www.britannica.com/event/Battle-of-Pavon" }] },
  { id: "w207-ar-martin-fierro", branch: "argentina", y: 1872.5, when: "1872", imp: 2,
    title: "José Hernández publishes Martín Fierro",
    text: "Hernández's epic poem of a persecuted gaucho, with its 1879 sequel, became the touchstone of gauchesque poetry. It is widely seen as a touchstone of Argentine national literature.",
    cites: [W("Mart%C3%ADn_Fierro", "Martín Fierro"), { t: "José Hernández — Britannica", u: "https://www.britannica.com/biography/Jose-Hernandez" }] },
  { id: "w207-ar-law-1420", branch: "argentina", y: 1884.5, when: "1884", imp: 2,
    title: "Law 1420 mandates free secular schooling",
    text: "Under President Roca, Congress established universal, compulsory, free and secular primary education. The secular character strained relations between the state and the Catholic Church.",
    cites: [W("Education_in_Argentina", "Education in Argentina"), { t: "Ley 1420 — UBA Noticias", u: "https://www.uba.ar/ubanoticias/noticias/771" }] },
  { id: "w207-ar-park-revolution", branch: "argentina", y: D(1890, 7, 26), end: D(1890, 7, 29), when: "July 26–29, 1890", imp: 2,
    title: "Revolution of the Park",
    text: "The new Civic Union and rebel officers rose in Buenos Aires against President Juárez Celman amid economic crisis. Defeated militarily, it forced his resignation on August 6 and gave rise to the Radical Civic Union.",
    cites: [W("Revolution_of_the_Park", "Revolution of the Park"), { t: "Miguel Juárez Celman — Britannica", u: "https://www.britannica.com/biography/Miguel-Juarez-Celman" }] },
  { id: "w207-ar-teatro-colon", branch: "argentina", y: D(1908, 5, 25), when: "May 25, 1908", imp: 2,
    title: "Teatro Colón opens with Aida",
    text: "After about twenty years of building, the horseshoe-shaped opera house opened in Buenos Aires with Verdi's Aida. Its acoustics are often ranked among the world's best, and it became a center of South American opera and ballet.",
    cites: [W("Teatro_Col%C3%B3n", "Teatro Colón"), { t: "Teatro Colón — Buenos Aires city government", u: "https://buenosaires.gob.ar/gcaba_historico/teatro-colon" }] },
] });
TL.geo("w207-dei-max-havelaar", { scope: "region", lat: -6.65, lon: 106.22, r: 100, label: "Lebak, Banten, Java", src: "https://en.wikipedia.org/wiki/Lebak_Regency" });
TL.geo("w207-dei-krakatoa", { scope: "place", lat: -6.1, lon: 105.42, r: 100, label: "Krakatoa, Sunda Strait", src: "https://en.wikipedia.org/wiki/Krakatoa" });
TL.geo("w207-dei-ethical-policy", { scope: "region", lat: -7.49, lon: 110, r: 1500, label: "Dutch East Indies", src: "https://en.wikipedia.org/wiki/Java" });
TL.geo("w207-dei-budi-utomo", { scope: "place", lat: -6.18, lon: 106.83, r: 40, label: "Batavia (Jakarta)", src: "https://en.wikipedia.org/wiki/Jakarta" });
TL.geo("w207-dei-kartini-letters", { scope: "place", lat: -6.53, lon: 110.67, r: 60, label: "Jepara, Java", src: "https://en.wikipedia.org/wiki/Jepara" });
TL.geo("w207-fi-doumer", { scope: "place", lat: 21, lon: 105.85, r: 40, label: "Hanoi", src: "https://en.wikipedia.org/wiki/Hanoi" });
TL.geo("w207-fi-dong-du", { scope: "place", lat: 35.69, lon: 139.69, r: 50, label: "Tokyo", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w207-fi-dong-kinh", { scope: "place", lat: 21, lon: 105.85, r: 40, label: "Hanoi", src: "https://en.wikipedia.org/wiki/Hanoi" });
TL.geo("w207-fi-duy-tan-revolt", { scope: "place", lat: 16.46, lon: 107.59, r: 50, label: "Huế", src: "https://en.wikipedia.org/wiki/Hu%E1%BA%BF" });
TL.geo("w207-jp-siebold-dejima", { scope: "place", lat: 32.74, lon: 129.87, r: 30, label: "Dejima, Nagasaki", src: "https://en.wikipedia.org/wiki/Dejima" });
TL.geo("w207-jp-great-wave", { scope: "region", lat: 35.36, lon: 138.73, r: 150, label: "Mount Fuji and Kanagawa coast", src: "https://en.wikipedia.org/wiki/Mount_Fuji" });
TL.geo("w207-jp-tenpo-reforms", { scope: "place", lat: 35.69, lon: 139.69, r: 50, label: "Edo (Tokyo)", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w207-jp-first-railway", { scope: "place", lat: 35.67, lon: 139.76, r: 50, label: "Shimbashi, Tokyo", src: "https://en.wikipedia.org/wiki/Shinbashi_Station" });
TL.geo("w207-jp-satsuma-rebellion", { scope: "place", lat: 31.6, lon: 130.55, r: 120, label: "Kagoshima", src: "https://en.wikipedia.org/wiki/Kagoshima" });
TL.geo("w207-jp-ukigumo", { scope: "place", lat: 35.69, lon: 139.69, r: 50, label: "Tokyo", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w207-jp-meiji-constitution", { scope: "place", lat: 35.69, lon: 139.69, r: 50, label: "Tokyo", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w207-jp-first-diet", { scope: "place", lat: 35.69, lon: 139.69, r: 50, label: "Tokyo", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w207-jp-rashomon", { scope: "place", lat: 35.69, lon: 139.69, r: 50, label: "Tokyo", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("w207-jp-rice-riots", { scope: "region", lat: 36.72, lon: 137.15, r: 800, label: "Japan (starting in Toyama)", src: "https://en.wikipedia.org/wiki/Toyama_Prefecture" });
TL.geo("w207-jo-sinyu-persecution", { scope: "place", lat: 37.56, lon: 126.99, r: 50, label: "Seoul", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w207-jo-sehando", { scope: "place", lat: 33.38, lon: 126.53, r: 60, label: "Jeju Island", src: "https://en.wikipedia.org/wiki/Jeju_Island" });
TL.geo("w207-jo-donghak-founded", { scope: "place", lat: 35.85, lon: 129.22, r: 40, label: "Gyeongju", src: "https://en.wikipedia.org/wiki/Gyeongju" });
TL.geo("w207-jo-daedongyeojido", { scope: "region", lat: 38.32, lon: 127.23, r: 400, label: "Korea", src: "https://en.wikipedia.org/wiki/Korea" });
TL.geo("w207-jo-gapsin-coup", { scope: "place", lat: 37.56, lon: 126.99, r: 40, label: "Seoul", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w207-jo-donghak-revolution", { scope: "place", lat: 35.57, lon: 126.86, r: 100, label: "Jeongeup, Jeolla", src: "https://en.wikipedia.org/wiki/Jeongeup" });
TL.geo("w207-jo-queen-min-killed", { scope: "place", lat: 37.58, lon: 126.98, r: 30, label: "Gyeongbokgung, Seoul", src: "https://en.wikipedia.org/wiki/Gyeongbokgung" });
TL.geo("w207-ke-eulsa-treaty", { scope: "place", lat: 37.56, lon: 126.99, r: 40, label: "Seoul", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w207-ke-ito-assassinated", { scope: "place", lat: 45.76, lon: 126.64, r: 40, label: "Harbin", src: "https://en.wikipedia.org/wiki/Harbin" });
TL.geo("w207-ke-march-first", { scope: "place", lat: 37.56, lon: 126.99, r: 50, label: "Seoul", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("w207-ph-noli-me-tangere", { scope: "place", lat: 52.52, lon: 13.4, r: 40, label: "Berlin", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("w207-ph-rizal-executed", { scope: "place", lat: 14.6, lon: 120.98, r: 30, label: "Manila", src: "https://en.wikipedia.org/wiki/Manila" });
TL.geo("w207-ph-aguinaldo-captured", { scope: "place", lat: 17.06, lon: 122.43, r: 50, label: "Palanan, Isabela", src: "https://en.wikipedia.org/wiki/Palanan,_Isabela" });
TL.geo("w207-ph-first-assembly", { scope: "place", lat: 14.6, lon: 120.98, r: 30, label: "Manila", src: "https://en.wikipedia.org/wiki/Manila" });
TL.geo("w207-ph-up-founded", { scope: "place", lat: 14.6, lon: 120.98, r: 30, label: "Manila", src: "https://en.wikipedia.org/wiki/Manila" });
TL.geo("w207-ph-jones-law", { scope: "place", lat: 38.9, lon: -77.02, r: 40, label: "Washington, D.C.", src: "https://en.wikipedia.org/wiki/Washington,_D.C." });
TL.geo("w207-ph-dalagang-bukid", { scope: "place", lat: 14.6, lon: 120.98, r: 30, label: "Manila", src: "https://en.wikipedia.org/wiki/Manila" });
TL.geo("w207-qing-zheng-yi-sao", { scope: "region", lat: 22.53, lon: 113.73, r: 120, label: "Pearl River Delta", src: "https://en.wikipedia.org/wiki/Pearl_River_Delta" });
TL.geo("w207-qing-wei-yuan-treatise", { scope: "region", lat: 35, lon: 103, r: 600, label: "China", src: "https://en.wikipedia.org/wiki/China" });
TL.geo("w207-qing-summer-palace", { scope: "place", lat: 40.01, lon: 116.29, r: 30, label: "Old Summer Palace, Beijing", src: "https://en.wikipedia.org/wiki/Old_Summer_Palace" });
TL.geo("w207-qing-jiangnan-arsenal", { scope: "place", lat: 31.23, lon: 121.47, r: 40, label: "Shanghai", src: "https://en.wikipedia.org/wiki/Shanghai" });
TL.geo("w207-qing-educational-mission", { scope: "place", lat: 41.76, lon: -72.68, r: 80, label: "Hartford, Connecticut", src: "https://en.wikipedia.org/wiki/Hartford,_Connecticut" });
TL.geo("w207-qing-sino-french-war", { scope: "place", lat: 26.07, lon: 119.3, r: 120, label: "Fuzhou", src: "https://en.wikipedia.org/wiki/Fuzhou" });
TL.geo("w207-qing-boxer-protocol", { scope: "place", lat: 39.91, lon: 116.39, r: 40, label: "Beijing", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("w207-ar-rosas-governor", { scope: "place", lat: -34.6, lon: -58.38, r: 60, label: "Buenos Aires", src: "https://en.wikipedia.org/wiki/Buenos_Aires" });
TL.geo("w207-ar-facundo", { scope: "place", lat: -33.44, lon: -70.65, r: 60, label: "Santiago, Chile", src: "https://en.wikipedia.org/wiki/Santiago" });
TL.geo("w207-ar-caseros", { scope: "place", lat: -34.61, lon: -58.56, r: 40, label: "Caseros, Buenos Aires", src: "https://en.wikipedia.org/wiki/Caseros,_Buenos_Aires" });
TL.geo("w207-ar-pavon", { scope: "place", lat: -33.25, lon: -60.38, r: 80, label: "Pavón, Santa Fe", src: "https://en.wikipedia.org/wiki/Battle_of_Pav%C3%B3n" });
TL.geo("w207-ar-martin-fierro", { scope: "place", lat: -34.6, lon: -58.38, r: 60, label: "Buenos Aires", src: "https://en.wikipedia.org/wiki/Buenos_Aires" });
TL.geo("w207-ar-law-1420", { scope: "place", lat: -34.6, lon: -58.38, r: 60, label: "Buenos Aires", src: "https://en.wikipedia.org/wiki/Buenos_Aires" });
TL.geo("w207-ar-park-revolution", { scope: "place", lat: -34.6, lon: -58.38, r: 60, label: "Buenos Aires", src: "https://en.wikipedia.org/wiki/Buenos_Aires" });
TL.geo("w207-ar-teatro-colon", { scope: "place", lat: -34.6, lon: -58.38, r: 30, label: "Teatro Colón, Buenos Aires", src: "https://en.wikipedia.org/wiki/Teatro_Col%C3%B3n" });
