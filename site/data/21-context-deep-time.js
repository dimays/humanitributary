// "Why it matters" context and cross-links for deep time: the cosmos, life and human origins (November 2026).
// TL.enrich(id, { why, connections: [{ id, note }], cites }): see SCHEMA.md, "Context: why it matters, and connections".

// ---- Cosmos ----

TL.enrich("universe", {
  why: "ESA's Planck satellite made the most detailed map yet of the cosmic microwave background, the relic radiation of the Big Bang, and its results gave “an excellent confirmation” of the standard model of cosmology, though some features, such as a cold spot larger than expected, do not fit it. Planck found that ordinary matter makes up just 4.9% of the Universe's mass and energy and dark matter 26.8%, the rest being dark energy. Astronomers date the Big Bang by running the observed expansion of the Universe backward.",
  connections: [
    { id: "cl-cmb", note: "Planck mapped this relic radiation of the Big Bang in unprecedented detail" },
  ],
  cites: [
    { t: "Planck reveals an almost perfect Universe — ESA", u: "https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_reveals_an_almost_perfect_Universe", k: "primary" },
    { t: "Age of the universe — Wikipedia", u: "https://en.wikipedia.org/wiki/Age_of_the_universe" },
  ],
});

TL.enrich("milky-way", {
  why: "Precise stellar ages from ESA's Gaia show that the Milky Way formed in two distinct phases: its thick disc began forming about 13 billion years ago, some 2 billion years earlier than expected, and a merger with the dwarf galaxy Gaia-Sausage-Enceladus later filled the halo with stars and spurred a burst of star formation. The thin disc that holds the Sun formed in the second phase; the Sun lies in a spiral arm called the Orion Spur.",
  connections: [
    { id: "solar-system", note: "The Sun formed in the galaxy's younger thin disc" },
  ],
  cites: [
    { t: "Gaia finds parts of the Milky Way much older than expected — ESA", u: "https://www.esa.int/Science_Exploration/Space_Science/Gaia/Gaia_finds_parts_of_the_Milky_Way_much_older_than_expected", k: "primary" },
    { t: "Sun: Facts — NASA Science", u: "https://science.nasa.gov/sun/facts/", k: "reference" },
  ],
});

TL.enrich("solar-system", {
  why: "The planets formed from the solar nebula, the cloud of gas and dust left over after the Sun formed: rocky planets grew in the inner disk, too warm for water and methane to condense, while beyond the frost line ice let giant planets grow massive enough to capture hydrogen and helium. The oldest meteorite inclusions, about 4,568 million years old, give one definition of the Solar System's age. Water, too volatile to be present when Earth formed, probably arrived later from colder outer regions; life, NASA notes, could not exist without the Sun's energy.",
  connections: [
    { id: "earth", note: "Earth formed as one of the rocky inner planets" },
  ],
  cites: [
    { t: "Formation and evolution of the Solar System — Wikipedia", u: "https://en.wikipedia.org/wiki/Formation_and_evolution_of_the_Solar_System" },
    { t: "Sun: Facts — NASA Science", u: "https://science.nasa.gov/sun/facts/", k: "reference" },
  ],
});

TL.enrich("earth", {
  why: "Earth is the only place known to be inhabited by living things and the only planet in the Solar System with liquid water on its surface. Its true age took long to establish: Lord Kelvin's 1862 estimates of roughly 20–400 million years seemed far too short to biologists, and in 1956 Clair Patterson's lead dating of meteorites gave 4.55 ± 0.07 billion years, very close to today's accepted age and the deep time that evolution requires.",
  connections: [
    { id: "life", note: "Earth is the only world where life is known to exist" },
    { id: "moon", note: "The Moon steadies Earth's wobble, making its climate less variable" },
  ],
  cites: [
    { t: "Earth: Facts — NASA Science", u: "https://science.nasa.gov/earth/facts/", k: "reference" },
    { t: "Age of Earth — Wikipedia", u: "https://en.wikipedia.org/wiki/Age_of_Earth" },
  ],
});

TL.enrich("moon", {
  why: "Rocks brought back by the Apollo astronauts settled how the Moon formed: their chemistry matched Earth rocks too precisely to be coincidence, and the older ideas that the Moon was captured or formed alongside Earth fell out of favor. The Moon still shapes Earth: NASA says it stabilizes the planet's wobble, which has made the climate less variable, and its tides keep lengthening the day as the Moon recedes about an inch and a half a year.",
  connections: [
    { id: "g7-apollo-11", note: "Apollo's lunar samples pointed to a giant-impact origin" },
    { id: "cl-moon-impact", note: "The collision thought to have created it" },
  ],
  cites: [
    { t: "How the Moon formed — NASA Science", u: "https://science.nasa.gov/moon/formation/", k: "reference" },
    { t: "Earth: Facts — NASA Science", u: "https://science.nasa.gov/earth/facts/", k: "reference" },
  ],
});

TL.enrich("cl-moon-impact", {
  why: "The giant impact became the leading explanation for the Moon after the Apollo missions: lunar rocks contain only small amounts of elements that vaporize when heated, as expected of material blasted out by a violent collision, and their resemblance to Earth rocks is too close to be chance. The collision gave Earth a large companion that, according to NASA, steadies the planet's wobble and so has made its climate less variable.",
  connections: [
    { id: "moon", note: "The Moon formed from the debris" },
    { id: "g7-apollo-11", note: "Apollo's rock samples supported the impact explanation" },
  ],
  cites: [
    { t: "How the Moon formed — NASA Science", u: "https://science.nasa.gov/moon/formation/", k: "reference" },
    { t: "Earth: Facts — NASA Science", u: "https://science.nasa.gov/earth/facts/", k: "reference" },
  ],
});

// ---- Life ----

TL.enrich("life", {
  why: "Prokaryotes are among the earliest known life forms on Earth, and stromatolites, layered structures built by microbes, are a major part of the fossil record of the first life; modern examples still grow at Shark Bay, Australia. Cyanobacteria are thought to be largely responsible for raising the oxygen in Earth's early atmosphere. Prokaryotes still live nearly everywhere on Earth and play a crucial part in its carbon, nitrogen, phosphorus and oxygen cycles.",
  connections: [
    { id: "cl-great-oxidation", note: "Cyanobacteria began oxygenating the atmosphere" },
    { id: "eukaryotes", note: "Mitochondria in eukaryotic cells descend from engulfed bacteria" },
  ],
  cites: [
    { t: "Prokaryote — Wikipedia", u: "https://en.wikipedia.org/wiki/Prokaryote" },
    { t: "Stromatolite — Wikipedia", u: "https://en.wikipedia.org/wiki/Stromatolite" },
  ],
});

