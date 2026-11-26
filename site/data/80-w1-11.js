// Gap fill W1-11: Māori, New Zealand and Polynesian peoples, 1925 to today. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
TL.add({ events: [
  // ---- Māori ----
  { id: "w111-maori-language-petition", branch: "maori", y: 1972.704, when: "September 14, 1972",
    title: "Māori Language Petition presented to Parliament",
    text: "Ngā Tamatoa, the Te Reo Māori Society and students gathered more than 30,000 signatures asking for te reo Māori to be taught in schools. The petition became a catalyst for the language's revival.", imp: 2,
    cites: [{ t: "Remembering the Māori Language Petition and the revival of te reo Māori — RNZ", u: "https://www.rnz.co.nz/news/te-manu-korihi/474655/remembering-the-maori-language-petition-and-the-revival-of-te-reo-maori", k: "news" }, W("Ng%C4%81_Tamatoa", "Ngā Tamatoa")] },
  { id: "w111-maori-land-march", branch: "maori", y: 1975.701, end: 1975.781, when: "September 14 – October 13, 1975",
    title: "Whina Cooper leads the Māori Land March",
    text: "Starting at Te Hāpua with about 50 people, the march under 79-year-old Whina Cooper grew to about 5,000 by Wellington, where a 60,000-signature petition against the loss of Māori land was presented to the Prime Minister.", imp: 2,
    cites: [{ t: "Māori Land March, 1975 — Te Papa", u: "https://tepapa.govt.nz/digital-museum/maori-land-march-1975", k: "museum" }, { t: "A remarkable confluence of events, 50 years on from the Māori Land March — RNZ", u: "https://www.rnz.co.nz/news/te-manu-korihi/577209/a-remarkable-confluence-of-events-50-years-on-from-the-maori-land-march", k: "news" }] },
  { id: "w111-waitangi-tribunal", branch: "maori", y: 1975.78, when: "October 1975",
    title: "Waitangi Tribunal established",
    text: "The Treaty of Waitangi Act 1975 created a standing commission of inquiry into Crown breaches of the Treaty. In 1985 the Tribunal gained power to inquire into events back to 1840.", imp: 2,
    cites: [{ t: "Waitangi Tribunal (official site, timeline)", u: "https://www.waitangitribunal.govt.nz/", k: "primary" }, W("Waitangi_Tribunal", "Waitangi Tribunal")] },
  { id: "w111-bastion-point", branch: "maori", y: 1977.013, end: 1978.396, when: "January 5, 1977 – May 25, 1978",
    title: "Bastion Point occupation",
    text: "Ngāti Whātua Ōrākei occupied Takaparawhau for 506 days against the sale of their land. More than 800 police and soldiers ended it, arresting 222; the land was returned in 1988.", imp: 2,
    cites: [{ t: "On this day in 1978, the Bastion Point occupation came to a violent end — The Spinoff", u: "https://thespinoff.co.nz/atea/25-05-2022/on-this-day-in-1978-the-bastion-point-occupation-came-to-a-violent-end", k: "news" }, { t: "The magic of Bastion Point: 40 years on — Newsroom", u: "https://newsroom.co.nz/2018/05/19/the-magic-of-bastion-point-40-years-on/", k: "news" }, W("Bastion_Point", "Bastion Point")] },
  { id: "w111-kohanga-reo", branch: "maori", y: 1982.5, when: "1982",
    title: "First kōhanga reo language nest opens",
    text: "The first Māori-language immersion preschool opened in Pukeatua, Wainuiomata, in April. Three years later more than 300 kōhanga reo were operating across the country.", imp: 2,
    cites: [{ t: "Te Ōrokohanga — Te Kōhanga Reo National Trust", u: "https://www.kohanga.ac.nz/kaupapa/te-oorokohanganga", k: "primary" }, W("K%C5%8Dhanga_reo", "Kōhanga reo")] },
  { id: "w111-bone-people-booker", branch: "maori", y: 1985.832, when: "1985",
    title: "Keri Hulme wins the Booker Prize",
    text: "Keri Hulme's novel The Bone People, rooted in Māori and Pākehā life, won the Booker Prize. She was the first New Zealander to win it, and it was the first debut novel to do so.", imp: 2,
    cites: [{ t: "Keri Hulme — Encyclopaedia Britannica", u: "https://www.britannica.com/biography/Keri-Hulme", k: "reference" }, { t: "Booker Prize 1985 — The Booker Prizes", u: "https://thebookerprizes.com/the-booker-library/prize-years/1985", k: "primary" }, W("The_Bone_People", "The Bone People")] },
  { id: "w111-maori-language-act", branch: "maori", y: 1987.55, when: "July 20, 1987",
    title: "Māori made an official language",
    text: "The Maori Language Act 1987 declared te reo Māori an official language of New Zealand, gave a right to use it in legal proceedings, and set up a Māori Language Commission.", imp: 2,
    cites: [{ t: "Māori Language Act 1987 — New Zealand Legislation", u: "https://www.legislation.govt.nz/act/public/1987/0176/latest/whole.html", k: "primary" }, W("M%C4%81ori_Language_Act_1987", "Māori Language Act 1987")] },
  { id: "w111-sealord-deal", branch: "maori", y: 1992.728, when: "September 23, 1992",
    title: "Sealord Deal settles Māori fishing claims",
    text: "The Crown and Māori leaders signed a settlement of commercial fishing claims under the Treaty. It gave Māori a 50 percent stake in Sealord and became the base of a billion-dollar Māori fishing economy.", imp: 2,
    cites: [{ t: "Māori leaders celebrate Sealord Deal 30 years on — RNZ", u: "https://www.rnz.co.nz/news/business/475358/maori-leaders-celebrate-sealord-deal-30-years-on-warn-of-complacency", k: "news" }] },
  { id: "w111-once-were-warriors", branch: "maori", y: 1994.5, when: "1994",
    title: "Once Were Warriors film",
    text: "Lee Tamahori's film of Alan Duff's novel depicted domestic and gang violence in an urban Māori whānau. It became New Zealand's most watched local release and gave career-defining roles to Temuera Morrison and Rena Owen.", imp: 3,
    cites: [{ t: "Once Were Warriors — NZ On Screen", u: "https://www.nzonscreen.com/title/once-were-warriors-1994", k: "museum" }, W("Once_Were_Warriors_(film)", "Once Were Warriors (film)")] },
  { id: "w111-waikato-tainui-settlement", branch: "maori", y: 1995.388, when: "May 22, 1995",
    title: "Waikato-Tainui sign first major Treaty settlement",
    text: "At Tūrangawaewae Marae, Waikato-Tainui and the Crown signed a Deed of Settlement worth $170 million in compensation for confiscated land, plus Crown properties. Waikato-Tainui was the first tribe to conclude a Treaty deal with the Crown.", imp: 2,
    cites: [{ t: "Waikato-Tainui: 20 years post-settlement — Te Puni Kōkiri", u: "https://tpk.govt.nz/en/mo-te-puni-kokiri/kokiri-magazine/kokiri-32-2015/waikatotainui-20-years-postsettlement", k: "primary" }, W("Waikato_Raupatu_Claims_Settlement_Act_1995", "Waikato Raupatu Claims Settlement Act 1995")] },
  { id: "w111-maori-television", branch: "maori", y: 2004.24, when: "March 28, 2004",
    title: "Māori Television begins broadcasting",
    text: "Government-funded Māori Television launched from Auckland, broadcasting in te reo Māori and English. Its stated aim was to revitalize te reo Māori and tikanga Māori.", imp: 3,
    cites: [{ t: "Whakaata Māori celebrates 20 years of telling Māori stories — RNZ", u: "https://www.rnz.co.nz/news/te-manu-korihi/512948/whakaata-maori-celebrates-20-years-of-telling-maori-stories", k: "news" }, W("M%C4%81ori_Television", "Māori Television")] },
  { id: "w111-undrip-endorsed", branch: "maori", y: 2010.3, when: "April 20, 2010",
    title: "New Zealand endorses UN Indigenous rights declaration",
    text: "Māori Affairs Minister Pita Sharples announced in a speech at the UN in New York that New Zealand had adopted the Declaration on the Rights of Indigenous Peoples. It was one of four countries that voted against it in 2007.", imp: 3,
    cites: [{ t: "New Zealand adopts UN declaration on rights of indigenous people — RNZ", u: "https://www.rnz.co.nz/international/pacific-news/189829/new-zealand-adopts-un-declaration-on-rights-of-indigenous-people", k: "news" }] },
  { id: "w111-whanganui-legal-person", branch: "maori", y: 2017.2, when: "March 2017",
    title: "Whanganui River becomes a legal person",
    text: "Settling an iwi claim, Parliament passed the Te Awa Tupua Act, declaring the Whanganui River a legal person. It was widely reported as the first river in the world given that status.", imp: 2,
    cites: [{ t: "New Zealand river is the world's first 'legal person' — Al Jazeera", u: "https://www.aljazeera.com/news/2017/3/16/new-zealand-river-is-the-worlds-first-legal-person", k: "news" }, W("Whanganui_River", "Whanganui River")] },
  { id: "w111-matariki-holiday", branch: "maori", y: 2022.478, when: "June 24, 2022",
    title: "Matariki observed as a public holiday",
    text: "New Zealand marked its first public holiday for Matariki, the Māori New Year. Prime Minister Jacinda Ardern called making it a holiday a historic milestone.", imp: 3,
    cites: [{ t: "In photos: Nation shines with first Matariki holiday celebrations — RNZ", u: "https://www.rnz.co.nz/news/national/469730/in-photos-nation-shines-with-first-matariki-holiday-celebrations", k: "news" }, W("Matariki", "Matariki")] },

  // ---- New Zealand ----
  { id: "w111-battle-of-crete-nz", branch: "new-zealand", y: 1941.382, end: 1941.415, when: "May 20 – June 1, 1941",
    title: "New Zealand Division fights on Crete",
    text: "New Zealanders under General Freyberg held the largest defended area, from Maleme to Canea and Suda, against the German airborne invasion. After the Germans captured Maleme airfield and flew in reinforcements, the Allies were driven east and evacuated.", imp: 2,
    cites: [{ t: "Crete, Kreta: the battles of May 1941 — Australian War Memorial", u: "https://www.awm.gov.au/articles/atwar/crete", k: "museum" }, W("Battle_of_Crete", "Battle of Crete")] },
  { id: "w111-scott-base", branch: "new-zealand", y: 1957.053, when: "January 20, 1957",
    title: "Scott Base opens in Antarctica",
    text: "New Zealand's permanent Antarctic research station was opened on Ross Island to support the Commonwealth Trans-Antarctic Expedition, in which Edmund Hillary's party took part.", imp: 3,
    cites: [{ t: "January 1957 and 1958: This month last century — Te Papa blog", u: "https://blog.tepapa.govt.nz/2011/01/25/this-month-last-century-3/", k: "museum" }, W("Scott_Base", "Scott Base")] },
  { id: "w111-harbour-bridge", branch: "new-zealand", y: 1959.41, when: "May 30, 1959",
    title: "Auckland Harbour Bridge opens",
    text: "The 1.2 km bridge linked Auckland to the North Shore, which had been reachable only by ferry or a 50 km drive. Its opening spurred suburban growth north of the harbor.", imp: 3,
    cites: [{ t: "Auckland Harbour Bridge turns 60 today — RNZ", u: "https://www.rnz.co.nz/news/national/390870/auckland-harbour-bridge-turns-60-today", k: "news" }, W("Auckland_Harbour_Bridge", "Auckland Harbour Bridge")] },
  { id: "w111-save-manapouri", branch: "new-zealand", y: 1970.4, when: "1970",
    title: "Save Manapouri petition",
    text: "About 265,000 New Zealanders, nearly a tenth of the population, signed a petition against raising Lake Manapouri for a hydro scheme. It was part of one of the country's longest environmental campaigns.", imp: 2,
    cites: [{ t: "Manapōuri Power Station — Engineering New Zealand Heritage Register", u: "https://www.engineeringnz.org/programmes/heritage/heritage-register/manapouri-power-station/", k: "reference" }, W("Save_Manapouri_campaign", "Save Manapouri campaign")] },
  { id: "w111-springbok-tour", branch: "new-zealand", y: 1981.555, end: 1981.697, when: "July 22 – September 12, 1981",
    title: "Springbok tour divides New Zealand",
    text: "Protests against the apartheid-era rugby tour brought violent clashes in a normally peaceful country. A match was abandoned at Hamilton, and a Cessna dropped flour bombs on the final Test at Eden Park.", imp: 2,
    cites: [{ t: "The flour-bomb Test: When apartheid, protest and rugby mixed in New Zealand — The National", u: "https://www.thenationalnews.com/sport/the-flour-bomb-test-when-apartheid-protest-and-rugby-mixed-in-new-zealand-1.232069", k: "news" }, W("1981_Springbok_tour", "1981 Springbok tour")] },
  { id: "w111-rugby-world-cup-1987", branch: "new-zealand", y: 1987.466, when: "June 20, 1987",
    title: "All Blacks win the first Rugby World Cup",
    text: "New Zealand beat France 29–9 at Eden Park in the first Rugby World Cup, and captain David Kirk raised the Webb Ellis Cup.", imp: 2,
    cites: [{ t: "New Zealand 29-9 France — World Rugby", u: "https://www.world.rugby/news/21967/final-moments-1987", k: "primary" }, { t: "RWC #29: All Blacks beat France to conquer the world in 1987 — The Irish Times", u: "https://www.irishtimes.com/sport/rugby/international/rwc-29-all-blacks-beat-france-to-conquer-the-world-in-1987-1.2324168", k: "news" }] },
  { id: "w111-the-piano-palme", branch: "new-zealand", y: 1993.39, when: "May 1993",
    title: "The Piano wins the Palme d'Or",
    text: "Jane Campion's film, set in colonial New Zealand, shared the Palme d'Or at Cannes, making her the first woman to win it. It later won three Oscars.", imp: 2,
    cites: [{ t: "The Piano — NZ On Screen", u: "https://www.nzonscreen.com/title/the-piano-1993", k: "museum" }, { t: "Film Notes: The Piano — Yale University Library", u: "https://web.library.yale.edu/film/notes/fn00007", k: "reference" }, W("The_Piano", "The Piano")] },
  { id: "w111-mmp-referendum", branch: "new-zealand", y: 1993.848, when: "November 6, 1993",
    title: "Voters choose proportional representation",
    text: "In a referendum held with the general election, New Zealanders chose Mixed Member Proportional voting over first-past-the-post, 54 to 46 percent. MMP gives smaller parties seats in proportion to their votes.", imp: 2,
    cites: [{ t: "Kiwis Are in Quandary Over Election Results — Christian Science Monitor", u: "https://www.csmonitor.com/layout/set/amphtml/1993/1108/08021.html", k: "news" }] },
  { id: "w111-te-papa-opens", branch: "new-zealand", y: 1998.122, when: "February 14, 1998",
    title: "Te Papa opens in Wellington",
    text: "The Museum of New Zealand Te Papa Tongarewa opened on Wellington's waterfront with a bicultural approach, housing the national art collection and Māori taonga.", imp: 3,
    cites: [{ t: "Our history — Te Papa", u: "https://www.tepapa.govt.nz/about/our-history", k: "museum" }, W("Te_Papa", "Te Papa")] },

  // ---- Polynesians ----
  { id: "w111-black-saturday-apia", branch: "polynesians", y: 1929.99, when: "December 28, 1929",
    title: "Black Saturday in Apia",
    text: "New Zealand military police fired on a Mau procession in Apia, killing 11 Samoans. Mau leader Tupua Tamasese Lealofi III was mortally wounded and died the next day.", imp: 2, link: "new-zealand",
    cites: [{ t: "Today in History: 28 December 1929 Black Saturday — Samoa Global News", u: "https://samoaglobalnews.com/today-in-history-28-december-1929-black-saturday-samoa/", k: "news" }, W("Mau_movement", "Mau movement"), W("Tupua_Tamasese_Lealofi_III", "Tupua Tamasese Lealofi III")] },
  { id: "w111-hawaii-calls", branch: "polynesians", y: 1935.503, when: "July 3, 1935",
    title: "Hawaii Calls begins broadcasting from Waikiki",
    text: "Webley Edwards's live radio program, running to 1975, carried Hawaiian music and the sound of the surf to 750 stations at its peak. It changed how listeners saw the islands.", imp: 3,
    cites: [{ t: "Webley Edwards' 'Hawaii Calls' radio show changed how people saw the islands — Honolulu Star-Advertiser", u: "https://www.staradvertiser.com/2020/04/24/hawaii-news/rearview-mirror/rearview-mirror-webley-edwards-hawaii-calls-radio-show-changed-how-people-saw-the-islands/", k: "news" }, W("Hawaii_Calls", "Hawaii Calls")] },
  { id: "w111-kon-tiki", branch: "polynesians", y: 1947.599, when: "August 7, 1947",
    title: "Kon-Tiki raft reaches the Tuamotus",
    text: "Thor Heyerdahl's balsa raft drifted 101 days from Peru to Raroia, to support his idea that Polynesia was settled from South America. Later scholarship favored an Asian origin.", imp: 3,
    cites: [{ t: "Thor Heyerdahl — Encyclopaedia Britannica", u: "https://www.britannica.com/biography/Thor-Heyerdahl", k: "reference" }, W("Kon-Tiki_expedition", "Kon-Tiki expedition")] },
  { id: "w111-samoa-independence", branch: "polynesians", y: 1962.001, when: "January 1, 1962",
    title: "Western Samoa becomes independent",
    text: "After German, then New Zealand, rule, Western Samoa became the first small island country in the Pacific to gain independence. The United States recognized it the same day.", imp: 2, link: "new-zealand",
    cites: [{ t: "Samoa — Office of the Historian", u: "https://history.state.gov/countries/samoa", k: "primary" }, W("Western_Samoa", "Western Samoa")] },
  { id: "w111-cook-islands-self-government", branch: "polynesians", y: 1965.59, when: "August 4, 1965",
    title: "Cook Islands become self-governing",
    text: "After a 1965 election won by Albert Henry's party, a written constitution took effect and the Cook Islands became self-governing in free association with New Zealand. Most Cook Islanders hold New Zealand citizenship.", imp: 3, link: "new-zealand",
    cites: [{ t: "60 Years Strong: Celebrating the Cook Islands journey of self-governance — Cook Islands Investment Corp.", u: "https://www.ciic.gov.ck/60years-strong-celebrating-the-cook-islands-journey-of-self-governance-and-sovereignty/", k: "primary" }, { t: "About Cook Islands — RNZ", u: "https://www.rnz.co.nz/collections/nff-cook/about-cook-islands", k: "news" }, W("Cook_Islands", "Cook Islands")] },
  { id: "w111-moruroa-first-test", branch: "polynesians", y: 1966.5, when: "July 2, 1966",
    title: "France begins nuclear tests at Moruroa",
    text: "A plutonium fission bomb codenamed Aldebaran began three decades of French nuclear testing at Moruroa in French Polynesia, which left health and environmental harms and drew protest.", imp: 2,
    cites: [{ t: "The battle continues, 50 years after first test at Mururoa — RNZ", u: "https://www.rnz.co.nz/international/pacific-news/307804/the-battle-continues,-50-years-after-first-test-at-mururoa", k: "news" }, W("Moruroa", "Moruroa")] },
  { id: "w111-tonga-protectorate-ends", branch: "polynesians", y: 1970.423, when: "June 4, 1970",
    title: "Tonga ends British protection",
    text: "Tonga withdrew from its 1900 protectorate agreement with Britain and became a fully independent monarchy in the Commonwealth, having never lost its monarchy under British protection.", imp: 2,
    cites: [{ t: "Tonga — Office of the Historian", u: "https://history.state.gov/countries/tonga", k: "primary" }, { t: "Tonga: a brief history — RNZ", u: "https://www.rnz.co.nz/collections/nff-tonga/about-tonga", k: "news" }] },
  { id: "w111-hokulea-tahiti-1976", branch: "polynesians", y: 1976.332, end: 1976.424, when: "May 1 – June 4, 1976",
    title: "Hōkūleʻa sails from Hawaiʻi to Tahiti",
    text: "Navigated by Mau Piailug without instruments, the canoe sailed from Hawaiʻi to Tahiti. Over half of Tahiti's people greeted it, and the voyage sparked a renaissance of Polynesian voyaging and canoe building.", imp: 1,
    cites: [{ t: "Hōkūleʻa history — Polynesian Voyaging Society", u: "https://hokulea.com/history", k: "primary" }, { t: "Mau Piailug — Encyclopaedia Britannica", u: "https://www.britannica.com/biography/Mau-Piailug", k: "reference" }, W("H%C5%8Dk%C5%ABle%CA%BBa", "Hōkūleʻa")] },
  { id: "w111-punana-leo", branch: "polynesians", y: 1984.6, when: "August 1984",
    title: "First Hawaiian-language preschool opens",
    text: "After educators formed ʻAha Pūnana Leo in 1983, the first Hawaiian immersion preschool opened at Kekaha, Kauaʻi. Spreading to Hilo and Honolulu in 1985, it led the revival of the Hawaiian language.", imp: 2,
    cites: [{ t: "Our History — ʻAha Pūnana Leo", u: "https://ahapunanaleo.org/history-hl-1", k: "primary" }, W("P%C5%ABnana_Leo", "Pūnana Leo")] },
  { id: "w111-rarotonga-treaty", branch: "polynesians", y: 1985.596, when: "August 6, 1985",
    title: "South Pacific Nuclear Free Zone Treaty opens for signature",
    text: "The Treaty of Rarotonga opened for signature in the Cook Islands, with parties pledging never to develop or test nuclear weapons. It grew out of regional opposition to French testing at Moruroa.", imp: 2,
    cites: [{ t: "The South Pacific Nuclear Free Zone Treaty: 35 years on — Devpolicy Blog (Australian National University)", u: "https://devpolicy.org/the-south-pacific-nuclear-free-zone-treaty-35-years-on-20210122-2/", k: "reference" }, W("Treaty_of_Rarotonga", "Treaty of Rarotonga")] },
  { id: "w111-apology-resolution", branch: "polynesians", y: 1993.894, when: "November 23, 1993",
    title: "US apologizes for overthrow of Hawaiian Kingdom",
    text: "On the centennial of the 1893 overthrow, Congress passed Public Law 103-150, apologizing to Native Hawaiians. It states that it does not settle any claims against the United States.", imp: 2,
    cites: [{ t: "Public Law 103-150 — Wikisource", u: "https://en.wikisource.org/wiki/Public_Law_103-150", k: "primary" }, W("Apology_Resolution", "Apology Resolution")] },
  { id: "w111-papeete-riots", branch: "polynesians", y: 1995.68, when: "September 6–7, 1995",
    title: "Riots in Papeete over French nuclear tests",
    text: "After France detonated a nuclear device at Moruroa, rioters burned part of Tahiti's airport and looted shops in Papeete over two days.", imp: 2,
    cites: [{ t: "Tahiti calm but uneasy after two days of rioting — The Spokesman-Review (AP)", u: "https://www.spokesman.com/stories/1995/sep/09/tahiti-calm-but-uneasy-after-two-days-of-rioting", k: "news" }] },
  { id: "w111-rice-v-cayetano", branch: "polynesians", y: 2000.146, when: "February 23, 2000",
    title: "Supreme Court strikes Hawaiian-ancestry voting rule",
    text: "In Rice v. Cayetano the US Supreme Court ruled that limiting votes for Office of Hawaiian Affairs trustees to descendants of Hawaii's pre-1778 inhabitants violated the Fifteenth Amendment, a landmark in Hawaiian rights debates.", imp: 3,
    cites: [{ t: "Rice v. Cayetano, 528 U.S. 495 (2000) — Cornell Legal Information Institute", u: "https://www.law.cornell.edu/supct/html/98-818.ZO.html", k: "primary" }, W("Rice_v._Cayetano", "Rice v. Cayetano")] },
  { id: "w111-samoa-tsunami-2009", branch: "polynesians", y: 2009.744, when: "September 29, 2009",
    title: "Tsunami hits Samoa, American Samoa and Tonga",
    text: "Two large earthquakes between Samoa and American Samoa sent waves up to 22 meters high ashore, killing about 190 people, most of them in Samoa.", imp: 2,
    cites: [{ t: "On This Day: 2009 Samoa Islands Tsunami — NOAA NCEI", u: "https://www.ncei.noaa.gov/news/2009-Samoa-Tsunami", k: "data" }] },
  { id: "w111-tonga-election-2010", branch: "polynesians", y: 2010.899, when: "November 25, 2010",
    title: "Tonga elects its first commoner-majority parliament",
    text: "After 2010 reforms raised elected people's representatives from nine to 17 against nine nobles, voters chose a legislature in which commoners elected a majority.", imp: 2,
    cites: [{ t: "Tongans vote out 71% of their parliamentarians — International IDEA", u: "https://idea.int/news/tongans-vote-out-71-cent-their-parliamentarians", k: "reference" }, W("2010_Tongan_general_election", "2010 Tongan general election")] },
  { id: "w111-malama-honua-voyage", branch: "polynesians", y: 2014.37, end: 2017.458, when: "May 2014 – June 17, 2017",
    title: "Hōkūleʻa circles the globe",
    text: "The Polynesian Voyaging Society's Mālama Honua voyage took Hōkūleʻa around the world using traditional navigation, ending with a homecoming at Magic Island, Oʻahu, attended by tens of thousands.", imp: 2,
    cites: [{ t: "06/17/17 Massive Effort Results in Safe and Fun Hōkūleʻa Homecoming — Hawaiʻi DLNR", u: "https://dlnr.hawaii.gov/?p=12070", k: "primary" }, { t: "Hōkūleʻa Returns Home — Polynesian Voyaging Society", u: "https://worldwidevoyage.hokulea.com/hokulea-returns-home/", k: "primary" }, W("H%C5%8Dk%C5%ABle%CA%BBa", "Hōkūleʻa")] },
  { id: "w111-mauna-kea-protest", branch: "polynesians", y: 2019.54, when: "July 17, 2019",
    title: "Kūpuna arrested at Mauna Kea telescope protest",
    text: "Police arrested 33 people, including Native Hawaiian elders, who blocked the access road to the Thirty Meter Telescope site on Mauna Kea, a mountain sacred to Native Hawaiians. About 1,000 gathered.", imp: 2,
    cites: [{ t: "Native Hawaiian Elders Arrested in Telescope Protest at Mauna Kea — Colorlines", u: "https://colorlines.com/articles/native-hawaiian-elders-arrested-telescope-protest-mauna-kea", k: "news" }, { t: "Latest Developments On TMT Protests At Mauna Kea — Hawaiʻi Public Radio", u: "https://www.hawaiipublicradio.org/hawaii-island/2019-07-17/latest-developments-on-tmt-protests-at-mauna-kea", k: "news" }] },
  { id: "w111-samoa-measles", branch: "polynesians", y: 2019.871, when: "November 2019",
    title: "Measles epidemic grips Samoa",
    text: "With only about 31 percent of Samoans vaccinated beforehand, a measles outbreak led the government to declare a state of emergency on November 15. By December 2 it had killed 53 people, 48 of them young children.", imp: 3,
    cites: [{ t: "News Note 1: Pacific Measles Outbreak — UNICEF", u: "https://www.unicef.org/pacificislands/press-releases/news-note-1-pacific-measles-outbreak", k: "primary" }, { t: "Samoan Government To Close Its Offices Amid Measles Crisis — NPR", u: "https://www.npr.org/2019/12/02/784179707/samoan-government-to-close-its-offices-amid-measles-crisis-that-has-left-53-dead", k: "news" }] },
  { id: "w111-hunga-tonga-eruption", branch: "polynesians", y: 2022.04, when: "January 15, 2022",
    title: "Hunga Tonga–Hunga Haʻapai erupts",
    text: "A huge explosive eruption about 40 miles north of Tongatapu sent atmospheric shock waves around the world and a tsunami that did significant damage along Tongatapu's western coast.", imp: 2,
    cites: [{ t: "Recent significant tsunami events — NOAA NCEI", u: "https://www.ncei.noaa.gov/products/natural-hazards/tsunamis-earthquakes-volcanoes/tsunamis/recent-significant-events", k: "data" }, { t: "The Hunga Tonga-Hunga Ha'apai Eruption, a Multi-Hazard Event — NOAA NESDIS", u: "https://www.nesdis.noaa.gov/news/the-hunga-tonga-hunga-haapai-eruption-multi-hazard-event", k: "data" }] },
] });

