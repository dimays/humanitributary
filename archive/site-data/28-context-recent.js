// "Why it matters" context and cross-links: recent history (1979–2023).
// TL.enrich(id, { why, connections: [{ id, note }], cites }); see SCHEMA.md, "Context: why it matters, and connections".

TL.enrich("mx-soviet-afghan-war", {
  why: "The invasion led President Carter to announce a doctrine vowing to protect Middle Eastern oil supplies from Soviet power, impose sanctions and trade embargoes, call a boycott of the 1980 Moscow Olympics and step up aid to Afghan insurgents. Scholars cite the costly war, sometimes called “the Soviet Union's Vietnam,” as a significant factor in the USSR's dissolution. Millions of Afghans fled, mostly to Pakistan and Iran; after the withdrawal the fighting became the first Afghan civil war, and the Office of the Historian notes that the Taliban later took power and gave Osama bin Laden a base.",
  connections: [
    { id: "ussr", note: "Scholars cite the war as a significant factor in the Soviet Union's dissolution" },
    { id: "mx-us-invades-afghanistan", note: "The Taliban who later took power gave al-Qaeda sanctuary" },
  ],
  cites: [
    { t: "The Soviet Invasion of Afghanistan and the U.S. Response, 1978–1980 — Office of the Historian", u: "https://history.state.gov/milestones/1977-1980/soviet-invasion-afghanistan", k: "archive" },
    { t: "Soviet–Afghan War — Wikipedia", u: "https://en.wikipedia.org/wiki/Soviet%E2%80%93Afghan_War" },
  ],
});

TL.enrich("g7-smallpox-eradicated", {
  why: "Smallpox had existed for at least 3,000 years, killed up to 30% of those infected and caused millions of deaths. WHO's intensified program, launched in 1967, combined widespread immunization with surveillance, and WHO calls its success among the most notable and profound public health successes in history. It remains the only infectious disease ever eradicated, though small stocks of live virus are still kept in two secure laboratories, in the United States and Russia, and WHO holds an emergency vaccine stockpile in case the disease re-emerges.",
  connections: [
  ],
  cites: [
    { t: "Smallpox — WHO health topics", u: "https://www.who.int/health-topics/smallpox", k: "reference" },
  ],
});

TL.enrich("hiv-aids", {
  why: "The 1981 report was the first official record of an epidemic that WHO says has since claimed an estimated 44.2 million lives; about 41 million people were living with HIV at the end of 2025, 64% of them in WHO's African Region. The first AIDS drug, AZT, was approved in 1987. There is still no cure, but prevention, diagnosis and treatment have made HIV infection a manageable chronic condition, and WHO, UNAIDS and the Global Fund aim to end the epidemic by 2030.",
  connections: [
    { id: "g7-hiv-discovered", note: "French scientists reported the retrovirus that causes AIDS in 1983" },
    { id: "g7-sdgs", note: "Ending the HIV epidemic by 2030 is part of Sustainable Development Goal 3.3" },
  ],
  cites: [
    { t: "HIV and AIDS — WHO fact sheet", u: "https://www.who.int/news-room/fact-sheets/detail/hiv-aids", k: "reference" },
    { t: "A Timeline of HIV and AIDS — HIV.gov", u: "https://www.hiv.gov/hiv-basics/overview/history/hiv-and-aids-timeline", k: "reference" },
  ],
});

TL.enrich("g7-web-proposal", {
  why: "Berners-Lee designed the Web so that scientists in universities and institutes around the world could share information automatically. After he announced the software in August 1991, interest spread beyond physics; CERN's release of it into the public domain in 1993, and then under an open licence, let it flourish. By late 1993 there were over 500 known web servers carrying about 1% of internet traffic, and by the end of 1994 there were 10,000 servers and 10 million users.",
  connections: [
    { id: "g7-web-public-domain", note: "CERN put the Web software in the public domain on April 30, 1993" },
  ],
  cites: [
    { t: "Web History — CERN (Web@30)", u: "https://web30.web.cern.ch/web-history.html", k: "reference" },
  ],
});

TL.enrich("st-tiananmen", {
  why: "The crackdown halted the political reforms begun in 1986 and curtailed political liberalization, while market-oriented economic reform continued and accelerated after Deng Xiaoping's 1992 southern tour. Western countries imposed arms embargoes, and the Office of the Historian says it “cooled U.S.-Chinese relations considerably.” The death toll is disputed: the government said over 200 were killed, while Western sources most often cite hundreds or even thousands. The events remain one of the most widely censored topics in China.",
  connections: [
    { id: "st-reform-opening", note: "Deng's economic reforms went on and accelerated after his 1992 southern tour" },
  ],
  cites: [
    { t: "Tiananmen Square, 1989 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1989-1992/tiananmen-square", k: "archive" },
    { t: "1989 Tiananmen Square protests and massacre — Wikipedia", u: "https://en.wikipedia.org/wiki/1989_Tiananmen_Square_protests_and_massacre" },
  ],
});

TL.enrich("g7-berlin-wall-falls", {
  why: "The Office of the Historian traces the wall's collapse to Gorbachev's decision to loosen Soviet control, and says it was followed by the overthrow of communist rule throughout Eastern Europe. It was the first critical step toward German reunification on October 3, 1990: Gorbachev accepted that a reunited Germany would join NATO, and Soviet forces left Germany in 1994. The Soviet Union itself dissolved in December 1991.",
  connections: [
    { id: "germany", note: "The first critical step toward reunification on October 3, 1990" },
    { id: "st-gorbachev", note: "Gorbachev's loosening of Soviet control led to the wall's collapse" },
  ],
  cites: [
    { t: "The Collapse of the Soviet Union — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1989-1992/collapse-soviet-union", k: "archive" },
    { t: "Fall of the Berlin Wall — Wikipedia", u: "https://en.wikipedia.org/wiki/Fall_of_the_Berlin_Wall" },
  ],
});

TL.enrich("baltic-states", {
  why: "The Soviet army occupied all three states in June 1940 under a secret protocol of the Molotov–Ribbentrop Pact, but the United States and most Western democracies never considered them part of the Soviet Union; the US held that its diplomatic relations with Estonia continued uninterrupted. Each state therefore presents itself as a restoration of the republic of 1918–1940, regained after the civil resistance of the Singing Revolution. All three joined NATO and the EU in 2004 and adopted the euro in 2011–2015, while the integration of large Russian-speaking minorities, settled under Soviet rule, remains a major factor in their affairs.",
  connections: [
    { id: "st-baltic-way", note: "About two million people formed a 600 km human chain in 1989" },
    { id: "st-enlargement-2004", note: "All three joined the European Union on May 1, 2004" },
  ],
  cites: [
    { t: "Estonia — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/estonia", k: "archive" },
    { t: "Baltic states — Wikipedia", u: "https://en.wikipedia.org/wiki/Baltic_states" },
  ],
});

