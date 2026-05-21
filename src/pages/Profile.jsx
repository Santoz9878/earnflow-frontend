import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Shield, Camera, Upload, Lock } from 'lucide-react'
import { fetchProfile, submitKYC, updateMpesaNumber } from '../redux/slices/userSlice'
import { formatDate } from '../utils/formatCurrency'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Profile = () => {
  const dispatch = useDispatch()
  const { profile, kycStatus, isLoading } = useSelector((state) => state.user)
  const { user } = useSelector((state) => state.auth)
  const [showMpesaForm, setShowMpesaForm] = useState(false)
  const [showKYCForm, setShowKYCForm] = useState(false)
  const [mpesaNumber, setMpesaNumber] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  useEffect(() => { dispatch(fetchProfile()) }, [dispatch])

  const handleMpesaUpdate = async () => {
    try { await dispatch(updateMpesaNumber({ mpesa_number: mpesaNumber })).unwrap(); toast.success('Updated!'); setShowMpesaForm(false) }
    catch (e) { toast.error('Failed') }
  }

  const handleKYCSubmit = async () => {
    try { await dispatch(submitKYC({})).unwrap(); toast.success('KYC submitted!'); setShowKYCForm(false) }
    catch (e) { toast.error('Failed') }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="text-2xl lg:text-3xl font-bold text-white">My Profile</h1></motion.div>
      <div className="card mb-6">
        <div className="flex items-center space-x-4 mb-6"><div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center"><span className="text-2xl font-bold text-white">{user?.email?.charAt(0).toUpperCase()}</span></div><div><h2 className="text-xl font-bold text-white">{user?.email}</h2><p className="text-gray-400 text-sm">Member since {formatDate(profile?.created_at)}</p></div></div>
        <div className="space-y-3">
          <div className="flex justify-between py-3 border-b border-gray-800"><div className="flex items-center space-x-3"><Mail size={18} className="text-gray-500" /><div><p className="text-gray-400 text-xs">Email</p><p className="text-white">{user?.email}</p></div></div></div>
          <div className="flex justify-between py-3 border-b border-gray-800"><div className="flex items-center space-x-3"><Phone size={18} className="text-gray-500" /><div><p className="text-gray-400 text-xs">M-Pesa</p><p className="text-white">{profile?.mpesa_withdrawal_number || 'Not set'}</p></div></div><button onClick={() => setShowMpesaForm(!showMpesaForm)} className="text-blue-400 text-sm">Change</button></div>
          {showMpesaForm && (<div className="bg-gray-800/50 rounded-xl p-4"><input type="tel" value={mpesaNumber} onChange={(e) => setMpesaNumber(e.target.value)} className="input-field text-sm mb-2" /><div className="flex space-x-2"><button onClick={handleMpesaUpdate} className="btn-primary text-sm flex-1">Save</button><button onClick={() => setShowMpesaForm(false)} className="btn-outline text-sm">Cancel</button></div></div>)}
          <div className="flex justify-between py-3"><div className="flex items-center space-x-3"><Shield size={18} className="text-gray-500" /><div><p className="text-gray-400 text-xs">Promo Code</p><p className="text-white font-mono">{profile?.promo_code || 'N/A'}</p></div></div></div>
        </div>
      </div>
      <div className="card mb-6">
        <div className="flex justify-between mb-4"><div className="flex items-center space-x-3"><Shield size={20} className="text-purple-400" /><h3 className="text-lg font-semibold text-white">KYC Verification</h3></div><span className={'badge ' + (kycStatus === 'verified' ? 'badge-success' : kycStatus === 'pending' ? 'badge-warning' : 'badge-info')}>{kycStatus || 'Not Submitted'}</span></div>
        {!showKYCForm && (!kycStatus || kycStatus === 'rejected') && <button onClick={() => setShowKYCForm(true)} className="btn-primary text-sm">Submit KYC</button>}
        {showKYCForm && (<div className="space-y-3 bg-gray-800/50 rounded-xl p-4"><input type="text" placeholder="ID Number" className="input-field text-sm" /><div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center"><Upload size={24} className="text-gray-500 mx-auto mb-2" /><p className="text-gray-400 text-sm">Upload ID</p></div><div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center"><Camera size={24} className="text-gray-500 mx-auto mb-2" /><p className="text-gray-400 text-sm">Upload Selfie</p></div><div className="flex space-x-2"><button onClick={handleKYCSubmit} className="btn-primary flex-1 text-sm">Submit</button><button onClick={() => setShowKYCForm(false)} className="btn-outline text-sm">Cancel</button></div></div>)}
      </div>
      <div className="card"><h3 className="text-lg font-semibold text-white mb-4">Security</h3><button onClick={() => setShowPasswordForm(!showPasswordForm)} className="flex items-center space-x-3 text-gray-400 hover:text-white"><Lock size={18} /><span>Change Password</span></button>
        {showPasswordForm && (<div className="mt-4 space-y-3 bg-gray-800/50 rounded-xl p-4"><input type="password" placeholder="Current password" className="input-field text-sm" /><input type="password" placeholder="New password" className="input-field text-sm" /><input type="password" placeholder="Confirm password" className="input-field text-sm" /><div className="flex space-x-2"><button className="btn-primary text-sm flex-1">Update</button><button onClick={() => setShowPasswordForm(false)} className="btn-outline text-sm">Cancel</button></div></div>)}
      </div>
    </div>
  )
}

export default Profile
