import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://hemi-tip-creator.vercel.app'),
  title: {
    template: '%s | TipChain',
    default: 'Creator Profile | TipChain',
  },
  description: 'Support creators with direct onchain tips on Hemi Network',
  openGraph: {
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}