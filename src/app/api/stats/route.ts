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

export async function GET() {
  try {
    const mongoClient = await getMongoClient()
    const db = mongoClient.db(DB_NAME)
    
    const profiles = db.collection('profiles')
    const tips = db.collection('tips')
    
    const [totalCreators, totalTips, ethTips] = await Promise.all([
      profiles.countDocuments({ exists: true }),
      tips.countDocuments({}),
      tips.find({ token: null }).toArray()
    ])
    
    // Calculate total ETH amount (only counting ETH tips for simplicity)
    const totalAmount = ethTips.reduce((sum, tip) => {
      return sum + BigInt(tip.amount || '0')
    }, BigInt(0))
    
    return NextResponse.json({
      totalCreators,
      totalTips,
      totalAmount: totalAmount.toString()
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    
    // Return fallback data instead of error
    return NextResponse.json({
      totalCreators: 0,
      totalTips: 0,
      totalAmount: '0'
    })
  }
}