// 95: new branches Sri Lanka, Nepal, Hong Kong. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const D = (y, m, d) => y + ([0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][m - 1] + d - 0.5) / 365;
const BR = (t, p) => ({ t: t + " — Encyclopaedia Britannica", u: "https://www.britannica.com/" + p });
const WP = (t, s) => ({ t: t + " — Wikipedia", u: "https://en.wikipedia.org/wiki/" + s });
const UN = (t, n) => ({ t: t + " — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/" + n + "/" });
const SL = (t, s) => BR(t, "place/Sri-Lanka/" + s);
const HKB = (t, s) => BR(t, "place/Hong-Kong/" + s);
const NP = (t, s) => BR(t, "place/Nepal/" + s);
const HKM = BR("Hong Kong", "place/Hong-Kong");
const SLE = SL("Sri Lanka: Anuradhapura and Polonnaruwa periods", "Conversion-to-Buddhism");

TL.add({
  branches: [
    { id: "sri-lanka", name: "Sri Lanka (Anuradhapura to republic)", region: "southasia", start: -250, end: null,
      startWhen: "c. 3rd century BCE (approximate start of the Anuradhapura period)", endWhen: "",
      parents: [], into: [],
      text: "The island's Sinhalese kingdoms, from Anuradhapura through Polonnaruwa and Kandy, then Portuguese, Dutch and British Ceylon, and the republic since 1972.",
      cites: [SL("Sri Lanka: History", "History"), WP("Sri Lanka", "Sri_Lanka")] },
    { id: "nepal", name: "Nepal", region: "southasia", start: 1769, end: null,
      startWhen: "1769 (Prithvi Narayan Shah takes the Kathmandu Valley)", endWhen: "",
      parents: [], into: [],
      text: "Prithvi Narayan Shah's Gorkha kingdom took the Kathmandu Valley and became the Kingdom of Nepal, a monarchy until it became a federal democratic republic in 2008.",
      cites: [NP("Nepal: History", "History"), WP("Nepal", "Nepal")] },
    { id: "hong-kong", name: "Hong Kong", region: "eastasia", start: D(1841, 1, 26), end: null,
      startWhen: "January 26, 1841", endWhen: "",
      parents: [], into: [],
      text: "A British colony from 1841 to 1997, then a Special Administrative Region of China under the “one country, two systems” framework.",
      cites: [HKM, WP("History of Hong Kong", "History_of_Hong_Kong")] },
  ],
  events: [
    // ---------- sri-lanka ----------
    { id: "n95-sl-buddhism-mahinda", branch: "sri-lanka", y: -247, when: "3rd century BCE (in Ashoka's reign, c. 273–232 BCE)", imp: 1, link: "buddhism",
      title: "Mahinda brings Buddhism to King Tissa",
      text: "By Sinhalese tradition a mission led by Ashoka's son Mahinda met King Tissa at Mihintale. The king converted, and by the 2nd century BCE the Sinhalese had accepted Buddhism.",
      cites: [SL("Sri Lanka: Conversion to Buddhism", "Conversion-to-Buddhism")] },
    { id: "n95-sl-bodhi-sapling", branch: "sri-lanka", y: -245, when: "3rd century BCE", imp: 2, link: "buddhism",
      title: "Bodhi tree sapling planted at Anuradhapura",
      text: "UNESCO says the sacred city of Anuradhapura grew up around a sapling of the Buddha's fig tree brought from India in the 3rd century BCE. The capital flourished for some 1,300 years.",
      cites: [UN("Sacred City of Anuradhapura", 200), SLE] },
    { id: "n95-sl-duttagamani", branch: "sri-lanka", y: -161, end: -137, when: "reigned 161–137 BCE", imp: 3,
      title: "Duttagamani extends Anuradhapura's rule",
      text: "Duttagamani Abhaya was the leading chief of his day. As Buddhism spread, the Anuradhapura kingdom under him extended political control over the rest of Sri Lanka.",
      cites: [SLE] },
    { id: "n95-sl-vasabha", branch: "sri-lanka", y: 65, when: "65 CE", imp: 3,
      title: "Vasabha founds the Lambakanna dynasty",
      text: "In 65 CE Vasabha founded the Lambakanna dynasty. From about his reign large rivers were dammed with earthen embankments to make huge reservoirs for irrigation.",
      cites: [SLE] },
    { id: "n95-sl-sigiriya", branch: "sri-lanka", y: 477, end: 495, when: "477–495 CE", imp: 2,
      title: "Kashyapa I builds Sigiriya",
      text: "Kashyapa I moved the capital from Anuradhapura to the rock fortress of Sigiriya, known for its apsara paintings. The site became a UNESCO World Heritage site in 1982.",
      cites: [BR("Sigiriya", "place/Sigiriya"), SLE] },
    { id: "n95-sl-anuradhapura-abandoned", branch: "sri-lanka", y: 993, when: "993", imp: 2,
      title: "Anuradhapura abandoned after invasion",
      text: "UNESCO records that the political and religious capital, which had flourished for 1,300 years, was abandoned after an invasion in 993. Britannica notes the Cholas then completed their conquest of the island in 1017.",
      cites: [UN("Sacred City of Anuradhapura", 200), SLE] },
    { id: "n95-sl-vijayabahu", branch: "sri-lanka", y: 1070, when: "1070", imp: 2, link: "chola",
      title: "Vijayabahu expels the Cholas, founds Polonnaruwa",
      text: "The Cholas held the island until 1070, when Vijayabahu liberated it and revived Sinhalese power. He made Polonnaruwa, easier to defend against south Indian attacks, his capital.",
      cites: [SLE] },
    { id: "n95-sl-parakramabahu", branch: "sri-lanka", y: 1153, end: 1186, when: "reigned 1153–1186", imp: 2,
      title: "Parakramabahu I and Polonnaruwa's golden age",
      text: "Under Parakramabahu I the Polonnaruwa kingdom enjoyed its greatest prosperity. His reign crowned the island's irrigation works with the Parakrama Samudra reservoir.",
      cites: [SLE] },
    { id: "n95-sl-magha", branch: "sri-lanka", y: 1214, when: "1214", imp: 2,
      title: "Magha invades and ends Polonnaruwa's kingdom",
      text: "After 1196 the Polonnaruwa kingdom was weakened by ineffective rulers. In 1214 Magha of the Kalingas invaded with mercenaries and took the whole island; his rule lasted until 1255.",
      cites: [SL("Sri Lanka: The fall of Polonnaruwa", "The-fall-of-Polonnaruwa")] },
    { id: "n95-sl-zheng-he", branch: "sri-lanka", y: 1411, when: "1411", imp: 3, link: "ming",
      title: "Zheng He takes the Sinhalese king to China",
      text: "On his return in 1411 the Ming admiral Zheng defeated the ruler Vira Alakeshvara and took him and his minister captive to China. The capital had moved to Kotte in 1412.",
      cites: [SL("Sri Lanka: The fall of Polonnaruwa", "The-fall-of-Polonnaruwa")] },
    { id: "n95-sl-portuguese", branch: "sri-lanka", y: 1505, when: "1505", imp: 1, link: "portugal",
      title: "Portuguese fleet reaches Colombo",
      text: "A Portuguese fleet under Lourenço de Almeida was blown into Colombo in 1505. In 1518 the Portuguese were allowed to build a fort there, and by 1597 they held the Kotte kingdom.",
      cites: [SL("Sri Lanka: The Portuguese, 1505–1658", "The-Portuguese-in-Sri-Lanka-1505-1658")] },
    { id: "n95-sl-kandy-1594", branch: "sri-lanka", y: 1594, when: "1594", imp: 2, link: "portugal",
      title: "Kandy routs a Portuguese army",
      text: "After a Portuguese expedition to Kandy in 1594, Vimala Dharma Surya used guerrilla tactics to rout the army. Kandy remained the island's independent Sinhalese kingdom.",
      cites: [SL("Sri Lanka: Kandy and its struggle with European powers", "Kandy-and-its-struggle-with-European-powers")] },
    { id: "n95-sl-dutch-treaty", branch: "sri-lanka", y: D(1638, 5, 23), when: "May 23, 1638", imp: 2, link: "dutch-republic",
      title: "Kandy and the Dutch sign a treaty",
      text: "Dutch envoy Westerwolt and King Rajasinha II concluded a treaty giving the Dutch a monopoly on most of Sri Lanka's cinnamon. Dutch forces and Kandy then took Portuguese forts.",
      cites: [SL("Sri Lanka: Kandy and its struggle with European powers", "Kandy-and-its-struggle-with-European-powers")] },
    { id: "n95-sl-british-1796", branch: "sri-lanka", y: 1796, when: "1796", imp: 2, link: "uk",
      title: "Dutch surrender Ceylon to the British",
      text: "After halfhearted resistance the Dutch surrendered the island in 1796. The British first ran it from Madras, then made Ceylon a crown colony in 1802.",
      cites: [SL("Sri Lanka: British Ceylon, 1796–1900", "British-Ceylon-1796-1900")] },
    { id: "n95-sl-kandy-falls", branch: "sri-lanka", y: 1815, when: "1815", imp: 1, link: "uk",
      title: "Britain takes Kandy; the last Sinhalese kingdom ends",
      text: "With help from disaffected Kandyan chiefs the British took over the Kandyan kingdom in 1815. UNESCO calls Kandy the last capital of the Sinhala kings and the site of the Temple of the Tooth Relic.",
      cites: [SL("Sri Lanka: British Ceylon, 1796–1900", "British-Ceylon-1796-1900"), UN("Sacred City of Kandy", 450)] },
    { id: "n95-sl-coffee-1833", branch: "sri-lanka", y: 1833, when: "1833", imp: 3,
      title: "1833 reforms and the coffee boom",
      text: "A series of reforms in 1833 laid the political and economic foundation of British Ceylon. From about 1830 coffee production spearheaded the colony's economic development.",
      cites: [SL("Sri Lanka: British Ceylon, 1796–1900", "British-Ceylon-1796-1900")] },
    { id: "n95-sl-congress-1919", branch: "sri-lanka", y: 1919, when: "1919", imp: 3,
      title: "Ceylon National Congress formed",
      text: "Leaders of all communities came together in 1919 to form the Ceylon National Congress, which united Sinhalese and Tamil organizations on a common nationalist platform.",
      cites: [SL("Sri Lanka: Growth of nationalist power", "Growth-of-nationalist-power")] },
    { id: "n95-sl-independence", branch: "sri-lanka", y: D(1948, 2, 4), when: "February 4, 1948", imp: 1, link: "uk",
      title: "Ceylon becomes independent",
      text: "The Ceylon Independence Act of 1947 gave the colony dominion status, with allegiance to the British crown. Actual independence as the Dominion of Ceylon came on February 4, 1948, when the 1947 constitution took effect.",
      cites: [SL("Sri Lanka: Independent Ceylon, 1948–71", "Independent-Ceylon-1948-71"), SL("Sri Lanka: Growth of nationalist power", "Growth-of-nationalist-power")] },
    { id: "n95-sl-sinhala-only", branch: "sri-lanka", y: 1956, when: "1956", imp: 2,
      title: "Sinhala Only Act passed",
      text: "The Official Language Act of 1956 made Sinhala the sole official language. Tamils saw it as a symbol of minority oppression; it is cited as a factor in the later civil war. The SLFP won that year's election.",
      cites: [WP("Sinhala Only Act", "Sinhala_Only_Act"), SL("Sri Lanka: Independent Ceylon, 1948–71", "Independent-Ceylon-1948-71")] },
    { id: "n95-sl-sirimavo", branch: "sri-lanka", y: 1960, when: "1960", imp: 2,
      title: "Sirimavo Bandaranaike, first woman prime minister",
      text: "After her husband's assassination in 1959, Sirimavo Bandaranaike formed a government in 1960 and became the first woman in the world to hold the office of prime minister.",
      cites: [SL("Sri Lanka: Independent Ceylon, 1948–71", "Independent-Ceylon-1948-71"), BR("Sirimavo Bandaranaike", "biography/Sirimavo-Bandaranaike")] },
    { id: "n95-sl-jvp-1971", branch: "sri-lanka", y: 1971, when: "1971", imp: 3,
      title: "JVP launches an armed rebellion",
      text: "Discontented youth mobilized by the People's Liberation Front (JVP) launched an unsuccessful armed rebellion in 1971.",
      cites: [SL("Sri Lanka: Independent Ceylon, 1948–71", "Independent-Ceylon-1948-71")] },
    { id: "n95-sl-republic-1972", branch: "sri-lanka", y: 1972, when: "1972", imp: 1,
      title: "Ceylon becomes the Republic of Sri Lanka",
      text: "In 1972 the country became a republic named Sri Lanka, repudiating dominion status. A 1978 constitution renamed it the Democratic Socialist Republic of Sri Lanka and created an executive presidency.",
      cites: [WP("Sri Lanka", "Sri_Lanka"), SL("Sri Lanka: The Republic of Sri Lanka", "The-Republic-of-Sri-Lanka")] },
    { id: "n95-sl-jaffna-library", branch: "sri-lanka", y: D(1981, 5, 31), when: "May 31, 1981", imp: 3,
      title: "Jaffna Public Library burned",
      text: "On May 31, 1981 an arson attack on the Jaffna Public Library destroyed tens of thousands of books, including palm-leaf manuscripts, and deepened Tamil alienation in the years before the civil war.",
      cites: [{ t: "The Burning of Jaffna Public Library: Sri Lanka’s First Step Toward Civil War — The Diplomat", u: "https://thediplomat.com/2020/05/the-burning-of-jaffna-public-library-sri-lankas-first-step-toward-civil-war" }, WP("Sri Lankan civil war", "Sri_Lankan_civil_war")] },
    { id: "n95-sl-civil-war", branch: "sri-lanka", y: D(1983, 7, 23), end: 2009.4, when: "July 23, 1983 – May 2009", imp: 1,
      title: "Civil war: Tamil Tigers against the state",
      text: "An LTTE insurgency began July 23, 1983, as anti-Tamil riots swept Colombo. It lasted 26 years; the UN estimated 80,000–100,000 deaths by May 2009 (Britannica puts it at 70,000–80,000).",
      cites: [SL("Sri Lanka: The Republic of Sri Lanka", "The-Republic-of-Sri-Lanka"), WP("Sri Lankan civil war", "Sri_Lankan_civil_war")] },
    { id: "n95-sl-cricket-1996", branch: "sri-lanka", y: D(1996, 3, 17), when: "March 17, 1996", imp: 2,
      title: "Sri Lanka wins the Cricket World Cup",
      text: "Co-hosting the tournament with India and Pakistan, Sri Lanka beat Australia by seven wickets in the final at Lahore.",
      cites: [BR("Cricket World Cup", "sports/Cricket-World-Cup"), WP("1996 Cricket World Cup", "1996_Cricket_World_Cup")] },
    { id: "n95-sl-tsunami", branch: "sri-lanka", y: D(2004, 12, 26), when: "December 26, 2004", imp: 1,
      title: "Indian Ocean tsunami strikes Sri Lanka",
      text: "A tsunami set off by a magnitude 9.1 earthquake off Sumatra struck Sri Lanka's northern, eastern and southern coasts, killing tens of thousands of people there.",
      cites: [SL("Sri Lanka: The Republic of Sri Lanka", "The-Republic-of-Sri-Lanka"), BR("Indian Ocean tsunami of 2004", "event/Indian-Ocean-tsunami-of-2004")] },
    { id: "n95-sl-war-ends", branch: "sri-lanka", y: 2009.4, when: "May 2009", imp: 1,
      title: "Sri Lankan military defeats the Tamil Tigers",
      text: "After a 26-year war the army overran the last LTTE-held territory in a mid-May 2009 offensive. The LTTE's leaders were killed and it effectively ceased to exist; Kilinochchi had fallen in January 2009.",
      cites: [SL("Sri Lanka: The Republic of Sri Lanka", "The-Republic-of-Sri-Lanka"), WP("Sri Lankan civil war", "Sri_Lankan_civil_war")] },
    { id: "n95-sl-easter-2019", branch: "sri-lanka", y: D(2019, 4, 21), when: "April 21, 2019", imp: 2,
      title: "Easter Sunday bombings",
      text: "Coordinated suicide bombings hit three churches and three luxury hotels in Colombo and elsewhere on Easter morning, leaving hundreds dead.",
      cites: [WP("Sri Lanka Easter bombings", "Sri_Lanka_Easter_bombings"), SL("Sri Lanka: Reconstruction", "Reconstruction")] },
    { id: "n95-sl-default-2022", branch: "sri-lanka", y: D(2022, 4, 12), when: "April 12, 2022", imp: 1,
      title: "Sovereign default and economic collapse",
      text: "Food and fuel shortages, inflation and power cuts brought collapse. On April 12, 2022 Sri Lanka suspended foreign debt payments, its first sovereign default. Protesters stormed the presidential palace on July 9.",
      cites: [{ t: "Sri Lanka defaults on foreign debts — RTÉ News", u: "https://www.rte.ie/news/business/2022/0412/1291864-sri-lanka-defaults-on-foreign-debts" }, SL("Sri Lanka: Reconstruction", "Reconstruction"), WP("Sri Lanka sovereign default", "Sri_Lanka_sovereign_default")] },
    { id: "n95-sl-dissanayake", branch: "sri-lanka", y: D(2024, 9, 23), when: "September 23, 2024", imp: 2,
      title: "Dissanayake sworn in as president",
      text: "Anura Kumara Dissanayake of the JVP, once linked to violent Marxist insurrections, won the presidency on September 22 with 42 percent of the vote and was sworn in the next day.",
      cites: [SL("Sri Lanka: Reconstruction", "Reconstruction")] },

    // ---------- nepal ----------
    { id: "n95-np-unification", branch: "nepal", y: 1769, when: "1769", imp: 1,
      title: "Prithvi Narayan Shah conquers the Kathmandu Valley",
      text: "Gorkha's king Prithvi Narayan Shah conquered the three Malla kingdoms of the Kathmandu Valley in 1769 and soon moved his capital to Kathmandu, founding the modern state of Nepal.",
      cites: [BR("Prithvi Narayan Shah", "biography/Prithvi-Narayan-Shah"), NP("Nepal: History", "History")] },
    { id: "n95-np-china-war", branch: "nepal", y: 1788, end: 1792, when: "1788–1792", imp: 3, link: "qing",
      title: "War with Tibet and China",
      text: "Setbacks in wars with China and Tibet in 1788–92, then with the Sikh kingdom (1809) and British India, frustrated Nepal's expansion and set its present boundaries.",
      cites: [NP("Nepal: History", "History")] },
    { id: "n95-np-sugauli", branch: "nepal", y: D(1816, 3, 4), when: "March 4, 1816", imp: 1, link: "british-raj",
      title: "Treaty of Sugauli ends the Anglo-Nepalese War",
      text: "The 1814–16 war ended with the Treaty of Sugauli (Sagauli). Nepal ceded land west of the Kali River, gave up claims to disputed Tarai lowlands and accepted a British resident at Kathmandu.",
      cites: [BR("Anglo-Nepalese War", "topic/Anglo-Nepalese-War"), WP("Treaty of Sugauli", "Treaty_of_Sugauli")] },
    { id: "n95-np-rana", branch: "nepal", y: D(1846, 9, 15), end: D(1951, 2, 18), when: "September 15, 1846 – February 18, 1951", imp: 1,
      title: "Rana family takes power",
      text: "Jung Bahadur Rana founded a hereditary line of prime ministers that reduced the Shah kings to figureheads. After 1860 the Ranas kept a de facto alliance with Britain, allowing Gurkha recruitment.",
      cites: [WP("Rana dynasty", "Rana_dynasty"), NP("Nepal: History", "History")] },
    { id: "n95-np-1951", branch: "nepal", y: D(1951, 2, 18), when: "November 1950 – February 18, 1951", imp: 1,
      title: "Rana regime overthrown; King Tribhuvan restored",
      text: "With India's diplomatic support, anti-Rana forces led by the Nepali Congress allied with King Tribhuvan and launched a revolution in November 1950. The settlement restored the crown's sovereignty and ended Rana rule in 1951.",
      cites: [NP("Nepal: History", "History"), WP("Rana dynasty", "Rana_dynasty")] },
    { id: "n95-np-constitution-1959", branch: "nepal", y: 1959, when: "1959", imp: 3,
      title: "First constitution and elections",
      text: "A constitution approved in 1959 led to general elections for a national assembly. In December 1960 King Mahendra dismissed the elected government, and a 1962 constitution made the crown the real authority.",
      cites: [NP("Nepal: Constitutional monarchy", "Constitutional-monarchy")] },
    { id: "n95-np-unesco-1979", branch: "nepal", y: 1979, when: "1979", imp: 2,
      title: "Kathmandu Valley named a World Heritage site",
      text: "UNESCO inscribed the valley's seven monument zones: the Durbar Squares of Kathmandu, Patan and Bhaktapur, the stupas of Swayambhu and Bauddhanath, and the temples of Pashupati and Changu Narayan.",
      cites: [UN("Kathmandu Valley", 121), BR("Kathmandu Valley", "place/Kathmandu-Valley")] },
    { id: "n95-np-referendum-1980", branch: "nepal", y: D(1980, 5, 2), when: "May 1980", imp: 3,
      title: "Referendum keeps the partyless system",
      text: "In a May 1980 referendum supporters of the nonparty system won with about 55 percent, though King Birendra liberalized it with direct elections to the National Assembly.",
      cites: [NP("Nepal: Constitutional monarchy", "Constitutional-monarchy")] },
    { id: "n95-np-jana-andolan", branch: "nepal", y: 1990.2, when: "February – autumn 1990", imp: 1,
      title: "Jana Andolan (People's Movement)",
      text: "In February 1990 a coalition of opposition forces began a popular uprising demanding reform. A new multiparty constitution was submitted to the palace on September 10, 1990.",
      cites: [NP("Nepal: Constitutional monarchy", "Constitutional-monarchy")] },
    { id: "n95-np-maoist-war", branch: "nepal", y: D(1996, 2, 13), end: D(2006, 11, 21), when: "February 13, 1996 – November 21, 2006", imp: 1,
      title: "Maoist insurgency (Nepalese Civil War)",
      text: "The Communist Party of Nepal (Maoist) began an armed campaign to overthrow the monarchy. More than 17,000 people died before the Comprehensive Peace Accord of November 21, 2006.",
      cites: [WP("Nepalese civil war", "Nepalese_civil_war"), NP("Nepal: Fall of the monarchy", "Fall-of-the-monarchy")] },
    { id: "n95-np-massacre", branch: "nepal", y: D(2001, 6, 1), when: "June 1, 2001", imp: 1,
      title: "Royal massacre at Narayanhiti Palace",
      text: "Nine members of the royal family, including King Birendra and Queen Aishwarya, were shot dead. An inquiry named Crown Prince Dipendra, who died days later; Gyanendra became king.",
      cites: [WP("Nepalese royal massacre", "Nepalese_royal_massacre"), NP("Nepal: Fall of the monarchy", "Fall-of-the-monarchy")] },
    { id: "n95-np-direct-rule", branch: "nepal", y: 2005.09, when: "2005", imp: 3,
      title: "King Gyanendra imposes direct rule",
      text: "King Gyanendra imposed direct rule in 2005. After parliament was reinstated in April 2006, Koirala became prime minister again.",
      cites: [NP("Nepal: Fall of the monarchy", "Fall-of-the-monarchy")] },
    { id: "n95-np-republic", branch: "nepal", y: D(2008, 5, 28), when: "May 28, 2008", imp: 1,
      title: "Nepal declared a republic",
      text: "More than two centuries of royal rule ended when the newly elected assembly voted to declare Nepal a democratic republic. Ram Baran Yadav became its first president in July.",
      cites: [NP("Nepal: Fall of the monarchy", "Fall-of-the-monarchy"), WP("Nepal", "Nepal")] },
    { id: "n95-np-earthquake", branch: "nepal", y: D(2015, 4, 25), when: "April 25, 2015", imp: 1,
      title: "Gorkha earthquake devastates Nepal",
      text: "A magnitude 7.8 earthquake near Kathmandu killed around 9,000 people and damaged or destroyed over 600,000 structures. Centuries-old monuments at World Heritage sites in the Kathmandu Valley collapsed or were damaged.",
      cites: [BR("Nepal earthquake of 2015", "topic/Nepal-earthquake-of-2015"), WP("April 2015 Nepal earthquake", "April_2015_Nepal_earthquake")] },
    { id: "n95-np-constitution-2015", branch: "nepal", y: D(2015, 9, 20), when: "September 20, 2015", imp: 2,
      title: "Federal constitution adopted",
      text: "The humanitarian crisis after the earthquake helped spur negotiations. A new constitution took effect on September 20, 2015, making Nepal a secular federal republic; it prompted violent protests by Madhesis.",
      cites: [NP("Nepal: Federal republic", "Federal-republic")] },
    { id: "n95-np-genz", branch: "nepal", y: D(2025, 9, 8), end: D(2025, 9, 9), when: "September 8–9, 2025", imp: 2,
      title: "Gen Z protests topple the government",
      text: "A ban on 26 social media platforms sparked protests; clashes on September 8–9 left 51 dead and over 1,300 injured. Government buildings were burned and Prime Minister K.P. Sharma Oli resigned on September 9.",
      cites: [NP("Nepal: Federal republic", "Federal-republic")] },

    // ---------- hong-kong ----------
    { id: "n95-hk-1841", branch: "hong-kong", y: D(1841, 1, 26), when: "January 26, 1841", imp: 2, link: "uk",
      title: "British flag raised over Hong Kong Island",
      text: "Britain raised the Union Jack over Possession Point on January 26, 1841, after the Convention of Chuenpi. The island's population was about 7,450, mostly Tanka fishermen and Hakka charcoal burners.",
      cites: [WP("History of Hong Kong", "History_of_Hong_Kong"), HKM] },
    { id: "n95-hk-nanking", branch: "hong-kong", y: D(1842, 8, 29), when: "August 29, 1842", imp: 1, link: "qing",
      title: "Treaty of Nanking cedes Hong Kong Island",
      text: "China, defeated in the First Opium War, was forced to cede Hong Kong Island to Britain, which made it a crown colony.",
      cites: [BR("Treaty of Nanjing", "event/Treaty-of-Nanjing"), HKM] },
    { id: "n95-hk-kowloon", branch: "hong-kong", y: 1860, when: "1860", imp: 2, link: "qing",
      title: "Kowloon Peninsula ceded to Britain",
      text: "After the Second Opium War, China ceded the southern Kowloon Peninsula and Stonecutters Island to Britain in 1860, by the Convention of Beijing.",
      cites: [HKM, WP("History of Hong Kong", "History_of_Hong_Kong")] },
    { id: "n95-hk-new-territories", branch: "hong-kong", y: 1898, when: "1898", imp: 2, link: "qing",
      title: "New Territories leased for 99 years",
      text: "Britain leased the New Territories and 230 offshore islands from China for 99 years, from 1898 to 1997. The lease later set the clock on the colony's future.",
      cites: [HKM, WP("History of Hong Kong", "History_of_Hong_Kong")] },
    { id: "n95-hk-japanese-occupation", branch: "hong-kong", y: D(1941, 12, 25), end: D(1945, 8, 15), when: "December 25, 1941 – August 15, 1945", imp: 1,
      title: "Japanese occupation",
      text: "Japan occupied Hong Kong after the British surrender on December 25, 1941, until August 15, 1945. British troops returned on August 30, 1945, and civil government was reestablished in May 1946.",
      cites: [WP("History of Hong Kong", "History_of_Hong_Kong"), HKB("Hong Kong: Postwar Hong Kong", "Postwar-Hong-Kong")] },
    { id: "n95-hk-manufacturing", branch: "hong-kong", y: 1950, end: 1959, when: "1950s", imp: 3,
      title: "Shanghai industrialists build Hong Kong manufacturing",
      text: "Immigrant Chinese industrialists, mainly from Shanghai, brought technology and capital that drove manufacturing in the 1950s. A 1951 UN embargo on trade with China had curtailed the entrepôt trade.",
      cites: [HKB("Hong Kong: Manufacturing", "Manufacturing"), HKB("Hong Kong: Postwar Hong Kong", "Postwar-Hong-Kong")] },
    { id: "n95-hk-riots-1967", branch: "hong-kong", y: 1967.4, when: "May 1967", imp: 2, link: "prc",
      title: "1967 riots",
      text: "A labor dispute at a plastic-flower factory escalated into violent leftist demonstrations inspired by the Cultural Revolution. Fifty-one people were killed and the government closed pro-CCP schools.",
      cites: [HKB("Hong Kong: Postwar Hong Kong", "Postwar-Hong-Kong"), WP("1967 Hong Kong riots", "1967_Hong_Kong_riots")] },
    { id: "n95-hk-cantopop", branch: "hong-kong", y: 1975, end: 1999, when: "from the mid-1970s; peak 1980s–1990s", imp: 2,
      title: "Cantopop rises",
      text: "Pop music sung in Cantonese became associated with Hong Kong from the mid-1970s. It peaked in the 1980s and 1990s, reaching audiences in mainland China, Southeast Asia and overseas Chinese communities.",
      cites: [{ t: "Heritage Museum traces development of Hong Kong Cantopop — Hong Kong Government news", u: "https://www.info.gov.hk/gia/general/200711/10/P200711090209.htm" }, WP("Cantopop", "Cantopop")] },
    { id: "n95-hk-film-festival", branch: "hong-kong", y: 1977, when: "1977", imp: 3,
      title: "Hong Kong International Film Festival begins",
      text: "The festival, inaugurated in 1977, became a major showcase for Asian films.",
      cites: [HKB("Hong Kong: Cultural life", "Cultural-life")] },
    { id: "n95-hk-new-wave", branch: "hong-kong", y: 1979, when: "1979", imp: 2,
      title: "Hong Kong New Wave cinema begins",
      text: "The Hong Kong New Wave started in 1979 with the release of numerous notable films by a new generation of directors.",
      cites: [{ t: "Li Cheuk-to on M+ Restored — M+ Museum", u: "https://www.mplus.org.hk/en/magazine/li-cheuk-to-interview-on-mplus-restored/" }, WP("Hong Kong New Wave", "Hong_Kong_New_Wave")] },
    { id: "n95-hk-joint-declaration", branch: "hong-kong", y: D(1984, 12, 19), when: "December 19, 1984", imp: 1, link: "prc",
      title: "Sino-British Joint Declaration signed",
      text: "The British and Chinese governments agreed that all of Hong Kong would return to China on July 1, 1997, under “one country, two systems”, with its systems unchanged for 50 years.",
      cites: [HKB("Hong Kong: Postwar Hong Kong", "Postwar-Hong-Kong"), BR("Chinese-British joint declaration", "topic/Chinese-British-joint-declaration"), WP("Sino-British Joint Declaration", "Sino-British_Joint_Declaration")] },
    { id: "n95-hk-basic-law", branch: "hong-kong", y: D(1990, 4, 4), when: "April 4, 1990", imp: 2,
      title: "Basic Law ratified",
      text: "China's National People's Congress ratified the Basic Law on April 4, 1990. It took effect on July 1, 1997, and set up the Hong Kong Special Administrative Region.",
      cites: [HKB("Hong Kong: Postwar Hong Kong", "Postwar-Hong-Kong"), HKB("Hong Kong: Government and society", "Government-and-society")] },
    { id: "n95-hk-walled-city", branch: "hong-kong", y: 1993, end: 1994.3, when: "1993–April 1994 (park opened December 22, 1995)", imp: 3,
      title: "Kowloon Walled City demolished",
      text: "The densely populated enclave left outside the 1898 lease was cleared in 1993–94, after a 1987 decision made with China's agreement. A 1987 survey counted about 33,000 residents; a park opened there in December 1995.",
      cites: [{ t: "Kowloon Walled City Park: historical background — Leisure and Cultural Services Department, Hong Kong", u: "https://lcsd.gov.hk/en/parks/kwcp/historical.html" }, WP("Kowloon Walled City", "Kowloon_Walled_City")] },
    { id: "n95-hk-article-23", branch: "hong-kong", y: 2003.5, when: "2003", imp: 3,
      title: "Mass protests stall a security law",
      text: "An attempt in 2003 to enact the national security law required by the Basic Law brought mass protests, and Hong Kong adopted no such law then. Beijing imposed its own security law in June 2020.",
      cites: [HKB("Hong Kong: Postwar Hong Kong", "Postwar-Hong-Kong")] },
    { id: "n95-hk-umbrella", branch: "hong-kong", y: D(2014, 9, 28), when: "September 28, 2014", imp: 1,
      title: "Umbrella Movement",
      text: "After Beijing's August 31, 2014 decision on pre-screening candidates for chief executive, protesters occupied the streets. Police fired tear gas on September 28; umbrellas shielded protesters from pepper spray.",
      cites: [{ t: "Remembering Occupy Hong Kong — Amnesty International", u: "https://www.amnesty.org/en/latest/news/2015/09/remembering-occupy-hong-kong/" }, WP("Umbrella Movement", "Umbrella_Movement")] },
    { id: "n95-hk-protests-2019", branch: "hong-kong", y: D(2019, 6, 9), end: 2020, when: "June 9, 2019 – 2020", imp: 1, link: "prc",
      title: "Anti-extradition bill protests",
      text: "A June 9 march against an extradition bill (270,000 by police count, over a million by organizers') grew into months of protest. Demands widened to include an inquiry into police conduct and universal suffrage.",
      cites: [HKB("Hong Kong: Postwar Hong Kong", "Postwar-Hong-Kong"), WP("2019–2020 Hong Kong protests", "2019%E2%80%932020_Hong_Kong_protests")] },
    { id: "n95-hk-district-2019", branch: "hong-kong", y: D(2019, 11, 24), when: "November 24, 2019", imp: 3,
      title: "Pro-democracy landslide in district elections",
      text: "The pro-democracy camp won nearly 90 percent of 452 seats on a record turnout of about 71 percent. The vote was widely read as a referendum on the protests and the government's handling of them.",
      cites: [{ t: "Pro-democracy opposition wins landslide victory in Hong Kong elections — PBS NewsHour (AP)", u: "https://www.pbs.org/newshour/world/pro-democracy-opposition-wins-landslide-victory-in-hong-kong-elections" }, WP("2019–2020 Hong Kong protests", "2019%E2%80%932020_Hong_Kong_protests")] },
  ],
});

