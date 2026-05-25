import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Wallet, Zap, Users, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

const BottomNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard', id: 'home' },
    { icon: Zap, label: 'Earn', path: '/dashboard/earn', id: 'earn' },
    { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet', id: 'wallet' },
    { icon: Users, label: 'Referrals', path: '/dashboard/referrals', id: 'referrals' },
    { icon: Settings, label: 'Settings', path: '/dashboard/profile', id: 'profile' },
  ]

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center justify-center gap-1 py-2 px-4 transition-colors relative group"
              >
                <div className={`p-2 rounded-xl transition-all ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 group-hover:text-white'
                }`}>
                  <Icon size={24} />
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default BottomNavigation
