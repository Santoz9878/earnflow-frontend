from django.utils import timezone
from django.conf import settings
from django.db.models import Sum, Count, Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from datetime import timedelta
from decimal import Decimal

from .models import (
    Transaction, Referral, Task, TaskCompletion,
    MMFPlan, Investment, Withdrawal, KYC, FraudFlag, LiveFeedItem, UserLoginLog
)
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ProfileSerializer, UpdateMpesaSerializer, KYCSerializer,
    TransactionSerializer, ReferralSerializer,
    TaskSerializer, AdminTaskSerializer, CreateTaskSerializer,
    MMFPlanSerializer, InvestmentSerializer, CreateInvestmentSerializer,
    WithdrawalSerializer, AdminWithdrawalSerializer, RequestWithdrawalSerializer,
    LiveFeedSerializer, FraudFlagSerializer,
    AdminUserSerializer, CreateAdminUserSerializer, MpesaPayRegistrationSerializer
)

User = get_user_model()

DAILY_TASK_SCHEDULE = {
    'monday': 'YouTube Videos',
    'tuesday': 'Surveys & Polls',
    'wednesday': 'TikTok Videos',
    'thursday': 'Click Ads (PTC)',
    'friday': 'Trivia Quiz',
}


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


def get_client_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def add_live_feed(type_, user_name, action):
    LiveFeedItem.objects.create(type=type_, user_name=user_name, action=action)


def check_fraud_flags(user, ip):
    """Run basic fraud checks after registration / login."""
    # Same IP referrals: if 3+ users registered from this IP in last hour
    one_hour_ago = timezone.now() - timedelta(hours=1)
    same_ip_count = UserLoginLog.objects.filter(
        ip_address=ip, created_at__gte=one_hour_ago
    ).values('user').distinct().count()

    if same_ip_count >= 3:
        FraudFlag.objects.get_or_create(
            user=user,
            flag_type='multiple_referrals_same_ip',
            defaults={'severity': 'high', 'description': f'Multiple accounts from IP {ip}'}
        )


