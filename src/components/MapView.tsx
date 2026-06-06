'use client'

import React, { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_TOKEN } from '@/utils/constants'
import { Coordinate } from '@/utils/haversine'

interface MapViewProps {
  path: Coordinate[]
  isActive: boolean
}

export function MapView({ path, isActive }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // Set the token
  mapboxgl.accessToken = MAPBOX_TOKEN

  useEffect(() => {
    if (!mapContainerRef.current) return
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox Token is not configured. Map will not load.')
      return
    }

    // Initialize Mapbox map
    const startingCoords: [number, number] = path.length > 0
      ? [path[0].longitude, path[0].latitude]
      : [3.3792, 6.5244] // Fallback to Lagos, Nigeria coordinates

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark style matching Stride aesthetic
      center: startingCoords,
      zoom: 15,
      pitch: 0,
      bearing: 0,
    })

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right')

    mapRef.current = map

    // Clean up map instance on unmount
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // Initialize map only once

  // Update path line layer on coordinates change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Convert Coordinate[] to Mapbox coordinates format: [lng, lat][]
    const geojsonCoords = path.map((coord) => [coord.longitude, coord.latitude])

    const updateSourceAndLayer = () => {
      const sourceId = 'route-source'
      const layerId = 'route-layer'

      const existingSource = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined

      if (existingSource) {
        // Source exists, update coordinates
        existingSource.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: geojsonCoords,
          },
        })
      } else {
        // Source and layer don't exist yet, add them
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: geojsonCoords,
            },
          },
        })

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#cdfb46', // Stride's signature Lime color
            'line-width': 5,
            'line-opacity': 0.85,
          },
        })
      }

      // Maintain user current position marker
      if (path.length > 0) {
        const lastPoint = path[path.length - 1]
        const lastCoords: [number, number] = [lastPoint.longitude, lastPoint.latitude]

        if (!markerRef.current) {
          // Create a custom pulsing marker
          const markerEl = document.createElement('div')
          markerEl.className = 'custom-pulsing-marker'
          markerEl.style.width = '16px'
          markerEl.style.height = '16px'
          markerEl.style.borderRadius = '50%'
          markerEl.style.backgroundColor = '#0a5aa2'
          markerEl.style.border = '2.5px solid #ffffff'
          markerEl.style.boxShadow = '0 0 10px rgba(10, 90, 162, 0.6)'
          
          markerRef.current = new mapboxgl.Marker({ element: markerEl })
            .setLngLat(lastCoords)
            .addTo(map)
        } else {
          markerRef.current.setLngLat(lastCoords)
        }

        // Center map to current location and adapt bounds
        if (geojsonCoords.length > 1) {
          const bounds = new mapboxgl.LngLatBounds()
          geojsonCoords.forEach((coord) => bounds.extend(coord as [number, number]))
          map.fitBounds(bounds, { padding: 40, maxZoom: 16, duration: 800 })
        } else {
          map.easeTo({ center: lastCoords, duration: 800 })
        }
      }
    }

    if (map.isStyleLoaded()) {
      updateSourceAndLayer()
    } else {
      map.once('style.load', updateSourceAndLayer)
    }
  }, [path])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400">
        <svg
          className="w-12 h-12 text-zinc-600 mb-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
          />
        </svg>
        <h4 className="font-bold text-zinc-200 mb-1">Mapbox Token Missing</h4>
        <p className="text-xs max-w-xs">
          Please set the <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> environment variable in your{' '}
          <code>.env.local</code> file to load the GPS tracking map.
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-zinc-800">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
    </div>
  )
}
