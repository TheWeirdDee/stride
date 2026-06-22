'use client'

import { ReactNode, useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/config/wagmi'
import { registerMiniPayHook } from '@/utils/minipay'
import { enforceEphemeralSession } from '@/utils/auth'
import MiniPayAutoConnect from '@/components/MiniPayAutoConnect'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    registerMiniPayHook()
    // Drop "remember me = off" sessions once the browser has been restarted.
    enforceEphemeralSession()
    // Register the PWA service worker (installable + offline fallback).
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // Create the QueryClient inside the component state to ensure
  // a unique query client instance per request in server-side rendering
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniPayAutoConnect />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
