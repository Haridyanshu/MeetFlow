export default function BookingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-4 w-56 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-7 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-7 w-20 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3.5 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-36 rounded bg-muted" />
                  <div className="h-2.5 w-48 rounded bg-muted" />
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-3 w-10 rounded bg-muted" />
                </div>
                <div className="h-6 w-12 rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
