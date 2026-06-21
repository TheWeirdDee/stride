import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/context/Providers'
import AppShell from '@/components/AppShell'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://stride-pay.netlify.app'),
  title: {
    default: 'Stride — Stake on your movement',
    template: '%s · Stride',
  },
  description: 'Stride turns walks and runs into commitments. Stake cUSD on a goal, prove it with GPS on Celo, and get your stake back plus a bonus when you finish.',
  applicationName: 'Stride',
  keywords: ['Stride', 'Celo', 'MiniPay', 'cUSD', 'fitness', 'walking', 'running', 'staking', 'move to earn', 'web3 fitness'],
  authors: [{ name: 'Stride' }],
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Stride' },
  icons: { apple: '/icon.svg' },
  openGraph: {
    type: 'website',
    siteName: 'Stride',
    url: 'https://stride-pay.netlify.app',
    title: 'Stride — Put your money where your miles are',
    description: 'Stake cUSD on a walk or run goal, prove it with GPS on Celo, and earn your stake back plus a bonus.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stride — Put your money where your miles are',
    description: 'Stake cUSD on a walk or run goal, prove it with GPS on Celo, and earn your stake back plus a bonus.',
  },
  robots: { index: true, follow: true },
  other: {
    'talentapp:project_verification':
      'cfb0ac406ba384fb425f559a7cfa7aacf00fbfb8be6ab69c5305e5aac4dcbde38da900e8976628f77a5b6baf8868ba7e1eb38023cf1ec68f98f7f5d69284424b',
  },
}

export const viewport: Viewport = {
  themeColor: '#06080a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
