# EarnFlow Frontend - Backend Integration Guide

## Overview
EarnFlow is a micro-earning platform where users can earn money by:
- Watching videos (YouTube, TikTok)
- Completing surveys and polls
- Clicking on ads (PTC)
- Participating in trivia quizzes
- Referring friends
- Investing in MMF (Money Market Fund) plans
- Admin users managing platform operations

---

## API Base URL Configuration
The frontend expects API calls at:
```
http://localhost:8000 (development)
```
Configure via environment variable `VITE_API_URL`

---

## Authentication

### Login Endpoint
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "promo_code": "DEMO123",
    "is_admin": false,
    "is_agent": false,
    "balance": 1450
  },
  "access_token": "token_here",
  "token_type": "Bearer"
}
```

### Register Endpoint
**POST** `/api/auth/register`

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "referral_code": "DEMO123" // optional - include to credit referrer
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "promo_code": "AUTO_GENERATED_CODE",
    "is_admin": false,
    "balance": 0
  }
}

**Notes:**
- The registration endpoint accepts an optional `referral_code` (string). If provided and valid, the server should:
  - link the new user to the referring user
  - store a pending referral bonus that will be credited once the referred user completes required validation (e.g., email verification or first payment)
  - include a field `referred_by` in the created user response when applicable

Alternatively, referrals may be supplied via a registration URL query parameter `/register?ref=DEMO123` — the frontend will forward this as `referral_code` in the request body.
```

### Forgot Password
**POST** `/api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link sent to email"
}
```

### M-Pesa Registration Payment
**POST** `/api/mpesa/pay-registration`

**Request:**
```json
{
  "mpesa_number": "0712345678",
  "amount": 500
}
```

**Response:**
```json
{
  "message": "Payment initiated",
  "checkout_request_id": "ws_CO_DMZ_xxxxx"
}
```

---

## Authorization
All authenticated endpoints require the Bearer token in the header:
```
Authorization: Bearer {access_token}
```

**Note:** If token is invalid or expired (401), user is redirected to `/login`

---

## User Profile & Wallet

### Get User Balance
**GET** `/api/user/balance`

**Response:**
```json
{
  "balance": 1450,
  "currency": "KES"
}
```

### Get Transactions
**GET** `/api/transactions`

**Query Parameters:**
- `limit` (default: 50)
- `offset` (default: 0)
- `type` (optional: 'credit', 'debit')

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "type": "credit",
      "description": "Signup Bonus",
      "amount": 100,
      "created_at": "2026-05-21T10:00:00Z"
    },
    {
      "id": 2,
      "type": "credit",
      "description": "YouTube Video Task",
      "amount": 20,
      "created_at": "2026-05-21T11:30:00Z"
    },
    {
      "id": 3,
      "type": "debit",
      "description": "MMF Investment - Bronze",
      "amount": 500,
      "created_at": "2026-05-21T12:00:00Z"
    }
  ],
  "total": 100
}
```

### Get User Profile
**GET** `/api/user/profile`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "promo_code": "DEMO123",
  "mpesa_withdrawal_number": "0712345678",
  "kyc_status": "pending",
  "created_at": "2026-03-21T10:00:00Z"
}
```

### Update M-Pesa Number
**POST** `/api/user/update-mpesa`

**Request:**
```json
{
  "mpesa_number": "0712345678"
}
```

**Response:**
```json
{
  "message": "M-Pesa number updated",
  "mpesa_withdrawal_number": "0712345678"
}
```

### Submit KYC
**POST** `/api/user/kyc/submit`

**Request:**
```json
{
  "id_number": "12345678",
  "id_type": "national_id",
  "full_name": "John Doe",
  "date_of_birth": "1990-01-15"
}
```

**Response:**
```json
{
  "message": "KYC submitted for verification",
  "kyc_status": "pending"
}
```

---

## Tasks & Daily Earnings

### Get Today's Tasks
**GET** `/api/tasks/today`

**Response:**
```json
{
  "day": "Monday",
  "title": "YouTube Videos",
  "description": "Watch 3 YouTube videos, earn Ksh 20 each",
  "tasks": [
    {
      "id": "mon-1",
      "type": "video",
      "platform": "youtube",
      "title": "YouTube Video 1",
      "reward": 20,
      "duration": 30,
      "completed": false
    },
    {
      "id": "mon-2",
      "type": "video",
      "platform": "youtube",
      "title": "YouTube Video 2",
      "reward": 20,
      "duration": 30,
      "completed": true
    }
  ]
}
```

