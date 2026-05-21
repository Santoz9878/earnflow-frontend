import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, UserPlus, Ban, DollarSign, CheckCircle } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [addForm, setAddForm] = useState({ email: '', password: '', is_agent: false })
  const [creditAmount, setCreditAmount] = useState('')
  const [creditType, setCreditType] = useState('credit')

  useEffect(() => { fetchUsers() }, [search])

  const fetchUsers = async () => {
    setIsLoading(true)
    try { const r = await adminService.getUsers({ search }); setUsers(r.users || r.data || []) }
    catch (e) { toast.error('Failed to load users') }
    setIsLoading(false)
  }

  const handleAddUser = async () => {
    try { await adminService.addUser(addForm); toast.success('User added!'); setShowAddModal(false); setAddForm({ email: '', password: '', is_agent: false }); fetchUsers() }
    catch (e) { toast.error('Failed') }
  }

  const handleSuspend = async (userId) => {
    try { await adminService.suspendUser(userId); toast.success('Done'); fetchUsers() }
    catch (e) { toast.error('Failed') }
  }

  const handleCreditDebit = async () => {
    const amt = parseFloat(creditAmount)
    if (!amt) { toast.error('Enter amount'); return }
    try {
      if (creditType === 'credit') { await adminService.creditUser(selectedUser.id, amt) }
      else { await adminService.debitUser(selectedUser.id, amt) }
      toast.success('Done!'); setShowCreditModal(false); fetchUsers()
    } catch (e) { toast.error('Failed') }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center space-x-2"><UserPlus size={18} /><span>Add User/Agent</span></button>
      </div>
      <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search users..." /></div>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-gray-800"><th className="text-left py-3 px-4 text-gray-400">User</th><th className="text-left py-3 px-4 text-gray-400">Balance</th><th className="text-left py-3 px-4 text-gray-400">Referrals</th><th className="text-left py-3 px-4 text-gray-400">Status</th><th className="text-left py-3 px-4 text-gray-400">Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-800/50">
                <td className="py-3 px-4"><p className="text-white">{u.email}</p></td>
                <td className="py-3 px-4 text-emerald-400">{formatCurrency(u.balance)}</td>
                <td className="py-3 px-4 text-white">{u.total_referrals || 0}</td>
                <td className="py-3 px-4"><span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Suspended'}</span></td>
                <td className="py-3 px-4">
                  <button onClick={() => { setSelectedUser(u); setShowCreditModal(true) }} className="p-2 text-emerald-400 hover:bg-gray-700 rounded-lg"><DollarSign size={16} /></button>
                  <button onClick={() => handleSuspend(u.id)} className="p-2 text-red-400 hover:bg-gray-700 rounded-lg"><Ban size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add User/Agent</h2>
            <input type="email" value={addForm.email} onChange={(e) => setAddForm(p => ({...p, email: e.target.value}))} className="input-field mb-3" placeholder="Email" />
            <input type="password" value={addForm.password} onChange={(e) => setAddForm(p => ({...p, password: e.target.value}))} className="input-field mb-3" placeholder="Password" />
            <label className="flex items-center space-x-2 mb-4"><input type="checkbox" checked={addForm.is_agent} onChange={(e) => setAddForm(p => ({...p, is_agent: e.target.checked}))} /><span className="text-white text-sm">Register as Agent</span></label>
            <div className="flex space-x-3"><button onClick={() => setShowAddModal(false)} className="flex-1 btn-outline">Cancel</button><button onClick={handleAddUser} className="flex-1 btn-primary">Add</button></div>
          </div>
        </div>
      )}

      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">{creditType === 'credit' ? 'Credit' : 'Debit'} - {selectedUser.email}</h2>
            <div className="flex space-x-2 mb-3">
              <button onClick={() => setCreditType('credit')} className={`flex-1 py-2 rounded-xl ${creditType === 'credit' ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'}`}>Credit</button>
              <button onClick={() => setCreditType('debit')} className={`flex-1 py-2 rounded-xl ${creditType === 'debit' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'}`}>Debit</button>
            </div>
            <input type="number" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} className="input-field mb-3" placeholder="Amount" />
            <div className="flex space-x-3"><button onClick={() => setShowCreditModal(false)} className="flex-1 btn-outline">Cancel</button><button onClick={handleCreditDebit} className="flex-1 btn-primary">Confirm</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement