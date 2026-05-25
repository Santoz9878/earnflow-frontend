import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Plus, Minus } from 'lucide-react'
import { fetchBalance, fetchTransactions } from '../redux/slices/walletSlice'
import { formatCurrency, formatDate } from '../utils/formatCurrency'
import LoadingSpinner from '../components/common/LoadingSpinner'

const WalletPage = () => {
  const dispatch = useDispatch()
  const { balance, transactions, isLoading } = useSelector((state) => state.wallet)
  useEffect(() => { dispatch(fetchBalance()); dispatch(fetchTransactions({ page: 1, limit: 20 })) }, [dispatch])
  if (isLoading) return <LoadingSpinner />
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="text-2xl lg:text-3xl font-bold text-white">Wallet</h1></motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card bg-gradient-to-br from-blue-600 to-blue-900 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"><div><p className="text-blue-200 text-sm">Balance</p><h2 className="text-4xl font-bold text-white">{formatCurrency(balance)}</h2></div><div className="flex gap-2 w-full sm:w-auto"><Link to="/dashboard/topup" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex-1 sm:flex-initial"><Plus size={20} />Top Up</Link><Link to="/dashboard/withdraw" className="flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex-1 sm:flex-initial"><Minus size={20} />Withdraw</Link></div></div>
      </motion.div>
      <div className="card"><h3 className="text-lg font-semibold text-white mb-4">Transactions</h3>
        {transactions?.length === 0 ? <p className="text-gray-400 text-center py-6">No transactions</p> : (
          <div className="space-y-3">{transactions?.map((txn, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className={'w-8 h-8 rounded-full flex items-center justify-center ' + (txn.type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20')}>{txn.type === 'credit' ? <ArrowUpRight size={16} className="text-emerald-400" /> : <ArrowDownRight size={16} className="text-red-400" />}</div>
                <div><p className="text-white text-sm">{txn.description}</p><p className="text-gray-500 text-xs">{formatDate(txn.created_at)}</p></div>
              </div>
              <span className={txn.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}>{txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}</span>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  )
}

export default WalletPage
