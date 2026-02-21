import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      <div className="grid gap-6 max-w-2xl">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}
