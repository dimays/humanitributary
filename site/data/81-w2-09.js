// Fill-in W2-09: Haiti, Mexico, Peru, Venezuela, the United States, Indigenous peoples of the Americas, Gran Colombia, New Granada, New Spain and the Río de la Plata, 1800–1925 (with literature, music and art). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const X = (u, t) => ({ t, u });
const G = (id, lat, lon, r, label, slug, scope = "place") => TL.geo("w209-" + id, { scope, lat, lon, r, label, src: `https://en.wikipedia.org/wiki/${slug}` });

TL.add({ events: [
  // ---------- Haiti ----------
  { id: "w209-dessalines-empire", branch: "haiti", y: 1804.77, end: 1806.79, when: "October 1804 – October 17, 1806", title: "Dessalines reigns as Emperor Jacques I",
    text: "Months after Haitian independence, Jean-Jacques Dessalines took the title of emperor and was crowned at Le Cap in October 1804. He enforced plantation labor and was killed in 1806 putting down a revolt led by Alexandre Pétion.", imp: 2,
    cites: [W("Jean-Jacques_Dessalines", "Jean-Jacques Dessalines"), B("biography/Jean-Jacques-Dessalines", "Jean-Jacques Dessalines")] },
  { id: "w209-citadelle", branch: "haiti", y: 1805, end: 1820, when: "1805–1820", title: "Christophe builds the Citadelle and Sans-Souci Palace",
    text: "Henri Christophe, who proclaimed himself king in the north in 1811, commissioned the mountaintop Citadelle Laferrière (1805–1820) and Sans-Souci Palace (1810–1813); UNESCO listed both as World Heritage in 1982.", imp: 2,
    cites: [W("Citadelle_Laferri%C3%A8re", "Citadelle Laferrière"), W("Sans-Souci_Palace", "Sans-Souci Palace"), B("biography/Henry-Christophe", "Henry Christophe")] },
  { id: "w209-indemnity-1825", branch: "haiti", y: 1825.52, when: "July 11, 1825", title: "France recognizes Haiti in exchange for an indemnity",
    text: "President Jean-Pierre Boyer accepted a French demand of 150 million francs in return for recognition of independence. Haiti borrowed to pay it, and the debt and its interest were not fully cleared until 1947.", imp: 2, link: "france",
    cites: [W("Haitian_independence_debt", "Haitian independence debt"), B("biography/Jean-Pierre-Boyer", "Jean-Pierre Boyer"), W("Jean-Pierre_Boyer", "Jean-Pierre Boyer")] },
  { id: "w209-dominican-secession", branch: "haiti", y: 1844.15, when: "February 27, 1844", title: "Dominicans declare independence from Haiti",
    text: "About 100 Dominicans seized the Puerta del Conde fortress in Santo Domingo, ending the 22-year Haitian rule over the eastern half of Hispaniola. Haitian armies failed to retake it in a war lasting until 1856.", imp: 2,
    cites: [W("Dominican_War_of_Independence", "Dominican War of Independence"), B("biography/Juan-Pablo-Duarte", "Juan Pablo Duarte"), B("place/Santo-Domingo", "Santo Domingo")] },
  { id: "w209-soulouque-empire", branch: "haiti", y: 1849.65, when: "August 26, 1849", title: "Soulouque proclaimed Emperor Faustin I",
    text: "President Faustin Soulouque was proclaimed emperor by the Haitian legislature and crowned in Port-au-Prince in 1852 in a ceremony modeled on Napoleon's. His empire lasted until 1859.", imp: 3,
    cites: [W("Faustin_Soulouque", "Faustin Soulouque"), B("biography/Faustin-Elie-Soulouque", "Faustin-Élie Soulouque")] },
  { id: "w209-choucoune", branch: "haiti", y: 1883, when: "1883", title: "Oswald Durand's Creole poem “Choucoune”",
    text: "Durand's lyrical poem praising a Haitian woman became his most famous work and a landmark of Haitian Creole poetry. Set to music in 1893, it was later rewritten in English as “Yellow Bird.”", imp: 3,
    cites: [W("Oswald_Durand", "Oswald Durand"), W("Choucoune", "Choucoune"), X("https://digitalcommons.montclair.edu/phareshatiens/author/durand", "Oswald Durand — Phares haïtiens, Montclair State University")] },
  { id: "w209-firmin-equality", branch: "haiti", y: 1885, when: "1885", title: "Firmin publishes The Equality of the Human Races",
    text: "Haitian scholar Anténor Firmin, a member of the Société d'Anthropologie de Paris, answered Gobineau's racial hierarchy with De l'égalité des races humaines. It was not translated into English until 2000.", imp: 2,
    cites: [W("Ant%C3%A9nor_Firmin", "Anténor Firmin"), X("https://sciencenews.org/?p=3124374", "Anténor Firmin challenged anthropology’s racist roots 150 years ago — Science News")] },
  { id: "w209-us-invasion-1915", branch: "haiti", y: 1915.57, when: "July 28, 1915", title: "US Marines land at Port-au-Prince",
    text: "After President Vilbrun Guillaume Sam was lynched by a mob, Woodrow Wilson sent the Marines to Haiti.", imp: 2, link: "usa",
    cites: [W("United_States_occupation_of_Haiti", "United States occupation of Haiti"), { t: "Occupation of Haiti, 1915–34 — Office of the Historian", u: "https://history.state.gov/milestones/1914-1920/haiti", k: "reference" }] },

  // ---------- Mexico ----------
  { id: "w209-constitution-1824", branch: "mexico", y: 1824.76, when: "October 4, 1824", title: "Constitution of 1824 creates the Mexican republic",
    text: "Mexico's first constitution established a federal republic of states, replacing Iturbide's short-lived empire.", imp: 2,
    cites: [W("1824_Constitution_of_Mexico", "1824 Constitution of Mexico")] },
  { id: "w209-texas-revolution", branch: "mexico", y: 1835.75, end: 1836.3, when: "October 2, 1835 – April 21, 1836", title: "Texas rebels and wins independence from Mexico",
    text: "Anglo-American settlers and Tejanos rose against Mexico's centralist government and defeated Santa Anna at San Jacinto, resulting in the Republic of Texas.", imp: 2, link: "usa",
    cites: [W("Texas_Revolution", "Texas Revolution"), B("event/Texas-Revolution", "Texas Revolution")] },
  { id: "w209-guadalupe-hidalgo", branch: "mexico", y: 1848.09, when: "February 2, 1848", title: "Treaty of Guadalupe Hidalgo ends the war with the US",
    text: "Mexico signed away its northern territory after the Mexican–American War; ratifications were exchanged on May 30. The treaty drew the lasting border and transferred California and the Southwest to the United States.", imp: 1, link: "usa",
    cites: [W("Treaty_of_Guadalupe_Hidalgo", "Treaty of Guadalupe Hidalgo"), B("event/Treaty-of-Guadalupe-Hidalgo", "Treaty of Guadalupe Hidalgo")] },
  { id: "w209-constitution-1857", branch: "mexico", y: 1857.1, when: "February 5, 1857", title: "Liberal Constitution of 1857 proclaimed",
    text: "The federal constitution guaranteed individual rights such as free speech and conscience and male suffrage. The clergy threatened excommunication for those who swore to it, a reform dispute that Benito Juárez's Liberals carried forward.", imp: 2,
    cites: [W("Federal_Constitution_of_the_United_Mexican_States_of_1857", "Federal Constitution of the United Mexican States of 1857"), B("biography/Benito-Juarez", "Benito Juárez")] },
  { id: "w209-tecoac", branch: "mexico", y: 1876.88, when: "November 16, 1876", title: "Porfirio Díaz wins at Tecoac and seizes power",
    text: "Díaz's rebels defeated the forces of President Lerdo de Tejada at Tecoac in Tlaxcala. Díaz was elected president in 1877, and under him foreigners built railroads and dug mines.", imp: 2,
    cites: [W("Battle_of_Tecoac", "Battle of Tecoac"), B("biography/Porfirio-Diaz", "Porfirio Díaz")] },
  { id: "w209-central-railway", branch: "mexico", y: 1884.2, when: "March 1884", title: "Mexican Central Railway links the capital to the US border",
    text: "The American-owned line opened its main track from Mexico City to Ciudad Juárez, connecting to US railroads at El Paso. Foreign-financed railroads were central to Díaz's economic program.", imp: 3,
    cites: [W("Mexican_Central_Railway", "Mexican Central Railway"), B("biography/Porfirio-Diaz", "Porfirio Díaz")] },
  { id: "w209-cielito-lindo", branch: "mexico", y: 1882, when: "1882", title: "“Cielito Lindo” popularized by Quirino Mendoza",
    text: "Quirino Mendoza y Cortés popularized the Mexican folk song “Cielito Lindo” in 1882; its authorship is debated, and Mexico's INBAL says it first appeared in Chihuahua that year.", imp: 3,
    cites: [W("Cielito_Lindo", "Cielito Lindo"), X("https://www.excelsior.com.mx/funcion/quien-creo-la-cancion-cielito-lindo/1705743", "¿Quién creó la canción “Cielito Lindo”? — Excélsior")] },
  { id: "w209-first-films", branch: "mexico", y: 1896.6, when: "1896", title: "The cinematograph reaches Mexico",
    text: "Seven months after the first Lumière show in France, Claude Ferdinand Bon Bernard and Gabriel Veyre brought the cinematograph to Mexico. President Díaz saw the films that year and began to have his presidency filmed.", imp: 3,
    cites: [W("Cinema_of_Mexico", "Cinema of Mexico"), X("https://www.gaceta.unam.mx/hace-124-anos-llego-el-cine-a-mexico/", "Hace 124 años llegó el cine a México — Gaceta UNAM")] },

  // ---------- Peru ----------
  { id: "w209-confederation", branch: "peru", y: 1836.82, end: 1839.65, when: "October 28, 1836 – August 25, 1839", title: "Peru–Bolivian Confederation",
    text: "Marshal Andrés de Santa Cruz united Peru and Bolivia as a confederation under his protection. It lasted until 1839.", imp: 2,
    cites: [W("Peru%E2%80%93Bolivian_Confederation", "Peru–Bolivian Confederation"), B("biography/Andres-de-Santa-Cruz", "Andrés de Santa Cruz")] },
  { id: "w209-guano-boom", branch: "peru", y: 1840, end: 1879, when: "1840–1879", title: "Guano boom funds the Peruvian state",
    text: "After a 1840 deal with a Liverpool merchant house and French investors to commercialize bird guano, exports to Britain, Europe and the US became Peru's largest source of revenue until the trade collapsed in the 1870s.", imp: 2,
    cites: [W("Guano", "Guano"), X("https://encyclopedia.com/humanities/encyclopedias-almanacs-transcripts-and-maps/guano-industry", "Guano Industry — Encyclopedia.com")] },
  { id: "w209-castilla-abolition", branch: "peru", y: 1854.5, when: "1854", title: "Castilla abolishes slavery and Indian tribute",
    text: "After a liberal revolution, President Ramón Castilla decreed the end of slavery and of the Indigenous head tax in Peru.", imp: 2,
    cites: [W("Ram%C3%B3n_Castilla", "Ramón Castilla"), B("biography/Ramon-Castilla", "Ramón Castilla")] },
  { id: "w209-callao-1866", branch: "peru", y: 1866.33, when: "May 2, 1866", title: "Dos de Mayo: Peru repels the Spanish fleet at Callao",
    text: "Peruvian shore batteries and ships fought a Spanish squadron under Admiral Méndez Núñez at Callao. The Spanish withdrew, and both sides claimed the day; it was the last battle of the war.", imp: 3, link: "spain",
    cites: [W("Battle_of_Callao", "Battle of Callao"), X("https://andina.pe/ingles/noticia-peru-marks-149th-anniversary-of-battle-of-callao-554377.aspx", "Peru marks 149th anniversary of Battle of Callao — Andina")] },
  { id: "w209-palma-tradiciones", branch: "peru", y: 1872, end: 1910, when: "1872–1910", title: "Ricardo Palma's Tradiciones peruanas",
    text: "Palma, librarian of the National Library, created the “tradición,” a short form mixing history, legend and humor about colonial and republican Peru. His volumes appeared from 1872 to 1910.", imp: 2,
    cites: [W("Ricardo_Palma", "Ricardo Palma"), W("Peruvian_Traditions", "Peruvian Traditions"), B("biography/Ricardo-Palma", "Ricardo Palma")] },
  { id: "w209-ancon", branch: "peru", y: 1883.8, when: "October 20, 1883", title: "Treaty of Ancón ends Peru's war with Chile",
    text: "Peru and Chile signed peace ending the War of the Pacific. Peru ceded Tarapacá to Chile and accepted ten years of Chilean administration of Tacna and Arica, pending a plebiscite.", imp: 2, link: "chile",
    cites: [W("Treaty_of_Anc%C3%B3n", "Treaty of Ancón"), B("event/Treaty-of-Ancon", "Treaty of Ancón")] },
  { id: "w209-aves-sin-nido", branch: "peru", y: 1889.5, when: "1889", title: "Matto de Turner publishes Aves sin nido",
    text: "Clorinda Matto de Turner's novel of the abuse of Andean Indigenous people by local officials and clergy became a founding work of Peruvian indigenismo and the first of her three novels.", imp: 3,
    cites: [W("Clorinda_Matto_de_Turner", "Clorinda Matto de Turner"), X("https://www.uv.es/~fores/ClorindaMattoTurner.html", "Clorinda Matto de Turner — Universitat de València")] },
  { id: "w209-pierola-1895", branch: "peru", y: 1895.5, when: "1895", title: "Piérola takes power and the Aristocratic Republic begins",
    text: "After a revolt begun in 1894, Nicolás de Piérola was elected president in 1895 and made an accommodation with the Civilista oligarchy. A period of civilian rule followed until Leguía's coup in 1919.", imp: 3,
    cites: [W("Aristocratic_Republic_(Peru)", "Aristocratic Republic (Peru)"), B("biography/Nicolas-de-Pierola", "Nicolás de Piérola")] },
  { id: "w209-trilce", branch: "peru", y: 1922.5, when: "1922", title: "César Vallejo publishes Trilce",
    text: "Vallejo's second book of poems, written in large part in 1919 and during a 1920 imprisonment, broke radically with tradition. It is regarded as a masterpiece of the Spanish-language avant-garde.", imp: 2,
    cites: [W("Trilce", "Trilce"), B("biography/Cesar-Vallejo", "César Vallejo")] },

  // ---------- Venezuela ----------
  { id: "w209-venezuela-1830", branch: "venezuela", y: 1830.72, when: "September 22, 1830", title: "Valencia congress adopts Venezuela's first constitution",
    text: "After José Antonio Páez declared Venezuela separate from Gran Colombia, the Constituent Congress of Valencia approved a constitution that Páez promulgated two days later. Páez dominated the country until 1847.", imp: 2, link: "gran-colombia",
    cites: [W("Constitution_of_Venezuela_(1830)", "Constitution of Venezuela (1830)"), W("Jos%C3%A9_Antonio_P%C3%A1ez", "José Antonio Páez"), B("biography/Jose-Antonio-Paez", "José Antonio Páez")] },
  { id: "w209-federal-war", branch: "venezuela", y: 1859.14, end: 1863.31, when: "February 20, 1859 – April 1863", title: "The Federal War",
    text: "Liberal federalists rose against the Conservative government, and the war ended with the Treaty of Coche, which sealed their victory.", imp: 2,
    cites: [W("Federal_War", "Federal War"), X("https://encyclopedia.com/humanities/encyclopedias-almanacs-transcripts-and-maps/federal-war-venezuela-1859-1863", "Federal War (Venezuela, 1859–1863) — Encyclopedia.com")] },
  { id: "w209-carreno-new-york", branch: "venezuela", y: 1862.8, when: "1862", title: "Child prodigy Teresa Carreño settles in New York",
    text: "Born in Caracas in 1853, Carreño moved with her family to New York in 1862 and began her concert career, studying with Louis Moreau Gottschalk. She became the celebrated pianist called the “Valkyrie of the piano.”", imp: 3,
    cites: [W("Teresa_Carre%C3%B1o", "Teresa Carreño"), B("biography/Teresa-Carreno", "Teresa Carreño")] },
  { id: "w209-guzman-blanco", branch: "venezuela", y: 1870.3, end: 1888, when: "1870–1888", title: "Guzmán Blanco's liberal “Regeneration”",
    text: "Antonio Guzmán Blanco seized power in 1870 and, with a few interruptions, dominated Venezuela until the late 1880s. His administration expanded primary schooling, with enrollment growing roughly tenfold in 15 years.", imp: 2,
    cites: [W("Antonio_Guzm%C3%A1n_Blanco", "Antonio Guzmán Blanco"), B("biography/Antonio-Guzman-Blanco", "Antonio Guzmán Blanco")] },
  { id: "w209-teatro-municipal", branch: "venezuela", y: 1881.01, when: "1881", title: "Teatro Municipal de Caracas opens",
    text: "President Guzmán Blanco inaugurated the Caracas opera house in 1881. It is one of the oldest opera houses in South America.", imp: 3,
    cites: [W("Teatro_Municipal_of_Caracas", "Teatro Municipal of Caracas"), X("https://guiaccs.com/en/obras/municipal-theater/", "Municipal Theater — Guía Caracas")] },
  { id: "w209-venezuela-crisis-1895", branch: "venezuela", y: 1895.5, when: "1895", title: "Venezuela boundary crisis draws in the United States",
    text: "A long dispute with Britain over Essequibo became a diplomatic crisis when the US invoked the Monroe Doctrine. Britain accepted American pressure to arbitrate the whole disputed territory.", imp: 2, link: "uk",
    cites: [W("Venezuelan_crisis_of_1895", "Venezuelan crisis of 1895"), { t: "The Venezuela Boundary Dispute, 1895–99 — Office of the Historian", u: "https://history.state.gov/milestones/1866-1898/venezuela", k: "reference" }, B("place/Essequibo", "Essequibo")] },
  { id: "w209-blockade-1902", branch: "venezuela", y: 1902.93, end: 1903.12, when: "December 1902 – February 1903", title: "Britain, Germany and Italy blockade Venezuela",
    text: "When President Cipriano Castro refused to pay foreign debts and damages, three powers blockaded the coast. Castro agreed to arbitrate, and the blockade ended in February 1903.", imp: 2, link: "uk",
    cites: [W("Venezuelan_crisis_of_1902%E2%80%931903", "Venezuelan crisis of 1902–1903"), B("biography/Cipriano-Castro", "Cipriano Castro")] },

  // ---------- United States ----------
  { id: "w209-compromise-1850", branch: "usa", y: 1850.7, when: "September 1850", title: "Compromise of 1850 and the Fugitive Slave Act",
    text: "A package of five bills passed in September 1850 temporarily defused tensions between slave and free states, and included the stricter Fugitive Slave Act enacted on September 18.", imp: 2,
    cites: [W("Compromise_of_1850", "Compromise of 1850"), B("topic/Compromise-of-1850", "Compromise of 1850")] },
  { id: "w209-moby-dick", branch: "usa", y: 1851.87, when: "October–November 1851", title: "Herman Melville publishes Moby-Dick",
    text: "Published in London in October 1851 as The Whale and in New York in November, Melville's novel of Captain Ahab's pursuit of the white whale received mixed reviews at first and later became a classic of American literature.", imp: 2,
    cites: [W("Moby-Dick", "Moby-Dick"), B("topic/Moby-Dick-novel", "Moby Dick")] },
  { id: "w209-uncle-toms-cabin", branch: "usa", y: 1852.22, when: "March 20, 1852", title: "Uncle Tom's Cabin published in book form",
    text: "Harriet Beecher Stowe's antislavery novel sold 3,000 copies on its first day and soon exhausted its print run, bringing the cruelty of slavery to a vast readership.", imp: 2,
    cites: [W("Uncle_Tom%27s_Cabin", "Uncle Tom's Cabin"), B("biography/Harriet-Beecher-Stowe", "Harriet Beecher Stowe")] },
  { id: "w209-leaves-of-grass", branch: "usa", y: 1855.5, when: "July 4, 1855", title: "Whitman self-publishes Leaves of Grass",
    text: "Walt Whitman published the first edition of his free-verse collection at his own expense, then revised and expanded it for the rest of his life. It is considered a symbol of American democracy.", imp: 2,
    cites: [W("Leaves_of_Grass", "Leaves of Grass"), B("biography/Walt-Whitman", "Walt Whitman")] },
  { id: "w209-compromise-1877", branch: "usa", y: 1877.17, when: "February–March 1877", title: "Compromise of 1877 ends Reconstruction",
    text: "A deal settling the disputed 1876 election gave Rutherford B. Hayes the presidency. The withdrawal of federal troops from the South that followed is conventionally taken as the end of Reconstruction.", imp: 2,
    cites: [W("Compromise_of_1877", "Compromise of 1877"), W("Reconstruction_era", "Reconstruction era"), X("https://www.history.com/articles/compromise-of-1877", "Compromise of 1877 — History.com"), B("biography/Rutherford-B-Hayes", "Rutherford B. Hayes")] },
  { id: "w209-chinese-exclusion", branch: "usa", y: 1882.34, when: "May 6, 1882", title: "Chinese Exclusion Act",
    text: "President Chester A. Arthur signed the first broad US immigration restriction, suspending Chinese laborers' immigration for ten years and requiring certificates for Chinese entering or leaving.", imp: 2,
    cites: [W("Chinese_Exclusion_Act", "Chinese Exclusion Act"), { t: "Chinese Immigration and the Chinese Exclusion Acts — Office of the Historian", u: "https://history.state.gov/milestones/1866-1898/chinese-immigration", k: "reference" }, B("event/Chinese-Exclusion-Act", "Chinese Exclusion Act")] },
  { id: "w209-huck-finn", branch: "usa", y: 1885.13, when: "February 18, 1885", title: "Twain's Adventures of Huckleberry Finn appears in the US",
    text: "Mark Twain's novel, first published in Britain in December 1884, came out in the United States in February 1885. Its voice and its portrait of the Mississippi shaped American fiction.", imp: 2,
    cites: [W("Adventures_of_Huckleberry_Finn", "Adventures of Huckleberry Finn"), B("biography/Mark-Twain", "Mark Twain")] },

  // ---------- Indigenous peoples of the Americas ----------
  { id: "w209-carlisle", branch: "first-americans", y: 1879.8, when: "October 1879", title: "Carlisle Indian Industrial School opens",
    text: "Lieutenant Richard Henry Pratt founded the flagship Indian boarding school in Pennsylvania to assimilate Native children. It operated from 1879 to 1918, and 82 students came in its first October.", imp: 2, link: "usa",
    cites: [W("Carlisle_Indian_Industrial_School", "Carlisle Indian Industrial School"), B("topic/Carlisle-Indian-Industrial-School", "Carlisle Indian Industrial School")] },
  { id: "w209-dawes-act", branch: "first-americans", y: 1887.11, when: "February 8, 1887", title: "Dawes Act breaks up tribal lands",
    text: "President Grover Cleveland signed the Dawes Allotment Act, which divided tribally held reservations into individual allotments.", imp: 2, link: "usa",
    cites: [W("Dawes_Act", "Dawes Act"), B("event/Dawes-General-Allotment-Act", "Dawes General Allotment Act")] },
  { id: "w209-wounded-knee-1890", branch: "first-americans", y: 1890.99, when: "December 29, 1890", title: "Wounded Knee Massacre",
    text: "US soldiers disarming Lakota at Wounded Knee Creek on the Pine Ridge Reservation opened fire, killing many. The Ghost Dance movement, which had spread to the Sioux and alarmed US officials, preceded the killings.", imp: 1, link: "usa",
    cites: [W("Wounded_Knee_Massacre", "Wounded Knee Massacre"), B("event/Wounded-Knee-Massacre", "Wounded Knee Massacre"), B("event/Ghost-Dance", "Ghost Dance")] },
  { id: "w209-old-indian-legends", branch: "first-americans", y: 1901.5, when: "1901", title: "Zitkala-Ša publishes Old Indian Legends",
    text: "The Yankton Dakota writer and activist published a collection of Dakota stories. She also wrote autobiographical essays for The Atlantic Monthly and Harper's Monthly.", imp: 3,
    cites: [W("Zitkala-%C5%A0a", "Zitkala-Ša"), B("biography/Zitkala-Sa", "Zitkala-Sa")] },
  { id: "w209-citizenship-act", branch: "first-americans", y: 1924.42, when: "June 2, 1924", title: "Indian Citizenship Act",
    text: "President Calvin Coolidge signed the act declaring Native Americans born in the United States to be citizens.", imp: 2, link: "usa",
    cites: [W("Indian_Citizenship_Act", "Indian Citizenship Act"), B("event/Indian-Citizenship-Act", "Indian Citizenship Act")] },

  // ---------- Gran Colombia, New Granada, New Spain, Río de la Plata ----------
  { id: "w209-cucuta", branch: "gran-colombia", y: 1821.35, end: 1821.79, when: "May 6 – October 14, 1821", title: "Congress of Cúcuta organizes Gran Colombia",
    text: "The constituent assembly adopted a constitution on August 30 and elected Simón Bolívar president and Francisco de Paula Santander vice president of the new republic.", imp: 2,
    cites: [W("Congress_of_C%C3%BAcuta", "Congress of Cúcuta"), B("place/Gran-Colombia", "Gran Colombia")] },
  { id: "w209-bogota-1810", branch: "new-granada", y: 1810.55, when: "July 20, 1810", title: "Bogotá creates a junta and rebels against Spain",
    text: "A governing junta formed in Santa Fe de Bogotá, traditionally taken as the start of the Colombian War of Independence after Napoleon's seizure of the Spanish crown.", imp: 2,
    cites: [W("Colombian_War_of_Independence", "Colombian War of Independence"), B("place/Bogota", "Bogotá")] },
  { id: "w209-reconquista-1816", branch: "new-granada", y: 1816.35, when: "May 6, 1816", title: "Morillo retakes Bogotá",
    text: "General Pablo Morillo completed the Spanish reconquest of New Granada by taking Bogotá. Patriots including Camilo Torres and Francisco José de Caldas were executed in 1816.", imp: 2,
    cites: [W("Spanish_reconquest_of_New_Granada", "Spanish reconquest of New Granada"), W("Camilo_Torres_Tenorio", "Camilo Torres Tenorio"), X("https://www.semana.com/gente/articulo/pablo-morillo-el-espanol-que-fusilo--a-decenas-de-heroes-de-la-independencia/502520", "Pablo Morillo, el español que fusiló a decenas de héroes de la Independencia — Semana")] },
  { id: "w209-humboldt-new-spain", branch: "new-spain", y: 1803.2, end: 1804.2, when: "1803–1804", title: "Humboldt explores New Spain",
    text: "Alexander von Humboldt and Aimé Bonpland reached Mexico from Guayaquil in 1803 and spent the last year of their expedition there. His Political Essay on the Kingdom of New Spain described its geography, mines and society.", imp: 2,
    cites: [W("Alexander_von_Humboldt", "Alexander von Humboldt"), B("biography/Alexander-von-Humboldt", "Alexander von Humboldt")] },
  { id: "w209-consolidacion-1804", branch: "new-spain", y: 1804.5, when: "1804", title: "Act of Consolidation demands that borrowers repay loans",
    text: "The Spanish crown's 1804 Act of Consolidation called for borrowers to repay loan principal at once rather than over decades, hitting Mexican landowners and the Church and fueling discontent before independence.", imp: 3,
    cites: [W("Mexican_War_of_Independence", "Mexican War of Independence"), X("https://cambridge.org/core/journals/journal-of-latin-american-studies/article/appropriation-of-mexican-church-wealth-by-the-spanish-bourbon-governmentthe-consolidacion-de-vales-reales-18051809/F818A1D025511DB8AF003113F0D9AE5B", "The Appropriation of Mexican Church Wealth: the Consolidación de Vales Reales, 1805–1809 — Journal of Latin American Studies")] },
  { id: "w209-british-invasions", branch: "rio-de-la-plata", y: 1806.45, end: 1807.55, when: "1806–1807", title: "British invasions of the River Plate",
    text: "During the Napoleonic Wars, British forces took Buenos Aires in 1806 and held it for about six weeks before a local militia forced their surrender. A larger force was defeated there in 1807.", imp: 2, link: "uk",
    cites: [W("British_invasions_of_the_River_Plate", "British invasions of the River Plate"), X("https://www.encyclopedia.com/humanities/encyclopedias-almanacs-transcripts-and-maps/british-invasions-rio-de-la-plata", "British Invasions, Río de la Plata — Encyclopedia.com")] },
] });

