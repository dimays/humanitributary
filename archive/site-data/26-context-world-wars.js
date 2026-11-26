// "Why it matters" context and cross-links: 1905–1948, the world wars and their aftermath (November 2026).
// See SCHEMA.md ("Context: why it matters, and connections") and data/20-context-pilot.js for the model.

TL.enrich("lc-einstein-1905", {
  why: "The light paper reached what John Stachel, a historian of the Einstein Papers project, calls a “revolutionary” conclusion: in some respects light behaves like a stream of particles, the light quanta now called photons. The relativity paper, born of an attempt to reconcile mechanics with electromagnetism, offered a new analysis of space and time, and its corollary E=mc² linked mass and energy, a relation confirmed in the 1930s by experiments that turned energy into particles and split atoms. In 1916 Einstein extended the work into the general theory of relativity, a new theory of gravitation.",
  connections: [],
  cites: [
    { t: "Einstein's Discovery of Relativity, by John Stachel — American Institute of Physics", u: "https://history.aip.org/exhibits/einstein/essay-einstein-relativity.htm", k: "paper" },
    { t: "Einstein Exhibit — E=mc2 — American Institute of Physics", u: "https://history.aip.org/exhibits/einstein/emc1.htm", k: "museum" },
    { t: "Albert Einstein, Physics 1921 — NobelPrize.org", u: "https://www.nobelprize.org/prizes/physics/1921/einstein/facts/", k: "reference" },
    { t: "Albert Einstein – Biographical — NobelPrize.org", u: "https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/", k: "reference" },
  ],
});

TL.enrich("belgian-congo", {
  why: "The 1908 takeover was a turning point that also, historians note, kept much continuity: the new Colonial Charter banned forced labor for private profit, but the government kept imposing it by less obvious methods. Belgian rule rested on a “colonial trinity” of state, missions and companies, and by the 1950s the Congo had a wage labor force twice as large as any other African colony's. Independence in 1960 was followed within days by an army mutiny, secessions and a UN intervention, the first, says the Office of the Historian, of several Cold War proxy confrontations over Africa's newly independent states.",
  connections: [
    { id: "congo-free-state", note: "Belgium annexed Leopold II's colony under international pressure over its abuses" },
    { id: "mx-congo-crisis", note: "Independence in 1960 led straight into the five-year Congo Crisis" },
    { id: "cold-war", note: "The new state became an early proxy battleground of the superpowers" },
  ],
  cites: [
    { t: "Belgian Congo — Wikipedia", u: "https://en.wikipedia.org/wiki/Belgian_Congo" },
    { t: "The Congo, Decolonization, and the Cold War, 1960–1965 — Office of the Historian", u: "https://history.state.gov/milestones/1961-1968/congo-decolonization", k: "archive" },
  ],
});

TL.enrich("south-africa", {
  why: "The Union rested on a settlement between British and Boer settlers. To make the 1902 peace acceptable to the Boer republics, Britain dropped any insistence on a vote for Black and white alike, and a delegation that went to London failed to get the vote for all South Africans written into the South Africa Act. The 1913 Natives' Land Act kept most of the land for the white minority; these laws and the Union itself spurred the founding in 1912 of what became the African National Congress. Apartheid laws followed from about 1948, and the Union became a republic in 1961.",
  connections: [
    { id: "lc-second-boer-war", note: "Formed eight years to the day after the peace that ended the war" },
    { id: "st-apartheid", note: "Apartheid was implemented under the Union from about 1948" },
  ],
  cites: [
    { t: "The Union of South Africa 1910 — South African History Online", u: "https://www.sahistory.org.za/article/union-south-africa-1910", k: "archive" },
    { t: "Union of South Africa — Wikipedia", u: "https://en.wikipedia.org/wiki/Union_of_South_Africa" },
  ],
});

TL.enrich("lc-xinhai-revolution", {
  why: "The Qing had struggled to reform and to resist foreign aggression, and after the defeat by Japan in 1895 many concluded that China needed institutional change; Sun Yat-sen argued that only revolution could modernize China and defend its sovereignty. The new republic did not bring stable rule: Yuan Shikai's failure to build a legitimate central government led to decades of division and warlordism. The Office of the Historian sees the founding of the People's Republic in 1949 as completing the upheaval begun in 1911, and both Chinese states claim the revolution's legacy.",
  connections: [
    { id: "roc", note: "The revolution founded the Republic of China" },
    { id: "prc", note: "The PRC's founding in 1949 completed the upheaval begun in 1911" },
    { id: "lc-first-sino-japanese-war", note: "Defeat by Japan convinced many that China needed institutional change" },
  ],
  cites: [
    { t: "1911 Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/1911_Revolution" },
    { t: "The Chinese Revolution of 1949 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/chinese-rev", k: "archive" },
  ],
});

TL.enrich("roc", {
  why: "With 541 million people in 1949, the Republic of China was then the world's most populous country, and it was a founding member of both the League of Nations and the United Nations. Its mainland decades were shaped by war: after Japan invaded Manchuria in 1931, the Office of the Historian notes, it faced a triple threat from Japan, Communist uprising and warlords, and wartime corruption and suppression of dissent left the Nationalist government vulnerable to the Communists, who won the civil war in 1949. The ROC government has continued on Taiwan ever since.",
  connections: [
    { id: "st-roc-to-taiwan", note: "Defeated in 1949, its government retreated to Taiwan" },
    { id: "st-mukden", note: "After Japan seized Manchuria in 1931, the ROC faced a triple threat" },
  ],
  cites: [
    { t: "Republic of China (1912–1949) — Wikipedia", u: "https://en.wikipedia.org/wiki/Republic_of_China_(1912–1949)" },
    { t: "The Chinese Revolution of 1949 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/chinese-rev", k: "archive" },
  ],
});

TL.enrich("lc-world-war-i", {
  why: "The war caused 15 to 22 million military and civilian deaths, and the collapse of the Russian, German, Austro-Hungarian and Ottoman empires redrew national boundaries, creating new states including Poland, Finland, the Baltic states, Czechoslovakia and Yugoslavia. The Office of the Historian traces the League of Nations to international revulsion at the war's unprecedented destruction. In Germany, the US Holocaust Memorial Museum notes, postwar economic chaos and fear increased public longing for authoritarian leadership; the Wikipedia article adds that the League's failure to manage interwar instability contributed to the outbreak of the Second World War.",
  connections: [
    { id: "lc-treaty-of-versailles", note: "The peace treaty with Germany, which cost it 13 percent of its territory" },
    { id: "league-of-nations", note: "Founded out of revulsion at the war's unprecedented destruction" },
    { id: "ww2", note: "Wikipedia: the League's failure to manage interwar instability contributed to WWII" },
  ],
  cites: [
    { t: "World War I — Wikipedia", u: "https://en.wikipedia.org/wiki/World_War_I" },
    { t: "World War I: Aftermath — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/world-war-i-aftermath", k: "museum" },
    { t: "Treaty of Versailles — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/treaty-of-versailles", k: "museum" },
    { t: "The League of Nations, 1920 — Office of the Historian", u: "https://history.state.gov/milestones/1914-1920/league", k: "archive" },
  ],
});

TL.enrich("mx-panama-canal-opens", {
  why: "The canal met a goal US and British leaders had pursued throughout the 1800s, a quick, cheap sea route between the Atlantic and Pacific, after a French effort led by Suez builder Ferdinand de Lesseps collapsed with about 20,000 lives lost to disease. The Office of the Historian calls it a symbol of US technological prowess and economic power. US control of a Canal Zone, won by backing Panama's 1903 secession, became an irritant: after 1964 riots, the Torrijos–Carter Treaties, ratified in 1978, set the handover of the canal for December 31, 1999.",
  connections: [
    { id: "lc-panama-independence", note: "US support for Panama's secession secured the rights to build" },
    { id: "lc-suez-canal", note: "The failed French attempt was led by the builder of the Suez Canal" },
  ],
  cites: [
    { t: "Building the Panama Canal, 1903–1914 — Office of the Historian", u: "https://history.state.gov/milestones/1899-1913/panama-canal", k: "archive" },
    { t: "The Panama Canal and the Torrijos-Carter Treaties — Office of the Historian", u: "https://history.state.gov/milestones/1977-1980/panama-canal", k: "archive" },
  ],
});

