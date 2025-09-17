'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'lucide-react'

interface OptimizedAvatarProps {
  src?: string
  alt: string
  fallback: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function OptimizedAvatar({ 
  src, 
  alt, 
  fallback, 
  className = '',
  size = 'md'
}: OptimizedAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  // Clean up IPFS URLs and add fallbacks
  const getOptimizedSrc = (originalSrc?: string) => {
    if (!originalSrc) return undefined
    
    // Handle IPFS URLs
    if (originalSrc.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${originalSrc.slice(7)}`
    }
    
    // Handle gateway URLs
    if (originalSrc.includes('ipfs')) {
      return originalSrc
    }
    
    // Add size optimization for external images
    if (originalSrc.includes('unsplash.com')) {
      return `${originalSrc}&w=200&h=200&fit=crop&crop=face`
    }
    
    return originalSrc
  }

  const optimizedSrc = getOptimizedSrc(src)

  return (
    <Avatar className={`${sizeClasses[size]} ${className} relative`}>
      {/* Loading state */}
      {imageLoading && optimizedSrc && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse rounded-full flex items-center justify-center">
          <User className="w-1/2 h-1/2 text-gray-500" />
        </div>
      )}
      
      {/* Image */}
      {optimizedSrc && !imageError && (
        <AvatarImage 
          src={optimizedSrc}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="object-cover"
        />
      )}
      
      {/* Fallback */}
      <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold">
        {imageError || !optimizedSrc ? (
          fallback.slice(0, 2).toUpperCase()
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </AvatarFallback>
    </Avatar>
  )
}