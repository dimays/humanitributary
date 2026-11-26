// Origins (faiths and philosophical traditions): TL.origin for 29 input branches.
const W16f = (p, t) => ({ t: t + " — Wikipedia", u: "https://en.wikipedia.org/wiki/" + p });
const S16f = (slug, t) => ({ t: t + " (Stanford Encyclopedia of Philosophy)", u: "https://plato.stanford.edu/entries/" + slug + "/" });

TL.origin("sikhism", {
  note: "Sikhism arose in the Punjab around the end of the 15th century from Guru Nanak's teaching. Western scholarship generally places it in the Hindu bhakti and sant milieu, with some Sufi Islamic influence; its scripture includes hymns by Hindu and Muslim bhagats such as Kabir and Farid.",
  links: [
    { id: "hinduism", how: "ideas", note: "Guru Nanak taught within the medieval bhakti and sant devotional milieu" },
    { id: "islam", how: "ideas", note: "Scholars recognize some Sufi Islamic influences; the Adi Granth includes Farid and Kabir" },
  ],
  cites: [W16f("Sikhism", "Sikhism"), { t: "Sikhism | History, Doctrines, Practice, & Literature | Britannica", u: "https://www.britannica.com/topic/Sikhism" }],
});

TL.origin("presocratic-philosophy", {
  note: "Greek inquiry into nature began at Miletus in Ionia with Thales, whom Aristotle names the first. It broke with the god-filled cosmogonies of Homer and Hesiod, though Near Eastern and Egyptian influence on early Greek thought is also discussed.",
  links: [
    { id: "ancient-greece", how: "peoples", note: "Thinkers worked in Greek cities from Ionia to southern Italy and Sicily" },
  ],
  cites: [S16f("presocratics", "Presocratic Philosophy")],
});

TL.origin("platonism", {
  note: "Plato, a student of Socrates, founded the Academy at Athens after returning from his travels to Italy and Sicily. Parmenides, Heraclitus and the Pythagoreans are named as influences on his thought.",
  links: [
    { id: "presocratic-philosophy", how: "ideas", note: "Heraclitus, Parmenides and the Pythagoreans shaped Plato's ideas" },
    { id: "ancient-greece", how: "peoples", note: "The Academy lay in a grove outside the walls of Athens" },
  ],
  cites: [
    { t: "Plato | Internet Encyclopedia of Philosophy", u: "https://iep.utm.edu/plato/" },
    S16f("plato", "Plato"),
  ],
});

TL.origin("aristotelianism", {
  note: "Aristotle came to Athens at about seventeen and studied at Plato's Academy until Plato died in 347 BCE. He criticized Plato's Forms, returned to Athens in 335 BCE and founded the Lyceum, whose members were called Peripatetics.",
  links: [
    { id: "platonism", how: "ideas", note: "Aristotle studied at the Academy for years, then criticized Plato's Forms" },
  ],
  cites: [S16f("aristotle", "Aristotle")],
});

TL.origin("stoicism", {
  note: "Zeno of Citium founded the Stoic school around 300 BCE at the painted porch (stoa) in the Athenian Agora. He studied under Crates the Cynic and was influenced by Plato's Academy and the Megarian school.",
  links: [
    { id: "platonism", how: "ideas", note: "Zeno was influenced by the teachings of Plato's Academy" },
  ],
  cites: [S16f("stoicism", "Stoicism")],
});

TL.origin("epicureanism", {
  note: "Epicurus took his physics of atoms and void above all from Democritus and the earlier atomists, studied under the Democritean Nausiphanes, and rejected Plato's Forms. He opposed the Cyrenaics' ever-increasing desires.",
  links: [
    { id: "presocratic-philosophy", how: "ideas", note: "Atoms and void came from Democritus and earlier atomists" },
    { id: "platonism", how: "reaction", note: "Epicurus rejected transcendent entities such as Platonic Forms" },
  ],
  cites: [S16f("epicurus", "Epicurus"), S16f("presocratics", "Presocratic Philosophy")],
});

TL.origin("ancient-skepticism", {
  note: "Pyrrhonian skepticism looks back to Pyrrho (c. 365/60–275/70 BCE), who wrote nothing; Academic skepticism began when Arcesilaus turned Plato's Academy skeptical from 266/268 BCE, inspired by Socrates's examination of beliefs.",
  links: [
    { id: "platonism", how: "ideas", note: "Arcesilaus led the Academy from 266/268 BCE and turned it skeptical" },
  ],
  cites: [S16f("skepticism-ancient", "Ancient Skepticism")],
});

