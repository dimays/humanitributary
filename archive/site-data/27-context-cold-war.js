// "Why it matters" context and cross-links for the early Cold War, decolonization and the 1950s–1970s (November 2026).
// TL.enrich(id, { why, connections: [{ id, note }], cites }): see SCHEMA.md, "Context: why it matters, and connections".

TL.enrich("st-apartheid", {
  why: "The Office of the Historian dates “legalized racism's harshest features” to the National Party's 1948 victory. Washington long kept South Africa as a Cold War ally against communism, and the UN's calls for sanctions were weakened by Britain, France and the United States. After the 1960 Sharpeville killings and the banning of the ANC, grassroots pressure brought sanctions such as the 1986 US Comprehensive Anti-Apartheid Act; the Office credits these, internal unrest and the end of the Cold War with bringing white minority rule to an end.",
  connections: [
    { id: "st-sharpeville", note: "Police killed 69 unarmed protesters; the ANC and PAC were banned that year" },
    { id: "st-mandela-freed", note: "Released after 27 years once de Klerk lifted the ban on the ANC" },
    { id: "st-sa-1994", note: "The democratic election that ended white minority rule" },
  ],
  cites: [
    { t: "The End of Apartheid — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1989-1992/apartheid", k: "archive" },
  ],
});

TL.enrich("gatt", {
  why: "GATT was a stopgap: the planned International Trade Organization, meant to join the Bretton Woods institutions, was effectively dead once the United States said in 1950 it would not seek ratification of its Havana Charter, leaving GATT the only multilateral instrument governing trade until the WTO. Its first round affected about a fifth of world trade, and the WTO says continual tariff cuts spurred world trade growth of around 8% a year in the 1950s and 1960s. By the early 1980s GATT was seen as less relevant, as services were not covered and farm trade loopholes were heavily exploited; the Uruguay Round created the WTO.",
  connections: [
    { id: "bretton-woods", note: "Stopgap after the planned ITO, meant to join the Bretton Woods institutions, failed" },
    { id: "g7-uruguay-round", note: "The last and most extensive GATT round" },
    { id: "wto", note: "Its successor from January 1, 1995, the biggest trade reform since the war" },
  ],
  cites: [
    { t: "The GATT years: from Havana to Marrakesh — World Trade Organization", u: "https://www.wto.org/english/thewto_e/whatis_e/tif_e/fact4_e.htm", k: "reference" },
  ],
});

TL.enrich("nato", {
  why: "NATO was the first US peacetime military alliance outside the Western Hemisphere, its members agreeing to treat an attack on one as an attack on all. Formed amid the Berlin blockade and the 1948 coup in Czechoslovakia, it placed Western Europe under the American “nuclear umbrella.” West Germany's entry in 1955 led Moscow to form the Warsaw Pact, and the Office of the Historian notes that NATO remains the largest peacetime military alliance in the world.",
  connections: [
    { id: "g7-berlin-blockade", note: "Stalin's test of Western resolve that pushed the West toward joint defense" },
    { id: "warsaw-pact", note: "The Soviet answer to West Germany's entry into NATO" },
  ],
  cites: [
    { t: "North Atlantic Treaty Organization (NATO), 1949 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/nato", k: "archive" },
    { t: "Founding treaty — NATO", u: "https://www.nato.int/cps/en/natohq/topics_67656.htm", k: "primary" },
  ],
});

TL.enrich("prc", {
  why: "The People's Republic completed a revolutionary upheaval that had begun in 1911. In Washington the Communist victory set off charges that the Truman administration had “lost” China, and the United States kept recognizing the Republic of China on Taiwan until the 1970s. When the PRC and the United States fought on opposite sides in Korea, the Office of the Historian says, any chance of accommodation ended for two decades.",
  connections: [
    { id: "st-roc-to-taiwan", note: "The Nationalists' retreat left two rival governments claiming China" },
    { id: "st-korean-war", note: "Fighting in Korea ended any early US–PRC accommodation" },
    { id: "st-nixon-china", note: "US ties were suspended for decades, until the 1970s" },
  ],
  cites: [
    { t: "The Chinese Revolution of 1949 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1945-1952/chinese-rev", k: "archive" },
  ],
});

TL.enrich("warsaw-pact", {
  why: "Moscow created the Pact days after West Germany joined NATO, fearing a rearmed Germany and seeking to deal with NATO as an equal. The Office of the Historian notes that the Soviet Union controlled most of its decisions and used it to contain dissent in its satellites, in Hungary in 1956 and Czechoslovakia in 1968. Economic strain and political change in its members left it “virtually ineffectual” by the late 1980s, and East Germany left before reunification in 1990.",
  connections: [
    { id: "nato", note: "Formed as a counterweight after West Germany entered NATO" },
    { id: "st-hungary-1956", note: "Used to crush dissent in Hungary" },
    { id: "g7-prague-1968", note: "Pact forces ended the Prague Spring" },
  ],
  cites: [
    { t: "The Warsaw Treaty Organization, 1955 — Office of the Historian", u: "https://history.state.gov/milestones/1953-1960/warsaw-treaty", k: "archive" },
  ],
});

TL.enrich("st-korean-war", {
  why: "The war turned Korea, in the Office of the Historian's words, from a peripheral region into “a key battle ground in the Cold War.” The United States extended lasting security commitments to South Korea and Japan, and Japan's transformation from wartime enemy to ally was sealed by the 1951 peace and security treaties. The fighting ended only in an “uneasy truce” in 1953, leaving the division into two rival states in place.",
  connections: [
    { id: "cold-war", note: "Made East Asia a central front of the Cold War" },
    { id: "prc", note: "China's entry put the PRC and the US on opposite sides for two decades" },
    { id: "nato", note: "Spurred NATO to integrate its forces under a central command" },
  ],
  cites: [
    { t: "Korean War and Japan’s Recovery — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1945-1952/korean-war", k: "archive" },
    { t: "The Chinese Revolution of 1949 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1945-1952/chinese-rev", k: "archive" },
    { t: "North Atlantic Treaty Organization (NATO), 1949 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/nato", k: "archive" },
  ],
});

TL.enrich("west-germany", {
  why: "West Germany grew out of the Western Allies' break with the Soviets over Germany: their June 1948 currency reform brought the Berlin blockade, and the Federal Republic was founded about two weeks after it ended, followed by the East German state. Under Konrad Adenauer it chose full alignment with NATO over neutrality, joining in 1955, and its 1950s “economic miracle” made it the world's second-largest economy. Its Ostpolitik aimed to improve relations with Eastern Europe, and in 1990 East Germany acceded to it.",
  connections: [
    { id: "g7-berlin-blockade", note: "The blockade's end and West Germany's founding came weeks apart" },
    { id: "warsaw-pact", note: "Soviets formed the Pact in 1955, fearing a rearmed West Germany in NATO" },
    { id: "germany", note: "East Germany joined it at reunification on October 3, 1990" },
  ],
  cites: [
    { t: "The Berlin Airlift, 1948–1949 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1945-1952/berlin-airlift", k: "archive" },
    { t: "The Warsaw Treaty Organization, 1955 — Office of the Historian", u: "https://history.state.gov/milestones/1953-1960/warsaw-treaty", k: "archive" },
    { t: "West Germany — Wikipedia", u: "https://en.wikipedia.org/wiki/West_Germany" },
  ],
});

