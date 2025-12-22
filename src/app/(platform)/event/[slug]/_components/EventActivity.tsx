'use client'

import type { ActivityOrder, Event } from '@/types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { AlertCircleIcon, ExternalLinkIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ProfileLinkSkeleton from '@/components/ProfileLinkSkeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { defaultNetwork } from '@/lib/appkit'
import { fetchEventTrades } from '@/lib/data-api/trades'
import { formatCurrency, formatSharePriceLabel, formatTimeAgo, fromMicro } from '@/lib/formatters'
import { getUserPublicAddress } from '@/lib/user-address'
import { cn } from '@/lib/utils'
import { useUser } from '@/stores/useUser'

interface EventActivityProps {
  event: Event
}

export default function EventActivity({ event }: EventActivityProps) {
  const parentRef = useRef<HTMLDivElement | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [minAmountFilter, setMinAmountFilter] = useState('none')
  const [scrollMargin, setScrollMargin] = useState(0)
  const [infiniteScrollError, setInfiniteScrollError] = useState<string | null>(null)
  const currentUser = useUser()
  const currentUserAddress = getUserPublicAddress(currentUser)

  useEffect(() => {
    queueMicrotask(() => setInfiniteScrollError(null))
  }, [minAmountFilter])

  useEffect(() => {
    queueMicrotask(() => {
      if (parentRef.current) {
        setScrollMargin(parentRef.current.offsetTop)
      }
    })
  }, [])

  const marketIds = event.markets.map(market => market.condition_id).filter(Boolean)
  const hasMarkets = marketIds.length > 0

  const {
    status,
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['event-activity', event.slug, marketIds.join(','), minAmountFilter],
    queryFn: ({ pageParam = 0, signal }) =>
      fetchEventTrades({
        marketIds,
        pageParam,
        minAmountFilter,
        signal,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 50) {
        return allPages.reduce((total, page) => total + page.length, 0)
      }

      return undefined
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: hasMarkets,
  })

  const activities: ActivityOrder[] = data?.pages.flat() ?? []
  const loading = hasMarkets && status === 'pending'
  const hasInitialError = hasMarkets && status === 'error'
  const polygonscanBase = defaultNetwork.id === 80002
    ? 'https://amoy.polygonscan.com'
    : 'https://polygonscan.com'

  const virtualizer = useWindowVirtualizer({
    count: activities.length,
    estimateSize: () => {
      if (typeof window !== 'undefined') {
        return window.innerWidth < 768 ? 120 : 70
      }
      return 70
    },
    scrollMargin,
    overscan: 5,
    onChange: (instance) => {
      if (!hasInitialized) {
        setHasInitialized(true)
        return
      }

      const items = instance.getVirtualItems()
      const last = items[items.length - 1]
      if (
        last
        && last.index >= activities.length - 1
        && hasNextPage
        && !isFetchingNextPage
        && !infiniteScrollError
      ) {
        queueMicrotask(() => {
          fetchNextPage().catch((error) => {
            setInfiniteScrollError(error.message || 'Failed to load more activity')
          })
        })
      }
    },
  })

  function formatTotalValue(totalValueMicro: number) {
    const totalValue = totalValueMicro / 1e6
    return formatSharePriceLabel(totalValue, { fallback: '0¢' })
  }

  function retryInfiniteScroll() {
    setInfiniteScrollError(null)
    fetchNextPage().catch((error) => {
      setInfiniteScrollError(error.message || 'Failed to load more activity')
    })
  }

  if (!hasMarkets) {
    return (
      <div className="mt-6">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>No market available for this event</AlertTitle>
        </Alert>
      </div>
    )
  }

  if (hasInitialError) {
    return (
      <div className="mt-6">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Failed to load activity</AlertTitle>
          <AlertDescription>
            <Button
              type="button"
              onClick={() => refetch()}
              size="sm"
              variant="link"
              className="-ml-3"
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="mt-6 grid gap-6">
      <div className="flex items-center gap-2">
        <Select value={minAmountFilter} onValueChange={setMinAmountFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Min Amount:" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="10">$10</SelectItem>
            <SelectItem value="100">$100</SelectItem>
            <SelectItem value="1000">$1,000</SelectItem>
            <SelectItem value="10000">$10,000</SelectItem>
            <SelectItem value="100000">$100,000</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <>
          <ProfileLinkSkeleton showDate={true} showChildren={true} />
          <ProfileLinkSkeleton showDate={true} showChildren={true} />
          <ProfileLinkSkeleton showDate={true} showChildren={true} />
        </>
      )}

      {!loading && activities.length === 0 && (
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {minAmountFilter && minAmountFilter !== 'none'
              ? `No activity found with minimum amount of ${
                formatCurrency(Number.parseInt(minAmountFilter, 10) || 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
              }.`
              : 'No trading activity yet for this event.'}
          </div>
          {minAmountFilter && minAmountFilter !== 'none' && (
            <div className="mt-2 text-xs text-muted-foreground">
              Try lowering the minimum amount filter to see more activity.
            </div>
          )}
        </div>
      )}

      {!loading && activities.length > 0 && (
        <div>
          <div
            className="divide-y divide-border"
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
              width: '100%',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const activity = activities[virtualItem.index]
              if (!activity) {
                return null
              }

              const timeAgoLabel = formatTimeAgo(activity.created_at)
              const txUrl = activity.tx_hash ? `${polygonscanBase}/tx/${activity.tx_hash}` : null
              const priceLabel = formatSharePriceLabel(Number(activity.price))
              const valueLabel = formatTotalValue(activity.total_value)
              const amountLabel = fromMicro(activity.amount)
              const outcomeColorClass = (activity.outcome.text || '').toLowerCase() === 'yes'
                ? 'text-yes'
                : 'text-no'
              const isCurrentUser = currentUserAddress
                && activity.user.address
                && activity.user.address.toLowerCase() === currentUserAddress.toLowerCase()
              const displayUsername = (
                (isCurrentUser && currentUser?.username)
                || activity.user.username
                || activity.user.address
                || 'trader'
              )
              const displayImage = (
                (isCurrentUser && currentUser?.image)
                || activity.user.image
                || `https://avatar.vercel.sh/${activity.user.address || displayUsername}.png`
              )
              const profileSlug = displayUsername.startsWith('@') ? displayUsername : `@${displayUsername}`
              const profileHref: `/${string}` = `/${profileSlug}`

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${
                      virtualItem.start
                      - (virtualizer.options.scrollMargin ?? 0)
                    }px)`,
                  }}
                >
                  <div
                    className={cn(`
                      flex items-center justify-between gap-3 px-3 py-2 text-sm leading-tight text-foreground
                    `)}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Link href={profileHref} className="shrink-0">
                        <Image
                          src={displayImage}
                          alt={displayUsername}
                          width={32}
                          height={32}
                          className="size-8 rounded-full object-cover"
                        />
                      </Link>
                      <div className="flex min-w-0 items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        <Link
                          href={profileHref}
                          className="max-w-[140px] truncate font-semibold text-foreground"
                          title={displayUsername}
                        >
                          {displayUsername}
                        </Link>
                        <span className="text-foreground">
                          {activity.side === 'buy' ? 'bought' : 'sold'}
                        </span>
                        <span className={cn('font-semibold', outcomeColorClass)}>
                          {amountLabel}
                          {activity.outcome.text ? ` ${activity.outcome.text}` : ''}
                        </span>
                        <span className="text-foreground">
                          at
                        </span>
                        <span className="font-semibold text-foreground">
                          {priceLabel}
                        </span>
                        <span className="text-muted-foreground">
                          (
                          {valueLabel}
                          )
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      <span className="whitespace-nowrap">
                        {timeAgoLabel}
                      </span>
                      {txUrl && (
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View transaction on Polygonscan"
                          className="transition-colors hover:text-foreground"
                        >
                          <ExternalLinkIcon className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {isFetchingNextPage && (
            <>
              <ProfileLinkSkeleton showDate={true} showChildren={true} />
              <ProfileLinkSkeleton showDate={true} showChildren={true} />
              <ProfileLinkSkeleton showDate={true} showChildren={true} />
            </>
          )}

          {infiniteScrollError && (
            <div className="mt-4">
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Failed to load more activity</AlertTitle>
                <AlertDescription>
                  <Button
                    type="button"
                    onClick={retryInfiniteScroll}
                    size="sm"
                    variant="link"
                    className="-ml-3"
                  >
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
