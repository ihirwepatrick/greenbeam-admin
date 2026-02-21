"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 5, cols = 6 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex gap-4 border-b pb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
