import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, reset } from '../redux/slices/authSlice'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { validateEmail } from '../utils/validators'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, isError, message } = useSelector((state) => state.auth)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    const result = await dispatch(login({ email: data.email, password: data.password }))
    if (login.fulfilled.match(result)) {
      if (!result.payload.user.is_admin) {
        toast.error('Access denied. Admin only.')
        return
      }
      toast.success('Welcome Admin!')
      navigate('/admin')
    } else {
      toast.error(result.payload || 'Login failed')
    }
    dispatch(reset())
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-600/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Restricted access</p>
        </div>

        <div className="bg-gray-900 border border-amber-800/30 rounded-3xl p-8 shadow-2xl">
          {isError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Admin Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required', validate: (v) => validateEmail(v) || 'Invalid email' })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  placeholder="admin@earnflow.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-amber-600/25 disabled:opacity-50 flex items-center justify-center space-x-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={18} />
                  <span>Admin Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
              Back to main site
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin