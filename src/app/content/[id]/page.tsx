'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { ArrowLeft, Clock, Activity, Shield, Check, Heart, Trophy, Zap, ChevronRight } from 'lucide-react'

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
        <p className="text-zinc-500 font-semibold">Loading guide details...</p>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white dark:bg-zinc-950 border rounded-2xl">
        <h3 className="text-lg font-bold">Guide Not Found</h3>
        <p className="text-zinc-400 text-xs mt-2">The guide path might be incorrect or deleted.</p>
        <button onClick={() => router.push('/content')} className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold">
          Back to Library
        </button>
      </div>
    )
  }

  const steps = guide.body.split('\n').filter(line => line.trim())

  const handleStepToggle = (index: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const isAllCompleted = completedSteps.length > 0 && completedSteps.every(Boolean)

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'warmup':
        return 'Warmup Routine'
      case 'cooldown':
        return 'Cooldown Stretch'
      default:
        return 'Training Guide'
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Back to Guides */}
      <Link
        href="/content"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mb-6 uppercase tracking-wider"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Library
      </Link>

      {/* Guide Card Header */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-150/80 dark:border-zinc-850 p-6 sm:p-8 rounded-3xl shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            {getTypeLabel(guide.type)}
          </span>
          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {guide.duration} mins
            </span>
            <span className="uppercase tracking-wide">
              • {guide.activity}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-50">
          {guide.title}
        </h1>
      </div>

      {/* Instructions Title */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Step-by-step checklist
        </h2>
        <span className="text-xs text-zinc-400 font-bold">
          {completedSteps.filter(Boolean).length} of {steps.length} done
        </span>
      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-3">
        {steps.map((stepStr, idx) => {
          // Remove number prefix for cleaner displays
          const displayStr = stepStr.replace(/^\d+\.\s*/, '')
          const isDone = completedSteps[idx]

          return (
            <button
              key={idx}
              onClick={() => handleStepToggle(idx)}
              className={`flex items-start text-left gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                isDone
                  ? 'bg-emerald-500/5 border-emerald-500/40 text-zinc-800 dark:text-zinc-350'
                  : 'bg-white dark:bg-zinc-950 border-zinc-150/80 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-bold mt-0.5 transition-all ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-zinc-300 text-zinc-400 bg-transparent'
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
              <p className="text-sm leading-relaxed font-semibold">
                {displayStr}
              </p>
            </button>
          )
        })}
      </div>

      {/* Completion Notification Card */}
      {isAllCompleted && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 text-center animate-in zoom-in-95 duration-200">
          <Trophy className="h-8 w-8 text-emerald-500 mx-auto mb-2.5 animate-bounce" />
          <h3 className="font-extrabold text-base text-zinc-800 dark:text-zinc-200">Routine Completed!</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-normal">
            Great job prepping your body. You are ready to lock in your skin-in-the-game commitment on Stride!
          </p>
          <Link
            href="/commitment/new"
            className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-extrabold rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            Start a Commitment <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Offline indicators */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
          <Shield className="h-3.5 w-3.5 text-emerald-500" /> Offline access enabled
        </div>
      </div>
    </div>
  )
}
