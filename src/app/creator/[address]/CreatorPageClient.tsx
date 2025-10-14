'use client'

import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'

export default function CreatorPageClient() {
  const params = useParams()
  const address = params.address as string
  const { isConnected } = useAccount()
  
  return (
    <div>
      <h1>Creator Profile</h1>
      <p>Address: {address}</p>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
    </div>
  )
}