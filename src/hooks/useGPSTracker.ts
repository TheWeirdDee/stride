import { useState, useEffect, useRef, useCallback } from 'react'
import { Coordinate, getDistance } from '@/utils/haversine'

export interface UseGPSTrackerReturn {
  isActive: boolean
  isPaused: boolean
  path: Coordinate[]
  distance: number
  elapsedTime: number
  error: string | null
  startTracking: () => void
  pauseTracking: () => void
  resumeTracking: () => void
  stopTracking: () => void
  resumeFromStorage: () => boolean
}

/**
 * GPS tracker. When `persistKey` is provided, the live session (start time,
 * path, distance, pauses) is mirrored to localStorage so it survives navigating
 * away and back — the timer is wall-clock based, so it never resets on remount.
 */
export function useGPSTracker(persistKey?: string): UseGPSTrackerReturn {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [path, setPath] = useState<Coordinate[]>([])
  const [distance, setDistance] = useState(0) // in km
  const [elapsedTime, setElapsedTime] = useState(0) // in seconds
  const [error, setError] = useState<string | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const timerIdRef = useRef<NodeJS.Timeout | null>(null)
  const simIdRef = useRef<NodeJS.Timeout | null>(null)
  const pathRef = useRef<Coordinate[]>([])
  const distanceRef = useRef(0)
  // Wall-clock anchors so elapsed time is correct even after a remount/restore.
  const startTimeRef = useRef<number | null>(null)
  const pausedMsRef = useRef(0)
  const pauseStartedRef = useRef<number | null>(null)

  const stateRef = useRef({ isActive, isPaused })
  useEffect(() => {
    stateRef.current = { isActive, isPaused }
  }, [isActive, isPaused])

  const MAX_ACCURACY_M = 150

  const isDemoMode = () => {
    try { return typeof window !== 'undefined' && localStorage.getItem('stride_demo_mode') === '1' } catch { return false }
  }

  // ── localStorage persistence ──
  const persist = useCallback(() => {
    if (!persistKey || typeof window === 'undefined') return
    try {
      localStorage.setItem(persistKey, JSON.stringify({
        startedAt: startTimeRef.current,
        pausedMs: pausedMsRef.current,
        path: pathRef.current,
        distance: distanceRef.current,
        active: true,
        updatedAt: Date.now(),
      }))
    } catch {}
  }, [persistKey])

  const clearPersisted = useCallback(() => {
    if (!persistKey || typeof window === 'undefined') return
    try { localStorage.removeItem(persistKey) } catch {}
  }, [persistKey])

  const cleanup = useCallback(() => {
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null }
    if (timerIdRef.current !== null) { clearInterval(timerIdRef.current); timerIdRef.current = null }
    if (simIdRef.current !== null) { clearInterval(simIdRef.current); simIdRef.current = null }
  }, [])

  const appendCoord = useCallback((latitude: number, longitude: number, timestamp: number) => {
    const newCoord: Coordinate = { latitude, longitude, timestamp }
    const prev = pathRef.current
    if (prev.length === 0) {
      pathRef.current = [newCoord]
      setPath(pathRef.current)
      persist()
      return
    }
    const delta = getDistance(prev[prev.length - 1], newCoord)
    if (delta < 0.002) return // filter <2m GPS jitter
    pathRef.current = [...prev, newCoord]
    distanceRef.current += delta
    setPath(pathRef.current)
    setDistance(distanceRef.current)
    persist()
  }, [persist])

  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const { isActive: curActive, isPaused: curPaused } = stateRef.current
    if (!curActive || curPaused) return
    const { latitude, longitude, accuracy } = position.coords
    if (pathRef.current.length > 0 && typeof accuracy === 'number' && accuracy > MAX_ACCURACY_M) return
    appendCoord(latitude, longitude, position.timestamp)
  }, [appendCoord])

  const startSimulation = useCallback(() => {
    let lat = 6.5244
    let lng = 3.3792
    const seed = () => appendCoord(lat, lng, Date.now())
    const tick = () => {
      const { isActive: a, isPaused: p } = stateRef.current
      if (!a || p) return
      lat += 0.000135
      lng += 0.000045 + (Math.random() - 0.5) * 0.00002
      appendCoord(lat, lng, Date.now())
    }
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { lat = pos.coords.latitude; lng = pos.coords.longitude; seed() },
        () => seed(),
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      seed()
    }
    simIdRef.current = setInterval(tick, 1000)
  }, [appendCoord])

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    let msg = 'Failed to retrieve location'
    if (err.code === err.PERMISSION_DENIED) msg = 'Location permission denied. Stride needs GPS access to track your commitment.'
    else if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location information is unavailable.'
    else if (err.code === err.TIMEOUT) msg = 'Location request timed out.'
    setError(msg)
    console.error('GPS tracking error:', err)
  }, [])

  // Wall-clock timer: elapsed = now - startedAt - pausedMs.
  const startTimer = useCallback(() => {
    if (timerIdRef.current !== null) clearInterval(timerIdRef.current)
    const tick = () => {
      const s = startTimeRef.current
      if (s == null) return
      setElapsedTime(Math.max(0, Math.floor((Date.now() - s - pausedMsRef.current) / 1000)))
    }
    tick()
    timerIdRef.current = setInterval(tick, 1000)
  }, [])

  const startWatcher = useCallback(() => {
    if (isDemoMode()) { startSimulation(); return }
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setIsActive(false)
      return
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [handlePositionSuccess, handlePositionError, startSimulation])

  const startTracking = useCallback(() => {
    cleanup()
    setError(null)
    pathRef.current = []
    distanceRef.current = 0
    setPath([])
    setDistance(0)
    setElapsedTime(0)
    startTimeRef.current = Date.now()
    pausedMsRef.current = 0
    pauseStartedRef.current = null
    setIsActive(true)
    setIsPaused(false)
    persist()
    startTimer()
    startWatcher()
  }, [cleanup, persist, startTimer, startWatcher])

  // Restore a previously-saved session (after navigating away and back).
  const resumeFromStorage = useCallback((): boolean => {
    if (!persistKey || typeof window === 'undefined') return false
    try {
      const raw = localStorage.getItem(persistKey)
      if (!raw) return false
      const s = JSON.parse(raw)
      if (!s?.active || !s?.startedAt) return false
      pathRef.current = Array.isArray(s.path) ? s.path : []
      distanceRef.current = Number(s.distance) || 0
      startTimeRef.current = Number(s.startedAt)
      pausedMsRef.current = Number(s.pausedMs) || 0
      pauseStartedRef.current = null
      setPath(pathRef.current)
      setDistance(distanceRef.current)
      setIsActive(true)
      setIsPaused(false)
      cleanup()
      startTimer()
      startWatcher()
      return true
    } catch {
      return false
    }
  }, [persistKey, cleanup, startTimer, startWatcher])

  const pauseTracking = useCallback(() => {
    setIsPaused(true)
    pauseStartedRef.current = Date.now()
    if (timerIdRef.current !== null) { clearInterval(timerIdRef.current); timerIdRef.current = null }
    persist()
  }, [persist])

  const resumeTracking = useCallback(() => {
    if (pauseStartedRef.current !== null) {
      pausedMsRef.current += Date.now() - pauseStartedRef.current
      pauseStartedRef.current = null
    }
    setIsPaused(false)
    startTimer()
    persist()
  }, [startTimer, persist])

  const stopTracking = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    cleanup()
    clearPersisted()
  }, [cleanup, clearPersisted])

  // Cleanup listeners/timers on unmount — but KEEP the persisted session so it
  // can be restored on return.
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return {
    isActive,
    isPaused,
    path,
    distance,
    elapsedTime,
    error,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    resumeFromStorage,
  }
}
