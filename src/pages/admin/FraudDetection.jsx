import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Shield, Eye, Ban, CheckCircle } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatDate } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const FraudDetection = () => {
  const [flags, setFlags] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try { const r = await adminService.getFraudFlags(); setFlags(r.flags || r.data || []) }
      catch (e) { toast.error('Failed to load') }
      setIsLoading(false)
    }
    fetch()
  }, [])

  const handleSuspend = async (userId) => {
    try { await adminService.suspendUser(userId); toast.success('Suspended'); fetch() }
    catch (e) { toast.error('Failed') }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Fraud Detection</h1>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-800"><th className="text-left py-3 px-4 text-gray-400">User</th><th className="text-left py-3 px-4 text-gray-400">Reason</th><th className="text-left py-3 px-4 text-gray-400">Date</th><th className="text-left py-3 px-4 text-gray-400">Actions</th></tr></thead>
            <tbody>
              {flags.map((f, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-white">{f.user_email}</td>
                  <td className="py-3 px-4 text-gray-300">{f.message}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(f.created_at)}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleSuspend(f.user_id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Ban size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FraudDetection