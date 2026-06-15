'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Coins,
  Footprints,
  ShieldCheck,
  Trophy,
  ArrowRight,
  Activity,
  Compass,
  BookOpen,
  Users,
} from 'lucide-react'
import RouteCard from '@/components/RouteCard'

// Anonymized example routes — seeded so the app feels alive before a wallet is
// ever connected (Feature F1: Explore Mode).
const EXAMPLE_ROUTES = [
  {
    id: 'ex-1',
    userName: 'Anonymous Mover',
    city: 'Lagos',
    distanceKm: 5.2,
    durationMinutes: 38,
    rewardCUSD: 0.062,
    date: 'Jun 12, 2026',
    activityType: 'run' as const,
    svgPath: 'M20 100 C 60 60, 80 110, 120 70 S 160 40, 180 20',
  },
  {
    id: 'ex-2',
    userName: 'Anonymous Mover',
    city: 'Nairobi',
    distanceKm: 2.5,
    durationMinutes: 27,
    rewardCUSD: 0.018,
    date: 'Jun 12, 2026',
    activityType: 'walk' as const,
    svgPath: 'M20 100 L 60 80 L 90 95 L 130 50 L 160 60 L 180 20',
  },
  {
    id: 'ex-3',
    userName: 'Anonymous Mover',
    city: 'Accra',
    distanceKm: 10.0,
    durationMinutes: 71,
    rewardCUSD: 0.11,
    date: 'Jun 11, 2026',
    activityType: 'run' as const,
    svgPath: 'M20 100 Q 50 30 90 70 T 150 40 L 180 20',
  },
  {
    id: 'ex-4',
    userName: 'Anonymous Mover',
    city: 'Kampala',
    distanceKm: 3.1,
    durationMinutes: 33,
    rewardCUSD: 0.024,
    date: 'Jun 11, 2026',
    activityType: 'walk' as const,
    svgPath: 'M20 100 L 50 70 L 80 85 L 110 55 L 140 75 L 180 20',
  },
  {
    id: 'ex-5',
    userName: 'Anonymous Mover',
    city: 'Cape Town',
    distanceKm: 7.4,
    durationMinutes: 49,
    rewardCUSD: 0.083,
    date: 'Jun 10, 2026',
    activityType: 'run' as const,
    svgPath: 'M20 100 C 40 50, 100 90, 120 50 S 170 50, 180 20',
  },
  {
    id: 'ex-6',
    userName: 'Anonymous Mover',
    city: 'Kigali',
    distanceKm: 1.8,
    durationMinutes: 21,
    rewardCUSD: 0.012,
    date: 'Jun 10, 2026',
    activityType: 'walk' as const,
    svgPath: 'M20 100 L 70 90 L 100 60 L 130 80 L 155 45 L 180 20',
  },
]

const STEPS = [
  {
    icon: Coins,
    title: 'Commit',
    body: 'Pick a distance or step goal and stake a little cUSD against it. The stake locks on-chain.',
  },
  {
    icon: Footprints,
    title: 'Move',
    body: 'Start a live GPS session. Walk or run your goal inside your chosen time window.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify',
    body: 'Your route is checked for plausibility — no teleporting, no 60km/h "walks".',
  },
  {
    icon: Trophy,
    title: 'Earn',
    body: 'Finish and your full stake comes back plus a bonus from the reward pool.',
  },
]

export default function ExplorePage() {
  const router = useRouter()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Compass className="h-3.5 w-3.5" /> Explore · No wallet needed
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          See how Stride works
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl">
          Browse real-style routes, learn the commitment + reward model, and try the flow.
          You only need a wallet at the moment you lock a real stake.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="relative bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm flex flex-col gap-3"
            >
              <span className="absolute top-4 right-4 text-xs font-mono font-bold text-zinc-300 dark:text-zinc-700">
                0{i + 1}
              </span>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-zinc-800 dark:text-zinc-100">{step.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{step.body}</p>
            </div>
          )
        })}
      </div>

      {/* Commitment + reward explainer */}
      <div className="bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/15 rounded-3xl p-6 sm:p-8 mb-12">
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">
          Why staking works
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mb-5">
          Putting a little money on the line makes you far more likely to follow through. With Stride
          your stake is never a fee — finish your goal and you get <b>100% of it back</b>, plus a bonus
          paid from the community reward pool. Miss the goal and your stake stays in the pool to fund
          everyone else&apos;s bonuses.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/60 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850 p-4">
            <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">You stake</span>
            <span className="block text-xl font-extrabold font-mono text-zinc-800 dark:text-zinc-100 mt-1">1.00 cUSD</span>
          </div>
          <div className="rounded-2xl bg-white/60 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850 p-4">
            <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">You finish</span>
            <span className="block text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">+ bonus</span>
          </div>
          <div className="rounded-2xl bg-white/60 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850 p-4">
            <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">You get back</span>
            <span className="block text-xl font-extrabold font-mono text-zinc-800 dark:text-zinc-100 mt-1">1.00 + bonus</span>
          </div>
        </div>
      </div>

      {/* Example routes */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500" /> Recent routes near you
        </h2>
        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded font-mono font-bold text-zinc-400 uppercase">
          Example data
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {EXAMPLE_ROUTES.map((r) => (
          <RouteCard key={r.id} {...r} />
        ))}
      </div>

      {/* Secondary nav teasers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <Link
          href="/community"
          className="group flex items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">Community pulse</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Live totals across active cities</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/content"
          className="group flex items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 shadow-sm hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">Warmups & guides</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Prep, recover, breathe better</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* CTA */}
      <div className="text-center bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Ready to put your money where your miles are?
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
          Set up your commitment now. You&apos;ll connect a wallet only at the final confirm step.
        </p>
        <button
          onClick={() => router.push('/commitment/new')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-extrabold shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
        >
          Start a Commitment
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
