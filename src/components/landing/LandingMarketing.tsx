'use client'

import Link from 'next/link'
import StrideMark from '@/components/StrideMark'

interface LandingMarketingProps {
  onGetStarted: () => void
}

export default function LandingMarketing({ onGetStarted }: LandingMarketingProps) {
  return (
    <>
<section className="about" id="how">
  <div className="wrap">
    <div className="sec-head">
      <span className="sec-badge">A</span>
      <span className="sec-label">How Stride works</span>
    </div>
    <div className="about-top">
      <h2 className="display about-h2">Commit. Move.<br /><em>Get rewarded.</em></h2>
      <div className="about-copy">
        <p>Stride turns intention into action. You decide a goal, back it with a small CELO stake, and the chain holds you to it. No coaches chasing you — just your own commitment, verified by your live GPS route.</p>
        <p>Finish inside your time window and your stake returns in full, topped up with a bonus from the community reward pool. Miss it, and your stake funds the people who showed up. Simple, fair, fully on-chain.</p>
        <a className="btn btn-dark" href="#start">Start a Commitment <span className="arrow-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
      </div>
    </div>
    <div className="steps">
      <div className="step">
        <div className="num">01</div>
        <h4>Set &amp; stake</h4>
        <p>Pick a distance or step goal and a time window. Back it with as little as 0.01 CELO straight from your MiniPay wallet.</p>
      </div>
      <div className="step">
        <div className="num">02</div>
        <h4>Move &amp; track</h4>
        <p>Hit start. Your route draws live on the map while distance, pace and time update in real time. Warmups built in.</p>
      </div>
      <div className="step">
        <div className="num">03</div>
        <h4>Finish &amp; earn</h4>
        <p>Reach the goal and Stride verifies it on-chain. Your stake plus a bonus lands back in your wallet within seconds.</p>
      </div>
    </div>
    <div className="about-feature">
      <div className="feature-img">
        <img src="/images/feat-main.jpg" alt="Runner on route" />
        <div className="feature-stats">
          <div className="fstat"><b>12.4K</b><span>Commitments completed</span></div>
          <div className="fstat"><b>480K</b><span>Kilometres covered</span></div>
          <div className="fstat cta"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8"/></svg></div>
        </div>
      </div>
      <div className="feature-side">
        <div className="side-photo">
          <img src="/images/feat-side.jpg" alt="City walk" />
        </div>
        <div className="big-num">
          <b>100%</b>
          <span className="nl">Stake returned on every completed goal</span>
          <ul className="check-list">
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a5aa2" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12l4 4 10-10"/></svg>Verified by your live GPS route</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a5aa2" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12l4 4 10-10"/></svg>Settled instantly on Celo</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a5aa2" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12l4 4 10-10"/></svg>No subscription, no wallet jargon</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a5aa2" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12l4 4 10-10"/></svg>MiniPay native — no extra setup</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>


<section className="dark" id="programs">
  <div className="wrap programs">
    <div className="sec-head">
      <span className="sec-badge">B</span>
      <span className="sec-label">What you get</span>
    </div>
    <div className="prog-head">
      <h2 className="display">Everything to <em>show up</em></h2>
      <p>One lightweight app for the whole loop — commit, move, recover and get paid. No gym membership, no jargon, no pressure but your own.</p>
    </div>
    <div className="prog-grid">
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h4l2-7 4 14 2-7h6"/></svg></div>
        <h4>Distance goals</h4>
        <p>0.5 km to a full 42 km. Set the target, Stride measures every metre from your live route.</p>
        <span className="pmeta">Run · Walk</span>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 4v16M15 8v12M5 12v8M19 12v8"/></svg></div>
        <h4>Step goals</h4>
        <p>From 500 steps to 50,000 — counted by your phone&apos;s motion sensor, so they work even without GPS (great inside MiniPay).</p>
        <span className="pmeta">No GPS needed</span>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></div>
        <h4>Live GPS sessions</h4>
        <p>Your route draws in real time with pace, distance and elapsed time. Pause when you need to.</p>
        <span className="pmeta">Free live maps</span>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l1.8 4.7L18 8l-4.2 1.5L12 14l-1.8-4.5L6 8l4.2-1.3z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg></div>
        <h4>Free AI running coach</h4>
        <p>An AI coach tailors your pace and talks you through the hard minutes, a recovery advisor cools you down, and warmups surface before every session. No subscription.</p>
        <span className="pmeta">Powered by free AI</span>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l2.5 6.5L21 9l-5 4 1.5 7L12 16l-5.5 4L8 13 3 9l6.5-.5L12 2Z"/></svg></div>
        <h4>Streaks &amp; badges</h4>
        <p>Keep your daily streak alive and unlock milestone badges at 3, 7, 30 and 100 days.</p>
        <span className="pmeta">3 → 100 days</span>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M15 19c0-2 1-3.6 3-4"/></svg></div>
        <h4>Living community</h4>
        <p>See what your city is covering this week — anonymised, real-time, and quietly motivating.</p>
        <span className="pmeta">22 cities live</span>
      </div>
    </div>
  </div>
</section>


<section className="dark" id="community">
  <div className="wrap community">
    <div className="sec-head" style={{"marginBottom":"34px"}}>
      <span className="sec-badge">C</span>
      <span className="sec-label">This week on Stride</span>
    </div>
    <div className="live-ticker"><span className="live-dot"></span><span><b>Someone in Lagos</b> just finished a 3&nbsp;km walk</span></div>
    <div className="stat-band">
      <div className="sband"><b>48,<em>210</em></b><span>Kilometres covered by Stride users this week</span></div>
      <div className="sband"><b>3,<em>140</em></b><span>Commitments completed this month</span></div>
      <div className="sband"><b><em>22</em></b><span>Cities with active movers right now</span></div>
    </div>
    <div className="cities">
      <div className="city-card">
        <h5>Top cities this week</h5>
        <div className="city-row"><span className="ci"><span className="city-rank">01</span>Lagos</span><span className="city-km">9,840 km</span></div>
        <div className="city-row"><span className="ci"><span className="city-rank">02</span>Nairobi</span><span className="city-km">7,210 km</span></div>
        <div className="city-row"><span className="ci"><span className="city-rank">03</span>Accra</span><span className="city-km">5,930 km</span></div>
        <div className="city-row"><span className="ci"><span className="city-rank">04</span>Kampala</span><span className="city-km">4,180 km</span></div>
        <div className="city-row"><span className="ci"><span className="city-rank">05</span>Cape Town</span><span className="city-km">3,650 km</span></div>
      </div>
      <div className="map-card">
        <img src="/images/map-heatmap.jpg" alt="Route heatmap" />
        <div className="map-cap"><b>One map</b><span>Every Stride route, overlaid</span></div>
      </div>
    </div>
  </div>
</section>


<section className="dark" id="rewards">
  <div className="wrap tiers">
    <div className="sec-head">
      <span className="sec-badge">D</span>
      <span className="sec-label">Stake &amp; rewards</span>
    </div>
    <div className="prog-head" style={{"margin":"42px 0 4px"}}>
      <h2 className="display">Small stake.<br /><em>Real skin in the game.</em></h2>
      <p>Pick what you can afford to lose and what you&apos;d love to keep. The bonus scales with the pool and your streak — never guaranteed, always fair.</p>
    </div>
    <div className="tier-rows">
      <div className="tier-row">
        <span className="tn">01</span>
        <span className="tt"><b>First steps</b><span>Build the habit</span></span>
        <span className="td">A 1&nbsp;km walk inside 1 hour. The gentlest way to feel a finish.</span>
        <span className="btn btn-ghost">$0.01 stake</span>
      </div>
      <div className="tier-row">
        <span className="tn">02</span>
        <span className="tt"><b>Daily mover</b><span>Keep the streak</span></span>
        <span className="td">3&nbsp;km or 5,000 steps in a 2-hour window. The everyday commitment.</span>
        <span className="btn btn-ghost">$0.10 stake</span>
      </div>
      <div className="tier-row">
        <span className="tn">03</span>
        <span className="tt"><b>Distance day</b><span>Push further</span></span>
        <span className="td">10&nbsp;km inside 4 hours for a bigger bonus and a streak multiplier.</span>
        <span className="btn btn-ghost">$0.50 stake</span>
      </div>
    </div>
    <div className="tier-stakes">
      <div className="tstake"><div className="tdist">1 KM</div><div className="tprice">0.01 CELO</div><div className="tlabel">First steps</div></div>
      <div className="tstake hot"><div className="tdist">3 KM</div><div className="tprice">0.10 CELO</div><div className="tlabel">Most popular</div></div>
      <div className="tstake"><div className="tdist">10 KM</div><div className="tprice">0.50 CELO</div><div className="tlabel">Distance day</div></div>
      <div className="tstake"><div className="tdist">21 KM</div><div className="tprice">1.00 CELO</div><div className="tlabel">Half marathon</div></div>
    </div>
  </div>
</section>


<section className="dark screens" id="features">
  <div className="wrap">
    <div className="sec-head">
      <span className="sec-badge">E</span>
      <span className="sec-label">The app</span>
    </div>
    <div className="screens-head">
      <h2 className="display">Built for <em>mobile-first</em> movers</h2>
      <p style={{"maxWidth":"34ch","fontSize":"16px","lineHeight":"1.6","color":"var(--muted-d)"}}>Native to MiniPay. No app store, no card. Open it in Opera Mini, commit, move and get paid — on any Android phone.</p>
    </div>
    <div className="prog-grid">
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg></div>
        <h4>GPS-verified routes</h4>
        <p>Your walk or run draws live on the map with pace, distance and time. Stride verifies the distance from your GPS — no faking it.</p>
        <div className="pmeta">Live tracking</div>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="9" r="5"/><path d="M14.5 5.3A5 5 0 1 1 16 14.7"/></svg></div>
        <h4>Stake &amp; auto-payout</h4>
        <p>Back a goal with cUSD from your wallet. Finish in time and your stake returns in full plus a bonus from the reward pool.</p>
        <div className="pmeta">On-chain escrow</div>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 7a3 3 0 0 1 0 6M20 20a5.5 5.5 0 0 0-3.2-5"/></svg></div>
        <h4>Challenges &amp; groups</h4>
        <p>Create or join walk and run challenges, form groups and chase the leaderboard with friends and your city.</p>
        <div className="pmeta">Move together</div>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="9.5" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><rect x="16" y="9.5" width="5" height="5" rx="1"/></svg></div>
        <h4>A streak that grows</h4>
        <p>Every day you move lights up a cell on your GitHub-style streak graph. Watch your consistency build, week after week.</p>
        <div className="pmeta">Daily streak</div>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 14l.7 1.6L21 16l-1.3.4L19 18l-.7-1.6L17 16l1.3-.4z"/></svg></div>
        <h4>AI coach &amp; tools</h4>
        <p>A free AI running coach, recovery advice, pace and calorie calculators, BMI and a goal planner — built right in.</p>
        <div className="pmeta">Smart guidance</div>
      </div>
      <div className="pcard">
        <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="3"/><path d="M10.5 18h3"/></svg></div>
        <h4>MiniPay native</h4>
        <p>One-tap connect, gas that costs a fraction of a cent, and a wallet that travels with you. No seed phrases, no friction.</p>
        <div className="pmeta">Celo &middot; MiniPay</div>
      </div>
    </div>
  </div>
</section>


<section className="stories">
  <div className="wrap">
    <div className="sec-head">
      <span className="sec-badge">F</span>
      <span className="sec-label">From the streak</span>
    </div>
    <div className="stories-head">
      <h2 className="display">Movers who <em>showed up</em></h2>
      <a className="btn btn-dark" href="#start">Join them <span className="arrow-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
    </div>
    <div className="story-grid">
      <div className="story">
        <p className="quote">I never stuck to a routine until my own money was on the line. Forty-one days straight now — the streak is the best coach I&apos;ve ever had.</p>
        <div className="story-by">
          <div className="avatar">A</div>
          <div><b>Amara O.</b><span>Lagos · 41-day streak</span></div>
        </div>
      </div>
      <div className="story">
        <p className="quote">Staking ten cents sounds like nothing, but knowing I&apos;d lose it got me out the door at 6am. The bonus landing back in MiniPay feels unreal.</p>
        <div className="story-by">
          <div className="avatar" style={{"background":"#0a5aa2"}}>D</div>
          <div><b>Daniel K.</b><span>Nairobi · 5 km daily</span></div>
        </div>
      </div>
      <div className="story">
        <p className="quote">No app store, no card, no jargon. I opened MiniPay, committed to a walk, finished it, got paid. My mum is on it now too.</p>
        <div className="story-by">
          <div className="avatar" style={{"background":"#1c2900","color":"var(--lime)"}}>T</div>
          <div><b>Thandi M.</b><span>Cape Town · 18-day streak</span></div>
        </div>
      </div>
    </div>
  </div>
</section>


<section className="cta-band" id="start">
  <div className="glow"></div>
  <div className="inner wrap">
    <h2 className="display">Ready to <em>commit?</em></h2>
    <p>Open MiniPay, stake a cent, and turn today&apos;s walk into something you&apos;ll actually finish. Your stride starts now.</p>
    <div className="cta-actions">
      <button className="btn btn-lime" onClick={onGetStarted}>Start a Commitment <span className="arrow-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></button>
      <a className="btn btn-ghost" href="#how">See how it works</a>
    </div>
  </div>
</section>


<footer>
  <div className="wrap">
    <div className="foot-top">
      <div className="foot-brand">
        <Link href="/" className="logo">
          <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--lime)', display: 'grid', placeItems: 'center', flex: 'none', marginRight: 8 }}>
            <StrideMark size={18} color="#1c2900" />
          </span>
          Stride
        </Link>
        <p>The MiniPay-native way to put skin in the game on your movement. Stake, move, finish, earn — all on Celo.</p>
        <div className="foot-badges">
          <span className="badge"><span className="b-dot"></span>Built on Celo</span>
          <span className="badge"><span className="b-dot"></span>MiniPay native</span>
          <span className="badge"><span className="b-dot"></span>CELO settled</span>
        </div>
      </div>
      <div className="foot-col">
        <h6>Product</h6>
        <a href="#how">How it works</a>
        <a href="#programs">Features</a>
        <a href="#rewards">Stake &amp; rewards</a>
        <a href="#community">Community</a>
      </div>
      <div className="foot-col">
        <h6>Content</h6>
        <a href="#">Warmups</a>
        <a href="#">Cooldowns</a>
        <a href="#">Beginner&apos;s guide</a>
        <a href="#">Hydration &amp; breathing</a>
      </div>
      <div className="foot-news">
        <h6 style={{"fontFamily":"var(--mono)","fontSize":"12px","letterSpacing":".14em","textTransform":"uppercase","color":"var(--muted-d)","marginBottom":"18px"}}>Stay in stride</h6>
        <p>Get launch news, challenges and reward-pool drops.</p>
        <form className="foot-input" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="you@email.com" aria-label="Email" />
          <button className="btn btn-lime" type="submit">Notify me</button>
        </form>
      </div>
    </div>
    <div className="foot-bot">
      <span>© 2026 Stride · Built on Celo · MiniPay native</span>
      <div className="socials">
        <a className="icon-btn" href="#" aria-label="Twitter / X"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23.2 22h-6.7l-5.2-6.8L5.3 22H2.2l7.8-8.9L1.2 2H8l4.7 6.2L18.9 2Z"/></svg></a>
        <a className="icon-btn" href="#" aria-label="Telegram"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.6 20c-.2 1-.9 1.3-1.8.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6 13.2l-4.9-1.5c-1-.3-1-1 .2-1.5l19.2-7.4c.9-.3 1.7.2 1.4 1.5Z"/></svg></a>
        <a className="icon-btn" href="#" aria-label="Discord"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a13 13 0 0 1 3.7 1.8 12 12 0 0 0-9 0 13 13 0 0 1 3.7-1.8L13 4a17 17 0 0 0-4.3 1.3C5.9 9.4 5.1 13.4 5.5 17.3a17 17 0 0 0 5.2 2.6l.6-1a11 11 0 0 1-1.8-.9l.4-.3a12 12 0 0 0 10.2 0l.4.3a11 11 0 0 1-1.8.9l.6 1a17 17 0 0 0 5.2-2.6c.5-4.5-.8-8.5-2.2-12ZM10 14.7c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Zm4 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Z"/></svg></a>
      </div>
    </div>
  </div>
</footer>
    </>
  )
}
