import "server-only"

import { prisma } from "@/lib/prisma"

export async function getWeeklyAvailability(userId: string) {
  return prisma.weeklyAvailability.findUnique({
    where: { userId },
    include: {
      intervals: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  })
}

export async function getIntervalsForDay(
  weeklyAvailabilityId: string,
  dayOfWeek: number
) {
  return prisma.availabilityInterval.findMany({
    where: { weeklyAvailabilityId, dayOfWeek },
    orderBy: { startTime: "asc" },
  })
}

export async function getDateOverrides(userId: string) {
  return prisma.dateOverride.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  })
}

export async function getDateOverrideById(id: string) {
  return prisma.dateOverride.findUnique({
    where: { id },
  })
}

export async function getDateOverrideByDate(userId: string, date: Date) {
  return prisma.dateOverride.findUnique({
    where: { userId_date: { userId, date } },
  })
}
