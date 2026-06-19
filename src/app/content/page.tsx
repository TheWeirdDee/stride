'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { BookOpen, Clock, Search, ChevronRight, RefreshCw, Sun, Moon, Quote } from 'lucide-react'
import AskAI from '@/components/AskAI'

const QUOTES = [
  'The miracle isn’t that you finished. It’s that you had the courage to start.',
  'You don’t have to be fast. You just have to be consistent.',
  'A one-hour walk is 24 hours of momentum.',
  'Your only competition is who you were yesterday.',
  'Discipline is choosing what you want most over what you want now.',
  'Every step you stake on yourself pays you back twice.',
  'Slow progress is still progress. Keep moving.',
  'The hardest step is the one out the door.',
]

interface ContentItem {
  id: string
  type: 'warmup' | 'cooldown' | 'guide'
  title: string
  body: string
  duration: number
  phase: 'before' | 'after' | 'anytime'
  activity: 'walk' | 'run' | 'both'
}

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
  const [qIdx, setQIdx] = useState(0)

  // Show one motivation per day, rotating automatically (deterministic by date).
  useEffect(() => {
    const dayNumber = Math.floor(Date.now() / 86_400_000)
    setQIdx(dayNumber % QUOTES.length)
  }, [])

  useEffect(() => {
    async function fetchGuides() {
      try {
        setLoading(true)
        if (!supabase) {
          setGuides(STATIC_GUIDES)
          return
        }
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

  const filteredGuides = guides.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' || g.type === activeTab
    const matchesActivity =
      activeActivity === 'all' ||
      g.activity === activeActivity ||
      g.activity === 'both'

    return matchesSearch && matchesTab && matchesActivity
  })

  const typeColor = (type: string) => {
    if (type === 'warmup') return '#fbbf24'
    if (type === 'cooldown') return '#7db4e6'
    return '#cdfb46'
  }
  const phaseLabel = (phase: string) => {
    if (phase === 'before') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Sun className="w-3 h-3" /> Pre</span>
    if (phase === 'after') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Moon className="w-3 h-3" /> Post</span>
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock className="w-3 h-3" /> Anytime</span>
  }

  return (
    <div className="sd-page">
      <div className="sd-eyebrow">No wallet needed</div>
      <h1 className="sd-display" style={{ fontSize: 34, marginTop: 12 }}>Movement<br />library</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>Prep, recover and breathe better. Free, works offline.</p>

      {/* Coaching & motivation */}
      <div className="sd-section-row" style={{ marginTop: 24 }}>
        <h2 className="sd-section">Coaching</h2>
        <span className="sd-meta">AI + Motivation</span>
      </div>

      {/* Daily motivation */}
      <div className="sd-card-lime sd-card-glow" style={{ padding: 20, marginBottom: 14 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="sd-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#cdfb46', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Quote className="h-3.5 w-3.5" /> Today&apos;s motivation</span>
        </div>
        <p style={{ position: 'relative', fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 18, lineHeight: 1.3 }}>{QUOTES[qIdx]}</p>
      </div>

      {/* AI running coach + recovery advisor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 8 }}>
        <AskAI
          mode="coach"
          title="AI running coach"
          subtitle="Ask about training, pacing, form, or staying motivated."
          placeholder="e.g. how do I build up to my first 5k?"
          cta="Ask the coach"
        />
        <AskAI
          mode="recovery"
          title="Recovery advisor"
          subtitle="Tell it how you feel after a session for recovery tips."
          placeholder="e.g. my calves are tight and sore after a 4km run"
          cta="Get recovery tips"
        />
      </div>

      <div className="sd-section-row" style={{ marginTop: 26 }}>
        <h2 className="sd-section">Library</h2>
        <span className="sd-meta">Warmups · Cooldowns · Guides</span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginTop: 20 }}>
        <Search className="h-4 w-4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)' }} />
        <input type="text" placeholder="Search guides…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="sd-input" style={{ paddingLeft: 40 }} />
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto' }}>
        {[{ id: 'all', label: 'All' }, { id: 'warmup', label: 'Warmups' }, { id: 'cooldown', label: 'Cooldowns' }, { id: 'guide', label: 'Guides' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as 'all' | 'warmup' | 'cooldown' | 'guide')} className="sd-mono" style={{
            padding: '8px 14px', borderRadius: 999, fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
            background: activeTab === tab.id ? '#cdfb46' : 'rgba(255,255,255,0.04)',
            color: activeTab === tab.id ? '#06080a' : 'var(--muted)',
            border: activeTab === tab.id ? '1px solid #cdfb46' : '1px solid var(--line)',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
          <RefreshCw className="h-8 w-8" style={{ color: '#cdfb46', animation: 'spin 0.9s linear infinite', marginBottom: 14 }} />
          <p style={{ color: 'var(--muted)' }}>Loading library…</p>
        </div>
      ) : filteredGuides.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 18 }}>
          {filteredGuides.map((guide) => (
            <Link key={guide.id} href={`/content/${guide.id}`} className="sd-card" style={{ padding: 18, textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="sd-mono" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: typeColor(guide.type) }}>{guide.type}</span>
                <span className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{phaseLabel(guide.phase)}</span>
              </div>
              <h3 style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.01em' }}>{guide.title}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{guide.body.replace(/\d+\.\s*/g, '')}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                <span className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}><Clock className="h-3.5 w-3.5" /> {guide.duration} min · {guide.activity}</span>
                <span className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: '#cdfb46' }}>Read <ChevronRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="sd-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: 18, borderStyle: 'dashed' }}>
          <BookOpen className="h-10 w-10" style={{ color: 'var(--muted-3)', margin: '0 auto 12px' }} />
          <h3 style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 16, textTransform: 'uppercase' }}>No guides found</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Try different keywords or filters.</p>
        </div>
      )}
    </div>
  )
}