### Complete Task
**POST** `/api/tasks/{task_id}/complete`

**Request:**
```json
{
  "task_id": "mon-1"
}
```

**Response:**
```json
{
  "message": "Task completed",
  "reward": 20,
  "new_balance": 1470
}
```

### Get Today's Earnings
**GET** `/api/tasks/today/earnings`

**Response:**
```json
{
  "today_earned": 40,
  "daily_limit": 60,
  "remaining": 20
}
```

---

## Referral System

### Get Referral Stats
**GET** `/api/referrals/stats`

**Response:**
```json
{
  "totalReferrals": 5,
  "totalEarned": 1000,
  "pendingApprovals": 1,
  "referral_link": "https://earnflow.com/ref/DEMO123"
}
```

### Get All Referrals
**GET** `/api/referrals`

**Response:**
```json
{
  "referrals": [
    {
      "id": 1,
      "referred_user_email": "john@email.com",
      "bonus_amount": 200,
      "status": "credited",
      "created_at": "2026-05-20T10:00:00Z"
    },
    {
      "id": 2,
      "referred_user_email": "mary@email.com",
      "bonus_amount": 200,
      "status": "pending",
      "created_at": "2026-05-21T09:00:00Z"
    }
  ]
}
```

---

## MMF (Money Market Fund) Investment

### Get MMF Plans
**GET** `/api/mmf/plans`

**Response:**
```json
{
  "plans": [
    {
      "id": 1,
      "name": "Bronze",
      "min_invest": 500,
      "max_invest": 5000,
      "return_percent": 10,
      "duration_type": "24h",
      "is_active": true
    },
    {
      "id": 2,
      "name": "Silver",
      "min_invest": 1000,
      "max_invest": 10000,
      "return_percent": 20,
      "duration_type": "48h",
      "is_active": true
    },
    {
      "id": 3,
      "name": "Gold",
      "min_invest": 5000,
      "max_invest": 50000,
      "return_percent": 30,
      "duration_type": "weekly",
      "is_active": true
    }
  ]
}
```

### Create Investment
**POST** `/api/mmf/invest`

**Request:**
```json
{
  "plan_id": 1,
  "amount": 500
}
```

**Response:**
```json
{
  "id": 101,
  "plan_name": "Bronze",
  "amount": 500,
  "return_percent": 10,
  "status": "active",
  "start_date": "2026-05-21T10:00:00Z",
  "maturity_date": "2026-05-22T10:00:00Z",
  "duration_type": "24h",
  "expected_return": 50
}
```

### Get My Investments
**GET** `/api/mmf/investments`

**Response:**
```json
{
  "investments": [
    {
      "id": 101,
      "plan_name": "Bronze",
      "amount": 500,
      "return_percent": 10,
      "status": "active",
      "start_date": "2026-05-21T10:00:00Z",
      "maturity_date": "2026-05-22T10:00:00Z"
    }
  ]
}
```

---

## Withdrawals

### Request Withdrawal
**POST** `/api/withdraw/request`

**Request:**
```json
{
  "amount": 1000,
  "mpesa_number": "0712345678"
}
```

**Response:**
```json
{
  "message": "Withdrawal request submitted",
  "withdrawal_id": 1,
  "status": "pending",
  "amount": 1000,
  "mpesa_number": "0712345678"
}
```

### Get Withdrawal History
**GET** `/api/withdraw/history`

**Response:**
```json
{
  "withdrawals": [
    {
      "id": 1,
      "amount": 1000,
      "status": "processed",
      "mpesa_number": "0712345678",
      "created_at": "2026-05-19T10:00:00Z",
      "processed_at": "2026-05-19T11:00:00Z"
    },
    {
      "id": 2,
      "amount": 550,
      "status": "pending",
      "mpesa_number": "0712345678",
      "created_at": "2026-05-21T10:00:00Z"
    }
  ]
}
```

---

## Live Feed

### Get Live Feed
**GET** `/api/live-feed`