TL.enrich("east-germany", {
  why: "East Germany's founding sealed the division that the Berlin crisis had “solidified” between East and West in Europe. Emigration, often of educated young people, drained its economy, and the regime's answer, the Berlin Wall of 1961, became what the Office of the Historian calls “the most iconic image of the Cold War in Europe.” A 1953 uprising was put down with Soviet troops; peaceful protests that began in Leipzig in 1989 helped bring the Wall down, and a free election followed in 1990.",
  connections: [
    { id: "st-gdr-uprising", note: "Strikes over work quotas, suppressed with Soviet forces" },
    { id: "g7-berlin-wall-built", note: "Built to stop the exodus to the West" },
    { id: "g7-berlin-wall-falls", note: "Leipzig's peaceful protests helped bring the Wall down" },
  ],
  cites: [
    { t: "The Berlin Airlift, 1948–1949 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1945-1952/berlin-airlift", k: "archive" },
    { t: "The Berlin Crisis, 1958–1961 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1953-1960/berlin-crises", k: "archive" },
    { t: "East Germany — Wikipedia", u: "https://en.wikipedia.org/wiki/East_Germany" },
  ],
});

TL.enrich("ecsc", {
  why: "The Schuman Declaration proposed pooling coal and steel so that war between France and Germany would become “not merely unthinkable, but materially impossible,” and called the plan “the first concrete foundation of a European federation.” The EU describes the aim as a lasting peace in which no single country could make the weapons of war “to turn against others, as in the past.” The same six members went on to found the EEC and Euratom in 1958.",
  connections: [
    { id: "st-schuman", note: "Robert Schuman's May 9, 1950, plan proposed the pool" },
    { id: "st-treaty-rome", note: "The same six extended their cooperation to other sectors" },
  ],
  cites: [
    { t: "Schuman Declaration, May 1950 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1945-59/schuman-declaration-may-1950_en", k: "primary" },
    { t: "History of the EU, 1945–59 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1945-59_en", k: "primary" },
    { t: "History of the EU, 1990–99 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1990-99_en", k: "primary" },
  ],
});

TL.enrich("st-treaty-rome", {
  why: "The EU calls the Treaty of Rome the start of “a new era of ever-closer cooperation in Europe.” Its economic community went beyond coal and steel: by 1968 the six had removed customs duties on goods traded among themselves, and trade among them and with the rest of the world grew rapidly. The EU also dates the Common Agricultural Policy, which gave members joint control over food production, to 1962.",
  connections: [
    { id: "eec", note: "Created the European Economic Community" },
  ],
  cites: [
    { t: "History of the EU, 1945–59 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1945-59_en", k: "primary" },
    { t: "History of the EU, 1960–69 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1960-69_en", k: "primary" },
    { t: "History of the EU, 1990–99 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1990-99_en", k: "primary" },
  ],
});

TL.enrich("eec", {
  why: "The EEC turned the six into a trading bloc: in 1968 they removed customs duties on one another's goods, allowing free cross-border trade for the first time, and trade among them grew rapidly. Its Common Agricultural Policy gave joint control over food production but caused overproduction. The 1992 Maastricht Treaty created the European Union and set rules for a future single currency, and the single market's four freedoms followed in 1993.",
  connections: [
    { id: "st-enlargement-1973", note: "Denmark, Ireland and the UK raised membership from six to nine" },
    { id: "st-maastricht", note: "The treaty that created the European Union" },
    { id: "st-euro", note: "Maastricht set the rules for the single currency" },
  ],
  cites: [
    { t: "History of the EU, 1960–69 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1960-69_en", k: "primary" },
    { t: "History of the EU, 1970–79 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1970-79_en", k: "primary" },
    { t: "History of the EU, 1990–99 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1990-99_en", k: "primary" },
  ],
});

TL.enrich("south-korea", {
  why: "Born of the 1945 division, the Republic of Korea endured a series of dictatorships, coups and uprisings while its economy grew about 10% a year from 1962 to 1994. The World Bank traces its path from a post-war aid recipient with income of $67 a person in the early 1950s to a high-income economy at $36,624 in 2024; in 2010 it became the first former aid recipient to join the OECD's donor committee. The June 1987 protests ended authoritarian rule, but with no peace treaty after 1953 the two Koreas remain technically at war.",
  connections: [
    { id: "st-korean-war", note: "The war ended in an armistice, never a peace treaty" },
    { id: "st-june-1987", note: "The protests that ended authoritarian rule" },
    { id: "north-korea", note: "Its rival on the peninsula, across the Demilitarized Zone" },
  ],
  cites: [
    { t: "Republic of Korea — World Bank Group", u: "https://www.worldbank.org/en/country/korea/overview", k: "data" },
    { t: "South Korea — Wikipedia", u: "https://en.wikipedia.org/wiki/South_Korea" },
  ],
});

TL.enrich("north-korea", {
  why: "All three of North Korea's supreme leaders have come from the Kim family, and Kim Il Sung made his Juche philosophy the state ideology. A famine after mid-1990s floods killed an estimated 240,000 to 420,000 people, and in 2006 the country announced its first nuclear test. In 2014 a UN Commission of Inquiry found that crimes against humanity were ongoing under policies set “at the highest level of State,” describing a state that “does not have any parallel in the contemporary world.”",
  connections: [
    { id: "st-korean-war", note: "Fighting stopped in 1953, but no peace treaty was signed" },
    { id: "st-nk-nuclear-test", note: "Its first nuclear test, in 2006" },
  ],
  cites: [
    { t: "North Korea — Wikipedia", u: "https://en.wikipedia.org/wiki/North_Korea" },
    { t: "UN-mandated human rights inquiry on DPR Korea documents ‘widespread, systematic abuses’ — UN News", u: "https://news.un.org/en/node/462002", k: "news" },
  ],
});

