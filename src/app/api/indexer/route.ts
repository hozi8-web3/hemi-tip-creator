import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { ethers } from 'ethers'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'tipchain'
const RPC_URL = process.env.RPC_URL || 'https://rpc.hemi.network/rpc'
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6B83C21A6203186c47EfDD0dD66edFa6967Ff69e'

const CONTRACT_ABI = [
  "event ProfileCreated(address indexed creator, string username)",
  "event ProfileUpdated(address indexed creator, string username)",
  "event TipSent(address indexed from, address indexed to, uint256 amount, address token, string message, uint256 tipIndex)",
  "function creatorProfiles(address) view returns (string username, string bio, string avatarURI, uint256 totalTipsReceived, uint256 tipCount, bool exists)",
  "function getAllCreators() view returns (address[])",
  "function getTip(uint256) view returns (address from, address to, uint256 amount, address token, uint256 timestamp, string message)",
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
    const { event, data } = await request.json()
    
    if (!CONTRACT_ADDRESS) {
      return NextResponse.json({ error: 'Contract address not configured' }, { status: 400 })
    }
    
    const mongoClient = await getMongoClient()
    const db = mongoClient.db(DB_NAME)
    const profiles = db.collection('profiles')
    const tips = db.collection('tips')
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
    
    switch (event) {
      case 'ProfileCreated':
      case 'ProfileUpdated':
        const { creator } = data
        
        // Fetch full profile from contract
        const [profile, socials] = await Promise.all([
          contract.creatorProfiles(creator),
          contract.getCreatorSocials(creator)
        ])
        
        await profiles.updateOne(
          { address: creator.toLowerCase() },
          {
            $set: {
              address: creator.toLowerCase(),
              username: profile.username,
              bio: profile.bio,
              avatarURI: profile.avatarURI,
              socials: socials,
              totalTipsReceived: profile.totalTipsReceived.toString(),
              tipCount: profile.tipCount.toString(),
              exists: profile.exists,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        )
        break
        
      case 'TipSent':
        const { from, to, amount, token, message, tipIndex, txHash } = data
        
        // Store tip
        await tips.insertOne({
          txHash: txHash || `tip-${tipIndex}`,
          from: from.toLowerCase(),
          to: to.toLowerCase(),
          amount: amount.toString(),
          token: token === ethers.ZeroAddress ? null : token.toLowerCase(),
          message: message || '',
          timestamp: Math.floor(Date.now() / 1000),
          createdAt: new Date()
        })
        
        // Update creator stats
        await profiles.updateOne(
          { address: to.toLowerCase() },
          {
            $inc: {
              totalTipsReceived: amount.toString(),
              tipCount: 1
            }
          }
        )
        break
        
      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Indexer error:', error)
    return NextResponse.json({ error: 'Indexing failed' }, { status: 500 })
  }
}

// Initialize database with existing blockchain data
export async function GET() {
  try {
    if (!CONTRACT_ADDRESS) {
      return NextResponse.json({ error: 'Contract address not configured' }, { status: 400 })
    }
    
    const mongoClient = await getMongoClient()
    const db = mongoClient.db(DB_NAME)
    const profiles = db.collection('profiles')
    const tips = db.collection('tips')
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
    
    // Get all creators
    const creatorAddresses = await contract.getAllCreators()
    
    // Sync profiles
    for (const address of creatorAddresses) {
      try {
        const [profile, socials] = await Promise.all([
          contract.creatorProfiles(address),
          contract.getCreatorSocials(address)
        ])
        
        if (profile.exists) {
          await profiles.updateOne(
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
        }
      } catch (error) {
        console.error(`Error syncing profile for ${address}:`, error)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Synced ${creatorAddresses.length} creator profiles` 
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}