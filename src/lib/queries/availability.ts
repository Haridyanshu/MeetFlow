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

export async function getDateOverrides(userId: string) {
  return prisma.dateOverride.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  })
}
