"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createAvailabilityIntervalSchema,
  updateAvailabilityIntervalSchema,
  copyAvailabilityToDaysSchema,
  createDateOverrideSchema,
  updateDateOverrideSchema,
} from "@/lib/schemas/availability"
import type {
  CreateAvailabilityIntervalInput,
  UpdateAvailabilityIntervalInput,
  CopyAvailabilityToDaysInput,
  CreateDateOverrideInput,
  UpdateDateOverrideInput,
} from "@/lib/schemas/availability"

export async function createAvailabilityInterval(
  data: CreateAvailabilityIntervalInput
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = createAvailabilityIntervalSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const weeklyAvailability = await prisma.weeklyAvailability.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  })

  const existing = await prisma.availabilityInterval.findMany({
    where: {
      weeklyAvailabilityId: weeklyAvailability.id,
      dayOfWeek: parsed.data.dayOfWeek,
    },
  })

  const hasOverlap = existing.some(
    (interval) =>
      parsed.data.startTime < interval.endTime &&
      parsed.data.endTime > interval.startTime
  )

  if (hasOverlap) {
    return {
      errors: {
        startTime: [
          "This interval overlaps with an existing interval on this day",
        ],
      },
    }
  }

  await prisma.availabilityInterval.create({
    data: {
      weeklyAvailabilityId: weeklyAvailability.id,
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      isEnabled: parsed.data.isEnabled ?? true,
    },
  })

  revalidatePath("/dashboard/availability")
}

export async function updateAvailabilityInterval(
  id: string,
  data: UpdateAvailabilityIntervalInput
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = updateAvailabilityIntervalSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const interval = await prisma.availabilityInterval.findUnique({
    where: { id },
    include: { weeklyAvailability: true },
  })

  if (!interval || interval.weeklyAvailability.userId !== session.user.id) {
    throw new Error("Not found")
  }

  if (parsed.data.startTime && parsed.data.endTime) {
    const dayOfWeek = parsed.data.dayOfWeek ?? interval.dayOfWeek

    const existing = await prisma.availabilityInterval.findMany({
      where: {
        weeklyAvailabilityId: interval.weeklyAvailabilityId,
        dayOfWeek,
        id: { not: id },
      },
    })

    const hasOverlap = existing.some(
      (other) =>
        parsed.data.startTime! < other.endTime &&
        parsed.data.endTime! > other.startTime
    )

    if (hasOverlap) {
      return {
        errors: {
          startTime: [
            "This interval overlaps with an existing interval on this day",
          ],
        },
      }
    }
  }

  await prisma.availabilityInterval.update({
    where: { id },
    data: {
      ...(parsed.data.dayOfWeek !== undefined && {
        dayOfWeek: parsed.data.dayOfWeek,
      }),
      ...(parsed.data.startTime !== undefined && {
        startTime: parsed.data.startTime,
      }),
      ...(parsed.data.endTime !== undefined && {
        endTime: parsed.data.endTime,
      }),
      ...(parsed.data.isEnabled !== undefined && {
        isEnabled: parsed.data.isEnabled,
      }),
    },
  })

  revalidatePath("/dashboard/availability")
}

export async function toggleAvailabilityInterval(id: string, enabled: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const interval = await prisma.availabilityInterval.findUnique({
    where: { id },
    include: { weeklyAvailability: true },
  })

  if (!interval || interval.weeklyAvailability.userId !== session.user.id) {
    throw new Error("Not found")
  }

  await prisma.availabilityInterval.update({
    where: { id },
    data: { isEnabled: enabled },
  })

  revalidatePath("/dashboard/availability")
}

export async function deleteAvailabilityInterval(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const interval = await prisma.availabilityInterval.findUnique({
    where: { id },
    include: { weeklyAvailability: true },
  })

  if (!interval || interval.weeklyAvailability.userId !== session.user.id) {
    throw new Error("Not found")
  }

  await prisma.availabilityInterval.delete({
    where: { id },
  })

  revalidatePath("/dashboard/availability")
}

export async function copyAvailabilityToDays(
  data: CopyAvailabilityToDaysInput
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = copyAvailabilityToDaysSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  if (parsed.data.targetDaysOfWeek.includes(parsed.data.sourceDayOfWeek)) {
    return {
      errors: {
        targetDaysOfWeek: [
          "Source day cannot be included in target days",
        ],
      },
    }
  }

  const weeklyAvailability = await prisma.weeklyAvailability.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  })

  const sourceIntervals = await prisma.availabilityInterval.findMany({
    where: {
      weeklyAvailabilityId: weeklyAvailability.id,
      dayOfWeek: parsed.data.sourceDayOfWeek,
    },
  })

  if (sourceIntervals.length === 0) {
    return {
      errors: {
        sourceDayOfWeek: [
          "No intervals found for the source day",
        ],
      },
    }
  }

  await prisma.$transaction(
    parsed.data.targetDaysOfWeek.flatMap((targetDay) => [
      prisma.availabilityInterval.deleteMany({
        where: {
          weeklyAvailabilityId: weeklyAvailability.id,
          dayOfWeek: targetDay,
        },
      }),
      ...sourceIntervals.map((interval) =>
        prisma.availabilityInterval.create({
          data: {
            weeklyAvailabilityId: weeklyAvailability.id,
            dayOfWeek: targetDay,
            startTime: interval.startTime,
            endTime: interval.endTime,
            isEnabled: interval.isEnabled,
          },
        })
      ),
    ])
  )

  revalidatePath("/dashboard/availability")
}

export async function createDateOverride(data: CreateDateOverrideInput) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = createDateOverrideSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const date = new Date(parsed.data.date + "T00:00:00.000Z")

  const existing = await prisma.dateOverride.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  })

  if (existing) {
    return {
      errors: {
        date: ["An override already exists for this date"],
      },
    }
  }

  await prisma.dateOverride.create({
    data: {
      userId: session.user.id,
      date,
      isAvailable: parsed.data.isAvailable,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
    },
  })

  revalidatePath("/dashboard/availability")
}

export async function updateDateOverride(
  id: string,
  data: UpdateDateOverrideInput
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const parsed = updateDateOverrideSchema.safeParse(data)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const override = await prisma.dateOverride.findUnique({
    where: { id },
  })

  if (!override || override.userId !== session.user.id) {
    throw new Error("Not found")
  }

  await prisma.dateOverride.update({
    where: { id },
    data: {
      ...(parsed.data.isAvailable !== undefined && {
        isAvailable: parsed.data.isAvailable,
      }),
      ...(parsed.data.startTime !== undefined && {
        startTime: parsed.data.startTime,
      }),
      ...(parsed.data.endTime !== undefined && {
        endTime: parsed.data.endTime,
      }),
    },
  })

  revalidatePath("/dashboard/availability")
}

export async function deleteDateOverride(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const override = await prisma.dateOverride.findUnique({
    where: { id },
  })

  if (!override || override.userId !== session.user.id) {
    throw new Error("Not found")
  }

  await prisma.dateOverride.delete({
    where: { id },
  })

  revalidatePath("/dashboard/availability")
}
