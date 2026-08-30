import React, { useState, useEffect } from 'react'
import { Filter, RefreshCw, KeyRound } from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import { ordersAPI } from '../../api/orders'
import { formatCurrency, formatTime, getOrderStatusColor } from '../../utils/helpers'
import { ORDER_STATUS_LABELS } from '../../utils/constants'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {}
      const res = await ordersAPI.getOrders(params)
      setOrders(res.data.results || res.data || [])
    } catch (err) {
      toast.error('Failed to fetch admin orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderIdentifier, newStatus) => {
    try {
      const res = await ordersAPI.updateOrderStatus(orderIdentifier, { status: newStatus })
      toast.success(res.data?.message || `Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to update order status')
    }
  }

  const handleGenerateOTP = async (orderIdentifier) => {
    try {
      const res = await ordersAPI.generateDeliveryOTP(orderIdentifier)
      toast.success(`OTP generated: ${res.data?.otp || 'Sent to customer'}`)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to generate delivery OTP')
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-display text-earth-900 tracking-tight">Order Management</h1>
            <p className="text-xs text-earth-500 font-semibold mt-0.5">Live order fulfillment, kitchen status & OTP verification</p>
          </div>
          <button
            onClick={fetchOrders}
            className="btn-glass-primary text-xs !py-2.5 !px-4"
          >
            <RefreshCw size={16} /> Refresh Orders
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 glass-card p-2 rounded-2xl border border-white/80 shadow-md">
          <Filter size={16} className="text-amber-500 ml-2" />
          {['all', 'placed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize whitespace-nowrap transition-all duration-300 ${
                selectedStatus === st
                  ? 'bg-gradient-to-r from-amber-500 to-mustard-500 text-earth-900 shadow-md shadow-amber-500/20 border border-white/40'
                  : 'bg-white/60 text-earth-700 border border-white/80 hover:bg-white'
              }`}
            >
              {st === 'all' ? 'All Orders' : ORDER_STATUS_LABELS[st] || st}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <Loader text="Loading orders..." />
        ) : (
          <div className="glass-card rounded-3xl border border-white/90 shadow-xl overflow-hidden">
            <table className="w-full text-left text-sm text-earth-700">
              <thead className="bg-white/50 text-earth-500 uppercase text-[11px] font-black border-b border-earth-100/60 tracking-wider">
                <tr>
                  <th className="py-4 px-4">Order #</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Items</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">OTP</th>
                  <th className="py-4 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100/60">
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-4 px-4 font-mono font-black text-earth-900">
                        #{order.order_number}
                        <span className="block text-[10px] text-earth-400 font-sans font-semibold">
                          {formatTime(order.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-extrabold text-earth-900">{order.customer_name || order.customer?.full_name}</p>
                        <p className="text-xs text-earth-500 font-medium">{order.delivery_address || order.customer?.hostel_name}</p>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="text-earth-700">
                            {it.quantity}x {it.product_name}
                          </div>
                        ))}
                      </td>
                      <td className="py-4 px-4 font-black text-gradient-gold">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 text-xs font-black rounded-full border shadow-sm ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {order.delivery_otp ? (
                          <span className="font-mono bg-amber-100/80 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl font-black text-xs shadow-sm">
                            {order.delivery_otp}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGenerateOTP(order.order_number)}
                            className="text-xs text-amber-700 font-black hover:underline flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200"
                          >
                            <KeyRound size={12} /> Generate
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.order_number || order.id, e.target.value)}
                          className="text-xs p-2 rounded-xl border border-white/80 font-bold text-earth-800 bg-white/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          <option value="placed">Placed</option>
                          <option value="accepted">Accepted</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-earth-400 font-bold">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )

}

export default AdminOrders
