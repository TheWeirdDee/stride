'use client'

import { GuestProfile } from './types'

interface LandingHeroProps {
  guestProfile: GuestProfile | null
  onGetStarted: () => void
  onContinue: () => void
  onConnectWallet: () => void
}

export default function LandingHero({ guestProfile, onGetStarted, onContinue, onConnectWallet }: LandingHeroProps) {
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
        {guestProfile ? (
          <div style={{ display:'flex',flexDirection:'column',gap:10,marginTop:4 }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'8px 14px',background:'rgba(205,251,70,.1)',border:'1px solid rgba(205,251,70,.25)',borderRadius:999,width:'fit-content' }}>
              <span style={{ width:7,height:7,borderRadius:'50%',background:'#cdfb46',display:'inline-block',flexShrink:0 }} />
              <span style={{ fontSize:13,fontWeight:600,color:'#cdfb46',fontFamily:'var(--mono)',letterSpacing:'.04em' }}>Welcome back, {guestProfile.nickname}</span>
            </div>
            <button
              className="hero-get-started"
              onClick={onContinue}
            >
              Continue exploring
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <button
              style={{ background:'none',border:'none',cursor:'pointer',fontSize:13,color:'var(--muted)',textDecoration:'underline',textAlign:'left',padding:0,fontFamily:'var(--sans)',marginTop:2 }}
              onClick={onConnectWallet}
            >
              Connect a wallet to stake →
            </button>
          </div>
        ) : (
          <>
            <form className="hero-cta" onSubmit={(e) => { e.preventDefault(); onGetStarted(); }}>
              <input type="text" placeholder="Set your goal — e.g. 5 km today" aria-label="Goal" />
              <button className="btn btn-lime" type="submit">Start a Commitment</button>
            </form>
            <button
              className="hero-get-started"
              onClick={onGetStarted}
            >
              Get started
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </>
        )}
      </div>

      <aside className="hero-cards">
        <div className="card-trainer">
          <span className="pill-sm"><span className="dot"></span>Your commitment</span>
          <h3>Get Your <span className="lite">Stake Back</span> + A Bonus When You Finish</h3>
          <a className="btn btn-dark" href="#how" style={{"width":"100%","justifyContent":"center"}}>See how it works</a>
        </div>
        <div className="stake-card">
          <div className="row1"><span>Today&apos;s stake</span><span>5 km · 2h window</span></div>
          <div className="stake-amt"><b>1.00</b><small>CELO</small></div>
          <ul className="stake-list">
            <li>Full stake returned on finish</li>
            <li>Bonus from the reward pool</li>
            <li>Streak +1 · settled on-chain</li>
          </ul>
        </div>
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
