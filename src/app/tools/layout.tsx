import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tools',
  description: 'Pace, calories-burned and BMI calculators plus a goal planner.',
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
