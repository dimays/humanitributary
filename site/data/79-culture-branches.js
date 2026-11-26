// New region "culture" (Arts, culture & sport): twelve branches with origins and landmark events. Every cite below was fetched and read while writing this file (Nov 2026); see SCHEMA.md.

const D = (y, m = 7, d = 1) => {
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let doy = d - 0.5;
  for (let i = 0; i < m - 1; i++) doy += days[i];
  return Math.round((y + doy / (leap ? 366 : 365)) * 1000) / 1000;
};
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });

const X = (t, u) => ({ t, u });
const LINKS = { "rashomon": "japan", "space-invaders": "japan", "pac-man": "japan", "super-mario-bros": "japan", "parasite": "south-korea",
  "jazz-singer": "usa", "kdka": "usa", "elvis-sun": "usa", "woodstock": "usa", "herc-sedgwick": "usa",
  "bbc-founded": "uk", "bbc-television": "uk", "coronation-televised": "uk" };
const events = [];
const geos = [];
// e(id, branch, y, [end], when, title, text, imp, cites, geo)
const e = (id, branch, y, end, when, title, text, imp, cites, geo) => {
  const ev = { id: "cu-" + id, branch, y, when, title, text, imp, cites };
  if (end) ev.end = end;
  if (LINKS[id]) ev.link = LINKS[id];
  events.push(ev);
  geos.push([ev.id, geo]);
};
const P = (lat, lon, label, src, r = 40) => ({ scope: "place", lat, lon, r, label, src: "https://en.wikipedia.org/wiki/" + src });

/* ---------------- Romanticism ---------------- */
e("lyrical-ballads", "romanticism", 1798, null, "1798", "Wordsworth and Coleridge publish Lyrical Ballads",
  "The joint collection of poems, including Coleridge's “The Rime of the Ancient Mariner,” is generally considered to have marked the beginning of the English Romantic movement in literature.",
  2, [B("topic/Lyrical-Ballads", "Lyrical Ballads"), W("Lyrical_Ballads", "Lyrical Ballads")],
  P(51.1, -3.2, "Quantock Hills, England", "Quantock_Hills"));
e("eroica-premiere", "romanticism", D(1805, 4, 7), null, "April 7, 1805", "Beethoven's Eroica Symphony premieres in Vienna",
  "Its grandeur and drama exceeded the norms of symphonies at the time. Beethoven reportedly removed a dedication to Napoleon after the general proclaimed himself emperor in December 1804.",
  2, [B("topic/Eroica-Symphony", "Eroica Symphony")],
  P(48.21, 16.37, "Vienna, Austria", "Vienna"));
e("wanderer-fog", "romanticism", 1818, null, "1818", "Friedrich paints Wanderer above the Sea of Fog",
  "Caspar David Friedrich's painting of a lone figure facing a mist-filled landscape became an emblem of Romantic awe before nature. Britannica dates it 1817.",
  2, [B("biography/Caspar-David-Friedrich", "Caspar David Friedrich"), W("Wanderer_above_the_Sea_of_Fog", "Wanderer above the Sea of Fog")],
  P(53.55, 9.99, "Hamburg, Germany", "Hamburg"));
e("frankenstein", "romanticism", D(1818, 1, 1), null, "January 1, 1818", "Mary Shelley's Frankenstein published",
  "The first edition appeared anonymously in London when the author was 20. Frankenstein; or, The Modern Prometheus drew on Romantic ideas about science, creation and ambition.",
  2, [W("Frankenstein", "Frankenstein"), B("topic/Frankenstein", "Frankenstein")],
  P(51.51, -0.13, "London, England", "London"));
e("hernani", "romanticism", 1830.15, null, "1830", "Hugo's Hernani stages the Romantic breakthrough in Paris",
  "Victor Hugo's poetic tragedy, first performed and published in 1830, became a rallying point for French Romantic drama against classical rules.",
  2, [B("topic/Hernani", "Hernani")],
  P(48.86, 2.34, "Paris, France", "Paris"));
e("symphonie-fantastique", "romanticism", D(1830, 12, 5), null, "December 5, 1830", "Berlioz's Symphonie fantastique premieres",
  "First performed at the Paris Conservatoire under François-Antoine Habeneck, it was a programmatic symphony that told a story in music and became a landmark of Romantic orchestral writing.",
  2, [W("Symphonie_fantastique", "Symphonie fantastique"), B("topic/Symphonie-fantastique-Op-14", "Symphonie fantastique, Op. 14")],
  P(48.87, 2.35, "Paris, France", "Paris"));

/* ---------------- Realism and Impressionism ---------------- */
e("pavilion-of-realism", "realism-impressionism", 1855, null, "1855", "Courbet opens his Pavilion of Realism",
  "Rejected by the jury of the Exposition Universelle, Gustave Courbet built his own temporary gallery next door and showed some forty paintings, including The Artist's Studio.",
  2, [W("Gustave_Courbet", "Gustave Courbet"), B("biography/Gustave-Courbet", "Gustave Courbet")],
  P(48.86, 2.31, "Paris, France", "Paris"));
e("madame-bovary", "realism-impressionism", D(1856, 10, 1), null, "October 1, 1856", "Flaubert's Madame Bovary begins serialization",
  "Serialized in Revue de Paris from October 1 to December 15, 1856, the novel was attacked as obscene; the trial in January 1857 made it notorious.",
  2, [W("Madame_Bovary", "Madame Bovary"), B("topic/Madame-Bovary-novel", "Madame Bovary")],
  P(48.86, 2.34, "Paris, France", "Paris"));
e("salon-des-refuses", "realism-impressionism", 1863.4, null, "1863", "Salon des Refusés shows rejected painters",
  "After the official Salon jury turned away two thirds of the paintings submitted, Napoleon III ordered a separate exhibition. Manet showed Déjeuner sur l'herbe there.",
  2, [B("art/Salon-des-Refuses", "Salon des Refusés"), W("Salon_des_Refusés", "Salon des Refusés")],
  P(48.87, 2.31, "Paris, France", "Paris"));
e("olympia", "realism-impressionism", 1865.35, null, "1865", "Manet's Olympia scandalizes the Paris Salon",
  "Édouard Manet's nude, painted in 1863, caused shock when exhibited at the Salon of 1865 because details marked the model as a prostitute and her gaze confronted viewers.",
  2, [B("topic/Olympia-painting-by-Manet", "Olympia"), W("Olympia_(Manet)", "Olympia (Manet)")],
  P(48.86, 2.34, "Paris, France", "Paris"));
e("first-impressionist-exhibition", "realism-impressionism", 1874.29, null, "April 1874", "First Impressionist exhibition",
  "Artists including Monet, Renoir and Degas showed independently in the studio of the photographer Nadar. A critic's mocking review of Monet's Impression, Sunrise gave the movement its name.",
  1, [W("First_Impressionist_Exhibition", "First Impressionist Exhibition"), B("topic/Impression-Sunrise", "Impression, Sunrise")],
  P(48.871, 2.33, "Boulevard des Capucines, Paris", "Boulevard_des_Capucines"));
e("last-impressionist-exhibition", "realism-impressionism", 1886.4, null, "1886", "Eighth and last Impressionist exhibition",
  "The group had shown eight times since 1874. It divided over inviting Paul Signac and Georges Seurat to exhibit, a split that opened the way to Post-Impressionism.",
  3, [W("Impressionism", "Impressionism"), B("art/Impressionism-art", "Impressionism")],
  P(48.86, 2.34, "Paris, France", "Paris"));

