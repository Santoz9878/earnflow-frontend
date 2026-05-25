import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle } from 'lucide-react'
import { fetchBalance, requestTopUp } from '../redux/slices/walletSlice'
import { formatCurrency } from '../utils/formatCurrency'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const TopUp = () => {
  const dispatch = useDispatch()
  const { balance, isLoading } = useSelector((state) => state.wallet)
  const [amount, setAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const quickAmounts = [100, 500, 1000, 2500, 5000, 10000]

  useEffect(() => {
    dispatch(fetchBalance())
  }, [dispatch])

  const handleQuickSelect = (quickAmount) => {
    setSelectedAmount(quickAmount)
    setAmount(quickAmount.toString())
  }

  const handleTopUp = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (amt < 50) {
      toast.error('Minimum top-up is Ksh 50')
      return
    }
    if (amt > 100000) {
      toast.error('Maximum top-up is Ksh 100,000')
      return
    }

    setIsSubmitting(true)
    try {
      await dispatch(requestTopUp({ amount: amt, method: paymentMethod })).unwrap()
      setShowSuccess(true)
      setAmount('')
      setSelectedAmount(null)
      toast.success('Top-up request submitted!')
      dispatch(fetchBalance())
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (e) {
      toast.error(e || 'Top-up failed')
    }
    setIsSubmitting(false)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Top Up Wallet</h1>
        <p className="text-gray-400 mt-2">Add funds to your account quickly and securely</p>
      </motion.div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card mb-6 bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center space-x-3">
            <CheckCircle size={24} className="text-emerald-400" />
            <div>
              <p className="text-emerald-400 font-semibold">Success!</p>
              <p className="text-emerald-300/70 text-sm">Your top-up is being processed</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Balance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card bg-gradient-to-br from-blue-600 to-blue-900 mb-8">
        <div className="text-center">
          <p className="text-blue-200 text-sm mb-2">Current Balance</p>
          <h2 className="text-4xl font-bold text-white">{formatCurrency(balance)}</h2>
        </div>
      </motion.div>

      {/* Quick Amount Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Select</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickAmounts.map((qa) => (
            <motion.button
              key={qa}
              onClick={() => handleQuickSelect(qa)}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl font-semibold transition-all ${
                selectedAmount === qa
                  ? 'bg-blue-600 text-white border-2 border-blue-400'
                  : 'bg-gray-800/50 text-gray-300 border-2 border-transparent hover:border-blue-500/50'
              }`}
            >
              {formatCurrency(qa)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Custom Amount Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Custom Amount</h3>
        <div className="relative mb-4">
          <span className="absolute left-4 top-3 text-gray-400 text-lg">Ksh</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setSelectedAmount(null)
            }}
            className="input-field pl-14"
            placeholder="Enter amount"
            min="50"
            max="100000"
          />
        </div>
        {amount && (
          <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Amount</span>
              <span className="text-white">{formatCurrency(parseFloat(amount) || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Processing Fee</span>
              <span className="text-emerald-400">Free</span>
            </div>
            <div className="border-t border-gray-700 my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="text-white font-semibold">Total</span>
              <span className="text-blue-400 font-semibold">{formatCurrency(parseFloat(amount) || 0)}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Payment Method */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
        <div className="space-y-3">
          {[
            { value: 'mpesa', label: 'M-Pesa', description: 'Instant transfer' },
            { value: 'card', label: 'Debit/Credit Card', description: 'Secure payment' },
            { value: 'bank', label: 'Bank Transfer', description: '1-2 hours' },
          ].map((method) => (
            <label
              key={method.value}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === method.value
                  ? 'bg-blue-600/10 border-blue-500'
                  : 'bg-gray-800/30 border-gray-700 hover:border-blue-500/50'
              }`}
            >
              <input
                type="radio"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <div className="ml-3">
                <p className="font-medium text-white">{method.label}</p>
                <p className="text-sm text-gray-400">{method.description}</p>
              </div>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
        <button
          onClick={handleTopUp}
          disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <CreditCard size={20} />
          <span>{isSubmitting ? 'Processing...' : `Top Up ${amount ? formatCurrency(parseFloat(amount)) : ''}`}</span>
        </button>
        <p className="text-center text-gray-500 text-xs mt-4">By proceeding, you agree to our Terms of Service</p>
      </motion.div>
    </div>
  )
}

export default TopUp
