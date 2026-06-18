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
}

export function useGPSTracker(): UseGPSTrackerReturn {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [path, setPath] = useState<Coordinate[]>([])
  const [distance, setDistance] = useState(0) // in km
  const [elapsedTime, setElapsedTime] = useState(0) // in seconds
  const [error, setError] = useState<string | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const timerIdRef = useRef<NodeJS.Timeout | null>(null)
  const simIdRef = useRef<NodeJS.Timeout | null>(null)
  // Synchronous path buffer — geolocation callbacks fire faster than React state
  // commits, so we accumulate into a ref and mirror it into state for rendering.
  const pathRef = useRef<Coordinate[]>([])

  // Keep latest active/paused flags in a ref for the geolocation callbacks.
  const stateRef = useRef({ isActive, isPaused })
  useEffect(() => {
    stateRef.current = { isActive, isPaused }
  }, [isActive, isPaused])

  // Max GPS accuracy (metres) we'll accept. Phone GPS is ~5–30m outdoors but can
  // read 50–100m near buildings or on wifi-assisted location, so 50m was far too
  // strict — it rejected nearly every point. 100m keeps obvious garbage out.
  const MAX_ACCURACY_M = 100

  // Clear tracking listeners and timers
  const cleanup = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current)
      timerIdRef.current = null
    }
    if (simIdRef.current !== null) {
      clearInterval(simIdRef.current)
      simIdRef.current = null
    }
  }, [])

  // Append a coordinate to the path (shared by real GPS + demo simulation).
  const appendCoord = useCallback((latitude: number, longitude: number, timestamp: number) => {
    const newCoord: Coordinate = { latitude, longitude, timestamp }
    const prev = pathRef.current
    if (prev.length === 0) {
      pathRef.current = [newCoord]
      setPath(pathRef.current)
      return
    }
    const delta = getDistance(prev[prev.length - 1], newCoord)
    if (delta < 0.002) return // filter <2m GPS jitter
    pathRef.current = [...prev, newCoord]
    setPath(pathRef.current)
    setDistance((d) => d + delta)
  }, [])

  // Geolocation success callback
  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const { isActive: curActive, isPaused: curPaused } = stateRef.current
    if (!curActive || curPaused) return

    const { latitude, longitude, accuracy } = position.coords
    if (accuracy > MAX_ACCURACY_M) return
    appendCoord(latitude, longitude, position.timestamp)
  }, [appendCoord])

  // Demo / test mode — simulate a realistic walk so the full session flow can be
  // exercised without physically completing an outdoor route. Opt-in via the
  // `stride_demo_mode` flag in Settings; the server only honours demo proofs in
  // development, so this can't be abused against the live reward pool.
  const isDemoMode = () => {
    try { return typeof window !== 'undefined' && localStorage.getItem('stride_demo_mode') === '1' } catch { return false }
  }

  const startSimulation = useCallback(() => {
    // Seed near the user's real location if we can grab it, else a default.
    let lat = 6.5244
    let lng = 3.3792
    const seed = () => appendCoord(lat, lng, Date.now())
    const tick = () => {
      const { isActive: a, isPaused: p } = stateRef.current
      if (!a || p) return
      // ~15 m north-east per second with a little lateral wiggle for a natural path.
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

  // Geolocation error callback
  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    let msg = 'Failed to retrieve location'
    if (err.code === err.PERMISSION_DENIED) {
      msg = 'Location permission denied. Stride needs GPS access to track your commitment.'
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      msg = 'Location information is unavailable.'
    } else if (err.code === err.TIMEOUT) {
      msg = 'Location request timed out.'
    }
    setError(msg)
    console.error('GPS tracking error:', err)
  }, [])

  const startTracking = useCallback(() => {
    cleanup()
    setError(null)
    pathRef.current = []
    setPath([])
    setDistance(0)
    setElapsedTime(0)
    setIsActive(true)
    setIsPaused(false)

    // Start tracking timer (runs in both real and demo mode)
    timerIdRef.current = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1)
    }, 1000)

    if (isDemoMode()) {
      startSimulation()
      return
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setIsActive(false)
      return
    }

    // Start geolocation watcher
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [cleanup, handlePositionSuccess, handlePositionError, startSimulation])

  const pauseTracking = useCallback(() => {
    setIsPaused(true)
    // Pause timer
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current)
      timerIdRef.current = null
    }
  }, [])

  const resumeTracking = useCallback(() => {
    setIsPaused(false)
    // Resume timer
    if (timerIdRef.current === null && isActive) {
      timerIdRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1)
      }, 1000)
    }
  }, [isActive])

  const stopTracking = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    cleanup()
  }, [cleanup])

  // Cleanup on unmount
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
  }
}
