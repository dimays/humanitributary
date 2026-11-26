// New branches: Lebanon, Jordan, and the Gulf states (Kuwait, Bahrain, Qatar, UAE, Oman). Cites fetched and read this session.
const D = (y, m, d) => +(y + (Date.UTC(2001, m - 1, d) - Date.UTC(2001, 0, 1)) / 31536000000).toFixed(3);
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const OH = (c, name) => ({ t: `${name} — Countries — Office of the Historian`, u: `https://history.state.gov/countries/${c}`, k: "archive" });
const UN = (id, title) => ({ t: `${title} — UNESCO World Heritage Centre`, u: `https://whc.unesco.org/en/list/${id}`, k: "reference" });
const BBC_LB = { t: "Lebanon profile - Timeline — BBC News", u: "https://www.bbc.com/news/world-middle-east-14649284", k: "news" };
const X = (t, u, k) => ({ t, u, k });
const geo = (id, lat, lon, r, label, src, scope = "place") => TL.geo(id, { scope, lat, lon, r, label, src: `https://en.wikipedia.org/wiki/${src}` });

TL.add({
  branches: [
    { id: "lebanon", name: "Lebanon", region: "mideast", start: D(1920, 9, 1), end: null, startWhen: "September 1, 1920", endWhen: undefined, parents: [], into: [],
      text: "Greater Lebanon was proclaimed under a French mandate in 1920, became independent in 1943–46, and is a confessionally governed republic that has lived through civil war, foreign occupation and the 2020 port explosion.",
      cites: [W("Greater_Lebanon", "Greater Lebanon"), OH("lebanon", "Lebanon"), BBC_LB] },
    { id: "jordan", name: "Jordan", region: "mideast", start: D(1921, 3, 2), end: null, startWhen: "March 1921", endWhen: undefined, parents: [], into: [],
      text: "Emir Abdullah founded Transjordan in 1921 under British protection; it became independent in 1946, the Hashemite Kingdom of Jordan after 1948–50, and made peace with Israel in 1994.",
      cites: [W("Emirate_of_Transjordan", "Emirate of Transjordan"), B("biography/Abdullah-I", "Abdullah I"), OH("jordan", "Jordan")] },
    { id: "gulf-states", name: "Gulf states (Kuwait, Bahrain, Qatar, UAE, Oman)", region: "mideast", start: 1899, end: null, startWhen: "1899", endWhen: undefined, parents: [], into: [],
      text: "Kuwait came under British protection in 1899, and Bahrain, Qatar and the Trucial States were also bound to Britain by treaty. Kuwait (1961), Bahrain, Qatar and the UAE (1971) became independent, and oil and gas wealth reshaped them, as it did Oman.",
      cites: [B("place/Kuwait", "Kuwait"), OH("united-arab-emirates", "United Arab Emirates"), B("topic/Gulf-Cooperation-Council", "Gulf Cooperation Council")] },
  ],
  events: [
    // ---------- Lebanon ----------
    { id: "n94-lb-greater-lebanon", branch: "lebanon", y: D(1920, 9, 1), when: "September 1, 1920", title: "Gouraud proclaims the State of Greater Lebanon", imp: 1,
      text: "French General Henri Gouraud declared Greater Lebanon, with Beirut as its capital, following a decree of August 31; it was run by France as a League of Nations mandate, which the League approved in 1922.",
      cites: [W("Greater_Lebanon", "Greater Lebanon"), OH("lebanon", "Lebanon"), BBC_LB] },
    { id: "n94-lb-constitution-1926", branch: "lebanon", y: D(1926, 5, 23), when: "May 23, 1926", title: "Lebanon adopts its first constitution", imp: 2,
      text: "A constitution inspired by the French one was adopted on May 23, 1926, and the Lebanese Republic was officially proclaimed on September 1, 1926, still under the French mandate.",
      cites: [W("Lebanon", "Lebanon"), BBC_LB] },
    { id: "n94-lb-an-nahar", branch: "lebanon", y: D(1933, 8, 4), when: "August 4, 1933", title: "Gebran Tueni launches the daily An-Nahar", imp: 3,
      text: "An-Nahar began as a four-page, hand-set paper with five staff and about 500 copies, and became what a trade-press profile calls Lebanon’s “paper of record.”",
      cites: [W("An-Nahar", "An-Nahar"), X("Annahar — Media Ownership Monitor Lebanon", "https://lebanon.mom-gmr.org/en/media/detail/outlet/annahar-3/", "reference"), X("From martyrs to machines: Reinventing journalism with soul at An-Nahar, Lebanon — WAN-IFRA", "https://wan-ifra.org/2025/06/from-martyrs-to-machines-reinventing-journalism-with-soul-at-an-nahar-lebanon/", "news")] },
    { id: "n94-lb-national-pact", branch: "lebanon", y: 1943.5, when: "summer 1943", title: "The unwritten National Pact divides power by sect", imp: 1,
      text: "President Bechara El Khoury and Prime Minister Riad Al Solh agreed that the president would be a Maronite, the prime minister a Sunni and parliament seats split 6:5 in favor of Christians, a formula that Taif revised in 1989.",
      cites: [W("National_Pact", "National Pact"), B("topic/Taif-Accord", "Ṭāʾif Accord"), BBC_LB] },
    { id: "n94-lb-independence-1943", branch: "lebanon", y: D(1943, 11, 22), when: "November 22, 1943", title: "French release Lebanon's government and accept independence", imp: 1,
      text: "Facing British pressure and nationalist protests, France freed the officials it had jailed and accepted Lebanese independence on November 22, 1943; the BBC's timeline dates the transfer of power to January 1, 1944.",
      cites: [W("Lebanon", "Lebanon"), BBC_LB, X("1943 independence: between “official narrative” and facts — The Beiruter", "https://www.thebeiruter.com/article/1943-independence-between-%22official-narrative%22-and-facts/492", "news")] },
    { id: "n94-lb-french-leave-1946", branch: "lebanon", y: 1946.96, when: "December 1946", title: "The last French troops leave Lebanon", imp: 2,
      text: "The last French troops withdrew from Lebanon in December 1946, completing independence from the mandate power; a plaque at Nahr el-Kalb is dated December 31, 1946.",
      cites: [W("Lebanon", "Lebanon"), X("1943 independence: between “official narrative” and facts — The Beiruter", "https://www.thebeiruter.com/article/1943-independence-between-%22official-narrative%22-and-facts/492", "news")] },
    { id: "n94-lb-baalbek-fairuz-1957", branch: "lebanon", y: 1957.6, when: "summer 1957", title: "Fairuz and the Rahbani Brothers star at Baalbek", imp: 2,
      text: "Fairuz's performances at the Baalbek International Festival from 1957 cemented her renown; with Assi and Mansour Rahbani, who wrote most of her songs and plays, she helped define a Lebanese musical identity that spread across the Arab world.",
      cites: [B("biography/Fairuz", "Fairuz"), B("topic/Rahbani-brothers", "Rahbani Brothers"), W("Fairuz", "Fairuz")] },
    { id: "n94-lb-crisis-1958", branch: "lebanon", y: 1958.54, when: "May–July 1958", title: "Armed revolt in 1958; US Marines land near Beirut", link: "usa", imp: 2,
      text: "Armed rebellion broke out in Beirut in May 1958; President Camille Chamoun appealed to the United States, and US Marines landed near Beirut in July, ending the military threat to his government.",
      cites: [B("biography/Camille-Chamoun", "Camille Chamoun"), BBC_LB, W("1958_Lebanon_crisis", "1958 Lebanon crisis")] },
    { id: "n94-lb-cairo-agreement-1969", branch: "lebanon", y: 1969.84, when: "November 1969", title: "Cairo Agreement tolerates Palestinian guerrillas", imp: 2,
      text: "With Egyptian mediation, Lebanon agreed to tolerate and regulate Palestinian guerrilla activity, and the 16 UNRWA refugee camps were placed under a Palestinian Armed Struggle Command.",
      cites: [W("Cairo_Agreement_(1969)", "Cairo Agreement (1969)"), X("3 November 1969: Lebanon signs Cairo agreement — Libnanews", "https://en.libnanews.com/3-november-1969-lebanon-signs-cairo-agreement", "news")] },
    { id: "n94-lb-civil-war-begins", branch: "lebanon", y: D(1975, 4, 13), end: D(1990, 10, 13), when: "April 13, 1975 – October 13, 1990", title: "Civil war begins after the bus attack in Beirut", imp: 1,
      text: "Phalangist gunmen attacked a bus carrying mainly Palestinians to a Beirut camp, killing 27; the 15-year war that followed killed over 100,000 people and divided Beirut along a “green line.”",
      cites: [B("event/Lebanese-Civil-War", "Lebanese Civil War"), BBC_LB] },
    { id: "n94-lb-barracks-1983", branch: "lebanon", y: D(1983, 10, 23), when: "October 23, 1983", title: "Suicide bombers hit US and French barracks in Beirut", link: "usa", imp: 2,
      text: "Two simultaneous suicide bombings killed 241 US marines and sailors and 58 French paratroopers serving in a multinational force amid the civil war.",
      cites: [B("event/1983-Beirut-barracks-bombings", "1983 Beirut barracks bombings"), BBC_LB] },
    { id: "n94-lb-taif-1989", branch: "lebanon", y: D(1989, 10, 22), when: "October 22, 1989", title: "Taif Accord signed to end the war", imp: 1,
      text: "Lebanese deputies meeting in Taif, Saudi Arabia, agreed a charter of national reconciliation shifting power from the president to the cabinet and equalizing Christian and Muslim seats; parliament ratified it on November 5.",
      cites: [B("topic/Taif-Accord", "Ṭāʾif Accord"), W("Taif_Agreement", "Taif Agreement"), BBC_LB] },
    { id: "n94-lb-war-ends-1990", branch: "lebanon", y: D(1990, 10, 13), when: "October 13, 1990", title: "Syrian attack forces General Aoun into exile", link: "syria", imp: 2,
      text: "On October 13, 1990 Syrian forces attacked the presidential palace at Baabda and General Michel Aoun, who opposed Taif, fled; Britannica and the BBC treat this as the end of the civil war.",
      cites: [B("event/Lebanese-Civil-War", "Lebanese Civil War"), B("biography/Michel-Aoun", "Michel Aoun"), BBC_LB] },
    { id: "n94-lb-solidere-1994", branch: "lebanon", y: D(1994, 5, 5), when: "May 5, 1994", title: "Solidere founded to rebuild downtown Beirut", imp: 2,
      text: "Prime Minister Rafic al-Hariri, in office 1992–98, led the effort to rebuild Lebanon after the war; the Solidere company, founded May 5, 1994, was created to redevelop the destroyed central district.",
      cites: [W("Solidere", "Solidere"), B("biography/Rafiq-al-Hariri", "Rafic al-Hariri")] },
    { id: "n94-lb-israel-leaves-2000", branch: "lebanon", y: 2000.4, when: "May 2000", title: "Israel withdraws from southern Lebanon", link: "israel", imp: 2,
      text: "After the collapse of the South Lebanon Army and a rapid Hezbollah advance, Israel pulled its troops out of the south more than six weeks before its July deadline, ending an occupation that began in the civil war.",
      cites: [BBC_LB, B("topic/Hezbollah", "Hezbollah")] },
    { id: "n94-lb-hariri-killed-2005", branch: "lebanon", y: D(2005, 2, 14), when: "February 14, 2005", title: "Former prime minister Rafic al-Hariri assassinated", link: "syria", imp: 1,
      text: "A truck bomb on Beirut's Corniche killed Hariri and 21 others and injured 220. Protests blaming Syria followed, and Syrian forces left Lebanon later that spring.",
      cites: [B("biography/Rafiq-al-Hariri", "Rafic al-Hariri"), W("Assassination_of_Rafic_Hariri", "Assassination of Rafic Hariri")] },
    { id: "n94-lb-unesco-1984", branch: "lebanon", y: 1984.5, when: "1984", title: "UNESCO lists Anjar, Baalbek, Byblos and Tyre", imp: 2,
      text: "Four Lebanese sites were inscribed as World Heritage in 1984: the Umayyad city of Anjar, the Roman temples of Baalbek, Phoenician Byblos and Tyre.",
      cites: [UN(293, "Anjar"), UN(294, "Baalbek"), UN(295, "Byblos"), UN(299, "Tyre")] },
    { id: "n94-lb-gibran-prophet", branch: "lebanon", y: 1923.5, when: "1923", title: "Gibran publishes The Prophet in New York", imp: 2,
      text: "Khalil Gibran, born in Bsharri in Mount Lebanon and an emigrant to the United States since 1895, published The Prophet in English in 1923. It has been translated into more than 100 languages.",
      cites: [B("biography/Khalil-Gibran", "Khalil Gibran"), W("Kahlil_Gibran", "Kahlil Gibran")] },
    { id: "n94-lb-capernaum-2018", branch: "lebanon", y: D(2018, 5, 17), when: "May 17, 2018", title: "Nadine Labaki's Capernaum premieres at Cannes", imp: 2,
      text: "Capernaum won the Jury Prize at Cannes after a 15-minute standing ovation, and was later nominated for the Academy Award for best foreign-language film.",
      cites: [W("Capernaum_(film)", "Capernaum (film)"), X("Capharnaüm — Festival de Cannes", "https://www.festival-cannes.com/en/f/capharnaum/", "reference")] },
    { id: "n94-lb-protests-2019", branch: "lebanon", y: D(2019, 10, 17), when: "October 17, 2019", title: "Nationwide protests against sectarian rule and the economy", imp: 2,
      text: "Planned taxes on gasoline, tobacco and WhatsApp calls set off protests that became a condemnation of sectarian rule and economic stagnation; Prime Minister Saad Hariri resigned.",
      cites: [W("2019%E2%80%932021_Lebanese_protests", "17 October Revolution"), B("biography/Hassan-Diab", "Hassan Diab")] },
    { id: "n94-lb-port-blast-2020", branch: "lebanon", y: D(2020, 8, 4), when: "August 4, 2020", title: "Beirut port explosion", imp: 1,
      text: "A fire at Warehouse 12 set off stored ammonium nitrate, killing at least 218 people, injuring about 7,000 and displacing roughly 300,000. Prime Minister Diab’s government resigned within days.",
      cites: [{ t: "Beirut explosion: What we know so far — BBC News", u: "https://www.bbc.com/news/world-middle-east-53668493", k: "news" }, W("2020_Beirut_explosion", "2020 Beirut explosion"), BBC_LB, B("event/2020-Beirut-explosion", "2020 Beirut explosion")] },

    // ---------- Jordan ----------
    { id: "n94-jo-emirate-1921", branch: "jordan", y: D(1921, 3, 2), when: "March 2, 1921", title: "Abdullah enters Amman and founds the Emirate of Transjordan", imp: 1,
      text: "Abdullah ibn Hussein reached Amman on March 2, 1921; at a conference with the British later that month it was agreed he would administer Transjordan, which stayed a British protectorate.",
      cites: [W("Emirate_of_Transjordan", "Emirate of Transjordan"), B("topic/Arab-Legion", "Arab Legion"), X("Creation of Transjordan (1921) — Fanack", "https://fanack.com/jordan/history-of-jordan/creation-of-transjordan/", "reference")] },
    { id: "n94-jo-independence-1946", branch: "jordan", y: D(1946, 5, 25), when: "May 25, 1946", title: "Transjordan declares independence; Abdullah crowned king", imp: 1,
      text: "With British agreement, Transjordan declared independence on May 25, 1946, and Abdullah was crowned in Amman; the Treaty of London ratifications followed on June 17.",
      cites: [OH("jordan", "Jordan"), B("biography/Abdullah-I", "Abdullah I"), W("Emirate_of_Transjordan", "Emirate of Transjordan")] },
    { id: "n94-jo-annexation-1950", branch: "jordan", y: D(1950, 4, 24), when: "April 24, 1950", title: "Jordan annexes the West Bank", link: "israel", imp: 1,
      text: "Abdullah formally annexed the West Bank and East Jerusalem, held by the Arab Legion since 1948, on April 24, 1950; the name Hashemite Kingdom of Jordan dates to 1949. The Arab League and most states rejected the annexation.",
      cites: [B("biography/Abdullah-I", "Abdullah I"), W("Jordanian_annexation_of_the_West_Bank", "Jordanian annexation of the West Bank"), B("topic/Arab-Legion", "Arab Legion")] },
    { id: "n94-jo-abdullah-killed-1951", branch: "jordan", y: D(1951, 7, 20), when: "July 20, 1951", title: "King Abdullah I assassinated in Jerusalem", imp: 2,
      text: "A Palestinian nationalist shot King Abdullah in Jerusalem, where he had come to speak at the funeral of Lebanese prime minister Riad Al Solh. His annexation of the West Bank had cost him popularity at home.",
      cites: [B("biography/Abdullah-I", "Abdullah I"), W("Assassination_of_Abdullah_I_of_Jordan", "Assassination of Abdullah I of Jordan")] },
    { id: "n94-jo-hussein-king-1952", branch: "jordan", y: D(1952, 8, 11), when: "August 11, 1952", title: "Hussein proclaimed king at age 16", imp: 1,
      text: "Parliament removed his ill father Talal, and Hussein was proclaimed king on August 11, 1952, three months before turning 17. A regency ruled until he was enthroned on May 2, 1953; Britannica dates his taking power to 1953.",
      cites: [W("Hussein_of_Jordan", "Hussein of Jordan"), B("topic/Arab-Legion", "Arab Legion")] },
    { id: "n94-jo-glubb-dismissed-1956", branch: "jordan", y: D(1956, 3, 1), when: "March 1, 1956", title: "Hussein dismisses Glubb Pasha", link: "uk", imp: 2,
      text: "Under nationalist pressure against British influence, King Hussein relieved General Sir John Bagot Glubb, who had led the Arab Legion since 1939, of his command.",
      cites: [B("topic/Arab-Legion", "Arab Legion"), B("biography/John-Bagot-Glubb", "Sir John Bagot Glubb")] },
    { id: "n94-jo-six-day-war-1967", branch: "jordan", y: D(1967, 6, 5), end: D(1967, 6, 10), when: "June 5–10, 1967", title: "Jordan loses the West Bank in the Six-Day War", link: "israel", imp: 1,
      text: "Jordan joined Egypt and Syria in the war and lost the West Bank, including the Old City of Jerusalem, to Israeli occupation; Palestinian guerrillas based in Jordan became a growing force afterward.",
      cites: [B("event/Six-Day-War", "Six-Day War"), W("Hussein_of_Jordan", "Hussein of Jordan")] },
    { id: "n94-jo-black-september-1970", branch: "jordan", y: D(1970, 9, 16), end: D(1970, 9, 27), when: "September 16–27, 1970", title: "Black September: army fights the PLO", imp: 1,
      text: "After PFLP hijackings and months of clashes, King Hussein's army fought PLO guerrillas in a civil war remembered as Black September; the main fighting ran September 16–27 and the PLO moved its base to Lebanon.",
      cites: [B("event/Black-September-Jordanian-history", "Black September"), W("Black_September", "Black September")] },
    { id: "n94-jo-west-bank-1988", branch: "jordan", y: 1988.58, when: "1988", title: "Hussein renounces Jordan's ties to the West Bank", imp: 2,
      text: "As Palestinians pressed their claim to the West Bank during the first intifada, and after the PLO won recognition as their sole representative, King Hussein renounced Jordan’s ties to the West Bank in 1988.",
      cites: [W("Hussein_of_Jordan", "Hussein of Jordan"), B("place/Jordan", "Jordan")] },
    { id: "n94-jo-petra-unesco-1985", branch: "jordan", y: D(1985, 12, 6), when: "December 6, 1985", title: "Petra inscribed as a World Heritage Site", imp: 2,
      text: "UNESCO inscribed Petra, the rock-cut Nabataean city, on December 6, 1985; Swiss traveler Johann Ludwig Burckhardt had brought it to Western notice in 1812.",
      cites: [UN(326, "Petra"), W("Petra", "Petra")] },
    { id: "n94-jo-peace-treaty-1994", branch: "jordan", y: D(1994, 10, 26), when: "October 26, 1994", title: "Jordan and Israel sign a peace treaty", link: "israel", imp: 1,
      text: "Prime Ministers Yitzhak Rabin and Abdelsalam al-Majali signed the treaty at the Arabah border crossing in King Hussein’s presence, making Jordan the second Arab state, after Egypt, to make peace with Israel.",
      cites: [W("Israel%E2%80%93Jordan_peace_treaty", "Israel–Jordan peace treaty"), B("biography/Yitzhak-Rabin", "Yitzhak Rabin")] },
    { id: "n94-jo-abdullah-ii-1999", branch: "jordan", y: D(1999, 2, 7), when: "February 7, 1999", title: "King Hussein dies; Abdullah II succeeds", imp: 1,
      text: "Hours after his father's death on February 7, 1999, Abdullah became king, weeks after being named crown prince; he was crowned on June 9.",
      cites: [B("biography/Abdullah-II", "Abdullah II")] },
    { id: "n94-jo-amman-bombings-2005", branch: "jordan", y: D(2005, 11, 9), when: "November 9, 2005", title: "Suicide bombings hit three Amman hotels", imp: 2,
      text: "Explosions at the Grand Hyatt, Radisson SAS and Days Inn hotels killed 57 people and injured 115; 38 died at a wedding at the Radisson.",
      cites: [W("2005_Amman_bombings", "2005 Amman bombings"), X("Explosions Rock Three Hotels in Amman, Jordan — PBS NewsHour", "https://www.pbs.org/newshour/nation/middle_east-july-dec05-jordan_11-09", "news")] },
    { id: "n94-jo-new7wonders-2007", branch: "jordan", y: D(2007, 7, 7), when: "July 7, 2007", title: "Petra named one of the New 7 Wonders", imp: 3,
      text: "Petra was among seven sites announced as winners of a popularity poll organized by the New 7 Wonders Foundation, with results revealed in Lisbon on July 7, 2007.",
      cites: [W("New7Wonders_of_the_World", "New7Wonders of the World"), B("topic/New-Seven-Wonders-of-the-World", "New Seven Wonders of the World")] },
    { id: "n94-jo-wadi-rum-2011", branch: "jordan", y: 2011.48, when: "2011", title: "Wadi Rum Protected Area inscribed by UNESCO", imp: 3,
      text: "UNESCO listed the 74,000-hectare Wadi Rum as a mixed natural and cultural site, noting 12,000 years of human occupation and some 25,000 rock carvings.",
      cites: [UN(1377, "Wadi Rum Protected Area")] },
    { id: "n94-jo-zaatari-2012", branch: "jordan", y: D(2012, 7, 28), when: "July 28, 2012", title: "Zaatari camp opens for Syrian refugees", link: "syria", imp: 2,
      text: "Jordan opened Zaatari camp in Mafraq Governorate for Syrians fleeing the war; within months it became the governorate's largest population center.",
      cites: [W("Zaatari_refugee_camp", "Zaatari refugee camp"), X("Jordan’s Za’atari refugee camp: 10 facts at 10 years — United Nations in Jordan", "https://jordan.un.org/en/201679-jordan%E2%80%99s-za%E2%80%99atari-refugee-camp-10-facts-10-years", "reference")] },
    { id: "n94-jo-theeb-2016", branch: "jordan", y: 2016.04, when: "2016 (88th Academy Awards)", title: "Theeb is Jordan's first Oscar nominee", imp: 2,
      text: "Naji Abu Nowar's Bedouin-set film, which won him best director in Venice's Horizons section in 2014, was nominated for best foreign-language film, the first Jordanian nomination.",
      cites: [W("Theeb", "Theeb"), X("Jordanian film Theeb nominated for Academy Award — The National", "https://www.thenationalnews.com/arts/jordanian-film-theeb-nominated-for-academy-award-1.170993", "news")] },

    // ---------- Gulf states ----------
    { id: "n94-gu-kuwait-1899", branch: "gulf-states", y: D(1899, 1, 23), when: "January 23, 1899", title: "Britain and Kuwait sign the Anglo-Kuwaiti Agreement", link: "uk", imp: 1,
      text: "Britain pledged to protect Kuwait's territorial integrity in return for Kuwait restricting foreign powers' access and regulating its affairs; the protectorate lasted until 1961.",
      cites: [W("Anglo-Kuwaiti_Agreement_of_1899", "Anglo-Kuwaiti Agreement of 1899"), B("place/Kuwait", "Kuwait")] },
    { id: "n94-gu-bahrain-oil-1932", branch: "gulf-states", y: D(1932, 6, 2), when: "June 2, 1932", title: "Oil discovered in Bahrain", imp: 2,
      text: "Oil struck at Jebel Dukhan made Bahrain the first country in the Arabian Gulf to discover oil, beginning an economic transformation; it later diversified into finance and services.",
      cites: [X("History — Bapco", "https://www.bapco.net/en/page/history/", "reference"), W("History_of_Bahrain", "History of Bahrain"), B("place/Bahrain/History", "Bahrain")] },
    { id: "n94-gu-kuwait-burgan-1938", branch: "gulf-states", y: 1938.5, when: "1938", title: "Oil found in commercial quantity at Burgan, Kuwait", imp: 2,
      text: "Oil was discovered in commercial quantities in the Burgan field, one of the world’s largest, four years after the Kuwait Oil Company was set up by Anglo-Persian and Gulf Oil.",
      cites: [W("Kuwait_Oil_Company", "Kuwait Oil Company"), W("Kuwait", "Kuwait"), X("Our History — Kuwait Oil Company", "https://www.kockw.com/sites/EN/Pages/Profile/whoAreWe/KOC-History.aspx", "reference")] },
    { id: "n94-gu-qatar-oil-1939", branch: "gulf-states", y: 1939.5, when: "1939 (first produced 1949)", title: "Oil discovered in Qatar", imp: 2,
      text: "Discovered in 1939 and first produced in 1949, petroleum lifted Qatar from one of the world's poorest countries, where people lived by pearling and fishing, to a wealthy one.",
      cites: [B("place/Qatar", "Qatar"), W("Dukhan", "Dukhan")] },
    { id: "n94-gu-kuwait-independence-1961", branch: "gulf-states", y: D(1961, 6, 19), when: "June 19, 1961", title: "Kuwait becomes fully independent", link: "uk", imp: 1,
      text: "An exchange of notes with Britain on June 19, 1961 ended the Anglo-Kuwaiti Treaty of 1899 and made Kuwait fully independent.",
      cites: [OH("kuwait", "Kuwait"), B("place/Kuwait", "Kuwait")] },
    { id: "n94-gu-kuwait-constitution-1962", branch: "gulf-states", y: D(1962, 11, 11), when: "November 11, 1962", title: "Kuwait promulgates its constitution", imp: 2,
      text: "A Constituent Assembly elected in December 1961 drafted the constitution, promulgated as Law No. 1 on November 11, 1962.",
      cites: [W("Constitution_of_Kuwait", "Constitution of Kuwait"), W("Kuwait", "Kuwait"), X("Kuwait marks 64th anniversary of its Constitution — Kuwait Times", "https://kuwaittimes.com/article/53428/kuwait/kuwait-marks-64th-anniversary-of-its-constitution/", "news")] },
    { id: "n94-gu-zayed-1966", branch: "gulf-states", y: D(1966, 8, 6), when: "August 6, 1966", title: "Zayed replaces his brother as ruler of Abu Dhabi", imp: 2,
      text: "In a bloodless palace coup with British support, Sheikh Zayed bin Sultan Al Nahyan took over from his brother Shakhbut and began modernizing Abu Dhabi with roads, corniches and greenery.",
      cites: [W("Zayed_bin_Sultan_Al_Nahyan", "Zayed bin Sultan Al Nahyan"), B("biography/Sheikh-Zayid-ibn-Sultan-Al-Nahyan", "Sheikh Zayed ibn Sultan Al Nahyan")] },
    { id: "n94-gu-british-withdrawal-1968", branch: "gulf-states", y: 1968.05, when: "early 1968", title: "Britain decides to leave; Abu Dhabi and Dubai plan a union", link: "uk", imp: 2,
      text: "An early-1968 British decision to withdraw from the Trucial States led Zayed of Abu Dhabi and Rashid of Dubai to agree to form a federation.",
      cites: [W("History_of_the_United_Arab_Emirates", "History of the United Arab Emirates"), OH("united-arab-emirates", "United Arab Emirates"), B("biography/Sheikh-Zayid-ibn-Sultan-Al-Nahyan", "Sheikh Zayed ibn Sultan Al Nahyan")] },
    { id: "n94-gu-oman-qaboos-1970", branch: "gulf-states", y: D(1970, 7, 23), when: "July 23, 1970", title: "Qaboos overthrows his father and rules Oman", imp: 1,
      text: "With British support, Qaboos bin Said seized power from Sultan Said bin Taimur, who had kept the country isolated, and began building roads, hospitals and schools; he reigned until 2020.",
      cites: [B("biography/Qaboos-bin-Said", "Qaboos bin Said"), W("Qaboos_bin_Said", "Qaboos bin Said")] },
    { id: "n94-gu-bahrain-independence-1971", branch: "gulf-states", y: D(1971, 8, 15), when: "August 15, 1971", title: "Bahrain declares full independence", link: "uk", imp: 1,
      text: "When nine sheikhdoms could not agree on terms of union, Bahrain declared itself fully independent on August 15, 1971.",
      cites: [OH("bahrain", "Bahrain")] },
    { id: "n94-gu-qatar-independence-1971", branch: "gulf-states", y: D(1971, 9, 3), when: "September 3, 1971", title: "Qatar ends British protection", link: "uk", imp: 1,
      text: "Under an agreement with Britain on September 3, 1971, the special treaty arrangements inconsistent with full sovereignty ended; Doha became capital of independent Qatar, which had been a British protectorate since 1916.",
      cites: [W("Qatar", "Qatar"), OH("qatar", "Qatar"), B("place/Doha", "Doha")] },
    { id: "n94-gu-uae-formed-1971", branch: "gulf-states", y: D(1971, 12, 2), when: "December 2, 1971", title: "The United Arab Emirates is founded", link: "uk", imp: 1,
      text: "Six emirates declared their union on December 2, 1971, with Zayed as first president; Ras Al Khaimah joined on February 10, 1972.",
      cites: [OH("united-arab-emirates", "United Arab Emirates"), W("History_of_the_United_Arab_Emirates", "History of the United Arab Emirates"), B("biography/Sheikh-Zayid-ibn-Sultan-Al-Nahyan", "Sheikh Zayed ibn Sultan Al Nahyan")] },
    { id: "n94-gu-jebel-ali-1979", branch: "gulf-states", y: D(1979, 2, 26), when: "February 26, 1979", title: "Dubai opens the port of Jebel Ali", imp: 2,
      text: "Built under Rashid bin Saeed Al-Maktoum and inaugurated by Queen Elizabeth II, Jebel Ali supplemented Port Rashid; its free-trade zone, set up in the 1980s, helped Dubai grow beyond oil.",
      cites: [W("Jebel_Ali_Port", "Port of Jebel Ali"), B("topic/Jebel-Ali", "Jebel Ali")] },
    { id: "n94-gu-emirates-airline-1985", branch: "gulf-states", y: D(1985, 3, 15), when: "March 15, 1985", title: "Dubai founds Emirates airline", imp: 3,
      text: "Emirates was founded with backing from Dubai’s ruler and two aircraft leased from Pakistan International Airlines; its first flights, to Karachi and Mumbai, followed on October 25, 1985.",
      cites: [W("Emirates_(airline)", "Emirates (airline)"), X("How Emirates took flight for the first time to begin 40 years of soaring success — The National", "https://www.thenationalnews.com/news/uae/2025/10/25/how-emirates-took-flight-for-first-time-to-begin-40-years-of-soaring-success/", "news")] },
    { id: "n94-gu-kuwait-oil-fires-1991", branch: "gulf-states", y: 1991.1, end: 1991.85, when: "January–November 1991", title: "Retreating Iraqis set Kuwait's oil wells ablaze", imp: 2,
      text: "The Iraqi military set fire to 605 to 732 oil wells in Kuwait as it retreated; the first fires were put out in April, the last well was capped on November 6, 1991, and Britannica says the fires were out by fall.",
      cites: [W("Kuwaiti_oil_fires", "Kuwaiti oil fires"), B("place/Kuwait", "Kuwait")] },
    { id: "n94-gu-qatar-coup-1995", branch: "gulf-states", y: D(1995, 6, 27), when: "June 27, 1995", title: "Hamad bin Khalifa ousts his father as emir of Qatar", imp: 2,
      text: "While his father was abroad, Hamad took power in a bloodless coup; he founded Al Jazeera in 1996 and abdicated to his son Tamim in 2013.",
      cites: [B("biography/Sheikh-Hamad-ibn-Khalifah-Al-Thani", "Sheikh Hamad ibn Khalifah Al Thani"), W("Sheikh_Hamad_bin_Khalifa_Al_Thani", "Hamad bin Khalifa Al Thani")] },
    { id: "n94-gu-al-jazeera-1996", branch: "gulf-states", y: D(1996, 11, 1), when: "November 1, 1996", title: "Al Jazeera goes on air from Doha", imp: 1,
      text: "The Arabic-language news channel, founded by Qatar's emir and backed financially by his government, began broadcasting in 1996 and began continuous programming in 1999; an English channel followed in 2006.",
      cites: [B("topic/Al-Jazeera", "Al Jazeera"), W("Al_Jazeera", "Al Jazeera")] },
    { id: "n94-gu-burj-al-arab-1999", branch: "gulf-states", y: D(1999, 12, 1), when: "December 1, 1999", title: "Burj Al Arab hotel opens in Dubai", imp: 3,
      text: "The sail-shaped hotel, designed by Tom Wright, opened on December 1, 1999 and became an emblem of Dubai's tourism-led growth.",
      cites: [W("Burj_Al_Arab", "Burj Al Arab"), B("topic/Burj-al-Arab", "Burj al-ʿArab")] },
    { id: "n94-gu-zayed-dies-2004", branch: "gulf-states", y: D(2004, 11, 2), when: "November 2, 2004", title: "Sheikh Zayed, first UAE president, dies", imp: 2,
      text: "Zayed died in Abu Dhabi after serving as the UAE's president from independence in 1971.",
      cites: [W("Zayed_bin_Sultan_Al_Nahyan", "Zayed bin Sultan Al Nahyan"), B("biography/Sheikh-Zayid-ibn-Sultan-Al-Nahyan", "Sheikh Zayed ibn Sultan Al Nahyan")] },
    { id: "n94-gu-kuwait-women-vote-2005", branch: "gulf-states", y: D(2005, 5, 17), when: "May 17, 2005", title: "Kuwait's parliament grants women the vote", imp: 2,
      text: "After years of campaigning, including mock ballots in 2003, parliament passed a bill on May 17, 2005 granting women the right to vote and run for office.",
      cites: [W("Women%27s_suffrage_in_Kuwait", "Women's suffrage in Kuwait"), B("place/Kuwait", "Kuwait")] },
    { id: "n94-gu-zayed-mosque-2007", branch: "gulf-states", y: 2007.95, when: "December 2007", title: "Sheikh Zayed Grand Mosque inaugurated in Abu Dhabi", imp: 3,
      text: "Built over roughly 11 years and named for the UAE’s founding president, the mosque opened for worship on Eid al-Adha in December 2007.",
      cites: [W("Sheikh_Zayed_Grand_Mosque", "Sheikh Zayed Grand Mosque"), X("Overview — Sheikh Zayed Grand Mosque Center", "https://szgmc.gov.ae/en/islamic-architecture/overview", "reference")] },
    { id: "n94-gu-mia-doha-2008", branch: "gulf-states", y: 2008.9, when: "November–December 2008", title: "Museum of Islamic Art opens in Doha", imp: 2,
      text: "Designed by I. M. Pei on an artificial peninsula off the Corniche, the museum opened in late 2008; Wikipedia dates the emir’s opening to November 22 and the public opening to December 8.",
      cites: [W("Museum_of_Islamic_Art,_Doha", "Museum of Islamic Art, Doha"), B("topic/Museum-of-Islamic-Art-museum-Doha-Qatar", "Museum of Islamic Art")] },
    { id: "n94-gu-burj-khalifa-2010", branch: "gulf-states", y: D(2010, 1, 4), when: "January 4, 2010", title: "Burj Khalifa opens as the world's tallest building", imp: 1,
      text: "Excavation began in January 2004, and the tower, named for Abu Dhabi’s ruler, was formally opened on January 4, 2010 as the world’s tallest building.",
      cites: [B("topic/Burj-Khalifa", "Burj Khalifa")] },
    { id: "n94-gu-qatar-world-cup-bid-2010", branch: "gulf-states", y: D(2010, 12, 2), when: "December 2, 2010", title: "FIFA awards Qatar the 2022 World Cup", link: "association-football", imp: 1,
      text: "FIFA awarded the hosting rights in 2010; the tournament, played November 20 – December 18, 2022, was the first in the Middle East (see the football branch).",
      cites: [B("event/2022-FIFA-World-Cup", "2022 FIFA World Cup"), W("2022_FIFA_World_Cup", "2022 FIFA World Cup")] },
    { id: "n94-gu-bahrain-uprising-2011", branch: "gulf-states", y: D(2011, 2, 14), end: D(2011, 3, 18), when: "February 14 – March 18, 2011", title: "Pro-democracy uprising in Bahrain", imp: 2,
      text: "Protests inspired by the Arab Spring began on February 14, 2011 at Manama’s Pearl Roundabout; Gulf Cooperation Council troops entered in mid-March, martial law followed and the roundabout was cleared. Demonstrations recurred afterward.",
      cites: [W("Bahraini_uprising_of_2011", "2011 Bahraini uprising"), W("Bahrain", "Bahrain"), X("Bahrain in 2011: Symbol of revolt wiped off the map — The National", "https://www.thenationalnews.com/world/mena/bahrain-in-2011-symbol-of-revolt-wiped-off-the-map-1.391941", "news")] },
    { id: "n94-gu-muscat-opera-2011", branch: "gulf-states", y: D(2011, 10, 12), when: "October 12, 2011", title: "Royal Opera House Muscat opens with Turandot", imp: 3,
      text: "The house opened with Puccini's Turandot, conducted by Plácido Domingo, and became one of Oman's main venues for opera, orchestra and ballet.",
      cites: [W("Royal_Opera_House_Muscat", "Royal Opera House Muscat"), X("10 years on, ROHM is still inspiring curiosity and wonder — Times of Oman", "https://timesofoman.com/article/92398-10-years-on-rohm-is-still-inspiring-curiosity-and-wonder", "news")] },
    { id: "n94-gu-tamim-2013", branch: "gulf-states", y: D(2013, 6, 25), when: "June 25, 2013", title: "Emir Hamad abdicates in favor of Tamim", imp: 2,
      text: "Hamad handed power to his 33-year-old son Tamim, saying a new generation of Qatari leaders was needed.",
      cites: [B("biography/Sheikh-Hamad-ibn-Khalifah-Al-Thani", "Sheikh Hamad ibn Khalifah Al Thani"), W("Sheikh_Hamad_bin_Khalifa_Al_Thani", "Hamad bin Khalifa Al Thani")] },
    { id: "n94-gu-qatar-crisis-2017", branch: "gulf-states", y: D(2017, 6, 5), end: D(2021, 1, 5), when: "June 5, 2017 – January 5, 2021", title: "Saudi-led states cut ties and blockade Qatar", link: "saudi-arabia", imp: 1,
      text: "Saudi Arabia closed Qatar's only land crossing, a de facto blockade. The crisis ended with an agreement signed at the GCC summit in al-Ula on January 5, 2021.",
      cites: [W("Qatar_diplomatic_crisis", "Qatar diplomatic crisis"), X("End of Qatar blockade is “a win for the region,” Saudi foreign minister says — CNBC", "https://www.cnbc.com/2021/01/06/end-of-qatar-blockade-is-a-win-for-the-region-saudi-foreign-minister.html", "news"), B("topic/Al-Jazeera", "Al Jazeera")] },
    { id: "n94-gu-louvre-abu-dhabi-2017", branch: "gulf-states", y: D(2017, 11, 8), when: "November 8, 2017", title: "Louvre Abu Dhabi inaugurated", link: "france", imp: 2,
      text: "Designed by Jean Nouvel on Saadiyat Island under a France–UAE agreement, the museum shows works leased from French institutions and is part of Abu Dhabi's drive to diversify beyond oil.",
      cites: [B("topic/Louvre-Abu-Dhabi", "Louvre Abu Dhabi"), W("Louvre_Abu_Dhabi", "Louvre Abu Dhabi")] },
    { id: "n94-gu-qaboos-dies-2020", branch: "gulf-states", y: D(2020, 1, 10), when: "January 10, 2020", title: "Sultan Qaboos dies; Haitham bin Tariq succeeds", imp: 2,
      text: "Qaboos, sultan since 1970, died after treatment for colon cancer; the royal court named his cousin Haitham bin Tariq as his successor.",
      cites: [B("biography/Qaboos-bin-Said", "Qaboos bin Said"), W("Qaboos_bin_Said", "Qaboos bin Said")] },
    { id: "n94-gu-hope-probe-2020", branch: "gulf-states", y: D(2020, 7, 20), end: D(2021, 2, 9), when: "July 20, 2020 – February 9, 2021", title: "UAE's Hope probe reaches Mars orbit", imp: 2,
      text: "Launched from Japan's Tanegashima Space Center on a Japanese H-IIA rocket, the Emirates Mars Mission's Hope probe went into orbit around Mars on February 9, 2021.",
      cites: [W("Emirates_Mars_Mission", "Emirates Mars Mission"), X("25 Years of Continuous Robotic Mars Exploration — NASA", "https://www.nasa.gov/history/25-years-of-continuous-robotic-mars-exploration-from-pathfinder-to-perseverance/", "reference")] },
    { id: "n94-gu-expo-2020", branch: "gulf-states", y: D(2021, 10, 1), end: D(2022, 3, 31), when: "October 1, 2021 – March 31, 2022", title: "Dubai hosts the delayed Expo 2020", imp: 2,
      text: "The world’s fair, postponed a year because of the pandemic, ran from October 1, 2021 to March 31, 2022, with an opening ceremony on September 30.",
      cites: [W("Expo_2020", "Expo 2020"), X("Expo 2020 Dubai Postponed due to the Global Pandemic — African Union", "https://au.int/en/pressreleases/20200601/expo-2020-dubai-postponed-due-global-pandemic", "reference")] },
  ],
});

