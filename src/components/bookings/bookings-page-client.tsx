"use client"

import { useTransition } from "react"
import {
  CalendarCheckIcon,
  CalendarIcon,
  ClockIcon,
  Loader2Icon,
  VideoIcon,
  XCircleIcon,
} from "lucide-react"

import { cancelBooking } from "@/lib/actions/bookings"
import { toast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

interface Booking {
  id: string
  startTime: Date
  endTime: Date
  guestName: string
  guestEmail: string
  guestNotes: string | null
  timezone: string
  status: string
  meetingUrl: string | null
  meetingProvider: string | null
  paymentStatus: string | null
  amountPaid: number | null
  currency: string | null
  assignedUser?: { id: string; name: string | null; email: string } | null
  eventType: {
    id: string
    title: string
    duration: number
  }
}

interface BookingsPageClientProps {
  upcoming: Booking[]
  past: Booking[]
}

function formatTime(iso: Date): string {
  return iso.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  })
}

function formatDate(iso: Date): string {
  return iso.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

function BookingCard({
  booking,
  isPast,
}: {
  booking: Booking
  isPast: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    startTransition(async () => {
      await cancelBooking(booking.id)
      toast.add({
        title: "Booking cancelled",
        description: `Booking with ${booking.guestName} has been cancelled.`,
        type: "success",
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>{booking.eventType.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {booking.assignedUser ? `with ${booking.assignedUser.name ?? booking.assignedUser.email}` : `with ${booking.guestName} (${booking.guestEmail})`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {booking.meetingProvider && (
              <Badge variant="outline" className="gap-1 text-xs">
                <VideoIcon className="size-3" />
                Google Meet
              </Badge>
            )}
            {booking.paymentStatus && booking.paymentStatus !== "FREE" && (
              <Badge variant="outline" className="gap-1 text-xs capitalize">
                {booking.paymentStatus.toLowerCase()}
              </Badge>
            )}
            <Badge variant={isPast ? "secondary" : "success"}>
              {isPast ? "Completed" : "Confirmed"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarIcon className="size-3.5" />
            {formatDate(booking.startTime)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3.5" />
            {formatTime(booking.startTime)} &ndash;{" "}
            {formatTime(booking.endTime)}
          </span>
          <span className="inline-flex items-center gap-1">
            {booking.eventType.duration} min
          </span>
          {booking.meetingUrl && (
            <span className="inline-flex items-center gap-1">
              <a
                href={booking.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted hover:text-foreground h-6 gap-1 px-2"
              >
                <VideoIcon className="size-3" />
                Join
              </a>
            </span>
          )}
          {!isPast && (
            <Button
              variant="destructive"
              size="xs"
              onClick={handleCancel}
              disabled={isPending}
              className="ml-auto"
            >
              {isPending ? (
                <Loader2Icon className="size-3 animate-spin" />
              ) : (
                <XCircleIcon className="size-3" />
              )}
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function BookingsPageClient({
  upcoming,
  past,
}: BookingsPageClientProps) {
  const totalBookings = upcoming.length + past.length

  if (totalBookings === 0) {
    return (
      <EmptyState
        icon={<CalendarCheckIcon />}
        title="No bookings yet"
        description="When someone books a meeting with you, it will appear here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {upcoming.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-heading font-medium">
            Upcoming ({upcoming.length})
          </h2>
          {upcoming.map((booking) => (
            <BookingCard key={booking.id} booking={booking} isPast={false} />
          ))}
        </div>
      )}
      {past.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-heading font-medium">
            Past ({past.length})
          </h2>
          {past.map((booking) => (
            <BookingCard key={booking.id} booking={booking} isPast={true} />
          ))}
        </div>
      )}
    </div>
  )
}
