"""/ops/: the operations console (staff only; actions need ops_operator; ADR 0028, redesigned by ADR 0031).

Seven pages in the sidebar (Dashboard, New events, Jobs, Runs, Work, Releases, Docs; ADR 0033 added New events) and the pages they link to: a job, a run, a
task, a Revision, a release, an action and the action log. The old addresses redirect to their new places.
"""

from django.urls import path

from . import views

app_name = "opsconsole"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("new/", views.new_events, name="new_events"),
    path("jobs/", views.jobs, name="jobs"),
    path("jobs/<str:name>/", views.job_detail, name="job"),
    path("runs/", views.runs, name="runs"),
    path("runs/<int:pk>/", views.run_detail, name="run"),
    path("work/", views.work, name="work"),
    path("work/<str:kind>/", views.work_kind, name="work_kind"),
    path("tasks/<int:pk>/", views.task_detail, name="task"),
    path("changes/<int:pk>/", views.revision_detail, name="revision"),
    path("releases/", views.releases, name="releases"),
    path("releases/unreleased/", views.unreleased, name="unreleased"),
    path("releases/<str:version>/", views.release_detail, name="release"),
    path("docs/", views.docs_index, name="docs"),
    path("docs/<str:section>/<path:slug>/", views.doc, name="doc"),
    path("actions/", views.action_list, name="actions"),
    path("actions/<int:pk>/", views.action_detail, name="action"),
    path("actions/<int:pk>/cancel/", views.action_cancel, name="action_cancel"),
    path("act/<str:kind>/", views.act, name="act"),
    path("act/<str:kind>/confirm/", views.confirm, name="confirm"),
    # Where the first console's pages were.
    path("tasks/", views.moved("opsconsole:work"), name="old_tasks"),
    path("programs/", views.moved("opsconsole:dashboard"), name="old_programs"),
    path("changes/", views.moved("opsconsole:unreleased"), name="old_changes"),
    path("releases/<str:version>/changes/", views.moved("opsconsole:release", "version"), name="old_release_changes"),
]
