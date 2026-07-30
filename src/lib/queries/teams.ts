import "server-only"
import { prisma } from "@/lib/prisma"

export async function getTeamsByOwner(userId: string) {
  const teams = await prisma.team.findMany({
    where: { ownerId: userId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      eventTypes: { select: { id: true, schedulingType: true } },
      _count: { select: { eventTypes: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return teams.map(({ _count, eventTypes, ...rest }) => ({
    ...rest,
    eventTypeCount: _count.eventTypes,
    schedulingTypes: [...new Set(eventTypes.map((et) => et.schedulingType))],
  }))
}

export async function getTeamsByMember(userId: string) {
  const teams = await prisma.team.findMany({
    where: {
      members: { some: { userId } },
      NOT: { ownerId: userId },
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      eventTypes: { select: { id: true, schedulingType: true } },
      _count: { select: { eventTypes: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return teams.map(({ _count, eventTypes, ...rest }) => ({
    ...rest,
    eventTypeCount: _count.eventTypes,
    schedulingTypes: [...new Set(eventTypes.map((et) => et.schedulingType))],
  }))
}

export async function getTeamById(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      eventTypes: { select: { id: true, title: true, slug: true, duration: true, schedulingType: true, isActive: true } },
      invitations: { orderBy: { createdAt: "desc" } },
    },
  })
  if (!team) return null
  return {
    ...team,
    eventTypeCount: team.eventTypes.length,
    schedulingTypes: [...new Set(team.eventTypes.map((et) => et.schedulingType))],
  }
}

export async function getTeamBySlug(ownerId: string, slug: string) {
  const team = await prisma.team.findUnique({
    where: { ownerId_slug: { ownerId, slug } },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
    },
  })
  return team
}

export async function getTeamMembers(teamId: string) {
  return prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  })
}

export async function getTeamInvitationByToken(token: string) {
  return prisma.teamInvitation.findUnique({
    where: { token },
    include: { team: { select: { id: true, name: true } } },
  })
}
