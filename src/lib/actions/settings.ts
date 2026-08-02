"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isValidTimeZone, DEFAULT_TIMEZONE } from "@/lib/date"

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const name = formData.get("name") as string | null
  if (!name || name.trim().length === 0) {
    return { errors: { name: ["Name is required."] } }
  }
  if (name.length > 100) {
    return { errors: { name: ["Name must be 100 characters or less."] } }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  })

  revalidatePath("/dashboard/settings")
  return { ok: true }
}

export async function updateUserTimezone(timezone: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const resolved = isValidTimeZone(timezone) ? timezone : DEFAULT_TIMEZONE

  await prisma.user.update({
    where: { id: session.user.id },
    data: { timezone: resolved },
  })

  revalidatePath("/dashboard/settings")
  return { ok: true, timezone: resolved }
}
