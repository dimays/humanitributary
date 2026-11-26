// W1-07 gap fill: Belgian Congo, DR Congo, Eritrea, Ghana, Ife, Nigeria, OAU, Rwanda, South Sudan, Sudan, 1925–present. Every cite was fetched and read while writing the entry; see SCHEMA.md.
const W = (p, t) => ({ t: t + " — Wikipedia", u: "https://en.wikipedia.org/wiki/" + p });
TL.add({ events: [
  { id: "w107-tintin-congo", branch: "belgian-congo", y: 1930.43, end: 1931.45, when: "June 1930–June 1931", title: "Tintin in the Congo appears",
    text: "Hergé's comic was serialized in Le Petit Vingtième, then collected as a book in 1931. The publisher itself now describes it as a naive, paternalistic view of colonial times.",
    imp: 3, cites: [{ t: "Tintin in the Congo — Tintin.com", u: "https://www.tintin.com/en/albums/tintin-in-the-congo" }, W("Tintin_in_the_Congo", "Tintin in the Congo")] },
  { id: "w107-ok-jazz", branch: "belgian-congo", y: 1956.45, when: "June 1956", title: "OK Jazz founded in Léopoldville",
    text: "Musicians who had played sessions at the Loningisa studio began performing as OK Jazz, later TPOK Jazz, the band Franco led to the forefront of Congolese rumba.",
    imp: 2, cites: [{ t: "Franco & TPOK Jazz — Rumba on the River", u: "https://rumbaontheriver.com/okjazz.html" }, { t: "Why Franco’s legend endures, 30 years on — The Citizen", u: "https://www.thecitizen.co.tz/tanzania/magazines/why-franco-s-legend-endures-30-years-on-2697032" }, W("TPOK_Jazz", "TPOK Jazz")] },
  { id: "w107-mobutu-power", branch: "drc", y: 1965.9, when: "November 1965", title: "Mobutu takes power in a second coup",
    text: "Weeks after President Kasavubu said he would dismiss the mercenaries serving under Tshombe, the army seized power on November 25 and Mobutu became president. He held power until 1997.",
    imp: 2, cites: [{ t: "Mobutu Sese Seko — Encyclopedia.com", u: "https://www.encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/mobutu-sese-seko" }, W("Mobutu_Sese_Seko", "Mobutu Sese Seko")] },
  { id: "w107-franco-dies", branch: "drc", y: 1989.78, when: "October 12, 1989", title: "Franco Luambo dies; Zaire mourns",
    text: "The bandleader of TPOK Jazz and a towering figure of Congolese rumba died in Belgium at age 51. Mobutu declared four days of national mourning.",
    imp: 3, cites: [{ t: "Franco & TPOK Jazz — Rumba on the River", u: "https://rumbaontheriver.com/okjazz.html" }, { t: "Why Franco’s legend endures, 30 years on — The Citizen", u: "https://www.thecitizen.co.tz/tanzania/magazines/why-franco-s-legend-endures-30-years-on-2697032" }, W("Franco_Luambo", "Franco Luambo")] },
  { id: "w107-kabila-killed", branch: "drc", y: 2001.04, when: "January 16, 2001", title: "President Laurent Kabila assassinated",
    text: "Kabila was shot dead by a bodyguard at his presidential palace in Kinshasa. His son Joseph was inaugurated as president on January 26.",
    imp: 2, cites: [{ t: "Laurent Kabila — South African History Online", u: "https://sahistory.org.za/people/laurent-kabila" }, W("Assassination_of_Laurent-D%C3%A9sir%C3%A9_Kabila", "Assassination of Laurent-Désiré Kabila")] },
  { id: "w107-rumba-unesco", branch: "drc", y: 2021.95, when: "December 2021", title: "Congolese rumba joins UNESCO heritage list",
    text: "UNESCO inscribed Congolese rumba, shared with the Republic of the Congo, on its Representative List of the Intangible Cultural Heritage of Humanity.",
    imp: 3, cites: [{ t: "Congolese rumba — UNESCO Intangible Cultural Heritage", u: "https://ich.unesco.org/en/RL/congolese-rumba-01711" }, W("Congolese_rumba", "Congolese rumba")] },
  { id: "w107-unmee-ends", branch: "eritrea", y: 2008.58, when: "July 31, 2008", title: "UN peacekeeping mission leaves Eritrea",
    text: "The Security Council terminated UNMEE, set up in 2000 to monitor the ceasefire, amid Eritrean restrictions on its fuel supplies.",
    imp: 3, link: "un", cites: [{ t: "Update Report No. 5: Ethiopia-Eritrea — Security Council Report", u: "https://www.securitycouncilreport.org/update-report/lookup_c_glkwlemtisg_b_4386219.php" }, W("United_Nations_Mission_in_Ethiopia_and_Eritrea", "United Nations Mission in Ethiopia and Eritrea")] },
  { id: "w107-bisha-mine", branch: "eritrea", y: 2011.12, when: "February 2011", title: "Bisha mine begins commercial production",
    text: "Nevsun Resources' Bisha gold and copper mine, run by a Canadian company, began commercial production as Eritrea's first. Human Rights Watch later reported forced-labor allegations over contractor work on its infrastructure.",
    imp: 3, cites: [{ t: "Hear No Evil: Forced Labor and Corporate Responsibility in Eritrea’s Mining Sector — Human Rights Watch", u: "https://www.hrw.org/report/2013/01/15/hear-no-evil/forced-labor-and-corporate-responsibility-eritreas-mining-sector" }, W("Nevsun_Resources", "Nevsun Resources")] },
  { id: "w107-asmara-unesco", branch: "eritrea", y: 2017.52, when: "July 8, 2017", title: "Asmara inscribed as a World Heritage Site",
    text: "UNESCO listed “Asmara: A Modernist African City” as an exceptional example of early modernist urbanism adapted to Africa. It is Eritrea's first World Heritage property.",
    imp: 2, cites: [{ t: "Eritrea takes holistic approach to the conservation and management of Asmara — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/news/1925" }, W("Asmara", "Asmara")] },
  { id: "w107-afcon-1963", branch: "ghana", y: 1963.91, when: "December 1, 1963", title: "Black Stars win the Africa Cup of Nations",
    text: "Hosting the tournament on their first appearance, Ghana beat Sudan 3–0 in the final at Accra. It was the first of Ghana's four continental titles.",
    imp: 3, cites: [{ t: "Four Black Stars in the sky — CAF", u: "https://www.cafonline.com/afcon2025/news/four-black-stars-in-the-sky/" }, W("1963_African_Cup_of_Nations", "1963 African Cup of Nations")] },
  { id: "w107-akosombo", branch: "ghana", y: 1966.06, when: "January 22, 1966", title: "Volta River hydroelectric project inaugurated",
    text: "Nkrumah inaugurated the Volta River hydroelectric project at Akosombo. The dam, built between 1961 and 1965, created Lake Volta.",
    imp: 2, cites: [{ t: "January 22, 1966: The Volta River Hydro-electric Project is inaugurated — Edward A. Ulzen Memorial Foundation", u: "https://www.eaumf.org/ejm-blog/2018/1/23/january-22-1966-the-volta-river-hydro-electric-project-is-inaugurated" }, W("Akosombo_Dam", "Akosombo Dam")] },
  { id: "w107-annan-sg", branch: "ghana", y: 1997.0, when: "January 1, 1997", title: "Kofi Annan becomes UN Secretary-General", link: "un",
    text: "The Ghanaian diplomat began his first term as the seventh Secretary-General, the first chosen from the ranks of UN staff.",
    imp: 2, cites: [{ t: "Kofi Annan — United Nations Secretary-General", u: "https://www.un.org/sg/en/content/sg/biography/kofi-annan" }, W("Kofi_Annan", "Kofi Annan")] },
  { id: "w107-wc-2006", branch: "ghana", y: 2006.46, when: "June 17, 2006", title: "Ghana's first World Cup win",
    text: "In their World Cup debut, the Black Stars beat the Czech Republic 2–0 in Cologne, the first African victory of the 2006 tournament. They went on to reach the last 16.",
    imp: 3, cites: [{ t: "Czech Republic vs Ghana — World Cup Pro", u: "https://www.worldcuppro.com/world-cup-2006/matches/czech-republic-vs-ghana-group-stage" }, W("2006_FIFA_World_Cup_Group_E", "2006 FIFA World Cup Group E")] },
  { id: "w107-year-of-return", branch: "ghana", y: 2019.0, end: 2019.99, when: "2019", title: "“Year of Return” invites the diaspora",
    text: "Ghana marked 400 years since the first enslaved Africans reached Jamestown, Virginia, by inviting people of African descent to visit, and offering paths to settle and citizenship.",
    imp: 3, cites: [{ t: "Ghana’s Year of Return 2019: traveler, tourist or pilgrim? — The Conversation", u: "https://theconversation.com/ghanas-year-of-return-2019-traveler-tourist-or-pilgrim-121891" }, W("Year_of_Return,_Ghana_2019", "Year of Return, Ghana 2019")] },
  { id: "w107-ife-heads", branch: "ife", y: 1938.5, when: "1938", title: "Wunmonije bronze heads found at Ife",
    text: "Thirteen roughly life-size bronze heads were found in the Wunmonije compound near the Ooni's palace. Ife art is dated to roughly the 11th–15th centuries.",
    imp: 2, cites: [{ t: "12 Facts You Need to Know about Ife Art — Google Arts & Culture", u: "https://artsandculture.google.com/story/12-facts-you-need-to-know-about-ife-art-yemisi-shyllon-museum-of-art/TQWB2S-ClCrcNw" }, W("Bronze_Head_from_Ife", "Bronze Head from Ife")] },
  { id: "w107-univ-ife", branch: "ife", y: 1962.73, when: "1962", title: "University of Ife opens",
    text: "Founded by Western Nigeria's government, the University of Ife began teaching in 1962 in temporary quarters at Ibadan. It later moved to a campus designed by Arieh Sharon at Ile-Ife.",
    imp: 3, cites: [{ t: "The Foundation — Obafemi Awolowo University", u: "https://oauife.edu.ng/the-foundation/" }, W("Obafemi_Awolowo_University", "Obafemi Awolowo University")] },
  { id: "w107-sijuwade", branch: "ife", y: 1980.93, when: "December 6, 1980", title: "Sijuwade crowned Ooni of Ife",
    text: "Okunade Sijuwade took the title Olubuse II as the Ooni, spiritual head of the Yoruba. He reigned until his death in 2015.",
    imp: 3, cites: [{ t: "Okunade Sijuwade Olubuse II (1930–2015) — Daily Trust", u: "https://dailytrust.com/okunade-sijuwade-olubuse-ii-1930-2015/" }, W("Ife", "Ife")] },
  { id: "w107-oau-renamed", branch: "ife", y: 1987.36, when: "May 12, 1987", title: "University of Ife renamed for Awolowo",
    text: "The federal government renamed the University of Ife Obafemi Awolowo University, honoring Chief Obafemi Awolowo, one of its founding fathers.",
    imp: 3, cites: [{ t: "The Foundation — Obafemi Awolowo University", u: "https://oauife.edu.ng/the-foundation/" }, W("Obafemi_Awolowo_University", "Obafemi Awolowo University")] },
  { id: "w107-ife-modakeke", branch: "ife", y: 1997.6, end: 1998.5, when: "1997–98", title: "Ife–Modakeke violence over a local council",
    text: "Fighting between Ife and Modakeke communities flared after the military government created Ife East Local Government and moved its headquarters from Modakeke to Oke-Ogbo.",
    imp: 3, cites: [{ t: "Communal conflict, communal peacemaking and governmental intervention in Nigeria — ACCORD", u: "https://www.accord.org.za/ajcr-issues/communal-conflict-communal-peacemaking-and-governmental-intervention-in-nigeria/" }, W("Ife-Modakeke_conflict", "Ife–Modakeke conflict")] },
  { id: "w107-kingdom-of-ife-show", branch: "ife", y: 2010.17, end: 2010.5, when: "2010", title: "“Kingdom of Ife” exhibition at the British Museum",
    text: "A show of 109 Ife sculptures on loan from Nigeria's national museums commission ran at the British Museum, organized with the Museum for African Art in New York.",
    imp: 3, link: "uk", cites: [{ t: "Kingdom of Ife: Sculptures from West Africa — Museums Association", u: "https://www.museumsassociation.org/museums-journal/reviews/2010/05/01052010-kingdom-of-ife-review/" }] },
  { id: "w107-ogunwusi", branch: "ife", y: 2015.82, when: "October 2015", title: "Ogunwusi chosen as Ooni of Ife",
    text: "Adeyeye Enitan Ogunwusi, of the Giesi ruling house, was named as the 51st Ooni of Ife, succeeding Sijuwade, who had died in July.",
    imp: 3, cites: [{ t: "Jubilation in Ife as 41-yr old Ogunwusi named Ooni-elect — Vanguard", u: "https://www.vanguardngr.com/2015/10/jubilation-in-ife-as-41-yr-old-ogunwusi-named-ooni-elect/" }, W("Adeyeye_Enitan_Ogunwusi", "Adeyeye Enitan Ogunwusi")] },
  { id: "w107-nigeria-opec", branch: "nigeria", y: 1971.5, when: "July 1971", title: "Nigeria joins OPEC",
    text: "Nigeria joined the Organization of the Petroleum Exporting Countries, an oil exporter's step that tied its economy more closely to petroleum.",
    imp: 2, cites: [{ t: "OPEC Secretary General's speech, July 2021 — OPEC", u: "https://www.opec.org/speech-detail/17-6-july-2021.html" }, W("OPEC", "OPEC")] },
  { id: "w107-festac-77", branch: "nigeria", y: 1977.04, end: 1977.12, when: "January 15–February 12, 1977", title: "FESTAC '77 festival in Lagos",
    text: "Lagos hosted the Second World Black and African Festival of Arts and Culture, a month-long festival that brought together artists from across Africa and its diaspora.",
    imp: 2, cites: [{ t: "Festac (Second Festival of Black Arts and Culture) — Tate", u: "https://www.tate.org.uk/art/art-terms/f/festac-second-festival-black-arts-and-culture" }, W("FESTAC_77", "FESTAC 77")] },
  { id: "w107-living-in-bondage", branch: "nigeria", y: 1992.5, when: "1992", title: "Living in Bondage spurs Nollywood",
    text: "Kenneth Nnebue's film, shot on VHS camcorders and released direct to video, is widely seen as a turning point for Nigeria's home-video film industry.",
    imp: 2, cites: [{ t: "Living in Bondage: How 1992 classic changed Nollywood — Pulse Nigeria", u: "https://www.pulse.ng/story/living-in-bondage-how-1992-classic-changed-nollywoods-story-2024081817221200294" }, W("Living_in_Bondage", "Living in Bondage")] },
  { id: "w107-abuja-treaty", branch: "oau", y: 1991.42, when: "June 3, 1991", title: "Abuja Treaty founds the African Economic Community",
    text: "At the OAU summit in Abuja, leaders signed a treaty to build a continental economic community in stages over decades. It took effect in 1994.",
    imp: 2, cites: [{ t: "AfCFTA Negotiations timeline — tralac", u: "https://www.tralac.org/resources/16275-afcfta-negotiations-timeline.html" }, W("African_Economic_Community", "African Economic Community")] },
  { id: "w107-mrnd-founded", branch: "rwanda", y: 1975.5, when: "1975", title: "Habyarimana founds the MRND single party",
    text: "Two years after seizing power, President Habyarimana created the National Revolutionary Movement for Development, which fused with the state and ruled as the only party.",
    imp: 3, cites: [{ t: "Rwanda – A Chronology (1867–1994) — Sciences Po", u: "https://www.sciencespo.fr/mass-violence-war-massacre-resistance/en/document/rwanda-chronology-1867-1994.html" }, W("National_Revolutionary_Movement_for_Development", "National Revolutionary Movement for Development")] },
  { id: "w107-kibeho", branch: "rwanda", y: 1995.31, when: "April 22, 1995", title: "Kibeho camp massacre",
    text: "Rwandan Patriotic Army troops opened fire as they closed a camp for displaced people at Kibeho. The death toll is disputed, from under 400 officially to about 2,000 in UN figures and more in other estimates.",
    imp: 2, cites: [{ t: "World Report 1996: Rwanda — Human Rights Watch", u: "https://www.hrw.org/reports/1996/WR96/Africa-08.htm" }, W("Kibeho_massacre", "Kibeho massacre")] },
  { id: "w107-gacaca", branch: "rwanda", y: 2002.5, end: 2012.5, when: "2002–2012", title: "Gacaca community courts try genocide suspects",
    text: "Rwanda built on the community tradition of gacaca, with strong state involvement, to handle the huge number of genocide suspects. The courts ran from a 2002 pilot until they closed in 2012.",
    imp: 2, cites: [{ t: "Rwanda: how to deal with a million genocide suspects — The Conversation", u: "https://theconversation.com/rwanda-how-to-deal-with-a-million-genocide-suspects-38642" }, W("Gacaca_court", "Gacaca court")] },
  { id: "w107-kigali-memorial", branch: "rwanda", y: 2004.27, when: "2004", title: "Kigali Genocide Memorial opens",
    text: "Built with the Aegis Trust, the memorial opened in 2004 as a burial site and museum. Its peace and values program joined Rwanda's national school curriculum in 2014.",
    imp: 3, cites: [{ t: "Our Story — Kigali Genocide Memorial", u: "https://kgm.rw/about/our-story/" }, W("Kigali_Genocide_Memorial", "Kigali Genocide Memorial")] },
  { id: "w107-rarcss", branch: "south-sudan", y: 2018.7, when: "September 12, 2018", title: "Revitalised peace agreement signed",
    text: "Salva Kiir and Riek Machar signed the R-ARCSS in Addis Ababa, restoring Machar as vice president and aiming to end the civil war.",
    imp: 2, link: "ethiopia", cites: [{ t: "Revitalised Agreement on the Resolution of the Conflict in South Sudan — PA-X Peace Agreements Database", u: "https://www.peaceagreements.org/agreements/2112/" }, { t: "South Sudan president signs peace deal with rebel leader — Al Jazeera", u: "https://www.aljazeera.com/news/2018/9/12/south-sudan-president-signs-peace-deal-with-rebel-leader" }] },
  { id: "w107-olympics-2016", branch: "south-sudan", y: 2016.6, when: "August 2016", title: "South Sudan debuts at the Olympics",
    text: "The world's newest country sent three track athletes to Rio de Janeiro for its first Games. Marathoner Guor Marial had run in 2012 as an independent athlete.",
    imp: 3, link: "brazil", cites: [{ t: "South Sudan — Olympedia", u: "https://www.olympedia.org/countries/SSD" }, { t: "South Sudan at the Olympic Games — Top End Sports", u: "https://www.topendsports.com/events/summer/countries/sudan-south.htm" }] },
  { id: "w107-season-of-migration", branch: "sudan", y: 1966.5, when: "1966", title: "Season of Migration to the North published",
    text: "Tayeb Salih's Arabic novel is set in Sudan with flashbacks to England. The Arab Literary Academy has called it the most important Arab novel of the 20th century.",
    imp: 2, cites: [{ t: "Season of Migration to the North — Encyclopedia.com", u: "https://www.encyclopedia.com/arts/culture-magazines/season-migration-north" }, { t: "Tayeb Salih’s “Season of Migration to the North”: A literary hall of mirrors — Qantara.de", u: "https://qantara.de/en/article/tayeb-salih%E2%80%B2s-%E2%80%B3season-migration-north%E2%80%B3-literary-hall-mirrors" }] },
  { id: "w107-nimeiri-ousted", branch: "sudan", y: 1985.26, when: "April 6, 1985", title: "Nimeiri toppled after mass protests",
    text: "With President Nimeiri abroad, Defense Minister Siwar al-Dahab sided with the opposition after mass protests. A Transitional Military Council took over.",
    imp: 2, cites: [{ t: "Sudanese students, workers bring down Numeiri dictatorship, 1985 — Global Nonviolent Action Database", u: "https://nvdatabase.swarthmore.edu/content/sudanese-students-workers-bring-down-numeiri-dictatorship-1985" }, W("1985_Sudanese_coup_d%27%C3%A9tat", "1985 Sudanese coup d'état")] },
  { id: "w107-bashir-coup", branch: "sudan", y: 1989.49, when: "June 30, 1989", title: "Bashir seizes power",
    text: "Colonel Omar al-Bashir led a coup against Prime Minister Sadiq al-Mahdi and chaired a Revolutionary Command Council. He became president when the council dissolved in 1993.",
    imp: 2, cites: [{ t: "Bashir, Omar al- — Encyclopedia.com", u: "https://www.encyclopedia.com/international/encyclopedias-almanacs-transcripts-and-maps/bashir-omar-al-1944" }] },
  { id: "w107-sudan-sponsor-list", branch: "sudan", y: 1993.62, when: "August 1993", title: "US lists Sudan as a state sponsor of terrorism",
    text: "The State Department placed Sudan on its list, alleging it harbored terrorist groups and individuals, including Osama bin Laden. The designation was rescinded in 2020.",
    imp: 2, link: "usa", cites: [{ t: "State Sponsors: Sudan — Council on Foreign Relations", u: "https://www.cfr.org/backgrounders/state-sponsors-sudan" }, W("State_Sponsor_of_Terrorism", "US-designated state sponsors of terrorism")] },
] });
TL.geo("w107-tintin-congo", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("w107-ok-jazz", { scope: "place", lat: -4.32, lon: 15.31, r: 40, label: "Kinshasa (Léopoldville)", src: "https://en.wikipedia.org/wiki/Kinshasa" });
TL.geo("w107-mobutu-power", { scope: "place", lat: -4.32, lon: 15.31, r: 40, label: "Kinshasa, DR Congo", src: "https://en.wikipedia.org/wiki/Kinshasa" });
TL.geo("w107-franco-dies", { scope: "place", lat: -4.32, lon: 15.31, r: 40, label: "Kinshasa, Zaire", src: "https://en.wikipedia.org/wiki/Kinshasa" });
TL.geo("w107-kabila-killed", { scope: "place", lat: -4.32, lon: 15.31, r: 40, label: "Kinshasa, DR Congo", src: "https://en.wikipedia.org/wiki/Kinshasa" });
TL.geo("w107-rumba-unesco", { scope: "place", lat: -4.32, lon: 15.31, r: 40, label: "Kinshasa, DR Congo", src: "https://en.wikipedia.org/wiki/Kinshasa" });
TL.geo("w107-unmee-ends", { scope: "region", lat: 15, lon: 39, r: 300, label: "Eritrea", src: "https://en.wikipedia.org/wiki/Eritrea" });
TL.geo("w107-bisha-mine", { scope: "region", lat: 15, lon: 39, r: 300, label: "Eritrea", src: "https://en.wikipedia.org/wiki/Eritrea" });
TL.geo("w107-asmara-unesco", { scope: "place", lat: 15.34, lon: 38.94, r: 30, label: "Asmara, Eritrea", src: "https://en.wikipedia.org/wiki/Asmara" });
TL.geo("w107-afcon-1963", { scope: "place", lat: 5.55, lon: -0.2, r: 40, label: "Accra, Ghana", src: "https://en.wikipedia.org/wiki/Accra" });
TL.geo("w107-akosombo", { scope: "place", lat: 6.3, lon: 0.06, r: 60, label: "Akosombo Dam, Ghana", src: "https://en.wikipedia.org/wiki/Akosombo_Dam" });
TL.geo("w107-annan-sg", { scope: "place", lat: 40.75, lon: -73.97, r: 30, label: "United Nations Headquarters, New York", src: "https://en.wikipedia.org/wiki/United_Nations_Headquarters" });
TL.geo("w107-wc-2006", { scope: "place", lat: 50.94, lon: 6.96, r: 40, label: "Cologne, Germany", src: "https://en.wikipedia.org/wiki/Cologne" });
TL.geo("w107-year-of-return", { scope: "place", lat: 5.55, lon: -0.2, r: 40, label: "Accra, Ghana", src: "https://en.wikipedia.org/wiki/Accra" });
TL.geo("w107-ife-heads", { scope: "place", lat: 7.48, lon: 4.56, r: 30, label: "Ile-Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("w107-univ-ife", { scope: "place", lat: 7.52, lon: 4.52, r: 30, label: "Obafemi Awolowo University, Ile-Ife", src: "https://en.wikipedia.org/wiki/Obafemi_Awolowo_University" });
TL.geo("w107-sijuwade", { scope: "place", lat: 7.48, lon: 4.56, r: 30, label: "Ile-Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("w107-oau-renamed", { scope: "place", lat: 7.52, lon: 4.52, r: 30, label: "Obafemi Awolowo University, Ile-Ife", src: "https://en.wikipedia.org/wiki/Obafemi_Awolowo_University" });
TL.geo("w107-ife-modakeke", { scope: "place", lat: 7.48, lon: 4.56, r: 30, label: "Ile-Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("w107-kingdom-of-ife-show", { scope: "place", lat: 51.52, lon: -0.13, r: 30, label: "British Museum, London", src: "https://en.wikipedia.org/wiki/British_Museum" });
TL.geo("w107-ogunwusi", { scope: "place", lat: 7.48, lon: 4.56, r: 30, label: "Ile-Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ife" });
TL.geo("w107-nigeria-opec", { scope: "region", lat: 8, lon: 10, r: 600, label: "Nigeria", src: "https://en.wikipedia.org/wiki/Nigeria" });
TL.geo("w107-festac-77", { scope: "place", lat: 6.46, lon: 3.39, r: 40, label: "Lagos, Nigeria", src: "https://en.wikipedia.org/wiki/Lagos" });
TL.geo("w107-living-in-bondage", { scope: "region", lat: 8, lon: 10, r: 600, label: "Nigeria", src: "https://en.wikipedia.org/wiki/Nigeria" });
TL.geo("w107-abuja-treaty", { scope: "place", lat: 9.07, lon: 7.48, r: 40, label: "Abuja, Nigeria", src: "https://en.wikipedia.org/wiki/Abuja" });
TL.geo("w107-mrnd-founded", { scope: "place", lat: -1.95, lon: 30.11, r: 30, label: "Kigali, Rwanda", src: "https://en.wikipedia.org/wiki/Kigali" });
TL.geo("w107-kibeho", { scope: "place", lat: -2.63, lon: 29.55, r: 30, label: "Kibeho, Rwanda", src: "https://en.wikipedia.org/wiki/Kibeho" });
TL.geo("w107-gacaca", { scope: "region", lat: -2, lon: 30, r: 120, label: "Rwanda", src: "https://en.wikipedia.org/wiki/Rwanda" });
TL.geo("w107-kigali-memorial", { scope: "place", lat: -1.93, lon: 30.06, r: 30, label: "Kigali Genocide Memorial", src: "https://en.wikipedia.org/wiki/Kigali_Genocide_Memorial" });
TL.geo("w107-rarcss", { scope: "place", lat: 9.04, lon: 38.75, r: 40, label: "Addis Ababa, Ethiopia", src: "https://en.wikipedia.org/wiki/Addis_Ababa" });
TL.geo("w107-olympics-2016", { scope: "place", lat: -22.91, lon: -43.21, r: 40, label: "Rio de Janeiro, Brazil", src: "https://en.wikipedia.org/wiki/Rio_de_Janeiro" });
TL.geo("w107-season-of-migration", { scope: "region", lat: 15, lon: 32, r: 600, label: "Sudan", src: "https://en.wikipedia.org/wiki/Sudan" });
TL.geo("w107-nimeiri-ousted", { scope: "place", lat: 15.6, lon: 32.5, r: 40, label: "Khartoum, Sudan", src: "https://en.wikipedia.org/wiki/Khartoum" });
TL.geo("w107-bashir-coup", { scope: "place", lat: 15.6, lon: 32.5, r: 40, label: "Khartoum, Sudan", src: "https://en.wikipedia.org/wiki/Khartoum" });
TL.geo("w107-sudan-sponsor-list", { scope: "place", lat: 38.9, lon: -77.02, r: 30, label: "Washington, D.C.", src: "https://en.wikipedia.org/wiki/Washington,_D.C." });
