"""A job run's log, captured while it runs and kept beside its FetchRun as a `RunLog` (ADR 0031).

`capture(run)` is a context manager `ingest.jobs.run_one` wraps each job in. For the run's duration it attaches a
`logging.Handler` to the root logger that keeps every record at INFO and above emitted by the running thread (the
job's own `logging` calls, the fetcher's request lines, Django's and libraries' warnings), plus the lines the runner
adds itself through `Capture.add`: the start, what the job printed through `ctx.log`, each `ctx.error`, the traceback
of a failure, and the finish. Each line is `[time, level, logger, message]`.

What it never keeps:

- secrets: every message goes through `ingest.policy.mask_secrets` (configured key values, `key=`/`token=` query
  parameters) and `mask` here (bearer tokens, `password=`/`secret=`, a URL's user:password);
- noise that could carry a URL's query: `httpx` and `httpcore` records below WARNING (the fetcher logs its own
  request lines without the query string);
- more than MAX_LINES lines or MAX_BYTES bytes: the first lines up to the cap less a tail reserve are kept, then the
  last TAIL_LINES lines, with the number left out between them (`dropped`), so both how a run started and how it
  ended are readable. A single message is cut at MAX_LINE_CHARS.

The log is written when the run finishes, and every FLUSH_SECONDS while it runs when the job is not inside a
transaction (a write inside the job's transaction would roll back with it, or fail in a broken one), so the console
can follow a long run. A failure to write the log never fails the run.
"""

from __future__ import annotations

import logging
import re
import threading
import time
from collections import deque
from contextlib import contextmanager
from datetime import datetime, timezone as dt_timezone

from .policy import mask_secrets

MAX_LINES = 2000
MAX_BYTES = 200_000
TAIL_LINES = 200          # the last lines always kept once the cap is reached
TAIL_BYTES = 40_000
MAX_LINE_CHARS = 4000
FLUSH_SECONDS = 10
LEVEL = logging.INFO
QUIET_LOGGERS = ("httpx", "httpcore")  # kept only at WARNING and above
KEEP_DAYS = 30            # RunLogs older than this are deleted by `prune` (run_due, once a pass)

_MASKS = [
    (re.compile(r"(authorization[\"']?\s*[:=]\s*[\"']?(?:bearer|token|basic)\s+)[^\s\"',;]+", re.I), r"\1***"),
    (re.compile(r"(\bbearer\s+)[A-Za-z0-9._~+/=-]{8,}", re.I), r"\1***"),
    (re.compile(r"((?:password|passwd|pwd|secret|client_secret|access_token|refresh_token)[\"']?\s*[=:]\s*[\"']?)[^\s&\"',;]+", re.I), r"\1***"),
    (re.compile(r"(\b[a-z][a-z0-9+.-]*://[^/\s:@]+:)[^@\s/]+@", re.I), r"\1***@"),
]


def mask(text: str) -> str:
    """Secrets out of a log line: the policy's masking, then tokens, passwords and URL credentials."""
    out = mask_secrets(text)
    for pattern, repl in _MASKS:
        out = pattern.sub(repl, out)
    return out


def _now_iso(ts: float | None = None) -> str:
    return datetime.fromtimestamp(ts if ts is not None else time.time(), tz=dt_timezone.utc).isoformat(timespec="milliseconds")