/* ---------------- Modernism ---------------- */
e("demoiselles", "modernism", 1907, null, "1907", "Picasso completes Les Demoiselles d'Avignon",
  "Painted in his Montmartre studio, the large canvas broke with perspective and traditional beauty; it was seen publicly for the first time only in 1916.",
  2, [B("topic/Les-Demoiselles-dAvignon", "Les Demoiselles d'Avignon"), W("Les_Demoiselles_d'Avignon", "Les Demoiselles d'Avignon")],
  P(48.886, 2.339, "Montmartre, Paris", "Montmartre"));
e("fountain", "modernism", 1917.3, null, "April 1917", "Duchamp's Fountain is submitted to a New York show",
  "A porcelain urinal signed “R. Mutt” was submitted to the Society of Independent Artists exhibition. Attributed to Marcel Duchamp, this readymade challenged what counts as art.",
  2, [W("Fountain_(Duchamp)", "Fountain (Duchamp)"), B("topic/Fountain-by-Duchamp", "Fountain")],
  P(40.75, -73.98, "New York City", "New_York_City"));
e("armory-show", "modernism", D(1913, 2, 17), D(1913, 3, 15), "February 17 – March 15, 1913", "Armory Show brings European modern art to America",
  "The International Exhibition of Modern Art, at New York's 69th Regiment Armory, included Matisse's Blue Nude and Duchamp's Nude Descending a Staircase and provoked both outrage and fascination.",
  2, [W("Armory_Show", "Armory Show"), B("event/Armory-Show-art-show-New-York-City", "Armory Show")],
  P(40.742, -73.984, "69th Regiment Armory, New York", "69th_Regiment_Armory"));
e("rite-of-spring", "modernism", D(1913, 5, 29), null, "May 29, 1913", "Stravinsky's Rite of Spring premieres in Paris",
  "The ballet's avant-garde music and choreography caused a sensation at the new Théâtre des Champs-Élysées. Later accounts called the first-night reaction a riot.",
  2, [B("topic/The-Rite-of-Spring", "The Rite of Spring"), W("The_Rite_of_Spring", "The Rite of Spring")],
  P(48.866, 2.303, "Théâtre des Champs-Élysées, Paris", "Théâtre_des_Champs-Élysées"));
e("bauhaus", "modernism", 1919, null, "1919", "Gropius founds the Bauhaus in Weimar",
  "The German art school combined crafts and the fine arts. It moved to Dessau in 1925 and Berlin in 1932 and closed in 1933 under Nazi pressure.",
  2, [B("topic/Bauhaus", "Bauhaus"), W("Bauhaus", "Bauhaus")],
  P(50.98, 11.33, "Weimar, Germany", "Weimar"));
e("ulysses", "modernism", D(1922, 2, 2), null, "February 2, 1922", "Joyce's Ulysses published in Paris",
  "Sylvia Beach's Shakespeare and Company issued the novel on Joyce's 40th birthday, after serialization in The Little Review. Its stream-of-consciousness technique became a touchstone of modernist fiction.",
  2, [W("Ulysses_(novel)", "Ulysses (novel)"), B("topic/Ulysses-novel-by-Joyce", "Ulysses")],
  P(48.853, 2.339, "Paris, France", "Paris"));
e("waste-land", "modernism", 1922.8, null, "October 1922", "Eliot's The Waste Land appears",
  "The 434-line poem appeared in October 1922 in Eliot's magazine The Criterion in London and in November in The Dial in New York. Its fragmented form made it a defining modernist poem.",
  2, [B("topic/The-Waste-Land", "The Waste Land"), W("The_Waste_Land", "The Waste Land")],
  P(51.51, -0.13, "London, England", "London"));

/* ---------------- Photography ---------------- */
e("niepce-first-photo", "photography", 1827.4, null, "1826/27", "Niépce makes the oldest surviving photograph",
  "Nicéphore Niépce exposed a pewter plate in a camera obscura at his estate, Le Gras, producing View from the Window at Le Gras, in 1826 or 1827.",
  1, [B("biography/Nicephore-Niepce", "Nicéphore Niépce"), W("View_from_the_Window_at_Le_Gras", "View from the Window at Le Gras")],
  P(46.7, 4.8, "Saint-Loup-de-Varennes, France", "Saint-Loup-de-Varennes"));
e("daguerreotype", "photography", D(1839, 8, 19), null, "August 19, 1839", "France gives the daguerreotype to the world",
  "François Arago described the process to the Academies in Paris, and the government presented it “free to the world” as a gift on August 19, 1839.",
  1, [W("Daguerreotype", "Daguerreotype"), B("technology/daguerreotype", "Daguerreotype")],
  P(48.86, 2.34, "Paris, France", "Paris"));
e("calotype", "photography", 1841, null, "1841", "Talbot patents the calotype",
  "William Henry Fox Talbot introduced the calotype, which developed a faint latent image on coated paper. Unlike the daguerreotype it produced a negative from which many prints could be made.",
  2, [B("technology/calotype", "Calotype"), W("Calotype", "Calotype")],
  P(51.4, -2.1, "Lacock Abbey, England", "Lacock_Abbey"));
e("fenton-crimea", "photography", 1855.4, null, "1855", "Fenton photographs the Crimean War",
  "Roger Fenton's pictures of the Crimean War were the first extensive photographic documents of a war. Thomas Agnew exhibited a series of his images in London in September 1855.",
  2, [B("biography/Roger-Fenton", "Roger Fenton"), W("Roger_Fenton", "Roger Fenton")],
  P(44.6, 33.5, "Sevastopol, Crimea", "Sevastopol", 60));
e("muybridge-horse", "photography", 1878.45, null, "June 1878", "Muybridge photographs a galloping horse",
  "With a battery of 12 cameras at Leland Stanford's Palo Alto farm, Eadweard Muybridge showed that a running horse has all four hooves in the air at times. He went on to invent the zoopraxiscope.",
  2, [W("Eadweard_Muybridge", "Eadweard Muybridge"), B("biography/Eadweard-Muybridge", "Eadweard Muybridge")],
  P(37.43, -122.17, "Palo Alto, California", "Palo_Alto,_California"));
e("kodak-camera", "photography", 1888, null, "1888", "George Eastman markets the first Kodak camera",
  "Eastman coined the Kodak name and put the camera on sale in 1888; the Brownie of 1900 followed, aimed at children and broadening amateur photography.",
  2, [B("biography/George-Eastman", "George Eastman"), W("Kodak", "Kodak")],
  P(43.16, -77.61, "Rochester, New York", "Rochester,_New_York"));
e("digital-camera", "photography", 1975, null, "1975", "Sasson builds a self-contained digital camera at Kodak",
  "Kodak engineer Steven Sasson built an electronic camera around a Fairchild CCD sensor, a forerunner of the digital cameras that replaced film.",
  2, [W("Digital_camera", "Digital camera"), X("Milestones — Kodak", "https://www.kodak.com/en/company/page/milestones/")],
  P(43.16, -77.61, "Rochester, New York", "Rochester,_New_York"));

