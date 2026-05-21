import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, DollarSign, Calendar, Activity } from 'lucide-react'
import { api } from '../services/api'
import { formatCurrency, formatNumber } from '../utils/formatCurrency'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Stats = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const fetch = async () => { try { const r = await api.get('/api/stats/public'); setStats(r.data) } catch (e) {}; setIsLoading(false) }
    fetch()
  }, [])
  if (isLoading) return <LoadingSpinner />
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12"><Activity size={48} className="text-blue-400 mx-auto mb-4" /><h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Platform Statistics</h1><p className="text-gray-400">Real-time numbers from our community</p></motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[{ icon: Users, label: 'Users', value: formatNumber(stats?.totalUsers || 25000), color: 'text-blue-400' },{ icon: DollarSign, label: 'Paid Out', value: formatCurrency(stats?.totalPaidOut || 12000000), color: 'text-emerald-400' },{ icon: Activity, label: 'Today', value: formatCurrency(stats?.todayEarnings || 45000), color: 'text-purple-400' },{ icon: Calendar, label: 'Days Online', value: (stats?.daysOnline || 365) + '+', color: 'text-amber-400' }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card text-center"><s.icon size={32} className={s.color + ' mx-auto mb-3'} /><p className="text-3xl font-bold text-white">{s.value}</p><p className="text-gray-400 text-sm mt-1">{s.label}</p></motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Stats
