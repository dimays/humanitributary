"""Admin writes are canonical writes too: every add, change, delete and bulk action in the admin runs inside
revising("human:<username>"), so the owner's edits leave Revisions like any agent's (docs/adr/0006)."""

from revisions import revising


class RevisedAdmin:
    def _revising(self, request):
        return revising(f"human:{request.user.get_username() or 'admin'}", reason=f"admin {request.method} {request.path}")

    def changeform_view(self, request, *args, **kwargs):
        with self._revising(request):
            return super().changeform_view(request, *args, **kwargs)

    def delete_view(self, request, *args, **kwargs):
        with self._revising(request):
            return super().delete_view(request, *args, **kwargs)

    def changelist_view(self, request, *args, **kwargs):  # bulk actions and list_editable
        with self._revising(request):
            return super().changelist_view(request, *args, **kwargs)
