// "Why it matters" context and cross-links: early modern and long 19th-century entries (batch 5, November 2026).
// Every sentence in `why` and every connection note is supported by the enrich cites below (read in this session).

TL.enrich("me-thirty-years-war", {
  why: "Modern historians estimate the war killed 4.5 to 8 million people, mostly civilians, through plague, famine and violence; the German lands of the Empire lost roughly 40% of their population and did not regain prewar levels until about 1750. Historians place it within the “General Crisis” of the mid-17th century, a period of conflict and unrest from Ming China to the British Isles. Some international relations scholars trace “Westphalian sovereignty” — non-interference in other states' internal affairs — to the 1648 peace; most modern historians call that a “Westphalian myth,” though they agree it symbolizes the end of Europe's long era of religious wars.",
  connections: [
    { id: "hx-peace-of-augsburg", note: "Westphalia reinterpreted Augsburg's rule that subjects follow their ruler's faith" },
    { id: "me-dutch-recognized", note: "Spain made peace with the Dutch at Münster during the same congress" },
  ],
  cites: [
    { t: "Treaty of Westphalia; October 24, 1648 — The Avalon Project, Yale Law School", u: "https://avalon.law.yale.edu/17th_century/westphal.asp", k: "primary" },
    { t: "Thirty Years' War — Wikipedia", u: "https://en.wikipedia.org/wiki/Thirty_Years%27_War" },
    { t: "Peace of Westphalia — Wikipedia", u: "https://en.wikipedia.org/wiki/Peace_of_Westphalia" },
  ],
});

TL.enrich("qing", {
  why: "China's last imperial dynasty ruled its largest extent in the 18th century, about 13 million km² including present-day Xinjiang, Mongolia and Tibet, and its emperors defined “China” as a multi-ethnic state rather than only the Han lands. The population, about 150 million in 1700, doubled over the next century and reached some 450 million by 1850, helped by New World crops such as maize and sweet potatoes. Industrialized European militaries then outmatched it: the First Opium War marked the start of what 20th-century Chinese nationalists called the “century of humiliation.”",
  connections: [
    { id: "lc-first-opium-war", note: "Defeat began what Chinese nationalists called the “century of humiliation”" },
    { id: "lc-xinhai-revolution", note: "The 1911 Wuchang Uprising led to the Republic and the dynasty's end" },
  ],
  cites: [
    { t: "Qing dynasty — Wikipedia", u: "https://en.wikipedia.org/wiki/Qing_dynasty" },
    { t: "First Opium War — Wikipedia", u: "https://en.wikipedia.org/wiki/First_Opium_War" },
  ],
});

TL.enrich("maratha", {
  why: "The Maratha insurgency came at great cost to Aurangzeb's Mughal Empire, and after 1707 the Peshwas and great families such as the Scindias and Holkars carried Maratha power across northern and central India, from 1771 holding Delhi and the Mughal emperor. Ahmad Shah Durrani's victory at Panipat in 1761 halted their imperial expansion, and the British East India Company's intervention destroyed the confederacy by 1818, as Maratha chiefs fought separately and surrendered one by one. Shivaji is nowadays sometimes seen as a divinely inspired hero, and some historians credit the Maratha navy with laying the foundation of the Indian Navy.",
  connections: [
    { id: "hx-third-panipat", note: "Defeat by Ahmad Shah Durrani's army halted Maratha expansion" },
    { id: "mughal", note: "Rose in revolt against Aurangzeb and later held the Mughal emperor as a puppet" },
    { id: "british-raj", note: "The East India Company destroyed the confederacy by 1818" },
  ],
  cites: [
    { t: "Maratha Power: its rise and fall (c. 1674–c. 1818) — Frances W. Pritchett, Columbia University", u: "https://franpritchett.com/00routesdata/1600_1699/marathas/marathas.html", k: "reference" },
    { t: "Maratha Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Maratha_Empire" },
  ],
});

TL.enrich("enlightenment", {
  why: "The Stanford Encyclopedia of Philosophy notes that the era is marked by three political revolutions — the English (1688), the American (1775–83) and the French (1789–99) — that together lay the basis for modern republican, constitutional democracies, and calls Locke's Second Treatise the classical source of modern liberal political theory. Its ideas were contested from the start: critics, later grouped as the “Counter-Enlightenment,” defended traditional religious and political authority, while Mary Wollstonecraft, one of England's earliest feminist philosophers, argued that women as well as men should be treated as rational beings.",
  connections: [
    { id: "me-principia", note: "Newton's Principia served as a model and inspiration for Enlightenment thinkers" },
    { id: "me-locke-treatises", note: "The classical source of modern liberal political theory" },
    { id: "me-bastille", note: "The French Revolution is the upheaval most associated with the Enlightenment" },
  ],
  cites: [
    { t: "Enlightenment — Stanford Encyclopedia of Philosophy", u: "https://plato.stanford.edu/entries/enlightenment/", k: "reference" },
    { t: "Age of Enlightenment — Wikipedia", u: "https://en.wikipedia.org/wiki/Age_of_Enlightenment" },
  ],
});

TL.enrich("me-principia", {
  why: "By explaining the motions of heavenly and earthly bodies with a few simple, universally applicable mathematical laws, the Principia, the Stanford Encyclopedia of Philosophy says, was a great stimulus to 18th-century thought and a model for Enlightenment thinkers. Newton titled it in allusion to Descartes's Principia Philosophiae, and it was read as a world view opposed to the Cartesian one. Since Einstein's special and general theories of relativity, Newtonian theory is seen to hold only to a high approximation in limited circumstances.",
  connections: [
    { id: "me-copernicus", note: "Historians date the Scientific Revolution from Copernicus to Newton's “grand synthesis”" },
    { id: "enlightenment", note: "Served as a model and inspiration for Enlightenment thinkers" },
    { id: "lc-einstein-1905", note: "Einstein's relativity later showed Newton's theory to be an approximation" },
  ],
  cites: [
    { t: "Newton's Philosophiae Naturalis Principia Mathematica — Stanford Encyclopedia of Philosophy", u: "https://plato.stanford.edu/entries/newton-principia/", k: "reference" },
    { t: "Enlightenment — Stanford Encyclopedia of Philosophy", u: "https://plato.stanford.edu/entries/enlightenment/", k: "reference" },
    { t: "Scientific Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Scientific_Revolution" },
  ],
});

TL.enrich("ashanti", {
  why: "From the Ashanti Region, Asante expanded to cover most of present-day Ghana and parts of Ivory Coast and Togo, fighting to control trade routes linking the forest with northern markets and the coast; captives from its wars were sold as slaves at European forts such as Elmina and Cape Coast. It held its own in the first two of five wars with Britain, killing the British general Sir Charles MacCarthy in 1824, but British forces later burned Kumasi and the empire became part of the Gold Coast colony on January 1, 1902. Its wealth, hierarchy and culture have left more historical records by European authors than any other indigenous culture of sub-Saharan Africa.",
  connections: [
    { id: "hx-war-golden-stool", note: "Yaa Asantewaa led the final resistance to the British in 1900" },
    { id: "ghana", note: "The Gold Coast became independent Ghana on March 6, 1957" },
  ],
  cites: [
    { t: "Asante Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Ashanti_Empire" },
    { t: "Ghana — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/ghana", k: "archive" },
  ],
});

