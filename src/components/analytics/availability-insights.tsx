"use client"

import { ClockIcon, CalendarDaysIcon, TimerIcon, CalendarIcon, LightbulbIcon } from "lucide-react"
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
      value: data.mostBookedWeekday ?? "\u2014",
      hint: "Busiest day of the week",
    },
    {
      icon: ClockIcon,
      label: "Most booked hour",
      value: data.mostBookedHour ?? "\u2014",
      hint: "Peak booking time",
    },
    {
      icon: TimerIcon,
      label: "Avg notice period",
      value: data.avgNoticePeriod != null ? `${data.avgNoticePeriod}h` : "\u2014",
      hint: "Time between booking and meeting",
    },
    {
      icon: CalendarIcon,
      label: "Avg lead time",
      value: data.avgLeadTime != null ? `${data.avgLeadTime}h` : "\u2014",
      hint: "How far in advance people book",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LightbulbIcon className="size-4 text-brand" />
          <CardTitle>Availability insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:bg-muted/20"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground truncate mt-0.5">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{item.hint}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
