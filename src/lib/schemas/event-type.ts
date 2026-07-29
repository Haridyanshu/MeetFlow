import { z } from "zod"

export const createEventTypeSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration must be at most 480 minutes"),
  color: z.string().max(7, "Color must be 7 characters or less").optional(),
  location: z.string().max(200, "Location must be 200 characters or less").optional(),
  requiresConfirmation: z.boolean().optional(),
  bufferBefore: z
    .number()
    .int("Buffer must be a whole number")
    .min(0, "Buffer cannot be negative")
    .max(120, "Buffer must be at most 120 minutes")
    .optional(),
  bufferAfter: z
    .number()
    .int("Buffer must be a whole number")
    .min(0, "Buffer cannot be negative")
    .max(120, "Buffer must be at most 120 minutes")
    .optional(),
})

export const updateEventTypeSchema = createEventTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateEventTypeInput = z.infer<typeof createEventTypeSchema>
export type UpdateEventTypeInput = z.infer<typeof updateEventTypeSchema>
