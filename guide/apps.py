from django.apps import AppConfig


class GuideConfig(AppConfig):
    """The technical guide's tools (`manage.py guide`): no models, no URLs."""

    name = "guide"
    verbose_name = "Technical guide"
