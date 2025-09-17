'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatEther, formatAddress } from '@/lib/utils'
import { Zap, ExternalLink, Users } from 'lucide-react'
import Link from 'next/link'

interface Creator {
  address: string
  username: string
  bio: string
  avatarURI: string
  totalTipsReceived: string
  tipCount: string
}

export function TrendingCreators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingCreators()
  }, [])

  const fetchTrendingCreators = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Get top 3 creators for trending section
      if (Array.isArray(data)) {
        setCreators(data.slice(0, 3))
      } else {
        console.warn('API returned non-array data:', data)
        setCreators([])
      }
    } catch (error) {
      console.error('Error fetching trending creators:', error)
      setCreators([])
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
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
    )
  }

  if (creators.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No creators yet</h3>
        <p className="text-gray-500 mb-6">Be the first to create a profile and start receiving tips!</p>
        <Link href="/dashboard">
          <Button className="bg-primary-500 hover:bg-primary-600 text-white">
            Create Profile
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {creators.map((creator, index) => (
        <motion.div
          key={creator.address}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass-card hover:orange-glow transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={creator.avatarURI} alt={creator.username} />
                  <AvatarFallback>{creator.username[0]}</AvatarFallback>
                </Avatar>
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
                  className="bg-primary-500/20 hover:bg-primary-500 text-primary-400 hover:text-white"
                >
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}