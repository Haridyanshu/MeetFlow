import { z } from "zod"

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

const dayOfWeekSchema = z.number().int().min(0).max(6)

export const createAvailabilityIntervalSchema = z
  .object({
    dayOfWeek: dayOfWeekSchema,
    startTime: z.string().regex(timeRegex, "Invalid time format. Use HH:mm"),
    endTime: z.string().regex(timeRegex, "Invalid time format. Use HH:mm"),
    isEnabled: z.boolean().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })

export const updateAvailabilityIntervalSchema = z
  .object({
    dayOfWeek: dayOfWeekSchema.optional(),
    startTime: z
      .string()
      .regex(timeRegex, "Invalid time format. Use HH:mm")
      .optional(),
    endTime: z
      .string()
      .regex(timeRegex, "Invalid time format. Use HH:mm")
      .optional(),
    isEnabled: z.boolean().optional(),
  })
  .refine((data) => {
    if (data.startTime && data.endTime) {
      return data.endTime > data.startTime
    }
    return true
  }, {
    message: "End time must be after start time",
    path: ["endTime"],
  })

export const copyAvailabilityToDaysSchema = z.object({
  sourceDayOfWeek: dayOfWeekSchema,
  targetDaysOfWeek: z
    .array(dayOfWeekSchema)
    .min(1, "At least one target day is required"),
})

export const createDateOverrideSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
    isAvailable: z.boolean(),
    startTime: z
      .string()
      .regex(timeRegex, "Invalid time format. Use HH:mm")
      .optional(),
    endTime: z
      .string()
      .regex(timeRegex, "Invalid time format. Use HH:mm")
      .optional(),
  })
  .refine((data) => {
    if (data.startTime && data.endTime) {
      return data.endTime > data.startTime
    }
    return true
  }, {
    message: "End time must be after start time",
    path: ["endTime"],
  })

export const updateDateOverrideSchema = z
  .object({
    isAvailable: z.boolean().optional(),
    startTime: z
      .string()
      .regex(timeRegex, "Invalid time format. Use HH:mm")
      .nullable()
      .optional(),
    endTime: z
      .string()
      .regex(timeRegex, "Invalid time format. Use HH:mm")
      .nullable()
      .optional(),
  })
  .refine((data) => {
    const start = data.startTime
    const end = data.endTime

    const bothEmpty =
      (start === undefined || start === null) &&
      (end === undefined || end === null)

    if (bothEmpty) return true

    if (typeof start === "string" && typeof end === "string") {
      return end > start
    }

    return false
  }, {
    message: "Both start and end time must be provided or both cleared",
    path: ["endTime"],
  })

export type CreateAvailabilityIntervalInput = z.infer<
  typeof createAvailabilityIntervalSchema
>
export type UpdateAvailabilityIntervalInput = z.infer<
  typeof updateAvailabilityIntervalSchema
>
export type CopyAvailabilityToDaysInput = z.infer<
  typeof copyAvailabilityToDaysSchema
>
export type CreateDateOverrideInput = z.infer<typeof createDateOverrideSchema>
export type UpdateDateOverrideInput = z.infer<typeof updateDateOverrideSchema>
