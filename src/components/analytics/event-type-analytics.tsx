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
            description="Create event types to see analytics."
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
              <tr className="border-b text-left">
                {columns.map((col) => (
                  <th key={col.key} className="px-(--card-spacing) py-3 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      <ArrowUpDownIcon className="ml-1 size-3" />
                    </Button>
                  </th>
                ))}
                <th className="px-(--card-spacing) py-3 text-right font-medium text-muted-foreground">Last booking</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-(--card-spacing) py-3">
                    <div className="flex items-center gap-2">
                      <span>{row.title}</span>
                      <Badge variant={row.isActive ? "success" : "secondary"}>
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-(--card-spacing) py-3 tabular-nums">{row.totalBookings}</td>
                  <td className="px-(--card-spacing) py-3 tabular-nums">{row.completionRate}%</td>
                  <td className="px-(--card-spacing) py-3 tabular-nums">{row.cancellationRate}%</td>
                  <td className="px-(--card-spacing) py-3 tabular-nums">{row.avgDuration} min</td>
                  <td className="px-(--card-spacing) py-3 text-right tabular-nums text-muted-foreground">
                    {row.lastBooking ? row.lastBooking.toLocaleDateString() : "—"}
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
