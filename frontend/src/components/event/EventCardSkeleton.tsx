"use client"

export default function EventCardSkeleton() {
  return (
    <div className="rounded-lg bg-card border p-4 min-h-[170px] animate-pulse">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-8 h-8 rounded bg-muted"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="w-8 h-5 bg-muted rounded"></div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 mb-3">
        <div className="h-8 bg-muted rounded"></div>
        <div className="h-8 bg-muted rounded"></div>
      </div>

      <div className="flex justify-between items-center">
        <div className="h-3 bg-muted rounded w-16"></div>
        <div className="h-3 bg-muted rounded w-6"></div>
      </div>
    </div>
  );
}
