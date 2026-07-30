import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { AnalyticsInner } from "@/components/analytics/analytics-inner"
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  const sp = await searchParams
  const range = (typeof sp?.range === "string" ? sp.range : "30d") as "7d" | "30d" | "90d" | "year"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Insights into your bookings, team performance, and availability.
        </p>
      </div>
      <Suspense fallback={<AnalyticsSkeleton />} key={range}>
        <AnalyticsInner userId={session!.user.id} range={range} />
      </Suspense>
    </div>
  )
}
