import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { ethers } from 'ethers'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'tipchain'
const RPC_URL = process.env.RPC_URL || 'https://rpc.hemi.network/rpc'
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6B83C21A6203186c47EfDD0dD66edFa6967Ff69e'

const CONTRACT_ABI = [
  "function creatorProfiles(address) view returns (string username, string bio, string avatarURI, uint256 totalTipsReceived, uint256 tipCount, bool exists)",
  "function getCreatorSocials(address) view returns (string[])"
]

interface ProfileData {
  address: string
  username: string
  bio: string
  avatarURI: string
  socials: string[]
  totalTipsReceived: string
  tipCount: string
  exists: boolean
  syncedAt?: Date
}

let client: MongoClient | null = null

async function getMongoClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
  }
  return client
}

async function getProfileFromBlockchain(address: string): Promise<ProfileData | null> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

    const [profile, socials] = await Promise.all([
      contract.creatorProfiles(address),
      contract.getCreatorSocials(address)
    ])

    if (!profile.exists) {
      return null
    }

    return {
      address: address.toLowerCase(),
      username: profile.username,
      bio: profile.bio,
      avatarURI: profile.avatarURI,
      socials: socials,
      totalTipsReceived: profile.totalTipsReceived.toString(),
      tipCount: profile.tipCount.toString(),
      exists: profile.exists
    }
  } catch (error) {
    console.error('Error fetching from blockchain:', error)
    return null
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address.toLowerCase()
    const mongoClient = await getMongoClient()
    const db = mongoClient.db(DB_NAME)

    // Try to get profile from database first
    const profiles = db.collection('profiles')
    let profile = await profiles.findOne({ address })

    // If not found in database, try blockchain
    if (!profile || !profile.exists) {
      console.log(`Profile not found in DB for ${address}, checking blockchain...`)
      const blockchainProfile = await getProfileFromBlockchain(address)

      if (!blockchainProfile) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
      }

      // Save to database for future requests
      await profiles.updateOne(
        { address },
        { $set: { ...blockchainProfile, syncedAt: new Date() } },
        { upsert: true }
      )

      // Use blockchain profile data directly
      const formattedProfile = {
        address: blockchainProfile.address,
        username: blockchainProfile.username,
        bio: blockchainProfile.bio,
        avatarURI: blockchainProfile.avatarURI,
        socials: blockchainProfile.socials || [],
        totalTipsReceived: blockchainProfile.totalTipsReceived || '0',
        tipCount: blockchainProfile.tipCount || '0'
      }

      // Get tips for this creator (likely empty for new profiles)
      const tips = db.collection('tips')
      const creatorTips = await tips
        .find({ to: address })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray()

      const formattedTips = creatorTips.map(tip => ({
        id: tip.txHash || tip._id.toString(),
        from: tip.from,
        to: tip.to,
        amount: tip.amount,
        token: tip.token,
        tokenSymbol: tip.tokenSymbol || null,
        tokenDecimals: tip.tokenDecimals || null,
        timestamp: tip.timestamp,
        message: tip.message || ''
      }))

      return NextResponse.json({
        profile: formattedProfile,
        tips: formattedTips
      })
    }

    // Profile exists in database
    const formattedProfile = {
      address: profile.address,
      username: profile.username,
      bio: profile.bio,
      avatarURI: profile.avatarURI,
      socials: profile.socials || [],
      totalTipsReceived: profile.totalTipsReceived || '0',
      tipCount: profile.tipCount || '0',
      // perTokenTotals is an object keyed by token address with { total, symbol, decimals }
      perTokenTotals: profile.perTokenTotals || {}
    }

    // Get tips for this creator
    const tips = db.collection('tips')
    const creatorTips = await tips
      .find({ to: address })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray()

    const formattedTips = creatorTips.map(tip => ({
      id: tip.txHash || tip._id.toString(),
      from: tip.from,
      to: tip.to,
      amount: tip.amount,
      token: tip.token,
      // include token metadata for consistency with other endpoints
      tokenSymbol: tip.tokenSymbol || null,
      tokenDecimals: tip.tokenDecimals || null,
      timestamp: tip.timestamp,
      message: tip.message || ''
    }))

    const response = NextResponse.json({
      profile: formattedProfile,
      tips: formattedTips
    })
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600, max-age=60')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=600')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=600')
    
    return response
  } catch (error) {
    console.error('Error fetching creator:', error)
    return NextResponse.json({ error: 'Failed to fetch creator' }, { status: 500 })
  }
}