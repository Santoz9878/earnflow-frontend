import { motion } from 'framer-motion'
import { TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

const RevenueReports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Revenue Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card"><TrendingUp size={24} className="text-emerald-400 mb-2" /><p className="text-2xl font-bold text-white">{formatCurrency(520000)}</p><p className="text-gray-400 text-sm">Total Revenue</p></div>
        <div className="card"><DollarSign size={24} className="text-red-400 mb-2" /><p className="text-2xl font-bold text-white">{formatCurrency(380000)}</p><p className="text-gray-400 text-sm">Total Payouts</p></div>
        <div className="card"><DollarSign size={24} className="text-blue-400 mb-2" /><p className="text-2xl font-bold text-white">{formatCurrency(140000)}</p><p className="text-gray-400 text-sm">Net Profit</p></div>
      </div>
    </div>
  )
}

export default RevenueReports