G("dessalines-empire", 19.76, -72.2, 40, "Cap-Haïtien, Haiti", "Cap-Haïtien");
G("citadelle", 19.58, -72.24, 40, "Milot, Haiti", "Milot,_Haiti");
G("indemnity-1825", 18.54, -72.34, 40, "Port-au-Prince, Haiti", "Port-au-Prince");
G("dominican-secession", 18.47, -69.9, 40, "Santo Domingo, Dominican Republic", "Santo_Domingo");
G("soulouque-empire", 18.54, -72.34, 40, "Port-au-Prince, Haiti", "Port-au-Prince");
G("choucoune", 18.94, -72.69, 200, "Haiti", "Haiti", "region");
G("firmin-equality", 48.86, 2.35, 40, "Paris, France", "Paris");
G("us-invasion-1915", 18.54, -72.34, 40, "Port-au-Prince, Haiti", "Port-au-Prince");
G("constitution-1824", 19.43, -99.13, 40, "Mexico City", "Mexico_City");
G("texas-revolution", 31, -99, 500, "Texas", "Texas", "region");
G("guadalupe-hidalgo", 19.48, -99.12, 40, "Guadalupe Hidalgo, Mexico City", "Basilica_of_Our_Lady_of_Guadalupe");
G("constitution-1857", 19.43, -99.13, 40, "Mexico City", "Mexico_City");
G("tecoac", 19.31, -97.92, 40, "Huamantla, Tlaxcala", "Huamantla");
G("central-railway", 31.69, -106.42, 60, "Ciudad Juárez, Mexico", "Ciudad_Ju%C3%A1rez");
G("cielito-lindo", 23.6, -102.5, 1000, "Mexico", "Mexico", "region");
G("first-films", 19.43, -99.13, 40, "Mexico City", "Mexico_City");
G("confederation", -18.01, -70.25, 60, "Tacna, Peru", "Tacna");
G("guano-boom", -13.63, -76.4, 60, "Chincha Islands, Peru", "Chincha_Islands");
G("castilla-abolition", -12.05, -77.04, 40, "Lima, Peru", "Lima");
G("callao-1866", -12.05, -77.15, 40, "Callao, Peru", "Callao");
G("palma-tradiciones", -12.05, -77.04, 40, "Lima, Peru", "Lima");
G("ancon", -11.77, -77.17, 40, "Ancón, Lima, Peru", "Anc%C3%B3n,_Peru");
G("aves-sin-nido", -12.05, -77.04, 40, "Lima, Peru", "Lima");
G("pierola-1895", -12.05, -77.04, 40, "Lima, Peru", "Lima");
G("trilce", -12.05, -77.04, 40, "Lima, Peru", "Lima");
G("venezuela-1830", 10.18, -68, 40, "Valencia, Venezuela", "Valencia,_Venezuela");
G("federal-war", 7, -66, 700, "Venezuela", "Venezuela", "region");
G("carreno-new-york", 40.71, -74.01, 40, "New York City", "New_York_City");
G("guzman-blanco", 10.5, -66.91, 40, "Caracas, Venezuela", "Caracas");
G("teatro-municipal", 10.5, -66.91, 40, "Caracas, Venezuela", "Caracas");
G("venezuela-crisis-1895", 6, -59, 300, "Guayana Esequiba", "Guayana_Esequiba", "region");
G("blockade-1902", 10.6, -66.93, 60, "La Guaira, Venezuela", "La_Guaira");
G("compromise-1850", 38.9, -77.04, 40, "Washington, D.C.", "Washington,_D.C.");
G("moby-dick", 40.71, -74.01, 40, "New York City", "New_York_City");
G("uncle-toms-cabin", 42.36, -71.06, 40, "Boston, Massachusetts", "Boston");
G("leaves-of-grass", 40.65, -73.95, 40, "Brooklyn, New York", "Brooklyn");
G("compromise-1877", 38.9, -77.04, 40, "Washington, D.C.", "Washington,_D.C.");
G("chinese-exclusion", 38.9, -77.04, 40, "Washington, D.C.", "Washington,_D.C.");
G("huck-finn", 41.76, -72.68, 40, "Hartford, Connecticut", "Hartford,_Connecticut");
G("carlisle", 40.2, -77.19, 40, "Carlisle, Pennsylvania", "Carlisle,_Pennsylvania");
G("dawes-act", 38.9, -77.04, 40, "Washington, D.C.", "Washington,_D.C.");
G("wounded-knee-1890", 43.14, -102.36, 50, "Wounded Knee, South Dakota", "Wounded_Knee,_South_Dakota");
G("old-indian-legends", 42.36, -71.06, 40, "Boston, Massachusetts", "Boston");
G("citizenship-act", 38.9, -77.04, 40, "Washington, D.C.", "Washington,_D.C.");
G("cucuta", 7.89, -72.5, 60, "Cúcuta, Colombia", "C%C3%BAcuta");
G("bogota-1810", 4.71, -74.07, 40, "Bogotá, Colombia", "Bogot%C3%A1");
G("reconquista-1816", 4.71, -74.07, 40, "Bogotá, Colombia", "Bogot%C3%A1");
G("humboldt-new-spain", 19.43, -99.13, 40, "Mexico City", "Mexico_City");
G("consolidacion-1804", 19.43, -99.13, 40, "Mexico City", "Mexico_City");
G("british-invasions", -34.6, -58.38, 60, "Buenos Aires, Argentina", "Buenos_Aires");
