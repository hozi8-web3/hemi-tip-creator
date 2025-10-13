"use client"

import React from 'react'

export function CommunityDisclaimer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
      <div className="mx-auto max-w-7xl px-4 py-2 bg-yellow-500/95 text-black text-xs sm:text-sm flex items-center justify-center border-t border-yellow-600">
        <p className="text-center">
          <strong className="mr-2">Community Notice:</strong>
          This is not an official Hemi service — created by a community member. Use at your own risk.
        </p>
      </div>
    </div>
  )
}