TL.geo("w111-maori-language-petition", { scope: "place", lat: -41.29, lon: 174.78, r: 40, label: "Wellington", src: "https://en.wikipedia.org/wiki/Wellington" });
TL.geo("w111-maori-land-march", { scope: "region", lat: -39, lon: 176, r: 600, label: "North Island, Te Hāpua to Wellington", src: "https://en.wikipedia.org/wiki/North_Island" });
TL.geo("w111-waitangi-tribunal", { scope: "place", lat: -41.29, lon: 174.78, r: 40, label: "Wellington", src: "https://en.wikipedia.org/wiki/Wellington" });
TL.geo("w111-bastion-point", { scope: "place", lat: -36.84, lon: 174.82, r: 30, label: "Bastion Point, Auckland", src: "https://en.wikipedia.org/wiki/Bastion_Point" });
TL.geo("w111-kohanga-reo", { scope: "place", lat: -41.26, lon: 174.95, r: 30, label: "Wainuiomata", src: "https://en.wikipedia.org/wiki/Wainuiomata" });
TL.geo("w111-bone-people-booker", { scope: "region", lat: -42, lon: 173, r: 800, label: "New Zealand", src: "https://en.wikipedia.org/wiki/New_Zealand" });
TL.geo("w111-maori-language-act", { scope: "place", lat: -41.29, lon: 174.78, r: 40, label: "Wellington", src: "https://en.wikipedia.org/wiki/Wellington" });
TL.geo("w111-sealord-deal", { scope: "region", lat: -42, lon: 173, r: 800, label: "New Zealand", src: "https://en.wikipedia.org/wiki/New_Zealand" });
TL.geo("w111-once-were-warriors", { scope: "place", lat: -36.85, lon: 174.76, r: 40, label: "Auckland", src: "https://en.wikipedia.org/wiki/Auckland" });
TL.geo("w111-waikato-tainui-settlement", { scope: "place", lat: -37.67, lon: 175.15, r: 30, label: "Ngāruawāhia, Waikato", src: "https://en.wikipedia.org/wiki/Ng%C4%81ruaw%C4%81hia" });
TL.geo("w111-maori-television", { scope: "place", lat: -36.85, lon: 174.76, r: 40, label: "Auckland", src: "https://en.wikipedia.org/wiki/Auckland" });
TL.geo("w111-undrip-endorsed", { scope: "place", lat: 40.71, lon: -74.01, r: 40, label: "New York City", src: "https://en.wikipedia.org/wiki/New_York_City" });
TL.geo("w111-whanganui-legal-person", { scope: "region", lat: -39.95, lon: 174.99, r: 120, label: "Whanganui River", src: "https://en.wikipedia.org/wiki/Whanganui_River" });
TL.geo("w111-matariki-holiday", { scope: "region", lat: -42, lon: 173, r: 800, label: "New Zealand", src: "https://en.wikipedia.org/wiki/New_Zealand" });
TL.geo("w111-battle-of-crete-nz", { scope: "place", lat: 35.52, lon: 23.84, r: 60, label: "Maleme, Crete", src: "https://en.wikipedia.org/wiki/Maleme" });
TL.geo("w111-scott-base", { scope: "place", lat: -77.85, lon: 166.77, r: 40, label: "Ross Island, Antarctica", src: "https://en.wikipedia.org/wiki/Scott_Base" });
TL.geo("w111-harbour-bridge", { scope: "place", lat: -36.83, lon: 174.75, r: 30, label: "Auckland Harbour Bridge", src: "https://en.wikipedia.org/wiki/Auckland_Harbour_Bridge" });
TL.geo("w111-save-manapouri", { scope: "place", lat: -45.5, lon: 167.5, r: 60, label: "Lake Manapouri", src: "https://en.wikipedia.org/wiki/Lake_Manapouri" });
TL.geo("w111-springbok-tour", { scope: "region", lat: -42, lon: 173, r: 800, label: "New Zealand", src: "https://en.wikipedia.org/wiki/New_Zealand" });
TL.geo("w111-rugby-world-cup-1987", { scope: "place", lat: -36.88, lon: 174.74, r: 30, label: "Eden Park, Auckland", src: "https://en.wikipedia.org/wiki/Eden_Park" });
TL.geo("w111-the-piano-palme", { scope: "place", lat: 43.55, lon: 7.01, r: 30, label: "Cannes, France", src: "https://en.wikipedia.org/wiki/Cannes" });
TL.geo("w111-mmp-referendum", { scope: "region", lat: -42, lon: 173, r: 800, label: "New Zealand", src: "https://en.wikipedia.org/wiki/New_Zealand" });
TL.geo("w111-te-papa-opens", { scope: "place", lat: -41.29, lon: 174.78, r: 40, label: "Wellington", src: "https://en.wikipedia.org/wiki/Wellington" });
TL.geo("w111-black-saturday-apia", { scope: "place", lat: -13.83, lon: -171.75, r: 30, label: "Apia, Samoa", src: "https://en.wikipedia.org/wiki/Apia" });
TL.geo("w111-hawaii-calls", { scope: "place", lat: 21.28, lon: -157.83, r: 30, label: "Waikiki, Honolulu", src: "https://en.wikipedia.org/wiki/Waikiki" });
TL.geo("w111-kon-tiki", { scope: "place", lat: -16.02, lon: -142.43, r: 60, label: "Raroia, Tuamotus", src: "https://en.wikipedia.org/wiki/Raroia" });
TL.geo("w111-samoa-independence", { scope: "region", lat: -13.74, lon: -172.22, r: 200, label: "Samoa", src: "https://en.wikipedia.org/wiki/Samoa" });
TL.geo("w111-cook-islands-self-government", { scope: "region", lat: -21.2, lon: -159.8, r: 600, label: "Cook Islands", src: "https://en.wikipedia.org/wiki/Cook_Islands" });
TL.geo("w111-moruroa-first-test", { scope: "place", lat: -21.83, lon: -138.83, r: 60, label: "Moruroa atoll", src: "https://en.wikipedia.org/wiki/Moruroa" });
TL.geo("w111-tonga-protectorate-ends", { scope: "region", lat: -20, lon: -175, r: 300, label: "Tonga", src: "https://en.wikipedia.org/wiki/Tonga" });
TL.geo("w111-hokulea-tahiti-1976", { scope: "region", lat: -17.54, lon: -149.57, r: 4500, label: "Hawaiʻi to Tahiti", src: "https://en.wikipedia.org/wiki/Papeete" });
TL.geo("w111-punana-leo", { scope: "place", lat: 21.97, lon: -159.72, r: 30, label: "Kekaha, Kauaʻi", src: "https://en.wikipedia.org/wiki/Kekaha,_Hawaii" });
TL.geo("w111-rarotonga-treaty", { scope: "place", lat: -21.23, lon: -159.78, r: 40, label: "Rarotonga, Cook Islands", src: "https://en.wikipedia.org/wiki/Rarotonga" });
TL.geo("w111-apology-resolution", { scope: "place", lat: 21.31, lon: -157.86, r: 30, label: "ʻIolani Palace, Honolulu", src: "https://en.wikipedia.org/wiki/%CA%BBIolani_Palace" });
TL.geo("w111-papeete-riots", { scope: "place", lat: -17.54, lon: -149.57, r: 30, label: "Papeete, Tahiti", src: "https://en.wikipedia.org/wiki/Papeete" });
TL.geo("w111-rice-v-cayetano", { scope: "region", lat: 21.5, lon: -158, r: 400, label: "Hawaiʻi", src: "https://en.wikipedia.org/wiki/Hawaii" });
TL.geo("w111-samoa-tsunami-2009", { scope: "region", lat: -13.74, lon: -172.22, r: 300, label: "Samoa and American Samoa", src: "https://en.wikipedia.org/wiki/Samoa" });
TL.geo("w111-tonga-election-2010", { scope: "place", lat: -21.13, lon: -175.2, r: 30, label: "Nukuʻalofa, Tonga", src: "https://en.wikipedia.org/wiki/Nuku%CA%BBalofa" });
TL.geo("w111-malama-honua-voyage", { scope: "global" });
TL.geo("w111-mauna-kea-protest", { scope: "place", lat: 19.82, lon: -155.47, r: 40, label: "Mauna Kea, Hawaiʻi", src: "https://en.wikipedia.org/wiki/Mauna_Kea" });
TL.geo("w111-samoa-measles", { scope: "region", lat: -13.74, lon: -172.22, r: 200, label: "Samoa", src: "https://en.wikipedia.org/wiki/Samoa" });
TL.geo("w111-hunga-tonga-eruption", { scope: "place", lat: -20.55, lon: -175.39, r: 60, label: "Hunga Tonga–Hunga Haʻapai", src: "https://en.wikipedia.org/wiki/Hunga_Tonga%E2%80%93Hunga_Ha%CA%BBapai" });
