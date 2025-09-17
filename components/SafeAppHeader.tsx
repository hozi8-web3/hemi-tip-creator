'use client'

import { ClientOnly } from '@/components/ClientOnly'
import { AppHeader } from '@/components/AppHeader'
import { TipChainLogo } from '@/components/TipChainLogo'
import Link from 'next/link'

// Fallback header for SSR (no wallet-dependent content)
function HeaderFallback() {
  return (
    <header className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/" className="block">
        <TipChainLogo size={32} showText={true} className="md:w-10 md:h-10" />
      </Link>
      
      <div className="flex items-center space-x-2">
        <div className="w-32 h-10 bg-gray-700/50 rounded-lg animate-pulse" />
      </div>
    </header>
  )
}

export function SafeAppHeader() {
  return (
    <ClientOnly fallback={<HeaderFallback />}>
      <AppHeader />
    </ClientOnly>
  )
}