import React from 'react'
import { motion } from 'framer-motion'

const LiquidGlassBackground = ({ opacity = 0.85 }) => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transform-gpu contain-strict"
      style={{ opacity, willChange: 'transform' }}
    >
      {/* Liquid Blob 1 - Top Left Amber/Gold */}
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.2, 0.9, 1],
          rotate: [0, 90, 180, 360],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
        className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-amber-400/25 via-yellow-500/15 to-orange-400/10 blur-[50px] transform-gpu"
      />

      {/* Liquid Blob 2 - Top Right Emerald / Cyan */}
      <motion.div
        animate={{
          x: [0, -70, 40, 0],
          y: [0, 60, -40, 0],
          scale: [1, 1.15, 0.95, 1],
          rotate: [0, -120, -240, -360],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
        className="absolute -top-40 -right-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-500/15 to-cyan-400/10 blur-[60px] transform-gpu"
      />

      {/* Liquid Blob 3 - Bottom Left Cyan / Indigo */}
      <motion.div
        animate={{
          x: [0, 50, -40, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.25, 0.85, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
        className="absolute -bottom-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-pink-400/10 blur-[60px] transform-gpu"
      />

      {/* Liquid Blob 4 - Center Right Vibrant Gold */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, -30, 60, 0],
          scale: [0.9, 1.15, 1, 0.9],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
        className="absolute top-1/2 -right-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-l from-mustard-400/20 via-amber-300/10 to-transparent blur-[50px] transform-gpu"
      />

      {/* Specular Ambient Wave Mesh */}
      <div className="absolute inset-0 bg-liquid-mesh opacity-50 mix-blend-overlay pointer-events-none transform-gpu" />
    </div>
  )
}

export default LiquidGlassBackground
