import { z } from "zod"

export const createBookingSchema = z
  .object({
    eventTypeId: z.string().min(1, "Event type is required"),
    guestName: z
      .string()
      .min(1, "Name is required")
      .max(200, "Name must be 200 characters or less"),
    guestEmail: z.string().email("Invalid email address"),
    guestNotes: z
      .string()
      .max(1000, "Notes must be 1000 characters or less")
      .optional(),
    startTime: z.string().datetime({ message: "Invalid start time format" }),
    endTime: z.string().datetime({ message: "Invalid end time format" }),
    timezone: z.string().min(1, "Timezone is required"),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  })

export const cancelBookingSchema = z.object({
  id: z.string().min(1, "Booking ID is required"),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
