'use client'

import { useEffect, useState } from 'react'

interface TestModeBannerProps {
  message?: string
  persistKey?: string
}

export default function TestModeBanner({
  message = 'You are in test mode. USDC is on Amoy Network (no real value).',
  persistKey = 'test_mode_banner_closed_session',
}: TestModeBannerProps) {
  const [visible, setVisible] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const closed = sessionStorage.getItem(persistKey)
      setVisible(closed !== '1')
    }
    catch {
      setVisible(true)
    }
  }, [persistKey])

  if (visible !== true) {
    return null
  }

  return (
    <div className={`
      fixed right-4 bottom-4 z-60 max-w-xs rounded-xl border border-orange-200 bg-linear-to-br from-orange-50
      via-orange-50 to-amber-50 text-orange-900 shadow-[0_20px_35px_rgba(249,115,22,0.14)]
    `}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-orange-900">
            <span className="font-semibold text-orange-800">Heads up:</span>
            {' '}
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false)
            try {
              sessionStorage.setItem(persistKey, '1')
            }
            catch {
              //
            }
          }}
          className={`
            ml-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-lg text-orange-700 transition
            hover:bg-orange-100
            focus:outline-none
            focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2
            focus-visible:ring-offset-orange-50
          `}
          aria-label="Dismiss test mode banner"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
