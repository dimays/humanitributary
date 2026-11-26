// W3-04 fill: Holy Roman Empire, Kingdom of Ireland, medieval Poland, Lithuania, Muscovy, Navarre, Polish–Lithuanian Commonwealth, Portugal, the Renaissance, 1500–1800. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };
TL.add({ events: [
  // Holy Roman Empire
  { id: "w304-bach-matthew-passion", branch: "hre", y: D(1727, 4, 11), when: "probably April 11, 1727", imp: 3,
    title: "Bach's St Matthew Passion first sung in Leipzig",
    text: "J. S. Bach's setting of chapters 26–27 of Matthew for double choir and double orchestra was probably first performed on Good Friday 1727 at St. Thomas Church, Leipzig; some sources say 1729.",
    cites: [W("St_Matthew_Passion", "St Matthew Passion"), { t: "BWV 244 St Matthew Passion — Bach Cantatas Website", u: "https://www.bach-cantatas.com/Vocal/BWV244.htm" }] },
  { id: "w304-maria-theresa-succeeds", branch: "hre", y: D(1740, 10, 20), when: "October 20, 1740", imp: 2,
    title: "Maria Theresa inherits the Habsburg lands",
    text: "Charles VI died without a son and his daughter succeeded under the Pragmatic Sanction; within months Frederick II of Prussia invaded Silesia, beginning the War of the Austrian Succession.",
    cites: [B("biography/Maria-Theresa", "Maria Theresa"), W("Maria_Theresa", "Maria Theresa")] },
  { id: "w304-werther", branch: "hre", y: D(1774, 9, 29), when: "1774", imp: 3,
    title: "Goethe publishes The Sorrows of Young Werther",
    text: "Written in about five weeks by the 24-year-old Johann Wolfgang Goethe and issued anonymously at Leipzig, the novel was a Sturm und Drang landmark and an immediate international bestseller.",
    cites: [B("topic/The-Sorrows-of-Young-Werther", "The Sorrows of Young Werther"), W("The_Sorrows_of_Young_Werther", "The Sorrows of Young Werther")] },
  // Kingdom of Ireland
  { id: "w304-trinity-college-dublin", branch: "kingdom-of-ireland", y: 1592, when: "1592", imp: 2,
    title: "Elizabeth I founds Trinity College Dublin",
    text: "A royal charter created Ireland's oldest university on the site of a dissolved priory; its library later came to hold the Book of Kells.",
    cites: [B("topic/Trinity-College-Dublin", "Trinity College Dublin"), W("Trinity_College_Dublin", "Trinity College Dublin")] },
  { id: "w304-kinsale", branch: "kingdom-of-ireland", y: D(1601, 12, 24), when: "December 24, 1601 (Old Style)", imp: 2,
    title: "English victory at Kinsale breaks the Irish rebellion",
    text: "Lord Deputy Mountjoy defeated Hugh O'Neill's and Hugh Roe O'Donnell's army, which had marched south to relieve a Spanish force besieged at Kinsale; Gaelic resistance collapsed soon after.",
    cites: [B("event/Kinsale", "Kinsale"), W("Battle_of_Kinsale", "Battle of Kinsale")] },
  { id: "w304-flight-of-the-earls", branch: "kingdom-of-ireland", y: D(1607, 9, 14), when: "September 14, 1607", imp: 2,
    title: "Flight of the Earls",
    text: "Hugh O'Neill of Tyrone and Rory O'Donnell of Tyrconnell sailed from Lough Swilly with about 100 followers; their departure opened the way to the Plantation of Ulster.",
    cites: [B("place/Ireland/James-I-1603-25", "Ireland: James I (1603–25)"), W("Flight_of_the_Earls", "Flight of the Earls")] },
  { id: "w304-four-masters", branch: "kingdom-of-ireland", y: 1632, end: 1636, when: "1632–1636", imp: 2,
    title: "Four Masters compile the Annals of Ireland",
    text: "Led by the Franciscan friar Mícheál Ó Cléirigh, scholars of the Gaelic learned tradition compiled a chronicle of Irish history from antiquity to 1616, preserving earlier annals at a time when Gaelic patronage was vanishing.",
    cites: [B("topic/Annals-of-the-Four-Masters", "Annals of the Four Masters"), W("Annals_of_the_Four_Masters", "Annals of the Four Masters")] },
  { id: "w304-rising-1641", branch: "kingdom-of-ireland", y: D(1641, 10, 23), when: "October 23, 1641", imp: 2,
    title: "Irish Rebellion of 1641",
    text: "Catholic gentry rose in Ulster after a plot to seize Dublin Castle failed; the rising spread, Catholic bishops and nobles created Confederate Ireland in 1642, and a decade of war followed.",
    cites: [W("Irish_Rebellion_of_1641", "Irish Rebellion of 1641"), B("biography/Phelim-ONeill", "Phelim O'Neill")] },
  { id: "w304-down-survey", branch: "kingdom-of-ireland", y: 1655, end: 1656, when: "1655–1656 (sources vary)", imp: 3,
    title: "William Petty's Down Survey maps Ireland",
    text: "Using about a thousand mostly ex-soldier surveyors, Petty mapped parishes and townlands of confiscated land so it could be redistributed after the Cromwellian conquest.",
    cites: [W("Down_Survey", "Down Survey"), { t: "The Down Survey of Ireland — downsurvey.ie", u: "https://downsurvey.ie/" }] },
  { id: "w304-boyne", branch: "kingdom-of-ireland", y: D(1690, 7, 11), when: "July 1, 1690 (Old Style)", imp: 2,
    title: "William III defeats James II at the Boyne",
    text: "William's roughly 36,000 men beat James's 23,000 near Drogheda; James fled to France, though war in Ireland continued until the Treaty of Limerick in 1691.",
    cites: [B("event/Battle-of-the-Boyne", "Battle of the Boyne"), W("Battle_of_the_Boyne", "Battle of the Boyne")] },
  { id: "w304-gullivers-travels", branch: "kingdom-of-ireland", y: D(1726, 10, 28), when: "October 28, 1726", imp: 2,
    title: "Swift publishes Gulliver's Travels",
    text: "Jonathan Swift, Anglo-Irish clergyman and dean of St. Patrick's in Dublin, saw his satire published anonymously in London; it was an instant success.",
    cites: [B("biography/Jonathan-Swift", "Jonathan Swift"), W("Gulliver%27s_Travels", "Gulliver's Travels")] },
  { id: "w304-grattans-parliament", branch: "kingdom-of-ireland", y: 1782.4, when: "April–June 1782", imp: 2,
    title: "Legislative independence won by Grattan's Parliament",
    text: "After Volunteers' pressure, Henry Grattan carried a Declaration of Irish Rights, and Westminster repealed the Declaratory Act of 1719; the Irish Parliament lasted until the Acts of Union took effect in 1801.",
    cites: [B("biography/Henry-Grattan", "Henry Grattan"), W("Constitution_of_1782", "Constitution of 1782")] },
  // Medieval Poland
  { id: "w304-nihil-novi", branch: "kingdom-of-poland", y: 1505.4, when: "1505", imp: 2,
    title: "Nihil novi requires Sejm consent for new laws",
    text: "At the Radom Sejm King Alexander agreed that nothing new would be decided without the common consent of senators and land deputies, a milestone in the rise of the nobles' parliament.",
    cites: [W("Nihil_novi", "Nihil novi"), B("topic/Nihil-novi", "Nihil Novi")] },
  { id: "w304-wawel-rebuilding", branch: "kingdom-of-poland", y: 1507, end: 1536, when: "1507–1536", imp: 3,
    title: "Wawel Castle rebuilt in Italian Renaissance style",
    text: "Sigismund I, with Florentine architects Francesco della Lora and Bartolommeo Berrecci, rebuilt the royal residence at Kraków with arcaded loggias, spreading the Italian Renaissance in Poland.",
    cites: [B("place/Wawel-Castle", "Wawel Castle"), W("Wawel_Castle", "Wawel Castle")] },
  { id: "w304-prussian-homage", branch: "kingdom-of-poland", y: D(1525, 4, 10), when: "April 10, 1525", imp: 2,
    title: "Prussian Homage at Kraków",
    text: "Albert, last grand master of the Teutonic Order, became a Lutheran and a secular duke of Prussia, doing homage to King Sigismund I and ending the Order's rule there.",
    cites: [B("biography/Albert-duke-of-Prussia", "Albert"), W("Prussian_Homage", "Prussian Homage")] },
  // Lithuania
  { id: "w304-orsha", branch: "lithuania", y: D(1514, 9, 8), when: "September 8, 1514", imp: 2, link: "muscovy",
    title: "Lithuanian victory over Muscovy at Orsha",
    text: "Hetman Konstanty Ostrogski's army beat a Muscovite force, halting its advance for years, though Lithuania did not recover Smolensk, taken that summer.",
    cites: [W("Battle_of_Orsha", "Battle of Orsha"), B("biography/Vasily-III", "Vasily III")] },
  { id: "w304-first-lithuanian-statute", branch: "lithuania", y: 1529, when: "1529", imp: 3,
    title: "First Statute of Lithuania takes effect",
    text: "Written in Ruthenian, the code of 13 chapters unified the Grand Duchy's law; revised in 1566 and 1588, it governed Lithuanian lands long after the Union of Lublin.",
    cites: [W("Statutes_of_Lithuania", "Statutes of Lithuania"), { t: "Statutes of the Grand Duchy of Lithuania — SESDIVA", u: "https://sesdiva.eu/en/virtual-rooms/cultural-exchange/item/200-tatutes-grand-duchy-lithuania-en" }] },
  { id: "w304-brest-bible", branch: "lithuania", y: 1563, when: "1563", imp: 3,
    title: "Radziwiłł's Brest Bible printed",
    text: "Sponsored by Prince Mikołaj Radziwiłł, Calvinist scholars produced the first complete Protestant Bible in Polish, translated from the original languages and printed at Brest.",
    cites: [B("topic/Brest-Bible", "Brest Bible"), W("Brest_Bible", "Brest Bible")] },
  // Muscovy
  { id: "w304-archangel-cathedral", branch: "muscovy", y: 1505, end: 1508, when: "1505–1508", imp: 3,
    title: "Archangel Cathedral built in the Kremlin",
    text: "Ivan III commissioned Italian architects, led by Aloisio the New, to build it with Renaissance details; it became the burial church of Muscovy's rulers.",
    cites: [W("Cathedral_of_the_Archangel", "Cathedral of the Archangel"), B("place/Archangel-Cathedral", "Archangel Cathedral")] },
  { id: "w304-smolensk", branch: "muscovy", y: D(1514, 7, 31), when: "July 31, 1514", imp: 2, link: "lithuania",
    title: "Vasily III captures Smolensk",
    text: "After failed sieges in 1513, Moscow's artillery forced the Lithuanian garrison to surrender the fortress, held by Moscow until the 1609–1611 siege.",
    cites: [B("biography/Vasily-III", "Vasily III"), W("Siege_of_Smolensk_(1514)", "Siege of Smolensk (1514)")] },
  { id: "w304-third-rome", branch: "muscovy", y: 1520, when: "c. 1514–1524 (dating debated)", imp: 3,
    title: "Philotheus declares Moscow the Third Rome",
    text: "The monk Philotheus of Pskov wrote to the grand prince that two Romes had fallen, the third stood and a fourth would not be, shaping Muscovite ideas of Orthodox leadership.",
    cites: [B("biography/Philotheus", "Philotheus"), W("Moscow,_third_Rome", "Moscow, third Rome")] },
  { id: "w304-kolomenskoye-church", branch: "muscovy", y: 1532, when: "1532", imp: 3,
    title: "Church of the Ascension at Kolomenskoye",
    text: "The first stone church with a tent-like roof, it marked the long-awaited birth of an heir, the future Ivan the Terrible; UNESCO inscribed it in 1994.",
    cites: [B("place/Kolomenskoye", "Kolomenskoye"), W("Church_of_the_Ascension,_Kolomenskoye", "Church of the Ascension, Kolomenskoye")] },
  // Navarre
  { id: "w304-heptameron", branch: "navarre", y: 1558, when: "1558–1559", imp: 3,
    title: "Marguerite de Navarre's Heptaméron published",
    text: "The unfinished collection of 72 tales framed like Boccaccio's Decameron appeared posthumously, first as Histoires des amans fortunez (1558) and as Heptaméron in 1559.",
    cites: [B("biography/Margaret-of-Angouleme", "Margaret of Angoulême"), W("Heptam%C3%A9ron", "Heptaméron")] },
  { id: "w304-jeanne-calvinism", branch: "navarre", y: D(1560, 12, 25), when: "Christmas Day 1560", imp: 2,
    title: "Queen Jeanne d'Albret embraces Calvinism",
    text: "Queen of Navarre since 1555, Jeanne publicly adopted Calvin's teachings and later declared Calvinism the kingdom's official religion, banning Catholic ritual.",
    cites: [B("biography/Jeanne-dAlbret", "Jeanne d'Albret"), W("Jeanne_d%27Albret", "Jeanne d'Albret")] },
  { id: "w304-navarre-wedding-1572", branch: "navarre", y: D(1572, 8, 18), when: "August 18, 1572", imp: 2,
    title: "Henry of Navarre marries Margaret of Valois",
    text: "Henry, who had become king of Navarre that June, wed the French king's sister in Paris; days later the St. Bartholomew's Day massacre began and he saved himself by pledging to convert.",
    cites: [W("St._Bartholomew%27s_Day_massacre", "St. Bartholomew's Day massacre"), B("biography/Henry-IV-king-of-France", "Henry IV")] },
  { id: "w304-henry-iv-succeeds", branch: "navarre", y: D(1589, 8, 2), when: "August 2, 1589", imp: 2,
    title: "Henry of Navarre becomes Henry IV of France",
    text: "When Henry III was assassinated, the Protestant king of Navarre inherited the French throne as the first Bourbon king, rejoining northern Navarre to France in personal union.",
    cites: [B("biography/Henry-IV-king-of-France", "Henry IV"), W("Henry_IV_of_France", "Henry IV of France")] },
  // Polish–Lithuanian Commonwealth
  { id: "w304-kochanowski-laments", branch: "polish-lithuanian", y: 1580, when: "1580", imp: 2,
    title: "Kochanowski's Laments mourn his daughter",
    text: "Jan Kochanowski's cycle of 19 elegies on the death of his daughter Urszula, praised as the peak of his poetry, set a lasting model for Polish verse.",
    cites: [B("biography/Jan-Kochanowski", "Jan Kochanowski"), W("Jan_Kochanowski", "Jan Kochanowski")] },
  { id: "w304-union-of-brest", branch: "polish-lithuanian", y: 1596, when: "1595–1596", imp: 2,
    title: "Union of Brest creates the Ruthenian Uniate Church",
    text: "Orthodox bishops of the Ruthenian lands, backed by Sigismund III, accepted Rome's authority while keeping their rite, splitting the Church of Rus' into Greek Catholic and Orthodox camps.",
    cites: [W("Union_of_Brest", "Union of Brest"), B("topic/Ukrainian-Greek-Catholic-Church", "Ukrainian Greek Catholic Church")] },
  { id: "w304-klushino", branch: "polish-lithuanian", y: D(1610, 7, 4), when: "July 4, 1610", imp: 2,
    title: "Żółkiewski wins at Klushino and enters Moscow",
    text: "Hetman Stanisław Żółkiewski routed a larger Russian army; boyars then proclaimed Sigismund III's son Władysław tsar and a Polish garrison held Moscow for about a year.",
    cites: [B("event/Battle-of-Klushino", "Battle of Klushino"), W("Battle_of_Klushino", "Battle of Klushino")] },
  { id: "w304-khmelnytsky-uprising", branch: "polish-lithuanian", y: D(1648, 1, 25), when: "1648", imp: 2,
    title: "Khmelnytsky Uprising begins",
    text: "Cossack hetman Bohdan Khmelnytsky and Crimean Tatar allies crushed Polish armies at Zhovti Vody, Korsun and Pyliavtsi, founding the Cossack Hetmanate and shaking the Commonwealth.",
    cites: [B("biography/Bohdan-Khmelnytsky", "Bohdan Khmelnytsky"), W("Khmelnytsky_Uprising", "Khmelnytsky Uprising")] },
  { id: "w304-liberum-veto", branch: "polish-lithuanian", y: 1652, when: "1652", imp: 2,
    title: "Liberum veto used to dissolve the Sejm",
    text: "Deputy Władysław Siciński's objection ended a Sejm session; the principle that one noble could void a Sejm's laws later paralyzed the Commonwealth until the 1791 Constitution banned it.",
    cites: [B("topic/liberum-veto", "liberum veto"), W("Liberum_veto", "Liberum veto")] },
  { id: "w304-the-deluge", branch: "polish-lithuanian", y: 1655.5, end: 1660.3, when: "1655–1660", imp: 2,
    title: "The Swedish Deluge",
    text: "Charles X Gustav's armies occupied much of the Commonwealth in 1655; the Jasna Góra monastery withstood a Swedish siege, and the Treaty of Oliva ended the war in 1660.",
    cites: [W("Second_Northern_War", "Second Northern War"), B("event/Treaty-of-Oliva", "Treaty of Oliva")] },
  { id: "w304-commission-of-national-education", branch: "polish-lithuanian", y: D(1773, 10, 14), when: "October 14, 1773", imp: 2,
    title: "Commission of National Education founded",
    text: "Using former Jesuit property, the Sejm created what is called Europe's first education ministry, which supervised two universities and hundreds of schools and wrote new Polish-language textbooks.",
    cites: [W("Commission_of_National_Education", "Commission of National Education"), B("biography/Hugo-Kollataj", "Hugo Kołłątaj")] },
  { id: "w304-constitution-3-may", branch: "polish-lithuanian", y: D(1791, 5, 3), when: "May 3, 1791", imp: 1,
    title: "Constitution of May 3 adopted",
    text: "The Great Sejm enacted what is described as Europe's first modern codified constitution, banning the liberum veto and making the throne hereditary; Russia and the Targowica Confederation overturned it in 1792–93.",
    cites: [W("Constitution_of_3_May_1791", "Constitution of 3 May 1791"), B("biography/Hugo-Kollataj", "Hugo Kołłątaj")] },
  { id: "w304-kosciuszko-uprising", branch: "polish-lithuanian", y: D(1794, 3, 24), when: "March 24, 1794", imp: 2,
    title: "Kościuszko Uprising begins",
    text: "Tadeusz Kościuszko proclaimed the national insurrection in Kraków and won at Racławice, but Russian victories in autumn led to the Third Partition in 1795.",
    cites: [B("biography/Tadeusz-Kosciuszko", "Tadeusz Kosciuszko"), W("Ko%C5%9Bciuszko_Uprising", "Kościuszko Uprising")] },
  // Portugal
  { id: "w304-jeronimos-begun", branch: "portugal", y: D(1501, 1, 6), end: 1601, when: "begun January 6, 1501; completed 1601", imp: 2,
    title: "Jerónimos Monastery begun at Belém",
    text: "Manuel I funded this showpiece of Manueline architecture, with nautical carved ornament, from a tax on Asian and African trade; Vasco da Gama's tomb lies inside.",
    cites: [B("place/Jeronimos-Monastery", "Jerónimos Monastery"), W("Jer%C3%B3nimos_Monastery", "Jerónimos Monastery")] },
  { id: "w304-lusiadas", branch: "portugal", y: 1572, when: "1572", imp: 2,
    title: "Camões publishes Os Lusíadas",
    text: "Luís de Camões's ten-canto epic recounts Vasco da Gama's voyage to India and is regarded as Portugal's national epic.",
    cites: [B("topic/The-Lusiads", "The Lusiads"), W("Os_Lus%C3%ADadas", "Os Lusíadas")] },
  { id: "w304-alcacer-quibir", branch: "portugal", y: D(1578, 8, 4), when: "August 4, 1578", imp: 2,
    title: "King Sebastian lost at Alcácer Quibir",
    text: "A Moroccan army crushed the Portuguese in northern Morocco and Sebastian vanished; the succession crisis led to Philip II of Spain taking the crown in 1580.",
    cites: [B("biography/Sebastian-king-of-Portugal", "Sebastian"), W("Battle_of_Alc%C3%A1cer_Quibir", "Battle of Alcácer Quibir")] },
  { id: "w304-peregrinacao", branch: "portugal", y: 1614, when: "1614", imp: 3,
    title: "Mendes Pinto's Peregrinação published",
    text: "The posthumous memoir of Fernão Mendes Pinto's wanderings through India, Malacca, China and Japan became a classic of Portuguese literature, though its accuracy is debated.",
    cites: [B("biography/Fernao-Mendes-Pinto", "Fernão Mendes Pinto"), W("Peregrina%C3%A7%C3%A3o", "Peregrinação")] },
  { id: "w304-restoration-1640", branch: "portugal", y: D(1640, 12, 1), when: "December 1, 1640", imp: 1,
    title: "Restoration: Portugal acclaims John IV",
    text: "Conspirators in Lisbon proclaimed the Duke of Braganza king, ending sixty years of union with Spain; a war of restoration followed until Spain recognized the new dynasty in 1668.",
    cites: [B("biography/John-IV-king-of-Portugal", "John IV"), W("Portuguese_Restoration_War", "Portuguese Restoration War")] },
  { id: "w304-mafra-palace", branch: "portugal", y: 1717, end: 1735, when: "1717–1735", imp: 3,
    title: "John V builds the Palace of Mafra",
    text: "Funded largely by Brazilian gold and diamonds, the Baroque palace, basilica and convent complex was begun as thanks for the birth of an heir; its library holds more than 36,000 volumes.",
    cites: [B("place/Mafra", "Mafra"), W("Mafra_National_Palace", "Mafra National Palace")] },
  { id: "w304-lisbon-earthquake", branch: "portugal", y: D(1755, 11, 1), when: "November 1, 1755", imp: 1,
    title: "Great Lisbon earthquake",
    text: "On All Saints' Day an earthquake, tsunami and fires killed tens of thousands; Pombal rebuilt the Baixa on a new plan, and Voltaire used the disaster to challenge optimism.",
    cites: [B("event/Lisbon-earthquake-of-1755", "Lisbon earthquake of 1755"), W("1755_Lisbon_earthquake", "1755 Lisbon earthquake")] },
  // The Renaissance
  { id: "w304-mona-lisa", branch: "renaissance", y: 1503, when: "begun c. 1503", imp: 2,
    title: "Leonardo begins the Mona Lisa",
    text: "Leonardo da Vinci was painting a portrait of Lisa del Giocondo in Florence by October 1503; he took it to France, and it hangs in the Louvre.",
    cites: [B("topic/Mona-Lisa-painting", "Mona Lisa"), W("Mona_Lisa", "Mona Lisa")] },
  { id: "w304-sistine-ceiling", branch: "renaissance", y: 1508, end: 1512, when: "1508–1512", imp: 1,
    title: "Michelangelo paints the Sistine Chapel ceiling",
    text: "Commissioned by Pope Julius II, the fresco, with nine Genesis scenes including The Creation of Adam, was unveiled on October 31, 1512 and is a cornerstone of High Renaissance art.",
    cites: [W("Sistine_Chapel_ceiling", "Sistine Chapel ceiling"), B("topic/Sistine-Chapel", "Sistine Chapel")] },
  { id: "w304-the-prince", branch: "renaissance", y: 1513, when: "1513", imp: 2,
    title: "Machiavelli writes The Prince",
    text: "Banished from public life after the Medici returned to Florence, Niccolò Machiavelli wrote a treatise on winning and holding power; it was printed in 1532.",
    cites: [B("topic/The-Prince", "The Prince"), W("The_Prince", "The Prince")] },
  { id: "w304-book-of-the-courtier", branch: "renaissance", y: 1528, when: "1528", imp: 3,
    title: "Castiglione's Book of the Courtier published",
    text: "Baldassare Castiglione's dialogue on the ideal courtier's manners and ethics became a model of Renaissance etiquette across Europe.",
    cites: [B("biography/Baldassare-Castiglione", "Baldassare Castiglione"), W("The_Book_of_the_Courtier", "The Book of the Courtier")] },
  { id: "w304-vasari-lives", branch: "renaissance", y: 1550, when: "1550", imp: 2,
    title: "Vasari publishes the Lives of the Artists",
    text: "Giorgio Vasari's Florentine biographies of painters, sculptors and architects, expanded in 1568, are called the first important book on art history and shaped how the Renaissance is seen.",
    cites: [B("biography/Giorgio-Vasari", "Giorgio Vasari"), W("Lives_of_the_Most_Excellent_Painters,_Sculptors,_and_Architects", "Lives of the Most Excellent Painters, Sculptors, and Architects")] },
  { id: "w304-palladio-four-books", branch: "renaissance", y: 1570, when: "1570", imp: 2,
    title: "Palladio's Four Books of Architecture",
    text: "Andrea Palladio's illustrated treatise, published in Venice, spread his classical villa designs; Palladian style reached Britain and North America, and Thomas Jefferson called the book his Bible.",
    cites: [B("biography/Andrea-Palladio", "Andrea Palladio"), W("I_quattro_libri_dell%27architettura", "I quattro libri dell'architettura")] },
  { id: "w304-teatro-olimpico", branch: "renaissance", y: D(1585, 3, 3), when: "March 3, 1585", imp: 3,
    title: "Teatro Olimpico opens in Vicenza",
    text: "Designed by Palladio and finished by Scamozzi after his death in 1580, it opened with Sophocles' Oedipus Rex and keeps the oldest surviving stage set, with its perspective streets.",
    cites: [B("topic/Teatro-Olimpico", "Teatro Olimpico"), W("Teatro_Olimpico", "Teatro Olimpico")] },
  { id: "w304-don-quixote", branch: "renaissance", y: D(1605, 1, 16), when: "January 16, 1605", imp: 1,
    title: "Cervantes publishes Don Quixote",
    text: "The first part of Cervantes's novel, followed by a second in 1615, turned away from chivalric romance toward psychologically drawn characters and is often called the first modern novel.",
    cites: [B("topic/Don-Quixote-novel", "Don Quixote"), W("Don_Quixote", "Don Quixote")] },
] });
TL.geo("w304-bach-matthew-passion", { scope: "place", lat: 51.34, lon: 12.37, r: 40, label: "Leipzig, Germany", src: "https://en.wikipedia.org/wiki/Leipzig" });
TL.geo("w304-maria-theresa-succeeds", { scope: "place", lat: 48.21, lon: 16.37, r: 40, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
TL.geo("w304-werther", { scope: "place", lat: 51.34, lon: 12.37, r: 40, label: "Leipzig, Germany", src: "https://en.wikipedia.org/wiki/Leipzig" });
TL.geo("w304-trinity-college-dublin", { scope: "place", lat: 53.35, lon: -6.26, r: 30, label: "Dublin, Ireland", src: "https://en.wikipedia.org/wiki/Dublin" });
TL.geo("w304-kinsale", { scope: "place", lat: 51.71, lon: -8.52, r: 40, label: "Kinsale, Ireland", src: "https://en.wikipedia.org/wiki/Kinsale" });
TL.geo("w304-flight-of-the-earls", { scope: "place", lat: 55.09, lon: -7.54, r: 40, label: "Rathmullan, Ireland", src: "https://en.wikipedia.org/wiki/Rathmullan" });
TL.geo("w304-four-masters", { scope: "place", lat: 54.48, lon: -8.28, r: 50, label: "Bundoran, Ireland", src: "https://en.wikipedia.org/wiki/Bundoran" });
TL.geo("w304-rising-1641", { scope: "place", lat: 54.5, lon: -6.77, r: 80, label: "Dungannon, Ireland", src: "https://en.wikipedia.org/wiki/Dungannon" });
TL.geo("w304-down-survey", { scope: "region", lat: 53.45, lon: -7.5, r: 250, label: "Ireland", src: "https://en.wikipedia.org/wiki/Ireland" });
TL.geo("w304-boyne", { scope: "place", lat: 53.72, lon: -6.42, r: 40, label: "Boyne, near Drogheda, Ireland", src: "https://en.wikipedia.org/wiki/Battle_of_the_Boyne" });
TL.geo("w304-gullivers-travels", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w304-grattans-parliament", { scope: "place", lat: 53.35, lon: -6.26, r: 30, label: "Dublin, Ireland", src: "https://en.wikipedia.org/wiki/Dublin" });
TL.geo("w304-nihil-novi", { scope: "place", lat: 51.4, lon: 21.15, r: 40, label: "Radom, Poland", src: "https://en.wikipedia.org/wiki/Radom" });
TL.geo("w304-wawel-rebuilding", { scope: "place", lat: 50.054, lon: 19.935, r: 30, label: "Wawel Castle, Kraków", src: "https://en.wikipedia.org/wiki/Wawel_Castle" });
TL.geo("w304-prussian-homage", { scope: "place", lat: 50.06, lon: 19.94, r: 30, label: "Kraków, Poland", src: "https://en.wikipedia.org/wiki/Krak%C3%B3w" });
TL.geo("w304-orsha", { scope: "place", lat: 54.51, lon: 30.42, r: 40, label: "Orsha, Belarus", src: "https://en.wikipedia.org/wiki/Orsha" });
TL.geo("w304-first-lithuanian-statute", { scope: "place", lat: 54.69, lon: 25.28, r: 40, label: "Vilnius, Lithuania", src: "https://en.wikipedia.org/wiki/Vilnius" });
TL.geo("w304-brest-bible", { scope: "place", lat: 52.13, lon: 23.66, r: 40, label: "Brest, Belarus", src: "https://en.wikipedia.org/wiki/Brest,_Belarus" });
TL.geo("w304-archangel-cathedral", { scope: "place", lat: 55.75, lon: 37.62, r: 30, label: "Moscow Kremlin", src: "https://en.wikipedia.org/wiki/Moscow_Kremlin" });
TL.geo("w304-smolensk", { scope: "place", lat: 54.78, lon: 32.05, r: 40, label: "Smolensk, Russia", src: "https://en.wikipedia.org/wiki/Smolensk" });
TL.geo("w304-third-rome", { scope: "place", lat: 57.82, lon: 28.33, r: 40, label: "Pskov, Russia", src: "https://en.wikipedia.org/wiki/Pskov" });
TL.geo("w304-kolomenskoye-church", { scope: "place", lat: 55.667, lon: 37.668, r: 30, label: "Kolomenskoye, Moscow", src: "https://en.wikipedia.org/wiki/Kolomenskoye" });
TL.geo("w304-heptameron", { scope: "place", lat: 48.86, lon: 2.35, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w304-jeanne-calvinism", { scope: "place", lat: 43.3, lon: -0.37, r: 40, label: "Pau, France", src: "https://en.wikipedia.org/wiki/Pau,_Pyr%C3%A9n%C3%A9es-Atlantiques" });
TL.geo("w304-navarre-wedding-1572", { scope: "place", lat: 48.86, lon: 2.35, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w304-henry-iv-succeeds", { scope: "place", lat: 48.84, lon: 2.22, r: 30, label: "Saint-Cloud, France", src: "https://en.wikipedia.org/wiki/Saint-Cloud" });
TL.geo("w304-kochanowski-laments", { scope: "place", lat: 51.4, lon: 21.6, r: 40, label: "Czarnolas, Poland", src: "https://en.wikipedia.org/wiki/Czarnolas" });
TL.geo("w304-union-of-brest", { scope: "place", lat: 52.13, lon: 23.66, r: 40, label: "Brest, Belarus", src: "https://en.wikipedia.org/wiki/Brest,_Belarus" });
TL.geo("w304-klushino", { scope: "place", lat: 55.66, lon: 34.93, r: 40, label: "Klushino, Smolensk Oblast, Russia", src: "https://en.wikipedia.org/wiki/Battle_of_Klushino" });
TL.geo("w304-khmelnytsky-uprising", { scope: "place", lat: 47.82, lon: 35.1, r: 100, label: "Khortytsia, Ukraine", src: "https://en.wikipedia.org/wiki/Khortytsia" });
TL.geo("w304-liberum-veto", { scope: "place", lat: 52.23, lon: 21.01, r: 40, label: "Warsaw, Poland", src: "https://en.wikipedia.org/wiki/Warsaw" });
TL.geo("w304-the-deluge", { scope: "place", lat: 50.8, lon: 19.12, r: 100, label: "Częstochowa, Poland", src: "https://en.wikipedia.org/wiki/Cz%C4%99stochowa" });
TL.geo("w304-commission-of-national-education", { scope: "place", lat: 52.23, lon: 21.01, r: 40, label: "Warsaw, Poland", src: "https://en.wikipedia.org/wiki/Warsaw" });
TL.geo("w304-constitution-3-may", { scope: "place", lat: 52.23, lon: 21.01, r: 40, label: "Warsaw, Poland", src: "https://en.wikipedia.org/wiki/Warsaw" });
TL.geo("w304-kosciuszko-uprising", { scope: "place", lat: 50.06, lon: 19.94, r: 40, label: "Kraków, Poland", src: "https://en.wikipedia.org/wiki/Krak%C3%B3w" });
TL.geo("w304-jeronimos-begun", { scope: "place", lat: 38.698, lon: -9.206, r: 30, label: "Belém, Lisbon", src: "https://en.wikipedia.org/wiki/Jer%C3%B3nimos_Monastery" });
TL.geo("w304-lusiadas", { scope: "place", lat: 38.73, lon: -9.15, r: 40, label: "Lisbon, Portugal", src: "https://en.wikipedia.org/wiki/Lisbon" });
TL.geo("w304-alcacer-quibir", { scope: "place", lat: 35.01, lon: -5.9, r: 40, label: "Ksar el-Kebir, Morocco", src: "https://en.wikipedia.org/wiki/Ksar_el-Kebir" });
TL.geo("w304-peregrinacao", { scope: "place", lat: 38.73, lon: -9.15, r: 40, label: "Lisbon, Portugal", src: "https://en.wikipedia.org/wiki/Lisbon" });
TL.geo("w304-restoration-1640", { scope: "place", lat: 38.73, lon: -9.15, r: 40, label: "Lisbon, Portugal", src: "https://en.wikipedia.org/wiki/Lisbon" });
TL.geo("w304-mafra-palace", { scope: "place", lat: 38.937, lon: -9.326, r: 30, label: "Mafra, Portugal", src: "https://en.wikipedia.org/wiki/Mafra,_Portugal" });
TL.geo("w304-lisbon-earthquake", { scope: "place", lat: 38.73, lon: -9.15, r: 60, label: "Lisbon, Portugal", src: "https://en.wikipedia.org/wiki/Lisbon" });
TL.geo("w304-mona-lisa", { scope: "place", lat: 43.77, lon: 11.26, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w304-sistine-ceiling", { scope: "place", lat: 41.903, lon: 12.454, r: 30, label: "Sistine Chapel, Vatican City", src: "https://en.wikipedia.org/wiki/Sistine_Chapel" });
TL.geo("w304-the-prince", { scope: "place", lat: 43.77, lon: 11.26, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w304-book-of-the-courtier", { scope: "place", lat: 43.73, lon: 12.64, r: 40, label: "Urbino, Italy", src: "https://en.wikipedia.org/wiki/Urbino" });
TL.geo("w304-vasari-lives", { scope: "place", lat: 43.77, lon: 11.26, r: 40, label: "Florence, Italy", src: "https://en.wikipedia.org/wiki/Florence" });
TL.geo("w304-palladio-four-books", { scope: "place", lat: 45.44, lon: 12.34, r: 40, label: "Venice, Italy", src: "https://en.wikipedia.org/wiki/Venice" });
TL.geo("w304-teatro-olimpico", { scope: "place", lat: 45.548, lon: 11.547, r: 30, label: "Teatro Olimpico, Vicenza", src: "https://en.wikipedia.org/wiki/Teatro_Olimpico" });
TL.geo("w304-don-quixote", { scope: "place", lat: 40.42, lon: -3.7, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
