import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { formatCurrency, timeAgo } from '../../utils/formatCurrency'

const TransactionList = ({ transactions = [] }) => {
  const getIcon = (type) => {
    if (type === 'credit') return <ArrowUpRight size={16} className="text-emerald-400" />
    if (type === 'debit') return <ArrowDownRight size={16} className="text-red-400" />
    return <Minus size={16} className="text-gray-400" />
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
      {transactions.length === 0 ? <p className="text-gray-400 text-center py-6">No transactions yet</p> : (
        <div className="space-y-3">
          {transactions.slice(0, 5).map((txn, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
              <div className="flex items-center space-x-3">
                <div className={'w-8 h-8 rounded-full flex items-center justify-center ' + (txn.type === 'credit' ? 'bg-emerald-500/20' : txn.type === 'debit' ? 'bg-red-500/20' : 'bg-gray-700')}>
                  {getIcon(txn.type)}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{txn.description}</p>
                  <p className="text-gray-500 text-xs">{timeAgo(txn.created_at)}</p>
                </div>
              </div>
              <span className={'font-semibold text-sm ' + (txn.type === 'credit' ? 'text-emerald-400' : txn.type === 'debit' ? 'text-red-400' : 'text-gray-400')}>
                {txn.type === 'credit' ? '+' : txn.type === 'debit' ? '-' : ''}{formatCurrency(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TransactionList
