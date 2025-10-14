import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export async function GET() {
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
          backgroundColor: '#111827',
          padding: '40px 60px',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px',
        }}>
          <div style={{
            background: 'linear-gradient(to right, #7C3AED, #6D28D9)',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: 48,
            color: 'white',
            fontWeight: 'bold',
          }}>
            TipChain
          </div>
        </div>

        <div style={{
          fontSize: 36,
          color: '#9CA3AF',
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          Onchain Creator Tipping Platform
        </div>

        <div style={{
          fontSize: 24,
          color: 'white',
          textAlign: 'center',
        }}>
          Support creators with direct crypto tips on Hemi Network
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}