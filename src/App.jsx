import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Stats from './pages/Stats'
import ForgotPassword from './pages/ForgotPassword'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Dashboard from './pages/Dashboard'
import EarnHub from './pages/EarnHub'
import MMFInvest from './pages/MMFInvest'
import MMFHistory from './pages/MMFHistory'
import Referrals from './pages/Referrals'
import WalletPage from './pages/Wallet'
import Withdraw from './pages/Withdraw'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import TaskManagement from './pages/admin/TaskManagement'
import MMFManagement from './pages/admin/MMFManagement'
import WithdrawalApprovals from './pages/admin/WithdrawalApprovals'
import RevenueReports from './pages/admin/RevenueReports'
import FraudDetection from './pages/admin/FraudDetection'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'
import Layout from './components/common/Layout'
import AdminLayout from './components/common/AdminLayout'

function App() {
  const { user } = useSelector((state) => state.auth)

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/earn" element={<EarnHub />} />
          <Route path="/dashboard/mmf" element={<MMFInvest />} />
          <Route path="/dashboard/mmf/history" element={<MMFHistory />} />
          <Route path="/dashboard/referrals" element={<Referrals />} />
          <Route path="/dashboard/wallet" element={<WalletPage />} />
          <Route path="/dashboard/withdraw" element={<Withdraw />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/tasks" element={<TaskManagement />} />
          <Route path="/admin/mmf" element={<MMFManagement />} />
          <Route path="/admin/withdrawals" element={<WithdrawalApprovals />} />
          <Route path="/admin/reports" element={<RevenueReports />} />
          <Route path="/admin/fraud" element={<FraudDetection />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App