TL.origin("daoist-philosophy", {
  note: "Classical Daoist thought emerged in the Warring States period, with the Laozi and Zhuangzi from roughly the 5th to 3rd centuries BCE. It answered the Confucian–Mohist dispute over the proper way (dao); Han historians coined the label “Daoist.”",
  links: [
    { id: "zhou", how: "peoples", note: "Emerged in the Warring States era of the Zhou world" },
    { id: "confucianism", how: "reaction", note: "Daoism critiqued Confucian and Mohist positions on the proper way" },
  ],
  cites: [S16f("daoism", "Daoism")],
});

TL.origin("mohism", {
  note: "Mozi, probably an artisan, most likely flourished in the mid-to-late 5th century BCE. Mohism was largely a critique of Ru (Confucian) thought, rejecting its stress on traditional ritual and elaborate funerals, and flourished in the Warring States era.",
  links: [
    { id: "confucianism", how: "reaction", note: "Mohism was largely a critique of Ru thought on ritual and tradition" },
    { id: "zhou", how: "peoples", note: "Arose and flourished in the Warring States era of the Zhou world" },
  ],
  cites: [S16f("mohism", "Mohism")],
});

TL.origin("legalism", {
  note: "The fa tradition emerged in the late Warring States period, when the aristocratic order had collapsed, seeking a rich state and strong army. Shang Yang reformed Qin; Han Fei built on him. “Legalist” is a later label coined by Sima Tan.",
  links: [
    { id: "confucianism", how: "reaction", note: "Fa thinkers rejected appeals to antiquity and moral exemplars" },
    { id: "mohism", how: "reaction", note: "Fa thinkers likewise rejected Mohist and Confucian models for impersonal laws" },
    { id: "zhou", how: "peoples", note: "Arose in the late Warring States era as aristocratic order collapsed" },
  ],
  cites: [S16f("chinese-legalism", "Chinese Legalism")],
});

TL.origin("jain-philosophy", {
  note: "Jain philosophy is traced by historians to Mahavira, a sixth-century BCE contemporary of the Buddha; Jains themselves hold their doctrines eternal. His teaching arose partly as a response to Brahmanism, rejecting its caste system and the authority of the Vedas.",
  links: [
    { id: "vedic", how: "reaction", note: "Rejected the authority of the Vedas and Upanisads and Brahman caste claims" },
  ],
  cites: [{ t: "Jain Philosophy | Internet Encyclopedia of Philosophy", u: "https://iep.utm.edu/jain/" }],
});

TL.origin("carvaka", {
  note: "Indian materialism whose tenets are traced to the later layers of the Rigveda; texts discuss it from the 6th century BCE, when Buddhism and Jainism were emerging. It rejected the Vedas as man-made and religious rites, and lived on until about the 12th century CE.",
  links: [
    { id: "vedic", how: "reaction", note: "Rejected the Vedas as man-made and said they served priests' livelihood" },
  ],
  cites: [W16f("C%C4%81rv%C4%81ka", "Cārvāka"), { t: "Charvaka | Definition, Philosophy, School of Thought, Facts, Founder, Lokayata, & Materialism | Britannica", u: "https://www.britannica.com/topic/Charvaka" }],
});

TL.origin("renaissance-humanism", {
  note: "A “pre-humanism” of renewed interest in classical authors arose in Tuscany, the Veneto and Avignon in the late 13th century, then spread from Italy across Western Europe. Humanists sought a return to the sources, partly against medieval scholasticism.",
  links: [
    { id: "scholasticism", how: "reaction", note: "Partly a reaction against the “pedantry” later attributed to scholasticism" },
  ],
  cites: [W16f("Renaissance_humanism", "Renaissance humanism"), { t: "Humanism | Definition, Principles, History, & Influence | Britannica", u: "https://www.britannica.com/topic/humanism" }],
});

TL.origin("rationalism-empiricism", {
  note: "Descartes's Discourse (1637) rejected scholastic Aristotelian physics for a mechanistic one and held that first principles come from the intellect. Locke rejected Scholastic philosophy and innate ideas, shaped by Boyle and the Royal Society.",
  links: [
    { id: "scholasticism", how: "reaction", note: "Descartes and Locke both rejected Scholastic Aristotelian philosophy" },
    { id: "scientific-revolution", how: "ideas", note: "Descartes offered a mechanistic physics; Locke drew on Boyle and the Royal Society" },
  ],
  cites: [S16f("descartes", "René Descartes"), S16f("locke", "John Locke")],
});

