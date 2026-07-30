"use client"

import { useCallback, useState } from "react"
import {
  CalendarIcon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react"

import { getAvailableSlotsAction } from "@/lib/actions/bookings"
import {
  cancelBookingByToken,
  rescheduleBookingByToken,
} from "@/lib/actions/booking-management"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface BookingData {
  id: string
  startTime: Date
  endTime: Date
  guestName: string
  guestEmail: string
  guestNotes: string | null
  timezone: string
  status: string
  eventType: {
    id: string
    title: string
    duration: number
    description: string | null
    user: { name: string | null; email: string }
  }
}

interface ManageBookingClientProps {
  booking: BookingData
  token: string
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  })
}

interface Slot {
  startTime: string
  endTime: string
}

export function ManageBookingClient({
  booking,
  token,
}: ManageBookingClientProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState(false)
  const [rescheduled, setRescheduled] = useState(false)

  const handleDateChange = useCallback(
    async (date: string) => {
      setSelectedDate(date)
      setSelectedSlot(null)
      setSlots([])
      setError(null)
      setIsLoadingSlots(true)

      try {
        const result = await getAvailableSlotsAction(
          booking.eventType.id,
          date,
        )
        setError(null)
        if (result.noSlotsReason) {
          setSlots([])
          setError(
            result.noSlotsReason === "booking_window"
              ? "This date is beyond the booking window."
              : result.noSlotsReason === "daily_limit"
                ? "Daily booking limit reached for this date."
                : result.noSlotsReason === "weekly_limit"
                  ? "Weekly booking limit reached."
                  : "No available slots on this date.",
          )
        } else {
          setSlots(
            result.slots.filter(
              (s) =>
                s.startTime !== booking.startTime.toISOString() ||
                s.endTime !== booking.endTime.toISOString(),
            ),
          )
        }
      } catch {
        setError("Failed to load available slots.")
      } finally {
        setIsLoadingSlots(false)
      }
    },
    [booking.eventType.id, booking.startTime, booking.endTime],
  )

  async function handleCancel() {
    setIsCancelling(true)
    setError(null)

    const result = await cancelBookingByToken(token)

    if (!result.ok) {
      setError("Unable to cancel this booking.")
      setIsCancelling(false)
      return
    }

    setCancelled(true)
    setIsCancelling(false)
  }

  async function handleReschedule() {
    if (!selectedSlot) return

    setIsRescheduling(true)
    setError(null)

    const result = await rescheduleBookingByToken(
      token,
      selectedSlot.startTime,
      selectedSlot.endTime,
    )

    if (!result.ok) {
      if (result.error === "unavailable" || result.error === "conflict") {
        setError("This slot is no longer available. Please select another.")
        setSelectedSlot(null)
        setSlots([])
        setSelectedDate("")
      } else if (result.error === "past") {
        setError("Cannot reschedule to a past time.")
      } else if (result.error === "cancelled") {
        setError("This booking has been cancelled.")
      } else {
        setError("Failed to reschedule. Please try again.")
      }
      setIsRescheduling(false)
      return
    }

    setRescheduled(true)
    setIsRescheduling(false)
  }

  if (cancelled) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Booking Cancelled</CardTitle>
            <CardDescription>
              Your booking for <strong>{booking.eventType.title}</strong> has
              been cancelled.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (rescheduled) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Booking Rescheduled</CardTitle>
            <CardDescription>
              Your booking for <strong>{booking.eventType.title}</strong> has
              been rescheduled. A confirmation email has been sent.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-start justify-center p-4 pt-12">
      <div className="w-full max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{booking.eventType.title}</CardTitle>
                <CardDescription>
                  with {booking.guestName}
                </CardDescription>
              </div>
              <Badge variant="success">Confirmed</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="size-4 shrink-0" />
                <span>{formatDate(booking.startTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClockIcon className="size-4 shrink-0" />
                <span>
                  {formatTime(booking.startTime)} &ndash;{" "}
                  {formatTime(booking.endTime)}
                </span>
              </div>
              <div className="text-muted-foreground">
                Timezone: {booking.timezone}
              </div>
              <div className="text-muted-foreground">
                Duration: {booking.eventType.duration} min
              </div>
              <div className="text-muted-foreground">
                Host:{" "}
                {booking.eventType.user.name ?? booking.eventType.user.email}
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Reschedule</CardTitle>
            <CardDescription>
              Select a new date and time for this booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reschedule-date"
                className="text-sm font-medium text-muted-foreground"
              >
                Date
              </label>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reschedule-date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent py-1 pl-8 pr-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>

            {isLoadingSlots && (
              <div className="flex items-center justify-center py-4">
                <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoadingSlots && slots.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Available times
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slot, i) => {
                    const d = new Date(slot.startTime)
                    const h = d.getUTCHours().toString().padStart(2, "0")
                    const m = d.getUTCMinutes().toString().padStart(2, "0")
                    const de = new Date(slot.endTime)
                    const he = de.getUTCHours().toString().padStart(2, "0")
                    const me = de.getUTCMinutes().toString().padStart(2, "0")
                    const isSelected =
                      selectedSlot?.startTime === slot.startTime
                    return (
                      <Button
                        key={i}
                        variant={isSelected ? "default" : "outline"}
                        className="justify-center font-mono text-sm"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {h}:{m}&ndash;{he}:{me}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  onClick={handleReschedule}
                  disabled={!selectedSlot || isRescheduling}
                  className="mt-2 w-full"
                >
                  {isRescheduling && (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  )}
                  Confirm new time
                </Button>
              </div>
            )}

            {!isLoadingSlots && selectedDate && slots.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No available slots on this date.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cancel Booking</CardTitle>
            <CardDescription>
              This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full"
            >
              {isCancelling && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              <XCircleIcon className="mr-2 size-4" />
              Cancel this booking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
