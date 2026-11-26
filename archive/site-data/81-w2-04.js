// W2-04 fill: German Empire, Holy Roman Empire, Italy, Portugal, Russian Empire, Kingdom of Sardinia, Spain, 1800–1925. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };
TL.add({ events: [
  // German Empire
  { id: "w204-kulturkampf", branch: "german-empire", y: 1871.5, end: 1887, when: "1871–1887", imp: 2, link: "catholicism",
    title: "Bismarck's Kulturkampf against the Catholic Church",
    text: "Bismarck set out to subject the Catholic Church to state control: the Jesuits were dissolved in 1872, the May Laws of 1873 regulated clergy training, and civil marriage became compulsory in 1875.",
    cites: [B("event/Kulturkampf", "Kulturkampf"), W("Kulturkampf", "Kulturkampf")] },
  { id: "w204-bayreuth-festival", branch: "german-empire", y: D(1876, 8, 13), when: "August 13, 1876", imp: 3,
    title: "First Bayreuth Festival opens",
    text: "With funding that King Ludwig II supplied by credit, Richard Wagner's first Bayreuth Festival began; it opened in 1876 with the premiere of the Ring of the Nibelung cycle and became a fixture of German musical life.",
    cites: [{ t: "Festival History — Bayreuther Festspiele", u: "https://www.bayreuther-festspiele.de/en/festival/history/" }, B("place/Bayreuth", "Bayreuth"), W("Bayreuth_Festival", "Bayreuth Festival")] },
  { id: "w204-bismarck-resigns", branch: "german-empire", y: 1890.2, when: "March 1890", imp: 2,
    title: "Wilhelm II pressures Bismarck to resign",
    text: "The young emperor Wilhelm II forced the chancellor who had unified Germany and led it since 1871 out of office, wanting to pursue his own policies.",
    cites: [B("biography/William-II-emperor-of-Germany", "Wilhelm II"), W("Otto_von_Bismarck", "Otto von Bismarck")] },
  { id: "w204-rontgen-xrays", branch: "german-empire", y: D(1895, 11, 8), when: "November 8, 1895", imp: 2,
    title: "Röntgen discovers X-rays at Würzburg",
    text: "Experimenting with a cathode-ray tube, Wilhelm Röntgen saw a distant screen glow and went on to take the first X-ray photographs, including of the bones in his wife's hand. He won the first Nobel Prize in Physics in 1901.",
    cites: [B("biography/Wilhelm-Rontgen", "Wilhelm Conrad Roentgen"), { t: "Wilhelm Conrad Röntgen – Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/physics/1901/rontgen/facts/" }, W("Wilhelm_R%C3%B6ntgen", "Wilhelm Röntgen")] },
  { id: "w204-planck-quantum", branch: "german-empire", y: D(1900, 12, 14), when: "December 14, 1900", imp: 2,
    title: "Planck proposes the quantum of action",
    text: "Presenting to the German Physical Society in Berlin, Max Planck derived the black-body radiation law by assuming energy is emitted in discrete quanta, the starting point of quantum theory.",
    cites: [B("biography/Max-Planck", "Max Planck"), { t: "Max Planck – Biographical — NobelPrize.org", u: "https://www.nobelprize.org/prizes/physics/1918/planck/biographical/" }, W("Max_Planck", "Max Planck")] },
  { id: "w204-die-bruecke", branch: "german-empire", y: 1905.5, end: 1913, when: "1905–1913", imp: 3,
    title: "Die Brücke forms in Dresden",
    text: "Four architecture students, Kirchner, Heckel, Schmidt-Rottluff and Bleyl, formed Die Brücke in Dresden. Their first group exhibition came in 1906, and the group, a pivotal force in German Expressionism, broke up in 1913.",
    cites: [B("topic/Die-Brucke", "Die Brücke"), W("Die_Br%C3%BCcke", "Die Brücke")] },

  // Holy Roman Empire
  { id: "w204-final-recess", branch: "hre", y: 1803.1, when: "February 1803", imp: 2,
    title: "The Final Recess remakes the German map",
    text: "The Reichsdeputation's Final Recess handed most church lands, free cities and imperial knights' territories to larger states, which Britannica calls the end of the old order in Germany.",
    cites: [B("place/Germany/End-of-the-Holy-Roman-Empire", "Germany: End of the Holy Roman Empire"), W("Reichsdeputationshauptschluss", "Reichsdeputationshauptschluss")] },

  // Italy
  { id: "w204-pinocchio-serial", branch: "italy", y: D(1881, 7, 7), end: D(1883, 1, 25), when: "July 7, 1881 – January 25, 1883", imp: 3,
    title: "Collodi's Pinocchio begins serial publication",
    text: "Carlo Collodi's The Story of a Puppet appeared in installments in the Giornale per i bambini and came out as a book in 1883 as The Adventures of Pinocchio.",
    cites: [B("topic/Pinocchio", "Pinocchio"), W("The_Adventures_of_Pinocchio", "The Adventures of Pinocchio")] },
  { id: "w204-psi-founded", branch: "italy", y: D(1892, 8, 14), when: "August 14, 1892", imp: 3,
    title: "Italian Socialist Party founded in Genoa",
    text: "Delegates of workers' associations and parties founded the Party of Italian Workers in Genoa; it took the name Italian Socialist Party in 1893 and became a major force on Italy's political left.",
    cites: [B("topic/Italian-Socialist-Party", "Italian Socialist Party"), W("Italian_Socialist_Party", "Italian Socialist Party")] },
  { id: "w204-la-boheme", branch: "italy", y: D(1896, 2, 1), when: "February 1, 1896", imp: 3,
    title: "Puccini's La bohème premieres in Turin",
    text: "Giacomo Puccini's opera about young artists in Paris had its world premiere at the Teatro Regio under the 28-year-old Arturo Toscanini; it became one of the most performed operas in the repertoire.",
    cites: [B("biography/Giacomo-Puccini", "Giacomo Puccini"), W("La_boh%C3%A8me", "La bohème")] },
  { id: "w204-marconi-transatlantic", branch: "italy", y: D(1901, 12, 12), when: "December 12, 1901", imp: 2, link: "uk",
    title: "Marconi receives a radio signal across the Atlantic",
    text: "Italian inventor Guglielmo Marconi received signals sent from Poldhu, Cornwall, at St. John's, Newfoundland, the first wireless signal to span the Atlantic.",
    cites: [{ t: "Reception of Transatlantic Radio Signals, 1901 — Engineering and Technology History Wiki", u: "https://ethw.org/Milestones:Reception_of_Transatlantic_Radio_Signals,_1901" }, W("Guglielmo_Marconi", "Guglielmo Marconi")] },
  { id: "w204-italo-turkish-war", branch: "italy", y: D(1911, 9, 29), end: D(1912, 10, 18), when: "September 29, 1911 – October 18, 1912", imp: 2, link: "ottoman",
    title: "Italy conquers Libya in the Italo-Turkish War",
    text: "Italy declared war on the Ottoman Empire to seize Tripolitania and Cyrenaica. The Treaty of Ouchy of October 18, 1912, gave Italy possession of Libya.",
    cites: [B("event/Italo-Turkish-War", "Italo-Turkish War"), W("Italo-Turkish_War", "Italo-Turkish War")] },
  { id: "w204-caporetto", branch: "italy", y: D(1917, 10, 24), when: "October 24, 1917", imp: 2,
    title: "Disaster at Caporetto",
    text: "An Austro-German offensive on the Isonzo front broke the Italian line near Caporetto (now Kobarid, Slovenia) and sent Italian troops into a long retreat, the worst Italian defeat of the war.",
    cites: [B("event/Battle-of-Caporetto", "Battle of Caporetto"), W("Battle_of_Caporetto", "Battle of Caporetto")] },

  // Portugal
  { id: "w204-liberal-revolution", branch: "portugal", y: D(1820, 8, 24), when: "August 24, 1820", imp: 2, link: "brazil",
    title: "Liberal Revolution begins at Porto",
    text: "A constitutionalist revolt in Porto spread peacefully across the country and forced John VI to return from Brazil and accept a liberal constitution, ending absolute monarchy.",
    cites: [B("place/Portugal/Constitutionalism", "Portugal: Constitutionalism"), B("biography/John-VI-king-of-Portugal", "John VI"), W("Liberal_Revolution_of_1820", "Liberal Revolution of 1820")] },
  { id: "w204-evora-monte", branch: "portugal", y: D(1834, 5, 26), when: "May 26, 1834", imp: 2,
    title: "Concession of Evoramonte ends the Liberal Wars",
    text: "Miguel capitulated to the constitutionalists at Evoramonte, ending the civil war between the two brothers Miguel and Pedro; Miguel went into exile and Maria II reigned as a constitutional queen.",
    cites: [B("place/Portugal/Constitutionalism", "Portugal: Constitutionalism"), W("Concession_of_Evoramonte", "Concession of Evoramonte")] },
  { id: "w204-death-penalty-abolished", branch: "portugal", y: 1867.5, when: "1867", imp: 3,
    title: "Portugal abolishes the death penalty for civil crimes",
    text: "A penal reform in 1867 ended capital punishment for all crimes except military ones, making Portugal a pioneer in abolition; it had already ended it for political crimes in 1852.",
    cites: [{ t: "Charter of law of abolition of the death penalty, Lisbon — European Commission", u: "https://culture.ec.europa.eu/cultural-heritage/initiatives-and-success-stories/european-heritage-label/european-heritage-label-sites/charter-of-law-of-abolition-of-the-death-penalty-lisbon-portugal" }, W("Capital_punishment_in_Portugal", "Capital punishment in Portugal")] },
  { id: "w204-casino-conferences", branch: "portugal", y: 1871.4, when: "1871", imp: 3,
    title: "Casino Conferences shake Portuguese letters",
    text: "Antero de Quental organized a series of “democratic lectures” in Lisbon that ended the young writers' war against the older literary generation and, in Britannica's words, dealt the deathblow to Romanticism.",
    cites: [B("biography/Antero-Tarquinio-de-Quental", "Antero Tarquínio de Quental"), W("Antero_de_Quental", "Antero de Quental")] },
  { id: "w204-os-maias", branch: "portugal", y: 1888.5, when: "1888", imp: 3,
    title: "Eça de Queirós publishes Os Maias",
    text: "Written largely while the author was consul in Bristol, the novel depicts upper-middle-class and aristocratic Portuguese society in satire and is generally regarded as Eça de Queirós's masterpiece.",
    cites: [B("biography/Jose-Maria-de-Eca-de-Queiros", "José Maria de Eça de Queirós"), W("Os_Maias", "Os Maias")] },
  { id: "w204-british-ultimatum", branch: "portugal", y: D(1890, 1, 11), when: "January 11, 1890", imp: 2, link: "uk",
    title: "British Ultimatum shatters Portuguese pride",
    text: "Britain demanded that Portuguese forces withdraw from territory in what are now Malawi and Zimbabwe. The crisis outraged Portuguese opinion, damaged the monarchy of Charles I and bolstered republicans.",
    cites: [B("place/Portugal/Overseas-empire", "Portugal: Overseas empire"), W("1890_British_Ultimatum", "1890 British Ultimatum")] },
  { id: "w204-regicide", branch: "portugal", y: D(1908, 2, 1), when: "February 1, 1908", imp: 2,
    title: "King Carlos I and his heir assassinated in Lisbon",
    text: "Charles I and his elder son, Luís Filipe, were shot in Lisbon's Terreiro do Paço; the younger son became Manuel II at 18, and the monarchy fell two years later.",
    cites: [B("biography/Manuel-II", "Manuel II"), W("Lisbon_Regicide", "Lisbon Regicide")] },
  { id: "w204-republic-1910", branch: "portugal", y: D(1910, 10, 5), when: "October 5, 1910", imp: 2,
    title: "Revolution overthrows the monarchy; republic proclaimed",
    text: "A republican uprising toppled Manuel II, who went into exile near London, and replaced the centuries-old monarchy with the First Portuguese Republic. Religious orders were expelled on October 8.",
    cites: [B("biography/Manuel-II", "Manuel II"), B("place/Portugal/The-First-Republic-1910-26", "Portugal: The First Republic, 1910–26"), W("5_October_1910_revolution", "5 October 1910 revolution")] },
  { id: "w204-fatima", branch: "portugal", y: D(1917, 5, 13), end: D(1917, 10, 13), when: "May 13 – October 1917", imp: 3, link: "catholicism",
    title: "Marian apparitions reported at Fátima",
    text: "Three shepherd children reported seeing the Virgin Mary at Cova da Iria on May 13, 1917, and monthly until October; Fátima became one of the greatest Marian shrines in the world.",
    cites: [B("place/Fatima", "Fatima"), W("Our_Lady_of_F%C3%A1tima", "Our Lady of Fátima")] },

  // Russian Empire
  { id: "w204-alexander-i-accedes", branch: "russian-empire", y: D(1801, 3, 23), when: "March 23, 1801", imp: 2,
    title: "Paul I assassinated; Alexander I takes the throne",
    text: "Emperor Paul I was assassinated and his son Alexander became emperor. From 1801 to 1803 the new tsar consulted an Unofficial Committee of friends about ambitious reforms.",
    cites: [B("place/Russia/Russia-from-1801-to-1917", "Russia: Russia from 1801 to 1917"), W("Alexander_I_of_Russia", "Alexander I of Russia")] },
  { id: "w204-decembrist-revolt", branch: "russian-empire", y: D(1825, 12, 26), when: "December 26, 1825 (New Style)", imp: 2,
    title: "Decembrist revolt in St. Petersburg",
    text: "Liberal officers tried to block Nicholas I's accession after Alexander I's death. The rising was crushed; five leaders were executed and many more were imprisoned or exiled.",
    cites: [B("topic/Decembrist", "Decembrist"), B("place/Russia/Russia-from-1801-to-1917", "Russia: Russia from 1801 to 1917"), W("Decembrist_revolt", "Decembrist revolt")] },
  { id: "w204-november-uprising", branch: "russian-empire", y: D(1830, 11, 29), end: 1831.8, when: "November 29, 1830 – 1831", imp: 2, link: "poland",
    title: "Poles rise against Russian rule in the November Uprising",
    text: "Cadets in Warsaw revolted when Nicholas I planned to use the Polish army against the 1830 revolutions; Russian troops moved in early in 1831 and crushed the rebellion in the Congress Kingdom.",
    cites: [B("event/November-Insurrection", "November Insurrection"), W("November_Uprising", "November Uprising")] },
  { id: "w204-life-for-the-tsar", branch: "russian-empire", y: D(1836, 12, 9), when: "December 9, 1836 (November 27, Old Style)", imp: 3,
    title: "Glinka's A Life for the Tsar premieres",
    text: "Mikhail Glinka's opera, premiered in St. Petersburg, brought him fame and is often counted as the start of a distinctively Russian operatic tradition.",
    cites: [B("biography/Mikhail-Glinka", "Mikhail Glinka"), W("A_Life_for_the_Tsar", "A Life for the Tsar")] },
  { id: "w204-dead-souls", branch: "russian-empire", y: 1842.5, when: "1842", imp: 3,
    title: "Gogol publishes Dead Souls",
    text: "Nikolai Gogol's Dead Souls (Myortvye dushi), published in 1842, follows the social-climbing Chichikov and is considered one of the world's finest satires.",
    cites: [B("topic/Dead-Souls", "Dead Souls"), W("Dead_Souls", "Dead Souls")] },
  { id: "w204-peredvizhniki", branch: "russian-empire", y: 1870.5, when: "1870", imp: 3,
    title: "The Wanderers form the Society of Traveling Art Exhibitions",
    text: "Realist painters including Kramskoy, Repin and Perov broke with academic art and organized mobile exhibitions to bring serious art to the provinces; their shows ran from 1871.",
    cites: [B("topic/Peredvizhniki", "Peredvizhniki"), W("Peredvizhniki", "Peredvizhniki")] },
  { id: "w204-alexander-ii-assassinated", branch: "russian-empire", y: D(1881, 3, 13), when: "March 13, 1881 (March 1, Old Style)", imp: 2,
    title: "Alexander II assassinated by revolutionaries",
    text: "The tsar who freed the serfs was killed by a bomb thrown in St. Petersburg by members of the revolutionary organization People's Will, ending his reform era.",
    cites: [B("biography/Alexander-II-emperor-of-Russia", "Alexander II"), W("Alexander_II_of_Russia", "Alexander II of Russia")] },
  { id: "w204-trans-siberian", branch: "russian-empire", y: 1891.2, end: 1916, when: "1891–1916", imp: 2,
    title: "Trans-Siberian Railway construction begins",
    text: "Pushed by Sergei Witte to extend Russian influence into East Asia, the line was started in 1891; its completion in 1916 opened Siberia to settlement and industry.",
    cites: [B("topic/Trans-Siberian-Railroad", "Trans-Siberian Railroad"), W("Trans-Siberian_Railway", "Trans-Siberian Railway")] },
  { id: "w204-moscow-art-theatre", branch: "russian-empire", y: 1898.8, when: "October 1898", imp: 3,
    title: "Moscow Art Theatre opens",
    text: "Founded by Konstantin Stanislavsky and Vladimir Nemirovich-Danchenko, the theater opened with Aleksey Tolstoy's Tsar Fyodor Ioannovich and then staged Chekhov's plays, starting with The Seagull.",
    cites: [B("topic/Moscow-Art-Theatre", "Moscow Art Theatre"), W("Moscow_Art_Theatre", "Moscow Art Theatre")] },

  // Kingdom of Sardinia
  { id: "w204-marengo", branch: "savoy-sardinia", y: D(1800, 6, 14), when: "June 14, 1800", imp: 3, link: "france",
    title: "Napoleon wins at Marengo in Piedmont",
    text: "Napoleon's army narrowly defeated the Austrians near Alessandria in Piedmont. The victory gave France Lombardy up to the Mincio River and secured Napoleon's authority in Paris.",
    cites: [B("event/Battle-of-Marengo", "Battle of Marengo"), W("Battle_of_Marengo", "Battle of Marengo")] },
  { id: "w204-piedmont-revolt-1821", branch: "savoy-sardinia", y: 1821.2, when: "1821", imp: 2,
    title: "Piedmont revolt forces Victor Emmanuel I to abdicate",
    text: "Carbonari-inspired liberals forced a constitution on the kingdom; Victor Emmanuel I abdicated in favor of his brother Charles Felix, and the liberal experiment was soon undone.",
    cites: [B("biography/Victor-Emmanuel-I", "Victor Emmanuel I"), W("Revolutions_of_1820", "Revolutions of 1820")] },
  { id: "w204-museo-egizio", branch: "savoy-sardinia", y: 1824.5, when: "1824", imp: 3,
    title: "King Charles Felix founds Turin's Egyptian Museum",
    text: "The king bought Bernardino Drovetti's collection of Egyptian antiquities, and the Museo Egizio opened in Turin; it is now regarded as the oldest museum devoted entirely to ancient Egypt.",
    cites: [{ t: "The Museum History — Museo Egizio", u: "https://museoegizio.it/en/discover/story/" }, W("Museo_Egizio", "Museo Egizio")] },
  { id: "w204-statuto-albertino", branch: "savoy-sardinia", y: D(1848, 3, 4), when: "March 4, 1848", imp: 2,
    title: "Charles Albert grants the Statuto Albertino",
    text: "Amid the 1848 revolutions, the king gave Piedmont-Sardinia a constitution modeled on the French Charter of 1830; it later became the constitution of the Kingdom of Italy.",
    cites: [B("event/Statuto-Albertino", "Statuto Albertino"), W("Statuto_Albertino", "Statuto Albertino")] },
  { id: "w204-cavour-prime-minister", branch: "savoy-sardinia", y: 1852.85, when: "November 1852", imp: 2,
    title: "Cavour becomes prime minister",
    text: "Victor Emmanuel II turned the government over to Count Cavour, whose diplomacy and war-making over the next years led to the unification of Italy under the Savoy crown.",
    cites: [B("biography/Victor-Emmanuel-II", "Victor Emmanuel II"), B("biography/Camillo-Benso-conte-di-Cavour", "Camillo Benso, count di Cavour")] },

  // Spain
  { id: "w204-dos-de-mayo", branch: "spain", y: D(1808, 5, 2), when: "May 2, 1808", imp: 2, link: "france",
    title: "Dos de Mayo uprising in Madrid",
    text: "A crowd gathered at the Royal Palace and rose against French occupation; Murat's troops crushed it, but the revolt spread and became the Peninsular War.",
    cites: [B("event/Dos-de-Mayo-Uprising", "Dos de Mayo Uprising"), W("Dos_de_Mayo_Uprising", "Dos de Mayo Uprising")] },
  { id: "w204-constitution-of-cadiz", branch: "spain", y: D(1812, 3, 19), when: "March 19, 1812", imp: 2,
    title: "Cádiz Cortes approve a liberal constitution",
    text: "Besieged by French troops, the Cortes of Cádiz ratified a liberal constitution that created a limited monarchy and became an important model for later constitutions in Spain and Spanish America.",
    cites: [B("event/Constitution-of-Cadiz", "Constitution of Cádiz"), W("Spanish_Constitution_of_1812", "Spanish Constitution of 1812")] },
  { id: "w204-prado-opens", branch: "spain", y: 1819.9, when: "November 1819", imp: 3,
    title: "The Prado opens as the Royal Museum of Painting",
    text: "The building commissioned by Charles III in 1785 opened to the public in Madrid, laying the foundation of the Prado, one of the world's great art museums.",
    cites: [B("topic/Prado-Museum", "Prado Museum"), W("Prado_Museum", "Prado Museum")] },
  { id: "w204-riego-revolt", branch: "spain", y: D(1820, 1, 1), when: "January 1, 1820", imp: 2,
    title: "Riego's pronunciamiento restores the 1812 constitution",
    text: "A military revolt led by Rafael del Riego forced Ferdinand VII to reinstate the 1812 constitution and began the Liberal Triennium of 1820–1823.",
    cites: [B("event/Spanish-Revolution-of-1820", "Spanish Revolution of 1820"), W("Trienio_Liberal", "Trienio Liberal")] },
  { id: "w204-first-carlist-war", branch: "spain", y: 1833.8, end: 1840, when: "1833–1840", imp: 2,
    title: "First Carlist War",
    text: "After Ferdinand VII's death in 1833, supporters of his brother Don Carlos fought the supporters of the infant Isabella II in a civil war that killed about 5% of Spain's population.",
    cites: [B("event/Carlist-Wars", "Carlist wars"), W("First_Carlist_War", "First Carlist War")] },
  { id: "w204-glorious-revolution", branch: "spain", y: 1868.7, when: "September 1868", imp: 2,
    title: "The Glorious Revolution deposes Isabella II",
    text: "A naval mutiny at Cádiz, joined by the exiled general Juan Prim, ended the reign of Isabella II and opened a six-year period of experiments with constitutional monarchy and republic.",
    cites: [B("biography/Juan-Prim", "Juan Prim"), B("biography/Isabella-II-queen-of-Spain", "Isabella II"), W("Glorious_Revolution_(Spain)", "Glorious Revolution (Spain)")] },
  { id: "w204-first-republic", branch: "spain", y: D(1873, 2, 11), end: D(1874, 12, 29), when: "February 11, 1873 – December 29, 1874", imp: 2,
    title: "First Spanish Republic proclaimed",
    text: "After King Amadeo I abdicated, the Cortes proclaimed a republic; it faced a Carlist uprising and unrest and lasted less than two years.",
    cites: [B("place/Spain/The-Revolution-of-1868-and-the-Republic-of-1873", "Spain: The Revolution of 1868 and the Republic of 1873"), W("First_Spanish_Republic", "First Spanish Republic")] },
  { id: "w204-sagrada-familia-begun", branch: "spain", y: D(1882, 3, 19), when: "March 19, 1882", imp: 3,
    title: "Construction of the Sagrada Família begins",
    text: "Work on the Barcelona church began under architect Francisco de Paula del Villar; Antoni Gaudí soon took over and made it his life's work.",
    cites: [B("topic/Sagrada-Familia", "Sagrada Família"), W("Sagrada_Fam%C3%ADlia", "Sagrada Família")] },
  { id: "w204-barcelona-expo-1888", branch: "spain", y: 1888.4, end: 1888.94, when: "1888", imp: 3,
    title: "Barcelona hosts Spain's first world's fair",
    text: "Organized under Mayor Francesc Rius Taulet and held in the Parc de la Ciutadella, the 1888 Universal Exposition was Spain's first world's fair, with Elias Rogent as its architectural director.",
    cites: [{ t: "Barcelona Universal Exhibition of 1888 — Universitat de Barcelona", u: "https://www.ub.edu/visitavirtual/visitavirtualEH/index.php/en/get-to-know-the-university-of-barcelona/the-city-in-the-nineteenth-century/the-old-city-and-the-walls/390-barcelona-universal-exhibition-of-1888" }, W("1888_Barcelona_Universal_Exposition", "1888 Barcelona Universal Exposition")] },
  { id: "w204-cajal-nobel", branch: "spain", y: 1906.9, when: "1906", imp: 2,
    title: "Ramón y Cajal wins the Nobel Prize",
    text: "Santiago Ramón y Cajal shared the Nobel Prize in Physiology or Medicine with Camillo Golgi for establishing the neuron as the basic unit of the nervous system.",
    cites: [{ t: "Santiago Ramón y Cajal – Facts — NobelPrize.org", u: "https://www.nobelprize.org/prizes/medicine/1906/cajal/facts/" }, B("biography/Santiago-Ramon-y-Cajal", "Santiago Ramón y Cajal")] },
  { id: "w204-residencia-estudiantes", branch: "spain", y: D(1910, 10, 1), when: "October 1, 1910", imp: 3,
    title: "Residencia de Estudiantes opens in Madrid",
    text: "Founded by royal decree of May 6, the student residence opened with 15 students and became a hub of the arts and sciences, where Lorca, Dalí and Buñuel lived and Einstein and Curie lectured.",
    cites: [{ t: "Chronology 1876–1936 — 100% Residencia (1910–2010)", u: "https://exposiciones.residencia.csic.es/100residencia/en/cronologia/1876_1936.htm" }, W("Residencia_de_Estudiantes", "Residencia de Estudiantes")] },
]});

