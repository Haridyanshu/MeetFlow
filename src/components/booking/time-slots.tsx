import { Loader2Icon, CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Slot {
  startTime: string
  endTime: string
}

type NoSlotsReason = "no_availability" | "booking_window" | "minimum_notice" | "daily_limit" | "weekly_limit"

interface TimeSlotsProps {
  selectedDate: string
  slots: Slot[]
  isLoading: boolean
  error: string | null
  noSlotsReason?: NoSlotsReason | null
  onDateChange: (date: string) => void
  onSlotSelect: (slot: Slot) => void
}

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
  onDateChange,
  onSlotSelect,
}: TimeSlotsProps) {
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-heading font-medium">Select a date</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a day for your meeting.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="booking-date"
          className="text-sm font-medium text-muted-foreground"
        >
          Date
        </label>
        <div className="relative">
          <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="booking-date"
            type="date"
            min={today}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent py-1 pl-8 pr-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {!isLoading && selectedDate && slots.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
          <CalendarIcon className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            {noSlotsReason === "booking_window" && "Booking Window Exceeded"}
            {noSlotsReason === "daily_limit" && "Daily Limit Reached"}
            {noSlotsReason === "weekly_limit" && "Weekly Limit Reached"}
            {!noSlotsReason || noSlotsReason === "no_availability" || noSlotsReason === "minimum_notice" ? "No Available Slots" : "No Available Slots"}
          </p>
          <p className="text-sm text-muted-foreground">
            {noSlotsReason === "booking_window" && "This date is beyond the booking window. Please select a date within the allowed range."}
            {noSlotsReason === "daily_limit" && "The daily booking limit has been reached for this date. Please try a different day."}
            {noSlotsReason === "weekly_limit" && "The weekly booking limit has been reached. Please try again next week."}
            {noSlotsReason === "minimum_notice" && "The minimum notice period has not been met. Try selecting a later time."}
            {(!noSlotsReason || noSlotsReason === "no_availability") && "There are no available times on this date. Try selecting a different day."}
          </p>
        </div>
      )}

      {slots.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            Available times
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((slot, i) => (
              <Button
                key={i}
                variant="outline"
                className="justify-center font-mono text-sm"
                onClick={() => onSlotSelect(slot)}
              >
                {formatTime(slot.startTime)}&ndash;{formatTime(slot.endTime)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!selectedDate && !isLoading && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
          <CalendarIcon className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Pick a date</p>
          <p className="text-sm text-muted-foreground">
            Select a date to see available times.
          </p>
        </div>
      )}
    </div>
  )
}
