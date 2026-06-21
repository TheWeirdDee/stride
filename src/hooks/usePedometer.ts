import { useState, useRef, useCallback, useEffect } from 'react'

export interface UsePedometerReturn {
  steps: number
  supported: boolean
  start: (opts?: { resume?: boolean }) => Promise<void>
  stop: () => void
  reset: () => void
}

/**
 * Accelerometer-based step counter (DeviceMotion) — counts steps with NO GPS.
 * Works in webviews/wallets (incl. MiniPay) that expose motion sensors even when
 * they block geolocation. Optional `persistKey` mirrors the count to localStorage
 * so it survives navigating away and back, like the GPS tracker.
 */
export function usePedometer(persistKey?: string): UsePedometerReturn {
  const [steps, setSteps] = useState(0)
  const [supported, setSupported] = useState(true)
  const stepsRef = useRef(0)
  const listeningRef = useRef(false)

  // Peak-detection state.
  const smoothRef = useRef(0)
  const risingRef = useRef(false)
  const lastStepRef = useRef(0)

  const persist = useCallback(() => {
    if (!persistKey) return
    try { localStorage.setItem(persistKey, String(stepsRef.current)) } catch {}
  }, [persistKey])

  const onMotion = useCallback((e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity
    if (!a || a.x == null) return
    const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2)
    // Low-pass smooth to ignore high-frequency noise.
    smoothRef.current = smoothRef.current === 0 ? mag : smoothRef.current * 0.8 + mag * 0.2
    const s = smoothRef.current
    // Hysteresis around ~gravity(9.8): a step is a rise above HIGH then fall below LOW.
    const HIGH = 11.5
    const LOW = 10.0
    if (!risingRef.current && s > HIGH) {
      risingRef.current = true
    } else if (risingRef.current && s < LOW) {
      risingRef.current = false
      const now = Date.now()
      if (now - lastStepRef.current > 270) { // debounce → max ~3.7 steps/s
        lastStepRef.current = now
        stepsRef.current += 1
        setSteps(stepsRef.current)
        persist()
      }
    }
  }, [persist])

  const start = useCallback(async ({ resume = false } = {}) => {
    if (typeof window === 'undefined' || typeof DeviceMotionEvent === 'undefined') {
      setSupported(false)
      return
    }
    if (resume && persistKey) {
      try {
        const v = parseInt(localStorage.getItem(persistKey) || '0', 10)
        if (!Number.isNaN(v)) { stepsRef.current = v; setSteps(v) }
      } catch {}
    }
    // iOS 13+ requires explicit permission, granted from a user gesture.
    const dme = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> }
    if (typeof dme.requestPermission === 'function') {
      try {
        const res = await dme.requestPermission()
        if (res !== 'granted') { setSupported(false); return }
      } catch { setSupported(false); return }
    }
    if (listeningRef.current) return
    window.addEventListener('devicemotion', onMotion)
    listeningRef.current = true
  }, [onMotion, persistKey])

  const stop = useCallback(() => {
    if (listeningRef.current) {
      window.removeEventListener('devicemotion', onMotion)
      listeningRef.current = false
    }
  }, [onMotion])

  const reset = useCallback(() => {
    stepsRef.current = 0
    setSteps(0)
    smoothRef.current = 0
    risingRef.current = false
    lastStepRef.current = 0
    if (persistKey) { try { localStorage.removeItem(persistKey) } catch {} }
  }, [persistKey])

  useEffect(() => () => stop(), [stop])

  return { steps, supported, start, stop, reset }
}
