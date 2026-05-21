import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import { fetchBalance, requestWithdrawal, fetchWithdrawals } from '../redux/slices/walletSlice'
import { fetchProfile, updateMpesaNumber } from '../redux/slices/userSlice'
import { formatCurrency, formatDate } from '../utils/formatCurrency'
import { MIN_WITHDRAWAL } from '../utils/constants'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Withdraw = () => {
  const dispatch = useDispatch()
  const { balance, withdrawals, isLoading } = useSelector((state) => state.wallet)
  const { profile } = useSelector((state) => state.user)
  const [amount, setAmount] = useState('')
  const [showMpesaForm, setShowMpesaForm] = useState(false)
  const [mpesaNumber, setMpesaNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => { dispatch(fetchBalance()); dispatch(fetchProfile()); dispatch(fetchWithdrawals()) }, [dispatch])
  const hasMpesaNumber = profile?.mpesa_withdrawal_number

  const handleSaveMpesa = async () => {
    try { await dispatch(updateMpesaNumber({ mpesa_number: mpesaNumber })).unwrap(); toast.success('Saved!'); setShowMpesaForm(false) }
    catch (e) { toast.error('Failed to save') }
  }

  const handleWithdraw = async () => {
    const amt = parseFloat(amount)
    if (amt < MIN_WITHDRAWAL) { toast.error('Minimum is ' + formatCurrency(MIN_WITHDRAWAL)); return }
    if (amt > balance) { toast.error('Insufficient balance'); return }
    setIsSubmitting(true)
    try { await dispatch(requestWithdrawal({ amount: amt })).unwrap(); toast.success('Withdrawal submitted!'); setAmount(''); dispatch(fetchBalance()); dispatch(fetchWithdrawals()) }
    catch (e) { toast.error(e || 'Failed') }
    setIsSubmitting(false)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="text-2xl lg:text-3xl font-bold text-white">Withdraw</h1></motion.div>
      <div className="card mb-6">
        <div className="flex justify-between mb-4"><div><p className="text-gray-400 text-sm">Balance</p><p className="text-3xl font-bold text-white">{formatCurrency(balance)}</p></div><div><p className="text-gray-400 text-sm">Minimum</p><p className="text-xl font-bold text-amber-400">{formatCurrency(MIN_WITHDRAWAL)}</p></div></div>
        <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: Math.min((balance / MIN_WITHDRAWAL) * 100, 100) + '%' }} /></div>
      </div>
      {!hasMpesaNumber && !showMpesaForm && (
        <div className="card text-center"><Phone size={48} className="text-gray-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-white mb-2">Set M-Pesa Number</h3><button onClick={() => setShowMpesaForm(true)} className="btn-primary">Set Number</button></div>
      )}
      {showMpesaForm && (
        <div className="card mb-6"><input type="tel" value={mpesaNumber} onChange={(e) => setMpesaNumber(e.target.value)} className="input-field mb-3" placeholder="0712345678" /><div className="flex space-x-2"><button onClick={handleSaveMpesa} className="btn-primary flex-1">Save</button><button onClick={() => setShowMpesaForm(false)} className="btn-outline">Cancel</button></div></div>
      )}
      {hasMpesaNumber && (
        <div className="card mb-6">
          <div className="bg-gray-800/50 rounded-xl p-3 mb-4 flex items-center space-x-2"><Phone size={16} className="text-gray-400" /><span className="text-white">{profile?.mpesa_withdrawal_number}</span><button onClick={() => setShowMpesaForm(true)} className="text-blue-400 text-sm ml-auto">Change</button></div>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field mb-3" placeholder={'Min ' + MIN_WITHDRAWAL} />
          <button onClick={handleWithdraw} disabled={isSubmitting || !amount || parseFloat(amount) < MIN_WITHDRAWAL} className="btn-primary w-full">{isSubmitting ? 'Processing...' : 'Withdraw ' + (amount ? formatCurrency(parseFloat(amount)) : '')}</button>
        </div>
      )}
      <div className="card"><h3 className="text-lg font-semibold text-white mb-4">History</h3>
        {withdrawals?.length === 0 ? <p className="text-gray-400 text-center py-4">No withdrawals yet</p> : withdrawals?.map((w, i) => (<div key={i} className="flex justify-between py-2 border-b border-gray-800"><div><p className="text-white">{formatCurrency(w.amount)}</p><p className="text-gray-500 text-xs">{formatDate(w.created_at)}</p></div><span className={'badge ' + (w.status === 'processed' ? 'badge-success' : 'badge-warning')}>{w.status}</span></div>))}
      </div>
    </div>
  )
}

export default Withdraw
