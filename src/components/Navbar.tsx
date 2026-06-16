'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Immersive / standalone routes manage their own chrome.
  const hideChrome =
    pathname === '/' || pathname.startsWith('/session')
  if (hideChrome) return null

  const handleWallet = () => {
    if (isConnected) {
      disconnect()
      return
    }
    const injected = connectors.find((c) => c.id === 'injected') || connectors[0]
    if (injected) connect({ connector: injected })
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06080a" strokeWidth="3" strokeLinecap="round"><path d="M5 17l5-10 4 7 5-9" /></svg>
          </span>
          <span className="sd-logo-word">STRIDE</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleWallet} className={`sd-wallet-btn ${isConnected ? 'is-on' : ''}`}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isConnected ? '#cdfb46' : 'rgba(244,246,243,0.4)',
                boxShadow: isConnected ? '0 0 8px #cdfb46' : 'none',
              }}
            />
            {walletLabel}
          </button>
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
    </>
  )
}
