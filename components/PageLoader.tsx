'use client'

import { TipChainIcon } from '@/components/TipChainLogo'

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 animate-pulse">
          <TipChainIcon size={64} className="mx-auto" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg">{message}</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card animate-pulse">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded mb-2" />
            <div className="h-3 bg-gray-700 rounded w-2/3" />
          </div>
        </div>
        <div className="h-3 bg-gray-700 rounded mb-4" />
        <div className="flex justify-between mb-4">
          <div className="h-8 bg-gray-700 rounded w-20" />
          <div className="h-8 bg-gray-700 rounded w-16" />
        </div>
        <div className="h-10 bg-gray-700 rounded" />
      </div>
    </div>
  )
}