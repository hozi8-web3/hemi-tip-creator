// User-friendly error messages for common blockchain errors

export function parseWalletError(error: any): string {
  const errorMessage = error?.message || error?.toString() || 'Unknown error'
  const errorCode = error?.code || error?.reason

  // User rejected transaction
  if (
    errorMessage.includes('User rejected') ||
    errorMessage.includes('user rejected') ||
    errorMessage.includes('User denied') ||
    errorMessage.includes('rejected') ||
    errorCode === 4001 ||
    errorCode === 'ACTION_REJECTED'
  ) {
    return 'Transaction was cancelled. Please try again and confirm the transaction in your wallet.'
  }

  // Insufficient funds / gas
  if (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance') ||
    errorMessage.includes('not enough') ||
    errorMessage.includes('exceeds balance') ||
    errorCode === 'INSUFFICIENT_FUNDS'
  ) {
    return 'Insufficient ETH balance. Please add more ETH to your wallet to cover gas fees.'
  }

  // Gas estimation failed
  if (
    errorMessage.includes('gas required exceeds') ||
    errorMessage.includes('out of gas') ||
    errorMessage.includes('gas limit') ||
    errorMessage.includes('intrinsic gas too low')
  ) {
    return 'Transaction failed due to gas issues. Try increasing the gas limit or check your transaction parameters.'
  }

  // Network issues
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('fetch')
  ) {
    return 'Network connection issue. Please check your internet connection and try again.'
  }

  // Contract execution reverted
  if (
    errorMessage.includes('execution reverted') ||
    errorMessage.includes('revert') ||
    errorMessage.includes('VM Exception')
  ) {
    // Try to extract revert reason
    const revertMatch = errorMessage.match(/revert (.+?)(?:\n|$|,)/)
    if (revertMatch) {
      const reason = revertMatch[1].replace(/['"]/g, '')
      return `Transaction failed: ${reason}`
    }
    return 'Transaction was rejected by the smart contract. Please check your input and try again.'
  }

  // Nonce issues
  if (
    errorMessage.includes('nonce') ||
    errorMessage.includes('replacement transaction')
  ) {
    return 'Transaction nonce issue. Please reset your wallet or wait for pending transactions to complete.'
  }

  // Wallet not connected
  if (
    errorMessage.includes('wallet') ||
    errorMessage.includes('provider') ||
    errorMessage.includes('not connected')
  ) {
    return 'Wallet not connected. Please connect your wallet and try again.'
  }

  // Rate limiting
  if (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests')
  ) {
    return 'Too many requests. Please wait a moment and try again.'
  }

  // Transaction timeout
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out')
  ) {
    return 'Transaction timed out. It may still be processing. Check your wallet or try again.'
  }

  // Generic fallback with first part of actual error
  const shortError = errorMessage.split('\n')[0].substring(0, 100)
  return `Transaction failed: ${shortError}`
}

export function parseUploadError(error: any): string {
  const errorMessage = error?.message || error?.toString() || 'Unknown error'

  // File size issues
  if (errorMessage.includes('too large') || errorMessage.includes('size')) {
    return 'File is too large. Please choose an image under 5MB.'
  }

  // File type issues
  if (errorMessage.includes('file type') || errorMessage.includes('format')) {
    return 'Invalid file type. Please choose a JPG, PNG, GIF, or WebP image.'
  }

  // Network/upload issues
  if (errorMessage.includes('network') || errorMessage.includes('upload')) {
    return 'Upload failed due to network issues. Please check your connection and try again.'
  }

  // IPFS/Pinata issues
  if (errorMessage.includes('IPFS') || errorMessage.includes('Pinata')) {
    return 'Image storage service is temporarily unavailable. Please try again later.'
  }

  // Signature issues
  if (errorMessage.includes('signature') || errorMessage.includes('sign')) {
    return 'Please sign the message in your wallet to verify ownership before uploading.'
  }

  return `Upload failed: ${errorMessage}`
}