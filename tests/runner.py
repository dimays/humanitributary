"""The test runner: Django's, with both object storages swapped for temporary directories for the whole run, so the
suite never reaches MinIO, S3 or the network whatever `.env` says (docs/adr/0016-object-storage.md)."""

import shutil
import tempfile

from django.conf import settings
from django.test.runner import DiscoverRunner
from django.test.utils import override_settings


def temp_storages(root: str) -> dict:
    out = dict(settings.STORAGES)
    for alias in ("raw", "releases"):
        out[alias] = {"BACKEND": "django.core.files.storage.FileSystemStorage", "OPTIONS": {"location": f"{root}/{alias}", "allow_overwrite": True}}
    return out


class Runner(DiscoverRunner):
    def setup_test_environment(self, **kwargs):
        super().setup_test_environment(**kwargs)
        self._storage_root = tempfile.mkdtemp(prefix="humanitributary-test-storage-")
        # override_settings sends setting_changed, which makes django.core.files.storage.storages forget its backends.
        self._override = override_settings(STORAGES=temp_storages(self._storage_root), STORAGE_BACKEND="local")
        self._override.enable()

    def teardown_test_environment(self, **kwargs):
        self._override.disable()
        shutil.rmtree(self._storage_root, ignore_errors=True)
        super().teardown_test_environment(**kwargs)


class FreshStorage:
    """A TestCase mixin: empty storages for each test (the run-wide ones are shared by every test)."""

    def setUp(self):
        super().setUp()
        root = tempfile.mkdtemp(prefix="humanitributary-test-storage-")
        o = override_settings(STORAGES=temp_storages(root))
        o.enable()
        self.addCleanup(shutil.rmtree, root, True)
        self.addCleanup(o.disable)
