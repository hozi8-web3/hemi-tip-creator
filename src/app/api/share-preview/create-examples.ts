import { createCanvas, loadImage } from 'canvas'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

async function createExampleImage(theme: 'light' | 'dark', isMobile = false) {
  // Set up canvas with correct dimensions
  const width = isMobile ? 600 : 1200
  const height = isMobile ? 315 : 630
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Load template
  const templatePath = path.join(process.cwd(), 'public', 'share-preview', isMobile ? 'template-mobile.svg' : 'template.svg')
  let svgTemplate = fs.readFileSync(templatePath, 'utf-8')

  // Example data
  const exampleData = {
    username: 'CryptoArtist',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face'
  }

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(`https://tipchain.xyz/creator/${exampleData.address}`, {
    width: isMobile ? 120 : 240,
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
    .replace('Creator Name', exampleData.username)
    .replace('0x1234...5678', `${exampleData.address.slice(0, 6)}...${exampleData.address.slice(-4)}`)
    .replace('id="creator-initial"', `id="creator-initial">${exampleData.username[0]}</text>`)

  // Draw background
  ctx.fillStyle = theme === 'light' ? '#ffffff' : '#111827'
  ctx.fillRect(0, 0, width, height)

  // Convert SVG to image and draw
  const svgImage = Buffer.from(svgTemplate)
  const image = await loadImage(svgImage)
  ctx.drawImage(image, 0, 0)

  // Add QR code
  const qrImage = await loadImage(qrCodeUrl)
  ctx.drawImage(qrImage, 
    isMobile ? 410 : 820,
    isMobile ? 70 : 140,
    isMobile ? 120 : 240,
    isMobile ? 120 : 240
  )

  // Save the file
  const outputDir = path.join(process.cwd(), 'public', 'share-preview', 'examples')
  const filename = `preview-${theme}${isMobile ? '-mobile' : ''}.png`
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(path.join(outputDir, filename), buffer)

  console.log(`Created ${filename}`)
}

async function main() {
  // Create all variants
  await Promise.all([
    createExampleImage('light'),
    createExampleImage('dark'),
    createExampleImage('light', true),
    createExampleImage('dark', true)
  ])
  console.log('All example images created!')
}

main().catch(console.error)