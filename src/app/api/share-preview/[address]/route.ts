import { NextResponse } from 'next/server'
import { createCanvas, loadImage } from 'canvas'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { formatAddress } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params
    const searchParams = new URL(request.url).searchParams
    const theme = searchParams.get('theme') || 'dark'
    const profile = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creator/${address}`).then(res => res.json())

    if (!profile) {
      return new NextResponse('Creator not found', { status: 404 })
    }

    // Load the SVG template
    const templatePath = path.join(process.cwd(), 'public', 'share-preview', 'template.svg')
    let svgTemplate = fs.readFileSync(templatePath, 'utf-8')

    // Generate QR code
    const tipUrl = `${process.env.NEXT_PUBLIC_APP_URL}/creator/${address}`
    const qrCodeUrl = await QRCode.toDataURL(tipUrl, {
      width: 240,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Replace placeholders in SVG
    svgTemplate = svgTemplate
      .replace('class="theme-background"', `fill="url(#${theme}Gradient)"`)
      .replace('class="theme-text"', `fill="${theme === 'light' ? '#111827' : '#ffffff'}"`)
      .replace('Creator Name', profile.username)
      .replace('0x1234...5678', formatAddress(address))
      .replace('id="creator-initial"', `id="creator-initial">${profile.username[0]}</text>`)

    // Convert SVG to PNG
    const canvas = createCanvas(1200, 630)
    const ctx = canvas.getContext('2d')

    // Draw background
    ctx.fillStyle = theme === 'light' ? '#ffffff' : '#111827'
    ctx.fillRect(0, 0, 1200, 630)

    // Convert SVG to image
    const svgImage = Buffer.from(svgTemplate)
    const image = await loadImage(svgImage)
    ctx.drawImage(image, 0, 0)

    // Add QR code
    const qrImage = await loadImage(qrCodeUrl)
    ctx.drawImage(qrImage, 820, 140, 240, 240)

    // Add creator avatar if available
    if (profile.avatarURI) {
      try {
        const avatar = await loadImage(profile.avatarURI)
        ctx.save()
        ctx.beginPath()
        ctx.arc(120, 240, 60, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(avatar, 60, 180, 120, 120)
        ctx.restore()
      } catch (error) {
        console.error('Error loading avatar:', error)
      }
    }

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png')

    // Return the image
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Error generating preview:', error)
    return new NextResponse('Error generating preview', { status: 500 })
  }
}