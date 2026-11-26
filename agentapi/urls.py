from django.urls import path

from . import views

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
]
