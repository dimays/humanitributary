// Culture batch C1: European cultural events and periods since 1900 (literature, art, architecture, music, film, theater, sport, everyday life). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const Br = (path, title) => ({ t: `${title} — Britannica`, u: `https://www.britannica.com/${path}` });
const N = (yr, slug, name, extra) => ({ t: `${name} — The Nobel Prize in Literature ${yr} — NobelPrize.org`, u: `https://www.nobelprize.org/prizes/literature/${yr}/${slug}/facts/`, k: "primary" });
TL.add({
  events: [
    // ---- United Kingdom ----
    { id: "c1eu-please-please-me", branch: "uk", y: 1963.22, when: "March 22, 1963", title: "The Beatles release “Please Please Me”",
      text: "The band's debut album, produced by George Martin, came out on EMI's Parlophone label. It opened the run of records behind Beatlemania, which reached the United States later.",
      imp: 2, cites: [W("Please_Please_Me", "Please Please Me"), { t: "Please Please Me — The Beatles (official site)", u: "https://www.thebeatles.com/please-please-me", k: "reference" }] },
    { id: "c1eu-anarchy-in-the-uk", branch: "uk", y: 1976.9, when: "November 26, 1976", title: "Sex Pistols release “Anarchy in the U.K.”",
      text: "The band's debut single reached number 38 on the UK chart before EMI dropped the group in January 1977. It became a signature record of British punk.",
      imp: 3, cites: [W("Anarchy_in_the_U.K.", "Anarchy in the U.K."), Br("topic/Anarchy-in-the-UK", "Anarchy in the U.K.")] },
    { id: "c1eu-harry-potter", branch: "uk", y: 1997.48, when: "June 26, 1997", title: "“Harry Potter and the Philosopher's Stone” published",
      text: "Bloomsbury published J. K. Rowling's first novel in the United Kingdom, after Rowling secured a Scottish Arts Council grant to plan sequels.",
      imp: 2, cites: [W("Harry_Potter_and_the_Philosopher%27s_Stone", "Harry Potter and the Philosopher's Stone"), Br("topic/Harry-Potter-and-the-Philosophers-Stone", "Harry Potter and the Philosopher’s Stone")] },
    // ---- Ireland ----
    { id: "c1eu-yeats-nobel", branch: "ireland", y: 1923.9, when: "1923", title: "W. B. Yeats wins the Nobel Prize in Literature",
      text: "The Swedish Academy honored Yeats for poetry that “gives expression to the spirit of a whole nation.” He later served as a senator of the Irish Free State.",
      imp: 2, cites: [N(1923, "yeats", "W. B. Yeats"), W("W._B._Yeats", "W. B. Yeats")] },
    { id: "c1eu-beckett-nobel", branch: "ireland", y: 1969.8, when: "1969", title: "Samuel Beckett wins the Nobel Prize in Literature",
      text: "Dublin-born Beckett, who wrote in English and French, was honored for writing that in “new forms for the novel and drama” found elevation in the destitution of modern man.",
      imp: 2, cites: [N(1969, "beckett", "Samuel Beckett"), W("Samuel_Beckett", "Samuel Beckett")] },
    { id: "c1eu-riverdance", branch: "ireland", y: 1994.33, when: "April 30, 1994", title: "Riverdance debuts at the Eurovision Song Contest",
      text: "Performed as a seven-minute interval act in Dublin, with music by Bill Whelan, it grew into a touring stage show.",
      imp: 2, cites: [W("Riverdance", "Riverdance"), Br("topic/Riverdance", "Riverdance")] },
    // ---- France ----
    { id: "c1eu-first-tour-de-france", branch: "france", y: 1903.5, when: "July 1, 1903", title: "First Tour de France",
      text: "The newspaper L'Auto organized the race to boost its sales against rival Le Vélo. The race has run every year since, except 1915–1918 and 1940–1946.",
      imp: 2, cites: [W("Tour_de_France", "Tour de France"), { t: "First Tour de France — EBSCO Research Starters", u: "https://www.ebsco.com/research-starters/sports-and-leisure/first-tour-de-france/" }] },
    { id: "c1eu-cannes-festival", branch: "france", y: 1946.72, when: "September 20, 1946", title: "First Cannes Film Festival opens",
      text: "Twenty-one countries presented films at the first festival, held at the former Casino of Cannes. It became a leading annual film festival.",
      imp: 2, cites: [W("Cannes_Film_Festival", "Cannes Film Festival"), Br("topic/Cannes-Film-Festival", "Cannes film festival")] },
    { id: "c1eu-new-wave-400-blows", branch: "france", y: 1959.4, when: "1959", title: "Truffaut's “The 400 Blows” and the French New Wave",
      text: "François Truffaut's debut feature, a defining film of the French New Wave, won the Best Director award at Cannes in 1959 and brought the movement international attention.",
      imp: 2, cites: [W("The_400_Blows", "The 400 Blows"), Br("topic/The-400-Blows", "The 400 Blows")] },
    { id: "c1eu-centre-pompidou", branch: "france", y: 1977.08, when: "January 31, 1977", title: "Centre Pompidou opens in Paris",
      text: "Designed by Richard Rogers, Renzo Piano and Gianfranco Franchini, its exposed-skeleton high-tech architecture made a museum a popular place of cultural exchange.",
      imp: 2, cites: [W("Centre_Pompidou", "Centre Pompidou"), Br("topic/Pompidou-Centre", "Pompidou Centre"), { t: "Pompidou Center Opens in Paris — EBSCO Research Starters", u: "https://www.ebsco.com/research-starters/history/pompidou-center-opens-paris/" }] },
    { id: "c1eu-world-cup-1998", branch: "france", y: 1998.53, when: "July 12, 1998", title: "France wins the World Cup at home",
      text: "France beat defending champions Brazil 3–0 in the final to win its first World Cup title.",
      imp: 2, cites: [W("1998_FIFA_World_Cup", "1998 FIFA World Cup"), Br("sports/World-Cup-football", "World Cup (football)")] },
    // ---- Germany ----
    { id: "c1eu-metropolis-premiere", branch: "weimar", y: 1927.03, when: "January 10, 1927", title: "Fritz Lang's “Metropolis” premieres in Berlin",
      text: "The German Expressionist science-fiction silent film, based on Thea von Harbou's novel, premiered at the UFA-Palast am Zoo. It was cut heavily afterward and later reconstructed.",
      imp: 2, cites: [W("Metropolis_(1927_film)", "Metropolis (1927 film)"), { t: "Metropolis — filmportal.de", u: "https://www.filmportal.de/en/movie/metropolis_ea43d4a6990b5006e03053d50b37753d" }, Br("topic/Metropolis-film-1927", "Metropolis")] },
    { id: "c1eu-all-quiet", branch: "weimar", y: 1929.07, when: "January 1929", title: "Remarque's “All Quiet on the Western Front” published",
      text: "Erich Maria Remarque's war novel ran in a Berlin newspaper in late 1928 and appeared in book form in late January 1929. Its account of ordinary soldiers' experience of the First World War reached a wide public.",
      imp: 2, cites: [W("All_Quiet_on_the_Western_Front", "All Quiet on the Western Front"), Br("topic/All-Quiet-on-the-Western-Front-novel", "All Quiet on the Western Front")] },
    { id: "c1eu-berlin-olympics", branch: "nazi-germany", y: 1936.58, end: 1936.62, when: "August 1–16, 1936", title: "Berlin hosts the Summer Olympics",
      text: "Berlin, which won the right to host in 1931, staged the Games under Nazi rule.",
      imp: 2, cites: [W("1936_Summer_Olympics", "1936 Summer Olympics"), Br("event/Berlin-1936-Olympic-Games", "Berlin 1936 Olympic Games")] },
    { id: "c1eu-degenerate-art", branch: "nazi-germany", y: 1937.55, when: "July 19, 1937", title: "Nazis open the “Degenerate Art” exhibition",
      text: "In Munich, the exhibit hung more than 600 modernist works confiscated from German museums beside mocking labels. A traveling version then visited other cities.",
      imp: 2, cites: [W("Degenerate_art", "Degenerate art"), { t: "Degenerate Art — US Holocaust Memorial Museum", u: "https://encyclopedia.ushmm.org/content/en/article/degenerate-art-1" }, Br("topic/degenerate-art", "degenerate art")] },
    { id: "c1eu-tin-drum", branch: "west-germany", y: 1959.5, when: "1959", title: "Günter Grass publishes “The Tin Drum”",
      text: "Grass's novel, the first of his Danzig Trilogy, confronted the Nazi years from a child's viewpoint and made him a leading voice of postwar German literature.",
      imp: 2, cites: [W("The_Tin_Drum", "The Tin Drum"), Br("topic/The-Tin-Drum-novel-by-Grass", "The Tin Drum")] },
    { id: "c1eu-trabant", branch: "east-germany", y: 1957.85, when: "November 7, 1957", title: "First Trabant leaves the Zwickau factory",
      text: "The small East German car stayed in production until 1991. With its plastic body, it came to symbolize East Germany and later the fall of communism.",
      imp: 3, cites: [W("Trabant", "Trabant"), { t: "Trabant — Encyclopedia.com", u: "https://www.encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/trabant" }] },
    // ---- Italy ----
    { id: "c1eu-futurist-manifesto", branch: "italy", y: 1909.1, when: "February 5, 1909", title: "Marinetti publishes the Futurist Manifesto",
      text: "F. T. Marinetti's manifesto appeared in a Bologna newspaper and on February 20 in Le Figaro in Paris, launching Futurism's cult of speed and the machine.",
      imp: 2, cites: [W("Manifesto_of_Futurism", "Manifesto of Futurism"), Br("topic/Futurist-Manifesto", "Manifesto of Futurism")] },
    { id: "c1eu-world-cup-1934", branch: "italy", y: 1934.44, when: "June 10, 1934", title: "Italy hosts and wins the 1934 World Cup",
      text: "Italy beat Czechoslovakia 2–1 to become the second World Cup champion and the first from Europe, in a tournament held May 27–June 10 under the Fascist regime.",
      imp: 2, cites: [W("1934_FIFA_World_Cup", "1934 FIFA World Cup"), Br("sports/World-Cup-football", "World Cup (football)")] },
    { id: "c1eu-rome-open-city", branch: "italy", y: 1945.74, when: "September 27, 1945", title: "Rossellini's “Rome, Open City” and Italian neorealism",
      text: "Roberto Rossellini's film, set under Nazi occupation in 1944, is considered a quintessential example of Italian neorealism and drew international attention to the movement.",
      imp: 2, cites: [W("Rome,_Open_City", "Rome, Open City"), Br("topic/Open-City", "Open City")] },
    { id: "c1eu-la-dolce-vita", branch: "italy", y: 1960.1, when: "February 5, 1960", title: "Fellini's “La Dolce Vita” released",
      text: "The satirical drama was a critical and worldwide commercial hit despite censorship in some regions, and won the Palme d'Or at Cannes in 1960.",
      imp: 2, cites: [W("La_Dolce_Vita", "La Dolce Vita"), Br("topic/La-Dolce-Vita", "La Dolce Vita")] },
    { id: "c1eu-dario-fo-nobel", branch: "italy", y: 1997.8, when: "1997", title: "Dario Fo wins the Nobel Prize in Literature",
      text: "The playwright and actor was honored as one who “emulates the jesters of the Middle Ages in scourging authority.” His best-known play is Accidental Death of an Anarchist.",
      imp: 3, cites: [N(1997, "fo", "Dario Fo"), W("Dario_Fo", "Dario Fo")] },
    // ---- Spain / Portugal ----
    { id: "c1eu-movida-madrilena", branch: "spain", y: 1980.11, when: "February 9, 1980", title: "La Movida Madrileña erupts in Madrid",
      text: "A tribute concert is traditionally taken as the start of a countercultural scene of punk, synthpop, fashion and film, including early work by Pedro Almodóvar, in post-Franco Spain.",
      imp: 2, cites: [W("La_Movida_Madrile%C3%B1a", "La Movida Madrileña"), { t: "La Movida madrileña — Hispania Historica", u: "https://hispaniahistorica.com/contemporanea/movida-madrilena/" }] },
    // ---- Russia / USSR ----
    { id: "c1eu-ballets-russes", branch: "russian-empire", y: 1909.4, when: "1909", title: "Diaghilev's Ballets Russes begins in Paris",
      text: "Sergei Diaghilev's company, which performed from 1909 to 1929, is widely regarded as the most influential ballet company of the 20th century, uniting choreographers, composers and designers.",
      imp: 2, cites: [W("Ballets_Russes", "Ballets Russes"), { t: "Diaghilev’s Ballets Russes Astounds Paris — EBSCO Research Starters", u: "https://www.ebsco.com/research-starters/history/diaghilevs-ballets-russes-astounds-paris" }] },
    { id: "c1eu-battleship-potemkin", branch: "ussr", y: 1925.97, when: "December 21, 1925", title: "Eisenstein's “Battleship Potemkin” premieres",
      text: "Sergei Eisenstein's dramatization of the 1905 mutiny had its first screening at the Bolshoi Theatre. Eisenstein directed and co-wrote it, using many non-professional actors.",
      imp: 2, cites: [W("Battleship_Potemkin", "Battleship Potemkin"), Br("topic/Battleship-Potemkin", "Battleship Potemkin")] },
    { id: "c1eu-muddle-instead-of-music", branch: "ussr", y: 1936.08, when: "January 28, 1936", title: "Pravda denounces Shostakovich's opera",
      text: "The unsigned editorial “Muddle Instead of Music” condemned Lady Macbeth of the Mtsensk District as formalist and vulgar, a warning to Soviet artists.",
      imp: 2, cites: [W("Muddle_Instead_of_Music", "Muddle Instead of Music"), { t: "Chaos Instead of Music — Seventeen Moments in Soviet History (Michigan State University)", u: "https://soviethistory.msu.edu/1936/upheaval-in-the-opera/upheaval-in-the-opera-text/chaos-instead-of-music/" }] },
    { id: "c1eu-pasternak-nobel", branch: "ussr", y: 1958.8, when: "1958", title: "Pasternak wins the Nobel Prize amid Zhivago storm",
      text: "Boris Pasternak's novel Doctor Zhivago was smuggled to Italy and published in 1957. The Nobel award the next year enraged Soviet leaders, and under official pressure Pasternak declined the prize.",
      imp: 2, cites: [N(1958, "pasternak", "Boris Pasternak"), W("Doctor_Zhivago_(novel)", "Doctor Zhivago (novel)")] },
    { id: "c1eu-ivan-denisovich", branch: "ussr", y: 1962.88, when: "November 1962", title: "“One Day in the Life of Ivan Denisovich” published",
      text: "Solzhenitsyn's novella about a Stalin-era labor camp appeared in the Soviet magazine Novy Mir, a landmark of the Khrushchev-era thaw.",
      imp: 2, cites: [W("One_Day_in_the_Life_of_Ivan_Denisovich", "One Day in the Life of Ivan Denisovich"), Br("topic/One-Day-in-the-Life-of-Ivan-Denisovich", "One Day in the Life of Ivan Denisovich")] },
    { id: "c1eu-world-cup-2018", branch: "russia", y: 2018.45, end: 2018.54, when: "June 14–July 15, 2018", title: "Russia hosts the FIFA World Cup",
      text: "It was the first World Cup held in Russia and the 11th in Europe; matches took place at venues spread across the country.",
      imp: 3, cites: [W("2018_FIFA_World_Cup", "2018 FIFA World Cup"), Br("sports/World-Cup-football", "World Cup (football)")] },
    // ---- Ukraine ----
    { id: "c1eu-eurovision-2022", branch: "ukraine", y: 2022.37, when: "May 14, 2022", title: "Ukraine wins Eurovision with Kalush Orchestra",
      text: "Months after Russia's invasion, Kalush Orchestra won the contest in Turin with “Stefania,” while Russia had been excluded.",
      imp: 2, cites: [W("Eurovision_Song_Contest_2022", "Eurovision Song Contest 2022"), { t: "Turin 2022 — Eurovision Song Contest", u: "https://www.eurovision.com/eurovision-song-contest/turin-2022/", k: "primary" }] },
    // ---- Poland / Czechoslovakia / Hungary ----
    { id: "c1eu-chopin-competition", branch: "poland", y: 1927.06, when: "January 23, 1927", title: "First International Chopin Piano Competition",
      text: "The first competition opened in Warsaw on January 23, 1927. After irregular early editions it has run every five years since 1955 and is one of classical music's most prestigious contests.",
      imp: 3, cites: [W("International_Chopin_Piano_Competition", "International Chopin Piano Competition"), { t: "99 years of the Chopin Competition — International Chopin Piano Competition", u: "https://www.chopincompetition.pl/en/newsroom/99-years-of-the-chopin-competition?id=167&type=news", k: "primary" }] },
    { id: "c1eu-milosz-nobel", branch: "poland", y: 1980.77, when: "October 9, 1980", title: "Czesław Miłosz wins the Nobel Prize in Literature",
      text: "The Swedish Academy cited his “uncompromising clear-sightedness.” Smuggled into Poland, his writing inspired the anti-communist Solidarity movement.",
      imp: 2, cites: [N(1980, "milosz", "Czesław Miłosz"), W("Czes%C5%82aw_Mi%C5%82osz", "Czesław Miłosz")] },
    { id: "c1eu-rur-robots", branch: "czechoslovakia", y: 1921.0, when: "January 2, 1921", title: "Čapek's “R.U.R.” premieres and gives us “robot”",
      text: "Karel Čapek's play Rossum's Universal Robots premiered in Hradec Králové. It introduced the word “robot” to English and to science fiction.",
      imp: 2, cites: [W("R.U.R.", "R.U.R."), Br("topic/RUR", "R.U.R.")] },
    { id: "c1eu-hungary-6-3-england", branch: "hungary", y: 1953.9, when: "November 25, 1953", title: "Hungary beats England 6–3 at Wembley",
      text: "Hungary, the reigning Olympic champion and unbeaten in a long run of matches, won the “Match of the Century,” prompting England to rethink its training and tactics.",
      imp: 2, cites: [W("England_v_Hungary_(1953)", "England v Hungary (1953)"), { t: "Hungary 6-3 England (1953): The Match of the Century — Football Documentaries", u: "https://footballdocumentaries.com/hungary-6-3-england-1953/" }] },
    { id: "c1eu-rubiks-cube", branch: "hungary", y: 1974.5, when: "1974", title: "Ernő Rubik invents the Rubik's Cube",
      text: "A Budapest professor of architecture invented the 3D combination puzzle in 1974 while experimenting with three-dimensional structures; it became a global toy.",
      imp: 3, cites: [W("Rubik%27s_Cube", "Rubik's Cube"), Br("topic/Rubiks-Cube", "Rubik’s Cube"), Br("biography/Erno-Rubik", "Erno Rubik")] },
    // ---- Austria ----
    { id: "c1eu-salzburg-festival", branch: "austria", y: 1920.64, when: "August 22, 1920", title: "First Salzburg Festival",
      text: "The festival was born when Hofmannsthal's morality play Jedermann was staged on the cathedral square in Max Reinhardt's production. It grew into a leading music and drama festival.",
      imp: 2, cites: [{ t: "History — Salzburg Festival", u: "https://www.salzburgerfestspiele.at/en/history", k: "primary" }, W("Salzburg_Festival", "Salzburg Festival")] },
    { id: "c1eu-karl-marx-hof", branch: "austria", y: 1927, end: 1930.78, when: "1927–1930", title: "Red Vienna builds the Karl-Marx-Hof",
      text: "Vienna's Social Democratic city government built this vast municipal housing complex with 1,382 apartments, designed by Karl Ehn, financed by a special tax.",
      imp: 3, cites: [W("Karl-Marx-Hof", "Karl-Marx-Hof"), { t: "Karl-Marx-Hof — Cultural Heritage Online", u: "https://culturalheritageonline.com/places/karl-marx-hof/" }] },
    // ---- Yugoslavia ----
    // ---- Belgium and the EU ----
    { id: "c1eu-erasmus", branch: "eec", y: 1987.5, when: "July 1, 1987", title: "Erasmus student exchange programme launched",
      text: "Created as the European Community Action Scheme for the Mobility of University Students, adopted by the Council on June 15, it promoted cooperation among European universities.",
      imp: 2, cites: [W("Erasmus_Programme", "Erasmus Programme"), { t: "Erasmus to Erasmus+: history, funding and future — Erasmus+ (European Commission)", u: "https://erasmus-plus.ec.europa.eu/about-erasmus/history-funding-and-future", k: "primary" }] },
    { id: "c1eu-euro-notes-coins", branch: "eu", y: 2002.0, when: "January 1, 2002", title: "Euro banknotes and coins enter circulation",
      text: "The euro was born virtually in 1999; physical notes and coins began circulating in 2002, a first series of seven banknote denominations.",
      imp: 2, cites: [W("Euro_banknotes", "Euro banknotes"), { t: "Euro banknotes — European Central Bank", u: "https://www.ecb.europa.eu/euro/banknotes/html/index.en.html", k: "primary" }] },
  ],
});

