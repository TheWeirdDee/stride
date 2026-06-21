'use client'

import { createConfig, http } from 'wagmi'
import { fallback } from 'viem'
import { celo } from 'viem/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

// Multiple free Celo RPCs behind a fallback transport. forno alone is unreliable
// (rate-limits / "Failed to fetch" / hung receipt polling on some networks), so
// viem rotates to the next endpoint automatically when one fails. No paid RPC needed.
const RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_RPC_URL,
  'https://forno.celo.org',
  'https://rpc.ankr.com/celo',
  'https://celo.drpc.org',
  'https://1rpc.io/celo',
].filter(Boolean) as string[]

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    injected(),
    ...(wcProjectId ? [walletConnect({ projectId: wcProjectId })] : []),
  ],
  transports: {
    [celo.id]: fallback(RPC_ENDPOINTS.map((url) => http(url, { timeout: 12_000 }))),
  },
  ssr: true,
})
