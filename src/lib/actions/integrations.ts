"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function disconnectGoogleCalendar() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await prisma.account.updateMany({
    where: { userId: session.user.id, provider: "google" },
    data: {
      access_token: null,
      refresh_token: null,
      expires_at: null,
      scope: null,
      id_token: null,
      token_type: null,
    },
  })
}
