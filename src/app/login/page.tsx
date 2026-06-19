'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StrideMark from '@/components/StrideMark'
import { loginWithIdentifier } from '@/utils/auth'
import { User, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const ready = identifier.trim().length >= 3 && password.length >= 1

  const submit = async () => {
    if (!ready || busy) return
    setBusy(true)
    setError('')
    const res = await loginWithIdentifier(identifier, password, remember)
    setBusy(false)
    if (!res.ok) { setError(res.error || 'Login failed.'); return }
    router.push('/explore')
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '28px 22px 40px', maxWidth: 480, margin: '0 auto' }}>
      <Link href="/" className="sd-logo" style={{ marginBottom: 26 }}>
        <span className="sd-logo-mark"><StrideMark size={16} /></span>
        <span className="sd-logo-word">STRIDE</span>
      </Link>

      <div className="sd-eyebrow">Welcome back</div>
      <h1 className="sd-display" style={{ fontSize: 32, marginTop: 8 }}>Log in<br />and move</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10, marginBottom: 22 }}>Pick up your streak where you left off.</p>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', borderRadius: 12, padding: '11px 13px', marginBottom: 16, fontSize: 13 }}>
          <AlertCircle className="h-4 w-4" style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Labeled icon={<User className="h-4 w-4" />} label="Username or email">
          <input className="sd-input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="lagos_strider or you@email.com" autoCapitalize="none" autoComplete="username"
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
        </Labeled>

        <Labeled icon={<Lock className="h-4 w-4" />} label="Password">
          <div style={{ position: 'relative' }}>
            <input className="sd-input" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" style={{ paddingRight: 46 }}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
            <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--muted-2)', cursor: 'pointer' }}>
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Labeled>
      </div>

      <button onClick={() => setRemember((r) => !r)} type="button" style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 0, padding: 0, marginTop: 16, cursor: 'pointer' }}>
        <span style={{ width: 20, height: 20, borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0, background: remember ? '#cdfb46' : 'transparent', border: `1.5px solid ${remember ? '#cdfb46' : 'var(--line-strong)'}` }}>
          {remember && <Check className="h-3 w-3" style={{ color: '#06080a' }} />}
        </span>
        <span style={{ fontSize: 13, color: 'var(--ink)' }}>Remember me on this device</span>
      </button>

      <button onClick={submit} disabled={!ready || busy} className="sd-btn sd-btn-lime" style={{ marginTop: 22 }}>
        {busy ? 'Logging in…' : <>Log in <ArrowRight className="h-4 w-4" /></>}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 18 }}>
        New to Stride? <Link href="/signup" style={{ color: '#cdfb46', fontWeight: 700 }}>Create an account</Link>
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
