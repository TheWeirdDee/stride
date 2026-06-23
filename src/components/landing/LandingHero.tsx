'use client'

import { motion } from 'framer-motion'
import { GuestProfile } from './types'

interface LandingHeroProps {
  isConnected: boolean
  guestProfile: GuestProfile | null
  onGetStarted: () => void
  onContinue: () => void
  onConnectWallet: () => void
  onStartCommitment: () => void
}

export default function LandingHero({ isConnected, guestProfile, onGetStarted, onContinue, onStartCommitment }: LandingHeroProps) {
  const hasAccount = isConnected || !!guestProfile
  return (
    <header className="hero" id="top">
      <div className="hero-grid-tex"></div>
      <div className="hero-photo">
        <img src="/images/hero-athlete-3d.png" alt="Stride runner" />
      </div>
      <div className="hero-inner">
        <div className="hero-tags">
          <span className="tag"><span className="dot"></span>Built on Celo · MiniPay native</span>
        </div>
        <h1 className="hero-h1">Put Your Money <span className="lite">Where Your</span> Miles Are</h1>
        <p className="hero-sub">Stake a little. Move for real. Get your stake back plus a bonus the moment you finish.</p>
        <>
          <form className="hero-cta" onSubmit={(e) => { e.preventDefault(); hasAccount ? onStartCommitment() : onGetStarted(); }}>
            <input type="text" placeholder="Set your goal — e.g. 5 km today" aria-label="Goal" />
            <button className="btn btn-lime" type="submit">Start a Commitment</button>
          </form>
          <button
            className="hero-get-started"
            onClick={hasAccount ? onContinue : onGetStarted}
          >
            {hasAccount ? 'Continue your Stride' : 'Get started'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </>
      </div>

      <aside className="hero-cards">
        <motion.div className="card-trainer" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}>
          <span className="pill-sm"><span className="dot"></span>Your commitment</span>
          <h3>Get Your <span className="lite">Stake Back</span> + A Bonus When You Finish</h3>
          <a className="btn btn-dark" href="#how" style={{"width":"100%","justifyContent":"center"}}>See how it works</a>
        </motion.div>
        <motion.div className="streak-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65, ease: 'easeOut' }}>
          <div className="row1"><span>Your streak</span><span>12-day high</span></div>
          <div className="streak-amt"><b>7</b><small>days in a row</small></div>
          <div className="streak-grid">
            {Array.from({ length: 84 }).map((_, i) => {
              const r = ((i * 2654435761) >>> 0) % 100
              const lvl = r < 45 ? 0 : r < 65 ? 1 : r < 85 ? 2 : 3
              const bg = lvl >= 3 ? 'rgba(205,251,70,0.55)' : lvl === 2 ? 'rgba(205,251,70,0.36)' : lvl === 1 ? 'rgba(205,251,70,0.20)' : 'rgba(255,255,255,0.05)'
              return <i key={i} style={{ background: bg }} />
            })}
          </div>
          <div className="streak-foot"><span className="dot"></span>Every day you move lights up — settled on-chain.</div>
        </motion.div>
      </aside>

      <div className="hero-foot">
        <div className="route-strip">
          <div className="route-thumbs">
            <div className="route-thumb"><img src="/images/route-1.jpg" alt="" /></div>
            <div className="route-thumb"><img src="/images/route-2.jpg" alt="" /></div>
            <div className="route-thumb"><img src="/images/route-3.jpg" alt="" /></div>
            <div className="route-thumb" style={{"background":"rgba(255,255,255,.15)","display":"grid","placeItems":"center","fontSize":"12px","fontWeight":"700","color":"#fff"}}>+27</div>
          </div>
          <p className="route-meta"><b>+30 routes</b> logged<br />this week near you</p>
        </div>
        <div className="hero-edge">
          <span className="edge-mark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h6M5 7h9M5 17h4"/><path d="M16 6l5 6-5 6"/></svg></span>
          <span className="edge-txt">Move with skin in the game<span>Accountability that pays you back</span></span>
        </div>
      </div>
    </header>
  )
}
