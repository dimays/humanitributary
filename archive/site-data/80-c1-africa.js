// Culture fill-in C1: sub-Saharan and North African branches, 1900 to today (literature, music, art, film, sport, daily life). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const N = (path, title) => ({ t: `${title} — NobelPrize.org`, u: `https://www.nobelprize.org/prizes/literature/${path}`, k: "reference" });

TL.add({ events: [
  // ---------- Nigeria ----------
  { id: "c1af-palm-wine-drinkard", branch: "nigeria", y: 1952, when: "1952", title: "Tutuola publishes The Palm-Wine Drinkard",
    text: "Amos Tutuola's Yoruba-folktale quest novel, published by Faber and Faber, was the first Nigerian book to achieve international fame.", imp: 3,
    cites: [B("biography/Amos-Tutuola", "Amos Tutuola"), W("The_Palm-Wine_Drinkard", "The Palm-Wine Drinkard")] },
  { id: "c1af-things-fall-apart", branch: "nigeria", y: 1958.458, when: "June 17, 1958", title: "Achebe publishes Things Fall Apart",
    text: "Chinua Achebe's first novel, published by Heinemann in London, portrayed traditional Igbo life as missionaries and colonial government arrived. It has been translated into over fifty languages.", imp: 2,
    cites: [B("biography/Chinua-Achebe", "Chinua Achebe"), W("Things_Fall_Apart", "Things Fall Apart")] },
  { id: "c1af-oshogbo-workshop", branch: "nigeria", y: 1964, when: "1964", title: "Twins Seven-Seven joins the Osogbo art workshop",
    text: "The singer and dancer attended an Mbari Mbayo workshop run by Ulli and Georgina Beier in Osogbo and became its best-known painter, a leading figure of the Osogbo school.", imp: 3,
    cites: [W("Twins_Seven-Seven", "Twins Seven-Seven"), B("biography/Twins-Seven-Seven", "Twins Seven Seven")] },
  { id: "c1af-kalakuta-republic", branch: "nigeria", y: 1970.5, when: "1970", title: "Fela Kuti founds the Kalakuta Republic",
    text: "Back from the United States, Fela Kuti proclaimed the communal compound he set up near his Lagos nightclub the independent Kalakuta Republic.", imp: 2,
    cites: [B("biography/Fela-Kuti", "Fela Kuti"), W("Kalakuta_Republic", "Kalakuta Republic")] },
  { id: "c1af-kalakuta-raid", branch: "nigeria", y: 1977.133, when: "February 18, 1977", title: "Soldiers burn Fela Kuti's Kalakuta compound",
    text: "About a thousand armed soldiers assaulted the compound after the album Zombie mocked the military; it burned to the ground. Fela was briefly jailed and his mother died the following year.", imp: 2,
    cites: [B("biography/Fela-Kuti", "Fela Kuti"), W("Kalakuta_Republic", "Kalakuta Republic")] },
  { id: "c1af-okri-booker", branch: "nigeria", y: 1991.5, when: "1991", title: "Ben Okri wins the Booker Prize",
    text: "At 32 Okri became the youngest Booker winner, for The Famished Road, narrated by Azaro, an abiku (spirit child), a magic-realist novel set in Nigeria.", imp: 3,
    cites: [B("biography/Ben-Okri", "Ben Okri"), { t: "The Booker Prize 1991 — The Booker Prizes", u: "https://thebookerprizes.com/the-booker-library/prize-years/1991" }, W("The_Famished_Road", "The Famished Road")] },
  { id: "c1af-super-eagles-gold", branch: "nigeria", y: 1996.59, when: "August 3, 1996", title: "Nigeria wins Olympic football gold",
    text: "Nigeria beat Argentina in the Olympic football final at Atlanta 1996, after trailing, with a golden goal in extra time by Nwankwo Kanu; the team's most surprising achievement of the Games.", imp: 3,
    cites: [{ t: "When Nigeria's Super Eagles stunned the world — Olympics.com", u: "https://olympics.com/en/news/when-nigerias-super-eagles-stunned-the-world" }, W("Nigeria_at_the_1996_Summer_Olympics", "Nigeria at the 1996 Summer Olympics")] },
  { id: "c1af-burna-boy-grammy", branch: "nigeria", y: 2021.2, when: "March 2021", title: "Burna Boy wins a Grammy for Twice as Tall",
    text: "The Nigerian artist's album Twice as Tall won the Grammy for Best Global Music Album at the 63rd Grammy Awards.", imp: 3,
    cites: [{ t: "Best Global Music Album, 2021 — Grammy.com", u: "https://www.grammy.com/awards/categories/best-global-music-album/2021/" }, B("biography/Burna-Boy", "Burna Boy"), W("Burna_Boy", "Burna Boy")] },
  // ---------- Ghana ----------
  { id: "c1af-panafest", branch: "ghana", y: 1992.95, when: "December 1992", title: "First PANAFEST held in Ghana",
    text: "The Pan African Historical Theatre Festival grew from Efua Sutherland's 1980 proposal for a historical drama festival in Cape Coast; first held in December 1992, it recurs every two years.", imp: 3,
    cites: [{ t: "PANAFEST in Ghana, 1992–2010 — Cambridge University Press", u: "https://www.cambridge.org/core/books/african-theatre-11-festivals/panafrican-historical-theatre-festival-panafest-in-ghana-19922010/D6675E60559ED849A4F547388765C6D1" }, W("Panafest", "Panafest")] },
  { id: "c1af-anatsui-bottle-caps", branch: "ghana", y: 2002, when: "Early 21st century", title: "El Anatsui turns to bottle-cap tapestries",
    text: "Teaching in Nsukka, Nigeria, the Ghanaian sculptor found a bag of discarded bottle caps and shifted from wood to metal tapestries of caps and copper wire, which brought him international recognition.", imp: 2,
    cites: [B("biography/El-Anatsui", "El Anatsui"), W("El_Anatsui", "El Anatsui")] },
  // ---------- Kenya ----------
  { id: "c1af-keino-1968", branch: "kenya", y: 1968.8, when: "October 20, 1968", title: "Kipchoge Keino wins 1500 m gold in Mexico City",
    text: "Keino beat favorite Jim Ryun by 20 meters, the largest winning margin in the event's history, and also took 5000 m silver, despite severe abdominal pains.", imp: 2,
    cites: [B("biography/Kip-Keino", "Kip Keino"), { t: "Kipchoge Keino — Olympedia", u: "https://www.olympedia.org/athletes/72762" }, W("Kipchoge_Keino", "Kipchoge Keino")] },
  { id: "c1af-kamiriithu", branch: "kenya", y: 1977.753, when: "October 2, 1977", title: "Kamiriithu villagers stage Ngaahika Ndeenda",
    text: "Ngũgĩ wa Thiong'o's Kikuyu-language play I Will Marry When I Want drew audiences of at least 10,000 to an open-air theater; it was stopped six weeks after opening and Ngũgĩ was detained.", imp: 2,
    cites: [W("Kamiriithu_Community_Education_and_Cultural_Centre", "Kamiriithu Community Education and Cultural Centre"), B("biography/Ngugi-wa-Thiongo", "Ngugi wa Thiong'o")] },
  { id: "c1af-decolonising-mind", branch: "kenya", y: 1986, when: "1986", title: "Ngũgĩ publishes Decolonising the Mind",
    text: "In this book of essays Ngũgĩ argued that writing in African languages is part of the anti-imperialist struggle and bade farewell to English as the language of his fiction, turning to Kikuyu.", imp: 2,
    cites: [B("biography/Ngugi-wa-Thiongo", "Ngugi wa Thiong'o"), W("Decolonising_the_Mind", "Decolonising the Mind")] },
  { id: "c1af-mpesa", branch: "kenya", y: 2007.2, when: "March 2007", title: "M-Pesa mobile money launches in Kenya",
    text: "After a 2005 pilot, Safaricom and Vodafone launched M-Pesa, a phone-to-phone money transfer service meant to help people without bank accounts.", imp: 2,
    cites: [{ t: "How M-Pesa was created — Vodafone", u: "https://www.vodafone.com/news/newsroom/digital-society/m-pesa-created" }, W("M-Pesa", "M-Pesa")] },
  { id: "c1af-kipchoge-159", branch: "kenya", y: 2019.78, when: "October 12, 2019", title: "Kipchoge runs a marathon in 1:59:40",
    text: "In the staged Ineos 1:59 Challenge in Vienna, Eliud Kipchoge became the first person to cover the marathon distance in under two hours, though pacing aids meant it was not a record.", imp: 2,
    cites: [B("biography/Eliud-Kipchoge", "Eliud Kipchoge"), W("Ineos_1:59_Challenge", "Ineos 1:59 Challenge")] },
  // ---------- Ethiopia ----------
  { id: "c1af-bikila-rome", branch: "ethiopia", y: 1960.693, when: "September 10, 1960", title: "Bikila wins the Rome marathon barefoot",
    text: "Abebe Bikila ran the marathon barefoot, partly along the Appian Way, to win gold in a world record, Ethiopia's first Olympic gold medal.", imp: 2,
    cites: [B("biography/Abebe-Bikila", "Abebe Bikila"), W("Abebe_Bikila", "Abebe Bikila")] },
  { id: "c1af-haile-selassie-university", branch: "ethiopia", y: 1961.1, when: "February 1961", title: "Haile Selassie University is formed",
    text: "Founded in 1950 as University College of Addis Ababa, the country's oldest university was restructured with other colleges as Haile Selassie University and took the name Addis Ababa University in 1975.", imp: 3,
    cites: [B("topic/Addis-Ababa-University", "Addis Ababa University"), W("Addis_Ababa_University", "Addis Ababa University")] },
  { id: "c1af-ethio-jazz", branch: "ethiopia", y: 1972, when: "1972", title: "Mulatu Astatke records Mulatu of Ethiopia",
    text: "The Berklee-trained vibraphonist, considered the father of Ethio-jazz, recorded the album in New York, fusing jazz with Ethiopian modes after bringing his sound home in 1969.", imp: 3,
    cites: [{ t: "Riffing with Mulatu Astatke, the king of Swinging Addis — National Geographic", u: "https://www.nationalgeographic.com/culture/article/mulatu-astatke-ethiopia-jazz-addis" }, W("Mulatu_Astatke", "Mulatu Astatke")] },
  { id: "c1af-derartu-tulu", branch: "ethiopia-modern", y: 1992.6, when: "1992", title: "Derartu Tulu wins Olympic 10,000 m gold",
    text: "At Barcelona she became the first Ethiopian woman and the first Black African woman to win an Olympic gold medal.", imp: 2,
    cites: [B("biography/Derartu-Tulu", "Derartu Tulu"), W("Derartu_Tulu", "Derartu Tulu")] },
  { id: "c1af-gebrselassie-atlanta", branch: "ethiopia-modern", y: 1996.55, when: "1996", title: "Haile Gebrselassie wins Olympic 10,000 m",
    text: "Gebrselassie took Olympic 10,000 m gold in Atlanta and won the event again at Sydney in 2000.", imp: 3,
    cites: [B("biography/Haile-Gebrselassie", "Haile Gebrselassie")] },
  { id: "c1af-millennium", branch: "ethiopia-modern", y: 2007.693, when: "September 11, 2007", title: "Ethiopia celebrates the third millennium",
    text: "Ethiopia marked the start of its third millennium with cultural celebrations and concerts in Addis Ababa and other cities.", imp: 3,
    cites: [{ t: "Ethiopia to celebrate millennium — Al Jazeera", u: "https://www.aljazeera.com/news/2007/9/11/ethiopia-to-celebrate-millennium" }, W("Ethiopian_Millennium", "Ethiopian Millennium")] },
  // ---------- South Africa ----------
  { id: "c1af-cry-beloved-country", branch: "south-africa", y: 1948.5, when: "1948", title: "Paton publishes Cry, the Beloved Country",
    text: "Alan Paton's novel of a Zulu pastor's search for his son in Johannesburg appeared the year apartheid became law.", imp: 2,
    cites: [B("topic/Cry-the-Beloved-Country-novel-by-Paton", "Cry, the Beloved Country"), W("Cry,_the_Beloved_Country", "Cry, the Beloved Country")] },
  { id: "c1af-king-kong", branch: "south-africa", y: 1959.089, when: "February 2, 1959", title: "King Kong jazz musical opens in Johannesburg",
    text: "The “all-African jazz opera” on the life of boxer Ezekiel Dhlamini opened at Wits University's Great Hall, with Black and white artists working together despite segregation, and was an immediate success.", imp: 2,
    cites: [{ t: "King Kong, the musical (1959–1961) — South African History Online", u: "https://sahistory.org.za/article/king-kong-musical-1959-1961" }, W("King_Kong_(1959_musical)", "King Kong (1959 musical)")] },
  { id: "c1af-makeba-un", branch: "south-africa", y: 1963.5, when: "1963", title: "Miriam Makeba testifies against apartheid at the UN",
    text: "The singer of “Pata Pata” testified about apartheid at the United Nations; South Africa banned her records and took away her citizenship and passport.", imp: 2,
    cites: [B("biography/Miriam-Makeba", "Miriam Makeba"), { t: "Miriam Makeba — South African History Online", u: "https://www.sahistory.org.za/people/miriam-makeba" }] },
  { id: "c1af-graceland", branch: "south-africa", y: 1986.646, when: "August 25, 1986", title: "Paul Simon's Graceland brings South African music abroad",
    text: "Simon's Warner Bros. album, made with black South African musicians despite a trade boycott, sold an estimated 16 million copies and won the 1987 Grammy for Album of the Year.", imp: 2,
    cites: [B("topic/Graceland-recording-by-Simon-1986", "Graceland"), W("Graceland_(album)", "Graceland (album)")] },
  { id: "c1af-gordimer-nobel", branch: "south-africa", y: 1991.756, when: "October 3, 1991", title: "Nadine Gordimer wins the Nobel Prize in Literature",
    text: "The Swedish Academy honored her “magnificent epic writing”; her novels and stories made the consequences of apartheid a central theme.", imp: 2,
    cites: [{ t: "Nobel Prize in Literature 1991: Press release — NobelPrize.org", u: "https://www.nobelprize.org/prizes/literature/1991/press-release/", k: "reference" }, B("biography/Nadine-Gordimer", "Nadine Gordimer")] },
  { id: "c1af-rugby-world-cup-1995", branch: "south-africa", y: 1995.477, when: "June 24, 1995", title: "South Africa hosts and wins the Rugby World Cup",
    text: "South Africa, the host nation, beat New Zealand 15–12 after extra time in the final at Ellis Park, Johannesburg, winning its first Rugby World Cup.", imp: 2,
    cites: [{ t: "24 June 1995: Springboks beat New Zealand in the Rugby World Cup final — South African History Online", u: "https://www.sahistory.org.za/dated-event/springboks-beat-new-zealand-rugby-wold-cup-final-match" }, W("1995_Rugby_World_Cup_final", "1995 Rugby World Cup final")] },
  { id: "c1af-coetzee-nobel", branch: "south-africa", y: 2003.753, when: "October 2, 2003", title: "J. M. Coetzee wins the Nobel Prize in Literature",
    text: "The Swedish Academy cited a writer “who in innumerable guises portrays the surprising involvement of the outsider.” Coetzee was also the first author to win the Booker Prize twice.", imp: 2,
    cites: [{ t: "Nobel Prize in Literature 2003: Press release — NobelPrize.org", u: "https://www.nobelprize.org/prizes/literature/2003/press-release/", k: "reference" }, B("biography/J-M-Coetzee", "J. M. Coetzee")] },
  { id: "c1af-zeitz-mocaa", branch: "south-africa", y: 2017.724, when: "September 22, 2017", title: "Zeitz MOCAA opens in Cape Town",
    text: "A 1920s grain silo, remade by Heatherwick Studio, became what was billed as the world's largest museum of contemporary art from Africa and its diaspora.", imp: 2,
    cites: [{ t: "About — Zeitz MOCAA", u: "https://zeitzmocaa.museum/about/" }, { t: "Heatherwick's £30m Cape Town art gallery opens — Building", u: "https://www.building.co.uk/news/heatherwicks-30m-cape-town-art-gallery-opens/5089689.article" }, W("Zeitz_Museum_of_Contemporary_Art_Africa", "Zeitz Museum of Contemporary Art Africa")] },
  { id: "c1af-tyla-grammy", branch: "south-africa", y: 2024.1, when: "February 2024", title: "Tyla wins the first Grammy for African music",
    text: "Her song “Water” won the inaugural Grammy for Best African Music Performance, making her the youngest African artist to win a Grammy.", imp: 3,
    cites: [{ t: "Best African Music Performance, 2024 — Grammy.com", u: "https://www.grammy.com/awards/categories/best-african-music-performance/2024/" }, B("biography/Tyla", "Tyla"), W("Tyla_(South_African_singer)", "Tyla")] },
  // ---------- Congo ----------
  { id: "c1af-zaire-74", branch: "drc", y: 1974.72, end: 1974.73, when: "September 22–24, 1974", title: "Zaire 74 music festival in Kinshasa",
    text: "Three nights at the Stade du 20 Mai paired Franco's TPOK Jazz and Celia Cruz with American soul acts.", imp: 3,
    cites: [{ t: "Celia Cruz Live in Kinshasa, Zaire 1974 — OkayAfrica", u: "https://www.okayafrica.com/celia-cruz-live-in-kinshasa-zaire-1974/253838" }, W("Zaire_74", "Zaire 74")] },
  // ---------- North Africa and others ----------
  { id: "c1af-chronicle-years-fire", branch: "algeria", y: 1975.4, when: "1975", title: "Algerian film wins the Palme d'Or",
    text: "The Algerian film Chronicle of the Years of Fire won the top prize at the Cannes Film Festival.", imp: 3,
    cites: [{ t: "1975: Palme d'or for Chronicle of the Years of Embers — Festival de Cannes", u: "https://www.festival-cannes.com/en/2025/1975-palme-dor-for-waqai-sinin-al-djamr-chronicle-of-the-years-of-embers/" }, W("Chronicle_of_the_Years_of_Fire", "Chronicle of the Years of Fire")] },
  { id: "c1af-star-wars-tunisia", branch: "tunisia", y: 1976.2, when: "March 1976", title: "Star Wars films Tatooine in southern Tunisia",
    text: "Principal photography began in March 1976 on the Sahara's edge in southern Tunisia, whose desert stood in for Tatooine.", imp: 3,
    cites: [{ t: "A tour of Tunisia's Star Wars sets — The National", u: "https://www.thenationalnews.com/lifestyle/travel/a-tour-of-tunisia-s-star-wars-sets-1.809080" }, W("Star_Wars_(film)", "Star Wars (film)")] },
  { id: "c1af-jabeur-wimbledon", branch: "tunisia", y: 2022.52, when: "July 9, 2022", title: "Ons Jabeur reaches the Wimbledon final",
    text: "Jabeur lost the final to Elena Rybakina, 3–6, 6–2, 6–2. She was the first African and Arab woman to contest a major singles final and reached the US Open final later that year.", imp: 3,
    cites: [{ t: "Tunisia's Ons Jabeur loses to Rybakina of Kazakhstan at Wimbledon — Al Jazeera", u: "https://www.aljazeera.com/amp/news/2022/7/9/tunisias-ons-jabeur-loses-to-rybakina-of-kazakhstan-at-wimbledon" }, W("Ons_Jabeur", "Ons Jabeur")] },
  { id: "c1af-meroe-unesco", branch: "sudan", y: 2011.45, when: "June 2011", title: "Meroë listed as a World Heritage Site",
    text: "UNESCO listed the Archaeological Sites of the Island of Meroë, the pyramid-studded capital of the ancient Kushite kingdom.", imp: 3,
    cites: [{ t: "Archaeological Sites of the Island of Meroe — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/1336" }, W("Mero%C3%AB", "Meroë")] },
  { id: "c1af-girmay-tour", branch: "eritrea", y: 2024.55, when: "July 2024", title: "Biniam Girmay wins the Tour de France green jersey",
    text: "Girmay won three stages, the first Black African to win a Tour stage, and took the points jersey, the first by an African; in 2022 he was the first Black African to win a Grand Tour stage, at the Giro.", imp: 2,
    cites: [{ t: "Eritrea's Biniam Girmay becomes the first Black African rider to win a Tour de France stage — NBC News", u: "https://www.nbcnews.com/news/world/eritreas-biniam-girmay-becomes-first-black-african-rider-win-tour-de-f-rcna159792" }, W("Biniam_Girmay", "Biniam Girmay")] },
  { id: "c1af-uci-kigali", branch: "rwanda", y: 2025.72, end: 2025.74, when: "September 21–28, 2025", title: "Kigali hosts the UCI Road World Championships",
    text: "The first UCI Road World Championships held in Africa took place in Kigali, with a circuit that climbs the Mur de Kigali.", imp: 3,
    cites: [{ t: "Climbs and cobbles in the ‘land of a thousand hills’ — UCI", u: "https://www.uci.org/article/uci-road-world-championships-climbs-and-cobbles-in-the-land-of-a-thousand/4woIeW7sXvAQqhTtZGgnFq" }, W("2025_UCI_Road_World_Championships", "2025 UCI Road World Championships")] },
  { id: "c1af-presence-africaine", branch: "decolonization", y: 1947.85, when: "November 1947", title: "Présence Africaine magazine founded in Paris",
    text: "Alioune Diop's pan-African quarterly gathered Césaire, Senghor, Richard Wright and others and became a main forum for Négritude and African writing.", imp: 2,
    link: "france",
    cites: [W("Pr%C3%A9sence_Africaine", "Présence Africaine"), B("biography/Alioune-Diop", "Alioune Diop"), B("art/Negritude", "Negritude")] },
  { id: "c1af-dakar-festival", branch: "decolonization", y: 1966.25, when: "April 1–24, 1966", title: "First World Festival of Negro Arts in Dakar",
    text: "Senegal hosted a Pan-African celebration of literature, theater, music, dance, film and the visual arts, the first of the World Festivals of Black Arts.", imp: 3,
    cites: [{ t: "Performing global African culture and citizenship — Tate Papers", u: "https://www.tate.org.uk/research/tate-papers/30/performing-global-african-culture-and-citizenship" }, W("World_Festival_of_Black_Arts", "World Festival of Black Arts")] },
] });

