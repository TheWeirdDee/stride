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
  
  // Keep latest state in refs for use in geolocation callbacks to prevent stale state issues
  const stateRef = useRef({ isActive, isPaused, path, distance })
  useEffect(() => {
    stateRef.current = { isActive, isPaused, path, distance }
  }, [isActive, isPaused, path, distance])

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
    
    // Ignore highly inaccurate points (e.g. accuracy > 50 meters)
    if (accuracy > 50) return

    const newCoord: Coordinate = {
      latitude,
      longitude,
      timestamp: position.timestamp,
    }

    setPath((prevPath) => {
      if (prevPath.length === 0) {
        return [newCoord]
      }

      const lastPoint = prevPath[prevPath.length - 1]
      const delta = getDistance(lastPoint, newCoord)

      // Filter GPS noise / jittering (less than 2 meters delta)
      if (delta < 0.002) {
        return prevPath
      }

      setDistance((prevDist) => prevDist + delta)
      return [...prevPath, newCoord]
    })
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