**Response:**
```json
{
  "feed": [
    {
      "id": 1,
      "type": "referral",
      "user_name": "John D.",
      "action": "earned Ksh 200 from referral",
      "timestamp": "2026-05-21T11:30:00Z"
    },
    {
      "id": 2,
      "type": "withdrawal",
      "user_name": "Mary K.",
      "action": "withdrew Ksh 1000",
      "timestamp": "2026-05-21T10:45:00Z"
    }
  ]
}
```

---

## Admin Endpoints

### Get Users (with pagination)
**GET** `/api/admin/users`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `search` (optional: email search)

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "balance": 1450,
      "is_admin": false,
      "kyc_status": "pending",
      "referral_count": 5,
      "created_at": "2026-03-21T10:00:00Z",
      "is_suspended": false
    }
  ],
  "total": 250,
  "page": 1,
  "limit": 50
}
```

### Add User (Admin)
**POST** `/api/admin/users`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "is_admin": true
}
```

### Suspend User
**PUT** `/api/admin/users/{user_id}/suspend`

**Response:**
```json
{
  "message": "User suspended",
  "user_id": 5
}
```

### Credit User (Admin)
**POST** `/api/admin/users/{user_id}/credit`

**Request:**
```json
{
  "amount": 500,
  "reason": "Manual credit - support"
}
```

**Response:**
```json
{
  "message": "User credited",
  "new_balance": 1950
}
```

### Debit User (Admin)
**POST** `/api/admin/users/{user_id}/debit`

**Request:**
```json
{
  "amount": 100,
  "reason": "Chargeback"
}
```

---

## Admin - Tasks Management

### Get All Tasks
**GET** `/api/admin/tasks`

**Response:**
```json
{
  "tasks": [
    {
      "id": "mon-1",
      "type": "video",
      "title": "YouTube Video 1",
      "reward": 20,
      "platform": "youtube",
      "duration": 30,
      "day": "monday",
      "is_active": true
    }
  ]
}
```

### Create Task
**POST** `/api/admin/tasks`

**Request:**
```json
{
  "type": "survey",
  "title": "Customer Feedback",
  "reward": 15,
  "day": "tuesday",
  "duration": 120
}
```

### Update Task
**PUT** `/api/admin/tasks/{task_id}`

**Request:**
```json
{
  "reward": 25,
  "is_active": true
}
```

### Delete Task
**DELETE** `/api/admin/tasks/{task_id}`

---

## Admin - MMF Plans

### Get MMF Plans (Admin)
**GET** `/api/admin/mmf/plans`

### Toggle MMF Plan Status
**PUT** `/api/admin/mmf/plans/{plan_id}/toggle`

**Response:**
```json
{
  "message": "Plan status updated",
  "plan_id": 1,
  "is_active": false
}
```

### Update MMF Plan
**PUT** `/api/admin/mmf/plans/{plan_id}`

**Request:**
```json
{
  "return_percent": 15,
  "min_invest": 600
}
```

---

## Admin - Withdrawal Management

### Get Pending Withdrawals
**GET** `/api/admin/withdrawals/pending`

**Response:**
```json
{
  "withdrawals": [
    {
      "id": 2,
      "user_email": "user@example.com",
      "amount": 550,
      "mpesa_number": "0712345678",
      "status": "pending",
      "created_at": "2026-05-21T10:00:00Z"
    }
  ]
}
```

### Approve Withdrawal
**PUT** `/api/admin/withdrawals/{withdrawal_id}/approve`

**Request:**
```json
{
  "transaction_id": "MPesa_TX_12345"
}
```

**Response:**
```json
{
  "message": "Withdrawal approved",
  "status": "processed"
}
```

### Reject Withdrawal
**PUT** `/api/admin/withdrawals/{withdrawal_id}/reject`

**Request:**
```json
{
  "reason": "Invalid M-Pesa number"
}
```

---

## Admin - Referral Management

### Approve Referral
**PUT** `/api/admin/referrals/{referral_id}/approve`

**Response:**
```json
{
  "message": "Referral approved",
  "bonus_credited": 200
}
```

---

## Admin - Reports & Stats

### Get Revenue Report
**GET** `/api/admin/reports/revenue`

**Query Parameters:**
- `start_date` (YYYY-MM-DD)
- `end_date` (YYYY-MM-DD)

