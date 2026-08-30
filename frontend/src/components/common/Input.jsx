import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Input = forwardRef(({
  label,
  error,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseClasses = `
    w-full px-4 py-3 rounded-xl
    border-2 border-earth-200
    bg-white/80 backdrop-blur-sm
    focus:border-mustard-400 focus:ring-2 focus:ring-mustard-200 focus:outline-none
    transition-all duration-300
    ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}
    ${Icon ? 'pl-12' : ''}
    ${className}
  `

  return (
    <div className="w-full">
      {label && (
        <label className="block text-earth-700 font-medium mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400">
            <Icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          className={baseClasses}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400">
            <Icon size={20} />
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input