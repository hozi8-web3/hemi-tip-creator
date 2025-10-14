'use client'

import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface CreatorProfile {
  address: string
  username: string
  bio: string
  avatarUrl: string
  socials: string[]
}

interface Tip {
  from: string
  to: string
  amount: string
  token: string
  message: string
  timestamp: number
}

export default function CreatorPageClient(): ReactNode {
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
      fetchCreatorProfile()
      fetchCreatorTips()
    }
  }, [address])

  const fetchCreatorProfile = async () => {
    try {
      const response = await fetch(`/api/creator/${address}`)
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchCreatorTips = async () => {
    try {
      const response = await fetch(`/api/tips?address=${address}`)
      const data = await response.json()
      setTips(data)
    } catch (error) {
      console.error('Error fetching tips:', error)
    } finally {
      setTipsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Creator Profile</h1>
          {profileLoading ? (
            <div>Loading profile...</div>
          ) : profile ? (
            <div>
              <h2 className="text-xl mb-2">{profile.username}</h2>
              <p className="text-gray-600 mb-4">{profile.bio}</p>
              <p className="font-mono text-sm">{address}</p>
            </div>
          ) : (
            <div>Profile not found</div>
          )}
        </div>

        {/* Tips Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Tips</h2>
          {tipsLoading ? (
            <div>Loading tips...</div>
          ) : tips.length > 0 ? (
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className="p-4 border rounded">
                  <p>From: {tip.from}</p>
                  <p>Amount: {tip.amount} {tip.token}</p>
                  {tip.message && <p>Message: {tip.message}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div>No tips yet</div>
          )}
        </div>
      </div>
    </div>
  )
}