TL.enrich("hx-jenner-vaccine", {
  why: "Jenner's was the world's first vaccine, and the words vaccine and vaccination come from his name for cowpox, Variolae vaccinae. Others, such as the Dorset farmer Benjamin Jesty, had tested cowpox against smallpox before him, but Jenner's 1798 report was translated into many languages within twenty years, and vaccination gradually replaced the riskier practice of variolation. On May 8, 1980, the World Health Assembly declared the world free of smallpox, almost two centuries after Jenner hoped vaccination could wipe it out.",
  connections: [
    { id: "g7-smallpox-eradicated", note: "Vaccination ended in smallpox's eradication, declared May 8, 1980" },
  ],
  cites: [
    { t: "History of Smallpox — CDC", u: "https://www.cdc.gov/smallpox/about/history.html", k: "reference" },
    { t: "Smallpox: A Great and Terrible Scourge — Vaccination — U.S. National Library of Medicine", u: "https://www.nlm.nih.gov/exhibition/smallpox/sp_vaccination.html", k: "museum" },
    { t: "Edward Jenner — Wikipedia", u: "https://en.wikipedia.org/wiki/Edward_Jenner" },
  ],
});

TL.enrich("afghanistan", {
  why: "Ahmad Shah Durrani's empire at its peak reached from present-day Afghanistan across much of Pakistan and into Iran and India, and his 1761 victory over the Marathas at Panipat was the high point of Afghan power. In the 19th century Afghanistan became a buffer state in the “Great Game” between the British and Russian empires, and the 1893 Durand Line, which divided Pashtun and Baloch lands, still forms its border with Pakistan. Since the late 1970s its history has been defined by coups, invasions, insurgencies and civil wars.",
  connections: [
    { id: "hx-third-panipat", note: "Ahmad Shah's victory over the Marathas, the peak of Afghan power" },
    { id: "mx-soviet-afghan-war", note: "Part of the warfare that has defined Afghanistan since the late 1970s" },
  ],
  cites: [
    { t: "Afghanistan — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/afghanistan", k: "archive" },
    { t: "Durrani Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Durrani_Empire" },
    { t: "Afghanistan — Wikipedia", u: "https://en.wikipedia.org/wiki/Afghanistan" },
  ],
});

TL.enrich("great-britain", {
  why: "England and Scotland had shared a monarch since 1603, but repeated attempts at political union had failed until the 1706 Treaty of Union. Scotland kept its own laws, courts, Presbyterian church and schools, and the Scottish Enlightenment, centered in Edinburgh, had a major impact on British, American and European thinking. Over the 18th century Great Britain rose to become the world's dominant colonial power, with France as its chief rival: victory in the Seven Years' War made the British Empire the foremost global power for over a century, even as it lost the Thirteen Colonies. The Industrial Revolution also began in Great Britain, around 1760.",
  connections: [
    { id: "me-union-of-crowns", note: "One monarch had ruled both kingdoms since 1603" },
    { id: "me-seven-years-war", note: "Victory made the British Empire the foremost global power" },
    { id: "industrial-revolution", note: "Industrialization began in Great Britain around 1760" },
  ],
  cites: [
    { t: "Kingdom of Great Britain — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Great_Britain" },
    { t: "Industrial Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Industrial_Revolution" },
  ],
});

TL.enrich("russian-empire", {
  why: "Peter the Great's wars turned Russia into a major European power, and at its late-19th-century height the empire covered about 22.8 million km², roughly one-sixth of the world's land, making it the third-largest empire in history after the British and Mongol empires. It reached from the Baltic to the Pacific and, until 1867, Alaska, and its 1897 census counted 126 million people of many ethnicities and languages. The 1861 emancipation of the serfs is called the single most important event in 19th-century Russian history; First World War losses and shortages then brought the February Revolution of 1917 and the end of the monarchy.",
  connections: [
    { id: "lc-serf-emancipation", note: "Freeing the serfs in 1861 began the end of the nobility's monopoly on power" },
    { id: "lc-alaska-purchase", note: "Russia administered Alaska from 1799 to 1867" },
    { id: "lc-february-revolution", note: "Wartime unrest ended the monarchy in 1917" },
  ],
  cites: [
    { t: "Russian Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Russian_Empire" },
  ],
});

TL.enrich("industrial-revolution", {
  why: "Historians describe the Industrial Revolution as influencing almost every aspect of life: for the first time average income and population began sustained growth, though some argue living standards did not improve meaningfully until the 20th century. Before it, most manufacturing took place in China and India; afterward most was in North America and Western Europe. The shift from hand production to the mechanized factory system also drew people to the cities — many of the laborers who built the railways stayed on as factory workers — while machines that cut farm labor helped provoke unrest such as the 1830 Swing Riots.",
  connections: [
    { id: "me-darby-coke", note: "Coke smelting began iron's shift from charcoal to coal" },
    { id: "me-watt-condenser", note: "Watt's engine became the workhorse of the revolution" },
    { id: "second-industrial-revolution", note: "Followed it from the late 19th century" },
  ],
  cites: [
    { t: "Industrial Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Industrial_Revolution" },
    { t: "James Watt — Wikipedia", u: "https://en.wikipedia.org/wiki/James_Watt" },
    { t: "Second Industrial Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Second_Industrial_Revolution" },
  ],
});

TL.enrich("me-watt-condenser", {
  why: "Watt's insight was that Newcomen-type engines wasted much of their energy by repeatedly cooling and reheating the cylinder; condensing the steam in a separate vessel avoided this. One author says his improvements “converted it from a prime mover of marginal efficiency into the mechanical workhorse of the Industrial Revolution.” Steam locomotives followed once high-pressure engines appeared after the Boulton and Watt patent expired in 1800. The SI unit of power, the watt, is named after him.",
  connections: [
    { id: "me-newcomen", note: "Watt improved on Newcomen's 1712 atmospheric engine" },
    { id: "industrial-revolution", note: "His engine was fundamental to the Industrial Revolution's changes" },
  ],
  cites: [
    { t: "James Watt — Wikipedia", u: "https://en.wikipedia.org/wiki/James_Watt" },
    { t: "Industrial Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Industrial_Revolution" },
  ],
});

TL.enrich("usa", {
  why: "The Declaration's second sentence — that “all men are created equal” and endowed with “unalienable Rights” — is considered one of the most significant lines in world history, and John Locke is usually cited as a primary influence on Jefferson. Declaring independence let the colonies seek foreign recognition and the 1778 alliance with France; Britain acknowledged US sovereignty in the 1783 Treaty of Paris. The Declaration has become one of the most influential statements on human rights, yet Congress struck Jefferson's passage blaming George III for slavery, partly to appease South Carolina and Georgia.",
  connections: [
    { id: "me-locke-treatises", note: "Locke is usually cited as a primary influence on the Declaration" },
    { id: "me-treaty-of-paris-1783", note: "Britain officially acknowledged US independence" },
    { id: "me-bastille", note: "France's 1789 Declaration of Rights drew largely on American ideals" },
  ],
  cites: [
    { t: "The Declaration of Independence, 1776 — Office of the Historian", u: "https://history.state.gov/milestones/1776-1783/declaration", k: "archive" },
    { t: "United States Declaration of Independence — Wikipedia", u: "https://en.wikipedia.org/wiki/United_States_Declaration_of_Independence" },
  ],
});

