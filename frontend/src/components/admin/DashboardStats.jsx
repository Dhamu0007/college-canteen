import React from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, ShoppingBag, Users, Utensils } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

const DashboardStats = ({ stats }) => {
  const cards = [
    {
      title: "Today's Income",
      value: formatCurrency(stats?.today?.total_income || 0),
      sub: `${stats?.today?.total_orders || 0} orders today`,
      icon: IndianRupee,
      color: 'bg-green-500 text-white',
    },
    {
      title: 'Pending Orders',
      value: stats?.today?.pending_orders || 0,
      sub: `${stats?.today?.preparing_orders || 0} preparing in kitchen`,
      icon: ShoppingBag,
      color: 'bg-mustard-500 text-earth-900',
    },
    {
      title: 'Total Customers',
      value: stats?.overall?.total_customers || 0,
      sub: 'Registered canteen users',
      icon: Users,
      color: 'bg-blue-500 text-white',
    },
    {
      title: 'Active Products',
      value: stats?.overall?.total_products || 0,
      sub: 'Items available on menu',
      icon: Utensils,
      color: 'bg-purple-500 text-white',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl border border-earth-100 p-5 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-earth-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-earth-900 mt-1">{card.value}</h3>
              <p className="text-xs text-earth-400 mt-1">{card.sub}</p>
            </div>
            <div className={`p-3.5 rounded-2xl ${card.color} shadow-sm`}>
              <Icon size={22} />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default DashboardStats
