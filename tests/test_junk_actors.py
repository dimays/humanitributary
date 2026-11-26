"""The claim splitter's actor rules (evidence/claims.py): fragments it must not make into actors, from the archive
corpus's own texts, and the junk it made before them, which the sweep keeps and `--junk-actors` only reports (ADR 0025)."""

import json
from datetime import date
from io import StringIO

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, TestCase

from evidence.claims import actors, junk_actor
from evidence.models import Claim
from evidence.sweep import junk_actors, sweep
from publish.legacy import import_content
from revisions import revising
from revisions.models import Revision
from timeline.models import Entry

from .fixtures import small

TODAY = date(2026, 11, 26)

# (slug, title, text, actors the splitter must find, fragments it used to make and must not): real entries.
CORPUS = [
    ("ga3-kohl-chancellor", "Helmut Kohl becomes chancellor",
     "The SPD–FDP coalition fell apart when the FDP backed CDU leader Helmut Kohl as chancellor. After the March 1983 election the Greens entered the Bundestag with 5.6% of the vote.",
     ["Helmut Kohl", "Bundestag", "Greens"], ["the March", "March"]),
    ("mx-us-invades-afghanistan", "US-led invasion of Afghanistan",
     "After the September 11 attacks, the US, with British support, began bombing the Taliban, who had given al-Qaeda sanctuary. The Taliban regime unraveled after losing Mazar-e-Sharif on November 9, 2001.",
     ["US", "Taliban", "al-Qaeda", "Mazar-e-Sharif"], ["the September", "Qaeda", "US-led"]),
    ("asean", "ASEAN",
     "The Association of Southeast Asian Nations, founded by the ASEAN Declaration of August 8, 1967; a consensus-based forum that reached 11 members when Timor-Leste joined on October 26, 2025.",
     ["ASEAN Declaration", "Association of Southeast Asian Nations", "Timor-Leste"], ["ASEAN Declaration of August"]),
    ("ga1-us-embargo-cuba", "US embargo on Cuba begins",
     "After Cuba nationalized U.S. oil refineries, the US imposed a trade embargo in 1960 and later widened it, reinforced by the 1996 Helms–Burton Act. The UN General Assembly has repeatedly condemned it since 1992.",
     ["Cuba", "US", "Helms–Burton Act", "UN General Assembly"], ["U", "S"]),
    ("new-zealand", "New Zealand",
     "Proclaimed British after the 1840 Treaty of Waitangi, it became a Crown colony separate from New South Wales in 1841, gained responsible self-government in 1856 and became a Dominion on September 26, 1907.",
     ["New Zealand", "Treaty of Waitangi", "New South Wales", "Crown"], ["Zealand", "South Wales", "Proclaimed British", "Dominion"]),
    ("gojoseon", "Gojoseon",
     "Old Joseon, an early Korean polity. Chinese texts of the 7th–4th centuries BCE mention it; it fought Yan, fell to Han in 108 BCE, and successors such as Buyeo and the Samhan gave rise to the Three Kingdoms.",
     ["Gojoseon", "Three Kingdoms", "Buyeo", "Han"], ["Kingdoms"]),
    ("anglo-saxons", "Anglo-Saxon England",
     "Germanic settlers who had reached Britain by the 5th century, after Romano-Britons stopped receiving Roman officials in 409–410. Their kingdoms were united as England when Æthelstan took York in 927.",
     ["Britain", "Æthelstan", "York"], []),
    ("ga1-lindbergh-paris", "Lindbergh flies solo from New York to Paris",
     "Charles Lindbergh flew the Spirit of St. Louis nonstop from New York to Paris in about 33.5 hours.",
     ["Charles Lindbergh", "New York", "Paris"], ["York"]),
    ("ga5-kawabata-nobel", "Kawabata wins the Nobel Prize in Literature",
     "Yasunari Kawabata, author of Snow Country and Thousand Cranes, became the first Japanese person to receive the Nobel Prize in Literature.",
     ["Yasunari Kawabata", "Nobel Prize", "Snow Country"], ["Literature"]),
    ("drc", "Democratic Republic of the Congo",
     "Independent from Belgium as the Republic of the Congo (Léopoldville); Mobutu renamed it Zaire in 1971, and Laurent-Désiré Kabila restored the name Democratic Republic of the Congo after overthrowing him in 1997.",
     ["Democratic Republic of the Congo", "Republic of the Congo", "Belgium", "Mobutu"], ["Republic", "Democratic Republic", "Congo"]),
    ("prc", "People's Republic of China",
     "Mao Zedong proclaimed the People's Republic on October 1, 1949, after the Communists' victory in the civil war; the Nationalist government of the Republic of China retreated to Taiwan.",
     ["Mao Zedong", "Republic of China", "Taiwan", "Communists"], ["People", "Republic", "Communists'", "Nationalist"]),
    ("visigoths", "Visigothic Kingdom",
     "Rome settled the Visigoths as federates in Aquitaine in 418. After the Franks beat them in 507 the kingdom centered on Hispania (Toledo from 542) until the Umayyad invasion of 711.",
     ["Franks", "Visigoths", "Aquitaine"], ["the Franks"]),
    ("hx-war-golden-stool", "War of the Golden Stool",
     "Led by Yaa Asantewaa, the Asante besieged the British fort at Kumasi after the governor sought the Golden Stool. Britain won and annexed Ashanti, but the Asante kept the hidden Stool.",
     ["War of the Golden Stool", "Yaa Asantewaa", "Kumasi"], ["War"]),
    ("modern-olympics", "The modern Olympic Games",
     "The Olympic Games, which originated in ancient Greece, were revived in the late 19th century; the IOC was founded in 1894 and the first modern Games were held in Athens in 1896.",
     ["Olympic Games", "IOC", "Athens"], ["Games"]),
    ("cl-ape-monkey-split", "Earliest fossils of apes and Old World monkeys",
     "Rukwapithecus (an early ape) and Nsungwepithecus (an Old World monkey) from Tanzania show the two lineages had split by c. 25 million years ago; DNA estimates put the split 25–30 million years ago.",
     ["Old World", "Tanzania", "DNA"], ["World", "Earliest"]),
    ("ga7-mars-orbiter", "Mars Orbiter Mission reaches Mars",
     "Launched November 5, 2013, India's first interplanetary mission made ISRO the fourth space agency to reach Mars orbit, succeeding on its first attempt, and India the first Asian nation there. It cost about ₹450 crore (US$73 million).",
     ["Mars Orbiter Mission", "India", "ISRO"], ["Launched November", "November"]),
    ("c1sa-kite-runner", "The Kite Runner published",
     "Khaled Hosseini's debut novel, set in Kabul, was published in 2003 and made him a full-time writer; it was a global success.",
     ["Khaled Hosseini", "Kabul"], ["Hosseini"]),
    ("me-seven-years-war", "Seven Years' War",
     "A global war in which Great Britain and Prussia fought France, Austria and Russia.",
     ["Seven Years' War", "Great Britain", "Prussia"], ["Years' War", "Britain"]),
    ("ga2-fr-rainbow-warrior", "Sinking of the Rainbow Warrior",
     "Two French DGSE agents sank the Greenpeace ship in Auckland harbor.",
     ["French DGSE", "Greenpeace", "Auckland"], ["Two French DGSE"]),
]


