"use client"

import {
  CalendarPlusIcon,
  CalendarX2Icon,
  RefreshCwIcon,
  UsersIcon,
  MailIcon,
  ActivityIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { formatRelativeTime } from "@/lib/date"

interface ActivityEvent {
  id: string
  type: "booking_created" | "booking_cancelled" | "booking_rescheduled" | "team_created" | "invitation_sent"
  description: string
  timestamp: Date
}

const iconMap: Record<ActivityEvent["type"], React.ComponentType<{ className?: string }>> = {
  booking_created: CalendarPlusIcon,
  booking_cancelled: CalendarX2Icon,
  booking_rescheduled: RefreshCwIcon,
  team_created: UsersIcon,
  invitation_sent: MailIcon,
}

const colorMap: Record<ActivityEvent["type"], string> = {
  booking_created: "text-brand",
  booking_cancelled: "text-destructive",
  booking_rescheduled: "text-warning",
  team_created: "text-brand",
  invitation_sent: "text-muted-foreground",
}

const bgMap: Record<ActivityEvent["type"], string> = {
  booking_created: "bg-brand-soft",
  booking_cancelled: "bg-destructive/10",
  booking_rescheduled: "bg-warning/10",
  team_created: "bg-brand-soft/60",
  invitation_sent: "bg-muted",
}

export function RecentActivity({ data, timezone }: { data: ActivityEvent[]; timezone: string }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ActivityIcon className="size-4 text-brand" />
            <CardTitle>Recent activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<ActivityIcon />}
            title="No recent activity"
            description="Activity will appear here as you use MeetFlow."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ActivityIcon className="size-4 text-brand" />
          <CardTitle>Recent activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {data.map((event) => {
            const Icon = iconMap[event.type]
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 px-(--card-spacing) py-3 transition-colors hover:bg-muted/20"
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${bgMap[event.type]}`}
                >
                  <Icon className={`size-4 ${colorMap[event.type]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{event.description}</p>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground pt-0.5">
                  {formatRelativeTime(event.timestamp, timezone)}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
