// Fill-in W3-03: 1500–1800 — Ottoman, Safavid, Afsharid, Dutch, English, French, British and Holy Roman Empire events (about a third cultural). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });

TL.add({ events: [
  // ---------- Ottoman Empire ----------
  { id: "w303-amasya-peace", branch: "ottoman", y: 1555.41, when: "May 29, 1555", title: "Peace of Amasya ends the first Ottoman–Safavid war",
    text: "Suleiman and Shah Tahmasp I signed a treaty after the war of 1532–1555, which the Safavids had survived despite Ottoman offensives. It defined the border between the two empires.", imp: 2, link: "safavid",
    cites: [B("event/Peace-of-Amasya", "Peace of Amasya"), B("biography/Tahmasp-I", "Tahmasp I"), W("Peace_of_Amasya", "Peace of Amasya")] },
  { id: "w303-selimiye", branch: "ottoman", y: 1575, when: "1575", title: "Sinan completes the Selimiye Mosque at Edirne",
    text: "Built for Selim II between 1569 and 1575, the mosque dominates Edirne's skyline and is regarded as a masterpiece of the Ottoman court architect Sinan.", imp: 2,
    cites: [B("place/Edirne", "Edirne"), W("Selimiye_Mosque,_Edirne", "Selimiye Mosque, Edirne")] },
  { id: "w303-iznik-ware", branch: "ottoman", y: 1500, end: 1700, when: "16th–17th centuries", title: "İznik pottery flowers",
    text: "Potters in İznik made the painted, glazed Ottoman ceramics that flowered through the 16th century and into the 17th. Their tiles later decorated mosques such as the Blue Mosque.", imp: 3,
    cites: [B("art/Iznik-ware", "İznik ware"), W("Sultan_Ahmed_Mosque", "Blue Mosque, Istanbul")] },
  { id: "w303-jelali", branch: "ottoman", y: 1595, end: 1610, when: "1595–1610", title: "Jelali revolts convulse Anatolia",
    text: "Major rebellions broke out across Anatolia between 1595 and 1610. Grand vizier Kuyucu Murad Pasha put them down by 1610, having eliminated many of the rebels.", imp: 3,
    cites: [B("event/Jelali-Revolts", "Jelālī Revolts")] },
  { id: "w303-sultanahmet", branch: "ottoman", y: 1609, end: 1617, when: "1609–1617 (some sources say 1616)", title: "Sultan Ahmed Mosque (the Blue Mosque) built",
    text: "Ahmed I's mosque opposite Hagia Sophia has a central dome, semidomes and six minarets; the blue of its tiled interior gave it its popular name.", imp: 2,
    cites: [{ t: "Blue Mosque — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/Blue-Mosque-Istanbul-Turkey" }, W("Sultan_Ahmed_Mosque", "Blue Mosque, Istanbul")] },
  { id: "w303-baghdad-1638", branch: "ottoman", y: 1638.9, when: "1638", title: "Murad IV retakes Baghdad from Iran",
    text: "Sultan Murad IV reconquered Baghdad in 1638 after a siege that ended in a massacre of the garrison and citizens. He commanded the Ottoman army himself in the last years of the war.", imp: 2, link: "safavid",
    cites: [B("biography/Murad-IV", "Murad IV"), W("Murad_IV", "Murad IV")] },
  { id: "w303-koprulu", branch: "ottoman", y: 1656, end: 1661, when: "1656–1661", title: "Köprülü Mehmed Pasha serves as grand vizier",
    text: "Under Sultan Mehmed IV, Köprülü Mehmed Pasha was grand vizier from 1656 to 1661. He restored central authority by suppressing insurgents and rivals and made his family prominent in Ottoman administration.", imp: 3,
    cites: [B("biography/Koprulu-Mehmed-Pasa", "Köprülü Mehmed Paşa")] },
  { id: "w303-tulip-period", branch: "ottoman", y: 1718, end: 1730, when: "1718–1730 (some date it from 1717)", title: "The Tulip Period",
    text: "A relatively peaceful era after the Treaty of Passarowitz, when the court turned outward to European culture. It is named for the elite's tulip craze and ended with the Patrona Halil revolt of 1730.", imp: 2,
    cites: [B("topic/Tulip-Period", "Tulip Period"), W("Tulip_period", "Tulip Period")] },
  { id: "w303-muteferrika-press", branch: "ottoman", y: 1727, when: "1727", title: "Müteferrika establishes an Ottoman printing press",
    text: "İbrahim Müteferrika established a printing press in 1727 and printed works on language, history, geography and the natural and physical sciences.", imp: 2,
    cites: [B("biography/Ibrahim-Muteferrika", "İbrahim Müteferrika")] },
  { id: "w303-kucuk-kaynarca", branch: "ottoman", y: 1774.55, when: "July 21, 1774", title: "Treaty of Küçük Kaynarca ends the Russo-Turkish War",
    text: "Russia's frontier reached the southern Bug, it gained Azov and forts at Kerch and Yenikale, and the Crimean khanate became independent in all but religion. Russia also won the right to build an Orthodox church in Constantinople.", imp: 2,
    cites: [{ t: "Treaty of Küçük Kaynarca — Encyclopaedia Britannica", u: "https://www.britannica.com/event/Treaty-of-Kucuk-Kaynarca" }, W("Treaty_of_K%C3%BC%C3%A7%C3%BCk_Kaynarca", "Treaty of Küçük Kaynarca")] },
  { id: "w303-selim3-accession", branch: "ottoman", y: 1789.26, when: "April 7, 1789", title: "Selim III becomes sultan and begins reforms",
    text: "Succeeding his uncle Abdülhamid I, Selim III tried to end administrative chaos and began a program of Westernization, the “New Order” (Nizam-ı Cedid).", imp: 2,
    cites: [B("biography/Selim-III", "Selim III")] },

  // ---------- Safavid Iran ----------
  { id: "w303-tabriz-1501", branch: "safavid", y: 1501, when: "1501", title: "Ismail takes Tabriz and proclaims Shiism",
    text: "With Kizilbash support, Ismail I captured Tabriz and proclaimed Shiism the faith of a mostly Sunni Iran, the founding act of the Safavid state.", imp: 2,
    cites: [B("topic/Safavid-dynasty", "Safavid dynasty")] },
  { id: "w303-naqsh-e-jahan", branch: "safavid", y: 1598, end: 1629, when: "1598–1629", title: "Shah Abbas builds Naqsh-e Jahan Square in Isfahan",
    text: "The great square, ringed by the Shah Mosque, Ali Qapu Palace and Sheikh Lotfollah Mosque, anchored the Safavid city that became one of the largest and most beautiful in Iran.", imp: 2,
    cites: [W("Naqsh-e_Jahan_Square", "Naqsh-e Jahan Square"), B("place/Isfahan", "Isfahan")] },
  { id: "w303-abbas-dies", branch: "safavid", y: 1629, when: "1629", title: "Shah Abbas I dies; Safavid power peaks and then wanes",
    text: "Under Abbas I, Iran became a great power through military success and efficient administration. The dynasty declined after his death in 1629.", imp: 2,
    cites: [B("topic/Safavid-dynasty", "Safavid dynasty")] },
  { id: "w303-zuhab", branch: "safavid", y: 1639.37, when: "May 17, 1639", title: "Treaty of Zuhab fixes the Ottoman–Safavid border",
    text: "Signed at Qasr-e Shirin, the treaty ended the war of 1623–1639 and about 150 years of intermittent warfare, setting a boundary between the two empires that largely persisted into modern times.", imp: 2, link: "ottoman",
    cites: [{ t: "Treaty of Qaṣr-i Shīrīn — Encyclopaedia Britannica", u: "https://www.britannica.com/topic/Treaty-of-Qasr-i-Shirin" }, W("Treaty_of_Zuhab", "Treaty of Zuhab")] },
  { id: "w303-reza-abbasi", branch: "safavid", y: 1635, when: "c. 1635", title: "Painter Reza Abbasi dies in Isfahan",
    text: "Reza Abbasi, the major Persian painter of the Isfahan school and favorite painter of Shah Abbas I, died there around 1635.", imp: 3,
    cites: [B("biography/Reza-Abbasi", "Reza Abbasi")] },
  { id: "w303-isfahan-falls", branch: "safavid", y: 1722, when: "1722", title: "Isfahan falls, ending effective Safavid rule",
    text: "The capital's fall in 1722 broke the dynasty, though a Safavid shah, Tahmasp II, was not deposed until 1732.", imp: 2,
    cites: [B("topic/Safavid-dynasty", "Safavid dynasty")] },

  // ---------- Afsharid Iran ----------
  { id: "w303-nader-assassinated", branch: "afsharid", y: 1747.45, when: "June 1747", title: "Nader Shah assassinated by his own troops",
    text: "Nader Shah, who had ruled Iran since 1736, was killed in 1747 while trying to crush an uprising in Khorasan. His blind grandson Shah Rukh later kept an Afsharid state in Khorasan, with its capital at Mashhad.", imp: 2,
    cites: [B("biography/Nadir-Shah", "Nādir Shāh")] },

  // ---------- Dutch Republic ----------
  { id: "w303-tulip-mania", branch: "dutch-republic", y: 1637.1, when: "1633–1637; crash early 1637", title: "Tulip mania peaks and crashes",
    text: "Tulip prices soared to a peak between 1633 and 1637, then crashed early in 1637 when doubts arose about whether they would keep rising. It became a famed example of a speculative bubble.", imp: 2,
    cites: [B("topic/Tulip-mania", "Tulip mania")] },
  { id: "w303-night-watch", branch: "dutch-republic", y: 1642, when: "1642", title: "Rembrandt paints The Night Watch",
    text: "Painted in 1642, Rembrandt's The Night Watch is a commissioned group portrait of a militia company.", imp: 2,
    cites: [B("biography/Rembrandt-van-Rijn", "Rembrandt van Rijn")] },
  { id: "w303-william-ii-dies", branch: "dutch-republic", y: 1650.85, when: "November 6, 1650", title: "Stadtholder William II dies",
    text: "William II, prince of Orange and stadtholder and captain general of six provinces since 1647, died at The Hague at age 24, after a critical struggle for power in the Dutch Republic.", imp: 2,
    cites: [B("biography/William-II-prince-of-Orange", "William II")] },
  { id: "w303-pearl-earring", branch: "dutch-republic", y: 1665, when: "c. 1665", title: "Vermeer paints Girl with a Pearl Earring",
    text: "Johannes Vermeer of Delft painted the oil portrait, dated c. 1665. It has hung in the Mauritshuis in The Hague since 1902.", imp: 2,
    cites: [W("Girl_with_a_Pearl_Earring", "Girl with a Pearl Earring"), B("biography/Johannes-Vermeer", "Johannes Vermeer")] },
  { id: "w303-rampjaar", branch: "dutch-republic", y: 1672.37, when: "May 1672", title: "France invades the Dutch Republic",
    text: "After signing the secret Treaty of Dover with England in 1670, Louis XIV invaded the Dutch Republic in May 1672 with British naval support, opening the Dutch War.", imp: 2, link: "france",
    cites: [B("event/Dutch-War", "Dutch War")] },
  { id: "w303-leeuwenhoek", branch: "dutch-republic", y: 1674, when: "c. 1674", title: "Leeuwenhoek sees microscopic life",
    text: "Using his own microscopes, Antonie van Leeuwenhoek of Delft likely observed protozoa in 1674 and bacteria some years later, describing “very little animalcules”.", imp: 2,
    cites: [B("biography/Antonie-van-Leeuwenhoek", "Antonie van Leeuwenhoek")] },
  { id: "w303-leiden-jar", branch: "dutch-republic", y: 1745, when: "1745", title: "Musschenbroek discovers the Leyden jar at Leiden",
    text: "Pieter van Musschenbroek of Leiden discovered the principle of the Leyden jar in 1745, at about the same time as E. G. von Kleist of Pomerania.", imp: 3,
    cites: [B("biography/Pieter-van-Musschenbroek", "Pieter van Musschenbroek")] },

  // ---------- England ----------
  { id: "w303-utopia", branch: "england", y: 1516, when: "1516", title: "Thomas More publishes Utopia",
    text: "More coined the word “utopia”, a pun on Greek for “good place” and “no place”, for his 1516 book describing an imagined island society.", imp: 2,
    cites: [B("topic/Utopia", "Utopia")] },
  { id: "w303-prayer-book", branch: "england", y: 1549, when: "1549", title: "First Book of Common Prayer authorized",
    text: "Largely the work of Archbishop Thomas Cranmer, the first Prayer Book was authorized for use in the Church of England in 1549, under Edward VI. It was radically revised in 1552.", imp: 3,
    cites: [B("topic/Book-of-Common-Prayer", "Book of Common Prayer"), W("Book_of_Common_Prayer", "Book of Common Prayer")] },
  { id: "w303-elizabeth-accession", branch: "england", y: 1558.88, when: "November 17, 1558", title: "Elizabeth I becomes queen",
    text: "Elizabeth succeeded her half-sister Mary on Mary's death in 1558 and reigned until 1603, a period often called the Elizabethan Age.", imp: 2,
    cites: [B("biography/Elizabeth-I", "Elizabeth I"), W("Elizabeth_I", "Elizabeth I")] },
  { id: "w303-globe-theatre", branch: "england", y: 1599, when: "1599", title: "The Globe Theatre opens",
    text: "The Globe, opened in 1599, was the London playhouse where many of Shakespeare's plays were staged.", imp: 2,
    cites: [B("topic/Globe-Theatre", "Globe Theatre")] },
  { id: "w303-gunpowder-plot", branch: "england", y: 1605.85, when: "November 5, 1605", title: "The Gunpowder Plot",
    text: "English Roman Catholics, angered by James I's refusal to grant more religious toleration, conspired to blow up Parliament and the king, his queen and his eldest son on November 5, 1605.", imp: 2,
    cites: [B("event/Gunpowder-Plot", "Gunpowder Plot")] },
  { id: "w303-king-james-bible", branch: "england", y: 1611, when: "1611", title: "King James Bible published",
    text: "The English translation, published in 1611 under the patronage of James I, became the standard Bible of English-speaking Protestants.", imp: 2,
    cites: [B("topic/King-James-Version", "King James Version")] },
  { id: "w303-first-folio", branch: "england", y: 1623, when: "1623", title: "Shakespeare's First Folio published",
    text: "The first published edition of William Shakespeare's collected works appeared in 1623, originally titled Mr. William Shakespeares Comedies, Histories & Tragedies.", imp: 2,
    cites: [B("topic/First-Folio", "First Folio")] },
  { id: "w303-great-fire", branch: "england", y: 1666.67, end: 1666.68, when: "September 2–5, 1666", title: "Great Fire of London",
    text: "A fire swept through London from September 2 to 5, 1666. Within days Christopher Wren, John Evelyn and Robert Hooke presented rebuilding plans, but none was adopted and the old street lines were largely kept.", imp: 2,
    cites: [B("event/Great-Fire-of-London", "Great Fire of London")] },
  { id: "w303-paradise-lost", branch: "england", y: 1667, when: "1667", title: "Milton publishes Paradise Lost",
    text: "John Milton's epic poem appeared in 1667. At first only people close to him praised it, but by the early 1700s John Dryden had adapted it as an opera and Alexander Pope had parodied it.", imp: 2,
    cites: [B("biography/John-Milton", "John Milton")] },

  // ---------- France ----------
  { id: "w303-chambord", branch: "france", y: 1519, when: "1519", title: "Francis I begins building Chambord",
    text: "Construction of the extravagant Loire château began in 1519 for Francis I and continued into the 17th century.", imp: 2,
    cites: [B("topic/Chateau-de-Chambord", "Château de Chambord")] },
  { id: "w303-pavia", branch: "france", y: 1525.15, when: "February 24, 1525", title: "Charles V defeats and captures Francis I at Pavia",
    text: "At Pavia the Habsburg emperor Charles V's forces virtually annihilated the French army of 28,000, and Francis I was left a prisoner. It was the decisive engagement of the Italian war between the two rulers.", imp: 2, link: "hre",
    cites: [B("event/Battle-of-Pavia", "Battle of Pavia")] },
  { id: "w303-st-bartholomew", branch: "france", y: 1572.65, when: "August 23–24, 1572", title: "St. Bartholomew's Day massacre",
    text: "A few days after the king's sister married the Protestant Henry of Navarre, a wave of Catholic mob violence in Paris killed many Huguenots who had gathered for the wedding.", imp: 2,
    cites: [W("St._Bartholomew%27s_Day_massacre", "St. Bartholomew's Day massacre"), B("biography/Catherine-de-Medici", "Catherine de Médicis")] },
  { id: "w303-edict-of-nantes", branch: "france", y: 1598.28, when: "April 13, 1598", title: "Henry IV issues the Edict of Nantes",
    text: "The edict granted France's Protestant Huguenots a large measure of religious liberty and brought an end to the Wars of Religion that began in 1562.", imp: 2,
    cites: [B("topic/Edict-of-Nantes", "Edict of Nantes")] },
  { id: "w303-academie-francaise", branch: "france", y: 1635, when: "1634–1635", title: "Richelieu founds the Académie française",
    text: "Cardinal Richelieu established the French Academy in 1634 and it was incorporated in 1635; its original purpose was to maintain standards of literary taste and establish the literary language.", imp: 3,
    cites: [B("topic/French-Academy", "French Academy")] },
  { id: "w303-tartuffe", branch: "france", y: 1664, when: "1664", title: "Molière's Tartuffe first performed",
    text: "Molière's comedy in verse, first performed in 1664, is counted among his masterpieces.", imp: 3,
    cites: [W("Tartuffe", "Tartuffe"), B("biography/Moliere-French-dramatist", "Molière")] },
  { id: "w303-versailles", branch: "france", y: 1682, when: "1682", title: "Louis XIV moves the court to Versailles",
    text: "Versailles became the official royal residence in 1682 and remained so until Louis XIV's death in 1715.", imp: 2,
    cites: [B("topic/Palace-of-Versailles", "Palace of Versailles")] },
  { id: "w303-louis-xiv-dies", branch: "france", y: 1715.67, when: "September 1, 1715", title: "Louis XIV dies after 72 years on the throne",
    text: "King of France since 1643, Louis XIV ruled principally from his great palace at Versailles during one of the country's most brilliant periods, and died there in 1715.", imp: 2,
    cites: [B("biography/Louis-XIV-king-of-France", "Louis XIV")] },
  { id: "w303-spirit-of-laws", branch: "france", y: 1748, when: "1748", title: "Montesquieu publishes The Spirit of Laws",
    text: "Montesquieu's 1748 work is one of the great works in the history of political theory and of jurisprudence.", imp: 2,
    cites: [B("biography/Montesquieu", "Montesquieu")] },
  { id: "w303-social-contract", branch: "france", y: 1762, when: "1762", title: "Rousseau publishes The Social Contract",
    text: "Jean-Jacques Rousseau's 1762 work introduced the concept of the “general will” and strongly influenced later thinking about government and freedom.", imp: 2,
    cites: [B("topic/The-Social-Contract", "The Social Contract")] },

  // ---------- Kingdom of Great Britain ----------
  { id: "w303-messiah", branch: "great-britain", y: 1742.28, when: "April 13, 1742", title: "Handel's Messiah premieres in Dublin",
    text: "Handel's oratorio, composed in 1741, premiered in Dublin on April 13, 1742, at Easter. Britannica calls it the most famous of all oratorios.", imp: 2,
    cites: [B("topic/Messiah-oratorio-by-Handel", "Messiah"), B("biography/George-Frideric-Handel", "George Frideric Handel")] },
  { id: "w303-culloden", branch: "great-britain", y: 1746.29, when: "April 16, 1746", title: "Battle of Culloden ends the Jacobite rising",
    text: "Near Inverness, British forces under the Duke of Cumberland defeated the Jacobites under Charles Edward Stuart in the last battle of the Forty-five Rebellion.", imp: 2,
    cites: [B("event/Battle-of-Culloden", "Battle of Culloden"), W("Battle_of_Culloden", "Battle of Culloden")] },

  // ---------- Holy Roman Empire ----------
  { id: "w303-imperial-circles", branch: "hre", y: 1500, when: "1500", title: "Diet of Augsburg creates the imperial circles",
    text: "Under Maximilian I, six imperial circles were introduced at the 1500 Diet of Augsburg to organize defense and imperial taxes; three more were added in 1512 and the Saxon circle split, making ten.", imp: 3,
    cites: [B("topic/Kreis", "Kreis"), W("Imperial_circle", "Imperial circle")] },
  { id: "w303-peasants-war", branch: "hre", y: 1524, end: 1525, when: "1524–1525", title: "German Peasants' War",
    text: "Inspired by the Reformation, peasants in western and southern Germany invoked divine law to demand agrarian rights and freedom from oppression by nobles and landlords.", imp: 2,
    cites: [B("topic/Peasants-War", "Peasants' War")] },
  { id: "w303-wallenstein-killed", branch: "hre", y: 1634.15, when: "February 25, 1634", title: "Wallenstein killed at Eger",
    text: "Albrecht von Wallenstein, the Bohemian soldier who commanded Emperor Ferdinand II's armies in the Thirty Years' War, was assassinated at Eger in 1634 with the emperor's approval.", imp: 3,
    cites: [B("biography/Albrecht-von-Wallenstein", "Albrecht von Wallenstein"), W("Albrecht_von_Wallenstein", "Albrecht von Wallenstein")] },
  { id: "w303-brandenburg-concertos", branch: "hre", y: 1721, when: "1721", title: "Bach dedicates the Brandenburg Concertos",
    text: "Composed circa 1711–20, Johann Sebastian Bach's six concertos were dedicated in 1721 to Christian Ludwig, margrave of Brandenburg.", imp: 2,
    cites: [B("topic/Brandenburg-Concertos", "Brandenburg Concertos")] },
  { id: "w303-bach-leipzig", branch: "hre", y: 1723, when: "1723", title: "Bach becomes cantor at Leipzig",
    text: "Bach left Köthen in 1723 to become Thomaskantor in Leipzig, responsible for music in the city's four Lutheran churches and the St. Thomas School.", imp: 3,
    cites: [B("biography/Johann-Sebastian-Bach", "Johann Sebastian Bach"), W("Johann_Sebastian_Bach", "Johann Sebastian Bach")] },
  { id: "w303-toleration-patent", branch: "hre", y: 1781, when: "1781", title: "Joseph II issues the Patent of Toleration",
    text: "Joseph II's 1781 Patent of Toleration gave a limited guarantee of freedom of worship in his Habsburg lands; the same year he abolished serfdom.", imp: 2,
    cites: [B("biography/Joseph-II", "Joseph II"), W("Joseph_II,_Holy_Roman_Emperor", "Joseph II, Holy Roman Emperor")] },
  { id: "w303-magic-flute", branch: "hre", y: 1791.74, when: "September 30, 1791", title: "Mozart's The Magic Flute premieres near Vienna",
    text: "Mozart's opera premiered at the Theater auf der Wieden in the suburbs of Vienna on September 30, 1791, weeks before his death.", imp: 2,
    cites: [B("topic/The-Magic-Flute", "The Magic Flute"), B("biography/Wolfgang-Amadeus-Mozart", "Wolfgang Amadeus Mozart")] },
] });

