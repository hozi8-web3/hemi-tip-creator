'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EditProfileModal } from '@/components/EditProfileModal'
import { ClientOnly } from '@/components/ClientOnly'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatEther, formatAddress } from '@/lib/utils'
import { useMounted } from '@/lib/hooks'
import { SafeAppHeader } from '@/components/SafeAppHeader'
import {
    User,
    Edit3,
    TrendingUp,
    Calendar,
    Coins,
    Users
} from 'lucide-react'
import Link from 'next/link'

interface CreatorProfile {
    address: string
    username: string
    bio: string
    avatarURI: string
    socials: string[]
    totalTipsReceived: string
    tipCount: string
}

export default function DashboardPage() {
    const { address, isConnected } = useAccount()
    const [profile, setProfile] = useState<CreatorProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const mounted = useMounted()

    useEffect(() => {
        if (address) {
            fetchProfile()
        }
    }, [address])

    const fetchProfile = async () => {
        if (!address) return

        try {
            const response = await fetch(`/api/creator/${address}`)

            if (response.ok) {
                const data = await response.json()
                setProfile(data.profile)
            } else if (response.status === 404) {
                // Profile doesn't exist yet - this is expected for new users
                setProfile(null)
            } else {
                console.warn(`API returned ${response.status}: ${response.statusText}`)
                setProfile(null)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ClientOnly
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            }
        >
            {!isConnected ? (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                    <Card className="glass-card max-w-md w-full mx-4">
                        <CardContent className="p-8 text-center">
                            <User className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Connect Your Wallet
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Connect your wallet to access your creator dashboard and manage your profile.
                            </p>
                            <ConnectButton />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <DashboardContent
                    address={address}
                    profile={profile}
                    loading={loading}
                    showEditModal={showEditModal}
                    setShowEditModal={setShowEditModal}
                    fetchProfile={fetchProfile}
                />
            )}
        </ClientOnly>
    )
}

function DashboardContent({
    address,
    profile,
    loading,
    showEditModal,
    setShowEditModal,
    fetchProfile
}: {
    address: string | undefined
    profile: CreatorProfile | null
    loading: boolean
    showEditModal: boolean
    setShowEditModal: (show: boolean) => void
    fetchProfile: () => void
}) {

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <SafeAppHeader />

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4">
                        Creator <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Manage your creator profile and track your tips on the blockchain.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Section */}
                        <div className="lg:col-span-2">
                            <Card className="glass-card">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-white">
                                        {profile ? 'Your Profile' : 'Create Profile'}
                                    </CardTitle>
                                    {profile && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowEditModal(true)}
                                            className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
                                        >
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    )}
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {!profile ? (
                                        <div className="text-center py-8">
                                            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                Create Your Profile
                                            </h3>
                                            <p className="text-gray-400 mb-6">
                                                Set up your creator profile to start receiving tips onchain.
                                            </p>
                                            <Button
                                                onClick={() => setShowEditModal(true)}
                                                className="bg-primary-500 hover:bg-primary-600 text-white"
                                            >
                                                Create Profile
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start space-x-6">
                                            <Avatar className="w-24 h-24">
                                                <AvatarImage src={profile.avatarURI} alt={profile.username} />
                                                <AvatarFallback className="text-2xl">
                                                    {profile.username[0]}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-white mb-2">
                                                    {profile.username}
                                                </h2>
                                                <p className="text-gray-400 mb-4">{profile.bio}</p>

                                                {/* Social Links */}
                                                {profile.socials && profile.socials.length > 0 && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Social Links:</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {profile.socials.map((social, index) => (
                                                                <a
                                                                    key={index}
                                                                    href={social.startsWith('http') ? social : `https://${social}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary-400 hover:text-primary-300 text-sm"
                                                                >
                                                                    {social}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                    <span>{formatAddress(address!)}</span>
                                                    <Link
                                                        href={`/creator/${address}`}
                                                        className="text-primary-400 hover:text-primary-300"
                                                    >
                                                        View Public Profile
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stats Section */}
                        <div className="space-y-6">
                            {profile && (
                                <>
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center text-primary-400">
                                                <Coins className="w-5 h-5 mr-2" />
                                                Total Tips
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-3xl font-bold text-white">
                                                {formatEther(profile.totalTipsReceived)}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                From {profile.tipCount} tips
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center text-primary-400">
                                                <TrendingUp className="w-5 h-5 mr-2" />
                                                Average Tip
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold text-white">
                                                {parseInt(profile.tipCount) > 0
                                                    ? formatEther((BigInt(profile.totalTipsReceived) / BigInt(profile.tipCount)).toString())
                                                    : '0 ETH'
                                                }
                                            </p>
                                            <p className="text-sm text-gray-400">Per tip</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center text-primary-400">
                                                <Users className="w-5 h-5 mr-2" />
                                                Supporters
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold text-white">
                                                {profile.tipCount}
                                            </p>
                                            <p className="text-sm text-gray-400">Unique tips</p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-primary-400">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {profile && (
                                        <Link href={`/creator/${address}`}>
                                            <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white">
                                                View Public Profile
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href="/creators">
                                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white">
                                            Browse Other Creators
                                        </Button>
                                    </Link>
                                    <Link href="/leaderboard">
                                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white">
                                            View Leaderboard
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                currentProfile={profile ? {
                    username: profile.username,
                    bio: profile.bio,
                    avatarURI: profile.avatarURI,
                    socials: profile.socials
                } : undefined}
                isCreating={!profile}
            />
        </div>
    )
}