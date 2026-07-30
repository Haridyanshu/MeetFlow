"use client"

import { useCallback, useState } from "react"
import {
  CalendarIcon,
  ClockIcon,
  Loader2Icon,
  VideoIcon,
} from "lucide-react"

import { getAvailableSlotsAction } from "@/lib/actions/bookings"
import {
  cancelBookingByToken,
  rescheduleBookingByToken,
} from "@/lib/actions/booking-management"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface BookingData {
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
    description: string | null
    user: { name: string | null; email: string }
  }
}

interface ManageBookingClientProps {
  booking: BookingData
  token: string
}

interface Slot {
  startTime: string
  endTime: string
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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

function formatTimeShort(iso: string): string {
  const d = new Date(iso)
  const h = d.getUTCHours().toString().padStart(2, "0")
  const m = d.getUTCMinutes().toString().padStart(2, "0")
  return `${h}:${m}`
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
  const [confirmCancel, setConfirmCancel] = useState(false)

  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  const today = new Date()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  function isPast(day: number) {
    const d = new Date(viewYear, viewMonth, day)
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)
    return d < endOfToday
  }

  function makeDateStr(day: number) {
    const m = String(viewMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${viewYear}-${m}-${d}`
  }

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
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <XCircleIcon className="size-6" />
          </div>
          <h1 className="text-lg font-heading font-medium">Booking Cancelled</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your booking for <strong>{booking.eventType.title}</strong> has been cancelled.
          </p>
        </div>
      </div>
    )
  }

  if (rescheduled) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <CheckIcon className="size-6" />
          </div>
          <h1 className="text-lg font-heading font-medium">Booking Rescheduled</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your booking for <strong>{booking.eventType.title}</strong> has been rescheduled. A confirmation email has been sent.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-start justify-center bg-background p-4 pt-12">
      <div className="w-full max-w-lg space-y-6">

        {/* Current booking card */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-heading font-medium">{booking.eventType.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                with {booking.guestName}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
              Confirmed
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 shrink-0" />
              <span>{formatDate(booking.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4 shrink-0" />
              <span>{formatTime(booking.startTime)} &ndash; {formatTime(booking.endTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <GlobeIcon className="size-4 shrink-0" />
              <span>{booking.timezone}</span>
            </div>
            <div className="text-muted-foreground ml-6">
              {booking.eventType.duration} min
            </div>
            {booking.assignedUser && (
              <div className="text-muted-foreground ml-6">
                Host: {booking.assignedUser.name ?? booking.assignedUser.email}
              </div>
            )}
            {booking.meetingUrl && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-brand/15 bg-brand-soft/50 px-3 py-2">
                <VideoIcon className="size-4 shrink-0 text-brand" />
                <a
                  href={booking.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  Join Meeting
                </a>
              </div>
            )}
            {booking.paymentStatus && booking.paymentStatus !== "FREE" && (
              <div className="text-muted-foreground ml-6">
                Payment: <span className="font-medium capitalize">{booking.paymentStatus.toLowerCase()}</span>
                {booking.amountPaid != null && (
                  <span> &mdash; {(booking.currency ?? "usd").toUpperCase()} {(booking.amountPaid / 100).toFixed(2)}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Reschedule section */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-base font-heading font-medium">Reschedule</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Select a new date and time.
          </p>

          <div className="mt-5">
            {/* Calendar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
                    else setViewMonth(m => m - 1)
                  }}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <span className="text-sm font-medium">
                  {new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
                    else setViewMonth(m => m + 1)
                  }}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-px">
                {DAYS.map((day) => (
                  <div key={day} className="pb-1 text-center text-[11px] font-medium text-muted-foreground">{day}</div>
                ))}
                {calendarDays.map((day, i) =>
                  day ? (
                    <button
                      key={i}
                      type="button"
                      disabled={isPast(day)}
                      onClick={() => handleDateChange(makeDateStr(day))}
                      className={cn(
                        "flex items-center justify-center rounded-lg text-sm transition-all duration-150 h-8",
                        isPast(day) && "cursor-not-allowed text-muted-foreground/30",
                        !isPast(day) && "hover:bg-muted hover:text-foreground",
                        selectedDate === makeDateStr(day) && "bg-brand text-brand-foreground hover:bg-brand hover:text-brand-foreground font-medium",
                        !isPast(day) && selectedDate !== makeDateStr(day) && "text-foreground",
                      )}
                    >
                      {day}
                    </button>
                  ) : (
                    <div key={i} />
                  ),
                )}
              </div>
            </div>

            {/* Slots */}
            {isLoadingSlots && (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Available times</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-7 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              </div>
            )}

            {!isLoadingSlots && slots.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Available times</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slot, i) => {
                    const isSel = selectedSlot?.startTime === slot.startTime
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-mono transition-all duration-150",
                          isSel
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-border bg-transparent text-foreground hover:border-brand/40 hover:text-brand hover:bg-brand-soft",
                        )}
                      >
                        {formatTimeShort(slot.startTime)}&ndash;{formatTimeShort(slot.endTime)}
                      </button>
                    )
                  })}
                </div>
                <Button
                  onClick={handleReschedule}
                  disabled={!selectedSlot || isRescheduling}
                  className="mt-2 w-full"
                  size="sm"
                >
                  {isRescheduling && <Loader2Icon className="size-4 animate-spin" />}
                  Confirm new time
                </Button>
              </div>
            )}

            {!isLoadingSlots && selectedDate && slots.length === 0 && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                No available slots on this date.
              </p>
            )}
          </div>
        </div>

        {/* Cancel section */}
        <div className="rounded-xl border border-destructive/15 bg-card p-5">
          <h2 className="text-base font-heading font-medium">Cancel booking</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          {!confirmCancel ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmCancel(true)}
              className="mt-4"
            >
              Cancel this booking
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-xs text-destructive font-medium">
                Are you sure? This will permanently cancel your booking.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1"
                >
                  {isCancelling && <Loader2Icon className="size-3.5 animate-spin" />}
                  Yes, cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmCancel(false)}
                  className="flex-1"
                >
                  Keep booking
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