TL.enrich("genomics", {
  why: "The US National Human Genome Research Institute calls the discovery of DNA's double helix “perhaps the most significant biological accomplishment of the 20th century”: its two complementary strands each provide the template for making the other, explaining how DNA carries information for living things. The Human Genome Project (1990–2003) used Sanger sequencing and is called by the institute the most important biomedical research undertaking of the 20th century. In 2023 the FDA approved the first therapy using CRISPR/Cas9 genome editing, for sickle cell disease.",
  connections: [
    { id: "g7-human-genome-project", note: "Sequenced the human genome between 1990 and 2003" },
    { id: "g7-casgevy", note: "First approved therapy using CRISPR/Cas9 gene editing" },
  ],
  cites: [
    { t: "Double Helix — Talking Glossary of Genomic and Genetic Terms, National Human Genome Research Institute", u: "https://www.genome.gov/genetics-glossary/Double-Helix", k: "reference" },
    { t: "Human Genome Project Fact Sheet — National Human Genome Research Institute", u: "https://www.genome.gov/about-genomics/educational-resources/fact-sheets/human-genome-project", k: "reference" },
    { t: "FDA Approves First Gene Therapies to Treat Patients with Sickle Cell Disease — US Food and Drug Administration", u: "https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease", k: "primary" },
  ],
});

TL.enrich("civil-rights", {
  why: "Brown v. Board gave Black Americans what the Library of Congress calls “the formal, if not the practical, right” to integrated schools, and the Montgomery bus boycott began a long campaign of nonviolent civil disobedience led by Martin Luther King Jr. Sit-ins, the Birmingham protests and the March on Washington pressed Congress toward the Civil Rights Act of 1964, the most sweeping such law since Reconstruction, followed by the Voting Rights Act of 1965. By the end of 1965 a quarter of a million new Black voters had registered; in 2013 the Supreme Court struck down the act's federal oversight provision.",
  connections: [
    { id: "g7-brown-v-board", note: "The ruling that catalyzed the movement in the 1950s" },
    { id: "g7-civil-rights-act", note: "Outlawed segregation in public places and job discrimination" },
    { id: "g7-voting-rights-act", note: "Federal examiners registered many new Black voters" },
  ],
  cites: [
    { t: "The Civil Rights Act of 1964: A Long Struggle for Freedom, The Civil Rights Era — Library of Congress", u: "https://www.loc.gov/exhibits/civil-rights-act/civil-rights-era.html", k: "museum" },
    { t: "Civil Rights Act (1964) — US National Archives", u: "https://www.archives.gov/milestone-documents/civil-rights-act", k: "archive" },
    { t: "Voting Rights Act (1965) — US National Archives", u: "https://www.archives.gov/milestone-documents/voting-rights-act", k: "archive" },
    { t: "Brown v. Board of Education (1954) — US National Archives", u: "https://www.archives.gov/milestone-documents/brown-v-board-of-education", k: "archive" },
  ],
});

TL.enrich("g7-brown-v-board", {
  why: "Holding that “separate educational facilities are inherently unequal,” the ruling ended the legal basis for school segregation, and the National Archives says it “served as a catalyst for the expanding civil rights movement” of the 1950s. Its 1955 follow-up asked only for desegregation “with all deliberate speed,” and resistance from segregationists, along with criticism from some scholars that the Court relied on social science over precedent, meant integration was often delayed. A federal court soon applied its reasoning to Montgomery's segregated buses.",
  connections: [
    { id: "civil-rights", note: "A catalyst for the expanding movement of the 1950s" },
    { id: "g7-montgomery-boycott", note: "A court applied Brown's reasoning to bus segregation" },
  ],
  cites: [
    { t: "Brown v. Board of Education (1954) — US National Archives", u: "https://www.archives.gov/milestone-documents/brown-v-board-of-education", k: "archive" },
    { t: "The Civil Rights Act of 1964: A Long Struggle for Freedom, The Civil Rights Era — Library of Congress", u: "https://www.loc.gov/exhibits/civil-rights-act/civil-rights-era.html", k: "museum" },
  ],
});

TL.enrich("g7-civil-rights-act", {
  why: "President Kennedy proposed the bill in June 1963, after sit-ins and the Birmingham protests, and the March on Washington built public support; after his assassination, President Johnson carried it forward. Southern Democrats tried to “talk the bill to death” in a filibuster, overcome with help from Senate Minority Leader Everett Dirksen. Beyond outlawing segregation in public places, its Title VII created the Equal Employment Opportunity Commission, which still enforces bans on discrimination in hiring, pay and promotion.",
  connections: [
    { id: "g7-march-on-washington", note: "The march roused public support for the pending bill" },
    { id: "g7-voting-rights-act", note: "Johnson's next landmark civil rights law, a year later" },
  ],
  cites: [
    { t: "Civil Rights Act (1964) — US National Archives", u: "https://www.archives.gov/milestone-documents/civil-rights-act", k: "archive" },
    { t: "The Civil Rights Act of 1964: A Long Struggle for Freedom, The Civil Rights Era — Library of Congress", u: "https://www.loc.gov/exhibits/civil-rights-act/civil-rights-era.html", k: "museum" },
  ],
});

TL.enrich("south-vietnam", {
  why: "South Vietnam grew out of the 1954 Geneva settlement, which divided Vietnam “temporarily” at the 17th parallel and called for nationwide elections in 1956. The United States did not sign that agreement and instead backed its own government in the South under Ngo Dinh Diem, whom the Office of the Historian describes as unpopular, and supported SEATO to defend the region. The state ended when North Vietnamese tanks entered Saigon in 1975.",
  connections: [
    { id: "st-geneva-1954", note: "The accords that created a temporary division of Vietnam" },
    { id: "mx-vietnam-war", note: "Its war with North Vietnam, in which the US backed the South" },
    { id: "st-fall-of-saigon", note: "NVA tanks at the Presidential Palace ended the state" },
  ],
  cites: [
    { t: "Dien Bien Phu & the Fall of French Indochina, 1954 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1953-1960/dien-bien-phu", k: "archive" },
    { t: "Ending the Vietnam War, 1969–1973 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1969-1976/ending-vietnam", k: "archive" },
  ],
});

TL.enrich("mx-vietnam-war", {
  why: "The Office of the Historian notes that the 1964 Gulf of Tonkin Resolution, passed after attacks of which one was later doubted, became the legal basis for the Johnson and Nixon administrations' prosecution of the war. Its long aftermath reached far beyond Vietnam: over 3 million people left Vietnam, Laos and Cambodia in the refugee crisis after 1975, unexploded bombs still kill or maim people in Laos, and “Vietnam syndrome,” a term Wikipedia says Ronald Reagan coined, came to mean American reluctance to intervene militarily abroad.",
  connections: [
    { id: "st-fall-of-saigon", note: "North Vietnam's capture of Saigon ended the war" },
    { id: "mx-cambodian-genocide", note: "Spillover destabilized Cambodia, where the Khmer Rouge took power" },
  ],
  cites: [
    { t: "The Gulf of Tonkin Incident, 1964 — Office of the Historian", u: "https://history.state.gov/milestones/1961-1968/gulf-of-tonkin", k: "archive" },
    { t: "Vietnam War — Wikipedia", u: "https://en.wikipedia.org/wiki/Vietnam_War" },
    { t: "Cambodia — Wikipedia", u: "https://en.wikipedia.org/wiki/Cambodia" },
  ],
});

