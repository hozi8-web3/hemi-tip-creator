import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username') || 'Creator'
  const address = searchParams.get('address') || '0x0000...0000'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #111827, #1f2937)',
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(to right, #7C3AED, #6D28D9)',
              padding: '8px 16px',
              borderRadius: '8px',
              color: 'white',
              fontSize: 32,
              fontWeight: 'bold',
            }}
          >
            TipChain
          </div>
        </div>

        {/* Creator Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, white, #9CA3AF)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {username}
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#9CA3AF',
              fontFamily: 'monospace',
            }}
          >
            {address}
          </div>
        </div>

        {/* Call to Action */}
        <div
          style={{
            marginTop: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #7C3AED, #6D28D9)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Tip this creator
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#9CA3AF',
            }}
          >
            Support with crypto tips on TipChain
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}