TL.enrich("lc-armenian-genocide", {
  why: "The US Holocaust Memorial Museum notes it is sometimes called the first genocide of the twentieth century: of about 1.5 million Armenians in the empire, at least 664,000 and possibly 1.2 million died in 1915–16. It unfolded in wartime, as deportations begun in the border regions, out of fear Armenians would join invading troops, spread to almost every province. The jurist Raphael Lemkin said reading about these crimes shaped his belief that groups needed legal protection; he coined the word “genocide” and championed the UN Genocide Convention of 1948.",
  connections: [
    { id: "lc-world-war-i", note: "Fearing Armenians would join invaders, Ottoman rulers began deportations in 1915" },
    { id: "g7-war-crimes-trials", note: "Lemkin, moved by the Armenian case, got “genocide” into the Nuremberg indictment" },
    { id: "holocaust", note: "Lemkin coined “genocide” in a 1944 book documenting Nazi atrocities" },
  ],
  cites: [
    { t: "The Armenian Genocide (1915-16): Overview — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/the-armenian-genocide-1915-16-overview", k: "museum" },
    { t: "Coining a Word and Championing a Cause: The Story of Raphael Lemkin — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/coining-a-word-and-championing-a-cause-the-story-of-raphael-lemkin", k: "museum" },
  ],
});

TL.enrich("lc-october-revolution", {
  why: "The new government took Russia out of the war in December 1917, repudiated its debts to the Allies and published their secret treaties; the Allies refused to recognize it and left it out of the peace conference. The civil war that followed caused an estimated 7 to 12 million casualties, mostly civilians; the Western Allies armed and supported the Whites, and Japanese, British, US and French forces intervened. The Bolsheviks won, and their republics were merged into the Soviet Union in December 1922. The United States did not resume diplomatic relations until November 16, 1933.",
  connections: [
    { id: "ussr", note: "The Bolshevik state became the Soviet Union in 1922" },
    { id: "lc-world-war-i", note: "The Bolsheviks pulled Russia out of the war" },
  ],
  cites: [
    { t: "The Paris Peace Conference and the Treaty of Versailles — Office of the Historian", u: "https://history.state.gov/milestones/1914-1920/paris-peace", k: "archive" },
    { t: "Russian Civil War — Wikipedia", u: "https://en.wikipedia.org/wiki/Russian_Civil_War" },
    { t: "Soviet Union — Wikipedia", u: "https://en.wikipedia.org/wiki/Soviet_Union" },
    { t: "Union of Soviet Socialist Republics (USSR) — Office of the Historian", u: "https://history.state.gov/countries/soviet-union", k: "archive" },
  ],
});

TL.enrich("lc-influenza-pandemic", {
  why: "The CDC calls it the most severe pandemic in recent history, with at least 50 million deaths, about 675,000 of them in the United States. Unusually, it killed many healthy adults aged 20 to 40. With no vaccine and no antibiotics for the secondary bacterial infections it caused, control was limited to isolation, quarantine, hygiene and limits on gatherings, applied unevenly. The close quarters and massive troop movements of World War I hastened its spread, and wartime censors suppressed bad news; researchers later reconstructed the virus at the CDC to help prepare for future pandemics.",
  connections: [
    { id: "lc-world-war-i", note: "Wartime troop movements and crowding hastened the pandemic's spread" },
    { id: "antibiotics", note: "There were not yet antibiotics to treat the flu's bacterial complications" },
  ],
  cites: [
    { t: "1918 Pandemic (H1N1 virus) — CDC", u: "https://archive.cdc.gov/www_cdc_gov/flu/pandemic-resources/1918-pandemic-h1n1.html", k: "reference" },
    { t: "Spanish flu — Wikipedia", u: "https://en.wikipedia.org/wiki/Spanish_flu" },
  ],
});

TL.enrich("poland", {
  why: "Restoring Poland was the thirteenth of Woodrow Wilson's Fourteen Points, which called for an independent Polish state with access to the sea. The Treaty of Versailles defined its western border, giving it the former German provinces of West Prussia, Poznań and Upper Silesia, and a “Polish Corridor” to the Baltic divided the bulk of Germany from East Prussia. Hitler's demands centered on Danzig and the corridor; Germany's invasion on September 1, 1939, began World War II, and under the Nazi–Soviet pact Soviet forces attacked from the east on September 17.",
  connections: [
    { id: "me-partitions-poland", note: "Reborn after the late-18th-century partitions erased it from the map" },
    { id: "ww2", note: "Germany's invasion of Poland began the war" },
  ],
  cites: [
    { t: "President Wilson's Fourteen Points — Avalon Project, Yale Law School", u: "https://avalon.law.yale.edu/20th_century/wilson14.asp", k: "primary" },
    { t: "Poland — Office of the Historian", u: "https://history.state.gov/countries/poland", k: "archive" },
    { t: "Invasion of Poland, Fall 1939 — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/invasion-of-poland-fall-1939", k: "museum" },
    { t: "Polish Corridor — Wikipedia", u: "https://en.wikipedia.org/wiki/Polish_Corridor" },
    { t: "Second Polish Republic — Wikipedia", u: "https://en.wikipedia.org/wiki/Second_Polish_Republic" },
  ],
});

TL.enrich("czechoslovakia", {
  why: "Its constitution named a single “Czechoslovak nation” as the state's creator, though Slovaks complained that the more numerous Czechs dominated the government, and the 1921 census counted about 3.1 million Germans. After 1933 it was Central Europe's only functioning democracy. At Munich in 1938, Britain and France, intent on avoiding war, let Germany annex the Sudetenland, and in March 1939 Germany occupied the rest, making Munich a byword for the futility of appeasement. From 1948 to 1989 its foreign policy was, in the Office of the Historian's words, “the prerogative of the Soviet Union”; it was succeeded by two states at the end of 1992.",
  connections: [
    { id: "st-munich", note: "The 1938 agreement that handed the Sudetenland to Germany" },
    { id: "czech-republic", note: "One of the two states that succeeded it at the end of 1992" },
    { id: "slovakia", note: "The other successor state" },
  ],
  cites: [
    { t: "First Czechoslovak Republic — Wikipedia", u: "https://en.wikipedia.org/wiki/First_Czechoslovak_Republic" },
    { t: "Munich Agreement — Wikipedia", u: "https://en.wikipedia.org/wiki/Munich_Agreement" },
    { t: "Czechoslovakia — Office of the Historian", u: "https://history.state.gov/countries/czechoslovakia", k: "archive" },
  ],
});

TL.enrich("weimar", {
  why: "Germany's first parliamentary democracy carried heavy burdens: the Nazis despised its leaders for signing the Versailles treaty, and a “stab-in-the-back” myth blamed the “November criminals” who had formed the new government for the defeat. Hyperinflation by 1923, which the US Holocaust Memorial Museum links to burdensome reparations, wiped out middle-class savings and destabilized the republic. After a relatively stable “golden era” in 1924–29, the Great Depression, rule by presidential emergency decree and backroom dealing among a small group of politicians brought Hitler to power.",
  connections: [
    { id: "lc-treaty-of-versailles", note: "Its leaders' signing of the treaty was used against the republic" },
    { id: "great-depression", note: "The Depression's crisis boosted the Nazis' popularity" },
    { id: "nazi-germany", note: "Hitler's regime replaced the republic from 1933" },
  ],
  cites: [
    { t: "World War I: Aftermath — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/world-war-i-aftermath", k: "museum" },
    { t: "The Nazi Rise to Power — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/the-nazi-rise-to-power", k: "museum" },
    { t: "Weimar Republic — Wikipedia", u: "https://en.wikipedia.org/wiki/Weimar_Republic" },
  ],
});

