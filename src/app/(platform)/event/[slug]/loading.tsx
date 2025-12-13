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
          <Skeleton className="h-4 w-1/3" />
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="mt-6 h-10 w-full" />
          <div className="mt-4 flex justify-end gap-2">
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-10" />
          </div>
          <Skeleton className="mt-4 h-12 w-full" />
        </section>
      </Teleport>
    </div>
  )
}