TL.enrich("mx-gulf-war", {
  why: "The coalition acted through the UN Security Council, and the war ended in Iraq's defeat and retreat from Kuwait. The Bush administration chose not to push on to Baghdad, which drew criticism; Saddam Hussein's forces then crushed Shiite and Kurdish uprisings in which an estimated 25,000 to 100,000 Iraqis died. UN sanctions and weapons inspections followed, as did no-fly zones, and the sanctions years brought hyperinflation, poverty and malnutrition. US troops stayed in Saudi Arabia, a presence that was one of the stated motivations for the September 11 attacks.",
  connections: [
    { id: "st-sept-11", note: "US troops left in Saudi Arabia were one of the attackers' stated motivations" },
    { id: "mx-iraq-invasion-2003", note: "Sanctions on Iraq lasted from 1991 until 2003" },
  ],
  cites: [
    { t: "The Gulf War, 1991 — Office of the Historian", u: "https://history.state.gov/milestones/1989-1992/gulf-war", k: "archive" },
    { t: "Gulf War — Wikipedia", u: "https://en.wikipedia.org/wiki/Gulf_War" },
  ],
});

TL.enrich("germany", {
  why: "Reunification ended Germany's Cold War division. Under the settlement the united country kept West Germany's seats in NATO, the European Community and the UN, recognized its border with Poland and made Berlin its capital; some European leaders worried that it made Germany a great power again. The merger was costly, an estimated 1.5 to 2 trillion euros for the federal government, and the east's rapid deindustrialization, blamed partly on the Treuhand privatization agency, brought unemployment double the western level. The lasting divide between east and west is often called the “wall in the head.”",
  connections: [
    { id: "g7-berlin-wall-falls", note: "The wall fell on 9 November 1989 during the Peaceful Revolution, before reunification" },
    { id: "nato", note: "Gorbachev agreed in 1990 that a united Germany could remain in NATO" },
  ],
  cites: [
    { t: "German reunification — Wikipedia", u: "https://en.wikipedia.org/wiki/German_reunification" },
    { t: "The Collapse of the Soviet Union — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1989-1992/collapse-soviet-union", k: "archive" },
  ],
});

TL.enrich("g7-human-genome-project", {
  why: "The 2003 sequence covered 92% of the human genome with fewer than 400 gaps; the Telomere-to-Telomere consortium produced the first truly complete sequence on March 31, 2022. The project's 20 centers in six countries made the data freely available with no restrictions on its use, and the number of known disease genes rose from fewer than 100 when it began to more than 1,400. It was also the first large scientific effort to fund research on its ethical, legal and social implications, which NHGRI calls a model for bioethics research worldwide.",
  connections: [],
  cites: [
    { t: "Human Genome Project Fact Sheet — National Human Genome Research Institute", u: "https://www.genome.gov/about-genomics/educational-resources/fact-sheets/human-genome-project", k: "reference" },
    { t: "International Consortium Completes Human Genome Project (14 April 2003) — NHGRI", u: "https://www.genome.gov/11006929/2003-release-international-consortium-completes-hgp", k: "primary" },
  ],
});

TL.enrich("mercosur", {
  why: "Mercosur grew out of a rapprochement between Brazil and Argentina, both just emerging from dictatorships, that began with the 1985 Iguaçu Declaration. It became a customs union with common duties on outside imports on January 1, 1995, and by one estimate ranks as the world's fifth-largest economy by purchasing power. After talks begun in 2000, the EU and Mercosur signed a partnership agreement and an interim trade agreement on January 17, 2026; the trade agreement has applied provisionally since May 1, 2026, while ratification continues.",
  connections: [
    { id: "eu", note: "The EU, Mercosur's second-largest goods partner, signed a trade deal with it in 2026" },
    { id: "brazil", note: "Grew out of Brazil and Argentina's rapprochement after their dictatorships" },
  ],
  cites: [
    { t: "EU trade relations with Mercosur — European Commission", u: "https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/mercosur_en", k: "primary" },
    { t: "Mercosur — Wikipedia", u: "https://en.wikipedia.org/wiki/Mercosur" },
  ],
});

TL.enrich("south-caucasus", {
  why: "As the Soviet Union weakened, the dispute over Nagorno-Karabakh, an Armenian-majority region of Soviet Azerbaijan, turned into war. By the 1994 ceasefire an estimated 28,000–38,000 people had been killed, about 353,000 Armenians had been displaced from Azerbaijan and about 500,000 Azerbaijanis from Armenia and Karabakh. Azerbaijan regained territory in a 2020 war and took the whole region in September 2023, after which more than 100,000 ethnic Armenians left within days. In August 2025 the two states reached a US-brokered peace agreement, though disputes over the return of displaced Armenians and a transit route remain.",
  connections: [
    { id: "st-karabakh-2023", note: "More than 100,000 Armenians fled after Azerbaijan's 2023 offensive" },
    { id: "st-armenia-azerbaijan-peace", note: "The US-brokered deal of August 2025 aimed to end the conflict" },
  ],
  cites: [
    { t: "Nagorno-Karabakh conflict — Wikipedia", u: "https://en.wikipedia.org/wiki/Nagorno-Karabakh_conflict" },
    { t: "UN Karabakh mission told ‘sudden’ exodus means as few as 50 ethnic Armenians may remain — UN News (October 2, 2023)", u: "https://news.un.org/en/story/2023/10/1141782", k: "news" },
  ],
});

TL.enrich("post-yugoslav-states", {
  why: "The wars that accompanied Yugoslavia's breakup, from 1991 to 2001, killed an estimated 130,000–140,000 people, displaced about four million and are often described as among Europe's deadliest conflicts since World War II; they included genocide, crimes against humanity and ethnic cleansing. In response the UN Security Council created the International Criminal Tribunal for the former Yugoslavia in May 1993. It charged over 160 people before closing in 2017, and says it “irreversibly changed the landscape of international humanitarian law” and proved that the Srebrenica killings were genocide.",
  connections: [
    { id: "st-srebrenica", note: "The tribunal established that the Srebrenica mass murder was genocide" },
    { id: "st-bosnian-war", note: "Atrocities in Bosnia and Croatia prompted the tribunal's creation" },
  ],
  cites: [
    { t: "About the ICTY — International Criminal Tribunal for the former Yugoslavia (UN)", u: "https://www.icty.org/en/about", k: "primary" },
    { t: "Yugoslav Wars — Wikipedia", u: "https://en.wikipedia.org/wiki/Yugoslav_Wars" },
  ],
});