TL.enrich("iran", {
  why: "Agha Mohammad Khan reunified Iran and made Tehran his capital. Under the Gulistan (1813) and Turkmenchay (1828) treaties the Qajars lost present-day eastern Georgia, Azerbaijan, Armenia and Dagestan to Russia, lands that stayed Russian for some 180 years. Squeezed between the Russian and British empires, Qajar Iran still kept relative independence, and under Naser al-Din Shah Western science and education arrived and modernization began. The Constitutional Revolution of the early 20th century created an elected parliament, the Majles, though Russian intervention reversed many of its reforms.",
  connections: [
    { id: "lc-turkmenchay", note: "Ceded the South Caucasus to Russia in 1828" },
    { id: "lc-persian-constitutional-revolution", note: "Created Iran's first elected parliament" },
  ],
  cites: [
    { t: "Qajar Iran — Wikipedia", u: "https://en.wikipedia.org/wiki/Qajar_Iran" },
  ],
});

TL.enrich("me-bastille", {
  why: "The fortress held only seven prisoners and was already slated for demolition, but revolutionaries saw it as a symbol of the monarchy's abuse of power, and its storming has been portrayed as a defining revolutionary act; July 14 is France's national holiday. The Declaration that followed proclaimed that “Men are born and remain free and equal in rights” and that sovereignty “resides essentially in the nation.” Historians credit the revolution with ending feudalism in France, mounting the most significant challenge to absolutism up to that time and spreading democratic ideals through Europe and the world; many of its ideas are considered fundamental principles of liberal democracy.",
  connections: [
    { id: "me-haitian-revolution", note: "Revolutionary politics over colonial rights destabilized Saint-Domingue" },
    { id: "me-brumaire", note: "Napoleon's 1799 coup ended the revolutionary decade" },
  ],
  cites: [
    { t: "Declaration of the Rights of Man, 1789 — The Avalon Project, Yale Law School", u: "https://avalon.law.yale.edu/18th_century/rightsof.asp", k: "primary" },
    { t: "Storming of the Bastille — Wikipedia", u: "https://en.wikipedia.org/wiki/Storming_of_the_Bastille" },
    { t: "French Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/French_Revolution" },
    { t: "Haitian Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Haitian_Revolution" },
  ],
});

TL.enrich("me-haitian-revolution", {
  why: "The largest slave uprising since Spartacus's revolt against Rome nearly 1,900 years earlier, it shocked the Western world; historians call it a defining moment in the history of the Atlantic World, and its effects on slavery were felt throughout the Americas. The historian Michel-Rolph Trouillot argues that its history has been “silenced” compared with that of the French Revolution. Yellow fever devastated the French army sent to retake the colony, and Napoleon gave up his plans for Louisiana and sold the territory to the United States in 1803.",
  connections: [
    { id: "haiti", note: "The revolution founded Haiti, independent from January 1, 1804" },
    { id: "lc-louisiana-purchase", note: "French losses in Saint-Domingue led Napoleon to sell Louisiana" },
    { id: "me-bastille", note: "Revolutionary politics over colonial rights destabilized Saint-Domingue" },
  ],
  cites: [
    { t: "Louisiana Purchase, 1803 — Office of the Historian", u: "https://history.state.gov/milestones/1801-1829/louisiana-purchase", k: "archive" },
    { t: "Haitian Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Haitian_Revolution" },
  ],
});

TL.enrich("haiti", {
  why: "Haiti is the second-oldest republic in the Western Hemisphere, after the United States. Its independence came at a heavy price: in 1825 France, with warships offshore, made recognition conditional on 150 million gold francs for former slaveholders; reduced to 90 million, the debt was not paid off until 1947 and left the government deeply impoverished. The United States withheld recognition until 1862. In 1815 President Alexandre Pétion gave Simón Bolívar sanctuary and material and military support, aid that played a defining role in liberating the lands that formed Gran Colombia.",
  connections: [
    { id: "me-haitian-revolution", note: "The revolution that founded the state" },
    { id: "gran-colombia", note: "Pétion's aid was vital to Bolívar's liberation of the region" },
  ],
  cites: [
    { t: "Haiti — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/haiti", k: "archive" },
    { t: "Haitian Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Haitian_Revolution" },
    { t: "Alexandre Pétion — Wikipedia", u: "https://en.wikipedia.org/wiki/Alexandre_P%C3%A9tion" },
  ],
});

TL.enrich("uk", {
  why: "After the Irish Rebellion of 1798, fear that an independent Ireland would side with revolutionary France led Britain to unite the two kingdoms. The Victorian era (1837–1901) marked the height of the British Industrial Revolution and the apex of the British Empire, but in Ireland more than a million people died in the Great Famine of the 1840s, when the government did little to help the starving poor, and another million emigrated. Growing demand for Irish self-government led to the Irish War of Independence and the Free State's departure in 1922, leaving the United Kingdom of Great Britain and Northern Ireland.",
  connections: [
    { id: "kingdom-of-ireland", note: "The Irish kingdom merged into the Union on January 1, 1801" },
    { id: "lc-irish-famine", note: "Over a million died and another million emigrated" },
    { id: "lc-anglo-irish-treaty", note: "Led to the Irish Free State leaving the UK in 1922" },
  ],
  cites: [
    { t: "United Kingdom of Great Britain and Ireland — Wikipedia", u: "https://en.wikipedia.org/wiki/United_Kingdom_of_Great_Britain_and_Ireland" },
  ],
});

TL.enrich("austria-hungary", {
  why: "Francis II proclaimed the Austrian Empire in answer to Napoleon's, and it outlived the Holy Roman Empire, dissolved in 1806. Defeats in Italy and by Prussia in 1866 shut Austria out of German affairs and pushed Vienna into the 1867 compromise with Hungary to keep its great-power status. The multinational dual monarchy was Europe's second-largest country by area, but it began the First World War by declaring war on Serbia on July 28, 1914, after annexing Bosnia and Herzegovina in 1908. It had effectively dissolved by the time it signed the armistice in November 1918.",
  connections: [
    { id: "hre", note: "Outlived the Holy Roman Empire, dissolved in 1806" },
    { id: "lc-world-war-i", note: "Its July 28, 1914 declaration of war on Serbia began the war" },
  ],
  cites: [
    { t: "Austrian Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Austrian_Empire" },
    { t: "Austria-Hungary — Wikipedia", u: "https://en.wikipedia.org/wiki/Austria-Hungary" },
  ],
});