/* ---------------- Cinema ---------------- */
e("lumiere-screening", "cinema", D(1895, 12, 28), null, "December 28, 1895", "Lumière brothers hold the first paid film screening",
  "Auguste and Louis Lumière showed films to about 40 paying visitors at the Salon Indien du Grand Café in Paris, traditionally regarded as the birth of cinema.",
  1, [W("Lumière_brothers", "Lumière brothers"), B("topic/Lumiere-brothers", "Lumière brothers")],
  P(48.871, 2.332, "Grand Café, Paris", "Boulevard_des_Capucines"));
e("trip-to-the-moon", "cinema", 1902, null, "1902", "Méliès's A Trip to the Moon",
  "Georges Méliès's 1902 French science-fiction trick film became his most famous work and showed that cinema could stage fantasy.",
  2, [B("topic/A-Trip-to-the-Moon", "A Trip to the Moon"), W("A_Trip_to_the_Moon", "A Trip to the Moon")],
  P(48.85, 2.5, "Montreuil, Seine-Saint-Denis", "Montreuil,_Seine-Saint-Denis"));
e("birth-of-a-nation", "cinema", 1915, null, "1915", "The Birth of a Nation released",
  "D. W. Griffith's 1915 silent film, based on Thomas Dixon's novel The Clansman, became the most popular film of its time but it also sparked significant controversy.",
  2, [B("topic/The-Birth-of-a-Nation", "The Birth of a Nation"), W("The_Birth_of_a_Nation", "The Birth of a Nation")],
  P(34.05, -118.24, "Los Angeles, California", "Los_Angeles"));
e("jazz-singer", "cinema", D(1927, 10, 6), null, "October 6, 1927", "The Jazz Singer premieres",
  "Warner Bros.' film, with synchronized songs and some spoken lines, opened in New York and helped move Hollywood from silent pictures to sound.",
  2, [W("The_Jazz_Singer", "The Jazz Singer"), B("topic/The-Jazz-Singer-film-1927", "The Jazz Singer")],
  P(40.76, -73.98, "New York City", "New_York_City"));
e("citizen-kane", "cinema", 1941, null, "1941", "Citizen Kane released",
  "Orson Welles directed, produced, co-wrote and starred in the 1941 American drama, often cited by critics as one of the greatest films ever made.",
  2, [B("topic/Citizen-Kane", "Citizen Kane"), W("Citizen_Kane", "Citizen Kane")],
  P(34.1, -118.33, "Hollywood, Los Angeles", "Hollywood"));
e("rashomon", "cinema", 1951.7, null, "1951", "Rashomon wins the Golden Lion at Venice",
  "Akira Kurosawa's film won the top prize at the 12th Venice International Film Festival and became the first Japanese film to gain significant international reception.",
  2, [W("Rashomon", "Rashomon"), B("topic/Rashomon-film-by-Kurosawa", "Rashomon")],
  P(45.43, 12.33, "Venice, Italy", "Venice"));
e("star-wars", "cinema", D(1977, 5, 25), null, "May 25, 1977", "Star Wars opens and becomes a blockbuster",
  "George Lucas's space opera, released in a small number of US theaters on May 25, 1977, quickly became a surprise blockbuster and was then expanded to a much wider release.",
  2, [B("topic/Star-Wars-film-by-Lucas", "Star Wars: Episode IV—A New Hope"), W("Star_Wars_(film)", "Star Wars (film)")],
  P(34.05, -118.24, "Los Angeles, California", "Los_Angeles"));
e("toy-story", "cinema", D(1995, 11, 22), null, "November 22, 1995", "Toy Story, the first computer-animated feature",
  "Pixar's first feature for Disney, directed by John Lasseter, was the first entirely computer-animated feature film.",
  2, [W("Toy_Story", "Toy Story"), B("topic/Toy-Story", "Toy Story")],
  P(37.83, -122.28, "Emeryville, California", "Emeryville,_California"));
e("parasite", "cinema", 2019.4, null, "May 2019", "Parasite wins the Palme d'Or and Best Picture",
  "Bong Joon-ho's film became the first Korean film to win the Palme d'Or at Cannes in May 2019 and later the first non-English-language film to win the Academy Award for Best Picture.",
  2, [W("Parasite_(2019_film)", "Parasite (2019 film)"), B("topic/Parasite-2019-film", "Parasite")],
  P(43.55, 7.01, "Cannes, France", "Cannes"));

/* ---------------- Radio and television ---------------- */
e("kdka", "broadcasting", D(1920, 11, 2), null, "November 2, 1920", "KDKA broadcasts the Harding-Cox election returns",
  "The Pittsburgh station, recognized as the first commercial radio station in the United States, began broadcasting with the presidential election results.",
  2, [B("topic/KDKA", "KDKA"), W("KDKA_(AM)", "KDKA (AM)")],
  P(40.44, -80.0, "Pittsburgh, Pennsylvania", "Pittsburgh"));
e("bbc-founded", "broadcasting", D(1922, 10, 18), null, "October 18, 1922", "The British Broadcasting Company is formed",
  "Established as a company in 1922, it became the British Broadcasting Corporation under a royal charter on January 1, 1927.",
  2, [W("BBC", "BBC"), B("topic/British-Broadcasting-Corporation", "British Broadcasting Corporation")],
  P(51.51, -0.13, "London, England", "London"));
e("baird-television", "broadcasting", D(1926, 1, 26), null, "January 26, 1926", "Baird demonstrates the first television system",
  "John Logie Baird showed his mechanical “Televisor” in London, regarded as the first demonstration of television.",
  2, [B("biography/John-Logie-Baird", "John Logie Baird"), W("John_Logie_Baird", "John Logie Baird")],
  P(51.51, -0.13, "London, England", "London"));
e("bbc-television", "broadcasting", D(1936, 11, 2), null, "November 2, 1936", "BBC begins a regular television service",
  "Broadcasting from a converted wing of Alexandra Palace in London, the BBC's service is dated to November 2, 1936, though it had produced programs from 1932.",
  2, [W("BBC_Television_Service", "BBC Television Service"), B("topic/television-broadcasting", "Television"), B("place/Alexandra-Palace", "Alexandra Palace")],
  P(51.594, -0.13, "Alexandra Palace, London", "Alexandra_Palace"));
e("war-of-the-worlds", "broadcasting", D(1938, 10, 30), null, "October 30, 1938", "Welles's War of the Worlds broadcast",
  "The Mercury Theatre on the Air presented an adaptation of H. G. Wells's novel as a Halloween episode on CBS Radio.",
  3, [W("The_War_of_the_Worlds_(1938_radio_drama)", "The War of the Worlds (1938 radio drama)"), B("topic/War-of-the-Worlds-radio-drama-by-Welles-1938", "The War of the Worlds")],
  P(40.75, -73.98, "New York City", "New_York_City"));
e("coronation-televised", "broadcasting", D(1953, 6, 2), null, "June 2, 1953", "Elizabeth II's coronation is televised",
  "It was the first British coronation to be fully televised; cameras had not been allowed inside Westminster Abbey for her parents' coronation in 1937.",
  2, [W("Coronation_of_Elizabeth_II", "Coronation of Elizabeth II"), B("event/coronation-of-Elizabeth-II", "Coronation of Elizabeth II")],
  P(51.4994, -0.1273, "Westminster Abbey, London", "Westminster_Abbey"));
