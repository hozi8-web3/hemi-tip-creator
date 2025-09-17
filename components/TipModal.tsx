'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { parseWalletError } from '@/lib/error-utils'
import { X, Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface TipModalProps {
  isOpen: boolean
  creatorAddress: string
  creatorUsername: string
  onClose: () => void
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6B83C21A6203186c47EfDD0dD66edFa6967Ff69e'

const CONTRACT_ABI = [
  {
    name: 'tipETH',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_creator', type: 'address' },
      { name: '_message', type: 'string' }
    ],
    outputs: []
  }
]

export function TipModal({ isOpen, creatorAddress, creatorUsername, onClose }: TipModalProps) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<'input' | 'confirming' | 'success' | 'error'>('input')
  const [txHash, setTxHash] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { address } = useAccount()

  const { write: tipETH, isLoading: isWriteLoading } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'tipETH',
    onSuccess: (data) => {
      setTxHash(data.hash)
      setStep('confirming')
    },
    onError: (error) => {
      console.error('Tip error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  })

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransaction({
    hash: txHash as `0x${string}`,
    onSuccess: () => {
      setStep('success')
    },
    onError: (error) => {
      console.error('Transaction confirmation error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  })

  const handleTip = async () => {
    if (!amount || parseFloat(amount) <= 0) return

    try {
      const value = parseEther(amount)
      tipETH({
        args: [creatorAddress as `0x${string}`, message],
        value
      })
    } catch (error) {
      console.error('Error sending tip:', error)
      setStep('error')
    }
  }

  const handleClose = () => {
    if (step === 'success') {
      // Refresh the page to show updated stats
      window.location.reload()
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
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
                {step === 'input' && `Tip ${creatorUsername}`}
                {step === 'confirming' && 'Confirming Transaction'}
                {step === 'success' && 'Tip Sent Successfully!'}
                {step === 'error' && 'Transaction Failed'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {step === 'input' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount (ETH)
                    </label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                    <div className="flex space-x-2 mt-2">
                      {['0.01', '0.1', '0.5', '1.0'].map((preset) => (
                        <Button
                          key={preset}
                          variant="outline"
                          size="sm"
                          onClick={() => setAmount(preset)}
                          className="border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white"
                        >
                          {preset} ETH
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message (Optional)
                    </label>
                    <Input
                      placeholder="Great work! Keep it up 🚀"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {message.length}/100 characters
                    </p>
                  </div>

                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Recipient:</span>
                      <span className="text-white">{creatorUsername}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-primary-400 font-bold">
                        {amount || '0'} ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-white">Hemi Network</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleTip}
                    disabled={!amount || parseFloat(amount) <= 0 || isWriteLoading}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 text-lg"
                  >
                    {isWriteLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Preparing Transaction...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Send Tip
                      </>
                    )}
                  </Button>
                </>
              )}

              {step === 'confirming' && (
                <div className="text-center py-8">
                  <Loader2 className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Transaction Confirming
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Please wait while your tip is being processed on the blockchain.
                  </p>
                  {txHash && (
                    <a
                      href={`https://explorer.hemi.xyz/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 text-sm"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Tip Sent Successfully!
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Your tip of {amount} ETH has been sent to {creatorUsername}.
                  </p>
                  {txHash && (
                    <a
                      href={`https://explorer.hemi.xyz/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 text-sm"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              )}

              {step === 'error' && (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Transaction Failed
                  </h3>
                  <p className="text-gray-400 mb-4">
                    There was an error processing your tip. Please try again.
                  </p>
                  <Button
                    onClick={() => setStep('input')}
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}