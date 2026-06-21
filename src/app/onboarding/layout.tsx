import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get started',
  description: 'A quick tour of how Stride works.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