TL.enrich("lc-slave-trade-act", {
  why: "The campaign was organized from 1787 by Evangelical Protestants allied with Quakers, and William Wilberforce brought motions to the Commons from 1791. To enforce the ban the Royal Navy formed the West Africa Squadron in 1808, which by 1860 had seized about 1,600 slave ships and freed some 150,000 Africans aboard them. Britain then used its diplomatic influence on other nations: Portugal agreed to restrict its trade in 1810, Sweden, the Netherlands and France followed, and an 1817 treaty called for Spain to suppress its trade by 1820. Slavery itself stayed legal in most of the empire until 1833.",
  connections: [
    { id: "lc-slavery-abolition-act", note: "Slavery itself remained legal in most of the empire until 1833" },
    { id: "me-atlantic-slave-trade", note: "The trade the act banned for British subjects" },
  ],
  cites: [
    { t: "Slave Trade Act 1807 — Wikipedia", u: "https://en.wikipedia.org/wiki/Slave_Trade_Act_1807" },
  ],
});

TL.enrich("lc-slavery-abolition-act", {
  why: "The government raised £20 million to pay slave-owners — 40% of the Treasury's annual income in 1833, or about 5% of British GDP — while the enslaved received no compensation. Most freed people over the age of six became “apprentices” owing up to 45 hours of unpaid work a week, though Antigua and Bermuda granted immediate freedom. Other abolitions followed: France's Second Republic abolished slavery in 1848, the 13th Amendment ended it in the United States in 1865, and Brazil's Golden Law in 1888.",
  connections: [
    { id: "lc-slave-trade-act", note: "Banning the trade in 1807 had freed no one already enslaved" },
    { id: "lc-france-abolishes-slavery", note: "France's Second Republic abolished slavery in 1848" },
    { id: "lc-thirteenth-amendment", note: "The United States abolished slavery in 1865" },
  ],
  cites: [
    { t: "Slavery Abolition Act 1833 — Wikipedia", u: "https://en.wikipedia.org/wiki/Slavery_Abolition_Act_1833" },
    { t: "Revolutions of 1848 — Wikipedia", u: "https://en.wikipedia.org/wiki/Revolutions_of_1848" },
    { t: "13th Amendment to the U.S. Constitution: Abolition of Slavery (1865) — US National Archives", u: "https://www.archives.gov/milestone-documents/13th-amendment", k: "archive" },
    { t: "Empire of Brazil — Wikipedia", u: "https://en.wikipedia.org/wiki/Empire_of_Brazil" },
  ],
});

TL.enrich("lc-congress-of-vienna", {
  why: "Metternich, the architect of the postwar alliance system, and other conservative leaders sought to restrain liberal and revolutionary movements; in his 1820 “Political Confession of Faith” he blamed revolution on “presumption.” The closed-door dealings of the five great powers laid the groundwork for the Concert of Europe. Historians remain divided: some blame the Congress for suppressing national, democratic and liberal movements, while others, Henry Kissinger among them, praise it for preventing another general European war for nearly a century (1815–1914). Before the Paris peace conference after the First World War, Britain's Foreign Office commissioned its history as a model.",
  connections: [
    { id: "german-confederation", note: "Created the German Confederation to replace the Holy Roman Empire" },
    { id: "lc-waterloo", note: "Its Final Act was signed nine days before Waterloo" },
    { id: "lc-treaty-of-versailles", note: "British delegates in 1919 were given its history as a model" },
  ],
  cites: [
    { t: "Metternich: Political Confession of Faith, 1820 — Internet Modern History Sourcebook, Fordham University", u: "https://sourcebooks.fordham.edu/mod/1820metternich.asp", k: "primary" },
    { t: "Congress of Vienna — Wikipedia", u: "https://en.wikipedia.org/wiki/Congress_of_Vienna" },
  ],
});

TL.enrich("german-confederation", {
  why: "Federal law overrode state law, but the confederation was weakened by its structure: its most important decisions required unanimity and its purpose was limited to security. In 1848–1849 revolutionaries, through the Frankfurt National Assembly, tried to turn it into a unified German state with a liberal constitution, but the revolutions were crushed and the confederation restored in 1850. The contest between Austria and Prussia over which would dominate the German states ended with Prussia's victory in 1866, which dissolved the confederation and led to a Prussian-led North German Confederation.",
  connections: [
    { id: "lc-revolutions-1848", note: "Revolutionaries tried to make it a unified liberal state" },
    { id: "north-german-confederation", note: "Prussia's 1866 victory replaced it with a Prussian-led union" },
  ],
  cites: [
    { t: "German Confederation — Wikipedia", u: "https://en.wikipedia.org/wiki/German_Confederation" },
    { t: "North German Confederation — Wikipedia", u: "https://en.wikipedia.org/wiki/North_German_Confederation" },
  ],
});

TL.enrich("lc-waterloo", {
  why: "The defeat ended Napoleon's Hundred Days return from exile, forced his second and final abdication and ended the First French Empire; he was exiled to Saint Helena. It was the second-bloodiest single-day battle of the Napoleonic Wars, after Borodino, and Wellington called it “the nearest-run thing you ever saw in your life.” Historians treat it as a milestone between Europe's serial wars and decades of relative peace, often called the Pax Britannica.",
  connections: [
    { id: "lc-congress-of-vienna", note: "The powers at Vienna outlawed Napoleon and signed their Final Act nine days before" },
    { id: "lc-napoleon-crowned", note: "Ended the empire Napoleon proclaimed in 1804" },
  ],
  cites: [
    { t: "Battle of Waterloo — Wikipedia", u: "https://en.wikipedia.org/wiki/Battle_of_Waterloo" },
    { t: "Congress of Vienna — Wikipedia", u: "https://en.wikipedia.org/wiki/Congress_of_Vienna" },
  ],
});

TL.enrich("argentina", {
  why: "The Buenos Aires junta was resisted from the start by Córdoba, Montevideo, Paraguay and Upper Peru, and Uruguay, Paraguay and Bolivia, once part of the same viceroyalty, became separate states. From Argentina, San Martín led the 1817 crossing of the Andes — compared to Hannibal's and Napoleon's crossings of the Alps — as part of a strategy to defeat the royalist stronghold of Lima. At home, the Office of the Historian notes, independence was followed by decades of conflict between Centralists and Federalists until national rule under the Argentine Republic began in 1861.",
  connections: [
    { id: "lc-crossing-andes", note: "San Martín led an army from Argentina over the Andes to free Chile" },
    { id: "lc-monroe-doctrine", note: "The US recognized Buenos Aires in 1823, the year Monroe warned off Europe" },
  ],
  cites: [
    { t: "Argentina — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/argentina", k: "archive" },
    { t: "Monroe Doctrine, 1823 — Office of the Historian", u: "https://history.state.gov/milestones/1801-1829/monroe", k: "archive" },
    { t: "Argentine War of Independence — Wikipedia", u: "https://en.wikipedia.org/wiki/Argentine_War_of_Independence" },
    { t: "Crossing of the Andes — Wikipedia", u: "https://en.wikipedia.org/wiki/Crossing_of_the_Andes" },
  ],
});

