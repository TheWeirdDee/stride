'use client'

import { createConfig, http } from 'wagmi'
import { celo } from 'viem/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    injected(),
    ...(wcProjectId ? [walletConnect({ projectId: wcProjectId })] : []),
  ],
  transports: {
    [celo.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://forno.celo.org'),
  },
  ssr: true,
})
