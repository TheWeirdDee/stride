'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ArrowLeft, RefreshCw, Users, Trash2 } from 'lucide-react'
import {
  type Group,
  type GroupMember,
  fetchGroup,
  fetchMembers,
  joinGroup,
  leaveGroup,
  deleteGroup,
} from '@/utils/groups'
import { getMemberId } from '@/utils/challenges'

export default function GroupDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { address } = useAccount()

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [myId, setMyId] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const g = await fetchGroup(id)
    setGroup(g)
    if (g) {
      const mem = await fetchMembers(g.id)
      setMembers(mem)
      const mid = getMemberId(address)
      setMyId(mid)
      setJoined(!!mid && mem.some((m) => m.wallet_address === mid))
    }
    setLoading(false)
  }, [id, address])

  useEffect(() => {
    load()
  }, [load])

  const handleJoinToggle = async () => {
    if (!group) return
    const mid = getMemberId(address)
    if (!mid) {
      alert('Connect a wallet or set up a profile to join.')
      return
    }
    setBusy(true)
    if (joined) await leaveGroup(group.id, mid)
    else await joinGroup(group.id, mid)
    setBusy(false)
    load()
  }

  const handleDelete = async () => {
    if (!group) return
    if (!confirm('Delete this group? This cannot be undone.')) return
    setBusy(true)
    await deleteGroup(group.id)
    setBusy(false)
    router.push('/community')
  }

  if (loading) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw className="h-8 w-8" style={{ color: '#cdfb46', animation: 'spin 0.9s linear infinite', marginBottom: 16 }} />
        <p style={{ color: 'var(--muted)' }}>Loading group…</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <h2 className="sd-display" style={{ fontSize: 24 }}>Group<br />not found</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '10px 0 22px' }}>It may have been removed.</p>
        <button onClick={() => router.push('/community')} className="sd-btn sd-btn-ghost" style={{ maxWidth: 240 }}>Back to community</button>
      </div>
    )
  }

  const isCreator = !!myId && group.creator_wallet === myId

  return (
    <div className="sd-page">
      <button onClick={() => router.push('/community')} className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 0, color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Community
      </button>

      <div className="sd-card" style={{ overflow: 'hidden' }}>
        {group.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={group.cover_url} alt={group.name} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
        )}
        <div style={{ padding: 20 }}>
          <span className="sd-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#cdfb46' }}>{group.activity} group</span>
          <h1 className="sd-display" style={{ fontSize: 28, marginTop: 8 }}>{group.name}</h1>
          {group.description && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>{group.description}</p>}
          <div className="sd-mono" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, fontSize: 12, color: 'var(--muted-2)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users className="h-3.5 w-3.5" /> {members.length} members</span>
            {group.city && <span>· {group.city}</span>}
          </div>
          <button onClick={handleJoinToggle} disabled={busy} className={`sd-btn ${joined ? 'sd-btn-ghost' : 'sd-btn-lime'}`} style={{ marginTop: 16, fontSize: 13, padding: 13 }}>
            {busy ? 'Working…' : joined ? 'Leave group' : 'Join group'}
          </button>
        </div>
      </div>

      {isCreator && (
        <button onClick={handleDelete} disabled={busy} className="sd-mono" style={{ width: '100%', marginTop: 12, padding: 11, borderRadius: 12, background: 'transparent', border: '1px solid var(--line)', color: '#fb7185', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Trash2 className="h-3.5 w-3.5" /> Delete group
        </button>
      )}

      <div className="sd-section-row" style={{ marginTop: 26 }}>
        <h2 className="sd-section">Members</h2>
        <span className="sd-meta">{members.length}</span>
      </div>
      {members.length === 0 ? (
        <div className="sd-card" style={{ textAlign: 'center', padding: 24, borderStyle: 'dashed', fontSize: 13, color: 'var(--muted)' }}>No members yet — be the first to join.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {members.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0c0f11', padding: '13px 16px' }}>
              <span className="sd-mono" style={{ fontWeight: 800, fontSize: 13, color: '#cdfb46', width: 22 }}>{String(i + 1).padStart(2, '0')}</span>
              <div style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>
                {m.wallet_address.startsWith('guest_') ? 'Guest mover' : `${m.wallet_address.slice(0, 6)}…${m.wallet_address.slice(-4)}`}
                {m.wallet_address === myId && <span className="sd-mono" style={{ fontSize: 8, marginLeft: 6, color: '#cdfb46' }}>YOU</span>}
                {m.wallet_address === group.creator_wallet && <span className="sd-mono" style={{ fontSize: 8, marginLeft: 6, color: 'var(--muted-2)' }}>CREATOR</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
