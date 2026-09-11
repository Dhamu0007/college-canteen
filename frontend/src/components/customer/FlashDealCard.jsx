import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, ShoppingBag, Eye, Flame, Sparkles } from 'lucide-react'
import { getImageUrl } from '../../utils/helpers'
import CategoryAnimatedEmoji from './CategoryAnimatedEmoji'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useSound } from '../../hooks/useSound'
import toast from 'react-hot-toast'

const FlashDealCard = ({ dealProduct, onQuickView }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { playAddToCart, playButtonClick } = useSound()
  const [isAdding, setIsAdding] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 3, minutes: 0, seconds: 0 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!dealProduct) return null

  const imageUrl = getImageUrl(dealProduct.image)

  const handleClaim = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to claim this special deal')
      return
    }
    setIsAdding(true)
    playButtonClick?.()
    const res = await addToCart(dealProduct.id, 1)
    if (res?.success) {
      playAddToCart?.()
      toast.success(`Claimed Flash Deal: ${dealProduct.name}! 🔥`)
    }
    setIsAdding(false)
  }

  const formatDigit = (num) => String(num).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d131f] to-slate-950 text-white p-6 md:p-8 shadow-2xl border border-amber-500/30 my-8"
    >
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Left Column: Offer Details */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 uppercase tracking-wider">
              <Zap size={14} className="fill-slate-950" /> Flash Canteen Deal
            </span>
            <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
              Limited Portions Today
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black font-display text-white tracking-tight leading-tight">
            {dealProduct.name}
          </h2>

          <p className="text-slate-300 text-xs md:text-sm font-medium line-clamp-2 max-w-xl">
            {dealProduct.description || 'Authentic Andhra style rich spiced specialty made with pure ingredients, slow cooked to perfection.'}
          </p>

          {/* Pricing & Countdown */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-black text-amber-400">
                ₹{dealProduct.final_price || dealProduct.price}
              </span>
              <span className="text-sm md:text-base text-slate-400 line-through font-bold">
                ₹{Number(dealProduct.price || dealProduct.final_price) + 40}
              </span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                SAVE ₹40
              </span>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
              <Clock size={16} className="text-amber-400" />
              <div className="flex items-center gap-1 font-mono font-black text-sm text-amber-300">
                <span className="bg-slate-900/90 px-1.5 py-0.5 rounded-md">{formatDigit(timeLeft.hours)}</span>
                <span>:</span>
                <span className="bg-slate-900/90 px-1.5 py-0.5 rounded-md">{formatDigit(timeLeft.minutes)}</span>
                <span>:</span>
                <span className="bg-slate-900/90 px-1.5 py-0.5 rounded-md text-amber-400">{formatDigit(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>

          {/* Stock bar */}
          <div className="max-w-md pt-1">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1">
                <Flame size={13} className="text-rose-400 animate-bounce" /> Fast Selling
              </span>
              <span className="text-amber-300">82% Claimed</span>
            </div>
            <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
              <div className="w-[82%] h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleClaim}
              disabled={dealProduct.is_out_of_stock || isAdding}
              className="btn-glass-primary !py-3.5 !px-7 text-xs font-black shadow-xl shadow-amber-500/30 flex-1 sm:flex-initial"
            >
              {isAdding ? (
                <span>Adding...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingBag size={16} /> Grab Deal Now
                </span>
              )}
            </button>

            <button
              onClick={() => onQuickView?.(dealProduct)}
              className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <Eye size={16} /> Quick View
            </button>
          </div>
        </div>

        {/* Right Column: Visual Showcase */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-sm aspect-video sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 group bg-slate-950/60">
            {imageUrl && !imgError ? (
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                {/* Ambient blur backdrop */}
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-35 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none z-1" />
                <img
                  src={imageUrl}
                  alt={dealProduct.name}
                  className="relative z-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <CategoryAnimatedEmoji
                  categoryName={dealProduct.category_name}
                  size="2xl"
                  showParticles={true}
                />
                <span className="mt-4 text-xs font-black uppercase text-amber-400 bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/30">
                  {dealProduct.category_name || 'Chef Specialty'}
                </span>
              </div>
            )}

            {/* Glowing badge */}
            <div className="absolute top-3 right-3 bg-rose-600/90 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border border-rose-400 flex items-center gap-1 animate-pulse">
              <Sparkles size={12} /> Today's Crown Dish
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FlashDealCard
