from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Transaction, Referral, Task, TaskCompletion,
    MMFPlan, Investment, Withdrawal, KYC, FraudFlag, LiveFeedItem
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'promo_code', 'balance', 'is_admin', 'is_suspended', 'created_at']
    list_filter = ['is_admin', 'is_suspended', 'kyc_status']
    search_fields = ['email', 'promo_code']
    ordering = ['-created_at']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Info', {'fields': ('promo_code', 'balance', 'mpesa_withdrawal_number', 'kyc_status')}),
        ('Permissions', {'fields': ('is_admin', 'is_agent', 'is_staff', 'is_active', 'is_suspended', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {'fields': ('email', 'password1', 'password2', 'is_admin')}),
    )


admin.site.register(Transaction)
admin.site.register(Referral)
admin.site.register(Task)
admin.site.register(TaskCompletion)
admin.site.register(MMFPlan)
admin.site.register(Investment)
admin.site.register(Withdrawal)
admin.site.register(KYC)
admin.site.register(FraudFlag)
admin.site.register(LiveFeedItem)