TL.enrich("ukraine", {
  why: "At independence Ukraine held the world's third-largest nuclear stockpile, inherited from the USSR. Under the Budapest Memorandum of December 5, 1994, it joined the Non-Proliferation Treaty and gave up the weapons, while Russia, the United States and the United Kingdom pledged to respect its sovereignty and borders. The Orange Revolution of 2004–2005 and the Euromaidan protests of 2014 followed; Russia then annexed Crimea, which Ukraine protested as a violation of the memorandum, backed separatists in Donbas, and launched a full-scale invasion in 2022. That year Ukraine applied to join NATO, and it is negotiating to join the EU.",
  connections: [
    { id: "st-maidan", note: "The 2014 Euromaidan protests led to revolution" },
    { id: "st-crimea", note: "Ukraine protested Russia's 2014 annexation as violating the Budapest Memorandum" },
    { id: "st-invasion-2022", note: "The full-scale invasion began a new phase of the war" },
  ],
  cites: [
    { t: "Budapest Memorandum — Wikipedia", u: "https://en.wikipedia.org/wiki/Budapest_Memorandum" },
    { t: "Ukraine — Wikipedia", u: "https://en.wikipedia.org/wiki/Ukraine" },
    { t: "History of the EU, 2020 to today — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/2020-today_en" },
  ],
});

TL.enrich("belarus", {
  why: "Belarus kept several Soviet-era policies, including state ownership of large sections of the economy. Lukashenko, elected in the first post-independence election, heads a highly centralized authoritarian government, and the country ranks low on international measures of press freedom and civil liberties. Belarus gave up the Soviet nuclear weapons on its soil between 1993 and 1996, formed a Union State with Russia in 2000, and in 2022 Russia's invasion of Ukraine was launched partly from its territory.",
  connections: [
    { id: "st-invasion-2022", note: "Russia's 2022 invasion of Ukraine was launched partly from Belarus" },
    { id: "g7-chernobyl", note: "Soviet Belarus received about 70% of the Chernobyl fallout" },
  ],
  cites: [
    { t: "Belarus — Wikipedia", u: "https://en.wikipedia.org/wiki/Belarus" },
    { t: "Budapest Memorandum — Wikipedia", u: "https://en.wikipedia.org/wiki/Budapest_Memorandum" },
  ],
});

TL.enrich("st-belovezha", {
  why: "Gorbachev objected that the fate of a multinational state could not be decided by the leaders of three republics, but on December 21, 1991, eleven of the twelve remaining republics signed the Alma-Ata Protocol, and he resigned on December 25. The Office of the Historian says securing the former Soviet nuclear arsenal was of paramount US concern, noting that the Nunn–Lugar program, created in November 1991, funds dismantling weapons there. Some Russian politicians later cited the refusal to ratify the accords as a factor in Russia's 1993 constitutional crisis, and the CIS has since lost members: Georgia left in 2009, and Moldova voted in 2026 to denounce the accords.",
  connections: [
    { id: "russia", note: "Yeltsin was left as president of the new Russian state" },
  ],
  cites: [
    { t: "Belovezha Accords — Wikipedia", u: "https://en.wikipedia.org/wiki/Belovezha_Accords" },
    { t: "The Collapse of the Soviet Union — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1989-1992/collapse-soviet-union", k: "archive" },
  ],
});

TL.enrich("kazakhstan", {
  why: "Soviet authorities exploded 456 nuclear devices at Semipalatinsk over 40 years, and about a million people lived in its radiation zone; Nazarbayev signed the decree closing the site on August 29, 1991. Kazakhstan then gave up its nuclear capacity, joined the Non-Proliferation Treaty and later the nuclear weapons ban treaty, and at its initiative August 29 is the UN's International Day against Nuclear Tests. Its oil and gas industry gives it economic dominance in Central Asia, about 60% of the region's GDP, and despite reform efforts since 2019 its government is described as authoritarian.",
  connections: [
    { id: "g7-npt", note: "One of the first CIS republics to join the Non-Proliferation Treaty" },
    { id: "g7-tpnw", note: "Kazakhstan also joined the Treaty on the Prohibition of Nuclear Weapons" },
  ],
  cites: [
    { t: "UN News Special Report: ‘Ground Zero’ at the former Semipalatinsk nuclear test site in Kazakhstan — UN News", u: "https://news.un.org/en/story/2019/08/1045221", k: "news" },
    { t: "Kazakhstan — Wikipedia", u: "https://en.wikipedia.org/wiki/Kazakhstan" },
  ],
});

TL.enrich("russia", {
  why: "As the Soviet Union's successor, Russia kept its permanent seat on the UN Security Council and holds the world's largest stockpile of nuclear weapons. A constitutional crisis in 1993 ended with a new constitution creating a semi-presidential republic. Since the turn of the century its politics have been dominated by Vladimir Putin, under whom it has undergone democratic backsliding and become an authoritarian regime; it fought Georgia in 2008, annexed Crimea in 2014 without international recognition, and invaded Ukraine in 2022.",
  connections: [
    { id: "st-putin", note: "Putin has dominated Russian politics since the turn of the century" },
    { id: "st-georgia-war", note: "Russia's 2008 war with Georgia" },
    { id: "st-crimea", note: "The internationally unrecognized annexation of Crimea in 2014" },
  ],
  cites: [
    { t: "Russia — Wikipedia", u: "https://en.wikipedia.org/wiki/Russia" },
    { t: "The Collapse of the Soviet Union — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1989-1992/collapse-soviet-union", k: "archive" },
  ],
});

TL.enrich("st-maastricht", {
  why: "The treaty announced “a new stage in the process of European integration”: it introduced shared European citizenship, provided for a single currency, added common foreign and security policies, strengthened the European Parliament and widened majority voting among ministers. Many saw it as a step toward a federal Europe, but key areas stayed intergovernmental. Its “Maastricht criteria” for joining the currency union became central in the eurozone debt crisis from 2009, and later treaties, ending with Lisbon in 2007, built on it.",
  connections: [
    { id: "st-euro", note: "The treaty set the rules for the future single currency" },
    { id: "eu", note: "The treaty officially created the European Union" },
  ],
  cites: [
    { t: "History of the EU, 1990–99 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1990-99_en" },
    { t: "Maastricht Treaty — Wikipedia", u: "https://en.wikipedia.org/wiki/Maastricht_Treaty" },
  ],
});

TL.enrich("st-bosnian-war", {
  why: "Estimates suggest over 100,000 people were killed and over 2.2 million displaced, at the time the most violent conflict in Europe since World War II. Bosnian Serb forces seized about 70% of the country in a campaign of ethnic cleansing of Bosniaks and Bosnian Croats, and the UN tribunal for the former Yugoslavia established that the massacre of over 8,000 Bosniak males at Srebrenica was genocide. NATO's 1995 Operation Deliberate Force helped end the war, and the Dayton Agreement divided Bosnia into two entities under an international High Representative.",
  connections: [
    { id: "st-srebrenica", note: "The massacre at Srebrenica was ruled a genocide" },
    { id: "st-dayton", note: "The agreement that ended the war and divided Bosnia into two entities" },
  ],
  cites: [
    { t: "Bosnian War — Wikipedia", u: "https://en.wikipedia.org/wiki/Bosnian_War" },
    { t: "About the ICTY — International Criminal Tribunal for the former Yugoslavia (UN)", u: "https://www.icty.org/en/about", k: "primary" },
  ],
});

