"use client"

import { ClockIcon, CalendarDaysIcon, TimerIcon, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Insights {
  mostBookedWeekday: string | null
  mostBookedHour: string | null
  avgNoticePeriod: number | null
  avgLeadTime: number | null
}

export function AvailabilityInsights({ data }: { data: Insights }) {
  const items = [
    {
      icon: CalendarDaysIcon,
      label: "Most booked day",
      value: data.mostBookedWeekday ?? "—",
    },
    {
      icon: ClockIcon,
      label: "Most booked hour",
      value: data.mostBookedHour ?? "—",
    },
    {
      icon: TimerIcon,
      label: "Avg notice period",
      value: data.avgNoticePeriod != null ? `${data.avgNoticePeriod}h` : "—",
    },
    {
      icon: CalendarIcon,
      label: "Avg lead time",
      value: data.avgLeadTime != null ? `${data.avgLeadTime}h` : "—",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-3">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium truncate">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
