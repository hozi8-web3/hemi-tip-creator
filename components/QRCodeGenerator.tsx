'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Download, Copy, Share2 } from 'lucide-react'

interface QRCodeGeneratorProps {
  address: string
  username: string
  onClose: () => void
}

export function QRCodeGenerator({ address, username, onClose }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    generateQRCode()
  }, [address])

  const generateQRCode = async () => {
    try {
      // Create a tipping URL that could be used by mobile wallets
      const tipUrl = `${window.location.origin}/creator/${address}`
      
      const qrUrl = await QRCode.toDataURL(tipUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.download = `${username}-tip-qr.png`
    link.href = qrCodeUrl
    link.click()
  }

  const copyLink = async () => {
    try {
      const tipUrl = `${window.location.origin}/creator/${address}`
      await navigator.clipboard.writeText(tipUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareLink = async () => {
    const tipUrl = `${window.location.origin}/creator/${address}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tip ${username} on TipChain`,
          text: `Support ${username} with crypto tips on TipChain`,
          url: tipUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to copying link
      copyLink()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="glass-card border-primary-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                QR Code for {username}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt={`QR Code for ${username}`}
                      className="w-64 h-64"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-gray-200 animate-pulse rounded" />
                  )}
                </div>
              </div>

              {/* Creator Info */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {username}
                </h3>
                <p className="text-sm text-gray-400 font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">
                  How to use this QR code:
                </h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Scan with any QR code reader</li>
                  <li>• Opens the creator's tip page</li>
                  <li>• Connect wallet and send tips</li>
                  <li>• Share with others to support this creator</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={downloadQRCode}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Save
                </Button>
                
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                
                <Button
                  onClick={shareLink}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>

              {/* Link Display */}
              <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Direct Link:</p>
                <p className="text-sm text-primary-400 font-mono break-all">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/creator/${address}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}