// Fill-in W1-04: faiths/philosophy branches, Mandatory Palestine, Palestine and the South Caucasus, 1925–present. Every cite below was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });
const B = (path, title) => ({ t: `${title} — Britannica`, u: `https://www.britannica.com/${path}`, k: "reference" });
const SEP = (slug, title) => ({ t: `${title} — Stanford Encyclopedia of Philosophy`, u: `https://plato.stanford.edu/entries/${slug}/`, k: "reference" });

TL.add({ events: [
  // ---------- Liberalism ----------
  { id: "w104-mises-liberalismus", branch: "liberalism", y: 1927, when: "1927", title: "Mises publishes Liberalismus",
    text: "Ludwig von Mises's Liberalismus, published in Jena, defended classical liberalism, centered on private property, limited government and peace.", imp: 3,
    cites: [W("Liberalism_(book)", "Liberalism (book)"), { t: "Liberalism: The Classical Tradition (1927) — Online Library of Liberty", u: "https://oll.libertyfund.org/titles/greaves-liberalism-the-classical-tradition-1927-lf-ed" }] },
  { id: "w104-hayek-road-to-serfdom", branch: "liberalism", y: 1944.2, when: "March 1944 (Britain); September 18, 1944 (United States)", title: "Hayek publishes The Road to Serfdom",
    text: "Friedrich Hayek's book warned that government control of economic life leads toward totalitarianism and erodes personal liberty. It appeared from Routledge in Britain and Chicago in the US.", imp: 2,
    cites: [W("The_Road_to_Serfdom", "The Road to Serfdom"), { t: "Friedrich A. Hayek — Concise Encyclopedia of Economics (Econlib)", u: "https://www.econlib.org/library/Enc/bios/Hayek.html", k: "reference" }] },
  { id: "w104-berlin-two-concepts", branch: "liberalism", y: 1958.83, when: "October 31, 1958", title: "Berlin's “Two Concepts of Liberty”",
    text: "Isaiah Berlin's Oxford inaugural lecture distinguished negative liberty (freedom from interference) from positive liberty (self-mastery), warning that the latter can be abused to justify paternalism and tyranny.", imp: 2,
    cites: [W("Two_Concepts_of_Liberty", "Two Concepts of Liberty"), SEP("liberty-positive-negative", "Positive and Negative Liberty")] },
  { id: "w104-fukuyama-end-of-history", branch: "liberalism", y: 1989.5, when: "Summer 1989", title: "Fukuyama's “The End of History?”",
    text: "Francis Fukuyama's essay in The National Interest argued that liberal democracy had proven superior to its rivals and might be the endpoint of ideological evolution; he expanded it into a 1992 book.", imp: 2,
    cites: [W("The_End_of_History_and_the_Last_Man", "The End of History and the Last Man"), B("biography/Francis-Fukuyama", "Francis Fukuyama")] },

  // ---------- Marxism ----------
  { id: "w104-gramsci-prison-notebooks", branch: "marxism", y: 1929.12, end: 1935, when: "1929–1935", title: "Gramsci writes the Prison Notebooks",
    text: "Jailed by Mussolini's regime, Antonio Gramsci filled over thirty notebooks that developed “hegemony”: capitalist rule rests on cultural consent as well as force. They shaped later Marxist theory.", imp: 2,
    cites: [W("Prison_Notebooks", "Prison Notebooks"), { t: "Antonio Gramsci Archive — Marxists Internet Archive", u: "https://www.marxists.org/archive/gramsci/", k: "archive" }, SEP("gramsci", "Antonio Gramsci")] },
  { id: "w104-dialectic-of-enlightenment", branch: "marxism", y: 1947, when: "1944 (first circulated); 1947 (Amsterdam edition)", title: "Dialectic of Enlightenment",
    text: "Frankfurt School thinkers Horkheimer and Adorno asked why Enlightenment promises of freedom ended in fascism and consumer capitalism, arguing that “myth is already enlightenment.” The revised book appeared in 1947.", imp: 2,
    cites: [W("Dialectic_of_Enlightenment", "Dialectic of Enlightenment"), SEP("adorno", "Theodor W. Adorno")] },
  { id: "w104-althusser-for-marx", branch: "marxism", y: 1965, when: "1965", title: "Althusser publishes For Marx",
    text: "French Communist theorist Louis Althusser proposed an “epistemological break” between the young, Hegelian Marx and the mature author of Capital, and argued for a structural, antihumanist reading of Marxism.", imp: 2,
    cites: [W("For_Marx", "For Marx"), SEP("althusser", "Louis Althusser")] },
  { id: "w104-laclau-mouffe-hegemony", branch: "marxism", y: 1985, when: "1985", title: "Laclau and Mouffe's Hegemony and Socialist Strategy",
    text: "Ernesto Laclau and Chantal Mouffe recast hegemony as the basis of a strategy of radical democracy, treating collective identity as contingent and not founded on economic class.", imp: 3,
    cites: [W("Hegemony_and_Socialist_Strategy", "Hegemony and Socialist Strategy"), SEP("gramsci", "Antonio Gramsci")] },

  // ---------- Neo-Confucianism ----------
  { id: "w104-liang-eastern-western-cultures", branch: "neo-confucianism", y: 1921, when: "1921", title: "Liang Shuming's Eastern and Western Cultures",
    text: "Liang Shuming's book compared Western, Chinese and Indian cultural attitudes and argued for the modern relevance of Confucian culture; it counts among the initial works of contemporary Confucianism.", imp: 2,
    cites: [W("Liang_Shuming", "Liang Shuming"), B("biography/Liang-Shuming", "Liang Shuming"), SEP("confucianism-modern", "Modern Confucianism")] },

  // ---------- Phenomenology ----------
  { id: "w104-merleau-ponty-perception", branch: "phenomenology", y: 1945, when: "1945", title: "Merleau-Ponty's Phenomenology of Perception",
    text: "Maurice Merleau-Ponty argued for the “primacy of perception” and put the lived body at the center of experience, challenging Cartesian dualism and the subject–object divide. It was published by Gallimard.", imp: 2,
    cites: [W("Phenomenology_of_Perception", "Phenomenology of Perception"), SEP("merleau-ponty", "Maurice Merleau-Ponty")] },
  { id: "w104-gadamer-truth-and-method", branch: "phenomenology", y: 1960, when: "1960", title: "Gadamer's Truth and Method",
    text: "Hans-Georg Gadamer built philosophical hermeneutics on Heidegger's work, arguing that understanding is shaped by history and tradition and happens as a “fusion of horizons” between interpreter and text.", imp: 2,
    cites: [W("Truth_and_Method", "Truth and Method"), SEP("gadamer", "Hans-Georg Gadamer")] },
  { id: "w104-ricoeur-time-and-narrative", branch: "phenomenology", y: 1984, end: 1988, when: "1984–1988", title: "Ricoeur's Time and Narrative",
    text: "Paul Ricoeur's three volumes argued that narrative joins lived time and cosmic time into human time, with plot as the way stories make sense of action; the work led him to narrative identity.", imp: 3,
    cites: [SEP("ricoeur", "Paul Ricoeur")] },

  // ---------- Pragmatism ----------
  { id: "w104-dewey-art-as-experience", branch: "pragmatism", y: 1934, when: "1934", title: "Dewey's Art as Experience",
    text: "John Dewey, drawing on Harvard lectures, argued that aesthetic value grows out of ordinary experience and criticized the “museum conception” that cuts art off from everyday life.", imp: 2,
    cites: [W("Art_as_Experience", "Art as Experience"), SEP("dewey-aesthetics", "Dewey's Aesthetics")] },
  { id: "w104-rorty-mirror-of-nature", branch: "pragmatism", y: 1979, when: "1979", title: "Rorty's Philosophy and the Mirror of Nature",
    text: "Richard Rorty (Princeton University Press) argued that philosophy's picture of the mind mirroring reality is mistaken, and treated knowledge as social practice, a landmark for neopragmatism.", imp: 2,
    cites: [W("Philosophy_and_the_Mirror_of_Nature", "Philosophy and the Mirror of Nature"), SEP("rorty", "Richard Rorty")] },
  { id: "w104-rorty-contingency-irony", branch: "pragmatism", y: 1989, when: "1989", title: "Rorty's Contingency, Irony, and Solidarity",
    text: "Rorty argued that no vocabulary is grounded in the nature of reality, separated private self-creation from public justice, and held that progress comes from novelists and others who widen sympathy.", imp: 3,
    cites: [SEP("rorty", "Richard Rorty")] },

  // ---------- Sikhism ----------
  { id: "w104-sikh-rehat-maryada", branch: "sikhism", y: 1945.09, when: "February 3, 1945", title: "SGPC approves the Sikh Rehat Maryada",
    text: "The Shiromani Gurdwara Parbandhak Committee accepted the final Sikh code of conduct, covering the definition of a Sikh, daily duties, gurdwara services and ceremonies; its approval was controversial.", imp: 2,
    cites: [W("Sikh_Rehat_Maryada", "Sikh Rehat Maryada"), { t: "Sikh Rehat Maryada — Sikh Missionary Society (U.K.)", u: "https://www.sikhmissionarysociety.org/sms/smssikhism/codeofconduct/" }] },

  // ---------- Ubuntu ----------
  { id: "w104-tempels-bantu-philosophy", branch: "ubuntu", y: 1945, when: "1945", title: "Tempels's Bantu Philosophy",
    text: "Missionary Placide Tempels argued that Bantu-speaking peoples understand reality as vital force; the book provoked debate about African philosophy and later African scholars' critiques.", imp: 3,
    cites: [W("Bantu_Philosophy", "Bantu Philosophy"), B("topic/Bantu-philosophy", "Bantu philosophy")] },

  // ---------- Utilitarianism ----------
  { id: "w104-singer-animal-liberation", branch: "utilitarianism", y: 1975, when: "1975", title: "Singer's Animal Liberation",
    text: "Peter Singer argued that the interests of all beings able to suffer deserve equal consideration and condemned “speciesism,” launching the modern animal-welfare movement from a utilitarian base.", imp: 2,
    cites: [W("Animal_Liberation_(book)", "Animal Liberation (book)"), SEP("moral-animal", "The Moral Status of Animals")] },
  { id: "w104-parfit-reasons-persons", branch: "utilitarianism", y: 1984, when: "1984", title: "Parfit's Reasons and Persons",
    text: "Derek Parfit's first book challenged conventional views of personal identity, argued for impersonal ethics, and introduced the “repugnant conclusion” in population ethics.", imp: 2,
    cites: [W("Reasons_and_Persons", "Reasons and Persons"), B("biography/Derek-Parfit", "Derek Parfit")] },
  { id: "w104-giving-what-we-can", branch: "utilitarianism", y: 2009.87, when: "November 2009", title: "Giving What We Can founded at Oxford",
    text: "Philosophers Toby Ord and William MacAskill, with Bernadette Young, launched a society whose members pledge 10 percent of income to effective charities, an early institution of effective altruism.", imp: 3,
    cites: [W("Giving_What_We_Can", "Giving What We Can"), { t: "Our history — Giving What We Can", u: "https://www.givingwhatwecan.org/about-us/history" }] },

  // ---------- Zoroastrianism ----------
  { id: "w104-un-nowruz-day", branch: "zoroastrianism", y: 2010.13, when: "February 2010", title: "UN recognizes International Day of Nowruz",
    text: "The UN General Assembly recognized March 21 as International Day of Nowruz; the spring festival's roots lie in Zoroastrianism and it is still a holy day for Zoroastrians.", imp: 3,
    cites: [W("Nowruz", "Nowruz"), B("topic/Nowruz", "Nowruz"), { t: "International Day of Nowruz — UNESCO", u: "https://www.unesco.org/en/days/nowruz", k: "reference" }] },

  // ---------- Mandatory Palestine ----------
  { id: "w104-hebrew-university-opens", branch: "mandatory-palestine", y: 1925.25, when: "April 1, 1925", title: "Hebrew University of Jerusalem opens",
    text: "Lord Balfour opened the Hebrew University, with Chaim Weizmann presiding, on Mount Scopus; its foundation stones had been laid in 1918, and Albert Einstein was among its founders.", imp: 2,
    cites: [{ t: "Hebrew University of Jerusalem — Jewish Virtual Library", u: "https://www.jewishvirtuallibrary.org/hebrew-university-of-jerusalem" }, W("Hebrew_University_of_Jerusalem", "Hebrew University of Jerusalem")] },
  { id: "w104-1929-riots", branch: "mandatory-palestine", y: 1929.64, end: 1929.66, when: "August 23–29, 1929", title: "1929 Palestine riots",
    text: "After disputes at the Western Wall, violence killed 133 Jews and 116 Arabs, including dozens of Jews in Hebron; the Shaw and Hope Simpson commissions led to a 1930 white paper proposing limits on Jewish immigration and land purchases.", imp: 2,
    cites: [W("1929_Palestine_riots", "1929 Palestine riots"), { t: "Western Wall Disturbances — Encyclopedia.com", u: "https://encyclopedia.com/politics/dictionaries-thesauruses-pictures-and-press-releases/western-wall-disturbances" }] },
  { id: "w104-haavara-agreement", branch: "mandatory-palestine", y: 1933.65, when: "August 25, 1933", title: "Haavara (Transfer) Agreement",
    text: "Nazi Germany and Zionist organizations let Jews fleeing persecution move part of their assets to Palestine as German goods; more than 50,000 German Jews emigrated to Palestine under it by 1939.", imp: 2,
    cites: [W("Haavara_Agreement", "Haavara Agreement"), { t: "Das Haavara-Transfer-Abkommen — Bundeszentrale für politische Bildung", u: "https://www.bpb.de/themen/nationalsozialismus-zweiter-weltkrieg/die-wohnung/195259/das-haavara-transfer-abkommen/", k: "reference" }] },
  { id: "w104-biltmore-program", branch: "mandatory-palestine", y: 1942.35, end: 1942.36, when: "May 6–11, 1942", title: "Biltmore Conference demands a Jewish Commonwealth",
    text: "An Extraordinary Zionist Conference at New York's Biltmore Hotel urged that Palestine become a Jewish Commonwealth, with open immigration, rejecting the 1939 White Paper; it became the movement's platform.", imp: 2,
    cites: [W("Biltmore_Conference", "Biltmore Conference"), { t: "The Biltmore Conference (1942) — Jewish Virtual Library", u: "https://jewishvirtuallibrary.org/the-biltmore-conference-1942" }] },

  // ---------- Palestine ----------
  { id: "w104-arafat-dies", branch: "palestine", y: 2004.86, when: "November 11, 2004", title: "Yasser Arafat dies",
    text: "After more than two years confined by the Israeli army in Ramallah, the Palestinian Authority president died in France and was buried in Ramallah; the illness was never publicly disclosed.", imp: 2,
    cites: [W("Yasser_Arafat", "Yasser Arafat"), { t: "Palestinian Leader Yasser Arafat Dies in Paris Hospital — PBS NewsHour", u: "https://www.pbs.org/newshour/politics/middle_east-july-dec04-arafat-funeral_11-11", k: "news" }] },
  { id: "w104-icj-advisory-opinion", branch: "palestine", y: 2024.55, when: "July 19, 2024", title: "ICJ delivers advisory opinion on the occupied territory",
    text: "The International Court of Justice gave its advisory opinion answering questions posed by the UN General Assembly about the occupied Palestinian territory; several judges added separate and dissenting opinions.", imp: 2,
    cites: [{ t: "Advisory Opinion of 19 July 2024 — International Court of Justice", u: "https://www.icj-cij.org/case/186", k: "primary" }] },

  // ---------- South Caucasus ----------
  { id: "w104-baku-supsa-pipeline", branch: "south-caucasus", y: 1999.29, when: "April 17, 1999", title: "Baku–Supsa pipeline terminal inaugurated",
    text: "The 833 km pipeline carries oil from Baku's Sangachal terminal through Tbilisi to Georgia's Black Sea coast, creating a western export route for Azerbaijani crude.", imp: 3,
    cites: [W("Baku%E2%80%93Supsa_Pipeline", "Baku–Supsa Pipeline"), { t: "The transportation of oil — Ministry of Energy of Azerbaijan", u: "https://minenergy.gov.az/en/neft/baki-novorossiysk-neft-kemeri", k: "reference" }] },
  { id: "w104-armenia-parliament-shooting", branch: "south-caucasus", y: 1999.82, when: "October 27, 1999", title: "Gunmen storm Armenia's parliament",
    text: "Five armed men killed eight officials, including Prime Minister Vazgen Sargsyan and Speaker Karen Demirchyan, during a session in Yerevan, then surrendered the next day.", imp: 2,
    cites: [W("1999_Armenian_parliament_shooting", "1999 Armenian parliament shooting"), { t: "Caucasus Report: October 28, 1999 — RFE/RL", u: "https://www.rferl.org/a/1342016.html", k: "news" }] },
  { id: "w104-azerbaijan-eurovision", branch: "south-caucasus", y: 2011.37, when: "May 14, 2011", title: "Azerbaijan wins Eurovision",
    text: "Ell & Nikki's “Running Scared” won the 2011 Eurovision Song Contest in Düsseldorf, Azerbaijan's first victory, and brought the next contest to Baku.", imp: 3,
    cites: [W("Eurovision_Song_Contest_2011", "Eurovision Song Contest 2011"), { t: "Azerbaijan wins Eurovision — France 24", u: "https://www.france24.com/en/20110515-europe-azerbaijan-wins-eurovision-song-contest", k: "news" }] },
  { id: "w104-qvevri-unesco", branch: "south-caucasus", y: 2013.9, when: "2013", title: "UNESCO lists Georgian qvevri winemaking",
    text: "UNESCO added Georgia's ancient method of fermenting wine with skins in buried egg-shaped clay vessels to its Intangible Cultural Heritage list; the wine cellar is regarded as the most sacred part of a household.", imp: 2,
    cites: [{ t: "Ancient Georgian traditional Qvevri wine-making method — UNESCO", u: "https://ich.unesco.org/en/RL/ancient-georgian-traditional-qvevri-wine-making-method-00870", k: "reference" }, W("Qvevri", "Qvevri")] },
  { id: "w104-four-day-war", branch: "south-caucasus", y: 2016.25, end: 2016.26, when: "April 1–5, 2016", title: "Four-day Karabakh clashes",
    text: "The most intense fighting since the 1994 ceasefire along the Nagorno-Karabakh line of contact ended after four days with a truce on April 5; casualty figures remain disputed.", imp: 2,
    cites: [W("2016_Armenian%E2%80%93Azerbaijani_clashes", "2016 Armenian–Azerbaijani clashes"), { t: "Tensions Between Armenia and Azerbaijan — Council on Foreign Relations", u: "https://www.cfr.org/global-conflict-tracker/conflict/nagorno-karabakh-conflict", k: "reference" }, { t: "Armenia and Azerbaijan call Nagorno-Karabakh ceasefire — Al Jazeera", u: "https://www.aljazeera.com/news/2016/4/5/armenia-and-azerbaijan-call-nagorno-karabakh-ceasefire", k: "news" }] },
] });

