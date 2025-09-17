'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { TrendingCreators } from '@/components/TrendingCreators'
import { RecentTips } from '@/components/RecentTips'
import { ParticleBackground } from '@/components/ParticleBackground'
import { SafeAppHeader } from '@/components/SafeAppHeader'
import { ClientOnly } from '@/components/ClientOnly'
import { Button } from '@/components/ui/button'
import { formatEther } from '@/lib/utils'
import { useMounted } from '@/lib/hooks'
import { Users, Trophy, Coins } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalCreators: number
  totalTips: number
  totalAmount: string
}

export default function HomePage() {
  const { isConnected } = useAccount()
  const [stats, setStats] = useState<Stats>({ totalCreators: 0, totalTips: 0, totalAmount: '0' })
  const [statsLoading, setStatsLoading] = useState(true)
  const mounted = useMounted()

  useEffect(() => {
    fetchStats()
  }, [])

  // Preload critical routes on component mount
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      // Simple prefetch using Next.js built-in functionality
      const prefetchRoutes = async () => {
        try {
          // Use fetch to warm up the routes
          fetch('/creators', { method: 'HEAD' }).catch(() => {})
          fetch('/dashboard', { method: 'HEAD' }).catch(() => {})
          fetch('/leaderboard', { method: 'HEAD' }).catch(() => {})
        } catch (error) {
          // Ignore prefetch errors
        }
      }
      prefetchRoutes()
    }
  }, [mounted])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Keep default values on error
    } finally {
      setStatsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <SafeAppHeader />

      {/* Hero Section */}
      <section className="relative z-10 text-center py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl font-bold mb-6">
            Support Creators
            <br />
            <span className="gradient-text">Onchain</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect your wallet and tip your favorite creators directly on Hemi Network.
            No middlemen, no fees, just pure creator support.
          </p>

          <ClientOnly
            fallback={
              <div className="flex justify-center">
                <Button size="lg" disabled className="bg-gray-600 text-gray-400 px-8 py-4 text-lg">
                  Loading...
                </Button>
              </div>
            }
          >
            {!isConnected ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Button
                      onClick={openConnectModal}
                      size="lg"
                      className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg orange-glow"
                    >
                      Connect Wallet to Start
                    </Button>
                  )}
                </ConnectButton.Custom>
              </motion.div>
            ) : (
              <div className="flex justify-center space-x-4">
                <Link href="/creators">
                  <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white">
                    Browse Creators
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white">
                    Creator Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </ClientOnly>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 text-center"
            >
              <Users className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {statsLoading ? (
                  <div className="h-8 bg-gray-700 rounded animate-pulse" />
                ) : (
                  stats.totalCreators.toLocaleString()
                )}
              </h3>
              <p className="text-gray-400">Active Creators</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6 text-center"
            >
              <Coins className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {statsLoading ? (
                  <div className="h-8 bg-gray-700 rounded animate-pulse" />
                ) : (
                  formatEther(stats.totalAmount)
                )}
              </h3>
              <p className="text-gray-400">Total Tips Sent</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6 text-center"
            >
              <Trophy className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {statsLoading ? (
                  <div className="h-8 bg-gray-700 rounded animate-pulse" />
                ) : (
                  stats.totalTips.toLocaleString()
                )}
              </h3>
              <p className="text-gray-400">Total Tips</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trending Creators */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-center mb-12 gradient-text"
          >
            Trending Creators
          </motion.h2>
          <TrendingCreators />
        </div>
      </section>

      {/* Recent Tips */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-center mb-12 gradient-text"
          >
            Recent Tips
          </motion.h2>
          <RecentTips />
        </div>
      </section>
    </div>
  )
}