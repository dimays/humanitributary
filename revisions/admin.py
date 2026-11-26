from django.contrib import admin

from .models import Revision


@admin.register(Revision)
class RevisionAdmin(admin.ModelAdmin):
    list_display = ["id", "at", "actor", "action", "table_name", "row_pk", "changed", "task_id", "reason"]
    list_filter = ["actor_kind", "action", "table_name", "actor"]
    search_fields = ["row_pk", "actor", "reason"]
    date_hierarchy = "at"
    readonly_fields = [f.name for f in Revision._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
