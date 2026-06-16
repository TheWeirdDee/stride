'use client'

import { useState, useEffect } from 'react'

const TICKER = [
  { name: 'Amara', city: 'Lagos', act: 'finished a 3.2 km walk', reward: '+$0.25' },
  { name: 'David', city: 'Nairobi', act: 'completed a 5 km run', reward: '+$0.50' },
  { name: 'Zanele', city: 'Cape Town', act: 'hit a 2 km goal', reward: '+$0.10' },
  { name: 'Kwame', city: 'Accra', act: 'ran 7.4 km', reward: '+$0.75' },
  { name: 'Fatou', city: 'Dakar', act: 'walked 4 km', reward: '+$0.30' },
  { name: 'Brian', city: 'Kampala', act: 'finished 3 km', reward: '+$0.20' },
]

const CITIES = [
  { rank: '01', name: 'Lagos', km: '4,182', users: '1,204', w: '100%' },
  { rank: '02', name: 'Nairobi', km: '3,640', users: '988', w: '87%' },
  { rank: '03', name: 'Accra', km: '2,915', users: '742', w: '70%' },
  { rank: '04', name: 'Kampala', km: '2,103', users: '511', w: '50%' },
  { rank: '05', name: 'Cape Town', km: '1,876', users: '489', w: '45%' },
]

const MOVERS = [
  { rank: '01', name: 'Amara O.', city: 'Lagos', km: '128', streak: 21 },
  { rank: '02', name: 'David K.', city: 'Nairobi', km: '116', streak: 14 },
  { rank: '03', name: 'Zanele M.', city: 'Cape Town', km: '102', streak: 30 },
  { rank: '04', name: 'Kwame A.', city: 'Accra', km: '97', streak: 9 },
  { rank: '05', name: 'Fatou D.', city: 'Dakar', km: '88', streak: 12 },
]

const CHALLENGES = [
  { title: 'June 50K', sub: 'Cover 50 km this month', progress: 64, value: '32 / 50 km', joined: '2,140 in' },
  { title: 'Weekend Warrior', sub: '3 sessions Sat–Sun', progress: 33, value: '1 / 3 done', joined: '880 in' },
]

const FINISHES = [
  { name: 'Amara', city: 'Lagos', detail: '3.2 km walk · 28:14', reward: '+$0.25', fire: 12 },
  { name: 'David', city: 'Nairobi', detail: '5.0 km run · 31:40', reward: '+$0.50', fire: 8 },
  { name: 'Zanele', city: 'Cape Town', detail: '2.0 km walk · 19:05', reward: '+$0.10', fire: 5 },
  { name: 'Kwame', city: 'Accra', detail: '7.4 km run · 52:03', reward: '+$0.75', fire: 21 },
]

