'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useConnect } from 'wagmi'
import { supabase } from '@/utils/supabase'
import RouteCard from '@/components/RouteCard'
import { ArrowLeft, Wallet, RefreshCw, Compass, Clock, Flame, Map as MapIcon } from 'lucide-react'

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
    if (count >= 3) return 'bg-emerald-600'
    if (count === 2) return 'bg-emerald-500'
    if (count === 1) return 'bg-emerald-400/70'
    return 'bg-zinc-150 dark:bg-zinc-850'
  }

  // ─── Render ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-semibold">Loading your routes...</p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-150 dark:border-zinc-850 max-w-md mx-auto my-12 shadow-sm">
        <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center mb-6">
          <MapIcon className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Your routes live with your wallet
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 max-w-xs">
          Connect your wallet to see every route you&apos;ve completed, your activity heatmap, and total distance.
        </p>
        <button
          onClick={handleConnect}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold transition-all text-sm active:scale-95 shadow-md"
        >
          <Wallet className="h-4 w-4 inline mr-1.5 -mt-0.5" /> Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <button
        onClick={() => router.push('/profile')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-4 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
      </button>

      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-1">
        Route History
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
        Every completed session, mapped.
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm">
          <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            <Compass className="h-3.5 w-3.5 text-emerald-500" /> Sessions
          </span>
          <span className="block text-2xl font-extrabold font-mono text-zinc-800 dark:text-zinc-100 mt-1">{totals.count}</span>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm">
          <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            <Flame className="h-3.5 w-3.5 text-amber-500" /> Distance
          </span>
          <span className="block text-2xl font-extrabold font-mono text-zinc-800 dark:text-zinc-100 mt-1">{totals.km}<small className="text-xs text-zinc-400 ml-1">km</small></span>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm">
          <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            <Clock className="h-3.5 w-3.5 text-cyan-500" /> Time
          </span>
          <span className="block text-2xl font-extrabold font-mono text-zinc-800 dark:text-zinc-100 mt-1">{totals.hours}<small className="text-xs text-zinc-400 ml-1">h</small></span>
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-850 shadow-sm mb-8">
        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4">
          Last 12 weeks
        </h2>
        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
          {heatmap.map((cell) => (
            <div
              key={cell.date}
              title={`${cell.date}: ${cell.count} session${cell.count === 1 ? '' : 's'}`}
              className={`h-3 w-3 rounded-sm ${heatColor(cell.count)}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[10px] text-zinc-400 font-semibold">
          <span>Less</span>
          <span className="h-3 w-3 rounded-sm bg-zinc-150 dark:bg-zinc-850" />
          <span className="h-3 w-3 rounded-sm bg-emerald-400/70" />
          <span className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span className="h-3 w-3 rounded-sm bg-emerald-600" />
          <span>More</span>
        </div>
      </div>

      {/* Route cards */}
      {sessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                date={new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                activityType={km >= 4 ? 'run' : 'walk'}
                svgPath={coordsToSvgPath(s.routes?.[0]?.coordinates)}
                imageUrl={s.routes?.[0]?.map_snapshot ?? undefined}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-zinc-950 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <Compass className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No routes yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
            Complete your first commitment and it&apos;ll show up here.
          </p>
          <button
            onClick={() => router.push('/commitment/new')}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Start a Commitment
          </button>
        </div>
      )}
    </div>
  )
}
