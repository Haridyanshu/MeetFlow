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
import { DEFAULT_TIMEZONE, resolveTimeZone, toZonedDateStr, zonedDateStrToUtc } from "@/lib/date"
import crypto from "crypto"

import { pickRoundRobinMember } from "@/lib/queries/bookings"
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
    include: { user: true, team: { include: { members: true } } },
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

  const ruleCheck = await validateBookingCreation(eventType, startTime, resolveTimeZone(parsed.data.timezone))
  if (ruleCheck && !ruleCheck.ok) {
    return {
      errors: { startTime: [ruleCheck.message] },
    }
  }

  const dateStr = toZonedDateStr(startTime, resolveTimeZone(parsed.data.timezone))
  const availableSlots = await getAvailableSlots(parsed.data.eventTypeId, dateStr, resolveTimeZone(parsed.data.timezone))

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

  let assignedUserId: string | null = null
  let participantIds: string[] = []

  if (eventType.schedulingType === "ROUND_ROBIN" && eventType.team) {
    assignedUserId = await pickRoundRobinMember(eventType.id, startTime, endTime)
    if (!assignedUserId) {
      return {
        errors: { startTime: ["This time slot is no longer available"] },
      }
    }
  } else if (eventType.schedulingType === "COLLECTIVE" && eventType.team) {
    participantIds = eventType.team.members.map((m) => m.userId)
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        if (eventType.schedulingType === "ROUND_ROBIN" && assignedUserId) {
          const overlapping = await tx.booking.findMany({
            where: {
              eventTypeId: parsed.data.eventTypeId,
              status: "BOOKED",
              startTime: { lt: endTime },
              endTime: { gt: startTime },
              OR: [
                { userId: assignedUserId },
                { assignedUserId },
              ],
            },
          })
          if (overlapping.length > 0) return { conflict: true }
        } else if (eventType.schedulingType === "COLLECTIVE") {
          const overlapping = await tx.booking.findMany({
            where: {
              eventTypeId: parsed.data.eventTypeId,
              status: "BOOKED",
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
          })
          if (overlapping.length > 0) return { conflict: true }
        } else {
          const overlapping = await tx.booking.findMany({
            where: {
              eventTypeId: parsed.data.eventTypeId,
              status: "BOOKED",
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
          })
          if (overlapping.length > 0) return { conflict: true }
        }

        const managementToken = crypto.randomUUID()
        const managementTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

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
            assignedUserId,
            participants: participantIds.length > 0
              ? { create: participantIds.map((uid) => ({ userId: uid })) }
              : undefined,
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
        errors: { startTime: ["This time slot is no longer available"] },
      }
    }

    const booking = result.booking!

    const calendarUsers = eventType.schedulingType === "COLLECTIVE"
      ? participantIds
      : assignedUserId
        ? [assignedUserId]
        : [eventType.user.id]

    let meetingUrl: string | null = null
    let hostEventId: string | null = null
    let hostCalendarId: string | null = null

    for (const uid of calendarUsers) {
      try {
        const calResult = await createCalendarEvent({
          userId: uid,
          summary: eventType.title,
          description: `Meeting with ${parsed.data.guestName} (${parsed.data.guestEmail})${parsed.data.guestNotes ? `\n\nNotes: ${parsed.data.guestNotes}` : ""}`,
          startTime,
          endTime,
          timezone: parsed.data.timezone,
        })

        if (calResult?.meetUrl && !meetingUrl) meetingUrl = calResult.meetUrl

        if (calResult?.eventId) {
          if (uid === (assignedUserId ?? eventType.user.id)) {
            hostEventId = calResult.eventId
            hostCalendarId = calResult.calendarId ?? "primary"
          }
          await prisma.calendarEvent.create({
            data: {
              bookingId: booking.id,
              userId: uid,
              eventId: calResult.eventId,
              calendarId: calResult.calendarId ?? "primary",
            },
          })
        }
      } catch (calError) {
        console.error(`Failed to create calendar event for user ${uid}:`, calError)
      }
    }

    if (hostEventId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          googleCalendarEventId: hostEventId,
          googleCalendarId: hostCalendarId,
          meetingUrl,
          meetingProvider: meetingUrl ? "GOOGLE_MEET" : null,
        },
      })
    }

    const managementUrl = booking.managementToken
      ? `${process.env.AUTH_URL ?? "http://localhost:3000"}/booking/manage/${booking.managementToken}`
      : null

    let hostName = eventType.user.name ?? eventType.user.email
    if (assignedUserId) {
      const assignedUser = await prisma.user.findUnique({ where: { id: assignedUserId } })
      if (assignedUser) hostName = assignedUser.name ?? assignedUser.email
    }

    try {
      await sendBookingConfirmation(
        {
          eventTitle: eventType.title,
          hostName,
          guestName: parsed.data.guestName,
          guestEmail: parsed.data.guestEmail,
          date: startTime,
          startTime,
          endTime,
          timezone: parsed.data.timezone,
          duration: eventType.duration,
          description: eventType.description,
          managementUrl,
          meetingUrl,
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
          startTime: ["This time slot is no longer available (conflict detected). Please try again."],
        },
      }
    }
    throw error
  }
}

export async function getAvailableSlotsAction(
  eventTypeId: string,
  date: string,
  timezone: string = DEFAULT_TIMEZONE,
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

  const timeZone = resolveTimeZone(timezone)
  const dateObj = zonedDateStrToUtc(date, timeZone)

  if (eventType.maximumAdvanceDays > 0) {
    const windowCheck = checkBookingWindow(dateObj, eventType.maximumAdvanceDays, timeZone)
    if (!windowCheck.ok) {
      return { slots: [], noSlotsReason: "booking_window" }
    }
  }

  if (eventType.maximumBookingsPerDay > 0) {
    const dailyCheck = await checkDailyLimit(eventTypeId, dateObj, eventType.maximumBookingsPerDay, timeZone)
    if (!dailyCheck.ok) {
      return { slots: [], noSlotsReason: "daily_limit" }
    }
  }

  if (eventType.maximumBookingsPerWeek > 0) {
    const weeklyCheck = await checkWeeklyLimit(eventTypeId, dateObj, eventType.maximumBookingsPerWeek, timeZone)
    if (!weeklyCheck.ok) {
      return { slots: [], noSlotsReason: "weekly_limit" }
    }
  }

  const slots = await getAvailableSlots(eventTypeId, date, timeZone)
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
    include: {
      eventType: { include: { user: true } },
      calendarEvents: true,
    },
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

  const eventsToDelete = booking.calendarEvents.length > 0
    ? booking.calendarEvents
    : booking.googleCalendarEventId
      ? [{ userId: booking.userId, eventId: booking.googleCalendarEventId, calendarId: booking.googleCalendarId ?? "primary" }]
      : []

  for (const ce of eventsToDelete) {
    try {
      await deleteCalendarEvent({
        userId: ce.userId,
        eventId: ce.eventId,
        calendarId: ce.calendarId ?? "primary",
      })
    } catch (calendarError) {
      console.error("Failed to delete Google Calendar event:", calendarError)
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