e("telstar", "broadcasting", D(1962, 7, 10), null, "July 10, 1962", "Telstar 1 relays the first television pictures by satellite",
  "Launched by NASA on a Delta rocket from Cape Canaveral, the first privately sponsored space launch relayed the first television pictures through space.",
  2, [W("Telstar", "Telstar"), B("technology/Telstar-communications-satellite", "Telstar")],
  P(28.4, -80.6, "Cape Canaveral, Florida", "Cape_Canaveral"));
e("cnn-launch", "broadcasting", D(1980, 6, 1), null, "June 1, 1980", "CNN launches 24-hour television news",
  "Ted Turner and Reese Schonfeld founded the Atlanta-based channel, the first to provide round-the-clock news coverage in the United States.",
  2, [W("CNN", "CNN"), B("topic/CNN", "CNN")],
  P(33.75, -84.39, "Atlanta, Georgia", "Atlanta"));
e("live-aid", "broadcasting", D(1985, 7, 13), null, "July 13, 1985", "Live Aid is broadcast to a global audience",
  "The two-venue benefit concert for Ethiopian famine relief was broadcast live in 150 nations and watched by an estimated 1.9 billion people.",
  2, [W("Live_Aid", "Live Aid"), B("topic/Live-Aid", "Live Aid")],
  P(39.95, -75.17, "Philadelphia, Pennsylvania", "Philadelphia"));

/* ---------------- Jazz and blues ---------------- */
e("memphis-blues", "jazz-blues", 1912, null, "1912", "W. C. Handy publishes “The Memphis Blues”",
  "Handy's sheet music, with “St. Louis Blues” (1914), brought the African American blues form to a national audience. It began as a 1909 Memphis mayoral campaign song.",
  2, [B("biography/W-C-Handy", "W. C. Handy"), B("topic/Memphis-Blues", "Memphis Blues")],
  P(35.15, -90.05, "Memphis, Tennessee", "Memphis,_Tennessee"));
e("odjb-first-jazz-record", "jazz-blues", D(1917, 2, 26), null, "February 26, 1917", "First jazz record: Livery Stable Blues",
  "The Original Dixieland Jass Band recorded two sides for Victor in New York; “Livery Stable Blues” became the first jazz record ever issued and a million-seller.",
  2, [W("Original_Dixieland_Jass_Band", "Original Dixieland Jass Band"), B("topic/Original-Dixieland-Jazz-Band", "Original Dixieland Jazz Band")],
  P(40.75, -73.98, "New York City", "New_York_City"));
e("crazy-blues", "jazz-blues", D(1920, 8, 10), null, "August 10, 1920", "Mamie Smith records “Crazy Blues”",
  "Her recording of Perry Bradford's song was so successful that OKeh launched its “Original Race Records” series, opening a market for Black blues singers.",
  2, [W("Crazy_Blues", "Crazy Blues"), B("biography/Mamie-Smith", "Mamie Smith")],
  P(40.75, -73.98, "New York City", "New_York_City"));
e("robert-johnson-sessions", "jazz-blues", 1936.9, 1937.5, "1936–1937", "Robert Johnson's recording sessions",
  "In two sessions, in San Antonio in 1936 and Dallas in 1937, he recorded 29 songs, which have influenced later generations of musicians.",
  2, [B("biography/Robert-Johnson-American-musician", "Robert Johnson"), W("Robert_Johnson", "Robert Johnson")],
  P(29.42, -98.49, "San Antonio, Texas", "San_Antonio"));
e("goodman-carnegie-hall", "jazz-blues", D(1938, 1, 16), null, "January 16, 1938", "Benny Goodman plays Carnegie Hall",
  "A critic called the concert “jazz's ‘coming out’ party to the world of ‘respectable’ music.” Goodman's band had guests from the bands of Duke Ellington and Count Basie.",
  2, [W("Benny_Goodman", "Benny Goodman"), B("biography/Benny-Goodman", "Benny Goodman")],
  P(40.765, -73.98, "Carnegie Hall, New York", "Carnegie_Hall"));
e("bebop", "jazz-blues", 1941, 1949, "1940s", "Bebop reshapes jazz",
  "Developed in the early to mid-1940s by Dizzy Gillespie, Charlie Parker and others, bebop was the first kind of modern jazz and split jazz into opposing camps.",
  2, [B("art/bebop", "Bebop"), W("Bebop", "Bebop")],
  P(40.8, -73.95, "Harlem, New York", "Harlem"));
e("newport-jazz-festival", "jazz-blues", 1954.55, null, "1954", "First Newport Jazz Festival",
  "Founded by George Wein and financed by Elaine and Louis Lorillard, it was held at the Newport Casino in Rhode Island and became a model for jazz festivals.",
  3, [B("topic/Newport-Jazz-Festival", "Newport Jazz Festival"), W("Newport_Jazz_Festival", "Newport Jazz Festival")],
  P(41.48, -71.31, "Newport, Rhode Island", "Newport,_Rhode_Island"));
e("kind-of-blue", "jazz-blues", D(1959, 8, 17), null, "August 17, 1959", "Miles Davis releases Kind of Blue",
  "Recorded in two sessions in March and April 1959, the album became a seminal work of modal jazz.",
  2, [W("Kind_of_Blue", "Kind of Blue"), B("topic/Kind-of-Blue", "Kind of Blue")],
  P(40.74, -73.98, "New York City", "New_York_City"));

/* ---------------- Rock and popular music ---------------- */
e("elvis-sun", "rock-pop", D(1954, 7, 5), null, "July 5, 1954", "Elvis Presley records “That's All Right” at Sun",
  "At a late-night Memphis session Presley launched into Arthur Crudup's 1946 blues number. The single, played by DJ Dewey Phillips, was an early landmark of rockabilly.",
  2, [W("Elvis_Presley", "Elvis Presley"), B("biography/Elvis-Presley", "Elvis Presley")],
  P(35.14, -90.04, "Memphis, Tennessee", "Memphis,_Tennessee"));
e("rock-around-the-clock", "rock-pop", 1955.5, null, "1955", "“Rock Around the Clock” tops the charts",
  "Bill Haley's 1954 single won huge popularity in 1955 after it appeared in the film Blackboard Jungle, becoming the first rock and roll record to top the US and UK pop charts.",
  2, [B("topic/Rock-Around-the-Clock", "Rock Around the Clock"), W("Rock_Around_the_Clock", "Rock Around the Clock")],
  P(40.73, -73.99, "New York City", "New_York_City"));
e("beatles-ed-sullivan", "rock-pop", D(1964, 2, 9), null, "February 9, 1964", "The Beatles on The Ed Sullivan Show",
  "Watched by more than 73 million viewers, a record for US television, the broadcast launched American Beatlemania and the wider British Invasion of pop music.",
  2, [W("The_Beatles_on_The_Ed_Sullivan_Show", "The Beatles on The Ed Sullivan Show"), B("topic/The-Beatles", "The Beatles")],
  P(40.76, -73.98, "New York City", "New_York_City"));
e("sgt-pepper", "rock-pop", D(1967, 6, 1), null, "May 26 – June 2, 1967", "Sgt. Pepper's Lonely Hearts Club Band released",
  "The Beatles' album came out in the UK on May 26 and in the US on June 2, 1967. It won the 1968 Grammy for Album of the Year, the first rock LP to do so.",
  2, [W("Sgt._Pepper's_Lonely_Hearts_Club_Band", "Sgt. Pepper's Lonely Hearts Club Band"), B("topic/Sgt-Peppers-Lonely-Hearts-Club-Band", "Sgt. Pepper's Lonely Hearts Club Band")],
  P(51.51, -0.13, "London, England", "London"));
