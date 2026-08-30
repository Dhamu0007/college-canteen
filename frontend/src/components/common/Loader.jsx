import React from 'react'

const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div
        className={`${sizeClasses[size]} border-mustard-500 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-earth-600 text-sm font-medium animate-pulse">{text}</p>}
    </div>
  )
}

export default Loader
