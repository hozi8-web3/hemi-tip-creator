const { ethers } = require('ethers')
const { MongoClient } = require('mongodb')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'tipchain'
const RPC_URL = process.env.RPC_URL || 'https://rpc.hemi.network/rpc'
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6B83C21A6203186c47EfDD0dD66edFa6967Ff69e'

const CONTRACT_ABI = [
  "function creatorProfiles(address) view returns (string username, string bio, string avatarURI, uint256 totalTipsReceived, uint256 tipCount, bool exists)",
  "function getAllCreators() view returns (address[])",
  "function getCreatorSocials(address) view returns (string[])"
]

async function syncProfile(walletAddress) {
  let client
  
  try {
    console.log('🔄 Syncing profile for:', walletAddress)
    
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db(DB_NAME)
    const profiles = db.collection('profiles')
    
    // Get profile from blockchain
    const [profile, socials] = await Promise.all([
      contract.creatorProfiles(walletAddress),
      contract.getCreatorSocials(walletAddress)
    ])
    
    console.log('📋 Blockchain profile data:')
    console.log('- Username:', profile.username)
    console.log('- Bio:', profile.bio)
    console.log('- Avatar:', profile.avatarURI)
    console.log('- Exists:', profile.exists)
    console.log('- Socials:', socials)
    
    if (!profile.exists) {
      console.log('❌ Profile does not exist on blockchain')
      return
    }
    
    // Update database
    const result = await profiles.updateOne(
      { address: walletAddress.toLowerCase() },
      {
        $set: {
          address: walletAddress.toLowerCase(),
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
    
    console.log('✅ Profile synced to database')
    console.log('- Matched:', result.matchedCount)
    console.log('- Modified:', result.modifiedCount)
    console.log('- Upserted:', result.upsertedCount)
    
    // Verify by reading back
    const dbProfile = await profiles.findOne({ address: walletAddress.toLowerCase() })
    console.log('📖 Database profile:', dbProfile)
    
  } catch (error) {
    console.error('❌ Sync failed:', error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// Get wallet address from command line or prompt
const walletAddress = process.argv[2]

if (!walletAddress) {
  console.log('Usage: node scripts/sync-profile.js <wallet-address>')
  console.log('Example: node scripts/sync-profile.js 0x1234...')
  process.exit(1)
}

syncProfile(walletAddress)