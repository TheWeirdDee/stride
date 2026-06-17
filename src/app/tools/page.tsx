'use client'

import { useState } from 'react'
import { Gauge, Flame, Scale, Target } from 'lucide-react'
import AskAI from '@/components/AskAI'

const LABEL: React.CSSProperties = { display: 'block', fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted-2)', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }
const NUM: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace" }

function SectionHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(205,251,70,0.12)', color: '#cdfb46', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <h2 style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 800, fontSize: 16, textTransform: 'uppercase' }}>{title}</h2>
        <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</p>
      </div>
    </div>
  )
}

function Result({ value, unit, note }: { value: string; unit?: string; note?: string }) {
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
      <div style={NUM as React.CSSProperties}>
        <span style={{ fontWeight: 800, fontSize: 30, color: '#cdfb46' }}>{value}</span>
        {unit && <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 6 }}>{unit}</span>}
      </div>
      {note && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{note}</div>}
    </div>
  )
}

function PaceCalc() {
  const [dist, setDist] = useState('5')
  const [mins, setMins] = useState('30')
  const d = parseFloat(dist) || 0
  const m = parseFloat(mins) || 0
  const paceMin = d > 0 ? m / d : 0
  const paceStr = paceMin > 0 ? `${Math.floor(paceMin)}:${String(Math.round((paceMin % 1) * 60)).padStart(2, '0')}` : '—:—'
  const speed = m > 0 ? (d / (m / 60)).toFixed(2) : '0.00'
  return (
    <div className="sd-card" style={{ padding: 18 }}>
      <SectionHead icon={<Gauge className="h-5 w-5" />} title="Pace calculator" sub="Distance + time → pace and speed" />
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}><label style={LABEL}>Distance (km)</label><input className="sd-input sd-mono" type="number" value={dist} onChange={(e) => setDist(e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={LABEL}>Time (min)</label><input className="sd-input sd-mono" type="number" value={mins} onChange={(e) => setMins(e.target.value)} /></div>
      </div>
      <Result value={paceStr} unit="min/km" note={`Average speed ${speed} km/h`} />
    </div>
  )
}

function BurnCalc() {
  const ACTS = [{ k: 'walk', label: 'Walk', met: 3.5 }, { k: 'brisk', label: 'Brisk walk', met: 5.0 }, { k: 'run', label: 'Run', met: 9.8 }]
  const [act, setAct] = useState('walk')
  const [weight, setWeight] = useState('70')
  const [dur, setDur] = useState('30')
  const met = ACTS.find((a) => a.k === act)?.met || 3.5
  const w = parseFloat(weight) || 0
  const min = parseFloat(dur) || 0
  const kcal = Math.round(met * w * (min / 60))
  return (
    <div className="sd-card" style={{ padding: 18 }}>
      <SectionHead icon={<Flame className="h-5 w-5" />} title="Calories burned" sub="MET-based estimate for your session" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {ACTS.map((a) => (
          <button key={a.k} onClick={() => setAct(a.k)} className="sd-mono" style={{ flex: 1, padding: 10, borderRadius: 11, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', background: act === a.k ? '#cdfb46' : 'rgba(255,255,255,0.04)', color: act === a.k ? '#06080a' : 'var(--muted)', border: act === a.k ? '1px solid #cdfb46' : '1px solid var(--line-strong)' }}>{a.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}><label style={LABEL}>Weight (kg)</label><input className="sd-input sd-mono" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={LABEL}>Duration (min)</label><input className="sd-input sd-mono" type="number" value={dur} onChange={(e) => setDur(e.target.value)} /></div>
      </div>
      <Result value={kcal.toLocaleString()} unit="kcal" note="Rough estimate; actual burn varies by terrain and effort." />
    </div>
  )
}

function BmiCalc() {
  const [h, setH] = useState('170')
  const [w, setW] = useState('70')
  // Auto-detect the height unit by magnitude: a value of 10 or below is treated
  // as feet (e.g. 5.8 ft), anything larger as centimetres (e.g. 170 cm).
  const hRaw = parseFloat(h) || 0
  const hUnit: 'ft' | 'cm' = hRaw > 0 && hRaw <= 10 ? 'ft' : 'cm'
  const hm = hUnit === 'ft' ? hRaw * 0.3048 : hRaw / 100
  const wk = parseFloat(w) || 0
  const bmi = hm > 0 ? wk / (hm * hm) : 0
  const cat = bmi === 0 ? '—' : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese'
  const lo = hm > 0 ? (18.5 * hm * hm).toFixed(1) : '0'
  const hi = hm > 0 ? (24.9 * hm * hm).toFixed(1) : '0'
  return (
    <div className="sd-card" style={{ padding: 18 }}>
      <SectionHead icon={<Scale className="h-5 w-5" />} title="BMI & metrics" sub="Enter height in cm (e.g. 170) or feet (e.g. 5.8) — auto-detected" />
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={LABEL}>Height (cm or ft)</label>
          <input className="sd-input sd-mono" type="number" value={h} onChange={(e) => setH(e.target.value)} />
          {hRaw > 0 && <div className="sd-mono" style={{ fontSize: 9, color: 'var(--muted-2)', marginTop: 4 }}>Read as {hUnit === 'ft' ? `${hRaw} ft (${(hm * 100).toFixed(0)} cm)` : `${hRaw} cm`}</div>}
        </div>
        <div style={{ flex: 1 }}><label style={LABEL}>Weight (kg)</label><input className="sd-input sd-mono" type="number" value={w} onChange={(e) => setW(e.target.value)} /></div>
      </div>
      <Result value={bmi ? bmi.toFixed(1) : '—'} unit={cat} note={hm > 0 ? `Healthy weight for your height: ${lo}–${hi} kg` : undefined} />
    </div>
  )
}

function GoalPlanner() {
  const [current, setCurrent] = useState('10')
  const [target, setTarget] = useState('25')
  const c = parseFloat(current) || 0
  const t = parseFloat(target) || 0
  const weeks: { week: number; km: number }[] = []
  if (c > 0 && t > c) {
    let km = c
    let wk = 0
    while (km < t && wk < 26) {
      wk += 1
      km = Math.min(t, km * 1.1) // safe 10%/week progression
      weeks.push({ week: wk, km: Math.round(km * 10) / 10 })
    }
  }
  return (
    <div className="sd-card" style={{ padding: 18 }}>
      <SectionHead icon={<Target className="h-5 w-5" />} title="Goal planner" sub="A safe 10%-per-week weekly-distance ramp" />
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}><label style={LABEL}>Now (km/wk)</label><input className="sd-input sd-mono" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={LABEL}>Target (km/wk)</label><input className="sd-input sd-mono" type="number" value={target} onChange={(e) => setTarget(e.target.value)} /></div>
      </div>
      {weeks.length > 0 ? (
        <>
          <Result value={`${weeks.length}`} unit={weeks.length === 1 ? 'week' : 'weeks'} note="to reach your target safely" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {weeks.map((wk) => (
              <span key={wk.week} className="sd-mono" style={{ fontSize: 11, padding: '5px 9px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>W{wk.week}: {wk.km}km</span>
            ))}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>Set a target higher than your current weekly distance.</div>
      )}
    </div>
  )
}

export default function ToolsPage() {
  return (
    <div className="sd-page">
      <div className="sd-eyebrow">Utilities</div>
      <h1 className="sd-display" style={{ fontSize: 34, marginTop: 12 }}>Tools</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10, marginBottom: 22 }}>Calculators and AI helpers for training, health, and goals.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AskAI
          mode="calories"
          title="Calorie counter"
          subtitle="Describe a meal and get a calorie estimate."
          placeholder="e.g. a plate of jollof rice with chicken"
          cta="Estimate calories"
        />
        <PaceCalc />
        <BurnCalc />
        <BmiCalc />
        <GoalPlanner />
      </div>
    </div>
  )
}