TL.enrich("cl-great-oxidation", {
  why: "Free oxygen was toxic to the then mostly anaerobic biosphere and may have wiped out many early organisms, hence one of the event's other names, the “Oxygen Catastrophe.” Yet oxygen greatly increased the free energy available to living things, and it made possible an ozone layer shielding life from ultraviolet radiation, though a 2025 study argues a stable shield came only about half a billion years ago. One proposal holds that symbiosis with aerobic bacteria led to the rise of eukaryotes and later multicellular life; some authors doubt the event drove wide eukaryotic diversification.",
  connections: [
    { id: "eukaryotes", note: "Rising oxygen is one proposed cause of the first eukaryotes" },
    { id: "land-plants", note: "Oxygen made an ozone shield possible; a stable one came much later" },
  ],
  cites: [
    { t: "Great Oxidation Event — Wikipedia", u: "https://en.wikipedia.org/wiki/Great_Oxidation_Event" },
    { t: "Earth's 'air war': Explaining the delayed rise of plants, animals on land — Yale News (2025)", u: "https://news.yale.edu/2025/01/06/earths-air-war-explaining-delayed-rise-plants-animals-land", k: "news" },
    { t: "Symbiogenesis — Wikipedia", u: "https://en.wikipedia.org/wiki/Symbiogenesis" },
  ],
});

TL.enrich("eukaryotes", {
  why: "Eukaryotic cells are products of symbiogenesis: mitochondria appear to derive from alphaproteobacteria, and chloroplasts arose when an early eukaryote took in a photosynthetic cyanobacterium; molecular evidence suggests a single origin for all plastids living today. The rise in oxygen around the Great Oxidation Event has been proposed as a contributing cause of the first eukaryotes, though the event may instead have been a consequence of them, and one proposal holds that symbiosis with aerobic bacteria led to the rise of eukaryotes and the later evolution of multicellular life.",
  connections: [
    { id: "cl-great-oxidation", note: "Rising oxygen is one proposed cause of the first eukaryotes" },
    { id: "land-plants", note: "Chloroplasts descend from a cyanobacterium taken in by an early eukaryote" },
  ],
  cites: [
    { t: "Symbiogenesis — Wikipedia", u: "https://en.wikipedia.org/wiki/Symbiogenesis" },
    { t: "Prokaryote — Wikipedia", u: "https://en.wikipedia.org/wiki/Prokaryote" },
    { t: "Great Oxidation Event — Wikipedia", u: "https://en.wikipedia.org/wiki/Great_Oxidation_Event" },
  ],
});

TL.enrich("fungi", {
  why: "Fungi are the major decomposers in most land and water ecosystems, breaking organic matter down into inorganic molecules that plants and other organisms can reuse. Fossils such as Ourasphaira giraldae suggest fungi may have grown on land a billion years ago, well before plants, and research suggests proto-mycorrhizal fungi were a key factor in plants' move onto land, perhaps serving as an early root system before roots evolved. Mycorrhizae are found today in 92% of the plant families studied.",
  connections: [
    { id: "land-plants", note: "Fungal partners may have been key to plants' move onto land" },
  ],
  cites: [
    { t: "Fungus — Wikipedia", u: "https://en.wikipedia.org/wiki/Fungus" },
    { t: "Mycorrhiza — Wikipedia", u: "https://en.wikipedia.org/wiki/Mycorrhiza" },
  ],
});

TL.enrich("animals", {
  why: "Animal origins may lie well before the Cambrian: possible sponge-grade animal fossils from South Australia's Trezona Formation predate the Marinoan glaciation, though other researchers argue they may be microbial. The Ediacaran biota that followed, large, mostly soft-bodied organisms of about 635–538.8 million years ago, is hard to classify, and it is not established that most were animals, but later forms such as Kimberella and Spriggina are almost universally accepted as bilaterians. They were succeeded by the more mobile animals of the Cambrian explosion.",
  connections: [
    { id: "cl-marinoan", note: "Possible sponge-like animal fossils predate this ice age" },
    { id: "cl-cambrian-explosion", note: "Animal diversity surged in the Cambrian that followed" },
  ],
  cites: [
    { t: "Possible animal-body fossils in pre-Marinoan limestones from South Australia — Nature Geoscience (2010), Princeton University", u: "https://collaborate.princeton.edu/en/publications/possible-animal-body-fossils-in-pre-marinoan-limestones-from-sout/", k: "paper" },
    { t: "Trezona Formation — Wikipedia", u: "https://en.wikipedia.org/wiki/Trezona_Formation" },
    { t: "Ediacaran biota — Wikipedia", u: "https://en.wikipedia.org/wiki/Ediacaran_biota" },
    { t: "Cambrian explosion — Wikipedia", u: "https://en.wikipedia.org/wiki/Cambrian_explosion" },
  ],
});

TL.enrich("cl-cambrian-explosion", {
  why: "Beginning about 538.8 million years ago, the Cambrian explosion was a major evolutionary radiation that produced a sudden diversification of complex life in the fossil record; the Great Ordovician Biodiversification Event is considered its follow-up, and some studies see the two as one long radiation. Proposed causes include rising oxygen, a sudden surge of calcium in the oceans, small changes in development governed by genes such as Hox genes, and coevolution among species. Some scientists question how sudden it was, as evidence of earlier animals accumulates.",
  connections: [
    { id: "cl-burgess-shale", note: "Its fossils record Cambrian animal life" },
    { id: "vertebrates", note: "The earliest known vertebrates date from the Cambrian" },
  ],
  cites: [
    { t: "Cambrian explosion — Wikipedia", u: "https://en.wikipedia.org/wiki/Cambrian_explosion" },
    { t: "Haikouichthys — Wikipedia", u: "https://en.wikipedia.org/wiki/Haikouichthys" },
  ],
});

TL.enrich("vertebrates", {
  why: "Vertebrates are defined by a vertebral column, which protects the spinal cord, and a cranium, which protects the brain. In jawed vertebrates the first pair of gill arches evolved into the jaws. Bony fishes include the lobe-finned fishes, whose paired fins had bones distinctly homologous to those of tetrapod limbs; tetrapod evolution began in the Devonian, about 400 million years ago, and the change from an aquatic fish to an air-breathing amphibian was a fundamental one. The earliest confirmed land-dwelling tetrapods come from the early Carboniferous.",
  connections: [
    { id: "cl-tiktaalik", note: "A stage between fish and land animals, with limb-like fins" },
  ],
  cites: [
    { t: "Vertebrate — Wikipedia", u: "https://en.wikipedia.org/wiki/Vertebrate" },
    { t: "Evolution of tetrapods — Wikipedia", u: "https://en.wikipedia.org/wiki/Evolution_of_tetrapods" },
  ],
});

TL.enrich("land-plants", {
  why: "Plants' move onto land changed the planet: a land-based flora increased the rate at which oxygen built up in the atmosphere, and deeper weathering by roots opened new habitats for fungi and animals. Drying out was a constant challenge, met in vascular plants by a waterproof cuticle and by stomata that control gas exchange, and partnerships with fungi may have helped early plants obtain water and minerals. Carbon dioxide fell by around 90% during the Devonian, a drop linked to the spread of leaves and stomata.",
  connections: [
    { id: "fungi", note: "Fungal partnerships helped early plants live on land" },
    { id: "cl-late-devonian", note: "Some researchers link spreading plants to its anoxia and cooling" },
  ],
  cites: [
    { t: "Evolutionary history of plants — Wikipedia", u: "https://en.wikipedia.org/wiki/Evolutionary_history_of_plants" },
    { t: "Late Devonian extinction — Wikipedia", u: "https://en.wikipedia.org/wiki/Late_Devonian_extinction" },
  ],
});