TL.enrich("austria", {
  why: "Stripped of its imperial lands, the rump Austrian republic was barred by the 1919 peace treaties from uniting with Germany. Hitler ignored the ban: German troops entered the country on March 12, 1938, and Austria was absorbed into Germany. In 1943 the US, British and Soviet foreign ministers declared the annexation “null and void”; after the war Austria and Vienna were divided into four occupation zones until the State Treaty of May 15, 1955, declared Austria “a free, independent, and neutral state.”",
  connections: [
    { id: "austria-hungary", note: "The German-speaking core left when the Habsburg empire collapsed" },
    { id: "nazi-germany", note: "Annexed by Nazi Germany in March 1938" },
  ],
  cites: [
    { t: "Austria — Office of the Historian", u: "https://history.state.gov/countries/austria", k: "archive" },
    { t: "Anschluss — Wikipedia", u: "https://en.wikipedia.org/wiki/Anschluss" },
    { t: "Austria — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/austria", k: "museum" },
  ],
});

TL.enrich("hungary", {
  why: "Under the 1920 Treaty of Trianon, Hungary lost three-quarters of its prewar territory and two-thirds of its prewar population to neighboring states. It allied with Nazi Germany in World War II and was occupied by German forces after a failed attempt to switch sides in October 1944. After the war it fell under Soviet domination; its revolt on October 24, 1956, was crushed by Soviet forces from November 4, and the United States offered asylum to more than 32,000 refugees. Relations with the US have grown much closer since 1989.",
  connections: [
    { id: "austria-hungary", note: "Left the Habsburg union as the empire collapsed in 1918" },
    { id: "st-hungary-1956", note: "The 1956 revolt against Soviet domination" },
  ],
  cites: [
    { t: "Hungary — Office of the Historian", u: "https://history.state.gov/countries/hungary", k: "archive" },
  ],
});

TL.enrich("yugoslavia", {
  why: "The kingdom was strained from the start: its 1921 constitution sparked tensions among its peoples, and critics such as Ante Trumbić saw its centralized government as favoring Serb hegemony. In 1929 King Alexander imposed a royal dictatorship and renamed the country Yugoslavia, and in April 1941 the Axis powers occupied and partitioned it. Its successor, socialist Yugoslavia, broke apart in 1991–92 as four of its republics declared independence.",
  connections: [
    { id: "austria-hungary", note: "Formed partly from the empire's former South Slav lands" },
    { id: "post-yugoslav-states", note: "Socialist Yugoslavia's breakup in 1991–92 created the successor states" },
  ],
  cites: [
    { t: "Kingdom of Yugoslavia — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Yugoslavia" },
    { t: "Breakup of Yugoslavia — Wikipedia", u: "https://en.wikipedia.org/wiki/Breakup_of_Yugoslavia" },
  ],
});

TL.enrich("lc-treaty-of-versailles", {
  why: "In Article 231 Germany accepted responsibility for the war and liability for reparations, later set at 132 billion gold marks. Germans grew to resent the terms, which they saw as a “dictated peace”; the US Holocaust Memorial Museum notes that the resulting economic chaos destabilized the fragile Weimar Republic, and the Nazis despised the leaders who had signed it. The US Senate rejected the treaty by seven votes in 1920, and the Office of the Historian says it was in time discredited as unenforceable, short-sighted or too extreme, while the League failed to enforce or revise it.",
  connections: [
    { id: "league-of-nations", note: "The League's Covenant formed Part I of the treaty" },
    { id: "weimar", note: "Reparations and resentment destabilized the new republic" },
    { id: "nazi-germany", note: "The Nazis despised the republic's leaders for signing it" },
  ],
  cites: [
    { t: "The Paris Peace Conference and the Treaty of Versailles — Office of the Historian", u: "https://history.state.gov/milestones/1914-1920/paris-peace", k: "archive" },
    { t: "The League of Nations, 1920 — Office of the Historian", u: "https://history.state.gov/milestones/1914-1920/league", k: "archive" },
    { t: "Treaty of Versailles — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/treaty-of-versailles", k: "museum" },
    { t: "The Nazi Rise to Power — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/the-nazi-rise-to-power", k: "museum" },
  ],
});

TL.enrich("mandatory-palestine", {
  why: "The League's mandate made the Balfour Declaration Britain's formal charge: it was to secure “the establishment of the Jewish national home” while safeguarding the civil and religious rights of all inhabitants. The two aims collided. Under the mandate the Jewish share of the population rose from about 11 percent in 1922 to about 17 percent in the 1931 census, and the growth of the Jewish population created much Arab resentment. Britain opposed both a Jewish and an Arab state; the UN's 1947 plan to partition the mandate sparked fighting, and Arab armies invaded as the mandate ended in May 1948.",
  connections: [
    { id: "lc-balfour-declaration", note: "The mandate was charged with putting the declaration into effect" },
    { id: "st-un-partition", note: "The UN's 1947 plan to divide the mandate into two states" },
    { id: "st-1948-war", note: "Arab armies invaded the former mandate as it ended" },
  ],
  cites: [
    { t: "The Palestine Mandate — Avalon Project, Yale Law School", u: "https://avalon.law.yale.edu/20th_century/palmanda.asp", k: "primary" },
    { t: "Mandatory Palestine — Wikipedia", u: "https://en.wikipedia.org/wiki/Mandatory_Palestine" },
    { t: "Creation of Israel, 1948 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/creation-israel", k: "archive" },
    { t: "The Arab-Israeli War of 1948 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/arab-israeli-war", k: "archive" },
  ],
});

TL.enrich("league-of-nations", {
  why: "UN Geneva calls it the first attempt to build a system of collective security, on the idea that an aggressor against one member is an aggressor against all; it also supervised the mandates and began international work on health, drugs and trafficking that paved the way for UN agencies. It never became universal: the United States never joined, and most historians, the Office of the Historian says, hold that it worked much less effectively as a result. When Italy invaded Ethiopia in 1935, League sanctions were never fully applied and left out oil, Britain and France did not close the Suez Canal to Italy, and the crisis is generally regarded as having discredited the League.",
  connections: [
    { id: "un", note: "The League is often called the predecessor of the United Nations" },
    { id: "st-italo-ethiopian", note: "The crisis is generally regarded as having discredited the League" },
    { id: "lc-treaty-of-versailles", note: "Its Covenant was Part I of the treaty" },
  ],
  cites: [
    { t: "League of Nations: overview — UN Geneva", u: "https://www.ungeneva.org/en/about/league-of-nations/overview", k: "primary" },
    { t: "The League of Nations, 1920 — Office of the Historian", u: "https://history.state.gov/milestones/1914-1920/league", k: "archive" },
    { t: "Abyssinia Crisis — Wikipedia", u: "https://en.wikipedia.org/wiki/Abyssinia_Crisis" },
  ],
});

TL.enrich("iraq", {
  why: "Once part of the Ottoman Empire, Iraq came under British administration as a mandate after World War I. A 1920 revolt led Britain to scrap its original mandate plan for a formally sovereign kingdom under effective British administration; Faisal I reigned, while the civil government was led by the British High Commissioner. Britain's formal role ended in 1932, but the kingdom stayed turbulent: a military coup brought Bakr Sidqi to power in 1936, a pro-Nazi government was defeated by Allied forces in 1941, and a 1958 coup ended the monarchy.",
  connections: [
    { id: "ottoman", note: "Formed from Ottoman provinces after the empire's defeat" },
    { id: "league-of-nations", note: "Administered by Britain as a mandate after World War I" },
  ],
  cites: [
    { t: "Kingdom of Iraq — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Iraq" },
    { t: "Iraq — Office of the Historian", u: "https://history.state.gov/countries/iraq", k: "archive" },
  ],
});

