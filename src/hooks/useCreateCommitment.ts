'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useConfig, useBalance } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { COMMITMENT_CONTRACT, CUSD_ADDRESS } from '@/utils/constants'
import { commitmentABI } from '@/abi/commitment'
import { cusdABI } from '@/abi/cusd'
import { supabase } from '@/utils/supabase'
import { celoTxOverrides } from '@/utils/minipay'

export function useCreateCommitment() {
  const { address, isConnected } = useAccount()
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()

  const [isPending, setIsPending] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('Idle')
  const [error, setError] = useState<string | null>(null)

  // Read native CELO balance (gas reference only)
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    query: { enabled: !!address },
  })

  const balance = balanceData ? formatEther(balanceData.value) : '0.00'

  // Read cUSD balance — this is what the contract actually stakes
  const { data: cusdBalanceRaw, refetch: refetchCusdBalance } = useReadContract({
    address: CUSD_ADDRESS,
    abi: cusdABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const cusdBalance = cusdBalanceRaw != null ? formatEther(cusdBalanceRaw as bigint) : '0.00'

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
          // Carry over the guest profile created during onboarding, if any.
          try {
            const raw = localStorage.getItem('stride_guest_profile')
            if (raw) {
              const g = JSON.parse(raw)
              localNickname = g?.nickname || localNickname
              localCity = g?.city || localCity
            }
          } catch {}
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

    // Guard against a missing on-chain config so we surface a clear message
    // instead of viem's cryptic `Address "undefined" is invalid`.
    if (!COMMITMENT_CONTRACT || !CUSD_ADDRESS) {
      const errMsg = 'App not configured: the contract address is missing. Set NEXT_PUBLIC_COMMITMENT_CONTRACT (and restart the dev server / redeploy).'
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
        ...celoTxOverrides(),
      })

      setIsPending(false)
      setIsConfirming(true)
      setStatusMessage('Waiting for cUSD approval confirmation...')
      const approveReceipt = await waitForTransactionReceipt(config, { hash: approveHash })
      if (approveReceipt.status === 'reverted') throw new Error('cUSD approval failed on-chain.')

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
        ...celoTxOverrides(),
      })

      setIsPending(false)
      setIsConfirming(true)
      setStatusMessage('Waiting for commitment transaction confirmation...')
      const commitReceipt = await waitForTransactionReceipt(config, { hash: commitHash })
      if (commitReceipt.status === 'reverted') throw new Error('Creating the commitment failed on-chain.')

      setStatusMessage('Syncing data with the database...')
      const { readContract } = await import('wagmi/actions')
      const commitmentIdChain = await readContract(config, {
        address: COMMITMENT_CONTRACT,
        abi: commitmentABI,
        functionName: 'getActiveCommitmentId',
        args: [address],
      })

      // If the chain reports no active commitment, creation didn't take — never
      // navigate to a zero-id session (which renders as a phantom "expired" stake).
      const ZERO = `0x${'0'.repeat(64)}`
      if (!commitmentIdChain || commitmentIdChain === ZERO) {
        throw new Error('Commitment was not created on-chain. The transaction may have been rejected — please try again.')
      }

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
      await refetchCusdBalance()
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
    cusdBalance,
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
