import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/context/Providers'
import Navbar from '@/components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Stride',
  description: 'Commit to your movement. Prove it on-chain. Get rewarded.',
  other: {
    'talentapp:project_verification':
      'cfb0ac406ba384fb425f559a7cfa7aacf00fbfb8be6ab69c5305e5aac4dcbde38da900e8976628f77a5b6baf8868ba7e1eb38023cf1ec68f98f7f5d69284424b',
  },
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
          <div className="sd-shell">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
