'use client'

import Link from 'next/link'
import { GuestProfile } from './types'

interface LandingNavProps {
  isConnected: boolean
  guestProfile: GuestProfile | null
  onGetStarted: () => void
  onContinue: () => void
}

export default function LandingNav({ isConnected, onGetStarted }: LandingNavProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">Stride<span className="chev">&gt;&gt;&gt;</span></Link>
        <div className="nav-menu">
          <a href="#how">How it works</a>
          <a href="#programs">Programs</a>
          <a href="#rewards">Rewards</a>
          <a href="#community">Community</a>
        </div>
        <div className="nav-right">
          <a className="icon-btn" href="#" aria-label="Twitter / X"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23.2 22h-6.7l-5.2-6.8L5.3 22H2.2l7.8-8.9L1.2 2H8l4.7 6.2L18.9 2Zm-1.2 18h1.7L7.3 3.8H5.5L17.7 20Z"/></svg></a>
          <a className="icon-btn" href="#" aria-label="Telegram"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.6 20c-.2 1-.9 1.3-1.8.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6 13.2l-4.9-1.5c-1-.3-1-1 .2-1.5l19.2-7.4c.9-.3 1.7.2 1.4 1.5Z"/></svg></a>
          {isConnected ? (
            <Link className="btn btn-light" href="/profile">View Profile</Link>
          ) : (
            <button className="btn btn-light" onClick={onGetStarted}>Get Started</button>
          )}
        </div>
      </div>
    </nav>
  )
}
