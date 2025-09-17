'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatEther, formatAddress, timeAgo } from '@/lib/utils'
import { ExternalLink, MessageCircle, Zap } from 'lucide-react'

interface Tip {
  id: string
  from: string
  to: string
  amount: string
  token: string | null
  timestamp: string
  message: string
  creatorProfile?: {
    username: string
    avatarURI: string
  }
}

export function RecentTips() {
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentTips()
  }, [])

  const fetchRecentTips = async () => {
    try {
      const response = await fetch('/api/tips?limit=4')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setTips(data)
      } else {
        console.warn('API returned non-array data:', data)
        setTips([])
      }
    } catch (error) {
      console.error('Error fetching recent tips:', error)
      setTips([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2" />
                  <div className="h-6 bg-gray-700 rounded w-3/4" />
                </div>
                <div className="w-4 h-4 bg-gray-700 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tips.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No tips yet</h3>
        <p className="text-gray-500">Tips will appear here once creators start receiving them!</p>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {tips.map((tip, index) => (
        <motion.div
          key={tip.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass-card hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={tip.creatorProfile?.avatarURI} 
                    alt={tip.creatorProfile?.username || 'Creator'} 
                  />
                  <AvatarFallback>
                    {tip.creatorProfile?.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-gray-400 text-sm">
                      {formatAddress(tip.from)}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="text-primary-400 font-medium">
                      {tip.creatorProfile?.username || formatAddress(tip.to)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {timeAgo(parseInt(tip.timestamp))}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary-400">
                      {formatEther(tip.amount)}
                    </span>
                    {tip.message && (
                      <>
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {tip.message}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <a
                  href={`https://explorer.hemi.xyz/tx/${tip.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}