import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Users, Copy, Check, Gift, TrendingUp } from 'lucide-react'
import { fetchReferralStats, fetchReferrals } from '../redux/slices/referralSlice'
import { formatCurrency, formatDate } from '../utils/formatCurrency'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Referrals = () => {
  const dispatch = useDispatch()
  const { stats, referrals, isLoading } = useSelector((state) => state.referral)
  const { user } = useSelector((state) => state.auth)
  const [copied, setCopied] = useState(false)
  const promoCode = user?.promo_code || 'LOADING'
  useEffect(() => { dispatch(fetchReferralStats()); dispatch(fetchReferrals()) }, [dispatch])
  const handleCopy = () => { navigator.clipboard.writeText(promoCode); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }
  if (isLoading) return <LoadingSpinner />
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="text-2xl lg:text-3xl font-bold text-white">Referral Program</h1><p className="text-gray-400">Earn Ksh 200 per referral</p></motion.div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card"><Users size={24} className="text-blue-400 mb-2" /><p className="text-2xl font-bold text-white">{stats?.totalReferrals || 0}</p><p className="text-gray-400 text-sm">Total Referrals</p></div>
        <div className="card"><TrendingUp size={24} className="text-emerald-400 mb-2" /><p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalEarned || 0)}</p><p className="text-gray-400 text-sm">Total Earned</p></div>
      </div>
      <div className="card mb-8 text-center">
        <Gift size={32} className="text-amber-400 mx-auto mb-2" /><h2 className="text-lg font-bold text-white mb-4">Your Promo Code</h2>
        <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between max-w-xs mx-auto mb-4"><span className="text-2xl font-bold text-white tracking-widest">{promoCode}</span><button onClick={handleCopy} className="btn-primary text-sm">{copied ? <Check size={18} /> : <Copy size={18} />}</button></div>
      </div>
      <div className="card"><h3 className="text-lg font-semibold text-white mb-4">Referral History</h3>
        {referrals?.length === 0 ? <p className="text-gray-400 text-center py-6">No referrals yet</p> : (
          <div className="space-y-3">{referrals?.map((r, i) => (<div key={i} className="flex justify-between py-2 border-b border-gray-800"><div><p className="text-white text-sm">{r.referred_user_email || 'User'}</p><p className="text-gray-500 text-xs">{formatDate(r.created_at)}</p></div><span className="text-emerald-400 font-semibold">{formatCurrency(r.bonus_amount || 200)}</span></div>))}</div>
        )}
      </div>
    </div>
  )
}

export default Referrals