TL.enrich("g7-rio-unfccc", {
  why: "The summit, attended by 108 heads of state and government, helped spread the idea of sustainable development. Besides texts such as the Rio Declaration and Agenda 21, it opened two treaties: the climate convention, which aims to prevent “dangerous human interference with the climate system,” has 198 parties and paved the way for the Kyoto Protocol and the Paris Agreement; and the Convention on Biological Diversity, in force from December 29, 1993. Critics note that many Rio commitments, such as fighting poverty and cleaning up the environment, have not been realized.",
  connections: [
    { id: "g7-kyoto", note: "The climate convention paved the way for the Kyoto Protocol" },
    { id: "g7-paris-agreement", note: "And later for the Paris Agreement" },
  ],
  cites: [
    { t: "Earth Summit — Wikipedia", u: "https://en.wikipedia.org/wiki/Earth_Summit" },
    { t: "History of the Convention — Convention on Biological Diversity", u: "https://www.cbd.int/history/", k: "primary" },
  ],
});

TL.enrich("czech-republic", {
  why: "The split, called the Velvet Divorce after the bloodless Velvet Revolution of 1989, was peaceful, unlike the breakups of Yugoslavia and the Soviet Union. It was agreed by the leaders Václav Klaus and Vladimír Mečiar without a referendum, although in a September 1992 poll only 36% of Czechs and 37% of Slovaks favored it. The two states kept a customs union until both joined the EU on May 1, 2004, and relations stayed close: newly elected presidents customarily make their first official foreign visit to the other republic.",
  connections: [
    { id: "st-velvet-revolution", note: "The “Velvet Divorce” was named after the bloodless revolution of 1989" },
    { id: "st-enlargement-2004", note: "Both republics joined the EU on May 1, 2004" },
  ],
  cites: [
    { t: "Dissolution of Czechoslovakia — Wikipedia", u: "https://en.wikipedia.org/wiki/Dissolution_of_Czechoslovakia" },
    { t: "History of the EU, 2000–09 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/2000-09_en" },
  ],
});

TL.enrich("slovakia", {
  why: "Slovakia began independence as the poorer partner: in 1991 Czech GDP per capita was about 20% higher, and transfers from the Czech budget had ended that January, so as its economy struggled in early 1993 Slovaks called the split a “sandpaper divorce.” Slovakia joined the EU alongside the Czech Republic in 2004 and the Schengen Area in 2007, and on January 1, 2009, it adopted the euro, while the Czech Republic kept its koruna.",
  connections: [
    { id: "st-euro", note: "Slovakia adopted the euro on January 1, 2009" },
    { id: "st-enlargement-2004", note: "Slovakia joined the EU with the Czech Republic on May 1, 2004" },
  ],
  cites: [
    { t: "Dissolution of Czechoslovakia — Wikipedia", u: "https://en.wikipedia.org/wiki/Dissolution_of_Czechoslovakia" },
  ],
});

TL.enrich("eritrea", {
  why: "Some scholars expected that an OAU-approved secession would destabilize other African states, since colonial-era borders had been treated as settled; South Sudan is the only other African country to gain recognized independence since 1993. Relations with Ethiopia soon strained, and unresolved issues contributed to a 1998–2000 war that killed about 70,000. Isaias Afwerki has ruled since independence without national elections; Eritrea is described as a one-party dictatorship with one of the world's worst human rights records, which the government calls politically motivated. Indefinite national service is one reason people leave: about 507,300 Eritreans were refugees at the end of 2018.",
  connections: [
    { id: "st-eritrea-ethiopia-war", note: "Unresolved issues with Ethiopia contributed to the 1998–2000 war" },
    { id: "south-sudan", note: "The only other African state to win recognized independence since 1993" },
  ],
  cites: [
    { t: "1993 Eritrean independence referendum — Wikipedia", u: "https://en.wikipedia.org/wiki/1993_Eritrean_independence_referendum" },
    { t: "Eritrea — Wikipedia", u: "https://en.wikipedia.org/wiki/Eritrea" },
  ],
});

TL.enrich("st-oslo", {
  why: "Israel accepted the PLO as the representative of the Palestinians, and the PLO renounced terrorism and recognized Israel's right to exist. The accord created a Palestinian Authority for a five-year transition, with talks on borders, refugees and Jerusalem to follow; Oslo II in 1995 divided the West Bank into areas under Israeli control, Palestinian control and Israeli military responsibility. Rabin was assassinated that November by an Israeli opponent of the accords, the Camp David summit of 2000 ended without a settlement, and the violence that followed became the al-Aqsa Intifada.",
  connections: [
    { id: "palestine", note: "The accord set up the Palestinian Authority" },
  ],
  cites: [
    { t: "The Oslo Accords and the Arab-Israeli Peace Process — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1993-2000/oslo", k: "archive" },
  ],
});

TL.enrich("eu", {
  why: "The EU began alongside the single market's “4 freedoms” of movement for people, goods, services and money, and grew fast: Austria, Finland and Sweden joined in 1995, and the 2004 and 2007 enlargements, mostly of Central and Eastern European states, raised membership to 27. It received the Nobel Peace Prize in 2012, but also faced the euro debt crisis, the arrival of over a million asylum seekers in 2015 and the UK's 2016 vote to leave. Since 2022 it has imposed sanctions on Russia and sent assistance to Ukraine.",
  connections: [
    { id: "st-enlargement-2004", note: "Ten countries, mostly from Central and Eastern Europe, joined in 2004" },
    { id: "st-brexit-referendum", note: "52% of UK voters chose to leave in 2016" },
    { id: "st-invasion-2022", note: "The EU responded to Russia's invasion with sanctions and aid to Ukraine" },
  ],
  cites: [
    { t: "History of the EU, 1990–99 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1990-99_en" },
    { t: "History of the EU, 2000–09 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/2000-09_en" },
    { t: "History of the EU, 2010–19 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/2010-19_en" },
    { t: "History of the EU, 2020 to today — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/2020-today_en" },
  ],
});

