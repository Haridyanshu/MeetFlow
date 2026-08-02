import "server-only"

import { prisma } from "@/lib/prisma"
import { generateSlots } from "@/lib/scheduling/generate-slots"
import type { Slot, SlotRange } from "@/lib/scheduling/generate-slots"
import { fromZonedTime } from "date-fns-tz"
import { dayRangeInZone, resolveTimeZone, toZonedDateStr, zonedWeekday, startOfDayInZone, addDaysInZone } from "@/lib/date"

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

interface HostEventType {
  id: string
  duration: number
  bufferBefore: number
  bufferAfter: number
  minimumNotice: number
}

async function getAvailabilityRanges(
  userId: string,
  timeZone: string,
  from: Date,
  to: Date,
): Promise<SlotRange[]> {
  const [weeklyAvailability, overrides] = await Promise.all([
    prisma.weeklyAvailability.findUnique({
      where: { userId },
      include: {
        intervals: {
          where: { isEnabled: true },
          orderBy: { startTime: "asc" },
        },
      },
    }),
    prisma.dateOverride.findMany({ where: { userId } }),
  ])

  const overrideMap = new Map<string, { isAvailable: boolean; startTime: string | null; endTime: string | null }>()
  for (const o of overrides) {
    overrideMap.set(o.date.toISOString().slice(0, 10), {
      isAvailable: o.isAvailable,
      startTime: o.startTime,
      endTime: o.endTime,
    })
  }

  const ranges: SlotRange[] = []

  let current = startOfDayInZone(from, timeZone)
  while (current < to) {
    const localDateStr = toZonedDateStr(current, timeZone)
    const weekday = zonedWeekday(current, timeZone)
    const override = overrideMap.get(localDateStr)

    let intervals: { start: string; end: string }[]

    if (override) {
      if (!override.isAvailable) {
        current = addDaysInZone(current, timeZone, 1)
        continue
      }
      if (override.startTime && override.endTime) {
        intervals = [{ start: override.startTime, end: override.endTime }]
      } else {
        intervals = (weeklyAvailability?.intervals ?? [])
          .filter((i) => i.dayOfWeek === weekday)
          .map((i) => ({ start: i.startTime, end: i.endTime }))
      }
    } else {
      intervals = (weeklyAvailability?.intervals ?? [])
        .filter((i) => i.dayOfWeek === weekday)
        .map((i) => ({ start: i.startTime, end: i.endTime }))
    }

    for (const interval of intervals) {
      const rangeStart = fromZonedTime(`${localDateStr}T${interval.start}:00`, timeZone)
      const rangeEnd = fromZonedTime(`${localDateStr}T${interval.end}:00`, timeZone)
      ranges.push({ start: rangeStart, end: rangeEnd })
    }

    current = addDaysInZone(current, timeZone, 1)
  }

  return ranges
}

async function getUserSlotsForDate(
  userId: string,
  eventType: HostEventType,
  timeZone: string,
  dayStart: Date,
  dayEnd: Date,
): Promise<Slot[]> {
  const rawRanges = await getAvailabilityRanges(userId, timeZone, dayStart, dayEnd)

  const ranges = rawRanges
    .map((r) => ({
      start: r.start < dayStart ? dayStart : r.start,
      end: r.end > dayEnd ? dayEnd : r.end,
    }))
    .filter((r) => r.start < r.end)

  if (ranges.length === 0) return []

  const existingBookings = await prisma.booking.findMany({
    where: {
      OR: [
        { eventTypeId: eventType.id, status: "BOOKED", userId },
        { eventTypeId: eventType.id, status: "BOOKED", assignedUserId: userId },
      ],
      startTime: { lt: new Date(dayEnd.getTime() + eventType.bufferBefore * 60 * 1000) },
      endTime: { gt: new Date(dayStart.getTime() - eventType.bufferAfter * 60 * 1000) },
    },
    orderBy: { startTime: "asc" },
  })

  const now = new Date()
  const slots = generateSlots({
    ranges,
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
  timeZone: string,
): Promise<Slot[]> {
  const { start: dayStart, end: dayEnd } = dayRangeInZone(date, timeZone)

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: true, team: { include: { members: { include: { user: { select: { timezone: true } } } } } } },
  })

  if (!eventType || !eventType.isActive) return []

  if (eventType.schedulingType !== "INDIVIDUAL" && eventType.teamId && eventType.team) {
    const memberSlots = await Promise.all(
      eventType.team.members
        .filter((m) => m.role !== "OWNER" || m.userId === eventType.user.id)
        .map((m) =>
          getUserSlotsForDate(m.userId, eventType, resolveTimeZone(m.user?.timezone), dayStart, dayEnd)
        ),
    )

    if (eventType.schedulingType === "ROUND_ROBIN") {
      const slotMap = new Map<string, Slot>()
      for (const slots of memberSlots) {
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
      if (memberSlots.length === 0) return []
      return memberSlots.reduce((common, slots) =>
        common.filter((s) =>
          slots.some((cs) => cs.startTime.getTime() === s.startTime.getTime())
        )
      )
    }
  }

  return getUserSlotsForDate(eventType.user.id, eventType, resolveTimeZone(eventType.user.timezone), dayStart, dayEnd)
}

export async function pickRoundRobinMember(
  eventTypeId: string,
  startTime: Date,
  endTime: Date,
): Promise<string | null> {
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { team: { include: { members: { include: { user: { select: { timezone: true } } } } } } },
  })

  if (!eventType?.team) return null

  const memberIds = eventType.team.members.map((m) => m.userId)

  const counts = await Promise.all(
    memberIds.map(async (uid) => {
      const member = eventType.team!.members.find((m) => m.userId === uid)
      const timeZone = resolveTimeZone(member?.user?.timezone)
      const rawRanges = await getAvailabilityRanges(uid, timeZone, startTime, endTime)
      const hasSlot = rawRanges.some(
        (r) => startTime >= r.start && endTime <= r.end,
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
