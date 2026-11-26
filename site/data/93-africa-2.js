// Night 93: Mali (republic), Cameroon, Morocco, Libya. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const H = (u, t) => ({ t: `${t} — Office of the Historian`, u });
const X = (u, t) => ({ t, u });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });

TL.add({ branches: [
  { id: "mali-republic", name: "Mali (since 1960)", region: "africa", start: D(1960, 9, 22), end: null, startWhen: "September 22, 1960", endWhen: "", parents: [], into: [],
    text: "The Sudanese Republic, briefly joined with Senegal in the Mali Federation, became the independent Republic of Mali on September 22, 1960. Coups in 1968, 1991, 2012, 2020 and 2021 and Tuareg and jihadist insurgencies have marked its history.",
    cites: [W("Mali", "Mali"), B("place/Mali", "Mali"), B("topic/Mali-Federation", "Mali Federation")] },
  { id: "cameroon", name: "Cameroon", region: "africa", start: 1960, end: null, startWhen: "January 1, 1960", endWhen: "", parents: [], into: [],
    text: "French Cameroun became independent on January 1, 1960; the southern part of British Cameroons joined it in 1961. Ahmadou Ahidjo ruled to 1982 and Paul Biya has ruled since, amid an Anglophone insurgency and Boko Haram attacks.",
    cites: [B("place/Cameroon", "Cameroon"), W("History_of_Cameroon", "History of Cameroon"), B("biography/Paul-Biya", "Paul Biya")] },
  { id: "morocco", name: "Morocco (Alaouite)", region: "mideast", start: 1666.45, end: null, startWhen: "1666", endWhen: "", parents: [], into: [],
    text: "The Alaouite dynasty took Fez in 1666 and has ruled Morocco since. It kept independence until the French and Spanish protectorates of 1912–1956, and Morocco is today a kingdom under Mohammed VI.",
    cites: [W("Alaouite_dynasty", "Alaouite dynasty"), B("topic/Alawi-dynasty", "Alawi dynasty"), W("History_of_Morocco", "History of Morocco")] },
  { id: "libya", name: "Libya", region: "mideast", start: D(1951, 12, 24), end: null, startWhen: "December 24, 1951", endWhen: "", parents: [], into: [],
    text: "Libya became an independent kingdom under Idris I on December 24, 1951. Gaddafi's coup of 1969 began four decades of one-man rule; the uprising of 2011 led to a divided country and civil war.",
    cites: [W("History_of_Libya", "History of Libya"), B("biography/Muammar-al-Qaddafi", "Muammar al-Qaddafi")] },
] });

TL.origin("mali-republic", {
  note: "French Sudan was a French colony; it joined Senegal in the Mali Federation, which won independence on June 20, 1960, and the Sudanese Republic became Mali alone after Senegal left. Mali takes its name from the medieval Mali Empire, whose heartland it overlaps.",
  links: [
    { id: "france", how: "independence", note: "French Sudan became independent of France in 1960" },
    { id: "mali", how: "peoples", note: "Named for the medieval Mali Empire of the Mande peoples" },
  ],
  cites: [B("topic/Mali-Federation", "Mali Federation"), W("Mali", "Mali")],
});
TL.origin("cameroon", {
  note: "Germany's Kamerun protectorate (1884) was divided by Britain and France in 1919 as League of Nations mandates, later UN trust territories. French Cameroun became independent in 1960; southern British Cameroons joined it by plebiscite in 1961.",
  links: [
    { id: "german-empire", how: "successor", note: "Succeeded the German colony of Kamerun, divided after World War I" },
    { id: "france", how: "independence", note: "French Cameroun became independent on January 1, 1960" },
    { id: "uk", how: "independence", note: "Southern British Cameroons left British rule to join Cameroon in 1961" },
  ],
  cites: [B("place/Cameroon", "Cameroon"), W("History_of_Cameroon", "History of Cameroon")],
});
TL.origin("morocco", {
  note: "The Alaouite sharifian family from Tafilalt rose after the Saadi sultanate weakened, and Sultan al-Rashid united the country by taking Fez in 1666. Morocco's older Berber and Arab dynasties, such as the Almoravids and Almohads, preceded it. French and Spanish protectorates (1912–1956) ended in 1956.",
  links: [
    { id: "france", how: "independence", note: "French protectorate of 1912 ended by the Franco-Moroccan declaration of March 2, 1956" },
    { id: "spain", how: "independence", note: "Spanish protectorate in the north and south ended by an April 1956 declaration" },
  ],
  cites: [W("Alaouite_dynasty", "Alaouite dynasty"), B("topic/Alawi-dynasty", "Alawi dynasty"), H("https://history.state.gov/countries/morocco", "Morocco"), W("Treaty_of_Fes", "Treaty of Fes")],
});
TL.origin("libya", {
  note: "Italy invaded Ottoman Tripolitania and Cyrenaica in 1911 and ruled Libya until 1943. Britain and France then administered it until a UN resolution led to independence under King Idris in 1951; Italy renounced its claims in 1947.",
  links: [
    { id: "italy", how: "successor", note: "Succeeded Italian Libya, which Italy gave up in 1947" },
    { id: "uk", how: "independence", note: "Britain administered Tripolitania and Cyrenaica from 1943 to 1951" },
    { id: "ottoman", how: "context", note: "Libya was Ottoman territory until Italy's invasion of 1911" },
  ],
  cites: [W("History_of_Libya", "History of Libya"), B("place/Libya", "Libya")],
});

TL.geo("mali-republic", { scope: "region", lat: 17, lon: -4, r: 900, label: "Mali", src: "https://en.wikipedia.org/wiki/Mali" });
TL.geo("cameroon", { scope: "region", lat: 6, lon: 12, r: 500, label: "Cameroon", src: "https://en.wikipedia.org/wiki/Cameroon" });
TL.geo("morocco", { scope: "region", lat: 32, lon: -6, r: 600, label: "Morocco", src: "https://en.wikipedia.org/wiki/Morocco" });
TL.geo("libya", { scope: "region", lat: 27.0, lon: 17.0, r: 1000, label: "Libya", src: "https://en.wikipedia.org/wiki/Libya" });

TL.move("w101-libya-independent", "libya");
TL.move("gb3-oau-morocco-leaves", "morocco");
TL.move("gb3-au-morocco-rejoins", "morocco");

