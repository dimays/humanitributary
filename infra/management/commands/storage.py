"""Object storage housekeeping (docs/adr/0016-object-storage.md).

    manage.py storage init                   # create the buckets if missing (MinIO locally; `make db` / `make up` run it)
    manage.py storage status                 # backend, buckets reachable, the latest pointer
    manage.py storage migrate_local          # copy var/raw and var/releases into the store (idempotent; deletes nothing)
    manage.py storage migrate_local --var-dir /path/to/var --dry-run
    manage.py storage pull-release [VERSION] # mirror a release into var/releases/<version>/ (+ latest) for the site build
"""

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from infra import migrate_local, storage


class Command(BaseCommand):
    help = "Object storage: init (buckets), status, migrate_local (var/ → store), pull-release (store → var/releases)."

    def add_arguments(self, parser):
        sub = parser.add_subparsers(dest="action", required=True)
        sub.add_parser("init")
        sub.add_parser("status")
        p = sub.add_parser("migrate_local")
        p.add_argument("--var-dir", default="", help="The var/ directory to copy from (default: VAR_DIR).")
        p.add_argument("--dry-run", action="store_true")
        p = sub.add_parser("pull-release")
        p.add_argument("version", nargs="?", default=None)
        p.add_argument("--dest", default="", help="Default: var/releases.")

    def handle(self, *args, action, **o):
        getattr(self, action.replace("-", "_"))(**o)

    def init(self, **o):
        for alias in (storage.RAW, storage.RELEASES):
            s = storage.storage(alias)
            if settings.STORAGE_BACKEND == "local":
                Path(s.location).mkdir(parents=True, exist_ok=True)
                self.stdout.write(f"{alias}: {s.location}")
                continue
            client = s.connection.meta.client
            name = s.bucket_name
            try:
                client.head_bucket(Bucket=name)
                self.stdout.write(f"{alias}: bucket {name} exists")
            except client.exceptions.ClientError as e:
                code = e.response.get("Error", {}).get("Code", "")
                if code not in ("404", "NoSuchBucket", "NotFound"):
                    raise CommandError(f"{alias}: bucket {name}: {code or e}") from e
                client.create_bucket(Bucket=name)
                self.stdout.write(self.style.SUCCESS(f"{alias}: created bucket {name}"))

    def status(self, **o):
        self.stdout.write(f"backend: {settings.STORAGE_BACKEND}")
        bad = False
        for alias in (storage.RAW, storage.RELEASES):
            ok, err = storage.reachable(alias)
            bad |= not ok
            self.stdout.write(f"{alias}: {settings.STORAGE_BUCKETS[alias]} {'reachable' if ok else 'UNREACHABLE ' + err}")
        if not bad:
            p = storage.read_pointer()
            self.stdout.write(f"latest: {p['version']} ({p['reason']} by {p['updated_by']}, {p['updated_at']})" if p else "latest: (no pointer yet)")
        if bad:
            raise CommandError("storage unreachable (make db starts MinIO; see .env.example)")

    def migrate_local(self, var_dir, dry_run, **o):
        root = Path(var_dir) if var_dir else Path(settings.VAR_DIR)
        if not root.is_dir():
            raise CommandError(f"{root} is not a directory")
        stats, problems = migrate_local.migrate(root, dry_run=dry_run, log=self.stdout.write)
        for p in problems[:20]:
            self.stdout.write(self.style.WARNING(f"  {p}"))
        self.stdout.write(("(dry run) " if dry_run else "") + migrate_local.summary(stats))
        if stats["db.missing_raw"] or stats["db.missing_snapshots"]:
            self.stdout.write(self.style.WARNING("The database refers to objects the store lacks (listed above); keep the local copies until it has them."))
        elif not dry_run:
            self.stdout.write(self.style.SUCCESS(f"Everything the database refers to is in the store. The copies under {root} were left in place."))

    def pull_release(self, version, dest, **o):
        from publish.release import pull_release

        try:
            v, out = pull_release(version, Path(dest) if dest else None)
        except ValueError as e:
            raise CommandError(str(e)) from e
        self.stdout.write(self.style.SUCCESS(f"release {v} → {out} (latest → {v})"))
