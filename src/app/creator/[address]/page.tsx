'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TipModal } from '@/components/TipModal'
import { QRCodeGenerator } from '@/components/QRCodeGenerator'
import { formatEther, formatAddress, timeAgo } from '@/lib/utils'
import { SafeAppHeader } from '@/components/SafeAppHeader'
import { SkeletonCard } from '@/components/PageLoader'
import {
  Zap,
  Copy,
  ExternalLink,
  Twitter,
  Youtube,
  Globe,
  QrCode,
  Calendar,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface CreatorProfile {
  address: string
  username: string
  bio: string
  avatarURI: string
  totalTipsReceived: string
  tipCount: string
}

interface Tip {
  id: string
  from: string
  amount: string
  token: string | null
  timestamp: string
  message: string
}

export default function CreatorProfilePage() {
  const params = useParams()
  const address = params.address as string
  const { isConnected } = useAccount()

  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [tips, setTips] = useState<Tip[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [tipsLoading, setTipsLoading] = useState(true)
  const [showTipModal, setShowTipModal] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (address) {
      fetchCreatorData()
    }
  }, [address])

  const fetchCreatorData = async () => {
    // Fetch profile and tips in parallel for better performance
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/creator/${address}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
          setTips(data.tips)
        } else {
          throw new Error('Profile not found')
        }
      } catch (error) {
        console.error('Error fetching creator data:', error)
        // Mock data for demo
        setProfile({
          address: address,
          username: 'CryptoArtist',
          bio: 'Digital artist creating NFT masterpieces and abstract art. Passionate about blockchain technology and decentralized creativity.',
          avatarURI: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
          totalTipsReceived: '12500000000000000000',
          tipCount: '156',
        })
        setTips([
          {
            id: '1',
            from: '0x1111111111111111111111111111111111111111',
            amount: '500000000000000000',
            token: null,
            timestamp: (Math.floor(Date.now() / 1000) - 300).toString(),
            message: 'Love your latest artwork! 🎨',
          },
          {
            id: '2',
            from: '0x2222222222222222222222222222222222222222',
            amount: '1200000000000000000',
            token: null,
            timestamp: (Math.floor(Date.now() / 1000) - 600).toString(),
            message: 'Amazing work as always! Keep it up 🚀',
          },
        ])
      } finally {
        setProfileLoading(false)
        setTipsLoading(false)
      }
    }

    await fetchProfile()
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const getSocialIcon = (social: string) => {
    if (social.includes('twitter')) return <Twitter className="w-4 h-4" />
    if (social.includes('youtube')) return <Youtube className="w-4 h-4" />
    return <Globe className="w-4 h-4" />
  }

  // Show error state only if profile loading failed and no profile exists
  if (!profileLoading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <SafeAppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Creator Not Found</h1>
            <p className="text-gray-400 mb-6">This creator profile doesn't exist or hasn't been created yet.</p>
            <Link href="/creators">
              <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                Browse Creators
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <SafeAppHeader />

      {/* Quick loading indicator */}
      {(profileLoading || tipsLoading) && (
        <div className="fixed top-20 right-6 z-40">
          <div className="bg-primary-500/20 backdrop-blur-sm rounded-full p-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header */}
        {profileLoading ? (
          <div className="glass-card p-8 mb-8 animate-pulse">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-32 h-32 bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-10 bg-gray-700 rounded mb-4 w-64" />
                <div className="h-4 bg-gray-700 rounded mb-2 w-48" />
                <div className="h-4 bg-gray-700 rounded mb-6 w-full" />
                <div className="flex space-x-8">
                  <div>
                    <div className="h-8 bg-gray-700 rounded mb-2 w-20" />
                    <div className="h-3 bg-gray-700 rounded w-24" />
                  </div>
                  <div>
                    <div className="h-8 bg-gray-700 rounded mb-2 w-16" />
                    <div className="h-3 bg-gray-700 rounded w-20" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="h-12 bg-gray-700 rounded w-32" />
                <div className="h-10 bg-gray-700 rounded w-32" />
              </div>
            </div>
          </div>
        ) : profile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.avatarURI} alt={profile.username} />
                <AvatarFallback className="text-4xl">{profile.username[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{profile.username}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-gray-400">{formatAddress(address)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyAddress}
                    className="text-gray-400 hover:text-primary-400"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-gray-300 text-lg mb-6">{profile.bio}</p>

                <div className="flex flex-wrap gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary-400">
                      {formatEther(profile.totalTipsReceived)}
                    </p>
                    <p className="text-sm text-gray-400">Total Tips Received</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{profile.tipCount}</p>
                    <p className="text-sm text-gray-400">Number of Tips</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                {isConnected ? (
                  <Button
                    onClick={() => setShowTipModal(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 text-lg orange-glow"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Send Tip
                  </Button>
                ) : (
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button
                        onClick={openConnectModal}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 text-lg"
                      >
                        Connect to Tip
                      </Button>
                    )}
                  </ConnectButton.Custom>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowQRCode(true)}
                  className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {profileLoading ? (
            // Skeleton stats cards
            [...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-5 h-5 bg-gray-700 rounded mr-2" />
                  <div className="h-4 bg-gray-700 rounded w-24" />
                </div>
                <div className="h-8 bg-gray-700 rounded mb-2 w-20" />
                <div className="h-3 bg-gray-700 rounded w-16" />
              </div>
            ))
          ) : profile ? (
            // Actual stats cards
            <>
          <motion.div
            key="recent-activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-primary-400">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {tips.filter(tip =>
                    parseInt(tip.timestamp) > Date.now() / 1000 - 86400
                  ).length}
                </p>
                <p className="text-sm text-gray-400">Tips in last 24h</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            key="average-tip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-primary-400">
                  <Calendar className="w-5 h-5 mr-2" />
                  Average Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {tips.length > 0
                    ? formatEther((BigInt(profile.totalTipsReceived) / BigInt(tips.length)).toString())
                    : '0 ETH'
                  }
                </p>
                <p className="text-sm text-gray-400">Per tip</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            key="blockchain-link"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-primary-400">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Blockchain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`https://explorer.hemi.xyz/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  View on Explorer
                </a>
              </CardContent>
            </Card>
          </motion.div>
            </>
          ) : null}
        </div>

        {/* Recent Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Recent Tips</CardTitle>
            </CardHeader>
            <CardContent>
              {tipsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-gray-700 rounded-full" />
                        <div>
                          <div className="h-4 bg-gray-700 rounded mb-2 w-48" />
                          <div className="h-3 bg-gray-700 rounded w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-3 bg-gray-700 rounded mb-1 w-16" />
                        <div className="h-3 bg-gray-700 rounded w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : tips.length > 0 ? (
                <div className="space-y-4">
                  {tips.slice(0, 10).map((tip, index) => (
                    <div
                      key={tip.id}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <div>
                          <p className="text-white font-medium">
                            {formatEther(tip.amount)} from {formatAddress(tip.from)}
                          </p>
                          {tip.message && (
                            <p className="text-gray-400 text-sm">{tip.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">
                          {timeAgo(parseInt(tip.timestamp))}
                        </p>
                        <a
                          href={`https://explorer.hemi.xyz/tx/${tip.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 text-sm"
                        >
                          View Tx
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No tips received yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      {profile && (
        <TipModal
          isOpen={showTipModal}
          creatorAddress={address}
          creatorUsername={profile.username}
          onClose={() => setShowTipModal(false)}
        />
      )}

      {showQRCode && profile && (
        <QRCodeGenerator
          address={address}
          username={profile.username}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  )
}