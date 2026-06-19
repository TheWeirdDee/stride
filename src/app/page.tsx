'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAccount } from 'wagmi'
import { useRouter, useSearchParams } from 'next/navigation'
import LandingStyles from '@/components/landing/LandingStyles'
import LandingNav from '@/components/landing/LandingNav'
import LandingHero from '@/components/landing/LandingHero'
import LandingMarketing from '@/components/landing/LandingMarketing'
import { GuestProfile } from '@/components/landing/types'
import { isMiniPay } from '@/utils/minipay'

function LandingPageContent() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null)

  // Load the saved identity. In MiniPay the wallet auto-connects, but the user
  // still needs an account — so if they have no identity yet, send them through
  // the single onboarding (signup) so their profile isn't "anonymous".
  useEffect(() => {
    let profile: GuestProfile | null = null
    try {
      const raw = typeof window !== 'undefined' && localStorage.getItem('stride_guest_profile')
      if (raw) profile = JSON.parse(raw)
    } catch {}
    setGuestProfile(profile)
    if (!profile && isMiniPay()) {
      router.replace('/signup')
    }
  }, [router])

  // Legacy ?onboard=true link → the single onboarding (signup).
  useEffect(() => {
    if (searchParams.get('onboard') === 'true') {
      router.replace('/signup')
    }
  }, [searchParams, router])

  return (
    <div className="landing-page-container">
      <LandingStyles />
      <LandingNav
        isConnected={isConnected}
        guestProfile={guestProfile}
        onGetStarted={() => router.push('/signup')}
        onContinue={() => router.push('/explore')}
      />
      <LandingHero
        isConnected={isConnected}
        guestProfile={guestProfile}
        onGetStarted={() => router.push('/signup')}
        onContinue={() => router.push('/explore')}
        onConnectWallet={() => router.push('/login')}
        onStartCommitment={() => router.push('/commitment/new')}
      />
      <LandingMarketing
        onGetStarted={() => router.push('/signup')}
      />
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
        <p className="text-zinc-500 dark:text-zinc-400 font-semibold">Loading Stride...</p>
      </div>
    }>
      <LandingPageContent />
    </Suspense>
  )
}
