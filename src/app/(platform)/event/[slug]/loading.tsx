import EventRelatedSkeleton from '@/app/(platform)/event/[slug]/_components/EventRelatedSkeleton'
import { Teleport } from '@/components/Teleport'
import { Skeleton } from '@/components/ui/skeleton'

const CHART_RANGE_PLACEHOLDERS = ['1D', '7D', '30D', '90D', 'ALL']
const EVENT_TAB_PLACEHOLDERS = ['Comments', 'Holders', 'Activity']

export default function Loading() {
  return (
    <div className="grid gap-4">
      <div className="-mx-4 rounded-lg border bg-card/60 px-4 py-4 lg:mx-0 lg:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="size-14 rounded-sm" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`chart-pill-${index}`} className="h-9 w-16 rounded-full" />
              ))}
            </div>
          </div>

          <Skeleton className="h-[300px] w-full rounded-lg" />

          <div className="flex flex-wrap justify-center gap-2">
            {CHART_RANGE_PLACEHOLDERS.map(range => (
              <Skeleton key={range} className="h-8 w-14 rounded-full lg:w-20" />
            ))}
          </div>
        </div>
      </section>

      <section className="-mx-4 rounded-lg border bg-card p-4 lg:mx-0">
        <div className={`
          hidden items-center gap-4 border-b pb-3 text-xs font-semibold text-muted-foreground uppercase
          lg:flex
        `}
        >
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-32 rounded-full" />
        </div>

        <div className="space-y-3 pt-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`market-skeleton-${index}`} className="rounded-lg border bg-background/70 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-28 rounded-full" />
                  <Skeleton className="size-10 rounded-full" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[0, 1].map(outcomeIndex => (
                  <div key={`outcome-${index}-${outcomeIndex}`} className="rounded-lg border bg-muted/40 p-3">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="mt-2 h-6 w-full rounded-md" />
                    <Skeleton className="mt-3 h-2 w-3/4 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-card/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-5 w-44" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`context-card-${index}`} className="rounded-lg border bg-background/70 p-3">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="mt-3 h-4 w-1/2 rounded-md" />
              <Skeleton className="mt-2 h-3 w-3/4 rounded-md" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="size-8 rounded-md" />
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`rule-line-${index}`} className="h-3 w-full rounded" />
          ))}
          <div className="mt-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-sm" />
                <div>
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="mt-2 h-3 w-28 rounded" />
                </div>
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="relative flex h-9 gap-8 border-b text-sm font-semibold">
          {EVENT_TAB_PLACEHOLDERS.map(tab => (
            <Skeleton key={tab} className="h-4 w-24 rounded-full" />
          ))}
          <Skeleton className="absolute bottom-0 h-0.5 w-20 rounded-full" />
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <Skeleton className="h-11 w-full rounded-md" />
            <div className="mt-3 flex items-center gap-2">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>

          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`comment-${index}`} className="rounded-lg border bg-card/70 p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
                <Skeleton className="mt-4 h-16 w-full rounded-md" />
                <div className="mt-3 flex items-center gap-2">
                  <Skeleton className="h-4 w-10 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Teleport to="#event-order-panel">
        <div className="space-y-4 lg:w-[340px]">
          <div className="rounded-lg border bg-card p-4 shadow-xl/5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>

              <div className="flex gap-2">
                <Skeleton className="h-9 w-full rounded-full" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>

              <div className="flex gap-2">
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>

              <Skeleton className="h-12 w-full rounded-lg" />

              <div className="space-y-2">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>
          </div>

          <div className="rounded-lg border bg-card/70 p-4">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`tag-${index}`} className="h-7 w-16 rounded-full" />
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <EventRelatedSkeleton key={`related-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  )
}
