'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import StrideMark from '@/components/StrideMark'
import { APP_NAME } from '@/utils/constants'
import { requestNotificationPermission } from '@/utils/notifications'
import { getStoredLocation, setStoredLocation, clearStoredLocation, captureCurrentLocation, geocodePlace } from '@/utils/location'
import {
  ArrowLeft,
  Ruler,
  Bell,
  Target,
  Coins,
  Download,
  Trash2,
  Check,
  Footprints,
  FlaskConical,
  BookOpen,
  Users,
  Mail,
  User,
  MapPin,
} from 'lucide-react'

type Units = 'km' | 'mi'
interface Prefs {
  sessionReminders: boolean
  weeklyDigest: boolean
  publicProfile: boolean
  showCity: boolean
}
interface Defaults {
  stake: string
  goalKm: number
}

const DEFAULT_PREFS: Prefs = { sessionReminders: true, weeklyDigest: false, publicProfile: true, showCity: true }
const DEFAULT_DEFAULTS: Defaults = { stake: '0.10', goalKm: 3 }
const STAKE_OPTIONS = ['0.01', '0.10', '0.25', '0.50', '1.00']

export default function SettingsPage() {
  const router = useRouter()
  const { address } = useAccount()

  const [units, setUnits] = useState<Units>('km')
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [defaults, setDefaults] = useState<Defaults>(DEFAULT_DEFAULTS)
  const [demoMode, setDemoMode] = useState(false)
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef<NodeJS.Timeout | null>(null)

  // Location
  const [locLabel, setLocLabel] = useState<string>('')
  const [locInput, setLocInput] = useState('')
  const [locBusy, setLocBusy] = useState(false)
  const [locErr, setLocErr] = useState('')

  // ── Hydrate from localStorage (deferred so it doesn't trip the render-cascade rule) ──
  useEffect(() => {
    function hydrate() {
      try {
        const u = localStorage.getItem('stride_units') as Units | null
        if (u === 'km' || u === 'mi') setUnits(u)
      } catch {}
      try {
        const p = localStorage.getItem('stride_prefs')
        if (p) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(p) })
      } catch {}
      try {
        const d = localStorage.getItem('stride_defaults')
        if (d) setDefaults({ ...DEFAULT_DEFAULTS, ...JSON.parse(d) })
      } catch {}
      try {
        setDemoMode(localStorage.getItem('stride_demo_mode') === '1')
      } catch {}
      const loc = getStoredLocation()
      if (loc) setLocLabel(loc.label || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`)
    }
    const id = setTimeout(hydrate, 0)
    return () => clearTimeout(id)
  }, [])

  const useCurrentLocation = async () => {
    setLocErr(''); setLocBusy(true)
    const loc = await captureCurrentLocation()
    setLocBusy(false)
    if (!loc) { setLocErr('Could not read your GPS location. Allow location access, or type a place below.'); return }
    setStoredLocation(loc)
    setLocLabel(loc.label || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`)
    flashSaved()
  }

  const setTypedLocation = async () => {
    if (!locInput.trim() || locBusy) return
    setLocErr(''); setLocBusy(true)
    const loc = await geocodePlace(locInput)
    setLocBusy(false)
    if (!loc) { setLocErr('Couldn’t find that place. Try a city, an address, or "lat, lng".'); return }
    setStoredLocation(loc)
    setLocLabel(loc.label || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`)
    setLocInput('')
    flashSaved()
  }

  const clearLocation = () => { clearStoredLocation(); setLocLabel(''); flashSaved() }

  const flashSaved = () => {
    setSaved(true)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaved(false), 1800)
  }

  const updateUnits = (u: Units) => {
    setUnits(u)
    try { localStorage.setItem('stride_units', u) } catch {}
    flashSaved()
  }
  const togglePref = (key: keyof Prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem('stride_prefs', JSON.stringify(next)) } catch {}
      // Turning a notification pref ON → ask for browser permission now.
      if (!prev[key] && (key === 'sessionReminders' || key === 'weeklyDigest')) requestNotificationPermission()
      return next
    })
    flashSaved()
  }
  const updateDefaults = (patch: Partial<Defaults>) => {
    setDefaults((prev) => {
      const next = { ...prev, ...patch }
      try { localStorage.setItem('stride_defaults', JSON.stringify(next)) } catch {}
      return next
    })
    flashSaved()
  }
  const toggleDemo = () => {
    setDemoMode((prev) => {
      const next = !prev
      try { localStorage.setItem('stride_demo_mode', next ? '1' : '0') } catch {}
      return next
    })
    flashSaved()
  }

  const exportData = () => {
    let profile: unknown = null
    try { profile = JSON.parse(localStorage.getItem('stride_guest_profile') || 'null') } catch {}
    const blob = new Blob([
      JSON.stringify({ profile, units, prefs, defaults, wallet: address || null, exportedAt: new Date().toISOString() }, null, 2),
    ], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stride-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetLocal = () => {
    if (!confirm('Reset Stride on this device? This clears your local profile and preferences. On-chain commitments are not affected.')) return
    try {
      localStorage.removeItem('stride_guest_profile')
      localStorage.removeItem('stride_units')
      localStorage.removeItem('stride_prefs')
      localStorage.removeItem('stride_defaults')
      localStorage.removeItem('stride_demo_mode')
    } catch {}
    router.push('/')
  }

  const justSaved = saved

  return (
    <div className="sd-page" style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={() => router.back()} aria-label="Back" style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line-strong)', color: 'var(--ink)', cursor: 'pointer' }}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="sd-display" style={{ fontSize: 22 }}>Settings</h1>
          <span className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preferences & app</span>
        </div>
        <span style={{ marginLeft: 'auto', opacity: 0.5 }}><StrideMark size={20} /></span>
      </div>

      {justSaved && (
        <div className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 11, color: '#cdfb46', background: 'rgba(205,251,70,0.1)', border: '1px solid rgba(205,251,70,0.25)', borderRadius: 10, padding: '7px 11px' }}>
          <Check className="h-3 w-3" /> Saved
        </div>
      )}

      {/* ── Commitment defaults ── */}
      <Section title="Commitment defaults" subtitle="Pre-fill the new-commitment screen so you start faster.">
        <Field icon={<Coins className="h-4 w-4" />} label="Default stake (USDm)">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STAKE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => updateDefaults({ stake: s })}
                className="sd-mono"
                style={{
                  flex: '1 0 auto',
                  minWidth: 56,
                  padding: '11px 4px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: defaults.stake === s ? '#cdfb46' : 'rgba(255,255,255,0.04)',
                  color: defaults.stake === s ? '#06080a' : 'var(--ink)',
                  border: `1px solid ${defaults.stake === s ? '#cdfb46' : 'var(--line-strong)'}`,
                }}
              >
                ${s}
              </button>
            ))}
          </div>
        </Field>
        <Field icon={<Target className="h-4 w-4" />} label={`Default distance goal — ${defaults.goalKm} km`}>
          <input
            type="range"
            min={0.5}
            max={21}
            step={0.5}
            value={defaults.goalKm}
            onChange={(e) => updateDefaults({ goalKm: Number(e.target.value) })}
            style={{ width: '100%', accentColor: '#cdfb46' }}
          />
        </Field>
      </Section>

      {/* ── Location ── */}
      <Section title="Your location" subtitle="Pins where the map and demo sessions start — useful on desktop where GPS is rough.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: locLabel ? 'var(--ink)' : 'var(--muted)' }}>
          <MapPin className="h-4 w-4" style={{ color: '#cdfb46', flexShrink: 0 }} />
          {locLabel ? <span>{locLabel}</span> : <span>No location set — using your device GPS / default.</span>}
        </div>
        <button onClick={useCurrentLocation} disabled={locBusy} className="sd-btn sd-btn-lime" style={{ marginTop: 4 }}>
          {locBusy ? 'Locating…' : 'Use my current GPS location'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="sd-input" value={locInput} onChange={(e) => setLocInput(e.target.value)} placeholder='City, address, or "lat, lng"' onKeyDown={(e) => { if (e.key === 'Enter') setTypedLocation() }} />
          <button onClick={setTypedLocation} disabled={locBusy || !locInput.trim()} className="sd-btn sd-btn-ghost" style={{ width: 'auto', flexShrink: 0, padding: '0 18px' }}>Set</button>
        </div>
        {locErr && <p style={{ fontSize: 12, color: '#fb7185', lineHeight: 1.4 }}>{locErr}</p>}
        {locLabel && <button onClick={clearLocation} className="sd-btn sd-btn-ghost" style={{ fontSize: 12, padding: 10 }}>Clear saved location</button>}
      </Section>

      {/* ── Units ── */}
      <Section title="Units" subtitle="How distances show across the app.">
        <Field icon={<Ruler className="h-4 w-4" />} label="Distance">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['km', 'mi'] as const).map((u) => (
              <button
                key={u}
                onClick={() => updateUnits(u)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: units === u ? '#cdfb46' : 'rgba(255,255,255,0.04)',
                  color: units === u ? '#06080a' : 'var(--ink)',
                  border: `1px solid ${units === u ? '#cdfb46' : 'var(--line-strong)'}`,
                }}
              >
                {u === 'km' ? 'Kilometres' : 'Miles'}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* ── Notifications ── */}
      <Section title="Notifications" subtitle="Reminders to keep your streak alive.">
        <Toggle icon={<Bell className="h-4 w-4" />} label="Session reminders" desc="Nudge me when a commitment deadline is near." on={prefs.sessionReminders} onClick={() => togglePref('sessionReminders')} />
        <Toggle icon={<Footprints className="h-4 w-4" />} label="Weekly digest" desc="A Sunday recap of my distance & earnings." on={prefs.weeklyDigest} onClick={() => togglePref('weeklyDigest')} />
      </Section>

      {/* ── Privacy ── */}
      <Section title="Privacy" subtitle="What others see about you in the community.">
        <Toggle icon={<User className="h-4 w-4" />} label="Public profile" desc="Show me on community leaderboards." on={prefs.publicProfile} onClick={() => togglePref('publicProfile')} />
        <Toggle icon={<MapPin className="h-4 w-4" />} label="Show my city" desc="Display my city alongside my name publicly." on={prefs.showCity} onClick={() => togglePref('showCity')} />
      </Section>

      {/* ── Demo / testing ── */}
      <Section title="Demo & testing" subtitle="Try the full session flow without an outdoor walk.">
        <Toggle
          icon={<FlaskConical className="h-4 w-4" />}
          label="Demo mode"
          desc="Simulates GPS + auto-meets the goal so you can test ending a session. Turn OFF for real staking — only works in development."
          on={demoMode}
          onClick={toggleDemo}
        />
      </Section>

      {/* ── About ── */}
      <Section title="About">
        <LinkRow icon={<BookOpen className="h-4 w-4" />} label="Guides & coaching" onClick={() => router.push('/content')} />
        <LinkRow icon={<Users className="h-4 w-4" />} label="Community" onClick={() => router.push('/community')} />
        <LinkRow icon={<Mail className="h-4 w-4" />} label="Contact support" onClick={() => { window.location.href = 'mailto:support@stride.app' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
          <span style={{ fontSize: 13, color: 'var(--muted-2)' }}>{APP_NAME}</span>
          <span className="sd-mono" style={{ fontSize: 11, color: 'var(--muted-3)' }}>Celo mainnet · v1.0</span>
        </div>
      </Section>

      {/* ── Data ── */}
      <Section title="Data">
        <button onClick={exportData} className="sd-btn sd-btn-ghost" style={{ justifyContent: 'flex-start' }}>
          <Download className="h-4 w-4" /> Export my data
        </button>
        <button onClick={resetLocal} className="sd-btn sd-btn-ghost" style={{ justifyContent: 'flex-start', color: '#ff8a8a', borderColor: 'rgba(255,138,138,0.3)' }}>
          <Trash2 className="h-4 w-4" /> Reset this device
        </button>
      </Section>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="sd-card" style={{ padding: 18, marginBottom: 14 }}>
      <h2 className="sd-display" style={{ fontSize: 15, marginBottom: subtitle ? 2 : 12 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--muted-2)', marginBottom: 14 }}>{subtitle}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  )
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>
        <span style={{ color: '#cdfb46' }}>{icon}</span> {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({ icon, label, desc, on, onClick }: { icon: React.ReactNode; label: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
      <span style={{ color: '#cdfb46', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
        <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted-2)', marginTop: 1 }}>{desc}</span>
      </span>
      <span style={{ width: 44, height: 26, borderRadius: 999, flexShrink: 0, position: 'relative', transition: 'background 0.15s', background: on ? '#cdfb46' : 'rgba(255,255,255,0.12)', border: `1px solid ${on ? '#cdfb46' : 'var(--line-strong)'}` }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: on ? '#06080a' : '#f4f6f3', transition: 'left 0.15s' }} />
      </span>
    </button>
  )
}

function LinkRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 0, padding: '2px 0', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
      <span style={{ color: '#cdfb46', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
      <span style={{ color: 'var(--muted-2)', fontSize: 18, lineHeight: 1 }}>›</span>
    </button>
  )
}
