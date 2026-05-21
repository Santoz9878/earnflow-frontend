import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DollarSign, Lock } from 'lucide-react'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        className="text-center w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/30"
        >
          <DollarSign size={48} className="text-white" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl lg:text-5xl font-extrabold text-white mb-3"
        >
          EarnFlow
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-400 text-lg mb-2"
        >
          Your Gateway to Online Earnings
        </motion.p>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-gray-500 text-sm mb-10"
        >
          Join thousands already earning
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="space-y-4"
        >
          <Link 
            to="/login" 
            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/25"
          >
            Sign In
          </Link>
          
          <Link 
            to="/register" 
            className="block w-full border-2 border-gray-700 hover:border-blue-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:bg-gray-900"
          >
            Create Account
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-10 flex items-center justify-center space-x-2 text-gray-600"
        >
          <Lock size={14} />
          <span className="text-xs">Secured & Encrypted</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="mt-8 space-y-2"
        >
          <Link 
            to="/admin-login" 
            className="text-gray-700 hover:text-gray-500 text-xs transition-colors block"
          >
            Admin Portal
          </Link>
          <div className="flex justify-center space-x-4">
            <Link to="/terms" className="text-gray-700 hover:text-gray-500 text-xs transition-colors">Terms</Link>
            <Link to="/privacy" className="text-gray-700 hover:text-gray-500 text-xs transition-colors">Privacy</Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Landing