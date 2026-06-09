# EarnFlow Backend

> Django REST Framework API powering the EarnFlow micro-earning platform.
>
> **Backend Engineer:** [@bytecortex00](https://github.com/bytecortex00)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Database Models](#database-models)
- [API Reference](#api-reference)
  - [Auth Endpoints](#auth-endpoints)
  - [User & Wallet Endpoints](#user--wallet-endpoints)
  - [Task Endpoints](#task-endpoints)
  - [Referral Endpoints](#referral-endpoints)
  - [MMF Investment Endpoints](#mmf-investment-endpoints)
  - [Public Endpoints](#public-endpoints)
  - [Admin Endpoints](#admin-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Business Logic](#business-logic)
- [Seeder Command](#seeder-command)
- [Configuration Reference](#configuration-reference)
- [Production Checklist](#production-checklist)

---

## Overview

This is a pure REST API backend. It has no frontend of its own — it serves JSON to the React frontend running at `http://localhost:5173`. All communication uses JWT Bearer tokens.

The backend handles:
- User registration and JWT-based login
- Daily task assignment and completion tracking (day-scoped, weekly-recurring)
- Wallet ledger (credits, debits, transaction history)
- MMF investment lifecycle (create → active → auto-mature on fetch)
- Referral tracking and bonus crediting
- Withdrawal request queue with admin approval flow
- Full admin management suite
- Basic fraud detection via IP tracking and pattern analysis

---

## Tech Stack

| Package | Purpose |
|---|---|
| Python 3.12 | Runtime |
| Django 6.x | Web framework, ORM, admin |
| Django REST Framework | API views, serializers, permissions |
| djangorestframework-simplejwt | JWT token issuance and validation |
| django-cors-headers | CORS headers for cross-origin frontend requests |
| SQLite (built-in) | Default database — swap to PostgreSQL for production |
| Pillow | Image processing for selfie/KYC photo uploads |

---

## Project Structure

```
backend/
├── manage.py
├── db.sqlite3                        ← auto-created on first migrate
├── media/                            ← uploaded files (selfies)
├── earnflow_backend/
│   ├── settings.py                   ← all Django configuration
│   ├── urls.py                       ← root URL router (mounts /api/ and /django-admin/)
│   └── wsgi.py
└── api/                              ← main application
    ├── models.py                     ← all 12 database models
    ├── serializers.py                ← DRF serializers for every model/endpoint
    ├── views.py                      ← all API view functions (grouped by domain)
    ├── urls.py                       ← URL patterns for every endpoint
    ├── admin.py                      ← registers models with Django admin UI
    ├── apps.py
    ├── migrations/
    │   ├── 0001_initial.py           ← initial schema
    │   └── 0002_...taskcompletion.py ← adds completed_date for weekly task recurrence
    └── management/
        └── commands/
            └── seed.py               ← seeds admin, 10 users, MMF plans, tasks, live feed
```

---

## Setup & Installation

### 1. Install dependencies

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow
```

Or if your system Python requires the `--break-system-packages` flag:

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow --break-system-packages
```

### 2. Run migrations

```bash
cd backend
python manage.py migrate
```

This creates `db.sqlite3` and applies all schema migrations.

### 3. Seed demo data

```bash
python manage.py seed
```

Creates: admin user, 10 normal users, 3 MMF plans, 24 tasks (Mon–Fri schedule), and sample live feed items.

### 4. Start the server

```bash
python manage.py runserver 8000
```

API is now available at `http://localhost:8000`.

---

## Database Models

All models live in `api/models.py`.

---

### `User`

Custom user model extending Django's `AbstractBaseUser`. Uses **email** as the username field.

| Field | Type | Notes |
|---|---|---|
| `email` | EmailField (unique) | Login identifier |
| `promo_code` | CharField (unique) | Auto-generated 8-char referral code on save |
| `balance` | DecimalField(12,2) | Current wallet balance in KES |
| `is_admin` | BooleanField | Grants access to all `/api/admin/*` endpoints |
| `is_agent` | BooleanField | Reserved for future agent role |
| `is_suspended` | BooleanField | Suspended users cannot log in |
| `mpesa_withdrawal_number` | CharField | M-Pesa number for payouts |
| `kyc_status` | CharField | `pending` / `submitted` / `verified` / `rejected` |
| `last_login_ip` | GenericIPAddressField | Recorded on each login |
| `device_info` | CharField | Optional device string |

**Promo code generation:** On first save, if `promo_code` is blank, the model generates a random 8-character alphanumeric code and retries until unique.

---

### `Transaction`

Immutable ledger entry. Every balance change (task reward, investment debit, referral bonus, withdrawal, admin credit/debit) creates a row here.

| Field | Type | Notes |
|---|---|---|
| `user` | FK → User | |
| `type` | CharField | `credit` or `debit` |
| `description` | CharField | Human-readable description |
| `amount` | DecimalField(12,2) | Always positive |
| `created_at` | DateTimeField | Auto-set |

---

### `Referral`

Tracks one user referring another.

| Field | Type | Notes |
|---|---|---|
| `referrer` | FK → User | The user who shared their promo code |
| `referred_user` | OneToOneField → User | The new user who used the code |
| `bonus_amount` | DecimalField | Default KES 200 |
| `status` | CharField | `pending` / `credited` / `rejected` |
| `credited_at` | DateTimeField | Set when admin approves |

---

### `Task`

A single task available on a specific day of the week.

| Field | Type | Notes |
|---|---|---|
| `task_id` | CharField (unique) | Slug like `mon-1`, `fri-3` |
| `type` | CharField | `video` / `survey` / `ad` / `trivia` |
| `title` | CharField | Display name |
| `reward` | DecimalField | KES earned on completion |
| `duration` | IntegerField | Seconds (for timer in UI) |
| `platform` | CharField | `youtube`, `tiktok`, or blank |
| `day` | CharField | `monday` … `friday` |
| `is_active` | BooleanField | Can be toggled by admin |

---

### `TaskCompletion`

Records that a specific user completed a specific task on a specific date.

| Field | Type | Notes |
|---|---|---|
| `user` | FK → User | |
| `task` | FK → Task | |
| `completed_at` | DateTimeField | Auto-set (full timestamp) |
| `reward_credited` | DecimalField | Amount credited at completion time |
| `completed_date` | DateField | Date portion only |

**Unique constraint:** `(user, task, completed_date)` — this means the same task can be completed again the following week (next Friday, etc.), but not twice on the same day.

---

### `MMFPlan`

An investment tier offered on the platform.

| Field | Type | Notes |
|---|---|---|
| `name` | CharField | Bronze / Silver / Gold |
| `min_invest` | DecimalField | Minimum investment amount |
| `max_invest` | DecimalField | Maximum investment amount |
| `return_percent` | DecimalField(5,2) | Percentage return on maturity |
| `duration_type` | CharField | `24h` / `48h` / `weekly` |
| `is_active` | BooleanField | Toggled by admin |

---

### `Investment`

A user's active or completed investment.

| Field | Type | Notes |
|---|---|---|
| `user` | FK → User | |
| `plan` | FK → MMFPlan | Protected (cannot delete a plan with investments) |
| `amount` | DecimalField | Amount invested |
| `return_percent` | DecimalField | Captured at investment time (not plan current value) |
| `status` | CharField | `active` / `completed` / `cancelled` |
| `start_date` | DateTimeField | Auto-set |
| `maturity_date` | DateTimeField | Calculated on creation |
| `expected_return` | DecimalField | `amount × return_percent / 100` |
| `payout_date` | DateTimeField | Set when auto-matured |

---

### `Withdrawal`

A user's withdrawal request.

| Field | Type | Notes |
|---|---|---|
| `user` | FK → User | |
| `amount` | DecimalField | Deducted from balance on creation |
| `mpesa_number` | CharField | Destination M-Pesa number |
| `status` | CharField | `pending` / `processed` / `rejected` |
| `transaction_id` | CharField | M-Pesa TX ID entered by admin on approval |
| `rejection_reason` | TextField | Reason if rejected |
| `processed_at` | DateTimeField | Set on approval or rejection |

**Important:** Balance is deducted at request time. If rejected, the amount is automatically refunded.

---

### `KYC`

KYC data submitted by a user. One-to-one with User.

| Field | Type |
|---|---|
| `id_number` | CharField |
| `id_type` | CharField (`national_id`, etc.) |
| `full_name` | CharField |
| `date_of_birth` | DateField |
| `submitted_at` | DateTimeField |

---

### `FraudFlag`

System-generated or manually created fraud alert.

| Field | Type | Notes |
|---|---|---|
| `user` | FK → User | |
| `flag_type` | CharField | e.g. `multiple_referrals_same_ip` |
| `severity` | CharField | `low` / `medium` / `high` |
| `description` | TextField | Auto-generated context |
| `investigated` | BooleanField | Admin can mark as investigated |

---

### `LiveFeedItem`

A single entry in the public activity ticker.

| Field | Type | Notes |
|---|---|---|
| `type` | CharField | `referral` / `withdrawal` / `investment` / `task` |
| `user_name` | CharField | Partial name (privacy) |
| `action` | CharField | Human-readable action string |
| `timestamp` | DateTimeField | Auto-set |

---

### `UserLoginLog`

IP and device tracking per login event. Used by fraud detection.

| Field | Type |
|---|---|
| `user` | FK → User |
| `ip_address` | GenericIPAddressField |
| `device_info` | CharField |
| `created_at` | DateTimeField |

---

## API Reference

All endpoints are under `/api/`. All authenticated endpoints require:

```
Authorization: Bearer <access_token>
```

A `401` response means the token is missing, invalid, or expired.

---

### Auth Endpoints

#### `POST /api/auth/register`

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "referral_code": "DEMO123"
}
```
`referral_code` is optional. If valid, a `Referral` record is created with `status: pending`.

**Response `201`:**
```json
{
  "message": "Registration successful",
  "user": { "id": 2, "email": "...", "promo_code": "XYZ789", "is_admin": false, "balance": "100.00" },
  "access_token": "eyJ...",
  "token_type": "Bearer"
}
```

A KES 100 signup bonus is credited automatically.

---

#### `POST /api/auth/login`

**Request:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Response `200`:**
```json
{
  "user": { ... },
  "access_token": "eyJ...",
  "token_type": "Bearer"
}
```

Returns `401` for invalid credentials, `403` if account is suspended.

---

#### `POST /api/auth/forgot-password`

```json
{ "email": "user@example.com" }
```

Returns `200` with a generic message regardless of whether the email exists (prevents user enumeration). Email sending is a stub — wire up SMTP or a service like SendGrid.

---

#### `POST /api/mpesa/pay-registration`

Stub endpoint for Safaricom Daraja STK Push. Returns a mock `checkout_request_id`.

```json
{ "mpesa_number": "0712345678", "amount": 500 }
```

> **TODO:** Replace the stub in `views.py → mpesa_pay_registration()` with real Daraja API calls.

---

### User & Wallet Endpoints

All require Bearer token.

#### `GET /api/user/profile`
Returns the full profile for the authenticated user.

#### `POST /api/user/update-mpesa`
```json
{ "mpesa_number": "0712345678" }
```

#### `POST /api/user/profile/selfie`
Multipart form upload. Field name: `selfie`. Saves to `media/selfies/`.

#### `POST /api/user/kyc/submit`
```json
{
  "id_number": "12345678",
  "id_type": "national_id",
  "full_name": "John Doe",
  "date_of_birth": "1990-01-15"
}
```
Sets `kyc_status` to `submitted`.

#### `GET /api/user/balance`
```json
{ "balance": 1450.00, "currency": "KES" }
```

#### `GET /api/transactions`

Query params: `limit` (default 50), `offset` (default 0), `type` (`credit` or `debit`).

```json
{
  "transactions": [ { "id": 1, "type": "credit", "description": "Signup Bonus", "amount": "100.00", "created_at": "..." } ],
  "total": 12
}
```

#### `POST /api/withdraw/request`

Immediately deducts from balance and creates a pending withdrawal.

```json
{ "amount": 1000, "mpesa_number": "0712345678" }
```

Returns `400` if amount < KES 550 or insufficient balance.

#### `GET /api/withdraw/history`
Returns all withdrawal records for the authenticated user.

---

### Task Endpoints

#### `GET /api/tasks/today`

Returns today's tasks for the authenticated user, with `completed: true/false` per task based on today's `TaskCompletion` records.

Returns empty `tasks: []` on weekends.

#### `GET /api/tasks/today/earnings`
```json
{ "today_earned": 40.0, "daily_limit": 60, "remaining": 20.0 }
```

#### `POST /api/tasks/{task_id}/complete`

Example: `POST /api/tasks/fri-1/complete`

Validates:
- Task exists and is active
- Task is assigned to today's day
- User has not already completed this task today (`completed_date` scoped)
- Daily earning limit (KES 60) not already reached

On success: credits balance, creates `Transaction`, creates `TaskCompletion`, adds live feed item.

```json
{ "message": "Task completed", "reward": 20.0, "new_balance": 1470.0 }
```

---

### Referral Endpoints

#### `GET /api/referrals/stats`
```json
{
  "totalReferrals": 3,
  "totalEarned": 400.0,
  "pendingApprovals": 1,
  "referral_link": "http://localhost:5173/register?ref=DEMO123"
}
```

#### `GET /api/referrals`
Returns all referral records where the authenticated user is the referrer.

---

### MMF Investment Endpoints

#### `GET /api/mmf/plans`
Returns all active investment plans.

#### `POST /api/mmf/invest`
```json
{ "plan_id": 1, "amount": 500 }
```

Validates amount against plan min/max and user balance. Deducts balance, sets maturity date, returns investment object.

#### `GET /api/mmf/investments`

Returns all investments for the user. **Also auto-matures** any investments whose `maturity_date` has passed — credits principal + return to balance and creates a `Transaction`. No background worker needed.

---

### Public Endpoints

#### `GET /api/live-feed`
Returns the 20 most recent `LiveFeedItem` records. No authentication required.

#### `GET /api/stats`
Returns public platform statistics (total users, total paid out, active investments).

---

### Admin Endpoints

All require Bearer token + `is_admin: true`. Returns `403` otherwise.

#### Users
```
GET    /api/admin/users              ?page&limit&search
POST   /api/admin/users              { email, password, is_admin }
PUT    /api/admin/users/{id}/suspend    → toggles suspended state
POST   /api/admin/users/{id}/credit  { amount, reason }
POST   /api/admin/users/{id}/debit   { amount, reason }
```

#### Referrals
```
PUT    /api/admin/referrals/{id}/approve  → credits KES 200 to referrer
```

#### Tasks
```
GET    /api/admin/tasks
POST   /api/admin/tasks              { task_id, type, title, reward, day, duration, platform }
PUT    /api/admin/tasks/{task_id}    { reward, is_active, title, duration, platform }
DELETE /api/admin/tasks/{task_id}
```

#### MMF Plans
```
GET    /api/admin/mmf/plans
PUT    /api/admin/mmf/plans/{id}/toggle    → flips is_active
PUT    /api/admin/mmf/plans/{id}           { return_percent, min_invest, max_invest, name, duration_type }
```

#### Withdrawals
```
GET    /api/admin/withdrawals/pending
PUT    /api/admin/withdrawals/{id}/approve  { transaction_id }
PUT    /api/admin/withdrawals/{id}/reject   { reason }
```
Rejecting a withdrawal automatically refunds the user's balance.

#### Reports & Stats
```
GET    /api/admin/reports/revenue   ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET    /api/admin/stats
```

#### Fraud
```
GET    /api/admin/fraud/flags
GET    /api/admin/fraud/investigate/{user_id}
```

---

## Authentication & Authorization

**Token issuance:** Handled by `djangorestframework-simplejwt`. Tokens are generated in `views.py → get_tokens_for_user()`.

**Token lifetime:** 7 days (access token). No refresh token flow is currently implemented — the user re-logs in when the token expires.

**Admin authorization:** A custom `admin_required` decorator (defined in `views.py`) checks `request.user.is_admin` before allowing access. It is stacked on top of the standard `@permission_classes([IsAuthenticated])` decorator.

**IP logging:** Every login and registration records the client IP in `UserLoginLog`. The IP is extracted from `HTTP_X_FORWARDED_FOR` (for proxied environments) or `REMOTE_ADDR`.

---

## Business Logic

### Task Completion Rules

1. `Task.day` must match the current weekday (Africa/Nairobi timezone)
2. `TaskCompletion.unique_together = (user, task, completed_date)` — prevents double-completion on the same calendar day but allows re-completion on the next occurrence (e.g. every Monday)
3. Sum of `reward_credited` for `completed_at >= today_start` must be < `DAILY_EARNING_LIMIT (60)`
4. On success: `user.balance += task.reward`, `Transaction` created, `LiveFeedItem` created

### MMF Maturity (pull-based)

There is no background scheduler. When `GET /api/mmf/investments` is called:

```python
for inv in investments:
    if inv.status == 'active' and inv.maturity_date <= now:
        payout = inv.amount + inv.expected_return
        inv.status = 'completed'
        inv.user.balance += payout
        # creates Transaction record
```

For production, replace this with a Celery periodic task.

### Withdrawal Lifecycle

```
User requests withdrawal
  → balance decremented immediately
  → Withdrawal(status='pending') created
  → Transaction(type='debit') created

Admin approves
  → withdrawal.status = 'processed'
  → transaction_id recorded

Admin rejects
  → balance refunded
  → Transaction(type='credit', description='Withdrawal Refund') created
  → withdrawal.status = 'rejected'
```

### Decimal Precision

All monetary fields use `DecimalField` and all arithmetic uses `Decimal` types. Never use `float` for money — this caused a production bug that has been fixed.

---

## Seeder Command

`python manage.py seed` is idempotent — re-running it skips already-existing records.

**What it creates:**

| Item | Details |
|---|---|
| Admin user | demo@earnflow.com / demo1234, balance KES 5000, promo DEMO123 |
| 10 normal users | See table in root README. All password: `pass1234` |
| 3 MMF plans | Bronze (10%/24h), Silver (20%/48h), Gold (30%/weekly) |
| 24 tasks | Mon–Fri full schedule |
| Referral links | john.doe → mary, peter, alice (mixed pending/credited) |
| Live feed | 8 sample activity items |

---

## Configuration Reference

All config in `backend/earnflow_backend/settings.py`.

| Setting | Default | Description |
|---|---|---|
| `DEBUG` | `True` | Set `False` in production |
| `SECRET_KEY` | placeholder | **Must change** before deploying |
| `ALLOWED_HOSTS` | `['*']` | Restrict to your domain in production |
| `CORS_ALLOWED_ORIGINS` | localhost 5173/3000 | Add your production frontend URL |
| `TIME_ZONE` | `Africa/Nairobi` | All task day checks use this timezone |
| `SIMPLE_JWT.ACCESS_TOKEN_LIFETIME` | 7 days | Adjust as needed |
| `MIN_WITHDRAWAL` | `550` | Minimum withdrawal in KES |
| `REGISTRATION_FEE` | `500` | Registration fee in KES |
| `SIGNUP_BONUS` | `100` | Signup bonus credited on registration |
| `REFERRAL_BONUS` | `200` | Bonus credited to referrer on approval |
| `DAILY_EARNING_LIMIT` | `60` | Max task earnings per day in KES |
| `FRONTEND_URL` | `http://localhost:5173` | Used in referral link generation |

---

## Production Checklist

Before deploying to a live server:

- [ ] Change `SECRET_KEY` to a long random string
- [ ] Set `DEBUG = False`
- [ ] Set `ALLOWED_HOSTS` to your actual domain
- [ ] Swap SQLite for PostgreSQL (`ENGINE: django.db.backends.postgresql`)
- [ ] Set `CORS_ALLOWED_ORIGINS` to your actual frontend URL only
- [ ] Implement real Safaricom Daraja STK Push in `mpesa_pay_registration()` and `admin_approve_withdrawal()`
- [ ] Configure SMTP for password reset emails in `forgot_password()`
- [ ] Replace pull-based MMF maturity with a Celery + Redis periodic task
- [ ] Add `django-ratelimit` to auth and task completion endpoints
- [ ] Move `media/` file storage to S3, Cloudflare R2, or equivalent
- [ ] Set `SECURE_SSL_REDIRECT = True` and configure HTTPS
- [ ] Run `python manage.py collectstatic` and serve static files via nginx
- [ ] Remove or restrict `/django-admin/` in production

---

> **Backend Engineer:** [@bytecortex00](https://github.com/bytecortex00)