class Capture(logging.Handler):
    """The lines of one run: a head up to the caps less the tail reserve, then a rolling tail."""

    def __init__(self, run=None):
        super().__init__(level=LEVEL)
        self.run = run
        self.thread = threading.get_ident()
        self.head: list[list] = []
        self.head_bytes = 0
        self.tail: deque = deque()
        self.tail_bytes = 0
        self.dropped = 0
        self.total = 0
        self._last_flush = time.monotonic()
        self._lock = threading.Lock()

    # Taking lines ----------------------------------------------------------------------------------------------
    def add(self, level: str, message: str, *, logger: str = "job", ts: float | None = None):
        msg = mask(str(message))
        if len(msg) > MAX_LINE_CHARS:
            msg = msg[: MAX_LINE_CHARS - 1] + "…"
        line = [_now_iso(ts), level, logger, msg]
        size = len(msg.encode()) + len(logger) + 40
        with self._lock:
            self.total += 1
            if not self.tail and len(self.head) < MAX_LINES - TAIL_LINES and self.head_bytes + size <= MAX_BYTES - TAIL_BYTES:
                self.head.append(line)
                self.head_bytes += size
            else:
                self.tail.append((line, size))
                self.tail_bytes += size
                while self.tail and (len(self.tail) > TAIL_LINES or self.tail_bytes > TAIL_BYTES):
                    _, s = self.tail.popleft()
                    self.tail_bytes -= s
                    self.dropped += 1
        self.maybe_flush()

    def emit(self, record: logging.LogRecord):
        if record.thread != self.thread:
            return
        if record.name.split(".")[0] in QUIET_LOGGERS and record.levelno < logging.WARNING:
            return
        try:
            text = record.getMessage()
            if record.exc_info:
                text += "\n" + logging.Formatter().formatException(record.exc_info)
            self.add(record.levelname, text, logger=record.name, ts=record.created)
        except Exception:  # noqa: BLE001 — a log line must never break the job
            self.handleError(record)

    # The stored form -------------------------------------------------------------------------------------------
    def lines(self) -> list[list]:
        with self._lock:
            out = list(self.head)
            if self.dropped:
                out.append([out[-1][0] if out else _now_iso(), "INFO", "log", f"… {self.dropped} lines left out (the log keeps at most {MAX_LINES} lines, {MAX_BYTES // 1000} KB) …"])
            out += [line for line, _ in self.tail]
            return out

    @property
    def size(self) -> int:
        return self.head_bytes + self.tail_bytes

    def save(self):
        """Write the RunLog now (create or replace). Never raises."""
        if self.run is None or self.run.pk is None:
            return
        from .models import RunLog

        try:
            RunLog.objects.update_or_create(run_id=self.run.pk, defaults={
                "lines": self.lines(), "line_count": self.total, "dropped": self.dropped, "bytes": self.size})
        except Exception:  # noqa: BLE001 — the run's record matters more than its log
            logging.getLogger(__name__).warning("could not save the log of run #%s", self.run.pk, exc_info=False)

    def maybe_flush(self):
        """While the run goes on: write the log every FLUSH_SECONDS, but only outside a transaction."""
        if threading.get_ident() != self.thread or time.monotonic() - self._last_flush < FLUSH_SECONDS:
            return
        from django.db import connection

        if connection.in_atomic_block:
            return
        self._last_flush = time.monotonic()
        root = logging.getLogger()
        root.removeHandler(self)  # the save's own records (if any) are not part of the job's log
        try:
            self.save()
        finally:
            root.addHandler(self)


@contextmanager
def capture(run):
    """Collect the run's log lines while the block runs; the caller saves (`Capture.save`) when the run is recorded."""
    cap = Capture(run)
    root = logging.getLogger()
    old_level = root.level
    if root.level == logging.NOTSET or root.level > LEVEL:
        root.setLevel(LEVEL)  # only while it runs; handlers that were there keep their own levels
    # Loggers configured quieter than INFO (httpx in hosted settings) keep their level: their INFO lines never come.
    root.addHandler(cap)
    try:
        yield cap
    finally:
        root.removeHandler(cap)
        root.setLevel(old_level)


def prune(now=None, days: int = KEEP_DAYS) -> int:
    """Delete logs of runs older than `days`. → how many."""
    from datetime import timedelta

    from django.utils import timezone

    from .models import RunLog

    cutoff = (now or timezone.now()) - timedelta(days=days)
    n, _ = RunLog.objects.filter(created_at__lt=cutoff).delete()
    return n
