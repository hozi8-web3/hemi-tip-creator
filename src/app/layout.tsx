import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { CommunityDisclaimer } from '@/components/CommunityDisclaimer'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TipChain - Onchain Creator Tipping Platform',
  description: 'Support creators with direct onchain tips on Hemi Network. No middlemen, no fees, just pure creator support.',
  keywords: ['crypto', 'tipping', 'creators', 'blockchain', 'hemi', 'ethereum', 'web3'],
  authors: [{ name: 'TipChain Team' }],
  creator: 'TipChain',
  publisher: 'TipChain',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  colorScheme: 'dark',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tipchain.app',
    title: 'TipChain - Onchain Creator Tipping Platform',
    description: 'Support creators with direct onchain tips on Hemi Network',
    siteName: 'TipChain',
    images: [
      {
        url: '/favicon.svg',
        width: 300,
        height: 300,
        alt: 'TipChain Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'TipChain - Onchain Creator Tipping Platform',
    description: 'Support creators with direct onchain tips on Hemi Network',
    images: ['/favicon.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <CommunityDisclaimer />
        </Providers>
      </body>
    </html>
  )
}