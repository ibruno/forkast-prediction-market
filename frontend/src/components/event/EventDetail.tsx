'use client'

import type { RelatedEvent } from '@/lib/data'
import type { Market } from '@/types'
import confetti from 'canvas-confetti'
import {
  BanknoteIcon,
  CheckIcon,
  CircleCheckIcon,
  HeartIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  ShareIcon,
  ShieldIcon,
  SparklesIcon,
  StarIcon,
  TrendingDownIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { toast } from 'sonner'
import PredictionChart from '@/components/charts/PredictionChart'
import Header from '@/components/layout/Header'
import NavigationTabs from '@/components/layout/NavigationTabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchRelatedEvents } from '@/lib/data'
import {
  calculateWinnings,
  formatDate,
  formatVolume,
  getSupabaseImageUrl,
  mockMarketDetails,
  mockUser,
} from '@/lib/mockData'
import { formatOracleAddress, formatRules } from '@/lib/utils'

interface EventDetailProps {
  event: Market
}

export default function EventDetail({ event }: EventDetailProps) {
  // Basic SVG sanitization function
  const sanitizeSvg = (svg: string) => {
    return svg
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
  }

  const POLYMARKET_COLORS = ['#2D9CDB', '#FF5952', '#27AE60', '#9B51E0']

  // Component states
  const [activeTimeRange, setActiveTimeRange] = useState('1D')
  const [activeTab, setActiveTab] = useState('buy')
  const [amount, setAmount] = useState('')
  const [selectedOutcomeForOrder, setSelectedOutcomeForOrder] = useState('')
  const [newComment, setNewComment] = useState('')
  const [activeCommentsTab, setActiveCommentsTab] = useState('comments')
  const [rulesExpanded, setRulesExpanded] = useState(false)
  const [activityFilter, setActivityFilter] = useState('All')
  const [yesNoSelection, setYesNoSelection] = useState<'yes' | 'no' | null>(
    null,
  )
  const [isFavorite, setIsFavorite] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [contextExpanded, setContextExpanded] = useState(false)
  const [isGeneratingContext, setIsGeneratingContext] = useState(false)
  const [generatedContext, setGeneratedContext] = useState<string[]>([])
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showWinCard, setShowWinCard] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  // Utility functions
  const getSelectedOutcome = useCallback(
    () => event.outcomes.find(o => o.id === selectedOutcomeForOrder),
    [event.outcomes, selectedOutcomeForOrder],
  )

  const getYesOutcome = useCallback(
    () => event.outcomes.find(o => o.isYes === true),
    [event.outcomes],
  )

  const yesOutcome = getYesOutcome()
  const primaryProbability = yesOutcome
    ? yesOutcome.probability
    : event.outcomes[0]?.probability || 0

  // Calculate prices in cents
  const yesPrice = Math.round(primaryProbability)
  const noPrice = 100 - yesPrice

  // Function to get top 4 outcomes by volume
  const getTopOutcomesForChart = () => {
    return [...event.outcomes]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 4)
  }

  // Function to generate chart data based on actual outcomes
  const generateChartData = () => {
    const topOutcomes = getTopOutcomesForChart()
    const now = new Date()
    const data = []

    const colors = POLYMARKET_COLORS

    // Generate series configuration based on actual outcomes
    const series = topOutcomes.map((outcome, index) => ({
      key: `outcome_${outcome.id}`,
      name: outcome.name,
      color: colors[index] || '#8B5CF6',
    }))

    // Generate simulated historical data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      const dataPoint: { date: Date, [key: string]: number | Date } = { date }

      // For each outcome, generate a trend based on current probability
      topOutcomes.forEach((outcome) => {
        const key = `outcome_${outcome.id}`
        const baseProbability = outcome.probability

        // Add temporal and random variation
        const timeVariation = Math.sin((29 - i) * 0.1) * 5
        const randomVariation = (Math.random() - 0.5) * 8
        const variation = timeVariation + randomVariation

        let value = baseProbability + variation
        value = Math.max(5, Math.min(85, value)) // Limit between 5% and 85%

        dataPoint[key] = value
      })

      // Normalize so the sum is close to 100%
      const total = topOutcomes.reduce(
        (sum, outcome) => sum + (dataPoint[`outcome_${outcome.id}`] as number),
        0,
      )

      if (total > 0) {
        topOutcomes.forEach((outcome) => {
          const key = `outcome_${outcome.id}`
          const currentValue = dataPoint[key] as number
          dataPoint[key] = (currentValue / total) * 100
        })
      }

      data.push(dataPoint)
    }

    return { data, series }
  }

  // Generate dynamic data for the chart
  const chartConfig = generateChartData()

  // Function to format values with 2 decimal places
  const formatValue = (value: number): string => {
    return value.toFixed(2)
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

  // Function to calculate the amount the user will receive when selling shares
  const calculateSellAmount = (sharesToSell: number) => {
    if (!selectedOutcomeForOrder || !yesNoSelection)
      return 0

    // Base sell price based on current probability (slightly lower than buy price)
    const selectedOutcome = getSelectedOutcome()
    if (!selectedOutcome)
      return 0

    const sellPrice
        = yesNoSelection === 'yes'
          ? (selectedOutcome.probability / 100) * 0.95 // 5% spread for sell
          : ((100 - selectedOutcome.probability) / 100) * 0.95

    return sharesToSell * sellPrice
  }

  // Function to get the average selling price
  const getAvgSellPrice = () => {
    if (!selectedOutcomeForOrder || !yesNoSelection)
      return '0'

    const selectedOutcome = getSelectedOutcome()
    if (!selectedOutcome)
      return '0'

    const sellPrice
        = yesNoSelection === 'yes'
          ? Math.round(selectedOutcome.probability * 0.95) // 5% spread for sell
          : Math.round((100 - selectedOutcome.probability) * 0.95)

    return sellPrice.toString()
  }

  // Handle confirm trade with loading
  const handleConfirmTrade = async () => {
    if (!amount || Number.parseFloat(amount) <= 0 || !yesNoSelection)
      return

    setIsLoading(true)
    setShowWinCard(false)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      const amountNum = Number.parseFloat(amount)

      if (activeTab === 'sell') {
        // Sell logic
        const sellValue = calculateSellAmount(amountNum)

        // Show success toast for sell
        toast.success(
          `Sell ${amount} shares on ${yesNoSelection === 'yes' ? 'Yes' : 'No'}`,
          {
            description: (
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="mt-1 text-xs opacity-80">
                  Received $$
                  {formatValue(sellValue)}
                  {' '}
                  @ $
                  {getAvgSellPrice()}
                  ¢
                </div>
              </div>
            ),
          },
        )

        console.log(
          `Sell executed: ${formatValue(
            Number.parseFloat(amount),
          )} shares on ${yesNoSelection} for $${formatValue(sellValue)}`,
        )
      }
      else {
        // Buy logic (original)
        const price = yesNoSelection === 'yes' ? yesPrice : noPrice
        const shares = formatValue((amountNum / price) * 100)

        // Show success toast for buy
        toast.success(
          `Buy $${amount} on ${yesNoSelection === 'yes' ? 'Yes' : 'No'}`,
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

        console.log(
          `Buy executed: $${amount} on ${yesNoSelection} for market ${event.title}`,
        )
      }

      // Reset states
      setAmount('')
      setIsMobileModalOpen(false)
      // Temporary workaround: displays victory card after 1.5s
      setTimeout(() => setShowWinCard(true), 1500)
    }, 1000)
  }

  // Function to generate market context
  const generateMarketContext = async () => {
    setIsGeneratingContext(true)

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate contextual content based on market title and type
    const contextLines = [
      `This market tracks ${event.title.toLowerCase()} with current probability trends indicating ${primaryProbability}% likelihood of the positive outcome.`,
      `Historical data shows similar events have had volatility patterns with key decision points typically occurring near market resolution dates.`,
      `Market sentiment and external factors including recent news developments, expert opinions, and related market movements may influence final outcomes.`,
    ]

    setGeneratedContext(contextLines)
    setContextExpanded(true)
    setIsGeneratingContext(false)
  }

  // Load favorite status from localStorage
  useLayoutEffect(() => {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME!.toLowerCase()
    const stored = localStorage.getItem(`${siteName}-favorites`)
    if (stored) {
      try {
        const favArray = JSON.parse(stored)
        setIsFavorite(favArray.includes(event.id))
      }
      catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
  }, [event.id])

  // Auto-select outcome for all markets (binary and multi-outcome)
  useLayoutEffect(() => {
    if (!selectedOutcomeForOrder && event.outcomes.length > 0) {
      if (event.outcomes.length === 2) {
        // For binary markets, select the "Yes" option (isYes = true)
        const yesOutcome = getYesOutcome()
        if (yesOutcome) {
          setSelectedOutcomeForOrder(yesOutcome.id)
          setYesNoSelection('yes')
        }
        else {
          // If isYes not found, select first option
          setSelectedOutcomeForOrder(event.outcomes[0].id)
          setYesNoSelection('yes')
        }
      }
      else if (event.outcomes.length > 2) {
        // For multi-option markets, select option with highest probability
        const sortedOutcomes = [...event.outcomes].sort(
          (a, b) => b.probability - a.probability,
        )
        const highestProbOutcome = sortedOutcomes[0]
        if (highestProbOutcome) {
          setSelectedOutcomeForOrder(highestProbOutcome.id)
          setYesNoSelection('yes')
        }
      }
    }
  }, [event.outcomes, selectedOutcomeForOrder, getYesOutcome])

  // Block body scroll when mobile modal is open
  useEffect(() => {
    if (isMobileModalOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    }
    else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isMobileModalOpen])

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME!.toLowerCase()
    const stored = localStorage.getItem(`${siteName}-favorites`)
    let favArray: string[] = []

    if (stored) {
      try {
        favArray = JSON.parse(stored)
      }
      catch (error) {
        console.error('Error parsing favorites:', error)
      }
    }

    if (isFavorite) {
      // Remove from favorites
      favArray = favArray.filter(id => id !== event.id)
    }
    else {
      // Add to favorites
      favArray.push(event.id)
    }

    localStorage.setItem(`${siteName}-favorites`, JSON.stringify(favArray))
    setIsFavorite(!isFavorite)
  }

  // Handle share
  const handleShare = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    }
    catch (error) {
      console.error('Error copying URL:', error)
    }
  }

  // Load related events
  const loadRelatedEvents = useCallback(async () => {
    if (loadingRelated || relatedEvents.length > 0)
      return

    setLoadingRelated(true)
    try {
      const related = await fetchRelatedEvents(event.slug)
      setRelatedEvents(related)
    }
    catch (error) {
      console.error('Error loading related events:', error)
    }
    finally {
      setLoadingRelated(false)
    }
  }, [loadingRelated, relatedEvents.length, event.slug])

  // Load related events when tab is clicked
  useEffect(() => {
    if (activeCommentsTab === 'related') {
      loadRelatedEvents()
    }
  }, [activeCommentsTab, loadRelatedEvents])

  const { timeRanges, commentsTabs, trendingData } = mockMarketDetails

  // Function to limit decimal places while typing
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

  // Function to get user shares for the selected outcome
  const getUserShares = () => {
    if (!selectedOutcomeForOrder)
      return 0
    const shareKey = selectedOutcomeForOrder as keyof typeof mockUser.shares
    return mockUser.shares[shareKey] || 0
  }

  // Function to get shares for Yes outcome
  const getYesShares = (outcomeId: string) => {
    // For outcomes like "1-yes", already in correct format
    if (outcomeId.includes('-yes')) {
      const shareKey = outcomeId as keyof typeof mockUser.shares
      return mockUser.shares[shareKey] || 0
    }
    // For outcomes like "1-no", swap to "1-yes"
    if (outcomeId.includes('-no')) {
      const baseId = outcomeId.replace('-no', '-yes')
      const shareKey = baseId as keyof typeof mockUser.shares
      return mockUser.shares[shareKey] || 0
    }
    // For other formats, assume it's the base ID and add -yes
    const shareKey = `${outcomeId}-yes` as keyof typeof mockUser.shares
    return mockUser.shares[shareKey] || 0
  }

  // Function to get shares for No outcome
  const getNoShares = (outcomeId: string) => {
    // For outcomes like "1-no", already in correct format
    if (outcomeId.includes('-no')) {
      const shareKey = outcomeId as keyof typeof mockUser.shares
      return mockUser.shares[shareKey] || 0
    }
    // For outcomes like "1-yes", swap to "1-no"
    if (outcomeId.includes('-yes')) {
      const baseId = outcomeId.replace('-yes', '-no')
      const shareKey = baseId as keyof typeof mockUser.shares
      return mockUser.shares[shareKey] || 0
    }
    // For other formats, assume it's the base ID and add -no
    const shareKey = `${outcomeId}-no` as keyof typeof mockUser.shares
    return mockUser.shares[shareKey] || 0
  }

  // Function to render Yes/No buttons
  const renderYesNoButton = (
    type: 'yes' | 'no',
    price: number,
    forceTabChange = false,
  ) => {
    const isSelected = yesNoSelection === type
    const baseClasses
      = 'flex-1 h-12 rounded-sm font-bold transition-all duration-200 flex items-center justify-center gap-1'
    const selectedClasses
      = type === 'yes'
        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
        : 'bg-rose-500 hover:bg-rose-600 text-white'
    const defaultClasses
      = 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'

    return (
      <button
        type="button"
        onClick={() => {
          setYesNoSelection(type)
          if (forceTabChange) {
            setActiveTab('buy')
          }
          inputRef?.focus()
        }}
        className={`${baseClasses} ${
          isSelected ? selectedClasses : defaultClasses
        } ${type === 'yes' ? 'text-md' : 'text-sm'}`}
      >
        <span className="opacity-70">{type === 'yes' ? 'Yes' : 'No'}</span>
        <span className="font-bold">
          {price}
          ¢
        </span>
      </button>
    )
  }

  // Function to render action buttons (percentage and value)
  const renderActionButtons = (isMobileVersion: boolean) => {
    const baseButtonClasses
      = 'h-7 px-3 rounded-lg border border-border/50 dark:border-border/20 text-[11px] transition-all duration-200 ease-in-out'

    if (activeTab === 'sell') {
      const userShares = getUserShares()
      const isDisabled = userShares <= 0

      return ['25%', '50%', '75%'].map(percentage => (
        <button
          type="button"
          key={percentage}
          className={`${baseButtonClasses} ${
            isDisabled
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-border hover:bg-white/10 dark:hover:bg-white/5'
          }`}
          disabled={isDisabled}
          onClick={() => {
            if (isDisabled)
              return
            const percentValue = Number.parseInt(percentage.replace('%', '')) / 100
            const newValue = formatValue(userShares * percentValue)
            setAmount(newValue)
            inputRef?.focus()
          }}
        >
          {percentage}
        </button>
      ))
    }
    else {
      const chipValues = isMobileVersion
        ? ['+$1', '+$20', '+$100']
        : ['+$5', '+$25', '+$100']

      return chipValues.map(chip => (
        <button
          type="button"
          key={chip}
          className={`${baseButtonClasses} hover:border-border hover:bg-white/10 dark:hover:bg-white/5`}
          onClick={() => {
            const chipValue = Number.parseInt(chip.substring(2))
            const currentValue = Number.parseFloat(amount) || 0
            const newValue = currentValue + chipValue

            if (newValue <= 999999999) {
              setAmount(formatValue(newValue))
              inputRef?.focus()
            }
          }}
        >
          {chip}
        </button>
      ))
    }
  }

  const renderWinCard = (isMobileVersion = false) => {
    const outcomeName
        = yesNoSelection === 'yes'
          ? getYesOutcome()?.name || 'Yes'
          : getSelectedOutcome()?.name || 'No'
    // shares: user input, valuePerShare: real order value, total: shares * valuePerShare
    const shares = amount && !Number.isNaN(Number(amount)) ? Number(amount) : 1.1
    const valuePerShare
        = amount && !Number.isNaN(Number(amount))
          ? Number.parseFloat((Number.parseFloat(amount) / shares).toFixed(2))
          : 1.0
    const total = shares * valuePerShare

    // Function to trigger blue confetti from the button
    const triggerBlueConfetti = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      if (!event || !event.currentTarget)
        return
      const rect = event.currentTarget.getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x, y },
        colors: ['#2563eb', '#1d4ed8', '#3b82f6', '#60a5fa'],
      })
    }

    const isMultiOutcome = event.outcomes.length > 2
    let outcomeLabel = outcomeName
    if (isMultiOutcome) {
      const selectedOutcome = getSelectedOutcome()
      if (selectedOutcome) {
        outcomeLabel = `${selectedOutcome.name} - ${
          yesNoSelection === 'yes' ? 'Yes' : 'No'
        }`
      }
    }

    return (
      <div
        className={`
          border-border/50 flex flex-col items-center justify-center rounded-lg border p-6
          dark:border-border/20
          ${
      isMobileVersion ? 'w-full' : 'w-full lg:w-[320px]'
      }`}
      >
        <CircleCheckIcon size={56} className="mb-2 text-primary" />
        <div className="mb-1 text-center text-xl font-bold text-primary">
          Outcome:
          {' '}
          {outcomeLabel}
        </div>
        {!claimed && <hr className="my-4 w-full border-border" />}
        {!claimed && (
          <>
            <div className="mb-2 text-center text-lg font-bold text-foreground">
              Your Earnings
            </div>
            <div className="flex w-full flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Position:</span>
                <span className="font-medium text-foreground">
                  {shares}
                  {' '}
                  {outcomeLabel}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Value per Share:</span>
                <span className="font-medium text-foreground">
                  $
                  {valuePerShare.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium text-foreground">
                  $
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`
                hover:bg-primary/90
                mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-white
                transition-colors
              `}
              onClick={async (e) => {
                setClaiming(true)
                triggerBlueConfetti(e)
                await new Promise(res => setTimeout(res, 1800))
                setClaiming(false)
                setClaimed(true)
                // Show success toast for claim
                toast.success('Redeem shares', {
                  description: (
                    <div>
                      <div className="font-medium">{event.title}</div>
                    </div>
                  ),
                })
              }}
              disabled={claiming}
            >
              {claiming
                ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent">
                      </div>
                      <span>Confirming...</span>
                    </div>
                  )
                : (
                    'Claim winnings'
                  )}
            </button>
          </>
        )}
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          By trading, you agree to our Terms of Service
        </p>
      </div>
    )
  }

  // Function to render the order panel content
  const renderOrderPanel = (isMobileVersion = false) => {
    if (showWinCard)
      return renderWinCard(isMobileVersion)
    // Auxiliary CSS classes
    const containerClasses = `${
      isMobileVersion ? 'w-full' : 'w-full lg:w-[320px]'
    } ${
      isMobileVersion
        ? ''
        : 'rounded-lg border border-border/50 dark:border-border/20'
    } p-4`

    return (
      <div className={containerClasses}>
        {/* Display the selected option (only for multi-outcome) */}
        {event.outcomes.length > 2
          && selectedOutcomeForOrder
          && !isMobileVersion && (
          <div className="bg-muted/20 mb-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Image
                src={
                  getSelectedOutcome()?.avatar
                  || `https://avatar.vercel.sh/${getSelectedOutcome()?.name.toLowerCase()}.png`
                }
                alt={getSelectedOutcome()?.name || 'Selected outcome'}
                width={42}
                height={42}
                className="flex-shrink-0 rounded-sm"
              />
              <span className="text-md font-bold">
                {getSelectedOutcome()?.name}
              </span>
            </div>
          </div>
        )}

        {/* Mobile header with title and market info */}
        {isMobileVersion && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold">Buy</span>
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-sm">Market</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Divider for mobile */}
        {isMobileVersion && (
          <hr className="border-border/50 mb-4 dark:border-border/20" />
        )}

        {/* Market info for mobile */}
        {isMobileVersion && (
          <div className="mb-4 flex items-center gap-3">
            <Image
              src={
                // If there's a selected option, use its photo, otherwise use creator's photo
                selectedOutcomeForOrder
                  ? getSelectedOutcome()?.avatar
                  || `https://avatar.vercel.sh/${getSelectedOutcome()?.name.toLowerCase()}.png`
                  : event.creatorAvatar
                    || `https://avatar.vercel.sh/${event.title.charAt(0)}.png`
              }
              alt={
                selectedOutcomeForOrder
                  ? getSelectedOutcome()?.name || 'Selected outcome'
                  : event.creator || 'Market creator'
              }
              width={32}
              height={32}
              className="flex-shrink-0 rounded"
            />
            <div className="flex-1">
              <div className="line-clamp-2 text-sm font-medium">
                {event.title}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {selectedOutcomeForOrder
                    ? getSelectedOutcome()?.name
                    : getYesOutcome()?.name || event.outcomes[0]?.name}
                </span>
                <span>
                  Bal. $$
                  {formatValue(mockUser.cash)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Buy/Sell */}
        <div className="mb-4 flex text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('buy')
              setAmount('') // Reset value when changing tab
              inputRef?.focus()
            }}
            className={`flex-1 pb-2 transition-colors duration-200 ${
              activeTab === 'buy'
                ? 'border-b-2 border-emerald-500 text-foreground'
                : 'border-b-2 border-muted-foreground text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('sell')
              setAmount('') // Reset value when changing tab
              inputRef?.focus()
            }}
            className={`flex-1 pb-2 transition-colors duration-200 ${
              activeTab === 'sell'
                ? 'border-b-2 border-emerald-500 text-foreground'
                : 'border-b-2 border-muted-foreground text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Yes/No buttons */}
        <div className="mb-2 flex gap-2">
          {renderYesNoButton('yes', yesPrice)}
          {renderYesNoButton('no', noPrice)}
        </div>

        {/* Display available shares (only in Sell mode) */}
        {activeTab === 'sell' && selectedOutcomeForOrder && (
          <div className="mb-4 flex gap-2">
            <div className="flex-1 text-center">
              {getYesShares(selectedOutcomeForOrder) > 0
                ? (
                    <span className="text-xs text-muted-foreground">
                      {formatValue(getYesShares(selectedOutcomeForOrder))}
                      {' '}
                      shares
                    </span>
                  )
                : (
                    <span className="text-xs text-muted-foreground opacity-50">
                      No shares
                    </span>
                  )}
            </div>
            <div className="flex-1 text-center">
              {getNoShares(selectedOutcomeForOrder) > 0
                ? (
                    <span className="text-xs text-muted-foreground">
                      {formatValue(getNoShares(selectedOutcomeForOrder))}
                      {' '}
                      shares
                    </span>
                  )
                : (
                    <span className="text-xs text-muted-foreground opacity-50">
                      No shares
                    </span>
                  )}
            </div>
          </div>
        )}

        {/* Message when no outcome is selected in Sell mode */}
        {activeTab === 'sell' && !selectedOutcomeForOrder && (
          <div className="bg-muted/30 border-border/50 mb-4 rounded-lg border p-3">
            <p className="text-center text-sm text-muted-foreground">
              Select an outcome to sell shares
            </p>
          </div>
        )}

        {activeTab !== 'sell' && <div className="mb-4"></div>}

        {/* Amount/Shares */}
        {isMobileVersion
          ? (
              <div className="mb-4">
                <div className="mb-4 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const currentValue = Number.parseFloat(amount) || 0
                      const newValue = Math.max(
                        0,
                        currentValue - (activeTab === 'sell' ? 0.1 : 1),
                      )
                      setAmount(formatValue(newValue))
                    }}
                    className={`
                      hover:bg-muted/80
                      flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl font-bold
                      transition-colors
                    `}
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <input
                      ref={setInputRef}
                      type="text"
                      className={`
                        w-full border-0 bg-transparent text-center text-4xl font-bold text-foreground
                        placeholder-muted-foreground outline-none
                        [appearance:textfield]
                        [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                      `}
                      placeholder={activeTab === 'sell' ? '0' : '$1.00'}
                      value={
                        activeTab === 'sell'
                          ? amount || ''
                          : amount
                            ? `$${amount}`
                            : ''
                      }
                      onChange={(e) => {
                        const rawValue
                      = activeTab === 'sell'
                        ? e.target.value
                        : e.target.value.replace(/[^0-9.]/g, '')

                        const value
                      = activeTab === 'sell'
                        ? limitDecimalPlaces(rawValue, 2)
                        : rawValue

                        const numericValue = Number.parseFloat(value)

                        if (activeTab === 'sell') {
                          // For sell, limit by the amount of shares the user has
                          const userShares = getUserShares()
                          if (numericValue <= userShares || value === '') {
                            setAmount(value)
                          }
                        }
                        else {
                          // For buy, limit as before
                          if (numericValue <= 99999 || value === '') {
                            setAmount(value)
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '')
                        if (value && !Number.isNaN(Number.parseFloat(value))) {
                          setAmount(formatValue(Number.parseFloat(value)))
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentValue = Number.parseFloat(amount) || 0
                      const newValue
                    = currentValue + (activeTab === 'sell' ? 0.1 : 1)

                      if (activeTab === 'sell') {
                        const userShares = getUserShares()
                        if (newValue <= userShares) {
                          setAmount(formatValue(newValue))
                        }
                      }
                      else {
                        if (newValue <= 99999) {
                          setAmount(formatValue(newValue))
                        }
                      }
                    }}
                    className={`
                      hover:bg-muted/80
                      flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl font-bold
                      transition-colors
                    `}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          : (
              <div className="mb-2 flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="text-lg font-medium">
                    {activeTab === 'sell' ? 'Shares' : 'Amount'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activeTab === 'sell'
                      ? ``
                      : `Balance $${formatValue(mockUser.cash)}`}
                  </div>
                </div>
                <div className="relative flex-1">
                  <input
                    ref={setInputRef}
                    type="text"
                    className={`
                      h-14 w-full border-0 bg-transparent text-right text-4xl font-bold text-slate-700
                      placeholder-slate-400 outline-none
                      [appearance:textfield]
                      dark:text-slate-300 dark:placeholder-slate-500
                      [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                    `}
                    placeholder={activeTab === 'sell' ? '0' : '$0.00'}
                    value={
                      activeTab === 'sell'
                        ? amount || ''
                        : amount
                          ? `$${amount}`
                          : ''
                    }
                    onChange={(e) => {
                      const rawValue
                    = activeTab === 'sell'
                      ? e.target.value
                      : e.target.value.replace(/[^0-9.]/g, '')

                      const value
                    = activeTab === 'sell'
                      ? limitDecimalPlaces(rawValue, 2)
                      : rawValue

                      const numericValue = Number.parseFloat(value)

                      if (activeTab === 'sell') {
                        // For sell, limit by the amount of shares the user has
                        const userShares = getUserShares()
                        if (numericValue <= userShares || value === '') {
                          setAmount(value)
                        }
                      }
                      else {
                        // For buy, limit as before
                        if (numericValue <= 99999 || value === '') {
                          setAmount(value)
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      if (value && !Number.isNaN(Number.parseFloat(value))) {
                        setAmount(formatValue(Number.parseFloat(value)))
                      }
                    }}
                  />
                </div>
              </div>
            )}

        {/* Quick chips */}
        <div
          className={`mb-3 flex gap-2 ${
            isMobileVersion ? 'justify-center' : 'justify-end'
          }`}
        >
          {renderActionButtons(isMobileVersion)}
          {/* Max button */}
          <button
            type="button"
            className={`
              border-border/50 h-7 rounded-lg border px-3 text-[11px] font-semibold transition-all duration-200
              ease-in-out
              dark:border-border/20
              ${
      activeTab === 'sell' && getUserShares() <= 0
        ? 'cursor-not-allowed opacity-50'
        : 'hover:border-border hover:bg-white/10 dark:hover:bg-white/5'
      }`}
            disabled={activeTab === 'sell' && getUserShares() <= 0}
            onClick={() => {
              if (activeTab === 'sell') {
                const userShares = getUserShares()
                if (userShares <= 0)
                  return
                setAmount(formatValue(userShares))
              }
              else {
                const maxBalance = mockUser.cash
                // Limit to 999,999,999
                const limitedBalance = Math.min(maxBalance, 999999999)
                setAmount(formatValue(limitedBalance))
              }
              inputRef?.focus()
            }}
          >
            MAX
          </button>
        </div>

        {/* To Win / You'll receive Section */}
        {amount && Number.parseFloat(amount) > 0 && yesNoSelection && (
          <div className={`${isMobileVersion ? 'mb-4 text-center' : 'mb-4'}`}>
            {!isMobileVersion && (
              <hr className="border-border/50 mb-3 dark:border-border/20" />
            )}
            <div
              className={`flex ${
                isMobileVersion ? 'flex-col' : 'items-center justify-between'
              }`}
            >
              <div className={isMobileVersion ? 'mb-1' : ''}>
                <div
                  className={`${
                    isMobileVersion ? 'text-lg' : 'text-sm'
                  } font-bold ${
                    isMobileVersion
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  } flex items-center ${
                    isMobileVersion ? 'justify-center' : ''
                  } gap-1`}
                >
                  {activeTab === 'sell' ? 'You\'ll receive' : 'To win'}
                  {!isMobileVersion && (
                    <BanknoteIcon className="h-4 w-4 text-emerald-600" />
                  )}
                  {isMobileVersion && (
                    <span className="text-xl text-emerald-600">💰</span>
                  )}
                  {isMobileVersion && (
                    <span className="text-2xl font-bold text-emerald-600">
                      {activeTab === 'sell'
                        ? `$${formatValue(
                          calculateSellAmount(Number.parseFloat(amount)),
                        )}`
                        : `$${formatValue(
                          calculateWinnings(Number.parseFloat(amount), 0.72),
                        )}`}
                    </span>
                  )}
                </div>
                <div
                  className={`${
                    isMobileVersion ? 'text-sm' : 'text-xs'
                  } text-muted-foreground ${
                    isMobileVersion ? 'text-center' : ''
                  }`}
                >
                  {activeTab === 'sell'
                    ? `Avg. price ${getAvgSellPrice()}¢`
                    : 'Avg. Price 72¢'}
                </div>
              </div>
              {!isMobileVersion && (
                <div className="text-4xl font-bold text-emerald-600">
                  {activeTab === 'sell'
                    ? `$${formatValue(calculateSellAmount(Number.parseFloat(amount)))}`
                    : `$${formatValue(
                      calculateWinnings(Number.parseFloat(amount), 0.26),
                    )}`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main button */}
        <Button
          className="h-11 w-full text-sm font-bold"
          onClick={(e) => {
            // Trigger confetti based on selection
            if (yesNoSelection === 'yes') {
              triggerYesConfetti(e)
            }
            else {
              triggerNoConfetti(e)
            }
            handleConfirmTrade()
          }}
          disabled={
            isLoading
            || !amount
            || Number.parseFloat(amount) <= 0
            || !yesNoSelection
            || (activeTab === 'sell' && Number.parseFloat(amount) > getUserShares())
          }
        >
          {isLoading
            ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              )
            : (
                <>
                  {activeTab === 'sell'
                    ? yesNoSelection === 'no'
                      ? 'Sell No'
                      : 'Sell Yes'
                    : yesNoSelection === 'no'
                      ? 'Buy No'
                      : 'Buy Yes'}
                </>
              )}
        </Button>

        {/* Disclaimer */}
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          By trading, you agree to our Terms of Service
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NavigationTabs
        activeCategory={event.category}
        onCategoryChange={() => {}}
      />

      <main className="container grid gap-8 pb-12 pt-8 md:pb-12 lg:grid-cols-[3fr_1fr] lg:gap-10">
        {/* Left column - Main content */}
        <div className="pb-20 md:pb-0">
          {/* Add padding bottom on mobile for the floating button */}
          {/* Market header */}
          <div className="mb-6 flex items-center gap-4">
            <Image
              src={
                event.creatorAvatar
                || `https://avatar.vercel.sh/${event.title.charAt(0)}.png`
              }
              alt={event.creator || 'Market creator'}
              width={64}
              height={64}
              className="flex-shrink-0 rounded-xl"
            />
            <h1 className="line-clamp-3 flex-1 text-lg font-bold leading-tight md:text-xl lg:text-2xl">
              {event.title}
            </h1>
            <div className="flex gap-2 text-muted-foreground">
              <StarIcon
                className={`h-4 w-4 cursor-pointer transition-colors hover:text-foreground ${
                  isFavorite ? 'fill-yellow-400 text-yellow-400' : ''
                }`}
                onClick={handleFavoriteToggle}
              />
              {shareSuccess
                ? (
                    <CheckIcon className="h-4 w-4 text-emerald-500" />
                  )
                : (
                    <ShareIcon
                      className="h-4 w-4 cursor-pointer transition-colors hover:text-foreground"
                      onClick={handleShare}
                    />
                  )}
            </div>
          </div>

          {/* Meta information */}
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span>
              Volume
              {formatVolume(event.volume)}
            </span>
            <span>•</span>
            <span>
              Expires
              {formatDate(event.endDate)}
            </span>
            <span>•</span>
            <span>{event.category}</span>
          </div>

          {/* Probability tag or legend */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {event.outcomes.length <= 2
                  ? (
                      <>
                        <span
                          className={`inline-flex items-center gap-1 text-xl font-bold ${
                            primaryProbability > 0.5
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {Math.round(primaryProbability)}
                          % chance
                        </span>

                        {/* Red arrow with percentage */}
                        <div className="flex items-center gap-1 text-rose-600">
                          <TrendingDownIcon className="h-4 w-4" />
                          <span className="text-xs font-semibold">
                            {trendingData.changePercentage}
                            %
                          </span>
                        </div>
                      </>
                    )
                  : (
                      <div className="flex flex-wrap items-center gap-4">
                        {getTopOutcomesForChart().map((outcome, index) => (
                          <div key={outcome.id} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: POLYMARKET_COLORS[index % 4],
                              }}
                            />
                            <span className="text-sm font-medium text-muted-foreground">
                              {outcome.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
              </div>

              {/* Logo for prints - always present */}
              <div className="flex items-center gap-1 text-muted-foreground opacity-40">
                <div
                  className="h-6 w-6"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeSvg(process.env.NEXT_PUBLIC_SITE_LOGO_SVG!),
                  }}
                />
                <span className="text-xl font-medium">
                  {process.env.NEXT_PUBLIC_SITE_NAME}
                </span>
              </div>
            </div>
          </div>

          {/* Price chart */}
          <div className="mt-4">
            <div className="relative h-72 w-full">
              <div className="absolute inset-0">
                <PredictionChart
                  data={chartConfig.data}
                  series={chartConfig.series}
                  width={800}
                  height={280}
                  margin={{ top: 30, right: 40, bottom: 40, left: 0 }}
                />
              </div>
            </div>
            <ul className="mt-2 flex justify-center gap-4 text-[11px] font-medium">
              {timeRanges.map(range => (
                <li
                  key={range}
                  className={`cursor-pointer transition-colors duration-200 ${
                    activeTimeRange === range
                      ? 'border-b-2 border-foreground text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTimeRange(range)}
                >
                  {range}
                </li>
              ))}
            </ul>
          </div>

          {/* List of Outcomes (only if > 2) */}
          {event.outcomes.length > 2 && (
            <div className="mt-6 overflow-hidden bg-background">
              {/* Header */}
              <div className={`
                bg-muted/10 border-border/50 hidden items-center rounded-t-lg border-b py-3
                dark:border-border/20
                md:flex
              `}
              >
                <div className="w-1/2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    OUTCOMES
                  </span>
                </div>
                <div className="flex w-3/5 items-center justify-center gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    CHANCE
                  </span>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RefreshCwIcon className="h-3 w-3" />
                  </a>
                </div>
                <div className="w-[24%]"></div>
                <div className="w-[24%]"></div>
              </div>

              {/* Items - Sorted by probability descending */}
              {[...event.outcomes]
                .sort((a, b) => b.probability - a.probability)
                .map((outcome, index, sortedOutcomes) => (
                  <div
                    key={outcome.id}
                    className={`
                      flex cursor-pointer flex-col items-start rounded-lg px-3 py-4 transition-all duration-200
                      ease-in-out
                      hover:bg-black/5
                      dark:hover:bg-white/5
                      md:flex-row md:items-center md:px-2
                      ${
                  selectedOutcomeForOrder === outcome.id
                    ? 'bg-muted/30'
                    : ''
                  } ${
                    index !== sortedOutcomes.length - 1
                      ? 'border-border/50 border-b dark:border-border/20'
                      : 'rounded-b-lg'
                  }`}
                    onClick={() => {
                      setSelectedOutcomeForOrder(outcome.id)
                      setActiveTab('buy')
                      inputRef?.focus()
                    }}
                  >
                    {/* Mobile: Layout in column */}
                    <div className="w-full md:hidden">
                      {/* Row 1: Name and probability */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {event.show_market_icons !== false && (
                            <Image
                              src={
                                outcome.avatar
                                || `https://avatar.vercel.sh/${outcome.name.toLowerCase()}.png`
                              }
                              alt={outcome.name}
                              width={42}
                              height={42}
                              className="flex-shrink-0 rounded-full"
                            />
                          )}
                          <div>
                            <div className="text-lg font-bold">
                              {outcome.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              $
                              {outcome.volume?.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }) || '0.00'}
                              {' '}
                              Vol.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-foreground">
                            {Math.round(outcome.probability)}
                            %
                          </span>
                          <div className="flex items-center gap-1 text-rose-600">
                            <TrendingDownIcon className="h-3 w-3" />
                            <span className="text-xs font-semibold">3%</span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className={`h-10 flex-1 text-sm font-bold transition-colors ${
                            selectedOutcomeForOrder === outcome.id
                            && yesNoSelection === 'yes'
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-emerald-600/30 text-emerald-600 hover:bg-emerald-500/40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOutcomeForOrder(outcome.id)
                            setYesNoSelection('yes')
                            setActiveTab('buy')
                            setIsMobileModalOpen(true)
                          }}
                        >
                          Buy Yes
                          {' '}
                          {Math.round(outcome.probability)}
                          ¢
                        </Button>
                        <Button
                          size="sm"
                          className={`h-10 flex-1 text-sm font-bold transition-colors ${
                            selectedOutcomeForOrder === outcome.id
                            && yesNoSelection === 'no'
                              ? 'bg-rose-500 text-white hover:bg-rose-600'
                              : 'bg-rose-600/30 text-rose-600 hover:bg-rose-500/40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOutcomeForOrder(outcome.id)
                            setYesNoSelection('no')
                            setActiveTab('buy')
                            setIsMobileModalOpen(true)
                          }}
                        >
                          Buy No
                          {' '}
                          {100 - Math.round(outcome.probability)}
                          ¢
                        </Button>
                      </div>
                    </div>

                    {/* Desktop: Original line layout */}
                    <div className="hidden w-full items-center md:flex">
                      {/* First column: Name and info - 50% */}
                      <div className="flex w-1/2 items-center gap-3">
                        {event.show_market_icons !== false && (
                          <Image
                            src={
                              outcome.avatar
                              || `https://avatar.vercel.sh/${outcome.name.toLowerCase()}.png`
                            }
                            alt={outcome.name}
                            width={42}
                            height={42}
                            className="flex-shrink-0 rounded-full"
                          />
                        )}
                        <div>
                          <div className="text-lg font-bold">
                            {outcome.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            $
                            {outcome.volume?.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) || '0.00'}
                            {' '}
                            Vol.
                          </div>
                        </div>
                      </div>

                      {/* Second column: Probability - 20% */}
                      <div className="flex w-3/5 justify-center">
                        <div className="flex items-center gap-2">
                          <span className="text-4xl font-bold text-foreground">
                            {Math.round(outcome.probability)}
                            %
                          </span>
                          <div className="flex items-center gap-1 text-rose-600">
                            <TrendingDownIcon className="h-3 w-3" />
                            <span className="text-xs font-semibold">3%</span>
                          </div>
                        </div>
                      </div>

                      {/* Third column: Yes button - 15% */}
                      <div className="w-[15%] pl-3">
                        <Button
                          size="lg"
                          className={`h-12 w-full text-sm font-bold transition-colors ${
                            selectedOutcomeForOrder === outcome.id
                            && yesNoSelection === 'yes'
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-emerald-600/30 text-emerald-600 hover:bg-emerald-500/40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOutcomeForOrder(outcome.id)
                            setYesNoSelection('yes')
                            setActiveTab('buy')
                            inputRef?.focus()
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <span>
                              Buy Yes
                              {' '}
                              {Math.round(outcome.probability)}
                              ¢
                            </span>
                          </div>
                        </Button>
                      </div>
                      <div className="w-[15%] pl-2">
                        <Button
                          size="lg"
                          className={`h-12 w-full text-sm font-bold transition-colors ${
                            selectedOutcomeForOrder === outcome.id
                            && yesNoSelection === 'no'
                              ? 'bg-rose-500 text-white hover:bg-rose-600'
                              : 'bg-rose-600/30 text-rose-600 hover:bg-rose-500/40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOutcomeForOrder(outcome.id)
                            setYesNoSelection('no')
                            setActiveTab('buy')
                            inputRef?.focus()
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <span>
                              Buy No
                              {' '}
                              {100 - Math.round(outcome.probability)}
                              ¢
                            </span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Order Book - Commented for now */}

          {/* Market Context */}
          <div className={`
            border-border/50 mt-3 rounded-lg border transition-all duration-200 ease-in-out
            dark:border-border/20
          `}
          >
            <div className="hover:bg-muted/50 flex items-center justify-between p-4">
              <span className="text-lg font-medium">Market Context</span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={generateMarketContext}
                disabled={isGeneratingContext}
              >
                <SparklesIcon
                  className={`h-3 w-3 ${
                    isGeneratingContext ? 'animate-spin' : ''
                  }`}
                />
                {isGeneratingContext ? 'Generating...' : 'Generate'}
              </Button>
            </div>

            {contextExpanded && (
              <div className="border-border/30 border-t px-3 pb-3">
                <div className="space-y-2 pt-3">
                  {generatedContext.map(line => (
                    <p
                      key={line}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rules */}
          <div className={`
            border-border/50 mt-3 rounded-lg border transition-all duration-200 ease-in-out
            dark:border-border/20
          `}
          >
            <div className="hover:bg-muted/50 flex items-center justify-between p-4">
              <span className="text-lg font-medium">Rules</span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setRulesExpanded(!rulesExpanded)}
              >
                {rulesExpanded ? 'Show less ▴' : 'Show more ▾'}
              </Button>
            </div>

            {rulesExpanded && (
              <div className="border-border/30 border-t px-3 pb-3">
                <div className="space-y-2 pt-3">
                  {event.rules && (
                    <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {formatRules(event.rules)}
                    </div>
                  )}

                  {/* Oracle Info */}
                  <div className="border-border/50 mt-3 rounded-lg border p-3 dark:border-border/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-10 w-10 bg-gradient-to-r ${mockMarketDetails.resolver.gradientColors}
                            flex flex-shrink-0 items-center justify-center rounded-sm
                          `}
                        >
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Resolver
                          </div>
                          <a
                            href={
                              event.oracle
                                ? `https://polygonscan.com/address/${event.oracle}`
                                : '#'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 transition-colors hover:text-blue-600"
                          >
                            {event.oracle
                              ? formatOracleAddress(event.oracle)
                              : ''}
                          </a>
                        </div>
                      </div>

                      {/* Propose resolution button aligned to the right */}
                      <Button variant="outline" size="sm">
                        Propose resolution
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments tabs */}
          <ul className="border-border/50 mt-8 flex h-12 gap-8 border-b text-sm font-semibold dark:border-border/20">
            {commentsTabs.map(tab => (
              <li
                key={tab}
                className={`cursor-pointer transition-colors duration-200 ${
                  activeCommentsTab === tab
                    ? 'border-b-2 border-emerald-500 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveCommentsTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </li>
            ))}
          </ul>

          {/* Add Comment and tabs content */}
          {activeCommentsTab === 'comments' && (
            <>
              <div className="mt-4 space-y-2">
                <div className="relative">
                  <Input
                    className={`
                      border-border/50 h-11 w-full rounded-lg border px-3 pr-16 text-sm transition-all duration-200
                      ease-in-out
                      dark:border-border/20
                      hover:border-border
                      focus:border-primary
                    `}
                    placeholder="Add a comment"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                    disabled={!newComment.trim()}
                  >
                    Post
                  </Button>
                </div>
                <div className={`
                  border-border/50 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px]
                  text-muted-foreground
                  dark:border-border/20
                `}
                >
                  <ShieldIcon className="h-3 w-3" />
                  Beware of external links, they may be phishing attacks.
                </div>
              </div>

              {/* List of Comments */}
              <div className="mt-6 space-y-6">
                {[1, 2, 3].map(comment => (
                  <div key={comment} className="space-y-3">
                    <div className="flex gap-3">
                      <Image
                        src={`https://avatar.vercel.sh/user${comment}.png`}
                        alt={`user${comment}`}
                        width={32}
                        height={32}
                        className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[13px] font-medium">
                            user
                            {comment}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            2h ago
                          </span>
                        </div>
                        <p className="text-sm">
                          Great analysis! I think Bitcoin has a strong chance of
                          reaching this target given the current market
                          conditions.
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            className={`
                              flex items-center gap-1 text-xs text-muted-foreground transition-colors
                              hover:text-foreground
                            `}
                          >
                            <HeartIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button type="button" className="text-muted-foreground transition-colors hover:text-foreground">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Reply example for second comment */}
                    {comment === 2 && (
                      <div className="ml-11 flex gap-3">
                        <Image
                          src="https://avatar.vercel.sh/replier1.png"
                          alt="replier1"
                          width={24}
                          height={24}
                          className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-[13px] font-medium">
                              replier1
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              1h ago
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            I agree! The institutional adoption has been
                            accelerating this year.
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                              Reply
                            </button>
                            <button
                              type="button"
                              className={`
                                flex items-center gap-1 text-xs text-muted-foreground transition-colors
                                hover:text-foreground
                              `}
                            >
                              <HeartIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Top Holders */}
          {activeCommentsTab === 'holders' && (
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Yes Holders */}
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-emerald-600">
                    Yes Holders
                  </h3>
                  <div className="space-y-3">
                    {mockMarketDetails.holders.yes.map(holder => (
                      <div key={holder.name} className="flex items-center gap-3">
                        <Image
                          src={holder.avatar}
                          alt={holder.name}
                          width={32}
                          height={32}
                          className="flex-shrink-0 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {holder.name}
                          </div>
                          <div className="text-xs font-semibold text-emerald-600">
                            {holder.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* No Holders */}
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-rose-600">
                    No Holders
                  </h3>
                  <div className="space-y-3">
                    {mockMarketDetails.holders.no.map(holder => (
                      <div key={holder.name} className="flex items-center gap-3">
                        <Image
                          src={holder.avatar}
                          alt={holder.name}
                          width={32}
                          height={32}
                          className="flex-shrink-0 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {holder.name}
                          </div>
                          <div className="text-xs font-semibold text-rose-600">
                            {holder.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity */}
          {activeCommentsTab === 'activity' && (
            <div className="mt-6">
              {/* Filters */}
              <div className="mb-4 flex gap-2">
                {mockMarketDetails.activityFilters.map(filter => (
                  <button
                    type="button"
                    key={filter}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      activityFilter === filter
                        ? 'bg-muted text-foreground'
                        : 'border-border/50 border hover:bg-muted/50'
                    }`}
                    onClick={() => setActivityFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* List of Activities */}
              <div className="space-y-4">
                {mockMarketDetails.activities.map(activity => (
                  <div
                    key={activity.time}
                    className="border-border/30 flex items-center gap-3 border-b py-2 last:border-b-0"
                  >
                    <Image
                      src={activity.avatar}
                      alt={activity.user}
                      width={32}
                      height={32}
                      className="flex-shrink-0 rounded-full"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        {activity.user}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {' '}
                        {activity.action}
                        {' '}
                      </span>
                      <span className="text-sm font-semibold">
                        {activity.amount}
                      </span>
                      <span
                        className={`ml-1 text-sm font-semibold ${
                          activity.type === 'Yes'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {activity.type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {' '}
                        for
                        {' '}
                        {activity.market}
                        {' '}
                        at
                        {' '}
                      </span>
                      <span className="text-sm font-semibold">
                        {activity.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {' '}
                        (
                        {activity.total}
                        )
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Markets */}
          {activeCommentsTab === 'related' && (
            <div className="mt-6 space-y-4">
              {loadingRelated
                ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCwIcon className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading related events...
                      </span>
                    </div>
                  )
                : relatedEvents.length > 0
                  ? (
                      relatedEvents.map(relatedEvent => (
                        <div
                          key={relatedEvent.id}
                          className={`
                            border-border/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all
                            duration-200
                            dark:border-border/20
                            hover:bg-muted/50
                          `}
                          onClick={() =>
                            window.open(`/event/${relatedEvent.slug}`, '_blank')}
                        >
                          <Image
                            src={
                              getSupabaseImageUrl(relatedEvent.icon_url)
                              || `https://avatar.vercel.sh/${relatedEvent.slug}.png`
                            }
                            alt={relatedEvent.title}
                            width={48}
                            height={48}
                            className="flex-shrink-0 rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="mb-1 line-clamp-2 text-sm font-medium">
                              {relatedEvent.market.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-muted-foreground">Vol. N/A</span>
                              <span className="rounded bg-emerald-600/30 px-2 py-0.5 font-semibold text-emerald-600">
                                Yes 50¢
                              </span>
                              <span className="rounded bg-rose-600/30 px-2 py-0.5 font-semibold text-rose-600">
                                No 50¢
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  : (
                      <div className="py-8 text-center text-muted-foreground">
                        <p className="text-sm">No related events found.</p>
                      </div>
                    )}
            </div>
          )}
        </div>
        {/* Right column - Order panel (Sticky) - Hidden on mobile */}
        <div className="hidden md:block lg:sticky lg:top-28 lg:self-start">
          {renderOrderPanel()}
        </div>
      </main>

      {/* Floating buttons for mobile - only binary markets */}
      {event.outcomes.length === 2 && (
        <div className="border-border/50 fixed bottom-0 left-0 right-0 border-t bg-background p-4 md:hidden">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setYesNoSelection('yes')
                setIsMobileModalOpen(true)
              }}
              className="h-12 flex-1 bg-emerald-500 text-lg font-bold text-white hover:bg-emerald-600"
            >
              Buy Yes
              {' '}
              {yesPrice}
              ¢
            </Button>
            <Button
              onClick={() => {
                setYesNoSelection('no')
                setIsMobileModalOpen(true)
              }}
              className="h-12 flex-1 bg-rose-500 text-lg font-bold text-white hover:bg-rose-600"
            >
              Buy No
              {' '}
              {noPrice}
              ¢
            </Button>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-[50] flex items-end md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileModalOpen(false)}
            onTouchMove={e => e.preventDefault()}
            onWheel={e => e.preventDefault()}
          />

          {/* Modal content */}
          <div
            data-modal="mobile-sheet"
            className={`
              relative max-h-[90vh] w-full transform overflow-y-auto rounded-t-xl bg-background transition-transform
              duration-300 ease-out
            `}
            onTouchStart={(e) => {
              e.stopPropagation()
              setDragStartY(e.touches[0].clientY)
              setIsDragging(false)
            }}
            onTouchMove={(e) => {
              if (dragStartY === null)
                return

              e.stopPropagation()
              const currentY = e.touches[0].clientY
              const deltaY = currentY - dragStartY

              // Only allow dragging down
              if (deltaY > 0) {
                e.preventDefault()
                setIsDragging(true)
                const modal = e.currentTarget
                modal.style.transform = `translateY(${Math.min(
                  deltaY,
                  200,
                )}px)`
                modal.style.opacity = String(Math.max(0.5, 1 - deltaY / 300))
              }
            }}
            onTouchEnd={(e) => {
              if (dragStartY === null)
                return

              e.stopPropagation()
              const currentY = e.changedTouches[0].clientY
              const deltaY = currentY - dragStartY
              const modal = e.currentTarget

              // Reset transform
              modal.style.transform = ''
              modal.style.opacity = ''

              // Close if dragged down more than 100px
              if (deltaY > 100) {
                setIsMobileModalOpen(false)
              }

              setDragStartY(null)
              setIsDragging(false)
            }}
            onMouseDown={(e) => {
              // Support for Safari simulating mobile and desktop
              e.preventDefault()
              setDragStartY(e.clientY)
              setIsDragging(false)
            }}
            onMouseMove={(e) => {
              if (dragStartY === null || !isDragging)
                return

              e.preventDefault()
              const currentY = e.clientY
              const deltaY = currentY - dragStartY

              // Only allow dragging down
              if (deltaY > 0) {
                const modal = e.currentTarget
                modal.style.transform = `translateY(${Math.min(
                  deltaY,
                  200,
                )}px)`
                modal.style.opacity = String(Math.max(0.5, 1 - deltaY / 300))
              }
            }}
            onMouseUp={(e) => {
              if (dragStartY === null)
                return

              e.preventDefault()
              const currentY = e.clientY
              const deltaY = currentY - dragStartY
              const modal = e.currentTarget

              // Reset transform
              modal.style.transform = ''
              modal.style.opacity = ''

              // Close if dragged down more than 100px
              if (deltaY > 100) {
                setIsMobileModalOpen(false)
              }

              setDragStartY(null)
              setIsDragging(false)
            }}
          >
            {/* Handle bar - grip to drag */}
            <div
              className="flex cursor-grab justify-center pb-2 pt-4 active:cursor-grabbing"
              onMouseDown={(e) => {
                // Start drag specifically on the handle bar
                e.preventDefault()
                e.stopPropagation()
                setDragStartY(e.clientY)
                setIsDragging(true)
              }}
              onTouchStart={(e) => {
                // Start drag specifically on the handle bar
                e.preventDefault()
                e.stopPropagation()
                setDragStartY(e.touches[0].clientY)
                setIsDragging(true)
              }}
            >
              <div className="h-1.5 w-24 rounded-full bg-black/20 shadow-sm" />
            </div>

            {/* Modal Content */}
            {renderOrderPanel(true)}
          </div>
        </div>
      )}

      {/* Global drag events for compatibility with Safari simulating mobile */}
      {isMobileModalOpen && (
        <div>
          {isDragging && (
            <div
              className="fixed inset-0 z-[9998]"
              onMouseMove={(e) => {
                if (dragStartY === null)
                  return

                e.preventDefault()
                const currentY = e.clientY
                const deltaY = currentY - dragStartY

                // Only allow dragging down
                if (deltaY > 0) {
                  const modal = document.querySelector(
                    '[data-modal="mobile-sheet"]',
                  ) as HTMLElement
                  if (modal) {
                    modal.style.transform = `translateY(${Math.min(
                      deltaY,
                      200,
                    )}px)`
                    modal.style.opacity = String(
                      Math.max(0.5, 1 - deltaY / 300),
                    )
                  }
                }
              }}
              onMouseUp={(e) => {
                if (dragStartY === null)
                  return

                e.preventDefault()
                const currentY = e.clientY
                const deltaY = currentY - dragStartY
                const modal = document.querySelector(
                  '[data-modal="mobile-sheet"]',
                ) as HTMLElement

                if (modal) {
                  // Reset transform
                  modal.style.transform = ''
                  modal.style.opacity = ''
                }

                // Close if dragged down more than 100px
                if (deltaY > 100) {
                  setIsMobileModalOpen(false)
                }

                setDragStartY(null)
                setIsDragging(false)
              }}
              onTouchMove={(e) => {
                if (dragStartY === null)
                  return

                e.preventDefault()
                const currentY = e.touches[0].clientY
                const deltaY = currentY - dragStartY

                // Only allow dragging down
                if (deltaY > 0) {
                  const modal = document.querySelector(
                    '[data-modal="mobile-sheet"]',
                  ) as HTMLElement
                  if (modal) {
                    modal.style.transform = `translateY(${Math.min(
                      deltaY,
                      200,
                    )}px)`
                    modal.style.opacity = String(
                      Math.max(0.5, 1 - deltaY / 300),
                    )
                  }
                }
              }}
              onTouchEnd={(e) => {
                if (dragStartY === null)
                  return

                e.preventDefault()
                const currentY = e.changedTouches[0].clientY
                const deltaY = currentY - dragStartY
                const modal = document.querySelector(
                  '[data-modal="mobile-sheet"]',
                ) as HTMLElement

                if (modal) {
                  // Reset transform
                  modal.style.transform = ''
                  modal.style.opacity = ''
                }

                // Close if dragged down more than 100px
                if (deltaY > 100) {
                  setIsMobileModalOpen(false)
                }

                setDragStartY(null)
                setIsDragging(false)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