**Response:**
```json
{
  "total_revenue": 5000,
  "commission_earned": 1250,
  "active_users": 250,
  "new_users": 45,
  "total_paid_out": 3750,
  "period": "2026-05-01 to 2026-05-21"
}
```

### Get Platform Stats
**GET** `/api/admin/stats`

**Response:**
```json
{
  "total_users": 500,
  "total_balance": 25000,
  "total_invested_mmf": 15000,
  "pending_withdrawals": 5000,
  "processed_today": 8,
  "active_investments": 45
}
```

---

## Admin - Fraud Detection

### Get Fraud Flags
**GET** `/api/admin/fraud/flags`

**Response:**
```json
{
  "flags": [
    {
      "id": 1,
      "user_id": 15,
      "user_email": "suspicious@example.com",
      "flag_type": "multiple_referrals_same_ip",
      "severity": "medium",
      "created_at": "2026-05-21T09:00:00Z",
      "investigated": false
    }
  ]
}
```

### Investigate User
**GET** `/api/admin/fraud/investigate/{user_id}`

**Response:**
```json
{
  "user_id": 15,
  "email": "user@example.com",
  "balance": 5000,
  "referral_count": 20,
  "ip_addresses": ["192.168.1.1"],
  "devices": ["Samsung Galaxy S20"],
  "suspicious_activities": [
    {
      "type": "rapid_referrals",
      "count": 20,
      "timeframe": "1 hour"
    }
  ]
}
```

---

## Redux State Structure

The frontend manages state using Redux with the following slices:

### Auth State
```javascript
{
  user: {
    id: number,
    email: string,
    promo_code: string,
    is_admin: boolean,
    is_agent: boolean,
    balance: number
  },
  token: string,
  isLoading: boolean,
  isError: boolean,
  message: string
}
```

### Wallet State
```javascript
{
  balance: number,
  transactions: [
    {
      id: number,
      type: 'credit' | 'debit',
      description: string,
      amount: number,
      created_at: ISO8601 string
    }
  ],
  withdrawals: [
    {
      id: number,
      amount: number,
      status: 'pending' | 'processed' | 'rejected',
      created_at: ISO8601 string,
      processed_at: ISO8601 string
    }
  ],
  isLoading: boolean
}
```

### Tasks State
```javascript
{
  todayTasks: [
    {
      id: string,
      type: 'video' | 'survey' | 'ad' | 'trivia',
      title: string,
      reward: number,
      duration: number,
      platform?: string,
      completed: boolean
    }
  ],
  todayEarnings: number,
  dailyLimit: number,
  completedTasks: string[],
  isWeekday: boolean
}
```

### MMF State
```javascript
{
  plans: [
    {
      id: number,
      name: string,
      min_invest: number,
      max_invest: number,
      return_percent: number,
      duration_type: string,
      is_active: boolean
    }
  ],
  activeInvestments: [
    {
      id: number,
      plan_name: string,
      amount: number,
      return_percent: number,
      status: 'active' | 'completed',
      start_date: ISO8601,
      maturity_date: ISO8601
    }
  ]
}
```

### Referral State
```javascript
{
  stats: {
    totalReferrals: number,
    totalEarned: number,
    pendingApprovals: number
  },
  referrals: [
    {
      id: number,
      referred_user_email: string,
      bonus_amount: number,
      status: 'pending' | 'credited',
      created_at: ISO8601
    }
  ]
}
```

### User Profile State
```javascript
{
  profile: {
    email: string,
    promo_code: string,
    mpesa_withdrawal_number: string,
    kyc_status: 'pending' | 'verified' | 'rejected',
    created_at: ISO8601
  },
  kycStatus: string
}
```

### Live Feed State
```javascript
{
  feed: [
    {
      id: number,
      type: 'referral' | 'withdrawal' | 'investment' | 'task',
      user_name: string,
      action: string,
      timestamp: ISO8601
    }
  ]
}
```

---

## Routes

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password recovery
- `/admin-login` - Admin login
- `/terms` - Terms of service
- `/privacy` - Privacy policy
- `/stats` - Public statistics

### Protected User Routes (requires auth & not admin)
- `/dashboard` - User dashboard
- `/dashboard/earn` - Today's earning tasks
- `/dashboard/mmf` - MMF investment
- `/dashboard/mmf/history` - Investment history
- `/dashboard/referrals` - Referral management
- `/dashboard/wallet` - Wallet & balance
- `/dashboard/withdraw` - Request withdrawal
- `/dashboard/profile` - User profile & KYC
- `/dashboard/leaderboard` - User leaderboard