TL.add({ events: [
  // ================= MALI =================
  { id: "n93-ml-federation", branch: "mali-republic", y: D(1960, 6, 20), when: "June 20, 1960", title: "The Mali Federation wins independence",
    text: "The Mali Federation of the Sudanese Republic and Senegal became fully independent from France; Modibo Keïta led it as premier. It collapsed two months later when Senegal withdrew.", imp: 2, link: "france",
    cites: [B("topic/Mali-Federation", "Mali Federation"), W("Mali_Federation", "Mali Federation")] },
  { id: "n93-ml-republic", branch: "mali-republic", y: D(1960, 9, 22), when: "September 22, 1960", title: "The Republic of Mali is proclaimed",
    text: "After Senegal left the federation, the Sudanese Republic became the independent Republic of Mali under President Modibo Keïta, and September 22 is now Independence Day.", imp: 1,
    cites: [W("Mali", "Mali"), B("biography/Modibo-Keita", "Modibo Keita")] },
  { id: "n93-ml-malian-franc", branch: "mali-republic", y: 1962, when: "1962", title: "Keïta creates the Bank of the Republic and Malian franc",
    text: "Under Keïta's socialist program, Mali founded its own central bank and currency in 1962. By 1967 the country faced growing economic and financial problems.", imp: 3,
    cites: [W("Mali", "Mali"), B("biography/Modibo-Keita", "Modibo Keita")] },
  { id: "n93-ml-tuareg-1962", branch: "mali-republic", y: 1962, end: 1964, when: "1962–1964", title: "The first Tuareg rebellion",
    text: "The first Tuareg rebellion, known as the Alfellaga, was launched from the Kidal region in 1962–1964 and violently repressed, driving many Tuareg into exile in Algeria and other neighboring countries.", imp: 3,
    cites: [W("Mali", "Mali")] },
  { id: "n93-ml-sidibe", branch: "mali-republic", y: 1965, when: "1960s", title: "Malick Sidibé photographs Bamako's youth",
    text: "Malick Sidibé's black-and-white photographs of 1960s Bamako nightlife captured the Westernization of Mali as it moved from colony to independent state. His work reached galleries abroad from 1994.", imp: 3,
    cites: [B("biography/Malick-Sidibe", "Malick Sidibé"), W("Malick_Sidib%C3%A9", "Malick Sidibé")] },
  { id: "n93-ml-coup-1968", branch: "mali-republic", y: D(1968, 11, 19), when: "November 19, 1968", title: "Moussa Traoré overthrows Keïta",
    text: "Junior army officers led by Moussa Traoré overthrew Modibo Keïta in a bloodless coup. Traoré ruled until 1991, and the day is remembered as Liberation Day.", imp: 1,
    cites: [B("biography/Modibo-Keita", "Modibo Keita"), W("Mali", "Mali")] },
  { id: "n93-ml-drought", branch: "mali-republic", y: 1968, end: 1974, when: "1968–1974", title: "Drought and famine strike Mali",
    text: "A devastating drought from 1968 to 1974 brought a famine that killed thousands. Droughts of the 1970s and 1980s also drove many Tuareg into camps in Algeria and Libya, feeding later rebellions.", imp: 3,
    cites: [W("Mali", "Mali"), B("topic/Tuareg", "Tuareg"), W("Tuareg_rebellion_(1990%E2%80%931995)", "Tuareg rebellion (1990–1995)")] },
  { id: "n93-ml-ambassadeurs", branch: "mali-republic", y: 1973, when: "1973", title: "Salif Keita joins Les Ambassadeurs",
    text: "In the early 1970s the singer Salif Keita left the Rail Band to join Les Ambassadeurs du Motel, a rival group. By the late 1970s his work with them was heard well beyond Mali and Côte d'Ivoire.", imp: 3,
    cites: [W("Salif_Keita", "Salif Keita")] },
  { id: "n93-ml-timbuktu-unesco", branch: "mali-republic", y: 1988, when: "1988", title: "Timbuktu and Djenné join the World Heritage list",
    text: "UNESCO listed Timbuktu, a center of Islamic scholarship, in 1988. It listed the Old Towns of Djenné, whose Great Mosque dates from 1907, the same year.", imp: 2,
    cites: [B("place/Timbuktu-Mali", "Timbuktu"), W("Timbuktu", "Timbuktu"), W("Great_Mosque_of_Djenn%C3%A9", "Great Mosque of Djenné")] },
  { id: "n93-ml-soro", branch: "mali-republic", y: 1987, when: "1987", title: "Salif Keita releases Soro",
    text: "Soro, the 1987 debut solo album of Malian Afro-pop singer Salif Keita, helped bring Malian music to world audiences.", imp: 3,
    cites: [W("Soro_(album)", "Soro (album)"), W("Salif_Keita", "Salif Keita")] },
  { id: "n93-ml-tuareg-1990", branch: "mali-republic", y: 1990, end: 1995, when: "1990–1995", title: "Second Tuareg rebellion",
    text: "A Tuareg rebellion began in June 1990 with an attack on Ménaka, a month after an attack in northern Niger. The army operated around Gao; peace pacts followed, and Tuareg armed movements were dissolved in 1996.", imp: 3,
    cites: [W("Tuareg_rebellion_(1990%E2%80%931995)", "Tuareg rebellion (1990–1995)"), W("Mali", "Mali")] },
  { id: "n93-ml-march-revolution", branch: "mali-republic", y: D(1991, 3, 26), when: "March 1991", title: "The March Revolution topples Traoré",
    text: "Pro-democracy rallies and strikes in March 1991 ended in a military takeover led by Amadou Toumani Touré. Traoré was imprisoned and a transition to multiparty rule began.", imp: 1,
    cites: [B("biography/Moussa-Traore", "Moussa Traoré"), B("biography/Amadou-Toumani-Toure", "Amadou Toumani Touré")] },
  { id: "n93-ml-konare", branch: "mali-republic", y: 1992, when: "1992", title: "Konaré wins Mali's first multiparty election",
    text: "Alpha Oumar Konaré, a civilian intellectual, won the 1992 presidential election after the transition. He was reelected in 1997.", imp: 2,
    cites: [B("biography/Alpha-Oumar-Konare", "Alpha Oumar Konaré"), W("Mali", "Mali")] },
  { id: "n93-ml-ali-farka", branch: "mali-republic", y: 1994, when: "1994", title: "Ali Farka Touré and Ry Cooder record Talking Timbuktu",
    text: "The Malian guitarist Ali Farka Touré, a pioneer of desert blues, recorded the 1994 album Talking Timbuktu with American guitarist Ry Cooder, bringing his music to a wide international audience.", imp: 2,
    cites: [W("Talking_Timbuktu", "Talking Timbuktu"), W("Ali_Farka_Tour%C3%A9", "Ali Farka Touré")] },
  { id: "n93-ml-desert-festival", branch: "mali-republic", y: 2001, end: 2012, when: "2001–2012", title: "The Festival in the Desert",
    text: "Founded in the early 2000s, the annual festival showed Tuareg and world music, in its last years near Timbuktu. The 2012 edition ended as armed Tuareg-led forces advanced; Islamists then took Timbuktu, banned music, and the festival has been in exile.", imp: 3,
    cites: [W("Festival_in_the_Desert", "Festival in the Desert")] },
  { id: "n93-ml-coup-2012", branch: "mali-republic", y: 2012.22, when: "March 2012", title: "Soldiers overthrow President Touré",
    text: "Soldiers led by Amadou Sanogo seized power in March 2012 over the government's handling of the northern rebellion. President Amadou Toumani Touré resigned the following month.", imp: 1,
    cites: [W("2012_Malian_coup_d%27%C3%A9tat", "2012 Malian coup d'état"), B("biography/Amadou-Toumani-Toure", "Amadou Toumani Touré")] },
  { id: "n93-ml-north-lost", branch: "mali-republic", y: D(2012, 4, 1), when: "January–April 2012 (Timbuktu taken April 1)", title: "Rebels seize northern Mali and declare Azawad",
    text: "Tuareg rebels of the MNLA, allied with Islamist groups, took Timbuktu, Kidal and Gao in 2012 and declared the state of Azawad. The jihadists soon pushed the MNLA aside.", imp: 1,
    cites: [W("Northern_Mali_conflict", "Northern Mali conflict"), W("Mali", "Mali"), B("place/Timbuktu-Mali", "Timbuktu")] },
  { id: "n93-ml-timbuktu-heritage", branch: "mali-republic", y: 2012.45, end: 2013, when: "2012–2013", title: "Timbuktu's shrines and manuscripts attacked",
    text: "In 2012 Ansar Dine militants destroyed shrines in Timbuktu, and UNESCO put the city on its danger list. About 4,203 of Timbuktu's manuscripts were burned or stolen in 2012–2013; many others were saved.", imp: 1,
    cites: [W("Timbuktu", "Timbuktu"), W("Timbuktu_Manuscripts", "Timbuktu Manuscripts"), B("place/Timbuktu-Mali", "Timbuktu")] },
  { id: "n93-ml-serval", branch: "mali-republic", y: D(2013, 1, 11), when: "January 11, 2013", title: "France launches Operation Serval",
    text: "After Islamist fighters captured Konna, President Hollande ordered French forces into action on January 11, 2013. By the end of January, French, Malian and AFISMA troops had retaken key northern towns, including Timbuktu.", imp: 2, link: "france",
    cites: [W("Mali_War", "Mali War"), W("Northern_Mali_conflict", "Northern Mali conflict")] },
  { id: "n93-ml-ibk", branch: "mali-republic", y: D(2013, 8, 11), when: "August 11, 2013", title: "Ibrahim Boubacar Keïta elected president",
    text: "Former prime minister Ibrahim Boubacar Keïta won the second round of the presidential election with almost 78 percent of the vote over Soumaïla Cissé.", imp: 3,
    cites: [B("biography/Ibrahim-Boubacar-Keita", "Ibrahim Boubacar Keïta"), W("Mali", "Mali")] },
  { id: "n93-ml-algiers", branch: "mali-republic", y: 2015.46, when: "June 2015", title: "The Algiers Accords",
    text: "The government, a pro-government coalition and the rebel Coordination of Azawad Movements reached the Algiers Accords, meant to decentralize the state and integrate former rebels into the army.", imp: 3,
    cites: [W("Northern_Mali_conflict", "Northern Mali conflict"), B("place/Mali", "Mali")] },
  { id: "n93-ml-coup-2020", branch: "mali-republic", y: D(2020, 8, 18), when: "August 18, 2020", title: "Military coup removes President Keïta",
    text: "After weeks of protests, soldiers mutinied at Kati and detained President Keïta, who resigned. The coup was led by Colonel Assimi Goïta.", imp: 1,
    cites: [W("2020_Malian_coup_d%27%C3%A9tat", "2020 Malian coup d'état"), B("biography/Assimi-Goita", "Assimi Goïta")] },
  { id: "n93-ml-coup-2021", branch: "mali-republic", y: D(2021, 5, 24), when: "May 24, 2021", title: "Goïta seizes full power in a second coup",
    text: "The army under Vice President Assimi Goïta captured interim president Bah N'daw and the prime minister. Goïta was then sworn in as interim president, and in July 2025 he was granted a five-year term.", imp: 2,
    cites: [W("2021_Malian_coup_d%27%C3%A9tat", "2021 Malian coup d'état"), B("place/Mali", "Mali")] },
  { id: "n93-ml-aes", branch: "mali-republic", y: D(2023, 9, 16), when: "September 2023", title: "Mali, Burkina Faso and Niger form the Sahel alliance",
    text: "The three military-ruled states formed the Alliance of Sahel States for collective defense, amid strained relations with ECOWAS.", imp: 2,
    cites: [B("place/Mali", "Mali")] },
  { id: "n93-ml-attacks-2026", branch: "mali-republic", y: D(2026, 4, 25), when: "April 25, 2026", title: "Coordinated jihadist and Tuareg attacks across Mali",
    text: "JNIM and the Azawad Liberation Front attacked sites from Bamako to Kidal; Defense Minister Sadio Camara was killed, and the FLA took Kidal.", imp: 2,
    cites: [B("place/Mali", "Mali")] },

  // ================= CAMEROON =================
  { id: "n93-cm-independence", branch: "cameroon", y: 1960, when: "January 1, 1960", title: "French Cameroun becomes independent",
    text: "French Cameroun gained independence as the Republic of Cameroon, and Ahmadou Ahidjo, who had been premier since 1958, became president on May 5, 1960.", imp: 1, link: "france",
    cites: [B("place/Cameroon", "Cameroon"), W("History_of_Cameroon", "History of Cameroon")] },
  { id: "n93-cm-plebiscite", branch: "cameroon", y: D(1961, 2, 11), when: "February 11, 1961", title: "Southern British Cameroons votes to join Cameroon",
    text: "In a UN-supervised plebiscite the north of British Cameroons chose to join Nigeria and the south chose union with the former French Cameroun.", imp: 1, link: "uk",
    cites: [B("place/Cameroon/Moving-toward-independence", "Cameroon: Moving toward independence"), W("History_of_Cameroon", "History of Cameroon")] },
  { id: "n93-cm-foumban", branch: "cameroon", y: D(1961, 7, 16), end: D(1961, 7, 21), when: "July 16–21, 1961", title: "Foumban Conference sets up a federation",
    text: "Leaders met at Foumban to negotiate union, and a federal constitution adopted on August 14, 1961 joined East and West Cameroon.", imp: 2,
    cites: [W("History_of_Cameroon", "History of Cameroon"), B("biography/Ahmadou-Ahidjo", "Ahmadou Ahidjo")] },
  { id: "n93-cm-yaounde-university", branch: "cameroon", y: 1962, when: "1962", title: "The University of Yaoundé is founded",
    text: "The capital Yaoundé, seat of the government since independence, opened its university in 1962.", imp: 3,
    cites: [B("place/Yaounde", "Yaoundé")] },
  { id: "n93-cm-one-party", branch: "cameroon", y: 1966, when: "1966", title: "Cameroon becomes a one-party state",
    text: "Opposition parties were banned in 1966. Ahidjo was reelected unopposed, and government forces captured the last important UPC rebel leader in 1970.", imp: 2,
    cites: [W("History_of_Cameroon", "History of Cameroon"), B("place/Cameroon/Government-and-society", "Cameroon: Government and society"), B("biography/Ahmadou-Ahidjo", "Ahmadou Ahidjo")] },
  { id: "n93-cm-unitary-state", branch: "cameroon", y: 1972, when: "1972", title: "A referendum creates the United Republic of Cameroon",
    text: "A 1972 referendum replaced the federation of East and West Cameroon with a unitary state and expanded presidential power, a change later central to Anglophone grievances.", imp: 2,
    cites: [B("place/Cameroon/Government-and-society", "Cameroon: Government and society"), W("History_of_Cameroon", "History of Cameroon"), W("Anglophone_Crisis", "Anglophone Crisis")] },
  { id: "n93-cm-soul-makossa", branch: "cameroon", y: 1972, when: "1972", title: "Manu Dibango releases Soul Makossa",
    text: "The saxophonist's single \"Soul Makossa\" was released in 1972 and picked up by New York DJs and then Atlantic Records. Dibango helped introduce West African popular music abroad.", imp: 2,
    cites: [W("Soul_Makossa", "Soul Makossa"), B("biography/Manu-Dibango", "Manu Dibango")] },
  { id: "n93-cm-mongo-beti", branch: "cameroon", y: 1972, when: "1972", title: "Mongo Beti's Main basse sur le Cameroun is banned",
    text: "The novelist's study of neocolonial rule in Cameroon was immediately banned in France and in Cameroon. Mongo Beti remained an outspoken critic of the regime.", imp: 3,
    cites: [B("biography/Mongo-Beti", "Mongo Beti")] },
  { id: "n93-cm-oil", branch: "cameroon", y: 1977, when: "1977", title: "Cameroon becomes an oil producer",
    text: "Cameroon began producing oil in 1977. Oil remains a major export, with timber and cocoa.", imp: 3,
    cites: [W("History_of_Cameroon", "History of Cameroon"), B("place/Cameroon", "Cameroon")] },
  { id: "n93-cm-biya", branch: "cameroon", y: D(1982, 11, 6), when: "November 6, 1982", title: "Paul Biya succeeds Ahidjo",
    text: "Ahidjo resigned on November 4, 1982, and Prime Minister Paul Biya became president two days later. Biya has been reelected repeatedly since.", imp: 1,
    cites: [B("biography/Paul-Biya", "Paul Biya"), W("History_of_Cameroon", "History of Cameroon")] },
  { id: "n93-cm-coup-1984", branch: "cameroon", y: D(1984, 4, 6), when: "April 6, 1984", title: "Republican Guard coup attempt fails",
    text: "Supporters of Ahidjo, led by the Republican Guard, attempted a coup against Biya. Ahidjo denied responsibility but was widely viewed as behind it.", imp: 3,
    cites: [W("History_of_Cameroon", "History of Cameroon"), B("biography/Paul-Biya", "Paul Biya")] },
  { id: "n93-cm-nyos", branch: "cameroon", y: D(1986, 8, 21), when: "August 21, 1986", title: "Lake Nyos gas disaster",
    text: "A limnic eruption released a cloud of carbon dioxide from Lake Nyos in the Northwest Region, suffocating between 1,700 and 1,800 people and thousands of cattle.", imp: 2,
    cites: [B("event/Lake-Nyos-disaster", "Lake Nyos disaster (1986)"), W("History_of_Cameroon", "History of Cameroon")] },
  { id: "n93-cm-worldcup-1990", branch: "cameroon", y: 1990.45, when: "June–July 1990", title: "Roger Milla leads Cameroon to the World Cup quarterfinals",
    text: "The 38-year-old Milla, coming off the bench, scored four goals at the 1990 World Cup as Cameroon became the first African team to reach the quarterfinals.", imp: 1,
    cites: [B("biography/Roger-Milla", "Roger Milla"), W("Roger_Milla", "Roger Milla")] },
  { id: "n93-cm-multiparty", branch: "cameroon", y: 1990.95, when: "December 1990", title: "Opposition parties are legalized",
    text: "Under domestic and international pressure, Cameroon legalized opposition parties for the first time since 1966. One party has governed throughout.", imp: 2,
    cites: [W("History_of_Cameroon", "History of Cameroon")] },
  { id: "n93-cm-olympics-2000", branch: "cameroon", y: 2000.7, when: "2000", title: "Cameroon wins Olympic football gold",
    text: "Cameroon won the football tournament at the 2000 Summer Olympics, the country's only Olympic gold.", imp: 3,
    cites: [W("Cameroon_at_the_Olympics", "Cameroon at the Olympics")] },
  { id: "n93-cm-bakassi-icj", branch: "cameroon", y: D(2002, 10, 10), when: "October 10, 2002", title: "The ICJ awards Bakassi to Cameroon",
    text: "The International Court of Justice ruled that sovereignty over the Bakassi peninsula rested with Cameroon, mainly on the basis of Anglo-German agreements. Nigeria completed the transfer on August 14, 2008.", imp: 2,
    cites: [X("https://www.icj-cij.org/case/94", "Land and Maritime Boundary between Cameroon and Nigeria — International Court of Justice"), W("Bakassi", "Bakassi")] },
  { id: "n93-cm-boko-haram", branch: "cameroon", y: 2013.1, when: "2013", title: "Boko Haram spreads into northern Cameroon",
    text: "Members of the Nigerian group Boko Haram reportedly began operating in Cameroon from February 2013, and Cameroonian troops joined the regional military response.", imp: 2, link: "nigeria",
    cites: [B("topic/Boko-Haram", "Boko Haram")] },
  { id: "n93-cm-anglophone-strike", branch: "cameroon", y: D(2016, 10, 6), when: "October 6, 2016", title: "Anglophone lawyers' strike begins",
    text: "Lawyers' and teachers' unions in the English-speaking regions began a strike. The government's suppression of the protests in 2016–2017 helped spark an armed conflict.", imp: 2,
    cites: [W("Anglophone_Crisis", "Anglophone Crisis")] },
  { id: "n93-cm-ambazonia", branch: "cameroon", y: D(2017, 10, 1), when: "October 1, 2017", title: "Separatists declare Ambazonia independent",
    text: "An umbrella group of separatist movements unilaterally declared the independence of Ambazonia in Cameroon's English-speaking regions. Guerrilla war followed; Swiss-mediated talks failed in 2019.", imp: 1,
    cites: [W("Anglophone_Crisis", "Anglophone Crisis"), B("biography/Paul-Biya", "Paul Biya")] },
  { id: "n93-cm-dibango-dies", branch: "cameroon", y: D(2020, 3, 24), when: "March 24, 2020", title: "Manu Dibango dies in Paris",
    text: "The Douala-born saxophonist and composer died in Paris at age 86, remembered for jazz and African fusions.", imp: 3,
    cites: [B("biography/Manu-Dibango", "Manu Dibango")] },
  { id: "n93-cm-malaria-vaccine", branch: "cameroon", y: D(2024, 1, 22), when: "January 22, 2024", title: "Cameroon begins routine malaria vaccination",
    text: "Cameroon became the first country to add the RTS,S malaria vaccine to routine childhood immunization outside the pilot program, starting in 42 health districts.", imp: 3,
    cites: [X("https://www.afro.who.int/countries/cameroon/news/cameroon-kicks-malaria-vaccine-rollout", "Cameroon kicks off malaria vaccine rollout — WHO Africa"), W("History_of_Cameroon", "History of Cameroon")] },
  { id: "n93-cm-election-2025", branch: "cameroon", y: 2025.8, when: "October 2025", title: "Biya declared winner at age 92",
    text: "Officials declared Paul Biya the winner of the October 2025 presidential election at age 92, extending a rule that began in 1982.", imp: 2,
    cites: [B("biography/Paul-Biya", "Paul Biya")] },

  // ================= MOROCCO =================
  { id: "n93-ma-fez-1666", branch: "morocco", y: 1666.45, when: "June 1666", title: "Al-Rashid takes Fez and founds the Alaouite sultanate",
    text: "After years of campaigning, Sultan al-Rashid won the surrender of Fez in June 1666, reuniting Morocco under the Alaouite dynasty, which still reigns.", imp: 1,
    cites: [W("Alaouite_dynasty", "Alaouite dynasty"), B("topic/Alawi-dynasty", "Alawi dynasty")] },
  { id: "n93-ma-ismail", branch: "morocco", y: 1672, end: 1727, when: "1672–1727", title: "Moulay Ismail builds Meknes and a slave army",
    text: "Moulay Ismail made Meknes his capital and raised a professional army of slaves, the Black Guard. He retook Tangier in 1684 and drove the Spanish from Larache in 1689.", imp: 2,
    cites: [W("Moulay_Ismail", "Moulay Ismail"), W("History_of_Morocco", "History of Morocco"), B("topic/Alawi-dynasty", "Alawi dynasty")] },
  { id: "n93-ma-essaouira", branch: "morocco", y: 1765, when: "1765", title: "Sultan Muhammad founds Essaouira",
    text: "Sultan Sidi Muhammad ibn Abd Allah founded Essaouira (Mogador) as a rival port to Agadir, fortified in the style of Vauban. Its old city was listed by UNESCO in 2001.", imp: 3,
    cites: [B("place/Essaouira", "Essaouira")] },
  { id: "n93-ma-us-recognition", branch: "morocco", y: D(1777, 12, 20), when: "December 20, 1777", title: "Morocco recognizes the United States",
    text: "Under Sultan Muhammad III, Morocco became the first state to recognize the independence of the United States. A treaty of peace and friendship signed in 1786 was ratified by Congress in 1787.", imp: 2, link: "usa",
    cites: [X("https://us.diplomatie.ma/en/node/1912", "Morocco formally recognized the United States (1777) — Embassy of Morocco in the U.S."), H("https://history.state.gov/countries/morocco", "Morocco"), W("History_of_Morocco", "History of Morocco"), W("Morocco%E2%80%93United_States_relations", "Morocco–United States relations")] },
  { id: "n93-ma-isly", branch: "morocco", y: D(1844, 8, 14), when: "August 1844", title: "France defeats Morocco at Isly",
    text: "After France conquered Algeria, a Moroccan army that had sheltered Abdelkader was totally defeated at Isly, near Oujda, and the sultan promised to expel him.", imp: 2, link: "france",
    cites: [B("event/Battle-of-Isly", "Battle of Isly"), W("History_of_Morocco", "History of Morocco")] },
  { id: "n93-ma-algeciras", branch: "morocco", y: 1906.04, end: 1906.27, when: "January 16 – April 7, 1906", title: "The Algeciras Conference",
    text: "A European and American conference at Algeciras ended the First Moroccan Crisis, formalizing France's special position and sharing Moroccan policing between France and Spain.", imp: 2, link: "france",
    cites: [B("event/Algeciras-Conference", "Algeciras Conference"), W("History_of_Morocco", "History of Morocco")] },
  { id: "n93-ma-fez-treaty", branch: "morocco", y: D(1912, 3, 30), when: "March 30, 1912", title: "The Treaty of Fez makes Morocco a French protectorate",
    text: "Sultan Abd al-Hafid signed the Treaty of Fez, creating a French protectorate. A November 1912 agreement gave Spain a zone of influence in the north and south.", imp: 1, link: "france",
    cites: [W("History_of_Morocco", "History of Morocco"), W("Treaty_of_Fez", "Treaty of Fez")] },
  { id: "n93-ma-rif-war", branch: "morocco", y: 1921, end: 1926, when: "1921–1926", title: "Abd el-Krim leads the Rif War",
    text: "After the Spanish disaster at Annual in 1921, Abd el-Krim founded the Republic of the Rif. France joined Spain against him in 1925, and he surrendered in May 1926.", imp: 2, link: "spain",
    cites: [B("biography/Abd-el-Krim", "Abd el-Krim"), W("Rif_War", "Rif War")] },
  { id: "n93-ma-tangier-bowles", branch: "morocco", y: 1947, when: "1947", title: "Paul Bowles settles in Tangier",
    text: "The American composer and writer moved to Tangier in 1947 and wrote The Sheltering Sky (1949) there. The city drew writers such as Jean Genet and Tennessee Williams.", imp: 3,
    cites: [B("biography/Paul-Bowles", "Paul Bowles"), W("Mohamed_Choukri", "Mohamed Choukri")] },
  { id: "n93-ma-exile-1953", branch: "morocco", y: 1953.64, when: "1953", title: "France exiles Mohammed V to Madagascar",
    text: "France exiled the respected Sultan Mohammed V on Eid al-Adha of 1953 and replaced him with Mohammed Ben Aarafa, sparking wide opposition to the protectorate.", imp: 2, link: "france",
    cites: [W("History_of_Morocco", "History of Morocco")] },
  { id: "n93-ma-independence", branch: "morocco", y: D(1956, 3, 2), when: "March 2, 1956", title: "Morocco regains independence",
    text: "A Franco-Moroccan declaration of March 2, 1956 ended the 1912 French protectorate. Spain gave up its zone in an April 1956 declaration, and Tangier was reintegrated in October.", imp: 1, link: "france",
    cites: [H("https://history.state.gov/countries/morocco", "Morocco"), W("Treaty_of_Fes", "Treaty of Fes"), W("History_of_Morocco", "History of Morocco"), B("place/Morocco", "Morocco")] },
  { id: "n93-ma-kingdom-1957", branch: "morocco", y: D(1957, 8, 11), when: "August 11, 1957", title: "Mohammed V becomes king",
    text: "Mohammed V took the title of king on August 11, 1957, and the state became officially the Kingdom of Morocco.", imp: 3,
    cites: [W("History_of_Morocco", "History of Morocco")] },
  { id: "n93-ma-hassan-ii", branch: "morocco", y: D(1961, 3, 3), when: "March 3, 1961", title: "Hassan II becomes king",
    text: "Hassan II succeeded his father and ruled until 1999. A constitution of 1962 gave a popularly elected legislature but kept a strong monarchy, and he governed by emergency powers from 1965 to 1970.", imp: 1,
    cites: [B("biography/Hassan-II", "Hassan II"), W("History_of_Morocco", "History of Morocco")] },
  { id: "n93-ma-sand-war", branch: "morocco", y: 1963.8, when: "1963", title: "Border clashes with Algeria become the Sand War",
    text: "After Algeria's independence, border skirmishes in the Tindouf area of southwestern Algeria escalated in 1963 into the Sand War.", imp: 3, link: "algeria",
    cites: [W("History_of_Morocco", "History of Morocco")] },
  { id: "n93-ma-coups-1971", branch: "morocco", y: 1971.54, when: "July 1971 and August 1972", title: "Two attempted military coups against Hassan II",
    text: "The regime survived military coup attempts in July 1971 and August 1972, after which the king introduced some socioeconomic reforms.", imp: 3,
    cites: [W("History_of_Morocco", "History of Morocco"), B("biography/Hassan-II", "Hassan II")] },
  { id: "n93-ma-green-march", branch: "morocco", y: 1975.85, when: "November 1975", title: "The Green March into Spanish Sahara",
    text: "Hassan II called for some 350,000 unarmed Moroccans to cross the border to claim Spanish Sahara. In early 1976 Spain ceded administration of the territory to Morocco and Mauritania.", imp: 1, link: "spain",
    cites: [B("event/Green-March", "Green March"), B("biography/Hassan-II", "Hassan II"), W("Green_March", "Green March"), W("History_of_Morocco", "History of Morocco")] },
  { id: "n93-ma-berm", branch: "morocco", y: 1980, end: 1987, when: "1980–1987", title: "Morocco builds sand walls across Western Sahara",
    text: "Between 1980 and 1987 Moroccan forces built a series of fortified sand walls, or berms, enclosing most of the western and central territory. A UN-brokered ceasefire with the Polisario Front took effect in 1991.", imp: 2,
    cites: [W("Moroccan_Western_Sahara_wall", "Moroccan Western Sahara wall"), B("place/Western-Sahara", "Western Sahara")] },
  { id: "n93-ma-marrakech-unesco", branch: "morocco", y: 1985, when: "1985", title: "Marrakech's medina is listed by UNESCO",
    text: "UNESCO designated the old medina of Marrakech, founded in the mid-11th century by the Almoravids, a World Heritage site in 1985.", imp: 3,
    cites: [B("place/Marrakech", "Marrakech"), W("Medina_of_Marrakesh", "Medina of Marrakesh")] },
  { id: "n93-ma-hassan-mosque", branch: "morocco", y: 1993, when: "1993", title: "The Hassan II Mosque opens in Casablanca",
    text: "Designed by Michel Pinseau under Hassan II's guidance and built by Moroccan artisans, the mosque, completed in 1993, has a 210-meter minaret, among the world's tallest.", imp: 2,
    cites: [W("Hassan_II_Mosque", "Hassan II Mosque")] },
  { id: "n93-ma-ben-jelloun", branch: "morocco", y: 1987.9, when: "1987", title: "Tahar Ben Jelloun wins the Prix Goncourt",
    text: "The Fez-born writer won France's Prix Goncourt for La Nuit sacrée (The Sacred Night), the first Maghreb author to receive it.", imp: 2,
    cites: [B("biography/Tahar-Ben-Jelloun", "Tahar Ben Jelloun"), W("Tahar_Ben_Jelloun", "Tahar Ben Jelloun")] },
  { id: "n93-ma-mohammed-vi", branch: "morocco", y: D(1999, 7, 23), when: "July 23, 1999", title: "Mohammed VI becomes king",
    text: "Mohammed VI took the throne on his father's death on July 23, 1999. His reign has combined reform and tight royal control.", imp: 1,
    cites: [B("biography/Mohammed-VI", "Mohammed VI"), W("History_of_Morocco", "History of Morocco")] },
  { id: "n93-ma-moudawana", branch: "morocco", y: 2004.05, when: "Early 2004", title: "The reformed family code (Moudawana) passes",
    text: "Parliament ratified a new family code raising the minimum marriage age to 18, limiting polygamy and divorce, and giving women more rights in marriage, within an Islamic legal framework.", imp: 2,
    cites: [W("Moudawana", "Moudawana")] },
  { id: "n93-ma-2011-constitution", branch: "morocco", y: 2011.1, when: "2011", title: "Arab Spring protests lead to a new constitution",
    text: "The 20 February Movement demanded democracy and an end to corruption. Mohammed VI proposed a new constitution expanding the powers of the prime minister and parliament, and Tamazight became an official language.", imp: 2,
    cites: [W("2011_Moroccan_protests", "2011 Moroccan protests"), B("biography/Mohammed-VI", "Mohammed VI"), B("place/Morocco", "Morocco")] },
  { id: "n93-ma-gnawa", branch: "morocco", y: 2019.9, when: "2019", title: "Gnawa music is inscribed as intangible heritage",
    text: "UNESCO inscribed Gnawa music on its Representative List of the Intangible Cultural Heritage of Humanity in 2019. An annual Gnawa festival is held in Essaouira.", imp: 3,
    cites: [X("https://ich.unesco.org/en/RL/gnawa-01170", "Gnawa — UNESCO Intangible Cultural Heritage"), W("Gnawa", "Gnawa")] },
  { id: "n93-ma-worldcup-2022", branch: "morocco", y: 2022.95, when: "2022", title: "Morocco reaches the World Cup semifinals",
    text: "At the 2022 World Cup Morocco became the first African and first Arab team to reach a semifinal, finishing fourth.", imp: 2,
    cites: [W("Morocco_at_the_FIFA_World_Cup", "Morocco at the FIFA World Cup"), W("Morocco_national_football_team", "Morocco national football team")] },
  { id: "n93-ma-earthquake-2023", branch: "morocco", y: D(2023, 9, 8), when: "September 8, 2023", title: "A deadly earthquake strikes Morocco",
    text: "A shallow earthquake in the Atlas Mountains killed more than 2,900 people. Britannica notes that Mohammed VI, who was in France, was slow to respond.", imp: 2,
    cites: [B("event/Morocco-earthquake-of-2023", "Morocco earthquake of 2023"), B("biography/Mohammed-VI", "Mohammed VI")] },

  // ================= LIBYA =================
  { id: "n93-ly-constitution", branch: "libya", y: D(1951, 10, 7), when: "October 7, 1951", title: "The National Assembly adopts Libya's first constitution",
    text: "Meeting in Benghazi, the National Assembly passed a constitution making Libya a federal state with a hereditary monarchy under King Idris, ahead of independence on December 24.", imp: 2,
    cites: [W("History_of_Libya", "History of Libya")] },
  { id: "n93-ly-oil-concession", branch: "libya", y: 1956, when: "1956", title: "Libya opens to foreign oil exploration",
    text: "Under the Petroleum Law of 1955 Libya granted concessions to foreign companies, and the first well was begun in 1956. Esso made the first commercial strike in 1959; oil later became the country's main source of income.", imp: 3, link: "usa",
    cites: [W("History_of_Libya", "History of Libya")] },
  { id: "n93-ly-coup", branch: "libya", y: D(1969, 9, 1), when: "September 1, 1969", title: "Gaddafi's coup overthrows King Idris",
    text: "A group of officers led by 27-year-old Muammar Gaddafi seized power and abolished the monarchy, launching what they called the Libyan Revolution.", imp: 1,
    cites: [B("biography/Muammar-al-Qaddafi", "Muammar al-Qaddafi"), W("History_of_Libya", "History of Libya")] },
  { id: "n93-ly-bases", branch: "libya", y: 1970, when: "1970", title: "U.S. and British bases are removed",
    text: "In 1970 Gaddafi removed U.S. and British military bases from Libya, and in 1973 he nationalized foreign-owned petroleum assets.", imp: 3,
    cites: [B("biography/Muammar-al-Qaddafi", "Muammar al-Qaddafi")] },
  { id: "n93-ly-jamahiriya", branch: "libya", y: 1977.17, when: "1977", title: "The Jamahiriya is proclaimed",
    text: "Libya became the \"Great Socialist People's Libyan Arab Jamahiriya\", a system of people's congresses based on Gaddafi's Green Book, although power stayed concentrated in his hands.", imp: 2,
    cites: [W("History_of_Libya", "History of Libya"), B("biography/Muammar-al-Qaddafi", "Muammar al-Qaddafi")] },
  { id: "n93-ly-lion-desert", branch: "libya", y: 1981.4, when: "May 1981", title: "Lion of the Desert premieres",
    text: "Moustapha Akkad's film about Omar Mukhtar's resistance to Italian rule, starring Anthony Quinn and financed by Gaddafi's government, was released in May 1981. Italy banned it in 1982.", imp: 3, link: "italy",
    cites: [W("Lion_of_the_Desert", "Lion of the Desert"), W("Omar_Mukhtar", "Omar Mukhtar")] },
  { id: "n93-ly-heritage-1982", branch: "libya", y: 1982, when: "1982", title: "Leptis Magna and Cyrene join the World Heritage list",
    text: "UNESCO listed Leptis Magna, birthplace of Emperor Septimius Severus, and Cyrene, a Greek colony of the 7th century BCE, in 1982. The old town of Ghadames followed in 1986.", imp: 2,
    cites: [B("place/Leptis-Magna", "Leptis Magna"), W("Cyrene,_Libya", "Cyrene, Libya"), W("Ghadames", "Ghadames")] },
  { id: "n93-ly-us-raid", branch: "libya", y: D(1986, 4, 15), when: "April 15, 1986", title: "U.S. air strikes hit Tripoli and Benghazi",
    text: "In Operation El Dorado Canyon, U.S. forces struck Libya after Reagan blamed Gaddafi for the April 5 bombing of a West Berlin discotheque.", imp: 2, link: "usa",
    cites: [W("1986_United_States_bombing_of_Libya", "1986 United States bombing of Libya"), B("biography/Muammar-al-Qaddafi", "Muammar al-Qaddafi")] },
  { id: "n93-ly-sanctions", branch: "libya", y: 1992.2, when: "1992", title: "The UN imposes sanctions on Libya",
    text: "Libya was accused in the 1988 Pan Am 103 and 1989 UTA 772 bombings and was put under UN sanctions in 1992.", imp: 2, link: "un",
    cites: [W("History_of_Libya", "History of Libya"), B("event/Pan-Am-flight-103", "Pan Am flight 103")] },
  { id: "n93-ly-megrahi", branch: "libya", y: 2003.6, when: "2003", title: "Libya accepts responsibility for Pan Am 103",
    text: "Two years after Abdelbaset al-Megrahi's 2001 conviction, Libya accepted responsibility for its officials' actions in the Lockerbie bombing and agreed to pay the victims' families.", imp: 2, link: "uk",
    cites: [B("event/Pan-Am-flight-103", "Pan Am flight 103")] },
  { id: "n93-ly-wmd", branch: "libya", y: D(2003, 12, 19), when: "December 19, 2003", title: "Libya renounces weapons of mass destruction",
    text: "Gaddafi announced that Libya would end its nuclear, chemical and missile programs, in exchange for better relations with the West. UN sanctions had been lifted in 2003.", imp: 2,
    cites: [W("Libya_and_weapons_of_mass_destruction", "Libya and weapons of mass destruction"), B("biography/Muammar-al-Qaddafi", "Muammar al-Qaddafi")] },
  { id: "n93-ly-koni", branch: "libya", y: 2008, when: "2008", title: "Ibrahim al-Koni wins the Sheikh Zayed Book Award",
    text: "The Tuareg novelist of the Libyan desert, author of more than 80 books including The Bleeding of the Stone, won the Sheikh Zayed Award for Literature in 2008 and was shortlisted for the Man Booker International in 2015.", imp: 3,
    cites: [W("Ibrahim_al-Koni", "Ibrahim al-Koni")] },
  { id: "n93-ly-uprising", branch: "libya", y: D(2011, 2, 17), when: "February 17, 2011", title: "The Libyan uprising begins",
    text: "Inspired by Tunisia and Egypt, demonstrations began in Benghazi demanding that Gaddafi step down and the revolt spread; the National Transitional Council was formed on February 27.", imp: 1,
    cites: [W("History_of_Libya", "History of Libya"), B("biography/Muammar-al-Qaddafi", "Muammar al-Qaddafi")] },
  { id: "n93-ly-unscr-1973", branch: "libya", y: D(2011, 3, 17), when: "March 17, 2011", title: "UN Security Council Resolution 1973",
    text: "The Security Council voted 10–0, with five abstentions, for Resolution 1973 on Libya, which led to the NATO-led military intervention.", imp: 2, link: "un",
    cites: [X("https://www.securitycouncilreport.org/un-documents/document/libya-s-res-1973.php", "S/RES/1973 — Security Council Report"), W("History_of_Libya", "History of Libya")] },
  { id: "n93-ly-gaddafi-killed", branch: "libya", y: D(2011, 10, 20), when: "October 20, 2011", title: "Gaddafi is killed in Sirte",
    text: "Rebels entered Tripoli on August 22, and Muammar Gaddafi was killed at Sirte on October 20, ending his 42-year rule.", imp: 1,
    cites: [B("biography/Muammar-al-Qaddafi", "Muammar al-Qaddafi"), W("History_of_Libya", "History of Libya")] },
  { id: "n93-ly-election-2012", branch: "libya", y: D(2012, 7, 7), when: "July 7, 2012", title: "First parliamentary elections since Gaddafi",
    text: "Libyans voted on July 7, 2012, in their first parliamentary elections since 1965. In August the National Transitional Council handed power to the elected General National Congress.", imp: 2,
    cites: [W("History_of_Libya", "History of Libya")] },
  { id: "n93-ly-civil-war-2", branch: "libya", y: 2014.5, when: "2014", title: "Libya splits between Tripoli and Tobruk",
    text: "The House of Representatives set up in Tobruk, backed by General Khalifa Haftar, refused to give way to the General National Congress in Tripoli, starting the Second Libyan Civil War.", imp: 1,
    cites: [W("Libyan_Civil_War_(2014%E2%80%932020)", "Libyan Civil War (2014–2020)"), W("History_of_Libya", "History of Libya")] },
  { id: "n93-ly-skhirat", branch: "libya", y: 2015.95, when: "December 2015", title: "The Libyan Political Agreement is signed at Skhirat",
    text: "Rival camps agreed to form a Government of National Accord, whose head Fayez Sarraj arrived in Tripoli by sea on March 30, 2016.", imp: 2,
    cites: [W("Libyan_Civil_War_(2014%E2%80%932020)", "Libyan Civil War (2014–2020)")] },
  { id: "n93-ly-haftar-tripoli", branch: "libya", y: D(2019, 4, 4), when: "April 4, 2019", title: "Haftar advances on Tripoli",
    text: "Khalifa Haftar ordered his Libyan National Army to advance on the capital, drawing reproach from the UN Secretary-General and Security Council.", imp: 2,
    cites: [W("Libyan_Civil_War_(2014%E2%80%932020)", "Libyan Civil War (2014–2020)")] },
  { id: "n93-ly-ceasefire", branch: "libya", y: D(2020, 10, 23), when: "October 23, 2020", title: "A permanent ceasefire is agreed",
    text: "Delegations of the rival sides' 5+5 Joint Military Commission signed a complete and permanent ceasefire in Geneva, and the first commercial flight between Tripoli and Benghazi followed that day.", imp: 2,
    cites: [X("https://unsmil.unmissions.org/en/press-releases/unsmil-welcomes-agreement-between-libyan-parties-on-permanent-country-wide", "UNSMIL welcomes permanent ceasefire agreement — United Nations Support Mission in Libya"), W("Libyan_Civil_War_(2014%E2%80%932020)", "Libyan Civil War (2014–2020)")] },
] });

