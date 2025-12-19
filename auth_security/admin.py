from __future__ import annotations

from django.contrib import admin

from .models import (
    AuthIPBlock,
    AuthIPBlockEvent,
    AuthIPUnblockEvent,
    AuthLoginAttempt,
)


@admin.register(AuthLoginAttempt)
class AuthLoginAttemptAdmin(admin.ModelAdmin):
    list_display = ("created_at", "ip_address", "user_identifier", "reason", "succeeded")
    list_filter = ("reason", "succeeded", "created_at")
    search_fields = ("ip_address", "user_identifier", "path", "user_agent")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(AuthIPBlock)
class AuthIPBlockAdmin(admin.ModelAdmin):
    list_display = ("ip_address", "blocked_at", "blocked_until", "unblocked_at", "reason", "last_user_identifier")
    list_filter = ("reason", "blocked_at", "unblocked_at")
    search_fields = ("ip_address", "last_user_identifier")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-blocked_at",)


@admin.register(AuthIPBlockEvent)
class AuthIPBlockEventAdmin(admin.ModelAdmin):
    list_display = ("created_at", "ip_address", "reason", "blocked_until", "user_identifier")
    list_filter = ("created_at",)
    search_fields = ("ip_address", "user_identifier", "reason")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)

    def get_queryset(self, request):
        return super().get_queryset(request).filter(action="block")


@admin.register(AuthIPUnblockEvent)
class AuthIPUnblockEventAdmin(admin.ModelAdmin):
    list_display = ("created_at", "ip_address", "reason", "user_identifier")
    list_filter = ("created_at",)
    search_fields = ("ip_address", "user_identifier", "reason")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)

    def get_queryset(self, request):
        return super().get_queryset(request).filter(action="unblock")

