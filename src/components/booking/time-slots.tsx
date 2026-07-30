"use client"

import { useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Slot {
  startTime: string
  endTime: string
}

type NoSlotsReason =
  | "no_availability"
  | "booking_window"
  | "minimum_notice"
  | "daily_limit"
  | "weekly_limit"

interface TimeSlotsProps {
  selectedDate: string
  slots: Slot[]
  isLoading: boolean
  error: string | null
  noSlotsReason?: NoSlotsReason | null
  timezone: string
  onDateChange: (date: string) => void
  onSlotSelect: (slot: Slot) => void
  onTimezoneChange: (tz: string) => void
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
]

function formatTime(iso: string): string {
  const d = new Date(iso)
  const h = d.getUTCHours().toString().padStart(2, "0")
  const m = d.getUTCMinutes().toString().padStart(2, "0")
  return `${h}:${m}`
}

export function TimeSlots({
  selectedDate,
  slots,
  isLoading,
  error,
  noSlotsReason,
  timezone,
  onDateChange,
  onSlotSelect,
  onTimezoneChange,
}: TimeSlotsProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const daysInMonth = useMemo(
    () => new Date(viewYear, viewMonth + 1, 0).getDate(),
    [viewYear, viewMonth],
  )
  const firstDayOfMonth = useMemo(
    () => new Date(viewYear, viewMonth, 1).getDay(),
    [viewYear, viewMonth],
  )

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d)
    }
    return days
  }, [firstDayOfMonth, daysInMonth])

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

  function isSelected(day: number) {
    return makeDateStr(day) === selectedDate
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-col gap-8">
      {/* Timezone picker */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-medium">Select a date</h2>
        <select
          value={timezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          className="h-7 rounded-lg border border-input bg-transparent px-2 text-xs text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz} className="bg-background text-foreground">
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <span className="text-sm font-medium">{monthLabel}</span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px">
          {DAYS.map((day) => (
            <div
              key={day}
              className="pb-1 text-center text-[11px] font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {calendarDays.map((day, i) =>
            day ? (
              <button
                key={i}
                type="button"
                disabled={isPast(day)}
                onClick={() => onDateChange(makeDateStr(day))}
                className={cn(
                  "flex items-center justify-center rounded-lg text-sm transition-all duration-150 h-8",
                  isPast(day) && "cursor-not-allowed text-muted-foreground/30",
                  !isPast(day) &&
                    "hover:bg-muted hover:text-foreground",
                  isSelected(day) &&
                    "bg-brand text-brand-foreground hover:bg-brand hover:text-brand-foreground font-medium",
                  !isPast(day) && !isSelected(day) && "text-foreground",
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

      {/* Time slots */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
            Available times
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && selectedDate && slots.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarDaysIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {noSlotsReason === "booking_window" && "Booking window exceeded"}
              {noSlotsReason === "daily_limit" && "Daily limit reached"}
              {noSlotsReason === "weekly_limit" && "Weekly limit reached"}
              {(!noSlotsReason ||
                noSlotsReason === "no_availability" ||
                noSlotsReason === "minimum_notice") && "No available slots"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {noSlotsReason === "booking_window" &&
                "This date is beyond the booking window. Please select a closer date."}
              {noSlotsReason === "daily_limit" &&
                "The daily booking limit has been reached for this date. Try a different day."}
              {noSlotsReason === "weekly_limit" &&
                "The weekly booking limit has been reached. Try again next week."}
              {noSlotsReason === "minimum_notice" &&
                "The minimum notice period hasn't been met. Try a later time."}
              {(!noSlotsReason || noSlotsReason === "no_availability") &&
                "There are no available times on this date. Try selecting a different day."}
            </p>
          </div>
        </div>
      )}

      {!isLoading && slots.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
            Available times
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((slot, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="justify-center font-mono text-xs tracking-tight transition-all duration-150 hover:border-brand/40 hover:text-brand hover:bg-brand-soft"
                onClick={() => onSlotSelect(slot)}
              >
                {formatTime(slot.startTime)}&ndash;{formatTime(slot.endTime)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!selectedDate && !isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarDaysIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Pick a date</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a date above to see available times.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarDaysIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="18" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="16" y1="14" x2="16" y2="18" />
    </svg>
  )
}
