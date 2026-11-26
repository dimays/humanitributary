// Fill-in W2-03: Iran, Ottoman Empire, Austria-Hungary, Belgium, France, German Confederation, 1800–1925. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const G = (id, lat, lon, r, label, slug, scope = "place") => TL.geo("w203-" + id, { scope, lat, lon, r, label, src: `https://en.wikipedia.org/wiki/${slug}` });

TL.add({ events: [
  // ---------- Iran ----------
  { id: "w203-gulistan", branch: "iran", y: 1804.04, end: 1813.78, when: "1804–1813", title: "Russo-Persian War ends with the Treaty of Gulistan",
    text: "The first Russo-Persian War began with Russia's attack on Ganja in January 1804 and ended with the Treaty of Gulistan in October 1813, which Iranian leaders treated more as a truce than a settlement.", imp: 2,
    cites: [W("Russo-Persian_War_(1804–1813)", "Russo-Persian War (1804–1813)"), W("Treaty_of_Gulistan", "Treaty of Gulistan"), { t: "Golestān Treaty — Encyclopaedia Iranica", u: "https://www.iranicaonline.org/articles/golestan-treaty" }] },
  { id: "w203-bab-declares", branch: "iran", y: 1844.4, when: "May 1844", title: "The Báb begins Bábism in Shiraz",
    text: "A young Shiraz merchant, Mírzá ʿAlí Muḥammad, claimed to be the bāb, or “gateway,” and began the Bábí movement, a faith that drew fierce clerical and state opposition.", imp: 2,
    cites: [W("Báb", "Báb"), B("topic/Babism", "Bābism")] },
  { id: "w203-bab-executed", branch: "iran", y: 1850.52, when: "July 9, 1850", title: "The Báb executed by firing squad in Tabriz",
    text: "Iranian authorities executed the Báb by firing squad in Tabriz; thousands of his followers were also killed in the persecutions that followed, which pushed the Bábí movement underground.", imp: 3,
    cites: [W("Báb", "Báb"), W("Bábism", "Bábism"), B("topic/Babism", "Bābism")] },
  { id: "w203-persian-famine", branch: "iran", y: 1870, end: 1872, when: "1870–1872", title: "Great Persian famine",
    text: "Drought and poor administration brought famine to Iran; estimates of the dead range very widely, from about 0.2 million to 6 million.", imp: 2,
    cites: [W("Persian_famine_of_1870–1872", "Persian famine of 1870–1872"), { t: "Famines — Encyclopaedia Iranica", u: "https://www.iranicaonline.org/articles/famines" }] },
  { id: "w203-tobacco-protest", branch: "iran", y: 1891, end: 1892.1, when: "1891–1892", title: "Tobacco Protest cancels a foreign monopoly",
    text: "After Naser al-Din Shah granted a British major a tobacco monopoly in March 1890, mass protests and a December 1891 fatwa by Mirza Shirazi against smoking forced its cancellation in January 1892.", imp: 2,
    cites: [W("Tobacco_Protest", "Tobacco Protest"), B("biography/Naser-al-Din-Shah", "Nāṣer al-Dīn Shāh"), { t: "Tobacco Protest, Iran — Encyclopedia.com", u: "https://encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/tobacco-protest-iran" }] },
  { id: "w203-naser-assassinated", branch: "iran", y: 1896.33, when: "May 1, 1896", title: "Naser al-Din Shah assassinated in Tehran",
    text: "The shah, ruling since 1848, was shot dead in Tehran by a follower of the pan-Islamic activist Jamal al-Din al-Afghani, ending a nearly 48-year reign.", imp: 2,
    cites: [W("Naser_al-Din_Shah_Qajar", "Naser al-Din Shah Qajar"), B("biography/Naser-al-Din-Shah", "Nāṣer al-Dīn Shāh")] },
  { id: "w203-oil-discovered", branch: "iran", y: 1908.4, when: "May 26, 1908", title: "Oil struck at Masjed Soleyman",
    text: "Prospectors for William Knox D'Arcy's concession struck oil in commercial quantities in southwestern Iran, the first oil field in the Middle East; the Anglo-Persian Oil Company was formed the next year.", imp: 2,
    cites: [W("Anglo-Persian_Oil_Company", "Anglo-Persian Oil Company"), W("Masjed_Soleyman", "Masjed Soleyman"), { t: "The first oil field in the Middle East — AAPG Explorer", u: "https://www.aapg.org/news-and-media/details/explorer/articleid/47495/the-first-oil-field-in-the-middle-east" }] },
  { id: "w203-shuster-ultimatum", branch: "iran", y: 1911.9, when: "December 1911", title: "Russian ultimatum ends Shuster's mission and the Majlis",
    text: "Russia demanded the dismissal of American treasurer-general Morgan Shuster and occupied Tabriz; by December 1911 Shuster was expelled and the second Majlis suspended, ending the constitutional experiment's first phase.", imp: 2, link: "russian-empire",
    cites: [W("Persian_Constitutional_Revolution", "Persian Constitutional Revolution"), B("biography/William-Morgan-Shuster", "William Morgan Shuster"), W("Morgan_Shuster", "Morgan Shuster")] },

  // ---------- Ottoman Empire ----------
  { id: "w203-selim-deposed", branch: "ottoman", y: 1807.5, when: "1807", title: "Selim III overthrown; the “New Order” collapses",
    text: "A mutiny of auxiliary troops in 1807 forced Sultan Selim III to abolish his Nizam-ı Cedid reforms and led to his imprisonment; he was deposed that May and killed in 1808.", imp: 2,
    cites: [B("biography/Selim-III", "Selim III"), W("Selim_III", "Selim III")] },
  { id: "w203-auspicious-incident", branch: "ottoman", y: 1826.45, when: "June 15, 1826", title: "Mahmud II destroys the Janissary corps",
    text: "Sultan Mahmud II forcibly disbanded the centuries-old Janissary corps after it revolted against his new Western-style troops, clearing the way for a modernized Ottoman army.", imp: 2,
    cites: [B("topic/Auspicious-Incident", "Auspicious Incident"), W("Auspicious_Incident", "Auspicious Incident")] },
  { id: "w203-dolmabahce", branch: "ottoman", y: 1843, end: 1856, when: "1843–1856", title: "Dolmabahçe Palace built on the Bosporus",
    text: "Sultan Abdülmecid I built Istanbul's first European-style palace on the Bosporus shore between 1843 and 1856; it housed six sultans until the caliphate was abolished in 1924.", imp: 3,
    cites: [W("Dolmabahçe_Palace", "Dolmabahçe Palace"), B("topic/Dolmabahce-Palace", "Dolmabahçe Palace")] },
  { id: "w203-hatt-i-humayun", branch: "ottoman", y: 1856.13, when: "1856", title: "Imperial Edict of 1856 extends the Tanzimat",
    text: "The Hatt-ı Hümayun, issued by Sultan Abdülmecid I in 1856, followed the 1839 Gülhane edict and pushed the Tanzimat toward equality for the empire's non-Muslim subjects.", imp: 2,
    cites: [B("biography/Abdulmecid-I", "Abdülmecid I")] },
  { id: "w203-constitution-1876", branch: "ottoman", y: 1876.98, when: "December 23, 1876", title: "First Ottoman constitution promulgated",
    text: "Grand Vizier Midhat Pasha's constitution created the empire's first parliament; Abdülhamid II suspended it in 1878, after which it was not restored until the Young Turk Revolution of 1908.", imp: 2,
    cites: [W("Ottoman_constitution_of_1876", "Constitution of the Ottoman Empire"), B("biography/Midhat-Pasha", "Midhat Pasha"), B("biography/Abdulhamid-II", "Abdülhamid II")] },
  { id: "w203-sirkeci-station", branch: "ottoman", y: 1890.84, when: "November 3, 1890", title: "Sirkeci Terminal opens as the Orient Express terminus",
    text: "The new Sirkeci station building in Istanbul opened as the eastern terminus of the Orient-Express, the Paris–Istanbul train that Belgian businessman Georges Nagelmackers launched in 1883.", imp: 3,
    cites: [W("Sirkeci_Terminal", "Sirkeci Terminal"), B("topic/Orient-Express", "Orient-Express")] },
  { id: "w203-archaeology-museum", branch: "ottoman", y: 1891.5, when: "1891", title: "Osman Hamdi Bey opens the Istanbul Archaeological Museum",
    text: "Painter-archaeologist Osman Hamdi Bey, the museum's founder and director from 1881, opened its new building in 1891, giving the empire a major museum and a stake in protecting antiquities.", imp: 2,
    cites: [W("Istanbul_Archaeology_Museums", "Istanbul Archaeology Museums"), B("biography/Osman-Hamdi-Bey", "Osman Hamdi Bey")] },
  { id: "w203-hamidian-massacres", branch: "ottoman", y: 1894, end: 1896.9, when: "1894–1896", title: "Hamidian massacres of Armenians",
    text: "Ottoman forces and Kurdish irregulars carried out a series of massacres of Armenians across the empire, mostly between 1894 and 1896, under Sultan Abdülhamid II.", imp: 2,
    cites: [B("event/Hamidian-massacres", "Hamidian massacres"), W("Hamidian_massacres", "Hamidian massacres")] },

  // ---------- Austrian Empire & Austria-Hungary ----------
  { id: "w203-austerlitz", branch: "austria-hungary", y: 1805.92, when: "December 2, 1805", title: "Austerlitz: Napoleon defeats Austria and Russia",
    text: "Napoleon's victory in Moravia over the Austrian and Russian armies forced Austria to sign the Treaty of Pressburg; the Holy Roman Empire was dissolved the next year.", imp: 2, link: "france",
    cites: [B("event/Battle-of-Austerlitz", "Battle of Austerlitz"), W("Battle_of_Austerlitz", "Battle of Austerlitz")] },
  { id: "w203-beethoven-ninth", branch: "austria-hungary", y: 1824.35, when: "May 7, 1824", title: "Beethoven's Ninth Symphony premieres in Vienna",
    text: "The first performance of Beethoven's Symphony No. 9, the first symphony by a major composer to include vocal parts, took place in Vienna.", imp: 2,
    cites: [W("Symphony_No._9_(Beethoven)", "Symphony No. 9 (Beethoven)"), B("biography/Ludwig-van-Beethoven", "Ludwig van Beethoven")] },
  { id: "w203-nordbahn", branch: "austria-hungary", y: 1837.5, when: "1837", title: "Nordbahn opens Austria's first steam railway",
    text: "The first stretch of the Kaiser Ferdinands-Nordbahn, from Floridsdorf near Vienna to Deutsch-Wagram, opened in 1837 as Austria's first steam railway.", imp: 3,
    cites: [W("Kaiser_Ferdinands-Nordbahn", "Kaiser Ferdinands-Nordbahn"), { t: "Nordbahn — Austria-Forum (AEIOU)", u: "https://austria-forum.org/af/AEIOU/Nordbahn/Nordbahn_english" }] },
  { id: "w203-metternich-falls", branch: "austria-hungary", y: 1848.2, when: "March 13, 1848", title: "Metternich forced out in the Vienna revolution",
    text: "Vienna students of the Academic Legion helped force the resignation of State Chancellor Metternich, in office since 1821, on March 13; he fled to London.", imp: 2,
    cites: [W("Revolutions_of_1848_in_the_Austrian_Empire", "Revolutions of 1848 in the Austrian Empire"), W("Klemens_von_Metternich", "Klemens von Metternich"), B("biography/Klemens-von-Metternich", "Klemens von Metternich")] },
  { id: "w203-ringstrasse", branch: "austria-hungary", y: 1857.97, when: "December 20, 1857", title: "Franz Joseph orders Vienna's walls replaced by the Ringstrasse",
    text: "Emperor Franz Joseph's decree to demolish Vienna's city walls and moats opened the way to the Ringstrasse, a circular boulevard of grand public buildings, monuments and parks.", imp: 2,
    cites: [W("Vienna_Ring_Road", "Vienna Ring Road"), B("place/Ringstrasse", "Ringstrasse"), { t: "The Ringstrasse era, 1857–1914 — Habsburger.net", u: "https://www.habsburger.net/en/events/ringstrasse-era-1857-1914" }] },
  { id: "w203-ausgleich", branch: "austria-hungary", y: 1867.1, when: "February 8, 1867", title: "The Compromise creates Austria-Hungary",
    text: "The Compromise of 1867 between Austria and Hungary turned the Habsburg empire into the dual monarchy of Austria-Hungary, with separate parliaments and a shared monarch.", imp: 1,
    cites: [B("place/Austria-Hungary", "Austria-Hungary"), W("Austro-Hungarian_Compromise_of_1867", "Austro-Hungarian Compromise of 1867")] },
  { id: "w203-vienna-worlds-fair", branch: "austria-hungary", y: 1873.33, end: 1873.83, when: "May – November 1873", title: "Vienna hosts the 1873 World's Fair",
    text: "The Vienna World's Fair, held in the Prater in 1873, aimed to present the monarchy's power and progress; its Ottoman pavilion was more prominent than at the 1867 Paris fair.", imp: 3,
    cites: [W("1873_Vienna_World's_Fair", "1873 Vienna World's Fair"), { t: "World Exhibition Palace — Habsburger.net", u: "https://www.habsburger.net/en/chapter/exhibit-world-vienna-world-exhibition-venue" }, { t: "Vienna International Exposition of 1873 — National Diet Library, Japan", u: "https://ndl.go.jp/exposition/e/s1/1873.html" }] },
  { id: "w203-vienna-secession", branch: "austria-hungary", y: 1897.25, when: "April 3, 1897", title: "Klimt and colleagues found the Vienna Secession",
    text: "Gustav Klimt, Josef Hoffmann, Joseph Maria Olbrich and Koloman Moser founded the Vienna Secession, an artists' group that broke from the conservative art establishment; Olbrich designed its exhibition hall.", imp: 2,
    cites: [W("Vienna_Secession", "Vienna Secession"), W("Joseph_Maria_Olbrich", "Joseph Maria Olbrich"), B("biography/Gustav-Klimt", "Gustav Klimt")] },
  { id: "w203-bosnia-annexed", branch: "austria-hungary", y: 1908.76, when: "October 1908", title: "Austria-Hungary annexes Bosnia and Herzegovina",
    text: "Vienna announced the full annexation of Bosnia, timed with Bulgaria's declaration of independence from the Ottomans; the move angered the Great Powers, Serbia and Montenegro.", imp: 2, link: "ottoman",
    cites: [W("Bosnian_crisis", "Bosnian crisis"), B("event/Bosnian-crisis-of-1908", "Bosnian crisis of 1908")] },
  { id: "w203-klimt-kiss", branch: "austria-hungary", y: 1908.5, when: "1908", title: "Klimt's The Kiss shown in Vienna",
    text: "Gustav Klimt's The Kiss, from his “Golden Period,” was exhibited in 1908 as “Liebespaar” (The Lovers) at the Kunstschau, an art show tied to the 60th anniversary of Franz Joseph's reign.", imp: 2,
    cites: [W("The_Kiss_(Klimt)", "The Kiss (Klimt)"), B("biography/Gustav-Klimt", "Gustav Klimt")] },

  // ---------- Belgium ----------
  { id: "w203-sax-saxophone", branch: "belgium", y: 1846.49, when: "June 28, 1846", title: "Belgian Adolphe Sax patents the saxophone",
    text: "Adolphe Sax of Dinant, who invented the saxophone in the early 1840s, patented the instrument for use in orchestras and military bands.", imp: 2,
    cites: [W("Adolphe_Sax", "Adolphe Sax"), B("biography/Antoine-Joseph-Sax", "Adolphe Sax")] },
  { id: "w203-gramme-dynamo", branch: "belgium", y: 1871.5, when: "1871", title: "Zénobe Gramme's dynamo goes into manufacture",
    text: "Belgian inventor Zénobe Gramme showed a continuous-current dynamo to the French Academy of Sciences that produced much higher voltages than earlier machines, and began making it that year.", imp: 3,
    cites: [B("biography/Zenobe-Theophile-Gramme", "Zénobe-Théophile Gramme"), W("Zénobe_Gramme", "Zénobe Gramme")] },
  { id: "w203-congo-free-state", branch: "belgium", y: 1885.58, when: "August 1, 1885", title: "Leopold II's Congo Free State is named",
    text: "After winning recognition of his claims at the Berlin Conference, King Leopold II had his possession renamed the Congo Free State, his personal holding, where forced labor and atrocities later killed millions.", imp: 1, link: "congo-free-state",
    cites: [W("Congo_Free_State", "Congo Free State"), B("biography/Leopold-II-king-of-Belgium", "Leopold II")] },
  { id: "w203-ensor-christ-brussels", branch: "belgium", y: 1888.5, when: "1888", title: "Ensor paints Christ's Entry into Brussels in 1889",
    text: "James Ensor of Ostend painted his huge, carnival-crowded canvas of Christ entering Brussels, a forerunner of Expressionism that was rejected by the Belgian art circle Les XX.", imp: 2,
    cites: [W("Christ's_Entry_into_Brussels_in_1889", "Christ's Entry into Brussels in 1889"), W("James_Ensor", "James Ensor"), { t: "Explore Christ’s Entry into Brussels in 1889 — Getty Education", u: "https://www.getty.edu/education/k-12-learning/explore-christs-entry-into-brussels-in-1889" }] },
  { id: "w203-horta-tassel", branch: "belgium", y: 1892, end: 1893.9, when: "1892–1893", title: "Horta builds Hôtel Tassel, a first Art Nouveau house",
    text: "Victor Horta's house for Émile Tassel in Brussels was among the first Continental examples of Art Nouveau and had a decisive influence on architects such as Hector Guimard.", imp: 2,
    cites: [W("Hôtel_Tassel", "Hôtel Tassel"), B("topic/Hotel-Tassel", "Hôtel Tassel")] },
  { id: "w203-belgium-annexes-congo", branch: "belgium", y: 1908.8, when: "October 18, 1908", title: "Belgium votes to take over the Congo from Leopold II",
    text: "The Belgian parliament approved the Colonial Charter on October 18, 1908; on November 15 Belgium assumed sovereignty over the Congo Free State, creating the Belgian Congo, which it ruled until 1960.", imp: 2, link: "belgian-congo",
    cites: [W("Annexation_of_the_Congo_Free_State", "Annexation of the Congo Free State"), B("topic/Belgian-Congo", "Belgian Congo")] },
  { id: "w203-germany-invades-belgium", branch: "belgium", y: 1914.59, when: "August 4, 1914", title: "Germany invades neutral Belgium",
    text: "German troops crossed into Belgium, a neutral country, beginning the German invasion that brought Britain into World War I and left most of Belgium occupied until late 1918.", imp: 1, link: "german-empire",
    cites: [W("German_invasion_of_Belgium_(1914)", "German invasion of Belgium (1914)"), W("German_occupation_of_Belgium_during_World_War_I", "German occupation of Belgium during World War I"), B("place/Belgium/Belgium-and-World-War-I", "Belgium and World War I")] },

  // ---------- France ----------
  { id: "w203-champollion", branch: "france", y: 1822.74, when: "September 27, 1822", title: "Champollion announces the decipherment of hieroglyphs",
    text: "Jean-François Champollion published his findings in his Lettre à M. Dacier, showing how Egyptian hieroglyphs worked; his decipherment built on work on the Rosetta Stone and founded Egyptology.", imp: 1,
    cites: [W("Jean-François_Champollion", "Jean-François Champollion"), B("biography/Jean-Francois-Champollion", "Jean-François Champollion")] },
  { id: "w203-july-revolution", branch: "france", y: 1830.57, end: 1830.6, when: "July 27–29, 1830", title: "July Revolution topples Charles X",
    text: "Three days of fighting in Paris after restrictive ordinances ended with Charles X's abdication and the proclamation of Louis-Philippe as “king of the French” on August 9.", imp: 2,
    cites: [B("event/July-Revolution", "July Revolution")] },
  { id: "w203-haussmann-paris", branch: "france", y: 1853, end: 1870, when: "1853–1870", title: "Haussmann rebuilds Paris",
    text: "As prefect of the Seine under Napoleon III, Baron Haussmann carried out a vast program of public works that reshaped Paris and set a precedent for 20th-century urban planning.", imp: 2,
    cites: [B("biography/Georges-Eugene-Baron-Haussmann", "Georges-Eugène, Baron Haussmann"), W("Haussmann's_renovation_of_Paris", "Haussmann's renovation of Paris")] },
  { id: "w203-paris-commune", branch: "france", y: 1871.21, end: 1871.41, when: "March 18 – May 28, 1871", title: "Paris Commune",
    text: "After the siege of Paris and the French defeat by Germany, National Guard units took control of Paris on March 18 and the revolutionary Commune governed it until May 28.", imp: 2,
    cites: [W("Paris_Commune", "Paris Commune"), B("event/Commune-of-Paris-1871", "Commune of Paris")] },
  { id: "w203-rabies-vaccine", branch: "france", y: 1885.52, when: "July 6, 1885", title: "Pasteur gives the first rabies vaccine to a human",
    text: "Louis Pasteur and Émile Roux's rabies vaccine was used on nine-year-old Joseph Meister, mauled by a rabid dog, the first person to receive it.", imp: 2,
    cites: [W("Rabies_vaccine", "Rabies vaccine"), W("Louis_Pasteur", "Louis Pasteur"), B("biography/Louis-Pasteur", "Louis Pasteur")] },
  { id: "w203-eiffel-tower", branch: "france", y: 1889.24, when: "March 31, 1889", title: "Eiffel Tower completed for the 1889 Exposition",
    text: "Gustave Eiffel's company finished the iron tower, chosen in a competition for a monument at the International Exposition marking the centenary of the French Revolution.", imp: 2,
    cites: [W("Eiffel_Tower", "Eiffel Tower"), B("topic/Eiffel-Tower-Paris-France", "Eiffel Tower")] },
  { id: "w203-dreyfus-affair", branch: "france", y: 1894.97, end: 1906.5, when: "1894–1906", title: "The Dreyfus Affair",
    text: "Army captain Alfred Dreyfus was convicted of treason for allegedly selling secrets to Germany in 1894; the case grew into a political scandal of the Third Republic that lasted until 1906.", imp: 2,
    cites: [B("event/Dreyfus-Affair", "Dreyfus affair"), W("Dreyfus_affair", "Dreyfus affair")] },
  { id: "w203-radium-discovered", branch: "france", y: 1898.97, when: "December 21, 1898", title: "Marie and Pierre Curie discover radium",
    text: "Working in Paris with pitchblende from Jáchymov, Marie and Pierre Curie found that what remained after removing uranium was still radioactive, and identified the new element radium.", imp: 2,
    cites: [W("Radium", "Radium"), B("biography/Marie-Curie", "Marie Curie")] },
  { id: "w203-church-state-separation", branch: "france", y: 1905.94, when: "December 9, 1905", title: "France separates church and state",
    text: "The law of December 9, 1905, passed by the Chamber of Deputies in July, ended government funding of religious groups and established laïcité as a principle of the French Republic.", imp: 2,
    cites: [W("1905_French_law_on_the_Separation_of_the_Churches_and_the_State", "1905 French law on the Separation of the Churches and State"), { t: "La loi du 9 décembre 1905 — Assemblée nationale", u: "https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/troisieme-republique/la-loi-de-separation-des-eglises-et-de-l-etat" }] },
  { id: "w203-swanns-way", branch: "france", y: 1913.85, when: "November 1913", title: "Proust publishes Swann's Way",
    text: "Marcel Proust's Du côté de chez Swann, first volume of À la recherche du temps perdu, was issued at his own expense in November 1913 after several publishers refused it; Britannica ranks the novel among the supreme achievements of modern fiction.", imp: 2,
    cites: [W("Swann's_Way", "Swann's Way"), B("biography/Marcel-Proust", "Marcel Proust")] },

  // ---------- German Confederation ----------
  { id: "w203-confederation-founded", branch: "german-confederation", y: 1815.45, when: "1815", title: "Congress of Vienna creates the German Confederation",
    text: "The Congress of Vienna set up a Confederation of 39 German states to replace the destroyed Holy Roman Empire, with Austria and Prussia as its leading members.", imp: 2,
    cites: [B("topic/German-Confederation", "German Confederation"), W("German_Confederation", "German Confederation")] },
  { id: "w203-wartburg-festival", branch: "german-confederation", y: 1817.79, when: "October 18, 1817", title: "Students rally for German unity at the Wartburg",
    text: "About 500 Protestant students met at Wartburg castle near Eisenach in a nationalist demonstration, an early expression of the German liberal and national movement.", imp: 2,
    cites: [B("event/Wartburg-Festival", "Wartburg Festival"), W("Wartburg_Festival", "Wartburg Festival")] },
  { id: "w203-st-matthew-passion", branch: "german-confederation", y: 1829.19, when: "March 11, 1829", title: "Mendelssohn revives Bach's St. Matthew Passion in Berlin",
    text: "Felix Mendelssohn conducted the first performance since Bach's death of the St. Matthew Passion, at the Berlin Singakademie, inaugurating the 19th-century Bach revival.", imp: 2,
    cites: [W("Felix_Mendelssohn", "Felix Mendelssohn"), B("biography/Felix-Mendelssohn", "Felix Mendelssohn")] },
  { id: "w203-hambach-festival", branch: "german-confederation", y: 1832.4, end: 1832.41, when: "May 27–30, 1832", title: "Hambach Festival demands liberty and unity",
    text: "A national democratic festival at Hambach Castle gathered liberals; in response the Federal Convention tightened the Carlsbad Decrees on June 28, 1832, suppressing free speech.", imp: 2,
    cites: [W("Hambach_Festival", "Hambach Festival"), B("topic/history-of-Germany/The-age-of-Metternich-and-the-era-of-unification-1815-71", "History of Germany: The age of Metternich and the era of unification, 1815–71")] },
  { id: "w203-deutschlandlied", branch: "german-confederation", y: 1841.65, when: "August 1841", title: "Hoffmann von Fallersleben writes the “Deutschlandlied”",
    text: "The poet and professor August Heinrich Hoffmann von Fallersleben wrote new lyrics for the tune while on the North Sea island of Heligoland; they later became the basis of the German national anthem.", imp: 2,
    cites: [B("topic/Deutschlandlied", "Deutschlandlied"), W("Deutschlandlied", "Deutschlandlied")] },
  { id: "w203-frankfurt-parliament", branch: "german-confederation", y: 1848.4, end: 1849.45, when: "May 1848 – June 1849", title: "Frankfurt Parliament tries to unify Germany",
    text: "The first parliament for all of Germany met in St. Paul's Church in Frankfurt to create a unified German state during the revolutions of 1848, but its work failed.", imp: 1,
    cites: [B("event/Frankfurt-National-Assembly", "Frankfurt National Assembly"), W("Frankfurt_Parliament", "Frankfurt Parliament")] },
  { id: "w203-lohengrin", branch: "german-confederation", y: 1850.65, when: "August 28, 1850", title: "Liszt premieres Wagner's Lohengrin at Weimar",
    text: "Franz Liszt conducted the first production of Wagner's Lohengrin in Weimar on Goethe's birthday while Wagner, a political exile, could not attend.", imp: 2,
    cites: [W("Lohengrin_(opera)", "Lohengrin (opera)"), B("topic/Lohengrin-opera-by-Wagner", "Lohengrin")] },
  { id: "w203-koniggratz", branch: "german-confederation", y: 1866.5, when: "July 3, 1866", title: "Prussia wins at Königgrätz and ends the Confederation",
    text: "Prussia's victory over Austria at Königgrätz in Bohemia decided the Seven Weeks' War; the German Confederation dissolved and Prussia formed the North German Confederation.", imp: 1, link: "austria-hungary",
    cites: [B("event/Battle-of-Koniggratz", "Battle of Königgrätz"), B("topic/German-Confederation", "German Confederation")] },
] });

