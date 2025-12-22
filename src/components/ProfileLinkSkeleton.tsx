import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ProfileLinkSkeletonProps {
  showPosition?: boolean
  showDate?: boolean
  showChildren?: boolean
  showTrailing?: boolean
  usernameMaxWidthClassName?: string
  trailingWidthClassName?: string
}

export default function ProfileLinkSkeleton({
  showPosition = false,
  showDate = false,
  showChildren = false,
  showTrailing = false,
  usernameMaxWidthClassName,
  trailingWidthClassName = 'w-12',
}: ProfileLinkSkeletonProps) {
  return (
    <div
      className={cn(
        'flex gap-3 border-b border-border/30 py-2 last:border-b-0',
        showChildren || showTrailing ? 'items-start' : 'items-center',
      )}
    >
      <div className="relative shrink-0">
        <Skeleton className="size-8 rounded-full" />
        {showPosition && (
          <Skeleton className="absolute top-0 -right-2 size-5 rounded-full" />
        )}
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 gap-3',
          showChildren ? 'items-start' : 'items-center',
        )}
      >
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'flex min-w-0 items-center gap-1',
              usernameMaxWidthClassName ?? 'max-w-32 lg:max-w-64',
            )}
          >
            <Skeleton className="h-4 w-20" />
            {showDate && <Skeleton className="h-3 w-12" />}
          </div>
          {showChildren && <Skeleton className="mt-1 h-4 w-3/4" />}
        </div>
        {showTrailing && (
          <Skeleton className={cn('h-4 shrink-0', trailingWidthClassName)} />
        )}
      </div>
    </div>
  )
}
