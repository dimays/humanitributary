// Origins B (Africa and the Americas): where each branch came from, with two new colonial viceroyalties. Every cite was fetched and read while writing the entry; see SCHEMA.md.
const W = (slug, title) => ({ t: `${title} — Wikipedia`, u: `https://en.wikipedia.org/wiki/${slug}` });

TL.add({
  branches: [
    {
      id: "new-granada", name: "Viceroyalty of New Granada", region: "americas",
      start: 1717.4, end: 1819.6, startWhen: "May 27, 1717 (suspended 1723, re-established August 20, 1739)", endWhen: "August 7, 1819 (Bolívar's forces take New Granada after Boyacá)",
      parents: ["viceroyalty-peru"], into: ["gran-colombia"],
      text: "Spanish viceroyalty in northern South America, created because the governor of the New Kingdom of Granada depended on the Viceroy at Lima, far away. It fell to Bolívar's forces in 1819 and its lands joined Gran Colombia.",
      cites: [W("Viceroyalty_of_New_Granada", "Viceroyalty of New Granada"), W("Gran_Colombia", "Gran Colombia"), { t: "Viceroyalty of New Granada | Definition, History, Map, & Facts | Britannica", u: "https://www.britannica.com/place/Viceroyalty-of-New-Granada" }],
    },
    {
      id: "rio-de-la-plata", name: "Viceroyalty of the Río de la Plata", region: "americas",
      start: 1776.6, end: 1814.4, startWhen: "August 1, 1776 (formalized October 27, 1777)", endWhen: "1814 (de facto end with the fall of Montevideo; formally abolished 1825)",
      parents: ["viceroyalty-peru"], into: [],
      text: "Spanish viceroyalty with its capital at Buenos Aires, established in 1776 from former dependencies of the Viceroyalty of Peru. The May Revolution of 1810 ended viceregal rule there; it ended de facto in 1814.",
      cites: [W("Viceroyalty_of_the_R%C3%ADo_de_la_Plata", "Viceroyalty of the Río de la Plata"), W("Argentine_Declaration_of_Independence", "Argentine Declaration of Independence"), { t: "Viceroyalty of the Rio de la Plata | History, Revolution, Map, & Facts | Britannica", u: "https://www.britannica.com/place/Viceroyalty-of-the-Rio-de-la-Plata" }],
    },
  ],
});
TL.geo("new-granada", { scope: "region", lat: 4.65, lon: -74.05, r: 1400, label: "Viceroyalty of New Granada", src: "https://en.wikipedia.org/wiki/Viceroyalty_of_New_Granada" });
TL.geo("rio-de-la-plata", { scope: "region", lat: -34.67, lon: -58.4, r: 1600, label: "Viceroyalty of the Río de la Plata", src: "https://en.wikipedia.org/wiki/Viceroyalty_of_the_R%C3%ADo_de_la_Plata" });