TL.enrich("modern-egypt", {
  why: "Egypt had been under British control since 1882, and its 1922 independence was at first largely nominal: Britain kept control of foreign relations, communications, the military and Sudan until the 1936 treaty, and kept troops at the Suez Canal into the 1950s. The monarchy struggled with the nationalist Wafd Party and with the British, and many Egyptians saw it as corrupt and a British puppet; together with defeat in the 1948 war against Israel, this led to the Free Officers' revolution of 1952, and the monarchy was abolished in 1953.",
  connections: [
    { id: "st-1948-war", note: "Defeat in the war helped bring on the 1952 revolution" },
    { id: "sudan", note: "Egypt and Britain agreed in 1953 that Sudan would be independent in 1956" },
  ],
  cites: [
    { t: "Kingdom of Egypt — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Egypt" },
    { t: "Egypt — Office of the Historian", u: "https://history.state.gov/countries/egypt", k: "archive" },
  ],
});

TL.enrich("ireland", {
  why: "The Anglo-Irish Treaty gave 26 counties independence as the Irish Free State, while six counties in the northeast stayed in the United Kingdom. The treaty split Irish nationalists: in the Free State's first months, civil war broke out between the new National Army and anti-Treaty IRA forces who refused to recognize the state. The treaty had ended the three-year War of Independence. In 1937 a new constitution took effect and the state took the name “Ireland.”",
  connections: [
    { id: "lc-anglo-irish-treaty", note: "The treaty that created the Free State" },
    { id: "lc-partition-of-ireland", note: "Six northeastern counties stayed in the UK" },
  ],
  cites: [
    { t: "Irish Free State — Wikipedia", u: "https://en.wikipedia.org/wiki/Irish_Free_State" },
    { t: "Ireland — Office of the Historian", u: "https://history.state.gov/countries/ireland", k: "archive" },
  ],
});

TL.enrich("ussr", {
  why: "Born of the civil war, the USSR became a single-party state with a centrally planned economy, and after Lenin's death Stalin emerged from a power struggle as its undisputed personalist ruler. Forced collectivization and rapid industrialization contributed to a famine in the 1930s that killed millions. With around 27 million casualties, it suffered the most deaths of any country in World War II, then became one of the world's two superpowers; tensions with the United States led to the Cold War, and the USSR was dissolved in 1991.",
  connections: [
    { id: "st-collectivization", note: "Stalin's forced collectivization of farming" },
    { id: "st-holodomor", note: "Part of the 1930s famine that collectivization helped cause" },
    { id: "cold-war", note: "As a superpower it led the Eastern Bloc in the Cold War" },
  ],
  cites: [
    { t: "Soviet Union — Wikipedia", u: "https://en.wikipedia.org/wiki/Soviet_Union" },
    { t: "Union of Soviet Socialist Republics (USSR) — Office of the Historian", u: "https://history.state.gov/countries/soviet-union", k: "archive" },
  ],
});

TL.enrich("turkey", {
  why: "The Treaty of Lausanne won international recognition for Turkey as the Ottoman Empire's successor state and set a population exchange with Greece. Atatürk's reforms then set out to turn the religion-based, multi-communal Ottoman monarchy into a Turkish nation-state governed as a parliamentary republic under a secular constitution. A civil law system replaced Ottoman law derived from Sharia, and women gained the national vote in 1934. They also bred discontent among some Kurdish and Zaza tribes, leading to rebellions in 1925 and 1937. Today Turkey is a geopolitically significant NATO member.",
  connections: [
    { id: "ottoman", note: "The republic replaced the defeated Ottoman Empire" },
    { id: "lc-treaty-of-lausanne", note: "The 1923 treaty won recognition of Turkey as the Ottoman successor state" },
  ],
  cites: [
    { t: "Turkey — Wikipedia", u: "https://en.wikipedia.org/wiki/Turkey" },
    { t: "Turkey — Office of the Historian", u: "https://history.state.gov/countries/turkey", k: "archive" },
  ],
});

TL.enrich("antibiotics", {
  why: "Fleming's mold became the basis of medicines to treat bacterial infections after an Oxford team led by Howard Florey and Ernst Chain began developing it in 1939; US companies and the Department of Agriculture then found new strains and devised mass production, and penicillin saved thousands of lives in the Allied war effort. Soon after, the Oxford team reported penicillin resistance in many bacteria. The WHO now calls antimicrobial resistance, driven by misuse and overuse of the drugs, a major global health threat: bacterial resistance was associated with more than 4.7 million deaths in 2021.",
  connections: [
    { id: "g7-penicillin-war", note: "US mass production made penicillin part of the Allied war effort" },
    { id: "g7-penicillin-nobel", note: "Fleming, Florey and Chain shared the 1945 Nobel Prize" },
    { id: "lc-influenza-pandemic", note: "In 1918 no antibiotics existed for the flu's bacterial complications" },
  ],
  cites: [
    { t: "Sir Alexander Fleming – Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/medicine/1945/fleming/facts/", k: "reference" },
    { t: "History of penicillin — Wikipedia", u: "https://en.wikipedia.org/wiki/History_of_penicillin" },
    { t: "Antimicrobial resistance (fact sheet) — World Health Organization", u: "https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance", k: "reference" },
    { t: "1918 Pandemic (H1N1 virus) — CDC", u: "https://archive.cdc.gov/www_cdc_gov/flu/pandemic-resources/1918-pandemic-h1n1.html", k: "reference" },
  ],
});

TL.enrich("great-depression", {
  why: "Federal Reserve historians call it the longest and deepest downturn in the history of the United States and the modern industrial economy; in 2002 Ben Bernanke, then a Fed governor, acknowledged that the Fed's own mistakes contributed, and the gold standard spread them abroad. In Germany, the US Holocaust Memorial Museum notes, the Depression caused an economic and political crisis in which the Nazis gained support. Policies like high tariffs and competitive devaluations, the Office of the Historian says, taught postwar leaders that economic cooperation was needed for peace.",
  connections: [
    { id: "g7-smoot-hawley", note: "The highest US tariff ever helped stifle world trade" },
    { id: "nazi-germany", note: "The Depression's crisis in Germany boosted Nazi support" },
    { id: "bretton-woods", note: "Its lessons shaped the postwar economic order" },
  ],
  cites: [
    { t: "The Great Depression — Federal Reserve History", u: "https://www.federalreservehistory.org/essays/great-depression", k: "reference" },
    { t: "The Nazi Rise to Power — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/the-nazi-rise-to-power", k: "museum" },
    { t: "Bretton Woods-GATT, 1941–1947 — Office of the Historian", u: "https://history.state.gov/milestones/1937-1945/bretton-woods", k: "archive" },
  ],
});

TL.enrich("g7-wall-street-crash", {
  why: "The Dow Jones average had risen sixfold from 1921 to 1929, with many buyers borrowing most of the price of their shares; on Black Monday, October 28, it fell nearly 13 percent, and by mid-November it had lost almost half its value. It bottomed in summer 1932, 89 percent below its peak, and did not regain its 1929 high until 1954. Federal Reserve historians argue that banking panics, not the crash alone, turned what might have been a short, sharp recession into the Great Depression, and they draw lessons for how central banks should respond to market bubbles and crashes.",
  connections: [
    { id: "great-depression", note: "Bank panics after the crash deepened it into the Depression" },
  ],
  cites: [
    { t: "Stock Market Crash of 1929 — Federal Reserve History", u: "https://www.federalreservehistory.org/essays/stock-market-crash-of-1929", k: "reference" },
    { t: "The Great Depression — Federal Reserve History", u: "https://www.federalreservehistory.org/essays/great-depression", k: "reference" },
  ],
});

