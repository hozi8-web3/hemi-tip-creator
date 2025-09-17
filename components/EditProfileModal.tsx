'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useContractWrite, useWaitForTransaction, useAccount, useSignMessage } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { parseWalletError, parseUploadError } from '@/lib/error-utils'
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  X,
  Plus,
  Trash2
} from 'lucide-react'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfile?: {
    username: string
    bio: string
    avatarURI: string
    socials: string[]
  }
  isCreating?: boolean
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6B83C21A6203186c47EfDD0dD66edFa6967Ff69e'

const CONTRACT_ABI = [
  {
    name: 'createProfile',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_username', type: 'string' },
      { name: '_bio', type: 'string' },
      { name: '_avatarURI', type: 'string' },
      { name: '_socials', type: 'string[]' }
    ],
    outputs: []
  },
  {
    name: 'updateProfile',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_username', type: 'string' },
      { name: '_bio', type: 'string' },
      { name: '_avatarURI', type: 'string' },
      { name: '_socials', type: 'string[]' }
    ],
    outputs: []
  }
]

export function EditProfileModal({ 
  isOpen, 
  onClose, 
  currentProfile, 
  isCreating = false 
}: EditProfileModalProps) {
  const [step, setStep] = useState<'editing' | 'uploading' | 'confirming' | 'success' | 'error'>('editing')
  const [txHash, setTxHash] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  
  // Form state
  const [username, setUsername] = useState(currentProfile?.username || '')
  const [bio, setBio] = useState(currentProfile?.bio || '')
  const [avatarURI, setAvatarURI] = useState(currentProfile?.avatarURI || '')
  const [socials, setSocials] = useState<string[]>(currentProfile?.socials || [])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  const { write: createProfile, isLoading: isCreatingProfile } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'createProfile',
    onSuccess: (data) => {
      setTxHash(data.hash)
      setStep('confirming')
    },
    onError: (error) => {
      console.error('Create profile error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  })

  const { write: updateProfile, isLoading: isUpdatingProfile } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'updateProfile',
    onSuccess: (data) => {
      setTxHash(data.hash)
      setStep('confirming')
    },
    onError: (error) => {
      console.error('Update profile error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  })

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransaction({
    hash: txHash as `0x${string}`,
    onSuccess: async () => {
      setStep('success')
      // Trigger indexer update with correct user address
      try {
        await fetch('/api/indexer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: isCreating ? 'ProfileCreated' : 'ProfileUpdated',
            data: { 
              creator: address,
              txHash: txHash
            }
          })
        })
        console.log('✅ Profile indexed successfully')
      } catch (error) {
        console.error('❌ Indexing failed:', error)
        // Don't fail the UI, just log the error
      }
    },
    onError: (error) => {
      console.error('Transaction confirmation error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  })

  const uploadAvatar = async (): Promise<string> => {
    if (!avatarFile || !address) return avatarURI

    try {
      // Create message to sign
      const message = JSON.stringify({
        action: 'upload_avatar',
        address: address,
        timestamp: Date.now(),
        filename: avatarFile.name
      })

      // Sign message with wallet
      const signature = await signMessageAsync({ message })

      const formData = new FormData()
      formData.append('file', avatarFile)
      formData.append('address', address)
      formData.append('signature', signature)
      formData.append('message', message)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      // Debug: log response details
      console.log('Upload response status:', response.status)
      console.log('Upload response headers:', response.headers.get('content-type'))

      const responseText = await response.text()
      console.log('Upload response text:', responseText.substring(0, 200))

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`)
      }
      
      if (!response.ok) {
        throw new Error(result.error || `Upload failed with status ${response.status}`)
      }

      if (!result.success && !result.url) {
        throw new Error('Upload failed - no URL returned')
      }

      return result.url
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error(parseUploadError(error))
    }
  }

  const handleSave = async () => {
    if (!username.trim()) {
      setErrorMessage('Username is required')
      setStep('error')
      return
    }

    try {
      setStep('uploading')
      
      // Upload avatar if new file selected
      let finalAvatarURI = avatarURI
      if (avatarFile) {
        finalAvatarURI = await uploadAvatar()
      }

      // Prepare contract call
      const profileData = {
        args: [username.trim(), bio.trim(), finalAvatarURI, socials.filter(s => s.trim())]
      }

      if (isCreating) {
        createProfile(profileData)
      } else {
        updateProfile(profileData)
      }
    } catch (error) {
      console.error('Save error:', error)
      setErrorMessage(parseWalletError(error))
      setStep('error')
    }
  }

  const addSocial = () => {
    if (socials.length < 10) {
      setSocials([...socials, ''])
    }
  }

  const removeSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index))
  }

  const updateSocial = (index: number, value: string) => {
    const newSocials = [...socials]
    newSocials[index] = value
    setSocials(newSocials)
  }

  const handleClose = () => {
    if (step === 'success') {
      window.location.reload() // Refresh to show updated profile
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-primary-500/20 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === 'editing' && (isCreating ? 'Create Profile' : 'Edit Profile')}
            {step === 'uploading' && 'Uploading Avatar...'}
            {step === 'confirming' && 'Confirming Transaction'}
            {step === 'success' && 'Profile Updated!'}
            {step === 'error' && 'Error'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === 'editing' && 'Update your onchain creator profile'}
            {step === 'uploading' && 'Please wait while we upload your avatar to IPFS'}
            {step === 'confirming' && 'Please wait while your transaction is confirmed'}
            {step === 'success' && 'Your profile has been successfully updated onchain'}
            {step === 'error' && 'There was an error updating your profile'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'editing' && (
            <>
              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label className="text-gray-300">Avatar</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage 
                      src={avatarPreview || avatarURI} 
                      alt="Avatar preview" 
                    />
                    <AvatarFallback className="text-2xl">
                      {username[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div
                    {...getRootProps()}
                    className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      isDragActive 
                        ? 'border-primary-500 bg-primary-500/10' 
                        : 'border-gray-600 hover:border-primary-500'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {isDragActive 
                        ? 'Drop the image here...' 
                        : 'Drag & drop an image, or click to select'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Username *
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your creator name"
                  className="bg-gray-800/50 border-gray-700 text-white"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500">
                  {username.length}/50 characters
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  {bio.length}/500 characters
                </p>
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Social Links</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocial}
                    disabled={socials.length >= 10}
                    className="border-gray-600 text-gray-300 hover:bg-primary-500 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {socials.map((social, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={social}
                        onChange={(e) => updateSocial(index, e.target.value)}
                        placeholder="twitter:@username or https://..."
                        className="bg-gray-800/50 border-gray-700 text-white"
                        maxLength={100}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSocial(index)}
                        className="border-gray-600 text-gray-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {socials.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Add your social media links (optional)
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={!username.trim() || isCreatingProfile || isUpdatingProfile}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                >
                  {isCreatingProfile || isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isCreating ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      {isCreating ? 'Create Profile' : 'Update Profile'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {step === 'uploading' && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Uploading to IPFS
              </h3>
              <p className="text-gray-400">
                Please wait while we upload your avatar...
              </p>
            </div>
          )}

          {step === 'confirming' && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Transaction Confirming
              </h3>
              <p className="text-gray-400 mb-4">
                Please wait while your profile update is confirmed onchain.
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
                Profile Updated Successfully!
              </h3>
              <p className="text-gray-400 mb-4">
                Your profile has been updated onchain and will be visible shortly.
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
                Error
              </h3>
              <p className="text-gray-400 mb-4">
                {errorMessage}
              </p>
              <Button
                onClick={() => setStep('editing')}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}