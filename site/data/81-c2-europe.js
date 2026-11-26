// c2-europe: cultural events 1800-1925 on European and culture branches. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });

TL.add({ events: [
  { id: "c2eu-goethe-dies-faust-ii", branch: "german-confederation", y: 1832.22, when: "March 22, 1832", title: "Goethe dies; Faust, Part Two appears posthumously",
    text: "Johann Wolfgang von Goethe, regarded by Britannica as the greatest German literary figure of the modern era, died in Weimar on March 22, 1832. His Faust, Part Two was published after his death.", imp: 2,
    cites: [W("Faust,_Part_Two", "Faust, Part Two"), B("biography/Johann-Wolfgang-von-Goethe", "Johann Wolfgang von Goethe")] },
  { id: "c2eu-grimm-fairy-tales", branch: "romanticism", y: 1812.5, when: "1812", title: "The Brothers Grimm publish Children's and Household Tales",
    text: "Jacob and Wilhelm Grimm issued the first volume of Kinder- und Hausmärchen in 1812, with 86 tales. A second volume of 70 followed in 1815, and Britannica dates the work 1812–22.", imp: 2,
    cites: [W("Kinder-_und_Hausmärchen", "Kinder- und Hausmärchen"), B("biography/Brothers-Grimm", "Brothers Grimm")] },
  { id: "c2eu-pushkin-onegin", branch: "russian-empire", y: 1825, end: 1833, when: "1825–1833", title: "Pushkin's Eugene Onegin appears in installments, then whole",
    text: "Aleksandr Pushkin's novel in verse came out in parts from 1825 to 1832 and as a single volume in 1833. Britannica calls it the first Russian work to take contemporary society as its subject.", imp: 2,
    cites: [W("Eugene_Onegin", "Eugene Onegin"), B("biography/Aleksandr-Sergeyevich-Pushkin", "Aleksandr Pushkin")] },
  { id: "c2eu-dickens-pickwick", branch: "uk", y: 1836, end: 1837.9, when: "1836–1837", title: "Dickens's Pickwick Papers is serialized",
    text: "Charles Dickens's first novel appeared in monthly installments under the pen name Boz from 1836 to 1837 and was published as a book in 1837, making its author famous.", imp: 2,
    cites: [W("The_Pickwick_Papers", "The Pickwick Papers"), B("topic/The-Pickwick-Papers", "The Pickwick Papers")] },
  { id: "c2eu-jane-eyre", branch: "uk", y: 1847.8, when: "October 19, 1847", title: "Charlotte Brontë publishes Jane Eyre",
    text: "Published under the pen name Currer Bell by Smith, Elder & Co. of London, Jane Eyre is, in Britannica's words, a strong narrative of a woman in conflict with her natural desires and social condition.", imp: 2,
    cites: [W("Jane_Eyre", "Jane Eyre"), B("biography/Charlotte-Bronte", "Charlotte Brontë")] },
  { id: "c2eu-manzoni-promessi-sposi", branch: "austria-hungary", y: 1825, end: 1827, when: "1825–1827", title: "Manzoni's The Betrothed appears in three volumes",
    text: "Alessandro Manzoni's I promessi sposi came out in three volumes, set in 17th-century Lombardy. Its final 1840–42 edition became a model for Italian writers.", imp: 2,
    cites: [W("The_Betrothed_(Manzoni_novel)", "The Betrothed"), B("biography/Alessandro-Manzoni", "Alessandro Manzoni")] },
  { id: "c2eu-verdi-nabucco", branch: "austria-hungary", y: 1842.18, when: "March 9, 1842", title: "Verdi's Nabucco premieres at La Scala",
    text: "Giuseppe Verdi's opera, first called Nabucodonosor, was first performed at Milan's La Scala on March 9, 1842. Its chorus “Va, pensiero” became one of his most beloved works.", imp: 2, link: "italy",
    cites: [W("Nabucco", "Nabucco"), B("topic/Nabucco", "Nabucco")] },
  { id: "c2eu-hugo-les-miserables", branch: "france", y: 1862.25, when: "March 31, 1862", title: "Hugo publishes Les Misérables from exile",
    text: "Victor Hugo's novel was first published on March 31, 1862; its first volumes were released in Brussels. Hugo wrote it in self-imposed exile on Guernsey, where he lived from 1855 to 1870.", imp: 2,
    cites: [W("Les_Misérables", "Les Misérables"), W("Victor_Hugo", "Victor Hugo"), B("topic/Les-Miserables-novel-by-Hugo", "Les Misérables")] },
  { id: "c2eu-baudelaire-fleurs-du-mal", branch: "france", y: 1857.5, when: "1857", title: "Baudelaire publishes The Flowers of Evil",
    text: "Charles Baudelaire's collection of poems Les Fleurs du mal was first published in 1857 and became important to the Symbolist and modernist movements.", imp: 2,
    cites: [W("Les_Fleurs_du_mal", "Les Fleurs du mal"), B("topic/Les-Fleurs-du-mal", "Les Fleurs du mal")] },
  { id: "c2eu-dostoevsky-crime-punishment", branch: "russian-empire", y: 1866, when: "1866", title: "Dostoevsky publishes Crime and Punishment",
    text: "Fyodor Dostoevsky's novel of Rodion Raskolnikov, an impoverished student who murders a pawnbroker and her stepsister, was first published in 1866 in monthly installments of The Russian Messenger.", imp: 2,
    cites: [W("Crime_and_Punishment", "Crime and Punishment"), B("topic/Crime-and-Punishment-novel", "Crime and Punishment")] },
  { id: "c2eu-tolstoy-war-and-peace", branch: "russian-empire", y: 1865, end: 1869, when: "1865–1869", title: "Tolstoy's War and Peace appears",
    text: "Leo Tolstoy's sweeping novel of 19th-century Russian society began serialization in 1865 as 1805; the entire book was rewritten and published in 1869.", imp: 2,
    cites: [W("War_and_Peace", "War and Peace"), B("topic/War-and-Peace", "War and Peace")] },
  { id: "c2eu-ibsen-dolls-house", branch: "realism-impressionism", y: 1879.97, when: "December 1879", title: "Ibsen's A Doll's House opens in Copenhagen",
    text: "Henrik Ibsen's three-act play was published in Copenhagen on December 4, 1879, and had its premiere that month at the Royal Danish Theatre.", imp: 2,
    cites: [W("A_Doll's_House", "A Doll's House"), B("topic/A-Dolls-House", "A Doll's House")] },
  { id: "c2eu-wagner-tristan-isolde", branch: "german-confederation", y: 1865.44, when: "June 10, 1865", title: "Wagner's Tristan und Isolde premieres in Munich",
    text: "Hans von Bülow conducted the first performance of Wagner's opera, composed in 1857–59. Britannica notes its harmonic language was so chromatic that it fostered the destruction of orthodox concepts of tonality.", imp: 2,
    cites: [W("Tristan_und_Isolde", "Tristan und Isolde"), B("topic/Tristan-und-Isolde-opera-by-Wagner", "Tristan und Isolde")] },
  { id: "c2eu-brahms-german-requiem", branch: "north-german-confederation", y: 1868.3, when: "1868", title: "Brahms's German Requiem is performed in Bremen",
    text: "Johannes Brahms's Ein deutsches Requiem, his most famous choral work, was completed in 1868; the whole work was first given in Bremen that year to great acclaim.", imp: 2,
    cites: [W("Johannes_Brahms", "Johannes Brahms"), B("biography/Johannes-Brahms", "Johannes Brahms")] },
  { id: "c2eu-tchaikovsky-swan-lake", branch: "russian-empire", y: 1877.17, when: "March 4, 1877", title: "Tchaikovsky's Swan Lake premieres at the Bolshoi",
    text: "The ballet was first performed by the Bolshoi in Moscow in March 1877, choreographed by Julius Reisinger; the later Petipa and Ivanov version became the classical standard.", imp: 2,
    cites: [W("Swan_Lake", "Swan Lake"), B("topic/Swan-Lake-ballet-by-Tchaikovsky", "Swan Lake")] },
  { id: "c2eu-debussy-faune", branch: "france", y: 1894.97, when: "December 22, 1894", title: "Debussy's Prelude to the Afternoon of a Faun premieres",
    text: "Claude Debussy's orchestral prelude, based on Mallarmé's poem, was composed in 1894 and first performed in Paris on December 22, 1894, conducted by Gustave Doret.", imp: 2,
    cites: [W("Prélude_à_l%27après-midi_d%27un_faune", "Prélude à l'après-midi d'un faune"), B("biography/Claude-Debussy", "Claude Debussy")] },
  { id: "c2eu-schoenberg-pierrot-lunaire", branch: "modernism", y: 1912.79, when: "October 16, 1912", title: "Schoenberg's Pierrot lunaire premieres in Berlin",
    text: "Arnold Schoenberg's melodrama for speaking voice and five instrumentalists, written in Berlin in 1912 for Albertine Zehme, had its official premiere at the Choralionsaal there on October 16, 1912.", imp: 2,
    cites: [W("Pierrot_lunaire", "Pierrot lunaire"), { t: "Pierrot lunaire op. 21 — Arnold Schönberg Center", u: "https://schoenberg.at/en/schoenberg/kompositionen/pierrot-lunaire-op-21-e" }] },
  { id: "c2eu-turner-rain-steam-speed", branch: "uk", y: 1844.4, when: "1844", title: "Turner shows Rain, Steam and Speed at the Royal Academy",
    text: "J. M. W. Turner exhibited his hazy view of a Great Western Railway train crossing the Thames in 1844, an early painting of the speed of the railway age.", imp: 2,
    cites: [W("Rain,_Steam_and_Speed_–_The_Great_Western_Railway", "Rain, Steam and Speed"), { t: "Rain, Steam, and Speed - The Great Western Railway — National Gallery", u: "https://www.nationalgallery.org.uk/paintings/joseph-mallord-william-turner-rain-steam-and-speed-the-great-western-railway" }] },
  { id: "c2eu-pre-raphaelite-brotherhood", branch: "uk", y: 1848.5, when: "1848", title: "The Pre-Raphaelite Brotherhood is founded in London",
    text: "Young painters including Millais and Rossetti formed the Brotherhood in 1848, reacting against what Britannica calls the Royal Academy's unimaginative and artificial historical painting.", imp: 3,
    cites: [W("Pre-Raphaelite_Brotherhood", "Pre-Raphaelite Brotherhood"), B("topic/Pre-Raphaelite-Brotherhood", "Pre-Raphaelite Brotherhood")] },
  { id: "c2eu-van-gogh-starry-night", branch: "france", y: 1889.45, when: "June 1889", title: "Van Gogh paints The Starry Night at Saint-Rémy",
    text: "While staying at the Saint-Paul-de-Mausole asylum near Saint-Rémy-de-Provence in 1889, Vincent van Gogh painted the swirling night sky over a village.", imp: 2,
    cites: [W("The_Starry_Night", "The Starry Night"), B("topic/The-Starry-Night", "The Starry Night")] },
  { id: "c2eu-picasso-braque-cubism", branch: "modernism", y: 1907, end: 1914, when: "1907–1914", title: "Picasso and Braque create Cubism in Paris",
    text: "Pablo Picasso and Georges Braque created Cubism in Paris between 1907 and 1914, a highly influential style of 20th-century visual art.", imp: 2,
    cites: [W("Cubism", "Cubism"), B("art/Cubism", "Cubism")] },
  { id: "c2eu-munch-the-scream", branch: "modernism", y: 1893.5, when: "1893", title: "Munch creates The Scream",
    text: "Edvard Munch first made The Scream in 1893, a work Britannica says seems to portray the spiritual anguish of living in the modern world; he later repeated it in several versions.", imp: 2,
    cites: [W("The_Scream", "The Scream"), B("biography/Edvard-Munch", "Edvard Munch")] },
  { id: "c2eu-malevich-black-square", branch: "russian-empire", y: 1915.5, when: "1915", title: "Malevich paints Black Square",
    text: "Kazimir Malevich completed the first Black Square in 1915, an oil painting he described as his breakthrough work and the inception of his Suprematist movement.", imp: 2,
    cites: [W("Black_Square_(painting)", "Black Square"), B("biography/Kazimir-Malevich", "Kazimir Malevich")] },
  { id: "c2eu-goya-black-paintings", branch: "spain", y: 1819.5, end: 1823, when: "c. 1819–1823", title: "Goya paints the Black Paintings",
    text: "At the Quinta del Sordo, his house outside Madrid, the aged Francisco Goya painted 14 brooding images directly on the plaster walls, dated 1819–23 by Britannica and 1820–23 by Wikipedia. They are now in the Prado.", imp: 2,
    cites: [W("Black_Paintings", "Black Paintings"), B("topic/Saturn-painting-by-Goya", "Saturn Devouring His Son (Goya)")] },
  { id: "c2eu-orpheu-magazine", branch: "portugal", y: 1915.15, when: "1915", title: "Pessoa and friends launch the journal Orpheu",
    text: "The short-lived Portuguese literary magazine Orpheu, founded in 1915, published Fernando Pessoa and served as a platform for Portuguese Futurism and Modernism.", imp: 2,
    cites: [W("Orpheu", "Orpheu"), B("topic/Orpheu", "Orpheu")] },
  { id: "c2eu-maxwell-dynamical-theory", branch: "uk", y: 1865.45, when: "1865", title: "Maxwell publishes his dynamical theory of the electromagnetic field",
    text: "Read to the Royal Society in December 1864 and approved for publication in June 1865, Maxwell's paper deduced that light is an electromagnetic wave.", imp: 2,
    cites: [W("A_Dynamical_Theory_of_the_Electromagnetic_Field", "A Dynamical Theory of the Electromagnetic Field"), { t: "Paper, 'A dynamical theory of the electromagnetic field' — Royal Society Science in the Making", u: "https://makingscience.royalsociety.org/items/pt_72_7/paper-a-dynamical-theory-of-the-electromagnetic-field-by-j-james-clerk-maxwell" }] },
  { id: "c2eu-faraday-induction", branch: "uk", y: 1831.66, when: "August 29, 1831", title: "Faraday demonstrates electromagnetic induction",
    text: "Michael Faraday demonstrated in 1831 that a changing magnetic field can induce an electric current in a circuit; his notebook describes an experiment on August 29, 1831.", imp: 2,
    cites: [W("Faraday%27s_law_of_induction", "Faraday's law of induction"), B("biography/Michael-Faraday", "Michael Faraday")] },
  { id: "c2eu-einstein-general-relativity", branch: "german-empire", y: 1915.87, when: "November 1915", title: "Einstein presents the field equations of general relativity",
    text: "In November 1915 Albert Einstein presented the field equations of general relativity to the Prussian Academy of Sciences in Berlin, redefining space, time and gravity.", imp: 1,
    cites: [W("General_relativity", "General relativity"), B("science/relativity", "Relativity")] },
  { id: "c2eu-mendeleev-periodic-table", branch: "russian-empire", y: 1869.18, when: "March 6, 1869", title: "Mendeleev announces the periodic law",
    text: "Dmitri Mendeleev presented his periodic law to the Russian Chemical Society, arranging the elements by atomic weight to show a periodicity of their properties.", imp: 2,
    cites: [W("Dmitri_Mendeleev", "Dmitri Mendeleev"), B("biography/Dmitri-Mendeleev", "Dmitri Mendeleev")] },
  { id: "c2eu-koch-tuberculosis", branch: "german-empire", y: 1882.23, when: "March 24, 1882", title: "Robert Koch announces the tuberculosis bacterium",
    text: "Koch presented his discovery of the tuberculosis bacterium to the German Physiological Society in Berlin; the World Health Organization now marks the date as World Tuberculosis Day.", imp: 2,
    cites: [W("Robert_Koch", "Robert Koch"), B("biography/Robert-Koch", "Robert Koch")] },
  { id: "c2eu-freud-interpretation-dreams", branch: "austria-hungary", y: 1899.84, when: "1899 (dated 1900)", title: "Freud publishes The Interpretation of Dreams",
    text: "Sigmund Freud's Die Traumdeutung appeared in 1899, though dated 1900. It introduced his theory of the unconscious in relation to dreams, which he saw as expressions of unconscious wishes.", imp: 2,
    cites: [W("The_Interpretation_of_Dreams", "The Interpretation of Dreams"), B("topic/The-Interpretation-of-Dreams", "The Interpretation of Dreams")] },
  { id: "c2eu-pavlov-nobel", branch: "russian-empire", y: 1904.9, when: "1904", title: "Pavlov wins the Nobel Prize for digestion research",
    text: "Ivan Pavlov of the Military Medical Academy in Saint Petersburg won the 1904 Nobel Prize in Physiology or Medicine for his work on the physiology of digestion.", imp: 2,
    cites: [W("Ivan_Pavlov", "Ivan Pavlov"), { t: "Ivan Pavlov – Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/medicine/1904/pavlov/facts/" }] },
  { id: "c2eu-solvay-conference-1911", branch: "belgium", y: 1911.85, when: "October 30–November 3, 1911", title: "The first Solvay Conference gathers physicists in Brussels",
    text: "Industrialist Ernest Solvay founded the conferences, and the first, on physics, was held in Brussels from October 30 to November 3, 1911. This invitation-only meeting is considered a turning point in physics.", imp: 2,
    cites: [W("Solvay_Conference", "Solvay Conference"), B("topic/Solvay-Conferences", "Solvay Conferences")] },
  { id: "c2eu-montessori-casa-dei-bambini", branch: "italy", y: 1907.5, when: "1907", title: "Montessori opens the first Casa dei Bambini in Rome",
    text: "Maria Montessori opened her first Children's House in the San Lorenzo district of Rome in 1907, applying her method to children of normal intelligence.", imp: 2,
    cites: [W("Montessori_education", "Montessori education"), B("biography/Maria-Montessori", "Maria Montessori")] },
  { id: "c2eu-altes-museum-opens", branch: "german-confederation", y: 1830.59, when: "August 3, 1830", title: "Schinkel's Altes Museum opens in Berlin",
    text: "Built from 1825 by order of Frederick William III of Prussia to plans by Karl Friedrich Schinkel, the Altes Museum was inaugurated on August 3, 1830 and is a major work of German Neoclassical architecture.", imp: 2,
    cites: [W("Altes_Museum", "Altes Museum"), B("biography/Karl-Friedrich-Schinkel", "Karl Friedrich Schinkel")] },
  { id: "c2eu-public-libraries-act", branch: "uk", y: 1850.6, when: "1850", title: "Public Libraries Act lets towns open free libraries",
    text: "The Act of 1850 first gave local boroughs in England the power to set up free public libraries, funded at public expense.", imp: 2,
    cites: [W("Public_Libraries_Act_1850", "Public Libraries Act 1850"), B("topic/public-library", "Public library"), { t: "Public Libraries Act 1850 — legislation.gov.uk", u: "https://www.legislation.gov.uk/ukpga/Vict/13-14/65/contents" }] },
  { id: "c2eu-hermitage-opens-public", branch: "russian-empire", y: 1852.5, when: "1852", title: "The Hermitage opens to the public in Saint Petersburg",
    text: "After reconstruction under Nicholas I from 1840 to 1852, the imperial collection became open to the public in 1852 as the Hermitage Museum.", imp: 2,
    cites: [W("Hermitage_Museum", "Hermitage Museum"), B("topic/Hermitage-museum-Saint-Petersburg-Russia", "Hermitage")] },
  { id: "c2eu-times-steam-press", branch: "uk", y: 1814.5, when: "1814", title: "The Times prints on a steam-driven press",
    text: "In 1814 The Times of London installed Friedrich Koenig's steam-driven cylinder press, allowing far more copies per hour and helping newspapers reach mass audiences.", imp: 2,
    cites: [W("The_Times", "The Times"), B("biography/Friedrich-Koenig", "Friedrich Koenig")] },
  { id: "c2eu-daily-mail-founded", branch: "uk", y: 1896.3, when: "1896", title: "Harmsworth founds the Daily Mail",
    text: "Alfred Harmsworth and his brother Harold devised the Daily Mail, first published in 1896, a halfpenny paper (rivals cost a penny) that was more populist and concise than other London dailies.", imp: 2,
    cites: [W("Daily_Mail", "Daily Mail"), B("topic/Daily-Mail", "Daily Mail")] },
  { id: "c2eu-wimbledon-first", branch: "uk", y: 1877.5, when: "1877", title: "First Wimbledon championship",
    text: "The first Wimbledon tennis championship was held in 1877 on a croquet lawn of the All England Club; Spencer Gore won the singles.", imp: 2,
    cites: [W("The_Championships,_Wimbledon", "The Championships, Wimbledon"), B("topic/Wimbledon-Championships", "Wimbledon Championships")] },
  { id: "c2eu-rugby-football-union", branch: "uk", y: 1871.07, when: "January 26, 1871", title: "The Rugby Football Union is founded in London",
    text: "At a meeting of 21 clubs in London on January 26, 1871, the Rugby Football Union was formed to draw up rules for the game first played at Rugby School in 1823.", imp: 2,
    cites: [W("Rugby_Football_Union", "Rugby Football Union"), B("topic/Rugby-Football-Union", "Rugby Football Union")] },
  { id: "c2eu-thames-tunnel-opens", branch: "uk", y: 1843.23, when: "March 25, 1843", title: "Brunel's Thames Tunnel opens",
    text: "Marc and Isambard Brunel's tunnel beneath the Thames, begun in 1825 with a tunnelling shield, opened to the public in 1843.", imp: 2,
    cites: [W("Thames_Tunnel", "Thames Tunnel"), B("topic/Thames-Tunnel", "Thames Tunnel")] },
  { id: "c2eu-palais-garnier-opens", branch: "france", y: 1875.01, when: "January 5, 1875", title: "The Palais Garnier opens in Paris",
    text: "Charles Garnier's opera house opened in January 1875 and became a symbol of Second Empire taste, its neo-Baroque style typical of Beaux-Arts design.", imp: 2,
    cites: [W("Palais_Garnier", "Palais Garnier"), B("biography/Charles-Garnier", "Charles Garnier")] },
  { id: "c2eu-barry-houses-of-parliament", branch: "uk", y: 1840, end: 1870, when: "1840–c. 1870", title: "Barry's Gothic Revival Palace of Westminster is built",
    text: "After the 1834 fire, Charles Barry's Gothic Revival design was chosen, and construction began in 1840, lasting about 30 years and producing today's Houses of Parliament.", imp: 2,
    cites: [W("Palace_of_Westminster", "Palace of Westminster"), B("biography/Charles-Barry", "Charles Barry")] },
  { id: "c2eu-caligari-film", branch: "weimar", y: 1920.15, when: "1920", title: "The Cabinet of Dr. Caligari defines German Expressionist film",
    text: "Robert Wiene's German silent horror film, released in 1920, is widely considered the first great work in its genre.", imp: 2,
    cites: [W("The_Cabinet_of_Dr._Caligari", "The Cabinet of Dr. Caligari"), B("topic/The-Cabinet-of-Dr-Caligari", "The Cabinet of Dr. Caligari")] },
  { id: "c2eu-mann-buddenbrooks", branch: "german-empire", y: 1901.5, when: "1901", title: "Thomas Mann publishes Buddenbrooks",
    text: "Thomas Mann's breakthrough novel on the decline of a Lübeck merchant family appeared in 1901 and was the main work cited when he won the 1929 Nobel Prize in Literature.", imp: 2,
    cites: [W("Buddenbrooks", "Buddenbrooks"), { t: "Thomas Mann – Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/literature/1929/mann/facts/" }] },
] });

