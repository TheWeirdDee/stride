'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { LogOut } from 'lucide-react'
import StrideMark from '@/components/StrideMark'
import { isMobile, hasInjectedProvider, metamaskDeepLink, zerionDeepLink } from '@/utils/walletDeeplink'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showWalletSheet, setShowWalletSheet] = useState(false)

  // Immersive / standalone routes manage their own chrome.
  const hideChrome =
    pathname === '/' || pathname.startsWith('/session') || pathname === '/login' || pathname === '/signup' || pathname === '/onboarding'
  if (hideChrome) return null

  const handleConnect = () => {
    // Injected wallet present (desktop extension / in-app browser) → connect directly.
    if (hasInjectedProvider()) {
      const injected = connectors.find((c) => c.id === 'injected') || connectors[0]
      if (!injected) { alert('No wallet connector available.'); return }
      connect({ connector: injected }, { onError: (err) => alert(`Wallet connection failed: ${err.message}`) })
      return
    }
    // Mobile browser with no wallet → offer to open in a wallet app's browser.
    if (isMobile()) { setShowWalletSheet(true); return }
    alert('No wallet detected. Install MetaMask, or open Stride in your phone wallet (MetaMask / Zerion).')
  }

  const walletLabel = isConnected && address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : 'Connect'

  const isActive = (href: string) =>
    href === '/explore' ? pathname === '/explore' : pathname.startsWith(href)

  const tabs = [
    {
      href: '/explore',
      label: 'Explore',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2.2 5L8.5 15.5l2.2-5z" fill="currentColor" stroke="none" /></svg>
      ),
    },
    {
      href: '/community',
      label: 'Community',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="8.5" cy="9" r="2.6" /><circle cx="16" cy="10" r="2.2" /><path d="M3.5 19c0-2.6 2.2-4.2 5-4.2s5 1.6 5 4.2M13.5 18c.2-2 1.7-3.2 3.8-3.2 2 0 3.4 1.2 3.7 3" /></svg>
      ),
    },
    {
      href: '/content',
      label: 'Guides',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 5.5A1.5 1.5 0 016.5 4H18v15H6.5A1.5 1.5 0 005 20.5z" /><path d="M5 17.5A1.5 1.5 0 016.5 16H18" /></svg>
      ),
    },
    {
      href: '/tools',
      label: 'Tools',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 7h10M4 12h16M4 17h7" /><circle cx="17" cy="7" r="2" /><circle cx="14" cy="17" r="2" /></svg>
      ),
    },
  ]

  const profileIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8.5" r="3.4" /><path d="M5.5 19.5c0-3.4 2.9-5.5 6.5-5.5s6.5 2.1 6.5 5.5" /></svg>
  )

  return (
    <>
      {/* Top bar */}
      <header className="sd-topbar">
        <Link href="/explore" className="sd-logo">
          <span className="sd-logo-mark">
            <StrideMark size={16} />
          </span>
          <span className="sd-logo-word">STRIDE</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isConnected && address ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sd-wallet-btn is-on" title={address} style={{ cursor: 'default' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#cdfb46', boxShadow: '0 0 8px #cdfb46' }} />
                {walletLabel}
              </span>
              <button
                onClick={() => disconnect()}
                aria-label="Disconnect wallet"
                title="Disconnect"
                style={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line-strong)', color: 'var(--muted)', cursor: 'pointer' }}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={handleConnect} className="sd-wallet-btn">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(244,246,243,0.4)' }} />
              {walletLabel}
            </button>
          )}
          <Link
            href="/profile"
            aria-label="Profile"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              background: isActive('/profile') ? 'rgba(205,251,70,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isActive('/profile') ? 'rgba(205,251,70,0.4)' : 'var(--line-strong)'}`,
              color: isActive('/profile') ? '#cdfb46' : 'var(--ink)',
            }}
          >
            {profileIcon}
          </Link>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="sd-tabbar">
        <Link href="/explore" className={`sd-tab ${isActive('/explore') ? 'is-active' : ''}`}>
          {tabs[0].icon}
          {tabs[0].label}
        </Link>
        <Link href="/community" className={`sd-tab ${isActive('/community') ? 'is-active' : ''}`}>
          {tabs[1].icon}
          {tabs[1].label}
        </Link>
        <button onClick={() => router.push('/commitment/new')} className="sd-tab" aria-label="New commitment">
          <span className="sd-fab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06080a" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </span>
        </button>
        <Link href="/content" className={`sd-tab ${isActive('/content') ? 'is-active' : ''}`}>
          {tabs[2].icon}
          {tabs[2].label}
        </Link>
        <Link href="/tools" className={`sd-tab ${isActive('/tools') ? 'is-active' : ''}`}>
          {tabs[3].icon}
          {tabs[3].label}
        </Link>
      </nav>

      {/* Mobile wallet chooser — deep-link into a wallet app's in-app browser */}
      {showWalletSheet && (
        <div onClick={() => setShowWalletSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#16181b', borderTopLeftRadius: 24, borderTopRightRadius: 24, border: '1px solid var(--line-strong)', padding: '20px 20px 28px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.18)', margin: '0 auto 16px' }} />
            <h3 className="sd-display" style={{ fontSize: 18 }}>Open in your wallet</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 16px', lineHeight: 1.5 }}>No wallet detected in this browser. Pick your wallet — Stride opens inside its browser so you can connect.</p>
            <a href={metamaskDeepLink()} className="sd-btn sd-btn-lime" style={{ display: 'flex', textDecoration: 'none', marginBottom: 10 }}>Open in MetaMask</a>
            <a href={zerionDeepLink()} className="sd-btn sd-btn-ghost" style={{ display: 'flex', textDecoration: 'none', marginBottom: 10 }}>Open in Zerion</a>
            <button
              onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); alert('Link copied — paste it into your wallet app’s browser.') } catch {} }}
              className="sd-btn sd-btn-dark" style={{ width: '100%' }}
            >
              Copy link for another wallet
            </button>
          </div>
        </div>
      )}
    </>
  )
}
