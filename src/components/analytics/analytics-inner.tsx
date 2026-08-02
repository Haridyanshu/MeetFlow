import "server-only"

import { getDateRange, getBookingKPIs, getBookingsOverTime, getBookingStatusDistribution, getEventTypePopularity, getEventTypeAnalytics, getTeamAnalytics, getAvailabilityInsights, getRecentActivity } from "@/lib/queries/analytics"
import { TimeFilter } from "@/components/analytics/time-filter"
import { KPICards } from "@/components/analytics/kpi-cards"
import { BookingsOverTimeChart, StatusDistributionChart, EventTypePopularityChart } from "@/components/analytics/charts"
import { EventTypeAnalyticsTable } from "@/components/analytics/event-type-analytics"
import { TeamAnalyticsSection } from "@/components/analytics/team-analytics"
import { AvailabilityInsights } from "@/components/analytics/availability-insights"
import { RecentActivity } from "@/components/analytics/recent-activity"

export async function AnalyticsInner({
  userId,
  range,
  timezone,
}: {
  userId: string
  range: "7d" | "30d" | "90d" | "year"
  timezone: string
}) {
  const dateRange = getDateRange(range, undefined, undefined, timezone)

  const [kpis, bookingsOverTime, statusDistribution, eventTypePopularity, eventTypeAnalytics, teamAnalytics, insights, activity] =
    await Promise.all([
      getBookingKPIs(userId, dateRange),
      getBookingsOverTime(userId, dateRange.start, dateRange.end, timezone),
      getBookingStatusDistribution(userId, dateRange.start, dateRange.end),
      getEventTypePopularity(userId, dateRange.start, dateRange.end),
      getEventTypeAnalytics(userId, dateRange.start, dateRange.end),
      getTeamAnalytics(userId, dateRange.start, dateRange.end),
      getAvailabilityInsights(userId, dateRange.start, dateRange.end, timezone),
      getRecentActivity(userId),
    ])

  return (
    <>
      <TimeFilter />
      <KPICards kpis={kpis} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <BookingsOverTimeChart data={bookingsOverTime} />
        </div>
        <StatusDistributionChart data={statusDistribution} />
        <EventTypePopularityChart data={eventTypePopularity} />
      </div>
      <EventTypeAnalyticsTable data={eventTypeAnalytics} timezone={timezone} />
      <TeamAnalyticsSection data={teamAnalytics} />
      <div className="grid gap-4 lg:grid-cols-2">
        <AvailabilityInsights data={insights} />
        <RecentActivity data={activity} timezone={timezone} />
      </div>
    </>
  )
}
