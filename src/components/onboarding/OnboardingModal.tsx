// @ts-nocheck
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GuestProfile } from '../landing/types'

interface OnboardingModalProps {
  isOpen: boolean
  obScreen: string
  obSlideIdx: number
  obMode: 'Walk' | 'Run'
  obDist: number
  obStake: number
  obConnecting: boolean
  obName: string
  obHeight: string
  obWeight: string
  isSubmittingProfile: boolean
  isMiniPay: boolean
  guestProfile: GuestProfile | null
  guestNick: string
  guestEmail: string
  guestCity: string
  guestActivity: 'walk' | 'run' | 'both'
  guestSaving: boolean
  isConnected: boolean
  connectors: any[]
  onClose: () => void
  onGo: (screen: string) => void
  onSetObSlideIdx: (i: number) => void
  onSetObMode: (m: 'Walk' | 'Run') => void
  onSetObDist: (d: number) => void
  onSetObStake: (s: number) => void
  onSetObName: (n: string) => void
  onSetObHeight: (h: string) => void
  onSetObWeight: (w: string) => void
  onSetGuestNick: (v: string) => void
  onSetGuestEmail: (v: string) => void
  onSetGuestCity: (v: string) => void
  onSetGuestActivity: (v: 'walk' | 'run' | 'both') => void
  onSaveGuestProfile: () => void
  onConnect: (connector: any) => void
  onConnectAndSave: () => void
}

