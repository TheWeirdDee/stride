'use client'

import Link from 'next/link'
import { Activity, Flame, Coins, Users, ArrowRight, Play, Sparkles, CheckCircle, ShieldAlert, BadgeAlert } from 'lucide-react'
import RouteCard from '@/components/RouteCard'

export default function HomePage() {
  // Seeded mock data representing anonymized completed routes
  const mockRoutes = [
    {
      id: 'route-1',
      userName: 'Mover #812',
      city: 'Nairobi',
      distanceKm: 3.82,
      durationMinutes: 26,
      rewardCUSD: 0.35,
      date: 'Today',
      activityType: 'run' as const,
      svgPath: 'M20 100 C 40 80, 60 110, 80 70 C 100 30, 130 90, 180 20',
    },
    {
      id: 'route-2',
      userName: 'Mover #409',
      city: 'Lagos',
      distanceKm: 2.15,
      durationMinutes: 19,
      rewardCUSD: 0.18,
      date: 'Today',
      activityType: 'walk' as const,
      svgPath: 'M20 100 Q 50 20, 100 60 T 180 20',
    },
    {
      id: 'route-3',
      userName: 'Mover #934',
      city: 'Cape Town',
      distanceKm: 5.4,
      durationMinutes: 38,
      rewardCUSD: 0.52,
      date: 'Yesterday',
      activityType: 'run' as const,
      svgPath: 'M20 100 Q 70 120, 90 60 T 140 40 T 180 20',
    },
  ]

  const stats = [
    { name: 'Total Distance Covered', value: '14,248 km', icon: Activity, color: 'from-emerald-500 to-emerald-600' },
    { name: 'cUSD Rewards Distributed', value: '$4,812.50', icon: Coins, color: 'from-cyan-500 to-cyan-600' },
    { name: 'Active Movers Today', value: '342 users', icon: Users, color: 'from-indigo-500 to-indigo-600' },
    { name: 'Current Reward Multiplier', value: '1.2x Pool', icon: Flame, color: 'from-amber-500 to-amber-650' },
  ]

  const steps = [
    {
      step: '01',
      title: 'Commit & Stake',
      description: 'Select your target distance or steps, and lock a small cUSD stake (min $0.01) to seal your commitment.',
      icon: Coins,
    },
    {
      step: '02',
      title: 'Walk or Run',
      description: 'Head out and move! Stride tracks your live GPS route, enforcing strict pace and duration checks to block cheating.',
      icon: Activity,
    },
    {
      step: '03',
      title: 'Claim cUSD Payout',
      description: 'Upon verification, submit your proof on-chain to instantly claim your stake back plus a bonus reward.',
      icon: Sparkles,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 border-b border-zinc-200/50 dark:border-zinc-900/50 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-[100px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-8 animate-bounce">
              <Flame className="h-4 w-4 fill-emerald-500/10" />
              <span>Celo MiniPay-Native Fitness Pools Active</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-50 bg-clip-text text-transparent leading-none">
              Commit to your movement.
              <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                Get rewarded on-chain.
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-base sm:text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Stride is a mobile-first accountability app. Stake cUSD on your walk or run goals, track your GPS session in real-time, and earn your stake back plus a bonus payout when you prove it.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/commitment/new"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all duration-200 active:scale-98"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start a Commitment</span>
              </Link>
              <Link
                href="/content"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-8 py-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
              >
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="py-12 bg-white dark:bg-zinc-900 border-b border-zinc-200/50 dark:border-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.name} className="flex flex-col p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 text-emerald-600 dark:text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{stat.name}</span>
                  </div>
                  <span className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
                    {stat.value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200/50 dark:border-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              How Stride Works
            </h2>
            <p className="mt-4 text-zinc-650 dark:text-zinc-400 text-sm sm:text-base">
              Three simple steps to build physical habits and earn stable rewards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="group relative flex flex-col p-8 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 shadow-sm hover:border-emerald-500/20 dark:hover:border-emerald-400/20 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-400 text-white shadow-md shadow-emerald-500/10">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-4xl font-extrabold text-zinc-100 dark:text-zinc-800 font-mono select-none group-hover:text-emerald-500/20 dark:group-hover:text-emerald-400/10 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Explore / Live Feed Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Explore Community Routes
              </h2>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm">
                Anonymized GPS paths completed by users on Celo.
              </p>
            </div>
            <Link
              href="/community"
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors group"
            >
              <span>View Community Feed</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRoutes.map((route) => (
              <RouteCard key={route.id} {...route} />
            ))}
          </div>
        </div>
      </section>

      {/* Warmup content prompt section */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-emerald-500/10 via-cyan-500/15 to-indigo-500/10 dark:from-emerald-500/5 dark:via-cyan-500/5 dark:to-indigo-500/5 border border-emerald-500/20 dark:border-emerald-400/10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Ready to move? Prepare your body first.
              </h3>
              <p className="mt-4 text-sm sm:text-base text-zinc-650 dark:text-zinc-400 leading-relaxed">
                Maximize performance and avoid injuries. Check out our quick guides on hydration, deep breathing, pre-walk stretching, and run warm-ups before locking in your cUSD.
              </p>
            </div>
            <Link
              href="/content"
              className="flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-white dark:bg-zinc-900 px-6 py-3.5 text-sm font-bold text-emerald-650 dark:text-emerald-400 border border-emerald-500/10 hover:border-emerald-500/20 dark:border-emerald-400/20 shadow-sm hover:shadow transition-all duration-200"
            >
              <span>Browse Guides</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