TL.geo("c2eu-goethe-dies-faust-ii", { scope: "place", lat: 50.98, lon: 11.33, r: 40, label: "Weimar, Germany", src: "https://en.wikipedia.org/wiki/Weimar" });
TL.geo("c2eu-grimm-fairy-tales", { scope: "region", lat: 51, lon: 9, r: 450, label: "Germany", src: "https://en.wikipedia.org/wiki/Germany" });
TL.geo("c2eu-pushkin-onegin", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("c2eu-dickens-pickwick", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c2eu-jane-eyre", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c2eu-manzoni-promessi-sposi", { scope: "region", lat: 45.58, lon: 9.92, r: 120, label: "Lombardy, Italy", src: "https://en.wikipedia.org/wiki/Lombardy" });
TL.geo("c2eu-verdi-nabucco", { scope: "place", lat: 45.467, lon: 9.19, r: 30, label: "La Scala, Milan", src: "https://en.wikipedia.org/wiki/La_Scala" });
TL.geo("c2eu-hugo-les-miserables", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("c2eu-baudelaire-fleurs-du-mal", { scope: "place", lat: 48.857, lon: 2.352, r: 30, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("c2eu-dostoevsky-crime-punishment", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("c2eu-tolstoy-war-and-peace", { scope: "place", lat: 55.76, lon: 37.62, r: 60, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("c2eu-ibsen-dolls-house", { scope: "place", lat: 55.679, lon: 12.585, r: 30, label: "Royal Danish Theatre, Copenhagen", src: "https://en.wikipedia.org/wiki/Royal_Danish_Theatre" });
TL.geo("c2eu-wagner-tristan-isolde", { scope: "place", lat: 48.14, lon: 11.58, r: 30, label: "Munich, Germany", src: "https://en.wikipedia.org/wiki/Munich" });
TL.geo("c2eu-brahms-german-requiem", { scope: "place", lat: 53.0755, lon: 8.8085, r: 30, label: "Bremen, Germany", src: "https://en.wikipedia.org/wiki/Bremen_Cathedral" });
TL.geo("c2eu-tchaikovsky-swan-lake", { scope: "place", lat: 55.76, lon: 37.619, r: 30, label: "Bolshoi Theatre, Moscow", src: "https://en.wikipedia.org/wiki/Bolshoi_Theatre" });
TL.geo("c2eu-debussy-faune", { scope: "place", lat: 48.857, lon: 2.352, r: 30, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("c2eu-schoenberg-pierrot-lunaire", { scope: "place", lat: 52.52, lon: 13.405, r: 30, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("c2eu-turner-rain-steam-speed", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c2eu-pre-raphaelite-brotherhood", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c2eu-van-gogh-starry-night", { scope: "place", lat: 43.79, lon: 4.83, r: 30, label: "Saint-Rémy-de-Provence, France", src: "https://en.wikipedia.org/wiki/Saint-Rémy-de-Provence" });
TL.geo("c2eu-picasso-braque-cubism", { scope: "place", lat: 48.857, lon: 2.352, r: 30, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("c2eu-munch-the-scream", { scope: "place", lat: 59.91, lon: 10.75, r: 30, label: "Oslo, Norway", src: "https://en.wikipedia.org/wiki/Oslo" });
TL.geo("c2eu-malevich-black-square", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("c2eu-goya-black-paintings", { scope: "place", lat: 40.4168, lon: -3.7038, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
TL.geo("c2eu-orpheu-magazine", { scope: "region", lat: 39, lon: -8, r: 250, label: "Portugal", src: "https://en.wikipedia.org/wiki/Portugal" });
TL.geo("c2eu-maxwell-dynamical-theory", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c2eu-faraday-induction", { scope: "place", lat: 51.51, lon: -0.14, r: 30, label: "Royal Institution, London", src: "https://en.wikipedia.org/wiki/Royal_Institution" });
TL.geo("c2eu-einstein-general-relativity", { scope: "place", lat: 52.52, lon: 13.405, r: 30, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("c2eu-mendeleev-periodic-table", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("c2eu-koch-tuberculosis", { scope: "place", lat: 52.52, lon: 13.405, r: 30, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("c2eu-freud-interpretation-dreams", { scope: "place", lat: 48.21, lon: 16.37, r: 30, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
TL.geo("c2eu-pavlov-nobel", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("c2eu-solvay-conference-1911", { scope: "place", lat: 50.85, lon: 4.35, r: 40, label: "Brussels, Belgium", src: "https://en.wikipedia.org/wiki/Brussels" });
TL.geo("c2eu-montessori-casa-dei-bambini", { scope: "place", lat: 41.89, lon: 12.48, r: 30, label: "Rome, Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("c2eu-altes-museum-opens", { scope: "place", lat: 52.519, lon: 13.399, r: 30, label: "Altes Museum, Berlin", src: "https://en.wikipedia.org/wiki/Altes_Museum" });
TL.geo("c2eu-public-libraries-act", { scope: "region", lat: 53.13, lon: -1.38, r: 400, label: "England", src: "https://en.wikipedia.org/wiki/England" });
TL.geo("c2eu-hermitage-opens-public", { scope: "place", lat: 59.94, lon: 30.31, r: 30, label: "Hermitage Museum, Saint Petersburg", src: "https://en.wikipedia.org/wiki/Hermitage_Museum" });
TL.geo("c2eu-times-steam-press", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c2eu-daily-mail-founded", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c2eu-wimbledon-first", { scope: "place", lat: 51.42, lon: -0.21, r: 20, label: "Wimbledon, London", src: "https://en.wikipedia.org/wiki/Wimbledon,_London" });
TL.geo("c2eu-rugby-football-union", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("c2eu-thames-tunnel-opens", { scope: "place", lat: 51.5, lon: -0.052, r: 20, label: "Rotherhithe, London", src: "https://en.wikipedia.org/wiki/Thames_Tunnel" });
TL.geo("c2eu-palais-garnier-opens", { scope: "place", lat: 48.872, lon: 2.332, r: 20, label: "Palais Garnier, Paris", src: "https://en.wikipedia.org/wiki/Palais_Garnier" });
TL.geo("c2eu-barry-houses-of-parliament", { scope: "place", lat: 51.4995, lon: -0.1248, r: 20, label: "Palace of Westminster, London", src: "https://en.wikipedia.org/wiki/Palace_of_Westminster" });
TL.geo("c2eu-caligari-film", { scope: "place", lat: 52.52, lon: 13.405, r: 30, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("c2eu-mann-buddenbrooks", { scope: "place", lat: 53.866, lon: 10.687, r: 30, label: "Lübeck, Germany", src: "https://en.wikipedia.org/wiki/Lübeck" });