TL.enrich("st-fall-of-saigon", {
  why: "The fall of Saigon came two years after the January 1973 peace agreement let the United States withdraw and bring home its prisoners of war. Neither Vietnamese side abided by the settlement, and President Nixon's promises to react “very strongly and rapidly” to violations went unmet amid congressional reluctance, economic constraints and Watergate. Vietnam was reunified as one socialist republic in 1976, and many South Vietnamese were sent to re-education camps.",
  connections: [
    { id: "vietnam", note: "North and South were merged into one state in 1976" },
    { id: "st-watergate", note: "Watergate helped keep the US from re-entering the war" },
  ],
  cites: [
    { t: "Ending the Vietnam War, 1969–1973 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1969-1976/ending-vietnam", k: "archive" },
    { t: "Vietnam War — Wikipedia", u: "https://en.wikipedia.org/wiki/Vietnam_War" },
  ],
});

TL.enrich("mx-cambodian-genocide", {
  why: "The Khmer Rouge rose amid the Vietnam War's spillover: a US bombing campaign devastated rural Cambodia from 1970 to 1973, and historian Ben Kiernan argues the movement would not have won power without US destabilization of the country. The regime persecuted professionals, Buddhist monks and minorities, waging its fiercest campaign against the Muslim Cham. Cambodia's Extraordinary Chambers, set up to try the regime's leaders, later found Nuon Chea and Khieu Samphan guilty of genocide against the ethnic Vietnamese, and Nuon Chea also of genocide of the Cham.",
  connections: [
    { id: "mx-vietnam-war", note: "War spillover and US bombing helped the Khmer Rouge to power" },
    { id: "st-cambodia-china-wars", note: "Vietnam's invasion toppled the regime in January 1979" },
  ],
  cites: [
    { t: "Cambodia — United States Holocaust Memorial Museum", u: "https://www.ushmm.org/genocide-prevention/countries/cambodia", k: "museum" },
    { t: "Cambodian genocide — Wikipedia", u: "https://en.wikipedia.org/wiki/Cambodian_genocide" },
  ],
});

TL.enrich("space-age", {
  why: "NASA historian Roger Launius writes that Sputnik had a \"Pearl Harbor\" effect on American opinion and that with it \"the Space Age had been born.\" The shock led the United States to strengthen and rename the NACA, and the race that followed led to Apollo 11, whose primary objective was a crewed lunar landing. Since November 2, 2000, the International Space Station, operated by an international partnership of the US, Russian, European, Japanese and Canadian space agencies, has been continuously crewed, and NASA now describes it as a springboard for crewed missions to the Moon and Mars.",
  connections: [
    { id: "g7-iss-occupied", note: "Continuous human presence in orbit since November 2, 2000" },
  ],
  cites: [
    { t: "Sputnik and the Origins of the Space Age, by Roger D. Launius — NASA History", u: "https://www.nasa.gov/history/sputnik/sputorig.html", k: "reference" },
    { t: "The International Space Station Marks 25 Years of Continuous Human Presence — NASA", u: "https://www.nasa.gov/history/the-international-space-station-marks-25-years-of-continuous-human-presence/", k: "primary" },
    { t: "Apollo 11 — NASA", u: "https://www.nasa.gov/mission/apollo-11/", k: "primary" },
  ],
});

TL.enrich("g7-sputnik", {
  why: "By making the Soviets appear to lead in a major field of technology, Sputnik fed US fears of having fallen behind and intensified Cold War tensions. Fear of a “missile gap” between US and Soviet nuclear arsenals shaped the 1960 presidential election, and after a failed Vanguard launch the United States orbited its first satellite, Explorer, on January 31, 1958. Congress expanded the NACA into NASA that July, and the Office of the Historian says Sputnik “fueled both the space race and the arms race.”",
  connections: [
    { id: "space-age", note: "The launch that began the Space Age" },
    { id: "nuclear-age", note: "Fed fears of a “missile gap” between US and Soviet nuclear arsenals" },
  ],
  cites: [
    { t: "Sputnik, 1957 — Office of the Historian", u: "https://history.state.gov/milestones/1953-1960/sputnik", k: "archive" },
    { t: "Sputnik and the Origins of the Space Age, by Roger D. Launius — NASA History", u: "https://www.nasa.gov/history/sputnik/sputorig.html", k: "reference" },
    { t: "Apollo 11 — NASA", u: "https://www.nasa.gov/mission/apollo-11/", k: "primary" },
  ],
});

TL.enrich("cuba", {
  why: "Fidel Castro's government quickly severed Cuba's close ties with the United States, expropriating US economic assets and building links with the Soviet Union. After the failed Bay of Pigs invasion of 1961 strengthened Castro and he declared a socialist path, the Kennedy administration turned to covert efforts to remove him. Soviet nuclear missiles on the island brought what the Office of the Historian calls the most dangerous US–Soviet confrontation of the Cold War.",
  connections: [
    { id: "st-bay-of-pigs", note: "The failed US-backed invasion strengthened Castro's position" },
    { id: "g7-cuban-missile-crisis", note: "Soviet missiles in Cuba brought the superpowers close to nuclear war" },
  ],
  cites: [
    { t: "The Bay of Pigs Invasion and its Aftermath, April 1961–October 1962 — Office of the Historian", u: "https://history.state.gov/milestones/1961-1968/bay-of-pigs", k: "archive" },
  ],
});

TL.enrich("g7-cuban-missile-crisis", {
  why: "Kennedy and Khrushchev settled the crisis with a public Soviet pledge to remove the missiles in return for a US guarantee not to attack Cuba; privately, Robert Kennedy told the Soviet ambassador that US Jupiter missiles would leave Turkey, as they did in April 1963. Having come so close to nuclear war, the two powers set up a direct White House–Kremlin “Hotline” and took the first steps toward a nuclear test ban treaty.",
  connections: [
    { id: "st-bay-of-pigs", note: "Covert US efforts against Castro after the Bay of Pigs preceded the crisis" },
    { id: "g7-test-ban-treaty", note: "The crisis led to the first steps toward a test ban treaty" },
    { id: "cuba", note: "Soviet missiles were placed in Castro's Cuba" },
  ],
  cites: [
    { t: "The Cuban Missile Crisis, October 1962 — Office of the Historian", u: "https://history.state.gov/milestones/1961-1968/cuban-missile-crisis", k: "archive" },
    { t: "The Bay of Pigs Invasion and its Aftermath, April 1961–October 1962 — Office of the Historian", u: "https://history.state.gov/milestones/1961-1968/bay-of-pigs", k: "archive" },
  ],
});