TL.enrich("chile", {
  why: "After the patriots' defeat at Rancagua in 1814, Chile again became a royalist stronghold, and its liberation came from across the mountains: San Martín's army crossed the Andes in 1817, a feat considered one of the greatest of its kind in military history, and won at Chacabuco. From then on Chile had its own government, flag, coat of arms and currency, so the 1818 declaration formalized an independence already won in practice. The crossing was part of San Martín's strategy to strike the royalist stronghold of Lima; the United States recognized Chile in 1823.",
  connections: [
    { id: "lc-crossing-andes", note: "San Martín's crossing of the Andes liberated Chile" },
    { id: "peru", note: "Chile was a step in San Martín's plan to take royalist Lima" },
  ],
  cites: [
    { t: "Chile — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/chile", k: "archive" },
    { t: "Crossing of the Andes — Wikipedia", u: "https://en.wikipedia.org/wiki/Crossing_of_the_Andes" },
    { t: "Chilean Declaration of Independence — Wikipedia", u: "https://en.wikipedia.org/wiki/Chilean_Declaration_of_Independence" },
  ],
});

TL.enrich("gran-colombia", {
  why: "Proclaimed soon after Bolívar's victory in New Granada, Gran Colombia was constituted as a unitary, centralist state, and its existence was marked by a struggle between supporters of a strong central government and federalists. The United States recognized it in 1822, but Austria, France and Russia accepted new American states only if they took monarchs from European royal houses. Of its roughly 2.6 million people after independence, about half were Indigenous. Rivalry between federalists and centralists and regional tensions broke it into Colombia, Ecuador and Venezuela; Panama separated from Colombia in 1903.",
  connections: [
    { id: "lc-boyaca", note: "Proclaimed soon after Bolívar's victory at Boyacá in 1819" },
    { id: "haiti", note: "Haitian aid played a defining role in Bolívar's liberation of the region" },
    { id: "lc-panama-independence", note: "Panama, part of Gran Colombia, left Colombia in 1903" },
  ],
  cites: [
    { t: "Colombia — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/colombia", k: "archive" },
    { t: "Gran Colombia — Wikipedia", u: "https://en.wikipedia.org/wiki/Gran_Colombia" },
    { t: "Alexandre Pétion — Wikipedia", u: "https://en.wikipedia.org/wiki/Alexandre_P%C3%A9tion" },
  ],
});

TL.enrich("peru", {
  why: "Peru was initially a stronghold for royalists: Viceroy José Fernando de Abascal organized armies that suppressed uprisings in Upper Peru and held off forces sent from the Río de la Plata. The Liberating Expedition under the Argentine general José de San Martín forced the viceroy out of Lima in 1820, and after San Martín and Bolívar disagreed at the Guayaquil Conference, Bolívar finished the war; Sucre's victory at Ayacucho in December 1824 secured Peru's independence. Earlier colonial uprisings, the most significant being Túpac Amaru II's rebellion of 1780–1783, are not considered true independence movements.",
  connections: [
    { id: "lc-ayacucho", note: "Sucre's 1824 victory secured independence" },
    { id: "me-tupac-amaru", note: "The most significant colonial uprising before independence" },
  ],
  cites: [
    { t: "Peru — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/peru", k: "archive" },
    { t: "Peruvian War of Independence — Wikipedia", u: "https://en.wikipedia.org/wiki/Peruvian_War_of_Independence" },
  ],
});

TL.enrich("mexico", {
  why: "Hidalgo's 1810 revolt was massive but poorly organized, and he was captured and executed in 1811; after years of stalemate, independence came when the former royalist commander Agustín de Iturbide allied with the insurgent Vicente Guerrero under the 1821 Plan of Iguala. Iturbide was quickly made emperor, but the military forced him to abdicate in 1823, a rocky start for the new nation, and Mexico came to celebrate independence on September 15–16, the anniversary of Hidalgo's 1810 cry. The United States recognized Mexico in 1822, and the US push for territorial expansion later led to war between the two.",
  connections: [
    { id: "lc-mexican-independence-war", note: "The 1810–1821 war that ended Spanish rule" },
    { id: "lc-mexican-american-war", note: "US expansion led to war with Mexico" },
  ],
  cites: [
    { t: "Mexico — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/mexico", k: "archive" },
    { t: "Mexican War of Independence — Wikipedia", u: "https://en.wikipedia.org/wiki/Mexican_War_of_Independence" },
  ],
});

TL.enrich("brazil", {
  why: "Wikipedia's account contrasts the empire with most neighboring Spanish American republics, saying it had political stability, economic growth and constitutionally guaranteed freedom of speech, though women and the enslaved faced legal restrictions. A weak regency for the child Pedro II brought regional civil wars, but the same account says Pedro II, once of age, inherited an empire on the verge of disintegration and managed to bring peace and stability, and that Brazil eventually became an emerging international power. Slavery, restricted step by step, was abolished by the Golden Law of May 13, 1888, and a military coup overthrew Pedro II and proclaimed a republic on November 15, 1889.",
  connections: [
    { id: "lc-court-to-brazil", note: "Napoleon's invasion of Portugal sent the royal court to Brazil" },
    { id: "lc-lei-aurea", note: "The Golden Law abolished slavery in 1888" },
    { id: "lc-brazil-republic", note: "A military coup ended the empire in 1889" },
  ],
  cites: [
    { t: "Brazil — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/brazil", k: "archive" },
    { t: "Empire of Brazil — Wikipedia", u: "https://en.wikipedia.org/wiki/Empire_of_Brazil" },
  ],
});

TL.enrich("venezuela", {
  why: "Venezuela's first decades were dominated by veterans of the independence war, above all José Antonio Páez, a pardo (mixed-race) officer and colleague of Bolívar whom Caracas's White oligarchy backed; he ruled as president or power behind the throne from 1830 to 1846 and again as dictator in 1860–1863. Its small army served mainly to protect the presidency from internal threats, and the civilian José María Vargas, who became president in February 1835, was ousted by a revolt that July. The United States recognized Venezuela as a separate state in 1835.",
  connections: [
    { id: "gran-colombia", note: "Seceded from Bolívar's republic in 1830" },
  ],
  cites: [
    { t: "Venezuela — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/venezuela", k: "archive" },
    { t: "State of Venezuela — Wikipedia", u: "https://en.wikipedia.org/wiki/State_of_Venezuela" },
  ],
});

TL.enrich("ecuador", {
  why: "Quito's creoles called for independence on August 10, 1809, the first such call in Latin America, earning the city the nickname “Light of America”; Guayaquil broke free in 1820, and Sucre's victory at Pichincha in 1822 freed the rest. Its first president, Juan José Flores, claimed the lands of the colonial Audiencia of Quito, but over its history Ecuador has lost most of its contested territory to more powerful neighbors, including Peru under the 1942 Rio Protocol. Its 2008 constitution was the first in the world to recognize legally enforceable rights of nature.",
  connections: [
    { id: "gran-colombia", note: "Joined Bolívar's republic in 1822 and left it in 1830" },
  ],
  cites: [
    { t: "Ecuador — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/ecuador", k: "archive" },
    { t: "Ecuador — Wikipedia", u: "https://en.wikipedia.org/wiki/Ecuador" },
  ],
});