TL.geo("c1eu-please-please-me", { scope: "place", lat: 51.53, lon: -0.18, r: 40, label: "Abbey Road Studios, London", src: "https://en.wikipedia.org/wiki/Abbey_Road_Studios" });
TL.geo("c1eu-anarchy-in-the-uk", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c1eu-harry-potter", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c1eu-yeats-nobel", { scope: "place", lat: 53.35, lon: -6.26, r: 40, label: "Dublin, Ireland", src: "https://en.wikipedia.org/wiki/Dublin" });
TL.geo("c1eu-beckett-nobel", { scope: "place", lat: 53.35, lon: -6.26, r: 40, label: "Dublin, Ireland", src: "https://en.wikipedia.org/wiki/Dublin" });
TL.geo("c1eu-riverdance", { scope: "place", lat: 53.35, lon: -6.26, r: 40, label: "Dublin, Ireland", src: "https://en.wikipedia.org/wiki/Dublin" });
TL.geo("c1eu-first-tour-de-france", { scope: "region", lat: 47, lon: 2, r: 600, label: "France", src: "https://en.wikipedia.org/wiki/France" });
TL.geo("c1eu-cannes-festival", { scope: "place", lat: 43.55, lon: 7.01, r: 40, label: "Cannes, France", src: "https://en.wikipedia.org/wiki/Cannes" });
TL.geo("c1eu-new-wave-400-blows", { scope: "place", lat: 48.86, lon: 2.35, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("c1eu-centre-pompidou", { scope: "place", lat: 48.86, lon: 2.35, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("c1eu-world-cup-1998", { scope: "place", lat: 48.92, lon: 2.36, r: 40, label: "Saint-Denis, France", src: "https://en.wikipedia.org/wiki/Stade_de_France" });
TL.geo("c1eu-metropolis-premiere", { scope: "place", lat: 52.52, lon: 13.4, r: 40, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("c1eu-all-quiet", { scope: "place", lat: 52.52, lon: 13.4, r: 40, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("c1eu-berlin-olympics", { scope: "place", lat: 52.52, lon: 13.4, r: 40, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("c1eu-degenerate-art", { scope: "place", lat: 48.14, lon: 11.58, r: 40, label: "Munich, Germany", src: "https://en.wikipedia.org/wiki/Munich" });
TL.geo("c1eu-tin-drum", { scope: "region", lat: 51, lon: 9, r: 500, label: "West Germany", src: "https://en.wikipedia.org/wiki/Germany" });
TL.geo("c1eu-trabant", { scope: "place", lat: 50.72, lon: 12.49, r: 40, label: "Zwickau, Germany", src: "https://en.wikipedia.org/wiki/Zwickau" });
TL.geo("c1eu-futurist-manifesto", { scope: "place", lat: 44.49, lon: 11.34, r: 40, label: "Bologna, Italy", src: "https://en.wikipedia.org/wiki/Bologna" });
TL.geo("c1eu-world-cup-1934", { scope: "region", lat: 43, lon: 12, r: 600, label: "Italy", src: "https://en.wikipedia.org/wiki/Italy" });
TL.geo("c1eu-rome-open-city", { scope: "place", lat: 41.89, lon: 12.48, r: 40, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("c1eu-la-dolce-vita", { scope: "place", lat: 41.89, lon: 12.48, r: 40, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("c1eu-dario-fo-nobel", { scope: "place", lat: 45.47, lon: 9.19, r: 40, label: "Milan, Italy", src: "https://en.wikipedia.org/wiki/Milan" });
TL.geo("c1eu-movida-madrilena", { scope: "place", lat: 40.42, lon: -3.7, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
TL.geo("c1eu-ballets-russes", { scope: "place", lat: 48.86, lon: 2.35, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("c1eu-battleship-potemkin", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("c1eu-muddle-instead-of-music", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("c1eu-pasternak-nobel", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("c1eu-ivan-denisovich", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("c1eu-world-cup-2018", { scope: "region", lat: 66, lon: 94, r: 2500, label: "Russia", src: "https://en.wikipedia.org/wiki/Russia" });
TL.geo("c1eu-eurovision-2022", { scope: "place", lat: 45.08, lon: 7.68, r: 40, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Turin" });
TL.geo("c1eu-chopin-competition", { scope: "place", lat: 52.23, lon: 21.01, r: 40, label: "Warsaw, Poland", src: "https://en.wikipedia.org/wiki/Warsaw" });
TL.geo("c1eu-milosz-nobel", { scope: "region", lat: 52, lon: 20, r: 400, label: "Poland", src: "https://en.wikipedia.org/wiki/Poland" });
TL.geo("c1eu-rur-robots", { scope: "place", lat: 50.21, lon: 15.83, r: 40, label: "Hradec Králové, Czechoslovakia", src: "https://en.wikipedia.org/wiki/Hradec_Kr%C3%A1lov%C3%A9" });
TL.geo("c1eu-hungary-6-3-england", { scope: "place", lat: 51.55, lon: -0.3, r: 40, label: "Wembley, London", src: "https://en.wikipedia.org/wiki/Wembley" });
TL.geo("c1eu-rubiks-cube", { scope: "place", lat: 47.49, lon: 19.05, r: 40, label: "Budapest, Hungary", src: "https://en.wikipedia.org/wiki/Budapest" });
TL.geo("c1eu-salzburg-festival", { scope: "place", lat: 47.8, lon: 13.04, r: 40, label: "Salzburg, Austria", src: "https://en.wikipedia.org/wiki/Salzburg" });
TL.geo("c1eu-karl-marx-hof", { scope: "place", lat: 48.21, lon: 16.37, r: 40, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
TL.geo("c1eu-erasmus", { scope: "region", lat: 50.0, lon: 10.0, r: 1500, label: "European Community", src: "https://en.wikipedia.org/wiki/Europe" });
TL.geo("c1eu-euro-notes-coins", { scope: "region", lat: 50.0, lon: 10.0, r: 1500, label: "Eurozone", src: "https://en.wikipedia.org/wiki/Eurozone" });
