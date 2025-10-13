"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'hemi_community_disclaimer_dismissed_v1'

export function CommunityDisclaimer() {
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setDismissed(raw === '1')
    } catch (e) {
      // If localStorage is not available, don't auto-dismiss
      setDismissed(false)
    }
  }, [])

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch (e) {
      // ignore storage errors
    }
    setDismissed(true)
  }

  // While we check localStorage, don't render anything to avoid flicker
  if (dismissed === null) return null
  if (dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
      <div
        role="region"
        aria-label="Community notice"
        className="mx-auto max-w-7xl px-4 py-2 bg-yellow-500/95 text-black text-xs sm:text-sm flex items-center justify-between gap-3 border-t border-yellow-600"
      >
        <div className="flex-1 text-center sm:text-left">
          <span className="font-semibold mr-2">Community Notice:</span>
          <span>This is not an official Hemi service — created by a community member. Use at your own risk.</span>
          <span className="hidden sm:inline">&nbsp;•&nbsp;</span>
          <Link href="https://github.com/hozi8-web3/hemi-tip-creator" className="underline ml-1" target="_blank" rel="noopener noreferrer">
            View source on GitHub
          </Link>
        </div>

        <div className="flex-shrink-0">
          <button
            aria-label="Dismiss community notice"
            onClick={handleDismiss}
            className="inline-flex items-center justify-center rounded-md bg-black/10 hover:bg-black/20 px-3 py-1 text-black text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