TL.geo("w303-amasya-peace", { scope: "place", lat: 40.65, lon: 35.83, r: 60, label: "Amasya, Turkey", src: "https://en.wikipedia.org/wiki/Amasya" });
TL.geo("w303-selimiye", { scope: "place", lat: 41.678, lon: 26.559, r: 40, label: "Edirne, Turkey", src: "https://en.wikipedia.org/wiki/Selimiye_Mosque,_Edirne" });
TL.geo("w303-iznik-ware", { scope: "place", lat: 40.43, lon: 29.72, r: 50, label: "İznik, Turkey", src: "https://en.wikipedia.org/wiki/%C4%B0znik" });
TL.geo("w303-jelali", { scope: "region", lat: 39, lon: 35, r: 600, label: "Anatolia", src: "https://en.wikipedia.org/wiki/Anatolia" });
TL.geo("w303-sultanahmet", { scope: "place", lat: 41.005, lon: 28.977, r: 40, label: "Istanbul", src: "https://en.wikipedia.org/wiki/Blue_Mosque,_Istanbul" });
TL.geo("w303-baghdad-1638", { scope: "place", lat: 33.32, lon: 44.37, r: 60, label: "Baghdad, Iraq", src: "https://en.wikipedia.org/wiki/Baghdad" });
TL.geo("w303-koprulu", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Istanbul", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w303-tulip-period", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Istanbul", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w303-muteferrika-press", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Istanbul", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w303-kucuk-kaynarca", { scope: "place", lat: 43.983, lon: 27.5, r: 50, label: "Küçük Kaynarca (Kaynardzha), Bulgaria", src: "https://en.wikipedia.org/wiki/Kaynardzha" });
TL.geo("w303-selim3-accession", { scope: "place", lat: 41.01, lon: 28.95, r: 40, label: "Istanbul", src: "https://en.wikipedia.org/wiki/Istanbul" });
TL.geo("w303-tabriz-1501", { scope: "place", lat: 38.07, lon: 46.3, r: 50, label: "Tabriz, Iran", src: "https://en.wikipedia.org/wiki/Tabriz" });
TL.geo("w303-naqsh-e-jahan", { scope: "place", lat: 32.6575, lon: 51.6778, r: 30, label: "Isfahan, Iran", src: "https://en.wikipedia.org/wiki/Naqsh-e_Jahan_Square" });
TL.geo("w303-abbas-dies", { scope: "place", lat: 32.67, lon: 51.67, r: 50, label: "Isfahan, Iran", src: "https://en.wikipedia.org/wiki/Isfahan" });
TL.geo("w303-zuhab", { scope: "place", lat: 34.51, lon: 45.58, r: 40, label: "Qasr-e Shirin, Iran", src: "https://en.wikipedia.org/wiki/Qasr-e_Shirin" });
TL.geo("w303-reza-abbasi", { scope: "place", lat: 32.67, lon: 51.67, r: 50, label: "Isfahan, Iran", src: "https://en.wikipedia.org/wiki/Isfahan" });
TL.geo("w303-isfahan-falls", { scope: "place", lat: 32.67, lon: 51.67, r: 50, label: "Isfahan, Iran", src: "https://en.wikipedia.org/wiki/Isfahan" });
TL.geo("w303-nader-assassinated", { scope: "region", lat: 35.78, lon: 58.7, r: 300, label: "Khorasan, Iran", src: "https://en.wikipedia.org/wiki/Razavi_Khorasan_Province" });
TL.geo("w303-tulip-mania", { scope: "region", lat: 52.25, lon: 4.667, r: 80, label: "Holland, Netherlands", src: "https://en.wikipedia.org/wiki/Holland" });
TL.geo("w303-night-watch", { scope: "place", lat: 52.37, lon: 4.89, r: 30, label: "Amsterdam, Netherlands", src: "https://en.wikipedia.org/wiki/Amsterdam" });
TL.geo("w303-william-ii-dies", { scope: "place", lat: 52.08, lon: 4.31, r: 30, label: "The Hague, Netherlands", src: "https://en.wikipedia.org/wiki/The_Hague" });
TL.geo("w303-pearl-earring", { scope: "place", lat: 52.01, lon: 4.36, r: 30, label: "Delft, Netherlands", src: "https://en.wikipedia.org/wiki/Delft" });
TL.geo("w303-rampjaar", { scope: "place", lat: 52.09, lon: 5.12, r: 80, label: "Utrecht, Netherlands", src: "https://en.wikipedia.org/wiki/Utrecht" });
TL.geo("w303-leeuwenhoek", { scope: "place", lat: 52.01, lon: 4.36, r: 30, label: "Delft, Netherlands", src: "https://en.wikipedia.org/wiki/Delft" });
TL.geo("w303-leiden-jar", { scope: "place", lat: 52.16, lon: 4.49, r: 30, label: "Leiden, Netherlands", src: "https://en.wikipedia.org/wiki/Leiden" });
TL.geo("w303-utopia", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w303-prayer-book", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w303-elizabeth-accession", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w303-globe-theatre", { scope: "place", lat: 51.508, lon: -0.097, r: 30, label: "Bankside, London", src: "https://en.wikipedia.org/wiki/Shakespeare%27s_Globe" });
TL.geo("w303-gunpowder-plot", { scope: "place", lat: 51.4995, lon: -0.1248, r: 30, label: "Palace of Westminster, London", src: "https://en.wikipedia.org/wiki/Palace_of_Westminster" });
TL.geo("w303-king-james-bible", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w303-first-folio", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w303-great-fire", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w303-paradise-lost", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w303-chambord", { scope: "place", lat: 47.616, lon: 1.517, r: 40, label: "Chambord, France", src: "https://en.wikipedia.org/wiki/Ch%C3%A2teau_de_Chambord" });
TL.geo("w303-pavia", { scope: "place", lat: 45.185, lon: 9.155, r: 40, label: "Pavia, Italy", src: "https://en.wikipedia.org/wiki/Pavia" });
TL.geo("w303-st-bartholomew", { scope: "place", lat: 48.857, lon: 2.352, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w303-edict-of-nantes", { scope: "place", lat: 47.218, lon: -1.553, r: 40, label: "Nantes, France", src: "https://en.wikipedia.org/wiki/Nantes" });
TL.geo("w303-academie-francaise", { scope: "place", lat: 48.857, lon: 2.352, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w303-tartuffe", { scope: "place", lat: 48.857, lon: 2.352, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w303-versailles", { scope: "place", lat: 48.805, lon: 2.12, r: 30, label: "Versailles, France", src: "https://en.wikipedia.org/wiki/Palace_of_Versailles" });
TL.geo("w303-louis-xiv-dies", { scope: "place", lat: 48.805, lon: 2.12, r: 30, label: "Versailles, France", src: "https://en.wikipedia.org/wiki/Palace_of_Versailles" });
TL.geo("w303-spirit-of-laws", { scope: "place", lat: 48.857, lon: 2.352, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w303-social-contract", { scope: "place", lat: 48.857, lon: 2.352, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w303-messiah", { scope: "place", lat: 53.35, lon: -6.26, r: 30, label: "Dublin, Ireland", src: "https://en.wikipedia.org/wiki/Dublin" });
TL.geo("w303-culloden", { scope: "place", lat: 57.477, lon: -4.0925, r: 30, label: "Culloden, Scotland", src: "https://en.wikipedia.org/wiki/Battle_of_Culloden" });
TL.geo("w303-imperial-circles", { scope: "place", lat: 48.37, lon: 10.9, r: 40, label: "Augsburg, Germany", src: "https://en.wikipedia.org/wiki/Augsburg" });
TL.geo("w303-peasants-war", { scope: "region", lat: 51, lon: 9, r: 400, label: "Southern and western Germany", src: "https://en.wikipedia.org/wiki/Germany" });
TL.geo("w303-wallenstein-killed", { scope: "place", lat: 50.08, lon: 12.37, r: 30, label: "Cheb (Eger), Czech Republic", src: "https://en.wikipedia.org/wiki/Cheb" });
TL.geo("w303-brandenburg-concertos", { scope: "place", lat: 52.52, lon: 13.405, r: 40, label: "Berlin, Germany", src: "https://en.wikipedia.org/wiki/Berlin" });
TL.geo("w303-bach-leipzig", { scope: "place", lat: 51.34, lon: 12.37, r: 40, label: "Leipzig, Germany", src: "https://en.wikipedia.org/wiki/Leipzig" });
TL.geo("w303-toleration-patent", { scope: "place", lat: 48.21, lon: 16.37, r: 40, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
TL.geo("w303-magic-flute", { scope: "place", lat: 48.21, lon: 16.37, r: 40, label: "Vienna, Austria", src: "https://en.wikipedia.org/wiki/Vienna" });
