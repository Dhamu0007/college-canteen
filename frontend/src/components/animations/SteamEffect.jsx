import React from 'react'
import { motion } from 'framer-motion'

const SteamEffect = ({ count = 3 }) => {
  const steams = Array.from({ length: count })

  return (
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex space-x-2 pointer-events-none z-10">
      {steams.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.2, y: 0, scale: 0.6 }}
          animate={{
            opacity: [0.2, 0.7, 0],
            y: [-4, -18, -28],
            scale: [0.6, 1.2, 1.6],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeOut',
          }}
          className="w-1.5 h-6 bg-gradient-to-t from-white/60 to-transparent rounded-full filter blur-[1px]"
        />
      ))}
    </div>
  )
}

export default SteamEffect
