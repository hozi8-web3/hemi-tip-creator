import { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: { address: string } }
): Promise<Metadata> {
  const address = params.address

  // You can fetch creator data here if needed
  // const creator = await fetchCreatorData(address)

  return {
    title: `Creator Profile - ${address}`,
    description: `View and send tips to creator ${address}`,
    openGraph: {
      title: `Creator Profile - ${address}`,
      description: `View and send tips to creator ${address}`,
      images: [{
        url: `/api/og?address=${address}`,
        width: 1200,
        height: 630,
        alt: `Creator profile for ${address}`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Creator Profile - ${address}`,
      description: `View and send tips to creator ${address}`,
      images: [`/api/og?address=${address}`],
    }
  }
}