import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Clock, Star, Flame, Leaf } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { getImageUrl } from '../../utils/helpers'
import CategoryAnimatedEmoji from './CategoryAnimatedEmoji'
import { getCategoryMeta } from '../../utils/categoryEmojis'

const FoodCard = ({ product, featured = false }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [imgError, setImgError] = useState(false)
  const imageUrl = getImageUrl(product.image)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }
    setIsAdding(true)
    await addToCart(product.id, 1)
    setIsAdding(false)
  }

  const handleLike = (e) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`
        glass-card-liquid overflow-hidden group border border-white/90 shadow-xl
        ${featured ? 'border-2 !border-amber-400 shadow-amber-500/20' : ''}
      `}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-48">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100/80 via-orange-50/80 to-yellow-100/80 flex items-center justify-center relative overflow-hidden">
            <CategoryAnimatedEmoji
              categoryName={product.category_name}
              size="xl"
              showParticles={true}
            />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.is_hot_item && (
            <span className="glass-badge bg-rose-500/90 text-white border-rose-400">
              <Flame size={12} className="animate-bounce" /> Hot
            </span>
          )}
          {product.is_popular && (
            <span className="glass-badge bg-amber-500/90 text-earth-900 border-amber-300">
              <Star size={12} className="fill-earth-900" /> Popular
            </span>
          )}
          {product.is_today_special && (
            <span className="glass-badge bg-emerald-500/90 text-white border-emerald-400">
              Today's Special
            </span>
          )}
          {product.is_out_of_stock && (
            <span className="glass-badge bg-earth-800/90 text-white">
              Out of Stock
            </span>
          )}
        </div>
        
        {/* Food type */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className={`glass-badge ${product.food_type === 'veg' ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300' : 'bg-rose-100/90 text-rose-800 border-rose-300'}`}>
            {product.food_type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
          </span>
        </div>
        
        {/* Like button */}
        <button
          onClick={handleLike}
          className="absolute bottom-2.5 right-2.5 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/80 hover:scale-115 active:scale-90 transition-all z-10"
        >
          <Heart
            size={18}
            className={isLiked ? 'fill-rose-500 text-rose-500' : 'text-earth-400'}
          />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-display font-extrabold text-earth-900 text-lg leading-tight group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          {product.category_name && (
            <span className="text-[11px] font-black text-earth-700 bg-amber-50/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-200 shadow-xs flex items-center gap-1 shrink-0 ml-2">
              <CategoryAnimatedEmoji
                categoryName={product.category_name}
                size="sm"
                showGlow={false}
                showParticles={false}
                animated={false}
              />
              <span>{product.category_name}</span>
            </span>
          )}
        </div>
        
        <p className="text-earth-600 text-xs font-medium line-clamp-2 mb-3.5">
          {product.description}
        </p>
        
        {/* Price and prep time */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.discount_percentage > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gradient-gold">
                  ₹{product.final_price}
                </span>
                <span className="text-xs text-earth-400 line-through font-bold">
                  ₹{product.price}
                </span>
                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100/90 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  {product.discount_percentage}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-black text-gradient-gold">
                ₹{product.final_price}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-earth-500 text-xs font-extrabold bg-white/60 px-2 py-1 rounded-xl border border-white/70">
            <Clock size={13} className="text-amber-500" />
            <span>{product.preparation_time}m</span>
          </div>
        </div>
        
        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={product.is_out_of_stock || isAdding}
          className={`
            w-full py-3 rounded-2xl font-black text-xs transition-all duration-300
            flex items-center justify-center gap-2 border border-white/40
            ${product.is_out_of_stock
              ? 'bg-earth-200/80 text-earth-500 cursor-not-allowed'
              : 'btn-glass-primary'
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
      </div>
    </motion.div>
  )

}

export default FoodCard