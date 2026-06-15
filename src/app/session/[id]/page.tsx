'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useReadContract, useWriteContract, useConfig } from 'wagmi'
import { formatUnits, parseEventLogs } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { commitmentABI } from '@/abi/commitment'
import { COMMITMENT_CONTRACT, BACKEND_URL } from '@/utils/constants'
import { useGPSTracker } from '@/hooks/useGPSTracker'
import { supabase } from '@/utils/supabase'
import { generateRouteCard } from '@/utils/generateRouteCard'

type Phase = 'loading' | 'idle' | 'tracking' | 'paused' | 'verifying' | 'submitting' | 'complete' | 'error'

function fmt(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function fmtDeadline(deadline: bigint) {
  const remaining = Number(deadline) - Math.floor(Date.now() / 1000)
  if (remaining <= 0) return 'Expired'
  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  if (h > 0) return `${h}h ${m}m left`
  return `${m}m left`
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const { address } = useAccount()
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()

  const commitmentId = params.id as `0x${string}`

  const [phase, setPhase] = useState<Phase>('loading')
  const [statusMsg, setStatusMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [txHash, setTxHash] = useState('')

  const pauseCountRef = useRef(0)
  const totalPauseMsRef = useRef(0)
  const pauseStartRef = useRef<number | null>(null)
  const sessionStartRef = useRef<number | null>(null)

  const gps = useGPSTracker()

  // Read commitment
  const { data: commitment, isLoading: commitLoading } = useReadContract({
    address: COMMITMENT_CONTRACT,
    abi: commitmentABI,
    functionName: 'getCommitment',
    args: [commitmentId],
    query: { enabled: !!commitmentId },
  })

  useEffect(() => {
    if (!commitLoading) {
      setPhase(commitment ? 'idle' : 'error')
      if (!commitment) setErrorMsg('Commitment not found on-chain.')
    }
  }, [commitLoading, commitment])

  const isExpired = commitment ? Number(commitment.deadline) < Date.now() / 1000 : false
  const isDistanceGoal = commitment ? commitment.distanceGoal > BigInt(0) : false
  const goalMeters = commitment ? Number(isDistanceGoal ? commitment.distanceGoal : commitment.stepGoal) : 0
  const distanceMeters = Math.round(gps.distance * 1000)
  const progressPct = goalMeters > 0 ? Math.min((distanceMeters / goalMeters) * 100, 100) : 0
  const goalMet = isDistanceGoal ? distanceMeters >= goalMeters : false // steps unsupported without sensor

  const handleStart = useCallback(() => {
    sessionStartRef.current = Date.now()
    gps.startTracking()
    setPhase('tracking')
  }, [gps])

  const handlePause = useCallback(() => {
    gps.pauseTracking()
    pauseCountRef.current += 1
    pauseStartRef.current = Date.now()
    setPhase('paused')
  }, [gps])

  const handleResume = useCallback(() => {
    if (pauseStartRef.current !== null) {
      totalPauseMsRef.current += Date.now() - pauseStartRef.current
      pauseStartRef.current = null
    }
    gps.resumeTracking()
    setPhase('tracking')
  }, [gps])

  const handleFinish = useCallback(async () => {
    gps.stopTracking()
    if (pauseStartRef.current !== null) {
      totalPauseMsRef.current += Date.now() - pauseStartRef.current
    }

    setPhase('verifying')
    setStatusMsg('Verifying your session...')

    const backendCoords = gps.path.map((c) => ({
      lat: c.latitude,
      lng: c.longitude,
      timestamp: c.timestamp ?? Date.now(),
    }))

    let proof: {
      commitmentId: string
      actualDistance: number
      actualSteps: number
      proofNonce: string
      signature: string
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/verify-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitmentId,
          coordinates: backendCoords,
          goalType: isDistanceGoal ? 'walk' : 'walk',
          goalCategory: isDistanceGoal ? 'distance' : 'steps',
          goalValue: goalMeters,
          durationSeconds: gps.elapsedTime,
          pauseCount: pauseCountRef.current,
          totalPauseDurationMs: totalPauseMsRef.current,
          estimatedSteps: 0,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.proof) {
        throw new Error(json.error || 'Verification failed')
      }
      proof = json.proof
    } catch (err: unknown) {
      setPhase('error')
      setErrorMsg(err instanceof Error ? err.message : 'Backend verification failed')
      return
    }

    setPhase('submitting')
    setStatusMsg('Submitting proof on-chain...')

    try {
      const hash = await writeContractAsync({
        address: COMMITMENT_CONTRACT,
        abi: commitmentABI,
        functionName: 'completeCommitment',
        args: [
          commitmentId,
          BigInt(proof.actualDistance),
          BigInt(proof.actualSteps),
          proof.proofNonce as `0x${string}`,
          proof.signature as `0x${string}`,
        ],

      })

      setStatusMsg('Waiting for confirmation...')
      const receipt = await waitForTransactionReceipt(config, { hash })
      setTxHash(hash)

      // Pull the real bonus paid out from the CommitmentCompleted event.
      let bonusAmount = 0
      try {
        const events = parseEventLogs({
          abi: commitmentABI,
          eventName: 'CommitmentCompleted',
          logs: receipt.logs,
        })
        const match = events.find(
          (e) => e.args.commitmentId?.toLowerCase() === commitmentId.toLowerCase()
        ) ?? events[0]
        if (match) bonusAmount = parseFloat(formatUnits(match.args.bonusEarned, 18))
      } catch (e) {
        console.error('Could not parse bonus from receipt:', e)
      }

      // ─── Persist the completed session so it shows in Route History ───
      // The on-chain completion already succeeded above, so every DB write here
      // is best-effort and non-fatal — a Supabase hiccup must not block the
      // user's "Complete" screen or their on-chain payout.
      try {
        if (supabase && address) {
          const durationSecs = gps.elapsedTime
          const distanceMetersFinal = proof.actualDistance
          const startedAtMs = sessionStartRef.current ?? Date.now() - durationSecs * 1000
          const avgPace = distanceMetersFinal > 0
            ? (durationSecs / 60) / (distanceMetersFinal / 1000) // min/km
            : 0

          // sessions.commitment_id is the Supabase row UUID, not the chain id —
          // look it up via the chain id stored at creation time.
          const { data: commitmentRow } = await supabase
            .from('commitments')
            .select('id')
            .eq('commitment_id_chain', commitmentId)
            .maybeSingle()

          const { data: sessionRow, error: sessionErr } = await supabase
            .from('sessions')
            .insert({
              commitment_id: commitmentRow?.id ?? null,
              wallet_address: address,
              started_at: new Date(startedAtMs).toISOString(),
              ended_at: new Date().toISOString(),
              actual_distance: distanceMetersFinal,
              actual_steps: proof.actualSteps,
              duration_secs: durationSecs,
              avg_pace: Number(avgPace.toFixed(2)),
            })
            .select('id')
            .single()

          if (sessionErr) {
            console.error('Failed to write session row:', sessionErr)
          } else if (sessionRow) {
            // Generate a shareable route-card PNG and upload it to Storage so
            // routes.map_snapshot holds a real image URL (best-effort).
            let mapSnapshot: string | null = null
            try {
              const km = distanceMetersFinal / 1000
              const paceMinPerKm = km > 0 ? durationSecs / 60 / km : 0
              const paceWhole = Math.floor(paceMinPerKm)
              const paceSecs = Math.round((paceMinPerKm - paceWhole) * 60)
              const blob = await generateRouteCard(
                backendCoords.map((c) => ({ lat: c.lat, lng: c.lng })),
                {
                  distance: `${km.toFixed(2)} km`,
                  duration: fmt(durationSecs),
                  pace: `${paceWhole}:${String(paceSecs).padStart(2, '0')} min/km`,
                  date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                }
              )
              const path = `${address}/${sessionRow.id}.png`
              const { error: uploadErr } = await supabase.storage
                .from('route-cards')
                .upload(path, blob, { contentType: 'image/png', upsert: true })
              if (uploadErr) {
                console.error('Route card upload failed:', uploadErr)
              } else {
                mapSnapshot = supabase.storage.from('route-cards').getPublicUrl(path).data.publicUrl
              }
            } catch (cardErr) {
              console.error('Route card generation failed:', cardErr)
            }

            const { error: routeErr } = await supabase
              .from('routes')
              .insert({
                session_id: sessionRow.id,
                coordinates: backendCoords, // [{ lat, lng, timestamp }]
                map_snapshot: mapSnapshot,
              })
            if (routeErr) console.error('Failed to write route row:', routeErr)
          }

          // Flip the commitment out of "active" so the profile history reads
          // correctly and a new commitment can be created.
          if (commitmentRow?.id) {
            const { error: updErr } = await supabase
              .from('commitments')
              .update({ status: 'completed', completed_at: new Date().toISOString() })
              .eq('id', commitmentRow.id)
            if (updErr) console.error('Failed to mark commitment completed:', updErr)
          }

          // ─── Write 4: user aggregates + streak ───
          // Non-fatal on its own so a streak miscalc never blocks completion.
          try {
            const { data: userRow } = await supabase
              .from('users')
              .select('streak_current, streak_best, total_distance, total_earnings')
              .eq('wallet_address', address)
              .maybeSingle()

            if (userRow) {
              const existingDistance = Number(userRow.total_distance) || 0
              const existingEarnings = Number(userRow.total_earnings) || 0
              const existingStreak = Number(userRow.streak_current) || 0
              const existingBest = Number(userRow.streak_best) || 0

              // Most recent completion *before* this one (exclude the commitment
              // we just marked completed) to decide if the streak continues.
              let prevQuery = supabase
                .from('commitments')
                .select('completed_at')
                .eq('wallet_address', address)
                .eq('status', 'completed')
                .not('completed_at', 'is', null)
              if (commitmentRow?.id) prevQuery = prevQuery.neq('id', commitmentRow.id)
              const { data: prevRows } = await prevQuery
                .order('completed_at', { ascending: false })
                .limit(1)
              const prevCompletedAt: string | null = prevRows?.[0]?.completed_at ?? null

              // Compare by local calendar day so timezone + near-midnight cases
              // resolve to "today / yesterday / 2+ days ago" correctly.
              const startOfLocalDay = (d: Date) =>
                new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
              let newStreak: number
              if (!prevCompletedAt) {
                newStreak = 1 // first ever completion
              } else {
                const diffDays = Math.round(
                  (startOfLocalDay(new Date()) - startOfLocalDay(new Date(prevCompletedAt))) /
                    86_400_000
                )
                if (diffDays <= 0) newStreak = Math.max(existingStreak, 1) // already counted today
                else if (diffDays === 1) newStreak = existingStreak + 1 // yesterday → continue
                else newStreak = 1 // 2+ day gap → reset
              }

              const { error: userErr } = await supabase
                .from('users')
                .update({
                  total_distance: existingDistance + proof.actualDistance,
                  total_earnings: existingEarnings + bonusAmount,
                  streak_current: newStreak,
                  streak_best: Math.max(existingBest, newStreak),
                })
                .eq('wallet_address', address)
              if (userErr) console.error('Failed to update user aggregates:', userErr)
            }
          } catch (aggErr) {
            console.error('User aggregate/streak update error:', aggErr)
          }
        }
      } catch (dbErr) {
        console.error('Session persistence error:', dbErr)
      }

      setPhase('complete')
    } catch (err: unknown) {
      setPhase('error')
      const msg = (err as { shortMessage?: string })?.shortMessage || (err instanceof Error ? err.message : 'Transaction failed')
      setErrorMsg(msg)
    }
  }, [gps, commitmentId, isDistanceGoal, goalMeters, writeContractAsync, config, address])

  // ─── Render ───────────────────────────────────────────────
  const screen = (children: React.ReactNode) => (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '28px 20px 36px' }}>{children}</div>
  )

  if (phase === 'loading') {
    return screen(
      <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 38, height: 38, border: '4px solid #cdfb46', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      </div>
    )
  }

  if (phase === 'error') {
    return screen(
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <AlertTriangle className="w-10 h-10" style={{ color: '#fbbf24', marginBottom: 16 }} />
        <h2 className="sd-display" style={{ fontSize: 24 }}>Something<br />went wrong</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '14px 0 26px', maxWidth: 300 }}>{errorMsg}</p>
        <button onClick={() => router.push('/explore')} className="sd-btn sd-btn-ghost" style={{ maxWidth: 260 }}>Back to explore</button>
      </div>
    )
  }

  if (phase === 'complete') {
    const km = distanceMeters / 1000
    const paceMin = km > 0.05 ? gps.elapsedTime / 60 / km : 0
    const paceStr = paceMin > 0 ? `${Math.floor(paceMin)}:${String(Math.round((paceMin % 1) * 60)).padStart(2, '0')}` : '—:—'
    return screen(
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 30, background: '#cdfb46', display: 'grid', placeItems: 'center', marginBottom: 24, boxShadow: '0 24px 50px -16px rgba(205,251,70,0.5)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#06080a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <div className="sd-eyebrow">Goal smashed</div>
        <h2 className="sd-display" style={{ fontSize: 34, marginTop: 10 }}>Commitment<br />complete</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>Your stake is back, plus a bonus from the pool.</p>

        <div className="sd-card" style={{ display: 'flex', width: '100%', maxWidth: 320, marginTop: 24, padding: '18px 0' }}>
          {[[km.toFixed(2), 'KM'], [fmt(gps.elapsedTime), 'TIME'], [paceStr, 'PACE']].map(([v, l], i) => (
            <div key={l} style={{ flex: 1, textAlign: 'center', borderLeft: i ? '1px solid var(--line)' : 'none' }}>
              <div className="sd-mono" style={{ fontWeight: 800, fontSize: 20 }}>{v}</div>
              <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        {txHash && (
          <p className="sd-mono" style={{ fontSize: 10, color: 'var(--muted-3)', marginTop: 14, wordBreak: 'break-all' }}>tx: {txHash.slice(0, 10)}…{txHash.slice(-8)}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320, marginTop: 26 }}>
          <button onClick={() => router.push('/profile/routes')} className="sd-btn sd-btn-lime">View route history</button>
          <button onClick={() => router.push('/explore')} className="sd-btn sd-btn-ghost">Back to explore</button>
        </div>
      </div>
    )
  }

  if (phase === 'verifying' || phase === 'submitting') {
    return screen(
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 80, height: 80, display: 'grid', placeItems: 'center', marginBottom: 24 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#cdfb46', opacity: 0.18, animation: 'ring 1.8s ease-out infinite' }} />
          <div style={{ width: 44, height: 44, border: '4px solid #cdfb46', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        </div>
        <h2 className="sd-display" style={{ fontSize: 24 }}>{phase === 'verifying' ? 'Verifying session' : 'Submitting on-chain'}</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>{statusMsg}</p>
      </div>
    )
  }

  // ─── Idle (pre-start) ─────────────────────────────────────
  if (phase === 'idle') {
    return screen(
      <>
        <div className="sd-eyebrow">Ready when you are</div>
        <h1 className="sd-display" style={{ fontSize: 34, marginTop: 10 }}>Active<br />commitment</h1>
        <p className="sd-mono" style={{ fontSize: 11, color: 'var(--muted-3)', marginTop: 8, wordBreak: 'break-all' }}>{commitmentId?.slice(0, 22)}…</p>

        {commitment && (
          <div className="sd-card" style={{ marginTop: 22, padding: '4px 18px' }}>
            {[
              ['Goal', isDistanceGoal ? `${(Number(commitment.distanceGoal) / 1000).toFixed(1)} km` : `${Number(commitment.stepGoal).toLocaleString()} steps`, false],
              ['Staked', `${parseFloat(formatUnits(commitment.stakeAmount, 18)).toFixed(2)} cUSD`, true],
              ['Time left', fmtDeadline(commitment.deadline), false],
            ].map(([k, v, lime], i) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: i < 2 ? '1px solid var(--line)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{k}</span>
                <span className="sd-mono" style={{ fontWeight: 800, fontSize: 15, color: lime ? '#cdfb46' : (k === 'Time left' && isExpired ? '#fb7185' : '#f4f6f3') }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {isExpired ? (
          <>
            <p style={{ fontSize: 13, color: '#fb7185', fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>This commitment has expired.</p>
            <button onClick={() => router.push('/explore')} className="sd-btn sd-btn-ghost">Back to explore</button>
          </>
        ) : (
          <>
            {gps.error && <p style={{ fontSize: 12, color: '#fb7185', marginBottom: 10 }}>{gps.error}</p>}
            <button onClick={handleStart} className="sd-btn sd-btn-lime">Start session</button>
          </>
        )}
      </>
    )
  }

  // ─── Tracking / Paused ────────────────────────────────────
  const isTracking = phase === 'tracking' || phase === 'paused'
  const kmNow = distanceMeters / 1000
  const paceMinNow = kmNow > 0.05 ? gps.elapsedTime / 60 / kmNow : 0
  const paceNow = paceMinNow > 0 ? `${Math.floor(paceMinNow)}:${String(Math.round((paceMinNow % 1) * 60)).padStart(2, '0')}` : '—:—'

  return screen(
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: phase === 'tracking' ? '#cdfb46' : 'var(--muted-2)', animation: phase === 'tracking' ? 'pulseDot 1.6s ease-in-out infinite' : 'none' }} />
        <span className="sd-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: phase === 'tracking' ? '#cdfb46' : 'var(--muted)' }}>
          {phase === 'tracking' ? `Live · ${gps.path.length} GPS points` : 'Paused'}
        </span>
      </div>

      {/* Big distance */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted-2)', textTransform: 'uppercase' }}>Distance</div>
        <div className="sd-mono" style={{ fontWeight: 800, fontSize: 84, lineHeight: 0.92, letterSpacing: '-0.03em', marginTop: 6 }}>{kmNow.toFixed(2)}</div>
        <div style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 16, color: '#cdfb46', marginTop: 2 }}>KILOMETRES</div>
      </div>

      {/* Progress */}
      <div style={{ marginTop: 28 }}>
        <div className="sd-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-2)', marginBottom: 6 }}>
          <span>{distanceMeters}m</span>
          <span>GOAL {goalMeters}m</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: '#cdfb46', borderRadius: 999, transition: 'width 0.5s ease', boxShadow: '0 0 12px rgba(205,251,70,0.6)' }} />
        </div>
      </div>

      {/* Time + pace */}
      <div className="sd-card" style={{ display: 'flex', marginTop: 22, padding: '18px 0' }}>
        {[[fmt(gps.elapsedTime), 'TIME'], [paceNow, 'PACE /KM']].map(([v, l], i) => (
          <div key={l} style={{ flex: 1, textAlign: 'center', borderLeft: i ? '1px solid var(--line)' : 'none' }}>
            <div className="sd-mono" style={{ fontWeight: 800, fontSize: 26 }}>{v}</div>
            <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {gps.error && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 12, textAlign: 'center' }}>{gps.error}</p>}

      <div style={{ flex: 1 }} />

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {phase === 'tracking' ? (
          <button onClick={handlePause} disabled={pauseCountRef.current >= 2} className="sd-btn sd-btn-ghost">
            Pause {pauseCountRef.current >= 2 ? '(limit reached)' : ''}
          </button>
        ) : (
          <button onClick={handleResume} className="sd-btn" style={{ background: 'rgba(205,251,70,0.12)', color: '#cdfb46', border: '1px solid rgba(205,251,70,0.4)' }}>Resume</button>
        )}
        <button onClick={handleFinish} disabled={!isTracking} className={`sd-btn ${goalMet ? 'sd-btn-lime' : ''}`} style={goalMet ? undefined : { background: '#f4f6f3', color: '#06080a' }}>
          {goalMet ? 'Finish & claim reward' : 'End session'}
        </button>
        {!goalMet && isTracking && (
          <p className="sd-mono" style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted-2)' }}>{goalMeters - distanceMeters}m remaining to goal</p>
        )}
      </div>
    </>
  )
}
