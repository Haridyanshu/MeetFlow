import "server-only"

import { prisma } from "@/lib/prisma"
import { generateSlots } from "@/lib/scheduling/generate-slots"
import type { Slot } from "@/lib/scheduling/generate-slots"

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
      0, 0, 0, 0
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
    where: {
      OR: [
        { userId, status: "BOOKED" },
        { assignedUserId: userId, status: "BOOKED" },
      ],
    },
    include: { eventType: true, assignedUser: { select: { id: true, name: true, email: true } } },
    orderBy: { startTime: "desc" },
  })
}

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: { eventType: true },
  })
}

async function getUserSlotsForDate(
  userId: string,
  eventType: { id: string; duration: number; bufferBefore: number; bufferAfter: number; minimumNotice: number },
  date: Date,
): Promise<Slot[]> {
  const dayOfWeek = date.getUTCDay()

  const weeklyAvailability = await prisma.weeklyAvailability.findUnique({
    where: { userId },
    include: {
      intervals: {
        where: { dayOfWeek, isEnabled: true },
        orderBy: { startTime: "asc" },
      },
    },
  })

  const dateOverride = await prisma.dateOverride.findUnique({
    where: { userId_date: { userId, date } },
  })

  let intervals: { start: string; end: string }[]

  if (dateOverride) {
    if (!dateOverride.isAvailable) return []
    if (dateOverride.startTime && dateOverride.endTime) {
      intervals = [{ start: dateOverride.startTime, end: dateOverride.endTime }]
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

  if (intervals.length === 0) return []

  const existingBookings = await prisma.booking.findMany({
    where: {
      OR: [
        { eventTypeId: eventType.id, status: "BOOKED", userId },
        { eventTypeId: eventType.id, status: "BOOKED", assignedUserId: userId },
      ],
      startTime: { gte: date, lt: new Date(date.getTime() + 86400000) },
    },
    orderBy: { startTime: "asc" },
  })

  const now = new Date()
  const slots = generateSlots({
    date,
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

export async function getAvailableSlots(
  eventTypeId: string,
  date: string,
): Promise<Slot[]> {
  const dateObj = parseDate(date)

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: true, team: { include: { members: true } } },
  })

  if (!eventType || !eventType.isActive) return []

  if (eventType.schedulingType !== "INDIVIDUAL" && eventType.teamId && eventType.team) {
    const memberIds = eventType.team.members
      .filter((m) => m.role !== "OWNER" || m.userId === eventType.user.id)
      .map((m) => m.userId)

    const allSlots = await Promise.all(
      memberIds.map((uid) => getUserSlotsForDate(uid, eventType, dateObj)),
    )

    if (eventType.schedulingType === "ROUND_ROBIN") {
      const slotMap = new Map<string, Slot>()
      for (const slots of allSlots) {
        for (const slot of slots) {
          const key = slot.startTime.toISOString()
          if (!slotMap.has(key)) {
            slotMap.set(key, slot)
          }
        }
      }
      return Array.from(slotMap.values())
    }

    if (eventType.schedulingType === "COLLECTIVE") {
      if (allSlots.length === 0) return []
      return allSlots.reduce((common, slots) =>
        common.filter((s) =>
          slots.some((cs) => cs.startTime.getTime() === s.startTime.getTime())
        )
      )
    }
  }

  return getUserSlotsForDate(eventType.user.id, eventType, dateObj)
}

export async function pickRoundRobinMember(
  eventTypeId: string,
  startTime: Date,
  endTime: Date,
): Promise<string | null> {
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { team: { include: { members: true } } },
  })

  if (!eventType?.team) return null

  const memberIds = eventType.team.members.map((m) => m.userId)
  const date = new Date(Date.UTC(startTime.getUTCFullYear(), startTime.getUTCMonth(), startTime.getUTCDate()))

  const counts = await Promise.all(
    memberIds.map(async (uid) => {
      const slots = await getUserSlotsForDate(uid, eventType, date)
      const hasSlot = slots.some(
        (s) => s.startTime.getTime() === startTime.getTime() && s.endTime.getTime() === endTime.getTime(),
      )
      if (!hasSlot) return { userId: uid, count: Infinity }

      const bookingCount = await prisma.booking.count({
        where: {
          OR: [
            { assignedUserId: uid, status: "BOOKED" },
            { userId: uid, status: "BOOKED", eventTypeId },
          ],
        },
      })
      return { userId: uid, count: bookingCount }
    }),
  )

  const eligible = counts.filter((c) => c.count !== Infinity).sort((a, b) => a.count - b.count)
  return eligible[0]?.userId ?? null
}
