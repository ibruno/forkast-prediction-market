'use client'

import { useMarketChannelStatus } from '@/app/(platform)/event/[slug]/_components/EventMarketChannelProvider'
import { cn } from '@/lib/utils'

interface MarketChannelStatusIndicatorProps {
  className?: string
}

export default function MarketChannelStatusIndicator({ className }: MarketChannelStatusIndicatorProps) {
  const wsStatus = useMarketChannelStatus()

  return (
    <div className={cn('inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground', className)}>
      <span>
        {wsStatus === 'live' ? 'Live' : wsStatus === 'connecting' ? 'Connecting' : 'Offline'}
      </span>
      <span className="relative flex size-2">
        {wsStatus === 'live' && (
          <span className="absolute inline-flex size-2 animate-ping rounded-full bg-yes opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex size-2 rounded-full',
            wsStatus === 'live' && 'bg-yes',
            wsStatus === 'connecting' && 'bg-amber-500',
            wsStatus === 'offline' && 'bg-muted-foreground/40',
          )}
        />
      </span>
    </div>
  )
}