TL.geo("c1af-palm-wine-drinkard", { scope: "region", lat: 8, lon: 10, r: 600, label: "Nigeria", src: "https://en.wikipedia.org/wiki/Nigeria" });
TL.geo("c1af-things-fall-apart", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c1af-oshogbo-workshop", { scope: "place", lat: 7.77, lon: 4.57, r: 40, label: "Osogbo, Nigeria", src: "https://en.wikipedia.org/wiki/Osogbo" });
TL.geo("c1af-kalakuta-republic", { scope: "place", lat: 6.46, lon: 3.39, r: 40, label: "Lagos, Nigeria", src: "https://en.wikipedia.org/wiki/Lagos" });
TL.geo("c1af-kalakuta-raid", { scope: "place", lat: 6.46, lon: 3.39, r: 40, label: "Lagos, Nigeria", src: "https://en.wikipedia.org/wiki/Lagos" });
TL.geo("c1af-okri-booker", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c1af-super-eagles-gold", { scope: "place", lat: 33.95, lon: -83.38, r: 40, label: "Athens, Georgia", src: "https://en.wikipedia.org/wiki/Athens,_Georgia" });
TL.geo("c1af-burna-boy-grammy", { scope: "place", lat: 34.05, lon: -118.24, r: 60, label: "Los Angeles, United States", src: "https://en.wikipedia.org/wiki/Los_Angeles" });
TL.geo("c1af-panafest", { scope: "place", lat: 5.1, lon: -1.25, r: 40, label: "Cape Coast, Ghana", src: "https://en.wikipedia.org/wiki/Cape_Coast" });
TL.geo("c1af-anatsui-bottle-caps", { scope: "place", lat: 6.86, lon: 7.4, r: 40, label: "Nsukka, Nigeria", src: "https://en.wikipedia.org/wiki/Nsukka" });
TL.geo("c1af-keino-1968", { scope: "place", lat: 19.43, lon: -99.13, r: 60, label: "Mexico City", src: "https://en.wikipedia.org/wiki/Mexico_City" });
TL.geo("c1af-kamiriithu", { scope: "place", lat: -1.11, lon: 36.64, r: 40, label: "Limuru, Kenya", src: "https://en.wikipedia.org/wiki/Limuru" });
TL.geo("c1af-decolonising-mind", { scope: "region", lat: 1, lon: 38, r: 500, label: "Kenya", src: "https://en.wikipedia.org/wiki/Kenya" });
TL.geo("c1af-mpesa", { scope: "place", lat: -1.29, lon: 36.82, r: 50, label: "Nairobi, Kenya", src: "https://en.wikipedia.org/wiki/Nairobi" });
TL.geo("c1af-kipchoge-159", { scope: "place", lat: 48.21, lon: 16.37, r: 40, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
TL.geo("c1af-bikila-rome", { scope: "place", lat: 41.89, lon: 12.48, r: 40, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("c1af-haile-selassie-university", { scope: "place", lat: 9.04, lon: 38.75, r: 40, label: "Addis Ababa, Ethiopia", src: "https://en.wikipedia.org/wiki/Addis_Ababa" });
TL.geo("c1af-ethio-jazz", { scope: "place", lat: 40.71, lon: -74.01, r: 40, label: "New York City", src: "https://en.wikipedia.org/wiki/New_York_City" });
TL.geo("c1af-derartu-tulu", { scope: "place", lat: 41.38, lon: 2.18, r: 40, label: "Barcelona, Spain", src: "https://en.wikipedia.org/wiki/Barcelona" });
TL.geo("c1af-gebrselassie-atlanta", { scope: "place", lat: 33.75, lon: -84.39, r: 60, label: "Atlanta, United States", src: "https://en.wikipedia.org/wiki/Atlanta" });
TL.geo("c1af-millennium", { scope: "place", lat: 9.04, lon: 38.75, r: 40, label: "Addis Ababa, Ethiopia", src: "https://en.wikipedia.org/wiki/Addis_Ababa" });
TL.geo("c1af-cry-beloved-country", { scope: "place", lat: -26.2, lon: 28.04, r: 50, label: "Johannesburg, South Africa", src: "https://en.wikipedia.org/wiki/Johannesburg" });
TL.geo("c1af-king-kong", { scope: "place", lat: -26.2, lon: 28.04, r: 50, label: "Johannesburg, South Africa", src: "https://en.wikipedia.org/wiki/Johannesburg" });
TL.geo("c1af-makeba-un", { scope: "place", lat: 40.71, lon: -74.01, r: 40, label: "New York City", src: "https://en.wikipedia.org/wiki/New_York_City" });
TL.geo("c1af-graceland", { scope: "region", lat: -30, lon: 25, r: 1000, label: "South Africa", src: "https://en.wikipedia.org/wiki/South_Africa" });
TL.geo("c1af-gordimer-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("c1af-rugby-world-cup-1995", { scope: "place", lat: -26.2, lon: 28.04, r: 50, label: "Johannesburg, South Africa", src: "https://en.wikipedia.org/wiki/Johannesburg" });
TL.geo("c1af-coetzee-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("c1af-zeitz-mocaa", { scope: "place", lat: -33.93, lon: 18.42, r: 40, label: "Cape Town, South Africa", src: "https://en.wikipedia.org/wiki/Cape_Town" });
TL.geo("c1af-tyla-grammy", { scope: "place", lat: 34.05, lon: -118.24, r: 60, label: "Los Angeles, United States", src: "https://en.wikipedia.org/wiki/Los_Angeles" });
TL.geo("c1af-zaire-74", { scope: "place", lat: -4.32, lon: 15.31, r: 40, label: "Kinshasa, DR Congo", src: "https://en.wikipedia.org/wiki/Kinshasa" });
TL.geo("c1af-chronicle-years-fire", { scope: "place", lat: 43.55, lon: 7.02, r: 40, label: "Cannes, France", src: "https://en.wikipedia.org/wiki/Cannes" });
TL.geo("c1af-star-wars-tunisia", { scope: "place", lat: 33.92, lon: 8.13, r: 80, label: "Tozeur, Tunisia", src: "https://en.wikipedia.org/wiki/Tozeur" });
TL.geo("c1af-jabeur-wimbledon", { scope: "place", lat: 51.42, lon: -0.21, r: 40, label: "Wimbledon, London", src: "https://en.wikipedia.org/wiki/Wimbledon,_London" });
TL.geo("c1af-meroe-unesco", { scope: "place", lat: 16.93, lon: 33.73, r: 50, label: "Meroë, Sudan", src: "https://en.wikipedia.org/wiki/Mero%C3%AB" });
TL.geo("c1af-girmay-tour", { scope: "region", lat: 47, lon: 2, r: 600, label: "France", src: "https://en.wikipedia.org/wiki/France" });
TL.geo("c1af-uci-kigali", { scope: "place", lat: -1.95, lon: 30.11, r: 40, label: "Kigali, Rwanda", src: "https://en.wikipedia.org/wiki/Kigali" });
TL.geo("c1af-presence-africaine", { scope: "place", lat: 48.86, lon: 2.35, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("c1af-dakar-festival", { scope: "place", lat: 14.69, lon: -17.45, r: 40, label: "Dakar, Senegal", src: "https://en.wikipedia.org/wiki/Dakar" });
