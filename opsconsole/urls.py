"""/ops/: the operations console (staff only; actions need ops_operator; docs/adr/0028-operations-console.md)."""

from django.urls import path

from . import views

app_name = "opsconsole"

urlpatterns = [
    path("", views.overview, name="overview"),
    path("runs/", views.runs, name="runs"),
    path("tasks/", views.tasks, name="tasks"),
    path("tasks/<int:pk>/", views.task_detail, name="task"),
    path("changes/", views.changes, name="changes"),
    path("changes/<int:pk>/", views.revision_detail, name="revision"),
    path("releases/", views.releases, name="releases"),
    path("releases/<str:version>/changes/", views.release_changes, name="release_changes"),
    path("programs/", views.programs, name="programs"),
    path("actions/", views.action_list, name="actions"),
    path("actions/<int:pk>/", views.action_detail, name="action"),
    path("actions/<int:pk>/cancel/", views.action_cancel, name="action_cancel"),
    path("act/<str:kind>/", views.act, name="act"),
    path("act/<str:kind>/confirm/", views.confirm, name="confirm"),
]
