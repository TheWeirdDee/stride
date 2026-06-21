import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse the community heatmap, live stats and movement guides on Stride.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
