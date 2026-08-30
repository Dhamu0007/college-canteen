import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, ShoppingBag, Users, 
  Coffee, Clock, CheckCircle, XCircle, 
  Package, IndianRupee, Calendar, Download, Flame, Sparkles, RefreshCw, Layers
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import { reportsAPI } from '../../api/reports'
import { ordersAPI } from '../../api/orders'
import { useWebSocket } from '../../hooks/useWebSocket'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('today')

  const { sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket('admin/notifications/')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const handleNewOrder = (data) => {
      if (data.type === 'new_order') {
        toast.success(`🔔 New order #${data.data.order_number} received! 📦`)
        fetchData()
      }
    }
    const handleOrderUpdate = (data) => {
      if (data.type === 'order_status_update') {
        fetchData()
      }
    }

    addMessageHandler('new_order', handleNewOrder)
    addMessageHandler('order_status_update', handleOrderUpdate)

    return () => {
      removeMessageHandler('new_order', handleNewOrder)
      removeMessageHandler('order_status_update', handleOrderUpdate)
    }
  }, [addMessageHandler, removeMessageHandler])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, ordersRes] = await Promise.all([
        reportsAPI.getDashboardStats(),
        ordersAPI.getOrders({ limit: 10 }),
      ])
      setStats(statsRes.data)
      setRecentOrders(ordersRes.data.results || ordersRes.data || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  }

  const StatCard = ({ icon: Icon, label, value, subtext, gradient, glowColor, trend, delay = 0 }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`glass-card-liquid group relative overflow-hidden p-6 border border-white/90 shadow-xl ${glowColor} transform-gpu`}
    >
      {/* Background Accent Liquid Glow */}
      <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${gradient} opacity-20 blur-2xl group-hover:opacity-40 group-hover:scale-150 transition-all duration-500`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-earth-500">{label}</span>
          <h3 className="text-3xl font-black text-earth-900 mt-1 tracking-tight flex items-center gap-1">
            {value}
          </h3>
          {subtext && <p className="text-xs font-semibold text-earth-500 mt-1">{subtext}</p>}
        </div>

        <div className={`p-4 rounded-2xl ${gradient} text-white shadow-lg shadow-black/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30 backdrop-blur-md`}>
          <Icon size={22} className="stroke-[2.5]" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/60 relative z-10 text-xs font-extrabold">
          <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {trend >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            <span>{trend >= 0 ? `+${trend}%` : `${trend}%`} vs yesterday</span>
          </div>
          <span className="text-[10px] text-earth-400 font-bold uppercase tracking-wide">Live</span>
        </div>
      )}
    </motion.div>
  )

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-300 animate-ping opacity-75" />
            <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin shadow-lg" />
          </div>
          <p className="text-earth-700 font-extrabold text-sm tracking-wide">Loading canteen live dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

  const todayIncome = stats?.today?.total_income || 0
  const todayOrders = stats?.today?.total_orders || 0
  const preparingOrders = stats?.today?.preparing_orders || 0
  const deliveredOrders = stats?.today?.delivered_orders || 0

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 pb-12"
      >
        {/* Banner / Header */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-earth-900 via-earth-800 to-earth-900 text-white p-6 sm:p-8 shadow-2xl border border-white/10">
          <div className="absolute inset-0 opacity-15 bg-liquid-mesh" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                  <span className="live-dot" /> Live Server Online
                </span>
                <span className="text-xs text-earth-300 font-semibold">Updated {new Date().toLocaleTimeString()}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white flex items-center gap-2">
                Canteen Dashboard <Sparkles className="text-amber-400 animate-pulse" size={28} />
              </h1>
              <p className="text-earth-300 text-sm mt-1 max-w-xl font-medium">
                Real-time income, active kitchen orders, customer analytics, and menu statistics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-extrabold transition-all duration-300 flex items-center gap-2 text-xs border border-white/20 active:scale-95 backdrop-blur-md"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2.5 rounded-2xl border border-white/20 bg-earth-800/90 text-white font-extrabold text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 backdrop-blur-md"
              >
                <option value="today">Today's Overview</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <button className="btn-glass-primary text-xs !py-2.5 !px-5">
                <Download size={16} /> Export Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Live Metrics Grid 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={IndianRupee}
            label="Today's Revenue"
            value={`₹${todayIncome}`}
            subtext="Calculated from paid orders"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            glowColor="shadow-neon-green"
            trend={8.4}
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Orders Today"
            value={todayOrders}
            subtext={`${stats?.today?.pending_orders || 0} awaiting confirmation`}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            glowColor="shadow-neon-blue"
            trend={12.1}
          />
          <StatCard
            icon={Flame}
            label="Kitchen Preparing"
            value={preparingOrders}
            subtext="Currently on stove / counter"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            glowColor="shadow-neon-mustard"
          />
          <StatCard
            icon={CheckCircle}
            label="Delivered Today"
            value={deliveredOrders}
            subtext="Fulfilled orders"
            gradient="bg-gradient-to-br from-yellow-500 to-amber-600"
            glowColor="shadow-neon-mustard"
            trend={15}
          />
        </div>

        {/* Cumulative Stats Grid 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={Users}
            label="Total Customers"
            value={stats?.overall?.total_customers || 0}
            subtext="Registered canteen users"
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            glowColor="shadow-neon-purple"
          />
          <StatCard
            icon={Coffee}
            label="Active Products"
            value={stats?.overall?.total_products || 0}
            subtext="Items available in menu"
            gradient="bg-gradient-to-br from-teal-500 to-cyan-600"
          />
          <StatCard
            icon={Package}
            label="Lifetime Orders"
            value={stats?.overall?.total_orders || 0}
            subtext="All-time orders count"
            gradient="bg-gradient-to-br from-indigo-500 to-blue-700"
          />
          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={`₹${stats?.overall?.total_revenue || 0}`}
            subtext="All-time cumulative earnings"
            gradient="bg-gradient-to-br from-amber-600 to-orange-700"
          />
        </div>

        {/* Dynamic Kitchen Progress & Performance Meters */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-white/90 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-earth-900 text-lg flex items-center gap-2">
                  <Flame className="text-orange-500 animate-bounce" size={20} /> Kitchen Capacity & Order Velocity
                </h3>
                <p className="text-xs text-earth-500 font-medium">Live breakdown of order pipeline execution</p>
              </div>
              <span className="glass-badge bg-amber-100/80 text-amber-900">
                Active Shifts
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-black text-earth-800 mb-1.5">
                  <span>Preparing in Kitchen ({preparingOrders})</span>
                  <span>{todayOrders > 0 ? Math.round((preparingOrders / todayOrders) * 100) : 0}%</span>
                </div>
                <div className="w-full h-3.5 bg-earth-100/70 rounded-full overflow-hidden p-0.5 border border-white/80">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${todayOrders > 0 ? (preparingOrders / todayOrders) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full shadow-md"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-black text-earth-800 mb-1.5">
                  <span>Completed & Delivered ({deliveredOrders})</span>
                  <span>{todayOrders > 0 ? Math.round((deliveredOrders / todayOrders) * 100) : 0}%</span>
                </div>
                <div className="w-full h-3.5 bg-earth-100/70 rounded-full overflow-hidden p-0.5 border border-white/80">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${todayOrders > 0 ? (deliveredOrders / todayOrders) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/90 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-earth-900 text-lg flex items-center gap-2 mb-1">
                <Sparkles className="text-amber-500" size={20} /> Daily Goal Target
              </h3>
              <p className="text-xs text-earth-500 font-medium mb-4">Target revenue milestone: ₹10,000</p>
              
              <div className="text-center py-4">
                <span className="text-4xl font-black text-gradient-gold">
                  {Math.min(100, Math.round((todayIncome / 10000) * 100))}%
                </span>
                <p className="text-xs font-extrabold text-earth-700 mt-1">
                  ₹{todayIncome} raised of ₹10,000 target
                </p>
              </div>
            </div>

            <div className="w-full h-3.5 bg-earth-100/70 rounded-full overflow-hidden p-0.5 border border-white/80">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (todayIncome / 10000) * 100)}%` }}
                transition={{ duration: 1.2 }}
                className="h-full bg-gradient-to-r from-amber-400 via-mustard-500 to-yellow-500 rounded-full shadow-md"
              />
            </div>
          </div>
        </motion.div>

        {/* Charts Visual Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Animated Revenue Trend SVG */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-white/90 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-earth-900 text-lg flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20} /> Live Revenue Wave
              </h3>
              <span className="glass-badge text-emerald-700 bg-emerald-100/80">
                +18% growth
              </span>
            </div>

            <div className="h-56 relative flex items-end pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 160">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,130 C60,110 100,140 160,80 C220,20 280,90 340,40 L400,60 L400,160 L0,160 Z"
                  fill="url(#waveGradient)"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  d="M0,130 C60,110 100,140 160,80 C220,20 280,90 340,40 L400,60"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="160" cy="80" r="6" fill="#d97706" className="animate-ping opacity-75" />
                <circle cx="160" cy="80" r="5" fill="#d97706" />
                <circle cx="340" cy="40" r="5" fill="#10B981" />
              </svg>
            </div>
            <div className="flex justify-between text-xs font-black text-earth-500 mt-2 px-2">
              <span>9 AM</span>
              <span>12 PM</span>
              <span>3 PM</span>
              <span>6 PM</span>
              <span>9 PM</span>
            </div>
          </motion.div>

          {/* Animated Status Donut SVG */}
          <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-white/90 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-earth-900 text-lg flex items-center gap-2">
                <Layers className="text-indigo-600" size={20} /> Order Distribution
              </h3>
              <span className="text-xs font-extrabold text-earth-500">Live Breakdown</span>
            </div>

            <div className="h-56 flex items-center justify-center gap-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#EFE5D8"
                    strokeWidth="3.8"
                  />
                  <motion.path
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: "65, 100" }}
                    transition={{ duration: 1.5 }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.8"
                    strokeDasharray="65, 100"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-earth-900">{todayOrders}</span>
                  <span className="text-[10px] uppercase font-black text-earth-500 tracking-wider">Total</span>
                </div>
              </div>

              <div className="space-y-3 text-xs font-extrabold">
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" /> Delivered ({deliveredOrders})
                </div>
                <div className="flex items-center gap-2 text-amber-800">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" /> Preparing ({preparingOrders})
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" /> Pending ({stats?.today?.pending_orders || 0})
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders Table */}
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 border border-white/90 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-earth-900 text-xl flex items-center gap-2">
                <ShoppingBag className="text-amber-500" size={22} /> Recent Orders Ticker
              </h3>
              <p className="text-xs text-earth-500 font-medium">Live incoming customer orders</p>
            </div>
            <button className="btn-glass-primary text-xs !py-2 !px-4">
              View All Orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-earth-700">
              <thead>
                <tr className="border-b border-earth-200/80 text-earth-500 uppercase text-[11px] font-black tracking-wider">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100/60">
                <AnimatePresence>
                  {recentOrders.map((order, idx) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-white/60 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-mono font-black text-earth-900">
                        #{order.order_number}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-earth-800">
                        {order.customer_name}
                      </td>
                      <td className="py-3.5 px-3 font-black text-earth-900">
                        ₹{order.total_amount}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-sm border ${
                          order.status === 'delivered' ? 'bg-emerald-100/90 text-emerald-800 border-emerald-200' :
                          order.status === 'cancelled' ? 'bg-rose-100/90 text-rose-700 border-rose-200' :
                          order.status === 'ready' ? 'bg-amber-100/90 text-amber-900 border-amber-200' :
                          'bg-blue-100/90 text-blue-800 border-blue-200'
                        }`}>
                          {order.status === 'delivered' && <CheckCircle size={12} />}
                          {order.status === 'preparing' && <Flame size={12} className="text-orange-500 animate-bounce" />}
                          {order.status_display || order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-earth-500 font-bold">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-earth-400 font-bold">
                      No live orders recorded yet today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  )
}

export default AdminDashboard