TL.geo("w104-mises-liberalismus", { scope: "place", lat: 50.93, lon: 11.59, r: 40, label: "Jena, Germany", src: "https://en.wikipedia.org/wiki/Jena" });
TL.geo("w104-hayek-road-to-serfdom", { scope: "place", lat: 51.51, lon: -0.13, r: 40, label: "London, England", src: "https://en.wikipedia.org/wiki/London" });
TL.geo("w104-berlin-two-concepts", { scope: "place", lat: 51.75, lon: -1.26, r: 40, label: "Oxford, England", src: "https://en.wikipedia.org/wiki/Oxford" });
TL.geo("w104-fukuyama-end-of-history", { scope: "global" });
TL.geo("w104-gramsci-prison-notebooks", { scope: "place", lat: 40.97, lon: 17.12, r: 40, label: "Turi, Italy", src: "https://en.wikipedia.org/wiki/Turi,_Apulia" });
TL.geo("w104-dialectic-of-enlightenment", { scope: "place", lat: 52.37, lon: 4.9, r: 40, label: "Amsterdam, Netherlands", src: "https://en.wikipedia.org/wiki/Amsterdam" });
TL.geo("w104-althusser-for-marx", { scope: "place", lat: 48.86, lon: 2.35, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w104-laclau-mouffe-hegemony", { scope: "global" });
TL.geo("w104-liang-eastern-western-cultures", { scope: "region", lat: 35, lon: 103, r: 2500, label: "China", src: "https://en.wikipedia.org/wiki/China" });
TL.geo("w104-merleau-ponty-perception", { scope: "place", lat: 48.86, lon: 2.35, r: 40, label: "Paris, France", src: "https://en.wikipedia.org/wiki/Paris" });
TL.geo("w104-gadamer-truth-and-method", { scope: "region", lat: 51, lon: 9, r: 450, label: "Germany", src: "https://en.wikipedia.org/wiki/Germany" });
TL.geo("w104-ricoeur-time-and-narrative", { scope: "region", lat: 47, lon: 2, r: 500, label: "France", src: "https://en.wikipedia.org/wiki/France" });
TL.geo("w104-dewey-art-as-experience", { scope: "place", lat: 42.37, lon: -71.11, r: 40, label: "Cambridge, Massachusetts", src: "https://en.wikipedia.org/wiki/Cambridge,_Massachusetts" });
TL.geo("w104-rorty-mirror-of-nature", { scope: "place", lat: 40.36, lon: -74.66, r: 40, label: "Princeton, New Jersey", src: "https://en.wikipedia.org/wiki/Princeton,_New_Jersey" });
TL.geo("w104-rorty-contingency-irony", { scope: "region", lat: 40, lon: -100, r: 2500, label: "United States", src: "https://en.wikipedia.org/wiki/United_States" });
TL.geo("w104-sikh-rehat-maryada", { scope: "place", lat: 31.64, lon: 74.86, r: 40, label: "Amritsar, India", src: "https://en.wikipedia.org/wiki/Amritsar" });
TL.geo("w104-tempels-bantu-philosophy", { scope: "region", lat: -5, lon: 25, r: 2000, label: "Central and Southern Africa", src: "https://en.wikipedia.org/wiki/Central_Africa" });
TL.geo("w104-singer-animal-liberation", { scope: "global" });
TL.geo("w104-parfit-reasons-persons", { scope: "place", lat: 51.75, lon: -1.26, r: 40, label: "Oxford, England", src: "https://en.wikipedia.org/wiki/Oxford" });
TL.geo("w104-giving-what-we-can", { scope: "place", lat: 51.75, lon: -1.26, r: 40, label: "Oxford, England", src: "https://en.wikipedia.org/wiki/Oxford" });
TL.geo("w104-un-nowruz-day", { scope: "global" });
TL.geo("w104-hebrew-university-opens", { scope: "place", lat: 31.78, lon: 35.22, r: 40, label: "Jerusalem", src: "https://en.wikipedia.org/wiki/Jerusalem" });
TL.geo("w104-1929-riots", { scope: "place", lat: 31.78, lon: 35.22, r: 40, label: "Jerusalem", src: "https://en.wikipedia.org/wiki/Jerusalem" });
TL.geo("w104-haavara-agreement", { scope: "region", lat: 31.75, lon: 35.24, r: 250, label: "Mandatory Palestine", src: "https://en.wikipedia.org/wiki/Mandatory_Palestine" });
TL.geo("w104-biltmore-program", { scope: "place", lat: 40.71, lon: -74.01, r: 40, label: "New York City", src: "https://en.wikipedia.org/wiki/New_York_City" });
TL.geo("w104-arafat-dies", { scope: "place", lat: 31.9, lon: 35.2, r: 40, label: "Ramallah", src: "https://en.wikipedia.org/wiki/Ramallah" });
TL.geo("w104-icj-advisory-opinion", { scope: "place", lat: 52.08, lon: 4.3, r: 40, label: "The Hague, Netherlands", src: "https://en.wikipedia.org/wiki/The_Hague" });
TL.geo("w104-baku-supsa-pipeline", { scope: "region", lat: 42, lon: 43.5, r: 300, label: "Georgia", src: "https://en.wikipedia.org/wiki/Georgia_(country)" });
TL.geo("w104-armenia-parliament-shooting", { scope: "place", lat: 40.18, lon: 44.51, r: 40, label: "Yerevan, Armenia", src: "https://en.wikipedia.org/wiki/Yerevan" });
TL.geo("w104-azerbaijan-eurovision", { scope: "place", lat: 51.23, lon: 6.78, r: 40, label: "Düsseldorf, Germany", src: "https://en.wikipedia.org/wiki/D%C3%BCsseldorf" });
TL.geo("w104-qvevri-unesco", { scope: "region", lat: 42, lon: 43.5, r: 300, label: "Georgia", src: "https://en.wikipedia.org/wiki/Georgia_(country)" });
TL.geo("w104-four-day-war", { scope: "region", lat: 39.82, lon: 46.75, r: 150, label: "Nagorno-Karabakh", src: "https://en.wikipedia.org/wiki/Nagorno-Karabakh" });
