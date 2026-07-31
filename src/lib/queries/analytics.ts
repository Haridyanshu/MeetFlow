import "server-only"
import { prisma } from "@/lib/prisma"

export interface AnalyticsRange {
  start: Date
  end: Date
  previousStart: Date
  previousEnd: Date
}

export function getDateRange(range: string, customStart?: string, customEnd?: string): AnalyticsRange {
  const now = new Date()
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))

  let start: Date

  switch (range) {
    case "7d":
      start = new Date(end.getTime() - 7 * 86400000)
      break
    case "90d":
      start = new Date(end.getTime() - 90 * 86400000)
      break
    case "year":
      start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
      break
    case "custom":
      if (customStart && customEnd) {
        start = new Date(customStart)
        end.setTime(new Date(customEnd).getTime())
        end.setUTCHours(23, 59, 59, 999)
      } else {
        start = new Date(end.getTime() - 30 * 86400000)
      }
      break
    default:
      start = new Date(end.getTime() - 30 * 86400000)
  }

  const rangeLength = end.getTime() - start.getTime()
  const previousEnd = new Date(start.getTime() - 1)
  const previousStart = new Date(previousEnd.getTime() - rangeLength)

  return { start, end, previousStart, previousEnd }
}

export async function getBookingKPIs(userId: string, range: AnalyticsRange) {
  const ownership = {
    OR: [
      { userId },
      { assignedUserId: userId },
    ],
  }

  const now = new Date()

  const [
    totalCurrent,
    totalPrevious,
    upcomingCount,
    completedCount,
    cancelledCurrent,
    activeEventTypes,
  ] = await Promise.all([
    prisma.booking.count({ where: { ...ownership, createdAt: { gte: range.start, lte: range.end } } }),
    prisma.booking.count({ where: { ...ownership, createdAt: { gte: range.previousStart, lte: range.previousEnd } } }),
    prisma.booking.count({ where: { ...ownership, status: "BOOKED", startTime: { gt: now } } }),
    prisma.booking.count({ where: { ...ownership, status: "BOOKED", endTime: { lt: now } } }),
    prisma.booking.count({ where: { ...ownership, status: "CANCELLED", startTime: { gte: range.start, lte: range.end } } }),
    prisma.eventType.count({ where: { userId, isActive: true } }),
  ])

  const rescheduledBookings = await prisma.booking.findMany({
    where: {
      ...ownership,
      NOT: { status: "CANCELLED" },
      startTime: { gte: range.start, lte: range.end },
    },
    select: { createdAt: true, updatedAt: true },
  })
  const rescheduledCurrent = rescheduledBookings.filter(
    (b) => b.updatedAt.getTime() - b.createdAt.getTime() > 1000
  ).length

  return {
    totalBookings: totalCurrent,
    totalBookingsPrev: totalPrevious,
    upcomingBookings: upcomingCount,
    completedBookings: completedCount,
    cancelledBookings: cancelledCurrent,
    rescheduledBookings: rescheduledCurrent,
    activeEventTypes,
  }
}

export async function getBookingsOverTime(userId: string, start: Date, end: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { userId },
        { assignedUserId: userId },
      ],
      startTime: { gte: start, lte: end },
    },
    select: { startTime: true, status: true, createdAt: true },
    orderBy: { startTime: "asc" },
  })

  const dayMap = new Map<string, { created: number; cancelled: number; booked: number }>()

  const cursor = new Date(start)
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    dayMap.set(key, { created: 0, cancelled: 0, booked: 0 })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  for (const b of bookings) {
    const key = b.startTime.toISOString().slice(0, 10)
    const entry = dayMap.get(key)
    if (entry) {
      entry.booked++
      if (b.status === "CANCELLED") entry.cancelled++
    }

    const createdKey = b.createdAt.toISOString().slice(0, 10)
    const createdEntry = dayMap.get(createdKey)
    if (createdEntry) {
      createdEntry.created++
    }
  }

  return Array.from(dayMap.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }))
}

export async function getBookingStatusDistribution(userId: string, start: Date, end: Date) {
  const counts = await prisma.booking.groupBy({
    by: ["status"],
    where: {
      OR: [
        { userId },
        { assignedUserId: userId },
      ],
      startTime: { gte: start, lte: end },
    },
    _count: true,
  })

  return counts.map((c) => ({
    name: c.status === "BOOKED" ? "Booked" : "Cancelled",
    value: c._count,
  }))
}

export async function getEventTypePopularity(userId: string, start: Date, end: Date) {
  const result = await prisma.eventType.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          bookings: {
            where: { startTime: { gte: start, lte: end } },
          },
        },
      },
    },
    orderBy: { bookings: { _count: "desc" } },
  })

  return result.map((et) => ({
    title: et.title,
    bookings: et._count.bookings,
  }))
}

export async function getEventTypeAnalytics(userId: string, start: Date, end: Date) {
  const eventTypes = await prisma.eventType.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      duration: true,
      isActive: true,
      bookings: {
        where: { startTime: { gte: start, lte: end } },
        select: {
          status: true,
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: { title: "asc" },
  })

  return eventTypes.map((et) => {
    const total = et.bookings.length
    const completed = et.bookings.filter((b) => b.status === "BOOKED" && b.endTime < new Date()).length
    const cancelled = et.bookings.filter((b) => b.status === "CANCELLED").length
    const durations = et.bookings
      .filter((b) => b.status === "BOOKED")
      .map((b) => (b.endTime.getTime() - b.startTime.getTime()) / 60000)
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
    const lastBooking = et.bookings.length > 0
      ? et.bookings.reduce((latest, b) => b.startTime > latest.startTime ? b : latest).startTime
      : null

    return {
      id: et.id,
      title: et.title,
      duration: et.duration,
      isActive: et.isActive,
      totalBookings: total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      avgDuration,
      lastBooking,
    }
  })
}