// ---------- Origins ----------
TL.origin("lebanon", {
  note: "Mount Lebanon and the coast were Ottoman lands until World War I. France, holding a League of Nations mandate over Syria and Lebanon, proclaimed an enlarged Greater Lebanon in 1920; its leaders won independence from France in 1943–46.",
  links: [
    { id: "ottoman", how: "successor", note: "Former Ottoman territory that passed to French control after World War I" },
    { id: "france", how: "independence", note: "Independence accepted in 1943; last French troops left in December 1946" },
  ],
  cites: [W("Greater_Lebanon", "Greater Lebanon"), OH("lebanon", "Lebanon"), W("Lebanon", "Lebanon")],
});
TL.origin("jordan", {
  note: "Transjordan was Ottoman land before World War I and part of the Arab Kingdom of Syria after it. After France ended that kingdom, Britain agreed that Abdullah, a son of the Arab Revolt's leader, would administer it as a British protectorate.",
  links: [
    { id: "ottoman", how: "successor", note: "Transjordan was Ottoman territory until the war; the Arab Revolt began in 1916" },
    { id: "uk", how: "independence", note: "British protectorate until independence was declared on May 25, 1946" },
  ],
  cites: [W("Emirate_of_Transjordan", "Emirate of Transjordan"), OH("jordan", "Jordan"), B("biography/Abdullah-I", "Abdullah I")],
});
TL.origin("gulf-states", {
  note: "Kuwait, Bahrain, Qatar, the Trucial States and Oman were small Gulf sheikhdoms and a sultanate under British treaties. Kuwait (1961), Bahrain, Qatar and the UAE (1971) ended British protection; Oman, ruled by Sultan Qaboos from 1970, modernized and ended its isolation.",
  links: [
    { id: "uk", how: "independence", note: "British protection ended in Kuwait in 1961 and in Bahrain, Qatar and the UAE in 1971" },
    { id: "ottoman", how: "successor", note: "Qatar passed from Ottoman rule to a British protectorate in 1916" },
  ],
  cites: [OH("kuwait", "Kuwait"), OH("united-arab-emirates", "United Arab Emirates"), OH("qatar", "Qatar"), W("Qatar", "Qatar")],
});

