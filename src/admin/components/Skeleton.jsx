export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <Skeleton className="mb-4 h-9 w-9 rounded-xl" />
      <Skeleton className="mb-2 h-3 w-20" />
      <Skeleton className="h-7 w-28" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 rounded-2xl border border-line bg-white p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
