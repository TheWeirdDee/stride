'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { ArrowLeft, Clock, Check, Trophy, ChevronRight } from 'lucide-react'

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
    body: '1. Ankle circles — Rotate each ankle clockwise and counter-clockwise for 30 seconds to loosen up the joint.\n2. Knee lifts — Stand tall and bring each knee up to hip height alternately, performing 20 repetitions.\n3. Hip circles — Place hands on hips and rotate hips in large circles, doing 10 reps in each direction.\n4. Arm swings — Swing arms forward and backward gently for 30 seconds to warm up the upper body.\n5. Neck rolls — Slowly roll neck in a semi-circle, 30 seconds on each side.\n6. Side steps — Step side-to-side dynamically for 1 minute to activate glutes and thighs.',
    duration: 5,
    phase: 'before',
    activity: 'walk'
  },
  {
    id: 'run-warmup',
    type: 'warmup',
    title: 'Pre-Run Warmup',
    body: '1. Leg swings — Hold a support and swing one leg forward and backward dynamically, 30 seconds per leg.\n2. Hip flexor stretch — Perform dynamic lunges, holding briefly at the bottom to open up hips. 30 seconds per side.\n3. High knees — Jog in place bringing knees up toward chest, for 1 minute.\n4. Butt kicks — Jog in place bringing heels up toward glutes, for 1 minute.\n5. Dynamic calf raises — Lift up onto toes and lower down dynamically, doing 20 repetitions.\n6. Light jog in place — Ease into the cardio flow with a soft jog for 2 minutes.\n7. A-skips — Skip forward bringing knees high and driving arms, for 1 minute.',
    duration: 8,
    phase: 'before',
    activity: 'run'
  },
  {
    id: 'walk-cooldown',
    type: 'cooldown',
    title: 'Post-Walk Cooldown',
    body: '1. Standing quad stretch — Hold ankle behind glutes, keeping knees aligned. Hold for 30 seconds each side.\n2. Standing calf stretch — Step one foot back, keep heel flat on the ground and lean forward. Hold for 30 seconds each side.\n3. Hip flexor lunge — Deep low lunge, pushing hips gently forward. Hold for 30 seconds each side.\n4. Seated hamstring stretch — Sit down, extend one leg and reach toward toes. Hold for 30 seconds each side.\n5. Shoulder rolls — Roll shoulders backward slowly for 30 seconds to release upper back tension.',
    duration: 5,
    phase: 'after',
    activity: 'walk'
  },
  {
    id: 'run-cooldown',
    type: 'cooldown',
    title: 'Post-Run Cooldown',
    body: '1. Gentle walk — Walk slowly for 2 minutes to bring heart rate back to resting levels.\n2. Standing quad stretch — Hold ankle behind glutes, keeping knees aligned. Hold for 45 seconds each side.\n3. Pigeon pose — Seated on floor with one leg bent forward and the other extended backward. Hold for 1 minute each side.\n4. Seated hamstring stretch — Reach toward toes with legs extended. Hold for 1 minute each side.\n5. IT band stretch — Cross one leg behind the other and lean torso toward the front leg side. Hold for 30 seconds each side.\n6. Calf stretch against wall — Press heel to ground with toe flexed against wall. Hold for 30 seconds each side.\n7. Seated spinal twist — Cross one leg over the other, twist torso towards the bent knee. Hold for 30 seconds each side.',
    duration: 10,
    phase: 'after',
    activity: 'run'
  },
  {
    id: 'run-breathing',
    type: 'guide',
    title: 'Breathing Guide for Runners',
    body: '1. 2-2 Rhythmic Breathing — Coordinate inhaling for 2 steps and exhaling for 2 steps to synchronize diaphragm movements.\n2. Belly breathing (Diaphragmatic) — Breathe deep into your abdomen rather than shallowly into your chest.\n3. The Talk Test — Ensure you are running at a conversational pace. If you cannot speak a complete sentence without gasping, slow down.\n4. Transition slowly — When ending a run, transition to a jog and then a walk. Never stop abruptly to prevent dizziness.',
    duration: 10,
    phase: 'anytime',
    activity: 'both'
  },
  {
    id: 'hydration-guide',
    type: 'guide',
    title: 'Moisture & Hydration Guidelines',
    body: '1. Pre-hydrate — Drink 500ml of water about 30 minutes before starting your session.\n2. Carry water — Always carry fluid if planning a session exceeding 30 minutes or in high temperatures.\n3. Regular sips — Drink approximately 250ml of water every 20-25 minutes during your activity.\n4. Recovery rehydration — Drink another 500ml of water or electrolyte solution within 30 minutes of finishing.',
    duration: 5,
    phase: 'anytime',
    activity: 'both'
  },
  {
    id: 'beginner-walk',
    type: 'guide',
    title: "Beginner Guide: Your First 2km",
    body: '1. Pace yourself — Starting slow is key. There is no need to speed walk. Maintain a comfortable, sustainable pace.\n2. Shoe choice — Wear flat, supportive athletic shoes. Avoid sandals, slides, or heavy boots.\n3. Out and back — If unsure of route, walk 1km in one direction, then turn around. It ensures you do not get stuck far from home.\n4. Listen to body — If you experience sharp joint pain or extreme breathlessness, slow down or take a break.\n5. Consistency wins — Completing the distance is the goal. Celebrate showing up and logging the route on-chain.',
    duration: 15,
    phase: 'anytime',
    activity: 'walk'
  }
]