TL.enrich("cl-end-ordovician", {
  why: "The first of the “big five” mass extinctions, it is often ranked second only to the end-Permian by the share of genera lost. Most complex life then lived in the sea; the Natural History Museum says plummeting temperatures and huge glaciers lowered sea levels, followed by rapid warming. Diversity recovered over the first 5 million years of the Silurian, when faunas became among the most cosmopolitan of the entire Phanerozoic eon.",
  connections: [
    { id: "cl-late-devonian", note: "The next of the five great mass extinctions" },
  ],
  cites: [
    { t: "Late Ordovician mass extinction — Wikipedia", u: "https://en.wikipedia.org/wiki/Late_Ordovician_mass_extinction" },
    { t: "What is mass extinction and are we facing a sixth one? — Natural History Museum", u: "https://www.nhm.ac.uk/discover/what-is-mass-extinction-and-are-we-facing-a-sixth-one", k: "museum" },
  ],
});

TL.enrich("cl-late-devonian", {
  why: "The extinctions struck hardest at marine invertebrates and the calcite-based builders of the great Devonian reefs, and the reef collapse was so severe that reefs did not regain their Middle Devonian extent until the Mesozoic. Most jawed vertebrates were less affected, and true tetrapods survived and diversified after the first pulse. One hypothesis blames the spread of land plants, whose weathering drew down CO2, causing widespread anoxia and a colder, drier climate.",
  connections: [
    { id: "land-plants", note: "The spread of land plants is one proposed cause" },
    { id: "cl-tiktaalik", note: "Tetrapodomorphs like Tiktaalik were beginning to evolve leg-like structures" },
  ],
  cites: [
    { t: "Late Devonian extinction — Wikipedia", u: "https://en.wikipedia.org/wiki/Late_Devonian_extinction" },
    { t: "What is mass extinction and are we facing a sixth one? — Natural History Museum", u: "https://www.nhm.ac.uk/discover/what-is-mass-extinction-and-are-we-facing-a-sixth-one", k: "museum" },
  ],
});

TL.enrich("cl-end-permian", {
  why: "The Natural History Museum calls this “Great Dying” Earth's largest and most devastating extinction; it was also the greatest known extinction of insects. Land vertebrates took 30 million years to recover fully, and the ecological structure of today's biosphere evolved from the surviving groups. On land, dinosaurs and mammals arose in the course of the Triassic that followed.",
  connections: [
    { id: "dinosaurs", note: "Dinosaurs arose in the Triassic, after the extinction" },
  ],
  cites: [
    { t: "Permian–Triassic extinction event — Wikipedia", u: "https://en.wikipedia.org/wiki/Permian%E2%80%93Triassic_extinction_event" },
    { t: "What is mass extinction and are we facing a sixth one? — Natural History Museum", u: "https://www.nhm.ac.uk/discover/what-is-mass-extinction-and-are-we-facing-a-sixth-one", k: "museum" },
  ],
});

TL.enrich("dinosaurs", {
  why: "After the end-Triassic extinction wiped out almost all the competing archosaurs, dinosaurs evolved into an incredible array of creatures, and the Natural History Museum says their reign lasted 180 million years until the asteroid impact 66 million years ago. After their fall, mammals evolved to fill the niches the dinosaurs had left vacant. Dinosaurs did not vanish entirely: as the museum's scientists put it, they survived as birds.",
  connections: [
    { id: "cl-end-triassic", note: "Wiped out rival archosaurs, leaving the land open to dinosaurs" },
    { id: "cl-chicxulub", note: "The impact that ended the non-bird dinosaurs' reign" },
    { id: "birds", note: "Birds are the dinosaurs that survived" },
  ],
  cites: [
    { t: "Where did dinosaurs come from? — Natural History Museum", u: "https://nhm.ac.uk/discover/where-did-dinosaurs-come-from.html", k: "museum" },
    { t: "How an asteroid ended the age of the dinosaurs — Natural History Museum", u: "https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html", k: "museum" },
    { t: "Cretaceous–Paleogene extinction event — Wikipedia", u: "https://en.wikipedia.org/wiki/Cretaceous%E2%80%93Paleogene_extinction_event" },
  ],
});

TL.enrich("mammals", {
  why: "Mammals arose alongside the dinosaurs: Brasilodon lived at the same time as some of the oldest dinosaurs, and mammals came through the end-Triassic extinction largely untouched. After the end-Cretaceous extinction mammals evolved to fill the niches the dinosaurs left vacant, though some research indicates they did not diversify explosively at the boundary, and the Natural History Museum notes that rhino-sized animals appeared only about 15 million years later. Mammals include the primates, and so humans.",
  connections: [
    { id: "cl-chicxulub", note: "The extinction that opened dinosaur niches to mammals" },
    { id: "primates", note: "Primates, including humans, are mammals" },
  ],
  cites: [
    { t: "Earliest known mammal is identified using fossil tooth records — Natural History Museum", u: "https://nhm.ac.uk/press-office/press-releases/earliest-known-mammal-is-identified-using-fossil-tooth-records.html", k: "museum" },
    { t: "Triassic–Jurassic extinction event — Wikipedia", u: "https://en.wikipedia.org/wiki/Triassic%E2%80%93Jurassic_extinction_event" },
    { t: "Cretaceous–Paleogene extinction event — Wikipedia", u: "https://en.wikipedia.org/wiki/Cretaceous%E2%80%93Paleogene_extinction_event" },
    { t: "How an asteroid ended the age of the dinosaurs — Natural History Museum", u: "https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html", k: "museum" },
    { t: "Primate — Wikipedia", u: "https://en.wikipedia.org/wiki/Primate" },
    { t: "Introduction to Human Evolution — Smithsonian Human Origins", u: "https://humanorigins.si.edu/education/introduction-human-evolution", k: "museum" },
  ],
});

TL.enrich("cl-end-triassic", {
  why: "Eruptions of the Central Atlantic Magmatic Province released vast amounts of carbon dioxide, causing profound global warming and ocean acidification. Crocodylomorphs, dinosaurs, pterosaurs and mammals were left largely untouched and became the dominant land animals for the next 135 million years, with dinosaurs radiating into niches the victims had vacated. In the oceans the extinction completed the shift to the “modern evolutionary fauna” that still dominates them.",
  connections: [
    { id: "dinosaurs", note: "Dinosaurs radiated into the niches the extinction emptied" },
    { id: "mammals", note: "Mammals were left largely untouched" },
  ],
  cites: [
    { t: "Triassic–Jurassic extinction event — Wikipedia", u: "https://en.wikipedia.org/wiki/Triassic%E2%80%93Jurassic_extinction_event" },
    { t: "What is mass extinction and are we facing a sixth one? — Natural History Museum", u: "https://www.nhm.ac.uk/discover/what-is-mass-extinction-and-are-we-facing-a-sixth-one", k: "museum" },
  ],
});

