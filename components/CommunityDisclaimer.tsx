"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'hemi_community_disclaimer_dismissed_v1'

export function CommunityDisclaimer() {
  // dismissed: whether the user permanently dismissed the banner (persisted)
  // isVisible: visual state used to animate show/hide
  const [dismissed, setDismissed] = useState<boolean | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const wasDismissed = raw === '1'
      setDismissed(wasDismissed)
      if (!wasDismissed) {
        // show the banner after mount
        // small delay avoids potential layout jank on first paint
        setTimeout(() => setIsVisible(true), 30)
      }
    } catch (e) {
      // If localStorage is not available, show banner (best effort)
      setDismissed(false)
      setTimeout(() => setIsVisible(true), 30)
    }
  }, [])

  const handleDismiss = () => {
    // animate out first
    setIsVisible(false)

    // after animation finishes, persist dismissal and hide
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, '1')
      } catch (e) {
        // ignore storage errors
      }
      setDismissed(true)
    }, 320) // match duration of the CSS transition
  }

  // While we check localStorage, avoid rendering to prevent flicker
  if (dismissed === null) return null
  // If dismissed persisted, don't render at all
  if (dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
      <div
        role="region"
        aria-label="Community notice"
        aria-live="polite"
        className={`mx-auto max-w-7xl px-4 py-2 bg-yellow-500/95 text-black text-xs sm:text-sm flex items-center justify-between gap-3 border-t border-yellow-600 transform transition-all duration-300 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
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
            className="inline-flex items-center justify-center rounded-md bg-black/10 hover:bg-black/20 px-3 py-1 text-black text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/30"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

