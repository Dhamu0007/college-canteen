import React from 'react'
import { motion } from 'framer-motion'
import CategoryAnimatedEmoji from './CategoryAnimatedEmoji'
import { getCategoryMeta } from '../../utils/categoryEmojis'
import { getImageUrl } from '../../utils/helpers'

const CategoryCard = ({ category, isSelected, onClick }) => {
  const catName = category?.name || ''
  const catIcon = category?.icon || ''
  const catImage = getImageUrl(category?.image)
  const meta = getCategoryMeta(catName, catIcon)

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-5 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all whitespace-nowrap shadow-sm group border
        ${
          isSelected
            ? 'bg-gradient-to-r from-mustard-500 to-amber-500 text-earth-900 shadow-md ring-2 ring-mustard-600 border-transparent'
            : 'bg-white/90 backdrop-blur-md text-earth-800 hover:bg-amber-50/60 border-earth-200/80 hover:border-amber-300'
        }
      `}
    >
      {catImage ? (
        <img
          src={catImage}
          alt={catName}
          className="w-7 h-7 rounded-lg object-cover shadow-xs border border-white/60"
        />
      ) : (
        <CategoryAnimatedEmoji
          categoryName={catName}
          icon={catIcon}
          size="sm"
          isSelected={isSelected}
          showParticles={isSelected}
        />
      )}
      <span className="text-sm md:text-base font-extrabold tracking-wide">{category.name}</span>
      {category.count !== undefined && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
            isSelected
              ? 'bg-earth-900/10 text-earth-900'
              : 'bg-earth-100 text-earth-600 group-hover:bg-amber-100 group-hover:text-amber-800'
          }`}
        >
          {category.count}
        </span>
      )}
    </motion.button>
  )
}

export default CategoryCard
