import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Clock, Star, Flame, Eye, Plus, Minus, Sparkles, Image as ImageIcon } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useSound } from '../../hooks/useSound'
import toast from 'react-hot-toast'
import { getImageUrl } from '../../utils/helpers'
import CategoryAnimatedEmoji from './CategoryAnimatedEmoji'

const getCategoryGradient = (categoryName = '', foodType = 'veg') => {
  const name = categoryName.toLowerCase()
  if (name.includes('biryani') || name.includes('rice')) {
    return 'from-amber-600/20 via-orange-600/20 to-red-600/30'
  }
  if (name.includes('tiffin') || name.includes('dosa')) {
    return 'from-yellow-500/20 via-amber-500/20 to-orange-500/25'
  }
  if (name.includes('thali') || name.includes('meal')) {
    return 'from-emerald-600/20 via-teal-600/20 to-amber-600/20'
  }
  if (name.includes('starter') || name.includes('fry')) {
    return 'from-rose-600/25 via-red-600/20 to-orange-600/25'
  }
  if (name.includes('beverage') || name.includes('coffee')) {
    return 'from-amber-800/20 via-yellow-700/20 to-amber-600/20'
  }
  return foodType === 'veg'
    ? 'from-emerald-500/20 via-teal-500/15 to-amber-500/15'
    : 'from-rose-500/20 via-orange-500/20 to-red-500/25'
}

