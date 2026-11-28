from django.urls import path

from . import evidence, operations, policy, views

urlpatterns = [
    path("", views.index),
    path("schemas/<str:kind>", views.schema),
    path("tasks/next", views.next_task),
    path("tasks/claim", views.claim),
    path("tasks/<int:task_id>", views.task_detail),
    path("tasks/<int:task_id>/<str:action>", views.task_action),  # extend, complete, release, fail
    path("entries/<str:slug>", views.entry_detail),
    path("branches/<str:slug>", views.branch_detail),
    path("claims/<int:claim_id>", views.claim_detail),
    path("search", views.search),
    # Evidence packs (ADR 0036)
    path("documents", evidence.documents),
    path("documents/<int:doc_id>", evidence.documents),
    path("evidence/check-excerpt", evidence.check_excerpt),
    # The source policy for an agent's own reads (ADR 0042)
    path("policy", policy.policy),
    # A round's operations (ADR 0035)
    path("queue", operations.queue),
    path("edits/check", operations.edits_check),
    path("edits/apply", operations.edits_apply),
    path("releases/check", operations.releases_check),
    path("releases/publish", operations.releases_publish),
    path("rounds", operations.rounds),
    path("rounds/settings", operations.round_settings),
    path("rounds/<int:round_id>", operations.round_detail),
]
