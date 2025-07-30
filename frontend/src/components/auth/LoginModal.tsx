'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Modal } from '../ui/modal'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function LoginModal({
  isOpen,
  onClose,
  title = 'Welcome to Forkast',
}: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const {
    connectMetaMask,
    connectCoinbase,
    connectPhantom,
    loginWithMagicEmail,
  } = useAuth()

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
  }

  const handleEmailContinue = async () => {
    if (email.trim()) {
      setIsEmailLoading(true)
      try {
        await loginWithMagicEmail(email.trim())
        onClose()
      }
      catch (error) {
        console.error('Error with email login:', error)
        // TODO: Show error message to user
      }
      finally {
        setIsEmailLoading(false)
      }
    }
  }

  const handleWalletConnect = async (walletType: string) => {
    try {
      switch (walletType) {
        case 'metamask':
          await connectMetaMask()
          onClose()
          break
        case 'coinbase':
          await connectCoinbase()
          break
        case 'walletconnect':
          // WalletConnect disabled for now
          break
        case 'phantom':
          await connectPhantom()
          break
        default:
          console.error('Unknown wallet type:', walletType)
      }
    }
    catch (error) {
      console.error(`Error connecting to ${walletType}:`, error)
      // TODO: Show error message to user
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Email Input */}
        <div className="flex">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isEmailLoading}
            className="flex-1 px-3 py-3 border border-gray-300 border-r-0 rounded-l-lg focus:outline-none focus:ring-0 focus:border-blue-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleEmailContinue}
            disabled={!email.trim() || isEmailLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-r-lg transition-colors duration-200"
          >
            {isEmailLoading ? 'Sending...' : 'Continue'}
          </button>
        </div>

        {/* Wallet Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => handleWalletConnect('metamask')}
            className="flex items-center justify-center flex-1 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 mx-1 first:ml-0 last:mr-0"
            title="MetaMask"
          >
            <Image
              src="/icons/metamask.svg"
              alt="MetaMask"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>

          <button
            onClick={() => handleWalletConnect('coinbase')}
            className="flex items-center justify-center flex-1 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 mx-1 first:ml-0 last:mr-0"
            title="Coinbase Wallet"
          >
            <Image
              src="/icons/coinbase.svg"
              alt="Coinbase Wallet"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>

          <button
            onClick={() => handleWalletConnect('phantom')}
            className="flex items-center justify-center flex-1 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 mx-1 first:ml-0 last:mr-0"
            title="Phantom"
          >
            <Image
              src="/icons/phantom.svg"
              alt="Phantom"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>

          <button
            onClick={() => handleWalletConnect('walletconnect')}
            className="flex items-center justify-center flex-1 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 mx-1 first:ml-0 last:mr-0"
            title="WalletConnect"
          >
            <Image
              src="/icons/walletconnect.svg"
              alt="WalletConnect"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>

        {/* Footer Links */}
        <div className="pt-4">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <a
              href="/terms"
              className="hover:text-gray-700 transition-colors duration-200"
            >
              Terms
            </a>
            <span>•</span>
            <a
              href="/privacy"
              className="hover:text-gray-700 transition-colors duration-200"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </Modal>
  )
}