e("woodstock", "rock-pop", D(1969, 8, 15), D(1969, 8, 18), "August 15–18, 1969", "Woodstock Music and Art Fair",
  "Thirty-two acts played on Max Yasgur's dairy farm in Bethel, New York, to a crowd far larger than organizers expected, and it became a symbol of the 1960s counterculture.",
  2, [W("Woodstock", "Woodstock"), B("event/The-Woodstock-Music-and-Art-Fair-1688509", "The Woodstock Music and Art Fair")],
  P(41.7, -74.88, "Bethel, New York", "Bethel,_New_York"));
e("mtv-launch", "rock-pop", D(1981, 8, 1), null, "August 1, 1981", "MTV launches as a music video channel",
  "Launched on August 1, 1981, the channel originally aired music videos guided by video jockeys and reshaped how pop music was marketed.",
  2, [W("MTV", "MTV"), B("topic/MTV", "MTV")],
  P(40.76, -73.98, "New York City", "New_York_City"));
e("thriller", "rock-pop", D(1982, 11, 30), null, "November 1982", "Michael Jackson releases Thriller",
  "The Epic Records album is regarded as the best-selling album of all time, with an estimated 67 million copies sold worldwide, according to Britannica.",
  2, [W("Thriller_(album)", "Thriller (album)"), B("topic/Thriller-recording-by-Jackson", "Thriller")],
  P(34.05, -118.24, "Los Angeles, California", "Los_Angeles"));
e("napster", "rock-pop", 1999.45, null, "June 1999", "Napster launches peer-to-peer music sharing",
  "Created by Shawn Fanning and Sean Parker, the service was shut down in July 2001 after copyright lawsuits, but it had begun the shift of music to the Internet.",
  2, [W("Napster", "Napster"), B("topic/Napster", "Napster")],
  P(42.36, -71.06, "Boston, Massachusetts", "Boston"));

/* ---------------- Hip hop ---------------- */
e("herc-sedgwick", "hip-hop", D(1973, 8, 11), null, "August 11, 1973", "DJ Kool Herc's party at 1520 Sedgwick Avenue",
  "At a back-to-school party hosted with his sister Cindy in the Bronx, Clive Campbell extended funk breaks on two turntables, the technique that formed the basis of hip-hop.",
  1, [W("Kool_Herc", "Kool Herc"), W("Hip-hop", "Hip-hop"), B("biography/Kool-Herc", "DJ Kool Herc")],
  P(40.84, -73.92, "The Bronx, New York", "The_Bronx"));
e("rappers-delight", "hip-hop", 1979.7, null, "1979", "Sugarhill Gang's “Rapper's Delight”",
  "Released in 1979 and produced by Sylvia Robinson, the Sugarhill Gang's debut single is widely considered the first significant hip-hop single.",
  2, [B("topic/Rappers-Delight", "Rapper's Delight"), W("Rapper's_Delight", "Rapper's Delight")],
  P(40.74, -74.17, "Englewood, New Jersey", "Englewood,_New_Jersey"));
e("the-message", "hip-hop", D(1982, 7, 1), null, "July 1, 1982", "Grandmaster Flash's “The Message”",
  "Released by Sugar Hill Records on July 1, 1982, the single was ranked NME's track of the year and showed rap could carry social commentary.",
  2, [W("The_Message_(Grandmaster_Flash_and_the_Furious_Five_song)", "The Message (Grandmaster Flash and the Furious Five song)"), B("topic/The-Message", "The Message")],
  P(40.84, -73.92, "The Bronx, New York", "The_Bronx"));
e("walk-this-way", "hip-hop", 1986.5, null, "1986", "Run-DMC remake “Walk This Way” with Aerosmith",
  "Run-DMC fused rap and rock in their remake of Aerosmith's song, bringing hip-hop to a wider mainstream audience.",
  2, [B("topic/Run-DMC", "Run-DMC")],
  P(40.71, -73.79, "Hollis, Queens", "Hollis,_Queens"));
e("illmatic", "hip-hop", D(1994, 4, 19), null, "April 19, 1994", "Nas releases Illmatic",
  "The debut album, released by Columbia Records, drew widespread acclaim for its poetic narration of hard-edged inner-city life.",
  2, [W("Illmatic", "Illmatic"), B("topic/Illmatic", "Illmatic")],
  P(40.76, -73.94, "Queensbridge, Queens", "Queensbridge"));
e("lamar-pulitzer", "hip-hop", 2018.3, null, "April 2018", "Kendrick Lamar wins the Pulitzer Prize for Music",
  "His album DAMN. earned the 2018 prize, the first time an artist outside the classical and jazz genres received the honor.",
  2, [W("Damn_(Kendrick_Lamar_album)", "Damn (Kendrick Lamar album)"), B("biography/Kendrick-Lamar", "Kendrick Lamar")],
  P(33.9, -118.08, "Compton, California", "Compton,_California"));

/* ---------------- The modern Olympic Games ---------------- */
e("ioc-founded", "modern-olympics", D(1894, 6, 23), null, "June 23, 1894", "Coubertin founds the International Olympic Committee",
  "Pierre de Coubertin created the IOC in Paris with Demetrios Vikelas as first president, to organize a modern revival of the Olympic Games.",
  1, [W("International_Olympic_Committee", "International Olympic Committee"), B("topic/International-Olympic-Committee", "International Olympic Committee")],
  P(48.85, 2.34, "Paris, France", "Paris"));
e("athens-1896", "modern-olympics", D(1896, 4, 6), null, "April 6, 1896", "First modern Olympic Games open in Athens",
  "The Games of the I Olympiad opened in the Panathenaic Stadium; American James Connolly became the first Olympic medalist in over 1,500 years.",
  1, [W("1896_Summer_Olympics", "1896 Summer Olympics"), B("event/Athens-1896-Olympic-Games", "Athens 1896 Olympic Games")],
  P(37.97, 23.74, "Panathenaic Stadium, Athens", "Panathenaic_Stadium"));
e("paris-1900-women", "modern-olympics", 1900.5, null, "1900", "Women compete at the Olympics for the first time",
  "Women competed in sailing, tennis and golf at the Paris Games. Sources name Hélène de Pourtalès, Charlotte Cooper or Margaret Abbott as the first female Olympic champion.",
  2, [W("1900_Summer_Olympics", "1900 Summer Olympics"), B("event/Paris-1900-Olympic-Games", "Paris 1900 Olympic Games")],
  P(48.86, 2.35, "Paris, France", "Paris"));
e("chamonix-1924", "modern-olympics", D(1924, 1, 25), D(1924, 2, 5), "January 25 – February 5, 1924", "Chamonix hosts the first Winter Games",
  "Held as an International Winter Sports Week, the competitions were later granted the status of the first Winter Olympics, and the IOC established the Winter Games in 1925.",
  2, [W("1924_Winter_Olympics", "1924 Winter Olympics"), B("event/Chamonix-1924-Olympic-Winter-Games", "Chamonix 1924 Olympic Winter Games")],
  P(45.92, 6.87, "Chamonix, France", "Chamonix"));
