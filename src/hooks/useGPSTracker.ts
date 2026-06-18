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
  }, [])

  // Geolocation success callback
  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const { isActive: curActive, isPaused: curPaused } = stateRef.current
    if (!curActive || curPaused) return

    const { latitude, longitude, accuracy } = position.coords
    if (accuracy > MAX_ACCURACY_M) return

    const newCoord: Coordinate = { latitude, longitude, timestamp: position.timestamp }
    const prev = pathRef.current

    if (prev.length === 0) {
      pathRef.current = [newCoord]
      setPath(pathRef.current)
      return
    }

    const delta = getDistance(prev[prev.length - 1], newCoord)
    // Filter GPS jitter (< 2 metres) so a stationary device doesn't accrue noise.
    if (delta < 0.002) return

    pathRef.current = [...prev, newCoord]
    setPath(pathRef.current)
    setDistance((d) => d + delta)
  }, [])

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

    // Start tracking timer
    timerIdRef.current = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1)
    }, 1000)
  }, [cleanup, handlePositionSuccess, handlePositionError])

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
