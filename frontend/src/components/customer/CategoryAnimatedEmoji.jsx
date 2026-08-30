import React from 'react'
import { motion } from 'framer-motion'
import { getCategoryMeta } from '../../utils/categoryEmojis'

const CategoryAnimatedEmoji = ({
  categoryName = '',
  icon = '',
  size = 'md',
  isSelected = false,
  className = '',
  showGlow = true,
  showParticles = true,
  animated = true,
}) => {
  const meta = getCategoryMeta(categoryName, icon)
  
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }

  const emojiFontSizes = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  }

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Background Glow Aura */}
      {showGlow && (
        <motion.div
          animate={{
            scale: isSelected ? [1, 1.25, 1] : [1, 1.1, 1],
            opacity: isSelected ? [0.7, 0.95, 0.7] : [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: isSelected ? 2 : 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${meta.bgGradient} blur-sm pointer-events-none`}
        />
      )}

      {/* Micro Floating Particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {meta.particles.slice(0, 2).map((pt, i) => (
            <span
              key={i}
              className="absolute text-[10px] animate-particle-float opacity-80"
              style={{
                top: `${10 + i * 35}%`,
                left: `${10 + i * 55}%`,
                animationDelay: `${i * 0.9}s`,
              }}
            >
              {pt}
            </span>
          ))}
        </div>
      )}

      {/* Main Dynamic Emoji Icon */}
      <motion.div
        whileHover={{ scale: 1.18, rotate: 6 }}
        whileTap={{ scale: 0.92 }}
        className={`
          relative z-10 flex items-center justify-center rounded-2xl
          ${sizeClasses[size] || sizeClasses.md}
          ${animated ? meta.animationClass : ''}
        `}
      >
        <span className={`${emojiFontSizes[size] || emojiFontSizes.md} filter drop-shadow-md`}>
          {meta.emoji}
        </span>
      </motion.div>
    </div>
  )
}

export default CategoryAnimatedEmoji