TL.enrich("birds", {
  why: "Birds evolved within the dinosaurs, and Natural History Museum scientists say there is no clear line between the two: many believe feathers evolved in non-avian dinosaurs long before the first birds. Aside from bats, birds are the only living vertebrates capable of powered flight. They came very close to extinction when the asteroid struck 66 million years ago; the survivors were small, ground-dwelling birds that could adapt quickly to the new, treeless habitats.",
  connections: [
    { id: "dinosaurs", note: "Birds evolved within the dinosaurs" },
    { id: "cl-chicxulub", note: "Only some bird lineages, ancestors of modern birds, survived it" },
  ],
  cites: [
    { t: "What were the first birds like? — Natural History Museum", u: "https://www.nhm.ac.uk/discover/what-were-the-first-birds-like.html", k: "museum" },
    { t: "How an asteroid ended the age of the dinosaurs — Natural History Museum", u: "https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html", k: "museum" },
  ],
});

TL.enrich("flowering-plants", {
  why: "With about 300,000 known species, flowering plants are the dominant land plants in every habitat except frigid tundra and coniferous forest, a success largely attributed to coevolution with animal pollinators such as insects, birds and bats, which flowers attract by color, scent and nectar. Plants fared better than animals in the end-Cretaceous extinction, as seeds and pollen can survive harsh periods, and afterward flowering plants dominated. Rice, maize and wheat, all flowering plants, provide half the world's staple calorie intake.",
  connections: [
    { id: "cl-chicxulub", note: "Flowering plants dominated Earth after the extinction" },
    { id: "ho-rice-domestication", note: "Rice, like other cereals, is a flowering plant" },
    { id: "ho-maize", note: "Maize is one of the flowering plants that supply staple calories" },
  ],
  cites: [
    { t: "Flowering plant — Wikipedia", u: "https://en.wikipedia.org/wiki/Flowering_plant" },
    { t: "How an asteroid ended the age of the dinosaurs — Natural History Museum", u: "https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html", k: "museum" },
  ],
});

TL.enrich("cl-chicxulub", {
  why: "In 1980 Luis and Walter Alvarez proposed that an iridium-rich clay layer marked a large asteroid impact; controversial at first, it is now the most widely accepted explanation, and the impact left a crater about 150 kilometers across. Loss of plant life collapsed food chains, and most land animals weighing more than about 25 kg died out, apart from some ectothermic species such as sea turtles and crocodilians. Afterward flowering plants dominated and mammals evolved to fill the niches the dinosaurs left vacant.",
  connections: [
    { id: "mammals", note: "Mammals evolved to fill the niches the dinosaurs left vacant" },
    { id: "birds", note: "The lineages leading to modern birds survived" },
    { id: "flowering-plants", note: "Flowering plants dominated Earth afterward" },
  ],
  cites: [
    { t: "How an asteroid ended the age of the dinosaurs — Natural History Museum", u: "https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html", k: "museum" },
    { t: "Cretaceous–Paleogene extinction event — Wikipedia", u: "https://en.wikipedia.org/wiki/Cretaceous%E2%80%93Paleogene_extinction_event" },
  ],
});

TL.enrich("primates", {
  why: "Humans are primates, an order of mammals whose traits are adaptations to life in the treetops: a grip that is a relic of gripping branches, forward-facing eyes and a visually dominant sensory system, large brains for their body size and a trend toward a reduced snout. Fossils from Tanzania show that apes and Old World monkeys had split by about 25 million years ago, and the Smithsonian says humans and the African great apes shared a common ancestor that lived between 8 and 6 million years ago.",
  connections: [
    { id: "cl-ape-monkey-split", note: "Apes and Old World monkeys had split by c. 25 million years ago" },
    { id: "hominins", note: "Humans and African apes shared an ancestor 8–6 million years ago" },
  ],
  cites: [
    { t: "Primate — Wikipedia", u: "https://en.wikipedia.org/wiki/Primate" },
    { t: "Rukwapithecus — Wikipedia", u: "https://en.wikipedia.org/wiki/Rukwapithecus" },
    { t: "Introduction to Human Evolution — Smithsonian Human Origins", u: "https://humanorigins.si.edu/education/introduction-human-evolution", k: "museum" },
  ],
});

// ---- Human origins ----

TL.enrich("hominins", {
  why: "The Smithsonian describes human evolution as a process of some six million years by which people originated from apelike ancestors. Bipedalism was one of the earliest defining human traits, evolving over 4 million years ago; large brains, toolmaking and language came later. Scientists recognize some 15 to 20 species of early humans but disagree on how they are related, and most left no living descendants. Sahelanthropus, from Chad, showed that the earliest humans lived beyond East Africa's Rift Valley and South Africa.",
  connections: [
    { id: "ho-sahelanthropus", note: "Its fossils show early hominins ranged into West-Central Africa" },
    { id: "ho-ardi", note: "Ardi's pelvis suggests she could walk on two legs" },
  ],
  cites: [
    { t: "Introduction to Human Evolution — Smithsonian Human Origins", u: "https://humanorigins.si.edu/education/introduction-human-evolution", k: "museum" },
    { t: "Sahelanthropus tchadensis — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/sahelanthropus-tchadensis", k: "museum" },
    { t: "Ardipithecus ramidus — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/ardipithecus-ramidus", k: "museum" },
  ],
});

TL.enrich("ho-lucy", {
  why: "Lucy's species is one of the longest-lived and best-known early humans: remains of more than 300 individuals are known, and it survived for more than 900,000 years, about three times as long as our own species so far. It combined apelike face proportions, a small brain and long arms for climbing with a body that regularly walked upright; the Smithsonian says this mix of tree and ground adaptations helped it survive as climates changed, and that the species may be ancestral to later Paranthropus, Australopithecus and Homo.",
  connections: [
    { id: "ho-laetoli", note: "A key site of the species, with the oldest known bipedal footprint trails" },
    { id: "early-homo", note: "Lucy's species may be ancestral to the genus Homo" },
  ],
  cites: [
    { t: "Australopithecus afarensis — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/australopithecus-afarensis", k: "museum" },
  ],
});

TL.enrich("early-homo", {
  why: "Louis Leakey, Philip Tobias and John Napier named H. habilis, “handy man,” in 1964 because they suspected it made the stone tools found at Olduvai Gorge; naming it meant redefining the genus Homo, including lowering its brain-size limit, which set off a long debate. Cut-marked bones from 2.6 million years ago, direct evidence of eating meat and marrow, are usually associated with early Homo. H. habilis was long seen as the ancestor of H. erectus, but finds at Ileret, Kenya, show the two coexisted for almost half a million years.",
  connections: [
    { id: "ho-early-toolmaking", note: "Many scientists credit early Homo with the first stone tools" },
    { id: "homo-erectus", note: "Coexisted with H. habilis in eastern Africa for almost 500,000 years" },
  ],
  cites: [
    { t: "Homo habilis — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-habilis", k: "museum" },
  ],
});