TL.origin("sri-lanka", {
  note: "Indo-Aryan settlers reached the island from northern India about the 5th century BCE, later joined by Tamil migrants from south India. Buddhism arrived under King Tissa, and the Anuradhapura kingdom grew around it.",
  links: [
    { id: "buddhism", how: "ideas", note: "King Tissa accepted Buddhism from a mission said to be led by Ashoka's son Mahinda" },
    { id: "maurya", how: "context", note: "The Mauryan emperor Ashoka is said to have sent the mission to Sri Lanka" },
  ],
  cites: [SL("Sri Lanka: History", "History"), SL("Sri Lanka: Conversion to Buddhism", "Conversion-to-Buddhism")],
});
TL.origin("nepal", {
  note: "Gorkha, one of the small hill principalities ruled by the Shah family, rose in the early 18th century. Under Prithvi Narayan Shah it conquered the three Malla kingdoms of the Kathmandu Valley in 1769.",
  links: [],
  cites: [NP("Nepal: History", "History"), BR("Prithvi Narayan Shah", "biography/Prithvi-Narayan-Shah")],
});
TL.origin("hong-kong", {
  note: "A sparsely settled island of Tanka fishermen and Hakka charcoal burners off the south China coast, ceded piece by piece by the Qing to Britain after the Opium Wars: the island in 1842, Kowloon in 1860, and a 99-year lease of the New Territories in 1898.",
  links: [
    { id: "qing", how: "conquest", note: "Qing China ceded Hong Kong Island in 1842 after the First Opium War" },
    { id: "uk", how: "context", note: "British crown colony from 1841 until the 1997 handover" },
  ],
  cites: [HKM, WP("History of Hong Kong", "History_of_Hong_Kong")],
});