TL.enrich("nazi-germany", {
  why: "Between January 1933 and August 1934, Hitler used emergency decrees, the Enabling Act and intimidation to turn a democracy into a dictatorship with no legal limits on his power. The regime annexed Austria in March 1938, occupied the rest of Czechoslovakia in March 1939 and began World War II by invading Poland on September 1, 1939; it and its collaborators murdered six million Jews. After its defeat Germany was divided into four occupation zones, and the Nuremberg tribunal established crimes against humanity as crimes under international law.",
  connections: [
    { id: "holocaust", note: "The regime and its collaborators murdered six million European Jews" },
    { id: "ww2", note: "Its invasion of Poland began the war in Europe" },
    { id: "g7-war-crimes-trials", note: "Its leaders were tried at Nuremberg" },
  ],
  cites: [
    { t: "The Nazi Rise to Power — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/the-nazi-rise-to-power", k: "museum" },
    { t: "Introduction to the Holocaust — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/introduction-to-the-holocaust", k: "museum" },
    { t: "Austria — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/austria", k: "museum" },
    { t: "Munich Agreement — Wikipedia", u: "https://en.wikipedia.org/wiki/Munich_Agreement" },
    { t: "Invasion of Poland, Fall 1939 — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/invasion-of-poland-fall-1939", k: "museum" },
    { t: "Allied-occupied Germany — Wikipedia", u: "https://en.wikipedia.org/wiki/Allied-occupied_Germany" },
    { t: "International Military Tribunal at Nuremberg — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/international-military-tribunal-at-nuremberg", k: "museum" },
  ],
});

TL.enrich("holocaust", {
  why: "The US Holocaust Memorial Museum notes that Weimar instability, fear of communism and the Depression made many Germans more open to Nazi ideas, including antisemitism. Persecution radicalized step by step into the “Final Solution,” the systematic murder of Europe's Jews from 1941, most of them deported by rail to killing centers in occupied Poland; the Nazis also targeted Roma, people with disabilities, Poles and Soviet prisoners of war. Raphael Lemkin, who lost 49 relatives, coined the word “genocide,” and the UN now marks January 27 to promote remembrance and help prevent future genocides.",
  connections: [
    { id: "g7-auschwitz-liberated", note: "The largest Nazi camp, and a symbol of the Holocaust" },
    { id: "g7-war-crimes-trials", note: "Lemkin got “genocide” into the Nuremberg indictment" },
    { id: "lc-armenian-genocide", note: "Lemkin's ideas on protecting groups began with the Armenian case" },
  ],
  cites: [
    { t: "Introduction to the Holocaust — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/introduction-to-the-holocaust", k: "museum" },
    { t: "Coining a Word and Championing a Cause: The Story of Raphael Lemkin — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/coining-a-word-and-championing-a-cause-the-story-of-raphael-lemkin", k: "museum" },
    { t: "Auschwitz — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/auschwitz", k: "museum" },
    { t: "International Day of Commemoration in memory of the victims of the Holocaust — United Nations", u: "https://www.un.org/en/holocaustremembrance/observance/", k: "primary" },
    { t: "The Holocaust and the United Nations Outreach Programme — United Nations", u: "https://www.un.org/en/holocaustremembrance", k: "primary" },
  ],
});

TL.enrich("st-enabling-act", {
  why: "The law let Hitler's government issue laws without parliament, even laws that violated the constitution, and the US Holocaust Memorial Museum says it laid the foundation for the complete Nazification of German society. It passed only because the government suppressed and intimidated other parties, sending SS troops into the chamber on the day of the vote, and manipulated parliamentary rules. Two weeks later a new civil service law let the regime fire employees for their politics or for being Jewish; by July the Nazis were the only legal party, and by August 1934 Hitler was absolute dictator.",
  connections: [
    { id: "weimar", note: "A pivotal step in turning the Weimar democracy into a dictatorship" },
    { id: "holocaust", note: "Its powers were soon used to purge Jews from the civil service" },
  ],
  cites: [
    { t: "The Nazi Rise to Power — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/the-nazi-rise-to-power", k: "museum" },
    { t: "Enabling Act of 1933 — Wikipedia", u: "https://en.wikipedia.org/wiki/Enabling_Act_of_1933" },
  ],
});

TL.enrich("mx-spanish-civil-war", {
  why: "The war drew in Europe's ideological rivals: despite a non-intervention agreement promoted by Britain and France, Germany and Italy kept supplying the Nationalists and the Soviet Union the Republic, and foreign volunteers fought in the International Brigades. The German bombing of Guernica in April 1937 was an attack on civilians rather than a military target. After victory Franco's 1939 Law of Political Responsibilities allowed penalties against anyone who had supported the Republic, even by voting for it, and as Catalonia fell in early 1939 thousands of refugees fled to France.",
  connections: [
    { id: "nazi-germany", note: "German aircraft and supplies backed Franco; its planes bombed Guernica" },
    { id: "ussr", note: "The Soviet Union sent aid to the Republican side" },
  ],
  cites: [
    { t: "Spanish Civil War timeline — Modern Records Centre, University of Warwick", u: "https://warwick.ac.uk/services/library/mrc/explorefurther/digital/scw/simpletimeline2/", k: "archive" },
    { t: "Spanish Civil War — Wikipedia", u: "https://en.wikipedia.org/wiki/Spanish_Civil_War" },
  ],
});

TL.enrich("ww2", {
  why: "The war's end reshaped the world order. Allied planners created the IMF and World Bank at Bretton Woods and the United Nations, which, it was hoped, would prevent another world war; the Nuremberg tribunal established crimes against humanity as crimes under international law. During the war Japan drove the European powers out of Asia, and nationalists there then sought independence rather than a return to colonial rule; decolonization coincided with a new Cold War between the Soviet Union and the United States.",
  connections: [
    { id: "un", note: "Founded as the war ended to prevent another world war" },
    { id: "decolonization", note: "Independence movements surged in Asia after Japan's defeat" },
    { id: "cold-war", note: "Postwar decolonization coincided with the new Cold War" },
  ],
  cites: [
    { t: "Bretton Woods-GATT, 1941–1947 — Office of the Historian", u: "https://history.state.gov/milestones/1937-1945/bretton-woods", k: "archive" },
    { t: "International Military Tribunal at Nuremberg — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/international-military-tribunal-at-nuremberg", k: "museum" },
    { t: "Decolonization of Asia and Africa, 1945–1960 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/asia-and-africa", k: "archive" },
    { t: "History of the United Nations — United Nations", u: "https://www.un.org/en/about-us/history-of-the-un", k: "primary" },
  ],
});

TL.enrich("green-revolution", {
  why: "Borlaug's dwarf wheat made Mexico self-sufficient in wheat by 1956; brought to India and Pakistan in the mid-1960s, it helped both countries double their wheat production within five years, and India's 1968 wheat harvest set a record of 16.5 million tons. Borlaug won the 1970 Nobel Peace Prize. Critics noted the costs: the methods demanded expensive fertilizers, more water and pesticides; ecologists said they reduced soil fertility and genetic diversity, and sociologists and economists found the benefits unevenly shared, with rural impoverishment, debt and displaced farmers.",
  connections: [
    { id: "mx-borlaug-nobel", note: "Borlaug's 1970 Nobel Peace Prize for his work on the Green Revolution" },
  ],
  cites: [
    { t: "Norman Borlaug – Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/peace/1970/borlaug/facts/", k: "reference" },
    { t: "Food security – a history — UK Global Food Security programme", u: "https://www.foodsecurity.ac.uk/challenge/food-security-history/", k: "reference" },
  ],
});

