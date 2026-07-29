import "server-only"

import { prisma } from "@/lib/prisma"

export async function getEventTypesByUserId(userId: string) {
  return prisma.eventType.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getEventTypeById(id: string) {
  return prisma.eventType.findUnique({
    where: { id },
  })
}

export async function getEventTypeBySlug(userId: string, slug: string) {
  return prisma.eventType.findUnique({
    where: { userId_slug: { userId, slug } },
  })
}

export async function getActiveEventTypesByUserId(userId: string) {
  return prisma.eventType.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  })
}
