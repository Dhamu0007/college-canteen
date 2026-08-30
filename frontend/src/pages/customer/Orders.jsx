import React, { useState, useEffect } from 'react'
import CustomerLayout from '../../layouts/CustomerLayout'
import OrderCard from '../../components/customer/OrderCard'
import { ordersAPI } from '../../api/orders'
import Loader from '../../components/common/Loader'
import AnimatedPage from '../../components/animations/AnimatedPage'
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    try {
      setLoading(true)
      const res = await ordersAPI.getOrders()
      setOrders(res.data.results || res.data || [])
    } catch (err) {
      toast.error('Failed to load your orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerLayout>
      <AnimatedPage className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">My Orders</h1>
          <p className="text-xs text-earth-500">Track current orders & review order history</p>
        </div>

        {loading ? (
          <Loader text="Loading your orders..." />
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-earth-100 p-12 text-center text-earth-500 shadow-xs">
            <div className="w-16 h-16 mx-auto mb-2">
              <img src="/logo.png" alt="Em Babu Thinnava" className="w-full h-full object-cover rounded-2xl shadow-md border border-amber-400/30" />
            </div>
            <h3 className="font-bold text-lg text-earth-900 mt-3">No orders placed yet!</h3>
            <p className="text-xs text-earth-500 mt-1">Explore our delicious Andhra canteen menu and satisfy your cravings.</p>
          </div>
        )}
      </AnimatedPage>
    </CustomerLayout>
  )
}

export default Orders
