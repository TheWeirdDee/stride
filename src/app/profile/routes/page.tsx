'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useConnect } from 'wagmi'
import { supabase } from '@/utils/supabase'
import RouteCard from '@/components/RouteCard'
import { ArrowLeft, Wallet, RefreshCw, Compass, Map as MapIcon } from 'lucide-react'

interface RouteCoord {
  lat: number
  lng: number
}

interface SessionRow {
  id: string
  started_at: string
  ended_at: string | null
  actual_distance: number | null // meters
  duration_secs: number | null
  routes?: { coordinates: RouteCoord[] | null; map_snapshot: string | null }[] | null
}

// Project a GPS path into RouteCard's 200x120 viewBox (start ~bottom-left,
// end ~top-right to line up with the card's fixed start/end markers).
function coordsToSvgPath(coords: RouteCoord[] | null | undefined): string {
  if (!coords || coords.length < 2) {
    return 'M20 100 L 70 70 L 110 80 L 150 45 L 180 20'
  }
  const lats = coords.map((c) => c.lat)
  const lngs = coords.map((c) => c.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const rLat = maxLat - minLat || 0.0001
  const rLng = maxLng - minLng || 0.0001
  const pad = 20
  const w = 200 - pad * 2
  const h = 120 - pad * 2
  const pts = coords.map((c) => {
    const x = pad + ((c.lng - minLng) / rLng) * w
    const y = 120 - pad - ((c.lat - minLat) / rLat) * h
    return `${x.toFixed(1)} ${y.toFixed(1)}`
  })
  return `M${pts.join(' L ')}`
}

export default function ProfileRoutesPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [city, setCity] = useState('Unknown')
  const [loading, setLoading] = useState(true)

  const handleConnect = () => {
    const injected = connectors.find((c) => c.id === 'injected') || connectors[0]
    if (injected) connect({ connector: injected })
  }

  useEffect(() => {
    async function load() {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        if (!supabase) throw new Error('Supabase unavailable')
        const { data: sess } = await supabase
          .from('sessions')
          .select('id, started_at, ended_at, actual_distance, duration_secs, routes(coordinates, map_snapshot)')
          .eq('wallet_address', address)
          .order('started_at', { ascending: false })

        setSessions((sess as SessionRow[]) || [])

        const { data: user } = await supabase
          .from('users')
          .select('city')
          .eq('wallet_address', address)
          .maybeSingle()
        if (user?.city) setCity(user.city)
      } catch (err) {
        console.error('Failed to load route history:', err)
        setSessions([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isConnected, address])

  // Summary totals
  const totals = useMemo(() => {
    const totalMeters = sessions.reduce((sum, s) => sum + (s.actual_distance || 0), 0)
    const totalSecs = sessions.reduce((sum, s) => sum + (s.duration_secs || 0), 0)
    return {
      count: sessions.length,
      km: (totalMeters / 1000).toFixed(1),
      hours: (totalSecs / 3600).toFixed(1),
    }
  }, [sessions])

  // Activity heatmap — last 12 weeks (84 days), GitHub-style by completed day.
  const heatmap = useMemo(() => {
    const days = 84
    const counts = new Map<string, number>()
    for (const s of sessions) {
      const key = new Date(s.started_at).toISOString().slice(0, 10)
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    const today = new Date()
    const cells: { date: string; count: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      cells.push({ date: key, count: counts.get(key) || 0 })
    }
    return cells
  }, [sessions])

  const heatColor = (count: number) => {
    if (count >= 3) return '#cdfb46'
    if (count === 2) return 'rgba(205,251,70,0.75)'
    if (count === 1) return 'rgba(205,251,70,0.45)'
    return 'rgba(255,255,255,0.07)'
  }

  // ─── Render ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw className="h-8 w-8" style={{ color: '#cdfb46', animation: 'spin 0.9s linear infinite', marginBottom: 16 }} />
        <p style={{ color: 'var(--muted)' }}>Loading your routes…</p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', color: '#cdfb46', marginBottom: 22 }}>
          <MapIcon className="h-7 w-7" />
        </div>
        <h1 className="sd-display" style={{ fontSize: 28 }}>Your routes<br />live with<br />your wallet</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '14px 0 26px', maxWidth: 300 }}>Connect to see every route you&apos;ve completed, your activity heatmap, and total distance.</p>
        <button onClick={handleConnect} className="sd-btn sd-btn-lime" style={{ maxWidth: 260 }}><Wallet className="h-4 w-4" /> Connect wallet</button>
      </div>
    )
  }

  return (
    <div className="sd-page">
      <button onClick={() => router.push('/profile')} className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 0, color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
      </button>

      <h1 className="sd-display" style={{ fontSize: 32 }}>Route<br />history</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10 }}>Every completed session, mapped.</p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 22 }}>
        {[[totals.count, 'Sessions', ''], [totals.km, 'Distance', 'km'], [totals.hours, 'Time', 'h']].map(([v, l, u]) => (
          <div key={l as string} className="sd-card" style={{ padding: 15 }}>
            <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted-2)', textTransform: 'uppercase' }}>{l}</div>
            <div className="sd-mono" style={{ fontWeight: 800, fontSize: 22, marginTop: 4 }}>{v}<small style={{ fontSize: 11, color: 'var(--muted-2)', marginLeft: 3 }}>{u}</small></div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="sd-card" style={{ padding: 18, marginTop: 14 }}>
        <h2 className="sd-section" style={{ fontSize: 12, marginBottom: 14 }}>Last 12 weeks</h2>
        <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7,1fr)', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
          {heatmap.map((cell) => (
            <div key={cell.date} title={`${cell.date}: ${cell.count} session${cell.count === 1 ? '' : 's'}`} style={{ height: 12, width: 12, borderRadius: 3, background: heatColor(cell.count) }} />
          ))}
        </div>
        <div className="sd-mono" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 9, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Less
          {[0, 1, 2, 3].map((n) => <span key={n} style={{ height: 12, width: 12, borderRadius: 3, background: heatColor(n) }} />)}
          More
        </div>
      </div>

      {/* Route cards */}
      {sessions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
          {sessions.map((s) => {
            const km = (s.actual_distance || 0) / 1000
            const mins = Math.round((s.duration_secs || 0) / 60)
            return (
              <RouteCard
                key={s.id}
                id={s.id}
                city={city}
                distanceKm={km}
                durationMinutes={mins}
                rewardCUSD={0}
                date={new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                activityType={km >= 4 ? 'run' : 'walk'}
                svgPath={coordsToSvgPath(s.routes?.[0]?.coordinates)}
                imageUrl={s.routes?.[0]?.map_snapshot ?? undefined}
              />
            )
          })}
        </div>
      ) : (
        <div className="sd-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: 18, borderStyle: 'dashed' }}>
          <Compass className="h-10 w-10" style={{ color: 'var(--muted-3)', margin: '0 auto 12px' }} />
          <h3 style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 16, textTransform: 'uppercase' }}>No routes yet</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 18px' }}>Complete your first commitment and it&apos;ll show up here.</p>
          <button onClick={() => router.push('/commitment/new')} className="sd-btn sd-btn-lime" style={{ maxWidth: 240, margin: '0 auto' }}>Start a commitment</button>
        </div>
      )}
    </div>
  )
}
