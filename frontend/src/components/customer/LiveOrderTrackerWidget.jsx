import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Utensils, Clock, ArrowRight, CheckCircle2, Flame, Bike, BellRing } from 'lucide-react'
import { ordersAPI } from '../../api/orders'
import { useAuth } from '../../hooks/useAuth'

const STATUS_STEPS = [
  { key: 'placed', label: 'Placed', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { key: 'preparing', label: 'Cooking', icon: Flame },
  { key: 'ready', label: 'Ready', icon: Utensils },
]

const getStepIndex = (status) => {
  switch (status) {
    case 'placed':
      return 0
    case 'accepted':
      return 1
    case 'preparing':
    case 'almost_ready':
      return 2
    case 'ready':
    case 'out_for_delivery':
      return 3
    default:
      return 0
  }
}

const LiveOrderTrackerWidget = () => {
  const { user } = useAuth()
  const [activeOrder, setActiveOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchActiveOrders = async () => {
      try {
        setLoading(true)
        const res = await ordersAPI.getOrders()
        const ordersList = res.data.results || res.data || []
        
        // Find the latest active order
        const active = ordersList.find(o => 
          ['placed', 'accepted', 'preparing', 'almost_ready', 'ready', 'out_for_delivery'].includes(o.status)
        )
        setActiveOrder(active || null)
      } catch (err) {
        // Silently handle if failed to load
      } finally {
        setLoading(false)
      }
    }

    fetchActiveOrders()
    const interval = setInterval(fetchActiveOrders, 15000)
    return () => clearInterval(interval)
  }, [user])

  if (!user || !activeOrder) return null

  const stepIndex = getStepIndex(activeOrder.status)
  const percent = Math.min(100, Math.round(((stepIndex + 1) / STATUS_STEPS.length) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8 relative overflow-hidden rounded-3xl p-5 md:p-6 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-600/15 dark:from-slate-900/90 dark:via-[#0f172a] dark:to-slate-900/90 border-2 border-amber-500/40 backdrop-blur-xl shadow-xl shadow-amber-500/10"
    >
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        {/* Left: Info */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0 animate-pulse">
            <BellRing size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full">
                Active Order Live
              </span>
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                Order #{activeOrder.order_number}
              </span>
              <span className="live-dot" />
            </div>

            <h3 className="text-lg md:text-xl font-black font-display text-slate-900 dark:text-white mt-1">
              Your meal is{' '}
              <span className="text-amber-500">
                {activeOrder.status === 'ready'
                  ? 'Ready for pickup / delivery!'
                  : activeOrder.status === 'preparing'
                  ? 'being prepared in the kitchen!'
                  : activeOrder.status === 'accepted'
                  ? 'accepted by the canteen!'
                  : 'placed!'}
              </span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
              Estimated wait time: <span className="font-bold text-amber-600 dark:text-amber-400">{activeOrder.estimated_time || 15} mins</span>
              {activeOrder.items_count && ` • ${activeOrder.items_count} items`}
            </p>
          </div>
        </div>

        {/* Center: Live Progress Bar */}
        <div className="w-full lg:max-w-xs xl:max-w-sm">
          <div className="flex items-center justify-between mb-2 text-[11px] font-extrabold text-slate-600 dark:text-slate-400">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= stepIndex
              const isCurrent = idx === stepIndex
              return (
                <span
                  key={step.key}
                  className={`flex items-center gap-1 ${
                    isCurrent ? 'text-amber-500 font-black' : isDone ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <step.icon size={12} className={isCurrent ? 'animate-bounce' : ''} />
                  {step.label}
                </span>
              )
            })}
          </div>

          <div className="w-full h-2.5 bg-white/70 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-amber-200 dark:border-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            />
          </div>
        </div>

        {/* Right: Action */}
        <div className="shrink-0">
          <Link
            to={`/tracking/${activeOrder.order_number}`}
            className="btn-glass-primary text-xs !py-3 !px-5 whitespace-nowrap shadow-md shadow-amber-500/20"
          >
            <span>Live Tracker</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default LiveOrderTrackerWidget
