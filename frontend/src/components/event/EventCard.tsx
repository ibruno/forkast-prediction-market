'use client'

import type { Market } from '@/types'
import confetti from 'canvas-confetti'
import { ChevronsDown, ChevronsUp, DollarSign, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

interface EventCardProps {
  event: Market
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  isFavorited?: boolean
  onToggleFavorite?: (eventId: string) => void
}

export default function EventCard({
  event,
  isOpen = false,
  onToggle,
  isFavorited = false,
  onToggleFavorite,
}: EventCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState<{
    id: string
    type: 'yes' | 'no'
    name: string
  } | null>(null)
  const [tradeAmount, setTradeAmount] = useState('1')

  // Function to format monetary values with 2 decimal places
  const formatValue = (value: number): string => {
    return value.toFixed(2)
  }

  // Function to limit decimal places during typing
  const limitDecimalPlaces = (
    value: string,
    maxDecimals: number = 2,
  ): string => {
    // Remove non-numeric characters except dot
    const cleaned = value.replace(/[^0-9.]/g, '')

    // Allow only one decimal point
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return `${parts[0]}.${parts[1]}`
    }

    // Limit decimal places
    if (parts.length === 2 && parts[1].length > maxDecimals) {
      return `${parts[0]}.${parts[1].substring(0, maxDecimals)}`
    }

    return cleaned
  }

  // Use external state control for opening/closing
  const isInTradingMode = isOpen && selectedOutcome

  const isBinaryMarket
    = event.outcomes.length === 2
      && event.outcomes.some(o => o.isYes !== undefined)
  const yesOutcome = event.outcomes.find(o => o.isYes === true)
  const noOutcome = event.outcomes.find(o => o.isYes === false)

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    }
    else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(0)}k`
    }
    return `$${volume.toFixed(0)}`
  }

  const handleTrade = async (outcomeId: string, type: 'yes' | 'no') => {
    const outcome = event.outcomes.find(o => o.id === outcomeId)
    if (outcome) {
      setSelectedOutcome({
        id: outcomeId,
        type,
        name: outcome.name,
      })
      // Keep current value or set to "1" if empty
      if (!tradeAmount) {
        setTradeAmount('1')
      }
    }
  }

  const handleConfirmTrade = async () => {
    if (!selectedOutcome || !tradeAmount)
      return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      // Calculate shares and price
      const amountNum = Number.parseFloat(tradeAmount)
      const outcome = event.outcomes.find(o => o.id === selectedOutcome.id)
      if (outcome) {
        const probability = outcome.probability
        const price
          = selectedOutcome.type === 'yes'
            ? Math.round(probability)
            : Math.round(100 - probability)
        const shares = ((amountNum / price) * 100).toFixed(2)

        // Show success toast in Polymarket style
        toast.success(
          `Buy $${tradeAmount} on ${
            selectedOutcome.type === 'yes' ? 'Yes' : 'No'
          }`,
          {
            description: (
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="mt-1 text-xs opacity-80">
                  {shares}
                  {' '}
                  shares @
                  {price}
                  ¢
                </div>
              </div>
            ),
          },
        )
      }

      setSelectedOutcome(null)
      setTradeAmount('1')
      // Here would be the actual trade execution
      console.log(
        `Trade executed: $${tradeAmount} on ${selectedOutcome.name} (${selectedOutcome.type})`,
      )
    }, 1000)
  }

  const handleCancelTrade = () => {
    setSelectedOutcome(null)
    setTradeAmount('1')
    onToggle?.(false)
  }

  const calculateWinnings = (amount: string) => {
    if (!amount || !selectedOutcome)
      return '0.00'
    const amountNum = Number.parseFloat(amount)
    const outcome = event.outcomes.find(o => o.id === selectedOutcome.id)
    if (!outcome)
      return '0.00'

    // Calculate potential winnings based on probability
    const probability = outcome.probability / 100
    const odds
      = selectedOutcome.type === 'yes' ? 1 / probability : 1 / (1 - probability)
    const winnings = amountNum * odds
    return winnings.toFixed(2)
  }

  // Confetti effects
  const triggerYesConfetti = (event?: React.MouseEvent) => {
    let origin: { x?: number, y: number } = { y: 0.6 }

    // If an event is passed, calculate the button position
    if (event && event.currentTarget) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight
      origin = { x, y }
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin,
      colors: ['#10b981', '#059669', '#047857', '#065f46'], // Green colors
    })
  }

  const triggerNoConfetti = (event?: React.MouseEvent) => {
    let origin: { x?: number, y: number } = { y: 0.6 }

    // If an event is passed, calculate the button position
    if (event && event.currentTarget) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight
      origin = { x, y }
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin,
      colors: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'], // Red colors
    })
  }

  // Unified category icon render function - removed as avatars now replace category icons

  return (
    <Card
      className={`flex min-h-[160px] cursor-pointer flex-col transition-all duration-150 hover:shadow-md ${
        isInTradingMode ? 'ring-primary/20 ring-2' : ''
      }`}
    >
      <CardContent className="flex h-full flex-col p-3">
        {/* Unified Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-1 items-start gap-2 pr-2">
            {/* Creator Avatar */}
            <div className={`
              flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-muted
              text-muted-foreground
            `}
            >
              <Image
                src={
                  event.creatorAvatar
                  || `https://avatar.vercel.sh/${
                    event.creator || event.title.charAt(0)
                  }.png`
                }
                alt={event.creator || 'Market creator'}
                width={32}
                height={32}
                className="h-full w-full rounded object-cover"
              />
            </div>

            {/* Title */}
            <Link
              href={`/event/${event.slug}`}
              className="flex-1"
              onClick={e => e.stopPropagation()}
            >
              <h3 className={`
                line-clamp-3 text-sm font-semibold leading-tight text-foreground transition-all duration-200
                hover:text-foreground
              `}
              >
                {event.title}
              </h3>
            </Link>
          </div>

          {/* Right side - Probability badge OR Close button */}
          {isInTradingMode
            ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelTrade()
                  }}
                  className={`
                    flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors
                    hover:bg-slate-300
                    dark:bg-slate-600 dark:text-slate-400 dark:hover:bg-slate-500
                  `}
                >
                  ✕
                </button>
              )
            : (
                isBinaryMarket
                && yesOutcome && (
                  <div className="ml-auto flex w-8 flex-col items-center">
                    {/* Text */}
                    <div
                      className="mb-1 text-[11px] font-medium text-slate-900 dark:text-slate-100"
                      title="chance"
                    >
                      {Math.round(yesOutcome.probability)}
                      %
                    </div>
                    {/* Progress bar */}
                    <div
                      className="h-1 w-full cursor-pointer overflow-hidden rounded bg-slate-200 dark:bg-slate-500"
                      title="chance"
                    >
                      <div
                        className={`h-full transition-all duration-300 ${
                          Math.round(yesOutcome.probability) < 40
                            ? 'bg-rose-400'
                            : Math.round(yesOutcome.probability) === 50
                              ? 'bg-slate-400'
                              : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.round(yesOutcome.probability)}%` }}
                      />
                    </div>
                  </div>
                )
              )}
        </div>

        {/* Dynamic Content Area */}
        <div className="flex flex-1 flex-col">
          {isInTradingMode
            ? (
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <DollarSign className={`
                      absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600
                      dark:text-green-400
                    `}
                    />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={tradeAmount}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9.]/g, '')
                        const value = limitDecimalPlaces(rawValue, 2)
                        const numericValue = Number.parseFloat(value)

                        // Limit to 99999 like in EventDetail
                        if (numericValue <= 99999 || value === '') {
                          setTradeAmount(value)
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '')
                        if (value && !Number.isNaN(Number.parseFloat(value))) {
                          setTradeAmount(formatValue(Number.parseFloat(value)))
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Enter'
                          && tradeAmount
                          && Number.parseFloat(tradeAmount) > 0
                        ) {
                          e.preventDefault()
                          handleConfirmTrade()
                        }
                        else if (e.key === 'Escape') {
                          e.preventDefault()
                          handleCancelTrade()
                        }
                      }}
                      className={`
                        w-full rounded border-0 bg-slate-100 py-2 pl-10 pr-3 text-sm text-slate-900 transition-colors
                        [appearance:textfield]
                        placeholder:text-slate-500
                        focus:bg-slate-200 focus:outline-none
                        dark:bg-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-600
                        [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                      `}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  </div>

                  {/* Confirm Trade Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Trigger confetti based on selection
                      if (selectedOutcome.type === 'yes') {
                        triggerYesConfetti(e)
                      }
                      else {
                        triggerNoConfetti(e)
                      }
                      handleConfirmTrade()
                    }}
                    disabled={
                      isLoading || !tradeAmount || Number.parseFloat(tradeAmount) <= 0
                    }
                    className={`w-full rounded px-3 py-1 text-sm font-semibold transition-colors ${
                      selectedOutcome.type === 'yes'
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-300'
                        : 'bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300'
                    } disabled:cursor-not-allowed`}
                  >
                    {isLoading
                      ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className={`
                              h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent
                            `}
                            >
                            </div>
                            <span>Processing...</span>
                          </div>
                        )
                      : (
                          <div className="text-center">
                            <div>
                              Buy
                              {' '}
                              {selectedOutcome.type === 'yes' ? 'Yes' : 'No'}
                            </div>
                            <div className="text-xs opacity-90">
                              to win $
                              {calculateWinnings(tradeAmount)}
                            </div>
                          </div>
                        )}
                  </button>
                </div>
              )
            : (
                <>
                  {/* Body - Show multi-outcome options only for non-binary markets */}
                  {!isBinaryMarket && (
                    <div className="scrollbar-hide mb-4 max-h-16 flex-1 space-y-2 overflow-y-auto">
                      {event.outcomes.map(outcome => (
                        <div
                          key={outcome.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-600 dark:text-slate-400">
                            {outcome.name}
                          </span>
                          <div className="ml-2 flex items-center gap-2">
                            <span className="text-[11px] font-medium text-slate-900 dark:text-slate-100">
                              {Math.round(outcome.probability)}
                              %
                            </span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTrade(outcome.id, 'yes')
                                  onToggle?.(true)
                                }}
                                title={`Yes: ${Math.round(outcome.probability)}%`}
                                className={`
                                  group flex w-[28px] items-center justify-center rounded bg-emerald-400/50 px-2 py-0.5
                                  text-[10px] font-semibold text-white transition-colors
                                  hover:bg-emerald-500
                                `}
                              >
                                <span className="group-hover:hidden">Yes</span>
                                <span className="hidden font-mono group-hover:inline">
                                  {Math.round(outcome.probability)}
                                  %
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTrade(outcome.id, 'no')
                                  onToggle?.(true)
                                }}
                                title={`No: ${
                                  100 - Math.round(outcome.probability)
                                }%`}
                                className={`
                                  group flex w-[28px] items-center justify-center rounded bg-rose-400/50 px-2 py-0.5
                                  text-[10px] font-semibold text-white transition-colors
                                  hover:bg-rose-500
                                `}
                              >
                                <span className="group-hover:hidden">No</span>
                                <span className="hidden font-mono group-hover:inline">
                                  {100 - Math.round(outcome.probability)}
                                  %
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trading Actions - Only for binary markets */}
                  {isBinaryMarket && yesOutcome && noOutcome && (
                    <div className="mb-2 mt-auto grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTrade(yesOutcome.id, 'yes')
                          onToggle?.(true)
                        }}
                        disabled={isLoading}
                        className={`
                          flex w-full items-center justify-center gap-1 rounded bg-emerald-400/50 py-1.5 text-sm
                          font-semibold text-white transition-colors
                          hover:bg-emerald-500
                          disabled:opacity-50
                        `}
                      >
                        Buy Yes
                        {' '}
                        <ChevronsUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTrade(noOutcome.id, 'no')
                          onToggle?.(true)
                        }}
                        disabled={isLoading}
                        className={`
                          flex w-full items-center justify-center gap-1 rounded bg-rose-400/50 py-1.5 text-sm
                          font-semibold text-white transition-colors
                          hover:bg-rose-500
                          disabled:opacity-50
                        `}
                      >
                        Buy No
                        {' '}
                        <ChevronsDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
        </div>

        {/* Unified Footer - Always at bottom */}
        {!isInTradingMode && (
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>
                {formatVolume(event.volume)}
                {' '}
                Vol.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite?.(event.id)
                }}
                className="text-muted-foreground transition-colors hover:text-yellow-500"
              >
                {isFavorited
                  ? (
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                    )
                  : (
                      <Star className="h-3 w-3" />
                    )}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