G("gulistan", 40.51, 46.46, 150, "Gulistan, Goranboy, Azerbaijan", "Treaty_of_Gulistan");
G("bab-declares", 29.62, 52.54, 60, "Shiraz, Iran", "Shiraz");
G("bab-executed", 38.08, 46.29, 60, "Tabriz, Iran", "Tabriz");
G("persian-famine", 32, 53, 900, "Iran", "Iran", "region");
G("tobacco-protest", 35.69, 51.39, 80, "Tehran, Iran", "Tehran");
G("naser-assassinated", 35.65, 51.3, 40, "Shah Abdol-Azim Shrine, Rey", "Shah_Abdol-Azim_Shrine");
G("oil-discovered", 31.98, 49.3, 60, "Masjed Soleyman, Iran", "Masjed_Soleyman");
G("shuster-ultimatum", 35.69, 51.39, 80, "Tehran, Iran", "Tehran");
G("selim-deposed", 41.01, 28.98, 40, "Istanbul", "Istanbul");
G("auspicious-incident", 41.01, 28.98, 40, "Istanbul", "Istanbul");
G("dolmabahce", 41.039, 29.0, 30, "Dolmabahçe Palace, Istanbul", "Dolmabahçe_Palace");
G("hatt-i-humayun", 41.01, 28.98, 40, "Istanbul", "Istanbul");
G("constitution-1876", 41.01, 28.98, 40, "Istanbul", "Istanbul");
G("sirkeci-station", 41.0156, 28.9768, 30, "Sirkeci Terminal, Istanbul", "Sirkeci_Terminal");
G("archaeology-museum", 41.0113, 28.9812, 30, "Istanbul Archaeology Museums", "Istanbul_Archaeology_Museums");
G("hamidian-massacres", 39, 40, 700, "Eastern Anatolia", "Eastern_Anatolia_Region", "region");
G("austerlitz", 49.13, 16.76, 60, "Austerlitz (Slavkov u Brna)", "Battle_of_Austerlitz");
G("beethoven-ninth", 48.21, 16.37, 40, "Vienna, Austria", "Vienna");
G("nordbahn", 48.25, 16.4, 50, "Floridsdorf, Vienna", "Floridsdorf");
G("metternich-falls", 48.21, 16.37, 40, "Vienna, Austria", "Vienna");
G("ringstrasse", 48.2, 16.36, 30, "Ringstrasse, Vienna", "Vienna_Ring_Road");
G("ausgleich", 47.5, 19.04, 60, "Budapest, Hungary", "Budapest");
G("vienna-worlds-fair", 48.216, 16.4, 40, "Prater, Vienna", "Prater");
G("vienna-secession", 48.2, 16.3667, 30, "Secession Building, Vienna", "Secession_Building");
G("bosnia-annexed", 43.86, 18.41, 150, "Sarajevo, Bosnia and Herzegovina", "Sarajevo");
G("klimt-kiss", 48.19, 16.38, 30, "Belvedere, Vienna", "Belvedere,_Vienna");
G("sax-saxophone", 50.26, 4.91, 40, "Dinant, Belgium", "Dinant");
G("gramme-dynamo", 48.86, 2.35, 40, "Paris, France", "Paris");
G("congo-free-state", -4.3, 15.3, 1500, "Congo Free State", "Congo_Free_State", "region");
G("ensor-christ-brussels", 51.23, 2.92, 40, "Ostend, Belgium", "Ostend");
G("horta-tassel", 50.8286, 4.3606, 30, "Hôtel Tassel, Brussels", "Hôtel_Tassel");
G("belgium-annexes-congo", 50.85, 4.35, 40, "Brussels, Belgium", "Brussels");
G("germany-invades-belgium", 50.64, 5.57, 100, "Liège, Belgium", "Liège");
G("champollion", 48.86, 2.35, 40, "Paris, France", "Paris");
G("july-revolution", 48.86, 2.35, 40, "Paris, France", "Paris");
G("haussmann-paris", 48.86, 2.35, 40, "Paris, France", "Paris");
G("paris-commune", 48.86, 2.35, 40, "Paris, France", "Paris");
G("rabies-vaccine", 48.84, 2.34, 30, "Paris, France", "Paris");
G("eiffel-tower", 48.8584, 2.2945, 30, "Eiffel Tower, Paris", "Eiffel_Tower");
G("dreyfus-affair", 48.86, 2.35, 40, "Paris, France", "Paris");
G("radium-discovered", 48.85, 2.34, 30, "Paris, France", "Paris");
G("church-state-separation", 48.86, 2.35, 40, "Paris, France", "Paris");
G("swanns-way", 48.86, 2.35, 40, "Paris, France", "Paris");
G("confederation-founded", 48.21, 16.37, 40, "Vienna, Austria", "Vienna");
G("wartburg-festival", 50.966, 10.307, 30, "Wartburg, Eisenach", "Wartburg");
G("st-matthew-passion", 52.52, 13.4, 40, "Berlin, Germany", "Berlin");
G("hambach-festival", 49.3, 8.17, 40, "Hambach Castle, Neustadt", "Hambach_Castle");
G("deutschlandlied", 54.18, 7.89, 30, "Heligoland, Germany", "Heligoland");
G("frankfurt-parliament", 50.11, 8.68, 40, "Frankfurt, Germany", "Frankfurt");
G("lohengrin", 50.98, 11.33, 40, "Weimar, Germany", "Weimar");
G("koniggratz", 50.2, 15.7, 50, "Hradec Králové, Czech Republic", "Hradec_Králové");
