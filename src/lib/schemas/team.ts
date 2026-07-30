import { z } from "zod"

export const createTeamSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
})

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const updateTeamSchema = createTeamSchema.partial()

export const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>
