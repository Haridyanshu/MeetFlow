"use client"

import { useState, useCallback } from "react"

import { EventInfoPanel } from "@/components/booking/event-info-panel"
import { TimeSlots } from "@/components/booking/time-slots"
import { BookingForm } from "@/components/booking/booking-form"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"
import type { BookingConfirmationProps } from "@/components/booking/booking-confirmation"
import { getAvailableSlotsAction } from "@/lib/actions/bookings"
import { detectClientTimeZone } from "@/lib/date"

interface EventTypeData {
  id: string
  title: string
  description: string | null
  duration: number
  location: string | null
}

interface HostData {
  name: string | null
  email: string
  image: string | null
}

interface Slot {
  startTime: string
  endTime: string
}

interface BookingPageClientProps {
  eventType: EventTypeData
  host: HostData
}

type Step = "date" | "form" | "confirmation"

export function BookingPageClient({
  eventType,
  host,
}: BookingPageClientProps) {
  const [step, setStep] = useState<Step>("date")
  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [noSlotsReason, setNoSlotsReason] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [booking, setBooking] = useState<unknown>(null)
  const [timezone, setTimezone] = useState(
    () => detectClientTimeZone(),
  )

  const handleDateChange = useCallback(
    async (date: string) => {
      setSelectedDate(date)
      setSelectedSlot(null)
      setIsLoadingSlots(true)
      setSlotsError(null)
      setNoSlotsReason(null)

      try {
        const result = await getAvailableSlotsAction(eventType.id, date, timezone)
        setSlots(result.slots)
        if (result.noSlotsReason) setNoSlotsReason(result.noSlotsReason)
      } catch {
        setSlotsError("Failed to load available slots. Please try again.")
      } finally {
        setIsLoadingSlots(false)
      }
    },
    [eventType.id, timezone],
  )

  const handleSlotSelect = useCallback((slot: Slot) => {
    setSelectedSlot(slot)
    setStep("form")
  }, [])

  const handleBookingSuccess = useCallback((booking: unknown) => {
    setBooking(booking)
    setStep("confirmation")
  }, [])

  const handleBackToSlots = useCallback(() => {
    setSelectedSlot(null)
    setStep("date")
  }, [])

  const handleTimezoneChange = useCallback(
    async (nextTimezone: string) => {
      setTimezone(nextTimezone)
      if (selectedDate) {
        setIsLoadingSlots(true)
        setSlotsError(null)
        setNoSlotsReason(null)
        try {
          const result = await getAvailableSlotsAction(eventType.id, selectedDate, nextTimezone)
          setSlots(result.slots)
          if (result.noSlotsReason) setNoSlotsReason(result.noSlotsReason)
        } catch {
          setSlotsError("Failed to load available slots. Please try again.")
        } finally {
          setIsLoadingSlots(false)
        }
      }
    },
    [eventType.id, selectedDate],
  )

  return (
    <div className="mx-auto grid min-h-dvh max-w-5xl grid-cols-1 md:grid-cols-[360px_1fr]">
      <EventInfoPanel
        eventType={eventType}
        host={host}
        selectedSlot={selectedSlot}
        step={step}
        timezone={timezone}
      />
      <main className="flex flex-col p-6 pt-8 md:p-10">
        <div className="mx-auto w-full max-w-md transition-all duration-300">
          {step === "date" && (
            <TimeSlots
              selectedDate={selectedDate}
              slots={slots}
              isLoading={isLoadingSlots}
              error={slotsError}
              noSlotsReason={
                noSlotsReason as
                  | "no_availability"
                  | "booking_window"
                  | "minimum_notice"
                  | "daily_limit"
                  | "weekly_limit"
                  | null
                  | undefined
              }
              timezone={timezone}
              onDateChange={handleDateChange}
              onSlotSelect={handleSlotSelect}
              onTimezoneChange={handleTimezoneChange}
            />
          )}
          {step === "form" && selectedSlot && (
            <BookingForm
              eventTypeId={eventType.id}
              eventTitle={eventType.title}
              eventDuration={eventType.duration}
              selectedSlot={selectedSlot}
              timezone={timezone}
              onSuccess={handleBookingSuccess}
              onBack={handleBackToSlots}
            />
          )}
          {step === "confirmation" && (
            <BookingConfirmation
              booking={booking as BookingConfirmationProps["booking"]}
              eventType={eventType}
              timezone={timezone}
            />
          )}
        </div>
      </main>
    </div>
  )
}
