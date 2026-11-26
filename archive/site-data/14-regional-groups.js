// Regional groups (November 2026): small successor states with few events of their own are shown as one branch,
// so the timeline stays readable. Their events, contacts and sources are kept; each event names its country.

TL.add({
  branches: [
    { id: "post-yugoslav-states", name: "Former Yugoslav states", region: "europe",
      start: 1991.48, end: null, startWhen: "June 25, 1991 (Slovenia and Croatia declare independence)", endWhen: "",
      parents: ["yugoslavia"], into: [],
      text: "The states that emerged as Yugoslavia broke up: Slovenia and Croatia (1991), North Macedonia (1991), Bosnia and Herzegovina (1992), the Federal Republic of Yugoslavia, later Serbia (1992), Montenegro (2006) and Kosovo (2008, recognition contested).",
      cites: [
        { t: "Slovenia — Wikipedia", u: "https://en.wikipedia.org/wiki/Slovenia" },
        { t: "Croatia — Wikipedia", u: "https://en.wikipedia.org/wiki/Croatia" },
        { t: "North Macedonia — Wikipedia", u: "https://en.wikipedia.org/wiki/North_Macedonia" },
        { t: "Bosnia and Herzegovina — Wikipedia", u: "https://en.wikipedia.org/wiki/Bosnia_and_Herzegovina" },
        { t: "Federal Republic of Yugoslavia — Wikipedia", u: "https://en.wikipedia.org/wiki/Federal_Republic_of_Yugoslavia" },
        { t: "2006 Montenegrin independence referendum — Wikipedia", u: "https://en.wikipedia.org/wiki/2006_Montenegrin_independence_referendum" },
        { t: "2008 Kosovo declaration of independence — Wikipedia", u: "https://en.wikipedia.org/wiki/2008_Kosovo_declaration_of_independence" },
      ] },
    { id: "south-caucasus", name: "South Caucasus states (Georgia, Armenia, Azerbaijan)", region: "mideast",
      start: 1991.27, end: null, startWhen: "April 9, 1991 (Georgia declares independence)", endWhen: "",
      parents: ["ussr"], into: [],
      text: "Three former Soviet republics that declared independence in 1991: Georgia on April 9, Armenia on September 21 and Azerbaijan on October 18, as the Soviet Union was ceasing to exist.",
      cites: [
        { t: "Georgia (country) — Wikipedia", u: "https://en.wikipedia.org/wiki/Georgia_(country)" },
        { t: "Armenia — Wikipedia", u: "https://en.wikipedia.org/wiki/Armenia" },
        { t: "Azerbaijan — Wikipedia", u: "https://en.wikipedia.org/wiki/Azerbaijan" },
      ] },
  ],
});
