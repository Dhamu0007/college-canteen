class SoundEffects {
  constructor() {
    this.ctx = null
    this.isMuted = localStorage.getItem('sound_muted') === 'true'
    this.volume = 0.6
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  }

  setMuted(muted) {
    this.isMuted = muted
    localStorage.setItem('sound_muted', muted ? 'true' : 'false')
  }

  getMuted() {
    return this.isMuted
  }

  // Helper to check audio readiness
  canPlay() {
    if (this.isMuted) return false
    this.initContext()
    if (!this.ctx) return false
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return true
  }

  // 1. Button click sound (subtle, crisp tactile click)
  playButtonClick() {
    if (!this.canPlay()) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05)

      gain.gain.setValueAtTime(this.volume * 0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.05)
    } catch (e) {
      console.warn('Sound play error:', e)
    }
  }

  // 2. Add to cart sound (cheerful ascending double-note pop: E5 -> C6)
  playAddToCart() {
    if (!this.canPlay()) return

    try {
      const now = this.ctx.currentTime

      // Note 1: E5 (659.25Hz)
      const osc1 = this.ctx.createOscillator()
      const gain1 = this.ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(659.25, now)
      gain1.gain.setValueAtTime(this.volume * 0.6, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

      osc1.connect(gain1)
      gain1.connect(this.ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.15)

      // Note 2: C6 (1046.50Hz)
      const osc2 = this.ctx.createOscillator()
      const gain2 = this.ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1046.50, now + 0.09)
      gain2.gain.setValueAtTime(0.001, now)
      gain2.gain.setValueAtTime(this.volume * 0.7, now + 0.09)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc2.connect(gain2)
      gain2.connect(this.ctx.destination)
      osc2.start(now + 0.09)
      osc2.stop(now + 0.3)
    } catch (e) {
      console.warn('Sound play error:', e)
    }
  }

  // 3. Order placed sound (festive celebratory chord arpeggio: C5 -> E5 -> G5 -> C6)
  playOrderPlaced() {
    if (!this.canPlay()) return

    try {
      const now = this.ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.50]
      const timings = [0, 0.08, 0.16, 0.26]

      notes.forEach((freq, i) => {
        const startTime = now + timings[i]
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = i === 3 ? 'triangle' : 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        const noteDuration = i === 3 ? 0.7 : 0.3
        gain.gain.setValueAtTime(0.001, startTime)
        gain.gain.setValueAtTime(this.volume * (i === 3 ? 0.8 : 0.5), startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + noteDuration)
      })
    } catch (e) {
      console.warn('Sound play error:', e)
    }
  }

  // 4. Order notification sound (double ping bell chime: A5 -> D6)
  playOrderNotification() {
    if (!this.canPlay()) return

    try {
      const now = this.ctx.currentTime
      const notes = [880, 1174.66]
      const delays = [0, 0.12]

      notes.forEach((freq, i) => {
        const startTime = now + delays[i]
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.001, startTime)
        gain.gain.setValueAtTime(this.volume * 0.6, startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.45)
      })
    } catch (e) {
      console.warn('Sound play error:', e)
    }
  }

  // 5. Loading completion sound (uplifting 3-step welcome chime: G5 -> C6 -> E6)
  playLoadingComplete() {
    if (!this.canPlay()) return

    try {
      const now = this.ctx.currentTime
      const notes = [783.99, 1046.50, 1318.51]
      const delays = [0, 0.1, 0.2]

      notes.forEach((freq, i) => {
        const startTime = now + delays[i]
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        const duration = i === 2 ? 0.6 : 0.25
        gain.gain.setValueAtTime(0.001, startTime)
        gain.gain.setValueAtTime(this.volume * (i === 2 ? 0.7 : 0.4), startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + duration)
      })
    } catch (e) {
      console.warn('Sound play error:', e)
    }
  }

  // 6. Remove from cart sound (soft pitch drop: E4 -> C4)
  playRemoveFromCart() {
    if (!this.canPlay()) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(329.63, now)
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.14)

      gain.gain.setValueAtTime(this.volume * 0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.14)
    } catch (e) {
      console.warn('Sound play error:', e)
    }
  }
}

export const soundFx = new SoundEffects()
