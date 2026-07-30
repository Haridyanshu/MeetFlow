"use client"

import {
  CalendarCheckIcon,
  CalendarIcon,
  CalendarX2Icon,
  ClockIcon,
  DollarSignIcon,
  RefreshCwIcon,
  LayersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-brand">
        <MinusIcon className="size-3" />New
      </span>
    )
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return <span className="text-xs text-muted-foreground">0%</span>
  const isPositive = pct > 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isPositive ? "text-brand" : "text-destructive",
      )}
    >
      {isPositive ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
      {isPositive ? "+" : ""}{pct}%
    </span>
  )
}

interface KpiCardConfig {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  priority: number
}

const cardConfigs: KpiCardConfig[] = [
  { key: "revenue", label: "Revenue", icon: DollarSignIcon, iconBg: "bg-brand-soft", iconColor: "text-brand", priority: 1 },
  { key: "totalBookings", label: "Total Bookings", icon: CalendarCheckIcon, iconBg: "bg-brand-soft", iconColor: "text-brand", priority: 2 },
  { key: "completedBookings", label: "Completed", icon: ClockIcon, iconBg: "bg-brand-soft/60", iconColor: "text-brand", priority: 3 },
  { key: "upcomingBookings", label: "Upcoming", icon: CalendarIcon, iconBg: "bg-muted", iconColor: "text-muted-foreground", priority: 4 },
  { key: "cancelledBookings", label: "Cancelled", icon: CalendarX2Icon, iconBg: "bg-destructive/10", iconColor: "text-destructive", priority: 5 },
  { key: "rescheduledBookings", label: "Rescheduled", icon: RefreshCwIcon, iconBg: "bg-muted", iconColor: "text-muted-foreground", priority: 6 },
  { key: "activeEventTypes", label: "Active Events", icon: LayersIcon, iconBg: "bg-muted", iconColor: "text-muted-foreground", priority: 7 },
]

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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
      {cardConfigs.map((cfg) => {
        const Icon = cfg.icon
        const value = kpiValue(cfg.key, kpis)
        const prev = prevValue(cfg.key, kpis)

        return (
          <Card key={cfg.key} className={cn(cfg.key === "revenue" && "sm:col-span-2 lg:col-span-1")}>
            <CardContent className="flex flex-col gap-2.5 p-4">
              <div className="flex items-center justify-between">
                <div className={cn("flex size-8 items-center justify-center rounded-lg", cfg.iconBg)}>
                  <Icon className={cn("size-4", cfg.iconColor)} />
                </div>
                <ChangeBadge current={value} previous={prev} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight">
                  {kpiDisplay(cfg.key, value)}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
