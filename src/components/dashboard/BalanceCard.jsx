import { Wallet, TrendingUp, Users, Gift } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

const BalanceCard = ({ balance, todayEarnings, referralCount, referralEarnings }) => {
  const cards = [
    { title: 'Wallet Balance', value: formatCurrency(balance || 0), icon: Wallet, gradient: 'from-blue-600 to-blue-800' },
    { title: "Today's Earnings", value: formatCurrency(todayEarnings || 0), icon: TrendingUp, gradient: 'from-emerald-500 to-teal-700' },
    { title: 'Total Referrals', value: referralCount || 0, icon: Users, gradient: 'from-amber-500 to-orange-600' },
    { title: 'Referral Earnings', value: formatCurrency(referralEarnings || 0), icon: Gift, gradient: 'from-purple-600 to-purple-800' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 shadow-xl`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/70 text-sm font-medium">{card.title}</p>
            <card.icon size={20} className="text-white/60" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-white">
            {card.value}
          </h3>
        </div>
      ))}
    </div>
  )
}

export default BalanceCard