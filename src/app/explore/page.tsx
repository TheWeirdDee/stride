'use client'

import { useRouter } from 'next/navigation'
import RouteCard from '@/components/RouteCard'

const STEPS = [
  { n: '01', t: 'Commit', d: 'Set a goal and stake cUSD to lock it in.' },
  { n: '02', t: 'Move', d: 'Track your walk or run with live GPS.' },
  { n: '03', t: 'Verify', d: 'Your route is checked on-chain automatically.' },
  { n: '04', t: 'Earn', d: 'Hit the goal, reclaim your stake plus rewards.' },
]

const ROUTES = [
  { id: 'ex-1', city: 'Lagos', distanceKm: 3.2, durationMinutes: 28.2, rewardCUSD: 0.25, date: 'Today', activityType: 'run' as const, svgPath: 'M10,78 C40,50 60,72 92,44 C120,20 150,40 190,18' },
  { id: 'ex-2', city: 'Nairobi', distanceKm: 5.0, durationMinutes: 31.6, rewardCUSD: 0.5, date: 'Today', activityType: 'run' as const, svgPath: 'M12,22 C40,48 70,30 100,58 C130,84 160,60 188,80' },
  { id: 'ex-3', city: 'Accra', distanceKm: 2.1, durationMinutes: 19.0, rewardCUSD: 0.1, date: 'Today', activityType: 'walk' as const, svgPath: 'M10,52 C44,52 56,18 96,30 C140,44 150,80 190,58' },
]

export default function ExplorePage() {
  const router = useRouter()

  return (
    <div className="sd-page">
      {/* Hero */}
      <div className="sd-rise-1">
        <div className="sd-eyebrow">Stake on yourself</div>
        <h1 className="sd-display" style={{ fontSize: 47, marginTop: 14 }}>
          Put money<br />on your<br /><span style={{ color: '#cdfb46' }}>next move.</span>
        </h1>
        <p style={{ margin: '18px 0 0', fontSize: 14.5, lineHeight: 1.5, color: 'var(--muted)', maxWidth: 298 }}>
          Commit cUSD to a walking or running goal. Hit it — reclaim your stake plus rewards. Miss it — you forfeit. Real skin in the game.
        </p>
        <button onClick={() => router.push('/commitment/new')} className="sd-btn sd-btn-lime" style={{ marginTop: 20 }}>
          Start a commitment <span style={{ fontSize: 17 }}>→</span>
        </button>
      </div>

      {/* How it works */}
      <div className="sd-rise-2" style={{ paddingTop: 34 }}>
        <div className="sd-section-row">
          <h2 className="sd-section">How it works</h2>
          <span className="sd-meta">4 STEPS</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {STEPS.map((st) => (
            <div key={st.n} className="sd-card" style={{ padding: 15, borderRadius: 18 }}>
              <div className="sd-mono" style={{ fontWeight: 800, fontSize: 13, color: '#cdfb46', letterSpacing: '0.05em' }}>{st.n}</div>
              <div style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 16, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{st.t}</div>
              <div style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--muted)', marginTop: 5 }}>{st.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent routes */}
      <div className="sd-rise-3" style={{ paddingTop: 34 }}>
        <div className="sd-section-row">
          <h2 className="sd-section">Recent routes</h2>
          <span className="sd-meta">FROM THE NETWORK</span>
        </div>
        <div style={{ display: 'flex', gap: 13, overflowX: 'auto', paddingBottom: 6, margin: '0 -20px', padding: '0 20px 6px', scrollSnapType: 'x mandatory' }}>
          {ROUTES.map((r) => (
            <div key={r.id} style={{ flex: '0 0 220px', scrollSnapAlign: 'start' }}>
              <RouteCard {...r} />
            </div>
          ))}
        </div>
      </div>

      {/* Stake model */}
      <div className="sd-rise-4" style={{ paddingTop: 34 }}>
        <div className="sd-card-lime sd-card-glow" style={{ padding: 22 }}>
          <div className="sd-eyebrow" style={{ position: 'relative', letterSpacing: '0.2em' }}>The stake model</div>
          <h3 className="sd-display" style={{ position: 'relative', fontSize: 22, margin: '10px 0 0', lineHeight: 1.05 }}>Lose it or<br />level up.</h3>
          <p style={{ position: 'relative', fontSize: 13, lineHeight: 1.5, color: 'rgba(244,246,243,0.6)', margin: '12px 0 0', maxWidth: 280 }}>
            Your stake sits in escrow on Celo. Complete your goal in the time window and it returns with a reward from the community pool. No completion, no refund.
          </p>
          <div style={{ position: 'relative', display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '11px 13px' }}>
              <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', textTransform: 'uppercase' }}>You stake</div>
              <div className="sd-mono" style={{ fontWeight: 800, fontSize: 18, marginTop: 3 }}>$0.25</div>
            </div>
            <div style={{ color: 'var(--muted-2)', fontSize: 18 }}>→</div>
            <div style={{ flex: 1, background: 'rgba(205,251,70,0.12)', border: '1px solid rgba(205,251,70,0.25)', borderRadius: 13, padding: '11px 13px' }}>
              <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: '#cdfb46', textTransform: 'uppercase' }}>You earn</div>
              <div className="sd-mono" style={{ fontWeight: 800, fontSize: 18, marginTop: 3, color: '#cdfb46' }}>$0.30</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
