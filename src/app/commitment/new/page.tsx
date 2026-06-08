'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Coins,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  Award,
  Flame,
  Info
} from 'lucide-react'
import { useCreateCommitment } from '@/hooks/useCreateCommitment'
import { MIN_STAKE_CUSD } from '@/utils/constants'

type GoalType = 'distance' | 'steps'

export default function NewCommitmentPage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  
  const {
    balance,
    hasActiveCommitment,
    activeCommitmentId,
    createCommitment,
    isPending,
    isConfirming,
    statusMessage,
    error: txError,
  } = useCreateCommitment()

  // Form State
  const [step, setStep] = useState<number>(1)
  const [goalType, setGoalType] = useState<GoalType>('distance')
  const [goalValue, setGoalValue] = useState<number>(3) // 3 km or 5000 steps
  const [stakeAmount, setStakeAmount] = useState<string>('0.10')
  const [durationHours, setDurationHours] = useState<number>(2) // default 2 hours

  // UI state
  const [customStake, setCustomStake] = useState<string>('')
  const [isCustomStakeActive, setIsCustomStakeActive] = useState<boolean>(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Default values are synchronized directly on selection in Step 1

  // Quick pick stake options
  const stakeOptions = ['0.01', '0.10', '0.25', '0.50', '1.00']

  // Duration Options in hours
  const durationOptions = [
    { label: '1 Hour', value: 1, seconds: 3600 },
    { label: '2 Hours', value: 2, seconds: 7200 },
    { label: '4 Hours', value: 4, seconds: 14400 },
    { label: '8 Hours', value: 8, seconds: 28800 },
    { label: '24 Hours', value: 24, seconds: 86400 },
  ]

  const currentDurationSeconds = durationOptions.find(d => d.value === durationHours)?.seconds || 7200

  // Calculate rewards estimate
  const finalStake = isCustomStakeActive ? customStake : stakeAmount
  const stakeValue = parseFloat(finalStake) || 0
  const bonusEstimateMin = (stakeValue * 0.02).toFixed(4)
  const bonusEstimateMax = (stakeValue * 0.10).toFixed(4)

  // Balance Check Warnings
  const userBalanceFloat = parseFloat(balance)
  const isBalanceInsufficient = userBalanceFloat < stakeValue
  const isStakeHighPercent = stakeValue > 0 && userBalanceFloat > 0 && (stakeValue / userBalanceFloat) > 0.20

  const handleNext = () => {
    if (step === 3) {
      const val = parseFloat(finalStake)
      if (isNaN(val) || val < MIN_STAKE_CUSD) {
        setLocalError(`Stake must be at least $${MIN_STAKE_CUSD} cUSD`)
        return
      }
      if (isBalanceInsufficient) {
        setLocalError('Insufficient cUSD balance in your wallet.')
        return
      }
      setLocalError(null)
    }
    setStep(prev => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setLocalError(null)
    setStep(prev => Math.max(prev - 1, 1))
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
    const injected = connectors.find(c => c.id === 'injected') || connectors[0]
    if (injected) {
      connect({ connector: injected })
    }
  }

  const handleSubmitCommitment = async () => {
    setLocalError(null)
    // Goal value sent to contract: distance in meters, steps as integer
    const finalGoalValue = goalType === 'distance' ? goalValue * 1000 : goalValue
    
    try {
      const res = await createCommitment(
        goalType,
        finalGoalValue,
        finalStake,
        currentDurationSeconds
      )

      if (res?.success && res.commitmentId) {
        // Redirect to the active session screen
        router.push(`/session/${res.commitmentId}`)
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Errors are handled inside hook and stored in txError state
      console.error(err)
    }
  }

  // Render Step 1: Goal Type
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Select Goal Type</h2>
        <p className="text-sm text-zinc-500 mt-1">What kind of goal are you committing to today?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setGoalType('distance')
            setGoalValue(3)
          }}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
            goalType === 'distance'
              ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Compass className="h-10 w-10 mb-3" />
          <span className="font-bold text-base">Distance</span>
          <span className="text-xs text-zinc-400 mt-1 dark:text-zinc-500">Walk or Run (km)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setGoalType('steps')
            setGoalValue(5000)
          }}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
            goalType === 'steps'
              ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Activity className="h-10 w-10 mb-3" />
          <span className="font-bold text-base">Steps</span>
          <span className="text-xs text-zinc-400 mt-1 dark:text-zinc-500">Step count tracking</span>
        </button>
      </div>
    </div>
  )

  // Render Step 2: Goal Value
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Define Your Goal</h2>
        <p className="text-sm text-zinc-500 mt-1">Set the target value for this workout session.</p>
      </div>

      <div className="py-6 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-center">
        <span className="text-5xl font-extrabold font-mono text-zinc-800 dark:text-zinc-100">
          {goalType === 'distance' ? goalValue.toFixed(1) : goalValue.toLocaleString()}
        </span>
        <span className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 ml-1.5">
          {goalType === 'distance' ? 'KM' : 'Steps'}
        </span>
      </div>

      <div className="space-y-4">
        {goalType === 'distance' ? (
          <div>
            <input
              type="range"
              min="0.5"
              max="21.0"
              step="0.5"
              value={goalValue}
              onChange={(e) => setGoalValue(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-2">
              <span>0.5 km</span>
              <span>10.0 km</span>
              <span>21.0 km</span>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="range"
              min="500"
              max="30000"
              step="500"
              value={goalValue}
              onChange={(e) => setGoalValue(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-2">
              <span>500 steps</span>
              <span>15,000 steps</span>
              <span>30,000 steps</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {[
            goalType === 'distance' ? 1 : 1000,
            goalType === 'distance' ? 3 : 5000,
            goalType === 'distance' ? 5 : 10000,
            goalType === 'distance' ? 10 : 20000,
          ].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setGoalValue(val)}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              {goalType === 'distance' ? `${val} km` : val.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // Render Step 3: Stake selection
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Set Stake Amount</h2>
        <p className="text-sm text-zinc-500 mt-1">This amount will be locked and returned on completion.</p>
      </div>

      {/* Wallet Balance Info */}
      <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-850 text-xs">
        <span className="text-zinc-500 font-semibold">Your Wallet Balance:</span>
        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
          ${parseFloat(balance).toFixed(2)} cUSD
        </span>
      </div>

      {/* Stake Quick Picks */}
      <div className="grid grid-cols-5 gap-1.5">
        {stakeOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleStakeSelect(opt)}
            className={`py-3 text-sm font-extrabold font-mono rounded-xl border transition-all ${
              !isCustomStakeActive && stakeAmount === opt
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                : 'border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            ${opt}
          </button>
        ))}
      </div>

      {/* Custom Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Coins className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="number"
          placeholder="Custom Stake (e.g. 0.05)"
          value={customStake}
          onChange={(e) => handleCustomStakeChange(e.target.value)}
          className={`block w-full rounded-xl border py-3.5 pl-10 pr-16 text-sm outline-none transition-all dark:bg-zinc-900 ${
            isCustomStakeActive
              ? 'border-emerald-500 ring-2 ring-emerald-500/10'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">cUSD</span>
        </div>
      </div>

      {/* Safety warnings */}
      {isStakeHighPercent && !isBalanceInsufficient && (
        <div className="flex gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Warning: Staking <b>${stakeValue.toFixed(2)} cUSD</b> represents more than 20% of your total balance. Please exercise skin in the game responsibly.
          </p>
        </div>
      )}

      {isBalanceInsufficient && (
        <div className="flex gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Insufficient funds. You need <b>${stakeValue.toFixed(2)} cUSD</b> but only have <b>${userBalanceFloat.toFixed(2)} cUSD</b>.
          </p>
        </div>
      )}
    </div>
  )

  // Render Step 4: Duration Options
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Set Time Window</h2>
        <p className="text-sm text-zinc-500 mt-1">Complete your goal inside this window or forfeit the stake.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {durationOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setDurationHours(opt.value)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              durationHours === opt.value
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 hover:border-zinc-300'
            }`}
          >
            <Clock className="h-5 w-5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <div>
              <span className="block text-sm font-semibold">{opt.label}</span>
              <span className="block text-[10px] text-zinc-400 mt-0.5">Timeline limit</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  // Render Step 5: Review
  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Review Commitment</h2>
        <p className="text-sm text-zinc-500 mt-1">Review parameters before confirming on Celo.</p>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-150 dark:divide-zinc-850">
        {/* Goal summary */}
        <div className="p-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Goal details</span>
            <span className="block text-lg font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">
              {goalType === 'distance' ? `${goalValue.toFixed(1)} KM` : `${goalValue.toLocaleString()} Steps`}
            </span>
          </div>
          <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            {goalType === 'distance' ? <Compass className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
          </span>
        </div>

        {/* Stake summary */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Stake amount</span>
            <span className="block text-lg font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">
              ${parseFloat(finalStake).toFixed(2)} cUSD
            </span>
          </div>
          <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Coins className="h-6 w-6" />
          </span>
        </div>

        {/* Duration summary */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Time window</span>
            <span className="block text-lg font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">
              {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}
            </span>
          </div>
          <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Clock className="h-6 w-6" />
          </span>
        </div>

        {/* Estimated reward */}
        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
              <Award className="h-3 w-3" /> Reward estimate
            </span>
            <span className="block text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              +${bonusEstimateMin} ~ ${bonusEstimateMax} <span className="text-xs font-semibold text-zinc-400">cUSD</span>
            </span>
            <span className="block text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Stake returned + bonus paid from pool on completion.
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  // Loading Screen Layout
  if (isPending || isConfirming) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto p-8 text-center bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl my-12 animate-in fade-in duration-300">
        <div className="relative flex items-center justify-center h-20 w-20 mb-6">
          {/* Pulsing ring */}
          <span className="absolute animate-ping inline-flex h-12 w-12 rounded-full bg-emerald-400 opacity-20"></span>
          <span className="absolute animate-pulse inline-flex h-16 w-16 rounded-full bg-emerald-400 opacity-10"></span>
          <div className="relative animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
          {isConfirming ? 'Confirming On-Chain' : 'Signature Requested'}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 max-w-xs leading-relaxed font-semibold">
          {statusMessage}
        </p>
        <div className="mt-8 py-2 px-4 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          MiniPay native transaction
        </div>
      </div>
    )
  }

  // Active Commitment Guard Block
  if (isConnected && hasActiveCommitment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto p-8 text-center bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl my-12 animate-in fade-in duration-300">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500 mb-6">
          <Flame className="h-8 w-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Active Commitment Exists</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 max-w-xs leading-relaxed">
          You already have an active accountability stake on-chain. Complete or forfeit your current run before starting a new one.
        </p>
        <div className="mt-6 flex flex-col gap-2 w-full">
          <button
            onClick={() => router.push(`/session/${activeCommitmentId}`)}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
          >
            Go to Active Session
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold transition-all"
          >
            Back to Explore
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto my-10 px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Step Progress indicators */}
      <div className="flex items-center justify-between mb-8 px-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= s
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'
              }`}
            >
              {s}
            </div>
            {s < 5 && (
              <div
                className={`h-0.5 w-6 sm:w-10 transition-all duration-300 ${
                  step > s ? 'bg-emerald-500' : 'bg-zinc-250 dark:bg-zinc-850'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card Wrapper */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-150/80 dark:border-zinc-850 p-6 shadow-md">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

        {/* Local error message alerts */}
        {(localError || txError) && (
          <div className="flex items-center gap-2 p-3 mt-6 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="leading-tight">{localError || txError}</span>
          </div>
        )}

        {/* Card Actions */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="py-3 px-4 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold flex items-center justify-center shrink-0 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 px-6 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-extrabold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <>
              {isConnected ? (
                <button
                  onClick={handleSubmitCommitment}
                  className="flex-1 py-3.5 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-extrabold shadow-md hover:shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm Commitment</span>
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className="flex-1 py-3.5 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-extrabold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Coins className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
