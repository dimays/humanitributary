// W1-09 fill: Chile, Colombia, Ecuador, Indigenous peoples of the Americas, Haiti, 1925-present. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
TL.add({ events: [
  // Chile
  { id: "w109-chile-socialist-republic", branch: "chile", y: 1932.43, end: 1932.70, when: "June 4 – September 13, 1932", imp: 3,
    title: "Chile's short-lived Socialist Republic",
    text: "A coup by Eugenio Matte, Marmaduke Grove and air force officers proclaimed a Socialist Republic. Carlos Dávila expelled the socialists on June 16 and ruled alone until he resigned on September 13.",
    cites: [W("Socialist_Republic_of_Chile", "Socialist Republic of Chile"), { t: "La República Socialista en Chile (1932) — Memoria Chilena", u: "https://www.memoriachilena.gob.cl/602/w3-article-3538.html" }] },
  { id: "w109-chile-carpa-de-la-reina", branch: "chile", y: 1965.96, when: "December 17, 1965", imp: 3,
    title: "Violeta Parra opens La Carpa de la Reina",
    text: "The folk singer and artist, a founder of Nueva Canción, opened a circus-style tent in the Santiago suburb of La Reina as a center for folk culture. It struggled commercially, and she died there in 1967.",
    cites: [W("Violeta_Parra", "Violeta Parra"), { t: "Espacios (Violeta Parra) — Memoria Chilena", u: "https://www.memoriachilena.gob.cl/602/w3-article-98200.html" }] },
  { id: "w109-chile-allende-elected", branch: "chile", y: 1970.67, when: "September 4, 1970", imp: 2,
    title: "Salvador Allende wins Chile's presidential election",
    text: "Allende took 36.61% of the vote to Jorge Alessandri's 35.27%. With no majority, Congress confirmed him as president on October 24, 1970.",
    cites: [W("1970_Chilean_presidential_election", "1970 Chilean presidential election"), { t: "Allende — Office of the Historian", u: "https://history.state.gov/milestones/1969-1976/allende" }] },
  { id: "w109-chile-neruda-nobel", branch: "chile", y: 1971.80, when: "October 21, 1971", imp: 2,
    title: "Pablo Neruda wins the Nobel Prize in Literature",
    text: "The Swedish Academy honored Neruda “for a poetry that with the action of an elemental force brings alive a continent's destiny and dreams.” He was Chile's second laureate in literature.",
    cites: [{ t: "Pablo Neruda — Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/literature/1971/neruda/facts/" }, W("1971_Nobel_Prize_in_Literature", "1971 Nobel Prize in Literature")] },
  { id: "w109-chile-letelier", branch: "chile", y: 1976.72, when: "September 21, 1976", imp: 2,
    title: "Orlando Letelier killed by a car bomb in Washington",
    text: "Agents of Pinochet's secret police, DINA, killed the exiled former minister and his aide Ronni Karpen Moffitt. The attack is linked to Operation Condor.",
    cites: [W("Orlando_Letelier", "Orlando Letelier"), { t: "Orlando Letelier — Britannica", u: "https://www.britannica.com/biography/Orlando-Letelier" }] },
  { id: "w109-chile-1980-constitution", branch: "chile", y: 1980.70, when: "September 11, 1980", imp: 2,
    title: "Pinochet's constitution approved in a plebiscite",
    text: "Voters approved a new constitution by roughly two-thirds amid military rule. Pinochet formally took office under it on March 11, 1981, for an eight-year term.",
    cites: [W("1980_Chilean_constitutional_referendum", "1980 Chilean constitutional referendum"), { t: "Augusto Pinochet Ugarte — Memoria Chilena", u: "https://www.memoriachilena.gob.cl/602/w3-article-31395.html" }] },
  { id: "w109-chile-valech-report", branch: "chile", y: 2004.91, when: "November 2004", imp: 3,
    title: "Valech Report documents torture under Pinochet",
    text: "A commission led by Bishop Sergio Valech, drawing on 35,865 testimonies, recognized 27,255 direct victims of political imprisonment and torture. Later revisions raised the total to 28,459.",
    cites: [W("Valech_Report", "Valech Report")] },
  // Colombia
  { id: "w109-colombia-1936-reform", branch: "colombia", y: 1936.58, when: "August 1, 1936", imp: 3,
    title: "López Pumarejo's constitutional reform of 1936",
    text: "Under the “Revolución en Marcha,” the reform extended the vote to illiterate men, opened most public posts to women and began loosening the Church's hold on education.",
    cites: [W("Colombian_Constitution_of_1886", "Colombian Constitution of 1886"), W("Alfonso_L%C3%B3pez_Pumarejo", "Alfonso López Pumarejo"), { t: "López Pumarejo, Alfonso — Encyclopedia.com", u: "https://www.encyclopedia.com/humanities/encyclopedias-almanacs-transcripts-and-maps/lopez-pumarejo-alfonso-1886-1959" }] },
  { id: "w109-colombia-rojas-pinilla", branch: "colombia", y: 1953.45, end: 1957.36, when: "June 13, 1953 – May 10, 1957", imp: 2,
    title: "General Rojas Pinilla seizes power",
    text: "Rojas Pinilla overthrew President Laureano Gómez and ruled for almost four years. A general strike and the Pact of Benidorm opposition forced him to hand power to a military junta.",
    cites: [W("Gustavo_Rojas_Pinilla", "Gustavo Rojas Pinilla"), { t: "Gustavo Rojas Pinilla — Britannica", u: "https://www.britannica.com/biography/Gustavo-Rojas-Pinilla" }] },
  { id: "w109-colombia-medellin-conference", branch: "colombia", y: 1968.6, when: "1968", imp: 2, link: "catholicism",
    title: "Medellín bishops' conference embraces the poor",
    text: "Latin America's Catholic bishops met in Medellín and adopted a “preferential option for the poor” and approved base communities. The conference opened the way for liberation theology.",
    cites: [W("Medell%C3%ADn_Conference", "Medellín Conference"), { t: "Dilexi te, §90 — Vatican", u: "https://www.vatican.va/content/leo-xiv/en/apost_exhortations/documents/20251004-dilexi-te.html" }] },
  { id: "w109-colombia-garcia-marquez-nobel", branch: "colombia", y: 1982.80, when: "October 21, 1982", imp: 2,
    title: "Gabriel García Márquez wins the Nobel Prize in Literature",
    text: "The Colombian author of One Hundred Years of Solitude (1967) was honored for work in which “the fantastic and the realistic are combined.” He was the fourth Latin American laureate.",
    cites: [{ t: "Gabriel García Márquez — Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/literature/1982/marquez/facts/" }, W("1982_Nobel_Prize_in_Literature", "1982 Nobel Prize in Literature"), W("Gabriel_Garc%C3%ADa_M%C3%A1rquez", "Gabriel García Márquez")] },
  { id: "w109-colombia-armero", branch: "colombia", y: 1985.86, when: "November 13, 1985", imp: 2,
    title: "Nevado del Ruiz eruption buries Armero",
    text: "Lahars from the volcano swept down on the town of Armero in Tolima. About 23,000 people died overall, over 20,000 of them in Armero.",
    cites: [W("Armero_tragedy", "Armero tragedy"), { t: "Lessons Learned from the Armero, Colombia Tragedy — USGS", u: "https://www.usgs.gov/observatories/hvo/news/volcano-watch-lessons-learned-armero-colombia-tragedy" }] },
  { id: "w109-colombia-samper-cleared", branch: "colombia", y: 1996.45, when: "June 12, 1996", imp: 3,
    title: "Congress shields Samper in the Proceso 8000 scandal",
    text: "The Chamber voted 111–43 to close proceedings against President Ernesto Samper over Cali Cartel money in his 1994 campaign. The U.S. withheld certification of Colombia's drug cooperation.",
    cites: [W("Proceso_8000", "Proceso 8000"), { t: "Ernesto Samper Pizano — Britannica", u: "https://www.britannica.com/biography/Ernesto-Samper-Pizano" }] },
  { id: "w109-colombia-operation-jaque", branch: "colombia", y: 2008.50, when: "July 2, 2008", imp: 3,
    title: "Operation Jaque frees Íngrid Betancourt",
    text: "The army rescued 15 FARC hostages, including Betancourt and three U.S. contractors, in a bloodless operation in Guaviare.",
    cites: [W("Operation_Jaque", "Operation Jaque"), { t: "Colombia Rescues Betancourt, U.S. Hostages — NPR", u: "https://www.npr.org/2008/07/02/92150287/colombia-rescues-betancourt-u-s-hostages" }] },
  // Ecuador
  { id: "w109-ecuador-glorious-revolution", branch: "ecuador", y: 1944.41, when: "May 28, 1944", imp: 2,
    title: "“Glorious Revolution” overthrows Arroyo del Río",
    text: "A popular revolt forced out President Carlos Arroyo del Río. Velasco Ibarra returned from exile as leader and served as president until 1947.",
    cites: [W("Jos%C3%A9_Mar%C3%ADa_Velasco_Ibarra", "José María Velasco Ibarra"), { t: "José María Velasco Ibarra — Britannica", u: "https://www.britannica.com/biography/Jose-Maria-Velasco-Ibarra" }] },
  { id: "w109-ecuador-radio-quito-panic", branch: "ecuador", y: 1949.12, when: "February 1949", imp: 3,
    title: "Radio Quito's Martian broadcast sparks a deadly riot",
    text: "A Radio Quito adaptation of The War of the Worlds caused panic. When it was revealed as fiction, crowds attacked the station and the newspaper El Comercio; at least seven died.",
    cites: [W("The_War_of_the_Worlds_(1938_radio_drama)", "The War of the Worlds (1938 radio drama)")] },
  { id: "w109-ecuador-carnavalazo-oil", branch: "ecuador", y: 1972.12, end: 1976.03, when: "February 1972 – January 1976", imp: 2,
    title: "Military “Carnavalazo” brings in the oil era",
    text: "General Guillermo Rodríguez Lara ousted Velasco Ibarra in February 1972 and ruled until 1976. Oil revenue funded roads, a refinery and public works.",
    cites: [W("Guillermo_Rodr%C3%ADguez_Lara", "Guillermo Rodríguez Lara"), W("History_of_Ecuador", "History of Ecuador"), { t: "Guillermo Rodríguez Lara — Britannica", u: "https://www.britannica.com/biography/Guillermo-Rodriguez-Lara" }] },
  { id: "w109-ecuador-quito-unesco", branch: "ecuador", y: 1978.5, when: "1978", imp: 3,
    title: "Quito's old town among the first World Heritage Sites",
    text: "Quito and Kraków were among the first sites inscribed by UNESCO. Quito's historic center, one of the best preserved in the Americas, holds about 130 monumental buildings.",
    cites: [W("Quito", "Quito"), { t: "Quito — Britannica", u: "https://www.britannica.com/place/Quito" }] },
  { id: "w109-ecuador-1987-earthquakes", branch: "ecuador", y: 1987.18, when: "March 5–6, 1987", imp: 3,
    title: "Earthquakes interrupt Ecuador's oil exports",
    text: "A sequence of quakes peaking near magnitude 7 set off landslides that killed about 1,000 people, wrecked about 40 km of the oil pipeline and caused roughly US$1 billion in damage.",
    cites: [W("1987_Ecuador_earthquakes", "1987 Ecuador earthquakes"), W("History_of_Ecuador", "History of Ecuador"), { t: "Mass wasting triggered by the 5 March 1987 Ecuador earthquakes — USGS", u: "https://pubs.usgs.gov/publication/70018462" }] },
  { id: "w109-ecuador-1990-uprising", branch: "ecuador", y: 1990.4, end: 1990.5, when: "May–June 1990", imp: 2, link: "first-americans",
    title: "Indigenous uprising paralyzes Ecuador",
    text: "CONAIE led what is called Ecuador's largest uprising, blocking roads for about a week. It demanded bilingual education, land reform and a plurinational state, and made Indigenous peoples national political actors.",
    cites: [W("Confederation_of_Indigenous_Nationalities_of_Ecuador", "Confederation of Indigenous Nationalities of Ecuador"), { t: "Ecuador from the late 20th century — Britannica", u: "https://www.britannica.com/place/Ecuador/Ecuador-from-the-late-20th-century" }] },
  // Indigenous peoples of the Americas
  { id: "w109-fa-indian-reorganization-act", branch: "first-americans", y: 1934.46, when: "June 18, 1934", imp: 2, link: "usa",
    title: "Indian Reorganization Act ends allotment",
    text: "The U.S. law slowed the allotment of tribal land, returned millions of acres to tribal trust and let tribes form governments. About 172 tribes accepted it and 75 rejected it.",
    cites: [W("Indian_Reorganization_Act", "Indian Reorganization Act"), { t: "Indian Reorganization Act — Britannica", u: "https://www.britannica.com/topic/Indian-Reorganization-Act" }] },
  { id: "w109-fa-navajo-code-talkers", branch: "first-americans", y: 1942.34, when: "May 4, 1942", imp: 2, link: "usa",
    title: "Navajo code talkers join the Marine Corps",
    text: "Twenty-nine Navajo men were sworn in as the first code talkers. Their unwritten-language code was used in the Pacific, including at Iwo Jima, and stayed classified until 1968.",
    cites: [W("Navajo_code_talkers", "Navajo code talkers"), { t: "Navajo code talkers — Britannica", u: "https://www.britannica.com/topic/Navajo-code-talkers" }] },
  { id: "w109-fa-indian-claims-commission", branch: "first-americans", y: 1946.61, when: "August 13, 1946", imp: 3, link: "usa",
    title: "U.S. Indian Claims Commission created",
    text: "The commission heard tribal claims against the United States over land lost through broken treaties. It could award only money, and by 1979 it had awarded over $818 million.",
    cites: [W("Indian_Claims_Commission", "Indian Claims Commission"), { t: "Indian Claims Commission — Britannica", u: "https://www.britannica.com/topic/Indian-Claims-Commission" }] },
  { id: "w109-fa-termination-policy", branch: "first-americans", y: 1953.58, when: "August 1, 1953", imp: 2, link: "usa",
    title: "Congress adopts the termination policy",
    text: "House Concurrent Resolution 108, announced August 1, 1953, set the policy of ending federal ties with tribes, and Public Law 280 that year extended state jurisdiction. From 1953 to 1964 over 100 tribes and bands lost federal recognition.",
    cites: [W("Indian_termination_policy", "Indian termination policy"), { t: "Bureau of Indian Affairs Records: Termination — National Archives", u: "https://www.archives.gov/research/native-americans/bia/termination" }] },
  { id: "w109-fa-hayes-pond", branch: "first-americans", y: 1958.05, when: "January 18, 1958", imp: 3,
    title: "Lumbee rout the Ku Klux Klan at Hayes Pond",
    text: "Hundreds of armed Lumbee confronted a Klan rally near Maxton, North Carolina, and scattered the Klansmen. The press mocked the Klan and praised the Lumbee.",
    cites: [W("Battle_of_Hayes_Pond", "Battle of Hayes Pond"), { t: "Battle of Hayes Pond anniversary — Lumbee Tribe of North Carolina", u: "https://www.lumbeetribe.com/single-post/2019/01/18/this-year-marks-the-61st-anniversary-of-the-historical-battle-of-hayes-pond" }] },
  { id: "w109-fa-chicago-conference", branch: "first-americans", y: 1961.45, end: 1961.47, when: "June 13–20, 1961", imp: 3, link: "usa",
    title: "American Indian Chicago Conference",
    text: "About 460 Native people from more than 80 tribes met at the University of Chicago. Their Declaration of Indian Purpose, a major statement on self-determination, was presented to President Kennedy in 1962.",
    cites: [W("American_Indian_Chicago_Conference", "American Indian Chicago Conference"), { t: "Native Chicago — University of Chicago Magazine", u: "https://magazine.uchicago.edu/0002/features/0002_native-print.html" }] },
  { id: "w109-fa-alcatraz", branch: "first-americans", y: 1969.89, end: 1971.44, when: "November 20, 1969 – June 11, 1971", imp: 2, link: "usa",
    title: "Native activists occupy Alcatraz",
    text: "About 90 American Indians and supporters occupied the island, claiming it as surplus federal land. The 19-month occupation highlighted treaty rights and is credited with helping end termination policy.",
    cites: [W("Occupation_of_Alcatraz", "Occupation of Alcatraz"), { t: "We Hold the Rock — National Park Service", u: "https://www.nps.gov/articles/we-hold-the-rock.htm" }] },
  { id: "w109-fa-house-made-of-dawn", branch: "first-americans", y: 1969.5, when: "1969", imp: 3,
    title: "Momaday's House Made of Dawn wins the Pulitzer",
    text: "N. Scott Momaday, a Kiowa writer, became the first Native author to win the Pulitzer Prize for Fiction, for his 1968 novel. Critics credit it with sparking the Native American Renaissance.",
    cites: [W("House_Made_of_Dawn", "House Made of Dawn"), { t: "N. Scott Momaday — Britannica", u: "https://www.britannica.com/biography/N-Scott-Momaday" }] },
  { id: "w109-fa-wounded-knee-1973", branch: "first-americans", y: 1973.16, end: 1973.35, when: "February 27 – May 8, 1973", imp: 2, link: "usa",
    title: "AIM and Oglala Lakota occupy Wounded Knee",
    text: "About 200 Oglala Lakota and American Indian Movement members seized the South Dakota town for 71 days, demanding treaty talks. Federal forces besieged it, and at least two occupiers were killed.",
    cites: [W("Wounded_Knee_incident", "Wounded Knee incident"), { t: "American Indian Movement — Britannica", u: "https://www.britannica.com/topic/American-Indian-Movement" }] },
  { id: "w109-fa-self-determination-act", branch: "first-americans", y: 1975.01, when: "January 4, 1975", imp: 3, link: "usa",
    title: "Indian Self-Determination and Education Assistance Act",
    text: "The U.S. law let tribes take over federal programs through contracts. It reversed termination and made self-determination the focus of federal policy.",
    cites: [W("Indian_Self-Determination_and_Education_Assistance_Act", "Indian Self-Determination and Education Assistance Act"), { t: "About the Indian Self-Determination and Education Assistance Act — BIA", u: "https://www.bia.gov/bia/ois/dsd/Training/About" }] },
  { id: "w109-fa-section-35", branch: "first-americans", y: 1982.29, when: "April 17, 1982", imp: 3, link: "canada",
    title: "Canada's constitution recognizes Aboriginal rights",
    text: "Section 35 of the Constitution Act, 1982 recognizes and affirms the existing Aboriginal and treaty rights of the First Nations, Inuit and Métis.",
    cites: [W("Section_35_of_the_Constitution_Act,_1982", "Section 35 of the Constitution Act, 1982"), { t: "Constitution Act, 1982, s. 35 — Justice Laws Website", u: "https://laws-lois.justice.gc.ca/eng/const/page-12.html" }] },
  { id: "w109-fa-ilo-169", branch: "first-americans", y: 1989.49, when: "June 27, 1989", imp: 3,
    title: "ILO adopts Convention 169 on Indigenous peoples",
    text: "The International Labour Organization convention requires prior consultation in good faith on measures affecting Indigenous territories. It entered into force in 1991.",
    cites: [W("Indigenous_and_Tribal_Peoples_Convention,_1989", "Indigenous and Tribal Peoples Convention, 1989")] },
  { id: "w109-fa-menchu-nobel", branch: "first-americans", y: 1992.79, when: "October 16, 1992", imp: 2,
    title: "Rigoberta Menchú wins the Nobel Peace Prize",
    text: "The K'iche' Maya activist from Guatemala was honored for her struggle for social justice and ethno-cultural reconciliation based on respect for Indigenous rights. She was the first Indigenous recipient of the prize.",
    cites: [{ t: "Rigoberta Menchú Tum — Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/peace/1992/tum/facts/" }, { t: "The Nobel Peace Prize 1992 press release — NobelPrize.org", u: "https://www.nobelprize.org/prizes/peace/1992/press-release/" }, W("Rigoberta_Mench%C3%BA", "Rigoberta Menchú")] },
  { id: "w109-fa-delgamuukw", branch: "first-americans", y: 1997.94, when: "December 11, 1997", imp: 2, link: "canada",
    title: "Delgamuukw ruling on Aboriginal title",
    text: "The Supreme Court of Canada held that Aboriginal title is a distinct Aboriginal right to land, protected by section 35, and that oral histories must be weighed on an equal footing with other evidence.",
    cites: [W("Delgamuukw_v_British_Columbia", "Delgamuukw v British Columbia"), { t: "Delgamuukw Case — The Canadian Encyclopedia", u: "https://thecanadianencyclopedia.ca/en/article/delgamuukw-case" }] },
  { id: "w109-fa-nmai-opens", branch: "first-americans", y: 2004.72, when: "September 21, 2004", imp: 3, link: "usa",
    title: "National Museum of the American Indian opens on the Mall",
    text: "The curved limestone building, designed with Blackfoot architect Douglas Cardinal, opened in Washington under a 1989 law that also required return of human remains to tribes.",
    cites: [W("National_Museum_of_the_American_Indian", "National Museum of the American Indian"), { t: "National Museum of the American Indian — Britannica", u: "https://www.britannica.com/topic/National-Museum-of-the-American-Indian" }] },
  { id: "w109-fa-undrip", branch: "first-americans", y: 2007.70, when: "September 13, 2007", imp: 2, link: "un",
    title: "UN adopts the Declaration on the Rights of Indigenous Peoples",
    text: "The General Assembly adopted the non-binding declaration 143 to 4. Australia, Canada, New Zealand and the United States voted no and later endorsed it.",
    cites: [W("United_Nations_Declaration_on_the_Rights_of_Indigenous_Peoples", "United Nations Declaration on the Rights of Indigenous Peoples"), { t: "UNDRIP, General Assembly resolution 61/295 — UN Audiovisual Library of International Law", u: "https://legal.un.org/avl/ha/ga_61-295/ga_61-295.html" }] },
  { id: "w109-fa-idle-no-more", branch: "first-americans", y: 2012.9, when: "November–December 2012", imp: 3, link: "canada",
    title: "Idle No More movement begins in Canada",
    text: "Four women from Saskatchewan began the movement against omnibus Bill C-45. It spread through round dances, blockades and Chief Theresa Spence's hunger strike.",
    cites: [W("Idle_No_More", "Idle No More"), { t: "How the Idle No More movement helped lay the foundation for reconciliation — CBC", u: "https://www.cbc.ca/radio/unreserved/idle-no-more-reconciliation-1.6663310" }] },
  { id: "w109-fa-standing-rock", branch: "first-americans", y: 2016.25, end: 2017.14, when: "April 2016 – February 2017", imp: 2, link: "usa",
    title: "Standing Rock protests against the Dakota Access Pipeline",
    text: "The Standing Rock Sioux and thousands of supporters opposed the pipeline's route under the Missouri River. Camps grew to include members of over 300 tribes before being cleared in February 2017.",
    cites: [W("Dakota_Access_Pipeline_protests", "Dakota Access Pipeline protests"), { t: "Standing Rock protests — Britannica", u: "https://www.britannica.com/event/Standing-Rock-protests" }] },
  { id: "w109-fa-kamloops", branch: "first-americans", y: 2021.4, when: "May 2021", imp: 2, link: "canada",
    title: "Kamloops announcement revives residential school reckoning",
    text: "Tk'emlúps te Secwépemc First Nation announced radar findings suggesting 215 possible unmarked graves at a former residential school. The site has not been excavated, but the news prompted memorials and further searches.",
    cites: [W("Kamloops_Indian_Residential_School", "Kamloops Indian Residential School"), { t: "Tk'emlúps te Secwépemc used ground-penetrating radar scans at Kamloops site — CBC", u: "https://www.cbc.ca/news/canada/british-columbia/first-nation-research-residential-school-1.6098518" }] },
  // Haiti
  { id: "w109-haiti-centre-dart", branch: "haiti", y: 1944.5, when: "1944", imp: 2,
    title: "Centre d'Art founded in Port-au-Prince",
    text: "American watercolorist DeWitt Peters and Haitian intellectuals founded the center, a hub of Haitian art that nurtured painters like Hector Hyppolite and Philomé Obin.",
    cites: [W("Centre_d%27Art", "Centre d'Art"), W("Haitian_art", "Haitian art"), { t: "Haiti — Britannica", u: "https://www.britannica.com/place/Haiti" }] },
  { id: "w109-haiti-compas", branch: "haiti", y: 1955.5, when: "1955", imp: 3,
    title: "Nemours Jean-Baptiste creates compas music",
    text: "Jean-Baptiste founded Ensemble Aux Callebasses in 1955, creating compas, a modern méringue dance music. It spread across the Caribbean and UNESCO inscribed it in 2025.",
    cites: [W("Compas", "Compas"), { t: "The Compas of Haiti — UNESCO Intangible Cultural Heritage", u: "https://ich.unesco.org/en/RL/the-compas-of-haiti-02273" }] },
  { id: "w109-haiti-boat-people", branch: "haiti", y: 1972, end: 1981, when: "1972–1981", imp: 3,
    title: "Haitian boat people reach Florida",
    text: "About 55,000 Haitians arrived by sea in Florida in these years, possibly twice that many in all. After 1981, intercepted refugees were returned to Haiti.",
    cites: [W("Haitian_boat_people", "Haitian boat people")] },
  { id: "w109-haiti-creole-pig", branch: "haiti", y: 1980, end: 1984, when: "c. 1980–1984", imp: 3,
    title: "Haiti's Creole pigs are eradicated",
    text: "After African swine fever spread from the Dominican Republic, a U.S.-backed campaign wiped out Haiti's Creole pigs, which peasants kept as savings. Replacement U.S. pigs fared poorly.",
    cites: [W("Creole_pig", "Creole pig"), { t: "Haiti — Britannica", u: "https://www.britannica.com/place/Haiti/Agriculture-forestry-and-fishing" }, { t: "History of Haiti — Britannica", u: "https://www.britannica.com/topic/history-of-Haiti" }] },
  { id: "w109-haiti-preval-first-term", branch: "haiti", y: 1996.10, when: "February 7, 1996", imp: 3,
    title: "René Préval takes office as president",
    text: "Préval, elected in the 1995 vote with about 88% of the ballots, was inaugurated in 1996. He was the first elected Haitian president to complete a full term, serving until 2001.",
    cites: [W("Ren%C3%A9_Pr%C3%A9val", "René Préval"), { t: "René Préval — Britannica", u: "https://www.britannica.com/biography/Rene-Preval" }] },
  { id: "w109-haiti-food-riots", branch: "haiti", y: 2008.3, when: "April 2008", imp: 3,
    title: "Food-price riots topple Haiti's prime minister",
    text: "Food-price riots shook Préval's government, and the Senate removed Prime Minister Jacques-Édouard Alexis that month.",
    cites: [W("Ren%C3%A9_Pr%C3%A9val", "René Préval"), { t: "Haitians Tense after Food Prices Spark Riot — NPR", u: "https://www.npr.org/2008/04/14/89631333/haitians-tense-after-food-prices-spark-riot" }] },
  { id: "w109-haiti-petrocaribe-protests", branch: "haiti", y: 2018.51, when: "July 6–7, 2018", imp: 3,
    title: "Fuel-price riots force out Haiti's prime minister",
    text: "A fuel price rise of up to 51% set off riots in Port-au-Prince and other cities. The increases were suspended and Prime Minister Lafontant resigned on July 14.",
    cites: [W("2018%E2%80%932022_Haitian_protests", "2018–2022 Haitian protests"), { t: "Haiti's Prime Minister Resigns After Riots Over Fuel Price Hike — NPR", u: "https://www.npr.org/2018/07/15/629198841/haitis-prime-minister-resigns-after-riots-over-fuel-price-hike" }] },
] });
TL.geo("w109-chile-socialist-republic", { scope: "place", lat: -33.44, lon: -70.65, r: 40, label: "Santiago, Chile", src: "https://en.wikipedia.org/wiki/Santiago" });
TL.geo("w109-chile-carpa-de-la-reina", { scope: "place", lat: -33.44, lon: -70.65, r: 40, label: "Santiago, Chile", src: "https://en.wikipedia.org/wiki/Santiago" });
TL.geo("w109-chile-allende-elected", { scope: "region", lat: -33.44, lon: -70.65, r: 2000, label: "Chile", src: "https://en.wikipedia.org/wiki/Santiago" });
TL.geo("w109-chile-neruda-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("w109-chile-letelier", { scope: "place", lat: 38.9, lon: -77.02, r: 40, label: "Washington, D.C.", src: "https://en.wikipedia.org/wiki/Washington,_D.C." });
TL.geo("w109-chile-1980-constitution", { scope: "region", lat: -33.44, lon: -70.65, r: 2000, label: "Chile", src: "https://en.wikipedia.org/wiki/Santiago" });
TL.geo("w109-chile-valech-report", { scope: "place", lat: -33.44, lon: -70.65, r: 40, label: "Santiago, Chile", src: "https://en.wikipedia.org/wiki/Santiago" });
TL.geo("w109-colombia-1936-reform", { scope: "place", lat: 4.71, lon: -74.07, r: 40, label: "Bogotá, Colombia", src: "https://en.wikipedia.org/wiki/Bogot%C3%A1" });
TL.geo("w109-colombia-rojas-pinilla", { scope: "place", lat: 4.71, lon: -74.07, r: 40, label: "Bogotá, Colombia", src: "https://en.wikipedia.org/wiki/Bogot%C3%A1" });
TL.geo("w109-colombia-medellin-conference", { scope: "place", lat: 6.23, lon: -75.59, r: 40, label: "Medellín, Colombia", src: "https://en.wikipedia.org/wiki/Medell%C3%ADn" });
TL.geo("w109-colombia-garcia-marquez-nobel", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("w109-colombia-armero", { scope: "place", lat: 4.96, lon: -74.91, r: 40, label: "Armero, Tolima", src: "https://en.wikipedia.org/wiki/Armero,_Tolima" });
TL.geo("w109-colombia-samper-cleared", { scope: "place", lat: 4.71, lon: -74.07, r: 40, label: "Bogotá, Colombia", src: "https://en.wikipedia.org/wiki/Bogot%C3%A1" });
TL.geo("w109-colombia-operation-jaque", { scope: "region", lat: 2.57, lon: -72.63, r: 150, label: "Guaviare Department, Colombia", src: "https://en.wikipedia.org/wiki/Guaviare_Department" });
TL.geo("w109-ecuador-glorious-revolution", { scope: "place", lat: -2.19, lon: -79.89, r: 40, label: "Guayaquil, Ecuador", src: "https://en.wikipedia.org/wiki/Guayaquil" });
TL.geo("w109-ecuador-radio-quito-panic", { scope: "place", lat: -0.22, lon: -78.51, r: 40, label: "Quito, Ecuador", src: "https://en.wikipedia.org/wiki/Quito" });
TL.geo("w109-ecuador-carnavalazo-oil", { scope: "place", lat: -0.22, lon: -78.51, r: 40, label: "Quito, Ecuador", src: "https://en.wikipedia.org/wiki/Quito" });
TL.geo("w109-ecuador-quito-unesco", { scope: "place", lat: -0.22, lon: -78.51, r: 40, label: "Quito, Ecuador", src: "https://en.wikipedia.org/wiki/Quito" });
TL.geo("w109-ecuador-1987-earthquakes", { scope: "region", lat: -0.22, lon: -78.51, r: 300, label: "Northern Ecuador", src: "https://en.wikipedia.org/wiki/Quito" });
TL.geo("w109-ecuador-1990-uprising", { scope: "region", lat: -2, lon: -77.5, r: 400, label: "Ecuador", src: "https://en.wikipedia.org/wiki/Ecuador" });
TL.geo("w109-fa-indian-reorganization-act", { scope: "region", lat: 39.8, lon: -98.6, r: 2500, label: "United States", src: "https://en.wikipedia.org/wiki/Contiguous_United_States" });
TL.geo("w109-fa-navajo-code-talkers", { scope: "region", lat: 36.2, lon: -109.2, r: 250, label: "Navajo Nation", src: "https://en.wikipedia.org/wiki/Navajo_Nation" });
TL.geo("w109-fa-indian-claims-commission", { scope: "place", lat: 38.9, lon: -77.02, r: 40, label: "Washington, D.C.", src: "https://en.wikipedia.org/wiki/Washington,_D.C." });
TL.geo("w109-fa-termination-policy", { scope: "place", lat: 38.9, lon: -77.02, r: 40, label: "Washington, D.C.", src: "https://en.wikipedia.org/wiki/Washington,_D.C." });
TL.geo("w109-fa-hayes-pond", { scope: "place", lat: 34.74, lon: -79.35, r: 40, label: "Maxton, North Carolina", src: "https://en.wikipedia.org/wiki/Maxton,_North_Carolina" });
TL.geo("w109-fa-chicago-conference", { scope: "place", lat: 41.79, lon: -87.6, r: 40, label: "Chicago, Illinois", src: "https://en.wikipedia.org/wiki/University_of_Chicago" });
TL.geo("w109-fa-alcatraz", { scope: "place", lat: 37.83, lon: -122.42, r: 30, label: "Alcatraz Island, California", src: "https://en.wikipedia.org/wiki/Alcatraz_Island" });
TL.geo("w109-fa-house-made-of-dawn", { scope: "region", lat: 39.8, lon: -98.6, r: 2500, label: "United States", src: "https://en.wikipedia.org/wiki/Contiguous_United_States" });
TL.geo("w109-fa-wounded-knee-1973", { scope: "place", lat: 43.15, lon: -102.37, r: 40, label: "Wounded Knee, South Dakota", src: "https://en.wikipedia.org/wiki/Wounded_Knee,_South_Dakota" });
TL.geo("w109-fa-self-determination-act", { scope: "place", lat: 38.9, lon: -77.02, r: 40, label: "Washington, D.C.", src: "https://en.wikipedia.org/wiki/Washington,_D.C." });
TL.geo("w109-fa-section-35", { scope: "place", lat: 45.42, lon: -75.7, r: 40, label: "Ottawa, Canada", src: "https://en.wikipedia.org/wiki/Ottawa" });
TL.geo("w109-fa-ilo-169", { scope: "place", lat: 46.2, lon: 6.15, r: 40, label: "Geneva, Switzerland", src: "https://en.wikipedia.org/wiki/Geneva" });
TL.geo("w109-fa-menchu-nobel", { scope: "region", lat: 15.5, lon: -90.25, r: 250, label: "Guatemala", src: "https://en.wikipedia.org/wiki/Guatemala" });
TL.geo("w109-fa-delgamuukw", { scope: "region", lat: 54, lon: -125, r: 400, label: "Northwestern British Columbia", src: "https://en.wikipedia.org/wiki/British_Columbia" });
TL.geo("w109-fa-nmai-opens", { scope: "place", lat: 38.9, lon: -77.02, r: 40, label: "Washington, D.C.", src: "https://en.wikipedia.org/wiki/Washington,_D.C." });
TL.geo("w109-fa-undrip", { scope: "place", lat: 40.71, lon: -74.01, r: 40, label: "New York City", src: "https://en.wikipedia.org/wiki/New_York_City" });
TL.geo("w109-fa-idle-no-more", { scope: "place", lat: 52.14, lon: -106.69, r: 40, label: "Saskatoon, Saskatchewan", src: "https://en.wikipedia.org/wiki/Saskatoon" });
TL.geo("w109-fa-standing-rock", { scope: "place", lat: 45.75, lon: -101.2, r: 60, label: "Standing Rock Reservation", src: "https://en.wikipedia.org/wiki/Standing_Rock_Indian_Reservation" });
TL.geo("w109-fa-kamloops", { scope: "place", lat: 50.68, lon: -120.34, r: 40, label: "Kamloops, British Columbia", src: "https://en.wikipedia.org/wiki/Kamloops" });
TL.geo("w109-haiti-centre-dart", { scope: "place", lat: 18.54, lon: -72.35, r: 40, label: "Port-au-Prince, Haiti", src: "https://en.wikipedia.org/wiki/Port-au-Prince" });
TL.geo("w109-haiti-compas", { scope: "place", lat: 18.54, lon: -72.35, r: 40, label: "Port-au-Prince, Haiti", src: "https://en.wikipedia.org/wiki/Port-au-Prince" });
TL.geo("w109-haiti-boat-people", { scope: "region", lat: 24, lon: -80.83, r: 800, label: "Straits of Florida", src: "https://en.wikipedia.org/wiki/Straits_of_Florida" });
TL.geo("w109-haiti-creole-pig", { scope: "region", lat: 19, lon: -72.42, r: 200, label: "Haiti", src: "https://en.wikipedia.org/wiki/Haiti" });
TL.geo("w109-haiti-preval-first-term", { scope: "place", lat: 18.54, lon: -72.35, r: 40, label: "Port-au-Prince, Haiti", src: "https://en.wikipedia.org/wiki/Port-au-Prince" });
TL.geo("w109-haiti-food-riots", { scope: "place", lat: 18.54, lon: -72.35, r: 40, label: "Port-au-Prince, Haiti", src: "https://en.wikipedia.org/wiki/Port-au-Prince" });
TL.geo("w109-haiti-petrocaribe-protests", { scope: "place", lat: 18.54, lon: -72.35, r: 40, label: "Port-au-Prince, Haiti", src: "https://en.wikipedia.org/wiki/Port-au-Prince" });