export async function getTeamAnalytics(userId: string, start: Date, end: Date) {
  const teams = await prisma.team.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      name: true,
      members: {
        select: {
          userId: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      eventTypes: {
        select: {
          id: true,
          schedulingType: true,
          bookings: {
            where: { startTime: { gte: start, lte: end } },
            select: { status: true, assignedUserId: true },
          },
        },
      },
    },
  })

  return teams.map((team) => {
    const allBookings = team.eventTypes.flatMap((et) => et.bookings)
    const activeBookings = allBookings.filter((b) => b.status === "BOOKED")

    const memberBookingCount = new Map<string, number>()
    for (const mem of team.members) {
      memberBookingCount.set(mem.userId, 0)
    }
    for (const b of activeBookings) {
      const id = b.assignedUserId ?? ""
      if (memberBookingCount.has(id)) {
        memberBookingCount.set(id, (memberBookingCount.get(id) ?? 0) + 1)
      }
    }

    const memberLeaderboard = team.members
      .map((m) => ({
        name: m.user.name ?? m.user.email,
        email: m.user.email,
        image: m.user.image,
        bookings: memberBookingCount.get(m.userId) ?? 0,
      }))
      .sort((a, b) => b.bookings - a.bookings)

    const roundRobinTypes = team.eventTypes.filter((et) => et.schedulingType === "ROUND_ROBIN")
    const roundRobinBookings = roundRobinTypes.flatMap((et) => et.bookings).filter((b) => b.status === "BOOKED").length
    const collectiveTypes = team.eventTypes.filter((et) => et.schedulingType === "COLLECTIVE")
    const collectiveBookings = collectiveTypes.flatMap((et) => et.bookings).filter((b) => b.status === "BOOKED").length

    return {
      id: team.id,
      name: team.name,
      totalBookings: activeBookings.length,
      memberLeaderboard,
      roundRobinBookings,
      collectiveBookings,
    }
  })
}

export async function getAvailabilityInsights(userId: string, start: Date, end: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { userId },
        { assignedUserId: userId },
      ],
      startTime: { gte: start, lte: end },
      status: "BOOKED",
    },
    select: {
      startTime: true,
      createdAt: true,
    },
  })

  if (bookings.length === 0) {
    return {
      mostBookedWeekday: null,
      mostBookedHour: null,
      avgNoticePeriod: null,
      avgLeadTime: null,
    }
  }

  const dayCount = new Array(7).fill(0)
  const hourCount = new Array(24).fill(0)
  let totalNoticeMs = 0
  let totalLeadMs = 0

  for (const b of bookings) {
    dayCount[b.startTime.getUTCDay()]++
    hourCount[b.startTime.getUTCHours()]++
    totalNoticeMs += b.startTime.getTime() - b.createdAt.getTime()
    totalLeadMs += b.startTime.getTime() - b.createdAt.getTime()
  }

  const mostBookedWeekday = dayCount.indexOf(Math.max(...dayCount))
  const mostBookedHour = hourCount.indexOf(Math.max(...hourCount))

  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return {
    mostBookedWeekday: weekdayNames[mostBookedWeekday],
    mostBookedHour: `${mostBookedHour.toString().padStart(2, "0")}:00`,
    avgNoticePeriod: Math.round(totalNoticeMs / bookings.length / 3600000),
    avgLeadTime: Math.round(totalLeadMs / bookings.length / 3600000),
  }
}

export async function getRecentActivity(userId: string, limit = 10) {
  const [bookings, teams, invitations] = await Promise.all([
    prisma.booking.findMany({
      where: {
        OR: [
          { userId },
          { assignedUserId: userId },
        ],
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        guestName: true,
        startTime: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.team.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.teamInvitation.findMany({
      where: { team: { ownerId: userId } },
      select: { id: true, email: true, createdAt: true, team: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ])

  const events: {
    id: string
    type: "booking_created" | "booking_cancelled" | "booking_rescheduled" | "team_created" | "invitation_sent"
    description: string
    timestamp: Date
  }[] = []

  for (const b of bookings) {
    if (b.status === "CANCELLED") {
      events.push({
        id: `cancel-${b.id}`,
        type: "booking_cancelled",
        description: `${b.guestName}'s booking was cancelled`,
        timestamp: b.updatedAt,
      })
    } else if (b.updatedAt.getTime() - b.createdAt.getTime() > 1000) {
      events.push({
        id: `reschedule-${b.id}`,
        type: "booking_rescheduled",
        description: `${b.guestName}'s booking was rescheduled`,
        timestamp: b.updatedAt,
      })
    } else {
      events.push({
        id: `create-${b.id}`,
        type: "booking_created",
        description: `Booking created with ${b.guestName}`,
        timestamp: b.createdAt,
      })
    }
  }

  for (const t of teams) {
    events.push({
      id: `team-${t.id}`,
      type: "team_created",
      description: `Team "${t.name}" created`,
      timestamp: t.createdAt,
    })
  }

  for (const inv of invitations) {
    events.push({
      id: `invite-${inv.id}`,
      type: "invitation_sent",
      description: `Invitation sent to ${inv.email} for ${inv.team.name}`,
      timestamp: inv.createdAt,
    })
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
}
