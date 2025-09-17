import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { ethers } from 'ethers'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'tipchain'
const RPC_URL = process.env.RPC_URL || 'https://rpc.hemi.network/rpc'
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6B83C21A6203186c47EfDD0dD66edFa6967Ff69e'

const CONTRACT_ABI = [
  "function getAllCreators() view returns (address[])",
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

async function syncCreatorsFromBlockchain() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
    
    // Get all creator addresses from blockchain
    const creatorAddresses = await contract.getAllCreators()
    console.log(`Found ${creatorAddresses.length} creators on blockchain`)
    
    const mongoClient = await getMongoClient()
    const db = mongoClient.db(DB_NAME)
    const profiles = db.collection('profiles')
    
    // Check which creators are missing from database
    const existingAddresses = await profiles
      .find({ exists: true })
      .project({ address: 1 })
      .toArray()
    
    const existingSet = new Set(existingAddresses.map(p => p.address))
    const missingAddresses = creatorAddresses.filter((addr: string) => 
      !existingSet.has(addr.toLowerCase())
    )
    
    console.log(`Syncing ${missingAddresses.length} missing creators`)
    
    // Sync missing creators
    for (const address of missingAddresses) {
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
        console.error(`Error syncing creator ${address}:`, error)
      }
    }
    
    return missingAddresses.length
  } catch (error) {
    console.error('Error syncing from blockchain:', error)
    return 0
  }
}

export async function GET() {
  try {
    const mongoClient = await getMongoClient()
    const db = mongoClient.db(DB_NAME)
    const profiles = db.collection('profiles')
    
    // Get creators from database with optimized query
    let creators = await profiles
      .find(
        { exists: true },
        { 
          projection: {
            address: 1,
            username: 1,
            bio: 1,
            avatarURI: 1,
            socials: 1,
            totalTipsReceived: 1,
            tipCount: 1
          }
        }
      )
      .sort({ totalTipsReceived: -1 })
      .limit(100) // Limit for performance
      .toArray()
    
    // If no creators found, try syncing from blockchain
    if (creators.length === 0) {
      console.log('No creators in database, syncing from blockchain...')
      await syncCreatorsFromBlockchain()
      
      // Try again after sync
      creators = await profiles
        .find(
          { exists: true },
          { 
            projection: {
              address: 1,
              username: 1,
              bio: 1,
              avatarURI: 1,
              socials: 1,
              totalTipsReceived: 1,
              tipCount: 1
            }
          }
        )
        .sort({ totalTipsReceived: -1 })
        .limit(100)
        .toArray()
    }
    
    // Convert MongoDB _id to address for consistency
    const formattedCreators = creators.map(creator => ({
      address: creator.address,
      username: creator.username,
      bio: creator.bio,
      avatarURI: creator.avatarURI,
      socials: creator.socials || [],
      totalTipsReceived: creator.totalTipsReceived || '0',
      tipCount: creator.tipCount || '0'
    }))
    
    // Add cache headers for better performance
    const response = NextResponse.json(formattedCreators)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300, max-age=30')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300')
    
    return response
  } catch (error) {
    console.error('Error fetching creators:', error)
    return NextResponse.json({ error: 'Failed to fetch creators' }, { status: 500 })
  }
}