TL.origin("german-idealism", {
  note: "German idealism followed Kant's Critique of Pure Reason (1781), which answered both the Leibniz–Wolff rationalists and Humean empiricism. Reinhold, Fichte, Schelling and Hegel then developed his critical philosophy, ending with Hegel's death in 1831.",
  links: [
    { id: "rationalism-empiricism", how: "ideas", note: "Kant answered the rationalists (Leibniz, Wolff) and empiricists (Locke, Hume)" },
  ],
  cites: [S16f("kant", "Immanuel Kant"), S16f("hegel", "Georg Wilhelm Friedrich Hegel")],
});

TL.origin("utilitarianism", {
  note: "Bentham aligned himself with the Enlightenment, drawing on Locke, Hume and the French philosophes, with Hume, Helvétius and Beccaria supplying key ideas. Earlier theological utilitarians and Hutcheson had stated related views before his 1789 Introduction.",
  links: [
    { id: "enlightenment", how: "ideas", note: "Bentham drew on Locke, Hume, Helvétius and Beccaria" },
  ],
  cites: [S16f("bentham", "Jeremy Bentham"), S16f("utilitarianism-history", "The History of Utilitarianism")],
});

TL.origin("marxism", {
  note: "Marx's thought grew out of German philosophy and criticism of it: he claimed to put Hegel's dialectic on its feet, and Feuerbach shaped his early ideas on alienation. He also engaged the French utopian socialists. The German Ideology (1845–46) set out his materialist method.",
  links: [
    { id: "german-idealism", how: "ideas", note: "Marx claimed to put Hegel's dialectic back on its feet, via Feuerbach" },
  ],
  cites: [S16f("marx", "Karl Marx")],
});

TL.origin("existentialism", {
  note: "Existentialism grew largely as a reaction to Hegel's system-building: Kierkegaard criticized its detached view of the existing individual, and Nietzsche rejected any objective standpoint. Heidegger and Sartre developed it; Marcel coined the word in 1943.",
  links: [
    { id: "german-idealism", how: "reaction", note: "Kierkegaard and Nietzsche opposed Hegel's all-encompassing system" },
  ],
  cites: [S16f("existentialism", "Existentialism")],
});

TL.origin("pragmatism", {
  note: "Pragmatism grew from discussions of the Metaphysical Club at Harvard around 1870, with Peirce stating the pragmatic maxim in 1878. Peirce owed a significant debt to Kant, and James called the view the empiricist attitude, though it rejects experience as “the given.”",
  links: [
    { id: "rationalism-empiricism", how: "ideas", note: "James presented pragmatism as the empiricist attitude" },
    { id: "german-idealism", how: "ideas", note: "Peirce had a significant debt to Kant" },
  ],
  cites: [S16f("pragmatism", "Pragmatism")],
});

TL.origin("phenomenology", {
  note: "Phenomenology launched with Husserl's Logical Investigations (1900–01), combining Brentano's descriptive psychology, Bolzano's distinctions and Frege's logic. The term itself dates to the 18th century and was used by Kant, Fichte and Hegel.",
  links: [
    { id: "analytic-philosophy", how: "ideas", note: "Husserl drew on Frege's logic, as well as Brentano and Bolzano" },
  ],
  cites: [S16f("phenomenology", "Phenomenology")],
});

TL.origin("analytic-philosophy", {
  note: "Russell, with G. E. Moore, is counted a founder of analytic philosophy. Russell wrote that around 1898 he and Moore “rebelled against both Kant and Hegel,” replacing idealism with pluralistic realism and modern logic building on Frege.",
  links: [
    { id: "german-idealism", how: "reaction", note: "Russell and Moore rebelled against Kant and Hegel in about 1898" },
  ],
  cites: [S16f("russell", "Bertrand Russell")],
});

TL.origin("liberalism", {
  note: "Liberalism has roots in English constitutional disputes such as Magna Carta (1215). Hobbes's Leviathan (1651) is called an instigator, though no liberal; Locke, who argued for limited government, natural rights and toleration, is its paradigmatic early thinker.",
  links: [
    { id: "rationalism-empiricism", how: "ideas", note: "Locke, the empiricist, wrote the Second Treatise and Letter on Toleration" },
  ],
  cites: [S16f("liberalism", "Liberalism"), S16f("locke", "John Locke")],
});

