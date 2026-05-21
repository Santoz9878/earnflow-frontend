import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, ToggleLeft, ToggleRight } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const MMFManagement = () => {
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => { try { const r = await adminService.getMMFPlans(); setPlans(r.plans || r.data || []) } catch (e) {}; setIsLoading(false) }
    fetch()
  }, [])

  const handleToggle = async (id) => {
    try { await adminService.toggleMMFPlan(id); toast.success('Toggled!'); fetch() } catch (e) { toast.error('Failed') }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">MMF Plan Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.id} className={`card ${!p.is_active ? 'opacity-60' : ''}`}>
            <div className="flex justify-between mb-4">
              <div className="flex items-center space-x-3"><Shield size={20} className="text-purple-400" /><h3 className="text-white font-bold">{p.name}</h3></div>
              <button onClick={() => handleToggle(p.id)}>{p.is_active ? <ToggleRight size={28} className="text-emerald-400" /> : <ToggleLeft size={28} className="text-gray-500" />}</button>
            </div>
            <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-400">Min</span><span className="text-white">{formatCurrency(p.min_invest)}</span></div><div className="flex justify-between"><span className="text-gray-400">Return</span><span className="text-emerald-400 font-bold">{p.return_percent}%</span></div><div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-white">{p.duration_type}</span></div></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MMFManagement