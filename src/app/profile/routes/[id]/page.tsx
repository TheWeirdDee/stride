'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { supabase } from '@/utils/supabase'
import { MapView } from '@/components/MapView'
import type { Coordinate } from '@/utils/haversine'

interface RawCoord { lat: number; lng: number; timestamp?: number }

interface SessionDetail {
  id: string
  started_at: string
  actual_distance: number | null
  duration_secs: number | null
  avg_pace: number | null
  routes?: { coordinates: RawCoord[] | null; map_snapshot: string | null }[] | null
}

function fmt(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function RouteDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    if (supabase) {
      const { data } = await supabase
        .from('sessions')
        .select('id, started_at, actual_distance, duration_secs, avg_pace, routes(coordinates, map_snapshot)')
        .eq('id', id)
        .maybeSingle()
      setSession((data as SessionDetail) || null)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw className="h-8 w-8" style={{ color: '#cdfb46', animation: 'spin 0.9s linear infinite', marginBottom: 16 }} />
        <p style={{ color: 'var(--muted)' }}>Loading route…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <h2 className="sd-display" style={{ fontSize: 24 }}>Route<br />not found</h2>
        <button onClick={() => router.push('/profile/routes')} className="sd-btn sd-btn-ghost" style={{ maxWidth: 240, marginTop: 22 }}>Back to routes</button>
      </div>
    )
  }

  const raw = session.routes?.[0]?.coordinates || []
  const path: Coordinate[] = raw.map((c) => ({ latitude: c.lat, longitude: c.lng, timestamp: c.timestamp }))
  const km = (session.actual_distance || 0) / 1000
  const mins = Math.round((session.duration_secs || 0) / 60)
  const pace = session.avg_pace || 0
  const paceStr = pace > 0 ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')}` : '—:—'
  const dateStr = new Date(session.started_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="sd-page">
      <button onClick={() => router.push('/profile/routes')} className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 0, color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Routes
      </button>

      <div className="sd-mono" style={{ fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dateStr}</div>
      <h1 className="sd-display" style={{ fontSize: 32, marginTop: 6 }}>{km.toFixed(2)} km</h1>

      {/* Real map */}
      <div style={{ height: 320, borderRadius: 20, overflow: 'hidden', marginTop: 16 }}>
        {path.length >= 2 ? (
          <MapView path={path} isActive={false} />
        ) : (
          <div className="sd-card" style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 13 }}>No GPS path recorded for this route.</div>
        )}
      </div>

      {/* Stats */}
      <div className="sd-card" style={{ display: 'flex', marginTop: 14, padding: '18px 0' }}>
        {[[km.toFixed(2), 'KM'], [fmt((session.duration_secs || 0)), 'TIME'], [`${mins}`, 'MINS'], [paceStr, 'PACE']].map(([v, l], i) => (
          <div key={l} style={{ flex: 1, textAlign: 'center', borderLeft: i ? '1px solid var(--line)' : 'none' }}>
            <div className="sd-mono" style={{ fontWeight: 800, fontSize: 18 }}>{v}</div>
            <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
