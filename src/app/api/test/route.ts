import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: {
      hasIPFS: !!process.env.IPFS_PROJECT_ID,
      hasPinata: !!process.env.PINATA_JWT,
      ipfsUrl: process.env.IPFS_API_URL
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'POST request received',
      receivedData: body
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to parse JSON'
    }, { status: 400 })
  }
}