from django.urls import path
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────
    path('auth/register', views.register),
    path('auth/login', views.login),
    path('auth/forgot-password', views.forgot_password),

    # ── M-Pesa ────────────────────────────────────────────────────
    path('mpesa/pay-registration', views.mpesa_pay_registration),

    # ── User Profile ──────────────────────────────────────────────
    path('user/profile', views.get_profile),
    path('user/update-mpesa', views.update_mpesa),
    path('user/profile/selfie', views.upload_selfie),
    path('user/kyc/submit', views.submit_kyc),
    path('user/balance', views.get_balance),

    # ── Transactions & Wallet ─────────────────────────────────────
    path('transactions', views.get_transactions),
    path('withdraw/request', views.request_withdrawal),
    path('withdraw/history', views.get_withdrawal_history),

    # ── Tasks ─────────────────────────────────────────────────────
    path('tasks/today', views.get_today_tasks),
    path('tasks/today/earnings', views.get_today_earnings),
    path('tasks/<str:task_id>/complete', views.complete_task),

    # ── Referrals ─────────────────────────────────────────────────
    path('referrals/stats', views.get_referral_stats),
    path('referrals', views.get_referrals),

    # ── MMF ───────────────────────────────────────────────────────
    path('mmf/plans', views.get_mmf_plans),
    path('mmf/invest', views.create_investment),
    path('mmf/investments', views.get_investments),

    # ── Live Feed ─────────────────────────────────────────────────
    path('live-feed', views.get_live_feed),

    # ── Public Stats ──────────────────────────────────────────────
    path('stats', views.get_public_stats),

    # ── Admin — Users ─────────────────────────────────────────────
    path('admin/users', views.admin_users),
    path('admin/users/<int:user_id>/suspend', views.admin_suspend_user),
    path('admin/users/<int:user_id>/credit', views.admin_credit_user),
    path('admin/users/<int:user_id>/debit', views.admin_debit_user),

    # ── Admin — Referrals ─────────────────────────────────────────
    path('admin/referrals/<int:referral_id>/approve', views.admin_approve_referral),

    # ── Admin — Tasks ─────────────────────────────────────────────
    path('admin/tasks', views.admin_tasks),
    path('admin/tasks/<str:task_id>', views.admin_task_detail),

    # ── Admin — MMF Plans ─────────────────────────────────────────
    path('admin/mmf/plans', views.admin_mmf_plans),
    path('admin/mmf/plans/<int:plan_id>/toggle', views.admin_toggle_mmf_plan),
    path('admin/mmf/plans/<int:plan_id>', views.admin_update_mmf_plan),

    # ── Admin — Withdrawals ───────────────────────────────────────
    path('admin/withdrawals/pending', views.admin_pending_withdrawals),
    path('admin/withdrawals/<int:withdrawal_id>/approve', views.admin_approve_withdrawal),
    path('admin/withdrawals/<int:withdrawal_id>/reject', views.admin_reject_withdrawal),

    # ── Admin — Reports ───────────────────────────────────────────
    path('admin/reports/revenue', views.admin_revenue_report),
    path('admin/stats', views.admin_platform_stats),

    # ── Admin — Fraud ─────────────────────────────────────────────
    path('admin/fraud/flags', views.admin_fraud_flags),
    path('admin/fraud/investigate/<int:user_id>', views.admin_investigate_user),
]
