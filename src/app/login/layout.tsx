import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to Stride and pick up your streak.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
