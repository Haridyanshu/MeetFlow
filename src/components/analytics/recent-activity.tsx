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
  booking_created: "text-emerald-600 dark:text-emerald-400",
  booking_cancelled: "text-destructive",
  booking_rescheduled: "text-amber-600 dark:text-amber-400",
  team_created: "text-blue-600 dark:text-blue-400",
  invitation_sent: "text-purple-600 dark:text-purple-400",
}

function timeAgo(date: Date) {
  const ms = Date.now() - date.getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export function RecentActivity({ data }: { data: ActivityEvent[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
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
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {data.map((event) => {
            const Icon = iconMap[event.type]
            return (
              <div key={event.id} className="flex items-start gap-3 px-(--card-spacing) py-3">
                <Icon className={`mt-0.5 size-4 shrink-0 ${colorMap[event.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{event.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(event.timestamp)}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
