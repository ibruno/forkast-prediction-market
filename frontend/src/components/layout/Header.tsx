'use client'

import { Bell, ChevronDown, Monitor, Moon, Search, Sun } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { mockUser } from '@/lib/mockData'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, disconnect, isInitialized } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get site configuration from environment variables
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME
  const logoSvg = process.env.NEXT_PUBLIC_SITE_LOGO_SVG

  // Basic SVG sanitization to remove potential script tags and event handlers
  const sanitizeSvg = (svg: string) => {
    return svg
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
  }

  const sanitizedLogoSvg = logoSvg ? sanitizeSvg(logoSvg) : ''

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current
        && !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showUserMenu])

  return (
    <header className="bg-background sticky top-0 z-50 pt-2">
      <div className="container flex items-center h-14">
        {/* Logo */}
        <button
          onClick={() => (window.location.href = '/')}
          className="flex items-center gap-2 font-semibold text-foreground flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <div
            className="h-6 w-6 text-primary"
            dangerouslySetInnerHTML={{ __html: sanitizedLogoSvg! }}
          />
          <span className="text-xl font-bold">{siteName!}</span>
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 mx-2 sm:mx-4 sm:mr-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Search markets"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-3/4 pl-9 text-sm"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
          {/* Portfolio & Cash - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-6 text-xs">
            <a
              href="#"
              className="text-center hover:bg-black/5 dark:hover:bg-white/5 border-radius-lg p-2 rounded-lg transition-colors"
            >
              <div className="text-muted-foreground font-medium">Portfolio</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                $
                {mockUser.portfolio.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </div>
            </a>
            <a
              href="#"
              className="text-center hover:bg-black/5 dark:hover:bg-white/5 border-radius-lg p-2 rounded-lg transition-colors"
            >
              <div className="text-muted-foreground font-medium">Cash</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                $
                {mockUser.cash.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </div>
            </a>
          </div>
          {/* Deposit/Connect Button - Hidden on small mobile */}
          {!isInitialized
            ? (
                <Button size="sm" className="hidden sm:inline-flex" disabled>
                  Loading...
                </Button>
              )
            : user
              ? (
                  <Button
                    size="sm"
                    className="hidden sm:inline-flex"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Deposit
                  </Button>
                )
              : (
                  <Button
                    size="sm"
                    className="hidden sm:inline-flex"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Connect
                  </Button>
                )}
          {/* Notifications */}
          <button className="p-1 text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </button>
          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 p-1 text-muted-foreground hover:text-foreground"
            >
              <Image
                src="https://avatar.vercel.sh/user.png"
                alt="User avatar"
                width={24}
                height={24}
                className="rounded-full"
              />
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-background shadow-lg rounded-lg border py-2 z-50">
                {user ? (
                  // Logged in menu
                  <>
                    <div className="px-3 py-2 border-b">
                      <p className="text-xs text-muted-foreground">
                        Connected as
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {`${user.address.slice(0, 6)}...${user.address.slice(
                          -4,
                        )}`}
                      </p>
                    </div>

                    <div className="space-y-1 p-1">
                      <MenuLink label="Profile" />
                      <MenuLink label="Settings" />
                      <MenuLink label="Watchlist" />
                      <MenuLink label="Rewards" />

                      <div className="border-t my-1"></div>

                      <MenuLink label="Documentation" />
                      <MenuLink label="Terms of Use" />

                      <div className="border-t my-1"></div>

                      {/* Theme Selector */}
                      <div className="flex items-center justify-between px-3 py-1.5">
                        <div className="text-xs text-foreground">Theme</div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setTheme('light')
                            }}
                            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                              theme === 'light'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                            }`}
                            title="Light mode"
                          >
                            <Sun className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setTheme('system')
                            }}
                            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                              theme === 'system'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                            }`}
                            title="System mode"
                          >
                            <Monitor className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setTheme('dark')
                            }}
                            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                            }`}
                            title="Dark mode"
                          >
                            <Moon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={disconnect}
                        className="w-full flex justify-between items-center px-3 py-1.5 text-xs text-foreground hover:bg-accent cursor-pointer rounded text-left"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  // Logged out menu
                  <div className="space-y-1 p-1">
                    <button
                      onClick={() => {
                        setShowLoginModal(true)
                        setShowUserMenu(false)
                      }}
                      className="w-full flex justify-between items-center px-3 py-1.5 text-xs text-foreground hover:bg-accent cursor-pointer rounded text-left"
                    >
                      Sign Up
                    </button>

                    <button
                      onClick={() => {
                        setShowLoginModal(true)
                        setShowUserMenu(false)
                      }}
                      className="w-full flex justify-between items-center px-3 py-1.5 text-xs text-foreground hover:bg-accent cursor-pointer rounded text-left"
                    >
                      Log In
                    </button>

                    <div className="border-t my-1"></div>
                    <MenuLink label="Rewards" />
                    <MenuLink label="Documentation" />
                    <MenuLink label="Terms of Use" />

                    <div className="border-t my-1"></div>

                    {/* Theme Selector */}
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <div className="text-xs text-foreground">Theme</div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setTheme('light')
                          }}
                          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                            theme === 'light'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                          }`}
                          title="Light mode"
                        >
                          <Sun className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setTheme('system')
                          }}
                          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                            theme === 'system'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                          }`}
                          title="System mode"
                        >
                          <Monitor className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setTheme('dark')
                          }}
                          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                          }`}
                          title="Dark mode"
                        >
                          <Moon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  )
}

function MenuLink({ label }: { label: string }) {
  return (
    <button className="w-full flex justify-between items-center px-3 py-1.5 text-xs text-foreground hover:bg-accent cursor-pointer rounded text-left">
      {label}
    </button>
  )
}