// Existing events that belong on the new branches.
TL.patch("gb2-nz-hillary-everest", { link: "nepal" });
TL.move("st-hk-handover", "hong-kong");
TL.move("st-hk-nsl", "hong-kong");
TL.move("c1ea-enter-the-dragon", "hong-kong");

// ---------- locations ----------
const P = (id, lat, lon, label, s, r = 60) => TL.geo(id, { scope: "place", lat, lon, r, label, src: "https://en.wikipedia.org/wiki/" + s });
const R = (id, lat, lon, r, label, s) => TL.geo(id, { scope: "region", lat, lon, r, label, src: "https://en.wikipedia.org/wiki/" + s });
R("sri-lanka", 7.6, 80.7, 250, "Sri Lanka", "Sri_Lanka");
R("nepal", 28.4, 84.1, 450, "Nepal", "Nepal");
R("hong-kong", 22.35, 114.15, 40, "Hong Kong", "Hong_Kong");
P("n95-sl-buddhism-mahinda", 8.35, 80.51, "Mihintale, Sri Lanka", "Mihintale");
P("n95-sl-bodhi-sapling", 8.35, 80.4, "Anuradhapura, Sri Lanka", "Anuradhapura");
P("n95-sl-duttagamani", 8.35, 80.4, "Anuradhapura, Sri Lanka", "Anuradhapura");
P("n95-sl-vasabha", 8.35, 80.4, "Anuradhapura, Sri Lanka", "Anuradhapura");
P("n95-sl-sigiriya", 7.96, 80.76, "Sigiriya, Sri Lanka", "Sigiriya");
P("n95-sl-anuradhapura-abandoned", 8.35, 80.4, "Anuradhapura, Sri Lanka", "Anuradhapura");
P("n95-sl-vijayabahu", 7.94, 81.0, "Polonnaruwa, Sri Lanka", "Polonnaruwa");
P("n95-sl-parakramabahu", 7.94, 81.0, "Polonnaruwa, Sri Lanka", "Polonnaruwa");
P("n95-sl-magha", 7.94, 81.0, "Polonnaruwa, Sri Lanka", "Polonnaruwa");
P("n95-sl-zheng-he", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-sl-portuguese", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-sl-kandy-1594", 7.29, 80.63, "Kandy, Sri Lanka", "Kandy");
P("n95-sl-dutch-treaty", 7.29, 80.63, "Kandy, Sri Lanka", "Kandy");
P("n95-sl-british-1796", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-sl-kandy-falls", 7.29, 80.63, "Kandy, Sri Lanka", "Kandy");
R("n95-sl-coffee-1833", 7.3, 80.6, 150, "Central Highlands, Ceylon", "Sri_Lanka");
P("n95-sl-congress-1919", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-sl-independence", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-sl-sinhala-only", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-sl-sirimavo", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
R("n95-sl-jvp-1971", 7.6, 80.7, 250, "Sri Lanka", "Sri_Lanka");
P("n95-sl-republic-1972", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-sl-jaffna-library", 9.66, 80.01, "Jaffna, Sri Lanka", "Jaffna");
R("n95-sl-civil-war", 8.0, 80.8, 250, "Sri Lanka", "Sri_Lankan_civil_war");
P("n95-sl-cricket-1996", 31.52, 74.33, "Gaddafi Stadium, Lahore, Pakistan", "Gaddafi_Stadium");
R("n95-sl-tsunami", 7.0, 80.5, 300, "Sri Lanka's coasts", "2004_Indian_Ocean_earthquake_and_tsunami");
P("n95-sl-war-ends", 9.4, 80.4, "Northern Province, Sri Lanka", "Kilinochchi", 100);
P("n95-sl-easter-2019", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-sl-default-2022", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-sl-dissanayake", 6.93, 79.85, "Colombo, Sri Lanka", "Colombo");
P("n95-np-unification", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
R("n95-np-china-war", 28.4, 85.0, 300, "Nepal–Tibet border", "Nepal");
R("n95-np-sugauli", 27.0, 84.9, 250, "Sugauli, Bihar (Nepal's southern frontier)", "Nepal");
P("n95-np-rana", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
P("n95-np-1951", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
P("n95-np-constitution-1959", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
P("n95-np-unesco-1979", 27.7, 85.31, "Kathmandu Valley, Nepal", "Kathmandu_Valley");
P("n95-np-referendum-1980", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
P("n95-np-jana-andolan", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
R("n95-np-maoist-war", 28.0, 82.5, 350, "Rolpa and western Nepal", "Nepalese_civil_war");
P("n95-np-massacre", 27.72, 85.32, "Narayanhiti Palace, Kathmandu", "Narayanhiti_Palace");
P("n95-np-direct-rule", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
P("n95-np-republic", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
P("n95-np-earthquake", 28.23, 84.73, "Barpak, Gorkha District (epicenter)", "April_2015_Nepal_earthquake", 100);
P("n95-np-constitution-2015", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
P("n95-np-genz", 27.7, 85.3, "Kathmandu, Nepal", "Kathmandu");
P("n95-hk-1841", 22.28, 114.14, "Possession Point, Hong Kong Island", "Possession_Street", 30);
P("n95-hk-nanking", 32.06, 118.78, "Nanjing, China", "Nanjing");
P("n95-hk-kowloon", 22.31, 114.17, "Kowloon, Hong Kong", "Kowloon");
R("n95-hk-new-territories", 22.45, 114.15, 40, "New Territories, Hong Kong", "New_Territories");
P("n95-hk-japanese-occupation", 22.3, 114.17, "Hong Kong", "Hong_Kong");
P("n95-hk-manufacturing", 22.3, 114.17, "Hong Kong", "Hong_Kong");
P("n95-hk-riots-1967", 22.3, 114.17, "Hong Kong", "Hong_Kong");
P("n95-hk-cantopop", 22.3, 114.17, "Hong Kong", "Hong_Kong");
P("n95-hk-film-festival", 22.3, 114.17, "Hong Kong", "Hong_Kong");
P("n95-hk-new-wave", 22.3, 114.17, "Hong Kong", "Hong_Kong");
P("n95-hk-joint-declaration", 39.9, 116.39, "Beijing, China", "Beijing");
P("n95-hk-basic-law", 39.9, 116.39, "Beijing, China", "Beijing");
P("n95-hk-walled-city", 22.33, 114.19, "Kowloon Walled City", "Kowloon_Walled_City", 30);
P("n95-hk-article-23", 22.28, 114.16, "Central, Hong Kong", "Central,_Hong_Kong", 30);
P("n95-hk-umbrella", 22.28, 114.17, "Admiralty, Hong Kong", "Admiralty,_Hong_Kong", 30);
P("n95-hk-protests-2019", 22.28, 114.16, "Hong Kong", "Hong_Kong");
P("n95-hk-district-2019", 22.3, 114.17, "Hong Kong", "Hong_Kong");
