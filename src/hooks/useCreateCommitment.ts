'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useConfig, useBalance } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { COMMITMENT_CONTRACT, CUSD_ADDRESS } from '@/utils/constants'
import { commitmentABI } from '@/abi/commitment'
import { cusdABI } from '@/abi/cusd'
import { supabase } from '@/utils/supabase'

export function useCreateCommitment() {
  const { address, isConnected } = useAccount()
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()

  const [isPending, setIsPending] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('Idle')
  const [error, setError] = useState<string | null>(null)

  // Read native CELO balance
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    query: { enabled: !!address },
  })

  const balance = balanceData ? formatEther(balanceData.value) : '0.00'

  // Read Active Commitment ID from Chain
  const { data: rawActiveId, refetch: refetchActiveCommitment } = useReadContract({
    address: COMMITMENT_CONTRACT,
    abi: commitmentABI,
    functionName: 'getActiveCommitmentId',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // bytes32(0) means no active commitment
  const hasActiveCommitment = rawActiveId && rawActiveId !== '0x0000000000000000000000000000000000000000000000000000000000000000'

  // Ensure user profile exists in Supabase
  const ensureUserExists = async (userAddress: string) => {
    try {
      if (!supabase) return
      const { data, error: selectError } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('wallet_address', userAddress)
        .maybeSingle()

      if (selectError) throw selectError

      if (!data) {
        let localNickname = 'Anonymous Mover'
        let localCity = 'Lagos'
        let localFitness = 'beginner'

        if (typeof window !== 'undefined') {
          localNickname = localStorage.getItem('stride_onboarding_nickname') || localNickname
          localCity = localStorage.getItem('stride_onboarding_city') || localCity
          localFitness = localStorage.getItem('stride_onboarding_fitness') || localFitness
        }

        const { error: insertError } = await supabase
          .from('users')
          .insert({
            wallet_address: userAddress,
            nickname: localNickname,
            city: localCity,
            streak_current: 0,
            streak_best: 0,
            total_distance: 0,
            total_earnings: 0,
            fitness_level: localFitness,
          })
        if (insertError) throw insertError
      }
    } catch (err) {
      console.error('Error in ensureUserExists:', err)
    }
  }

  // Create commitment — stake amount sent as native CELO value
  const createCommitment = async (
    goalType: 'distance' | 'steps',
    goalValue: number,
    stakeAmount: string,
    durationSeconds: number
  ) => {
    if (!isConnected || !address) {
      const errMsg = 'Wallet is not connected.'
      setError(errMsg)
      throw new Error(errMsg)
    }

    setIsPending(true)
    setError(null)
    setStatusMessage('Preparing transaction...')

    try {
      const stakeWei = parseEther(stakeAmount)

      await ensureUserExists(address)

      setStatusMessage('Approving cUSD stake (Please confirm in wallet)...')
      const approveHash = await writeContractAsync({
        address: CUSD_ADDRESS,
        abi: cusdABI,
        functionName: 'approve',
        args: [COMMITMENT_CONTRACT, stakeWei],
      })
      
      setIsPending(false)
      setIsConfirming(true)
      setStatusMessage('Waiting for cUSD approval confirmation...')
      await waitForTransactionReceipt(config, { hash: approveHash })

      setIsPending(true)
      setIsConfirming(false)
      setStatusMessage('Creating commitment on-chain (Please confirm in wallet)...')
      const goalDistance = goalType === 'distance' ? BigInt(goalValue) : BigInt(0)
      const goalSteps = goalType === 'steps' ? BigInt(goalValue) : BigInt(0)

      const commitHash = await writeContractAsync({
        address: COMMITMENT_CONTRACT,
        abi: commitmentABI,
        functionName: 'createCommitment',
        args: [goalDistance, goalSteps, BigInt(durationSeconds), stakeWei],
      })

      setIsPending(false)
      setIsConfirming(true)
      setStatusMessage('Waiting for commitment transaction confirmation...')
      await waitForTransactionReceipt(config, { hash: commitHash })

      setStatusMessage('Syncing data with the database...')
      const { readContract } = await import('wagmi/actions')
      const commitmentIdChain = await readContract(config, {
        address: COMMITMENT_CONTRACT,
        abi: commitmentABI,
        functionName: 'getActiveCommitmentId',
        args: [address],
      })

      const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString()
      if (supabase) {
        const { error: dbError } = await supabase
          .from('commitments')
          .insert({
            commitment_id_chain: commitmentIdChain,
            wallet_address: address,
            stake_amount: parseFloat(stakeAmount),
            goal_type: goalType,
            goal_value: goalValue,
            status: 'active',
            expires_at: expiresAt,
          })

        if (dbError) {
          console.error('Error inserting commitment into database:', dbError)
        }
      }

      await refetchBalance()
      await refetchActiveCommitment()

      setStatusMessage('Success!')
      setIsConfirming(false)
      return { success: true, commitmentId: commitmentIdChain }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error creating commitment:', err)
      const errMsg = err?.shortMessage || err?.message || 'Transaction failed.'
      setError(errMsg)
      setIsPending(false)
      setIsConfirming(false)
      setStatusMessage('Error')
      throw err
    }
  }

  return {
    balance,
    hasActiveCommitment,
    activeCommitmentId: rawActiveId,
    refetchBalance,
    refetchActiveCommitment,
    createCommitment,
    isPending,
    isConfirming,
    statusMessage,
    error,
  }
}
