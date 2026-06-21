import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Preferences, units, notifications and account settings.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
