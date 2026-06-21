import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Warmups, cooldowns, recovery advice and an AI running coach.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