TL.enrich("bretton-woods", {
  why: "Its architects drew on the 1930s, when high tariffs, competitive currency devaluations and discriminatory trading blocs had helped destabilize the international environment without improving the economic situation; they concluded that economic cooperation was the only way to achieve both peace and prosperity. The system fixed currencies to the dollar within a 1 percent band and the dollar to gold at $35 an ounce, and created the IMF and World Bank. With inflation on the rise and a gold run looming, Nixon closed the gold window in 1971, and the Bretton Woods system ended soon after.",
  connections: [
    { id: "great-depression", note: "Designed to avoid the tariffs and devaluations of the 1930s" },
    { id: "g7-nixon-shock", note: "Ending dollar–gold convertibility in 1971 brought the system's end" },
    { id: "gatt", note: "Part of the same postwar economic rule-making, negotiated separately at Geneva in 1947" },
  ],
  cites: [
    { t: "Bretton Woods-GATT, 1941–1947 — Office of the Historian", u: "https://history.state.gov/milestones/1937-1945/bretton-woods", k: "archive" },
    { t: "Creation of the Bretton Woods System — Federal Reserve History", u: "https://www.federalreservehistory.org/essays/bretton-woods-created", k: "reference" },
    { t: "Nixon Ends Convertibility of U.S. Dollars to Gold — Federal Reserve History", u: "https://www.federalreservehistory.org/essays/gold-convertibility-ends", k: "reference" },
  ],
});

TL.enrich("decolonization", {
  why: "There was no single path: some colonies won independence peacefully, others only after long revolutions, and some new states endured decades of dictatorship or civil war. Colonial borders, the Office of the Historian notes, had divided ethnic and linguistic groups and left states with little shared identity. Decolonization coincided with the Cold War, as both superpowers courted the new states, many of which joined the Non-Aligned Movement after the 1955 Bandung conference. It transformed the UN, whose membership grew from 35 in 1946 to 127 by 1970.",
  connections: [
    { id: "g7-bandung", note: "Many new states resisted Cold War blocs after Bandung" },
    { id: "cold-war", note: "Superpower rivalry shaped many new states' paths" },
    { id: "un", note: "New nations nearly quadrupled UN membership by 1970" },
  ],
  cites: [
    { t: "Decolonization of Asia and Africa, 1945–1960 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/asia-and-africa", k: "archive" },
  ],
});

TL.enrich("computing", {
  why: "ENIAC was built to speed up ballistics calculations for the war effort; when it was unveiled at Penn in February 1946, the test run that wowed the media was created by two women whose work, and that of four other women who helped get ENIAC going, was erased from the record. The transistor led the way to more compact digital computers, and the integrated circuit led on to the microprocessor. The shift to digital electronics is also called the Digital Revolution or Third Industrial Revolution, and a Pennsylvania historical marker cites ENIAC's creation in 1946 as the beginning of the Information Age.",
  connections: [
    { id: "g7-transistor", note: "Transistors replaced vacuum tubes, shrinking computers" },
    { id: "industrial-revolution", note: "The digital revolution is also called the Third Industrial Revolution" },
  ],
  cites: [
    { t: "Celebrating Penn Engineering History: ENIAC — University of Pennsylvania", u: "https://www.seas.upenn.edu/about/history-heritage/eniac/", k: "archive" },
    { t: "Digital Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Digital_Revolution" },
  ],
});

TL.enrich("g7-auschwitz-liberated", {
  why: "Auschwitz was the largest Nazi concentration camp by staff, size and number of prisoners, and the US Holocaust Memorial Museum notes it often serves as a symbol of Nazi evil and the Holocaust. Of the roughly 1.1 million people killed there, about one million were Jews; the victims also included about 70,000 Poles, about 21,000 Roma and Sinti and more than 14,000 Soviet prisoners of war. January 27, the anniversary of the liberation, is commemorated as International Holocaust Remembrance Day.",
  connections: [
    { id: "holocaust", note: "The largest Nazi concentration camp and one of five killing centers" },
    { id: "un", note: "January 27, the liberation anniversary, is marked as Holocaust remembrance day" },
  ],
  cites: [
    { t: "Auschwitz — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/auschwitz", k: "museum" },
    { t: "International Day of Commemoration in memory of the victims of the Holocaust — United Nations", u: "https://www.un.org/en/holocaustremembrance/observance/", k: "primary" },
  ],
});

TL.enrich("g7-ve-day", {
  why: "The surrender, first signed at Reims on May 7 and in definitive form in Berlin on May 8, took effect late that evening, which was already May 9 in Moscow; Russia and several other countries still celebrate Victory Day on May 9. With no German government left to answer for order, the four Allies assumed “supreme authority” over Germany on June 5, and they divided it and Berlin into occupation zones. The war with Japan went on until September 2, 1945.",
  connections: [
    { id: "allied-occupied-germany", note: "The four Allies took supreme authority over Germany" },
    { id: "g7-hiroshima-nagasaki", note: "The war in the Pacific continued for almost four months" },
  ],
  cites: [
    { t: "Victory in Europe Day — Wikipedia", u: "https://en.wikipedia.org/wiki/Victory_in_Europe_Day" },
    { t: "Declaration Regarding the Defeat of Germany and the Assumption of Supreme Authority by Allied Powers; June 5, 1945 — Avalon Project, Yale Law School", u: "https://avalon.law.yale.edu/wwii/ger01.asp", k: "primary" },
    { t: "Allied-occupied Germany — Wikipedia", u: "https://en.wikipedia.org/wiki/Allied-occupied_Germany" },
    { t: "Surrender of Japan — Wikipedia", u: "https://en.wikipedia.org/wiki/Surrender_of_Japan" },
  ],
});

TL.enrich("allied-occupied-germany", {
  why: "The Allies divided Germany into four occupation zones and Berlin into four sectors, but, the Office of the Historian notes, the problem of Germany's future was not resolved at Potsdam. From mid-1946 US and British policy shifted toward encouraging German economic expansion, raising the allowed levels of industry. In 1948 the Western powers planned a West German state and introduced the Deutschmark; the Soviets left the Allied Control Council and blockaded West Berlin, the first Berlin crisis of the Cold War. The split led in 1949 to two new German states, West and East Germany.",
  connections: [
    { id: "g7-berlin-blockade", note: "Clashing occupation policies led to the Berlin blockade" },
    { id: "west-germany", note: "The Western zones became the Federal Republic in 1949" },
    { id: "east-germany", note: "The Soviet zone became the German Democratic Republic" },
  ],
  cites: [
    { t: "The Berlin Airlift, 1948–1949 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/berlin-airlift", k: "archive" },
    { t: "Allied-occupied Germany — Wikipedia", u: "https://en.wikipedia.org/wiki/Allied-occupied_Germany" },
    { t: "Industrial plans for Germany — Wikipedia", u: "https://en.wikipedia.org/wiki/Industrial_plans_for_Germany" },
  ],
});

TL.enrich("g7-un-charter-signed", {
  why: "The Charter is an international treaty binding on member states, and it codifies the major principles of international relations, from the sovereign equality of states to the prohibition of the use of force. Its preamble pledged to “save succeeding generations from the scourge of war, which twice in our lifetime has brought untold sorrow to mankind.” Its predecessor, the League of Nations, had not been able to prevent World War II; the new organization came into existence on October 24, 1945,.",
  connections: [
    { id: "league-of-nations", note: "The League, the UN's predecessor, had failed to prevent World War II" },
  ],
  cites: [
    { t: "United Nations Charter — United Nations", u: "https://www.un.org/en/about-us/un-charter", k: "primary" },
    { t: "United Nations Charter (full text) — United Nations", u: "https://www.un.org/en/about-us/un-charter/full-text", k: "primary" },
    { t: "History of the United Nations — United Nations", u: "https://www.un.org/en/about-us/history-of-the-un", k: "primary" },
    { t: "Predecessor: The League of Nations — United Nations", u: "https://www.un.org/en/about-us/history-of-the-un/predecessor", k: "primary" },
  ],
});

