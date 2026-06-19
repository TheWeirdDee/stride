'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import OnboardingModal from '@/components/onboarding/OnboardingModal'
import { GuestProfile } from '@/components/landing/types'

// Dedicated endpoint for the onboarding tour screens (carousel → explore →
// wallet → location → goal → profile). From the tour, "Just explore for now"
// hands off to the account flow at /signup.
export default function OnboardingPage() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const router = useRouter()

  const [obScreen, setObScreen] = useState<string>('carousel')
  const [obSlideIdx, setObSlideIdx] = useState(0)
  const [obMode, setObMode] = useState<'Walk' | 'Run'>('Walk')
  const [obDist, setObDist] = useState(1)
  const [obStake, setObStake] = useState(1)
  const [obConnecting] = useState(false)
  const [obName, setObName] = useState('')
  const [obHeight, setObHeight] = useState('')
  const [obWeight, setObWeight] = useState('')
  const obNameRef = useRef(obName)
  useEffect(() => { obNameRef.current = obName }, [obName])
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)

  const [isMiniPay, setIsMiniPay] = useState(false)
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null)
  const [guestNick, setGuestNick] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestCity, setGuestCity] = useState('')
  const [guestActivity, setGuestActivity] = useState<'walk' | 'run' | 'both'>('walk')
  const [guestSaving, setGuestSaving] = useState(false)

  // Hydrate from the browser (deferred so it stays out of the render-cascade rule).
  useEffect(() => {
    const id = setTimeout(() => {
      setIsMiniPay(!!(window as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay)
      try {
        const raw = localStorage.getItem('stride_guest_profile')
        if (raw) setGuestProfile(JSON.parse(raw))
      } catch {}
    }, 0)
    return () => clearTimeout(id)
  }, [])

  const go = (screen: string) => {
    if (screen === 'app:home') {
      connectAndSave()
    } else if (screen === 'app:explore') {
      // "Just explore for now" → hand off to the account flow (signup/login).
      router.push('/signup')
    } else {
      setObScreen(screen)
    }
  }

  // Once the wallet connects mid-onboarding, persist the profile and move on.
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
            if (error) console.error('Error upserting onboarding profile:', error)
          }
        } catch (err) {
          console.error(err)
        } finally {
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
    const guestId = `guest_${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`
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
    router.push('/explore')
  }

  return (
    <OnboardingModal
      isOpen
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
      connectors={connectors as unknown[]}
      onClose={() => router.push('/')}
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
  )
}
