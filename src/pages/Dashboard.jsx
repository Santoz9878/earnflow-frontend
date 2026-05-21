import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchProfile } from '../redux/slices/userSlice'
import { fetchBalance, fetchTransactions } from '../redux/slices/walletSlice'
import { fetchReferralStats } from '../redux/slices/referralSlice'
import { fetchInvestments } from '../redux/slices/mmfSlice'
import { fetchTodayEarnings } from '../redux/slices/tasksSlice'
import BalanceCard from '../components/dashboard/BalanceCard'
import QuickActions from '../components/dashboard/QuickActions'
import TransactionList from '../components/dashboard/TransactionList'
import ReferralCard from '../components/dashboard/ReferralCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { WEEKLY_SCHEDULE, DAILY_EARNING_LIMIT } from '../utils/constants'
import { getTodayName, isWeekday, formatCurrency } from '../utils/formatCurrency'
import { Calendar, AlertCircle, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { profile } = useSelector((state) => state.user)
  const { balance, transactions } = useSelector((state) => state.wallet)
  const { stats } = useSelector((state) => state.referral)
  const { activeInvestments } = useSelector((state) => state.mmf)
  const { todayEarnings, schedule, isWeekday: isWeekdayToday } = useSelector((state) => state.tasks)
  const isLoading = useSelector((state) => state.user.isLoading || state.wallet.isLoading)

  useEffect(() => {
    dispatch(fetchProfile())
    dispatch(fetchBalance())
    dispatch(fetchTransactions({ page: 1, limit: 5 }))
    dispatch(fetchReferralStats())
    dispatch(fetchInvestments())
    dispatch(fetchTodayEarnings())
  }, [dispatch])

  const today = getTodayName()
  const todaySchedule = WEEKLY_SCHEDULE[today]

  //if (isLoading && !profile) return <LoadingSpinner text="Loading dashboard..." />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Welcome back, {user?.email?.split('@')[0] || 'User'}! ??</h1>
        <p className="text-gray-400 mt-1">{isWeekdayToday ? 'Today is ' + todaySchedule?.day + ' - ' + todaySchedule?.description : "It's the weekend! Tasks resume Monday. Invest in MMF to keep earning."}</p>
      </motion.div>

      {isWeekdayToday && todaySchedule && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card mb-8 bg-gradient-to-r from-blue-900/50 to-blue-800/30 border-blue-700/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center flex-shrink-0"><Calendar size={28} className="text-blue-400" /></div>
              <div>
                <h3 className="text-white font-bold text-lg">{todaySchedule.title} - {todaySchedule.day}</h3>
                <p className="text-gray-400 text-sm">{todaySchedule.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-blue-300 text-sm">{todaySchedule.totalTasks} tasks available</span>
                  <span className="text-emerald-400 text-sm font-medium">Ksh {todaySchedule.rewardPerTask} each</span>
                </div>
              </div>
            </div>
            <button onClick={() => navigate('/dashboard/earn')} className="btn-primary flex-shrink-0">Start Today's Tasks</button>
          </div>
        </motion.div>
      )}

      {!isWeekdayToday && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card mb-8 bg-gradient-to-r from-amber-900/50 to-amber-800/30 border-amber-700/30">
          <div className="flex items-start space-x-4">
            <AlertCircle size={28} className="text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="text-white font-bold text-lg">Weekend Break</h3>
              <p className="text-gray-400 text-sm">Tasks are available Monday through Friday only. Invest in MMF to earn passive income 24/7!</p>
              <button onClick={() => navigate('/dashboard/mmf')} className="btn-accent mt-3 text-sm">Invest in MMF ?</button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <BalanceCard balance={balance || 0} todayEarnings={todayEarnings || 0} referralCount={stats?.totalReferrals || 0} referralEarnings={stats?.totalEarned || 0} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
        <QuickActions />
      </motion.div>

      {isWeekdayToday && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2"><TrendingUp size={20} className="text-emerald-400" /><h3 className="text-white font-semibold">Today's Earning Progress</h3></div>
            <span className="text-gray-400 text-sm">Limit: {formatCurrency(DAILY_EARNING_LIMIT)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: Math.min(((todayEarnings || 0) / DAILY_EARNING_LIMIT) * 100, 100) + '%' }} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400 font-medium">{formatCurrency(todayEarnings || 0)} earned</span>
            <span className="text-gray-400">{Math.max(0, DAILY_EARNING_LIMIT - (todayEarnings || 0)) > 0 ? formatCurrency(Math.max(0, DAILY_EARNING_LIMIT - (todayEarnings || 0))) + ' remaining' : 'Daily limit reached! ??'}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Active MMF Investments</h3>
              <button onClick={() => navigate('/dashboard/mmf')} className="text-blue-400 hover:text-blue-300 text-sm">View All ?</button>
            </div>
            {(!activeInvestments || activeInvestments.length === 0) ? (
              <div className="text-center py-6"><TrendingUp size={40} className="text-gray-600 mx-auto mb-3" /><p className="text-gray-400">No active investments</p><button onClick={() => navigate('/dashboard/mmf')} className="btn-primary mt-4 text-sm">Start Investing</button></div>
            ) : (
              <div className="space-y-3">
                {activeInvestments.slice(0, 3).map((inv, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex justify-between"><span className="text-white font-semibold">{inv.plan_name}</span><span className="text-emerald-400">+{inv.return_percent}%</span></div>
                    <div className="flex justify-between text-sm mt-1"><span className="text-gray-400">{formatCurrency(inv.amount)}</span><span className="text-gray-500">{inv.duration_type}</span></div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <TransactionList transactions={transactions || []} />
          </motion.div>
        </div>
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <ReferralCard promoCode={profile?.promo_code || 'LOADING'} stats={stats} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
