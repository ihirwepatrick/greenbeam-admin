"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="w-full h-48 rounded-t-lg rounded-b-none" />
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  )
}
