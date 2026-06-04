'use client'

import { MapPin, Trophy, Calendar, Clock, Navigation } from 'lucide-react'

interface RouteCardProps {
  id: string
  userName?: string
  city: string
  distanceKm: number
  durationMinutes: number
  rewardCUSD: number
  date: string
  activityType: 'walk' | 'run'
  // Abstract path coordinates as SVG drawing command (e.g., "M10 80 Q 52.5 10, 95 80 T 180 80")
  svgPath: string
}

export default function RouteCard({
  id,
  userName = 'Anonymous Mover',
  city,
  distanceKm,
  durationMinutes,
  rewardCUSD,
  date,
  activityType,
  svgPath,
}: RouteCardProps) {
  // Calculate average pace (min/km)
  const pace = distanceKm > 0 ? (durationMinutes / distanceKm).toFixed(1) : '0.0'

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/85 bg-white dark:bg-zinc-950 p-4 shadow-sm hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-400/40 transition-all duration-300 hover:-translate-y-1">
      {/* Route Map Visual Placeholder */}
      <div className="relative h-36 w-full overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 flex items-center justify-center">
        {/* Dotted Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
        
        {/* Draw abstract SVG path of route */}
        <svg className="w-4/5 h-4/5 z-10" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d={svgPath}
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-[dash_3s_ease-in-out_infinite]"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: 0,
            }}
          />
          {/* Start and End nodes */}
          <circle cx="20" cy="100" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
          <circle cx="180" cy="20" r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
          
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-zinc-900/95 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-350 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <MapPin className="h-3 w-3 text-emerald-500" />
          <span>{city}</span>
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border border-emerald-500/20">
          {activityType}
        </div>
      </div>

      {/* Info details */}
      <div className="mt-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
            <span className="font-semibold">{userName}</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{date}</span>
            </div>
          </div>

          {/* Core Stats Row */}
          <div className="mt-3 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100/50 dark:border-zinc-800/30 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Distance</p>
              <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">{distanceKm.toFixed(2)}<span className="text-[10px] font-medium ml-0.5">km</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Duration</p>
              <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">{durationMinutes}<span className="text-[10px] font-medium ml-0.5">m</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Pace</p>
              <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">{pace}<span className="text-[9px] font-medium ml-0.5">/km</span></p>
            </div>
          </div>
        </div>

        {/* Payout Block */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Trophy className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Earned</span>
          </div>
          <div className="flex items-baseline gap-0.5 text-zinc-900 dark:text-zinc-50 font-bold font-mono">
            <span className="text-emerald-500 font-extrabold text-base">+${rewardCUSD.toFixed(2)}</span>
            <span className="text-[9px] font-medium text-zinc-500 ml-0.5">cUSD</span>
          </div>
        </div>
      </div>
    </div>
  )
}
