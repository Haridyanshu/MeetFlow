import "server-only"

import { prisma } from "@/lib/prisma"
import { resolveTimeZone } from "@/lib/date"

export async function getUserTimeZone(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  return resolveTimeZone(user?.timezone)
}
