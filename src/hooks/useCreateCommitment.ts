'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useConfig } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { readContract, waitForTransactionReceipt } from 'wagmi/actions'
import { CUSD_ADDRESS, COMMITMENT_CONTRACT } from '@/utils/constants'
import { cusdABI } from '@/abi/cusd'
import { commitmentABI } from '@/abi/commitment'
import { supabase } from '@/utils/supabase'

export function useCreateCommitment() {
  const { address, isConnected } = useAccount()
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()

  const [isPending, setIsPending] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('Idle')
  const [error, setError] = useState<string | null>(null)

  // 1. Read cUSD Balance
  const { data: rawBalance, refetch: refetchBalance } = useReadContract({
    address: CUSD_ADDRESS,
    abi: cusdABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const balance = rawBalance ? formatUnits(rawBalance, 18) : '0.00'

  // 2. Read Active Commitment ID from Chain
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
      const { data, error: selectError } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('wallet_address', userAddress)
        .maybeSingle()

      if (selectError) throw selectError

      if (!data) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            wallet_address: userAddress,
            nickname: 'Anonymous Mover',
            streak_current: 0,
            streak_best: 0,
            total_distance: 0,
            total_earnings: 0,
            fitness_level: 'beginner',
          })
        if (insertError) throw insertError
      }
    } catch (err) {
      console.error('Error in ensureUserExists:', err)
    }
  }

  // Create commitment function
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
      const stakeWei = parseUnits(stakeAmount, 18)

      // Ensure user profile exists in Supabase first
      await ensureUserExists(address)

      // Step A: Check current allowance
      setStatusMessage('Checking cUSD allowance...')
      const allowance = await readContract(config, {
        address: CUSD_ADDRESS,
        abi: cusdABI,
        functionName: 'allowance',
        args: [address, COMMITMENT_CONTRACT],
      })

      // Step B: Approve if allowance is insufficient
      if ((allowance as bigint) < stakeWei) {
        setStatusMessage('Approving cUSD spend (Please sign in wallet)...')
        const approveHash = await writeContractAsync({
          address: CUSD_ADDRESS,
          abi: cusdABI,
          functionName: 'approve',
          args: [COMMITMENT_CONTRACT, stakeWei],
        })

        setStatusMessage('Waiting for approval confirmation...')
        await waitForTransactionReceipt(config, { hash: approveHash })
      }

      // Step C: Call createCommitment on StrideCommitment contract
      setStatusMessage('Creating commitment on-chain (Please sign in wallet)...')
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

      // Step D: Retrieve the newly created commitment ID from the chain
      setStatusMessage('Syncing data with the database...')
      const commitmentIdChain = await readContract(config, {
        address: COMMITMENT_CONTRACT,
        abi: commitmentABI,
        functionName: 'getActiveCommitmentId',
        args: [address],
      })

      // Step E: Save the commitment to Supabase
      const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString()
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
        // We do not fail the main user flow if DB insert fails since on-chain TX succeeded,
        // but we flag it in logs.
      }

      // Refresh cache/state
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
