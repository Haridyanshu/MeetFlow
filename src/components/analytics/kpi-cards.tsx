"use client"

import {
  CalendarCheckIcon,
  CalendarIcon,
  CalendarX2Icon,
  ClockIcon,
  DollarSignIcon,
  RefreshCwIcon,
  LayersIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KPIs {
  totalBookings: number
  totalBookingsPrev: number
  upcomingBookings: number
  completedBookings: number
  cancelledBookings: number
  rescheduledBookings: number
  activeEventTypes: number
  revenue: number
}

function ChangeBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    if (current === 0) return null
    return <span className="text-xs text-emerald-600 dark:text-emerald-400">New</span>
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return <span className="text-xs text-muted-foreground">0%</span>
  return (
    <span className={`text-xs ${pct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
      {pct > 0 ? "+" : ""}{pct}%
    </span>
  )
}

const cards = [
  { key: "totalBookings", label: "Total Bookings", icon: CalendarCheckIcon },
  { key: "upcomingBookings", label: "Upcoming", icon: CalendarIcon },
  { key: "completedBookings", label: "Completed", icon: ClockIcon },
  { key: "cancelledBookings", label: "Cancelled", icon: CalendarX2Icon },
  { key: "rescheduledBookings", label: "Rescheduled", icon: RefreshCwIcon },
  { key: "activeEventTypes", label: "Active Event Types", icon: LayersIcon },
  { key: "revenue", label: "Revenue", icon: DollarSignIcon },
] as const

function kpiValue(key: string, kpis: KPIs): number {
  switch (key) {
    case "totalBookings": return kpis.totalBookings
    case "upcomingBookings": return kpis.upcomingBookings
    case "completedBookings": return kpis.completedBookings
    case "cancelledBookings": return kpis.cancelledBookings
    case "rescheduledBookings": return kpis.rescheduledBookings
    case "activeEventTypes": return kpis.activeEventTypes
    case "revenue": return kpis.revenue
    default: return 0
  }
}

function kpiDisplay(key: string, value: number): string {
  if (key === "revenue") {
    return `$${(value / 100).toFixed(2)}`
  }
  return value.toLocaleString()
}

function prevValue(key: string, kpis: KPIs): number {
  if (key === "activeEventTypes") return 0
  switch (key) {
    case "totalBookings": return kpis.totalBookingsPrev
    default: return 0
  }
}

export function KPICards({ kpis }: { kpis: KPIs }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon
        const value = kpiValue(card.key, kpis)
        const prev = prevValue(card.key, kpis)

        return (
          <Card key={card.key}>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <Icon className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-normal">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums">{kpiDisplay(card.key, value)}</span>
                <ChangeBadge current={value} previous={prev} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