TL.enrich("colombia", {
  why: "New Granada's history was marked by competing interests and civil wars over the place of the Catholic Church and the autonomy of the regions. In 1851 Liberal reforms under President José Hilario López — among them the emancipation of slaves, freedom of the press and abolition of the death penalty — set off a civil war with Conservative and pro-slavery groups. Panama tried to break away in 1840 and 1850, and a federal constitution followed in 1858; Panama finally separated in 1903.",
  connections: [
    { id: "gran-colombia", note: "The core that remained after Ecuador and Venezuela seceded" },
    { id: "lc-panama-independence", note: "Panama, which tried to secede in 1840 and 1850, left in 1903" },
  ],
  cites: [
    { t: "Republic of New Granada — Wikipedia", u: "https://en.wikipedia.org/wiki/Republic_of_New_Granada" },
    { t: "Gran Colombia — Wikipedia", u: "https://en.wikipedia.org/wiki/Gran_Colombia" },
  ],
});

TL.enrich("lc-first-opium-war", {
  why: "Opium was Britain's single most profitable commodity trade of the 19th century. In 1839 Commissioner Lin Zexu wrote to Queen Victoria that since Britain banned opium at home, “you ought not to have the injurious drug transferred to another country.” The Office of the Historian calls the war emblematic of an era in which Western powers sought unfettered access to Chinese markets. The Treaty of Nanjing was China's first “unequal treaty,” and the United States and France won similar terms in 1844. The ease of the British victory damaged the Qing dynasty's prestige, and British rule in Hong Kong lasted until the handover of July 1997.",
  connections: [
    { id: "qing", note: "The ease of defeat damaged the dynasty's prestige" },
  ],
  cites: [
    { t: "Commissioner Lin: Letter to Queen Victoria, 1839 — Internet Modern History Sourcebook, Fordham University", u: "https://sourcebooks.fordham.edu/mod/1839lin2.asp", k: "primary" },
    { t: "The Opening to China Part I — Office of the Historian", u: "https://history.state.gov/milestones/1830-1860/china-1", k: "archive" },
    { t: "First Opium War — Wikipedia", u: "https://en.wikipedia.org/wiki/First_Opium_War" },
    { t: "British Hong Kong — Wikipedia", u: "https://en.wikipedia.org/wiki/British_Hong_Kong" },
  ],
});

TL.enrich("new-zealand", {
  why: "British sovereignty over the North Island rested on the Treaty of Waitangi, but in the English text Māori ceded sovereignty while the Māori text speaks of kāwanatanga, often translated as governance — a difference that remains the subject of much controversy and political debate. The historian James Belich argues that for many years after 1840 British sovereignty was more nominal than substantive. Settlers gained an elected parliament in 1853; in 1893 New Zealand became the first self-governing country where all women could vote in parliamentary elections, and as a Dominion from 1907 it gradually took control of its foreign policy.",
  connections: [
    { id: "lc-treaty-of-waitangi", note: "The basis on which Britain proclaimed sovereignty in 1840" },
    { id: "mx-nz-women-vote", note: "The first self-governing country where all women could vote" },
    { id: "maori", note: "Māori and British texts of the treaty differ over sovereignty" },
  ],
  cites: [
    { t: "New Zealand — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/new-zealand", k: "archive" },
    { t: "125 Years of Women's Suffrage in New Zealand — Library of Congress, In Custodia Legis", u: "https://blogs.loc.gov/law/2018/09/125-years-of-womens-suffrage-in-new-zealand/", k: "archive" },
    { t: "Colony of New Zealand — Wikipedia", u: "https://en.wikipedia.org/wiki/Colony_of_New_Zealand" },
  ],
});

TL.enrich("lc-revolutions-1848", {
  why: "The revolutions grew out of the upheavals of industrialization and the political legacy of the French Revolution, and were led by temporary coalitions of workers and middle-class reformers that soon fell apart. Many were quickly suppressed, with tens of thousands killed and more forced into exile, yet lasting reforms followed: serfdom ended in Austria and Hungary, absolute monarchy in Denmark, and the Netherlands gained representative democracy. France's Second Republic introduced universal manhood suffrage and abolished slavery, though Louis-Napoléon Bonaparte's 1851 coup ended it; in Germany, the Frankfurt Assembly's attempt at a unified constitutional state was crushed.",
  connections: [
    { id: "lc-france-abolishes-slavery", note: "France's new republic abolished slavery in April 1848" },
    { id: "german-confederation", note: "Revolutionaries tried to turn it into a unified liberal state" },
    { id: "me-bastille", note: "Shaped by the political legacy of the French Revolution" },
  ],
  cites: [
    { t: "Revolutions of 1848 — Wikipedia", u: "https://en.wikipedia.org/wiki/Revolutions_of_1848" },
    { t: "German Confederation — Wikipedia", u: "https://en.wikipedia.org/wiki/German_Confederation" },
  ],
});

TL.enrich("lc-indian-rebellion", {
  why: "Even its name is contested — from Sepoy Mutiny to First War of Independence. In places such as Awadh it took on the attributes of a patriotic revolt, yet many Indians fought for the British and the rebels set out no new political system. Rumors that rifle cartridges were greased with cow and pig fat sparked it amid wider resentment of taxes, annexations and British-style reforms. Historians call it a watershed: the East India Company was dissolved, India passed to direct Crown rule, and Queen Victoria's 1858 promise of rights like those of other British subjects became a reference point for a new Indian nationalism.",
  connections: [
    { id: "british-raj", note: "Led to direct Crown rule from 1858" },
    { id: "mughal", note: "Rebels proclaimed the last Mughal ruler, Bahadur Shah Zafar, emperor" },
  ],
  cites: [
    { t: "Indian Rebellion of 1857 — Wikipedia", u: "https://en.wikipedia.org/wiki/Indian_Rebellion_of_1857" },
  ],
});

TL.enrich("british-raj", {
  why: "Crown rule covered almost all of present-day India, Pakistan, Bangladesh and Myanmar, and railways, canals and new communications closely intertwined India's economy with Britain's, as cotton and food grains went to distant markets and many small farmers lost their land to moneylenders. The late 19th century also brought particularly severe famines, killing tens of millions in all, and many British and Indian critics blamed the colonial administration. In 1885 Western-educated professionals founded the Indian National Congress, and the Raj ended in 1947 with partition into India and Pakistan.",
  connections: [
    { id: "lc-indian-rebellion", note: "The 1857 rebellion ended Company rule" },
    { id: "lc-indian-national-congress", note: "Founded in 1885 by India's Western-educated middle class" },
  ],
  cites: [
    { t: "British Raj — Wikipedia", u: "https://en.wikipedia.org/wiki/British_Raj" },
  ],
});

