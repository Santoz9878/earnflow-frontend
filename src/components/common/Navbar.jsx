import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import { Menu, X, LogOut, User, ChevronDown, LayoutDashboard, DollarSign, Users, Wallet } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Earn', path: '/dashboard/earn', icon: DollarSign },
    { name: 'MMF', path: '/dashboard/mmf', icon: Wallet },
    { name: 'Referrals', path: '/dashboard/referrals', icon: Users },
    { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
  ]

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="EarnFlow logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold text-white">EarnFlow</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all">
                <link.icon size={18} /><span>{link.name}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-2 z-50">
                  <Link to="/dashboard/profile" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700" onClick={() => setShowDropdown(false)}>
                    <User size={16} /><span>Profile</span>
                  </Link>
                  <hr className="border-gray-700 my-2" />
                  <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-700 w-full">
                    <LogOut size={16} /><span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800" onClick={() => setIsOpen(false)}>
                <link.icon size={18} /><span>{link.name}</span>
              </Link>
            ))}
            <hr className="border-gray-700" />
            <Link to="/dashboard/profile" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800" onClick={() => setIsOpen(false)}>
              <User size={18} /><span>Profile</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-400 hover:bg-gray-800 w-full">
              <LogOut size={18} /><span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar