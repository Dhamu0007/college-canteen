import React from 'react'

const Logo = ({
  size = 'md',
  className = '',
  imageClassName = '',
  showText = false,
  textClassName = '',
  animated = false,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32 md:w-40 md:h-40',
  }

  const dimensionClass = sizeMap[size] || sizeMap.md

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${dimensionClass} flex-shrink-0 ${animated ? 'animate-float' : ''}`}>
        <img
          src="/logo.png"
          alt="EM BABU THINNAVA Logo"
          className={`w-full h-full object-cover rounded-2xl shadow-md shadow-amber-500/20 border border-amber-400/30 ${imageClassName}`}
        />
      </div>
      {showText && (
        <div className={textClassName}>
          <span className="font-display font-black text-xl text-earth-900 tracking-tight flex items-center gap-1">
            <span className="text-gradient-gold">EM BABU</span>
            <span className="text-earth-800"> THINNAVA?</span>
          </span>
          <span className="block text-[11px] font-bold text-amber-600 uppercase tracking-widest -mt-1">
            Andhra Canteen
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
