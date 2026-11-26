// Fill-in W3-05: 1500–1800 — Russian Empire, Sardinia, Scotland, Spain, Tsardom of Russia, Asante, Benin, Denkyira (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const X = (t, u) => ({ t, u });
const D = (y, m, d) => { const days = [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let n = d; for (let i = 0; i < m - 1; i++) n += days[i]; return +(y + (n - 0.5) / 365).toFixed(3); };

TL.add({ events: [
  // ---------- Russian Empire ----------
  { id: "w305-academy-sciences", branch: "russian-empire", y: 1725.95, when: "December 1725", title: "St. Petersburg Academy of Sciences opens",
    text: "Planned by Peter the Great, whose Senate decree of February 1724 founded it, the Academy opened under Catherine I. It drew foreign scholars to the capital and was first housed in the Kunstkamera.", imp: 2,
    cites: [W("Russian_Academy_of_Sciences", "Russian Academy of Sciences"), X("The Russian/St Petersburg Academy of Sciences — MacTutor History of Mathematics, University of St Andrews", "https://mathshistory.st-andrews.ac.uk/Societies/Russian")] },
  { id: "w305-moscow-university", branch: "russian-empire", y: 1755, when: "1755", title: "Empress Elizabeth founds Moscow University",
    text: "Ivan Shuvalov and Mikhail Lomonosov urged the founding of Russia's first university, established under Empress Elizabeth in 1755. It was modeled on German universities, with a largely German early faculty.", imp: 2,
    cites: [B("topic/Moscow-State-University", "Moscow State University"), B("biography/Elizabeth-empress-of-Russia", "Elizabeth, empress of Russia"), W("Moscow_State_University", "Moscow State University")] },
  { id: "w305-hermitage-founded", branch: "russian-empire", y: 1764, when: "1764", title: "Catherine the Great founds the Hermitage",
    text: "Catherine II acquired a collection of paintings from the Berlin merchant Johann Gotzkowsky, which became the court museum later known as the Hermitage in St. Petersburg.", imp: 2,
    cites: [B("topic/Hermitage-museum-Saint-Petersburg-Russia", "Hermitage"), W("Hermitage_Museum", "Hermitage Museum")] },
  { id: "w305-pugachev", branch: "russian-empire", y: 1773.7, end: 1775.06, when: "1773–1775", title: "Pugachev's rebellion shakes Catherine's Russia",
    text: "Don Cossack Yemelyan Pugachev led Cossacks and peasants in a revolt that besieged Orenburg and spread across the Volga and Urals. He was executed in Moscow in January 1775.", imp: 2,
    cites: [B("biography/Yemelyan-Pugachev", "Yemelyan Pugachev"), W("Pugachev%27s_Rebellion", "Pugachev's Rebellion")] },
  { id: "w305-bronze-horseman", branch: "russian-empire", y: D(1782, 8, 18), when: "August 18, 1782", title: "The Bronze Horseman is unveiled in St. Petersburg",
    text: "Étienne Maurice Falconet's equestrian statue of Peter the Great, commissioned by Catherine the Great, was dedicated in 1782. It became a symbol of the city and a subject of Russian literature.", imp: 2,
    cites: [B("topic/Bronze-Horseman", "Bronze Horseman"), W("Bronze_Horseman", "Bronze Horseman")] },
  { id: "w305-crimea-annexed", branch: "russian-empire", y: D(1783, 4, 19), when: "April 19, 1783", title: "Russia annexes the Crimean Khanate",
    text: "Catherine II annexed the Crimean peninsula, urged on by Prince Potemkin, after a decade of Russian intervention there. Russia had sought to control the Black Sea and end Crimean raids.", imp: 2,
    cites: [B("place/Crimea", "Crimea"), W("Annexation_of_Crimea_by_the_Russian_Empire", "Annexation of Crimea by the Russian Empire")] },

  // ---------- Kingdom of Sardinia ----------
  { id: "w305-stupinigi", branch: "savoy-sardinia", y: 1729, when: "1729", title: "Juvarra begins the Stupinigi hunting lodge",
    text: "Filippo Juvarra began the royal hunting lodge at Stupinigi, near Turin, for Victor Amadeus II. Britannica ranks it among his two greatest masterpieces; the first formal hunt was held there in 1731.", imp: 3,
    cites: [B("biography/Filippo-Juvarra", "Filippo Juvarra"), W("Palazzina_di_caccia_di_Stupinigi", "Palazzina di caccia di Stupinigi")] },
  { id: "w305-victor-amadeus-abdicates", branch: "savoy-sardinia", y: 1730.7, when: "1730", title: "Victor Amadeus II abdicates",
    text: "The first Savoy king of Sardinia gave up the crown to his son Charles Emmanuel III. Having changed his mind, he tried to take it back and was arrested in 1731, confined for the rest of his life.", imp: 2,
    cites: [B("biography/Victor-Amadeus-II", "Victor Amadeus II"), W("Victor_Amadeus_II_of_Sardinia", "Victor Amadeus II of Sardinia")] },
  { id: "w305-teatro-regio", branch: "savoy-sardinia", y: D(1740, 12, 26), when: "December 26, 1740", title: "Turin's Teatro Regio opens with Feo's Arsace",
    text: "The Royal Theatre, designed by Benedetto Alfieri, was inaugurated with Francesco Feo's opera Arsace. A fire destroyed it on the night of February 8–9, 1936.", imp: 3,
    cites: [X("History — Teatro Regio Torino", "https://teatroregio.torino.it/en/node/788"), W("Teatro_Regio_(Turin)", "Teatro Regio (Turin)")] },
  { id: "w305-turin-occupied", branch: "savoy-sardinia", y: D(1798, 12, 6), when: "December 6, 1798", title: "French occupy Turin; the king is left only Sardinia",
    text: "French forces under General Joubert occupied Turin and forced King Charles Emmanuel IV to give up his mainland territories, leaving him only the island of Sardinia.", imp: 2, link: "france",
    cites: [W("Charles_Emmanuel_IV_of_Sardinia", "Charles Emmanuel IV of Sardinia"), B("biography/Charles-Emmanuel-IV", "Charles Emmanuel IV")] },

  // ---------- Kingdom of Scotland ----------
  { id: "w305-james-iv-golf", branch: "scotland", y: 1502, end: 1504, when: "1502–1504", title: "James IV takes up golf",
    text: "After parliamentary bans in 1457, 1471 and 1491, James IV took up golf himself. Clubs were bought for him in Perth in 1502, and golf clubs are recorded again in 1503–1504.", imp: 3,
    cites: [X("Early moments in Scottish golf — National Library of Scotland", "https://www.nls.uk/collections/stories/sports-and-recreation/early-moments-in-scottish-golf/"), W("Golf", "Golf"), W("History_of_golf", "History of golf")] },
  { id: "w305-first-press", branch: "scotland", y: 1508, when: "1507–1508", title: "Scotland's first printing press opens in Edinburgh",
    text: "Walter Chepman and Androw Myllar, licensed by James IV in 1507, set up Scotland's first press in Edinburgh. It produced the earliest surviving dated Scottish book, finished on April 4, 1508.", imp: 3,
    cites: [X("Chepman and Myllar Prints — UNESCO UK Memory of the World", "https://unesco.org.uk/our-sites/memory-of-the-world/chepman-and-myllar-prints"), W("Walter_Chepman", "Walter Chepman")] },
  { id: "w305-flodden", branch: "scotland", y: D(1513, 9, 9), when: "September 9, 1513", title: "Battle of Flodden: James IV killed",
    text: "James IV invaded England to support France, his ally in the Auld Alliance, and was defeated by an English army under the Earl of Surrey. It was the largest clash between the two kingdoms, and the king died.", imp: 2, link: "england",
    cites: [B("event/Battle-of-Flodden", "Battle of Flodden")] },
  { id: "w305-reformation-parliament", branch: "scotland", y: 1560.65, when: "August 1560", title: "Reformation Parliament makes Scotland Protestant",
    text: "After the Lords of the Congregation gained control of government, Parliament abolished papal authority and adopted a Reformed confession of faith, though Mary, still in France, did not ratify it. Knox led the Reformation.", imp: 2,
    cites: [B("place/Scotland/Mary-1542-67-and-the-Scottish-Reformation", "Scotland"), W("Scottish_Reformation", "Scottish Reformation"), B("biography/John-Knox", "John Knox")] },
  { id: "w305-edinburgh-university", branch: "scotland", y: 1582, end: 1583, when: "1582–1583", title: "James VI charters the Town's College of Edinburgh",
    text: "Under a charter granted in 1582 by James VI, the Edinburgh town council founded the Town's College in 1583 under Presbyterian auspices. It grew into the University of Edinburgh.", imp: 3,
    cites: [B("topic/University-of-Edinburgh", "University of Edinburgh")] },
  { id: "w305-national-covenant", branch: "scotland", y: D(1638, 2, 28), when: "February 28, 1638", title: "The National Covenant is signed in Greyfriars",
    text: "Scottish churchmen launched the Covenant in Greyfriars' churchyard in Edinburgh. It rejected Charles I's and Archbishop Laud's attempt to bring Scottish worship and church government into line with England's.", imp: 2,
    cites: [B("event/National-Covenant", "National Covenant")] },
  { id: "w305-dunbar", branch: "scotland", y: D(1650, 9, 3), when: "September 3, 1650", title: "Cromwell routs the Scots at Dunbar",
    text: "Oliver Cromwell's army of about 11,000 defeated David Leslie's 23,000 Scots, killing around 3,000. It opened Scotland to a decade of English occupation and rule.", imp: 2, link: "england",
    cites: [B("event/Battle-of-Dunbar", "Battle of Dunbar"), W("Battle_of_Dunbar_(1650)", "Battle of Dunbar (1650)")] },
  { id: "w305-glencoe", branch: "scotland", y: D(1692, 2, 13), when: "February 13, 1692", title: "Massacre of Glencoe",
    text: "Soldiers quartered among the MacDonalds of Glencoe suddenly attacked them, acting on an order after chief Alexander MacDonald took his oath of allegiance a few days late.", imp: 2,
    cites: [B("event/Massacre-of-Glencoe", "Massacre of Glencoe")] },
  { id: "w305-darien", branch: "scotland", y: 1698.5, end: 1700.2, when: "July 1698 – 1700", title: "The Darien scheme colony fails",
    text: "The Company of Scotland sent five ships from Leith in July 1698 to found a colony on the Gulf of Darién. It was first abandoned in 1699, and a second party surrendered to the Spanish in 1700, costing Scotland a quarter of its liquid capital.", imp: 2,
    cites: [X("The Darien Scheme — National Museums Scotland", "https://www.nms.ac.uk/discover-catalogue/the-darien-scheme"), W("Darien_scheme", "Darien scheme")] },

  // ---------- Spain ----------
  { id: "w305-valladolid-debate", branch: "spain", y: 1550, end: 1551, when: "1550–1551", title: "Valladolid debate on the rights of Native Americans",
    text: "At Valladolid, Bartolomé de las Casas and Juan Ginés de Sepúlveda debated the morality of the Spanish conquest and how Native Americans should be treated.", imp: 2,
    cites: [B("biography/Juan-Gines-de-Sepulveda", "Juan Ginés de Sepúlveda"), W("Valladolid_debate", "Valladolid debate")] },
  { id: "w305-escorial", branch: "spain", y: D(1563, 4, 23), end: 1584, when: "April 23, 1563 – 1584", title: "Philip II builds El Escorial",
    text: "The royal monastery-palace near Madrid was begun in 1563 by Juan Bautista de Toledo and completed in 1584 by Juan de Herrera. Philip II's library there holds thousands of manuscripts.", imp: 2,
    cites: [B("place/El-Escorial", "El Escorial"), W("El_Escorial", "El Escorial")] },
  { id: "w305-portugal-crown", branch: "spain", y: 1580, when: "1580", title: "Philip II claims the Portuguese crown",
    text: "After King Sebastian died in Morocco in 1578 and the succession was disputed, Philip II became king of the Portuguese as Philip I. Spain and Portugal and their empires shared a monarch.", imp: 2, link: "portugal",
    cites: [B("biography/Philip-II-king-of-Spain-and-Portugal", "Philip II"), B("biography/Sebastian-king-of-Portugal", "Sebastian"), W("Iberian_Union", "Iberian Union")] },
  { id: "w305-orgaz", branch: "spain", y: 1586, end: 1588, when: "1586–1588", title: "El Greco paints The Burial of the Count of Orgaz",
    text: "The Greek-born El Greco, settled in Toledo since 1577, painted this large, luminous canvas for the church of Santo Tomé. It commemorates a pious local lord who had died some 250 years earlier.", imp: 2,
    cites: [B("topic/The-Burial-of-the-Count-of-Orgaz", "The Burial of the Count of Orgaz")] },
  { id: "w305-morisco-expulsion", branch: "spain", y: D(1609, 9, 22), end: 1614, when: "September 22, 1609 – c. 1614", title: "Spain orders the Moriscos expelled",
    text: "After a 1609 royal order, Spain expelled its Morisco population, descendants of converted Muslims. An estimated 300,000 left, mainly for North Africa; the expulsion took about five years.", imp: 2,
    cites: [B("topic/Morisco", "Morisco"), W("Expulsion_of_the_Moriscos", "Expulsion of the Moriscos")] },
  { id: "w305-breda", branch: "spain", y: 1635, when: "c. 1635", title: "Velázquez paints The Surrender of Breda",
    text: "Velázquez painted Spain's 1625 capture of Breda from the Dutch for Philip IV's Buen Retiro palace. Britannica calls it his only surviving historical painting.", imp: 2, link: "dutch-republic",
    cites: [B("topic/The-Surrender-of-Breda", "The Surrender of Breda"), W("The_Surrender_of_Breda", "The Surrender of Breda")] },
  { id: "w305-las-meninas", branch: "spain", y: 1656, when: "1656", title: "Velázquez paints Las Meninas",
    text: "At the height of his career, Velázquez painted the Infanta Margarita Theresa with her attendants and himself at work. Its intricate perspective and ambiguous gazes still invite debate.", imp: 1,
    cites: [B("topic/Las-Meninas", "Las Meninas"), W("Las_Meninas", "Las Meninas")] },
  { id: "w305-philip-v", branch: "spain", y: D(1700, 11, 1), when: "November 1, 1700", title: "Charles II dies; Bourbon Philip V takes the throne",
    text: "The childless Charles II, last Spanish Habsburg, died after naming Philip, duke of Anjou, his heir. Philip founded the Bourbon dynasty in Spain, and the succession led to a European war.", imp: 2, link: "france",
    cites: [B("biography/Philip-V-king-of-Spain", "Philip V"), W("Charles_II_of_Spain", "Charles II of Spain")] },
  { id: "w305-real-academia", branch: "spain", y: 1713, when: "1713", title: "Royal Spanish Academy founded",
    text: "Founded to preserve the Spanish language, the Academy published a landmark dictionary, the Diccionario de la lengua Castellana, in six volumes between 1726 and 1739.", imp: 2,
    cites: [B("topic/Real-Academia-Espanola", "Real Academia Española"), W("Real_Academia_Espa%C3%B1ola", "Royal Spanish Academy")] },
  { id: "w305-jesuits-expelled", branch: "spain", y: 1767, when: "1767", title: "Charles III expels the Jesuits",
    text: "Charles III, an enlightened despot who resented the Jesuits' loyalty to the papacy, ordered them expelled from Spain and its colonies after an investigating commission reported.", imp: 2,
    cites: [B("biography/Charles-III-king-of-Spain", "Charles III")] },
  { id: "w305-prado-building", branch: "spain", y: 1785, when: "1785", title: "Charles III commissions the building that became the Prado",
    text: "Charles III commissioned architect Juan de Villanueva to design a natural science museum in Madrid. It opened in 1819 as the Royal Museum of Painting, today's Prado.", imp: 2,
    cites: [B("topic/Prado-Museum", "Prado Museum"), W("Museo_del_Prado", "Museo del Prado")] },

  // ---------- Tsardom of Russia ----------
  { id: "w305-st-basils", branch: "tsardom-russia", y: 1555, end: 1561, when: "1555–1561", title: "St. Basil's Cathedral built on Red Square",
    text: "Ivan the Terrible ordered the church of the Intercession, later called St. Basil's, to commemorate the capture of Kazan and Astrakhan. Its colored domes became Moscow's emblem.", imp: 2,
    cites: [B("place/Red-Square", "Red Square"), W("Saint_Basil%27s_Cathedral", "Saint Basil's Cathedral")] },
  { id: "w305-patriarchate", branch: "tsardom-russia", y: 1589, when: "1589", title: "Moscow gets its own patriarch",
    text: "Patriarch Jeremias II of Constantinople elevated Job, metropolitan of Moscow, to patriarch of all Russia. The patriarchs of Antioch, Alexandria and Jerusalem confirmed it in 1593, ranking Moscow fifth.", imp: 2,
    cites: [B("biography/Saint-Job", "Saint Job"), W("Patriarchate_of_Moscow", "Patriarchate of Moscow")] },
  { id: "w305-yermak-siberia", branch: "tsardom-russia", y: 1582, when: "1581–1582", title: "Yermak's Cossacks defeat the Khanate of Sibir",
    text: "Sent into Siberia by the Stroganov family, the Cossack Yermak defeated Khan Kuchum with firearms and took his capital Kashlyk. It began Russia's conquest of Siberia.", imp: 2,
    cites: [B("biography/Yermak-Timofeyevich", "Yermak Timofeyevich"), W("Yermak_Timofeyevich", "Yermak Timofeyevich")] },
  { id: "w305-ulozhenie", branch: "tsardom-russia", y: 1649, when: "1649", title: "Law code of 1649 defines serfdom",
    text: "After a Moscow uprising in 1648, Tsar Alexis convened a land assembly that produced the Sobornoye Ulozheniye, a code that legally defined serfdom.", imp: 2,
    cites: [B("biography/Alexis-tsar-of-Russia", "Alexis, tsar of Russia"), W("Sobornoye_Ulozheniye", "Sobornoye Ulozheniye")] },
  { id: "w305-schism", branch: "tsardom-russia", y: 1666, end: 1667.99, when: "1666–1667", title: "Great Moscow Synod condemns the old rite",
    text: "Patriarch Nikon's liturgical reforms split the Church. Under Tsar Alexis, a council in 1666–67 condemned the old rite, creating the lasting division with the Old Believers.", imp: 2,
    cites: [B("topic/Raskol", "Raskol"), B("biography/Alexis-tsar-of-Russia", "Alexis, tsar of Russia"), B("biography/Nikon", "Nikon"), W("Schism_of_the_Russian_Church", "Schism of the Russian Church")] },
  { id: "w305-nerchinsk", branch: "tsardom-russia", y: D(1689, 8, 27), when: "August 27, 1689", title: "Treaty of Nerchinsk fixes the Russia–China border",
    text: "Russia and Qing China made peace, with Russia giving up outposts in the Amur basin. It was the first formal treaty China signed with a Western power.", imp: 2, link: "qing",
    cites: [B("event/Treaty-of-Nerchinsk", "Treaty of Nerchinsk"), W("Treaty_of_Nerchinsk", "Treaty of Nerchinsk")] },
  { id: "w305-grand-embassy", branch: "tsardom-russia", y: 1697, end: 1698, when: "1697–1698", title: "Peter the Great's Grand Embassy tours western Europe",
    text: "Traveling incognito as Peter Mikhailov, Tsar Peter worked as a shipbuilder in the Dutch Republic. He was part of a Russian diplomatic mission to western Europe.", imp: 2, link: "dutch-republic",
    cites: [B("event/Grand-Embassy", "Grand Embassy"), W("Grand_Embassy_of_Peter_the_Great", "Grand Embassy of Peter the Great")] },

  // ---------- Asante ----------
  { id: "w305-golden-stool", branch: "ashanti", y: 1700, when: "c. 1700 (traditional; no firm date)", title: "The Golden Stool, soul of the Asante nation",
    text: "In Asante tradition the priest Okomfo Anokye brought the Golden Stool down from the sky onto the lap of Osei Tutu, as Kumasi united the Asante kingdoms against Denkyira. It became the symbol of Asante unity.", imp: 1,
    cites: [B("topic/Golden-Stool", "Golden Stool"), B("biography/Osei-Tutu", "Osei Tutu"), W("Golden_Stool", "Golden Stool")] },
  { id: "w305-osei-tutu-dies", branch: "ashanti", y: 1717, when: "1717 (possibly 1712)", title: "Osei Tutu, founder of Asante, dies",
    text: "The founder and first ruler of the Asante empire died, most likely in 1717, though Britannica allows 1712. He had united the Asante kingdoms around Kumasi.", imp: 2,
    cites: [B("biography/Osei-Tutu", "Osei Tutu"), W("Osei_Tutu_I", "Osei Tutu I")] },
  { id: "w305-bono", branch: "ashanti", y: 1722, end: 1723.99, when: "1722–1723", title: "Opoku Ware subjugates the Bono state",
    text: "Asantehene Opoku Ware conquered Bono, one of the old northern Akan states. His reign, from about 1720 to 1750, took the empire to its greatest territorial extent.", imp: 2,
    cites: [B("biography/Opoku-Ware", "Opoku Ware"), W("Opoku_Ware_I", "Opoku Ware I")] },
  { id: "w305-kwadwoan", branch: "ashanti", y: 1764, end: 1777, when: "c. 1764–1777", title: "Osei Kwadwo builds a merit-based bureaucracy",
    text: "Osei Kwadwo's reign began a period of bureaucratic reform, the Kwadwoan Revolution. Britannica credits him and his successors with a centralized state run by merit-based officials.", imp: 2,
    cites: [B("biography/Osei-Kwadwo", "Osei Kwadwo"), W("Osei_Kwadwo", "Osei Kwadwo")] },

  // ---------- Kingdom of Benin ----------
  { id: "w305-esigie-golden-age", branch: "benin-kingdom", y: 1504, end: 1550, when: "c. 1504 – c. 1550", title: "Oba Esigie's reign: Benin court art and Portuguese trade",
    text: "Esigie ruled Benin from 1504 to about 1550. The Met dates an ivory pendant mask honoring his mother Idia to his reign; its carvings include Portuguese faces, reflecting the trade that brought Benin wealth.", imp: 2, link: "portugal",
    cites: [X("Pendant mask of Ìyọ́bà Idià — The Metropolitan Museum of Art", "https://www.metmuseum.org/art/collection/search/318622"), W("Esigie", "Esigie")] },
  { id: "w305-idah-war", branch: "benin-kingdom", y: 1515, end: 1516, when: "1515–1516", title: "Benin defeats Idah; Queen Idia honored as Iyoba",
    text: "Benin won the war against Igala-ruled Idah, with Esigie's mother Idia credited for counsel and fighting. Esigie gave her the title Iyoba, queen mother. Britannica dates Idah's submission to the early 16th century.", imp: 3,
    cites: [B("place/Idah", "Idah"), X("Pendant mask of Ìyọ́bà Idià — The Metropolitan Museum of Art", "https://www.metmuseum.org/art/collection/search/318622"), W("Idia", "Idia"), W("Esigie", "Esigie")] },
  { id: "w305-dapper-benin", branch: "benin-kingdom", y: 1668, when: "1668", title: "Dapper's Description of Africa pictures Benin City",
    text: "Olfert Dapper, who never visited Africa, compiled his Description of Africa in Amsterdam from other writers' reports. It included an engraved view of Benin City, with a key naming the royal palace and court.", imp: 3, link: "dutch-republic",
    cites: [X("View of the city of Benin — Atlas of Mutual Heritage", "https://atlasofmutualheritage.nl/en/id/7215"), W("Olfert_Dapper", "Olfert Dapper"), W("Benin_Empire", "Benin Empire")] },
  { id: "w305-benin-civil-war", branch: "benin-kingdom", y: 1689, end: 1721, when: "c. 1689 – 1721", title: "Civil war over the succession to Oba Ewuakpe",
    text: "Succession disputes and shifting trade let Benin's administration challenge its kings. Ewuakpe's sons Ozuere and Akenzua contested the throne; Akenzua prevailed in a decisive battle in 1721.", imp: 2,
    cites: [X("Civil War in the Kingdom of Benin, 1689–1721 — Journal of African History, Cambridge University Press", "https://www.cambridge.org/core/journals/journal-of-african-history/article/civil-war-in-the-kingdom-of-benin-16891721-continuity-or-political-change/34288CBD602C98A02AD1A95A63E9DA6C"), W("Benin_Empire", "Benin Empire")] },

  // ---------- Denkyira ----------
  { id: "w305-denkyira-gold-dominion", branch: "denkyira", y: 1699, when: "by the end of the 17th century", title: "Denkyira builds a gold-and-Elmina dominion",
    text: "By the end of the 17th century Denkyira had subjugated the Twifo and Axim, taken the gold districts of Wassaw and Aowin, and held dominion over Elmina Castle, the wealthiest market on the Gold Coast.", imp: 2,
    cites: [B("place/Denkyera", "Denkyera"), W("Denkyira", "Denkyira")] },
] });

TL.geo("w305-academy-sciences", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("w305-moscow-university", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("w305-hermitage-founded", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("w305-pugachev", { scope: "region", lat: 51.78, lon: 55.1, r: 600, label: "Orenburg and the Volga–Urals steppe", src: "https://en.wikipedia.org/wiki/Orenburg" });
TL.geo("w305-bronze-horseman", { scope: "place", lat: 59.94, lon: 30.31, r: 40, label: "Saint Petersburg, Russia", src: "https://en.wikipedia.org/wiki/Saint_Petersburg" });
TL.geo("w305-crimea-annexed", { scope: "region", lat: 45.3, lon: 34.4, r: 220, label: "Crimea", src: "https://en.wikipedia.org/wiki/Crimea" });
TL.geo("w305-stupinigi", { scope: "place", lat: 44.99, lon: 7.6, r: 30, label: "Stupinigi, near Turin, Italy", src: "https://en.wikipedia.org/wiki/Palazzina_di_caccia_di_Stupinigi" });
TL.geo("w305-victor-amadeus-abdicates", { scope: "place", lat: 45.08, lon: 7.68, r: 40, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Turin" });
TL.geo("w305-teatro-regio", { scope: "place", lat: 45.08, lon: 7.68, r: 40, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Turin" });
TL.geo("w305-turin-occupied", { scope: "place", lat: 45.08, lon: 7.68, r: 40, label: "Turin, Italy", src: "https://en.wikipedia.org/wiki/Turin" });
TL.geo("w305-james-iv-golf", { scope: "place", lat: 56.4, lon: -3.43, r: 40, label: "Perth, Scotland", src: "https://en.wikipedia.org/wiki/Perth,_Scotland" });
TL.geo("w305-first-press", { scope: "place", lat: 55.95, lon: -3.19, r: 30, label: "Edinburgh, Scotland", src: "https://en.wikipedia.org/wiki/Edinburgh" });
TL.geo("w305-flodden", { scope: "place", lat: 55.63, lon: -2.18, r: 30, label: "Flodden, Northumberland", src: "https://en.wikipedia.org/wiki/Battle_of_Flodden" });
TL.geo("w305-reformation-parliament", { scope: "place", lat: 55.95, lon: -3.19, r: 40, label: "Edinburgh, Scotland", src: "https://en.wikipedia.org/wiki/Edinburgh" });
TL.geo("w305-edinburgh-university", { scope: "place", lat: 55.95, lon: -3.19, r: 30, label: "Edinburgh, Scotland", src: "https://en.wikipedia.org/wiki/Edinburgh" });
TL.geo("w305-national-covenant", { scope: "place", lat: 55.947, lon: -3.191, r: 30, label: "Greyfriars Kirk, Edinburgh", src: "https://en.wikipedia.org/wiki/Greyfriars_Kirk" });
TL.geo("w305-dunbar", { scope: "place", lat: 56.0, lon: -2.52, r: 30, label: "Dunbar, Scotland", src: "https://en.wikipedia.org/wiki/Dunbar" });
TL.geo("w305-glencoe", { scope: "place", lat: 56.67, lon: -4.99, r: 40, label: "Glen Coe, Scotland", src: "https://en.wikipedia.org/wiki/Glen_Coe" });
TL.geo("w305-darien", { scope: "place", lat: 9.43, lon: -77.06, r: 100, label: "Gulf of Darién, Panama", src: "https://en.wikipedia.org/wiki/Gulf_of_Dari%C3%A9n" });
TL.geo("w305-valladolid-debate", { scope: "place", lat: 41.65, lon: -4.72, r: 40, label: "Valladolid, Spain", src: "https://en.wikipedia.org/wiki/Valladolid" });
TL.geo("w305-escorial", { scope: "place", lat: 40.59, lon: -4.15, r: 30, label: "El Escorial, Spain", src: "https://en.wikipedia.org/wiki/El_Escorial" });
TL.geo("w305-portugal-crown", { scope: "region", lat: 39, lon: -8, r: 300, label: "Portugal", src: "https://en.wikipedia.org/wiki/Portugal" });
TL.geo("w305-orgaz", { scope: "place", lat: 39.86, lon: -4.02, r: 30, label: "Toledo, Spain", src: "https://en.wikipedia.org/wiki/Toledo,_Spain" });
TL.geo("w305-morisco-expulsion", { scope: "region", lat: 40, lon: -4, r: 500, label: "Spain", src: "https://en.wikipedia.org/wiki/Spain" });
TL.geo("w305-breda", { scope: "place", lat: 40.42, lon: -3.7, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
TL.geo("w305-las-meninas", { scope: "place", lat: 40.42, lon: -3.7, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
TL.geo("w305-philip-v", { scope: "place", lat: 40.42, lon: -3.7, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
TL.geo("w305-real-academia", { scope: "place", lat: 40.42, lon: -3.7, r: 40, label: "Madrid, Spain", src: "https://en.wikipedia.org/wiki/Madrid" });
TL.geo("w305-jesuits-expelled", { scope: "region", lat: 40, lon: -4, r: 500, label: "Spain", src: "https://en.wikipedia.org/wiki/Spain" });
TL.geo("w305-prado-building", { scope: "place", lat: 40.414, lon: -3.692, r: 30, label: "Museo del Prado, Madrid", src: "https://en.wikipedia.org/wiki/Museo_del_Prado" });
TL.geo("w305-yermak-siberia", { scope: "place", lat: 58.15, lon: 68.52, r: 150, label: "Qashliq, western Siberia", src: "https://en.wikipedia.org/wiki/Qashliq" });
TL.geo("w305-ulozhenie", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("w305-nerchinsk", { scope: "place", lat: 51.99, lon: 116.56, r: 100, label: "Nerchinsk, Russia", src: "https://en.wikipedia.org/wiki/Nerchinsk" });
TL.geo("w305-grand-embassy", { scope: "place", lat: 52.37, lon: 4.9, r: 60, label: "Amsterdam, Dutch Republic", src: "https://en.wikipedia.org/wiki/Amsterdam" });
TL.geo("w305-golden-stool", { scope: "place", lat: 6.7, lon: -1.63, r: 40, label: "Kumasi, Ghana", src: "https://en.wikipedia.org/wiki/Kumasi" });
TL.geo("w305-osei-tutu-dies", { scope: "place", lat: 6.7, lon: -1.63, r: 40, label: "Kumasi, Ghana", src: "https://en.wikipedia.org/wiki/Kumasi" });
TL.geo("w305-bono", { scope: "region", lat: 7.65, lon: -2.5, r: 150, label: "Bono region, Ghana", src: "https://en.wikipedia.org/wiki/Bono_Region" });
TL.geo("w305-kwadwoan", { scope: "place", lat: 6.7, lon: -1.63, r: 40, label: "Kumasi, Ghana", src: "https://en.wikipedia.org/wiki/Kumasi" });
TL.geo("w305-esigie-golden-age", { scope: "place", lat: 6.33, lon: 5.62, r: 40, label: "Benin City, Nigeria", src: "https://en.wikipedia.org/wiki/Benin_City" });
TL.geo("w305-idah-war", { scope: "place", lat: 7.1, lon: 6.74, r: 60, label: "Idah, Nigeria", src: "https://en.wikipedia.org/wiki/Idah" });
TL.geo("w305-dapper-benin", { scope: "place", lat: 6.33, lon: 5.62, r: 40, label: "Benin City, Nigeria", src: "https://en.wikipedia.org/wiki/Benin_City" });
TL.geo("w305-benin-civil-war", { scope: "place", lat: 6.33, lon: 5.62, r: 40, label: "Benin City, Nigeria", src: "https://en.wikipedia.org/wiki/Benin_City" });
TL.geo("w305-denkyira-gold-dominion", { scope: "region", lat: 5.97, lon: -1.78, r: 120, label: "Denkyira, Ghana", src: "https://en.wikipedia.org/wiki/Dunkwa-On-Offin" });
TL.geo("w305-st-basils", { scope: "place", lat: 55.7525, lon: 37.6231, r: 30, label: "Red Square, Moscow", src: "https://en.wikipedia.org/wiki/Saint_Basil%27s_Cathedral" });
TL.geo("w305-patriarchate", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
TL.geo("w305-schism", { scope: "place", lat: 55.76, lon: 37.62, r: 40, label: "Moscow, Russia", src: "https://en.wikipedia.org/wiki/Moscow" });
