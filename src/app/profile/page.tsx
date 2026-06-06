'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { supabase } from '@/utils/supabase'
import { CUSD_ADDRESS } from '@/utils/constants'
import { cusdABI } from '@/abi/cusd'
import { useRouter } from 'next/navigation'
import {
  User,
  MapPin,
  Flame,
  Award,
  Wallet,
  Activity,
  Compass,
  History,
  LogOut,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  AlertCircle
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
  const [commitments, setCommitments] = useState<CommitmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Read cUSD balance
  const { data: rawBalance } = useReadContract({
    address: CUSD_ADDRESS,
    abi: cusdABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  })

  const balance = rawBalance ? Number(formatEther(rawBalance)).toFixed(2) : '0.00'

  // Load profile (Guest or Web3)
  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      if (isConnected && address) {
        try {
          // Check if profile exists in database
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', address)
            .maybeSingle()

          if (error) throw error

          let dbUser = data

          // If connected but user doesn't exist in Supabase, sync local state
          if (!dbUser) {
            setSyncing(true)
            const localNickname = localStorage.getItem('stride_onboarding_nickname') || 'Anonymous Mover'
            const localCity = localStorage.getItem('stride_onboarding_city') || 'Lagos'
            const localFitness = localStorage.getItem('stride_onboarding_fitness') || 'beginner'

            const { data: insertedUser, error: insertError } = await supabase
              .from('users')
              .insert({
                wallet_address: address,
                nickname: localNickname,
                city: localCity,
                fitness_level: localFitness,
                streak_current: 0,
                streak_best: 0,
                total_distance: 0,
                total_earnings: 0
              })
              .select()
              .single()

            if (insertError) {
              console.error('Error inserting new user:', insertError)
            } else if (insertedUser) {
              dbUser = insertedUser
            }
            setSyncing(false)
          }

          if (dbUser) {
            setProfile({
              nickname: dbUser.nickname || 'Anonymous Mover',
              city: dbUser.city || 'Lagos',
              fitness_level: dbUser.fitness_level || 'beginner',
              streak_current: dbUser.streak_current || 0,
              streak_best: dbUser.streak_best || 0,
              total_distance: dbUser.total_distance || 0,
              total_earnings: dbUser.total_earnings || 0,
            })
          }

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
          console.error('Database load failed, fallback to local storage:', err)
          loadLocalFallback()
        } finally {
          setLoading(false)
        }
      } else {
        // Guest user
        loadLocalFallback()
        setLoading(false)
      }
    }

    function loadLocalFallback() {
      if (typeof window !== 'undefined') {
        const localNickname = localStorage.getItem('stride_onboarding_nickname') || ''
        const localCity = localStorage.getItem('stride_onboarding_city') || ''
        const localFitness = (localStorage.getItem('stride_onboarding_fitness') as 'beginner' | 'intermediate' | 'active') || 'beginner'
        
        if (localNickname) {
          setProfile({
            nickname: localNickname,
            city: localCity,
            fitness_level: localFitness,
            streak_current: 0,
            streak_best: 0,
            total_distance: 0,
            total_earnings: 0,
          })
        } else {
          setProfile(null)
        }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
      case 'forfeited':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30'
      case 'active':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 animate-pulse'
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-900/30'
    }
  }

  // Loading Screen
  if (loading || syncing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center">
        <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-semibold">{syncing ? 'Syncing guest settings to Celo...' : 'Loading profile...'}</p>
      </div>
    )
  }

  // Not Onboarded and Not Connected State
  if (!profile && !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-150 dark:border-zinc-850 max-w-md mx-auto my-12 shadow-sm animate-in fade-in duration-300">
        <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center mb-6">
          <User className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          No Profile Found
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 max-w-xs leading-normal">
          Complete the onboarding questions to set up your local preferences and browse guides.
        </p>
        <button
          onClick={() => router.push('/?onboard=true')}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold transition-all text-sm active:scale-95 shadow-md"
        >
          Get Started
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      
      {/* Upper Grid: Profile Details Card + Wallet & Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Profile Details Card */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-150 dark:border-zinc-850 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-500 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-md shadow-emerald-500/10">
                {profile?.nickname[0]}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-50">
                  {profile?.nickname}
                </h1>
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  <MapPin className="h-3 w-3 text-emerald-500" /> {profile?.city || 'No City Set'}
                </span>
              </div>
            </div>
            
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850">
              {profile?.fitness_level}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center">
            <div>
              <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Current Streak</span>
              <span className="block text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 mt-1 font-mono flex items-center justify-center gap-1">
                <Flame className="h-5 w-5 text-amber-500 fill-amber-500/10" /> {profile?.streak_current}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Distance</span>
              <span className="block text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 mt-1 font-mono flex items-center justify-center gap-1">
                <Compass className="h-5 w-5 text-emerald-500" /> {(profile ? profile.total_distance / 1000 : 0).toFixed(1)} <small className="text-xs text-zinc-400">KM</small>
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Earnings</span>
              <span className="block text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono flex items-center justify-center gap-1">
                <Award className="h-5 w-5" /> ${profile?.total_earnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet & Sync Card */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-850 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Wallet className="h-4 w-4" /> Account Status
            </span>
            {isConnected ? (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            )}
          </div>

          {isConnected && address ? (
            <div className="flex flex-col gap-4">
              <div>
                <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Wallet Address</span>
                <span className="block text-sm font-mono font-bold text-zinc-800 dark:text-zinc-250 mt-1">
                  {truncateAddress(address)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider">cUSD Balance</span>
                <span className="block text-xl font-mono font-extrabold text-zinc-800 dark:text-zinc-50 mt-1">
                  ${balance} <small className="text-xs font-normal text-zinc-400">cUSD</small>
                </span>
              </div>
              <button
                onClick={() => disconnect()}
                className="w-full mt-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs font-bold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="leading-normal font-semibold">
                  You are exploring as a guest. Connect your wallet to save data on-chain and earn cUSD rewards.
                </p>
              </div>
              <button
                onClick={handleConnect}
                className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Wallet className="h-4 w-4" /> Connect Wallet
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Lower Block: Commitment History */}
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-150 dark:border-zinc-850 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-500" />
            Your Commitment History
          </h2>
          {isConnected && (
            <button
              onClick={() => router.push('/commitment/new')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5" /> New Commitment
            </button>
          )}
        </div>

        {isConnected ? (
          commitments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {commitments.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-300">
                      Stake: ${c.stake_amount.toFixed(2)} cUSD
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Goal details</span>
                    <span className="block text-base font-extrabold text-zinc-850 dark:text-zinc-100 mt-0.5">
                      {c.goal_type === 'distance' ? `${(c.goal_value / 1000).toFixed(1)} KM` : `${c.goal_value.toLocaleString()} Steps`}
                    </span>
                  </div>

                  <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-xs text-zinc-400 dark:text-zinc-500">
                    <span>
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    {c.status === 'completed' && c.bonus_earned > 0 && (
                      <span className="text-emerald-500 font-bold font-mono">
                        +${c.bonus_earned.toFixed(4)} reward
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <Compass className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-350">No commitments found</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 mb-4">
                You haven&apos;t staked cUSD on a workout yet.
              </p>
              <button
                onClick={() => router.push('/commitment/new')}
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl text-xs font-bold"
              >
                Start Your First Commitment
              </button>
            </div>
          )
        ) : (
          <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <Wallet className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-350">Wallet Not Connected</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 mb-4">
              Connecting a wallet allows you to see transaction history and active on-chain stakes.
            </p>
            <button
              onClick={handleConnect}
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
