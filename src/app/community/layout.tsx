import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community',
  description: 'Challenges, groups and leaderboards for Stride movers.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