TL.origin("feminist-philosophy", {
  note: "Beauvoir's The Second Sex (1949), a founding text of feminist phenomenology, drew on existentialism, Husserl and Heidegger, and Hegel's idea of the Other. It became a catalyst for second-wave feminism; Beauvoir only declared herself a feminist in 1972.",
  links: [
    { id: "existentialism", how: "ideas", note: "Beauvoir's ethics of freedom developed within and against existentialism" },
    { id: "phenomenology", how: "ideas", note: "Beauvoir drew on Husserl, Heidegger and Merleau-Ponty" },
  ],
  cites: [S16f("beauvoir", "Simone de Beauvoir")],
});

TL.origin("ubuntu", {
  note: "Ubuntu is a Nguni-language form of an idea found across Bantu languages, said to reach back to proto-Bantu. It lived in oral tradition, appears in South African writing from the mid-19th century, and was described as African humanism from the 1970s.",
  links: [
    { id: "bantu-expansion", how: "peoples", note: "Concept tied to Bantu languages, said to reach back to proto-Bantu" },
  ],
  cites: [W16f("Ubuntu_(philosophy)", "Ubuntu (philosophy)"), { t: "Hunhu/Ubuntu in Traditional Southern African Thought | Internet Encyclopedia of Philosophy", u: "https://iep.utm.edu/hunhu-ubuntu-southern-african-thought/" }],
});

TL.origin("judaism", {
  note: "Judaism grew from Iron Age Israelite religion, which stood in the Canaanite world. After Assyria destroyed the Kingdom of Israel (c. 720 BCE) and Babylon conquered Judah (586/587 BCE), the return under Persia saw the Second Temple built; Rabbinic Judaism followed the Temple's fall in 70 CE.",
  links: [
    { id: "canaanites", how: "ideas", note: "Israelite religion branched out of Canaanite religion as Yahwism in Iron Age I" },
  ],
  cites: [W16f("Judaism", "Judaism"), W16f("Origins_of_Judaism", "Origins of Judaism"), { t: "Judaism | Definition, Origin, History, Beliefs, & Facts | Britannica", u: "https://www.britannica.com/topic/Judaism" }],
});

TL.origin("zoroastrianism", {
  note: "Zoroaster's reforms split the older Iranian gods into ahuras to revere and daevas to reject; the ahuras come from the prehistoric Indo-Iranian asura concept, which also appears in the Rig Veda. The faith is first recorded in the mid-6th century BCE; its date is debated.",
  links: [
    { id: "vedic", how: "ideas", note: "Shares Indo-Iranian roots: ahuras derive from the asuras of the Rig Veda" },
  ],
  cites: [W16f("Zoroastrianism", "Zoroastrianism"), { t: "Zoroastrianism | Definition, Beliefs, Founder, Holy Book, & Facts | Britannica", u: "https://www.britannica.com/topic/Zoroastrianism" }],
});

TL.origin("buddhism", {
  note: "The Buddha, born into the Śākya clan, was one of the śramaṇas, wandering ascetics of the Gangetic basin who were dissatisfied with Vedic ritual and sacrifice. Like them he rejected Vedic authority, though the Upaniṣads shared ideas such as rebirth and karma.",
  links: [
    { id: "vedic", how: "reaction", note: "Śramaṇas, the Buddha among them, rejected Vedic ritual and authority" },
  ],
  cites: [S16f("buddha", "Buddha")],
});

TL.origin("confucianism", {
  note: "Confucius (traditionally 551–479 BCE) lived as Zhou power was declining and regional states were becoming independent. He drew on Zhou ritual, music and the Odes, wanted to preserve the Zhou ritual system, and reinterpreted the Mandate of Heaven around virtue.",
  links: [
    { id: "zhou", how: "ideas", note: "Confucius inherited and sought to preserve Zhou ritual and the Mandate of Heaven" },
  ],
  cites: [S16f("confucius", "Confucius")],
});

TL.origin("islam", {
  note: "Islam began in Mecca around 610 CE, when Muhammad reported his first revelation. Muslims hold it renews a primordial faith revealed through Abraham, Moses and Jesus, and recognize the Torah, Psalms and Gospel as earlier revelations.",
  links: [
    { id: "judaism", how: "ideas", note: "Recognizes the Torah and the prophets Abraham and Moses as earlier revelation" },
    { id: "christianity", how: "ideas", note: "Recognizes Jesus and the Gospel (Injil) as earlier revelation" },
  ],
  cites: [W16f("Islam", "Islam"), { t: "Islam | Religion, Beliefs, Practices, & Facts | Britannica", u: "https://www.britannica.com/topic/Islam" }],
});