TL.enrich("nuclear-age", {
  why: "The world had never seen a nuclear explosion before Trinity. The US nuclear monopoly ended when the Soviet Union tested its first bomb in 1949, followed by Britain in 1952, France in 1960 and China in 1964. The Office of the Historian notes that a form of atomic diplomacy was employed by both sides in the early Cold War; by the mid-1960s the superpowers had reached approximate parity, and the principle of mutually assured destruction applied. Nuclear weapons have not been used in any conflict since World War II.",
  connections: [
    { id: "g7-hiroshima-nagasaki", note: "The two atomic weapons the US used in war, weeks after Trinity" },
    { id: "g7-rds1", note: "The 1949 Soviet test ended the US monopoly" },
    { id: "cold-war", note: "Nuclear threats and deterrence shaped the superpower rivalry" },
  ],
  cites: [
    { t: "Manhattan Project: The Trinity Test, July 16, 1945 — US Department of Energy (OSTI)", u: "https://www.osti.gov/opennet/manhattan-project-history/Events/1945/trinity.htm", k: "archive" },
    { t: "Atomic Diplomacy — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/atomic", k: "archive" },
  ],
});

TL.enrich("g7-hiroshima-nagasaki", {
  why: "Some 70,000 people probably died in Hiroshima from the initial blast, heat and radiation; deaths from radiation sickness peaked three to four weeks later, and survivors faced lifelong cancer risks. Scholars debate the decision: some, following historian Gar Alperovitz, argue the bombs were used to gain leverage over the Soviet Union, while others suggest Truman saw them as necessary to achieve Japan's unconditional surrender. Atomic weapons have not been used in any conflict since.",
  connections: [
    { id: "nuclear-age", note: "Atomic weapons have not been used in any conflict since 1945" },
    { id: "cold-war", note: "Historians debate whether the bombs were also aimed at Soviet leaders" },
  ],
  cites: [
    { t: "Manhattan Project: The Atomic Bombing of Hiroshima, August 6, 1945 — US Department of Energy (OSTI)", u: "https://www.osti.gov/opennet/manhattan-project-history/Events/1945/hiroshima.htm", k: "archive" },
    { t: "Atomic Diplomacy — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/atomic", k: "archive" },
  ],
});

TL.enrich("indonesia", {
  why: "Sukarno, whose nationalist party had sought independence from the Dutch since 1928, proclaimed it with Mohammad Hatta on August 17, 1945, two days after Japan surrendered. The Office of the Historian notes that Indonesian nationalists had fought the Japanese as guerrillas, and that their 1945–50 struggle against the Netherlands came as US leaders feared communists might win power in new states. Indonesia hosted the 1955 Bandung conference, which laid the foundation for the nonaligned movement. In 1965–66 the army under Suharto killed at least 500,000 to 1 million people, mainly suspected communists, with US and British support; Suharto became acting president in 1967.",
  connections: [
    { id: "g7-bandung", note: "Indonesia hosted the 1955 Asian–African conference" },
    { id: "st-indonesia-1965", note: "Army-led killings under Suharto took at least 500,000 to 1 million lives" },
    { id: "decolonization", note: "Its 1945–50 struggle was part of the postwar wave of independence" },
  ],
  cites: [
    { t: "Proclamation of Indonesian Independence — Wikipedia", u: "https://en.wikipedia.org/wiki/Proclamation_of_Indonesian_Independence" },
    { t: "Decolonization of Asia and Africa, 1945–1960 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/asia-and-africa", k: "archive" },
    { t: "Bandung Conference (Asian-African Conference), 1955 — Office of the Historian", u: "https://history.state.gov/milestones/1953-1960/bandung-conf", k: "archive" },
    { t: "Indonesian mass killings of 1965–66 — Wikipedia", u: "https://en.wikipedia.org/wiki/Indonesian_mass_killings_of_1965%E2%80%9366" },
  ],
});

TL.enrich("north-vietnam", {
  why: "A petition for Vietnamese rights that Ho Chi Minh fronted at the 1919 Versailles conference went unconsidered, and from then on he embraced Leninist anti-colonial positions. In World War II the US Office of Strategic Services backed his Viet Minh against Japan, and he declared independence on September 2, 1945, but France sought to reestablish its position, and general war broke out after failed talks in 1946. After the French defeat at Dien Bien Phu in 1954, Vietnam was temporarily divided at the 17th parallel; Eisenhower described the risk of communist expansion as falling dominoes, and the United States did not pull out of Vietnam for another twenty years.",
  connections: [
    { id: "st-geneva-1954", note: "The accords split Vietnam at the 17th parallel" },
    { id: "mx-vietnam-war", note: "The US did not pull out of Vietnam for another twenty years" },
    { id: "lc-treaty-of-versailles", note: "A petition Ho fronted for Vietnamese rights went unconsidered at Versailles" },
  ],
  cites: [
    { t: "Ho Chi Minh — Wikipedia", u: "https://en.wikipedia.org/wiki/Ho_Chi_Minh" },
    { t: "Dien Bien Phu & the Fall of French Indochina, 1954 — Office of the Historian", u: "https://history.state.gov/milestones/1953-1960/dien-bien-phu", k: "archive" },
  ],
});

TL.enrich("un", {
  why: "Decolonization transformed it: membership grew from 35 states in 1946 to 127 by 1970, and the Office of the Historian notes that the new members pushed it to support decolonization. Its Charter, the UN says, codifies principles from the sovereign equality of states to the ban on the use of force; beyond keeping peace, it has delivered humanitarian aid, worked on human rights and taken up the 2030 sustainable development goals and climate action.",
  connections: [
    { id: "league-of-nations", note: "The League of Nations was its predecessor" },
    { id: "decolonization", note: "Newly independent states nearly quadrupled its membership" },
    { id: "g7-sdgs", note: "The 2030 goals are among its newer missions" },
  ],
  cites: [
    { t: "History of the United Nations — United Nations", u: "https://www.un.org/en/about-us/history-of-the-un", k: "primary" },
    { t: "United Nations Charter — United Nations", u: "https://www.un.org/en/about-us/un-charter", k: "primary" },
    { t: "Decolonization of Asia and Africa, 1945–1960 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/asia-and-africa", k: "archive" },
  ],
});

TL.enrich("syria", {
  why: "Syria was among the former Ottoman lands the League of Nations placed under French mandate in 1922. Its early independence was tumultuous: defeat in the 1948 war against Israel helped trigger the March 1949 coup, described as the Arab world's first military overthrow since World War II, and coups and attempts followed until 1971. A brief union with Egypt in 1958–61 ended in a coup; the Ba'ath Party seized power in 1963, and a 1970 coup brought Hafez al-Assad to power. The 2011 uprising became a 13-year civil war that displaced more than 6 million people.",
  connections: [
    { id: "st-1948-war", note: "Defeat in the war helped trigger Syria's first coup in 1949" },
    { id: "st-syrian-civil-war", note: "The 2011 uprising became a long civil war" },
    { id: "st-assad-falls", note: "Ba'athist rule ended with the Assad regime's fall in 2024" },
  ],
  cites: [
    { t: "Syria — Office of the Historian", u: "https://history.state.gov/countries/syria", k: "archive" },
    { t: "Syria — Wikipedia", u: "https://en.wikipedia.org/wiki/Syria" },
  ],
});

