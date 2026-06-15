'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'
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
        router.push('/explore')
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
    router.push('/explore')
  }

  const openOnboarding = (screen = 'splash') => {
    setObScreen(screen)
    setIsOnboardingOpen(true)
  }

  const hasAccount = isConnected || !!guestProfile

  return (
    <>
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header className="sd-topbar">
          <span className="sd-logo">
            <span className="sd-logo-mark">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06080a" strokeWidth="3" strokeLinecap="round"><path d="M5 17l5-10 4 7 5-9" /></svg>
            </span>
            <span className="sd-logo-word">STRIDE</span>
          </span>
          {hasAccount ? (
            <button onClick={() => router.push('/explore')} className="sd-wallet-btn is-on">Open app</button>
          ) : (
            <button onClick={() => openOnboarding('splash')} className="sd-wallet-btn">Get started</button>
          )}
        </header>

        <div className="sd-page" style={{ paddingBottom: 40 }}>
          {/* Hero */}
          <div className="sd-rise-1">
            <div className="sd-eyebrow">Stake on yourself</div>
            <h1 className="sd-display" style={{ fontSize: 50, marginTop: 14 }}>
              Put money<br />where your<br /><span style={{ color: '#cdfb46' }}>miles are.</span>
            </h1>
            <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.5, color: 'var(--muted)', maxWidth: 320 }}>
              Stake a little cUSD on a walking or running goal. Finish and reclaim your stake plus a bonus. Miss it and you forfeit. Real skin in the game.
            </p>
            <button onClick={hasAccount ? () => router.push('/commitment/new') : () => openOnboarding('splash')} className="sd-btn sd-btn-lime" style={{ marginTop: 22 }}>
              {hasAccount ? 'Start a commitment' : 'Get started'} <span style={{ fontSize: 17 }}>→</span>
            </button>
            <button onClick={hasAccount ? () => router.push('/explore') : () => openOnboarding('explore')} className="sd-btn sd-btn-ghost" style={{ marginTop: 11 }}>
              {hasAccount ? 'Open the app' : 'Just explore first'}
            </button>
          </div>

          {/* How it works */}
          <div className="sd-rise-2" style={{ paddingTop: 36 }}>
            <div className="sd-section-row">
              <h2 className="sd-section">How it works</h2>
              <span className="sd-meta">4 STEPS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              {[
                ['01', 'Commit', 'Set a goal and stake cUSD to lock it in.'],
                ['02', 'Move', 'Track your walk or run with live GPS.'],
                ['03', 'Verify', 'Your route is checked on-chain automatically.'],
                ['04', 'Earn', 'Hit the goal, reclaim your stake plus rewards.'],
              ].map(([n, t, d]) => (
                <div key={n} className="sd-card" style={{ padding: 15, borderRadius: 18 }}>
                  <div className="sd-mono" style={{ fontWeight: 800, fontSize: 13, color: '#cdfb46' }}>{n}</div>
                  <div style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 700, fontSize: 16, marginTop: 8, textTransform: 'uppercase' }}>{t}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--muted)', marginTop: 5 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stake model */}
          <div className="sd-rise-3" style={{ paddingTop: 36 }}>
            <div className="sd-card-lime sd-card-glow" style={{ padding: 22 }}>
              <div className="sd-eyebrow" style={{ position: 'relative', letterSpacing: '0.2em' }}>The stake model</div>
              <h3 className="sd-display" style={{ position: 'relative', fontSize: 22, margin: '10px 0 0', lineHeight: 1.05 }}>Lose it or<br />level up.</h3>
              <p style={{ position: 'relative', fontSize: 13, lineHeight: 1.5, color: 'rgba(244,246,243,0.6)', margin: '12px 0 0', maxWidth: 280 }}>
                Your stake sits in escrow on Celo. Complete the goal in the window and it returns with a reward from the pool. No completion, no refund.
              </p>
              <div style={{ position: 'relative', display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '11px 13px' }}>
                  <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', textTransform: 'uppercase' }}>You stake</div>
                  <div className="sd-mono" style={{ fontWeight: 800, fontSize: 18, marginTop: 3 }}>$0.25</div>
                </div>
                <div style={{ color: 'var(--muted-2)', fontSize: 18 }}>→</div>
                <div style={{ flex: 1, background: 'rgba(205,251,70,0.12)', border: '1px solid rgba(205,251,70,0.25)', borderRadius: 13, padding: '11px 13px' }}>
                  <div className="sd-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: '#cdfb46', textTransform: 'uppercase' }}>You earn</div>
                  <div className="sd-mono" style={{ fontWeight: 800, fontSize: 18, marginTop: 3, color: '#cdfb46' }}>$0.30</div>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="sd-rise-4" style={{ paddingTop: 36 }}>
            <div className="sd-card" style={{ padding: 24, textAlign: 'center' }}>
              <span className="sd-pill"><span className="sd-dot" />Built on Celo · MiniPay native</span>
              <h2 className="sd-display" style={{ fontSize: 26, marginTop: 16 }}>Ready to<br />move?</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '12px 0 18px' }}>You only need a wallet at the moment you lock a real stake.</p>
              <button onClick={hasAccount ? () => router.push('/explore') : () => openOnboarding('splash')} className="sd-btn sd-btn-lime">
                {hasAccount ? 'Open the app' : 'Get started'} <span style={{ fontSize: 17 }}>→</span>
              </button>
            </div>
          </div>
        </div>
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
