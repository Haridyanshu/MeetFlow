"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"

import { createBookingSchema } from "@/lib/schemas/booking"
import type { CreateBookingInput } from "@/lib/schemas/booking"
import { createBooking } from "@/lib/actions/bookings"
import { createCheckoutSession } from "@/lib/actions/checkout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"


interface BookingFormProps {
  eventTypeId: string
  isPaid: boolean
  price: number | null
  currency: string | null
  selectedSlot: { startTime: string; endTime: string }
  onSuccess: (booking: unknown) => void
  onBack: () => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const h = d.getUTCHours().toString().padStart(2, "0")
  const m = d.getUTCMinutes().toString().padStart(2, "0")
  return `${h}:${m}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function BookingForm({
  eventTypeId,
  isPaid,
  price,
  currency,
  selectedSlot,
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
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

  async function onSubmit(data: CreateBookingInput) {
    startTransition(async () => {
      if (isPaid) {
        const result = await createCheckoutSession({
          eventTypeId: data.eventTypeId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestNotes: data.guestNotes,
          startTime: data.startTime,
          endTime: data.endTime,
          timezone: data.timezone,
        })

        if (result && "errors" in result && result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            const message = Array.isArray(messages) ? messages[0] : messages
            setError(field as keyof CreateBookingInput, { message })
          }
          return
        }

        if (result && "url" in result && result.url) {
          window.location.href = result.url
        }
        return
      }

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-heading font-medium">Enter your details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(selectedSlot.startTime)} at{" "}
          {formatTime(selectedSlot.startTime)} &ndash;{" "}
          {formatTime(selectedSlot.endTime)}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="guestName">Name</Label>
          <Input id="guestName" {...register("guestName")} />
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
            {...register("guestEmail")}
          />
          {errors.guestEmail && (
            <p className="text-xs text-destructive">
              {errors.guestEmail.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="guestNotes">Notes (optional)</Label>
          <Textarea id="guestNotes" {...register("guestNotes")} />
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

      {isPaid && price != null && (
        <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Price: </span>
          <span className="font-medium">
            {((currency ?? "usd").toUpperCase())} {(price / 100).toFixed(2)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">You will be redirected to Stripe to complete payment.</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isPending}
        >
          Back
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2Icon className="animate-spin" />}
          {isPaid ? "Proceed to payment" : "Confirm booking"}
        </Button>
      </div>
    </form>
  )
}
