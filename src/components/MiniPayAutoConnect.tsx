'use client'

import { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { isMiniPay } from '@/utils/minipay'

/**
 * Canonical MiniPay auto-connect (Celo Composer pattern): when the app is opened
 * inside MiniPay, connect through wagmi's injected connector so React state
 * (`useAccount`) reflects the connection — no friction, no "connect wallet" step.
 * Must live inside <WagmiProvider> to access the wagmi hooks.
 */
export default function MiniPayAutoConnect() {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  useEffect(() => {
    if (typeof window === 'undefined' || !isMiniPay() || isConnected) return
    const injected = connectors.find((c) => c.id === 'injected') || connectors[0]
    if (injected) connect({ connector: injected })
  }, [isConnected, connect, connectors])

  return null
}
