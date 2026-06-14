'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import LandingStyles from '@/components/landing/LandingStyles'
import LandingNav from '@/components/landing/LandingNav'
import LandingHero from '@/components/landing/LandingHero'
import LandingMarketing from '@/components/landing/LandingMarketing'
import OnboardingModal from '@/components/onboarding/OnboardingModal'
import { GuestProfile } from '@/components/landing/types'

function LandingPageContent() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Onboarding States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [obScreen, setObScreen] = useState<string>('splash')
  const [obSlideIdx, setObSlideIdx] = useState(0)
  const [obMode, setObMode] = useState<'Walk' | 'Run'>('Walk')
  const [obDist, setObDist] = useState(1)
  const [obStake, setObStake] = useState(1)
  const [obConnecting, setObConnecting] = useState(false)
  const [obName, setObName] = useState('')
  const [obHeight, setObHeight] = useState('')
  const [obWeight, setObWeight] = useState('')
  const obNameRef = useRef(obName)
  useEffect(() => { obNameRef.current = obName }, [obName])
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)

  const [isMiniPay, setIsMiniPay] = useState(false)
  useEffect(() => {
    setIsMiniPay(!!(window as any).ethereum?.isMiniPay)
  }, [])

  // Guest (no-wallet) profile — persisted to localStorage + Supabase
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null)
  const [guestNick, setGuestNick] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestCity, setGuestCity] = useState('')
  const [guestActivity, setGuestActivity] = useState<'walk' | 'run' | 'both'>('walk')
  const [guestSaving, setGuestSaving] = useState(false)

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' && localStorage.getItem('stride_guest_profile')
      if (raw) setGuestProfile(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    if (searchParams.get('onboard') === 'true') {
      setObScreen('splash')
      setIsOnboardingOpen(true)
      router.replace('/')
    }
  }, [searchParams, router])

  useEffect(() => {
    if (isOnboardingOpen) {
      setTimeout(() => {
        console.log("--- DIAGNOSTICS START ---");
        const obOverlay = document.getElementById('onboarding-overlay');
        if (!obOverlay) {
          console.log("DIAGNOSTIC_ERR: Onboarding overlay element not found");
          return;
        }
        const buttons = Array.from(obOverlay.querySelectorAll('button, a, [role="button"]'));
        const getStartedBtn = buttons.find(el =>
          (el.textContent || '').trim().toLowerCase().includes('get started')
        );

        if (!getStartedBtn) {
          console.log("DIAGNOSTIC_ERR: Button 'Get started' not found inside onboarding");
          return;
        }

        const rect = getStartedBtn.getBoundingClientRect();
        const X = rect.left + rect.width / 2;
        const Y = rect.top + rect.height / 2;
        const elementAtPoint = document.elementFromPoint(X, Y);

        console.log("DIAGNOSTIC_BUTTON_TAG:", getStartedBtn.tagName);
        console.log("DIAGNOSTIC_BUTTON_CLASS:", getStartedBtn.className);
        console.log("DIAGNOSTIC_BUTTON_HTML:", getStartedBtn.outerHTML);
        console.log("DIAGNOSTIC_BUTTON_POINTER_EVENTS:", window.getComputedStyle(getStartedBtn).pointerEvents);
        console.log("DIAGNOSTIC_BUTTON_RECT:", JSON.stringify(rect));
        console.log("DIAGNOSTIC_CENTER_COORDS:", X, Y);

        if (elementAtPoint) {
          console.log("DIAGNOSTIC_POINT_TAG:", elementAtPoint.tagName);
          console.log("DIAGNOSTIC_POINT_CLASS:", elementAtPoint.className);
          console.log("DIAGNOSTIC_POINT_HTML:", elementAtPoint.outerHTML);
          console.log("DIAGNOSTIC_POINT_POINTER_EVENTS:", window.getComputedStyle(elementAtPoint).pointerEvents);
        } else {
          console.log("DIAGNOSTIC_POINT_ERR: No element at point");
        }
        console.log("--- DIAGNOSTICS END ---");
      }, 1500);
    }
  }, [isOnboardingOpen]);

  const go = (screen: string) => {
    if (screen === 'app:home') {
      connectAndSave()
    } else if (screen === 'app:explore') {
      if (guestProfile) {
        router.push('/community')
      } else {
        setObScreen('guest-profile')
      }
    } else {
      setObScreen(screen)
    }
  }

  useEffect(() => {
    if (isConnected && address && isSubmittingProfile) {
      const saveProfile = async () => {
        try {
          if (supabase) {
            const { error } = await supabase
              .from('users')
              .upsert({
                wallet_address: address,
                nickname: obNameRef.current || 'Anonymous Mover',
                city: 'Unknown',
                fitness_level: 'beginner',
              }, { onConflict: 'wallet_address' })

            if (error) {
              console.error('Error upserting user onboarding profile:', error)
            }
          }

          setIsSubmittingProfile(false)
          router.push('/commitment/new')
        } catch (err) {
          console.error(err)
          setIsSubmittingProfile(false)
          router.push('/commitment/new')
        }
      }
      saveProfile()
    }
  }, [isConnected, address, isSubmittingProfile, router])

  const connectAndSave = async () => {
    setIsSubmittingProfile(true)
    try {
      const connector = connectors.find(c => c.id === 'injected') || connectors[0]
      if (connector) {
        connect({ connector })
      } else {
        setIsSubmittingProfile(false)
        router.push('/commitment/new')
      }
    } catch (err) {
      console.error(err)
      setIsSubmittingProfile(false)
      router.push('/commitment/new')
    }
  }

  const saveGuestProfile = async () => {
    if (!guestNick.trim() || !guestEmail.trim() || !guestEmail.includes('@')) return
    setGuestSaving(true)
    const guestId = `guest_${typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`
    const profile: GuestProfile = {
      id: guestId,
      nickname: guestNick.trim(),
      email: guestEmail.trim().toLowerCase(),
      city: guestCity.trim(),
      activity: guestActivity,
    }
    try { localStorage.setItem('stride_guest_profile', JSON.stringify(profile)) } catch {}
    if (supabase) {
      try {
        await supabase.from('users').upsert({
          wallet_address: guestId,
          nickname: profile.nickname,
          city: profile.city || 'Unknown',
          fitness_level: 'beginner',
          streak_current: 0,
          streak_best: 0,
          total_distance: 0,
          total_earnings: 0,
        }, { onConflict: 'wallet_address' })
      } catch { /* non-fatal — localStorage is the fallback */ }
    }
    setGuestProfile(profile)
    setGuestSaving(false)
    // Navigate while the overlay is still mounted so the landing page never
    // flashes between closing the modal and the route changing. The onboarding
    // page unmounts once navigation lands.
    router.push('/community')
  }

  const openOnboarding = (screen = 'splash') => {
    setObScreen(screen)
    setIsOnboardingOpen(true)
  }

  return (
    <>
      <div className="landing-page-container">
        <LandingStyles />
        <LandingNav
          isConnected={isConnected}
          guestProfile={guestProfile}
          onGetStarted={() => openOnboarding('splash')}
          onContinue={() => router.push('/community')}
        />
        <LandingHero
          guestProfile={guestProfile}
          onGetStarted={() => openOnboarding('splash')}
          onContinue={() => router.push('/community')}
          onConnectWallet={() => openOnboarding('wallet')}
        />
        <LandingMarketing
          onGetStarted={() => openOnboarding('splash')}
        />
      </div>

      <OnboardingModal
        isOpen={isOnboardingOpen}
        obScreen={obScreen}
        obSlideIdx={obSlideIdx}
        obMode={obMode}
        obDist={obDist}
        obStake={obStake}
        obConnecting={obConnecting}
        obName={obName}
        obHeight={obHeight}
        obWeight={obWeight}
        isSubmittingProfile={isSubmittingProfile}
        isMiniPay={isMiniPay}
        guestProfile={guestProfile}
        guestNick={guestNick}
        guestEmail={guestEmail}
        guestCity={guestCity}
        guestActivity={guestActivity}
        guestSaving={guestSaving}
        isConnected={isConnected}
        connectors={connectors as any[]}
        onClose={() => setIsOnboardingOpen(false)}
        onGo={go}
        onSetObSlideIdx={setObSlideIdx}
        onSetObMode={setObMode}
        onSetObDist={setObDist}
        onSetObStake={setObStake}
        onSetObName={setObName}
        onSetObHeight={setObHeight}
        onSetObWeight={setObWeight}
        onSetGuestNick={setGuestNick}
        onSetGuestEmail={setGuestEmail}
        onSetGuestCity={setGuestCity}
        onSetGuestActivity={setGuestActivity}
        onSaveGuestProfile={saveGuestProfile}
        onConnect={(connector) => connect({ connector })}
        onConnectAndSave={connectAndSave}
      />
    </>
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
