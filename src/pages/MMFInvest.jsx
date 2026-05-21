import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowRight } from 'lucide-react'
import { fetchPlans, invest, fetchInvestments } from '../redux/slices/mmfSlice'
import { fetchBalance } from '../redux/slices/walletSlice'
import { formatCurrency } from '../utils/formatCurrency'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const MMFInvest = () => {
  const dispatch = useDispatch()
  const { plans, isLoading } = useSelector((state) => state.mmf)
  const { balance } = useSelector((state) => state.wallet)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [investAmount, setInvestAmount] = useState('')
  const [isInvesting, setIsInvesting] = useState(false)

  useEffect(() => { dispatch(fetchPlans()); dispatch(fetchBalance()) }, [dispatch])

  const handleInvest = async () => {
    const amount = parseFloat(investAmount)
    if (amount < selectedPlan.min_invest) { toast.error('Minimum is ' + formatCurrency(selectedPlan.min_invest)); return }
    if (amount > balance) { toast.error('Insufficient balance'); return }
    setIsInvesting(true)
    try { await dispatch(invest({ plan_id: selectedPlan.id, amount })).unwrap(); dispatch(fetchBalance()); dispatch(fetchInvestments()); toast.success('Investment successful!'); setSelectedPlan(null) }
    catch (error) { toast.error(error || 'Investment failed') }
    setIsInvesting(false)
  }

  if (isLoading) return <LoadingSpinner text="Loading MMF plans..." />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl lg:text-3xl font-bold text-white">MMF Investments</h1><p className="text-gray-400 mt-1">Invest and earn returns (no daily limit!)</p></div>
          <Link to="/dashboard/mmf/history" className="btn-outline flex items-center space-x-2 text-sm"><span>History</span><ArrowRight size={16} /></Link>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans?.map((plan, index) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="card">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4"><Shield size={28} className="text-purple-400" /></div>
            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{plan.duration_type}</p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Min</span><span className="text-white">{formatCurrency(plan.min_invest)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Return</span><span className="text-emerald-400 font-bold text-lg">{plan.return_percent}%</span></div>
            </div>
            <button onClick={() => { setSelectedPlan(plan); setInvestAmount(plan.min_invest.toString()) }} disabled={!plan.is_active} className="btn-primary w-full">Invest Now</button>
          </motion.div>
        ))}
      </div>
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Invest in {selectedPlan.name}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Amount (Ksh)</label><input type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} className="input-field" min={selectedPlan.min_invest} /></div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Return</span><span className="text-emerald-400">+{formatCurrency(parseFloat(investAmount || 0) * selectedPlan.return_percent / 100)}</span></div>
                <hr className="border-gray-700 my-2" />
                <div className="flex justify-between font-bold"><span className="text-white">Total</span><span className="text-emerald-400">{formatCurrency(parseFloat(investAmount || 0) + (parseFloat(investAmount || 0) * selectedPlan.return_percent / 100))}</span></div>
              </div>
              <p className="text-amber-400 text-xs">Early withdrawal = loss of interest + 10% penalty</p>
              <div className="flex space-x-3">
                <button onClick={() => setSelectedPlan(null)} className="flex-1 btn-outline">Cancel</button>
                <button onClick={handleInvest} disabled={isInvesting} className="flex-1 btn-primary">{isInvesting ? '...' : 'Confirm'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MMFInvest
