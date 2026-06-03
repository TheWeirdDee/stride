'use client'

import { createConfig, http } from 'wagmi'
import { celo } from 'viem/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [injected()],
  transports: {
    [celo.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://forno.celo.org'),
  },
  ssr: true,
})
