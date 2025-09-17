'use client'

import { TipChainLogo } from './TipChainLogo'

interface ClientTipChainLogoProps {
  size?: number
  showText?: boolean
  showSubtext?: boolean
  className?: string
}

export function ClientTipChainLogo(props: ClientTipChainLogoProps) {
  return <TipChainLogo {...props} />
}