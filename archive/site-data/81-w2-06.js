// Fill-in W2-06: Ife, Kongo, South Africa, Afghanistan, British Raj, Maratha, Mughal and Dutch East Indies, 1800-1925 (with literature, art, scholarship and court culture). Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}`, k: "reference" });
const L = (n, title) => ({ t: `${title} — Library of Congress Country Studies (countrystudies.us)`, u: `https://countrystudies.us/${n}.htm`, k: "reference" });

TL.add({ events: [
  // ---------- Ife ----------
  { id: "w206-modakeke-return", branch: "ife", y: 1921, when: "1921", title: "Modakeke people return to Ife under Ooni Ademiluyi",
    text: "The Modakeke, evacuated from Ife during the previous Ooni's reign, returned in 1921 under Ooni Ademiluyi Ajagun (1910–1930); some accounts date the return to 1922.", imp: 3,
    cites: [W("Ooni_of_Ife", "Ooni of Ife")] },

  // ---------- Kongo ----------
  { id: "w206-tuckey-congo", branch: "kongo", y: 1816.12, when: "February 1816", title: "Tuckey's British expedition sails up the Congo River",
    text: "James Tuckey led a British naval expedition up the Congo as far as Isangila, hoping to link it to the Niger. Rapids stopped it and most of the party, including Tuckey, died of fever.", imp: 3,
    cites: [W("James_Kingston_Tuckey", "James Kingston Tuckey"), B("biography/James-Kingston-Tuckey", "James Kingston Tuckey") ] },
  { id: "w206-pedro-v", branch: "kongo", y: 1859.599, when: "August 7, 1859", title: "Pedro V takes the Kongo throne with Portuguese help",
    text: "After a contested succession, Pedro V Elelo, backed by Portugal, drove Álvaro XIII out of São Salvador, rebuilt the capital and reigned until 1891.", imp: 2,
    cites: [W("Pedro_V_of_Kongo", "Pedro V of Kongo"), B("place/Kongo-historical-kingdom-Africa", "Kongo")] },
  { id: "w206-bentley-kikongo", branch: "kongo", y: 1886, when: "1886", title: "Bentley publishes a Kongo dictionary and grammar",
    text: "The Baptist missionary William Holman Bentley issued a dictionary and grammar of the Kongo language as spoken at San Salvador (some catalogs date it 1887), a landmark of the written language.", imp: 3,
    cites: [W("William_Holman_Bentley", "William Holman Bentley"), { t: "Bentley, William Holman — Dictionary of African Christian Biography", u: "https://dacb.org/stories/democratic-republic-of-congo/bentley-william/", k: "reference" }] },

  // ---------- South Africa ----------
  { id: "w206-snnc-founded", branch: "south-africa", y: 1912.021, when: "January 8, 1912", title: "South African Native National Congress founded",
    text: "Founders including John Dube, Pixley ka Isaka Seme, Sol Plaatje and Walter Rubusana formed the movement in Bloemfontein; renamed the African National Congress in 1923, it became the main force against white-minority rule.", imp: 2,
    cites: [W("African_National_Congress", "African National Congress"), B("event/African-National-Congress", "African National Congress") ] },
  { id: "w206-land-act", branch: "south-africa", y: 1913.464, when: "June 19, 1913", title: "Natives Land Act restricts African land ownership",
    text: "The Act set aside reserves of roughly 7 percent of the land for Africans and barred land sales between Black and white areas, pushing many tenant farmers into wage labor. A delegation to Britain, including Sol Plaatje, failed to change it.", imp: 2,
    cites: [W("Natives_Land_Act,_1913", "Natives Land Act, 1913"), { t: "The Native Land Act is passed — South African History Online", u: "https://sahistory.org.za/dated-event/native-land-act-passed", k: "reference" }] },

  // ---------- Afghanistan ----------
  { id: "w206-dost-kabul", branch: "afghanistan", y: 1826, when: "1826", title: "Dost Mohammad takes Kabul",
    text: "Dost Mohammad Khan added Kabul to Ghazni and made himself amir, founding the Barakzai line that ruled Afghanistan for most of the next century.", imp: 2,
    cites: [L("afghanistan/12", "The Great Game: The Rise of Dost Mohammad"), W("Dost_Mohammad_Khan", "Dost Mohammad Khan"), B("biography/Dost-Mohammad-Khan", "Dost Mohammad Khan") ] },
  { id: "w206-kabul-retreat", branch: "afghanistan", y: 1842.015, when: "January 6, 1842", title: "British army destroyed in the retreat from Kabul",
    text: "A column of some 16,000 soldiers and camp followers left Kabul in winter and was cut down in the passes; Dr. William Brydon is the only man famously to reach Jalalabad. The war became known as \"Auckland's Folly.\"", imp: 2,
    cites: [L("afghanistan/13", "The First Anglo-Afghan War")] },
  { id: "w206-dost-herat", branch: "afghanistan", y: 1863.436, when: "June 9, 1863", title: "Dost Mohammad dies after capturing Herat",
    text: "Weeks after taking Herat on May 27 following a ten-month siege, the amir died there, having reunited most of the country; his son Sher Ali succeeded him.", imp: 3,
    cites: [W("Dost_Mohammad_Khan", "Dost Mohammad Khan"), B("biography/Dost-Mohammad-Khan", "Dost Mohammad Khan") ] },
  { id: "w206-gandamak", branch: "afghanistan", y: 1879.4, when: "May 1879", title: "Treaty of Gandamak after the Second Anglo-Afghan War",
    text: "Amir Yaqub Khan gave Britain control of Afghan foreign affairs, accepted British representatives in Kabul and ceded frontier areas; an uprising against the treaty followed in the autumn.", imp: 2,
    cites: [L("afghanistan/14", "The Second Anglo-Afghan War"), B("topic/Treaty-of-Gandamak", "Treaty of Gandamak") ] },
  { id: "w206-maiwand", branch: "afghanistan", y: 1880.569, when: "July 27, 1880", title: "Afghans defeat a British brigade at Maiwand",
    text: "Ayub Khan's roughly 12,000 men beat about 2,500 British and Indian troops near Kandahar; folklore credits the young woman Malalai with rallying the Afghan fighters.", imp: 2,
    cites: [W("Battle_of_Maiwand", "Battle of Maiwand"), { t: "Battle of Maiwand — British Battles", u: "https://www.britishbattles.com/second-afghan-war/battle-of-maiwand/", k: "reference" } ] },
  { id: "w206-durand-line", branch: "afghanistan", y: 1893.9, when: "1893", title: "Durand Line agreed with British India",
    text: "Amir Abdur Rahman accepted a mission under Sir Mortimer Durand, and the frontier it drew divided Pashtun lands; Afghan governments have disputed it ever since.", imp: 2,
    cites: [L("afghanistan/16", "Modernization and Development of Institutions")] },
  { id: "w206-habibia", branch: "afghanistan", y: 1903, when: "1903", title: "Habibia school founded in Kabul",
    text: "Amir Habibullah opened Habibia, an elite boys' school modeled on Aligarh College, in Kabul; it later educated many of the country's leaders.", imp: 3,
    cites: [W("Habibia_High_School", "Habibia High School"), { t: "Ḥabibiya School — Encyclopaedia Iranica", u: "https://iranicaonline.org/articles/habibiya-school", k: "reference" } ] },
  { id: "w206-siraj-akhbar", branch: "afghanistan", y: 1911, when: "1911", title: "Tarzi founds the newspaper Siraj al-Akhbar",
    text: "Mahmud Tarzi, returned from exile in Ottoman lands, launched the paper and a children's journal; it argued for modernization and Afghan independence and gave the country's press its start.", imp: 2,
    cites: [W("Mahmud_Tarzi", "Mahmud Tarzi"), L("afghanistan/17", "The Reign of King Habibullah, 1901-1919")] },
  { id: "w206-rawalpindi", branch: "afghanistan", y: 1919.601, when: "August 8, 1919", title: "Treaty of Rawalpindi ends the Third Anglo-Afghan War",
    text: "Britain returned control of Afghan foreign affairs, and the Durand Line was reaffirmed as the border; Britain formally recognized full independence by treaty in 1922.", imp: 2,
    cites: [W("Third_Anglo-Afghan_War", "Third Anglo-Afghan War"), B("event/Treaty-of-Rawalpindi", "Treaty of Rawalpindi") ] },

  // ---------- British Raj ----------
  { id: "w206-nil-darpan", branch: "british-raj", y: 1860, when: "1860", title: "Nil Darpan stages the indigo planters' abuses",
    text: "Dinabandhu Mitra's Bengali play, published anonymously in Dhaka, exposed the exploitation of indigo farmers. Its English translation led to the missionary James Long's imprisonment for libel in 1861.", imp: 2,
    cites: [W("Nil_Darpan", "Nil Darpan"), B("topic/Nil-Darpan", "Nil Darpan") ] },
  { id: "w206-meghnad-badh", branch: "british-raj", y: 1861, when: "1861", title: "Madhusudan Dutt publishes Meghnad Badh Kavya",
    text: "Michael Madhusudan Dutt's nine-canto epic retold the Ramayana from Meghnad's side with Milton and Homer in view, and is regarded as a masterpiece of modern Bengali poetry.", imp: 2,
    cites: [W("Meghnad_Badh_Kavya", "Meghnad Badh Kavya"), B("biography/Michael-Madhusudan-Dutt", "Michael Madhusudan Dutt") ] },
  { id: "w206-mao-college", branch: "british-raj", y: 1875.393, when: "May 24, 1875", title: "Sir Syed opens the Aligarh Muhammadan Anglo-Oriental College",
    text: "Sir Syed Ahmad Khan's college opened to give Indian Muslims an English and Western-science education; it became Aligarh Muslim University in 1920.", imp: 2,
    cites: [W("Aligarh_Muslim_University", "Aligarh Muslim University"), B("biography/Sayyid-Ahmad-Khan", "Sir Sayyid Ahmad Khan")] },
  { id: "w206-empress-durbar", branch: "british-raj", y: 1877.001, when: "January 1, 1877", title: "Victoria proclaimed Empress of India at Delhi",
    text: "At a durbar attended by Viceroy Lord Lytton, Queen Victoria was proclaimed Empress of India, giving the Crown's rule over India a ceremonial imperial title.", imp: 2,
    cites: [W("Delhi_Durbar", "Delhi Durbar"), L("india/18", "After the Sepoy Rebellion")] },
  { id: "w206-vivekananda-chicago", branch: "british-raj", y: 1893.695, when: "September 11, 1893", title: "Vivekananda addresses the Parliament of Religions",
    text: "The monk's brief speech for Hinduism in Chicago won a standing ovation and made him the best-known Indian voice abroad; he founded the Ramakrishna Mission in 1897.", imp: 2,
    cites: [W("Swami_Vivekananda", "Swami Vivekananda"), B("biography/Vivekananda", "Vivekananda") ] },
  { id: "w206-partition-bengal", branch: "british-raj", y: 1905.79, when: "October 16, 1905", title: "Curzon partitions Bengal",
    text: "The new province of Eastern Bengal and Assam split a largely Muslim east from a largely Hindu west. Mass protest and the Swadeshi boycott followed; the partition was reversed in 1911.", imp: 1,
    cites: [W("Partition_of_Bengal_(1905)", "Partition of Bengal (1905)"), L("india/19", "The Independence Movement"), B("event/Partition-of-Bengal", "Partition of Bengal") ] },

  // ---------- Maratha ----------
  { id: "w206-bassein", branch: "maratha", y: 1802.998, when: "December 31, 1802", title: "Peshwa signs the Treaty of Bassein with the Company",
    text: "Baji Rao II accepted about 6,000 British troops and gave up an independent foreign policy in return for restoration; rival chiefs refused, leading to the Second Anglo-Maratha War.", imp: 2,
    cites: [W("Treaty_of_Bassein_(1802)", "Treaty of Bassein (1802)"), B("event/Treaty-of-Bassein", "Treaty of Bassein") ] },
  { id: "w206-assaye", branch: "maratha", y: 1803.727, when: "September 23, 1803", title: "Wellesley defeats Scindia and Berar at Assaye",
    text: "Arthur Wellesley's smaller force beat the Maratha armies of Daulatrao Scindia and Raghoji Bhonsle, helping make Britain the dominant power in the heartland of India; he later called it his finest battlefield achievement.", imp: 2,
    cites: [W("Battle_of_Assaye", "Battle of Assaye"), B("event/Battle-of-Assaye", "Battle of Assaye") ] },
  { id: "w206-peshwa-surrender", branch: "maratha", y: 1818.42, when: "June 3, 1818", title: "Last Peshwa Baji Rao II surrenders",
    text: "After defeats at Khadki and Koregaon, Baji Rao II gave himself up and was pensioned off to Bithur, and his lands passed to the Bombay Presidency, ending Maratha power.", imp: 2,
    cites: [W("Third_Anglo-Maratha_War", "Third Anglo-Maratha War"), { t: "The Peshwas: Decline — The History Files", u: "https://www.historyfiles.co.uk/FeaturesFarEast/India_Modern_Peshwas06.htm", k: "reference" } ] },

  // ---------- Mughal ----------
  { id: "w206-delhi-1803", branch: "mughal", y: 1803.695, when: "September 11, 1803", title: "British win Delhi; Shah Alam II becomes a figurehead",
    text: "Gerard Lake defeated the Maratha army near Delhi, and British officials took control of the city, leaving the Mughal emperor a figurehead.", imp: 2,
    cites: [W("Battle_of_Delhi_(1803)", "Battle of Delhi (1803)"), B("event/Battle-of-Assaye", "Battle of Assaye (Lake's capture of Delhi)") ] },
  { id: "w206-roy-envoy", branch: "mughal", y: 1830.5, when: "1830", title: "Ram Mohan Roy goes to Britain as Mughal envoy",
    text: "Akbar II gave Ram Mohan Roy the title Raja and sent him to Britain as envoy to press for a larger stipend; Roy persuaded the government to raise it by £30,000.", imp: 3,
    cites: [W("Ram_Mohan_Roy", "Ram Mohan Roy"), B("biography/Ram-Mohan-Roy", "Ram Mohan Roy")] },
  { id: "w206-zafar-accedes", branch: "mughal", y: 1837.742, when: "September 28, 1837", title: "Bahadur Shah Zafar becomes emperor and court poet",
    text: "The last Mughal emperor, a gifted Urdu ghazal poet, kept a court of Ghalib, Zauq, Momin and Daagh, making Delhi a center of Urdu verse despite his shrinking power.", imp: 2,
    cites: [W("Bahadur_Shah_Zafar", "Bahadur Shah Zafar"), B("biography/Bahadur-Shah-II", "Bahadur Shah II") ] },
  { id: "w206-ghalib-court", branch: "mughal", y: 1850, when: "1850", title: "Ghalib named Dabir-ul-Mulk at the Mughal court",
    text: "Bahadur Shah Zafar gave the poet Mirza Ghalib a title and in 1854 made him his poetry tutor; Ghalib is regarded as one of the great Urdu poets.", imp: 2,
    cites: [W("Mirza_Ghalib", "Mirza Ghalib"), B("biography/Mirza-Ghalib", "Mirza Ghalib") ] },

  // ---------- Dutch East Indies ----------
  { id: "w206-british-java", branch: "dutch-east-indies", y: 1811.65, end: 1816, when: "1811–1816", title: "British occupy Java under Raffles",
    text: "Britain seized Batavia in August 1811 and Thomas Stamford Raffles ruled Java until 1816, when the Dutch were restored; he also created the Pakualaman court in Yogyakarta in 1812.", imp: 2,
    cites: [L("indonesia/9", "VOC Bankruptcy and the British Occupation")] },
  { id: "w206-borobudur-found", branch: "dutch-east-indies", y: 1814, when: "1814", title: "Borobudur is surveyed after Raffles hears of it",
    text: "Told of a buried monument near Bumisegoro, Raffles sent Hermann Cornelius, who cleared jungle for two months with about 200 men; the Buddhist temple was fully uncovered by 1835.", imp: 2,
    cites: [W("Borobudur", "Borobudur"), B("topic/Borobudur", "Borobudur") ] },
  { id: "w206-centhini", branch: "dutch-east-indies", y: 1814, when: "1814", title: "Serat Centhini compiles Javanese learning in verse",
    text: "Crown Prince Mangkunegara of Surakarta, later Pakubuwana V, directed court poets in a twelve-volume work of tales and teachings on Islam, Sufism, medicine, customs and the arts.", imp: 2,
    cites: [W("Serat_Centhini", "Serat Centhini")] },
  { id: "w206-tambora", branch: "dutch-east-indies", y: 1815.273, when: "April 10, 1815", title: "Tambora erupts on Sumbawa",
    text: "The largest eruption in recorded history killed thousands directly and many more through famine and disease, and its aerosols cooled the climate, bringing the 1816 \"Year Without a Summer.\"", imp: 1,
    cites: [W("1815_eruption_of_Mount_Tambora", "1815 eruption of Mount Tambora"), W("Mount_Tambora", "Mount Tambora"), B("place/Mount-Tambora", "Mount Tambora") ] },
  { id: "w206-pattimura", branch: "dutch-east-indies", y: 1817.4, end: 1817.96, when: "May–December 1817", title: "Pattimura leads the Saparua uprising in the Moluccas",
    text: "After the Dutch returned, forced labor, conscription fears and a restored spice monopoly sparked a revolt; Pattimura's men took Fort Duurstede, and he was hanged at Ambon on December 16, 1817. He is a national hero of Indonesia.", imp: 3,
    cites: [W("Pattimura", "Pattimura"), { t: "From Saparua to the Present Day: The Legacy of Pattimura’s Struggle — Indonesian Bible Society", u: "https://alkitab.or.id/en/artikel/2388-from-saparua-to-the-present-day-the-legacy-of-pattimuras-struggle" } ] },
  { id: "w206-java-war", branch: "dutch-east-indies", y: 1825.549, end: 1830.237, when: "July 20, 1825 – March 28, 1830", title: "Java War: Diponegoro's revolt against Dutch rule",
    text: "Prince Diponegoro led the last major Javanese aristocratic rebellion, which killed perhaps 200,000 people; he was arrested during peace talks in 1830 and exiled.", imp: 2,
    cites: [W("Java_War", "Java War"), L("indonesia/11", "The Java War and Cultivation System"), B("event/Java-War", "Java War") ] },
  { id: "w206-cultivation-system", branch: "dutch-east-indies", y: 1830, end: 1870, when: "1830–1870", title: "Cultivation System forces export crops on Java",
    text: "Governor-General van den Bosch required villagers to give about a fifth of their land or 66 days of labor to export crops, yielding huge Dutch profits and contributing to 1840s famines.", imp: 2,
    cites: [W("Cultivation_System", "Cultivation System"), L("indonesia/11", "The Java War and Cultivation System")] },
  { id: "w206-saleh-diponegoro", branch: "dutch-east-indies", y: 1857, when: "1857", title: "Raden Saleh paints The Arrest of Diponegoro",
    text: "Raden Saleh, sometimes called Indonesia's first modern painter and trained in Europe, depicted the 1830 capture of the Java War prince; scholars disagree whether it signals early nationalism or acceptance of Dutch rule.", imp: 2,
    cites: [W("The_Arrest_of_Prince_Diponegoro", "The Arrest of Prince Diponegoro"), W("Raden_Saleh", "Raden Saleh"), { t: "Stealing Raden Saleh: War and Art in Indonesia — National Gallery Singapore", u: "https://www.nationalgallery.sg/sg/en/learn-about-art/magazine/stealing-raden-saleh--war-and-art-in-indonesia.html", k: "museum" }] },
  { id: "w206-aceh-war", branch: "dutch-east-indies", y: 1873.232, end: 1904, when: "1873–1904", title: "Aceh War begins",
    text: "A Dutch expedition landed in March 1873 and its commander Köhler was killed; Banda Aceh fell in 1874, but guerrilla resistance cost tens of thousands of lives over decades.", imp: 2,
    cites: [W("Aceh_War", "Aceh War"), L("indonesia/12", "Dutch Expansion in Sumatra")] },
  { id: "w206-gamelan-paris", branch: "dutch-east-indies", y: 1889.5, when: "1889", title: "A Javanese gamelan plays at the Paris Exposition",
    text: "The Javanese village at the 1889 Exposition Universelle in Paris featured a gamelan, which Claude Debussy heard there, bringing the music to European audiences.", imp: 3,
    cites: [W("Gamelan", "Gamelan"), { t: "Debussy and gamelan — RILM Bibliolore", u: "https://bibliolore.org/2022/08/22/debussy-and-gamelan/", k: "reference" }] },
] });

