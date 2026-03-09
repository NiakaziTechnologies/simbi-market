"use client"

/**
 * Notification Sound Utility
 * Uses Web Audio API to generate notification sounds without external audio files
 */

// Audio context singleton
let audioContext: AudioContext | null = null

/**
 * Get or create the AudioContext
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.error("Failed to create AudioContext:", error)
      return null
    }
  }
  return audioContext
}

/**
 * Check if notification sounds are enabled
 * Defaults to true if not set
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem("notificationSoundEnabled")
  if (stored === null) return true // Default to enabled
  return stored === "true"
}

/**
 * Enable or disable notification sounds
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem("notificationSoundEnabled", String(enabled))
}

/**
 * Play a pleasant notification sound using Web Audio API
 * Generates a two-tone chime sound
 */
export function playNotificationSound(): void {
  if (typeof window === "undefined") return
  
  // Check if sound is enabled
  if (!isSoundEnabled()) return

  const ctx = getAudioContext()
  if (!ctx) return

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume().catch(console.error)
  }

  const now = ctx.currentTime

  // Create oscillator for first tone (higher pitch)
  const oscillator1 = ctx.createOscillator()
  const gainNode1 = ctx.createGain()
  
  // Create oscillator for second tone (lower pitch, follows first)
  const oscillator2 = ctx.createOscillator()
  const gainNode2 = ctx.createGain()

  // Configure first oscillator - pleasant higher tone
  oscillator1.type = "sine"
  oscillator1.frequency.setValueAtTime(880, now) // A5 note
  oscillator1.frequency.exponentialRampToValueAtTime(440, now + 0.1) // Drops to A4
  
  // Configure gain for first tone (fade out)
  gainNode1.gain.setValueAtTime(0.3, now)
  gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

  // Configure second oscillator - lower harmonious tone
  oscillator2.type = "sine"
  oscillator2.frequency.setValueAtTime(659.25, now + 0.1) // E5 note (slightly delayed)
  oscillator2.frequency.exponentialRampToValueAtTime(329.63, now + 0.2) // Drops to E4
  
  // Configure gain for second tone (fade out)
  gainNode2.gain.setValueAtTime(0, now)
  gainNode2.gain.setValueAtTime(0.25, now + 0.1)
  gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

  // Connect nodes
  oscillator1.connect(gainNode1)
  gainNode1.connect(ctx.destination)
  
  oscillator2.connect(gainNode2)
  gainNode2.connect(ctx.destination)

  // Start and stop oscillators
  oscillator1.start(now)
  oscillator1.stop(now + 0.2)
  
  oscillator2.start(now + 0.1)
  oscillator2.stop(now + 0.35)
}

/**
 * Play a more prominent notification sound for urgent notifications
 */
export function playUrgentNotificationSound(): void {
  if (typeof window === "undefined") return
  
  if (!isSoundEnabled()) return

  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === "suspended") {
    ctx.resume().catch(console.error)
  }

  const now = ctx.currentTime

  // Create a triple-tone chime for urgent notifications
  const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5 (C major chord)
  
  frequencies.forEach((freq, index) => {
    const oscillator = ctx!.createOscillator()
    const gainNode = ctx!.createGain()
    
    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(freq, now)
    
    const startTime = now + (index * 0.05)
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx!.destination)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.5)
  })
}

