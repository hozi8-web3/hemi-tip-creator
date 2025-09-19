import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'tipchain'

let client: MongoClient | null = null

async function getMongoClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
  }
  return client
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const mongoClient = await getMongoClient()
    const db = mongoClient.db(DB_NAME)
    const tips = db.collection('tips')
    const profiles = db.collection('profiles')
    
    const recentTips = await tips
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()
    
    // Enrich tips with creator profiles
    const enrichedTips = await Promise.all(
      recentTips.map(async (tip) => {
        const creatorProfile = await profiles.findOne({ address: tip.to })
        return {
          id: tip.txHash || tip._id.toString(),
          from: tip.from,
          to: tip.to,
          amount: tip.amount,
          token: tip.token,
          // include token metadata so frontend can format ERC20 tips
          tokenSymbol: tip.tokenSymbol || null,
          tokenDecimals: tip.tokenDecimals || null,
          timestamp: tip.timestamp,
          message: tip.message || '',
          creatorProfile: creatorProfile ? {
            username: creatorProfile.username,
            avatarURI: creatorProfile.avatarURI
          } : null
        }
      })
    )
    
    return NextResponse.json(enrichedTips)
  } catch (error) {
    console.error('Error fetching tips:', error)
    return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 })
  }
}