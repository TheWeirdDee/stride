'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { BookOpen, Clock, Activity, Search, Shield, ChevronRight, Zap, RefreshCw } from 'lucide-react'

interface ContentItem {
  id: string
  type: 'warmup' | 'cooldown' | 'guide'
  title: string
  body: string
  duration: number
  phase: 'before' | 'after' | 'anytime'
  activity: 'walk' | 'run' | 'both'
}

// Fallback data matching the SQL seed in schema.sql
const STATIC_GUIDES: ContentItem[] = [
  {
    id: 'walk-warmup',
    type: 'warmup',
    title: 'Pre-Walk Warmup',
    body: '1. Ankle circles\n2. Knee lifts\n3. Hip circles\n4. Arm swings\n5. Neck rolls\n6. Side steps',
    duration: 5,
    phase: 'before',
    activity: 'walk'
  },
  {
    id: 'run-warmup',
    type: 'warmup',
    title: 'Pre-Run Warmup',
    body: '1. Leg swings\n2. Hip flexor stretch\n3. High knees\n4. Butt kicks\n5. Dynamic calf raises\n6. Light jog\n7. A-skips',
    duration: 8,
    phase: 'before',
    activity: 'run'
  },
  {
    id: 'walk-cooldown',
    type: 'cooldown',
    title: 'Post-Walk Cooldown',
    body: '1. Standing quad stretch\n2. Standing calf stretch\n3. Hip flexor lunge\n4. Seated hamstring stretch\n5. Shoulder rolls',
    duration: 5,
    phase: 'after',
    activity: 'walk'
  },
  {
    id: 'run-cooldown',
    type: 'cooldown',
    title: 'Post-Run Cooldown',
    body: '1. Gentle walk\n2. Standing quad stretch\n3. Pigeon pose\n4. Seated hamstring stretch\n5. IT band stretch\n6. Calf stretch\n7. Seated spinal twist',
    duration: 10,
    phase: 'after',
    activity: 'run'
  },
  {
    id: 'run-breathing',
    type: 'guide',
    title: 'Breathing Guide for Runners',
    body: '1. 2-2 Rhythmic Breathing\n2. Belly breathing\n3. The Talk Test\n4. Transition slowly',
    duration: 10,
    phase: 'anytime',
    activity: 'both'
  },
  {
    id: 'hydration-guide',
    type: 'guide',
    title: 'Moisture & Hydration Guidelines',
    body: '1. Pre-hydrate\n2. Carry water\n3. Regular sips\n4. Recovery rehydration',
    duration: 5,
    phase: 'anytime',
    activity: 'both'
  },
  {
    id: 'beginner-walk',
    type: 'guide',
    title: "Beginner Guide: Your First 2km",
    body: '1. Pace yourself\n2. Shoe choice\n3. Out and back\n4. Listen to body\n5. Consistency wins',
    duration: 15,
    phase: 'anytime',
    activity: 'walk'
  }
]

export default function ContentHubPage() {
  const [guides, setGuides] = useState<ContentItem[]>(STATIC_GUIDES)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'warmup' | 'cooldown' | 'guide'>('all')
  const [activeActivity, setActiveActivity] = useState<'all' | 'walk' | 'run' | 'both'>('all')

  useEffect(() => {
    async function fetchGuides() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .order('title', { ascending: true })

        if (error) {
          console.warn('Error loading guides from Supabase, using local fallback:', error.message)
          setGuides(STATIC_GUIDES)
        } else if (data && data.length > 0) {
          setGuides(data as ContentItem[])
        } else {
          setGuides(STATIC_GUIDES)
        }
      } catch (err) {
        console.error('Fetch guides failed, using fallback:', err)
        setGuides(STATIC_GUIDES)
      } finally {
        setLoading(false)
      }
    }
    fetchGuides()
  }, [])

  // Filter guides based on search query, tabs, and activity filters
  const filteredGuides = guides.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' || g.type === activeTab
    const matchesActivity =
      activeActivity === 'all' ||
      g.activity === activeActivity ||
      g.activity === 'both'

    return matchesSearch && matchesTab && matchesActivity
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warmup':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30'
      case 'cooldown':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30'
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30'
    }
  }

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'before':
        return '☀️ Pre-workout'
      case 'after':
        return '🌙 Post-workout'
      default:
        return '🕒 Anytime'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Fitness Guide Library
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Prep your body, recover properly, and learn breathing mechanics. No wallet connection required.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search guides (e.g. warmup, breathing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        {/* Activity Toggle */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
          {[
            { label: 'All', value: 'all' },
            { label: 'Walk', value: 'walk' },
            { label: 'Run', value: 'run' }
          ].map((act) => (
            <button
              key={act.value}
              onClick={() => setActiveActivity(act.value as 'all' | 'walk' | 'run')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeActivity === act.value
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6 flex gap-6 text-sm font-semibold overflow-x-auto whitespace-nowrap">
        {[
          { id: 'all', label: 'All Content' },
          { id: 'warmup', label: 'Warmups' },
          { id: 'cooldown', label: 'Cooldowns' },
          { id: 'guide', label: 'Pro Guides' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'all' | 'warmup' | 'cooldown' | 'guide')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-semibold">Loading workouts library...</p>
        </div>
      ) : filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map((guide) => (
            <Link
              key={guide.id}
              href={`/content/${guide.id}`}
              className="group bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150/80 dark:border-zinc-850 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getTypeColor(guide.type)}`}>
                  {guide.type}
                </span>
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                  {getPhaseLabel(guide.phase)}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight text-zinc-800 dark:text-zinc-200">
                  {guide.title}
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {guide.body.replace(/\d+\.\s*/g, '')}
                </p>
              </div>

              <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    <b>{guide.duration}</b> min
                  </span>
                  <span className="flex items-center gap-1 uppercase font-bold tracking-wider text-[10px]">
                    <Activity className="h-3.5 w-3.5 text-zinc-400" />
                    {guide.activity}
                  </span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-bold group-hover:translate-x-1 transition-transform">
                  Read <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 p-6">
          <BookOpen className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No guides found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Try adjusting your search keywords or tab filters.
          </p>
        </div>
      )}

      {/* Footnote badge */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
          <Shield className="h-3.5 w-3.5 text-emerald-500" /> Offline-Ready Local Storage Cache Enabled
        </div>
      </div>
    </div>
  )
}
