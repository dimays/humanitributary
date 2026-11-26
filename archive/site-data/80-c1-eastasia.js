// c1ea: culture of East, Central and Southeast Asia, 1900 to today (literature, film, animation, music, sport, architecture, everyday life)
const c1eaD = (y, m, d) => y + ([0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][m - 1] + d - 0.5) / 365;
const WP = (t, u) => ({ t: t + " — Wikipedia", u: "https://en.wikipedia.org/wiki/" + u });
const BR = (t, u) => ({ t: t + " — Encyclopaedia Britannica", u: "https://www.britannica.com/" + u });
const NB = (t, u) => ({ t: t + " – Facts - NobelPrize.org", u: "https://www.nobelprize.org/prizes/" + u + "/facts/" });
TL.add({ events: [
  { id: "c1ea-soseki-i-am-a-cat", branch: "japan", y: 1905.5, end: 1906.5, when: "1905–1906", imp: 2,
    title: "Natsume Sōseki publishes I Am a Cat",
    text: "Two very successful comic novels, I Am a Cat (1905–06) and Botchan (1906), made Natsume Sōseki's reputation. His heroes are typically educated middle-class men cut off from others by guilt or disillusionment.",
    cites: [BR("Natsume Sōseki", "biography/Natsume-Soseki")] },
  { id: "c1ea-lu-xun-madman", branch: "roc", y: 1918.3, when: "1918", imp: 2,
    title: "Lu Xun publishes “Diary of a Madman”",
    text: "Lu Xun's story, whose narrator sees cannibalism in village life and the Confucian classics, is often called China's first modern short story. Britannica calls it the first Western-style story published in vernacular Chinese; it critiqued Confucian culture and influenced the New Culture Movement.",
    cites: [WP("Diary of a Madman (Lu Xun)", "Diary_of_a_Madman_(Lu_Xun)"), BR("Lu Xun", "biography/Lu-Xun")] },
  { id: "c1ea-mei-lanfang-us-tour", branch: "roc", y: 1930.2, when: "1930", imp: 3,
    title: "Mei Lanfang takes Peking opera to the United States",
    text: "The Peking opera star Mei Lanfang toured the United States in 1930, after earlier tours of Japan (1919, 1924) and before visits to the Soviet Union (1932, 1935).",
    cites: [BR("Mei Lanfang", "biography/Mei-Lanfang")] },
  { id: "c1ea-arirang-film", branch: "korean-empire", y: c1eaD(1926, 10, 1), when: "October 1, 1926", imp: 3,
    title: "Na Woon-gyu's silent film Arirang premieres in Seoul",
    text: "Directed by and starring Na Woon-gyu, Arirang is regarded as Korea's first nationalist film, though censorship kept its content muted. It was a commercial success; the film itself is lost.",
    cites: [{ t: "Arirang — Korea.net", u: "https://www.korea.net/NewsFocus/Culture/view?articleId=122708" }, WP("Arirang (1926 film)", "Arirang_(1926_film)")] },
  { id: "c1ea-yukawa-nobel", branch: "japan", y: 1949.85, when: "1949", imp: 2,
    title: "Yukawa Hideki wins the Nobel Prize in Physics",
    text: "Yukawa was honored for predicting the existence of mesons from theoretical work on nuclear forces.",
    cites: [{ t: "Hideki Yukawa – Facts - NobelPrize.org", u: "https://www.nobelprize.org/prizes/physics/1949/yukawa/facts/" }] },
  { id: "c1ea-tokyo-story", branch: "japan", y: c1eaD(1953, 11, 3), when: "November 3, 1953", imp: 2,
    title: "Ozu's Tokyo Story is released",
    text: "Yasujirō Ozu's quiet family drama is now ranked among the greatest films ever made, placing third in critics' Sight and Sound poll in 2012. Britannica cites it among works that exemplify his restrained style.",
    cites: [WP("Tokyo Story", "Tokyo_Story"), BR("Ozu Yasujirō", "biography/Ozu-Yasujiro")] },
  { id: "c1ea-godzilla", branch: "japan", y: 1954.85, when: "1954", imp: 2,
    title: "Godzilla (Gojira) premieres",
    text: "The 1954 Japanese science-fiction film cast its monster as a metaphor for the atomic bombings of Hiroshima and Nagasaki. Godzilla grew into a global pop-culture icon.",
    cites: [BR("Godzilla", "topic/Godzilla")] },
  { id: "c1ea-instant-noodles", branch: "japan", y: c1eaD(1958, 8, 25), when: "August 25, 1958", imp: 2,
    title: "Momofuku Ando launches Chikin Ramen, the first instant noodles",
    text: "Nissin's Chikin Ramen, a dried noodle and seasoning mix cooked in minutes, created instant packaged ramen. Nissin introduced Cup Noodles in 1971.",
    cites: [WP("Instant noodle", "Instant_noodle"), BR("Ramen", "topic/ramen")] },
  { id: "c1ea-astro-boy-anime", branch: "japan", y: 1963.0, end: 1966.99, when: "1963–1966", imp: 2,
    title: "Astro Boy debuts as an animated TV series",
    text: "Osamu Tezuka's manga robot hero aired on Fuji TV from January 1, 1963, to December 31, 1966. It was among the earliest Japanese animated television programs to reach audiences beyond Japan.",
    cites: [BR("Astro Boy", "topic/Astro-Boy"), WP("Astro Boy (1963 TV series)", "Astro_Boy_(1963_TV_series)")] },
  { id: "c1ea-npm-taipei", branch: "roc", y: c1eaD(1965, 11, 12), when: "November 12, 1965", imp: 2,
    title: "National Palace Museum opens in Taipei",
    text: "The Republic of China opened a museum in Taipei to house imperial collections moved from the mainland, on the centenary of Sun Yat-sen's birth. It now holds more than 650,000 objects and documents.",
    cites: [WP("National Palace Museum", "National_Palace_Museum"), BR("National Palace Museum", "topic/National-Palace-Museum")] },
  { id: "c1ea-model-operas", branch: "prc", y: 1966.5, when: "from 1966", imp: 3,
    title: "Revolutionary model operas replace traditional theater",
    text: "Jiang Qing, who had sponsored Peking opera reform from 1963, championed eight model plays during the Cultural Revolution. They dramatized revolutionary struggle; traditional opera was banned as “feudalistic and bourgeois.”",
    cites: [BR("Jiang Qing", "biography/Jiang-Qing"), WP("Revolutionary opera", "Revolutionary_opera")] },
  { id: "c1ea-expo-70", branch: "japan", y: c1eaD(1970, 3, 15), end: c1eaD(1970, 9, 13), when: "March 15 – September 13, 1970", imp: 2,
    title: "Expo '70 draws 64 million visitors to Osaka",
    text: "The world's fair, themed “Progress and Harmony for Mankind,” had Kenzō Tange as its main planner. About 64.2 million people visited; Tarō Okamoto's Tower of the Sun still stands.",
    cites: [{ t: "Expo 1970 Osaka — Expomuseum", u: "https://www.expomuseum.com/expos/expo-1970-osaka" }, WP("Expo '70", "Expo_%2770")] },
  { id: "c1ea-cloud-gate", branch: "roc", y: 1973.5, when: "1973", imp: 3,
    title: "Lin Hwai-min founds Cloud Gate Dance Theatre",
    text: "Choreographer Lin Hwai-min founded Cloud Gate Dance Theatre of Taiwan in Taipei in 1973. It is a modern dance company based in Taiwan.",
    cites: [{ t: "Founder — Cloud Gate Dance Theatre of Taiwan", u: "https://www.cloudgate.org.tw/en/about/founder" }, WP("Cloud Gate Dance Theatre", "Cloud_Gate_Dance_Theatre")] },
  { id: "c1ea-enter-the-dragon", branch: "uk", y: c1eaD(1973, 7, 26), when: "July 26, 1973", imp: 2,
    title: "Enter the Dragon opens in Hong Kong after Bruce Lee's death",
    text: "Bruce Lee, who helped popularize martial-arts movies in the 1970s, died in British-ruled Hong Kong on July 20, 1973, six days before his film Enter the Dragon was released there.",
    cites: [BR("Bruce Lee", "biography/Bruce-Lee"), WP("Enter the Dragon", "Enter_the_Dragon"), WP("Bruce Lee", "Bruce_Lee")] },
  { id: "c1ea-walkman", branch: "japan", y: c1eaD(1979, 7, 1), when: "July 1, 1979", imp: 2,
    title: "Sony launches the Walkman",
    text: "Sony's TPS-L2 went on sale in Japan for about 33,000 yen and sold over 30,000 units in two months. It popularized private, portable listening worldwide.",
    cites: [WP("Walkman", "Walkman"), BR("Sony Walkman", "topic/Sony-Walkman")] },
  { id: "c1ea-yellow-earth", branch: "prc", y: 1984.5, when: "1984", imp: 3,
    title: "Chen Kaige's Yellow Earth wins acclaim",
    text: "Chen Kaige's first film, Yellow Earth (Huang tudi), told of a communist soldier who visits a village to collect old songs, and won critical acclaim.",
    cites: [BR("Yellow Earth", "topic/Yellow-Earth")] },
  { id: "c1ea-tange-pritzker", branch: "japan", y: 1987.4, when: "1987", imp: 3,
    title: "Tange Kenzō wins the Pritzker Architecture Prize",
    text: "Kenzō Tange, who led the master plan of Expo '70, received architecture's highest honor in 1987 and the Praemium Imperiale in 1993.",
    cites: [BR("Tange Kenzō", "biography/Tange-Kenzo")] },
  { id: "c1ea-akira", branch: "japan", y: c1eaD(1988, 7, 16), when: "July 16, 1988", imp: 3,
    title: "Otomo Katsuhiro's anime film Akira is released",
    text: "Adapted from Otomo's manga, Akira is credited with helping make anime popular outside Japan and with showing Western audiences that animation was not only for children.",
    cites: [WP("Akira (1988 film)", "Akira_(1988_film)")] },
  { id: "c1ea-city-of-sadness", branch: "roc", y: c1eaD(1989, 9, 9), when: "September 1989", imp: 2,
    title: "A City of Sadness wins the Golden Lion at Venice",
    text: "Hou Hsiao-hsien's film follows a family through the February 28 Incident and the repression that followed. It was the first Taiwanese film to depict that event, and the first to deal openly with Kuomintang authoritarian rule.",
    cites: [{ t: "A City of Sadness — M+", u: "https://www.mplus.org.hk/en/cinema/rediscoveries/city-of-sadness/" }, WP("A City of Sadness", "A_City_of_Sadness")] },
  { id: "c1ea-j-league", branch: "japan", y: c1eaD(1993, 5, 15), when: "May 15, 1993", imp: 3,
    title: "J.League begins professional soccer in Japan",
    text: "The J.League opened with Verdy Kawasaki hosting Yokohama Marinos at the Tokyo National Stadium, launching the country's first fully professional soccer league.",
    cites: [WP("J.League", "J.League")] },
  { id: "c1ea-papaya", branch: "vietnam", y: 1993.4, when: "1993", imp: 3,
    title: "The Scent of Green Papaya wins the Caméra d'Or",
    text: "Tran Anh Hung's debut, set in 1951 Saigon but shot on a French soundstage, won best first feature at Cannes in 1993 and an Oscar nomination for Best Foreign Language Film.",
    cites: [WP("The Scent of Green Papaya", "The_Scent_of_Green_Papaya")] },
  { id: "c1ea-farewell-concubine", branch: "prc", y: 1993.4, when: "May 1993", imp: 2,
    title: "Farewell My Concubine wins the Palme d'Or",
    text: "Chen Kaige's film shared the 1993 Cannes top prize with The Piano, the first Chinese film so honored. It was temporarily banned in China for its depiction of homosexual love.",
    cites: [BR("Farewell My Concubine", "topic/Farewell-My-Concubine")] },
  { id: "c1ea-oe-nobel", branch: "japan", y: 1994.78, when: "1994", imp: 2,
    title: "Ōe Kenzaburō wins the Nobel Prize in Literature",
    text: "Ōe was honored for creating “an imagined world, where life and myth condense to form a disconcerting picture of the human predicament today.”",
    cites: [NB("Kenzaburo Oe", "literature/1994/oe")] },
  { id: "c1ea-pokemon", branch: "japan", y: c1eaD(1996, 2, 27), when: "February 27, 1996", imp: 2,
    title: "Pocket Monsters Red and Green launch on the Game Boy",
    text: "Satoshi Tajiri's Game Freak and Nintendo released the first Pokémon games in Japan; trading over the Game Link Cable helped start a multibillion-dollar franchise.",
    cites: [BR("Pokémon electronic game series", "topic/Pokemon-electronic-game"), WP("Pokémon Red, Blue, and Yellow", "Pok%C3%A9mon_Red_and_Blue")] },
  { id: "c1ea-seo-taiji", branch: "south-korea", y: c1eaD(1992, 4, 11), when: "April 11, 1992", imp: 2,
    title: "Seo Taiji and Boys debut, the seed of K-pop",
    text: "Britannica traces K-pop's origins to the group's debut with “Nan Arayo.” Its success prompted censorship reform and the rise of specialist entertainment companies.",
    cites: [BR("K-pop", "topic/K-pop")] },
  { id: "c1ea-world-cup-2002", branch: "south-korea", y: c1eaD(2002, 5, 31), end: c1eaD(2002, 6, 30), when: "May 31 – June 30, 2002", imp: 2,
    title: "South Korea and Japan co-host the first Asian World Cup",
    text: "The 2002 FIFA World Cup, the first held in Asia, was shared by South Korea and Japan. South Korea reached the semi-finals and finished fourth.",
    cites: [{ t: "Japan-South Korea (2002) — Library of Congress", u: "https://guides.loc.gov/world-cup/japan-south-korea-2002" }, WP("2002 FIFA World Cup", "2002_FIFA_World_Cup")] },
  { id: "c1ea-mass-games-arirang", branch: "north-korea", y: 2002.3, when: "2002", imp: 3,
    title: "North Korea stages the first Arirang mass games",
    text: "Held in Pyongyang's May Day Stadium, the show uses tens of thousands of performers and card-stunt mosaics. Guinness World Records named it the largest gymnastic display in August 2007.",
    cites: [WP("Arirang Mass Games", "Arirang_Festival")] },
  { id: "c1ea-spirited-away", branch: "japan", y: 2001.55, when: "2001", imp: 2,
    title: "Miyazaki's Spirited Away is released",
    text: "Among Miyazaki Hayao's most acclaimed works, the 2001 animated fantasy follows 10-year-old Chihiro through a spirit world after her parents turn into pigs.",
    cites: [BR("Spirited Away", "topic/Spirited-Away")] },
  { id: "c1ea-gao-nobel", branch: "prc", y: 2000.78, when: "2000", imp: 3,
    title: "Chinese-born Gao Xingjian wins the Nobel Prize in Literature",
    text: "The Chinese-language novelist and playwright, who settled in France and became a French citizen, was honored for an œuvre that “opened new paths for the Chinese novel and drama.”",
    cites: [NB("Gao Xingjian", "literature/2000/gao")] },
  { id: "c1ea-yao-ming-draft", branch: "prc", y: 2002.5, when: "2002", imp: 3,
    title: "Yao Ming goes first overall in the NBA draft",
    text: "The 7-foot-6 center was taken by the Houston Rockets with the first pick and was voted an All-Star starter in his first season.",
    cites: [BR("Yao Ming", "biography/Yao-Ming")] },
  { id: "c1ea-batik-unesco", branch: "indonesia", y: c1eaD(2009, 10, 1), when: "2009", imp: 3,
    title: "UNESCO lists Indonesian batik as intangible heritage",
    text: "Batik, hand-dyed cloth drawn with hot wax, entered UNESCO's Representative List in 2009. It marks Indonesians' lives from birth to death, in weddings and rituals.",
    cites: [{ t: "Indonesian Batik — UNESCO Intangible Cultural Heritage", u: "https://ich.unesco.org/en/RL/indonesian-batik-00170" }] },
  { id: "c1ea-gangnam-style", branch: "south-korea", y: c1eaD(2012, 7, 15), when: "July 15, 2012", imp: 2,
    title: "PSY's “Gangnam Style” becomes YouTube's first billion-view video",
    text: "The Korean pop video's horse-riding dance spread worldwide after its July 2012 release; it reached 1 billion views on December 21, 2012.",
    cites: [WP("Gangnam Style", "Gangnam_Style"), BR("PSY", "biography/Psy")] },
  { id: "c1ea-mo-yan-nobel", branch: "prc", y: 2012.78, when: "2012", imp: 2,
    title: "Mo Yan wins the Nobel Prize in Literature",
    text: "Honored for writing that “with hallucinatory realism merges folk tales, history and the contemporary,” Mo Yan won the 2012 literature prize.",
    cites: [NB("Mo Yan", "literature/2012/yan")] },
  { id: "c1ea-tu-youyou-nobel", branch: "prc", y: 2015.77, when: "2015", imp: 2,
    title: "Tu Youyou wins the Nobel Prize for her malaria therapy",
    text: "Tu, of the China Academy of Traditional Chinese Medicine, shared the 2015 prize for discoveries concerning a novel therapy against malaria.",
    cites: [{ t: "Tu Youyou – Facts - NobelPrize.org", u: "https://www.nobelprize.org/prizes/medicine/2015/tu/facts/" }] },
  { id: "c1ea-squid-game", branch: "south-korea", y: c1eaD(2021, 9, 17), when: "September 2021", imp: 2,
    title: "Netflix releases Squid Game",
    text: "Hwang Dong-hyuk's thriller about people in desperate financial straits became a global hit.",
    cites: [BR("Squid Game", "topic/Squid-Game")] },
  { id: "c1ea-han-kang-nobel", branch: "south-korea", y: 2024.78, when: "2024", imp: 2,
    title: "Han Kang wins the Nobel Prize in Literature",
    text: "Han Kang was honored for “intense poetic prose that confronts historical traumas and exposes the fragility of human life.” Her novel The Vegetarian won the 2016 International Booker Prize.",
    cites: [{ t: "Han Kang – Facts - NobelPrize.org", u: "https://www.nobelprize.org/prizes/literature/2024/han/facts/" }, BR("Han Kang", "biography/Han-Kang")] },
  { id: "c1ea-bumi-manusia", branch: "indonesia", y: 1980.6, when: "1980", imp: 2,
    title: "Pramoedya publishes This Earth of Mankind",
    text: "Written while he was a political prisoner on Buru, the first Buru Quartet novel portrays colonial injustice in the Dutch East Indies. It was banned in 1981 and legally reprinted in 2005.",
    cites: [WP("This Earth of Mankind", "Bumi_Manusia"), BR("Pramoedya Ananta Toer", "biography/Pramoedya-Ananta-Toer")] },
  { id: "c1ea-manila-claws-of-light", branch: "philippines", y: c1eaD(1975, 7, 16), when: "July 16, 1975", imp: 2,
    title: "Lino Brocka's Manila in the Claws of Light is released",
    text: "Brocka's film, from Edgardo Reyes's novel, is widely voted the greatest Philippine film. A restoration premiered at Cannes in 2013.",
    cites: [{ t: "Manila in the Claws of Light — BAMPFA", u: "https://bampfa.org/event/manila-claws-light" }, WP("Manila in the Claws of Light", "Manila_in_the_Claws_of_Light")] },
  { id: "c1ea-ccp-opens", branch: "philippines", y: c1eaD(1969, 9, 8), when: "September 8, 1969", imp: 3,
    title: "Cultural Center of the Philippines opens its theater",
    text: "The Tanghalang Pambansa, designed by Leandro Locsin, opened in 1969 for the center created by Marcos's 1966 order. The National Artist Awards were instituted the same year.",
    cites: [WP("Cultural Center of the Philippines", "Cultural_Center_of_the_Philippines")] },
  { id: "c1ea-hidilyn-gold", branch: "philippines", y: c1eaD(2021, 7, 26), when: "July 26, 2021", imp: 2,
    title: "Hidilyn Diaz wins the Philippines' first Olympic gold",
    text: "Diaz won the women's 55 kg weightlifting at Tokyo 2020 with Olympic records, the country's first gold since it began competing in 1924.",
    cites: [{ t: "Weightlifter Hidilyn Diaz wins gold, ends Philippines' 97-year drought — ESPN", u: "https://www.espn.com/olympics/story/_/id/31888893/weightlifter-hidilyn-diaz-wins-gold-ends-philippines-century-drought" }, WP("Hidilyn Diaz", "Hidilyn_Diaz")] },
  { id: "c1ea-petronas-towers", branch: "malaysia", y: 1998.5, when: "1998", imp: 2,
    title: "Petronas Towers rise in Kuala Lumpur",
    text: "Designed by César Pelli for the national oil company, the twin towers were completed in 1998 and were the world's tallest buildings until Taipei 101 surpassed them in the early 2000s.",
    cites: [BR("Petronas Twin Towers", "topic/Petronas-Twin-Towers"), WP("Petronas Towers", "Petronas_Towers")] },
  { id: "c1ea-yeoh-oscar", branch: "malaysia", y: 2023.2, when: "2023", imp: 2,
    title: "Michelle Yeoh is first Asian Best Actress Oscar winner",
    text: "The Malaysian-born actress won the Academy Award for Everything Everywhere All at Once, the first Asian performer to win Best Actress.",
    cites: [BR("Michelle Yeoh", "biography/Michelle-Yeoh")] },
  { id: "c1ea-schooling-gold", branch: "singapore", y: c1eaD(2016, 8, 12), when: "August 12, 2016", imp: 2,
    title: "Joseph Schooling wins Singapore's first Olympic gold",
    text: "Schooling won the 100 m butterfly at Rio in 50.39 seconds, an Olympic record, while Michael Phelps tied for silver.",
    cites: [{ t: "Schooling knocks off Phelps for 100m butterfly gold — theScore", u: "https://www.thescore.com/news/1076563/schooling-knocks-off-phelps-for-100-m-butterfly-gold" }, WP("Joseph Schooling", "Joseph_Schooling")] },
  { id: "c1ea-angkor-world-heritage", branch: "cambodia", y: 1992.9, when: "1992", imp: 2,
    title: "Angkor is inscribed on the World Heritage List",
    text: "Angkor, the capital of the Khmer empire from the 9th to the 15th century, was designated a World Heritage site in 1992.",
    cites: [BR("Angkor", "place/Angkor")] },
  { id: "c1ea-ang-lee-oscar", branch: "roc", y: 2006.2, when: "2006", imp: 3,
    title: "Ang Lee is first person of color to win Best Director Oscar",
    text: "Taiwan-born Ang Lee won for Brokeback Mountain; he won a second directing Oscar for Life of Pi.",
    cites: [BR("Ang Lee", "biography/Ang-Lee")] },
  { id: "c1ea-beijing-2022", branch: "prc", y: c1eaD(2022, 2, 4), end: c1eaD(2022, 2, 20), when: "February 4–20, 2022", imp: 2,
    title: "Beijing hosts the Winter Olympics",
    text: "Beijing became the first city to host both Summer and Winter Games, with events in Beijing, Yanqing and Zhangjiakou.",
    cites: [BR("Beijing 2022 Olympic Winter Games", "event/Beijing-2022-Olympic-Winter-Games"), WP("2022 Winter Olympics", "2022_Winter_Olympics")] },
] });
TL.geo("c1ea-soseki-i-am-a-cat", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Tokyo, Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("c1ea-lu-xun-madman", { scope: "place", lat: 39.91, lon: 116.4, r: 40, label: "Beijing, China", src: "https://en.wikipedia.org/wiki/Beijing" });
TL.geo("c1ea-mei-lanfang-us-tour", { scope: "region", lat: 40, lon: -100, r: 2500, label: "United States", src: "https://en.wikipedia.org/wiki/United_States" });
TL.geo("c1ea-arirang-film", { scope: "place", lat: 37.56, lon: 126.99, r: 40, label: "Seoul, Korea", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("c1ea-yukawa-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("c1ea-tokyo-story", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Tokyo, Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("c1ea-godzilla", { scope: "region", lat: 36, lon: 138, r: 800, label: "Japan", src: "https://en.wikipedia.org/wiki/Japan" });
TL.geo("c1ea-instant-noodles", { scope: "place", lat: 34.82, lon: 135.43, r: 40, label: "Ikeda, Osaka", src: "https://en.wikipedia.org/wiki/Ikeda,_Osaka" });
TL.geo("c1ea-astro-boy-anime", { scope: "region", lat: 36, lon: 138, r: 800, label: "Japan", src: "https://en.wikipedia.org/wiki/Japan" });
TL.geo("c1ea-npm-taipei", { scope: "place", lat: 25.1, lon: 121.55, r: 40, label: "Shilin, Taipei", src: "https://en.wikipedia.org/wiki/National_Palace_Museum" });
TL.geo("c1ea-model-operas", { scope: "region", lat: 35, lon: 103, r: 2500, label: "China", src: "https://en.wikipedia.org/wiki/China" });
TL.geo("c1ea-expo-70", { scope: "place", lat: 34.76, lon: 135.52, r: 40, label: "Suita, Osaka", src: "https://en.wikipedia.org/wiki/Suita" });
TL.geo("c1ea-cloud-gate", { scope: "place", lat: 25.04, lon: 121.56, r: 40, label: "Taipei, Taiwan", src: "https://en.wikipedia.org/wiki/Taipei" });
TL.geo("c1ea-enter-the-dragon", { scope: "place", lat: 22.3, lon: 114.2, r: 40, label: "Hong Kong", src: "https://en.wikipedia.org/wiki/Hong_Kong" });
TL.geo("c1ea-walkman", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Tokyo, Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("c1ea-yellow-earth", { scope: "region", lat: 35, lon: 103, r: 2500, label: "China", src: "https://en.wikipedia.org/wiki/China" });
TL.geo("c1ea-tange-pritzker", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Tokyo, Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("c1ea-akira", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Tokyo, Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("c1ea-city-of-sadness", { scope: "region", lat: 24, lon: 121, r: 250, label: "Taiwan", src: "https://en.wikipedia.org/wiki/Taiwan" });
TL.geo("c1ea-j-league", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Japan National Stadium, Tokyo", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("c1ea-papaya", { scope: "place", lat: 10.78, lon: 106.7, r: 40, label: "Saigon (Ho Chi Minh City)", src: "https://en.wikipedia.org/wiki/Ho_Chi_Minh_City" });
TL.geo("c1ea-farewell-concubine", { scope: "place", lat: 43.55, lon: 7.02, r: 40, label: "Cannes, France", src: "https://en.wikipedia.org/wiki/Cannes" });
TL.geo("c1ea-oe-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("c1ea-pokemon", { scope: "region", lat: 36, lon: 138, r: 800, label: "Japan", src: "https://en.wikipedia.org/wiki/Japan" });
TL.geo("c1ea-seo-taiji", { scope: "place", lat: 37.56, lon: 126.99, r: 40, label: "Seoul, South Korea", src: "https://en.wikipedia.org/wiki/Seoul" });
TL.geo("c1ea-world-cup-2002", { scope: "region", lat: 36, lon: 128, r: 1200, label: "South Korea and Japan", src: "https://en.wikipedia.org/wiki/South_Korea" });
TL.geo("c1ea-mass-games-arirang", { scope: "place", lat: 39.02, lon: 125.75, r: 40, label: "Pyongyang, North Korea", src: "https://en.wikipedia.org/wiki/Pyongyang" });
TL.geo("c1ea-spirited-away", { scope: "region", lat: 36, lon: 138, r: 800, label: "Japan", src: "https://en.wikipedia.org/wiki/Japan" });
TL.geo("c1ea-gao-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("c1ea-yao-ming-draft", { scope: "place", lat: 40.71, lon: -74.01, r: 40, label: "New York City", src: "https://en.wikipedia.org/wiki/New_York_City" });
TL.geo("c1ea-batik-unesco", { scope: "region", lat: -7.49, lon: 110, r: 600, label: "Java, Indonesia", src: "https://en.wikipedia.org/wiki/Java" });
TL.geo("c1ea-gangnam-style", { scope: "place", lat: 37.5, lon: 127.03, r: 40, label: "Gangnam, Seoul", src: "https://en.wikipedia.org/wiki/Gangnam_District" });
TL.geo("c1ea-mo-yan-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("c1ea-tu-youyou-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("c1ea-squid-game", { scope: "region", lat: 36, lon: 128, r: 400, label: "South Korea", src: "https://en.wikipedia.org/wiki/South_Korea" });
TL.geo("c1ea-han-kang-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("c1ea-bumi-manusia", { scope: "place", lat: -3.42, lon: 126.67, r: 100, label: "Buru island, Indonesia", src: "https://en.wikipedia.org/wiki/Buru" });
TL.geo("c1ea-manila-claws-of-light", { scope: "place", lat: 14.6, lon: 120.98, r: 40, label: "Manila, Philippines", src: "https://en.wikipedia.org/wiki/Manila" });
TL.geo("c1ea-ccp-opens", { scope: "place", lat: 14.56, lon: 120.98, r: 40, label: "CCP Complex, Pasay", src: "https://en.wikipedia.org/wiki/Cultural_Center_of_the_Philippines" });
TL.geo("c1ea-hidilyn-gold", { scope: "place", lat: 35.69, lon: 139.69, r: 40, label: "Tokyo, Japan", src: "https://en.wikipedia.org/wiki/Tokyo" });
TL.geo("c1ea-petronas-towers", { scope: "place", lat: 3.158, lon: 101.712, r: 40, label: "Kuala Lumpur, Malaysia", src: "https://en.wikipedia.org/wiki/Petronas_Towers" });
TL.geo("c1ea-yeoh-oscar", { scope: "place", lat: 34.05, lon: -118.25, r: 40, label: "Los Angeles", src: "https://en.wikipedia.org/wiki/Los_Angeles" });
TL.geo("c1ea-schooling-gold", { scope: "place", lat: -22.91, lon: -43.21, r: 40, label: "Rio de Janeiro, Brazil", src: "https://en.wikipedia.org/wiki/Rio_de_Janeiro" });
TL.geo("c1ea-angkor-world-heritage", { scope: "place", lat: 13.41, lon: 103.87, r: 40, label: "Angkor, Cambodia", src: "https://en.wikipedia.org/wiki/Angkor" });
TL.geo("c1ea-ang-lee-oscar", { scope: "place", lat: 34.05, lon: -118.25, r: 40, label: "Los Angeles", src: "https://en.wikipedia.org/wiki/Los_Angeles" });
TL.geo("c1ea-beijing-2022", { scope: "place", lat: 39.91, lon: 116.4, r: 60, label: "Beijing, China", src: "https://en.wikipedia.org/wiki/Beijing" });
