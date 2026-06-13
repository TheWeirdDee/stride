'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useReadContract, useWriteContract, useConfig } from 'wagmi'
import { formatUnits } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { commitmentABI } from '@/abi/commitment'
import { COMMITMENT_CONTRACT, BACKEND_URL } from '@/utils/constants'
import { useGPSTracker } from '@/hooks/useGPSTracker'

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
      await waitForTransactionReceipt(config, { hash })
      setTxHash(hash)
      setPhase('complete')
    } catch (err: unknown) {
      setPhase('error')
      const msg = (err as { shortMessage?: string })?.shortMessage || (err instanceof Error ? err.message : 'Transaction failed')
      setErrorMsg(msg)
    }
  }, [gps, commitmentId, isDistanceGoal, goalMeters, writeContractAsync, config])

  // ─── Render ───────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="max-w-md mx-auto my-12 px-4 text-center">
        <div className="mb-4 flex justify-center"><AlertTriangle className="w-10 h-10 text-amber-500" /></div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Something went wrong</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{errorMsg}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm"
        >
          Go Home
        </button>
      </div>
    )
  }

  if (phase === 'complete') {
    return (
      <div className="max-w-md mx-auto my-12 px-4 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">Commitment Complete!</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Your stake has been returned plus any bonus rewards.</p>
        {txHash && (
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-2 break-all">
            tx: {txHash.slice(0, 10)}…{txHash.slice(-8)}
          </p>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-8 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-extrabold shadow-md"
        >
          Back to Stride
        </button>
      </div>
    )
  }

  if (phase === 'verifying' || phase === 'submitting') {
    return (
      <div className="max-w-md mx-auto my-12 px-4 text-center animate-in fade-in duration-300">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping" />
          <div className="absolute inset-2 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">
          {phase === 'verifying' ? 'Verifying Session' : 'Submitting On-Chain'}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{statusMsg}</p>
      </div>
    )
  }

  // ─── Idle (pre-start) ─────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="max-w-md mx-auto my-10 px-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-150 dark:border-zinc-850 p-6 shadow-md">
          <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 mb-1">Active Commitment</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mb-6 break-all">{commitmentId?.slice(0, 18)}…</p>

          {commitment && (
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-900">
                <span className="text-sm text-zinc-500">Goal</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {isDistanceGoal
                    ? `${(Number(commitment.distanceGoal) / 1000).toFixed(1)} km`
                    : `${Number(commitment.stepGoal).toLocaleString()} steps`}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-900">
                <span className="text-sm text-zinc-500">Staked</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {parseFloat(formatUnits(commitment.stakeAmount, 18)).toFixed(2)} cUSD
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-zinc-500">Time left</span>
                <span className={`font-bold ${isExpired ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {fmtDeadline(commitment.deadline)}
                </span>
              </div>
            </div>
          )}

          {isExpired ? (
            <div className="text-center">
              <p className="text-sm text-rose-500 font-semibold mb-4">This commitment has expired. You can forfeit it to reclaim any remaining pool eligibility.</p>
              <button onClick={() => router.push('/')} className="w-full py-3.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm">
                Go Home
              </button>
            </div>
          ) : (
            <>
              {gps.error && (
                <p className="text-xs text-rose-500 mb-3">{gps.error}</p>
              )}
              <button
                onClick={handleStart}
                className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-extrabold text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              >
                Start Session
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ─── Tracking / Paused ────────────────────────────────────
  const isTracking = phase === 'tracking' || phase === 'paused'

  return (
    <div className="max-w-md mx-auto my-6 px-4 animate-in fade-in duration-200">
      {/* Live Stats */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-150 dark:border-zinc-850 p-6 shadow-md mb-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Distance</p>
            <p className="text-4xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              {(distanceMeters / 1000).toFixed(2)}
              <span className="text-lg font-semibold text-zinc-400 ml-1">km</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Time</p>
            <p className="text-3xl font-bold font-mono text-zinc-700 dark:text-zinc-300 mt-1">{fmt(gps.elapsedTime)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1.5">
            <span>{distanceMeters}m</span>
            <span>Goal: {goalMeters}m</span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* GPS status */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className={`w-2 h-2 rounded-full ${phase === 'tracking' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
          {phase === 'tracking' ? `GPS active · ${gps.path.length} points` : 'Paused'}
          {gps.error && <span className="text-rose-400 ml-2">{gps.error}</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {phase === 'tracking' ? (
          <button
            onClick={handlePause}
            disabled={pauseCountRef.current >= 2}
            className="w-full py-4 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 font-extrabold text-base disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            Pause {pauseCountRef.current >= 2 ? '(limit reached)' : ''}
          </button>
        ) : (
          <button
            onClick={handleResume}
            className="w-full py-4 rounded-full border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-base active:scale-[0.98] transition-all"
          >
            Resume
          </button>
        )}

        <button
          onClick={handleFinish}
          disabled={!isTracking}
          className={`w-full py-4 rounded-full font-extrabold text-base active:scale-[0.98] transition-all ${
            goalMet
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
          }`}
        >
          {goalMet ? 'Finish & Claim Reward' : 'End Session'}
        </button>

        {!goalMet && isTracking && (
          <p className="text-center text-xs text-zinc-400 font-semibold">
            {goalMeters - distanceMeters}m remaining to meet goal
          </p>
        )}
      </div>
    </div>
  )
}