TL.enrich("drc", {
  why: "The Office of the Historian calls the Congo the first of several proxy Cold War confrontations in decolonizing Africa: Katanga seceded, a UN force intervened, and Prime Minister Patrice Lumumba was dismissed and killed in January 1961 while US officials had discussed assassination plans. Mobutu, valued in Washington as an ally against communism, ruled as a personalist dictator until the First Congo War toppled him. The Second Congo War cost an estimated several million lives, and the country, rich in minerals, remains among the world's poorest, with Rwanda-backed M23 rebels holding Goma in 2025.",
  connections: [
    { id: "mx-congo-crisis", note: "The crisis that followed independence" },
    { id: "mx-second-congo-war", note: "Estimated several million deaths" },
    { id: "cold-war", note: "A proxy confrontation between the United States and the Soviet Union" },
  ],
  cites: [
    { t: "The Congo, Decolonization, and the Cold War, 1960–1965 — Office of the Historian", u: "https://history.state.gov/milestones/1961-1968/congo-decolonization", k: "archive" },
    { t: "Democratic Republic of the Congo — Wikipedia", u: "https://en.wikipedia.org/wiki/Democratic_Republic_of_the_Congo" },
  ],
});

TL.enrich("non-aligned-movement", {
  why: "Newly independent states of Asia and Africa, the Office of the Historian notes, “banded together to avoid being forced to take sides in the Cold War contest,” and the 1955 Bandung Conference laid the foundation for the movement. US observers worried that Bandung's anti-colonialism could turn anti-Western. Wikipedia lists Tito, Nasser, Nehru, Nkrumah and Sukarno as leading the initiative; after the Cold War it shifted toward unity among developing nations. Its members make up nearly two-thirds of the UN's members, and it held its 19th summit in Kampala in January 2024.",
  connections: [
    { id: "g7-bandung", note: "Laid the foundation for the movement" },
    { id: "yugoslavia", note: "Founded in Belgrade on the initiative of Yugoslavia's Tito, among others" },
    { id: "decolonization", note: "Brought together recently independent nations" },
  ],
  cites: [
    { t: "Bandung Conference (Asian-African Conference), 1955 — Office of the Historian", u: "https://history.state.gov/milestones/1953-1960/bandung-conf", k: "archive" },
    { t: "Non-Aligned Movement — Wikipedia", u: "https://en.wikipedia.org/wiki/Non-Aligned_Movement" },
  ],
});

TL.enrich("ghana", {
  why: "Ghana's independence came amid a wave in which, the Office of the Historian notes, three dozen new states in Asia and Africa achieved autonomy or independence between 1945 and 1960. Kwame Nkrumah promoted Pan-Africanism and helped found the Non-Aligned Movement, but he was overthrown in a 1966 coup. Alternating military and civilian governments followed until a new constitution restored multiparty politics and the Fourth Republic began in 1993. The 2000 election was the first transfer of power between legitimately elected heads of state under the Fourth Republic.",
  connections: [
    { id: "st-ghana-coup", note: "The army overthrew Nkrumah in 1966" },
    { id: "non-aligned-movement", note: "Nkrumah was among the movement's founding leaders" },
  ],
  cites: [
    { t: "Decolonization of Asia and Africa, 1945–1960 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1945-1952/asia-and-africa", k: "archive" },
    { t: "Ghana — Wikipedia", u: "https://en.wikipedia.org/wiki/Ghana" },
    { t: "Non-Aligned Movement — Wikipedia", u: "https://en.wikipedia.org/wiki/Non-Aligned_Movement" },
  ],
});

TL.enrich("oau", {
  why: "In the African Union's own account, the OAU centered on “the fight for decolonisation and apartheid.” African leaders later agreed to shift its focus toward cooperation and integration to drive growth and development: the 1999 Sirte Declaration called for an African Union, launched at Durban in 2002 as the OAU's successor, whose long-term plan, Agenda 2063, envisions “an integrated, prosperous and peaceful Africa.”",
  connections: [
    { id: "g7-sirte-declaration", note: "OAU leaders called for an African Union in 1999" },
    { id: "african-union", note: "Its successor, launched at Durban in 2002" },
    { id: "st-apartheid", note: "Ending apartheid was a central OAU cause" },
  ],
  cites: [
    { t: "From the Organization of African Unity (OAU) to the African Union (AU) — African Union", u: "https://oau60.au.int/en/organization-african-unity-oau-african-union-au", k: "primary" },
  ],
});

TL.enrich("sudan", {
  why: "Sudan's independence left unresolved conflicts over language, religion and power between north and south: a first civil war began even before independence, in 1955, and a second ended in South Sudan's secession in 2011. Under Omar al-Bashir's military rule (1989–2019), Wikipedia says the regime killed an estimated 300,000 to 400,000 people, and its Darfur death toll is estimated at 300,000. Since April 2023 a war between the army and the Rapid Support Forces has displaced about 14 million people, which the UN calls “the world's largest humanitarian and displacement crisis,” with famine confirmed in Darfur and the Kordofans.",
  connections: [
    { id: "south-sudan", note: "The south seceded after decades of civil war" },
    { id: "st-sudan-war-2023", note: "The army–RSF war that began on April 15, 2023" },
  ],
  cites: [
    { t: "Sudan — Wikipedia", u: "https://en.wikipedia.org/wiki/Sudan" },
    { t: "World failing Sudan as war enters a fourth year, UN relief chief warns — UN News", u: "https://news.un.org/en/story/2026/04/1167301", k: "news" },
  ],
});

TL.enrich("rwanda", {
  why: "Belgian rule entrenched a pro-Tutsi policy and, from 1935, identity cards that fixed people as Hutu, Tutsi or Twa. The 1959 revolution saw Hutu activists kill Tutsi and drive more than 100,000 people into neighboring countries, and independence brought a Hutu-dominated republic; refugees later formed the Rwandan Patriotic Front, whose 1990 invasion began a civil war. In 1994 the extremist-led government set out, the US Holocaust Memorial Museum says, to wipe out the Tutsi minority, and between 500,000 and one million people were killed.",
  connections: [
    { id: "st-rwandan-genocide", note: "About 100 days of killing of Tutsi and moderate Hutu" },
  ],
  cites: [
    { t: "Rwanda — Wikipedia", u: "https://en.wikipedia.org/wiki/Rwanda" },
    { t: "Rwanda — United States Holocaust Memorial Museum", u: "https://www.ushmm.org/genocide-prevention/countries/rwanda", k: "museum" },
  ],
});

TL.enrich("kenya", {
  why: "Disputes between Britain and the colony led to the Mau Mau revolt from 1952, which preceded independence. Under Jomo Kenyatta opposition parties were outlawed, and Kenya had 26 years of single-party rule before moving to a multiparty system in 1991; observers judged the 2002 election, which ended KANU's rule, free and fair. Its economy is now the largest in East and Central Africa, with Nairobi a regional commercial hub.",
  connections: [
    { id: "st-mau-mau", note: "The revolt against British rule that began in 1952" },
  ],
  cites: [
    { t: "Kenya — Wikipedia", u: "https://en.wikipedia.org/wiki/Kenya" },
  ],
});