# ═══════════════════════════════════════════════════════════════════
#  AUTH
# ═══════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Validation failed', 'errors': serializer.errors}, status=400)

    data = serializer.validated_data
    user = User.objects.create_user(
        email=data['email'],
        password=data['password'],
    )

    # Credit signup bonus
    user.balance += Decimal(settings.SIGNUP_BONUS)
    user.save()
    Transaction.objects.create(
        user=user, type='credit',
        description='Signup Bonus', amount=settings.SIGNUP_BONUS
    )

    # Handle referral
    referral_code = data.get('referral_code', '').strip()
    if referral_code:
        try:
            referrer = User.objects.get(promo_code=referral_code.upper())
            if referrer != user:
                Referral.objects.create(
                    referrer=referrer,
                    referred_user=user,
                    bonus_amount=settings.REFERRAL_BONUS,
                    status='pending'
                )
        except User.DoesNotExist:
            pass  # Invalid code — silently ignore

    # Log IP
    ip = get_client_ip(request)
    UserLoginLog.objects.create(user=user, ip_address=ip)
    check_fraud_flags(user, ip)

    token = get_tokens_for_user(user)
    return Response({
        'message': 'Registration successful',
        'user': UserSerializer(user).data,
        'access_token': token,
        'token_type': 'Bearer',
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Validation failed', 'errors': serializer.errors}, status=400)

    email = serializer.validated_data['email'].lower()
    password = serializer.validated_data['password']

    user = authenticate(request, username=email, password=password)
    if not user:
        return Response({'message': 'Invalid email or password'}, status=401)

    if user.is_suspended:
        return Response({'message': 'Your account has been suspended. Contact support.'}, status=403)

    # Log IP
    ip = get_client_ip(request)
    user.last_login_ip = ip
    user.save(update_fields=['last_login_ip'])
    UserLoginLog.objects.create(user=user, ip_address=ip)

    token = get_tokens_for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'access_token': token,
        'token_type': 'Bearer',
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    # In a real app, send a reset email. For now just acknowledge.
    email = request.data.get('email', '')
    # Don't reveal whether email exists
    return Response({'message': 'If that email is registered, a password reset link has been sent.'})


# ═══════════════════════════════════════════════════════════════════
#  M-PESA (stub — integrate real Daraja API here)
# ═══════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_pay_registration(request):
    serializer = MpesaPayRegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Validation failed', 'errors': serializer.errors}, status=400)

    # TODO: integrate Safaricom Daraja STK Push here
    # For now, simulate a successful payment
    return Response({
        'message': 'Payment initiated. Complete on your phone.',
        'checkout_request_id': f'ws_CO_DMZ_{timezone.now().timestamp():.0f}',
    })


# ═══════════════════════════════════════════════════════════════════
#  USER PROFILE
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    return Response(ProfileSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_mpesa(request):
    serializer = UpdateMpesaSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Validation failed', 'errors': serializer.errors}, status=400)

    request.user.mpesa_withdrawal_number = serializer.validated_data['mpesa_number']
    request.user.save(update_fields=['mpesa_withdrawal_number'])
    return Response({
        'message': 'M-Pesa number updated',
        'mpesa_withdrawal_number': request.user.mpesa_withdrawal_number,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_selfie(request):
    if 'selfie' not in request.FILES:
        return Response({'message': 'No selfie file provided'}, status=400)
    request.user.selfie_url = request.FILES['selfie']
    request.user.save(update_fields=['selfie_url'])
    return Response({'message': 'Selfie uploaded', 'selfie_url': request.build_absolute_uri(request.user.selfie_url.url)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_kyc(request):
    serializer = KYCSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Validation failed', 'errors': serializer.errors}, status=400)

    KYC.objects.update_or_create(
        user=request.user,
        defaults=serializer.validated_data
    )
    request.user.kyc_status = 'submitted'
    request.user.save(update_fields=['kyc_status'])
    return Response({'message': 'KYC submitted for verification', 'kyc_status': 'submitted'})


# ═══════════════════════════════════════════════════════════════════
#  WALLET & TRANSACTIONS
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_balance(request):
    return Response({'balance': float(request.user.balance), 'currency': 'KES'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    limit = int(request.query_params.get('limit', 50))
    offset = int(request.query_params.get('offset', 0))
    tx_type = request.query_params.get('type')

    qs = request.user.transactions.all()
    if tx_type in ('credit', 'debit'):
        qs = qs.filter(type=tx_type)

    total = qs.count()
    transactions = qs[offset:offset + limit]
    return Response({
        'transactions': TransactionSerializer(transactions, many=True).data,
        'total': total,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_withdrawal(request):
    serializer = RequestWithdrawalSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Validation failed', 'errors': serializer.errors}, status=400)

    amount = serializer.validated_data['amount']
    mpesa_number = serializer.validated_data['mpesa_number']

    if amount < settings.MIN_WITHDRAWAL:
        return Response({'message': f'Minimum withdrawal is KES {settings.MIN_WITHDRAWAL}'}, status=400)

    if request.user.balance < amount:
        return Response({'message': 'Insufficient balance'}, status=400)

    # Deduct from balance immediately and hold it
    request.user.balance -= amount
    request.user.save(update_fields=['balance'])

    withdrawal = Withdrawal.objects.create(
        user=request.user,
        amount=amount,
        mpesa_number=mpesa_number,
    )

    Transaction.objects.create(
        user=request.user, type='debit',
        description=f'Withdrawal Request - KES {amount}',
        amount=amount
    )

    add_live_feed('withdrawal', request.user.email.split('@')[0], f'requested withdrawal of KES {amount}')

    return Response({
        'message': 'Withdrawal request submitted',
        'withdrawal_id': withdrawal.id,
        'status': 'pending',
        'amount': float(amount),
        'mpesa_number': mpesa_number,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_withdrawal_history(request):
    withdrawals = request.user.withdrawals.all()
    return Response({'withdrawals': WithdrawalSerializer(withdrawals, many=True).data})


# ═══════════════════════════════════════════════════════════════════
#  TASKS
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_today_tasks(request):
    now = timezone.localtime(timezone.now())
    day_name = now.strftime('%A').lower()

    if day_name in ('saturday', 'sunday'):
        return Response({'day': day_name.capitalize(), 'title': 'Weekend', 'description': 'No tasks today. Enjoy your weekend!', 'tasks': []})

    tasks = Task.objects.filter(day=day_name, is_active=True)
    schedule_titles = {
        'monday': ('YouTube Videos', 'Watch 3 YouTube videos, earn Ksh 20 each'),
        'tuesday': ('Surveys & Polls', 'Complete 5 surveys, earn Ksh 12 each'),
        'wednesday': ('TikTok Videos', 'Watch 4 TikTok videos, earn Ksh 15 each'),
        'thursday': ('Click Ads (PTC)', 'View 6 ads, earn Ksh 10 each'),
        'friday': ('Trivia Quiz', 'Complete 3 trivia rounds, earn Ksh 20 each'),
    }
    title, description = schedule_titles.get(day_name, ('Tasks', 'Complete tasks to earn'))

    return Response({
        'day': day_name.capitalize(),
        'title': title,
        'description': description,
        'tasks': TaskSerializer(tasks, many=True, context={'request': request}).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_today_earnings(request):
    now = timezone.localtime(timezone.now())
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    today_earned = TaskCompletion.objects.filter(
        user=request.user,
        completed_at__gte=today_start
    ).aggregate(total=Sum('reward_credited'))['total'] or 0

    daily_limit = settings.DAILY_EARNING_LIMIT
    remaining = max(0, daily_limit - float(today_earned))

    return Response({
        'today_earned': float(today_earned),
        'daily_limit': daily_limit,
        'remaining': remaining,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_task(request, task_id):
    try:
        task = Task.objects.get(task_id=task_id, is_active=True)
    except Task.DoesNotExist:
        return Response({'message': 'Task not found'}, status=404)

    now = timezone.localtime(timezone.now())
    day_name = now.strftime('%A').lower()
    today_date = now.date()

    # Validate day
    if task.day != day_name:
        return Response({'message': 'This task is not available today'}, status=400)

    # Check already completed TODAY (date-scoped)
    if TaskCompletion.objects.filter(user=request.user, task=task, completed_date=today_date).exists():
        return Response({'message': 'Task already completed today'}, status=400)

    # Check daily limit
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_earned = TaskCompletion.objects.filter(
        user=request.user, completed_at__gte=today_start
    ).aggregate(total=Sum('reward_credited'))['total'] or 0

    if float(today_earned) >= settings.DAILY_EARNING_LIMIT:
        return Response({'message': f'Daily earning limit of KES {settings.DAILY_EARNING_LIMIT} reached'}, status=400)

    # Credit reward
    reward = task.reward  # keep as Decimal
    TaskCompletion.objects.create(
        user=request.user,
        task=task,
        reward_credited=reward,
        completed_date=today_date,
    )
    request.user.balance += reward
    request.user.save(update_fields=['balance'])

    Transaction.objects.create(
        user=request.user, type='credit',
        description=f'{task.title}', amount=reward
    )

    add_live_feed('task', request.user.email.split('@')[0], f'completed task and earned KES {reward:.0f}')

    return Response({
        'message': 'Task completed',
        'reward': float(reward),
        'new_balance': float(request.user.balance),
    })


# ═══════════════════════════════════════════════════════════════════
#  REFERRALS
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_referral_stats(request):
    referrals = Referral.objects.filter(referrer=request.user)
    total_earned = referrals.filter(status='credited').aggregate(
        total=Sum('bonus_amount'))['total'] or 0
    pending = referrals.filter(status='pending').count()

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')

    return Response({
        'totalReferrals': referrals.count(),
        'totalEarned': float(total_earned),
        'pendingApprovals': pending,
        'referral_link': f'{frontend_url}/register?ref={request.user.promo_code}',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_referrals(request):
    referrals = Referral.objects.filter(referrer=request.user)
    return Response({'referrals': ReferralSerializer(referrals, many=True).data})


# ═══════════════════════════════════════════════════════════════════
#  MMF INVESTMENTS
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mmf_plans(request):
    plans = MMFPlan.objects.filter(is_active=True)
    return Response({'plans': MMFPlanSerializer(plans, many=True).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_investment(request):
    serializer = CreateInvestmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Validation failed', 'errors': serializer.errors}, status=400)

    plan_id = serializer.validated_data['plan_id']
    amount = serializer.validated_data['amount']

    try:
        plan = MMFPlan.objects.get(id=plan_id, is_active=True)
    except MMFPlan.DoesNotExist:
        return Response({'message': 'Investment plan not found or inactive'}, status=404)

    if amount < plan.min_invest:
        return Response({'message': f'Minimum investment for {plan.name} is KES {plan.min_invest}'}, status=400)
    if amount > plan.max_invest:
        return Response({'message': f'Maximum investment for {plan.name} is KES {plan.max_invest}'}, status=400)
    if request.user.balance < amount:
        return Response({'message': 'Insufficient balance'}, status=400)

    # Calculate maturity date
    duration_map = {'24h': timedelta(hours=24), '48h': timedelta(hours=48), 'weekly': timedelta(weeks=1)}
    delta = duration_map.get(plan.duration_type, timedelta(hours=24))
    maturity_date = timezone.now() + delta
    expected_return = amount * plan.return_percent / 100

    # Deduct from balance
    request.user.balance -= amount
    request.user.save(update_fields=['balance'])

    investment = Investment.objects.create(
        user=request.user,
        plan=plan,
        amount=amount,
        return_percent=plan.return_percent,
        maturity_date=maturity_date,
        expected_return=expected_return,
    )

    Transaction.objects.create(
        user=request.user, type='debit',
        description=f'MMF Investment - {plan.name}',
        amount=amount
    )

    add_live_feed('investment', request.user.email.split('@')[0], f'invested KES {amount} in {plan.name} plan')

    return Response(InvestmentSerializer(investment).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_investments(request):
    investments = Investment.objects.filter(user=request.user).order_by('-created_at')
    # Auto-mature investments
    now = timezone.now()
    for inv in investments:
        if inv.status == 'active' and inv.maturity_date <= now:
            payout = inv.amount + inv.expected_return
            inv.status = 'completed'
            inv.payout_date = now
            inv.save(update_fields=['status', 'payout_date'])
            inv.user.balance += payout
            inv.user.save(update_fields=['balance'])
            Transaction.objects.create(
                user=inv.user, type='credit',
                description=f'MMF Maturity - {inv.plan.name} (Principal + {inv.return_percent}% return)',
                amount=payout
            )
    investments = Investment.objects.filter(user=request.user).order_by('-created_at')
    return Response({'investments': InvestmentSerializer(investments, many=True).data})


# ═══════════════════════════════════════════════════════════════════
#  LIVE FEED
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([AllowAny])
def get_live_feed(request):
    feed = LiveFeedItem.objects.all()[:20]
    return Response({'feed': LiveFeedSerializer(feed, many=True).data})


# ═══════════════════════════════════════════════════════════════════
#  LEADERBOARD / STATS (public)
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([AllowAny])
def get_public_stats(request):
    total_users = User.objects.filter(is_active=True).count()
    total_paid_out = Transaction.objects.filter(
        type='credit', description__icontains='withdrawal'
    ).aggregate(total=Sum('amount'))['total'] or 0
    active_investments = Investment.objects.filter(status='active').count()

    return Response({
        'total_users': total_users,
        'total_paid_out': float(total_paid_out),
        'active_investments': active_investments,
    })


# ═══════════════════════════════════════════════════════════════════
#  ADMIN — USERS
# ═══════════════════════════════════════════════════════════════════

def admin_required(view_func):
    """Decorator: require authenticated admin user."""
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({'message': 'Authentication required'}, status=401)
        if not request.user.is_admin:
            return Response({'message': 'Admin access required'}, status=403)
        return view_func(request, *args, **kwargs)
    wrapper.__name__ = view_func.__name__
    return wrapper


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_users(request):
    if request.method == 'GET':
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 50))
        search = request.query_params.get('search', '')

        qs = User.objects.all().order_by('-created_at')
        if search:
            qs = qs.filter(email__icontains=search)

        total = qs.count()
        offset = (page - 1) * limit
        users = qs[offset:offset + limit]

        return Response({
            'users': AdminUserSerializer(users, many=True).data,
            'total': total,
            'page': page,
            'limit': limit,
        })

    # POST — create user
    serializer = CreateAdminUserSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Validation failed', 'errors': serializer.errors}, status=400)

    data = serializer.validated_data
    user = User.objects.create_user(
        email=data['email'],
        password=data['password'],
        is_admin=data.get('is_admin', False),
        is_staff=data.get('is_admin', False),
    )
    return Response(AdminUserSerializer(user).data, status=201)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_suspend_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    user.is_suspended = not user.is_suspended
    user.save(update_fields=['is_suspended'])
    action = 'suspended' if user.is_suspended else 'unsuspended'
    return Response({'message': f'User {action}', 'user_id': user_id, 'is_suspended': user.is_suspended})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_credit_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    amount = request.data.get('amount')
    reason = request.data.get('reason', 'Manual credit')
    if not amount or float(amount) <= 0:
        return Response({'message': 'Valid amount required'}, status=400)

    user.balance += Decimal(str(amount))
    user.save(update_fields=['balance'])
    Transaction.objects.create(user=user, type='credit', description=f'Admin Credit: {reason}', amount=amount)

    return Response({'message': 'User credited', 'new_balance': float(user.balance)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_debit_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    amount = request.data.get('amount')
    reason = request.data.get('reason', 'Manual debit')
    if not amount or float(amount) <= 0:
        return Response({'message': 'Valid amount required'}, status=400)
    if user.balance < Decimal(str(amount)):
        return Response({'message': 'User has insufficient balance'}, status=400)

    user.balance -= Decimal(str(amount))
    user.save(update_fields=['balance'])
    Transaction.objects.create(user=user, type='debit', description=f'Admin Debit: {reason}', amount=amount)

    return Response({'message': 'User debited', 'new_balance': float(user.balance)})


# ═══════════════════════════════════════════════════════════════════
#  ADMIN — REFERRALS
# ═══════════════════════════════════════════════════════════════════

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_approve_referral(request, referral_id):
    try:
        referral = Referral.objects.get(id=referral_id, status='pending')
    except Referral.DoesNotExist:
        return Response({'message': 'Referral not found or already processed'}, status=404)

    referral.status = 'credited'
    referral.credited_at = timezone.now()
    referral.save()

    referral.referrer.balance += referral.bonus_amount
    referral.referrer.save(update_fields=['balance'])
    Transaction.objects.create(
        user=referral.referrer, type='credit',
        description=f'Referral Bonus - {referral.referred_user.email}',
        amount=referral.bonus_amount
    )
    add_live_feed('referral', referral.referrer.email.split('@')[0], f'earned KES {referral.bonus_amount} from referral')

    return Response({'message': 'Referral approved', 'bonus_credited': float(referral.bonus_amount)})


# ═══════════════════════════════════════════════════════════════════
#  ADMIN — TASKS
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_tasks(request):
    if request.method == 'GET':
        tasks = Task.objects.all().order_by('day', 'task_id')
        return Response({'tasks': AdminTaskSerializer(tasks, many=True).data})

    # POST — create task
    serializer = CreateTaskSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Validation failed', 'errors': serializer.errors}, status=400)
    task = serializer.save()
    return Response(AdminTaskSerializer(task).data, status=201)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_task_detail(request, task_id):
    try:
        task = Task.objects.get(task_id=task_id)
    except Task.DoesNotExist:
        return Response({'message': 'Task not found'}, status=404)

    if request.method == 'DELETE':
        task.delete()
        return Response({'message': 'Task deleted'})

    # PUT — update
    for field in ['title', 'reward', 'duration', 'platform', 'is_active']:
        if field in request.data:
            setattr(task, field, request.data[field])
    task.save()
    return Response(AdminTaskSerializer(task).data)


# ═══════════════════════════════════════════════════════════════════
#  ADMIN — MMF PLANS
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_mmf_plans(request):
    plans = MMFPlan.objects.all()
    return Response({'plans': MMFPlanSerializer(plans, many=True).data})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_toggle_mmf_plan(request, plan_id):
    try:
        plan = MMFPlan.objects.get(id=plan_id)
    except MMFPlan.DoesNotExist:
        return Response({'message': 'Plan not found'}, status=404)

    plan.is_active = not plan.is_active
    plan.save(update_fields=['is_active'])
    return Response({'message': 'Plan status updated', 'plan_id': plan_id, 'is_active': plan.is_active})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_update_mmf_plan(request, plan_id):
    try:
        plan = MMFPlan.objects.get(id=plan_id)
    except MMFPlan.DoesNotExist:
        return Response({'message': 'Plan not found'}, status=404)

    for field in ['return_percent', 'min_invest', 'max_invest', 'duration_type', 'name']:
        if field in request.data:
            setattr(plan, field, request.data[field])
    plan.save()
    return Response(MMFPlanSerializer(plan).data)


# ═══════════════════════════════════════════════════════════════════
#  ADMIN — WITHDRAWALS
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_pending_withdrawals(request):
    withdrawals = Withdrawal.objects.filter(status='pending').select_related('user')
    return Response({'withdrawals': AdminWithdrawalSerializer(withdrawals, many=True).data})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_approve_withdrawal(request, withdrawal_id):
    try:
        withdrawal = Withdrawal.objects.get(id=withdrawal_id, status='pending')
    except Withdrawal.DoesNotExist:
        return Response({'message': 'Withdrawal not found or already processed'}, status=404)

    transaction_id = request.data.get('transaction_id', '')
    withdrawal.status = 'processed'
    withdrawal.transaction_id = transaction_id
    withdrawal.processed_at = timezone.now()
    withdrawal.save()

    add_live_feed('withdrawal', withdrawal.user.email.split('@')[0], f'withdrew KES {withdrawal.amount}')

    return Response({'message': 'Withdrawal approved', 'status': 'processed'})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_reject_withdrawal(request, withdrawal_id):
    try:
        withdrawal = Withdrawal.objects.get(id=withdrawal_id, status='pending')
    except Withdrawal.DoesNotExist:
        return Response({'message': 'Withdrawal not found or already processed'}, status=404)

    reason = request.data.get('reason', 'Rejected by admin')
    # Refund the user
    withdrawal.user.balance += withdrawal.amount
    withdrawal.user.save(update_fields=['balance'])
    Transaction.objects.create(
        user=withdrawal.user, type='credit',
        description=f'Withdrawal Refund: {reason}',
        amount=withdrawal.amount
    )
    withdrawal.status = 'rejected'
    withdrawal.rejection_reason = reason
    withdrawal.processed_at = timezone.now()
    withdrawal.save()

    return Response({'message': 'Withdrawal rejected and amount refunded', 'status': 'rejected'})


# ═══════════════════════════════════════════════════════════════════
#  ADMIN — REPORTS & STATS
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_revenue_report(request):
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    qs = Transaction.objects.all()
    if start_date:
        qs = qs.filter(created_at__date__gte=start_date)
    if end_date:
        qs = qs.filter(created_at__date__lte=end_date)

    total_credits = qs.filter(type='credit').aggregate(total=Sum('amount'))['total'] or 0
    total_debits = qs.filter(type='debit').aggregate(total=Sum('amount'))['total'] or 0

    # Registration fees as revenue
    reg_revenue = total_debits  # simplified
    active_users = User.objects.filter(is_active=True, is_suspended=False).count()

    period = ''
    if start_date and end_date:
        period = f'{start_date} to {end_date}'

    return Response({
        'total_revenue': float(reg_revenue),
        'commission_earned': float(total_debits) * 0.25,
        'active_users': active_users,
        'new_users': User.objects.count(),
        'total_paid_out': float(total_credits),
        'period': period or 'All time',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_platform_stats(request):
    total_users = User.objects.count()
    total_balance = User.objects.aggregate(total=Sum('balance'))['total'] or 0
    total_invested = Investment.objects.filter(status='active').aggregate(total=Sum('amount'))['total'] or 0
    pending_withdrawals = Withdrawal.objects.filter(status='pending').aggregate(total=Sum('amount'))['total'] or 0
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    processed_today = Withdrawal.objects.filter(status='processed', processed_at__gte=today_start).count()
    active_investments = Investment.objects.filter(status='active').count()

    return Response({
        'total_users': total_users,
        'total_balance': float(total_balance),
        'total_invested_mmf': float(total_invested),
        'pending_withdrawals': float(pending_withdrawals),
        'processed_today': processed_today,
        'active_investments': active_investments,
    })


# ═══════════════════════════════════════════════════════════════════
#  ADMIN — FRAUD DETECTION
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_fraud_flags(request):
    flags = FraudFlag.objects.select_related('user').order_by('-created_at')
    return Response({'flags': FraudFlagSerializer(flags, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@admin_required
def admin_investigate_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    ip_addresses = list(
        UserLoginLog.objects.filter(user=user)
        .values_list('ip_address', flat=True)
        .distinct()
    )
    devices = list(
        UserLoginLog.objects.filter(user=user)
        .exclude(device_info='')
        .values_list('device_info', flat=True)
        .distinct()
    )

    # Check suspicious activities
    suspicious = []
    referral_count = user.referrals_made.count()
    if referral_count > 10:
        suspicious.append({'type': 'many_referrals', 'count': referral_count, 'timeframe': 'all time'})

    recent_withdrawals = Withdrawal.objects.filter(
        user=user, created_at__gte=timezone.now() - timedelta(hours=24)
    ).count()
    if recent_withdrawals > 3:
        suspicious.append({'type': 'rapid_withdrawal', 'count': recent_withdrawals, 'timeframe': '24 hours'})

    return Response({
        'user_id': user.id,
        'email': user.email,
        'balance': float(user.balance),
        'referral_count': referral_count,
        'ip_addresses': [ip for ip in ip_addresses if ip],
        'devices': devices,
        'suspicious_activities': suspicious,
    })
