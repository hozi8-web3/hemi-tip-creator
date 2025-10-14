import { Metadata } from 'next'
import { headers } from 'next/headers'

interface CreatorMetadataProps {
  params: { address: string }
}

export async function generateMetadata({ params }: CreatorMetadataProps): Promise<Metadata> {
  const { address } = params
  const headersList = headers()
  const host = headersList.get('host')
  const protocol = process?.env.NODE_ENV === 'development' ? 'http' : 'https'

  // Construct absolute URLs
  const baseUrl = `${protocol}://${host}`
  const canonicalUrl = `${baseUrl}/creator/${address}`

  try {
    // Fetch creator data first to ensure we have the username
    const response = await fetch(`${baseUrl}/api/creator/${address}`)
    const data = await response.json()
    const profile = data.profile

    if (!profile) {
      return {
        title: 'Creator Not Found - TipChain',
        description: 'This creator profile does not exist or has not been created yet.',
      }
    }

    // Construct the OG image URL with query parameters
    const ogImageUrl = `${baseUrl}/api/og?username=${encodeURIComponent(profile.username)}&address=${encodeURIComponent(address)}`
    const response = await fetch(`${baseUrl}/api/creator/${address}`)
    const data = await response.json()
    const profile = data.profile

    if (!profile) {
      return {
        title: 'Creator Not Found - TipChain',
        description: 'This creator profile does not exist or has not been created yet.',
      }
    }

    return {
      title: `${profile.username} - TipChain Creator`,
      description: profile.bio || `Support ${profile.username} with crypto tips on TipChain`,
      openGraph: {
        title: `Support ${profile.username} on TipChain`,
        description: profile.bio || `Send crypto tips to support ${profile.username}'s work`,
        url: canonicalUrl,
        siteName: 'TipChain',
        images: [
          {
            url: sharePreviewUrl,
            width: 1200,
            height: 630,
            alt: `Support ${profile.username} on TipChain`,
          },
          {
            url: `${sharePreviewUrl}?size=mobile`,
            width: 600,
            height: 315,
            alt: `Support ${profile.username} on TipChain`,
          },
        ],
        locale: 'en_US',
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Support ${profile.username} on TipChain`,
        description: profile.bio || `Send crypto tips to support ${profile.username}'s work`,
        images: [sharePreviewUrl],
        creator: '@TipChain',
      },
      alternates: {
        canonical: canonicalUrl,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Creator Profile - TipChain',
      description: 'Support creators with crypto tips on TipChain',
    }
  }
}