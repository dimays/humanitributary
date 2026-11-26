// Gap-filling 1925–present: Austria, Baltic states, Belarus, Belgium, Czech Republic, Czechoslovakia, ECSC. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const BRIT = (t, path) => ({ t: `${t} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const BEL = BRIT("Belgium", "place/Belgium");
TL.add({
  events: [
    // ---- Austria
    { id: "w105-third-man", branch: "austria", y: 1949.67, when: "September 1, 1949", imp: 2,
      title: "The Third Man, shot in occupied Vienna, premieres",
      text: "Carol Reed's film noir, set in Allied-occupied Vienna and shot on location there, premiered in the UK; Anton Karas's zither theme topped international charts in 1950.",
      cites: [W("The_Third_Man", "The Third Man"), BRIT("The Third Man", "topic/The-Third-Man")] },
    { id: "w105-staatsoper-reopens", branch: "austria", y: 1955.843, when: "November 5, 1955", imp: 2,
      title: "Vienna State Opera reopens",
      text: "After the Austrian State Treaty, the war-damaged Staatsoper reopened with Beethoven's Fidelio conducted by Karl Böhm.",
      cites: [W("Vienna_State_Opera", "Vienna State Opera")] },
    { id: "w105-art-and-revolution", branch: "austria", y: 1968.43, when: "June 1968", imp: 3,
      title: "Viennese Actionists stage “Art and Revolution”",
      text: "Günter Brus, Otto Mühl and others of the Viennese Actionism movement staged this provocative event in Vienna; Mühl served a month in prison afterward, and Brus was jailed for another action.",
      cites: [W("Viennese_Actionism", "Viennese Actionism")] },
    { id: "w105-kreisky", branch: "austria", y: 1970.30, end: 1983.39, when: "April 21, 1970 – May 24, 1983", imp: 2,
      title: "Bruno Kreisky becomes chancellor",
      text: "Kreisky led Austria's government for 13 years, until the Socialists lost their absolute majority in the 1983 election and he resigned.",
      cites: [W("Bruno_Kreisky", "Bruno Kreisky"), BRIT("Bruno Kreisky", "biography/Bruno-Kreisky")] },
    { id: "w105-hainburg-au", branch: "austria", y: 1984.95, when: "December 1984", imp: 2,
      title: "Activists occupy the Hainburg wetlands",
      text: "Protesters occupied the Danube floodplain to block a hydroelectric power plant backed by the government; the occupation was a turning point for environmental awareness in German-speaking central Europe.",
      cites: [W("Occupation_of_the_Hainburger_Au", "Occupation of the Hainburger Au")] },
    { id: "w105-galtur-avalanche", branch: "austria", y: 1999.12, when: "February 1999", imp: 3,
      title: "Avalanche kills 31 in Galtür",
      text: "An avalanche struck the Tyrolean village of Galtür in February 1999; 31 people died, and a memorial in the village commemorates them.",
      cites: [W("Galt%C3%BCr", "Galtür")] },
    { id: "w105-kampusch-escape", branch: "austria", y: 2006.64, when: "August 23, 2006", imp: 3,
      title: "Natascha Kampusch escapes her kidnapper",
      text: "Abducted in Vienna at age 10 in 1998, Kampusch escaped on August 23, 2006 after more than eight years in a secret cellar; her captor, Wolfgang Přiklopil, killed himself that day.",
      cites: [W("Natascha_Kampusch", "Natascha Kampusch")] },
    { id: "w105-euro-2008", branch: "austria", y: 2008.43, end: 2008.49, when: "June 7–29, 2008", imp: 3,
      title: "Austria and Switzerland co-host UEFA Euro 2008",
      text: "The European football championship was held in eight cities across the two countries; Spain beat Germany in the final.",
      cites: [W("UEFA_Euro_2008", "UEFA Euro 2008")] },
    { id: "w105-conchita-wurst", branch: "austria", y: 2014.36, when: "May 10, 2014", imp: 2,
      title: "Conchita Wurst wins Eurovision",
      text: "Conchita Wurst won the Eurovision Song Contest in Copenhagen with 290 points, Austria's first win since 1966; the New Statesman called her appearance the “most genderqueer yet.”",
      cites: [W("Conchita_Wurst", "Conchita Wurst"), BRIT("Conchita Wurst", "biography/Conchita-Wurst")] },

    // ---- Baltic states
    { id: "w105-estonia-eurovision", branch: "baltic-states", y: 2001.36, when: "May 12, 2001", imp: 3,
      title: "Estonia wins the Eurovision Song Contest",
      text: "Estonia's entry “Everybody” won the 46th contest, held at Parken Stadium in Copenhagen.",
      cites: [W("Eurovision_Song_Contest_2001", "Eurovision Song Contest 2001")] },
    { id: "w105-lithuania-eurobasket", branch: "baltic-states", y: 2003.70, when: "September 14, 2003", imp: 3,
      title: "Lithuania wins EuroBasket 2003",
      text: "Lithuania beat Spain 93–84 in the final in Sweden for its third European basketball title; Šarūnas Jasikevičius was named tournament MVP.",
      cites: [W("EuroBasket_2003", "EuroBasket 2003")] },
    { id: "w105-vilnius-nato-summit", branch: "baltic-states", y: 2023.52, when: "July 11–12, 2023", imp: 2,
      title: "NATO summit meets in Vilnius",
      text: "NATO's heads of state and government met in the Lithuanian capital, with war continuing in Europe, to reaffirm unity and solidarity.",
      cites: [W("2023_Vilnius_summit", "2023 Vilnius summit"), { t: "Vilnius Summit Communiqué — NATO", u: "https://www.nato.int/cps/en/natohq/events_217320.htm", k: "primary" }] },

    // ---- Belarus
    { id: "w105-term-limit-referendum", branch: "belarus", y: 2004.71, when: "October 17, 2004", imp: 2,
      title: "Referendum lets Lukashenko run again",
      text: "A referendum held alongside parliamentary elections allowed Lukashenko to stand for further terms, as he neared the end of his constitutionally limited two terms.",
      cites: [W("2004_Belarusian_referendum", "2004 Belarusian constitutional referendum")] },

    // ---- Belgium
    { id: "w105-tintin-debuts", branch: "belgium", y: 1929.026, when: "January 10, 1929", imp: 2,
      title: "Tintin debuts in Le Petit Vingtième",
      text: "Hergé's comic series first appeared in the youth supplement of the Belgian newspaper Le Vingtième Siècle; its success led to long-running albums and adaptations for radio, television, theater and film.",
      cites: [W("The_Adventures_of_Tintin", "The Adventures of Tintin"), BRIT("Hergé", "biography/Herge")] },
    { id: "w105-maigret-created", branch: "belgium", y: 1930.3, when: "1930", imp: 3,
      title: "Simenon's Inspector Maigret first appears",
      text: "The Liège-born writer Georges Simenon completed Pietr the Latvian, the first novel with a fully developed Inspector Maigret; 75 novels followed to 1972.",
      cites: [W("Jules_Maigret", "Jules Maigret"), W("Georges_Simenon", "Georges Simenon"), BRIT("Georges Simenon", "biography/Georges-Simenon")] },
    { id: "w105-brussels-expo-1935", branch: "belgium", y: 1935.32, end: 1935.85, when: "April 27 – November 6, 1935", imp: 3,
      title: "Brussels hosts the 1935 World's Fair",
      text: "The fair on the Heysel plateau drew about twenty million visitors; its Art Deco Palais des Expositions, also called the Grand Palais, was a main building.",
      cites: [W("Brussels_International_Exposition_(1935)", "Brussels International Exposition (1935)")] },
    { id: "w105-invasion-1940", branch: "belgium", y: 1940.35, end: 1940.41, when: "May 10–28, 1940", imp: 2,
      title: "Germany invades Belgium; the army surrenders",
      text: "Germany invaded Belgium on May 10, 1940 as part of its offensive in the West; the campaign ended 18 days later with the surrender of the Belgian Army and a German occupation lasting until 1944.",
      cites: [W("Battle_of_Belgium", "Battle of Belgium"), BRIT("Battle of Belgium", "event/Battle-of-Belgium")] },
    { id: "w105-women-vote-1948", branch: "belgium", y: 1948.5, when: "1948", imp: 3,
      title: "Belgian women gain the national vote",
      text: "Some women could vote in municipal elections from 1919 and all women from 1920, but a 1948 law extended the vote to parliamentary and provincial elections; they first voted in 1949.",
      cites: [{ t: "60 years ago Belgian women got right to vote for Parliament — VRT NWS", u: "https://www.vrt.be/vrtnws/en/2009/06/26/60_years_ago_belgianwomengotrighttovoteforparliament-1-552551/" }, { t: "Parliamentary election — Belgian Senate", u: "https://www.senate.be/english/LegElectionsEN.html", k: "primary" }] },
    { id: "w105-royal-question-referendum", branch: "belgium", y: 1950.19, when: "March 12, 1950", imp: 2,
      title: "Belgium votes on the king's return",
      text: "The “popular consultation” on Leopold III's return, the first referendum in Belgian history, was advisory; unrest followed, and in 1951 Leopold abdicated in favor of his son Baudouin.",
      cites: [W("Royal_Question", "Royal Question"), W("Baudouin_of_Belgium", "Baudouin of Belgium"), BRIT("Leopold III", "biography/Leopold-III-king-of-Belgium")] },
    { id: "w105-marcinelle", branch: "belgium", y: 1956.60, when: "August 8, 1956", imp: 2,
      title: "Marcinelle mining disaster kills 262",
      text: "A fire at the Bois du Cazier coal mine killed 262 miners, many of them Italian guest workers, and became one of the country's most notorious mining disasters.",
      cites: [W("Marcinelle_mining_disaster", "Marcinelle mining disaster"), { t: "Major Mining Sites of Wallonia — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/1344/", k: "primary" }] },
    { id: "w105-expo-58", branch: "belgium", y: 1958.29, end: 1958.80, when: "April 17 – October 19, 1958", imp: 2,
      title: "Expo 58 opens in Brussels and raises the Atomium",
      text: "The world's fair drew nearly 42 million visitors; its centerpiece, the Atomium, was not meant to outlast the fair but became one of Brussels's best-known landmarks.",
      cites: [W("Expo_58", "Expo 58"), { t: "History of the Atomium — Atomium.be", u: "https://www.atomium.be/History.aspx", k: "museum" }, BRIT("Atomium", "topic/Atomium")] },
    { id: "w105-language-border-1962", branch: "belgium", y: 1962.5, when: "1962", imp: 3,
      title: "Language laws fix Belgium's linguistic areas",
      text: "A 1962 law assigned every municipality to one of four language areas; the areas were written into the Constitution in 1970.",
      cites: [W("Language_legislation_in_Belgium", "Language legislation in Belgium")] },
    { id: "w105-first-state-reform", branch: "belgium", y: 1970.5, when: "1970", imp: 2,
      title: "First state reform creates three communities",
      text: "Responding to Flemish demands for cultural autonomy, the 1970 reform set up Dutch, French and German cultural communities, the first step from a unitary toward a federal state.",
      cites: [W("State_reform_in_Belgium", "State reform in Belgium"), BEL] },
    { id: "w105-regions-1980", branch: "belgium", y: 1980.6, when: "1980", imp: 3,
      title: "Flemish and Walloon Regions are created",
      text: "The second state reform established the Flemish Region and the Walloon Region; Flanders chose to merge its community and regional institutions at once.",
      cites: [W("State_reform_in_Belgium", "State reform in Belgium"), BEL] },
    { id: "w105-heysel", branch: "belgium", y: 1985.407, when: "May 29, 1985", imp: 2,
      title: "Heysel Stadium disaster",
      text: "Juventus fans fleeing an attack by Liverpool fans were crushed against a wall before the European Cup final in Brussels; 39 people died and English clubs were banned from European competition.",
      cites: [W("Heysel_Stadium_disaster", "Heysel Stadium disaster"), BRIT("Heysel Stadium disaster", "event/Heysel-Stadium-disaster")] },
    { id: "w105-baudouin-unable-to-reign", branch: "belgium", y: 1990.256, when: "April 4, 1990", imp: 3,
      title: "King Baudouin steps aside over an abortion law",
      text: "Unwilling to sign a law liberalizing abortion, Baudouin asked to be declared temporarily unable to reign; the government complied, signed the bill itself, and Parliament restored him the next day.",
      cites: [W("Baudouin_of_Belgium", "Baudouin of Belgium"), BRIT("Baudouin I", "biography/Baudouin-I")] },
    { id: "w105-federal-state-1993", branch: "belgium", y: 1993.5, when: "1993", imp: 2,
      title: "Belgium becomes a federal state",
      text: "Since 1993 the first article of the Constitution has declared Belgium a federal state of Communities and Regions, completing a transition that began in 1970.",
      cites: [W("Constitution_of_Belgium", "Constitution of Belgium"), W("State_reform_in_Belgium", "State reform in Belgium"), BEL] },
    { id: "w105-white-march", branch: "belgium", y: 1996.72, when: "October 20, 1996", imp: 2,
      title: "White March over the Dutroux case",
      text: "Some 300,000 people marched in Brussels to protest delays and errors in the Marc Dutroux investigation, demanding reform of the police and justice system.",
      cites: [W("Marc_Dutroux", "Marc Dutroux")] },
    { id: "w105-euthanasia-law", branch: "belgium", y: 2002.40, when: "May 28, 2002", imp: 3,
      title: "Belgium legalizes euthanasia",
      text: "The Belgian Federal Parliament passed a law on euthanasia, making Belgium the second country, after the Netherlands, to legalize it.",
      cites: [W("Euthanasia_in_Belgium", "Euthanasia in Belgium")] },
    { id: "w105-van-rompuy-president", branch: "belgium", y: 2009.88, when: "November 19, 2009", imp: 2,
      title: "Van Rompuy chosen first President of the European Council",
      text: "The European Council unanimously selected Belgium's prime minister, Herman Van Rompuy, as its first full-time president, replacing him at home with Yves Leterme.",
      cites: [W("Herman_Van_Rompuy", "Herman Van Rompuy"), BRIT("Herman Van Rompuy", "biography/Herman-Van-Rompuy")] },
    { id: "w105-541-days", branch: "belgium", y: 2010.45, end: 2011.93, when: "2010 – December 6, 2011", imp: 2,
      title: "Belgium takes 541 days to form a government",
      text: "Negotiations ended when Elio Di Rupo's government was sworn in on December 6, 2011, after 541 days of negotiation and formation following the June 2010 election.",
      cites: [W("2010%E2%80%9311_Belgian_government_formation", "2010–11 Belgian government formation"), BRIT("Elio Di Rupo", "biography/Elio-Di-Rupo")] },
    { id: "w105-brussels-bombings", branch: "belgium", y: 2016.22, when: "March 22, 2016", imp: 2,
      title: "Islamic State bombings hit Brussels",
      text: "Suicide bombers attacked Brussels Airport and the Maelbeek metro station, killing 32 victims; the Islamic State claimed the attacks.",
      cites: [W("2016_Brussels_bombings", "2016 Brussels bombings")] },
    { id: "w105-de-croo-government", branch: "belgium", y: 2020.75, when: "October 1, 2020", imp: 3,
      title: "De Croo government ends a long deadlock",
      text: "Alexander De Croo's government took office 494 days after the May 2019 federal election, again after a difficult formation.",
      cites: [W("De_Croo_Government", "De Croo Government")] },

    // ---- Czech Republic
    { id: "w105-czech-nato", branch: "czech-republic", y: 1999.19, when: "March 12, 1999", imp: 2,
      title: "Czech Republic joins NATO",
      text: "Invited at the 1997 Madrid Summit, the Czech Republic became a full NATO member on March 12, 1999, along with Hungary and Poland.",
      cites: [W("Czech_Republic_and_NATO", "Czech Republic and NATO"), BRIT("Czech Republic", "place/Czech-Republic")] },
    { id: "w105-lisbon-ratified", branch: "czech-republic", y: 2009.87, when: "November 13, 2009", imp: 3,
      title: "Czech ratification clears the Lisbon Treaty",
      text: "The Czech instrument of ratification was the last deposited, in Rome, and the Treaty of Lisbon entered into force on December 1, 2009.",
      cites: [W("Lisbon_Treaty", "Treaty of Lisbon")] },

    // ---- Czechoslovakia
    { id: "w105-villa-tugendhat", branch: "czechoslovakia", y: 1930.5, when: "1930", imp: 2,
      title: "Mies van der Rohe's Villa Tugendhat is completed in Brno",
      text: "Built for Fritz and Greta Tugendhat by Ludwig Mies van der Rohe and Lilly Reich, the reinforced-concrete villa became famous for its open space; it was listed by UNESCO in 2001.",
      cites: [W("Villa_Tugendhat", "Villa Tugendhat"), { t: "Tugendhat Villa in Brno — UNESCO World Heritage Centre", u: "https://whc.unesco.org/en/list/1052/", k: "primary" }] },
    { id: "w105-heydrich-assassination", branch: "czechoslovakia", y: 1942.40, when: "May 27, 1942", imp: 2,
      title: "Czechoslovak agents ambush Reinhard Heydrich",
      text: "Resistance operatives Jozef Gabčík and Jan Kubiš attacked Heydrich in Prague in Operation Anthropoid; he died of his wounds eight days later and the Nazis ordered reprisals.",
      cites: [W("Operation_Anthropoid", "Operation Anthropoid"), BRIT("Reinhard Heydrich", "biography/Reinhard-Heydrich")] },
    { id: "w105-prague-uprising", branch: "czechoslovakia", y: 1945.34, end: 1945.35, when: "May 5–8, 1945", imp: 2,
      title: "Prague Uprising",
      text: "As the war in Europe ended, civilians spontaneously attacked German forces in Bohemia and Moravia; an agreement on May 8 let German troops withdraw from the city.",
      cites: [W("Prague_Uprising", "Prague Uprising")] },
    { id: "w105-laterna-magika", branch: "czechoslovakia", y: 1958.45, when: "1958", imp: 3,
      title: "Laterna Magika debuts at Expo 58",
      text: "Laterna Magika, considered the first multimedia theater, began as a cultural program for the Brussels world's fair and helped Czechoslovakia's success there; it began regular performances in Prague in 1959.",
      cites: [W("Laterna_Magika", "Laterna Magika"), W("Expo_58", "Expo 58")] },
    { id: "w105-socialist-republic-1960", branch: "czechoslovakia", y: 1960.5, when: "1960", imp: 3,
      title: "Czechoslovakia becomes a “socialist republic”",
      text: "A new constitution renamed the country the Czechoslovak Socialist Republic, a name kept until 1990, while it remained a Soviet satellite state.",
      cites: [W("Czechoslovakia", "Czechoslovakia")] },
    { id: "w105-new-wave", branch: "czechoslovakia", y: 1963.5, when: "1963", imp: 2,
      title: "Czechoslovak New Wave films reach the screen",
      text: "Miloš Forman's Black Peter and Věra Chytilová's Something Different, both from 1963, were early films of the movement sometimes called the “Czechoslovak film miracle.”",
      cites: [W("Czechoslovak_New_Wave", "Czechoslovak New Wave")] },
    { id: "w105-shop-on-main-street-oscar", branch: "czechoslovakia", y: 1966.3, when: "1966", imp: 3,
      title: "The Shop on Main Street wins an Oscar",
      text: "Ján Kadár and Elmar Klos's film won the Academy Award for Best Foreign Language Film in 1966; Closely Watched Trains followed in 1968.",
      cites: [W("Czechoslovak_New_Wave", "Czechoslovak New Wave"), W("The_Shop_on_Main_Street", "The Shop on Main Street"), BRIT("The Shop on Main Street", "topic/The-Shop-on-Main-Street")] },
    { id: "w105-seifert-nobel", branch: "czechoslovakia", y: 1984.78, when: "1984", imp: 2,
      title: "Jaroslav Seifert wins the Nobel Prize in Literature",
      text: "The Prague-born poet won the 1984 prize for poetry that “provides a liberating image of the indomitable spirit and versatility of man”; his daughter accepted it for him.",
      cites: [BRIT("Jaroslav Seifert", "biography/Jaroslav-Seifert"), W("Jaroslav_Seifert", "Jaroslav Seifert")] },

    // ---- ECSC
    { id: "w105-first-enlargement", branch: "ecsc", y: 1973.0, when: "January 1, 1973", imp: 2,
      title: "Denmark, Ireland and the UK join the Communities",
      text: "The six members became nine when Denmark, Ireland and the United Kingdom formally joined the European Communities, of which the ECSC was one.",
      cites: [{ t: "History of the EU 1970-79 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1970-79_en", k: "primary" }, W("Enlargement_of_the_European_Union", "Enlargement of the European Union")] },
    { id: "w105-reunification-communities", branch: "ecsc", y: 1990.756, when: "October 3, 1990", imp: 2,
      title: "East Germany joins the Communities by reunification",
      text: "When East Germany joined West Germany on October 3, 1990, the East German territory became part of the European Economic Community as well.",
      cites: [W("German_reunification", "German reunification"), W("Enlargement_of_the_European_Union", "Enlargement of the European Union"), BRIT("German reunification", "event/German-reunification")] },
    { id: "w105-amsterdam-treaty", branch: "ecsc", y: 1997.75, when: "October 2, 1997", imp: 3,
      title: "Treaty of Amsterdam amends the founding treaties",
      text: "Signed on October 2, 1997, the treaty amended the Maastricht Treaty and the treaties establishing the European Communities, including the ECSC treaty; it took effect on May 1, 1999.",
      cites: [W("Treaty_of_Amsterdam", "Treaty of Amsterdam"), BRIT("Treaty of Amsterdam", "topic/Treaty-of-Amsterdam"), { t: "History of the EU 1990-99 — European Union", u: "https://european-union.europa.eu/principles-countries-history/history-eu/1990-99_en", k: "primary" }] },
  ],
});
TL.geo("w105-third-man", { scope: "place", lat: 48.21, lon: 16.37, r: 40, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
TL.geo("w105-staatsoper-reopens", { scope: "place", lat: 48.2026, lon: 16.3686, r: 30, label: "Vienna State Opera", src: "https://en.wikipedia.org/wiki/Vienna_State_Opera" });
TL.geo("w105-art-and-revolution", { scope: "place", lat: 48.21, lon: 16.37, r: 40, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
TL.geo("w105-kreisky", { scope: "place", lat: 48.21, lon: 16.37, r: 40, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
TL.geo("w105-hainburg-au", { scope: "place", lat: 48.15, lon: 16.94, r: 40, label: "Hainburg an der Donau, Austria", src: "https://en.wikipedia.org/wiki/Hainburg_an_der_Donau" });
TL.geo("w105-galtur-avalanche", { scope: "place", lat: 46.97, lon: 10.19, r: 40, label: "Galtür, Austria", src: "https://en.wikipedia.org/wiki/Galt%C3%BCr" });
TL.geo("w105-kampusch-escape", { scope: "place", lat: 48.21, lon: 16.37, r: 40, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
TL.geo("w105-euro-2008", { scope: "region", lat: 47.33, lon: 13.33, r: 500, label: "Austria and Switzerland", src: "https://en.wikipedia.org/wiki/Austria" });
TL.geo("w105-conchita-wurst", { scope: "place", lat: 55.68, lon: 12.57, r: 40, label: "Copenhagen, Denmark", src: "https://en.wikipedia.org/wiki/Copenhagen" });
TL.geo("w105-estonia-eurovision", { scope: "place", lat: 55.68, lon: 12.57, r: 40, label: "Copenhagen, Denmark", src: "https://en.wikipedia.org/wiki/Copenhagen" });
TL.geo("w105-lithuania-eurobasket", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm, Sweden", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("w105-vilnius-nato-summit", { scope: "place", lat: 54.69, lon: 25.28, r: 40, label: "Vilnius, Lithuania", src: "https://en.wikipedia.org/wiki/Vilnius" });
TL.geo("w105-term-limit-referendum", { scope: "region", lat: 53, lon: 27, r: 300, label: "Belarus", src: "https://en.wikipedia.org/wiki/Belarus" });
TL.geo("w105-tintin-debuts", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("w105-maigret-created", { scope: "place", lat: 50.64, lon: 5.57, r: 40, label: "Liège, Belgium", src: "https://en.wikipedia.org/wiki/Li%C3%A8ge" });
TL.geo("w105-brussels-expo-1935", { scope: "place", lat: 50.897, lon: 4.339, r: 30, label: "Heysel Plateau, Brussels", src: "https://en.wikipedia.org/wiki/Brussels_International_Exposition_(1935)" });
TL.geo("w105-invasion-1940", { scope: "region", lat: 50.83, lon: 4, r: 200, label: "Belgium", src: "https://en.wikipedia.org/wiki/Belgium" });
TL.geo("w105-women-vote-1948", { scope: "region", lat: 50.83, lon: 4, r: 200, label: "Belgium", src: "https://en.wikipedia.org/wiki/Belgium" });
TL.geo("w105-royal-question-referendum", { scope: "region", lat: 50.83, lon: 4, r: 200, label: "Belgium", src: "https://en.wikipedia.org/wiki/Belgium" });
TL.geo("w105-marcinelle", { scope: "place", lat: 50.4, lon: 4.45, r: 30, label: "Marcinelle, Belgium", src: "https://en.wikipedia.org/wiki/Marcinelle" });
TL.geo("w105-expo-58", { scope: "place", lat: 50.897, lon: 4.339, r: 30, label: "Heysel Plateau, Brussels", src: "https://en.wikipedia.org/wiki/Expo_58" });
TL.geo("w105-language-border-1962", { scope: "region", lat: 50.83, lon: 4, r: 200, label: "Belgium", src: "https://en.wikipedia.org/wiki/Belgium" });
TL.geo("w105-first-state-reform", { scope: "region", lat: 50.83, lon: 4, r: 200, label: "Belgium", src: "https://en.wikipedia.org/wiki/Belgium" });
TL.geo("w105-regions-1980", { scope: "region", lat: 50.83, lon: 4, r: 200, label: "Belgium", src: "https://en.wikipedia.org/wiki/Belgium" });
TL.geo("w105-heysel", { scope: "place", lat: 50.896, lon: 4.334, r: 30, label: "Heysel Stadium, Brussels", src: "https://en.wikipedia.org/wiki/Heysel_Stadium_disaster" });
TL.geo("w105-baudouin-unable-to-reign", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("w105-federal-state-1993", { scope: "region", lat: 50.83, lon: 4, r: 200, label: "Belgium", src: "https://en.wikipedia.org/wiki/Belgium" });
TL.geo("w105-white-march", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("w105-euthanasia-law", { scope: "region", lat: 50.83, lon: 4, r: 200, label: "Belgium", src: "https://en.wikipedia.org/wiki/Belgium" });
TL.geo("w105-van-rompuy-president", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("w105-541-days", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("w105-brussels-bombings", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("w105-de-croo-government", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("w105-czech-nato", { scope: "region", lat: 49.75, lon: 15.5, r: 250, label: "Czech Republic", src: "https://en.wikipedia.org/wiki/Czech_Republic" });
TL.geo("w105-lisbon-ratified", { scope: "place", lat: 41.89, lon: 12.48, r: 40, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("w105-villa-tugendhat", { scope: "place", lat: 49.21, lon: 16.62, r: 30, label: "Brno, Czech Republic", src: "https://en.wikipedia.org/wiki/Villa_Tugendhat" });
TL.geo("w105-heydrich-assassination", { scope: "place", lat: 50.09, lon: 14.42, r: 40, label: "Prague, Czech Republic", src: "https://en.wikipedia.org/wiki/Prague" });
TL.geo("w105-prague-uprising", { scope: "place", lat: 50.09, lon: 14.42, r: 40, label: "Prague, Czech Republic", src: "https://en.wikipedia.org/wiki/Prague" });
TL.geo("w105-laterna-magika", { scope: "place", lat: 50.897, lon: 4.339, r: 30, label: "Heysel Plateau, Brussels", src: "https://en.wikipedia.org/wiki/Expo_58" });
TL.geo("w105-socialist-republic-1960", { scope: "region", lat: 50.08, lon: 14.42, r: 600, label: "Czechoslovakia", src: "https://en.wikipedia.org/wiki/Czechoslovakia" });
TL.geo("w105-new-wave", { scope: "place", lat: 50.09, lon: 14.42, r: 40, label: "Prague, Czech Republic", src: "https://en.wikipedia.org/wiki/Prague" });
TL.geo("w105-shop-on-main-street-oscar", { scope: "region", lat: 50.08, lon: 14.42, r: 600, label: "Czechoslovakia", src: "https://en.wikipedia.org/wiki/Czechoslovakia" });
TL.geo("w105-seifert-nobel", { scope: "place", lat: 50.09, lon: 14.42, r: 40, label: "Prague, Czech Republic", src: "https://en.wikipedia.org/wiki/Prague" });
TL.geo("w105-first-enlargement", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("w105-reunification-communities", { scope: "place", lat: 52.52, lon: 13.4, r: 40, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("w105-amsterdam-treaty", { scope: "place", lat: 52.37, lon: 4.9, r: 40, label: "Amsterdam, Netherlands", src: "https://en.wikipedia.org/wiki/Amsterdam" });