TL.enrich("nigeria", {
  why: "Africa's most populous country and the world's sixth-most populous, with more than 242 million people, Nigeria joined more than 250 ethnic groups speaking 500 languages in one federation. Independence was followed by a civil war over Biafra, in which estimates of the dead range from one to three million, and a series of military dictatorships until a stable democracy was established in 1999. It is now one of Africa's largest economies, alongside South Africa and Egypt.",
  connections: [
    { id: "st-nigeria-civil-war", note: "The Biafran war, 1967–1970" },
  ],
  cites: [
    { t: "Nigeria — Wikipedia", u: "https://en.wikipedia.org/wiki/Nigeria" },
  ],
});

TL.enrich("algeria", {
  why: "Independence came through one of decolonization's bloodiest wars: estimates of Algerian deaths range from 400,000 (French historians' lower figure) to 1.5 million (Algerian historians' estimate), and war crimes included massacres, rape and torture. The war brought down France's Fourth Republic and led Charles de Gaulle, first president of the Fifth, to negotiate the 1962 Évian Accords. About 900,000 European settlers fled to France within months, as did some 90,000 people from Harki families, whose descendants form a significant part of the Algerian population in France today.",
  connections: [
    { id: "st-algerian-war", note: "The 1954–1962 war of independence" },
    { id: "st-fifth-republic", note: "The war caused the fall of France's Fourth Republic" },
  ],
  cites: [
    { t: "Algerian War — Wikipedia", u: "https://en.wikipedia.org/wiki/Algerian_War" },
    { t: "Algeria — Wikipedia", u: "https://en.wikipedia.org/wiki/Algeria" },
  ],
});

TL.enrich("tunisia", {
  why: "Habib Bourguiba ruled independent Tunisia as its first president from 1957 until 1987, when Prime Minister Zine El Abidine Ben Ali took power in a bloodless coup. Protests against Ben Ali in 2010–11 forced him to flee and inspired the Arab Spring across the Arab world; from 2014 to 2020 Tunisia was considered the only democratic state in the Arab world, and its National Dialogue Quartet won the 2015 Nobel Peace Prize. In July 2021 President Kais Saied unilaterally suspended parliament.",
  connections: [
    { id: "mx-tunisian-revolution", note: "Ben Ali's fall inspired the Arab Spring" },
  ],
  cites: [
    { t: "Tunisia — Wikipedia", u: "https://en.wikipedia.org/wiki/Tunisia" },
  ],
});

TL.enrich("st-bangladesh-war", {
  why: "The war followed Pakistan's refusal to let the winners of the 1970 election, a party advocating autonomy for the East, take power, and a crackdown that sent a massive flow of refugees into India. It drew in the Cold War: India had signed a mutual-assistance treaty with the Soviet Union, while Washington backed Pakistan, which was helping it open ties with China, and sent the USS Enterprise toward the Bay of Bengal. The Office of the Historian sees the outcome as marking India's emergence as the subcontinent's most significant power.",
  connections: [
    { id: "st-nixon-china", note: "Pakistan was the channel for the US opening to China" },
    { id: "india", note: "Indian forces' victory made India the subcontinent's leading power" },
  ],
  cites: [
    { t: "The South Asia Crisis and the Founding of Bangladesh, 1971 — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1969-1976/south-asia", k: "archive" },
  ],
});

TL.enrich("st-six-day-war", {
  why: "The war followed Soviet arms sales to Egypt and other Arab states, Palestinian guerrilla attacks inside Israel and Egypt's closure of the Straits of Tiran. Its territorial outcome still shapes the conflict: UN Security Council Resolution 242 called for Israel's withdrawal from “territories occupied in the recent conflict” in return for recognition and peace, and the Office of the Historian notes that this “land for peace” formula has remained the basis of all US Middle East peacemaking efforts.",
  connections: [
    { id: "st-camp-david", note: "Egypt sought Israel's withdrawal to the June 4, 1967, borders" },
  ],
  cites: [
    { t: "The 1967 Arab-Israeli War — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1961-1968/arab-israeli-war-1967", k: "archive" },
    { t: "Camp David Accords and the Arab-Israeli Peace Process — Office of the Historian, US Department of State", u: "https://history.state.gov/milestones/1977-1980/camp-david", k: "archive" },
  ],
});

TL.enrich("bangladesh", {
  why: "One of the poorest countries in 1971, Bangladesh reached lower-middle-income status within four decades, the World Bank notes, though it reports that poverty has risen again in recent years. Its politics have swung between strongmen and parties: Sheikh Mujibur Rahman was assassinated in 1975, a military dictatorship ruled in the 1980s, and after 1991 power alternated between Khaleda Zia and Sheikh Hasina until a July 2024 uprising forced Hasina to flee. With almost 180 million people, it is among the countries most vulnerable to climate change and shelters over a million Rohingya refugees.",
  connections: [
    { id: "st-bangladesh-war", note: "The 1971 war that created the state" },
    { id: "st-hasina-falls", note: "The 2024 uprising that ended Hasina's rule" },
  ],
  cites: [
    { t: "Bangladesh — World Bank", u: "https://www.worldbank.org/en/country/bangladesh/overview", k: "data" },
    { t: "Bangladesh — Wikipedia", u: "https://en.wikipedia.org/wiki/Bangladesh" },
  ],
});

TL.enrich("malaysia", {
  why: "The new federation of Malaya, Singapore, North Borneo and Sarawak brought heightened tensions, including a conflict with Indonesia, and Singapore was separated from it in August 1965. Strife between communities culminated in the May 13, 1969, race riots, after which the government launched the controversial New Economic Policy to raise the economic share of the bumiputera. Rapid growth and urbanization followed from the 1980s, and the 2018 general election brought the first change of ruling party since independence.",
  connections: [
    { id: "singapore", note: "Singapore was separated from the federation in 1965" },
  ],
  cites: [
    { t: "Malaysia — Wikipedia", u: "https://en.wikipedia.org/wiki/Malaysia" },
  ],
});

TL.enrich("singapore", {
  why: "Separated from Malaysia after two years over ideological differences, Singapore had few natural resources but rapidly developed into one of the Four Asian Tigers. Its People's Action Party has dominated politics continuously since 1959, with Lee Kuan Yew prime minister until 1990. A founding member of ASEAN, it is now a major aviation, financial and shipping hub with the highest PPP-adjusted GDP per capita in the world.",
  connections: [
    { id: "malaysia", note: "It left the federation in 1965 after ideological differences" },
    { id: "asean", note: "One of ASEAN's five founding members in 1967" },
  ],
  cites: [
    { t: "Singapore — Wikipedia", u: "https://en.wikipedia.org/wiki/Singapore" },
  ],
});

