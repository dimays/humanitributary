// W1-10 fill: Mercosur, Peru, Venezuela, Aboriginal & Torres Strait Islander peoples, Māori, 1925-present. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const D = (y, m = 7, d = 1) => {
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let doy = d - 0.5;
  for (let i = 0; i < m - 1; i++) doy += days[i];
  return Math.round((y + doy / (leap ? 366 : 365)) * 1000) / 1000;
};
const B = (t, u) => ({ t: `${t} — Encyclopaedia Britannica`, u });
TL.add({ events: [
  // Mercosur
  { id: "w110-mercosur-parlasur", branch: "mercosur", y: D(2005, 12, 9), when: "December 9, 2005", imp: 3,
    title: "Mercosur states sign a Parliament protocol",
    text: "Argentina, Brazil, Paraguay and Uruguay signed the Constitutive Protocol of the Mercosur Parliament in Montevideo, which the protocol names as the Parliament's seat.",
    cites: [W("Mercosur_Parliament", "Mercosur Parliament"), { t: "Protocolo Constitutivo del Parlamento del MERCOSUR — Infoleg (Argentina)", u: "https://servicios.infoleg.gob.ar/infolegInternet/anexos/120000-124999/121156/norma.htm" }] },
  { id: "w110-mercosur-venezuela-suspended", branch: "mercosur", y: D(2016, 12, 2), when: "December 2, 2016", imp: 3, link: "venezuela",
    title: "Venezuela suspended from Mercosur",
    text: "Argentina, Brazil, Paraguay and Uruguay announced the suspension of Venezuela's full-member rights, citing its failure to comply with the bloc's rules and democratic principles.",
    cites: [W("Mercosur", "Mercosur"), { t: "Venezuela suspended from Mercosur — Al Jazeera", u: "https://www.aljazeera.com/news/2016/12/3/venezuela-suspended-from-mercosur" }, { t: "Venezuela suspended from Mercosur — MercoPress", u: "https://en.mercopress.com/2016/12/03/venezuela-suspended-from-mercosur-maduro-s-foreign-minister-says-it-did-not-happen" }] },
  // Peru
  { id: "w110-peru-machu-picchu-unesco", branch: "peru", y: 1983.5, when: "1983", imp: 3,
    title: "Machu Picchu named a UNESCO World Heritage Site",
    text: "The Inca citadel above the Urubamba valley was inscribed in 1983 as a mixed cultural and natural site, drawing it into the world's best-known heritage landmarks.",
    cites: [B("Machu Picchu", "https://www.britannica.com/place/Machu-Picchu"), W("Machu_Picchu", "Machu Picchu")] },
  { id: "w110-peru-1962-coup", branch: "peru", y: D(1962, 7, 18), when: "July 18, 1962", imp: 3,
    title: "Military coup overthrows President Prado",
    text: "The military arrested President Manuel Prado and installed a junta under Gen. Ricardo Pérez Godoy, declaring the disputed June election results void. New elections were held in 1963.",
    cites: [W("1962_Peruvian_coup_d%27%C3%A9tat", "1962 Peruvian coup d'état"), { t: "Editorial Note, Peru, July 1962 — Foreign Relations of the United States 1961–63, vol. XII, Office of the Historian", u: "https://history.state.gov/historicaldocuments/frus1961-63v12/d420" }] },
  { id: "w110-peru-time-of-the-hero", branch: "peru", y: 1963.5, when: "1963", imp: 3,
    title: "Vargas Llosa publishes The Time of the Hero",
    text: "Mario Vargas Llosa's first novel, inspired by his time at the Leoncio Prado Military Academy, was one of the key novels that pioneered the Latin American Boom.",
    cites: [W("The_Time_of_the_Hero", "The Time of the Hero"), { t: "Mario Vargas Llosa – Biographical — NobelPrize.org", u: "https://www.nobelprize.org/prizes/literature/2010/vargas_llosa/biographical/" }] },
  { id: "w110-peru-tacnazo", branch: "peru", y: D(1975, 8, 29), when: "August 29, 1975", imp: 3,
    title: "The Tacnazo: Morales Bermúdez replaces Velasco",
    text: "A coup launched in Tacna ousted Juan Velasco Alvarado and began the second phase of the military government under Francisco Morales Bermúdez, ending Velasco's reforms.",
    cites: [W("Tacnazo", "Tacnazo"), B("Juan Velasco Alvarado", "https://www.britannica.com/biography/Juan-Velasco-Alvarado")] },
  { id: "w110-peru-garcia-inaugurated", branch: "peru", y: D(1985, 7, 28), when: "July 28, 1985", imp: 3,
    title: "Alan García takes office as Peru's first Aprista president",
    text: "García, elected at age 35, began a five-year term for the APRA party. It was marked by financial crisis and a worsening insurgency.",
    cites: [W("First_presidency_of_Alan_Garc%C3%ADa", "First presidency of Alan García"), { t: "Profile of Alan Garcia — Peru Reports", u: "https://perureports.com/alan-garcia/" }, B("Alan García", "https://www.britannica.com/biography/Alan-Garcia")] },
  { id: "w110-peru-embassy-hostage-crisis", branch: "peru", y: D(1996, 12, 17), end: D(1997, 4, 22), when: "December 17, 1996 – April 22, 1997", imp: 2,
    title: "Japanese embassy hostage crisis in Lima",
    text: "Túpac Amaru Revolutionary Movement rebels seized the Japanese ambassador's residence. Commandos stormed it on April 22, 1997, ending the siege.",
    cites: [W("Japanese_embassy_hostage_crisis", "Japanese embassy hostage crisis"), B("Alberto Fujimori", "https://www.britannica.com/biography/Alberto-Fujimori")] },
  { id: "w110-peru-truth-commission-report", branch: "peru", y: D(2003, 8, 28), when: "August 28, 2003", imp: 2,
    title: "Truth and Reconciliation Commission reports",
    text: "Peru's commission put the most probable number of deaths in the 1980–2000 internal armed conflict at 69,280, and assigned responsibility to the Shining Path, the MRTA and state forces, among others.",
    cites: [W("Peruvian_Truth_and_Reconciliation_Commission", "Peruvian Truth and Reconciliation Commission"), { t: "Conclusions — Truth and Reconciliation Commission (Peru)", u: "https://www.cverdad.org.pe/ingles/ifinal/conclusiones.php" }] },
  { id: "w110-peru-fujimori-sentenced", branch: "peru", y: D(2009, 4, 7), when: "April 7, 2009", imp: 2,
    title: "Fujimori sentenced to 25 years for human rights crimes",
    text: "After a 15-month trial in Lima, the former president was convicted of ordering military death squads to carry out killings and kidnappings.",
    cites: [B("Alberto Fujimori", "https://www.britannica.com/biography/Alberto-Fujimori"), W("Alberto_Fujimori", "Alberto Fujimori")] },
  // Venezuela
  { id: "w110-ve-hydrocarbons-law-1943", branch: "venezuela", y: 1943.2, when: "1943", imp: 2,
    title: "Hydrocarbons Law of 1943 reshapes the oil concessions",
    text: "Under President Medina Angarita, a new law unified the concessions, set royalties at one-sixth of oil extracted, required refining in Venezuela and made concessions revert to the state within forty years.",
    cites: [W("Venezuelan_oil_industry", "Venezuelan oil industry"), W("Isa%C3%ADas_Medina_Angarita", "Isaías Medina Angarita"), { t: "The Transition from Private to Public Control in the Venezuelan Petroleum Industry — Vanderbilt Journal of Transnational Law", u: "https://scholarship.law.vanderbilt.edu/vjtl/vol9/iss3/2/" }] },
  { id: "w110-ve-perez-jimenez-takes-power", branch: "venezuela", y: D(1952, 12, 2), when: "December 2, 1952", imp: 2,
    title: "Pérez Jiménez takes power as dictator",
    text: "Marcos Pérez Jiménez became provisional president in December 1952; his rule to 1958 was marked by extravagance, corruption and police oppression.",
    cites: [B("Marcos Pérez Jiménez", "https://www.britannica.com/biography/Marcos-Perez-Jimenez"), W("Marcos_P%C3%A9rez_Jim%C3%A9nez", "Marcos Pérez Jiménez")] },
  { id: "w110-ve-ciudad-universitaria", branch: "venezuela", y: 1940.5, end: 1960.5, when: "1940–1960", imp: 3,
    title: "Villanueva's Ciudad Universitaria rises in Caracas",
    text: "Architect Carlos Raúl Villanueva designed the Central University of Venezuela campus, built between 1940 and 1960; UNESCO inscribed it as a World Heritage Site in 2000.",
    cites: [W("Ciudad_Universitaria_de_Caracas", "Ciudad Universitaria de Caracas"), { t: "Ciudad Universitaria de Caracas — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/986" }] },
  { id: "w110-ve-caldera-takes-office", branch: "venezuela", y: D(1969, 3, 11), when: "March 11, 1969", imp: 3,
    title: "Rafael Caldera inaugurated president",
    text: "The Christian Democratic (COPEI) leader won the December 1968 election by about 1% over the ruling party's candidate and took office with a minority in Congress.",
    cites: [W("Rafael_Caldera", "Rafael Caldera"), { t: "Venezuela's '68 — Caracas Chronicles", u: "https://www.caracaschronicles.com/2025/06/09/venezuelas-68/" }] },
  { id: "w110-ve-el-sistema", branch: "venezuela", y: 1975.12, when: "1975", imp: 2,
    title: "José Antonio Abreu founds El Sistema",
    text: "Abreu founded the Simón Bolívar Symphony Orchestra and the National Symphony Youth Orchestra in 1975. Their success spread youth orchestras across Venezuela and grew into the El Sistema network.",
    cites: [W("El_Sistema", "El Sistema"), { t: "José Antonio Abreu — Right Livelihood", u: "https://rightlivelihood.org/the-change-makers/find-a-laureate/jose-antonio-abreu/" }] },
  { id: "w110-ve-black-friday", branch: "venezuela", y: 1983.13, when: "1983", imp: 3,
    title: "Black Friday: the bolívar is devalued",
    text: "In February 1983 the government devalued the bolívar from about 4.3 to 7.5 per U.S. dollar, then imposed capital controls and multiple exchange rates.",
    cites: [W("History_of_Venezuela_(1958%E2%80%931999)", "History of Venezuela (1958–1999)"), { t: "The History of Venezuela — A Monetary and Fiscal History of Latin America, 1960–2017 (University of Chicago)", u: "https://manifold.bfi.uchicago.edu/read/a-monetary-and-fiscal-history-of-latin-america-1960-2017/section/d2c8d793-bd56-4e90-bd22-5d07377b372a" }] },
  { id: "w110-ve-rctv-closed", branch: "venezuela", y: D(2007, 5, 27), when: "May 27, 2007", imp: 3,
    title: "RCTV goes off the air as Chávez refuses renewal",
    text: "Radio Caracas Televisión, the country's oldest private station, went off the air after 53 years when the government refused to renew its broadcast concession.",
    cites: [W("Radio_Caracas_Televisi%C3%B3n", "Radio Caracas Televisión"), { t: "Attacks on the Press 2007: Venezuela — Committee to Protect Journalists", u: "https://cpj.org/2008/02/attacks-on-the-press-2007-venezuela/" }] },
  { id: "w110-ve-2024-election", branch: "venezuela", y: D(2024, 7, 28), when: "July 28, 2024", imp: 2,
    title: "Disputed presidential election returns Maduro",
    text: "Both Maduro and the opposition candidate Edmundo González claimed victory; the electoral council declared Maduro the winner, but the result was widely contested and drew sanctions and protests.",
    cites: [B("Nicolás Maduro", "https://www.britannica.com/biography/Nicolas-Maduro"), W("2024_Venezuelan_presidential_election", "2024 Venezuelan presidential election")] },
  { id: "w110-ve-machado-nobel", branch: "venezuela", y: D(2025, 10, 10), when: "October 10, 2025", imp: 2,
    title: "María Corina Machado wins the Nobel Peace Prize",
    text: "The Norwegian Nobel Committee honored the opposition leader as a champion of peace who keeps the flame of democracy burning amid a growing darkness.",
    cites: [{ t: "Announcement, Nobel Peace Prize 2025 — NobelPrize.org", u: "https://www.nobelprize.org/prizes/peace/2025/press-release/" }, B("María Corina Machado", "https://www.britannica.com/biography/Maria-Corina-Machado")] },
  // Aboriginal and Torres Strait Islander peoples
  { id: "w110-fa-coniston", branch: "first-australians", y: D(1928, 8, 14), end: D(1928, 10, 18), when: "August 14 – October 18, 1928", imp: 2,
    title: "Coniston massacre in Central Australia",
    text: "After the killing of a dingo trapper, a police-led party killed Warlpiri, Anmatyerre and Kaytetye people across the Coniston district over about two months. A federal inquiry later found the party acted in self-defense.",
    cites: [W("Coniston_massacre", "Coniston massacre"), { t: "Remembering the Coniston Massacre — SBS News", u: "https://www.sbs.com.au/news/remembering-the-coniston-massacre" }] },
  { id: "w110-fa-day-of-mourning", branch: "first-australians", y: D(1938, 1, 26), when: "January 26, 1938", imp: 2,
    title: "Day of Mourning protest in Sydney",
    text: "On the 150th anniversary of British settlement, Aboriginal leaders met at Australian Hall to protest 150 years of treatment, and demanded full citizenship. It is seen as an early civil rights landmark.",
    cites: [{ t: "How the 1938 Day of Mourning launched the modern January 26 rally — ABC News", u: "https://www.abc.net.au/news/2023-01-26/the-history-of-january-26-indigenous-day-of-mourning/101892076" }] },
  { id: "w110-fa-namatjira-melbourne", branch: "first-australians", y: 1938.5, when: "1938", imp: 2,
    title: "Namatjira's watercolors sell out in Melbourne",
    text: "Forty-one of Albert Namatjira's watercolors exhibited in Melbourne sold out, creating great demand for his work.",
    cites: [B("Albert Namatjira", "https://www.britannica.com/biography/Albert-Namatjira"), W("Albert_Namatjira", "Albert Namatjira")] },
  { id: "w110-fa-cummeragunja", branch: "first-australians", y: D(1939, 2, 4), when: "February 4, 1939", imp: 2,
    title: "Cummeragunja walk-off",
    text: "About 200 Yorta Yorta and other residents left the Cummeragunja mission in New South Wales and crossed the Murray into Victoria, protesting conditions and official control of the mission.",
    cites: [{ t: "Yorta Yorta people return to Cummeragunja 80 years after historical 'walk-off' — ABC News", u: "https://www.abc.net.au/news/2019-02-05/cummeragunja-80th-anniversary/10771824" }] },
  { id: "w110-fa-torres-strait-battalion", branch: "first-australians", y: 1941.5, end: 1946.5, when: "1941–1946", imp: 3,
    title: "Torres Strait Light Infantry Battalion serves",
    text: "Formed in 1941 to defend the Torres Strait, the unit was raised from Torres Strait Islanders; by 1944 almost every able-bodied Islander man had enlisted. It was disbanded in 1946.",
    cites: [W("Torres_Strait_Light_Infantry_Battalion", "Torres Strait Light Infantry Battalion"), { t: "Indigenous defence service — Australian War Memorial", u: "https://www.awm.gov.au/articles/encyclopedia/indigenous" }] },
  { id: "w110-fa-pilbara-strike", branch: "first-australians", y: D(1946, 5, 1), when: "May 1, 1946", imp: 2,
    title: "Pilbara Aboriginal pastoral workers strike",
    text: "About 800 workers left stations in Western Australia's Pilbara for strike camps in one of Australia's longest strikes, later called a precursor of the Indigenous rights movement.",
    cites: [{ t: "Remembering the 1946 Pilbara strike, Australia's longest, that paved the way for Indigenous rights — ABC News", u: "https://www.abc.net.au/news/2020-11-15/one-of-australias-longest-strikes-1946-pilbara/12877286" }, { t: "The 1946 Strike: rebels of the Pilbara — Marnti Warajanga, Museum of Australian Democracy", u: "https://marnti-warajanga.moadoph.gov.au/the_1946_strike.html" }] },
  { id: "w110-fa-fcaatsi", branch: "first-australians", y: D(1958, 2, 15), when: "February 1958", imp: 3,
    title: "Federal Council for Aboriginal Advancement founded",
    text: "Formed at an Adelaide conference of interested groups, the council campaigned to repeal discriminatory laws, amend the constitution so the Commonwealth could legislate for Aboriginal people, and win land rights. It was disbanded in 1978.",
    cites: [W("Federal_Council_for_the_Advancement_of_Aborigines_and_Torres_Strait_Islanders", "Federal Council for the Advancement of Aborigines and Torres Strait Islanders"), { t: "Federal Council for the Advancement of Aborigines and Torres Strait Islanders — Dictionary of Sydney", u: "https://dictionaryofsydney.org/entry/federal_council_for_the_advancement_of_aborigines_and_torres_strait_islanders" }, { t: "Federal Council for the Advancement of Aborigines and Torres Strait Islanders — Australian Women's Register", u: "https://www.womenaustralia.info/entries/federal-council-for-the-advancement-of-aborigines-and-torres-strait-islanders/" }] },
  { id: "w110-fa-federal-vote-1962", branch: "first-australians", y: 1962.4, when: "1962", imp: 2,
    title: "Indigenous Australians gain the federal vote",
    text: "An amendment to the Commonwealth Electoral Act gave all Indigenous Australians the right to enrol and vote in federal elections, regardless of state law; enrolment became compulsory only in 1984.",
    cites: [{ t: "Electoral milestones for Indigenous Australians — Australian Electoral Commission", u: "https://www.aec.gov.au/indigenous/milestones.htm" }] },
  { id: "w110-fa-yirrkala-petitions", branch: "first-australians", y: D(1963, 8, 28), when: "August 28, 1963", imp: 2,
    title: "Yirrkala bark petitions reach Parliament",
    text: "Yolngu people protesting bauxite mining on Arnhem Land sent bark-framed petitions in Yolngu and English to the House of Representatives, the first traditional Indigenous documents recognized by Parliament.",
    cites: [{ t: "Yirrkala bark petitions 1963 — Magna Carta, Museum of Australian Democracy", u: "https://magnacarta.moadoph.gov.au/story/bark-petitions/" }, W("Yirrkala_bark_petitions", "Yirrkala bark petitions")] },
  { id: "w110-fa-freedom-ride", branch: "first-australians", y: D(1965, 2, 20), end: D(1965, 2, 27), when: "February 1965", imp: 2,
    title: "Charles Perkins leads the Freedom Ride",
    text: "A 15-day bus journey by students across New South Wales protested racial segregation in country towns, including a campaign at the Moree swimming pool, and drew national television attention.",
    cites: [W("Freedom_Ride_(Australia)", "Freedom Ride (Australia)"), { t: "Remembering the day the Australian Freedom Ride made history at Moree pool — ABC News", u: "https://www.abc.net.au/news/2019-09-27/remembering-the-day-the-moree-pool-became-a-part-of-history/11531506" }] },
  { id: "w110-fa-wave-hill-walk-off", branch: "first-australians", y: D(1966, 8, 23), when: "August 23, 1966", imp: 2,
    title: "Gurindji stockmen walk off Wave Hill station",
    text: "Vincent Lingiari led 200 Gurindji and other workers and families off Wave Hill in the Northern Territory, protesting pay and conditions, and the strike grew into a land rights campaign.",
    cites: [{ t: "The 1966 Wave Hill walk-off — Museum of Australian Democracy", u: "https://www.moadoph.gov.au/explore/democracy/the-1966-wave-hill-walk-off" }] },
  { id: "w110-fa-papunya-tula", branch: "first-australians", y: 1971.5, when: "1971", imp: 2,
    title: "Papunya Tula painting movement begins",
    text: "Encouraged by teacher Geoffrey Bardon at Papunya, senior men painted a Honey Ant Dreaming mural on the school wall, then began painting their ancestral stories on small surfaces. Papunya Tula Artists was established in 1971.",
    cites: [{ t: "Papunya Tula — Art Gallery of New South Wales", u: "https://archive.artgallery.nsw.gov.au/media/archives_2000/papunya_tula/" }] },
  { id: "w110-fa-aboriginal-flag", branch: "first-australians", y: D(1971, 7, 12), when: "July 1971", imp: 3,
    title: "Aboriginal flag first flown in Adelaide",
    text: "Designed by Luritja artist Harold Thomas, the black, red and yellow flag was first flown in support of land rights at Victoria Square in Adelaide.",
    cites: [{ t: "Moments of the Aboriginal and Torres Strait Islander Flags — Indigenous.gov.au", u: "https://www.indigenous.gov.au/moments-aboriginal-and-torres-strait-islander-flags" }] },
  { id: "w110-fa-tent-embassy", branch: "first-australians", y: D(1972, 1, 26), when: "January 26, 1972", imp: 2,
    title: "Aboriginal Tent Embassy established in Canberra",
    text: "Four Aboriginal men from Redfern set up a beach umbrella opposite what is now Old Parliament House to protest a land rights policy of 50-year leases. The site remains a symbol of Aboriginal protest.",
    cites: [{ t: "50th Anniversary of the Aboriginal Tent Embassy — Indigenous.gov.au", u: "https://www.indigenous.gov.au/stories/50th-anniversary-aboriginal-tent-embassy" }] },
  { id: "w110-fa-wave-hill-handback", branch: "first-australians", y: D(1975, 8, 16), when: "August 16, 1975", imp: 2,
    title: "Whitlam pours soil into Vincent Lingiari's hand",
    text: "At Daguragu, Prime Minister Gough Whitlam ceremonially poured soil into the hand of Gurindji leader Vincent Lingiari and handed back Wave Hill land, following the 1966 walk-off.",
    cites: [{ t: "Wave Hill 50th anniversary: Timeline of the station walk off and Gurindji land handback — ABC News", u: "https://www.abc.net.au/news/2016-08-18/timeline-of-wave-hill-land-rights/7760300" }] },
  { id: "w110-fa-land-rights-act-1976", branch: "first-australians", y: D(1976, 12, 16), when: "December 16, 1976", imp: 2,
    title: "Northern Territory Land Rights Act becomes law",
    text: "The first attempt by an Australian government to legally recognize the Aboriginal system of land ownership, it let traditional owners claim Northern Territory land, with inalienable freehold title.",
    cites: [W("Aboriginal_Land_Rights_(Northern_Territory)_Act_1976", "Aboriginal Land Rights (Northern Territory) Act 1976"), { t: "The Aboriginal Land Rights Act — Central Land Council", u: "https://www.clc.org.au/the-alra/" }] },
  { id: "w110-fa-uluru-handback", branch: "first-australians", y: D(1985, 10, 26), when: "October 26, 1985", imp: 2,
    title: "Uluru handed back to the Anangu",
    text: "The Governor-General returned title deeds to Uluru–Kata Tjuta National Park to its Anangu owners, who leased it back to the national parks service for 99 years under joint management.",
    cites: [{ t: "History of Uluṟu-Kata Tjuṯa National Park — Parks Australia", u: "https://parksaustralia.gov.au/uluru/discover/history/" }] },
  { id: "w110-fa-deaths-in-custody", branch: "first-australians", y: 1987.8, end: 1991.35, when: "October 1987 – 1991", imp: 2,
    title: "Royal Commission into Aboriginal Deaths in Custody",
    text: "The inquiry examined 99 deaths from 1980 to 1989 and made 339 recommendations, finding Aboriginal people were no likelier to die in custody but far likelier to be imprisoned.",
    cites: [W("Royal_Commission_into_Aboriginal_Deaths_in_Custody", "Royal Commission into Aboriginal Deaths in Custody"), { t: "Royal Commission into Aboriginal Deaths in Custody — National Archives of Australia", u: "https://www.naa.gov.au/explore-collection/first-australians/royal-commission-aboriginal-deaths-custody" }] },
  { id: "w110-fa-atsic", branch: "first-australians", y: D(1990, 3, 5), when: "March 5, 1990", imp: 3,
    title: "ATSIC founded as an elected Indigenous body",
    text: "The Aboriginal and Torres Strait Islander Commission, run by elected Indigenous representatives, took over policy functions from earlier agencies; it was dissolved in 2005.",
    cites: [W("Aboriginal_and_Torres_Strait_Islander_Commission", "Aboriginal and Torres Strait Islander Commission"), { t: "100 Years of calls for Voice — Reconciliation Australia", u: "https://www.reconciliation.org.au/support-a-voice-to-parliament/100-years-of-calls-for-voice/" }] },
  { id: "w110-fa-redfern-speech", branch: "first-australians", y: D(1992, 12, 10), when: "December 10, 1992", imp: 2,
    title: "Keating's Redfern Park speech",
    text: "Launching the International Year of the World's Indigenous People, Prime Minister Paul Keating said it was non-Indigenous Australians who had done the dispossessing. It is a landmark of national reconciliation.",
    cites: [{ t: "Paul Keating's Redfern speech changed the national conversation — for a moment — ABC News", u: "https://www.abc.net.au/news/2022-12-10/paul-keating-redfern-speech-1992-changed-conversation-moment/101742470" }, W("Redfern_Park_Speech", "Redfern Park Speech")] },
  { id: "w110-fa-wik-decision", branch: "first-australians", y: D(1996, 12, 23), when: "December 23, 1996", imp: 2,
    title: "Wik decision: pastoral leases and native title",
    text: "By 4–3, the High Court held that pastoral leases did not necessarily extinguish native title, which could coexist with lease rights, though the pastoralist's rights prevailed where they conflicted.",
    cites: [W("Wik_Peoples_v_Queensland", "Wik Peoples v Queensland"), { t: "Mabo — a timeline — ABC News", u: "https://www.abc.net.au/news/2012-06-03/mabo-a-timeline/4047186" }] },
  { id: "w110-fa-bringing-them-home", branch: "first-australians", y: D(1997, 5, 26), when: "May 26, 1997", imp: 2,
    title: "Bringing Them Home report on the Stolen Generations",
    text: "The national inquiry's report documented the forced removal of Aboriginal and Torres Strait Islander children from their families; a first National Sorry Day followed on May 26, 1998.",
    cites: [B("Stolen Generations", "https://www.britannica.com/topic/Stolen-Generations"), W("Bringing_Them_Home", "Bringing Them Home")] },
  { id: "w110-fa-nt-intervention", branch: "first-australians", y: D(2007, 6, 21), when: "June 21, 2007", imp: 2,
    title: "Northern Territory Intervention announced",
    text: "Prime Minister John Howard announced a federal intervention in Aboriginal communities after a report on child sexual abuse. It brought welfare quarantining and alcohol bans, and set aside the Racial Discrimination Act.",
    cites: [{ t: "Indigenous abuse crackdown earns mixed response — ABC News", u: "https://www.abc.net.au/news/2007-06-21/indigenous-abuse-crackdown-earns-mixed-response/76978" }, W("Northern_Territory_National_Emergency_Response", "Northern Territory National Emergency Response")] },
  { id: "w110-fa-uluru-statement", branch: "first-australians", y: D(2017, 5, 26), when: "May 26, 2017", imp: 2,
    title: "Uluru Statement from the Heart issued",
    text: "A national convention of First Nations delegates at Uluru called for a constitutionally enshrined Voice to Parliament and a Makarrata Commission for agreement-making and truth-telling.",
    cites: [{ t: "The Journey So Far — Uluru Statement from the Heart", u: "https://ulurustatement.org/history/the-journey-so-far/" }, W("Uluru_Statement_from_the_Heart", "Uluru Statement from the Heart")] },
  { id: "w110-fa-juukan-gorge", branch: "first-australians", y: D(2020, 5, 24), when: "May 24, 2020", imp: 2,
    title: "Rio Tinto destroys the Juukan Gorge rock shelters",
    text: "A blast for the Brockman 4 iron ore mine devastated Aboriginal heritage sites on Puutu Kunti Kurrama and Pinikura land, including a shelter with some 46,000 years of occupation; a parliamentary inquiry followed.",
    cites: [{ t: "Juukan Gorge — Interim Report, Parliament of Australia", u: "https://www.aph.gov.au/Parliamentary_Business/Committees/Joint/Former_Committees/Northern_Australia_46P/CavesatJuukanGorge/Interim_Report/section?id=committees%2Freportjnt%2F024579%2F75133" }, W("Juukan_Gorge", "Juukan Gorge")] },
  { id: "w110-fa-voice-referendum", branch: "first-australians", y: D(2023, 10, 14), when: "October 14, 2023", imp: 2,
    title: "Voice to Parliament referendum defeated",
    text: "Australians voted No nationally and in all six states to a constitutional Aboriginal and Torres Strait Islander Voice; only the ACT voted Yes.",
    cites: [{ t: "The Voice to Parliament referendum was defeated. Let's catch you up on the results — ABC News", u: "https://www.abc.net.au/news/2023-10-15/voice-to-parliament-referendum-result-no-vote-yes-campaign/102977654" }, W("2023_Australian_Indigenous_Voice_referendum", "2023 Australian Indigenous Voice referendum")] },
  // Māori
  { id: "w110-maori-ratana-church", branch: "maori", y: D(1925, 7, 21), when: "July 21, 1925", imp: 2,
    title: "Rātana Church constitution accepted",
    text: "The Registrar-General accepted the constitution of the church built around the prophet T. W. Rātana, a syncretic Māori Christianity. It would become a major force in Māori politics.",
    cites: [W("R%C4%81tana", "Rātana"), B("Rātana church", "https://www.britannica.com/topic/Ratana-Church")] },
  { id: "w110-maori-ratana-labour", branch: "maori", y: 1936.5, when: "1936", imp: 2,
    title: "Rātana movement formalizes its alliance with Labour",
    text: "After a Rātana candidate first won a Māori seat in 1931, the movement formalized its alliance with the Labour Party in 1936, a hold on Māori seats that lasted until 1963.",
    cites: [W("R%C4%81tana", "Rātana"), B("Rātana church", "https://www.britannica.com/topic/Ratana-Church")] },
  { id: "w110-maori-whare-runanga", branch: "maori", y: D(1940, 2, 6), when: "February 6, 1940", imp: 3,
    title: "Te Whare Rūnanga opens at Waitangi",
    text: "The carved Māori meeting house opened beside the Treaty House on February 6, 1940, timed to mark a century since the Treaty of Waitangi was first signed.",
    cites: [W("Waitangi_Treaty_Grounds", "Waitangi Treaty Grounds"), { t: "Te Whare Rūnanga — Waitangi Treaty Grounds", u: "https://www.waitangi.org.nz/visit/te-whare-runanga" }] },
  { id: "w110-maori-battalion", branch: "maori", y: 1940.4, end: 1946, when: "1940–1946", imp: 2,
    title: "28th (Māori) Battalion formed",
    text: "Raised in 1940, the battalion served with the 2nd New Zealand Division in Greece, Crete, North Africa and Italy, and returned to Wellington in February 1946.",
    cites: [W("M%C4%81ori_Battalion", "28th (Māori) Battalion"), { t: "DISCOVER: 28th Māori Battalion — Rotorua Museum", u: "https://rotoruamuseum.co.nz/education/nz-schools/discovery-zone/discover-28th-mori-battalion-education-programme/" }, { t: "Forever Brave — E-Tangata", u: "https://e-tangata.co.nz/history/forever-brave/" }] },
  { id: "w110-maori-waikato-settlement", branch: "maori", y: 1946.5, when: "1946", imp: 3,
    title: "Waikato-Maniapoto Claims Settlement Act",
    text: "The Act created the Tainui Māori Trust Board to administer an annual payment for the confiscation of Waikato land. Waikato Tainui never regarded the 1946 offer as full and final.",
    cites: [W("Waikato_Tainui", "Waikato Tainui"), { t: "History — Waikato-Tainui", u: "https://www.waikatotainui.com/about-us/history" }] },
  { id: "w110-maori-womens-welfare-league", branch: "maori", y: D(1951, 9, 15), when: "September 1951", imp: 2,
    title: "Māori Women's Welfare League holds first conference",
    text: "Meeting in Wellington, delegates founded the league, with Whina Cooper as first president, to work on housing and education.",
    cites: [{ t: "Tātau Tātau: Māori Women's Welfare League — Te Papa", u: "https://www.tepapa.govt.nz/visit/exhibitions/tatau-tatau-maori-womens-welfare-league" }, W("M%C4%81ori_Women%27s_Welfare_League", "Māori Women's Welfare League")] },
  { id: "w110-maori-hunn-report", branch: "maori", y: D(1961, 1, 17), when: "January 17, 1961", imp: 3,
    title: "Hunn Report on Māori Affairs released",
    text: "Jack Hunn's review of the Department of Māori Affairs treated Māori migration to cities as unavoidable and was the first official public explanation of integration policy.",
    cites: [W("Jack_Hunn", "Jack Hunn"), { t: "Hunn Report published — Te Hao Rangahau, Ministry of Social Development", u: "https://www.tehaorangahau.msd.govt.nz/chronology/1938-1971/list/115" }] },
] });
TL.geo("w110-mercosur-parlasur", { scope: "place", lat: -34.91, lon: -56.18, r: 40, label: "Montevideo, Uruguay", src: "https://en.wikipedia.org/wiki/Montevideo" });
TL.geo("w110-mercosur-venezuela-suspended", { scope: "region", lat: 7, lon: -65, r: 800, label: "Venezuela", src: "https://en.wikipedia.org/wiki/Venezuela" });
TL.geo("w110-peru-machu-picchu-unesco", { scope: "place", lat: -13.16, lon: -72.55, r: 30, label: "Machu Picchu, Peru", src: "https://en.wikipedia.org/wiki/Machu_Picchu" });
TL.geo("w110-peru-1962-coup", { scope: "place", lat: -12.06, lon: -77.04, r: 40, label: "Lima, Peru", src: "https://en.wikipedia.org/wiki/Lima" });
TL.geo("w110-peru-time-of-the-hero", { scope: "place", lat: -12.06, lon: -77.04, r: 40, label: "Lima, Peru", src: "https://en.wikipedia.org/wiki/Lima" });
TL.geo("w110-peru-tacnazo", { scope: "place", lat: -18.01, lon: -70.25, r: 40, label: "Tacna, Peru", src: "https://en.wikipedia.org/wiki/Tacna" });
TL.geo("w110-peru-garcia-inaugurated", { scope: "place", lat: -12.06, lon: -77.04, r: 40, label: "Lima, Peru", src: "https://en.wikipedia.org/wiki/Lima" });
TL.geo("w110-peru-embassy-hostage-crisis", { scope: "place", lat: -12.10, lon: -77.03, r: 30, label: "San Isidro, Lima", src: "https://en.wikipedia.org/wiki/San_Isidro_District,_Lima" });
TL.geo("w110-peru-truth-commission-report", { scope: "place", lat: -12.06, lon: -77.04, r: 40, label: "Lima, Peru", src: "https://en.wikipedia.org/wiki/Lima" });
TL.geo("w110-peru-fujimori-sentenced", { scope: "place", lat: -12.06, lon: -77.04, r: 40, label: "Lima, Peru", src: "https://en.wikipedia.org/wiki/Lima" });
TL.geo("w110-ve-hydrocarbons-law-1943", { scope: "region", lat: 7, lon: -65, r: 800, label: "Venezuela", src: "https://en.wikipedia.org/wiki/Venezuela" });
TL.geo("w110-ve-perez-jimenez-takes-power", { scope: "place", lat: 10.51, lon: -66.91, r: 40, label: "Caracas, Venezuela", src: "https://en.wikipedia.org/wiki/Caracas" });
TL.geo("w110-ve-ciudad-universitaria", { scope: "place", lat: 10.49, lon: -66.89, r: 30, label: "Ciudad Universitaria de Caracas", src: "https://en.wikipedia.org/wiki/Ciudad_Universitaria_de_Caracas" });
TL.geo("w110-ve-caldera-takes-office", { scope: "place", lat: 10.51, lon: -66.91, r: 40, label: "Caracas, Venezuela", src: "https://en.wikipedia.org/wiki/Caracas" });
TL.geo("w110-ve-el-sistema", { scope: "place", lat: 10.51, lon: -66.91, r: 40, label: "Caracas, Venezuela", src: "https://en.wikipedia.org/wiki/Caracas" });
TL.geo("w110-ve-black-friday", { scope: "region", lat: 7, lon: -65, r: 800, label: "Venezuela", src: "https://en.wikipedia.org/wiki/Venezuela" });
TL.geo("w110-ve-rctv-closed", { scope: "place", lat: 10.51, lon: -66.91, r: 40, label: "Caracas, Venezuela", src: "https://en.wikipedia.org/wiki/Caracas" });
TL.geo("w110-ve-2024-election", { scope: "region", lat: 7, lon: -65, r: 800, label: "Venezuela", src: "https://en.wikipedia.org/wiki/Venezuela" });
TL.geo("w110-ve-machado-nobel", { scope: "place", lat: 59.91, lon: 10.75, r: 40, label: "Oslo, Norway", src: "https://en.wikipedia.org/wiki/Oslo" });
TL.geo("w110-fa-coniston", { scope: "place", lat: -22.04, lon: 132.49, r: 100, label: "Coniston, Northern Territory", src: "https://en.wikipedia.org/wiki/Coniston_(Northern_Territory)" });
TL.geo("w110-fa-day-of-mourning", { scope: "place", lat: -33.87, lon: 151.21, r: 40, label: "Sydney, Australia", src: "https://en.wikipedia.org/wiki/Sydney" });
TL.geo("w110-fa-namatjira-melbourne", { scope: "place", lat: -37.81, lon: 144.96, r: 40, label: "Melbourne, Australia", src: "https://en.wikipedia.org/wiki/Melbourne" });
TL.geo("w110-fa-cummeragunja", { scope: "place", lat: -35.9, lon: 144.97, r: 60, label: "Cummeragunja, New South Wales", src: "https://en.wikipedia.org/wiki/Cummeragunja,_New_South_Wales" });
TL.geo("w110-fa-torres-strait-battalion", { scope: "place", lat: -10.59, lon: 142.22, r: 100, label: "Thursday Island, Queensland", src: "https://en.wikipedia.org/wiki/Thursday_Island" });
TL.geo("w110-fa-pilbara-strike", { scope: "region", lat: -21, lon: 119, r: 400, label: "Pilbara, Western Australia", src: "https://en.wikipedia.org/wiki/Pilbara" });
TL.geo("w110-fa-fcaatsi", { scope: "place", lat: -34.93, lon: 138.6, r: 40, label: "Adelaide, Australia", src: "https://en.wikipedia.org/wiki/Adelaide" });
TL.geo("w110-fa-federal-vote-1962", { scope: "region", lat: -25, lon: 133, r: 2500, label: "Australia", src: "https://en.wikipedia.org/wiki/Australia" });
TL.geo("w110-fa-yirrkala-petitions", { scope: "place", lat: -12.25, lon: 136.89, r: 60, label: "Yirrkala, Northern Territory", src: "https://en.wikipedia.org/wiki/Yirrkala" });
TL.geo("w110-fa-freedom-ride", { scope: "place", lat: -29.46, lon: 149.84, r: 150, label: "Moree, New South Wales", src: "https://en.wikipedia.org/wiki/Moree" });
TL.geo("w110-fa-wave-hill-walk-off", { scope: "place", lat: -17.39, lon: 131.12, r: 80, label: "Wave Hill, Northern Territory", src: "https://en.wikipedia.org/wiki/Wave_Hill,_Northern_Territory" });
TL.geo("w110-fa-papunya-tula", { scope: "place", lat: -23.22, lon: 131.9, r: 60, label: "Papunya, Northern Territory", src: "https://en.wikipedia.org/wiki/Papunya" });
TL.geo("w110-fa-aboriginal-flag", { scope: "place", lat: -34.93, lon: 138.6, r: 40, label: "Adelaide, Australia", src: "https://en.wikipedia.org/wiki/Adelaide" });
TL.geo("w110-fa-tent-embassy", { scope: "place", lat: -35.29, lon: 149.13, r: 40, label: "Canberra, Australia", src: "https://en.wikipedia.org/wiki/Canberra" });
TL.geo("w110-fa-wave-hill-handback", { scope: "place", lat: -17.42, lon: 130.81, r: 80, label: "Daguragu, Northern Territory", src: "https://en.wikipedia.org/wiki/Daguragu" });
TL.geo("w110-fa-land-rights-act-1976", { scope: "region", lat: -20, lon: 133, r: 900, label: "Northern Territory", src: "https://en.wikipedia.org/wiki/Northern_Territory" });
TL.geo("w110-fa-uluru-handback", { scope: "place", lat: -25.34, lon: 131.04, r: 60, label: "Uluru, Northern Territory", src: "https://en.wikipedia.org/wiki/Uluru" });
TL.geo("w110-fa-deaths-in-custody", { scope: "region", lat: -25, lon: 133, r: 2500, label: "Australia", src: "https://en.wikipedia.org/wiki/Australia" });
TL.geo("w110-fa-atsic", { scope: "place", lat: -35.29, lon: 149.13, r: 40, label: "Canberra, Australia", src: "https://en.wikipedia.org/wiki/Canberra" });
TL.geo("w110-fa-redfern-speech", { scope: "place", lat: -33.89, lon: 151.20, r: 30, label: "Redfern, Sydney", src: "https://en.wikipedia.org/wiki/Redfern,_New_South_Wales" });
TL.geo("w110-fa-wik-decision", { scope: "place", lat: -35.29, lon: 149.13, r: 40, label: "Canberra, Australia", src: "https://en.wikipedia.org/wiki/Canberra" });
TL.geo("w110-fa-bringing-them-home", { scope: "region", lat: -25, lon: 133, r: 2500, label: "Australia", src: "https://en.wikipedia.org/wiki/Australia" });
TL.geo("w110-fa-nt-intervention", { scope: "region", lat: -20, lon: 133, r: 900, label: "Northern Territory", src: "https://en.wikipedia.org/wiki/Northern_Territory" });
TL.geo("w110-fa-uluru-statement", { scope: "place", lat: -25.34, lon: 131.04, r: 60, label: "Uluru, Northern Territory", src: "https://en.wikipedia.org/wiki/Uluru" });
TL.geo("w110-fa-juukan-gorge", { scope: "place", lat: -22.62, lon: 117.16, r: 60, label: "Juukan Gorge, Western Australia", src: "https://en.wikipedia.org/wiki/Juukan_Gorge" });
TL.geo("w110-fa-voice-referendum", { scope: "region", lat: -25, lon: 133, r: 2500, label: "Australia", src: "https://en.wikipedia.org/wiki/Australia" });
TL.geo("w110-maori-ratana-church", { scope: "place", lat: -40.0, lon: 175.2, r: 40, label: "Rātana Pā, New Zealand", src: "https://en.wikipedia.org/wiki/R%C4%81tana,_New_Zealand" });
TL.geo("w110-maori-ratana-labour", { scope: "region", lat: -42, lon: 173, r: 800, label: "New Zealand", src: "https://en.wikipedia.org/wiki/New_Zealand" });
TL.geo("w110-maori-whare-runanga", { scope: "place", lat: -35.27, lon: 174.08, r: 30, label: "Waitangi, New Zealand", src: "https://en.wikipedia.org/wiki/Waitangi,_Far_North" });
TL.geo("w110-maori-battalion", { scope: "region", lat: -42, lon: 173, r: 800, label: "New Zealand", src: "https://en.wikipedia.org/wiki/New_Zealand" });
TL.geo("w110-maori-waikato-settlement", { scope: "region", lat: -37.8, lon: 175.4, r: 120, label: "Waikato, New Zealand", src: "https://en.wikipedia.org/wiki/Waikato" });
TL.geo("w110-maori-womens-welfare-league", { scope: "place", lat: -41.29, lon: 174.78, r: 40, label: "Wellington, New Zealand", src: "https://en.wikipedia.org/wiki/Wellington" });
TL.geo("w110-maori-hunn-report", { scope: "region", lat: -42, lon: 173, r: 800, label: "New Zealand", src: "https://en.wikipedia.org/wiki/New_Zealand" });
