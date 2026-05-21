import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Banknote, CheckCircle, XCircle } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDate } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const WithdrawalApprovals = () => {
  const [withdrawals, setWithdrawals] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => { try { const r = await adminService.getPendingWithdrawals(); setWithdrawals(r.withdrawals || r.data || []) } catch (e) {}; setIsLoading(false) }
    fetch()
  }, [])

  const handleApprove = async (id) => {
    try { await adminService.approveWithdrawal(id, {}); toast.success('Approved!'); fetch() } catch (e) { toast.error('Failed') }
  }

  const handleReject = async (id) => {
    try { await adminService.rejectWithdrawal(id, 'Rejected by admin'); toast.success('Rejected'); fetch() } catch (e) { toast.error('Failed') }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Withdrawal Approvals</h1>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-gray-800"><th className="text-left py-3 px-4 text-gray-400">User</th><th className="text-left py-3 px-4 text-gray-400">M-Pesa</th><th className="text-left py-3 px-4 text-gray-400">Amount</th><th className="text-left py-3 px-4 text-gray-400">Date</th><th className="text-left py-3 px-4 text-gray-400">Status</th><th className="text-left py-3 px-4 text-gray-400">Actions</th></tr></thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-gray-800/50">
                <td className="py-3 px-4 text-white">{w.user_email}</td>
                <td className="py-3 px-4 text-white">{w.mpesa_number}</td>
                <td className="py-3 px-4 text-white font-semibold">{formatCurrency(w.amount)}</td>
                <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(w.created_at)}</td>
                <td className="py-3 px-4"><span className={`badge ${w.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>{w.status}</span></td>
                <td className="py-3 px-4">
                  {w.status === 'pending' && (
                    <div className="flex space-x-1">
                      <button onClick={() => handleApprove(w.id)} className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg"><CheckCircle size={16} /></button>
                      <button onClick={() => handleReject(w.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><XCircle size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WithdrawalApprovals