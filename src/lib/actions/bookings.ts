"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { createBookingSchema, cancelBookingSchema } from "@/lib/schemas/booking"
import type { CreateBookingInput } from "@/lib/schemas/booking"
import { getAvailableSlots } from "@/lib/queries/bookings"
import { validateBookingCreation, checkBookingWindow, checkDailyLimit, checkWeeklyLimit } from "@/lib/validation/booking-rules"
import type { NoSlotsReason } from "@/lib/validation/booking-rules"
import crypto from "crypto"

import { createCalendarEvent, deleteCalendarEvent } from "@/lib/services/calendar"
import {
  sendBookingConfirmation,
  sendBookingCancellation,
} from "@/lib/services/email"

export async function createBooking(data: CreateBookingInput) {
  const parsed = createBookingSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const startTime = new Date(parsed.data.startTime)
  const endTime = new Date(parsed.data.endTime)

  if (startTime <= new Date()) {
    return {
      errors: { startTime: ["Booking cannot be in the past"] },
    }
  }

  const eventType = await prisma.eventType.findUnique({
    where: { id: parsed.data.eventTypeId },
    include: { user: true },
  })

  if (!eventType) {
    return {
      errors: { eventTypeId: ["Event type not found"] },
    }
  }

  if (!eventType.isActive) {
    return {
      errors: { eventTypeId: ["Event type is not active"] },
    }
  }

  const ruleCheck = await validateBookingCreation(eventType, startTime)
  if (ruleCheck && !ruleCheck.ok) {
    return {
      errors: { startTime: [ruleCheck.message] },
    }
  }

  const dateStr = startTime.toISOString().split("T")[0]
  const availableSlots = await getAvailableSlots(
    parsed.data.eventTypeId,
    dateStr
  )

  const slotKey = (d: Date) => d.toISOString()
  const isValid = availableSlots.some(
    (s) =>
      slotKey(s.startTime) === slotKey(startTime) &&
      slotKey(s.endTime) === slotKey(endTime)
  )

  if (!isValid) {
    return {
      errors: { startTime: ["This time slot is not available"] },
    }
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const overlapping = await tx.booking.findMany({
          where: {
            eventTypeId: parsed.data.eventTypeId,
            status: "BOOKED",
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        })

        if (overlapping.length > 0) {
          return { conflict: true }
        }

        const managementToken = crypto.randomUUID()
        const managementTokenExpiresAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        )

        const booking = await tx.booking.create({
          data: {
            userId: eventType.user.id,
            eventTypeId: parsed.data.eventTypeId,
            guestName: parsed.data.guestName,
            guestEmail: parsed.data.guestEmail,
            guestNotes: parsed.data.guestNotes ?? null,
            startTime,
            endTime,
            timezone: parsed.data.timezone,
            status: "BOOKED",
            managementToken,
            managementTokenExpiresAt,
          },
        })

        return { booking }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    )

    if (result.conflict) {
      return {
        errors: {
          startTime: ["This time slot is no longer available"],
        },
      }
    }

    const booking = result.booking!

    try {
      const calendarResult = await createCalendarEvent({
        userId: eventType.user.id,
        summary: eventType.title,
        description: `Meeting with ${parsed.data.guestName} (${parsed.data.guestEmail})${parsed.data.guestNotes ? `\n\nNotes: ${parsed.data.guestNotes}` : ""}`,
        startTime,
        endTime,
        timezone: parsed.data.timezone,
      })

      if (calendarResult?.eventId) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            googleCalendarEventId: calendarResult.eventId,
            googleCalendarId: calendarResult.calendarId,
          },
        })
      }
    } catch (calendarError) {
      console.error("Failed to create Google Calendar event:", calendarError)
    }

    const managementUrl = booking.managementToken
      ? `${process.env.AUTH_URL ?? "http://localhost:3000"}/booking/manage/${booking.managementToken}`
      : null

    try {
      await sendBookingConfirmation(
        {
          eventTitle: eventType.title,
          hostName: eventType.user.name ?? eventType.user.email,
          guestName: parsed.data.guestName,
          guestEmail: parsed.data.guestEmail,
          date: startTime,
          startTime,
          endTime,
          timezone: parsed.data.timezone,
          duration: eventType.duration,
          description: eventType.description,
          managementUrl,
        },
        eventType.user.email,
      )
    } catch (emailError) {
      console.error("Failed to send booking confirmation email:", emailError)
    }

    revalidatePath("/dashboard/bookings")
    revalidatePath("/dashboard")

    return { booking }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return {
        errors: {
          startTime: [
            "This time slot is no longer available (conflict detected). Please try again.",
          ],
        },
      }
    }
    throw error
  }
}

export async function getAvailableSlotsAction(
  eventTypeId: string,
  date: string,
): Promise<{
  slots: { startTime: string; endTime: string }[]
  noSlotsReason?: NoSlotsReason
}> {
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
  })

  if (!eventType || !eventType.isActive) {
    return { slots: [], noSlotsReason: "no_availability" }
  }

  const dateObj = new Date(date + "T00:00:00Z")

  if (eventType.maximumAdvanceDays > 0) {
    const windowCheck = checkBookingWindow(dateObj, eventType.maximumAdvanceDays)
    if (!windowCheck.ok) {
      return { slots: [], noSlotsReason: "booking_window" }
    }
  }

  if (eventType.maximumBookingsPerDay > 0) {
    const dailyCheck = await checkDailyLimit(eventTypeId, dateObj, eventType.maximumBookingsPerDay)
    if (!dailyCheck.ok) {
      return { slots: [], noSlotsReason: "daily_limit" }
    }
  }

  if (eventType.maximumBookingsPerWeek > 0) {
    const weeklyCheck = await checkWeeklyLimit(eventTypeId, dateObj, eventType.maximumBookingsPerWeek)
    if (!weeklyCheck.ok) {
      return { slots: [], noSlotsReason: "weekly_limit" }
    }
  }

  const slots = await getAvailableSlots(eventTypeId, date)
  return {
    slots: slots.map((s) => ({
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
    })),
  }
}

export async function cancelBooking(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = cancelBookingSchema.safeParse({ id })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.id },
    include: { eventType: { include: { user: true } } },
  })

  if (!booking || booking.eventType.userId !== session.user.id) {
    throw new Error("Not found")
  }

  if (booking.status === "CANCELLED") {
    return {
      errors: { id: ["Booking is already cancelled"] },
    }
  }

  await prisma.booking.update({
    where: { id: parsed.data.id },
    data: { status: "CANCELLED" },
  })

  if (booking.googleCalendarEventId) {
    try {
      await deleteCalendarEvent({
        userId: session.user.id,
        eventId: booking.googleCalendarEventId,
        calendarId: booking.googleCalendarId ?? "primary",
      })
    } catch (calendarError) {
      console.error(
        "Failed to delete Google Calendar event:",
        calendarError
      )
    }
  }

  try {
    await sendBookingCancellation(
      {
        eventTitle: booking.eventType.title,
        hostName: booking.eventType.user.name ?? booking.eventType.user.email,
        guestName: booking.guestName,
        date: booking.startTime,
        startTime: booking.startTime,
        endTime: booking.endTime,
        timezone: booking.timezone,
      },
      booking.eventType.user.email,
      booking.guestEmail,
    )
  } catch (emailError) {
    console.error("Failed to send booking cancellation email:", emailError)
  }

  revalidatePath("/dashboard/bookings")
  revalidatePath("/dashboard")
}
