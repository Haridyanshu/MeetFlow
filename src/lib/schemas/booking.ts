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

export const availableSlotsRequestSchema = z.object({
  eventTypeId: z.string().min(1, "Event type is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type AvailableSlotsRequestInput = z.infer<
  typeof availableSlotsRequestSchema
>
