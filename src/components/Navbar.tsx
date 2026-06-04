'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { Activity, Compass, BookOpen, User, Wallet, LogOut, Menu, X } from 'lucide-react'
import { CUSD_ADDRESS } from '@/utils/constants'
import { cusdABI } from '@/abi/cusd'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (pathname === '/') return null

  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Read cUSD balance
  const { data: rawBalance } = useReadContract({
    address: CUSD_ADDRESS,
    abi: cusdABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  })

  const balance = rawBalance ? Number(formatEther(rawBalance)).toFixed(2) : '0.00'

  const navLinks = [
    { name: 'Explore', href: '/', icon: Compass },
    { name: 'Community', href: '/community', icon: Activity },
    { name: 'Guides', href: '/content', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const handleConnect = () => {
    // Find injected connector (Metamask / MiniPay / etc)
    const injectedConnector = connectors.find(c => c.id === 'injected') || connectors[0]
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-all duration-300">
                <Activity className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Stride
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Wallet Actions / Connect Button */}
          <div className="flex items-center gap-3">
            {isConnected && address ? (
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-1 pl-3 shadow-inner">
                {/* Balance display */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono">${balance}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 font-normal">cUSD</span>
                </div>
                {/* Account button / dropdown */}
                <button
                  onClick={() => disconnect()}
                  className="flex items-center gap-1.5 rounded-full bg-white dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition-colors shadow-sm"
                  title="Disconnect Wallet"
                >
                  <span className="font-mono">{truncateAddress(address)}</span>
                  <LogOut className="h-3.5 w-3.5 text-zinc-400 hover:text-rose-500 transition-colors" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 py-2 text-sm font-semibold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all duration-200"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/95 px-4 py-3 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
