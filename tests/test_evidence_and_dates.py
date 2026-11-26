from datetime import date

from django.test import SimpleTestCase

from evidence.confidence import assess
from evidence.publishers import defaults_for, domain_of
from timeline.dates import parse_when


class ConfidenceTests(SimpleTestCase):
    def test_statuses(self):
        self.assertEqual(assess([])[0], "unverified")
        self.assertEqual(assess([("supports", "wikipedia.org", 3)])[0], "single_source")
        self.assertEqual(assess([("supports", "wikipedia.org", 3), ("supports", "britannica.com", 2)])[0], "corroborated")
        self.assertEqual(assess([("supports", "britannica.com", 2), ("conflicts", "nasa.gov", 1)])[0], "contested")
        self.assertEqual(assess([("supports", "nasa.gov", 1)], recheck_after=date(2000, 1, 1))[0], "stale")
        self.assertEqual(assess([("unrelated", "nasa.gov", 1)])[0], "unverified")

    def test_confidence_counts_each_publisher_once_and_conflicts_lower_it(self):
        one = assess([("supports", "wikipedia.org", 3)])[1]
        same_twice = assess([("supports", "wikipedia.org", 3), ("supports", "wikipedia.org", 3)])[1]
        two = assess([("supports", "wikipedia.org", 3), ("supports", "nasa.gov", 1)])[1]
        contested = assess([("supports", "wikipedia.org", 3), ("supports", "nasa.gov", 1), ("conflicts", "esa.int", 1)])[1]
        self.assertEqual(one, same_twice)
        self.assertGreater(two, one)
        self.assertLess(contested, two)
        self.assertTrue(0 <= contested <= two <= 1)

    def test_publisher_domains(self):
        self.assertEqual(domain_of("https://en.wikipedia.org/wiki/Rome"), "wikipedia.org")
        self.assertEqual(domain_of("https://www.britannica.com/place/Rome"), "britannica.com")
        self.assertEqual(defaults_for("openstax.org")["fetch_policy"], "forbidden")
        self.assertEqual(defaults_for("solarsystem.nasa.gov")["tier"], 1)
        self.assertIsNone(defaults_for("example.org")["tier"])


class DateTextTests(SimpleTestCase):
    def test_precision_and_exact_dates(self):
        cases = {
            "4.54 ± 0.05 billion years ago": ("billion_years", True, None, None),
            "c. 1.6 million years ago": ("million_years", True, None, None),
            "debated: possibly c. 65,000 years ago": ("thousand_years", True, None, None),
            "c. 3100 BCE": ("year", True, None, None),
            "5th century BCE": ("century", False, None, None),
            "1960s": ("decade", False, None, None),
            "December 1879": ("month", False, None, None),
            "15 March 44 BCE": ("day", False, None, None),
            "July 20, 1969": ("day", False, date(1969, 7, 20), None),
            "April 26–29, 1994": ("day", False, date(1994, 4, 26), date(1994, 4, 29)),
            "November 20 – December 4, 1979": ("day", False, date(1979, 11, 20), date(1979, 12, 4)),
            "December 17, 2010 – January 14, 2011": ("day", False, date(2010, 12, 17), date(2011, 1, 14)),
        }
        for text, expected in cases.items():
            d = parse_when(text)
            self.assertEqual((d.precision, d.approximate, d.date, d.end_date), expected, text)