TL.origin("bantu-expansion", {
  note: "Bantu speakers spread from a core area on the highlands between Cameroon and Nigeria (a linguistic core in northwestern Cameroon to southern Nigeria). Their own origin is debated; no earlier branch on the timeline is a clear source.",
  links: [],
  cites: [W("Bantu_expansion", "Bantu expansion"), { t: "Bantu languages | Definition, Characteristics, & Facts | Britannica", u: "https://www.britannica.com/art/Bantu-languages" }],
});
TL.origin("ashanti", {
  note: "Asante was an Akan state: Oyoko and Ekoona clans moved north from Adanse to escape Denkyira's control, and Osei Tutu founded the kingdom, which beat Denkyira at Feyiase in 1701. It was annexed to the Gold Coast colony on January 1, 1902.",
  links: [
    { id: "denkyira", how: "independence", note: "Kwaaman under Osei Tutu refused Denkyira tribute and beat it at Feyiase, 1701" },
  ],
  cites: [W("Ashanti_Empire", "Ashanti Empire"), W("Kingdom_of_Denkyira", "Kingdom of Denkyira"), { t: "Asante empire | African History, Culture, Map, & Legacy | Britannica", u: "https://www.britannica.com/place/Asante-empire" }],
});
TL.origin("chile", {
  note: "Spanish conquerors founded Santiago in 1541 and Chile became part of the Spanish Empire; a junta formed in 1810 in the name of the deposed king's heir, and Chile was proclaimed an independent republic on February 12, 1818.",
  links: [
    { id: "spain", how: "independence", note: "Proclaimed an independent republic from Spain on February 12, 1818" },
  ],
  cites: [W("Chile", "Chile"), { t: "Chile - Independence, Revolution, War | Britannica", u: "https://www.britannica.com/place/Chile/Struggle-for-independence" }],
});
TL.origin("tunisia", {
  note: "Tunisia was a nominally Ottoman province ruled by local Husainid beys from 1705. France made it a protectorate in 1881 (Treaty of Bardo), and it gained independence from France on March 20, 1956.",
  links: [
    { id: "france", how: "independence", note: "French protectorate since 1881; independent March 20, 1956" },
  ],
  cites: [W("Tunisia", "Tunisia"), { t: "Tunisia - Ancient, Roman, Arab | Britannica", u: "https://www.britannica.com/place/Tunisia/History" }],
});
TL.origin("kush", {
  note: "Nubia, home to the earlier Kerma culture, came under Egyptian rule in the New Kingdom; after Egypt disintegrated in the Late Bronze Age collapse the Kushites reestablished a kingdom at Napata.",
  links: [
    { id: "egypt", how: "successor", note: "Kushites reestablished a kingdom at Napata after Egypt's New Kingdom disintegrated" },
  ],
  cites: [W("Kingdom_of_Kush", "Kingdom of Kush"), { t: "Sudan - Ancient Kingdom, Nubia, Nile Valley | Britannica", u: "https://www.britannica.com/place/Sudan/The-kingdom-of-Kush" }],
});
TL.origin("aksum", {
  note: "Aksum emerged from the earlier Dʿmt civilization of Eritrea and the Tigray plateau, which had South Arabian (Sabaean) influence. Archaeology suggests the polity arose between 150 BCE and 150 CE, probably as a confederacy of district kings.",
  links: [
    { id: "dmt", how: "successor", note: "Aksum emerged from the earlier Dʿmt civilization of Eritrea and Tigray" },
  ],
  cites: [W("Kingdom_of_Aksum", "Kingdom of Aksum"), W("D%CA%BFmt", "Dʿmt"), { t: "Kingdom of Axum - World History Encyclopedia", u: "https://www.worldhistory.org/Kingdom_of_Axum/" }],
});
TL.origin("nok", {
  note: "The Nok culture of central Nigeria may have emerged around 1500 BCE (older accounts, such as Britannica's, date it c. 500 BCE–200 CE); its origin is unknown. Researchers propose a northern or Saharan homeland, with millet farming linked to the Sahel.",
  links: [],
  cites: [W("Nok_culture", "Nok culture"), { t: "Nok culture | African, Terracotta, Sculptures | Britannica", u: "https://www.britannica.com/topic/Nok-culture" }],
});
TL.origin("ghana-empire", {
  note: "The empire was a confederation of Mande peoples unified under the Soninke, said to rise from the earlier Tichitt culture around 300 CE, helped by the camel's arrival and the gold and salt trade. The Sosso conquered it by 1203.",
  links: [
    { id: "tichitt", how: "peoples", note: "Soninke of Ghana are thought to descend from the Tichitt culture's remnants" },
  ],
  cites: [W("Ghana_Empire", "Ghana Empire"), W("Dhar_Tichitt", "Dhar Tichitt"), { t: "Ghana | History, Culture & Legacy | Britannica", u: "https://www.britannica.com/place/Ghana-historical-West-African-empire" }],
});
TL.origin("great-zimbabwe", {
  note: "Great Zimbabwe was a Shona kingdom, its site occupied from about 1000 by proto-Karanga speakers. Bantu-speaking peoples had arrived in the region from 150 BCE, and by about 1300 it replaced the declining Mapungubwe state as the dominant power.",
  links: [
    { id: "bantu-expansion", how: "peoples", note: "Bantu-speaking peoples arrived in the region from 150 BCE and formed farming chiefdoms" },
  ],
  cites: [W("Kingdom_of_Zimbabwe", "Kingdom of Zimbabwe"), { t: "Great Zimbabwe | History, Significance, Ruins, Culture, & Facts | Britannica", u: "https://www.britannica.com/place/Great-Zimbabwe" }],
});
TL.origin("ethiopia", {
  note: "After Aksum fell in the 10th century the highlands were ruled by the Zagwe, whose churches drew on Aksumite tradition. Yekuno Amlak defeated the Zagwe in 1270, claiming descent from Dil Na'od, the last Aksumite king, and from Solomon.",
  links: [
    { id: "aksum", how: "successor", note: "Zagwe ruled after Aksum; Yekuno Amlak claimed descent from its last king" },
  ],
  cites: [W("Ethiopian_Empire", "Ethiopian Empire"), W("Kingdom_of_Aksum", "Kingdom of Aksum"), { t: "Zagwe dynasty | Solomonic dynasty, Lalibela, Axumite Empire | Britannica", u: "https://www.britannica.com/topic/Zagwe-dynasty" }],
});
TL.origin("benin-kingdom", {
  note: "Benin grew out of the Edo polity of Igodomigodo, ruled by Ogiso kings. Tradition says a prince of Ile-Ife, Oranmiyan, restored order and began the Oba line; his son Eweka was crowned with regalia sent from Ife.",
  links: [
    { id: "ife", how: "peoples", note: "Tradition: Oranmiyan of Ile-Ife began the Oba line; his son Eweka was crowned" },
  ],
  cites: [W("Kingdom_of_Benin", "Kingdom of Benin"), W("Ife", "Ife"), { t: "Benin | History, Culture & People of West Africa | Britannica", u: "https://www.britannica.com/place/Benin-historical-kingdom-West-Africa" }],
});
TL.origin("kongo", {
  note: "Kongo was founded around 1390 through a political marriage between two KiKongo-speaking peoples, those of Mpemba Kasi and Vungu and of Mbata. Their son Lukeni lua Nimi led the expansion that built the kingdom.",
  links: [],
  cites: [W("Kingdom_of_Kongo", "Kingdom of Kongo"), { t: "Kongo | Facts, Map, People, Civil War, & History | Britannica", u: "https://www.britannica.com/place/Kongo-historical-kingdom-Africa" }],
});
TL.origin("gran-colombia", {
  note: "Proclaimed by the Congress of Angostura in 1819, Gran Colombia united the former Venezuela, the United Provinces of New Granada, Panama and Quito, still being freed from Spanish rule; its constitution came in 1821.",
  links: [
    { id: "spain", how: "independence", note: "Formed from Spanish territories liberated by Bolívar's armies after 1819" },
    { id: "new-granada", how: "successor", note: "Replaced the Viceroyalty of New Granada, taken by Bolívar after Boyacá in 1819" },
  ],
  cites: [W("Gran_Colombia", "Gran Colombia"), W("Viceroyalty_of_New_Granada", "Viceroyalty of New Granada"), { t: "Gran Colombia | History, Attractions, Map, & Facts | Britannica", u: "https://www.britannica.com/place/Gran-Colombia" }],
});
TL.origin("south-africa", {
  note: "The Union of South Africa was created on May 31, 1910, by the South Africa Act 1909, uniting the Cape, Natal, Transvaal and Orange River colonies as a self-governing British dominion; Transvaal and Orange were the former Boer republics.",
  links: [
    { id: "uk", how: "context", note: "British colonies united under the South Africa Act 1909 as a self-governing dominion" },
  ],
  cites: [W("Union_of_South_Africa", "Union of South Africa"), { t: "South Africa Act | Definition, History, & Facts | Britannica", u: "https://www.britannica.com/event/South-Africa-Act" }],
});
TL.origin("haiti", {
  note: "Haiti was the French colony of Saint-Domingue until enslaved Africans rose against French colonial rule on August 21, 1791; the revolution ended with independence on January 1, 1804.",
  links: [
    { id: "france", how: "independence", note: "Saint-Domingue won independence from France on January 1, 1804" },
  ],
  cites: [W("Haitian_Revolution", "Haitian Revolution"), { t: "Haitian Revolution | Causes, Summary, & Facts | Britannica", u: "https://www.britannica.com/topic/Haitian-Revolution" }],
});
TL.origin("argentina", {
  note: "The May Revolution of 1810 removed the Spanish viceroy at Buenos Aires and began the United Provinces of the Río de la Plata. The Congress of Tucumán declared independence from Spain on July 9, 1816.",
  links: [
    { id: "spain", how: "independence", note: "Congress of Tucumán declared independence from Spain on July 9, 1816" },
    { id: "rio-de-la-plata", how: "successor", note: "The United Provinces succeeded the viceroyalty after the May Revolution of 1810" },
  ],
  cites: [W("Argentine_Declaration_of_Independence", "Argentine Declaration of Independence"), W("Viceroyalty_of_the_R%C3%ADo_de_la_Plata", "Viceroyalty of the Río de la Plata"), { t: "May Revolution | Argentine history [1810] | Britannica", u: "https://www.britannica.com/topic/May-Revolution" }],
});
TL.origin("congo-free-state", {
  note: "Belgium's King Leopold II created the International Association of the Congo; the Berlin Conference of 1884–85 recognized it with no tie to Belgium beyond a personal union, and it became the Congo Free State in 1885.",
  links: [
    { id: "belgium", how: "context", note: "Created by Leopold II, King of the Belgians, in personal union; annexed by Belgium in 1908" },
  ],
  cites: [W("Congo_Free_State", "Congo Free State"), W("Belgium", "Belgium"), { t: "Congo Free State | Historical State, Imperialism, Africa | Britannica", u: "https://www.britannica.com/place/Congo-Free-State" }],
});
TL.origin("ghana", {
  note: "The British Gold Coast colony (from 1874), Ashanti, the Northern Territories and British Togoland were unified on March 6, 1957, as the independent dominion of Ghana, the first sub-Saharan colony to gain sovereignty.",
  links: [
    { id: "uk", how: "independence", note: "Gold Coast and British territories became independent from Britain on March 6, 1957" },
    { id: "ashanti", how: "merger", note: "The Asante territory was unified with the Gold Coast and other lands as Ghana" },
  ],
  cites: [W("Ghana", "Ghana"), { t: "Gold Coast | Map, Ghana, History, Colonialism, & Independence | Britannica", u: "https://www.britannica.com/place/Gold-Coast-historical-region-Africa" }],
});
TL.origin("nigeria", {
  note: "Britain annexed Lagos in 1861 and set up Northern and Southern protectorates in 1900, united in 1914 as the Colony and Protectorate of Nigeria; it became independent from the United Kingdom on October 1, 1960.",
  links: [
    { id: "uk", how: "independence", note: "British colony and protectorate became independent on October 1, 1960" },
  ],
  cites: [W("Nigeria", "Nigeria"), { t: "Nigeria - Colonial History, Economy, People | Britannica", u: "https://www.britannica.com/place/Nigeria/Nigeria-as-a-colony" }],
});
TL.origin("kenya", {
  note: "Kenya emerged from a British protectorate (1895) that became the Kenya Colony in 1920. After the Mau Mau emergency of 1952–1959, the colony ended on December 12, 1963, with Kenyatta's KANU in government.",
  links: [
    { id: "uk", how: "independence", note: "British colony and protectorate ended on December 12, 1963" },
    { id: "bantu-expansion", how: "peoples", note: "Bantu-speaking farmers settled coast and interior from about 250 BCE; Kikuyu are Bantu" },
  ],
  cites: [W("Kenya", "Kenya"), { t: "Kenya - Colonialism, Mau Mau, Independence | Britannica", u: "https://www.britannica.com/place/Kenya/World-War-II-to-independence" }],
});
TL.origin("sudan", {
  note: "Sudan was ruled by Egypt from 1820, then by the Mahdist State, then as an Anglo-Egyptian condominium from 1899. Parliament declared independence on December 19, 1955, and Britain and Egypt recognized it on January 1, 1956.",
  links: [
    { id: "uk", how: "independence", note: "Co-ruled Sudan from 1899; recognized its independence on January 1, 1956" },
    { id: "modern-egypt", how: "independence", note: "Egypt, the other condominium partner, also recognized independence in 1956" },
  ],
  cites: [W("History_of_Sudan", "History of Sudan"), { t: "Sudan - Nationalism, Independence, Unity | Britannica", u: "https://www.britannica.com/place/Sudan/The-growth-of-national-consciousness" }],
});
TL.origin("algeria", {
  note: "Algeria was the largely autonomous Ottoman-era Regency of Algiers until France invaded in 1830. After the war of independence (1954–1962) it became independent on July 5, 1962; its people draw on Berber and Arab heritage.",
  links: [
    { id: "france", how: "independence", note: "French colony from 1830; independent July 5, 1962 after the Évian Accords" },
  ],
  cites: [W("Algeria", "Algeria"), { t: "Algeria - War of Independence, Revolution, Nationalism | Britannica", u: "https://www.britannica.com/place/Algeria/The-Algerian-War-of-Independence" }],
});
TL.origin("rwanda", {
  note: "The old Kingdom of Rwanda was ruled by Belgium after 1916, as part of the Ruanda-Urundi mandate and then UN trust territory. After the 1959 revolution it separated from Burundi and became independent from Belgium on July 1, 1962.",
  links: [
    { id: "belgium", how: "independence", note: "Belgian mandate then trust territory; independent July 1, 1962" },
  ],
  cites: [W("Rwanda", "Rwanda"), W("Belgium", "Belgium"), { t: "Rwanda - Colonialism, Genocide, Reconciliation | Britannica", u: "https://www.britannica.com/place/Rwanda/Rwanda-under-German-and-Belgian-control" }],
});
TL.origin("cuba", {
  note: "Cuba won formal independence from Spain's rule after the 1898 war and became a republic in 1902. The revolution overthrew Batista, who seized power in a March 10, 1952 coup, and the rebels toppled him on December 31, 1958.",
  links: [
    { id: "spain", how: "independence", note: "Spain relinquished Cuba in the 1898 Treaty of Paris; republic from May 20, 1902" },
    { id: "usa", how: "context", note: "US occupied Cuba 1899–1902 and kept intervention rights under the Platt Amendment" },
  ],
  cites: [W("Cuban_Revolution", "Cuban Revolution"), W("Cuba", "Cuba"), { t: "Cuban Revolution | Summary, Facts, Causes, Effects, & Significance | Britannica", u: "https://www.britannica.com/event/Cuban-Revolution" }],
});
TL.origin("mercosur", {
  note: "Argentina and Brazil began integrating with the 1985 Iguaçu Declaration and 1990 Buenos Aires Act, with Paraguay and Uruguay joining; the four signed the Treaty of Asunción on March 26, 1991.",
  links: [
    { id: "argentina", how: "merger", note: "Founding signatory of the Treaty of Asunción, 1991" },
    { id: "brazil", how: "merger", note: "Founding signatory of the Treaty of Asunción, 1991" },
  ],
  cites: [W("Mercosur", "Mercosur"), { t: "Mercosur | South American Trade Bloc, Benefits & Challenges | Britannica", u: "https://www.britannica.com/topic/Mercosur" }],
});
TL.origin("oau", {
  note: "Independent African states founded the OAU at Addis Ababa in May 1963 to unite African states and eradicate colonialism; the African Union succeeded it in 2002.",
  links: [
    { id: "decolonization", how: "ideas", note: "Charter aimed to eradicate all forms of colonialism from Africa" },
  ],
  cites: [{ t: "Overview — African Union", u: "https://au.int/en/overview" }],
});
