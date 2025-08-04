'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

interface LoginFormProps {
  email: string
  setEmail: (email: string) => void
  isEmailLoading: boolean
  handleGoogleLogin: () => void
  handleEmailContinue: () => void
  handleWalletConnect: (walletType: string) => void
}

export function LoginModal({
  isOpen,
  onClose,
}: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const {
    connectMetaMask,
    connectCoinbase,
    connectPhantom,
    loginWithMagicEmail,
  } = useAuth()

  function handleGoogleLogin() {
    // TODO: Implement Google OAuth
  }

  async function handleEmailContinue() {
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

  async function handleWalletConnect(walletType: string) {
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

  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              Welcome to Forkast!
            </DialogTitle>
          </DialogHeader>

          <LoginForm
            email={email}
            setEmail={setEmail}
            isEmailLoading={isEmailLoading}
            handleGoogleLogin={handleGoogleLogin}
            handleEmailContinue={handleEmailContinue}
            handleWalletConnect={handleWalletConnect}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">
            Welcome to Forkast!
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4">
          <LoginForm
            email={email}
            setEmail={setEmail}
            isEmailLoading={isEmailLoading}
            handleGoogleLogin={handleGoogleLogin}
            handleEmailContinue={handleEmailContinue}
            handleWalletConnect={handleWalletConnect}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function LoginForm({
  email,
  setEmail,
  isEmailLoading,
  handleGoogleLogin,
  handleEmailContinue,
  handleWalletConnect,
}: LoginFormProps) {
  return (
    <div className="grid gap-6">
      {/* Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        type="button"
        className={`
          flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white
          transition-colors duration-200
          hover:bg-blue-700
        `}
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
          <span className="bg-white px-2 text-gray-500">OR</span>
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
          className={`
            flex-1 rounded-l-lg border border-r-0 border-gray-300 p-3 text-gray-900 placeholder-gray-500
            focus:border-blue-500 focus:ring-0 focus:outline-hidden
            disabled:cursor-not-allowed disabled:bg-gray-100
          `}
        />
        <button
          onClick={handleEmailContinue}
          disabled={!email.trim() || isEmailLoading}
          type="button"
          className={`
            rounded-r-lg bg-blue-600 p-3 font-medium text-white transition-colors duration-200
            hover:bg-blue-700
            disabled:cursor-not-allowed disabled:bg-gray-300
          `}
        >
          {isEmailLoading ? 'Sending...' : 'Continue'}
        </button>
      </div>

      {/* Wallet Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => handleWalletConnect('metamask')}
          type="button"
          className={`
            flex h-12 flex-1 items-center justify-center rounded-lg border border-gray-300 transition-colors
            duration-200
            hover:bg-gray-50
          `}
          title="MetaMask"
        >
          <Image
            src="/icons/metamask.svg"
            alt="MetaMask"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </button>

        <button
          onClick={() => handleWalletConnect('coinbase')}
          type="button"
          className={`
            flex h-12 flex-1 items-center justify-center rounded-lg border border-gray-300 transition-colors
            duration-200
            hover:bg-gray-50
          `}
          title="Coinbase Wallet"
        >
          <Image
            src="/icons/coinbase.svg"
            alt="Coinbase Wallet"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </button>

        <button
          onClick={() => handleWalletConnect('phantom')}
          type="button"
          className={`
            flex h-12 flex-1 items-center justify-center rounded-lg border border-gray-300 transition-colors
            duration-200
            hover:bg-gray-50
          `}
          title="Phantom"
        >
          <Image
            src="/icons/phantom.svg"
            alt="Phantom"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </button>

        <button
          onClick={() => handleWalletConnect('walletconnect')}
          type="button"
          className={`
            flex h-12 flex-1 items-center justify-center rounded-lg border border-gray-300 transition-colors
            duration-200
            hover:bg-gray-50
          `}
          title="WalletConnect"
        >
          <Image
            src="/icons/walletconnect.svg"
            alt="WalletConnect"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </button>
      </div>

      {/* Footer Links */}
      <div className="pt-4">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <a
            href="/terms"
            className="transition-colors duration-200 hover:text-gray-700"
          >
            Terms
          </a>
          <span>•</span>
          <a
            href="/privacy"
            className="transition-colors duration-200 hover:text-gray-700"
          >
            Privacy
          </a>
        </div>
      </div>
    </div>
  )
}
