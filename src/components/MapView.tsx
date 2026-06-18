'use client'

import { useEffect, useRef } from 'react'
import { getPathDistance, type Coordinate } from '@/utils/haversine'

interface MapViewProps {
  path: Coordinate[]
  isActive: boolean
}

/**
 * Free, no-token, no-payment maps via Leaflet (loaded from CDN) + CARTO's
 * free dark raster tiles. Draws the route polyline with interactive
 * start/finish pins.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let leafletPromise: Promise<any> | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  if (w.L) return Promise.resolve(w.L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => resolve(w.L)
    script.onerror = () => reject(new Error('Leaflet failed to load'))
    document.body.appendChild(script)
  })
  return leafletPromise
}

export function MapView({ path, isActive }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endRef = useRef<any>(null)
  // Keep the latest path/isActive in a ref so the draw routine always sees fresh data.
  const pathRef = useRef(path)
  pathRef.current = path
  const activeRef = useRef(isActive)
  activeRef.current = isActive

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const draw = (L: any) => {
    const map = mapRef.current
    if (!map) return
    const pts = pathRef.current
    const latlngs = pts.map((c) => [c.latitude, c.longitude] as [number, number])
    if (latlngs.length === 0) return

    if (lineRef.current) lineRef.current.setLatLngs(latlngs)
    else lineRef.current = L.polyline(latlngs, { color: '#cdfb46', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }).addTo(map)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mk = (ll: [number, number], color: string, label: string) =>
      L.circleMarker(ll, { radius: 7, color: '#06080a', weight: 2.5, fillColor: color, fillOpacity: 1 }).bindPopup(label)

    const startLL = latlngs[0]
    const endLL = latlngs[latlngs.length - 1]
    const distKm = getPathDistance(pts).toFixed(2)

    if (!startRef.current) startRef.current = mk(startLL, '#cdfb46', 'Start').addTo(map)
    else startRef.current.setLatLng(startLL)

    if (!endRef.current) endRef.current = mk(endLL, '#7db4e6', `${activeRef.current ? 'Current' : 'Finish'} · ${distKm} km`).addTo(map)
    else {
      endRef.current.setLatLng(endLL)
      endRef.current.setPopupContent(`${activeRef.current ? 'Current' : 'Finish'} · ${distKm} km`)
    }

    if (latlngs.length > 1) map.fitBounds(latlngs, { padding: [30, 30], maxZoom: 16 })
    else map.setView(startLL, 15)
  }

  // Init once
  useEffect(() => {
    let cancelled = false
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return
        const first = pathRef.current[0]
        const center: [number, number] = first ? [first.latitude, first.longitude] : [6.5244, 3.3792]
        const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView(center, 15)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { maxZoom: 20, subdomains: 'abcd' }).addTo(map)
        L.control.zoom({ position: 'topright' }).addTo(map)
        mapRef.current = map
        draw(L)

        // No route yet → snap the map to the user's real location (not the Lagos
        // fallback) and drop a "you are here" pulse so the map reflects them.
        if (pathRef.current.length === 0 && typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (cancelled || !mapRef.current) return
              const here: [number, number] = [pos.coords.latitude, pos.coords.longitude]
              mapRef.current.setView(here, 16)
              if (pathRef.current.length === 0) {
                L.circleMarker(here, { radius: 7, color: '#06080a', weight: 2.5, fillColor: '#7db4e6', fillOpacity: 1 })
                  .addTo(mapRef.current)
                  .bindPopup('You are here')
              }
            },
            () => {},
            { enableHighAccuracy: true, timeout: 8000 }
          )
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        lineRef.current = null
        startRef.current = null
        endRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Redraw when the path updates (live tracking)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L
    if (L && mapRef.current) draw(L)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 200, borderRadius: 'inherit', background: '#0a0c0d' }}
    />
  )
}
