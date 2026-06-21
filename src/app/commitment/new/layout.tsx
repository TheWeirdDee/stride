import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New commitment',
  description: 'Set a goal, stake cUSD and commit on-chain.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