e("berlin-1936", "modern-olympics", 1936.6, null, "1936", "Berlin Games introduce the torch relay",
  "The Games were the first televised and first to feature a torch relay from Olympia. Jesse Owens won four gold medals as Germany led the medal table under Nazi rule.",
  2, [W("1936_Summer_Olympics", "1936 Summer Olympics"), B("event/Berlin-1936-Olympic-Games", "Berlin 1936 Olympic Games")],
  P(52.52, 13.24, "Olympiastadion, Berlin", "Olympiastadion_(Berlin)"));
e("rome-1960-paralympics", "modern-olympics", D(1960, 9, 18), D(1960, 9, 25), "September 18–25, 1960", "First Paralympic Games, Rome",
  "The Stoke Mandeville Games, retroactively designated the first Paralympics, drew 400 athletes from 23 countries and ran with the Olympics in Rome.",
  2, [B("topic/Paralympic-Games", "Paralympic Games"), W("1960_Summer_Paralympics", "1960 Summer Paralympics")],
  P(41.9, 12.5, "Rome, Italy", "Rome"));
e("los-angeles-1984", "modern-olympics", 1984.6, null, "1984", "Los Angeles Games turn a profit",
  "Using existing venues and private corporate sponsorship, the 1984 Games generated more than $200 million in profit despite a boycott by 14 Eastern Bloc countries.",
  2, [W("1984_Summer_Olympics", "1984 Summer Olympics"), B("event/Los-Angeles-1984-Olympic-Games", "Los Angeles 1984 Olympic Games")],
  P(34.05, -118.24, "Los Angeles, California", "Los_Angeles"));
e("rio-2016", "modern-olympics", 2016.6, null, "2016", "Rio hosts the first Games in South America",
  "The 2016 Games also saw the debut of the Refugee Olympic Team, which was formed because refugees could not compete for national teams in earlier Games.",
  2, [W("2016_Summer_Olympics", "2016 Summer Olympics"), B("event/Rio-de-Janeiro-2016-Olympic-Games", "Rio de Janeiro 2016 Olympic Games")],
  P(-22.91, -43.2, "Rio de Janeiro, Brazil", "Rio_de_Janeiro"));

/* ---------------- Association football ---------------- */
e("sheffield-fc", "association-football", D(1857, 10, 24), null, "October 24, 1857", "Sheffield F.C. founded",
  "Founded by Nathaniel Creswick and William Prest, it is regarded as the oldest continuous football club in the world. The founders drafted their own Sheffield Rules.",
  2, [W("Sheffield_F.C.", "Sheffield F.C."), X("Twelve Games of Christmas: The Rules Derby — National Football Museum", "https://nationalfootballmuseum.com/stories/12-games-1860/")],
  P(53.38, -1.47, "Sheffield, England", "Sheffield"));
e("fa-founded", "association-football", D(1863, 10, 26), null, "October 26, 1863", "The Football Association is founded in London",
  "Eleven London clubs and schools' representatives met at the Freemasons' Tavern to agree common rules; it is the ruling body for English football.",
  1, [W("The_Football_Association", "The Football Association"), B("sports/Football-Association", "Football Association")],
  P(51.516, -0.12, "Freemasons' Tavern, Great Queen Street, London", "Freemasons'_Hall,_London"));
e("first-international", "association-football", D(1872, 11, 30), null, "November 30, 1872", "Scotland and England play the first international match",
  "The two countries played at Hamilton Crescent in Partick, Glasgow, in what is described as the first official international football match.",
  2, [W("Scotland_national_football_team", "Scotland national football team"), X("Scottish FA marks 150 years since first international football game — Scottish FA", "https://www.scottishfa.co.uk/en/news/scottish-fa-marks-150-years-since-first-international-football-game")],
  P(55.87, -4.33, "Partick, Glasgow", "Partick"));
e("football-league", "association-football", 1888.3, null, "1888", "Football League formed",
  "Founded through the efforts of Aston Villa director William McGregor with twelve clubs, it is the oldest football league in the world.",
  2, [B("topic/Football-League", "English Football League"), W("The_Football_League", "The Football League")],
  P(52.6, -1.5, "Midlands, England", "Midlands", 120));
e("fifa-founded", "association-football", D(1904, 5, 21), null, "May 21, 1904", "FIFA founded in Paris",
  "Seven national associations, among them France, Belgium and Spain, founded FIFA in Paris to oversee international competition.",
  2, [W("FIFA", "FIFA"), B("topic/Federation-Internationale-de-Football-Association", "FIFA"), X("FIFA celebrates 120th anniversary of foundation in Paris — FIFA", "https://inside.fifa.com/organisation/media-releases/fifa-celebrates-120th-anniversary-of-foundation-in-paris")],
  P(48.865, 2.33, "Rue Saint-Honoré, Paris", "Rue_Saint-Honoré"));
e("world-cup-1930", "association-football", D(1930, 7, 13), D(1930, 7, 30), "July 13–30, 1930", "First FIFA World Cup in Uruguay",
  "Uruguay hosted the first World Cup, held during the centenary of its first constitution; the host team won the final in Montevideo.",
  1, [W("1930_FIFA_World_Cup", "1930 FIFA World Cup"), B("sports/World-Cup-football", "FIFA World Cup")],
  P(-34.9, -56.16, "Montevideo, Uruguay", "Montevideo"));
e("womens-world-cup-1991", "association-football", D(1991, 11, 16), D(1991, 11, 30), "November 16–30, 1991", "First FIFA Women's World Cup",
  "The inaugural women's world championship was held in Guangdong, China.",
  2, [W("1991_FIFA_Women's_World_Cup", "1991 FIFA Women's World Cup"), B("sports/Womens-World-Cup", "Women's World Cup")],
  P(23.13, 113.26, "Guangzhou, China", "Guangzhou"));
e("premier-league", "association-football", D(1992, 2, 20), null, "February 20, 1992", "The Premier League breaks away",
  "First Division clubs left the English Football League to found the FA Premier League, which grew into one of the world's richest football competitions.",
  2, [W("Premier_League", "Premier League"), B("topic/Premier-League", "Premier League")],
  P(51.5, -0.13, "London, England", "London"));
e("world-cup-2022", "association-football", D(2022, 11, 20), D(2022, 12, 18), "November 20 – December 18, 2022", "World Cup in Qatar, first in the Middle East",
  "Argentina beat France on penalties after a 3–3 draw in the final, in the first World Cup held in the Middle East.",
  2, [W("2022_FIFA_World_Cup", "2022 FIFA World Cup"), B("event/2022-FIFA-World-Cup", "2022 FIFA World Cup")],
  P(25.42, 51.49, "Lusail, Qatar", "Lusail"));

/* ---------------- Video games ---------------- */
e("tennis-for-two", "video-games", 1958.8, null, "1958", "Higinbotham's Tennis for Two",
  "Physicist William Higinbotham built the game at Brookhaven National Laboratory for a public exhibition; it is regarded as a forerunner of the modern video game.",
  2, [W("Tennis_for_Two", "Tennis for Two"), X("The First Video Game? — Brookhaven National Laboratory", "https://www.bnl.gov/about/history/firstvideo.php")],
  P(40.87, -72.88, "Brookhaven National Laboratory, New York", "Brookhaven_National_Laboratory"));
