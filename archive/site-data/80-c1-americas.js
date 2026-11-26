// Culture fill-in C1: the Americas, 1900 to today (literature, art, music, film, sport). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const O = (u, t, k) => ({ t, u, k: k || "reference" });
const NP = (path, title) => ({ t: `${title} — NobelPrize.org`, u: `https://www.nobelprize.org/prizes/literature/${path}`, k: "reference" });

TL.add({ events: [
  // ---------- Mexico ----------
  { id: "c1am-mexican-muralism", branch: "mexico", y: 1922, when: "1922", title: "Mexican muralism begins in public buildings",
    text: "After the Revolution the government commissioned Diego Rivera, José Clemente Orozco and David Alfaro Siqueiros, “Los Tres Grandes,” to paint large murals teaching Mexico's history to a mostly illiterate public; Rivera's Creation dates to 1922.", imp: 2,
    cites: [W("Mexican_muralism", "Mexican muralism"), B("biography/Diego-Rivera", "Diego Rivera")] },
  { id: "c1am-mexican-golden-age-cinema", branch: "mexico", y: 1936, end: 1956, when: "1936–1956", title: "Golden Age of Mexican cinema",
    text: "Launched by Allá en el Rancho Grande (1936), a hit across the Spanish-speaking world, Mexican studios built a commercial film industry around comedias rancheras and other genres tied to popular song.", imp: 2,
    cites: [W("Golden_Age_of_Mexican_cinema", "Golden Age of Mexican cinema"), O("https://frontera.library.ucla.edu/blog/2016/11/%E2%80%9Call%C3%A1-en-el-rancho-grande%E2%80%9D-song-movie-and-dawn-golden-age-mexican-cinema", "“Allá en el Rancho Grande”: song, movie and the dawn of the Golden Age of Mexican cinema — UCLA Frontera")] },
  { id: "c1am-pedro-paramo", branch: "mexico", y: 1955, when: "1955", title: "Rulfo publishes Pedro Páramo",
    text: "Juan Rulfo's short novel of a village of the dead sold poorly at first but became a founding text of magical realism, a model for García Márquez and praised by Borges.", imp: 2,
    cites: [W("Pedro_P%C3%A1ramo", "Pedro Páramo"), B("biography/Juan-Rulfo", "Juan Rulfo")] },
  { id: "c1am-mexico-city-olympics", branch: "mexico", y: 1968.78, end: 1968.82, when: "October 12–27, 1968", title: "Mexico City hosts the 1968 Olympics",
    text: "The first Games in Latin America and in a Spanish-speaking country opened ten days after the Tlatelolco massacre; Tommie Smith and John Carlos raised gloved fists on the 200 m podium on October 16.", imp: 2,
    cites: [W("1968_Summer_Olympics", "1968 Summer Olympics"), O("https://www.olympics.com/en/olympic-games/mexico-city-1968", "Mexico City 1968 — Olympics.com")] },
  { id: "c1am-paz-nobel", branch: "mexico", y: 1990.78, when: "October 11, 1990", title: "Octavio Paz wins the Nobel Prize in Literature",
    text: "The Swedish Academy honored the Mexican poet and essayist “for impassioned writing with wide horizons, characterized by sensuous intelligence and humanistic integrity”; he also won the Cervantes Prize.", imp: 2,
    cites: [NP("1990/press-release/", "The Nobel Prize in Literature 1990 – Press release"), B("biography/Octavio-Paz", "Octavio Paz")] },
  { id: "c1am-world-cup-1986", branch: "mexico", y: 1986.42, end: 1986.49, when: "May 31 – June 29, 1986", title: "Mexico hosts the 1986 World Cup",
    text: "Mexico stepped in after Colombia withdrew and became the first country to host the tournament twice; Argentina beat West Germany 3–2 in the final at Estadio Azteca.", imp: 2,
    cites: [W("1986_FIFA_World_Cup", "1986 FIFA World Cup"), B("biography/Diego-Maradona", "Diego Maradona")] },

  // ---------- United States ----------
  { id: "c1am-harlem-renaissance", branch: "usa", y: 1918, end: 1937, when: "c. 1918–1937", title: "Harlem Renaissance",
    text: "A flowering of African American literature, music and art centered in New York's Harlem, the most influential movement in African American literary history.", imp: 2,
    cites: [B("event/Harlem-Renaissance-American-literature-and-art", "Harlem Renaissance")] },
  { id: "c1am-jackie-robinson", branch: "usa", y: 1947.29, when: "April 15, 1947", title: "Jackie Robinson breaks baseball's color line",
    text: "Robinson took the field for the Brooklyn Dodgers, ending the decades-old exclusion of Black players from Major League Baseball; he played for the Dodgers through 1956.", imp: 2,
    cites: [B("biography/Jackie-Robinson", "Jackie Robinson")] },
  { id: "c1am-motown-founded", branch: "usa", y: 1959.03, when: "January 12, 1959", title: "Berry Gordy founds Motown in Detroit",
    text: "Gordy's Black-owned label began as Tamla Records at Hitsville U.S.A.; its polished soul crossed over to white audiences and had 21 number-one pop hits in the 1960s.", imp: 2,
    cites: [W("Motown", "Motown"), B("biography/Berry-Gordy", "Berry Gordy")] },
  { id: "c1am-mtv-launches", branch: "usa", y: 1981.58, when: "August 1, 1981", title: "MTV launches with “Video Killed the Radio Star”",
    text: "The cable channel began broadcasting music videos around the clock, making the video a central part of popular music marketing.", imp: 3,
    cites: [B("money/MTV", "MTV")] },
  { id: "c1am-morrison-nobel", branch: "usa", y: 1993.77, when: "October 7, 1993", title: "Toni Morrison wins the Nobel Prize in Literature",
    text: "The author of Beloved and The Bluest Eye became the first Black woman to receive the prize.", imp: 2,
    cites: [NP("1993/press-release/", "The Nobel Prize in Literature 1993 – Press release"), B("biography/Toni-Morrison", "Toni Morrison")] },
  { id: "c1am-world-cup-1994", branch: "usa", y: 1994.46, end: 1994.54, when: "June 17 – July 17, 1994", title: "United States hosts the 1994 World Cup",
    text: "The tournament set a total attendance record that remains the highest in World Cup history; Brazil beat Italy on penalties at the Rose Bowl in the first World Cup final decided that way.", imp: 2,
    cites: [W("1994_FIFA_World_Cup", "1994 FIFA World Cup"), B("event/1994-FIFA-World-Cup", "1994 FIFA World Cup")] },

  // ---------- Canada ----------
  { id: "c1am-group-of-seven", branch: "canada", y: 1920.35, when: "May 7, 1920", title: "Group of Seven's first exhibition",
    text: "Seven painters, including Lawren Harris and A. Y. Jackson, showed landscapes at the Art Gallery of Toronto; the group became Canada's best-known school of landscape painters.", imp: 2,
    cites: [W("Group_of_Seven_(artists)", "Group of Seven (artists)"), O("https://thecanadianencyclopedia.ca/en/article/group-of-seven-feature", "Group of Seven — The Canadian Encyclopedia")] },
  { id: "c1am-national-film-board", branch: "canada", y: 1939.5, when: "1939", title: "National Film Board of Canada founded",
    text: "Directed by John Grierson, the NFB became a leading documentary studio, and its wartime film Churchill's Island (1941) won the first Academy Award for a documentary short.", imp: 3,
    cites: [B("topic/National-Film-Board-of-Canada", "National Film Board of Canada")] },
  { id: "c1am-expo-67", branch: "canada", y: 1967.32, end: 1967.82, when: "April 28 – October 29, 1967", title: "Expo 67 in Montreal",
    text: "The centennial world's fair, themed “Man and His World,” drew nearly 55 million visits to islands in the St. Lawrence River and was among the most successful of the 20th century.", imp: 2,
    cites: [W("Expo_67", "Expo 67"), B("event/Expo-67", "Expo 67")] },
  { id: "c1am-summit-series", branch: "canada", y: 1972.67, end: 1972.74, when: "September 2–28, 1972", title: "Canada–USSR Summit Series",
    text: "NHL professionals met the Soviet national team for the first time; Paul Henderson's goal with 34 seconds left in game eight in Moscow gave Canada the series 4–3–1.", imp: 2, link: "ussr",
    cites: [W("1972_Summit_Series", "1972 Summit Series"), O("https://thecanadianencyclopedia.ca/en/article/1972-canada-soviet-hockey-series", "1972 Canada-Soviet Hockey Series — The Canadian Encyclopedia")] },
  { id: "c1am-terry-fox-marathon-of-hope", branch: "canada", y: 1980.28, end: 1980.67, when: "April 12 – September 1, 1980", title: "Terry Fox's Marathon of Hope",
    text: "Fox, who had lost a leg to cancer, ran 5,373 km from St. John's before the disease forced him to stop near Thunder Bay; the effort raised millions for cancer research.", imp: 2,
    cites: [W("Marathon_of_Hope", "Marathon of Hope"), B("biography/Terry-Fox", "Terry Fox")] },
  { id: "c1am-munro-nobel", branch: "canada", y: 2013.78, when: "October 10, 2013", title: "Alice Munro wins the Nobel Prize in Literature",
    text: "The Swedish Academy called the short-story writer a “master of the contemporary short story”; Britannica notes that, setting aside Canadian-born Saul Bellow, she was the first Canadian to win.", imp: 2,
    cites: [NP("2013/press-release/", "The Nobel Prize in Literature 2013 – Press release"), B("biography/Alice-Munro", "Alice Munro")] },

  // ---------- Cuba ----------
  { id: "c1am-icaic-founded", branch: "cuba", y: 1959.2, when: "March 1959", title: "Cuba founds the ICAIC film institute",
    text: "The revolutionary government created a state film institute that produced feature and documentary films and the Noticiero ICAIC newsreel, later inscribed on UNESCO's Memory of the World register.", imp: 3,
    cites: [W("Instituto_Cubano_del_Arte_e_Industria_Cinematogr%C3%A1ficos", "Instituto Cubano del Arte e Industria Cinematográficos"), B("topic/Cuban-Institute-of-Cinematographic-Art-and-Industry", "Cuban Institute of Cinematographic Art and Industry")] },
  { id: "c1am-latin-american-boom", branch: "cuba", y: 1962, end: 1971, when: "1960s–1971", title: "The Latin American Boom",
    text: "Novels by Cortázar, Fuentes, Vargas Llosa and García Márquez reached readers worldwide, energized by the Cuban Revolution; the 1971 Padilla affair is often seen as the start of the Boom's decline.", imp: 2,
    cites: [W("Latin_American_Boom", "Latin American Boom"), B("biography/Mario-Vargas-Llosa", "Mario Vargas Llosa")] },
  { id: "c1am-buena-vista-social-club", branch: "cuba", y: 1997.47, when: "June 23, 1997", title: "Buena Vista Social Club album released",
    text: "Ry Cooder's recording of veteran Cuban musicians, made in Havana in six days in 1996, sold over eight million copies and won a 1998 Grammy.", imp: 3,
    cites: [W("Buena_Vista_Social_Club_(album)", "Buena Vista Social Club (album)"), B("topic/Buena-Vista-Social-Club-album", "Buena Vista Social Club")] },

  // ---------- Brazil ----------
  { id: "c1am-pelo-telefone", branch: "brazil", y: 1917.06, when: "January 21, 1917", title: "“Pelo Telefone,” the first recorded samba",
    text: "Released by Casa Edison and credited to Donga and Mauro de Almeida, it is regarded as the first samba recorded in Brazil and a landmark of the genre, though authorship is disputed.", imp: 2,
    cites: [W("Pelo_Telefone", "Pelo Telefone")] },
  { id: "c1am-modern-art-week", branch: "brazil", y: 1922.11, end: 1922.13, when: "February 10–17, 1922", title: "Modern Art Week in São Paulo",
    text: "Painters, poets and composers, including Mário de Andrade and Heitor Villa-Lobos, held a festival at the Theatro Municipal that marked the start of Brazilian Modernism.", imp: 2,
    cites: [W("Modern_Art_Week", "Modern Art Week"), B("topic/Semana-de-Arte-Moderna", "Semana de Arte Moderna")] },
  { id: "c1am-bossa-nova", branch: "brazil", y: 1959.28, when: "April 14, 1959", title: "João Gilberto's Chega de Saudade",
    text: "His debut album, produced by Antônio Carlos Jobim, is often credited as the first bossa nova record, blending samba with jazz harmonies.", imp: 2,
    cites: [W("Chega_de_Saudade_(album)", "Chega de Saudade (album)"), B("art/bossa-nova", "Bossa nova")] },
  { id: "c1am-cinema-novo", branch: "brazil", y: 1960, end: 1972, when: "c. 1960–1972", title: "Cinema Novo",
    text: "Directors led by Glauber Rocha, whose Black God, White Devil appeared in 1964, made films on poverty and politics that influenced Third Cinema.", imp: 2,
    cites: [W("Cinema_Novo", "Cinema Novo"), B("art/Cinema-Novo", "Cinema Nôvo")] },
  { id: "c1am-tropicalia", branch: "brazil", y: 1968, when: "1968", title: "Tropicália manifesto album",
    text: "Caetano Veloso, Gilberto Gil, Gal Costa and others mixed samba with rock and avant-garde; Veloso and Gil were arrested on December 27, 1968, and later exiled to London.", imp: 3,
    cites: [W("Tropic%C3%A1lia", "Tropicália"), B("biography/Caetano-Veloso", "Caetano Veloso")] },
  { id: "c1am-rio-olympics", branch: "brazil", y: 2016.6, end: 2016.64, when: "August 5–21, 2016", title: "Rio de Janeiro hosts the 2016 Olympics",
    text: "The first Games in South America and in a Portuguese-speaking country drew about 11,000 athletes from 207 nations; Brazil won 19 medals, its best total.", imp: 2,
    cites: [W("2016_Summer_Olympics", "2016 Summer Olympics"), B("event/Rio-de-Janeiro-2016-Olympic-Games", "Rio de Janeiro 2016 Olympic Games"), O("https://www.olympics.com/en/olympic-games/rio-2016", "Rio 2016 — Olympics.com")] },

  // ---------- Argentina ----------
  { id: "c1am-gardel-mi-noche-triste", branch: "argentina", y: 1917.5, when: "1917", title: "Gardel records “Mi noche triste”",
    text: "Carlos Gardel's first recording for Odeon started the sentimental tango, with serious emotional lyrics sung for the first time; he went on to be tango's biggest star in films and nightclubs.", imp: 2,
    cites: [W("Mi_noche_triste", "Mi noche triste"), B("biography/Carlos-Gardel", "Carlos Gardel")] },
  { id: "c1am-borges-ficciones", branch: "argentina", y: 1944.5, when: "1944", title: "Borges publishes Ficciones",
    text: "Jorge Luis Borges's collection of fantastic stories, among his best, became a cornerstone of modern world literature.", imp: 2,
    cites: [B("biography/Jorge-Luis-Borges", "Jorge Luis Borges")] },
  { id: "c1am-piazzolla-nuevo-tango", branch: "argentina", y: 1955, when: "1955", title: "Piazzolla leaves tango orchestras to create a new tango",
    text: "After studying with Nadia Boulanger in Paris, bandoneón virtuoso Astor Piazzolla left traditional tango bands to build a new tango that blended jazz and classical music.", imp: 3,
    cites: [B("biography/Astor-Piazzolla", "Astor Piazzolla")] },
  { id: "c1am-rayuela", branch: "argentina", y: 1963.49, when: "June 28, 1963", title: "Cortázar publishes Rayuela (Hopscotch)",
    text: "Julio Cortázar's open-ended novel, readable in several orders, was an experimental landmark of Latin American fiction, described as its equivalent of Joyce's Ulysses.", imp: 2,
    cites: [W("Rayuela", "Rayuela"), B("biography/Julio-Cortazar", "Julio Cortázar")] },
  { id: "c1am-official-story-oscar", branch: "argentina", y: 1986.23, when: "March 24, 1986", title: "The Official Story wins the Oscar",
    text: "Luis Puenzo's drama about a teacher who suspects her adopted daughter is a disappeared person's child won Best Foreign Language Film, a first for a Latin American film.", imp: 3,
    cites: [W("The_Official_Story", "The Official Story"), O("https://www.oscars.org/oscars/ceremonies/1986", "The 58th Academy Awards (1986) — Oscars.org")] },
  { id: "c1am-hand-of-god", branch: "argentina", y: 1986.45, when: "June 1986", title: "Maradona's “Hand of God” World Cup",
    text: "Diego Maradona captained Argentina to its second World Cup in Mexico, scoring the “Hand of God” goal against England in the quarter-final.", imp: 2,
    cites: [B("biography/Diego-Maradona", "Diego Maradona"), W("1986_FIFA_World_Cup", "1986 FIFA World Cup")] },
  { id: "c1am-argentina-wins-2022", branch: "argentina", y: 2022.96, when: "December 18, 2022", title: "Argentina wins the 2022 World Cup",
    text: "Led by Lionel Messi, Argentina drew 3–3 with France in the final at Lusail and won 4–2 on penalties, its third title and first since 1986.", imp: 2,
    cites: [W("2022_FIFA_World_Cup_final", "2022 FIFA World Cup final"), B("event/2022-FIFA-World-Cup", "2022 FIFA World Cup")] },

  // ---------- Chile ----------
  { id: "c1am-house-of-the-spirits", branch: "chile", y: 1982.5, when: "1982", title: "Isabel Allende publishes The House of the Spirits",
    text: "Begun in 1981 as a letter to her dying grandfather, the novel became one of the best-known works of Latin American literature.", imp: 2,
    cites: [B("biography/Isabel-Allende", "Isabel Allende")] },
  { id: "c1am-nueva-cancion-festival", branch: "chile", y: 1969.5, when: "1969", title: "First Festival of Nueva Canción Chilena",
    text: "The festival named a movement of folk-based, politically engaged song that grew from Violeta Parra's work and Víctor Jara, Inti-Illimani and Quilapayún, until the 1973 coup ended it.", imp: 3,
    cites: [W("Nueva_canci%C3%B3n_chilena", "Nueva canción chilena"), B("art/nueva-cancion", "Nueva canción")] },

  // ---------- Other national branches ----------
  { id: "c1am-one-hundred-years-solitude", branch: "colombia", y: 1967.37, when: "May 1967", title: "García Márquez publishes One Hundred Years of Solitude",
    text: "Published in Buenos Aires, the novel popularized magical realism, has sold over 50 million copies and earned its author the 1982 Nobel Prize.", imp: 2,
    cites: [W("One_Hundred_Years_of_Solitude", "One Hundred Years of Solitude"), B("biography/Gabriel-Garcia-Marquez", "Gabriel García Márquez")] },
  { id: "c1am-machu-picchu-bingham", branch: "peru", y: 1911.56, when: "July 24, 1911", title: "Hiram Bingham reaches Machu Picchu",
    text: "Guided by local resident Melchor Arteaga, the Yale professor brought the Inca site to world attention; he wrongly took it for Vilcabamba, the “lost city of the Incas.”", imp: 2,
    cites: [W("Hiram_Bingham_III", "Hiram Bingham III"), B("place/Machu-Picchu", "Machu Picchu")] },
  { id: "c1am-el-sistema", branch: "venezuela", y: 1975.1, when: "1975", title: "José Antonio Abreu founds El Sistema",
    text: "The state music-education program grew to hundreds of youth orchestras and centers for hundreds of thousands of young players and produced conductor Gustavo Dudamel.", imp: 3,
    cites: [W("El_Sistema", "El Sistema"), B("biography/Gustavo-Dudamel", "Gustavo Dudamel")] },
  { id: "c1am-huasipungo", branch: "ecuador", y: 1934.5, when: "1934", title: "Icaza publishes Huasipungo",
    text: "Jorge Icaza's first novel depicted Indigenous villagers stripped of their land and massacred when they resisted, a landmark of Latin American indigenista writing.", imp: 3,
    cites: [B("biography/Jorge-Icaza", "Jorge Icaza")] },
  { id: "c1am-gouverneurs-de-la-rosee", branch: "haiti", y: 1944.5, when: "1944", title: "Roumain's Gouverneurs de la rosée appears",
    text: "Jacques Roumain's novel, translated by Langston Hughes as Masters of the Dew, became a classic of Haitian and Caribbean literature; Roumain died on August 18, 1944.", imp: 3,
    cites: [W("Jacques_Roumain", "Jacques Roumain")] },
  { id: "c1am-jim-thorpe-1912", branch: "first-americans", y: 1912.5, when: "1912", title: "Jim Thorpe wins Olympic gold at Stockholm",
    text: "Thorpe, a Sac and Fox citizen, was the first Native American to win an Olympic gold medal for the United States, taking the pentathlon and decathlon; the IOC stripped his titles in 1913.", imp: 2,
    cites: [B("biography/Jim-Thorpe-American-athlete", "Jim Thorpe"), W("Jim_Thorpe", "Jim Thorpe")] },
  { id: "c1am-smoke-signals", branch: "first-americans", y: 1998.5, when: "July 3, 1998", title: "Smoke Signals reaches wide audiences",
    text: "Directed by Chris Eyre from Sherman Alexie's story, the film won the Filmmakers Trophy and Audience Award at Sundance and was the first feature written, directed and coproduced by Native Americans.", imp: 3,
    cites: [B("topic/Smoke-Signals", "Smoke Signals"), W("Smoke_Signals_(film)", "Smoke Signals (film)")] },
  { id: "c1am-poitier-oscar", branch: "civil-rights", y: 1964.28, when: "April 13, 1964", title: "Sidney Poitier wins the Best Actor Oscar",
    text: "For Lilies of the Field (1963) Poitier became the first African American to win the Academy Award for best actor, a milestone for Black performers amid the civil rights era.", imp: 2,
    cites: [B("biography/Sidney-Poitier", "Sidney Poitier"), O("https://www.oscars.org/oscars/ceremonies/1964", "The 36th Academy Awards (1964) — Oscars.org")] },
] });