export default function ContentDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [guide, setGuide] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])

  useEffect(() => {
    async function fetchGuide() {
      try {
        setLoading(true)
        // Check local mock first
        const staticMatch = STATIC_GUIDES.find((g) => g.id === id)
        if (staticMatch) {
          setGuide(staticMatch)
          return
        }

        // Fetch from Supabase
        if (!supabase) {
          setGuide(STATIC_GUIDES[0])
          return
        }
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.warn('Guide fetch failed, check fallback.')
          // Search fallback by UUID/ID if it wasn't a standard static string
          setGuide(STATIC_GUIDES[0])
        } else if (data) {
          setGuide(data as ContentItem)
        }
      } catch (err) {
        console.error('Fetch guide error:', err)
        setGuide(STATIC_GUIDES[0])
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchGuide()
  }, [id])

  useEffect(() => {
    if (guide) {
      const stepsCount = guide.body.split('\n').filter(line => line.trim()).length
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompletedSteps(new Array(stepsCount).fill(false))
    }
  }, [guide])

  if (loading) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 36, height: 36, border: '4px solid #cdfb46', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite', marginBottom: 16 }} />
        <p style={{ color: 'var(--muted)' }}>Loading guide…</p>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <h3 className="sd-display" style={{ fontSize: 22 }}>Guide not found</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '10px 0 22px' }}>This guide may have moved or been removed.</p>
        <button onClick={() => router.push('/content')} className="sd-btn sd-btn-ghost" style={{ maxWidth: 220 }}>Back to library</button>
      </div>
    )
  }

  const steps = guide.body.split('\n').filter((line) => line.trim())

  const handleStepToggle = (index: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const isAllCompleted = completedSteps.length > 0 && completedSteps.every(Boolean)
  const typeLabel = guide.type === 'warmup' ? 'Warmup routine' : guide.type === 'cooldown' ? 'Cooldown stretch' : 'Training guide'

  return (
    <div className="sd-page">
      <Link href="/content" className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: 16 }}>
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      {/* Header */}
      <div className="sd-card-lime sd-card-glow" style={{ padding: 22 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="sd-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#cdfb46' }}>{typeLabel}</span>
          <span className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}><Clock className="h-3.5 w-3.5" /> {guide.duration} min · {guide.activity}</span>
        </div>
        <h1 className="sd-display" style={{ position: 'relative', fontSize: 28 }}>{guide.title}</h1>
      </div>

      <div className="sd-section-row" style={{ marginTop: 24 }}>
        <h2 className="sd-section" style={{ fontSize: 12 }}>Checklist</h2>
        <span className="sd-meta">{completedSteps.filter(Boolean).length} / {steps.length} done</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((stepStr, idx) => {
          const displayStr = stepStr.replace(/^\d+\.\s*/, '')
          const isDone = completedSteps[idx]
          return (
            <button key={idx} onClick={() => handleStepToggle(idx)} className="sd-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, textAlign: 'left', cursor: 'pointer', border: isDone ? '1px solid rgba(205,251,70,0.4)' : undefined, background: isDone ? 'rgba(205,251,70,0.06)' : undefined }}>
              <span className="sd-mono" style={{ height: 22, width: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, marginTop: 1, background: isDone ? '#cdfb46' : 'transparent', color: isDone ? '#06080a' : 'var(--muted-2)', border: isDone ? 'none' : '1px solid var(--line-strong)' }}>
                {isDone ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: isDone ? 'var(--muted)' : 'var(--ink)' }}>{displayStr}</p>
            </button>
          )
        })}
      </div>

      {isAllCompleted && (
        <div className="sd-card-lime sd-card-glow" style={{ padding: 22, marginTop: 18, textAlign: 'center' }}>
          <Trophy className="h-8 w-8" style={{ color: '#cdfb46', margin: '0 auto 10px', animation: 'floaty 2s ease-in-out infinite' }} />
          <h3 className="sd-display" style={{ position: 'relative', fontSize: 18 }}>Routine done</h3>
          <p style={{ position: 'relative', fontSize: 13, color: 'var(--muted)', margin: '8px auto 16px', maxWidth: 300 }}>Body prepped. Time to lock in a commitment.</p>
          <Link href="/commitment/new" className="sd-btn sd-btn-lime" style={{ position: 'relative', maxWidth: 260, margin: '0 auto', textDecoration: 'none' }}>Start a commitment <ChevronRight className="h-4 w-4" /></Link>
        </div>
      )}
    </div>
  )
}
