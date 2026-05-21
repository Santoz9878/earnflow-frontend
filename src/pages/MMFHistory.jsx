import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { fetchInvestments } from '../redux/slices/mmfSlice'
import { formatCurrency, formatDate } from '../utils/formatCurrency'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

const MMFHistory = () => {
  const dispatch = useDispatch()
  const { investments, isLoading } = useSelector((state) => state.mmf)
  useEffect(() => { dispatch(fetchInvestments()) }, [dispatch])
  if (isLoading) return <LoadingSpinner />
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="text-2xl lg:text-3xl font-bold text-white">Investment History</h1></motion.div>
      {investments?.length === 0 ? <EmptyState icon={Shield} title="No investments yet" /> : (
        <div className="space-y-4">
          {investments?.map((inv, i) => (
            <motion.div key={inv.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-start space-x-4"><div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center"><Shield size={24} className="text-purple-400" /></div><div><h3 className="text-white font-semibold">{inv.plan_name}</h3><p className="text-gray-400 text-sm">{formatCurrency(inv.amount)} • {formatDate(inv.start_date)}</p></div></div>
              <div className="text-right"><p className="text-emerald-400 font-bold">{formatCurrency(inv.amount + (inv.amount * inv.return_percent / 100))}</p><span className={'badge ' + (inv.status === 'active' ? 'badge-info' : 'badge-success')}>{inv.status}</span></div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MMFHistory
