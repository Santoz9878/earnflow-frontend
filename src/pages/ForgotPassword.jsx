import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try { await authService.forgotPassword(email); setIsSent(true); toast.success('Reset link sent!') }
    catch (error) { toast.error('Failed to send reset link') }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="card">
          <Link to="/login" className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6"><ArrowLeft size={18} /><span>Back</span></Link>
          {!isSent ? (<><h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1><p className="text-gray-400 mb-6">Enter your email for a reset link</p><form onSubmit={handleSubmit} className="space-y-4"><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" required /></div><button type="submit" disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Send Reset Link'}</button></form></>) : (<div className="text-center"><CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" /><h2 className="text-xl font-bold text-white mb-2">Email Sent!</h2><p className="text-gray-400 mb-6">Check your email for the reset link</p><Link to="/login" className="btn-primary inline-block">Back to Login</Link></div>)}
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