TL.geo("n93-ml-federation", { scope: "place", lat: 14.69, lon: -17.45, r: 50, label: "Dakar, Senegal", src: "https://en.wikipedia.org/wiki/Dakar" });
TL.geo("n93-ml-republic", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-malian-franc", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-tuareg-1962", { scope: "region", lat: 19.97, lon: 0.75, r: 400, label: "Kidal Region, Mali", src: "https://en.wikipedia.org/wiki/Kidal_Region" });
TL.geo("n93-ml-sidibe", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-coup-1968", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-drought", { scope: "region", lat: 15.0, lon: -4.0, r: 800, label: "Sahel, Mali", src: "https://en.wikipedia.org/wiki/Sahel" });
TL.geo("n93-ml-ambassadeurs", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-timbuktu-unesco", { scope: "place", lat: 16.78, lon: -3.01, r: 60, label: "Timbuktu, Mali", src: "https://en.wikipedia.org/wiki/Timbuktu" });
TL.geo("n93-ml-soro", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-tuareg-1990", { scope: "place", lat: 16.27, lon: -0.05, r: 150, label: "Gao, Mali", src: "https://en.wikipedia.org/wiki/Gao" });
TL.geo("n93-ml-march-revolution", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-konare", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-ali-farka", { scope: "place", lat: 15.93, lon: -3.99, r: 60, label: "Niafunké, on the Niger River", src: "https://en.wikipedia.org/wiki/Niafunk%C3%A9" });
TL.geo("n93-ml-desert-festival", { scope: "place", lat: 16.78, lon: -3.01, r: 100, label: "Timbuktu, Mali", src: "https://en.wikipedia.org/wiki/Timbuktu" });
TL.geo("n93-ml-coup-2012", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-north-lost", { scope: "region", lat: 16.27, lon: -0.05, r: 600, label: "Azawad, northern Mali", src: "https://en.wikipedia.org/wiki/Azawad" });
TL.geo("n93-ml-timbuktu-heritage", { scope: "place", lat: 16.78, lon: -3.01, r: 60, label: "Timbuktu, Mali", src: "https://en.wikipedia.org/wiki/Timbuktu" });
TL.geo("n93-ml-serval", { scope: "region", lat: 17, lon: -4, r: 600, label: "Northern and central Mali", src: "https://en.wikipedia.org/wiki/Mali" });
TL.geo("n93-ml-ibk", { scope: "place", lat: 12.64, lon: -8.00, r: 50, label: "Bamako, Mali", src: "https://en.wikipedia.org/wiki/Bamako" });
TL.geo("n93-ml-algiers", { scope: "place", lat: 36.73, lon: 3.09, r: 50, label: "Algiers, Algeria", src: "https://en.wikipedia.org/wiki/Algiers" });
TL.geo("n93-ml-coup-2020", { scope: "place", lat: 12.75, lon: -8.07, r: 40, label: "Kati, Mali", src: "https://en.wikipedia.org/wiki/Kati,_Mali" });
TL.geo("n93-ml-coup-2021", { scope: "place", lat: 12.75, lon: -8.07, r: 40, label: "Kati, Mali", src: "https://en.wikipedia.org/wiki/Kati,_Mali" });
TL.geo("n93-ml-aes", { scope: "region", lat: 14.0, lon: -2.0, r: 1200, label: "Mali, Burkina Faso and Niger", src: "https://en.wikipedia.org/wiki/Alliance_of_Sahel_States" });
TL.geo("n93-ml-attacks-2026", { scope: "region", lat: 17, lon: -4, r: 900, label: "Mali", src: "https://en.wikipedia.org/wiki/Mali" });

TL.geo("n93-cm-independence", { scope: "place", lat: 3.87, lon: 11.52, r: 50, label: "Yaoundé, Cameroon", src: "https://en.wikipedia.org/wiki/Yaound%C3%A9" });
TL.geo("n93-cm-plebiscite", { scope: "region", lat: 5.9, lon: 10.2, r: 250, label: "Southern Cameroons", src: "https://en.wikipedia.org/wiki/Southern_Cameroons" });
TL.geo("n93-cm-foumban", { scope: "place", lat: 5.72, lon: 10.92, r: 40, label: "Foumban, Cameroon", src: "https://en.wikipedia.org/wiki/Foumban" });
TL.geo("n93-cm-yaounde-university", { scope: "place", lat: 3.87, lon: 11.52, r: 50, label: "Yaoundé, Cameroon", src: "https://en.wikipedia.org/wiki/Yaound%C3%A9" });
TL.geo("n93-cm-one-party", { scope: "region", lat: 6, lon: 12, r: 500, label: "Cameroon", src: "https://en.wikipedia.org/wiki/Cameroon" });
TL.geo("n93-cm-unitary-state", { scope: "region", lat: 6, lon: 12, r: 500, label: "Cameroon", src: "https://en.wikipedia.org/wiki/Cameroon" });
TL.geo("n93-cm-soul-makossa", { scope: "place", lat: 4.05, lon: 9.70, r: 50, label: "Douala, Cameroon", src: "https://en.wikipedia.org/wiki/Douala" });
TL.geo("n93-cm-mongo-beti", { scope: "region", lat: 6, lon: 12, r: 500, label: "Cameroon", src: "https://en.wikipedia.org/wiki/Cameroon" });
TL.geo("n93-cm-oil", { scope: "region", lat: 4.02, lon: 9.2, r: 120, label: "Cameroon coast (Limbe)", src: "https://en.wikipedia.org/wiki/Limbe,_Cameroon" });
TL.geo("n93-cm-biya", { scope: "place", lat: 3.87, lon: 11.52, r: 50, label: "Yaoundé, Cameroon", src: "https://en.wikipedia.org/wiki/Yaound%C3%A9" });
TL.geo("n93-cm-coup-1984", { scope: "place", lat: 3.87, lon: 11.52, r: 50, label: "Yaoundé, Cameroon", src: "https://en.wikipedia.org/wiki/Yaound%C3%A9" });
TL.geo("n93-cm-nyos", { scope: "place", lat: 6.44, lon: 10.30, r: 40, label: "Lake Nyos, Cameroon", src: "https://en.wikipedia.org/wiki/Lake_Nyos" });
TL.geo("n93-cm-worldcup-1990", { scope: "place", lat: 40.84, lon: 14.25, r: 50, label: "Naples, Italy", src: "https://en.wikipedia.org/wiki/Naples" });
TL.geo("n93-cm-multiparty", { scope: "region", lat: 6, lon: 12, r: 500, label: "Cameroon", src: "https://en.wikipedia.org/wiki/Cameroon" });
TL.geo("n93-cm-olympics-2000", { scope: "place", lat: -33.87, lon: 151.21, r: 50, label: "Sydney, Australia", src: "https://en.wikipedia.org/wiki/Sydney" });
TL.geo("n93-cm-bakassi-icj", { scope: "place", lat: 4.65, lon: 8.55, r: 60, label: "Bakassi peninsula", src: "https://en.wikipedia.org/wiki/Bakassi" });
TL.geo("n93-cm-boko-haram", { scope: "region", lat: 11, lon: 14.5, r: 250, label: "Far North Region, Cameroon", src: "https://en.wikipedia.org/wiki/Far_North_Region_(Cameroon)" });
TL.geo("n93-cm-anglophone-strike", { scope: "place", lat: 5.96, lon: 10.15, r: 60, label: "Bamenda, Cameroon", src: "https://en.wikipedia.org/wiki/Bamenda" });
TL.geo("n93-cm-ambazonia", { scope: "region", lat: 5.9, lon: 9.9, r: 250, label: "Anglophone Cameroon", src: "https://en.wikipedia.org/wiki/Southern_Cameroons" });
TL.geo("n93-cm-dibango-dies", { scope: "place", lat: 48.86, lon: 2.35, r: 50, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("n93-cm-malaria-vaccine", { scope: "region", lat: 6, lon: 12, r: 500, label: "Cameroon", src: "https://en.wikipedia.org/wiki/Cameroon" });
TL.geo("n93-cm-election-2025", { scope: "place", lat: 3.87, lon: 11.52, r: 50, label: "Yaoundé, Cameroon", src: "https://en.wikipedia.org/wiki/Yaound%C3%A9" });

TL.geo("n93-ma-fez-1666", { scope: "place", lat: 34.04, lon: -5, r: 40, label: "Fez, Morocco", src: "https://en.wikipedia.org/wiki/Fez,_Morocco" });
TL.geo("n93-ma-ismail", { scope: "place", lat: 33.9, lon: -5.55, r: 40, label: "Meknes, Morocco", src: "https://en.wikipedia.org/wiki/Mekn%C3%A8s" });
TL.geo("n93-ma-essaouira", { scope: "place", lat: 31.51, lon: -9.77, r: 30, label: "Essaouira, Morocco", src: "https://en.wikipedia.org/wiki/Essaouira" });
TL.geo("n93-ma-us-recognition", { scope: "region", lat: 32, lon: -6, r: 600, label: "Morocco", src: "https://en.wikipedia.org/wiki/Morocco" });
TL.geo("n93-ma-isly", { scope: "place", lat: 34.69, lon: -1.91, r: 50, label: "Oujda, Morocco", src: "https://en.wikipedia.org/wiki/Oujda" });
TL.geo("n93-ma-algeciras", { scope: "place", lat: 36.13, lon: -5.45, r: 40, label: "Algeciras, Spain", src: "https://en.wikipedia.org/wiki/Algeciras" });
TL.geo("n93-ma-fez-treaty", { scope: "place", lat: 34.04, lon: -5, r: 40, label: "Fez, Morocco", src: "https://en.wikipedia.org/wiki/Fez,_Morocco" });
TL.geo("n93-ma-rif-war", { scope: "region", lat: 35.0, lon: -4.0, r: 200, label: "Rif, Morocco", src: "https://en.wikipedia.org/wiki/Rif" });
TL.geo("n93-ma-tangier-bowles", { scope: "place", lat: 35.78, lon: -5.8, r: 40, label: "Tangier, Morocco", src: "https://en.wikipedia.org/wiki/Tangier" });
TL.geo("n93-ma-exile-1953", { scope: "region", lat: 32, lon: -6, r: 600, label: "Morocco", src: "https://en.wikipedia.org/wiki/Morocco" });
TL.geo("n93-ma-independence", { scope: "place", lat: 34.02, lon: -6.84, r: 50, label: "Rabat, Morocco", src: "https://en.wikipedia.org/wiki/Rabat" });
TL.geo("n93-ma-kingdom-1957", { scope: "place", lat: 34.02, lon: -6.84, r: 50, label: "Rabat, Morocco", src: "https://en.wikipedia.org/wiki/Rabat" });
TL.geo("n93-ma-hassan-ii", { scope: "place", lat: 34.02, lon: -6.84, r: 50, label: "Rabat, Morocco", src: "https://en.wikipedia.org/wiki/Rabat" });
TL.geo("n93-ma-sand-war", { scope: "place", lat: 27.68, lon: -8.13, r: 150, label: "Tindouf, Algeria", src: "https://en.wikipedia.org/wiki/Tindouf" });
TL.geo("n93-ma-coups-1971", { scope: "place", lat: 33.27, lon: -7.14, r: 40, label: "Skhirat, Morocco", src: "https://en.wikipedia.org/wiki/Skhirat" });
TL.geo("n93-ma-green-march", { scope: "region", lat: 24, lon: -14, r: 500, label: "Western Sahara", src: "https://en.wikipedia.org/wiki/Western_Sahara" });
TL.geo("n93-ma-berm", { scope: "region", lat: 24, lon: -14, r: 700, label: "Western Sahara", src: "https://en.wikipedia.org/wiki/Western_Sahara" });
TL.geo("n93-ma-marrakech-unesco", { scope: "place", lat: 31.63, lon: -8.01, r: 40, label: "Marrakech, Morocco", src: "https://en.wikipedia.org/wiki/Marrakesh" });
TL.geo("n93-ma-hassan-mosque", { scope: "place", lat: 33.61, lon: -7.63, r: 30, label: "Casablanca, Morocco", src: "https://en.wikipedia.org/wiki/Hassan_II_Mosque" });
TL.geo("n93-ma-ben-jelloun", { scope: "place", lat: 34.04, lon: -5, r: 40, label: "Fez, Morocco", src: "https://en.wikipedia.org/wiki/Fez,_Morocco" });
TL.geo("n93-ma-mohammed-vi", { scope: "place", lat: 34.02, lon: -6.84, r: 50, label: "Rabat, Morocco", src: "https://en.wikipedia.org/wiki/Rabat" });
TL.geo("n93-ma-moudawana", { scope: "place", lat: 34.02, lon: -6.84, r: 50, label: "Rabat, Morocco", src: "https://en.wikipedia.org/wiki/Rabat" });
TL.geo("n93-ma-2011-constitution", { scope: "place", lat: 34.02, lon: -6.84, r: 50, label: "Rabat, Morocco", src: "https://en.wikipedia.org/wiki/Rabat" });
TL.geo("n93-ma-gnawa", { scope: "place", lat: 31.51, lon: -9.77, r: 30, label: "Essaouira, Morocco", src: "https://en.wikipedia.org/wiki/Essaouira" });
TL.geo("n93-ma-worldcup-2022", { scope: "place", lat: 25.8, lon: 51.4, r: 60, label: "Al Khor, Qatar", src: "https://en.wikipedia.org/wiki/Al_Khor" });
TL.geo("n93-ma-earthquake-2023", { scope: "place", lat: 31.06, lon: -7.92, r: 80, label: "Atlas Mountains, Morocco", src: "https://en.wikipedia.org/wiki/Atlas_Mountains" });

TL.geo("n93-ly-constitution", { scope: "place", lat: 32.12, lon: 20.07, r: 40, label: "Benghazi, Libya", src: "https://en.wikipedia.org/wiki/Benghazi" });
TL.geo("n93-ly-oil-concession", { scope: "region", lat: 27.0, lon: 17.0, r: 1000, label: "Libya", src: "https://en.wikipedia.org/wiki/Libya" });
TL.geo("n93-ly-coup", { scope: "place", lat: 32.12, lon: 20.07, r: 50, label: "Benghazi, Libya", src: "https://en.wikipedia.org/wiki/Benghazi" });
TL.geo("n93-ly-bases", { scope: "place", lat: 32.89, lon: 13.19, r: 50, label: "Tripoli, Libya", src: "https://en.wikipedia.org/wiki/Tripoli" });
TL.geo("n93-ly-jamahiriya", { scope: "place", lat: 32.89, lon: 13.19, r: 50, label: "Tripoli, Libya", src: "https://en.wikipedia.org/wiki/Tripoli" });
TL.geo("n93-ly-lion-desert", { scope: "region", lat: 32.5, lon: 21.5, r: 250, label: "Cyrenaica, Libya", src: "https://en.wikipedia.org/wiki/Cyrenaica" });
TL.geo("n93-ly-heritage-1982", { scope: "place", lat: 32.64, lon: 14.29, r: 40, label: "Leptis Magna, Libya", src: "https://en.wikipedia.org/wiki/Leptis_Magna" });
TL.geo("n93-ly-us-raid", { scope: "place", lat: 32.89, lon: 13.19, r: 60, label: "Tripoli, Libya", src: "https://en.wikipedia.org/wiki/Tripoli" });
TL.geo("n93-ly-sanctions", { scope: "region", lat: 27.0, lon: 17.0, r: 1000, label: "Libya", src: "https://en.wikipedia.org/wiki/Libya" });
TL.geo("n93-ly-megrahi", { scope: "place", lat: 55.12, lon: -3.35, r: 30, label: "Lockerbie, Scotland", src: "https://en.wikipedia.org/wiki/Lockerbie" });
TL.geo("n93-ly-wmd", { scope: "place", lat: 32.89, lon: 13.19, r: 50, label: "Tripoli, Libya", src: "https://en.wikipedia.org/wiki/Tripoli" });
TL.geo("n93-ly-koni", { scope: "region", lat: 26.33, lon: 13.43, r: 600, label: "Fezzan, Libya", src: "https://en.wikipedia.org/wiki/Fezzan" });
TL.geo("n93-ly-uprising", { scope: "place", lat: 32.12, lon: 20.07, r: 50, label: "Benghazi, Libya", src: "https://en.wikipedia.org/wiki/Benghazi" });
TL.geo("n93-ly-unscr-1973", { scope: "place", lat: 40.75, lon: -73.97, r: 30, label: "UN Headquarters, New York", src: "https://en.wikipedia.org/wiki/United_Nations_Headquarters" });
TL.geo("n93-ly-gaddafi-killed", { scope: "place", lat: 31.2, lon: 16.59, r: 40, label: "Sirte, Libya", src: "https://en.wikipedia.org/wiki/Sirte" });
TL.geo("n93-ly-election-2012", { scope: "place", lat: 32.89, lon: 13.19, r: 50, label: "Tripoli, Libya", src: "https://en.wikipedia.org/wiki/Tripoli" });
TL.geo("n93-ly-civil-war-2", { scope: "place", lat: 32.08, lon: 23.97, r: 50, label: "Tobruk, Libya", src: "https://en.wikipedia.org/wiki/Tobruk" });
TL.geo("n93-ly-skhirat", { scope: "place", lat: 33.27, lon: -7.14, r: 40, label: "Skhirat, Morocco", src: "https://en.wikipedia.org/wiki/Skhirat" });
TL.geo("n93-ly-haftar-tripoli", { scope: "place", lat: 32.89, lon: 13.19, r: 60, label: "Tripoli, Libya", src: "https://en.wikipedia.org/wiki/Tripoli" });
TL.geo("n93-ly-ceasefire", { scope: "region", lat: 27.0, lon: 17.0, r: 1000, label: "Libya", src: "https://en.wikipedia.org/wiki/Libya" });

// Second (non-Wikipedia) sources, each page fetched and read.
const NH = X("https://www.thenewhumanitarian.org/report/95252/mali-timeline-northern-conflict", "A timeline of northern conflict — The New Humanitarian (IRIN)");
TL.cite("n93-ml-tuareg-1962", NH.t, NH.u);
TL.cite("n93-ml-tuareg-1990", NH.t, NH.u);
const KB = B("biography/Salif-Keita-Malian-singer-songwriter", "Salif Keita");
TL.cite("n93-ml-ambassadeurs", KB.t, KB.u);
TL.cite("n93-ml-soro", KB.t, KB.u);
TL.cite("n93-ml-soro", "Soro — Encyclopaedia Britannica", "https://www.britannica.com/topic/Soro-album-by-Keita");
TL.cite("n93-ml-ali-farka", "Ry Cooder — Encyclopaedia Britannica", "https://www.britannica.com/biography/Ry-Cooder");
TL.cite("n93-ml-desert-festival", "Festival au Désert: Still in Exile, Again — Afropop Worldwide", "https://www.afropop.org/articles/festival-au-desert-still-in-exile-again");
TL.cite("n93-ml-serval", "Timeline: a year of hunting jihadists in West Africa — France 24", "https://www.france24.com/en/20140111-france-mali-military-intervention-operation-serval-anniversary-timeline");
TL.cite("n93-ml-serval", "Mali (2012 coup and warfare in the north) — Encyclopaedia Britannica", "https://www.britannica.com/place/Mali/2012-coup-and-warfare-in-the-north");
for (const id of ["n93-cm-multiparty", "n93-cm-anglophone-strike"]) TL.cite(id, "History of Cameroon — Encyclopaedia Britannica", "https://www.britannica.com/topic/history-of-Cameroon");
TL.cite("n93-cm-olympics-2000", "Football, Men (Sydney 2000) — Olympedia", "https://www.olympedia.org/editions/25/sports/FBL");
TL.cite("n93-ma-fez-treaty", "Treaty of Fès — Encyclopaedia Britannica", "https://www.britannica.com/topic/Treaty-of-Fes");
for (const id of ["n93-ma-exile-1953", "n93-ma-kingdom-1957"]) TL.cite(id, "Muḥammad V — Encyclopaedia Britannica", "https://www.britannica.com/biography/Muhammad-V-sultan-of-Morocco");
TL.cite("n93-ma-sand-war", "History of Morocco — Encyclopaedia Britannica", "https://www.britannica.com/topic/history-of-Morocco");
TL.cite("n93-ma-hassan-mosque", "Traveling to Morocco with The Met — The Metropolitan Museum of Art", "https://www.metmuseum.org/perspectives/travel-to-morocco");
TL.cite("n93-ma-moudawana", "The Moroccan Family Code (Moudawana) — EuroMed Rights", "https://euromedrights.org/publication/the-moroccan-family-code-moudawana/");
TL.cite("n93-ma-worldcup-2022", "Morocco receives a triumphant homecoming after historic fourth place at the World Cup — ESPN (AP)", "https://www.espn.com/soccer/story/_/id/37634972/morocco-receives-triumphant-homecoming-historic-fourth-place-2022-world-cup-qatar");
TL.cite("n93-ly-constitution", "Constitution of 1951 — DCAF Legal Databases (Libya)", "https://security-legislation.ly/latest-laws/constitution-of-1951/");
TL.cite("n93-ly-oil-concession", "Industry (Libya) — Library of Congress country studies", "https://country-studies.com/libya/industry.html");
TL.cite("n93-ly-oil-concession", "Libya, Economy — Encyclopaedia Britannica", "https://www.britannica.com/place/Libya/Economy");
TL.cite("n93-ly-lion-desert", "Lion of the Desert — Turner Classic Movies", "https://www.tcm.com/articles/387665/lion-of-the-desert");
TL.cite("n93-ly-koni", "Ibrahim al-Koni — The American University in Cairo Press", "https://aucpress.com/author/ibrahim-al-koni/");
TL.cite("n93-ly-koni", "Words of wisdom — The National", "https://www.thenationalnews.com/arts-culture/books/words-of-wisdom-1.263186");
TL.cite("n93-ly-election-2012", "Freedom in the World 2013: Libya — Freedom House", "https://www.ecoi.net/en/document/1021127.html");
TL.cite("n93-ly-civil-war-2", "Libya's Legitimacy Crisis — Carnegie Endowment for International Peace", "https://carnegieendowment.org/posts/2014/10/libyas-legitimacy-crisis?lang=en");
TL.cite("n93-ly-skhirat", "Libya parliament rejects UN-backed unity government — Al Jazeera", "https://www.aljazeera.com/news/2016/1/25/libya-parliament-rejects-un-backed-unity-government");
TL.cite("n93-ly-skhirat", "Libya's new UN-backed government issues warning — Al Jazeera", "https://www.aljazeera.com/news/2016/3/31/libyas-new-un-backed-government-issues-warning");
TL.cite("n93-ly-haftar-tripoli", "In Libya, Guterres deeply concerned by risk of fresh military confrontation — UN News", "https://news.un.org/en/story/2019/04/1036061");
TL.cite("n93-ly-haftar-tripoli", "UN calls on Haftar's forces to halt Libya advance — France 24", "https://www.france24.com/en/20190406-libya-un-security-council-g7-calls-haftar-halt-libya-advance-tripoli");