const FoodCard = ({ product, featured = false, onQuickView, viewMode = 'grid' }) => {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { playAddToCart, playButtonClick, playRemoveFromCart } = useSound()
  const [isLiked, setIsLiked] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [imgError, setImgError] = useState(false)
  const imageUrl = getImageUrl(product.image)

  // Check if item is in cart
  const cartItem = cart?.items?.find(item => 
    item.product?.id === product.id || item.product_id === product.id
  )
  const currentQuantity = cartItem ? cartItem.quantity : 0

  const handleAddToCart = async (e) => {
    e?.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }
    setIsAdding(true)
    playButtonClick?.()
    const res = await addToCart(product.id, 1)
    if (res?.success) {
      playAddToCart?.()
      toast.success(`Added ${product.name} to cart! ✨`, { id: `cart-${product.id}` })
    }
    setIsAdding(false)
  }

  const handleIncrement = async (e) => {
    e?.stopPropagation()
    if (!cartItem) return
    setIsAdding(true)
    playButtonClick?.()
    await updateQuantity(cartItem.id, currentQuantity + 1)
    playAddToCart?.()
    setIsAdding(false)
  }

  const handleDecrement = async (e) => {
    e?.stopPropagation()
    if (!cartItem) return
    setIsAdding(true)
    playButtonClick?.()
    if (currentQuantity <= 1) {
      await removeFromCart(cartItem.id)
      playRemoveFromCart?.()
    } else {
      await updateQuantity(cartItem.id, currentQuantity - 1)
    }
    setIsAdding(false)
  }

  const handleLike = (e) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    playButtonClick?.()
  }

  // Compact List View Mode
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        onClick={() => onQuickView?.(product)}
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500/50 transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden relative shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shadow-inner`}>
            {imageUrl && !imgError ? (
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                {/* Ambient blur backdrop */}
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-md scale-125 opacity-40 pointer-events-none"
                />
                {/* Foreground thumbnail */}
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="relative z-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              </div>
            ) : (
              <CategoryAnimatedEmoji categoryName={product.category_name} size="md" />
            )}
            <span className={`absolute bottom-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs z-10 ${product.food_type === 'veg' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
              {product.food_type === 'veg' ? 'Veg' : 'Non-Veg'}
            </span>
          </div>

          <div className="min-w-0">
            <h4 className="font-display font-black text-slate-900 dark:text-white text-sm sm:text-base truncate group-hover:text-amber-500 transition-colors">
              {product.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium mt-0.5">
              {product.description}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-base sm:text-lg font-black text-amber-500 dark:text-amber-400">
                ₹{product.final_price || product.price}
              </span>
              {product.discount_percentage > 0 && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
                  {product.discount_percentage}% OFF
                </span>
              )}
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <Clock size={11} className="text-amber-500" /> {product.preparation_time || 15}m
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {currentQuantity > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/50 p-1 rounded-xl"
            >
              <button
                onClick={handleDecrement}
                disabled={isAdding}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-bold shadow-xs hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Minus size={13} />
              </button>
              <span className="w-5 text-center font-black text-xs text-slate-900 dark:text-white">{currentQuantity}</span>
              <button
                onClick={handleIncrement}
                disabled={isAdding}
                className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs hover:bg-amber-600 transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.is_out_of_stock || isAdding}
              className="btn-glass-primary !py-2 !px-4 text-xs font-black shadow-sm"
            >
              <Plus size={15} /> Add
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // Grid View Mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`
        bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl overflow-hidden group border transition-all duration-300 flex flex-col justify-between shadow-lg
        ${featured
          ? 'border-2 !border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10'
          : 'border-slate-200/90 dark:border-slate-800/90 hover:border-amber-400 dark:hover:border-amber-500/60 hover:shadow-2xl'
        }
      `}
    >
      {/* Image / Visual Showcase Container - Perfect Fit System */}
      <div
        className="relative overflow-hidden h-48 sm:h-52 cursor-pointer select-none bg-slate-900/5 dark:bg-slate-950/40"
        onClick={() => onQuickView?.(product)}
      >
        {imageUrl && !imgError ? (
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            {/* Ambient Blurred Backdrop Layer - Eliminates harsh letterboxing or edge cuts */}
            <img
              src={imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-35 dark:opacity-45 pointer-events-none"
            />
            {/* Cinematic Scrim Gradient to protect contrast and badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/35 pointer-events-none z-1" />
            
            {/* Primary Dish Image - Perfectly Fitted & Centered */}
            <img
              src={imageUrl}
              alt={product.name}
              className="relative z-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getCategoryGradient(product.category_name, product.food_type)} flex flex-col items-center justify-center relative overflow-hidden p-4`}>
            {/* Ambient background glow rings */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
            
            <CategoryAnimatedEmoji
              categoryName={product.category_name}
              size="xl"
              showParticles={true}
            />

            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/50 dark:border-slate-700">
              {product.category_name || 'Canteen Item'}
            </span>
          </div>
        )}

        {/* Hover Quick View Trigger Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onQuickView?.(product)
            }}
            className="px-4 py-2 rounded-xl bg-white/95 text-slate-900 font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
          >
            <Eye size={15} className="text-amber-600" /> View Details
          </button>
        </div>

        {/* Badges (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_hot_item && (
            <span className="glass-badge bg-rose-600 text-white border-rose-400/50 shadow-md">
              <Flame size={12} className="animate-bounce" /> Hot Seller
            </span>
          )}
          {product.is_popular && (
            <span className="glass-badge bg-amber-500 text-slate-950 border-amber-300/60 shadow-md font-black">
              <Star size={12} className="fill-slate-950" /> Popular
            </span>
          )}
          {product.is_today_special && (
            <span className="glass-badge bg-emerald-600 text-white border-emerald-400/50 shadow-md">
              <Sparkles size={12} /> Today's Special
            </span>
          )}
          {product.is_out_of_stock && (
            <span className="glass-badge bg-slate-800 text-white shadow-md">
              Out of Stock
            </span>
          )}
        </div>

        {/* Dietary Tag (Top Right) */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`glass-badge shadow-md ${
            product.food_type === 'veg'
              ? 'bg-emerald-100/95 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
              : 'bg-rose-100/95 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
          }`}>
            {product.food_type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
          </span>
        </div>

        {/* Favorite Like Button */}
        <button
          onClick={handleLike}
          className="absolute bottom-3 right-3 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg border border-white/80 dark:border-slate-700 hover:scale-115 active:scale-90 transition-all z-20"
          title="Save to favorites"
        >
          <Heart
            size={16}
            className={isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-400'}
          />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between mb-1.5">
            <h3
              onClick={() => onQuickView?.(product)}
              className="font-display font-black text-slate-900 dark:text-white text-lg leading-tight group-hover:text-amber-500 transition-colors cursor-pointer"
            >
              {product.name}
            </h3>
            {product.category_name && (
              <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 shrink-0 ml-2">
                {product.category_name}
              </span>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-xs font-medium line-clamp-2 mb-4">
            {product.description || 'Authentic dish prepared fresh with traditional spices.'}
          </p>
        </div>

        <div>
          {/* Price and Preparation Time */}
          <div className="flex items-center justify-between mb-4">
            <div>
              {product.discount_percentage > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-amber-500 dark:text-amber-400">
                    ₹{product.final_price || product.price}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-bold">
                    ₹{product.price}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-full">
                    {product.discount_percentage}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-black text-amber-500 dark:text-amber-400">
                  ₹{product.final_price || product.price}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-extrabold bg-slate-100/90 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <Clock size={13} className="text-amber-500" />
              <span>{product.preparation_time || 15}m</span>
            </div>
          </div>

          {/* Add to Cart or Inline Stepper */}
          {currentQuantity > 0 ? (
            <div className="w-full py-1.5 px-2 bg-amber-500/10 dark:bg-amber-500/15 rounded-2xl border border-amber-400/50 flex items-center justify-between">
              <button
                onClick={handleDecrement}
                disabled={isAdding}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-bold shadow-sm hover:bg-amber-100 dark:hover:bg-slate-700 active:scale-95 transition-all"
                title="Decrease portion"
              >
                <Minus size={15} />
              </button>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block leading-none">In Cart</span>
                <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">{currentQuantity} Portions</span>
              </div>
              <button
                onClick={handleIncrement}
                disabled={isAdding}
                className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md hover:bg-amber-600 active:scale-95 transition-all"
                title="Increase portion"
              >
                <Plus size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.is_out_of_stock || isAdding}
              className={`
                w-full py-3 rounded-2xl font-black text-xs transition-all duration-300
                flex items-center justify-center gap-2 border border-white/20
                ${product.is_out_of_stock
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'btn-glass-primary shadow-lg shadow-amber-500/20'
                }
              `}
            >
              {isAdding ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </>
              ) : product.is_out_of_stock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default FoodCard