TL.enrich("st-rwandan-genocide", {
  why: "The international community failed to intervene: the UN peacekeeping force was forbidden to use force except in self-defense, and the UN, the United States, the United Kingdom and Belgium were criticized for not strengthening it. The killing ended when the Rwandan Patriotic Front defeated government forces. The flight of génocidaires and Hutu refugees into Zaire destabilized the region and triggered the First Congo War in 1996. The UN tribunal for Rwanda, which indicted 93 people, was the first international court to deliver verdicts for genocide and to recognize rape as a means of perpetrating it.",
  connections: [
    { id: "mx-second-congo-war", note: "Génocidaires among Hutu refugees in eastern Zaire formed militias before the Congo wars" },
    { id: "drc", note: "The refugee exodus into Zaire triggered the First Congo War in 1996" },
  ],
  cites: [
    { t: "The ICTR in Brief — United Nations International Criminal Tribunal for Rwanda", u: "https://unictr.irmct.org/en/tribunal", k: "primary" },
    { t: "Rwandan genocide — Wikipedia", u: "https://en.wikipedia.org/wiki/Rwandan_genocide" },
    { t: "Second Congo War — Wikipedia", u: "https://en.wikipedia.org/wiki/Second_Congo_War" },
  ],
});

TL.enrich("st-sa-1994", {
  why: "The ANC won about 62.6% of the vote and, as the interim constitution required, formed a Government of National Unity with the National Party and the Inkatha Freedom Party; F. W. de Klerk became Mandela's first deputy. April 27 is now a public holiday, Freedom Day. The final constitution, signed by Mandela in 1996, guaranteed minority rights and set founding values including human dignity, non-racialism and non-sexism, and Mandela used sport, notably the 1995 Rugby World Cup, to promote reconciliation between Black and white South Africans.",
  connections: [
    { id: "st-mandela-freed", note: "Four years after leaving prison, Mandela was elected president" },
  ],
  cites: [
    { t: "The Nelson Mandela Presidency – 1994 to 1999 — South African History Online", u: "https://sahistory.org.za/article/nelson-mandela-presidency-1994-1999", k: "reference" },
    { t: "1994 South African general election — Wikipedia", u: "https://en.wikipedia.org/wiki/1994_South_African_general_election" },
  ],
});

TL.enrich("palestine", {
  why: "Under the Oslo II Accord the West Bank was split into Area A (18%), administered by the Palestinian government; Area B (22%), under Palestinian civil and joint security control; and Area C (60%), administered by Israel. Hamas's takeover of Gaza in 2007 divided the Palestinians politically and territorially, with Fatah largely ruling the West Bank. The UN General Assembly made Palestine a non-member observer state in 2012, and in late 2025 the UK, France, Canada and Australia recognized it in an attempt to keep a two-state solution possible; its borders and other core questions remain unresolved.",
  connections: [
    { id: "st-oslo", note: "The Oslo process created the Palestinian Authority" },
    { id: "st-hamas-gaza", note: "Hamas's 2007 takeover of Gaza split Palestinian rule in two" },
    { id: "st-palestine-recognition", note: "Four Western states recognized Palestine in late 2025" },
  ],
  cites: [
    { t: "State of Palestine — Wikipedia", u: "https://en.wikipedia.org/wiki/State_of_Palestine" },
    { t: "The Oslo Accords and the Arab-Israeli Peace Process — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1993-2000/oslo", k: "archive" },
  ],
});

TL.enrich("wto", {
  why: "The Uruguay Round that created the WTO was the last and most extensive under the GATT, bringing services, intellectual property, agriculture and textiles under trade rules and reforming dispute settlement, which the WTO calls “the central pillar of the multilateral trading system.” China joined in 2001 after 15 years of negotiation. The Doha Round launched that year stalled over differences between developed and low-income countries, and since 2019, when the US blocked appointments, the Appellate Body has been unable to enforce WTO rules. Critics argue that the benefits of WTO-facilitated free trade are not shared equally.",
  connections: [
    { id: "g7-uruguay-round", note: "The round that led to the WTO and a new set of agreements" },
    { id: "g7-china-wto", note: "China joined in 2001 after 15 years of negotiation" },
  ],
  cites: [
    { t: "The GATT years: from Havana to Marrakesh — World Trade Organization", u: "https://www.wto.org/english/thewto_e/whatis_e/tif_e/fact4_e.htm", k: "primary" },
    { t: "World Trade Organization — Wikipedia", u: "https://en.wikipedia.org/wiki/World_Trade_Organization" },
  ],
});

TL.enrich("st-hk-handover", {
  why: "Under the 1984 Joint Declaration, China undertook that Hong Kong's capitalist system and way of life would remain unchanged for 50 years under “one country, two systems,” with a high degree of autonomy except in foreign and defense affairs. Protests over universal suffrage in 2014 and mass protests in 2019, which began over an extradition bill, were followed by the 2020 national security law and 2021 electoral changes. The UK government has judged China to be in “a state of ongoing non-compliance” with the declaration since 2021, while Beijing reaffirms its commitment to the principle; the UK says Hong Kong keeps a high degree of autonomy in economic and financial matters.",
  connections: [
    { id: "st-hk-nsl", note: "The UK says the security law undermines rights guaranteed in 1984" },
  ],
  cites: [
    { t: "Handover of Hong Kong — Wikipedia", u: "https://en.wikipedia.org/wiki/Handover_of_Hong_Kong" },
    { t: "Six-monthly report on Hong Kong: 1 July to 31 December 2025 — UK Foreign, Commonwealth and Development Office", u: "https://www.gov.uk/government/publications/six-monthly-report-on-hong-kong-july-to-december-2025/six-monthly-report-on-hong-kong-1-july-to-31-december-2025", k: "primary" },
  ],
});

TL.enrich("mx-second-congo-war", {
  why: "Wikipedia notes that Hutu genocidaires among Rwandan refugees in Zaire formed militias such as the Interahamwe, and that the war was heavily influenced and funded by the trade in conflict minerals. The IRC's 2007 survey estimated 5.4 million excess deaths from August 1998 to April 2007, about 2.1 million of them after the formal end of the war in 2002. It attributed only 0.4% of all deaths directly to violence; most were from infectious disease, malnutrition and neonatal- and pregnancy-related conditions, and children accounted for 47% of deaths. Violence has persisted in the east, including the Kivu and Ituri conflicts.",
  connections: [
    { id: "st-rwandan-genocide", note: "Génocidaires who fled into Congo formed militias such as the Interahamwe" },
  ],
  cites: [
    { t: "Mortality in the Democratic Republic of Congo: An ongoing crisis — International Rescue Committee", u: "https://www.rescue.org/report/mortality-democratic-republic-congo-ongoing-crisis", k: "paper" },
    { t: "Second Congo War — Wikipedia", u: "https://en.wikipedia.org/wiki/Second_Congo_War" },
  ],
});

