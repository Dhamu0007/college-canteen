import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, Clock, Package, ChefHat, 
  Truck, Home, ArrowLeft, Smartphone 
} from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout'
import { useOrders } from '../../hooks/useOrders'
import { useWebSocket } from '../../hooks/useWebSocket'
import toast from 'react-hot-toast'

const OrderTracking = () => {
  const { orderId } = useParams()
  const { getOrder, loading } = useOrders()
  const [order, setOrder] = useState(null)
  const [currentStatus, setCurrentStatus] = useState(0)
  
  const { sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket('notifications/')

  const statuses = [
    { id: 'placed', label: 'Order Placed', icon: Package, emoji: '🧾' },
    { id: 'accepted', label: 'Order Accepted', icon: CheckCircle, emoji: '👨‍🍳' },
    { id: 'preparing', label: 'Preparing Food', icon: ChefHat, emoji: '🍳' },
    { id: 'almost_ready', label: 'Almost Ready', icon: Clock, emoji: '♨️' },
    { id: 'ready', label: 'Food Ready', icon: CheckCircle, emoji: '🍛' },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, emoji: '🛵' },
    { id: 'delivered', label: 'Delivered', icon: Home, emoji: '😋' },
  ]

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  useEffect(() => {
    const handleOrderUpdate = (data) => {
      if (data.type === 'order_update' && data.data.order_number === orderId) {
        fetchOrder()
        toast.success(`🔔 Order status updated: ${data.data.status_display}`)
      }
    }

    addMessageHandler('order_update', handleOrderUpdate)
    return () => removeMessageHandler('order_update', handleOrderUpdate)
  }, [orderId, addMessageHandler, removeMessageHandler])

  const fetchOrder = async () => {
    const data = await getOrder(orderId)
    if (data) {
      setOrder(data)
      const statusIndex = statuses.findIndex(s => s.id === data.status)
      setCurrentStatus(statusIndex >= 0 ? statusIndex : 0)
    }
  }

  const getStatusMessage = (status) => {
    const messages = {
      placed: "🧾 Order placed! Waiting for acceptance.",
      accepted: "👨‍🍳 Chef babu busy ga prepare chestunnadu!",
      preparing: "🍳 Your food is being prepared with love.",
      almost_ready: "♨️ Your order is almost ready! Just a few more minutes.",
      ready: "🍛 Babu! Nee food ready ayyindi! Please collect it from the canteen.",
      out_for_delivery: "🛵 Your order is out for delivery!",
      delivered: "😋 Order delivered successfully! Enjoy your meal!",
      cancelled: "❌ Order cancelled."
    }
    return messages[status] || "Processing your order..."
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-mustard-500 border-t-transparent" />
        </div>
      </CustomerLayout>
    )
  }

  if (!order) {
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-earth-800">Order not found</h2>
          <Link to="/orders" className="text-mustard-600 hover:underline">
            View all orders
          </Link>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/orders"
            className="p-2 rounded-full hover:bg-earth-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-earth-800">
              Order #{order.order_number}
            </h1>
            <p className="text-earth-500">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className={`ml-auto px-4 py-2 rounded-full text-sm font-semibold ${
            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
            'bg-mustard-100 text-earth-700'
          }`}>
            {order.status_display}
          </span>
        </div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-traditional p-6 mb-8 text-center"
        >
          <div className="text-4xl mb-2">
            {statuses.find(s => s.id === order.status)?.emoji || '🍛'}
          </div>
          <p className="text-lg font-medium text-earth-800">
            {getStatusMessage(order.status)}
          </p>
          {order.estimated_time && (
            <p className="text-sm text-earth-500 mt-1">
              ⏱️ Estimated time: {order.estimated_time} minutes
            </p>
          )}
        </motion.div>

        {/* Progress Tracker */}
        <div className="card-traditional p-8">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-earth-200 -translate-x-1/2">
              <motion.div
                className="absolute top-0 left-0 w-full bg-mustard-500"
                initial={{ height: '0%' }}
                animate={{ 
                  height: `${(currentStatus / (statuses.length - 1)) * 100}%`
                }}
                transition={{ duration: 0.8 }}
              />
            </div>

            {/* Status Steps */}
            <div className="space-y-0 relative">
              {statuses.map((status, index) => {
                const isCompleted = index <= currentStatus
                const isCurrent = index === currentStatus
                const isCancelled = order.status === 'cancelled'

                return (
                  <div key={status.id} className="flex items-center gap-6 py-4">
                    <div className="flex-shrink-0 w-12 h-12 relative">
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${
                        isCompleted && !isCancelled
                          ? 'bg-mustard-500'
                          : isCancelled && index <= currentStatus
                          ? 'bg-red-500'
                          : 'bg-earth-200'
                      }`}>
                        {isCompleted && !isCancelled ? (
                          <CheckCircle size={20} className="text-white" />
                        ) : isCancelled && index <= currentStatus ? (
                          <span className="text-white text-sm">❌</span>
                        ) : (
                          <status.icon size={20} className="text-earth-400" />
                        )}
                      </div>
                      {isCurrent && !isCancelled && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-mustard-400"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          isCompleted && !isCancelled
                            ? 'text-earth-800'
                            : isCancelled && index <= currentStatus
                            ? 'text-red-500'
                            : 'text-earth-400'
                        }`}>
                          {status.label}
                        </span>
                        {isCurrent && !isCancelled && (
                          <span className="text-xs text-mustard-600 font-semibold animate-pulse">
                            ● In Progress
                          </span>
                        )}
                        {isCompleted && !isCurrent && !isCancelled && (
                          <CheckCircle size={14} className="text-green-500" />
                        )}
                      </div>
                      {isCurrent && !isCancelled && (
                        <p className="text-sm text-earth-500 mt-1">
                          {status.id === 'placed' && "Waiting for restaurant to accept..."}
                          {status.id === 'accepted' && "Chef is getting ready..."}
                          {status.id === 'preparing' && "Cooking in progress..."}
                          {status.id === 'almost_ready' && "Almost done! Just finishing touches..."}
                          {status.id === 'ready' && "Food is ready! 🍛"}
                          {status.id === 'out_for_delivery' && "On the way!"}
                          {status.id === 'delivered' && "Enjoy your meal! 😋"}
                        </p>
                      )}
                      {isCancelled && index === currentStatus && (
                        <p className="text-sm text-red-500 mt-1">
                          Order cancelled
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card-traditional p-6">
            <h3 className="font-semibold text-earth-800 mb-3">Items</h3>
            <div className="space-y-2">
              {order.items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>₹{item.total_price}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-earth-200 mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-mustard-600">₹{order.total_amount}</span>
            </div>
          </div>

          <div className="card-traditional p-6">
            <h3 className="font-semibold text-earth-800 mb-3">Delivery Details</h3>
            <p className="text-sm text-earth-600">{order.delivery_address}</p>
            {order.special_instructions && (
              <p className="text-sm text-earth-500 mt-2">
                📝 {order.special_instructions}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Smartphone size={16} className="text-earth-400" />
              <span className="text-earth-600">
                {order.customer_phone}
              </span>
            </div>
            {order.delivery_otp && order.status !== 'delivered' && (
              <div className="mt-3 p-3 bg-mustard-50 rounded-xl border border-mustard-200">
                <p className="text-sm font-semibold text-earth-800">
                  Delivery OTP: <span className="text-mustard-600">{order.delivery_otp}</span>
                </p>
                <p className="text-xs text-earth-500">
                  Share this OTP for delivery verification
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this order?')) {
                  // Handle cancel
                  toast.success('Order cancelled')
                }
              }}
              className="px-6 py-3 border-2 border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors"
            >
              Cancel Order
            </button>
            <Link
              to="/menu"
              className="px-6 py-3 bg-mustard-500 hover:bg-mustard-600 text-earth-800 rounded-xl font-semibold transition-colors"
            >
              Order More
            </Link>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}

export default OrderTracking