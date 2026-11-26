"""Releases: each `manage.py publish` writes a versioned static snapshot of published content (docs/adr/0001)."""

from django.db import models


class Release(models.Model):
    version = models.CharField(max_length=40, unique=True, help_text='"YYYY.MM.DD.N": the date, then the release of the day.')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=200)
    content_hash = models.CharField(max_length=64, db_index=True, help_text="sha256 of content.json's bytes.")
    snapshot_path = models.CharField(max_length=300, help_text="Relative to VAR_DIR: releases/<version>/content.json.")
    counts = models.JSONField(default=dict)
    revision_high_water = models.BigIntegerField(default=0, help_text="The last Revision id included: what changed since is everything after it.")
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.version