TL.enrich("st-euro", {
  why: "At its launch the euro became the currency of more than 300 million people, but for three years it was used only for accounting, until notes and coins replaced national currencies such as the Deutsche Mark. It is now legal tender in 21 of the EU's 27 member states and used for cash payments by about 358 million people. Its Maastricht convergence criteria became central in the eurozone debt crisis from 2009, when euro countries backed a plan to deal with their deficits and the EU later set up a Banking Union for safer banks.",
  connections: [
    { id: "st-maastricht", note: "The Maastricht Treaty set the rules for the single currency" },
    { id: "st-bulgaria-euro", note: "Bulgaria became the 21st euro country in 2026" },
  ],
  cites: [
    { t: "Introduction to the euro — European Central Bank", u: "https://www.ecb.europa.eu/euro/intro/html/index.en.html", k: "primary" },
    { t: "History of the EU, 2010–19 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/2010-19_en" },
    { t: "Maastricht Treaty — Wikipedia", u: "https://en.wikipedia.org/wiki/Maastricht_Treaty" },
  ],
});

TL.enrich("st-sept-11", {
  why: "The 9/11 Commission called it “a day of unprecedented shock and suffering in the history of the United States,” found that leaders had not grasped the gravity of the threat, and recommended a National Counterterrorism Center and a national intelligence director. Al-Qaeda, formed after the Soviet defeat in Afghanistan, cited grievances including US troops in Saudi Arabia. The US launched a Global War on Terror and invaded Afghanistan, NATO invoked its mutual-defense Article 5 for the only time to date, and many countries tightened airport security. Bin Laden was killed in a US raid in Pakistan in May 2011.",
  connections: [
    { id: "mx-us-invades-afghanistan", note: "The US responded by invading Afghanistan" },
    { id: "mx-soviet-afghan-war", note: "Al-Qaeda was formed after the Soviet defeat in Afghanistan" },
    { id: "nato", note: "NATO invoked Article 5 for the only time to date" },
  ],
  cites: [
    { t: "Executive Summary — The 9/11 Commission Report", u: "https://www.9-11commission.gov/report/911Report_Exec.htm", k: "primary" },
    { t: "September 11 attacks — Wikipedia", u: "https://en.wikipedia.org/wiki/September_11_attacks" },
  ],
});

TL.enrich("mx-us-invades-afghanistan", {
  why: "The Bonn Agreement of December 5, 2001, installed Hamid Karzai at the head of an interim administration, but the Taliban regrouped: suicide attacks rose from 27 in 2005 to 139 in 2006, and in 2009 President Obama sent 30,000 more troops. US forces killed bin Laden in Pakistan in 2011, the combat mission ended in 2014, and a February 2020 US–Taliban deal paved the way for a drawdown. The Taliban returned to power two decades after the invasion, which had led to the United States' longest war.",
  connections: [
    { id: "st-sept-11", note: "Launched after al-Qaeda's September 11 attacks" },
    { id: "mx-taliban-take-kabul", note: "The Taliban returned to power two decades later" },
  ],
  cites: [
    { t: "The U.S. War in Afghanistan — Council on Foreign Relations", u: "https://www.cfr.org/timeline/us-war-afghanistan", k: "reference" },
    { t: "War in Afghanistan (2001–2021) — Wikipedia", u: "https://en.wikipedia.org/wiki/War_in_Afghanistan_(2001%E2%80%932021)" },
  ],
});

TL.enrich("african-union", {
  why: "The OAU had sought to rid the continent of the remaining vestiges of colonization and apartheid; the African Union, the AU says, shifted its focus from supporting liberation movements to spearheading Africa's development and integration. Its blueprint, Agenda 2063, is a 50-year plan for inclusive and sustainable socio-economic development, and its objectives include defending members' sovereignty and promoting democratic institutions and good governance. Its organs include a Peace and Security Council and a Pan-African Parliament.",
  connections: [
    { id: "oau", note: "The AU shifted from the OAU's liberation agenda to development and integration" },
    { id: "g7-sirte-declaration", note: "The 1999 Sirte Declaration and four summits led to the AU's launch" },
  ],
  cites: [
    { t: "AU in a Nutshell — African Union", u: "https://au.int/en/au-nutshell", k: "primary" },
  ],
});

TL.enrich("mx-iraq-invasion-2003", {
  why: "The case for war rested on claims that Iraq possessed weapons of mass destruction, but no stockpiles were found. UN Secretary-General Kofi Annan called the invasion illegal under international law, while the US cited anticipatory self-defense and earlier Security Council authorizations; the UK's 2016 Chilcot Report concluded that peaceful alternatives had not been fully explored. The power vacuum and occupation mismanagement fed a long insurgency and a Shia–Sunni sectarian civil war, and estimates of deaths range from 150,000 to over a million. US troops withdrew in 2011, and the war's lasting effects included the emergence of the Islamic State.",
  connections: [
    { id: "mx-gulf-war", note: "UN weapons inspections of Iraq began after the 1991 Gulf War" },
  ],
  cites: [
    { t: "Iraq War — Wikipedia", u: "https://en.wikipedia.org/wiki/Iraq_War" },
    { t: "The Gulf War, 1991 — Office of the Historian", u: "https://history.state.gov/milestones/1989-1992/gulf-war", k: "archive" },
  ],
});

TL.enrich("g7-lehman-crisis", {
  why: "Housing was the epicenter of the crisis: US home prices fell about 30% and the S&P 500 fell 57% from its peak. Real GDP dropped 4.3% from late 2007 to mid-2009, and unemployment peaked at 10% in October 2009. The Federal Reserve cut its policy rate to 0–0.25% in December 2008 and bought about $1.75 trillion of longer-term assets in its first round of quantitative easing, while many nations enacted fiscal stimulus. The Fed's history links the aftermath to financial regulatory reform, the European sovereign debt crisis and weak global growth.",
  connections: [
    { id: "st-euro", note: "The aftermath included the European sovereign debt crisis" },
  ],
  cites: [
    { t: "The Great Recession — Federal Reserve History", u: "https://www.federalreservehistory.org/essays/great-recession-of-200709", k: "reference" },
  ],
});

TL.enrich("mx-tunisian-revolution", {
  why: "The revolution led to free elections in October 2011, won by the formerly banned Islamist party Ennahda with 41% of the vote; Wikipedia says its democratization led to Tunisia being described as the only successful movement of the Arab Spring. The Tunisian National Dialogue Quartet won the 2015 Nobel Peace Prize for its contribution to a pluralistic democracy. Elsewhere, Egypt's revolution removed Mubarak, while uprisings in Libya and Syria became civil wars. On July 25, 2021, President Kais Saied dismissed the government and suspended parliament, a move described as a self-coup; many Tunisians initially celebrated, and Human Rights Watch said it was a first step towards authoritarianism.",
  connections: [
    { id: "st-arab-spring-egypt", note: "Inspired by Tunisia, Egypt's revolution removed Hosni Mubarak" },
    { id: "st-syrian-civil-war", note: "Syria's uprising against Assad deteriorated into civil war" },
  ],
  cites: [
    { t: "Tunisian revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Tunisian_revolution" },
    { t: "2021 Tunisian self-coup — Wikipedia", u: "https://en.wikipedia.org/wiki/2021_Tunisian_self-coup" },
  ],
});

