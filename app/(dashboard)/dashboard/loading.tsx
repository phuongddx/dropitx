export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Page title skeleton */}
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />

      {/* Stat cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-muted"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>

      {/* Content area */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div>
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
