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
    
    const leaderboard = await profiles
      .find({ exists: true })
      .sort({ totalTipsReceived: -1 })
      .limit(50)
      .toArray()
    
    const formattedLeaderboard = leaderboard.map(creator => ({
      address: creator.address,
      username: creator.username,
      bio: creator.bio,
      avatarURI: creator.avatarURI,
      socials: creator.socials || [],
      totalTipsReceived: creator.totalTipsReceived || '0',
      tipCount: creator.tipCount || '0'
    }))
    
    return NextResponse.json(formattedLeaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}