e("spacewar", "video-games", 1962.5, null, "1962", "Spacewar! is created at MIT",
  "Steve Russell, Martin Graetz and others made a space combat game to show off the PDP-1 minicomputer, spreading it among university computer labs.",
  2, [B("topic/Spacewar", "Spacewar!"), W("Spacewar!", "Spacewar!")],
  P(42.36, -71.09, "MIT, Cambridge, Massachusetts", "Massachusetts_Institute_of_Technology"));
e("magnavox-odyssey", "video-games", 1972.7, null, "September 1972", "Magnavox Odyssey, the first home console",
  "Developed by Ralph Baer at Sanders Associates and released in the US by Magnavox, the Odyssey was the first commercial home video game console.",
  2, [W("Magnavox_Odyssey", "Magnavox Odyssey"), X("Games On Your TV? — Computer History Museum", "https://www.computerhistory.org/revolution/story/190")],
  P(41.08, -85.14, "Fort Wayne, Indiana", "Fort_Wayne,_Indiana"));
e("pong", "video-games", 1972.9, null, "1972", "Atari's Pong becomes the first arcade hit",
  "Allan Alcorn made Pong for Atari co-founder Nolan Bushnell, basing it on a ping-pong game on the Odyssey; Atari sold more than 8,000 machines by 1974.",
  2, [W("Pong", "Pong"), B("topic/Pong", "Pong")],
  P(37.38, -122.03, "Sunnyvale, California", "Sunnyvale,_California"));
e("space-invaders", "video-games", D(1978, 7, 1), null, "July 1978", "Taito releases Space Invaders",
  "Tomohiro Nishikado's fixed shooter was released in Japan in July 1978 and overseas later that year, and it helped launch the golden age of arcade games.",
  2, [W("Space_Invaders", "Space Invaders"), B("topic/Space-Invaders", "Space Invaders")],
  P(35.68, 139.77, "Tokyo, Japan", "Tokyo"));
e("pac-man", "video-games", D(1980, 5, 22), null, "May 22, 1980", "Namco releases Pac-Man",
  "Designed by Toru Iwatani, the maze game first released in Japan on May 22, 1980, and in North America by Midway that October.",
  2, [W("Pac-Man", "Pac-Man"), B("topic/Pac-Man", "Pac-Man")],
  P(35.68, 139.77, "Tokyo, Japan", "Tokyo"));
e("crash-1983", "video-games", 1983, 1985, "1983–1985", "The video game crash",
  "A large-scale recession hit the US video game industry; revenue fell from billions of dollars in 1983 to about $100 million in 1985.",
  2, [W("Video_game_crash_of_1983", "Video game crash of 1983"), X("What Video Game Crash? — The Strong National Museum of Play", "https://www.museumofplay.org/blog/what-video-game-crash/")],
  P(39.5, -98.35, "United States", "United_States", 2500));
e("super-mario-bros", "video-games", 1985.7, null, "September 1985", "Super Mario Bros. released",
  "Nintendo's platform game, first issued in Japan for the Famicom in September 1985, became one of the best-selling games, with more than 40 million copies sold.",
  2, [B("topic/Super-Mario-Bros", "Super Mario Bros"), W("Super_Mario_Bros.", "Super Mario Bros.")],
  P(35.01, 135.77, "Kyoto, Japan", "Kyoto"));
e("minecraft", "video-games", D(2011, 11, 18), null, "November 18, 2011", "Minecraft formally released",
  "Created by Markus “Notch” Persson, who began work on it in 2009, Minecraft went on to become one of the best-selling games.",
  3, [W("Minecraft", "Minecraft"), B("topic/Minecraft-electronic-game", "Minecraft")],
  P(59.33, 18.07, "Stockholm, Sweden", "Stockholm"));

/* ---------------- Branches ---------------- */
const g = (lat, lon, label, src, r) => ({ scope: "region", lat, lon, r, label, src: "https://en.wikipedia.org/wiki/" + src });
const branches = [
  { id: "romanticism", name: "Romanticism", region: "culture", start: 1790, end: 1850, startWhen: "c. 1790s", endWhen: "c. 1850",
    parents: [], into: [],
    text: "A movement in literature, painting, music and thought from the late 18th to the mid-19th century that prized emotion and nature over classical order and rationalism.",
    cites: [B("art/Romanticism", "Romanticism"), W("Romanticism", "Romanticism")] },
  { id: "realism-impressionism", name: "Realism and Impressionism", region: "culture", start: 1840, end: 1900, startWhen: "c. 1840s", endWhen: "c. 1900",
    parents: [], into: [],
    text: "Painters from Courbet to Monet turned from history painting to everyday life and light, and Impressionists showed eight times together between 1874 and 1886.",
    cites: [W("Realism_(arts)", "Realism (arts)"), B("art/Impressionism-art", "Impressionism")] },
  { id: "modernism", name: "Modernism", region: "culture", start: 1890, end: 1950, startWhen: "c. 1890", endWhen: "mid-20th century",
    parents: [], into: [],
    text: "A period of experimentation in the arts from the late 19th to the mid-20th century, particularly after World War I, that broke with tradition in painting, music, literature and design.",
    cites: [B("art/modernism-art", "Modernism"), W("Modernism", "Modernism")] },
  { id: "photography", name: "Photography", region: "culture", start: 1826, end: null, startWhen: "1826/27", endWhen: null,
    parents: [], into: [],
    text: "Fixing images with light began with Niépce in 1826/27 and was announced publicly by the daguerreotype in 1839; it evolved from film to digital capture.",
    cites: [B("biography/Nicephore-Niepce", "Nicéphore Niépce"), W("Daguerreotype", "Daguerreotype")] },
  { id: "cinema", name: "Cinema", region: "culture", start: 1895, end: null, startWhen: "1895", endWhen: null,
    parents: [], into: [],
    text: "Motion pictures reached paying audiences with the Lumière screenings of December 1895 and grew into a global art form and industry.",
    cites: [B("topic/Lumiere-brothers", "Lumière brothers"), W("Lumière_brothers", "Lumière brothers")] },
  { id: "broadcasting", name: "Radio and television", region: "culture", start: 1920, end: null, startWhen: "1920", endWhen: null,
    parents: [], into: [],
    text: "Commercial radio began with KDKA in November 1920 and was followed by television, which Baird demonstrated in 1926 and the BBC offered as a regular service from 1936.",
    cites: [B("topic/KDKA", "KDKA"), W("BBC_Television_Service", "BBC Television Service")] },
  { id: "jazz-blues", name: "Jazz and blues", region: "culture", start: 1900, end: null, startWhen: "c. 1900s", endWhen: null,
    parents: [], into: [],
    text: "Blues was created by African Americans in the South before the turn of the 20th century; jazz developed partly from ragtime and blues, with African rhythms and European harmony.",
    cites: [B("art/blues-music", "Blues"), B("art/jazz", "Jazz")] },
  { id: "rock-pop", name: "Rock and popular music", region: "culture", start: 1950, end: null, startWhen: "1950s", endWhen: null,
    parents: [], into: [],
    text: "Rock emerged in the 1950s, growing from rhythm and blues, country and other forms, and shaped worldwide popular music through radio, records and television.",
    cites: [B("topic/rock-music", "Rock"), W("Rock_and_roll", "Rock and roll")] },
  { id: "hip-hop", name: "Hip hop", region: "culture", start: 1973, end: null, startWhen: "1973", endWhen: null,
    parents: [], into: [],
    text: "Hip-hop culture emerged from block parties in the Bronx, drawing on African American, Afro-Caribbean and Latino communities, with disco and funk records as its primary sources.",
    cites: [W("Hip-hop", "Hip-hop"), B("topic/hip-hop", "Hip-hop")] },
  { id: "modern-olympics", name: "The modern Olympic Games", region: "culture", start: 1896, end: null, startWhen: "1896", endWhen: null,
    parents: [], into: [],
    text: "The Olympic Games, which originated in ancient Greece, were revived in the late 19th century; the IOC was founded in 1894 and the first modern Games were held in Athens in 1896.",
    cites: [B("topic/Olympic-Games", "Olympic Games"), W("Modern_Olympic_Games", "Modern Olympic Games")] },
  { id: "association-football", name: "Association football", region: "culture", start: 1863, end: null, startWhen: "1863", endWhen: null,
    parents: [], into: [],
    text: "Football gained common rules with the founding of the English Football Association on October 26, 1863, and spread worldwide, with FIFA formed in 1904.",
    cites: [W("The_Football_Association", "The Football Association"), B("sports/Football-Association", "Football Association")] },
  { id: "video-games", name: "Video games", region: "culture", start: 1958, end: null, startWhen: "1958", endWhen: null,
    parents: [], into: [],
    text: "Interactive electronic games began in laboratories with Tennis for Two in 1958 and Spacewar! in 1962, and reached homes and arcades in the 1970s.",
    cites: [W("Tennis_for_Two", "Tennis for Two"), B("topic/Spacewar", "Spacewar!")] },
];

