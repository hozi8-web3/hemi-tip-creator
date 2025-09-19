'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useContractWrite, useWaitForTransaction, useContractRead } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { parseWalletError } from '@/lib/error-utils'
import { X, Zap, Loader2, CheckCircle, AlertCircle, Coins } from 'lucide-react'

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
  },
  {
    name: 'tipERC20',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_token', type: 'address' },
      { name: '_amount', type: 'uint256' },
      { name: '_creator', type: 'address' },
      { name: '_message', type: 'string' }
    ],
    outputs: []
  }
]
// ERC20 ABI for token info
const ERC20_ABI = [
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
]

export function TipModal({ isOpen, creatorAddress, creatorUsername, onClose }: TipModalProps) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<'input' | 'confirming' | 'success' | 'error' | 'approving'>('input')
  const [txHash, setTxHash] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isCustomToken, setIsCustomToken] = useState(false)
  const [tokenAddress, setTokenAddress] = useState('')
  const [needsApproval, setNeedsApproval] = useState(false)

  const { address } = useAccount()

  // Token info queries
  const { data: tokenName } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'name',
    enabled: isCustomToken && tokenAddress.length === 42
  })

  const { data: tokenSymbol } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
    enabled: isCustomToken && tokenAddress.length === 42
  })

  const { data: tokenDecimals } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
    enabled: isCustomToken && tokenAddress.length === 42
  })

  const { data: tokenBalance } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    enabled: isCustomToken && tokenAddress.length === 42 && !!address
  })

  const { data: allowance } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
    enabled: isCustomToken && tokenAddress.length === 42 && !!address
  })

  // Cast contract read results to properly typed locals to satisfy TS and keep JSX safe
  const tokenNameStr = tokenName as string | undefined
  const tokenSymbolStr = tokenSymbol as string | undefined
  const tokenDecimalsNum = tokenDecimals ? Number(tokenDecimals as unknown) : undefined
  const tokenBalanceBig = tokenBalance ? BigInt(String(tokenBalance)) : undefined
  const allowanceBig = allowance ? BigInt(String(allowance)) : BigInt(0)

  // Contract writes
  const { write: tipETH, isLoading: isEthTipLoading } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'tipETH',
    onSuccess: (data) => {
      setTxHash(data.hash)
      setStep('confirming')
    },
    onError: (error) => {
      console.error('ETH Tip error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  })

  const { write: tipERC20, isLoading: isTokenTipLoading } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'tipERC20',
    onSuccess: (data) => {
      setTxHash(data.hash)
      setStep('confirming')
    },
    onError: (error) => {
      console.error('Token Tip error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  })

  const { write: approveToken, isLoading: isApproveLoading } = useContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'approve',
    onSuccess: (data) => {
      setTxHash(data.hash)
      setStep('approving')
    },
    onError: (error) => {
      console.error('Approve error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  })

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransaction({
    hash: txHash as `0x${string}`,
    onSuccess: () => {
      if (step === 'approving') {
        setStep('input')
        setNeedsApproval(false)
      } else {
        setStep('success')
      }
    },
    onError: (error) => {
      console.error('Transaction confirmation error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  })

  const handleTip = async (): Promise<void> => {
    if (!amount || parseFloat(amount) <= 0) return

    try {
      if (isCustomToken) {
      if (!tokenAddress || tokenAddress.length !== 42) {
      setErrorMessage('Please enter a valid token contract address');
      setStep('error');
      return;
      }

      const decimalsNumber = tokenDecimalsNum ?? 18
      const value = parseUnits(amount, decimalsNumber)

      // Check if approval is needed
      if (allowanceBig < value) {
        setNeedsApproval(true)
        await approveToken({
          args: [CONTRACT_ADDRESS as `0x${string}`, value]
        })
        return
      }

      await tipERC20({
        args: [
          tokenAddress as `0x${string}`,
          value as unknown as bigint,
          creatorAddress as `0x${string}`,
          message
        ]
      })
  } else {
    const value = parseEther(amount);
    await tipETH({
      args: [creatorAddress as `0x${string}`, message],
      value
    });
  }
} catch (error) {
  console.error('Error sending tip:', error);
  setErrorMessage('Error preparing transaction');
  setStep('error');
}

  }




  const handleClose = () => {
    if (step === 'success') {
      window.location.reload()
    }
    onClose()
  }

  const resetModal = () => {
    setAmount('')
    setMessage('')
    setTokenAddress('')
    setStep('input')
    setErrorMessage('')
    setNeedsApproval(false)
  }

  const formatTokenBalance = () => {
    if (!tokenBalanceBig || tokenDecimalsNum === undefined) return '0'
  const asNumber = Number(tokenBalanceBig as bigint) / Math.pow(10, tokenDecimalsNum as number)
    if (!isFinite(asNumber)) return '0'
    return asNumber.toFixed(4)
  }

  if (!isOpen) return null

  const isLoading = isEthTipLoading || isTokenTipLoading || isApproveLoading

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md mx-auto"
        >
          <Card className="glass-card border-primary-500/20 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-4 sm:pb-6">
              <CardTitle className="text-white text-lg sm:text-xl pr-2">
                {step === 'input' && (
                  <span className="truncate">Tip {creatorUsername}</span>
                )}
                {step === 'approving' && 'Approving Token'}
                {step === 'confirming' && 'Confirming Transaction'}
                {step === 'success' && 'Tip Sent Successfully!'}
                {step === 'error' && 'Transaction Failed'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-gray-400 hover:text-white flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 pt-0">
              {step === 'input' && (
                <>
                  {/* Currency Toggle */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-start sm:items-center space-x-3">
                      <Coins className="w-4 h-4 text-primary-400 mt-1 sm:mt-0" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <button
                            type="button"
                            onClick={() => { setIsCustomToken(false); setTokenAddress('') }}
                            className={`px-2 py-0.5 rounded text-xs sm:text-sm font-medium transition ${!isCustomToken ? 'bg-primary-500 text-black' : 'text-gray-400 hover:text-white'}`}
                            aria-pressed={!isCustomToken}
                          >
                            ETH
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsCustomToken(true) }}
                            className={`px-2 py-0.5 rounded text-xs sm:text-sm font-medium transition ${isCustomToken ? 'bg-primary-500 text-black' : 'text-gray-400 hover:text-white'}`}
                            aria-pressed={isCustomToken}
                          >
                            CUSTOM
                          </button>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {isCustomToken ? 'Custom Token' : 'Native ETH'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      {/* Hide physical switch on mobile; use the clickable badges above for small screens */}
                      <div className="hidden sm:block">
                        <Switch
                          checked={isCustomToken}
                          onCheckedChange={(checked) => {
                            setIsCustomToken(checked)
                            setAmount('')
                            setTokenAddress('')
                          }}
                          className="data-[state=checked]:bg-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Token Address Input */}
                  <AnimatePresence initial={false}>
                    {isCustomToken && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-3">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Token Contract Address
                          </label>
                          <Input
                            placeholder="0x..."
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white text-sm font-mono w-full"
                          />
                          {tokenNameStr && tokenSymbolStr && (
                            <p className="text-xs text-green-400 mt-1">
                              Found: {tokenNameStr} ({tokenSymbolStr})
                              {tokenBalanceBig && ` • Balance: ${formatTokenBalance()}`}
                            </p>
                          )}
                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <p className="text-[11px] text-gray-400">
                              TIP with HEMI — contract:
                              {' '}
                              <a
                                href={`https://explorer.hemi.xyz/address/0x99e3dE3817F6081B2568208337ef83295b7f591D`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:underline break-all"
                              >0x99e3dE3817F6081B2568208337ef83295b7f591D</a>
                            </p>
                            <div className="mt-2 sm:mt-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setIsCustomToken(true)
                                  setTokenAddress('0x99e3dE3817F6081B2568208337ef83295b7f591D')
                                }}
                                className="text-primary-400 hover:bg-primary-500/10"
                              >
                                Use HEMI
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount {isCustomToken && tokenSymbol ? `(${tokenSymbol})` : '(ETH)'}
                    </label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder={isCustomToken ? '100' : '0.1'}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white text-base sm:text-sm"
                    />
                    {!isCustomToken && (
                      <div className="grid grid-cols-2 sm:flex gap-2 mt-3">
                        {['0.01', '0.1', '0.5', '1.0'].map((preset) => (
                          <Button
                            key={preset}
                            variant="outline"
                            size="sm"
                            onClick={() => setAmount(preset)}
                            className="border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white text-xs sm:text-sm py-2"
                          >
                            {preset} ETH
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message (Optional)
                    </label>
                    <Input
                      placeholder="Great work! Keep it up 🚀"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white text-base sm:text-sm"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {message.length}/100 characters
                    </p>
                  </div>

                  <div className="bg-gray-800/30 p-3 sm:p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Recipient:</span>
                        <span className="text-white text-sm font-medium truncate ml-2">
                          {creatorUsername}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Amount:</span>
                        <span className="text-primary-400 font-bold text-sm">
                          {amount || '0'} {isCustomToken && tokenSymbolStr ? tokenSymbolStr : 'ETH'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Currency:</span>
                        <span className="text-white text-sm">
                          {isCustomToken ? (tokenSymbolStr || 'Custom Token') : 'Native ETH'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Network:</span>
                        <span className="text-white text-sm">Hemi Network</span>
                      </div>
                    </div>
                  </div>

                  {needsApproval && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        Token approval required before tipping. This is a one-time transaction.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleTip}
                    disabled={!amount || parseFloat(amount) <= 0 || isLoading || (isCustomToken && tokenAddress.length !== 42)}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 text-base sm:text-lg font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        <span className="text-sm sm:text-base">
                          {needsApproval ? 'Approving...' : 'Preparing Transaction...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="text-sm sm:text-base">
                          {needsApproval ? 'Approve Token' : 'Send Tip'}
                        </span>
                      </>
                    )}
                  </Button>
                </>
              )}

              {step === 'approving' && (
                <div className="text-center py-6 sm:py-8">
                  <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary-500 mx-auto mb-3 sm:mb-4 animate-spin" />
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    Approving Token
                  </h3>
                  <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base px-2">
                    Approving {tokenSymbolStr || 'token'} for tipping. This is required once per token.
                  </p>
                  {txHash && (
                    <a
                      href={`https://explorer.hemi.xyz/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 text-sm break-all px-2"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              )}

              {step === 'confirming' && (
                <div className="text-center py-6 sm:py-8">
                  <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary-500 mx-auto mb-3 sm:mb-4 animate-spin" />
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    Transaction Confirming
                  </h3>
                  <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base px-2">
                    Please wait while your tip is being processed on the blockchain.
                  </p>
                  {txHash && (
                    <a
                      href={`https://explorer.hemi.xyz/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 text-sm break-all px-2"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-6 sm:py-8">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    Tip Sent Successfully!
                  </h3>
                  <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base px-2">
                    Your tip of <span className="text-primary-400 font-semibold">
                      {amount} {isCustomToken && tokenSymbolStr ? tokenSymbolStr : 'ETH'}
                    </span> has been sent to{' '}
                    <span className="text-white font-semibold">{creatorUsername}</span>.
                  </p>
                  {txHash && (
                    <a
                      href={`https://explorer.hemi.xyz/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 text-sm break-all px-2"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              )}

              {step === 'error' && (
                <div className="text-center py-6 sm:py-8">
                  <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    Transaction Failed
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base px-2">
                    There was an error processing your tip. Please try again.
                  </p>
                  {errorMessage && (
                    <p className="text-red-400 text-xs sm:text-sm mb-4 px-2 bg-red-900/20 rounded p-2 mx-2">
                      {errorMessage}
                    </p>
                  )}
                  <Button
                    onClick={() => setStep('input')}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2"
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