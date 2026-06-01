# EarnFlow Frontend

## Project Overview

EarnFlow is the React + Vite frontend for a micro-earning platform. The app supports:
- user registration and login
- wallet balance, transaction history, withdrawals
- KYC submission and M-Pesa setup
- referral tracking
- MMF investment flows
- admin dashboards for user/task/revenue/withdrawal management

This repository is frontend-only. The backend provides the API contract that the UI consumes.

## Tech Stack

- React 19
- Vite
- Redux Toolkit
- Axios
- Tailwind CSS
- React Router DOM
- Recharts

## Local Setup

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

## Backend Integration

The frontend communicates with the backend using `src/services/api.js`.

- Base URL is read from `import.meta.env.VITE_API_URL`
- Defaults to `http://localhost:8000` if the env variable is missing
- `Content-Type: application/json` is set globally
- `Authorization: Bearer <token>` is attached from `localStorage.token`
- A `401` response clears auth data and redirects the user to `/login`

### Environment

Create or update `.env` with:

```env
VITE_API_URL=http://localhost:8000
```

## Auth and User Contract

### Login

- `POST /api/auth/login`
- Request body:
  - `email`
  - `password`
- Successful response:
  - `user` object
  - `access_token`
  - `token_type: "Bearer"`

### Register

- `POST /api/auth/register`
- Request body:
  - `email`
  - `password`
  - `password_confirmation`
  - optional `referral_code`
- Notes:
  - referral code may also be supplied via `/register?ref=CODE`
  - backend should link the referred user to the referrer and preserve any referral bonus logic

### Forgot Password

- `POST /api/auth/forgot-password`
- Request body: `{ email }`

### Registration Payment

- `POST /api/mpesa/pay-registration`
- Request body:
  - `mpesa_number`
  - `amount`

## User & Wallet Endpoints

### Profile
- `GET /api/user/profile`
- `POST /api/user/update-mpesa`
- `POST /api/user/profile/selfie`
- `POST /api/user/kyc/submit`

### Balance and Transactions
- `GET /api/user/balance`
- `GET /api/transactions`
  - query params supported: `limit`, `offset`, `type`

### Withdrawals
- `POST /api/withdraw/request`
- `GET /api/withdraw/history`

## Admin Endpoints

Admin features exist in the frontend under `/src/services/adminService.js`.

### User management
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/{userId}/suspend`
- `POST /api/admin/users/{userId}/credit`
- `POST /api/admin/users/{userId}/debit`

### Referral approvals
- `PUT /api/admin/referrals/{referralId}/approve`

### Task management
- `GET /api/admin/tasks`
- `POST /api/admin/tasks`
- `PUT /api/admin/tasks/{taskId}`
- `DELETE /api/admin/tasks/{taskId}`

### MMF plan management
- `GET /api/admin/mmf/plans`
- `PUT /api/admin/mmf/plans/{planId}/toggle`
- `PUT /api/admin/mmf/plans/{planId}`

### Withdrawal approvals
- `GET /api/admin/withdrawals/pending`
- `PUT /api/admin/withdrawals/{id}/approve`
- `PUT /api/admin/withdrawals/{id}/reject`

### Reports and fraud
- `GET /api/admin/reports/revenue`
- `GET /api/admin/stats`
- `GET /api/admin/fraud/flags`
- `GET /api/admin/fraud/investigate/{userId}`

## Frontend Auth Notes

The Redux auth slice is defined in `src/redux/slices/authSlice.js`.
- login and register call `authService`
- tokens and user data are stored in `localStorage`
- a demo user and fake token are present in the initial state for local UI testing

## Important Files

- `src/services/api.js` — axios instance and auth interceptor
- `src/services/authService.js` — login/register/password reset
- `src/services/userService.js` — profile, KYC, M-Pesa updates
- `src/services/walletService.js` — balance, transactions, withdrawals
- `src/services/adminService.js` — admin APIs
- `src/redux/slices/authSlice.js` — auth state management
- `src/components/common/ProtectedRoute.jsx` — protects authenticated routes
- `src/components/common/AdminRoute.jsx` — protects admin-only routes

## What Backend Developers Should Know

- Frontend expects JSON APIs under the `/api` namespace
- auth state is stored in `localStorage`, not cookies
- invalid or expired tokens should return `401`
- the app currently uses a default dev backend URL of `http://localhost:8000`
- admin endpoints are explicitly called from the frontend and should be secured

---

If you want, I can also add a shorter `BACKEND_CONTRACT.md` file that isolates only the API definitions. 