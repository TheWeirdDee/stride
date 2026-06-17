'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useConnect } from 'wagmi'
import { ArrowRight, ArrowLeft, AlertCircle, Flame } from 'lucide-react'
import { useCreateCommitment } from '@/hooks/useCreateCommitment'
import { MIN_STAKE_CELO } from '@/utils/constants'

type GoalType = 'distance' | 'steps'

export default function NewCommitmentPage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  const {
    cusdBalance,
    hasActiveCommitment,
    activeCommitmentId,
    createCommitment,
    isPending,
    isConfirming,
    statusMessage,
    error: txError,
  } = useCreateCommitment()

  const [step, setStep] = useState<number>(1)
  const [goalType, setGoalType] = useState<GoalType>('distance')
  const [goalValue, setGoalValue] = useState<number>(3)
  const [stakeAmount, setStakeAmount] = useState<string>('0.10')
  const [durationHours, setDurationHours] = useState<number>(2)
  const [customStake, setCustomStake] = useState<string>('')
  const [isCustomStakeActive, setIsCustomStakeActive] = useState<boolean>(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const stakeOptions = ['0.01', '0.10', '0.25', '0.50', '1.00']
  const durationOptions = [
    { label: '1 Hour', value: 1, seconds: 3600 },
    { label: '2 Hours', value: 2, seconds: 7200 },
    { label: '4 Hours', value: 4, seconds: 14400 },
    { label: '8 Hours', value: 8, seconds: 28800 },
    { label: '24 Hours', value: 24, seconds: 86400 },
  ]
  const currentDurationSeconds = durationOptions.find((d) => d.value === durationHours)?.seconds || 7200

  const finalStake = isCustomStakeActive ? customStake : stakeAmount
  const stakeValue = parseFloat(finalStake) || 0
  const bonusEstimateMin = (stakeValue * 0.02).toFixed(4)
  const bonusEstimateMax = (stakeValue * 0.1).toFixed(4)

  const userCusdFloat = parseFloat(cusdBalance)
  const isBalanceInsufficient = isConnected && userCusdFloat < stakeValue
  const isStakeHighPercent = isConnected && stakeValue > 0 && userCusdFloat > 0 && stakeValue / userCusdFloat > 0.2

  const handleNext = () => {
    if (step === 3) {
      const val = parseFloat(finalStake)
      if (isNaN(val) || val < MIN_STAKE_CELO) {
        setLocalError(`Stake must be at least ${MIN_STAKE_CELO} cUSD`)
        return
      }
      if (isBalanceInsufficient) {
        setLocalError('Insufficient cUSD balance. Top up your cUSD to stake.')
        return
      }
      setLocalError(null)
    }
    setStep((prev) => Math.min(prev + 1, 5))
  }
  const handleBack = () => {
    setLocalError(null)
    setStep((prev) => Math.max(prev - 1, 1))
  }
  const handleStakeSelect = (opt: string) => {
    setIsCustomStakeActive(false)
    setStakeAmount(opt)
    setLocalError(null)
  }
  const handleCustomStakeChange = (val: string) => {
    setIsCustomStakeActive(true)
    setCustomStake(val)
    setLocalError(null)
  }
  const handleConnect = () => {
    const injected = connectors.find((c) => c.id === 'injected') || connectors[0]
    if (injected) connect({ connector: injected })
  }
  const handleSubmitCommitment = async () => {
    setLocalError(null)
    const finalGoalValue = goalType === 'distance' ? goalValue * 1000 : goalValue
    try {
      const res = await createCommitment(goalType, finalGoalValue, finalStake, currentDurationSeconds)
      if (res?.success && res.commitmentId) router.push(`/session/${res.commitmentId}`)
    } catch (err) {
      console.error(err)
    }
  }

  const goalDisplay = goalType === 'distance' ? goalValue.toFixed(1) : goalValue.toLocaleString()
  const goalUnit = goalType === 'distance' ? 'KM' : 'STEPS'

  
  if (isPending || isConfirming) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 24, display: 'grid', placeItems: 'center' }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#cdfb46', opacity: 0.18, animation: 'ring 1.8s ease-out infinite' }} />
          <div style={{ width: 44, height: 44, border: '4px solid #cdfb46', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        </div>
        <h3 className="sd-display" style={{ fontSize: 22 }}>{isConfirming ? 'Confirming on-chain' : 'Signature requested'}</h3>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12, maxWidth: 280 }}>{statusMessage}</p>
        <div className="sd-mono" style={{ marginTop: 28, padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>MiniPay native transaction</div>
      </div>
    )
  }

  // ── Active commitment guard ──────────────────────────────
  if (isConnected && hasActiveCommitment) {
    return (
      <div className="sd-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(205,251,70,0.12)', display: 'grid', placeItems: 'center', color: '#cdfb46', marginBottom: 22 }}>
          <Flame className="h-8 w-8" style={{ animation: 'flame 1.6s ease-in-out infinite' }} />
        </div>
        <h3 className="sd-display" style={{ fontSize: 24 }}>Active commitment</h3>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12, maxWidth: 300 }}>You already have a stake live on-chain. Complete or forfeit it before starting a new one.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 26 }}>
          <button onClick={() => router.push(`/session/${activeCommitmentId}`)} className="sd-btn sd-btn-lime">Go to active session</button>
          <button onClick={() => router.push('/explore')} className="sd-btn sd-btn-ghost">Back to explore</button>
        </div>
      </div>
    )
  }

  const optBtn = (active: boolean): React.CSSProperties => ({
    border: active ? '1.5px solid #cdfb46' : '1.5px solid transparent',
    background: active ? '#cdfb46' : 'rgba(255,255,255,0.04)',
    color: active ? '#06080a' : 'var(--ink)',
    cursor: 'pointer',
    transition: '0.15s',
  })

  return (
    <div className="sd-page">
      {/* Step progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="sd-eyebrow">STEP {step} / 5</span>
        <span className="sd-meta">New commitment</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 26 }}>
        <div style={{ height: '100%', width: `${(step / 5) * 100}%`, background: '#cdfb46', borderRadius: 999, transition: 'width 0.3s ease' }} />
      </div>

      {/* Step 1 — goal type */}
      {step === 1 && (
        <div className="sd-rise-1">
          <h2 className="sd-display" style={{ fontSize: 30 }}>Choose your<br />goal type</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>What are you committing to today?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 22 }}>
            {([['distance', 'Distance', 'Walk or run (km)'], ['steps', 'Steps', 'Step count tracking']] as const).map(([t, label, sub]) => (
              <button key={t} onClick={() => { setGoalType(t); setGoalValue(t === 'distance' ? 3 : 5000) }} className="sd-card" style={{ ...optBtn(goalType === t), padding: 20, textAlign: 'left', borderRadius: 18 }}>
                <div style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 800, fontSize: 18, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — goal value */}
      {step === 2 && (
        <div className="sd-rise-1">
          <h2 className="sd-display" style={{ fontSize: 30 }}>Set your<br />target</h2>
          <div className="sd-card" style={{ marginTop: 22, padding: '28px 18px', textAlign: 'center' }}>
            <span className="sd-mono" style={{ fontWeight: 800, fontSize: 56, lineHeight: 1 }}>{goalDisplay}</span>
            <span style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--muted)', marginLeft: 8 }}>{goalUnit}</span>
          </div>
          <input
            type="range"
            min={goalType === 'distance' ? 0.5 : 500}
            max={goalType === 'distance' ? 21 : 30000}
            step={goalType === 'distance' ? 0.5 : 500}
            value={goalValue}
            onChange={(e) => setGoalValue(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: 22, accentColor: '#cdfb46' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {(goalType === 'distance' ? [1, 3, 5, 10] : [1000, 5000, 10000, 20000]).map((v) => (
              <button key={v} onClick={() => setGoalValue(v)} className="sd-mono" style={{ flex: 1, padding: '11px 8px', borderRadius: 14, fontWeight: 600, fontSize: 13, ...optBtn(goalValue === v) }}>
                {goalType === 'distance' ? `${v}km` : v.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — stake */}
      {step === 3 && (
        <div className="sd-rise-1">
          <h2 className="sd-display" style={{ fontSize: 30 }}>Set your<br />stake</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>Locked in escrow, returned on completion.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, padding: '11px 14px', borderRadius: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
            <span className="sd-mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your balance</span>
            <span className="sd-mono" style={{ fontWeight: 800, fontSize: 13 }}>{isConnected ? `${userCusdFloat.toFixed(4)} cUSD` : 'Wallet not connected'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 7, marginTop: 14 }}>
            {stakeOptions.map((opt) => (
              <button key={opt} onClick={() => handleStakeSelect(opt)} className="sd-mono" style={{ padding: '13px 4px', borderRadius: 13, fontWeight: 800, fontSize: 13, ...optBtn(!isCustomStakeActive && stakeAmount === opt) }}>${opt}</button>
            ))}
          </div>
          <input className="sd-input sd-mono" type="number" placeholder="Custom stake (e.g. 0.05)" value={customStake} onChange={(e) => handleCustomStakeChange(e.target.value)} style={{ marginTop: 12, borderColor: isCustomStakeActive ? '#cdfb46' : undefined }} />
          {!isConnected && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.5 }}>Pick your stake now — you&apos;ll connect your wallet to confirm and lock funds on the final step.</p>
          )}
          {isStakeHighPercent && !isBalanceInsufficient && (
            <div style={{ display: 'flex', gap: 8, padding: 12, borderRadius: 13, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', fontSize: 12, marginTop: 12 }}>
              <AlertCircle className="h-4 w-4 shrink-0" /> Staking {stakeValue.toFixed(2)} cUSD is over 20% of your balance.
            </div>
          )}
          {isBalanceInsufficient && (
            <div style={{ display: 'flex', gap: 8, padding: 12, borderRadius: 13, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185', fontSize: 12, marginTop: 12 }}>
              <AlertCircle className="h-4 w-4 shrink-0" /> Not enough cUSD. Need {stakeValue.toFixed(2)}, have {userCusdFloat.toFixed(4)}.
            </div>
          )}
        </div>
      )}

      {/* Step 4 — time window */}
      {step === 4 && (
        <div className="sd-rise-1">
          <h2 className="sd-display" style={{ fontSize: 30 }}>Time<br />window</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>Finish inside this window or forfeit the stake.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22 }}>
            {durationOptions.map((opt) => (
              <button key={opt.value} onClick={() => setDurationHours(opt.value)} className="sd-card" style={{ padding: 16, textAlign: 'left', borderRadius: 14, ...optBtn(durationHours === opt.value) }}>
                <div style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase' }}>{opt.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5 — review */}
      {step === 5 && (
        <div className="sd-rise-1">
          <h2 className="sd-display" style={{ fontSize: 30 }}>Review &amp;<br />confirm</h2>
          <div className="sd-card" style={{ marginTop: 22, padding: 4, overflow: 'hidden' }}>
            {[
              ['Goal', goalType === 'distance' ? `${goalValue.toFixed(1)} KM` : `${goalValue.toLocaleString()} STEPS`],
              ['Stake', `${parseFloat(finalStake).toFixed(2)} cUSD`],
              ['Window', `${durationHours} ${durationHours === 1 ? 'Hour' : 'Hours'}`],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', borderBottom: i < 2 ? '1px solid var(--line)' : 'none' }}>
                <span className="sd-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--muted-2)', textTransform: 'uppercase' }}>{k}</span>
                <span style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 800, fontSize: 17 }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="sd-card-lime sd-card-glow" style={{ padding: 18, marginTop: 12 }}>
            <div className="sd-mono" style={{ position: 'relative', fontSize: 9, letterSpacing: '0.14em', color: '#cdfb46', textTransform: 'uppercase' }}>Reward estimate</div>
            <div className="sd-mono" style={{ position: 'relative', fontWeight: 800, fontSize: 24, color: '#cdfb46', marginTop: 4 }}>+{bonusEstimateMin} ~ {bonusEstimateMax}<span style={{ fontSize: 12, color: 'var(--muted)' }}> cUSD</span></div>
            <div style={{ position: 'relative', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Stake returned + bonus paid from pool on completion.</div>
          </div>
        </div>
      )}

      {(localError || txError) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, marginTop: 18, borderRadius: 13, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185', fontSize: 12, fontWeight: 600 }}>
          <AlertCircle className="h-4 w-4 shrink-0" /> {localError || txError}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
        {step > 1 && (
          <button onClick={handleBack} className="sd-btn sd-btn-ghost" style={{ width: 56, flexShrink: 0 }}>
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {step < 5 ? (
          <button onClick={handleNext} className="sd-btn" style={{ background: '#f4f6f3', color: '#06080a' }}>
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : isConnected ? (
          <button onClick={handleSubmitCommitment} className="sd-btn sd-btn-lime">Confirm commitment</button>
        ) : (
          <button onClick={handleConnect} className="sd-btn sd-btn-lime">Connect wallet</button>
        )}
      </div>
    </div>
  )
}
