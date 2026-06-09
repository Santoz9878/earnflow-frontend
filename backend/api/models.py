from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import random
import string


def generate_promo_code():
    """Generate a unique 8-character promo code."""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=8))


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    promo_code = models.CharField(max_length=20, unique=True, blank=True)
    is_admin = models.BooleanField(default=False)
    is_agent = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_suspended = models.BooleanField(default=False)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mpesa_withdrawal_number = models.CharField(max_length=15, blank=True, null=True)
    kyc_status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('submitted', 'Submitted'), ('verified', 'Verified'), ('rejected', 'Rejected')],
        default='pending'
    )
    selfie_url = models.ImageField(upload_to='selfies/', blank=True, null=True)
    registration_paid = models.BooleanField(default=False)
    # Fraud tracking
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def save(self, *args, **kwargs):
        if not self.promo_code:
            code = generate_promo_code()
            while User.objects.filter(promo_code=code).exists():
                code = generate_promo_code()
            self.promo_code = code
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


class Transaction(models.Model):
    TYPE_CHOICES = [('credit', 'Credit'), ('debit', 'Debit')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.type} {self.amount}'


class Referral(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('credited', 'Credited'), ('rejected', 'Rejected')]
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referred_user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referred_by_referral')
    bonus_amount = models.DecimalField(max_digits=10, decimal_places=2, default=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    credited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.referrer.email} referred {self.referred_user.email}'


class Task(models.Model):
    TYPE_CHOICES = [('video', 'Video'), ('survey', 'Survey'), ('ad', 'Ad'), ('trivia', 'Trivia')]
    DAY_CHOICES = [
        ('monday', 'Monday'), ('tuesday', 'Tuesday'), ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'), ('friday', 'Friday'),
    ]
    task_id = models.CharField(max_length=20, unique=True)  # e.g. mon-1
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    reward = models.DecimalField(max_digits=8, decimal_places=2)
    duration = models.IntegerField(default=30, help_text='Duration in seconds')
    platform = models.CharField(max_length=50, blank=True)
    day = models.CharField(max_length=20, choices=DAY_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.day} - {self.title}'


class TaskCompletion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_completions')
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)
    reward_credited = models.DecimalField(max_digits=8, decimal_places=2)
    completed_date = models.DateField(null=True, blank=True)  # date-scoped uniqueness

    class Meta:
        # Allow the same task to be completed on different days (weekly recurrence)
        unique_together = ('user', 'task', 'completed_date')

    def __str__(self):
        return f'{self.user.email} completed {self.task.title}'


class MMFPlan(models.Model):
    DURATION_CHOICES = [('24h', '24 Hours'), ('48h', '48 Hours'), ('weekly', 'Weekly')]
    name = models.CharField(max_length=50)
    min_invest = models.DecimalField(max_digits=12, decimal_places=2)
    max_invest = models.DecimalField(max_digits=12, decimal_places=2)
    return_percent = models.DecimalField(max_digits=5, decimal_places=2)
    duration_type = models.CharField(max_length=20, choices=DURATION_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} - {self.return_percent}%'


class Investment(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('completed', 'Completed'), ('cancelled', 'Cancelled')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='investments')
    plan = models.ForeignKey(MMFPlan, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    return_percent = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    start_date = models.DateTimeField(auto_now_add=True)
    maturity_date = models.DateTimeField()
    payout_date = models.DateTimeField(null=True, blank=True)
    expected_return = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.email} - {self.plan.name} {self.amount}'


class Withdrawal(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('processed', 'Processed'), ('rejected', 'Rejected')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    mpesa_number = models.CharField(max_length=15)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.amount} ({self.status})'


class KYC(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc')
    id_number = models.CharField(max_length=50)
    id_type = models.CharField(max_length=30)
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'KYC for {self.user.email}'


class FraudFlag(models.Model):
    SEVERITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]
    FLAG_TYPES = [
        ('multiple_referrals_same_ip', 'Multiple Referrals Same IP'),
        ('rapid_account_creation', 'Rapid Account Creation'),
        ('task_completion_abuse', 'Task Completion Abuse'),
        ('rapid_withdrawal', 'Rapid Withdrawal'),
        ('suspicious_balance', 'Suspicious Balance'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fraud_flags')
    flag_type = models.CharField(max_length=50, choices=FLAG_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='medium')
    description = models.TextField(blank=True)
    investigated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.email} - {self.flag_type}'


class LiveFeedItem(models.Model):
    TYPE_CHOICES = [('referral', 'Referral'), ('withdrawal', 'Withdrawal'), ('investment', 'Investment'), ('task', 'Task')]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    user_name = models.CharField(max_length=100)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.user_name} - {self.action}'


class UserLoginLog(models.Model):
    """Track login IPs and devices for fraud detection."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_logs')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
