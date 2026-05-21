import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Shield, Banknote, BarChart3, AlertTriangle, LogOut, ChevronLeft } from 'lucide-react'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Tasks', path: '/admin/tasks', icon: FileText },
    { name: 'MMF Plans', path: '/admin/mmf', icon: Shield },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: Banknote },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Fraud', path: '/admin/fraud', icon: AlertTriangle },
  ]

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-950">
      <aside className={`${sidebarOpen ? 'w-full lg:w-64' : 'w-full lg:w-20'} bg-gray-900 border-b border-gray-800 lg:border-b-0 lg:border-r transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && (
            <Link to="/admin" className="flex items-center space-x-2">
              <Shield size={24} className="text-amber-500" />
              <span className="font-bold text-white">Admin</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
            {sidebarOpen ? 'X' : 'O'}
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all ${
                isActive(link.path)
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <link.icon size={20} />
              {sidebarOpen && <span className="font-medium">{link.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link to="/admin" className="flex items-center space-x-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 mb-2">
            <ChevronLeft size={20} />
            {sidebarOpen && <span>Back to App</span>}
          </Link>
          <button onClick={handleLogout} className="flex items-center space-x-3 px-3 py-3 rounded-xl text-red-400 hover:bg-gray-800 w-full">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout