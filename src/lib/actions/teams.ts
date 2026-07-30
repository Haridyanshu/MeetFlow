"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createTeamSchema,
  inviteMemberSchema,
  updateTeamSchema,
  createInvitationSchema,
} from "@/lib/schemas/team"

export async function createTeam(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = createTeamSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const existing = await prisma.team.findUnique({
    where: { ownerId_slug: { ownerId: session.user.id, slug: parsed.data.slug } },
  })
  if (existing) {
    return { errors: { slug: ["A team with this slug already exists."] } }
  }

  await prisma.team.create({
    data: {
      ...parsed.data,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  })

  revalidatePath("/dashboard/teams")
}

export async function inviteMember(teamId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team || team.ownerId !== session.user.id) throw new Error("Forbidden")

  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = inviteMemberSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const invitedUser = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!invitedUser) {
    return { errors: { email: ["No user found with this email address."] } }
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: invitedUser.id } },
  })
  if (existingMember) {
    return { errors: { email: ["This user is already a team member."] } }
  }

  await prisma.teamMember.create({
    data: { teamId, userId: invitedUser.id, role: "MEMBER" },
  })

  revalidatePath(`/dashboard/teams/${teamId}`)
  return { ok: true }
}

export async function createInvitation(teamId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team || team.ownerId !== session.user.id) throw new Error("Forbidden")

  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = createInvitationSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const existingMember = await prisma.teamMember.findFirst({
    where: { teamId, user: { email: parsed.data.email } },
  })
  if (existingMember) {
    return { errors: { email: ["This user is already a team member."] } }
  }

  const existingInvitation = await prisma.teamInvitation.findFirst({
    where: { teamId, email: parsed.data.email, expiresAt: { gt: new Date() } },
  })
  if (existingInvitation) {
    return { errors: { email: ["An active invitation already exists for this email."] } }
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.teamInvitation.create({
    data: { teamId, email: parsed.data.email, token, expiresAt },
  })

  revalidatePath(`/dashboard/teams/${teamId}`)
  return { ok: true, token }
}

export async function acceptInvitation(token: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const invitation = await prisma.teamInvitation.findUnique({
    where: { token },
    include: { team: { select: { id: true, name: true } } },
  })

  if (!invitation) {
    return { ok: false, error: "invalid" as const }
  }

  if (invitation.expiresAt < new Date()) {
    return { ok: false, error: "expired" as const }
  }

  if (invitation.email !== session.user.email) {
    return { ok: false, error: "email_mismatch" as const }
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: invitation.teamId, userId: session.user.id } },
  })
  if (existingMember) {
    await prisma.teamInvitation.delete({ where: { id: invitation.id } })
    return { ok: false, error: "already_member" as const }
  }

  await prisma.teamMember.create({
    data: { teamId: invitation.teamId, userId: session.user.id, role: "MEMBER" },
  })

  await prisma.teamInvitation.delete({ where: { id: invitation.id } })

  revalidatePath("/dashboard/teams")
  revalidatePath(`/dashboard/teams/${invitation.teamId}`)
  return { ok: true, teamName: invitation.team.name }
}

export async function removeMember(teamId: string, memberId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team || team.ownerId !== session.user.id) throw new Error("Forbidden")

  const member = await prisma.teamMember.findUnique({ where: { id: memberId } })
  if (!member || member.userId === session.user.id) {
    return { errors: { id: ["Cannot remove the owner."] } }
  }

  await prisma.teamMember.delete({ where: { id: memberId } })

  revalidatePath(`/dashboard/teams/${teamId}`)
  return { ok: true }
}

export async function updateTeam(teamId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team || team.ownerId !== session.user.id) throw new Error("Forbidden")

  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = updateTeamSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  if (parsed.data.slug && parsed.data.slug !== team.slug) {
    const existing = await prisma.team.findUnique({
      where: { ownerId_slug: { ownerId: session.user.id, slug: parsed.data.slug } },
    })
    if (existing) {
      return { errors: { slug: ["This slug is already taken."] } }
    }
  }

  await prisma.team.update({ where: { id: teamId }, data: parsed.data })

  revalidatePath(`/dashboard/teams/${teamId}`)
  revalidatePath("/dashboard/teams")
  return { ok: true }
}

export async function deleteTeam(teamId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team || team.ownerId !== session.user.id) throw new Error("Forbidden")

  await prisma.team.delete({ where: { id: teamId } })

  revalidatePath("/dashboard/teams")
  return { ok: true }
}
