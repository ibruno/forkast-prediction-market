'use client'

import type { Event } from '@/types'
import {
  CheckIcon,
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
import { useEffect, useLayoutEffect, useState } from 'react'
import PredictionChart from '@/components/charts/PredictionChart'
import RelatedEvents from '@/components/event/EventRelated'
import OrderPanel from '@/components/event/OrderPanel'
import Header from '@/components/layout/Header'
import NavigationTabs from '@/components/layout/NavigationTabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTradingState } from '@/hooks/useTradingState'
import {
  formatDate,
  formatVolume,
  mockMarketDetails,
} from '@/lib/mockData'
import { formatOracleAddress, formatRules } from '@/lib/utils'

interface EventDetailProps {
  event: Event
}

export default function EventDetail({ event }: EventDetailProps) {
  // Basic SVG sanitization function
  function sanitizeSvg(svg: string) {
    return svg
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
  }

  const POLYMARKET_COLORS = ['#2D9CDB', '#FF5952', '#27AE60', '#9B51E0']

  // Use custom trading state hook
  const tradingState = useTradingState({ event })

  // Component states
  const [activeTimeRange, setActiveTimeRange] = useState('1D')
  const [newComment, setNewComment] = useState('')
  const [activeCommentsTab, setActiveCommentsTab] = useState('comments')
  const [rulesExpanded, setRulesExpanded] = useState(false)
  const [activityFilter, setActivityFilter] = useState('All')
  const [isFavorite, setIsFavorite] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [contextExpanded, setContextExpanded] = useState(false)
  const [isGeneratingContext, setIsGeneratingContext] = useState(false)
  const [generatedContext, setGeneratedContext] = useState<string[]>([])
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Utility functions - now using trading state
  const getYesOutcome = tradingState.getYesOutcome
  const primaryProbability = tradingState.primaryProbability
  const yesPrice = tradingState.yesPrice
  const noPrice = tradingState.noPrice

  // Function to get top 4 outcomes by volume
  function getTopOutcomesForChart() {
    return [...event.outcomes]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 4)
  }

  // Function to generate chart data based on actual outcomes
  function generateChartData() {
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

  // Function to generate market context
  async function generateMarketContext() {
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
    if (!tradingState.selectedOutcomeForOrder && event.active_markets_count > 0) {
      if (event.active_markets_count === 1) {
        // For binary markets, select the "Yes" option (isYes = true)
        const yesOutcome = getYesOutcome()
        if (yesOutcome) {
          tradingState.setSelectedOutcomeForOrder(yesOutcome.id)
          tradingState.setYesNoSelection('yes')
        }
        else {
          // If isYes not found, select first option
          tradingState.setSelectedOutcomeForOrder(event.outcomes[0].id)
          tradingState.setYesNoSelection('yes')
        }
      }
      else if (event.active_markets_count > 1) {
        // For multi-option markets, select option with highest probability
        const sortedOutcomes = [...event.outcomes].sort(
          (a, b) => b.probability - a.probability,
        )
        const highestProbOutcome = sortedOutcomes[0]
        if (highestProbOutcome) {
          tradingState.setSelectedOutcomeForOrder(highestProbOutcome.id)
          tradingState.setYesNoSelection('yes')
        }
      }
    }
  }, [event.active_markets_count, event.outcomes, tradingState.selectedOutcomeForOrder, getYesOutcome, tradingState])

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
  function handleFavoriteToggle() {
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
  async function handleShare() {
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

  const { timeRanges, commentsTabs, trendingData } = mockMarketDetails

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
                {event.active_markets_count === 1
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
          {event.active_markets_count > 1 && (
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
                  tradingState.selectedOutcomeForOrder === outcome.id
                    ? 'bg-muted/30'
                    : ''
                  } ${
                    index !== sortedOutcomes.length - 1
                      ? 'border-border/50 border-b dark:border-border/20'
                      : 'rounded-b-lg'
                  }`}
                    onClick={() => {
                      tradingState.setSelectedOutcomeForOrder(outcome.id)
                      tradingState.setActiveTab('buy')
                      tradingState.inputRef?.focus()
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
                            tradingState.selectedOutcomeForOrder === outcome.id
                            && tradingState.yesNoSelection === 'yes'
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-emerald-600/30 text-emerald-600 hover:bg-emerald-500/40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            tradingState.setSelectedOutcomeForOrder(outcome.id)
                            tradingState.setYesNoSelection('yes')
                            tradingState.setActiveTab('buy')
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
                            tradingState.selectedOutcomeForOrder === outcome.id
                            && tradingState.yesNoSelection === 'no'
                              ? 'bg-rose-500 text-white hover:bg-rose-600'
                              : 'bg-rose-600/30 text-rose-600 hover:bg-rose-500/40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            tradingState.setSelectedOutcomeForOrder(outcome.id)
                            tradingState.setYesNoSelection('no')
                            tradingState.setActiveTab('buy')
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
                            tradingState.selectedOutcomeForOrder === outcome.id
                            && tradingState.yesNoSelection === 'yes'
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-emerald-600/30 text-emerald-600 hover:bg-emerald-500/40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            tradingState.setSelectedOutcomeForOrder(outcome.id)
                            tradingState.setYesNoSelection('yes')
                            tradingState.setActiveTab('buy')
                            tradingState.inputRef?.focus()
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
                            tradingState.selectedOutcomeForOrder === outcome.id
                            && tradingState.yesNoSelection === 'no'
                              ? 'bg-rose-500 text-white hover:bg-rose-600'
                              : 'bg-rose-600/30 text-rose-600 hover:bg-rose-500/40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            tradingState.setSelectedOutcomeForOrder(outcome.id)
                            tradingState.setYesNoSelection('no')
                            tradingState.setActiveTab('buy')
                            tradingState.inputRef?.focus()
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
        </div>
        {/* Right column - Order panel (Sticky) - Hidden on mobile */}
        <div className="hidden gap-4 md:block lg:sticky lg:top-28 lg:grid lg:self-start">
          <OrderPanel event={event} tradingState={tradingState} />
          <RelatedEvents event={event} />
        </div>
      </main>

      {/* Floating buttons for mobile - only binary markets */}
      {event.active_markets_count === 1 && (
        <div className="border-border/50 fixed bottom-0 left-0 right-0 border-t bg-background p-4 md:hidden">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                tradingState.setYesNoSelection('yes')
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
                tradingState.setYesNoSelection('no')
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
            <OrderPanel event={event} isMobileVersion={true} tradingState={tradingState} />
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
