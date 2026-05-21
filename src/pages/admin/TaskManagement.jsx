import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Edit3, Trash2 } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const TaskManagement = () => {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => { try { const r = await adminService.getTasks(); setTasks(r.tasks || r.data || []) } catch (e) {}; setIsLoading(false) }
    fetch()
  }, [])

  const handleDelete = async (id) => {
    try { await adminService.deleteTask(id); toast.success('Deleted'); fetch() } catch (e) { toast.error('Failed') }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h1 className="text-2xl font-bold text-white">Task Management</h1><button className="btn-primary flex items-center space-x-2"><Plus size={18} /><span>Add Task</span></button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((t) => (
          <div key={t.id} className="card">
            <div className="flex justify-between mb-2"><span className="text-gray-400 text-xs uppercase">{t.type}</span><div className="flex space-x-1"><button className="p-1 text-gray-400 hover:text-blue-400"><Edit3 size={14} /></button><button onClick={() => handleDelete(t.id)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button></div></div>
            <h3 className="text-white font-semibold mb-2">{t.title}</h3>
            <div className="flex justify-between text-sm"><span className="text-emerald-400 font-bold">{formatCurrency(t.reward_amount)}</span><span className="text-gray-500">{t.daily_limit}/day</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskManagement