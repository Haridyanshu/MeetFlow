import { z } from "zod"

export const createTeamSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
})

export const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>