class ActorRulesTests(SimpleTestCase):
    def test_real_entries_keep_their_names_and_lose_the_fragments(self):
        for slug, title, text, want, never in CORPUS:
            got = actors(title, text)
            with self.subTest(slug):
                for name in want:
                    self.assertIn(name, got)
                for name in never:
                    self.assertNotIn(name, got)

    def test_of_march_on_the_tohoku_event_is_never_an_actor(self):
        # Reported on the hosted data: "of March" as an actor of the Tōhoku earthquake.
        for text in ("One of March 2011's disasters, it struck off Tōhoku; Japan counted 19,759 deaths.",
                     "Most of March 11's tsunami damage was in Tōhoku, and official figures in Japan counted 19,759 deaths."):
            got = actors("Tōhoku earthquake and tsunami", text)
            self.assertIn("Tōhoku", got)
            self.assertIn("Japan", got)
            self.assertFalse([n for n in got if "March" in n], got)

    def test_junk_actor_reasons(self):
        for name, why in [("of March", "article"), ("the March", "article"), ("The", "article"), ("In", "article"), ("S", "letter"),
                          ("U", "letter"), ("March", "month"), ("ASEAN Declaration of August", "month"), ("Literature", "common word"),
                          ("Republic", "common word"), ("US-led", "common word"), ("Communists'", "possessive"),
                          ("Proclaimed British", "participle"), ("Launched November", "participle")]:
            self.assertEqual(junk_actor(name), why, name)
        for name in ("France", "UN", "New Zealand", "Black September", "Salt March", "Congress", "de Gaulle", "Khaled Hosseini", "Mazar-e-Sharif"):
            self.assertIsNone(junk_actor(name), name)
        self.assertEqual(junk_actor("Zealand", ["New Zealand", "Treaty of Waitangi"]), "fragment")
        self.assertEqual(junk_actor("Qaeda", ["al-Qaeda"]), "fragment")
        self.assertIsNone(junk_actor("Zealand"))  # a fragment only beside the whole name


class JunkClaimsTests(TestCase):
    """Junk actor claims made before these rules stay until the owner decides; the report counts them."""

    def setUp(self):
        import_content(small())
        sweep(TODAY, tasks=False)
        e = Entry.objects.get(slug="an-caesar-assassinated")
        parent = Claim.objects.get(entry=e, field="as_written", parent__isnull=True)
        with revising("human:test", reason="setup: what the old splitter made"):
            for key, name in [("of-march", "of March"), ("s", "S"), ("brutus", "Brutus")]:
                Claim.objects.create(entry=e, parent=parent, field="actor", key=key, value={"name": name})

    def test_the_sweep_keeps_junk_and_still_deletes_a_name_that_is_gone(self):
        out = sweep(TODAY, tasks=False)
        keys = set(Claim.objects.filter(entry__slug="an-caesar-assassinated", field="actor").values_list("key", flat=True))
        self.assertLessEqual({"of-march", "s"}, keys)  # junk: kept as it is
        self.assertNotIn("brutus", keys)  # not junk, just no longer found: deleted as before
        self.assertEqual(out["split"]["junk_kept"], 2)
        before = Revision.objects.count()
        sweep(TODAY, tasks=False)
        self.assertEqual(Revision.objects.count(), before)  # and keeping them writes nothing

    def test_the_report_counts_and_samples_without_writing(self):
        before = Revision.objects.count()
        got = junk_actors(sample=5)
        self.assertEqual((got["junk"], got["junk_without_evidence"], got["junk_with_evidence"]), (2, 2, 0))
        self.assertEqual(got["by_reason"], {"article": 1, "letter": 1})
        self.assertEqual({(s["entry"], s["name"]) for s in got["sample"]}, {("an-caesar-assassinated", "of March"), ("an-caesar-assassinated", "S")})
        out = StringIO()
        call_command("facts", "sweep", "--junk-actors", "--dry-run", stdout=out)
        self.assertEqual(json.loads(out.getvalue())["junk_without_evidence"], 2)
        with self.assertRaises(CommandError):
            call_command("facts", "sweep", "--junk-actors")  # a report only: never without --dry-run
        self.assertEqual(Revision.objects.count(), before)