export default function CommunityPage() {
  const [variant, setVariant] = useState<'signal' | 'atlas'>('signal')
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TICKER.length), 2600)
    return () => clearInterval(t)
  }, [])

  const tk = TICKER[idx]

  return (
    <div className="sd-page" style={{ paddingTop: 10 }}>
      {/* Header + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="sd-display" style={{ fontSize: 30, lineHeight: 0.95 }}>The city<br />is moving.</h1>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 30, padding: 3 }}>
          {(['signal', 'atlas'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              className="sd-mono"
              style={{
                background: variant === v ? '#cdfb46' : 'transparent',
                color: variant === v ? '#06080a' : 'var(--muted)',
                border: 0, fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '7px 12px', borderRadius: 30, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Live ticker */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(120deg,rgba(205,251,70,0.1),rgba(255,255,255,0.02))', border: '1px solid rgba(205,251,70,0.18)', borderRadius: 14, padding: '11px 14px', overflow: 'hidden' }}>
        <span style={{ position: 'relative', flexShrink: 0, width: 9, height: 9 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#cdfb46', animation: 'pulseDot 1.6s ease-in-out infinite' }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#cdfb46', animation: 'ring 1.8s ease-out infinite' }} />
        </span>
        <span className="sd-mono" style={{ fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', color: '#cdfb46', textTransform: 'uppercase', flexShrink: 0 }}>Live</span>
        <div key={idx} style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', animation: 'tickerIn 0.55s ease', fontSize: 13.5, lineHeight: 1.3 }}>
          <span style={{ fontWeight: 800 }}>{tk.name}</span>
          <span style={{ color: 'var(--muted)' }}> in </span>
          <span style={{ fontWeight: 700 }}>{tk.city}</span>
          <span style={{ color: 'var(--muted)' }}> {tk.act} </span>
          <span className="sd-mono" style={{ color: '#cdfb46', fontWeight: 700 }}>{tk.reward}</span>
        </div>
      </div>

      {variant === 'signal' ? (
        <>
          {/* Distance stat */}
          <div className="sd-card sd-card-glow" style={{ marginTop: 18, padding: 22, position: 'relative' }}>
            <div className="sd-mono" style={{ position: 'relative', fontWeight: 700, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>Distance this week</div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span className="sd-mono" style={{ fontWeight: 800, fontSize: 58, lineHeight: 0.9, letterSpacing: '-0.02em' }}>18,640</span>
              <span style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 18, color: '#cdfb46' }}>KM</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', gap: 24, marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[['9,421', 'Completions', false], ['37', 'Active cities', false], ['+12%', 'vs last', true]].map(([v, l, lime]) => (
                <div key={l as string}>
                  <div className="sd-mono" style={{ fontWeight: 800, fontSize: 24, color: lime ? '#cdfb46' : '#f4f6f3' }}>{v}</div>
                  <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted-2)', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reward pool */}
          <div className="sd-card-lime sd-card-glow" style={{ marginTop: 14, padding: 20 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="sd-mono" style={{ fontWeight: 700, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#cdfb46' }}>Community reward pool</div>
              <span className="sd-mono" style={{ fontSize: 9, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
              <span className="sd-mono" style={{ fontWeight: 800, fontSize: 44, lineHeight: 0.9, color: '#cdfb46' }}>$8,412</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>in escrow</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', gap: 10, marginTop: 16 }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '11px 13px' }}>
                <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted-2)', textTransform: 'uppercase' }}>Paid this week</div>
                <div className="sd-mono" style={{ fontWeight: 800, fontSize: 16, marginTop: 3 }}>$1,940</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '11px 13px' }}>
                <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted-2)', textTransform: 'uppercase' }}>From forfeits</div>
                <div className="sd-mono" style={{ fontWeight: 800, fontSize: 16, marginTop: 3 }}>$612</div>
              </div>
            </div>
          </div>

          {/* Heat density map */}
          <div style={{ marginTop: 14, position: 'relative', height: 230, borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'radial-gradient(130% 120% at 25% 15%, rgba(10,46,78,0.5), transparent 55%), #080b0d' }}>
            <div className="sd-grid" style={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', top: 30, left: 40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle,rgba(205,251,70,0.4),transparent 68%)', filter: 'blur(14px)', animation: 'heatPulse 4s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: 24, right: 50, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle,rgba(205,251,70,0.32),transparent 68%)', filter: 'blur(12px)', animation: 'heatPulse 5s ease-in-out infinite 0.6s' }} />
            <div style={{ position: 'absolute', top: 90, right: 90, width: 70, height: 70, borderRadius: '50%', background: 'radial-gradient(circle,rgba(125,180,230,0.3),transparent 70%)', filter: 'blur(10px)', animation: 'heatPulse 6s ease-in-out infinite 1s' }} />
            <svg viewBox="0 0 390 230" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d="M30,200 C90,150 110,170 150,120 C200,60 250,90 300,40" fill="none" stroke="#cdfb46" strokeWidth="2.6" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(205,251,70,0.9))', strokeDasharray: '8 10', animation: 'flow 7s linear infinite' }} />
              <path d="M60,40 C110,80 130,70 170,130 C210,185 280,170 350,200" fill="none" stroke="#cdfb46" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" style={{ strokeDasharray: '6 9', animation: 'flow 9s linear infinite' }} />
              <path d="M20,120 C80,110 120,140 180,90 C240,40 300,70 360,60" fill="none" stroke="#7db4e6" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" style={{ strokeDasharray: '5 8', animation: 'flow 11s linear infinite' }} />
            </svg>
            <div className="sd-mono" style={{ position: 'absolute', left: 16, bottom: 14, fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', color: 'rgba(244,246,243,0.55)', textTransform: 'uppercase' }}>Live route density</div>
            <div className="sd-mono" style={{ position: 'absolute', right: 14, top: 14, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 10px', fontWeight: 700, fontSize: 10, color: '#cdfb46' }}>412 ACTIVE</div>
          </div>

          {/* Leaderboard */}
          <div style={{ marginTop: 24 }}>
            <div className="sd-section-row">
              <h2 className="sd-section">City leaderboard</h2>
              <span className="sd-meta">THIS WEEK</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CITIES.map((c) => (
                <div key={c.rank} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(120deg,rgba(255,255,255,0.05),rgba(255,255,255,0.012))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 15, padding: '13px 15px', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: c.w, background: 'linear-gradient(90deg,rgba(205,251,70,0.1),transparent)', pointerEvents: 'none' }} />
                  <span className="sd-mono" style={{ position: 'relative', fontWeight: 800, fontSize: 16, color: '#cdfb46', width: 24 }}>{c.rank}</span>
                  <span style={{ position: 'relative', flex: 1, fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 16, textTransform: 'uppercase' }}>{c.name}</span>
                  <span style={{ position: 'relative', textAlign: 'right' }}>
                    <span className="sd-mono" style={{ fontWeight: 800, fontSize: 16 }}>{c.km}</span>
                    <span className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-2)', marginLeft: 3 }}>km</span>
                    <div className="sd-mono" style={{ fontSize: 9, color: 'var(--muted-2)', letterSpacing: '0.05em', marginTop: 1 }}>{c.users} active</div>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active challenges */}
          <div style={{ marginTop: 24 }}>
            <div className="sd-section-row">
              <h2 className="sd-section">Active challenges</h2>
              <span className="sd-meta">JOIN FREE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CHALLENGES.map((ch) => (
                <div key={ch.title} className="sd-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 800, fontSize: 17, textTransform: 'uppercase' }}>{ch.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{ch.sub}</div>
                    </div>
                    <span className="sd-mono" style={{ fontSize: 9, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{ch.joined}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 12 }}>
                    <div style={{ height: '100%', width: `${ch.progress}%`, background: '#cdfb46', borderRadius: 999 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
                    <span className="sd-mono" style={{ fontSize: 11, color: '#cdfb46', fontWeight: 700 }}>{ch.value}</span>
                    <span className="sd-mono" style={{ fontSize: 11, color: 'var(--muted-2)' }}>{ch.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top movers */}
          <div style={{ marginTop: 24 }}>
            <div className="sd-section-row">
              <h2 className="sd-section">Top movers</h2>
              <span className="sd-meta">THIS WEEK</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              {MOVERS.map((m) => (
                <div key={m.rank} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0c0f11', padding: '13px 16px' }}>
                  <span className="sd-mono" style={{ fontWeight: 800, fontSize: 14, color: '#cdfb46', width: 22 }}>{m.rank}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                    <div className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 1 }}>{m.city}</div>
                  </div>
                  <span className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#fbbf24', marginRight: 12 }}>🔥{m.streak}</span>
                  <span className="sd-mono" style={{ fontWeight: 800, fontSize: 14, width: 50, textAlign: 'right' }}>{m.km}<small style={{ color: 'var(--muted-2)', fontWeight: 400 }}>km</small></span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent finishes */}
          <div style={{ marginTop: 24 }}>
            <div className="sd-section-row">
              <h2 className="sd-section">Recent finishes</h2>
              <span className="sd-meta">NETWORK</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FINISHES.map((f, i) => (
                <div key={i} className="sd-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(205,251,70,0.12)', color: '#cdfb46', display: 'grid', placeItems: 'center', fontWeight: 800, fontFamily: "'Archivo Expanded',sans-serif", flexShrink: 0 }}>{f.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{f.name} <span style={{ color: 'var(--muted-2)', fontWeight: 400 }}>· {f.city}</span></div>
                    <div className="sd-mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{f.detail}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="sd-mono" style={{ fontWeight: 800, fontSize: 13, color: '#cdfb46' }}>{f.reward}</div>
                    <div className="sd-mono" style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>🔥 {f.fire}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Atlas grid */}
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
            <div style={{ gridColumn: '1 / -1', position: 'relative', height: 210, borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'radial-gradient(130% 120% at 70% 20%, rgba(10,46,78,0.5), transparent 55%), #080b0d' }}>
              <div className="sd-grid" style={{ position: 'absolute', inset: 0 }} />
              <div style={{ position: 'absolute', top: 40, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(205,251,70,0.4),transparent 68%)', filter: 'blur(14px)', animation: 'heatPulse 4s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 50, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle,rgba(125,180,230,0.32),transparent 70%)', filter: 'blur(11px)', animation: 'heatPulse 5.5s ease-in-out infinite 0.5s' }} />
              <svg viewBox="0 0 390 210" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <path d="M40,170 C100,130 120,150 160,100 C210,40 270,70 340,30" fill="none" stroke="#cdfb46" strokeWidth="2.6" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(205,251,70,0.9))', strokeDasharray: '8 10', animation: 'flow 7s linear infinite' }} />
                <path d="M30,60 C90,90 120,80 160,140 C210,190 290,170 360,190" fill="none" stroke="#cdfb46" strokeWidth="2" strokeLinecap="round" opacity="0.7" style={{ strokeDasharray: '6 9', animation: 'flow 10s linear infinite' }} />
              </svg>
              <div className="sd-mono" style={{ position: 'absolute', left: 16, top: 14, fontWeight: 700, fontSize: 9, letterSpacing: '0.16em', color: 'rgba(244,246,243,0.55)', textTransform: 'uppercase' }}>Network atlas · 37 cities</div>
              <div className="sd-mono" style={{ position: 'absolute', right: 14, bottom: 14, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 10px', fontWeight: 700, fontSize: 10, color: '#cdfb46' }}>412 ACTIVE</div>
            </div>
            <div className="sd-card-lime" style={{ padding: 17 }}>
              <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: '#cdfb46', textTransform: 'uppercase' }}>Weekly km</div>
              <div className="sd-mono" style={{ fontWeight: 800, fontSize: 32, marginTop: 6, lineHeight: 1 }}>18,640</div>
            </div>
            <div className="sd-card" style={{ padding: 17 }}>
              <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', textTransform: 'uppercase' }}>Completions</div>
              <div className="sd-mono" style={{ fontWeight: 800, fontSize: 32, marginTop: 6, lineHeight: 1 }}>9,421</div>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <h2 className="sd-section" style={{ marginBottom: 12 }}>Top cities</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              {CITIES.map((c) => (
                <div key={c.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#0c0f11', padding: '13px 16px' }}>
                  <span className="sd-mono" style={{ fontWeight: 800, fontSize: 15, color: '#cdfb46', width: 22 }}>{c.rank}</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{c.name}</span>
                  <span className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-2)' }}>{c.users}</span>
                  <span className="sd-mono" style={{ fontWeight: 800, fontSize: 15, width: 58, textAlign: 'right' }}>{c.km}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
