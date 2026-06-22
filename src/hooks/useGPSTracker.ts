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
  const lowAccuracyTriedRef = useRef(false)

  const stateRef = useRef({ isActive, isPaused })
  useEffect(() => {
    stateRef.current = { isActive, isPaused }
  }, [isActive, isPaused])

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

  // `accuracy` is the GPS uncertainty in metres (undefined for the demo simulator).
  const appendCoord = useCallback((latitude: number, longitude: number, timestamp: number, accuracy?: number) => {
    const newCoord: Coordinate = { latitude, longitude, timestamp }
    const prev = pathRef.current
    if (prev.length === 0) {
      // First fix: anchor the map. Don't count distance off it.
      pathRef.current = [newCoord]
      setPath(pathRef.current)
      persist()
      return
    }
    const last = prev[prev.length - 1]
    const deltaKm = getDistance(last, newCoord)
    const deltaM = deltaKm * 1000

    if (accuracy == null) {
      // Demo/simulated path — count everything but micro-jitter.
      if (deltaM < 1) return
    } else {
      // Real GPS. Reject the three things that caused fake/ballooning counts:
      //  • poor accuracy (network-positioning drift) → don't trust it for distance
      //  • sub-noise moves (a stationary phone drifts a few metres)
      //  • teleports (a single reading jumping impossibly far)
      const dt = (timestamp - (last.timestamp ?? timestamp)) / 1000
      const speedKmh = dt > 0 ? deltaKm / (dt / 3600) : Infinity
      if (accuracy > 30) return
      if (deltaM < 5) return
      if (speedKmh > 35) return
    }

    pathRef.current = [...prev, newCoord]
    distanceRef.current += deltaKm
    setPath(pathRef.current)
    setDistance(distanceRef.current)
    persist()
  }, [persist])

  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const { isActive: curActive, isPaused: curPaused } = stateRef.current
    if (!curActive || curPaused) return
    const { latitude, longitude, accuracy } = position.coords
    appendCoord(latitude, longitude, position.timestamp, accuracy)
  }, [appendCoord])

  const startSimulation = useCallback(() => {
    let lat = 6.5244
    let lng = 3.3792
    const seed = () => appendCoord(lat, lng, Date.now())
    const tick = () => {
      const { isActive: a, isPaused: p } = stateRef.current
      if (!a || p) return
      // ~1.8 m/s ≈ 6.5 km/h — a realistic walking pace that PASSES the server
      // anti-cheat (walk max 8 km/h, min 7 min/km) so a demo session completes
      // legitimately even on production where the demo bypass is off.
      lat += 0.0000162
      lng += 0.0000030 + (Math.random() - 0.5) * 0.0000040
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
    if (err.code === err.PERMISSION_DENIED) msg = 'Location is blocked. Allow location for this app (in MiniPay/Opera Mini and your phone settings), then restart the session.'
    else if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location unavailable. Make sure GPS/location is turned on, then try again.'
    else if (err.code === err.TIMEOUT) msg = 'Still finding your location… make sure you are outdoors with GPS on.'
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
    lowAccuracyTriedRef.current = false

    // Grab an immediate fix (also triggers the permission prompt) so the map
    // centres on the user right away instead of the default fallback.
    navigator.geolocation.getCurrentPosition(
      (pos) => appendCoord(pos.coords.latitude, pos.coords.longitude, pos.timestamp),
      (err) => handlePositionError(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    )

    const onWatchError = (err: GeolocationPositionError) => {
      handlePositionError(err)
      // GPS often times out in webviews (MiniPay/Opera Mini) — fall back to
      // network-based, lower-accuracy positioning so tracking still works.
      if ((err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) && !lowAccuracyTriedRef.current) {
        lowAccuracyTriedRef.current = true
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = navigator.geolocation.watchPosition(
          handlePositionSuccess,
          handlePositionError,
          { enableHighAccuracy: false, timeout: 27000, maximumAge: 10000 }
        )
      }
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      onWatchError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
    )
  }, [handlePositionSuccess, handlePositionError, startSimulation, appendCoord])

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

      // Reject a stale or corrupt saved session so it can't auto-resume and then
      // auto-complete with impossible data (e.g. old fast-demo paths) → endless
      // "Speed too high" errors. Drop it if it's old or contains a teleport.
      const path: Coordinate[] = Array.isArray(s.path) ? s.path : []
      const tooOld = typeof s.updatedAt === 'number' && Date.now() - s.updatedAt > 6 * 3600_000
      let teleport = false
      for (let i = 1; i < path.length; i++) {
        const km = getDistance(path[i - 1], path[i])
        const hrs = (((path[i].timestamp ?? 0) - (path[i - 1].timestamp ?? 0)) || 0) / 3_600_000
        if (hrs > 0 && km / hrs > 45) { teleport = true; break } // >45 km/h between fixes
      }
      if (tooOld || teleport) { clearPersisted(); return false }

      pathRef.current = path
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
  }, [persistKey, cleanup, startTimer, startWatcher, clearPersisted])

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
