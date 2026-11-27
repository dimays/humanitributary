"""Alerts: one email when a job has failed ALERT_AFTER_FAILURES runs in a row (docs/adr/0019-processes-and-
release-gates.md).

Counted per job and feed from FetchRun history, so nothing extra is stored: the alert goes out on exactly the Nth
consecutive failure (not again on the N+1th), and a success resets the count. Mail uses Django's settings: the console
backend locally (printed in the worker's output), SMTP or a provider in production. With no ALERT_EMAILS set it goes
to ADMINS, and with neither it is only logged. A paused job never alerts (it fails only when run by hand, and someone
is already looking at it); once resumed, its next failures count as usual.
"""

from django.conf import settings
from django.core.mail import mail_admins, send_mail

from ingest.models import FetchRun
from ingest.policy import mask_secrets


def consecutive_failures(job: str, feed_id: int | None) -> int:
    runs = FetchRun.objects.filter(job=job, feed_id=feed_id).exclude(status=FetchRun.Status.RUNNING).order_by("-started_at", "-id")
    n = 0
    for status in runs.values_list("status", flat=True)[: settings.ALERT_AFTER_FAILURES + 1]:
        if status != FetchRun.Status.FAILED:
            break
        n += 1
    return n


def after_failure(run: FetchRun, *, log=print) -> bool:
    """Called by the runner after a failed run. → True if an alert was sent."""
    from ingest.jobs import paused_jobs

    if run.job in paused_jobs():
        return False
    n = consecutive_failures(run.job, run.feed_id)
    if n != settings.ALERT_AFTER_FAILURES:
        return False
    name = run.job + (f" [{run.feed.name}]" if run.feed_id else "")
    subject = f"{settings.SITE_NAME}: {name} failed {n} runs in a row"
    body = mask_secrets(
        f"The job {name} has failed its last {n} runs.\n\nLatest run: {run.started_at:%Y-%m-%d %H:%M} UTC, FetchRun #{run.pk}\n\n"
        f"{(run.error or '(no error text)')[:4000]}\n\nSee /healthz and `manage.py run_jobs --list`; run it by hand with `manage.py run_job {run.job}`.\n"
    )
    try:
        if settings.ALERT_EMAILS:
            send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, settings.ALERT_EMAILS)
        elif settings.ADMINS:
            mail_admins(subject, body)
        else:
            log(f"ALERT (no ALERT_EMAILS or ADMINS set): {subject}")
            return False
    except Exception as e:  # noqa: BLE001 — an alert that can't be sent must never break the runner
        log(f"ALERT could not be sent ({type(e).__name__}): {subject}")
        return False
    log(f"alert sent: {subject}")
    return True
