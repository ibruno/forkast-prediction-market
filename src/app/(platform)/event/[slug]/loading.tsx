import { Teleport } from '@/components/Teleport'
import { Skeleton } from '@/components/ui/skeleton'

export default async function Loading() {
  return (
    <div className="grid gap-4">
      <div className="space-y-4">
        <div className="rounded-lg border bg-card/60 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-sm" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>

        <Skeleton className="h-64 w-full rounded-lg border bg-card" />

        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`summary-${index}`} className="h-32 rounded-lg border bg-card" />
          ))}
        </div>
      </div>

      <Teleport to="#event-order-panel">
        <section className="rounded-lg border bg-card/60 p-4 shadow-xl/5 lg:w-[340px]">
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-full rounded-full" />
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </section>
      </Teleport>
    </div>
  )
}
