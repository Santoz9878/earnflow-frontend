import { useState } from 'react'
import { Copy, Check, Users } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'
import toast from 'react-hot-toast'

const ReferralCard = ({ promoCode, stats }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode || 'LOADING')
    setCopied(true)
    toast.success('Promo code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center"><Users size={20} className="text-amber-400" /></div>
        <div>
          <h3 className="text-lg font-semibold text-white">Your Referral Code</h3>
          <p className="text-sm text-gray-400">Earn Ksh 200 per referral</p>
        </div>
      </div>
      <div className="bg-gray-950 rounded-xl p-4 flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-white tracking-wider">{promoCode || 'LOADING'}</span>
        <button onClick={handleCopy} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all">
          {copied ? <Check size={18} /> : <Copy size={18} />}<span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      {stats && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
          <div><p className="text-gray-400 text-xs">Total Referrals</p><p className="text-white font-bold text-lg">{stats.totalReferrals || 0}</p></div>
          <div><p className="text-gray-400 text-xs">Total Earned</p><p className="text-emerald-400 font-bold text-lg">{formatCurrency(stats.totalEarned || 0)}</p></div>
        </div>
      )}
    </div>
  )
}

export default ReferralCard
