import "server-only"

import { prisma } from "@/lib/prisma"

export async function getEventTypesByUserId(userId: string) {
  const eventTypes = await prisma.eventType.findMany({
    where: { userId },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        orderBy: { startTime: "desc" },
        take: 1,
        select: { startTime: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return eventTypes.map(({ _count, bookings, ...rest }) => ({
    ...rest,
    bookingCount: _count.bookings,
    lastBooking: bookings[0]?.startTime ?? null,
  }))
}

export async function getActiveEventTypesByUserId(userId: string) {
  return prisma.eventType.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  })
}