TL.enrich("cold-war", {
  why: "The Office of the Historian dates the US Cold War with the Soviet Union to 1947–1989. US strategy rested on George Kennan's “containment” of Soviet expansion, pursued through economic aid such as the Marshall Plan and, from 1950, a large military buildup. Both sides used atomic diplomacy, as in Cuba in 1962, but by the mid-1960s they had reached approximate parity and mutually assured destruction, and atomic weapons were not used in any conflict after World War II. Superpower competition also shaped decolonization, as both sides courted new states.",
  connections: [
    { id: "g7-truman-doctrine", note: "Truman pledged aid to nations resisting subjugation" },
    { id: "nato", note: "The US joined its first peacetime alliance outside the Americas" },
    { id: "g7-cuban-missile-crisis", note: "Soviet missiles in Cuba were a bid for atomic diplomacy" },
  ],
  cites: [
    {"t":"The Truman Doctrine, 1947 — Office of the Historian","u":"https://history.state.gov/milestones/1945-1952/truman-doctrine"},
    { t: "Kennan and Containment, 1947 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/kennan", k: "archive" },
    { t: "North Atlantic Treaty Organization (NATO), 1949 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/nato", k: "archive" },
    { t: "Atomic Diplomacy — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/atomic", k: "archive" },
    { t: "Decolonization of Asia and Africa, 1945–1960 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/asia-and-africa", k: "archive" },
  ],
});

TL.enrich("india", {
  why: "By 1947 Britain's exchequer had been exhausted by World War II and mutinies had broken out in its armed services in February 1946; earlier, in 1942, the Americans had supported independence for India. In the 1950s and 1960s India played a pivotal role in the Non-Aligned Movement. Three of its four wars with Pakistan, beginning with the war of 1947–48, were fought over Kashmir. Its constitution makes untouchability illegal, and today India is the world's most populous country.",
  connections: [
    { id: "non-aligned-movement", note: "India played a pivotal role in the movement in the 1950s and 1960s" },
    { id: "st-kashmir-war", note: "Kashmir's status led to the first war with Pakistan" },
    { id: "st-partition", note: "Independence came with the partition of British India" },
  ],
  cites: [
    { t: "India — Wikipedia", u: "https://en.wikipedia.org/wiki/India" },
    { t: "Partition of India — Wikipedia", u: "https://en.wikipedia.org/wiki/Partition_of_India" },
    { t: "Pakistan — Wikipedia", u: "https://en.wikipedia.org/wiki/Pakistan" },
  ],
});

TL.enrich("pakistan", {
  why: "Pakistan grew from the Pakistan Movement for a Muslim homeland; in its 1946 campaign the Muslim League stressed the danger of a “Hindu threat” in a future united India. Its two geographically separate provinces were East and West Pakistan, and East Pakistan seceded as Bangladesh in 1971 after a nine-month civil war. Its governments have alternated between civilian and military rule; three of its four wars with India were fought over Kashmir; it is a declared nuclear-weapon state; and it was a close US ally during the Soviet–Afghan War of the 1980s.",
  connections: [
    { id: "bangladesh", note: "East Pakistan seceded as Bangladesh in 1971" },
    { id: "st-kashmir-war", note: "The first of several wars with India over Kashmir" },
    { id: "mx-soviet-afghan-war", note: "Pakistan was a close US ally during the war" },
  ],
  cites: [
    { t: "Pakistan — Wikipedia", u: "https://en.wikipedia.org/wiki/Pakistan" },
    { t: "Pakistan Movement — Wikipedia", u: "https://en.wikipedia.org/wiki/Pakistan_Movement" },
    { t: "Pakistan — Office of the Historian", u: "https://history.state.gov/countries/pakistan", k: "archive" },
  ],
});

TL.enrich("st-partition", {
  why: "The Indian National Congress saw itself as representing Indians of all faiths, while the Muslim League argued that Muslims would be treated unfairly in an independent India dominated by Congress; partition divided the provinces of Bengal and the Punjab by district-level Muslim or non-Muslim majorities. It displaced between 12 and 20 million people along religious lines, and estimates of the deaths range from 200,000 to two million. Its violence left an atmosphere of hostility and suspicion between India and Pakistan, and a dispute over Kashmir sparked war in 1947.",
  connections: [
    { id: "st-kashmir-war", note: "Kashmir's contested status led to war in 1947" },
    { id: "pakistan", note: "Created as a separate state for Muslim-majority regions" },
  ],
  cites: [
    { t: "Partition of India — Wikipedia", u: "https://en.wikipedia.org/wiki/Partition_of_India" },
    { t: "Pakistan — Wikipedia", u: "https://en.wikipedia.org/wiki/Pakistan" },
  ],
});

TL.enrich("who", {
  why: "The idea of a global health body was proposed by Brazil and China at the 1945 San Francisco conference that founded the UN. The WHO Constitution defines health as “a state of complete physical, mental and social well-being and not merely the absence of disease or infirmity,” and calls the highest attainable standard of health a fundamental right of every human being. Its intensified campaign from 1967 led it to declare smallpox eradicated in 1980, still the only infectious disease to be eradicated.",
  connections: [
    { id: "un", note: "Proposed at the UN's founding conference; a UN specialized agency" },
    { id: "g7-smallpox-eradicated", note: "WHO's campaign eradicated smallpox by 1980" },
  ],
  cites: [
    { t: "History of WHO — World Health Organization", u: "https://www.who.int/about/history", k: "primary" },
    { t: "Constitution of the World Health Organization — WHO", u: "https://www.who.int/about/governance/constitution", k: "primary" },
    { t: "Smallpox — World Health Organization", u: "https://www.who.int/health-topics/smallpox", k: "reference" },
  ],
});

TL.enrich("israel", {
  why: "After the Holocaust most Jewish displaced persons preferred to go to Palestine. Truman recognized Israel the same day, despite State Department concerns about Soviet influence in the Arab world and Arab oil. Arab states invaded immediately after independence was announced on May 14, 1948; armistices were signed in 1949 with Egypt holding Gaza and Jordan the West Bank, and those lines held until 1967.",
  connections: [
    { id: "holocaust", note: "Most Jewish survivors in displaced-persons camps hoped to emigrate to Palestine" },
    { id: "st-un-partition", note: "The 1947 UN plan proposed Jewish and Arab states" },
    { id: "st-1948-war", note: "Arab armies invaded immediately after Israel's independence announcement" },
  ],
  cites: [
    { t: "Creation of Israel, 1948 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/creation-israel", k: "archive" },
    { t: "The Arab-Israeli War of 1948 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/arab-israeli-war", k: "archive" },
    { t: "History of the Question of Palestine — United Nations", u: "https://www.un.org/unispal/history/", k: "primary" },
    { t: "Introduction to the Holocaust — USHMM Holocaust Encyclopedia", u: "https://encyclopedia.ushmm.org/content/en/article/introduction-to-the-holocaust", k: "museum" },
  ],
});

TL.enrich("st-1948-war", {
  why: "Under the 1949 armistices Jordan held the West Bank and Egypt the Gaza Strip; these armistice lines held until 1967.",
  connections: [
    { id: "st-un-partition", note: "The UN partition vote of November 1947 sparked fighting between Jewish and Arab groups" },
    { id: "modern-egypt", note: "Defeat helped bring on Egypt's 1952 revolution" },
    { id: "syria", note: "Defeat helped trigger Syria's first military coup in 1949" },
  ],
  cites: [
    { t: "The Arab-Israeli War of 1948 — Office of the Historian", u: "https://history.state.gov/milestones/1945-1952/arab-israeli-war", k: "archive" },
    { t: "History of the Question of Palestine — United Nations", u: "https://www.un.org/unispal/history/", k: "primary" },
    { t: "Palestine refugees — UNRWA", u: "https://www.unrwa.org/palestine-refugees", k: "primary" },
    { t: "History — UNRWA", u: "https://www.unrwa.org/who-we-are", k: "primary" },
    { t: "Kingdom of Egypt — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Egypt" },
    { t: "Syria — Wikipedia", u: "https://en.wikipedia.org/wiki/Syria" },
  ],
});
