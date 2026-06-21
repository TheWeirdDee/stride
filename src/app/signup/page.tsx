'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StrideMark from '@/components/StrideMark'
import { signUpWithProfile, type Activity } from '@/utils/auth'
import { User, Mail, Lock, MapPin, Activity as ActivityIcon, AlertCircle, ArrowRight, Eye, EyeOff, MailCheck } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  const [activity, setActivity] = useState<Activity>('walk')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmEmail, setConfirmEmail] = useState(false)

  const usernameOk = /^[a-zA-Z0-9_]{3,20}$/.test(username.trim())
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
  const pwOk = password.length >= 6
  const ready = usernameOk && emailOk && pwOk

  const submit = async () => {
    if (!ready || busy) return
    setBusy(true)
    setError('')
    const res = await signUpWithProfile({ username, email, password, city, activity })
    setBusy(false)
    if (!res.ok) { setError(res.error || 'Could not create your account.'); return }
    if (res.needsConfirmation) { setConfirmEmail(true); return }
    await askLocation()
    router.push('/explore')
  }

  // Prompt for live location right after signup so the permission is primed and
  // sessions can track straight away. Non-blocking past a short timeout; if the
  // user only allows "once", the session screen will ask again when needed.
  const askLocation = () => new Promise<void>((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve()
    let done = false
    const finish = () => { if (!done) { done = true; resolve() } }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try { localStorage.setItem('stride_last_location', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude, at: Date.now() })) } catch {}
        finish()
      },
      () => finish(),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
    setTimeout(finish, 11000)
  })

  if (confirmEmail) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
        <div style={{ width: 84, height: 84, borderRadius: 26, background: '#cdfb46', display: 'grid', placeItems: 'center', marginBottom: 22 }}>
          <MailCheck className="h-10 w-10" style={{ color: '#06080a' }} />
        </div>
        <h1 className="sd-display" style={{ fontSize: 28 }}>Check your email</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12, maxWidth: 300 }}>
          We sent a confirmation link to <b style={{ color: 'var(--ink)' }}>{email}</b>. Confirm it, then log in.
        </p>
        <Link href="/login" className="sd-btn sd-btn-lime" style={{ maxWidth: 260, marginTop: 26 }}>Go to login</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '28px 22px 40px', maxWidth: 480, margin: '0 auto' }}>
      <Link href="/" className="sd-logo" style={{ marginBottom: 26 }}>
        <span className="sd-logo-mark"><StrideMark size={16} /></span>
        <span className="sd-logo-word">STRIDE</span>
      </Link>

      <div className="sd-eyebrow">Create your account</div>
      <h1 className="sd-display" style={{ fontSize: 32, marginTop: 8 }}>Join the<br />movement</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10, marginBottom: 22 }}>One account, any wallet. Stake, move, earn.</p>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', borderRadius: 12, padding: '11px 13px', marginBottom: 16, fontSize: 13 }}>
          <AlertCircle className="h-4 w-4" style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Labeled icon={<User className="h-4 w-4" />} label="Username">
          <input className="sd-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="lagos_strider" autoCapitalize="none" autoComplete="username" />
          {username && !usernameOk && <Hint>3–20 letters, numbers or underscores.</Hint>}
        </Labeled>

        <Labeled icon={<Mail className="h-4 w-4" />} label="Email">
          <input className="sd-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
        </Labeled>

        <Labeled icon={<Lock className="h-4 w-4" />} label="Password">
          <div style={{ position: 'relative' }}>
            <input className="sd-input" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" style={{ paddingRight: 46 }} />
            <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--muted-2)', cursor: 'pointer' }}>
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Labeled>

        <Labeled icon={<MapPin className="h-4 w-4" />} label="City — optional">
          <input className="sd-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Lagos" />
        </Labeled>

        <Labeled icon={<ActivityIcon className="h-4 w-4" />} label="I prefer">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['walk', 'run', 'both'] as const).map((a) => (
              <button key={a} type="button" onClick={() => setActivity(a)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, textTransform: 'capitalize', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: activity === a ? '#cdfb46' : 'rgba(255,255,255,0.04)', color: activity === a ? '#06080a' : 'var(--ink)', border: `1px solid ${activity === a ? '#cdfb46' : 'var(--line-strong)'}` }}>{a}</button>
            ))}
          </div>
        </Labeled>
      </div>

      <button onClick={submit} disabled={!ready || busy} className="sd-btn sd-btn-lime" style={{ marginTop: 22 }}>
        {busy ? 'Creating account…' : <>Create account <ArrowRight className="h-4 w-4" /></>}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 18 }}>
        Already have an account? <Link href="/login" style={{ color: '#cdfb46', fontWeight: 700 }}>Log in</Link>
      </p>
    </div>
  )
}

function Labeled({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>
        <span style={{ color: '#cdfb46' }}>{icon}</span> {label}
      </label>
      {children}
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, color: 'var(--muted-3)', marginTop: 6 }}>{children}</p>
}
