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

let client: MongoClient | null = null

async function getMongoClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
  }
  return client
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }
    
    console.log(`🔄 Manual sync requested for ${address}`)
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
    
    // Get profile from blockchain
    const [profile, socials] = await Promise.all([
      contract.creatorProfiles(address),
      contract.getCreatorSocials(address)
    ])
    
    if (!profile.exists) {
      return NextResponse.json({ error: 'Profile does not exist on blockchain' }, { status: 404 })
    }
    
    // Update database
    const mongoClient = await getMongoClient()
    const db = mongoClient.db(DB_NAME)
    const profiles = db.collection('profiles')
    
    const result = await profiles.updateOne(
      { address: address.toLowerCase() },
      {
        $set: {
          address: address.toLowerCase(),
          username: profile.username,
          bio: profile.bio,
          avatarURI: profile.avatarURI,
          socials: socials,
          totalTipsReceived: profile.totalTipsReceived.toString(),
          tipCount: profile.tipCount.toString(),
          exists: profile.exists,
          syncedAt: new Date()
        }
      },
      { upsert: true }
    )
    
    console.log(`✅ Profile synced: ${profile.username}`)
    
    return NextResponse.json({
      success: true,
      profile: {
        address: address.toLowerCase(),
        username: profile.username,
        bio: profile.bio,
        avatarURI: profile.avatarURI,
        socials: socials,
        totalTipsReceived: profile.totalTipsReceived.toString(),
        tipCount: profile.tipCount.toString()
      },
      operation: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount
      }
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}