// ---------- Locations ----------
geo("lebanon", 33.85, 35.86, 120, "Lebanon", "Lebanon", "region");
geo("jordan", 31.25, 36.5, 250, "Jordan", "Jordan", "region");
geo("gulf-states", 26.0, 51.5, 700, "Gulf states", "Persian_Gulf", "region");
geo("n94-lb-greater-lebanon", 33.89, 35.50, 40, "Beirut, Lebanon", "Beirut");
geo("n94-lb-constitution-1926", 33.89, 35.50, 40, "Beirut, Lebanon", "Beirut");
geo("n94-lb-an-nahar", 33.89, 35.50, 40, "Beirut, Lebanon", "Beirut");
geo("n94-lb-national-pact", 33.89, 35.50, 40, "Beirut, Lebanon", "Beirut");
geo("n94-lb-independence-1943", 33.89, 35.50, 40, "Beirut, Lebanon", "Beirut");
geo("n94-lb-french-leave-1946", 33.83, 35.83, 120, "Lebanon", "Lebanon", "region");
geo("n94-lb-baalbek-fairuz-1957", 34.0, 36.21, 30, "Baalbek, Lebanon", "Baalbek");
geo("n94-lb-crisis-1958", 33.89, 35.50, 40, "Beirut, Lebanon", "Beirut");
geo("n94-lb-cairo-agreement-1969", 30.04, 31.24, 40, "Cairo, Egypt", "Cairo");
geo("n94-lb-civil-war-begins", 33.89, 35.50, 40, "Beirut, Lebanon", "Beirut");
geo("n94-lb-barracks-1983", 33.82, 35.49, 20, "Beirut airport area, Lebanon", "Beirut");
geo("n94-lb-taif-1989", 21.27, 40.41, 40, "Taif, Saudi Arabia", "Taif");
geo("n94-lb-war-ends-1990", 33.84, 35.54, 30, "Baabda, Lebanon", "Baabda");
geo("n94-lb-solidere-1994", 33.89, 35.50, 20, "Beirut Central District, Lebanon", "Beirut_Central_District");
geo("n94-lb-israel-leaves-2000", 33.27, 35.2, 60, "Southern Lebanon", "South_Lebanon", "region");
geo("n94-lb-hariri-killed-2005", 33.90, 35.49, 20, "Corniche, Beirut", "Beirut");
geo("n94-lb-unesco-1984", 33.83, 35.83, 120, "Lebanon", "Lebanon", "region");
geo("n94-lb-gibran-prophet", 40.71, -74.0, 40, "New York City", "New_York_City");
geo("n94-lb-capernaum-2018", 43.55, 7.01, 30, "Cannes, France", "Cannes");
geo("n94-lb-protests-2019", 33.89, 35.50, 40, "Beirut, Lebanon", "Beirut");
geo("n94-lb-port-blast-2020", 33.90, 35.52, 20, "Port of Beirut", "Port_of_Beirut");
geo("n94-jo-emirate-1921", 31.95, 35.93, 40, "Amman, Jordan", "Amman");
geo("n94-jo-independence-1946", 31.95, 35.93, 40, "Amman, Jordan", "Amman");
geo("n94-jo-annexation-1950", 31.95, 35.25, 80, "West Bank", "West_Bank", "region");
geo("n94-jo-abdullah-killed-1951", 31.78, 35.23, 20, "Jerusalem", "Jerusalem");
geo("n94-jo-hussein-king-1952", 31.95, 35.93, 40, "Amman, Jordan", "Amman");
geo("n94-jo-glubb-dismissed-1956", 31.95, 35.93, 40, "Amman, Jordan", "Amman");
geo("n94-jo-six-day-war-1967", 31.95, 35.25, 100, "West Bank", "West_Bank", "region");
geo("n94-jo-black-september-1970", 31.95, 35.93, 60, "Amman, Jordan", "Amman");
geo("n94-jo-west-bank-1988", 31.95, 35.93, 40, "Amman, Jordan", "Amman");
geo("n94-jo-petra-unesco-1985", 30.33, 35.44, 20, "Petra, Jordan", "Petra");
geo("n94-jo-peace-treaty-1994", 30.62, 35.19, 30, "Arabah crossing, Jordan–Israel border", "Wadi_Araba");
geo("n94-jo-abdullah-ii-1999", 31.95, 35.93, 40, "Amman, Jordan", "Amman");
geo("n94-jo-amman-bombings-2005", 31.95, 35.91, 20, "Amman, Jordan", "Amman");
geo("n94-jo-new7wonders-2007", 30.33, 35.44, 20, "Petra, Jordan", "Petra");
geo("n94-jo-wadi-rum-2011", 29.58, 35.42, 40, "Wadi Rum, Jordan", "Wadi_Rum");
geo("n94-jo-zaatari-2012", 32.29, 36.33, 20, "Zaatari camp, Mafraq", "Zaatari_refugee_camp");
geo("n94-jo-theeb-2016", 31.25, 36.5, 250, "Jordan", "Jordan", "region");
geo("n94-gu-kuwait-1899", 29.38, 47.99, 40, "Kuwait City", "Kuwait_City");
geo("n94-gu-bahrain-oil-1932", 26.07, 50.55, 40, "Bahrain", "Bahrain", "region");
geo("n94-gu-kuwait-burgan-1938", 28.95, 47.95, 40, "Burgan field, Kuwait", "Burgan_Field");
geo("n94-gu-qatar-oil-1939", 25.43, 50.78, 40, "Dukhan, Qatar", "Dukhan");
geo("n94-gu-kuwait-independence-1961", 29.38, 47.99, 40, "Kuwait City", "Kuwait_City");
geo("n94-gu-kuwait-constitution-1962", 29.38, 47.99, 40, "Kuwait City", "Kuwait_City");
geo("n94-gu-zayed-1966", 24.47, 54.37, 40, "Abu Dhabi", "Abu_Dhabi");
geo("n94-gu-british-withdrawal-1968", 24.5, 54.4, 200, "Trucial States", "Trucial_States", "region");
geo("n94-gu-oman-qaboos-1970", 17.02, 54.09, 40, "Salalah, Oman", "Salalah");
geo("n94-gu-bahrain-independence-1971", 26.23, 50.58, 40, "Manama, Bahrain", "Manama");
geo("n94-gu-qatar-independence-1971", 25.29, 51.53, 40, "Doha, Qatar", "Doha");
geo("n94-gu-uae-formed-1971", 25.2, 55.27, 40, "Dubai, UAE", "Dubai");
geo("n94-gu-jebel-ali-1979", 25.01, 55.06, 30, "Jebel Ali, Dubai", "Jebel_Ali");
geo("n94-gu-emirates-airline-1985", 25.25, 55.36, 30, "Dubai, UAE", "Dubai");
geo("n94-gu-kuwait-oil-fires-1991", 29.0, 47.95, 100, "Kuwait", "Kuwait", "region");
geo("n94-gu-qatar-coup-1995", 25.29, 51.53, 40, "Doha, Qatar", "Doha");
geo("n94-gu-al-jazeera-1996", 25.29, 51.53, 40, "Doha, Qatar", "Doha");
geo("n94-gu-burj-al-arab-1999", 25.14, 55.19, 20, "Jumeirah, Dubai", "Burj_Al_Arab");
geo("n94-gu-zayed-dies-2004", 24.47, 54.37, 40, "Abu Dhabi", "Abu_Dhabi");
geo("n94-gu-kuwait-women-vote-2005", 29.38, 47.99, 40, "Kuwait City", "Kuwait_City");
geo("n94-gu-zayed-mosque-2007", 24.41, 54.47, 20, "Sheikh Zayed Grand Mosque, Abu Dhabi", "Sheikh_Zayed_Grand_Mosque");
geo("n94-gu-mia-doha-2008", 25.29, 51.54, 20, "Museum of Islamic Art, Doha", "Museum_of_Islamic_Art,_Doha");
geo("n94-gu-burj-khalifa-2010", 25.20, 55.27, 20, "Burj Khalifa, Dubai", "Burj_Khalifa");
geo("n94-gu-qatar-world-cup-bid-2010", 25.29, 51.53, 40, "Doha, Qatar", "Doha");
geo("n94-gu-bahrain-uprising-2011", 26.23, 50.58, 30, "Pearl Roundabout, Manama", "Manama");
geo("n94-gu-muscat-opera-2011", 23.59, 58.38, 30, "Muscat, Oman", "Muscat");
geo("n94-gu-tamim-2013", 25.29, 51.53, 40, "Doha, Qatar", "Doha");
geo("n94-gu-qatar-crisis-2017", 25.29, 51.53, 120, "Qatar", "Qatar", "region");
geo("n94-gu-louvre-abu-dhabi-2017", 24.53, 54.40, 20, "Saadiyat Island, Abu Dhabi", "Louvre_Abu_Dhabi");
geo("n94-gu-qaboos-dies-2020", 23.59, 58.38, 40, "Muscat, Oman", "Muscat");
geo("n94-gu-hope-probe-2020", 30.4, 130.97, 40, "Tanegashima Space Center, Japan", "Tanegashima_Space_Center");
geo("n94-gu-expo-2020", 24.96, 55.15, 30, "Expo City Dubai", "Expo_2020");

// ---------- Moves of existing events ----------
TL.move("ga8-syria-enters-lebanon", "lebanon");
TL.move("ga8-syria-leaves-lebanon", "lebanon");
TL.move("ga9-lebanon-war-1982", "lebanon");
TL.move("ga9-sabra-shatila", "lebanon");
TL.move("ga9-lebanon-war-2006", "lebanon");