TL.enrich("south-sudan", {
  why: "Independence was a consequence of the 2005 Comprehensive Peace Agreement, which ended the Second Sudanese Civil War fought since 1983. The new state then descended into its own civil war from 2013 to 2018, in which about 400,000 people are estimated to have died and more than four million were displaced. It ranks lowest in the world on the Human Development Index, elections first scheduled for 2023 have repeatedly been postponed, and after Vice-President Riek Machar's arrest in March 2025 the UN Secretary-General warned that the country was on “the edge of a collapse into civil war.”",
  connections: [
    { id: "st-south-sudan-civil-war", note: "Civil war broke out two years after independence" },
    { id: "sudan", note: "Seceded after the 2005 peace deal ended Sudan's long civil war" },
  ],
  cites: [
    { t: "South Sudan — Wikipedia", u: "https://en.wikipedia.org/wiki/South_Sudan" },
  ],
});

TL.enrich("g7-crispr", {
  why: "NHGRI describes CRISPR as simpler, faster, cheaper and more accurate than older genome-editing methods, though it can still cut in the wrong spot. On December 8, 2023, the FDA approved Casgevy for sickle cell disease, the first approved therapy using CRISPR/Cas9, calling it an innovative advance in gene therapy. Editing germline cells, whose changes would be inherited, remains contentious: NHGRI says most people agree it should not be done at this time, and the NIH does not fund research to edit human embryos.",
  connections: [
    { id: "g7-casgevy", note: "The first therapy using CRISPR/Cas9 was approved in 2023" },
  ],
  cites: [
    { t: "What is Genome Editing? — National Human Genome Research Institute", u: "https://www.genome.gov/about-genomics/policy-issues/what-is-Genome-Editing", k: "reference" },
    { t: "FDA Approves First Gene Therapies to Treat Patients with Sickle Cell Disease — US Food and Drug Administration", u: "https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease", k: "primary" },
  ],
});

TL.enrich("st-crimea", {
  why: "It was the first time since World War II that a European country had annexed part of another, and it marked the beginning of the Russo-Ukrainian war. Putin defended the referendum as self-determination and said Crimea had always been Russian; it was held under Russian occupation and offered no option to keep the status quo. Ukraine protested the annexation as a violation of the 1994 Budapest Memorandum, in which Russia had pledged to respect its borders. The other G8 members suspended Russia and imposed sanctions, and NATO suspended cooperation with it.",
  connections: [
    { id: "st-invasion-2022", note: "The 2014 invasion began the war that escalated in 2022" },
    { id: "ukraine", note: "Russia had pledged in 1994 to respect Ukraine's borders" },
  ],
  cites: [
    { t: "Annexation of Crimea by the Russian Federation — Wikipedia", u: "https://en.wikipedia.org/wiki/Annexation_of_Crimea_by_the_Russian_Federation" },
    { t: "Budapest Memorandum — Wikipedia", u: "https://en.wikipedia.org/wiki/Budapest_Memorandum" },
  ],
});

TL.enrich("g7-paris-agreement", {
  why: "In 2020 the UN Environment Programme estimated that current commitments would likely lead to more than 3°C of warming by 2100. According to the stocktake report, expected warming by 2100 had fallen from 3.7–4.8°C in 2010 to 2.4–2.6°C at COP 27, or 1.7–2.1°C if long-term pledges are met, but the world is still very far from limiting warming to 1.5°C. Most experts consider the agreement insufficient for the 1.5°C goal, though some say it is too early to judge. The United States withdrew in 2020, rejoined in 2021 and withdrew again with effect from January 27, 2026.",
  connections: [
    { id: "g7-rio-unfccc", note: "The 1992 climate convention paved the way for the agreement" },
    { id: "g7-us-leaves-paris", note: "The second US withdrawal took effect on January 27, 2026" },
  ],
  cites: [
    { t: "Paris Agreement — Wikipedia", u: "https://en.wikipedia.org/wiki/Paris_Agreement" },
    { t: "Earth Summit — Wikipedia", u: "https://en.wikipedia.org/wiki/Earth_Summit" },
  ],
});

TL.enrich("covid-19", {
  why: "WHO estimated about 14.9 million excess deaths (range 13.3–16.6 million) in 2020–2021 alone, counting deaths caused directly by COVID-19 and indirectly by its effects on health systems and society; 84% were in South-East Asia, Europe and the Americas, and 57% were men. WHO ended the global health emergency on May 5, 2023, citing falling deaths and high population immunity from infection, vaccination or both, while calling COVID-19 an established and ongoing health issue. Gaps and inequities in the response led WHO members to negotiate a Pandemic Agreement, adopted in May 2025.",
  connections: [
    { id: "g7-pandemic-agreement", note: "Negotiated because of gaps and inequities in the COVID-19 response" },
    { id: "g7-covid-vaccines", note: "Vaccination helped build the immunity WHO cited in ending the emergency" },
  ],
  cites: [
    { t: "14.9 million excess deaths were associated with the COVID-19 pandemic in 2020 and 2021 — WHO", u: "https://www.who.int/news/item/05-05-2022-14.9-million-excess-deaths-were-associated-with-the-covid-19-pandemic-in-2020-and-2021", k: "data" },
    { t: "Statement on the fifteenth meeting of the IHR (2005) Emergency Committee on the COVID-19 pandemic (5 May 2023) — WHO", u: "https://www.who.int/news/item/05-05-2023-statement-on-the-fifteenth-meeting-of-the-international-health-regulations-(2005)-emergency-committee-regarding-the-coronavirus-disease-(covid-19)-pandemic", k: "primary" },
    { t: "World Health Assembly adopts historic Pandemic Agreement to make the world more equitable and safer from future pandemics — WHO", u: "https://www.who.int/news/item/20-05-2025-world-health-assembly-adopts-historic-pandemic-agreement-to-make-the-world-more-equitable-and-safer-from-future-pandemics", k: "primary" },
  ],
});

