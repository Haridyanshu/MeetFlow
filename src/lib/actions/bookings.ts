"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { createBookingSchema, cancelBookingSchema } from "@/lib/schemas/booking"
import type { CreateBookingInput } from "@/lib/schemas/booking"
import { getAvailableSlots } from "@/lib/queries/bookings"
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/services/calendar"

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
  date: string
) {
  const slots = await getAvailableSlots(eventTypeId, date)
  return slots.map((s) => ({
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
  }))
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
    include: { eventType: true },
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

  revalidatePath("/dashboard/bookings")
  revalidatePath("/dashboard")
}
