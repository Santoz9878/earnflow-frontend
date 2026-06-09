"""
Management command to seed initial data:
  - Demo admin user
  - 10 normal users
  - MMF plans
  - Weekly tasks
  - Live feed items

Usage:
  python manage.py seed
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.models import MMFPlan, Task, LiveFeedItem, Transaction, Referral
import random

User = get_user_model()

TASKS = [
    {'task_id': 'mon-1', 'type': 'video', 'platform': 'youtube', 'title': 'YouTube Video 1', 'reward': 20, 'duration': 30, 'day': 'monday'},
    {'task_id': 'mon-2', 'type': 'video', 'platform': 'youtube', 'title': 'YouTube Video 2', 'reward': 20, 'duration': 30, 'day': 'monday'},
    {'task_id': 'mon-3', 'type': 'video', 'platform': 'youtube', 'title': 'YouTube Video 3', 'reward': 20, 'duration': 30, 'day': 'monday'},
    {'task_id': 'tue-1', 'type': 'survey', 'platform': '', 'title': 'Customer Feedback Survey', 'reward': 12, 'duration': 120, 'day': 'tuesday'},
    {'task_id': 'tue-2', 'type': 'survey', 'platform': '', 'title': 'Product Preference Poll', 'reward': 12, 'duration': 90, 'day': 'tuesday'},
    {'task_id': 'tue-3', 'type': 'survey', 'platform': '', 'title': 'Market Research Survey', 'reward': 12, 'duration': 150, 'day': 'tuesday'},
    {'task_id': 'tue-4', 'type': 'survey', 'platform': '', 'title': 'User Experience Survey', 'reward': 12, 'duration': 100, 'day': 'tuesday'},
    {'task_id': 'tue-5', 'type': 'survey', 'platform': '', 'title': 'Brand Awareness Poll', 'reward': 12, 'duration': 80, 'day': 'tuesday'},
    {'task_id': 'wed-1', 'type': 'video', 'platform': 'tiktok', 'title': 'TikTok Video 1', 'reward': 15, 'duration': 25, 'day': 'wednesday'},
    {'task_id': 'wed-2', 'type': 'video', 'platform': 'tiktok', 'title': 'TikTok Video 2', 'reward': 15, 'duration': 25, 'day': 'wednesday'},
    {'task_id': 'wed-3', 'type': 'video', 'platform': 'tiktok', 'title': 'TikTok Video 3', 'reward': 15, 'duration': 25, 'day': 'wednesday'},
    {'task_id': 'wed-4', 'type': 'video', 'platform': 'tiktok', 'title': 'TikTok Video 4', 'reward': 15, 'duration': 25, 'day': 'wednesday'},
    {'task_id': 'thu-1', 'type': 'ad', 'platform': '', 'title': 'Sponsored Ad 1', 'reward': 10, 'duration': 10, 'day': 'thursday'},
    {'task_id': 'thu-2', 'type': 'ad', 'platform': '', 'title': 'Sponsored Ad 2', 'reward': 10, 'duration': 10, 'day': 'thursday'},
    {'task_id': 'thu-3', 'type': 'ad', 'platform': '', 'title': 'Sponsored Ad 3', 'reward': 10, 'duration': 10, 'day': 'thursday'},
    {'task_id': 'thu-4', 'type': 'ad', 'platform': '', 'title': 'Sponsored Ad 4', 'reward': 10, 'duration': 10, 'day': 'thursday'},
    {'task_id': 'thu-5', 'type': 'ad', 'platform': '', 'title': 'Sponsored Ad 5', 'reward': 10, 'duration': 10, 'day': 'thursday'},
    {'task_id': 'thu-6', 'type': 'ad', 'platform': '', 'title': 'Sponsored Ad 6', 'reward': 10, 'duration': 10, 'day': 'thursday'},
    {'task_id': 'fri-1', 'type': 'trivia', 'platform': '', 'title': 'Trivia Round 1', 'reward': 20, 'duration': 300, 'day': 'friday'},
    {'task_id': 'fri-2', 'type': 'trivia', 'platform': '', 'title': 'Trivia Round 2', 'reward': 20, 'duration': 300, 'day': 'friday'},
    {'task_id': 'fri-3', 'type': 'trivia', 'platform': '', 'title': 'Trivia Round 3', 'reward': 20, 'duration': 300, 'day': 'friday'},
]

MMF_PLANS = [
    {'name': 'Bronze', 'min_invest': 500, 'max_invest': 5000, 'return_percent': 10, 'duration_type': '24h'},
    {'name': 'Silver', 'min_invest': 1000, 'max_invest': 10000, 'return_percent': 20, 'duration_type': '48h'},
    {'name': 'Gold', 'min_invest': 5000, 'max_invest': 50000, 'return_percent': 30, 'duration_type': 'weekly'},
]

NORMAL_USERS = [
    {'email': 'john.doe@gmail.com',     'password': 'pass1234', 'balance': 1450, 'mpesa': '0712345001'},
    {'email': 'mary.wanjiku@gmail.com', 'password': 'pass1234', 'balance': 850,  'mpesa': '0722345002'},
    {'email': 'peter.kamau@gmail.com',  'password': 'pass1234', 'balance': 2300, 'mpesa': '0733345003'},
    {'email': 'alice.njeri@gmail.com',  'password': 'pass1234', 'balance': 600,  'mpesa': '0712345004'},
    {'email': 'bob.otieno@gmail.com',   'password': 'pass1234', 'balance': 3100, 'mpesa': '0722345005'},
    {'email': 'grace.muthoni@gmail.com','password': 'pass1234', 'balance': 750,  'mpesa': '0733345006'},
    {'email': 'james.kariuki@gmail.com','password': 'pass1234', 'balance': 1200, 'mpesa': '0712345007'},
    {'email': 'linda.auma@gmail.com',   'password': 'pass1234', 'balance': 980,  'mpesa': '0722345008'},
    {'email': 'kevin.mwangi@gmail.com', 'password': 'pass1234', 'balance': 4200, 'mpesa': '0733345009'},
    {'email': 'sarah.chebet@gmail.com', 'password': 'pass1234', 'balance': 1650, 'mpesa': '0712345010'},
]


class Command(BaseCommand):
    help = 'Seed the database with demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...\n')

        # ── Admin user ──────────────────────────────────────────────
        if not User.objects.filter(email='demo@earnflow.com').exists():
            admin = User.objects.create_user(
                email='demo@earnflow.com',
                password='demo1234',
                is_admin=True,
                is_staff=True,
                is_superuser=True,
                balance=5000,
            )
            admin.promo_code = 'DEMO123'
            admin.save()
            self.stdout.write(self.style.SUCCESS('  ✓ Admin: demo@earnflow.com / demo1234'))
        else:
            self.stdout.write('  - Admin user already exists')

        # ── Normal users ────────────────────────────────────────────
        self.stdout.write('\nCreating normal users...')
        created_users = []
        for u in NORMAL_USERS:
            if User.objects.filter(email=u['email']).exists():
                self.stdout.write(f'  - {u["email"]} already exists')
                continue

            user = User.objects.create_user(
                email=u['email'],
                password=u['password'],
                balance=u['balance'],
                mpesa_withdrawal_number=u['mpesa'],
                is_admin=False,
            )

            # Give each user a signup bonus transaction
            Transaction.objects.create(
                user=user,
                type='credit',
                description='Signup Bonus',
                amount=100,
            )
            # Add some random task earning transactions to make it realistic
            earning_descriptions = [
                'YouTube Video Task', 'Survey Completed', 'TikTok Video Task',
                'Ad Click Reward', 'Trivia Round Reward',
            ]
            for _ in range(random.randint(2, 5)):
                Transaction.objects.create(
                    user=user,
                    type='credit',
                    description=random.choice(earning_descriptions),
                    amount=random.choice([10, 12, 15, 20]),
                )

            created_users.append(user)
            self.stdout.write(self.style.SUCCESS(
                f'  ✓ {u["email"]} | balance: KES {u["balance"]} | password: {u["password"]}'
            ))

        # ── Referrals between some users ────────────────────────────
        if created_users and len(created_users) >= 3:
            referrer = created_users[0]
            for referred in created_users[1:4]:
                if not Referral.objects.filter(referred_user=referred).exists():
                    Referral.objects.create(
                        referrer=referrer,
                        referred_user=referred,
                        bonus_amount=200,
                        status=random.choice(['pending', 'credited']),
                    )
            self.stdout.write(self.style.SUCCESS(f'\n  ✓ Referral links created for {referrer.email}'))

        # ── MMF Plans ───────────────────────────────────────────────
        self.stdout.write('\nCreating MMF plans...')
        for plan_data in MMF_PLANS:
            plan, created = MMFPlan.objects.get_or_create(name=plan_data['name'], defaults=plan_data)
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ MMF Plan: {plan.name}'))
            else:
                self.stdout.write(f'  - MMF Plan {plan.name} already exists')

        # ── Tasks ────────────────────────────────────────────────────
        self.stdout.write('\nCreating tasks...')
        for task_data in TASKS:
            task, created = Task.objects.get_or_create(task_id=task_data['task_id'], defaults=task_data)
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {task.task_id} - {task.title}'))

        # ── Live feed ────────────────────────────────────────────────
        if LiveFeedItem.objects.count() == 0:
            samples = [
                {'type': 'referral',    'user_name': 'John D.',  'action': 'earned KES 200 from referral'},
                {'type': 'withdrawal',  'user_name': 'Mary W.',  'action': 'withdrew KES 1000'},
                {'type': 'investment',  'user_name': 'Peter K.', 'action': 'invested KES 500 in Bronze plan'},
                {'type': 'task',        'user_name': 'Alice N.', 'action': 'completed task and earned KES 20'},
                {'type': 'referral',    'user_name': 'Bob O.',   'action': 'earned KES 200 from referral'},
                {'type': 'investment',  'user_name': 'Grace M.', 'action': 'invested KES 1000 in Silver plan'},
                {'type': 'task',        'user_name': 'James K.', 'action': 'completed task and earned KES 15'},
                {'type': 'withdrawal',  'user_name': 'Linda A.', 'action': 'withdrew KES 550'},
            ]
            for s in samples:
                LiveFeedItem.objects.create(**s)
            self.stdout.write(self.style.SUCCESS('\n  ✓ Live feed seeded'))

        # ── Summary ──────────────────────────────────────────────────
        self.stdout.write(self.style.SUCCESS('\n✅ Seeding complete!\n'))
        self.stdout.write('Admin login:')
        self.stdout.write('  demo@earnflow.com  /  demo1234\n')
        self.stdout.write('Normal user logins (all password: pass1234):')
        for u in NORMAL_USERS:
            self.stdout.write(f'  {u["email"]}')