### Protected Admin Routes (requires auth & is_admin)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/tasks` - Task management
- `/admin/mmf` - MMF plan management
- `/admin/withdrawals` - Withdrawal approvals
- `/admin/reports` - Revenue reports
- `/admin/fraud` - Fraud detection

---

## Key Constants

**Platform Settings:**
- `MIN_WITHDRAWAL`: 550 (minimum withdrawal amount in KES)
- `REGISTRATION_FEE`: 500 (registration fee in KES)
- `SIGNUP_BONUS`: 100 (signup bonus in KES)
- `REFERRAL_BONUS`: 200 (referral reward in KES)
- `DAILY_EARNING_LIMIT`: 60 (max earnings per day in KES)

**Weekly Task Schedule:**
- **Monday**: 3 YouTube videos (Ksh 20 each)
- **Tuesday**: 5 Surveys (Ksh 12 each)
- **Wednesday**: 4 TikTok videos (Ksh 15 each)
- **Thursday**: 6 Ads/PTC (Ksh 10 each)
- **Friday**: 3 Trivia rounds (Ksh 20 each)
- **Saturday & Sunday**: No tasks

---

## Error Handling

All API errors should follow this format:

**Error Response (4xx/5xx):**
```json
{
  "message": "Error description",
  "status": 400,
  "errors": {
    "field_name": ["error message"]
  }
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Server Error

---

## Important Notes for Backend Developer

1. **Token Storage**: Frontend stores JWT token in `localStorage` as `token` and user object as `user`

2. **User Roles**:
   - Regular user: `is_admin = false`, `is_agent = false`
   - Admin user: `is_admin = true`
   - Can extend with other roles using `is_agent` flag

3. **M-Pesa Integration**: Frontend expects M-Pesa payment endpoints for registration and withdrawals

4. **Promo Code**: Each user gets a unique `promo_code` for referrals. Format is flexible (can be auto-generated)

5. **KYC Process**: Users can submit KYC which goes to "pending" status initially. Admin can approve/reject

6. **Task Scheduling**: Tasks are defined by day of week. Backend should validate that users can only complete assigned tasks for the day

7. **Investment Maturity**: MMF investments have a maturity date. Frontend doesn't auto-credit, backend needs to handle automated rewards on maturity

8. **Referral Flow**: 
   - User A shares promo code with User B
   - User B registers with promo code
   - Referral is marked as "pending"
   - Admin approves it (or auto-approve)
   - User A gets Ksh 200 bonus

9. **Withdrawal Process**:
   - User requests withdrawal with M-Pesa number
   - Status: "pending" initially
   - Admin approves/rejects
   - Backend integrates with M-Pesa to send actual funds

10. **Admin Dashboard**: Admins can directly credit/debit user accounts for support cases

11. **Fraud Detection**: System should flag suspicious patterns like:
    - Multiple referrals from same IP
    - Rapid account creation and withdrawal
    - Task completion abuse

12. **Live Feed**: Real-time updates of user activities. Can use WebSockets or polling

---

## Testing Credentials
- **Demo User Email**: `demo@earnflow.com`
- **Demo User Password**: (any password, currently auto-logged in)
- **Demo User is Admin**: Yes

---

## Environment Variables Needed

Create a `.env` file in the frontend root:
```
VITE_API_URL=http://localhost:8000
```

Or for production:
```
VITE_API_URL=https://api.earnflow.com
```

---

## Next Steps for Backend Development

1. Set up Django/Python backend with appropriate models
2. Implement all authentication endpoints
3. Create user profile & wallet management
4. Implement task system with daily limits
5. Build MMF investment system with maturity calculations
6. Create referral tracking system
7. Implement M-Pesa payment integration
8. Build admin management endpoints
9. Add fraud detection logic
10. Implement live feed (can be simple polling initially)
11. Set up database with proper indexing
12. Add comprehensive error handling
13. Implement rate limiting for security
14. Add logging for debugging

---

## Questions or Clarifications?

Refer to the specific service files in `src/services/` for exact endpoint calls being made from the frontend.