TL.geo("c1am-mexican-muralism", { scope: "place", lat: 19.43, lon: -99.13, r: 40, label: "Mexico City", src: "https://en.wikipedia.org/wiki/Mexico_City" });
TL.geo("c1am-mexican-golden-age-cinema", { scope: "region", lat: 23, lon: -102, r: 1500, label: "Mexico", src: "https://en.wikipedia.org/wiki/Mexico" });
TL.geo("c1am-pedro-paramo", { scope: "place", lat: 19.43, lon: -99.13, r: 40, label: "Mexico City", src: "https://en.wikipedia.org/wiki/Mexico_City" });
TL.geo("c1am-mexico-city-olympics", { scope: "place", lat: 19.43, lon: -99.13, r: 40, label: "Mexico City", src: "https://en.wikipedia.org/wiki/Mexico_City" });
TL.geo("c1am-paz-nobel", { scope: "place", lat: 19.43, lon: -99.13, r: 40, label: "Mexico City", src: "https://en.wikipedia.org/wiki/Mexico_City" });
TL.geo("c1am-world-cup-1986", { scope: "place", lat: 19.30, lon: -99.15, r: 40, label: "Estadio Azteca, Mexico City", src: "https://en.wikipedia.org/wiki/Estadio_Azteca" });
TL.geo("c1am-harlem-renaissance", { scope: "place", lat: 40.81, lon: -73.95, r: 30, label: "Harlem, New York City", src: "https://en.wikipedia.org/wiki/Harlem" });
TL.geo("c1am-jackie-robinson", { scope: "place", lat: 40.66, lon: -73.96, r: 30, label: "Ebbets Field, Brooklyn", src: "https://en.wikipedia.org/wiki/Ebbets_Field" });
TL.geo("c1am-motown-founded", { scope: "place", lat: 42.33, lon: -83.05, r: 40, label: "Detroit, Michigan", src: "https://en.wikipedia.org/wiki/Detroit" });
TL.geo("c1am-mtv-launches", { scope: "place", lat: 40.71, lon: -74.01, r: 30, label: "New York City", src: "https://en.wikipedia.org/wiki/New_York_City" });
TL.geo("c1am-morrison-nobel", { scope: "region", lat: 40, lon: -100, r: 2500, label: "United States", src: "https://en.wikipedia.org/wiki/United_States" });
TL.geo("c1am-world-cup-1994", { scope: "region", lat: 40, lon: -100, r: 2500, label: "United States", src: "https://en.wikipedia.org/wiki/United_States" });
TL.geo("c1am-group-of-seven", { scope: "place", lat: 43.65, lon: -79.38, r: 40, label: "Toronto, Ontario", src: "https://en.wikipedia.org/wiki/Toronto" });
TL.geo("c1am-national-film-board", { scope: "place", lat: 45.51, lon: -73.55, r: 40, label: "Montreal, Quebec", src: "https://en.wikipedia.org/wiki/Montreal" });
TL.geo("c1am-expo-67", { scope: "place", lat: 45.51, lon: -73.55, r: 40, label: "Montreal, Quebec", src: "https://en.wikipedia.org/wiki/Montreal" });
TL.geo("c1am-summit-series", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("c1am-terry-fox-marathon-of-hope", { scope: "region", lat: 60, lon: -100, r: 2500, label: "Canada", src: "https://en.wikipedia.org/wiki/Canada" });
TL.geo("c1am-munro-nobel", { scope: "region", lat: 60, lon: -100, r: 2500, label: "Canada", src: "https://en.wikipedia.org/wiki/Canada" });
TL.geo("c1am-icaic-founded", { scope: "place", lat: 23.14, lon: -82.36, r: 40, label: "Havana", src: "https://en.wikipedia.org/wiki/Havana" });
TL.geo("c1am-latin-american-boom", { scope: "place", lat: 23.14, lon: -82.36, r: 40, label: "Havana", src: "https://en.wikipedia.org/wiki/Havana" });
TL.geo("c1am-buena-vista-social-club", { scope: "place", lat: 23.14, lon: -82.36, r: 40, label: "Havana", src: "https://en.wikipedia.org/wiki/Havana" });
TL.geo("c1am-pelo-telefone", { scope: "place", lat: -22.91, lon: -43.21, r: 40, label: "Rio de Janeiro", src: "https://en.wikipedia.org/wiki/Rio_de_Janeiro" });
TL.geo("c1am-modern-art-week", { scope: "place", lat: -23.55, lon: -46.63, r: 40, label: "São Paulo", src: "https://en.wikipedia.org/wiki/S%C3%A3o_Paulo" });
TL.geo("c1am-bossa-nova", { scope: "place", lat: -22.91, lon: -43.21, r: 40, label: "Rio de Janeiro", src: "https://en.wikipedia.org/wiki/Rio_de_Janeiro" });
TL.geo("c1am-cinema-novo", { scope: "region", lat: -10, lon: -52, r: 2000, label: "Brazil", src: "https://en.wikipedia.org/wiki/Brazil" });
TL.geo("c1am-tropicalia", { scope: "region", lat: -10, lon: -52, r: 2000, label: "Brazil", src: "https://en.wikipedia.org/wiki/Brazil" });
TL.geo("c1am-rio-olympics", { scope: "place", lat: -22.91, lon: -43.21, r: 40, label: "Rio de Janeiro", src: "https://en.wikipedia.org/wiki/Rio_de_Janeiro" });
TL.geo("c1am-gardel-mi-noche-triste", { scope: "place", lat: -34.60, lon: -58.38, r: 40, label: "Buenos Aires", src: "https://en.wikipedia.org/wiki/Buenos_Aires" });
TL.geo("c1am-borges-ficciones", { scope: "place", lat: -34.60, lon: -58.38, r: 40, label: "Buenos Aires", src: "https://en.wikipedia.org/wiki/Buenos_Aires" });
TL.geo("c1am-piazzolla-nuevo-tango", { scope: "place", lat: -34.60, lon: -58.38, r: 40, label: "Buenos Aires", src: "https://en.wikipedia.org/wiki/Buenos_Aires" });
TL.geo("c1am-rayuela", { scope: "place", lat: -34.60, lon: -58.38, r: 40, label: "Buenos Aires", src: "https://en.wikipedia.org/wiki/Buenos_Aires" });
TL.geo("c1am-official-story-oscar", { scope: "place", lat: -34.60, lon: -58.38, r: 40, label: "Buenos Aires", src: "https://en.wikipedia.org/wiki/Buenos_Aires" });
TL.geo("c1am-hand-of-god", { scope: "place", lat: 19.30, lon: -99.15, r: 40, label: "Estadio Azteca, Mexico City", src: "https://en.wikipedia.org/wiki/Estadio_Azteca" });
TL.geo("c1am-argentina-wins-2022", { scope: "place", lat: 25.42, lon: 51.49, r: 40, label: "Lusail Stadium, Qatar", src: "https://en.wikipedia.org/wiki/Lusail_Stadium" });
TL.geo("c1am-house-of-the-spirits", { scope: "region", lat: -34, lon: -71, r: 1500, label: "Chile", src: "https://en.wikipedia.org/wiki/Chile" });
TL.geo("c1am-nueva-cancion-festival", { scope: "place", lat: -33.44, lon: -70.65, r: 40, label: "Santiago", src: "https://en.wikipedia.org/wiki/Santiago" });
TL.geo("c1am-one-hundred-years-solitude", { scope: "region", lat: 4, lon: -72, r: 800, label: "Colombia", src: "https://en.wikipedia.org/wiki/Colombia" });
TL.geo("c1am-machu-picchu-bingham", { scope: "place", lat: -13.16, lon: -72.55, r: 30, label: "Machu Picchu, Peru", src: "https://en.wikipedia.org/wiki/Machu_Picchu" });
TL.geo("c1am-el-sistema", { scope: "place", lat: 10.51, lon: -66.91, r: 40, label: "Caracas", src: "https://en.wikipedia.org/wiki/Caracas" });
TL.geo("c1am-huasipungo", { scope: "place", lat: -0.22, lon: -78.51, r: 40, label: "Quito", src: "https://en.wikipedia.org/wiki/Quito" });
TL.geo("c1am-gouverneurs-de-la-rosee", { scope: "place", lat: 18.54, lon: -72.35, r: 40, label: "Port-au-Prince", src: "https://en.wikipedia.org/wiki/Port-au-Prince" });
TL.geo("c1am-jim-thorpe-1912", { scope: "place", lat: 59.33, lon: 18.07, r: 40, label: "Stockholm", src: "https://en.wikipedia.org/wiki/Stockholm" });
TL.geo("c1am-smoke-signals", { scope: "place", lat: 40.65, lon: -111.5, r: 40, label: "Park City, Utah", src: "https://en.wikipedia.org/wiki/Park_City,_Utah" });
TL.geo("c1am-poitier-oscar", { scope: "region", lat: 40, lon: -100, r: 2500, label: "United States", src: "https://en.wikipedia.org/wiki/United_States" });
