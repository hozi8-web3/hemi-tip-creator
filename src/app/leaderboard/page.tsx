'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatEther, formatAddress } from '@/lib/utils'
import { SafeAppHeader } from '@/components/SafeAppHeader'
import { Trophy, Medal, Award, Zap, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

interface Creator {
  address: string
  username: string
  bio: string
  avatarURI: string
  totalTipsReceived: string
  tipCount: string
}

export default function LeaderboardPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all')

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setCreators(data)
      } else {
        console.warn('API returned non-array data:', data)
        setCreators([])
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      // Mock data for demo
      const mockCreators = [
        {
          address: '0x3456789012345678901234567890123456789012',
          username: 'CodeWizard',
          bio: 'Full-stack developer and blockchain enthusiast',
          avatarURI: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          totalTipsReceived: '15700000000000000000',
          tipCount: '203',
        },
        {
          address: '0x1234567890123456789012345678901234567890',
          username: 'CryptoArtist',
          bio: 'Digital artist creating NFT masterpieces',
          avatarURI: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          totalTipsReceived: '12500000000000000000',
          tipCount: '156',
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          username: 'MusicMaker',
          bio: 'Electronic music producer and DJ',
          avatarURI: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          totalTipsReceived: '8300000000000000000',
          tipCount: '89',
        },
      ]
      setCreators(mockCreators)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">
            {rank}
          </div>
        )
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600'
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <SafeAppHeader />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Top creators ranked by total tips received. Support your favorites to help them climb the ranks!
          </p>
        </motion.div>

        {/* Timeframe Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'month', label: 'This Month' },
              { key: 'week', label: 'This Week' }
            ].map((option) => (
              <Button
                key={option.key}
                variant={timeframe === option.key ? 'default' : 'ghost'}
                onClick={() => setTimeframe(option.key as any)}
                className={`px-6 py-2 ${
                  timeframe === option.key
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {!loading && creators.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {/* 2nd Place */}
            <div className="md:order-1 flex flex-col items-center">
              <Card className="glass-card w-full max-w-sm">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-20 h-20 mx-auto">
                      <AvatarImage src={creators[1].avatarURI} alt={creators[1].username} />
                      <AvatarFallback>{creators[1].username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Medal className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {creators[1].username}
                  </h3>
                  <p className="text-2xl font-bold text-primary-400 mb-2">
                    {formatEther(creators[1].totalTipsReceived)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {creators[1].tipCount} tips
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="md:order-2 flex flex-col items-center">
              <Card className="glass-card w-full max-w-sm orange-glow-strong">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src={creators[0].avatarURI} alt={creators[0].username} />
                      <AvatarFallback>{creators[0].username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-3 -right-3">
                      <Trophy className="w-10 h-10 text-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold mb-2">
                    #1 CREATOR
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {creators[0].username}
                  </h3>
                  <p className="text-3xl font-bold text-primary-400 mb-2">
                    {formatEther(creators[0].totalTipsReceived)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {creators[0].tipCount} tips
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="md:order-3 flex flex-col items-center">
              <Card className="glass-card w-full max-w-sm">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-20 h-20 mx-auto">
                      <AvatarImage src={creators[2].avatarURI} alt={creators[2].username} />
                      <AvatarFallback>{creators[2].username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Award className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {creators[2].username}
                  </h3>
                  <p className="text-2xl font-bold text-primary-400 mb-2">
                    {formatEther(creators[2].totalTipsReceived)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {creators[2].tipCount} tips
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="w-8 h-8 bg-gray-700 rounded" />
                      <div className="w-12 h-12 bg-gray-700 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded mb-2" />
                        <div className="h-3 bg-gray-700 rounded w-2/3" />
                      </div>
                      <div className="text-right">
                        <div className="h-6 bg-gray-700 rounded w-20 mb-1" />
                        <div className="h-4 bg-gray-700 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {Array.isArray(creators) && creators.length > 0 ? creators.map((creator, index) => (
                    <motion.div
                      key={creator.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-4 p-6 hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {getRankIcon(index + 1)}
                        <span className="text-gray-400 font-mono text-sm">
                          #{index + 1}
                        </span>
                      </div>
                      
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={creator.avatarURI} alt={creator.username} />
                        <AvatarFallback>{creator.username[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-white">
                            {creator.username}
                          </h3>
                          {index < 3 && (
                            <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getRankBadge(index + 1)}`}>
                              TOP {index + 1}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {formatAddress(creator.address)} • {creator.tipCount} tips
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-400">
                          {formatEther(creator.totalTipsReceived)}
                        </p>
                        <p className="text-sm text-gray-400">Total Tips</p>
                      </div>
                      
                      <Link href={`/creator/${creator.address}`}>
                        <Button
                          size="sm"
                          className="bg-primary-500 hover:bg-primary-600 text-white"
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Tip
                        </Button>
                      </Link>
                    </motion.div>
                  )) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No creators found</h3>
                      <p className="text-gray-500">Be the first to create a profile!</p>
                      <Link href="/dashboard">
                        <Button className="mt-4 bg-primary-500 hover:bg-primary-600 text-white">
                          Create Profile
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{creators.length}</p>
              <p className="text-sm text-gray-400">Total Creators</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {creators.reduce((sum, creator) => sum + parseInt(creator.tipCount), 0)}
              </p>
              <p className="text-sm text-gray-400">Total Tips</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {formatEther(
                  creators.reduce((sum, creator) => 
                    sum + BigInt(creator.totalTipsReceived), BigInt(0)
                  ).toString()
                )}
              </p>
              <p className="text-sm text-gray-400">Total Volume</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}