TL.enrich("asean", {
  why: "ASEAN was initially motivated, its history notes, by a desire to contain communism, and its members drew closer after the Vietnam War ended in the mid-1970s. The end of the Cold War let it reach across the old divide: Vietnam, once the bloc's adversary, joined in 1995, followed by Laos, Myanmar and Cambodia. Its “ASEAN Way” of consensus has been criticized for yielding only lowest-common-denominator policies, and the crisis in Myanmar has tested the group's unity; with Timor-Leste it now has 11 members and more than 680 million people.",
  connections: [
    { id: "mx-vietnam-war", note: "Members achieved greater cohesion after the war ended" },
    { id: "vietnam", note: "Joined in 1995 as the seventh member, after the Cold War" },
    { id: "st-timor-asean", note: "Timor-Leste became the 11th member in October 2025" },
  ],
  cites: [
    { t: "ASEAN — Wikipedia", u: "https://en.wikipedia.org/wiki/ASEAN" },
  ],
});

TL.enrich("st-cultural-revolution", {
  why: "Red Guards, first organized in schools and universities, attacked the “Four Olds,” destroying historical artifacts and cultural and religious sites; officials and intellectuals were persecuted, universities closed and more than 10 million urban youth were sent to the countryside. Estimates of the dead range from 1 to 2 million, with tens of millions persecuted. In 1981 the Communist Party itself judged the movement responsible for “the most severe setback and the heaviest losses,” and Deng Xiaoping's reforms dismantled its ideology.",
  connections: [
    { id: "st-reform-opening", note: "Deng's reforms dismantled the Cultural Revolution's ideology" },
  ],
  cites: [
    { t: "Cultural Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Cultural_Revolution" },
  ],
});

TL.enrich("st-reform-opening", {
  why: "The reforms broke up commune land into household plots and opened Special Economic Zones such as Shenzhen to foreign investment. The World Bank reports that GDP growth has averaged over 9% a year since 1978, lifting almost 800 million people out of extreme poverty. Economic opening was not matched by political liberalization, which the 1989 Tiananmen crackdown halted; reforms revived after Deng's 1992 southern tour, China joined the WTO in 2001, and critics point to widening inequality and corruption.",
  connections: [
    { id: "st-tiananmen", note: "The crackdown halted further political liberalization" },
    { id: "g7-china-wto", note: "China joined the World Trade Organization in 2001" },
    { id: "st-cultural-revolution", note: "The reforms dismantled Cultural Revolution ideology" },
  ],
  cites: [
    { t: "China — World Bank Group", u: "https://www.worldbank.org/en/country/china/overview", k: "data" },
    { t: "Reform and opening up — Wikipedia", u: "https://en.wikipedia.org/wiki/Reform_and_opening_up" },
    { t: "Cultural Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Cultural_Revolution" },
  ],
});

TL.enrich("st-iranian-revolution", {
  why: "Among the grievances behind the revolution was the 1953 coup, which reinstated the Shah as an absolute monarch, and the perception that he was beholden to the United States. Khomeini's doctrine of velayat-e faqih, guardianship by an Islamic jurist, became the basis of an anti-Western Islamic republic that sought to export its ideas and backed Shia militancy across the region. Oil strikes cut daily output by 4.8 million barrels, and prices rose from $13 a barrel in 1979 to $34 in 1980; the seizure of the US embassy, with diplomats held for 444 days, made the Carter administration look, in the State Department's words, “weak and ineffectual.”",
  connections: [
    { id: "st-iran-coup-1953", note: "The coup that reinstated the Shah was among the revolution's causes" },
  ],
  cites: [
    { t: "Iranian revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Iranian_revolution" },
    { t: "The Iranian Hostage Crisis, A Short History of the Department of State — Office of the Historian", u: "https://history.state.gov/departmenthistory/short-history/iraniancrises", k: "archive" },
  ],
});

TL.enrich("vietnam", {
  why: "Unified Vietnam was at first crippled further by an ineffective planned economy, a Western trade embargo and wars with Cambodia and China. The Communist Party's Đổi Mới reforms of 1986 reintegrated it into the world economy: the World Bank reports that GDP per capita rose from under $500 in 1986 to $5,066 in 2025, and in July 2026 it moved to upper-middle-income status, with a goal of high income by 2045. It remains a one-party communist state criticized for corruption, censorship and its human rights record.",
  connections: [
    { id: "st-cambodia-china-wars", note: "Wars with Cambodia and China crippled the new state" },
    { id: "st-doi-moi", note: "The 1986 reforms that began four decades of rapid growth" },
  ],
  cites: [
    { t: "Viet Nam — World Bank Group", u: "https://www.worldbank.org/en/country/vietnam/overview", k: "data" },
    { t: "Vietnam — Wikipedia", u: "https://en.wikipedia.org/wiki/Vietnam" },
  ],
});

TL.enrich("cambodia", {
  why: "Sihanouk adopted an official policy of Cold War neutrality, yet let Vietnamese communists use Cambodia as a sanctuary and supply route, and spillover from the Vietnam War destabilized the country. Lon Nol's 1970 coup preceded the Khmer Rouge victory and genocide of 1975-1979. A Vietnamese occupation followed, and the 1991 Paris settlement led to a UN-coordinated election and the restoration of the monarchy in 1993. Hun Sen's long rule has been marred by human rights abuses and corruption, and since the 2017 crackdowns Cambodia has been described as a de facto one-party state.",
  connections: [
    { id: "mx-vietnam-war", note: "The war's spillover destabilized Cambodia" },
    { id: "mx-cambodian-genocide", note: "The Khmer Rouge regime of 1975–1979" },
    { id: "st-cambodia-china-wars", note: "Vietnam's invasion deposed the Khmer Rouge" },
  ],
  cites: [
    { t: "Cambodia — Wikipedia", u: "https://en.wikipedia.org/wiki/Cambodia" },
    { t: "Cambodia — United States Holocaust Memorial Museum", u: "https://www.ushmm.org/genocide-prevention/countries/cambodia", k: "museum" },
  ],
});

TL.enrich("ethiopia-modern", {
  why: "Under the Derg, Ethiopia became the Soviet bloc's closest ally in Africa, receiving massive military aid from the Soviet Union, East Germany, Cuba and North Korea, and fought Somalia in the Ogaden War. The 1976–78 Red Terror killed up to 980,000 people by the highest estimates, and about 1.2 million died in the 1983–85 famine, which the government deliberately worsened in rebel areas. Mengistu Haile Mariam fled to Zimbabwe when the regime fell in 1991 and was later convicted in absentia of genocide.",
  connections: [
    { id: "cold-war", note: "Became the Soviet bloc's closest ally in Africa" },
    { id: "eritrea", note: "Eritrean rebels held nearly all of Eritrea as the Derg collapsed" },
  ],
  cites: [
    { t: "Derg — Wikipedia", u: "https://en.wikipedia.org/wiki/Derg" },
  ],
});