TL.enrich("ho-early-toolmaking", {
  why: "Because stone survives better than bone, stone tools are typically the best evidence of where and when early humans lived and how far they spread. The first Oldowan toolkits held hammerstones, stone cores and sharp flakes; cut-marked bones of the same age show early humans butchering large animals for meat and marrow. By about 1.76 million years ago early humans were making Acheulean handaxes, and by 200,000 years ago the pace of innovation began to accelerate.",
  connections: [
    { id: "ho-acheulean", note: "Handaxes and other large cutting tools followed by 1.76 million years ago" },
    { id: "early-homo", note: "Butchery marks of this age are usually linked to early Homo" },
  ],
  cites: [
    { t: "Stone Tools — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/behavior/stone-tools", k: "museum" },
    { t: "Homo habilis — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-habilis", k: "museum" },
  ],
});

TL.enrich("homo-erectus", {
  why: "Early African H. erectus is the oldest known human with modern humanlike body proportions: long legs and shorter arms suited to life on the ground and to walking, and possibly running, long distances. It was possibly the longest-lived human species, about nine times as long as ours so far. Soon after it appeared came Acheulean handaxes, and the earliest evidence of hearths falls in its time range. The Smithsonian says its populations likely led to H. heidelbergensis and ultimately to H. sapiens.",
  connections: [
    { id: "ho-acheulean", note: "The first major innovation in stone tools followed soon after it appeared" },
    { id: "ho-turkana-boy", note: "The most complete known skeleton of the species" },
    { id: "ho-dmanisi", note: "Among the first humans known outside Africa" },
  ],
  cites: [
    { t: "Homo erectus — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-erectus", k: "museum" },
  ],
});

TL.enrich("ho-dmanisi", {
  why: "The Smithsonian dates the first migrations of early humans out of Africa into Asia to probably between 2 and 1.8 million years ago, with Europe reached later. The fifth Dmanisi skull combines a braincase about half the size of a modern human's with a very large face; Christoph Zollikofer argues that such variation means all Homo fossils of about 1.8–1.5 million years ago, including African fossils assigned to H. habilis, H. rudolfensis and H. ergaster, belong to H. erectus.",
  connections: [
    { id: "early-homo", note: "Some argue African H. habilis fossils of this age are H. erectus" },
    { id: "homo-floresiensis", note: "The “Hobbit” may descend from small early humans like Dmanisi's" },
  ],
  cites: [
    { t: "Homo erectus Stands Alone — Archaeology Magazine (2014)", u: "https://archaeology.org/issues/january-february-2014/digs-discoveries/dmanisi-georgia-hominin-homo-erectus-skulls/", k: "news" },
    { t: "Introduction to Human Evolution — Smithsonian Human Origins", u: "https://humanorigins.si.edu/education/introduction-human-evolution", k: "museum" },
    { t: "Homo floresiensis — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-floresiensis", k: "museum" },
  ],
});

TL.enrich("homo-heidelbergensis", {
  why: "The Smithsonian calls H. heidelbergensis the first early human species to live in colder climates, its short, wide body conserving heat. It lived at the time of the oldest definite control of fire and use of wooden spears, and was the first to routinely hunt large animals and build simple shelters of wood and rock. Comparisons of Neanderthal and modern human DNA suggest the two lineages diverged from a common ancestor, most likely H. heidelbergensis, 350,000–400,000 years ago.",
  connections: [
    { id: "ho-gesher-benot-fire", note: "Hearths there by 790,000 years ago are credited to this species" },
    { id: "neanderthals", note: "Its European branch likely led to the Neanderthals" },
    { id: "homo-sapiens", note: "Its African branch likely led to our own species" },
  ],
  cites: [
    { t: "Homo heidelbergensis — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-heidelbergensis", k: "museum" },
  ],
});

TL.enrich("neanderthals", {
  why: "Found in 1856, Neanderthal 1 was the first fossil recognized as an early human, and in 1864 Neanderthals became the first fossil hominin species to be named. Our closest extinct relatives had brains as large as ours, made sophisticated tools, controlled fire and made clothing; the Smithsonian says no earlier human species had buried its dead. They shared western Asia with modern humans for 30,000–50,000 years and interbred with them, yet genetic evidence shows they remained a distinct branch.",
  connections: [
    { id: "ho-neanderthal-admixture", note: "Interbreeding left 1–2% Neanderthal DNA in non-Africans today" },
    { id: "ho-sima-de-los-huesos", note: "Early Neanderthal-lineage fossils, about 430,000 years old" },
  ],
  cites: [
    { t: "Homo neanderthalensis — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-neanderthalensis", k: "museum" },
    { t: "Oldest known Homo sapiens fossils discovered in Morocco — Natural History Museum (2017)", u: "https://www.nhm.ac.uk/discover/news/2017/june/oldest-known-homo-sapiens-fossils-discovered-in-morocco.html", k: "museum" },
    { t: "A new timeline for Neanderthal interbreeding with modern humans — UC Berkeley News (2024)", u: "https://news.berkeley.edu/2024/12/12/a-new-timeline-for-neanderthal-interbreeding-with-modern-humans/", k: "news" },
  ],
});

TL.enrich("homo-naledi", {
  why: "More than 1,550 specimens from at least 15 individuals came from one chamber of Rising Star, the largest collection of a single hominin species found in Africa. Dated in 2017 to 335,000–236,000 years ago, it appears to have lived near the same time as early ancestors of modern humans, even though it kept Australopithecus-like features in the pelvis and shoulder. Its teeth differ from those of other Homo species of the time, suggesting it may have lived in a distinct environment.",
  connections: [
    { id: "homo-sapiens", note: "Lived near the same time as early ancestors of modern humans" },
  ],
  cites: [
    { t: "Homo naledi — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-naledi", k: "museum" },
  ],
});

TL.enrich("homo-sapiens", {
  why: "Our species evolved in Africa during a time of dramatic climate change, and the Smithsonian suggests big brains helped our ancestors survive as environments grew less predictable. The Jebel Irhoud finds, says the Natural History Museum's Chris Stringer, moved Morocco from a supposed backwater to a prominent place in our evolution. Within the past 12,000 years our species turned to farming and herding, which transformed Earth's landscapes first locally, then globally; villages became towns, and towns cities.",
  connections: [
    { id: "ho-out-of-africa", note: "Ancestors of today's non-Africans left Africa about 60,000 years ago" },
    { id: "ho-founder-crops", note: "Our species began producing food within the past 12,000 years" },
  ],
  cites: [
    { t: "Homo sapiens — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens", k: "museum" },
    { t: "Oldest known Homo sapiens fossils discovered in Morocco — Natural History Museum (2017)", u: "https://www.nhm.ac.uk/discover/news/2017/june/oldest-known-homo-sapiens-fossils-discovered-in-morocco.html", k: "museum" },
    { t: "Humans left Africa 40,000 years earlier than we thought — Natural History Museum (2018)", u: "https://www.nhm.ac.uk/discover/news/2018/january/humans-left-africa-40-000-years-earlier-than-we-thought.html", k: "museum" },
  ],
});

