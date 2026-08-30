import React, { createContext, useState, useEffect } from 'react'
import { soundFx } from '../utils/soundEffects'

export const SoundContext = createContext()

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(soundFx.getMuted())

  useEffect(() => {
    // Unlock AudioContext on first user gesture anywhere on screen
    const handleUserGesture = () => {
      soundFx.initContext()
    }

    const events = ['click', 'pointerdown', 'touchstart', 'keydown']
    events.forEach(event => {
      window.addEventListener(event, handleUserGesture, { passive: true })
    })

    // Delegated click listener for button click sounds on interactive HTML elements
    const handleGlobalClick = (e) => {
      const target = e.target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]')
      if (target && !target.disabled && !target.dataset.noSound) {
        soundFx.playButtonClick()
      }
    }

    window.addEventListener('click', handleGlobalClick, { capture: true })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserGesture)
      })
      window.removeEventListener('click', handleGlobalClick, { capture: true })
    }
  }, [])

  const toggleMute = () => {
    const nextState = !isMuted
    setIsMuted(nextState)
    soundFx.setMuted(nextState)
  }

  const value = {
    isMuted,
    toggleMute,
    playButtonClick: () => soundFx.playButtonClick(),
    playAddToCart: () => soundFx.playAddToCart(),
    playOrderPlaced: () => soundFx.playOrderPlaced(),
    playOrderNotification: () => soundFx.playOrderNotification(),
    playLoadingComplete: () => soundFx.playLoadingComplete(),
    playRemoveFromCart: () => soundFx.playRemoveFromCart(),
  }

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
