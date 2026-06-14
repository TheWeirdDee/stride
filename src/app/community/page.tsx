'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Activity, Users, MapPin, Compass, Flame, Shield, TrendingUp, HelpCircle } from 'lucide-react'

interface FeedItem {
  id: string
  user: string
  city: string
  action: string
  metric: string
  timestamp: string
}

const INITIAL_FEED: FeedItem[] = [
  { id: '1', user: 'SpeedyMover', city: 'Nairobi', action: 'completed a run', metric: '5.2 km', timestamp: '2 mins ago' },
  { id: '2', user: 'StrideWalker', city: 'Lagos', action: 'started a commitment', metric: '0.50 CELO', timestamp: '5 mins ago' },
  { id: '3', user: 'AccraRunner', city: 'Accra', action: 'completed a run', metric: '10.0 km', timestamp: '12 mins ago' },
  { id: '4', user: 'HabitBuilder', city: 'Kampala', action: 'completed a walk', metric: '2.5 km', timestamp: '18 mins ago' },
  { id: '5', user: 'CapeTownMover', city: 'Cape Town', action: 'started a commitment', metric: '1.00 CELO', timestamp: '25 mins ago' },
]

const CITIES_LEADERBOARD = [
  { rank: '01', name: 'Lagos', km: '14,820 km', activeUsers: 480 },
  { rank: '02', name: 'Nairobi', km: '11,210 km', activeUsers: 390 },
  { rank: '03', name: 'Accra', km: '8,930 km', activeUsers: 270 },
  { rank: '04', name: 'Kampala', km: '6,180 km', activeUsers: 190 },
  { rank: '05', name: 'Cape Town', km: '4,650 km', activeUsers: 130 },
]

export default function CommunityFeedPage() {
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const users = ['FastWalker', 'CeloChamp', 'LagosStride', 'DailyMover', 'KilometreKing', 'RunFast']
    const cities = ['Lagos', 'Nairobi', 'Accra', 'Kampala', 'Kigali', 'Dar es Salaam']
    const actions = ['completed a walk', 'completed a run', 'started a commitment']
    const metrics = ['1.5 km', '3.0 km', '5.0 km', '8.0 km', '$0.10 CELO', '$0.50 CELO', '$1.00 CELO']

    const interval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomCity = cities[Math.floor(Math.random() * cities.length)]
      const randomAction = actions[Math.floor(Math.random() * actions.length)]
      const randomMetric = metrics[Math.floor(Math.random() * metrics.length)]

      const newItem: FeedItem = {
        id: Math.random().toString(),
        user: randomUser,
        city: randomCity,
        action: randomAction,
        metric: randomMetric,
        timestamp: 'Just now'
      }

      setFeed((prev) => {
        // Keep only top 5, updating durations
        const list = [newItem, ...prev.map(item => {
          if (item.timestamp === 'Just now') return { ...item, timestamp: '1 min ago' }
          if (item.timestamp.includes('min')) {
            const mins = parseInt(item.timestamp) + 1
            return { ...item, timestamp: `${mins} mins ago` }
          }
          return item
        })]
        return list.slice(0, 5)
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(128,128,128,0.06)'
    ctx.lineWidth = 1
    const gridSize = 25
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw glowing route paths
    const drawRoute = (coords: [number, number][], color: string) => {
      ctx.beginPath()
      ctx.moveTo(coords[0][0], coords[0][1])
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i][0], coords[i][1])
      }
      ctx.lineWidth = 3
      ctx.strokeStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 10
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.shadowBlur = 0 // reset
    }


    drawRoute([
      [50, 100], [120, 80], [180, 140], [220, 110], [300, 160]
    ], '#10b981')

    drawRoute([
      [80, 220], [140, 180], [200, 240], [290, 190], [360, 230]
    ], '#06b6d4')

    drawRoute([
      [150, 50], [210, 90], [260, 40], [320, 80], [380, 30]
    ], '#f59e0b')

    const drawSpot = (x: number, y: number, r: number, color: string) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, color)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    drawSpot(180, 140, 35, 'rgba(16, 185, 129, 0.4)')
    drawSpot(290, 190, 45, 'rgba(6, 182, 212, 0.4)')
    drawSpot(210, 90, 30, 'rgba(245, 158, 11, 0.4)')

  }, [feed])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Community Dashboard
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Keep in stride with active communities and dynamic completions across active cities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs text-zinc-400 font-bold uppercase tracking-wider">Weekly Kilometres</span>
            <span className="block text-xl font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">45,820 KM</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs text-zinc-400 font-bold uppercase tracking-wider">Completions</span>
            <span className="block text-xl font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">3,140</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs text-zinc-400 font-bold uppercase tracking-wider">Active Cities</span>
            <span className="block text-xl font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">22 Cities</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Leaderboard + Heatmap / Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Top Cities Leaderboard */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-850 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Top Active Cities
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
            {CITIES_LEADERBOARD.map((city) => (
              <div key={city.rank} className="py-3.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-bold text-emerald-500 bg-emerald-500/5 h-6 w-6 rounded-md flex items-center justify-center shrink-0">
                    {city.rank}
                  </span>
                  <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{city.name}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="font-mono text-zinc-800 dark:text-zinc-300 font-bold">{city.km}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    {city.activeUsers} active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Map Canvas & Ticker */}
        <div className="flex flex-col gap-6">
          {/* Simulated Heatmap Canvas */}
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-zinc-150 dark:border-zinc-850 shadow-sm flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-zinc-400 animate-pulse" /> Map Heatmap Overlay
              </span>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded font-mono font-bold text-zinc-400 uppercase">
                Simulated
              </span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-900 overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={400}
                height={220}
                className="w-full h-auto bg-zinc-50 dark:bg-zinc-900/10 block"
              />
            </div>
          </div>

          {/* Activity Feed Ticker */}
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-850 shadow-sm flex flex-col flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                Live Activity Stream
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {feed.map((item) => (
                <div key={item.id} className="flex items-start justify-between text-xs gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 flex items-center justify-center font-bold text-[10px] uppercase">
                      {item.user[0]}
                    </span>
                    <div>
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{item.user}</span>
                      <span className="text-zinc-400 dark:text-zinc-500 ml-1">
                        in <span className="font-bold text-zinc-500 dark:text-zinc-400">{item.city}</span> {item.action}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                      {item.metric}
                    </span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Footer warning */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
          <Shield className="h-3.5 w-3.5 text-emerald-500" /> Decentralized privacy anonymizer active
        </div>
      </div>
    </div>
  )
}