TL.geo("w204-kulturkampf", { scope: "region", lat: 52.52, lon: 13.4, r: 700, label: "Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("w204-bayreuth-festival", { scope: "place", lat: 49.95, lon: 11.58, r: 40, label: "Bayreuth, Germany", src: "https://en.wikipedia.org/wiki/Bayreuth" });
TL.geo("w204-bismarck-resigns", { scope: "place", lat: 52.52, lon: 13.4, r: 60, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("w204-rontgen-xrays", { scope: "place", lat: 49.78, lon: 9.93, r: 40, label: "Würzburg, Germany", src: "https://en.wikipedia.org/wiki/W%C3%BCrzburg" });
TL.geo("w204-planck-quantum", { scope: "place", lat: 52.52, lon: 13.4, r: 60, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("w204-die-bruecke", { scope: "place", lat: 51.05, lon: 13.74, r: 40, label: "Dresden, Germany", src: "https://en.wikipedia.org/wiki/Dresden" });
TL.geo("w204-final-recess", { scope: "region", lat: 49.02, lon: 12.08, r: 600, label: "Germany", src: "https://en.wikipedia.org/wiki/Regensburg" });
TL.geo("w204-pinocchio-serial", { scope: "region", lat: 41.89, lon: 12.48, r: 600, label: "Italy", src: "https://en.wikipedia.org/wiki/Rome" });
TL.geo("w204-psi-founded", { scope: "place", lat: 44.41, lon: 8.93, r: 40, label: "Genoa, Italy", src: "https://en.wikipedia.org/wiki/Genoa" });
TL.geo("w204-la-boheme", { scope: "place", lat: 45.08, lon: 7.68, r: 40, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Turin" });
TL.geo("w204-marconi-transatlantic", { scope: "place", lat: 47.56, lon: -52.71, r: 40, label: "St. John's, Newfoundland", src: "https://en.wikipedia.org/wiki/St._John%27s,_Newfoundland_and_Labrador" });
TL.geo("w204-italo-turkish-war", { scope: "region", lat: 32.9, lon: 13.2, r: 900, label: "Libya", src: "https://en.wikipedia.org/wiki/Tripoli" });
TL.geo("w204-caporetto", { scope: "place", lat: 46.25, lon: 13.58, r: 40, label: "Kobarid, Slovenia", src: "https://en.wikipedia.org/wiki/Kobarid" });
TL.geo("w204-liberal-revolution", { scope: "place", lat: 41.15, lon: -8.61, r: 40, label: "Porto, Portugal", src: "https://en.wikipedia.org/wiki/Porto" });
TL.geo("w204-evora-monte", { scope: "place", lat: 38.77, lon: -7.72, r: 30, label: "Evoramonte, Portugal", src: "https://en.wikipedia.org/wiki/Evoramonte" });
TL.geo("w204-death-penalty-abolished", { scope: "region", lat: 38.73, lon: -9.15, r: 300, label: "Portugal", src: "https://en.wikipedia.org/wiki/Lisbon" });
TL.geo("w204-casino-conferences", { scope: "place", lat: 38.73, lon: -9.15, r: 40, label: "Lisbon, Portugal", src: "https://en.wikipedia.org/wiki/Lisbon" });
TL.geo("w204-os-maias", { scope: "place", lat: 38.73, lon: -9.15, r: 40, label: "Lisbon, Portugal", src: "https://en.wikipedia.org/wiki/Lisbon" });
TL.geo("w204-british-ultimatum", { scope: "region", lat: -17.6, lon: 30.6, r: 900, label: "Mashonaland and the Shire highlands", src: "https://en.wikipedia.org/wiki/Mashonaland" });
TL.geo("w204-regicide", { scope: "place", lat: 38.7, lon: -9.14, r: 30, label: "Terreiro do Paço, Lisbon", src: "https://en.wikipedia.org/wiki/Pra%C3%A7a_do_Com%C3%A9rcio" });
TL.geo("w204-republic-1910", { scope: "place", lat: 38.73, lon: -9.15, r: 40, label: "Lisbon, Portugal", src: "https://en.wikipedia.org/wiki/Lisbon" });
TL.geo("w204-fatima", { scope: "place", lat: 39.63, lon: -8.67, r: 30, label: "Fátima, Portugal", src: "https://en.wikipedia.org/wiki/F%C3%A1tima,_Portugal" });
TL.geo("w204-alexander-i-accedes", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("w204-decembrist-revolt", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("w204-november-uprising", { scope: "place", lat: 52.23, lon: 21.01, r: 60, label: "Warsaw, Poland", src: "https://en.wikipedia.org/wiki/Warsaw" });
TL.geo("w204-life-for-the-tsar", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("w204-dead-souls", { scope: "region", lat: 55.76, lon: 37.62, r: 800, label: "Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("w204-peredvizhniki", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("w204-alexander-ii-assassinated", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("w204-trans-siberian", { scope: "region", lat: 61, lon: 105, r: 3500, label: "Siberia", src: "https://en.wikipedia.org/wiki/Siberia" });
TL.geo("w204-moscow-art-theatre", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("w204-marengo", { scope: "place", lat: 44.89, lon: 8.64, r: 30, label: "Marengo, Alessandria", src: "https://en.wikipedia.org/wiki/Battle_of_Marengo" });
TL.geo("w204-piedmont-revolt-1821", { scope: "place", lat: 45.08, lon: 7.68, r: 40, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Turin" });
TL.geo("w204-museo-egizio", { scope: "place", lat: 45.07, lon: 7.69, r: 40, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Museo_Egizio" });
TL.geo("w204-statuto-albertino", { scope: "place", lat: 45.08, lon: 7.68, r: 40, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Turin" });
TL.geo("w204-cavour-prime-minister", { scope: "place", lat: 45.08, lon: 7.68, r: 40, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Turin" });
TL.geo("w204-dos-de-mayo", { scope: "place", lat: 40.42, lon: -3.7, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
TL.geo("w204-constitution-of-cadiz", { scope: "place", lat: 36.53, lon: -6.29, r: 40, label: "Cádiz, Spain", src: "https://en.wikipedia.org/wiki/C%C3%A1diz" });
TL.geo("w204-prado-opens", { scope: "place", lat: 40.41, lon: -3.69, r: 30, label: "Prado Museum, Madrid", src: "https://en.wikipedia.org/wiki/Prado_Museum" });
TL.geo("w204-riego-revolt", { scope: "place", lat: 36.53, lon: -6.29, r: 40, label: "Cádiz, Spain", src: "https://en.wikipedia.org/wiki/C%C3%A1diz" });
TL.geo("w204-first-carlist-war", { scope: "region", lat: 42.82, lon: -1.65, r: 400, label: "Northern Spain", src: "https://en.wikipedia.org/wiki/Navarre" });
TL.geo("w204-glorious-revolution", { scope: "place", lat: 36.53, lon: -6.29, r: 40, label: "Cádiz, Spain", src: "https://en.wikipedia.org/wiki/C%C3%A1diz" });
TL.geo("w204-first-republic", { scope: "place", lat: 40.42, lon: -3.7, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
TL.geo("w204-sagrada-familia-begun", { scope: "place", lat: 41.4, lon: 2.17, r: 30, label: "Sagrada Família, Barcelona", src: "https://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia" });
TL.geo("w204-barcelona-expo-1888", { scope: "place", lat: 41.39, lon: 2.18, r: 30, label: "Parc de la Ciutadella, Barcelona", src: "https://en.wikipedia.org/wiki/Parc_de_la_Ciutadella" });
TL.geo("w204-cajal-nobel", { scope: "place", lat: 40.42, lon: -3.7, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
TL.geo("w204-residencia-estudiantes", { scope: "place", lat: 40.42, lon: -3.7, r: 30, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
