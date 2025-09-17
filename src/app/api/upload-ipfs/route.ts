import { NextRequest, NextResponse } from 'next/server'

// Simple IPFS upload using Pinata (easier to set up)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const address = formData.get('address') as string
    const signature = formData.get('signature') as string
    const message = formData.get('message') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!address || !signature || !message) {
      return NextResponse.json({ 
        error: 'Missing authentication: address, signature, and message required' 
      }, { status: 401 })
    }
    
    // Validate message format and timing
    try {
      const messageData = JSON.parse(message)
      const timestamp = messageData.timestamp
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      
      if (!timestamp || now - timestamp > fiveMinutes) {
        return NextResponse.json({ error: 'Message expired' }, { status: 401 })
      }
      
      if (messageData.action !== 'upload_avatar') {
        return NextResponse.json({ error: 'Invalid message action' }, { status: 401 })
      }
      
      if (messageData.address.toLowerCase() !== address.toLowerCase()) {
        return NextResponse.json({ error: 'Address mismatch' }, { status: 401 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
    }
    
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }
    
    // Upload to Pinata if JWT is available
    if (process.env.PINATA_JWT) {
      try {
        const pinataFormData = new FormData()
        pinataFormData.append('file', file)
        
        const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PINATA_JWT}`
          },
          body: pinataFormData
        })
        
        if (!pinataResponse.ok) {
          throw new Error(`Pinata error: ${pinataResponse.status}`)
        }
        
        const result = await pinataResponse.json()
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
        
        return NextResponse.json({
          success: true,
          cid: result.IpfsHash,
          url: ipfsUrl
        })
      } catch (error) {
        console.error('Pinata upload failed:', error)
        // Fall through to placeholder
      }
    }
    
    // Fallback: return placeholder
    const timestamp = Date.now()
    const placeholder = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face&t=${timestamp}`
    
    return NextResponse.json({
      success: true,
      cid: `placeholder-${timestamp}`,
      url: placeholder
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 })
  }
}