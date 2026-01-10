'use client'

import type { ReactNode } from 'react'
import type { ProfileForCards } from '@/components/ProfileOverviewCard'
import type { PortfolioSnapshot } from '@/lib/portfolio'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import ProfileOverviewCard from '@/components/ProfileOverviewCard'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { fetchProfileLinkStats } from '@/lib/data-api/profile-link-stats'
import { formatTimeAgo } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface ProfileLinkProps {
  user: {
    address: string
    proxy_wallet_address?: string | null
    image: string
    username: string
  }
  layout?: 'default' | 'inline'
  position?: number
  date?: string
  children?: ReactNode
  inlineContent?: ReactNode
  trailing?: ReactNode
  containerClassName?: string
  usernameMaxWidthClassName?: string
  usernameClassName?: string
  inlineNoTruncate?: boolean
}

export default function ProfileLink({
  user,
  layout = 'default',
  position,
  date,
  children,
  inlineContent,
  trailing,
  containerClassName,
  usernameMaxWidthClassName,
  usernameClassName,
  inlineNoTruncate = false,
}: ProfileLinkProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchProfileLinkStats>>>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const isInline = layout === 'inline'
  const inlineBody = inlineContent ?? children
  const inlineRowClassName = `
    flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap text-foreground
  `

  const medalColor = {
    1: '#FFD700',
    2: '#C0C0C0',
    3: '#CD7F32',
  }[position ?? 0] ?? '#000000'

  const medalTextColor = medalColor === '#000000' ? '#ffffff' : '#1a1a1a'
  const profileHref = `/@${user.username}` as any
  const statsAddress = useMemo(
    () => user.proxy_wallet_address ?? user.address,
    [user.address, user.proxy_wallet_address],
  )

  useEffect(() => {
    setStats(null)
    setHasLoaded(false)
  }, [statsAddress])

  useEffect(() => {
    if (!isOpen || hasLoaded) {
      return
    }

    if (!statsAddress) {
      setHasLoaded(true)
      return
    }

    const controller = new AbortController()
    let isActive = true

    fetchProfileLinkStats(statsAddress, controller.signal)
      .then((result) => {
        if (!isActive || controller.signal.aborted) {
          return
        }
        setStats(result)
        setHasLoaded(true)
      })
      .catch((error) => {
        if (!isActive || controller.signal.aborted || error?.name === 'AbortError') {
          return
        }
        setStats(null)
        setHasLoaded(true)
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [hasLoaded, isOpen, statsAddress])

  const tooltipProfile = useMemo<ProfileForCards>(() => ({
    username: user.username,
    avatarUrl: user.image,
    portfolioAddress: statsAddress,
  }), [statsAddress, user.image, user.username])
  const tooltipSnapshot = useMemo<PortfolioSnapshot>(() => ({
    positionsValue: stats?.positionsValue ?? 0,
    profitLoss: stats?.profitLoss ?? 0,
    predictions: stats?.positions ?? 0,
    biggestWin: stats?.biggestWin ?? 0,
  }), [stats?.positions, stats?.positionsValue, stats?.profitLoss, stats?.biggestWin])
  const avatarLink = (
    <Link href={profileHref} className="relative shrink-0">
      <Image
        src={user.image}
        alt={user.username}
        width={32}
        height={32}
        className="rounded-full"
      />
      {position && (
        <Badge
          variant="secondary"
          style={{ backgroundColor: medalColor, color: medalTextColor }}
          className="absolute top-0 -right-2 size-5 rounded-full px-1 font-mono text-muted-foreground tabular-nums"
        >
          {position}
        </Badge>
      )}
    </Link>
  )
  const usernameInlineLink = (
    <Link
      href={profileHref}
      title={user.username}
      className={cn('text-sm font-medium', usernameClassName)}
    >
      {user.username}
    </Link>
  )

  return (
    <Tooltip onOpenChange={setIsOpen}>
      <div
        className={cn(
          'flex gap-3',
          isInline ? 'items-center justify-between' : children ? 'items-start' : 'items-center',
          isInline ? null : 'py-2',
          containerClassName,
        )}
      >
        <div className="min-w-0 flex-1">
          {isInline && inlineNoTruncate
            ? (
                <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                  <TooltipTrigger asChild>
                    {avatarLink}
                  </TooltipTrigger>
                  <div className="min-w-0 text-foreground">
                    <TooltipTrigger asChild>
                      {usernameInlineLink}
                    </TooltipTrigger>
                    {inlineBody ? <span className="ml-1">{inlineBody}</span> : null}
                    {date && (
                      <span className="ml-1 text-xs whitespace-nowrap text-muted-foreground">
                        {formatTimeAgo(date)}
                      </span>
                    )}
                  </div>
                </div>
              )
            : (
                <div className="flex w-full min-w-0 items-center gap-1">
                  <TooltipTrigger asChild>
                    <div className="flex min-w-0 items-center gap-3">
                      {avatarLink}
                      <Link
                        href={profileHref}
                        title={user.username}
                        className={cn(
                          'min-w-0 truncate text-sm font-medium',
                          usernameClassName,
                          usernameMaxWidthClassName ?? 'max-w-32 lg:max-w-64',
                        )}
                      >
                        {user.username}
                      </Link>
                    </div>
                  </TooltipTrigger>
                  <div className="min-w-0">
                    {isInline
                      ? (
                          <div className={inlineRowClassName}>
                            {date && (
                              <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                                {formatTimeAgo(date)}
                              </span>
                            )}
                            {inlineBody
                              ? (
                                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {inlineBody}
                                  </span>
                                )
                              : null}
                          </div>
                        )
                      : (
                          <div className="flex min-w-0 items-center gap-1">
                            {date && (
                              <span className="text-xs whitespace-nowrap text-muted-foreground">
                                {formatTimeAgo(date)}
                              </span>
                            )}
                          </div>
                        )}
                  </div>
                </div>
              )}
          {!isInline && children
            ? <div className="pl-11">{children}</div>
            : null}
        </div>
        {trailing
          ? (
              <div className="ml-2 flex shrink-0 items-center text-right">
                {trailing}
              </div>
            )
          : null}
      </div>
      <TooltipContent
        side="top"
        align="start"
        sideOffset={8}
        hideArrow
        className="max-w-[90vw] border-none bg-transparent p-0 text-popover-foreground shadow-none md:max-w-96"
      >
        <ProfileOverviewCard
          profile={tooltipProfile}
          snapshot={tooltipSnapshot}
          useDefaultUserWallet={false}
          enableLiveValue={false}
        />
      </TooltipContent>
    </Tooltip>
  )
}
