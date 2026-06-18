'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { supabase } from '@/utils/supabase'
import { GuestProfile } from '@/components/landing/types'
import StrideMark from '@/components/StrideMark'
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Activity,
  Ruler,
  Bell,
  Wallet,
  Download,
  Trash2,
  LogOut,
  Check,
  Footprints,
  FlaskConical,
} from 'lucide-react'

type Units = 'km' | 'mi'
interface Prefs {
  sessionReminders: boolean
  weeklyDigest: boolean
  publicProfile: boolean
}

const DEFAULT_PREFS: Prefs = { sessionReminders: true, weeklyDigest: false, publicProfile: true }

export default function SettingsPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Identity
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [activity, setActivity] = useState<'walk' | 'run' | 'both'>('walk')
  const [guestId, setGuestId] = useState<string | null>(null)

  // Preferences
  const [units, setUnits] = useState<Units>('km')
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [demoMode, setDemoMode] = useState(false)

  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(0)

  // ── Load everything from localStorage (and Supabase if connected) ──
  useEffect(() => {
    // Wrapped in a function (not run synchronously in the effect body) to keep
    // state hydration out of the render-cascade lint rule.
    function hydrate() {
      try {
        const raw = localStorage.getItem('stride_guest_profile')
        if (raw) {
          const g = JSON.parse(raw) as GuestProfile
          setGuestId(g.id || null)
          setNickname(g.nickname || '')
          setEmail(g.email || '')
          setCity(g.city && g.city !== 'Unknown' ? g.city : '')
          if (g.activity) setActivity(g.activity)
        }
      } catch {}
      try {
        const u = localStorage.getItem('stride_units') as Units | null
        if (u === 'km' || u === 'mi') setUnits(u)
      } catch {}
      try {
        const p = localStorage.getItem('stride_prefs')
        if (p) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(p) })
      } catch {}
      try {
        setDemoMode(localStorage.getItem('stride_demo_mode') === '1')
      } catch {}
    }
    const id = setTimeout(hydrate, 0)
    return () => clearTimeout(id)
  }, [])

  // If a wallet is connected, pull its saved name/city so the form reflects it.
  useEffect(() => {
    if (!isConnected || !address || !supabase) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await supabase!
          .from('users')
          .select('nickname, city')
          .eq('wallet_address', address)
          .maybeSingle()
        if (cancelled || !data) return
        if (data.nickname) setNickname((n) => n || data.nickname)
        if (data.city && data.city !== 'Unknown') setCity((c) => c || data.city)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [isConnected, address])

  const flashSaved = () => {
    setSavedAt(Date.now())
    setTimeout(() => setSavedAt((t) => (Date.now() - t >= 1800 ? 0 : t)), 2000)
  }

  // ── Persist identity ──
  const saveIdentity = useCallback(async () => {
    if (!nickname.trim()) return
    setSaving(true)
    const nextNick = nickname.trim()
    const nextCity = city.trim() || 'Unknown'

    // Always update the local guest identity — this is the single identity that
    // survives connecting / disconnecting wallets.
    try {
      const id = guestId || (typeof crypto !== 'undefined' && crypto.randomUUID ? `guest_${crypto.randomUUID()}` : `guest_${Date.now()}`)
      const updated: GuestProfile = { id, nickname: nextNick, email: email.trim(), city: nextCity, activity }
      localStorage.setItem('stride_guest_profile', JSON.stringify(updated))
      setGuestId(id)
    } catch {}

    // Mirror to Supabase against the wallet (if connected) and the guest id.
    if (supabase) {
      const rows = [address, guestId].filter(Boolean) as string[]
      for (const key of rows) {
        try {
          await supabase
            .from('users')
            .upsert({ wallet_address: key, nickname: nextNick, city: nextCity }, { onConflict: 'wallet_address' })
        } catch { /* non-fatal */ }
      }
    }
    setSaving(false)
    flashSaved()
  }, [nickname, city, email, activity, guestId, address])

  // ── Persist preferences immediately on change ──
  const updateUnits = (u: Units) => {
    setUnits(u)
    try { localStorage.setItem('stride_units', u) } catch {}
    flashSaved()
  }
  const togglePref = (key: keyof Prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem('stride_prefs', JSON.stringify(next)) } catch {}
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

  const handleConnect = () => {
    if (typeof window !== 'undefined' && !(window as { ethereum?: unknown }).ethereum) {
      alert('No wallet detected. Install MetaMask (or open Stride inside MiniPay) to connect.')
      return
    }
    const injected = connectors.find((c) => c.id === 'injected') || connectors[0]
    if (injected) connect({ connector: injected })
  }

  const exportData = () => {
    const blob = new Blob([
      JSON.stringify({
        profile: { nickname, email, city, activity, guestId },
        units,
        prefs,
        wallet: address || null,
        exportedAt: new Date().toISOString(),
      }, null, 2),
    ], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stride-profile.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetLocal = () => {
    if (!confirm('Reset Stride on this device? This clears your local profile and preferences. On-chain commitments are not affected.')) return
    try {
      localStorage.removeItem('stride_guest_profile')
      localStorage.removeItem('stride_units')
      localStorage.removeItem('stride_prefs')
    } catch {}
    if (isConnected) disconnect()
    router.push('/')
  }

  const signOut = () => {
    if (isConnected) disconnect()
    router.push('/explore')
  }

  const justSaved = savedAt > 0

  return (
    <div className="sd-page" style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={() => router.back()} aria-label="Back" style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line-strong)', color: 'var(--ink)', cursor: 'pointer' }}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="sd-display" style={{ fontSize: 22 }}>Settings</h1>
          <span className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Profile · preferences · account</span>
        </div>
        <span style={{ marginLeft: 'auto', opacity: 0.5 }}><StrideMark size={20} /></span>
      </div>

      {justSaved && (
        <div className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 11, color: '#cdfb46', background: 'rgba(205,251,70,0.1)', border: '1px solid rgba(205,251,70,0.25)', borderRadius: 10, padding: '7px 11px' }}>
          <Check className="h-3 w-3" /> Saved
        </div>
      )}

      {/* ── Identity ── */}
      <Section title="Identity" subtitle="This stays with you across every wallet you connect.">
        <Field icon={<User className="h-4 w-4" />} label="Display name">
          <input className="sd-input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Lagos Strider" />
        </Field>
        <Field icon={<Mail className="h-4 w-4" />} label="Email">
          <input className="sd-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </Field>
        <Field icon={<MapPin className="h-4 w-4" />} label="City">
          <input className="sd-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Lagos" />
        </Field>
        <Field icon={<Activity className="h-4 w-4" />} label="Preferred activity">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['walk', 'run', 'both'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setActivity(a)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  textTransform: 'capitalize',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: activity === a ? '#cdfb46' : 'rgba(255,255,255,0.04)',
                  color: activity === a ? '#06080a' : 'var(--ink)',
                  border: `1px solid ${activity === a ? '#cdfb46' : 'var(--line-strong)'}`,
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </Field>
        <button onClick={saveIdentity} disabled={saving || !nickname.trim()} className="sd-btn sd-btn-lime" style={{ marginTop: 4 }}>
          {saving ? 'Saving…' : 'Save identity'}
        </button>
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
                  textTransform: 'uppercase',
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
        <Toggle icon={<User className="h-4 w-4" />} label="Public profile" desc="Show me on community leaderboards." on={prefs.publicProfile} onClick={() => togglePref('publicProfile')} />
      </Section>

      {/* ── Wallet ── */}
      <Section title="Wallet" subtitle="Connect any wallet — your identity above stays the same.">
        {isConnected && address ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#cdfb46', boxShadow: '0 0 8px #cdfb46' }} />
            <span className="sd-mono" style={{ fontSize: 13 }}>{address.slice(0, 6)}…{address.slice(-4)}</span>
            <button onClick={() => disconnect()} className="sd-btn sd-btn-ghost" style={{ width: 'auto', marginLeft: 'auto', padding: '10px 14px', fontSize: 12 }}>
              <LogOut className="h-3.5 w-3.5" /> Disconnect
            </button>
          </div>
        ) : (
          <button onClick={handleConnect} className="sd-btn sd-btn-dark">
            <Wallet className="h-4 w-4" /> Connect wallet
          </button>
        )}
      </Section>

      {/* ── Developer / testing ── */}
      <Section title="Demo & testing" subtitle="Try the full session flow without an outdoor walk.">
        <Toggle
          icon={<FlaskConical className="h-4 w-4" />}
          label="Demo mode"
          desc="Simulates GPS + auto-meets the goal so you can test ending a session. Turn OFF for real staking — only works in development."
          on={demoMode}
          onClick={toggleDemo}
        />
      </Section>

      {/* ── Data & account ── */}
      <Section title="Data & account">
        <button onClick={exportData} className="sd-btn sd-btn-ghost" style={{ justifyContent: 'flex-start' }}>
          <Download className="h-4 w-4" /> Export my data
        </button>
        <button onClick={resetLocal} className="sd-btn sd-btn-ghost" style={{ justifyContent: 'flex-start', color: '#ff8a8a', borderColor: 'rgba(255,138,138,0.3)' }}>
          <Trash2 className="h-4 w-4" /> Reset this device
        </button>
        <button onClick={signOut} className="sd-btn sd-btn-dark" style={{ justifyContent: 'flex-start' }}>
          <LogOut className="h-4 w-4" /> Sign out
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
