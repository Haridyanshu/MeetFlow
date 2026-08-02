"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, ArrowLeftIcon } from "lucide-react"
import { formatInTimeZone } from "date-fns-tz"

import { createBookingSchema } from "@/lib/schemas/booking"
import type { CreateBookingInput } from "@/lib/schemas/booking"
import { createBooking } from "@/lib/actions/bookings"
import { resolveTimeZone } from "@/lib/date"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface BookingFormProps {
  eventTypeId: string
  eventTitle: string
  eventDuration: number
  selectedSlot: { startTime: string; endTime: string }
  timezone: string
  onSuccess: (booking: unknown) => void
  onBack: () => void
}

function formatTime(iso: string, timeZone: string): string {
  return formatInTimeZone(new Date(iso), resolveTimeZone(timeZone), "HH:mm")
}

function formatDate(iso: string, timeZone: string): string {
  return formatInTimeZone(new Date(iso), resolveTimeZone(timeZone), "EEEE, MMMM d, yyyy")
}

export function BookingForm({
  eventTypeId,
  eventTitle,
  eventDuration,
  selectedSlot,
  timezone,
  onSuccess,
  onBack,
}: BookingFormProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      eventTypeId,
      guestName: "",
      guestEmail: "",
      guestNotes: "",
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      timezone,
    },
  })

  async function onSubmit(data: CreateBookingInput) {
    startTransition(async () => {
      const result = await createBooking(data)

      if (result && "errors" in result && result.errors) {
        for (const [field, messages] of Object.entries(result.errors)) {
          const message = Array.isArray(messages) ? messages[0] : messages
          setError(field as keyof CreateBookingInput, { message })
        }
        return
      }

      if (result && "booking" in result) {
        onSuccess(result.booking)
      }
    })
  }

  const dateLabel = formatDate(selectedSlot.startTime, timezone)
  const timeLabel = `${formatTime(selectedSlot.startTime, timezone)} \u2013 ${formatTime(selectedSlot.endTime, timezone)}`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-heading font-medium">Enter your details</h2>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{eventTitle}</span>
          <span className="text-muted-foreground/40">&middot;</span>
          <span>{eventDuration} min</span>
          <span className="text-muted-foreground/40">&middot;</span>
          <span>{dateLabel}</span>
          <span className="text-muted-foreground/40">&middot;</span>
          <span className="font-mono text-xs">{timeLabel}</span>
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="guestName">Name</Label>
          <Input
            id="guestName"
            placeholder="Your name"
            {...register("guestName")}
            className="h-9"
          />
          {errors.guestName && (
            <p className="text-xs text-destructive">
              {errors.guestName.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="guestEmail">Email</Label>
          <Input
            id="guestEmail"
            type="email"
            placeholder="you@example.com"
            {...register("guestEmail")}
            className="h-9"
          />
          {errors.guestEmail && (
            <p className="text-xs text-destructive">
              {errors.guestEmail.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="guestNotes">Notes (optional)</Label>
          <Textarea
            id="guestNotes"
            placeholder="Anything you'd like the host to know..."
            {...register("guestNotes")}
          />
          {errors.guestNotes && (
            <p className="text-xs text-destructive">
              {errors.guestNotes.message}
            </p>
          )}
        </div>
      </div>

      {errors.startTime && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.startTime.message}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isPending}
          className="gap-1.5"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          {isPending && <Loader2Icon className="size-4 animate-spin" />}
          Confirm booking
        </Button>
      </div>
    </form>
  )
}
