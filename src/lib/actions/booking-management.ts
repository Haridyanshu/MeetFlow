"use server"

import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { getAvailableSlots } from "@/lib/queries/bookings"
import { validateBookingCreation } from "@/lib/validation/booking-rules"
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/lib/services/calendar"
import {
  sendBookingCancellation,
  sendRescheduleConfirmation,
} from "@/lib/services/email"

type BookingWithUser = Prisma.BookingGetPayload<{
  include: { eventType: { include: { user: true } } }
}>

type BookingResult =
  | { ok: true; booking: BookingWithUser }
  | { ok: false; error: "invalid" | "expired" | "cancelled" | "completed"; booking?: BookingWithUser }

export async function getBookingByToken(token: string): Promise<BookingResult> {
  const booking = await prisma.booking.findUnique({
    where: { managementToken: token },
    include: { eventType: { include: { user: true } } },
  })

  if (!booking) {
    return { ok: false, error: "invalid" }
  }

  if (
    booking.managementTokenExpiresAt &&
    booking.managementTokenExpiresAt < new Date()
  ) {
    return { ok: false, error: "expired" }
  }

  if (booking.status === "CANCELLED") {
    return { ok: false, error: "cancelled", booking }
  }

  const now = new Date()
  const isPast = booking.endTime < now
  if (isPast) {
    return { ok: false, error: "completed", booking }
  }

  return { ok: true, booking }
}

export async function cancelBookingByToken(token: string) {
  const result = await getBookingByToken(token)
  if (!result.ok) {
    return result
  }

  const { booking } = result

  if (booking.status === "CANCELLED") {
    return { ok: false, error: "cancelled" as const }
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  })

  if (booking.googleCalendarEventId) {
    try {
      await deleteCalendarEvent({
        userId: booking.userId,
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
    console.error("Failed to send cancellation email:", emailError)
  }

  return { ok: true, cancelled: true as const }
}

export async function rescheduleBookingByToken(
  token: string,
  startTimeIso: string,
  endTimeIso: string,
): Promise<BookingResult | { ok: false; error: "past" | "unavailable" | "conflict" } | { ok: true; rescheduled: true }> {
  const result = await getBookingByToken(token)
  if (!result.ok) {
    return result
  }

  const { booking } = result

  if (booking.status === "CANCELLED") {
    return { ok: false, error: "cancelled" }
  }

  const newStartTime = new Date(startTimeIso)
  const newEndTime = new Date(endTimeIso)

  if (newStartTime <= new Date()) {
    return { ok: false, error: "past" }
  }

  const ruleCheck = await validateBookingCreation(booking.eventType, newStartTime)
  if (ruleCheck) {
    return { ok: false, error: "unavailable" }
  }

  const dateStr = newStartTime.toISOString().split("T")[0]
  const availableSlots = await getAvailableSlots(
    booking.eventTypeId,
    dateStr,
  )

  const slotKey = (d: Date) => d.toISOString()
  const isValid = availableSlots.some(
    (s) =>
      slotKey(s.startTime) === slotKey(newStartTime) &&
      slotKey(s.endTime) === slotKey(newEndTime),
  )

  if (!isValid) {
    return { ok: false, error: "unavailable" }
  }

  try {
    const txResult = await prisma.$transaction(
      async (tx) => {
        const overlapping = await tx.booking.findMany({
          where: {
            eventTypeId: booking.eventTypeId,
            status: "BOOKED",
            id: { not: booking.id },
            startTime: { lt: newEndTime },
            endTime: { gt: newStartTime },
          },
        })

        if (overlapping.length > 0) {
          return { conflict: true as const }
        }

        await tx.booking.update({
          where: { id: booking.id },
          data: {
            startTime: newStartTime,
            endTime: newEndTime,
          },
        })

        return { conflict: false as const }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    )

    if (txResult.conflict) {
      return { ok: false, error: "unavailable" }
    }

    if (booking.googleCalendarEventId) {
      try {
        await updateCalendarEvent({
          userId: booking.userId,
          eventId: booking.googleCalendarEventId,
          calendarId: booking.googleCalendarId ?? "primary",
          summary: booking.eventType.title,
          description: `Meeting with ${booking.guestName} (${booking.guestEmail})${booking.guestNotes ? `\n\nNotes: ${booking.guestNotes}` : ""}`,
          startTime: newStartTime,
          endTime: newEndTime,
          timezone: booking.timezone,
        })
      } catch (calendarError) {
        console.error(
          "Failed to update Google Calendar event:",
          calendarError,
        )
      }
    } else {
      try {
        const calendarResult = await createCalendarEvent({
          userId: booking.userId,
          summary: booking.eventType.title,
          description: `Meeting with ${booking.guestName} (${booking.guestEmail})${booking.guestNotes ? `\n\nNotes: ${booking.guestNotes}` : ""}`,
          startTime: newStartTime,
          endTime: newEndTime,
          timezone: booking.timezone,
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
        console.error(
          "Failed to create Google Calendar event:",
          calendarError,
        )
      }
    }

    const managementUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/booking/manage/${token}`

    try {
      await sendRescheduleConfirmation(
        {
          eventTitle: booking.eventType.title,
          hostName: booking.eventType.user.name ?? booking.eventType.user.email,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          date: newStartTime,
          startTime: newStartTime,
          endTime: newEndTime,
          timezone: booking.timezone,
          duration: booking.eventType.duration,
          description: booking.eventType.description,
          managementUrl,
        },
        booking.eventType.user.email,
        booking.guestEmail,
      )
    } catch (emailError) {
      console.error(
        "Failed to send reschedule confirmation email:",
        emailError,
      )
    }

    return { ok: true, rescheduled: true as const }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return { ok: false, error: "conflict" }
    }
    console.error("Failed to reschedule booking:", error)
    return { ok: false, error: "unavailable" }
  }
}
