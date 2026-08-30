import React, { createContext, useState, useContext } from 'react'
import { ordersAPI } from '../api/orders'
import toast from 'react-hot-toast'
import { soundFx } from '../utils/soundEffects'

export const OrderContext = createContext()

export const useOrders = () => useContext(OrderContext)

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true)
      const response = await ordersAPI.getOrders(params)
      setOrders(response.data.results || response.data)
      return response.data
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to fetch orders')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getOrder = async (orderNumber) => {
    try {
      setLoading(true)
      const response = await ordersAPI.getOrder(orderNumber)
      setCurrentOrder(response.data)
      return response.data
    } catch (error) {
      toast.error('Failed to fetch order details')
      return null
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (orderData) => {
    try {
      setLoading(true)
      const response = await ordersAPI.createOrder(orderData)
      soundFx.playOrderPlaced()
      toast.success('Order placed successfully! ✨')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order')
      return null
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (orderNumber, reason = '') => {
    try {
      const response = await ordersAPI.cancelOrder(orderNumber, reason)
      toast.success('Order cancelled')
      return response.data
    } catch (error) {
      toast.error('Failed to cancel order')
      return null
    }
  }

  const updateOrderStatus = async (orderNumber, statusData) => {
    try {
      const response = await ordersAPI.updateOrderStatus(orderNumber, statusData)
      toast.success(response.data?.message || 'Order status updated')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.detail || error.response?.data?.message || 'Failed to update order status')
      return null
    }
  }

  const value = {
    orders,
    setOrders,
    currentOrder,
    setCurrentOrder,
    loading,
    fetchOrders,
    getOrder,
    createOrder,
    cancelOrder,
    updateOrderStatus,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}