from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Transaction, Referral, Task, TaskCompletion,
    MMFPlan, Investment, Withdrawal, KYC, FraudFlag, LiveFeedItem
)

User = get_user_model()


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'promo_code', 'is_admin', 'is_agent', 'balance',
                  'mpesa_withdrawal_number', 'kyc_status', 'is_suspended', 'created_at']
        read_only_fields = ['id', 'promo_code', 'created_at']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    password_confirmation = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError('Email already registered.')
        return value.lower()

    def validate(self, data):
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError({'password_confirmation': 'Passwords do not match.'})
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


# ─── User / Profile ──────────────────────────────────────────────────────────

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'promo_code', 'mpesa_withdrawal_number',
                  'kyc_status', 'selfie_url', 'created_at']
        read_only_fields = ['id', 'email', 'promo_code', 'created_at']


class UpdateMpesaSerializer(serializers.Serializer):
    mpesa_number = serializers.CharField(max_length=15)


class KYCSerializer(serializers.Serializer):
    id_number = serializers.CharField()
    id_type = serializers.CharField()
    full_name = serializers.CharField()
    date_of_birth = serializers.DateField()


# ─── Transactions ─────────────────────────────────────────────────────────────

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'type', 'description', 'amount', 'created_at']


# ─── Referrals ────────────────────────────────────────────────────────────────

class ReferralSerializer(serializers.ModelSerializer):
    referred_user_email = serializers.EmailField(source='referred_user.email', read_only=True)

    class Meta:
        model = Referral
        fields = ['id', 'referred_user_email', 'bonus_amount', 'status', 'created_at']


# ─── Tasks ───────────────────────────────────────────────────────────────────

class TaskSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='task_id')
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'type', 'title', 'reward', 'duration', 'platform', 'day', 'is_active', 'completed']

    def get_completed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        from django.utils import timezone
        today = timezone.localtime(timezone.now()).date()
        return TaskCompletion.objects.filter(user=request.user, task=obj, completed_date=today).exists()


class AdminTaskSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='task_id')

    class Meta:
        model = Task
        fields = ['id', 'type', 'title', 'reward', 'duration', 'platform', 'day', 'is_active', 'created_at']


class CreateTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['task_id', 'type', 'title', 'reward', 'duration', 'platform', 'day', 'is_active']

    def validate_task_id(self, value):
        if Task.objects.filter(task_id=value).exists():
            raise serializers.ValidationError('Task ID already exists.')
        return value


# ─── MMF ─────────────────────────────────────────────────────────────────────

class MMFPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MMFPlan
        fields = ['id', 'name', 'min_invest', 'max_invest', 'return_percent', 'duration_type', 'is_active']


class InvestmentSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    duration_type = serializers.CharField(source='plan.duration_type', read_only=True)

    class Meta:
        model = Investment
        fields = ['id', 'plan_name', 'amount', 'return_percent', 'status',
                  'start_date', 'maturity_date', 'duration_type', 'expected_return']


class CreateInvestmentSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)


# ─── Withdrawals ─────────────────────────────────────────────────────────────

class WithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Withdrawal
        fields = ['id', 'amount', 'status', 'mpesa_number', 'created_at', 'processed_at']


class AdminWithdrawalSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Withdrawal
        fields = ['id', 'user_email', 'amount', 'mpesa_number', 'status', 'created_at', 'processed_at']


class RequestWithdrawalSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    mpesa_number = serializers.CharField(max_length=15)


# ─── Live Feed ────────────────────────────────────────────────────────────────

class LiveFeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveFeedItem
        fields = ['id', 'type', 'user_name', 'action', 'timestamp']


# ─── Fraud ───────────────────────────────────────────────────────────────────

class FraudFlagSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = FraudFlag
        fields = ['id', 'user_id', 'user_email', 'flag_type', 'severity', 'description', 'investigated', 'created_at']


# ─── Admin User ──────────────────────────────────────────────────────────────

class AdminUserSerializer(serializers.ModelSerializer):
    referral_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'balance', 'is_admin', 'is_agent', 'kyc_status',
                  'referral_count', 'created_at', 'is_suspended', 'promo_code']

    def get_referral_count(self, obj):
        return obj.referrals_made.count()


class CreateAdminUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
    is_admin = serializers.BooleanField(default=False)

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError('Email already registered.')
        return value.lower()


class MpesaPayRegistrationSerializer(serializers.Serializer):
    mpesa_number = serializers.CharField(max_length=15)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