TL.enrich("italy", {
  why: "The kingdom was the product of the Risorgimento, a movement that emerged after 1815 to unite the peninsula and free it from foreign control: Cavour's government in Sardinia also sought a united Italian state, while the republican Garibaldi led the Expedition of the Thousand into Sicily and Naples in 1860. The new kingdom became a colonial power in the 1880s and joined the Triple Alliance with Germany and Austria-Hungary in 1882. In 1922 Mussolini's Fascist Party took power, and after defeat in the Second World War a referendum on June 2, 1946, abolished the monarchy and established the Italian Republic.",
  connections: [
    { id: "lc-expedition-thousand", note: "Garibaldi's 1860 drive brought Sicily and Naples into the union" },
    { id: "lc-march-on-rome", note: "Brought Mussolini's Fascists to power in 1922" },
  ],
  cites: [
    { t: "Kingdom of Italy — Wikipedia", u: "https://en.wikipedia.org/wiki/Kingdom_of_Italy" },
  ],
});

TL.enrich("lc-us-civil-war", {
  why: "With an estimated 620,000 to 750,000 or more soldiers killed, it remains the deadliest war in US history, and it was among the first wars to use industrial warfare. Grant, Lincoln and Sherman came to believe that only the utter defeat of the Confederate armies and their economic base would end it — a total war aimed less at civilians than at the South's capacity to produce and transport supplies. Union victory led to the 13th Amendment, ratified on December 6, 1865, which abolished slavery; historians are less sure about the results of Reconstruction, given freedpeople's second-class citizenship and poverty.",
  connections: [
    { id: "lc-emancipation-proclamation", note: "Made the war for the Union a war for freedom" },
    { id: "lc-thirteenth-amendment", note: "Abolished slavery throughout the United States" },
  ],
  cites: [
    { t: "13th Amendment to the U.S. Constitution: Abolition of Slavery (1865) — US National Archives", u: "https://www.archives.gov/milestone-documents/13th-amendment", k: "archive" },
    { t: "American Civil War — Wikipedia", u: "https://en.wikipedia.org/wiki/American_Civil_War" },
  ],
});

TL.enrich("lc-emancipation-proclamation", {
  why: "The Proclamation changed the goals of a war that the North had begun fighting only to preserve the Union. Issued as a military measure days after the victory at Antietam, it aimed to rally Black Americans to the Union and to keep Britain and France from recognizing or aiding the Confederacy. The National Archives notes that after January 1, 1863, every advance of federal troops expanded the domain of freedom, and almost 200,000 Black soldiers and sailors had fought for the Union by the war's end. Because it did not end slavery nationwide, the 13th Amendment followed in 1865.",
  connections: [
    { id: "lc-us-civil-war", note: "Turned the war for the Union into a war for freedom" },
    { id: "lc-thirteenth-amendment", note: "Finished what the Proclamation began by abolishing slavery nationally" },
  ],
  cites: [
    { t: "Emancipation Proclamation (1863) — US National Archives", u: "https://www.archives.gov/milestone-documents/emancipation-proclamation", k: "archive" },
    { t: "13th Amendment to the U.S. Constitution: Abolition of Slavery (1865) — US National Archives", u: "https://www.archives.gov/milestone-documents/13th-amendment", k: "archive" },
  ],
});

TL.enrich("north-german-confederation", {
  why: "Born of Prussia's 1866 victory, after which Bismarck declared the old German Confederation dissolved, it settled the contest for leadership of the German states in Prussia's favor and excluded Austria from German affairs. Its constitution made the Prussian king head of state alongside a Reichstag elected by universal manhood suffrage, and in three and a half years it took important steps to unify the nation legally and administratively. The south German states joined it during the Franco-Prussian War, and its states became the core of the German Empire.",
  connections: [
    { id: "german-confederation", note: "Bismarck declared the old confederation dissolved in 1866" },
    { id: "lc-franco-prussian-war", note: "Victory over France brought the south German states in" },
  ],
  cites: [
    { t: "North German Confederation — Wikipedia", u: "https://en.wikipedia.org/wiki/North_German_Confederation" },
    { t: "German Confederation — Wikipedia", u: "https://en.wikipedia.org/wiki/German_Confederation" },
    { t: "Austria-Hungary — Wikipedia", u: "https://en.wikipedia.org/wiki/Austria-Hungary" },
  ],
});

TL.enrich("german-empire", {
  why: "By 1900 Germany was continental Europe's largest economy and the world's third-largest, behind the United States and the British Empire. Bismarck, chancellor until 1890, enacted universal male suffrage in 1871 and created the modern welfare state in the 1880s, while his domestic policies also helped forge the empire's authoritarian political culture. Many see his alliance system, including the 1879 Dual Alliance with Austria-Hungary, as partly responsible for preserving Europe's stability, but his successors, notably Kaiser Wilhelm II, did not pursue his foreign policy.",
  connections: [
    { id: "lc-franco-prussian-war", note: "Founded after the victory over France" },
    { id: "lc-berlin-conference", note: "Bismarck organized the conference that regulated Africa's colonization" },
    { id: "lc-world-war-i", note: "Its ally Austria-Hungary's war on Serbia began the war in 1914" },
  ],
  cites: [
    { t: "German Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/German_Empire" },
    { t: "Berlin Conference — Wikipedia", u: "https://en.wikipedia.org/wiki/Berlin_Conference" },
    { t: "Austria-Hungary — Wikipedia", u: "https://en.wikipedia.org/wiki/Austria-Hungary" },
  ],
});

TL.enrich("second-industrial-revolution", {
  why: "Where the first industrial revolution had relied largely on water and limited steam power, the second built out railroads and large-scale steel production and, through electrification, made possible the assembly line and mass production; the US National Academy of Engineering called electrification “the most important engineering achievement of the 20th century.” By 1900 Britain still led world industrial production with 24%, followed by the United States (19%), Germany (13%), Russia (9%) and France (7%). The Information Age is sometimes called the Third Industrial Revolution.",
  connections: [
    { id: "lc-ford-assembly-line", note: "Electrification enabled the assembly line and mass production" },
    { id: "lc-meiji-restoration", note: "Japan was among the countries that industrialized in this period" },
    { id: "computing", note: "The Information Age is sometimes called the Third Industrial Revolution" },
  ],
  cites: [
    { t: "Second Industrial Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Second_Industrial_Revolution" },
  ],
});

TL.enrich("lc-meiji-restoration", {
  why: "The Perry Expedition's challenge to Tokugawa isolation, and news of Britain's victory in the First Opium War, fed debates among Japanese thinkers over whether to repel or open to the West; Sakuma Shōzan's phrase “Eastern ethics, Western science” captured one answer. The new government abolished the domain system and eventually the samurai's class status, ending feudalism despite revolts such as the Satsuma Rebellion, as Japan rapidly industrialized and adopted Western production methods and technology. The Meiji Constitution of 1889 lasted until the Allied occupation after the Second World War.",
  connections: [
    { id: "lc-perry-opens-japan", note: "Perry's expedition challenged the Tokugawa policy of isolation" },
    { id: "lc-first-opium-war", note: "News of Britain's victory shaped Japanese debates on the West" },
    { id: "lc-russo-japanese-war", note: "Victory emboldened Japan's military to see the country as a world power" },
  ],
  cites: [
    { t: "Meiji Restoration — Wikipedia", u: "https://en.wikipedia.org/wiki/Meiji_Restoration" },
  ],
});

