import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, DollarSign, AlertTriangle, TrendingUp, UserPlus, FileText, Shield, Banknote } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatNumber } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => { const f = async () => { try { const r = await adminService.getPlatformStats(); setStats(r) } catch (e) {}; setIsLoading(false) }; f() }, [])
  if (isLoading) return <LoadingSpinner />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ title: 'Total Users', value: formatNumber(stats?.totalUsers || 0), icon: Users, g: 'from-blue-600 to-blue-800' },{ title: 'Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, g: 'from-emerald-500 to-teal-700' },{ title: 'Active MMF', value: formatCurrency(stats?.activeMMF || 0), icon: TrendingUp, g: 'from-purple-600 to-purple-800' },{ title: 'Pending WD', value: stats?.pendingWithdrawalsCount || 0, icon: AlertTriangle, g: 'from-amber-500 to-orange-600' }].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={'bg-gradient-to-br ' + c.g + ' rounded-2xl p-5 shadow-xl'}><div className="flex justify-between mb-3"><p className="text-white/70 text-sm">{c.title}</p><c.icon size={20} className="text-white/60" /></div><p className="text-2xl font-bold text-white">{c.value}</p></motion.div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[{ label: 'Add User/Agent', icon: UserPlus, path: '/admin/users', color: 'text-blue-400', bg: 'bg-blue-500/20' },{ label: 'Tasks', icon: FileText, path: '/admin/tasks', color: 'text-purple-400', bg: 'bg-purple-500/20' },{ label: 'MMF', icon: Shield, path: '/admin/mmf', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },{ label: 'Withdrawals', icon: Banknote, path: '/admin/withdrawals', color: 'text-amber-400', bg: 'bg-amber-500/20' },{ label: 'Reports', icon: TrendingUp, path: '/admin/reports', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },{ label: 'Fraud', icon: AlertTriangle, path: '/admin/fraud', color: 'text-red-400', bg: 'bg-red-500/20' }].map((l, i) => (
          <Link key={i} to={l.path} className={l.bg + ' rounded-2xl p-4 text-center hover:scale-105 transition-transform'}><l.icon size={24} className={l.color + ' mx-auto mb-2'} /><span className="text-white text-sm">{l.label}</span></Link>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
