import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, reset } from '../redux/slices/authSlice'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Gift, UserPlus, DollarSign, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { validateEmail, validatePassword } from '../utils/validators'
import { authService } from '../services/authService'
import { REGISTRATION_FEE, SIGNUP_BONUS } from '../utils/constants'
import toast from 'react-hot-toast'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState(null)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const dispatch = useDispatch()
  const { isLoading, isError, message } = useSelector((state) => state.auth)
  const { register: registerField, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    const result = await dispatch(register({ email: data.email, password: data.password, referral_code: data.referral_code || null }))
    if (register.fulfilled.match(result)) {
      setUserId(result.payload.user_id)
      setStep(2)
      toast.success('Account created! Complete payment to activate.')
    } else { toast.error(result.payload || 'Registration failed') }
    dispatch(reset())
  }

  const handlePayment = async () => {
    if (!mpesaPhone || mpesaPhone.length < 10) { toast.error('Enter valid M-Pesa number'); return }
    setIsPaying(true)
    try {
      await authService.payRegistration({ user_id: userId, phone_number: mpesaPhone })
      toast.success('STK Push sent! Enter M-Pesa PIN.')
      setTimeout(() => { toast.success('Payment confirmed! You can now login.'); window.location.href = '/login' }, 15000)
    } catch (error) { toast.error(error.response?.data?.message || 'Payment failed') }
    setIsPaying(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <DollarSign size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">EarnFlow</span>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          {step === 1 ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white">Create Account</h1>
                <p className="text-gray-400 text-sm mt-1">Registration fee: Ksh {REGISTRATION_FEE}</p>
              </div>

              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                <Gift size={16} />
                <span>Get Ksh {SIGNUP_BONUS} bonus instantly after payment!</span>
              </div>

              {isError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm text-center">{message}</div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="email" {...registerField('email', { required: 'Email is required', validate: (v) => validateEmail(v) || 'Invalid email' })} className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="you@example.com" />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1 ml-2">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type={showPassword ? 'text' : 'password'} {...registerField('password', { required: 'Password is required', validate: (v) => validatePassword(v) || '8+ chars, 1 number' })} className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1 ml-2">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type={showConfirm ? 'text' : 'password'} {...registerField('confirmPassword', { required: 'Confirm your password', validate: (v) => v === password || 'Passwords do not match' })} className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 ml-2">{errors.confirmPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Referral Code (Optional)</label>
                  <div className="relative">
                    <Gift size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" {...registerField('referral_code')} className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="Enter promo code" />
                  </div>
                </div>

                <label className="flex items-start space-x-2">
                  <input type="checkbox" required className="mt-1 rounded bg-gray-800 border-gray-600" />
                  <span className="text-sm text-gray-400">
                    I agree to the <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms & Conditions</Link> and <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
                  </span>
                </label>

                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center space-x-2">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={18} /><span>Continue to Payment - Ksh {REGISTRATION_FEE}</span></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
                <p className="text-gray-400 text-sm mt-1">Enter M-Pesa number to pay Ksh {REGISTRATION_FEE}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">M-Pesa Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="0712 345 678" />
                  </div>
                  <p className="text-gray-500 text-xs mt-1 ml-2">STK Push will be sent to this number</p>
                </div>

                <div className="bg-gray-800/50 rounded-2xl p-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Registration Fee</span><span className="text-white">Ksh {REGISTRATION_FEE}</span></div>
                  <div className="flex justify-between text-sm mt-2"><span className="text-gray-400">Signup Bonus</span><span className="text-emerald-400">+Ksh {SIGNUP_BONUS}</span></div>
                  <hr className="border-gray-700 my-3" />
                  <div className="flex justify-between font-bold"><span className="text-white">Balance After Payment</span><span className="text-emerald-400">Ksh {SIGNUP_BONUS}</span></div>
                </div>

                <button onClick={handlePayment} disabled={isPaying} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-600/25 disabled:opacity-50">
                  {isPaying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : `Pay Ksh ${REGISTRATION_FEE} via M-Pesa`}
                </button>

                <button onClick={() => setStep(1)} className="w-full border border-gray-700 hover:border-gray-500 text-white font-semibold py-3.5 rounded-2xl transition-all">Back</button>
              </div>
            </>
          )}

          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register