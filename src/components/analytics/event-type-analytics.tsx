"use client"

import { useState } from "react"
import { ArrowUpDownIcon, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

interface EventTypeRow {
  id: string
  title: string
  duration: number
  isActive: boolean
  totalBookings: number
  completionRate: number
  cancellationRate: number
  avgDuration: number
  lastBooking: Date | null
}

type SortKey = keyof Pick<EventTypeRow, "title" | "totalBookings" | "completionRate" | "cancellationRate" | "avgDuration">

export function EventTypeAnalyticsTable({ data }: { data: EventTypeRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("totalBookings")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event type analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<CalendarIcon />}
            title="No event types"
            description="Create event types to see detailed analytics."
          />
        </CardContent>
      </Card>
    )
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (aVal == null) return 1
    if (bVal == null) return -1
    if (typeof aVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
    }
    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  const columns: { key: SortKey; label: string }[] = [
    { key: "title", label: "Event Type" },
    { key: "totalBookings", label: "Bookings" },
    { key: "completionRate", label: "Completed" },
    { key: "cancellationRate", label: "Cancelled" },
    { key: "avgDuration", label: "Avg Duration" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event type analytics</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {columns.map((col) => (
                  <th key={col.key} className="px-(--card-spacing) py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      <ArrowUpDownIcon className="ml-1 size-3" />
                    </Button>
                  </th>
                ))}
                <th className="px-(--card-spacing) py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Last booking</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-(--card-spacing) py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-md bg-brand-soft text-brand">
                        <CalendarIcon className="size-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{row.title}</span>
                        <span className="text-[11px] text-muted-foreground">{row.duration} min</span>
                      </div>
                      <Badge variant={row.isActive ? "brand" : "secondary"} className="px-1.5 py-0 text-[10px]">
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-(--card-spacing) py-3 tabular-nums font-medium">{row.totalBookings}</td>
                  <td className="px-(--card-spacing) py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand transition-all"
                          style={{ width: `${row.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">{row.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-(--card-spacing) py-3 tabular-nums text-muted-foreground">{row.cancellationRate}%</td>
                  <td className="px-(--card-spacing) py-3 tabular-nums text-muted-foreground">{row.avgDuration} min</td>
                  <td className="px-(--card-spacing) py-3 text-right tabular-nums text-muted-foreground text-xs">
                    {row.lastBooking ? row.lastBooking.toLocaleDateString() : "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
