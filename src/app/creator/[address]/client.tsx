'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Meteors } from '@/components/ui/meteors'
import { TipModal } from '@/components/TipModal'
import { QRCodeGenerator } from '@/components/QRCodeGenerator'
import { formatEther, formatAddress, timeAgo } from '@/lib/utils'
import { formatUnits } from 'viem'
import { SafeAppHeader } from '@/components/SafeAppHeader'
import { SkeletonCard } from '@/components/PageLoader'
import {
  Zap,
  Copy,
  ExternalLink,
  Twitter,
  Youtube,
  Globe,
  QrCode,
  Calendar,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface CreatorProfile {
  address: string
  username: string
  bio: string
  avatarURI: string
  totalTipsReceived: string
  tipCount: string
  perTokenTotals?: Record<string, { total: string; symbol?: string | null; decimals?: number | null }>
}

interface Tip {
  id: string
  from: string
  amount: string
  token: string | null
  tokenSymbol?: string | null
  tokenDecimals?: number | null
  timestamp: string
  message: string
}

export function CreatorPageClient() {
  // Rest of your existing component code...
  // Copy everything from the existing page.tsx except the imports
}