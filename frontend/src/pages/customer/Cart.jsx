import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Plus, Minus, Trash2, ShoppingBag, ArrowLeft, 
  CreditCard, IndianRupee, Tag, AlertCircle 
} from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { getImageUrl } from '../../utils/helpers'

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleUpdateQuantity = async (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta
    if (newQuantity < 1) return
    await updateQuantity(itemId, newQuantity)
  }

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId)
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout 🔑')
      navigate('/login')
      return
    }
    if (cart.items.length === 0) {
      toast.error('Your cart is empty 🛒')
      return
    }
    navigate('/checkout')
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

  if (cart.items.length === 0) {
    return (
      <CustomerLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 max-w-md mx-auto"
        >
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-display font-bold text-earth-800">
            Empty ga undhi babu!
          </h2>
          <p className="text-earth-600 mt-2">
            Edhaina tasty ga add cheyyi. 🍛
          </p>
          <Link
            to="/menu"
            className="inline-block mt-6 bg-mustard-500 hover:bg-mustard-600 text-earth-800 px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Browse Menu
          </Link>
        </motion.div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/menu"
            className="p-2 rounded-full hover:bg-earth-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-display font-bold text-earth-800">
            Your Cart 🛒
          </h1>
          <span className="text-earth-500 text-sm ml-auto">
            {cart.total_items} items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <AnimatePresence>
                {cart.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-traditional p-4 flex gap-4"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-warm-100 flex items-center justify-center">
                      {getImageUrl(item.product_details?.image || item.product?.image || item.image) ? (
                        <img
                          src={getImageUrl(item.product_details?.image || item.product?.image || item.image)}
                          alt={item.product_details?.name || item.product?.name || 'Food Item'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.style.display = 'none'
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full flex items-center justify-center p-2"
                        style={{ display: getImageUrl(item.product_details?.image || item.product?.image || item.image) ? 'none' : 'flex' }}
                      >
                        <img src="/logo.png" alt="Food" className="w-10 h-10 object-contain rounded-lg opacity-80" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-earth-800">
                            {item.product_details?.name || item.product?.name || 'Food Item'}
                          </h3>
                          <p className="text-sm text-earth-500">
                            {item.product_details?.category_name || item.product?.category_name || ''}
                          </p>
                          <p className="text-sm font-semibold text-mustard-600 mt-1">
                            ₹{item.price_per_unit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          className="w-8 h-8 rounded-lg border-2 border-earth-200 hover:border-mustard-400 flex items-center justify-center transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          className="w-8 h-8 rounded-lg border-2 border-earth-200 hover:border-mustard-400 flex items-center justify-center transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="ml-auto font-semibold text-earth-800">
                          ₹{item.total_price}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Clear Cart */}
              <button
                onClick={() => {
                  if (window.confirm('Clear all items from cart?')) {
                    clearCart()
                  }
                }}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-traditional p-6 sticky top-24">
              <h2 className="text-xl font-display font-bold text-earth-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-earth-600">
                  <span>Subtotal ({cart.total_items} items)</span>
                  <span>₹{cart.subtotal}</span>
                </div>
                
                <div className="flex justify-between text-earth-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">Free</span>
                </div>

                <div className="flex justify-between text-earth-600">
                  <span>Tax</span>
                  <span>₹0.00</span>
                </div>

                <div className="border-t border-earth-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-earth-800">
                    <span>Total</span>
                    <span className="text-mustad-600">₹{cart.subtotal}</span>
                  </div>
                </div>

                {/* Coupon Input */}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-earth-200 focus:border-mustard-400 focus:ring-2 focus:ring-mustard-200 focus:outline-none text-sm"
                    />
                    <button className="px-4 py-2 bg-earth-100 hover:bg-earth-200 rounded-lg font-semibold text-earth-700 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-mustard-500 hover:bg-mustard-600 text-earth-800 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </motion.button>

                <p className="text-xs text-earth-400 text-center mt-2">
                  🔒 Secure checkout • Cash or Online Payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}

export default Cart