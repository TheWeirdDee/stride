'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

// The marketing landing ('/') is a full-width page with its own styling.
// Every other route is an app screen rendered inside the mobile-first
// phone-width shell with the top bar + bottom tab bar.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/') {
    return <main className="flex-1 flex flex-col">{children}</main>
  }

  return (
    <div className="sd-shell">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}