TL.enrich("denisovans", {
  why: "The Denisovans were the first ancient hominins revealed by genes alone; no specimen has yet been identified from its anatomy, though some unclassified Asian fossils may be Denisovan. Genetic studies suggest their homeland stretched from the Altai into eastern Asia, and the Baishiya jaw shows they lived 3,280 meters up on the Tibetan Plateau. Their DNA can be advantageous: Sherpas likely inherited from them an EPAS1 gene variant that helps people breathe at high altitude.",
  connections: [
    { id: "ho-denny", note: "A first-generation Neanderthal–Denisovan hybrid" },
    { id: "ho-denisovan-admixture", note: "Their genes passed to the ancestors of Melanesians and Australians" },
  ],
  cites: [
    { t: "The Denisovans — Australian Museum", u: "https://australian.museum/learn/science/human-evolution/the-denisovans/", k: "museum" },
  ],
});

TL.enrich("homo-floresiensis", {
  why: "H. floresiensis showed that a tiny human species lived on Flores as recently as about 60,000 years ago; its brain was about a third the size of ours, yet it made stone tools and hunted. Its small size may reflect island dwarfism, seen also in Flores's extinct pygmy elephants, though its ancestors may have been small already. Tools show humans reached Flores at least 1 million years ago across 9 km of treacherous sea. Most scientists now accept it as a distinct species, not a diseased modern human.",
  connections: [
    { id: "homo-erectus", note: "It may descend from an earlier island population of H. erectus" },
  ],
  cites: [
    { t: "Homo floresiensis — Smithsonian Human Origins", u: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-floresiensis", k: "museum" },
  ],
});

TL.enrich("first-americans", {
  why: "The White Sands footprints pushed back the known date of people in North America by thousands of years and imply that early inhabitants and megafauna coexisted for several millennia before the extinctions at the end of the Pleistocene. Critics questioned radiocarbon dates from aquatic plant seeds; the 2023 follow-up dated terrestrial pollen and quartz from the same layers, and the USGS says three independent lines of evidence make the 21,000–23,000-year age highly unlikely to be wrong.",
  connections: [
    { id: "ho-last-glacial-maximum", note: "The footprints were made during the Last Glacial Maximum" },
    { id: "px-megafauna-extinctions", note: "People and megafauna coexisted for millennia before these losses" },
  ],
  cites: [
    { t: "Study confirms age of oldest fossil human footprints in North America — USGS (2023)", u: "https://www.usgs.gov/news/national-news-release/study-confirms-age-oldest-fossil-human-footprints-north-america", k: "news" },
  ],
});

TL.enrich("first-australians", {
  why: "Hand stencils in Sulawesi at least 67,800 years old, reported in Nature in 2026, strongly support a northern route to Sahul, the ancient continent joining Australia and New Guinea, and strengthen the case for early sea voyages through Wallacea. At Madjedbebe, more than 100,000 artifacts, including ground stone axe heads, grinding stones and ground ochre, record people using seeds, tubers and pandanus nuts. The site's dates remain disputed; a 2020 study suggested termites disturbed its layers.",
  connections: [
    { id: "ho-sulawesi-stencil", note: "Supports a northern migration route to Sahul through Sulawesi" },
    { id: "ho-out-of-africa", note: "People reached Australia probably within the past 60,000 years" },
  ],
  cites: [
    { t: "Nature press release on Sulawesi hand stencils (2026) — Nature Asia", u: "https://www.natureasia.com/en/info/press-releases/detail/9213", k: "news" },
    { t: "Madjedbebe — Wikipedia", u: "https://en.wikipedia.org/wiki/Madjedbebe" },
    { t: "Introduction to Human Evolution — Smithsonian Human Origins", u: "https://humanorigins.si.edu/education/introduction-human-evolution", k: "museum" },
  ],
});

TL.enrich("ho-out-of-africa", {
  why: "Fossils such as the 177,000–194,000-year-old Misliya jaw show that some Homo sapiens left Africa much earlier, but the Natural History Museum says those waves were largely unsuccessful compared with the one around 60,000 years ago; their lines died out or were overprinted and contributed little or nothing to living people's genes. Dating Neanderthal gene flow, which most non-Africans carry, helps pin down when this migration happened and how people settled the regions beyond Africa.",
  connections: [
    { id: "ho-misliya", note: "An earlier, largely unsuccessful wave out of Africa" },
    { id: "ho-neanderthal-admixture", note: "Its timing helps date when modern humans left Africa" },
    { id: "first-australians", note: "People reached Australia probably within the past 60,000 years" },
  ],
  cites: [
    { t: "Humans left Africa 40,000 years earlier than we thought — Natural History Museum (2018)", u: "https://www.nhm.ac.uk/discover/news/2018/january/humans-left-africa-40-000-years-earlier-than-we-thought.html", k: "museum" },
    { t: "A new timeline for Neanderthal interbreeding with modern humans — UC Berkeley News (2024)", u: "https://news.berkeley.edu/2024/12/12/a-new-timeline-for-neanderthal-interbreeding-with-modern-humans/", k: "news" },
    { t: "Introduction to Human Evolution — Smithsonian Human Origins", u: "https://humanorigins.si.edu/education/introduction-human-evolution", k: "museum" },
  ],
});

TL.enrich("ho-neanderthal-admixture", {
  why: "Neanderthal genes still shape human biology: the most common inherited variants relate to immune function, skin pigmentation and metabolism, and some immune and skin variants grew more frequent over time, implying they helped survival. Other stretches of the genome, “Neanderthal deserts,” were purged quickly, suggesting some variants were lethal to modern humans. The long period of mixing may explain why East Asians carry about 20% more Neanderthal genes than Europeans.",
  connections: [
    { id: "neanderthals", note: "The archaic humans whose DNA most non-Africans still carry" },
    { id: "covid-19", note: "One Neanderthal immune variant protects against the COVID-19 virus" },
  ],
  cites: [
    { t: "A new timeline for Neanderthal interbreeding with modern humans — UC Berkeley News (2024)", u: "https://news.berkeley.edu/2024/12/12/a-new-timeline-for-neanderthal-interbreeding-with-modern-humans/", k: "news" },
  ],
});

TL.enrich("px-dog-domestication", {
  why: "Dogs were the first species humans successfully domesticated. Ancient genomes show they had already split into five lineages before about 11,000 years ago, pointing to a long Paleolithic prehistory, and suggest a single domestication followed by dispersal with humans; wolves left little trace afterward, perhaps, one researcher speculates, because people selected against wolf hybrids. Dogs' history sometimes tracked people's: the first farmers who moved from the Levant into Europe and Africa brought dogs that interbred with local hunter-gatherers' dogs.",
  connections: [
    { id: "neolithic-europe", note: "Farmers from the Levant brought their dogs into Europe" },
    { id: "natufian", note: "A Natufian at Ain Mallaha was buried with a puppy c. 12,000 BCE" },
  ],
  cites: [
    { t: "The prehistory of modern dogs — LMU Munich", u: "https://www.lmu.de/en/newsroom/news-overview/news/the-prehistory-of-modern-dogs-9392de64.html", k: "news" },
    { t: "Natufian culture — Wikipedia", u: "https://en.wikipedia.org/wiki/Natufian_culture" },
  ],
});

TL.enrich("jomon", {
  why: "The Jōmon show that settled life did not require farming: people in northern Japan began a sedentary way of life using pottery about 15,000 years ago and lived by hunting, fishing and gathering for the next 10,000 years, adapting to climate warming and cooling. Pottery let them boil and store food, which the official site says stabilized their diet, and early on they built graves, earthen mounds and stone circles for ritual. Seventeen sites were inscribed on the UNESCO World Heritage List on July 27, 2021.",
  connections: [
    { id: "ho-odai-yamamoto", note: "One of the 17 World Heritage Jōmon sites" },
    { id: "ho-sannai-maruyama", note: "One of the 17 World Heritage Jōmon sites" },
  ],
  cites: [
    { t: "Jomon Prehistoric Sites in Northern Japan — official site", u: "https://jomon-japan.jp/en/learn/jomon-prehistoric-sites-in-northern-japan", k: "archive" },
    { t: "Jomon Culture — Jomon Prehistoric Sites in Northern Japan (official site)", u: "https://jomon-japan.jp/en/learn/jomon-culture", k: "archive" },
  ],
});

TL.enrich("natufian", {
  why: "The Natufians supported a sedentary or semi-sedentary population before farming, which puts them at the center of debates over how agriculture began. At Shubayqa 1, hunter-gatherers ground wild ancestors of barley, einkorn and oat into flatbread 14,400 years ago, at least 4,000 years before farming, and the excavators suggest bread from wild cereals may have encouraged people to cultivate them. Another, controversial theory holds that Younger Dryas drought threatened the wild cereals they relied on and pushed them to plant seeds.",
  connections: [
    { id: "ho-shubayqa-bread", note: "Natufian hunter-gatherers baked bread from wild cereals here" },
    { id: "px-younger-dryas", note: "Its drought may have pushed Natufians toward farming (debated)" },
    { id: "ho-founder-crops", note: "Bread from wild cereals may have encouraged their cultivation" },
  ],
  cites: [
    { t: "Archaeologists discover bread that predates agriculture by 4,000 years — University of Copenhagen (2018)", u: "https://humanities.ku.dk/news/2018/archaeologists-discover-bread-that-predates-agriculture-by-4000-years", k: "news" },
    { t: "Natufian culture — Wikipedia", u: "https://en.wikipedia.org/wiki/Natufian_culture" },
  ],
});

TL.enrich("fertile-crescent-neolithic", {
  why: "The Fertile Crescent is believed to be the first region where settled farming emerged, and it was home to the eight Neolithic founder crops, among them emmer and einkorn wheat, barley and lentils. Farming's demands encouraged a division of labor that gradually led to specialized workers, and its developments provided the basis for centralized administrations and political structures, writing and denser settlements. At Jericho a stone tower built around 8000 BCE took an estimated 11,000 working days; one researcher argues it helped draw people into a communal way of life.",
  connections: [
    { id: "ho-catalhoyuk", note: "A large Neolithic proto-city in Anatolia, occupied c. 7500–5600 BCE" },
    { id: "ho-jericho-tower", note: "One of the world's oldest stone buildings, built c. 8000 BCE" },
  ],
  cites: [
    { t: "Fertile Crescent — Wikipedia", u: "https://en.wikipedia.org/wiki/Fertile_Crescent" },
    { t: "Neolithic Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Neolithic_Revolution" },
    { t: "Tower of Jericho — Wikipedia", u: "https://en.wikipedia.org/wiki/Tower_of_Jericho" },
    { t: "Çatalhöyük — Wikipedia", u: "https://en.wikipedia.org/wiki/%C3%87atalh%C3%B6y%C3%BCk" },
  ],
});

TL.enrich("ho-gobekli-tepe", {
  why: "Göbekli Tepe's earliest exposed structures were built between 9500 and 9000 BCE, and the monumental complex shows no clear evidence of agricultural cultivation, which has placed it at the center of debates over whether farming caused people to settle down or settling down led them to farm. Excavator Klaus Schmidt saw it as a ritual center, but domestic buildings and water systems reported since 2019 have forced a revision of that “temple” narrative. Its hunter-gatherer inhabitants ate cereals, though whether these were wild or cultivated is unclear.",
  connections: [
    { id: "ho-founder-crops", note: "Built with no clear evidence of crop cultivation at the site" },
  ],
  cites: [
    { t: "Göbekli Tepe — Wikipedia", u: "https://en.wikipedia.org/wiki/G%C3%B6bekli_Tepe" },
  ],
});

TL.enrich("ho-founder-crops", {
  why: "Domestication happened in separate places worldwide, beginning about 11,700 years ago, and the Fertile Crescent was home to the eight Neolithic founder crops. Food surpluses made possible a social elite not engaged in farming, and one scholar argues agriculture brought deep social divisions; it also narrowed the diversity of foods, lowering nutritional quality, and diseases jumped from animals to people. Domestication changed the crops themselves: the founder crops became larger, and selection favored seeds that stayed on the plant until harvest.",
  connections: [
    { id: "neolithic-europe", note: "Farming took about 2,500 years to spread from the Aegean to Britain" },
    { id: "ho-rice-domestication", note: "Rice farming in East Asia began at about the same time" },
    { id: "ho-maize", note: "Maize, another cereal, was domesticated by about 8,700 years ago" },
  ],
  cites: [
    { t: "Neolithic Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Neolithic_Revolution" },
    { t: "Fertile Crescent — Wikipedia", u: "https://en.wikipedia.org/wiki/Fertile_Crescent" },
    { t: "Rice domestication in the Lower Yangtze — Chinese Academy of Sciences (May 2024)", u: "https://english.cas.cn/newsroom/news--archives/2024/research-news/202405/t20240524_1129484.shtml", k: "news" },
    { t: "News release on maize domestication in the Balsas Valley — University of Exeter (2009)", u: "https://news-archive.exeter.ac.uk/2009/march/title_3798_en.html", k: "news" },
  ],
});

TL.enrich("neolithic-china", {
  why: "China was one of the separate places where domestication arose: northern China was the domestication center for foxtail millet, and rice was domesticated farther south, along with paddy cultivation. The Chinese Academy of Sciences dates the origin of rice agriculture in East Asia to about 11,000 years ago, synchronous with wheat farming in Southwest Asia, and says rice, a staple for half the world's population today, has had a profound impact on the formation and development of Chinese civilization.",
  connections: [
    { id: "ho-rice-domestication", note: "Rice was domesticated in the Lower Yangtze" },
    { id: "fertile-crescent-neolithic", note: "Farming arose independently here and in the Near East" },
  ],
  cites: [
    { t: "Neolithic Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Neolithic_Revolution" },
    { t: "Rice domestication in the Lower Yangtze — Chinese Academy of Sciences (May 2024)", u: "https://english.cas.cn/newsroom/news--archives/2024/research-news/202405/t20240524_1129484.shtml", k: "news" },
  ],
});

TL.enrich("ho-rice-domestication", {
  why: "Rice is now the staple food of half the world's population. The Chinese Academy of Sciences study traces a long path: people began using wild rice about 24,000 years ago as the Last Glacial Maximum set in, began pre-domesticating it about 13,000 years ago, and domesticated forms rose rapidly about 11,000 years ago, synchronous with wheat farming in Southwest Asia. Dartmouth researchers explain how harvesting with tools selected for seeds that stay on the plant, gradually producing domesticated rice.",
  connections: [
    { id: "ho-founder-crops", note: "Rice and Southwest Asian wheat farming began at about the same time" },
    { id: "ho-last-glacial-maximum", note: "People began using wild rice as the glacial maximum set in" },
  ],
  cites: [
    { t: "Rice domestication in the Lower Yangtze — Chinese Academy of Sciences (May 2024)", u: "https://english.cas.cn/newsroom/news--archives/2024/research-news/202405/t20240524_1129484.shtml", k: "news" },
    { t: "Ancient tools provide earliest evidence of rice harvesting — Dartmouth Anthropology (2022)", u: "https://anthropology.dartmouth.edu/news/2022/12/ancient-tools-provide-earliest-evidence-rice-harvesting", k: "news" },
  ],
});

TL.enrich("neolithic-europe", {
  why: "Farming came to Europe from outside: Neolithic material culture arrived via western Anatolia, sites across the continent hold crops such as einkorn, emmer and barley that were domesticated in the Middle East, and the spread from the Aegean to Britain took about 2,500 years. The migrants brought more than crops; ancient genomes show that the first farmers from the Levant arrived with dogs that interbred with those of local hunter-gatherers. The mass grave at Talheim, Germany, is one of the earliest known sites showing organized violence in Neolithic Europe, among Linear Pottery groups.",
  connections: [
    { id: "ho-founder-crops", note: "Wheat farming spread from the Fertile Crescent into Europe" },
    { id: "px-dog-domestication", note: "Incoming farmers' dogs mixed with hunter-gatherers' dogs" },
    { id: "ho-linear-pottery", note: "Talheim's mass grave records violence among Linear Pottery groups" },
  ],
  cites: [
    { t: "Neolithic Europe — Wikipedia", u: "https://en.wikipedia.org/wiki/Neolithic_Europe" },
    { t: "Neolithic Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Neolithic_Revolution" },
    { t: "The prehistory of modern dogs — LMU Munich", u: "https://www.lmu.de/en/newsroom/news-overview/news/the-prehistory-of-modern-dogs-9392de64.html", k: "news" },
  ],
});

TL.enrich("mehrgarh", {
  why: "Mehrgarh is probably the earliest known center of agriculture in South Asia: its first settlement, a small farming village dated to 7000 BCE or, by newer radiocarbon dates, 5250 BCE, grew six-row barley and einkorn and emmer wheat and herded sheep, goats and cattle. Its wheat is thought to be of Near Eastern origin, but there is good evidence that barley and zebu cattle were domesticated locally. Ornaments of shell, turquoise, sandstone and lapis lazuli from as far away as Badakhshan point to long-distance trade, and Asko Parpola argues the culture became the Indus Valley Civilization.",
  connections: [
    { id: "ho-founder-crops", note: "Its wheat is thought to be of Near Eastern origin" },
  ],
  cites: [
    { t: "Mehrgarh — Wikipedia", u: "https://en.wikipedia.org/wiki/Mehrgarh" },
    { t: "Neolithic Revolution — Wikipedia", u: "https://en.wikipedia.org/wiki/Neolithic_Revolution" },
    { t: "Çatalhöyük — Wikipedia", u: "https://en.wikipedia.org/wiki/%C3%87atalh%C3%B6y%C3%BCk" },
  ],
});

TL.enrich("ho-maize", {
  why: "Maize is arguably the most important crop of the Americas, and the Balsas Valley finds were the first to document its domestication in its cradle of origin, in tropical forest. From there it spread to Panama by about 7,600 years ago and was well established in northern South America by about 6,000 years ago.",
  connections: [
    { id: "ho-founder-crops", note: "Maize, another cereal, was domesticated by about 8,700 years ago" },
  ],
  cites: [
    { t: "News release on maize domestication in the Balsas Valley — University of Exeter (2009)", u: "https://news-archive.exeter.ac.uk/2009/march/title_3798_en.html", k: "news" },
  ],
});

TL.enrich("sumer", {
  why: "The first true city-states arose in Sumer, roughly at the same time as similar ones in present-day Syria and Lebanon; Uruk, one of the largest, may have had 50,000–80,000 people at its height. Sumerian farming depended heavily on canal irrigation and the plow, evidence of wheeled vehicles appears by the mid-4th millennium BCE, and the base-60 system became the standard number system of Sumer and Babylonia. The earliest known texts come from Uruk and Jemdet Nasr; Sumerian survived as a sacred, literary and scientific language until the 1st century CE, and full libraries of clay tablets have been found.",
  connections: [
    { id: "an-proto-cuneiform", note: "The earliest known texts come from Uruk and Jemdet Nasr in Sumer" },
    { id: "px-wheeled-vehicles", note: "Evidence of wheeled vehicles appears here by the mid-4th millennium BCE" },
    { id: "an-gilgamesh", note: "The Epic of Gilgamesh is thought to be the earliest surviving fiction" },
  ],
  cites: [
    { t: "Sumer — Wikipedia", u: "https://en.wikipedia.org/wiki/Sumer" },
  ],
});

TL.enrich("bantu-expansion", {
  why: "The expansion reshaped the human map of Africa: from a nucleus in West-Central Africa, Proto-Bantu speakers spread across Central, Eastern and Southern Africa. Research indicates copious cultural and physical contact with the hunter-gatherers they met, and intermarriage was common, though oral traditions suggest conflict sometimes displaced people. Early models assumed iron use, but definitive evidence of it appears only around 400 BCE. An Institut Pasteur study found that mixing with local populations gave Bantu speakers genetic variants that helped them adapt, especially in immunity.",
  connections: [
    { id: "px-bantu-south-africa", note: "The expansion reached South Africa, probably as early as 300 CE" },
  ],
  cites: [
    { t: "Bantu expansion — Wikipedia", u: "https://en.wikipedia.org/wiki/Bantu_expansion" },
    { t: "Migration history of Bantu-speaking people: genomics reveals benefits of admixture — Institut Pasteur", u: "https://www.pasteur.fr/en/home/research-journal/press-documents/migration-history-bantu-speaking-people-genomics-reveals-benefits-admixture-and-sheds-new-light", k: "news" },
  ],
});
