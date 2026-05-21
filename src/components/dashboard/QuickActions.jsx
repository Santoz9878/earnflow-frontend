import { useNavigate } from 'react-router-dom'
import { Play, TrendingUp, Users, Banknote } from 'lucide-react'

const QuickActions = () => {
  const navigate = useNavigate()
  const actions = [
    { name: 'Earn Now', description: "Today's tasks", icon: Play, path: '/dashboard/earn', gradient: 'from-blue-600 to-blue-700' },
    { name: 'Invest MMF', description: 'Grow your money', icon: TrendingUp, path: '/dashboard/mmf', gradient: 'from-purple-600 to-purple-700' },
    { name: 'Invite', description: 'Earn Ksh 200/ref', icon: Users, path: '/dashboard/referrals', gradient: 'from-amber-500 to-orange-600' },
    { name: 'Withdraw', description: 'To M-Pesa', icon: Banknote, path: '/dashboard/withdraw', gradient: 'from-emerald-500 to-teal-600' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <button key={index} onClick={() => navigate(action.path)} className="card hover:scale-105 transition-transform cursor-pointer group">
          <div className={'w-10 h-10 bg-gradient-to-br ' + action.gradient + ' rounded-xl flex items-center justify-center mb-3'}>
            <action.icon size={20} className="text-white" />
          </div>
          <h4 className="text-white font-semibold text-sm">{action.name}</h4>
          <p className="text-gray-400 text-xs mt-1">{action.description}</p>
        </button>
      ))}
    </div>
  )
}

export default QuickActions
