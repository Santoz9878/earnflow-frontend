import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, TrendingUp, User } from 'lucide-react'
import { api } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const fetch = async () => { try { const r = await api.get('/api/leaderboard'); setLeaders(r.data) } catch (e) {}; setIsLoading(false) }
    fetch()
  }, [])

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} className="text-yellow-400" />
    if (rank === 2) return <Medal size={24} className="text-gray-300" />
    if (rank === 3) return <Medal size={24} className="text-amber-600" />
    return <span className="text-gray-400 font-bold">{rank}</span>
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <Trophy size={40} className="text-amber-400 mx-auto mb-4" />
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Weekly Leaderboard</h1>
      </motion.div>
      <div className="card">
        <div className="space-y-2">
          {leaders?.map((leader, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 flex items-center justify-center">{getRankIcon(i + 1)}</div>
                <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"><User size={14} className="text-gray-400" /></div><p className="text-white text-sm">{leader.username || 'User ' + (i + 1)}</p></div>
              </div>
              <div className="flex items-center space-x-2"><TrendingUp size={14} className="text-emerald-400" /><span className="text-emerald-400 font-semibold">{formatCurrency(leader.earnings)}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
