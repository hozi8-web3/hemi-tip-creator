const { ethers } = require('ethers')
const { MongoClient } = require('mongodb')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'tipchain'
const RPC_URL = process.env.RPC_URL || 'https://rpc.hemi.network/rpc'
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6B83C21A6203186c47EfDD0dD66edFa6967Ff69e'

const CONTRACT_ABI = [
  "event ProfileCreated(address indexed creator, string username)",
  "event ProfileUpdated(address indexed creator, string username)",
  "event TipSent(address indexed from, address indexed to, uint256 amount, address token, string message, uint256 tipIndex)",
  "function creatorProfiles(address) view returns (string username, string bio, string avatarURI, uint256 totalTipsReceived, uint256 tipCount, bool exists)",
  "function getCreatorSocials(address) view returns (string[])"
]

let mongoClient = null
let isRunning = false

async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI)
    await mongoClient.connect()
    console.log('✅ Connected to MongoDB')
  }
  return mongoClient
}

async function indexProfileEvent(creator, eventType) {
  try {
    console.log(`📝 Indexing ${eventType} for ${creator}`)
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
    
    // Get full profile data from contract
    const [profile, socials] = await Promise.all([
      contract.creatorProfiles(creator),
      contract.getCreatorSocials(creator)
    ])
    
    if (!profile.exists) {
      console.log(`❌ Profile ${creator} does not exist on chain`)
      return
    }
    
    const client = await getMongoClient()
    const db = client.db(DB_NAME)
    const profiles = db.collection('profiles')
    
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
          indexedAt: new Date()
        }
      },
      { upsert: true }
    )
    
    console.log(`✅ Indexed profile: ${profile.username} (${creator})`)
  } catch (error) {
    console.error(`❌ Error indexing profile ${creator}:`, error)
  }
}

async function indexTipEvent(from, to, amount, token, message, tipIndex, txHash) {
  try {
    console.log(`💰 Indexing tip from ${from} to ${to}`)
    
    const client = await getMongoClient()
    const db = client.db(DB_NAME)
    const tips = db.collection('tips')
    const profiles = db.collection('profiles')
    
    // Store tip
    await tips.insertOne({
      txHash: txHash,
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      amount: amount.toString(),
      token: token === ethers.ZeroAddress ? null : token.toLowerCase(),
      message: message || '',
      timestamp: Math.floor(Date.now() / 1000),
      indexedAt: new Date()
    })
    
    // Update recipient stats
    await profiles.updateOne(
      { address: to.toLowerCase() },
      {
        $inc: {
          totalTipsReceived: amount.toString(),
          tipCount: 1
        }
      }
    )
    
    console.log(`✅ Indexed tip: ${ethers.formatEther(amount)} ETH`)
  } catch (error) {
    console.error(`❌ Error indexing tip:`, error)
  }
}

async function startEventListener() {
  if (isRunning) {
    console.log('⚠️ Event listener already running')
    return
  }
  
  try {
    console.log('🚀 Starting background event listener...')
    isRunning = true
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
    
    // Listen for ProfileCreated events
    contract.on('ProfileCreated', async (creator, username, event) => {
      console.log(`🆕 ProfileCreated: ${username} (${creator})`)
      await indexProfileEvent(creator, 'ProfileCreated')
    })
    
    // Listen for ProfileUpdated events
    contract.on('ProfileUpdated', async (creator, username, event) => {
      console.log(`📝 ProfileUpdated: ${username} (${creator})`)
      await indexProfileEvent(creator, 'ProfileUpdated')
    })
    
    // Listen for TipSent events
    contract.on('TipSent', async (from, to, amount, token, message, tipIndex, event) => {
      console.log(`💰 TipSent: ${ethers.formatEther(amount)} ETH from ${from} to ${to}`)
      await indexTipEvent(from, to, amount, token, message, tipIndex, event.transactionHash)
    })
    
    console.log('✅ Event listener started successfully')
    console.log('📡 Listening for blockchain events...')
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down event listener...')
      isRunning = false
      if (mongoClient) {
        await mongoClient.close()
      }
      process.exit(0)
    })
    
  } catch (error) {
    console.error('❌ Error starting event listener:', error)
    isRunning = false
  }
}

// Auto-start if run directly
if (require.main === module) {
  startEventListener().catch(console.error)
}

module.exports = { startEventListener, indexProfileEvent, indexTipEvent }