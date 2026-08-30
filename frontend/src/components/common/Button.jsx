import React from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../../hooks/useSound'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  suppressSound = false,
  ...props
}) => {
  let sound = null
  try {
    sound = useSound()
  } catch (e) {
    // Fallback if rendered outside SoundProvider
  }

  const handleClick = (e) => {
    if (!suppressSound && sound?.playButtonClick) {
      sound.playButtonClick()
    }
    if (onClick) {
      onClick(e)
    }
  }

  const variants = {
    primary: 'bg-mustard-500 hover:bg-mustard-600 text-earth-800 shadow-md hover:shadow-lg',
    secondary: 'bg-earth-600 hover:bg-earth-700 text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-earth-300 hover:border-mustard-400 text-earth-700 hover:text-earth-800 hover:bg-earth-50',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg',
    ghost: 'hover:bg-earth-100 text-earth-600 hover:text-earth-800',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  const baseClasses = `
    font-semibold rounded-xl transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-mustard-300 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  `

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}

export default Button