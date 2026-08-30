import React, { createContext, useState, useContext, useEffect } from 'react'
import { ordersAPI } from '../api/orders'
import toast from 'react-hot-toast'
import { soundFx } from '../utils/soundEffects'

export const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total_items: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getCart()
      setCart(response.data)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      fetchCart()
    }
  }, [])

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await ordersAPI.addToCart({ product_id: productId, quantity })
      await fetchCart()
      soundFx.playAddToCart()
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add to cart')
      return { success: false }
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    try {
      await ordersAPI.updateCartItem(itemId, { quantity })
      await fetchCart()
      return { success: true }
    } catch (error) {
      toast.error('Failed to update cart')
      return { success: false }
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      await ordersAPI.removeFromCart(itemId)
      await fetchCart()
      soundFx.playRemoveFromCart()
      return { success: true }
    } catch (error) {
      toast.error('Failed to remove item')
      return { success: false }
    }
  }

  const clearCart = async () => {
    try {
      await ordersAPI.clearCart()
      await fetchCart()
      return { success: true }
    } catch (error) {
      toast.error('Failed to clear cart')
      return { success: false }
    }
  }

  const getTotalItems = () => cart.total_items || 0
  const getSubtotal = () => cart.subtotal || 0

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getSubtotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}