TL.geo("w206-modakeke-return", { scope: "place", lat: 7.48, lon: 4.56, r: 40, label: "Ile-Ife, Nigeria", src: "https://en.wikipedia.org/wiki/Ile-Ife" });
TL.geo("w206-tuckey-congo", { scope: "region", lat: -6.08, lon: 12.45, r: 300, label: "Lower Congo River", src: "https://en.wikipedia.org/wiki/Congo_River" });
TL.geo("w206-pedro-v", { scope: "place", lat: -6.27, lon: 14.25, r: 40, label: "Mbanza-Kongo, Angola", src: "https://en.wikipedia.org/wiki/Mbanza-Kongo" });
TL.geo("w206-bentley-kikongo", { scope: "place", lat: -6.27, lon: 14.25, r: 40, label: "Mbanza-Kongo, Angola", src: "https://en.wikipedia.org/wiki/Mbanza-Kongo" });
TL.geo("w206-snnc-founded", { scope: "place", lat: -29.12, lon: 26.21, r: 40, label: "Bloemfontein, South Africa", src: "https://en.wikipedia.org/wiki/Bloemfontein" });
TL.geo("w206-land-act", { scope: "region", lat: -30, lon: 25, r: 1000, label: "South Africa", src: "https://en.wikipedia.org/wiki/South_Africa" });
TL.geo("w206-dost-kabul", { scope: "place", lat: 34.53, lon: 69.17, r: 40, label: "Kabul, Afghanistan", src: "https://en.wikipedia.org/wiki/Kabul" });
TL.geo("w206-kabul-retreat", { scope: "place", lat: 34.53, lon: 69.17, r: 80, label: "Kabul, Afghanistan", src: "https://en.wikipedia.org/wiki/Kabul" });
TL.geo("w206-dost-herat", { scope: "place", lat: 34.34, lon: 62.2, r: 40, label: "Herat, Afghanistan", src: "https://en.wikipedia.org/wiki/Herat" });
TL.geo("w206-gandamak", { scope: "place", lat: 34.29, lon: 70.04, r: 40, label: "Gandamak, Afghanistan", src: "https://en.wikipedia.org/wiki/Gandamak" });
TL.geo("w206-maiwand", { scope: "place", lat: 31.73, lon: 65.13, r: 50, label: "Maiwand, Afghanistan", src: "https://en.wikipedia.org/wiki/Battle_of_Maiwand" });
TL.geo("w206-durand-line", { scope: "region", lat: 32, lon: 69.5, r: 800, label: "Afghanistan–Pakistan border", src: "https://en.wikipedia.org/wiki/Durand_Line" });
TL.geo("w206-habibia", { scope: "place", lat: 34.53, lon: 69.17, r: 40, label: "Kabul, Afghanistan", src: "https://en.wikipedia.org/wiki/Kabul" });
TL.geo("w206-siraj-akhbar", { scope: "place", lat: 34.53, lon: 69.17, r: 40, label: "Kabul, Afghanistan", src: "https://en.wikipedia.org/wiki/Kabul" });
TL.geo("w206-rawalpindi", { scope: "place", lat: 33.6, lon: 73.03, r: 40, label: "Rawalpindi, Pakistan", src: "https://en.wikipedia.org/wiki/Rawalpindi" });
TL.geo("w206-nil-darpan", { scope: "place", lat: 23.76, lon: 90.39, r: 40, label: "Dhaka, Bangladesh", src: "https://en.wikipedia.org/wiki/Dhaka" });
TL.geo("w206-meghnad-badh", { scope: "place", lat: 22.57, lon: 88.37, r: 40, label: "Kolkata, India", src: "https://en.wikipedia.org/wiki/Kolkata" });
TL.geo("w206-mao-college", { scope: "place", lat: 27.89, lon: 78.08, r: 40, label: "Aligarh, India", src: "https://en.wikipedia.org/wiki/Aligarh" });
TL.geo("w206-empress-durbar", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi, India", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w206-vivekananda-chicago", { scope: "place", lat: 41.88, lon: -87.63, r: 40, label: "Chicago, United States", src: "https://en.wikipedia.org/wiki/Chicago" });
TL.geo("w206-partition-bengal", { scope: "region", lat: 23.5, lon: 88.5, r: 400, label: "Bengal", src: "https://en.wikipedia.org/wiki/Bengal" });
TL.geo("w206-bassein", { scope: "place", lat: 19.47, lon: 72.8, r: 40, label: "Vasai, India", src: "https://en.wikipedia.org/wiki/Vasai" });
TL.geo("w206-assaye", { scope: "place", lat: 20.235, lon: 75.89, r: 40, label: "Assaye, India", src: "https://en.wikipedia.org/wiki/Battle_of_Assaye" });
TL.geo("w206-peshwa-surrender", { scope: "place", lat: 18.52, lon: 73.86, r: 60, label: "Pune, India", src: "https://en.wikipedia.org/wiki/Pune" });
TL.geo("w206-delhi-1803", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi, India", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w206-roy-envoy", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w206-zafar-accedes", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi, India", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w206-ghalib-court", { scope: "place", lat: 28.61, lon: 77.23, r: 40, label: "Delhi, India", src: "https://en.wikipedia.org/wiki/Delhi" });
TL.geo("w206-british-java", { scope: "region", lat: -7.49, lon: 110, r: 500, label: "Java, Indonesia", src: "https://en.wikipedia.org/wiki/Java" });
TL.geo("w206-borobudur-found", { scope: "place", lat: -7.608, lon: 110.204, r: 30, label: "Borobudur, Java", src: "https://en.wikipedia.org/wiki/Borobudur" });
TL.geo("w206-centhini", { scope: "place", lat: -7.57, lon: 110.82, r: 40, label: "Surakarta, Java", src: "https://en.wikipedia.org/wiki/Surakarta" });
TL.geo("w206-tambora", { scope: "place", lat: -8.25, lon: 118, r: 100, label: "Mount Tambora, Sumbawa", src: "https://en.wikipedia.org/wiki/Mount_Tambora" });
TL.geo("w206-pattimura", { scope: "place", lat: -3.57, lon: 128.65, r: 40, label: "Saparua, Maluku", src: "https://en.wikipedia.org/wiki/Saparua" });
TL.geo("w206-java-war", { scope: "region", lat: -7.49, lon: 110, r: 300, label: "Central Java", src: "https://en.wikipedia.org/wiki/Java" });
TL.geo("w206-cultivation-system", { scope: "region", lat: -7.49, lon: 110, r: 500, label: "Java, Indonesia", src: "https://en.wikipedia.org/wiki/Java" });
TL.geo("w206-saleh-diponegoro", { scope: "place", lat: -6.18, lon: 106.83, r: 40, label: "Jakarta, Indonesia", src: "https://en.wikipedia.org/wiki/Jakarta" });
TL.geo("w206-aceh-war", { scope: "place", lat: 5.55, lon: 95.32, r: 60, label: "Banda Aceh, Indonesia", src: "https://en.wikipedia.org/wiki/Banda_Aceh" });
TL.geo("w206-gamelan-paris", { scope: "place", lat: 48.86, lon: 2.35, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