export default function OnboardingModal({
  isOpen,
  obScreen,
  obSlideIdx,
  obMode,
  obDist,
  obStake,
  obConnecting,
  obName,
  obHeight,
  obWeight,
  isSubmittingProfile,
  isMiniPay,
  guestProfile,
  guestNick,
  guestEmail,
  guestCity,
  guestActivity,
  guestSaving,
  isConnected,
  connectors,
  onClose,
  onGo,
  onSetObSlideIdx,
  onSetObMode,
  onSetObDist,
  onSetObStake,
  onSetObName,
  onSetObHeight,
  onSetObWeight,
  onSetGuestNick,
  onSetGuestEmail,
  onSetGuestCity,
  onSetGuestActivity,
  onSaveGuestProfile,
  onConnect,
  onConnectAndSave,
}: OnboardingModalProps) {
  const [showWalletChooser, setShowWalletChooser] = useState(false)
  if (!isOpen) return null

  return (
        <div id="onboarding-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0b0c0e', display: 'flex', flexDirection: 'column', height: '100dvh', pointerEvents: 'auto' }}>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes ob-fade{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
            .ob-fade{animation:ob-fade .45s ease both;}
            @keyframes ob-pop{0%{transform:scale(0);}60%{transform:scale(1.15);}100%{transform:scale(1);}}
            .ob-pop{animation:ob-pop .5s cubic-bezier(.2,.8,.3,1.2) both;}
            @keyframes ob-pulse{0%{box-shadow:0 0 0 0 rgba(205,251,70,.55);}70%{box-shadow:0 0 0 11px rgba(205,251,70,0);}100%{box-shadow:0 0 0 0 rgba(205,251,70,0);}}
            .ob-livedot{width:8px;height:8px;border-radius:50%;background:#cdfb46;animation:ob-pulse 1.8s infinite;display:inline-block;}
            .ob-scroll{overflow-y:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;position:relative;z-index:1;}
            .ob-scroll::-webkit-scrollbar{display:none;}
            .ob-input{width:100%;box-sizing:border-box;background:#16181b;border:1.5px solid rgba(255,255,255,.12);border-radius:16px;padding:14px 16px;color:#f3f5f3;font-size:16px;font-family:"Hanken Grotesk",system-ui,sans-serif;outline:none;transition:border-color .15s;}
            .ob-input:focus{border-color:#cdfb46;}
            .ob-input::placeholder{color:#454b52;}
            .ob-select{width:100%;box-sizing:border-box;background:#16181b;border:1.5px solid rgba(255,255,255,.12);border-radius:16px;padding:14px 16px;color:#f3f5f3;font-size:16px;font-family:"Hanken Grotesk",system-ui,sans-serif;outline:none;transition:border-color .15s;appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236a7077' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;}
            .ob-select:focus{border-color:#cdfb46;}
            .ob-select option{background:#1d2024;}
          ` }} />
          <div style={{ flex: 1, width:'100%', maxWidth:'480px', margin: '0 auto', fontFamily:'"Hanken Grotesk",system-ui,sans-serif', WebkitFontSmoothing:'antialiased' as React.CSSProperties['WebkitFontSmoothing'], display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>

          {/* ════ CAROUSEL ════ */}
          {obScreen === 'carousel' && (() => {
            const OB_SLIDES = [
              { eb:'Step 01 — Commit', title:'Back your goal with a stake', body:'Pick a distance or step goal, then lock in as little as 0.01 CELO. Skin in the game beats willpower.' },
              { eb:'Step 02 — Move',   title:'Track every metre, live',     body:'Your route draws in real time with pace, distance and time. Stride verifies it from your GPS — no faking it.' },
              { eb:'Step 03 — Earn',   title:'Finish and get paid back',    body:'Complete the goal and your stake returns in full, plus a bonus from the community pool. Miss it and it funds the finishers.' },
            ]
            const s = OB_SLIDES[obSlideIdx]
            const next = () => obSlideIdx < OB_SLIDES.length - 1 ? onSetObSlideIdx(obSlideIdx + 1) : onGo('explore')
            return (
              <div style={{ width:'100%',height:'100%',background:'#0b0c0e',color:'#f3f5f3',display:'flex',flexDirection:'column' }}>
                <div style={{ height:16,flexShrink:0 }} />
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 20px 0' }}>
                  <Link href="/" onClick={() => onClose()} style={{ display:'inline-flex',alignItems:'center',fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:800,fontSize:20,letterSpacing:'-.02em',color:'#fff',textDecoration:'none' }}>
                    Stride<span style={{ color:'#cdfb46',letterSpacing:'-.18em',marginLeft:2 }}>&gt;&gt;</span>
                  </Link>
                  <button onClick={() => onGo('explore')} style={{ background:'transparent',border:'none',color:'#9aa1a8',cursor:'pointer',fontFamily:'"Space Mono",monospace',fontSize:12,letterSpacing:'.1em' }}>SKIP</button>
                </div>
                <div className="ob-scroll" style={{ flex:1 }}>
                  <div style={{ display:'flex',flexDirection:'column',minHeight:'100%',justifyContent:'space-between',padding:'20px',boxSizing:'border-box' }}>
                    <div style={{ position:'relative',height:240,display:'grid',placeItems:'center' }}>
                      <div style={{ position:'absolute',width:230,height:230,borderRadius:'50%',background:'radial-gradient(circle, rgba(205,251,70,.18), transparent 68%)' }} />
                      {obSlideIdx === 1 ? (
                        <div style={{ width:250,height:200,borderRadius:26,background:'radial-gradient(120% 90% at 30% 10%, #16242e, #0c1116 70%)',overflow:'hidden',position:'relative' }}>
                          <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)',backgroundSize:'34px 34px' }} />
                          <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%' }} viewBox="0 0 340 300" preserveAspectRatio="xMidYMid slice">
                            <path d="M40 270 C70 250 90 210 130 200 C175 188 180 150 220 140 C265 128 290 95 320 60" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="5" strokeLinecap="round"/>
                            <path d="M40 270 C70 250 90 210 130 200 C175 188 180 150 220 140 C265 128 290 95 320 60" fill="none" stroke="#cdfb46" strokeWidth="5" strokeLinecap="round" style={{ filter:'drop-shadow(0 0 8px rgba(205,251,70,.55))' }}/>
                          </svg>
                          <span style={{ position:'absolute',left:'13%',top:'82%',width:18,height:18,borderRadius:'50%',background:'#fff',border:'3px solid #0b0c0e',boxShadow:'0 0 0 4px rgba(205,251,70,.25)',display:'inline-block' }} />
                          <span style={{ position:'absolute',left:'88%',top:'14%',width:18,height:18,borderRadius:'50%',background:'#cdfb46',border:'3px solid #0b0c0e',boxShadow:'0 0 0 4px rgba(205,251,70,.25)',display:'inline-block' }} />
                        </div>
                      ) : (
                        <div className="ob-pop" style={{ width:140,height:140,borderRadius:40,background:'#cdfb46',color:'#1b2700',display:'grid',placeItems:'center',boxShadow:'0 24px 50px -16px rgba(205,251,70,.5)' }}>
                          {obSlideIdx === 0
                            ? <svg width="66" height="66" viewBox="0 0 24 24" fill="none" stroke="#1b2700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            : <svg width="66" height="66" viewBox="0 0 24 24" fill="none" stroke="#1b2700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9.5C14.3 8.6 13.2 8 12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.2 0 2.3-.6 3-1.5"/></svg>}
                        </div>
                      )}
                    </div>
                    <div key={obSlideIdx} className="ob-fade" style={{ marginTop:14, marginBottom:20 }}>
                      <div style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.18em',textTransform:'uppercase',color:'#cdfb46' }}>{s.eb}</div>
                      <h1 style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em',fontSize:42,marginTop:12,color:'#f3f5f3' }}>{s.title}</h1>
                      <p style={{ marginTop:14,fontSize:16,lineHeight:1.55,color:'#9aa1a8' }}>{s.body}</p>
                    </div>
                    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
                      <div style={{ display:'flex',gap:7,justifyContent:'center' }}>
                        {OB_SLIDES.map((_,k) => (
                          <i key={k} style={{ width:k===obSlideIdx?22:7,height:7,borderRadius:999,background:k===obSlideIdx?'#cdfb46':'rgba(255,255,255,.15)',display:'inline-block',transition:'.2s',listStyle:'none' }} />
                        ))}
                      </div>
                      <button onClick={next} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,border:'none',cursor:'pointer',borderRadius:999,padding:'16px 22px',width:'100%',background:'#cdfb46',color:'#1b2700' }}>
                        {obSlideIdx < OB_SLIDES.length - 1 ? 'Next' : 'See it in action'}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ════ 3. EXPLORE ════ */}
          {obScreen === 'explore' && (
            <div style={{ width:'100%',height:'100%',background:'#0b0c0e',color:'#f3f5f3',display:'flex',flexDirection:'column' }}>
              <div style={{ height:16,flexShrink:0 }} />
              <div className="ob-scroll" style={{ flex:1 }}>
                <div style={{ display:'flex',flexDirection:'column',minHeight:'100%',justifyContent:'space-between',padding:'8px 20px 38px',boxSizing:'border-box' }}>
                  <div>
                    <span style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,padding:'6px 11px',borderRadius:999,background:'rgba(205,251,70,.14)',color:'#cdfb46' }}>
                      <span style={{ width:6,height:6,borderRadius:'50%',background:'#cdfb46',display:'inline-block' }} />No wallet needed
                    </span>
                    <h1 style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em',fontSize:40,marginTop:16,color:'#f3f5f3' }}>Have a look<br/>around first</h1>
                    <p style={{ marginTop:14,fontSize:16,lineHeight:1.55,color:'#9aa1a8' }}>Browse the community heatmap, check live stats and read the movement guides — all before you ever connect a wallet.</p>
                    
                    <div style={{ marginTop:22,background:'#16181b',border:'1px solid rgba(255,255,255,.09)',borderRadius:22,overflow:'hidden' }}>
                      <div style={{ height:120,background:'radial-gradient(120% 90% at 30% 10%, #16242e, #0c1116 70%)',position:'relative',overflow:'hidden' }}>
                        <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)',backgroundSize:'34px 34px' }} />
                        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%' }} viewBox="0 0 340 300" preserveAspectRatio="xMidYMid slice">
                          <path d="M44 60 L120 60 L120 130 L200 130 L200 80 L300 80 L300 170 L210 170 L210 240 L120 240" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="5" strokeLinecap="round"/>
                          <path d="M44 60 L120 60 L120 130 L200 130 L200 80 L300 80 L300 170 L210 170 L210 240 L120 240" fill="none" stroke="#cdfb46" strokeWidth="5" strokeLinecap="round" style={{ filter:'drop-shadow(0 0 8px rgba(205,251,70,.55))' }}/>
                        </svg>
                      </div>
                      <div style={{ padding:14,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                        <div>
                          <div style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.14em',color:'#6a7077',textTransform:'uppercase' }}>Community heatmap</div>
                          <b style={{ fontSize:15 }}>48,210 km this week</b>
                        </div>
                        <span className="ob-livedot" />
                      </div>
                    </div>
                    
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12 }}>
                      {([['22','Active cities',true],['3,140','Goals this month',false]] as const).map(([k,label,accent]) => (
                        <div key={String(label)} style={{ background:'#16181b',border:'1px solid rgba(255,255,255,.09)',borderRadius:22,padding:14 }}>
                          <div style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,fontSize:30,lineHeight:.95,color:accent?'#cdfb46':'#f3f5f3' }}>{k}</div>
                          <div style={{ fontSize:12,color:'#9aa1a8',marginTop:4 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ background:'#16181b',border:'1px solid rgba(255,255,255,.09)',borderRadius:22,padding:16,marginTop:12,display:'flex',gap:13,alignItems:'center' }}>
                      <div style={{ width:38,height:38,borderRadius:13,background:'#1d2024',color:'#cdfb46',display:'grid',placeItems:'center',flexShrink:0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 4h9a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H5zM19 4h0M17 7a3 3 0 0 1 3-3v13a3 3 0 0 0-3 3"/></svg>
                      </div>
                      <div style={{ flex:1 }}>
                        <b style={{ fontSize:14 }}>Warmups &amp; guides</b>
                        <div style={{ fontSize:12,color:'#9aa1a8' }}>Free to read, works offline</div>
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6a7077" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                  
                  <div style={{ padding:'24px 0 0',display:'flex',flexDirection:'column',gap:11 }}>
                    <button onClick={() => onGo('wallet')} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,border:'none',cursor:'pointer',borderRadius:999,padding:'16px 22px',width:'100%',background:'#cdfb46',color:'#1b2700' }}>
                      Connect wallet to start
                    </button>
                    <button onClick={() => onGo('app:explore')} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,borderRadius:999,padding:'16px 22px',width:'100%',background:'#1d2024',color:'#f3f5f3',border:'1px solid rgba(255,255,255,.15)',cursor:'pointer' }}>
                      Just explore for now
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ 3b. GUEST PROFILE ════ */}
          {obScreen === 'guest-profile' && (
            <div style={{ width:'100%',height:'100%',background:'#0b0c0e',color:'#f3f5f3',display:'flex',flexDirection:'column' }}>
              <div style={{ height:16,flexShrink:0 }} />
              <div style={{ display:'flex',alignItems:'center',padding:'6px 20px 4px' }}>
                <button onClick={() => onGo('explore')} style={{ width:44,height:44,borderRadius:'50%',background:'#1d2024',border:'1px solid rgba(255,255,255,.09)',display:'grid',placeItems:'center',color:'#f3f5f3',cursor:'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 5l-7 7 7 7"/></svg>
                </button>
              </div>
              <div className="ob-scroll" style={{ flex:1 }}>
                <div style={{ padding:'16px 24px 48px',display:'flex',flexDirection:'column',gap:28 }}>

                  <div>
                    <div style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.18em',textTransform:'uppercase',color:'#cdfb46',marginBottom:12 }}>One time only</div>
                    <h1 style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,textTransform:'uppercase',lineHeight:.92,fontSize:40,color:'#f3f5f3' }}>
                      Just your<br/>name and<br/><span style={{ color:'#cdfb46' }}>we're done</span>
                    </h1>
                    <p style={{ marginTop:14,fontSize:15,color:'#9aa1a8',lineHeight:1.55 }}>
                      We'll remember you so you never have to fill this in again.
                    </p>
                  </div>

                  <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                    <div>
                      <label style={{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',color:'#6a7077',marginBottom:8 }}>
                        Name / Nickname <span style={{ color:'#e85555' }}>*</span>
                      </label>
                      <input
                        className="ob-input"
                        type="text"
                        placeholder="e.g. Lagos Strider"
                        value={guestNick}
                        onChange={e => onSetGuestNick(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label style={{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',color:'#6a7077',marginBottom:8 }}>
                        Email <span style={{ color:'#e85555' }}>*</span>
                      </label>
                      <input
                        className="ob-input"
                        type="email"
                        placeholder="you@email.com"
                        value={guestEmail}
                        onChange={e => onSetGuestEmail(e.target.value)}
                      />
                      <p style={{ fontSize:11,color:'#454b52',marginTop:6,lineHeight:1.4 }}>For updates, challenges and reward-pool drops. No spam.</p>
                    </div>

                    <div>
                      <label style={{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',color:'#6a7077',marginBottom:8 }}>
                        City <span style={{ color:'#454b52',textTransform:'none',letterSpacing:'normal',fontWeight:400 }}>— optional</span>
                      </label>
                      <input
                        className="ob-input"
                        type="text"
                        placeholder="e.g. Lagos"
                        value={guestCity}
                        onChange={e => onSetGuestCity(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',color:'#6a7077',marginBottom:8 }}>I prefer</label>
                      <select
                        className="ob-select"
                        value={guestActivity}
                        onChange={e => onSetGuestActivity(e.target.value as 'walk' | 'run' | 'both')}
                      >
                        <option value="walk">Walking</option>
                        <option value="run">Running</option>
                        <option value="both">Both — walking &amp; running</option>
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const ready = guestNick.trim() && guestEmail.trim() && guestEmail.includes('@')
                    return (
                      <button
                        onClick={onSaveGuestProfile}
                        disabled={!ready || guestSaving}
                        style={{
                          display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,
                          fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,
                          border:'none',borderRadius:999,padding:'16px 22px',width:'100%',
                          background: ready ? '#cdfb46' : 'rgba(205,251,70,.2)',
                          color: ready ? '#1b2700' : 'rgba(27,39,0,.35)',
                          cursor: ready && !guestSaving ? 'pointer' : 'not-allowed',
                          transition:'all .15s',
                        }}
                      >
                        {guestSaving ? 'Saving...' : 'Start exploring'}
                        {!guestSaving && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
                      </button>
                    )
                  })()}

                  <p style={{ fontSize:11,color:'#3d4349',textAlign:'center',marginTop:-16,lineHeight:1.5 }}>
                    Saved to your profile · Change anytime in settings
                  </p>

                </div>
              </div>
            </div>
          )}

          {/* ════ 4. WALLET ════ */}
          {obScreen === 'wallet' && (() => {
            const injectedConnector = connectors.find(c => c.id === 'injected')
            const wcConnector = connectors.find(c => c.id === 'walletConnect')

            // EIP-6963: every installed browser wallet (MetaMask, Zerion, …)
            // is discovered as its own connector, separate from the generic
            // `injected` and `walletConnect` connectors.
            const browserWallets = connectors.filter(
              c => c.id !== 'injected' && c.id !== 'walletConnect'
            )

            const handleConnect = (connector: any) => {
              if (!connector) return
              if (isConnected) { onGo('location'); return }
              onConnect(connector)
            }

            const openBrowserWallet = () => {
              if (browserWallets.length > 1) {
                // More than one wallet installed — let the user pick.
                setShowWalletChooser(true)
              } else if (browserWallets.length === 1) {
                handleConnect(browserWallets[0])
              } else {
                // Nothing discovered — fall back to the generic injected provider.
                handleConnect(injectedConnector)
              }
            }

            const walletRows: { label: string; sub: string; onClick: (() => void) | null }[] = []
            if (!isMiniPay && (injectedConnector || browserWallets.length > 0)) {
              walletRows.push({
                label: 'Browser Wallet',
                sub: browserWallets.length > 1
                  ? `${browserWallets.length} wallets detected — choose one`
                  : 'MetaMask, Zerion…',
                onClick: openBrowserWallet,
              })
            }
            walletRows.push({
              label: 'Valora',
              sub: wcConnector ? 'Celo wallet · via WalletConnect' : 'Needs WalletConnect project ID',
              onClick: wcConnector ? () => handleConnect(wcConnector) : null,
            })
            walletRows.push({
              label: 'WalletConnect',
              sub: wcConnector ? 'Scan a QR code' : 'Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to .env.local',
              onClick: wcConnector ? () => handleConnect(wcConnector) : null,
            })

            return (
              <div style={{ width:'100%',height:'100%',background:'#0b0c0e',color:'#f3f5f3',display:'flex',flexDirection:'column',position:'relative' }}>
                <div style={{ height:16,flexShrink:0 }} />
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 20px 4px' }}>
                  <button onClick={() => onGo('explore')} style={{ width:44,height:44,borderRadius:'50%',background:'#1d2024',border:'1px solid rgba(255,255,255,.09)',display:'grid',placeItems:'center',color:'#f3f5f3',cursor:'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 5l-7 7 7 7"/></svg>
                  </button>
                  <span />
                </div>
                <div className="ob-scroll" style={{ flex:1 }}>
                  <div style={{ display:'flex',flexDirection:'column',minHeight:'100%',justifyContent:'space-between',padding:'0 20px 38px',boxSizing:'border-box' }}>
                    <div>
                      <h1 style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em',fontSize:40,color:'#f3f5f3' }}>Connect<br/>your wallet</h1>
                      <p style={{ marginTop:14,fontSize:16,lineHeight:1.55,color:'#9aa1a8' }}>Stakes settle in native CELO. Gas costs a fraction of a cent — no jargon, no card.</p>

                      {isMiniPay && (
                        <div style={{ marginTop:24,background:'#cdfb46',color:'#1b2700',borderRadius:22,padding:20 }}>
                          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                            <span style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.14em',textTransform:'uppercase' }}>Detected on this device</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b2700" strokeWidth="2" strokeLinecap="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
                          </div>
                          <div style={{ display:'flex',alignItems:'center',gap:13,margin:'16px 0 18px' }}>
                            <div style={{ width:46,height:46,borderRadius:13,background:'#1b2700',color:'#cdfb46',display:'grid',placeItems:'center',flexShrink:0 }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 9h18M16 13h2"/></svg>
                            </div>
                            <div>
                              <b style={{ fontSize:19,fontWeight:800 }}>MiniPay</b>
                              <div style={{ fontSize:13,opacity:.7 }}>One-tap connect · Opera Mini</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleConnect(injectedConnector)}
                            disabled={obConnecting}
                            style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,borderRadius:999,padding:'16px 22px',width:'100%',background:'#1b2700',color:'#cdfb46',border:'none',cursor:'pointer' }}
                          >
                            {obConnecting ? 'Connecting...' : <>Connect MiniPay <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></>}
                          </button>
                        </div>
                      )}

                      <div style={{ display:'flex',alignItems:'center',gap:12,color:'#6a7077',fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.16em',textTransform:'uppercase',margin:`${isMiniPay ? 22 : 24}px 0 4px` }}>
                        {isMiniPay && <span style={{ flex:1,height:1,background:'rgba(255,255,255,.09)',display:'block' }} />}
                        {isMiniPay ? 'or use another' : 'Choose a wallet'}
                        {isMiniPay && <span style={{ flex:1,height:1,background:'rgba(255,255,255,.09)',display:'block' }} />}
                      </div>

                      <div style={{ background:'#16181b',border:'1px solid rgba(255,255,255,.09)',borderRadius:22,padding:'0 18px' }}>
                        {walletRows.map((row, idx) => (
                          <button
                            key={row.label}
                            onClick={() => row.onClick?.()}
                            disabled={!row.onClick || obConnecting}
                            style={{
                              display:'flex',alignItems:'center',gap:14,padding:'14px 0',width:'100%',
                              borderBottom: idx < walletRows.length - 1 ? '1px solid rgba(255,255,255,.09)' : 'none',
                              background:'transparent',border:'none',
                              borderBottomColor: idx < walletRows.length - 1 ? 'rgba(255,255,255,.09)' : 'transparent',
                              borderBottomWidth: idx < walletRows.length - 1 ? 1 : 0,
                              borderBottomStyle: 'solid',
                              cursor: row.onClick ? 'pointer' : 'not-allowed',
                              opacity: row.onClick ? 1 : 0.4,
                              textAlign:'left',
                            }}
                          >
                            <div style={{ width:42,height:42,borderRadius:13,background:'#1d2024',display:'grid',placeItems:'center',color:'#9aa1a8',flexShrink:0 }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 9h18M16 13h2"/></svg>
                            </div>
                            <div style={{ flex:1 }}>
                              <b style={{ display:'block',color:'#f3f5f3' }}>{row.label}</b>
                              <span style={{ fontSize:12.5,color:'#9aa1a8' }}>{row.sub}</span>
                            </div>
                            {row.onClick && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6a7077" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display:'flex',gap:9,marginTop:24,color:'#6a7077',fontSize:12,lineHeight:1.45 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0,marginTop:1 }}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/></svg>
                      <span>Stride never holds your funds. Stakes sit in an on-chain escrow you can audit.</span>
                    </div>
                  </div>
                </div>

                {/* ── Browser wallet chooser popup ── */}
                {showWalletChooser && (
                  <div
                    onClick={() => setShowWalletChooser(false)}
                    style={{ position:'absolute',inset:0,zIndex:20,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(2px)' }}
                  >
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{ width:'100%',maxWidth:480,background:'#16181b',borderTopLeftRadius:26,borderTopRightRadius:26,border:'1px solid rgba(255,255,255,.09)',borderBottom:'none',padding:'10px 20px 28px',boxShadow:'0 -20px 60px rgba(0,0,0,.5)' }}
                    >
                      <div style={{ width:40,height:4,borderRadius:999,background:'rgba(255,255,255,.18)',margin:'0 auto 18px' }} />
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6 }}>
                        <b style={{ fontSize:17,color:'#f3f5f3' }}>Choose a wallet</b>
                        <button onClick={() => setShowWalletChooser(false)} style={{ background:'transparent',border:'none',color:'#9aa1a8',cursor:'pointer',fontSize:20,lineHeight:1,padding:4 }}>×</button>
                      </div>
                      <p style={{ fontSize:13,color:'#9aa1a8',margin:'0 0 16px' }}>Multiple wallets are installed in this browser. Pick the one you want to connect.</p>
                      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                        {browserWallets.map((w: any) => (
                          <button
                            key={w.id}
                            onClick={() => { setShowWalletChooser(false); handleConnect(w) }}
                            disabled={obConnecting}
                            style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 16px',width:'100%',background:'#1d2024',border:'1px solid rgba(255,255,255,.09)',borderRadius:16,cursor:'pointer',textAlign:'left' }}
                          >
                            <div style={{ width:38,height:38,borderRadius:11,background:'#0b0c0e',display:'grid',placeItems:'center',overflow:'hidden',flexShrink:0 }}>
                              {w.icon
                                ? <img src={w.icon} alt={w.name} style={{ width:24,height:24,borderRadius:6 }} />
                                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa1a8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 9h18M16 13h2"/></svg>}
                            </div>
                            <b style={{ flex:1,color:'#f3f5f3',fontSize:15 }}>{w.name || 'Browser Wallet'}</b>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6a7077" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ════ 5. LOCATION ════ */}
          {obScreen === 'location' && (
            <div style={{ width:'100%',height:'100%',background:'#0b0c0e',color:'#f3f5f3',display:'flex',flexDirection:'column' }}>
              <div style={{ height:16,flexShrink:0 }} />
              <div className="ob-scroll" style={{ flex:1 }}>
                <div style={{ display:'flex',flexDirection:'column',minHeight:'100%',justifyContent:'space-between',padding:'0 20px 38px',boxSizing:'border-box',alignItems:'center',textAlign:'center' }}>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center',width:'100%' }}>
                    <div style={{ position:'relative',display:'grid',placeItems:'center',marginBottom:10,marginTop:20 }}>
                      <div style={{ position:'absolute',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle, rgba(205,251,70,.16), transparent 70%)' }} />
                      <div className="ob-pop" style={{ width:120,height:120,borderRadius:36,background:'#16181b',border:'1px solid rgba(255,255,255,.09)',display:'grid',placeItems:'center',color:'#cdfb46' }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>
                      </div>
                    </div>
                    <h1 style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em',fontSize:38,marginTop:22,color:'#f3f5f3' }}>Allow location<br/>while you move</h1>
                    <p style={{ marginTop:14,fontSize:16,lineHeight:1.55,color:'#9aa1a8',maxWidth:'32ch' }}>Stride uses your live GPS only during a session to draw your route and verify the distance. It&apos;s never tracked in the background.</p>
                    
                    <div style={{ marginTop:24,width:'100%',background:'#16181b',border:'1px solid rgba(255,255,255,.09)',borderRadius:22,padding:18,textAlign:'left',display:'flex',flexDirection:'column',gap:14 }}>
                      {([
                        ['M8 18h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6','Draw your live route'],
                        ['M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z M9 12l2 2 4-4','Verify the goal honestly'],
                        ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z|circle:12,12,3','Never used in the background'],
                      ] as const).map(([, tx], i) => (
                        <div key={tx} style={{ display:'flex',alignItems:'center',gap:12 }}>
                          {i === 0 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cdfb46" strokeWidth="2" strokeLinecap="round"><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6"/></svg>}
                          {i === 1 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cdfb46" strokeWidth="2" strokeLinecap="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>}
                          {i === 2 && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cdfb46" strokeWidth="2" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>}
                          <span style={{ fontSize:14.5 }}>{tx}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ padding:'24px 0 0',display:'flex',flexDirection:'column',gap:11,width:'100%' }}>
                    <button onClick={() => { if (typeof navigator !== 'undefined' && navigator.geolocation) navigator.geolocation.getCurrentPosition(()=>{},()=>{}); onGo('goal') }} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,border:'none',cursor:'pointer',borderRadius:999,padding:'16px 22px',width:'100%',background:'#cdfb46',color:'#1b2700' }}>
                      Allow while using Stride
                    </button>
                    <button onClick={() => onGo('goal')} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,borderRadius:999,padding:'16px 22px',width:'100%',background:'#1d2024',color:'#f3f5f3',border:'1px solid rgba(255,255,255,.15)',cursor:'pointer' }}>
                      Not now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ 6. GOAL ════ */}
          {obScreen === 'goal' && (() => {
            const DISTS = ['1 km','2 km','3 km','5 km']
            const STAKES = ['$0.01','$0.10','$0.25','$0.50']
            return (
              <div style={{ width:'100%',height:'100%',background:'#0b0c0e',color:'#f3f5f3',display:'flex',flexDirection:'column' }}>
                <div style={{ height:16,flexShrink:0 }} />
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 20px 4px' }}>
                  <button onClick={() => onGo('location')} style={{ width:44,height:44,borderRadius:'50%',background:'#1d2024',border:'1px solid rgba(255,255,255,.09)',display:'grid',placeItems:'center',color:'#f3f5f3',cursor:'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 5l-7 7 7 7"/></svg>
                  </button>
                  <span style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.18em',textTransform:'uppercase',color:'#6a7077' }}>Final step</span>
                </div>
                <div className="ob-scroll" style={{ flex:1 }}>
                  <div style={{ display:'flex',flexDirection:'column',minHeight:'100%',justifyContent:'space-between',padding:'0 20px 38px',boxSizing:'border-box' }}>
                    <div>
                      <h1 style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em',fontSize:38,color:'#f3f5f3' }}>Set your first<br/>commitment</h1>
                      <p style={{ marginTop:12,fontSize:15.5,color:'#9aa1a8' }}>Start tiny. You can change everything later.</p>
                      
                      <div style={{ marginTop:22,display:'flex',gap:4,background:'#1d2024',border:'1px solid rgba(255,255,255,.09)',borderRadius:16,padding:4 }}>
                        {(['Walk','Run'] as const).map(m => (
                          <button key={m} onClick={() => onSetObMode(m)} style={{ flex:1,border:'none',cursor:'pointer',borderRadius:12,padding:'11px 8px',fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontSize:14.5,fontWeight:700,color:obMode===m?'#1b2700':'#9aa1a8',background:obMode===m?'#cdfb46':'transparent',transition:'.15s',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>
                            {m === 'Walk'
                              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13" cy="4.5" r="1.8"/><path d="M11 8l3 1 1 4M14 9l-2 5-2 4M12 14l3 5"/></svg>
                              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="14" cy="5" r="2"/><path d="M12 8l-3 3 2 3 1 5M11 14l-4 1M13 11l4 2 1-3"/></svg>}
                            {m}
                          </button>
                        ))}
                      </div>
                      
                      <div style={{ marginTop:20 }}>
                        <div style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.18em',textTransform:'uppercase',color:'#6a7077',marginBottom:10 }}>Distance goal</div>
                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8 }}>
                          {DISTS.map((d,k) => (
                            <div key={d} onClick={() => onSetObDist(k)} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'11px 15px',borderRadius:14,cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'"Space Mono",monospace',color:obDist===k?'#1b2700':'#f3f5f3',background:obDist===k?'#cdfb46':'#1d2024',border:obDist===k?'1.5px solid #cdfb46':'1.5px solid transparent',transition:'.15s',textAlign:'center' }}>{d}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ marginTop:20 }}>
                        <div style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.18em',textTransform:'uppercase',color:'#6a7077',marginBottom:10 }}>Your stake (CELO)</div>
                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8 }}>
                          {STAKES.map((d,k) => (
                            <div key={d} onClick={() => onSetObStake(k)} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'11px 15px',borderRadius:14,cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'"Space Mono",monospace',color:obStake===k?'#1b2700':'#f3f5f3',background:obStake===k?'#cdfb46':'#1d2024',border:obStake===k?'1.5px solid #cdfb46':'1.5px solid transparent',transition:'.15s',textAlign:'center' }}>{d}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ marginTop:22,background:'#16181b',border:'1px solid rgba(255,255,255,.09)',borderRadius:22,padding:18,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                        <div>
                          <div style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.18em',textTransform:'uppercase',color:'#6a7077' }}>If you finish</div>
                          <b style={{ fontSize:16 }}>Stake back + bonus</b>
                        </div>
                        <div style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,fontSize:30,color:'#cdfb46' }}>{STAKES[obStake]}<span style={{ fontSize:16,color:'#9aa1a8' }}>+</span></div>
                      </div>
                    </div>
                    
                    <div style={{ padding:'24px 0 0',width:'100%' }}>
                      <button onClick={() => onGo('profile-setup')} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,border:'none',cursor:'pointer',borderRadius:999,padding:'16px 22px',width:'100%',background:'#cdfb46',color:'#1b2700' }}>
                        Set my first goal <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ════ 7. PROFILE SETUP ════ */}
          {obScreen === 'profile-setup' && (
            <div style={{ width:'100%',height:'100%',background:'#0b0c0e',color:'#f3f5f3',display:'flex',flexDirection:'column' }}>
              <div style={{ height:16,flexShrink:0 }} />
              <div style={{ display:'flex',alignItems:'center',padding:'6px 20px 4px' }}>
                <button onClick={() => onGo('goal')} style={{ width:44,height:44,borderRadius:'50%',background:'#1d2024',border:'1px solid rgba(255,255,255,.09)',display:'grid',placeItems:'center',color:'#f3f5f3',cursor:'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 5l-7 7 7 7"/></svg>
                </button>
              </div>
              <div className="ob-scroll" style={{ flex:1 }}>
                <div style={{ display:'flex',flexDirection:'column',minHeight:'100%',justifyContent:'space-between',padding:'0 20px 38px',boxSizing:'border-box' }}>
                  <div>
                    <h1 style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em',fontSize:38,color:'#f3f5f3',marginTop:16 }}>About<br/>you</h1>
                    <p style={{ marginTop:12,fontSize:15.5,color:'#9aa1a8' }}>Helps personalise pacing and calorie estimates. Stays on your device.</p>
                    
                    <div style={{ marginTop:24,display:'flex',flexDirection:'column',gap:14 }}>
                      <div>
                        <label style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.18em',textTransform:'uppercase',color:'#6a7077',display:'block',marginBottom:8 }}>Display name</label>
                        <input
                          type="text"
                          placeholder="e.g. Kemi, Lagos Runner...…"
                          value={obName}
                          onChange={e => onSetObName(e.target.value)}
                          style={{ width:'100%',background:'#1d2024',border:'1.5px solid rgba(255,255,255,.12)',borderRadius:14,padding:'14px 16px',color:'#f3f5f3',fontSize:16,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',outline:'none',boxSizing:'border-box' as React.CSSProperties['boxSizing'] }}
                        />
                      </div>
                      
                      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                        <div>
                          <label style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.18em',textTransform:'uppercase',color:'#6a7077',display:'block',marginBottom:8 }}>Height (cm)</label>
                          <input
                            type="number"
                            placeholder="170"
                            value={obHeight}
                            onChange={e => onSetObHeight(e.target.value)}
                            style={{ width:'100%',background:'#1d2024',border:'1.5px solid rgba(255,255,255,.12)',borderRadius:14,padding:'14px 16px',color:'#f3f5f3',fontSize:16,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',outline:'none',boxSizing:'border-box' as React.CSSProperties['boxSizing'] }}
                          />
                        </div>
                        <div>
                          <label style={{ fontFamily:'"Space Mono",monospace',fontSize:10.5,letterSpacing:'.18em',textTransform:'uppercase',color:'#6a7077',display:'block',marginBottom:8 }}>Weight (kg)</label>
                          <input
                            type="number"
                            placeholder="70"
                            value={obWeight}
                            onChange={e => onSetObWeight(e.target.value)}
                            style={{ width:'100%',background:'#1d2024',border:'1.5px solid rgba(255,255,255,.12)',borderRadius:14,padding:'14px 16px',color:'#f3f5f3',fontSize:16,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',outline:'none',boxSizing:'border-box' as React.CSSProperties['boxSizing'] }}
                          />
                        </div>
                      </div>
                      
                      <div style={{ background:'#16181b',border:'1px solid rgba(255,255,255,.09)',borderRadius:18,padding:16,display:'flex',gap:10,alignItems:'flex-start' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a7077" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0,marginTop:2 }}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/></svg>
                        <span style={{ fontSize:12.5,color:'#6a7077',lineHeight:1.5 }}>This data stays on your device unless you sync with a wallet.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding:'24px 0 0',width:'100%' }}>
                    <button
                      onClick={() => onGo('success')}
                      style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,border:'none',cursor:'pointer',borderRadius:999,padding:'16px 22px',width:'100%',background:'#cdfb46',color:'#1b2700' }}
                    >
                      Continue <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ 8. SUCCESS ════ */}
          {obScreen === 'success' && (() => {
            const DISTS = ['1 km','2 km','3 km','5 km']
            const STAKES = ['$0.01','$0.10','$0.25','$0.50']
            return (
              <div style={{ width:'100%',height:'100%',background:'radial-gradient(120% 80% at 50% 0%, #16331a 0%, #0b0c0e 55%)',color:'#f3f5f3',display:'flex',flexDirection:'column' }}>
                <div style={{ height:16,flexShrink:0 }} />
                <div className="ob-scroll" style={{ flex:1 }}>
                  <div style={{ display:'flex',flexDirection:'column',minHeight:'100%',justifyContent:'space-between',padding:'0 20px 38px',boxSizing:'border-box',alignItems:'center',textAlign:'center' }}>
                    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',width:'100%' }}>
                      <div className="ob-pop" style={{ width:110,height:110,borderRadius:'50%',background:'#cdfb46',color:'#1b2700',display:'grid',placeItems:'center',boxShadow:'0 20px 50px -14px rgba(205,251,70,.6)',marginTop:20 }}>
                        <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
                      </div>
                      <h1 style={{ fontFamily:'"Anton",sans-serif',fontWeight:400,textTransform:'uppercase',lineHeight:.9,letterSpacing:'.01em',fontSize:46,marginTop:30,color:'#f3f5f3' }}>You&apos;re in.</h1>
                      <p style={{ marginTop:14,fontSize:16.5,lineHeight:1.5,color:'#9aa1a8',maxWidth:'28ch' }}>Your first commitment is ready. Lace up — your stride starts the moment you hit start.</p>
                      
                      <div style={{ marginTop:26,width:'100%',background:'#16181b',border:'1px solid rgba(255,255,255,.09)',borderRadius:22,padding:18,display:'flex',alignItems:'center',justifyContent:'space-between',textAlign:'left' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:13 }}>
                          <div style={{ width:42,height:42,borderRadius:13,background:'#1d2024',display:'grid',placeItems:'center',color:'#cdfb46',flexShrink:0 }}>
                            {obMode === 'Run'
                              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="14" cy="5" r="2"/><path d="M12 8l-3 3 2 3 1 5M11 14l-4 1M13 11l4 2 1-3"/></svg>
                              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13" cy="4.5" r="1.8"/><path d="M11 8l3 1 1 4M14 9l-2 5-2 4M12 14l3 5"/></svg>}
                          </div>
                          <div>
                            <b style={{ fontSize:16 }}>{DISTS[obDist]} {obMode}</b>
                            <div style={{ fontSize:12.5,color:'#9aa1a8' }}>Staked {STAKES[obStake]} CELO</div>
                          </div>
                        </div>
                        <span style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,padding:'6px 11px',borderRadius:999,background:'rgba(205,251,70,.14)',color:'#cdfb46' }}>Ready</span>
                      </div>
                    </div>
                    <div style={{ padding:'24px 0 0',width:'100%' }}>
                      <button
                        onClick={async () => {
                          if (isConnected && address) {
                            setIsSubmittingProfile(true);
                            try {
                              if (supabase) {
                                  await supabase
                                    .from('users')
                                    .upsert({
                                      wallet_address: address,
                                      nickname: obName || 'Anonymous Mover',
                                      city: 'Unknown',
                                      fitness_level: 'beginner',
                                    }, { onConflict: 'wallet_address' });
                              }
                            } catch (err) {
                              console.error(err);
                            }
                            setIsSubmittingProfile(false);
                            onClose();
                            router.push('/commitment/new');
                          } else {
                            onConnectAndSave();
                          }
                        }}
                        disabled={isSubmittingProfile}
                        style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,fontFamily:'"Hanken Grotesk",system-ui,sans-serif',fontWeight:700,fontSize:16,border:'none',cursor:isSubmittingProfile?'not-allowed':'pointer',borderRadius:999,padding:'16px 22px',width:'100%',background:isSubmittingProfile?'#1d2024':'#cdfb46',color:isSubmittingProfile?'#9aa1a8':'#1b2700' }}
                      >
                        {isSubmittingProfile ? 'Connecting...' : <>Enter Stride <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          </div>
        </div>
  )
}
