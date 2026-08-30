import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UtensilsCrossed, Coffee, Flame } from 'lucide-react'
import { useSound } from '../../hooks/useSound'

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [showContent, setShowContent] = useState(true)
  let sound = null
  try {
    sound = useSound()
  } catch (e) {
    // Fallback
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          if (sound?.playLoadingComplete) {
            sound.playLoadingComplete()
          }
          setTimeout(() => {
            setShowContent(false)
            if (onComplete) onComplete()
          }, 500)
          return 100
        }
        return prev + 1
      })
    }, 30)

    return () => clearInterval(timer)
  }, [onComplete, sound])

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] traditional-bg flex flex-col items-center justify-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 text-6xl opacity-5 animate-float">
              🍛
            </div>
            <div className="absolute bottom-20 right-10 text-6xl opacity-5 animate-float animation-delay-200">
              🍽️
            </div>
            <div className="absolute top-1/2 left-1/4 text-8xl opacity-5 animate-float animation-delay-400">
              🥘
            </div>
          </div>

          {/* Main logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative z-10 text-center px-4"
          >
            <div className="relative inline-block mx-auto mb-3">
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/30 border-2 border-amber-400/60 p-2 bg-gradient-to-b from-amber-100/90 to-white/90 backdrop-blur-md transition-all duration-300 hover:scale-105">
                <img
                  src="/logo.png"
                  alt="EM BABU THINNAVA Logo"
                  className="w-full h-full object-cover rounded-2xl shadow-sm"
                />
              </div>
              <motion.div
                className="absolute -top-3 -right-3 text-3xl z-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              >
                <Flame className="text-orange-500 drop-shadow-md" />
              </motion.div>
              {/* Steam effect */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute -top-8 left-1/2 text-2xl text-white/40"
                  animate={{
                    y: [-20, -60],
                    opacity: [0.6, 0],
                    scale: [0.8, 1.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: 'easeOut',
                  }}
                  style={{ transform: `translateX(${(i - 1) * 20}px)` }}
                >
                  💨
                </motion.div>
              ))}
            </div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl md:text-5xl font-display font-black text-earth-800 mt-3 text-center flex items-center justify-center gap-2"
            >
              <span className="text-mustard-600">EM BABU</span>
              <span>THINNAVA?</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-amber-700 font-semibold text-center mt-1.5 text-sm md:text-base tracking-wide"
            >
              మీ క్యాంటీన్.. మీ ఇంటికే! • Canteen Online 🍽️
            </motion.p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-64 md:w-96 mt-12 relative z-10"
          >
            <div className="h-1.5 bg-earth-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-mustard-400 to-mustard-600 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-earth-500 mt-2"
            >
              {progress < 100 ? `Loading... ${progress}%` : 'Ready! ✨'}
            </motion.p>
          </motion.div>

          {/* Fun messages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center relative z-10"
          >
            <p className="text-earth-600 text-sm max-w-md px-4">
              {progress < 30 && "🫕 Preparing the kitchen..."}
              {progress >= 30 && progress < 60 && "🍳 Chef is cooking something special..."}
              {progress >= 60 && progress < 90 && "🌶️ Adding the final spices..."}
              {progress >= 90 && progress < 100 && "🍛 Almost ready! Getting the plates..."}
              {progress >= 100 && "✨ Babu! Food ready ayyindi!"}
            </p>
          </motion.div>

          {/* Food icons floating */}
          {['🍛', '🥘', '🍗', '🌶️', '🧆', '🍚', '🥣', '🍜'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                rotate: 0,
              }}
              animate={{
                y: -50,
                rotate: 360,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingScreen