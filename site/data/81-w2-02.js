// Fill-in W2-02: Islam, Jain philosophy, Judaism, Liberalism, Marxism, Neo-Confucianism, Eastern Orthodoxy, Protestantism, Sikhism, Zoroastrianism, Utilitarianism, 1800–1925. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Encyclopaedia Britannica`, u: `https://www.britannica.com/${path}` });
const S = (slug, title) => ({ t: `${title} — Stanford Encyclopedia of Philosophy`, u: `https://plato.stanford.edu/entries/${slug}/`, k: "reference" });
const G = (id, lat, lon, r, label, slug, scope = "place") => TL.geo("w202-" + id, { scope, lat, lon, r, label, src: `https://en.wikipedia.org/wiki/${slug}` });
const D = (y, m, d) => +(y + ((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000 + 0.5) / ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365)).toFixed(3);

TL.add({ events: [
  // ---------- Islam ----------
  { id: "w202-sokoto-jihad", branch: "islam", y: 1804.12, end: 1808, when: "1804–1808", title: "Usman dan Fodio's jihad founds the Sokoto Caliphate",
    text: "The Fulani scholar Usman dan Fodio led his followers to Gudu in February 1804 and waged a jihad that created a Muslim state in what is now northern Nigeria, later called the Sokoto Caliphate.", imp: 2,
    cites: [B("biography/Usman-dan-Fodio", "Usman dan Fodio"), W("Sokoto_Caliphate", "Sokoto Caliphate")] },
  { id: "w202-deoband", branch: "islam", y: D(1866, 5, 31), when: "May 31, 1866 (Britannica gives 1867)", title: "Darul Uloom Deoband founded",
    text: "Founded in the aftermath of the 1857 revolt, the seminary at Deoband in Uttar Pradesh grew into India's leading Muslim theological center and the base of the Deobandi reform movement.", imp: 2,
    cites: [W("Darul_Uloom_Deoband", "Darul Uloom Deoband"), B("topic/Deoband-school", "Deoband school")] },
  { id: "w202-mahdi-proclaimed", branch: "islam", y: 1881.49, end: 1885.47, when: "June 1881 (Mahdi died June 22, 1885)", title: "Muhammad Ahmad proclaims himself the Mahdi in Sudan",
    text: "In 1881 Muhammad Ahmad announced that he was the Mahdi and led a revolt against Egyptian rule that created the Mahdist State; his successors held power until 1899.", imp: 2,
    cites: [W("Muhammad_Ahmad", "Muhammad Ahmad"), B("place/Sudan/The-Mahdiyyah", "Sudan: The Mahdiyyah")] },
  { id: "w202-urwa-wuthqa", branch: "islam", y: D(1884, 3, 13), end: 1884.8, when: "March–October 1884", title: "Afghani and Abduh publish al-Urwa al-Wuthqa in Paris",
    text: "In Paris, Jamal al-Din al-Afghani and Muhammad Abduh issued the Arabic journal al-Urwa al-Wuthqa (“The Firmest Bond”), which urged resistance to European influence; it was smuggled into Egypt and India.", imp: 2,
    cites: [B("biography/Muhammad-Abduh", "Muhammad Abduh"), B("biography/Jamal-al-Din-al-Afghani", "Jamal al-Din al-Afghani"), W("Al-Urwah_al-Wuthqa", "Al-Urwah al-Wuthqa")] },
  { id: "w202-ahmadiyya", branch: "islam", y: D(1889, 3, 23), when: "March 23, 1889", title: "Mirza Ghulam Ahmad founds the Ahmadiyya movement",
    text: "Mirza Ghulam Ahmad took pledges of allegiance from followers in Punjab, founding the Ahmadiyya movement; he claimed to be the mahdi, and mainstream Muslims have long regarded the movement as heretical.", imp: 2,
    cites: [B("topic/Ahmadiyyah", "Ahmadiyyah"), W("Ahmadiyya", "Ahmadiyya")] },
  { id: "w202-al-manar", branch: "islam", y: 1898.5, when: "1898", title: "Rashid Rida begins publishing al-Manar in Cairo",
    text: "Rashid Rida, a disciple of Muhammad Abduh, founded al-Manar (“The Lighthouse”) in Cairo and published it for the rest of his life, spreading reformist ideas across the Muslim world.", imp: 3,
    cites: [B("biography/Rashid-Rida", "Rashid Rida"), W("Rashid_Rida", "Rashid Rida")] },
  { id: "w202-caliphate-abolished", branch: "islam", y: D(1924, 3, 3), when: "March 3, 1924", title: "Turkey abolishes the caliphate", link: "ottoman",
    text: "The Turkish republic abolished the caliphate, held by the Ottoman dynasty since 1517, as part of Atatürk's secular reforms; Abdülmecid II was the last caliph, and no universally recognized caliph has held the office since.", imp: 1,
    cites: [W("Ottoman_caliphate", "Ottoman Caliphate"), B("biography/Abdulmecid-II", "Abdülmecid II")] },

  // ---------- Jain philosophy ----------
  { id: "w202-jacobi-jaina-sutras", branch: "jain-philosophy", y: 1884.5, when: "1884 (second volume 1895)", title: "Jacobi's Jaina Sutras in Sacred Books of the East",
    text: "Hermann Jacobi translated the Akaranga and Kalpa sutras for Max Müller's Oxford series, giving Western readers early English versions of Jain scripture; a second volume followed in 1895.", imp: 2,
    cites: [{ t: "Âkârâṅga Sûtra (Sacred Books of the East, vol. 22, 1884) — Jainpedia", u: "https://jainpedia.org/reading/akaranga-sutra/" }, W("Sacred_Books_of_the_East", "Sacred Books of the East"), W("Hermann_Jacobi", "Hermann Jacobi")] },
  { id: "w202-virchand-gandhi", branch: "jain-philosophy", y: 1893.7, when: "September 1893", title: "Virchand Gandhi speaks for Jainism in Chicago",
    text: "The lawyer Virchand Gandhi, a disciple of the monk Muni Atmaramji, represented Jainism at the first World Parliament of Religions in Chicago after Atmaramji, who was invited first, could not attend.", imp: 2,
    cites: [{ t: "Lawyer Virchand Raghavji Gandhi (1864–1901) — Parliament of the World's Religions", u: "https://parliamentofreligions.org/1893-chicago/honoring-our-jain-delegate-from-india-at-1893-parliament-lawyer-virchand-raghavji-gandhi-1864-1901/" }, W("Virchand_Gandhi", "Virchand Gandhi"), W("Parliament_of_the_World%27s_Religions", "Parliament of the World's Religions")] },

  // ---------- Judaism ----------
  { id: "w202-grand-sanhedrin", branch: "judaism", y: D(1807, 2, 9), end: 1807.18, when: "February 9 – March 1807", title: "Napoleon's Grand Sanhedrin meets in Paris",
    text: "Napoleon convened a Jewish high court, the Grand Sanhedrin, to give legal sanction to the answers his assembly of Jewish notables had given to twelve questions; it opened on February 9, 1807.", imp: 2,
    cites: [{ t: "Sanhedrin, French — Jewish Encyclopedia", u: "https://www.jewishencyclopedia.com/articles/13180-sanhedrin-french", k: "reference" }, W("Grand_Sanhedrin", "Grand Sanhedrin")] },
  { id: "w202-hamburg-temple", branch: "judaism", y: D(1818, 10, 18), when: "October 18, 1818", title: "Hamburg Temple opens, first permanent Reform congregation",
    text: "The Hamburg Temple, inaugurated on October 18, 1818, was the first permanent Reform Jewish congregation and the first to use a Reform prayer rite.", imp: 2,
    cites: [{ t: "Germany: Hamburg — Jewish Virtual Library", u: "https://jewishvirtuallibrary.org/hamburg" }, W("Hamburg_Temple", "Hamburg Temple")] },
  { id: "w202-wissenschaft-verein", branch: "judaism", y: 1819.5, when: "1819", title: "Zunz and Gans found the Society for Jewish Culture and Science",
    text: "Leopold Zunz, Eduard Gans and Moses Moser founded the Verein für Kultur und Wissenschaft der Juden, launching Wissenschaft des Judentums, the scholarly study of Jewish literature and history.", imp: 2,
    cites: [B("biography/Leopold-Zunz", "Leopold Zunz"), W("Wissenschaft_des_Judentums", "Wissenschaft des Judentums")] },
  { id: "w202-hebrew-union-college", branch: "judaism", y: 1875.5, when: "1875", title: "Hebrew Union College founded in Cincinnati",
    text: "Rabbi Isaac Mayer Wise founded Hebrew Union College in Cincinnati, now the oldest extant Jewish seminary in the Americas and the major training center for Reform rabbis; its first class graduated in 1883.", imp: 2,
    cites: [B("topic/Hebrew-Union-College", "Hebrew Union College–Jewish Institute of Religion"), W("Hebrew_Union_College", "Hebrew Union College")] },
  { id: "w202-russian-pogroms", branch: "judaism", y: 1881.3, end: 1882, when: "1881–1882", title: "Pogroms follow the assassination of Alexander II",
    text: "The first extensive pogroms against Jews in the Russian Empire followed the assassination of Tsar Alexander II in 1881, although the assassin was not Jewish.", imp: 2,
    cites: [B("event/pogrom", "Pogrom"), W("Pogroms_in_the_Russian_Empire", "Pogroms in the Russian Empire")] },
  { id: "w202-pittsburgh-platform", branch: "judaism", y: D(1885, 11, 16), end: D(1885, 11, 19), when: "November 16–19, 1885", title: "Pittsburgh Platform defines Classical Reform Judaism",
    text: "Reform rabbis meeting at the Concordia Club in Pittsburgh adopted a platform urging Jews to take a modern approach to their faith, the founding document of American “Classical Reform.”", imp: 2,
    cites: [{ t: "Reform Judaism: The Pittsburgh Platform — Jewish Virtual Library", u: "https://www.jewishvirtuallibrary.org/the-pittsburgh-platform" }, W("Pittsburgh_Platform", "Pittsburgh Platform")] },
  { id: "w202-first-zionist-congress", branch: "judaism", y: D(1897, 8, 29), end: D(1897, 8, 31), when: "August 29–31, 1897", title: "First Zionist Congress meets in Basel",
    text: "Theodor Herzl convened the first Zionist Congress in Basel, which adopted the Basel Program and founded the Zionist Organization, aiming at a Jewish homeland in Palestine.", imp: 2,
    cites: [B("topic/Zionism", "Zionism"), W("First_Zionist_Congress", "First Zionist Congress")] },
  { id: "w202-daf-yomi", branch: "judaism", y: D(1923, 9, 11), when: "September 11, 1923", title: "Daf Yomi begins: one page of Talmud a day",
    text: "Proposed by Rabbi Meir Shapiro at Agudath Israel's congress in Vienna, Daf Yomi had Jews worldwide study the same Talmud page each day; the first cycle began on Rosh Hashanah 1923.", imp: 2,
    cites: [{ t: "Meir Shapiro — JewishGen KehilaLinks (Lublin)", u: "https://kehilalinks.jewishgen.org/lublin/Meir_Shapiro.html" }, W("Daf_Yomi", "Daf Yomi")] },

  // ---------- Liberalism ----------
  { id: "w202-constant-liberty", branch: "liberalism", y: 1819.2, when: "1819", title: "Constant contrasts ancient and modern liberty",
    text: "In a famous 1819 speech Benjamin Constant distinguished the “liberty of the ancients,” direct participation in public power, from the liberty of the moderns, a founding idea of liberal political thought.", imp: 2,
    cites: [{ t: "De la liberté des anciens comparée à celle des modernes (1819 text) — Internet Archive", u: "https://archive.org/stream/ConstantBenjaminLiberteAnciensModernes1819/Constant_Benjamin_Liberte_anciens_modernes_1819_djvu.txt" }, W("Benjamin_Constant", "Benjamin Constant")] },
  { id: "w202-tocqueville-democracy", branch: "liberalism", y: 1835.5, end: 1840.5, when: "1835 (vol. 1); 1840 (vol. 2)", title: "Tocqueville publishes Democracy in America",
    text: "Alexis de Tocqueville's De la démocratie en Amérique, issued in two volumes in 1835 and 1840, examined American democracy and became a classic work of political thought.", imp: 2,
    cites: [W("Democracy_in_America", "Democracy in America"), B("biography/Alexis-de-Tocqueville", "Alexis de Tocqueville")] },
  { id: "w202-mill-on-liberty", branch: "liberalism", y: 1859.1, when: "1859", title: "Mill publishes On Liberty",
    text: "Written with Harriet Taylor Mill and published in 1859 under his name, John Stuart Mill's On Liberty became one of the best-known statements of liberal political philosophy.", imp: 1,
    cites: [S("mill-moral-political", "John Stuart Mill's Moral and Political Philosophy"), W("On_Liberty", "On Liberty")] },
  { id: "w202-green-liberal-legislation", branch: "liberalism", y: 1881.2, when: "1881", title: "T. H. Green's lecture on liberal legislation",
    text: "Oxford philosopher T. H. Green's “Lecture on Liberal Legislation and the Freedom of Contract,” published in 1881, became one of his most famous statements of liberal political philosophy.", imp: 3,
    cites: [S("green", "Thomas Hill Green"), W("Thomas_Hill_Green", "Thomas Hill Green")] },
  { id: "w202-hobhouse-liberalism", branch: "liberalism", y: 1911.4, when: "1911", title: "Hobhouse publishes Liberalism",
    text: "L. T. Hobhouse's Liberalism, a seminal text of the “New Liberalism,” rejected laissez-faire while holding that liberty's purpose is to let individuals develop, a case for social liberalism.", imp: 2,
    cites: [{ t: "Liberalism (Home University Library, first published 1911) — Internet Archive", u: "https://archive.org/stream/liberalism28278gut/28278.txt", k: "primary" }, W("Leonard_Trelawny_Hobhouse", "Leonard Trelawny Hobhouse"), B("biography/Leonard-Trelawny-Hobhouse", "Leonard Trelawny Hobhouse")] },

  // ---------- Marxism ----------
  { id: "w202-first-international", branch: "marxism", y: D(1864, 9, 28), when: "September 28, 1864", title: "International Working Men's Association founded in London",
    text: "About 2,000 workers met at St Martin's Hall in London to found the International Working Men's Association, the First International, which brought together socialists, anarchists and trade unionists with Karl Marx a central figure.", imp: 2,
    cites: [B("topic/First-International", "First International"), W("International_Workingmen%27s_Association", "International Workingmen's Association")] },
  { id: "w202-capital-vol1", branch: "marxism", y: 1867.7, when: "1867", title: "Marx publishes the first volume of Capital",
    text: "Karl Marx's critique of capitalism, Capital (Das Kapital), appeared in 1867 as volume one; Friedrich Engels edited the second and third volumes from his manuscripts in 1885 and 1894.", imp: 2,
    cites: [B("topic/Das-Kapital", "Das Kapital"), W("Das_Kapital", "Das Kapital")] },
  { id: "w202-second-international", branch: "marxism", y: 1889.5, end: 1914.6, when: "1889–c. 1914", title: "Second International founded in Paris",
    text: "Socialist and labor parties formed the Second International in Paris in 1889, a federation that coordinated international socialism until about 1914 and was a forum for disputes over Marxist doctrine.", imp: 2,
    cites: [B("topic/Second-International", "Second International"), W("Second_International", "Second International")] },
  { id: "w202-what-is-to-be-done", branch: "marxism", y: 1902.2, when: "March 1902", title: "Lenin publishes What Is to Be Done?",
    text: "Written between autumn 1901 and February 1902 and first published separately in March 1902, Lenin's pamphlet urged that a party of dedicated revolutionaries teach Marxism to workers.", imp: 2,
    cites: [{ t: "Lenin: What Is To Be Done? — Marxists Internet Archive", u: "https://www.marxists.org/archive/lenin/works/1901/witbd/" }, W("What_Is_to_Be_Done%3F", "What Is to Be Done?")] },
  { id: "w202-history-class-consciousness", branch: "marxism", y: 1923.5, when: "1923", title: "Lukács publishes History and Class Consciousness",
    text: "György Lukács's essay collection critiqued “reification” under capitalism and developed a Marxist philosophy of history; he wrote it in Vienna after fleeing Hungary in 1919.", imp: 2,
    cites: [S("lukacs", "Georg Lukács"), B("biography/Gyorgy-Lukacs", "György Lukács"), W("History_and_Class_Consciousness", "History and Class Consciousness")] },

  // ---------- Neo-Confucianism ----------
  { id: "w202-oshio-revolt", branch: "neo-confucianism", y: D(1837, 2, 19), when: "February 19, 1837", title: "Ōshio Heihachirō, a Wang Yangming scholar, rises in Osaka",
    text: "Ōshio Heihachirō, a former Osaka official who led an academy of the Wang Yangming school, set fire to his house to summon followers to revolt; he died by self-immolation on May 1, 1837.", imp: 3,
    cites: [B("biography/Oshio-Heihachiro", "Ōshio Heihachirō"), W("%C5%8Cshio_Heihachir%C5%8D", "Ōshio Heihachirō")] },
  { id: "w202-wijeong-cheoksa", branch: "neo-confucianism", y: 1866.8, end: 1871.5, when: "1866–1871", title: "Korea makes defense of Neo-Confucian orthodoxy state policy",
    text: "After French and American attacks in 1866 and 1871, the regent Heungseon Daewongun made wijeong cheoksa, “defend orthodoxy, reject heterodoxy,” national policy against Catholicism and Western learning.", imp: 3,
    cites: [B("biography/Daewon-gun", "Daewon-gun"), W("Wijeong_cheoksa", "Wijeong cheoksa")] },

  // ---------- Eastern Orthodox Church ----------
  { id: "w202-greek-autocephaly", branch: "orthodoxy", y: 1833.5, when: "1833 (recognized 1850)", title: "Church of Greece declares itself autocephalous",
    text: "Fearing Ottoman influence through the ecumenical patriarchate, Greece declared its church autocephalous in 1833; Constantinople recognized its independence in 1850.", imp: 2,
    cites: [B("topic/Church-of-Greece", "Church of Greece"), W("Church_of_Greece", "Church of Greece")] },
  { id: "w202-bulgarian-exarchate", branch: "orthodoxy", y: D(1870, 3, 12), when: "March 12, 1870 (February 28, O.S.)", title: "Sultan's firman creates the Bulgarian Exarchate", link: "ottoman",
    text: "A firman of Sultan Abdülaziz created a Bulgarian church independent of the Greek-led patriarchate; Constantinople declared it schismatic in 1872.", imp: 2,
    cites: [W("Bulgarian_Exarchate", "Bulgarian Exarchate"), B("topic/Bulgarian-Orthodox-Church", "Bulgarian Orthodox Church")] },
  { id: "w202-brothers-karamazov", branch: "orthodoxy", y: 1879.0, end: 1880.9, when: "January 1879 – November 1880", title: "Dostoevsky's The Brothers Karamazov",
    text: "Dostoevsky's final novel, serialized in The Russian Messenger, stages faith and doubt among three brothers; the elder Zosima is said to be modeled on Amvrosy, a starets of Optina Monastery.", imp: 2,
    cites: [B("topic/The-Brothers-Karamazov", "The Brothers Karamazov"), W("The_Brothers_Karamazov", "The Brothers Karamazov"), W("Optina_Monastery", "Optina Monastery")] },
  { id: "w202-seraphim-canonized", branch: "orthodoxy", y: D(1903, 8, 1), when: "July 19, 1903 (O.S.)", title: "Seraphim of Sarov canonized",
    text: "The Russian Orthodox Church canonized Seraphim of Sarov, the monk and mystic whose ascetic practice and spiritual counsel won him the title starets, proposing him as a standard for spirituality.", imp: 3,
    cites: [B("biography/Saint-Seraphim-of-Sarov", "Saint Seraphim of Sarov"), W("Seraphim_of_Sarov", "Seraphim of Sarov")] },
  { id: "w202-moscow-patriarchate-restored", branch: "orthodoxy", y: D(1917, 11, 18), when: "November 5, 1917 (O.S.)", title: "Council restores the Moscow patriarchate; Tikhon elected",
    text: "A council of the Russian Orthodox Church restored the Moscow patriarchate, abolished by Peter the Great in 1721, and chose Metropolitan Tikhon as patriarch.", imp: 2,
    cites: [B("biography/Saint-Tikhon", "Saint Tikhon"), W("Tikhon_of_Moscow", "Tikhon of Moscow")] },

  // ---------- Protestantism ----------
  { id: "w202-bible-society", branch: "protestantism", y: D(1804, 3, 7), when: "March 7, 1804", title: "British and Foreign Bible Society founded",
    text: "William Wilberforce, Thomas Charles and others formed the British and Foreign Bible Society in London, the first Bible society in the fullest sense, to circulate Scripture widely and in translation.", imp: 2,
    cites: [B("topic/British-and-Foreign-Bible-Society", "British and Foreign Bible Society"), W("British_and_Foreign_Bible_Society", "British and Foreign Bible Society")] },
  { id: "w202-schleiermacher-christian-faith", branch: "protestantism", y: 1821.5, end: 1822.5, when: "1821–1822", title: "Schleiermacher publishes The Christian Faith",
    text: "Friedrich Schleiermacher, generally recognized as the founder of modern Protestant theology, published Der christliche Glaube, his major work of systematic theology, a systematic interpretation of Christian dogmatics.", imp: 2,
    cites: [S("schleiermacher", "Friedrich Schleiermacher"), B("biography/Friedrich-Schleiermacher", "Friedrich Schleiermacher")] },
  { id: "w202-salvation-army", branch: "protestantism", y: D(1865, 7, 2), when: "July 2, 1865", title: "William and Catherine Booth found the Salvation Army",
    text: "The Methodist preacher William Booth and his wife Catherine founded the East London Christian Mission, later the Salvation Army, a charitable movement with a military-style structure.", imp: 2,
    cites: [B("topic/Salvation-Army", "Salvation Army"), W("Salvation_Army", "Salvation Army")] },
  { id: "w202-azusa-street", branch: "protestantism", y: D(1906, 4, 9), end: 1915, when: "April 9, 1906 – c. 1915", title: "Azusa Street revival launches Pentecostalism",
    text: "Led by the preacher William Seymour, the Azusa Street revival in Los Angeles began on April 9, 1906, with worshippers speaking in tongues, and became a catalyst for worldwide Pentecostalism.", imp: 2,
    cites: [B("event/Azusa-Street-Revival", "Azusa Street revival"), W("Azusa_Street_Revival", "Azusa Street Revival")] },
  { id: "w202-edinburgh-1910", branch: "protestantism", y: D(1910, 6, 14), end: D(1910, 6, 23), when: "June 14–23, 1910", title: "World Missionary Conference meets in Edinburgh",
    text: "About 1,215 representatives of Protestant and Anglican missionary societies met in Edinburgh, reflecting a drive for cooperation among missions that fed the later ecumenical movement.", imp: 2,
    cites: [W("World_Missionary_Conference", "World Missionary Conference"), B("event/World-Missionary-Conference", "World Missionary Conference")] },
  { id: "w202-barth-romerbrief", branch: "protestantism", y: 1918.95, when: "December 1918 (dated 1919)", title: "Karl Barth's Der Römerbrief",
    text: "Barth's commentary on Romans, his first major work, established him as a notable theologian with a message about the sheer “Godness of God”; it marked his break with 19th-century liberal theology.", imp: 2,
    cites: [B("biography/Karl-Barth", "Karl Barth"), W("The_Epistle_to_the_Romans_(Barth)", "The Epistle to the Romans (Barth)")] },

  // ---------- Sikhism ----------
  { id: "w202-golden-temple-gilded", branch: "sikhism", y: 1809, end: 1830, when: "1809–1830", title: "Ranjit Singh rebuilds and gilds the Golden Temple",
    text: "Maharaja Ranjit Singh rebuilt Amritsar's Harmandir Sahib in marble and copper in 1809 and overlaid its sanctum with gold leaf in 1830, giving it the name Golden Temple.", imp: 2,
    cites: [B("topic/Golden-Temple", "Golden Temple (Harmandir Sahib)"), W("Golden_Temple", "Golden Temple")] },
  { id: "w202-singh-sabha", branch: "sikhism", y: D(1873, 7, 30), when: "July 30, 1873", title: "First Singh Sabha formed at Amritsar",
    text: "The first Singh Sabha, formed at Amritsar (founding meeting July 30, 1873), began a movement to revive Sikh doctrine; a more radical Lahore branch stressed that Sikhs were not Hindus, and by 1900 there were over 100 Sabhas.", imp: 2,
    cites: [B("topic/Singh-Sabha", "Singh Sabha"), W("Singh_Sabha_Movement", "Singh Sabha Movement")] },
  { id: "w202-sgpc-formed", branch: "sikhism", y: D(1920, 11, 15), when: "November 15, 1920", title: "Sikh assembly forms the SGPC",
    text: "Reformers summoned a general assembly of Sikhs before the Akal Takht in Amritsar, creating the committee (SGPC) to take over Sikh shrines from hereditary custodians; the Sikh Gurdwara Act of 1925 later put it on a legal footing.", imp: 2,
    cites: [W("Shiromani_Gurdwara_Parbandhak_Committee", "Shiromani Gurdwara Parbandhak Committee"), { t: "Shiromani Gurdwara Parbandhak Committee — The Sikh Encyclopedia", u: "https://www.thesikhencyclopedia.com/sikh-organisations/shiromani-gurdwara-parbandhak-committee", k: "reference" }, B("topic/Shiromani-Gurdwara-Prabandhak-Committee", "Shiromani Gurdwara Prabandhak Committee")] },
  { id: "w202-nankana-massacre", branch: "sikhism", y: D(1921, 2, 20), when: "February 20, 1921", title: "Nankana Sahib massacre",
    text: "Akali reformers sought the gurdwara at Guru Nanak's birthplace from its mahant, Narain Das, whose hired men attacked a Sikh jatha on February 20, 1921, killing many and galvanizing the gurdwara reform movement.", imp: 2,
    cites: [W("Akali_movement", "Akali movement"), { t: "Nankana Sahib Massacre — The Sikh Encyclopedia", u: "https://www.thesikhencyclopedia.com/sikh-historical-events/nankana-sahib-massacre", k: "reference" }] },

  // ---------- Zoroastrianism ----------
  { id: "w202-rahnumai-mazdayasnan", branch: "zoroastrianism", y: D(1851, 8, 1), when: "August 1, 1851", title: "Naoroji founds the Rahnumai Mazdayasnan Sabha",
    text: "Dadabhai Naoroji, an ordained Parsi priest, founded the Rahnumai Mazdayasnan Sabha to restore Zoroastrianism to its “original purity and simplicity,” and in 1854 began the Gujarati paper Rast Goftar.", imp: 2,
    cites: [W("Dadabhai_Naoroji", "Dadabhai Naoroji")] },
  { id: "w202-haug-essays", branch: "zoroastrianism", y: 1862.5, when: "1862", title: "Haug's Essays on the religion of the Parsis",
    text: "Martin Haug's Essays on the Sacred Language, Writings and Religion of the Parsis gave the first grammatical description of Avestan; in his Bombay lectures he argued that Zarathushtra taught a pure ethical monotheism.", imp: 2,
    cites: [{ t: "Haug, Martin — Encyclopaedia Iranica", u: "https://www.iranicaonline.org/articles/haug-martin/", k: "reference" }, W("Martin_Haug", "Martin Haug")] },
  { id: "w202-darmesteter-zend-avesta", branch: "zoroastrianism", y: 1880.5, end: 1883.5, when: "1880 and 1883", title: "Darmesteter translates the Zend-Avesta for Sacred Books of the East",
    text: "James Darmesteter's English translation of the Zend-Avesta, the Zoroastrian scriptures, appeared in Max Müller's Oxford series, part one (Vendidad) in 1880 and part two in 1883.", imp: 3,
    cites: [B("biography/James-Darmesteter", "James Darmesteter"), W("Sacred_Books_of_the_East", "Sacred Books of the East")] },
  { id: "w202-iran-jizya-abolished", branch: "zoroastrianism", y: 1882.5, when: "1882 (Wikipedia's Jizya article says 1884)", title: "Iran abolishes the jizya on Zoroastrians", link: "iran",
    text: "The jizya poll tax paid by Iran's Zoroastrians was abolished in 1882, after years of effort by the Parsi emissary Maneckji Limji Hataria and a Parsi deputation to the shah in England in 1873.", imp: 2,
    cites: [{ t: "The Life and Times of Manekji Limji Hataria — Center for Iranian and Zoroastrian Studies (CAIS)", u: "https://www.cais-soas.com/CAIS/Religions/iranian/Zarathushtrian/manekji_limji.htm" }, { t: "Hataria, Manekji Limji — Encyclopaedia Iranica", u: "https://www.iranicaonline.org/articles/hataria-manekji-limji/", k: "reference" }, W("Maneckji_Limji_Hataria", "Maneckji Limji Hataria")] },

  // ---------- Utilitarianism ----------
  { id: "w202-mill-utilitarianism", branch: "utilitarianism", y: 1861.8, when: "1861 (as a book, 1863)", title: "Mill's Utilitarianism appears in Fraser's Magazine",
    text: "John Stuart Mill's Utilitarianism, one of his best-known works, first appeared as three articles in Fraser's Magazine in 1861 and was collected as a single book in 1863.", imp: 2,
    cites: [{ t: "John Stuart Mill: Ethics — Internet Encyclopedia of Philosophy", u: "https://iep.utm.edu/mill/", k: "reference" }, W("Utilitarianism_(book)", "Utilitarianism (book)")] },
  { id: "w202-sidgwick-methods-of-ethics", branch: "utilitarianism", y: 1874.5, when: "1874", title: "Sidgwick publishes The Methods of Ethics",
    text: "Henry Sidgwick's The Methods of Ethics, in many ways the culmination of classical utilitarianism, has been called the most significant English-language ethical work of the 19th century by some critics.", imp: 2,
    cites: [S("sidgwick", "Henry Sidgwick"), B("biography/Henry-Sidgwick", "Henry Sidgwick")] },
] });

