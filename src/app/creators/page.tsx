'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OptimizedAvatar } from '@/components/OptimizedAvatar'
import { Input } from '@/components/ui/input'
import { formatEther, formatAddress } from '@/lib/utils'
import { SafeAppHeader } from '@/components/SafeAppHeader'
import { TipModal } from '@/components/TipModal'
import { Search, Zap, ExternalLink, Users, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Creator {
  address: string
  username: string
  bio: string
  avatarURI: string
  totalTipsReceived: string
  tipCount: string
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTipModal, setShowTipModal] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)

  // Memoize filtered creators for better performance
  const filteredCreators = useMemo(() => {
    if (!searchTerm) return creators
    
    const term = searchTerm.toLowerCase()
    return creators.filter(creator =>
      creator.username.toLowerCase().includes(term) ||
      creator.bio.toLowerCase().includes(term) ||
      creator.address.toLowerCase().includes(term)
    )
  }, [creators, searchTerm])

  useEffect(() => {
    fetchCreators()
  }, [])

  const fetchCreators = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/creators', {
        cache: 'no-store', // Always get fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch creators: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setCreators(data)
        console.log(`✅ Loaded ${data.length} creators`)
      } else {
        console.warn('API returned non-array data:', data)
        setError('Invalid data format received')
        setCreators([])
      }
    } catch (error) {
      console.error('Error fetching creators:', error)
      setError(error instanceof Error ? error.message : 'Failed to load creators')
      setCreators([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleTipClick = (creator: Creator) => {
    setSelectedCreator(creator)
    setShowTipModal(true)
  }

  const handleTipModalClose = () => {
    setShowTipModal(false)
    setSelectedCreator(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <SafeAppHeader />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            Discover <span className="gradient-text">Creators</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Support your favorite creators with direct onchain tips. No middlemen, no fees.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </motion.div>

        {/* Stats & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center space-x-8 mb-8"
        >
          <div className="flex items-center space-x-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span>{filteredCreators.length} Creators</span>
          </div>
          
          <Button
            onClick={fetchCreators}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-center"
          >
            <p className="text-red-400 mb-2">{error}</p>
            <Button
              onClick={fetchCreators}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Creators Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card animate-pulse">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator, index) => (
              <motion.div
                key={creator.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card hover:orange-glow transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <OptimizedAvatar
                        src={creator.avatarURI}
                        alt={creator.username}
                        fallback={creator.username}
                        size="md"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {creator.username}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatAddress(creator.address)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {creator.bio}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-400">
                          {formatEther(creator.totalTipsReceived)}
                        </p>
                        <p className="text-xs text-gray-400">Total Tips</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {creator.tipCount}
                        </p>
                        <p className="text-xs text-gray-400">Tips Count</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/creator/${creator.address}`} className="flex-1">
                        <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        onClick={() => handleTipClick(creator)}
                        className="bg-primary-500/20 hover:bg-primary-500 text-primary-400 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
                        title={`Tip ${creator.username}`}
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredCreators.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No creators found</h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </motion.div>
        )}
      </div>

      {/* Tip Modal */}
      {selectedCreator && (
        <TipModal
          isOpen={showTipModal}
          onClose={handleTipModalClose}
          creatorAddress={selectedCreator.address}
          creatorUsername={selectedCreator.username}
        />
      )}
    </div>
  )
}