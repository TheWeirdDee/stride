'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { GuestProfile } from '@/components/landing/types'
import {
  User,
  MapPin,
  Flame,
  Award,
  Wallet,
  Compass,
  LogOut,
  RefreshCw,
  AlertCircle,
  Pencil,
  Check,
  X,
  Mail
} from 'lucide-react'

interface CommitmentItem {
  id: string
  stake_amount: number
  goal_type: 'distance' | 'steps'
  goal_value: number
  status: 'active' | 'completed' | 'forfeited' | 'cancelled'
  created_at: string
  bonus_earned: number
}

interface UserProfile {
  nickname: string
  city: string
  email?: string
  activity?: 'walk' | 'run' | 'both'
  fitness_level: 'beginner' | 'intermediate' | 'active'
  streak_current: number
  streak_best: number
  total_distance: number
  total_earnings: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Profile data & history
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [guest, setGuest] = useState<GuestProfile | null>(null)
  const [commitments, setCommitments] = useState<CommitmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Inline edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editNick, setEditNick] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editActivity, setEditActivity] = useState<'walk' | 'run' | 'both'>('walk')
  const [savingEdits, setSavingEdits] = useState(false)

  const { data: balanceData } = useBalance({
    address: address,
    query: { enabled: !!address },
  })

  const balance = balanceData ? parseFloat(formatEther(balanceData.value)).toFixed(4) : '0.0000'

  // GitHub-style contribution grid — completed commitments per day over 12 weeks.
  const contrib = useMemo(() => {
    const days = 84
    const counts = new Map<string, number>()
    for (const c of commitments) {
      if (c.status !== 'completed') continue
      const key = new Date(c.created_at).toISOString().slice(0, 10)
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    const today = new Date()
    const cells: { date: string; count: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      cells.push({ date: key, count: counts.get(key) || 0 })
    }
    return cells
  }, [commitments])
  const heatColor = (n: number) =>
    n >= 3 ? '#cdfb46' : n === 2 ? 'rgba(205,251,70,0.75)' : n === 1 ? 'rgba(205,251,70,0.45)' : 'rgba(255,255,255,0.07)'
  const activeDays = contrib.filter((c) => c.count > 0).length

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      if (isConnected && address) {
        try {
          if (!supabase) throw new Error('Supabase client unavailable')
           
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', address)
            .maybeSingle()

          if (error) throw error

          let dbUser = data

          // If connected but user doesn't exist in Supabase, create with defaults.
          // Upsert avoids duplicate-key races; failures are non-fatal — we still
          // render a default profile so a connected wallet is never shown as blank.
          const defaults = {
            wallet_address: address,
            nickname: 'Anonymous Mover',
            city: 'Unknown',
            fitness_level: 'beginner',
            streak_current: 0,
            streak_best: 0,
            total_distance: 0,
            total_earnings: 0,
          }
          if (!dbUser) {
            setSyncing(true)
            const { data: insertedUser, error: insertError } = await supabase
              .from('users')
              .upsert(defaults, { onConflict: 'wallet_address' })
              .select()
              .single()

            if (insertError) {
              console.warn('Could not create user row (likely RLS) — using a local profile:', insertError.message || insertError.code || insertError)
            } else if (insertedUser) {
              dbUser = insertedUser
            }
            setSyncing(false)
          }

          const src = dbUser || defaults
          setProfile({
            nickname: src.nickname || 'Anonymous Mover',
            city: src.city || 'Unknown',
            fitness_level: src.fitness_level || 'beginner',
            streak_current: src.streak_current || 0,
            streak_best: src.streak_best || 0,
            total_distance: src.total_distance || 0,
            total_earnings: src.total_earnings || 0,
          })

          // Load commitments history
          const { data: history, error: historyError } = await supabase
            .from('commitments')
            .select('*')
            .eq('wallet_address', address)
            .order('created_at', { ascending: false })

          if (!historyError && history) {
            setCommitments(history as CommitmentItem[])
          }

        } catch (err) {
          console.error('Profile load failed:', err)
        } finally {
          setLoading(false)
        }
      } else {
        // Disconnected — load the local guest profile created during onboarding
        try {
          const raw = typeof window !== 'undefined' && localStorage.getItem('stride_guest_profile')
          if (raw) {
            const g = JSON.parse(raw) as GuestProfile
            setGuest(g)
            setProfile({
              nickname: g.nickname || 'Anonymous Mover',
              city: g.city || 'Unknown',
              email: g.email,
              activity: g.activity,
              fitness_level: 'beginner',
              streak_current: 0,
              streak_best: 0,
              total_distance: 0,
              total_earnings: 0,
            })
          } else {
            setGuest(null)
            setProfile(null)
          }
        } catch {
          setGuest(null)
        }
        setLoading(false)
      }
    }

    loadProfile()
  }, [isConnected, address])

  const handleConnect = () => {
    const injected = connectors.find(c => c.id === 'injected') || connectors[0]
    if (injected) {
      connect({ connector: injected })
    }
  }

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  const startEditing = () => {
    if (!profile) return
    setEditNick(profile.nickname)
    setEditCity(profile.city === 'Unknown' ? '' : profile.city)
    setEditActivity(profile.activity || 'walk')
    setIsEditing(true)
  }

  const saveProfileEdits = async () => {
    if (!profile || !editNick.trim()) return
    setSavingEdits(true)
    const nextNick = editNick.trim()
    const nextCity = editCity.trim()

    try {
      if (isConnected && address) {
        // Connected — persist to Supabase against the wallet address
        if (supabase) {
          await supabase
            .from('users')
            .upsert({ wallet_address: address, nickname: nextNick, city: nextCity || 'Unknown' }, { onConflict: 'wallet_address' })
        }
      } else if (guest) {
        // Guest — persist to localStorage (and best-effort to Supabase)
        const updated: GuestProfile = { ...guest, nickname: nextNick, city: nextCity, activity: editActivity }
        try { localStorage.setItem('stride_guest_profile', JSON.stringify(updated)) } catch {}
        setGuest(updated)
        if (supabase) {
          try {
            await supabase
              .from('users')
              .upsert({ wallet_address: guest.id, nickname: nextNick, city: nextCity || 'Unknown' }, { onConflict: 'wallet_address' })
          } catch { /* non-fatal */ }
        }
      }

      setProfile({ ...profile, nickname: nextNick, city: nextCity || 'Unknown', activity: editActivity })
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save profile edits:', err)
    } finally {
      setSavingEdits(false)
    }
  }

  // Loading Screen
  if (loading || syncing) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw className="h-8 w-8" style={{ color: '#cdfb46', animation: 'spin 0.9s linear infinite', marginBottom: 16 }} />
        <p style={{ color: 'var(--muted)' }}>{syncing ? 'Syncing to Celo…' : 'Loading profile…'}</p>
      </div>
    )
  }

  // Wallet not connected and no local profile — soft connect prompt
  if (!isConnected && !profile) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', color: '#cdfb46', marginBottom: 22 }}>
          <User className="h-7 w-7" />
        </div>
        <h1 className="sd-display" style={{ fontSize: 30 }}>Connect<br />your wallet</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '14px 0 26px', maxWidth: 300 }}>Your stats and history live with your wallet. Connect, or set up a local profile.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
          <button onClick={handleConnect} className="sd-btn sd-btn-lime">Connect wallet</button>
          <button onClick={() => router.push('/?onboard=true')} className="sd-btn sd-btn-ghost">Set up local profile</button>
        </div>
      </div>
    )
  }

  const statusStyle = (status: string): React.CSSProperties => {
    if (status === 'completed') return { background: 'rgba(205,251,70,0.12)', color: '#cdfb46', border: '1px solid rgba(205,251,70,0.25)' }
    if (status === 'active') return { background: 'rgba(10,90,162,0.22)', color: '#7db4e6', border: '1px solid rgba(125,180,230,0.3)' }
    if (status === 'forfeited') return { background: 'rgba(230,120,120,0.14)', color: '#e89090', border: '1px solid rgba(230,120,120,0.28)' }
    return { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--line)' }
  }

  return (
    <div className="sd-page">
      {/* Identity */}
      {isEditing ? (
        <div className="sd-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#cdfb46', color: '#06080a', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 800, textTransform: 'uppercase', flexShrink: 0, fontFamily: "'Archivo Expanded',sans-serif" }}>{(editNick || profile?.nickname || '?')[0]}</div>
            <div style={{ flex: 1 }}>
              <label className="sd-mono" style={{ display: 'block', fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', textTransform: 'uppercase', marginBottom: 6 }}>Display name</label>
              <input value={editNick} onChange={(e) => setEditNick(e.target.value)} placeholder="Your name" className="sd-input" />
            </div>
          </div>
          <div>
            <label className="sd-mono" style={{ display: 'block', fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', textTransform: 'uppercase', marginBottom: 6 }}>City</label>
            <input value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="e.g. Lagos" className="sd-input" />
          </div>
          <div>
            <label className="sd-mono" style={{ display: 'block', fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', textTransform: 'uppercase', marginBottom: 6 }}>I prefer</label>
            <select value={editActivity} onChange={(e) => setEditActivity(e.target.value as 'walk' | 'run' | 'both')} className="sd-select">
              <option value="walk">Walking</option>
              <option value="run">Running</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveProfileEdits} disabled={!editNick.trim() || savingEdits} className="sd-btn sd-btn-lime" style={{ fontSize: 13, padding: 13 }}><Check className="h-4 w-4" /> {savingEdits ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setIsEditing(false)} className="sd-btn sd-btn-ghost" style={{ fontSize: 13, padding: 13 }}><X className="h-4 w-4" /> Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: '#cdfb46', color: '#06080a', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 800, textTransform: 'uppercase', fontFamily: "'Archivo Expanded',sans-serif" }}>{profile?.nickname[0]}</div>
            <div>
              <h1 className="sd-display" style={{ fontSize: 24 }}>{profile?.nickname}</h1>
              <span className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <MapPin className="h-3 w-3" style={{ color: '#cdfb46' }} /> {profile?.city || 'No city set'}
              </span>
              {profile?.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: 'var(--muted-2)' }}><Mail className="h-3 w-3" style={{ color: '#cdfb46' }} /> {profile.email}</span>
              )}
            </div>
          </div>
          <button onClick={startEditing} className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', borderRadius: 10, padding: '7px 10px', color: '#cdfb46', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Pencil className="h-3 w-3" /> Edit</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
        {[
          [<Compass key="c" className="h-4 w-4" style={{ color: '#cdfb46' }} />, (profile ? profile.total_distance / 1000 : 0).toFixed(1), 'Km total', '#f4f6f3'],
          [<Award key="a" className="h-4 w-4" style={{ color: '#cdfb46' }} />, `$${profile?.total_earnings.toFixed(2) ?? '0.00'}`, 'Earned', '#cdfb46'],
        ].map(([icon, v, l, color], i) => (
          <div key={i} className="sd-card" style={{ padding: 15 }}>
            {icon as React.ReactNode}
            <div className="sd-mono" style={{ fontWeight: 800, fontSize: 22, marginTop: 6, color: color as string }}>{v as React.ReactNode}</div>
            <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted-2)', textTransform: 'uppercase', marginTop: 2 }}>{l as React.ReactNode}</div>
          </div>
        ))}
      </div>

      {/* Activity streak — GitHub-style contribution grid */}
      <div className="sd-card" style={{ padding: 18, marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.12em', color: 'var(--muted-2)', textTransform: 'uppercase' }}>
            <Flame className="h-4 w-4" style={{ color: '#fbbf24' }} /> Activity
          </span>
          <span className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-2)' }}>{activeDays} active days · 12 wks</span>
        </div>
        <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7,1fr)', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
          {contrib.map((cell) => (
            <div key={cell.date} title={`${cell.date}: ${cell.count} completed`} style={{ height: 12, width: 12, borderRadius: 3, background: heatColor(cell.count) }} />
          ))}
        </div>
        <div className="sd-mono" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 9, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Less
          {[0, 1, 2, 3].map((n) => <span key={n} style={{ height: 12, width: 12, borderRadius: 3, background: heatColor(n) }} />)}
          More
        </div>
      </div>

      {/* Account status */}
      <div className="sd-card" style={{ padding: 18, marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.12em', color: 'var(--muted-2)', textTransform: 'uppercase' }}><Wallet className="h-4 w-4" /> Account</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? '#cdfb46' : '#fbbf24' }} />
        </div>
        {isConnected && address ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Address</span>
              <span className="sd-mono" style={{ fontWeight: 700, fontSize: 13 }}>{truncateAddress(address)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Balance</span>
              <span className="sd-mono" style={{ fontWeight: 800, fontSize: 16 }}>{balance} <small style={{ color: 'var(--muted-2)', fontWeight: 400 }}>CELO</small></span>
            </div>
            <button onClick={() => disconnect()} className="sd-mono" style={{ width: '100%', padding: 11, borderRadius: 12, background: 'transparent', border: '1px solid var(--line)', color: '#fb7185', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}><LogOut className="h-3.5 w-3.5" /> Disconnect</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, padding: 12, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: 12 }}>
              <AlertCircle className="h-4 w-4 shrink-0" style={{ marginTop: 1 }} /> Connect a wallet to save your progress on-chain and earn rewards.
            </div>
            <button onClick={handleConnect} className="sd-btn sd-btn-lime" style={{ fontSize: 13, padding: 13 }}><Wallet className="h-4 w-4" /> Connect wallet</button>
          </div>
        )}
      </div>

      {/* History */}
      <div className="sd-section-row" style={{ marginTop: 28 }}>
        <h2 className="sd-section">History</h2>
        {isConnected && (
          <button onClick={() => router.push('/profile/routes')} className="sd-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 0, color: '#cdfb46', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700 }}><MapPin className="h-3.5 w-3.5" /> Routes</button>
        )}
      </div>

      {isConnected ? (
        commitments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {commitments.map((c) => (
              <div key={c.id} className="sd-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 800, fontSize: 16, textTransform: 'uppercase' }}>{c.goal_type === 'distance' ? `${(c.goal_value / 1000).toFixed(1)} km` : `${c.goal_value.toLocaleString()} steps`}</span>
                  <span className="sd-mono" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 9px', borderRadius: 999, ...statusStyle(c.status) }}>{c.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <span className="sd-mono" style={{ fontSize: 11, color: 'var(--muted-2)' }}>{new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${c.stake_amount.toFixed(2)}</span>
                  {c.status === 'completed' && c.bonus_earned > 0 && (
                    <span className="sd-mono" style={{ fontWeight: 800, fontSize: 12, color: '#cdfb46' }}>+${c.bonus_earned.toFixed(4)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sd-card" style={{ textAlign: 'center', padding: '36px 20px', borderStyle: 'dashed' }}>
            <Compass className="h-8 w-8" style={{ color: 'var(--muted-3)', margin: '0 auto 12px' }} />
            <h3 style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase' }}>No commitments yet</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0 16px' }}>You haven&apos;t staked on a workout yet.</p>
            <button onClick={() => router.push('/commitment/new')} className="sd-btn sd-btn-lime" style={{ maxWidth: 240, margin: '0 auto' }}>Start your first</button>
          </div>
        )
      ) : (
        <div className="sd-card" style={{ textAlign: 'center', padding: '36px 20px', borderStyle: 'dashed' }}>
          <Wallet className="h-8 w-8" style={{ color: 'var(--muted-3)', margin: '0 auto 12px' }} />
          <h3 style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase' }}>Wallet not connected</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0 16px' }}>Connect to see your on-chain history.</p>
          <button onClick={handleConnect} className="sd-btn sd-btn-lime" style={{ maxWidth: 240, margin: '0 auto' }}>Connect wallet</button>
        </div>
      )}
    </div>
  )
}