TL.enrich("st-brexit", {
  why: "The EU–UK Trade and Cooperation Agreement, signed on December 30, 2020, has governed relations since 2021. The UK's Office for Budget Responsibility assumes that Brexit will reduce long-run productivity by 4% and exports and imports by about 15% compared with remaining in the EU. Wikipedia reports that the majority of economists believe Brexit has harmed the UK economy, though early short-term forecasts proved too pessimistic; one economist has suggested that less regulation and more control over trade policy could eventually outweigh the short-term uncertainty.",
  connections: [
    { id: "st-brexit-referendum", note: "52% of UK voters chose to leave in the 2016 referendum" },
  ],
  cites: [
    { t: "Brexit analysis — Office for Budget Responsibility", u: "https://obr.uk/forecasts-in-depth/the-economy-forecast/brexit-analysis/", k: "data" },
    { t: "Economic effects of Brexit — Wikipedia", u: "https://en.wikipedia.org/wiki/Economic_effects_of_Brexit" },
    { t: "Brexit — Wikipedia", u: "https://en.wikipedia.org/wiki/Brexit" },
    { t: "History of the EU, 2010–19 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/2010-19_en" },
  ],
});

TL.enrich("g7-covid-pandemic", {
  why: "WHO had declared a public health emergency of international concern on January 30, 2020, when there were 98 cases and no deaths in 18 countries outside China. In characterizing COVID-19 as a pandemic, Director-General Tedros cited “alarming levels of inaction” and said all countries could still change its course. In the following weeks WHO issued guidance on large-scale movement restrictions, commonly called lockdowns, and on April 24 it helped launch the ACT-Accelerator to speed the development of, and equitable access to, vaccines, tests and treatments.",
  connections: [
    { id: "g7-covid-pheic", note: "WHO declared the global health emergency six weeks earlier" },
  ],
  cites: [
    { t: "Timeline: WHO's COVID-19 response — World Health Organization", u: "https://www.who.int/news/item/29-06-2020-covidtimeline", k: "primary" },
  ],
});

TL.enrich("mx-taliban-take-kabul", {
  why: "Wikipedia says the US–Taliban deal of February 2020 is considered one of the most critical factors in the collapse of the Afghan security forces, and President Biden conceded that the collapse unfolded more quickly than anticipated. The airlift of more than 123,000 people was the largest non-combatant evacuation in US military history, and an attack at the Kabul airport killed 13 US service members and at least 170 Afghans. UNESCO says Afghanistan stands out as the only country where secondary and higher education is forbidden to girls and women, with nearly 2.2 million barred in 2025.",
  connections: [
    { id: "mx-us-invades-afghanistan", note: "The Taliban returned two decades after US-led forces toppled them" },
  ],
  cites: [
    { t: "Fall of Kabul (2021) — Wikipedia", u: "https://en.wikipedia.org/wiki/Fall_of_Kabul_(2021)" },
    { t: "The U.S. War in Afghanistan — Council on Foreign Relations", u: "https://www.cfr.org/timeline/us-war-afghanistan", k: "reference" },
    { t: "Afghanistan: Four years on, 2.2 million girls still banned from school — UNESCO", u: "https://www.unesco.org/en/articles/afghanistan-four-years-22-million-girls-still-banned-school", k: "news" },
  ],
});

TL.enrich("st-invasion-2022", {
  why: "The war has driven 6–7 million people to flee Ukraine, Europe's largest refugee crisis since World War II, displaced about 8 million within it and caused hundreds of thousands of military casualties; Russian troops occupy roughly 20% of the country. The EU condemned an “unjustified and unprovoked war of aggression” and imposed sanctions, and after the invasion Finland and Sweden applied to join NATO, becoming members in 2023 and 2024. The fighting has not abated: UN monitors verified 2,957 civilians killed in January–October 2026, with civilian deaths and injuries 63% higher than in the same months of 2025.",
  connections: [
    { id: "st-crimea", note: "The war began with Russia's 2014 seizure of Crimea" },
    { id: "g7-finland-nato", note: "Finland applied to join NATO after the invasion" },
    { id: "g7-sweden-nato", note: "Sweden joined NATO on March 7, 2024" },
  ],
  cites: [
    { t: "Russian invasion of Ukraine — Wikipedia", u: "https://en.wikipedia.org/wiki/Russian_invasion_of_Ukraine" },
    { t: "History of the EU, 2020 to today — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/2020-today_en" },
    { t: "Enlargement and Article 10 — NATO", u: "https://www.nato.int/cps/en/natohq/topics_49212.htm", k: "primary" },
    { t: "Protection of Civilians in Armed Conflict — October 2026 — UN Human Rights Monitoring Mission in Ukraine", u: "https://ukraine.ohchr.org/en/Protection-of-Civilians-in-Armed-Conflict-October-2026", k: "data" },
    { t: "Annexation of Crimea by the Russian Federation — Wikipedia", u: "https://en.wikipedia.org/wiki/Annexation_of_Crimea_by_the_Russian_Federation" },
  ],
});

TL.enrich("g7-chatgpt", {
  why: "Built on OpenAI's GPT models and trained with reinforcement learning from human feedback, ChatGPT gained 100 million users in two months, at the time the fastest-growing internet application in history, and had 900 million weekly users by February 2026. It accelerated the AI boom; Google hastened the release of its own chatbot, Bard. OpenAI warned at launch that it sometimes writes “plausible-sounding but incorrect or nonsensical answers,” and it has raised concerns about academic dishonesty and copyright, drawing regulatory scrutiny from a temporary ban in Italy in 2023 to the transparency rules of the EU AI Act.",
  connections: [
    { id: "g7-transformer", note: "GPT stands for “generative pre-trained transformer”" },
    { id: "g7-eu-ai-act", note: "OpenAI added watermarking to meet the AI Act's transparency requirements" },
  ],
  cites: [
    { t: "Introducing ChatGPT — OpenAI", u: "https://openai.com/index/chatgpt/", k: "primary" },
    { t: "ChatGPT — Wikipedia", u: "https://en.wikipedia.org/wiki/ChatGPT" },
  ],
});

TL.enrich("st-oct-7", {
  why: "The attack killed 1,195 Israelis and foreign nationals and 251 people were taken hostage. In the war that followed, over 74,000 Palestinians in Gaza have been reported killed, a figure studies in The Lancet suggest is an undercount; nearly all of Gaza's 2.3 million people have been displaced and about 90% of its civilian infrastructure destroyed. A UN-backed analysis confirmed famine in Gaza Governorate in August 2025, the first officially confirmed in the Middle East. UN bodies and genocide scholars have concluded that Israel's actions constitute genocide, which Israel and its supporters deny, and a genocide case is before the International Court of Justice.",
  connections: [
    { id: "st-gaza-ceasefire", note: "A ceasefire under a US-backed plan took effect on October 10, 2025" },
    { id: "st-twelve-day-war", note: "Regional fallout included Iran's clashes with Israel in 2025" },
  ],
  cites: [
    { t: "Gaza war — Wikipedia", u: "https://en.wikipedia.org/wiki/Gaza_war" },
    { t: "Famine in Gaza: ‘A failure of humanity itself’, says UN chief — UN News (August 22, 2025)", u: "https://news.un.org/en/story/2025/08/1165702", k: "news" },
  ],
});