TL.add({ branches, events });

const origin = (id, note, links, cites) => TL.origin(id, { note, links, cites });
origin("romanticism",
  "Romanticism arose in Western Europe, in literature, painting and music, as an attitude that rejected the order, harmony and rationality of Classicism and Neoclassicism; it was also in part a reaction against the Enlightenment.",
  [{ id: "enlightenment", how: "reaction", note: "In part a reaction against the Enlightenment and 18th-century rationalism" }],
  [B("art/Romanticism", "Romanticism")]);
origin("realism-impressionism",
  "Realism began in mid-19th-century France as a reaction to Romanticism and history painting; Impressionism grew among painters who showed together in Paris from 1874.",
  [{ id: "romanticism", how: "reaction", note: "Realist painters rejected Romanticism, which then dominated French art and literature" }],
  [W("Realism_(arts)", "Realism (arts)"), W("Impressionism", "Impressionism")]);
origin("modernism",
  "Modernism grew in an era of industrialization, rapid social change and advances in science, and took a critical stance toward Enlightenment rationalism; some critics call it the apotheosis of romanticism.",
  [
    { id: "romanticism", how: "ideas", note: "Some critics see modernism as the apotheosis of romanticism" },
    { id: "enlightenment", how: "reaction", note: "Took a critical stance toward the Enlightenment concept of rationalism" },
    { id: "industrial-revolution", how: "context", note: "Arose in an era of industrialization and rapid social change" },
  ],
  [W("Modernism", "Modernism"), B("art/modernism-art", "Modernism")]);
origin("photography",
  "Photography grew from the camera obscura, known since antiquity, combined with chemical processes that fix an image on a plate or paper; Niépce, Daguerre and Talbot made the first practical processes.",
  [],
  [W("Photography", "Photography"), B("biography/Nicephore-Niepce", "Nicéphore Niépce")]);
origin("cinema",
  "Cinema grew from motion studies and projection experiments of the late 19th century, among them Muybridge's sequential photographs and his zoopraxiscope, a predecessor of modern cinema.",
  [{ id: "photography", how: "ideas", note: "Muybridge's sequential photographs and zoopraxiscope led toward motion pictures" }],
  [B("biography/Eadweard-Muybridge", "Eadweard Muybridge"), W("Eadweard_Muybridge", "Eadweard Muybridge")]);
origin("broadcasting",
  "Broadcasting began in the early 1920s with commercial radio stations such as KDKA in Pittsburgh, and developed mechanical and then electronic television in the 1920s and 1930s.",
  [],
  [B("topic/KDKA", "KDKA"), B("biography/John-Logie-Baird", "John Logie Baird")]);
origin("jazz-blues",
  "Blues was created by African Americans in the South before the turn of the 20th century; jazz was developed by African Americans, partly from ragtime and blues, with European harmonic structure and African rhythms.",
  [],
  [B("art/blues-music", "Blues"), B("art/jazz", "Jazz")]);
origin("rock-pop",
  "Rock and roll blended African American genres, mainly rhythm and blues, with influences from gospel, jazz, boogie-woogie, electric blues, jump blues, swing and folk music.",
  [{ id: "jazz-blues", how: "ideas", note: "Blended rhythm and blues, electric blues and jazz influences" }],
  [W("Rock_and_roll", "Rock and roll"), B("topic/rock-music", "Rock")]);
origin("hip-hop",
  "Hip-hop emerged from block parties in the Bronx with influences from African American, Afro-Caribbean and Latino communities; its primary sources were disco and funk records, which Kool Herc played.",
  [{ id: "jazz-blues", how: "ideas", note: "Rap is said to have drawn on talking blues songs, among other older oral forms" }],
  [W("Hip-hop", "Hip-hop"), W("Kool_Herc", "Kool Herc"), B("art/rap", "Rap")]);
origin("modern-olympics",
  "The modern Olympics revive the athletic festival of ancient Greece: Pierre de Coubertin founded the IOC in 1894, leading to the first modern Games in Athens in 1896.",
  [{ id: "ancient-greece", how: "ideas", note: "Revived the Olympic Games that originated in ancient Greece" }],
  [B("topic/Olympic-Games", "Olympic Games"), W("Modern_Olympic_Games", "Modern Olympic Games")]);
origin("association-football",
  "For centuries before the first meeting of the Football Association in 1863 there were no universally accepted rules for playing football; eleven London clubs and schools agreed common rules.",
  [],
  [W("The_Football_Association", "The Football Association")]);
origin("video-games",
  "Early video games were built on laboratory and university computers, such as the analog computer behind Tennis for Two and the PDP-1 minicomputer behind Spacewar!.",
  [{ id: "computing", how: "context", note: "Spacewar! was written to show off the PDP-1 minicomputer at MIT" }],
  [B("topic/Spacewar", "Spacewar!"), W("Tennis_for_Two", "Tennis for Two")]);

// Locations
for (const [id, geo] of geos) TL.geo(id, geo);
TL.geo("romanticism", g(50.5, 10, "Western Europe", "Germany", 1500));
TL.geo("realism-impressionism", g(48.86, 2.34, "France", "France", 700));
TL.geo("modernism", g(48.86, 2.34, "Paris and Europe", "Paris", 2000));
TL.geo("photography", { scope: "global" });
TL.geo("cinema", { scope: "global" });
TL.geo("broadcasting", { scope: "global" });
TL.geo("jazz-blues", g(30.0, -90.1, "New Orleans, Louisiana", "New_Orleans", 1200));
TL.geo("rock-pop", { scope: "global" });
TL.geo("hip-hop", g(40.84, -73.92, "The Bronx, New York", "The_Bronx", 300));
TL.geo("modern-olympics", { scope: "global" });
TL.geo("association-football", { scope: "global" });
TL.geo("video-games", { scope: "global" });
