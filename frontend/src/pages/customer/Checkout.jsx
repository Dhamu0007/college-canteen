import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, CreditCard, Wallet, QrCode, 
  IndianRupee, CheckCircle, AlertCircle 
} from 'lucide-react'
import CustomerLayout from '../../layouts/CustomerLayout'
import { useCart } from '../../hooks/useCart'
import { useOrders } from '../../hooks/useOrders'
import { useAuth } from '../../hooks/useAuth'
import { paymentsAPI } from '../../api/payments'
import { couponsAPI } from '../../api/coupons'
import toast from 'react-hot-toast'

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, clearCart } = useCart()
  const { createOrder } = useOrders()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [address, setAddress] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code')
      return
    }
    try {
      const response = await couponsAPI.applyCoupon({ 
        coupon_code: couponCode,
        order_id: null 
      })
      setCouponApplied(response.data)
      toast.success('Coupon applied! 🎟️')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid coupon')
    }
  }

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error('Please enter delivery address')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        payment_method: paymentMethod,
        delivery_address: address,
        special_instructions: specialInstructions,
        coupon_code: couponApplied ? couponCode : null,
      }

      const response = await createOrder(orderData)
      if (response) {
        setOrderNumber(response.order.order_number)
        setOrderSuccess(true)
        await clearCart()
        toast.success('Order placed successfully! ✨')
        
        // If online payment, initiate payment
        if (paymentMethod === 'online') {
          const createdOrderId = response.order.id
          const paymentResponse = await paymentsAPI.initiatePayment({
            order_id: createdOrderId,
            payment_method: 'razorpay'
          })
          // Redirect to payment gateway
          if (paymentResponse.data.razorpay_order_id) {
            // Initialize Razorpay checkout
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY,
              amount: response.order.total_amount * 100,
              currency: 'INR',
              name: 'EM BABU THINNAVA?',
              description: `Order #${response.order.order_number}`,
              order_id: paymentResponse.data.razorpay_order_id,
              handler: function(rzpResponse) {
                // Verify payment
                verifyPayment(rzpResponse, createdOrderId)
              },
              prefill: {
                name: user?.username || '',
                email: user?.email || '',
                contact: user?.phone_number || '',
              },
              theme: {
                color: '#eaa93a',
              },
            }
            const razorpay = new window.Razorpay(options)
            razorpay.open()
          }
        }
      }
    } catch (error) {
      console.error('Order failed:', error)
      toast.error('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (razorpayResponse, orderId) => {
    try {
      await paymentsAPI.verifyPayment({
        order_id: orderId,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      })
      toast.success('Payment verified! 💳')
    } catch (error) {
      toast.error('Payment verification failed')
    }
  }

  if (cart.items.length === 0 && !orderSuccess) {
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-earth-800">Cart is empty</h2>
          <Link to="/menu" className="text-mustard-600 hover:underline">
            Browse menu
          </Link>
        </div>
      </CustomerLayout>
    )
  }

  if (orderSuccess) {
    return (
      <CustomerLayout>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg mx-auto text-center py-16"
        >
          <div className="text-8xl mb-6">✅</div>
          <h2 className="text-3xl font-display font-bold text-earth-800">
            Order Placed Successfully!
          </h2>
          <p className="text-earth-600 mt-2">
            Order #{orderNumber}
          </p>
          <div className="card-traditional p-6 mt-6 text-left">
            <p className="text-sm text-earth-600">
              🍛 Babu! Nee food order chesaaru! Track cheyyandi.
            </p>
          </div>
          <div className="flex gap-4 justify-center mt-6">
            <Link
              to={`/tracking/${orderNumber}`}
              className="bg-mustard-500 hover:bg-mustard-600 text-earth-800 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Track Order
            </Link>
            <Link
              to="/"
              className="border-2 border-earth-300 hover:border-earth-400 text-earth-700 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/cart"
            className="p-2 rounded-full hover:bg-earth-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-display font-bold text-earth-800">
            Checkout 🛍️
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="card-traditional p-6">
              <h3 className="font-semibold text-earth-800 mb-4">
                Delivery Address
              </h3>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your delivery address..."
                className="w-full px-4 py-3 rounded-xl border-2 border-earth-200 focus:border-mustard-400 focus:ring-2 focus:ring-mustard-200 focus:outline-none min-h-[100px]"
              />
            </div>

            {/* Special Instructions */}
            <div className="card-traditional p-6">
              <h3 className="font-semibold text-earth-800 mb-4">
                Special Instructions
              </h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests? (extra spicy, no onions, etc.)"
                className="w-full px-4 py-3 rounded-xl border-2 border-earth-200 focus:border-mustard-400 focus:ring-2 focus:ring-mustard-200 focus:outline-none min-h-[80px]"
              />
            </div>

            {/* Coupon */}
            <div className="card-traditional p-6">
              <h3 className="font-semibold text-earth-800 mb-4">
                Coupon Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-earth-200 focus:border-mustard-400 focus:ring-2 focus:ring-mustard-200 focus:outline-none"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!!couponApplied}
                  className="px-6 py-3 bg-earth-100 hover:bg-earth-200 rounded-xl font-semibold text-earth-700 transition-colors disabled:opacity-50"
                >
                  {couponApplied ? 'Applied ✓' : 'Apply'}
                </button>
              </div>
              {couponApplied && (
                <p className="text-sm text-green-600 mt-2">
                  ✅ {couponApplied.coupon_code} - {couponApplied.discount_amount} off
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-traditional p-6 sticky top-24">
              <h3 className="font-semibold text-earth-800 mb-4">
                Order Summary
              </h3>

              <div className="space-y-2 text-sm">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.product_details.name}</span>
                    <span>₹{item.total_price}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-earth-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-earth-600">Subtotal</span>
                  <span>₹{cart.subtotal}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{couponApplied.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-earth-200 pt-2">
                  <span>Total</span>
                  <span className="text-mustard-600">
                    ₹{cart.subtotal - (couponApplied?.discount_amount || 0)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6">
                <h4 className="font-semibold text-earth-800 mb-3">
                  Payment Method
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'cash', label: 'Cash on Delivery', icon: Wallet },
                    { id: 'online', label: 'Online Payment', icon: CreditCard },
                    { id: 'qr', label: 'QR Payment', icon: QrCode },
                  ].map(method => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-mustard-400 bg-mustard-50'
                          : 'border-earth-200 hover:border-earth-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-mustard-500"
                      />
                      <method.icon size={18} />
                      <span className="font-medium">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Place Order Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 bg-mustard-500 hover:bg-mustard-600 text-earth-800 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Place Order
                  </>
                )}
              </motion.button>

              <p className="text-xs text-earth-400 text-center mt-2">
                By placing order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}

export default Checkout