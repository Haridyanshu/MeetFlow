"use client"

import { useState, useCallback } from "react"

import { EventInfoPanel } from "@/components/booking/event-info-panel"
import { TimeSlots } from "@/components/booking/time-slots"
import { BookingForm } from "@/components/booking/booking-form"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"
import type { BookingConfirmationProps } from "@/components/booking/booking-confirmation"
import { getAvailableSlotsAction } from "@/lib/actions/bookings"

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
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [booking, setBooking] = useState<unknown>(null)

  const handleDateChange = useCallback(
    async (date: string) => {
      setSelectedDate(date)
      setSelectedSlot(null)
      setIsLoadingSlots(true)
      setSlotsError(null)

      try {
        const result = await getAvailableSlotsAction(eventType.id, date)
        setSlots(result)
      } catch {
        setSlotsError("Failed to load available slots. Please try again.")
      } finally {
        setIsLoadingSlots(false)
      }
    },
    [eventType.id]
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

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 md:grid-cols-[400px_1fr]">
      <EventInfoPanel
        eventType={eventType}
        host={host}
        selectedSlot={selectedSlot}
        step={step}
      />
      <main className="flex flex-col p-6 md:p-10">
        {step === "date" && (
          <TimeSlots
            selectedDate={selectedDate}
            slots={slots}
            isLoading={isLoadingSlots}
            error={slotsError}
            onDateChange={handleDateChange}
            onSlotSelect={handleSlotSelect}
          />
        )}
        {step === "form" && selectedSlot && (
          <BookingForm
            eventTypeId={eventType.id}
            selectedSlot={selectedSlot}
            onSuccess={handleBookingSuccess}
            onBack={handleBackToSlots}
          />
        )}
        {step === "confirmation" && (
          <BookingConfirmation
            booking={booking as BookingConfirmationProps["booking"]}
            eventType={eventType}
          />
        )}
      </main>
    </div>
  )
}
