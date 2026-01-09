import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-52 rounded-lg" />
        <Skeleton className="h-52 rounded-lg" />
      </div>

      <div className="grid gap-4 overflow-hidden rounded-2xl border p-4">
        <div className="flex items-center gap-4 p-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>

        {[0, 1, 2, 3, 4].map(item => (
          <div key={item} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </>
  )
}
