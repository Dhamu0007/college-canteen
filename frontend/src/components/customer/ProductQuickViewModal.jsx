import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Flame, Heart, ShoppingBag, Plus, Minus, Sparkles, Check, Info } from 'lucide-react'
import { getImageUrl } from '../../utils/helpers'
import CategoryAnimatedEmoji from './CategoryAnimatedEmoji'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useSound } from '../../hooks/useSound'
import toast from 'react-hot-toast'

const ProductQuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart, cart } = useCart()
  const { isAuthenticated } = useAuth()
  const { playAddToCart, playButtonClick } = useSound()

  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [imgError, setImgError] = useState(false)

  if (!isOpen || !product) return null

  const imageUrl = getImageUrl(product.image)
  const price = Number(product.final_price || product.price || 0)
  const totalPrice = (price * quantity).toFixed(2)

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add dishes to your cart')
      return
    }
    setIsAdding(true)
    playButtonClick?.()
    const res = await addToCart(product.id, quantity)
    if (res?.success) {
      playAddToCart?.()
      toast.success(`Added ${quantity}x ${product.name} to cart! ✨`)
      onClose()
    }
    setIsAdding(false)
  }

  // Determine spice level based on dish
  const isSpicy = product.is_hot_item || (product.name && /biryani|fry|roast|masala|mirchi|karam/i.test(product.name))
  const spiceLevel = isSpicy ? 3 : 1

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden z-10 my-auto text-slate-900 dark:text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-md border border-slate-200/80 dark:border-slate-700 transition-all hover:scale-110 active:scale-95"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Visual Column */}
            <div className="relative h-64 md:h-full min-h-[280px] bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-600/20 dark:from-slate-800/50 dark:to-slate-900/50 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800">
              {imageUrl && !imgError ? (
                <div className="relative w-full h-full min-h-[280px] overflow-hidden flex items-center justify-center">
                  {/* Ambient blur backdrop */}
                  <img
                    src={imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40 dark:opacity-50 pointer-events-none"
                  />
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain p-4 drop-shadow-xl"
                    onError={() => setImgError(true)}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <CategoryAnimatedEmoji
                    categoryName={product.category_name}
                    size="2xl"
                    showParticles={true}
                  />
                  <span className="mt-3 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-950/70 px-3.5 py-1 rounded-full border border-amber-300/60 dark:border-amber-700/60">
                    {product.category_name || 'Chef Specialty'}
                  </span>
                </div>
              )}

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                <span className={`glass-badge text-xs font-extrabold shadow-md ${
                  product.food_type === 'veg'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}>
                  {product.food_type === 'veg' ? '🟢 Pure Veg' : '🔴 Authentic Non-Veg'}
                </span>
                {product.is_hot_item && (
                  <span className="glass-badge bg-rose-600 text-white shadow-md">
                    <Flame size={13} className="animate-bounce" /> Hot Seller
                  </span>
                )}
                {product.is_today_special && (
                  <span className="glass-badge bg-amber-500 text-slate-950 shadow-md font-black">
                    <Sparkles size={13} /> Chef's Special
                  </span>
                )}
              </div>

              {/* Like toggle */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="absolute bottom-4 right-4 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <Heart size={18} className={isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
              </button>
            </div>

            {/* Info Column */}
            <div className="p-6 sm:p-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {product.category_name || 'Canteen Delicacy'}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    <Clock size={13} className="text-amber-500" />
                    <span>{product.preparation_time || 15} mins</span>
                  </div>
                </div>

                <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-amber-500 dark:text-amber-400">
                    ₹{product.final_price || product.price}
                  </span>
                  {product.discount_percentage > 0 && (
                    <>
                      <span className="text-sm text-slate-400 line-through font-bold">
                        ₹{product.price}
                      </span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-black bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                        {product.discount_percentage}% OFF
                      </span>
                    </>
                  )}
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium mt-3 leading-relaxed">
                  {product.description || 'Authentic Andhra style preparation made fresh with aromatic spices, purest ingredients, and served hot.'}
                </p>

                {/* Spice Meter */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Flame size={14} className="text-rose-500" /> Andhra Spice Level:
                    </span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">
                      {spiceLevel === 3 ? '🔥 Spicy & Flavourful' : '🌿 Mild & Balanced'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className={`h-1.5 rounded-full ${spiceLevel >= 1 ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`h-1.5 rounded-full ${spiceLevel >= 2 ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`h-1.5 rounded-full ${spiceLevel >= 3 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kitchen Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Extra chutney, less spicy, serve hot..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Portions:</span>
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-white font-bold shadow-xs hover:bg-amber-100 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-black text-sm text-slate-900 dark:text-white w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-white font-bold shadow-xs hover:bg-amber-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="text-left">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block leading-none">Total</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">₹{totalPrice}</span>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={product.is_out_of_stock || isAdding}
                    className="flex-1 btn-glass-primary !py-3.5 !px-6 text-sm font-black shadow-lg shadow-amber-500/20"
                  >
                    {isAdding ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Adding...
                      </span>
                    ) : product.is_out_of_stock ? (
                      'Out of Stock'
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingBag size={18} />
                        Add to Order • ₹{totalPrice}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ProductQuickViewModal
