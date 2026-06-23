// A user-settable "start location" that sticks (localStorage). Used as the map
// centre and the demo-walk start point, so desktop testing isn't stuck on the
// Lagos fallback and users can pin their real spot.

export interface StoredLocation { lat: number; lng: number; label?: string }

const KEY = 'stride_location'

export function getStoredLocation(): StoredLocation | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem('stride_last_location')
    if (!raw) return null
    const o = JSON.parse(raw)
    if (typeof o.lat === 'number' && typeof o.lng === 'number') return { lat: o.lat, lng: o.lng, label: o.label }
  } catch {}
  return null
}

export function setStoredLocation(loc: StoredLocation) {
  try { localStorage.setItem(KEY, JSON.stringify(loc)) } catch {}
}

export function clearStoredLocation() {
  try { localStorage.removeItem(KEY) } catch {}
}

// Capture the device's current GPS location (a single high-accuracy fix).
export function captureCurrentLocation(): Promise<StoredLocation | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, label: 'My GPS location' }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  })
}

// Geocode a typed place ("Lagos", "12 Bailey St", "6.52, 3.37") → coordinates.
export async function geocodePlace(query: string): Promise<StoredLocation | null> {
  const q = query.trim()
  if (!q) return null
  // Allow "lat, lng" direct input.
  const m = q.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]), label: q }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, { headers: { Accept: 'application/json' } })
    const data = await res.json()
    if (Array.isArray(data) && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: (data[0].display_name as string)?.split(',').slice(0, 2).join(',') || q }
    }
  } catch {}
  return null
}