// canada: context removed — its only source (The Canadian Encyclopedia) could not be read to verify it.

TL.enrich("lc-berlin-conference", {
  why: "No African rulers were invited, yet the General Act can be seen as formalizing the Scramble for Africa, which intensified especially because of its principle of “effective occupation”: a colonial claim needed treaties, a flag and an administration on the ground. By 1914, 90% of Africa's land was under European control. Some scholars warn against overstating the conference's role: a 2024 study found that the only borders it set were those of the Congo region, and most of Africa's borders took their final form more than two decades later.",
  connections: [
    { id: "congo-free-state", note: "Leopold II won recognition of his private Congo state" },
  ],
  cites: [
    { t: "Berlin Conference — Wikipedia", u: "https://en.wikipedia.org/wiki/Berlin_Conference" },
  ],
});

TL.enrich("congo-free-state", {
  why: "Leopold's administration extracted ivory, rubber and minerals for the world market through concession companies that brought little benefit to the region; rubber quotas were partly paid off in severed hands, and the baskets of hands became the symbol of the Congo Free State. The death toll remains debated because records are poor, but the highest estimates put deaths at half the population of the rubber provinces. Joseph Conrad's Heart of Darkness and Roger Casement's report fueled an international outcry, and in 1908 Belgium's parliament reluctantly annexed the territory as the Belgian Congo, today the Democratic Republic of the Congo.",
  connections: [
    { id: "lc-berlin-conference", note: "Leopold won recognition by claiming humanitarian aims and free trade" },
    { id: "drc", note: "The territory became today's Democratic Republic of the Congo" },
  ],
  cites: [
    { t: "Congo Free State — Wikipedia", u: "https://en.wikipedia.org/wiki/Congo_Free_State" },
  ],
});

TL.enrich("french-indochina", {
  why: "During the Second World War the colony was run by Vichy France under Japanese occupation, and after Japan's surrender the Viet Minh's Ho Chi Minh proclaimed the Democratic Republic of Vietnam on September 2, 1945. France's attempt to reassert control led to the First Indochina War; Laos and Cambodia gained independence in 1953, and after the garrison at Dien Bien Phu fell on May 7, 1954, the French pulled out. Concerned about regional instability — Eisenhower believed in the domino theory — the United States became increasingly committed to countering communist nationalists in Indochina.",
  connections: [
    { id: "north-vietnam", note: "Ho Chi Minh proclaimed the Democratic Republic of Vietnam in 1945" },
    { id: "mx-vietnam-war", note: "The US took up the fight against communist nationalists" },
  ],
  cites: [
    { t: "Dien Bien Phu & the Fall of French Indochina, 1954 — Office of the Historian", u: "https://history.state.gov/milestones/1953-1960/dien-bien-phu", k: "archive" },
    { t: "French Indochina — Wikipedia", u: "https://en.wikipedia.org/wiki/French_Indochina" },
  ],
});

TL.enrich("mx-nz-women-vote", {
  why: "The campaign's 13 petitions carried 31,872 signatures gathered over seven years — the largest petition ever gathered in Australasia — and wāhine Māori were at the forefront of the movement. Less than two months after the act passed, 109,461 women enrolled for the 1893 election, and congratulations poured in from suffragists around the world; New Zealand's Ministry for Women notes that women in other democracies did not begin to win the vote until after the First World War. The first woman MP, Elizabeth McCombs, was not elected until 1933.",
  connections: [
    { id: "new-zealand", note: "The colony became the first self-governing country with women's suffrage" },
  ],
  cites: [
    { t: "History of women's suffrage in Aotearoa New Zealand — Ministry for Women (NZ)", u: "https://women.govt.nz/about-us/history-womens-suffrage-aotearoa-new-zealand", k: "reference" },
    { t: "125 Years of Women's Suffrage in New Zealand — Library of Congress, In Custodia Legis", u: "https://blogs.loc.gov/law/2018/09/125-years-of-womens-suffrage-in-new-zealand/", k: "archive" },
  ],
});

TL.enrich("korean-empire", {
  why: "After Japan's victory in the First Sino-Japanese War ended Korea's tributary ties to the Qing, Gojong proclaimed an empire, which many officials saw as a way to secure Korea as an independent state, and launched the Gwangmu Reform, a partial modernization of the military, economy, land system, schools and industries. Independence proved short-lived: Korea became a Japanese protectorate in 1905, Japan took over its foreign relations that November and the United States closed its legation, and Japan formally annexed Korea in 1910.",
  connections: [
    { id: "lc-first-sino-japanese-war", note: "Japan's 1895 victory ended Korea's tributary ties to China" },
    { id: "lc-korea-annexed", note: "Japan formally annexed Korea in 1910" },
  ],
  cites: [
    { t: "Korea — A Guide to the United States' History of Recognition, Diplomatic, and Consular Relations — Office of the Historian", u: "https://history.state.gov/countries/korea", k: "archive" },
    { t: "Korean Empire — Wikipedia", u: "https://en.wikipedia.org/wiki/Korean_Empire" },
  ],
});

TL.enrich("australia", {
  why: "Australia was created by peaceful means, as an Act of the British Parliament, after conventions drafted a constitution and voters in each colony approved it in referendums. The states kept their parliaments and most powers, while the new federal government took charge of defence, immigration, quarantine, customs and coinage; economists estimate that ending tariffs on trade between the colonies produced a small net gain. Nationalist sentiment was strong in the labour movement, along with much support for the idea of White Australia. New Zealand and Fiji took part in the early talks but chose not to join.",
  connections: [
    { id: "new-zealand", note: "Took part in the federation talks but chose not to join" },
  ],
  cites: [
    { t: "Federation — Parliamentary Education Office (Australia)", u: "https://peo.gov.au/understand-our-parliament/history-of-parliament/federation/", k: "reference" },
    { t: "Federation of Australia — Wikipedia", u: "https://en.wikipedia.org/wiki/Federation_of_Australia" },
  ],
});

TL.enrich("lc-wright-flyer", {
  why: "The Smithsonian credits the Wrights not only with the first successful powered flights but with establishing the foundation of aeronautical engineering, pioneering the wind tunnel and flight testing as design tools. Their key breakthrough was three-axis control — wing-warping for roll, an elevator for pitch and a rudder for yaw — which some aviation historians rank as equal to, or more significant than, adding an engine. By October 5, 1905, a refined Flyer stayed aloft for 39 minutes, covering 39.2 km over a closed course.",
  connections: [],
  cites: [
    { t: "1903 Wright Flyer — Smithsonian National Air and Space Museum", u: "https://airandspace.si.edu/collection-objects/1903-wright-flyer/nasm_A19610048000", k: "museum" },
    { t: "Wright brothers — Wikipedia", u: "https://en.wikipedia.org/wiki/Wright_brothers" },
  ],
});
