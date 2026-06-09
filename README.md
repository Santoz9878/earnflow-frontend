# EarnFlow — Micro-Earning Platform

> A full-stack micro-earning web application built with **React 19 + Vite** (frontend) and **Django REST Framework** (backend). Users earn Kenyan Shillings through daily tasks, referrals, and Money Market Fund investments.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [Seeded Demo Data](#seeded-demo-data)
- [Frontend Architecture](#frontend-architecture)
  - [Routing](#routing)
  - [State Management](#state-management)
  - [Services Layer](#services-layer)
  - [Key Components](#key-components)
- [Backend Architecture](#backend-architecture)
  - [Models](#models)
  - [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Business Logic](#business-logic)
- [Feature Breakdown](#feature-breakdown)
- [Admin Panel](#admin-panel)
- [Known Limitations & TODOs](#known-limitations--todos)
- [Credits](#credits)
- [Disclaimer](#disclaimer)

---

## Overview

EarnFlow is a platform where registered users complete short tasks each weekday to earn money, invest those earnings in tiered Money Market Fund plans, and grow their income through a referral system. An admin panel gives platform operators full control over users, tasks, investments, withdrawals, and fraud detection.

**Earning model:**

| Day | Task Type | Tasks | Per Task | Daily Max |
|---|---|---|---|---|
| Monday | YouTube Videos | 3 | KES 20 | KES 60 |
| Tuesday | Surveys & Polls | 5 | KES 12 | KES 60 |
| Wednesday | TikTok Videos | 4 | KES 15 | KES 60 |
| Thursday | Click Ads (PTC) | 6 | KES 10 | KES 60 |
| Friday | Trivia Rounds | 3 | KES 20 | KES 60 |
| Weekend | — | — | — | MMF only |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Redux Toolkit | 2.x | Global state management |
| Axios | 1.x | HTTP client with interceptors |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 12.x | Animations & transitions |
| Lucide React | latest | Icon library |
| React Hook Form | 7.x | Form handling & validation |
| React Hot Toast | 2.x | Toast notifications |
| Recharts | 3.x | Admin charts & analytics |
| Vite PWA Plugin | 1.x | Progressive Web App support |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.12 | Runtime |
| Django | 6.x | Web framework |
| Django REST Framework | 3.x | API layer |
| djangorestframework-simplejwt | latest | JWT authentication |
| django-cors-headers | latest | CORS for frontend requests |
| SQLite | built-in | Database (swap to PostgreSQL in prod) |
| Pillow | latest | Image handling for selfie uploads |

---

## Project Structure

```
earnflow-frontend/           ← root (frontend lives here)
├── src/
│   ├── pages/               ← route-level page components
│   │   ├── admin/           ← admin-only pages
│   │   └── *.jsx            ← user pages
│   ├── components/
│   │   ├── common/          ← layout, nav, route guards
│   │   └── dashboard/       ← dashboard widgets
│   ├── redux/
│   │   ├── slices/          ← auth, wallet, tasks, mmf, referral, liveFeed, user
│   │   └── store.js
│   ├── services/            ← axios API call wrappers
│   ├── utils/               ← constants, formatters, validators
│   ├── App.jsx              ← route definitions
│   └── main.jsx             ← entry point
├── public/
├── .env                     ← VITE_API_URL config
├── package.json
└── backend/                 ← Django backend
    ├── api/
    │   ├── models.py        ← all database models
    │   ├── views.py         ← all API view functions
    │   ├── serializers.py   ← DRF serializers
    │   ├── urls.py          ← URL routing
    │   ├── admin.py         ← Django admin registrations
    │   └── management/
    │       └── commands/
    │           └── seed.py  ← database seeder
    ├── earnflow_backend/
    │   ├── settings.py
    │   └── urls.py
    ├── db.sqlite3           ← SQLite database (auto-created)
    └── manage.py
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- pip

---

### Frontend Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env

# 3. Start the dev server
npm run dev
```

Frontend runs at **http://localhost:5173**

---

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install Python dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow

# 3. Run database migrations
python manage.py migrate

# 4. Seed the database (creates admin, 10 users, MMF plans, tasks)
python manage.py seed

# 5. Start the Django development server
python manage.py runserver 8000
```

Backend API runs at **http://localhost:8000**

> Both servers need to run simultaneously. Open two terminal windows.

---

## Environment Variables

### Frontend (`.env` in project root)

```env
VITE_API_URL=http://localhost:8000
```

For production:
```env
VITE_API_URL=https://your-api-domain.com
```

### Backend

No `.env` file required for local dev. For production, change these values in `backend/earnflow_backend/settings.py`:

```python
SECRET_KEY = 'your-secure-secret-key'
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
FRONTEND_URL = 'https://your-frontend-domain.com'
```

---

## Seeded Demo Data

After running `python manage.py seed`, the following data is available:

### Admin Account
| Field | Value |
|---|---|
| Email | demo@earnflow.com |
| Password | demo1234 |
| Role | Admin (full access) |
| Balance | KES 5,000 |
| Promo Code | DEMO123 |

### Normal User Accounts (all use password: `pass1234`)

| Email | Balance |
|---|---|
| john.doe@gmail.com | KES 1,450 |
| mary.wanjiku@gmail.com | KES 850 |
| peter.kamau@gmail.com | KES 2,300 |
| alice.njeri@gmail.com | KES 600 |
| bob.otieno@gmail.com | KES 3,100 |
| grace.muthoni@gmail.com | KES 750 |
| james.kariuki@gmail.com | KES 1,200 |
| linda.auma@gmail.com | KES 980 |
| kevin.mwangi@gmail.com | KES 4,200 |
| sarah.chebet@gmail.com | KES 1,650 |

All users have M-Pesa numbers, transaction history, and some have referral relationships pre-seeded.

---

## Frontend Architecture

### Routing

Routes are defined in `src/App.jsx` and split into three zones:

**Public routes** — accessible without authentication:
```
/               → Landing page
/login          → User login
/register       → Registration (supports ?ref=CODE for referrals)
/forgot-password
/admin-login
/stats          → Public platform statistics
/terms
/privacy
```

**Protected user routes** — require valid JWT, guarded by `ProtectedRoute`:
```
/dashboard
/dashboard/earn         → Today's tasks (EarnHub)
/dashboard/mmf          → MMF investment
/dashboard/mmf/history  → Investment history
/dashboard/referrals
/dashboard/wallet
/dashboard/withdraw
/dashboard/topup
/dashboard/profile      → KYC & M-Pesa setup
/dashboard/leaderboard
```

**Protected admin routes** — require `is_admin: true`, guarded by `AdminRoute`:
```
/admin
/admin/users
/admin/tasks
/admin/mmf
/admin/withdrawals
/admin/reports
/admin/fraud
```

---

### State Management

Redux Toolkit manages all global state. The store has 7 slices:

| Slice | State managed |
|---|---|
| `auth` | Current user, JWT token, loading/error states |
| `user` | Profile data, KYC status, M-Pesa number |
| `wallet` | Balance, transaction history, withdrawal records |
| `tasks` | Today's tasks, completed task IDs, daily earnings |
| `mmf` | Investment plans, active & historical investments |
| `referral` | Referral stats and referral list |
| `liveFeed` | Real-time activity feed items |

Auth state is persisted to `localStorage` (`token` and `user` keys). On app load, the auth slice reads these to restore session automatically.

On a `401` response from any API call, the Axios interceptor in `src/services/api.js` automatically clears auth data and redirects to `/login`.

---

### Services Layer

API calls are centralised in `src/services/`:

```
api.js           → Axios instance with base URL, auth headers, 401 interceptor
authService.js   → login, register, forgot-password, M-Pesa registration payment
userService.js   → profile fetch, M-Pesa number update, selfie upload, KYC submit
walletService.js → balance, transactions, withdrawal request & history
adminService.js  → all admin endpoints (users, tasks, MMF, withdrawals, reports, fraud)
```

The tasks, MMF, referral, and live feed slices call the API directly via the shared `api` instance rather than through a service file.

---

### Key Components

| Component | Location | Purpose |
|---|---|---|
| `Layout` | components/common | Wraps all user dashboard pages with navbar, footer, bottom nav |
| `AdminLayout` | components/common | Admin sidebar layout |
| `ProtectedRoute` | components/common | Redirects unauthenticated users to `/login` |
| `AdminRoute` | components/common | Redirects non-admin users away from `/admin/*` |
| `LiveFeed` | components/common | Scrolling ticker of recent platform activity |
| `BalanceCard` | components/dashboard | Displays user balance with animated counter |
| `QuickActions` | components/dashboard | Fast-action buttons grid |
| `TransactionList` | components/dashboard | Paginated transaction history |
| `ReferralCard` | components/dashboard | Referral stats summary card |

---

## Backend Architecture

### Models

Defined in `backend/api/models.py`:

| Model | Description |
|---|---|
| `User` | Custom user model extending `AbstractBaseUser`. Fields: email, promo_code, balance (DecimalField), is_admin, is_agent, is_suspended, kyc_status, mpesa_withdrawal_number |
| `Transaction` | Ledger of all credits and debits per user |
| `Referral` | Links referrer to referred user; tracks pending/credited status and bonus amount |
| `Task` | Platform tasks with day assignment, type (video/survey/ad/trivia), reward, duration |
| `TaskCompletion` | Records when a user completes a task. Unique on `(user, task, completed_date)` — allows weekly recurrence |
| `MMFPlan` | Investment tiers (Bronze/Silver/Gold) with return percent and duration type |
| `Investment` | User investment records with maturity date and expected return |
| `Withdrawal` | Withdrawal requests with status (pending/processed/rejected) |
| `KYC` | Know Your Customer submission data per user |
| `FraudFlag` | System-generated fraud alerts with severity levels |
| `LiveFeedItem` | Platform activity items shown in the live feed ticker |
| `UserLoginLog` | Tracks login IPs and devices per user for fraud detection |

---

### API Endpoints

All endpoints are prefixed with `/api/`. Full list:

#### Auth (no authentication required)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/mpesa/pay-registration
```

#### User Profile (Bearer token required)
```
GET    /api/user/profile
POST   /api/user/update-mpesa
POST   /api/user/profile/selfie
POST   /api/user/kyc/submit
GET    /api/user/balance
GET    /api/transactions          ?limit=50&offset=0&type=credit|debit
POST   /api/withdraw/request
GET    /api/withdraw/history
```

#### Tasks
```
GET    /api/tasks/today
GET    /api/tasks/today/earnings
POST   /api/tasks/{task_id}/complete
```

#### Referrals
```
GET    /api/referrals/stats
GET    /api/referrals
```

#### MMF Investments
```
GET    /api/mmf/plans
POST   /api/mmf/invest
GET    /api/mmf/investments
```

#### Public
```
GET    /api/live-feed
GET    /api/stats
```

#### Admin (Bearer token + `is_admin: true` required)
```
GET    /api/admin/users           ?page=1&limit=50&search=email
POST   /api/admin/users
PUT    /api/admin/users/{id}/suspend
POST   /api/admin/users/{id}/credit
POST   /api/admin/users/{id}/debit
PUT    /api/admin/referrals/{id}/approve
GET    /api/admin/tasks
POST   /api/admin/tasks
PUT    /api/admin/tasks/{task_id}
DELETE /api/admin/tasks/{task_id}
GET    /api/admin/mmf/plans
PUT    /api/admin/mmf/plans/{id}/toggle
PUT    /api/admin/mmf/plans/{id}
GET    /api/admin/withdrawals/pending
PUT    /api/admin/withdrawals/{id}/approve
PUT    /api/admin/withdrawals/{id}/reject
GET    /api/admin/reports/revenue  ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET    /api/admin/stats
GET    /api/admin/fraud/flags
GET    /api/admin/fraud/investigate/{user_id}
```

Full request/response shapes are documented in `BACKEND_DOCUMENTATION.md`.

---

### Authentication

JWT-based authentication using `djangorestframework-simplejwt`.

- Tokens are issued on login and registration
- Access token lifetime: **7 days**
- Token is passed as `Authorization: Bearer <token>` on every authenticated request
- The frontend stores the token in `localStorage` and attaches it via an Axios request interceptor
- A 401 response triggers automatic logout and redirect to `/login`
- Admin access is enforced by checking `user.is_admin` in the `admin_required` decorator applied to all `/api/admin/*` views

---

### Business Logic

**Task Completion:**
- Tasks are day-of-week scoped — a Friday task can only be completed on Fridays
- Completion is tracked with a `completed_date` field, allowing the same task to be completed again the following week
- Daily earning cap is KES 60. Attempting to exceed it returns a `400`
- Completing a task credits the user's balance and creates a `Transaction` record

**MMF Investments:**
- Deducts amount from user balance immediately on investment
- Maturity dates: Bronze = 24h, Silver = 48h, Gold = 7 days
- When `GET /api/mmf/investments` is called, the view automatically matures any investments that have passed their maturity date, credits principal + return to the user's balance, and creates a credit `Transaction`
- No background worker is needed — maturity is processed on the next fetch

**Withdrawal Flow:**
1. User submits withdrawal request — amount is immediately deducted from balance
2. Withdrawal record created with `status: pending`
3. Admin reviews and approves (marks processed) or rejects (refunds balance)

**Referral Flow:**
1. User shares their unique `promo_code` link
2. New user registers with `referral_code` in the request body
3. A `Referral` record is created with `status: pending`
4. Admin approves the referral — KES 200 is credited to the referrer

**Fraud Detection:**
- On login/registration, the IP is logged to `UserLoginLog`
- If 3+ distinct users register from the same IP within 1 hour, a `FraudFlag` is created
- Admins can investigate users to see IP history, device info, and suspicious activity patterns

---

## Feature Breakdown

### User Side
- Register / Login / Forgot Password
- Dashboard with balance, quick actions, transaction history, referral stats, today's schedule
- Daily task completion with timers (video/ad), surveys, and trivia
- MMF investment with 3 tiers and automatic maturity processing
- Referral link generation and tracking
- Wallet page with full transaction history and filters
- Withdrawal requests with M-Pesa number
- Top-up via M-Pesa (stub endpoint — Daraja API integration point)
- Profile management: M-Pesa number, selfie upload, KYC submission
- Leaderboard
- Live activity feed (polls every 30 seconds)

### Admin Side
- Dashboard with platform-wide stats
- User management: list, search, create, suspend/unsuspend, manual credit/debit
- Task management: full CRUD on tasks per day
- MMF plan management: toggle active status, update return rates and limits
- Withdrawal approval queue: approve with M-Pesa transaction ID or reject with refund
- Referral approvals: manually approve pending referrals
- Revenue reports with date range filtering
- Fraud detection: view flagged users, investigate IP history and suspicious activity patterns

---

## Admin Panel

Access the admin panel by logging in at `/admin-login` with an account where `is_admin: true`.

The Django built-in admin is also available at `/django-admin/` — useful for direct database inspection during development.

---

## Known Limitations & TODOs

| Item | Status |
|---|---|
| M-Pesa Daraja STK Push integration | Stub only — returns mock response |
| Email sending (forgot password, notifications) | Stub only — no SMTP configured |
| WebSocket live feed | Uses 30-second polling — replace with Django Channels for real-time |
| MMF maturity processing | Triggered on fetch — replace with Celery beat task in production |
| Rate limiting | Not implemented — add `django-ratelimit` for production |
| PostgreSQL | Uses SQLite — swap engine in `settings.py` for production |
| HTTPS / production hardening | `DEBUG=True`, `SECRET_KEY` is placeholder — must change before deploying |
| Referral auto-approval | Currently manual admin approval — can be automated |
| KYC document verification | Submission captured but no verification workflow |
| Selfie/ID upload storage | Saves to local `media/` folder — use S3/Cloudflare R2 in production |

---

## Credits

**Backend Engineer:** [@bytecortex00](https://github.com/bytecortex00)

**Frontend:** EarnFlow Frontend Team

---

## Disclaimer

> This project was built for **educational purposes only**. It is intended to demonstrate full-stack web development concepts including REST API design, JWT authentication, Redux state management, Django ORM, and React component architecture.
>
> The author bears **no responsibility** for how this code is used. If you choose to deploy or adapt this codebase for any commercial, financial, or legal purpose, you do so entirely at your own risk. This includes but is not limited to compliance with financial regulations, data protection laws, M-Pesa/Safaricom API terms of service, and any applicable local laws governing earning platforms, investments, or money transfers.
>
> **Do not deploy this to production without a full security audit, proper legal review, and integration of real payment infrastructure.**