G("sokoto-jihad", 13.06, 5.25, 400, "Sokoto Caliphate (northern Nigeria)", "Sokoto_Caliphate", "region");
G("deoband", 29.69, 77.68, 40, "Deoband, India", "Deoband");
G("mahdi-proclaimed", 15, 30, 800, "Sudan", "Sudan", "region");
G("urwa-wuthqa", 48.86, 2.35, 30, "Paris, France", "Paris");
G("ahmadiyya", 31, 75.5, 150, "Punjab, India", "Punjab,_India", "region");
G("al-manar", 30.04, 31.24, 40, "Cairo, Egypt", "Cairo");
G("caliphate-abolished", 39.93, 32.86, 40, "Ankara, Turkey", "Ankara");
G("jacobi-jaina-sutras", 51.75, -1.26, 40, "Oxford, England", "Oxford");
G("virchand-gandhi", 41.88, -87.63, 40, "Chicago, United States", "Chicago");
G("grand-sanhedrin", 48.86, 2.35, 30, "Paris, France", "Paris");
G("hamburg-temple", 53.55, 9.99, 30, "Hamburg, Germany", "Hamburg");
G("wissenschaft-verein", 52.52, 13.4, 30, "Berlin, Germany", "Berlin");
G("hebrew-union-college", 39.1, -84.51, 40, "Cincinnati, United States", "Cincinnati");
G("russian-pogroms", 50.45, 30.52, 700, "Southern Russian Empire (Kyiv)", "Kyiv", "region");
G("pittsburgh-platform", 40.44, -79.99, 40, "Pittsburgh, United States", "Pittsburgh");
G("first-zionist-congress", 47.56, 7.59, 30, "Basel, Switzerland", "Basel");
G("daf-yomi", 48.21, 16.37, 30, "Vienna, Austria", "Vienna");
G("constant-liberty", 46.6, 2.2, 500, "France", "France", "region");
G("tocqueville-democracy", 46.6, 2.2, 500, "France", "France", "region");
G("mill-on-liberty", 51.51, -0.13, 40, "London, England", "London");
G("green-liberal-legislation", 51.75, -1.26, 40, "Oxford, England", "Oxford");
G("hobhouse-liberalism", 51.51, -0.13, 40, "London, England", "London");
G("first-international", 51.51, -0.13, 40, "London, England", "London");
G("capital-vol1", 51.2, 10.4, 500, "Germany", "Germany", "region");
G("second-international", 48.86, 2.35, 30, "Paris, France", "Paris");
G("what-is-to-be-done", 61.5, 105, 2500, "Russia", "Russia", "region");
G("history-class-consciousness", 48.21, 16.37, 30, "Vienna, Austria", "Vienna");
G("oshio-revolt", 34.69, 135.5, 40, "Osaka, Japan", "Osaka");
G("wijeong-cheoksa", 37.57, 126.98, 150, "Korea (Joseon)", "Seoul", "region");
G("greek-autocephaly", 37.98, 23.73, 60, "Athens, Greece", "Athens");
G("bulgarian-exarchate", 41.01, 28.98, 40, "Constantinople (Istanbul)", "Istanbul");
G("brothers-karamazov", 61.5, 105, 2500, "Russia", "Russia", "region");
G("seraphim-canonized", 54.94, 43.32, 40, "Sarov, Russia", "Sarov");
G("moscow-patriarchate-restored", 55.75, 37.62, 40, "Moscow, Russia", "Moscow");
G("bible-society", 51.51, -0.13, 40, "London, England", "London");
G("schleiermacher-christian-faith", 52.52, 13.4, 30, "Berlin, Germany", "Berlin");
G("salvation-army", 51.51, -0.13, 40, "London, England", "London");
G("azusa-street", 34.05, -118.24, 40, "Los Angeles, United States", "Los_Angeles");
G("edinburgh-1910", 55.95, -3.19, 30, "Edinburgh, Scotland", "Edinburgh");
G("barth-romerbrief", 46.8, 8.2, 200, "Switzerland", "Switzerland", "region");
G("golden-temple-gilded", 31.62, 74.88, 30, "Amritsar, India", "Amritsar");
G("singh-sabha", 31.62, 74.88, 30, "Amritsar, India", "Amritsar");
G("sgpc-formed", 31.62, 74.88, 30, "Amritsar, India", "Amritsar");
G("nankana-massacre", 31.45, 73.7, 30, "Nankana Sahib, Pakistan", "Nankana_Sahib");
G("rahnumai-mazdayasnan", 18.97, 72.82, 40, "Mumbai, India", "Mumbai");
G("haug-essays", 18.52, 73.86, 40, "Pune, India", "Pune");
G("darmesteter-zend-avesta", 51.75, -1.26, 40, "Oxford, England", "Oxford");
G("iran-jizya-abolished", 32, 53, 900, "Iran", "Iran", "region");
G("mill-utilitarianism", 51.51, -0.13, 40, "London, England", "London");
G("sidgwick-methods-of-ethics", 52.2, 0.12, 30, "Cambridge, England", "Cambridge");
