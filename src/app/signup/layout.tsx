import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Join Stride — stake on your movement and earn it back.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
