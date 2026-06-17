'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ArrowLeft, RefreshCw, Trophy, Users, Flag } from 'lucide-react'
import {
  type Challenge,
  type ChallengeParticipant,
  fetchChallenge,
  fetchParticipants,
  joinChallenge,
  closeChallenge,
  computeProgressMeters,
  syncParticipantProgress,
  getMemberId,
} from '@/utils/challenges'

export default function ChallengeDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { address } = useAccount()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([])
  const [myId, setMyId] = useState<string | null>(null)
  const [myProgress, setMyProgress] = useState(0)
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const ch = await fetchChallenge(id)
    setChallenge(ch)
    if (ch) {
      const parts = await fetchParticipants(ch.id)
      setParticipants(parts)
      const mid = getMemberId(address)
      setMyId(mid)
      if (mid) {
        const mine = parts.find((p) => p.wallet_address === mid)
        setJoined(!!mine)
        const prog = await computeProgressMeters(mid, ch.starts_at, ch.ends_at)
        setMyProgress(prog)
        if (mine) await syncParticipantProgress(ch, mid)
      }
    }
    setLoading(false)
  }, [id, address])

  useEffect(() => {
    load()
  }, [load])

  const handleJoin = async () => {
    if (!challenge) return
    const mid = getMemberId(address)
    if (!mid) {
      alert('Connect a wallet or set up a profile to join.')
      return
    }
    setBusy(true)
    await joinChallenge(challenge.id, mid)
    setBusy(false)
    load()
  }

  const handleClose = async () => {
    if (!challenge) return
    if (!confirm('Close this challenge for everyone? This marks it complete.')) return
    setBusy(true)
    await closeChallenge(challenge.id)
    setBusy(false)
    load()
  }

  if (loading) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw className="h-8 w-8" style={{ color: '#cdfb46', animation: 'spin 0.9s linear infinite', marginBottom: 16 }} />
        <p style={{ color: 'var(--muted)' }}>Loading challenge…</p>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <h2 className="sd-display" style={{ fontSize: 24 }}>Challenge<br />not found</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '10px 0 22px' }}>It may have been closed or removed.</p>
        <button onClick={() => router.push('/community')} className="sd-btn sd-btn-ghost" style={{ maxWidth: 240 }}>Back to community</button>
      </div>
    )
  }

  const isCreator = !!myId && challenge.creator_wallet === myId
  const goalKm = challenge.goal_value / 1000
  const myKm = myProgress / 1000
  const myPct = Math.min(100, challenge.goal_value > 0 ? (myProgress / challenge.goal_value) * 100 : 0)
  const myDone = myProgress >= challenge.goal_value
  const daysLeft = challenge.ends_at ? Math.max(0, Math.ceil((new Date(challenge.ends_at).getTime() - Date.now()) / 86_400_000)) : null
  const completedCount = participants.filter((p) => p.completed_at).length

  return (
    <div className="sd-page">
      <button onClick={() => router.push('/community')} className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 0, color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Community
      </button>

      {/* Header card */}
      <div className="sd-card" style={{ overflow: 'hidden' }}>
        {challenge.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={challenge.cover_url} alt={challenge.title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
        )}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="sd-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#cdfb46' }}>{challenge.activity}</span>
            <span className="sd-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: challenge.status === 'active' ? 'var(--muted-2)' : '#fbbf24' }}>· {challenge.status}</span>
          </div>
          <h1 className="sd-display" style={{ fontSize: 28, marginTop: 8 }}>{challenge.title}</h1>
          {challenge.description && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>{challenge.description}</p>}
          <div style={{ display: 'flex', gap: 18, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
            <div>
              <div className="sd-mono" style={{ fontWeight: 800, fontSize: 20 }}>{goalKm.toFixed(0)}<small style={{ color: 'var(--muted-2)', fontSize: 11 }}>km</small></div>
              <div className="sd-mono" style={{ fontSize: 9, color: 'var(--muted-2)', textTransform: 'uppercase', marginTop: 2 }}>Goal</div>
            </div>
            <div>
              <div className="sd-mono" style={{ fontWeight: 800, fontSize: 20 }}>{participants.length}</div>
              <div className="sd-mono" style={{ fontSize: 9, color: 'var(--muted-2)', textTransform: 'uppercase', marginTop: 2 }}>Joined</div>
            </div>
            <div>
              <div className="sd-mono" style={{ fontWeight: 800, fontSize: 20 }}>{daysLeft ?? '—'}</div>
              <div className="sd-mono" style={{ fontSize: 9, color: 'var(--muted-2)', textTransform: 'uppercase', marginTop: 2 }}>Days left</div>
            </div>
          </div>
        </div>
      </div>

      {myId && (
        <div className="sd-card-lime sd-card-glow" style={{ padding: 18, marginTop: 14 }}>
          <div className="sd-mono" style={{ position: 'relative', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#cdfb46' }}>Your progress</div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
            <span className="sd-mono" style={{ fontWeight: 800, fontSize: 34 }}>{myKm.toFixed(1)}</span>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>/ {goalKm.toFixed(0)} km</span>
            {myDone && <span className="sd-mono" style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: '#06080a', background: '#cdfb46', padding: '3px 8px', borderRadius: 999 }}>DONE</span>}
          </div>
          <div style={{ position: 'relative', height: 6, borderRadius: 999, background: 'rgba(0,0,0,0.3)', overflow: 'hidden', marginTop: 12 }}>
            <div style={{ height: '100%', width: `${myPct}%`, background: '#cdfb46', borderRadius: 999 }} />
          </div>
          {!joined && challenge.status === 'active' && (
            <button onClick={handleJoin} disabled={busy} className="sd-btn sd-btn-dark" style={{ marginTop: 14, fontSize: 13, padding: 12 }}>Join challenge</button>
          )}
        </div>
      )}

      {/* Creator controls */}
      {isCreator && challenge.status === 'active' && (
        <div className="sd-card" style={{ padding: 16, marginTop: 14 }}>
          <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Flag className="h-3.5 w-3.5" /> Creator controls</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>You created this challenge. Close it to mark it complete for everyone.</p>
          <button onClick={handleClose} disabled={busy} className="sd-btn sd-btn-lime" style={{ fontSize: 13, padding: 12 }}>{busy ? 'Working…' : 'Mark complete & close'}</button>
        </div>
      )}

      {/* Participants */}
      <div className="sd-section-row" style={{ marginTop: 26 }}>
        <h2 className="sd-section">Participants</h2>
        <span className="sd-meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users className="h-3 w-3" /> {completedCount} done</span>
      </div>
      {participants.length === 0 ? (
        <div className="sd-card" style={{ textAlign: 'center', padding: 24, borderStyle: 'dashed', fontSize: 13, color: 'var(--muted)' }}>No one has joined yet — be the first.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {participants.map((p, i) => {
            const isMe = p.wallet_address === myId
            const km = (p.progress || 0) / 1000
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0c0f11', padding: '13px 16px' }}>
                <span className="sd-mono" style={{ fontWeight: 800, fontSize: 13, color: '#cdfb46', width: 22 }}>{String(i + 1).padStart(2, '0')}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    {p.wallet_address.startsWith('guest_') ? 'Guest mover' : `${p.wallet_address.slice(0, 6)}…${p.wallet_address.slice(-4)}`}
                    {isMe && <span className="sd-mono" style={{ fontSize: 8, marginLeft: 6, color: '#cdfb46' }}>YOU</span>}
                  </div>
                </div>
                {p.completed_at && <Trophy className="h-3.5 w-3.5" style={{ color: '#cdfb46' }} />}
                <span className="sd-mono" style={{ fontWeight: 800, fontSize: 13, width: 56, textAlign: 'right' }}>{km.toFixed(1)}<small style={{ color: 'var(--muted-2)', fontWeight: 400 }}>km</small></span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
