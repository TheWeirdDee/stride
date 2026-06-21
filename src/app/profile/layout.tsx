import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Your streak, stats, badges and route history on Stride.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
