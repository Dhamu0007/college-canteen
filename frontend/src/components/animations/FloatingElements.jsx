import React from 'react'
import { motion } from 'framer-motion'

const items = [
  { content: '/logo.png', type: 'logo', size: 'w-10 h-10' },
  { content: '✨', type: 'sparkle', size: 'text-xl' },
  { content: '🌶️', type: 'emoji', size: 'text-2xl' },
  { content: '', type: 'bubble', size: 'w-8 h-8' },
  { content: '🍗', type: 'emoji', size: 'text-3xl' },
  { content: '', type: 'bubble', size: 'w-12 h-12' },
  { content: '☕', type: 'emoji', size: 'text-2xl' },
  { content: '✨', type: 'sparkle', size: 'text-2xl' },
  { content: '/logo.png', type: 'logo', size: 'w-8 h-8' },
  { content: '', type: 'bubble', size: 'w-6 h-6' },
]

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 select-none z-0">
      {items.map((item, idx) => {
        const randomX = (idx * 11 + 7) % 92
        const randomDelay = idx * 0.6
        const randomDuration = 7 + (idx % 5)

        return (
          <motion.div
            key={idx}
            initial={{ y: '105vh', x: `${randomX}vw`, opacity: 0, scale: 0.8 }}
            animate={{
              y: '-25vh',
              opacity: [0, 0.9, 0.9, 0],
              scale: [0.8, 1.15, 0.9, 0.8],
              rotate: item.type === 'bubble' ? 0 : 360,
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: 'easeInOut',
            }}
            className="absolute flex items-center justify-center pointer-events-none"
          >
            {item.type === 'logo' ? (
              <img src={item.content} alt="" className={`${item.size} rounded-xl object-cover shadow-sm border border-amber-400/30`} />
            ) : item.type === 'bubble' ? (
              <div className={`${item.size} rounded-full bg-white/40 backdrop-blur-md border border-white/80 shadow-lg shadow-amber-500/20`} />
            ) : item.type === 'sparkle' ? (
              <span className={`${item.size} text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]`}>{item.content}</span>
            ) : (
              <span className={`${item.size} drop-shadow-md`}>{item.content}</span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default FloatingElements

