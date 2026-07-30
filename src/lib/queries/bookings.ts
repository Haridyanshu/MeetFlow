import "server-only"

import { prisma } from "@/lib/prisma"
import { generateSlots } from "@/lib/scheduling/generate-slots"

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

export async function getBookingsForDay(eventTypeId: string, date: Date) {
  const dayStart = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  )
  const dayEnd = new Date(dayStart.getTime() + 86400000)

  return prisma.booking.findMany({
    where: {
      eventTypeId,
      status: "BOOKED",
      startTime: { gte: dayStart, lt: dayEnd },
    },
    orderBy: { startTime: "asc" },
  })
}

export async function getBookingsForRange(
  userId: string,
  start: Date,
  end: Date
) {
  return prisma.booking.findMany({
    where: {
      userId,
      status: "BOOKED",
      startTime: { gte: start, lt: end },
    },
    orderBy: { startTime: "asc" },
  })
}

export async function getBookingsByUserId(userId: string) {
  return prisma.booking.findMany({
    where: { userId, status: "BOOKED" },
    include: { eventType: true },
    orderBy: { startTime: "desc" },
  })
}

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: { eventType: true },
  })
}

export async function getAvailableSlots(
  eventTypeId: string,
  date: string,
) {
  const dateObj = parseDate(date)

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: true },
  })

  if (!eventType || !eventType.isActive) {
    return []
  }

  const dayOfWeek = dateObj.getUTCDay()

  const weeklyAvailability = await prisma.weeklyAvailability.findUnique({
    where: { userId: eventType.user.id },
    include: {
      intervals: {
        where: { dayOfWeek, isEnabled: true },
        orderBy: { startTime: "asc" },
      },
    },
  })

  const dateOverride = await prisma.dateOverride.findUnique({
    where: {
      userId_date: { userId: eventType.user.id, date: dateObj },
    },
  })

  let intervals: { start: string; end: string }[]

  if (dateOverride) {
    if (!dateOverride.isAvailable) {
      return []
    }
    if (dateOverride.startTime && dateOverride.endTime) {
      intervals = [
        { start: dateOverride.startTime, end: dateOverride.endTime },
      ]
    } else {
      intervals = (weeklyAvailability?.intervals ?? []).map((i) => ({
        start: i.startTime,
        end: i.endTime,
      }))
    }
  } else {
    intervals = (weeklyAvailability?.intervals ?? []).map((i) => ({
      start: i.startTime,
      end: i.endTime,
    }))
  }

  if (intervals.length === 0) {
    return []
  }

  const existingBookings = await prisma.booking.findMany({
    where: {
      eventTypeId,
      status: "BOOKED",
      startTime: { gte: dateObj, lt: new Date(dateObj.getTime() + 86400000) },
    },
    orderBy: { startTime: "asc" },
  })

  const now = new Date()
  const slots = generateSlots({
    date: dateObj,
    intervals,
    duration: eventType.duration,
    existingBookings: existingBookings.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
    })),
    bufferBefore: eventType.bufferBefore,
    bufferAfter: eventType.bufferAfter,
    now,
  })

  if (eventType.minimumNotice > 0) {
    const earliestAllowed = new Date(now.getTime() + eventType.minimumNotice * 60 * 1000)
    return slots.filter((s) => s.startTime >= earliestAllowed)
  }

  return slots
}