TL.enrich("internet", {
  why: "The network grew from research funded by the US agency ARPA, drawing on packet switching developed in parallel by Paul Baran, Donald Davies, Leonard Kleinrock and others. In January 1983 the ARPANET standardized on the TCP/IP protocols adopted by the Department of Defense, and Internet hosts multiplied from about 2,000 in 1985 to over 160,000 by late 1989. The International Telecommunication Union estimates that 76% of the world's population is online in 2026, while 2 billion people remain offline.",
  connections: [
    { id: "g7-tcp-ip", note: "The switch to TCP/IP in January 1983" },
    { id: "g7-itu-2026", note: "About three-quarters of humanity online in 2026" },
    { id: "computing", note: "Grew out of ARPA-funded links between distant computers" },
  ],
  cites: [
    { t: "Internet History of 1960s — Computer History Museum", u: "https://www.computerhistory.org/internethistory/1960s/", k: "museum" },
    { t: "Internet History of 1980s — Computer History Museum", u: "https://www.computerhistory.org/internethistory/1980s/", k: "museum" },
    { t: "ITU-D ICT Statistics — International Telecommunication Union", u: "https://www.itu.int/en/ITU-D/Statistics/pages/stat/default.aspx", k: "data" },
  ],
});

TL.enrich("ai", {
  why: "John McCarthy's proposal for the Dartmouth workshop conjectured that every aspect of learning or any other feature of intelligence could “in principle be so precisely described” that a machine could simulate it. Progress came in waves: by the early 1970s most researchers had rejected neural networks, which revived in the 1980s. In 2012 AlexNet combined deep networks, large datasets and GPU computing; the Computer History Museum traces from it a decade in which neural networks learned to beat Go champions, model language and generate art, culminating in ChatGPT in 2022.",
  connections: [
    { id: "g7-alexnet", note: "The 2012 network combining deep networks, big data and GPUs" },
    { id: "g7-alphago", note: "Neural networks went on to beat champion Go players" },
    { id: "g7-chatgpt", note: "The language model that followed a decade of deep learning" },
  ],
  cites: [
    { t: "Artificial Intelligence (AI) Coined at Dartmouth — Dartmouth College", u: "https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth", k: "primary" },
    { t: "CHM Releases AlexNet Source Code — Computer History Museum", u: "https://computerhistory.org/blog/chm-releases-alexnet-source-code/", k: "museum" },
  ],
});

TL.enrich("mobile-phones", {
  why: "Martin Cooper's original handset, the DynaTAC 8000x, weighed 2.5 pounds and gave 30 minutes of talk time, but he saw it as a “personal telephone” for an individual, and the first US cellular network opened to the public in 1983. The iPhone of 2007 combined a phone, an iPod and an Internet communications device controlled by fingers on a multi-touch screen. The ITU reports that 82% of people aged 10 and over now own a mobile phone, though only 53% do in low-income economies, and women are less likely than men to own one.",
  connections: [
    { id: "g7-iphone", note: "Combined phone, music player and Internet device in 2007" },
    { id: "internet", note: "In Africa, 66% own a phone but only 36% are online" },
  ],
  cites: [
    { t: "Martin Cooper (inventor) — Wikipedia", u: "https://en.wikipedia.org/wiki/Martin_Cooper_(inventor)" },
    { t: "Apple Reinvents the Phone with iPhone (9 Jan 2007) — Apple Newsroom", u: "https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/", k: "primary" },
    { t: "Mobile phone ownership — Facts and Figures 2025, International Telecommunication Union", u: "https://www.itu.int/itu-d/reports/statistics/2025/10/15/ff25-mobile-phone-ownership/", k: "data" },
  ],
});

TL.enrich("climate", {
  why: "C. David Keeling's measurements at Mauna Loa, begun in March 1958, gave scientists a continuous record of rising atmospheric carbon dioxide; NOAA's monthly mean for October 2026 was 426.69 parts per million, up from 424.87 a year earlier. The World Meteorological Organization confirmed 2024 as the warmest year on record, about 1.55°C above the 1850–1900 average and likely the first calendar year above 1.5°C, with 2015–2024 the ten warmest years. WMO stresses that the Paris Agreement's temperature goals are measured over decades, so one year above 1.5°C does not mean they have been missed.",
  connections: [
    { id: "g7-warmest-2024", note: "WMO confirmed 2024 as the warmest year on record" },
    { id: "g7-paris-agreement", note: "Its long-term temperature goals are judged over decades" },
  ],
  cites: [
    { t: "Trends in Atmospheric Carbon Dioxide (Mauna Loa) — NOAA Global Monitoring Laboratory", u: "https://gml.noaa.gov/ccgg/trends/", k: "data" },
    { t: "WMO confirms 2024 as warmest year on record at about 1.55°C above pre-industrial level — World Meteorological Organization", u: "https://wmo.int/news/media-centre/wmo-confirms-2024-warmest-year-record-about-155degc-above-pre-industrial-level", k: "primary" },
  ],
});

TL.enrich("g7-vatican-ii", {
  why: "The council permitted, though it did not require, Mass in vernacular languages, and its decree on ecumenism made restoring Christian unity a principal concern. Its declaration Nostra aetate (1965) said the Church “rejects nothing that is true and holy” in other religions, rejected blaming the Jews for Christ's death and decried antisemitism; another text grounded religious freedom in human dignity. Its meaning remains debated: Archbishop Marcel Lefebvre's Society of Saint Pius X rejects its authority, while Benedict XVI urged reading it as reform rather than rupture.",
  connections: [],
  cites: [
    { t: "Nostra aetate: Declaration on the Relation of the Church to Non-Christian Religions (October 28, 1965) — Holy See", u: "https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_decl_19651028_nostra-aetate_en.html", k: "primary" },
    { t: "Second Vatican Council — Wikipedia", u: "https://en.wikipedia.org/wiki/Second_Vatican_Council" },
  ],
});

TL.enrich("second-wave-feminism", {
  why: "Betty Friedan's book, which named “the problem that has no name,” is widely credited with beginning the movement in the United States. It grew through legal victories such as the Equal Pay Act of 1963, Title VII of the Civil Rights Act of 1964 and Title IX in 1972, though the Equal Rights Amendment fell three states short of ratification. Critics such as Audre Lorde argued that its idea of “sisterhood” ignored differences of race, class and sexuality; many historians date its end to the early 1980s, before third-wave feminism emerged in the early 1990s.",
  connections: [
    { id: "g7-civil-rights-act", note: "Title VII of the 1964 act was among the movement's legal victories" },
  ],
  cites: [
    { t: "Second-wave feminism — Wikipedia", u: "https://en.wikipedia.org/wiki/Second-wave_feminism" },
  ],
});
