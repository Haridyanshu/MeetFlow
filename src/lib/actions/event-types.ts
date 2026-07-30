"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createEventTypeSchema,
  updateEventTypeSchema,
} from "@/lib/schemas/event-type"

export async function createEventType(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = createEventTypeSchema.safeParse({
    ...raw,
    duration: raw.duration ? Number(raw.duration) : undefined,
    bufferBefore: raw.bufferBefore ? Number(raw.bufferBefore) : undefined,
    bufferAfter: raw.bufferAfter ? Number(raw.bufferAfter) : undefined,
    minimumNotice: raw.minimumNotice ? Number(raw.minimumNotice) : undefined,
    maximumAdvanceDays: raw.maximumAdvanceDays ? Number(raw.maximumAdvanceDays) : undefined,
    maximumBookingsPerDay: raw.maximumBookingsPerDay ? Number(raw.maximumBookingsPerDay) : undefined,
    maximumBookingsPerWeek: raw.maximumBookingsPerWeek ? Number(raw.maximumBookingsPerWeek) : undefined,
    requiresConfirmation: raw.requiresConfirmation === "true" || raw.requiresConfirmation === "on",
    isPaid: raw.isPaid === "true",
    price: raw.price ? Number(raw.price) : undefined,
    currency: raw.currency || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  if (parsed.data.teamId) {
    const team = await prisma.team.findUnique({ where: { id: parsed.data.teamId } })
    if (!team || team.ownerId !== session.user.id) {
      return { errors: { teamId: ["Invalid team."] } }
    }
  }

  const existing = await prisma.eventType.findUnique({
    where: { userId_slug: { userId: session.user.id, slug: parsed.data.slug } },
  })

  if (existing) {
    return {
      errors: {
        slug: ["This slug is already taken. Please choose another one."],
      },
    }
  }

  await prisma.eventType.create({
    data: {
      ...parsed.data,
      schedulingType: parsed.data.schedulingType ?? "INDIVIDUAL",
      userId: session.user.id,
    },
  })

  revalidatePath("/dashboard/event-types")
}

export async function updateEventType(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const eventType = await prisma.eventType.findUnique({
    where: { id },
  })

  if (!eventType || eventType.userId !== session.user.id) {
    throw new Error("Not found")
  }

  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = updateEventTypeSchema.safeParse({
    ...raw,
    duration: raw.duration ? Number(raw.duration) : undefined,
    bufferBefore: raw.bufferBefore ? Number(raw.bufferBefore) : undefined,
    bufferAfter: raw.bufferAfter ? Number(raw.bufferAfter) : undefined,
    minimumNotice: raw.minimumNotice ? Number(raw.minimumNotice) : undefined,
    maximumAdvanceDays: raw.maximumAdvanceDays ? Number(raw.maximumAdvanceDays) : undefined,
    maximumBookingsPerDay: raw.maximumBookingsPerDay ? Number(raw.maximumBookingsPerDay) : undefined,
    maximumBookingsPerWeek: raw.maximumBookingsPerWeek ? Number(raw.maximumBookingsPerWeek) : undefined,
    requiresConfirmation: raw.requiresConfirmation === "true" || raw.requiresConfirmation === "on",
    isPaid: raw.isPaid === "true",
    price: raw.price ? Number(raw.price) : undefined,
    currency: raw.currency || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  if (parsed.data.teamId && parsed.data.teamId !== eventType.teamId) {
    const team = await prisma.team.findUnique({ where: { id: parsed.data.teamId } })
    if (!team || team.ownerId !== session.user.id) {
      return { errors: { teamId: ["Invalid team."] } }
    }
  }

  if (parsed.data.slug && parsed.data.slug !== eventType.slug) {
    const existing = await prisma.eventType.findUnique({
      where: {
        userId_slug: { userId: session.user.id, slug: parsed.data.slug },
      },
    })

    if (existing) {
      return {
        errors: {
          slug: ["This slug is already taken. Please choose another one."],
        },
      }
    }
  }

  await prisma.eventType.update({
    where: { id },
    data: parsed.data,
  })

  revalidatePath("/dashboard/event-types")
  revalidatePath("/dashboard")
}

export async function deleteEventType(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const eventType = await prisma.eventType.findUnique({
    where: { id },
  })

  if (!eventType || eventType.userId !== session.user.id) {
    throw new Error("Not found")
  }

  await prisma.eventType.delete({
    where: { id },
  })

  revalidatePath("/dashboard/event-types")
  revalidatePath("/dashboard")
}

export async function duplicateEventType(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const eventType = await prisma.eventType.findUnique({ where: { id } })
  if (!eventType || eventType.userId !== session.user.id) throw new Error("Not found")

  let slug = `${eventType.slug}-copy`
  let counter = 1
  while (await prisma.eventType.findUnique({ where: { userId_slug: { userId: session.user.id, slug } } })) {
    counter++
    slug = `${eventType.slug}-copy-${counter}`
  }

  await prisma.eventType.create({
    data: {
      title: `${eventType.title} (copy)`,
      slug,
      description: eventType.description,
      duration: eventType.duration,
      color: eventType.color,
      location: eventType.location,
      isActive: eventType.isActive,
      requiresConfirmation: eventType.requiresConfirmation,
      schedulingType: eventType.schedulingType,
      bufferBefore: eventType.bufferBefore,
      bufferAfter: eventType.bufferAfter,
      minimumNotice: eventType.minimumNotice,
      maximumAdvanceDays: eventType.maximumAdvanceDays,
      maximumBookingsPerDay: eventType.maximumBookingsPerDay,
      maximumBookingsPerWeek: eventType.maximumBookingsPerWeek,
      isPaid: eventType.isPaid,
      price: eventType.price,
      currency: eventType.currency,
      teamId: eventType.teamId,
      userId: session.user.id,
    },
  })

  revalidatePath("/dashboard/event-types")
  revalidatePath("/dashboard")
}

export async function toggleEventTypeActive(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const eventType = await prisma.eventType.findUnique({
    where: { id },
  })

  if (!eventType || eventType.userId !== session.user.id) {
    throw new Error("Not found")
  }

  await prisma.eventType.update({
    where: { id },
    data: { isActive: !eventType.isActive },
  })

  revalidatePath("/dashboard/event-types")
  revalidatePath("/dashboard")
}
